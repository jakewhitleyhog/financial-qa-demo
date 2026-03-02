## [2026-03-02] — Add conversation history to AI chat

**GitHub Issue:** #21
**Branch:** ralph/conversation-history
**PR:** #26

### What Was Changed
- `backend/src/services/llmService.js`: Added `buildHistoryMessages()` helper that normalises a raw history array into a valid alternating user/assistant sequence. Updated `processQuestion()`, `generateSQL()`, and `formatResults()` to accept `conversationHistory = []` and prepend it to the Claude API `messages` array.
- `backend/src/controllers/chatController.js`: In `sendMessage()`, fetches the last 10 messages from `chat_messages` for the current session (ordered oldest-first, before storing the current user message) and passes them as `conversationHistory` to `processQuestion()`.

### Why It Was Changed
Each message was previously treated as an independent stateless request. A follow-up question like "what about Tier 2?" would fail because Claude had no context for what "it" referred to. With session history passed as multi-turn message pairs, Claude can resolve references across the conversation.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/src/services/llmService.js` | Modified | Added `buildHistoryMessages()`, updated `processQuestion()`, `generateSQL()`, `formatResults()` signatures to accept and use history |
| `backend/src/controllers/chatController.js` | Modified | Fetch last 10 session messages before calling `processQuestion()` |
| `ralph/prd-conversation-history.json` | Added | Ralph prd.json for this feature |
| `tasks/prd-conversation-history.md` | Added | PRD document for this feature |

### Known Risks & Side Effects
- History adds tokens to every Claude API call. 10 messages ≈ 5 Q&A pairs; for long sessions this adds moderate token overhead on each turn but stays well within context limits.
- `generateSQL()` and `formatResults()` are exported and called directly in tests. Any test that calls these with 3 arguments still works (4th parameter defaults to `[]`). No test changes required.
- The `detectScope()` and `assessConfidence()` functions remain stateless — history is not passed to them.

### Potential Follow-Up Issues
- Consider making the history limit (currently 10 messages) configurable via an env variable for tuning cost vs. context quality.
