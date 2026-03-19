# PLAN 45 (Revised & Executed): Website Pipeline Triggers

## Status: EXECUTED

## Context
Original plan was 80% redundant — chat trigger, SSE progress, intent classification all already existed.
This revised plan delivered only what was actually missing.

## What Was Already Working (no changes needed)
- Chat → Haiku intent → `trigger_run` action → Encore pipeline → SSE → PipelineProgress
- `chatbot.service.ts:351` handles `trigger_run`, passes `clientId`
- `encoreApi.ts:32` SSE subscription
- Dashboard run list, detail drawer, KPIs, charts

## What Was Delivered

### 1. `usePipelineSSE` hook (NEW)
`website/frontend/src/hooks/usePipelineSSE.ts`
- Extracted SSE logic from ChatPage into a reusable hook
- Returns `{ stages, isActive, startWatch, stopWatch }`
- Used by both ChatPage and DashboardPage — progress shows in-place

### 2. `RunPipelineModal` (NEW)
`website/frontend/src/components/dashboard/RunPipelineModal.tsx`
- Modal with form: website, feature, module, intent, targetUrl, priority, dry run toggle
- Website dropdown auto-scoped to client via `useWebsite()` context
- On submit: calls `createPipelineRun()` with `clientId` + tracks `website_runs`

### 3. DashboardPage — "Run Pipeline" button + live SSE
`website/frontend/src/pages/DashboardPage.tsx`
- Added "Run Pipeline" button in header
- Wired `usePipelineSSE` hook for live progress in RunDetailDrawer
- Auto-refreshes run list on pipeline complete

### 4. RunDetailDrawer — live stage display
`website/frontend/src/components/dashboard/RunDetailDrawer.tsx`
- Accepts optional `liveStages` prop
- When running + liveStages provided: shows animated PipelineProgress
- Falls back to static stage display for completed runs

### 5. ChatPage — refactored + bug fixes
`website/frontend/src/pages/ChatPage.tsx`
- Replaced inline SSE code with `usePipelineSSE` hook
- Fixed: `clientId` now passed to `createPipelineRun()` (was missing)
- Fixed: `trackWebsiteRun()` called after pipeline creation (was skipped)

### 6. Type + API fixes
- `types/index.ts`: Added `clientId?` and `dryRun?` to `CreatePipelineRequest`
- `services/api.ts`: Added `trackWebsiteRun()` function

## Removed from Original Plan
- `POST /api/pipeline/run-from-chat` endpoint — unnecessary, chatbot already calls pipeline internally
- "Pipeline intent classifier" — Haiku already IS the classifier via ACTION_CATALOG
- All backend changes — backend was already complete
