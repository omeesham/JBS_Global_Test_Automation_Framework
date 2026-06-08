# Location Account and Address Test Cases
**Module**: locations | **Total**: 31 | **Status**: Partial | **Updated**: 2026-05-29

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

**Depends_On**: none (baseline-enforcement per LR-019)
**Steps**: 1. Navigate to Setup > Location > 1604 -- **Account and Address** tab ✓ Tab loads 2. Verify two side-by-side cards ✓ Left card: "Venue/Branch Account", Right card: "Master Bill To Address"
**Expected**: Two distinct cards visible with correct section headers
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-002: Verify Venue Name field is disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open **Account and Address** tab ✓ Loads 2. Locate **Name** row in Venue/Branch Account ✓ textbox visible 3. Verify textbox state ✓ disabled (not editable), value = "Parker Palm Springs"
**Expected**: Name textbox is always disabled; cannot be typed in directly
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-003: Name button opens Account List dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open **Account and Address** tab ✓ Loads 2. Click **Name** button (in Venue/Branch Account term) ✓ Dialog opens 3. Verify dialog ✓ Title "Account List", search filters: Account Number, Account Name, Address, City, State, Country, Search + Reset buttons, results table
**Expected**: Account List dialog opens with search filters and result table
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-004: Account List – search returns results
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Click **Name** button -- Account List dialog opens ✓ 2. Type "Parker" in **Account Name** field ✓ 3. Click **Search** ✓ Results table updates 4. Verify result ✓ Row with "AC000107 Parker Palm Springs" visible
**Expected**: Searching by account name returns matching account records
**Data**: office=1604, searchTerm=Parker
**Automatable**: Yes

---

## TC-LOC-ACC-005: Account List – Select button disabled until row checked
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open Account List dialog, search for "Parker", click **Search** ✓ 1 result 2. Verify **Select** button ✓ disabled 3. Click row checkbox (first cell button[role="checkbox"]) ✓ Checked 4. Verify **Select** button ✓ enabled
**Expected**: Select button only enables after a row is checked via row checkbox
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-006: Account List – Cancel closes without changes
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open Account List dialog, search for results ✓ 2. Check a row ✓ Select enabled 3. Click **Cancel** ✓ Dialog closes 4. Verify Name textbox ✓ Still "Parker Palm Springs" (unchanged)
**Expected**: Cancel dismisses dialog without updating the Name field
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-007: Account List – Reset clears search fields
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open Account List dialog ✓ 2. Enter "Parker" in **Account Name**, click **Search** ✓ Results load 3. Click **Reset** ✓ 4. Verify search fields ✓ All empty; table shows "No results." (unfiltered state)
**Expected**: Reset clears all filter inputs and results table
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-008: Venue Address button opens Select Customer Address dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open **Account and Address** tab ✓ 2. Click **Address** button (first one, in Venue/Branch Account term) ✓ Dialog opens 3. Verify dialog ✓ Title "Select Customer Address", search bar (placeholder "Search."), sortable columns (Address 1/2/3, City, State, Zip Code, Country), 7 address rows, Select + Cancel + Save + Close buttons; "Total Addresses: 7" shown in footer
**Expected**: Select Customer Address dialog opens with 7 address records (Total Addresses: 7 in footer)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-009: Address dialog – Select button disabled until row checked
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open Select Customer Address dialog ✓ 2. Verify **Select** button ✓ disabled 3. Click row checkbox (first cell button[role="checkbox"]) ✓ Checkbox checked 4. Verify **Select** button ✓ enabled
**Expected**: Select button only enables when a row checkbox is checked
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-010: Address dialog – Search bar filters results client-side
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open Select Customer Address dialog ✓ 7 rows visible (Total Addresses: 7) 2. Type "Beverly" in search bar ✓ 3. Verify rows ✓ Filtered to 1 matching row containing "Beverly" (8899 Beverly Blvd Ste 412); footer row still visible
**Expected**: Search bar filters rows in real-time without server call; "Beverly" matches 1 of 7 addresses
**Data**: office=1604, filterTerm=Beverly
**Automatable**: Yes

