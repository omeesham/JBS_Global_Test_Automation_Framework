# PLAN 44: Dry Run Roll Call — AUDITED & CORRECTED

## Context
After PLAN_43 connects the plumbing, we need to prove the pipeline chain works end-to-end before running real workloads. This plan creates a "roll call" — each stage confirms it received the prompt and passes to the next. No real work, no browser, no file creation.

**Depends on**: PLAN_43 (plumbing fix) must be completed first.

---

## Audit Findings from Original Plan 44

### BUG 1 — CRITICAL: Happy Path = 4 Stages, Not 5
Original plan claims "Worker picks up 5 tasks in sequence" and "All 5 agents respond with PRESENT_AND_READY". **Wrong.** The happy path is: requirements → planning → generation → audit = **4 stages**. Healing is only triggered when `generation` reports test failures. The `matchRoutingCondition()` at `src/orchestrator/orchestrator.ts:111` maps `success` outcome to `failedCount == 0` → routes to `audit`, skipping healing entirely.

**Fix**: The dry run should explicitly force routing through ALL 5 stages. We'll inject `dryRun: true` into the task context, and when the orchestrator sees it, it routes linearly through all stages regardless of normal routing rules.

### BUG 2 — CRITICAL: dryRun Propagation Is Fragile
Original plan relies on Claude's JSON response containing `{ "dryRun": true }` to propagate the flag to subsequent stages. **This is unreliable** — Claude might not return valid JSON, might wrap it in markdown, or might omit the field entirely. One missed response = subsequent stages get real prompts.

**Fix**: Store `dryRun: true` in the worker task `context` JSONB field. The orchestrator propagates it from the initial request through every subsequent `createWorkerTask()` call. Zero dependency on Claude's behavior.

### BUG 3 — HIGH: Agent File Prepend Overrides Dry-Run Prompt
Worker at `src/worker/index.ts:202-204` loads `.agent.md` files and **prepends** them to the pipeline prompt:
```
fullPrompt = agentInstructions + '\n---\nPIPELINE CONTEXT:\n' + agentPrompt
```
For dry runs, the 50-100 line agent instructions could cause Claude to do real work despite the dry-run prompt saying "don't".

**Fix**: Worker checks task context for `dryRun: true`. If set, skip loading agent file — use dry-run prompt as the sole prompt. This guarantees no real work happens.

### BUG 4 — MEDIUM: Code Duplication
Original plan puts `buildDryRunPrompt()` in both `pipeline.ts` (stage 1) and `orchestrator.ts` (stages 2-5), both doing `fs.readFileSync()` of the same file.

**Fix**: Single `buildDryRunPrompt()` utility in `src/orchestrator/orchestrator.ts`, imported by `pipeline.ts`.

### BUG 5 — LOW: No DB Tracking of Dry Runs
No way to distinguish dry runs from real runs in the database. The `pipeline_runs` table has no `dryRun` column, and there's no filter for it.

**Fix**: Not worth a schema migration for Phase 0. Instead, pass `dryRun: true` in context JSONB (already stored in `worker_tasks.context`). The pipeline run detail endpoint will show context per stage, making dry runs identifiable.

---

## Corrected Changes

### 1. Create: `config/dry-run-prompt.md` (~20 lines)

```markdown
# DRY RUN — Roll Call Mode

This is a pipeline connectivity test. Do NOT perform any real work.

Your job:
1. Confirm you received this prompt
2. Report your agent name and stage
3. Return a JSON response in this exact format:

{"dryRun":true,"stage":"<stage-id>","status":"PRESENT_AND_READY","message":"Roll call received. Passing to next stage.","receivedContext":{"feature":"<echo feature>","module":"<echo module>","intent":"<echo intent>"}}

Do NOT:
- Open any browser
- Create any files
- Run any tests
- Modify any code

Just respond with the JSON above and exit.
```

### 2. Modify: `src/orchestrator/types.ts` (+1 line)

Add `dryRun?: boolean` to `CreatePipelineRequest`:

```typescript
// line 149, after clientId:
  dryRun?: boolean;
```

### 3. Modify: `src/orchestrator/orchestrator.ts` (~20 lines)

**3a. Add exported `buildDryRunPrompt()` utility** (after `buildStagePrompt`):

```typescript
export function buildDryRunPrompt(stageId: string, context: {
  feature: string; module: string; intent: string;
}): string {
  const templatePath = path.join(__dirname, '../../config/dry-run-prompt.md');
  const template = fs.readFileSync(templatePath, 'utf-8');
  return template
    .replace('<stage-id>', stageId)
    .replace('<echo feature>', context.feature)
    .replace('<echo module>', context.module)
    .replace('<echo intent>', context.intent);
}
```

**3b. Modify `processStageCompletion()`** — dry run forces linear routing through ALL 5 stages:

After getting `nextStageId` at line 264, add:

```typescript
// Dry run: force linear routing through all stages (including healing)
const isDryRun = resultData?.dryRun === true;
if (isDryRun) {
  const DRY_RUN_ORDER = ['requirements', 'planning', 'generation', 'healing', 'audit'];
  const currentIdx = DRY_RUN_ORDER.indexOf(stageId);
  const forcedNext = currentIdx >= 0 && currentIdx < DRY_RUN_ORDER.length - 1
    ? DRY_RUN_ORDER[currentIdx + 1]
    : 'completed';
  nextStageId = forcedNext; // override normal routing
}
```

