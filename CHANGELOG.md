# Changelog

---

## [2026-02-25] — Fix: Reply Upvote Toggle

**GitHub Issue:** #5
**Branch:** ralph/reply-upvote-toggle
**PR:** #7

### What Was Changed
- Backend: Added `removeUpvoteReply` function to `forumController.js` — deletes the upvote record from `forum_upvotes` and decrements `forum_replies.upvotes`
- Backend: Registered `DELETE /api/forum/replies/:id/upvote` route in `forum.js`
- Frontend: Added `removeUpvoteReply(id)` to `forumAPI` in `api.js` — calls the new DELETE endpoint
- Frontend: Added `handleRemoveUpvoteReply(replyId)` to `QuestionDetail.jsx` — updates local reply state on success
- Frontend: Passed `onRemoveUpvote` prop from `QuestionDetail` down to `ReplyThread`
- Frontend: Updated `ReplyThread.jsx` — removed `disabled={reply.isUpvoted}`, replaced `handleUpvote` with `handleUpvoteToggle` that calls add or remove based on current state

### Why It Was Changed
Users could upvote a reply but had no way to remove the upvote. The button was permanently disabled after clicking. This mirrors the existing question upvote toggle, which was already fully implemented. The fix adds the missing backend endpoint and wires the frontend to call add vs. remove based on `reply.isUpvoted`.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/src/controllers/forumController.js` | Modified | Added `removeUpvoteReply` function |
| `backend/src/routes/forum.js` | Modified | Registered DELETE `/replies/:id/upvote` route |
| `frontend/src/services/api.js` | Modified | Added `removeUpvoteReply` to `forumAPI` |
| `frontend/src/components/forum/QuestionDetail.jsx` | Modified | Added `handleRemoveUpvoteReply`, passed to ReplyThread |
| `frontend/src/components/forum/ReplyThread.jsx` | Modified | Toggle upvote logic, removed disabled state |
| `ralph/prd.json` | Added | Ralph PRD for this feature |
| `tasks/prd-reply-upvote-toggle.md` | Added | PRD document |

### Known Risks & Side Effects
- `ReplyThread.jsx` is used in `QuestionDetail.jsx` only — no other consumers affected
- The `onRemoveUpvote` prop is new; any future use of `ReplyThread` without it will silently fail to remove upvotes (the toggle will call `undefined`). Future consumers must pass both `onUpvote` and `onRemoveUpvote`.

### Potential Follow-Up Issues
- The inline upvote button in `ReplyThread.jsx` duplicates logic from the shared `UpvoteButton` component. Consider refactoring `ReplyThread` to use `UpvoteButton` for consistency.
