import {
  Box,
  Typography,
  Paper,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  Button,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import { LoadingState } from '../../shared/components/LoadingState';
import { ErrorState } from '../../shared/components/ErrorState';
import { EmptyState } from '../../shared/components/EmptyState';
import { useSprints } from './api/queries';
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

export function SprintsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: sprints = [], isLoading, error, refetch } = useSprints(projectId || '');

  if (!projectId) {
    return <ErrorState message="Project ID is missing" onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message="Failed to load sprints" onRetry={refetch} />;
  }

  if (sprints.length === 0) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <EmptyState
          icon={<EventIcon />}
          title="No sprints yet"
          description="Create your first sprint from the backlog"
          action={{
            label: 'Go to backlog',
            onClick: () => navigate(`/projects/${projectId}/backlog`),
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Sprints
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sprints.length} {sprints.length === 1 ? 'sprint' : 'sprints'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/projects/${projectId}/backlog`)}
        >
          Create Sprint
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {sprints.map((sprint) => {
          const stats = sprint.status === 'completed' && sprint.completedStats
            ? sprint.completedStats
            : sprint.stats;

          const completionRate = stats.totalTodos > 0
            ? Math.round((stats.doneTodos / stats.totalTodos) * 100)
            : 0;

          return (
            <Box key={sprint.id}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea
                  onClick={() => navigate(`/projects/${projectId}/sprints/${sprint.id}`)}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {sprint.name}
                        </Typography>
                        <Chip
                          label={statusLabels[sprint.status]}
                          color={statusColors[sprint.status]}
                          size="small"
                        />
                      </Box>
                      {sprint.goal && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {sprint.goal}
                        </Typography>
                      )}
                    </Box>

                    {sprint.startDate && sprint.endDate && (
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        {new Date(sprint.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} –{' '}
                        {new Date(sprint.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    )}

                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Completion
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {completionRate}%
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Points
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {stats.donePoints} / {stats.totalPoints}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Todos
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {stats.doneTodos} / {stats.totalTodos}
                          </Typography>
                        </Box>
                        {sprint.completedStats && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Carried over
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {sprint.completedStats.carriedOver}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
