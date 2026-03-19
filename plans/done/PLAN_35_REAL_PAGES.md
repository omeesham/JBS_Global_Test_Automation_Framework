# PLAN_35: DashboardPage + SettingsPage Expansion + Shared Components

**Status**: Pending
**Dependencies**: After PLAN_33 + PLAN_34

---

> **IP VOCABULARY RULE**: All client-visible text must use IP-safe vocabulary. See PLAN_36 IP Protection Rules before writing any UI copy. Never use: "agents", "pipeline stages", "convergence guards". Internal names appear ONLY in the super admin Pipeline Deep Config tab.

---

## DashboardPage (replaces DashboardPage + ExecutionPage + AgentMonitorPage + RunDetailPage)

ONE page, all visual data. Charts, tables, drill-down — plus one AI-powered "morning briefing".

### Data Sources (ALL from Encore backend, ZERO mock)

- `GET /api/pipeline/list` → pipeline runs table (`encoreApi.ts listPipelineRuns()`)
- `GET /api/admin/usage` → KPI stats (`encoreApi.ts getAdminUsage()`)
- `GET /api/admin/worker-status` → worker indicator (`encoreApi.ts getWorkerStatus()`)
- `GET /api/pipeline/:id` → run detail + stages + artifacts (`encoreApi.ts getPipelineRunDetail()`)
- `GET /api/events/:runId` → SSE real-time updates (`encoreApi.ts subscribeToPipelineEvents()`)

### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  MORNING BRIEFING (AI-generated, per-session cache):     │
│  "Since your last visit (2 days ago): 3 test runs        │
│   completed. Pass rate improved from 72% to 89%.         │
│   1 run hit a quality check limit on checkout flow."     │
│  [View Details]                          [Dismiss]       │
├─────────────────────────────────────────────────────────┤
│  KPI Bar: Total Runs | Completed | Pass Rate | Cost*    │
│           | Avg Cost/Run* | Worker: ● Connected          │
│  *Cost fields: visibility controlled by super admin      │
├─────────────────────────────────────────────────────────┤
│  Filter: [All ▼] [Running ▼] [Date Range]               │
├─────────────────────────────────────────────────────────┤
│  Run Table:                                              │
│  ID | Feature | Module | Stage | Status | Cost | Time    │
│  ── | ─────── | ────── | ───── | ────── | ──── | ────   │
│  ▶ (click row → expand detail drawer below)              │
│  ... cancel button for running runs                      │
├─────────────────────────────────────────────────────────┤
│  [EXPANDED] Run Detail Drawer:                           │
│  Stage Timeline: [Req] → [Plan] → [Gen] → [Heal] → [Aud]│
│  Stage Details | Artifacts (syntax-highlighted) | Cost    │
│  Convergence guard warnings | [View in Chat] [Download]  │
├─────────────────────────────────────────────────────────┤
│  Charts Section:                                         │
│  Pass/Fail Rate (pie) | Runs Over Time (line)            │
│  Cost Trend (bar) | Stage Duration Breakdown              │
├─────────────────────────────────────────────────────────┤
│  SUPER ADMIN ONLY (role-gated):                          │
│  Platform KPIs | Client Usage Table | Model Usage Stats   │
│  Agent Activity | System Health | Error Rate (24h)        │
└─────────────────────────────────────────────────────────┘
```

- **Status badges**: queued, running, completed, fixme, cancelled
- **Empty state**: "No pipeline runs yet. Start one from Chat — just describe what you need."
- **Error state**: "Encore backend unavailable. Start the server on port 3100."
- **No mock fallback** — if Encore is down, show error, not fake data

---

## Morning Briefing Card (AI-powered, per-session)

On Dashboard load, one API call: `GET /api/dashboard/summary`
- Backend calls haiku with last 5 runs + last login timestamp
- Returns 2-3 sentence summary using IP-safe language
- **Cached per-session** (until logout) — never regenerates mid-session
- Free on Claude Max ($0 cost). When on API billing, minimal cost (one haiku call per login)
- Uses IP-safe vocabulary (no internal terms)
- Dismissible — user can close the card

Implementation: ~30 LOC backend endpoint + `DashboardBriefing.tsx` frontend component.

---

## Run Detail Drawer (embedded in DashboardPage, NOT a separate page)

Click a row → drawer slides out or expands below. Contains:
- Stage timeline (horizontal stepper): [Requirements] → [Planning] → [Generation] → [Healing] → [Audit]
- Each stage: status icon, attempt count, cost, duration, model used
- Stage details: expandable per stage — model, turns, cost, result JSON viewer
- Convergence guard warnings (when run ends as "fixme")
- Artifacts: generated specs (syntax-highlighted), test plans, reports — [Download] [Copy]
- [View in Chat] button → opens Chat with run context pre-loaded
- [Cancel] button for running runs, [Re-run] button for completed runs

### SSE Event Handling

- `stage_start` → update stage node to "running" with spinner
- `stage_complete` → update to "completed" with green check, show cost/duration
- `artifact_ready` → add artifact to artifacts list
- `pipeline_complete` → close SSE, show final status
- `error` → show error alert
- Connection loss → auto-reconnect after 3s, "Reconnecting..." indicator

### Convergence Guard Display

When run ends with "fixme" status, show WHY:
- maxIterations → "Stage {X} exhausted maximum retries ({N})"
- budgetExhausted → "Run budget exceeded ($2.00 limit)"
- sameFindings → "Stage {X} produced identical results twice"
- notDecreasing → "Error count not decreasing over {windowSize} iterations"

Data comes from `resultData` field in stage_results.

---

## Super Admin Dashboard (role-gated panel within DashboardPage)

When `role === 'super_admin'`, DashboardPage shows additional panel:

```
┌─────────────────────────────────────────────────────────┐
│  PLATFORM OVERVIEW (super_admin only)                    │
│  Total Clients: X | Active Users: Y | Total Runs: Z     │
├─────────────────────────────────────────────────────────┤
│  Client Usage Table:                                     │
│  Client | Users | Runs (30d) | Cost (30d) | Plan | Status│
│  ... (click → filter dashboard to that client)           │
├─────────────────────────────────────────────────────────┤
│  Model Usage: haiku X% | sonnet Y% | opus Z%            │
│  Thinking toggle usage: X% of requests                   │
│  Avg response time: haiku Xs | sonnet Xs | opus Xs       │
├─────────────────────────────────────────────────────────┤
│  System Health: Workers | DB Pool | SSE Streams | Errors  │
└─────────────────────────────────────────────────────────┘
```

---

## NewRunPage — REMOVED

New run creation is handled entirely by ChatPage (PLAN_36). Users describe what they need in natural language. The chatbot extracts feature/module/intent, optionally pulls from JIRA, triggers the pipeline, and shows progress inline. No dedicated form page. This is the "users are dumb, max AI" philosophy.

---

## SettingsPage — Role-Based Progressive Disclosure

SettingsPage shows DIFFERENT tabs per role. Less for basic users, more for admins. UX is god — easy to use, simple to understand.

### QA Engineer / Data Engineer sees (2 tabs):

```
Tab 1: My Preferences
  - AI Speed: Fast / Balanced / Deep  (haiku/sonnet/opus — NO technical names shown)
  - Deep Thinking: On / Off toggle
  - That's it. Two controls. Done.

