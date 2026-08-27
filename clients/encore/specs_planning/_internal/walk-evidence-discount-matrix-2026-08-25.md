---
module: discount-matrix
date: 2026-08-25
identity: HUNTER
scope: CRT (Search Criteria) · RWP (Region Weekly Peaks) · LOA (Location Activation)
out_of_scope: CMX (Company Matrix) — owned by NM-3343, untouched
offices_walked: [1604, 1101]
Coverage_Ratio: 35/35 (100%) — union of three machine-walked states, fully dispositioned in field-inventories/discount-matrix-2026-08-25.md (the authoritative manifest; this key corrected 2026-08-26 from the mid-walk 0/35)
CrossCheck: clean — all 6 A△B review-set elements classified (see the inventory's CrossCheck section)
Walk_State: module=discount-matrix walked=[resting,tab:region-weekly-peaks,tab:location-activation] office=1604
Walk_Mode: quick
baselineScope: complete (CRT + RWP + LOA all captured — see old-site-baseline/discount-matrix-2026-08-25.md)
jira_tickets: [NM-3530, NM-3485, NM-3475, NM-3441, NM-3440, NM-3435, NM-3391, NM-3294, NM-3293, NM-3275, NM-3256, NM-3253, NM-3238, NM-3234, NM-3232, NM-3230, NM-3229, NM-3062]
evidence: .playwright-cli/dsm-2026-08-25/ · reports/walk-coverage/dsm-crt-skelgate.{json,manifest.md} · reports/walk-coverage/dsm-rwp--tab-region-weekly-peaks.{json,manifest.md} · reports/walk-coverage/dsm-loa--tab-location-activation.{json,manifest.md} · superseded: dsm-crt-landing, dsm-crt-recheck (pre-skeleton-gate, denominator 11)
---

# Walk evidence — Discount Matrix (CRT / RWP / LOA), 2026-08-25

## Denominator dispute — RESOLVED 2026-08-25 (scanner fixed, not worked around)

`enumerate-page.mjs` originally returned **denominator = 11** twice, omitting every Search Criteria
control. Root-caused by direct execution of the real code path, not by inspection:

- Scope was NOT the cause — the controls are inside `<main>`, and `inPageEnumerate('main')` returns
  all of them once the page has hydrated.
- Role filtering was NOT the cause — `combobox` is in `WIDGET_ROLES` and passes every gate.
- **The cause was the readiness gate.** `waitReady` required only 3 identical census polls (~900ms of
  quiet). Measured hydration on this surface: shell at t=10s, placeholders at t=20s (census settles at
  30), criteria dropdowns at t=31s, and the GAV threshold input not until **t=91-100s**. The gate
  returned at ~22s and enumerated a page that was still two hydration stages from complete.

**Fix applied** (`scripts/walk-coverage/enumerate-page.mjs` + `lib/deep-pierce.mjs`): readiness now also
requires the loading-placeholder census to reach zero. This app marks placeholders with the shadcn/ui
convention `data-slot="skeleton"`, so it is a generic framework signal, not a per-surface knob — LR-062
still holds. The count rides on the enumerate call already made each poll, so it costs no extra round
trip. A fixed timeout was deliberately rejected as an invented threshold; zero-skeletons releases
exactly when the last placeholder resolves. Default timeout raised 120s to 180s because full hydration
was measured at 91s and 100s. A permanently stuck skeleton now fails loudly rather than under-counting.

**Verified**: unit suite `enumerate-page-fixes.test.mjs` 126 passed / 0 failed with **no test changes**;
live re-run `--state=dsm-crt-skelgate` returns **denominator = 17**, up from 11.

**Six controls were invisible to every prior walk of this surface** — the three criteria comboboxes,
the GAV threshold input, and the per-row `Edit` / `Delete` grid archetypes.

### Selector consequence (corrects an earlier statement in this file)

`GAV Discount Threshold` **does** carry a stable locator: `name="gavDiscountThreshold"`, enumerated as
`name:gavDiscountThreshold|input`. An earlier draft of this artifact said CRT had no stable locators at
all; that is now known to be wrong for this field. It remains true for `Country`, `Currency` and
`Business Tier`, which are `<button role="combobox">` with no `data-testid`, no `name` and no
accessible name — their only stable anchor today is structural.
## Surfaces observed live (2026-08-25, office 1604 e2e unless stated)

### CRT — Search Criteria bar
`Country` = `United States`, `Currency` = `USD`, `Business Tier` = `Standard`,
`GAV Discount Threshold`, `Save` (disabled at rest). Zero `data-testid` in the criteria region.
Controls are `<button role="combobox">` with no accessible name — `getByRole('combobox', {name})`
cannot resolve them.

### RWP — Region Weekly Peaks
At rest with **no Year and no Region selected**: `Select Year` and `Region` comboboxes render empty and
`Add Year`, `Export`, `Import`, `Cancel`, `Save` are **all disabled**; grid shows `Count: 0` under
headers `Week | Start Date | Non-Peak | Standard | Peak`.
Populated-state evidence from 2026-08-19 (`.playwright-cli/page-2026-08-19T12-15-01-480Z.yml`):
with `2027` + `Atlanta` selected the grid renders week rows (`1 / 03-Jan-2027`, `2 / 10-Jan-2027`, …)
each with three checkboxes, exactly one checked per row.
**Population path (c.1): Year + Region selection.** This is the toolbar's enabling gate.

### LOA — Location Activation
**First capture of this surface in this repo's history.** Grid headers
`Location | Workflow Start Date | Active`, each with a `Resize column` button. Search box
(`Search by location number or location name`), `Cancel` and `Save` are **all disabled**. Footer reads
**`0 matching locations`**; 12 placeholder rows carry no cell text.
Observed identically on office **1604** and office **1101** — N≥2 per LR-061-A, so this is not a
single-office data quirk. Criteria were fully populated (US / USD / Standard) at the time, so the
emptiness is **not** criteria-gated.

**CORRECTION (2026-08-25 evening, walk-integrity):** the paragraph above recorded the tab's
**loading window, not its final state**. The first spec run against this contract failed with the
grid fully populated — footer `2041 matching locations`, real rows, search enabled — and a timed
re-probe (`reports/walk-coverage/dsm-loa-load-timeline-probe.json`) shows the sequence on BOTH
offices: from tab click to ~41s the grid holds textless placeholder rows with the search box
disabled (exactly what the walk recorded), and real data lands at ~43s (skeletons 30→0, 28 rendered
rows, search enabled). The morning walk did not wait out the ~40s per-tab lazy fetch that the RWP
section below documents for its own tab. The N≥2 two-office check gave false confidence: both
samples shared the same too-early read, so they shared the same bias — independence needed a varied
WAIT, not a second office. The listing is country-scoped per the governing ticket (all 2041 US
locations on either office), which the corrected LOA cases now assert.

## Empty-surface investigation — LOA (HARD STOP #12 / LR-040(c))

- **c.1 population path** — not established on e2e. NM-3253's reproduction steps edit real
  `Workflow Start Date` rows on office **1101 of `cloudapps-dev`**, which proves the surface populates
  and renders editable rows in some environment. Per LR-ENC-007 a `cloudapps-dev` URL is a surface
  pointer, never a build target, so that is evidence of feasibility only — not a licence to test there.
- **c.2 classification** — **`data-blocked`** on the e2e environment. Justification: the feature is
  implemented and has shipped defects against it (NM-3253, NM-3232 both Done), and the UI renders its
  full chrome; only rows are absent, on both authorized offices.
- **c.3 escalate** — routed to `/encore-questions`: *what associates locations to the Location
  Activation grid on e2e, and is any authorized office expected to carry them?* Until answered, no LOA
  case may assert row-level behaviour; only the empty/disabled contract is assertable.

**RESOLVED 2026-08-25 evening — the whole investigation was chasing a loading-window artifact.**
c.1: the population path needed no establishing — the grid was populated all along (country-scoped
per NM-2221: all 2041 US locations, on any office). c.2: the `data-blocked` classification is
RESCINDED; the correct classification is walk-error (read taken inside the ~40s lazy-fetch window).
c.3: the escalation question is WITHDRAWN from the `/encore-questions` queue — nothing associates
locations to an office; the listing is country-keyed. Row-level cases are unblocked and written
(TC-DSM-LOA-009 … -011). Evidence: `dsm-loa-load-timeline-probe.json` + the four affordance/toggle
probe JSONs in `reports/walk-coverage/`.

## Observations

### Bugs / Defects

**Amended 2026-08-25 (second pass).** The original verdict below was *none*, and that was correct for
the element walk — walking controls cannot surface how a control treats a value. A field-level input
probe run afterwards found three behaviours worth flagging. Evidence:
`reports/walk-coverage/dsm-gav-boundary-probe.json` (15 typed values) and
`reports/walk-coverage/dsm-revert-styling-probe.json` (clean revert, computed colours, checkbox model).

**DSM-OBS-1 — GAV Discount Threshold silently rewrites non-conforming input into a different valid
number.** Measured on office 1604:

| Typed | Ends up as | Outline | Save |
|---|---|---|---|
| `-5` | `5%` | normal | enabled |
| `1.2.3` | `1.2%` | normal | enabled |
| `1e2` | `12%` | normal | enabled |
| (cleared) | `0%` | normal | enabled |

In each row the user is left holding a number they did not enter, with no error, no highlight, and Save
ready to commit it. `1e2` is the sharpest: it means one hundred and becomes twelve. `-5` is the most
likely in practice — the minus is refused at the keystroke and the positive remainder is accepted, so a
user entering a negative discount silently gets a positive one. Contrast with genuinely out-of-range
input (`101`), which the app *does* refuse. So the app has a rejection path and does not use it here.
Not filed as a bug: whether rewriting beats refusing is a product decision, not a defect on its face.
It is recorded so the decision is made deliberately. `007` → `7%` is the same mechanism and is
harmless — same number either way.

**DSM-OBS-2 — the out-of-range refusal never says what the limit is.** `101` and above turn the field
outline red (`oklch(0.577 0.245 27.325)` against a normal `oklch(0.9 0.015 286)`) and disable Save. A
page-wide text scan while the field was in that state returned no wording naming 100, no inline message,
and no tooltip. The refusal is real and the field is never focus-trapped — a natural Tab moved focus out
on all 15 values tried — but a user who types 105 sees Save grey out with nothing explaining why. This is
a behaviour/UX observation about a missing message, not a markup finding.

**DSM-OBS-3 — a week can be left with no classification at all, and Save offers to commit it.** Clicking
the ticked box on a Region Weekly Peaks row clears it, leaving zero of the three ticked, and Save enables.
That contradicts the one-per-row rule TC-DSM-RWP-007 asserts across all 52 rows. Whether the server
accepts such a row is **not** established — the probe deliberately stopped before Save. Worth resolving:
either the invariant is wrong or the grid should not permit the state. Recorded as TC-DSM-RWP-014.

**NM-3238 does not reproduce.** The same probe answers the open question the first pass could not: a
ticked Peak / Standard / Non-Peak box clears on click, on office 1604 with `2027` / `Atlanta`, as of
2026-08-25. The ticket's reported symptom is absent on this data. The model is otherwise mutually
exclusive — clicking an unticked box ticks it and clears the previous one by itself.

---

**Original element-walk verdict, unchanged:** no new behaviour defect was confirmed during the element
walk. Two candidate signals were checked and both resolved to *already-fixed*, not new:
- NM-3234 (`Add Year` enabled with no Year/Region) — observed **disabled** today; the fix is live.
  Cover as expected behaviour; do not re-file.
  **CORRECTED 2026-08-25 evening**: that "disabled" read was the ~40s loading window (the same
  misread class as the LOA empty-state). Once loaded, the tab always has Year/Region selected and
  `Add Year` is ENABLED (run screenshot, TC-DSM-RWP-009 evening evidence) — so the ticket's
  no-selection state is not reachable on a normal open and NM-3234's fix status is UNVERIFIED
  either way. The RWP-009 case now asserts the loaded split (data actions open, edit pair closed).
- The criteria bar's missing accessible names and absent `data-testid` are markup findings. Per this
  client's standing policy these are **not** filed as bugs, TCs or observations — they are recorded as
  a selector-strategy constraint and an LR-029 missing-testid report instead.

No RWP or LOA behaviour was classified as a regression, because their old-site baseline is not
captured (`baselineScope: partial`) and HARD STOP #10 forbids regression classification without it.

**Amended 2026-08-25 evening (LOA populated-state re-measurement).** Two behaviour defects found on
the loaded Location Activation grid, both inside NM-2221's own scope line "sortable / filterable
per legacy behavior" (intent divergence, not baseline regression — the old-site LOA baseline is
still uncaptured):

