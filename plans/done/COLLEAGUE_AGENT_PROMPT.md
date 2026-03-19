# Encore Frontend — Complete Agent Build Instructions

> **For**: Colleague's AI agent building the Encore frontend
> **Context**: This file is the ONLY source of truth. Everything needed is here.
> **Last updated**: 2026-03-10

---

## What Is Encore

Encore is a **test automation SaaS platform**. Users describe what they want automated in a chat interface, and a 5-agent AI pipeline runs autonomously:

```
Requirements Agent → Planner Agent → Generator Agent → Healer Agent → Audit Agent
```

The pipeline produces Playwright test specs, page objects, and CI/CD configs. Users never see AI internals — they only see progress and downloadable artifacts.

**You are building the frontend.** The backend is already deployed on Render. You connect to it via REST API + SSE.

---

## Your Job

Build a **React + TypeScript + Vite + Tailwind CSS** frontend that:
1. Connects to the Encore backend API (deployed on Render)
2. Provides a chat-first interface for submitting automation requests
3. Shows live pipeline progress via Server-Sent Events (SSE)
4. Has an admin Settings page for configuring the pipeline
5. Deploys on **Vercel**

---

## Tech Stack (Required)

- React 18 + TypeScript
- Vite (dev server + build)
- Tailwind CSS (monochrome configuration)
- React Router v6 (SPA routing)
- EventSource or `@microsoft/fetch-event-source` (SSE)
- No other UI frameworks (no MUI, no Chakra, no shadcn)
- No state management library needed (React context + useState is sufficient for MVP)

---

## Environment Setup

### Environment Variables
```
VITE_API_URL=https://encore-api.onrender.com   # Backend URL
```

### Vercel Config (`vercel.json`)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Folder Structure
```
ui/
  package.json
  tsconfig.json
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  index.html
  vercel.json
  public/
    encore-logo.svg
  src/
    main.tsx
    App.tsx
    api/
      client.ts              — fetch wrapper with VITE_API_URL base
      pipeline.ts            — pipeline CRUD calls
      admin.ts               — admin config + usage calls
      sse.ts                 — SSE connection manager
    types/
      index.ts               — ALL shared TypeScript types (copy from below)
    pages/
      LoginPage.tsx
      ChatPage.tsx            — PRIMARY PAGE
      DashboardPage.tsx
      PipelineDetailPage.tsx
      SettingsPage.tsx
    components/
      Layout.tsx              — Sidebar + content wrapper
      Sidebar.tsx             — Left nav, collapsible
      ChatMessage.tsx         — User/bot message bubbles
      ChatInput.tsx           — Bottom-pinned input with send button
      ChatResponseCard.tsx    — Rich cards in chat (pipeline, metrics, findings)
      QuickActions.tsx        — Suggestion chips above input
      PipelineTimeline.tsx    — Vertical stage progression
      StageCard.tsx           — Individual stage in timeline
      StatusDot.tsx           — 8px colored circle indicator
      ArtifactList.tsx        — Download links for pipeline artifacts
      WorkerStatus.tsx        — Connected/disconnected indicator
      SettingsStages.tsx      — Pipeline stage config table
      SettingsAdvanced.tsx    — Collapsed advanced settings accordion
    styles/
      global.css              — Tailwind directives + monochrome config
```

---

## Backend API Reference

### Base URL
All API calls go to `VITE_API_URL`. Example: `${VITE_API_URL}/api/pipeline/run`

### Endpoints

| Method | Path | Request Body | Response |
|---|---|---|---|
| POST | `/api/pipeline/run` | `{ feature, module, intent, priority?, targetUrl? }` | `{ runId: string }` |
| GET | `/api/pipeline/list` | Query: `?status=running&limit=50` | `PipelineRun[]` |
| GET | `/api/pipeline/:id` | — | `PipelineRun` (with stages + artifacts) |
| POST | `/api/pipeline/:id/cancel` | — | `{ cancelled: true }` |
| GET | `/api/events/:runId` | — | SSE stream (see events below) |
| GET | `/api/admin/pipeline-definition` | — | `PipelineDefinition` |
| PUT | `/api/admin/pipeline-definition` | `PipelineDefinition` body | `{ saved: true }` |
| GET | `/api/admin/usage` | — | `{ totalRuns, completedRuns, totalCost, avgCostPerRun }` |
| GET | `/api/admin/worker-status` | — | `{ connected, lastHeartbeat, currentTask }` |
| GET | `/health` | — | `{ status, db, worker }` |

### SSE Events (GET `/api/events/:runId`)

Connect with EventSource. Each event is JSON with a `type` field:

