/**
 * Chat Controller - Handles chat session and message endpoints
 *
 * This controller orchestrates the complete text-to-SQL pipeline:
 * 1. Receive user question
 * 2. Process through LLM service (text-to-SQL)
 * 3. Analyze routing (confidence, complexity, escalation)
 * 4. Store message in database
 * 5. Return response with metadata
 */

import { v4 as uuidv4 } from 'uuid';
import { query, run } from '../config/database.js';
import { processQuestion } from '../services/llmService.js';
import { analyzeRouting } from '../services/routingService.js';

/**
 * Create a new chat session
 * POST /api/chat/sessions
 */
export async function createSession(req, res) {
  try {
    const { userName } = req.body;
    const sessionId = `sess_${uuidv4()}`;

    const result = run(
      `INSERT INTO chat_sessions (session_id, user_name, started_at, last_activity)
       VALUES (?, ?, datetime('now'), datetime('now'))`,
      [sessionId, userName || 'Anonymous']
    );

    res.status(201).json({
      success: true,
      session: {
        id: result.lastID,
        sessionId,
        userName: userName || 'Anonymous',
        startedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chat session'
    });
  }
}

/**
 * Get chat session history
 * GET /api/chat/sessions/:sessionId
 */
export async function getSession(req, res) {
  try {
    const { sessionId } = req.params;

    // Get session info
    const sessions = query(
      `SELECT * FROM chat_sessions WHERE session_id = ?`,
      [sessionId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Get all messages for this session
    const messages = query(
      `SELECT * FROM chat_messages
       WHERE session_id = ?
       ORDER BY created_at ASC`,
      [sessionId]
    );

    res.json({
      success: true,
      session: sessions[0],
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        metadata: msg.role === 'assistant' ? {
          generatedSql: msg.generated_sql,
          confidenceScore: msg.confidence_score,
          complexityLevel: msg.complexity_level,
          isInScope: Boolean(msg.is_in_scope),
          needsEscalation: Boolean(msg.needs_escalation),
          escalationReason: msg.escalation_reason
        } : null,
        createdAt: msg.created_at
      }))
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session'
    });
  }
}

/**
 * Send a message and get LLM response
 * POST /api/chat/sessions/:sessionId/message
 */
export async function sendMessage(req, res) {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Verify session exists
    const sessions = query(
      `SELECT * FROM chat_sessions WHERE session_id = ?`,
      [sessionId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Store user message
    const userMessageResult = run(
      `INSERT INTO chat_messages (session_id, role, content, created_at)
       VALUES (?, 'user', ?, datetime('now'))`,
      [sessionId, message]
    );

    // Process the question through LLM service
    const llmResponse = await processQuestion(message);

    // Analyze routing for the response
    let routingAnalysis;
    if (llmResponse.success) {
      routingAnalysis = await analyzeRouting({
        userQuestion: message,
        sqlQuery: llmResponse.metadata?.generatedSql,
        results: llmResponse.metadata?.sqlResults || [],
        isInScope: llmResponse.metadata?.isInScope !== false,
        manualEscalation: false,
        hadError: false
      });
    } else {
      // Error occurred during processing
      routingAnalysis = await analyzeRouting({
        userQuestion: message,
        sqlQuery: null,
        results: [],
        isInScope: llmResponse.metadata?.isInScope !== false,
        manualEscalation: false,
        hadError: true
      });
    }

    // Store assistant message with metadata
    const assistantMessageResult = run(
      `INSERT INTO chat_messages (
        session_id, role, content,
        generated_sql, sql_results,
        confidence_score, complexity_level, is_in_scope,
        needs_escalation, escalation_reason,
        created_at
      ) VALUES (?, 'assistant', ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        sessionId,
        llmResponse.content,
        llmResponse.metadata?.generatedSql || null,
        JSON.stringify(llmResponse.metadata?.sqlResults || []),
        routingAnalysis.confidenceScore,
        routingAnalysis.complexity.level,
        routingAnalysis.isInScope ? 1 : 0,
        routingAnalysis.needsEscalation ? 1 : 0,
        routingAnalysis.escalationReason || null
      ]
    );

    // Update session last activity
    run(
      `UPDATE chat_sessions SET last_activity = datetime('now') WHERE session_id = ?`,
      [sessionId]
    );

    // If escalation is needed, create escalated question entry
    if (routingAnalysis.needsEscalation) {
      run(
        `INSERT INTO escalated_questions (
          source_type, source_id, session_id, user_name,
          question_text, escalation_reason, confidence_score,
          status, created_at
        ) VALUES ('chat', ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
        [
          assistantMessageResult.lastID,
          sessionId,
          sessions[0].user_name,
          message,
          routingAnalysis.escalationReason,
          routingAnalysis.confidenceScore
        ]
      );
    }

    // Return response with full metadata
    res.json({
      success: true,
      message: {
        id: assistantMessageResult.lastID,
        role: 'assistant',
        content: llmResponse.content,
        metadata: {
          generatedSql: llmResponse.metadata?.generatedSql,
          resultCount: llmResponse.metadata?.resultCount,
          confidenceScore: routingAnalysis.confidenceScore,
          complexityLevel: routingAnalysis.complexity.level,
          complexityFactors: routingAnalysis.complexity.factors,
          isInScope: routingAnalysis.isInScope,
          needsEscalation: routingAnalysis.needsEscalation,
          escalationReason: routingAnalysis.escalationReason
        },
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
}

/**
 * List recent chat sessions
 * GET /api/chat/sessions
 */
export async function listSessions(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const sessions = query(
      `SELECT
        cs.*,
        COUNT(cm.id) as message_count
       FROM chat_sessions cs
       LEFT JOIN chat_messages cm ON cs.session_id = cm.session_id
       GROUP BY cs.id
       ORDER BY cs.last_activity DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list sessions'
    });
  }
}

export default {
  createSession,
  getSession,
  sendMessage,
  listSessions
};
