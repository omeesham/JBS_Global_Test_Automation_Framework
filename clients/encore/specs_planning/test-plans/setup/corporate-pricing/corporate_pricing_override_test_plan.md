# Corporate Pricing — Product Group Override Test Plan (NM-1463, Wave-1.5-A FCC)

**Module**: corporate-pricing
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md
**Field Inventory**: specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-09.md
**Divergences**: specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md
**Updated**: 2026-07-18 (NM-2269: Active-only effect TC-042, currency data-blocked TC-043, compound stress TC-044; NM-2270: grid text filter TC-045, sort effects TC-046/047, grid options TC-048, compound stress TC-049)

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

## Scenario: TC-CPR-OVR-023 - Max Discount % over 100 handling (SKIPPED — app defect)
Kept skipped. Live on location 1606 (2026-07-09): over 100 sets aria-invalid + a red border and refuses to commit (a real indicator, not silent) but does not recover cleanly (won't dismiss on click-away; leaves the cell blank; even stalled an automated re-drive). Correct behavior undefined until the app is fixed. The valid boundary (values up to and including 100 commit) is covered by TC-CPR-OVR-037.

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

## Scenario: TC-CPR-OVR-029 - Search "Pricing Override" button navigates to /pg-override
1. Step: openViaSearchActionBar() from the Search screen, expected: URL contains /pg-override
2. Step: read heading, expected: "Product Group Override"

## Scenario: TC-CPR-OVR-030 - Location picker gates Select; Cancel applies nothing
1. Step: open() (no location) then inspectLocationModal("1606"), expected: title "Change Local Office"; selectDisabledInitially true
2. Step: after checking the office row, expected: rowsMatching > 0; selectEnabledAfterCheck true
3. Step: Cancel, expected: gridEmptyAfterCancel true (no location applied)

## Scenario: TC-CPR-OVR-031 - Grid Options: list columns; hide persists across reload
1. Step: openGridOptions + getGridOptionColumns, expected: all 10 columns present + checked; "Reset to Default" present
2. Step: toggleGridColumn("Updated By") + close, expected: isGridColumnVisible("Updated By") false
3. Step: reloadAndReselect, expected: still hidden (server-persisted); beforeEach/afterEach ensureAllGridColumnsVisible restores

## Scenario: TC-CPR-OVR-032 - Export: direct Product Group Overrides CSV download
1. Step: downloadOverrideExport(), expected: filename matches ProductGroupOverrides_<timestamp>UTC.csv
2. Step: read the download's request, expected: contains corporate-price-pg-override/export + locale=en-US
3. Step: read content, expected: a non-empty CSV; headers match the exact 9-column expected set, in order

## Scenario: TC-CPR-OVR-033 - Import: "Import All Pricing Overrides" dialog; Cancel closes
1. Step: openImportDialog + readImportDialog, expected: text contains "Import All Pricing Overrides"; buttons Browse/Cancel/Upload/Close; hasFileInput true
2. Step: closeImportDialog, expected: isImportDialogVisible false (no real upload)

## Scenario: TC-CPR-OVR-034 - Editing Override Price on an inactive row auto-activates it (NM-1463)
1. Step: setActive(row, false), expected: readActiveState false
2. Step: setOverridePrice(row, "446"), expected: readActiveState true (auto-activated); Save enabled

## Scenario: TC-CPR-OVR-035 - Header click does not sort (inactive)
1. Step: probeColumnSort("Product Group Name"), expected: orderChanged false; ariaSortAfter not ascending/descending

## Scenario: TC-CPR-OVR-036 - Every row shows a Current Price value on 1606 (NM-2206)
1. Step: getCurrentPriceCells(), expected: length > 0; every cell matches `\d` (no blank / missing)

## Scenario: TC-CPR-OVR-037 - Max Discount % cap inclusive at 100
1. Step: tryMaxDiscount(row, "10"), expected: committed true
2. Step: tryMaxDiscount(row, "100"), expected: committed true (inclusive cap); readMaxDiscount == 100; Save enabled

## Scenario: TC-CPR-OVR-038 - Every downloaded CSV row is well-formed
1. Step: downloadOverrideExport(), expected: headers include the ID/currency/flag/money columns at known indices
2. Step: validate every data row's Location Id, Product Group Id, Currency, Is Labor, Current Price, Override Price, Override Discount, Is Active against their expected formats, expected: zero offenders collected

## Coverage Index (regenerated 2026-07-09 from the test-cases file)

Authoritative current case list (49 cases; TC-023 skipped — app defect). Scenario prose above may lag; this index is mechanically regenerated.

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
- TC-CPR-OVR-029 — The Search action bar "Pricing Override" button navigates to the Override screen
- TC-CPR-OVR-030 — The "Change Local Office" picker gates Select until a row is checked; Cancel applies nothing
- TC-CPR-OVR-031 — Grid Options lists every column; toggling one hides its header and it persists across reload
- TC-CPR-OVR-032 — Export downloads a Product Group Overrides CSV directly (no dialog)
- TC-CPR-OVR-033 — Import opens the "Import All Pricing Overrides" dialog with a file input; Cancel closes it without uploading
- TC-CPR-OVR-034 — Editing the Override Price on an inactive row auto-activates it (NM-1463)
- TC-CPR-OVR-035 — Clicking a column header does not sort (no active sort state, row order unchanged)
- TC-CPR-OVR-036 — Every row shows a Current Price value on office 1606 (no blank cell) (NM-2206)
- TC-CPR-OVR-037 — Max Discount % accepts values up to the 100 cap (inclusive)
- TC-CPR-OVR-038 — Every downloaded CSV row is well-formed with valid IDs, currency, 0/1 flags, and money fields
- TC-CPR-OVR-039 — Typing a partial office number narrows picker rows; clearing restores the full list
- TC-CPR-OVR-040 — Picker Active checkbox defaults to unchecked; toggling is a client-side filter — no location-lookup POST fires on toggle
- TC-CPR-OVR-041 — Non-Revenue-Management user sees a read-only Override grid — no edit, no Save, no Import (SKIPPED — RBAC blocked)
- TC-CPR-OVR-042 — Active-only removes inactive rows and restores the full set on uncheck (NM-2269)
- TC-CPR-OVR-043 — Currency filter narrows the grid to rows matching the selected currency (SKIPPED — data-blocked, no multi-currency bed)
- TC-CPR-OVR-044 — Compound: Active-only + text filter intersection; order independence; full reset restores (NM-2269)
- TC-CPR-OVR-045 — Text filter "Camlok" narrows the grid to matching rows; clearing restores the full set (NM-2270)
- TC-CPR-OVR-046 — Product Group Name column sort: ascending/descending first cell and monotonic order asserted (NM-2270)
- TC-CPR-OVR-047 — Product Group column sort: self-verifying monotonic oracle, no hardcoded first-cell value (NM-2270)
- TC-CPR-OVR-048 — Hiding "Max Discount %" reduces visible column count; Reset to Default restores all columns (NM-2270)
- TC-CPR-OVR-049 — Text filter and column sort applied together; every row matches filter; filter survives sort; reset restores (NM-2270)

## Scenario: TC-CPR-OVR-042 - Active-only effect: 9→7→9 row-count delta with identity delta (NM-2269)
1. Step: getActiveOnlyState → false; getVisibleRowCount → 9
2. Step: setActiveOnly(true) + waitForTimeout(800), expected: getVisibleRowCount 7; findRowByProductGroup("Camlok #1…") null; findRowByProductGroup("Camlok #2…") null
3. Step: setActiveOnly(false) + waitForTimeout(800), expected: getVisibleRowCount 9; both Camlok rows present
Data: office=1105 (9 rows / 7 active / Camloks 1482+1484 inactive)

## Scenario: TC-CPR-OVR-043 - Currency filter grid narrowing (SKIPPED — data-blocked)
Skipped: all corporate-group offices as of 2026-07-17 carry USD-only rows (1101=0 rows, 1105/1606/1107 all USD). Re-enable when a multi-currency bed is identified or seeded.

## Scenario: TC-CPR-OVR-044 - Compound filter stress: intersection + order independence + full reset (NM-2269)
1. Step: filterProductGroups("Camlok") → 2 rows; setActiveOnly(true) → 0 rows (Phase A)
2. Step: clearFilter + setActiveOnly(false) → 9 rows (reset)
3. Step: setActiveOnly(true) → 7; filterProductGroups("Camlok") → 0 rows (Phase B — order independent)
4. Step: setActiveOnly(false) → 2 rows (Camlok filter still active); clearFilter → 9 rows fully restored

## Scenario: TC-CPR-OVR-045 - Grid text filter effect: "Camlok" narrows to 2 rows; clear restores 9 (NM-2270)
1. Step: getVisibleRowCount → 9 (baseline, office 1105)
2. Step: filterProductGroups("Camlok"), expected: getVisibleRowCount 2; getColumnCellValues(2) contains "Camlok #1 - 50' (Set of 5 Conductors)" and "Camlok #2 - 10'"
3. Step: clearFilter, expected: getVisibleRowCount 9

## Scenario: TC-CPR-OVR-046 - Product Group Name sort ASC/DESC with walk-certified first-cell oracles (NM-2270)
1. Step: sortColumnViaDropdown("Product Group Name", "ascending"), expected: getFirstRowCellText(2) == "07A Compass Screen Set Kit"; getColumnCellValues(2) non-decreasing
2. Step: sortColumnViaDropdown("Product Group Name", "descending"), expected: getFirstRowCellText(2) == "Whiteboard Supply - Marker 4 Pk" (confirmed via live run 2026-07-18); getColumnCellValues(2) non-increasing

## Scenario: TC-CPR-OVR-047 - Product Group column sort: self-verifying monotonic oracle (NM-2270)
1. Step: sortColumnViaDropdown("Product Group", "ascending"), expected: getColumnCellValues(1) length > 0; non-decreasing (numeric comparison)
2. Step: sortColumnViaDropdown("Product Group", "descending"), expected: getColumnCellValues(1) length > 0; non-increasing (numeric comparison)

## Scenario: TC-CPR-OVR-048 - Grid Options: hide "Max Discount %" reduces columns; Reset restores (NM-2270)
1. Step (baseline): getColumnCount → 10; beforeEach/afterEach ensureAllGridColumnsVisible
2. Step: openGridOptions + toggleGridColumn("Max Discount %") + closeGridOptions, expected: getColumnCount 9
3. Step: openGridOptions + resetGridToDefault + closeGridOptions, expected: getColumnCount 10

## Scenario: TC-CPR-OVR-049 - Text filter + sort simultaneously; every row matches filter; filter survives sort; reset restores (NM-2270)
1. Step: filterProductGroups("Camlok") → 2 rows; sortColumnViaDropdown("Product Group Name", "ascending"), expected: getColumnCellValues(2).length 2; every row name contains "Camlok" (case-insensitive); values non-decreasing
2. Step: clearFilter, expected: getVisibleRowCount 9
