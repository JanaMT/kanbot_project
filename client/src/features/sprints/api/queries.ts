import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  getSprints,
  getSprint,
  getSprintBoard,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint,
  generateSprintSummary,
} from '../../../shared/api/sprints';
import { ApiError } from '../../../shared/api/client';
import type {
  CreateSprintRequest,
  UpdateSprintRequest,
  StartSprintRequest,
  CompleteSprintRequest,
} from '../../../shared/types/api';
import { todoKeys } from '../../backlog/api/queries';

// Centralized query keys
export const sprintKeys = {
  all: ['sprints'] as const,
  lists: () => [...sprintKeys.all, 'list'] as const,
  list: (projectId: string) => [...sprintKeys.lists(), projectId] as const,
  details: () => [...sprintKeys.all, 'detail'] as const,
  detail: (id: string) => [...sprintKeys.details(), id] as const,
  boards: () => [...sprintKeys.all, 'board'] as const,
  board: (id: string) => [...sprintKeys.boards(), id] as const,
};

// Query hooks
export function useSprints(projectId: string) {
  return useQuery({
    queryKey: sprintKeys.list(projectId),
    queryFn: () => getSprints(projectId),
    enabled: !!projectId,
  });
}

export function useSprint(sprintId: string) {
  return useQuery({
    queryKey: sprintKeys.detail(sprintId),
    queryFn: () => getSprint(sprintId),
    enabled: !!sprintId,
  });
}

export function useSprintBoard(sprintId: string) {
  return useQuery({
    queryKey: sprintKeys.board(sprintId),
    queryFn: () => getSprintBoard(sprintId),
    enabled: !!sprintId,
  });
}

// Mutation hooks
export function useCreateSprint(projectId: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: CreateSprintRequest) => createSprint(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      enqueueSnackbar('Sprint created successfully', { variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Failed to create sprint', { variant: 'error' });
      }
    },
  });
}

export function useUpdateSprint() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ sprintId, data }: { sprintId: string; data: UpdateSprintRequest }) =>
      updateSprint(sprintId, data),
    onSuccess: (updatedSprint) => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sprintKeys.detail(updatedSprint.id) });
      enqueueSnackbar('Sprint updated successfully', { variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Failed to update sprint', { variant: 'error' });
      }
    },
  });
}

export function useDeleteSprint(projectId: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (sprintId: string) => deleteSprint(sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      enqueueSnackbar('Sprint deleted successfully. Todos returned to backlog.', {
        variant: 'success',
      });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Failed to delete sprint', { variant: 'error' });
      }
    },
  });
}

export function useStartSprint(projectId: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ sprintId, data }: { sprintId: string; data: StartSprintRequest }) =>
      startSprint(sprintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      enqueueSnackbar('Sprint started successfully', { variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.code === 'CONFLICT') {
          enqueueSnackbar('Another sprint is already active. Complete it first.', {
            variant: 'error',
          });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Failed to start sprint', { variant: 'error' });
      }
    },
  });
}

export function useCompleteSprint(projectId: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ sprintId, data }: { sprintId: string; data: CompleteSprintRequest }) =>
      completeSprint(sprintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      enqueueSnackbar('Sprint completed successfully', { variant: 'success' });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Failed to complete sprint', { variant: 'error' });
      }
    },
  });
}

export function useGenerateSprintSummary(sprintId: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: () => generateSprintSummary(sprintId),
    onSuccess: (data) => {
      // Update the sprint detail cache
      queryClient.setQueryData(sprintKeys.detail(sprintId), data.sprint);
      // Invalidate sprint lists to update any list views
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      // Invalidate board if this is for the active sprint
      queryClient.invalidateQueries({ queryKey: sprintKeys.board(sprintId) });
      enqueueSnackbar('Sprint summary generated successfully', { variant: 'success' });
    },
    onError: (error) => {
      // Don't show snackbar for AI errors - let the component handle user-facing messages
      // This prevents raw provider errors from appearing in global snackbar
      if (error instanceof ApiError) {
        if (error.code === 'AI_ERROR' || error.code === 'AI_UNAVAILABLE') {
          // Component will display a safe, user-friendly error message
          return;
        }
        if (error.code === 'RATE_LIMITED') {
          enqueueSnackbar('Too many requests. Please wait a minute before trying again.', {
            variant: 'error',
          });
        } else {
          // For non-AI errors, show the error
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      } else {
        // Network or unknown errors - let component handle
        // Component displays safe message, no raw error exposed
      }
    },
  });
}

// Helper to get field errors from API error
export { getFieldErrors } from '../../backlog/api/queries';
