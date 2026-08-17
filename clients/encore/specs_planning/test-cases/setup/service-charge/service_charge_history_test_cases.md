# Service Charge — Service Charge History Test Cases

**Module**: service-charge
**Submodule**: HIS
**Page**: Location Settings → Service Charge → Service Charge History tab (`/settings/service-charge`)
**Test Entity**: Office 1604 (Parker Palm Springs)
**Updated**: 2026-08-16
**Total TCs**: 15
**Coverage mode**: QUICK (L1)

**Governing Requirement**: NM-3344
**Governing tickets**: NM-2210, NM-3300, NM-3285
**Verified against**: machine-captured walk artifacts from 2026-08-11:
`nm3344-histwalk2-0811` (office 1604, 50 rows, first-ten rows cell-for-cell),
`nm3344-histwalkfull-0811` (column headers, interactive census, pagination/filter census, offices
1101 and 1105 row counts), `nm3344-sortprobe-0811` (sorting probe — contaminated, see Validation Rules).

---

## FIELD INVENTORY

| Field | Type | Default (1604) | State | data-testid |
|---|---|---|---|---|
| History tab trigger | Tab | Not selected (Basic Information is active on load) | Clickable | (no data-testid — use accessible name `Service Charge History`) |
| Page `<h1>` | Static text | `Service Charge` | Read-only | (no data-testid — heading element; same text on both tabs) |
| Service Type column header | `<th>` with button | `Service Type` | Read-only (button present; sort unconfirmed — see Validation Rules) | (no data-testid) |
| Service Charge Percentage column header | `<th>` with button | `Service Charge Percentage` | Read-only (button present; sort unconfirmed) | (no data-testid) |
| Modified By column header | `<th>` with button | `Modified By` | Read-only (button present; sort unconfirmed) | (no data-testid) |
| Modified On column header | `<th>` with button | `Modified On` | Read-only (button present; sort unconfirmed) | (no data-testid) |
| Grid rows | Table rows | 50 rows for office 1604 (observed 2026-08-11) | Read-only — no inputs, selects, links, or contenteditable inside grid | (no data-testid on rows) |
| Service Type cell | Table cell | Text label, e.g. `Lighting` | Read-only | (no data-testid) |
| Service Charge Percentage cell | Table cell | Format: `24.00 %` (two decimals, space, `%`) | Read-only | (no data-testid) |
| Modified By cell | Table cell | User identifier email, e.g. `s-prd-clickauto@psav.com` (re-verified 2026-08-14) | Read-only | (no data-testid) |
| Modified On cell | Table cell | Format: `MM/DD/YYYY hh:mm:ss AM\|PM` (12-hour with meridiem), e.g. `01/12/2023 09:19:51 AM` | Read-only | (no data-testid) |

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| History tab is read-only | Interactive census inside the grid: 0 inputs, 0 selects, 0 links, 0 contenteditable, 0 tabindex. The only 4 buttons are the column headers themselves. |
| Column headers are fixed | Four `<th>` elements in order: `Service Type`, `Service Charge Percentage`, `Modified By`, `Modified On`. |
| Page `<h1>` heading and office context | The `<h1>` reads `Service Charge` on both tabs — office context is rendered separately per tab. Basic Information tab shows a "Local Office : \<name\>" line; History tab shows a "Service Charge History : \<name\>" section header. The History section header renders `Service Charge History : Parker Palm Springs` — verified live 2026-08-14. Whether the page `<h1>` was ever meant to carry the office name is not settled by available evidence. |
| Default sort is Modified On descending | Observed order: 2023 row first, then 2021, then 2017 block. Within the 2017 block, `06:56:13 PM` entries precede the `06:56:12 PM` entry — confirming descending order. |
| Percentage format | `24.00 %` — two decimal places, one space before the `%` sign. |
| Date format (Modified On) | `MM/DD/YYYY hh:mm:ss AM\|PM` — 12-hour clock with meridiem suffix; no timezone. |
| Modified By identifies the user who made the change (NM-2210 AC4) | Modified By renders the user's email address (e.g. `s-prd-clickauto@psav.com`). Verified 2026-08-14 (`reports/rca-nm3344-0814/seatB/walk-log.jsonl:414`). Legacy/migrated rows may differ. |
| Unsaved changes modal on tab switch (NM-3285) | Navigating from Basic Information to History with unsaved edits presents an in-app "Unsaved changes" modal titled "Unsaved changes" with body "Are you sure you want to leave this view? Any unsaved changes will be lost." and buttons **Stay** and **Discard**. Verified 2026-08-14 (`reports/rca-nm3344-0814/seatB/walk-log.jsonl:117`). |
| No pagination control | No aria-labelled page controls, no next/prev buttons, no page-size selector, no load-more button observed. |
| No filter or search control | 0 inputs inside the grid area, 0 search inputs globally in the grid, 0 date-range pickers. |
| No horizontal scroll | scrollWidth equals clientWidth (1680 px each); `hasHorizontalScroll: false`. |
| History is per-office | Office 1604: 50 rows. Office 1101: 32 rows. Office 1105: 35 rows. Different offices carry different history sets. |
| Sorting — observed design | Column header clicks do NOT reorder the History grid. Live probe 2026-08-11 on a 76-row populated grid: row 0 unchanged after clicking the Service Type header; `aria-sort` remained null on all headers before and after the click. The `<th>` buttons are present as a design element but do not trigger sorting. |
| After-save row — confirmed | A save on Basic Information immediately adds a row to the top of the History grid. Live probe 2026-08-11: editing APP Downloaded (row 0) from 0.00 to 1.00 and saving produced a new History row: `APP Downloaded | 1.00 % | s-prd-clickauto@psav.com | 08/11/2026 10:16:29 AM`. |

