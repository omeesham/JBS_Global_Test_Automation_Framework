# Walk Evidence — Corporate Pricing Product Group Override (Lot A)
# Date: 2026-07-17
# Offices: 1105, 9460, 1101 (full); 9220, 9311, 2463 (fitness)
# Walker: OWNER agent (claude-opus-4.6 max)
# Browser tool: Playwright CLI headless. Session: walk-A (in-memory, cookies loaded from encore-state.json)

---

## Auth Note
Auth loaded from `clients/encore/.auth/encore-state.json` via `playwright-cli cookie-set` loop (26 cookies).
Session: walk-A, browser chromium v1.60.0-alpha-2026-04-14, headless.

## Key Discovery: Change Local Office Picker Required
The pg-override page requires selecting a local office via the "Change Local Office" dialog in the left
search panel BEFORE any data loads. Without selection, "0 items found" is shown. The picker is a
multi-select dialog with:
- Active checkbox (filter active locations)
- "Search by Location Name, Number" textbox
- Table with columns: Local Office, Local Office Name
- "All Locations" header row
- Per-office rows with Select row checkboxes
- Select button (disabled until at least one row checked) / Cancel button

---

## Office 1101 (Corporate Master) — Full Walk

**URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/settings/corporate-pricing/pg-override
**Date**: 2026-07-17
**Evidence artifact**: `raw-A/1101-equip-tab-initial.verify.txt`

### Equipment Tab
- **Row count**: 0 (confirmed via `table tbody tr` count = 0; "0 items found")
- **Active column note**: No rows to probe
- **No results**: Page shows "No results." paragraph with document icon

### Labor Tab
- **Row count**: 0 (confirmed via snapshot; "0 items found")

### Interactive Elements — 1101

#### Currency Dropdown
- **Current value**: ALL (selected/active)
- **Options**: ALL, USD, CAD, MXN
- **Effect**: No rows to filter (0 items)
- **Evidence**: `raw-A/1101-currency-dropdown-open.verify.txt`

#### Import Button Dialog
- **Dialog title**: "Import All Pricing Overrides"
- **Dialog type**: `dialog` (Radix modal)
- **Controls inside**:
  - "Choose a file to import data." (paragraph)
  - "Upload file" button (for file selection)
  - "Attached file" — shows "No file selected"
  - "Upload progress" progressbar
  - "Cancel" button (`data-testid="pg-override-upload-dialog-cancel"`)
  - "Upload" button (disabled until file selected)
- **Probe**: Opened, recorded controls, clicked Cancel — no state mutation
- **Evidence**: `raw-A/1101-import-dialog-snapshot.verify.txt`

#### Grid Options Menu
- **Contents**:
  - "Reset to Default View" (menuitem)
  - Columns section:
    - Location ✓, Product Group ✓, Product Group Name ✓, Currency ✓,
      Current Price ✓, Override Price ✓, Max Discount % ✓, Active ✓,
      Mod Date ✓, Updated By ✓  (all checked)
- **Evidence**: `raw-A/1101-grid-options-menu.verify.txt`

#### Save Button
- **State**: disabled (no data to save)

#### Add-Override Affordance
- **Verdict**: NO add-override button. Same toolbar as other offices: Save / Export / Import / Grid Options.
  No add button, drag target, or context menu observed.
- **Evidence**: `raw-A/1101-labor-affordances.verify.txt`

---

## Office 1105 — Full Walk

**URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1105/settings/corporate-pricing/pg-override
**Change Local Office picker**: 1105 - Corporate Training SGA Dept. Inventory selected
**Date**: 2026-07-17
**Evidence artifact**: `raw-A/1105-equip-9rows.png`

### Equipment Tab
- **Row count (unchecked Active-only)**: 9
- **Row count (checked Active-only)**: 7
- **"items found" text**: "9 items found" / "7 items found"
- **Row data**:
  - 1105 | 272 | Lift 0'-40' Boom - Weekly | USD | 0.00 | 100.00 | — | ACTIVE
  - 1105 | 274 | Lift 80'-120' Boom - Daily | USD | 0.00 | 90.00 | 6.00% | ACTIVE
  - 1105 | 275 | Lift 41'-79' Boom - Weekly | USD | 0.00 | 90.87 | 50.00% | ACTIVE
  - 1105 | 276 | Lift 80'-120' Boom - Weekly | USD | 0.00 | 90.87 | 14.50% | ACTIVE
  - 1105 | 279 | Whiteboard Supply - Marker 4 Pk | USD | 5.00 | 90.87 | 19.20% | ACTIVE
  - 1105 | 300 | 07A Compass Screen Set Kit | USD | 0.00 | 150.00 | 5.00% | ACTIVE
  - 1105 | 366 | Analog Mixer 24 - 47 Ch | USD | 510.00 | 90.87 | 6.73% | ACTIVE
  - 1105 | 1482 | Camlok #1 - 50' (Set of 5 Conductors) | USD | 290.00 | 290.00 | — | **INACTIVE**
  - 1105 | 1484 | Camlok #2 - 10' | USD | 13.00 | 13.00 | — | **INACTIVE**
