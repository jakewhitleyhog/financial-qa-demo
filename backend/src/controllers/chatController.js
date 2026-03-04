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
import { query, run, transaction } from '../config/database.js';
import { processQuestion, generateSQL, formatResultsStream } from '../services/llmService.js';
import { validateAndSanitize } from '../utils/sqlSanitizer.js';
import { query as dbQuery } from '../config/database.js';
import { analyzeRouting } from '../services/routingService.js';

/**
 * Shared SQL pipeline: text-to-SQL → validation → execution.
 * Used by both sendMessage() and streamMessage() so pipeline changes
 * only need to be made in one place.
 *
 * @param {string} message
 * @param {Array<{role: string, content: string}>} conversationHistory
 * @returns {Promise<
 *   { success: true,  sql: string, results: Array } |
 *   { success: false, errorType: string, sql: string|null,
 *     content: string, escalationReason: string, isInScope: boolean }
 * >}
 */
async function runSqlPipeline(message, conversationHistory) {
  const sqlGeneration = await generateSQL(message, conversationHistory);
  if (!sqlGeneration.success) {
    const isOutOfScope = sqlGeneration.error === 'Question is out of scope';
    return {
      success: false,
      errorType: isOutOfScope ? 'out_of_scope' : 'sql_gen_failed',
      sql: null,
      content: isOutOfScope
        ? "I apologize, but I can only answer questions related to the financial data, forum discussions, chat history, and escalation tracking in our database. Your question appears to be outside my scope. Is there anything about the company financials or forum activity I can help you with?"
        : "I encountered an error trying to formulate a database query for your question. This may require human assistance.",
      escalationReason: isOutOfScope
        ? 'Out-of-scope: Question unrelated to database contents'
        : 'SQL generation failed',
      isInScope: !isOutOfScope,
    };
  }

  const validation = validateAndSanitize(sqlGeneration.sql);
  if (!validation.isValid) {
    return {
      success: false,
      errorType: 'sql_validation_failed',
      sql: sqlGeneration.sql,
      content: "I generated an unsafe query for your question. For security reasons, I cannot execute it. A human team member will review your question.",
      escalationReason: 'SQL validation failed',
      isInScope: true,
    };
  }

  let results;
  try {
    results = dbQuery(validation.sanitizedQuery);
  } catch (execError) {
    return {
      success: false,
      errorType: 'sql_exec_failed',
      sql: validation.sanitizedQuery,
      content: "I encountered an error while querying the database. The query may need refinement. A human team member can help with this.",
      escalationReason: 'SQL execution failed',
      isInScope: true,
    };
  }

  return { success: true, sql: validation.sanitizedQuery, results };
}

/**
 * Create a new chat session
 * POST /api/chat/sessions
 */
