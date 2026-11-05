import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useDeleteSprint } from '../api/queries';
import type { Sprint } from '../../../shared/types/api';

interface DeleteSprintDialogProps {
  open: boolean;
  onClose: () => void;
  sprint: Sprint | null;
  projectId: string;
}

export function DeleteSprintDialog({
  open,
  onClose,
  sprint,
  projectId,
}: DeleteSprintDialogProps) {
  const deleteMutation = useDeleteSprint(projectId);

  const handleDelete = async () => {
    if (!sprint) return;

    try {
      await deleteMutation.mutateAsync(sprint.id);
      onClose();
    } catch {
      // Error handled by mutation hook
    }
  };

  if (!sprint) return null;

  const canDelete = sprint.status === 'planned';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Sprint?</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete <strong>{sprint.name}</strong>?
        </Typography>

        {canDelete && sprint.stats.totalTodos > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This sprint contains {sprint.stats.totalTodos}{' '}
            {sprint.stats.totalTodos === 1 ? 'todo' : 'todos'}. They will be moved back to the
            backlog.
          </Alert>
        )}

        {!canDelete && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Cannot delete {sprint.status} sprints. Only planned sprints can be deleted.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleteMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={deleteMutation.isPending || !canDelete}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Sprint'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
