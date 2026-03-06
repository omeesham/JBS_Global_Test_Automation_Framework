# Plan 17: Agent Autonomy Foundation — Self-Audit, Communication, Cross-Agent Intelligence

**Status**: PENDING
**Priority**: P0 — agents blindly trust prior work, no cross-agent issue routing, internal files clutter specs_planning root
**Scope**: One focused session. ~45 edits across 15 files + 1 new file.
**Prerequisite**: PLAN_14 done (both plans touch AGENT_SHARED_RULES.md and agent files — PLAN_14 updates code paths, PLAN_17 updates agent communication paths. Execute sequentially to avoid merge conflicts.)
**Blocks**: PLAN_15 (new Maintainer agent should inherit these rules), PLAN_16 (orchestration builds on escalation infrastructure)

---

## Why This Matters

1. **Blind trust chain**: Generator trusts Planner's TCs without verification. If Planner got a field wrong, Generator propagates the error. No agent checks prior work.
2. **No mid-work audit**: Agents only self-audit at the end. Intent drift goes undetected for the entire session.
3. **No cross-agent issue routing**: Audit finds Planner bugs but Planner never learns automatically — findings sit in markdown reports nobody reads.
4. **File clutter**: `agent-queue.json`, `agent-mistakes.md`, etc. sit at `specs_planning/` root alongside user-facing test cases/plans. Internal files should be in `_internal/`.
5. **Growing files**: Audit reports, performance defects accumulate without cleanup.

---

## Part A: Move Agent Internal Files to `_internal/`

### A1: Move 5 files (git mv for tracked, regular mv for untracked)

```bash
git mv specs_planning/agent-queue.json specs_planning/_internal/agent-queue.json
git mv specs_planning/agent-activity-log.md specs_planning/_internal/agent-activity-log.md
git mv specs_planning/agent-mistakes.md specs_planning/_internal/agent-mistakes.md
git mv specs_planning/agent-performance.json specs_planning/_internal/agent-performance.json
git mv specs_planning/agent-learnings.md specs_planning/_internal/agent-learnings.md
```

### A2: Update `SHARED_PATHS` in `scripts/shared-types.ts` (lines ~189-199)

Change all 5 paths:

| Path Key | Old | New |
|----------|-----|-----|
| `queue` | `'../specs_planning/agent-queue.json'` | `'../specs_planning/_internal/agent-queue.json'` |
| `mistakes` | `'../specs_planning/agent-mistakes.md'` | `'../specs_planning/_internal/agent-mistakes.md'` |
| `learnings` | `'../specs_planning/agent-learnings.md'` | `'../specs_planning/_internal/agent-learnings.md'` |
| `activityLog` | `'../specs_planning/agent-activity-log.md'` | `'../specs_planning/_internal/agent-activity-log.md'` |
| `performance` | `'../specs_planning/agent-performance.json'` | `'../specs_planning/_internal/agent-performance.json'` |

Add new path:
```typescript
escalations: path.join(__dirname, '../specs_planning/_internal/agent-escalations.json'),
```

**All scripts that import `SHARED_PATHS` auto-resolve** — no per-script path edits needed for: `task-context-builder.ts`, `generator-pre-run.ts`, `generator-post-complete.ts`, `agent-metrics.ts`, `validate-agent-sync.ts`, `cleanup-logs.ts`, `capture-mistake.ts`, `audit-block.ts`.

### A3: Update hardcoded path references (NOT via SHARED_PATHS)

**How to find them**: `grep -rn "specs_planning/agent-" docs/ .github/ config/ scripts/` — look for any string that still says `specs_planning/agent-` without going through `_internal/`.

**Known files with hardcoded refs**:

