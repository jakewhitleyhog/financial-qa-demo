/**
 * QuestionList Component
 * Lists forum questions with sorting and pagination
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QuestionCard } from './QuestionCard';
import { QuestionSkeleton } from '../ui/Skeleton';
import { useQuestions } from '@/hooks/useQuestions';
import { forumAPI } from '@/services/api';
import { Loader2, PlusCircle, Search } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/Alert';

export function QuestionList({ onQuestionClick, onNewQuestion, refreshTrigger }) {
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter questions based on search query
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;

    const query = searchQuery.toLowerCase();
    return questions.filter(q =>
      q.title.toLowerCase().includes(query) ||
      q.body.toLowerCase().includes(query) ||
      q.userName.toLowerCase().includes(query)
    );
  }, [questions, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Forum Questions</CardTitle>
          <Button onClick={onNewQuestion} size="sm" className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Question
          </Button>
        </div>

        {/* Search bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sorting tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
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
          <Button
            variant={sortBy === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('active')}
          >
            Active
          </Button>
          <Button
            variant={sortBy === 'most_replies' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('most_replies')}
          >
            Most Replies
          </Button>
        </div>

        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            {filteredQuestions.length} result{filteredQuestions.length !== 1 ? 's' : ''} found
          </div>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && questions.length === 0 ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <QuestionSkeleton key={i} />
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? (
              <>
                <p className="mb-4">No questions match your search</p>
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <p className="mb-4">No questions yet</p>
                <Button onClick={onNewQuestion} variant="outline">
                  Be the first to ask!
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((question) => (
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
