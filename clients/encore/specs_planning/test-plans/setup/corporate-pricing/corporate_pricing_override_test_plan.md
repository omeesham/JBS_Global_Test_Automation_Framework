# Corporate Pricing — Product Group Override Test Plan (NM-1463, Wave-1.5-A FCC)

**Module**: corporate-pricing
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md
**Field Inventory**: specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-09.md
**Divergences**: specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md
**Updated**: 2026-07-22 (NM-2271 Wave-2: 62 new cases TC-CPR-OVR-066..127 — Override Price BVA/rejection, Labor axis, Max Discount % Labor, location-picker edge cases, pagination RPP, currency filter)

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

---

## Wave-2 Traceability (NM-2271) — 62 new test cases

| Lot | Cases | Final IDs | Coverage |
|-----|-------|-----------|----------|
| LOT-A | 18 | TC-CPR-OVR-066..083 | Override Price BVA/rejection (Equipment), Max Discount % BVA/defects (Equipment), net-zero |
| LOT-B | 15 | TC-CPR-OVR-084..098 | Override Price full axis (Labor), defect assertions (Labor), net-zero |
| LOT-C | 13 | TC-CPR-OVR-099..111 | Max Discount % full axis (Labor), defect assertions (Labor), net-zero |
| LOT-D | 9 | TC-CPR-OVR-112..120 | Location picker edge cases, import rejection, tab-switch dirty state, filter+sort |
| LOT-D-RPP | 4 | TC-CPR-OVR-121..124 | Rows-per-page re-render (10/30/40/50) |
| LOT-D-CUR | 3 | TC-CPR-OVR-125..127 | Currency filter (USD/CAD/MXN) |

**TC-CPR-OVR-023 replaced**: previously skipped (">100 handling unknown"); now authored with full rejection oracle (>100 contract established). Content sourced from LOT-A TC-CPR-OVR-A-12.

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
- TC-CPR-OVR-050 — Labor tab renders a populated grid with real data on office 9460 (NM-2271)
- TC-CPR-OVR-051 — Labor grid text filter narrows to matching rows and clearing restores the page (NM-2271)
- TC-CPR-OVR-052 — Labor grid column sort orders Product Group Name ascending and descending (NM-2271)
- TC-CPR-OVR-053 — Labor Override Price save-cycle persists after reload and restores (NM-2271)
- TC-CPR-OVR-054 — Labor Max Discount % save-cycle persists after reload and restores (NM-2271)
- TC-CPR-OVR-055 — Labor Active toggle save-cycle persists after reload and restores (NM-2271)
- TC-CPR-OVR-056 — Navigating away from a dirty grid raises the unsaved-changes dialog; Stay keeps the page and the edit (NM-2271)
- TC-CPR-OVR-057 — Discard in the unsaved-changes dialog leaves the page and drops the edit (NM-2271)
- TC-CPR-OVR-058 — Page navigation changes the visible rows and enables or disables the nav buttons at each end (NM-2271)
- TC-CPR-OVR-059 — Raising rows-per-page shows more rows without changing the total (NM-2271)
- TC-CPR-OVR-060 — A page-1 row reads back identically after paging to the last page and returning (NM-2271)
- TC-CPR-OVR-061 — A blank Override Price renders as an em-dash in a muted style, not an empty cell (NM-1932)
- TC-CPR-OVR-062 — Enter opens the Override Price editor on a focused cell; Escape closes it without dirtying the form (NM-2271)
- TC-CPR-OVR-063 — The Product Group picker appears only when a specific currency is selected (NM-2271)
- TC-CPR-OVR-064 — Dragging a picker row stages a new override row with no request until Save; Discard drops it (NM-2271)
- TC-CPR-OVR-065 — The picker serves the Labor tab and drag staging works there too (NM-2271)

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

## Scenario: TC-CPR-OVR-050 - Labor tab renders a populated grid with real data on office 9460 (NM-2271)
1. Step: reloadAndReselect("9460", "9460") + switchOverrideTab("Labor"), expected: getActiveTab "Labor"
2. Step: getVisibleRowCount, expected: > 0 (populated grid)
3. Step: getItemsFoundTotal, expected: > 100 (triple-digit Labor data set — "212 items found" at verification time)
4. Step: findRowByProductGroup("Banners Design"), expected: not null

