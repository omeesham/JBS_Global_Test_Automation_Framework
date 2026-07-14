# SUBPLAN_LCD_05_LEARNING_LANES — Lesson-router + CEO/worker lane split + membrane

**Status**: Pending
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

1. Add to `~/.claude/delegation/lesson-router.md` (new file, gitignored):
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
   - SYSTEM-LANE mistakes → file as guardrail plan stub in `plans/pending/` (existing behavior per `reflect/SKILL.md:109`)
   - For WORKER-LANE: also write a verify-pointer to `dispatcher-lessons.md` (1 line only):
     ```
     VERIFY-POINTER: <rule-name>; worker must: <expected behavior>; check: <Parity Report field>
     ```

3. **BAN full worker technique from `dispatcher-lessons.md`**: Only verify-pointers may cross the membrane. If `/reflect` detects a full technique/implementation lesson destined for dispatcher-lessons, it MUST route to the agent file instead and emit only the verify-pointer. This prevents re-pollution via primer injection (`delegation-primer.mjs:75-95` injects dispatcher-lessons into every session).

### Phase 3 — Modify `/compile-learnings` skill

4. In `.claude/skills/compile-learnings/SKILL.md`, add a worker-lane scan step:
   - **NEW**: After scanning CEO pile (existing), scan `~/.copilot/agents/*.agent.md` § Lessons sections
   - Graduate recurring worker patterns (3+ occurrences) to `~/.claude/delegation/worker-primer.md` (the universal worker primer from LCD_01)
   - Worker-lane lessons NEVER graduate into `CLAUDE.md`, `LEARNED_RULES.md`, or any CEO-loaded file
   - Verify-pointers in `dispatcher-lessons.md` are pruned when the underlying worker lesson graduates (to prevent dispatcher-lessons growth)

### Phase 4 — Size management

5. Add size caps:
   - `dispatcher-lessons.md`: max 30 lines of verify-pointers. When exceeded, oldest pointers are pruned (the underlying worker lesson remains in the agent file).
   - Per-agent `*.agent.md` § Lessons: max 20 entries. When exceeded, `/compile-learnings` graduates the most common to `worker-primer.md` and prunes the agent file.
   - `worker-primer.md`: max 80 lines total. Overflow triggers a trim pass (archive to `~/.claude/delegation/worker-primer-archive.md`).

### Phase 5 — Verification

6. Create a test scenario: simulate a "worker skipped LR-036" mistake → confirm it routes to:
   - `generator.agent.md` § Lessons (full technique)
   - `dispatcher-lessons.md` (verify-pointer only, ≤1 line)
   - NOT to `feedback_*.md` or `CLAUDE.md`
7. Create a test scenario: simulate a "Claude failed to delegate verification" → confirm it routes to `feedback_*.md` (CEO lane)
8. Verify `dispatcher-lessons.md` does NOT contain full technique/implementation details (only verify-pointers)
9. Count lines: `wc -l ~/.claude/delegation/dispatcher-lessons.md` → ≤30

---

## Verification Artifact

- Routing test results showing correct lane placement
- `dispatcher-lessons.md` content showing only verify-pointer format lines
- Agent file showing full lesson in § Lessons section

---

## Rollback

- Revert `/reflect` and `/compile-learnings` SKILL.md changes via git
- Delete `~/.claude/delegation/lesson-router.md`
- Dispatcher-lessons content is additive (verify-pointers are harmless; can be manually cleared)
