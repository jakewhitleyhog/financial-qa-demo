/**
 * QuestionList Component
 * Lists forum questions with sorting and pagination
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { QuestionCard } from './QuestionCard';
import { useQuestions } from '@/hooks/useQuestions';
import { forumAPI } from '@/services/api';
import { Loader2, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/Alert';

export function QuestionList({ onQuestionClick, onNewQuestion, refreshTrigger }) {
  const [sortBy, setSortBy] = useState('recent');
  const { questions, setQuestions, loading, error, loadMore, pagination, refresh } = useQuestions(sortBy, 20);

  // Track upvoted questions (using localStorage for persistence)
  const [upvotedQuestions, setUpvotedQuestions] = useState(() => {
    const stored = localStorage.getItem('upvoted_questions');
    return stored ? JSON.parse(stored) : [];
  });

  // Session ID for API calls
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('forum_session_id');
    if (!id) {
      id = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('forum_session_id', id);
    }
    return id;
  });

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refresh();
    }
  }, [refreshTrigger, refresh]);

  const handleUpvote = async (questionId) => {
    if (upvotedQuestions.includes(questionId)) return;

    try {
      const result = await forumAPI.upvoteQuestion(questionId, sessionId);

      // Update local state
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, upvotes: result.upvotes } : q
      ));

      // Update localStorage
      const newUpvoted = [...upvotedQuestions, questionId];
      setUpvotedQuestions(newUpvoted);
      localStorage.setItem('upvoted_questions', JSON.stringify(newUpvoted));
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleRemoveUpvote = async (questionId) => {
    if (!upvotedQuestions.includes(questionId)) return;

    try {
      const result = await forumAPI.removeUpvoteQuestion(questionId, sessionId);

      // Update local state
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, upvotes: result.upvotes } : q
      ));

      // Update localStorage
      const newUpvoted = upvotedQuestions.filter(id => id !== questionId);
      setUpvotedQuestions(newUpvoted);
      localStorage.setItem('upvoted_questions', JSON.stringify(newUpvoted));
    } catch (err) {
      console.error('Failed to remove upvote:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Forum Questions</CardTitle>
          <Button onClick={onNewQuestion} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Question
          </Button>
        </div>

        {/* Sorting tabs */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            Recent
          </Button>
          <Button
            variant={sortBy === 'popular' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('popular')}
          >
            Popular
          </Button>
          <Button
            variant={sortBy === 'unanswered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('unanswered')}
          >
            Unanswered
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && questions.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading questions...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No questions yet</p>
            <Button onClick={onNewQuestion} variant="outline">
              Be the first to ask!
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onClick={() => onQuestionClick?.(question.id)}
                onUpvote={handleUpvote}
                onRemoveUpvote={handleRemoveUpvote}
                isUpvoted={upvotedQuestions.includes(question.id)}
              />
            ))}

            {/* Load more button */}
            {pagination?.hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QuestionList;
