import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../authStore';

export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return () => {
    clearSession(true); // Mark as manual logout
    queryClient.clear();
    navigate('/login', { replace: true });
  };
}
