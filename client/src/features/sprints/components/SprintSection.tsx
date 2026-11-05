import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTodos } from '../../backlog/api/queries';
import { TodoList } from '../../backlog/components/TodoList';
import type { Sprint, Todo } from '../../../shared/types/api';
import type { MouseEvent } from 'react';

interface SprintSectionProps {
  sprint: Sprint;
  projectId: string;
  onEdit: () => void;
  onDelete: () => void;
  onStart: () => void;
  onTodoClick: (todo: Todo) => void;
  onMoveClick: (todo: Todo, event: MouseEvent<HTMLButtonElement>) => void;
  hasActiveSprint: boolean;
}

export function SprintSection({
  sprint,
  projectId,
  onEdit,
  onDelete,
  onStart,
  onTodoClick,
  onMoveClick,
  hasActiveSprint,
}: SprintSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: todos = [], isLoading } = useTodos(projectId, { sprintId: sprint.id });

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    handleMenuClose();
    action();
  };

  const statusColors: Record<Sprint['status'], 'success' | 'primary' | 'default'> = {
    active: 'success',
    planned: 'primary',
    completed: 'default',
  };

  const canEdit = sprint.status === 'planned';
  const canDelete = sprint.status === 'planned';
  const canStart = sprint.status === 'planned' && !hasActiveSprint;

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Paper
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'background.default',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <IconButton
          size="small"
          sx={{
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          }}
        >
          <ExpandMoreIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {sprint.name}
            </Typography>
            <Chip label={sprint.status} color={statusColors[sprint.status]} size="small" />
          </Box>

          {sprint.goal && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {sprint.goal}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {(sprint.startDate || sprint.endDate) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(sprint.startDate) || '?'} – {formatDate(sprint.endDate) || '?'}
                </Typography>
              </Box>
            )}

            <Typography variant="caption" color="text.secondary">
              {sprint.stats.totalTodos} {sprint.stats.totalTodos === 1 ? 'todo' : 'todos'}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {sprint.stats.totalPoints} pts
            </Typography>
          </Box>
        </Box>

        {canStart && (
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            disabled={hasActiveSprint}
          >
            Start Sprint
          </Button>
        )}

        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{ flexShrink: 0 }}
          aria-label="Sprint actions"
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {canEdit && (
          <MenuItem onClick={() => handleAction(onEdit)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Sprint</ListItemText>
          </MenuItem>
        )}
        {canStart && (
          <MenuItem onClick={() => handleAction(onStart)} disabled={hasActiveSprint}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Start Sprint</ListItemText>
          </MenuItem>
        )}
        {(canEdit || canStart) && canDelete && <Divider />}
        {canDelete && (
          <MenuItem onClick={() => handleAction(onDelete)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Sprint</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Collapsible Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : todos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No todos in this sprint yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Move todos from the backlog to add them
              </Typography>
            </Box>
          ) : (
            <TodoList
              todos={todos}
              onTodoClick={onTodoClick}
              onMoveClick={onMoveClick}
              isDragDisabled={true}
            />
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
