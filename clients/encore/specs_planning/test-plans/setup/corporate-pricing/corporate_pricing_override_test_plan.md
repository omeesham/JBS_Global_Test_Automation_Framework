# Corporate Pricing — Product Group Override Test Plan (NM-1463, Wave-1.5-A FCC)

**Module**: corporate-pricing
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md
**Field Inventory**: specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-09.md
**Divergences**: specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md
**Updated**: 2026-06-09 (Product Group Override full FCC — Q-WV15-1 edit-mechanism RESOLVED)

## Scope boundary

This plan owns the **Product Group Override screen** (`/pg-override`) — tabs, location gating, filters, the 10-column grid, the editable Override Price / Max Discount % / Active cells, and the dialog-gated save-cycle. Export/Import file round-trip → EDGE_P3; Grid Options popover → W15-B. **baseline-absent + DOCX-absent** → live DOM is the intent oracle (Q-WV15-1).

**Edit mechanism (RESOLVED 2026-06-09)**: click the Override Price / Max Discount `div[role=button]` cell → an active `spinbutton` reveals → **native value-setter** (React-controlled; `.fill()` no-ops) + **`Enter`** commits → Save enables. Active = Radix `checkbox` (LR-036) toggles + dirties. Save → "Save Changes" alertdialog → `POST /navigator/api/location/corporate-price-pg-override` (LR-056) → toast "Pricing overrides saved successfully.".

**Mutation safety**: only the save-cycle describe commits, on fixture row **2605** (`House Video Monitor - Specialty`, default Override Price 445.00), restored via bounded-retry `ensureDefaultState()` (throws on residual drift). Read/filter/edit-behavior describes never commit. Baseline (LR-019) = fresh nav + location-select per test.

## Selector Mapping

> ZERO grid data-testids (Doctrine 4) → text/role/grid-header/content-anchored. Keys mirror `clients/encore/src/selectors/corporate-pricing/override.ts`. **Grid headers use `:has-text` not `:text-is`** — each `<th>` nests a "Resize column" button, so the header text is e.g. "Override Price Resize column price".

| Key | Selector | Element |
|-----|----------|---------|
| ovrHeading | `h1:text-is("Product Group Override")` | Page heading |
| ovrTabEquipment / ovrTabLabor | `[role="tab"]:has-text("Equipment"\|"Labor")` | Equipment / Labor tabs (`aria-selected`) |
| ovrSelectLocationText | `text=Select a location` | Location card (opens "Change Local Office" picker) |
| ovrLocationPickerSearch | `input[placeholder="Search by Location Name, Number"]` | Picker search (shared modal — has a testid) |
| ovrLocationPickerRowAny | `tbody tr` (scoped by `hasText`) | Picker result row |
| ovrLocationPickerRowCheckbox | `[role="checkbox"]` (relative to a picker row) | Per-row select |
| ovrLocationPickerSelect | `button:text-is("Select")` | Confirm location |
| ovrCurrencyDropdown | `button[role="combobox"]:has-text("ALL")` | Currency filter (ALL/USD/CAD/MXN) |
| ovrActiveOnlyCheckbox | `div:has(> *:text-is("Active only")) [role="checkbox"]` | Active-only filter (default OFF) |
| ovrFilterInput | `input[placeholder="Filter Product Groups Override..."]` | Client-side grid filter (ID + Name only) |
| ovrGrid / ovrGridRowAny / ovrColHeaderAny | `table:has(th:has-text("Override Price"))` [+ ` tbody tr` / ` th`] | Grid / data rows / 10 headers |
| ovrCellOverridePrice | `td:nth-child(6) [role="button"]` (relative to a row) | Override Price click-to-edit cell (`div[role=button]`) |
| ovrCellMaxDiscount | `td:nth-child(7) [role="button"]` (relative to a row) | Max Discount % click-to-edit cell |
| ovrCellActiveCheckbox | `td:nth-child(8) [role="checkbox"]` (relative to a row) | Active toggle (LR-036, read `aria-checked`) |
| (cell editor) | `getByRole('spinbutton')` | Revealed numeric input (type=number) |
| ovrBtnSave | `button:text-is("Save")` | Page-level Save (disabled on clean; dialog-gated) |
| ovrBtnExport / ovrBtnImport / ovrBtnGridOptions | `button:text-is("Export"\|"Import"\|"Grid Options")` | Toolbar (direct; W15-B/EDGE) |
| ovrRowsPerPage | `button[role="combobox"]:has-text("20")` | Rows per page (10/20/30/40/50) |
| ovrNoResults | `text=No results.` | Empty state (before a location is selected) |
| (save dialog) | `[role="alertdialog"]` "Save Changes" / "Are you sure you want to save the changes?" | Save confirmation |

## Save mechanics (page-object contract)

