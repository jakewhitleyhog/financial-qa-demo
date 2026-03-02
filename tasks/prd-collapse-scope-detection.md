# PRD: Collapse Scope Detection into SQL Generation (Issue #22)

## Introduction

Every chat message currently triggers 4 sequential Claude API calls: detectScope → generateSQL → assessConfidence → formatResults. The `detectScope()` call is largely redundant — `generateSQL()` already returns `OUT_OF_SCOPE` when a question is unrelated to the database. Removing the standalone scope detection step eliminates one full API round-trip per message, reducing latency with no loss of functionality.

## Goals

- Eliminate the `detectScope()` call from `processQuestion()` without changing user-visible behaviour
- Derive `isInScope` from whether `generateSQL()` produced valid SQL (already the source of truth)
- Reduce the number of Claude API calls per message from 4 to 3

## User Stories

### US-001: Remove detectScope call from processQuestion and derive isInScope from SQL generation result
**Description:** As a developer, I want `processQuestion()` to skip the separate scope detection step so each message requires one fewer API call.

**Acceptance Criteria:**
- [ ] `detectScope()` is no longer called inside `processQuestion()`
- [ ] `isInScope` is `true` when `generateSQL()` returns `success: true`; `false` when it returns `OUT_OF_SCOPE` error
- [ ] The out-of-scope response message returned to the user is identical to before: "I apologize, but I can only answer questions related to..."
- [ ] `needsEscalation` and `escalationReason` for out-of-scope questions are unchanged
- [ ] `detectScope()` function itself is NOT deleted — it remains exported for potential standalone use or future testing
- [ ] `npm test` passes

## Functional Requirements

- FR-1: Remove the `detectScope()` call from `processQuestion()` (Step 1 of the current pipeline)
- FR-2: After `generateSQL()` runs, check if `sqlGeneration.error === 'Question is out of scope'` to determine `isInScope: false`
- FR-3: Return the same out-of-scope message and metadata shape as the current `detectScope` branch
- FR-4: `detectScope()` function remains in `llmService.js` and in the default export

## Non-Goals

- Do not delete the `detectScope()` function
- No changes to `chatController.js`, `promptTemplates.js`, or any other file
- No changes to the API response shape
- No UI changes

## Technical Considerations

- The `generateSQL()` function already returns `{ success: false, error: 'Question is out of scope' }` when Claude responds with `OUT_OF_SCOPE`
- The `isInScope` flag in the returned metadata and in the routing analysis call comes from the LLM service — removing detectScope shifts the source of truth entirely to generateSQL, which is already correct
- `buildScopeDetectionPrompt` import can remain; it's used by the still-exported `detectScope()` function

## Success Metrics

- Zero calls to `detectScope()` during normal `processQuestion()` execution
- Out-of-scope questions still receive a clear, user-friendly refusal message
- All 17 existing backend tests pass

## Open Questions

- None. The generateSQL OUT_OF_SCOPE sentinel is already the definitive scope signal.