---

## TC-LOC-ACC-011: Address dialog – Save button always disabled
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open Select Customer Address dialog ✓ 2. Verify **Save** button ✓ disabled 3. Click row checkbox to select a row ✓ Row selected, Select enabled 4. Verify **Save** button ✓ Still disabled
**Expected**: Save button remains disabled regardless of row selection (no create-address function)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-012: Master Address button opens Select Customer Address dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open **Account and Address** tab ✓ 2. Click **Address** button in **Master Bill To Address** card (second Address button) ✓ 3. Verify dialog ✓ Same "Select Customer Address" dialog opens with same 7 addresses (Total Addresses: 7)
**Expected**: Both Venue and Master Address buttons open the same Select Customer Address dialog
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-013: Venue address display fields are read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open **Account and Address** tab ✓ 2. Verify fields below Address in Venue card ✓ City: "WEST HOLLYWOOD", State: "CA", Zip: "90048", Country: "United States" — all static text (no inputs or controls)
**Expected**: City, State, Zip, Country in Venue section are display-only; no edit controls
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-014: Master address display fields are read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open **Account and Address** tab ✓ 2. Verify fields below Address in Master card ✓ City: "WEST HOLLYWOOD", State: "CA", Zip: "90048", Country: "United States" — all static text
**Expected**: City, State, Zip, Country in Master Bill To Address are display-only
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-015: Phone 1 – required field shows inline error when cleared
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
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

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open **Account and Address** tab ✓ Phone 2 is empty 2. Click into **Phone 2**, clear it (already empty), blur ✓ 3. Verify **Phone 2** ✓ No error message, aria-invalid="false"
**Expected**: Phone 2 has no required validation; empty is valid
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-017: Save button disabled when no pending changes
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open **Account and Address** tab ✓ No changes made 2. Verify left-panel **Save** button ✓ disabled state
**Expected**: Save button starts disabled (no unsaved changes)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-018: Save button enables on field change
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
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

**Depends_On**: TC-LOC-ACC-001
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

**Depends_On**: TC-LOC-ACC-001
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

**Depends_On**: TC-LOC-ACC-001
**Reason**: MCP verification proved Phone 1 is account-linked. `fill` does not trigger the application dirty tracking for masked inputs. `pressSequentially` triggers dirty and save completes, but value always reverts to account phone on reload. The server overwrites Phone 1 with the account's phone number regardless of what was saved.
**Automatable**: No

---

## TC-LOC-ACC-022: Cancel Save dialog discards save without persisting
| Priority | Status | Type |
|----------|--------|------|
| P1 | Automated | Negative / State Transition |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Edit Phone 2 with test value ✓ Save enables 2. Click Save → Save Changes dialog appears 3. Click Cancel in dialog ✓ Dialog closes 4. Verify: Save still enabled, Phone 2 still has value (changes not committed) 5. Reload to discard (LR-026)
**Expected**: Cancel in Save Changes dialog dismisses without persisting; form stays dirty
**Data**: office=1604, phone=ACCOUNT_TEST_PHONE
**Automatable**: Yes

---

## TC-LOC-ACC-023: Phone 1 cleared shows invalid state and error icon
| Priority | Status | Type |
|----------|--------|------|
| P1 | Automated | Validation / Error Guessing |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Clear Phone 1, blur ✓ 2. Verify aria-invalid=true and error icon visible 3. Verify Save remains enabled (the application does NOT block save on invalid Phone 1 — MCP-verified) 4. Reload to restore baseline (LR-026)
**Expected**: Clearing Phone 1 shows validation indicators but does NOT disable Save
**Data**: office=1604
**Note**: Plan originally assumed invalid Phone 1 blocks Save. MCP proved otherwise — Save stays enabled.
**Automatable**: Yes

---

