# Location Management History Test Cases — **Module**: locations | **Total**: 25 | **Status**: Manual

**Module**: locations
**Updated**: | **Live Verified**: Location 1604, Navigator Training

---

## FIELD INVENTORY
*Read-only DataTable — no editable fields. 87 column headers confirmed live.*

| # | Column Header | Sortable | Live Notes |
|---|---|---|---|
| 1 | Local Office | No | |
| 2 | Local Office Name | No | |
| 3 | Active | No | ✔ checkmark display |
| 4 | Live Date | Yes | date formatted |
| 5 | Country | Yes | |
| 6 | Currency | Yes | |
| 7 | Tax Mode | Yes | |
| 8 | Region | Yes | |
| 9 | Servicing Branch Office | Yes | |
| 10 | Pay To Address | Yes | REQ said "Pay To" — live: "Pay To Address" |
| 11 | Union | Yes | |
| 12 | Corporate Pricing | No | |
| 13 | Billing Type | Yes | |
| 14 | Billing Cycle | Yes | |
| 15 | Billing Way | Yes | |
| 16 | Billing Way Active | Yes | REQ said "Billing Way Active Date" — live: "Billing Way Active" |
| 17 | Labor Pricing | Yes | |
| 18 | Equip. Pricing | Yes | |
| 19 | Internal Equip. Pricing | Yes | |
| 20 | Production Labour Pricing | Yes | |
| 21 | Production Equip. Pricing | Yes | |
| 22 | Allow DPCD | No | |
| 23 | Exclude Implied Discount | No | |
| 24 | Prompt For Approval | Yes | |
| 25 | Threshold | Yes | |
| 26 | Apply LDW | No | |
| 27 | LDW Percentage | Yes | |
| 28 | *(untranslated key)* | No | **BUG**: renders raw i18n key `locations.history.CalcDamageWaiverOnNetAmount` |
| 29 | ETS | No | |
| 30 | ETS Percent | Yes | |
| 31 | Service Charge | No | |
| 32 | Show Service Charge As Administrative Fee | No | |
| 33 | Calculate Service Charge On Net Amount | No | |
| 34 | Service Charge Name | Yes | |
| 35 | Apply Cables and Consumables Fee | No | |
| 36 | C&C Percent | Yes | REQ said "C&C Percentage" — live: "C&C Percent" |
| 37 | Calculate CAC on Net Amount | No | |
| 38 | Calculate CAC on Net Amount | Yes | **BUG**: duplicate header — both cols have same name; #38 has sort btn |
| 39 | Allow Ticker Calc | No | |
| 40 | Set/Strike/Support Labor Billing Goal | Yes | |
| 41 | Enable Set/Strike Labor Minutes | No | REQ noted duplicate here — live has distinct column |
| 42 | Apply Set/Strike Labor Minutes | No | |
| 43 | Credit Memo Approval Required | No | |
| 44 | Display Tax | No | |
| 45 | Company Remit Tax / GST/HST / VAT Tax | No | |
| 46 | Remit PST Tax | No | |
| 47 | Comm Receiver | No | |
| 48 | Enable IDC Billing | No | |
| 49 | Skip Billing | No | |
| 50 | Show SubRental | No | |
| 51 | Inventory Only | No | |
| 52 | Intercompany | No | |
| 53 | Calculate Commission Tax | No | |
| 54 | Can Create External Customer Link | No | |
| 55 | Venue/Branch Account Name | Yes | |
| 56 | Venue/Branch Account Phone1 | Yes | |
| 57 | Venue/Branch Account Phone2 | Yes | |
| 58 | Master Bill To Address Name | Yes | |
| 59 | Action of Shared Setup Location | Yes | |
| 60 | Shared Setup Location ID | Yes | |
| 61 | Shared Setup Location Name | Yes | |
| 62 | Include Service Charge in Price Guides | No | |
| 63 | Pricing Strategy | Yes | |
| 64 | Currency *(2nd)* | Yes | duplicate column name; secondary pricing currency |
| 65 | Pricing Action | Yes | |
| 66 | Is Alternate | No | |
| 67 | Use Effective Dates | No | |
| 68 | Start Date | Yes | |
| 69 | End Date | Yes | |
| 70 | Notes | Yes | |
| 71 | Modified By | Yes | |
| 72 | Modified On | Yes | |
| 73 | Oracle Product Code | Yes | |
| 74 | Oracle Department Code | Yes | |
| 75 | Oracle Organization | Yes | |
| 76 | Allow Resort Tax | No | |
| 77 | Resort Tax Percentage | Yes | |
| 78 | Discount Reason | No | |
| 79 | Offsite Event Location | No | |
| 80 | Use eSignature | No | |
| 81 | Separate Master Bill Commission Invoice | No | |
| 82 | Enable Product Group | No | |
| 83 | Allow Production Quote | No | |
| 84 | Enable Job Costing | No | |
| 85 | Enable Discount Guidance | No | |
| 86 | Internet Asset Reservation | No | |
| 87 | Warehouse Billing | No | |

