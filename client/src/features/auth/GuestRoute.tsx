import { Navigate } from 'react-router';
import { useAuthStore } from './authStore';

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const status = useAuthStore((state) => state.status);

  if (status === 'authenticated') {
    return <Navigate to="/projects" replace />;
  }

  return <>{children}</>;
}
