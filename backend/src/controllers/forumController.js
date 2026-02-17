/**
 * Forum Controller - Handles forum questions, replies, and upvotes
 *
 * This controller manages the Reddit-style Q&A forum functionality:
 * - Creating and retrieving questions
 * - Adding replies (with threading support)
 * - Upvoting questions and replies
 * - Sorting and pagination
 */

import { query, run } from '../config/database.js';

/**
 * Create a new forum question
 * POST /api/forum/questions
 */
export async function createQuestion(req, res) {
  try {
    const { userName, title, body } = req.body;

    // Validation
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Title and body are required'
      });
    }

    const result = run(
      `INSERT INTO forum_questions (user_name, title, body, upvotes, is_answered, created_at, updated_at)
       VALUES (?, ?, ?, 0, 0, datetime('now'), datetime('now'))`,
      [userName || 'Anonymous', title, body]
    );

    res.status(201).json({
      success: true,
      question: {
        id: result.lastID,
        userName: userName || 'Anonymous',
        title,
        body,
        upvotes: 0,
        isAnswered: false,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create question'
    });
  }
}

/**
 * Get list of questions with pagination and sorting
 * GET /api/forum/questions
 */
export async function listQuestions(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const sortBy = req.query.sortBy || 'recent';

    // Build WHERE and ORDER BY clauses based on sort option
    let whereClause = '';
    let orderClause = 'fq.created_at DESC';

    switch (sortBy) {
      case 'popular':
        orderClause = 'fq.upvotes DESC, fq.created_at DESC';
        break;
      case 'unanswered':
        whereClause = 'WHERE fq.is_answered = 0';
        break;
      case 'active':
        orderClause = 'fq.updated_at DESC';
        break;
      case 'most_replies':
        orderClause = 'reply_count DESC, fq.created_at DESC';
        break;
      case 'recent':
      default:
        orderClause = 'fq.created_at DESC';
        break;
    }

    const questions = query(
      `SELECT
        fq.*,
        COUNT(DISTINCT fr.id) as reply_count
       FROM forum_questions fq
       LEFT JOIN forum_replies fr ON fq.id = fr.question_id
       ${whereClause}
       GROUP BY fq.id
       ORDER BY ${orderClause}
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Get total count
    const countResult = query(
      `SELECT COUNT(*) as total FROM forum_questions ${whereClause}`
    );

    res.json({
      success: true,
      questions: questions.map(q => ({
        id: q.id,
        userName: q.user_name,
        title: q.title,
        body: q.body,
        upvotes: q.upvotes,
        isAnswered: Boolean(q.is_answered),
        replyCount: q.reply_count,
        createdAt: q.created_at,
        updatedAt: q.updated_at
      })),
      pagination: {
        total: countResult[0].total,
        limit,
        offset,
        hasMore: offset + limit < countResult[0].total
      }
    });

  } catch (error) {
    console.error('List questions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list questions'
    });
  }
}

/**
 * Get a specific question with all its replies
 * GET /api/forum/questions/:id
 */
export async function getQuestion(req, res) {
  try {
    const { id } = req.params;

    // Get the question
    const questions = query(
      `SELECT * FROM forum_questions WHERE id = ?`,
      [id]
    );

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Get all replies (will be organized into tree structure by frontend)
    const replies = query(
      `SELECT * FROM forum_replies
       WHERE question_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    const question = questions[0];

    res.json({
      success: true,
      question: {
        id: question.id,
        userName: question.user_name,
        title: question.title,
        body: question.body,
        upvotes: question.upvotes,
        isAnswered: Boolean(question.is_answered),
        createdAt: question.created_at,
        updatedAt: question.updated_at
      },
      replies: replies.map(r => ({
        id: r.id,
        questionId: r.question_id,
        parentReplyId: r.parent_reply_id,
        userName: r.user_name,
        body: r.body,
        upvotes: r.upvotes,
        isAcceptedAnswer: Boolean(r.is_accepted_answer),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }))
    });

  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve question'
    });
  }
}

/**
 * Add a reply to a question or another reply
 * POST /api/forum/questions/:id/reply
 */
