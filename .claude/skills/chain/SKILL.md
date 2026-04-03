---
name: chain
description: Autonomously execute all pending plans in sequence — reads plans/pending/, orders by priority and dependencies, runs full skill pipeline per plan (audit → refine → questionnaire → execute → post-audit → fix), compacts context between plans to prevent pollution, and stops when all plans are done. Use this skill whenever the user wants to batch-execute plans, run the full pipeline autonomously, process the pending queue, or mentions "chain", "run all plans", "execute pending", or "autonomous pipeline". Also triggers when the user wants hands-off plan execution with quality gates.
user-invocable: true
auto-calls: regression-guard, reflect, research
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite, AskUserQuestion, WebSearch, WebFetch
---

# /chain — Autonomous Plan Chain Execution

When the user invokes `/chain`, you become an autonomous plan execution engine. You process every plan in `plans/pending/` through a rigorous multi-phase pipeline, using the right skill at every phase, compacting context between plans so each one gets a clean mental slate.

## When to Use

**Identity**: OWNER (auto-sets OWNER if not active). Incompatible identity triggers a warning — see `/identity`.

- User says "run all plans", "execute pending", "chain", "autonomous pipeline", "batch execute"
- User wants hands-off plan execution with quality gates
- Multiple plans in `plans/pending/` need processing

The reason context compaction matters: without it, implementation details from Plan A bleed into Plan B's execution, causing the agent to make assumptions, carry stale patterns, or repeat mistakes. Each plan deserves the same fresh-session quality a human would get by starting a new conversation. This skill simulates that.

---

## Phase 0: Discovery & Ordering

Before touching any plan:

1. **Read `plans/INDEX.md`** — this is the source of truth for execution order, not filenames
2. **Read `plans/pending/`** — list every file present
3. **Build the execution queue** by cross-referencing INDEX.md's "Execution Queue" table with what's actually in `pending/`
4. **Resolve dependencies** — for each plan, read its `Depends On` field:
   - If dependencies are all DONE → plan is ready
   - If dependencies are in the pending queue → plan must wait until those complete
   - If a master plan exists (e.g., PLAN_48) with sub-plans (48A-48M), read the master plan's execution order section for parallelization hints
5. **Sort into waves** — group plans that can run in parallel vs. those that must be sequential:
   - Wave 1: all dependency-free plans
   - Wave 2: plans whose dependencies are all in Wave 1
   - Wave 3+: cascade continues
   - Within a wave, process plans by priority (P0 → P1 → P2), then by number (lower first)

**Display the queue to the user:**
```
╔═══════════════════════════════════════════════════╗
║  CHAIN: Execution Queue                          ║
╠═══════════════════════════════════════════════════╣
║  Wave 1 (parallel-safe):                         ║
║    1. PLAN_48A — Diagnostics Pipeline Fix [P0]   ║
║    2. PLAN_48B — Agent MCP Capability Fix [P0]   ║
║    ...                                           ║
║  Wave 2 (depends on Wave 1):                     ║
║    7. PLAN_48D — Triage Bug Detection [P1]       ║
║    ...                                           ║
║  Total: [N] plans across [W] waves               ║
╚═══════════════════════════════════════════════════╝
```

**Important**: Even though plans within a wave CAN run in parallel conceptually, execute them ONE AT A TIME sequentially. The parallelization hints tell you what's safe to run without waiting — but you still process each plan through the full 7-phase pipeline before starting the next. This ensures full audit quality and prevents context pollution.

---

## Phase 0.5: Build Execution Manifest (TodoWrite)

After discovery and ordering, IMMEDIATELY call TodoWrite to create the execution manifest. This is the SINGLE source of progress tracking for the entire chain. **Not optional. Every chain run starts with this.**

### Todo Item Format

