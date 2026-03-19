# PLAN 40 — Production-Grade Reliability & Crash Protection

**Status:** PENDING
**Created:** 2026-03-15
**Priority:** CRITICAL
**Scope:** Backend (website/backend), Worker (src/worker), Dev Startup Scripts
**Goal:** Guarantee that the chatbot and all backend services survive crashes, auto-recover, and never leave the system in a broken state.

---

## Problem Statement

Zero crash protection exists today. One unhandled error kills the entire backend permanently — no restart, no notification, no recovery. The chatbot spawns unbounded Claude CLI processes with no concurrency control. The worker has no stale task recovery. The DB pool never closes on shutdown. There is no rate limiting, no health monitoring, and no graceful shutdown.

**User's question:** *"What is the guarantee that this chatbot won't break? Is it going to shut down and not auto start ever?"*
**Current honest answer:** There is NO guarantee. One crash = permanent death until manual restart.

---

## Failure Catalog — Every Way This System Can Die

### TIER 1: INSTANT DEATH (process terminates, no recovery)

| # | Failure Mode | File | Current State | What Happens |
|---|---|---|---|---|
| 1 | Unhandled promise rejection | `index.ts` | No handler | Node.js terminates the process. All active requests fail. All SSE streams drop. |
| 2 | Uncaught exception (sync throw) | `index.ts` | No handler | Same as above. |
| 3 | Port already in use on startup | `index.ts` | `app.listen()` has no error callback | Process hangs or crashes with EADDRINUSE. |
| 4 | Worker uncaught exception | `worker/index.ts` | No handler | Worker dies. Any in-progress task stays stuck in "running" state forever. |
| 5 | OOM from unbounded CLI spawns | `chatbot.service.ts` | No concurrency limit | 50 concurrent chat requests = 50 Claude CLI processes = OOM kill by OS. |
| 6 | OOM from unbounded stderr | `chatbot.service.ts` | stderr has no buffer cap | If Claude CLI dumps huge stderr, buffer grows until OOM. |

### TIER 2: SILENT DEGRADATION (process lives but system is broken)

| # | Failure Mode | File | Current State | What Happens |
|---|---|---|---|---|
| 7 | DB goes down after startup | `db.ts` | No reconnection logic | Pool errors logged but no recovery. All DB queries fail silently. Health check still returns 200. |
| 8 | DB pool exhaustion | `db.ts` | max=10, no leak detection | If queries hang or connections leak, pool fills up. New queries queue indefinitely. |
| 9 | Worker crashes mid-task | `worker/index.ts` | No stale task recovery | Task stays in "claimed" or "running" status forever. Never retried. Pipeline stuck. |
| 10 | completeTask() fails after execution | `worker/index.ts` | No retry | Task executed but never marked done. Work is lost. |
| 11 | SSE upstream hangs | `website-runs.routes.ts` | No timeout on http.get() | SSE connection stays open forever, consuming memory and a file descriptor. |
| 12 | SSE backpressure not handled | `website-runs.routes.ts` | res.write() return value unchecked | Slow client causes unbounded memory growth on server. |
| 13 | Health check lies | `index.ts` | Always returns 200 | Load balancer / monitoring thinks server is healthy when DB is down, when no CLI available, etc. |
| 14 | DB pool never closed on shutdown | `db.ts` | No pool.end() | Connections hang, PostgreSQL may refuse new connections from restarted process. |

### TIER 3: SECURITY & ABUSE

| # | Failure Mode | File | Current State | What Happens |
|---|---|---|---|---|
| 15 | No rate limiting on /api/chat/ask | All routes | MISSING | Anyone can spam the chat endpoint. Each request spawns a Claude CLI process ($$$ and CPU). |
| 16 | No request body size limit | All routes | Only chat message length checked | Large payloads can exhaust memory. |
| 17 | No per-IP connection limit | All routes | MISSING | Single client can open 1000 SSE connections. |
| 18 | JWT secret is hardcoded fallback | `tenant.middleware.ts` | `'intelliqe-dev-secret-change-in-production'` | If env var missing in prod, anyone can forge tokens. |