---

## MCP_VERIFICATION_LOG

| # | Claim | Result |
|---|---|---|
| 1 | History tab trigger present | Confirmed — accessible name `Service Charge History`; Radix-generated id observed but non-authoritative (shifts between builds). Source: `nm3344-histwalkfull-0811`. |
| 2 | Page `<h1>` text on History tab | Confirmed `Service Charge` on both tabs — no office name, no "History" suffix. Source: `nm3344-histwalkfull-0811`. |
| 3 | Column headers — text and tag | Confirmed: all four as `<th>` in order `Service Type`, `Service Charge Percentage`, `Modified By`, `Modified On`. Source: `nm3344-histwalkfull-0811`. |
| 4 | Grid populates for office 1604 | Confirmed — `populatedWithinTimeout: true`, `finalRowCount: 50`, `stillEmptyAt90s: false`. Source: `nm3344-histwalk2-0811`. |
| 5 | First ten rows — cell values | Confirmed cell-for-cell (see first-ten-rows table in ticket). Source: `nm3344-histwalk2-0811`. |
| 6 | Percentage format | Confirmed `24.00 %` across all ten sampled rows. Source: `nm3344-histwalk2-0811`. |
| 7 | Date format (Modified On) | Confirmed `MM/DD/YYYY hh:mm:ss AM\|PM` (e.g. `01/12/2023 09:19:51 AM`). Source: `nm3344-histwalk2-0811`. |
| 8 | Default sort Modified On descending | Confirmed by row ordering: 2023 → 2021 → 2017 block, and within block `…:13 PM` before `…:12 PM`. Source: `nm3344-histwalk2-0811`. |
| 9 | Modified By renders a user identifier | Current rows render the automation user's email; the 2026-08-11 GUID observation was superseded by the 2026-08-14 re-verification. |
| 10 | Interactive census inside grid | Confirmed: 0 inputs, 0 selects, 0 links, 0 contenteditable, 0 tabindex, 4 buttons (column headers). Source: `nm3344-histwalkfull-0811`. |
| 11 | No pagination control | Confirmed: 0 aria-page controls, 0 next/prev, 0 page-size selector, 0 load-more. Source: `nm3344-histwalkfull-0811`. |
| 12 | No filter/search control | Confirmed: 0 inputs in grid area, 0 search inputs, 0 date-range pickers. Source: `nm3344-histwalkfull-0811`. |
| 13 | No horizontal scroll | Confirmed: scrollWidth = clientWidth = 1680 px. Source: `nm3344-histwalkfull-0811`. |
| 14 | Per-office row counts | Confirmed: 1604 = 50, 1101 = 32, 1105 = 35. Source: `nm3344-histwalkfull-0811`. |
| 15 | Sorting behaviour | Confirmed NOT sorting — live probe 2026-08-11 on a 76-row populated grid: row 0 unchanged after clicking Service Type header; `aria-sort` null on all headers before and after click. |
| 16 | After-save row in History | Confirmed — live probe 2026-08-11: editing APP Downloaded 0.00→1.00 and saving added a new History row at position 0: `APP Downloaded | 1.00 % | s-prd-clickauto@psav.com | 08/11/2026 10:16:29 AM`. |