Tab 2: Integrations
  - Connect JIRA (works out of the box when credentials entered)
  - Other integrations: "Coming Soon" + "Request Access" button
```

### Client Admin sees (4 tabs):

```
Tab 1: My Preferences (same as above)
Tab 2: Integrations (same as above)
Tab 3: Testing Configuration (human-readable names ONLY)
  - "Web Testing" — On/Off
  - "API Testing" — On/Off
  - Budget per run: $__ (simple slider, sensible default)
  - NO stage names, NO agent names, NO "max turns" — these are super_admin territory
Tab 4: Team Members
  - List users, add/deactivate, assign roles
  - Permissions cascading: super_admin can allow client_admin to manage certain settings
```

### Super Admin sees (6 tabs — full control):

```
Tab 1: My Preferences
Tab 2: Integrations
Tab 3: Testing Configuration (client-friendly view — same as client_admin)
Tab 4: Team Members (cross-client user management)
Tab 5: Platform Configuration
  - Product name (dynamic branding from platform_settings)
  - Cost visibility toggle per client
  - Default model, default thinking toggle
  - All platform-wide settings
Tab 6: Pipeline Deep Config (FULL technical view — super_admin ONLY)
  - Stage toggles with REAL names (requirements, planning, generation, healing, audit)
  - Model per stage, max turns, budget cap, retries, timeout
  - Global budget limit
  - This is the ONLY place internal names appear — never shown to clients
