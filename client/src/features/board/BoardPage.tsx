import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TypeIcon } from '../../shared/components/TypeIcon';
import { EmptyState } from '../../shared/components/EmptyState';
import { LoadingState } from '../../shared/components/LoadingState';
import { ErrorState } from '../../shared/components/ErrorState';
import { useSprintBoard, useSprints, useCompleteSprint, useGenerateSprintSummary } from '../sprints/api/queries';
import { useMoveBoardTodo } from './api/queries';
import { BoardCard } from './components/BoardCard';
import { TodoDetailsDialog } from '../backlog/components/TodoDetailsDialog';
import { CompleteSprintDialog } from '../sprints/components/CompleteSprintDialog';
import { SprintSummaryCard } from '../sprints/components/SprintSummaryCard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { Todo, TodoStatus } from '../../shared/types/api';

const statusColumns: { key: TodoStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'in_review', label: 'In Review' },
  { key: 'done', label: 'Done' },
];

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateDaysRemaining(endDate: string | null): number {
  if (!endDate) return 0;
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Droppable column component
function DroppableColumn({
  status,
  label,
  todos,
  onTodoClick,
}: {
  status: TodoStatus;
  label: string;
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        bgcolor: 'background.default',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '2px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Chip label={todos.length} size="small" sx={{ bgcolor: 'background.paper' }} />
      </Box>

      <Box sx={{ p: 1.5, flexGrow: 1 }}>
        <SortableContext
          items={todos.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              minHeight: 100,
            }}
          >
            {todos.map((todo) => (
              <BoardCard key={todo.id} todo={todo} onClick={() => onTodoClick(todo)} />
            ))}
          </Box>
        </SortableContext>
      </Box>
    </Paper>
  );
}

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const { data: sprints = [] } = useSprints(projectId || '');
  const activeSprint = sprints.find((s) => s.status === 'active');

  const {
    data: boardData,
    isLoading,
    error,
    refetch,
  } = useSprintBoard(activeSprint?.id || '');

  const moveMutation = useMoveBoardTodo();
  const completeMutation = useCompleteSprint(projectId || '');
  const generateSummaryMutation = useGenerateSprintSummary(activeSprint?.id || '');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback(() => {
    // Track drag over events for visual feedback if needed
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || !activeSprint || !boardData) return;

      const todoId = active.id as string;
      const targetId = over.id as string;

      // Find the dragged todo and its current status
      let sourceStatus: TodoStatus | null = null;
      for (const [status, todos] of Object.entries(boardData.columns)) {
        if (todos.some((t) => t.id === todoId)) {
          sourceStatus = status as TodoStatus;
          break;
        }
      }

      if (!sourceStatus) return;

      // Check if dropped directly on a column
      const targetColumn = statusColumns.find((col) => col.key === targetId);

      if (targetColumn) {
        // Dropped on a column container - add to the end
        const targetTodos = boardData.columns[targetColumn.key];
        
        // Only move if it's a different column or if reordering
        if (sourceStatus !== targetColumn.key || targetTodos.length > 1) {
          moveMutation.mutate({
            todoId,
            data: {
              status: targetColumn.key,
              position: targetTodos.length,
              sprintId: activeSprint.id,
            },
            sprintId: activeSprint.id,
          });
        }
      } else {
        // Dropped on another todo - find which column and position
        let targetStatus: TodoStatus | null = null;
        let targetPosition = 0;

        for (const [status, todos] of Object.entries(boardData.columns)) {
          const targetIndex = todos.findIndex((t) => t.id === targetId);
          if (targetIndex !== -1) {
            targetStatus = status as TodoStatus;
            targetPosition = targetIndex;
            break;
          }
        }

        if (targetStatus) {
          // Check if this is actually moving the card
          const isSameColumn = sourceStatus === targetStatus;
          const sourceTodos = boardData.columns[sourceStatus];
          const sourceIndex = sourceTodos.findIndex((t) => t.id === todoId);

          // Don't move if dropping on itself or in the exact same position
          if (todoId !== targetId && !(isSameColumn && sourceIndex === targetPosition)) {
            moveMutation.mutate({
              todoId,
              data: {
                status: targetStatus,
                position: targetPosition,
                sprintId: activeSprint.id,
              },
              sprintId: activeSprint.id,
            });
          }
        }
      }
    },
    [activeSprint, boardData, moveMutation]
  );

  const handleTodoClick = useCallback((todo: Todo) => {
    setSelectedTodo(todo);
    setDetailsOpen(true);
  }, []);

  const handleDetailsClose = useCallback(() => {
    setDetailsOpen(false);
    setSelectedTodo(null);
  }, []);

  const handleCompleteClick = () => {
    setMenuAnchor(null);
    setCompleteDialogOpen(true);
  };

  const handleGenerateSummary = async () => {
    setSummaryError(null);
    setMenuAnchor(null);
    try {
      await generateSummaryMutation.mutateAsync();
      // Clear error on success
      setSummaryError(null);
    } catch {
      setSummaryError('Failed to generate summary. Please try again.');
    }
  };

  const handleRetrySummary = () => {
    handleGenerateSummary();
  };

  const handleCompleteSprint = useCallback(
    (moveUnfinishedTo: string) => {
      if (!activeSprint) return;

      completeMutation.mutate(
        {
          sprintId: activeSprint.id,
          data: { moveUnfinishedTo },
        },
        {
          onSuccess: (completedSprint) => {
            setCompleteDialogOpen(false);
            // TODO: If generateSummary is true, call AI summary endpoint
            // For now, navigate to sprint details
            navigate(`/projects/${projectId}/sprints/${completedSprint.id}`);
          },
        }
      );
    },
    [activeSprint, completeMutation, navigate, projectId]
  );

  if (!projectId) {
    return <ErrorState message="Project ID is missing" onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message="Failed to load board" onRetry={refetch} />;
  }

  if (!activeSprint || !boardData) {
    return (
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <EmptyState
          icon={<ViewKanbanIcon />}
          title="No active sprint"
          description="Start a sprint from the backlog to see the board"
          action={{
            label: 'Go to backlog',
            onClick: () => navigate(`/projects/${projectId}/backlog`),
          }}
        />
      </Box>
    );
  }

  const { sprint, columns } = boardData;
  const progress =
    sprint.stats.totalPoints > 0
      ? (sprint.stats.donePoints / sprint.stats.totalPoints) * 100
      : 0;
  const daysLeft = calculateDaysRemaining(sprint.endDate);

  const activeTodo = activeId
    ? Object.values(columns)
        .flat()
        .find((t) => t.id === activeId)
    : null;

  const plannedSprints = sprints.filter((s) => s.status === 'planned');

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        {/* Sprint Header */}
        <Paper sx={{ p: 2, mb: 2, position: 'relative' }}>
          {/* Sprint Actions Menu - Top Right Corner */}
          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            size="small"
            aria-label="Sprint actions"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1,
            }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={handleCompleteClick}>
              <ListItemText>Complete Sprint</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={handleGenerateSummary}
              disabled={generateSummaryMutation.isPending}
            >
              <ListItemIcon>
                <AutoAwesomeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                {sprint.summary ? 'Regenerate Summary' : 'Generate Summary'}
              </ListItemText>
            </MenuItem>
          </Menu>

          {/* Row 1: Sprint name, status, goal */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
              mb: 1,
              flexWrap: 'wrap',
              pr: 5, // Space for actions menu
            }}
          >
            {/* Sprint name */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                maxWidth: { xs: '100%', sm: 200, md: 240 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {sprint.name}
            </Typography>

            {/* Status chip */}
            <Chip label="Active" size="small" color="primary" variant="outlined" />

            {/* Goal - visible in header */}
            {sprint.goal ? (
              <Tooltip title={sprint.goal} placement="top">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    flex: { xs: '1 1 100%', md: '0 1 auto' },
                    maxWidth: { md: 400 },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontStyle: 'Roboto',
                  }}
                >
                  Goal: {sprint.goal}
                </Typography>
              </Tooltip>
            ) : (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{
                  flex: { xs: '1 1 100%', md: '0 1 auto' },
                  fontStyle: 'italic',
                }}
              >
                No goal set
              </Typography>
            )}
          </Box>

          {/* Row 2: Dates and days remaining */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: { xs: 1.5, md: 2 },
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
              {daysLeft > 0 && ` • ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
              {daysLeft === 0 && ' • Last day'}
            </Typography>
          </Box>

          {/* Row 3: Progress (both metrics), AI Summary, and Complete Sprint */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: { xs: 'wrap', lg: 'nowrap' },
            }}
          >
            {/* Progress section - shows both story points and todos */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flex: { xs: '1 1 100%', lg: '1 1 auto' },
                minWidth: 0,
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
              }}
            >
              {/* Story points progress */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {sprint.stats.donePoints} / {sprint.stats.totalPoints} story points done
              </Typography>

              {/* Separator */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ flexShrink: 0, display: { xs: 'none', sm: 'inline' } }}
              >
                •
              </Typography>

              {/* Todo completion progress */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {sprint.stats.doneTodos} / {sprint.stats.totalTodos} todos completed
              </Typography>

              {/* Progress bar */}
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  flex: '1 1 auto',
                  minWidth: { xs: 100, sm: 120, md: 150 },
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'background.default',
                }}
              />
            </Box>

            {/* Action buttons section */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexShrink: 0,
                flex: { xs: '1 1 100%', sm: '0 0 auto' },
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                flexWrap: 'wrap',
              }}
            >
              {/* AI Summary Button */}
              {sprint.summary && (
                <Button
                  size="small"
                  startIcon={
                    generateSummaryMutation.isPending ? (
                      <CircularProgress size={16} />
                    ) : (
                      <AutoAwesomeIcon />
                    )
                  }
                  onClick={() => setSummaryExpanded(!summaryExpanded)}
                  disabled={generateSummaryMutation.isPending}
                  variant={summaryExpanded ? 'contained' : 'outlined'}
                  sx={{
                    minWidth: 140,
                    textTransform: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                    },
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: 2,
                      '@media (prefers-reduced-motion: reduce)': {
                        transform: 'none',
                      },
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  AI Summary
                </Button>
              )}

              {/* Complete Sprint Button */}
              <Button
                variant="contained"
                onClick={handleCompleteClick}
                size="small"
                sx={{
                  flexShrink: 0,
                  minWidth: 140,
                  textTransform: 'none',
                }}
              >
                Complete Sprint
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* AI Summary - show if expanded and exists/generating/error */}
        {summaryExpanded && (sprint.summary || generateSummaryMutation.isPending || summaryError) && (
          <SprintSummaryCard
            sprint={sprint}
            onGenerate={handleGenerateSummary}
            isGenerating={generateSummaryMutation.isPending}
            error={summaryError}
            onRetry={handleRetrySummary}
          />
        )}

        {/* Board Columns */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {statusColumns.map((column) => {
            const todos = columns[column.key] || [];
            return (
              <DroppableColumn
                key={column.key}
                status={column.key}
                label={column.label}
                todos={todos}
                onTodoClick={handleTodoClick}
              />
            );
          })}
        </Box>
      </Box>

      <DragOverlay>
        {activeTodo ? (
          <Card
            sx={{
              cursor: 'grabbing',
              boxShadow: 4,
              transform: 'rotate(3deg)',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
                <TypeIcon type={activeTodo.type} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace' }}
                >
                  {activeTodo.key}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {activeTodo.title}
              </Typography>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>

      {/* Todo Details Dialog */}
      <TodoDetailsDialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        todo={selectedTodo}
        onDelete={() => {
          // Don't allow delete from board
        }}
        sprints={sprints.filter((s) => s.status !== 'completed')}
      />

      {/* Complete Sprint Dialog */}
      <CompleteSprintDialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        sprint={activeSprint}
        onComplete={handleCompleteSprint}
        isLoading={completeMutation.isPending}
        plannedSprints={plannedSprints}
      />
    </DndContext>
  );
}
