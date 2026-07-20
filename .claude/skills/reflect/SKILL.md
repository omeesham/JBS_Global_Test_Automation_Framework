---
name: reflect
description: Session-end retrospective — capture mistakes, update memory files, flag graduation candidates. Use at session end, after major tasks, or say "reflect" or "what did we learn".
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, Write, Edit
---

# /reflect — Session Retrospective

> **LR lookup**: when citing or verifying `LR-NNN` rules, check BOTH root `CLAUDE.md` and `clients/${ACTIVE_CLIENT}/CLAUDE.md`. Client-specific rules use `LR-ENC-NNN` (or `LR-{CLIENT}-NNN`) prefix; framework rules continue `LR-NNN`.

Captures what was learned during this session and persists it to memory so future sessions benefit. Belt-and-suspenders with blocking mistake capture — this catches what was missed in the moment.

## When to Use

**Identity**: ALL. No identity restrictions for this skill.

- **End of session** (before the user leaves)
- **After major task completion** (post-/execute, post-/chain)
- **Auto-called** by `/execute` (after Phase 3 post-audit)
- **Auto-called** by `/bugfix` (after documentation phase)
- **Manual**: user says "reflect", "what did we learn", "session retrospective", "save learnings"

## Steps

### Step 1: Scan Session Work

Review what happened in this session:

1. **Files changed** — `git diff --stat` or recall from session context
2. **Plans executed** — which plans moved from pending/ to done/?
3. **Errors encountered** — what went wrong and how was it resolved?
4. **User corrections** — did the user redirect or correct your approach?
5. **Approach changes** — did you start with plan A and switch to plan B?

### Step 2: Apply the 6 Mistake Triggers

Check each trigger against the session. If ANY fired, it's a learning to capture:

| # | Trigger | Did it happen? | Sev |
|---|---------|---------------|-----|
| 1 | User corrected you | What was wrong? What did they say? | per §3.1 |
| 2 | Retry was needed (first attempt failed) | What failed? Why? What fixed it? | per §3.1 |
| 3 | Unexpected state encountered | What did you expect vs. find? | per §3.1 |
| 4 | Output didn't match evidence | What did you claim vs. reality? | per §3.1 |
| 5 | Command errored out | What command? What error? Resolution? | per §3.1 |
| 6 | Approach changed mid-task | Original approach? Why abandoned? New approach? | per §3.1 |

**Mandatory**: every fired trigger → append one row to `agent-mistakes.md` with the Sev tag and a one-line classification rationale **in this session** — no batching to later. Severity assigned per `.claude/rules/guardrail-policy.md` §3.1 rubric. Under-classification found by any later audit is itself an S1 mistake with its own row.

### Step 2.5: Apply Lesson-Router Classification

For each mistake identified in Step 2, classify the lane before writing to any memory file.

**WHO made the mistake?**
- Claude (CEO) — bad judgment, rubber-stamping, delegation failure → **CEO-LANE**
- Worker — code/logic/rule error in a delegated task execution → **WORKER-LANE**
- Ticket was bad (ambiguous/missing DOCTRINE) — CEO's ticket-craft failure → **CEO-LANE**
- System — hook bug / wrapper defect / template gap → **SYSTEM-LANE**

**Lane destinations:**
- **CEO-LANE** → `~/.claude/memory/feedback_*.md` (existing behavior) — eligible for CLAUDE.md/LEARNED_RULES graduation via `/compile-learnings`
- **WORKER-LANE** → named agent's `~/.copilot/agents/<agent-name>.agent.md` § Lessons (full technique) + 1-line verify-pointer into `dispatcher-lessons.md`:
```
VERIFY-POINTER: <rule-name>; worker must: <expected behavior>; check: <Parity Report field>
```
- **SYSTEM-LANE** → file as guardrail plan stub in `plans/pending/` (see Step 5)

**HARD BAN — Full worker technique may NEVER be written to `dispatcher-lessons.md`.** If a WORKER-LANE lesson contains implementation details, multi-line explanations, or specific code patterns, the router MUST redirect the full content to the agent file and emit only the 1-line verify-pointer into `dispatcher-lessons.md`. Only 1 line maximum may cross the membrane. This prevents re-pollution via primer injection (`delegation-primer.mjs:75-95` injects dispatcher-lessons into every session).

### Step 3: Categorize Learnings

For each learning identified, classify as:

