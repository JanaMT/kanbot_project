import { Box, Typography, Chip, IconButton } from '@mui/material';
import MoveIcon from '@mui/icons-material/DriveFileMove';
import type { Todo } from '../../../shared/types/api';
import { PriorityBadge } from '../../../shared/components/PriorityBadge';
import { TypeIcon } from '../../../shared/components/TypeIcon';
import { LabelChip } from '../../../shared/components/LabelChip';
import type { MouseEvent } from 'react';

interface TodoRowProps {
  todo: Todo;
  onClick: () => void;
  onMoveClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  showMoveButton?: boolean;
}

export function TodoRow({ todo, onClick, onMoveClick, showMoveButton = false }: TodoRowProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        minWidth: 0,
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1,
          '@media (prefers-reduced-motion: reduce)': {
            boxShadow: 'none',
          },
        },
      }}
    >
      {/* Type Icon */}
      <Box sx={{ flexShrink: 0 }}>
        <TypeIcon type={todo.type} />
      </Box>

      {/* Key */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          minWidth: { xs: 60, sm: 80 },
          flexShrink: 0,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
        }}
      >
        {todo.key}
      </Typography>

      {/* Title */}
      <Typography
        variant="body2"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: { xs: '0.875rem', sm: '0.875rem' },
        }}
      >
        {todo.title}
      </Typography>

      {/* Priority */}
      <Box sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
        <PriorityBadge priority={todo.priority} />
      </Box>

      {/* Story Points */}
      {todo.storyPoints !== null && (
        <Chip
          label={`${todo.storyPoints} pts`}
          size="small"
          variant="outlined"
          sx={{ flexShrink: 0, display: { xs: 'none', md: 'flex' } }}
        />
      )}

      {/* Labels */}
      {todo.labels && todo.labels.length > 0 && (
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 0.5, flexShrink: 0 }}>
          {todo.labels.slice(0, 2).map((label) => (
            <LabelChip key={label} label={label} />
          ))}
          {todo.labels.length > 2 && (
            <Chip label={`+${todo.labels.length - 2}`} size="small" variant="outlined" />
          )}
        </Box>
      )}

      {/* Move Button */}
      {showMoveButton && onMoveClick && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMoveClick(e);
          }}
          sx={{ flexShrink: 0 }}
          aria-label="Move to sprint"
        >
          <MoveIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
