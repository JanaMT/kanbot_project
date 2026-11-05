import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MoveUpIcon from '@mui/icons-material/VerticalAlignTop';
import MoveDownIcon from '@mui/icons-material/VerticalAlignBottom';
import MoveIcon from '@mui/icons-material/DriveFileMove';
import type { Todo } from '../../../shared/types/api';
import { TodoRow } from './TodoRow';
import { useState, type MouseEvent } from 'react';

interface SortableTodoRowProps {
  todo: Todo;
  onClick: () => void;
  onMoveToTop?: () => void;
  onMoveToBottom?: () => void;
  onMoveClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  showMoveActions?: boolean;
}

export function SortableTodoRow({
  todo,
  onClick,
  onMoveToTop,
  onMoveToBottom,
  onMoveClick,
  showMoveActions = true,
}: SortableTodoRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  return (
    <>
      <Box
        ref={setNodeRef}
        style={style}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          position: 'relative',
        }}
      >
        {/* Drag Handle */}
        <Box
          {...attributes}
          {...listeners}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            color: 'text.secondary',
            flexShrink: 0,
            touchAction: 'none',
            '&:hover': {
              color: 'primary.main',
            },
            '&:focus': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
              borderRadius: 1,
            },
          }}
          tabIndex={0}
          role="button"
          aria-label="Drag to reorder"
        >
          <DragIndicatorIcon />
        </Box>

        {/* Todo Row */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <TodoRow
            todo={todo}
            onClick={onClick}
            onMoveClick={onMoveClick}
            showMoveButton={!!onMoveClick}
          />
        </Box>

        {/* Move Menu */}
        {showMoveActions && (
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ flexShrink: 0 }}
            aria-label="Move options"
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </Box>

      {/* Move Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {onMoveToTop && (
          <MenuItem onClick={() => handleAction(onMoveToTop)}>
            <ListItemIcon>
              <MoveUpIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Move to top</ListItemText>
          </MenuItem>
        )}
        {onMoveToBottom && (
          <MenuItem onClick={() => handleAction(onMoveToBottom)}>
            <ListItemIcon>
              <MoveDownIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Move to bottom</ListItemText>
          </MenuItem>
        )}
        {onMoveClick && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              const mockEvent = {
                stopPropagation: () => {},
                currentTarget: anchorEl,
              } as MouseEvent<HTMLButtonElement>;
              onMoveClick(mockEvent);
            }}
          >
            <ListItemIcon>
              <MoveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Move to sprint</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

