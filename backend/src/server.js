/**
 * Express Server - Main application entry point
 *
 * This server provides REST API endpoints for:
 * - Chat (LLM-powered text-to-SQL queries)
 * - Forum (Q&A with upvoting and replies)
 * - Routing (Escalation management)
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

// Import database initialization
import { initializeDatabase } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import forumRoutes from './routes/forum.js';
import routingRoutes from './routes/routing.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/authMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Cookie parsing
app.use(cookieParser());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for chat endpoints (prevent API abuse)
const chatLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (unauthenticated)
app.use('/api/auth', authRoutes);

// Protected API routes
app.use('/api/chat', requireAuth, chatLimiter, chatRoutes);
app.use('/api/forum', requireAuth, forumRoutes);
app.use('/api/routing', requireAuth, routingRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER INITIALIZATION
// ============================================

/**
 * Initialize database and start server
 */
async function startServer() {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log('  Investor Deal Portal - Backend Server');
      console.log('========================================');
      console.log(`  Deal: ${process.env.DEAL_NAME || 'Unconfigured'}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port: ${PORT}`);
      console.log(`  Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('');
      console.log('  API Endpoints:');
      console.log(`    - Health: http://localhost:${PORT}/health`);
      console.log(`    - Auth: http://localhost:${PORT}/api/auth`);
      console.log(`    - Chat: http://localhost:${PORT}/api/chat`);
      console.log(`    - Forum: http://localhost:${PORT}/api/forum`);
      console.log(`    - Routing: http://localhost:${PORT}/api/routing`);
      console.log('');
      console.log('  Server is ready to accept requests!');
      console.log('========================================');
      console.log('');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
