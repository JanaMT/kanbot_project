import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../../shared/types/api';

export function useChat(projectId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const currentProjectId = useRef(projectId);

  // Reset conversation when project changes
  useEffect(() => {
    if (currentProjectId.current !== projectId) {
      currentProjectId.current = projectId;
      setMessages([]);
    }
  }, [projectId]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
  };
}
