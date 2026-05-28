---
name: final-q
description: Final-question audit before any "done" claim. Reconstruct the original todo list, tag every item with a one-word status (done/partial/skipped/deferred/failed/ignored), flag gaps honestly, and gate on context-budget thresholds (400k soft / 500k hard). Use before ending a session, when wrapping up, or when the user says "final-q", "are you really done", "audit todos".
user-invocable: true
auto-calls: none
tools: TodoWrite, TaskCreate, TaskUpdate, TaskList, Read, Bash
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

### Step 4.5: Claim-vs-Artifact Cross-Check (MANDATORY — anti-rubber-stamp)

**The #1 failure mode of self-review is checking what's easy (frontmatter, paths exist) instead of what matters (do my stated claims match the produced artifacts?).** This step forces the hard check.

For every **specific claim** you made to the user during this session that names a concrete fact — file count, sort order, execution sequence, dependency chain, exact line numbers, exact paths, numeric results — **grep / read the actual artifact and compare**. If claim ≠ artifact, the item is `screwed`, not `done`. No exceptions.

Claims that trigger this check (non-exhaustive):
- "X runs before Y" / "the order is A→B→C" → read the actual sort output, don't trust the plan file's prose.
- "N files modified" → `git diff --stat` or `git status` and count.
- "file X exists at path Y" → `ls` / `Read` the exact path.
- "INDEX shows Z at top" → read INDEX directly, don't infer from "I wrote it that way."
- "LR-041 frontmatter present on all subplans" → grep every one, not just spot-check.
- "dependency chain is X → Y → Z" → confirm each subplan's `**Depends on**` field actually says so.

Heuristic: if your initial gut-review sounds like "looks good, nothing to fix" and took under 30 seconds, you rubber-stamped. Redo Step 4.5 with actual tool calls.

If the user flagged a potential issue, NEVER dismiss it without first running the exact check that would disprove their flag. User-flagged + agent-dismissed-without-check = automatic `screwed` for that item.

**MANDATORY cross-check — `.claude/state/hook-failures.log`** (SP02B): always run

```bash
grep "$(date -u +%FT)" .claude/state/hook-failures.log 2>/dev/null | wc -l
```

