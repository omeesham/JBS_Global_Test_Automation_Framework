# PLAN 43 (Corrected): Pipeline Plumbing — Connect the Joints

## Context

The 5-agent pipeline (Requirements → Planning → Generation → Healing → Audit) is 80% built. Server orchestration, routing, convergence guards, worker polling — all exist. But water doesn't flow because joints aren't welded:

1. **Worker sends blind prompts** — `stageConfig.agentFile` arrives from server (worker.ts:80) but is never loaded. Agents get ~10-line metadata stubs instead of full ~200-line instructions.
2. **Worker drops artifacts** — line 380 always passes `undefined`. Server artifact storage (worker.ts:117-129) works but never receives data.
3. **Local fallback has shell escaping bug** — `pipeline-orchestrator.ts:205-206` uses `execSync` with string interpolation. Prompts with backticks, `$`, or nested quotes will break.

**Goal**: Submit a requirement → all 5 stages chain → tests get generated. Ready for localhost demo AND prod deployment.

---

## Changes (2 files, ~60 lines)

### File 1: `src/worker/index.ts`

#### 1a. Add type alias + helper function (insert after line 170)

```typescript
// ── Agent File Loading ──

type StageArtifact = { name: string; type: string; content: string };

function loadAgentFile(agentFile: string): string | null {
  const agentPath = path.resolve(__dirname, '../../', agentFile);
  try {
    let content = fs.readFileSync(agentPath, 'utf-8');
    // Strip YAML frontmatter (GitHub Copilot format — not actionable by Claude CLI)
    if (content.startsWith('---')) {
      const endIdx = content.indexOf('---', 3);
      if (endIdx !== -1) content = content.slice(endIdx + 3).trim();
    }
    console.log(`[Worker] Loaded agent file: ${agentFile} (${content.length} chars)`);
    return content;
  } catch {
    console.warn(`[Worker] Agent file not found: ${agentPath}, using thin prompt`);
    return null;
  }
}
```

**Why shared helper**: Both CLI and SDK modes need identical agent.md loading + frontmatter stripping.

#### 1b. Modify `executeClaudeCliStage` (lines 174-230)

**Return type** (line 177) — add `artifacts`:
```typescript
// Before:
): Promise<{ success: boolean; result: Record<string, unknown>; cost: number }> {
// After:
): Promise<{ success: boolean; result: Record<string, unknown>; cost: number; artifacts: StageArtifact[] }> {
```

**After line 178** — load agent instructions:
```typescript
const { agentPrompt, stageConfig } = task;

// Load full agent instructions
const agentInstructions = stageConfig?.agentFile ? loadAgentFile(stageConfig.agentFile) : null;
const fullPrompt = agentInstructions
  ? agentInstructions + '\n\n---\n\nPIPELINE CONTEXT:\n' + agentPrompt
  : agentPrompt;
```

**Line 182** — use fullPrompt in CLI args:
```typescript
'-p', fullPrompt,  // was: agentPrompt
```

