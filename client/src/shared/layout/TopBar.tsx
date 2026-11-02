import { AppBar, Toolbar, Typography, Button, IconButton, Tooltip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu';
import { useThemeMode } from '../theme/ThemeProvider';

interface TopBarProps {
  onAskAI: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function TopBar({ onAskAI, onMenuClick, showMenuButton }: TopBarProps) {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {showMenuButton && onMenuClick && (
          <IconButton
            color="inherit"
            aria-label="Open menu"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {/* Page title will be set by individual pages */}
        </Typography>
        <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={<SmartToyIcon sx={{ display: { xs: 'none', sm: 'block' } }} />}
          onClick={onAskAI}
          size="small"
          sx={{
            bgcolor: mode === 'light' ? '#334155' : 'primary.main',
            color: mode === 'light' ? '#FFFFFF' : 'primary.contrastText',
            '&:hover': {
              bgcolor: mode === 'light' ? '#1e293b' : 'primary.dark',
            },
            px: { xs: 1.5, sm: 2 },
            minWidth: { xs: 'auto', sm: 'auto' },
          }}
        >
          <Typography sx={{ display: { xs: 'none', sm: 'inline' } }}>Ask AI</Typography>
          <Typography sx={{ display: { xs: 'inline', sm: 'none' } }}>AI</Typography>
        </Button>
      </Toolbar>
    </AppBar>
  );
}
