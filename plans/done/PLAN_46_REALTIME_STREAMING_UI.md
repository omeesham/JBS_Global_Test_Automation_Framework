# PLAN 46 (AUDITED & CORRECTED): Real-Time Streaming UI + IP Protection

## Status: EXECUTED

## Context
When the pipeline runs, users should see live progress and agent activity. But proprietary prompts, agent instructions, and internal code must stay hidden from non-admin users.

**Depends on**: PLAN_43 (plumbing), PLAN_44 (dry run), PLAN_45 (triggers on website) — all EXECUTED.

---

## Audit Summary (7 findings, 4 critical)

1. **§1 "Pipeline Progress Dashboard" is 100% redundant** — PLAN_45 already delivered `usePipelineSSE`, `PipelineProgress`, `StageTimeline`, `RunDetailDrawer`, `RunPipelineModal`. DELETED.
2. **Wrong SSE endpoint path** — Plan said `GET /api/pipeline/{runId}/events`. Actual: `GET /api/events/:runId` (Encore) and `/api/website-runs/{runId}/events` (Website backend proxy). CORRECTED.
3. **Agent streaming requires spawn() rewrite** — `execFileAsync` blocks until complete. No streaming possible without architecture change. REDESIGNED.
4. **Client-side IP filtering = security theater** — Must be SERVER-SIDE. REDESIGNED.
5. **SSE broadcasts same data to all connections** — Need role-aware connection model. REDESIGNED.
6. **Role system exists and is usable** — `AuthContext.tsx` has 4 roles. Just needs wiring.
7. **Cost visibility already partially conditional** — Low priority enhancement.

---

## Changes (Corrected Scope)

### Phase A: IP Protection (Server-Side SSE Filtering)

#### A1. Encore SSE — Role-Aware Connections
**Where**: `src/server/routes/events.ts`

Rework from `Map<string, Set<FastifyReply>>` to role-aware connections:
```typescript
interface SSEConnection {
  reply: FastifyReply;
  role: 'admin' | 'user';
}
const sseConnections = new Map<string, Set<SSEConnection>>();
```

- SSE endpoint accepts optional `?role=admin&token=xxx` query params
- Validate token against worker secret (admin) or accept as user
- `broadcastSSE` filters: admin-visibility events only sent to admin connections
- Public events sent to all connections

#### A2. SSE Event Visibility Field
**Where**: `src/orchestrator/types.ts`

Add `visibility?: 'public' | 'admin'` to SSEEvent union types.
Add `agent_progress` event type to the union.

#### A3. Tag Events with Visibility
**Where**: `src/server/routes/worker.ts`, `src/orchestrator/orchestrator.ts`

- `stage_start`, `stage_complete`, `pipeline_complete` → `visibility: 'public'`
- `error` events → `visibility: 'admin'` (may contain stack traces)
- `artifact_ready` → `visibility: 'public'` (name only, content requires separate auth'd fetch)
- `agent_progress` → `visibility: 'public'` (high-level messages only)

#### A4. Frontend Role-Based Defense-in-Depth
**Where**: `website/frontend/src/components/dashboard/RunDetailDrawer.tsx`

- Hide cost column for non-admin users (read role from `useAuth()`)
- Hide "View Raw Output" for non-admin
- Server enforces, frontend is defense-in-depth only

---

### Phase B: Agent Activity Stream

#### B1. Worker — Streaming CLI Execution
**Where**: `src/worker/index.ts`

Replace `execFileAsync` with `spawn()` for real-time stdout capture:
- Stream stdout line-by-line
- Extract high-level progress messages (sanitized — no code, no prompts)
- POST progress to `POST /api/worker/progress` every ~5 seconds or on meaningful output
- Collect full output for final result (same as before)
- Manual timeout enforcement (spawn doesn't support timeout natively)
- Proper exit code + stderr handling

#### B2. Backend Progress Endpoint
**Where**: `src/server/routes/worker.ts`

New `POST /api/worker/progress`:
```typescript
{ taskId, runId, stage, message, timestamp }
```
→ broadcasts `agent_progress` SSE event with `visibility: 'public'`

#### B3. Frontend Activity Feed
**Where**: NEW `website/frontend/src/components/pipeline/AgentActivityFeed.tsx`

Scrolling log component showing live agent messages:
- "Analyzing requirements..."
- "Planning test strategy..."
- "Generating test cases..."
- Auto-scroll, max 50 messages, timestamp display

#### B4. Wire into SSE Hook
**Where**: `website/frontend/src/hooks/usePipelineSSE.ts`

Add `agent_progress` handler → store messages in state → pass to `AgentActivityFeed`

#### B5. Show Activity Feed in RunDetailDrawer
**Where**: `website/frontend/src/components/dashboard/RunDetailDrawer.tsx`

Add activity feed section below the live `PipelineProgress` when pipeline is running.

---

## Files Modified

| File | Change | Phase |
|------|--------|-------|
| `src/server/routes/events.ts` | Role-aware SSE connections + filtering | A |
| `src/orchestrator/types.ts` | `visibility` field + `agent_progress` event | A |
| `src/server/routes/worker.ts` | Tag events with visibility + new progress endpoint | A+B |
| `src/orchestrator/orchestrator.ts` | Tag emitted events with visibility | A |
| `website/frontend/src/components/dashboard/RunDetailDrawer.tsx` | Role-based cost hiding + activity feed | A+B |
| `src/worker/index.ts` | spawn() streaming + progress reporting | B |
| `website/frontend/src/hooks/usePipelineSSE.ts` | Handle `agent_progress` events | B |
| `website/frontend/src/components/pipeline/AgentActivityFeed.tsx` | NEW — live activity log | B |

## NOT Touched

| File | Why |
|------|-----|
| `website/frontend/src/components/chat/PipelineProgress.tsx` | Already works, no changes needed |
| `website/frontend/src/components/pipeline/StageTimeline.tsx` | Already shows cost/duration conditionally |
| `website/frontend/src/hooks/usePipelineSSE.ts` (§1 stuff) | Already handles stage_start/complete/pipeline_complete |
| `config/pipeline-definition.json` | No config changes |
| Agent `.agent.md` files | Not aware of streaming |

---

## Verification

1. **IP Protection**: SSE endpoint with no token → only receives public events
2. **IP Protection**: SSE endpoint with admin token → receives all events
3. **IP Protection**: Browser DevTools Network tab as non-admin → no sensitive data in SSE stream
4. **Activity Stream**: Start pipeline → see live agent messages scrolling
5. **Activity Stream**: Messages are sanitized — no code snippets, no prompt content
6. **Cost Hiding**: Login as qa_engineer → no cost columns visible
7. **Cost Hiding**: Login as super_admin → full cost details visible
8. **Streaming**: Worker logs show spawn() with streaming, not execFileAsync

---

## Execution Order
Phase A first (IP protection), then Phase B (streaming). Phase A is independently valuable.
