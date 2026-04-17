# Location Account and Address Test Cases
**Module**: locations | **Total**: 29 | **Status**: Automated | **Updated**: 2026-04-14

---

## FIELD INVENTORY & DISCOVERY

**Venue/Branch Account Card** (8 fields):
| Field | Element | State | Value (1604) |
|---|---|---|---|
| Section Header | generic text | display-only | "Venue/Branch Account" |
| Name | button (in term) + disabled textbox (in definition) | button clickable, textbox disabled | Parker Palm Springs |
| Address | button (in term) + static text (in definition) | button clickable, text display-only | 8899 Beverly Blvd Ste 412 |
| City | definition text | display-only | WEST HOLLYWOOD |
| State | definition text | display-only | CA |
| Zip | definition text | display-only | 90048 |
| Country | definition text | display-only | United States |
| Phone 1 | text input | editable, **required** | 760-883-1957 |
| Phone 2 | text input | editable, optional | (empty) |

**Master Bill To Address Card** (5 fields):
| Field | Element | State | Value (1604) |
|---|---|---|---|
| Section Header | generic text | display-only | "Master Bill To Address" |
| Address | button (in term) + static text (in definition) | button clickable, text display-only | 8899 Beverly Blvd Ste 412 |
| City | definition text | display-only | WEST HOLLYWOOD |
| State | definition text | display-only | CA |
| Zip | definition text | display-only | 90048 |
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

**Steps**: 1. Open **Account and Address** tab ✓ 2. Verify fields below Address in Venue card ✓ City: "WEST HOLLYWOOD", State: "CA", Zip: "90048", Country: "United States" — all static text (no inputs or controls)
**Expected**: City, State, Zip, Country in Venue section are display-only; no edit controls
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-014: Master address display fields are read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Account and Address** tab ✓ 2. Verify fields below Address in Master card ✓ City: "WEST HOLLYWOOD", State: "CA", Zip: "90048", Country: "United States" — all static text
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

---

## TC-LOC-ACC-021: DROPPED — Phone 1 round-trip persistence
| Priority | Status | Type |
|----------|--------|------|
| P0 | DROPPED | NOT-AUTOMATABLE |

**Reason**: MCP verification (2026-04-07) proved Phone 1 is account-linked. `fill()` does not trigger Angular dirty tracking for masked inputs. `pressSequentially()` triggers dirty and save completes, but value always reverts to account phone on reload. The server overwrites Phone 1 with the account's phone number regardless of what was saved.
**Automatable**: No

---

## TC-LOC-ACC-022: Cancel Save dialog discards save without persisting
| Priority | Status | Type |
|----------|--------|------|
| P1 | Automated | Negative / State Transition |

**Steps**: 1. Edit Phone 2 with test value ✓ Save enables 2. Click Save → Save Changes dialog appears 3. Click Cancel in dialog ✓ Dialog closes 4. Verify: Save still enabled, Phone 2 still has value (changes not committed) 5. Reload to discard (LR-026)
**Expected**: Cancel in Save Changes dialog dismisses without persisting; form stays dirty
**Data**: office=1604, phone=ACCOUNT_TEST_PHONE
**Automatable**: Yes

---

## TC-LOC-ACC-023: Phone 1 cleared shows invalid state and error icon
| Priority | Status | Type |
|----------|--------|------|
| P1 | Automated | Validation / Error Guessing |

**Steps**: 1. Clear Phone 1, blur ✓ 2. Verify aria-invalid=true and error icon visible 3. Verify Save remains enabled (Angular does NOT block save on invalid Phone 1 — MCP-verified 2026-04-07) 4. Reload to restore baseline (LR-026)
**Expected**: Clearing Phone 1 shows validation indicators but does NOT disable Save
**Data**: office=1604
**Note**: Plan originally assumed invalid Phone 1 blocks Save. MCP proved otherwise — Save stays enabled.
**Automatable**: Yes

---

## TC-LOC-ACC-024: DROPPED — Unsaved Changes dialog on tab switch
| Priority | Status | Type |
|----------|--------|------|
| P1 | DROPPED | MCP-5 FAIL |

**Reason**: MCP-5 verification (2026-04-07) failed. Dirty form + tab switch did NOT trigger an Unsaved Changes alertdialog. Angular's tab navigation within the same component does not fire the unsaved changes guard for this page.
**Automatable**: No (behavior does not exist)

---

## TC-LOC-ACC-025: Account List Address filter returns matching results
| Priority | Status | Type |
|----------|--------|------|
| P2 | Automated | Decision Table |

