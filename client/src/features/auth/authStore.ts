import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../shared/types/api';

type AuthStatus = 'checking' | 'authenticated' | 'guest';

interface AuthState {
  token: string | null;
  user: User | null;
  status: AuthStatus;
  isManualLogout: boolean;
  setSession: (token: string, user: User) => void;
  clearSession: (isManualLogout?: boolean) => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      status: 'checking',
      isManualLogout: false,
      setSession: (token, user) =>
        set({ token, user, status: 'authenticated', isManualLogout: false }),
      clearSession: (isManualLogout = false) =>
        set({ token: null, user: null, status: 'guest', isManualLogout }),
      setStatus: (status) => set({ status }),
    }),
    {
      name: 'kanbot-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
