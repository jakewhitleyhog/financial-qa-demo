/**
 * useChatSession Hook
 * Manages chat session state and provides methods for sending messages
 */

import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';

export function useChatSession(initialSessionId = null) {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load an existing session
   */
  const loadSession = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatAPI.getSession(sessionId);
      setSessionInfo(response.session);
      setMessages(response.messages || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new session
   */
  const createSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatAPI.createSession();
      setSessionInfo(response.session);
      setMessages([]);
      return response.session;
    } catch (err) {
      setError(err.message);
      console.error('Failed to create session:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send a message and stream the assistant response token by token.
   */
  const sendMessage = useCallback(async (messageText) => {
    if (!sessionInfo) {
      throw new Error('No active session');
    }

    setSending(true);
    setError(null);

    // Optimistically add user message
    const userMessage = {
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages(prev => [...prev, userMessage]);

    // Add a streaming placeholder for the assistant response
    const streamingId = `streaming-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: streamingId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      createdAt: new Date().toISOString(),
    }]);

    let accumulatedContent = '';
    let finalData = null;

    try {
      await chatAPI.sendMessageStream(
        sessionInfo.sessionId,
        messageText,
        (chunk) => {
          accumulatedContent += chunk;
          setMessages(prev => prev.map(m =>
            m.id === streamingId ? { ...m, content: accumulatedContent } : m
          ));
        },
        (data) => { finalData = data; }
      );

      // Replace optimistic + streaming placeholders with settled messages
      setMessages(prev => {
        const cleaned = prev.filter(m => !m.isOptimistic && m.id !== streamingId);
        return [
          ...cleaned,
          { ...userMessage, isOptimistic: false },
          {
            id: finalData?.messageId,
            role: 'assistant',
            content: accumulatedContent,
            metadata: finalData?.metadata,
            createdAt: new Date().toISOString(),
            isStreaming: false,
          },
        ];
      });

      return finalData;
    } catch (err) {
      setError(err.message);
      setMessages(prev => prev.filter(m => !m.isOptimistic && m.id !== streamingId));
      console.error('Failed to send message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  }, [sessionInfo]);

  /**
   * Initialize session on mount
   */
  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId);
    }
  }, [initialSessionId, loadSession]);

  return {
    sessionInfo,
    messages,
    loading,
    sending,
    error,
    loadSession,
    createSession,
    sendMessage,
  };
}

export default useChatSession;