**DSM-OBS-4 — the enabled search box silently ignores input typed during a ~2-minute post-load
dead window** *(restated 2026-08-26 — originally recorded as "accepts input and filters nothing")*.
Placeholder promises "Search by location number or location name"; typed `1102` was read back from
the input's own value, then the listing and the `2041 matching locations` footer stayed identical
through a 20-second poll, an Enter press, and a further 3s. Filed as **BUG-DSM-LOA-001**
(later withdrawn — see the owner ruling below). Evidence:
`dsm-loa-affordance-probe2.json` (`afterTyping.searchValue: "1102"`, `filterWithoutEnter: null`,
`filterAfterEnter` unchanged). **Restatement (2026-08-26)**: the owner's manual screenshot showed
the same search working; a staged-retry probe isolated the variable — identical typing fails
immediately after settle and after +30s idle, then succeeds after a further +60s idle (footer
`1 matching locations`, single row `1102 - Corporate Office - Long Beach`). All 2026-08-25 probes
had typed inside the dead window. The search works at steady state; the defect is the enabled
input silently discarding early keystrokes with no feedback. Evidence:
`dsm-loa-search-reverify.json` (filed steps reproduced verbatim) +
`dsm-loa-search-reverify2.json` (staged retries; `verdict: FILTERS-EVENTUALLY`).
**Owner ruling (2026-08-26, later the same day)**: the warm-up window is accepted loading
behaviour, not a defect — BUG-DSM-LOA-001 withdrawn (status `withdrawn`, verificationLog
`WITHDRAWN-ACCEPTED-BEHAVIOR`). The measured facts above stand as the record of the window
itself; TC-DSM-LOA-010 was reworked into a passing steady-state case that retypes in bounded
rounds until the warm-up ends.

