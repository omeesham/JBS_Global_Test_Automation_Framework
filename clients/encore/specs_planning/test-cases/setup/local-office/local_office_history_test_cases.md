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
| History Type Selector | combobox | Location Management History | enabled; 2 options | `local-office-settings-history-select-type` |
| History Table | table | "No results." (empty) | read-only | `local-office-settings-history-table` |
| Rows Per Page | combobox | 20 | enabled | (no data-testid — pagination control) |
| First/Prev/Next/Last Page | buttons | all disabled (1 page) | disabled when empty | (no data-testid — pagination nav) |

**History Type Options**: Location Management History, Location Management Legacy History

**Column Headers (42 total)**: Local Office, Prep Date Offset, Return Date Offset, Set Date Offset, Strike Date Offset, Pickup Date Offset, Delivery Date Offset, Use Fulfillment, Use Availability, Use Equipment QC, Print Desc, Use Subrent, Phone1, Phone2, Use Sect., Section Name, Sect. Action, Logo Name, Use On Quote, Use On Rental, Service Type - Exempt, ST Action, Action, Notes, Marriott PMS Account Enabled, Default Job to 1 day for Event Orders, Default Job to 1 day for Outside Orders, Default Job to 1 day for Internal Orders, Default Labor to Hourly, Allow tentative and confirmed Status to have the same priority, Items Filled from Requests Return to Availability, Default Order Type, Regular Hours, Regular Hours Multiplier, Over Time Hours, OverTime Hours Multiplier, Double Time Hours, DoubleTime Hours Multiplier, Holiday Multiplier, Recalc Labor Hours, Modified By, Modified On

**Sortable Columns**: All except Local Office, Section Name, Service Type - Exempt, Notes (those have plain text, no sort button)

-----

## TC-LOS-HIS-001: History Tab — Navigation and Default View

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: none (baseline-enforcement per LR-019)
**Steps**:
1. Open the Local Office Settings page.
2. Click **Location Settings History** tab -> Tab becomes selected (`aria-selected="true"`)
3. Verify **History Type Selector** combobox is visible with default value "Location Management History" -> Combobox displayed
4. Verify history table container is visible -> Table with column headers and data/empty state

**Expected**: Clicking the History tab shows the history-type dropdown and the data table
**Automatable**: Yes

---

## TC-LOS-HIS-002: History Tab — Column Headers

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
1. Navigate to History tab -> Tab panel visible
2. Verify the table shows the full set of column headers -> All headers present
3. Verify first columns: **Local Office**, **Prep Date Offset**, **Return Date Offset**, **Set Date Offset**, **Strike Date Offset** -> Present in order
4. Verify last columns: **Holiday Multiplier**, **Recalc Labor Hours**, **Modified By**, **Modified On** -> Present in order

**Expected**: The history table shows the full set of expected column headers
**Automatable**: Yes

---

## TC-LOS-HIS-003: History Tab — Table Populated for Office 1604

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
1. Navigate to History tab -> Table visible
2. Verify table body contains at least one data row (not "No results.") -> Populated state

**Expected**: Office 1604 has at least one history record, so the table is not empty
**Automatable**: Yes


---

## TC-LOS-HIS-004: History Tab — History Type Selector Options

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
1. Navigate to History tab -> History Type Selector visible
2. Click **History Type Selector** combobox to open dropdown -> Dropdown options visible
3. Verify exactly 2 options: **Location Management History** (selected), **Location Management Legacy History** -> Both present
4. Close dropdown without selecting -> Original selection maintained

**Expected**: The history-type dropdown has 2 options; the default is "Location Management History"
**Automatable**: Yes

---

## TC-LOS-HIS-005: History Tab — Pagination Controls

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
1. Navigate to History tab -> Pagination area visible below table
2. Verify **Rows Per Page** combobox shows "20" -> Default page size
3. Verify page indicator text "1 / 1" -> Current page and total pages
4. Verify 4 navigation buttons: **Go to first page**, **Go to previous page**, **Go to next page**, **Go to last page** -> All present

**Expected**: The pagination area shows a "Rows Per Page" selector defaulting to 20, a page indicator, and all four navigation buttons (first, previous, next, last page)
**Automatable**: Yes

---

## TC-LOS-HIS-006: History Tab — No Save Button (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
1. Navigate to History tab -> Tab panel visible
2. Verify no **Save** button exists on this tab -> No save button in tab content
3. Verify no editable fields (textboxes, checkboxes) exist -> Tab is read-only audit log

**Expected**: History tab is read-only; no Save button or editable fields
**Automatable**: Yes

---

## TC-LOS-HIS-007: History Tab — Column Sorting Buttons

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-HIS-001
**Steps**:
1. Navigate to History tab -> Table with column headers visible
2. Verify sortable columns have sort buttons (e.g., **Prep Date Offset**, **Modified By**, **Modified On**) -> Button elements inside columnheaders
3. Verify non-sortable columns (**Local Office**, **Section Name**, **Service Type - Exempt**, **Notes**) have plain text, no sort button -> No button child
4. Click a sort button (e.g., **Modified On**) -> Sort icon changes direction (ascending/descending indicator)

**Expected**: Most columns have sort buttons; a few columns are plain text (not sortable).
**Automatable**: Yes

