---
name: compile-learnings
description: Scan agent-mistakes.md for patterns with 3+ occurrences, graduate recurring patterns into permanent CLAUDE.md rules and decision trees. Periodic skill — run weekly or when flagged by /reflect.
user-invocable: true
auto-calls: identity
tools: Read, Glob, Grep, Write, Edit
---

# /compile-learnings — Pattern Graduation

> **LR lookup / write**: when reading existing `LR-NNN` rules OR graduating a new rule, check the right home. Path-scoped framework rules live in `.claude/rules/<topic>.md` (angular, specs, hooks-identity, browser-tool, pipeline, baseline, data, inventory) — they auto-load on matching file edits. Cross-cutting framework rules live in `docs/read_only_docs/LEARNED_RULES.md`. Client-specific rules (e.g., Encore page/Jira/URL naming) live in `clients/${ACTIVE_CLIENT}/CLAUDE.md` with `LR-ENC-NNN` prefix. Stack-generic patterns (Angular/Radix/Playwright) graduate to the matching `.claude/rules/<topic>.md` file as `LR-NNN`; cross-cutting patterns (handoff discipline, networkidle ban, activity-log) graduate to `LEARNED_RULES.md`. Root `CLAUDE.md` is the orientation layer and does NOT host LR bodies anymore.

Turns recurring mistakes into permanent rules. Without this, the same mistakes get logged over and over but never graduate into enforceable project-wide rules. This is the learning loop that makes the system compound.

## When to Use

**Identity**: OWNER, WATCHDOG. Auto-loaded via Identity Gate.

- **Periodic**: Weekly or when mistake files grow large
- **Flagged**: `/reflect` found graduation candidates (3+ occurrences)
- **Manual**: user says "compile learnings", "graduate patterns", "clean up mistakes", "what patterns are recurring"

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/compile-learnings`. No-op if compatible identity active.

## Steps

### Step 1: Read the Mistake Registry

Read `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` fully. Parse every entry — ID, rule, learning/resolution.

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

1. **Pick the right home**:
   - Path-scoped pattern (Angular forms, spec discipline, hooks/identity, browser tool, pipeline closure, baseline-truth, coding hygiene, field-inventory) → `.claude/rules/<topic>.md` — append the rule body and (if needed) widen the `paths:` glob.
   - Cross-cutting pattern (anything that applies across many file classes or to session-level discipline) → `docs/read_only_docs/LEARNED_RULES.md`.
   - Client-specific pattern → `clients/${ACTIVE_CLIENT}/CLAUDE.md` with `LR-{CLIENT}-NNN` prefix.
   Use the format: `### LR-NNN: [one-sentence headline]` followed by body + `**Trigger**:` + `**Graduated from**:` lines.

2. **If agent-specific**, also add to the relevant `.claude/agents/{ROLE}.md` Rule registry section.

3. **Mark source entries** in agent-mistakes.md with `[GRADUATED → <target-file>]` tag so they're not re-processed.

### Step 5: Build Decision Trees

Create or update `.claude/context/patterns.md` with practical decision trees:

```markdown
## Pattern: [name]
**When you see**: [trigger condition]
**Do**: [correct action]
**Because**: [why — from the mistakes that taught this]
**Graduated from**: R-XX, R-YY, R-ZZ
```

## Post-Graduation: Upgrade Check

After graduating any pattern to a permanent LR rule, run `/upgrade` logic inline:

1. For each newly graduated LR rule, extract its TRIGGER and SCOPE
2. Scan current session's active work (TodoWrite items, recently modified files)
3. Check: does this new LR rule apply to anything in the current session?
4. If yes: flag as `APPLY NOW` — fix before session ends
5. If no: note why and move on

This ensures newly graduated rules are immediately applied, not just saved for future sessions. See `/upgrade` SKILL.md for full methodology.

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


## Verification Artifact (D23)

Before declaring this skill done, emit one runnable / readable check the user (or next session) can re-run to confirm the output:

- File path + expected content (e.g., `plans/pending/X.md exists with **Status**: Pending`)
- Bash command + expected output (e.g., `git diff --stat ...` shows N files)
- Test command (e.g., `npm run typecheck`, `npx tsc --noEmit`)
- Or a structured expected-output template (≤10 lines)

Verification artifact ≠ prose summary. It is a runnable / readable check that confirms the skill's output. Without it, the work is unaudítable. Anthropic cupcake §786-793 — single highest-leverage tactic for AI-built artifacts.
