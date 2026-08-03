---
name: compile-learnings
description: Scan agent-mistakes.md for patterns with 3+ occurrences, graduate recurring patterns into permanent rules (.claude/rules/ or docs/read_only_docs/LEARNED_RULES.md) and decision trees. Periodic skill — run weekly or when flagged by /reflect.
user-invocable: true
auto-calls: identity
tools: Read, Glob, Grep, Write, Edit
---

# /compile-learnings — Pattern Graduation

> **LR lookup / write**: when reading existing `LR-NNN` rules OR graduating a new rule, check the right home. Path-scoped framework rules live in `.claude/rules/<topic>.md` (angular, specs, hooks-identity, browser-tool, pipeline, baseline, data, inventory) — they auto-load on matching file edits. Cross-cutting framework rules live in `docs/read_only_docs/LEARNED_RULES.md`. Client-specific rules (e.g., Encore page/Jira/URL naming) live in `clients/${ACTIVE_CLIENT}/CLAUDE.md` with `LR-ENC-NNN` prefix. Stack-generic patterns (Angular/Radix/Playwright) graduate to the matching `.claude/rules/<topic>.md` file as `LR-NNN`; cross-cutting patterns (handoff discipline, networkidle ban, activity-log) graduate to `docs/read_only_docs/LEARNED_RULES.md`. Root `CLAUDE.md` is the orientation layer and does NOT host LR bodies anymore.

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

### Step 3.5: Worker-Lane Scan

After scanning the CEO mistake pile (Steps 1–3), scan worker agent lesson files:

1. Read `~/.copilot/agents/*.agent.md` — for each file, locate the `## Lessons` (or `§ Lessons`) section and parse every lesson entry.
2. Group entries across all agent files by **root cause** — same rule violated, same class of error.
3. **Graduation threshold**: any pattern recurring **3 or more times** across agent files graduates to `~/.claude/delegation/worker-primer.md` (the universal worker primer from LCD_01).
4. **Never-graduate rule (HARD CONSTRAINT)**: Worker-lane lessons **must NEVER** be written to `CLAUDE.md`, `LEARNED_RULES.md`, `feedback_*.md`, or any CEO-loaded file. The graduation target is always `worker-primer.md`. Violating this re-pollutes the CEO context window.
5. After graduating a worker lesson, prune the matching verify-pointer from `dispatcher-lessons.md` — the pointer's purpose was verification until graduation; once graduated it is redundant. Example pointer that may be pruned after graduation:
```
VERIFY-POINTER: LR-036 boolean rendering; worker must: MCP-verify per table before writing boolean-column reader; check: VERIFY_ARTIFACTS
```
6. Mark graduated entries in the agent file with `[GRADUATED → worker-primer.md]` tag so they are not re-processed.

### Step 4: Graduate to Permanent Rules

For each graduated pattern:

1. **Pick the right home**:
   - Path-scoped pattern (Angular forms, spec discipline, hooks/identity, browser tool, pipeline closure, baseline-truth, coding hygiene, field-inventory) → `.claude/rules/<topic>.md` — append the rule body and (if needed) widen the `paths:` glob.
   - Cross-cutting pattern (anything that applies across many file classes or to session-level discipline) → `docs/read_only_docs/LEARNED_RULES.md`.
   - Client-specific pattern → `clients/${ACTIVE_CLIENT}/CLAUDE.md` with `LR-{CLIENT}-NNN` prefix.
   Use the format: `### LR-NNN: [one-sentence headline]` followed by body + `**Trigger**:` + `**Graduated from**:` lines.

2. **If agent-specific**, also add to the relevant `.claude/agents/{ROLE}.md` Rule registry section.

3. **Mark source entries** in agent-mistakes.md with `[GRADUATED → <target-file>]` tag so they're not re-processed.

4. **S0/S1 graduation target** — defaults to a MECHANISM (hook / CI check / default-change). Prose-only graduation for an S0/S1 pattern requires an explicit un-gateable rationale recorded in the LR rule body. S2 → detective script; S3 → prose (per §3.1, `.claude/rules/guardrail-policy.md`).

**Demotion review** (run at each `/compile-learnings` cadence — reads `.claude/state/gate-fires.log`):
- deny-gate with 0 fires in 90 days AND no class recurrence → demote to `announce`
- announce-gate with 0 fires in 90 days → demote to prose-only LR rule
- ≥3 confirmed false positives in 30 days → demote + fix or delete the gate
- Dead gates with no fire telemetry → delete