---

## TC-SVC-HIS-001: History tab activates correctly and shows the right heading and columns

**Automatable**: Yes
**Preconditions**: The Service Charge settings page is open for office 1604 with the Basic Information tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Service Charge settings page for office 1604 | The page loads; the Basic Information tab trigger has `aria-selected="true"` and the History tab trigger has `aria-selected="false"`. |
| 2 | Click the **Service Charge History** tab | The History tab trigger transitions to `aria-selected="true"`; the Basic Information tab trigger transitions to `aria-selected="false"`. |
| 3 | Read the page `<h1>` text | The heading reads `Service Charge` (same on both tabs; office context is not in the h1). |
| 4 | Read the History section header | The header reads `Service Charge History : Parker Palm Springs` — office name is present. |
| 5 | Read the four column header texts in order | The headers are `Service Type`, `Service Charge Percentage`, `Modified By`, `Modified On` — verbatim, in that order. |

**Expected**: The History tab activates via `aria-selected`; the `<h1>` reads `Service Charge`; the History section header includes the office name; all four column headers are present in the correct order.

The History section header renders `Service Charge History : Parker Palm Springs` — verified live 2026-08-14. Whether the page `<h1>` was ever meant to carry the office name is not settled by available evidence.

**Evidence**: `nm3344-histwalkfull-0811` column-headers array; `aria-selected` observed on tab triggers; live walk 2026-08-14 confirms section header `Service Charge History : Parker Palm Springs`.

**Surface_Family**: render-state (QUICK)

---

## TC-SVC-HIS-002: Grid populates with data rows after the History tab loads

**Automatable**: Yes
**Preconditions**: The Service Charge History tab is active for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Wait for any loading skeleton elements (`[data-slot="skeleton"]`) inside the grid to disappear | The skeletons are gone; actual table rows are visible. |
| 2 | Count the visible data rows | At least one row is present. (Office 1604 had 50 rows at last verification; the exact count may change as data changes, so the assertion is ≥ 1.) |

**Expected**: The grid is non-empty for an office with history records; rows are visible once loading completes.

**Evidence**: `nm3344-histwalk2-0811` — `populatedWithinTimeout: true`, `finalRowCount: 50`, `stillEmptyAt90s: false`.

**Surface_Family**: empty-vol (QUICK)

---

## TC-SVC-HIS-003: Every visible row has four non-empty cells

**Automatable**: Yes
**Preconditions**: The History grid for office 1604 is fully loaded (no skeletons).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Sample the first ten rows of the grid | Each row has exactly four cells. |
| 2 | For each sampled row, read all four cell texts | No cell is empty; each cell contains a non-whitespace string. |

**Expected**: Every data row contains text in all four columns — no blank cells in Service Type, Service Charge Percentage, Modified By, or Modified On.

**Evidence**: `nm3344-histwalk2-0811` first-ten-rows — all cells non-empty across all ten rows.

**Surface_Family**: render-state (QUICK)

---

## TC-SVC-HIS-004: Service Charge Percentage cells render in `24.00 %` format

**Automatable**: Yes
**Preconditions**: The History grid for office 1604 is fully loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Service Charge Percentage cell text for the first row | The text matches the pattern `\d+\.\d{2} %` — a number with exactly two decimal places, one space, and a `%` sign. |
| 2 | Repeat for at least two additional rows | All sampled cells match the same pattern. |

**Expected**: The percentage format is `24.00 %` style — two decimals, space before `%`. Neither `24%` nor `24.00%` (no space) is acceptable.

**Evidence**: `nm3344-histwalk2-0811` — all ten sampled rows show `24.00 %`.

**Surface_Family**: render-state (QUICK)

---

## TC-SVC-HIS-005: Modified On cells render in `MM/DD/YYYY hh:mm:ss AM|PM` format

