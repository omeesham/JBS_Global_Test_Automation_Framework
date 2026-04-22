---
name: final-q
description: Final-question audit before any "done" claim. Reconstruct the original todo list, tag every item with a one-word status (done/partial/skipped/deferred/failed/ignored), flag gaps honestly, and gate on context-budget thresholds (400k soft / 500k hard). Use before ending a session, when wrapping up, or when the user says "final-q", "are you really done", "audit todos".
user-invocable: true
auto-calls: none
tools: TodoWrite, Read, Bash
---

# /final-q — Final Question: Are You Really Done?

> **Core rule (embedded, not referenced)**: Never emit the words "done", "completed", "finished", "all set", "all tasks", or equivalent claims until this skill has run and the verdict is GREEN. If YELLOW, phrase as "mostly done — N items deferred/skipped". If RED, phrase as "not done — see audit". Honesty beats optimism.

## When to Use

**Identity**: ALL. No identity restrictions.

- Before ending any non-trivial session
- Before claiming "done" on any multi-step task
- Before writing a handoff
- When context approaches 400k tokens
- When user says "final-q", "are you really done", "final question", "audit todos"
- Auto-invoked by the Stop hook when completion phrases are detected

## Anti-Over-Engineering Principle

Goal: solve the honesty problem, not engineer ceremony.

- No elaborate verification cascades. A table + a verdict is enough.
- Don't invent new statuses. Use the 7 below. Pick the one that fits.
- Don't run more bash commands than necessary to answer the audit.
- Don't write files. Output goes in chat.
- If the session was genuinely trivial (1 obvious item, zero ambiguity, zero skips, under 10 minutes), output `TRIVIAL — no audit` and stop.

## Steps

### Step 1: Entry Gate

Before doing anything, ask:
- Was this session a single trivially-completable task? (typo fix, 1-line edit, answer a yes/no question)
- Were there zero skips, deferrals, or failures?
- Was the outcome unambiguously verifiable in one glance?

If YES to all three → output `TRIVIAL — no audit needed` and exit. Do not run the rest of the skill.

Otherwise → proceed to Step 2.

### Step 2: Reconstruct the Todo List

Build the full list of tasks, in order:

1. **Original todos** — from the user's opening prompt of this task. Read the first user message that kicked off the work. Extract every explicit ask + every implied must-do (e.g., "do all due diligence like index, etc" → reindex + activity log + preflight).
2. **Mid-session additions** — tasks added via TodoWrite during the session, or corrections the user made ("wait, also do X").
3. **Self-added housekeeping** — if you added internal steps (e.g., "read file before edit"), list only the user-visible outcome, not the internal mechanic.

Cap the list at 20 items. If more, group adjacent items.

### Step 3: Tag Every Item

For each item, assign EXACTLY ONE tag from this closed list:

| Tag | Meaning |
|---|---|
| `done` | Fully completed. Output is verifiable right now. |
| `partial` | Started, produced some output, not fully finished. |
| `skipped` | Intentionally not done (user directive or scope call). |
| `deferred` | Pushed to another session / subplan / BUG / spawned task. |
| `failed` | Attempted, broke, not recovered. |
| `ignored` | Forgot / overlooked / never got to it. |
| `screwed` | Did it wrong; output exists but is incorrect. |

Rules:
- If the work landed but has a known flaw → `screwed`, not `done`.
- If you meant to do it but didn't → `ignored`, not `deferred`.
- `deferred` requires a named recipient (next-session handoff, specific subplan, BUG-*, spawned task). No named recipient = `ignored`.
- No item gets zero tags. No item gets two tags.

### Step 4: Annotate Every Non-`done`

For each `partial`/`skipped`/`deferred`/`failed`/`ignored`/`screwed`, add ONE short sentence explaining what happened. Plain English. No jargon. No excuses — state the fact.

Good: `"row 155 preflight violation remains — my edit to D1 advanced its mtime past a prior row's claim"`
Bad: `"non-ideal outcome due to temporal ordering constraints in the activity log subsystem"`

### Step 5: Estimate Context Budget

Check the session's context usage. You do NOT have a direct API for the token count; estimate from:
- Approximate conversation length (number of messages, size of tool outputs kept in context)
- Any `/context` or `/cost` invocations visible in the transcript
- User-provided numbers if they mention them

Classify into one of three bands:

| Band | Range | Rule |
|---|---|---|
| GREEN | < 400k | Safe. Continue taking new work freely. |
| YELLOW | 400k–500k | Caution. Finish in-flight items. Do NOT take new work that could push past 500k. Recommend handoff if more work remains. |
| RED | > 500k | **HARD STOP.** Do not continue without explicit user approval. |

If RED:
1. Stop all new tool calls immediately.
2. Output a clear "HARD STOP: context ~Xk, above 500k ceiling."
3. Summarize remaining work.
4. Ask the user: "Continue this session (explicit approval needed), hand off to new session, or stop here?"

If YELLOW and the user hasn't explicitly authorized going higher:
- Finish in-flight item only.
- Ask the user BEFORE taking any new work: "Context ~Xk. More work would risk the 500k ceiling. Continue or hand off?"

Going above 400k without explicit user permission is a violation. Going above 500k is a framework-level error.

### Step 6: Verdict

One of three:

