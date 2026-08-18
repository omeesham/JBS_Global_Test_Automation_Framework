---
name: end-week
description: Generate weekly client status summary from the prior week's /end-day outputs. Reads reported_history in daily-status-bank.json for Monday–Friday of the previous ISO week, verifies every working day has a reported entry (HALTs otherwise), and composes a compact 5–10 line summary with 1–2 lines per day. Read-only against the bank. Invoke manually only — not registered in INDEX.md or CLAUDE.md.
user-invocable: true
disable-model-invocation: true
auto-calls: none
tools: Read, Bash
---

# /end_week — Weekly Client Status Generator

**PRIVATE SKILL** — gitignored, never committed, never pushed. This skill exists only on Rutvik's machine.

## When to Use

- End of work week (or start of next week), before filling client weekly timesheet / status update
- Also: mid-week updates to colleagues or internal standups, using partial-week mode
- **Manual invocation only** — no auto-routing, no INDEX.md entry
- **Strict dependency on /end-day** — every working day up through the target cutoff MUST already have a `/end-day` run recorded in the bank. If any gated day is missing, HALT and ask user to run `/end-day YYYY-MM-DD` first.

## Invocation Forms

```
/end-week                           → audience=client, past completed ISO week, SHIELD (default)
/end-week colleague                 → audience=colleague, past completed ISO week
/end-week standup                   → audience=standup, past completed ISO week
/end-week client                    → audience=client, past completed ISO week
/end-week <audience> current        → audience + current partial week (Mon..today−buffer)
/end-week <audience> YYYY-MM-DD     → audience + ISO week containing that date
/end-week <audience> YYYY-Www       → audience + specific ISO week
/end-week YYYY-MM-DD                → audience=client + ISO week containing that date
/end-week more-detail               → ARMOR (synonyms: expand on, arm me, meeting mode, a bit more detail). Ceiling 12 lines instead of 10; +1 fact clause per day; hard cap 1.5× default length.
/end-week no-lies                   → raw reality (synonyms: no lies, honest, straight, exact, reality). Forces audience=standup semantics; BUFFER_DAYS=0; closing-line trim OFF.
/end-week no-lies more-detail       → both; honest + armored.
```

Any mode toggle (no-lies, more-detail, or their synonyms) can combine with audience + week-selector. Order-independent.

Parser: strip mode tokens first and set flags. Then: first remaining token is audience if it matches `client|standup|colleague`; otherwise treat as the week selector with audience defaulting to `client`. Valid week selectors: `current`, `YYYY-MM-DD`, `YYYY-Www`, or absent (= previous completed ISO week).

## Mode Detection (runs before Phase 0)

Scan invocation string + prior 1–2 user messages:
- `more_detail` regex: `\b(more[- ]detail|a bit more detail|expand on|arm me|meeting mode)\b`
- `no_lies` regex: `\b(no[- ]lies|no lies|honest|straight|exact|reality)\b`

Set:
- `MODE = NO-LIES + ARMOR` if both matched
- `MODE = NO-LIES` if only no_lies matched
- `MODE = ARMOR` if only more_detail matched
- `MODE = SHIELD` (default)

**NO-LIES override**: if MODE contains NO-LIES, force `audience=standup` for buffer calculations regardless of the explicit audience arg (original audience still shown in the Rutvik-only footer). This means BUFFER_DAYS=1 for partial mode, closing-line trim OFF, and no withholding of "today" in current mode.

Emit `[Mode: <MODE>]` in the Rutvik-only footer.

## Audience & Buffer Calibration

Different readers tolerate different amounts of truth. Rationale is identical to `/end-day`'s "stay behind reality" pattern (`feedback_endday_stay_behind_reality.md`): preserve a done-buffer so unexpected bad days don't look like slippage, and avoid setting permanent-overwork expectations. Larger audience exposure = larger buffer.

| Audience | Exposure if caught overstating | Buffer size | "Today" entry | "Yesterday" entry |
|---|---|---|---|---|
| **client** | HIGHEST — weekly timesheet, archived, cross-referenced against future weeks | 1–2 days | Always withhold | In `current` mode, withhold the "finished / closed / shipped / completed" lines; keep only in-progress / continuation lines |
| **standup** | MID — verbal, ephemeral, but peers remember | 1 day | Always withhold | Include as-is |
| **colleague** | LOW — informal, one-off | 0–1 days | Withhold if invocation is before EOD (wall-clock < ~18:00 local); include if after | Include as-is |