### Step 4.5: Uplink graduation loop (UPLINK_DOCTRINE §6 ratchet)

Scan `~/.claude/delegation/uplink-ledger.jsonl` for consult signatures. Any **question signature recurring ≥3 times** graduates — the Oracle's repeated answer becomes a standing document that permanently kills the question:

1. Group ledger rows by `signature`; count occurrences per signature.
2. For each signature with count ≥3, promote the cached answer to the **cheapest home that permanently answers it**:
   - worker-specific recurring mistake → a lesson line in the offending `~/.copilot/agents/<name>.agent.md`
   - recurring ticket-shape ambiguity → a line in `~/.claude/delegation/ticket-template.md`
   - recurring "how to ask / what to check" → a rule in `~/.claude/delegation/ASKING_DOCTRINE.md`
   - cross-cutting principle → a full `LR-NNN` graduation (Step 4 homes)
3. Note the graduation so the signature is not re-processed (append a `graduated:<target>` marker or record it in the ledger).

**Prime law**: every consult must lower the probability of the next consult. A flat consult count across 3 `scorecard.mjs report` runs (the §6.1 alarm) means this loop is not running — fix it. This is the capability ratchet running UPWARD (the weak tier absorbs judgment), the mirror of the routing matrix graduating models downward. Claude→Rutvik asks graduate the same way (3× the same ask signature → into memory/rule) so Rutvik is never asked the same question twice.

### Step 4.6: Size-Cap Enforcement

Run after graduation (Steps 4 and 3.5) to keep lesson files within bounds:

| File | Cap | Overflow action |
|---|---|---|
| `~/.claude/delegation/dispatcher-lessons.md` | ≤ 30 verify-pointer lines | Prune oldest pointers (underlying lesson stays in agent file) |
| Per-agent `~/.copilot/agents/*.agent.md` § Lessons | ≤ 20 entries | Graduate most-common entries to `worker-primer.md`, then prune the agent file |
| `~/.claude/delegation/worker-primer.md` | ≤ 80 lines total | Archive overflow to `~/.claude/delegation/worker-primer-archive.md`, retain the 80 most-recent lines |

Check each file's line/entry count after graduation. If any file exceeds its cap, apply the overflow action before declaring this skill done.

### Step 4.7: § Pruning Check

After size-cap enforcement (Step 4.6), run bloat metric checks against the thresholds defined in `~/.claude/delegation/pruning-policy.md`:

| Metric | Path | Threshold |
|---|---|---|
| plans/pending/ file count | `plans/pending/*.md` | 40 |
| dispatcher-lessons.md line count | `~/.claude/delegation/dispatcher-lessons.md` | 30 |
| worker-primer.md line count | `~/.claude/delegation/worker-primer.md` | 80 |
| Per-agent § Lessons entry count | `~/.copilot/agents/*.agent.md` | 20 per file |
| reports/ file count | `~/.claude/delegation/reports/` | 50 |
| ua-worker/ directory count | `~/.claude/state/ua-worker/` | 100 |
| Memory body files (feedback_*.md) | `~/.claude/projects/<project-slug>/memory/feedback_*.md` ¹ | 60 |

_¹ project-slug is derived at runtime from the repo root path (replace `:`, `\`, `/` with `-`); never hardcoded._

**If any metric exceeds its threshold:**

1. Emit a candidate list to the session log — files/entries eligible for archival per the policy's archive semantics and never-prune guards.
2. Run `scripts/prune-check.mjs` on each candidate to confirm zero live references before listing.
3. Append a dated row to `~/.claude/delegation/pruning-log.md`:
   ```
   | <date> | <metric> | <current-value> / <threshold> | <candidate-count> | awaiting-confirmation |
   ```

**Rutvik confirmation REQUIRED before any archival — no autonomous deletion ever.**

Delegation state retention rules for `~/.claude/delegation/` (full table in `pruning-policy.md`):

| File / Dir | Rule |
|---|---|
| `ledger.jsonl` | NEVER prune — append-only audit log |
| `reports/` | Retain 50 most recent; archive older by mtime |
| `self_incidents.log` | NEVER prune — audit evidence |
| `grants-audit.log` | NEVER prune |
| `stall-queue/` | Prune bounce tickets older than 7 days (ephemeral) |
| `session-role.json` | Overwritten per session — no growth, no action needed |
| `session-bash-nudges.json` | Prune entries older than 30 days |

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
- Graduated to .claude/rules/ or docs/read_only_docs/LEARNED_RULES.md: [count] rules
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
