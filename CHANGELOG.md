# Changelog

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

