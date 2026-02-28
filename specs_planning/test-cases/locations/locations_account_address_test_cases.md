# Location Account and Address Test Cases
**Module**: locations | **Total**: 20 | **Status**: Manual | **Updated**: 2026-02-19

---

## FIELD INVENTORY & DISCOVERY

**Venue/Branch Account Card** (8 fields):
| Field | Element | State | Value (1604) |
|---|---|---|---|
| Section Header | generic text | display-only | "Venue/Branch Account" |
| Name | button (in term) + disabled textbox (in definition) | button clickable, textbox disabled | Parker Palm Springs |
| Address | button (in term) + static text (in definition) | button clickable, text display-only | 4200 E Palm Canyon Dr |
| City | definition text | display-only | PALM SPRINGS |
| State | definition text | display-only | CA |
| Zip | definition text | display-only | 92264 |
| Country | definition text | display-only | United States |
| Phone 1 | text input | editable, **required** | 760-883-1957 |
| Phone 2 | text input | editable, optional | (empty) |

**Master Bill To Address Card** (5 fields):
| Field | Element | State | Value (1604) |
|---|---|---|---|
| Section Header | generic text | display-only | "Master Bill To Address" |
| Address | button (in term) + static text (in definition) | button clickable, text display-only | 4200 E Palm Canyon Dr |
| City | definition text | display-only | PALM SPRINGS |
| State | definition text | display-only | CA |
| Zip | definition text | display-only | 92264 |
| Country | definition text | display-only | United States |

**Save Flow**: Left-panel Save (shared). No dedicated Save in this tab.

**Discovered Dialogs**:
- **Account List**: Opens from **Name** button. Search filters: Account Number, Account Name, Address, City, State, Country. Row selection via checkbox -- enables Select button.
- **Select Customer Address**: Opens from both **Address** buttons. 8 addresses for location. Client-side search bar. Row checkbox -- enables Select. Save always disabled. Same dialog instance for both buttons.
- **Save Changes**: Confirmation dialog on Save: "Are you sure you want to save the changes?" Cancel | Save.

---

## TC-LOC-ACC-001: Verify tab two-card layout
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Navigate to Setup > Location > 1604 -- **Account and Address** tab ✓ Tab loads 2. Verify two side-by-side cards ✓ Left card: "Venue/Branch Account", Right card: "Master Bill To Address"
**Expected**: Two distinct cards visible with correct section headers
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-002: Verify Venue Name field is disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ Loads 2. Locate **Name** row in Venue/Branch Account ✓ textbox visible 3. Verify textbox state ✓ disabled (not editable), value = "Parker Palm Springs"
**Expected**: Name textbox is always disabled; cannot be typed in directly
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-003: Name button opens Account List dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ Loads 2. Click **Name** button (in Venue/Branch Account term) ✓ Dialog opens 3. Verify dialog ✓ Title "Account List", search filters: Account Number, Account Name, Address, City, State, Country, Search + Reset buttons, results table
**Expected**: Account List dialog opens with search filters and result table
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-004: Account List – search returns results
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Click **Name** button -- Account List dialog opens ✓ 2. Type "Parker" in **Account Name** field ✓ 3. Click **Search** ✓ Results table updates 4. Verify result ✓ Row with "AC000107 Parker Palm Springs" visible
**Expected**: Searching by account name returns matching account records
**Data**: office=1604, searchTerm=Parker
**Automatable**: Yes

---

## TC-LOC-ACC-005: Account List – Select button disabled until row checked
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open Account List dialog, search for "Parker", click **Search** ✓ 1 result 2. Verify **Select** button ✓ disabled 3. Click row checkbox (first cell button[role="checkbox"]) ✓ Checked 4. Verify **Select** button ✓ enabled
**Expected**: Select button only enables after a row is checked via row checkbox
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-006: Account List – Cancel closes without changes
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open Account List dialog, search for results ✓ 2. Check a row ✓ Select enabled 3. Click **Cancel** ✓ Dialog closes 4. Verify Name textbox ✓ Still "Parker Palm Springs" (unchanged)
**Expected**: Cancel dismisses dialog without updating the Name field
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-007: Account List – Reset clears search fields
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open Account List dialog ✓ 2. Enter "Parker" in **Account Name**, click **Search** ✓ Results load 3. Click **Reset** ✓ 4. Verify search fields ✓ All empty; table shows "No results." (unfiltered state)
**Expected**: Reset clears all filter inputs and results table
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-008: Venue Address button opens Select Customer Address dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ 2. Click **Address** button (first one, in Venue/Branch Account term) ✓ Dialog opens 3. Verify dialog ✓ Title "Select Customer Address", search bar (placeholder "Search..."), sortable columns (Address 1/2/3, City, State, Zip Code, Country), 7 address rows, Select + Cancel + Save + Close buttons; "Total Addresses: 7" shown in footer
**Expected**: Select Customer Address dialog opens with 7 address records (Total Addresses: 7 in footer)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-009: Address dialog – Select button disabled until row checked
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open Select Customer Address dialog ✓ 2. Verify **Select** button ✓ disabled 3. Click row checkbox (first cell button[role="checkbox"]) ✓ Checkbox checked 4. Verify **Select** button ✓ enabled
**Expected**: Select button only enables when a row checkbox is checked
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-010: Address dialog – Search bar filters results client-side
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open Select Customer Address dialog ✓ 7 rows visible (Total Addresses: 7) 2. Type "Beverly" in search bar ✓ 3. Verify rows ✓ Filtered to 1 matching row containing "Beverly" (8899 Beverly Blvd Ste 412); footer row still visible
**Expected**: Search bar filters rows in real-time without server call; "Beverly" matches 1 of 7 addresses
**Data**: office=1604, filterTerm=Beverly
**Automatable**: Yes

