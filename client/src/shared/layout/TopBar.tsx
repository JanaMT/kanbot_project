import { AppBar, Toolbar, Button, IconButton, Box } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MenuIcon from '@mui/icons-material/Menu';

interface TopBarProps {
  onAskAI: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function TopBar({ onAskAI, onMenuClick, showMenuButton }: TopBarProps) {
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
      <Toolbar 
        sx={{ 
          gap: 1,
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 2, sm: 3 },
        }}
      >
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
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<SmartToyIcon />}
          onClick={onAskAI}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 2.5,
            py: 0.75,
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
            },
          }}
        >
          Ask AI
        </Button>
      </Toolbar>
    </AppBar>
  );
}
