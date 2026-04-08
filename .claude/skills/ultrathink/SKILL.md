---
name: ultrathink
description: Quality-gated task wrapper — when user says "ultrathink", creates mandatory quality gates as TodoWrite items BEFORE any work, then wraps sub-skills with adversarial plan audits. Structural enforcement for SUPREME RULE quality requirements.
user-invocable: true
auto-calls: planning, execute, audit, reflect
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite
---

# /ultrathink — Quality-Gated Task Wrapper

When the user says "ultrathink", this skill auto-fires via priority 0.5 routing. It wraps whatever task the user wants done with mandatory quality gates.

## When to Use

**Identity**: OWNER. Auto-loaded via Identity Gate.

- User says "ultrathink", "ultra think", "ultrathink this"
- Always in combination with a task — ultrathink modifies HOW, not WHAT

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/ultrathink`. No-op if compatible identity active.

## Step 0: Quality Gate Setup (FIRST ACTION — non-negotiable)

Before ANY other work, create TodoWrite items for all quality gates:

1. `GATE: Adversarial plan audit (3 challenges)` — pending
2. `GATE: Post-execution audit` — pending
3. `GATE: /reflect + LR-028 session bookkeeping` — pending

These gates persist across context compression (external state via TodoWrite, not internal context).
These gates CANNOT be removed or skipped. They must all be marked completed before the session ends.

## Step 1: Parse User Intent

Read the user's message AFTER "ultrathink" to determine what they want:

- Planning keywords → delegate to `/planning` (Step 2)
- Execution keywords → delegate to `/execute` (Step 4)
- Audit keywords → delegate to `/audit`
- Mixed → chain in order detected
- Ambiguous → ask user

## Step 2: Delegate to /planning (if applicable)

Invoke `/planning` normally. It runs its own 3 mechanical audit rounds (Step 3 of /planning).
After /planning completes, proceed to Step 3 (adversarial audit) BEFORE any execution.

## Step 3: Adversarial Plan Audit

This is /ultrathink's core value-add — adversarial, not mechanical.

Three challenges, each from a different angle:

1. **Skeptic**: "This plan will fail because..." — attack the weakest assumption
2. **Scope**: "This plan is missing/overscoping..." — find what was left out or bloated
3. **User Intent**: "This isn't what the user wants because..." — re-read original request, find drift

**Rules**:
- Each challenge MUST produce at least 1 concrete finding OR explicitly argue why the plan is sound
- "Looks good" is NOT acceptable — that's rubber-stamping, not auditing
- Fix all findings in the plan before proceeding to execution
- Mark `GATE: Adversarial plan audit` as completed

## Step 4: Delegate to /execute (if applicable)

Invoke `/execute` normally. It runs its own post-execution audit (Phase 3 of /execute).
After /execute completes, verify its Phase 3 actually ran.
Mark `GATE: Post-execution audit` as completed.

## Step 5: Gate Verification

After all sub-skills complete, sweep the TodoWrite list:
- Every GATE item must be completed
- Any GATE still pending = HALT → run it now before declaring done

## Step 6: Session Bookkeeping

- Auto-call `/reflect`
- Add entry to `specs_planning/_internal/agent-activity-log.md` (LR-028)
- Mark `GATE: /reflect + LR-028` as completed

## Rules
- Step 0 is NON-NEGOTIABLE — gates must be created before any task work
- NEVER rubber-stamp the adversarial audit — find real issues or argue convincingly why there are none
- NEVER skip gate verification — Step 5 catches dropped gates
- If context compression happens mid-session, the TodoWrite gates survive (external state)
