import { Box, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export function ChatWelcome() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 6,
        px: 3,
      }}
    >
      <SmartToyIcon
        sx={{
          fontSize: 64,
          color: 'primary.main',
          mb: 2,
          opacity: 0.7,
        }}
      />
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Hi! I'm Kanbot
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
        I can help you with your todos, backlog, and sprints. Ask me anything about your project,
        and I'll do my best to assist you.
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        Try asking: "How is the sprint going?" or "What should I work on next?"
      </Typography>
    </Box>
  );
}
