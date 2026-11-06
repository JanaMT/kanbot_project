import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from './authStore';
import { me } from '../../shared/api/auth';
import { setAuthTokenGetter, setSessionExpiredHandler } from '../../shared/api/client';
import { useNavigate, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

interface AuthBootstrapProps {
  children: React.ReactNode;
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  const { status, clearSession } = useAuthStore();
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  // Setup auth token getter for API client
  useEffect(() => {
    setAuthTokenGetter(() => {
      // Always read from localStorage as the single source of truth
      // Do NOT fall back to Zustand in-memory state to ensure runtime changes are respected
      try {
        const stored = localStorage.getItem('kanbot-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.state?.token || null;
        }
      } catch {
        // If parsing fails, no token available
        return null;
      }
      return null;
    });
  }, []);

  // Setup session expired handler
  useEffect(() => {
    let hasShownExpiredMessage = false;

    setSessionExpiredHandler(() => {
      clearSession();
      queryClient.clear();
      
      // Only show message if not already shown
      if (!hasShownExpiredMessage) {
        hasShownExpiredMessage = true;
        enqueueSnackbar('Your session has expired. Please log in again.', {
          variant: 'warning',
          autoHideDuration: 5000,
        });
      }

      const currentPath = location.pathname + location.search;
      const isAuthPage = currentPath.startsWith('/login') || currentPath.startsWith('/register');
      
      if (!isAuthPage) {
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
      }
    });

    return () => {
      hasShownExpiredMessage = false;
    };
  }, [clearSession, queryClient, navigate, location, enqueueSnackbar]);

  // Bootstrap auth state on mount
  useEffect(() => {
    async function bootstrap() {
      const currentToken = useAuthStore.getState().token;
      const currentSetSession = useAuthStore.getState().setSession;
      const currentClearSession = useAuthStore.getState().clearSession;
      const currentSetStatus = useAuthStore.getState().setStatus;

      if (!currentToken) {
        currentSetStatus('guest');
        setIsBootstrapped(true);
        return;
      }

      try {
        const response = await me(true); // Mark as initial check
        currentSetSession(currentToken, response.user);
        setIsBootstrapped(true);
      } catch {
        // If initial check fails, clear session silently
        currentClearSession();
        setIsBootstrapped(true);
      }
    }

    bootstrap();
  }, []); // Only run once on mount

  if (!isBootstrapped || status === 'checking') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <img
            src="/brand/kanbot-icon.svg"
            alt="Kanbot"
            style={{ width: 64, height: 64 }}
          />
        </Box>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
