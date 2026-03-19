# PLAN 49G: Triage API Backend

## Context
Backend endpoints for creating, reading, and deciding on triage items. The Audit agent produces a triage report JSON, the backend stores it, and the frontend reads/updates it via these endpoints.

## What to Build
Add to `website/backend/src/routes/bug-reports.routes.ts`:

1. `POST /api/bugs/triage` — orchestrator/audit agent posts triage report, stores triage items
2. `GET /api/bugs/triage?runId=X` — fetch pending triage items for a run
3. `POST /api/bugs/triage/:id/decide` — single decision: `report_bug | heal_feature_change | needs_investigation`
4. `POST /api/bugs/triage/bulk-decide` — batch: `{ ids: string[], decision: string }`
5. `POST /api/bugs/triage/:runId/submit` — submit all decisions, trigger pipeline resume via Encore API

## Files to Modify
- `website/backend/src/routes/bug-reports.routes.ts` — add 5 new endpoints

## Agent Research Directives
- Read existing bug-reports.routes.ts — understand file-based storage pattern (JSON files in `reports/bugs/`)
- Read how Express backend proxies to Encore backend (`worker-control.routes.ts` pattern for proxy calls)
- Check tenant middleware — triage items must be tenant-scoped
- Determine storage: filesystem (`reports/triage/`) like bugs, or in-memory (ephemeral per run)?
- Read the TriageItem interface from diagnostics.ts (after PLAN_49E adds it)
- Check how the `/api/pipeline/:id/resume-triage` endpoint works (after PLAN_49F adds it)

## Edge Cases to Audit
- Concurrent decisions on same item (race condition — use file locking or last-write-wins?)
- Triage items for cancelled pipeline — need cleanup on pipeline cancellation
- Permission model: who can make triage decisions? (super_admin + client_admin, or any authenticated user?)
- Validation: prevent invalid decision values
- Bulk-decide with mixed valid/invalid IDs — partial success or all-or-nothing?
- Submit with undecided items — block and return list of pending items

## Effort
~120 lines, 1 file
