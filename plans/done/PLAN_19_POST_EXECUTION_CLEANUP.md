# PLAN_19: Post-Execution Cleanup

**Created**: 2026-03-06
**Author**: Claude Code (cross-audit of all PLAN_09–18 execution)
**Priority**: P0 — multiple CRITICAL bugs blocking pipeline functionality
**Estimated operations**: 34 (14 git ops + 12 file edits + 8 line-level fixes)

---

## Context

After Plans 09–18 were executed (Copilot executed 09/10/14/15/16/17, Claude Code executed 18), a full-codebase audit found:
- **4 AD ghost states** (files staged at old path, deleted from working tree, new location untracked)
- **5 CRITICAL broken paths** in `.claude/settings.local.json` (permission allow-list points to pre-move paths)
- **28 untracked files** (new scripts, moved plans, agent file, config)
- **3 CRITICAL runtime bugs** in `pipeline-orchestrator.ts` (wrong script name mapping)
- **1 CRITICAL permission conflict** in GARDENER agent (claims RW on human-controlled file)
- **2 semantic bugs** in gate scripts (hardcoded zero defects, narrow env check)
- **5 stale doc references** to deleted/moved files

All findings verified against the codebase with exact line numbers.

---

## Part A: Fix Git AD Ghost States

**Why**: 4 files show `AD` status (Added in index, Deleted in working tree). VS Code shows them red. `git clone` would create empty-then-deleted files.

### A1: Remove ghost staging for moved plans
```bash
git rm --cached plans/pending/PLAN_14_REPO_CLEANSING.md
git rm --cached plans/pending/PLAN_15_FRAMEWORK_MAINTAINER_AGENT.md
git rm --cached plans/pending/PLAN_16_AGENT_ORCHESTRATION.md
```
These files were moved to `plans/done/` by Copilot during execution, but the old `plans/pending/` staging was never removed.

### A2: Remove ghost staging for deleted selector
```bash
git rm --cached src/selectors/locations/local-office-settings.ts
```
This file was staged during the setup→locations rename (PLAN_14), then deleted by PLAN_18 cleanup. The staging at the new path was never cleared.

### A3: Track moved plans at new location
```bash
git add plans/done/PLAN_14_REPO_CLEANSING.md
git add plans/done/PLAN_15_FRAMEWORK_MAINTAINER_AGENT.md
git add plans/done/PLAN_16_AGENT_ORCHESTRATION.md
```

### A4: Track moved schema file
```bash
git add specs_planning/_internal/agent-queue.schema.json
```
PLAN_18 used `Move-Item` (filesystem move) but never ran `git add` on the new path. Old path shows ` D` (unstaged delete), new path shows `??` (untracked).

### Verification
After A1-A4: `git status --short | grep "^AD"` should return 0 lines.

---

## Part B: Fix `.claude/settings.local.json` — 5 CRITICAL Path Fixes

**Why**: These are Claude Code permission allow-list entries. The `test -f` and `git checkout` commands reference files at pre-move paths. They will fail silently or deny legitimate tool usage.

**File**: `.claude/settings.local.json`

| Line | Current (BROKEN) | Fix |
|------|------------------|-----|
| 24 | `Bash(git checkout HEAD -- specs_planning/agent-mistakes.md)` | `Bash(git checkout HEAD -- specs_planning/_internal/agent-mistakes.md)` |
| 34 | `specs_planning/agent-queue.schema.json` (inside Python command) | `specs_planning/_internal/agent-queue.schema.json` |
| 43 | `Bash(test -f specs_planning/agent-metrics-report.md)` | `Bash(test -f specs_planning/_internal/agent-metrics-report.md)` |
| 44 | `Bash(test -f specs_planning/test-id-registry.json)` | `Bash(test -f specs_planning/_internal/test-id-registry.json)` |
| 45 | `Bash(test -f specs_planning/agent-queue.schema.json)` | `Bash(test -f specs_planning/_internal/agent-queue.schema.json)` |

Also remove lines 43-45 entirely — they are duplicates of lines 40-42 which already have the correct `_internal/` paths.

---

## Part C: Git Track All Untracked Files

**Why**: 20+ files created by Plans 15/16/17/18 are untracked. They will be lost on `git clone`.

### C1: Track PLAN outputs
```bash
git add .github/agents/playwright-framework-maintainer.agent.md
git add config/pipeline-config.json
git add plans/pending/PLAN_18_FRAMEWORK_CLEANUP.md
```

