# Local Office Settings — Location Settings History Test Cases — **Module**: local-office | **Total**: 7 | **Status**: Automated

**Module**: local-office

**URL**: `/navigator/locations/{officeId}/settings/local-office` (Location Settings History tab)
**Spec**: `specs/local-office/local-office-history.spec.ts`
**Location tested**: 1604 (Parker Palm Springs, USA)
**Updated**: 
**Scope**: Location Settings History tab only — 7 TCs (TC-LOS-HIS-*)
**Selector file**: `src/selectors/locations/local-office-settings.ts`
**Sibling test cases**: [BAS](local_office_settings_test_cases.md) · [ECT](local_office_ect_test_cases.md)

**Split note**: This file was split from the combined `local_office_settings_test_cases.md` to match the 1:1 spec→md convention used by the locations module (the underlying spec breakdown landed in commit f721e15,). Sibling files: [HIS](local_office_history_test_cases.md), [ECT](local_office_ect_test_cases.md). All TC IDs and `Depends_On` fields preserved verbatim.

---

## FIELD INVENTORY — Location Settings History Tab

| Field | Type | Default (1604) | State | data-testid |
|---|---|---|---|---|
| History Type Selector | dropdown | Location Management History | enabled; 2 options | `local-office-settings-history-select-type` |
| History Table | table | "No results." (empty) | read-only | `local-office-settings-history-table` |
| Rows Per Page | dropdown | 20 | enabled | (no data-testid — pagination control) |
| First/Prev/Next/Last Page | buttons | all disabled (1 page) | disabled when empty | (no data-testid — pagination nav) |

**History Type Options**: Location Management History, Location Management Legacy History

**Column Headers (42 total)**: Local Office, Prep Date Offset, Return Date Offset, Set Date Offset, Strike Date Offset, Pickup Date Offset, Delivery Date Offset, Use Fulfillment, Use Availability, Use Equipment QC, Print Desc, Use Subrent, Phone1, Phone2, Use Sect., Section Name, Sect. Action, Logo Name, Use On Quote, Use On Rental, Service Type - Exempt, ST Action, Action, Notes, Marriott PMS Account Enabled, Default Job to 1 day for Event Orders, Default Job to 1 day for Outside Orders, Default Job to 1 day for Internal Orders, Default Labor to Hourly, Allow tentative and confirmed Status to have the same priority, Items Filled from Requests Return to Availability, Default Order Type, Regular Hours, Regular Hours Multiplier, Over Time Hours, OverTime Hours Multiplier, Double Time Hours, DoubleTime Hours Multiplier, Holiday Multiplier, Recalc Labor Hours, Modified By, Modified On

**Sortable Columns**: All except Local Office, Section Name, Service Type - Exempt, Notes (those have plain text, no sort button)

-----

## Validation Rules

N/A — this tab is read-only; the walk recorded no editable control and no Save button.

---

## MCP_VERIFICATION_LOG

Observed on office 1604 (Parker Palm Springs) during the live DOM walk recorded in
`walk-evidence-hist-ssl-acc-2026-06-02.md` (2026-06-02, Playwright CLI, session `-s=e2e`). Section
0.5c (read-only structure) is the source. Each row is an observation, not an expectation. Rows
marked "Not settled" were reached for and not resolved.

| # | Verified | Result |
|---|---|---|
| 1 | `[data-testid="local-office-settings-history-table"]` element tag | `TABLE` — the table itself, not a wrapper div (differs from MGH which uses a wrapper div) |
| 2 | Inputs inside `tblHistory` (the `<table>` element directly) | **0** — no interactive inputs inside the table |
| 3 | Panel-wide input count (what `isHistoryTabReadOnly()` measured at walk time) | 1 — the `aria-label="Current page number"` paginator input |
| 4 | Paginator input location relative to `tblHistory` | **Outside** the `<table>` (sibling element, not a descendant) |
| 5 | Save button present in the tab panel | **0** — no Save button anywhere in the panel |
| 6 | Data rows visible on page 1 | 20 |

---
## TC-LOS-HIS-001: History Tab — Navigation and Default View

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: none (baseline-enforcement per LR-019)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Local Office Settings page. | The Local Office Settings page loads and tabs are visible. |
| 2 | Click **Location Settings History** tab -> Tab becomes selected (`aria-selected="true"`) | The Location Settings History tab is active. |
| 3 | Verify **History Type Selector** dropdown is visible with default value "Location Management History" -> dropdown displayed | The History Type Selector dropdown is visible and displays "Location Management History". |
| 4 | Verify history table container is visible -> Table with column headers and data/empty state | The history table container is visible with column headers and a data or empty-state body. |