Wait — but `nextStageId` is `const`. We need to make it `let`.

**3c. Modify `buildStagePrompt()`** — if previous result was dry run, build dry-run prompt instead:

```typescript
// At top of buildStagePrompt (line 318):
if (previousResult?.dryRun === true) {
  return buildDryRunPrompt(stage.id, {
    feature: run.feature,
    module: run.module,
    intent: run.intent,
  });
}
```

**3d. Propagate dryRun in context** — in `processStageCompletion()` around line 305:

```typescript
await createWorkerTask(pool, runId, nextStage.id, prompt, {
  feature: run.feature,
  module: run.module,
  intent: run.intent,
  targetUrl: run.target_url,
  previousStage: stageId,
  previousOutcome: outcome,
  previousResult: resultData,
  dryRun: resultData?.dryRun === true || undefined, // propagate flag
}, run.client_id);
```

### 4. Modify: `src/server/routes/pipeline.ts` (~8 lines)

In `POST /api/pipeline/run` handler:

```typescript
// Line 19: add dryRun to destructuring
const { feature, module, intent, priority, targetUrl, clientId, dryRun } = req.body;

// Line 32: conditionally build dry-run prompt
const prompt = dryRun
  ? buildDryRunPrompt(firstStage.id, { feature, module, intent })
  : buildStagePrompt(firstStage.id, { feature, module, intent, targetUrl });

// Line 33-38: add dryRun to worker task context
await createWorkerTask(pool, run.id, firstStage.id, prompt, {
  feature, module, intent, targetUrl, dryRun: dryRun || undefined,
}, clientId);
```

Import `buildDryRunPrompt` from orchestrator.

### 5. Modify: `src/worker/index.ts` (~12 lines)

**5a.** In `executeClaudeCliStage()` at line 202, skip agent file for dry runs:

```typescript
// Check if this is a dry run — skip agent file to prevent real work
const isDryRun = task.context?.dryRun === true;
const agentInstructions = (!isDryRun && stageConfig?.agentFile)
  ? loadAgentFile(stageConfig.agentFile)
  : null;
```

Also reduce maxTurns for dry runs (line 214):
```typescript
cliArgs.push('--max-turns', String(isDryRun ? 1 : stageConfig.maxTurns));
```

**5b.** In `workerLoop()` after execution (~line 423), enforce dryRun in result so orchestrator routing doesn't depend on Claude's response:

```typescript
// Enforce dryRun flag in result — orchestrator uses this for routing
if (task.context?.dryRun) {
  result.result = { ...result.result, dryRun: true };
}
```

This is the critical safety net: even if Claude doesn't return `{ "dryRun": true }` in its JSON, the worker injects it before reporting to the server. This makes dry-run routing **100% reliable** regardless of Claude's behavior.

**5c.** Same dryRun check needed in `executeClaudeSdkStage()` (~line 440) for SDK-mode workers — skip agent file, reduce max tokens. Lower priority since dry runs are primarily local/CLI.

---

## NOT Touched

| File | Why |
|------|-----|
| `src/server/db/schema.sql` | No schema change — dryRun lives in JSONB context, not a column |
| Agent `.agent.md` files | Worker skips loading them for dry runs |
| Gate scripts (`scripts/*-pre-run.ts`) | Not invoked in server-backed mode |
| `src/worker/sdk-executor.ts` | SDK path uses same task context — dryRun flag works identically |
| `config/pipeline-definition.json` | Stage definitions unchanged — routing overridden at runtime |

---

## Verification

### How to run:
```bash
curl -X POST http://localhost:3001/api/pipeline/run \
  -H "Content-Type: application/json" \
  -d '{"feature":"Dry Run Test","module":"system","intent":"Verify pipeline connectivity","dryRun":true}'
```

### Expected flow (5 stages, linear):
```
requirements → planning → generation → healing → audit → completed
```

### What "passing" looks like:
- All **5** stages complete with `PRESENT_AND_READY` in result_data
- Pipeline status: `completed` (not `fixme` or `error`)
- Each stage's result echoes back feature/module/intent
- Worker logs show `--max-turns 1` for each stage (fast execution)
- No agent `.md` file loaded (worker logs should NOT show "Loading agent file")
- Total cost: ~$0 (CLI mode) — each stage is ~1 turn with haiku-level prompt
- Time to complete: < 1 minute (5 stages × ~10s each)

### How to verify results:
```bash
# Get run detail with all stage results
curl http://localhost:3001/api/pipeline/{runId}
```

Each stage result's `result_data` should contain:
```json
{
  "dryRun": true,
  "stage": "<stage-id>",
  "status": "PRESENT_AND_READY"
}
```

### Files modified (5 total):
1. `config/dry-run-prompt.md` — NEW (template)
2. `src/orchestrator/types.ts` — +1 line (dryRun field)
3. `src/orchestrator/orchestrator.ts` — ~20 lines (dry-run routing + prompt builder + context propagation)
4. `src/server/routes/pipeline.ts` — ~8 lines (accept dryRun, build prompt, pass context)
5. `src/worker/index.ts` — ~5 lines (skip agent file, reduce max turns)
