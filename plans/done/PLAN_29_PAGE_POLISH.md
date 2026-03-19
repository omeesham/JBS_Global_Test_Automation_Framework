# PLAN 29: Page Polish (Deferrable)

**Status**: DONE 2026-03-13
**Depends on**: Plan 28
**Goal**: Enhance Dashboard, AgentMonitor, Execution, Settings with real Encore data.

---

## Pages to Enhance

### DashboardPage.tsx (110 LOC)
- Add `getAdminUsage()` → total runs, pass rate metrics
- Add `listPipelineRuns()` → recent executions section
- Add `getWorkerStatus()` → worker online/offline indicator
- Keep existing mock data as fallback when calls fail

### AgentMonitorPage.tsx (175 LOC)
- Add `getWorkerStatus()` → real worker connection status
- Add `listPipelineRuns('running')` → active pipelines in queue
- Keep existing agent cards UI, overlay real data where available

### ExecutionPage.tsx (142 LOC)
- Wire "Run All Tests" button to `createPipelineRun()` instead of `executeTests()`
- Add `listPipelineRuns()` for execution history table
- Map pipeline statuses to existing UI status types

### SettingsPage.tsx (275 LOC)
- Add "Pipeline Configuration" section after existing JIRA and general settings
- Load via `getPipelineDefinition()`
- Display stages with enable/disable toggles
- Save via `updatePipelineDefinition()`
- Keep all JIRA and general settings untouched

---

## DO NOT TOUCH (stay on mock data)
- WorkflowsPage (132 LOC) — 5 hardcoded workflows, renders fine
- IntegrationsPage (147 LOC) — 6 integration cards, renders fine
- AnalyticsPage (163 LOC) — static chart data, renders fine
- CustomTestSuitePage (175 LOC) — 5 hardcoded suites, renders fine
- AutomationPage (51 LOC) — mock scripts, renders fine

---

## Verification
- Dashboard shows real metrics when Encore is running
- Agent Monitor shows worker as connected
- Settings has pipeline config section
- All pages render without errors when Encore is down (fallback to existing data)
