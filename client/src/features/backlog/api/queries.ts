import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  moveTodo,
  bulkCreateTodos,
} from '../../../shared/api/todos';
import type {
  CreateTodoRequest,
  UpdateTodoRequest,
  MoveTodoRequest,
  TodoListQuery,
  Todo,
  BulkCreateTodosRequest,
} from '../../../shared/types/api';
import { ApiError, getFieldErrors } from '../../../shared/api/client';
import { sprintKeys } from '../../sprints/api/queries';

// Centralized query keys
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (projectId: string, query?: TodoListQuery) =>
    [...todoKeys.lists(), projectId, query] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};

// Query hooks
export function useTodos(projectId: string, query?: TodoListQuery) {
  return useQuery({
    queryKey: todoKeys.list(projectId, query),
    queryFn: () => getTodos(projectId, query),
    enabled: !!projectId,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useTodo(todoId: string) {
  return useQuery({
    queryKey: todoKeys.detail(todoId),
    queryFn: () => getTodo(todoId),
    enabled: !!todoId,
  });
}

// Mutation hooks
export function useCreateTodo(projectId: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => createTodo(projectId, data),
    onSuccess: () => {
      // Invalidate all todo lists for this project
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      enqueueSnackbar('Todo created successfully', { variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status !== 401) {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Failed to create todo', { variant: 'error' });
      }
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ todoId, data }: { todoId: string; data: UpdateTodoRequest }) =>
      updateTodo(todoId, data),
    onSuccess: (updatedTodo) => {
      // Update the specific todo in cache immediately with server response
      queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo);
      
      // Update the todo in all list caches
      queryClient.setQueriesData<Todo[]>(
        { queryKey: todoKeys.lists() },
        (oldTodos) => {
          if (!oldTodos) return oldTodos;
          return oldTodos.map((todo) =>
            todo.id === updatedTodo.id ? updatedTodo : todo
          );
        }
      );
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(updatedTodo.id) });
      // Invalidate board queries since the todo might be on the board
      queryClient.invalidateQueries({ queryKey: sprintKeys.boards() });
      // Invalidate sprint details to update stats
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      enqueueSnackbar('Todo updated successfully', { variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status !== 401) {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Failed to update todo', { variant: 'error' });
      }
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (todoId: string) => deleteTodo(todoId),
    onSuccess: () => {
      // Invalidate all todo lists
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      enqueueSnackbar('Todo deleted successfully', { variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status !== 401) {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Failed to delete todo', { variant: 'error' });
      }
    },
  });
}

export function useMoveTodo() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ todoId, data }: { todoId: string; data: MoveTodoRequest }) =>
      moveTodo(todoId, data),
    onMutate: async ({ todoId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueriesData({ queryKey: todoKeys.lists() });

      // Optimistically update to the new position
      queryClient.setQueriesData<Todo[]>(
        { queryKey: todoKeys.lists() },
        (old) => {
          if (!old) return old;

          // Find the todo being moved
          const todo = old.find((t) => t.id === todoId);
          if (!todo) return old;

          // Remove the todo from the list
          const filtered = old.filter((t) => t.id !== todoId);

          // Filter by target sprint
          const targetList = filtered.filter((t) => {
            if (data.sprintId === undefined) {
              // No sprint change, keep current sprint filter
              return t.sprintId === todo.sprintId;
            }
            // Moving to a new sprint
            return t.sprintId === data.sprintId;
          });

          // Insert at the new position
          const newTodo = {
            ...todo,
            sprintId: data.sprintId !== undefined ? data.sprintId : todo.sprintId,
            status: data.status || todo.status,
            order: data.position,
          };

          targetList.splice(data.position, 0, newTodo);

          // Recalculate order for all todos in target list
          const reordered = targetList.map((t, index) => ({
            ...t,
            order: index,
          }));

          // Merge with todos from other sprints
          const otherTodos = filtered.filter((t) => {
            if (data.sprintId === undefined) {
              return t.sprintId !== todo.sprintId;
            }
            return t.sprintId !== data.sprintId;
          });

          return [...reordered, ...otherTodos].sort((a, b) => a.order - b.order);
        }
      );

      return { previousTodos };
    },
    onError: (error, _, context) => {
      // Roll back to the previous value
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (error instanceof ApiError) {
        if (error.status !== 401) {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Failed to move todo', { variant: 'error' });
      }
    },
    onSettled: () => {
      // Refetch to ensure we're in sync with the server
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      // Invalidate sprint queries because sprint stats (todo count, points) may have changed
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      // Invalidate sprint details to update individual sprint stats
      queryClient.invalidateQueries({ queryKey: sprintKeys.details() });
      // Invalidate board queries to update the active sprint board immediately
      queryClient.invalidateQueries({ queryKey: sprintKeys.boards() });
      // Invalidate project queries to update backlog counts in project stats
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useBulkCreateTodos(projectId: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: BulkCreateTodosRequest) => bulkCreateTodos(projectId, data),
    onSuccess: (todos) => {
      // Invalidate all todo lists to refresh the backlog
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      // Invalidate sprint queries to update stats (backlog count)
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      // Invalidate project queries to update backlog counts
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      const count = todos.length;
      enqueueSnackbar(
        `${count} ${count === 1 ? 'todo' : 'todos'} added to backlog`,
        { variant: 'success' }
      );
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status !== 401) {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Failed to create todos', { variant: 'error' });
      }
    },
  });
}

// Helper to get field errors from API error
export { getFieldErrors };
