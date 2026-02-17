/**
 * QuestionCard Component
 * Displays a single question in the forum list
 */

import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { UpvoteButton } from './UpvoteButton';
import { MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuestionCard({ question, onClick, onUpvote, onRemoveUpvote, isUpvoted = false }) {
  const formattedDate = new Date(question.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Upvote section */}
          <div className="flex-shrink-0">
            <UpvoteButton
              upvotes={question.upvotes}
              onUpvote={(e) => {
                e?.stopPropagation();
                onUpvote?.(question.id);
              }}
              onRemoveUpvote={(e) => {
                e?.stopPropagation();
                onRemoveUpvote?.(question.id);
              }}
              isUpvoted={isUpvoted}
            />
          </div>

          {/* Content section */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
              {question.title}
            </h3>

            {/* Body preview */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {question.body}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{question.userName}</span>
              </div>

              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{question.replyCount || 0} replies</span>
              </div>

              <span>{formattedDate}</span>

              {question.isAnswered && (
                <Badge variant="success" className="text-xs">
                  Answered
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuestionCard;
