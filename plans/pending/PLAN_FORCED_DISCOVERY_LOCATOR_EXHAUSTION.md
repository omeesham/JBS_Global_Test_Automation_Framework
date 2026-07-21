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
