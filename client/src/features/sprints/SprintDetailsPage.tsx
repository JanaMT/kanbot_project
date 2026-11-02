import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router';
import { mockSprints } from '../../shared/lib/mockData';
import ReactMarkdown from 'react-markdown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { SprintStatus } from '../../shared/types/api';

const statusColors: Record<SprintStatus, 'success' | 'primary' | 'default'> = {
  active: 'success',
  planned: 'primary',
  completed: 'default',
};

const statusLabels: Record<SprintStatus, string> = {
  active: 'Active',
  planned: 'Planned',
  completed: 'Completed',
};

export function SprintDetailsPage() {
  const { sprintId } = useParams<{ sprintId: string }>();
  const navigate = useNavigate();
  const sprint = mockSprints.find((s) => s.id === sprintId);

  if (!sprint) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography>Sprint not found</Typography>
      </Box>
    );
  }

  const stats = sprint.status === 'completed' && sprint.completedStats
    ? sprint.completedStats
    : sprint.stats;

  const completionRate = stats.totalTodos > 0
    ? Math.round((stats.doneTodos / stats.totalTodos) * 100)
    : 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/projects/proj-1/sprints')}
        sx={{ mb: 3 }}
      >
        Back to sprints
      </Button>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              {sprint.name}
            </Typography>
            <Chip
              label={statusLabels[sprint.status]}
              color={statusColors[sprint.status]}
              sx={{ mb: 2 }}
            />
            {sprint.goal && (
              <Typography variant="body1" color="text.secondary">
                {sprint.goal}
              </Typography>
            )}
          </Box>
          {sprint.status === 'active' && (
            <Button variant="contained">
              Go to board
            </Button>
          )}
        </Box>

        {sprint.startDate && sprint.endDate && (
          <Typography variant="body2" color="text.secondary">
            {new Date(sprint.startDate).toLocaleDateString('en-US', { 
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })} –{' '}
            {new Date(sprint.endDate).toLocaleDateString('en-US', { 
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Typography>
        )}
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {completionRate}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completion rate
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {stats.doneTodos}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            of {stats.totalTodos} todos done
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {stats.donePoints}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            of {stats.totalPoints} points done
          </Typography>
        </Paper>
        {sprint.completedStats && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {sprint.completedStats.carriedOver}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Carried over
            </Typography>
          </Paper>
        )}
      </Box>

      {sprint.summary && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              AI Summary
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={sprint.summary.source === 'ai' ? 'AI' : 'Mock AI'}
                size="small"
                sx={{ bgcolor: '#334155', color: 'white' }}
              />
              <Typography variant="caption" color="text.secondary">
                Generated {new Date(sprint.summary.generatedAt).toLocaleDateString()}
              </Typography>
              <Button size="small" variant="outlined">
                Regenerate
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box
            sx={{
              '& h2': { fontSize: '1.5rem', fontWeight: 600, mt: 3, mb: 2 },
              '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
              '& p': { mb: 2 },
              '& ul': { pl: 3, mb: 2 },
              '& li': { mb: 1 },
            }}
          >
            <ReactMarkdown>{sprint.summary.content}</ReactMarkdown>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
