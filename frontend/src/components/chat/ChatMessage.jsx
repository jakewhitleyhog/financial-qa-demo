/**
 * ChatMessage Component
 * Displays a single chat message (user or assistant)
 */

import { cn } from '@/lib/utils';
import { User, Bot, Code } from 'lucide-react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { Badge } from '../ui/Badge';

export function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex gap-3 p-4', isUser && 'bg-muted/30')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Role label */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {message.isOptimistic && (
            <Badge variant="outline" className="text-xs">
              Sending...
            </Badge>
          )}
        </div>

        {/* Message content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Assistant message metadata */}
        {isAssistant && message.metadata && (
          <div className="space-y-2">
            {/* Confidence indicator */}
            <ConfidenceIndicator metadata={message.metadata} />

            {/* Show generated SQL (collapsible) */}
            {message.metadata.generatedSql && (
              <details className="group">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  <span>View generated SQL</span>
                </summary>
                <div className="mt-2 rounded-md bg-muted p-3">
                  <code className="text-xs font-mono block whitespace-pre-wrap">
                    {message.metadata.generatedSql}
                  </code>
                </div>
              </details>
            )}

            {/* Result count */}
            {message.metadata.resultCount !== undefined && (
              <div className="text-xs text-muted-foreground">
                {message.metadata.resultCount} result(s) found
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground">
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
