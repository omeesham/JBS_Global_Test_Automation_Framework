# SUBPLAN_LCD_05_LEARNING_LANES — Lesson-router + CEO/worker lane split + membrane

**Status**: DONE
**Executed**: 2026-07-16
**Priority**: P0
**Created**: 2026-07-13
**Identity**: OWNER
**Parent**: PLAN_LAZY_CEO_DELEGATOR.md
**Depends on**: SUBPLAN_LCD_01_CONTEXT_SURGERY.md
**Blocks**: SUBPLAN_LCD_06, SUBPLAN_LCD_08
**Runs-after**: LCD_01
**Collides-with**: PLAN_WORKER_SKILL_ROUTING (routing classification)
**Model**: claude-opus-4-6
**PermissionMode**: default
**RiskAcknowledged**: MEDIUM — misclassified lessons land in wrong lane, re-polluting CEO or starving workers

---

## Objective

Today, ONE loop (`/reflect` + `/compile-learnings`) writes every lesson into Claude's pile. After context surgery, lessons must flow to the correct lane to prevent re-pollution. Build: (a) a lesson-router classification, (b) modify `/reflect` + `/compile-learnings` to write the correct lane, (c) the membrane rule (CEO gets verify-pointers for worker-lane lessons it must be able to check, per LR-042).

---

## Preconditions

- LCD_01 landed (worker landing zones exist as destinations)
- `/reflect` skill still at `.claude/skills/reflect/SKILL.md`
- `/compile-learnings` skill still at `.claude/skills/compile-learnings/SKILL.md`
- `dispatcher-lessons.md` still injected by primer (`delegation-primer.mjs:76-80`)

---

## Step-by-Step

### Phase 1 — Define the lesson-router classification

1. Add to `C:\Users\rutvi\.claude\delegation\lesson-router.md` (new file, gitignored):
   ```markdown
   # Lesson Router — Classification Rules
   
   ## WHO made the mistake?
   - Claude (CEO) → CEO-LANE
   - Worker → WORKER-LANE  
   - Ticket was bad (ambiguous/missing DOCTRINE) → CEO-LANE (CEO's ticket-craft failure)
   - System (hook bug/wrapper defect/template gap) → SYSTEM-LANE (framework issue → file as guardrail plan)
   
   ## Classification table
   | Mistake class | Lane | Destination |
   |---|---|---|
   | Failed to delegate | CEO | feedback_*.md → CLAUDE.md/LEARNED_RULES |
   | Bad ticket (ambiguous/missing DOCTRINE) | CEO | dispatcher-lessons.md (verify-pointer only) |
   | Rubber-stamped lying worker | CEO | feedback_*.md |
   | Wrong model routing | CEO | dispatcher-lessons.md |
   | Worker produced wrong code | WORKER | agent .agent.md file § Lessons |
   | Worker skipped a rule | WORKER | agent .agent.md file § Lessons |
   | Worker RCA was wrong | WORKER | agent .agent.md file § Lessons |
   | Hook/gate false-positive | SYSTEM | guardrail plan or LR issue |
   | Template missing field | SYSTEM | LEARNED_RULES.md amendment |
   
   ## Membrane rule (LR-042 compliance)
   Every WORKER-LANE lesson where the CEO must verify spawns a 1-line pointer in CEO lane:
   Format: "VERIFY-POINTER: <what>; worker must: <behavior>; check in: <report field>"
   This is a FILTER — CEO retains verification ability without retaining execution knowledge.
   ```

### Phase 2 — Modify `/reflect` skill

2. In `.claude/skills/reflect/SKILL.md`, modify the mistake-capture step to:
   - After capturing a mistake, apply the lesson-router classification
   - CEO-LANE mistakes → write to `~/.claude/memory/feedback_*.md` (existing behavior)
   - WORKER-LANE mistakes → write to `~/.copilot/agents/<agent-name>.agent.md` § Lessons
   - SYSTEM-LANE mistakes → file as guardrail plan stub in `plans/pending/` (existing behavior per `.claude/skills/reflect/SKILL.md` (guardrail-stub step))
   - For WORKER-LANE: also write a verify-pointer to `dispatcher-lessons.md` (1 line only):
     ```
     VERIFY-POINTER: <rule-name>; worker must: <expected behavior>; check: <Parity Report field>
     ```

3. **BAN full worker technique from `dispatcher-lessons.md`**: Only verify-pointers may cross the membrane. If `/reflect` detects a full technique/implementation lesson destined for dispatcher-lessons, it MUST route to the agent file instead and emit only the verify-pointer. This prevents re-pollution via primer injection (`delegation-primer.mjs:75-95` injects dispatcher-lessons into every session).

### Phase 3 — Modify `/compile-learnings` skill