export async function createSession(req, res) {
  try {
    const sessionId = `sess_${uuidv4()}`;

    const result = run(
      `INSERT INTO chat_sessions (session_id, investor_id, user_name, started_at, last_activity)
       VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
      [sessionId, req.investor.id, req.investor.name]
    );

    res.status(201).json({
      success: true,
      session: {
        id: result.lastID,
        sessionId,
        userName: req.investor.name,
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

    // Get session info — include investor_id guard to prevent cross-investor access
    const sessions = query(
      `SELECT * FROM chat_sessions WHERE session_id = ? AND investor_id = ?`,
      [sessionId, req.investor.id]
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

    if (message.length > 1000) {
      return res.status(400).json({ success: false, error: 'Message must be 1,000 characters or fewer' });
    }

    // Verify session exists and belongs to this investor
    const sessions = query(
      `SELECT * FROM chat_sessions WHERE session_id = ? AND investor_id = ?`,
      [sessionId, req.investor.id]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Fetch the last 10 messages from this session as conversation history
    // (fetched before storing the current user message so it is not included)
    const historyRows = query(
      `SELECT role, content FROM chat_messages
       WHERE session_id = ?
       ORDER BY id DESC
       LIMIT 10`,
      [sessionId]
    );
    const conversationHistory = historyRows.reverse(); // oldest-first for Claude

    // Store user message
    const userMessageResult = run(
      `INSERT INTO chat_messages (session_id, role, content, created_at)
       VALUES (?, 'user', ?, datetime('now'))`,
      [sessionId, message]
    );

    // Process the question through LLM service with conversation context
    const llmResponse = await processQuestion(message, conversationHistory);

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

    // Store assistant message + session update + optional escalation atomically
    let assistantMessageId;
    transaction(db => {
      db.run(
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
      assistantMessageId = db.exec('SELECT last_insert_rowid()')[0]?.values[0][0];

      db.run(
        `UPDATE chat_sessions SET last_activity = datetime('now') WHERE session_id = ?`,
        [sessionId]
      );

      if (routingAnalysis.needsEscalation) {
        db.run(
          `INSERT INTO escalated_questions (
            source_type, source_id, session_id, user_name,
            question_text, escalation_reason, confidence_score,
            status, created_at
          ) VALUES ('chat', ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
          [
            assistantMessageId,
            sessionId,
            req.investor.name,
            message,
            routingAnalysis.escalationReason,
            routingAnalysis.confidenceScore
          ]
        );
      }
    });

    // Return response with full metadata
    res.json({
      success: true,
      message: {
        id: assistantMessageId,
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
       WHERE cs.investor_id = ?
       GROUP BY cs.id
       ORDER BY cs.last_activity DESC
       LIMIT ?`,
      [req.investor.id, limit]
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

/**
 * Send a message and stream the AI response via Server-Sent Events
 * POST /api/chat/sessions/:sessionId/message/stream
 */
export async function streamMessage(req, res) {
  // Set SSE headers immediately so the client can start reading
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const sendDone = () => { res.write('data: [DONE]\n\n'); res.end(); };

  // Track client disconnect — if the client navigates away mid-stream,
  // skip the post-stream DB writes to avoid orphaned assistant messages
  let clientDisconnected = false;
  res.on('close', () => { clientDisconnected = true; });

  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      sendEvent({ type: 'error', message: 'Message is required' });
      sendDone();
      return;
    }

    if (message.length > 1000) {
      sendEvent({ type: 'error', message: 'Message must be 1,000 characters or fewer' });
      sendDone();
      return;
    }

    // Verify session exists and belongs to this investor
    const sessions = query(
      `SELECT * FROM chat_sessions WHERE session_id = ? AND investor_id = ?`,
      [sessionId, req.investor.id]
    );
    if (sessions.length === 0) {
      sendEvent({ type: 'error', message: 'Session not found' });
      sendDone();
      return;
    }

    // Fetch prior session messages as conversation history
    const historyRows = query(
      `SELECT role, content FROM chat_messages
       WHERE session_id = ?
       ORDER BY id DESC
       LIMIT 10`,
      [sessionId]
    );
    const conversationHistory = historyRows.reverse();

    // Store user message
    run(
      `INSERT INTO chat_messages (session_id, role, content, created_at)
       VALUES (?, 'user', ?, datetime('now'))`,
      [sessionId, message]
    );

    // Run shared SQL pipeline (generate → validate → execute)
    const pipeline = await runSqlPipeline(message, conversationHistory);

    if (!pipeline.success) {
      sendEvent({ type: 'token', content: pipeline.content });

      const assistantResult = run(
        `INSERT INTO chat_messages (
           session_id, role, content, generated_sql,
           is_in_scope, needs_escalation, escalation_reason, created_at
         ) VALUES (?, 'assistant', ?, ?, ?, 1, ?, datetime('now'))`,
        [sessionId, pipeline.content, pipeline.sql, pipeline.isInScope ? 1 : 0, pipeline.escalationReason]
      );
      run(`UPDATE chat_sessions SET last_activity = datetime('now') WHERE session_id = ?`, [sessionId]);
      run(
        `INSERT INTO escalated_questions (
           source_type, source_id, session_id, user_name,
           question_text, escalation_reason, confidence_score,
           status, created_at
         ) VALUES ('chat', ?, ?, ?, ?, ?, 0.0, 'pending', datetime('now'))`,
        [assistantResult.lastID, sessionId, req.investor.name, message, pipeline.escalationReason]
      );

      sendEvent({ type: 'done', messageId: assistantResult.lastID, metadata: { isInScope: pipeline.isInScope, needsEscalation: true } });
      sendDone();
      return;
    }

    // Stream the formatted response token by token
    let fullContent = '';
    await formatResultsStream(message, pipeline.sql, pipeline.results, conversationHistory, (chunk) => {
      fullContent += chunk;
      sendEvent({ type: 'token', content: chunk });
    });

    // Skip DB writes if client disconnected before streaming finished
    if (clientDisconnected) {
      return;
    }

    // Run routing analysis and store assistant message
    const routingAnalysis = await analyzeRouting({
      userQuestion: message,
      sqlQuery: pipeline.sql,
      results: pipeline.results,
      isInScope: true,
      manualEscalation: false,
      hadError: false
    });

    let streamAssistantId;
    transaction(db => {
      db.run(
        `INSERT INTO chat_messages (
           session_id, role, content,
           generated_sql, sql_results,
           confidence_score, complexity_level, is_in_scope,
           needs_escalation, escalation_reason,
           created_at
         ) VALUES (?, 'assistant', ?, ?, ?, ?, ?, 1, ?, ?, datetime('now'))`,
        [
          sessionId,
          fullContent,
          pipeline.sql,
          JSON.stringify(pipeline.results),
          routingAnalysis.confidenceScore,
          routingAnalysis.complexity.level,
          routingAnalysis.needsEscalation ? 1 : 0,
          routingAnalysis.escalationReason || null
        ]
      );
      streamAssistantId = db.exec('SELECT last_insert_rowid()')[0]?.values[0][0];

      db.run(
        `UPDATE chat_sessions SET last_activity = datetime('now') WHERE session_id = ?`,
        [sessionId]
      );

      if (routingAnalysis.needsEscalation) {
        db.run(
          `INSERT INTO escalated_questions (
             source_type, source_id, session_id, user_name,
             question_text, escalation_reason, confidence_score,
             status, created_at
           ) VALUES ('chat', ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
          [
            streamAssistantId,
            sessionId,
            req.investor.name,
            message,
            routingAnalysis.escalationReason,
            routingAnalysis.confidenceScore
          ]
        );
      }
    });

    sendEvent({
      type: 'done',
      messageId: streamAssistantId,
      metadata: {
        generatedSql: pipeline.sql,
        resultCount: pipeline.results.length,
        confidenceScore: routingAnalysis.confidenceScore,
        complexityLevel: routingAnalysis.complexity.level,
        isInScope: true,
        needsEscalation: routingAnalysis.needsEscalation,
        escalationReason: routingAnalysis.escalationReason
      }
    });
    sendDone();

  } catch (error) {
    console.error('Stream message error:', error);
    try {
      sendEvent({ type: 'error', message: 'Failed to process message' });
      sendDone();
    } catch { /* response may already be closed */ }
  }
}

export default {
  createSession,
  getSession,
  sendMessage,
  streamMessage,
  listSessions
};
