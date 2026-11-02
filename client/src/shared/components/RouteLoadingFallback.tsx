import { Box, CircularProgress } from '@mui/material';

/**
 * Full-screen loading fallback shown while lazy-loaded route chunks are fetched.
 */
export function RouteLoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
