import { Chip } from '@mui/material';
import type { TodoPriority } from '../types/api';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

interface PriorityBadgeProps {
  priority: TodoPriority;
  size?: 'small' | 'medium';
}

const priorityLabels: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const priorityColors: Record<TodoPriority, string> = {
  low: '#64748B',
  medium: '#3B82F6',
  high: '#F97316',
  urgent: '#DC2626',
};

export function PriorityBadge({ priority, size = 'small' }: PriorityBadgeProps) {
  const showIcon = priority === 'high' || priority === 'urgent';
  
  return (
    <Chip
      label={priorityLabels[priority]}
      size={size}
      icon={showIcon ? <ArrowUpwardIcon /> : undefined}
      sx={{
        backgroundColor: `${priorityColors[priority]}15`,
        color: priorityColors[priority],
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: priorityColors[priority],
        },
      }}
    />
  );
}