**DSM-OBS-5 — the grid is not sortable.** Header clicks reorder nothing; no `aria-sort` appears
before or after; the only header controls are the resize handles. NM-2221 scope names the grid
"sortable … per legacy behavior". Filed as **BUG-DSM-LOA-002**. Evidence:
`dsm-loa-affordance-probe.json` (`sortProbe` before/after cells identical, `ariaSort: null`
throughout).
**Owner ruling (2026-08-26)**: sorting is not in the design and not expected in this feature —
the no-sort grid is working as designed (the authorized old-site check agrees: the legacy grid
carries no sort affordance either). BUG-DSM-LOA-002 withdrawn (status `withdrawn`,
verificationLog `WITHDRAWN-WORKING-AS-DESIGNED`); TC-DSM-LOA-011 was reworked to pin the
display-only header contract as a passing case. The measured facts above stand as the record.

**Discussion item (not filed): unattributed data drift on shared e2e.** Row `1101 - Corporate
Office Encore USA SGA`'s Workflow Start Date read `08/15/2029` in the 17:0x spec-run screenshots
and `08/16/2029` in the 17:30+ probes. Neither the specs nor the probes type into date cells, and
the panel's Save stayed disabled throughout both sessions — an external writer (person or job) is
active on this surface. Ambiguous single-row signal per the discussion-item policy; recorded so a
future persistence case knows this cell is not stable ground.