(or equivalent — scope to the current session's date or, better, since the session start). If non-empty, the TodoWrite gate (or another fail-OPEN hook) silently logged a failure during this session — that's a silent-bug signal. Emit a Cross-check row in the format below; verdict floor becomes **YELLOW**:

> Cross-check: hook-failures.log clean for this session → ran 'grep "$(date -u +%FT)" .claude/state/hook-failures.log | wc -l' → output: 'N hits' → mismatch (if N>0) → YELLOW floor (silent hook bug detected — investigate before next /execute).

Output: one line per claim that was cross-checked, in this **evidence-emission** format (v2 — supersedes the v1 prose-only format that allowed rubber-stamping):

> Cross-check: [claim] → ran '<exact command>' → output: '<output snippet OR "N hits found at lines …" OR "0 hits">' → [match / mismatch] → [tag]

Format rules (mandatory — no exceptions):

- The `ran '<command>'` clause is REQUIRED. The exact command (`grep -n ...`, `ls -la <path>`, `cat <file> | head`, `git diff --stat`, etc.) must appear verbatim. Any prose-only attestation ("I checked that..." / "looks like..." / "I would have run...") = **incomplete cross-check**.
- The `output: '<...>'` clause is REQUIRED. Either a literal snippet of the command's output, or a quantified summary (`"3 hits found at lines 12, 47, 102"` / `"0 hits"` / `"file exists, 1234 bytes"`). Empty `output: ''` or `output: '<see above>'` = **incomplete cross-check**.
- Any cross-check row that is incomplete (missing `ran` clause OR missing/empty `output:` clause OR contains "I would have run X" prose) → the related table row is **forced to `screwed`**, and the verdict floor becomes **RED**.
- Any `mismatch` row forces a Verdict of **YELLOW minimum** (RED if ≥2 mismatches).

**Why this format change** (2026-04-27): v1 self-attestation (`Cross-check: [claim] → [artifact read] → match → done`) was rubber-stampable — the SP-DQU-03 second `/final-q` claimed "scope-pushed to Track G subplans → match → done" without ever running the grep; user-prompted post-hoc grep returned 0 hits. v2 evidence-emission forces actual command execution, because fabricating `ran '...'` + `output: '...'` requires materially more effort than fabricating a prose verdict. See `plans/done/PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md` (Plan B / superseded into PLAN_CC_ANTHROPIC_ALIGNMENT) for full RCA.

**Backward compat**: `parse-verdict.mjs` accepts both v1 and v2 formats so historical `chain-sessions-green/` transcripts still parse. New `/final-q` invocations from 2026-04-27 onward MUST emit v2.

### Step 4.5: Plan Closure Gate (LR-055)

Per active plan that was touched in this session:

1. Run `node scripts/validate-plan-closure.mjs --plan <file> --enforce --json` — READ-ONLY validation, no manifest written.
   Emit: `ran 'node scripts/validate-plan-closure.mjs --plan <file> --enforce --json' → output: 'status: PASS|FAIL'`
2. Read all `.claude/state/closure-attempts/<plan>-<YYYY-MM-DD>.json` within 6h of session. Any blocked attempts → note in cross-checks.
3. Read `.claude/state/closure-fail-closed-counter-<plan-basename>.json` (V5). Non-zero count → RED floor (any fail-closed event is RED; no grace).
4. Run `node scripts/validate-plan-layout.mjs --check`. Non-zero exit → RED floor.

### Step 4.6: Per-identity matrix delivery audit (LR-048 v3 / C6)

If this session touched a plan/subplan that has a `## Per-Identity Satisfaction` matrix, append a **Per-identity matrix delivery audit** sub-table to the Step 8 output — one row per identity, verifying each Concrete Deliverable cell resolves:

| Identity | Concrete deliverable cell | Verification | Result |
|---|---|---|---|
| HUNTER | `(skipped: reused walk-evidence-location-settings-2026-05-14)` | regex `\(skipped:\s*.{20,}\)` | PASS — explicit skip with reason |
| GIVER | `clients/encore/specs_planning/_internal/field-case-catalogs/legal-2026-05-27.md` | `Test-Path <path>` → `True` | PASS — file exists |
| BUILDER | `clients/encore/specs/locations/location-legal.spec.ts` | `Test-Path <path>` → `True` | PASS — file exists |
| ... | ... | ... | ... |

Fastest source: `node scripts/validate-plan-closure.mjs <plan> --dry-run --json`, then read the `C6` check's items. Any FAIL row (vague prose or missing file) → `/final-q` verdict floor = **YELLOW** (not RED — closure is machine-gated by C6, so YELLOW signals "fix before the parent closes"). (Added 2026-05-28, PLAN_DONE_MEANS_DONE Phase 2.3.)

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

#### Step 6.0: Auto-reclassification pass (run BEFORE picking GREEN/YELLOW/RED)

For every row tagged `skipped` OR `deferred`, check the Note. The row stays at its declared tag ONLY if the Note names ONE of:

- **(a)** explicit user-directive transcript reference (e.g., "user said skip in turn N" / "user directive: defer to next session"), OR
- **(b)** a named recipient — pending subplan filename / BUG-ID / spawned-task-ID / discussion-flag — **WITH a corresponding Step 4.5 grep-evidence row showing `match`** (i.e. a Step 4.5 line proving the recipient file actually contains the line item, not just the agent's prose claim that it does), OR
- **(c)** explicit "permanently out-of-scope by design" with a stated design boundary (the why, not just the what).

Rows whose Note names a recipient but has **no Step 4.5 grep-evidence backing** = **rubber-stamped recipient** = auto-reclassify to `ignored`.

Rows whose Note is bare prose ("flagged for follow-up", "out of scope", "outstanding work", "noted in execution summary") with no (a)/(b)/(c) backing = auto-reclassify to `ignored`.

Reclassification count and verdict floor:

| Reclassifications | Verdict floor |
|---|---|
| 0 | (no floor — pick from GREEN/YELLOW/RED per Step 6.1 below) |
| 1 | YELLOW |
| ≥2 | RED |

**This applies to BOTH `skipped` AND `deferred` tags.** Plan B's original scoping was `skipped`-only, but SP-DQU-03's second `/final-q` exposed that `deferred` is the parallel hatch — same auto-reclassification rule applies to both.

Same-row interaction with Step 4.5: an incomplete Step 4.5 cross-check (missing `ran` clause OR missing `output:` clause) forces the related table row to `screwed` (per Step 4.5 rules). This is independent of Step 6.0 reclassification — both gates apply.

#### Step 6.0.5: Uninvoked-skill check (SP02B — TodoWrite Tagging Contract)

For every todo whose tag set includes `[/skill:direct]` (a high-confidence claim that the subtask IS the named skill's job), check the transcript: was that skill actually invoked via the `Skill` tool?

```bash
# In transcript: grep for tool_use Skill invocations of skill="<name>"
# Bash equivalent if you have transcript_path:
grep -c '"name":"Skill"[^}]*"skill":"<skill-name>"' <transcript-path>
```

Each `[/skill:direct]` tag where the named skill was never invoked → **auto-reclassify the todo row to `screwed`** (the `/relevant` injection promised the skill would handle the work; nothing was invoked; the work either didn't happen or happened ad-hoc without skill discipline). Reclassification count counts toward the Step 6.0 verdict floor (1 → YELLOW, ≥2 → RED) — same penalty schedule.

Tags that are NOT `direct` (`wrap` / `inform` / `verify`) are advisory — no penalty for not invoking, but if invocation would have been free and you chose not to, note it in the row's annotation.

#### Step 6.1: Pick verdict (after Step 6.0 reclassifications)

One of three:

- **GREEN** — every item `done`, zero reclassifications, zero `screwed` rows from Step 4.5, budget in green band. Stop is OK. Output the table + "Verdict: GREEN. Stop OK."
- **YELLOW** — some non-`done` items but explainable / expected / user-directed; OR exactly 1 Step 6.0 reclassification; OR mismatched Step 4.5 cross-check. Budget still green or yellow. Output the table + "Verdict: YELLOW. [one-line summary of gaps]."
- **RED** — multiple `ignored`/`failed`/`screwed`/reclassified rows (≥2 Step 6.0 reclassifications, OR any Step 4.5 incomplete cross-check, OR ≥2 mismatches) OR budget red. DO NOT claim done. Output the table + "Verdict: RED. [top gaps]. Handoff required."

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

- **Stop-hook enforcement REMOVED (2026-04-23)**: `final-q-gate.sh` + `rubber-stamp-gate.sh` deleted. Invocation discipline lives in `/execute` Phase 4 + skill self-invocation only — no hook blocks stop anymore. See `.claude/rules/hooks-identity.md` LR-042 strand A.
- **Chain orchestration** — when invoked inside a `/chain` background session, `chain-orchestrator.sh` (Stop hook) parses this skill's output to decide whether to auto-advance. Parse rule (D23 in [PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md](../../../plans/pending/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md)): find the LAST `## /final-q audit` heading in the transcript, then scan the next 30 lines for `^\*\*Verdict\*\*:[[:space:]]*(GREEN|YELLOW|RED)`. Missing audit heading or missing Verdict line → chain pauses with `verdict-NONE`. ALWAYS emit the full audit block — prose mentions of "verdict" outside the audit heading are intentionally ignored.
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