**Pagination Controls**: Rows per page dropdown (default: 20, options: 10/20/30/40/50), Go to first/prev/next/last page buttons, page indicator "N / M"

---

## TC-LOC-MGH-001: Tab Renders and the history table loads
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: none (baseline-enforcement per LR-019)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open location 1604 in Navigator and verify the location detail page loads on the "Basic Information" tab. | The location detail page for office 1604 loads and the Basic Information tab is active. |
| 2 | Click the "Location Management History" tab and verify the tab becomes selected and the Location Management History panel renders. | The Location Management History tab is active and the history panel is visible. |
| 3 | Observe the history table and verify it renders with a header row containing column headers. | The table is visible with a header row showing column names. No loading indicator is present. |

**Expected**: The history table is visible on the screen with all its column names shown in the header row. There should be no loading indicator still showing after the table has finished loading.
**Automatable**: Yes

---

## TC-LOC-MGH-002: All Column Headers Present
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With the "Location Management History" tab active, inspect the table header row and verify the table header row shows the full set of column headers. | The header row is visible and contains all 87 column headers. |
| 2 | Verify the first column header reads "Local Office". | The first column header reads "Local Office". |
| 3 | Verify the last column header (after horizontal scroll) reads "Warehouse Billing". | The rightmost column header reads "Warehouse Billing". |

**Expected**: All column headers are visible across the table in plain English, from "Local Office" to "Warehouse Billing".
**Data**: Column count = 87
**Automatable**: Yes

---

## TC-LOC-MGH-003: Default Rows Per Page Is 20
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With the "Location Management History" tab active, locate the rows per page control at the bottom of the table and verify a dropdown is visible showing a numeric value. | A rows-per-page dropdown is visible at the bottom of the table showing a numeric value. |
| 2 | Read the current value without opening the dropdown and verify it displays "20". | The rows-per-page control displays "20". |

**Expected**: Default rows per page = 20.
**Note**: Earlier documentation listed 10 as the default; the live application shows 20. The live value is authoritative.
**Automatable**: Yes

---

## TC-LOC-MGH-004: Rows Per Page Dropdown Options
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With the "Location Management History" tab active, click the rows per page dropdown and verify it opens showing the available options. | The dropdown opens and lists the available page-size options. |
| 2 | Read all available options and verify they are: 10, 20, 30, 40, 50. | The dropdown shows exactly five options: 10, 20, 30, 40, and 50. |

**Expected**: Dropdown contains exactly 5 options: 10, 20, 30, 40, 50.
**Automatable**: Yes

---

## TC-LOC-MGH-005: Change Rows Per Page Updates Table Display
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: Location with at least 11 history rows is open on **Location Management History** tab; rows per page is currently 20.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the rows per page dropdown and verify the options appear. | The dropdown opens and displays the available page-size options. |
| 2 | Select "10" from the list and verify the dropdown closes and the control shows "10". | The dropdown closes and the rows-per-page control shows "10". |
| 3 | Observe the table body and verify it displays at most 10 rows. | The table body shows no more than 10 data rows and the page indicator updates to reflect the new page count. |

