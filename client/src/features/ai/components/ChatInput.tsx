import { useState, useRef, type KeyboardEvent } from 'react';
import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled = false, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
    // Keep focus after sending
    setTimeout(() => textFieldRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Enter without Shift sends the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <TextField
        inputRef={textFieldRef}
        fullWidth
        multiline
        maxRows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Ask me anything...'}
        disabled={disabled}
        size="small"
        sx={{
          '& .MuiInputBase-root': {
            bgcolor: 'background.default',
          },
        }}
      />
      <Tooltip
        title={
          disabled
            ? 'Please wait...'
            : !input.trim()
              ? 'Type a message first'
              : 'Send message (Enter)'
        }
      >
        <span>
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            aria-label="Send message"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
