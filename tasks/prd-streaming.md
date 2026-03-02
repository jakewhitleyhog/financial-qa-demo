# PRD: Streaming AI Chat Responses (Issue #23)

## Introduction

Currently the user sends a message and waits silently while 3 sequential Claude API calls complete (SQL generation, confidence scoring, formatting). Only then does the full response appear. Adding streaming to the `formatResults` step lets words appear progressively as Claude generates them, dramatically reducing perceived latency even though total time is unchanged.

## Goals

- Stream the natural language formatting step token-by-token to the browser via Server-Sent Events (SSE)
- Show a blinking cursor while the assistant is generating text
- Run SQL generation and execution first (non-streaming), then stream the formatting
- Keep the existing non-streaming endpoint intact as a fallback

## User Stories

### US-001: Add formatResultsStream() to LLM service
**Description:** As a developer, I need a streaming variant of formatResults() that emits tokens via a callback as Claude generates them.

**Acceptance Criteria:**
- [ ] `formatResultsStream(userQuestion, sqlQuery, results, conversationHistory, onChunk)` exported from `llmService.js`
- [ ] Uses `client.messages.stream()` from the Anthropic SDK to stream tokens
- [ ] Calls `onChunk(text)` for each text delta received
- [ ] Returns the final Anthropic message object (for metadata extraction)
- [ ] Falls back to calling `onChunk` once with the full text if no API key is configured
- [ ] `npm test` passes

### US-002: Add streaming message endpoint to backend
**Description:** As a developer, I need a POST endpoint that runs the full pipeline and streams the formatting step via SSE.

**Acceptance Criteria:**
- [ ] New route `POST /api/chat/sessions/:sessionId/message/stream` added to `chat.js`
- [ ] `streamMessage()` controller function added to `chatController.js`
- [ ] Sets SSE headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`) before any processing
- [ ] Runs `generateSQL()` + SQL validation + execution (non-streaming); sends a single `token` event with error message on failure and ends
- [ ] Calls `formatResultsStream()`, writing each chunk as `data: {"type":"token","content":"..."}` SSE event
- [ ] After streaming completes: runs routing analysis, stores user + assistant messages in DB
- [ ] Sends final `data: {"type":"done","messageId":N,"metadata":{...}}` event then `data: [DONE]` and closes
- [ ] Error events use `data: {"type":"error","message":"..."}` format
- [ ] `npm test` passes

### US-003: Add sendMessageStream() to frontend API service
**Description:** As a developer, I need a client-side method to read the SSE stream and call callbacks for each token.

**Acceptance Criteria:**
- [ ] `chatAPI.sendMessageStream(sessionId, message, onChunk, onDone)` added to `api.js`
- [ ] Uses `fetch` with `response.body.getReader()` to read the SSE stream
- [ ] Parses SSE lines (lines starting with `data: `), skips `[DONE]` sentinel
- [ ] Calls `onChunk(content)` for `type: 'token'` events
- [ ] Calls `onDone(data)` for `type: 'done'` events
- [ ] Throws on `type: 'error'` events
- [ ] Redirects to `/login` on 401
- [ ] No changes to existing `chatAPI.sendMessage()`
- [ ] Build passes

### US-004: Update useChatSession to use streaming
**Description:** As an investor, I want to see the AI response appear word by word so the chat feels fast and alive.

**Acceptance Criteria:**
- [ ] `sendMessage()` in `useChatSession.js` uses `chatAPI.sendMessageStream()` instead of `chatAPI.sendMessage()`
- [ ] A streaming placeholder assistant message (`isStreaming: true`, `content: ''`) is added to messages immediately after the user message
- [ ] The placeholder's `content` is updated progressively as `onChunk` fires
- [ ] On completion (`onDone`), the placeholder is replaced with the final message (including `metadata`)
- [ ] On error, both the optimistic user message and streaming placeholder are removed
- [ ] Build passes

### US-005: Show streaming indicator in ChatMessage
**Description:** As an investor, I want a visual cue that the AI is actively generating a response.

**Acceptance Criteria:**
- [ ] `ChatMessage` renders a blinking `▋` cursor at the end of the content when `message.isStreaming` is true
- [ ] The cursor disappears once `isStreaming` is false
- [ ] A "Thinking..." badge appears in the role label row while `message.isStreaming && !message.content` (before first token arrives)
- [ ] No visual change to non-streaming messages
- [ ] Build passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: New backend route `POST /sessions/:sessionId/message/stream`
- FR-2: SSE event format: `data: {"type":"token"|"done"|"error",...}\n\n`
- FR-3: SSE terminal sentinel: `data: [DONE]\n\n`
- FR-4: SQL generation + execution remain synchronous before streaming begins
- FR-5: DB writes (user message + assistant message) happen in `streamMessage()`, not the client
- FR-6: Existing `POST /sessions/:sessionId/message` endpoint unchanged
- FR-7: `isStreaming: true` flag on the placeholder message in React state

## Non-Goals

- No streaming of the SQL generation step (non-deterministic streaming SQL would be unsafe)
- No streaming of the confidence scoring step
- No changes to the existing non-streaming endpoint
- No retry logic for dropped SSE connections

## Technical Considerations

- `@anthropic-ai/sdk` supports streaming via `client.messages.stream(config)` — returns an async iterable; iterate `content_block_delta` events with `delta.type === 'text_delta'`
- Express does not buffer SSE if `res.flushHeaders()` is called immediately; no additional middleware needed
- The SSE connection must be kept open until all DB writes complete (after streaming) so the `done` event includes the real `messageId`
- Buffer incomplete SSE lines in the frontend reader (split on `\n`, keep the last partial line in a `buffer` variable)
- `animate-pulse` Tailwind class works for the blinking cursor

## Success Metrics

- First token appears within ~1s of sending a message (vs. 3-6s for full response today)
- All 17 existing backend tests pass
- No regression in the non-streaming endpoint

## Open Questions

- None. Architecture is fully defined.