**Expected**: Table limits display to 10 rows. Page indicator updates accordingly (e.g., "1 / N" where N > 1).
**Cleanup**: After test, reset rows per page back to 20.
**Automatable**: Yes

---

## TC-LOC-MGH-006: Pagination Controls Disabled When Only One Page
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: Location 1604 is open on **Location Management History** tab; result is 1 row (1 page).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Observe the "Go to first page" button and verify it is disabled. | The "Go to first page" button is disabled. |
| 2 | Observe the "Go to previous page" button and verify it is disabled. | The "Go to previous page" button is disabled. |
| 3 | Observe the "Go to next page" button and verify it is disabled. | The "Go to next page" button is disabled. |
| 4 | Observe the "Go to last page" button and verify it is disabled. | The "Go to last page" button is disabled. |
| 5 | Observe the page indicator and verify it shows "1 / 1". | The page indicator reads "1 / 1". |

**Expected**: All 4 pagination buttons are disabled when only 1 page of results exists.
**Automatable**: Yes

---

## TC-LOC-MGH-007: Empty State Message for Location with No History
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: A location with no management history change records is open on **Location Management History** tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open a location known to have no history records and verify the location detail page loads. | The location detail page loads successfully. |
| 2 | Click the "Location Management History" tab and verify the tab becomes active and the table renders. | The Location Management History tab is active and the table container is visible. |
| 3 | Observe the table body and verify no data rows are present. | The table body contains no data rows. |
| 4 | Read the empty state message and verify "No results." is displayed inside the table. | The text "No results." is displayed inside the table body. |

**Expected**: The empty-state text "No results." appears in the table body, and there are no data rows. The pagination indicator shows no pages of data.
**Note**: Location 1604 had 1 row at time of live verification. Use a different location with confirmed no history, or check a freshly created location.
**Automatable**: Yes

---

## TC-LOC-MGH-008: Data Row Renders with Correct Values (Location 1604)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: Location 1604 open on **Location Management History** tab; at least 1 row exists.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Inspect row 1 under the "Local Office" column and verify it displays "1604". | The "Local Office" cell in row 1 shows "1604". |
| 2 | Inspect row 1 under "Local Office Name" and verify it displays "Parker Palm Springs". | The "Local Office Name" cell in row 1 shows "Parker Palm Springs". |
| 3 | Inspect row 1 under "Active" and verify it displays a checkmark for the active boolean. | The "Active" cell in row 1 shows a checkmark indicating the location is active. |
| 4 | Inspect row 1 under "Country" and verify it displays "United States". | The "Country" cell in row 1 shows "United States". |
| 5 | Inspect row 1 under "Currency" and verify it displays "USD". | The "Currency" cell in row 1 shows "USD". |
| 6 | Inspect row 1 under "Modified By" and verify it displays a non-empty username value. | The "Modified By" cell in row 1 contains a non-empty username. |
| 7 | Inspect row 1 under "Oracle Product Code" and verify it displays "1604-PAR04". | The "Oracle Product Code" cell in row 1 shows "1604-PAR04". |

**Expected**: All verified cells match expected values. The "Active" column shows a checkmark for the true boolean value.
**Automatable**: Yes

---

## TC-LOC-MGH-009: Sort Ascending on Sortable Column
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: Location with multiple history rows open on **Location Management History** tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Locate the "Modified On" column header and confirm it has a sort button visible. | A sort button is visible inside the "Modified On" column header. |
| 2 | Click the "Modified On" column header and verify the column sorts with an ascending indicator shown in the header. | The "Modified On" column header shows an ascending sort indicator and the rows reorder. |
| 3 | Inspect the first and last visible rows and verify dates are in ascending order with the earliest date first. | The earliest date appears in the first row and the latest date in the last visible row. |

**Expected**: Modified On column sorts ascending. Sort icon updates to indicate ascending order. Row order changes accordingly.
**Automatable**: Yes

---

