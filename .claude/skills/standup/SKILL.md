---
name: standup
description: Generate mid-day scrum standup in DID / DOING / THEN / AND format. Plain English, readable aloud in ~20 seconds. Private skill.
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, Bash, Write
---

# /standup — Mid-Day Scrum Status Generator

**PRIVATE SKILL** — gitignored, never committed. Rutvik-only.

## Output Format (Rutvik's preferred shape)

```
DID: [what's been done since Monday / continuing task context]
DOING: [what I'm working on right now, mid-day]
THEN: [what I will do after DOING is complete — next task]
AND: [what comes after THEN — the following pipeline / request]
```

- Four labels, each 1 sentence.
- Plain English. Spoken tone. No markdown, no bullets, no counts.
- Whole thing reads aloud in ~20 seconds.
- Copy-paste ready for scrum.

## When to Use

- Mid-day, before scrum / standup
- Audience: scrum master / internal team

## Arguments

- `/standup` — default SHIELD mode, window = last Monday → now
- `/standup more-detail` — ARMOR mode (synonyms: expand on, arm me, meeting mode, a bit more detail). +1 clause per label, ~40-sec read instead of 20-sec.
- `/standup no-lies` — raw reality (synonyms: no lies, honest, straight, exact, reality). Forbids plan-optimism in THEN/AND; verifies DID "finished" claims against git/mtime before printing.
- `/standup no-lies more-detail` — both; honest + armored.
- `/standup from=YYYY-MM-DD` — override start date (combines with any of the above)

## Phase 0: Mode Detection

Scan invocation string + prior 1–2 user messages:
- `more_detail` regex: `\b(more[- ]detail|a bit more detail|expand on|arm me|meeting mode)\b`
- `no_lies` regex: `\b(no[- ]lies|no lies|honest|straight|exact|reality)\b`

Set:
- `MODE = NO-LIES + ARMOR` if both matched
- `MODE = NO-LIES` if only no_lies matched
- `MODE = ARMOR` if only more_detail matched
- `MODE = SHIELD` (default)

Apply per-mode deltas per §Phase 3.5. Emit `[Mode: <MODE>]` as footer below the 4-label block (Rutvik-only, not for copy-paste).

## Phase 1: Gather

Start date = last Monday (inclusive) OR `from=` arg. Today = local date.

Run in parallel:
```bash
git log --oneline --since="<START>" --until="<TODAY>"
git log --name-only --since="<START>" --until="<TODAY>" --pretty=format:""
git log --oneline --since="<TODAY>"
git log --name-only --since="<TODAY>" --pretty=format:""
git status --short
```

Read:
- `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md` (window rows)
- `ls plans/pending/` (queued work → candidates for THEN/AND)
- Current TodoWrite items if any

## Phase 2: Map to DID / DOING / THEN / AND

