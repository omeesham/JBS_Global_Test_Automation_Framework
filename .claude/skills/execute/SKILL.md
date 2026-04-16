---
name: execute
description: Execute an approved plan with pre-research, gap analysis, and post-execution audit — never implement blindly. Use when user says "execute", "implement", "build this", "do it".
user-invocable: true
auto-calls: relevant, regression-guard, reflect
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite
---

# /execute — Disciplined Plan Execution

When the user invokes `/execute`, follow this exact workflow. Do NOT skip steps. Do NOT implement blindly.

## When to Use

**Identity**: OWNER, BUILDER. Auto-loaded via Identity Gate.

- User says "execute", "implement", "build this", "do it", "run the plan"
- A plan exists in `plans/pending/` and user wants it implemented
- User provides a plan inline and says to execute it

## Input
The user will reference a plan (from `plans/pending/` or the current conversation). Load it first.

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/execute`. No-op if compatible identity active.

## Phase 0: Context Loading (MANDATORY — before ANYTHING else)

Before reading the plan, before building todos, before writing a single line — load the repo's institutional memory. Agents that skip this step make the same mistakes documented in these files. Activity logs show 40+ instances of agents skipping context loading and repeating known mistakes.

1. **Read `specs_planning/_internal/agent-mistakes.md`** — 134 categorized rules from past sessions. Search for your task type prefix: ALL-* (shared), GEN-* (generator), HLR-* (healer), AUD-* (audit), PLN-* (planner). Each rule has a Resolution column — follow it.
2. **Read `.claude/context/patterns.md`** — Decision tree patterns for recurring situations (spec-fixing start, Radix UI dropdowns, Angular save→tab race, etc.). If your task matches a pattern, follow the tree.
3. **Scan CLAUDE.md Learned Rules (LR-001 through LR-026)** — Each has a Trigger condition. If your current task matches ANY trigger, that rule is ACTIVE for this session. Key ones for test work: LR-007 (MCP-verify claims), LR-009 (Angular dirty state), LR-010 (cross-field async), LR-018 (run-all is truth), LR-019 (baseline enforcement), LR-023 (no networkidle), LR-024 (clean before RCA), LR-026 (Angular form dirty defensive).
4. **If a master plan or parent plan is referenced in the task** — read it FIRST to understand broader context, gap statuses, and what's blocked vs actionable. Never work on a subplan without understanding the master.

**Checkpoint**: Before proceeding to Phase 0.5, you must be able to answer: "What are the 3 most relevant ALL-* rules and 3 most relevant LR-* rules for THIS specific task?" If you can't, re-read the files.

---

## Phase 0.5: Build Execution Todo List (TodoWrite)

Before any research or code, create a TodoWrite todo list for THIS plan's internal steps. This makes execution trackable and embeds skill references for each sub-task. **Not optional. Every /execute call starts with this.**

### Auto-call `/relevant` (skill injection)

Before manually building the todo list, run `/relevant` to scan available skills against the plan's subtasks. This ensures no skill coverage is missed — especially valuable for Sonnet sessions or complex multi-domain plans. If `/relevant` produces tagged items, use them as the basis for the todo list below. If the plan is simple and skills are obvious, `/relevant` may be skipped.

### Parse the Plan

Read the plan and decompose it into atomic execution items. Each item gets a todo entry with a skill/action tag in brackets.

### Standard Template

Every /execute run creates AT MINIMUM these items (add plan-specific `[implement]` items between BEFORE and AFTER):

```
[research] Pre-execution research — read all plan files, grep for cross-references
[gap-analysis] Hunt for what the plan missed — imports, tests, types, edge cases
[pre-flight] Verify test data constants exist in live UI via MCP — Phase 1 BLOCKED until all verified
[/regression-guard] BEFORE snapshot — [list the key files from the plan]
[implement] [Change group 1 description] — file1.ts, file2.ts
[implement] [Change group 2 description] — file3.ts
... (one per logical change group from the plan)
[/regression-guard] AFTER snapshot + diff review
[/audit] Post-execution audit — verify plan fulfillment, focus on what was NOT done
[/reflect] Capture learnings from this execution
```

### Context Injection Per Item

After building the todo list, inject relevant context INTO each item. From Phase 0's context loading, tag each todo with its active LR rules, relevant agent-mistakes entries, and guardrails. The context travels WITH the task — not in a separate mental model.

Example: `[implement] Fix test data constants — LR-007(verify before code), GEN-034(run don't assume)`

### Plan-Specific Items

Decompose the plan's "Changes" or "Key Files" sections into logical groups. One `[implement]` todo per group. Examples:
- `[implement] Replace view state with activeModal — ChatPage.tsx`
- `[implement] Add modal overlay pattern — PipelineLaunchCard.tsx, ChatApprovalCard.tsx`
- `[implement] Create pages + page_stage_status tables — schema.sql`

### Cross-Reference Check (MANDATORY before leaving Phase 0.5)

After building the todo list, walk through EVERY bullet/numbered item in the plan's Phase sections and verify each has a corresponding todo item. If a plan bullet has no todo → add it. If you believe a plan deliverable should be skipped → flag it to the user and get explicit approval before proceeding. Self-justification for skipping deliverables ("X is more maintainable") is NOT acceptable — the plan is the contract.

### Rules

1. **Every /execute call creates this todo list** — no exceptions, even for small plans
2. **Mark items `in_progress` one at a time** as you work through them
3. **Mark `completed` only when VERIFIED** — not when code is written, but when it's confirmed working
4. **If you discover new items mid-execution**, add them to the todo list before doing them
5. **The todo list survives the entire /execute lifecycle** — from Phase 0.5 through Phase 3
6. **Plan deliverables are non-negotiable** — you can ADD items the plan missed, but you cannot REMOVE or SUBSTITUTE items the plan specified without user approval

## Phase 1: Pre-Execution Research (MANDATORY)

Before writing a single line of code:

1. **Read the plan thoroughly** — every file path, every change, every justification
2. **Research each file the plan mentions** — read the actual current state, not what the plan assumes it looks like
3. **Gap analysis** — actively hunt for what the plan MISSED:
   - Grep for every string/pattern being changed across the ENTIRE codebase (not just files the plan lists)
   - Check imports, tests, configs, docs, types that reference changed code
   - Check for related files the plan didn't consider
   - Look for edge cases: what happens at boundaries? What if state is null/undefined? What about error paths?
4. **Improvement scan** — can any change be done better while staying aligned with the repo's vision and conventions?
   - Fewer lines? Reuse existing utilities? Better naming?
   - But do NOT scope-creep — improvements must be small and obvious
5. **Record findings and update the todo list** — add newly discovered items from gap analysis, remove items no longer relevant. The todo list must reflect reality:
   - Plan items to execute as-is (already in todo from Phase 0.5)
   - Gaps found → add new `[implement]` or `[fix]` todo items
   - Improvements identified → add if small, skip if scope-creep
   - Items to skip → remove from todo with a note WHY

## Phase 2: Execution

**Auto-call `/regression-guard` BEFORE** — snapshot all files the plan will modify.

1. Work through each item methodically — one at a time
2. Mark each todo as `in_progress` when starting it, then `completed` only when VERIFIED (not just written, but confirmed working)
3. If you discover something unexpected mid-execution, STOP and assess before continuing. On 2nd failure at same fix type → you're guessing, not fixing. Switch to root-cause trace (read evidence, hypothesize, verify) before attempt #3.
4. Keep a mental ledger of every decision: what you did, what you chose NOT to do, and why
5. **App bug gate (LR-034)**: If you discover application behavior that contradicts documented requirements during execution, STOP and follow **LR-034 Bug Filing Protocol** before continuing.

**Auto-call `/regression-guard` AFTER** — re-snapshot, diff, review. If SUSPICIOUS or SILENT BREAK items found, investigate before proceeding.

## Phase 3: Post-Execution Audit (MANDATORY)

After ALL changes are made, do NOT declare done. Instead:

0. **Review the todo list first** — are all items `completed`? Any still `pending` that were forgotten? The todo list IS the audit checklist. Any `pending` items = work not done.
1. **Re-read the original plan** — compare every stated change to what you actually did
2. **Re-read the original prompt/intent** — does the execution fulfill the user's actual ask?
3. **Focus on what you DIDN'T do:**
   - Which files did you skip? Why?
   - Which edge cases did you not handle? Why?
   - Which scenarios did you not consider? Why?
   - Are there related components that should have been updated for consistency?
   - **Implementation Defect Scan** (LR-001 through LR-006 from CLAUDE.md Learned Rules):
     a. **Wrong params (LR-001)?** Grep every function call to another file — verify signature matches actual definition
     b. **Missing handlers (LR-002)?** Every catalog/config entry has a corresponding implementation?
     c. **Silent errors (LR-003)?** Grep `catch {` and `catch(() =>` in changed files — all must have real handling
     d. **Resource leaks (LR-004)?** Every timer/listener has cleanup?
     e. **Stale closures (LR-005)?** Every useCallback/useEffect dep array is complete?
     f. **Unsafe access (LR-006)?** Every `foo.bar.baz` on external data has validation?
4. **Verify on live preview** if a server is running — never declare "done" from code alone
5. **Report honestly** — tell the user:
   - What was executed
   - What gaps you found and addressed beyond the plan
   - What you intentionally left out and WHY
   - Any risks or follow-up items

### Learning Completion Checklist (after post-audit)
5. Would a senior engineer approve these changes without modifications?
6. Auto-call `/reflect` — capture any learnings from this execution
7. Any unexpected behavior? Write to `specs_planning/_internal/agent-mistakes.md`
8. New patterns discovered? Write to relevant memory file

## Phase 3.5: Plan Finalization (MANDATORY — enforced by LR-027/LR-028)

After post-execution audit, before declaring done:

1. **Update plan status**: Edit the plan file:
   - Add `**Executed**: YYYY-MM-DD` to header
   - Change `**Status**:` to `DONE`
   - Add `### Execution Summary` section (see LR-027 for required fields)
   - Document EVERY planned TC: implemented, dropped (with reason), or deferred

2. **Move plan**: `mv plans/pending/PLAN_XXX.md plans/done/PLAN_XXX.md`

3. **Update activity log**: Append session entry to `specs_planning/_internal/agent-activity-log.md`
   Format: `| YYYY-MM-DDThh:mm | {agent} | done | {files} | {description} |`

4. **Update agent-mistakes.md**: If ANY unexpected behavior was found during execution
   (MCP showed different behavior than plan assumed, selector didn't match, validation
   didn't fire as expected), add a new rule entry.

Skip Phase 3.5 ONLY if the plan was NOT in plans/pending/ (ad-hoc execution without plan).

## Auto-Calls

- `/regression-guard` — BEFORE execution (Phase 2 start) and AFTER execution (Phase 2 end)
- `/reflect` — AFTER post-execution audit (Phase 3 end)

## Output

- Execution summary: what was done, gaps found and addressed, decisions made
- Regression guard report (before/after diff verdict)
- Learning items captured (if any)

## Rules
- NEVER trust the plan blindly — the plan is a starting point, not gospel
- NEVER skip pre-research — "the plan already checked" is not an excuse
- NEVER declare done without the post-execution audit
- Focus on what's MISSING, not what's present — QA mindset
- If the plan is wrong about something, fix it and note the correction
