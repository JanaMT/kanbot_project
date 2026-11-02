import type { RouteObject } from 'react-router';
import { lazyPage } from '../../shared/lib/lazyPage';

// Lazy so each page ships in its own chunk.
const NotFoundPage = lazyPage(() => import('./NotFoundPage'), (m) => m.NotFoundPage);

/** Fallback route for unmatched paths */
export const fallbackRoutes: RouteObject[] = [
  { path: '*', Component: NotFoundPage },
];
