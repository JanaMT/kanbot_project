import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectFormData } from '../validation/projectSchema';
import { useCreateProject, useUpdateProject, getFieldErrors } from '../api/queries';
import { ApiError } from '../../../shared/api/client';
import type { ProjectWithStats } from '../../../shared/types/api';

interface ProjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  project?: ProjectWithStats | null;
}

export function ProjectFormDialog({ open, onClose, project }: ProjectFormDialogProps) {
  const isEdit = !!project;
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
    },
  });

  // Reset form when project changes
  useEffect(() => {
    if (open) {
      reset({
        name: project?.name || '',
        key: project?.key || '',
        description: project?.description || '',
      });
    }
  }, [open, project, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // The key is already normalized (trimmed and uppercased) by Zod transform
      // Clean up empty strings for optional fields
      const payload = {
        name: data.name,
        key: data.key && data.key.trim() ? data.key : undefined,
        description: data.description && data.description.trim() ? data.description : undefined,
      };

      if (isEdit && project) {
        await updateMutation.mutateAsync({ projectId: project.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onClose();
      reset();
    } catch (error) {
      // Handle field errors from API
      if (error instanceof ApiError) {
        const fieldErrors = getFieldErrors(error);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof ProjectFormData, { type: 'server', message });
        });
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Edit Project' : 'Create Project'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Project Name"
                  placeholder="e.g., Kanbot"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  required
                  autoFocus
                />
              )}
            />

            <Controller
              name="key"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Project Key"
                  placeholder="e.g., KAN"
                  error={!!errors.key}
                  helperText={
                    errors.key?.message ||
                    (isEdit
                      ? 'Changing the project key does not change the keys of existing tasks.'
                      : 'Optional. 2-6 uppercase letters. Auto-generated if empty.')
                  }
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      style: { textTransform: 'uppercase' },
                    },
                  }}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  placeholder="What is this project about?"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