```typescript
// Stage started executing
{ type: "stage_start", runId: string, stage: string, agent: string, model: string, attempt: number, timestamp: string }

// Stage finished
{ type: "stage_complete", runId: string, stage: string, result: "success" | "fail", cost: number, duration: number, timestamp: string }

// Entire pipeline done
{ type: "pipeline_complete", runId: string, status: "completed" | "fixme" | "cancelled", totalCost: number, timestamp: string }

// New artifact available for download
{ type: "artifact_ready", runId: string, artifactId: string, name: string, type: string, timestamp: string }

// Stage is retrying
{ type: "retry", runId: string, stage: string, attempt: number, maxAttempts: number, reason: string, timestamp: string }

// Error occurred
{ type: "error", runId: string, message: string, timestamp: string }

// Worker connection status changed
{ type: "worker_status", connected: boolean, timestamp: string }
```

### Authentication (MVP)
**No authentication for MVP.** All endpoints are open. Design your fetch wrapper so an auth header can be added later without changing every component.

```typescript
// api/client.ts — example
const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Future: add Authorization header here
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

---

## TypeScript Types (MUST USE EXACTLY)

Copy these into `src/types/index.ts`:

```typescript
export interface PipelineRun {
  id: string;
  feature: string;
  module: string;
  intent: string;
  targetUrl?: string;
  stage: string;
  status: "queued" | "running" | "completed" | "fixme" | "cancelled";
  priority: "high" | "medium" | "low";
  cost: number;
  createdAt: string;
  updatedAt: string;
  stages: StageResult[];
  artifacts: Artifact[];
}

export interface StageResult {
  id: string;
  stageId: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  attempt: number;
  maxAttempts: number;
  agentModel: string;
  cost: number;
  startedAt?: string;
  completedAt?: string;
}