## TC-LOC-MGH-010: Sort Descending by Toggling Same Column
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: Table is sorted ascending on "Modified On".

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the "Modified On" column header a second time and verify the sort direction toggles. | The sort indicator on the "Modified On" column header changes to descending. |
| 2 | Inspect the first and last visible rows and verify dates are in descending order with the latest date first. | The most recent date appears in the first row and the earliest date in the last visible row. |

**Expected**: Clicking the active sort column again reverses to descending. Sort icon reflects descending state.
**Automatable**: Yes

---

## TC-LOC-MGH-011: Sort by Live Date Column
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: Location with multiple history rows open on **Location Management History** tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Locate the "Live Date" column header and confirm a sort button is present. | A sort button is visible inside the "Live Date" column header. |
| 2 | Click the "Live Date" column header and verify the table sorts by "Live Date" ascending. | The table reorders by Live Date ascending and an ascending sort indicator appears on the column header. |
| 3 | Verify the first row has the earliest Live Date value. | The first row contains the earliest Live Date value in the table. |

**Expected**: Table reorders rows by Live Date ascending. Sort button on Live Date shows active sort indicator.
**Automatable**: Yes

---

## TC-LOC-MGH-012: Non-Sortable Columns Have No Sort Button
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Locate the "Active" column header and verify no sort button or clickable sort icon is present. | The "Active" column header contains only static text with no sort button. |
| 2 | Locate the "Corporate Pricing" column header and verify no sort button is present. | The "Corporate Pricing" column header contains only static text with no sort button. |
| 3 | Locate the "Allow DPCD" column header and verify no sort button is present. | The "Allow DPCD" column header contains only static text with no sort button. |
| 4 | Locate the "Warehouse Billing" column header (last column) and verify no sort button is present. | The "Warehouse Billing" column header contains only static text with no sort button. |

**Expected**: Non-sortable columns have static header text only — no sort button, no sort icon, no click affordance.
**Automatable**: Yes

---

## TC-LOC-MGH-013: A column header shows a placeholder code instead of a readable label
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Bug |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With the "Location Management History" tab active, scroll right to locate the "Calculate LDW on Net Amount" column (after "LDW Percentage") and verify the column header is visible. | The column header after "LDW Percentage" is visible. |
| 2 | Read the column header text and note what is displayed. | The column header displays a raw i18n key ("locations.history.CalcDamageWaiverOnNetAmount") instead of a human-readable label. |

**Expected**: The "Calculate LDW on Net Amount" column is present and displays a human-readable label. The column header should not display a placeholder code instead of a human-readable label.
**Data**: column=Calculate LDW on Net Amount
**Note**: Record as defect for engineering team. Do not mark TC as failed while the issue is unresolved — this TC documents the expected label.
**Automatable**: Yes

---

## TC-LOC-MGH-014: Duplicate "Calculate CAC on Net Amount" Column Headers (Bug)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Bug |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Scroll the table to find the two adjacent "Calculate CAC on Net Amount" columns (after "Apply Cables and Consumables Fee" and "C&C Percent") and verify both adjacent column headers are visible. | Both adjacent column headers are visible after "C&C Percent". |
| 2 | Read both column header labels and verify both read "Calculate CAC on Net Amount". | Both adjacent column headers display the text "Calculate CAC on Net Amount". |
| 3 | Verify sort availability: the first "Calculate CAC on Net Amount" column has no sort button, and the second "Calculate CAC on Net Amount" column has a sort button. | The first instance has no sort button; the second instance has a sort button. |

**Expected**: Both adjacent "Calculate CAC on Net Amount" columns share the same header label. The one without a sort button is the non-sortable instance; the one with a sort button is the sortable instance. Headers should be distinct — two columns sharing the same label is an application issue.
**Data**: first instance=Calculate CAC on Net Amount (non-sortable) | second instance=Calculate CAC on Net Amount (sortable)
**Automatable**: Yes

---

