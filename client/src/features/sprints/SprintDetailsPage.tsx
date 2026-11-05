import { useState } from 'react';
import { Box, Typography, Paper, Chip, Button, Divider, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LoadingState } from '../../shared/components/LoadingState';
import { ErrorState } from '../../shared/components/ErrorState';
import { useSprint, useGenerateSprintSummary } from './api/queries';
import { useTodos } from '../backlog/api/queries';
import { TodoList } from '../backlog/components/TodoList';
import { SprintSummaryCard } from './components/SprintSummaryCard';
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

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function SprintDetailsPage() {
  const { projectId, sprintId } = useParams<{ projectId: string; sprintId: string }>();
  const navigate = useNavigate();
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const { data: sprint, isLoading, error, refetch } = useSprint(sprintId || '');
  const { data: todos = [] } = useTodos(projectId || '', { sprintId: sprintId || '' });
  const generateSummaryMutation = useGenerateSprintSummary(sprintId || '');

  const handleGenerateSummary = async () => {
    setSummaryError(null);
    try {
      await generateSummaryMutation.mutateAsync();
      // Clear error on success
      setSummaryError(null);
    } catch {
      // Error is already handled by the mutation's onError
      // We just need to track it locally for the component
      setSummaryError('Failed to generate summary. Please try again.');
    }
  };

  const handleRetrySummary = () => {
    handleGenerateSummary();
  };

  if (!projectId || !sprintId) {
    return <ErrorState message="Missing parameters" onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !sprint) {
    return <ErrorState message="Failed to load sprint details" onRetry={refetch} />;
  }

  const stats = sprint.status === 'completed' && sprint.completedStats
    ? sprint.completedStats
    : sprint.stats;

  const completionPercentage = stats.totalPoints > 0
    ? Math.round((stats.donePoints / stats.totalPoints) * 100)
    : 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/projects/${projectId}/sprints`)}
        sx={{ mb: 3 }}
      >
        Back to Sprints
      </Button>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {sprint.name}
            </Typography>
            <Chip
              label={statusLabels[sprint.status]}
              color={statusColors[sprint.status]}
              size="medium"
              sx={{ mb: 2 }}
            />
            {sprint.goal && (
              <Typography variant="body1" color="text.secondary">
                {sprint.goal}
              </Typography>
            )}
          </Box>
          {sprint.status === 'active' && (
            <Button
              variant="contained"
              onClick={() => navigate(`/projects/${projectId}/board`)}
            >
              Go to Board
            </Button>
          )}
        </Box>

        {/* Dates */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Start:</strong> {formatDate(sprint.startDate)}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>End:</strong> {formatDate(sprint.endDate)}
          </Typography>
          {sprint.startedAt && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Started at:</strong> {formatDateTime(sprint.startedAt)}
            </Typography>
          )}
          {sprint.completedAt && (
            <Typography variant="body2" color="text.secondary">
              <strong>Completed at:</strong> {formatDateTime(sprint.completedAt)}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Completion
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {completionPercentage}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Story Points
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {stats.donePoints} / {stats.totalPoints}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Todos Completed
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {stats.doneTodos} / {stats.totalTodos}
            </Typography>
          </Box>
          {sprint.completedStats && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Carried Over
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {sprint.completedStats.carriedOver}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Status breakdown */}
        {sprint.status !== 'planned' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  To Do
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {stats.byStatus.todo}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  In Progress
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {stats.byStatus.in_progress}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  In Review
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {stats.byStatus.in_review}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Done
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {stats.byStatus.done}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* AI Summary for completed sprints */}
      {sprint.status === 'completed' && (
        <SprintSummaryCard
          sprint={sprint}
          onGenerate={handleGenerateSummary}
          isGenerating={generateSummaryMutation.isPending}
          error={summaryError}
          onRetry={handleRetrySummary}
        />
      )}

      {/* Todos */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Todos ({todos.length})
        </Typography>
        {todos.length === 0 ? (
          <Alert severity="info">No todos in this sprint</Alert>
        ) : (
          <TodoList
            todos={todos}
            onTodoClick={() => {}}
            onReorder={() => {}}
            onMoveClick={() => {}}
            isDragDisabled={true}
          />
        )}
      </Paper>
    </Box>
  );
}
