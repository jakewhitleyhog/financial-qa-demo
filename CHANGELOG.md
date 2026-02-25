# Changelog

---

## [2026-02-25] — Fix: 404 on Page Refresh (Vercel SPA Routing)

**GitHub Issue:** #6
**Branch:** ralph/fix-spa-refresh-404
**PR:** #10

### What Was Changed
- Added a catch-all rewrite to `frontend/vercel.json`: all routes not matching `/api/:path*` now serve `index.html`, allowing React Router to handle client-side navigation

### Why It Was Changed
Refreshing any page on the Vercel-deployed app returned a 404. Vercel serves static files — when a user navigates to `/chat` or `/forum` directly or refreshes, Vercel looks for a file at that path, finds nothing, and returns 404. The catch-all rewrite tells Vercel to always serve `index.html` as the fallback, which loads the React app and lets React Router match the URL client-side.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `frontend/vercel.json` | Modified | Added `/(.*) → /index.html` catch-all rewrite |
| `ralph/prd.json` | Modified | Updated Ralph PRD for this feature |
| `tasks/prd-spa-refresh-404.md` | Added | PRD document |

### Known Risks & Side Effects
- The catch-all rewrite means any path not matching a real static file or `/api/*` will serve `index.html`. This is correct behavior for a SPA but means typo'd URLs will render the React app's 404 route (if one exists) rather than a server-level 404. Currently the app uses a `<Route path="*">` catch-all that redirects to `/`, so invalid URLs silently redirect home rather than showing an error page.

### Potential Follow-Up Issues
- None identified. This is the standard Vercel SPA fix and has no side effects on local development (Vite handles this already in dev mode).

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

### Post-Review Bug Fixes (same PR)
- `QuestionDetail.jsx`: Newly added replies now explicitly include `isUpvoted: false` in local state to ensure consistent toggle behavior without a page reload
- `forumController.js`: `removeUpvoteReply` now uses `MAX(0, upvotes - 1)` to prevent the upvote counter from going below zero in edge cases