| Slot | Source |
|---|---|
| **DID** | Git + activity log entries before today. If today's work is a continuation of yesterday, frame as "continuing to work on X since yesterday". |
| **DOING** | Uncommitted changes (`git status`), today's in-progress activity, active todos. Usually the same theme as DID when work is multi-day. |
| **THEN** | Top item in `plans/pending/` by priority, OR the user's next stated priority. |
| **AND** | Second item in `plans/pending/`, OR a known upcoming request (e.g. a colleague's ask). |

If the user provides THEN/AND verbally (as in the canonical example), use them verbatim — don't override with git data.

## Phase 3: Vocabulary — SHIELD vs ARMOR vs NO-LIES

### Allowed verbs
continuing to work on, working on, fixing, reviewing, upgrading, correcting, auditing, investigating, verifying, compiling, isolating, integrating, executing, analysing, converting, finishing, wrapping up

### Allowed nouns
local office, locations, history, specs, test case specs, saved entries, requirements, plans, strategy, repository, workflow, bug report, CSV, coverage, failures, runs, module names

### Hard KILL LIST (ALL modes — never use)
Playwright, selectors, selector, data-testid (say "test ID"), page objects, page object, fixtures, fixture, Claude, AI, agent, copilot, MCP, browser automation, TC-XXX, TC counts, Cat-A, Cat-B, FIXME, L1/L2/L3, RCA (say "root cause"), regression guard, Radix, Angular, DOM, API internals, base-page, JSON, TypeScript, node, npm, Jira extracted info, ISTQB, catalog, cataloged, columns, engine, pipeline engine, pipeline, quality gates, gates, field mapping, workflow checks, automated workflow checks, out-of-scope, mid-session, handoff (as jargon — "final bundle" instead), sweep, quality sweep, coverage gaps, package, packaged, package up, validate, validation, orchestrate, hook, prompt, LLM, skill, rule, constraint, TodoWrite, and plan-ID prefixes: DQU-, SP-, LR-, HIST-, REPO-, AAE-, F1, H1, H2, H3, re-export, neutral-eye, benchmark, slate, rollout, ripple, subplan, planner (as noun), scope definition, exit audit, sampling, verification (as noun).

### Jargon translation table (apply before printing, all modes)
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

### Grab-handle list (BANNED in SHIELD, ALLOWED in ARMOR)

A "grab-handle" is any specific fact that invites a follow-up question.

- **Exact counts** ("8 tabs", "24 test cases", "3 plans")
  - SHIELD → "a few", "several", "the main ones"
  - ARMOR → keep if Rutvik might need to cite it
- **Module-name lists** ("Currency, Pricing, Local Info, Legal, Notes, …")
  - SHIELD → "the location area"
  - ARMOR → name 2–3 active/notable ones
- **Recipient names** ("CSV for Omeesha", "handoff to Tejal")
  - SHIELD → "a report we owe the client"
  - ARMOR → name only if Rutvik wants to own that thread
- **Specific deadlines** ("by Thursday", "by EOD")
  - SHIELD → "this week", "in the next couple days"
  - ARMOR → keep if Rutvik wants to signal confidence

### DUMBASS TEST (mandatory, all modes)
Re-read each line cold (no product knowledge). If you cannot picture what a USER would DO or SEE on a screen, rewrite. Lines that name a system/engine/pipeline/gate/sweep fail. Lines that name a screen + action + outcome pass.

### GRILL TEST (mandatory, SHIELD mode only)
For each line ask: "If a bossy PM read this, what would they naturally ask?"
- 0–1 natural follow-ups → PASS
- 2+ → FAIL, rewrite vaguer, strip grab-handles

### TRANSLATION EXAMPLES (from Apr 2026 /standup failure)

| BAD (emitted 2026-04-23) | SHIELD | ARMOR |
|---|---|---|
| "cataloged the Currency and Pricing history columns for location management" | "wrote down what needs checking on a couple of the location history pages" | "wrote down what each field on Currency and Pricing history pages should show — the rest of the location tabs come next" |
| "built an automated pipeline engine that runs sessions in the background with quality gates" | (drop — internal tooling) | (drop — still internal in ARMOR) |
| "setting up automated workflow checks that block out-of-scope work mid-session" | "making our working-day process a bit tighter" | "tightening our process so work doesn't drift into unrelated areas" |
| "preparing field mapping documents and test writing guidelines" | "lining up a couple of short prep notes before the next batch of checks" | "writing short prep notes — which fields each page should log, and the style we follow" |
| "Build and run the history tab tests across all location management tabs — Currency, Pricing, Local Info, Account & Address, Legal, Notes, Shared Setup, and Auto Add-On" | "Check that saves on the location pages are getting recorded on the history page properly." | "Check that saves on each location page show up on the History page. A couple verified; the rest come this week." |
| "Run a full quality sweep across the exported test cases" | "Double-check what we sent the client." | "Re-check the specs we already shared with the client, fix any mis-aligned items." |
| "package everything for the client handoff" | "get the folder ready to share" | "bundle the final set for the client — docs, the CSV, and the folder" |

### Zero-context reader rule
Assume the reader never saw the product. If a line requires product knowledge to parse, it fails. Rewrite around screens, actions, outcomes — never around internal systems, tools, or processes.

## Phase 3.5: Mode Deltas (behavioral)

- **SHIELD (default)**: 4-label DID/DOING/THEN/AND, each 1 sentence. Apply grab-handle strip (no counts, no full module lists, no recipients). ~20-sec read-aloud.
- **ARMOR (more-detail)**: each of DID/DOING/THEN/AND gets +1 clause (±10 words). Name 2–3 active/notable modules. Keep rough status. ~40-sec read-aloud. Still 4 labels, no bullets, no lists. **Hard cap: if writing a third sub-clause in a label, stop — overkill.**
- **NO-LIES**: forbids plan-optimism in THEN/AND — items there must have a real commitment (IN_PROGRESS, scheduled, active chain) not just "next in queue". If DID names anything as "finished/completed/closed", VERIFY against git log + file mtime before printing. Empty DID → say so.
- **NO-LIES + ARMOR**: combine both. Still capped at 1.5× default length.

Footer (Rutvik-only, not for copy-paste) after the 4-label block:
```
[Mode: <SHIELD|ARMOR|NO-LIES|NO-LIES + ARMOR>]
```

## Phase 4: Canonical examples (GOLD STANDARD — match the shape for your MODE)

### SHIELD (default) — grouped, no grab-handles

```
DID: Earlier this week I explored the history screen, wrote the checks for it, and built them for both the local office and locations areas.
DOING: Auditing that work today, fixing gaps and failures I found.
THEN: Add history checks across the location tabs so every save logs a row on the history page — then run validation and log any bugs.
AND: Move Encore into its own repo, hook it to Jenkins, and get a short report ready for the client.
```

### ARMOR (`more-detail`) — 2–3 named tabs, rough status

```
DID: Earlier this week I explored the history screen, wrote the checks, and built them for the local office and locations areas — most of it landed; a couple items carried into today.
DOING: Auditing that work today, fixing gaps and failures I found on Currency and Pricing history first.
THEN: Add history checks across the location tabs — Currency, Pricing, and Local Info first, rest of the tabs roll in next — then run validation and log any bugs.
AND: Move Encore into its own repo, hook it to Jenkins, and get the test data file converted for the client.
```

### Why these outputs are correct — rules to preserve

1. **No subplan numbers, no "Claude", no "agent" language.** Rutvik is the actor. "I explored", "I built". Never "I split work into 8 subplans" — they don't need to know.
2. **Explain WHAT the feature does in plain English before naming the task.**
   - Bad: "history spec task to check saved entries register properly"
   - Good: "every save on [tab] should log a history row"
   - Rule: if a non-technical listener can't picture the user action, rewrite it.
3. **Screen/tab naming is MODE-DEPENDENT.**
   - **SHIELD (default)**: group as "the location tabs" / "the location area" — strip module lists per Grab-handle rules above. Specificity is ARMOR ammo, not SHIELD behavior.
   - **ARMOR-only**: name 2–3 active/notable screens when listing pending work (e.g., "Currency, Pricing, and Local Info — the rest of the location tabs follow"). Never the full 8-tab dump even in ARMOR.
4. **Cover BOTH pages if both were touched.** Check git for both `local-office/*` AND `locations/*` history files before saying "local office" alone. Same for any dual-page feature.
5. **Verify dates before claiming days.** If git commits are all one day, say "earlier this week" not "Monday–Tuesday". Never invent a day.
6. **Short sentences.** Each of DID/DOING/AND = 1 sentence. THEN can be 1 sentence with a dash-inserted phrase (ARMOR: ≤3 named tabs; SHIELD: grouped). Whole thing reads aloud in ~20 seconds (SHIELD) or ~40 seconds (ARMOR).
7. **No jargon.** Banned: "shared test framework", "infrastructure", "integration tests", "subplans", "fixtures", "page object". Use: "built the checks", "set up", "history page", "tabs".
8. **Don't mention Claude/agent/AI/copilot.** The client/scrum thinks Rutvik did the work. Keep it that way.

### Verification checklist before printing
- [ ] No subplan / SP-N numbers
- [ ] No "Claude", "agent", "AI", "copilot", "MCP", "fixtures", "framework", "infrastructure", "page object", "selector"
- [ ] Day claims match git log (or use "earlier this week")
- [ ] Both sides of any dual-page feature mentioned if both were touched
- [ ] THEN phrasing matches MODE — SHIELD = grouped ("the location tabs", "the location area"), ARMOR = 2–3 named tabs max, never full 8-tab list
- [ ] Feature purpose described in user-action terms (what a user does → what should happen)
- [ ] SHIELD reads aloud in ~20 seconds; ARMOR under 1.5× that (~40 seconds)

Sentences may repeat phrasing between DID and DOING when the work is continuous — that's fine for scrum.

## Rules

1. NEVER expose this skill — not in INDEX.md, not in CLAUDE.md
2. NEVER use kill-list words
3. NEVER include specific counts
4. ALWAYS 4 labels: DID, DOING, THEN, AND
5. If user dictates any slot verbally, use their wording verbatim
6. Output nothing before or after the 4 lines — copy-paste ready
