import { createBrowserRouter, Navigate } from 'react-router';
import { GuestRouteWrapper, ProtectedRouteWrapper } from './components/RouteWrappers';
import { RootLayout } from './components/RootLayout';
import { authRoutes } from '../features/auth/routes';
import { projectsRoutes } from '../features/projects/routes';
import { backlogRoutes } from '../features/backlog/routes';
import { boardRoutes } from '../features/board/routes';
import { sprintsRoutes } from '../features/sprints/routes';
import { fallbackRoutes } from '../features/router/routes';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <GuestRouteWrapper />,
        children: authRoutes,
      },
      {
        path: '/',
        element: <Navigate to="/projects" replace />,
      },
      {
        element: <ProtectedRouteWrapper />,
        children: [
          ...projectsRoutes,
          { path: '/projects/:projectId', element: <Navigate to="backlog" replace /> },
          ...backlogRoutes,
          ...boardRoutes,
          ...sprintsRoutes,
        ],
      },
      ...fallbackRoutes,
    ],
  },
]);