- Edit a numeric cell: `setOverridePrice(row, v)` / `setMaxDiscount(row, v)` = click cell → `setReactInput(spinbutton, v)` → `Enter`.
- Toggle Active: `toggleActive(row)` / `setActive(row, bool)` (read via `aria-checked`).
- Save-cycle: `saveAndConfirm()` (Save → "Save Changes" dialog → confirm → toast). `clickSaveAndCancel()` captures the dialog text then Cancels (no commit).
- Restore: `ensureDefaultState(anchor, {overridePrice, active}, '1604')` — bounded-retry reload+re-read+restore; throws on residual drift.
- Net-zero (LR-009): reverting Override Price to the saved value disables Save.

---

## Scenario: TC-CPR-OVR-001 - Override screen loads, Equipment selected
1. Step: Navigate to `/pg-override` (office 1604), expected: loads on the override route
2. Step: Read active tab, expected: "Equipment"

## Scenario: TC-CPR-OVR-002 - Tabs render; switching flips aria-selected
1. Step: Click Labor tab, expected: getActiveTab "Labor"
2. Step: Click Equipment tab, expected: getActiveTab "Equipment"

## Scenario: TC-CPR-OVR-003 - Grid location-gated (empty pre-select)
1. Step: open() without selecting a location, expected: isEmpty (No results.) true
2. Step: getVisibleRowCount, expected: 0; "Select a location" card visible

## Scenario: TC-CPR-OVR-004 - Selecting a location populates the grid
1. Step: selectLocation("1604"), expected: grid loads
2. Step: getVisibleRowCount > 0; findRowByProductGroup(anchor), expected: present

## Scenario: TC-CPR-OVR-005 - Grid renders all 10 column headers
1. Step: getColumnHeaders join, expected: contains all 10 (Location…Updated By)

## Scenario: TC-CPR-OVR-006 - Current Price renders a value (NM-1870 not-reproduced)
1. Step: Read anchor Current Price cell (col 5), expected: matches `\d` (e.g. "0.00")

## Scenario: TC-CPR-OVR-007 - Active renders as Radix checkbox (LR-036)
1. Step: readActiveState(anchor row), expected: a real boolean (aria-checked)

## Scenario: TC-CPR-OVR-008 - Labor tab empty for 1604, headers render
1. Step: switchOverrideTab("Labor"), expected: active tab Labor
2. Step: getVisibleRowCount, expected: 0; headers contain "Override Price"

## Scenario: TC-CPR-OVR-009 - Currency filter offers ALL/USD/CAD/MXN
1. Step: getCurrencyOptions, expected: contains ALL, USD, CAD, MXN

## Scenario: TC-CPR-OVR-010 - Active-only defaults OFF, toggles
1. Step: getActiveOnlyState, expected: false
2. Step: setActiveOnly(true)→true; setActiveOnly(false)→false

## Scenario: TC-CPR-OVR-011 - Rows-per-page offers 10/20/30/40/50
1. Step: getRowsPerPageOptions, expected: contains 10,20,30,40,50

## Scenario: TC-CPR-OVR-012 - Client filter by Name narrows grid
1. Step: filterProductGroups("House Video"), expected: rows > 0 and <= before; anchor present

## Scenario: TC-CPR-OVR-013 - Client filter by Product Group ID
1. Step: filterProductGroups("2605"), expected: anchor present; rows > 0

## Scenario: TC-CPR-OVR-014 - Filter scoped to ID + Name only (NM-1889 not-reproduced)
1. Step: filterProductGroups("USD") (a Currency value), expected: getVisibleRowCount 0
2. Step: clearFilter, expected: rows > 0

## Scenario: TC-CPR-OVR-015 - No-match filter empties grid; clear restores
1. Step: filterProductGroups(no-match), expected: 0 rows
2. Step: clearFilter, expected: rows > 0

## Scenario: TC-CPR-OVR-016 - Filter tolerates whitespace/special chars
1. Step: filterProductGroups("   ") then special chars, expected: no crash
2. Step: clearFilter, expected: rows > 0 (responsive)

## Scenario: TC-CPR-OVR-017 - Override Price cell reveals an editable input
1. Step: peekOverridePriceEditor(anchor row), expected: editor value == current (445); Escape (no change)

## Scenario: TC-CPR-OVR-018 - Editing Override Price enables Save
1. Step: setOverridePrice(row, "446"), expected: isOverrideSaveEnabled true

## Scenario: TC-CPR-OVR-019 - Revert to original disables Save (LR-009)
1. Step: setOverridePrice(row, "446"), expected: Save enabled
2. Step: setOverridePrice(row, "445.00"), expected: Save disabled (net-zero)

## Scenario: TC-CPR-OVR-020 - Override Price accepts a decimal
1. Step: setOverridePrice(row, "123.45"), expected: cell == 123.45; Save enabled

## Scenario: TC-CPR-OVR-021 - Override Price BVA (0 and large)
1. Step: setOverridePrice(row, "0"), expected: cell == 0
2. Step: setOverridePrice(row, "999999"), expected: cell == 999999

