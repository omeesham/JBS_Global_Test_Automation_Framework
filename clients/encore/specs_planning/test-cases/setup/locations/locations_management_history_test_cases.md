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

## TC-LOC-MGH-001: Tab Renders and DataTable Loads
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: none (baseline-enforcement per LR-019)
**Steps**:
1. Open location 1604 in Navigator ✓ Location detail page loads on **Basic Information** tab
2. Click the **Location Management History** tab ✓ Tab becomes selected; tabpanel for **Location Management History** renders
3. Observe the DataTable ✓ Table renders with a header row containing column headers

**Expected**: DataTable is visible with column headers. No spinner remains after load.
**Automatable**: Yes

---

## TC-LOC-MGH-002: All 87 Column Headers Present
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
1. With **Location Management History** tab active, inspect the table header row ✓ 87 column header cells are present
2. Verify first column header is **Local Office** ✓ First header reads "Local Office"
3. Verify last column header is **Warehouse Billing** ✓ Last header (after horizontal scroll) reads "Warehouse Billing"
4. Verify column #28 renders an untranslated key ✓ Header reads `locations.history.CalcDamageWaiverOnNetAmount` (known bug — not translated)

**Expected**: 87 total column headers. Column #28 displays raw i18n key. All other headers display human-readable labels.
**Data**: Column count = 87
**Automatable**: Yes

---

## TC-LOC-MGH-003: Default Rows Per Page Is 20
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
1. With **Location Management History** tab active, locate the **rows per page** control at the bottom of the table ✓ A dropdown is visible showing a numeric value
2. Read the current value without opening the dropdown ✓ Displays "20"

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
1. With **Location Management History** tab active, click the **rows per page** dropdown ✓ Dropdown opens showing a listbox of options
2. Read all available options ✓ Options displayed: 10, 20, 30, 40, 50

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
1. Click the **rows per page** dropdown ✓ Options appear
2. Select **10** from the list ✓ Dropdown closes; control shows "10"
3. Observe the table body ✓ Table displays at most 10 rows

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
1. Observe the **Go to first page** button ✓ Button is disabled
2. Observe the **Go to previous page** button ✓ Button is disabled
3. Observe the **Go to next page** button ✓ Button is disabled
4. Observe the **Go to last page** button ✓ Button is disabled
5. Observe the page indicator ✓ Shows "1 / 1"

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
1. Open a location known to have no history records ✓ Location detail page loads
2. Click the **Location Management History** tab ✓ Tab becomes active; table renders
3. Observe the table body ✓ No data rows are present
4. Read the empty state message ✓ Message "No results." is displayed inside the table

**Expected**: Empty state text "No results." appears in the table body. No data rows. Pagination shows "0 / 0" or "1 / 0".
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
1. Inspect row 1 cell under **Local Office** ✓ Displays "1604"
2. Inspect row 1 cell under **Local Office Name** ✓ Displays "Parker Palm Springs"
3. Inspect row 1 cell under **Active** ✓ Displays checkmark (✔)
4. Inspect row 1 cell under **Country** ✓ Displays "United States"
5. Inspect row 1 cell under **Currency** ✓ Displays "USD"
6. Inspect row 1 cell under **Modified By** ✓ Displays a non-empty username value
7. Inspect row 1 cell under **Oracle Product Code** ✓ Displays "1604-PAR04"

**Expected**: All verified cells match expected values. Checkmark columns show ✔ for active boolean fields.
**Automatable**: Yes

---

## TC-LOC-MGH-009: Sort Ascending on Sortable Column
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: Location with multiple history rows open on **Location Management History** tab.

**Steps**:
1. Locate the **Modified On** column header — confirm it has a sort button ✓ Sort icon is visible
2. Click the **Modified On** column header ✓ Column sorts; header shows ascending indicator
3. Inspect first and last visible rows ✓ Dates are in ascending order (earliest first)

**Expected**: Modified On column sorts ascending. Sort icon updates to indicate ascending order. Row order changes accordingly.
**Automatable**: Yes

---

## TC-LOC-MGH-010: Sort Descending by Toggling Same Column
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: Table is sorted ascending on **Modified On** (from TC-LOC-MGH-009).

**Steps**:
1. Click the **Modified On** column header a second time ✓ Sort direction toggles
2. Inspect first and last visible rows ✓ Dates are in descending order (latest first)

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
1. Locate the **Live Date** column header — confirm sort button is present ✓ Sort icon visible
2. Click the **Live Date** column header ✓ Table sorts by Live Date ascending
3. Verify first row has earliest Live Date value ✓ Date in first row is the oldest

