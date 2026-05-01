---
name: next-this-week
description: Forward-looking two-section output — "Today focusing on these one by one:" (granular in-flight items) + "Pending tasks up next" (grouped future tasks). Flat bullets, plain English, earliest-first. Default Shield; more-detail → Armor; no-lies → raw reality. Reads plans/INDEX.md + plans/pending/. PRIVATE — not in INDEX.md, not auto-routed.
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, Bash
---

# /next-this-week — Forward Pending-Tasks List

**PRIVATE SKILL** — gitignored, never committed. Rutvik-only.

**Invoke with**: `/next-this-week` (optionally with toggle args)
**Identity**: OWNER
**Skills auto-called**: none
**Model + thinking**: claude-sonnet-4-6 + hi
**Dependency gate**: none
**Context files**:
- `.claude/skills/standup/SKILL.md` (shared vocabulary + KILL LIST)
- `.claude/skills/end-day/SKILL.md` (translation table)
- `plans/INDEX.md`
- `plans/pending/` (forward priorities)

## When to Use

- Any weekday. Forward-looking view of pending tasks.
- Not constrained to week window — this is "what's up next", not "what fits Mon–Fri".
- Weekend allowed.

## Invocation Forms

```
/next-this-week
/next-this-week more-detail       (synonyms: expand on, arm me, meeting mode, a bit more detail)
/next-this-week no-lies           (synonyms: no lies, honest, straight, exact, reality)
/next-this-week no-lies more-detail
```

---

## Phase 0 — Mode Detection

Scan invocation string + prior 1–2 user messages:
- `more_detail`: `\b(more[- ]detail|a bit more detail|expand on|arm me|meeting mode)\b`
- `no_lies`: `\b(no[- ]lies|no lies|honest|straight|exact|reality)\b`

Set:
```
MODE = NO-LIES + ARMOR  if both matched
       NO-LIES           if only no_lies matched
       ARMOR             if only more_detail matched
       SHIELD            (default)
```

Emit `[Mode: <MODE>]` in the Rutvik-only footer.

---

## Phase 1 — Gather

1. `plans/INDEX.md` — pending rows in priority order (P0 → P1 → P2 …)
2. `plans/pending/*.md` frontmatter — `Priority`, `Status`, `Parent`, `Depends-on`
3. `.claude/state/chain-sessions/*.log` — active headless work (anything IN_PROGRESS goes first)
4. `git status --short` — uncommitted WIP belongs at the top (already in motion)
5. Fallback: if INDEX stale, walk `plans/pending/` by mtime.

Pull the **next 5–10 distinct tasks**. If many subplans share a theme (e.g. 8 per-module audits), collapse into **one grouped bullet** — don't list 8 near-identical lines.

---

## Phase 2 — Translate to plain English

For each task, run the **Jargon Translation** (must do, all modes):

| INTERNAL | PLAIN |
|---|---|
| DQU-xx / SP-xxx / LR-xxx / HIST-xxx / REPO-xx / AAE-xx / any plan-ID | drop the code; keep the human action |
| audit / neutral-eye audit | review / fresh-eyes review |
| re-export | re-share the updated file |
| slate clear / leftover state / pre-test / post-test state | make sure each test starts from a clean state |
| tag rollout | add proper tags across the tests |
| reqs sampling verification | spot-check test cases against original requirements |
| QA best practices benchmark | short note comparing our approach to standard QA practice |
| simplify sweep / cleanup sweep / H1 / H2 / H3 | clean up and simplify the repo |
| identity ripple sync | (drop — internal) |
| handoff package / L1 / L2 | final bundle for the client |
| module planner / F1 | plan reviews for the rest |
| catalog / cataloged / columns | write down what needs checking on [page] |
| scope definition / exit audit | (drop — internal) |

Then run the **Zero-context test**: if a reader with no coding + no product knowledge can't picture what happens, rewrite.

---

## Phase 3 — Output shape (the ONLY shape)

Two sections, in this order:

```
Today focusing on these one by one:

- <today task 1 — granular, 1 plan = 1 line>
- <today task 2>
- <today task 3>
- <today task 4>
- <today task 5>

Pending tasks up next

- <grouped task 1 — many related plans may collapse to 1 line>
- <grouped task 2>
- <grouped task 3>
- <grouped task 4>
- <grouped task 5>
[up to 10 total in "Pending" section; stop once priority queue tapers]
```

**Rules for both lists:**
- Flat bullets only. No day-by-day split inside either section.
- No "THIS WEEK (grouped)" / "AFTER THIS WEEK" / "FRI" / "SLIDES" sub-headers. Just the two section headings above.

**"Today focusing on these one by one:" (top section):**
- Granular — one plan / one in-flight item per bullet.
- Source: IN_PROGRESS plans + active chain-sessions + uncommitted WIP + today's named priorities from the user.
- 5 bullets default, up to 7 in ARMOR, NO-LIES trims aspirational items out.
- If nothing is actively in-flight, say so: print the heading and one bullet "nothing hard committed for today".

