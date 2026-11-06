import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sprintSchema, type SprintFormData } from '../validation/sprintSchema';
import { useCreateSprint, useUpdateSprint, getFieldErrors } from '../api/queries';
import { ApiError } from '../../../shared/api/client';
import type { Sprint, CreateSprintRequest } from '../../../shared/types/api';

interface SprintFormDialogProps {
  open: boolean;
  onClose: () => void;
  sprint?: Sprint | null;
  projectId: string;
  nextSprintNumber: number;
}

export function SprintFormDialog({
  open,
  onClose,
  sprint,
  projectId,
  nextSprintNumber,
}: SprintFormDialogProps) {
  const isEdit = !!sprint;
  const createMutation = useCreateSprint(projectId);
  const updateMutation = useUpdateSprint();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SprintFormData>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
    },
  });

  // Reset form when dialog opens or sprint changes
  useEffect(() => {
    if (open) {
      if (sprint) {
        reset({
          name: sprint.name,
          goal: sprint.goal || '',
          startDate: sprint.startDate || '',
          endDate: sprint.endDate || '',
        });
      } else {
        reset({
          name: `Sprint ${nextSprintNumber}`,
          goal: '',
          startDate: '',
          endDate: '',
        });
      }
    }
  }, [open, sprint, nextSprintNumber, reset]);

  const onSubmit = async (data: SprintFormData) => {
    try {
      const payload: CreateSprintRequest = {
        name: data.name,
        goal: data.goal || undefined,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };

      if (isEdit && sprint) {
        await updateMutation.mutateAsync({ sprintId: sprint.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = getFieldErrors(error);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof SprintFormData, { type: 'server', message });
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

  // Don't allow editing active or completed sprints
  const isEditable = !sprint || sprint.status === 'planned';

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {isEdit ? 'Edit Sprint' : 'Create Sprint'}
              <IconButton size="small" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              {/* Name */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    fullWidth
                    required
                    autoFocus
                    disabled={!isEditable}
                  />
                )}
              />

              {/* Goal */}
              <Controller
                name="goal"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Goal"
                    error={!!errors.goal}
                    helperText={errors.goal?.message || 'Optional sprint goal (max 300 characters)'}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={!isEditable}
                  />
                )}
              />

              {/* Dates Row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value || ''}
                      label="Start Date"
                      type="date"
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                      fullWidth
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                      disabled={!isEditable}
                    />
                  )}
                />

                <Controller
                  name="endDate"
                  control={control}
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value || ''}
                      label="End Date"
                      type="date"
                      error={!!errors.endDate}
                      helperText={errors.endDate?.message}
                      fullWidth
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                      disabled={!isEditable}
                    />
                  )}
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || (isEdit && !isDirty) || !isEditable}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Sprint'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Discard Changes Dialog */}
      <Dialog open={showDiscardDialog} onClose={() => setShowDiscardDialog(false)}>
        <DialogTitle>Discard changes?</DialogTitle>
        <DialogContent>You have unsaved changes. Discard them?</DialogContent>
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