**`docs/read_only_docs/AGENT_SHARED_RULES.md`** — update these references:
- §2 File Ownership table: `specs_planning/agent-queue.json` → `specs_planning/_internal/agent-queue.json` (and same for agent-mistakes.md, agent-activity-log.md)
- §7: `specs_planning/agent-performance.json` → `specs_planning/_internal/agent-performance.json`
- §8 Step 6: `agent-mistakes.md` → reference stays short (agents know where it is), but if full path shown, update
- §14 Self-Unblocking Map: `specs_planning/agent-queue.json` → `specs_planning/_internal/agent-queue.json`, `specs_planning/agent-activity-log.md` → `specs_planning/_internal/agent-activity-log.md`, `specs_planning/agent-mistakes.md` → `specs_planning/_internal/agent-mistakes.md`

**`.github/agents/*.agent.md`** (all 5 agent files) — update file permission sections and workflow step references:
- Any line containing `specs_planning/agent-queue.json` → `specs_planning/_internal/agent-queue.json`
- Any line containing `specs_planning/agent-mistakes.md` → `specs_planning/_internal/agent-mistakes.md`
- Any line containing `specs_planning/agent-activity-log.md` → `specs_planning/_internal/agent-activity-log.md`
- Any line containing `specs_planning/agent-performance.json` → `specs_planning/_internal/agent-performance.json`
- Any line containing `specs_planning/agent-learnings.md` → `specs_planning/_internal/agent-learnings.md`

**`.github/copilot-instructions.md`** — same pattern, update all `specs_planning/agent-*` refs.

**`config/context-builder-prompts.json`** — check for any path references and update.

**`scripts/sync-agent-mistakes.ts`** — if it has hardcoded path to agent-mistakes.md that's not via SHARED_PATHS, update it. (Check: it may already use SHARED_PATHS.)

**Verification (MANDATORY — do not skip)**:

After all Part A edits, run this grep to catch any missed old-path references:
```bash
grep -rn "specs_planning/agent-" docs/ .github/ config/ scripts/ src/ | grep -v "_internal/" | grep -v "node_modules"
```
**Expected result: 0 matches.** Any match = a missed reference that will cause silent pipeline failure (scripts reading from old paths get empty results → agents operate without context).

The ONLY acceptable hits are strings containing `specs_planning/_internal/agent-` — bare `specs_planning/agent-` without `_internal` is a miss that MUST be fixed before proceeding to Part B.

---

## Part B: New Rules — Self-Audit & Anti-Blind-Following

### B1: Add 4 new rules to `specs_planning/_internal/agent-mistakes.md` under `## Shared`

Add at the end of the Shared table (after the last ALL-0NN rule):

```markdown
| ALL-028 | Before acting on another agent's output, run Inheritance Verification: (1) Read artifact fully (2) Spot-check 3 claims against source files or live DOM (3) If any claim is false, fix or escalate — never propagate errors | Blind trust chain: Generator trusts wrong Planner TC → spec tests wrong thing → Healer can't fix root cause |
| ALL-029 | Mid-phase checkpoint: After each major work phase, pause and verify — does my output match user's original intent? Am I solving the right problem? Log `mid-check` in activity log | Intent drift compounds across phases — agent explores correctly but documents the wrong thing |
| ALL-030 | Self-audit must be CRITICAL not confirmatory. Ask "what did I get WRONG?" If zero issues found on non-trivial work (3+ steps), justify why — zero issues is suspicious and must be explained | Agents rubber-stamp own work — self-audit becomes a checkbox exercise |
| ALL-031 | When another agent's output is confirmed wrong vs live DOM (not a temp bug): (1) Verify via MCP (2) Create escalation in `specs_planning/_internal/agent-escalations.json` (3) Continue your work with corrected understanding | Cross-agent quality: Generator finds Planner TC wrong but Planner never learns |
```

Then run: `npm run sync:mistakes && npm run validate:sync` — must exit 0.

### B2: Update `AGENT_SHARED_RULES.md` — §8 Session Protocol

**In START section** (after line with "Pre-flight (§13)" step 2, before "Log start" step 3), add:

```markdown
2b. **Inheritance Verification (ALL-028)**: If this task builds on another agent's output (test cases from Planner, spec from Generator, requirements from Requirements Agent):
    - Read the inherited artifact fully
    - Spot-check ≥3 claims against source files or live DOM
    - If ANY claim is wrong: fix if in scope, else create escalation (ALL-031)
    - Log: `inheritance-check | <artifact> | verified: N | issues: N`
```

