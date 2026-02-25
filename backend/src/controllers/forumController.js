/**
 * Forum Controller - Handles forum questions, replies, and upvotes
 *
 * Uses req.investor (set by auth middleware) for user identification.
 */

import { query, run } from '../config/database.js';

/**
 * Create a new forum question
 * POST /api/forum/questions
 */
export async function createQuestion(req, res) {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Title and body are required'
      });
    }

    const result = run(
      `INSERT INTO forum_questions (investor_id, user_name, title, body, upvotes, is_answered, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))`,
      [req.investor.id, req.investor.name, title, body]
    );

    res.status(201).json({
      success: true,
      question: {
        id: result.lastID,
        userName: req.investor.name,
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

    const countResult = query(
      `SELECT COUNT(*) as total FROM forum_questions ${whereClause}`
    );

    // Check which questions the current investor has upvoted
    const investorUpvotes = query(
      `SELECT target_id FROM forum_upvotes WHERE investor_id = ? AND target_type = 'question'`,
      [req.investor.id]
    );
    const upvotedIds = new Set(investorUpvotes.map(u => u.target_id));

    res.json({
      success: true,
      questions: questions.map(q => ({
        id: q.id,
        userName: q.user_name,
        title: q.title,
        body: q.body,
        upvotes: q.upvotes,
        isAnswered: Boolean(q.is_answered),
        isUpvoted: upvotedIds.has(q.id),
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

    const replies = query(
      `SELECT * FROM forum_replies
       WHERE question_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    const question = questions[0];

    // Check if current investor has upvoted this question
    const questionUpvote = query(
      `SELECT id FROM forum_upvotes WHERE investor_id = ? AND target_type = 'question' AND target_id = ?`,
      [req.investor.id, id]
    );

    // Check which replies the investor has upvoted
    const replyUpvotes = query(
      `SELECT target_id FROM forum_upvotes WHERE investor_id = ? AND target_type = 'reply'`,
      [req.investor.id]
    );
    const upvotedReplyIds = new Set(replyUpvotes.map(u => u.target_id));

    res.json({
      success: true,
      question: {
        id: question.id,
        userName: question.user_name,
        title: question.title,
        body: question.body,
        upvotes: question.upvotes,
        isAnswered: Boolean(question.is_answered),
        isUpvoted: questionUpvote.length > 0,
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
        isUpvoted: upvotedReplyIds.has(r.id),
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
    const { body, parentReplyId } = req.body;

    if (!body) {
      return res.status(400).json({
        success: false,
        error: 'Reply body is required'
      });
    }

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
      `INSERT INTO forum_replies (question_id, parent_reply_id, investor_id, user_name, body, upvotes, is_accepted_answer, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))`,
      [id, parentReplyId || null, req.investor.id, req.investor.name, body]
    );

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
        userName: req.investor.name,
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
    const investorId = req.investor.id;

    const existing = query(
      `SELECT * FROM forum_upvotes
       WHERE investor_id = ? AND target_type = 'question' AND target_id = ?`,
      [investorId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Already upvoted'
      });
    }

    run(
      `INSERT INTO forum_upvotes (investor_id, target_type, target_id, created_at)
       VALUES (?, 'question', ?, datetime('now'))`,
      [investorId, id]
    );

    run(
      `UPDATE forum_questions SET upvotes = upvotes + 1 WHERE id = ?`,
      [id]
    );

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
    const investorId = req.investor.id;

    const result = run(
      `DELETE FROM forum_upvotes
       WHERE investor_id = ? AND target_type = 'question' AND target_id = ?`,
      [investorId, id]
    );

    if (result.changes > 0) {
      run(
        `UPDATE forum_questions SET upvotes = upvotes - 1 WHERE id = ?`,
        [id]
      );
    }

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
    const investorId = req.investor.id;

    const existing = query(
      `SELECT * FROM forum_upvotes
       WHERE investor_id = ? AND target_type = 'reply' AND target_id = ?`,
      [investorId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Already upvoted'
      });
    }

    run(
      `INSERT INTO forum_upvotes (investor_id, target_type, target_id, created_at)
       VALUES (?, 'reply', ?, datetime('now'))`,
      [investorId, id]
    );

    run(
      `UPDATE forum_replies SET upvotes = upvotes + 1 WHERE id = ?`,
      [id]
    );

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

/**
 * Remove upvote from a reply
 * DELETE /api/forum/replies/:id/upvote
 */
export async function removeUpvoteReply(req, res) {
  try {
    const { id } = req.params;
    const investorId = req.investor.id;

    const result = run(
      `DELETE FROM forum_upvotes
       WHERE investor_id = ? AND target_type = 'reply' AND target_id = ?`,
      [investorId, id]
    );

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        error: 'You have not upvoted this reply'
      });
    }

    run(
      `UPDATE forum_replies SET upvotes = MAX(0, upvotes - 1) WHERE id = ?`,
      [id]
    );

    const replies = query(
      `SELECT upvotes FROM forum_replies WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      upvotes: replies[0]?.upvotes || 0
    });

  } catch (error) {
    console.error('Remove reply upvote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove reply upvote'
    });
  }
}

/**
 * Accept a reply as the answer to a question (admin only)
 * POST /api/forum/questions/:questionId/accept/:replyId
 */
export async function acceptAnswer(req, res) {
  try {
    const { questionId, replyId } = req.params;

    // Verify question exists
    const questions = query('SELECT id FROM forum_questions WHERE id = ?', [questionId]);
    if (questions.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    // Verify reply exists and belongs to question
    const replies = query(
      'SELECT id FROM forum_replies WHERE id = ? AND question_id = ?',
      [replyId, questionId]
    );
    if (replies.length === 0) {
      return res.status(404).json({ success: false, error: 'Reply not found for this question' });
    }

    // Clear any previously accepted answer for this question
    run(
      'UPDATE forum_replies SET is_accepted_answer = 0 WHERE question_id = ?',
      [questionId]
    );

    // Mark the reply as accepted
    run('UPDATE forum_replies SET is_accepted_answer = 1 WHERE id = ?', [replyId]);

    // Mark the question as answered
    run('UPDATE forum_questions SET is_answered = 1, updated_at = datetime(\'now\') WHERE id = ?', [questionId]);

    res.json({ success: true, questionId: parseInt(questionId), replyId: parseInt(replyId) });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ success: false, error: 'Failed to accept answer' });
  }
}

/**
 * Remove the accepted answer from a question (admin only)
 * DELETE /api/forum/questions/:questionId/accept
 */
export async function removeAcceptedAnswer(req, res) {
  try {
    const { questionId } = req.params;

    run(
      'UPDATE forum_replies SET is_accepted_answer = 0 WHERE question_id = ?',
      [questionId]
    );
    run(
      'UPDATE forum_questions SET is_answered = 0, updated_at = datetime(\'now\') WHERE id = ?',
      [questionId]
    );

    res.json({ success: true, questionId: parseInt(questionId) });
  } catch (error) {
    console.error('Remove accepted answer error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove accepted answer' });
  }
}

export default {
  createQuestion,
  listQuestions,
  getQuestion,
  addReply,
  upvoteQuestion,
  removeUpvoteQuestion,
  upvoteReply,
  removeUpvoteReply,
  acceptAnswer,
  removeAcceptedAnswer
};
