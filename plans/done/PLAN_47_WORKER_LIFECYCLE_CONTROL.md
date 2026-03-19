# PLAN 47: Worker Lifecycle Control — UI Buttons + Chat Commands

## Status: EXECUTED

## Context

The dashboard shows "Worker Disconnected" because no worker process is running. Currently, starting/stopping the worker requires manually running shell commands (`node src/worker/index.ts`). There's no way for admins to control the worker from the UI or chat.

**This plan adds:** Start / Stop / Restart buttons on the dashboard WorkerIndicator, plus chat commands ("start the worker", "restart worker") — all role-gated to `super_admin`. The Encore backend manages the worker as a child process.

---

## What Already Exists

| Component | File | What it does |
|-----------|------|-------------|
| Worker entry | `src/worker/index.ts` | Polling loop, heartbeat every 30s, SIGTERM graceful shutdown |
| Worker manager | `src/worker/worker-manager.ts` | `fork()`-based multi-worker spawner, auto-restart with backoff |
| Admin routes | `src/server/routes/admin.ts` | `GET /api/admin/worker-status`, `GET /api/admin/usage`, `GET /api/admin/runs`, `GET /api/admin/runs/:id` — no auth, no worker control |
| Server entry | `src/server/index.ts` | Fastify on PORT (default 3001), graceful shutdown on SIGINT/SIGTERM |
| WorkerIndicator | `website/frontend/src/components/common/WorkerIndicator.tsx` | Simple green/red badge, props: `connected`, `lastHeartbeat?`, `currentTask?` |
| WorkerStatus type | `src/orchestrator/types.ts` | `{ connected, lastHeartbeat, currentTask }` |
| Chatbot actions | `website/backend/src/services/chatbot.service.ts` | ACTION_CATALOG (lines 110-138), `executeAction()` switch (lines 337-535) — no worker actions |
| Frontend API | `website/frontend/src/services/encoreApi.ts` | `getWorkerStatus()` calls `/api/admin/worker-status` |

---

## Changes

### 1. NEW — `src/server/worker-process.ts` (~80 lines)

Server-side worker lifecycle manager. Manages the worker as a child process with a finite state machine.

```typescript
// States: 'stopped' | 'starting' | 'running' | 'stopping'
// Methods:
//   start() → fork('src/worker/index.ts'), listen for 'online'/'exit' events
//   stop() → send SIGTERM, wait up to 10s, then SIGKILL if needed
//   restart() → stop() then start()
//   getState() → { state, pid, uptime, lastError }
//
// On unexpected exit: set state='stopped', log error, do NOT auto-restart
// (auto-restart is opt-in via worker-manager.ts for production)
//
// Windows: use 'taskkill /pid /t /f' for SIGKILL fallback
```

### 2. MODIFY — `src/server/routes/admin.ts`

Add 3 new endpoints + enhance existing status endpoint:

```typescript
// NEW endpoints (all require super_admin role via X-User-Role header):
POST /api/admin/worker/start   → workerProcess.start()  → { ok, state, pid }
POST /api/admin/worker/stop    → workerProcess.stop()    → { ok, state }
POST /api/admin/worker/restart → workerProcess.restart() → { ok, state, pid }

// ENHANCED existing endpoint:
GET /api/admin/worker-status   → adds: { ...existing, managed: true, state: 'running'|'stopped'|... }
```

**Role gate:** Check `request.headers['x-user-role'] === 'super_admin'` on start/stop/restart. Return 403 otherwise.

### 3. MODIFY — `src/server/index.ts`

- Import `workerProcess` from `./worker-process`
- On server shutdown (`SIGINT`/`SIGTERM`): call `workerProcess.stop()` before `server.close()`

### 4. MODIFY — `src/orchestrator/types.ts`

Extend `WorkerStatusResponse`:
```typescript
interface WorkerStatusResponse {
  connected: boolean;
  lastHeartbeat: string | null;
  currentTask: string | null;
  managed?: boolean;        // NEW — true when server manages the worker process
  state?: 'stopped' | 'starting' | 'running' | 'stopping';  // NEW
  pid?: number;             // NEW
  uptime?: number;          // NEW — seconds since start
}
```

