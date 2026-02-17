/**
 * Routing Controller - Handles escalated questions and routing management
 *
 * This controller manages:
 * - Manual question escalation
 * - Listing escalated questions
 * - Updating escalation status
 * - Viewing escalation analytics
 */

import { query, run } from '../config/database.js';

/**
 * Manually escalate a question to human review
 * POST /api/routing/escalate
 */
export async function escalateQuestion(req, res) {
  try {
    const {
      sourceType,      // 'chat' or 'forum'
      sourceId,        // message ID or question ID
      sessionId,       // chat session ID (null for forum)
      userName,
      questionText,
      reason
    } = req.body;

    // Validation
    if (!sourceType || !sourceId || !questionText) {
      return res.status(400).json({
        success: false,
        error: 'sourceType, sourceId, and questionText are required'
      });
    }

    if (!['chat', 'forum'].includes(sourceType)) {
      return res.status(400).json({
        success: false,
        error: 'sourceType must be "chat" or "forum"'
      });
    }

    const result = run(
      `INSERT INTO escalated_questions (
        source_type, source_id, session_id, user_name,
        question_text, escalation_reason, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      [
        sourceType,
        sourceId,
        sessionId || null,
        userName || 'Anonymous',
        questionText,
        reason || 'Manual escalation requested by user'
      ]
    );

    res.status(201).json({
      success: true,
      escalation: {
        id: result.lastID,
        sourceType,
        sourceId,
        questionText,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Escalate question error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to escalate question'
    });
  }
}

/**
 * Get list of escalated questions
 * GET /api/routing/escalated
 */
export async function listEscalatedQuestions(req, res) {
  try {
    const status = req.query.status; // 'pending', 'in_progress', 'resolved', or null for all
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    let whereClause = '';
    const params = [];

    if (status) {
      whereClause = 'WHERE status = ?';
      params.push(status);
    }

    params.push(limit, offset);

    const escalated = query(
      `SELECT * FROM escalated_questions
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      params
    );

    // Get total count
    const countParams = status ? [status] : [];
    const countResult = query(
      `SELECT COUNT(*) as total FROM escalated_questions ${whereClause}`,
      countParams
    );

    res.json({
      success: true,
      escalatedQuestions: escalated.map(eq => ({
        id: eq.id,
        sourceType: eq.source_type,
        sourceId: eq.source_id,
        sessionId: eq.session_id,
        userName: eq.user_name,
        questionText: eq.question_text,
        escalationReason: eq.escalation_reason,
        confidenceScore: eq.confidence_score,
        status: eq.status,
        assignedTo: eq.assigned_to,
        resolutionNotes: eq.resolution_notes,
        createdAt: eq.created_at,
        resolvedAt: eq.resolved_at
      })),
      pagination: {
        total: countResult[0].total,
        limit,
        offset,
        hasMore: offset + limit < countResult[0].total
      }
    });

  } catch (error) {
    console.error('List escalated questions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list escalated questions'
    });
  }
}

/**
 * Get a specific escalated question
 * GET /api/routing/escalated/:id
 */
export async function getEscalatedQuestion(req, res) {
  try {
    const { id } = req.params;

    const escalated = query(
      `SELECT * FROM escalated_questions WHERE id = ?`,
      [id]
    );

    if (escalated.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Escalated question not found'
      });
    }

    const eq = escalated[0];

    res.json({
      success: true,
      escalatedQuestion: {
        id: eq.id,
        sourceType: eq.source_type,
        sourceId: eq.source_id,
        sessionId: eq.session_id,
        userName: eq.user_name,
        questionText: eq.question_text,
        escalationReason: eq.escalation_reason,
        confidenceScore: eq.confidence_score,
        status: eq.status,
        assignedTo: eq.assigned_to,
        resolutionNotes: eq.resolution_notes,
        createdAt: eq.created_at,
        resolvedAt: eq.resolved_at
      }
    });

  } catch (error) {
    console.error('Get escalated question error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve escalated question'
    });
  }
}

/**
 * Update escalated question status
 * PATCH /api/routing/escalated/:id
 */
export async function updateEscalatedQuestion(req, res) {
  try {
    const { id } = req.params;
    const { status, assignedTo, resolutionNotes } = req.body;

    // Verify exists
    const existing = query(
      `SELECT * FROM escalated_questions WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Escalated question not found'
      });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const params = [];

    if (status) {
      if (!['pending', 'in_progress', 'resolved'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be pending, in_progress, or resolved'
        });
      }
      updates.push('status = ?');
      params.push(status);

      // Set resolved_at if status is resolved
      if (status === 'resolved') {
        updates.push('resolved_at = datetime(\'now\')');
      }
    }

    if (assignedTo !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assignedTo);
    }

    if (resolutionNotes !== undefined) {
      updates.push('resolution_notes = ?');
      params.push(resolutionNotes);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    params.push(id);

    run(
      `UPDATE escalated_questions SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated record
    const updated = query(
      `SELECT * FROM escalated_questions WHERE id = ?`,
      [id]
    );

    const eq = updated[0];

    res.json({
      success: true,
      escalatedQuestion: {
        id: eq.id,
        sourceType: eq.source_type,
        sourceId: eq.source_id,
        sessionId: eq.session_id,
        userName: eq.user_name,
        questionText: eq.question_text,
        escalationReason: eq.escalation_reason,
        confidenceScore: eq.confidence_score,
        status: eq.status,
        assignedTo: eq.assigned_to,
        resolutionNotes: eq.resolution_notes,
        createdAt: eq.created_at,
        resolvedAt: eq.resolved_at
      }
    });

  } catch (error) {
    console.error('Update escalated question error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update escalated question'
    });
  }
}

/**
 * Get escalation analytics/statistics
 * GET /api/routing/analytics
 */
export async function getEscalationAnalytics(req, res) {
  try {
    // Total escalations
    const totalResult = query(`SELECT COUNT(*) as total FROM escalated_questions`);
    const total = totalResult[0].total;

    // By status
    const byStatus = query(`
      SELECT status, COUNT(*) as count
      FROM escalated_questions
      GROUP BY status
    `);

    // By source type
    const bySource = query(`
      SELECT source_type, COUNT(*) as count
      FROM escalated_questions
      GROUP BY source_type
    `);

    // Recent escalations (last 7 days)
    const recentResult = query(`
      SELECT COUNT(*) as count
      FROM escalated_questions
      WHERE created_at > date('now', '-7 days')
    `);

    // Average confidence score of escalated questions
    const avgConfidenceResult = query(`
      SELECT AVG(confidence_score) as avg_confidence
      FROM escalated_questions
      WHERE confidence_score IS NOT NULL
    `);

    // Top escalation reasons
    const topReasons = query(`
      SELECT escalation_reason, COUNT(*) as count
      FROM escalated_questions
      GROUP BY escalation_reason
      ORDER BY count DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      analytics: {
        total,
        byStatus: byStatus.reduce((acc, row) => {
          acc[row.status] = row.count;
          return acc;
        }, {}),
        bySource: bySource.reduce((acc, row) => {
          acc[row.source_type] = row.count;
          return acc;
        }, {}),
        recentCount: recentResult[0].count,
        averageConfidence: avgConfidenceResult[0].avg_confidence,
        topReasons: topReasons.map(r => ({
          reason: r.escalation_reason,
          count: r.count
        }))
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
}

export default {
  escalateQuestion,
  listEscalatedQuestions,
  getEscalatedQuestion,
  updateEscalatedQuestion,
  getEscalationAnalytics
};
