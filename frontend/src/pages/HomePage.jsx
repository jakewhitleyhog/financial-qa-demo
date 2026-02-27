/**
 * HomePage Component
 * Investor portal landing page with deal overview and navigation
 */

import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const DEAL_NAME = import.meta.env.VITE_DEAL_NAME || 'Investor Portal';

export function HomePage() {
  const { investor } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Welcome, {investor?.name?.split(' ')[0]}
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            {DEAL_NAME}
          </p>
          <p className="text-muted-foreground">
            Access deal performance data, ask questions, and connect with fellow investors
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Assistant card */}
          <Card>
            <CardHeader>
              <CardTitle className="mb-2">AI Deal Assistant</CardTitle>
              <CardDescription>
                Get instant answers about deal performance powered by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                <li>- Ask about well economics and production</li>
                <li>- View projected returns and IRR</li>
                <li>- Analyze price sensitivities and capex</li>
              </ul>
              <Link to="/chat">
                <Button className="w-full">
                  Ask the AI Assistant
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Forum card */}
          <Card>
            <CardHeader>
              <CardTitle className="mb-2">Investor Q&A</CardTitle>
              <CardDescription>
                Post questions and see what other investors are asking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                <li>- Upvote questions you share</li>
                <li>- Get answers from the GP team</li>
                <li>- Browse by topic or popularity</li>
              </ul>
              <Link to="/forum">
                <Button variant="outline" className="w-full">
                  Browse Q&A Board
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Deal highlight */}
        <Card className="mt-8 border-primary/30">
          <CardHeader>
            <CardTitle className="mb-2">Quick Start</CardTitle>
            <CardDescription>
              Try asking the AI assistant these questions about the deal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                'What are the Tier 1 well economics?',
                'Show me projected production by year',
                'What is the target IRR and MOIC?',
                'What are the price sensitivities?',
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => navigate('/chat', { state: { prefill: question } })}
                  className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left cursor-pointer"
                >
                  "{question}"
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HomePage;
