import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from './authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const status = useAuthStore((state) => state.status);
  const isManualLogout = useAuthStore((state) => state.isManualLogout);
  const location = useLocation();

  if (status === 'guest') {
    // Manual logout: always go to /login without redirect
    if (isManualLogout) {
      return <Navigate to="/login" replace />;
    }
    
    // Automatic redirect (expired session, unauthorized): preserve redirect
    const currentPath = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  return <>{children}</>;
}
