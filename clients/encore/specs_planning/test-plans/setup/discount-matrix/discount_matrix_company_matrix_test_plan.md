# Discount Matrix — Company Matrix (Tab 1) Test Plan

**Module**: discount-matrix
**Test Cases**: specs_planning/test-cases/setup/discount-matrix/discount_matrix_company_matrix_test_cases.md
**Location Under Test**: 1604 (Parker Palm Springs)
**Updated**: 2026-08-20
**Implemented**: clients/encore/tests/discount-matrix/company-matrix.spec.ts
**Discovery basis**: live walk of office 1604 on 2026-08-19; full Edit Tier dialog field inventory,
Export surface, and GAV Discount Threshold contract measured in follow-on probe runs the same date.
**Coverage mode**: quick — Axis-2 surface families covered at L1 must-assert depth only.

> **Critical precondition for every scenario**: The Company Matrix grid is keyed by
> `(Country, Currency, Business Tier)` and is **not** immediately populated on navigation —
> the grid container appears in the DOM before its data arrives. Every scenario must wait for
> a **non-zero tier-row count** before any interaction or assertion. Waiting on the container
> alone produced three false "grid is empty" findings on the sibling Discount Optimization
> page; the same trap exists here. Additionally, a degraded-session condition (walk evidence
> §12) can cause an empty grid that is indistinguishable from a legitimate empty state — a
> session-freshness control (fresh auth-state load) must be applied before any observation of
> an empty grid is treated as meaningful. See also the known risks section below.

---

## Scope

**Tab**: Company Matrix (Tab 1) of the Discount Matrix module.
**Route**: `/navigator/locations/1604/settings/discount-matrix`
**Office**: 1604 (Parker Palm Springs), `cloudapps-e2e.encoreglobal.com`.
**Surfaces covered**: criteria bar (Country, Currency, Business Tier, GAV Discount Threshold),
the read-only tier grid, the Edit Tier dialog, the Export toolbar action, and the Add Tier
toolbar action (cancel-only — see Out of Scope for the commit half).

---

## Test Cases

42 cases total, `TC-DSM-CMX-001..042`. Count and ID range derived directly from the heading
list in `discount_matrix_company_matrix_test_cases.md` (grep `^### TC-DSM-CMX-` → 42 matches).
Cases are grouped below as the spec file groups them into its two `test.describe` blocks.

### Group 1 — Header controls drive the grid
*Spec describe: "Discount Matrix — Company Matrix: header controls drive the grid"*
*Cases TC-DSM-CMX-001..007. Every test in this group navigates fresh via `open()` and
asserts independently.*

| TC ID | One-line intent |
|---|---|
| TC-DSM-CMX-001 | Grid loads with all 9 tier rows and correct defaults when all three header keys are set |
| TC-DSM-CMX-002 | Changing Country issues a re-query POST and the grid reflects the new key |
| TC-DSM-CMX-003 | Changing Currency issues a re-query POST and the grid reflects the new key |
| TC-DSM-CMX-004 | Changing Business Tier issues a re-query POST and the grid reflects the new key |
| TC-DSM-CMX-005 | Header Save persists only the GAV Discount Threshold; matrix row values are unchanged after save and reload |
| TC-DSM-CMX-006 | A key combination with no matrix rows renders a correct empty state (not a data gap) |
| TC-DSM-CMX-007 | A cancelled dialog edit is not carried across a header change or reload |

### Group 2 — Grid surface, Edit Tier dialog, Export, Add Tier, GAV Threshold field
*Spec describe: "SBC — discount matrix company matrix"*
*Cases TC-DSM-CMX-008..042. All tests navigate fresh via `open()`; none clicks Save or
leaves a mutation on the office.*

**Section B — Grid surface (Axis 2, L1 must-asserts): TC-DSM-CMX-008..012**

| TC ID | One-line intent |
|---|---|
| TC-DSM-CMX-008 | Column structure is exactly 3 groups × 7 day-buckets (21 percentage columns) |
| TC-DSM-CMX-009 | Tier ranges are contiguous and non-overlapping across all 9 rows |
| TC-DSM-CMX-010 | Grid body contains zero editable inputs — all 189 percentage values are static text |
| TC-DSM-CMX-011 | Grid readiness requires a non-zero row count, not merely a visible container |
| TC-DSM-CMX-012 | Every tier row exposes exactly one Delete and one Edit control, located by range text |

**Section C — Edit Tier dialog (Axis 1, per-field FCC): TC-DSM-CMX-013..024**

