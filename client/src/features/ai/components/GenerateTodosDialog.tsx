import { useState } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Paper,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGenerateTodos } from '../api/queries';
import { useBulkCreateTodos } from '../../backlog/api/queries';
import { generateTodosSchema, type GenerateTodosFormData } from '../validation/generateTodosSchema';
import type {
  DraftTodo,
  TodoType,
  TodoPriority,
  StoryPoints,
  CreateTodoRequest,
} from '../../../shared/types/api';
import { TODO_TYPES, TODO_PRIORITIES, STORY_POINTS } from '../../../shared/types/api';
import { ApiError } from '../../../shared/api/client';

interface GenerateTodosDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

interface EditableDraftTodo extends DraftTodo {
  selected: boolean;
  clientId: string; // Stable client-side ID for React keys
}

export function GenerateTodosDialog({ open, onClose, projectId }: GenerateTodosDialogProps) {
  const [drafts, setDrafts] = useState<EditableDraftTodo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMutation = useGenerateTodos(projectId);
  const bulkCreateMutation = useBulkCreateTodos(projectId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GenerateTodosFormData>({
    resolver: zodResolver(generateTodosSchema),
    defaultValues: {
      prompt: '',
      count: 5,
    },
  });

  const handleClose = () => {
    // Reset state when closing
    setDrafts([]);
    setError(null);
    setIsGenerating(false);
    reset();
    onClose();
  };

  const handleGenerate = async (data: GenerateTodosFormData) => {
    setError(null);
    setIsGenerating(true);

    try {
      const response = await generateMutation.mutateAsync(data);
      
      // Mark all drafts as selected by default and add stable client IDs
      const editableDrafts: EditableDraftTodo[] = response.todos.map((todo, index) => ({
        ...todo,
        selected: true,
        clientId: `draft-${Date.now()}-${index}`, // Stable unique ID
      }));
      
      setDrafts(editableDrafts);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'RATE_LIMITED') {
          setError(
            'Too many requests. Please wait a minute before trying again.'
          );
        } else if (err.code === 'AI_ERROR') {
          setError(
            err.message || 'The AI encountered an error. Please try again in a moment.'
          );
        } else {
          setError(err.message || 'Failed to generate todos. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    handleSubmit(handleGenerate)();
  };

  const handleToggleSelection = (clientId: string) => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.clientId === clientId ? { ...draft, selected: !draft.selected } : draft
      )
    );
  };

  const handleUpdateDraft = (
    clientId: string,
    field: keyof DraftTodo,
    value: string | TodoType | TodoPriority | StoryPoints | null
  ) => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.clientId === clientId ? { ...draft, [field]: value } : draft
      )
    );
  };

  const handleSave = async () => {
    const selectedDrafts = drafts.filter((d) => d.selected);
    
    if (selectedDrafts.length === 0) {
      return;
    }

    setError(null);

    try {
      // Convert DraftTodo to CreateTodoRequest
      const todos: CreateTodoRequest[] = selectedDrafts.map((draft) => ({
        title: draft.title,
        description: draft.description,
        type: draft.type,
        priority: draft.priority,
        storyPoints: draft.storyPoints,
        status: 'todo', // Default status
        sprintId: null, // Add to backlog
      }));

      await bulkCreateMutation.mutateAsync({ todos });
      
      // Close dialog on success
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to save todos. Please try again.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    }
  };

  const selectedCount = drafts.filter((d) => d.selected).length;
  const isSaving = bulkCreateMutation.isPending;
  const hasGenerated = drafts.length > 0;

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="generate-todos-dialog-title"
      aria-describedby="generate-todos-dialog-description"
    >
      <DialogTitle id="generate-todos-dialog-title">
        Generate Todos with AI
      </DialogTitle>

      <DialogContent dividers>
        {!hasGenerated ? (
          // Generation form
          <Box
            component="form"
            onSubmit={handleSubmit(handleGenerate)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <Controller
              name="prompt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Feature description"
                  placeholder="Describe a feature…"
                  multiline
                  rows={4}
                  error={!!errors.prompt}
                  helperText={errors.prompt?.message}
                  disabled={isGenerating}
                  fullWidth
                  required
                  slotProps={{
                    htmlInput: {
                      'aria-label': 'Feature description',
                    },
                  }}
                />
              )}
            />

            <Controller
              name="count"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth disabled={isGenerating}>
                  <InputLabel id="count-label">Number of todos</InputLabel>
                  <Select
                    {...field}
                    labelId="count-label"
                    label="Number of todos"
                    error={!!errors.count}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.count && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.count.message}
                    </Typography>
                  )}
                </FormControl>
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

            {isGenerating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Generating todos...
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          // Draft todos list
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" id="generate-todos-dialog-description">
                Review and edit the generated todos. Select which ones to add to your backlog.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ pb: 2 }}>
              {drafts.map((draft) => (
                <Paper
                  key={draft.clientId}
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: draft.selected ? 'action.selected' : 'background.paper',
                    transition: 'background-color 0.2s',
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                    },
                  }}
                >
                  <Stack spacing={2}>
                    {/* Title row with checkbox */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Checkbox
                        checked={draft.selected}
                        onChange={() => handleToggleSelection(draft.clientId)}
                        disabled={isSaving}
                        aria-label={`Select todo: ${draft.title}`}
                        sx={{ mt: 0.5 }}
                      />
                      <TextField
                        value={draft.title}
                        onChange={(e) => handleUpdateDraft(draft.clientId, 'title', e.target.value)}
                        label="Title"
                        fullWidth
                        disabled={isSaving}
                        size="small"
                        required
                        slotProps={{
                          htmlInput: {
                            'aria-label': 'Todo title',
                          },
                        }}
                      />
                    </Box>

                    {/* Description */}
                    <Box sx={{ pl: 5 }}>
                      <TextField
                        value={draft.description}
                        onChange={(e) => handleUpdateDraft(draft.clientId, 'description', e.target.value)}
                        label="Description"
                        multiline
                        minRows={2}
                        maxRows={6}
                        fullWidth
                        disabled={isSaving}
                        size="small"
                        slotProps={{
                          htmlInput: {
                            'aria-label': 'Todo description',
                          },
                        }}
                      />
                    </Box>

                    {/* Type, Priority, Story Points */}
                    <Box
                      sx={{
                        pl: 5,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 2, sm: 1.5 },
                        flexWrap: 'wrap',
                      }}
                    >
                      <FormControl
                        size="small"
                        sx={{ minWidth: { xs: '100%', sm: 140 } }}
                        disabled={isSaving}
                      >
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={draft.type}
                          onChange={(e) =>
                            handleUpdateDraft(draft.clientId, 'type', e.target.value as TodoType)
                          }
                          label="Type"
                        >
                          {TODO_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl
                        size="small"
                        sx={{ minWidth: { xs: '100%', sm: 140 } }}
                        disabled={isSaving}
                      >
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={draft.priority}
                          onChange={(e) =>
                            handleUpdateDraft(draft.clientId, 'priority', e.target.value as TodoPriority)
                          }
                          label="Priority"
                        >
                          {TODO_PRIORITIES.map((priority) => (
                            <MenuItem key={priority} value={priority}>
                              {priority}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl
                        size="small"
                        sx={{ minWidth: { xs: '100%', sm: 140 } }}
                        disabled={isSaving}
                      >
                        <InputLabel>Story Points</InputLabel>
                        <Select
                          value={draft.storyPoints === null ? '' : String(draft.storyPoints)}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (typeof value === 'string') {
                              if (value === '') {
                                handleUpdateDraft(draft.clientId, 'storyPoints', null);
                              } else {
                                handleUpdateDraft(draft.clientId, 'storyPoints', Number(value) as StoryPoints);
                              }
                            }
                          }}
                          label="Story Points"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {STORY_POINTS.map((points) => (
                            <MenuItem key={points} value={String(points)}>
                              {points}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {isSaving && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Saving todos...
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!hasGenerated ? (
          <>
            <Button onClick={handleClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handleGenerate)}
              variant="contained"
              disabled={isGenerating}
            >
              Generate
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={selectedCount === 0 || isSaving}
              aria-label={`Add ${selectedCount} ${selectedCount === 1 ? 'todo' : 'todos'} to backlog`}
            >
              Add {selectedCount} to backlog
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
