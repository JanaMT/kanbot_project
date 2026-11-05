import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Checkbox,
  Stack,
  Paper,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlanSprint } from '../api/queries';
import { useCreateSprint } from '../../sprints/api/queries';
import { useTodos } from '../../backlog/api/queries';
import { planSprintSchema, type PlanSprintFormData } from '../validation/planSprintSchema';
import type { PlanSprintResponse, Todo } from '../../../shared/types/api';
import { ApiError } from '../../../shared/api/client';

interface PlanSprintDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  nextSprintNumber: number;
}

export function PlanSprintDialog({
  open,
  onClose,
  projectId,
  nextSprintNumber,
}: PlanSprintDialogProps) {
  const [plan, setPlan] = useState<PlanSprintResponse | null>(null);
  const [selectedTodoIds, setSelectedTodoIds] = useState<Set<string>>(new Set());
  const [goal, setGoal] = useState('');
  const [error, setError] = useState<string | null>(null);

  const planMutation = usePlanSprint(projectId);
  const createSprintMutation = useCreateSprint(projectId);

  // Fetch backlog todos to display details
  const { data: backlogTodos = [] } = useTodos(projectId, { sprintId: 'backlog' });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PlanSprintFormData>({
    resolver: zodResolver(planSprintSchema),
    defaultValues: {
      capacity: 13,
      focus: '',
    },
  });

  const handleClose = () => {
    // Reset state when closing
    setPlan(null);
    setSelectedTodoIds(new Set());
    setGoal('');
    setError(null);
    reset();
    onClose();
  };

  const handlePlan = async (data: PlanSprintFormData) => {
    setError(null);

    try {
      const response = await planMutation.mutateAsync({
        capacity: data.capacity,
        focus: data.focus || undefined,
      });

      setPlan(response);
      setGoal(response.goal);
      // Select all suggested todos by default
      setSelectedTodoIds(new Set(response.todoIds));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'RATE_LIMITED') {
          setError('Too many requests. Please wait a minute before trying again.');
        } else if (err.code === 'AI_ERROR') {
          setError(err.message || 'The AI encountered an error. Please try again in a moment.');
        } else {
          setError(err.message || 'Failed to generate plan. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    }
  };

  const handleRetry = () => {
    handleSubmit(handlePlan)();
  };

  const handleToggleTodo = (todoId: string) => {
    setSelectedTodoIds((prev) => {
      const next = new Set(prev);
      if (next.has(todoId)) {
        next.delete(todoId);
      } else {
        next.add(todoId);
      }
      return next;
    });
  };

  const handleCreateSprint = async () => {
    if (!plan || selectedTodoIds.size === 0) {
      return;
    }

    setError(null);

    try {
      await createSprintMutation.mutateAsync({
        name: `Sprint ${nextSprintNumber}`,
        goal: goal || plan.goal,
        todoIds: Array.from(selectedTodoIds),
      });

      // Close dialog on success
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to create sprint. Please try again.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    }
  };

  // Get suggested todos with full details
  const suggestedTodos = useMemo(() => {
    if (!plan) return [];
    
    const todoMap = new Map(backlogTodos.map((todo) => [todo.id, todo]));
    return plan.todoIds
      .map((id) => todoMap.get(id))
      .filter((todo): todo is Todo => todo !== undefined);
  }, [plan, backlogTodos]);

  // Calculate selected story points
  const selectedPoints = useMemo(() => {
    return suggestedTodos
      .filter((todo) => selectedTodoIds.has(todo.id))
      .reduce((sum, todo) => sum + (todo.storyPoints || 0), 0);
  }, [suggestedTodos, selectedTodoIds]);

  const capacity = control._formValues.capacity || 13;
  const exceedsCapacity = selectedPoints > capacity;
  const isPlanning = planMutation.isPending;
  const isCreating = createSprintMutation.isPending;
  const hasPlan = plan !== null;

  return (
    <Dialog
      open={open}
      onClose={isCreating || isPlanning ? undefined : handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="plan-sprint-dialog-title"
      aria-describedby="plan-sprint-dialog-description"
    >
      <DialogTitle id="plan-sprint-dialog-title">AI Sprint Planning</DialogTitle>

      <DialogContent dividers>
        {!hasPlan ? (
          // Planning form
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" id="plan-sprint-dialog-description">
              Let AI suggest which backlog todos to include in your next sprint based on your team's capacity and focus.
            </Typography>

            <Controller
              name="capacity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Capacity (story points)"
                  type="number"
                  error={!!errors.capacity}
                  helperText={errors.capacity?.message}
                  disabled={isPlanning}
                  fullWidth
                  required
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: 200,
                      step: 1,
                      'aria-label': 'Sprint capacity in story points',
                    },
                  }}
                />
              )}
            />

            <Controller
              name="focus"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Focus (optional)"
                  placeholder="e.g., User authentication, Bug fixes, etc."
                  multiline
                  rows={3}
                  error={!!errors.focus}
                  helperText={errors.focus?.message || 'Optional theme or goal for the sprint'}
                  disabled={isPlanning}
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      'aria-label': 'Sprint focus or theme',
                    },
                  }}
                />
              )}
            />

            {error && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={handleRetry}>
                    Try again
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {isPlanning && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing backlog...
                </Typography>
              </Box>
            )}
          </Stack>
        ) : (
          // Plan display
          <Stack spacing={3}>
            {/* AI Source Badge */}
            {plan.source && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={plan.source === 'mock' ? 'Mock AI' : 'AI Powered'}
                  size="small"
                  color={plan.source === 'mock' ? 'default' : 'primary'}
                  variant="outlined"
                />
              </Box>
            )}

            {/* Suggested Goal */}
            <TextField
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              label="Sprint Goal"
              multiline
              minRows={2}
              maxRows={4}
              fullWidth
              disabled={isCreating}
              helperText="Edit the AI-suggested goal for this sprint"
              slotProps={{
                htmlInput: {
                  'aria-label': 'Sprint goal',
                },
              }}
            />

            {/* Points Summary */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Selected points: {selectedPoints} / {capacity}
                </Typography>
                {exceedsCapacity && (
                  <Chip label="Over capacity" color="warning" size="small" />
                )}
              </Box>
            </Paper>

            {/* AI Reasoning */}
            {plan.reasoning && (
              <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} gutterBottom>
                  AI Reasoning:
                </Typography>
                <Typography variant="body2">{plan.reasoning}</Typography>
              </Alert>
            )}

            {/* Suggested Todos */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Suggested todos ({suggestedTodos.length}):
              </Typography>

              <Stack spacing={1.5} sx={{ mt: 1, pb: 2 }}>
                {suggestedTodos.length === 0 ? (
                  <Alert severity="warning">
                    No matching todos found in backlog. The suggested todos may have been moved or deleted.
                  </Alert>
                ) : (
                  suggestedTodos.map((todo) => (
                    <Paper
                      key={todo.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        bgcolor: selectedTodoIds.has(todo.id)
                          ? 'action.selected'
                          : 'background.paper',
                        transition: 'background-color 0.2s',
                        '@media (prefers-reduced-motion: reduce)': {
                          transition: 'none',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Checkbox
                          checked={selectedTodoIds.has(todo.id)}
                          onChange={() => handleToggleTodo(todo.id)}
                          disabled={isCreating}
                          aria-label={`Select ${todo.key}: ${todo.title}`}
                        />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1,
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, fontFamily: 'monospace' }}
                            >
                              {todo.key}
                            </Typography>
                            <Chip label={todo.type} size="small" />
                            <Chip label={todo.priority} size="small" color="default" />
                            {todo.storyPoints !== null && (
                              <Chip label={`${todo.storyPoints} pts`} size="small" variant="outlined" />
                            )}
                          </Box>
                          <Typography variant="body2">{todo.title}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))
                )}
              </Stack>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {isCreating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Creating sprint...
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!hasPlan ? (
          <>
            <Button onClick={handleClose} disabled={isPlanning}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handlePlan)}
              variant="contained"
              disabled={isPlanning}
            >
              Suggest plan
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSprint}
              variant="contained"
              disabled={selectedTodoIds.size === 0 || isCreating}
              aria-label={`Create sprint with ${selectedTodoIds.size} ${selectedTodoIds.size === 1 ? 'todo' : 'todos'}`}
            >
              Create sprint with {selectedTodoIds.size} {selectedTodoIds.size === 1 ? 'todo' : 'todos'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