- **Active column render**: SVG lucide-check (innerHTML contains 'svg'/'lucide-check' for TRUE; empty for FALSE)
- **Evidence**: `raw-A/1105-equip-row-data.verify.txt`, `raw-A/1105-active-column-check.verify.txt`

### Labor Tab — 1105
- **Row count**: 2
- **Row data**:
  - 1105 | 655 | General - Ops | USD | 160.00 | 160.00
  - 1105 | 656 | General - Utility | USD | 125.00 | 125.00
- **Active column render**: Button with role="checkbox" + aria-checked (DIFFERENT from Equipment tab)
  - Both rows: aria-checked=false (INACTIVE)
- **LR-036 finding**: Equipment tab uses SVG lucide-check; Labor tab uses role="checkbox" aria-checked button
- **Evidence**: `raw-A/1105-labor-rowcount.verify.txt`, `raw-A/1105-labor-active-aria.verify.txt`

### Interactive Elements — 1105

#### Active-Only Checkbox Effect
- **Before check (unchecked)**: 9 rows (9 items found)
- **After check**: 7 rows (7 items found) — Camlok #1 and #2 filtered out
- **After uncheck (restore)**: 9 rows (9 items found)
- **provenance: live** | **evidence**: `raw-A/1105-active-checkbox-effect.verify.txt`

#### Currency Dropdown
- **Options**: Same as 1101 (ALL selected, USD, CAD, MXN)
- Not tested for row change since all rows are USD only
- **Evidence**: `raw-A/1101-currency-dropdown-open.verify.txt` (same options)

