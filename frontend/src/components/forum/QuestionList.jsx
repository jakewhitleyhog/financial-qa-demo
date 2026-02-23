/**
 * QuestionList Component
 * Lists forum questions with sorting, search, and server-driven upvote state.
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

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refresh();
    }
  }, [refreshTrigger, refresh]);

  const handleUpvote = async (questionId) => {
    try {
      const result = await forumAPI.upvoteQuestion(questionId);
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, upvotes: result.upvotes, isUpvoted: true } : q
      ));
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleRemoveUpvote = async (questionId) => {
    try {
      const result = await forumAPI.removeUpvoteQuestion(questionId);
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, upvotes: result.upvotes, isUpvoted: false } : q
      ));
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
          <CardTitle>Investor Q&A</CardTitle>
          <Button onClick={onNewQuestion} size="sm" className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Question
          </Button>
        </div>

        {/* Search bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          {[
            { key: 'recent', label: 'All' },
            { key: 'popular', label: 'Popular' },
            { key: 'most_replies', label: 'Most Replies' },
            { key: 'active', label: 'Active' },
            { key: 'unanswered', label: 'Unanswered' },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={sortBy === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {searchQuery && (
          <div className="mt-2 text-sm text-muted-foreground">
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
                isUpvoted={question.isUpvoted || false}
              />
            ))}

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
