import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { Sprint } from '../../../shared/types/api';

interface CompleteSprintDialogProps {
  open: boolean;
  onClose: () => void;
  sprint: Sprint | null;
  onComplete: (moveUnfinishedTo: string) => void;
  isLoading?: boolean;
  plannedSprints: Sprint[];
}

export function CompleteSprintDialog({
  open,
  onClose,
  sprint,
  onComplete,
  isLoading = false,
  plannedSprints,
}: CompleteSprintDialogProps) {
  const [moveUnfinishedTo, setMoveUnfinishedTo] = useState<string>('backlog');

  if (!sprint) return null;

  const doneTodos = sprint.stats.doneTodos;
  const totalTodos = sprint.stats.totalTodos;
  const notDoneTodos = totalTodos - doneTodos;
  const donePoints = sprint.stats.donePoints;
  const totalPoints = sprint.stats.totalPoints;

  const handleComplete = () => {
    onComplete(moveUnfinishedTo);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete Sprint</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
          Complete <strong>{sprint.name}</strong>?
        </Typography>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: 'success.light',
              color: 'success.contrastText',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CheckCircleIcon />
            <Box>
              <Typography variant="h6">{doneTodos}</Typography>
              <Typography variant="caption">Done</Typography>
            </Box>
          </Box>

          {notDoneTodos > 0 && (
            <Box
              sx={{
                flex: 1,
                p: 2,
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <WarningAmberIcon />
              <Box>
                <Typography variant="h6">{notDoneTodos}</Typography>
                <Typography variant="caption">Not Done</Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {donePoints} of {totalPoints} story points completed
        </Typography>

        {/* Move unfinished todos */}
        {notDoneTodos > 0 && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              {notDoneTodos} unfinished {notDoneTodos === 1 ? 'todo' : 'todos'} will be moved
            </Alert>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Move unfinished todos to</InputLabel>
              <Select
                value={moveUnfinishedTo}
                onChange={(e) => setMoveUnfinishedTo(e.target.value)}
                label="Move unfinished todos to"
              >
                <MenuItem value="backlog">Backlog</MenuItem>
                {plannedSprints.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleComplete}
          variant="contained"
          disabled={isLoading}
          autoFocus
        >
          {isLoading ? 'Completing...' : 'Complete Sprint'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
