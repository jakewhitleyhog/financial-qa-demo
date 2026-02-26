import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../config/database.js', () => ({
  query: vi.fn(),
  run: vi.fn(),
}));

import { query, run } from '../config/database.js';
import {
  createQuestion,
  listQuestions,
  getQuestion,
  addReply,
  upvoteReply,
  removeUpvoteReply,
} from '../controllers/forumController.js';

function makeReq(overrides = {}) {
  return {
    investor: { id: 1, name: 'Test Investor', role: 'investor' },
    params: {},
    query: {},
    body: {},
    ...overrides,
  };
}

function makeRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// createQuestion
// ---------------------------------------------------------------------------
describe('createQuestion', () => {
  it('returns 400 when title is missing', async () => {
    const req = makeReq({ body: { body: 'Some body' } });
    const res = makeRes();
    await createQuestion(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 400 when body is missing', async () => {
    const req = makeReq({ body: { title: 'A title' } });
    const res = makeRes();
    await createQuestion(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 201 with question object on success', async () => {
    run.mockReturnValue({ lastID: 42, changes: 1 });
    const req = makeReq({ body: { title: 'A title', body: 'A body' } });
    const res = makeRes();
    await createQuestion(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        question: expect.objectContaining({ id: 42, title: 'A title' }),
      })
    );
  });
});

