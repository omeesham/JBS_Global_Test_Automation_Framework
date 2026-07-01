# Location Account and Address Test Cases
**Module**: locations | **Total**: 33 | **Status**: Partial | **Updated**: 2026-06-11

> **2026-06-11 (SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC)**: the **Master Bill To Address** launcher was only proven to OPEN the shared "Select Customer Address" dialog (TC-012). The per-launcher select→Master-field-update→persist cycle was an uncovered gap (the same dialog persists from the Master launcher but NOT from the Venue launcher — ACC-027; per-launcher divergence proven live, LR-057). 2 net-new TCs added (TC-LOC-ACC-032..033); TC-012/014 notes extended. Evidence: `_internal/walk-evidence-account-address-master-bill-to-2026-06-11.md`; catalog `_internal/field-case-catalogs/launcher-dialogs-2026-06-11.md`.

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
**Steps**: 1. Navigate to Setup > Location > 1604 and open the "Account and Address" tab. 2. Verify two side-by-side cards are visible: the left card is "Venue/Branch Account" and the right card is "Master Bill To Address".
**Expected**: Two distinct cards visible with correct section headers
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-002: Verify Venue Name field is disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Account and Address" tab. 2. Locate the "Name" row in the Venue/Branch Account section. Confirm the textbox is visible. 3. Verify the textbox is disabled (not editable) and shows the value "Parker Palm Springs".
**Expected**: Name textbox is always disabled; cannot be typed in directly
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-003: Name button opens Account List dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Account and Address" tab. 2. Click the "Name" button in the Venue/Branch Account section. Confirm the dialog opens. 3. Verify the dialog title reads "Account List" and shows search filters for Account Number, Account Name, Address, City, State, and Country, along with "Search" and "Reset" buttons and a results table.
**Expected**: Account List dialog opens with search filters and result table
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-004: Account List – search returns results
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Click the "Name" button to open the Account List dialog. 2. Type "Parker" in the "Account Name" field. 3. Click "Search". Confirm the results table updates. 4. Verify a row showing "AC000107 Parker Palm Springs" is visible in the results.
**Expected**: Searching by account name returns matching account records
**Data**: office=1604, searchTerm=Parker
**Automatable**: Yes

---

## TC-LOC-ACC-005: Account List – Select button disabled until row checked
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the Account List dialog, search for "Parker", and click "Search". Confirm 1 result is shown. 2. Verify the "Select" button is disabled. 3. Click the row checkbox in the first cell. Confirm the checkbox is checked. 4. Verify the "Select" button is now enabled.
**Expected**: Select button only enables after a row is checked via row checkbox
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-006: Account List – Cancel closes without changes
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the Account List dialog and search for results. 2. Check a row. Confirm "Select" becomes enabled. 3. Click "Cancel". Confirm the dialog closes. 4. Verify the "Name" textbox still shows "Parker Palm Springs" (unchanged).
**Expected**: Cancel dismisses dialog without updating the Name field
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-007: Account List – Reset clears search fields
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the Account List dialog. 2. Enter "Parker" in "Account Name" and click "Search". Confirm results load. 3. Click "Reset". 4. Verify all search fields are now empty and the table shows "No results."
**Expected**: Reset clears all filter inputs and results table
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-008: Venue Address button opens Select Customer Address dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Account and Address" tab. 2. Click the "Address" button in the Venue/Branch Account section (the first Address button). Confirm the dialog opens. 3. Verify the dialog title reads "Select Customer Address" and shows a search bar, sortable columns (Address 1/2/3, City, State, Zip Code, Country), 7 address rows, and "Select", "Cancel", "Save", and "Close" buttons; "Total Addresses: 7" should appear in the footer.
**Expected**: Select Customer Address dialog opens with 7 address records (Total Addresses: 7 in footer)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-009: Address dialog – Select button disabled until row checked
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Select Customer Address" dialog. 2. Verify the "Select" button is disabled. 3. Click the row checkbox in the first cell. Confirm the checkbox is checked. 4. Verify the "Select" button is now enabled.
**Expected**: Select button only enables when a row checkbox is checked
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-010: Address dialog – Search bar filters results as you type
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Select Customer Address" dialog. Confirm 7 rows are visible (Total Addresses: 7). 2. Type "Beverly" in the search bar. 3. Verify the rows are filtered to 1 matching row containing "Beverly" (8899 Beverly Blvd Ste 412). The footer row should still be visible.
**Expected**: Search bar filters the visible rows instantly as you type; "Beverly" matches 1 of 7 addresses
**Data**: office=1604, filterTerm=Beverly
**Automatable**: Yes

