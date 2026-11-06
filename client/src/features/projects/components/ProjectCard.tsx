import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { ProjectWithStats } from '../../../shared/types/api';

interface ProjectCardProps {
  project: ProjectWithStats;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, project: ProjectWithStats) => void;
}

export function ProjectCard({ project, onMenuClick }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        animation: 'fadeIn 0.3s ease-in-out',
        minWidth: 0, // Allow shrinking below content size
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          transition: 'none',
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          '@media (prefers-reduced-motion: reduce)': {
            transform: 'none',
          },
        },
      }}
      onClick={() => navigate(`/projects/${project.id}/backlog`)}
    >
      <CardContent sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2, minWidth: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, wordBreak: 'break-word', mb: 0 }}>
              {project.name}
            </Typography>
            <Chip
              label={project.key}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                alignSelf: 'flex-start',
                '& .MuiChip-label': {
                  px: 1,
                  whiteSpace: 'nowrap',
                },
              }}
              title={project.key}
            />
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(e, project);
            }}
            aria-label="Project options"
            sx={{ flexShrink: 0, ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {project.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}
          >
            {project.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          <Chip
            label={`${project.stats.backlogCount} backlog`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${project.stats.totalTodos} total`}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, minWidth: 0 }}>
        {project.stats.activeSprint ? (
          <Chip
            label={`Active: ${project.stats.activeSprint.name}`}
            color="success"
            size="small"
            sx={{ fontWeight: 500, maxWidth: '100%' }}
          />
        ) : (
          <Chip label="No active sprint" size="small" sx={{ color: 'text.secondary' }} />
        )}
      </CardActions>
    </Card>
  );
}
