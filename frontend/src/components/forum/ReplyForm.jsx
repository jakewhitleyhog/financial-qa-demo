/**
 * ReplyForm Component
 * Form for submitting replies/comments. User identity from auth context.
 */

import { useState } from 'react';
import { Button } from '../ui/Button';

export function ReplyForm({ onSubmit, onCancel, parentReplyId = null, placeholder = "Write your reply..." }) {
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!body.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        body: body.trim(),
        parentReplyId
      });

      setBody('');
    } catch (err) {
      setError(err.message || 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          required
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm disabled:bg-muted disabled:cursor-not-allowed bg-background text-foreground"
        />
      </div>

      {error && (
        <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Reply'}
        </Button>
      </div>
    </form>
  );
}

export default ReplyForm;
