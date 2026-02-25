/**
 * QuestionDetail Component
 * Displays a full question with replies. Upvote state is server-driven (no localStorage).
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
      setIsUpvoted(data.question.isUpvoted || false);
    } catch (err) {
      setError(err.message || 'Failed to load question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      if (isUpvoted) {
        const result = await forumAPI.removeUpvoteQuestion(questionId);
        setQuestion(prev => ({ ...prev, upvotes: result.upvotes }));
        setIsUpvoted(false);
      } else {
        const result = await forumAPI.upvoteQuestion(questionId);
        setQuestion(prev => ({ ...prev, upvotes: result.upvotes }));
        setIsUpvoted(true);
      }
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
    }
  };

  const handleAddReply = async (data) => {
    const result = await forumAPI.addReply(questionId, data.body, data.parentReplyId);
    setReplies(prev => [...prev, result.reply]);
    setShowReplyForm(false);
  };

  const handleUpvoteReply = async (replyId) => {
    try {
      const result = await forumAPI.upvoteReply(replyId);
      setReplies(prev => prev.map(r =>
        r.id === replyId ? { ...r, upvotes: result.upvotes, isUpvoted: true } : r
      ));
    } catch (err) {
      console.error('Failed to upvote reply:', err);
    }
  };

  const handleRemoveUpvoteReply = async (replyId) => {
    try {
      const result = await forumAPI.removeUpvoteReply(replyId);
      setReplies(prev => prev.map(r =>
        r.id === replyId ? { ...r, upvotes: result.upvotes, isUpvoted: false } : r
      ));
    } catch (err) {
      console.error('Failed to remove reply upvote:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading question...</div>
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
        <div className="text-muted-foreground mb-4">Question not found</div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Questions
      </Button>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-2 justify-start sm:justify-start">
            <button
              onClick={handleUpvote}
              className={`p-2 rounded-lg transition-colors ${
                isUpvoted
                  ? 'text-primary bg-primary/10 hover:bg-primary/20'
                  : 'text-muted-foreground hover:text-primary hover:bg-muted'
              }`}
              title={isUpvoted ? 'Remove upvote' : 'Upvote this question'}
            >
              <ArrowUp className="h-6 w-6" />
            </button>
            <span className="text-lg font-bold text-foreground">
              {question.upvotes}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold text-foreground">
                {question.title}
              </h1>
              {question.isAnswered && (
                <Badge variant="success">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Answered
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 flex-wrap">
              <span>Asked by <strong>{question.userName}</strong></span>
              <span>-</span>
              <span>{new Date(question.createdAt).toLocaleString()}</span>
              <span>-</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </span>
            </div>

            <p className="text-foreground whitespace-pre-wrap mb-4">
              {question.body}
            </p>

            {!showReplyForm && (
              <Button onClick={() => setShowReplyForm(true)} variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Write a Reply
              </Button>
            )}

            {showReplyForm && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
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

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        <ReplyThread
          replies={replies}
          onAddReply={handleAddReply}
          onUpvote={handleUpvoteReply}
          onRemoveUpvote={handleRemoveUpvoteReply}
        />
      </Card>
    </div>
  );
}

export default QuestionDetail;
