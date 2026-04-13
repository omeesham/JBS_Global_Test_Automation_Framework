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

**Identity**: OWNER, WATCHDOG. Auto-loaded via Identity Gate.

- User says "audit", "find issues", "what's missing", "check everything", "what broke"
- After `/execute` completes (called by `/chain` Phase 5)
- User wants full-chain verification: prompt → intent → plan → execution → outcome

## Input
The user may reference a specific plan, or you audit the current session's work. Gather all context first.

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/audit`. No-op if compatible identity active.

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
- **App bug gate (LR-034)**: If audit evidence reveals application behavior that contradicts documented requirements, follow **LR-034 Bug Filing Protocol** — file to `reports/bugs/` before finalizing the audit verdict.

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

## Sonnet Audit (auto-activates when Sonnet Handoff block is present)

When the user pastes content containing a `### Sonnet Handoff` block, OR the plan file contains one, activate this extra audit layer BEFORE the standard Step 1–4 chain. No explicit user instruction needed — the marker is the trigger.

### How to detect
Grep for `### Sonnet Handoff` in pasted content or the referenced plan file. If found → Sonnet Audit is ON.

### Extra audit steps (run after Step 3, before Step 4 verdict)

1. **Breadcrumb completeness** — grep for `[S]` in the plan file. Count entries. Cross-check against the Completed list in the handoff block. Any action in Completed with no breadcrumb = undocumented work = finding.
2. **Citation validity** — for every `per:` value in breadcrumbs, verify the cited rule (LR-NNN) exists in CLAUDE.md, or the cited plan section exists in the plan. Fake/stale citations = trust violation.
3. **Uncertainty review** — every `[?]` breadcrumb is Sonnet flagging its own doubt. Judge each one: is it acceptable uncertainty, or should it have been a HALT? List each with a verdict.
4. **Risk review** — every `risk:high` breadcrumb must have been handled or explicitly deferred with justification. Unacknowledged high risks = finding.
5. **Skipped list scrutiny** — was each skip a real blocker or a capability gap Sonnet avoided? Flag any skip that looks like avoidance.
6. **Completed list verification** — read the ACTUAL files for items listed as Completed. Sonnet may declare done without real verification. Mismatch = critical finding.
7. **Gate compliance** — did Sonnet run Pre-Write, Assertion, and Completion gates? Evidence: breadcrumbs should exist for every file written. If a file was changed with no `[S]` breadcrumb, the pre-write gate was skipped.

### Add to verdict
```
### Sonnet Audit: [PASS / GAPS FOUND]
- Breadcrumb completeness: [OK / N missing]
- Citation validity: [OK / N invalid]
- Uncertainties resolved: [N flagged, verdict per item]
- High risks handled: [OK / N unacknowledged]
- Completed list verified: [OK / N mismatches]
- Gate compliance: [OK / gates skipped]
```

---

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