### C2: Track new gate scripts (PLAN_16)
```bash
git add scripts/audit-post-complete.ts
git add scripts/audit-pre-run.ts
git add scripts/healer-post-complete.ts
git add scripts/healer-pre-run.ts
git add scripts/pipeline-orchestrator.ts
git add scripts/requirements-post-complete.ts
git add scripts/requirements-pre-run.ts
```

### C3: Track _internal/ files (PLAN_17)
```bash
git add specs_planning/_internal/agent-escalations.json
git add specs_planning/_internal/agent-performance.json
```
Note: `agent-queue.schema.json` already handled in Part A4.

### C4: Track test artifacts
```bash
git add tests/examples/session-reuse-pattern.spec.ts
git add tests/test-data/common.data.ts
git add specs_planning/test-cases/locations/locations_local_office_settings_test_cases.md
git add specs_planning/test-plans/locations/locations_local_office_settings_test_plan.md
```

### C5: Track audit archives
```bash
git add specs_planning/audits/archive/
```

### Verification
After C1-C5: `git status --short | grep "^??"` should return 0 lines.

---

## Part D: Fix Pipeline Orchestrator — 3 CRITICAL Runtime Bugs

**File**: `scripts/pipeline-orchestrator.ts`

### D1: Fix script name mapping (lines 400, 430)

**Bug**: The ternary constructs wrong script names for `generation` and `healing` stages.
- `generation` → `generation-pre-run` (WRONG, actual file: `generator-pre-run.ts`)
- `healing` → `healing-pre-run` (WRONG, actual file: `healer-pre-run.ts`)

**Current code (line 400)**:
```typescript
const preRunScript = `${stage === 'requirements' ? 'requirements' : stage === 'planning' ? 'planner' : stage}-pre-run`;
```

**Fix — replace with a clean lookup map**:
```typescript
const SCRIPT_PREFIX: Record<string, string> = {
  requirements: 'requirements',
  planning: 'planner',
  generation: 'generator',
  healing: 'healer',
  audit: 'audit',
};
const preRunScript = `${SCRIPT_PREFIX[stage] || stage}-pre-run`;
```

**Same fix for line 430** (post-complete):
```typescript
const postCompleteScript = `${SCRIPT_PREFIX[stage] || stage}-post-complete`;
```

### D2: Fix config/code stage name mismatch (line 295 + `config/pipeline-config.json` line 4)

**Bug**: `pipeline-config.json` uses `"planner"` in the loop array, but `QUEUE_TO_PIPELINE` (line 61-65) maps queue stages to `"planning"`. When `fullSequence.indexOf(currentPipelineStage)` runs at line 295, `"planning"` is NOT found in `["requirements", "planner", "generator"]`, causing the orchestrator to skip the main loop and fall through to conditional agent handling.

**Fix**: Change `config/pipeline-config.json` line 4:
```json
"loop": ["requirements", "planning", "generation"],
```
This aligns with the `STAGE_MAP` keys at lines 43-49, which use `planning` and `generation`.

Also update `conditionalAgents` keys to match:
```json
"conditionalAgents": {
  "healing": "on-generation-fail",
  "audit": "on-generation-pass"
}
```
(No change needed — these already use stage names that match `STAGE_MAP`.)

### D3: Handle missing `planner-pre-run.ts`

