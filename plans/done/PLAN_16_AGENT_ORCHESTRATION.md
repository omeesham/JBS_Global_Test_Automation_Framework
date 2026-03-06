# Plan 16: Agent Orchestration + SaaS Vision

**Status**: PENDING
**Priority**: P1 — no way to chain agents today; each runs in isolation requiring manual handoff
**Scope**: 4 phases (Phase 1 = one session, Phase 2 = 2-3 sessions, Phase 3-4 = project)
**Prerequisite**: PLAN_15 + PLAN_17 done (maintainer agent + autonomy foundation = agents have self-audit, anti-blind-following, and escalation queue before chaining is enabled)

---

## Problem

Today's pipeline is **manual pull-based**: user invokes each agent separately, copy-pastes context, manually checks gates, manually triggers the next agent. A 5-agent pipeline (Requirements → Planner → Generator → Healer → Audit) requires 5 separate user sessions with manual handoffs between each.

**Target state** (phased):
1. Agents invoke each other inside VS Code / Claude Code (Phase 1)
2. One script runs the full pipeline automatically (Phase 2)
3. External users trigger pipelines from a web app, see results on a dashboard (Phase 3-4)

---

## Feasibility Assessment

| Capability | Status (March 2026) | Notes |
|---|---|---|
| VS Code Copilot handoffs (`send: true`) | **Works** | UI-dependent, agent chains in chat. Needs VS Code open. |
| VS Code Copilot subagents (`agent` tool) | **Works** | Since VS Code 1.109 (Jan 2026). One level only. |
| Claude Code subagents (Task tool) | **Works** | Spawn specialized subagents. One level (no recursion). |
| Claude Code headless (`claude -p`) | **Works** | Non-interactive, CI/CD friendly. JSON output. |
| Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) | **Works** | Programmatic `query()`, structured outputs, MCP integration. |
| Claude Agent SDK structured outputs | **Works** | JSON Schema enforcement on agent responses. |
| Server-side agent execution (containers) | **Works** | E2B, Modal, Fly, Vercel Sandbox. ~$0.05/hr + tokens. |
| VS Code agents triggered externally (CLI/CI) | **Does NOT work** | No API, no headless. Chat-only. |
| Recursive subagents (agent spawns agent spawns agent) | **Does NOT work** | One level only in both VS Code and Claude Code. |

**Bottom line**: VS Code handoffs work for Phase 1 (interactive). Claude Agent SDK is the real backbone for Phases 2-4 (programmatic, headless, server-side).

---

## What Already Exists in Encore

The research found significant existing infrastructure to build on:

| Component | File(s) | Reusable? |
|---|---|---|
| Queue with stage tracking | `specs_planning/agent-queue.json` | Yes — stage enum (pending_requirements → ... → completed) |
| Pre-run gate (pre-flight checks) | `scripts/generator-pre-run.ts` | Yes — exit 0/1 pattern, context injection |
| Post-complete gate (20+ validation gates) | `scripts/generator-post-complete.ts` | Yes — extend with stage transition |
| Context builder (per-task injection) | `scripts/task-context-builder.ts` | Yes — feeds context to next agent |
| Sync validation | `scripts/validate-agent-sync.ts` | Yes — drift detection |
| Performance/trust tracking | `scripts/agent-metrics.ts` + agent-performance.json | Yes — trust levels gate autonomy |
| Activity log | `specs_planning/agent-activity-log.md` | Yes — audit trail for handoffs |