**Expected**: Table reorders rows by Live Date ascending. Sort button on Live Date shows active sort indicator.
**Automatable**: Yes

---

## TC-LOC-MGH-012: Non-Sortable Columns Have No Sort Button
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
1. Locate the **Active** column header ✓ No sort button / clickable sort icon is present
2. Locate the **Corporate Pricing** column header ✓ No sort button present
3. Locate the **Allow DPCD** column header ✓ No sort button present
4. Locate the **Warehouse Billing** column header (last column) ✓ No sort button present

**Expected**: Non-sortable columns have static header text only — no sort button, no sort icon, no click affordance.
**Automatable**: Yes

---

## TC-LOC-MGH-013: Untranslated i18n Key in Column 28 (Bug)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Bug |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
1. With **Location Management History** tab active, scroll right to locate column #28 (after **LDW Percentage**) ✓ Column header is visible
2. Read the column header text ✓ Displays raw key: `locations.history.CalcDamageWaiverOnNetAmount` instead of a human-readable label

**Expected**: Column #28 renders the untranslated i18n key `locations.history.CalcDamageWaiverOnNetAmount` — known bug. Human-readable header ("Calculate LDW on Net Amount" or equivalent) should appear instead.
**Data**: column=28 | bugBehavior=untranslated i18n key rendered
**Note**: Record as defect for engineering team. Do not mark TC as failed while bug is unresolved — this TC documents the defect.
**Automatable**: Yes

---

## TC-LOC-MGH-014: Duplicate "Calculate CAC on Net Amount" Column Headers (Bug)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Bug |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
1. Scroll the table to find columns **#37** and **#38** (after **Apply Cables and Consumables Fee** and **C&C Percent**) ✓ Two adjacent column headers are visible
2. Read both column header labels ✓ Both read "Calculate CAC on Net Amount"
3. Verify sort availability ✓ Column #37 has no sort button; column #38 has a sort button

**Expected**: Columns #37 and #38 both display "Calculate CAC on Net Amount" as their header — known label defect. Column #37 has no sort button; column #38 has a sort button. Headers should be distinct.
**Data**: col37=Calculate CAC on Net Amount (non-sortable) | col38=Calculate CAC on Net Amount (sortable) | defect=duplicate header names
**Automatable**: Yes

---

## TC-LOC-MGH-015: Read-Only — No Add/Edit/Delete Controls Present
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
1. With **Location Management History** tab active, inspect the area above/below the table ✓ No "Add" or "New" button is present
2. Inspect each visible data row ✓ No "Edit" or "Delete" button or icon exists on any row
3. Inspect the tab panel ✓ No form inputs, no Save button within the History tabpanel

**Expected**: Zero Add, Edit, Delete, or Save controls are present in the Location Management History tabpanel. The tab is entirely read-only.
**Automatable**: Yes

---

## TC-LOC-MGH-016: Read-Only — Table Cells Are Not Interactive
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: Location 1604 open on **Location Management History** tab; at least 1 data row visible.

**Steps**:
1. Click on any cell value in the data row (e.g., **Local Office Name** cell) ✓ No text input, combobox, or editor appears
2. Attempt to double-click on the cell ✓ No edit mode activates
3. Observe the cursor and focus behaviour ✓ Cell shows default pointer (not text cursor); no input affordance

**Expected**: Cells are non-interactive. Clicks do not trigger editing. No form controls appear.
**Automatable**: Yes

---

