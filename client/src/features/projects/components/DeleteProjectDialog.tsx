import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useDeleteProject } from '../api/queries';
import type { ProjectWithStats } from '../../../shared/types/api';

interface DeleteProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: ProjectWithStats | null;
}

export function DeleteProjectDialog({ open, onClose, project }: DeleteProjectDialogProps) {
  const deleteMutation = useDeleteProject();

  const handleDelete = async () => {
    if (!project) return;

    try {
      await deleteMutation.mutateAsync(project.id);
      onClose();
    } catch {
      // Error handling is done in the mutation hook
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" />
          <span>Delete Project</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be
          undone.
        </DialogContentText>
        {project.stats.totalTodos > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'error.lighter',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'error.light',
            }}
          >
            <Typography variant="body2" color="error.dark">
              This project contains {project.stats.totalTodos}{' '}
              {project.stats.totalTodos === 1 ? 'todo' : 'todos'}. All todos will be permanently
              deleted.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={deleteMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
