# Changelog

---

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

---

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

---

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

---

## [2026-02-27] — Fix: Capital Allocation Pie Chart — Percentage Labels Inside Arc

**Branch:** ralph/fix-huntington-wi-financials
**PR:** #18

### What Was Changed
- Replaced the exterior `label` renderer on the Capital Allocation donut chart with a custom `PieSliceLabel` component that draws the percentage text **inside** the arc (at the radial midpoint of each slice)
- Slices smaller than 8% of the total are skipped (text would be unreadable); the Legend still identifies all categories

### Why It Was Changed
The Completion slice (49%) was not displaying its percentage. Root cause: Recharts computes label positions in SVG space and places them outside the arc even when `labelLine={false}`. For certain slice midpoint angles the computed coordinate falls outside the SVG viewport, silently clipping the text. Rendering inside the arc is geometrically guaranteed to stay within bounds.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `frontend/src/pages/DashboardPage.jsx` | Modified | `PieSliceLabel` renders `%` text inside arc; replaces exterior label function |

### Known Risks & Side Effects
- Slices below the 8% threshold (currently Infrastructure at 4%) show no inline label. This is intentional — the slice is too narrow for readable text. Category name remains in the Legend.

---

## [2026-02-27] — Fix: Scale Dashboard Financials to Huntington 11% WI + Pie Chart Label Clipping

**Branch:** ralph/fix-huntington-wi-financials
**PR:** #16

### What Was Changed
- Backend seed data: all WEM V fund-level dollar figures scaled to Huntington Oil & Gas II's 11% working interest — capital raise target ($220M → $24.2M), annual revenue/income/capex/production, capital allocation amounts, projected returns capital invested/returned, price sensitivity capitals. Rate metrics (IRR, MOIC, return-of-capital years) unchanged.
- `entity_name` corrected from `'WEM Uintah V, LLC'` to `'Huntington Oil & Gas II, LLC'`
- Dashboard pie chart: replaced full-name inline arc labels (which were clipped at the container edge) with percentage-only slice labels + a `<Legend>` for category names

