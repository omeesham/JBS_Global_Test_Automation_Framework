---
artifact: jira-defect-crossref
module: discount-optimization
client: encore
session_date: 2026-08-10
author_identity: OWNER
identity_note: >
  Authored as OWNER. HUNTER is the documented author of this artifact class
  (.claude/agents/REQUIREMENTS.md workflow step 2), but AGENT_SHARED_RULES.md §2 carries no row for
  jira-defect-crossref-*, so HUNTER hits default-deny on it. Gap surfaced to the owner 2026-08-10 as an
  ALL-077 option-(b) governance candidate; NOT self-resolved, because editing §2 is a permission-layer
  change requiring explicit authorization.
parent_plan: plans/pending/PLAN_DISCOUNT_OPTIMIZATION_AUTOMATION.md
rovo_available: true
jira_tickets: [NM-3342, NM-3437, NM-3394, NM-3340, NM-3341, NM-3327, NM-1672, NM-3064, NM-1676, NM-3210, NM-3067, NM-3063, NM-2918, NM-3066, NM-2917, NM-2422, NM-1778, NM-2379, NM-3432, NM-2383, NM-2381, NM-2309, NM-2411, NM-2386, NM-2289, NM-2380, NM-2382]
sweep_jql: 'project = NM AND (summary ~ "discount optimization" OR summary ~ "special rate" OR text ~ "LocationSpecialRateSetting") AND updated >= "2026-07-01" ORDER BY updated DESC'
sweep_hits: 26
---

# Jira cross-reference — Discount Optimization (2026-08-10)

> **Column re-labelling, 2026-08-12** — after this artifact was recorded, the application re-labelled two
> grid columns: *No Implied Discount* → **Allow Special Rate**, and *No Implied Start* → **Special Rate
> Start Date**. This is a display-label change only; the underlying field and its Yes/No values are
> unchanged. The observations below are preserved verbatim as recorded on their date and deliberately keep
> the original column names.

Intent-truth axis. Every row here is a **LEAD**, re-verified against live DOM before it enters a test
case (ALL-024). Jira never overrides observed behavior; a divergence between the two is signal to
classify, not a tie to break in Jira's favor.

Verdict enum: `CONFIRMED-FIXED` · `STILL-REPRODUCES` · `NOT-APPLICABLE-ON-1604` ·
`OUT-OF-SCOPE-<reason>` · `UNVERIFIABLE-<reason>` · `PENDING-WALK`.
**A row still carrying `PENDING-WALK` at plan closure is an incomplete crossref.**

---

## HALT — in-flight behavioral-change tickets (surfaced before walking)

Three open tickets change what "correct" means for this module. Authoring cases against today's
behavior without resolving these risks encoding a defect as the expected result.

