# PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION

**Status**: PENDING
**Priority**: High — permanent fix for the silent-thin-coverage class (2026-07-17 Override gaps incident)
**Created**: 2026-07-17
**Identity**: OWNER (framework mechanism; pipeline identities consume it once landed)
**Depends on**: RCA output `.claude/state/ua-worker/chips/delegation-temp/out-override-rca/RCA-MATRIX.md` (Phase 0 input); walk-fleet outputs at `.claude/state/ua-worker/chips/delegation-temp/out-override-walk/`
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

> **Relevance re-audit 2026-07-24 (council + cross-family review, read-only): KEEP-WITH-REBASE.**
> 12/15 sections STILL-REQUIRED, 3/15 PARTIALLY-LANDED, 0 ALREADY-LANDED — the generative CRUD-invariant
> oracle, Zero-Effect Probe Protocol, and opener-frontier BFS exist nowhere else in the repo. Three
> rebase edits the EXECUTOR applies at Phase 0 before any build (do not skip):
> 1. Phase 3 gate wiring must COMPOSE with the now-landed `scripts/walk-coverage/lib/coverage-manifest.mjs`
>    (PROVENANCE_GATE, MANIFEST_MANDATORY_DATE) — layer on/extend, never duplicate.
> 2. New dispositions (`DIFFERENTIAL-DATA-REQUIRED`, suspicion rows) must specify integration with the
>    existing enum at `coverage-manifest.mjs:69` (`covered-by-TC, affordance-probed, read-only-verified,
>    out-of-scope`) — no blank-slate assumption.
> 3. `scripts/walk-coverage/fixtures/` already holds NM-2271 fixtures — the 2026-07-17 C/D/E/F fixtures
>    coexist there; reference the current dir structure.
> Evidence: `.claude/state/ua-worker/chips/delegation-temp/out-plan-relevance/` (verdict-plan-A.md,
> TOPLINE.md, DEBATE.md; load-bearing claims re-grepped by CEO same day).

## Context

2026-07-17: the Product Group Override module shipped "done" with silent gaps — Active-only checkbox
clicked but its filtering EFFECT never asserted; currency filter options listed but filtering never
proven; Reset-to-Default never clicked; dirty-state guard never tested; Labor grid asserted only in
its empty state; data-needs ("which office has >50 rows / inactive rows / blank Override Price")
parked as ask-Encore questions when a tenant export sitting on disk already answered every one, and
one state (blank Override Price) was manually self-producible in the UI (Rutvik proved it — 1105
Camlok rows, Mod 07/16/2026). Rutvik's verdict: last straw; walkers do bare-minimum passes; he should
never have to find gaps himself. This plan is the structural cure — **forced discovery**: coverage
leaks become machine-impossible to close over, not a matter of walker diligence.

**Design authorship**: the architecture below is Claude-authored (innovation-class, non-delegable
core per /innovation); workers implement from it and feed evidence into it, never redesign it.

## Bootstrap

- **Identity**: OWNER
- **Skills auto-called**: `/identity`; `/execute` when run
- **Context files**: this file; `RCA-MATRIX.md` (above); `.claude/rules/inventory.md` (LR-062, LR-064, LR-065, LR-057); `clients/encore/specs_planning/_internal/field-case-generation.md`; `docs/read_only_docs/AGENT_SHARED_RULES.md`; root `CLAUDE.md`

## The design (Claude-authored core)

**Three-tier locator-exhaustion army** — separates clicking from thinking, so cheap agents can't
under-think and expensive agents can't under-click:

1. **Tier-0 drones (throwaway, no judgment)** — cheapest models (gpt-5-mini / haiku), each assigned a
   FIXED QUOTA of ≤15 locators from a machine-produced element list. Per element they run a
   deterministic probe script by element-class and emit STRICT JSON facts only (no prose, no
   conclusions): `{elementId, class, probes: [{action, before, after}], effectObserved: bool}`.
   Effect observables are class-specific: filter/toggle → row-count delta; sort → first-cell delta;
   nav/pagination → page-indicator + first-row delta; edit → dirty-flag + Save-enable delta; guard →
   prompt appearance; io → download/dialog fired. Drones never decide coverage; they report deltas.
2. **Tier-1 mapper (consolidation, still no coverage judgment)** — merges drone JSON per module+office
   into ONE compact **interaction-map** artifact: the machine denominator (LR-062 extended from
   fields to ALL interactives), each element carrying its observed effects and connections (what it
   changes, what reveals it). Dedup + normalize + flag unprobed elements. Unprobed element = the map
   is INCOMPLETE and says so; a mapper cannot drop an element, only mark it.

   **State-graph exhaustion (the hidden-control killer — owner mandate 2026-07-17)**: any element
   whose probe REVEALS a new UI state (opens a dialog/menu/popover, switches a tab, expands a row,
   enters an edit mode) is an **opener**. Every revealed state goes onto a frontier queue and gets its
   OWN drone enumeration pass — recursively, until the queue is empty (BFS over UI states, cycle-safe
   via state fingerprints). The 2026-07-17 miss class this kills: the Active checkbox INSIDE the
   Change Local Office dialog, invisible unless the dialog is opened. Completion is NOT "all elements
   on the landing page probed" — it is "opener frontier empty". An opener that cannot be opened
   (permission, data, crash) = a NAMED blocker row in the map, never silence. Residual honesty: states
   gated on unreachable data/permissions remain named unknowns — the gate turns "we never looked"
   into "we couldn't open X because Y", which is escalatable.