### Why It Was Changed
The dashboard was displaying WEM V fund-level financials ($220M capital raise, $287M peak revenue) rather than Huntington Oil & Gas II investor-specific figures. Huntington holds an 11% working interest in the WEM V program; the correct investor view scales all dollar amounts by that share. The "Completion" label was additionally being cut off in the capital allocation donut chart because full-name labels were positioned outside the arc without enough horizontal room.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/database/seed.sql` | Modified | 11% WI scaling, corrected entity name |
| `backend/database/qa_demo.db` | Modified | Live database updated (gitignored) |
| `frontend/src/pages/DashboardPage.jsx` | Modified | Pie chart labels → percentage on slice + Legend |

### Known Risks & Side Effects
- All financial figures are approximations (flat 11% WI scale). Marked with `TODO` in seed.sql; replace with Huntington-specific valuation model when available.

---

## [2026-02-27] — Feat: UI Migration to shadcn/ui + Tailwind v4, Deal Dashboard

**Branch:** ralph/shadcn-tremor-migration
**PR:** #14

### What Was Changed
- Upgraded Tailwind CSS v3 → v4: `@tailwindcss/vite` plugin replaces PostCSS approach; `@theme` block in `index.css` replaces `tailwind.config.js`; warm brown palette fully preserved
- Replaced all 6 UI primitives (Button, Card, Input, Badge, Alert, Skeleton) with shadcn/ui-pattern components using `class-variance-authority` and `tailwind-merge` — drop-in replacements, no callsite changes
- Added Deal Dashboard page (`/dashboard`) with recharts-powered KPI cards, area chart (annual financials), donut pie (capital allocation), bar chart (price sensitivity), projected returns table, and distributions sparkline
- Added backend `GET /api/deals/summary` endpoint returning structured deal data
- Wired Dashboard into App.jsx routing and top-nav

### Why It Was Changed
UI components were hand-rolled with inconsistent class patterns. shadcn/ui provides a well-structured copy-paste primitive system. Tailwind v4 reduces config surface area. The dashboard gives investors a visual summary of deal economics without reading raw documents.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `frontend/src/index.css` | Modified | Tailwind v4 @import + @theme block |
| `frontend/vite.config.js` | Modified | @tailwindcss/vite plugin, Vitest test block |
| `frontend/postcss.config.js` | Modified | Emptied (Tailwind v4 no longer needs PostCSS) |
| `frontend/tailwind.config.js` | Deleted | Replaced by @theme in index.css |
| `frontend/src/lib/utils.js` | Modified | cn() now uses tailwind-merge |
| `frontend/components.json` | Added | shadcn/ui config |
| `frontend/src/components/ui/*.jsx` | Modified | All 6 primitives rewritten |
| `frontend/src/pages/DashboardPage.jsx` | Added | Deal dashboard with recharts |
| `frontend/src/services/api.js` | Modified | Added dealAPI.getSummary |
| `frontend/src/App.jsx` | Modified | Dashboard route and nav item |
| `backend/src/controllers/dealController.js` | Added | GET /api/deals/summary handler |
| `backend/src/routes/deals.js` | Added | /api/deals route |
| `backend/src/server.js` | Modified | Registered deal routes |

### Known Risks & Side Effects
- `@tremor/react` was evaluated but is incompatible with Tailwind v4 (requires `tailwind.config.js` preset). Recharts used directly instead.

---

## [2026-02-26] — Feat: Unit Tests + GitHub Actions CI

**Branch:** ralph/unit-tests
**PR:** #12

### What Was Changed
- Added Vitest test suite for backend: 17 tests covering `forumController` (createQuestion, listQuestions, getQuestion, addReply, upvoteReply, removeUpvoteReply) with mocked database and direct `req`/`res` construction
- Added Vitest test suite for frontend: 16 tests across `tagExtractor` (pure utility), `ReplyThread` (upvote toggle, default prop guards), and `UpvoteButton` (click handlers, loading/disabled state)
- Added `.github/workflows/test.yml`: two parallel jobs (backend, frontend) triggered on push and PR to `main`

### Why It Was Changed
No tests existed. The CI pipeline ensures regressions are caught before merge on every PR to main.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/vitest.config.js` | Added | Vitest config (node environment) |
| `backend/src/tests/setup.js` | Added | Sets JWT_SECRET and NODE_ENV for tests |
| `backend/src/tests/forumController.test.js` | Added | 17 backend unit tests |
| `frontend/vite.config.js` | Modified | Added Vitest test block |
| `frontend/src/tests/setup.js` | Added | Imports @testing-library/jest-dom |
| `frontend/src/tests/tagExtractor.test.js` | Added | 5 pure utility tests |
| `frontend/src/tests/ReplyThread.test.jsx` | Added | 6 component tests |
| `frontend/src/tests/UpvoteButton.test.jsx` | Added | 5 component tests |
| `.github/workflows/test.yml` | Added | CI pipeline |
| `backend/package.json` | Modified | Added test scripts |
| `frontend/package.json` | Modified | Added test scripts |

### Known Risks & Side Effects
- `package-lock.json` is gitignored, so CI uses `npm install` (not `npm ci`) and has no dependency cache.

---

## [2026-02-25] — Fix: Reply Upvote Guards

**GitHub Issues:** #8, #9
**Branch:** ralph/reply-upvote-guards
**PR:** #11

### What Was Changed
- Frontend: `ReplyThread.jsx` — added `= () => {}` default for `onRemoveUpvote` prop so the component is safe to render without it
- Backend: `forumController.js` — `removeUpvoteReply` now checks if the reply exists before attempting the delete; returns 404 if not found (previously returned a misleading 400)

### Why It Was Changed
Both issues were follow-ups from PR #7 (Reply Upvote Toggle). The `onRemoveUpvote` prop had no default, so any future consumer of `ReplyThread` that omitted it would throw a `TypeError` when clicking an upvoted reply. The DELETE endpoint returned 400 "You have not upvoted this reply" for non-existent reply IDs, which was semantically wrong — callers had no way to distinguish "reply doesn't exist" from "reply exists but not upvoted."

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `frontend/src/components/forum/ReplyThread.jsx` | Modified | Default `onRemoveUpvote` to no-op |
| `backend/src/controllers/forumController.js` | Modified | Added 404 check before DELETE in `removeUpvoteReply` |
| `ralph/prd-reply-upvote-guards.json` | Added | Ralph PRD for this feature |
| `tasks/prd-reply-upvote-guards.md` | Added | PRD document |

### Known Risks & Side Effects
- None identified. Both changes are purely defensive — they add guards without altering any existing happy-path behavior.

### Post-Review Bug Fixes (same PR)
- `ReplyThread.jsx`: `onUpvote` also defaulted to no-op (symmetrical fix alongside `onRemoveUpvote`)
- `forumController.js`: `upvoteReply` (POST) also checks reply existence and returns 404 — symmetrical with `removeUpvoteReply`

---

## [2026-02-25] — Fix: 404 on Page Refresh (Vercel SPA Routing)

**GitHub Issue:** #6
**Branch:** ralph/fix-spa-refresh-404
**PR:** #10

### What Was Changed
- Added a catch-all rewrite to `frontend/vercel.json`: all routes not matching `/api/:path*` now serve `index.html`, allowing React Router to handle client-side navigation

### Why It Was Changed
Refreshing any page on the Vercel-deployed app returned a 404. Vercel serves static files — when a user navigates to `/chat` or `/forum` directly or refreshes, Vercel looks for a file at that path, finds nothing, and returns 404. The catch-all rewrite tells Vercel to always serve `index.html` as the fallback, which loads the React app and lets React Router match the URL client-side.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `frontend/vercel.json` | Modified | Added `/(.*) → /index.html` catch-all rewrite |
| `ralph/prd.json` | Modified | Updated Ralph PRD for this feature |
| `tasks/prd-spa-refresh-404.md` | Added | PRD document |

### Known Risks & Side Effects
- The catch-all rewrite means any path not matching a real static file or `/api/*` will serve `index.html`. This is correct behavior for a SPA but means typo'd URLs will render the React app's 404 route (if one exists) rather than a server-level 404. Currently the app uses a `<Route path="*">` catch-all that redirects to `/`, so invalid URLs silently redirect home rather than showing an error page.

### Potential Follow-Up Issues
- None identified. This is the standard Vercel SPA fix and has no side effects on local development (Vite handles this already in dev mode).

---

## [2026-02-25] — Fix: Reply Upvote Toggle

**GitHub Issue:** #5
**Branch:** ralph/reply-upvote-toggle
**PR:** #7

### What Was Changed
- Backend: Added `removeUpvoteReply` function to `forumController.js` — deletes the upvote record from `forum_upvotes` and decrements `forum_replies.upvotes`
- Backend: Registered `DELETE /api/forum/replies/:id/upvote` route in `forum.js`
- Frontend: Added `removeUpvoteReply(id)` to `forumAPI` in `api.js` — calls the new DELETE endpoint
- Frontend: Added `handleRemoveUpvoteReply(replyId)` to `QuestionDetail.jsx` — updates local reply state on success
- Frontend: Passed `onRemoveUpvote` prop from `QuestionDetail` down to `ReplyThread`
- Frontend: Updated `ReplyThread.jsx` — removed `disabled={reply.isUpvoted}`, replaced `handleUpvote` with `handleUpvoteToggle` that calls add or remove based on current state

### Why It Was Changed
Users could upvote a reply but had no way to remove the upvote. The button was permanently disabled after clicking. This mirrors the existing question upvote toggle, which was already fully implemented. The fix adds the missing backend endpoint and wires the frontend to call add vs. remove based on `reply.isUpvoted`.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/src/controllers/forumController.js` | Modified | Added `removeUpvoteReply` function |
| `backend/src/routes/forum.js` | Modified | Registered DELETE `/replies/:id/upvote` route |
| `frontend/src/services/api.js` | Modified | Added `removeUpvoteReply` to `forumAPI` |
| `frontend/src/components/forum/QuestionDetail.jsx` | Modified | Added `handleRemoveUpvoteReply`, passed to ReplyThread |
| `frontend/src/components/forum/ReplyThread.jsx` | Modified | Toggle upvote logic, removed disabled state |
| `ralph/prd.json` | Added | Ralph PRD for this feature |
| `tasks/prd-reply-upvote-toggle.md` | Added | PRD document |

### Known Risks & Side Effects
- `ReplyThread.jsx` is used in `QuestionDetail.jsx` only — no other consumers affected
- The `onRemoveUpvote` prop is new; any future use of `ReplyThread` without it will silently fail to remove upvotes (the toggle will call `undefined`). Future consumers must pass both `onUpvote` and `onRemoveUpvote`.

### Potential Follow-Up Issues
- The inline upvote button in `ReplyThread.jsx` duplicates logic from the shared `UpvoteButton` component. Consider refactoring `ReplyThread` to use `UpvoteButton` for consistency.

### Post-Review Bug Fixes (same PR)
- `QuestionDetail.jsx`: Newly added replies now explicitly include `isUpvoted: false` in local state to ensure consistent toggle behavior without a page reload
- `forumController.js`: `removeUpvoteReply` now uses `MAX(0, upvotes - 1)` to prevent the upvote counter from going below zero in edge cases


## [2026-03-02] — Stream AI chat responses via SSE

**GitHub Issue:** #23
**Branch:** ralph/streaming
**PR:** #31

### What Was Changed
- `backend/src/services/llmService.js`: Added `formatResultsStream(userQuestion, sqlQuery, results, conversationHistory, onChunk)` — uses `client.messages.stream()` from the Anthropic SDK to stream text deltas via callback as Claude generates them. Bug fix: removed redundant `await stream.finalMessage()` call after the `for await` loop (the loop alone drains all events).
- `backend/src/controllers/chatController.js`: Added `streamMessage()` — new SSE controller that runs generateSQL + SQL validation + execution synchronously, then calls `formatResultsStream()` writing each token as `data: {"type":"token","content":"..."}`. After streaming completes, runs routing analysis, stores user + assistant messages in DB, and sends `done` event with messageId and metadata. Bug fix: all three early-exit paths (out-of-scope, SQL validation failure, SQL execution failure) now correctly insert into `escalated_questions`, matching `sendMessage()` behavior.
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

## [2026-03-02] — Extract shared SQL pipeline and add disconnect guard to streaming endpoint

**GitHub Issues:** #32, #33
**Branch:** ralph/streaming-refactor
**PR:** #35

### What Was Changed
- `backend/src/controllers/chatController.js`: Extracted `runSqlPipeline(message, conversationHistory)` — a module-level helper that encapsulates the three-step SQL pipeline (generate → validate → execute). Returns `{ success: true, sql, results }` on success or a typed error descriptor `{ success: false, errorType, sql, content, escalationReason, isInScope }` on failure. `streamMessage()` now calls `runSqlPipeline()` and handles the result through a single error path instead of three separate early-exit blocks. Also added `res.on('close', ...)` disconnect detection: if the client disconnects during streaming, the post-stream assistant message and escalation DB writes are skipped to prevent orphaned user messages.

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

## [2026-03-02] — Fix Unanswered tab SQL alias error

**Branch:** fix/unanswered-tab
**PR:** #36

### What Was Changed
- `backend/src/controllers/forumController.js`: Added `fq` alias to the count query in `listQuestions()`. The `whereClause` for `sortBy=unanswered` references `fq.is_answered` but the count query had no `fq` alias, causing a SQLite error on every request to the Unanswered tab.

### Why It Was Changed
Every load of the Unanswered tab returned "Failed to List Questions" due to the unresolved `fq` table alias in the count query.

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `backend/src/controllers/forumController.js` | Modified | Added `fq` alias to count query (`FROM forum_questions fq`) |

### Known Risks & Side Effects
- None identified.

### Potential Follow-Up Issues
- None identified.