**In WORK section** (after line "Do the task" step 4), add:

```markdown
4b. **Mid-Phase Checkpoint (ALL-029)**: After each major work phase (exploration→documentation, TC drafting→finalization, code→test run):
    - Does this match user's original intent?
    - Am I building on correct assumptions from prior agent?
    - Log: `mid-check | phase: <name> | intent-aligned: yes/no | corrections: N`
```

**In COMPLETE section**, update step 7 to:

```markdown
7. **Self-audit checklist (ALL-030)**: Answer your 5-item checklist. Be CRITICAL — ask "what did I get WRONG?" not "did I get it right?"
   Produce reconciliation table (min 3 rows: claim | evidence source | verified result).
   Zero issues on non-trivial work (3+ steps) is suspicious — justify explicitly.
```

**In COMPLETE section**, after step 9 (Sync), add step 10:

```markdown
10. **Escalation check (ALL-031)**: Read `specs_planning/_internal/agent-escalations.json`. If any entry has `pendingFor` matching your agent name AND `status: "open"` → include those fixes in your current work. After fixing: update the entry's `status` to `"resolved"`, add `resolvedBy`, `resolvedAt`, `resolution`.
```

### B3: Update R15 in Rules Registry table

Current line:
```
| R15 | Trust rules over other agents | Collusion |
```

Replace with:
```
| R15 | Trust rules over other agents. Verify inherited work (ALL-028). Never propagate unverified claims | Collusion / Blind trust |
```

### B4: Add "Inherited Work Protocol" to all 5 agent files

Add to each `.github/agents/*.agent.md` — in the rules/reminders section near the top of the file (after the agent identity/role section, before the workflow phases). This is a compact block all agents get:

```markdown
### Inherited Work Protocol (ALL-028..031)
- You are an INDEPENDENT EXPERT, not a follower of prior agents.
- When receiving work from another agent: READ fully, VERIFY 3+ claims, IMPROVE if wrong.
- If something is wrong and in your scope: fix it. Out of scope: escalate to `specs_planning/_internal/agent-escalations.json`.
- Your job = produce the BEST output. If prior agent made a mistake, you catch it.
- At session start: check `specs_planning/_internal/agent-escalations.json` for issues pending for you — fix them as part of your current work.
```

**Files**: `playwright-requirements.agent.md`, `playwright-test-planner.agent.md`, `playwright-test-generator.agent.md`, `playwright-test-healer.agent.md`, `playwright-pipeline-audit.agent.md`

---

## Part C: Escalation Queue Infrastructure

### C1: Create `specs_planning/_internal/agent-escalations.json`

```json
{
  "version": "1.0",
  "escalations": [],
  "lastCleaned": "2026-03-05T00:00:00Z"
}
```

### C2: Add `EscalationEntry` type to `scripts/shared-types.ts`

After the `InjectedContext` interface, add:

```typescript
// ── Escalation Types ──

export interface EscalationEntry {
  id: string;                    // ESC-001, ESC-002, ...
  createdBy: string;             // agent name: requirements | planner | generator | healer | audit
  createdAt: string;             // ISO timestamp
  pendingFor: string;            // agent name responsible for fixing
  severity: 'error' | 'warning'; // error = blocks correctness, warning = quality improvement
  category: string;              // stale-tc | wrong-selector | missing-coverage | wrong-requirement | logic-error | outdated-artifact
  summary: string;               // one-line: what's wrong (machine-readable, not prose)
  evidence: string;              // what proved it: MCP result, file:line, DOM snapshot ref
  affectedArtifacts: string[];   // file paths that need updating
  status: 'open' | 'resolved' | 'wontfix';
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolution: string | null;     // one-line: what was done to fix it
}

export interface EscalationQueue {
  version: string;
  escalations: EscalationEntry[];
  lastCleaned: string;           // ISO timestamp of last auto-cleanup
}
```

### C3: Add `pendingEscalations` to `InjectedContext` interface in `shared-types.ts`

