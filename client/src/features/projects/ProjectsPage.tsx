import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import { EmptyState } from '../../shared/components/EmptyState';
import { LoadingState } from '../../shared/components/LoadingState';
import { ErrorState } from '../../shared/components/ErrorState';
import { useState } from 'react';
import type { ProjectWithStats } from '../../shared/types/api';
import { useProjects } from './api/queries';
import { ProjectCard } from './components/ProjectCard';
import { ProjectFormDialog } from './components/ProjectFormDialog';
import { DeleteProjectDialog } from './components/DeleteProjectDialog';

export function ProjectsPage() {
  const { data: projects, isLoading, error, refetch } = useProjects();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectWithStats | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithStats | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, project: ProjectWithStats) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setFormDialogOpen(true);
  };

  const handleEditClick = () => {
    setEditingProject(selectedProject);
    setFormDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load projects"
        onRetry={refetch}
      />
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <EmptyState
          icon={<FolderIcon />}
          title="No projects yet"
          description="Create your first project to start organizing your work"
          action={{
            label: 'Create project',
            onClick: handleCreateClick,
          }}
        />
        <ProjectFormDialog
          open={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          project={editingProject}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: { xs: 3, md: 4 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
        >
          New project
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(auto-fill, minmax(280px, 1fr))',
            md: 'repeat(auto-fill, minmax(300px, 1fr))',
          },
          gap: { xs: 2, md: 3 },
        }}
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onMenuClick={handleMenuClick} />
        ))}
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      <ProjectFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        project={editingProject}
      />

      <DeleteProjectDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        project={selectedProject}
      />
    </Box>
  );
}
