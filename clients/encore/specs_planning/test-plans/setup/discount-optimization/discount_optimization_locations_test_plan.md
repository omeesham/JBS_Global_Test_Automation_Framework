# Discount Optimization — Locations (Tab 1) Test Plan

**Module**: discount-optimization (locations)
**Test Cases**: specs_planning/test-cases/setup/discount-optimization/discount_optimization_locations_test_cases.md
**Location Under Test**: 1604 (Parker Palm Springs)
**Updated**: 2026-08-11
**Implemented**: clients/encore/tests/discount-optimization/discount-optimization-locations.spec.ts (pending)
**Discovery basis**: live walk of office 1604 on 2026-08-11; every interactive control on the page was enumerated and accounted for.
**Baseline**: baseline-present — legacy site `/#/setup/DiscountPricing/settings` (2155 rows, single page, no tabs, no search, no sort, booleans as plain text `Yes`/`No`)

> **Critical precondition for every scenario**: The locations grid takes approximately 22 seconds to complete its first paint. The list API (`GET /navigator/api/discount/optimization?skipPagination=true`) returns HTTP 200 immediately, but the UI shows `0 locations found` until rendering completes. **Every scenario must wait for the row count to become non-zero before any interaction or assertion.** Never use a fixed timeout; never use `networkidle`. This is the single most important fact about this surface — three separate earlier probe runs produced false readings by not honoring it.

---

## Selector Mapping (alias → live selector)

| Alias | Element | Live selector | Stability |
|---|---|---|---|
| `tabLocations` | Locations tab trigger | `[role="tab"]:text-is("Discount Optimization")` | label-anchored (no stable test-id) |
| `tabExemptions` | Service Type Exemptions tab | `[role="tab"]:text-is("Special Rate Exemptions by Service Type")` | label-anchored |
| `panelLocations` | Tab 1 content panel | `[role="tabpanel"]:has([data-testid="discount-optimization-settings-table-container"])` | testid-scoped |
| `tblContainer` | Grid container | `[data-testid="discount-optimization-settings-table-container"]` | STABLE (`data-testid`) |
| `txtSearch` | Search input | `input[placeholder="Search by location number or location name"]` | placeholder-anchored |
| `btnSave` | Save button (tab 1) | `button:text-is("Save")` scoped inside `panelLocations` | label-anchored |
| `btnAdd` | Add button (tab 1) | `button:text-is("Add")` scoped inside `panelLocations` | label-anchored |
| `tblGrid` | Locations table | `[data-testid="discount-optimization-settings-table-container"] table` | testid-scoped |
| `rowsGrid` | Grid body rows | `[data-testid="discount-optimization-settings-table-container"] tbody tr` | testid-scoped |
| `colHeaders` | Column header cells | `[data-testid="discount-optimization-settings-table-container"] thead th` | testid-scoped |
| `btnSortId` | Sort / resize — ID | `button[aria-label="Resize column locationNo"]` | aria-label stable |
| `btnSortName` | Sort / resize — Location Name | `button[aria-label="Resize column locationName"]` | aria-label stable |
| `btnSortDiscount` | Sort / resize — Allow Special Rate | `button[aria-label="Resize column allowSpecialRate"]` | aria-label stable |
| `btnSortStart` | Sort / resize — Special Rate Start Date | `button[aria-label="Resize column startAllowSpecialRate"]` | aria-label stable |
| `btnRemove(n)` | Per-row remove | `button[aria-label="Remove <Location Name>"]` | aria-label content-anchored |
| `btnToggle(n)` | Per-row Allow Special Rate toggle | `button[aria-label="Allow Special Rate for <Location Name>"]` | aria-label content-anchored |
| `inpDate(n)` | Per-row date input | `input[aria-label="Select date"]` scoped to `tr` | aria-label scoped |
| `btnCalendar(n)` | Per-row calendar open | `button[aria-label="Open calendar"]` scoped to `tr` | aria-label scoped |
| `listEndpoint` | Data API | request URL contains `/navigator/api/discount/optimization` | URL-anchored (network) |

Page route: `gotoDiscountOptimization(office)` → `{base}locations/{office}/settings/discount-optimization-settings`.

**Tab selection**: never use a `radix-*` id — they are auto-generated and change between renders. Always select by visible text + `[role="tab"]`.

---

