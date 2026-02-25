# PRD: Reply Upvote Toggle (Issue #5)

## Introduction

Users can currently upvote a forum reply but cannot remove their upvote. The upvote button on replies is disabled once clicked. This fix adds the ability to toggle (click again to remove) an upvote on a reply, matching the existing behavior for question upvotes.

## Goals

- Allow users to remove their upvote from a reply by clicking the upvote button again
- Mirror the existing question upvote toggle behavior exactly
- Ensure upvote count updates correctly in real time on both add and remove

## User Stories

### US-001: Add removeUpvoteReply backend endpoint
**Description:** As a developer, I need a DELETE endpoint to remove a reply upvote so the frontend can toggle it off.

**Acceptance Criteria:**
- [ ] `removeUpvoteReply` function added to `forumController.js`, mirroring `removeUpvoteQuestion`
- [ ] `DELETE /api/forum/replies/:id/upvote` route registered in `forum.js`
- [ ] Returns `{ success: true, upvotes: <updated count> }`
- [ ] If the investor has not upvoted the reply, returns 400 with appropriate error
- [ ] Typecheck passes

### US-002: Add removeUpvoteReply to frontend API service
**Description:** As a developer, I need the frontend API client to support the remove reply upvote endpoint.

**Acceptance Criteria:**
- [ ] `removeUpvoteReply(replyId)` function added to `forumAPI` in `api.js`
- [ ] Calls `DELETE /api/forum/replies/:id/upvote`
- [ ] Typecheck passes

### US-003: Wire up toggle in QuestionDetail and ReplyThread
**Description:** As a user, I want to click an upvoted reply's upvote button to remove my upvote so I can correct accidental upvotes.

**Acceptance Criteria:**
- [ ] `handleRemoveUpvoteReply(replyId)` added to `QuestionDetail.jsx`, calls `forumAPI.removeUpvoteReply`
- [ ] On success, updates the reply's `upvotes` count and sets `isUpvoted: false` in local state
- [ ] `onRemoveUpvote` prop passed from `QuestionDetail` to `ReplyThread`
- [ ] `ReplyThread.jsx` accepts `onRemoveUpvote` prop
- [ ] Upvote button in `ReplyThread.jsx` is NOT disabled when `isUpvoted` is true
- [ ] Clicking an already-upvoted reply button calls `onRemoveUpvote`, not `onUpvote`
- [ ] Button visual state (color/background) reflects upvoted vs not-upvoted correctly
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: `DELETE /api/forum/replies/:id/upvote` must delete the upvote record and decrement the reply's upvote count
- FR-2: `forumAPI.removeUpvoteReply(replyId)` must call this endpoint
- FR-3: When `reply.isUpvoted` is true and user clicks the upvote button, the upvote is removed
- FR-4: When `reply.isUpvoted` is false and user clicks the upvote button, the upvote is added
- FR-5: The upvote count displayed updates immediately after the action completes
- FR-6: The upvote button must never be permanently disabled — only show a loading state while the request is in-flight

## Non-Goals

- No change to question upvote toggle (already works)
- No animation changes to the upvote button
- No notification to reply author when upvote is removed

## Technical Considerations

- `removeUpvoteReply` in the controller is a direct mirror of `removeUpvoteQuestion` — use the same pattern
- `ReplyThread.jsx` currently has its own inline upvote button (not using the `UpvoteButton` component) — update the inline button's logic in place rather than refactoring to use the shared component
- `QuestionDetail.jsx` already correctly updates local state for reply upvotes on add — follow the same pattern for remove

## Success Metrics

- Clicking an upvoted reply button removes the upvote and decrements the count
- Clicking again re-adds it
- No regression on question upvote toggle behavior