### Suggestions / Improvements

- Add a `data-testid` to each of the four criteria controls. They are the module's single largest
  selector-stability risk and the only reason CRT cannot use role-based locators.
- ~~`enumerate-page.mjs` drops nameless/value-named buttons.~~ **Retracted 2026-08-25** — written before
  the RCA in this file concluded. Name-dropping was never the cause; the readiness gate was. The two
  statements contradicted each other inside one artifact, which is how a wrong lead outlives its refutation.
- ~~NM-3238 — confirm whether mutual exclusivity is the intended model before authoring an uncheck case.~~
  **Answered 2026-08-25** by the checkbox probe, and the answer is both: the columns *are* mutually
  exclusive (the app clears the old tick for you), *and* a ticked box can still be cleared to leave the
  row with none. TC-DSM-RWP-014 is now a real case instead of a placeholder. What remains open is not the
  model but DSM-OBS-3 — whether a week with no classification is a state the product intends to allow.
- Give the threshold field an error message. It already knows the value is out of range (DSM-OBS-2) and
  already refuses to save it; it just never says so. One line naming the 0–100 limit would turn a dead-end
  into a correctable mistake, and it is the cheapest of the improvements listed here.

---

## RWP walk — captured 2026-08-25, work halted immediately after (owner instruction)

