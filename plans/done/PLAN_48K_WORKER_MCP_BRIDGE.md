# PLAN 48K: Worker MCP Bridge + Pre-Stage Artifact Validation + Gate Execution

## Status: PENDING
## Priority: P0-CRITICAL
## Depends On: Nothing (but must land before 48J autonomous orchestration)

## Problem

Three systemic failures prevent the autonomous pipeline from running agents properly:

### A. Agents Have Zero MCP Access Through Worker

Worker at `src/worker/index.ts:184` strips YAML frontmatter containing `mcp-servers:` config with the comment "GitHub Copilot format — not actionable by Claude CLI". **This comment is WRONG** — Claude CLI supports MCP via `--mcp-config <path>` flag. Proof: `~/.claude/mcp.json` already exists with `playwright-test` MCP server configured.

Result: When agents run through the autonomous pipeline (worker → Claude CLI), they have **zero MCP tools** — no `browser_navigate`, no `browser_click`, no `browser_evaluate`. They can only read/write files. The Planner can't verify selectors, the Generator can't run tests, the Healer can't debug in a browser.

### B. No Upstream Artifact Validation Before Downstream Stages

The orchestrator at `src/orchestrator/orchestrator.ts` calls `processStageCompletion()` which routes to the next stage purely based on outcome ('success'/'fail'). It never checks whether upstream artifacts actually exist and are valid before creating a downstream task.

Result: Generator gets dispatched even if Planner produced no test cases or selectors. Healer gets dispatched even if Generator produced no spec file.

### C. Pre-Run and Post-Complete Gates Are Dead Code

Gate scripts exist in `scripts/*.ts` (5 pre-run, 5 post-complete) but **nothing in the autonomous pipeline invokes them**. The worker doesn't run pre-run gates before executing an agent. The orchestrator doesn't run post-complete gates after receiving results. These scripts only work when manually executed via `npm run generator:pre-run <id>`.

Result: All the intelligence in the 500+ line `generator-pre-run.ts` (selector catalog, FIXME scan, TC registry, iteration cap) is completely bypassed when running autonomously.

---

## Changes

### Part A: Dynamic MCP Config Per Task

**Problem**: Each pipeline run targets a different URL (`target_url` field on PipelineRun). The Playwright MCP server needs `BASE_URL` env var set to this URL. Static config files won't work — each task needs its own MCP config with the correct URL.

#### A1. Add `mcpConfig` to StageDefinition

**File**: `src/orchestrator/types.ts`

Add optional field to `StageDefinition`:

```typescript
export interface StageDefinition {
  // ... existing fields ...
  mcpConfig?: string; // Name of MCP config template (e.g., "browser-and-test")
}
```

#### A2. Add `mcpConfig` to pipeline-definition.json

**File**: `config/pipeline-definition.json`

Add `mcpConfig` to stages that need MCP tools:

```json
{
  "id": "requirements",
  "mcpConfig": "browser-only",
  ...
},
{
  "id": "planning",
  "mcpConfig": "browser-only",
  ...
},
{
  "id": "generation",
  "mcpConfig": "browser-and-test",
  ...
},
{
  "id": "healing",
  "mcpConfig": "browser-and-test",
  ...
},
{
  "id": "audit",
  "mcpConfig": null,
  ...
}
```

#### A3. Create MCP Config Templates

**File**: `config/mcp/browser-only.json.template`
```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@anthropic-ai/claude-code-mcp-server-playwright@latest"],
      "env": { "BASE_URL": "{{BASE_URL}}" }
    }
  }
}
```

**File**: `config/mcp/browser-and-test.json.template`
```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@anthropic-ai/claude-code-mcp-server-playwright@latest"],
      "env": { "BASE_URL": "{{BASE_URL}}" }
    },
    "playwright-test": {
      "type": "stdio",
      "command": "npx",
      "args": ["playwright", "run-test-mcp-server"],
      "env": { "BASE_URL": "{{BASE_URL}}" }
    }
  }
}
```

NOTE: The exact MCP server packages/commands should be verified against Claude CLI docs at execution time. The templates use `{{BASE_URL}}` as a placeholder — the worker will substitute the actual target URL at runtime.

#### A4. Worker: Generate Temp MCP Config + Pass --mcp-config

**File**: `src/worker/index.ts`

Changes to `executeClaudeCliStage()`:

```typescript
// After building cliArgs (line ~267), before spawn:

// Generate per-task MCP config if stage has mcpConfig
let tempMcpPath: string | null = null;
if (stageConfig?.mcpConfig) {
  const templatePath = path.resolve(__dirname, `../../config/mcp/${stageConfig.mcpConfig}.json.template`);
  if (fs.existsSync(templatePath)) {
    let template = fs.readFileSync(templatePath, 'utf-8');
    // Inject target URL from task context
    const targetUrl = (task.context as Record<string, unknown>)?.targetUrl as string || '';
    template = template.replace(/\{\{BASE_URL\}\}/g, targetUrl);

    // Write to temp file (per-task, cleaned up after)
    tempMcpPath = path.resolve(__dirname, `../../.tmp/mcp-${task.taskId}.json`);
    fs.mkdirSync(path.dirname(tempMcpPath), { recursive: true });
    fs.writeFileSync(tempMcpPath, template);

    cliArgs.push('--mcp-config', tempMcpPath);
  }
}

// ... spawn child process ...

// In child.on('close') and child.on('error') — cleanup:
if (tempMcpPath && fs.existsSync(tempMcpPath)) {
  fs.unlinkSync(tempMcpPath);
}
```

#### A5. Pass mcpConfig Through Task Response

**File**: `src/server/routes/worker.ts` — `next-task` handler

Add `mcpConfig` to stageConfig in the response (line 77-84):

```typescript
stageConfig: stageDef ? {
  model: stageDef.model,
  maxTurns: stageDef.maxTurns,
  timeoutSeconds: stageDef.timeoutSeconds,
  budgetCap: stageDef.budgetCap,
  agentFile: stageDef.agentFile,
  mcpConfig: stageDef.mcpConfig || null,  // NEW
} : null,
```

**File**: `src/worker/index.ts` — Update `TaskResponse.stageConfig` interface:

```typescript
stageConfig: {
  model: string;
  maxTurns: number;
  timeoutSeconds: number;
  budgetCap: number;
  agentFile: string;
  mcpConfig: string | null;  // NEW
} | null;
```

#### A6. Stop Stripping YAML Frontmatter

**File**: `src/worker/index.ts` — `loadAgentFile()` (line 180-195)

