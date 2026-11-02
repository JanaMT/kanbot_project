import type { RouteObject } from 'react-router';
import { lazyPage } from '../../shared/lib/lazyPage';

// Lazy so each page ships in its own chunk.
const SprintsPage = lazyPage(() => import('./SprintsPage'), (m) => m.SprintsPage);
const SprintDetailsPage = lazyPage(() => import('./SprintDetailsPage'), (m) => m.SprintDetailsPage);

/** Sprints routes - rendered with ProtectedRoute wrapper */
export const sprintsRoutes: RouteObject[] = [
  { path: '/projects/:projectId/sprints', Component: SprintsPage },
  { path: '/projects/:projectId/sprints/:sprintId', Component: SprintDetailsPage },
];
