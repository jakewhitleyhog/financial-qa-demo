/**
 * HomePage Component
 * Landing page with navigation to Forum and Chat
 */

import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MessageSquare, Bot, TrendingUp } from 'lucide-react';

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Customer Q&A Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Community discussions + AI-powered financial insights
          </p>
          <p className="text-muted-foreground">
            Ask questions about financial data, forum activity, and escalation trends
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Forum card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                <CardTitle>Community Forum</CardTitle>
              </div>
              <CardDescription>
                Ask questions, share insights, and engage with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                <li>• Reddit-style upvoting</li>
                <li>• Threaded discussions</li>
                <li>• Sort by popularity or recency</li>
              </ul>
              <Link to="/forum">
                <Button className="w-full">
                  Browse Forum
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Chat card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-6 w-6 text-primary" />
                <CardTitle>AI Assistant</CardTitle>
              </div>
              <CardDescription>
                Natural language queries powered by Claude
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                <li>• Text-to-SQL generation</li>
                <li>• Query financial, forum, and routing data</li>
                <li>• Intelligent confidence scoring</li>
              </ul>
              <Link to="/chat">
                <Button className="w-full">
                  Start Chatting
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Unique feature highlight */}
        <Card className="mt-8 border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <CardTitle>🎯 Unique Feature: Universal Data Querying</CardTitle>
            </div>
            <CardDescription>
              Unlike typical chatbots, our AI can query ALL data in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">Example queries:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>💰 "What was TechFlow's Q3 2024 revenue?"</li>
                  <li>💬 "What are the top 5 most upvoted questions?"</li>
                  <li>📊 "How many questions were escalated this week?"</li>
                  <li>🔄 "What financial topics get the most forum discussion?"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HomePage;
