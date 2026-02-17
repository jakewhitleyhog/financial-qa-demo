/**
 * UpvoteButton Component
 * Reddit-style upvote button
 */

import { useState } from 'react';
import { Button } from '../ui/Button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UpvoteButton({
  upvotes,
  onUpvote,
  onRemoveUpvote,
  isUpvoted = false,
  disabled = false
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (isUpvoted) {
        await onRemoveUpvote?.();
      } else {
        await onUpvote?.();
      }
    } catch (error) {
      console.error('Upvote error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={cn(
          'h-8 w-8',
          isUpvoted && 'text-orange-500 hover:text-orange-600'
        )}
      >
        <ArrowUp className={cn('h-5 w-5', isUpvoted && 'fill-current')} />
      </Button>
      <span className={cn('text-sm font-medium', isUpvoted && 'text-orange-500')}>
        {upvotes}
      </span>
    </div>
  );
}

export default UpvoteButton;