## TC-LOC-ACC-024: DROPPED — Unsaved Changes dialog on tab switch
| Priority | Status | Type |
|----------|--------|------|
| P1 | DROPPED | MCP-5 FAIL |

**Depends_On**: TC-LOC-ACC-001
**Reason**: MCP-5 verification failed. Dirty form + tab switch did NOT trigger an Unsaved Changes alertdialog. the application's tab navigation within the same component does not fire the unsaved changes guard for this page.
**Automatable**: No (behavior does not exist)

 Note: Per LR-021 (un-skip before rewrite), this TC needs to be un-DROPPED and re-attempted — the underlying behavior may have shipped between and. If dialog now appears on tab switch with dirty Account & Address form → automate per current canonical behavior; if still absent → leave DROPPED with updated reason citing re-verify. 


---

## TC-LOC-ACC-025: Account List Address filter returns matching results
| Priority | Status | Type |
|----------|--------|------|
| P2 | Automated | Decision Table |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open Account List dialog 2. Fill Address filter with "Beverly" 3. Click Search ✓ Results filtered 4. Verify results contain "Beverly" 5. Cancel dialog
**Expected**: Address filter returns accounts with matching address
**Data**: office=1604, address=Beverly
**Automatable**: Yes

---

## TC-LOC-ACC-026: Account List City filter returns matching results
| Priority | Status | Type |
|----------|--------|------|
| P2 | Automated | Decision Table |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open Account List dialog 2. Fill City filter with "LOS ANGELES" 3. Click Search ✓ Results filtered 4. Verify results contain "LOS ANGELES" 5. Cancel dialog
**Expected**: City filter returns accounts with matching city
**Data**: office=1604, city=LOS ANGELES
**Automatable**: Yes

---

## TC-LOC-ACC-027: Address selection changes venue display fields
| Priority | Status | Type |
|----------|--------|------|
| P1 | Automated | E2E Display |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Verify starting city is "WEST HOLLYWOOD" 2. Open Venue Address dialog 3. Select alternate address row (4200 E Palm Canyon Dr) 4. Verify city changed to "PALM SPRINGS" 5. Verify Save enables (form dirty) 6. Reload to discard — verify city restored to "WEST HOLLYWOOD"
**Expected**: Address selection updates display fields but changes are discarded on reload (the application does NOT serialize address changes into save payload — MCP-verified)
**Data**: office=1604, ALT_ADDRESS, ORIGINAL_ADDRESS
**Note**: Originally planned as persistence test (save+reload+verify). MCP proved address selection doesn't persist through save — display change only.
**Automatable**: Yes

---

## TC-LOC-ACC-028: Account selection changes venue name and persists
| Priority | Status | Type |
|----------|--------|------|
| P0 | Automated | RT + E2E |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Read current venue name (store for cleanup) 2. Open Account List → search current account → select (re-selecting triggers dirty) 3. Verify Save enables 4. Save and confirm 5. Reload → verify venue name persisted 6. Cleanup: if name changed, restore original account
**Expected**: Account selection applies, persists through save+reload
**Data**: office=1604, ACCOUNT_SEARCH
**Risk**: HIGH — changes venue fields. Wrapped in try/finally. Positioned LAST in serial block.
**Automatable**: Yes

---

## Granular Cases (field-coverage additions, 2026-05-29)

Source: `clients/encore/specs_planning/_internal/field-case-catalogs/account-address-2026-05-29.md` (exhaustive coverage ledger + full (field × case-class) gap matrix — every cell classified (a) net-new / (b) covered / (c) deferred). De-dup is by **proven outcome**, not exact action. Net-new = 3 (TC-029..031). The bulk of the editable surface is already covered (b) by TC-001..028; the un-automatable persistence behaviors (Phone 1 account-linked revert, address-selection non-persist, different-account persist) and the uncertain dropdown filters are deferred (c) with live evidence in the catalog.

### Net-new gap summary

