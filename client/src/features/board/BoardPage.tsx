import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { mockBoardTodos, mockSprints } from '../../shared/lib/mockData';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { TypeIcon } from '../../shared/components/TypeIcon';
import { EmptyState } from '../../shared/components/EmptyState';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import type { TodoStatus } from '../../shared/types/api';

const statusColumns: { key: TodoStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'in_review', label: 'In Review' },
  { key: 'done', label: 'Done' },
];

export function BoardPage() {
  const activeSprint = mockSprints.find((s) => s.status === 'active');

  if (!activeSprint) {
    return (
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <EmptyState
          icon={<ViewKanbanIcon />}
          title="No active sprint"
          description="Start a sprint from the backlog to see the board"
          action={{
            label: 'Go to backlog',
            onClick: () => window.location.href = '/projects/proj-1/backlog',
          }}
        />
      </Box>
    );
  }

  const progress = (activeSprint.stats.donePoints / activeSprint.stats.totalPoints) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(activeSprint.endDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              {activeSprint.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {activeSprint.goal}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(activeSprint.startDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {new Date(activeSprint.endDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·{' '}
              {daysLeft} days left
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined">
              Summarize
            </Button>
            <Button variant="contained">
              Complete sprint
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {activeSprint.stats.donePoints} / {activeSprint.stats.totalPoints} pts done
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeSprint.stats.doneTodos} / {activeSprint.stats.totalTodos} todos
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: 'background.default',
            }}
          />
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {statusColumns.map((column) => {
          const todos = mockBoardTodos[column.key] || [];
          return (
            <Paper
              key={column.key}
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
                    {column.label}
                  </Typography>
                  <Chip
                    label={todos.length}
                    size="small"
                    sx={{ bgcolor: 'background.paper' }}
                  />
                </Box>

                <Box sx={{ p: 1.5, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {todos.map((todo) => (
                      <Card
                        key={todo.id}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 2,
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
                            <TypeIcon type={todo.type} />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontFamily: 'monospace' }}
                            >
                              {todo.key}
                            </Typography>
                          </Box>

                          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                            {todo.title}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <PriorityBadge priority={todo.priority} />
                            {todo.storyPoints && (
                              <Chip
                                label={`${todo.storyPoints} pts`}
                                size="small"
                                sx={{
                                  height: 24,
                                  bgcolor: 'background.default',
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </Box>

                          {todo.labels.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                              {todo.labels.map((label) => (
                                <Chip key={label} label={label} size="small" sx={{ height: 20 }} />
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