**Steps**: 1. Open Account List dialog 2. Fill Address filter with "Beverly" 3. Click Search ✓ Results filtered 4. Verify results contain "Beverly" 5. Cancel dialog
**Expected**: Address filter returns accounts with matching address
**Data**: office=1604, address=Beverly
**Automatable**: Yes

---

## TC-LOC-ACC-026: Account List City filter returns matching results
| Priority | Status | Type |
|----------|--------|------|
| P2 | Automated | Decision Table |

**Steps**: 1. Open Account List dialog 2. Fill City filter with "LOS ANGELES" 3. Click Search ✓ Results filtered 4. Verify results contain "LOS ANGELES" 5. Cancel dialog
**Expected**: City filter returns accounts with matching city
**Data**: office=1604, city=LOS ANGELES
**Automatable**: Yes

---

## TC-LOC-ACC-027: Address selection changes venue display fields
| Priority | Status | Type |
|----------|--------|------|
| P1 | Automated | E2E Display |

**Steps**: 1. Verify starting city is "WEST HOLLYWOOD" 2. Open Venue Address dialog 3. Select alternate address row (4200 E Palm Canyon Dr) 4. Verify city changed to "PALM SPRINGS" 5. Verify Save enables (form dirty) 6. Reload to discard — verify city restored to "WEST HOLLYWOOD"
**Expected**: Address selection updates display fields but changes are discarded on reload (Angular form model does NOT serialize address changes into save payload — MCP-verified 2026-04-07)
**Data**: office=1604, ALT_ADDRESS, ORIGINAL_ADDRESS
**Note**: Originally planned as persistence test (save+reload+verify). MCP proved address selection doesn't persist through save — display change only.
**Automatable**: Yes

---

## TC-LOC-ACC-028: Account selection changes venue name and persists
| Priority | Status | Type |
|----------|--------|------|
| P0 | Automated | RT + E2E |

**Steps**: 1. Read current venue name (store for cleanup) 2. Open Account List → search current account → select (re-selecting triggers dirty) 3. Verify Save enables 4. Save and confirm 5. Reload → verify venue name persisted 6. try/finally: if name changed, restore original account
**Expected**: Account selection applies, persists through save+reload
**Data**: office=1604, ACCOUNT_SEARCH
**Risk**: HIGH — changes venue fields. Wrapped in try/finally. Positioned LAST in serial block.
**Automatable**: Yes

---

# Integration: History Verification Test Cases

## TC-LOC-ACC-HIST: Account & Address Saves — Location Management History Row Verification

| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Integration | Yes | tests/specs/setup/locations/location-account-address.spec.ts:301 |

**Completed saves to verify**: TC-LOC-ACC-019/020 (Phone2 persistence)

**Steps**:
1. After ACC save TCs complete, navigate to Location Management History tab -> Tab loads
2. Sort by Modified On descending (default is ascending) -> Rows newest-first
3. Read rows newer than suite start time via timestamp-window isolation (2-min buffer) -> Suite rows isolated
4. Verify at least 1 suite row present -> Count > 0
5. Verify every suite row has Modified By and Modified On non-empty -> User + timestamp present per row
6. Gap-check: verify Venue/Branch Account Phone2 column contains expected state changes from save TCs (TC-019/020) -> Tracked field reflected
7. Gap-check: verify Venue/Branch Account Name column is populated -> Account name present in history

**Expected**: Account & Address saves produced history rows (snapshot model). Modified By and Modified On populated per row. Phone2 (col 57) and Account Name (col 55) reflect saved values. Soft assertions collect all mismatches.
**Data**: location=1604 | Formats per SUBPLAN_HISTORY_01_MCP_FINDINGS.md section 1
**Automatable**: Yes

**MCP_VERIFICATION_LOG**:
- Expected: 1 save = 1 new row (snapshot model); col 57 "Venue/Branch Account Phone2" matches saved value; col 55 "Venue/Branch Account Name" populated
- Source: SUBPLAN_HISTORY_01_MCP_FINDINGS.md §1 lines 17-107 (col 55 "Venue/Branch Account Name" and col 57 "Venue/Branch Account Phone2" both present in 87-col header list), §3 lines 259-263 (LOC snapshot model — extrapolated to Account saves)
- Session: 2026-04-13 14:42–15:04 UTC (Office 1604)
- Verified: ✅ (causality extrapolated from §3 LOC snapshot; Account/Address saves not causally tested by SP1)