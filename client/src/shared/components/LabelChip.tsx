import { Chip, type ChipProps } from '@mui/material';
import { getLabelColor } from '../utils/labelColors';

interface LabelChipProps extends Omit<ChipProps, 'label'> {
  label: string;
}

/**
 * Displays a Todo label with deterministic color based on the label text.
 * Always shows the label text; does not rely on color alone for accessibility.
 */
export function LabelChip({ label, sx, ...props }: LabelChipProps) {
  const color = getLabelColor(label);

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: `${color}20`, // 20 = 12.5% opacity
        color: color,
        borderColor: color,
        fontWeight: 500,
        ...sx,
      }}
      {...props}
    />
  );
}