## Scenario: TC-DOP-OPT-001 — Both tabs present; Locations tab is the default
1. Navigate to `gotoDiscountOptimization('1604')`.
2. Wait for `[role="tablist"]` to be visible.
3. Assert: `tabLocations` is present and has `aria-selected="true"`.
4. Assert: `tabExemptions` is present and has `aria-selected="false"`.
5. Assert: `panelLocations` is visible.

## Scenario: TC-DOP-OPT-002 — Grid renders rows and all four column headers after slow first paint
1. `gotoDiscountOptimization('1604')`.
2. Wait for `rowsGrid` count > 0 (content condition — up to 30 s; no fixed sleep).
3. Read `colHeaders` text into an array.
4. Assert: `["ID", "Location Name", "Allow Special Rate", "Special Rate Start Date"]` all present.
5. Assert: `rowsGrid` count > 0 (exact count not asserted — volatile live data).

## Scenario: TC-DOP-OPT-003 — First visible row has non-empty ID and Location Name
1. After grid paint (rowsGrid count > 0), read `tbody tr:first-child td:nth-child(1)` textContent.
2. Assert: non-empty.
3. Read `tbody tr:first-child td:nth-child(2)` textContent.
4. Assert: non-empty.

## Scenario: TC-DOP-OPT-004 — Office 1604 absent from its own list
1. After grid paint, fill `txtSearch` with `"1604"`.
2. Wait for grid to filter.
3. Assert: no row in `tbody` has Location Name "Parker Palm Springs" (the name of office 1604).

## Scenario: TC-DOP-OPT-005 — Search filters; clear restores; no-match shows empty state
1. After grid paint, record row count A.
2. Fill `txtSearch` with `"2050"` (known location number); wait for filter.
3. Assert: row count B < A and B > 0.
4. Clear `txtSearch` (`fill('')`); wait for restore.
5. Assert: row count back to A (or same pattern, non-zero).
6. Fill `txtSearch` with `"ZZZZNOTAPLACE"`; wait.
7. Assert: row count === 0 OR empty-state text visible (e.g. `"0 locations found"`).
8. Clear `txtSearch`; assert row count back to A.

## Scenario: TC-DOP-OPT-006 — Search is case-insensitive
1. Fill `txtSearch` with `"abbey"` (lowercase).
2. Assert: at least one row whose Location Name contains "Abbey" (case-insensitive match).

## Scenario: TC-DOP-OPT-010 — Sort by ID reorders rows
1. After grid paint, read first-row ID value (col 1) → `id_before`.
2. Click `btnSortId`; wait for grid re-render.
3. Read first-row ID → `id_asc`. Assert: `id_asc !== id_before` OR row order changed.
4. Click `btnSortId` again; wait.
5. Read first-row ID → `id_desc`. Assert: `id_desc !== id_asc`.

## Scenario: TC-DOP-OPT-011 — Sort by Location Name reorders rows
1. Record first-row Location Name → `name_before`.
2. Click `btnSortName`; wait; record `name_asc`. Assert changed.
3. Click `btnSortName`; wait; record `name_desc`. Assert changed from `name_asc`.

## Scenario: TC-DOP-OPT-012 — Sort by Allow Special Rate reorders rows
1. Sort ascending; capture aria-pressed sequence of visible toggles → `asc[]`.
2. Click `btnSortDiscount`; wait; read first 5 → `asc[]`. Assert `asc[] !== before[]`.
3. Click `btnSortDiscount`; wait; read first 5 → `desc[]`. Assert `desc[] !== asc[]`.

## Scenario: TC-DOP-OPT-013 — Sort by Special Rate Start Date reorders rows
1. Sort ascending via menu; wait for Angular. Capture date-input values of visible rows -> asc[].
2. Sort descending via menu; wait for Angular. Capture sequence again -> desc[].
3. Assert: asc[].join(',') differs from desc[].join(',') — proves reorder.
4. Reset: sort ascending; clear local storage.

## Scenario: TC-DOP-OPT-020 — Allow Special Rate toggle on a row enables Save
1. Assert `btnSave` is disabled (pristine).
2. Locate `btnToggle` for the first visible row (e.g. `"Allow Special Rate for The Abbey Resort"`).
3. Read `aria-pressed` → `state_before`.
4. Click `btnToggle`; wait.
5. Assert: `aria-pressed` has changed from `state_before`.
6. Assert: `btnSave` is enabled.

