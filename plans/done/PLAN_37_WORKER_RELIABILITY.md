# PLAN_37: Worker Reliability & Demo Readiness

**Status**: Pending
**Dependencies**: After PLAN_35
**Scope**: Pre-flight checks, SSE error propagation, chatbot pre-flight, startup scripts, demo verification

---

## Pre-flight Checks for Worker

Add to `src/worker/index.ts` before entering poll loop:

```typescript
async function preflight(): Promise<boolean> {
  // Check 1: Claude CLI exists on PATH
  try {
    execFileSync('claude', ['--version'], { timeout: 10000, encoding: 'utf-8' });
    console.log('[Worker] ✓ Claude CLI found');
  } catch {
    console.error('[Worker] ✗ Claude CLI not found. Install Claude Code: https://docs.anthropic.com/claude-code');
    console.error('[Worker] ✗ Ensure "claude" is on your PATH');
    return false;
  }

  // Check 2: Claude CLI is authenticated
  try {
    const output = execFileSync('claude', ['-p', 'respond with just the word OK', '--output-format', 'json', '--max-turns', '1'], {
      timeout: 30000,
      encoding: 'utf-8',
    });
    console.log('[Worker] ✓ Claude CLI authenticated');
  } catch (err) {
    console.error('[Worker] ✗ Claude CLI auth failed. Run: claude login');
    console.error(`[Worker] ✗ Error: ${(err as Error).message}`);
    return false;
  }

  // Check 3: Backend is reachable
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    if (res.ok) {
      console.log('[Worker] ✓ Backend reachable');
    } else {
      console.warn('[Worker] ⚠ Backend returned non-OK. Starting anyway...');
    }
  } catch {
    console.warn('[Worker] ⚠ Backend unreachable. Will retry on poll...');
  }

  return true;
}
```

Call before `workerLoop()`:
```typescript
const ready = await preflight();
if (!ready) {
  console.error('[Worker] Pre-flight failed. Fix issues above and restart.');
  process.exit(1);
}
workerLoop();
```

Opt-out via `SKIP_PREFLIGHT=true` for CI/CD.

---

## Error Propagation Through SSE

**Problem**: When a worker task fails, the error message doesn't always make it to the SSE event. The error goes to `worker_tasks.result` -> `stage_results.result_data`, and the orchestrator routes based on success/failure, but the ERROR MESSAGE doesn't always reach the SSE `stage_complete` event.

**Fix in `src/server/routes/worker.ts` `POST /api/worker/complete-task`:**

When `success === false`, ensure the SSE `stage_complete` event includes the error:
```typescript
broadcastSSE(run.id, {
  type: 'stage_complete',
  stage: task.stageId,
  status: 'failed',
  error: result.error || 'Unknown error',  // <-- ensure this is included
  cost: cost || 0,
});
```

---

## Chatbot Backend Pre-flight

The chatbot endpoint (`/api/chat/ask`) also uses Claude CLI. Add the same checks:
- On Express backend startup, verify Claude CLI is available
- If not, log warning but don't crash (chatbot falls back to "AI assistant temporarily unavailable. Use Dashboard for run history and Settings for configuration.")

---

## Startup Scripts

### start-dev.sh (Unix — new file)
```bash
#!/bin/bash
echo "=== Encore QA SaaS — Dev Startup ==="

# Check PostgreSQL
pg_isready -h localhost -p 5432 || { echo "✗ PostgreSQL not running"; exit 1; }

# Check Claude CLI
claude --version || { echo "✗ Claude CLI not found"; exit 1; }

# Start all services
echo "Starting Encore backend (port 3100)..."
cd /path/to/encore_framework && npm run server:start &

echo "Starting website backend (port 3001)..."
cd /path/to/encore_framework/website/backend && npm run dev &

echo "Starting frontend (port 5173)..."
cd /path/to/encore_framework/website/frontend && npm run dev &

echo "Starting worker..."
cd /path/to/encore_framework && npm run worker:start &

echo "=== All services starting. Open http://localhost:5173 ==="
wait
```

### start-dev.bat (Windows — update existing)
Same checks, Windows-compatible. Use relative paths. Mirror the Unix script behavior.

---

## Demo Flow Verification Checklist

```
□ PostgreSQL running, schemas initialized (public + JBSTestOpsAI + tenant_encore_global)
□ Encore backend responds at http://localhost:3100/health
□ Website backend responds at http://localhost:3001/api/health
□ Frontend loads at http://localhost:5173
□ Login works with all 4 test credentials (superadmin, encoreadmin, encoreqa, encoredata)
□ Encore users skip onboarding (pre-configured) → go to Chat
□ ChatPage loads with welcome message + cards UX (quick action buttons)
□ "Generate tests" → shows options card (not expecting user to type)
□ Click option → pipeline triggers → progress card shows inline
□ SSE events flow to ChatPage showing progress card
□ Worker picks up task and executes Claude CLI
□ Pipeline completes → results card with [View in Dashboard] [Download]
□ Dashboard shows morning briefing card on first visit
□ Dashboard shows real historical runs with filters and charts
□ Dashboard drill-down shows run detail inline (no separate page)
□ Model selector works (Fast/Balanced/Deep labels) in Chat
□ Thinking toggle works in Settings and inline in Chat
□ JIRA connection works from Settings (if credentials available)
□ QA user sees 2 Settings tabs only (Preferences, Integrations)
□ Client admin sees 4 Settings tabs
□ Super admin sees all 6 tabs including Pipeline Deep Config
□ Cancel run works mid-pipeline
□ Super admin sees platform-wide metrics in Dashboard
□ No internal names visible to non-super-admin roles
□ All integrations work out of the box when configured
□ Cost data hidden/shown based on super admin configuration
```

---

## Files to modify
- `src/worker/index.ts` (add preflight function)
- `src/server/routes/worker.ts` (improve error in SSE events)
- `start-dev.bat` (update for new architecture)

## Files to create
- `start-dev.sh` (Unix startup script)

---

## Verification

- [ ] Worker starts cleanly with all pre-flight checks passing
- [ ] Worker fails fast with clear error when Claude CLI missing or unauthenticated
- [ ] SSE `stage_complete` events include error message on failure
- [ ] Chatbot gracefully degrades when Claude CLI unavailable
- [ ] `start-dev.sh` starts all 4 services (backend, website backend, frontend, worker)
- [ ] `start-dev.bat` mirrors Unix script behavior on Windows
- [ ] Full demo checklist passes end-to-end
