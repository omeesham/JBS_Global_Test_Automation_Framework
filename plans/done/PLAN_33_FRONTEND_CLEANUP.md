# PLAN_33: Frontend Cleanup & Navigation Restructure

**Status:** Pending
**Dependencies:** After PLAN_32

**IP VOCABULARY RULE**: All client-visible text must use IP-safe vocabulary. See PLAN_36 IP Protection Rules before writing any UI copy. Never use: "agents", "pipeline stages", "convergence guards". Use: "testing engine", "testing phases", "quality checks".

## What to DELETE

### Pages (11 files)

```
website/frontend/src/pages/AnalyticsPage.tsx        — 100% hardcoded weeklyData, costData
website/frontend/src/pages/AutomationPage.tsx       — 100% mockScripts, mockTestCases
website/frontend/src/pages/InsightsPage.tsx          — 100% hardcoded insights array
website/frontend/src/pages/WorkflowsPage.tsx         — 100% hardcoded workflows array
website/frontend/src/pages/CustomTestSuitePage.tsx   — 100% hardcoded suites array
website/frontend/src/pages/DataValidationPage.tsx    — calls /api/data/validate (mock endpoint)
website/frontend/src/pages/IntegrationsPage.tsx      — 100% static badges, only JIRA real (moves to Settings)
website/frontend/src/pages/ReportsPage.tsx           — 100% mockTrends, mockTestCases
website/frontend/src/pages/RequirementsPage.tsx      — orphaned (no route in App.tsx), imports mockData
website/frontend/src/pages/SetupPage.tsx             — orphaned (no route), references non-existent /generation
website/frontend/src/pages/TestGenerationPage.tsx    — orphaned (no route), imports mockTestCases
```

### Mock data

```
website/frontend/src/data/mockData.ts   — imported by 6 files (NOT ChatPage — verified)
```

### Dead components

```
website/frontend/src/components/config-panel/APIConfigForm.tsx
website/frontend/src/components/config-panel/DataConfigForm.tsx
website/frontend/src/components/config-panel/E2EConfigForm.tsx
website/frontend/src/components/config-panel/UIConfigForm.tsx
website/frontend/src/components/config-panel/TestTypeSelector.tsx
website/frontend/src/components/config-panel/ConfigSummary.tsx
```

### Backup file

```
website/frontend/src/pages/LandingPage.backup.tsx
```

**NOTE**: `dashboard/` components (KPICard.tsx, QualityChart.tsx, AgentActivityPanel.tsx) survive this plan — reused in PLAN_35 DashboardPage. Unused ones cleaned up after PLAN_35.

## What to MODIFY

### App.tsx — Remove 13 protected route definitions. Final route structure:

**Current routes (16 total: 2 public + 13 protected + 1 catch-all):**

```
/                → LandingPage       (public)
/login           → LoginPage         (public)
/chat            → ChatPage          ← KEEP
/dashboard       → DashboardPage     ← KEEP route path, REPLACE component (new DashboardPage in PLAN_35)
/workflows       → WorkflowsPage     ← DELETE
/integrations    → IntegrationsPage  ← DELETE
/analytics       → AnalyticsPage     ← DELETE
/custom-tests    → CustomTestSuitePage ← DELETE
/automation      → AutomationPage    ← DELETE
/execution       → ExecutionPage     ← DELETE (absorbed into Dashboard)
/data-validation → DataValidationPage ← DELETE
/reports         → ReportsPage       ← DELETE
/insights        → InsightsPage      ← DELETE
/agents          → AgentMonitorPage  ← DELETE (absorbed into Dashboard drill-down)
/settings        → SettingsPage      ← KEEP
*                → redirect to /     (catch-all)
```

Note: 3 orphaned pages (RequirementsPage, SetupPage, TestGenerationPage) have NO routes but files exist — delete files.

### New routes (6)

```
/                → LandingPage (public)
/login           → LoginPage (public)
/onboarding      → OnboardingPage (protected, first-login only — service selection)
/chat            → ChatPage (protected, PRIMARY — "super weapon")
/dashboard       → DashboardPage (protected — visual data, run history, drill-down, charts)
/settings        → SettingsPage (protected — integrations, AI config, services, pipeline config, user mgmt)
```

No /runs, no /runs/:id, no /new-run. Dashboard replaces all run-related pages. Chat handles new run creation via natural language. /onboarding shows once on first login → redirects to /chat → services changeable later in Settings → Services tab.

### Sidebar.tsx — Replace 12 nav items with 3

```
Current (12 items):
  Home (/chat), Dashboard, Application Workflows, APIs & Integrations,
  Data & Analytics, Custom Test Suite, Automation, Execution,
  Data Validation, Reports, Insights, Agent Monitor

New (3 items):
  Chat (/chat)       — primary AI interface
  Dashboard (/dashboard) — visual data & results
  Settings (/settings)  — configuration hub
```

Also: Remove ALL legacy hardcoded branding, make it dynamic:
- Product name "IntelliQE" stored in DB → `JBSTestOpsAI.platform_settings.product_name`
- Super admin can change product name from Settings → Platform Configuration
- All UI reads product name from API (fetched once, cached in React context)
- Sidebar: "JBS" logo → dynamic product logo. "JBS Admin" → role badge (e.g., "QA Engineer")
- ChatPage: "Tessa" → "IntelliQE Assistant" (dynamic from product_name)
- Header: "IntelliQE pipeline operational" → "Pipeline: Online/Offline"
- Footer: "Jade Business Solutions LLC" → remove entirely
- Throughout: grep for hardcoded "Tessa", "JBS" and replace with dynamic references