**Line 191** — keep `agentPrompt` for preview log (don't dump 200 lines of agent.md).

**After line 210** (after JSON parse) — create artifact:
```typescript
const artifacts: StageArtifact[] = [{
  name: `${task.stageId}-output.json`,
  type: 'json',
  content: JSON.stringify(parsed, null, 2).slice(0, 50_000),
}];
```

**Lines 212-216** (success return) — add `artifacts`:
```typescript
return { success: true, result: parsed, cost: 0, artifacts };
```

**Lines 217-229** (error catch) — capture error as artifact too:
```typescript
const errorArtifacts: StageArtifact[] = [{
  name: `${task.stageId}-error.txt`,
  type: 'text',
  content: (error.message + '\n' + (error.stderr || '')).slice(0, 50_000),
}];
return {
  success: false,
  result: { error: error.message, exitCode: error.status, stderr: error.stderr?.slice(0, 5000) },
  cost: 0,
  artifacts: errorArtifacts,
};
```

#### 1c. Modify `executeClaudeSdkStage` (lines 394-453)

**Return type** (line 396) — add `artifacts: StageArtifact[]`

**After line 420** — load agent.md into system message:
```typescript
const agentInstructions = task.stageConfig?.agentFile ? loadAgentFile(task.stageConfig.agentFile) : null;
const systemMessage = agentInstructions
  ? agentInstructions + '\n\n---\n\nPipeline Stage: ' + task.stageId
  : `Pipeline Stage: ${task.stageId}`;
```

**Line 426** — use `systemMessage` variable (replaces inline template literal).

**Key design**: In SDK mode, agent.md goes into `systemPrompt` param (position 3 of `callAnthropicAPI`), NOT concatenated with userMessage. Confirmed: `sdk-executor.ts:49-53` signature is `(apiKey, model, systemPrompt, userMessage, ...)`.

**After line 445** (after JSON parse) — create artifact:
```typescript
const artifacts: StageArtifact[] = [{
  name: `${task.stageId}-output.json`,
  type: 'json',
  content: JSON.stringify(parsed, null, 2).slice(0, 50_000),
}];
```

**Lines 448-452** — add `artifacts` to success return.

**Lines 432-438** — add error artifact to failure return:
```typescript
const errorArtifacts: StageArtifact[] = [{
  name: `${task.stageId}-error.txt`,
  type: 'text',
  content: (sdkResult.error || 'Unknown SDK error').slice(0, 50_000),
}];
// ... add artifacts: errorArtifacts to return
```

#### 1d. Update main loop (lines 345-386)

**Line 358** — result type adds `artifacts`:
```typescript
let result: { success: boolean; result: Record<string, unknown>; cost: number; artifacts: StageArtifact[] };
```

**Line 380** — pass real artifacts:
```typescript
// Before:
await completeTask(task.taskId, result.success, result.result, undefined, result.cost);
// After:
await completeTask(task.taskId, result.success, result.result, result.artifacts, result.cost);
```

#### 1e. Update `attemptApiOverflow` return type (line 466)

```typescript
// Before:
): Promise<{ success: boolean; result: Record<string, unknown>; cost: number } | null> {
// After:
): Promise<{ success: boolean; result: Record<string, unknown>; cost: number; artifacts: StageArtifact[] } | null> {
```

No body changes needed — it delegates to `executeClaudeSdkStage` which now returns artifacts.

---

### File 2: `scripts/pipeline-orchestrator.ts`

#### 2a. Add `execFileSync` import (line 21)

```typescript
// Before:
import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
// After:
import { execSync, execFileSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
```

**Note**: Old plan incorrectly claimed "already imported as execFile." That's in the worker, NOT this file.

#### 2b. Fix shell escaping in `invokeAgent` (lines 204-209)

```typescript
// Before:
    const output = execSync(
      `claude -p "${prompt.replace(/"/g, '\\"')}" --output-format json`,
      execOpts,
    );
    return { exitCode: 0, output: output ?? '' };

// After:
    const output = execFileSync(
      'claude',
      ['-p', prompt, '--output-format', 'json'],
      execOpts,
    );
    return { exitCode: 0, output: output ?? '' };
```

**Note**: Variable is `prompt` (line 177), NOT `agentPrompt`. Old plan had wrong variable name.

#### 2c. Load agent.md in `buildAgentPrompt` (lines 219-228)

```typescript
// Before:
function buildAgentPrompt(stage: string, itemId: string): string {
  const prompts: Record<string, string> = {
    requirements: `Process requirements for queue item ${itemId}...`,
    // ... 4 more stubs
  };
  return prompts[stage] ?? `Process stage ${stage} for item ${itemId}`;
}

