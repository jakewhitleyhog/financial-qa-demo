# PRD: Conversation History in AI Chat (Issue #21)

## Introduction

Currently every message sent to the AI is processed independently with no memory of what was asked earlier in the same session. A follow-up like "what about Tier 2?" fails because Claude has no context for what "it" refers to. This feature passes the session's prior message pairs to Claude so multi-turn conversations work naturally.

## Goals

- Allow investors to ask follow-up questions that reference prior answers
- Keep the last N message pairs as context without hitting token limits
- Maintain the existing stateless fallback (empty history = first message, works as before)
- No changes to the database schema or API response contracts

## User Stories

### US-001: Update LLM service to accept and use conversation history
**Description:** As a developer, I want `processQuestion()`, `generateSQL()`, and `formatResults()` to accept a `conversationHistory` array so Claude can resolve references to prior questions.

**Acceptance Criteria:**
- [ ] `processQuestion(userQuestion, conversationHistory = [])` accepts an optional second parameter
- [ ] `generateSQL()` prepends `conversationHistory` as prior message pairs before the current prompt in the Claude API `messages` array
- [ ] `formatResults()` prepends `conversationHistory` as prior message pairs before the current prompt in the Claude API `messages` array
- [ ] Empty history (default `[]`) produces identical behavior to today
- [ ] History entries with non-alternating roles are gracefully filtered (prevent Anthropic API validation errors)
- [ ] `npm test` passes

### US-002: Fetch session history in chat controller and pass to processQuestion
**Description:** As an investor, I want my follow-up questions to be understood in context so I don't have to repeat myself.

**Acceptance Criteria:**
- [ ] Before calling `processQuestion()` in `sendMessage()`, the last 10 messages from the current session are fetched from `chat_messages` (ordered oldest-first)
- [ ] History is passed as `conversationHistory` to `processQuestion()`
- [ ] The current user message is NOT included in the history (it's the question being asked)
- [ ] No change to any API response shape or database schema
- [ ] `npm test` passes

## Functional Requirements

- FR-1: `processQuestion(userQuestion, conversationHistory = [])` — `conversationHistory` is an array of `{ role: 'user'|'assistant', content: string }` objects
- FR-2: History is prepended to the `messages` array in the Claude API call for `generateSQL()` and `formatResults()`
- FR-3: History is capped at the 10 most recent messages from the session (≈5 Q&A pairs)
- FR-4: Only `role` and `content` fields from the DB messages are used for history (no metadata)
- FR-5: The Anthropic API requires messages to alternate user/assistant and start with user — filter or truncate history to ensure this constraint is met

## Non-Goals

- No streaming changes
- No scope detection history (detectScope stays stateless)
- No confidence scoring history (assessConfidence stays stateless)
- No UI changes — the chat interface already displays all messages
- No database schema changes

## Technical Considerations

- Anthropic API messages array must: alternate user/assistant roles; start with a user message; not end with an assistant message (the new user message goes last)
- The full SQL-generation prompt (schema + samples + question) goes in the final user message — history pairs are the prior raw question + NL answer content, keeping the schema out of history
- `chat_messages` stores `role` and `content` directly — both fields are already suitable for history reconstruction
- History fetch should use `ORDER BY created_at ASC LIMIT 10` with an offset from the end, or `ORDER BY created_at DESC LIMIT 10` then reverse

## Success Metrics

- "What about Tier 2?" after asking about Tier 1 returns Tier 2 data (not an error or wrong result)
- "Compare that to the base case" after viewing well economics works correctly
- All 17 existing tests continue to pass

## Open Questions

- None. Implementation is straightforward given the existing architecture.
