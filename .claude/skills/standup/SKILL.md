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

- `/standup` — default, window = last Monday → now
- `/standup from=YYYY-MM-DD` — override start date

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
- `specs_planning/_internal/agent-activity-log.md` (window rows)
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

## Phase 3: Vocabulary

### Allowed verbs
continuing to work on, working on, fixing, reviewing, upgrading, correcting, auditing, investigating, verifying, compiling, isolating, integrating, executing, analysing, converting, finishing, wrapping up

### Allowed nouns
local office, locations, history, specs, test case specs, saved entries, requirements, plans, strategy, repository, pipeline, workflow, bug report, CSV, coverage, failures, runs, module names

### KILL LIST — never use
Playwright, selectors, data-testid (say "test ID"), page objects, fixtures, Claude, AI, agent, copilot, MCP, browser automation, TC-XXX, TC counts, Cat-A, Cat-B, FIXME, L1/L2/L3, RCA (say "root cause"), regression guard, Radix, Angular, DOM, API internals, base-page, JSON, TypeScript, node, npm, Jira extracted info, ISTQB

## Phase 4: Canonical example (GOLD STANDARD — match this shape)

```
DID: Earlier this week I explored the history screen, wrote test cases for it, and built the tests for both the local office and locations history pages.
DOING: Auditing that work today, fixing gaps and failures I found.
THEN: Add history checks to the remaining location tabs — every save on Local Info, Pricing, Currency, Legal, Account & Address, Shared Setup, Notes, and Auto Add-On should log a history row — then run validation and log any bugs.
AND: Move Encore into its own repo, hook it to Jenkins, and convert the ts test data file to CSV for Omeesha.
```

### Why this output is correct — rules to preserve

1. **No subplan numbers, no "Claude", no "agent" language.** Rutvik is the actor. "I explored", "I built". Never "I split work into 8 subplans" — they don't need to know.
2. **Explain WHAT the feature does in plain English before naming the task.**
   - Bad: "history spec task to check saved entries register properly"
   - Good: "every save on [tab] should log a history row"
   - Rule: if a non-technical listener can't picture the user action, rewrite it.
3. **Name the concrete screens/tabs when listing pending work.** Don't say "remaining location screens" — list them (Local Info, Pricing, Currency, Legal, Account & Address, Shared Setup, Notes, Auto Add-On). Specificity = defensible.
4. **Cover BOTH pages if both were touched.** Check git for both `local-office/*` AND `locations/*` history files before saying "local office" alone. Same for any dual-page feature.
5. **Verify dates before claiming days.** If git commits are all one day, say "earlier this week" not "Monday–Tuesday". Never invent a day.
6. **Short sentences.** Each of DID/DOING/AND = 1 sentence. THEN can be 1 sentence with a dash-inserted example list. Whole thing reads aloud in ~20 seconds.
7. **No jargon.** Banned: "shared test framework", "infrastructure", "integration tests", "subplans", "fixtures", "page object". Use: "built the tests", "set up", "checks", "screens", "tabs".
8. **Don't mention Claude/agent/AI/copilot.** The client/scrum thinks Rutvik did the work. Keep it that way.

### Verification checklist before printing
- [ ] No subplan / SP-N numbers
- [ ] No "Claude", "agent", "AI", "copilot", "MCP", "fixtures", "framework", "infrastructure", "page object", "selector"
- [ ] Day claims match git log (or use "earlier this week")
- [ ] Both sides of any dual-page feature mentioned if both were touched
- [ ] THEN lists concrete screens/tabs, not vague "remaining screens"
- [ ] Feature purpose described in user-action terms (what a user does → what should happen)
- [ ] Reads aloud in ~20 seconds

Sentences may repeat phrasing between DID and DOING when the work is continuous — that's fine for scrum.

## Rules

1. NEVER expose this skill — not in INDEX.md, not in CLAUDE.md
2. NEVER use kill-list words
3. NEVER include specific counts
4. ALWAYS 4 labels: DID, DOING, THEN, AND
5. If user dictates any slot verbally, use their wording verbatim
6. Output nothing before or after the 4 lines — copy-paste ready