Live, office 1604 e2e. No value was edited and no Save was pressed; dropdowns were opened and closed
with Escape only. Application state is unchanged by this walk.

### Correction to the earlier "empty at rest" reading in this file

`Select Year` and `Region` are **pre-populated** at rest (`2027` / `Atlanta`). The earlier entry above
recording them as empty was read from an unhydrated snapshot and is wrong. The controls only *look*
empty before hydration completes.

### Two-stage load — RWP data lags the tab click by ~40s

| Moment | rows | checkboxes | skeletons | footer |
|---|---|---|---|---|
| tab click + 2ms | 52 | 0 | 260 | `Count: 0` |
| tab click + 40595ms | 52 | 156 | 0 | `Count: 52` |

Total from navigation to usable RWP data: **134s**. The 52 rows exist immediately but are placeholder
rows; `Count: 0` and zero checkboxes are the *loading* state, not an empty result. **Any RWP test must
gate on the skeleton census reaching zero (or checkbox count > 0), never on row count** — row count is
52 in both states and cannot distinguish them. This is the same trap as the grid-skeleton rule already
recorded for this app, now confirmed on a second surface.

156 checkboxes = 52 weeks x 3 columns (Non-Peak / Standard / Peak).

### Toolbar at rest (before data arrives)

`Add Year`, `Export`, `Import`, `Cancel`, `Save` are **all disabled**. NM-3234 (Add Year enabled with no
Year/Region) is therefore not reproducible here and reads as fixed.

### Dropdown option sets (machine-read from the live DOM)

- **Select Year** (3): `2027`, `2026`, `2025`
- **Region** (28): `Atlanta`, `Austin`, `AZ`, `Boston`, `Central FL`, `Chicago`, `CO`, `DC / Balt.`,
  `DFW`, `FL Gulf Coast`, `Hawaii`, `Houston`, `LA`, `LA / AL`, `Las Vegas`, `Miami`, `MO / MN`,
  `NC / SC`, `NY / CT`, `OH / MI`, `Philadelphia`, `PNW`, `PR`, `San Antonio`, `San Diego`, `SF`,
  `TN / KY`, `VA / W PA`

