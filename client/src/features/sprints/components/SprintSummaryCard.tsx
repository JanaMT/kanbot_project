import { useState, useEffect } from 'react';
import * as React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReactMarkdown from 'react-markdown';
import type { Sprint } from '../../../shared/types/api';

interface SprintSummaryCardProps {
  sprint: Sprint;
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getSafeErrorMessage(error: string | null): string {
  if (!error) return '';
  
  const lowerError = error.toLowerCase();
  
  if (lowerError.includes('network') || lowerError.includes('connection') || lowerError.includes('offline')) {
    return 'Connection lost. Check your internet and try again.';
  }
  
  if (lowerError.includes('ai') && lowerError.includes('unavailable')) {
    return 'The AI service is temporarily unavailable. Please try again.';
  }
  
  if (lowerError.includes('rate') || lowerError.includes('limit') || lowerError.includes('busy')) {
    return 'AI is busy right now. Please wait a moment and try again.';
  }
  
  if (lowerError.includes('502') || lowerError.includes('ai error') || lowerError.includes('ai encountered')) {
    return 'The AI service is temporarily unavailable. Please try again.';
  }
  
  // Generic fallback
  return 'The AI service is temporarily unavailable. Please try again.';
}

export function SprintSummaryCard({
  sprint,
  onGenerate,
  isGenerating,
  error,
  onRetry,
}: SprintSummaryCardProps) {
  const hasSummary = sprint.summary !== null;
  const [isExpanded, setIsExpanded] = useState(false);
  const prevGeneratingRef = React.useRef(isGenerating);

  // Auto-expand after successful generation
  useEffect(() => {
    const wasGenerating = prevGeneratingRef.current;
    prevGeneratingRef.current = isGenerating;

    // Only expand when generation just completed successfully
    if (wasGenerating && !isGenerating && hasSummary && !error) {
      setIsExpanded(true);
    }
  }, [hasSummary, isGenerating, error]);

  const handleAccordionChange = (_event: React.SyntheticEvent, expanded: boolean) => {
    setIsExpanded(expanded);
  };

  // If no summary exists yet, show initial state
  if (!hasSummary && !isGenerating && !error) {
    return (
      <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              AI Sprint Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate an AI-powered summary of this sprint's progress, achievements, and insights.
            </Typography>
          </Box>
          <Button
            startIcon={<AutoAwesomeIcon />}
            onClick={onGenerate}
            disabled={isGenerating}
            variant="contained"
            size="small"
          >
            Summarize
          </Button>
        </Box>
      </Box>
    );
  }

  // If generating for the first time
  if (!hasSummary && isGenerating) {
    return (
      <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Analyzing sprint and generating summary...
          </Typography>
        </Box>
      </Box>
    );
  }

  const safeErrorMessage = error ? getSafeErrorMessage(error) : null;
  const showError = error && hasSummary; // Only show error if regenerate failed with existing summary

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header with Regenerate button - outside Accordion to fix nested button validation */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderBottom: isExpanded ? 0 : '1px solid',
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          borderBottomLeftRadius: isExpanded ? 0 : 4,
          borderBottomRightRadius: isExpanded ? 0 : 4,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            AI Sprint Summary
          </Typography>
          {sprint.summary?.source && (
            <Chip
              label={sprint.summary.source === 'mock' ? 'Mock AI' : 'AI Powered'}
              size="small"
              color={sprint.summary.source === 'mock' ? 'default' : 'primary'}
              variant="outlined"
            />
          )}
        </Box>
        {sprint.summary?.generatedAt && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}
          >
            {formatDateTime(sprint.summary.generatedAt)}
          </Typography>
        )}
        <Button
          startIcon={isGenerating ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={onGenerate}
          disabled={isGenerating}
          size="small"
          sx={{ flexShrink: 0 }}
        >
          Regenerate
        </Button>
      </Box>

      {/* Accordion for collapsible content */}
      <Accordion
        expanded={isExpanded}
        onChange={handleAccordionChange}
        sx={{
          '&:before': { display: 'none' },
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderTop: 0,
          borderBottomLeftRadius: '4px !important',
          borderBottomRightRadius: '4px !important',
          borderTopLeftRadius: '0 !important',
          borderTopRightRadius: '0 !important',
          '&.Mui-expanded': {
            margin: 0,
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: 'auto !important',
            '& .MuiAccordionSummary-content': {
              margin: '8px 0 !important',
            },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {isExpanded ? 'Hide summary' : 'Show summary'}
          </Typography>
        </AccordionSummary>

      <AccordionDetails>
        {showError && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              onRetry ? (
                <Button color="inherit" size="small" onClick={onRetry}>
                  Try again
                </Button>
              ) : undefined
            }
          >
            We couldn't generate a new summary. Your previous summary is still available.
            {safeErrorMessage && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                {safeErrorMessage}
              </Typography>
            )}
          </Alert>
        )}

        {sprint.summary?.generatedAt && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}
          >
            Generated on {formatDateTime(sprint.summary.generatedAt)}
          </Typography>
        )}

        <Box
          sx={{
            '& p': { mb: 1.5, mt: 0 },
            '& p:last-child': { mb: 0 },
            '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1, fontWeight: 600 },
            '& h1:first-of-type, & h2:first-of-type, & h3:first-of-type': { mt: 0 },
            '& ul, & ol': { mb: 1.5, pl: 3 },
            '& li': { mb: 0.5 },
            '& code': {
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: 'action.hover',
              fontFamily: 'monospace',
              fontSize: '0.875em',
            },
            '& pre': {
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'action.hover',
              overflow: 'auto',
              mb: 1.5,
              maxWidth: '100%',
              '& code': {
                p: 0,
                bgcolor: 'transparent',
              },
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'divider',
              pl: 2,
              ml: 0,
              my: 1.5,
              color: 'text.secondary',
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
            overflowWrap: 'break-word',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          <ReactMarkdown>{sprint.summary?.content || ''}</ReactMarkdown>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 2, fontStyle: 'italic', textAlign: 'center' }}
        >
          AI can make mistakes. Review before saving.
        </Typography>
      </AccordionDetails>
    </Accordion>
    </Box>
  );
}
