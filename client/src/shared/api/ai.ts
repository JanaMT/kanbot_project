import { apiClient } from './client';
import type {
  AiStatusResponse,
  ChatRequest,
  ChatResponse,
  GenerateTodosRequest,
  GenerateTodosResponse,
  PlanSprintRequest,
  PlanSprintResponse,
} from '../types/api';

export async function getAiStatus(): Promise<AiStatusResponse> {
  const response = await apiClient.get<AiStatusResponse>('/ai/status');
  return response.data;
}

export async function chat(projectId: string, data: ChatRequest): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>(
    `/projects/${projectId}/ai/chat`,
    data
  );
  return response.data;
}

export async function generateTodos(
  projectId: string,
  data: GenerateTodosRequest
): Promise<GenerateTodosResponse> {
  const response = await apiClient.post<GenerateTodosResponse>(
    `/projects/${projectId}/ai/generate-todos`,
    data
  );
  return response.data;
}

export async function planSprint(
  projectId: string,
  data: PlanSprintRequest
): Promise<PlanSprintResponse> {
  const response = await apiClient.post<PlanSprintResponse>(
    `/projects/${projectId}/ai/plan-sprint`,
    data
  );
  return response.data;
}
