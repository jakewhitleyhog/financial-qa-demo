# PRD: Reply Upvote Guards (Issues #8 & #9)

## Introduction

Two small defensive fixes following PR #7 (Reply Upvote Toggle). The `onRemoveUpvote` prop in `ReplyThread.jsx` has no default/guard, so omitting it would throw at runtime. The `removeUpvoteReply` controller returns a misleading 400 for non-existent reply IDs instead of a proper 404.

## Goals

- Prevent runtime crash if `onRemoveUpvote` prop is ever omitted from `ReplyThread`
- Return the correct HTTP 404 when a non-existent reply ID is passed to the DELETE endpoint

## User Stories

### US-001: Add prop guard for onRemoveUpvote in ReplyThread
**Description:** As a developer, I want `ReplyThread` to be safe to use without `onRemoveUpvote` so future consumers don't crash unexpectedly.

**Acceptance Criteria:**
- [ ] `onRemoveUpvote` defaults to a no-op (`= () => {}`) in the function signature of `ReplyThread.jsx`
- [ ] No other behavior changes to `ReplyThread`
- [ ] Typecheck passes

### US-002: Return 404 for non-existent reply in removeUpvoteReply
**Description:** As a developer, I want the DELETE endpoint to return 404 when the reply ID doesn't exist so callers get a semantically correct error.

**Acceptance Criteria:**
- [ ] `removeUpvoteReply` in `forumController.js` checks `SELECT id FROM forum_replies WHERE id = ?` before the delete
- [ ] If the reply does not exist, returns `404` with `{ success: false, error: 'Reply not found' }`
- [ ] If the reply exists but the investor has not upvoted it, still returns `400` with the existing error
- [ ] Typecheck passes

## Functional Requirements

- FR-1: `ReplyThread` must not throw if `onRemoveUpvote` is not passed
- FR-2: `DELETE /api/forum/replies/:id/upvote` must return 404 for a reply ID that does not exist in `forum_replies`
- FR-3: Existing 400 behavior (upvote not found) must be unchanged

## Non-Goals

- No changes to question upvote logic
- No UI changes
- No PropTypes or TypeScript type additions beyond what's needed for the fix

## Technical Considerations

- The simplest fix for #8 is a default parameter: `onRemoveUpvote = () => {}`
- The fix for #9 uses the existing `query` helper already imported in the controller
- Both fixes are 1-3 lines each

## Success Metrics

- `ReplyThread` renders without error when `onRemoveUpvote` is not passed
- `DELETE /api/forum/replies/99999/upvote` returns 404, not 400