---

## TC-LOC-ACC-011: Address dialog – Save button always disabled
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Select Customer Address" dialog. 2. Verify the "Save" button is disabled. 3. Click the row checkbox to select a row. Confirm the row is selected and the "Select" button becomes enabled. 4. Verify the "Save" button is still disabled.
**Expected**: Save button remains disabled regardless of row selection (no create-address function)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-012: Master Address button opens Select Customer Address dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Account and Address" tab. 2. Click the "Address" button in the "Master Bill To Address" card (the second Address button). 3. Verify the same "Select Customer Address" dialog opens with the same 7 addresses (Total Addresses: 7).
**Expected**: Both Venue and Master Address buttons open the same Select Customer Address dialog
**Data**: office=1604
**Notes**: This TC proves the dialog OPENS from the Master launcher (open-only). The Master launcher's **select → Master-field-update → persist** cycle is covered by the net-new TC-LOC-ACC-032/033 (per-launcher coverage, LR-057 — opening alone is not select-cycle coverage).
**Automatable**: Yes

---

## TC-LOC-ACC-013: Venue address display fields are read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Account and Address" tab. 2. Verify the fields below "Address" in the Venue card show City: "WEST HOLLYWOOD", State: "CA", Zip: "90048", Country: "United States" — all as static text with no input controls.
**Expected**: City, State, Zip, Country in Venue section are display-only; no edit controls
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-014: Master address display fields are read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Account and Address" tab. 2. Verify the fields below "Address" in the Master card show City: "WEST HOLLYWOOD", State: "CA", Zip: "90048", Country: "United States" — all as static text.
**Expected**: City, State, Zip, Country in Master Bill To Address are display-only (cannot be typed into directly)
**Data**: office=1604
**Notes**: "Read-only in place" understates: these display values are **launcher-mutable** — selecting a different address via the Master Address launcher updates them and the change persists (TC-LOC-ACC-032/033). Read-only means no direct typing, NOT immutable.
**Automatable**: Yes

---

## TC-LOC-ACC-015: Phone 1 – required field shows inline error when cleared
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Account and Address" tab. Confirm "Phone 1" shows "760-883-1957". 2. Clear the "Phone 1" field. 3. Click outside the field to move focus away. 4. Verify "Phone 1" shows a validation error: the field is marked invalid and a "Required" error message appears below it.
**Expected**: Phone 1 shows "Required" error inline after clicking outside the field when empty; aria-invalid set
**Data**: office=1604

**Cleanup**: Restore Phone 1 to "760-883-1957", save
**Automatable**: Yes

---

## TC-LOC-ACC-016: Phone 2 – optional, no validation error when empty
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Account and Address" tab. Confirm "Phone 2" is empty. 2. Click into "Phone 2", clear it (it is already empty), and click outside the field to move focus away. 3. Verify "Phone 2" shows no error message and is not marked invalid.
**Expected**: Phone 2 has no required validation; empty is valid
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-017: Save button disabled when no pending changes
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Account and Address" tab without making any changes. 2. Verify the left-panel "Save" button is in a disabled state.
**Expected**: Save button starts disabled (no unsaved changes)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-ACC-018: Save button enables on field change
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the "Account and Address" tab. Confirm the "Save" button is disabled. 2. Edit the "Phone 2" field by typing any value. 3. Verify the "Save" button is now enabled.

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
**Steps**: 1. Edit "Phone 2" to "555-000-0001". Confirm "Save" becomes enabled. 2. Click "Save". Confirm the "Save Changes" dialog appears with the message "Are you sure you want to save the changes?" and "Cancel" and "Save" buttons. 3. Click "Save" in the dialog. 4. Verify the "Save" button is now disabled (clean state).
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
**Steps**: 1. Edit "Phone 2", click "Save", and confirm the dialog. Confirm the data is saved. 2. Reload the page. 3. Navigate to the "Account and Address" tab. 4. Verify "Phone 2" shows the saved value and the "Save" button is disabled.
**Expected**: Saved data persists after full page reload
**Data**: office=1604

