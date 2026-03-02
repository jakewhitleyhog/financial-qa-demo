/**
 * Chat Routes
 * Defines API endpoints for chat functionality
 */

import express from 'express';
import {
  createSession,
  getSession,
  sendMessage,
  streamMessage,
  listSessions
} from '../controllers/chatController.js';

const router = express.Router();

// Session management
router.post('/sessions', createSession);
router.get('/sessions', listSessions);
router.get('/sessions/:sessionId', getSession);

// Messaging
router.post('/sessions/:sessionId/message', sendMessage);
router.post('/sessions/:sessionId/message/stream', streamMessage);

export default router;