**Bug**: The orchestrator constructs `planner-pre-run` for the planning stage (via D1's SCRIPT_PREFIX map), but `scripts/planner-pre-run.ts` does not exist. The orchestrator will crash with ENOENT.

**Fix options** (choose one):
- **Option A (recommended)**: Create a minimal `scripts/planner-pre-run.ts` following the pattern of `requirements-pre-run.ts`. It should: parse CLI arg for item ID, verify queue file exists, verify item is at `planning` stage, check REQUIREMENTS.md exists for the item, run `npx tsc --noEmit`, exit 0 on pass.
- **Option B**: Add a guard in the orchestrator to skip the pre-run gate if the script file doesn't exist (with a warning log). This is less safe.

### Verification
After D1-D3: `npx tsc --noEmit` must pass. Manually trace each stage through the script name lookup to confirm correct file names are produced.

---

## Part E: Fix GARDENER Agent — 2 Issues

**File**: `.github/agents/playwright-framework-maintainer.agent.md`

### E1: Remove `package.json` from READ-WRITE (line 71) — CRITICAL

**Bug**: Line 71 lists `package.json` in READ-WRITE, but `AGENT_SHARED_RULES.md` §2 explicitly designates `package.json` as **"Human-Controlled (NEVER modify)"**. This is a direct conflict — the agent could modify npm scripts or dependencies believing it has permission.

**Current (line 71)**:
```
- **READ-WRITE**: `src/pages/`, `src/common/base-page.ts`, `tests/`, `package.json`, `specs_planning/_internal/agent-mistakes.md`
```

**Fix**:
```
- **READ-WRITE**: `src/pages/`, `src/common/base-page.ts`, `tests/`
- **APPEND-ONLY**: `specs_planning/_internal/agent-mistakes.md` (MNT- prefix only)
- **READ-ONLY**: everything else (selectors, scripts, agent prompts, package.json)
```

This also fixes the secondary issue: `agent-mistakes.md` was listed as READ-WRITE but shared rules say APPEND only.

### E2: Fix stale MNT-002 Resolution (line 27)

**Bug**: Resolution says `LocationPricingPage missing from barrel`. But `src/pages/index.ts` line 20 exports `LocationPricingPage`. The Resolution is wrong.

**Current (line 27)**:
```
| MNT-002 | Barrel export completeness: every `*.page.ts` must be in `src/pages/index.ts`. Every selector partit... | LocationPricingPage missing from barrel |
```

**Fix — replace the Resolution with a current example**:
```
| MNT-002 | Barrel export completeness: every `*.page.ts` must be in `src/pages/index.ts`. Every selector partition must be in `src/selectors/index.ts` | `location-form-helpers.page.ts` and `location-test-orchestrators.page.ts` are intentionally excluded (internal helpers); verify any other missing export is intentional |
```

---

## Part F: Fix Stale Documentation References

### F1: ARCHITECTURE.md line 142

**Current**:
```
Encrypted vault at `src/security/vault.ts` (AES-256-GCM). Re-export at `config/secrets/vault.ts` for backward compatibility with `scripts/vault-manager.ts`.
```

**Fix**:
```
Encrypted vault at `src/security/vault.ts` (AES-256-GCM). Re-export at `config/secrets/vault.ts` for backward compatibility.
```

(`scripts/vault-manager.ts` was deleted in PLAN_18.)

### F2: `specs_planning/_internal/agent-learnings.md` line 4

**Current**:
```
     One registry, one lookup: see specs_planning/agent-mistakes.md.
```

**Fix**:
```
     One registry, one lookup: see specs_planning/_internal/agent-mistakes.md.
```

### F3: `plans/pending/PLAN_12_RCA_REPORT.md` line 66

**Current**:
```
   - `specs_planning/agent-mistakes.md` (current rule state for verification)
```

**Fix**:
```
   - `specs_planning/_internal/agent-mistakes.md` (current rule state for verification)
```

### F4: `specs_planning/_internal/agent-queue.json` line 1892 — stale note

**Current**: Note field references `src/selectors/setup/local-office-settings.ts (14 keys)`

**Fix**: Update to `Selectors file deleted — rebuild when page object is created`

This is a queue item metadata note, not a code reference, so it's cosmetic but prevents future agents from looking for a file that doesn't exist.

---

## Part G: Fix Gate Script Semantic Issues

### G1: `scripts/audit-post-complete.ts` — hardcoded `defectsFound: 0`

**Bug**: Line ~132 hardcodes `defectsFound: 0` in the completion context. The Audit agent's purpose is to find defects. This should be computed.

**Fix**: Before line 132, scan the audit output file for defect markers (e.g., count lines matching `CRITICAL|HIGH|MEDIUM|DEFECT|BUG`), then use that count instead of 0.

```typescript
// Replace hardcoded: defectsFound: 0
// With:
const auditFile = /* find audit file for this item */;
let defectsFound = 0;
if (auditFile && fs.existsSync(auditFile)) {
  const content = fs.readFileSync(auditFile, 'utf-8');
  defectsFound = (content.match(/CRITICAL|HIGH|DEFECT|BUG/gi) || []).length;
}
// ... use defectsFound in completionContext
```

### G2: `scripts/requirements-pre-run.ts` — narrow env file check

**Bug**: Lines 61-75 hardcode 3 specific env file paths (`.env`, `.env.staging`, `.env.production`) but the primary dev file is `.env.development` which is not checked. The `generator-pre-run.ts` uses `fs.readdirSync(envDir).filter(f => f.startsWith('.env'))` which is the correct pattern.

**Fix**: Replace the hardcoded list with dynamic scanning matching `generator-pre-run.ts` pattern:
```typescript
const envDir = path.join(__dirname, '../config/environments');
const envFiles = fs.readdirSync(envDir).filter(f => f.startsWith('.env'));
const hasBaseUrl = envFiles.some(f => {
  const content = fs.readFileSync(path.join(envDir, f), 'utf-8');
  return content.includes('BASE_URL');
});
```

---

## Part H: Fix Planner Agent Permissions Shorthand

**File**: `.github/agents/playwright-test-planner.agent.md` line 211

**Bug**: Uses shorthand `agent-queue.json: RW | agent-mistakes.md: APPEND` without `specs_planning/_internal/` prefix. All other 4 agent files use full paths.

**Fix**: Replace with:
```
specs_planning/_internal/agent-queue.json: RW | specs_planning/_internal/agent-mistakes.md: APPEND (PLN- prefix only)
```

---

## Part I: Update INDEX.md + Move PLAN_18 to Done

### I1: Add PLAN_18 and PLAN_19 to INDEX.md

Add to Execution Queue:
```markdown
| 7 | 18 | [PLAN_18](done/PLAN_18_FRAMEWORK_CLEANUP.md) | Framework cleanup: delete 5 dead files, strip 93 orphaned selectors, move 3 files to _internal/, fix git ghosts | **P0** | DONE 2026-03-06 |
| 8 | 19 | [PLAN_19](pending/PLAN_19_POST_EXECUTION_CLEANUP.md) | Post-execution cleanup: fix 4 AD ghosts, 5 settings.json paths, 3 orchestrator bugs, GARDENER permissions, 28 untracked files | **P0** | PENDING |
```

### I2: Move PLAN_18 to done/
```bash
git mv plans/pending/PLAN_18_FRAMEWORK_CLEANUP.md plans/done/PLAN_18_FRAMEWORK_CLEANUP.md
```
(PLAN_18's work is already executed — the plan in pending/ is stale.)

### I3: Update `pending/` count in Folder Structure section
Line 72: Change `pending/              ← active plans (6 files)` to `pending/              ← active plans (3 files)`
(Remaining pending: PLAN_12, PLAN_18→moved to done, PLAN_19)

### I4: Add Session Log entry
```markdown
| 2026-03-06 | PLAN_18 executed by Claude Code (5 file deletions, 93 selector strips, 3 file moves, 14 script edits, git ghost fixes). PLAN_19 created: post-execution cleanup for AD ghosts, settings.json paths, orchestrator bugs, GARDENER permissions, untracked files |
```

---

## Execution Checklist

| Part | Operations | Estimated Lines Changed |
|------|-----------|------------------------|
| A | 4 `git rm --cached` + 4 `git add` | 0 (git only) |
| B | 5 path fixes in settings.local.json + remove 3 duplicate lines | ~8 |
| C | 14 `git add` commands | 0 (git only) |
| D | 2 file edits (orchestrator + pipeline-config) + 1 new file | ~40 |
| E | 2 edits to GARDENER agent | ~6 |
| F | 4 doc edits | ~4 |
| G | 2 script edits | ~15 |
| H | 1 edit to planner agent | ~1 |
| I | INDEX.md update + git mv | ~10 |
| **Total** | **34 operations** | **~84 lines** |

---

## Verification Gates

After all parts complete:
1. `git status --short | grep "^AD"` → **0 lines** (no ghosts)
2. `git status --short | grep "^??"` → **0 lines** (nothing untracked)
3. `npx tsc --noEmit` → **0 errors**
4. `npm run validate:sync` → **PASS**
5. Grep for `specs_planning/agent-metrics-report[^/]` in `.claude/` → **0 hits**
6. Grep for `specs_planning/agent-queue.schema[^/]` in `.claude/` → **0 hits**
7. Grep for `vault-manager` in `docs/` → **0 hits**
8. Manual trace: orchestrator `SCRIPT_PREFIX['generation']` → `'generator'` → `generator-pre-run.ts` → **file exists** ✓
9. Manual trace: orchestrator `SCRIPT_PREFIX['healing']` → `'healer'` → `healer-pre-run.ts` → **file exists** ✓
10. `config/pipeline-config.json` loop contains `"planning"` (not `"planner"`) and `"generation"` (not `"generator"`) → matches `STAGE_MAP` keys ✓