## TC-LOC-MGH-015: Read-Only — No Add/Edit/Delete Controls Present
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With the "Location Management History" tab active, inspect the area above and below the table and verify no "Add" or "New" button is present. | No "Add" or "New" button is present anywhere in the Location Management History panel. |
| 2 | Inspect each visible data row and verify no "Edit" or "Delete" button or icon exists on any row. | No row contains an "Edit" or "Delete" button or icon. |
| 3 | Inspect the tab panel and verify no form inputs and no Save button exist within the Location Management History panel. | The Location Management History panel contains no form inputs and no Save button. |

**Expected**: Zero Add, Edit, Delete, or Save controls are present in the Location Management History panel. The tab is entirely read-only.
**Automatable**: Yes

---

## TC-LOC-MGH-016: Read-Only — Table Cells Are Not Interactive
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: Location 1604 open on **Location Management History** tab; at least 1 data row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click on any cell value in the data row (for example, the "Local Office Name" cell) and verify no text input, dropdown, or editor appears. | No text input, dropdown, or editor appears after clicking the cell. |
| 2 | Attempt to double-click the cell and verify no edit mode activates. | Double-clicking the cell does not activate any edit mode. |
| 3 | Observe the cursor and focus behavior and verify the cell shows the default pointer with no input affordance. | The cursor is the default pointer and no input affordance is shown. |

**Expected**: Cells are non-interactive. Clicks do not trigger editing. No form controls appear.
**Automatable**: Yes

---

## TC-LOC-MGH-017: Horizontal Scroll Works for Wide Table
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With the "Location Management History" tab active, observe the initial table view and verify only the first several columns are visible without scrolling because the table is wider than the viewport. | Only the first several columns are visible; the table extends beyond the viewport width. |
| 2 | Scroll right inside the table container and verify the table scrolls horizontally with additional column headers becoming visible. | The table scrolls horizontally and previously hidden column headers become visible. |
| 3 | Continue scrolling to the rightmost column and verify the "Warehouse Billing" column is the rightmost column and is reachable. | Scrolling to the far right reveals the "Warehouse Billing" column as the last column. |

**Expected**: Table scrolls horizontally. All columns are accessible via horizontal scroll. Column headers stay sticky (if applicable) or scroll with data.
**Automatable**: Yes

---

## TC-LOC-MGH-018: History Data Loads When the Tab Is Opened
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open location 1604 on the "Basic Information" tab and verify the page loads. | The location 1604 detail page loads with the Basic Information tab active. |
| 2 | Click the "Location Management History" tab and verify the tab becomes active. | The Location Management History tab is active. |
| 3 | Observe the history table and verify the history data is displayed in the table. | The history table shows data rows with no loading indicator present. |

**Expected**: Opening the tab loads the location's corporate history once, and the history data is displayed successfully.
**Automatable**: Yes

---

## TC-LOC-MGH-019: Pagination Navigation Enables with Multiple Pages
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: A location with more than 20 history rows is open on **Location Management History** tab; rows per page = 20.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Observe the page indicator and verify it shows "1 / N" where N is greater than 1. | The page indicator reads "1 / N" where N is greater than 1. |
| 2 | Observe the "Go to first page" and "Go to previous page" buttons and verify both are disabled because you are already on page 1. | Both the "Go to first page" and "Go to previous page" buttons are disabled. |
| 3 | Observe the "Go to next page" and "Go to last page" buttons and verify both are enabled. | Both the "Go to next page" and "Go to last page" buttons are enabled. |
| 4 | Click "Go to next page" and verify the table shows rows for page 2 with the page indicator showing "2 / N". | The table updates to show page 2 rows and the page indicator reads "2 / N". |
| 5 | Click "Go to previous page" and verify the table returns to page 1 with the indicator showing "1 / N". | The table returns to page 1 rows and the page indicator reads "1 / N". |
| 6 | Click "Go to last page" and verify the table jumps to the final page, the indicator shows "N / N", and "Go to next page" and "Go to last page" become disabled. | The table shows the last page, the page indicator reads "N / N", and the "Go to next page" and "Go to last page" buttons are disabled. |
| 7 | Click "Go to first page" and verify the page returns to page 1 with the indicator showing "1 / N". | The table returns to page 1 and the page indicator reads "1 / N". |

