import { Chip } from '@mui/material';
import type { AiSource } from '../../../shared/types/api';

interface AiStatusBadgeProps {
  mode: AiSource;
}

export function AiStatusBadge({ mode }: AiStatusBadgeProps) {
  if (mode === 'ai') return null;

  return (
    <Chip
      label="Mock AI"
      size="small"
      sx={{
        bgcolor: 'warning.light',
        color: 'warning.contrastText',
        fontWeight: 500,
        fontSize: '0.75rem',
      }}
    />
  );
}
