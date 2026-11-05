import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useDeleteTodo } from '../api/queries';
import type { Todo } from '../../../shared/types/api';

interface DeleteTodoDialogProps {
  open: boolean;
  onClose: () => void;
  todo: Todo | null;
}

export function DeleteTodoDialog({ open, onClose, todo }: DeleteTodoDialogProps) {
  const deleteMutation = useDeleteTodo();

  const handleDelete = async () => {
    if (!todo) return;

    try {
      await deleteMutation.mutateAsync(todo.id);
      onClose();
    } catch {
      // Error handling is done in the mutation hook
    }
  };

  if (!todo) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" />
          <span>Delete Todo</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{todo.key}: {todo.title}</strong>? This action
          cannot be undone.
        </DialogContentText>
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
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Todo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