**Expected**: Pagination navigation works correctly. Forward/back buttons enable/disable based on current page position. Page indicator always reflects current position accurately.

**Automatable**: Yes

---

## TC-LOC-MGH-020: Verify saving a note records it in Location Management History
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Persistence |

**Depends_On**: none
**Preconditions**: Office 1604 is open; the Notes tab starts from an empty baseline and the Location Management History tab is reachable.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Notes" tab and confirm the empty baseline with no saved notes present. | The Notes tab is active and no saved notes are present. |
| 2 | Enter the note text "hello" in the first note row and verify the text is accepted. | The text "hello" is entered and visible in the first note row. |
| 3 | Click "Save" and confirm the dialog, then verify the save completes. | The dialog is dismissed, the save completes, and the note remains visible. |
| 4 | Open the "Location Management History" tab and sort by "Modified On", newest first, so the most recent rows appear at the top. | The Location Management History tab is active and rows are sorted by Modified On descending. |
| 5 | Locate the most recent history row whose Notes column matches the saved note and verify a matching row is found. | A history row is present whose Notes column contains "hello". |

**Expected**: Saving a note on the Notes tab creates a new Location Management History row; its Notes column shows the saved note text.
**Data**: office=1604 | note text = "hello"
**Automatable**: Yes

---

## TC-LOC-MGH-021: Verify a 4000-character note records in Location Management History
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Boundary |

**Depends_On**: TC-LOC-MGH-020
**Preconditions**: Office 1604 is open; the Notes tab starts from an empty baseline and the Location Management History tab is reachable.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Notes" tab and confirm the empty baseline with no saved notes present. | The Notes tab is active and no saved notes are present. |
| 2 | Enter a note containing exactly 4000 characters in the first note row and verify the text is accepted. | All 4000 characters are entered and visible in the note row. |
| 3 | Click "Save" and confirm the dialog, then verify the save completes. | The dialog is dismissed and the save completes without error. |
| 4 | Open the "Location Management History" tab and sort by "Modified On", newest first, so the most recent rows appear at the top. | The Location Management History tab is active and rows are sorted by Modified On descending. |
| 5 | Locate the most recent history row whose Notes column matches the saved note and verify a matching row is found. | A history row is present whose Notes column contains the full 4000-character note text. |

**Expected**: A maximum-length 4000-character note saves successfully and is recorded in full in the Location Management History Notes column.
**Data**: office=1604 | note length = 4000 characters
**Automatable**: Yes

---

## TC-LOC-MGH-022: Verify a note with special characters records in Management History
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Input Handling |

**Depends_On**: TC-LOC-MGH-020
**Preconditions**: Office 1604 is open; the Notes tab starts from an empty baseline and the Location Management History tab is reachable.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Notes" tab and confirm the empty baseline with no saved notes present. | The Notes tab is active and no saved notes are present. |
| 2 | Enter a note containing HTML-like markup, an ampersand, double quotes, single quotes, and backtick characters, and verify the text is accepted. | All special characters are entered and visible in the note row without being stripped or escaped. |
| 3 | Click "Save" and confirm the dialog, then verify the save completes. | The dialog is dismissed and the save completes without error. |
| 4 | Open the "Location Management History" tab and sort by "Modified On", newest first, so the most recent rows appear at the top. | The Location Management History tab is active and rows are sorted by Modified On descending. |
| 5 | Locate the most recent history row whose Notes column matches the saved note and verify a matching row is found. | A history row is present whose Notes column contains the special-character note text character-for-character. |

**Expected**: A note containing HTML-like tags, an ampersand, quotation marks, apostrophes, and backticks is saved and recorded character-for-character in the Location Management History Notes column, with no loss or truncation.
**Data**: office=1604 | note text includes HTML-like markup, an ampersand, double and single quotes, and backticks
**Automatable**: Yes

---

## TC-LOC-MGH-023: Verify a multi-line note records in Location Management History
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Input Handling |

