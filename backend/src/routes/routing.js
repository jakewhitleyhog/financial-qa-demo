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
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Escalation management — list/update/analytics require admin (GP) role
router.post('/escalate', escalateQuestion);            // investors can self-escalate
router.get('/escalated', requireAdmin, listEscalatedQuestions);
router.get('/escalated/:id', requireAdmin, getEscalatedQuestion);
router.patch('/escalated/:id', requireAdmin, updateEscalatedQuestion);

// Analytics — admin only
router.get('/analytics', requireAdmin, getEscalationAnalytics);

export default router;