| TC ID | One-line intent |
|---|---|
| TC-DSM-CMX-013 | Dialog roster: title, 21 decimal inputs, Cancel and Update buttons, no tier-boundary fields |
| TC-DSM-CMX-014 | Whole number `14` renders `14%` with Update enabled (NM-3235 regression guard) |
| TC-DSM-CMX-015 | Decimals below 1 (`0.14`, `0.5`) are multiplied by 100 and render as percentages |
| TC-DSM-CMX-016 | Single-digit `1` renders `1%`, not `100%` (NM-3387 regression guard) |
| TC-DSM-CMX-017 | Upper boundary: `100` accepted, `101` rejected with Update disabled |
| TC-DSM-CMX-018 | Out-of-range value disables Update and is never persisted after Cancel |
| TC-DSM-CMX-019 | Out-of-range rejection shows no visible message — intentionally asserts the defect (DEFECT-1) |
| TC-DSM-CMX-020 | Negative sign is refused by the input handler; remaining digits are processed normally |
| TC-DSM-CMX-021 | Empty and non-numeric input silently resolve to `0%`; Update stays enabled |
| TC-DSM-CMX-022 | Input index 0 opens as raw decimal while inputs 1–20 open percent-formatted — intentionally asserts the defect (DEFECT-2) |
| TC-DSM-CMX-023 | Repeated focus cycling does not alter an out-of-range value (NM-3390 regression guard) |
| TC-DSM-CMX-024 | Cancel discards every pending edit; the row is byte-identical to its pre-edit state |

**Section D — Toolbar surfaces: Export and Add Tier: TC-DSM-CMX-025..033**

| TC ID | One-line intent |
|---|---|
| TC-DSM-CMX-025 | Export downloads a workbook whose filename is derived from the current criteria bar values (NM-3255 regression guard) |
| TC-DSM-CMX-026 | Export POST returns HTTP 200 with a spreadsheet content type (NM-3062 regression guard) |
| TC-DSM-CMX-027 | All 189 exported cells match the rendered grid, cell for cell |
| TC-DSM-CMX-028 | Exported workbook structure matches the round-trip template shape (instruction row, header rows, data rows) |
| TC-DSM-CMX-029 | Export ID column carries a 36-character GUID — asserts the agreed post-migration contract (NM-3236) |
| TC-DSM-CMX-030 | Add Tier dialog opens with one End Tier input and a disabled confirm button |
| TC-DSM-CMX-031 | End Tier validation is submit-time, not blur-time; pre-submit state only (NM-3237, stops before confirm click) |
| TC-DSM-CMX-032 | Non-numeric input into End Tier is refused silently; the field stays empty and confirm stays disabled |
| TC-DSM-CMX-033 | Cancelling Add Tier leaves the grid untouched at 9 rows in the original order |

**Section E — GAV Discount Threshold field: TC-DSM-CMX-034..042**

| TC ID | One-line intent |
|---|---|
| TC-DSM-CMX-034 | Threshold accepts a whole number and renders it as a percentage |
| TC-DSM-CMX-035 | Threshold multiplies a decimal below 1 by 100 |
| TC-DSM-CMX-036 | Threshold keeps a fractional value above 1 |
| TC-DSM-CMX-037 | Out-of-range value shows `aria-invalid` but no visible message — intentionally asserts the defect (DEFECT-1, second location) |
| TC-DSM-CMX-038 | Zero and empty both render `0%` and are valid |
| TC-DSM-CMX-039 | Refusal path: overtyping leaves the value unchanged; empty path: field empties then accepts `0%` |
| TC-DSM-CMX-040 | Unsaved threshold survives a tab switch; a full reload discards it |
| TC-DSM-CMX-041 | Threshold accepts exactly `100` as the valid upper boundary |
| TC-DSM-CMX-042 | Negative sign is refused; only the remaining digits reach the field |

---

## Out of Scope

Sources: PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md §1, rows D1–D14, and the test-case MD
deferred section.

