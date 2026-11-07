import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Avatar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useMediaQuery,
  useTheme,
  CircularProgress,
  IconButton,
  Menu,
  ListItemIcon as MenuListItemIcon,
  Chip,
} from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router';
import { useRef, useEffect, type RefObject } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import HistoryIcon from '@mui/icons-material/History';
import FolderIcon from '@mui/icons-material/Folder';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAuthStore } from '../../features/auth/authStore';
import { useSignOut } from '../../features/auth/hooks/useSignOut';
import { useProjects } from '../../features/projects/api/queries';
import { useThemeMode } from '../theme/ThemeProvider';
import { useState } from 'react';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onMobileOpen: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement>;
}

export function Sidebar({ drawerWidth, mobileOpen, onMobileClose, returnFocusRef }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const signOut = useSignOut();
  const user = useAuthStore((state) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleTheme } = useThemeMode();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpen = Boolean(settingsAnchorEl);
  
  // Ref to the logo/branding area for initial focus
  const logoRef = useRef<HTMLDivElement>(null);

  // Focus the logo area when mobile drawer opens
  useEffect(() => {
    if (isMobile && mobileOpen && logoRef.current) {
      const timer = setTimeout(() => {
        logoRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMobile, mobileOpen]);

  // Handle focus restoration after mobile drawer closes
  const handleTransitionExited = () => {
    if (returnFocusRef?.current) {
      returnFocusRef.current.focus();
    }
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    handleSettingsClose();
  };

  const handleLogout = () => {
    handleSettingsClose();
    signOut();
  };

  // Close Settings menu when mobile drawer closes to prevent anchorEl warnings
  const handleMobileClose = () => {
    handleSettingsClose();
    onMobileClose();
  };

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
      handleMobileClose();
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo and branding */}
      <Box 
        ref={logoRef}
        tabIndex={-1}
        sx={{ 
          px: 2.5, 
          py: 2.5, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          flexShrink: 0,
          outline: 'none', 
        }}
      >
        <img src="/brand/kanbot-icon.svg" alt="Kanbot" style={{ width: 32, height: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Kanbot
        </Typography>
      </Box>

      {/* Project selector */}
      <Box sx={{ px: 2, pb: 2, flexShrink: 0 }}>
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
                bgcolor: 'action.hover',
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                      {project.name}
                    </Typography>
                    <Chip
                      label={project.key}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        bgcolor: 'primary.main',
                        color: mode === 'light' ? 'white' : 'primary.contrastText',
                        alignSelf: 'flex-start',
                        '& .MuiChip-label': {
                          px: 0.75,
                          py: 0,
                        },
                      }}
                    />
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

      {/* Main navigation */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            py: 1.5,
            // Styled scrollbar
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.3)',
              },
            },
          }}
        >
          <List sx={{ px: 1.5 }}>
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItemButton
                  key={item.path}
                  selected={isActive}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    py: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': {
                      bgcolor: mode === 'light' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(226, 232, 240, 0.12)',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: mode === 'light' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(226, 232, 240, 0.18)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>

          <Divider sx={{ my: 1.5, mx: 1.5 }} />

          <List sx={{ px: 1.5 }}>
            <ListItemButton
              onClick={() => handleNavigation('/projects')}
              sx={{
                borderRadius: 1.5,
                py: 1,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Projects"
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  },
                }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Box>

      <Divider />

      {/* User profile with inline Settings button */}
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1.25,
            borderRadius: 2,
            bgcolor: 'action.hover',
            minWidth: 0,
          }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', flexShrink: 0 }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                lineHeight: 1.3, 
                fontSize: '0.875rem',
              }} 
              noWrap
            >
              {user?.name || 'User'}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.75rem',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }} 
              noWrap
            >
              {user?.email || ''}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleSettingsClick}
            aria-label="Open settings"
            aria-controls={settingsOpen ? 'settings-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={settingsOpen ? 'true' : undefined}
            sx={{
              color: 'text.secondary',
              flexShrink: 0,
              '&:hover': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Settings Menu */}
      <Menu
        id="settings-menu"
        anchorEl={settingsAnchorEl}
        open={settingsOpen}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              mt: -1,
            },
          },
        }}
      >
        <MenuItem onClick={handleToggleTheme}>
          <MenuListItemIcon>
            {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          </MenuListItemIcon>
          <Typography variant="body2">
            {mode === 'light' ? 'Dark mode' : 'Light mode'}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <MenuListItemIcon>
            <LogoutIcon fontSize="small" />
          </MenuListItemIcon>
          <Typography variant="body2">Log out</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileClose}
          onTransitionExited={handleTransitionExited}
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