**Cleanup**: Restore Phone 2 to empty baseline after verification

**Automatable**: Yes

---

## TC-LOC-ACC-021: Verify Phone 1 reverts to the account phone after save and reload
| Priority | Status | Type |
|----------|--------|------|
| P1 | Manual | Persistence |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Edit "Phone 1" with a test value and click outside the field to move focus away. 2. Confirm "Save" becomes enabled, click "Save", and confirm the "Save Changes" dialog with "Save". 3. Reload the page and reopen the Account and Address tab. 4. Read the "Phone 1" value.
**Expected**: Phone 1 does not keep a manually entered value. After save and reload it shows the account's phone number, because Phone 1 is linked to the account.
**Automatable**: No

---

## TC-LOC-ACC-022: Cancel Save dialog discards save without persisting
| Priority | Status | Type |
|----------|--------|------|
| P1 | Automated | Negative / State Transition |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Edit "Phone 2" with a test value. Confirm "Save" becomes enabled. 2. Click "Save". Confirm the "Save Changes" dialog appears. 3. Click "Cancel" in the dialog. Confirm the dialog closes. 4. Verify "Save" is still enabled and "Phone 2" still shows the typed value (changes not committed). 5. Reload the page to discard changes.
**Expected**: Cancel in Save Changes dialog dismisses without persisting; unsaved changes remain
**Data**: office=1604, phone=ACCOUNT_TEST_PHONE
**Automatable**: Yes

---

## TC-LOC-ACC-023: Phone 1 cleared shows invalid state and error icon
| Priority | Status | Type |
|----------|--------|------|
| P1 | Automated | Validation / Error Guessing |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Clear "Phone 1" and click outside the field to move focus away. 2. Verify the field is marked invalid and the error icon is visible. 3. Verify "Save" remains enabled (the application does not block save on an invalid Phone 1). 4. Reload the page to restore the baseline.
**Expected**: Clearing Phone 1 shows validation indicators but does NOT disable Save
**Data**: office=1604
**Note**: Plan originally assumed invalid Phone 1 blocks Save. MCP proved otherwise — Save stays enabled.
**Automatable**: Yes

---

## TC-LOC-ACC-024: Switching tabs with unsaved changes does not warn
| Priority | Status | Type |
|----------|--------|------|
| P1 | Manual | State Transition |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Edit "Phone 2" with a test value so "Save" becomes enabled (the form now has unsaved changes). 2. Without saving, switch to a different tab on the page. 3. Observe whether an "Unsaved Changes" warning appears. 4. Reload the page to discard the changes.
**Expected**: Switching tabs with unsaved changes does not show an "Unsaved Changes" warning on this page. The edit stays in the form until you save or reload.
**Automatable**: No


---

## TC-LOC-ACC-025: Account List Address filter returns matching results
| Priority | Status | Type |
|----------|--------|------|
| P2 | Automated | Decision Table |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the Account List dialog. 2. Fill the "Address" filter with "Beverly". 3. Click "Search". Confirm the results are filtered. 4. Verify the results contain "Beverly". 5. Cancel the dialog.
**Expected**: Address filter returns accounts with matching address
**Data**: office=1604, address=Beverly
**Automatable**: Yes

---

