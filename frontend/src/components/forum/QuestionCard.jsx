/**
 * QuestionCard Component
 * Displays a single question in the forum list
 */

import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { UpvoteButton } from './UpvoteButton';
import { MessageSquare, User, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractTags } from '@/utils/tagExtractor';

export function QuestionCard({ question, onClick, onUpvote, onRemoveUpvote, isUpvoted = false }) {
  const formattedDate = new Date(question.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const tags = extractTags(question.title, 2);

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
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {question.body}
            </p>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex gap-1 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-2.5 w-2.5 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

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
