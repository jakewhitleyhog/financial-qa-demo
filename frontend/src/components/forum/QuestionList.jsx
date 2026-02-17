/**
 * QuestionList Component
 * Lists forum questions with sorting and pagination
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { QuestionCard } from './QuestionCard';
import { useQuestions } from '@/hooks/useQuestions';
import { Loader2, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/Alert';

export function QuestionList({ onQuestionClick, onNewQuestion }) {
  const [sortBy, setSortBy] = useState('recent');
  const { questions, loading, error, loadMore, pagination } = useQuestions(sortBy, 20);

  // Track upvoted questions (using localStorage for persistence)
  const [upvotedQuestions, setUpvotedQuestions] = useState(() => {
    const stored = localStorage.getItem('upvotedQuestions');
    return stored ? JSON.parse(stored) : {};
  });

  const handleUpvote = async (questionId) => {
    // For now, just track locally (would call API in full implementation)
    const newUpvoted = { ...upvotedQuestions, [questionId]: true };
    setUpvotedQuestions(newUpvoted);
    localStorage.setItem('upvotedQuestions', JSON.stringify(newUpvoted));
  };

  const handleRemoveUpvote = async (questionId) => {
    const newUpvoted = { ...upvotedQuestions };
    delete newUpvoted[questionId];
    setUpvotedQuestions(newUpvoted);
    localStorage.setItem('upvotedQuestions', JSON.stringify(newUpvoted));
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
                isUpvoted={upvotedQuestions[question.id]}
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
