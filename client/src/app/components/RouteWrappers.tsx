import { Outlet } from 'react-router';
import { GuestRoute } from '../../features/auth/GuestRoute';
import { ProtectedRoute } from '../../features/auth/ProtectedRoute';
import { AppShell } from '../../shared/layout/AppShell';

export function GuestRouteWrapper() {
  return (
    <GuestRoute>
      <Outlet />
    </GuestRoute>
  );
}

export function ProtectedRouteWrapper() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  );
}