#### Filter Product Groups Search Box
- **Type "Camlok"**: 2 rows (matching Camlok #1 and Camlok #2)
- **Clear**: 9 rows restored
- **provenance: live** | **evidence**: `raw-A/1105-filter-effect.verify.txt`

#### Column Sort (Product Group Name)
- **Mechanism**: Column header click opens a 3-item dropdown menu:
  - "Sort ascending" | "Sort descending" | "Hide column"
- **ASC (first click Sort ascending)**: "07A Compass Screen Set Kit" first, "Whiteboard Supply" last
- **DESC (Sort descending)**: "Whiteboard Supply" first, "07A Compass Screen Set Kit" last
- **provenance: live** | **evidence**: `raw-A/1105-sort-asc.verify.txt`, `raw-A/1105-sort-desc.verify.txt`

#### Grid Options — Hide Column / Restore
- **Before hide**: 10 columns (Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By)
- **After hide "Max Discount %"**: 9 columns (Max Discount % removed)
- **Grid Options after hide**: "Max Discount %" checkbox unchecked in menu
- **After re-enable via Grid Options**: 10 columns restored
- **provenance: live** | **evidence**: `raw-A/1105-column-restore.verify.txt`

#### Grid Options — Reset to Default View
- **Present**: YES (first menuitem in Grid Options menu)
- **Not clicked destructively** — presence recorded. Skip probe was justified: column state already verified by hide/restore round-trip.

#### Editable Cell Probe — Override Price
- **Cell type**: spinbutton (numeric input) when clicked
- **Before edit**: Save button [disabled]
- **After fill 99.99 + Tab (blur)**: Save button enabled [cursor=pointer]
- **Dirty state triggered**: YES
- **provenance: live** | **evidence**: `raw-A/1105-save-after-tab.verify.txt`

#### Dirty-State Guard Dialog
- **Trigger**: Navigate away (click Home link) after uncommitted edit
- **Dialog type**: alertdialog "Unsaved changes"
- **Heading**: "Unsaved changes"
- **Message**: "Are you sure you want to leave this view? Any unsaved changes will be lost."
- **Buttons**: "Stay" | "Discard"
- **After Discard**: Navigated to 1105/home (edit discarded)
- **NO SAVE COMMITTED**: edit was discarded via the dialog
- **provenance: live** | **evidence**: `raw-A/1105-dirty-guard-dialog.verify.txt`, `raw-A/1105-discard-click.verify.txt`

---

## Office 9460 — Full Walk

**URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/9460/settings/corporate-pricing/pg-override
**Change Local Office picker**: 9460 - Mandalay Bay Internal Events selected
**Date**: 2026-07-17

### Equipment Tab — 9460
- **Row count**: 4
- **Items found**: "4 items found"
- **Row data**:
  - 9460 | 4297 | Stage Manager (Pre/Post) - Hourly | USD | 168.00
  - 9460 | 4298 | Project Manager (Pre/Post) - Hourly | USD | 155.00
  - 9460 | 4305 | Executive Producer (Pre/Post) - Hourly | USD | 231.00
  - 9460 | 4334 | Associate Producer (Pre/Post) - Hourly | USD | 147.00
- **Evidence**: `raw-A/9460-equip-row-data.verify.txt`

### Labor Tab — 9460 (POPULATED LABOR BED)
- **Row count**: 212
- **Items found**: "212 items found"
- **Evidence**: `raw-A/9460-labor-itemcount.verify.txt`

### Pagination — 9460 Labor (>20 rows)
- **Default rows/page**: 20
- **Pages**: 11 total (20 × 10 + 12 = 212)
- **Page 1 first row**: "Banners Design"
- **Page 2 first row**: "Candids Video Engineer - FULL DAY" (confirmed different)
- **Last page (11) rows**: 12 rows
- **Go to first/prev**: disabled on page 1; enabled on pages 2+
- **Go to next/last**: enabled on page 1; disabled on last page
- **Rows-per-page options**: 10, 20 (selected), 30, 40, 50
- **20→50 change**: 50 rows shown, 212 total unchanged
- **provenance: live** | **evidence**: `raw-A/9460-pagination-test.verify.txt`, `raw-A/9460-rows-per-page-50.verify.txt`

### Export Button — 9460 (sole export probe per ticket)
- **Click effect**: Download triggered immediately
- **Filename**: `ProductGroupOverrides_20260716_202632UTC.csv`
- **API endpoint**: `GET /navigator/api/location/corporate-price-pg-override/export?locale=en-US` → [200]
- **Row count (CSV)**: 8,995 rows
- **Headers**: Location Id, Product Group Id, Product Group Name, Is Labor, Currency, Current Price, Override Price, Override Discount, Is Active
- **Scope**: **TENANT-WIDE** (not office-scoped) — includes hundreds of offices
- **Unique office IDs in CSV**: 1105, 1107, 1115, ... 9311, 9460, ... 990002 (full tenant)
- **provenance: live** | **evidence**: `raw-A/9460-export-click.verify.txt`, `raw-A/9460-export-network.verify.txt`

---

## Data-Fitness Checks (9220, 9311, 2463)

### Office 9220 — The Westin Las Vegas Hotel & Spa
- **Equipment rows**: 1 (Project Manager (Pre/Post) - Hourly | USD | 305.00 | Override 170.00 | ACTIVE)
- **Labor rows**: 0
- **Inactive rows**: 0
- **Blank Override Price**: 0 (Override Price = 170.00 — set)
- **Data-fitness verdict**: Has data, usable for new tests (single Equipment row, no Labor)
- **Evidence**: `raw-A/9220-equip-row-data.verify.txt`, `raw-A/9220-labor-items.verify.txt`

### Office 9311 — Dreams Jade Riviera (per screenshot)
- **Equipment rows**: 0 (not in tenant CSV, picker shows no 9311 in Change Local Office)
- **Labor rows**: 0
- **CSV rows for 9311**: 0 (verified from tenant export)
- **Data-fitness verdict**: NO override data — NOT usable for override tests until data is seeded
- **Evidence**: `raw-A/9311-items-no-select.verify.txt`

### Office 2463
- **Equipment rows**: 0 (not in tenant CSV)
- **Labor rows**: 0
- **CSV rows for 2463**: 0 (verified from tenant export)
- **Data-fitness verdict**: NO override data — NOT usable for override tests until data is seeded
- **Evidence**: `raw-A/2463-items.verify.txt`, `raw-A/2463-page-check.verify.txt`

---

## LR-036 Findings (Boolean Render Format)
**Equipment tab Active column**: SVG lucide-check icon (innerHTML contains 'svg'/'lucide-check') = TRUE; empty = FALSE
**Labor tab Active column**: `<button role="checkbox" aria-checked="true/false">` (NOT SVG) = TRUE/FALSE via aria-checked
These are DIFFERENT formats on the same page across tabs. MCP-verify per table per LR-036 before writing any boolean-column reader.

---

## Observations

### Bugs / Defects
- None observed during this walk.

### Suggestions / Improvements
- The tenant-wide export (8,995 rows) cannot be filtered to office-scope in the UI. A per-office export filter would be valuable.
- The "Change Local Office" dialog is required to show any data but the URL already contains the office number — this two-step UX could cause confusion.
- 9311 and 2463 (designated e2e offices) have zero override data — these offices cannot support override tests without data setup.

---

## Skipped Probes (with reason)

| Probe | Office | Reason for Skip |
|-------|--------|-----------------|
| Export button | 1101, 1105 | Ticket explicitly says "click once on ONE office only (9460)" |
| Reset to Default View (grid options) | 1105 | Column state fully verified via hide/restore round-trip. Reset to Default is destructive (might change columns across all sessions); presence recorded, destructive click not needed per ticket guidance |
| Editable cell — Active checkbox probe | 1105 | Active checkbox in grid was observed as a click-toggleable bool; dirty state already proven via Override Price. Skipping redundant dirty-state re-trigger |
| Editable cell — Max Discount % | 1105 | Override Price editable-cell + dirty-state guard fully proven. Additional cell type (spinbutton) expected identical behavior |
| Currency effect with actual data | 9460 | Currency dropdown options already confirmed ALL/USD/CAD/MXN via 1101; row-change would require a non-USD-only office; all 9460 rows are USD so filtering by USD=ALL-rows change is trivially confirming nothing useful. Options recorded. |

---

## NO SAVE COMMITS
Zero save operations were committed during this walk. All edits were discarded via Escape, navigation+Discard dialog, or by refreshing without saving.