4. In `.claude/skills/compile-learnings/SKILL.md`, add a worker-lane scan step:
   - **NEW**: After scanning CEO pile (existing), scan `~/.copilot/agents/*.agent.md` § Lessons sections
   - Graduate recurring worker patterns (3+ occurrences) to the worker-primer file in the home delegation dir (the universal worker primer from LCD_01; created on first graduation)
   - Worker-lane lessons NEVER graduate into `CLAUDE.md`, `LEARNED_RULES.md`, or any CEO-loaded file
   - Verify-pointers in `dispatcher-lessons.md` are pruned when the underlying worker lesson graduates (to prevent dispatcher-lessons growth)

### Phase 4 — Size management

5. Add size caps:
   - `dispatcher-lessons.md`: max 30 lines of verify-pointers. When exceeded, oldest pointers are pruned (the underlying worker lesson remains in the agent file).
   - Per-agent `*.agent.md` § Lessons: max 20 entries. When exceeded, `/compile-learnings` graduates the most common to `worker-primer.md` and prunes the agent file.
   - `worker-primer.md`: max 80 lines total. Overflow triggers a trim pass (archive to a worker-primer-archive file in the same dir, created on first overflow).

### Phase 5 — Verification

6. Create a test scenario: simulate a "worker skipped LR-036" mistake → confirm it routes to:
   - `generator.agent.md` § Lessons (full technique)
   - `dispatcher-lessons.md` (verify-pointer only, ≤1 line)
   - NOT to `feedback_*.md` or `CLAUDE.md`
7. Create a test scenario: simulate a "Claude failed to delegate verification" → confirm it routes to `feedback_*.md` (CEO lane)
8. Verify `dispatcher-lessons.md` does NOT contain full technique/implementation details (only verify-pointers)
9. Count lines: `wc -l` on the dispatcher-lessons file (home delegation dir) → ≤30 verify-pointer lines

---

## Verification Artifact

- Routing test results showing correct lane placement
- `dispatcher-lessons.md` content showing only verify-pointer format lines
- Agent file showing full lesson in § Lessons section

---

## Rollback

- Revert `/reflect` and `/compile-learnings` SKILL.md changes via git
- Delete the lesson-router file from the home delegation dir
- Dispatcher-lessons content is additive (verify-pointers are harmless; can be manually cleared)

---

## Execution Summary

**Council-built (opus-4.6 `lcd05-build-0716`, clean first pass, 35/35 probes incl. the plan's Phase-5 routing simulation), gpt-5.5 cross-reviewed (`lcd05-review-0716` GREEN, independent 35/35 re-run + membrane leak-check clean, zero defects), applied by dispatcher 2026-07-16 under Rutvik's "continue on the plans one by one" directive.**

### Phase 1 — Lesson router: DONE
Router file (WHO-table, 9-row classification table, membrane rule + VERIFY-POINTER format, verbatim per plan lines 38-64) placed at `C:\Users\rutvi\.claude\delegation\lesson-router.md` via scoped SELF_GRANT ceremony (30min TTL, single-path, grants audit-logged). Staged source: `.claude/state/ua-worker/lcd05-build-0716-artifacts/lesson-router.staged.md`.

### Phase 2 — /reflect: DONE
`.claude/skills/reflect/SKILL.md` gains Step 2.5 (lane classification: CEO/WORKER/SYSTEM with destinations) + the HARD BAN ("Full worker technique may NEVER be written to dispatcher-lessons.md... Only 1 line maximum may cross the membrane") + Step-5 routing hook. Additive only — reviewer fingerprint: zero base headings removed. Git-tracked (rollback = git checkout).

### Phase 3 — /compile-learnings: DONE
`.claude/skills/compile-learnings/SKILL.md` gains Step 3.5 (worker-lane scan of agent § Lessons; 3+ recurrence graduates to worker-primer.md; never-graduate-to-CEO-files HARD CONSTRAINT; pointer pruning on graduation + [GRADUATED] tags).

### Phase 4 — Size caps: DONE
Step 4.6 cap table: dispatcher-lessons ≤30 pointer lines / agent § Lessons ≤20 entries / worker-primer ≤80 lines with archive overflow — enforcement step runs after every graduation pass.

### Phase 5 — Verification: DONE
Routing simulation (`route-sim.mjs`, tee in `probes.verify.txt`): "worker skipped LR-036" → generator agent-file § Lessons + 1-line pointer, NOT feedback_* (plan item 6 ✓); "Claude failed to delegate verification" → feedback_*.md CEO-lane (item 7 ✓); pointer-format lint on both skills (item 8 ✓); dispatcher-lessons verify-pointer count currently 0 ≤ 30 (item 9 ✓ — cap applies to pointer lines per Phase 4). Reviewer independently re-ran the full battery + simulation.

### Deviations
None. (Build R1 assumptions — generator-agent default, P5 scope, fs-module tee — dispatcher-accepted, recorded in ticket.)
