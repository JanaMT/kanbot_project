import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Chip,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import MoveIcon from '@mui/icons-material/DriveFileMove';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { todoSchema, type TodoFormData } from '../validation/todoSchema';
import { useUpdateTodo, useMoveTodo, getFieldErrors } from '../api/queries';
import { ApiError } from '../../../shared/api/client';
import type { Todo, UpdateTodoRequest, Sprint } from '../../../shared/types/api';
import {
  TODO_TYPES,
  TODO_STATUSES,
  TODO_PRIORITIES,
  STORY_POINTS,
} from '../../../shared/types/api';

interface TodoDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  todo: Todo | null;
  onDelete: () => void;
  sprints: Sprint[];
}

export function TodoDetailsDialog({
  open,
  onClose,
  todo,
  onDelete,
  sprints,
}: TodoDetailsDialogProps) {
  const updateMutation = useUpdateTodo();
  const moveMutation = useMoveTodo();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [moveMenuAnchor, setMoveMenuAnchor] = useState<null | HTMLElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'task',
      status: 'todo',
      priority: 'medium',
      storyPoints: null,
      labels: [],
      dueDate: null,
      sprintId: null,
    },
  });

  // Reset form when todo changes
  useEffect(() => {
    if (open && todo) {
      reset({
        title: todo.title,
        description: todo.description || '',
        type: todo.type,
        status: todo.status,
        priority: todo.priority,
        storyPoints: todo.storyPoints,
        labels: todo.labels || [],
        dueDate: todo.dueDate || '',
        sprintId: todo.sprintId || 'backlog',
      });
    }
  }, [open, todo, reset]);

  const onSubmit = async (data: TodoFormData) => {
    if (!todo) return;

    try {
      const payload: UpdateTodoRequest = {
        title: data.title,
        description: data.description || undefined,
        type: data.type,
        status: data.status,
        priority: data.priority,
        storyPoints: data.storyPoints as 1 | 2 | 3 | 5 | 8 | 13 | null | undefined,
        labels: data.labels,
        dueDate: data.dueDate || null,
        sprintId: data.sprintId === 'backlog' ? null : data.sprintId,
      };

      await updateMutation.mutateAsync({ todoId: todo.id, data: payload });
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = getFieldErrors(error);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof TodoFormData, { type: 'server', message });
        });
      }
    }
  };

  const handleClose = () => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  };

  const handleDiscard = () => {
    setShowDiscardDialog(false);
    onClose();
  };

  const handleMoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMoveMenuAnchor(event.currentTarget);
  };

  const handleMoveMenuClose = () => {
    setMoveMenuAnchor(null);
  };

  const handleMoveToBacklog = () => {
    if (!todo) return;

    moveMutation.mutate(
      {
        todoId: todo.id,
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
  };

  const handleMoveToSprint = (sprintId: string) => {
    if (!todo) return;

    moveMutation.mutate(
      {
        todoId: todo.id,
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
  };

  if (!todo) return null;

  const activeSprint = sprints.find((s) => s.status === 'active');
  const plannedSprints = sprints.filter((s) => s.status === 'planned');

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">{todo.key}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={handleMoveClick}
                  color="primary"
                  title="Move to sprint"
                >
                  <MoveIcon />
                </IconButton>
                <IconButton size="small" onClick={onDelete} color="error">
                  <DeleteIcon />
                </IconButton>
                <IconButton size="small" onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              {/* Title */}
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    fullWidth
                    required
                    autoFocus
                  />
                )}
              />

              {/* Description */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />

              {/* Type, Status, Priority - Row 1 */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select {...field} label="Type">
                        {TODO_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        {TODO_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select {...field} label="Priority">
                        {TODO_PRIORITIES.map((priority) => (
                          <MenuItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>

              {/* Story Points, Due Date, Sprint - Row 2 */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                <Controller
                  name="storyPoints"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Story Points</InputLabel>
                      <Select
                        {...field}
                        value={field.value ?? ''}
                        label="Story Points"
                      >
                        <MenuItem value="">None</MenuItem>
                        {STORY_POINTS.map((points) => (
                          <MenuItem key={points} value={points}>
                            {points}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value || ''}
                      label="Due Date"
                      type="date"
                      error={!!errors.dueDate}
                      helperText={errors.dueDate?.message}
                      fullWidth
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  )}
                />

                <Controller
                  name="sprintId"
                  control={control}
                  render={({ field: { value, ...field } }) => (
                    <FormControl fullWidth>
                      <InputLabel>Sprint</InputLabel>
                      <Select {...field} value={value || 'backlog'} label="Sprint">
                        <MenuItem value="backlog">Backlog</MenuItem>
                        {sprints.map((sprint) => (
                          <MenuItem key={sprint.id} value={sprint.id}>
                            {sprint.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>

              {/* Labels */}
              <Controller
                name="labels"
                control={control}
                render={({ field: { value = [], onChange } }) => (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Labels
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {value.map((label, index) => (
                        <Chip
                          key={index}
                          label={label}
                          onDelete={() => {
                            const newLabels = value.filter((_, i) => i !== index);
                            onChange(newLabels);
                          }}
                          size="small"
                        />
                      ))}
                    </Box>
                    <TextField
                      size="small"
                      placeholder="Add label (press Enter)"
                      fullWidth
                      sx={{ mt: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const newLabel = input.value.trim();
                          if (newLabel && !value.includes(newLabel) && value.length < 10) {
                            onChange([...value, newLabel]);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    {errors.labels && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.labels.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Move Menu */}
      <Menu
        anchorEl={moveMenuAnchor}
        open={Boolean(moveMenuAnchor)}
        onClose={handleMoveMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleMoveToBacklog();
          }}
          disabled={todo.sprintId === null}
        >
          <ListItemIcon>
            <MoveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move to Backlog</ListItemText>
        </MenuItem>

        {activeSprint && (
          <>
            <Divider />
            <MenuItem
              onClick={() => handleMoveToSprint(activeSprint.id)}
              disabled={todo.sprintId === activeSprint.id}
            >
              <ListItemIcon>
                <MoveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2">{activeSprint.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Active Sprint
                </Typography>
              </ListItemText>
            </MenuItem>
          </>
        )}

        {plannedSprints.length > 0 && (
          <>
            <Divider />
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                Planned Sprints
              </Typography>
            </MenuItem>
            {plannedSprints.map((sprint) => (
              <MenuItem
                key={sprint.id}
                onClick={() => handleMoveToSprint(sprint.id)}
                disabled={todo.sprintId === sprint.id}
              >
                <ListItemIcon>
                  <MoveIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{sprint.name}</ListItemText>
              </MenuItem>
            ))}
          </>
        )}
      </Menu>

      {/* Discard Changes Dialog */}
      <Dialog open={showDiscardDialog} onClose={() => setShowDiscardDialog(false)}>
        <DialogTitle>Discard changes?</DialogTitle>
        <DialogContent>
          <Typography>You have unsaved changes. Are you sure you want to discard them?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDiscardDialog(false)}>Cancel</Button>
          <Button onClick={handleDiscard} color="error" variant="contained">
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