// ---------------------------------------------------------------------------
// listQuestions
// ---------------------------------------------------------------------------
describe('listQuestions', () => {
  it('returns 200 with questions array and pagination', async () => {
    query
      .mockReturnValueOnce([{ id: 1, user_name: 'Alice', title: 'Q1', body: 'B', upvotes: 0, is_answered: 0, reply_count: 2, created_at: '2026-01-01', updated_at: '2026-01-01' }])
      .mockReturnValueOnce([{ total: 1 }])
      .mockReturnValueOnce([]); // investor upvotes

    const req = makeReq({ query: { limit: '10', offset: '0', sortBy: 'recent' } });
    const res = makeRes();
    await listQuestions(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        questions: expect.arrayContaining([expect.objectContaining({ id: 1 })]),
        pagination: expect.objectContaining({ total: 1 }),
      })
    );
  });

  it('marks questions the investor has upvoted as isUpvoted: true', async () => {
    query
      .mockReturnValueOnce([{ id: 5, user_name: 'Bob', title: 'Q2', body: 'B', upvotes: 3, is_answered: 0, reply_count: 0, created_at: '2026-01-01', updated_at: '2026-01-01' }])
      .mockReturnValueOnce([{ total: 1 }])
      .mockReturnValueOnce([{ target_id: 5 }]); // investor has upvoted question 5

    const req = makeReq({ query: {} });
    const res = makeRes();
    await listQuestions(req, res);

    const { questions } = res.json.mock.calls[0][0];
    expect(questions[0].isUpvoted).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getQuestion
// ---------------------------------------------------------------------------
describe('getQuestion', () => {
  it('returns 404 when question does not exist', async () => {
    query.mockReturnValueOnce([]); // no question found
    const req = makeReq({ params: { id: '99' } });
    const res = makeRes();
    await getQuestion(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 with question and replies', async () => {
    query
      .mockReturnValueOnce([{ id: 1, user_name: 'Alice', title: 'Q', body: 'B', upvotes: 0, is_answered: 0, created_at: '2026-01-01', updated_at: '2026-01-01' }])
      .mockReturnValueOnce([]) // replies
      .mockReturnValueOnce([]) // question upvote check
      .mockReturnValueOnce([]); // reply upvotes

    const req = makeReq({ params: { id: '1' } });
    const res = makeRes();
    await getQuestion(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        question: expect.objectContaining({ id: 1 }),
        replies: expect.any(Array),
      })
    );
  });

  it('marks isUpvoted true when investor has upvoted the question', async () => {
    query
      .mockReturnValueOnce([{ id: 1, user_name: 'Alice', title: 'Q', body: 'B', upvotes: 2, is_answered: 0, created_at: '2026-01-01', updated_at: '2026-01-01' }])
      .mockReturnValueOnce([]) // replies
      .mockReturnValueOnce([{ id: 99 }]) // investor upvote exists
      .mockReturnValueOnce([]); // reply upvotes

    const req = makeReq({ params: { id: '1' } });
    const res = makeRes();
    await getQuestion(req, res);

    const { question } = res.json.mock.calls[0][0];
    expect(question.isUpvoted).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// addReply
// ---------------------------------------------------------------------------
describe('addReply', () => {
  it('returns 400 when body is missing', async () => {
    const req = makeReq({ params: { id: '1' }, body: {} });
    const res = makeRes();
    await addReply(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when question does not exist', async () => {
    query.mockReturnValueOnce([]); // no question
    const req = makeReq({ params: { id: '99' }, body: { body: 'A reply' } });
    const res = makeRes();
    await addReply(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 201 with reply object on success', async () => {
    query.mockReturnValueOnce([{ id: 1 }]); // question exists
    run.mockReturnValueOnce({ lastID: 10, changes: 1 }); // insert reply
    run.mockReturnValueOnce({ changes: 1 }); // update question updated_at

    const req = makeReq({ params: { id: '1' }, body: { body: 'A reply' } });
    const res = makeRes();
    await addReply(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        reply: expect.objectContaining({ id: 10, body: 'A reply' }),
      })
    );
  });
});

// ---------------------------------------------------------------------------
// upvoteReply
// ---------------------------------------------------------------------------
describe('upvoteReply', () => {
  it('returns 404 when reply does not exist', async () => {
    query.mockReturnValueOnce([]); // reply not found
    const req = makeReq({ params: { id: '99' } });
    const res = makeRes();
    await upvoteReply(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Reply not found' }));
  });

  it('returns 400 when reply is already upvoted', async () => {
    query
      .mockReturnValueOnce([{ id: 5 }])  // reply exists
      .mockReturnValueOnce([{ id: 99 }]); // existing upvote found
    const req = makeReq({ params: { id: '5' } });
    const res = makeRes();
    await upvoteReply(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 with updated upvote count on success', async () => {
    query
      .mockReturnValueOnce([{ id: 5 }])      // reply exists
      .mockReturnValueOnce([])               // no existing upvote
      .mockReturnValueOnce([{ upvotes: 4 }]); // updated count
    run.mockReturnValue({ lastID: null, changes: 1 });

    const req = makeReq({ params: { id: '5' } });
    const res = makeRes();
    await upvoteReply(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, upvotes: 4 });
  });
});

// ---------------------------------------------------------------------------
// removeUpvoteReply
// ---------------------------------------------------------------------------
describe('removeUpvoteReply', () => {
  it('returns 404 when reply does not exist', async () => {
    query.mockReturnValueOnce([]); // reply not found
    const req = makeReq({ params: { id: '99' } });
    const res = makeRes();
    await removeUpvoteReply(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Reply not found' }));
  });

  it('returns 400 when investor has not upvoted this reply', async () => {
    query.mockReturnValueOnce([{ id: 5 }]);         // reply exists
    run.mockReturnValueOnce({ changes: 0, lastID: null }); // DELETE matched nothing

    const req = makeReq({ params: { id: '5' } });
    const res = makeRes();
    await removeUpvoteReply(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 with updated upvote count on successful removal', async () => {
    query
      .mockReturnValueOnce([{ id: 5 }])      // reply exists
      .mockReturnValueOnce([{ upvotes: 1 }]); // updated count after removal
    run.mockReturnValueOnce({ changes: 1, lastID: null }); // DELETE succeeded
    run.mockReturnValueOnce({ changes: 1, lastID: null }); // UPDATE upvotes

    const req = makeReq({ params: { id: '5' } });
    const res = makeRes();
    await removeUpvoteReply(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, upvotes: 1 });
  });
});
