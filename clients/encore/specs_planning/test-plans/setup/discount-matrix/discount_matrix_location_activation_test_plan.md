# Discount Matrix — Location Activation Test Plan

**Module**: discount-matrix
**Submodule**: LOA
**Page**: Location Settings → Discount Matrix (`/locations/{office}/settings/discount-matrix`) — Location Activation tab
**Test Entity**: Office 1604 (cross-checked on 1101)
**Governing Requirement**: NM-3530 (build spec NM-2221)
**Updated**: 2026-08-25
**Total Scenarios**: 11
**Test Cases**: `discount_matrix_location_activation_test_cases.md`

---

## 1. Purpose

Cover the Location Activation tab: a country-scoped location grid (all locations for the selected
country — 2041 for United States at measurement time) with per-row activation controls, effective
dates, a search box, and a record-count footer. An earlier draft of this plan believed the grid
was empty on both offices; that read was taken inside the tab's ~40s lazy-fetch window and is
corrected — the populated contract below is the real one, measured 2026-08-25 evening.

## 2. Scope

**In scope**: the three-column shape, the count footer over a virtualized row window, the search
box's two-phase disabled→enabled load state, toolbar disabled-until-dirty state, country-scoped
listing parity across both authorized offices, per-column resize affordances, the criteria bar
surviving the tab switch, the Active flag's full edit-discard cycle, search filtering at steady
state (the search honours input only after a ~2-minute warm-up — accepted behaviour per the
owner's 2026-08-26 ruling, BUG-DSM-LOA-001 withdrawn; the case retypes in bounded rounds until
the warm-up ends), and the display-only header contract (sorting is not part of this grid's
design — owner ruling 2026-08-26, BUG-DSM-LOA-002 withdrawn; the legacy grid does not sort
either).

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| Persisting an Active toggle or an effective-date edit (Save → reload → restore) | Shared-data mutation on a 2041-location production-shaped listing; deferred to the deep tier. The dirty-and-discard half is covered without saving (TC-DSM-LOA-009) |
| Per-country listing re-query (change Country → listing reloads) | Costs two full ~40s tab loads; deferred to the deep tier. Country-scoping is still asserted cheaply via the two-office parity scenario |
| Pagination | The grid virtualizes (~28 rendered rows against the 2041 total); no paginator exists |

## 3. Environment and data

Office 1604 with criteria fully set (`United States` / `USD` / `Standard`), cross-checked on
office 1101 — once loaded, both render the same country-scoped listing and total. Rows carry an
editable effective-date input (`MM/DD/YYYY` placeholder, `Open calendar` dialog) and an Active
label button (`Yes`/`No`) that swaps to an inline checkbox editor on click. The corporate location
`1101 - Corporate Office Encore USA SGA` is the stable row anchor. One caution from observation:
an external writer changed a row's effective date between two of our read-only sessions, so no
case may treat a specific date value as stable ground.

## Shared execution constraints

These bind every spec that runs against this page; they come from measured behaviour, not convention.

| Constraint | Consequence for execution |
|---|---|
| The page hydrates in stages; the criteria bar's threshold input resolves at t≈91–100s, Region Weekly Peaks data at tab-click +40s (~134s total), Location Activation data at tab-click +43s | Specs raise their per-test timeout ceilings and gate readiness on the loading-placeholder census reaching zero — never on row count, which renders a full placeholder frame in both loading and loaded states. Location Activation readiness additionally requires rendered rows to carry text |
| The threshold input is a formatted numeric | It is typed character by character; a single programmatic fill silently writes a different number |
| Save disables optimistically on click | Persistence is proven only by reload-and-read; a disabled Save button proves nothing |
| Non-numeric entry corrupts the underlying form model | Every case that types a non-numeric value ends with a reload; retyping a good value is not a reliable repair |
| Office 1604 is live shared data | Every mutating case restores what it changed and proves the restore by reload; re-runs are idempotent. The two Location Activation edit cases discard via Cancel and never save |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-DSM-LOA-001 | The tab opens and shows its three columns | Surface — render-state (QUICK) | Yes |
| TC-DSM-LOA-002 | The loaded grid reports its record count in the footer | Surface — empty-vol (QUICK) | Yes |
| TC-DSM-LOA-003 | The search box is disabled while loading and enabled once locations arrive | Field (Axis 1) | Yes |
| TC-DSM-LOA-004 | Cancel and Save are disabled while no change is pending | Field (Axis 1) | Yes |
| TC-DSM-LOA-005 | The listing loads with criteria fully set and belongs to the selected country | Surface — empty-vol (QUICK) | Yes |
| TC-DSM-LOA-006 | The listing is country-scoped, not office-specific | Surface — empty-vol (QUICK) | Yes |
| TC-DSM-LOA-007 | Every column header offers a resize control | Surface — render-state (QUICK) | Yes |
| TC-DSM-LOA-008 | Location Activation keeps the criteria bar above it | Surface — render-state (QUICK) | Yes |
| TC-DSM-LOA-009 | Toggling a location's Active flag dirties the form and Cancel discards it | Field (Axis 1) | Yes |
| TC-DSM-LOA-010 | Searching filters the listing by location number | Surface — result-fidelity (QUICK) | Yes — steady-state contract; retypes in bounded rounds through the accepted ~2-min warm-up (owner ruling 2026-08-26, BUG-DSM-LOA-001 withdrawn) |
| TC-DSM-LOA-011 | Column headers are display-only and never reorder the listing | Surface — sorting (QUICK) | Yes — working as designed (owner ruling 2026-08-26, BUG-DSM-LOA-002 withdrawn); pins that header clicks never reorder the listing |
