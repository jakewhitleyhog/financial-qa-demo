/**
 * QuestionDetail Component
 * Displays a full question with all replies and allows adding new replies
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ReplyForm } from './ReplyForm';
import { ReplyThread } from './ReplyThread';
import { forumAPI } from '../../services/api';
import { ArrowLeft, ArrowUp, MessageSquare, CheckCircle } from 'lucide-react';

export function QuestionDetail({ questionId, onBack }) {
  const [question, setQuestion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('forum_session_id');
    if (!id) {
      id = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('forum_session_id', id);
    }
    return id;
  });

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await forumAPI.getQuestion(questionId);
      setQuestion(data.question);
      setReplies(data.replies || []);

      // Check if already upvoted
      const upvoted = JSON.parse(localStorage.getItem('upvoted_questions') || '[]');
      setIsUpvoted(upvoted.includes(questionId));
    } catch (err) {
      setError(err.message || 'Failed to load question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      if (isUpvoted) {
        // Remove upvote
        const result = await forumAPI.removeUpvoteQuestion(questionId, sessionId);
        setQuestion(prev => ({ ...prev, upvotes: result.upvotes }));
        setIsUpvoted(false);

        // Update localStorage
        const upvoted = JSON.parse(localStorage.getItem('upvoted_questions') || '[]');
        const filtered = upvoted.filter(id => id !== questionId);
        localStorage.setItem('upvoted_questions', JSON.stringify(filtered));
      } else {
        // Add upvote
        const result = await forumAPI.upvoteQuestion(questionId, sessionId);
        setQuestion(prev => ({ ...prev, upvotes: result.upvotes }));
        setIsUpvoted(true);

        // Save to localStorage
        const upvoted = JSON.parse(localStorage.getItem('upvoted_questions') || '[]');
        upvoted.push(questionId);
        localStorage.setItem('upvoted_questions', JSON.stringify(upvoted));
      }
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
    }
  };

  const handleAddReply = async (data) => {
    try {
      const result = await forumAPI.addReply(questionId, data.userName, data.body, data.parentReplyId);
      setReplies(prev => [...prev, result.reply]);
      setShowReplyForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpvoteReply = async (replyId) => {
    try {
      const result = await forumAPI.upvoteReply(replyId, sessionId);
      setReplies(prev => prev.map(r =>
        r.id === replyId ? { ...r, upvotes: result.upvotes } : r
      ));
    } catch (err) {
      console.error('Failed to upvote reply:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading question...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Question not found</div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Questions
      </Button>

      {/* Question card */}
      <Card className="p-6">
        <div className="flex gap-4">
          {/* Upvote section */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleUpvote}
              className={`p-2 rounded-lg transition-colors ${
                isUpvoted
                  ? 'text-green-600 bg-green-50 hover:bg-green-100'
                  : 'text-gray-400 hover:text-green-600 hover:bg-gray-100'
              }`}
              title={isUpvoted ? 'Remove upvote' : 'Upvote this question'}
            >
              <ArrowUp className="h-6 w-6" />
            </button>
            <span className="text-lg font-bold text-gray-700">
              {question.upvotes}
            </span>
          </div>

          {/* Question content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {question.title}
              </h1>
              {question.isAnswered && (
                <Badge variant="success">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Answered
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
              <span>Asked by <strong>{question.userName}</strong></span>
              <span>•</span>
              <span>{new Date(question.createdAt).toLocaleString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </span>
            </div>

            <p className="text-gray-800 whitespace-pre-wrap mb-4">
              {question.body}
            </p>

            {/* Reply button */}
            {!showReplyForm && (
              <Button
                onClick={() => setShowReplyForm(true)}
                variant="outline"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Write a Reply
              </Button>
            )}

            {/* Reply form */}
            {showReplyForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <ReplyForm
                  onSubmit={handleAddReply}
                  onCancel={() => setShowReplyForm(false)}
                  placeholder="Share your answer or insight..."
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Replies section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        <ReplyThread
          replies={replies}
          onAddReply={handleAddReply}
          onUpvote={handleUpvoteReply}
          sessionId={sessionId}
        />
      </Card>
    </div>
  );
}

export default QuestionDetail;