export interface Artifact {
  id: string;
  runId: string;
  name: string;
  type: "spec" | "report" | "test-cases" | "ci-config" | "page-object";
  content?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PipelineDefinition {
  version: string;
  defaults: {
    model: string;
    maxTurnsPerStage: number;
    budgetPerRunUsd: number;
    budgetPerStageUsd: number;
    autoInvoke: boolean;
  };
  models: {
    available: string[];
    costPerMTokenInput: Record<string, number>;
    costPerMTokenOutput: Record<string, number>;
  };
  stages: StageDefinition[];
  convergenceGuards: ConvergenceGuards;
}

export interface StageDefinition {
  id: string;
  name: string;
  agent: string;
  model: string;
  enabled: boolean;
  maxTurns: number;
  budgetCap: number;
  retries: number;
  timeoutSeconds: number;
  next: Record<string, string>;
  description: string;
}

export interface ConvergenceGuards {
  enabled: boolean;
  sameFindings: { enabled: boolean; action: string };
  notDecreasing: { enabled: boolean; windowSize: number; action: string };
  maxIterations: { enabled: boolean; limit: number; action: string };
  budgetExhausted: { enabled: boolean; action: string };
}

export interface UsageMetrics {
  totalRuns: number;
  completedRuns: number;
  totalCost: number;
  avgCostPerRun: number;
}

export interface WorkerStatus {
  connected: boolean;
  lastHeartbeat: string | null;
  currentTask: string | null;
}

export type SSEEvent =
  | { type: "stage_start"; runId: string; stage: string; agent: string; model: string; attempt: number; timestamp: string }
  | { type: "stage_complete"; runId: string; stage: string; result: "success" | "fail"; cost: number; duration: number; timestamp: string }
  | { type: "pipeline_complete"; runId: string; status: "completed" | "fixme" | "cancelled"; totalCost: number; timestamp: string }
  | { type: "artifact_ready"; runId: string; artifactId: string; name: string; type: string; timestamp: string }
  | { type: "retry"; runId: string; stage: string; attempt: number; maxAttempts: number; reason: string; timestamp: string }
  | { type: "error"; runId: string; message: string; timestamp: string }
  | { type: "worker_status"; connected: boolean; timestamp: string };
```

---

## Pages — Detailed Specs

### 1. LoginPage (`/login`)

**Layout**: Full-screen, no sidebar.

- Background: black (#0a0a0a)
- Center: white card, very subtle shadow (rgba(0,0,0,0.05))
- Encore logo (monochrome, small) above inputs
- Email input: white bg, 1px solid #e5e5e5 border
- Password input: same style
- "Sign In" button: black bg, white text, full width, rounded
- **Mock auth for MVP**: Any email/password accepted. Store `{ email }` in localStorage. Check localStorage on app load — if present, redirect to `/chat`.
- No registration, no forgot password.

**Vibe**: Terminal login. No decoration.

### 2. ChatPage (`/chat`) — THE MAIN PAGE

**This IS the product.** The chat interface is where users do everything.

**Layout**:
- Full height content area (below any header)
- Scrollable message list
- Bottom-pinned input bar with quick actions above it

**Messages**:
- User: right-aligned, black bg (#000), white text, rounded bubble, max-width 70%
- Bot: left-aligned, light gray bg (#f5f5f5), black text, rounded bubble, max-width 70%
- "Encore" label in small gray text above bot messages
- Timestamps below each message (tiny, gray)

**Welcome message** (on first visit):
> "Welcome. Describe a page you want to automate, or ask about your pipelines."

**Chat behaviors** (real API calls, not mocks):

| User Input Pattern | Action | Bot Response |
|---|---|---|
| Contains "test", "automate", "page", "need", "create" | `POST /api/pipeline/run` with extracted feature/module/intent | "Created pipeline for {feature}." + PipelineCard |
| Contains "status", "pipelines", "overview" | `GET /api/pipeline/list` | "Here's your current status." + MetricsCard (total, completed, running, fixme counts) |
| Contains "metric", "stat", "cost", "usage" | `GET /api/admin/usage` | "Pipeline metrics:" + UsageCard |
| Contains "fail", "issue", "error", "review", "fix" | `GET /api/pipeline/list?status=fixme` | "Items needing attention:" + FindingsList |
| Contains "cancel" + pipeline ref | `POST /api/pipeline/:id/cancel` | "Pipeline cancelled." |
| "help" | — | List of capabilities |
| Anything else | — | "I can help with: creating tests, checking status, viewing metrics, or reviewing failures." |

**Rich Cards embedded in chat** (ChatResponseCard):
- **PipelineCard**: feature name (bold), module, StatusDot + stage text, priority, cost, "View Details →" link to `/pipeline/:id`
- **MetricsCard**: 2x2 grid — Total pipelines, Completed, Running, Needs Review. Numbers large, labels small gray.
- **UsageCard**: Total runs, total cost ($), avg cost per run
- **FindingsList**: Compact list of pipeline items with fixme status, each with StatusDot

**Quick Actions**: Row of chips above input bar. Clicking inserts text and triggers response:
- "New request" → prefills "I need tests for..."
- "Status" → triggers status query
- "Metrics" → triggers usage query
- "Failures" → triggers fixme filter

**SSE Integration**: When a pipeline is created from chat, connect to SSE for that runId. Show live updates as new bot messages:
- "Stage started: Requirements (haiku)..."
- "Stage complete: Requirements (0.02s, $0.01)"
- "Pipeline complete! 3 artifacts ready. [View Details →]"

### 3. DashboardPage (`/dashboard`)

**Data source**: `GET /api/pipeline/list`

Table with columns:
| Feature | Module | Status | Priority | Cost | Updated |
|---|---|---|---|---|---|

- Status column: StatusDot (8px) + stage name text
- StatusDot colors: completed=green(#22c55e), running=black+pulse, pending=gray(#d4d4d4), fixme=red(#ef4444)
- Click row → `/pipeline/:id`
- Auto-refresh every 10 seconds (or SSE if feasible)
- No "New Request" button — that's done via chat

### 4. PipelineDetailPage (`/pipeline/:id`)

**Data source**: `GET /api/pipeline/:id` + `GET /api/admin/pipeline-definition` (for stage names/order)

**Two columns**:

**Left — Timeline**:
- Vertical line: 2px, #e5e5e5 default, black for completed segments
- Each stage from pipeline definition rendered as StageCard:
  - StatusDot (left edge)
  - Stage name (medium weight) + agent name (gray, small) + model (gray, tiny)
  - Timestamp (right-aligned, gray)
  - Cost for this stage (right-aligned, gray, small)
- Active stage: animated border or pulse
- Retry stages: "Attempt N of M" banner below stage card
- Fixme state: "Needs human review" banner with red left border

**Right — Info Panel**:
- Feature name, module, priority (plain text)
- Total cost so far
- Artifact list with download links (from `artifacts[]`)
- "Open in Chat" link → `/chat` (could pre-fill query about this pipeline)
- "Cancel Pipeline" button (red text, only shown if status=running)

**SSE**: Connect for live updates. Update timeline in real-time as events arrive.

### 5. SettingsPage (`/settings`)

**Tier 2 — Visible by default**:

**Pipeline Stages** (from `GET /api/admin/pipeline-definition`):
- Table/list of stages from `definition.stages[]`
- Each row:
  - Stage name (from `stage.name`)
  - Toggle switch: enabled/disabled (from `stage.enabled`)
  - Model dropdown: options from `definition.models.available`, selected = `stage.model`
  - Budget cap input: number field, value = `stage.budgetCap`
  - Retries input: number field, value = `stage.retries`
  - Description (gray, small)
- "Save Changes" button → `PUT /api/admin/pipeline-definition`
- Success toast on save

**Worker Status**:
- Green/red StatusDot + "Worker Connected" / "Worker Disconnected"
- Last heartbeat timestamp
- Current task (if any)

**Usage Summary** (from `GET /api/admin/usage`):
- Total runs, completed, total cost, avg cost per run

**Tier 3 — "Advanced" accordion (collapsed by default)**:

- Auto-invoke toggle (defaults.autoInvoke)
- Default budget per run (defaults.budgetPerRunUsd)
- Default model (defaults.model dropdown)
- Max turns per stage (defaults.maxTurnsPerStage)
- Convergence Guards section:
  - Master toggle (convergenceGuards.enabled)
  - Same findings guard toggle
  - Not decreasing guard toggle + window size
  - Max iterations guard toggle + limit
  - Budget exhausted guard toggle
- Raw JSON editor (full pipeline-definition.json, code editor style, monospace)

---

## Design System (MANDATORY — Read Every Rule)

### Colors
- **Page backgrounds**: White (#fff) or off-white (#fafafa). NOTHING ELSE.
- **Text**: Black (#000) or gray (#737373 for secondary text).
- **Borders**: 1px solid #e5e5e5. This is the ONLY border style.
- **StatusDot colors** (the ONLY color in the entire app):
  - completed → #22c55e (muted green)
  - running → #000 with CSS pulse animation
  - pending → #d4d4d4 (light gray)
  - failed / fixme → #ef4444 (muted red)
  - blocked → #eab308 (muted yellow)
- **Chat bubbles**: User = #000 bg, #fff text. Bot = #f5f5f5 bg, #000 text.
- **Login page**: #0a0a0a background (ONLY page with dark bg).
- **Buttons**: Primary = #000 bg, #fff text. Secondary = #fff bg, #000 text, 1px border.

### Typography
- Font: system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`) or Inter
- Two weights ONLY: 400 (normal), 500 (medium)
- No bold except page titles
- Font sizes: 14px base, 12px small/secondary, 18px headings, 24px page titles

