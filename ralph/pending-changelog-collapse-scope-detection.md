## [2026-03-02] — Collapse scope detection into SQL generation step

**GitHub Issue:** #22
**Branch:** ralph/collapse-scope-detection
**PR:** #29

### What Was Changed
- `backend/src/services/llmService.js`: Removed the `detectScope()` call from `processQuestion()`. The out-of-scope response (same user message and metadata as before) is now returned from within the `generateSQL()` failure branch by checking `sqlGeneration.error === 'Question is out of scope'`. `detectScope()` is kept and remains exported.

### Why It Was Changed
`detectScope()` was the first of 4 sequential Claude API calls triggered by every chat message. It was redundant — `generateSQL()` already returns `OUT_OF_SCOPE` when Claude determines a question is unrelated to the database. Removing the call reduces API round-trips per message from 4 to 3, cutting latency without changing any user-visible behaviour.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/src/services/llmService.js` | Modified | Removed `detectScope()` call from `processQuestion()`; out-of-scope branch now handled inside `generateSQL()` failure check |
| `ralph/prd-collapse-scope-detection.json` | Added | Ralph prd.json for this feature |
| `tasks/prd-collapse-scope-detection.md` | Added | PRD document for this feature |

### Known Risks & Side Effects
- `detectScope()` used a short (20-token) Claude call tuned for binary classification. `generateSQL()` uses the full `MODEL_CONFIG` (2048 tokens) plus schema context. The scope signal is now slightly more expensive per question (though it was previously run in addition to generateSQL anyway, so net cost per message is lower).
- Out-of-scope questions that previously failed at `detectScope` now go through `generateSQL()` first. If the question is truly unrelated, generateSQL's schema + examples context should reliably produce `OUT_OF_SCOPE`. Edge cases where a question tricks generateSQL into producing SQL (but would have been caught by detectScope) would no longer be caught by scope detection — they would proceed to SQL execution and sanitization instead.

### Potential Follow-Up Issues
- None identified. The SQL sanitizer and execution error handling provide a safety net for any SQL that passes generateSQL but is malformed.
