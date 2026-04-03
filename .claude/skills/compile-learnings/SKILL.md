---
name: compile-learnings
description: Scan agent-mistakes.md for patterns with 3+ occurrences, graduate recurring patterns into permanent CLAUDE.md rules and decision trees. Periodic skill — run weekly or when flagged by /reflect.
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, Write, Edit
---

# /compile-learnings — Pattern Graduation

Turns recurring mistakes into permanent rules. Without this, the same mistakes get logged over and over but never graduate into enforceable project-wide rules. This is the learning loop that makes the system compound.

## When to Use

**Identity**: OWNER, WATCHDOG. Incompatible identity triggers a warning — see `/identity`.

- **Periodic**: Weekly or when mistake files grow large
- **Flagged**: `/reflect` found graduation candidates (3+ occurrences)
- **Manual**: user says "compile learnings", "graduate patterns", "clean up mistakes", "what patterns are recurring"

## Steps

### Step 1: Read the Mistake Registry

Read `specs_planning/_internal/agent-mistakes.md` fully. Parse every entry — ID, rule, learning/resolution.

### Step 2: Cluster by Similarity

Group entries that share the same **root cause** or **violated principle**:
- Same type of mistake (e.g., "assumed file existed without checking" appears in R-03, R-11, R-17)
- Same area of code (e.g., multiple selector-related mistakes)
- Same behavioral pattern (e.g., "skipped verification step")

### Step 3: Identify Graduation Candidates

A pattern qualifies for graduation when it has **3 or more occurrences** in the registry.

For each candidate:
1. **Extract the core principle** — state it as a positive, actionable rule (not "don't do X" but "always do Y")
2. **Identify the scope** — does this apply to all agents (ALL), Claude Code only (CC), or specific pipeline agents?
3. **Draft the permanent rule** — one clear sentence + the "why" from the mistakes that spawned it

### Step 4: Graduate to Permanent Rules

For each graduated pattern:

1. **Add to `CLAUDE.md`** (repo root) under a "Learned Rules" section:
   ```
   - [RULE]: [one-sentence rule] — graduated from [R-XX, R-YY, R-ZZ]
   ```

2. **If agent-specific**, also add to the relevant `.github/agents/*.agent.md` file

3. **Mark source entries** in agent-mistakes.md with `[GRADUATED → CLAUDE.md]` tag so they're not re-processed

### Step 5: Build Decision Trees

Create or update `.claude/context/patterns.md` with practical decision trees:

```markdown
## Pattern: [name]
**When you see**: [trigger condition]
**Do**: [correct action]
**Because**: [why — from the mistakes that taught this]
**Graduated from**: R-XX, R-YY, R-ZZ
```

## Auto-Calls

None — this is a standalone periodic utility.

## Output

```
## Learning Graduation Report

### Mistake Registry Stats
- Total entries scanned: [N]
- Already graduated: [count]
- Active (not graduated): [count]

### Patterns Found (3+ occurrences): [count]
1. [Pattern name] — [count] occurrences (R-XX, R-YY, R-ZZ)
   Rule: [the graduated rule]
2. ...

### Actions Taken
- Graduated to CLAUDE.md: [count] rules
- Decision trees created/updated: [count]
- Agent-specific rules added: [count] (to which agents)
- Entries marked graduated: [count]

### Files Modified
- [list of files changed]
```