### TIER 4: EDGE CASES & RACE CONDITIONS

| # | Failure Mode | File | Current State | What Happens |
|---|---|---|---|---|
| 19 | Claude CLI not installed | `chatbot.service.ts` | spawn error caught | Returns null, user sees "AI failed to respond" — no actionable error message. |
| 20 | Claude CLI auth expired | `chatbot.service.ts` | stderr logged but not parsed | Same generic error. No indication that re-auth is needed. |
| 21 | Two workers poll same task | `worker/index.ts` | No atomic claim lock | Race condition: both execute, both try to complete. One fails silently. |
| 22 | Frontend reconnects SSE rapidly | `website-runs.routes.ts` | No dedup | Each reconnect opens a new upstream connection. Multiply by tab count. |
| 23 | Process.kill() fails on Windows | `chatbot.service.ts` | Uses proc.kill() | On Windows, child processes may not respond to SIGTERM. Zombie processes accumulate. |
| 24 | stdin.write() errors | `chatbot.service.ts` | No error handler on stdin | If pipe breaks, promise never resolves (timeout eventually fires, but 30-90s delay). |

---

## Implementation Plan

### Phase 1: Crash Protection (CRITICAL — do first)

#### Task 1.1: Add uncaught error handlers to backend
**File:** `website/backend/src/index.ts`
**What:** Add at the TOP of file, before any imports:
```typescript
// --- Crash protection: log and survive ---
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err);
  // Do NOT exit — Express server is still functional for other requests
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled rejection:', reason);
});
```
**Why at top:** Must be registered before any code runs that could throw.
**Why not exit:** A single bad request shouldn't kill the server for all users. Log it, let the individual request fail, keep serving.
**Edge case:** If the error corrupts shared state (e.g., half-written global), future requests may behave incorrectly. This is acceptable for a Node.js web server — the alternative (crash) is worse.

#### Task 1.2: Add uncaught error handlers to worker
**File:** `src/worker/index.ts`
**What:** Same handlers at top of file.
**Difference from backend:** Worker SHOULD exit on uncaught exception (it processes one task at a time, corrupted state is dangerous). But it should be restarted by the process manager (Task 2.1).
```typescript
process.on('uncaughtException', (err) => {
  console.error('[Worker FATAL] Uncaught exception:', err);
  process.exit(1); // Let process manager restart
});
process.on('unhandledRejection', (reason) => {
  console.error('[Worker FATAL] Unhandled rejection:', reason);
  // Don't exit on rejections — worker loop catches these
});
```

#### Task 1.3: Graceful shutdown for backend
**File:** `website/backend/src/index.ts`
**What:** Capture server reference, handle SIGTERM/SIGINT:
```typescript
const server = app.listen(PORT, () => { ... });

async function gracefulShutdown(signal: string) {
  console.log(`[Server] ${signal} received. Draining connections...`);
  server.close(() => {
    console.log('[Server] HTTP server closed');
    pool.end().then(() => {
      console.log('[Server] DB pool closed');
      process.exit(0);
    });
  });
  // Force exit after 10s if drain doesn't complete
  setTimeout(() => {
    console.error('[Server] Forced exit after 10s drain timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```
**Edge case:** On Windows, SIGTERM is not reliably delivered. `SIGINT` from Ctrl+C works. For Windows services, use `process.on('message')` with IPC. For dev, `SIGINT` is sufficient.