export async function addReply(req, res) {
  try {
    const { id } = req.params;
    const { userName, body, parentReplyId } = req.body;

    // Validation
    if (!body) {
      return res.status(400).json({
        success: false,
        error: 'Reply body is required'
      });
    }

    // Verify question exists
    const questions = query(
      `SELECT * FROM forum_questions WHERE id = ?`,
      [id]
    );

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    const result = run(
      `INSERT INTO forum_replies (question_id, parent_reply_id, user_name, body, upvotes, is_accepted_answer, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))`,
      [id, parentReplyId || null, userName || 'Anonymous', body]
    );

    // Update question's updated_at timestamp
    run(
      `UPDATE forum_questions SET updated_at = datetime('now') WHERE id = ?`,
      [id]
    );

    res.status(201).json({
      success: true,
      reply: {
        id: result.lastID,
        questionId: parseInt(id),
        parentReplyId: parentReplyId || null,
        userName: userName || 'Anonymous',
        body,
        upvotes: 0,
        isAcceptedAnswer: false,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add reply'
    });
  }
}

/**
 * Upvote a question
 * POST /api/forum/questions/:id/upvote
 */
export async function upvoteQuestion(req, res) {
  try {
    const { id } = req.params;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Check if already upvoted
    const existing = query(
      `SELECT * FROM forum_upvotes
       WHERE user_session_id = ? AND target_type = 'question' AND target_id = ?`,
      [sessionId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Already upvoted'
      });
    }

    // Add upvote record
    run(
      `INSERT INTO forum_upvotes (user_session_id, target_type, target_id, created_at)
       VALUES (?, 'question', ?, datetime('now'))`,
      [sessionId, id]
    );

    // Increment upvote count
    run(
      `UPDATE forum_questions SET upvotes = upvotes + 1 WHERE id = ?`,
      [id]
    );

    // Get new upvote count
    const questions = query(
      `SELECT upvotes FROM forum_questions WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      upvotes: questions[0]?.upvotes || 0
    });

  } catch (error) {
    console.error('Upvote question error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upvote question'
    });
  }
}

/**
 * Remove upvote from a question
 * DELETE /api/forum/questions/:id/upvote
 */
export async function removeUpvoteQuestion(req, res) {
  try {
    const { id } = req.params;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Remove upvote record
    const result = run(
      `DELETE FROM forum_upvotes
       WHERE user_session_id = ? AND target_type = 'question' AND target_id = ?`,
      [sessionId, id]
    );

    if (result.changes > 0) {
      // Decrement upvote count
      run(
        `UPDATE forum_questions SET upvotes = upvotes - 1 WHERE id = ?`,
        [id]
      );
    }

    // Get new upvote count
    const questions = query(
      `SELECT upvotes FROM forum_questions WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      upvotes: questions[0]?.upvotes || 0
    });

  } catch (error) {
    console.error('Remove upvote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove upvote'
    });
  }
}

/**
 * Upvote a reply
 * POST /api/forum/replies/:id/upvote
 */
export async function upvoteReply(req, res) {
  try {
    const { id } = req.params;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Check if already upvoted
    const existing = query(
      `SELECT * FROM forum_upvotes
       WHERE user_session_id = ? AND target_type = 'reply' AND target_id = ?`,
      [sessionId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Already upvoted'
      });
    }

    // Add upvote record
    run(
      `INSERT INTO forum_upvotes (user_session_id, target_type, target_id, created_at)
       VALUES (?, 'reply', ?, datetime('now'))`,
      [sessionId, id]
    );

    // Increment upvote count
    run(
      `UPDATE forum_replies SET upvotes = upvotes + 1 WHERE id = ?`,
      [id]
    );

    // Get new upvote count
    const replies = query(
      `SELECT upvotes FROM forum_replies WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      upvotes: replies[0]?.upvotes || 0
    });

  } catch (error) {
    console.error('Upvote reply error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upvote reply'
    });
  }
}

export default {
  createQuestion,
  listQuestions,
  getQuestion,
  addReply,
  upvoteQuestion,
  removeUpvoteQuestion,
  upvoteReply
};