## Scenario: TC-CPR-OVR-022 - Non-numeric rejected (LR-011)
1. Step: probeOverridePriceInput(row, "abc"), expected: retained value has no alpha (type=number coerces to "")

## Scenario: TC-CPR-OVR-023 - Max Discount % accepts valid %, rejects >100 (capped at 100)
1. Step: tryMaxDiscount(row, "10"), expected: committed=true; Save enabled (renders "10.00 %")
2. Step: tryMaxDiscount(row, "12.5"), expected: committed=true
3. Step: tryMaxDiscount(row, "150"), expected: committed=false (>100 rejected — editor will not commit; CPR-WV15-Q3)

## Scenario: TC-CPR-OVR-024 - Toggling Active dirties form
1. Step: readActiveState(row), then toggleActive(row), expected: state flips
2. Step: isOverrideSaveEnabled, expected: true

## Scenario: TC-CPR-OVR-025 - Override Price save-cycle persists + restores
1. Step (baseline): ensureDefaultState(2605 → 445.00), expected: clean
2. Step (act): setOverridePrice(row, "446"), expected: Save enabled
3. Step (save): saveAndConfirm() → "Save Changes" dialog → confirm → toast
4. Step (reload): reloadAndReselect → readOverridePrice == 446
5. Step (cleanup): ensureDefaultState → restored to 445.00

## Scenario: TC-CPR-OVR-026 - Max Discount % save-cycle persists + restores
1. Step (baseline): ensureDefaultState, expected: clean
2. Step (act): setMaxDiscount(row, "10"), expected: Save enabled
3. Step (save+reload): saveAndConfirm → reload → readMaxDiscount == 10
4. Step (cleanup): ensureDefaultState → restored

## Scenario: TC-CPR-OVR-027 - Active toggle save-cycle persists + restores
1. Step (baseline): ensureDefaultState, expected: clean
2. Step (act): toggleActive(row), expected: Save enabled
3. Step (save+reload): saveAndConfirm → reload → readActiveState == toggled
4. Step (cleanup): ensureDefaultState → restored

## Scenario: TC-CPR-OVR-028 - Save dialog; Cancel aborts (no commit)
1. Step: ensureDefaultState + setOverridePrice(row, "446"), expected: Save enabled
2. Step: clickSaveAndCancel(), expected: dialog text contains "Save Changes" + "Are you sure you want to save the changes?"
3. Step: Cancel → no commit; afterEach ensureDefaultState restores

## Coverage Index (regenerated 2026-06-11 from the test-cases file)

Authoritative current case list (28 cases). Scenario prose above may lag; this index is mechanically regenerated.

- TC-CPR-OVR-001 — Override screen loads with Equipment selected by default
- TC-CPR-OVR-002 — Equipment + Labor tabs render and switching flips aria-selected
- TC-CPR-OVR-003 — Grid is location-gated — empty before a location is selected
- TC-CPR-OVR-004 — Selecting a location populates the grid with the anchor row
- TC-CPR-OVR-005 — Grid renders all 10 column headers
- TC-CPR-OVR-006 — Current Price column renders a value
- TC-CPR-OVR-007 — Active column renders as a checkbox with a readable checked state
- TC-CPR-OVR-008 — Labor tab shows the empty state for office 1604 with headers rendered
- TC-CPR-OVR-009 — Currency filter offers ALL/USD/CAD/MXN
- TC-CPR-OVR-010 — Active-only filter defaults OFF and toggles
- TC-CPR-OVR-011 — Rows-per-page offers 10/20/30/40/50
- TC-CPR-OVR-012 — Client filter by Product Group Name narrows the grid
- TC-CPR-OVR-013 — Client filter by Product Group ID narrows to the matching row
- TC-CPR-OVR-014 — Client filter is scoped to ID and Name only
- TC-CPR-OVR-015 — No-match filter empties the grid; clearing restores rows
- TC-CPR-OVR-016 — Filter tolerates whitespace and special characters without crashing
- TC-CPR-OVR-017 — Clicking the Override Price cell reveals an editable numeric input
- TC-CPR-OVR-018 — Editing the Override Price enables Save
- TC-CPR-OVR-019 — Reverting the Override Price to its original value disables Save
- TC-CPR-OVR-020 — Override Price accepts a decimal value
- TC-CPR-OVR-021 — Override Price accepts boundary values (0 and a large number)
- TC-CPR-OVR-022 — Override Price input rejects non-numeric text (LR-011)
- TC-CPR-OVR-023 — Max Discount % — out-of-range (>100) handling (under review)
- TC-CPR-OVR-024 — Toggling the Active checkbox dirties the form (Save enables)
- TC-CPR-OVR-025 — Override Price save-cycle persists after reload and restores
- TC-CPR-OVR-026 — Max Discount % save-cycle persists after reload and restores
- TC-CPR-OVR-027 — Active toggle save-cycle persists after reload and restores
- TC-CPR-OVR-028 — Save opens the "Save Changes" dialog; Cancel aborts without committing