```

### Cascading Permissions

Super admin can configure which Settings tabs client_admin can see/edit. Stored in `platform_settings` as configurable rules. Everything is configurable by super admin.

### Cost Visibility

Controlled by super admin per-client via `platform_settings.cost_visibility`. Default: `admin_only`.
Options: `hidden`, `admin_only`, `all_users`, `credits_mode` (abstract units instead of dollars).

---

## Reusable from Current Codebase

- `encoreApi.ts` already has all pipeline API functions
- `KPICard.tsx` from `components/dashboard/` — reuse for stats display
- `QualityChart.tsx` patterns — adapt for charts section
- `AgentActivityPanel.tsx` patterns — adapt for stage timeline
- Tailwind + existing component styling patterns

---

## Files to Create

### Dashboard
- `website/frontend/src/pages/DashboardPage.tsx` (new, replaces old)
- `website/frontend/src/components/dashboard/DashboardBriefing.tsx` (AI morning briefing card)
- `website/frontend/src/components/dashboard/RunTable.tsx`
- `website/frontend/src/components/dashboard/RunDetailDrawer.tsx`
- `website/frontend/src/components/dashboard/RunStatusBadge.tsx`
- `website/frontend/src/components/dashboard/RunKPIBar.tsx`
- `website/frontend/src/components/dashboard/ChartSection.tsx`
- `website/frontend/src/components/dashboard/SuperAdminPanel.tsx` (role-gated)

### Pipeline (shared — Dashboard + Chat)
- `website/frontend/src/components/pipeline/StageTimeline.tsx`
- `website/frontend/src/components/pipeline/StageCard.tsx`
- `website/frontend/src/components/pipeline/ArtifactViewer.tsx`
- `website/frontend/src/components/pipeline/ConvergenceGuardAlert.tsx`

### Common
- `website/frontend/src/components/common/WorkerIndicator.tsx`

### Settings Tabs
- `website/frontend/src/components/settings/PreferencesTab.tsx` (model speed + thinking toggle — ALL roles)
- `website/frontend/src/components/settings/IntegrationsTab.tsx` (JIRA + future — ALL roles)
- `website/frontend/src/components/settings/TestingConfigTab.tsx` (human-friendly names — client_admin+)
- `website/frontend/src/components/settings/TeamMembersTab.tsx` (client_admin+ role-gated)
- `website/frontend/src/components/settings/PlatformConfigTab.tsx` (super_admin only — branding, cost visibility)
- `website/frontend/src/components/settings/PipelineDeepConfigTab.tsx` (super_admin only — full technical view)

## Files to Delete

- `website/frontend/src/pages/DashboardPage.tsx` (old mock one — replaced by new)
- `website/frontend/src/pages/ExecutionPage.tsx`
- `website/frontend/src/pages/AgentMonitorPage.tsx`
- Unused `dashboard/` components (audit after confirming KPICard.tsx reuse)

---

## Verification

- [ ] DashboardPage loads with real data from Encore backend (no mock fallback)
- [ ] Morning Briefing card renders on first load, caches per-session, dismisses correctly
- [ ] KPI bar cost fields respect `platform_settings.cost_visibility` setting
- [ ] Run table populates from `GET /api/pipeline/list`, filters work
- [ ] Click row → Run Detail Drawer expands inline (NOT a separate page/route)
- [ ] SSE events update drawer in real-time (stage_start, stage_complete, artifact_ready, pipeline_complete)
- [ ] Convergence guard warnings display correctly for fixme runs
- [ ] Charts section renders pass/fail, runs over time, cost trend, stage duration
- [ ] Super admin panel visible ONLY when `role === 'super_admin'`
- [ ] Empty state shows when no runs exist
- [ ] Error state shows when Encore backend is unavailable
- [ ] NewRunPage does NOT exist (Chat handles run creation)
- [ ] SettingsPage: QA/data engineer sees exactly 2 tabs (Preferences, Integrations)
- [ ] SettingsPage: Client admin sees exactly 4 tabs (adds Testing Config, Team Members)
- [ ] SettingsPage: Super admin sees exactly 6 tabs (adds Platform Config, Pipeline Deep Config)
- [ ] Preferences tab shows Fast/Balanced/Deep labels (no technical model names)
- [ ] Pipeline Deep Config tab shows real stage names (super_admin only)
- [ ] Cost visibility respects hidden/admin_only/all_users/credits_mode per-client setting
- [ ] Cascading permissions: super admin can control which tabs client_admin sees
- [ ] All client-visible text uses IP-safe vocabulary (no "agents", "pipeline stages", "convergence guards")
