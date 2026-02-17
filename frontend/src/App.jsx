/**
 * Main App Component
 * Router configuration and layout
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ForumPage } from './pages/ForumPage';
import { ChatPage } from './pages/ChatPage';
import { Button } from './components/ui/Button';
import { Home, MessageSquare, Bot } from 'lucide-react';
import { cn } from './lib/utils';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            Customer Q&A Platform
          </Link>

          <div className="flex gap-2">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>

            <Link to="/forum">
              <Button
                variant={isActive('/forum') ? 'default' : 'ghost'}
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Forum
              </Button>
            </Link>

            <Link to="/chat">
              <Button
                variant={isActive('/chat') ? 'default' : 'ghost'}
                size="sm"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Chat
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Built with React + Vite + Tailwind CSS + Anthropic Claude</p>
          <p className="mt-1">
            Demo webapp showcasing text-to-SQL with intelligent routing
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