Each plan gets one todo item. The `content` field MUST embed:
1. **Skill reference** in brackets — which skill will be invoked
2. **Plan identifier** — filename and short title
3. **Key files** — the 3-5 most critical files to be modified (from the plan's "Key Files" section)
4. **Dependencies** — which plans must complete first
5. **Wave** — execution wave number

Format:
```
[/execute] PLAN_53A: Kill Chat-Blocking View States — ChatPage.tsx, PipelineLaunchCard.tsx, ChatApprovalCard.tsx, ChatTriageCard.tsx | deps: none | wave: 1
```

The `activeForm` mirrors this in present participle:
```
Executing PLAN_53A: Kill Chat-Blocking View States — ChatPage.tsx, PipelineLaunchCard.tsx
```

### Wave Separators

Insert a completed "header" todo at the start of each wave for visual grouping:
```
content: "═══ WAVE 1 (no dependencies) ═══"
activeForm: "Processing Wave 1"
status: "completed"  (Wave 1 headers start completed; later wave headers start pending)
```

Later wave headers stay `pending` until all plans in the PREVIOUS wave are `completed`, then flip to `completed` when their wave begins processing.

### Manifest Rules

1. **The manifest IS the truth** — if it's not in the todo list, it doesn't get executed
2. **Update in real-time** — mark `in_progress` when starting a plan's Phase 1, `completed` when Phase 7 finishes
3. **Only ONE plan `in_progress` at a time** — matches TodoWrite's constraint
4. **Wave headers** flip to `completed` when their wave begins (all prior waves done)
5. **Blocked plans stay `pending`** — never start a plan whose dependencies aren't `completed`
6. **The final state** should show all items as `completed` (or note blocked ones)

### TodoWrite Handoff Protocol (Chain ↔ Execute)

TodoWrite supports only ONE flat list. When Phase 4 hands off to `/execute`, the lists swap:

1. **Before handing off to /execute**: Mentally save the chain-level manifest (all wave headers + plan items + their current statuses)
2. **During /execute**: `/execute`'s Phase 0.5 creates its own detail-level todo list (per-step items for the single plan). This OVERWRITES the chain manifest in TodoWrite.
3. **After /execute completes**: IMMEDIATELY call TodoWrite again to RESTORE the chain-level manifest with the just-completed plan marked as `completed`

This save→overwrite→restore cycle happens for EVERY plan in the chain. Never skip the restore step.

---

## Per-Plan Pipeline (7 Phases)

For EACH plan in the queue, execute these phases in order. Never skip a phase. Never be lazy.

### Display Header
```
═══════════════════════════════════════════════════
CHAIN: Plan [N/total] — [plan filename]
Priority: [P0/P1/P2] | Dependencies: [list or "none"]
═══════════════════════════════════════════════════
```

---

### Phase 1: Pre-Audit

**TodoWrite**: Mark the current plan's todo item as `in_progress` before doing anything else.

**Goal**: Find gaps, bad assumptions, and missing pieces in the plan BEFORE refining or executing it.

1. **Read the plan file** completely — every section, every code snippet, every file path
2. **Apply the audit methodology directly** (inline — do not invoke /audit as a separate skill):
   - Reconstruct: what problem does this plan solve? What's the intent?
   - Verify every file path mentioned — do they exist? Are they current?
   - Check every code snippet — does the surrounding code still look like what the plan assumes?
   - Run the "Missing Audit": what files SHOULD be in scope but aren't? What edge cases aren't covered?
   - Check for stale assumptions — plans may have been written days/weeks ago, codebase may have changed
3. **Research online if needed** — if the plan involves technology, patterns, or approaches you're uncertain about:
   - Use WebSearch to find best practices, common pitfalls, and prior art
   - Look for "how to [specific technique]" from experienced practitioners
   - Check for known issues with specific library versions or API changes
   - This is especially important for first-time implementations where the agent has no prior experience
4. **Record findings** — list every issue found with severity (critical/important/minor)

```
Phase 1: Pre-Audit .......... [done — N issues found (X critical, Y important, Z minor)]
```

---

### Phase 2: Refinement

**Goal**: Fix the plan based on audit findings. Make it bulletproof before execution.

1. **Apply `/planning` methodology** to refine:
   - Fix every critical and important issue from Phase 1
   - Run the 3 enemy audit rounds on the REFINED plan:
     - Round 1: Scope completeness — did the fixes introduce new gaps?
     - Round 2: Design consistency — do changes align with codebase conventions?
     - Round 3: Breaking changes — could the refined plan break anything?
   - Intent review — does the refined plan still match the original goal?
2. **Research online for unfamiliar territory** — if Phase 1 revealed knowledge gaps:
   - Search for implementation patterns others have used for similar problems
   - Look for documentation, tutorials, or Stack Overflow answers relevant to the specific technical challenge
   - Check if any libraries or tools would make the implementation more robust
   - Fold findings into the refined plan
3. **Save the refined plan** back to the same file in `plans/pending/`
4. **Note what changed** — brief list of refinements made

```
Phase 2: Refinement ......... [done — N changes made, 3 audit rounds passed]
```

---

### Phase 3: Pre-Execution Questions (Conditional)

**Goal**: Surface any blocking ambiguities that require human judgment. Skip if the plan is clear.

1. **Evaluate internally**: are there genuine decision points that require the user's input?
   - Ambiguous scope ("should this also cover X?")
   - Design trade-offs with no clear winner
   - Business logic that can't be inferred from code
   - Risk decisions ("this will break Y temporarily, OK?")
2. **If YES — blocking questions exist**:
   - Apply `/questionnaire` methodology
   - Use AskUserQuestion with dead-simple yes/no questions
   - Process answers, update the plan if needed
   - **This is the ONLY human-in-loop moment in the chain**
3. **If NO — plan is clear enough**:
   - Skip this phase
   - Log why: "Plan is unambiguous — no steering questions needed"

```
Phase 3: Questions .......... [skipped — plan is clear] or [done — asked N questions, N decisions made]
```

---

### Phase 4: Execution

**Goal**: Implement the plan with full discipline. No blind implementation.

**TodoWrite Handoff**: Before starting execution, save the chain-level manifest mentally. `/execute`'s Phase 0.5 will overwrite TodoWrite with plan-level detail items. After `/execute` completes, RESTORE the chain manifest with this plan marked `completed`. See Phase 0.5's handoff protocol.

1. **Apply `/execute` methodology** (including `/regression-guard` before + after):
   - **Pre-research (MANDATORY)**: Read every file the plan mentions. Grep for every pattern being changed across the ENTIRE codebase. Find what the plan missed.
   - **Signature verification (MANDATORY — LR-001)**: For every function the plan calls from another module, READ the actual function definition. Verify params match. Do NOT trust the plan's assumptions about function signatures.
   - **BEFORE snapshot**: Auto-call `/regression-guard` Phase 1 on files being changed
   - **Gap analysis**: Record new findings, add to execution scope if justified
   - **Execute methodically**: One change at a time. Verify each before moving on.
   - **Research online when stuck**: If you encounter an error, unfamiliar API, or unexpected behavior:
     - Search for the specific error message or behavior
     - Look for solutions from practitioners who've faced the same issue
     - Check documentation for the specific version of tools/libraries in use
     - Don't guess — find the answer
   - **Track decisions**: What you did, what you chose NOT to do, and why
2. **AFTER snapshot**: Auto-call `/regression-guard` Phase 2. Review diff. Investigate any SUSPICIOUS or SILENT BREAK items.
3. **Post-execution verification**: If a dev server is running, verify on live preview. Never declare done from code alone.

```
Phase 4: Execution .......... [done — N files changed, M gaps found and addressed, regression guard: CLEAN/ISSUES]
```

---

### Phase 5: Post-Execution Audit

**Goal**: Verify the execution actually fulfilled the plan. Focus on what was NOT done.

1. **Apply `/audit` methodology** on the execution:
   - Re-read the original plan
   - Re-read every changed file
   - Check: was every plan item executed?
   - Check: do the changes work together as a cohesive whole?
   - Run the "Missing Audit":
     - Skipped files that should have been touched?
     - Skipped scenarios (roles, states, error paths)?
     - Skipped edge cases (null, boundaries, concurrency)?
     - Skipped tests that should exist?
     - Stale references to old behavior?
   - **Implementation Defect Checklist** (graduated from PLAN_53 audit — LR-001 through LR-006):
     a. **Function call audit (LR-001)**: for every cross-module function call in changed code, verify the actual function signature matches usage (param types, order, names). Read the function definition, don't trust the plan.
     b. **Catalog parity (LR-002)**: for every entry added to a catalog/registry (ACTION_CATALOG, route table, event types), verify corresponding handler/implementation exists. Catalog without handler = broken feature.
     c. **Error handling (LR-003)**: grep for `catch {` and `catch(() =>` in changed files — every catch must have real handling, not empty bodies. Silent swallowing = invisible failures.
     d. **React cleanup (LR-004)**: for every timer/listener/subscription created, verify cleanup on unmount via useEffect return or useRef.
     e. **Dependency arrays (LR-005)**: for every useCallback/useEffect, verify all referenced variables are in deps or accessed via refs. Stale closure = invisible bugs.
     f. **Data validation (LR-006)**: for every external data access (API response, file read, JSONB column), verify structure is validated before nested property access.
2. **Grade the execution**:
   - Chain integrity: PASS or GAPS FOUND
   - Missing items count + severity
   - Risks identified

```
Phase 5: Post-Audit ......... [done — chain integrity: PASS/GAPS] or [done — N issues found]
```

---

### Phase 6: Fix

**Goal**: Fix any issues found in the post-audit. Leave nothing undone.

1. **If post-audit found issues**:
   - Fix every critical and important issue
   - For minor issues: fix if quick, otherwise note as follow-up
   - Re-verify each fix
2. **If post-audit was clean**:
   - Skip this phase

```
Phase 6: Fixes .............. [done — N fixes applied] or [skipped — audit was clean]
```

---

### Phase 7: Completion & Compaction

**Goal**: Close out this plan and prepare a clean slate for the next one.

#### 7A: Close Out the Plan

1. **Move the plan file** from `plans/pending/` to `plans/done/`
2. **Update `plans/INDEX.md`**:
   - Change the plan's status to DONE in the Execution Queue table
   - Add the completion date
   - Add a session log entry: `| [today's date] | PLAN_XX marked DONE via /chain: [1-line summary] |`
3. **If this was the last sub-plan of a master plan** (e.g., 48M is the last of 48A-48M):
   - Also move the master plan to `plans/done/`
   - Update INDEX.md for the master plan too
4. **Update the execution manifest** — call TodoWrite to restore the chain-level manifest with this plan's todo item marked as `completed`. If this was the last plan in a wave, also mark the NEXT wave's header as `completed` (signaling that wave is now unblocked).

#### 7B: Context Compaction — 3-Layer Protocol (CRITICAL)

This is what prevents context pollution between plans. Three layers, each targeting a different failure mode:

##### Layer 1: Tool Discipline (during execution)
- The Phase 0.5 execution manifest (TodoWrite) IS the external state tracker — update it at every phase boundary, not just at plan completion
- Write intermediate results to files, not mental notes
- When context grows large, prefer reading from files over recalling from context
- Use dedicated tools (Read, Grep, Glob) instead of Bash for file operations — less context noise

##### Layer 2: Write-Before-Compact (before clearing context)
- Save ALL learnings to memory files BEFORE clearing context:
  - New patterns discovered → save as project memory
  - User feedback received → save as feedback memory
  - New references found → save as reference memory
- Write completion record to plans/done/ BEFORE clearing
- Save any user preferences discovered to feedback memory BEFORE clearing
- **Nothing unsaved should exist only in context** — if it's not written down, it's gone

##### Layer 3: Task-Boundary Compaction (between plans)
1. **Write a compact completion record** — a 3-5 line summary of what was accomplished:
   ```
   PLAN_48A DONE: [what was accomplished]
   Files changed: [count]
   Key decisions: [1-2 most important]
   Risks noted: [any, or "none"]
   ```
2. **Auto-call `/reflect`** — capture session learnings before context reset
3. **Mental context reset** — explicitly acknowledge:
   - "Clearing implementation context from PLAN_XX"
   - "Carrying forward ONLY: project context, user preferences, and memory system"
   - "Next plan gets a fresh mental slate"
4. **Do NOT carry forward**:
   - Specific code patterns from this plan (read fresh from files if needed next time)
   - Assumptions about file states (re-read files for the next plan)
   - Debugging context or workarounds
   - "Momentum" — don't rush the next plan because this one went smoothly

```
Phase 7: Compaction ......... [done — context cleared, [N] memories saved]
```

---

## After All Plans Complete

When `plans/pending/` is empty (or all remaining plans have unmet external dependencies):

```
╔═══════════════════════════════════════════════════╗
║  CHAIN COMPLETE                                   ║
╠═══════════════════════════════════════════════════╣
║  Plans executed: [N]                              ║
║  Total files changed: [count]                     ║
║  Issues found & fixed: [count]                    ║
║  Questions asked: [count]                         ║
║                                                   ║
║  Summary:                                         ║
║  1. PLAN_XX — [what was accomplished]             ║
║  2. PLAN_YY — [what was accomplished]             ║
║  ...                                              ║
║                                                   ║
║  Remaining (blocked by external deps):            ║
║  - [any plans that couldn't execute, if any]      ║
╚═══════════════════════════════════════════════════╝
```

---

## Online Research Protocol

Throughout the chain, research online whenever:

1. **First-time implementation** — the plan asks for something you haven't done before in this codebase. Someone out there has solved this problem. Find their approach before inventing your own.
2. **Error encountered** — don't guess at fixes. Search for the exact error message. Check GitHub issues, Stack Overflow, and official docs.
3. **Library/API uncertainty** — if using a specific library version, check its docs. APIs change between versions. What worked in v2 might not work in v5.
4. **Architecture decisions** — when the plan involves a design pattern (multi-tenancy, SSE, worker queues, etc.), research best practices. A 2-minute search can prevent hours of rework.
5. **"I think this is how it works" moments** — if you catch yourself assuming how something works rather than knowing, that's a research trigger. Look it up.

Use WebSearch for broad discovery and WebFetch for reading specific pages. Fold findings into your work — don't just read and forget.

---

## Rules

- **Never skip skill phases** — every plan gets the full 7-phase pipeline. The whole point is rigor.
- **Never be lazy in audits** — ultrathink mode. Every line. Every claim. If it says "this does X" — verify it actually does X.
- **Never carry context forward** — each plan gets a clean slate. Re-read files, re-check assumptions.
- **Never assume** — if in doubt, read the file. If still in doubt, research online. If still in doubt, ask the user.
- **Stop for blocking questions only** — the user wants autonomous execution. Only interrupt for genuine decisions that require human judgment (business logic, scope trade-offs, risk acceptance).
- **Research before guessing** — online research is cheap. Bad assumptions are expensive. When doing something for the first time, someone with experience has written about it. Find that knowledge.
- **Update INDEX.md faithfully** — it's the source of truth. Every completion, every status change, every date.
- **Respect dependency order** — never execute a plan whose dependencies aren't DONE.
- **If the chain hits an unrecoverable error** — stop, report what happened, what was completed, and what remains. Don't silently skip broken plans.

## Auto-Calls

- `/regression-guard` — Phase 4 (before + after execution, per plan)
- `/reflect` — Phase 7B Layer 3 (between plans) + after all plans complete
- `/research` — Phase 1/2/4 (when knowledge gaps found)

## Output

The chain completion banner shown in "After All Plans Complete" above, plus:
- Per-plan regression guard verdicts
- Total learnings captured across all plans
- Any graduation candidates flagged
