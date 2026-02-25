# PRD: Fix 404 on Page Refresh (Issue #6)

## Introduction

Refreshing any page in the Vercel-deployed app returns a 404. This happens because Vercel serves static files and doesn't know that all non-API URLs should be handled by the React app's client-side router. The fix is a single catch-all rewrite in `vercel.json` that sends all non-API requests to `index.html`.

## Goals

- Refreshing any URL (`/chat`, `/forum`, `/auth/verify`, etc.) loads the app correctly
- Direct navigation to any app URL works without a 404
- The existing `/api/*` proxy to Render is not affected

## User Stories

### US-001: Add catch-all rewrite to vercel.json
**Description:** As a user, I want to be able to refresh any page in the app without getting a 404 so I can navigate naturally.

**Acceptance Criteria:**
- [ ] `vercel.json` has a catch-all rewrite `"source": "/(.*)"` → `"destination": "/index.html"` added after the `/api/:path*` rewrite
- [ ] The `/api/:path*` rewrite remains first and is not modified
- [ ] The catch-all rewrite is last in the array so API routes take precedence
- [ ] Typecheck passes

## Functional Requirements

- FR-1: All non-API routes must resolve to `index.html` on Vercel so React Router handles them client-side
- FR-2: The `/api/:path*` rewrite must remain unchanged and continue proxying to the Render backend
- FR-3: The catch-all must be ordered after the API rewrite so it does not intercept API calls

## Non-Goals

- No changes to React Router configuration
- No changes to any component or backend file
- No local dev server changes (Vite already handles this correctly in development)

## Technical Considerations

- Vercel processes rewrites in order — the first match wins. Placing the catch-all last ensures `/api/*` is still proxied correctly.
- This is the standard fix for all Vite/React Router apps on Vercel.

## Success Metrics

- Refreshing `/chat`, `/forum`, and `/auth/verify` all load the app without a 404