Buffer is applied ONLY in `current` (partial-week) mode. Closed-book past-week invocations (default and explicit-date) are reported in full — history is history; never retroactively re-bank a closed day.

"Closing lines" heuristic for yesterday's partial-trim (client audience, current mode): any line that starts with "Finished", "Closed out", "Shipped", "Completed", "Delivered", "Wrapped", "Generated … and sent", or similar terminal verbs. In-progress lines use "Working on", "Continuing", "Started", "Reviewing", "Investigating", etc. — keep those.

## Week Semantics

- **Week boundary**: ISO week, Monday → Sunday
- **Default target** (no args): the most recently completed ISO week. If today is Mon 2026-04-27, default target = 2026-04-20 (Mon) through 2026-04-26 (Sun).
- **`current` target**: Monday of the ongoing ISO week through `today − buffer_days` (audience-dependent). Only mode allowed to target the in-progress week.
- **Working days**: Monday–Friday. Weekend entries (if present in `reported_history`) are included when composing, but Sat/Sun absence is NOT a HALT condition.

### Date resolution (bash, inside skill execution)

```bash
TODAY=$(date +%Y-%m-%d)
TODAY_DOW=$(date -d "$TODAY" +%u)   # 1=Mon .. 7=Sun

case "$WEEK_SELECTOR" in
  "")  # default: previous completed ISO week
    DAYS_BACK=$((TODAY_DOW + 6))
    WEEK_START=$(date -d "$TODAY -$DAYS_BACK days" +%Y-%m-%d)
    WEEK_END=$(date -d "$WEEK_START +6 days" +%Y-%m-%d)
    MODE="closed"
    ;;
  current)  # current partial ISO week (audience-gated buffer)
    WEEK_START=$(date -d "$TODAY -$((TODAY_DOW - 1)) days" +%Y-%m-%d)
    # CUTOFF = today − buffer_days (see audience table). MODE=partial.
    WEEK_END=$(date -d "$TODAY -${BUFFER_DAYS} days" +%Y-%m-%d)
    MODE="partial"
    ;;
  20*-W*)   # YYYY-Www specific ISO week
    # resolve via ISO week → Monday
    MODE="closed"
    ;;
  20*)      # YYYY-MM-DD → ISO week containing that date
    ARG_DOW=$(date -d "$WEEK_SELECTOR" +%u)
    WEEK_START=$(date -d "$WEEK_SELECTOR -$((ARG_DOW - 1)) days" +%Y-%m-%d)
    WEEK_END=$(date -d "$WEEK_START +6 days" +%Y-%m-%d)
    MODE="closed"
    ;;
esac
```

Buffer sizing (applies only when `MODE=partial`):
- `client` → `BUFFER_DAYS=1`, plus "closing-line" trim on `today − 1`
- `standup` → `BUFFER_DAYS=1`
- `colleague` → `BUFFER_DAYS=1` if wall-clock hour < 18, else `BUFFER_DAYS=0`

Always echo the resolved `WEEK_START`, `WEEK_END`, `MODE`, audience, and buffer state before composition so Rutvik can sanity-check.

---

## Phase 0: Dependency Gate — Verify /end-day ran for every gated day

Read `clients/${ACTIVE_CLIENT}/specs_planning/_internal/daily-status-bank.json`. For the Encore client that's `clients/encore/specs_planning/_internal/daily-status-bank.json`.

Parse the `reported_history` array. Gate range depends on `MODE`:
- `MODE=closed` (default / explicit-date / YYYY-Www): gate Mon–Fri of the target week (`WEEK_START` through `WEEK_START+4`).
- `MODE=partial` (`current`): gate from Monday of the current week through `WEEK_END` (= `today − BUFFER_DAYS`). If `WEEK_END < WEEK_START`, there is nothing to report yet — emit a friendly note and stop, do not HALT.

For each gated day:

