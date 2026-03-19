# PLAN 49A: Wire Artifact Download Button

## Context
RunDetailDrawer.tsx line 143 has a Download button with no onClick handler. Artifacts are stored and listed in run detail responses but users can't download them. This is a demo blocker.

## What to Build
1. **Backend endpoint**: `GET /api/pipeline/:runId/artifacts/download` — serve artifacts as downloadable response
2. **Frontend service**: `downloadArtifacts(runId)` in encoreApi.ts
3. **Wire button**: onClick handler in RunDetailDrawer.tsx that triggers browser download

## Files to Modify
- `src/server/routes/pipeline.ts` — add download endpoint
- `website/frontend/src/services/encoreApi.ts` — add downloadArtifacts function
- `website/frontend/src/components/dashboard/RunDetailDrawer.tsx` — wire onClick

## Agent Research Directives
- Check how artifacts are stored (DB `artifacts` table vs filesystem `reports/`)
- Study existing download pattern in `test-cases.routes.ts` (CSV export with Content-Disposition headers, UTF-8 BOM)
- Check if artifact content is in the DB response or needs separate fetch
- Determine if ZIP packaging needed (use `archiver` npm package) or individual file download
- Check CORS and auth headers for file downloads
- Check how the Express backend proxies to Encore (worker-control.routes.ts pattern)

## Edge Cases to Audit
- Empty artifacts list → disable button
- Large artifacts → streaming vs buffered response
- Admin vs non-admin → cost data in artifacts should be filtered for non-admin
- Running pipeline → artifacts not yet available, button should be disabled or show "Available after completion"
- Network timeout on large downloads

## Effort
~60 lines across 3 files
