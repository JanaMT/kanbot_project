import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../../../shared/api/projects';
import type { CreateProjectRequest, UpdateProjectRequest } from '../../../shared/types/api';
import { ApiError, getFieldErrors } from '../../../shared/api/client';

// Centralized query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// Query hooks
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: getProjects,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  });
}

// Mutation hooks
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      enqueueSnackbar('Project created successfully', { variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        // Skip showing error for 401 - already handled by global interceptor
        if (error.status !== 401) {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Failed to create project', { variant: 'error' });
      }
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectRequest }) =>
      updateProject(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      enqueueSnackbar('Project updated successfully', { variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        // Skip showing error for 401 - already handled by global interceptor
        if (error.status !== 401) {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Failed to update project', { variant: 'error' });
      }
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      enqueueSnackbar('Project deleted successfully', { variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        // Skip showing error for 401 - already handled by global interceptor
        if (error.status !== 401) {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Failed to delete project', { variant: 'error' });
      }
    },
  });
}

// Helper to get field errors from API error
export { getFieldErrors };
