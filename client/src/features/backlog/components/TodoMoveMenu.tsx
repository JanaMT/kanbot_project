import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import BacklogIcon from '@mui/icons-material/Inbox';
import SprintIcon from '@mui/icons-material/EventNote';
import ActiveSprintIcon from '@mui/icons-material/PlayCircle';
import type { Sprint } from '../../../shared/types/api';

interface TodoMoveMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onMoveToBacklog: () => void;
  onMoveToSprint: (sprintId: string) => void;
  sprints: Sprint[];
  currentSprintId: string | null;
}

export function TodoMoveMenu({
  anchorEl,
  open,
  onClose,
  onMoveToBacklog,
  onMoveToSprint,
  sprints,
  currentSprintId,
}: TodoMoveMenuProps) {
  const plannedSprints = sprints.filter((s) => s.status === 'planned');
  const activeSprint = sprints.find((s) => s.status === 'active');

  const handleMove = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem
        onClick={() => handleMove(onMoveToBacklog)}
        disabled={currentSprintId === null}
      >
        <ListItemIcon>
          <BacklogIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Move to Backlog</ListItemText>
      </MenuItem>

      {activeSprint && (
        <>
          <Divider />
          <MenuItem
            onClick={() => handleMove(() => onMoveToSprint(activeSprint.id))}
            disabled={currentSprintId === activeSprint.id}
          >
            <ListItemIcon>
              <ActiveSprintIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">{activeSprint.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                Active Sprint
              </Typography>
            </ListItemText>
          </MenuItem>
        </>
      )}

      {plannedSprints.length > 0 && (
        <>
          <Divider />
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              Planned Sprints
            </Typography>
          </MenuItem>
          {plannedSprints.map((sprint) => (
            <MenuItem
              key={sprint.id}
              onClick={() => handleMove(() => onMoveToSprint(sprint.id))}
              disabled={currentSprintId === sprint.id}
            >
              <ListItemIcon>
                <SprintIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{sprint.name}</ListItemText>
            </MenuItem>
          ))}
        </>
      )}
    </Menu>
  );
}
