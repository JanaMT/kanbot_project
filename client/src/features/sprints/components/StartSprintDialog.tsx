import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startSprintSchema, type StartSprintFormData } from '../validation/sprintSchema';
import { useStartSprint, getFieldErrors } from '../api/queries';
import { ApiError } from '../../../shared/api/client';
import type { Sprint, StartSprintRequest } from '../../../shared/types/api';
import { useNavigate } from 'react-router';

interface StartSprintDialogProps {
  open: boolean;
  onClose: () => void;
  sprint: Sprint | null;
  projectId: string;
  hasActiveSprint: boolean;
}

export function StartSprintDialog({
  open,
  onClose,
  sprint,
  projectId,
  hasActiveSprint,
}: StartSprintDialogProps) {
  const navigate = useNavigate();
  const startMutation = useStartSprint(projectId);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StartSprintFormData>({
    resolver: zodResolver(startSprintSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
    },
  });

  // Set default values when dialog opens
  useEffect(() => {
    if (open && sprint) {
      const today = new Date().toISOString().split('T')[0];
      const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      reset({
        startDate: sprint.startDate || today,
        endDate: sprint.endDate || twoWeeksLater,
      });
    }
  }, [open, sprint, reset]);

  const onSubmit = async (data: StartSprintFormData) => {
    if (!sprint) return;

    try {
      const payload: StartSprintRequest = {
        startDate: data.startDate,
        endDate: data.endDate,
      };

      await startMutation.mutateAsync({ sprintId: sprint.id, data: payload });
      onClose();
      navigate(`/projects/${projectId}/board`);
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = getFieldErrors(error);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof StartSprintFormData, { type: 'server', message });
        });
      }
    }
  };

  if (!sprint) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Start Sprint
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body1">
              Start <strong>{sprint.name}</strong>
            </Typography>

            {sprint.goal && (
              <Typography variant="body2" color="text.secondary">
                Goal: {sprint.goal}
              </Typography>
            )}

            {hasActiveSprint && (
              <Alert severity="error">
                Another sprint is already active. Complete it before starting a new one.
              </Alert>
            )}

            {/* Dates Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Start Date"
                    type="date"
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                    fullWidth
                    required
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                    disabled={hasActiveSprint}
                  />
                )}
              />

              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="End Date"
                    type="date"
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
                    fullWidth
                    required
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                    disabled={hasActiveSprint}
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || hasActiveSprint}
          >
            {isSubmitting ? 'Starting...' : 'Start Sprint'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