**Key gaps** (what's missing):
1. No stage auto-transition after post-complete passes
2. No "invoke next agent" mechanism
3. No conditional routing (pass → audit, fail → healing)
4. No handoff context (successor can't read what predecessor did)
5. No agent files declare their transition conditions

---

## Phase 1: VS Code Agent Chaining with Auto-Invoke Toggle (1 session)

**Goal**: Chain agents so completing one auto-invokes the next inside VS Code chat. Toggle controls whether chaining is active.

### 1A: Create auto-invoke toggle

Add a config file that all agents read at session start:

**File: `config/pipeline-config.json`**
```json
{
  "autoInvoke": {
    "enabled": true,
    "loop": ["requirements", "planner", "generator"],
    "conditionalAgents": {
      "healer": "on-generator-fail",
      "audit": "on-generator-pass"
    }
  }
}
```

**Behavior:**
- `enabled: true` → when an agent finishes its job, it automatically invokes the next agent in the `loop` array via `send: true` handoff. No user click needed — the chain fires automatically.
- `enabled: false` → agents work in isolation (current behavior). Handoff buttons still appear but with `send: false` (user must click to trigger).
- `loop` defines the primary chain: Requirements → Planner → Generator. This is the "one loop" — first agent starts, last agent (Generator) finishes = loop complete.
- `conditionalAgents` are triggered by Generator results, not part of the main loop: Generator fail → Healer, Generator pass → Audit.

**How agents read the toggle:**
Each agent's prompt includes a rule:
```markdown
## Auto-Invoke Protocol
1. At session START: read `config/pipeline-config.json`
2. If `autoInvoke.enabled === true` AND you completed your task successfully:
   → Use the handoff with `send: true` to invoke the next agent automatically
3. If `autoInvoke.enabled === false`:
   → Report completion. Do NOT auto-invoke. User will manually trigger the next agent.
4. Generator special case: check test results.
   - Tests pass → invoke Audit (if autoInvoke enabled)
   - Tests fail → invoke Healer (if autoInvoke enabled)
```

### 1B: Add handoffs to agent YAML frontmatter

Each agent file gets a `handoffs` section with `send: true`:

**Design note**: VS Code `send: true` is static YAML — it auto-sends when the agent completes. To make the toggle work at runtime, the agent checks `config/pipeline-config.json` BEFORE completing. If `autoInvoke.enabled === false`, the agent reports "Task complete — auto-invoke is OFF" and does NOT produce the completion signal that triggers the handoff. If `true`, the agent completes normally and the `send: true` handoff fires. Alternative: use `send: false` in YAML and have agents manually invoke via the `agent` tool when toggle is ON. The executor should test both approaches and pick what works.

**Requirements Agent** → Planner:
```yaml
handoffs:
  - label: "Plan test cases"
    agent: "playwright-test-planner"
    prompt: "Requirements are complete. Run planner:post-complete and create test cases for the next queue item."
    send: true
```

**Planner Agent** → Generator:
```yaml
handoffs:
  - label: "Generate spec"
    agent: "playwright-test-generator"
    prompt: "Test plan and cases are ready. Run generator:pre-run, then generate the spec."
    send: true
```

**Generator Agent** → Audit (on pass) or Healer (on fail):
```yaml
handoffs:
  - label: "Run audit"
    agent: "playwright-pipeline-audit"
    prompt: "Spec generation complete. Run audit on the completed item."
    send: true
  - label: "Heal failures"
    agent: "playwright-test-healer"
    prompt: "Tests have failures. Run healing cycle."
    send: true
```

**Healer Agent** → Audit:
```yaml
handoffs:
  - label: "Run audit"
    agent: "playwright-pipeline-audit"
    prompt: "Healing complete. Run final audit."
    send: true
```

### 1C: Enable subagent capability

Add `agent` to each agent's `tools` list:
```yaml
tools: ['agent', 'vscode', 'execute', ...]
```

Ensure VS Code setting `chat.customAgentInSubagent.enabled: true`.

### 1D: Add toggle rule to AGENT_SHARED_RULES.md

Add a new shared rule (e.g., ALL-021) that all agents follow:
```markdown
ALL-021: Auto-Invoke Protocol — Read `config/pipeline-config.json` at session start. If autoInvoke.enabled, chain to next agent on success. If disabled, report and stop.
```

### 1E: Verify

- Set `autoInvoke.enabled: true` in config
- Start a session with Requirements Agent
- Complete requirements → Planner auto-starts (no click)
- Planner completes → Generator auto-starts
- Generator finishes = loop complete
- Toggle OFF → repeat → agents stop after their task, no auto-chain
- Toggle ON with Generator fail → Healer auto-invoked → Healer pass → Audit auto-invoked

**Deliverable**: `config/pipeline-config.json` + All 5 `.github/agents/*.agent.md` files updated with handoffs + agent tool + auto-invoke rule in AGENT_SHARED_RULES.md.

---

## Phase 2: Pipeline Orchestrator Script (2-3 sessions)

**Goal**: One command runs the full pipeline. No manual handoffs.

### 2A: Create `scripts/pipeline-orchestrator.ts`

Core logic:
```typescript
// Pseudocode
async function runPipeline(itemId: string) {
  const stages = ['requirements', 'planning', 'generation', 'healing', 'audit'];

  for (const stage of stages) {
    // 1. Run pre-flight for this stage
    const preflight = await runScript(`${stage}:pre-run`, itemId);
    if (preflight.exitCode !== 0) { log('BLOCKED at pre-run'); break; }

    // 2. Invoke agent (claude -p with agent prompt)
    const result = await invokeAgent(stage, itemId);

    // 3. Run post-complete validation
    const postComplete = await runScript(`${stage}:post-complete`, itemId);

    // 4. Conditional routing
    if (postComplete.exitCode !== 0) {
      if (stage === 'generation') {
        // Route to healing
        continue; // healing is next in array
      }
      log('BLOCKED at post-complete'); break;
    }

    // 5. Transition stage in queue
    await transitionStage(itemId, stage);
  }
}
```

### 2B: Create missing gate scripts + extend existing ones

**Current state**: Only `generator-pre-run.ts`, `generator-post-complete.ts`, and `planner-post-complete.ts` exist. The orchestrator pseudocode assumes `${stage}:pre-run` and `${stage}:post-complete` for ALL stages.

**Create** (3 agents × 2 gates = 6 new scripts, can be thin wrappers at first):
- `requirements-post-complete.ts` — verify REQUIREMENTS.md updated, queue entry created
- `healer-pre-run.ts` — verify failure-summary.json exists, MCP available
- `healer-post-complete.ts` — verify fix applied, tests re-run
- `audit-pre-run.ts` — verify target agent output exists
- `audit-post-complete.ts` — verify findings report created, agent-mistakes.md updated
- `requirements-pre-run.ts` — verify MCP browser available, BASE_URL set

**Extend existing** post-complete scripts with stage transition:
- On exit 0: Update queue item `stage` to next stage
- Unlock item (`lockedBy: null`)
- Write `completionContext` to queue item (what was done, artifacts modified)

### 2C: Create handoff context schema

Extend queue item with:
```json
{
  "completionContext": {
    "phaseCompleted": "generation",
    "artifactsModified": ["tests/specs/locations/location-pricing.spec.ts"],
    "testsPassed": true,
    "defectsFound": 0,
    "recommendedNextStage": "audit"
  }
}
```

### 2D: Add npm scripts

```json
"pipeline:run": "ts-node scripts/pipeline-orchestrator.ts",
"pipeline:run:from": "ts-node scripts/pipeline-orchestrator.ts --from",
"pipeline:status": "ts-node scripts/pipeline-orchestrator.ts --status"
```

### 2E: Conditional routing matrix

| Current Stage | Outcome | Next Stage |
|---|---|---|
| requirements | pass | pending_planning |
| planning | pass | pending_generation |
| generation | pass (tests pass) | pending_audit |
| generation | fail (tests fail) | pending_healing |
| healing | pass | pending_audit |
| healing | fail (3+ retries) | blocked |
| audit | pass | completed |
| audit | fail (critical findings) | pending_healing |

**Deliverable**: `scripts/pipeline-orchestrator.ts` + updated post-complete scripts + npm scripts.

---

## Phase 3: Claude Agent SDK Integration (Medium-term project)

**Goal**: Headless, programmatic pipeline execution. No VS Code required.

### 3A: Port agent prompts to SDK

Each `.github/agents/*.agent.md` → SDK `AgentDefinition`:
```typescript
const requirementsAgent: AgentDefinition = {
  name: "requirements-agent",
  description: "Extracts and validates requirements from Jira/docs",
  prompt: fs.readFileSync('.github/agents/playwright-requirements.agent.md'),
  tools: ["Read", "Grep", "Glob", "WebFetch"],
  model: "sonnet"
};
```

### 3B: Define structured output schemas

Each agent produces typed output that feeds the next:
```typescript
const RequirementsOutputSchema = z.object({
  module: z.string(),
  fields: z.array(z.object({ name: z.string(), type: z.string(), constraints: z.string() })),
  testableRequirements: z.array(z.string()),
  selectorHints: z.array(z.object({ key: z.string(), cssHint: z.string() }))
});
```

### 3C: Pipeline runner using SDK

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function runAgentStage(agent: AgentDefinition, input: string, schema: ZodSchema) {
  for await (const msg of query({
    prompt: input,
    options: {
      allowedTools: agent.tools,
      outputFormat: { type: "json_schema", schema },
      mcpServers: { playwright: { command: "npx", args: ["@playwright/mcp@latest"] } }
    }
  })) {
    if (msg.type === "result") return schema.parse(msg.structured_output);
  }
}
```

### 3D: MCP tool layer

Expose framework tools as MCP servers:
- Selector catalog lookup
- Queue state management
- Test execution + results
- Agent metrics/performance

**Deliverable**: `src/orchestration/` module with SDK integration, schemas, MCP servers.

---

## Phase 4: SaaS Web App (Long-term project)

**Prerequisite**: Product design spec (not yet created). Phase 4 is a directional marker, not an actionable plan. A separate product design document covering architecture, data model, security model, and cost breakdown must be created before execution begins.

**Goal**: External users trigger pipelines from a web app, connect Jira, see results.

### Architecture

```
[Next.js Web App]
  → [API Routes]
    → [Pipeline Orchestrator (Phase 3 SDK code)]
      → [Sandboxed Agent Containers (E2B/Modal)]
        → [Agent execution with MCP tools]
  → [Postgres DB (pipeline state, users, results)]
  → [S3 (generated artifacts, reports)]
```

### Key components

1. **Auth**: User login (SSO/OAuth)
2. **Jira Integration**: Connect Jira project → pull ticket requirements
3. **Pipeline Trigger**: "Run pipeline for JIRA-123" → creates job
4. **Live Dashboard**: Show pipeline stage progress, agent activity, ETA
5. **Results View**: Generated specs, test plans, audit reports, download artifacts
6. **Admin**: Agent prompt management, model selection, cost tracking

### IP Protection

- Agent prompts = server-side code (never sent to browser)
- Pipeline logic = server-side
- Structured schemas = server-side
- MCP server definitions = server-side in containers
- Anthropic API key = server-side env var
- Users interact with YOUR web app, never with Anthropic directly
- Container isolation prevents cross-tenant data access

### Cost model

- Container: ~$0.05/hr per agent run
- Tokens: ~$0.50-$5.00 per full 5-agent pipeline (Sonnet pricing)
- Charge: per-pipeline-run or monthly subscription

**Deliverable**: Separate project/repo for the web app. Encore framework stays as the engine.

---

## Execution Order

| Phase | Sessions | Depends on | What you get |
|---|---|---|---|
| Phase 1 | 1 | PLAN_15 done | Auto-invoke toggle: agents chain in VS Code (toggle ON = auto-chain, OFF = manual) |
| Phase 2 | 2-3 | Phase 1 | `npm run pipeline:run` — full automated pipeline |
| Phase 3 | 5-8 | Phase 2 | Headless SDK pipeline, no VS Code needed |
| Phase 4 | 15-25+ | Phase 3 | SaaS web app with Jira + dashboard |

---

## What NOT to Do

- Do NOT try to build the SaaS app before the pipeline orchestrator works (Phase 2 before Phase 4)
- Do NOT try to replace VS Code agents with SDK agents immediately — port incrementally
- Do NOT expose agent prompts in any client-side code
- Do NOT bypass existing pre-run/post-complete gates — the orchestrator USES them, doesn't replace them
- Do NOT create recursive agent invocations (SDK limitation: one level of subagents only)
