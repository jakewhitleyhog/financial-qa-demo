/**
 * QuestionForm Component
 * Form for submitting new questions to the forum
 */

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export function QuestionForm({ onSubmit, onCancel }) {
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !body.trim()) {
      setError('Title and question body are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        userName: userName.trim() || 'Anonymous',
        title: title.trim(),
        body: body.trim()
      });

      // Reset form
      setUserName('');
      setTitle('');
      setBody('');
    } catch (err) {
      setError(err.message || 'Failed to submit question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name (optional)
          </label>
          <Input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Anonymous"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question about?"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
            Question Details <span className="text-red-500">*</span>
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Provide more details about your question..."
            disabled={isSubmitting}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Post Question'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default QuestionForm;