## Scenario: TC-DOP-OPT-021 — Reverting toggle re-disables Save (NM-2918)
1. Toggle `btnToggle` once → Save enables.
2. Toggle same `btnToggle` again to revert.
3. Assert: `aria-pressed` equals `state_before` (original value restored).
4. Assert: `btnSave` is disabled.

## Scenario: TC-DOP-OPT-022 — Save disabled on pristine load (NM-2918)
1. `gotoDiscountOptimization('1604')` fresh.
2. Wait for grid paint (rowsGrid > 0).
3. Assert: `btnSave` is disabled immediately — no interaction has occurred.

## Scenario: TC-DOP-OPT-030 — Valid date accepted; Save enables
1. Assert `btnSave` disabled.
2. Locate `inpDate` on a row with an existing date; note current value.
3. `fill(inpDate, '09/09/2019')` (or `pressSequentially`).
4. Tab away.
5. Assert: no red-border class / no error icon on the cell.
6. Assert: `btnSave` enabled.

## Scenario: TC-DOP-OPT-031 — Invalid date: red border + error icon; Save blocked
1. Locate `inpDate` on any row.
2. `fill(inpDate, '13/40/2019')` + Tab away.
3. Assert: cell has a visible error state (red border or error icon present in the DOM).
4. Assert: `btnSave` disabled.

## Scenario: TC-DOP-OPT-032 — Calendar picker opens and populates date
1. Click `btnCalendar` on a row.
2. Assert: a date picker popover is visible (`[role="dialog"]` or `[role="grid"]` calendar).
3. Click a selectable date cell.
4. Assert: popover closes and `inpDate` value is non-empty.
5. Assert: `btnSave` enabled.

## Scenario: TC-DOP-OPT-033 — Manual date entry does not shift digits (NM-3067)
1. Locate `inpDate` on a row.
2. `pressSequentially('09092019')` digit by digit.
3. Assert: `inpDate` value === `"09/09/2019"` — digits land in the correct segment.

## Scenario: TC-DOP-OPT-040 — Remove presents confirmation; Cancel leaves row intact
1. Record row count.
2. Click `btnRemove` for the first visible named row (e.g. `"Remove The Abbey Resort"`).
3. Assert: a confirmation dialog or prompt is visible.
4. Click Cancel / dismiss.
5. Assert: dialog is gone.
6. Assert: row count unchanged and the removed-row candidate is still visible.

## Scenario: TC-DOP-OPT-041 — Cancelled remove leaves Save disabled
1. Steps 1–5 from TC-DOP-OPT-040 (cancel the remove).
2. Assert: `btnSave` is still disabled.

## Scenario: TC-DOP-OPT-050 — Save: pristine-disabled → valid-change-enabled → round-trip persists
1. Assert `btnSave` disabled (pristine).
2. Toggle `btnToggle` on a known row; assert Save enabled.
3. Click `btnSave`; wait for success response.
4. Reload page; wait for grid paint.
5. Assert: the toggled row still shows the new toggle state.
6. **Restore**: toggle the value back and Save again to return to baseline.

## Scenario: TC-DOP-OPT-051 — Save stays enabled after adding a location (NM-3063)
1. Click `btnAdd`; complete the add form with a valid location; confirm.
2. Assert: `btnSave` is enabled after the add completes (not re-disabled).
3. **Restore**: reload without saving — the pending row is discarded, leaving the environment unchanged.

## Scenario: TC-DOP-OPT-052 — Two dirty rows both persist after a single save
1. Wait for grid paint.
2. Pick rows A and B: first two rows whose location names are not `InterContinental Chicago` or `The Abbey Resort`.
3. Read original toggle state for row A and row B.
4. Toggle `btnToggle` on row A; assert Save enabled.
5. Dismiss alert dialog if present.
6. Toggle `btnToggle` on row B (no Save between); assert Save still enabled.
7. Click `btnSave`; wait for Save to become disabled.
8. Reload page; wait for grid paint.
9. Assert: row A toggle state === `!originalA`.
10. Assert: row B toggle state === `!originalB`.
11. **Restore**: toggle both rows back to original and Save.

