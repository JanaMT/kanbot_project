import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { moveTodo } from '../../../shared/api/todos';
import type { MoveTodoRequest, Todo, TodoStatus, SprintBoardResponse } from '../../../shared/types/api';
import { ApiError } from '../../../shared/api/client';
import { sprintKeys } from '../../sprints/api/queries';
import { todoKeys } from '../../backlog/api/queries';

interface MoveBoardTodoParams {
  todoId: string;
  data: MoveTodoRequest;
  sprintId: string;
}

export function useMoveBoardTodo() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ todoId, data }: MoveBoardTodoParams) => moveTodo(todoId, data),
    onMutate: async ({ todoId, data, sprintId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: sprintKeys.board(sprintId) });

      // Snapshot the previous board state
      const previousBoard = queryClient.getQueryData<SprintBoardResponse>(
        sprintKeys.board(sprintId)
      );

      if (!previousBoard) return { previousBoard: null };

      // Optimistically update the board
      queryClient.setQueryData<SprintBoardResponse>(
        sprintKeys.board(sprintId),
        (old) => {
          if (!old) return old;

          // Find the todo and its current status
          let movedTodo: Todo | null = null;
          let sourceStatus: TodoStatus | null = null;

          for (const [status, todos] of Object.entries(old.columns)) {
            const todo = todos.find((t) => t.id === todoId);
            if (todo) {
              movedTodo = todo;
              sourceStatus = status as TodoStatus;
              break;
            }
          }

          if (!movedTodo || !sourceStatus) return old;

          const targetStatus = data.status || sourceStatus;

          // Create new columns object
          const newColumns = { ...old.columns };

          // Remove from source column
          newColumns[sourceStatus] = newColumns[sourceStatus].filter((t) => t.id !== todoId);

          // Update todo status
          const updatedTodo = {
            ...movedTodo,
            status: targetStatus,
            order: data.position,
          };

          // Add to target column at the specified position
          const targetColumn = [...newColumns[targetStatus]];
          targetColumn.splice(data.position, 0, updatedTodo);

          // Recalculate orders in the target column
          newColumns[targetStatus] = targetColumn.map((t, index) => ({
            ...t,
            order: index,
          }));

          return {
            ...old,
            columns: newColumns,
          };
        }
      );

      return { previousBoard };
    },
    onError: (error, { sprintId }, context) => {
      // Roll back to the previous board state
      if (context?.previousBoard) {
        queryClient.setQueryData(sprintKeys.board(sprintId), context.previousBoard);
      }

      if (error instanceof ApiError) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Failed to move todo', { variant: 'error' });
      }
    },
    onSuccess: (_, { sprintId }) => {
      // Refetch board and sprint to update stats
      queryClient.invalidateQueries({ queryKey: sprintKeys.board(sprintId) });
      queryClient.invalidateQueries({ queryKey: sprintKeys.detail(sprintId) });
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}