### 5. MODIFY — `website/frontend/src/components/common/WorkerIndicator.tsx`

Transform from simple badge to actionable control (for `super_admin` only):

- Accept new props: `state?: string`, `userRole?: string`, `onStart?`, `onStop?`, `onRestart?`
- When `userRole === 'super_admin'`: show Start/Stop/Restart buttons next to the badge
- Button states: Start (green, shown when stopped), Stop (red, shown when running), Restart (amber, always shown when running)
- While `state === 'starting'` or `'stopping'`: show spinner, disable buttons
- Non-super_admin users: unchanged behavior (badge only)

### 6. MODIFY — `website/frontend/src/services/encoreApi.ts`

Add 3 new API functions:
```typescript
export async function startWorker(): Promise<{ ok: boolean; state: string; pid?: number }> {
  const { data } = await encoreApi.post('/api/admin/worker/start');
  return data;
}
export async function stopWorker(): Promise<{ ok: boolean; state: string }> {
  const { data } = await encoreApi.post('/api/admin/worker/stop');
  return data;
}
export async function restartWorker(): Promise<{ ok: boolean; state: string; pid?: number }> {
  const { data } = await encoreApi.post('/api/admin/worker/restart');
  return data;
}
```

### 7. MODIFY — `website/frontend/src/pages/DashboardPage.tsx`

- Import `startWorker`, `stopWorker`, `restartWorker` from encoreApi
- Add 10s polling interval for `getWorkerStatus()` to keep indicator fresh
- Wire `onStart`, `onStop`, `onRestart` handlers that call API + refresh status
- Pass `user?.role` and `worker?.state` to `WorkerIndicator`

### 8. MODIFY — `website/backend/src/services/chatbot.service.ts`

Add 3 new actions to ACTION_CATALOG (lines 110-138):
```typescript
{ action: 'start_worker',   keywords: ['start worker', 'turn on worker', 'boot worker', 'launch worker'] },
{ action: 'stop_worker',    keywords: ['stop worker', 'turn off worker', 'kill worker', 'shutdown worker'] },
{ action: 'restart_worker', keywords: ['restart worker', 'reboot worker', 'bounce worker'] },
```

Add cases in `executeAction()` switch (after existing cases):
```typescript
case 'start_worker':
case 'stop_worker':
case 'restart_worker': {
  // Role check: only super_admin
  if (user.role !== 'super_admin') return { text: 'Only super admins can control the worker.' };
  // Call Encore backend endpoint
  const endpoint = action.replace('_', '/');  // start_worker → admin/worker/start
  const res = await encoreApi.post(`/api/admin/worker/${action.split('_')[0]}`);
  return { text: `Worker ${action.split('_')[0]} initiated. State: ${res.data.state}` };
}
```

### 9. MODIFY — `website/frontend/src/types/index.ts`

Update `WorkerStatus` type to include new fields:
```typescript
interface WorkerStatus {
  connected: boolean;
  lastHeartbeat: string | null;
  currentTask: string | null;
  managed?: boolean;
  state?: 'stopped' | 'starting' | 'running' | 'stopping';
  pid?: number;
  uptime?: number;
}
```

---

## NOT Touched

| File | Why |
|------|-----|
| `src/worker/index.ts` | Worker code itself unchanged — it's managed as a child process |
| `src/worker/worker-manager.ts` | Production multi-worker manager unaffected — `worker-process.ts` is for dev/single-worker control |
| `website/frontend/src/pages/ChatPage.tsx` | Chat commands handled by backend chatbot service, no frontend changes needed |
| `website/backend/src/routes/*.ts` | Express proxy routes don't need changes — worker endpoints go direct to Encore |

---

## File Summary