## Scenario: TC-DOP-OPT-053 — Pending edit survives the row being scrolled out of view
1. Wait for grid paint.
2. Pick the first row not named `InterContinental Chicago` or `The Abbey Resort` (near top of grid).
3. Read original toggle state.
4. Toggle `btnToggle` on the target row; assert toggle changed.
5. Scroll the grid container (`tblContainer`) far down (mouse wheel, large delta) to push the row out of the DOM.
6. Assert: `button[aria-label="Allow Special Rate for <name>"]` count === 0 (row left DOM).
7. Scroll back to the top of the grid (mouse wheel, large negative delta).
8. Poll until the row's toggle button reappears (count > 0, timeout 10 s).
9. Assert: toggle state still reflects the change (pending edit not discarded).
10. Click `btnSave`; wait for Save disabled.
11. Reload page; wait for grid paint.
12. Assert: toggle state === `!original`.
13. **Restore**: toggle back and Save.

## Scenario: TC-DOP-OPT-090 — Rejected save surfaces the failure and keeps the change pending
1. Register a test-scoped route handler on `**/navigator/api/discount/optimization**` that fulfills non-GET requests with status 500.
2. Assert `btnSave` disabled.
3. Toggle `btnToggle` on `The Abbey Resort`; assert toggle changed; assert Save enabled.
4. Click `btnSave`.
5. Assert: `interceptedSave === true` (request was stopped before the server).
6. Assert: at least one of — `[role="alertdialog"], [role="alert"]` visible, OR `btnSave` enabled, OR toggle state still changed.
7. **Finally**: call `page.unroute()` to remove the handler; reload and wait for grid (discards any pending state).

## Scenario: TC-DOP-OPT-060 — Add opens affordance; Cancel discards cleanly
1. Record row count and assert `btnSave` disabled.
2. Click `btnAdd`.
3. Assert: an add form or dialog is visible.
4. Click Cancel.
5. Assert: form/dialog is gone; row count unchanged; `btnSave` still disabled.

## Scenario: TC-DOP-OPT-061 — Add button visible and enabled
1. After grid paint, assert `btnAdd` is visible and enabled.

## Scenario: TC-DOP-OPT-065 — No unsaved-changes prompt when switching tabs with no change (NM-3066)
1. Confirm `btnSave` disabled (no pending change).
2. Click `tabExemptions`.
3. Assert: no modal / confirmation dialog appeared during the tab switch.
4. Assert: tab 2 content panel is now visible.
5. Click `tabLocations` to return.

## Scenario: TC-DOP-OPT-070 — Search includes deactivated locations by name and clears correctly (NM-3210)
1. After grid paint, record row count A.
2. Fill txtSearch with deactivated fragment; wait for filter.
3. Assert: at least one row appears AND every visible row text contains the fragment (case-insensitive).
4. Clear txtSearch; assert row count equals A.

## Scenario: TC-DOP-OPT-071 — Search returns deactivated locations (NM-3210)
1. Fill `txtSearch` with `"Sheraton Stamford"`.
2. Assert: the row matching "Sheraton Stamford Hotel deactivat" is visible — it is not hidden because it is deactivated.

## Scenario: TC-DOP-OPT-072 — Allow Special Rate toggle enables Save — NM-2917 lock
1. Assert `btnSave` disabled.
2. Click `btnToggle` on any row.
3. Assert: `btnSave` is enabled immediately after the toggle.

---

## Scenario: TC-DOP-OPT-092 — Special Rate Start Date date change persists after save and reload
1. Confirm Save disabled.
2. Open calendar picker for InterContinental Chicago; navigate forward one month; select first enabled date.
3. Assert date input updated and Save enabled.
4. Click Save; assert Save disabled.
5. Reload; wait for grid paint.
6. Assert: saved date still shown on the row.
7. Restore: set original date and Save.


## Out-of-Scope (with reasons)

| Family | Reason |
|---|---|
| Pagination | This grid renders all rows at once with no pager — both the new site and the legacy site have no pagination on this surface. |
| Combination filters | There is only one filter control (the search box) on this tab — no second dimension exists to combine. |
| Tab 2 (Special Rate Exemptions by Service Type) | Covered by a separate ticket; not part of this test plan. |
| Tab 2 column resize controls (Resize column serviceTypeName, Resize column isSpecialRateAllowed) | Column resize is a drag operation with no data effect; sorting and resizing on Tab 2 are out of scope for this automation suite. |