In the `InjectedContext` interface, add after the `featureTags` field:

```typescript
  // Escalations from other agents pending for this agent
  pendingEscalations?: Array<{
    id: string;
    from: string;
    severity: string;
    summary: string;
    artifacts: string[];
  }>;
```

### C4: Extend `task-context-builder.ts` — inject pending escalations

In `buildSharedAgentContext()` function, after the failure data section (before the `return shared;`), add:

```typescript
  // ── Escalation injection ──
  const escPath = SHARED_PATHS.escalations;
  if (fs.existsSync(escPath)) {
    try {
      const escData: EscalationQueue = JSON.parse(fs.readFileSync(escPath, 'utf-8'));
      const pending = escData.escalations.filter(
        e => e.pendingFor === agentLower && e.status === 'open'
      );
      if (pending.length > 0) {
        (shared as any).pendingEscalations = pending.map(e => ({
          id: e.id, from: e.createdBy, severity: e.severity,
          summary: e.summary, artifacts: e.affectedArtifacts,
        }));
      }
    } catch { /* ignore parse errors */ }
  }
```

Add import at top of file:
```typescript
import { EscalationQueue } from './shared-types';
```

In `buildContextForItem()`, after the `featureTags` assignment, add:

```typescript
  // Inject pending escalations from shared context
  if ((shared as any).pendingEscalations) {
    context.pendingEscalations = (shared as any).pendingEscalations;
  }
```

In `formatContextForDisplay()`, add a section (before the SELF-AUDIT QUESTIONS block):

```typescript
  // Escalations
  const escalations = context.pendingEscalations;
  if (escalations && escalations.length > 0) {
    output += '**[ESC] PENDING ESCALATIONS (fix these FIRST):**\n';
    for (const esc of escalations) {
      output += `- ${esc.id} (from: ${esc.from}, ${esc.severity}): ${esc.summary}\n`;
      output += `  Affected: ${esc.artifacts.join(', ')}\n`;
    }
    output += '\n';
  }
```

### C5: Add escalation reminder to `config/context-builder-prompts.json`

Add to each agent's `criticalReminders` array:

```json
"Check specs_planning/_internal/agent-escalations.json for open issues assigned to you — fix before proceeding with new work"
```

**Agents to update**: Requirements, Planner, Generator, Healer, Audit — all 5 entries.

---

## Part D: Auto-Cleanup

### D1: Escalation cleanup — add to `task-context-builder.ts` main() function

After reading the escalation file for injection (Part C4), add cleanup logic — resolved/wontfix escalations older than 14 days get removed:

```typescript
  // ── Auto-clean resolved escalations (14-day retention) ──
  if (fs.existsSync(SHARED_PATHS.escalations)) {
    try {
      const escData: EscalationQueue = JSON.parse(fs.readFileSync(SHARED_PATHS.escalations, 'utf-8'));
      const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const before = escData.escalations.length;
      escData.escalations = escData.escalations.filter(e => {
        if (e.status === 'open') return true; // never auto-remove open items
        const resolved = e.resolvedAt ? new Date(e.resolvedAt).getTime() : 0;
        return resolved > cutoff;
      });
      escData.lastCleaned = new Date().toISOString();
      if (escData.escalations.length !== before) {
        fs.writeFileSync(SHARED_PATHS.escalations, JSON.stringify(escData, null, 2), 'utf-8');
        console.log(`  Escalation cleanup: ${before - escData.escalations.length} resolved entries removed (14-day retention)`);
      }
    } catch { /* ignore */ }
  }
```

### D2: Audit report archival — extend `scripts/cleanup-logs.ts`

Add a section that moves `specs_planning/audits/*.md` files older than 30 days to `specs_planning/audits/archive/`:

```typescript
// ── Archive old audit reports (30-day retention in active folder) ──
const auditsDir = path.join(__dirname, '../specs_planning/audits');
const archiveDir = path.join(auditsDir, 'archive');
if (fs.existsSync(auditsDir)) {
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(auditsDir).filter(f => f.endsWith('.md') && f !== '.gitkeep');
  for (const file of files) {
    const filePath = path.join(auditsDir, file);
    const stat = fs.statSync(filePath);
    if (stat.mtimeMs < cutoff) {
      fs.renameSync(filePath, path.join(archiveDir, file));
    }
  }
}
```