| Surface | Reason |
|---|---|
| **Add Tier — the commit half** (D1) | Every Add Tier case stops before the confirm click. Submitting creates a real tier row on office 1604. An explicit decision to mutate and a cleanup path (delete the created tier) are required before this can run. |
| **Delete Tier** (D2) | Never exercised. NM-3239 (recalculation after split-tier delete) and NM-3435 (duplicate-tier delete error) both live here. Walk the confirmation affordance first; the destructive step needs an explicit mutation decision. |
| **Import** (D3) | Never exercised. Server-side validated with a row-level error list (NM-2219 AC4); mutating by nature. Requires a decision on a safe office and test fixture files before any trial. |
| **Export while dirty** (D4) | NM-3256 — dirty the threshold, click Export, take Discard; reportedly aborts the download. Not exercised: requires driving the threshold to a dirty state. Non-mutating once Discard is taken, but the sequence has not been walked. |
| **Permission gating** (D5) | NM-2219 AC6 disables editing when the user lacks the edit role. Requires a second, read-only test account. None is configured. |
| **Volume / large result set** (D6) | Office 1604 has 9 tier rows. Behaviour under a materially larger tier count (scrolling, virtualisation) is not covered at this tier. |
| **Multi-axis header combinations** (D7) | Cases TC-002..004 change one header at a time. Cross-product combinations of Country × Currency × Business Tier are deferred to deep coverage. |
| **Cross-session and cross-tab persistence** (D8) | TC-005 covers a single save-and-reload cycle. Cross-session persistence and tab-to-tab visibility without reload are deferred. |
| **Error/invalid render geometry** (D9) | `aria-invalid` state is asserted; the visible error geometry (element screenshot, bounding box) is not. |
| **UI↔DB column mapping** (D10) | Closed as far as the UI allows: the export payload uses the same three UI group names in the same order and all 189 cells match the grid. A DB-internal check would need the API schema, which is outside UI-walk scope. |
| **Country dropdown timing sensitivity** (D11) | On office 1604 the Country dropdown may present only one option (`United States`) at read time. TC-002, TC-003, and TC-004 skip themselves when only one option is available — coverage can silently drop while the summary stays green. A deterministic options-readiness signal is needed. |
| **Save→navigate write-loss window** (D13) | The form still reports unsaved changes for approximately 1551 ms after a Save click; navigating inside that window silently cancels the write. Cannot be filed as a regression without a baseline comparison, and this module has no baseline on the legacy site. |
| **Per-field denominator completeness for the Edit Tier dialog** (D14) | The 21 percentage inputs collapse into a single entry in the field-enumeration tool output. Behaviour coverage is present (TC-013..024 read all 21 values directly); the tooling gap is documented for the deep tier. |

---

## Environment and Preconditions

- **Office**: 1604 (Parker Palm Springs)
- **Environment**: `cloudapps-e2e.encoreglobal.com`
- **Route**: `/navigator/locations/1604/settings/discount-matrix`
- **Auth**: Microsoft SSO automation account with no second factor. Credentials in
  `clients/encore/.env.local` (tracked in git). The auth-setup test
  (`clients/encore/tests/auth.setup.ts`) runs as a Playwright project dependency before the
  spec; it writes the session state that every test consumes. The spec cannot run without it.
- **Session freshness**: Before treating any empty-grid observation as meaningful, verify that
  the session state is fresh. A degraded session (walk evidence §12) produces an empty grid
  that is indistinguishable from a legitimate empty-state result from a key combination with
  no data. The auth-setup step controls for this when run immediately before the spec.
- **Input method**: All formatted numeric inputs on this surface (percentage fields in the
  Edit Tier dialog, GAV Discount Threshold) must be driven with character-by-character
  typing (`pressSequentially`). Playwright's `fill()` mis-parses the field's formatter and
  produces corrupt values (e.g., filling `20%` rendered `15.2%`). The page object already
  types; do not revert it to `fill()`.

---

## Known Risks to the Run

1. **Skeleton readiness trap** (walk evidence §1): the grid container is present in the DOM
   before data arrives. A readiness check that waits only on the container will proceed with
   an empty grid and report false results. The `waitForGrid()` call in `open()` waits for a
   non-zero row count — do not remove or weaken it.

2. **Single-option Country dropdown** (D11): on office 1604 the Country dropdown has been
   observed with only one option (`United States`). TC-DSM-CMX-002, TC-003, and TC-004 call
   `test.skip()` when no alternative option is available. A run where all three skip is a
   green run with reduced coverage, not a failure. The skip message is explicit: "Only one
   option is available … A single-option dropdown cannot be exercised — this is reported
   rather than silently passed."

3. **Save race condition** (walk evidence §9): the form still reports unsaved changes for
   approximately 1551 ms after the Save click completes. TC-DSM-CMX-005 guards against this
   by reloading and reading the server-side value rather than reading the local form state
   immediately after clicking Save.

---

## Entry and Exit Criteria

### Entry criteria

- `clients/encore/.auth/encore-state.json` is present and fresh (auth-setup test has run in
  the same session).
- The application is reachable at `cloudapps-e2e.encoreglobal.com` and office 1604 loads the
  discount-matrix route with a non-zero tier-row count.
- No pending mutations are carried over from a previous run (TC-005 includes a restore; all
  Add Tier cases are cancel-only; no Delete, Import, or Save outside TC-005 is executed).

### Exit criteria

- A fully green run reports **43 passed**: 42 spec tests (`TC-DSM-CMX-001..042`) plus 1
  auth-setup test running as a Playwright project dependency.
  *(Count source: 42 cases in the test-case MD + 1 auth-setup project dependency, as
  documented in `playwright.config.ts`.)*
- Any skip of TC-002, TC-003, or TC-004 (single-option dropdown) is recorded explicitly in
  the run output. A skipped case is not a failure, but its skip reason must appear in the
  report so the coverage gap is visible.
- TC-005's restore step must complete without error. A failing restore leaves the office in
  a mutated state and must be escalated before re-running the suite.
- No test produces a timeout from waiting on the grid container without a non-zero row count.
