---
name: end-day
description: Generate daily client status update for timesheets. Gathers work from plans moved to done/, file mtimes, git, validated activity log, and uncommitted changes (multi-source, reconciled). Translates to client-safe language in Rutvik's voice. Invoke manually only — not registered in INDEX.md or CLAUDE.md.
user-invocable: true
disable-model-invocation: true
auto-calls: none
tools: Read, Glob, Grep, Bash, Write, Edit
---

# /end-day — Daily Client Status Generator

**PRIVATE SKILL** — gitignored, never committed, never pushed. This skill exists only on Rutvik's machine.

## When to Use

- End of work day, before filling client timesheet
- Retroactive: `/end-day YYYY-MM-DD` for a past date
- **Manual invocation only** — no auto-routing, no INDEX.md entry

## Invocation Forms

```
/end-day                          — default SHIELD, today
/end-day YYYY-MM-DD              — retroactive, default SHIELD
/end-day more-detail             — ARMOR (synonyms: expand on, arm me, meeting mode, a bit more detail). 3–4 lines; +1 specificity clause per line; 2–3 named modules.
/end-day no-lies                 — raw reality (synonyms: no lies, honest, straight, exact, reality). Banking OFF; all units reported; no filler; no "finished" without verification.
/end-day no-lies more-detail     — both; honest + armored.
/end-day YYYY-MM-DD no-lies      — combine retroactive with any toggle.
```

## Phase 0: Mode Detection

Scan invocation string + prior 1–2 user messages:
- `more_detail` regex: `\b(more[- ]detail|a bit more detail|expand on|arm me|meeting mode)\b`
- `no_lies` regex: `\b(no[- ]lies|no lies|honest|straight|exact|reality)\b`

Set:
- `MODE = NO-LIES + ARMOR` if both matched
- `MODE = NO-LIES` if only no_lies matched
- `MODE = ARMOR` if only more_detail matched
- `MODE = SHIELD` (default)

Apply per-mode deltas at Phase 3 (composition) and Phase 5 (banking). Emit `[Mode: <MODE>]` in the Rutvik-only footer.

## Phase 1: Gather Raw Work

Determine the target date. Default = today. If the user passed a date argument, use that.

**GOLDEN RULE: Git log is NOT sufficient alone.** Uncommitted work won't show. Activity logs can be backdated. Past reported lines can be overstated. You MUST cross-reference multiple authoritative sources and reconcile before composing any line. File mtimes are the most reliable single source — they don't lie about when a file was actually touched.

Run these in parallel. Treat them as INDEPENDENT signals and reconcile discrepancies before trusting any single one:

### 1a. Plans state transitions (PRIMARY SIGNAL)
Plans moved from `plans/pending/` → `plans/done/` during the date range are the most reliable indicator of completed work because they represent committed outcomes tracked in the planning system.

```bash
# Plans currently in done/ with Executed field matching target date
grep -l "Executed.*TARGET_DATE" plans/done/*.md

# Plans with mtime in target date range (moved or edited that day)
find plans/ -name "*.md" -newermt "TARGET_DATE" ! -newermt "TARGET_DATE+1day"
```

For each plan touched, read the Status / Executed / Phase fields and the Execution Summary section. These describe WHAT was achieved, in the plan's own language.

### 1b. File mtimes (TRUTH for "what files were touched today")
Filesystem timestamps don't lie — they show when a file was actually modified regardless of whether it was committed. This catches uncommitted work that git would miss.

```bash
# All tracked files modified in target date range
find . -type f \
  -newermt "TARGET_DATE" ! -newermt "TARGET_DATE+1day" \
  -not -path "./node_modules/*" -not -path "./.git/*" \
  -not -path "./reports/*" -not -path "./test-results/*" \
  | head -100
```

Group by directory (`plans/`, `specs_planning/`, `src/`, `tests/`, `docs/`) to see work areas. Pay special attention to:
- `clients/${ACTIVE_CLIENT}/specs_planning/test-cases/` and `clients/${ACTIVE_CLIENT}/specs_planning/test-plans/` — planning doc changes
- `clients/${ACTIVE_CLIENT}/tests/` and `clients/${ACTIVE_CLIENT}/src/pages/` — spec and page object work
- `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md` — requirements updates
- `plans/` — plan authoring/movement