#### Task 1.4: Handle listen() errors
**File:** `website/backend/src/index.ts`
**What:**
```typescript
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${PORT} already in use. Kill the existing process or use a different port.`);
  } else {
    console.error('[Server] Listen error:', err);
  }
  process.exit(1);
});
```

---

### Phase 2: Auto-Restart (HIGH — do second)

#### Task 2.1: Restart loops in start-dev.sh
**File:** `start-dev.sh`
**What:** Wrap each background process in a restart loop with backoff:
```bash
# Auto-restart backend on crash (max 3s backoff)
restart_with_backoff() {
  local name="$1"; shift
  local delay=1
  while true; do
    echo "[$name] Starting..."
    "$@"
    echo "[$name] Exited. Restarting in ${delay}s..."
    sleep "$delay"
    delay=$((delay < 3 ? delay + 1 : 3))
  done
}

restart_with_backoff "Backend" bash -c "cd '$ROOT/website/backend' && npm run dev" &
restart_with_backoff "Worker" bash -c "cd '$ROOT' && npm run worker:start" &
restart_with_backoff "Frontend" bash -c "cd '$ROOT/website/frontend' && npm run dev" &
```
**Edge case — crash loop:** If the process crashes immediately on startup (bad config, missing file), the loop retries every 1-3s forever. This is acceptable for dev. For production, add a crash counter that stops after N failures in M seconds.
**Edge case — Windows:** `start-dev.bat` needs equivalent logic using `:loop` and `goto`. Windows batch doesn't have functions, so it's uglier but works.

#### Task 2.2: Restart loop in start-dev.bat
**File:** `start-dev.bat`
**What:** Same restart logic using Windows batch syntax:
```batch
:restart_backend
cd /d "%ROOT%\website\backend"
call npm run dev
echo [Backend] Crashed. Restarting in 3s...
timeout /t 3 /nobreak >nul
goto restart_backend
```
Each loop runs in a separate `start /b` window.

---

### Phase 3: Chatbot Hardening (HIGH — prevents resource exhaustion)

#### Task 3.1: Concurrent spawn limiter
**File:** `website/backend/src/services/chatbot.service.ts`
**What:** Add a semaphore that limits concurrent Claude CLI processes:
```typescript
const MAX_CONCURRENT_CLAUDE = 3;
let activeClaude = 0;
const claudeQueue: Array<() => void> = [];

async function acquireClaudeSlot(): Promise<void> {
  if (activeClaude < MAX_CONCURRENT_CLAUDE) {
    activeClaude++;
    return;
  }
  return new Promise((resolve) => claudeQueue.push(() => { activeClaude++; resolve(); }));
}

