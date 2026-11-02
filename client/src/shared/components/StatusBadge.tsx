import { Chip } from '@mui/material';
import type { TodoStatus } from '../types/api';

interface StatusBadgeProps {
  status: TodoStatus;
  size?: 'small' | 'medium';
}

const statusLabels: Record<TodoStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

const statusColors: Record<TodoStatus, 'default' | 'primary' | 'secondary' | 'success'> = {
  todo: 'default',
  in_progress: 'primary',
  in_review: 'secondary',
  done: 'success',
};

export function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  return (
    <Chip
      label={statusLabels[status]}
      color={statusColors[status]}
      size={size}
      sx={{ fontWeight: 500 }}
    />
  );
}
