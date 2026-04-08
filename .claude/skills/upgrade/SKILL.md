---
name: upgrade
description: Self-referential improvement gate — after creating/modifying any rule, skill, or pattern, checks if it applies to current session work. Prevents "I just wrote a rule I'm violating right now." Use after rule creation or say "/upgrade".
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, TodoWrite
---

# /upgrade — Self-Referential Meta-Improvement

Checks whether a newly created or modified rule/skill/pattern applies to the CURRENT session's work. Prevents the pattern where an agent creates a rule then immediately violates it in the same session.

## When to Use

**Identity**: ALL. No identity restrictions.

- User says `/upgrade`, "upgrade check", "does this apply to what we're doing"
- Embedded as Step 4.5 inside `/reflect` (after writing to agent-mistakes.md)
- Embedded as final step inside `/compile-learnings` (after graduating a pattern)
- During `/execute` Phase 3 post-audit, if new learnings were discovered

## Identity Gate
None — this is a utility skill available to all identities.

## Trigger Conditions

Auto-activate (within /reflect or /compile-learnings) when ANY of these happen:

1. New entry added to `agent-mistakes.md`
2. New LR-XXX proposed or graduated
3. New skill created or existing skill modified
4. New pattern added to `patterns.md`
5. New feedback memory saved

## Step 1: Capture the New Thing

Extract three properties from what was just created/modified:

- **RULE**: What to do or not do (the instruction itself)
- **TRIGGER**: When does it apply? (condition that activates the rule)
- **SCOPE**: Which files, patterns, or code structures does it affect?

## Step 2: Scan Current Work

Gather the current session's active work:

1. Read active TodoWrite items (what's in progress or pending?)
2. Read the current plan (if executing one)
3. Check recently modified files (`git diff --name-only`)
4. Recall the current conversation's task description

## Step 3: Match

For each active work item, check:

- Does the new rule's TRIGGER condition match this work item?
- Does the new rule's SCOPE overlap with files being modified?
- Would applying this rule CHANGE anything about the current work?

Classify each work item as:

| Classification | Meaning |
|---|---|
| **APPLY NOW** | Rule applies and current work doesn't comply |
| **ALREADY COMPLIANT** | Rule applies but current work already follows it |
| **NOT APPLICABLE** | Rule doesn't apply to this work item |

## Step 4: Report

```
/upgrade check: [rule/skill/pattern name]

Current work items scanned: N
Matches found: M

APPLY NOW:
  - TC-018 cleanup (spec.ts:220) — missing try/finally per new rule
  - TC-020 cleanup (spec.ts:280) — same pattern, same fix needed

ALREADY COMPLIANT:
  - TC-021 cleanup (spec.ts:310) — already has try/finally

NOT APPLICABLE:
  - REQUIREMENTS.md fix — documentation, not code
```

## Step 5: Apply or Document

- For each **APPLY NOW** item: add a `[/upgrade:fix]` TodoWrite entry
- For each **NOT APPLICABLE** item: one-line reason logged (not saved permanently)
- The agent DECIDES whether to act on flags — `/upgrade` does not auto-fix

## Key Design Decision: Lightweight, Not Blocking

`/upgrade` is a CHECK, not a GATE. It flags but doesn't block. The agent decides whether to act on the flags. This prevents infinite loops (rule creates rule creates rule...).

## Output

The report from Step 4, plus any new TodoWrite items added in Step 5.

## Rules

- NEVER create infinite loops — `/upgrade` does NOT trigger itself
- NEVER block execution — flag only, agent decides whether to act
- NEVER apply to past sessions — only current active work
- Keep the scan lightweight — TodoWrite + git diff, not full codebase grep
- If no current work exists (session just started), skip silently