function releaseClaudeSlot(): void {
  activeClaude--;
  const next = claudeQueue.shift();
  if (next) next();
}
```
Then wrap `callClaude()`:
```typescript
async function callClaude(...): Promise<string | null> {
  await acquireClaudeSlot();
  try {
    return await callClaudeInternal(...);
  } finally {
    releaseClaudeSlot();
  }
}
```
**Why 3?** Claude CLI spawns its own subprocesses. 3 concurrent = ~6-9 total processes. Safe for a 4-core server. Configurable via env var `MAX_CONCURRENT_CLAUDE`.
**Edge case — queue starvation:** If all 3 slots are occupied by 90s deep-model calls, queued requests wait up to 90s. The timeout on the HTTP request (if any) would fire first. Add a queue timeout:
```typescript
async function acquireClaudeSlot(timeoutMs = 30000): Promise<boolean> {
  // ... reject with false if queue wait exceeds timeoutMs
}
```

#### Task 3.2: Cap stderr buffer
**File:** `website/backend/src/services/chatbot.service.ts`
**What:** In `callClaude()`, cap stderr the same as stdout:
```typescript
proc.stderr?.on('data', (data: Buffer) => {
  if (stderr.length < MAX_BUFFER) {
    stderr += data.toString();
  }
});
```

#### Task 3.3: Handle stdin write errors
**File:** `website/backend/src/services/chatbot.service.ts`
**What:**
```typescript
proc.stdin?.on('error', (err) => {
  console.error('[chatbot] stdin write error:', err.message);
  proc.kill();
  done(null);
});
proc.stdin?.write(combined);
proc.stdin?.end();
```
**Order matters:** Register error handler BEFORE writing.

#### Task 3.4: Windows-safe process kill
**File:** `website/backend/src/services/chatbot.service.ts`
**What:** On Windows, `proc.kill()` sends SIGTERM which child processes may ignore. Use `taskkill`:
```typescript
function killProc(proc: ChildProcess): void {
  if (process.platform === 'win32' && proc.pid) {
    try {
      execSync(`taskkill /pid ${proc.pid} /t /f`, { stdio: 'ignore' });
    } catch { /* already dead */ }
  } else {
    proc.kill('SIGKILL');
  }
}
```
**Why /t /f?** `/t` kills the entire process tree (Claude CLI spawns children). `/f` forces kill (no graceful shutdown — we already tried, timeout fired).
**Edge case:** `proc.pid` may be undefined if spawn failed. Guard with `if` check.

#### Task 3.5: Actionable error messages for CLI failures
**File:** `website/backend/src/services/chatbot.service.ts`
**What:** Parse stderr for known failure modes and return user-friendly messages:
```typescript
function diagnoseCLIFailure(stderr: string): string {
  if (stderr.includes('not found') || stderr.includes('ENOENT')) return 'Claude CLI not installed on server';
  if (stderr.includes('auth') || stderr.includes('API key')) return 'Claude CLI authentication expired — server admin must re-authenticate';
  if (stderr.includes('rate limit')) return 'AI rate limit reached — try again in a minute';
  if (stderr.includes('nested') || stderr.includes('CLAUDECODE')) return 'Claude environment conflict — server restart needed';
  return 'AI service temporarily unavailable';
}
```

---

### Phase 4: Worker Reliability (MEDIUM)

#### Task 4.1: Stale task recovery on startup
**File:** `src/worker/index.ts`
**What:** On startup (after preflight), find tasks stuck in "claimed" or "running" status and reset them:
```typescript
async function recoverStaleTasks(): Promise<void> {
  const result = await pool.query(`
    UPDATE "JBSTestOpsAI".pipeline_tasks
    SET status = 'pending', claimed_by = NULL, started_at = NULL
    WHERE status IN ('claimed', 'running')
    AND updated_at < NOW() - INTERVAL '5 minutes'
    RETURNING id, status
  `);
  if (result.rowCount > 0) {
    console.log(`[Worker] Recovered ${result.rowCount} stale tasks`);
  }
}
```
**Edge case — multiple workers:** If two workers start simultaneously, both may recover the same task. The subsequent `pollForTask()` should use `UPDATE ... SET claimed_by = $1 WHERE claimed_by IS NULL` (atomic claim). Verify this is already the case.
**Edge case — false positive:** A task running for >5 minutes is not necessarily stale (large test suite). Make the interval configurable and generous (e.g., 30 minutes for pipeline tasks).

#### Task 4.2: completeTask() retry
**File:** `src/worker/index.ts`
**What:** If `completeTask()` fails (DB down, network error), retry 3 times with 2s backoff before giving up:
```typescript
async function completeTaskWithRetry(taskId: string, success: boolean, result: any, error?: string, cost?: number): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await completeTask(taskId, success, result, error, cost);
      return;
    } catch (err) {
      console.error(`[Worker] completeTask attempt ${attempt}/3 failed:`, (err as Error).message);
      if (attempt < 3) await sleep(2000);
    }
  }
  console.error(`[Worker] CRITICAL: Task ${taskId} executed but could not be marked complete. Manual intervention required.`);
}
```

---

### Phase 5: Health & Monitoring (MEDIUM)

#### Task 5.1: Real health check
**File:** `website/backend/src/index.ts`
**What:** Replace the lying health endpoint:
```typescript
app.get('/api/health', async (_req, res) => {
  const checks: Record<string, string> = {};

  // DB check
  try {
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'down';
  }

  // Claude CLI check
  try {
    execSync('claude --version', { timeout: 5000, stdio: 'pipe', env: cleanEnv() });
    checks.claude_cli = 'ok';
  } catch {
    checks.claude_cli = 'unavailable';
  }

  const healthy = Object.values(checks).every(v => v === 'ok');
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});
```
**Edge case — health check cost:** Claude CLI version check spawns a process. Rate-limit health checks to prevent abuse (cache result for 30s).
**Edge case — DB check during init:** If DB hasn't finished init, health returns 503. Load balancer should not route traffic until healthy.

#### Task 5.2: Rate limiting on chat endpoint
**File:** `website/backend/src/routes/chat.routes.ts`
**What:** Add per-user rate limiting (no npm package needed, use in-memory map):
```typescript
const chatRateLimit = new Map<string, { count: number; resetAt: number }>();
const CHAT_RATE_LIMIT = 10; // requests per minute per user
const CHAT_RATE_WINDOW = 60_000; // 1 minute

function checkChatRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = chatRateLimit.get(userId);
  if (!entry || now > entry.resetAt) {
    chatRateLimit.set(userId, { count: 1, resetAt: now + CHAT_RATE_WINDOW });
    return true;
  }
  if (entry.count >= CHAT_RATE_LIMIT) return false;
  entry.count++;
  return true;
}
```
Apply before spawning Claude CLI. Return 429 with `Retry-After` header.
**Edge case — memory leak:** Clean up expired entries periodically (setInterval every 5 min).
**Edge case — multi-process:** In-memory map doesn't share across processes. Fine for single-process backend. If scaled, use Redis.

---

### Phase 6: Database Resilience (LOW — DB already works, this is belt-and-suspenders)

#### Task 6.1: Pool drain on shutdown
**File:** `website/backend/src/db.ts`
**What:** Export pool so `index.ts` can call `pool.end()` in graceful shutdown (already covered in Task 1.3).

#### Task 6.2: Query timeout
**File:** `website/backend/src/db.ts`
**What:** Add `statement_timeout` to pool config:
```typescript
const pool = new pg.Pool({
  // ... existing config
  statement_timeout: 30000, // 30s max per query
});
```
**Edge case:** Long-running migrations or init queries may need longer. Use `SET LOCAL statement_timeout = '120s'` for those specific transactions.

---

## Edge Cases & What-If Scenarios

### What if Claude CLI updates and changes its output format?
- `parseClaudeOutput()` already handles both raw JSON and `{ result: string }` wrapper
- `stripCodeFences()` handles markdown wrapping
- **Mitigation:** Add a version check on startup. Log warning if CLI version changes from what was tested.

### What if the server crashes during graceful shutdown?
- The 10s force-exit timeout in Task 1.3 handles this
- DB connections will be cleaned up by PostgreSQL's own idle timeout (default 10min)

### What if both start-dev.sh restart loop AND pm2 are running?
- Double-restart = port conflicts. **Rule: use ONE process manager.** start-dev.sh for dev, pm2 for staging/prod. Never both.

### What if Claude CLI hangs indefinitely (no stdout, no stderr, no exit)?
- Already handled: timeout fires, proc.kill() called
- Task 3.4 ensures kill actually works on Windows

### What if user sends chat request while another is queued (same user)?
- Semaphore queues them. Both will execute, just serially.
- Frontend should disable send button while waiting (already does this based on loading state).

### What if PostgreSQL restarts while backend is running?
- Pool `on('error')` fires. Existing connections die.
- pg.Pool automatically creates new connections on next query. Built-in to node-postgres.
- **No code change needed** — pg.Pool handles reconnection natively. (Verified in node-postgres docs.)

### What if JWT_SECRET env var is missing in production?
- Falls back to hardcoded `'intelliqe-dev-secret-change-in-production'`
- **Mitigation:** Add startup check that warns loudly:
```typescript
if (!process.env.JWT_SECRET) {
  console.error('[SECURITY] JWT_SECRET not set! Using insecure default. DO NOT USE IN PRODUCTION.');
}
```

### What if the frontend makes requests faster than the semaphore can process?
- Queued requests wait. If HTTP timeout (browser default ~2min) fires first, request fails.
- **Mitigation:** Return 503 with retry-after if queue depth > 10.

### What if start-dev.sh is killed with kill -9?
- Background children become orphans. They keep running.
- **Mitigation:** Use process groups. `trap 'kill 0' EXIT` at top of script kills all children.

---

## Execution Order & Dependencies

```
Phase 1 (Crash Protection)  ← DO FIRST, no dependencies
  ├── 1.1 Backend error handlers
  ├── 1.2 Worker error handlers
  ├── 1.3 Graceful shutdown
  └── 1.4 Listen error handling