**"Pending tasks up next" (bottom section):**
- Grouped — collapse N similar subplans into 1 plain-language bullet (e.g. 8 per-module audits → "Review the rest of the modules one by one").
- Earliest / highest-priority first.
- 5 bullets default. ARMOR can go to 10. NO-LIES trims aspirational items out.
- One line per bullet. No sub-bullets, no parens with counts, no module-name lists unless in ARMOR.
- No narrative prose, no "Honestly —", no "Spent real time on…", no sentences that sound spoken.

---

## Phase 4 — Mode deltas

**SHIELD (default)** — 5 bullets, grouped plain English, no grab-handles (no counts, no full module lists, no recipient names, no deadlines).

**ARMOR (more-detail)** — up to 10 bullets, may name 2–3 active/notable modules per bullet, may note rough status ("most done", "a couple left"). Still flat bullets.

**NO-LIES** — only bullets with real in-progress evidence (IN_PROGRESS plan, active chain, uncommitted WIP, or scheduled). Drop anything that's just "queued somewhere". If fewer than 5 real items exist, print fewer — don't pad.

**NO-LIES + ARMOR** — combine: real items only, but allow 2–3 named modules per bullet.

---

## Phase 5 — Rutvik-only footer (below the copy-paste block)

```
[Mode: <SHIELD|ARMOR|NO-LIES|NO-LIES + ARMOR>]
Sources: plans/INDEX.md (N pending), chain-sessions (N active), git (clean|dirty).
Held back: <items stripped by SHIELD; shown in ARMOR>.
```

---

## Phase 6 — Closeout

Append a row to `clients/encore/specs_planning/_internal/agent-activity-log.md` per LR-028 / LR-037:

```
| <wall-clock YYYY-MM-DDThh:mm> | OWNER | done | none | /next-this-week generated pending-tasks list in <MODE> mode |
```

---

## Canonical example (SHIELD — the GOLD STANDARD, 2026-04-23)

Two sections per invocation. Exact shape:

```
Today focusing on these one by one:

- Fix the Local Office Settings test cases and re-share the updated file
- Fix the Local Information test cases and re-share the updated file
- Fresh-eyes review of the Local Information test cases
- Update our internal rules doc
- Add proper tags across the Local Office + Local Information tests

Pending tasks up next

- Finish fixing and re-sharing test cases for Local Office Settings and Local Information
- Start reviewing the next 1–2 modules (Pricing, Legal)
- Review the rest of the modules one by one
- Clean-start fix for tests
- Repo cleanup and simplification
- Final client handoff bundle
- History-page checks across location tabs
- Bug write-ups and final review
```

This is the format. Match this shape every time.

---

## Hard KILL LIST (ALL modes — never use)

Same list as `/standup` and `/end-day`, plus plan-ID prefixes:

DQU, SP-, LR-, HIST, REPO, AAE, F1x, H1/H2/H3, catalog, cataloged, columns, engine, pipeline, pipeline engine, quality gates, gates, field mapping, workflow checks, automated workflow checks, out-of-scope, mid-session, handoff (as jargon — "final bundle" instead), sweep, quality sweep, coverage gaps, package, packaged, package up, validate, validation, orchestrate, orchestration, re-export, neutral-eye, benchmark, verification (as noun), sampling, slate, rollout, ripple, subplan, planner (as noun), gate, hook, prompt, LLM, skill, rule, constraint, TodoWrite, scope definition, exit audit, identity ripple sync.

Plus everything in `/standup` KILL LIST (Playwright, selectors, fixtures, Claude, AI, agent, copilot, MCP, etc.).

---

## Grab-handle list (BANNED in SHIELD, ALLOWED in ARMOR)

- Exact counts → "a few", "several", "the main ones"
- Full module lists → "the location area"
- Recipient names → "a report we owe the client"
- Specific deadlines → (drop — this skill doesn't do deadlines)

---

## DUMBASS TEST (mandatory, all modes)
Re-read each bullet cold (no product knowledge). If you cannot picture what a user would DO or SEE on a screen/file, rewrite.

## GRILL TEST (mandatory, SHIELD mode only)
For each bullet ask: "If a bossy PM read this, what would they naturally ask?"
- 0–1 natural follow-ups → PASS
- 2+ → FAIL, rewrite vaguer, strip grab-handles

---

## Rules

1. **NEVER expose this skill's existence** — not in INDEX.md, not in CLAUDE.md, not in any committed file.
2. **ONE shape only**: `Pending tasks up next` heading + flat bullets. No day-by-day split, ever.
3. **NEVER use kill-list words or plan-ID codes** — scan every bullet before printing.
4. **NEVER exceed 10 bullets**, default 5.
5. **In-flight first**, priority second, nice-to-have never.
6. **Plain English** — zero-context reader rule. No internal shorthand.
7. **Always emit `[Mode: X]` footer** for traceability.

---

## What /next-this-week is NOT

- NOT `/end-week` — that's retrospective.
- NOT a planner — reads existing `plans/INDEX.md` and queue state, doesn't design work.
- NOT a commitment tool — forward items are intent, not promises.
- NOT a day-by-day schedule — flat list, user decides what lands when.