| Ticket | Status / Priority | What it changes | Why it blocks case authoring |
|---|---|---|---|
| NM-3340 | QA / **Blocker** | Tab 2 must list **only service types that roll up to Equipment**, not all service types | A tab-2 row-set assertion written today would assert the pre-fix (all-types) list |
| NM-3327 | QA / — | Adds search + sort to both tabs (PR #3111 merged 2026-08-04) | Determines whether search/sort cases exist at all, and on which tab |
| NM-3394 | QA / **Blocker** | Special Rate field editability incorrectly synced with Discount Optimization | Editability is the core assertion of the tab-2 cases |

**Deployment-scope caution on NM-3340**: Padmaja's 2026-08-05 comment says *"Changes have been deployed
to Training."* Training is not the automation target. Whether this fix is present on
`cloudapps-e2e` is unverified and must be established by DOM, not inferred from the comment.

---

## Rule text captured verbatim

**NM-3340 — the service-type filter rule**, quoted from the ticket description:

> "We will limit this list to only Service Types applicable to Discount Optimization - those service
> types that roll up to Equipment. Since labor, consumables, and fright, (system lines of fees do not
> appear as job detail lines so do not apply anyway) can be special rated already, there is no need to
> display these service types on the list, as it appears we need to check these service types as well."

Expected result: only equipment-rollup service types displayed.
Actual result (pre-fix): all service types displayed.
Repro context stated in the ticket: **office 1101**, user with the **Rev Mgmt. role**, Navigator Training.

Tab-2 cases must assert the **rule** (equipment-rollup membership), not a snapshot of today's row list —
the list changes as the service-type catalog changes; the rule does not.

**Two facts in that repro worth carrying forward**: the ticket exercises **1101**, not our default 1604;
and it names a **Rev Mgmt. role** gate. Both are live hypotheses for any empty or read-only observation
on this surface, and neither may be assumed without evidence.

---

## Ticket rows

| Ticket | Type | Status | Pri | Bearing on this module | Verdict |
|---|---|---|---|---|---|
| NM-3342 | Story | In Progress | Highest | The automation ticket itself | `OUT-OF-SCOPE-self` |
| NM-3340 | Story | QA | Blocker | Tab 2 limited to equipment-rollup service types | **`STILL-REPRODUCES`** on E2E — tab-2 list of 29 still carries non-equipment "… Services" rows; fix appears Training-only. Needs client confirmation of the rollup taxonomy |
| NM-3327 | QA Defect | QA | — | Search + sort on both tabs; PR #3111 merged 2026-08-04 | **Split**: search on tab 1 `CONFIRMED-FIXED` (functional, 2154 returned); sort behaviour on all four tab-1 columns `CONFIRMED-FIXED` — TC-DOP-OPT-010/011 prove reorder by first-row ID/name; TC-DOP-OPT-012/013 prove reorder by full column sequence (aria-pressed for boolean, date-input values for date); tab-2 search `STILL-REPRODUCES` (no search box on tab 2); tab-2 column resize `OUT-OF-SCOPE-column-resize-not-tested` — enumerated in field inventory 2026-08-11, disposition recorded in locations test plan out-of-scope table |
| NM-3394 | QA Defect | QA | Blocker | Special Rate editability incorrectly synced with Discount Optimization, "across locations" | `OUT-OF-SCOPE-order-screen-effect` — recorded follow-up |
| NM-3341 | QA Defect | **Done** | Highest | Page failed to load on **1101** with duplicate-key 500 | **`NOT-APPLICABLE-ON-1604`** — no regression here: the list API returns HTTP 200 with 2154 rows, no duplicate-key error, no 500. Not re-tested on 1101, where the defect originally lived |
| NM-3437 | QA Defect | **Rejected** | Blocker | "Add location to Discount Opt — new orders still allowing special rate"; raised 2026-08-10, rejected | `OUT-OF-SCOPE-rejected` — order-screen effect |
| NM-1672 | Story | QA | Highest | Parent feature: exemptions by service type (Short-Cycle enhancement) | `PARTIAL` — Jira metadata + attachment inventory captured (Story, status QA, priority Highest, two Word docs added 2026-05-17 by reporter: `Short Cycle Feature Enhancement - Service Type Exceptions to Discount Optimization.docx` 665 KB + `Co-Pilot User Stories based on 5-17-26 Req Doc.docx` 20 KB). Requirement text **not extracted** — binary .docx files require authenticated download. Would close on download + parse of both attachments. |
| NM-1778 | Sub-task | QA | Highest | Service types exempt from "No Implied Discount" rules | `UNVERIFIABLE-requirements-not-read` — Tab-2 exemption surface is exercised: TC-DOP-EXM-001/002/020/021 passed run2 (`discount-optimization-2026-08-11-run2.txt`). However NM-1778 is still QA status, parent NM-1672 requirement docs were not read, and NM-3340 (Blocker) will change which service types are in-scope. Cannot assert feature-complete against unread requirements. |
| NM-2422 | Sub-task | QA | Highest | Service Type — manage translation | `NOT-COVERED` — no spec file or comment references NM-2422 or a translation/i18n management path for service type names. No case drives this behaviour. Would cover by identifying the UI surface (if any) and authoring a targeted case once Jira content is read. |
| NM-3064 | Story | Done | Highest | `LocationSpecialRateSetting` publishes to shared environment | `OUT-OF-SCOPE-backend` — "publishes to shared environment" describes backend persistence propagation. Save-side UI cycle exercised by TC-DOP-OPT-050 (passed run1 `discount-optimization-2026-08-11-run1.txt`) and TC-DOP-EXM-020 (passed run2 `discount-optimization-2026-08-11-run2.txt`). Cross-location/cross-session propagation is not verifiable via UI automation. |
| NM-1676 | Story | Done | Highest | API: add DiscountPricing endpoint | `OUT-OF-SCOPE-api-layer` — API-layer story. The endpoint is called implicitly by every UI test on this surface (load + save paths), confirming reachability, but no direct API-layer assertions exist and the spec does not test at that layer. |
| NM-3210 | QA Defect | Done | Low | Active/Inactive filter showed incorrect results when toggled | `NOT-COVERED` — TC-DOP-OPT-070 (locations.spec.ts:361, passed run2) searches a deactivated-text fragment and clears; TC-DOP-OPT-071 (locations.spec.ts:370, passed run2) confirms deactivated rows are searchable. Neither toggles an active/inactive filter control or proves distinct active-vs-inactive result sets. Would cover by: identify the filter toggle (if present), drive it to each state, assert the two result sets are disjoint and jointly exhaustive. |
| NM-3067 | QA Defect | Done | Low | Manual date entry shifted digits between Month/Day/Year | `CONFIRMED-FIXED` — TC-DOP-OPT-033 (locations.spec.ts:277): enters digits sequentially into No Implied Start date input and asserts the resulting value equals `DOP_DATE_DIGITS_EXPECTED`, directly verifying no digit-shift across Month/Day/Year segments. Passed run2 `discount-optimization-2026-08-11-run2.txt`. |
| NM-3063 | QA Defect | Done | Highest | Save disabled after adding a location | `UNVERIFIABLE-no-addable-location` — TC-DOP-OPT-051 (the NM-3063 core assertion — Save enabled after completing an Add) is explicitly marked Not Automated in the spec (locations.spec.ts:462–465): the location picker shows "No results." on offices 1604, 1605, and 1101 because all local offices are already present in each list and none can be added. TC-DOP-OPT-091 (locations.spec.ts:467, passed run2) covers only the cancel-Add path. The blocker is environmental, not a product defect. |
| NM-2918 | QA Defect | Done | Medium | Save **enabled without any changes** | `CONFIRMED-FIXED` — TC-DOP-OPT-022 (locations.spec.ts:221): asserts Save disabled on pristine load. TC-DOP-OPT-021 (locations.spec.ts:211): toggles discount, reverts, asserts Save returns disabled. TC-DOP-EXM-002 (exemptions.spec.ts:64): same pristine-state assertion on tab 2. All three passed run2 `discount-optimization-2026-08-11-run2.txt`. |
| NM-2917 | QA Defect | Done | Highest | Update stayed disabled after toggling Implied Discount | `CONFIRMED-FIXED` — TC-DOP-OPT-072 (locations.spec.ts:722, labelled "NM-2917 regression lock"): asserts Save disabled on pristine load, toggles No Implied Discount, asserts Save becomes enabled. Passed run2 `discount-optimization-2026-08-11-run2.txt`. |
| NM-3066 | QA Defect | Done | Medium | Unsaved-changes popup shown incorrectly when switching tabs | `CONFIRMED-FIXED` — TC-DOP-OPT-065 (locations.spec.ts:343): with no pending changes (Save disabled), switches tab 1 → tab 2 and asserts zero `[role="dialog"]` elements appeared and no native dialog fired — directly verifying the false-positive popup defect. Passed run2 `discount-optimization-2026-08-11-run2.txt`. |
| NM-2309 | Story | QA | Highest | Kafka sync consumer writes back to HeliosCorp DB | `OUT-OF-SCOPE-backend` |
| NM-2379 / NM-2381 / NM-2383 / NM-2386 / NM-2289 / NM-2411 / NM-3432 | Story | mixed | Highest | Special Rate **Tax** — a separate surface | `OUT-OF-SCOPE-special-rate-tax` — recorded follow-up |
| NM-2380 / NM-2382 | Story | Done | Highest | Explicitly titled "DON'T DO" | `OUT-OF-SCOPE-cancelled` |

---

## Cross-checks already established against live DOM (2026-08-10)

Evidence: `.claude/state/ua-worker/chips/discount-optimization/out-t1/page.png` + snapshot text, office
1604 on `cloudapps-e2e`.

- **The surface renders on E2E.** Heading "Discount Optimization Settings", both expected tabs present
  ("Discount Optimization", "Special Rate Exemptions by Service Type"). This **refutes** the 2026-08-05
  product-owner claim that the code is not available in E2E. The plan's Phase 0 gate passes.
- **A search control exists on tab 1** — placeholder text "Search by location number or location name".
  That is NM-3327 summary item 2 landed on E2E. Items 1 (sort), 3 (service-type search), 4 (resize) and
  5 (tab-2 sizing) remain unverified. NM-3327 also carries an unresolved **disagreement**: dev stated on
  2026-07-31 that these tables "do not require sorting … search is not available there", while the BA
  position is that standards should be consistent across modules. That is a discussion item for triage,
  not a defect to file.
- **"0 locations found" on arrival — OPEN QUESTION, two live hypotheses, not yet a defect.** Second probe run
  (`out-t2/findings.json`, screenshots `tab1-loaded.png` + `dirtied-state.png`):

  | Measurement | Value |
  |---|---|
  | `locationsFoundText` on load | `0 locations found` |
  | DOM row count on load | `0` |
  | Row count **after using search** | `2154 locations found` |

  The grid sits in a **perpetual skeleton state showing "0 locations found"**, and the 2154 rows only
  materialise once the search control is exercised. The data exists; the initial load does not render it.
  2154 matches the count recorded in the plan's context, confirming the dataset is intact.
  **RESOLVED 2026-08-10 by run `dop-t3-load-tab2` — H2 confirmed, NO product defect.**
  A 60-second untouched poll (no click, type, scroll or sort) read `0 locations found` from t=1s through
  t=21s, then **2154 at t=22s**. Network capture over the same window:
  `GET /navigator/api/discount/optimization?skipPagination=true` → **HTTP 200, 2154 rows, 406,663 bytes**,
  fired immediately on page load. The call fires, succeeds, and the UI renders it — it simply takes
  ~22 seconds. Both earlier "0 locations" readings were samples taken before that.
  **No bug filed. The earlier defect hypothesis is withdrawn.**

  **The load latency is nonetheless load-bearing for automation**: ~22s to first render means every spec
  on this surface must wait on the row count becoming non-zero (or on the API response), never on a fixed
  timeout and never on `networkidle` (LR-023). A naive wait here is a guaranteed flake. Record as a
  performance observation for triage, not a defect.

  *Superseded reasoning, kept for audit trail — the two hypotheses that the test above resolved:*
  - **(H1) Product defect** — the initial load genuinely never populates the grid, and only an
    interaction triggers the fetch. Adjacent to NM-3341 (same "0 locations found" symptom, that one on
    1101 with a duplicate-key 500) but a different shape: no error toast, no "No results" text, just a
    loader that never resolves.
  - **(H2) Probe artifact** — the probe's wait condition was wrong and it sampled before the data
    arrived. The worker itself concluded this: *"The skeleton check fired too early … proving data was
    there but our wait condition was wrong."* Both `tab1-loaded.png` and the on-load reading may simply
    be early samples.

  **Do NOT file a bug on this yet.** What separates H1 from H2: an unattended observation that waits on
  a genuine settle condition with console + network capture — does the list API fire on load at all,
  does it error, or does it return data the UI fails to render? Until that exists, the honest status is
  UNRESOLVED. Recording it prominently because it is the single highest-value open question on this
  surface, and because a false bug filed against the client costs more than a late one.

- **The account CAN edit — the earlier read-only verdict is overturned.** `dirtied-state.png` shows the
  "No Implied Start" cell of row 1 (location 1115, The Abbey Resort) accepting typed input and rendering
  `99/9` with a red validation border and error icon. Save remained disabled because the value is
  **invalid**, not because the account lacks rights. A greyed Save on this surface means pristine-or-
  invalid, never "no permission". Any future read-only claim here must dirty a field with a VALID value
  first.

- **Sort IS present on tab 1 — the probe's `sortableHeadersCount: 0` was a selector miss.** The worker's
  corrected count on re-measure was **8 sortable headers**, and `dirtied-state.png` independently shows
  sort arrow icons beside ID, Location Name, No Implied Discount and No Implied Start, plus per-column
  drag handles. So NM-3327 items 1 (sort) and 2 (search) both appear landed on E2E via PR #3111.
  Presence is not behaviour: sorting must still be driven and its effect on row order observed before any
  case asserts it. Items 3 (service-type search), 4 (resize) and 5 (tab-2 sizing) are untested — tab 2
  was never reached.
  Worth flagging to the team: this **contradicts dev's 2026-07-31 position** on NM-3327 that these tables
  "do not require sorting … search is not available there". Sort and search are both shipping. That is a
  discussion item for triage, not a defect.

- **Possible NM-3067 recurrence (manual date entry shifts digits).** Typing `999` into the date cell
  produced `99/9`. NM-3067 is closed Done and describes digit-shifting between Month/Day/Year on manual
  entry. This is suggestive, not conclusive — it was an invalid-input probe, not a controlled repro of
  the closed ticket. Needs a deliberate re-test before it counts as a regression.

- **Tab 2 walked 2026-08-10** (run `dop-t3-load-tab2`, evidence `out-t3/ss-tab2-loaded.png` +
  `phase2-results.json`). Located by visible text after two selector failures.
  **29 rows.** Columns: `Service Type`, `Exempt`. Source API:
  `GET /navigator/api/discount/optimization/service-types?skipPagination=true` → HTTP 200, 29 objects.
  Only three rows carry `isSpecialRateAllowed: true` — Equipment Rental, HSIA - Equipment,
  HSIA - Subrental Equipment.

- **NM-3340 (Blocker) appears NOT deployed to E2E — the tab-2 list is still unfiltered.** The captured
  list of 29 contains multiple plainly non-equipment entries: `HSIA Services`, `HSIA - Wi-Fi Services`,
  `Telecom Services`, `Photographic Services`, `Virtual Events Professional Service`, `Digital Branding`,
  `Power Infrastructure`. NM-3340 requires the list be limited to service types that **roll up to
  Equipment**, explicitly excluding labor, consumables, freight and system fee lines. A list still
  carrying several `… Services` rows is the ticket's stated **Actual Result** (all service types shown),
  not its Expected Result.
  This is consistent with Padmaja's 2026-08-05 note that the change went to **Training** — our target is
  E2E, and E2E still shows pre-fix behaviour.
  **Confidence: high, not certain.** The Equipment-rollup taxonomy is Encore-owned and is not exposed in
  the API response, so membership cannot be machine-verified from here. Needs one confirmation from the
  client side — a good `/encore-questions` item. **Do not author tab-2 row-set cases until it is settled**,
  or they will encode the pre-fix list as expected.

- **Grid shape captured** (tab 1): columns ID, Location Name, No Implied Discount, No Implied Start, plus
  a per-row delete control. First rows: 1115 The Abbey Resort, 1121 InterContinental Chicago, 1133 The
  Dagny, 1134 Boston Marriott Copley Place. Note two rows whose names carry lifecycle markers —
  "Sheraton Stamford Hotel deactivated" and "The Westin New York Grand Central-DEACTIVATED" — relevant to
  NM-3210's active/inactive filter behaviour.

---

## CORRECTION 2026-08-11 — tab-2 control inventory was wrong (machine denominator overturned it)

The 2026-08-10 probe run reported tab 2 as having "no search box, no Add, no Save". **That was wrong on
two of three counts**, and it was recorded here without independent verification. The machine
enumeration (`reports/walk-coverage/dop-tab2.json`, 148 elements) shows these controls scoped inside
`radix-…-content-serviceTypeExemptions`:

| Control | Prior claim | Machine denominator |
|---|---|---|
| `input\|Search by service type` | "no search box" | **PRESENT** |
| `button\|Save` | "no Save" | **PRESENT** |
| `button\|Cancel` | not mentioned | **PRESENT** |

**Consequence for NM-3327**: item 3 ("Add ability to search service type — Service Type tab") is
**CONFIRMED-FIXED on E2E**, not still-reproducing. The earlier row in this file said the opposite.
Item 4 ("resize columns") also appears landed — the denominator carries explicit resize controls
(`Resize column locationNo`, `locationName`, `allowSpecialRate`, `startAllowSpecialRate`).

**Why this happened, recorded so it does not repeat**: a single probe's negative finding ("control not
found") was accepted as evidence of absence. A selector that fails to match proves nothing about the
product — only the machine enumeration, which walks the DOM itself, can support an absence claim.
Two separate probes had already failed to locate tab 2 at all, which should have lowered confidence in
any tab-2 negative from the same source.

### Underlying field names revealed by the enumeration (for page objects)

`locationNo`, `locationName`, `allowSpecialRate`, `startAllowSpecialRate` — these are the app's own
column identifiers, visible via the per-column resize controls. Per-row controls follow the pattern
`Remove <Location Name>` and `No implied discount for <Location Name>`; the date cell exposes
`input|Select date` plus `button|Open calendar`.

---

## Waivers

- **NM-3342's two description screenshots were waived by the owner on 2026-08-10** and deliberately not
  transcribed. Recorded here rather than silently passed, so the criterion is visibly dispositioned.

---

## Jira write-scope

Read-only. No transitions, no comments, no field edits were made against any ticket in this sweep.
