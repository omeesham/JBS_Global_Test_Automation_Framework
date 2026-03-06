# Plan 09: Scrub Stale References in Active Code

**Status**: PENDING
**Priority**: P0 — active validation scripts reference eliminated rules/sections
**Estimated Scope**: ~23 comment/reference edits + 3 gate logic migrations across 10 files. One agent session.
**Trigger**: Independent RCA (2026-03-04) found R24/R25/R27/R28/R29, §9B/§16, and agent-learnings.md references surviving in code that agents and validation gates actually execute.

---

## Why This Matters

Validation scripts (`generator-post-complete.ts`, `generator-pre-run.ts`) still reference R24, R25, R27, R28, R29 — rules that were consolidated into ALL-003, ALL-004, ALL-005, §8, §12 etc. during the 2026-03 overhaul. If these scripts evolve or agents read their comments for guidance, they'll follow dead references.

Agent prompt files still tell Generator/Healer/Audit to APPEND to `agent-learnings.md` — a deprecated stub. Agents following this instruction write to a file nobody reads.

Generator prompt still references `§9B` (eliminated learning protocol) and `§16 Halt-and-Learn` (consolidated into §8 Session Protocol).

---

## Changes

### Group 1A: Validation Script LOGIC Migration (CRITICAL — blocks pipeline if not done)

**Problem**: `generator-post-complete.ts` Gates 19/20 and the R24 enforcement block contain **executable logic** that reads `agent-learnings.md` for `LRN-` entries. Since `agent-learnings.md` is an empty stub (all learnings merged into `agent-mistakes.md` Resolution column), these gates HARD FAIL on every generator retry session (runCount ≥ 2).

**File: `scripts/generator-post-complete.ts`** — LOGIC changes (not just comments)

| Lines | Function | Problem | Fix |
|-------|----------|---------|-----|
| ~126-138 | R24 enforcement block | Reads `SHARED_PATHS.learnings` (= empty stub) for Generator LRN entries. Always finds zero → pushes error | Migrate: check `agent-mistakes.md` for today's Generator entries in Resolution column, OR check activity log for `learning-captured` actions, OR delete this block (learning is now enforced by §8 Session Protocol at the agent level, not by post-complete gate) |
| ~468-507 | `validateLearningYield()` (Gate 19) | Reads `agent-learnings.md` for today's `LRN-` entries. Empty stub → always 0 → HARD FAIL | Same migration options as above |
| ~510-550+ | `validateLearningQuality()` (Gate 20) | Reads `agent-learnings.md` for quality validation. Dead logic since nothing writes LRN entries there anymore | Delete gate or migrate to read from `agent-mistakes.md` Resolution column |

**Migration strategy: Option B** — Rewrite gates to check `agent-mistakes.md` for new Resolution column entries by Generator. This is the most accurate because the Resolution column is WHERE learning now lives after the overhaul. Activity log (Option A) is indirect — it logs that a step ran, not that learning was captured. Deleting gates (Option C) loses automated enforcement.

Update `scripts/shared-types.ts` line ~192 (`SHARED_PATHS.learnings`) to point to `agent-mistakes.md` since that's the new learning target.

**Implementation notes for Option B**:
- Gates 19/20 should read `agent-mistakes.md`, parse the Resolution column for entries authored by Generator in the current session
- Gate 19 (yield): at least 1 Resolution entry exists for today's session
- Gate 20 (quality): Resolution entries are non-empty and reference specific artifacts (not generic "fixed it" text)

### Group 1B: Validation Script COMMENT Updates (CRITICAL)

**File: `scripts/generator-post-complete.ts`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~15 | `R28 evidence checklist validation` | `§12 RCA evidence checklist validation` |
| ~24 | `R27 R29 learning capture` | `ALL-003/ALL-004 learning capture` |
| ~26 | `§9C/§17` | `§8 Session Protocol` |
| ~126 | `R24` reference (if block kept) | `ALL-003` |
| ~134 | `R27` reference (if block kept) | `ALL-004` |
| ~137 | `R24` reference (if block kept) | `ALL-003` |
| ~644 | `R24 enforcement` | `ALL-003 enforcement` |

