import { useState, useEffect, useMemo, useCallback, useRef, type MouseEvent } from 'react';
import { useParams } from 'react-router';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AddIcon from '@mui/icons-material/Add';
import { EmptyState } from '../../shared/components/EmptyState';
import { LoadingState } from '../../shared/components/LoadingState';
import { ErrorState } from '../../shared/components/ErrorState';
import { useTodos, useMoveTodo } from './api/queries';
import { TodoList } from './components/TodoList';
import { QuickCreateTodo } from './components/QuickCreateTodo';
import { TodoDetailsDialog } from './components/TodoDetailsDialog';
import { DeleteTodoDialog } from './components/DeleteTodoDialog';
import { TodoMoveMenu } from './components/TodoMoveMenu';
import { useSprints } from '../sprints/api/queries';
import { SprintSection } from '../sprints/components/SprintSection';
import { SprintFormDialog } from '../sprints/components/SprintFormDialog';
import { DeleteSprintDialog } from '../sprints/components/DeleteSprintDialog';
import { StartSprintDialog } from '../sprints/components/StartSprintDialog';
import { GenerateTodosDialog } from '../ai/components/GenerateTodosDialog';
import type { Todo, TodoPriority, TodoType, Sprint } from '../../shared/types/api';
import { TODO_PRIORITIES, TODO_TYPES } from '../../shared/types/api';

