---
name: execute
description: Execute an approved plan with pre-research, gap analysis, and post-execution audit — never implement blindly. Use when user says "execute", "implement", "build this", "do it".
user-invocable: true
auto-calls: regression-guard, reflect
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite
---

# /execute — Disciplined Plan Execution

When the user invokes `/execute`, follow this exact workflow. Do NOT skip steps. Do NOT implement blindly.

## When to Use

**Identity**: OWNER, BUILDER. Incompatible identity triggers a warning — see `/identity`.

- User says "execute", "implement", "build this", "do it", "run the plan"
- A plan exists in `plans/pending/` and user wants it implemented
- User provides a plan inline and says to execute it

## Input
The user will reference a plan (from `plans/pending/` or the current conversation). Load it first.

## Phase 0.5: Build Execution Todo List (TodoWrite)

Before any research or code, create a TodoWrite todo list for THIS plan's internal steps. This makes execution trackable and embeds skill references for each sub-task. **Not optional. Every /execute call starts with this.**

### Parse the Plan

Read the plan and decompose it into atomic execution items. Each item gets a todo entry with a skill/action tag in brackets.

### Standard Template

Every /execute run creates AT MINIMUM these items (add plan-specific `[implement]` items between BEFORE and AFTER):

```
[research] Pre-execution research — read all plan files, grep for cross-references
[gap-analysis] Hunt for what the plan missed — imports, tests, types, edge cases
[/regression-guard] BEFORE snapshot — [list the key files from the plan]
[implement] [Change group 1 description] — file1.ts, file2.ts
[implement] [Change group 2 description] — file3.ts
... (one per logical change group from the plan)
[/regression-guard] AFTER snapshot + diff review
[/audit] Post-execution audit — verify plan fulfillment, focus on what was NOT done
[/reflect] Capture learnings from this execution
```

### Plan-Specific Items

Decompose the plan's "Changes" or "Key Files" sections into logical groups. One `[implement]` todo per group. Examples:
- `[implement] Replace view state with activeModal — ChatPage.tsx`
- `[implement] Add modal overlay pattern — PipelineLaunchCard.tsx, ChatApprovalCard.tsx`
- `[implement] Create pages + page_stage_status tables — schema.sql`

### Rules

1. **Every /execute call creates this todo list** — no exceptions, even for small plans
2. **Mark items `in_progress` one at a time** as you work through them
3. **Mark `completed` only when VERIFIED** — not when code is written, but when it's confirmed working
4. **If you discover new items mid-execution**, add them to the todo list before doing them
5. **The todo list survives the entire /execute lifecycle** — from Phase 0.5 through Phase 3

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
3. If you discover something unexpected mid-execution, STOP and assess before continuing
4. Keep a mental ledger of every decision: what you did, what you chose NOT to do, and why

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
