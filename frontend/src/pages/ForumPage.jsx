/**
 * ForumPage Component
 * Main forum page with question list
 */

import { QuestionList } from '../components/forum/QuestionList';

export function ForumPage() {
  const handleQuestionClick = (questionId) => {
    // Navigate to question detail (would use router in full implementation)
    console.log('View question:', questionId);
  };

  const handleNewQuestion = () => {
    // Open new question modal/form (would implement in full version)
    alert('New question form would open here');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <QuestionList
          onQuestionClick={handleQuestionClick}
          onNewQuestion={handleNewQuestion}
        />
      </div>
    </div>
  );
}

export default ForumPage;
