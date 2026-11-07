# Kanbot Frontend

Kanbot is a React application for managing Agile projects, backlogs, Sprints and Kanban boards with AI-assisted Todo generation, Sprint planning and Sprint summaries.

## Running the Project

From the `client` directory:

```bash
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

The backend server must also be running for API requests and AI features to work.

## Main Libraries

- React and TypeScript
- Vite
- Material UI
- TanStack React Query
- Zustand
- Axios
- React Router
- React Hook Form and Zod
- dnd-kit
- react-markdown

## UI Library and Design Decisions

Material UI was selected as the UI library because it provides accessible and reusable components for dialogs, menus, forms, buttons, drawers and responsive layouts. It also provides a consistent theme system and reduces the need to create common UI behavior from scratch.

The application uses a Navy and Slate visual identity:

- Primary Navy: `#0F172A`
- Secondary Slate: `#64748B`

Navy was chosen as the primary color because it gives the application a professional and focused workspace feel, which fits a project-management product. Slate was selected as a supporting color because it creates a calm visual hierarchy for secondary text, borders and supporting controls without competing with the main content.

The interface supports Light and Dark modes. This improves comfort during long work sessions and allows users to choose the appearance that fits their environment. The selected theme is persisted locally so it remains consistent after a page refresh.

The layout prioritizes the main workflow: Backlog management and the Active Sprint Board. Sprint metadata and secondary actions are kept compact so the Board columns remain visible near the top of the page. On smaller screens, content wraps or uses controlled horizontal scrolling where a Kanban layout needs more space. This keeps the interface usable without causing unintended page overflow.

Labels use deterministic presentation colors to make them easier to scan quickly. The colors are derived from the label name, so the same label has a consistent appearance. Label colors are visual only and do not change the existing server API contract.

Subtle transitions are used for cards, dialogs, collapsible sections, progress indicators and interactive controls. These animations provide feedback without distracting from task management, and reduced-motion preferences are respected.

The project follows a feature-based architecture:

```text
src/
├── app/
├── features/
└── shared/
```

The dependency direction is:

```text
app → features → shared
```

This structure keeps each product feature organized while allowing shared API, layout, theme and utility code to be reused without coupling unrelated features.

## Implemented Requirements

### Authentication

- User registration and login
- Client-side form validation
- Protected and guest routes
- Persistent sessions
- Logout and expired-session handling

### Projects

- Create, edit and delete projects
- Project switching
- Project statistics and active Sprint information

### Backlog and Todos

- Backlog Todo list
- Quick Todo creation
- Todo details editing and deletion
- Search with debounce
- Filters by priority, type and label
- Drag-and-drop ordering
- Moving Todos between Backlog and Sprints
- Colored labels

### Sprints and Board

- Create, edit, delete and start planned Sprints
- Active Sprint Board with four columns
- Drag-and-drop status changes
- Optimistic updates
- Sprint progress indicators
- Complete Sprint flow
- Moving incomplete Todos to Backlog or another planned Sprint

### AI Features

- AI chat Drawer
- AI-generated Todo drafts
- AI Sprint planning
- Persisted AI Sprint summaries
- Markdown rendering
- Loading, error and retry states
- User confirmation before saving generated Todos or Sprint plans

## Additional Enhancements

- Light and Dark mode with persisted preference
- Responsive desktop, tablet and mobile layouts
- Colored labels with deterministic presentation colors
- Filtering Backlog Todos by label
- Subtle animations for cards
- Responsive Kanban Board with horizontal navigation on smaller screens

## Known Limitations

- AI features depend on the availability and rate limits of the configured AI provider.
- AI-generated content should be reviewed before saving.
- Label colors are presentation-only and are not stored separately on the server.

## Quality Checks

Run the following commands before submitting:

```bash
npm run build
npm run lint
```

Both commands should complete successfully.