export function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moveMenuAnchor, setMoveMenuAnchor] = useState<HTMLElement | null>(null);
  const [todoToMove, setTodoToMove] = useState<Todo | null>(null);
  
  // Sprint dialogs
  const [sprintFormOpen, setSprintFormOpen] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);
  const [deleteSprintDialogOpen, setDeleteSprintDialogOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);
  const [startSprintDialogOpen, setStartSprintDialogOpen] = useState(false);
  const [sprintToStart, setSprintToStart] = useState<Sprint | null>(null);
  
  // AI dialog
  const [generateTodosOpen, setGenerateTodosOpen] = useState(false);
  
  // Ref for search input to maintain focus
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Ref for quick create input
  const quickCreateRef = useRef<{ focus: () => void }>(null);
  // Ref for backlog section
  const backlogSectionRef = useRef<HTMLDivElement>(null);

  // Search and filter state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | ''>('');
  const [typeFilter, setTypeFilter] = useState<TodoType | ''>('');

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build query parameters
  const query = useMemo(() => {
    const params: { sprintId: string; search?: string; priority?: TodoPriority; type?: TodoType } =
      {
        sprintId: 'backlog',
      };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    if (priorityFilter) {
      params.priority = priorityFilter;
    }
    if (typeFilter) {
      params.type = typeFilter;
    }

    return params;
  }, [debouncedSearch, priorityFilter, typeFilter]);

  const { data: todos, isLoading, isFetching, error, refetch } = useTodos(projectId || '', query);
  const { data: sprints = [] } = useSprints(projectId || '');
  const moveMutation = useMoveTodo();

  const hasActiveFilters = !!(debouncedSearch || priorityFilter || typeFilter);

  const totalStoryPoints = useMemo(() => {
    if (!todos) return 0;
    return todos.reduce((sum, todo) => sum + (todo.storyPoints || 0), 0);
  }, [todos]);

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedTodo(null);
  };

  const handleDeleteClick = () => {
    if (selectedTodo) {
      setTodoToDelete(selectedTodo);
      setDeleteDialogOpen(true);
      setDetailsOpen(false);
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setTodoToDelete(null);
  };

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setDebouncedSearch('');
    setPriorityFilter('');
    setTypeFilter('');
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
  }, []);

  const handleReorder = useCallback(
    (todoId: string, newPosition: number) => {
      if (hasActiveFilters) return;

      moveMutation.mutate({
        todoId,
        data: {
          sprintId: null, // Keep in backlog
          position: newPosition,
        },
      });
    },
    [hasActiveFilters, moveMutation]
  );

  const handleMoveClick = useCallback((todo: Todo, event: MouseEvent<HTMLButtonElement>) => {
    setTodoToMove(todo);
    setMoveMenuAnchor(event.currentTarget);
  }, []);

  const handleMoveMenuClose = useCallback(() => {
    setMoveMenuAnchor(null);
    setTodoToMove(null);
  }, []);

  const handleMoveToBacklog = useCallback(() => {
    if (!todoToMove) return;

    moveMutation.mutate(
      {
        todoId: todoToMove.id,
        data: {
          sprintId: null,
          position: 0,
        },
      },
      {
        onSuccess: () => {
          handleMoveMenuClose();
        },
      }
    );
  }, [todoToMove, moveMutation, handleMoveMenuClose]);

  const handleMoveToSprint = useCallback(
    (sprintId: string) => {
      if (!todoToMove) return;

      moveMutation.mutate(
        {
          todoId: todoToMove.id,
          data: {
            sprintId,
            position: 0,
          },
        },
        {
          onSuccess: () => {
            handleMoveMenuClose();
          },
        }
      );
    },
    [todoToMove, moveMutation, handleMoveMenuClose]
  );

  // Sprint handlers
  const handleCreateSprint = useCallback(() => {
    setSprintToEdit(null);
    setSprintFormOpen(true);
  }, []);

  const handleEditSprint = useCallback((sprint: Sprint) => {
    setSprintToEdit(sprint);
    setSprintFormOpen(true);
  }, []);

  const handleDeleteSprint = useCallback((sprint: Sprint) => {
    setSprintToDelete(sprint);
    setDeleteSprintDialogOpen(true);
  }, []);

  const handleStartSprint = useCallback((sprint: Sprint) => {
    setSprintToStart(sprint);
    setStartSprintDialogOpen(true);
  }, []);

  const handleJumpToBacklog = useCallback(() => {
    backlogSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleCreateTodoClick = useCallback(() => {
    quickCreateRef.current?.focus();
  }, []);

  const handleGenerateTodos = useCallback(() => {
    setGenerateTodosOpen(true);
  }, []);

  if (!projectId) {
    return (
      <ErrorState message="Project ID is missing" onRetry={() => window.location.reload()} />
    );
  }

  // Show loading state only on initial load (no data yet)
  if (isLoading && !todos) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message="Failed to load backlog" onRetry={refetch} />;
  }

  // Get planned sprints count
  const plannedSprints = sprints.filter((s) => s.status === 'planned');
  const hasPlannedSprints = plannedSprints.length > 0;
  const hasManyPlannedSprints = plannedSprints.length >= 2;

  // Only show empty state if no todos AND no planned sprints
  if (!todos || (todos.length === 0 && !hasActiveFilters && !hasPlannedSprints)) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <EmptyState
          icon={<FormatListBulletedIcon />}
          title="Your backlog is empty"
          description="Create your first todo or use AI to generate tasks"
          action={{
            label: 'Create todo',
            onClick: handleCreateTodoClick,
          }}
          secondaryAction={{
            label: 'Generate with AI',
            icon: <SmartToyIcon />,
            onClick: handleGenerateTodos,
          }}
        />
        <QuickCreateTodo ref={quickCreateRef} projectId={projectId} />
        
        {/* Generate Todos Dialog */}
        <GenerateTodosDialog
          open={generateTodosOpen}
          onClose={() => setGenerateTodosOpen(false)}
          projectId={projectId}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', position: 'relative', pb: 10 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.125rem' } }}
            >
              Backlog
            </Typography>
            {isFetching && <CircularProgress size={24} sx={{ mb: 1 }} />}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {todos.length} {todos.length === 1 ? 'todo' : 'todos'} · {totalStoryPoints} story
            points
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateSprint}
            sx={{ flexShrink: 0 }}
          >
            Create Sprint
          </Button>
          <Button
            variant="outlined"
            startIcon={<SmartToyIcon />}
            onClick={handleGenerateTodos}
            sx={{ flexShrink: 0 }}
          >
            Generate with AI
          </Button>
        </Box>
      </Box>

      {/* Planned Sprints */}
      {sprints
        .filter((s) => s.status === 'planned')
        .map((sprint) => (
          <SprintSection
            key={sprint.id}
            sprint={sprint}
            projectId={projectId}
            onEdit={() => handleEditSprint(sprint)}
            onDelete={() => handleDeleteSprint(sprint)}
            onStart={() => handleStartSprint(sprint)}
            onTodoClick={handleTodoClick}
            onMoveClick={handleMoveClick}
            hasActiveSprint={sprints.some((s) => s.status === 'active')}
          />
        ))}

      {/* Backlog Section */}
      {hasPlannedSprints && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box ref={backlogSectionRef} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Backlog
            </Typography>
            {hasManyPlannedSprints && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleCreateTodoClick}
                startIcon={<AddIcon />}
              >
                Quick Create
              </Button>
            )}
          </Box>
        </>
      )}

      {/* Search and Filters */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Search */}
        <TextField
          inputRef={searchInputRef}
          placeholder="Search todos..."
          size="small"
          value={searchInput}
          onChange={handleSearchChange}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: searchInput ? (
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : null,
            },
          }}
          sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 200 } }}
        />

        {/* Priority Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TodoPriority | '')}
            label="Priority"
          >
            <MenuItem value="">All</MenuItem>
            {TODO_PRIORITIES.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Type Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TodoType | '')}
            label="Type"
          >
            <MenuItem value="">All</MenuItem>
            {TODO_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Active filters:
          </Typography>
          {debouncedSearch && <Chip label={`Search: "${debouncedSearch}"`} size="small" />}
          {priorityFilter && (
            <Chip
              label={`Priority: ${priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}`}
              size="small"
            />
          )}
          {typeFilter && (
            <Chip
              label={`Type: ${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}`}
              size="small"
            />
          )}
          <Button size="small" onClick={handleClearFilters}>
            Clear all
          </Button>
        </Box>
      )}

      {/* Drag-and-drop disabled message when filters are active */}
      {hasActiveFilters && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Clear search and filters to reorder the backlog.
        </Alert>
      )}

      {/* Todo List */}
      {todos.length === 0 ? (
        hasActiveFilters ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No todos match your filters
            </Typography>
            <Button onClick={handleClearFilters} sx={{ mt: 2 }}>
              Clear filters
            </Button>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Your backlog is empty
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a todo below or move todos from sprints
            </Typography>
          </Box>
        )
      ) : (
        <TodoList
          todos={todos}
          onTodoClick={handleTodoClick}
          onReorder={handleReorder}
          onMoveClick={handleMoveClick}
          isDragDisabled={hasActiveFilters}
        />
      )}

      {/* Quick Create */}
      <QuickCreateTodo ref={quickCreateRef} projectId={projectId} />

      {/* Sticky Quick Create Bar (when many sprints) */}
      {hasManyPlannedSprints && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 2,
            mt: 2,
            boxShadow: 3,
            zIndex: 10,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={handleJumpToBacklog}
            startIcon={<FormatListBulletedIcon />}
          >
            Jump to Backlog
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleCreateTodoClick}
            startIcon={<AddIcon />}
          >
            Create Todo
          </Button>
        </Box>
      )}

      {/* Todo Details Dialog */}
      <TodoDetailsDialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        todo={selectedTodo}
        onDelete={handleDeleteClick}
        sprints={sprints.filter((s) => s.status !== 'completed')}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTodoDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        todo={todoToDelete}
      />

      {/* Move to Sprint Menu */}
      <TodoMoveMenu
        anchorEl={moveMenuAnchor}
        open={Boolean(moveMenuAnchor)}
        onClose={handleMoveMenuClose}
        onMoveToBacklog={handleMoveToBacklog}
        onMoveToSprint={handleMoveToSprint}
        sprints={sprints}
        currentSprintId={todoToMove?.sprintId || null}
      />

      {/* Sprint Form Dialog */}
      <SprintFormDialog
        open={sprintFormOpen}
        onClose={() => {
          setSprintFormOpen(false);
          setSprintToEdit(null);
        }}
        sprint={sprintToEdit}
        projectId={projectId}
        nextSprintNumber={sprints.length + 1}
      />

      {/* Delete Sprint Dialog */}
      <DeleteSprintDialog
        open={deleteSprintDialogOpen}
        onClose={() => {
          setDeleteSprintDialogOpen(false);
          setSprintToDelete(null);
        }}
        sprint={sprintToDelete}
        projectId={projectId}
      />

      {/* Start Sprint Dialog */}
      <StartSprintDialog
        open={startSprintDialogOpen}
        onClose={() => {
          setStartSprintDialogOpen(false);
          setSprintToStart(null);
        }}
        sprint={sprintToStart}
        projectId={projectId}
        hasActiveSprint={sprints.some((s) => s.status === 'active')}
      />

      {/* Generate Todos Dialog */}
      <GenerateTodosDialog
        open={generateTodosOpen}
        onClose={() => setGenerateTodosOpen(false)}
        projectId={projectId}
      />
    </Box>
  );
}
