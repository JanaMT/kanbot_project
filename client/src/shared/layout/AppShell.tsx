import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AiDrawer } from '../../features/ai/components/AiDrawer';
import { useState } from 'react';

const DRAWER_WIDTH = 280;

export function AppShell() {
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onMobileOpen={() => setMobileMenuOpen(true)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0, // Allow flex shrinking
        }}
      >
        <TopBar
          onAskAI={() => setAiDrawerOpen(!aiDrawerOpen)}
          onMenuClick={() => setMobileMenuOpen(true)}
          showMenuButton={isMobile}
        />

        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            bgcolor: 'background.default',
            p: { xs: 2, sm: 2.5, md: 3 },
            minWidth: 0, // Allow flex shrinking
          }}
        >
          <Outlet context={{ aiDrawerOpen, setAiDrawerOpen }} />
        </Box>
      </Box>

      {/* AI Assistant Drawer */}
      <AiDrawer open={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} />
    </Box>
  );
}