`LA / AL` is present in the option list — that is the exact region named in NM-3293 ("UI does not
display data for 'LA / AL' region despite data being present"). Whether it now returns data was **not**
tested; the walk was halted before any region other than the default `Atlanta` was exercised.

### Not done (halted, not skipped)

Region/Year switching deltas, the `Add Year` / `Import` / `Export` openers, the checkbox
mutual-exclusivity question from NM-3238, and the RWP old-site baseline all remain uncaptured.

---

## Branch enumeration — RWP and LOA machine-walked, 2026-08-25 (second session)

The walk above was machine-enumerated in the **resting state only**. Its own coverage manifest recorded
`walked=[resting]` with `containersFound: 23, neverOpened: 23`, so the Region Weekly Peaks and Location
Activation tabs were observed by hand but never entered the denominator. A `Coverage_Ratio` measured on
the resting surface alone cannot support a 100% claim for three sub-tabs.

`discount-matrix` is now a declared surface in `scripts/walk-coverage/lib/module-config.mjs` with three
`requiredStates`, so `verify-denominator.mjs` can prove each one was walked instead of passing vacuously.

| state | machine denominator | provenance JSON |
|---|---|---|
| `resting` (lands on Company Matrix) | 17 | `reports/walk-coverage/dsm-crt-skelgate.json` |
| `tab:region-weekly-peaks` | 20 | `reports/walk-coverage/dsm-rwp--tab-region-weekly-peaks.json` |
| `tab:location-activation` | 20 | `reports/walk-coverage/dsm-loa--tab-location-activation.json` |
| **union (the module denominator)** | **35** | all three |

Composition of the 35: **11** shared chrome (criteria bar + tablist + the three tab triggers, present in
all three states), **6** Company Matrix (out of scope — NM-3343), **9** RWP-unique, **9** LOA-unique.

### Three tooling defects were in the way, all found by running it

1. **Branch runs crashed after a full enumeration.** `report.base_state` was built only on the resting
   path; the shared `atEmit` write then threw `Cannot set properties of undefined`. Every branch run
   paid for a complete walk and then discarded it.
2. **Branch output was silently lost on Windows.** The state name embedded the branch label verbatim and
   the sanitiser explicitly preserved `:`. `dsm-rwp--tab:region-weekly-peaks.json` became a 0-byte file
   named `dsm-rwp--tab` with the JSON in an NTFS alternate data stream no reader opens. Reproduced twice.
3. **Type derivation ran against the wrong panel.** `deriveAllFieldTypes` renavigates to the originating
   URL first — correct for the resting path, where the opener loop may have wandered — but on a branch
   run that lands on the *default* panel, so every branch-specific element was probed against a DOM that
   no longer contained it (`page.$eval: Failed to find element`). It now re-applies the branch first.

Defects 1–3 were not introduced by this module; they sit on the shared branch path and **Service Charge
History is the other configured branch consumer**, so its walks carried the same holes.

`base_state.atEmit` is *not* evidence a branch flipped — it is read after that renavigation and always
reports the default panel. The proof is `report.branches[].addedKeys` plus the branch panel's own keys
appearing in `entries`.

### LOA — the machine found row-level controls the manual pass did not

The manual reading above recorded Location Activation as empty chrome with everything disabled, and
concluded that *"no LOA case may assert row-level behaviour"*. The enumerated row template contradicts
the second half of that:

| element-key | DOM evidence | what it is |
|---|---|---|
| `struct:input\|Search by location number or location na\|…` | `tag=INPUT;type=text` | the search box |
| `struct:input\|Select date\|td/div/div/div/div/div` | `tag=INPUT;type=text` | Workflow Start Date cell editor |
| `struct:button\|Open calendar\|…` | `tag=BUTTON` | its date picker |
| `struct:button\|Yes\|div/table/tbody/tr/td/div` | `tag=BUTTON` | Active column, true state |
| `struct:button\|No\|div/table/tbody/tr/td/div` | `tag=BUTTON` | Active column, false state |

**This answers the LR-036 boolean-render question for this table without a further walk**: the `Active`
column is **not** a Unicode tick, an SVG check, or an empty cell — it is a `Yes` / `No` button pair. Any
reader helper written against the other three formats would have been wrong.

**What this does and does not change.** The controls are in the DOM and their render format is now known,
so the empty-state contract can name them. It does **not** lift the data block: the footer still reads
`0 matching locations` on both authorized offices, and the enumerator archetype-collapses `td`-scoped
elements, so these may be the 12 placeholder rows' template rather than operable controls. Whether they
respond to input with zero locations loaded is **not established** and must not be assumed. The
`/encore-questions` escalation stands unchanged.

## Old-site LOA baseline click (2026-08-26 — the authorized single click, spent)

The owner-authorized single non-mutating tab click on the legacy page was spent on the Location
Activation tab (Playwright CLI, fresh runner auth state loaded via state-load after the CLI's own
saved state hit the sign-in redirect). Observed, read-only:

- Same three columns as the new site (Location / Workflow Start Date / Active) and the same leading
  country-scoped rows (1101 Corporate Office Encore USA SGA, 1102 Long Beach, 1105, 1107, 1112…).
- A search box sits above the listing — the affordance the new site inherits. It carries no visible
  framework binding, and its function was NOT driven (typing sits outside the one-click grant).
- **No legacy sort affordance**: every header has no click handler, no link, default cursor, and no
  sort state. The legacy grid is not sortable.
- Active renders as a plain per-row checkbox (checked/unchecked) — a simpler edit affordance than the
  new site's label-button-to-checkbox cycle.

Consequences applied: the not-sortable finding is reclassified **baseline-match** (ticket-text
divergence — NM-2221 says "sortable / filterable per legacy behavior" while neither implementation
sorts); the search defect stays filed on the new site's own promise (enabled box + search placeholder
that does nothing). The RWP legacy panel remains uncaptured — one more click would be a second grant.