3. **Tier-2 judge (Opus, the only brain)** — maps interaction-map → REQUIRED-CASE SET via the
   extended taxonomy (below), assigns every element-requirement a disposition, and owns the final
   verdict. Judges never re-click (drones' deltas are the evidence); they order re-probes when deltas
   are ambiguous.

**Extended taxonomy — per-CLASS mandatory effect-assertions** (extends
`field-case-generation.md`, which governs field-level cases; this adds the INTERACTION axis):

| Element class | Mandatory case(s) — not optional, not walker-discretion |
|---|---|
| filter (checkbox/dropdown/searchbox) | asserted EFFECT on the row set, both directions; a zero-delta observation is NEVER terminal — it routes to the Zero-Effect Probe Protocol below |
| sort | order actually changes, per sortable column |
| pagination / rows-per-page | page actually changes; requires a data-bed office (see data doctrine) |
| editable cell / input | accepts input + Save-cycle + persistence + recovery |
| guard | dirty-state prompt appears AND both prompt actions honored |
| io (export/import) | real file round-trip, or an explicit evidence-backed blocker |
| menu / disclosure | every item enumerated; state-changing items exercised + restored |
| add/picker affordances | flow driven to commit on a designated office, or user-authorized deferral |

**Walks are MANUAL QA — the bug-harvest mandate (owner vision 2026-07-17)**: a walk is not an
enumeration chore; it is the ONLY manual-QA pass this pipeline gets before automation is written —
the single chance to find bugs before spec code calcifies around the app's current behavior. Two
products per walk, both first-class: (1) the interaction-map, (2) the **bug harvest**. Drones probe
each element ADVERSARIALLY per its class, not just functionally — boundary values, invalid input,
rapid double-actions, save/cancel races, empty-vs-populated transitions — and report anomalies
(console errors, failed requests, wrong renders, stuck states) as structured suspicion rows.
The judge triages suspicions → filed bugs (LR-034 pipeline). **Closing the loop is mandatory: every
CONFIRMED walk-found bug's reproduction edge-case becomes a required TC in the module's
required-case set** — the bug's exact conditions get automated so that class of regression can never
land silently again. A walk that files zero suspicions on a non-trivial surface is itself a signal
the judge must interrogate (bare-minimum-pass detection), not a clean bill. If walks are broken,
everything downstream is broken — this section outranks speed on every walk dispatch.

**Human-catch feed (owner mandate 2026-07-17)**: the loop-closing mandate extends beyond walk-found
bugs to HUMAN-found ones — every entry in `.claude/state/human-catches.jsonl` (the Human-Catch
Reflex ledger, SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL Phase 1b) is a first-class taxonomy input: its
pattern becomes/extends an oracle class, its repro becomes a gate fixture AND a required TC, and it
is APPENDED to Phase 2's named rediscovery targets — the pilot must independently rediscover every
human catch to date, blind. A human catch that hasn't grown the taxonomy = this plan's own
acceptance fails. Humans finding bugs is the system's teacher of last resort — each lesson is paid
for once and never billed twice.

**Data doctrine (kills the "no data → skip/ask" leak)** — strict ladder, each rung requires evidence
the prior rung failed: (1) **SELF-PRODUCE**: create the needed state via the UI on a designated
office (reversibly where possible); (2) **SELF-SERVE**: mine existing artifacts — tenant exports,
walk-coverage JSONs, prior evidence files — for an office that already has the state; (3) **ESCALATE
LOUDLY**: only then a named question, which MUST be queued as an /encore-questions candidate AND the
case marked PARTIAL with the data-block named in the same breath. A skip citing "no data" without
rungs 1-2 evidenced = bounce.

**Zero-Effect Probe Protocol (added 2026-07-17 — §3.5 Prior-Fix Trial verdict: CONVICTED
`scoped-wrong`, rewired same-change)**: the 1222 incident proved the leak between "probe ran" and
"probe result interpreted". The Change Local Office dialog's Active checkbox was probed exactly per
the filter taxonomy row — toggle both directions, network captured, list counts recorded — and
returned ZERO delta (2,651 identical rows both states, all `active:true`). The machine (and the CEO)
stopped at "either the param is ignored or no inactive data exists" and ESCALATED as an ask-Encore
question. Rutvik then found office 1222 — inactive, never shown in the picker either state — in 30
seconds by hand. The prior mechanism was scoped wrong three ways: (a) the drone suspicion taxonomy
(console errors, failed requests, wrong renders, stuck states) does NOT include "control with zero
observable effect" — a 200-OK no-op fires none of those signals; (b) the data doctrine's trigger
("no data → skip/ask") never names a zero-delta effect-probe as a DATA NEED; (c) nothing forbids the
judge authoring a TC that asserts the zero-effect as EXPECTED — calcifying the bug. The rewire, all
four structural:

1. **Zero-delta = suspicion by definition.** The drone JSON gains `effectObserved:false` on any
   mandatory-effect class (filter/sort/guard/pagination/io) as an AUTO-FILED structured suspicion
   row. No judgment needed — the schema does it.
2. **Zero-delta = differential-data need, ladder fires BY NAME.** A filter proven only against data
   that is entirely on ONE side of the filter proves nothing. The disposition for a zero-delta probe
   is `DIFFERENTIAL-DATA-REQUIRED`, which fires the data-doctrine ladder explicitly: rung 1
   SELF-PRODUCE the other-side state on a designated entity (e.g. deactivate a designated office,
   reversibly); rung 2 SELF-SERVE hunt for an existing other-side entity ACROSS ALL SURFACES AND
   ARTIFACTS — not just the probed control's own API (the 1222 miss: the picker's own
   `location-lookup` was queried 6 ways, all-active — but the Location Settings admin surface, where
   1222's inactive status is visible, was never consulted); rung 3 ESCALATE only with rungs 1-2
   evidenced. This paragraph IS the trigger text — "the probe returned no delta" ≡ "I need data on
   the other side of this filter".
3. **Anti-calcification clause.** Until ground truth disambiguates (an other-side entity exists and
   was tested through the control), NO TC may be authored asserting the zero-effect as expected
   behavior. The only legal outputs are: BUG-CONFIRMED (other-side entity exists but the control
   ignores it), BY-DESIGN (evidence the control's purpose is different), or the still-open
   `DIFFERENTIAL-DATA-REQUIRED` disposition.
4. **Gate teeth.** An interaction-map row in `DIFFERENTIAL-DATA-REQUIRED` with no rung-1/rung-2
   evidence attached BLOCKS closure exactly like an undispositioned element.

**The Cross-Check Kernel (2026-07-17 — the ONE rule behind every bug this session found)**: every
bug the 2026-07-17 session surfaced was two sources disagreeing when they should agree — UI vs
server (NM-2186 error-shown-but-applied), export vs import (NM-1940 own-file rejected), a control vs
its data source (1222/activeOnly dead filter), DOM count vs API count (virtualization false read),
a claim vs the data (1117 "has data" = empty), Jira status vs live behavior (NM-2011 "cannot
recreate" while 100% reproducible). Therefore: **an observation-claiming disposition is valid ONLY
when cross-checked against a second independent source, and any disagreement auto-files as a
suspicion row — mechanically, no judgment.** The five REQUIRED oracle classes every walk carries:

1. **Zero-effect / differential-data** — protocol below (1222 class).
2. **UI-vs-persisted parity** — after EVERY io/save/import probe outcome, success OR error alike,
   reload + re-read persisted state; UI claim ≠ server state = suspicion (NM-2186 class). An error
   toast is never accepted as proof nothing persisted. **Scope split (anti-vacuous)**: COMMIT-probes
   (designated-office io like the 4107 round-trip) verify the state landed; DISCARD-probes (NO-SAVE
   walks) verify the INVERSE — reload proves nothing persisted. Both directions are the same oracle;
   a walk may never skip it citing "we didn't save" (not-saving is exactly the claim to verify).
3. **Round-trip invariant** — any export/import (or serialize/deserialize) pair: the system's own
   output MUST be accepted by its own input; rejection = suspicion (NM-1940 class).
4. **Count oracle** — row/list counts assert against API responses or footer totals, NEVER DOM node
   counts (virtualized surfaces render ~2 rows; NM-2172 class). A DOM-only count in evidence = the
   probe is invalid.
5. **Claim-vs-data census** — any external claim consumed by a walk (client statement, Jira status,
   prior artifact) is verified against machine-readable data (tenant export, live API, second
   surface) before it steers a disposition (1117 + NM-2011 class).

The closure checker (`scripts/check-interaction-coverage.mjs` + `check-walk-oracles` sub-check,
Phase 3) FAILS CLOSED on: a zero-delta row without differential-data disposition; an io probe with
no post-outcome persisted-state re-read; a DOM-only count oracle; an export/import surface with no
round-trip disposition; an external-claim-driven disposition with no census evidence.
**Gate self-test (non-negotiable acceptance)**: the checker is proven against the REAL 2026-07-17
evidence files (C/D/E/F) as fixtures — it must go RED on evidence C's dialog-Active row as-walked
(zero-delta, no differential data at the time) and GREEN once the 1222 disposition is attached. A
checker that passes the very evidence humans had to rescue is rejected. **Fixture home (anti-decay)**:
the originals live under gitignored `specs_planning/_internal/` — the self-test copies the needed
slices into a TRACKED fixtures dir (`scripts/walk-coverage/fixtures/`, sanitized) so the self-test
survives clones/cleanup; a self-test whose fixtures are gitignored evaporates silently = rejected.
**Machine-detectable basis (anti-prose-oracle)**: Phase 1's interaction-map schema MUST carry a
`basis:` field on every disposition — `observed:<evidence-file>` | `claim:<source>` |
`census:<artifact>` — because oracle 5 ("claim-driven disposition without census") is uncheckable
prose unless the claim-origin is a schema field the checker can read.

**Generative CRUD-Invariant Oracle (2026-07-17 — the answer to "why do new bug classes need a human
first")**: the 5 kernel oracles above are NOT a hand-curated list that grows one-human-catch-at-a-time
— they are the always-on SUBSET of a larger invariant set that is GENERATED from the surface's own
shape, not remembered from past bugs. Every surface this pipeline touches is CRUD: records with typed
fields, filters, sorts, pagination, create/read/update/delete verbs, import/export, status flags,
cross-surface references. From that metamodel M — which Tier-1's interaction-map already extracts — a
generator emits the REQUIRED-INVARIANT SET mechanically, the same way property-based / metamorphic /
model-based testing derive oracles from a type instead of from a bug log:

| Generated invariant | Fires when M has… | 2026-07-17 bug it catches BLIND (no prior sighting) |
|---|---|---|
| I1 filter-partition (both directions; zero-delta → differential-data ladder) | any filter/toggle | 1222, dialog Active checkbox |
| I2 sort-reorder | any sortable column | — |
| I3 read-totality / no-error census (GET-detail over the ENUMERATED id set from export/list) | any Read verb + id source | 1604 (500 on a real office) |
| I4 create-readback | any Create verb | — |
| I5 update-persist (reload + re-read) | any Update verb | NM-2186 (error shown, applied anyway) |
| I6 delete-removal + referential integrity across dependent lists | any Delete verb | — |
| I7 count-source (API/footer, never DOM) | any list/grid | virtualization false-read |
| I8 status-flag reachability + partition (both states present in data; flag partitions every list claiming to honor it) | any active/status flag | 1222 (from the data side) |
| I9 io round-trip (own output accepted by own input) | any import+export pair | NM-1940 |
| I10 field-domain (FCC axis, existing) | any typed field | — |
| I11 claim-census (external claim vs machine data) | any consumed claim | 1117, NM-2011 |

The judge's denominator (LR-062, extended) IS the GENERATED invariant set for the surface's metamodel
— a surface is not "covered" until every invariant its own shape implies has a disposition. **A
brand-new surface is covered the moment it is catalogued: extract M → generate its invariant set →
check — zero human, zero prior sighting of any bug.** This is the structural answer to Rutvik's
2026-07-17 point (the offices/checkbox/500/round-trip misses were never novel bug CLASSES — they were
KNOWN CRUD invariants nobody instantiated on that surface): a generative oracle instantiates ALL of
them on EVERY surface, so "the agent lacked the willpower to check" becomes "the checker generated the
check whether or not any agent had willpower." The 5 kernel oracles are simply the always-on subset
that applies to every surface regardless of which verbs are present.

**Domain-rule harvest (the /research lever — answer to "why can't /research help")**: invariants NOT
derivable from CRUD shape are DOMAIN rules (e.g. "PG 286 may not carry a blank Override Price", "Labor
product groups populate only on office 1101 per NM-1881", discount ceilings). These are not unknowable
— they are DOCUMENTED in Jira acceptance-criteria + bug history, Confluence specs, the old-site
baseline (HUNTER's LR-045 job), and the client's own statements. Phase 1 adds a **domain-oracle
harvest**: `/research` in internal-source mode (Jira/Confluence/old-site/prior-bug census — NOT web)
mines these into machine-readable domain-invariant inputs the generator consumes ALONGSIDE the CRUD
set, BEFORE the walk, so documented domain expectations are pre-loaded and machine-checked, never
discovered by a human in prod. `/research` in web mode ALSO seeds Phase 1 with the established
invariant catalogs (metamorphic-relation lists, property-based generators, REST-contract conformance
suites) so the CRUD algebra above is proven-complete, not hand-waved.

**The honest residual (no fake-fix — what this still cannot promise)**: two things survive, both
SMALLER and more concrete than "a new bug class":
1. **A never-before-seen CONTROL / metamodel-feature type** the extractor cannot classify into M (a
   widget whose verb/flag/filter nature it has never encountered). Floor: an interaction-map element
   the extractor cannot classify is a LOUD UNKNOWN that blocks closure (never silent) — the same
   opener-frontier discipline, one level up. Detection survives; only AUTO-GENERATION of that type's
   invariant waits until the type is taught once.
2. **Undocumented business intent** — a rule living only in a stakeholder's head, written in no
   Jira/spec/baseline. The cross-check kernel still flags any two-source disagreement it produces
   (never silent), but the machine cannot know WHICH side is correct without a human. **This is an
   ADJUDICATION gap, NOT a DETECTION gap** — the bug is surfaced loudly; a human only picks the right
   answer, they do not do the finding.

Both residuals feed the Human-Catch Reflex: on first human touch the recurrence law
(SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL §3.5) convicts — for residual 1 the generator's metamodel
vocabulary is extended (covering the whole new control CLASS, not one instance); for residual 2 a
domain-invariant input is added. Either way the class never needs a human twice.

**Guarantee shape, restated honestly**: CRUD-derivable invariants → machine-generated & checked on
every surface at catalog time, forever, zero human, even first visit (absorbs 100% of the 2026-07-17
catch list — see the table's right column). Documented domain rules → harvested into oracle inputs
pre-walk, zero human-in-prod. Residual → a novel control-type or undocumented intent, both caught
LOUD-never-silent, a human needed only to teach the type once or adjudicate intent once, then never
again. Anyone promising literal zero-gaps-forever is selling the fake fix owned on 2026-07-17.

**The gate (makes leaks structural, not disciplinary)** — a closure checker over the interaction-map:
any element with zero disposition, a mandatory-class element without its effect-TC (or an
evidence-backed disposition per LR-040), or a zero-effect row without its differential-data evidence
(protocol above), BLOCKS the module's coverage plan from flipping DONE.
Dispositions carry the LR-031/LR-061 evidence bar. Wire per LR-069: land `announce`, ramp to `deny`.

## Phase 0 — Inputs gate

Read RCA-MATRIX.md (systemic causes + which layer failed per gap) and the A/B walk outputs. Adjust
the taxonomy table if the RCA proves a class is missing. Do not skip: the RCA may relocate blame
(e.g., taxonomy-hole vs silent-omission) and that decides Phase 1 emphasis.

## Phase 1 — Taxonomy + schema

Extend `field-case-generation.md` with the interaction-axis table (per-class mandatory effects);
define the interaction-map JSON schema (versioned, under `clients/<id>/reports/interaction-maps/`);
define the drone probe scripts per element class (deterministic playwright-cli sequences).

**Generative oracle (`scripts/walk-coverage/generate-invariants.mjs`)**: input = the interaction-map
metamodel M (entities, typed fields, filters, sorts, pagination, C/R/U/D verbs, io pairs, status
flags, cross-surface refs); output = the surface's REQUIRED-INVARIANT SET (I1–I11 above), each row
carrying which metamodel feature triggered it so the mapping is auditable, not asserted. This set —
not a fixed list — is the Tier-2 judge's denominator. Seed the algebra from `/research` (web mode:
metamorphic-relation / property-based / REST-contract catalogs) so completeness is sourced, not
hand-waved. **Domain-oracle harvest (`/research` internal-source mode)**: mine Jira acceptance-criteria
+ bug history, Confluence, the old-site baseline (LR-045), and captured client statements into a
machine-readable `domain-invariants.json` the generator consumes alongside the CRUD set — the
documented-domain layer that CRUD shape cannot derive. An extractor that classifies a surface control
into NONE of M's feature types emits a LOUD UNKNOWN row (residual-1 floor) — never silence.

## Phase 2 — Pilot on Product Group Override

Run the full army on the offices the 2026-07-17 walk fleet certified (Active-only bed 1105, pagination
+ Labor bed 9460/1974, NM-1932 bed 1115). Output: interaction-map + required-case set + dispositions.
Diff against the existing spec — every 2026-07-17 gap must be REDISCOVERED by the machine (that's the
pilot's pass condition: the army independently finds what Rutvik found, plus anything else).
**Named rediscovery targets (tick each)**: the original screenshot gap (dialog Active checkbox
existence), AND the 1222 bug — the pilot must reach `DIFFERENTIAL-DATA-REQUIRED` on the dialog
Active checkbox, fire the ladder, surface an inactive office (1222-class) via cross-surface hunt or
self-produce, and file the picker-excludes-inactive suspicion WITHOUT being told 1222 exists. If the
pilot needs the answer key, the Zero-Effect Protocol failed its own test.

### PILOT RUN 1 — 2026-07-29/30, two blind drones. Partial pass, one real find.

Two blind walks were dispatched under a BLINDNESS PROTOCOL forbidding every path that carries the
answer key (`plans/`, `scripts/walk-coverage/`, the two checkers, `specs_planning/`, `reports/bugs/`,
`.claude/state/` outside the run's own output dir, `docs/read_only_docs/`, `git log|show|blame`, Jira,
Confluence, web).

**Blindness verified, not asserted.** Both runs were swept afterwards by extracting the actual path
arguments passed to read tools from the process log — not by grepping the log text, which
false-positives on the prohibition list the ticket itself echoes into the prompt. Run 2 opened four
files, all permitted (`clients/encore/CLAUDE.md`, `.claude/rules/browser-tool.md`,
`clients/encore/.env.local`, its own `OBSERVATIONS.json`), and zero answer-key identifiers appear
anywhere in its log. Artifacts: `.claude/state/ua-worker/chips/close2/out-drone/` and `out-drone2/`.

| Named rediscovery target | Result |
|---|---|
| Dialog Active checkbox **existence** (the original screenshot gap) | **REDISCOVERED.** Both runs opened the Change Local Office dialog, enumerated it as its own state with `openedBy` naming the opener, and found the Active checkbox inside it. |
| 1222 class — reach `DIFFERENTIAL-DATA-REQUIRED`, fire the ladder, surface an inactive office by cross-surface hunt, file the picker-excludes-inactive suspicion | **NOT REACHED.** Run 2 probed the dialog Active checkbox in both directions and recorded a faithful zero-delta (office list 2652 → 2652, count source `unavailable-dom-only`). It stopped there. The ladder never fired, and no cross-surface hunt for an inactive office was attempted. |

**Why target 2 failed, precisely**: the drone treated "no populated office found" as terminal. It tried
7 offices (1101, 1102, 1105, 1107, 1121, 1604, 1605), got `0 items found` on every one, and wrote
`officeHuntExhausted: true`. That is a **data-state observation being closed as a population path** —
exactly what LR-040 (c).1 forbids. Rung 2 of the ladder requires hunting the other-side entity *across
all surfaces and artifacts*; the drone hunted one surface (each office's own PGO page) and stopped on
budget. The ladder text exists; nothing made the drone execute it.

### ⚠ THE PILOT'S REAL FIND — a footer count cannot distinguish empty from failed

`scripts/walk-coverage/fixtures/kernel-oracle-fixtures.json` specimen 5 records that
`GET /api/location/corporate-price-pg-override?localOfficeId=1604` **always returns HTTP 500**.
Blind and independently, the drone visited office 1604, read the grid footer, and recorded
`rowCount: 0, source: "footer text '0 items found'"`.

**The footer said zero because the request died.** The count oracle as specified — "API response or
footer total, never DOM" — treats the footer as authoritative, and the footer reports a failed request
as an empty result set. Every zero-delta computed from two such counts looks exactly like a dead
filter and is actually a dead request. The checker had no oracle for this at all: as of this run,
`grep -nE "failed-request|httpStatus|statusCode" scripts/check-interaction-coverage.mjs` returned
nothing, so specimen 5 was a recorded specimen that nothing failed on.

This also means the office hunt above is confounded: some of those 7 zero counts may be 500s rather
than genuinely empty grids, and the walk had no way to tell.

**Fix landed as**: a `REQUEST-FAILED` disposition plus a count-observation validity precondition — a
footer-sourced count is valid only alongside a recorded 2xx, and an **absent** status yields
`UNCHECKABLE`, never `COVERED`. Absence of a recorded status is not evidence of success.

### PILOT RUN 2 — 2026-07-30, on a bed that actually has data

Runs 1 and 2 burned their budget hunting for a populated office because the ticket made them hunt. That
was a dispatcher error, not a drone error: **the data beds were already recorded** in
`clients/encore/src/data/corporate-override/override.ts` (office 4107, the live-certified round-trip
target, product group 4298; office 9460 Labor, 212 items). Blinding a run to the *findings* is the
point; blinding it to the *test-data setup* just wastes the run. Run 3 was handed the bed.

**Result on office 4107 ("The Lodge at Spruce Peak"), footer count 1, httpStatus 200 on every count:**

| Observation | Value |
|---|---|
| Equipment / Labor tab switch | Equipment 1, Labor 0 — **one API call served both**; the tab switch is client-side |
| "Active only" checkbox (landing page) | count 1 in **both** states, **no new API call** — client-side filter. The single row's Active cell rendered a dash, not a boolean |
| Currency filter | count 1 for both ALL and USD; the one row is USD |
| Sort (Location) | count 1, first cell unchanged — a single row cannot demonstrate ordering |
| Dialog Active checkbox | office list **identical** in both states — the same zero-effect run 2 saw, now observed independently a second time. Still `unavailable-dom-only`: the dialog exposes no footer or API count |

**The bed is wrong for this job, and that is the finding.** 4107 carries **one row**. A filter cannot be
proven against a single row sitting entirely on one side of it — every zero-delta above is
uninformative by construction, exactly as a zero-row grid was. 4107 is an io / round-trip bed; it is
not a filter-partition bed. The plan's own Phase 2 line names "Active-only bed 1105", and 1105's
Override grid measured empty across two runs. **The bed list in this plan is stale and needs re-deriving
from live counts before the pilot's filter half can mean anything.**

**What the run got right, and it is the important part.** Asked to record where it looked for
other-side entities, the drone wrote: *"Only one surface checked… No other surface was consulted for
inactive entities."* It did not write "hunt exhausted". That single-surface disclosure is precisely the
condition the ladder sub-check now FAILS on — so this walk's zero-delta rows would be correctly blocked
as unproven rather than passing as evidence of a dead filter. **The pilot validated the gate by
tripping it honestly.**

**Named-target status after run 3**: dialog Active checkbox existence — REDISCOVERED, twice,
independently. The 1222 target — still NOT reached: the zero-effect observation lands, the ladder does
not fire, no inactive office is surfaced. What changed is that the incompleteness is now *caught*
rather than silently accepted.

## Phase 3 — Gate wiring

`scripts/check-interaction-coverage.mjs` (closure checker above) + hook per LR-069 announce-first;
drone/mapper dispatch recipes into the worker doctrine; disposition enum into LR-040's options.

## Phase 4 — Graduate

LR rule for the interaction axis + data doctrine; retire prose-only walk instructions this supersedes
— **with a protection-parity table per retirement** (each retired instruction's protective function
mapped to the machine mechanism that now covers it; unmapped = the retirement is blocked — slop
drops must never be feature drops, per SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL Phase 3);
`/compile-learnings` folds the incident memories into the rule.

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | walk denominators | (none — consumes the 2026-07-17 fleet's artifacts) | (none) |
| GIVER | field-case-generation.md extension | interaction-axis taxonomy section | grep for the class table in the file |
| BUILDER | pilot effect-TCs (Phase 2 diff feeds the gap-closure subplan, not authored here) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | closure checker | scripts/check-interaction-coverage.mjs | node scripts/check-interaction-coverage.mjs --dry-run exits 0 |
| GARDENER | (none) | (none) | (none) |
| OWNER | this plan, schema, gate ramp config | interaction-map schema file + LR-069 ramp keys | files exist per Phase 1/3 |

## VERIFIED STATE — 2026-07-25 (CEO re-ran every command below)

**Oracle 1 of 5 (zero-effect / 1222 class) is LANDED and PROVEN ON REAL WALK DATA.**

`scripts/check-interaction-coverage.mjs` 403 → 453 lines. `zero-effect-disposition` sub-check at
lines 105-124; self-test T11/T12 at 387-412; **27/27, exit 0** (CEO-run).

Real-data RED→GREEN, fixture
`.claude/state/ua-worker/chips/fdle/fixtures/evidence-C-dialog-active.interaction-map.json`:

| direction | command | result |
|---|---|---|
| RED (walk's own disposition) | `node scripts/check-interaction-coverage.mjs --file <fixture>` | **exit 1** — `ZERO-EFFECT VIOLATION: dialog-active-checkbox` |
| GREEN (disposition → `DIFFERENTIAL-DATA-REQUIRED`) | same, corrected copy | **exit 0** — PASS |

**The finding is real, not manufactured.** Walk evidence C recorded the dialog Active checkbox as
"IS functional" (line 192) on the strength of a network call firing — while that same run measured
`inactive-count:0` (line 135), i.e. **zero data to differentiate against**. The 2,651→2,139 delta it
leaned on came from a *different run ~30 minutes earlier*. That is exactly the 1222 class: a control
certified as working in a data state where it could not be exercised. The correct disposition is
`DIFFERENTIAL-DATA-REQUIRED`, and the oracle now says so mechanically.

**Transcription caveat (honest):** the checker consumes JSON interaction maps; the 2026-07-17
evidence is markdown, so the fixture is a hand-transcription of the real row, not the file itself.
It is faithful but **lossy** — it omits the prior-run 2,139 count. Including it would strengthen the
RED, not weaken it. The plan's "real fixtures, not synthetic" criterion is met in substance (real
measured values), not literally (not the .md file). A markdown→interaction-map converter would close
the gap properly and does not exist.

### STILL OPEN on this plan
- **4 of 5 oracle classes unimplemented** — UI-vs-persisted, round-trip, count, claim-census.
  Placeholders named in a comment only.
- The 6 bug-class → oracle → fixture maps (1604, NM-1940, NM-2186, virtualization, 1117/NM-2011).
- Generative oracle SUPERSET proof (blind, no bug-history input).
- `domain-invariants.json` Jira/Confluence harvest.
- Ramp keys not recorded; gate not yet at `announce`.

### Tooling note for future sessions
The flag is **`--file <path.json>`**, NOT `--artifact`. Run `--help` before asserting a flag — that
mistake produced false alarms twice in one session, both times blaming a worker who was correct.

---

## VERIFIED STATE — 2026-07-25 19:20 (supersedes the block above; CEO re-ran every command)

**All 5 kernel oracles are implemented, adversarially attacked, and hardened. Self-test 27 → 67/67, exit 0.**

| Oracle | Status | Evidence |
|---|---|---|
| 1 `zero-effect-disposition` | LIVE | FAILs the real evidence-C dialog-Active row, exit 1 |
| 2 `ui-vs-persisted-parity` | LIVE + hardened | fires `UI-VS-PERSISTED VIOLATION` on a disagreeing io row |
| 3 `round-trip-invariant` | LIVE + hardened | disposition now bound to the export/import pair |
| 4 `count-source` | LIVE + hardened | FAILs every DOM variant; UNCHECKABLE on unsourced counts |
| 5 `claim-census` | LIVE + hardened | empty / ghost census evidence now FAILs |

**Oracles 4+5 went through the same cross-vendor fight as 1-3 and came back RED with 2 blockers.**
gpt-5.5 broke them; the author defended and hardened; CEO re-fired every payload on real files:

| Attack | Before | After (CEO-verified) |
|---|---|---|
| `DOM:raw-count.txt` (capital D) | PASS | **FAIL** — COUNT-SOURCE VIOLATION |
| `"  dom:..."` (leading whitespace) | PASS | **FAIL** |
| `dom-api:...` (prefix-adjacent) | PASS | **FAIL** |
| `api:GET /items (from dom)` | PASS | UNCHECKABLE (treated as unsourced) |
| `numRows` count alias | PASS | UNCHECKABLE (detection widened) |
| `basis: claim:*` + empty census | PASS | **FAIL** — CLAIM-CENSUS VIOLATION |
| `census:no-such-artifact.txt` | PASS | **FAIL** |
| honest complete map (**control**) | PASS | **PASS, exit 0** — still not a wall |

Oracle 4 exists precisely because a DOM count is an invalid probe on a virtualized grid (NM-2172);
a check a capital letter defeated was not that check. Oracle 5 accepting `census:no-such-file.txt`
rebuilt the 1117 / NM-2011 hole outright. **Self-test 27 → 97/97, exit 0.** LR-069 §3.4 rent header
added (Sev + graduating incident: the 2026-07-17 override walk, where five CRUD invariants existed
and none was instantiated on the surface).

⚠ **The reviewer's own verdict carried a false premise** and it was corrected in the bounce: it
claimed *"no pre-existing real interaction-map or walk-evidence artifacts were found"* and skipped
the real-data over-firing test on that basis. They exist — its globs looked in the wrong place. A
reviewer's limitation claim is a claim like any other and must be checked before it is inherited.

**Verdict precedence fixed (was a silent hole).** A genuine FAIL used to be masked as UNCHECKABLE:
a map with `persistedStateReRead.agrees=false` returned `VERDICT: UNCHECKABLE`, exit 2 — anything
gating on exit 1 would have missed a real violation. Now **FAIL > UNCHECKABLE > PASS** (1/2/0),
CEO-verified on the same map. Found independently by the cross-vendor reviewer and by the CEO.

**Adversarial payloads, all closed** (cross-vendor review by gpt-5.5, then author defence, then CEO
re-fire on real files). Oracle 2 was fooled 5 ways — empty `persistedStateReRead`, missing `agrees`,
`agrees` as the string `"false"`, a save row misclassified as `filter`, and a DISCARD-probe that
persisted data. Oracle 3 was satisfied by an **unrelated** io row carrying the disposition. All now
UNCHECKABLE-or-FAIL, never PASS. **Honest control still PASSes at exit 0** — the checker is a
detector, not a wall.

**Fixtures: 6 of 6, real and literally verifiable.** `scripts/walk-coverage/fixtures/kernel-oracle-fixtures.json`
carries S1-S6 (1222 · NM-2186 · NM-1940 · virtualization · 1117 · NM-2011) transcribed from the real
2026-07-17 evidence B/C/E. An elision-aware provenance check greps every `sourceQuote` in its cited
file: **6/6 OK, 0 bad**. The first pass shipped reconstructed quotes (0/6 verifiable) and was bounced.

**Generative-oracle SUPERSET proof — HOLDS, and it is not a hardcoded list.**
`node scripts/walk-coverage/generate-invariants.mjs --superset-proof` → exit 0:

```
kernel-1 -> I1   kernel-2 -> I5   kernel-3 -> I9   kernel-4 -> I7   kernel-5 -> I11
UNCOVERED_ORACLES: none
RICH_M_INVARIANT_COUNT: 12    MINIMAL_M_INVARIANT_COUNT: 2
```

CEO adversarial re-test (the check that actually settles it): feed a metamodel with `ioPairs: []` and
`consumedClaims: []` → generator emits `I1 I2 I3 I4 I5 I6 I7 I8 I10` and **I9 + I11 disappear**.
Remove the shape, lose the invariant. So generation is driven by the metamodel, and the plan's
central claim — *a brand-new surface is covered the moment it is catalogued* — is mechanically true,
not marketing.

**Schema extended so the oracles can fire at all.** `persistedStateReRead`, `capability`, and
`roundTripDisposition` had **0 grep hits** in `interaction-map-schema.mjs` — the oracles greened only
against synthetic fixtures that invented their own inputs, i.e. a gate that could never fire on real
data (the LR-062 precedent). Now present (12/9/8 hits), all optional/nullable so no existing map is
invalidated, with `agrees` validated as an explicit boolean.

**Domain-rule harvest — LANDED.** `scripts/walk-coverage/domain-invariants.json`: **9 invariants,
0 rows without an openable source.** This is the half the generative oracle structurally cannot
produce — business rules no CRUD-shape analysis can infer.

Six came from a live Jira read (NAV-4529, read-only, cloudId `03ec286f-…`), and they are not
academic:

| id | rule | maps to |
|---|---|---|
| D1 | Priceguide list must persist on a CAD-only location — it saves **empty** | oracle 2 |
| D2 | Print must be disabled when the save failed — it stays **enabled** | oracle 2 |
| D3 | Report must honour the selected currency — always prints USD | oracle 1 |
| D4 | Currency picker must offer only the location's currencies — offers USD to a CAD-only site | I10 |
| D5 | Report must generate without USD | I3 |
| D6 | UI must indicate currency for international locations | presentation |

**D2 is the NM-2186 shape alive on a different surface**: a control whose *enabled state is itself a
claim about persisted data*. A walk that checks only "is the button clickable" records a pass while
the save silently failed. Three more rows are repo-documented (D7 office-1101 Labor gating,
D8 currency-gated picker, D9 PG-286).

Two limits are recorded **inside the file**, not just here: (a) coverage is `PARTIAL` — a 110-issue
JQL sweep surfaced exactly ONE rule-bearing summary because rules live in issue *descriptions*, so a
complete harvest needs a description-level pass over NAV plus the Confluence spec space, a dedicated
session; (b) **D9 is flagged `UNVERIFIED-AGAINST-JIRA`** — carried forward from this plan's own body
with no governing ticket located. An unverified domain rule is precisely the claim-without-census
that oracle 5 exists to catch, so it is not laundered into the corpus as verified.

**Second harvest pass (description-level, same session) — 13 invariants total, 0 without a source.**

| id | rule | class |
|---|---|---|
| D10 | Max Discount % under 1% must survive its own read-back | round-trip (oracle 3 / I4) |
| D11 | Special rate always permitted for Digital Branding | field-domain (I10) |
| D12 | Canada-only: Venue Price Book is the Production-Order default | claim-census (oracle 5) |
| D13 | Corp Override screen must stay viewable after a price-strategy assignment | read-totality (I3) |

**D10 (NM-2142) is the most consequential row in the file.** A Max Discount Percent entered as
`.003` reloads as **30%** — the decimal shifts two places, turning 0.3% into 30%, **silently, with no
validation error**, on BOTH Pricing Details and Product Group Override. That is a 100× error on a
discount field. Structurally it is the round-trip invariant at *field* level: the system's own output
is not accepted by its own input. A walk that types a value and sees it accepted records a pass — the
corruption only surfaces on re-entry, which is exactly why oracle 3 must fire on read-back and not on
first render.

D11-D13 are marked `harvestLevel: "summary-only"` — their summaries were read, not their
descriptions. Recorded as such rather than presented as deeper than it was.

**D9 (PG-286) demoted to `SEARCHED-NOT-FOUND`, retained not deleted.** Two independent Jira searches
(`text ~ 286 AND text ~ override`; then `blank override price` / `override price required` /
`product group 286`) returned **no governing ticket**. The rule appears only in this plan's own body,
so it may be a walk observation that was promoted to a "rule" without a source. It carries an explicit
*do not let this steer a disposition* note. Deleting it would erase the evidence of the gap; leaving
it unflagged would be the exact claim-without-census that oracle 5 exists to catch.

**Third harvest pass (project NM, rule-shaped summaries) — corpus now 19 rows, 0 without a source.**
Every kernel oracle class is represented by a real, documented bug:

| class | rows | notable |
|---|---|---|
| field-domain | 4 | D18 Barcodeable read-only on Item segment |
| ui-vs-persisted-parity (2) | 3 | D19 Save/Update enablement contradicting form validity |
| claim-census (5) | 3 | D8 now Jira-sourced |
| count-source (4) | 3 | D15 sort spans page not result set; D17 non-deterministic Publish set |
| round-trip-invariant (3) | 2 | **D14 = NM-1940** |
| read-totality / zero-effect / presentation | 4 | |

**D14 closes a provenance loop in this plan's own argument.** The plan cites "NM-1940 own-file
rejected" as the reason oracle 3 exists; the ticket is now attached — *"Pricing Override Import –
Valid Exported File Fails with 'Invalid Line / Required Fields Missing'"*. The oracle and its
graduating incident are now linked in the corpus, not just in prose.

**D8 upgraded in place, not duplicated** — `NM-2076` ("Product Group not displayed and Currency field
disabled for Canada and some Mexico locations") turns the currency-gated picker from repo-lore into a
Jira-sourced rule.

**D15 and D17 are the count-oracle's real-world case.** A sort that orders only the current page looks
correct on screen and is wrong in the data — the same read-what-is-rendered mistake as counting DOM
nodes on a virtualized grid. D17 is worse: the Publish screen shows a *non-deterministic* subset, so
two honest observations disagree and no single reading is safe.

**Fourth pass (project NAV) — corpus at 25 rows, 0 without a source, spanning 10 oracle classes:**
`field-domain` 5 · `ui-vs-persisted-parity` 4 · `claim-census` 4 · `count-source` 3 ·
`zero-effect` 2 · `round-trip-invariant` 2 · `read-totality` 2 · `presentation` 1 ·
**`permission-invariant` 1** · **`state-precondition` 1**.

### ⚠ THE HARVEST FOUND A HOLE IN THE ORACLE SET ITSELF — recorded as `coverageGaps`

**D20 / NAV-4180: a user with the Sales Read Only role CAN add recommendations to the Price Guide.**

No oracle in this plan catches that, and none can. The 5 kernel oracles and every generated invariant
I1-I11 reason about **a single actor's view of data**. Not one of them re-executes an action under a
**different role** and asserts refusal. A walk performed as an admin cannot observe the defect at all
— the control is present, it works, the data is correct. The bug is that someone *else* can reach it.

This is the honest limit of the plan's central claim. "A brand-new surface is covered the moment it is
catalogued" holds for **CRUD shape** — verbs, filters, grids, io pairs, typed fields — because those
are what the metamodel extracts. **Role is not part of the shape it extracts**, so permission
invariants fall outside the generated set entirely. Closing this needs a **role-partition oracle**
(re-run a mutating action under each role, assert refusal for read-only) which does not exist and is
not in scope here. It is recorded in the file's own `coverageGaps` so it cannot be quietly forgotten,
rather than being buried as a 25th row that looks like all the others.

`state-precondition` (D21, NAV-3357 — no proposal while a Quote DocuSign is active/pending) is a
second class with no kernel-oracle home; noted, lower severity than the permission gap.

## ⚠ FINAL-STATE ADVERSARIAL PASS — 2026-07-25 22:00. "99% / oracles hardened" WAS PREMATURE.

Oracles 1-3 and 4-5 were attacked in two SEPARATE earlier passes and defended. **The post-defence
final state had only ever been verified by the party who commissioned it.** Its first real attack
returned **RED / NOT-SAFE-TO-RAMP** with 3 blockers and 4 majors.

**BLOCKER — class relabeling defeated ALL FIVE oracles at once.** Every oracle scopes by `class`,
which made the class label a **self-declared exemption**. A map relabeling zero-effect →
`editable-cell`, save → `guard`, export/import → `menu-disclosure`/`add-picker`, count →
`add-picker` with an empty `countSource`, and claim → `observed:*` returned **exit 0 PASS**. A walk
that renamed its rows passed the entire suite. That is not a hole in one oracle — it is a bypass of
the set.

| finding | before | after (CEO-verified, each firing for its INTENDED reason) |
|---|---|---|
| 6-row full relabel escape | **exit 0 PASS** | **exit 1 FAIL** — zero-effect fires on the relabeled row, count-source flags all 6 |
| `browser:` / `rendered:` / `client-side:` / empty `countSource` | PASS | UNCHECKABLE exit 2 (denylist → **allowlist**) |
| `census:package.json` — any existing file as corroboration | PASS | FAIL — CLAIM-CENSUS VIOLATION |
| honest **save-only io** (no io pair on the surface) | UNCHECKABLE — **20% FP rate** | **PASS exit 0** |
| `null` element in the array | unhandled TypeError, **no VERDICT line** | controlled FAIL exit 1 |
| degenerate probes (absent / `[]` / object) | PASS | rejected |
| severity contract: header S0 vs config S1 ramp | contradictory | reconciled |
| self-test | 97/97 | **123/123** |

Verdict precedence (FAIL > UNCHECKABLE > PASS) held under every simultaneous-disagreement
combination the reviewer tried — no masked FAIL by any route.

### Round 3 — the fix's own mechanism is the next attack surface

Round 2 attacked the round-1 fixes and found three more false negatives. The headline one is the
clearest statement of the pattern in the whole session:

| round | the fix | how the next round beat it |
|---|---|---|
| 1 | `dom:` **denylist** | `browser:` / `rendered:` / `client-side:` / empty string |
| 2 | `api:`/`footer:` **prefix allowlist** | **`api:document.querySelectorAll rows`** — simply prefix it |
| 3 | **whole-value content validation** | (holds so far) |

A denylist was answered with a prefix-allowlist, and a prefix-allowlist is defeated by writing the
prefix. The same shape as a sibling gate where a substring attack was answered with a minimum-LENGTH
rule and then beaten by 25 dashes. **When reviewing a fix, attack the fix's mechanism, not the
original payload.**

Round-3 state, CEO-verified with the control that makes it meaningful:

| payload | verdict |
|---|---|
| `api:document.querySelectorAll rows` | UNCHECKABLE exit 2 |
| **`api:GET /api/location/location-lookup => 200` (genuine)** | **PASS exit 0** |
| census artifact unrelated to the claim | FAIL exit 1 |
| stealth relabel — evidence kept only in probe prose | UNCHECKABLE exit 2 |

The second row is the point: without it, "the DOM-prefixed source is caught" is indistinguishable
from "everything with `api:` is rejected". Self-test **133/133**.
**False-positive rate: 20% → 0% across 7 honest maps** — the ramp disqualifier, now clean.

**Not claimed**: a fourth round would find nothing. Three rounds is materially stronger than one and
is not proof of exhaustion. The gate stays at `announce`, where a false negative costs coverage
rather than blocking legitimate work — which is the correct place for it while false negatives remain
plausible.

### The pattern this session established — five for five

| artifact | first genuine adversarial pass |
|---|---|
| fabrication detector | 3 holes → **5 MORE** on a second pass |
| provenance gate | 3 blockers (incl. a clean pass printed on 89% of real data) |
| recurrence detector (Plan B) | 1 blocker + 4 majors, **20% FP** |
| oracles 4/5 | 2 blockers |
| all 5 oracles, final state | 3 blockers + 4 majors, **20% FP** |

**Dispatcher self-verification failed to catch a blocker in 5 of 5 cases.** It is necessary and
demonstrably not sufficient. A 20% false-positive rate appeared independently in TWO gates, both of
which were on the verge of being ramped to `deny` — at which point the gate itself becomes the defect
by blocking legitimate closure.

**Method note**: the CEO's own probe initially reported 8/8 for the WRONG REASON — every payload
inherited the base fixture's pre-existing zero-effect violation, so nothing under test was actually
exercised. It was caught only by reading the per-sub-check messages rather than the exit code. Exit
code alone cannot distinguish "caught for my reason" from "caught for a different one".

### STILL OPEN
- `interaction_coverage_mode` is at `announce`; ramp to `deny` needs ≥10 clean sessions
  (`ramp_target: 2026-08-24`, deadline machine-enforced by `scripts/check-ramp-expiry.mjs`).
  **Time-gated, not work-gated** — no amount of effort closes this today.
- **A role-partition oracle** to close the `permission-invariant` gap above. This is the largest
  genuine gap the four harvest passes surfaced and deserves its own plan.
  **Recipient filed 2026-07-29 per LR-040(b)**: [SUBPLAN_GUARDRAIL_ROLE_PARTITION_ORACLE.md](SUBPLAN_GUARDRAIL_ROLE_PARTITION_ORACLE.md)
  — it extends the metamodel with `roles`/`actor` so the invariant is GENERATED rather than fixtured as a
  one-off (the `crud-derivable` discipline), carries NAV-4180 as its RED fixture, names per-role test
  credentials as the unlock, and carries `state-precondition` (NAV-3357) as a second homeless class so it
  does not orphan.
- Descriptions for D11-D25 (all harvested at summary level and flagged per-row as
  `harvestLevel: summary-only` — not passed off as deeper than they were).
- D9 still `SEARCHED-NOT-FOUND` — needs a source, or removal once someone confirms it was never a
  real rule.

### Method note that cost real time — worth reading before the next session
Four separate CEO-authored test harnesses produced **false greens** today, each for a different
reason: a truncated code extraction that exited 0 on a syntax error; run dirs with no logs so every
payload "caught" via fail-closed; payloads whose absolute Windows paths the parser's regex rejects;
and `countSource` written at the element top level when the source says plainly it *"lives in
probe.after"*. Every one looked like a clean result. The only thing that exposed them was an
**honest control** — a case that must come back CLEAN. A suite without one cannot distinguish
"did not fire" from "did not run". Read the implementation before constructing a payload against it.

---

## Acceptance criteria

- [ ] Phase 0 RCA consumed; taxonomy adjusted or confirmed against it (cite RCA rows)
- [ ] Interaction-axis taxonomy landed in field-case-generation.md (per-class mandatory effects)
- [ ] Interaction-map schema + drone probe scripts defined and versioned
- [ ] Pilot rediscovers 100% of the 2026-07-17 Override gaps machine-side (list them, tick each)
- [ ] Cross-Check Kernel: all 5 oracle classes implemented in drone probe scripts + checker; gate
      self-test RED on evidence-C dialog-Active row as-walked / GREEN once 1222 disposition attached
      (fixtures = the real 2026-07-17 C/D/E/F files, not synthetic)
- [ ] Every 2026-07-17 chat-found bug class has a named oracle + a fixture proving the checker
      catches it: 1604→failed-request, NM-1940→round-trip, NM-2186→UI-vs-persisted, 1222→zero-effect,
      virtualization→count-oracle, 1117/NM-2011→claim-census
- [ ] Generative oracle exists (`generate-invariants.mjs`); run against the Override metamodel emits
      an invariant set that SUPERSETS all 7 catch-list bugs — proven by mapping each bug to the I-row
      that catches it BLIND (no bug-history input to the generator); denominator = generated set, not
      a fixed list
- [ ] Domain-oracle harvest produces `domain-invariants.json` from Jira/Confluence/old-site (not web);
      generator consumes it alongside the CRUD set
- [ ] Honest residual named + floored: (1) unclassifiable control → LOUD UNKNOWN blocks closure
      (never silent); (2) undocumented intent → kernel flags the disagreement (detection), human only
      adjudicates (never the finding) — both route to the Human-Catch Reflex on first touch
- [ ] Closure gate lands `announce` with LR-069 ramp keys recorded
- [ ] Data-doctrine ladder encoded where dispositions are validated (gate + LR-040 text)

## Handoff

Chat-only per LR-039. Outcomes, not obstacles.
