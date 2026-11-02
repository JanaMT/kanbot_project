import type { RouteObject } from 'react-router';
import { lazyPage } from '../../shared/lib/lazyPage';

// Lazy so each page ships in its own chunk.
const LoginPage = lazyPage(() => import('./LoginPage'), (m) => m.LoginPage);
const RegisterPage = lazyPage(() => import('./RegisterPage'), (m) => m.RegisterPage);

/** Auth routes - rendered with GuestRoute wrapper */
export const authRoutes: RouteObject[] = [
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
];
