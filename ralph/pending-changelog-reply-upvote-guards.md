## [2026-02-25] — Fix: Reply Upvote Guards

**GitHub Issues:** #8, #9
**Branch:** ralph/reply-upvote-guards
**PR:** #11

### What Was Changed
- Frontend: `ReplyThread.jsx` — added `= () => {}` default for `onRemoveUpvote` prop so the component is safe to render without it
- Backend: `forumController.js` — `removeUpvoteReply` now checks if the reply exists before attempting the delete; returns 404 if not found (previously returned a misleading 400)

### Why It Was Changed
Both issues were follow-ups from PR #7 (Reply Upvote Toggle). The `onRemoveUpvote` prop had no default, so any future consumer of `ReplyThread` that omitted it would throw a `TypeError` when clicking an upvoted reply. The DELETE endpoint returned 400 "You have not upvoted this reply" for non-existent reply IDs, which was semantically wrong — callers had no way to distinguish "reply doesn't exist" from "reply exists but not upvoted."

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `frontend/src/components/forum/ReplyThread.jsx` | Modified | Default `onRemoveUpvote` to no-op |
| `backend/src/controllers/forumController.js` | Modified | Added 404 check before DELETE in `removeUpvoteReply` |
| `ralph/prd-reply-upvote-guards.json` | Added | Ralph PRD for this feature |
| `tasks/prd-reply-upvote-guards.md` | Added | PRD document |

### Known Risks & Side Effects
- None identified. Both changes are purely defensive — they add guards without altering any existing happy-path behavior.

### Potential Follow-Up Issues
- None identified.
