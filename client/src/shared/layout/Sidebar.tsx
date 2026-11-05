import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
  Avatar,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import HistoryIcon from '@mui/icons-material/History';
import FolderIcon from '@mui/icons-material/Folder';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthStore } from '../../features/auth/authStore';
import { useSignOut } from '../../features/auth/hooks/useSignOut';
import { useProjects } from '../../features/projects/api/queries';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onMobileOpen: () => void;
}

export function Sidebar({ drawerWidth, mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const signOut = useSignOut();
  const user = useAuthStore((state) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch real projects from API
  const { data: projects, isLoading } = useProjects();

  // Derive selected project from URL param or default to first project
  const selectedProject = projectId || (projects && projects.length > 0 ? projects[0].id : '');

  const navigationItems = selectedProject
    ? [
        { label: 'Backlog', icon: <DashboardIcon />, path: `/projects/${selectedProject}/backlog` },
        { label: 'Active Sprint', icon: <ViewKanbanIcon />, path: `/projects/${selectedProject}/board` },
        { label: 'Sprints', icon: <HistoryIcon />, path: `/projects/${selectedProject}/sprints` },
      ]
    : [];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ px: 2.5, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <img src="/brand/kanbot-icon.svg" alt="Kanbot" style={{ width: 32, height: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Kanbot
          </Typography>
        </Box>
      </Toolbar>

      <Box sx={{ px: 2.5, pb: 2 }}>
        <FormControl fullWidth size="small">
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
              <CircularProgress size={24} />
            </Box>
          ) : projects && projects.length > 0 ? (
            <Select
              value={selectedProject || ''}
              onChange={(e) => {
                const newProjectId = e.target.value;
                handleNavigation(`/projects/${newProjectId}/backlog`);
              }}
              sx={{
                bgcolor: 'background.paper',
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                },
              }}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {project.key}
                    </Box>
                    <Typography variant="body2" noWrap>
                      {project.name}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              No projects
            </Typography>
          )}
        </FormControl>
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        <Typography
          variant="caption"
          sx={{
            px: 2.5,
            py: 1,
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.6875rem',
            letterSpacing: 0.5,
          }}
        >
          PROJECT
        </Typography>
        <List>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1.5,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'white' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        <List>
          <ListItemButton
            onClick={() => handleNavigation('/projects')}
            sx={{
              mx: 1,
              borderRadius: 1.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary="Projects" />
          </ListItemButton>
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'background.default',
          }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email || ''}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={signOut}
          sx={{ mt: 1, justifyContent: 'flex-start' }}
        >
          Log out
        </Button>
      </Box>
    </>
  );

  return (
    <>
      {/* Mobile drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop permanent drawer */
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