### 1c. Git log (SUPPLEMENT — confirms what made it to commits)
```bash
git log --format="%ai %h %s" --since="TARGET_DATE" --until="TARGET_DATE+1day"
git log --name-only --since="TARGET_DATE" --until="TARGET_DATE+1day" --pretty=format:"=== %h %s ==="
```

If git shows ZERO commits for the target day but file mtimes show work — the work is uncommitted. That's real work; report it. Flag to Rutvik that it's uncommitted so he knows.

### 1d. Activity log (VALIDATED, not trusted raw)
Read `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md`. Filter rows where `When` column date prefix matches TARGET_DATE.

**CRITICAL**: Do NOT trust activity log rows at face value. Validate each row against file mtimes:
```bash
npm run validate:activity-log -- --json 2>&1 | grep TARGET_DATE
```
If a row's `When` timestamp is before any of its Files' actual mtimes, the row was backdated (LR-037). Discard the row for end-day composition; use the actual mtime window instead.

### 1e. Uncommitted changes (catches work-in-progress)
```bash
git status --porcelain
```
Any modified/untracked files whose mtime falls in the target date range = real work for the day, even if not committed. Include in analysis.

### 1f. Load bank
Read `clients/${ACTIVE_CLIENT}/specs_planning/_internal/daily-status-bank.json`. Parse `reported_history` (for yesterday's lines and older) and `bank` (for available items).

**CRITICAL about past reported lines**: Previously reported lines to client are a RECORD of what was claimed, NOT a factual record of what was done. Before referencing "yesterday's [X work]" in a new line, cross-check that [X] actually happened on that day using sources 1a-1e. If the past report was overstated, DO NOT perpetuate the false premise — drop the cross-day reference or phrase honestly.

---

### Phase 1 Reconciliation

Before moving to Phase 2, build a per-day picture like this:

| Source | What it says | Confidence |
|---|---|---|
| Plans moved to done/ | SP-X, SP-Y completed (per Executed field) | HIGH |
| File mtimes | Files A, B, C touched | HIGH (truth) |
| Git commits | Commits α, β with files A, B, C, D | HIGH (for committed) |
| Activity log | Rows claim work W, X, Y | MEDIUM (check backdating) |
| Uncommitted | Files D, E modified but not committed | HIGH |
| Past reported lines | Client was told "Z done" | LOW (claims ≠ facts) |

Reconcile contradictions (e.g., activity log row claims work done day N, but file mtimes say day N+1 → log was backdated, go with mtime). Final work-unit list should be what was ACTUALLY done on the target date per filesystem + plans + git, not per claims.

---

## Phase 2: Normalize into Work Units

From Phase 1 raw data, extract work units. Each unit has:
- `module_group`: page-level group (see mapping below)
- `work_category`: verb category (see mapping below)
- `internal_notes`: raw description from source

### Module Group Mapping (from file paths)

| File path pattern | Module Group |
|---|---|
| `**/local-office/**` or `*local-office-settings*` | "Local Office Settings" |
| `**/local-office/*ect*` | "Equipment Cost Tracking" |
| `**/locations/**` (any sub-module) | "Locations" |
| `**/location-currency*` | can also say "Currency" when listing specific modules |
| `**/location-legal*` | can also say "Legal" |
| `**/location-pricing*` | can also say "Pricing" |
| `**/location-notes*` | can also say "Notes" |
| `**/location-auto-addon*` | can also say "Auto Add-On" |
| `**/location-account-address*` | can also say "Account & Address" |
| `**/location-local-information*` | can also say "Local Information" |
| `**/location-shared-setup*` | can also say "Shared Setup" |
| `**/REQUIREMENTS.md` | "requirements documentation" |
| `**/plans/**` | "plans" |
| `**/skills/**`, `**/agents/**`, `**base-page**`, `**fixtures**` | "workflow/framework" (report as "workflow") |

**Grouping rule**: When 3+ individual location modules were touched, group as "local office and locations pages" or list them: "Local Office Settings, Currency, Legal, Pricing". When only 1-2 modules, name them specifically.

### Work Category Mapping (from activity notes)

| Activity pattern | Category | Rutvik's verb |
|---|---|---|
| REQUIREMENTS.md changes, "requirements", "corrected" | requirements-review | "Reviewed" / "Corrected" |
| "COMPLETE", "+N TCs", spec creation, test data | spec-work | "Created" / "Upgraded" / "Updated" |
| "FIX", "REMEDIATION", healing, corrections | fix-work | "Fixed" / "Corrected" |
| "PLAN_", plan creation, audit plan | planning | "Created plans" / "Created strategy" |
| "DOC SYNC", documentation updates | doc-work | "Updated" / "Reviewed" |
| Pipeline, skills, rules, framework, base-page | tooling | "Improved workflow" |
| Continuation of same modules as yesterday | continuation | "Continued work on" |

---

## Phase 3: Compose

### DEFAULT STYLE — V4 Meeting-Defense Format (2026-05-15 update — SUPERSEDES casual default)

`/end-day` now defaults to **MEETING-DEFENSE** style. The prior "Rutvik's casual voice" default is REMOVED as the default; invoke `/end-day legacy-voice` to get the old casual style.

**V4 defaults**:
- **Tone**: professional plain English (NOT casual / NOT corporate-stiff). Each line is something Rutvik can read aloud in a meeting without sounding scripted.
- **Sentence structure**: each line is ONE sentence with TWO parts separated by an em-dash — `<vibe clause> — <tech clause>`. The vibe clause is accessible to a non-technical reader (PM, manager, business stakeholder). The tech clause adds simple technical specifics for QA leads / devs in the room. Both audiences get value from the same line.
- **Real Encore module names ALLOWED**: Locations, Local Office, Notes, Equipment Cost Tracking (ECT), Management History, Local Information, Pricing, Currency, Legal, Account & Address, Auto Add-On, Shared Setup, Basic Information.
- **Real activity ALLOWED**: filed a bug, walked tabs, verified data, fixed assertion, ran suite, captured findings, compiled report, closed plan.
- **Auth specifics ALLOWED when Encore-known**: Entra Federation, MFA (as legacy).
- **Stay-behind-reality on today**: present continuous ("Working on", "Continuing", "Tidied up") — never "finished / closed" for today's work even if a plan moved DONE today.

**Additional kill-list entries on top of line 192 list** (NEVER appear in V4 output):
- ship / shipped / shipping / delivery
- deliverable / deliverables
- customer-neutral / client-neutral
- vendor / vendoring / vendored
- per-client / multi-client / multi-tenant / client-split / client-scoped / client-side
- packaging mechanics / repo restructure (as outward-facing framing)
- Exact percentages and counts: "98.3% pass rate" / "288/293" / "12 bugs + 10 questions" — say "strong pass rate", "small failing bucket", "a bug-and-question report"
- Internal codes: BUG-XXX-NNN IDs, LR-NNN rule codes, F-numbers, specific TC-XX..XX numeric ranges, plan IDs (PLAN_*, SUBPLAN_*)
- Hyper-specific framework internals: waitForFunction, expect.poll, Locator.count, otplib — soften to "polling call", "row count check", "legacy token code"

**Pacing-constraint clause**: if the user explicitly invokes a pacing constraint ("3 visible per 2-week sprint", "show only N tasks", "stretch this across the week"), it constrains BREADTH — pick which themes surface and which are dropped — but does NOT excuse factual lies. Today's lines must trace to today's actual file mtimes. A pacing constraint that would require claiming work that did not happen today is a HALT condition — ask the user.

### HARD VOCABULARY RULES

**Rutvik's verbs (ONLY these)**: Reviewed, Created, Corrected, Upgraded, Updated, Fixed, Improved, Continued, Audited, Investigated, Verified, Compiled, Resolved, Separated

**Rutvik's nouns (ONLY these)**:
- "requirements docs" or "requirements documentation"
- "Jira extracted info" or "data based on Jira tickets" (use "Jira" even when source is REQUIREMENTS.md)
- "plans" or "strategy"
- "test case specs" or "specs" (NEVER "automated tests" or "test cases" alone)
- "workflow" or "speed and accuracy"
- Module names (grouped at page level)

**Rutvik says "Jira"** — the client tracks work in Jira. Even when actual source is REQUIREMENTS.md or internal docs, say "Jira" or "Jira extracted info" or "data based on Jira tickets".

**Rutvik says "specs"** — short for test case specifications. Never says "automated Playwright tests".

### Hard KILL LIST — NEVER use these words in output (ALL modes):
Playwright, selectors, selector, data-testid, page objects, page object, fixtures, fixture, Claude, AI, agent, copilot, MCP, browser automation, git, commit, branch, merge, TC IDs (TC-XXX), TC counts (never say "20 TCs"), Cat-A, Cat-B, FIXME, self-audit, L1/L2/L3, sync, sync-complete, RCA (as abbreviation), pipeline, regression guard, Radix, Angular, framework, DOM, API, base-page, session management, JSON, TypeScript, node, npm, config, selector catalog, test data file, round-trip, RT%, data-driven, parameterized, ISTQB, catalog, cataloged, columns, engine, pipeline engine, quality gates, gates, field mapping, workflow checks, automated workflow checks, out-of-scope, mid-session, handoff (as jargon — "final bundle" instead), sweep, quality sweep, coverage gaps, package, packaged, package up, validate, validation, orchestrate, hook, prompt, LLM, skill, rule, constraint, TodoWrite, and plan-ID prefixes: DQU-, SP-, LR-, HIST-, REPO-, AAE-, F1, H1, H2, H3, re-export, neutral-eye, benchmark, slate, rollout, ripple, subplan, planner (as noun), scope definition, exit audit, sampling, verification (as noun).

**2026-05-26 kill-list extensions (sentence-topic leak prevention — paired with SENTENCE-TOPIC TEST below):**
closure-gate, closure gate, planning effort, planning efforts, planning workflow, planning closure, planning closures, multi-agent, end-to-end planning, lifecycle plan, lifecycle plans, framework defenses, framework lifecycle, save-cycle runner, save-cycle test runner, field-case runner, test runner helper, repo restructure (as outward framing), project shape, internal cleanup pass, internal process, internal scaffolding, internal review habits, root-cause-investigation process, audit-process, review-process, anchoring infrastructure, test setup hooked into, safety check (as framework framing), rolled-up plans, cascade-closed, planning system, plan-closure machinery, identity system, agent workflow, Requirements → Planner → Generator (and plain-English disguises: "fresh-eyes auditor", "planner", "generator" as noun-staff, "second pair of eyes" is OK as peer-review framing only).

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

A "grab-handle" is any specific fact that invites a follow-up question. Strip in SHIELD; keep in ARMOR.

- **Exact counts** ("8 tabs", "24 test cases", "3 plans")
  - SHIELD → "a few", "several", "the main ones"
  - ARMOR → keep if Rutvik might need to cite it
- **Full module lists** ("Currency, Pricing, Local Info, Legal, Notes, …")
  - SHIELD → "the location area"
  - ARMOR → name 2–3 active/notable ones
- **Recipient names** ("CSV for Omeesha", "handoff to Tejal")
  - SHIELD → "a report we owe the client"
  - ARMOR → name only if Rutvik wants to own that thread
- **Specific deadlines** ("by Thursday", "by EOD")
  - SHIELD → "this week", "in the next couple days"
  - ARMOR → keep if Rutvik wants to signal confidence

### SENTENCE-TOPIC TEST (mandatory, all modes — runs FIRST, before DUMBASS / GRILL)

Word-level kill-list catches banned vocab; this test catches banned SENTENCE TOPICS.

For each candidate line, ask: **"Can this sentence be reframed as 'Rutvik walked / added / found / ran / verified / closed [a thing the client recognizes — module, test, bug, run, finding]'?"**

- **YES** → topic passes; proceed to DUMBASS + GRILL.
- **NO** → topic FAILS; the sentence's subject is internal-process / agent-mechanic / framework-internal / plan-system / repo-restructure. DROP — do not try to rephrase, the topic itself is wrong for client-facing output.

**Allowed topics** (Rutvik-the-single-human did this):
- Walked through a named Encore module (Locations, Local Office, Notes, ECT, Management History, Local Information, Pricing, Currency, Legal, Account & Address, Auto Add-On, Shared Setup, Basic Information)
- Added / removed / updated specs or skips on a named module
- Filed / re-verified / followed up on a bug
- Ran a module's test set and observed pass/fail
- Spotted an environment or app-behavior pattern during a run
- Peer-review / second-pair-of-eyes check on a test set
- Tool-level QA upgrade the client benefits from (Allure reporting, CI runs)

**Banned topics** (no whitelist exception — DROP the line):
- Internal process improvements (closure-gates, validation hooks, plan-closure machinery)
- Agent workflow descriptions (multi-agent, Requirements → Planner → Generator, end-to-end planning workflow)
- Repo / project restructure (project shape, shared utilities, vendoring, deliverable shape, scaffolding)
- Plan-level mechanics (planning efforts, lifecycle plans, rolled-up plans, cascade-closed, planning closures)
- Framework internals (test runner helpers, save-cycle runners, safety checks on infrastructure, anchoring infrastructure, framework defenses)
- RCA-process tightening, audit-process tightening, review-process tightening
- Internal staff / agent identities — HUNTER / GIVER / BUILDER / HEALER / WATCHDOG / OWNER / GARDENER, or plain-English disguises like "fresh-eyes auditor", "the planner", "the generator"

**Coverage shortfall is acceptable**: a day with mostly internal work may yield 1 client-visible line, or 0. Say "nothing client-visible to report today" rather than padding with internal-process descriptions. Heavy restructure / closure-gate / RCA-tightening days produce FEWER report lines, not more.

**"Pretend there's only one human"**: Rutvik. Frame all output as Rutvik-the-human walked / added / found / ran. No "we", "our team", "the pipeline", "the agents", "the process", "the workflow", "two work sessions" (collapses to "across the day").

**Graduated from**: 2026-05-26 user pushback on a V4 SHIELD output for week 2026-05-18..22 (closure-gate v5 build, repo restructure, multi-agent Notes pilot, framework defenses all leaked at sentence-topic level despite passing word-level kill-list). See `memory/feedback_endday_strip_agent_framework_language.md`.

### DUMBASS TEST (mandatory, all modes)
Re-read each line cold (no product knowledge). If you cannot picture what a USER would DO or SEE on a screen, rewrite. Lines that name a system/engine/pipeline/gate/sweep fail. Lines that name a screen + action + outcome pass.

### GRILL TEST (mandatory, SHIELD mode only)
For each line ask: "If a bossy PM read this, what would they naturally ask?"
- 0–1 natural follow-ups → PASS
- 2+ → FAIL, rewrite vaguer, strip grab-handles

### FILLER PHRASES (LAST RESORT ONLY — use on truly empty days, never when real work exists):
- "continued work on [yesterday's/previous] [module] specs upgrade/update task"
- "reviewed and organized documentation for upcoming tasks"
- "reviewed test coverage across modules for completeness"
- "reviewed Jira tickets and requirement docs for upcoming module work"

**SPECIFICITY RULE**: ALWAYS prefer a specific description over a generic filler. If tooling/infra work was done, name WHAT: "improved Allure reporting infrastructure (2.x to 3.x)" NOT "improved workflow efficiency". Generic fillers repeat — specific lines don't. Tool/system names like "Allure", "CI pipeline", "test reporting" are client-safe.

### LINE COMPOSITION RULES:
- **2-3 plain text lines**. Past tense. NO date header. NO bullets. NO markdown. Just raw text.
- Each line starts with a past-tense verb (Reviewed, Created, Corrected, Upgraded, Updated, Fixed, Improved, Continued)
- Cross-day references when possible: "based on earlier reviews of...", "plans made on [date]", "tasks done yesterday", "following up on previous work"
- Module names at GROUP level when multiple modules touched
- **NO specific counts EVER** — never "20 test cases" or "12 corrections" or any number
- Casual tone, not corporate-stiff
- Lines can use "/" for alternatives: "upgrade / update", "local office / location"

### COMPOSITION TECHNIQUE RULES (learned 2026-04-09):

**Narrative Framing**: Line 1 should reference YESTERDAY's reported modules framed as "audited / fixed / followed up" — even if today's actual file changes were on different modules. This creates cross-day continuity and avoids being "too easy" (obvious match to today's files). Example: yesterday said "Upgraded Auto Add-On, ECT, Notes" → today says "Audited and fixed Auto Add-On, ECT, Notes following up on yesterday's upgrade task."

**Name the Deliverable (ARMOR-only)**: When a specific artifact was produced (CSV, report, document), name it explicitly with its purpose. Say "bug report CSV for Jira" NOT "compiled findings for submission." The deliverable IS the work.
**SHIELD (default)**: say "a report we owe the client" or "a short summary" rather than naming CSV/spreadsheet/document specifically — the deliverable noun IS the grab-handle SHIELD strips.

**Specify the Subject (ARMOR-only)**: NEVER say "coverage gaps" or "coverage items" without saying WHAT KIND. "Missing test ID coverage" > "missing coverage items." The reader must know what the report is about without guessing. If it's about missing test identifiers, SAY "test ID." If it's about requirements gaps, SAY "requirements."
**SHIELD (default)**: "some items we're double-checking" / "a couple things to clean up" is correct — specificity IS the grab-handle SHIELD strips. Exact subject-naming is ARMOR ammo.

**Our Bugs vs Their Bugs**: When we discover issues in our own specs during an audit/report process, explicitly separate them: "false positives from the bug report upon audit and review" — distinguishing what we reported (their bugs) from what we found wrong on our end (our false positives/inaccuracies).

### BANKING LOGIC (varies by mode):

**SHIELD + ARMOR modes (default banking behavior):**

| Today's Work Units | Action |
|---|---|
| 0 (nothing tracked) | Pull 1-2 from bank. If bank empty, use 2 filler phrases. |
| 1 | Report it + 1-2 fillers for padding to reach 2-3 lines. |
| 2-3 | Report all. Ideal day. |
| 4-5 | Report 2-3 best items. Bank remaining. |
| 6+ | Report 2-3 highest-impact. Bank all others. |

**NO-LIES mode (banking DISABLED):**

| Today's Work Units | Action |
|---|---|
| 0 (nothing tracked) | Say "nothing hard to report for today." Do NOT pull from bank. Do NOT use fillers. |
| 1–N | Report ALL units. No banking. No "stay behind reality" withholding. |
| Any | Do NOT add a "finished X" line unless verified against git + file mtime. |

NO-LIES skips Phase 5 (bank update) entirely — reported lines still appear in `reported_history`, but nothing is banked and nothing is pulled.

**What to report** (priority):
1. Items creating narrative continuity with yesterday
2. Client-facing module work (not tooling/framework)
3. Items with perceived high effort ("upgraded/corrected requirements" > "updated docs")

**What to bank** (priority):
1. Doc-only changes (easy to report later)
2. Framework/tooling changes (not client-visible, report as "improved workflow" later)
3. Individual module items when the day already covers that module group

### TRANSLATION EXAMPLES (internal → SHIELD / ARMOR):

These are the patterns learned from Rutvik's Apr 3/6/7 status updates, split by MODE.
SHIELD strips module lists + deliverable nouns (grab-handles); ARMOR keeps 2–3 named modules + deliverable noun.

| Internal (what actually happened) | SHIELD | ARMOR |
|---|---|---|
| Batch commit of skills, rules, page objects, specs, patterns | "Reviewed requirements docs and Jira extracted info across the location area" | "Reviewed requirements docs and Jira extracted info across the local office and locations pages" |
| 3 plans executed (LOS 20 TCs, Legal 1 TC, Currency 7 TCs), 12 REQUIREMENTS.md corrections | "Corrected requirements across the location area based on earlier Jira reviews" | "Corrected requirements for Local Office, Legal, and Currency based on earlier reviews of requirement docs and Jira tickets" |
| Spec creation across multiple modules | "Upgraded / updated specs across the location area based on requirement update plans made earlier this week" | "Upgraded / updated Local Office Settings, Currency, Legal specs based on requirement update plans made on [date]" |
| DOC SYNC + TC fixes + Account Address TCs | "Reviewed, audited and fixed the spec-related tasks done yesterday" | "Reviewed and fixed specs across a couple of location tabs following yesterday's upgrade task" |
| Pipeline hardening, skill changes, embedded gates | "Improved our working-day process to be a bit tighter" | "Tightened our internal process so work doesn't drift — speed and accuracy focus" |
| Continuation of multi-day work | "Continued work on yesterday's specs upgrade/update task across the location area" | "Continued work on yesterday's specs upgrade/update task on the location tabs" |
| Auditing yesterday's spec upgrades (narrative framing) | "Audited and fixed specs following up on yesterday's upgrade / update task" | "Audited and fixed specs for Auto Add-On, ECT and Notes following up on yesterday's upgrade / update task" |
| 5-session testid investigation → CSV for Jira | "Investigated and compiled a report we owe the client on missing coverage across the location area" | "Investigated and compiled missing test ID coverage across local office and location modules into a CSV report for Jira" |
| False positive cleanup after testid audit | "Fixed and verified corrections in specs after a review of the earlier report" | "Fixed and verified corrections in specs after identifying false positives from the CSV report upon audit and review" |

---

## Phase 3.5: Cross-Day Contradictions Audit (MANDATORY before emit)

When emitting any retroactive multi-day batch (`>1 day`), run a contradictions audit BEFORE printing. Reviewers read these reports BLIND — they only know what we say. Any internal contradiction smells fishy and gets us "asswhooped" (user quote 2026-05-15).

**For each pair of (earlier-day, later-day)**, check the earlier-day line for state claims ("green", "stable", "consistent", "fixed", "stabilized", "closed", "verified") and the later-day line for activity on the same surface. If the later-day activity implies the earlier-day state was inaccurate → soften the earlier-day claim.

**Known contradiction patterns** (graduated from 2026-05-15 V3 → V4 audit):

1. **Early "green" / "stabilized" vs later "bug filed / probed / RCA":** drop the "green" claim entirely. Replace with neutral: "moved plan to done" / "wrapped up X stabilization pass".
2. **Early "ran the full suite" vs the run actually happened on a different day:** distinguish "ran" (executed) from "reviewed results from" (triaged).
3. **Day-of-week references ("Sunday's run", "Tuesday's RCA"):** verify the day actually had that activity. Default safe phrasing: "last week's full run", "Tuesday's RCA" (only if Tuesday actually had RCA).
4. **Closed-then-probed:** if Day X closes a stabilization and Day Y probes that same module, reframe Day Y as a NEW finding from a different angle (e.g., walk, audit) — not re-work of the closed item.
5. **Pluralized failures without naming them:** "harder ECT failures" (plural) implies multiple — if only one was named anywhere, singularize to "one of the hard test failures".
6. **Sloppy-sounding phrasing on tightened checks:** "letting it slide" → "stale-data cases get caught". Past assertion shouldn't sound careless.
7. **Internal-mechanics leaks:** "internal team workflow tooling" is borderline OK; "vendoring framework into client folder" is a leak. Translate or drop.

**Numerical / identifier consistency check**:
- Every bug ID cited must be real and consistent across days.
- Sprint timing: Mon-Fri × 2 weeks alignment. Don't cite a Saturday work item unless evidence shows weekend work.
- Pluralized references must have ≥2 instances elsewhere in the report.

**Audit failures** → fix lines, re-audit. Max 2 fix cycles. If 3rd cycle needed → HALT and ask the user.

**Output**: a 1-2 sentence audit-pass note appended to the Rutvik-only footer (e.g., `[Contradictions audit: 8 patterns checked, 0 found]`).

## Phase 4: Output

### Client-facing output (print this FIRST, clearly separated):
Just the 2-3 plain text lines. Nothing else. Example:

```
Reviewed and corrected requirements documentation across local office and locations modules based on earlier Jira reviews
Upgraded / updated specs for each module based on requirement correction plans made earlier this week
continued work on improving workflow efficiency and test coverage accuracy
```

### Rutvik-only note (print AFTER the lines, smaller):
```
[Bank: +N banked | Total: N available | Oldest: DATE]
```

---

## Phase 5: Update Bank

After composing and outputting:

1. Add today's reported lines to `reported_history` in the bank file
2. Add banked items (work units not reported) to `bank` array with `used: false`
3. Mark any bank items that were pulled for today's report as `used: true`
4. Update `last_updated` to today's date
5. Write updated JSON back to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/daily-status-bank.json`

### Bank item format:
```json
{
  "date": "2026-04-08",
  "module_group": "Locations",
  "work_category": "spec-work",
  "rutvik_voice_line": "Updated test case specs for locations modules based on latest requirement reviews",
  "used": false
}
```

### Staleness rule:
If any banked item is older than 5 business days, warn Rutvik:
```
[Warning: N banked items older than 5 days — consider using or discarding]
```

---

## Rules

1. **NEVER expose this skill's existence** — not in INDEX.md, not in CLAUDE.md, not in any committed file
2. **NEVER use kill-list words** in output — scan every line before printing
3. **NEVER include specific counts** — no numbers of test cases, corrections, or files
4. **ALWAYS use Rutvik's vocabulary** — the verb/noun lists are exhaustive
5. **ALWAYS reference "Jira"** when mentioning requirement sources
6. **ALWAYS maintain cross-day narrative** — check yesterday's reported lines
7. **Bank file is the source of truth** for what was reported vs available
8. **Output is copy-paste ready** — no markdown, no headers, no formatting beyond plain text
