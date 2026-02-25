/**
 * ChatInterface Component
 * Main chat interface with messages and input
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Alert, AlertDescription } from '../ui/Alert';
import { Button } from '../ui/Button';
import { useChatSession } from '@/hooks/useChatSession';
import { Loader2, AlertCircle } from 'lucide-react';

export function ChatInterface({ sessionId = null }) {
  const {
    sessionInfo,
    messages,
    loading,
    sending,
    error,
    createSession,
    sendMessage,
  } = useChatSession(sessionId);

  const messagesEndRef = useRef(null);
  const location = useLocation();
  const prefillSent = useRef(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create session if none exists
  useEffect(() => {
    if (!sessionId && !sessionInfo && !loading) {
      createSession().catch(console.error);
    }
  }, [sessionId, sessionInfo, loading, createSession]);

  // Auto-send prefilled question from Quick Start
  useEffect(() => {
    if (sessionInfo && location.state?.prefill && !prefillSent.current) {
      prefillSent.current = true;
      sendMessage(location.state.prefill).catch(console.error);
    }
  }, [sessionInfo, location.state, sendMessage]);

  const handleSendMessage = async (messageText) => {
    try {
      await sendMessage(messageText);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)]">
      <CardHeader>
        <CardTitle>Deal AI Assistant</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask questions about well economics, production, returns, and more
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto border rounded-md mb-4">
          {loading && !sessionInfo ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Initializing chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <p className="mb-4">Start a conversation by asking a question!</p>
              <div className="text-sm space-y-2">
                <p className="font-medium">Example questions:</p>
                <ul className="text-left space-y-1">
                  <li>• What are the Tier 1 well economics?</li>
                  <li>• Show me projected production by year</li>
                  <li>• What is the target IRR and MOIC?</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {messages.map((message, index) => (
                <ChatMessage key={message.id || index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input area */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={!sessionInfo || sending}
          placeholder={
            sending
              ? 'Sending...'
              : 'Ask about well economics, production, returns, price sensitivities...'
          }
        />

        {/* Example queries (shown when no messages) */}
        {messages.length === 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage("What are the Tier 1 well economics?")}
              disabled={!sessionInfo || sending}
            >
              Well Economics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage("Show me projected production by year")}
              disabled={!sessionInfo || sending}
            >
              Production
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage("What is the target IRR and MOIC?")}
              disabled={!sessionInfo || sending}
            >
              Returns
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ChatInterface;
