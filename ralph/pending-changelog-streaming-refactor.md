## [2026-03-02] — Extract shared SQL pipeline and add disconnect guard to streaming endpoint

**GitHub Issues:** #32, #33
**Branch:** ralph/streaming-refactor
**PR:** #35

### What Was Changed
- `backend/src/controllers/chatController.js`: Extracted `runSqlPipeline(message, conversationHistory)` — a module-level helper that encapsulates the three-step SQL pipeline (generate → validate → execute). Returns `{ success: true, sql, results }` on success or a typed error descriptor `{ success: false, errorType, sql, content, escalationReason, isInScope }` on failure. `streamMessage()` now calls `runSqlPipeline()` and handles the result through a single error path instead of three separate early-exit blocks. Also added `res.on('close', ...)` disconnect detection: if the client disconnects during streaming, the post-stream assistant message and escalation DB writes are skipped to prevent orphaned user messages. Also included `AND investor_id = ?` ownership guard in the `streamMessage()` session check for consistency with PR #34.

### Why It Was Changed
`streamMessage()` previously duplicated the SQL generation, validation, and execution steps inline. Extracting them into `runSqlPipeline()` means future pipeline changes (retry logic, additional validation steps, schema changes) only need to be made in one place. The disconnect guard prevents a known data integrity issue where a user navigating away mid-stream would leave an unanswered user message in the session history.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/src/controllers/chatController.js` | Modified | Extracted `runSqlPipeline()` helper; refactored `streamMessage()` to use it; added `res.on('close')` disconnect guard |

### Known Risks & Side Effects
- `sendMessage()` still uses `processQuestion()` from llmService rather than `runSqlPipeline()`. There remains conceptual duplication between the pipeline inside `processQuestion()` and the new `runSqlPipeline()` helper. A future refactor could unify them, but that would require more invasive changes to llmService.
- The disconnect guard skips the assistant message insert but does NOT delete the already-stored user message. The session will contain an orphaned user message with no assistant reply if the client disconnects. This is a known trade-off — the alternative (deleting the user message) risks data loss if the disconnect was transient.

### Potential Follow-Up Issues
- Consider whether to delete the orphaned user message on disconnect, or to mark it with a status flag (e.g., `status = 'abandoned'`) so it can be surfaced differently in the UI.
