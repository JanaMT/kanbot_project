import type { RouteObject } from 'react-router';
import { lazyPage } from '../../shared/lib/lazyPage';

// Lazy so each page ships in its own chunk.
const ProjectsPage = lazyPage(() => import('./ProjectsPage'), (m) => m.ProjectsPage);

/** Projects routes - rendered with ProtectedRoute wrapper */
export const projectsRoutes: RouteObject[] = [
  { path: '/projects', Component: ProjectsPage },
];
