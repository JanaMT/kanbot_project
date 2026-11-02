import { Outlet } from 'react-router';
import { AuthBootstrap } from '../../features/auth/AuthBootstrap';

export function RootLayout() {
  return (
    <AuthBootstrap>
      <Outlet />
    </AuthBootstrap>
  );
}