## Scenario: TC-CPR-OVR-051 - Labor grid text filter narrows to matching rows and clearing restores the page (NM-2271)
1. Step: getVisibleRowCount (full page baseline)
2. Step: filterProductGroups("Banners"), expected: count narrows below the full page, stays above 0; findRowByProductGroup("Banners Design") not null
3. Step: clearFilter, expected: getVisibleRowCount above the narrowed count (relative assertions only)

## Scenario: TC-CPR-OVR-052 - Labor grid column sort orders Product Group Name ascending and descending (NM-2271)
1. Step: sortColumnViaDropdown("Product Group Name", "ascending"), expected: getColumnCellValues(2) length > 1; sequence non-decreasing (case-insensitive)
2. Step: sortColumnViaDropdown("Product Group Name", "descending"), expected: sequence non-increasing (self-verifying monotonic oracle)

## Scenario: TC-CPR-OVR-053 - Labor Override Price save-cycle persists after reload and restores (NM-2271)
1. Step: ensureDefaultState("General - Ops", {160.00, inactive}, "1105", "1105", "Labor") (per-test baseline)
2. Step: setOverridePrice(row 655, "161"), expected: isOverrideSaveEnabled true
3. Step: saveAndConfirm (dialog + backend save call + toast)
4. Step: reloadAndReselect + switchOverrideTab("Labor"), expected: readOverridePrice(row 655) 161
5. Step: cleanup ensureDefaultState, expected: 160.00 restored and verified

## Scenario: TC-CPR-OVR-054 - Labor Max Discount % save-cycle persists after reload and restores (NM-2271)
1. Step: baseline ensureDefaultState (Labor) → setMaxDiscount(row 655, "10"), expected: Save enables
2. Step: saveAndConfirm → reloadAndReselect + Labor tab, expected: readMaxDiscount(row 655) 10
3. Step: cleanup ensureDefaultState, expected: Max Discount back to unset ("—")

## Scenario: TC-CPR-OVR-055 - Labor Active toggle save-cycle persists after reload and restores (NM-2271)
1. Step: baseline ensureDefaultState (Labor) → readActiveState(row 655) → toggleActive, expected: Save enables
2. Step: saveAndConfirm → reloadAndReselect + Labor tab, expected: readActiveState == !original (persisted)
3. Step: cleanup ensureDefaultState, expected: inactive baseline restored

## Scenario: TC-CPR-OVR-056 - Dirty-grid navigation guard: Stay keeps the page and the edit (NM-2271)
1. Step: setOverridePrice(row 655, original+39), expected: isOverrideSaveEnabled true (dirty)
2. Step: navigateHomeExpectUnsavedDialog, expected: dialog text contains "Unsaved changes", the verbatim body, "Stay", "Discard"
3. Step: stayOnPage, expected: URL still /pg-override; readOverridePrice(row 655) == staged value; Save still enabled
4. Step: cleanup navigateHomeExpectUnsavedDialog + discardAndLeave

## Scenario: TC-CPR-OVR-057 - Dirty-grid navigation guard: Discard leaves and drops the edit (NM-2271)
1. Step: setOverridePrice(row 655, original+41), expected: dirty
2. Step: navigateHomeExpectUnsavedDialog + discardAndLeave, expected: URL contains /home
3. Step: reloadAndReselect + Labor tab, expected: readOverridePrice(row 655) == original (nothing persisted)

## Scenario: TC-CPR-OVR-058 - Page navigation: row content changes per page; nav buttons disable at each end (NM-2271)
1. Step: getPaginationButtonStates on page 1, expected: first+previous disabled, next+last enabled; record getFirstRowCellText(2)
2. Step: goToPage("next"), expected: first-row identity changes; previous enables
3. Step: goToPage("last"), expected: next+last disabled; getVisibleRowCount > 0 and <= getRowsPerPageValue

## Scenario: TC-CPR-OVR-059 - Rows-per-page 20→50 shows more rows; total unchanged (NM-2271)
1. Step: getVisibleRowCount + getItemsFoundTotal (baseline at 20)
2. Step: setRowsPerPage("50"), expected: getVisibleRowCount increased; getItemsFoundTotal unchanged

## Scenario: TC-CPR-OVR-060 - Content-anchored round trip: page 1 row reads back identically after last-page round trip (NM-2271)
1. Step: getFirstRowCellText(2) (content anchor on page 1)
2. Step: goToPage("last"), expected: getVisibleRowCount > 0
3. Step: goToPage("first"), expected: getFirstRowCellText(2) identical to the anchor; findRowByProductGroup(anchor) not null

