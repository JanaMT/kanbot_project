import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventIcon from '@mui/icons-material/Event';
import SummarizeIcon from '@mui/icons-material/Summarize';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useParams, useNavigate } from 'react-router';
import { useAiStatus, useChat as useChatMutation } from '../api/queries';
import { useChat } from '../hooks/useChat';
import { useSprints, useGenerateSprintSummary, getActiveSprint } from '../../sprints/api/queries';
import { AiStatusBadge } from './AiStatusBadge';
import { ChatMessage } from './ChatMessage';
import { ChatWelcome } from './ChatWelcome';
import { ChatInput } from './ChatInput';
import { GenerateTodosDialog } from './GenerateTodosDialog';
import { PlanSprintDialog } from './PlanSprintDialog';
import { getSafeAiErrorMessage } from '../utils/errorMessages';
import { routes } from '../../../app/navigation';

interface AiDrawerProps {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement>;
}

const DRAWER_WIDTH = 440;

export function AiDrawer({ open, onClose, returnFocusRef }: AiDrawerProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: aiStatus, isLoading: isLoadingStatus } = useAiStatus();
  const { data: sprints = [] } = useSprints(projectId || '');
  const chatMutation = useChatMutation(projectId || '');
  const { messages, addMessage, clearMessages } = useChat(projectId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [generateTodosOpen, setGenerateTodosOpen] = useState(false);
  const [planSprintOpen, setPlanSprintOpen] = useState(false);
  
  // Sprint summary state - compact status only
  const [summaryStatus, setSummaryStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Get active sprint
  const activeSprint = getActiveSprint(sprints);
  
  // Sprint summary mutation
  const generateSummaryMutation = useGenerateSprintSummary(activeSprint?.id || '');

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, isThinking]);

  const handleSendMessage = async (content: string) => {
    if (!projectId || content.trim().length === 0) return;

    // Clear previous errors
    setError(null);

    // Add user message
    const userMessage = { role: 'user' as const, content };
    addMessage(userMessage);

    // Show thinking indicator
    setIsThinking(true);

    try {
      // Send all messages including the new one
      const response = await chatMutation.mutateAsync({
        messages: [...messages, userMessage],
      });

      // Clear error on success
      setError(null);

      // Add assistant response
      addMessage(response.message);
    } catch (err) {
      // Use safe error message mapper - never expose raw provider errors
      setError(getSafeAiErrorMessage(err));
    } finally {
      setIsThinking(false);
    }
  };

  const handleRetry = () => {
    // Get the last user message and resend
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  const handleNewChat = () => {
    clearMessages();
    setError(null);
    setIsThinking(false);
    setSummaryStatus('idle');
    setSummaryError(null);
  };

  const handleGenerateSprintSummary = async () => {
    if (!activeSprint) {
      setError('There is no active sprint to summarize. Start a sprint first.');
      return;
    }

    // Set generating status
    setSummaryStatus('generating');
    setSummaryError(null);
    setError(null);

    try {
      await generateSummaryMutation.mutateAsync();
      setSummaryStatus('success');
      setSummaryError(null);
    } catch (err) {
      setSummaryStatus('error');
      setSummaryError(getSafeAiErrorMessage(err));
    }
  };

  const handleViewSummary = () => {
    if (!projectId) return;
    
    // Close the drawer
    onClose();
    
    // Navigate to board page where the summary card is displayed
    navigate(routes.projectBoard(projectId));
  };

  const handleQuickAction = (action: string) => {
    if (action === 'Create todos') {
      setGenerateTodosOpen(true);
    } else if (action === 'Plan sprint') {
      setPlanSprintOpen(true);
    } else if (action === 'Summarize sprint') {
      handleGenerateSprintSummary();
    }
  };

  // Focus the close button when drawer opens (after MUI has set up the focus trap)
  useEffect(() => {
    if (open && closeButtonRef.current) {
      // Small delay to let MUI set up the focus trap first
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle focus restoration after drawer closes
  const handleTransitionExited = () => {
    // Return focus to the Ask AI button after the drawer has fully closed
    // Only restore if trigger exists, is mounted, visible, and enabled
    if (
      returnFocusRef?.current && 
      document.contains(returnFocusRef.current) &&
      !returnFocusRef.current.disabled
    ) {
      returnFocusRef.current.focus();
    }
  };

  // Ensure child dialogs are closed before drawer closes
  const handleDrawerClose = () => {
    // If child dialogs are open, only close them (not the drawer)
    // This ensures Escape closes the topmost modal first
    if (generateTodosOpen) {
      setGenerateTodosOpen(false);
      return;
    }
    if (planSprintOpen) {
      setPlanSprintOpen(false);
      return;
    }
    
    // Immediately move focus to trigger button to prevent it landing on hidden background
    // This prevents the aria-hidden warning during the close transition
    if (
      returnFocusRef?.current && 
      document.contains(returnFocusRef.current) &&
      !returnFocusRef.current.disabled
    ) {
      returnFocusRef.current.focus();
    }
    
    // Then close the drawer
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleDrawerClose}
      onTransitionExited={handleTransitionExited}
      sx={{
        '& .MuiDrawer-paper': {
          width: {
            xs: '100%',
            sm: '85%',
            md: DRAWER_WIDTH,
          },
          maxWidth: DRAWER_WIDTH,
        },
      }}
      // Accessibility
      role="complementary"
      aria-label="AI Assistant"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Ask AI
            </Typography>
            {isLoadingStatus ? (
              <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
            ) : (
              aiStatus && <AiStatusBadge mode={aiStatus.mode} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {(messages.length > 0 || summaryStatus !== 'idle') && (
              <IconButton
                size="small"
                onClick={handleNewChat}
                disabled={isThinking}
                aria-label="Start new chat"
              >
                <RefreshIcon />
              </IconButton>
            )}
            <IconButton 
              ref={closeButtonRef}
              size="small" 
              onClick={handleDrawerClose} 
              aria-label="Close drawer"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Quick actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              size="small"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => handleQuickAction('Create todos')}
              disabled={!projectId || isThinking}
              sx={{ justifyContent: 'flex-start' }}
            >
              Create todos
            </Button>
            <Button
              size="small"
              startIcon={<EventIcon />}
              onClick={() => handleQuickAction('Plan sprint')}
              disabled={!projectId || isThinking}
              sx={{ justifyContent: 'flex-start' }}
            >
              Plan sprint
            </Button>
            <Button
              size="small"
              startIcon={<SummarizeIcon />}
              onClick={() => handleQuickAction('Summarize sprint')}
              disabled={!projectId || !activeSprint || summaryStatus === 'generating'}
              sx={{ justifyContent: 'flex-start' }}
              title={!activeSprint ? 'No active sprint' : undefined}
            >
              Summarize sprint
            </Button>
          </Box>
        </Box>

        <Divider />

        {/* Messages */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          {!projectId ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Please select a project to start chatting with the AI assistant.
            </Alert>
          ) : (
            <>
              {/* Compact Summary Status - shown above chat messages */}
              {summaryStatus === 'generating' && (
                <Alert
                  severity="info"
                  icon={<CircularProgress size={20} />}
                  sx={{ mb: 2 }}
                >
                  Generating sprint summary...
                </Alert>
              )}

              {summaryStatus === 'success' && (
                <Alert
                  severity="success"
                  sx={{ mb: 2 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={handleViewSummary}
                    >
                      View summary
                    </Button>
                  }
                >
                  Sprint summary generated successfully.
                </Alert>
              )}

              {summaryStatus === 'error' && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  action={
                    <Button color="inherit" size="small" onClick={handleGenerateSprintSummary}>
                      Try again
                    </Button>
                  }
                >
                  {summaryError || 'Failed to generate summary. Please try again.'}
                </Alert>
              )}

              {/* Chat Messages */}
              {messages.length === 0 && !isThinking ? (
                <ChatWelcome />
              ) : (
                <>
                  {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                  ))}

                  {isThinking && (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          flexShrink: 0,
                        }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: 'text.secondary',
                        }}
                      >
                        <CircularProgress size={16} />
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          Thinking...
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {error && (
                    <Alert
                      severity="error"
                      sx={{ mb: 2 }}
                      action={
                        <Button color="inherit" size="small" onClick={handleRetry}>
                          Try again
                        </Button>
                      }
                    >
                      {error}
                    </Alert>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

        {/* Disclaimer */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', fontStyle: 'italic' }}
          >
            AI can make mistakes. Review before saving.
          </Typography>
        </Box>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={!projectId || isThinking}
          placeholder={
            !projectId
              ? 'Select a project first...'
              : isThinking
                ? 'Please wait...'
                : 'Ask me anything...'
          }
        />
      </Box>

      {/* Generate Todos Dialog */}
      {projectId && (
        <GenerateTodosDialog
          open={generateTodosOpen}
          onClose={() => setGenerateTodosOpen(false)}
          projectId={projectId}
        />
      )}

      {/* Plan Sprint Dialog */}
      {projectId && (
        <PlanSprintDialog
          open={planSprintOpen}
          onClose={() => setPlanSprintOpen(false)}
          projectId={projectId}
          nextSprintNumber={sprints.length + 1}
        />
      )}
    </Drawer>
  );
}
