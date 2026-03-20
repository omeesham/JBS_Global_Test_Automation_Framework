# Plan 53J: Dashboard — Page Status Grid + Real-Time Artifacts

**Priority**: 10
**Depends on**: 53D (needs page APIs)
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

Dashboard = button-pressing alternative. All pages visible, stage progress, artifacts real-time.

## New Component: `PageStatusGrid.tsx`

Grid of all pages for current client:

| Page | Discover | Planner | Generator | Healer | Audit | Actions |
|------|----------|---------|-----------|--------|-------|---------|
| Location Legal | ✅ | ✅ | 🔵 | ⬜ | ⬜ | — |
| Location Notes | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | [Run Planner] |

- Status pills: gray/blue/green/red/amber
- Click completed cell → slide-out with artifacts
- Actions: smart "Run Next" button (dependency-aware)
- Batch: checkboxes + "Run {Stage} for Selected"
- "Register New Page" + "Re-discover" buttons
- Real-time: SSE `page_stage_updated` → update cells without refresh

## New Component: `PageDetailPanel.tsx`

Slide-out panel:
- Page metadata + URL
- Vertical stepper: 5 stages with status, date, artifact count
- Expandable artifact list per stage
- Artifact actions: view, edit, delete, download
- "Run Next Stage" button
- Permission note if `explore_without_reqs`

## Dashboard Changes (`DashboardPage.tsx`)

- Tab toggle: **Runs** | **Pages**
- Pages = `PageStatusGrid`
- Unsetup clients: "Setup Required" card
- `RunDetailDrawer`: SSE for `artifact_updated` → auto-refresh

## Key Files
- Create: `PageStatusGrid.tsx`, `PageDetailPanel.tsx`
- Modify: `DashboardPage.tsx`, `RunDetailDrawer.tsx`

## Guidance
- Grid data from `GET /api/pages?clientId=X`
- Batch button: `POST /api/pipeline/batch-run` → toast with started/skipped counts
- Reuse `RunDetailDrawer` patterns for the slide-out
