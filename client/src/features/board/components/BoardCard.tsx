import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriorityBadge } from '../../../shared/components/PriorityBadge';
import { TypeIcon } from '../../../shared/components/TypeIcon';
import type { Todo } from '../../../shared/types/api';

interface BoardCardProps {
  todo: Todo;
  onClick: () => void;
}

export function BoardCard({ todo, onClick }: BoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          transform: isDragging ? undefined : 'translateY(-2px)',
        },
        touchAction: 'none',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
          <TypeIcon type={todo.type} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: 'monospace' }}
          >
            {todo.key}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
          {todo.title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <PriorityBadge priority={todo.priority} />
          {todo.storyPoints && (
            <Chip
              label={`${todo.storyPoints} pts`}
              size="small"
              sx={{
                height: 24,
                bgcolor: 'background.default',
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        {todo.labels.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
            {todo.labels.slice(0, 3).map((label) => (
              <Chip key={label} label={label} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
            ))}
            {todo.labels.length > 3 && (
              <Chip label={`+${todo.labels.length - 3}`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
