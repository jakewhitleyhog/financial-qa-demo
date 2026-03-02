## [2026-03-02] — Harden OUT_OF_SCOPE check, session ownership, and scope detection config

**GitHub Issues:** #25, #27, #30
**Branch:** ralph/backend-fixes
**PR:** #34

### What Was Changed
- `backend/src/config/claude.js`: Added `SCOPE_DETECTION_MODEL_CONFIG` constant with explicit `max_tokens: 20` and `temperature: 0.0`, so the intent of the low token cap is documented and cannot be silently broken by property reordering in a future refactor.
- `backend/src/services/llmService.js`: Changed `OUT_OF_SCOPE` check in `generateSQL()` from substring match (`sqlQuery.includes('OUT_OF_SCOPE')`) to strict equality (`sqlQuery.trim() === 'OUT_OF_SCOPE'`) to prevent false-positives on column names or string literals that contain the substring. Updated `detectScope()` to use `SCOPE_DETECTION_MODEL_CONFIG` instead of spreading `MODEL_CONFIG` and overriding `max_tokens`.
- `backend/src/controllers/chatController.js`: Added `AND investor_id = ?` to all three `chat_sessions` ownership checks (`getSession`, `sendMessage`, `streamMessage`) to prevent authenticated investors from reading or sending messages to sessions belonging to other investors.

### Why It Was Changed
Three low/medium risk issues identified during code reviews were addressed in a single PR to reduce noise. The most impactful is the session ownership fix (#27), which closes a medium-severity access control gap where an investor who discovered another session ID could read that session's conversation history or send messages that include the other investor's prior turns as context.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/src/config/claude.js` | Modified | Added `SCOPE_DETECTION_MODEL_CONFIG` constant |
| `backend/src/services/llmService.js` | Modified | Strict OUT_OF_SCOPE equality check; use SCOPE_DETECTION_MODEL_CONFIG in detectScope() |
| `backend/src/controllers/chatController.js` | Modified | Add investor_id guard to all session ownership queries |

### Known Risks & Side Effects
- The `AND investor_id = ?` change means any request hitting a valid session ID that belongs to a different investor now returns 404 instead of 200. This is the correct behaviour, but any client code that assumed sessions were globally accessible would break. No such client code exists currently.
- `SCOPE_DETECTION_MODEL_CONFIG` is exported but only used by `detectScope()`, which is not called in the main pipeline (it was removed in PR #29). If `detectScope()` is removed in a future cleanup, `SCOPE_DETECTION_MODEL_CONFIG` can also be removed.

### Potential Follow-Up Issues
- None identified.
