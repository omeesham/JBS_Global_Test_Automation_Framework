---
name: planning
description: Create a rigorously audited implementation plan — explores codebase, drafts plan, runs validation checklist, reviews against original intent, then saves to plans/pending/. Use when user says "plan", "design", "how should we".
user-invocable: true
auto-calls: research
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite
---

# /planning — Rigorous Plan Creation Workflow

When the user invokes `/planning`, follow this exact workflow. Do NOT skip steps.

## When to Use

**Identity**: OWNER. Auto-loaded via Identity Gate.

- User says "plan", "design", "how should we", "create a plan", "approach"
- User describes a feature or change without saying "just do it"
- Complex multi-file changes that need thought before execution

## Input
The user will describe what they want planned. If their description is vague, ask HIGH-IMPACT clarifying questions before proceeding.

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/planning`. No-op if compatible identity active.

## Step 0: Research (if unfamiliar territory)

Auto-call `/research` if the topic involves:
- Technology or patterns not yet used in this codebase
- External APIs or services you haven't worked with
- Architecture decisions with multiple valid approaches
- Anything where "I think this is how it works" — look it up

**Skip** if the topic is purely internal refactoring of well-understood code.

## Step 1: Explore
- Use Explore agents (up to 3 in parallel) to understand the codebase areas relevant to the request
- Identify existing patterns, utilities, and conventions that must be respected
- Map out all files that would be affected

## Step 2: Draft the Plan
Write an initial plan covering:
- **Context**: Why this change is needed, what prompted it, intended outcome
- **Changes**: Specific files, specific lines, exact before/after where possible
- **NOT touched**: Files explicitly excluded and why
- **Verification**: How to test the changes end-to-end

## Step 3: Validation Pass

Complete this checklist in a single pass. Fix any issues found before proceeding to Step 4.

- [ ] **Reference check** — Open the most recent completed plan in `plans/done/` for the same category. Compare section-by-section. Flag any section present in the reference that's missing in yours. If no reference exists, use the most complex completed plan as baseline.
- [ ] **Rules applied** — For each rule listed in your plan's "Active Rules" section (or equivalent), verify it's actually reflected in the plan body (implementation steps, code snippets, or explicit exclusion with reason). Rule listed but not applied = gap.
- [ ] **Mistakes check** — Grep for the target page/module name in `specs_planning/_internal/agent-mistakes.md`. Read every hit. Verify none of the documented mistakes are repeated in your plan. Also grep for any function names or patterns your plan proposes to use.

## Step 4: Intent Review
- Re-read the user's original request word by word
- Compare every claim in the plan against the actual codebase (verify, don't assume)
- Confirm the plan actually delivers what was asked — not more, not less

## Step 5: Save
- Determine the next plan number by checking `plans/pending/` and `plans/done/` for the highest existing PLAN_XX number
- Save the final plan to `plans/pending/PLAN_XX_<DESCRIPTIVE_NAME>.md`
- Present a concise summary to the user

## Auto-Calls

- `/research` — Step 0, before exploration, when unfamiliar territory is involved

## Output

- Saved plan file in `plans/pending/PLAN_XX_<NAME>.md`
- Concise summary presented to user (context, key changes, verification approach)

## Rules
- NEVER skip the validation pass checklist — all 3 items are mandatory
- NEVER assume — verify by reading actual files
- Internal variable names are NOT user-facing — don't change them unless explicitly needed
- Keep the plan surgical — minimum changes for maximum effect
- If the plan touches more than 10 files, ask the user if the scope is right before saving
