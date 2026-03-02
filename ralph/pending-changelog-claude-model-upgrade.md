## [2026-03-02] — Upgrade Claude model to claude-sonnet-4-6

**GitHub Issue:** #20
**Branch:** ralph/claude-model-upgrade
**PR:** #24

### What Was Changed
- `backend/src/config/claude.js`: Updated `MODEL_CONFIG.model` and `CONFIDENCE_MODEL_CONFIG.model` from `claude-3-5-sonnet-20241022` to `claude-sonnet-4-6`
- `backend/src/services/llmService.js`: Replaced hardcoded `model: 'claude-3-5-sonnet-20241022'` in the `detectScope` API call with `...MODEL_CONFIG` spread, so all Claude API calls now route through a single config source

### Why It Was Changed
`claude-3-5-sonnet-20241022` is an outdated model. `claude-sonnet-4-6` is the current generation and provides better SQL generation accuracy and stronger reasoning, directly improving the quality of AI answers investors receive. A secondary bug was also fixed: the `detectScope()` function was bypassing `MODEL_CONFIG` entirely with its own hardcoded model string.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/src/config/claude.js` | Modified | Updated both model config objects to `claude-sonnet-4-6` |
| `backend/src/services/llmService.js` | Modified | Replaced hardcoded model string in detectScope with `...MODEL_CONFIG` |
| `ralph/prd-claude-model-upgrade.json` | Added | Ralph prd.json for this feature |
| `tasks/prd-claude-model-upgrade.md` | Added | PRD document for this feature |

### Known Risks & Side Effects
- `claude-sonnet-4-6` API responses may differ slightly in phrasing or SQL style from the previous model. Existing prompt templates were not changed, so any behavioral differences are model-level, not prompt-level.
- The `CONFIDENCE_MODEL_CONFIG` previously could have used a cheaper/faster model for scoring. Both configs now use the same model; consider splitting them in the future if cost becomes a concern.

### Potential Follow-Up Issues
- Consider using `claude-haiku-4-5` for `CONFIDENCE_MODEL_CONFIG` to reduce cost on the confidence scoring call (low-stakes, short output).
