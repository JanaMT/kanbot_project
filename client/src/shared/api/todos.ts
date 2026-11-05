import { apiClient } from './client';
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  MoveTodoRequest,
  TodoListResponse,
  TodoListQuery,
  BulkCreateTodosRequest,
  BulkCreateTodosResponse,
} from '../types/api';

export async function getTodos(
  projectId: string,
  query?: TodoListQuery
): Promise<Todo[]> {
  const params = new URLSearchParams();
  
  if (query?.sprintId) {
    params.append('sprintId', query.sprintId);
  }
  if (query?.search) {
    params.append('search', query.search);
  }
  if (query?.priority) {
    params.append('priority', query.priority);
  }
  if (query?.type) {
    params.append('type', query.type);
  }
  if (query?.status) {
    params.append('status', query.status);
  }

  const queryString = params.toString();
  const url = `/projects/${projectId}/todos${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<TodoListResponse>(url);
  return response.data.todos;
}

export async function getTodo(todoId: string): Promise<Todo> {
  const response = await apiClient.get<{ todo: Todo }>(`/todos/${todoId}`);
  return response.data.todo;
}

export async function createTodo(
  projectId: string,
  data: CreateTodoRequest
): Promise<Todo> {
  const response = await apiClient.post<{ todo: Todo }>(`/projects/${projectId}/todos`, data);
  return response.data.todo;
}

export async function updateTodo(todoId: string, data: UpdateTodoRequest): Promise<Todo> {
  const response = await apiClient.patch<{ todo: Todo }>(`/todos/${todoId}`, data);
  return response.data.todo;
}

export async function deleteTodo(todoId: string): Promise<void> {
  await apiClient.delete(`/todos/${todoId}`);
}

export async function moveTodo(todoId: string, data: MoveTodoRequest): Promise<Todo> {
  const response = await apiClient.post<{ todo: Todo }>(`/todos/${todoId}/move`, data);
  return response.data.todo;
}

export async function bulkCreateTodos(
  projectId: string,
  data: BulkCreateTodosRequest
): Promise<Todo[]> {
  const response = await apiClient.post<BulkCreateTodosResponse>(
    `/projects/${projectId}/todos/bulk`,
    data
  );
  return response.data.todos;
}