// After:
function buildAgentPrompt(stage: string, itemId: string): string {
  // Load agent.md from pipeline-definition.json
  let agentInstructions = '';
  try {
    const defPath = path.join(__dirname, '../config/pipeline-definition.json');
    const definition = JSON.parse(fs.readFileSync(defPath, 'utf-8'));
    const stageDef = definition.stages.find((s: { id: string }) => s.id === stage);
    if (stageDef?.agentFile) {
      const agentPath = path.join(__dirname, '..', stageDef.agentFile);
      let content = fs.readFileSync(agentPath, 'utf-8');
      // Strip YAML frontmatter (GitHub Copilot format)
      if (content.startsWith('---')) {
        const endIdx = content.indexOf('---', 3);
        if (endIdx !== -1) content = content.slice(endIdx + 3).trim();
      }
      agentInstructions = content + '\n\n---\n\n';
      console.log(`[info] Loaded agent file: ${stageDef.agentFile} (${content.length} chars)`);
    }
  } catch (err) {
    console.warn(`[WARN] Could not load agent file for stage ${stage}: ${(err as Error).message}`);
  }

  const contextPrompts: Record<string, string> = {
    requirements: `PIPELINE CONTEXT:\nProcess requirements for queue item ${itemId}. Follow the Requirements Agent protocol. Update REQUIREMENTS.md and create/update the queue entry.`,
    planning: `PIPELINE CONTEXT:\nCreate test cases and test plan for queue item ${itemId}. Follow the Planner Agent protocol. Run planner:post-complete when done.`,
    generation: `PIPELINE CONTEXT:\nGenerate spec file for queue item ${itemId}. Follow the Generator Agent protocol. Run generator:pre-run first, then generate and test the spec. Run generator:post-complete when done.`,
    healing: `PIPELINE CONTEXT:\nDebug and fix failing tests for queue item ${itemId}. Follow the Healer Agent protocol. Read failure-summary.json first. Apply 7-step RCA.`,
    audit: `PIPELINE CONTEXT:\nAudit the completed work for queue item ${itemId}. Follow the Audit Agent protocol. Check all agent outputs for compliance.`,
  };

  return agentInstructions + (contextPrompts[stage] ?? `Process stage ${stage} for item ${itemId}`);
}
```

---

## NOT Touched

| File | Reason |
|------|--------|
| `src/orchestrator/orchestrator.ts` | Routing works. `buildStagePrompt` intentionally thin — worker loads agent.md. |
| `src/server/routes/worker.ts` | Already sends `stageConfig.agentFile` (line 80), already stores artifacts (lines 117-129). |
| `src/server/db/queries.ts` | `createArtifact`, `completeWorkerTask` correct as-is. |
| `src/worker/sdk-executor.ts` | `callAnthropicAPI` signature correct — we just feed better inputs. |
| `config/pipeline-definition.json` | All 5 stages have correct `agentFile` paths. |
| `.github/agents/*.agent.md` | Loaded as-is (minus frontmatter). |

---

## Bugs Fixed from Old Plan 43

| # | Bug in old plan | Correction |
|---|----------------|------------|
| 1 | Line numbers stale (completeTask "line 356") | Actual: line 380. All line refs verified against current code. |
| 2 | Variable name `agentPrompt` in orchestrator fix | Actual: `prompt` (line 177 of pipeline-orchestrator.ts). |
| 3 | "already imported as execFile" for orchestrator | Wrong file. Orchestrator only has `execSync`. Must ADD `execFileSync`. |
| 4 | SDK mode said "same injection" (vague) | Specific: agent.md → `systemPrompt` param, not concat with userMessage. |
| 5 | Artifact extraction assumed `parsed.files` array | Claude CLI doesn't produce `files` array. Capture raw output instead. |
| 6 | No error-path artifacts | Added `{stageId}-error.txt` artifact on failure for both CLI and SDK. |

---

## Known Constraints

1. **YAML frontmatter stripped** — `tools:`, `mcp-servers:`, `handoffs:` are GitHub Copilot config, not actionable by CLI/SDK. Model selection via `pipeline-definition.json`.
2. **Text-only artifacts** — DB column is `TEXT`. Screenshots/videos stay on disk.
3. **Same-machine for Phase 0** — agents read/write project files on disk. Worker resolves agent.md via `path.resolve(__dirname, '../../', agentFile)`.
4. **Windows 32KB arg limit** — agent.md files are 5-10KB + context ~1-2KB = safe margin.

---

## Verification

### Localhost demo:
1. `npm run server:start` → backend on :3001
2. `npm run worker:start` → polls for tasks
3. Submit pipeline:
   ```bash
   curl -X POST http://localhost:3001/api/pipeline/run \
     -H "Content-Type: application/json" \
     -d '{"feature":"Location Currency Tab","module":"locations","intent":"Test currency selection","targetUrl":"https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings"}'
   ```
4. Worker logs should show: `[Worker] Loaded agent file: .github/agents/playwright-requirements.agent.md (NNNN chars)`
5. Each stage chains → next stage picks up automatically
6. `GET /api/pipeline/{runId}` shows artifacts for each stage

### Prod readiness (Render):
- Server on Render receives artifacts via HTTP POST — no file system dependency
- Worker runs on client machine — agent.md files in local checkout
- `stageConfig.agentFile` resolved relative to worker's `__dirname`
- No env var changes needed

### TypeScript compilation:
- `npx tsc --noEmit` must pass — return type changes are additive (adding `artifacts` field)

---

## Execution

1. `/execute` PLAN_43
2. `/audit` — verify all changes, grep for missed patterns, check types compile
3. Then → PLAN_44 (Dry Run Roll Call)
