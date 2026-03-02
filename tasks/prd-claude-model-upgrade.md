# PRD: Upgrade Claude Model to claude-sonnet-4-6 (Issue #20)

## Introduction

The backend currently calls `claude-3-5-sonnet-20241022` for all LLM operations. `claude-sonnet-4-6` is the current generation model and offers better SQL generation accuracy and stronger reasoning — directly improving the quality of AI answers investors receive. This is a one-file, one-line change with no architectural impact.

## Goals

- Replace the outdated model string with `claude-sonnet-4-6` in all config entries
- Verify the app still builds and tests pass after the change

## User Stories

### US-001: Update model config to claude-sonnet-4-6
**Description:** As a developer, I want the backend to use the latest Claude model so investors get higher-quality AI answers.

**Acceptance Criteria:**
- [ ] `MODEL_CONFIG.model` in `backend/src/config/claude.js` is set to `claude-sonnet-4-6`
- [ ] `CONFIDENCE_MODEL_CONFIG.model` in `backend/src/config/claude.js` is set to `claude-sonnet-4-6`
- [ ] No other files reference `claude-3-5-sonnet-20241022`
- [ ] `npm test` passes in the backend
- [ ] Build passes in the frontend (`npm run build`)

## Functional Requirements

- FR-1: `MODEL_CONFIG.model` must be `'claude-sonnet-4-6'`
- FR-2: `CONFIDENCE_MODEL_CONFIG.model` must be `'claude-sonnet-4-6'`
- FR-3: No hardcoded model strings elsewhere in the codebase

## Non-Goals

- No changes to temperature, max_tokens, or any other config values
- No changes to prompt logic or LLM service architecture
- No changes to the frontend

## Technical Considerations

- File to change: `backend/src/config/claude.js`
- Grep for `claude-3-5-sonnet` across the whole repo to catch any other references
- The model ID format for claude-sonnet-4-6 is exactly `'claude-sonnet-4-6'` (no date suffix)

## Success Metrics

- Zero references to `claude-3-5-sonnet-20241022` in the codebase after the change
- All existing tests continue to pass

## Open Questions

- None. This is a straightforward model string replacement.
