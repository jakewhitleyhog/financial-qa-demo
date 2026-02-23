/**
 * UpvoteButton Component
 * Reddit-style upvote button
 */

import { useState } from 'react';
import { Button } from '../ui/Button';
import { AnimatedNumber } from '../ui/AnimatedNumber';
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

  const handleClick = async (e) => {
    e.stopPropagation();
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
          isUpvoted && 'text-primary hover:text-primary/80'
        )}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      <AnimatedNumber
        value={upvotes}
        className={cn('text-sm font-medium', isUpvoted && 'text-primary')}
      />
    </div>
  );
}

export default UpvoteButton;
