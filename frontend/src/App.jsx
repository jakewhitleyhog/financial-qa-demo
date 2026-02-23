import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { ForumPage } from './pages/ForumPage';
import { ChatPage } from './pages/ChatPage';
import { LoginPage } from './pages/LoginPage';
import { VerifyPage } from './pages/VerifyPage';
import { Button } from './components/ui/Button';
import { Home, MessageSquare, Bot, LogOut, Loader2 } from 'lucide-react';

const DEAL_NAME = import.meta.env.VITE_DEAL_NAME || 'Investor Portal';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Navigation() {
  const location = useLocation();
  const { investor, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <Link to="/" className="text-lg font-bold text-foreground">
              {DEAL_NAME}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant={isActive('/') ? 'default' : 'ghost'} size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>

            <Link to="/forum">
              <Button variant={isActive('/forum') ? 'default' : 'ghost'} size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Q&A
              </Button>
            </Link>

            <Link to="/chat">
              <Button variant={isActive('/chat') ? 'default' : 'ghost'} size="sm">
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </Link>

            <div className="ml-4 pl-4 border-l flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {investor?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={logout} title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/verify" element={<VerifyPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigation />
              <main><HomePage /></main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forum"
          element={
            <ProtectedRoute>
              <Navigation />
              <main><ForumPage /></main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Navigation />
              <main><ChatPage /></main>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