## Scenario: TC-CPR-OVR-061 - Blank Override Price renders as an em-dash in a muted style (NM-1932)
1. Step: reloadAndReselect("1115", "1115"); findRowByProductGroup("01D Double Screen Set Kit"), expected: not null
2. Step: readOverridePrice(row), expected: exactly "—" (em-dash) and NOT ""
3. Step: read the cell markup, expected: contains the muted placeholder span class

## Scenario: TC-CPR-OVR-062 - Keyboard access: Enter opens the cell editor; Escape cancels without dirtying (NM-2271)
1. Step: openOverridePriceEditorWithKeyboard(anchor row), expected: editor value == the row's current Override Price
2. Step: closeEditorWithKeyboard, expected: isOverrideSaveEnabled false (no dirty state)
3. Note: arrow-key grid navigation does NOT exist and the save dialogs render aria-hidden while modal — documented findings, not assertions

## Scenario: TC-CPR-OVR-063 - Product Group picker appears only when a specific currency is selected (NM-2271)
1. Step: reloadAndReselect("4104", "4104"); isProductGroupPickerVisible, expected: false (Currency ALL)
2. Step: selectCurrency("USD"), expected: isProductGroupPickerVisible true (poll)
3. Step: getPickerDraggableRowCount, expected: > 0

## Scenario: TC-CPR-OVR-064 - Drag staging: row count +1, zero save requests, 0.00/inactive landing; Discard drops it (NM-2271)
1. Step: selectCurrency("USD") + record getVisibleRowCount + attach save-endpoint request listener
2. Step: dragFirstPickerRowToGrid("Equipment"), expected: getVisibleRowCount +1; zero save requests during the drag; isOverrideSaveEnabled true
3. Step: findRowByProductGroup(dragged id), expected: readOverridePrice 0.00; readActiveState false
4. Step: navigateHomeExpectUnsavedDialog + discardAndLeave; reloadAndReselect + selectCurrency("USD"), expected: row count back to the pre-drag value

## Scenario: TC-CPR-OVR-065 - The picker serves the Labor tab and drag staging works there too (NM-2271)
1. Step: selectCurrency("USD") + switchOverrideTab("Labor"), expected: isProductGroupPickerVisible true; getPickerDraggableRowCount > 0
2. Step: dragFirstPickerRowToGrid("Labor"), expected: getVisibleRowCount +1; isOverrideSaveEnabled true
3. Step: cleanup navigateHomeExpectUnsavedDialog + discardAndLeave (nothing persists)


## Scenario: TC-CPR-OVR-128 - Export returns every location in the tenant
1. Step: downloadOverrideExport, expected: distinct Location Id count > 500 and > 1

## Scenario: TC-CPR-OVR-129 - Export carries the full override population
1. Step: downloadOverrideExport, expected: data rows > 5000 and > getVisibleRowCount()

## Scenario: TC-CPR-OVR-130 - Labor tab re-scopes the grid but not the export
1. Step: switchOverrideTab("Equipment") + downloadOverrideExport, expected: baseline file + grid row count
2. Step: switchOverrideTab("Labor"), expected: getActiveTab "Labor"; getVisibleRowCount differs from Equipment
3. Step: downloadOverrideExport, expected: content identical to baseline; Is Labor values include both 0 and 1

## Scenario: TC-CPR-OVR-131 - A different office re-scopes the grid but not the export
1. Step: downloadOverrideExport, expected: baseline file + grid row count
2. Step: selectLocation("1974") + waitForGridRows, expected: getVisibleRowCount differs from baseline
3. Step: downloadOverrideExport, expected: content identical to baseline

## Scenario: TC-CPR-OVR-132 - Active only hides rows in the grid; the export keeps them
1. Step: reloadAndReselect("1105") + setActiveOnly(false), expected: baseline row count
2. Step: setActiveOnly(true), expected: getVisibleRowCount < baseline
3. Step: downloadOverrideExport, expected: Is Active = 0 rows still present

## Scenario: TC-CPR-OVR-133 - Currency filter empties the grid; the export keeps every currency
1. Step: getCurrencyOptions + selectCurrency(least-used), expected: getVisibleRowCount changes
2. Step: downloadOverrideExport, expected: distinct Currency count >= 3

## Scenario: TC-CPR-OVR-134 - Text filter narrows the grid; the export is unchanged
1. Step: downloadOverrideExport, expected: baseline file
2. Step: filterProductGroups(first 6 chars of the first row name), expected: row count narrows but stays > 0
3. Step: downloadOverrideExport, expected: content identical to baseline