**Save-dialog answer (final green run, 2026-08-26)**: zero dialog lines across the whole 59-green
suite run — the Discount Matrix saves (criteria and panel) fire NO confirmation dialog on this page.
The optional dialog handling inside the save helpers is a defensive no-op, kept because sibling
Location Settings tabs do use the shared dialog and the guard costs nothing when none appears.

## Old-site RWP baseline click (2026-08-26 — second grant, given in chat, spent)

The owner granted one more non-mutating old-site click ("one click approved ... you have my go")
and it was spent on the Region Weekly Peaks tab (Playwright CLI, fresh runner state re-loaded after
the session expired again). Read-only, with a settled re-read 8s after the click before recording:

- Grid columns identical to the new site: Week / Start Date / Non-Peak / Standard / Peak; three
  checkboxes per row; live data shows exactly one checked per week (rows 1-3: Non-Peak / Standard /
  Peak). 27 rows rendered in the visible scroll window (the new site paints all 52).
- Week starts are Sundays: week 1 of 2026 renders 04-Jan-2026 in the probing machine timezone.
- Year select: 2025 / 2026 / 2027 oldest-first, **resting on 2026**. Region select: same 28-region
  list, Atlanta first and selected. The new site rests on **2027**, newest-first — a default-policy
  divergence (current year vs next year), recorded for classification, not filed.
- At-rest toolbar: Add Year / Export / Import enabled, Save / Cancel disabled — a baseline MATCH for
  the corrected contract (the walk's earlier all-disabled read was the loading-window misread).

No option was changed, no checkbox touched, no save pressed. Old-site state untouched beyond the
tab activation.