1. Look for an entry where `date` exactly matches `YYYY-MM-DD`.
2. Entry MUST exist AND its `lines` array MUST have ≥1 non-empty string.

Build a completeness table:

| Day | Date | /end-day ran? | Lines |
|---|---|---|---|
| Mon | YYYY-MM-DD | ✓ / ✗ | N lines |
| Tue | YYYY-MM-DD | ✓ / ✗ | N lines |
| Wed | YYYY-MM-DD | ✓ / ✗ | N lines |
| Thu | YYYY-MM-DD | ✓ / ✗ | N lines |
| Fri | YYYY-MM-DD | ✓ / ✗ | N lines |

**HALT conditions** (do NOT proceed to Phase 1):
- ANY gated weekday (per the mode's gate range above) is missing from `reported_history`
- ANY matched entry has an empty `lines` array

**HALT output format**:
```
[HALT] /end-week cannot run — prior week /end-day is incomplete.

Target week: WEEK_START → WEEK_END (ISO week NN, YYYY)
Missing days:
  - YYYY-MM-DD (Mon)
  - YYYY-MM-DD (Thu)

Run these first:
  /end-day YYYY-MM-DD
  /end-day YYYY-MM-DD

Then re-run /end-week.
```

Do NOT silently backfill. Do NOT compose filler for missing days. The user decides whether to run the missing /end-day calls.

**If Sat or Sun entries exist** (optional), include them in Phase 1 aggregation. If they don't exist, that's fine — weekends are not gated.

---

## Phase 1: Aggregate Daily Lines

Once Phase 0 passes, collect the raw lines for each day of the target week (Mon–Fri required, Sat–Sun optional):

```
Monday  YYYY-MM-DD:
  - <line 1>
  - <line 2>
  - <line 3>
Tuesday YYYY-MM-DD:
  - <line 1>
  - <line 2>
...
```

These lines are already in Rutvik's voice (produced by `/end-day`). They have already passed the vocabulary / kill-list filters. Treat them as authoritative — do NOT re-mine file mtimes, git log, or activity log. The week view is a composition over the daily outputs, not a re-derivation.

**Narrative scan** (before composing): identify the cross-day themes. Typical patterns:
- Multi-day pivot / initiative (e.g., "History pivot", "client delivery prep", "requirements correction pass")
- Module progression (Mon: Local Office Basic Info → Tue: ECT → Wed: Locations …)
- Audit-fix-verify cycles spanning 2–3 days
- Workflow / tooling improvements interleaved with client module work

Tag each daily line with its theme (lightweight — just for composition, never printed).

---

## Phase 2: Compose the Weekly Summary

### Format rules (HARD)

- **Total lines: 5–10**, one block of plain text. No date header, no bullets, no markdown, no list indicators.
- **Per-day density: 1–2 lines per working day**, or fewer if a theme naturally spans multiple days.
  - If 5 days each had genuinely distinct work → 5–10 lines (1–2 per day)
  - If 3 days worked the same initiative → collapse to 1–2 cross-day lines ("Continued X through Tuesday and Wednesday"), leaves room for the distinct days
- **Day references**: use weekday names ("Monday", "Tuesday", "midweek", "later in the week", "by end of week"). Never use raw dates in the output. Never say "on 2026-04-21".
- **Chronological order**: compose lines in the order work actually happened (Mon → Fri). The reader walks through the week.

### Voice & vocabulary (inherit from /end-day, unchanged)

Verbs, nouns, Jira convention, "specs", "workflow", "speed and accuracy", module grouping — same as `/end-day`. The kill list is the same. In practice, since every input line is already in Rutvik's voice, you should be paraphrasing within that vocabulary — not inventing new words.

**Hard KILL LIST** (ALL modes — scan every line before printing):
Playwright, selectors, selector, data-testid, page objects, page object, fixtures, fixture, Claude, AI, agent, copilot, MCP, browser automation, git, commit, branch, merge, TC IDs, TC counts, Cat-A, Cat-B, FIXME, self-audit, L1/L2/L3, sync, sync-complete, RCA, pipeline, regression guard, Radix, Angular, framework, DOM, API, base-page, session management, JSON, TypeScript, node, npm, config, selector catalog, test data file, round-trip, RT%, data-driven, parameterized, ISTQB, catalog, cataloged, columns, engine, pipeline engine, quality gates, gates, field mapping, workflow checks, automated workflow checks, out-of-scope, mid-session, handoff (as jargon — "final bundle" instead), sweep, quality sweep, coverage gaps, package, packaged, package up, validate, validation, orchestrate, hook, prompt, LLM, skill, rule, constraint, TodoWrite, and plan-ID prefixes: DQU-, SP-, LR-, HIST-, REPO-, AAE-, F1, H1, H2, H3, re-export, neutral-eye, benchmark, slate, rollout, ripple, subplan, planner (as noun), scope definition, exit audit, sampling, verification (as noun).

**Jargon translation table** (apply before printing, all modes — same as /end-day):
| INTERNAL | PLAIN |
|---|---|
| audit / neutral-eye audit | review / fresh-eyes review |
| re-export | re-share the updated file |
| slate clear / leftover state | make sure each test starts from a clean state |
| tag rollout | add proper tags across the tests |
| reqs sampling / verification | spot-check test cases against original requirements |
| QA best practices benchmark | short note comparing our approach to standard QA practice |
| simplify/cleanup sweep | clean up and simplify the repo |
| handoff package / L1 / L2 | final bundle for the client |
| module planner / F1 | plan reviews for the rest |
| identity ripple sync / scope definition / exit audit | (drop — internal) |

If any daily-line already contains a kill-list word, rewrite it into vocabulary (not drop it) before including in weekly output. This should be rare — `/end-day` already filtered.

**Grab-handle list** (BANNED in SHIELD, ALLOWED in ARMOR) — strip from daily lines during compaction if MODE=SHIELD:

- **Exact counts** in daily lines → "a few", "several", "the main ones" (SHIELD); keep (ARMOR)
- **Full module lists** → "the location area" (SHIELD); name 2–3 active/notable ones (ARMOR)
- **Recipient names** → "a report we owe the client" (SHIELD); name only if Rutvik wants to own that thread (ARMOR)
- **Specific deadlines** → "this week", "in the next couple days" (SHIELD); keep (ARMOR)

**DUMBASS TEST** (all modes): re-read each weekly line cold. If you cannot picture what a USER would DO or SEE on a screen, rewrite.

**GRILL TEST** (SHIELD mode only): "If a bossy PM read this, what would they naturally ask?" 0–1 follow-ups = pass; 2+ = rewrite vaguer.

### Compaction rules

1. **Merge consecutive-day continuation**: Mon "Worked on History pivot for Local Office Basic Info" + Tue "Continued History pivot work on Local Office Basic Info catalog" → single line: "Worked on the Local Office Basic Info History pivot Monday through Tuesday."
2. **Name each deliverable at least once per week**: if Tuesday produced the "bug report CSV for Jira", say so in the weekly line, not just "reporting work." The deliverable IS the week's output.
3. **Preserve our-bugs vs their-bugs distinction** when it appeared in daily lines.
4. **Drop pure filler** from daily lines (e.g., "continued work on improving workflow efficiency and test coverage accuracy" when it was padding). If the week had real tooling work, summarize it specifically instead ("Improved Allure reporting").
5. **Don't lose any named module or deliverable** that appeared in a daily line. Compaction = fewer words, not fewer facts.

### Coverage check (MANDATORY before output)

For every daily line in the week, confirm its content is reflected somewhere in the weekly output — either explicitly, or folded into a multi-day theme. If a module / deliverable / named artifact appeared in a daily line and has NO trace in the weekly summary, add it (compacted). Filler phrases are the only thing you're allowed to drop entirely.

### Length calibration

Closed-week (`MODE=closed`), SHIELD:
- 5 working days, all distinct themes: 8–10 lines (1–2 per day)
- 5 working days, 1–2 cross-day themes: 6–8 lines
- Holiday-shortened week or heavy single-initiative focus: 5–6 lines
- Never fewer than 5 lines on a full working week. Never more than 10.

Closed-week, ARMOR (more-detail):
- Ceiling raises to 12 lines (up from 10)
- Each day may add 1 extra fact clause
- **Hard cap: 1.5× default length.** If writing a third sub-clause in a line, stop — overkill.

Partial-week (`MODE=partial`):
- Lines scale to gated-day count: 1–2 lines per gated working day (SHIELD), up to 3 per day (ARMOR)
- Floor = 2 lines, ceiling = 10 lines (SHIELD) / 12 lines (ARMOR). No 5-line minimum.
- If only 1 gated day → 1–2 lines SHIELD or 2–3 ARMOR; don't pad.

### Partial-mode closing-line trim (client audience only)

When `MODE=partial` AND `audience=client`, after aggregating Phase 1 lines for `today − 1` (i.e., yesterday), scan each yesterday line:
- If it starts with a terminal verb ("Finished", "Closed out", "Shipped", "Completed", "Delivered", "Wrapped", "Generated and sent") → DROP from composition. Leave the bank entry untouched (it stays available for the next closed-week run).
- If it uses in-progress verbs ("Working on", "Continuing", "Started", "Reviewing", "Investigating") → KEEP.

This shifts the "finished-yesterday" claim into next week's summary, preserving a rolling done-buffer against unforeseen bad days. Standup and colleague audiences do NOT trim yesterday — only client.

---

## Phase 3: Output

### Client-facing output (print FIRST, clearly separated, copy-paste ready)

Plain text block, 5–10 lines, nothing else:

```
Monday and Tuesday focused on the Local Office Basic Info History pivot and requirements corrections for the pivot approach.
Midweek extended the pivot into Equipment Cost Tracking and other locations pages.
Reviewed Jira extracted info and earlier plans to align the pivot with the original delivery scope.
Generated test case CSV exports for the Location Management History module as part of the delivery handoff.
Continued client delivery preparation and handoff documentation work toward the end of the week.
Improved workflow on speed and accuracy alongside the module work through the week.
```

### Rutvik-only note (print AFTER, smaller)

```
[Week: WEEK_START → WEEK_END | Mode: <closed|partial> | Audience: <client|standup|colleague> | Buffer: <N days withheld + trimmed closing-lines for YYYY-MM-DD | none> | Days covered: N/M gated | Source: reported_history (read-only) | Bank untouched]
```

---

## Phase 4: (No bank update)

`/end-week` is **read-only** against `daily-status-bank.json`. It does NOT:
- Add to `reported_history`
- Pull from `bank` or mark items `used: true`
- Update `last_updated`

The daily bank is the source of truth for what was reported day-by-day. A weekly summary is a view over that truth, not another record. If Rutvik wants to record the weekly lines somewhere, that's a manual paste into the client timesheet tool — the skill does not persist them.

---

## Rules

1. **NEVER expose this skill's existence** — not in INDEX.md, not in CLAUDE.md, not in any committed file. Gitignored alongside `/end-day`.
2. **NEVER target the current ISO week unless `current` mode is explicitly invoked** — default and explicit-date forms always resolve to a closed (past) week.
3. **NEVER silently backfill a missing /end-day** — HALT and ask the user to run /end-day for the missing date(s).
4. **NEVER re-mine raw sources** (git, mtimes, activity log) — compose strictly from `reported_history`. Raw reconciliation is /end-day's job.
5. **NEVER modify the bank file** — read-only. Buffered / trimmed lines stay in the bank; composition just skips them for this invocation.
6. **NEVER apply buffer to a closed-book past week** — history is history. Buffer lives only in `current` mode.
7. **NEVER use kill-list words** — scan every line before printing. Same list as /end-day.
8. **NEVER include specific counts or raw dates** in output — weekday names only ("Monday", "midweek").
9. **ALWAYS respect the audience/buffer table** — client gets the largest held-back buffer, standup gets one day, colleague scales with time-of-day.
10. **ALWAYS print the resolved week window + mode + audience + buffer state** in the Rutvik-only note so he can sanity-check before copy-paste.
11. **ALWAYS preserve every named module, deliverable, and distinction** present in the non-buffered daily lines — compact, don't truncate.
12. **Line-count rule**: closed-week = 5–10 lines; partial-week scales 1–2 lines per gated day (floor 2, ceiling 10, no 5-line minimum).
