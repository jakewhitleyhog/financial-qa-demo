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
  const createSession = useCallback(async (userName = 'Anonymous') => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatAPI.createSession(userName);
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
   * Send a message
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

    try {
      const response = await chatAPI.sendMessage(sessionInfo.sessionId, messageText);

      // Replace optimistic message with real one and add assistant response
      setMessages(prev => {
        const withoutOptimistic = prev.filter(m => !m.isOptimistic);
        return [
          ...withoutOptimistic,
          { ...userMessage, isOptimistic: false },
          response.message,
        ];
      });

      return response.message;
    } catch (err) {
      setError(err.message);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => !m.isOptimistic));
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