## Service Selection Onboarding (NEW — /onboarding route, changeable in Settings)

Dedicated `/onboarding` page for NEW clients. Shows on first login when `websites.enabled_services` is empty/null. After selection → redirects to `/chat`. Users can change services later in Settings → Services tab.

**Encore exception**: Encore is pre-configured by JBS (website seeded in PLAN_32 with `enabled_services: ["web"]`). Encore users skip onboarding entirely — they go straight to `/chat` with pre-loaded Navigator4 context. This is a one-off: Encore fits into the current vision while the onboarding flow is built for future clients.

**Step 2 (NEW — for future clients only)**: After service selection, ask "What's the name of your product?" (single text input). AI uses this to personalize the welcome message and pre-configure suggested first actions. Encore skips this because JBS seeds everything.

```
┌─────────────────────────────────────────────────────────┐
│  Welcome to IntelliQE                                    │
│  Select the testing capabilities for your project:       │
│                                                          │
│  ☐ Web Application Testing                              │
│     Automated testing for web applications               │
│     Full browser-based test generation & execution        │
│                                                          │
│  ☐ API & Integration Testing                             │
│     Comprehensive API validation and integration testing  │
│     REST, GraphQL, microservices coverage                 │
│                                                          │
│  ☐ Custom Testing Solutions                              │
│     Tailored testing for specialized needs                │
│     ETL pipelines, data validation, SCADA, and more      │
│     → Selecting this shows requirements textarea          │
│     → Submitted for review by our team                    │
│                                                          │
│  [Get Started]                                           │
└─────────────────────────────────────────────────────────┘
```

**Rules:**
- Multi-select allowed (Web + API = both capabilities available)
- NO mention of "agents", "AI pipeline", "Claude" — corporate language only, protect IP
- Custom Solutions → textarea for requirements → saved to `custom_solution_requests` table → JBS super_admin reviews → approves/rejects (user sees status in Settings)
- Selection stored per-website: `websites.enabled_services JSONB` (e.g., `["web", "api"]`)
- Chatbot adapts: only shows capabilities matching enabled services
- If user picks wrong service during onboarding → changeable in Settings → Services tab
- "IntelliQE" in the welcome message reads from `platform_settings.product_name` (configurable by super admin)

## Breakpoint Analysis

| What breaks when mockData.ts is deleted | How to fix |
|----------------------------------------|-----------|
| DashboardPage imports mockExecutions as fallback | Old DashboardPage being replaced — delete simultaneously |
| AutomationPage imports mockScripts, mockTestCases | Page being deleted — no fix needed |
| ReportsPage imports mockTrends, mockTestCases | Page being deleted — no fix needed |
| AgentMonitorPage imports mockQueue | Page being deleted — no fix needed |
| ExecutionPage imports mockExecutions | Page being deleted — no fix needed |
| TestGenerationPage imports mockTestCases | Orphaned page being deleted — no fix needed |

**NOTE: ChatPage has ZERO imports from mockData.ts** (verified via grep). ChatPage has inline mock data for Confluence/SharePoint — handled in PLAN_36 rewrite.

**Execution order**: Delete all 11 pages + config-panel components + backup → delete mockData.ts → update App.tsx (remove imports + routes, add /dashboard stub) → update Sidebar.tsx (3 items) → grep+replace branding → run `npm run build` to verify.

## SettingsPage Stub Cleanup (full expansion in PLAN_35)

Current SettingsPage dead controls to remove now:
- "AI Configuration" dropdown with Claude/GPT-4/Gemini — gut it (rebuilt as model selector in PLAN_35)
- "API Key" input field — meaningless with Claude Max subscription, remove
- General settings for env/browser selection — remove (not wired to anything)
- Keep: JIRA integration section (real), Pipeline Configuration section (real via Encore API)

## Files to modify

- `website/frontend/src/App.tsx` (route definitions, remove 13 protected routes, keep 3 protected)
- `website/frontend/src/components/layout/Sidebar.tsx` (12→3 nav items, branding)
- `website/frontend/src/pages/SettingsPage.tsx` (remove dead controls, keep JIRA + pipeline config)
- `website/frontend/src/pages/ChatPage.tsx` (remove Tessa/IntelliQE branding only, full rewrite in PLAN_36)

## Files to create

- `website/frontend/src/pages/OnboardingPage.tsx` (service selection — /onboarding route, redirects to /chat after)

## Verification

- [ ] All 11 pages deleted
- [ ] mockData.ts deleted
- [ ] All 6 config-panel components deleted
- [ ] LandingPage.backup.tsx deleted
- [ ] App.tsx has exactly 6 routes (2 public + 3 protected + 1 catch-all)
- [ ] Sidebar has exactly 3 nav items (Chat, Dashboard, Settings)
- [ ] No hardcoded "Tessa", "JBS", or "Jade Business Solutions" in UI
- [ ] Product name reads from dynamic source (API/context)
- [ ] OnboardingPage.tsx created with service selection flow
- [ ] SettingsPage dead controls removed (AI config dropdown, API key input, general settings)
- [ ] `npm run build` succeeds with zero errors
