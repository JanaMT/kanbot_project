import type { RouteObject } from 'react-router';
import { lazyPage } from '../../shared/lib/lazyPage';

// Lazy so each page ships in its own chunk.
const BacklogPage = lazyPage(() => import('./BacklogPage'), (m) => m.BacklogPage);

/** Backlog routes - rendered with ProtectedRoute wrapper */
export const backlogRoutes: RouteObject[] = [
  { path: '/projects/:projectId/backlog', Component: BacklogPage },
];
