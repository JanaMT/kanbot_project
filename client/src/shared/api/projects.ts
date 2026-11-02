import { apiClient } from './client';
import type {
  ProjectWithStats,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/api';

export async function getProjects(): Promise<ProjectWithStats[]> {
  const response = await apiClient.get<{ projects: ProjectWithStats[] }>('/projects');
  return response.data.projects;
}

export async function getProject(projectId: string): Promise<ProjectWithStats> {
  const response = await apiClient.get<ProjectWithStats>(`/projects/${projectId}`);
  return response.data;
}

export async function createProject(data: CreateProjectRequest): Promise<ProjectWithStats> {
  const response = await apiClient.post<ProjectWithStats>('/projects', data);
  return response.data;
}

export async function updateProject(
  projectId: string,
  data: UpdateProjectRequest
): Promise<ProjectWithStats> {
  const response = await apiClient.patch<ProjectWithStats>(`/projects/${projectId}`, data);
  return response.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}
