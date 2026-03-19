# PLAN 49H: Triage Panel Frontend

## Context
When pipeline pauses for triage (`awaiting_triage` status), show classified failures with plain English RCA evidence on the dashboard. Users decide per-failure or bulk: "Report Bug" vs "Heal as Feature Change" vs "Needs Investigation". Non-technical users — treat as dumb, progressive disclosure, no stack traces by default.

## What to Build
1. **TriagePanel.tsx** — main component:
   - Grouped by AI classification (likely bugs first, uncertain last)
   - Per-item card: summary, expected vs actual, AI reasoning, confidence badge (HIGH/MEDIUM/LOW)
   - Expandable evidence section: screenshot, console errors, network failures, replication steps
   - Checkboxes for bulk selection with "Select All" per group
   - Per-item buttons: "Report Bug", "Heal as Feature Change"
   - Master "Submit All Decisions & Resume Pipeline" button
   - Confirmation modal before submitting
2. **Service functions** in bugApi.ts
3. **Type definitions** in types/index.ts
4. **Integration** in DashboardPage.tsx — show TriagePanel when any run has `awaiting_triage`

## Files to Modify
- `website/frontend/src/components/dashboard/TriagePanel.tsx` — new (~250 lines)
- `website/frontend/src/services/bugApi.ts` — add triage functions (~40 lines)
- `website/frontend/src/types/index.ts` — add TriageItem type (~30 lines)
- `website/frontend/src/pages/DashboardPage.tsx` — integrate panel

## Agent Research Directives
- Read BugDiscoveryPanel.tsx — reuse severity badges, color coding, expandable row pattern
- Read RunDetailDrawer.tsx — understand drawer vs inline panel UX patterns
- Research bulk action UX: filter-then-batch (filter by confidence, select all filtered, one-click action)
- Research progressive disclosure for technical vs non-technical users (industry: Katalon, BrowserStack, mabl)
- Check existing Tailwind component patterns in the codebase for consistency
- Study how screenshots are served — URL pattern for displaying failure screenshots
- Research confidence badge colors (HIGH=red, MEDIUM=yellow, LOW=gray or similar)

## UX Design
```
┌──────────────────────────────────────────────────────┐
│ ⚠ Failure Triage Required                [3 items]  │
│                                                      │
│ ☐ Select All        [Report Bug] [Heal as Change]   │
│                                                      │
│ ┌─ LIKELY BUGS ────────────────────────────────────┐ │
│ │ ☐ Save button crashes with server error  🔴HIGH │ │
│ │   Locations > Notes  •  TC-LOC-NOT-003          │ │
│ │   Expected: Save succeeds, shows "Saved" toast   │ │
│ │   Actual: Server returned 500 Internal Error     │ │
│ │   AI: "POST /api/save returns 500. Verified on   │ │
│ │        live app — error persists."               │ │
│ │   ▸ View Evidence                                │ │
│ │   [Report Bug]  [Heal as Feature Change]         │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ ┌─ NEEDS REVIEW ──────────────────────────────────┐ │
│ │ ☐ Currency dropdown missing "EUR"    🟡MEDIUM   │ │
│ │   ...                                            │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│        [Submit All Decisions & Resume Pipeline]      │
└──────────────────────────────────────────────────────┘
```

## Edge Cases to Audit
- No failures (panel shouldn't render)
- All failures same classification → skip group headers
- User submits with some items still "pending" → block with message "X items need decisions"
- Screenshot loading → lazy load with placeholder skeleton
- Mobile responsiveness → stack layout, expandable sections
- Accessibility → keyboard navigation for checkboxes, screen reader labels
- Empty evidence (no screenshot, no console errors) → hide empty sections gracefully
- SSE disconnection while reviewing → show reconnection banner

## Effort
~320 lines across 4 files
