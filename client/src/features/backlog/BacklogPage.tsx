import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Collapse,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { mockBacklogTodos, mockPlannedSprintTodos, mockSprints } from '../../shared/lib/mockData';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { TypeIcon } from '../../shared/components/TypeIcon';
import { useState } from 'react';
import type { Todo } from '../../shared/types/api';

export function BacklogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sprintExpanded, setSprintExpanded] = useState(true);

  const plannedSprint = mockSprints.find((s) => s.status === 'planned');
  const backlogCount = mockBacklogTodos.length;
  const backlogPoints = mockBacklogTodos.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  const renderTodoRow = (todo: Todo) => (
    <ListItem
      key={todo.id}
      disablePadding
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <ListItemButton sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <TypeIcon type={todo.type} />
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
              >
                {todo.key}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }} noWrap>
                {todo.title}
              </Typography>
            </Box>
            {todo.labels.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {todo.labels.map((label) => (
                  <Chip key={label} label={label} size="small" sx={{ height: 20 }} />
                ))}
              </Box>
            )}
          </Box>

          <PriorityBadge priority={todo.priority} />

          {todo.storyPoints && (
            <Chip
              label={`${todo.storyPoints} pts`}
              size="small"
              sx={{
                minWidth: 50,
                bgcolor: 'background.default',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
      </ListItemButton>
    </ListItem>
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Backlog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {backlogCount} todos · {backlogPoints} pts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Generate todos with AI
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Plan sprint with AI
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            Create sprint
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search todos..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              },
            }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="task">Task</MenuItem>
              <MenuItem value="story">Story</MenuItem>
              <MenuItem value="bug">Bug</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {plannedSprint && (
        <Paper sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: 'background.default',
              cursor: 'pointer',
            }}
            onClick={() => setSprintExpanded(!sprintExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton size="small">
                {sprintExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {plannedSprint.name} (planned)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mockPlannedSprintTodos.length} todos · {plannedSprint.stats.totalPoints} pts
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined">
                Edit
              </Button>
              <Button size="small" variant="contained">
                Start sprint
              </Button>
            </Box>
          </Box>
          <Collapse in={sprintExpanded}>
            <List disablePadding>
              {mockPlannedSprintTodos.map(renderTodoRow)}
            </List>
          </Collapse>
        </Paper>
      )}

      <Paper>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Backlog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {backlogCount} todos · {backlogPoints} pts
          </Typography>
        </Box>
        <List disablePadding>
          {mockBacklogTodos.map(renderTodoRow)}
        </List>
        <Box sx={{ p: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Type a title and press Enter"
            size="small"
            slotProps={{
              input: {
                startAdornment: <AddIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
