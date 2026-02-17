/**
 * Forum Routes
 * Defines API endpoints for forum Q&A functionality
 */

import express from 'express';
import {
  createQuestion,
  listQuestions,
  getQuestion,
  addReply,
  upvoteQuestion,
  removeUpvoteQuestion,
  upvoteReply
} from '../controllers/forumController.js';

const router = express.Router();

// Questions
router.post('/questions', createQuestion);
router.get('/questions', listQuestions);
router.get('/questions/:id', getQuestion);

// Replies
router.post('/questions/:id/reply', addReply);

// Upvoting
router.post('/questions/:id/upvote', upvoteQuestion);
router.delete('/questions/:id/upvote', removeUpvoteQuestion);
router.post('/replies/:id/upvote', upvoteReply);

export default router;