### Spacing
- Generous whitespace. Let things breathe.
- Cards: p-4 minimum
- Between items: gap-3
- Page content: px-6 py-4

### Rules
1. **No colored backgrounds.** No colored cards, no colored sections, no colored headers.
2. **No gradients.** Anywhere. Ever.
3. **No shadows** except login card.
4. **No hover effects on text.** Hover on clickable rows: bg changes to #fafafa only.
5. **Icons**: Heroicons outline style. Minimal — only where essential (send, sidebar toggle, download, settings gear).
6. **Animations**: Only StatusDot pulse and accordion expand/collapse. Nothing else moves.
7. **StatusDot**: 8px circle. That's it. No pill badges, no colored backgrounds.

### Sidebar
- Width: 240px expanded, 56px collapsed
- Background: #fafafa
- Toggle: hamburger icon at top
- Nav items: "Chat" (primary, top), "Dashboard", "Settings"
- Active item: black text. Inactive: gray (#737373)
- "Recent Pipelines" section below divider: pipeline names with StatusDot, clickable → `/pipeline/:id`
- Bottom: "Worker: Connected/Disconnected" indicator (StatusDot + text, tiny)

---

## What NOT To Build

- **No backend logic.** We handle all backend. You only build frontend.
- **No real authentication server.** Mock auth (localStorage) for MVP.
- **No agent prompt display.** Agent prompts are IP — NEVER show them in the UI. The pipeline definition shows stage names and agents, but NOT the actual prompts.
- **No mobile layout.** Desktop-first. Minimum 1024px viewport.
- **No email notifications.**
- **No file upload.** Users describe what to automate in chat text.
- **No real-time WebSocket.** Use SSE (EventSource) only.

---

## Deployment

1. Build: `npm run build` → produces `dist/`
2. Deploy to Vercel (connect to your git repo, Vercel auto-detects Vite)
3. Set environment variable: `VITE_API_URL=https://encore-api.onrender.com`
4. Vercel handles routing via `vercel.json` rewrites

---

## Acceptance Criteria

1. `npm install && npm run dev` works at localhost:5173
2. All pages render without console errors
3. Login → Chat → Dashboard → Pipeline Detail → Settings navigation works
4. **Chat is the default page after login** (`/chat`)
5. Typing automation request in chat → creates real pipeline run via API
6. SSE shows live stage progression in chat and pipeline detail
7. Dashboard loads real data from API
8. Settings loads/saves pipeline definition
9. Worker status indicator reflects real worker state
10. Artifacts listed and downloadable
11. **Entire UI is monochrome** — only StatusDots have color
12. Sidebar collapses/expands
13. `npm run build` succeeds without errors
14. Deploys to Vercel with correct `VITE_API_URL`
15. CORS works between Vercel ↔ Render
16. **Feels like a product.** Clean, spacious, professional, minimal.
