export const routes = {
  login: '/login',
  register: '/register',
  projects: '/projects',
  projectBacklog: (projectId: string) => `/projects/${projectId}/backlog`,
  projectBoard: (projectId: string) => `/projects/${projectId}/board`,
  projectSprints: (projectId: string) => `/projects/${projectId}/sprints`,
  sprintDetails: (projectId: string, sprintId: string) => `/projects/${projectId}/sprints/${sprintId}`,
} as const;