- **GREEN** — every item `done`, budget in green band. Stop is OK. Output the table + "Verdict: GREEN. Stop OK."
- **YELLOW** — some non-`done` items, but explainable / expected / user-directed. Budget still green or yellow. Output the table + "Verdict: YELLOW. [one-line summary of gaps]."
- **RED** — significant fuckups (multiple `ignored`/`failed`/`screwed`) OR budget red. DO NOT claim done. Output the table + "Verdict: RED. [top gaps]. Handoff required."

### Step 7: Handoff (only if YELLOW or RED)

If the verdict is YELLOW with deferrable items, or RED, produce a self-contained handoff block the user can paste into a new session. Handoff goes in CHAT, not in any file (per `feedback_handoff_in_chat_only.md`).

Handoff format:

```
HANDOFF FOR NEW SESSION
=======================
Context: [2-3 sentences — what the prior session was doing, why it stopped]
Outstanding work:
  1. [task] — [what needs to happen, files involved, any known gotchas]
  2. [task] — ...
Verification when done: [how to check the work landed]
Budget note: [if prior session hit yellow/red, warn new session to start clean]
First action for new session: [exact command or skill to invoke]
```

Rules for handoff content:
- Describe outcomes and next actions. Do NOT describe blockers or past failures as if they're current (per `feedback_handoff_no_blockers.md`, LR-039).
- Include file paths so the new session can act cold.
- No backticks mentioning prior session's attempts — new session re-tests simplest path first.

### Step 8: Output

Emit exactly this structure:

```markdown
## /final-q audit

| # | Task | Status | Note |
|---|------|--------|------|
| 1 | ... | done | — |
| 2 | ... | screwed | [one sentence] |

**Budget**: ~Xk tokens (GREEN / YELLOW / RED)
**Verdict**: GREEN / YELLOW / RED — [one-sentence summary]
```

If YELLOW or RED, append the handoff block below.

No preamble. No closing pleasantries. Just the audit.

## Examples

### Example 1 — Simple GREEN

User: "fix the typo in the README"
Agent: [edits file]

Entry gate → trivial (1 item, 1 edit, zero skips). Output: `TRIVIAL — no audit needed.` Stop.

### Example 2 — Realistic YELLOW

User: "install TC authoring rules across all hist subplans and do all due diligence"

```markdown
## /final-q audit

| # | Task | Status | Note |
|---|------|--------|------|
| 1 | Create canonical rules doc | done | — |
| 2 | Record new subplan in plans/done/ | done | — |
| 3 | Patch 13 TC-authoring subplans | screwed | HALT block says "Phase 0 grep" but subplans have no Phase 0 step |
| 4 | Patch SP-J audit gate | done | — |
| 5 | Update master plan + reindex | done | — |
| 6 | Activity-log row | partial | row 155 violation persists from my D1 edit |
| 7 | Commit changes | ignored | held off, user didn't authorize |
| 8 | Patch SP-E-* bug-filing subplans | skipped | out of scope by design |

**Budget**: ~180k tokens (GREEN)
**Verdict**: YELLOW — 3 gaps; 2 need action, 1 is design-scope.
```

Followed by a handoff block listing the 3 gaps and exact fix commands.

### Example 3 — RED

Multiple failed edits, budget at 520k, user's original ask still not started.

```markdown
## /final-q audit
...table showing mostly `failed`, `ignored`, `screwed`...

**Budget**: ~520k tokens (RED — above 500k ceiling)
**Verdict**: RED — hard stop. Primary ask (schema migration) never started. 4 failed attempts at prerequisite edits.

HARD STOP reason: context above 500k. Continuing without permission is a framework violation.
Asking user: continue this session with explicit approval, or hand off to new session?
```

## Integration

- **Stop hook** at `.claude/hooks/final-q-gate.sh` detects completion phrases in the last ~80 transcript lines and blocks stop with a reminder to run /final-q if no recent /final-q invocation is found.
- **Registered** in `.claude/settings.json` under `hooks.Stop`.
- **Chain orchestration** — when invoked inside a `/chain` background session, `chain-orchestrator.sh` (second Stop hook) parses this skill's output to decide whether to auto-advance. Parse rule (D23 in [PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md](../../../plans/pending/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md)): find the LAST `## /final-q audit` heading in the transcript, then scan the next 30 lines for `^\*\*Verdict\*\*:[[:space:]]*(GREEN|YELLOW|RED)`. Missing audit heading or missing Verdict line → chain pauses with `verdict-NONE`. ALWAYS emit the full audit block — prose mentions of "verdict" outside the audit heading are intentionally ignored.
- **Never auto-calls other skills** — /final-q is a leaf. It reports, it doesn't fix.
- **Never writes files** — output goes in chat only.
- **Never commits** — not in scope.

## What /final-q is NOT

- Not a replacement for `/reflect` (which captures learnings for future sessions). /final-q is session-end completeness only.
- Not `/audit` (which is full-chain execution audit of prior plan work). /final-q audits THIS session's todo list only.
- Not `/regression-guard` (which snapshots code). /final-q is task completeness, not code diff.
- Not a planning tool. It does not design future work; it describes current state.

## Failure modes to avoid

1. **Rubber-stamping** — marking everything `done` because you want to leave. Re-check each item's actual output. If you can't point at the verifiable output, it's not `done`.
2. **Euphemizing** — "minor outstanding item" = `ignored` or `screwed`. Call it what it is.
3. **Silent skips** — every `skipped`/`deferred` needs a one-sentence reason. No bare tags.
4. **Made-up budget numbers** — if you genuinely can't estimate, say so. Don't fabricate a token count.
5. **Ceremony** — if this skill's output exceeds 40 lines for a normal session, you're over-engineering. Trim.