## TC-LOC-ACC-026: Account List City filter returns matching results
| Priority | Status | Type |
|----------|--------|------|
| P2 | Automated | Decision Table |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Open the Account List dialog. 2. Fill the "City" filter with "LOS ANGELES". 3. Click "Search". Confirm the results are filtered. 4. Verify the results contain "LOS ANGELES". 5. Cancel the dialog.
**Expected**: City filter returns accounts with matching city
**Data**: office=1604, city=LOS ANGELES
**Automatable**: Yes

---

## TC-LOC-ACC-027: Address selection changes venue display fields
| Priority | Status | Type |
|----------|--------|------|
| P1 | Automated | E2E Display |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Verify starting city is "WEST HOLLYWOOD" 2. Open Venue Address dialog 3. Select alternate address row (4200 E Palm Canyon Dr) 4. Verify city changed to "PALM SPRINGS" 5. Verify Save becomes enabled 6. Reload to discard — verify city restored to "WEST HOLLYWOOD"
**Expected**: Address selection updates display fields but changes are discarded on reload (the address change is not actually saved, so it is lost on reload — MCP-verified)
**Data**: office=1604, ALT_ADDRESS, ORIGINAL_ADDRESS
**Note**: Originally planned as persistence test (save+reload+verify). MCP proved address selection doesn't persist through save — display change only.
**Automatable**: Yes

---

## TC-LOC-ACC-028: Account selection changes venue name and persists
| Priority | Status | Type |
|----------|--------|------|
| P0 | Automated | RT + E2E |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Read the current venue name and store it for cleanup. 2. Open the Account List, search for the current account, and select it (re-selecting triggers dirty state). 3. Verify "Save" becomes enabled. 4. Click "Save" and confirm. 5. Reload the page and verify the venue name persisted. 6. Cleanup: if the name changed, restore the original account.
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
**Steps**: 1. Baseline: seed "Phone 2" with a value and save (so that clearing it is a real change). 2. Clear "Phone 2" and click outside the field to move focus away. Confirm "Save" becomes enabled. 3. Click "Save" and confirm the "Save Changes" dialog. Confirm "Save" becomes disabled. 4. Reload the page and navigate back to the "Account and Address" tab. 5. Verify "Phone 2" is empty (the cleared value persisted).
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
**Steps**: 1. Open the Account List dialog via the "Name" button. 2. Fill the "Account Number" filter with "AC000107". 3. Click "Search". Confirm the results are filtered (allow up to 20 seconds for the server search). 4. Verify the results contain "Parker Palm Springs". 5. Cancel the dialog.
**Expected**: The Account Number filter (the 4th text filter) returns the matching account
**Data**: office=1604, accountNumber=AC000107 (verified live 2026-05-29 → exactly 1 row "Parker Palm Springs")
**Automatable**: Yes

---

## TC-LOC-ACC-031: Address dialog search filter then clear restores full set
| Priority | Status | Type |
|----------|--------|------|
| P2 | Automated | State Transition / Field Coverage |

**Depends_On**: none (independent; per-test baseline via beforeEach)
**Steps**: 1. Open the "Select Customer Address" dialog from the Venue "Address" button. Confirm 7 rows are visible (Total Addresses: 7). 2. Type "Beverly" in the search bar. Confirm the rows are reduced by the filter. 3. Clear the search bar. 4. Verify the rows restore to the full 7-row set. 5. Cancel the dialog.
**Expected**: Clearing the Address dialog's search restores the full unfiltered row set
**Data**: office=1604, filterTerm=Beverly
**Automatable**: Yes

---

## Net-new Master Bill To launcher TCs (2026-06-11 — SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC)