**Depends_On**: TC-LOC-MGH-020
**Preconditions**: Office 1604 is open; the Notes tab starts from an empty baseline and the Location Management History tab is reachable.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Notes" tab and confirm the empty baseline with no saved notes present. | The Notes tab is active and no saved notes are present. |
| 2 | Enter a note made of three lines separated by line breaks and verify the text is accepted. | The three-line note is entered and visible in the note row. |
| 3 | Click "Save" and confirm the dialog, then verify the save completes. | The dialog is dismissed and the save completes without error. |
| 4 | Open the "Location Management History" tab and sort by "Modified On", newest first, so the most recent rows appear at the top. | The Location Management History tab is active and rows are sorted by Modified On descending. |
| 5 | Locate the most recent history row whose Notes column matches the saved note and verify a matching row is found. | A history row is present whose Notes column contains the multi-line note text. |

**Expected**: A multi-line note (three lines separated by line breaks) is saved and recorded in the Location Management History Notes column with its line content preserved.
**Data**: office=1604 | note text = three lines separated by line breaks
**Automatable**: Yes

---

## TC-LOC-MGH-024: Verify a unicode note records in Location Management History
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Input Handling |

**Depends_On**: TC-LOC-MGH-020
**Preconditions**: Office 1604 is open; the Notes tab starts from an empty baseline and the Location Management History tab is reachable.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Notes" tab and confirm the empty baseline with no saved notes present. | The Notes tab is active and no saved notes are present. |
| 2 | Enter a note containing accented Latin characters, CJK characters, and a check-mark symbol and verify the text is accepted. | The unicode note text is entered and visible in the note row. |
| 3 | Click "Save" and confirm the dialog, then verify the save completes. | The dialog is dismissed and the save completes without error. |
| 4 | Open the "Location Management History" tab and sort by "Modified On", newest first, so the most recent rows appear at the top. | The Location Management History tab is active and rows are sorted by Modified On descending. |
| 5 | Locate the most recent history row whose Notes column matches the saved note and verify a matching row is found. | A history row is present whose Notes column contains the unicode note text. |
| 6 | Restore the "Notes" tab to its empty baseline. | The Notes tab returns to its empty baseline with no saved notes present. |

**Expected**: A note containing accented Latin letters, CJK characters, and a check-mark symbol is saved and recorded correctly in the Location Management History Notes column. The Notes tab is returned to its empty baseline afterward.
**Data**: office=1604 | note text = accented Latin + CJK + check-mark symbol
**Automatable**: Yes

---

## TC-LOC-MGH-025: Verify two sequential note saves create two History rows
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Data Integrity |

**Depends_On**: TC-LOC-MGH-020
**Preconditions**: Office 1604 is open; the Notes tab starts from an empty baseline and the Location Management History tab is reachable.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Notes" tab and confirm the empty baseline with no saved notes present. | The Notes tab is active and no saved notes are present. |
| 2 | Enter a first note value and click "Save", confirming the dialog, then verify the first save completes. | The first note is saved and visible. |
| 3 | Reload, then replace the note with a second different value and click "Save", confirming the dialog, then verify the second save completes. | The second note replaces the first and is saved successfully. |
| 4 | Open the "Location Management History" tab and sort by "Modified On", newest first, so the most recent rows appear at the top. | The Location Management History tab is active and rows are sorted by Modified On descending. |
| 5 | Locate the history row for each of the two saved values and verify both rows are found. | Both history rows are present, one for each saved note value. |
| 6 | Confirm the two rows are distinct and the second save's "Modified On" timestamp is later than the first's. | The two rows are distinct entries and the second row's Modified On timestamp is later than the first row's. |
| 7 | Restore the "Notes" tab to its empty baseline. | The Notes tab returns to its empty baseline with no saved notes present. |

**Expected**: Two sequential saves of different note values create two distinct Location Management History rows (one per save, not a single merged row); the second row's Modified On timestamp is later than the first's. The Notes tab is returned to its empty baseline afterward.
**Data**: office=1604 | first note and second note are two different values
**Automatable**: Yes