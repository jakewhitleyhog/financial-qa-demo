/**
 * ReplyForm Component
 * Form for submitting replies/comments to questions or other replies
 */

import { useState } from 'react';
import { Button } from '../ui/Button';

export function ReplyForm({ onSubmit, onCancel, parentReplyId = null, placeholder = "Write your reply..." }) {
  const [userName, setUserName] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showUserName, setShowUserName] = useState(false);

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
        userName: userName.trim() || 'Anonymous',
        body: body.trim(),
        parentReplyId
      });

      // Reset form
      setUserName('');
      setBody('');
      setShowUserName(false);
    } catch (err) {
      setError(err.message || 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {showUserName ? (
        <div>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name (optional)"
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100"
          />
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setShowUserName(true)}
            className="text-xs text-green-600 hover:text-green-700"
          >
            Add your name
          </button>
        </div>
      )}

      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
