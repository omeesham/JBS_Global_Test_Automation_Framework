---
name: audit
description: Full-chain audit comparing original prompt, intent, vision, plan, execution, and outcomes — QA-grade scrutiny focused on what was NOT done. Use when user says "audit", "find issues", "what's missing", "check everything".
user-invocable: true
auto-calls: reflect
tools: Read, Glob, Grep, Bash, Agent, TodoWrite
---

# /audit — Full-Chain Execution Audit

When the user invokes `/audit`, perform a rigorous QA audit of everything that happened. This is judge-level scrutiny. No mercy. No shortcuts.

## When to Use

**Identity**: OWNER, WATCHDOG. Incompatible identity triggers a warning — see `/identity`.

- User says "audit", "find issues", "what's missing", "check everything", "what broke"
- After `/execute` completes (called by `/chain` Phase 5)
- User wants full-chain verification: prompt → intent → plan → execution → outcome

## Input
The user may reference a specific plan, or you audit the current session's work. Gather all context first.

## Step 1: Reconstruct the Chain

Build the full chain of decisions that led to the current state:

1. **Original prompt** — what did the user literally ask for? (exact words matter)
2. **Intent** — what did the user MEAN? (sometimes different from literal words)
3. **Vision** — what's the broader product/project goal this serves?
4. **Plan** — what was the approved plan? Read it from `plans/pending/` or `plans/done/`
5. **Changes to plan** — were any modifications made during execution? What and why?
6. **Execution** — what was actually implemented? (read the actual files, don't trust memory)
7. **Post-execution state** — what does the codebase look like NOW?

## Step 2: Audit Each Link

For EACH link in the chain, ask:

### Prompt → Intent
- Did we interpret the prompt correctly?
- Did we miss any nuance or implication in the user's words?
- Did we address ALL parts of the request, or did some get dropped?

### Intent → Plan
- Does the plan fully address the intent?
- Are there aspects of the intent the plan ignored?
- Did the plan introduce scope that wasn't in the intent?

### Plan → Execution
- Was every plan item executed?
- Were any plan items skipped? WHY?
- Were any plan items executed differently than specified? WHY?
- Were additional items added during execution? Were they justified?

### Execution → Outcome
- Does the current code state match what was intended?
- Are there inconsistencies between changed files?
- Do the changes work together as a cohesive whole?

## Step 3: The Missing Audit (MOST IMPORTANT)

This is the core of /audit. Focus ENTIRELY on what was NOT done.

### 3 Parallel Audit Perspectives

Apply these simultaneously — each catches different classes of issues:

#### Model-Field Checker
- Every data model: are all fields accounted for in forms and API responses?
- Every form: does it match the model? Missing fields? Extra fields?
- Every API response: does it match the TypeScript type definition?
- Every database query: does it reference valid columns?

#### Logic Checker
- Every conditional: is the logic correct? Inverted? Missing else?
- Every loop: off-by-one? Empty array handling? Break/continue correct?
- Every async operation: error handling? Race conditions? Missing await?
- Every state transition: all paths lead to valid states?

#### Scope Checker
- Every file in the plan: was it touched?
- Every file NOT in the plan: should it have been?
- Every test: does it cover the change?
- Every import/export: still valid after changes?

### Standard Missing Audit Checklist

1. **Skipped files** — which files in the codebase SHOULD have been touched but weren't?
   - Grep for every changed string/pattern across the full codebase
   - Check for stale references, inconsistent naming, orphaned imports
2. **Skipped scenarios** — what user journeys or states weren't considered?
   - Different roles (admin, user, guest)
   - Empty states, error states, loading states
   - Mobile/responsive, dark mode, accessibility
3. **Skipped edge cases** — what could break?
   - Null/undefined values
   - Concurrent operations
   - Boundary conditions (empty arrays, max lengths, special characters)
4. **Skipped tests** — should tests have been added or updated?
5. **Skipped docs** — does any documentation reference the old behavior?

## Step 4: Verdict

Produce a structured report:

```
## Audit Report

### Chain Integrity: [PASS / GAPS FOUND]
- Prompt → Intent: [OK / issue]
- Intent → Plan: [OK / issue]
- Plan → Execution: [OK / issue]
- Execution → Outcome: [OK / issue]

### Missing Items: [count]
- [list each missing item with severity: critical / important / minor]

### Risks: [count]
- [list each risk]

### Recommendation
[What should happen next — fix now, fix later, or accept as-is with noted risks]
```

### Learning Capture (after verdict)
- Any mistakes discovered during audit → `specs_planning/_internal/agent-mistakes.md`
- Any patterns worth noting → relevant memory file
- Any recurring issue (3+ times) → flag for `/compile-learnings`
- Auto-call `/reflect` to persist learnings

## Auto-Calls

- `/reflect` — after audit verdict is delivered (capture learnings)

## Output

The structured Audit Report shown in Step 4 above, plus:
- Learning items captured (if any)
- Graduation candidates flagged (if any)

## Rules
- NEVER rubber-stamp — if everything looks perfect, you're not looking hard enough
- NEVER focus on what WAS done — focus on what WASN'T
- NEVER trust your own memory — re-read actual files to verify claims
- Read EVERY file that was changed to confirm the changes are correct
- If the audit finds critical issues, flag them clearly — do not bury them in a list
