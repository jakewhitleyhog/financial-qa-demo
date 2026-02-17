/**
 * Routing Routes
 * Defines API endpoints for escalation and routing management
 */

import express from 'express';
import {
  escalateQuestion,
  listEscalatedQuestions,
  getEscalatedQuestion,
  updateEscalatedQuestion,
  getEscalationAnalytics
} from '../controllers/routingController.js';

const router = express.Router();

// Escalation management
router.post('/escalate', escalateQuestion);
router.get('/escalated', listEscalatedQuestions);
router.get('/escalated/:id', getEscalatedQuestion);
router.patch('/escalated/:id', updateEscalatedQuestion);

// Analytics
router.get('/analytics', getEscalationAnalytics);

export default router;
