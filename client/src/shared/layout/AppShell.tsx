import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router';
import { useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AiDrawer } from '../../features/ai/components/AiDrawer';

const DRAWER_WIDTH = 260;

export function AppShell() {
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Refs for focus restoration
  const askAiButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Ensure only one drawer is open at a time
  const handleAskAI = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    setAiDrawerOpen(!aiDrawerOpen);
  };

  const handleMobileMenuOpen = () => {
    if (aiDrawerOpen) {
      setAiDrawerOpen(false);
    }
    setMobileMenuOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onMobileOpen={handleMobileMenuOpen}
        returnFocusRef={menuButtonRef}
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
          minWidth: 0,
        }}
      >
        <TopBar
          onAskAI={handleAskAI}
          onMenuClick={handleMobileMenuOpen}
          showMenuButton={isMobile}
          askAiButtonRef={askAiButtonRef}
          menuButtonRef={menuButtonRef}
        />

        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: { xs: 2, sm: 3, md: 4 },
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              maxWidth: { xs: '100%', lg: 1400 },
              mx: 'auto',
            }}
          >
            <Outlet context={{ aiDrawerOpen, setAiDrawerOpen }} />
          </Box>
        </Box>
      </Box>

      {/* AI Assistant Drawer */}
      <AiDrawer 
        open={aiDrawerOpen} 
        onClose={() => setAiDrawerOpen(false)}
        returnFocusRef={askAiButtonRef}
      />
    </Box>
  );
}