### D3: Performance defect archival — extend `scripts/agent-metrics.ts`

In the metrics computation, add logic: resolved defects older than 30 days move from `defects[]` to `archivedDefects[]` per agent. This keeps the active performance file compact. Only add this if `agent-metrics.ts` already writes back to performance.json — if it's read-only, skip this and add it as a note for PLAN_16.

**Decision for executor**: Check if `agent-metrics.ts` writes to `agent-performance.json`. If yes → add archival. If no → skip, add TODO comment.

---

## Execution Order

1. **A1**: Move files with `git mv`
2. **A2**: Update `SHARED_PATHS` + add `escalations` path + add escalation types (C2, C3)
3. **C1**: Create `agent-escalations.json`
4. **A3**: Update all hardcoded path refs (AGENT_SHARED_RULES, 5 agent files, copilot-instructions, config)
5. **B1**: Add ALL-028..031 to agent-mistakes.md, run `npm run sync:mistakes && npm run validate:sync`
6. **B2**: Update AGENT_SHARED_RULES.md §8 Session Protocol
7. **B3**: Update R15 in Rules Registry
8. **B4**: Add Inherited Work Protocol to all 5 agent files
9. **C4-C5**: Extend task-context-builder.ts + context-builder-prompts.json
10. **D1-D3**: Add auto-cleanup logic
11. **VERIFY**: Full verification (see below)

---

## Verification Checklist

**Hard gates** (must all pass):
1. `npx tsc --noEmit` — TypeScript compiles with new types
2. `npm run validate:sync` — agent rule sync clean (ALL-028..031 propagated to all agent NEVER DO sections)
3. `npm run build:context` — context builder runs with new paths + escalation injection works
4. `grep -rn "specs_planning/agent-" docs/ .github/ config/ scripts/ src/ | grep -v "_internal/" | grep -v "node_modules"` — returns 0 hits (no stale path references). **This is the critical safety net — if even 1 reference is missed, scripts silently read from empty/missing paths**

**Smoke tests**:
5. Manually add a test escalation to `agent-escalations.json`:
   ```json
   {"id":"ESC-TEST","createdBy":"audit","createdAt":"2026-03-05T00:00:00Z","pendingFor":"planner","severity":"warning","category":"stale-tc","summary":"Test escalation - delete after verification","evidence":"manual test","affectedArtifacts":["test.md"],"status":"open","resolvedBy":null,"resolvedAt":null,"resolution":null}
   ```
   Run `npm run build:context` → verify the Planner's context output shows `[ESC] PENDING ESCALATIONS` section. Then delete the test entry.
6. Verify `specs_planning/_internal/` contains: `agent-queue.json`, `agent-activity-log.md`, `agent-mistakes.md`, `agent-performance.json`, `agent-learnings.md`, `agent-escalations.json`, plus the 3 existing template files.
7. Verify `specs_planning/` root no longer contains any `agent-*` files.

---

## What NOT to Do

- Do NOT modify queue structure (`QueueItem`, `QueueFile`) — escalations are a separate file, not embedded in queue items
- Do NOT change any agent's workflow phases or phase gates — this plan adds checkpoints WITHIN existing phases, not new phases
- Do NOT add auto-invoke or agent chaining — that's PLAN_16
- Do NOT create the Framework Maintainer agent — that's PLAN_15
- Do NOT touch selectors, pages, test-data folder structure — that's PLAN_14
- Do NOT rename any existing rule IDs — only ADD new ALL-028..031
- Do NOT make self-audit checklists longer than 5 items — add the mid-phase and inheritance checks as separate protocol steps (§8), not as checklist items
- Do NOT change the activity log format — agents already log there, just ensure new log entries (`inheritance-check`, `mid-check`) follow existing `| When | Agent | Action | Files | Notes |` format