## TC-LOC-MGH-017: Horizontal Scroll Works for Wide Table
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
1. With **Location Management History** tab active, observe the initial table view ✓ Only the first ~10 columns are visible without scrolling (table is wider than viewport)
2. Scroll right inside the table container ✓ Table scrolls horizontally; additional column headers become visible
3. Continue scrolling to the rightmost column ✓ **Warehouse Billing** (column #87) is reachable

**Expected**: Table scrolls horizontally. All 87 columns are accessible via horizontal scroll. Column headers stay sticky (if applicable) or scroll with data.
**Automatable**: Yes

---

## TC-LOC-MGH-018: API Endpoint Called on Tab Activation
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Steps**:
1. Open location 1604 on **Basic Information** tab ✓ Page loads; no history API call yet
2. Open browser DevTools Network panel and filter to `history` ✓ Network panel ready
3. Click the **Location Management History** tab ✓ Tab activates
4. Inspect network requests ✓ A GET request to `/api/location/1604/history?IsCorporate=true` is made

**Expected**: Exactly one API call to `/api/location/{locationNo}/history?IsCorporate=true` is triggered on tab activation. Response returns HTTP 200 with a data array.
**Automatable**: Yes

---

## TC-LOC-MGH-019: Pagination Navigation Enables with Multiple Pages
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-MGH-001
**Preconditions**: A location with more than 20 history rows is open on **Location Management History** tab; rows per page = 20.

**Steps**:
1. Observe the page indicator ✓ Shows "1 / N" where N > 1
2. Observe the **Go to first page** and **Go to previous page** buttons ✓ Both are disabled (already on page 1)
3. Observe the **Go to next page** and **Go to last page** buttons ✓ Both are enabled
4. Click **Go to next page** ✓ Table shows rows for page 2; page indicator shows "2 / N"
5. Click **Go to previous page** ✓ Table returns to page 1; indicator shows "1 / N"
6. Click **Go to last page** ✓ Table jumps to final page; page indicator shows "N / N"; **Go to next page** and **Go to last page** become disabled
7. Click **Go to first page** ✓ Returns to page 1; indicator shows "1 / N"

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
1. Open the **Notes** tab and confirm the empty baseline ✓ No saved notes are present
2. Enter the note text "hello" in the first note row ✓ Text accepted
3. Click **Save** and confirm the dialog ✓ Save completes
4. Open the **Location Management History** tab and sort by **Modified On**, newest first ✓ The most recent rows appear at the top
5. Locate the most recent history row whose Notes column matches the saved note ✓ A matching row is found

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
1. Open the **Notes** tab and confirm the empty baseline ✓ No saved notes are present
2. Enter a note containing exactly 4000 characters in the first note row ✓ Text accepted
3. Click **Save** and confirm the dialog ✓ Save completes
4. Open the **Location Management History** tab and sort by **Modified On**, newest first ✓ The most recent rows appear at the top
5. Locate the most recent history row whose Notes column matches the saved note ✓ A matching row is found

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
1. Open the **Notes** tab and confirm the empty baseline ✓ No saved notes are present
2. Enter a note containing HTML-like markup, an ampersand, double quotes, single quotes, and backtick characters ✓ Text accepted
3. Click **Save** and confirm the dialog ✓ Save completes
4. Open the **Location Management History** tab and sort by **Modified On**, newest first ✓ The most recent rows appear at the top
5. Locate the most recent history row whose Notes column matches the saved note ✓ A matching row is found

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
1. Open the **Notes** tab and confirm the empty baseline ✓ No saved notes are present
2. Enter a note made of three lines separated by line breaks ✓ Text accepted
3. Click **Save** and confirm the dialog ✓ Save completes
4. Open the **Location Management History** tab and sort by **Modified On**, newest first ✓ The most recent rows appear at the top
5. Locate the most recent history row whose Notes column matches the saved note ✓ A matching row is found

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
1. Open the **Notes** tab and confirm the empty baseline ✓ No saved notes are present
2. Enter a note containing accented Latin characters, CJK characters, and a check-mark symbol ✓ Text accepted
3. Click **Save** and confirm the dialog ✓ Save completes
4. Open the **Location Management History** tab and sort by **Modified On**, newest first ✓ The most recent rows appear at the top
5. Locate the most recent history row whose Notes column matches the saved note ✓ A matching row is found
6. Restore the Notes tab to its empty baseline ✓ No saved notes remain

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
1. Open the **Notes** tab and confirm the empty baseline ✓ No saved notes are present
2. Enter a first note value and click **Save**, confirming the dialog ✓ First save completes
3. Reload, then replace the note with a second, different value and click **Save**, confirming the dialog ✓ Second save completes
4. Open the **Location Management History** tab and sort by **Modified On**, newest first ✓ The most recent rows appear at the top
5. Locate the history row for each of the two saved values ✓ Both rows are found
6. Confirm the two rows are distinct and the second save's Modified On timestamp is later than the first's ✓ Two separate rows, the second is more recent
7. Restore the Notes tab to its empty baseline ✓ No saved notes remain

**Expected**: Two sequential saves of different note values create two distinct Location Management History rows (one per save, not a single merged row); the second row's Modified On timestamp is later than the first's. The Notes tab is returned to its empty baseline afterward.
**Data**: office=1604 | first note and second note are two different values
**Automatable**: Yes