---

## TC-LOC-ACC-011: Address dialog – Save button always disabled
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | User-Requested |

**Steps**: 1. Open Select Customer Address dialog ✓ 2. Verify **Save** button ✓ disabled 3. Click row checkbox to select a row ✓ Row selected, Select enabled 4. Verify **Save** button ✓ Still disabled
**Expected**: Save button remains disabled regardless of row selection (no create-address function)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-012: Master Address button opens Select Customer Address dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ 2. Click **Address** button in **Master Bill To Address** card (second Address button) ✓ 3. Verify dialog ✓ Same "Select Customer Address" dialog opens with same 7 addresses (Total Addresses: 7)
**Expected**: Both Venue and Master Address buttons open the same Select Customer Address dialog
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-013: Venue address display fields are read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ 2. Verify fields below Address in Venue card ✓ City: "PALM SPRINGS", State: "CA", Zip: "92264", Country: "United States" — all static text (no inputs or controls)
**Expected**: City, State, Zip, Country in Venue section are display-only; no edit controls
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-014: Master address display fields are read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ 2. Verify fields below Address in Master card ✓ City: "PALM SPRINGS", State: "CA", Zip: "92264", Country: "United States" — all static text
**Expected**: City, State, Zip, Country in Master Bill To Address are display-only
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-015: Phone 1 – required field shows inline error when cleared
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ Phone 1 has value "760-883-1957" 2. Clear **Phone 1** field ✓ Empty 3. Click away (blur) ✓ 4. Verify **Phone 1** ✓ aria-invalid="true", error message "Required" appears below field
**Expected**: Phone 1 shows "Required" error inline on blur when empty; aria-invalid set
**Data**: office=1604

**Cleanup**: Restore Phone 1 to "760-883-1957", save
**Automatable**: Yes

---

## TC-LOC-ACC-016: Phone 2 – optional, no validation error when empty
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ Phone 2 is empty 2. Click into **Phone 2**, clear it (already empty), blur ✓ 3. Verify **Phone 2** ✓ No error message, aria-invalid="false"
**Expected**: Phone 2 has no required validation; empty is valid
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-017: Save button disabled when no pending changes
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ No changes made 2. Verify left-panel **Save** button ✓ disabled state
**Expected**: Save button starts disabled (no unsaved changes)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-018: Save button enables on field change
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ Save disabled 2. Edit **Phone 2** field (type any value) ✓ 3. Verify **Save** button ✓ enabled

**Expected**: Editing any field triggers unsaved-change state and enables Save
**Data**: office=1604

**Cleanup**: Click Save -- Cancel in Save Changes dialog to discard
**Automatable**: Yes

---

## TC-LOC-ACC-019: Save flow – confirmation dialog then success
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Edit **Phone 2** to "555-000-0001" ✓ Save enabled 2. Click **Save** ✓ "Save Changes" dialog: "Are you sure you want to save the changes?" with Cancel + Save 3. Click **Save** in dialog ✓ 4. Verify Save button ✓ disabled (clean state)
**Expected**: Save requires confirmation -- confirmed save disables Save button
**Data**: office=1604

**Cleanup**: Restore Phone 2 to empty, save again to restore baseline
**Automatable**: Yes

---

## TC-LOC-ACC-020: Save changes persist after page reload
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Edit **Phone 2**, save and confirm ✓ Data saved 2. Reload page ✓ 3. Navigate to **Account and Address** tab ✓ 4. Verify **Phone 2** ✓ shows saved value; Save button disabled
**Expected**: Saved data persists after full page reload
**Data**: office=1604

**Cleanup**: Restore Phone 2 to empty baseline after verification

**Automatable**: Yes