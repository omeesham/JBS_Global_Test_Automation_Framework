# PLAN 48F: Dashboard Bug Reporting UI

## Status: PENDING
## Priority: P2-MEDIUM
## Depends On: 48D (bug reports generated)

## Problem

No way to see discovered bugs in the dashboard. Bug reports exist as JSON files but are invisible to users.

---

## Changes

### New file: `website/backend/src/routes/bug-reports.routes.ts`

- `GET /api/bugs` — list bugs (filter by module, severity, status). Reads `reports/bug-registry.json`.
- `GET /api/bugs/:id` — single bug detail
- `PATCH /api/bugs/:id/status` — update status (confirm, fix, wont_fix, not_a_bug)
- `GET /api/bugs/stats` — aggregate stats

### New file: `website/frontend/src/services/bugApi.ts`

- API client for bug endpoints

### New file: `website/frontend/src/components/dashboard/BugDiscoveryPanel.tsx`

- Bug stats: total open, by severity (CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=gray)
- Table: ID | Module | Severity | Title | Status | Found Date
- Click to expand: evidence, expected vs actual, screenshot
- Status change buttons: Confirm, Mark Fixed, Not A Bug

### File: `website/frontend/src/types/index.ts` — Add

```typescript
export type BugSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type BugStatus = 'open' | 'confirmed' | 'fixed' | 'wont_fix' | 'not_a_bug';

export interface BugReportSummary {
  id: string; testCaseId: string; module: string; feature: string;
  severity: BugSeverity; title: string; status: BugStatus;
  createdAt: string; expectedBehavior: string; actualBehavior: string; pageUrl: string;
}

export interface BugStats {
  totalOpen: number; totalConfirmed: number; totalFixed: number;
  bySeverity: Record<BugSeverity, number>; byModule: Record<string, number>;
}
```

### File: `website/frontend/src/pages/DashboardPage.tsx` — Add BugDiscoveryPanel section
### File: `website/frontend/src/components/dashboard/RunKPIBar.tsx` — Add bugs found KPI tile

---

## Files

- `website/backend/src/routes/bug-reports.routes.ts` — NEW
- `website/frontend/src/services/bugApi.ts` — NEW
- `website/frontend/src/components/dashboard/BugDiscoveryPanel.tsx` — NEW
- `website/frontend/src/types/index.ts` — add bug types
- `website/frontend/src/pages/DashboardPage.tsx` — integrate panel
- `website/frontend/src/components/dashboard/RunKPIBar.tsx` — add KPI tile
- `website/backend/src/index.ts` — register bug-reports route