- **Mistake** → goes to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` (with proper ID: next sequential R-number)
- **Pattern** → goes to relevant memory file (new pattern that worked well, worth repeating)
- **Preference** → goes to feedback memory file (user style/approach correction)
- **Reference** → goes to reference memory file (external resource or technique discovered)

### Step 4: Update Memory Files

1. **Mistakes**: Append to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` following existing format. Then route per Step 2.5 lane classification — CEO-LANE to `~/.claude/memory/feedback_*.md`, WORKER-LANE to `~/.copilot/agents/<agent-name>.agent.md` § Lessons plus a 1-line verify-pointer in `dispatcher-lessons.md`, SYSTEM-LANE to a guardrail plan stub in `plans/pending/`.
2. **Patterns**: Write to appropriate memory file in `.claude/projects/.../memory/` — update existing file if topic matches, create new if novel
3. **Preferences**: Write to `feedback_*.md` in memory directory
4. **References**: Write to `reference_*.md` in memory directory
5. **Update MEMORY.md index** if any new files were created

### Step 4.4: Update Navigation Registry (mandatory if session explored new territory)

Open `.claude/context/navigation.md` and check:

1. **Did this session produce a new findings file, catalog, MCP-discovery artifact, or map a previously-unexplored surface?**
   - YES → add a row to **§C Exploration Registry** with: `| {surface} | Complete/Partial/Deferred | {findings file paths} | {first-explored YYYY-MM-DD} | {last-updated YYYY-MM-DD} |`
   - NO → skip to next check.

2. **Did this session re-discover a helper / pattern / rule that exists but wasn't listed in §B Routing Table?**
   - YES → add a row so the next agent doesn't repeat the re-discovery.
   - NO → skip.

3. **Did this session hit a "stuck" loop (2+ failed attempts on the same problem) that §D Stuck Protocol didn't cover?**
   - YES → extend §D with the new lesson.
   - NO → skip.

Skipping this step when new territory was explored violates R00 for the NEXT agent who has to re-explore what you found. Stale map = repeated mistakes.

### Step 4.5: Upgrade Check (self-referential improvement)

If Step 4 wrote any new mistakes or patterns, run `/upgrade` logic inline:

1. For each new rule/pattern just captured, extract its TRIGGER and SCOPE
2. Scan the current session's active TodoWrite items and recently modified files
3. Check: does this new rule apply to anything we did or are doing RIGHT NOW?
4. If yes: flag as `APPLY NOW` — the agent should fix before session ends
5. If no: note why and move on

This catches the "I just wrote a rule I'm violating" pattern. See `/upgrade` SKILL.md for full methodology.

### Step 5: Check for Graduation Candidates

Scan `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` for patterns with **3+ occurrences** (similar root cause or same rule violated repeatedly).

If found, flag them:
```
GRADUATION CANDIDATES (3+ occurrences — run /compile-learnings):
- Pattern: [description] — seen in R-XX, R-YY, R-ZZ
```

**S0/S1 recurrence budget exhausted?** Any graduation candidate with Sev=S0 or Sev=S1 whose recurrence budget is exceeded (§3.1 of `.claude/rules/guardrail-policy.md`) requires a durable recipient — a `plans/pending/SUBPLAN_GUARDRAIL_<CLASS>.md` stub (LR-048 minimum) OR a grep-verifiable line item in an existing pending guardrail plan (LR-040(b)) — filed **in this session**. Task chips are forbidden recipients (LR-060 obligation 3).

None — this is a leaf skill. Called BY `/execute`, `/bugfix`, `/audit`, and `/chain`.

## Output

```
## Session Retrospective

### Learnings Captured: [N total]
- Mistakes: [count] → agent-mistakes.md
- Patterns: [count] → [which memory files]
- Preferences: [count] → [which feedback files]
- References: [count] → [which reference files]

### Memory Files Updated
- [file1] — [what was added]
- [file2] — [what was added]

### Graduation Candidates
- [any patterns with 3+ occurrences, or "None found"]

### Session Quality
- Corrections received: [count]
- Retries needed: [count]
- Clean executions: [count]
```


## Verification Artifact (D23)

Before declaring this skill done, emit one runnable / readable check the user (or next session) can re-run to confirm the output:

- File path + expected content (e.g., `plans/pending/X.md exists with **Status**: Pending`)
- Bash command + expected output (e.g., `git diff --stat ...` shows N files)
- Test command (e.g., `npm run typecheck`, `npx tsc --noEmit`)
- Or a structured expected-output template (≤10 lines)

Verification artifact ≠ prose summary. It is a runnable / readable check that confirms the skill's output. Without it, the work is unaudítable. Anthropic cupcake §786-793 — single highest-leverage tactic for AI-built artifacts.
