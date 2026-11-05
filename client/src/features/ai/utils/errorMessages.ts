import { ApiError } from '../../../shared/api/client';

/**
 * Maps AI-related errors to safe, user-friendly messages.
 * Prevents raw provider messages, status codes, and internal details from being exposed.
 * 
 * @param error - The error to map (ApiError or unknown)
 * @returns A safe, user-friendly error message
 */
export function getSafeAiErrorMessage(error: unknown): string {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    const { code, status, message } = error;
    const lowerMessage = message.toLowerCase();

    // Rate limiting (HTTP 429 or RATE_LIMITED code)
    if (code === 'RATE_LIMITED' || status === 429) {
      return 'AI is busy right now. Please wait a moment and try again.';
    }

    // AI service errors (HTTP 502 or AI_ERROR code)
    if (code === 'AI_ERROR' || status === 502) {
      return 'The AI service is temporarily unavailable. Please try again.';
    }

    // AI provider busy/unavailable (HTTP 503)
    if (status === 503 || lowerMessage.includes('503') || lowerMessage.includes('busy')) {
      return 'The AI service is temporarily busy. Please try again in a moment.';
    }

    // Network/connection errors (status 0 or NETWORK_ERROR)
    if (code === 'NETWORK_ERROR' || status === 0) {
      return 'Connection lost. Check your internet and try again.';
    }

    // Check message content for network-related keywords
    if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('offline')) {
      return 'Connection lost. Check your internet and try again.';
    }

    // Check for AI provider/service mentions (but don't expose raw message)
    if (lowerMessage.includes('ai') || lowerMessage.includes('provider') || lowerMessage.includes('model')) {
      return 'The AI service is temporarily unavailable. Please try again.';
    }

    // Generic API error - don't expose internal message
    return 'Something went wrong while using AI. Please try again.';
  }

  // Unknown error type
  return 'Something went wrong while using AI. Please try again.';
}
