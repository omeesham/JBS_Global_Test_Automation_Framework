# Location Management History Test Plan — **Module**: locations | **Test Cases**: [test-cases/locations/locations_management_history_test_cases.md](../test-cases/locations/locations_management_history_test_cases.md)

---

## TC-LOC-MGH-001: Tab Renders and DataTable Loads
1. Navigate to location 1604 detail page (`locations/1604/settings`)
2. Click `tabLocationManagementHistory` tab
3. Assert tabpanel `tblMgmtHistory` is visible with at least 1 column header

---

## TC-LOC-MGH-002: All 87 Column Headers Present
1. With `tabLocationManagementHistory` active, evaluate `tblMgmtHistory` header row column count
2. Assert `page.locator('[role="columnheader"]').count()` equals 87
3. Assert first columnheader text = "Local Office"
4. Assert last columnheader text = "Warehouse Billing"
5. Assert one columnheader text contains `locations.history.CalcDamageWaiverOnNetAmount` (bug/untranslated)

---

## TC-LOC-MGH-003: Default Rows Per Page Is 20
1. With `tabLocationManagementHistory` active, read `drpMgmtHistoryRowsPerPage` current value
2. Assert displayed value = "20"

---

## TC-LOC-MGH-004: Rows Per Page Dropdown Options
1. Click `drpMgmtHistoryRowsPerPage`
2. Assert listbox options are exactly: "10", "20", "30", "40", "50"
3. Press Escape to close

---

## TC-LOC-MGH-005: Change Rows Per Page Updates Table Display
1. Open a location with 11+ history rows on `tabLocationManagementHistory`
2. Click `drpMgmtHistoryRowsPerPage`; select "10"
3. Assert `tblMgmtHistory` tbody row count ≤ 10
4. Assert page indicator shows page total > 1

---

## TC-LOC-MGH-006: Pagination Controls Disabled When Only One Page
1. Open location 1604 on `tabLocationManagementHistory` (1 row, 1 page)
2. Assert `btnMgmtHistoryFirstPage` is disabled
3. Assert `btnMgmtHistoryPrevPage` is disabled
4. Assert `btnMgmtHistoryNextPage` is disabled
5. Assert `btnMgmtHistoryLastPage` is disabled
6. Assert page indicator text = "1 / 1"

---

## TC-LOC-MGH-007: Empty State Message for Location with No History
1. Navigate to a location confirmed to have zero history records
2. Click `tabLocationManagementHistory`
3. Assert `txtMgmtHistoryEmptyState` is visible with text "No results."
4. Assert `tblMgmtHistory` tbody has 0 data rows

---

## TC-LOC-MGH-008: Data Row Renders with Correct Values (Location 1604)
1. Open location 1604 on `tabLocationManagementHistory`
2. Assert row 1 "Local Office" cell text = "1604"
3. Assert row 1 "Local Office Name" cell text = "Parker Palm Springs"
4. Assert row 1 "Active" cell contains checkmark (✔)
5. Assert row 1 "Country" cell text = "United States"
6. Assert row 1 "Currency" cell text = "USD"
7. Assert row 1 "Modified By" cell is non-empty
8. Assert row 1 "Oracle Product Code" cell text = "1604-PAR04"

---

## TC-LOC-MGH-009: Sort Ascending on Sortable Column
1. Open a location with multiple history rows on `tabLocationManagementHistory`
2. Click "Modified On" column header sort button
3. Assert sort icon shows ascending state
4. Assert first row "Modified On" value ≤ last visible row "Modified On" value

---

## TC-LOC-MGH-010: Sort Descending by Toggling Same Column
1. With table sorted ascending on "Modified On" (TC-LOC-MGH-009 precondition)
2. Click "Modified On" column header sort button again
3. Assert sort icon shows descending state
4. Assert first row "Modified On" value ≥ last visible row "Modified On" value

---

## TC-LOC-MGH-011: Sort by Live Date Column
1. Open a location with multiple history rows on `tabLocationManagementHistory`
2. Locate "Live Date" columnheader; assert sort button exists
3. Click "Live Date" sort button
4. Assert table reorders; first row has earliest Live Date value

---

## TC-LOC-MGH-012: Non-Sortable Columns Have No Sort Button
1. With `tabLocationManagementHistory` active, locate "Active" columnheader
2. Assert no sort button (`button`) is present inside "Active" columnheader
3. Repeat for "Corporate Pricing", "Allow DPCD", "Warehouse Billing"
4. Assert all 4 headers contain only static text — no button child

---

## TC-LOC-MGH-013: Untranslated i18n Key in Column 28 (Bug)
1. With `tabLocationManagementHistory` active, scroll to column #28 (after "LDW Percentage")
2. Assert columnheader text = `locations.history.CalcDamageWaiverOnNetAmount`
3. Log as known defect; assert human-readable label is NOT present

---

## TC-LOC-MGH-014: Duplicate "Calculate CAC on Net Amount" Column Headers (Bug)
1. With `tabLocationManagementHistory` active, scroll to columns #37 and #38
2. Assert both columnheaders have text "Calculate CAC on Net Amount"
3. Assert columnheader #37 has no sort button child
4. Assert columnheader #38 has a sort button child

---

## TC-LOC-MGH-015: Read-Only — No Add/Edit/Delete Controls Present
1. With `tabLocationManagementHistory` active, assert no button with text "Add" exists in tabpanel
2. Assert no button with text "Edit" or "Delete" exists in tabpanel
3. Assert no button with text "Save" exists in tabpanel

---

## TC-LOC-MGH-016: Read-Only — Table Cells Are Not Interactive
1. Open location 1604 on `tabLocationManagementHistory`; row 1 is visible
2. Click on the "Local Office Name" cell
3. Assert no textbox, combobox, or contenteditable element appears within the cell
4. Assert no editable state is triggered in the row

---

## TC-LOC-MGH-017: Horizontal Scroll Works for Wide Table
1. With `tabLocationManagementHistory` active, assert the table container has horizontal overflow
2. Scroll the table to the far right
3. Assert "Warehouse Billing" (last column) is visible after scrolling

---

## TC-LOC-MGH-018: API Endpoint Called on Tab Activation
1. Navigate to location 1604 detail page on "Basic Information" tab
2. Begin intercepting network requests via `page.waitForRequest`
3. Click `tabLocationManagementHistory`
4. Assert a GET request matching `/api/location/1604/history?IsCorporate=true` is made
5. Assert response status = 200

---

## TC-LOC-MGH-019: Pagination Navigation Enables with Multiple Pages
1. Open a location with 21+ history rows on `tabLocationManagementHistory`; rows per page = 20
2. Assert `btnMgmtHistoryFirstPage` and `btnMgmtHistoryPrevPage` are disabled
3. Assert `btnMgmtHistoryNextPage` and `btnMgmtHistoryLastPage` are enabled
4. Click `btnMgmtHistoryNextPage`; assert page indicator = "2 / N"
5. Click `btnMgmtHistoryPrevPage`; assert page indicator = "1 / N"
6. Click `btnMgmtHistoryLastPage`; assert page indicator = "N / N"; next/last buttons disabled
7. Click `btnMgmtHistoryFirstPage`; assert page indicator = "1 / N"
