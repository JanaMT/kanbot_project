import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router';

export function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 700, fontSize: '6rem', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Page not found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist
      </Typography>
      <Button variant="contained" onClick={() => navigate('/projects')}>
        Go to projects
      </Button>
    </Box>
  );
}
