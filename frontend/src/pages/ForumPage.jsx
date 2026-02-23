/**
 * ForumPage Component
 * Main forum page with question list, detail view, and question submission
 */

import { useState } from 'react';
import { QuestionList } from '../components/forum/QuestionList';
import { QuestionDetail } from '../components/forum/QuestionDetail';
import { QuestionForm } from '../components/forum/QuestionForm';
import { forumAPI } from '../services/api';

export function ForumPage() {
  const [view, setView] = useState('list'); // 'list', 'detail', 'new'
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleQuestionClick = (questionId) => {
    setSelectedQuestionId(questionId);
    setView('detail');
  };

  const handleNewQuestion = () => {
    setView('new');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedQuestionId(null);
  };

  const handleSubmitQuestion = async (data) => {
    try {
      await forumAPI.createQuestion(data.title, data.body);
      setView('list');
      setRefreshTrigger(prev => prev + 1); // Trigger refresh of question list
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {view === 'list' && (
          <QuestionList
            onQuestionClick={handleQuestionClick}
            onNewQuestion={handleNewQuestion}
            refreshTrigger={refreshTrigger}
          />
        )}

        {view === 'detail' && selectedQuestionId && (
          <QuestionDetail
            questionId={selectedQuestionId}
            onBack={handleBackToList}
          />
        )}

        {view === 'new' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Ask a Question</h1>
            <QuestionForm
              onSubmit={handleSubmitQuestion}
              onCancel={handleBackToList}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ForumPage;