| ID | Field | Case-class | Disposition |
|---|---|---|---|
| TC-LOC-ACC-029 | Phone 2 | clear (valid-empty) save-cycle → empty persists after reload | (a) net-new — **bug-blocked: BUG-LOC-ACC-001 (test.fixme)** |
| TC-LOC-ACC-030 | Account List Account **Number** filter | positive filter search | (a) net-new (verified live: AC000107 → "Parker Palm Springs") |
| TC-LOC-ACC-031 | Select Customer Address dialog search | filter clear-restores full row set | (a) net-new |

### Key deferrals (c) — see catalog §2/§5 for full list + evidence

- Phone 1 positive/edit/BVA/revert save — NOT-AUTOMATABLE (account-linked revert; TC-021 dropped).
- Account different-account persist — server-state-restore-not-deterministic (no ORIGINAL_ACCOUNT restore; STRICT-LINE-F contamination risk).
- Account List State / Country dropdown filters — discussion-item; result-semantics uncertain (CA selection returned 25 mixed-state rows live) + LR-025 flake.
- Tab-switch unsaved-changes dialog — NOT-AUTOMATABLE (TC-024 dropped; dialog does not appear).

---

## TC-LOC-ACC-029: Phone 2 cleared value persists empty after reload
| Priority | Status | Type |
|----------|--------|------|
| P1 | Bug-blocked (test.fixme) | Save-cycle / Field Coverage |

**Bug**: BUG-LOC-ACC-001 — clearing Phone 2 and saving does NOT persist empty; the prior value reappears on reload. This case asserts the CORRECT (fixed) behavior, so it is `test.fixme`'d (LR-034 Step 6). Un-fixme when the bug closes.
**Depends_On**: none (independent; no describe-wide baseline reset — `ensureDefaultState()` was removed from `beforeEach` because it cannot reset Phone 2 to empty while BUG-LOC-ACC-001 is open)
**Steps**: 1. Baseline: seed Phone 2 with a value and save (so a clear is a real change) 2. Clear Phone 2, blur ✓ Save enables 3. Click Save → confirm Save Changes dialog ("Ok") ✓ Save disables 4. Reload page + re-navigate to Account and Address tab 5. Verify ✓ Phone 2 is empty (cleared value persisted)
**Expected**: An optional field (Phone 2) can be cleared and the empty value persists through save + reload
**Data**: office=1604, TEST_PHONE2_VALUE (seed)
**Cleanup**: ensureDefaultState() — Phone 2 restored to baseline
**Automatable**: Blocked — un-fixme when BUG-LOC-ACC-001 is resolved

---

## TC-LOC-ACC-030: Account List Account Number filter returns matching account
| Priority | Status | Type |
|----------|--------|------|
| P2 | Automated | Decision Table / Field Coverage |

**Depends_On**: none (independent; per-test baseline via beforeEach)
**Steps**: 1. Open Account List dialog (Name button) 2. Fill **Account Number** filter with "AC000107" 3. Click Search ✓ Results filtered (poll ≤20s — server search) 4. Verify results contain "Parker Palm Springs" 5. Cancel dialog
**Expected**: The Account Number filter (4th text filter, previously uncovered) returns the matching account
**Data**: office=1604, accountNumber=AC000107 (verified live 2026-05-29 → exactly 1 row "Parker Palm Springs")
**Automatable**: Yes

---

## TC-LOC-ACC-031: Address dialog search filter then clear restores full set
| Priority | Status | Type |
|----------|--------|------|
| P2 | Automated | State Transition / Field Coverage |

**Depends_On**: none (independent; per-test baseline via beforeEach)
**Steps**: 1. Open Venue Address (Select Customer Address) dialog ✓ 7 rows (Total Addresses: 7) 2. Type "Beverly" in the search bar ✓ rows reduce (client-side filter) 3. Clear the search bar ✓ 4. Verify ✓ rows restore to the full 7-row set 5. Cancel dialog
**Expected**: Clearing the Address dialog client-side search restores the full unfiltered row set (complements TC-010 which proves the filter reduces)
**Data**: office=1604, filterTerm=Beverly
**Automatable**: Yes
