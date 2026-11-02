import type { RouteObject } from 'react-router';
import { lazyPage } from '../../shared/lib/lazyPage';

// Lazy so each page ships in its own chunk.
const BoardPage = lazyPage(() => import('./BoardPage'), (m) => m.BoardPage);

/** Board routes - rendered with ProtectedRoute wrapper */
export const boardRoutes: RouteObject[] = [
  { path: '/projects/:projectId/board', Component: BoardPage },
];
