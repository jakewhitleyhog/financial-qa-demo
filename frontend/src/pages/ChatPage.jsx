/**
 * ChatPage Component
 * Main chat page with AI assistant
 */

import { ChatInterface } from '../components/chat/ChatInterface';

export function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <ChatInterface />
      </div>
    </div>
  );
}

export default ChatPage;