## Scenario: TC-CPR-OVR-135 - Rows-per-page changes the draw; the export is unchanged
1. Step: selectLocation("1974") + setRowsPerPage("10") + downloadOverrideExport, expected: baseline file + rows drawn
2. Step: setRowsPerPage("50"), expected: rows drawn > at 10
3. Step: downloadOverrideExport, expected: content identical to baseline

## Scenario: TC-CPR-OVR-136 - Export on an empty, unscoped grid returns the whole tenant
1. Step: open() with no office, expected: isEmpty true; getVisibleRowCount 0
2. Step: downloadOverrideExport, expected: rows > 5000; distinct locations > 500

## Scenario: TC-CPR-OVR-137 - Equipment grid count reconciles with the export
1. Step: switchOverrideTab("Equipment") + setActiveOnly(false), expected: grid row count
2. Step: downloadOverrideExport, expected: Is Labor = 0 rows for this Location Id == grid count; total office rows >= that

## Scenario: TC-CPR-OVR-138 - The export tolerates rows with no Override Price
1. Step: downloadOverrideExport, expected: blank Override Price count < total; non-blank count > 0

## Scenario: TC-CPR-OVR-139 - CSV structure: LF endings, full column set, quoted inch marks
1. Step: downloadOverrideExportRaw, expected: raw bytes contain LF and zero CR
2. Step: split every data row, expected: field count == header count on all rows
3. Step: collect doubled-quote rows, expected: count > 100; quoting well formed

## Scenario: TC-CPR-OVR-140 - Locale changes the header, never the data
1. Step: fetchExportForLocale("en-US"), expected: 200; header == expectedHeaders
2. Step: fetchExportForLocale for fr-FR and es-MX, expected: 200; header differs; row count and first data row identical to English
3. Step: fetchExportForLocale for de-DE and en-GB, expected: 200; header identical to English

## Scenario: TC-CPR-OVR-141 - Malformed locale falls back instead of failing
1. Step: fetchExportForLocale for zz-ZZ, xx, %20, expected: 200; English header; same row count
2. Step: fetchExportForLocale(""), expected: 200; English header

## Scenario: TC-CPR-OVR-142 - Grid endpoint health across offices
1. Step: fetchGridStatusForOffice for 1105/1974/9187/9019/9185/1115, expected: 200 each
2. Step: fetchGridStatusForOffice("1604"), expected: >= 500 carrying "same key has already been added", or 200 if the office has recovered

## Scenario: TC-CPR-OVR-143 - Tab, Currency and Active only combined
1. Step: downloadOverrideExport, expected: baseline file
2. Step: setActiveOnly(true) then selectCurrency(specific), expected: each count <= the previous
3. Step: switchOverrideTab("Labor"), expected: getActiveTab "Labor"
4. Step: downloadOverrideExport, expected: content identical to baseline

## Scenario: TC-CPR-OVR-144 - Page size across a reload; export unaffected
1. Step: selectLocation("1974") + downloadOverrideExport, expected: baseline file
2. Step: setRowsPerPage("50"), expected: rows drawn > 20
3. Step: reloadAndReselect("1974"), expected: getVisibleRowCount > 0
4. Step: downloadOverrideExport, expected: content identical to baseline

## Scenario: TC-CPR-OVR-145 - Sorting does not reorder the exported file
1. Step: downloadOverrideExport + getFirstRowCellText(2), expected: baseline file + first cell
2. Step: sortColumnViaDropdown("Product Group Name", "descending"), expected: first cell changes
3. Step: downloadOverrideExport, expected: content identical to baseline

## Scenario: TC-CPR-OVR-146 - Grid row reconciles with the export file
1. Step: read first grid row Product Group Id / Name / Override Price, expected: non-empty
2. Step: downloadOverrideExport, expected: a file row matches Location Id + Product Group Id
3. Step: compare Override Price numerically, expected: within 2 decimal places of the on-screen value
4. Step: collect names matching /^0d/, expected: count > 0 and each retains its leading zero
5. Step: inspect the final data row and decode the body, expected: full field count; no replacement characters

## Scenario: TC-CPR-OVR-147 - Override Discount scale integrity
1. Step: downloadOverrideExport, expected: non-empty Override Discount values collected
2. Step: split at 1, expected: fraction-scale count > 10x the above-1 count
3. Step: count above-1 rows, expected: <= 4 (the known percent-scale rows); each reported as the percentage it renders (>100)