| File | Action | Est. Lines |
|------|--------|-----------|
| `src/server/worker-process.ts` | NEW | ~80 |
| `src/server/routes/admin.ts` | MODIFY | ~40 |
| `src/server/index.ts` | MODIFY | ~5 |
| `src/orchestrator/types.ts` | MODIFY | ~5 |
| `website/frontend/src/components/common/WorkerIndicator.tsx` | MODIFY | ~60 |
| `website/frontend/src/services/encoreApi.ts` | MODIFY | ~15 |
| `website/frontend/src/pages/DashboardPage.tsx` | MODIFY | ~30 |
| `website/backend/src/services/chatbot.service.ts` | MODIFY | ~20 |
| `website/frontend/src/types/index.ts` | MODIFY | ~5 |

**Total: 1 new file, 8 modified, ~260 lines**

---

## Execution Order

1. Create `src/server/worker-process.ts` (foundation — FSM lifecycle manager)
2. Update types in `src/orchestrator/types.ts` and `website/frontend/src/types/index.ts`
3. Add admin endpoints in `src/server/routes/admin.ts`
4. Wire shutdown hook in `src/server/index.ts`
5. Add API functions in `website/frontend/src/services/encoreApi.ts`
6. Update `WorkerIndicator.tsx` with buttons + state display
7. Wire DashboardPage with polling + handlers
8. Add chatbot actions in `chatbot.service.ts`
9. Test all paths

---

## Verification

1. **Dashboard start**: Click Start on WorkerIndicator → worker process spawns → badge turns green within ~5s
2. **Dashboard stop**: Click Stop → worker gets SIGTERM → badge turns red → status shows "stopped"
3. **Dashboard restart**: Click Restart → worker stops then starts → badge flickers then green
4. **Chat start**: Type "start the worker" → chatbot responds with state confirmation
5. **Chat stop**: Type "stop the worker" → chatbot confirms worker stopped
6. **Role gate**: Log in as `qa_engineer` → no Start/Stop/Restart buttons visible, chat commands rejected with "Only super admins..."
7. **Server shutdown**: Kill the Encore server → managed worker also terminates (no orphan)
8. **Windows compatibility**: Verify `taskkill` fallback works when SIGTERM doesn't terminate worker within 10s

---

## Enemy Audit Results

### Round 1 — Scope Completeness
- **Checked**: `admin.ts` has no auth middleware — role check done via header (consistent with existing pattern, no JWT validation on Encore side since Express proxy adds headers)
- **Checked**: `worker-manager.ts` is for production multi-worker — new `worker-process.ts` is for single-worker lifecycle control (no conflict)
- **Checked**: `WorkerIndicator` currently receives props from DashboardPage — adding new props is backward-compatible (all optional)
- **Checked**: Chatbot `executeAction()` switch needs access to Encore API — `chatbot.service.ts` already imports axios, can call Encore endpoints directly
- **Checked**: Windows `fork()` compatibility — Node.js `child_process.fork()` works on Windows, SIGTERM is simulated

### Round 2 — Naming & Design Consistency
- `worker-process.ts` follows existing naming: `worker-manager.ts` (manager = multi-worker, process = single lifecycle)
- Endpoint pattern `/api/admin/worker/start` follows REST convention and groups under existing `/api/admin/` prefix
- Button labels "Start" / "Stop" / "Restart" are standard — no invention needed
- Chat keywords follow existing ACTION_CATALOG style (array of natural phrases)

### Round 3 — Breaking Changes & Side Effects
- **Safe**: New `WorkerIndicator` props are all optional — existing usage without them unchanged
- **Safe**: `WorkerStatusResponse` additions are optional fields — existing consumers won't break
- **Risk**: If worker is started via CLI manually AND via UI simultaneously → two workers polling. **Mitigation**: `worker-process.ts` only tracks processes it spawns; `getState()` returns `stopped` if it didn't start the worker, even if heartbeat shows connected. Status endpoint merges both signals.
- **Risk**: Windows process kill edge case — `process.kill(pid, 'SIGTERM')` on Windows sends `SIGTERM` which Node handles, but if worker hangs, need `taskkill /pid /t /f`. **Mitigation**: 10s timeout then force kill.
- **No breaking changes**: All additions are purely additive