**Automatable**: Yes
**Preconditions**: The History grid for office 1604 is fully loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Modified On cell text for the first row | The text matches the pattern `MM/DD/YYYY hh:mm:ss AM` or `MM/DD/YYYY hh:mm:ss PM` — month/day/year, then 12-hour time with seconds and meridiem suffix. |
| 2 | Confirm the year, month, and day fields are two or four digits each as expected | Format is consistent: e.g. `01/12/2023 09:19:51 AM`. |

**Expected**: Every Modified On cell shows a 12-hour datetime with seconds and `AM`/`PM` suffix; no timezone label; no 24-hour clock.

**Evidence**: `nm3344-histwalk2-0811` row 1: `01/12/2023 09:19:51 AM`; rows 3–10: `08/12/2017 06:56:13 PM` / `08/12/2017 06:56:12 PM`.

**Surface_Family**: render-state (QUICK)

---

## TC-SVC-HIS-006: Grid default sort is Modified On descending (newest record first)

**Automatable**: Yes
**Preconditions**: The History grid for office 1604 is fully loaded with no user interaction on column headers.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Modified On value of the first row | The date is later than the Modified On value of the second row. |
| 2 | Read the Modified On value of the second row | The date is later than or equal to the Modified On value of the third row. |
| 3 | Confirm overall ordering across the first ten rows | Modified On values are in non-ascending order — newer entries appear above older ones. |

**Expected**: On initial load, the grid is sorted by Modified On descending — the most recently modified record is at the top.

**Evidence**: `nm3344-histwalk2-0811` — row 1: `01/12/2023`; row 2: `11/14/2021`; rows 3–9: `08/12/2017 06:56:13 PM`; row 10: `08/12/2017 06:56:12 PM`. Descending order confirmed.

**Surface_Family**: sorting (QUICK)

---

## TC-SVC-HIS-007: Grid is read-only — no interactive elements inside

**Automatable**: Yes
**Preconditions**: The History grid for office 1604 is fully loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Run the full interactive-controls census on the History tab panel | All eight census counters are zero: filterInputCount, searchInputCount, dateRangePickerCount, paginationAriaLabelCount, roleNavigationCount, nextPrevButtonCount, pageSizeSelectorCount, loadMoreCount. |

**Expected**: The History grid exposes no interactive UI of any kind — no filter, search, date-range, or pagination controls. TC-SVC-HIS-008 and TC-SVC-HIS-009 each re-confirm specific subsets of this census.

**Evidence**: `nm3344-histwalkfull-0811` interactive census: all input, select, pagination, and filter counts are zero.

**Surface_Family**: render-state (QUICK)

---

## TC-SVC-HIS-008: No pagination control is present on the History tab

**Automatable**: Yes
**Preconditions**: The History grid for office 1604 is fully loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Query for any element with `aria-label` containing "page", any element with `role="navigation"`, any next/previous page buttons, and any page-size selector | All queries return zero elements. |
| 2 | Confirm all rows load in a single viewport (no load-more trigger) | No `load-more` button or infinite-scroll sentinel is present. |

**Expected**: The History grid has no pagination — all rows are rendered without paging controls.

**Evidence**: `nm3344-histwalkfull-0811` pagination census: all counts zero (`aria_label_page: 0`, `role_navigation: 0`, `digit_buttons: []`, `next_prev_buttons: 0`, `page_size_selector: 0`, `load_more: 0`).

**Surface_Family**: pagination (QUICK)

---

## TC-SVC-HIS-009: No filter, search, or date-range control is present on the History tab

**Automatable**: Yes
**Preconditions**: The History tab is active for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Query for any `input` inside the grid area | Zero inputs found. |
| 2 | Query for any global search input or date-range picker on the History tab panel | Zero elements found. |

**Expected**: The History tab has no filter, search, or date-range control; the grid cannot be filtered by the user.

**Evidence**: `nm3344-histwalkfull-0811` filter census: `input_count_in_grid_area: 0`, `search_input_global: 0`, `date_range_picker: 0`.

**Surface_Family**: render-state (QUICK)

---

## TC-SVC-HIS-010: Modified By cells render a user identifier, not a raw GUID

