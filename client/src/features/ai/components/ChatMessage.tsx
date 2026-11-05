import { Box, Paper, Typography, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage as ChatMessageType } from '../../../shared/types/api';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        mb: 2,
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          flexShrink: 0,
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
      </Avatar>

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          maxWidth: '85%',
          bgcolor: isUser ? 'primary.light' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          border: '1px solid',
          borderColor: isUser ? 'primary.main' : 'divider',
          wordBreak: 'break-word',
        }}
      >
        {isUser ? (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
        ) : (
          <Box
            sx={{
              '& p': { mb: 1, '&:last-child': { mb: 0 } },
              '& ul, & ol': { pl: 2.5, mb: 1, mt: 0.5 },
              '& li': { mb: 0.5 },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontWeight: 600,
                mt: 1.5,
                mb: 0.75,
                '&:first-of-type': { mt: 0 },
              },
              '& code': {
                bgcolor: 'action.hover',
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
                fontSize: '0.875em',
                fontFamily: 'monospace',
              },
              '& pre': {
                bgcolor: 'action.hover',
                p: 1.5,
                borderRadius: 1,
                overflow: 'auto',
                mb: 1,
              },
              '& pre code': {
                bgcolor: 'transparent',
                p: 0,
              },
              '& blockquote': {
                borderLeft: '3px solid',
                borderColor: 'divider',
                pl: 2,
                ml: 0,
                fontStyle: 'italic',
                color: 'text.secondary',
              },
              '& a': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