**Expected**: Clicking the History tab shows the history-type dropdown and the data table
**Automatable**: Yes

---

## TC-LOS-HIS-002: History Tab — Column Headers

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to History tab -> Tab panel visible | The Location Settings History tab panel is visible. |
| 2 | Verify the table shows the full set of column headers -> All headers present | The table header row shows all 42 expected column headers. |
| 3 | Verify first columns: **Local Office**, **Prep Date Offset**, **Return Date Offset**, **Set Date Offset**, **Strike Date Offset** -> Present in order | The first five columns read "Local Office", "Prep Date Offset", "Return Date Offset", "Set Date Offset", and "Strike Date Offset" in order. |
| 4 | Verify last columns: **Holiday Multiplier**, **Recalc Labor Hours**, **Modified By**, **Modified On** -> Present in order | The last four columns read "Holiday Multiplier", "Recalc Labor Hours", "Modified By", and "Modified On" in order. |

**Expected**: The history table shows the full set of expected column headers
**Automatable**: Yes

---

## TC-LOS-HIS-003: History Tab — Table Populated for Office 1604

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to History tab -> Table visible | The Location Settings History tab panel is visible and the table is displayed. |
| 2 | Verify table body contains at least one data row (not "No results.") -> Populated state | The table body contains at least one data row and no "No results." message is shown. |

**Expected**: Office 1604 has at least one history record, so the table is not empty
**Automatable**: Yes


---

## TC-LOS-HIS-004: History Tab — History Type Selector Options

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to History tab -> History Type Selector visible | The Location Settings History tab is active and the History Type Selector dropdown is visible. |
| 2 | Click **History Type Selector** dropdown to open dropdown -> Dropdown options visible | The History Type Selector dropdown opens and its options are visible. |
| 3 | Verify exactly 2 options: **Location Management History** (selected), **Location Management Legacy History** -> Both present | The dropdown shows exactly two options: "Location Management History" (currently selected) and "Location Management Legacy History". |
| 4 | Close dropdown without selecting -> Original selection maintained | The dropdown closes and the dropdown still displays "Location Management History". |

**Expected**: The history-type dropdown has 2 options; the default is "Location Management History"
**Automatable**: Yes

---

## TC-LOS-HIS-005: History Tab — Pagination Controls

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to History tab -> Pagination area visible below table | The Location Settings History tab is active and the pagination area is visible below the table. |
| 2 | Verify **Rows Per Page** dropdown shows "20" -> Default page size | The Rows Per Page dropdown displays "20". |
| 3 | Verify page indicator text "1 / 1" -> Current page and total pages | The page indicator reads "1 / 1". |
| 4 | Verify 4 navigation buttons: **Go to first page**, **Go to previous page**, **Go to next page**, **Go to last page** -> All present | All four navigation buttons are present: "Go to first page", "Go to previous page", "Go to next page", and "Go to last page". |

**Expected**: The pagination area shows a "Rows Per Page" selector defaulting to 20, a page indicator, and all four navigation buttons (first, previous, next, last page)
**Automatable**: Yes

---

## TC-LOS-HIS-006: History Tab — No Save Button (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to History tab -> Tab panel visible | The Location Settings History tab panel is visible. |
| 2 | Verify no **Save** button exists on this tab -> No save button in tab content | No Save button is present anywhere in the Location Settings History tab content. |
| 3 | Verify no editable fields (textboxes, checkboxes) exist -> Tab is read-only audit log | No textboxes, checkboxes, or other editable fields are present in the tab content. |

**Expected**: History tab is read-only; no Save button or editable fields
**Automatable**: Yes

---

## TC-LOS-HIS-007: History Tab — Column Sorting Buttons

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to History tab -> Table with column headers visible | The Location Settings History tab is active and the table with column headers is visible. |
| 2 | Verify sortable columns have sort buttons (e.g., **Prep Date Offset**, **Modified By**, **Modified On**) -> Button elements inside columnheaders | The "Prep Date Offset", "Modified By", and "Modified On" column headers each contain a sort button. |
| 3 | Verify non-sortable columns (**Local Office**, **Section Name**, **Service Type - Exempt**, **Notes**) have plain text, no sort button -> No button child | The "Local Office", "Section Name", "Service Type - Exempt", and "Notes" column headers contain only plain text with no sort button. |
| 4 | Click a sort button (e.g., **Modified On**) -> Sort icon changes direction (ascending/descending indicator) | After clicking the "Modified On" sort button, the sort indicator on that column header changes direction. |

**Expected**: Most columns have sort buttons; a few columns are plain text (not sortable).
**Automatable**: Yes