## Scenario: TC-CPR-OVR-148 - Import dialog gates Upload until a file is attached
1. Step: reloadAndReselect("4107") + openImportDialog, expected: readImportDialog().text contains "Import All Pricing Overrides"; buttons contain "Cancel"
2. Step: readImportUploadState (before any file), expected: uploadDisabled true; noFileVisible true
3. Step: attachImportFile(import-all/malformed.csv), expected: readImportUploadState().uploadDisabled false (attaching a file enables Upload)
4. Step: closeImportDialog, expected: isImportDialogVisible false (Cancel dismisses with nothing uploaded)

## Scenario: TC-CPR-OVR-149 - Malformed CSV rejected; zero rows changed (office 4107)
1. Step (baseline): reloadAndReselect("4107"); capture readOverridePrice(product group 4298 row) + getVisibleRowCount
2. Step: openImportDialog + attachImportFile(import-all/malformed.csv) + clickImportUpload, expected: readImportAlert matches /Error Row#:\d+, Msg: LocationId, ProductGroupId, OverridePrice is required\./
3. Step (verify): reloadAndReselect("4107"), expected: readOverridePrice == baseline; getVisibleRowCount == baseline count (rejection prevented any mutation)

## Scenario: TC-CPR-OVR-150 - Empty CSV rejected with file-format error; zero rows changed (office 4107)
1. Step (baseline): reloadAndReselect("4107"); capture readOverridePrice(product group 4298 row) + getVisibleRowCount
2. Step: openImportDialog + attachImportFile(import-all/empty.csv) + clickImportUpload, expected: readImportAlert == "Please check the upload file format." (distinct from the malformed row-error)
3. Step (verify): reloadAndReselect("4107"), expected: readOverridePrice == baseline; getVisibleRowCount == baseline count

## Scenario: TC-CPR-OVR-151 - Valid import round-trip on 4107/4298 (minimal file → clean HTTP 200; NM-2186 full-dump stall avoided)
1. Step: downloadOverrideExport; extract the verbatim target row (4107/4298) + header; read baseline price; modified = baseline + 0.01
2. Step: openImportDialog + attachImportFile(minimal file = header + the one target row, price=modified) + submitImportAndCaptureResult, expected: status 200 AND successRecordCount 1 AND failureRecordCount 0 (a 200 alone is not proof — the body is the oracle); awaitImportedOverridePrice("4107", 4298, modified) == modified after reload; target row Updated By stamped + fresh Mod Date + currency/Active unchanged
3. Step (canary): reloadAndReselect("1105"), expected: getVisibleRowCount 9 + inactiveGroupName1 row present (a minimal import applied exactly one row — a location absent from the file keeps its full set and content)
4. Step (restore): openImportDialog + attachImportFile(minimal file, price=baseline) + submitImportAndCaptureResult; awaitImportedOverridePrice("4107", 4298, baseline) == baseline (restored)

## Scenario: TC-CPR-OVR-152 - Raw export rejected on its empty-Override-Price row; full rollback (NM-1940)
1. Step (baseline): reloadAndReselect("4107"); capture readOverridePrice(product group 4298 row)
2. Step: downloadOverrideExport, expected: content still carries the empty-Override-Price row (prefix "1115,286,")
3. Step: openImportDialog + attachImportFile(raw export) + clickImportUpload, expected: readImportAlert matches /Error Row#:\d+, Msg: LocationId, ProductGroupId, OverridePrice is required\./ (observed Row#:19)
4. Step (verify): reloadAndReselect("4107"), expected: readOverridePrice == baseline (whole import aborted, no partial apply)
5. Step (canary): reloadAndReselect("1105"), expected: getVisibleRowCount 9 + inactiveGroupName1 row present (aborted import touched no other office)

## Scenario: TC-CPR-OVR-153 - Import rejects an invalid currency (per-row body error, nothing applied)
1. Step (baseline): reloadAndReselect("4107"); readOverridePrice(4298)
2. Step: openImportDialog + attachImportFile(override-invalid-currency.csv) + submitImportAndCaptureResult, expected: status 200, successRecordCount 0, failureRecordCount 1, errors contains "invalid data for Currency"
3. Step (verify): reloadAndReselect("4107"), expected: readOverridePrice unchanged

## Scenario: TC-CPR-OVR-154 - Import rejects a negative Override Price (body error)
1. Step: attachImportFile(override-negative-price.csv) + submitImportAndCaptureResult, expected: 200, 0 applied, 1 failed, errors contains "invalid data for OverridePrice"; grid unchanged after reload