Phase 2 (Auto-Restart)  ← After Phase 1 (handlers must exist before restart loops make sense)
  ├── 2.1 start-dev.sh restart loops
  └── 2.2 start-dev.bat restart loops

Phase 3 (Chatbot Hardening)  ← Independent, can parallel with Phase 2
  ├── 3.1 Concurrency limiter
  ├── 3.2 stderr buffer cap
  ├── 3.3 stdin error handling
  ├── 3.4 Windows-safe kill
  └── 3.5 Diagnostic error messages

Phase 4 (Worker Reliability)  ← After Phase 1.2
  ├── 4.1 Stale task recovery
  └── 4.2 completeTask retry

Phase 5 (Health & Monitoring)  ← After Phases 1-3
  ├── 5.1 Real health check
  └── 5.2 Chat rate limiting

Phase 6 (DB Resilience)  ← Low priority, do last
  ├── 6.1 Pool drain (covered by 1.3)
  └── 6.2 Query timeout
```

---

## Files Modified (Summary)

| File | Changes |
|---|---|
| `website/backend/src/index.ts` | Error handlers, graceful shutdown, listen error, real health check |
| `website/backend/src/services/chatbot.service.ts` | Concurrency limiter, stderr cap, stdin error, Windows kill, diagnostic messages |
| `src/worker/index.ts` | Error handlers, stale task recovery, completeTask retry |
| `website/backend/src/routes/chat.routes.ts` | Rate limiting |
| `website/backend/src/db.ts` | Query timeout |
| `start-dev.sh` | Restart loops, trap for child cleanup |
| `start-dev.bat` | Restart loops |

---

## Verification Plan

1. **Crash recovery test:** Start backend → `kill -9` the process → verify restart loop brings it back within 5s → send chat message → verify response
2. **Unhandled error test:** Add a route that throws synchronously → hit it → verify server stays alive → hit normal route → verify it works
3. **Concurrency test:** Send 5 simultaneous chat requests → verify only 3 Claude CLI processes spawn → verify all 5 eventually get responses
4. **Health check test:** Stop PostgreSQL → hit /api/health → verify 503 with `database: "down"` → restart PostgreSQL → verify 200
5. **Rate limit test:** Send 11 chat requests in <1 minute as same user → verify 11th returns 429
6. **Worker crash test:** Kill worker mid-task → restart worker → verify stale task is recovered and re-executed
7. **Windows kill test:** Start a chat request → timeout fires → verify no zombie `claude.exe` processes in Task Manager
8. **SSE cleanup test:** Open pipeline SSE stream → close browser tab → verify upstream connection is destroyed (check with `netstat`)

---

## What This Does NOT Cover (Out of Scope)

- **Containerizing backend/worker/frontend** — Docker Compose for all services is a separate plan (infrastructure)
- **pm2 for production** — This plan uses restart loops for dev. Production deployment (pm2/systemd) is a deployment plan.
- **Horizontal scaling** — Single-process architecture. Multi-instance requires Redis for rate limiting, session store, etc.
- **Log aggregation** — Console logging only. Structured logging (winston/pino) + log shipping is a separate concern.
- **Alerting** — No PagerDuty/Slack alerts on crash. Health check endpoint enables this but wiring it up is separate.