Source catalog: `_internal/field-case-catalogs/launcher-dialogs-2026-06-11.md` (Workstream B — per-launcher gap matrix). The **Master Bill To Address** launcher (`btnAccMasterAddress`) opens the **same** "Select Customer Address" dialog as the Venue launcher, but its selection behaves DIFFERENTLY: a Master-side selection updates the Master display `dd`s (leaving Venue unchanged) **and persists** through save+reload — whereas the Venue selection does NOT persist (TC-027). Live-verified 2026-06-11 (Playwright CLI, office 1604) with a supervised save-restore probe (`billToAddress` 8899 Beverly → 4200 E Palm Canyon → 8899 Beverly, restored). Evidence: `_internal/walk-evidence-account-address-master-bill-to-2026-06-11.md`.

## TC-LOC-ACC-032: Master Bill To selection updates only the Master display and enables Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Launcher / Field Interaction |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Verify the Master Bill To display shows the original address (City "WEST HOLLYWOOD"). 2. Open the "Master" Address dialog. 3. Select the alternate address row "4200 E Palm Canyon Dr" (PALM SPRINGS), then click "Select" and confirm the dialog closes. 4. Verify the "Master" display fields update (City now shows "PALM SPRINGS"). 5. Verify the "Venue/Branch" display is UNCHANGED (still "WEST HOLLYWOOD") — the Master selection is isolated from Venue. 6. Verify the left-panel "Save" is enabled (there are unsaved changes). 7. Reload the page WITHOUT saving and verify the Master display reverts to the original address (no persist without save).
**Expected**: Selecting an address from the "Master" picker dialog updates ONLY the Master display fields (Venue is untouched) and enables Save; reloading without saving discards the change.
**Data**: office=1604, ALT_ADDRESS (4200 E Palm Canyon Dr / PALM SPRINGS), MASTER_BILL_TO_ORIGINAL (8899 Beverly Blvd Ste 412 / WEST HOLLYWOOD)
**Notes**: Master isolation from Venue is the key assertion (both cards point at the same street address by default, so a naive read would not catch a cross-write). Display-update WITHOUT mutating the saved value (discard via reload). Persistence is TC-033.
**MCP_VERIFICATION_LOG**: `walk-evidence-account-address-master-bill-to-2026-06-11.md` §Select→update→persistence step 2 ("Master display `dd`s UPDATE … Venue/Branch display UNCHANGED … Page Save enables").
**Automatable**: Yes

---

## TC-LOC-ACC-033: Master Bill To selection persists through save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Launcher / Persistence |

**Depends_On**: TC-LOC-ACC-001
**Steps**: 1. Confirm the Master display is anchored at the original address (8899 Beverly Blvd Ste 412 / WEST HOLLYWOOD) before any change. 2. Open the Master Address dialog, select "4200 E Palm Canyon Dr", then click "Save" and confirm "Save Changes" (Ok). 3. Reload the page and verify the Master Bill To now shows "PALM SPRINGS" with the address "4200 E Palm Canyon Dr". 4. Restore: open the Master Address dialog again, select "8899 Beverly Blvd Ste 412", click "Save" and confirm (Ok), reload the page, and verify all five Master values (address, city, state, zip, country) are back to the anchored original.
**Expected**: A Master Bill To selection persists through save and reload — unlike the Venue address selection, which does not persist. Same dialog, opposite persistence per picker dialog. Office 1604 is restored to its anchored original (8899 Beverly Blvd Ste 412), so nothing leaks.
**Data**: office=1604, MASTER_BILL_TO_ORIGINAL, ALT_ADDRESS
**Notes**: Implemented via the field-coverage runner (`saveAndVerifyCase`, LR-019 compile-required baseline). Restore-by-anchor (re-select the unique "8899 Beverly Blvd Ste 412" row) lives in the case `cleanup` + `finally`. Save endpoint `PUT /navigator/api/location/update-properties` (LR-056). No bug filed — Master persistence WORKS; the Venue non-persist (ACC-027) is the open question for the account-address audit, not this subplan.
**MCP_VERIFICATION_LOG**: `walk-evidence-account-address-master-bill-to-2026-06-11.md` §Select→update→persistence steps 4-5 ("billToAddress.address1 === '4200 E Palm Canyon Dr' → PERSISTS … Restore … id === 8ad746d8-… ✅").
**Automatable**: Yes