Keep stripping YAML frontmatter for now (it's not valid prompt text for Claude CLI), BUT update the comment:

```typescript
// Strip YAML frontmatter (VS Code Copilot extension format — contains mcp-servers config
// which is provided separately via --mcp-config flag for Claude CLI invocations)
```

The MCP config is now provided via `--mcp-config` flag (Part A4), so stripping the YAML frontmatter from the prompt text is still correct — we just need to stop LOSING the MCP intent.

---

### Part B: Pre-Stage Artifact Validation

Before the orchestrator creates a task for the next stage, validate that upstream artifacts exist.

#### B1. Create Artifact Validator

**File**: `src/orchestrator/artifact-validator.ts` (NEW — ~80 lines)

```typescript
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

const ARTIFACT_REQUIREMENTS: Record<string, (context: Record<string, unknown>) => ValidationResult> = {
  planning: (ctx) => {
    // Planning needs: requirements doc referencing this module
    const missing: string[] = [];
    const reqPath = path.resolve(__dirname, '../../docs/REQUIREMENTS.md');
    if (!fs.existsSync(reqPath)) missing.push('docs/REQUIREMENTS.md');
    return { valid: missing.length === 0, missing, warnings: [] };
  },

  generation: (ctx) => {
    // Generation needs: test cases, test plan, selectors
    const missing: string[] = [];
    const warnings: string[] = [];
    const module = ctx.module as string || '';
    const feature = ctx.feature as string || '';

    // Check test cases directory
    const tcDir = path.resolve(__dirname, `../../specs_planning/test-cases/${module}`);
    if (!fs.existsSync(tcDir) || fs.readdirSync(tcDir).length === 0) {
      missing.push(`specs_planning/test-cases/${module}/ (no test cases from Planner)`);
    }

    // Check selector partition exists
    const selectorDir = path.resolve(__dirname, `../../src/selectors/${module}`);
    if (!fs.existsSync(selectorDir) || fs.readdirSync(selectorDir).length === 0) {
      missing.push(`src/selectors/${module}/ (no selectors from Planner)`);
    }

    return { valid: missing.length === 0, missing, warnings };
  },

  healing: (ctx) => {
    // Healing needs: spec file + failure data
    const missing: string[] = [];
    const module = ctx.module as string || '';

    const specDir = path.resolve(__dirname, `../../tests/specs/${module}`);
    if (!fs.existsSync(specDir) || fs.readdirSync(specDir).filter(f => f.endsWith('.spec.ts')).length === 0) {
      missing.push(`tests/specs/${module}/*.spec.ts (no spec from Generator)`);
    }

    return { valid: missing.length === 0, missing, warnings };
  },

  audit: (ctx) => {
    // Audit needs: spec file (same as healing)
    const missing: string[] = [];
    const module = ctx.module as string || '';

    const specDir = path.resolve(__dirname, `../../tests/specs/${module}`);
    if (!fs.existsSync(specDir) || fs.readdirSync(specDir).filter(f => f.endsWith('.spec.ts')).length === 0) {
      missing.push(`tests/specs/${module}/*.spec.ts`);
    }

    return { valid: missing.length === 0, missing, warnings };
  },
};

export function validateUpstreamArtifacts(
  nextStageId: string,
  context: Record<string, unknown>
): ValidationResult {
  const validator = ARTIFACT_REQUIREMENTS[nextStageId];
  if (!validator) return { valid: true, missing: [], warnings: [] };
  return validator(context);
}
```

#### B2. Integrate Into Orchestrator

**File**: `src/orchestrator/orchestrator.ts` — `processStageCompletion()` (line 298-331)

After finding `nextStage` and before creating the worker task, add artifact validation:

```typescript
// After: const nextStage = definition.stages.find(s => s.id === nextStageId);
// After: skip disabled stages check

// Validate upstream artifacts before creating downstream task
import { validateUpstreamArtifacts } from './artifact-validator';

const context = {
  feature: run.feature,
  module: run.module,
  intent: run.intent,
  targetUrl: run.target_url,
};

const validation = validateUpstreamArtifacts(nextStageId, context);
if (!validation.valid) {
  console.error(`[Orchestrator] Upstream artifacts missing for ${nextStageId}:`, validation.missing);

  // Route back to the upstream stage that should have produced these artifacts
  const upstreamStage = getUpstreamStage(stageId, nextStageId);
  if (upstreamStage) {
    // Create a "fix upstream" task for the upstream agent
    const fixPrompt = buildUpstreamFixPrompt(upstreamStage, validation.missing, run);
    await createWorkerTask(pool, runId, upstreamStage, fixPrompt, {
      ...context,
      previousStage: stageId,
      previousOutcome: 'upstream_artifacts_missing',
      missingArtifacts: validation.missing,
    }, run.client_id);
    await updatePipelineRun(pool, runId, { stage: upstreamStage, status: 'queued' });

    emitEvent(runId, {
      type: 'error',
      runId,
      message: `Stage "${nextStageId}" blocked: missing upstream artifacts. Routing back to "${upstreamStage}". Missing: ${validation.missing.join(', ')}`,
      timestamp: new Date().toISOString(),
      visibility: 'admin',
    });
    return;
  }

  // No upstream to route to — terminal error
  await updatePipelineRun(pool, runId, { status: 'error', stage: stageId });
  emitEvent(runId, {
    type: 'error',
    runId,
    message: `Pipeline error: missing artifacts for "${nextStageId}" with no upstream to fix. Missing: ${validation.missing.join(', ')}`,
    timestamp: new Date().toISOString(),
    visibility: 'admin',
  });
  return;
}
```

#### B3. Helper Functions

**File**: `src/orchestrator/orchestrator.ts` — add helper functions

```typescript
function getUpstreamStage(currentStageId: string, blockedStageId: string): string | null {
  // Map: which stage is responsible for producing artifacts for which downstream stage
  const upstreamMap: Record<string, string> = {
    generation: 'planning',   // Planner produces TCs + selectors for Generator
    healing: 'generation',    // Generator produces spec for Healer
    audit: 'generation',      // Generator produces spec for Audit
    planning: 'requirements', // Requirements produces REQUIREMENTS.md for Planner
  };
  return upstreamMap[blockedStageId] || null;
}

function buildUpstreamFixPrompt(
  upstreamStageId: string,
  missingArtifacts: string[],
  run: { feature: string; module: string; intent: string; target_url: string | null }
): string {
  return [
    `UPSTREAM FIX REQUIRED — Your previous output was incomplete.`,
    ``,
    `The downstream stage could not start because the following artifacts are missing:`,
    ...missingArtifacts.map(a => `  - ${a}`),
    ``,
    `Feature: ${run.feature}`,
    `Module: ${run.module}`,
    `Intent: ${run.intent}`,
    run.target_url ? `Target URL: ${run.target_url}` : '',
    ``,
    `Please produce the missing artifacts listed above. Do not repeat work that was already done — only fill the gaps.`,
  ].filter(Boolean).join('\n');
}
```

---

### Part C: Gate Execution Integration

Wire the existing pre-run and post-complete gate scripts into the autonomous pipeline.

#### C1. Gate Runner Utility

**File**: `src/orchestrator/gate-runner.ts` (NEW — ~60 lines)

```typescript
import { execFileSync } from 'child_process';
import * as path from 'path';

interface GateResult {
  passed: boolean;
  output: string;
}

/**
 * Execute a gate script (pre-run or post-complete).
 * Gate scripts exit 0 = pass, exit 1 = fail.
 */
export function runGate(gateScript: string, args: string[] = []): GateResult {
  const scriptPath = path.resolve(__dirname, '../../scripts', gateScript);

  try {
    const output = execFileSync('npx', ['ts-node', scriptPath, ...args], {
      cwd: path.resolve(__dirname, '../../'),
      encoding: 'utf-8',
      timeout: 60_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { passed: true, output };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return {
      passed: false,
      output: ((e.stdout ?? '') + '\n' + (e.stderr ?? '')).trim(),
    };
  }
}
```

#### C2. Pre-Run Gate in Orchestrator

**File**: `src/orchestrator/orchestrator.ts` — in `processStageCompletion()`, after artifact validation, before creating worker task:

```typescript
// Run pre-run gate if defined
if (nextStage.preRunGate) {
  const gateResult = runGate(nextStage.preRunGate, [/* queueItemId if available */]);
  if (!gateResult.passed) {
    console.error(`[Orchestrator] Pre-run gate failed for ${nextStageId}: ${gateResult.output.slice(0, 500)}`);
    emitEvent(runId, {
      type: 'error',
      runId,
      message: `Pre-run gate failed for "${nextStageId}": ${gateResult.output.slice(0, 200)}`,
      timestamp: new Date().toISOString(),
      visibility: 'admin',
    });
    // Don't create the task — mark as error
    await updatePipelineRun(pool, runId, { status: 'error', stage: nextStageId });
    return;
  }
}
```

**NOTE**: The existing gate scripts take `<queue-item-id>` as an argument. In the autonomous pipeline, we don't use queue files — we use the DB. The gate scripts will need to be adapted to also accept context via environment variables or stdin. This is a known migration gap — for the initial implementation, pre-run gates can be called without the queue-item-id arg and they'll skip queue-specific checks but still run TypeScript compilation, file existence checks, etc.

#### C3. Post-Complete Gate in Worker Routes

**File**: `src/server/routes/worker.ts` — in complete-task handler, after artifacts stored, before `processStageCompletion()`:

```typescript
// Run post-complete gate if defined
const definition = loadPipelineDefinition();
const completedStage = definition.stages.find(s => s.id === task.stage_id);
if (completedStage?.postCompleteGate && payload.success) {
  const gateResult = runGate(completedStage.postCompleteGate, []);
  if (!gateResult.passed) {
    // Post-complete gate failed — override success to fail
    console.warn(`[Worker Routes] Post-complete gate failed for ${task.stage_id}`);
    payload.success = false;
    payload.result = {
      ...payload.result,
      postCompleteGateFailed: true,
      gateOutput: gateResult.output.slice(0, 2000),
    };
  }
}
```

---

## Files

| File | Change | Lines ~est |
|------|--------|------------|
| `src/orchestrator/types.ts` | Add `mcpConfig?: string` to StageDefinition | +1 |
| `config/pipeline-definition.json` | Add `mcpConfig` to each stage | +5 |
| `config/mcp/browser-only.json.template` | NEW — MCP template with Playwright browser | ~12 |
| `config/mcp/browser-and-test.json.template` | NEW — MCP template with browser + test runner | ~18 |
| `src/worker/index.ts` | Dynamic MCP config generation + --mcp-config flag + cleanup + update TaskResponse | ~30 |
| `src/server/routes/worker.ts` | Pass mcpConfig in stageConfig + post-complete gate execution | ~20 |
| `src/orchestrator/artifact-validator.ts` | NEW — upstream artifact validation | ~80 |
| `src/orchestrator/gate-runner.ts` | NEW — gate script executor | ~60 |
| `src/orchestrator/orchestrator.ts` | Artifact validation + pre-run gate + upstream fix routing | ~50 |

## Risks & Notes

1. **MCP server packages**: The exact `npx` commands for Playwright MCP server should be verified against current Claude CLI/MCP docs at execution time. The template uses placeholder commands.
2. **Gate script migration**: Existing gate scripts expect `queue-item-id` args from the file-based queue system. They'll need gradual migration to work with DB context. Initial integration runs gates without queue-item-id (skip queue checks, keep file/compilation checks).
3. **Temp file cleanup**: The `.tmp/` directory is created per-task. If worker crashes mid-task, temp MCP configs may linger. Add `.tmp/` to `.gitignore` and add cleanup on worker startup.
4. **Planner retries**: Currently `retries: 0` in pipeline-definition.json. When artifact validation routes back to Planner, this counts as a retry. Bump `retries` for planning to at least 1.

## Verification

1. Start pipeline run with `target_url` → verify worker creates `.tmp/mcp-{taskId}.json` with correct BASE_URL → verify `--mcp-config` appears in CLI args → verify temp file cleaned up after
2. Manually delete test cases for a module → trigger generation stage → verify orchestrator blocks and routes back to planning with "upstream fix" prompt
3. Trigger pipeline → verify pre-run gate script output appears in logs → verify post-complete gate runs after agent completes
4. Full pipeline run → verify agents have MCP tools available (check CLI output for tool usage)