## Scenario: TC-CPR-OVR-155 - Import rejects Override Discount > 100 (import enforces the grid's 100 cap)
1. Step: attachImportFile(override-discount-over-100.csv) + submitImportAndCaptureResult, expected: 200, 0 applied, 1 failed, errors contains "invalid data for OverrideDiscount"; grid unchanged

## Scenario: TC-CPR-OVR-156 - Import rejects a non-numeric Override Price (parse-level alert)
1. Step: attachImportFile(override-nonnumeric-price.csv) + clickImportUpload + readImportAlert, expected: matches /Error Row#:\d+, Msg: The Override Price should be decimal format within two decimal places\./; grid unchanged

## Scenario: TC-CPR-OVR-157 - Import rejects a nonexistent Product Group Id (referential integrity)
1. Step: attachImportFile(override-nonexistent-pg.csv) + submitImportAndCaptureResult, expected: 200, 0 applied, 1 failed, errors contains "ProductGroupId '9999999' does not exist"; grid unchanged

## Scenario: TC-CPR-OVR-158 - Import rejects a nonexistent Location (referential integrity)
1. Step: attachImportFile(override-nonexistent-location.csv) + submitImportAndCaptureResult, expected: 200, 0 applied, 1 failed, errors contains "LocationNo '9999999' does not exist"; grid unchanged

## Scenario: TC-CPR-OVR-159 - Import rejects a row with too few columns (required-field alert)
1. Step: attachImportFile(override-too-few-columns.csv) + clickImportUpload + readImportAlert, expected: matches /Error Row#:\d+, Msg: LocationId, ProductGroupId, OverridePrice is required\./; grid unchanged

## Scenario: TC-CPR-OVR-160 - Import ignores extra trailing columns and applies the valid row
1. Step: attachImportFile(override-extra-columns.csv) + submitImportAndCaptureResult, expected: 200, successRecordCount 1, failureRecordCount 0; reloadAndReselect("4107") readOverridePrice == 152.00 (certified baseline, no drift)

## Scenario: TC-CPR-OVR-161 - Import rejects a header-only file (file-format alert)
1. Step: attachImportFile(override-header-only.csv) + clickImportUpload + readImportAlert, expected: == "Please check the upload file format."; grid unchanged

## Scenario: TC-CPR-OVR-162 - Import blocks a non-CSV file (Upload stays disabled)
1. Step: openImportDialog + attachImportFileRaw(wrong-format.txt), expected: readImportUploadState().uploadDisabled == true AND readImportAlert contains "Unsupported file type. Allowed: .csv"

## Scenario: TC-CPR-OVR-163 - Attached-file state + dismiss without uploading
1. Step: openImportDialog, expected: dialog text contains "No file selected" AND buttons include both Cancel and Close
2. Step: attachImportFile(malformed.csv), expected: dialog text no longer contains "No file selected"
3. Step: closeImportDialog(), expected: isImportDialogVisible() == false

## Scenario: TC-CPR-OVR-164 - Mixed valid+invalid file is a partial success (rows are independent)
1. Step: read baseline Override Price of 4298
2. Step: build [header, valid 4298@baseline, invalid 4107/9999999] + submitImportAndCaptureResult, expected: status 200, successRecordCount 1, failureRecordCount 1, errors contains "ProductGroupId '9999999' does not exist"
3. Step: reloadAndReselect("4107"), expected: readOverridePrice(4298) == baseline (valid no-op row did not corrupt it)

## Scenario: TC-CPR-OVR-165 - Duplicate rows accepted (idempotent, no duplicate-key error)
1. Step: read baseline Override Price of 4298
2. Step: build [header, valid 4298@baseline, valid 4298@baseline] + submitImportAndCaptureResult, expected: status 200, successRecordCount 2, failureRecordCount 0
3. Step: reloadAndReselect("4107"), expected: readOverridePrice(4298) == baseline

## Scenario: TC-CPR-OVR-166 - Large batch (6000 rows) processed per-row, no stall/size-limit
1. Step: read baseline Override Price of 4298
2. Step: build 6000-row all-invalid file (4107/9999999) + submitImportAndCaptureResult, expected: status 200, successRecordCount 0, failureRecordCount 6000 (no stall, no size-limit error)
3. Step: reloadAndReselect("4107"), expected: readOverridePrice(4298) == baseline
