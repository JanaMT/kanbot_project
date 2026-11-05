import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Box, TextField, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCreateTodo } from '../api/queries';

interface QuickCreateTodoProps {
  projectId: string;
}

export interface QuickCreateTodoRef {
  focus: () => void;
}

export const QuickCreateTodo = forwardRef<QuickCreateTodoRef, QuickCreateTodoProps>(
  ({ projectId }, ref) => {
    const [title, setTitle] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const createMutation = useCreateTodo(projectId);

    // Expose focus method to parent
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    }));

    const handleSubmit = async () => {
      if (!title.trim() || createMutation.isPending) return;

      try {
        await createMutation.mutateAsync({
          title: title.trim(),
          type: 'task',
          priority: 'medium',
          status: 'todo',
          storyPoints: null,
        });
        setTitle('');
        // Restore focus immediately after clearing the input
        // Use setTimeout to ensure DOM has updated after query invalidation
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      } catch {
        // Error handled by mutation hook
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        setTitle('');
        inputRef.current?.blur();
      }
    };

    return (
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 1.5,
          border: '1px dashed',
          borderColor: isFocused ? 'primary.main' : 'divider',
          bgcolor: 'background.paper',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <TextField
          inputRef={inputRef}
          fullWidth
          size="small"
          placeholder="+ Create todo (press Enter to save, Escape to cancel)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={createMutation.isPending}
          slotProps={{
            input: {
              startAdornment: createMutation.isPending ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : (
                <AddIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
            },
          }}
        />
      </Box>
    );
  }
);

QuickCreateTodo.displayName = 'QuickCreateTodo';