**Automatable**: Yes
**Preconditions**: The History grid for office 1604 is fully loaded.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Modified By cell text for the first row | The text identifies the user who made the change — a display name, username, or human-readable identifier. |
| 2 | Confirm the value is not a raw UUID string | The cell value does not match the pattern `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`. |

**Expected**: Modified By identifies the user who made the change — a display name, username, or human-readable identifier, not an opaque system GUID.

**Evidence**: Current rows render the automation user's email address, e.g. `s-prd-clickauto@psav.com`, re-verified 2026-08-14.

**Surface_Family**: render-state (QUICK)

---

## TC-SVC-HIS-011: History data is scoped per office — different offices show different row sets

**Automatable**: Yes
**Preconditions**: The automation account can navigate to the Service Charge History tab for offices 1604, 1101, and 1105. Office switches use the History-only navigation path (does not require Basic Information inputs to be editable).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Load the History tab for office 1604 and count the rows | Office 1604 shows its own set of history rows (50 observed at last verification). |
| 2 | Navigate to office 1101 using the History-only path and load the History tab, then count the rows | Office 1101 shows a different row count from office 1604 (32 observed at last verification). |
| 3 | Navigate to office 1105 using the History-only path and load the History tab, then count the rows | Office 1105 shows a different row count from both (35 observed at last verification). |
| 4 | Confirm that the three row counts are not all identical | At least two offices must have different row counts, proving History is isolated per office. |

**Expected**: History records are isolated per office; switching offices changes the row count and record content.

**Implementation note**: Office switches use `gotoHistory()` instead of `goto()` because this test never needs editable Basic Information inputs. Using `goto()` here caused a deterministic 60 s timeout failure (confirmed 2-of-2 on 2026-08-11) because the BI inputs stayed disabled on the second and third office — the wrong readiness gate for a History-only test.

**Evidence**: `nm3344-histwalkfull-0811` — `s4_office_1101.rowCount: 32`, `s4_office_1105.rowCount: 35`; first rows differ (`HSIA Services` / `Loss Damage Waiver` vs `Lighting` for 1604).

**Surface_Family**: result-fidelity (QUICK)

---

## TC-SVC-HIS-012: Sorting the History grid by Modified On via the column header dropdown reorders rows

**Automatable**: Yes
**Preconditions**: The History grid for office 1604 is fully loaded (at least 2 rows).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the **Modified On** column header to open its dropdown | A menu appears with "Sort ascending", "Sort descending", and "Hide column" items |
| 2 | Click **Sort ascending** and wait for the grid to re-render | Row 0 now shows the oldest record |
| 3 | Assert that row 0's Modified On date equals the minimum date of all visible rows | Ascending row 0 carries the minimum visible date |
| 4 | Click the **Modified On** column header again and click **Sort descending** | Row 0 now shows the most recent record |
| 5 | Assert that descending row 0 differs from ascending row 0 | The two row 0 values are not equal, proving the grid reordered |

**Expected**: All four History column headers open a dropdown carrying Sort ascending, Sort descending, and Hide column. Sorting by Modified On ascending puts the oldest record first; descending reverses it. The grid never sets an `aria-sort` attribute — sorting is driven entirely through the dropdown.

**Evidence**: Live walk 2026-08-16 on a 347-row populated grid (office 1604). Modified On ascending: row 0 = `06/09/2016` (oldest record). Modified On descending: row 0 differs from ascending row 0. All four headers confirmed to open the three-item dropdown. `aria-sort` is null on all headers before and after sort.

**Surface_Family**: sorting (QUICK)

---

## TC-SVC-HIS-013: A Basic Information save adds a new row to Service Charge History

**Automatable**: Yes
**Preconditions**: The Service Charge page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Switch to the History tab and record the current row count | Baseline count captured |
| 2 | Switch to Basic Information, read the current APP Downloaded percentage, then edit it to `1.00` | Save becomes enabled |
| 3 | Click Save | Save completes; page reloads with the new value |
| 4 | Switch to the Service Charge History tab and wait for the grid to load | Grid is visible |
| 5 | Confirm a new row appeared at the top with: Service Type = `APP Downloaded`, Percentage = `1.00 %`, Modified By = `s-prd-clickauto@psav.com`, Modified On = today's date | New row reflects the saved change; Modified By shows the automation user's email address |
| 6 | Restore: switch to Basic Information, revert the field to its original value, and save | Field restored; History gets one more row from the restore save |