**File: `scripts/generator-pre-run.ts`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~56 | `R24/R29 compliance` | `ALL-003/ALL-004 compliance` |
| ~237 | `R25 consumption check` | `§8 Context Self-Load check` |
| ~265-266 | `R24/S9A` | `ALL-003/§8` |
| ~409 | `R24` | `ALL-003` |

**File: `scripts/planner-post-complete.ts`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~229 | `R27 Mid-work capture check` | `ALL-004 Mid-work capture check` |

**File: `scripts/shared-types.ts`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~138 | `R25 Context Self-Load` | `§8 Context Self-Load` |

**File: `scripts/validation-gates.ts`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~95 | `R27 requires logging discoveries mid-session` | `ALL-004 requires logging discoveries mid-session` |

### Group 2: Agent Prompt Files (HIGH)

**File: `.github/agents/playwright-test-generator.agent.md`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~122 | `Learning checkpoint (§9B): Review Phase 3 results... HALT, log learning (§16 Halt-and-Learn)` | `Learning checkpoint (§8): Review Phase 3 results... log learning in agent-mistakes.md Resolution column` |
| ~127 | `did this iteration teach me something not already in agent-learnings.md? If yes → Halt-and-Learn (§16)` | `did this iteration teach me something new? If yes → capture in agent-mistakes.md Resolution column (§8 Session Protocol)` |
| ~148 | any `agent-learnings.md` reference | `agent-mistakes.md Resolution column` |
| ~189 | `agent-learnings.md` in file permissions | `agent-mistakes.md` (APPEND to Resolution column) |

**File: `.github/agents/playwright-test-healer.agent.md`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~205 | `APPEND to specs_planning/agent-learnings.md` | `APPEND to specs_planning/agent-mistakes.md (Resolution column)` |

**File: `.github/agents/playwright-pipeline-audit.agent.md`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~98 | `Read agent-learnings.md` | `Read agent-mistakes.md Resolution column` |
| ~152 | `agent-learnings.md` reference | `agent-mistakes.md Resolution column` |

### Group 2B: Documentation Templates (MEDIUM — agents follow this template)

**File: `docs/read_only_docs/FIX_DIAGNOSIS_TEMPLATE.md`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~52 | `A11 \| agent-learnings.md` | `A11 \| agent-mistakes.md Resolution column` |

### Group 3: Activity Log Header (LOW — historical but misleading)

**File: `specs_planning/agent-activity-log.md`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~4-7 | Legend referencing `R23`, `R24`, `R25`, `R26`, `R30` | Update legend to reference consolidated rule IDs (ALL-003, ALL-004, ALL-005, §8, §12) |

Note: Historical entries (past dates) should NOT be modified — they're accurate records of what happened under the old system. Only update the header/legend.

---

## Execution Steps

1. **Group 1A FIRST** — Migrate Gates 19/20 logic in `generator-post-complete.ts` using Option B (read agent-mistakes.md Resolution column). Also update `shared-types.ts` SHARED_PATHS.learnings to point to agent-mistakes.md
2. Open each remaining file listed above (Groups 1B, 2, 2B, 3)
3. For each edit: search for the exact current text, replace with the new text
4. Group 1B/2/2B/3 are comment/reference updates only — no behavioral changes
5. After all edits: `npm run validate:sync` to confirm no drift introduced
5b. Run `npx tsc --noEmit` to verify Gate logic changes compile
6. After validate: `grep -rn "R23\|R24\|R25\|R26\|R27\|R28\|R29\|R30" scripts/ .github/agents/` — should return zero hits (excluding plan files)
7. Also: `grep -rn "§9B\|§16\|§17\|agent-learnings.md" .github/agents/ scripts/ docs/read_only_docs/` — should return zero hits (except the NOTE in AGENT_SHARED_RULES.md line 379 which is intentional)

---

## What NOT to Do

- EXCEPTION: Group 1A requires logic changes to Gates 19/20 — these are the ONLY behavioral changes in this plan
- For Groups 1B/2/2B/3: do NOT change any validation logic or gate behavior — only update reference comments
- Do NOT modify historical activity log entries — only the header legend
- Do NOT touch plan files in `plans/` — those are historical records
- Do NOT modify `AGENT_SHARED_RULES.md` lines 2, 143 — those are "replaces former" explanatory notes, not stale references
