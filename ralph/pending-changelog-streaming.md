## [2026-03-02] — Stream AI chat responses via SSE

**GitHub Issue:** #23
**Branch:** ralph/streaming
**PR:** #31

### What Was Changed
- `backend/src/services/llmService.js`: Added `formatResultsStream(userQuestion, sqlQuery, results, conversationHistory, onChunk)` — uses `client.messages.stream()` from the Anthropic SDK to stream text deltas via callback as Claude generates them.
- `backend/src/controllers/chatController.js`: Added `streamMessage()` — new SSE controller that runs generateSQL + SQL validation + execution synchronously, then calls `formatResultsStream()` writing each token as `data: {"type":"token","content":"..."}`. After streaming completes, runs routing analysis, stores user + assistant messages in DB, and sends `done` event with messageId and metadata.
- `backend/src/routes/chat.js`: Added `POST /sessions/:sessionId/message/stream` route.
- `frontend/src/services/api.js`: Added `chatAPI.sendMessageStream(sessionId, message, onChunk, onDone)` — reads SSE stream via `ReadableStream` API, buffers incomplete lines, and dispatches token/done/error events to callbacks.
- `frontend/src/hooks/useChatSession.js`: Updated `sendMessage()` to use streaming — adds a streaming placeholder assistant message immediately, updates its content progressively on each token, then replaces it with the final settled message (including metadata) on completion.
- `frontend/src/components/chat/ChatMessage.jsx`: Added blinking cursor (`animate-pulse`) at end of content while `isStreaming` is true; shows "Thinking..." badge before first token arrives.

### Why It Was Changed
Investors had to wait silently for 3–6 seconds while multiple Claude API calls completed before seeing any response. Streaming the formatting step lets words appear within ~1s of sending, dramatically improving perceived responsiveness even though total processing time is unchanged.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/src/services/llmService.js` | Modified | Added `formatResultsStream()` streaming variant |
| `backend/src/controllers/chatController.js` | Modified | Added `streamMessage()` SSE controller |
| `backend/src/routes/chat.js` | Modified | Added `/message/stream` route |
| `frontend/src/services/api.js` | Modified | Added `chatAPI.sendMessageStream()` |
| `frontend/src/hooks/useChatSession.js` | Modified | Updated `sendMessage()` to use streaming |
| `frontend/src/components/chat/ChatMessage.jsx` | Modified | Added streaming cursor and Thinking badge |
| `ralph/prd-streaming.json` | Added | Ralph prd.json for this feature |
| `tasks/prd-streaming.md` | Added | PRD document for this feature |

### Known Risks & Side Effects
- The SSE endpoint stores DB writes (user message + assistant message) only after streaming completes. If the client disconnects mid-stream, the user message will be stored but the assistant message may not be — leaving an orphaned user message in the session.
- `streamMessage()` imports `generateSQL`, `formatResultsStream`, `validateAndSanitize`, and `dbQuery` directly, duplicating some logic from `sendMessage()`. If the core pipeline changes in the future, both controller functions must be updated.
- The existing non-streaming endpoint is unchanged and remains fully functional as a fallback.

### Potential Follow-Up Issues
- Handle client disconnect gracefully: detect `res.on('close', ...)` and skip DB writes if connection is lost before streaming completes.
- Consider extracting the SQL generation + execution pipeline into a shared helper used by both `sendMessage()` and `streamMessage()` to reduce duplication.
