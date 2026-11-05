import { useQuery, useMutation } from '@tanstack/react-query';
import { getAiStatus, chat, generateTodos, planSprint } from '../../../shared/api/ai';
import type { ChatRequest, GenerateTodosRequest, PlanSprintRequest } from '../../../shared/types/api';

// Centralized query keys
export const aiKeys = {
  all: ['ai'] as const,
  status: () => [...aiKeys.all, 'status'] as const,
};

// Query hooks
export function useAiStatus() {
  return useQuery({
    queryKey: aiKeys.status(),
    queryFn: getAiStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes - AI mode doesn't change often
    retry: 1,
  });
}

// Mutation hooks
export function useChat(projectId: string) {
  return useMutation({
    mutationFn: (data: ChatRequest) => chat(projectId, data),
  });
}

export function useGenerateTodos(projectId: string) {
  return useMutation({
    mutationFn: (data: GenerateTodosRequest) => generateTodos(projectId, data),
  });
}

export function usePlanSprint(projectId: string) {
  return useMutation({
    mutationFn: (data: PlanSprintRequest) => planSprint(projectId, data),
  });
}
