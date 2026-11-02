import { Tooltip } from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BugReportIcon from '@mui/icons-material/BugReport';
import type { TodoType } from '../types/api';

interface TypeIconProps {
  type: TodoType;
  size?: 'small' | 'medium';
}

const typeConfig: Record<TodoType, { icon: React.ReactElement; label: string; color: string }> = {
  task: {
    icon: <CheckBoxIcon />,
    label: 'Task',
    color: '#3B82F6',
  },
  story: {
    icon: <BookmarkIcon />,
    label: 'Story',
    color: '#A855F7',
  },
  bug: {
    icon: <BugReportIcon />,
    label: 'Bug',
    color: '#DC2626',
  },
};

export function TypeIcon({ type, size = 'small' }: TypeIconProps) {
  const config = typeConfig[type];
  const iconSize = size === 'small' ? 18 : 24;

  return (
    <Tooltip title={config.label}>
      <span style={{ color: config.color, display: 'flex', fontSize: iconSize }}>
        {config.icon}
      </span>
    </Tooltip>
  );
}