**Expected**: After a Basic Information save, a new audit row appears at the top of the History grid. Modified By shows the automation account's email address (not a GUID) for rows created by the current automation user.

**Evidence**: Live probe 2026-08-11 — save on APP Downloaded (row 0) from 0.00 to 1.00; new History row appeared: `APP Downloaded | 1.00 % | s-prd-clickauto@psav.com | 08/11/2026 10:16:29 AM`.

**Surface_Family**: result-fidelity (QUICK)

---

## TC-SVC-HIS-014: Navigating to History tab with unsaved Basic Information edits triggers an Unsaved Changes modal

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: The Service Charge settings page is open for office 1604 with the Basic Information tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit any Service Charge Percentage value on the Basic Information tab without saving | The field shows an unsaved value; the Save button is enabled. |
| 2 | Click the **Service Charge History** tab without saving | An "Unsaved changes" modal appears with **Stay** and **Discard** buttons. The application does not navigate to the History tab without user confirmation. |

**Expected**: Navigating from Basic Information to the History tab with unsaved edits triggers an "Unsaved changes" modal with body "Are you sure you want to leave this view? Any unsaved changes will be lost." and buttons Stay / Discard.

The modal now appears on tab switch — verified 2026-08-14 (`reports/rca-nm3344-0814/seatB/walk-log.jsonl:117`).

**Evidence**: Live walk 2026-08-14: alertdialog text "Unsaved changes / Are you sure you want to leave this view? Any unsaved changes will be lost. / Stay / Discard".

---

## TC-SVC-HIS-015: Office context is preserved when switching from Basic Information to History tab

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: The Service Charge settings page is open for office 1604 (Parker Palm Springs) with the Basic Information tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Confirm the currently selected office is office 1604 | The office context shows 1604 / Parker Palm Springs. |
| 2 | Click the **Service Charge History** tab | The History tab activates without triggering a full page reload. |
| 3 | Confirm the office context after the tab switch | The same office (1604 / Parker Palm Springs) is still selected; the History grid shows the 1604 row set (≥ 1 row, consistent with the per-office row count observed for 1604). |

**Expected**: Switching from Basic Information to the History tab preserves the current office context; the Basic Information tab shows "Local Office : 1604 - Parker Palm Springs" before the switch, and the History section header shows "Service Charge History : Parker Palm Springs" after the switch; the History grid displays records for office 1604.

The History section header renders `Service Charge History : Parker Palm Springs` — verified live 2026-08-14.

**Evidence**: NM-2210 AC6 / AC9; live walk 2026-08-14 confirms both elements carry the office name.

---

## Deferred to DEEP

The following items were deferred in earlier drafts but are now resolved at QUICK:
- Column headers and count — **covered** (TC-SVC-HIS-001)
- Grid populates — **covered** (TC-SVC-HIS-002)
- Row-level cell content — **covered** (TC-SVC-HIS-003)
- Percentage format — **covered** (TC-SVC-HIS-004)
- Date format — **covered** (TC-SVC-HIS-005)
- Default sort — **covered** (TC-SVC-HIS-006)
- Read-only grid — **covered** (TC-SVC-HIS-007)
- No pagination — **covered** (TC-SVC-HIS-008)
- No filter/search — **covered** (TC-SVC-HIS-009)
- Modified By identifier format — covered (TC-SVC-HIS-010)
- Per-office isolation — **covered** (TC-SVC-HIS-011)

The following remain deferred to DEEP (genuinely require deep coverage):

- `deferred-to-DEEP: sort exhaustive — asc/desc toggle per column, sort-by-type (numeric vs lexical for Percentage), sort persists across navigation` (QUICK blocked: TC-SVC-HIS-012)
- `deferred-to-DEEP: volume — History grid with a very large number of audit rows (virtualization integrity, off-screen rows readable by content anchor)`
- `deferred-to-DEEP: cross-tab dirty-state — switching from Basic Information to History with unsaved edits on Basic Information preserves dirty state or prompts correctly`
- `deferred-to-DEEP: error state on history load failure — NM-2210 AC8 requires an error state or message when history loading fails; no way to force an API failure in a test today`
