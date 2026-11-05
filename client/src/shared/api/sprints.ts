import { apiClient } from './client';
import type {
  Sprint,
  SprintListResponse,
  CreateSprintRequest,
  UpdateSprintRequest,
  StartSprintRequest,
  SprintBoardResponse,
  CompleteSprintRequest,
  SprintSummaryResponse,
} from '../types/api';

export async function getSprints(projectId: string): Promise<Sprint[]> {
  const response = await apiClient.get<SprintListResponse>(`/projects/${projectId}/sprints`);
  return response.data.sprints;
}

export async function getSprint(sprintId: string): Promise<Sprint> {
  const response = await apiClient.get<{ sprint: Sprint }>(`/sprints/${sprintId}`);
  return response.data.sprint;
}

export async function getSprintBoard(sprintId: string): Promise<SprintBoardResponse> {
  const response = await apiClient.get<SprintBoardResponse>(`/sprints/${sprintId}/todos`);
  return response.data;
}

export async function createSprint(
  projectId: string,
  data: CreateSprintRequest
): Promise<Sprint> {
  const response = await apiClient.post<{ sprint: Sprint }>(`/projects/${projectId}/sprints`, data);
  return response.data.sprint;
}

export async function updateSprint(
  sprintId: string,
  data: UpdateSprintRequest
): Promise<Sprint> {
  const response = await apiClient.patch<{ sprint: Sprint }>(`/sprints/${sprintId}`, data);
  return response.data.sprint;
}

export async function deleteSprint(sprintId: string): Promise<void> {
  await apiClient.delete(`/sprints/${sprintId}`);
}

export async function startSprint(
  sprintId: string,
  data: StartSprintRequest
): Promise<Sprint> {
  const response = await apiClient.post<{ sprint: Sprint }>(`/sprints/${sprintId}/start`, data);
  return response.data.sprint;
}

export async function completeSprint(
  sprintId: string,
  data: CompleteSprintRequest
): Promise<Sprint> {
  const response = await apiClient.post<{ sprint: Sprint }>(`/sprints/${sprintId}/complete`, data);
  return response.data.sprint;
}

export async function generateSprintSummary(sprintId: string): Promise<SprintSummaryResponse> {
  const response = await apiClient.post<SprintSummaryResponse>(`/sprints/${sprintId}/ai/summary`);
  return response.data;
}
