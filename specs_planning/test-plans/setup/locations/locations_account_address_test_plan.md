# Location Account and Address Test Plan
**Module**: locations | **Updated**: 2026-04-07
**Test Cases**: specs_planning/test-cases/locations/locations_account_address_test_cases.md

## Selector Mapping

| TC ID | Selector Keys Used |
|---|---|
| TC-LOC-ACC-001 | tabAccountAndAddress |
| TC-LOC-ACC-002 | tabAccountAndAddress, txtAccVenueName |
| TC-LOC-ACC-003 | tabAccountAndAddress, btnAccName, dlgAccountList, txtAccListAccountNumber, txtAccListAccountName, txtAccListAddress, txtAccListCity, drpAccListState, drpAccListCountry, btnAccListSearch, btnAccListReset, tblAccListResults |
| TC-LOC-ACC-004 | btnAccName, dlgAccountList, txtAccListAccountName, btnAccListSearch, tblAccListResults |
| TC-LOC-ACC-005 | btnAccName, dlgAccountList, btnAccListSelect, chkAccListRowSelect, txtAccListAccountName, btnAccListSearch |
| TC-LOC-ACC-006 | btnAccName, dlgAccountList, chkAccListRowSelect, btnAccListCancel, txtAccVenueName |
| TC-LOC-ACC-007 | btnAccName, dlgAccountList, txtAccListAccountName, btnAccListSearch, btnAccListReset, tblAccListResults |
| TC-LOC-ACC-008 | tabAccountAndAddress, btnAccVenueAddress, dlgSelectAddress, txtAddrSearch, tblAddrResults, btnAddrSelect, btnAddrCancel, btnAddrSave |
| TC-LOC-ACC-009 | dlgSelectAddress, btnAddrSelect, chkAddrRow |
| TC-LOC-ACC-010 | dlgSelectAddress, txtAddrSearch, tblAddrResults |
| TC-LOC-ACC-011 | dlgSelectAddress, btnAddrSave, chkAddrRow |
| TC-LOC-ACC-012 | tabAccountAndAddress, btnAccMasterAddress, dlgSelectAddress, tblAddrResults |
| TC-LOC-ACC-013 | tabAccountAndAddress |
| TC-LOC-ACC-014 | tabAccountAndAddress |
| TC-LOC-ACC-015 | tabAccountAndAddress, txtAccPhone1, errAccPhone1Required, btnSave, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-ACC-016 | tabAccountAndAddress, txtAccPhone2 |
| TC-LOC-ACC-017 | tabAccountAndAddress, btnSave |
| TC-LOC-ACC-018 | tabAccountAndAddress, txtAccPhone2, btnSave, dlgSaveChanges, btnSaveChangesCancel |
| TC-LOC-ACC-019 | txtAccPhone2, btnSave, dlgSaveChanges, txtSaveChangesMessage, btnSaveChangesConfirm |
| TC-LOC-ACC-020 | txtAccPhone2, btnSave, dlgSaveChanges, btnSaveChangesConfirm, tabAccountAndAddress |
| TC-LOC-ACC-021 | DROPPED — Phone 1 account-linked, NOT-AUTOMATABLE |
| TC-LOC-ACC-022 | txtAccPhone2, btnSaveAccountAddress, dlgSaveChanges, btnSaveChangesCancel |
| TC-LOC-ACC-023 | txtAccPhone1, btnSaveAccountAddress |
| TC-LOC-ACC-024 | DROPPED — MCP-5 FAIL, Unsaved Changes dialog does not appear |
| TC-LOC-ACC-025 | btnAccName, dlgAccountList, txtAccListAddress, btnAccListSearch, tblAccListResults, btnAccListCancel |
| TC-LOC-ACC-026 | btnAccName, dlgAccountList, txtAccListCity, btnAccListSearch, tblAccListResults, btnAccListCancel |
| TC-LOC-ACC-027 | dlgSelectAddress, tblAddrResults, btnAddrSelect, btnSaveAccountAddress |
| TC-LOC-ACC-028 | btnAccName, dlgAccountList, txtAccListAccountName, btnAccListSearch, chkAccListRowSelect, btnAccListSelect, btnSaveAccountAddress, dlgSaveChanges, btnSaveChangesConfirm |

## UI Testing Checklist

| Check | Status |
|---|---|
| selectorReconciliation | ✓ All 34 selectors verified on live DOM (shadow DOM pierced) |
| dialogSymmetry | ✓ ACC-006 cancel, ACC-011 Save always disabled, ACC-018 discard via cancel |
| explorationCleanup | ✓ No mutations during discovery; phone fields untouched |

---

## Scenario: TC-LOC-ACC-001 - Verify tab two-card layout
1. Step: tab[Account and Address].click(), expected: tabpanel "Account and Address" visible
2. Step: Verify generic:has-text("Venue/Branch Account") visible, expected: true
3. Step: Verify generic:has-text("Master Bill To Address") visible, expected: true

---

## Scenario: TC-LOC-ACC-002 - Verify Venue Name field is disabled
1. Step: tab[Account and Address].click(), expected: tabpanel loads
2. Step: Verify input[name="accountAndAddress.venueName"].isDisabled(), expected: true
3. Step: Verify input[name="accountAndAddress.venueName"].inputValue(), expected: "Parker Palm Springs"

---

## Scenario: TC-LOC-ACC-003 - Name button opens Account List dialog
1. Step: tab[Account and Address].click(), expected: tabpanel loads
2. Step: button:has-text("Name").click(), expected: dialog[Account List] visible
3. Step: Verify dialog contains textbox[Account Number], textbox[Account Name], textbox[Address], textbox[City], combobox[State], combobox[Country], expected: all present
4. Step: Verify button:has-text("Search") and button:has-text("Reset") in dialog, expected: visible
5. Step: Verify table visible in dialog, expected: present

---

## Scenario: TC-LOC-ACC-004 - Account List – search returns results
1. Step: button:has-text("Name").click(), expected: dialog[Account List] opens
2. Step: textbox[Account Name].fill("Parker"), expected: value set
3. Step: button:has-text("Search").click(), expected: table updates
4. Step: Verify tbody tr containing "AC000107" and "Parker Palm Springs", expected: visible

---

## Scenario: TC-LOC-ACC-005 - Account List – Select button disabled until row checked
1. Step: Open Account List dialog, search "Parker", expected: results visible
2. Step: Verify button:has-text("Select").isDisabled(), expected: true
3. Step: tbody tr:first-child td:first-child button[role="checkbox"].click(), expected: aria-checked="true"
4. Step: Verify button:has-text("Select").isDisabled(), expected: false

---

## Scenario: TC-LOC-ACC-006 - Account List – Cancel closes without changes
1. Step: Open Account List dialog, check row ✓ Select enabled
2. Step: button:has-text("Cancel").click(), expected: dialog closed
3. Step: input[name="accountAndAddress.venueName"].inputValue(), expected: "Parker Palm Springs" unchanged

---

## Scenario: TC-LOC-ACC-007 - Account List – Reset clears search fields
1. Step: Open Account List dialog, fill textbox[Account Name]="Parker", click Search, expected: results load
2. Step: button:has-text("Reset").click(), expected: textbox[Account Name] = ""
3. Step: Verify tbody row content, expected: "No results." row

---

## Scenario: TC-LOC-ACC-008 - Venue Address button opens Select Customer Address dialog
1. Step: tab[Account and Address].click(), expected: tabpanel loads
2. Step: term button:has-text("Address").first().click(), expected: dialog[Select Customer Address] visible
3. Step: Verify input[placeholder="Search..."] visible, expected: true
4. Step: Verify tbody tr.count(), expected: 7 rows
5. Step: Verify button:has-text("Select"), button:has-text("Cancel"), button:has-text("Save"), expected: all visible

---

## Scenario: TC-LOC-ACC-009 - Address dialog – Select button disabled until row checked
1. Step: Open Select Customer Address dialog, expected: visible
2. Step: Verify button:has-text("Select").isDisabled(), expected: true
3. Step: tbody tr:first-child td:first-child button[role="checkbox"].click(), expected: data-state="checked"
4. Step: Verify button:has-text("Select").isDisabled(), expected: false

---

## Scenario: TC-LOC-ACC-010 - Address dialog – Search bar filters results client-side
1. Step: Open Select Customer Address dialog, expected: 7 rows
2. Step: input[placeholder="Search..."].fill("Beverly"), expected: rows filter
3. Step: Verify tbody tr.count(), expected: less than 7 (filter applied)
4. Step: Verify first visible row contains "Beverly", expected: true

---

## Scenario: TC-LOC-ACC-011 - Address dialog – Save button always disabled
1. Step: Open Select Customer Address dialog, expected: visible
2. Step: Verify button:has-text("Save").isDisabled(), expected: true
3. Step: Click row checkbox to select ✓ Select enabled
4. Step: Verify button:has-text("Save").isDisabled(), expected: still true

---

## Scenario: TC-LOC-ACC-012 - Master Address button opens Select Customer Address dialog
1. Step: tab[Account and Address].click(), expected: tabpanel loads
2. Step: term button:has-text("Address").last().click(), expected: dialog[Select Customer Address] visible
3. Step: Verify tbody tr.count(), expected: 7 rows (same dialog, same data)

---

## Scenario: TC-LOC-ACC-013 - Venue address display fields are read-only
1. Step: tab[Account and Address].click(), expected: tabpanel loads
2. Step: Verify definition containing "WEST HOLLYWOOD" (first occurrence) — no input child, expected: true (read-only text)
3. Step: Verify definitions: CA, 90048, United States in Venue card, expected: static text only

---

## Scenario: TC-LOC-ACC-014 - Master address display fields are read-only
1. Step: tab[Account and Address].click(), expected: tabpanel loads
2. Step: Verify definition containing "WEST HOLLYWOOD" (second occurrence, Master card) — no input child, expected: true
3. Step: Verify definitions: CA, 90048, United States in Master card, expected: static text only

---

## Scenario: TC-LOC-ACC-015 - Phone 1 required field shows inline error when cleared
1. Step: tab[Account and Address].click(), expected: tabpanel loads
2. Step: input[name="accountAndAddress.contactPhone1"].clear(), expected: empty
3. Step: input[name="accountAndAddress.contactPhone1"].blur(), expected: aria-invalid="true"
4. Step: Verify input[name="accountAndAddress.contactPhone1"] ~ p, expected: text "Required" visible
5. Step: Restore: input.fill("760-883-1957"), save and confirm

---

## Scenario: TC-LOC-ACC-016 - Phone 2 optional, no validation error when empty
1. Step: tab[Account and Address].click(), expected: Phone 2 is empty
2. Step: input[name="accountAndAddress.contactPhone2"].click(), blur, expected: no error paragraph
3. Step: Verify input[name="accountAndAddress.contactPhone2"].getAttribute("aria-invalid"), expected: "false"

---

## Scenario: TC-LOC-ACC-017 - Save button disabled when no pending changes
1. Step: tab[Account and Address].click(), expected: tabpanel loads with no changes
2. Step: Verify button:has-text("Save") in left panel, expected: isDisabled() = true

---

## Scenario: TC-LOC-ACC-018 - Save button enables on field change
1. Step: tab[Account and Address].click(), expected: Save disabled
2. Step: input[name="accountAndAddress.contactPhone2"].fill("test"), expected: value set
3. Step: Verify button:has-text("Save"), expected: isDisabled() = false
4. Step: Cleanup: button[Cancel] in Save Changes dialog

---

## Scenario: TC-LOC-ACC-019 - Save flow – confirmation dialog then success
1. Step: Edit Phone 2 (any value), expected: Save enabled
2. Step: button:has-text("Save").click(), expected: dialog[Save Changes] visible with "Are you sure you want to save the changes?"
3. Step: dialog[Save Changes] button:has-text("Save").click(), expected: dialog closes
4. Step: Verify button:has-text("Save"), expected: isDisabled() = true (no pending changes)
5. Step: Cleanup: restore Phone 2 to empty, re-save

---

## Scenario: TC-LOC-ACC-020 - Save changes persist after page reload
1. Step: Edit Phone 2 = "555-000-test", save and confirm, expected: successful
2. Step: page.reload(), expected: page reloads
3. Step: tab[Account and Address].click(), expected: tabpanel loads
4. Step: input[name="accountAndAddress.contactPhone2"].inputValue(), expected: "555-000-test"
5. Step: Verify button:has-text("Save").isDisabled(), expected: true
6. Step: Cleanup: restore Phone 2 to empty baseline

---

## Scenario: TC-LOC-ACC-021 - DROPPED (Phone 1 round-trip)
DROPPED: MCP verification (2026-04-07) proved Phone 1 is account-linked. Save completes but value always reverts to account phone on reload. NOT-AUTOMATABLE.

---

## Scenario: TC-LOC-ACC-022 - Cancel Save dialog discards save without persisting
1. Step: fillPhone2(ACCOUNT_TEST_PHONE), expected: Save enables
2. Step: openSaveDialog(), expected: Save Changes dialog visible
3. Step: cancelSaveDialog(), expected: dialog closes
4. Step: Verify isSaveEnabled() == true, getPhone2Value() == ACCOUNT_TEST_PHONE
5. Step: reloadAndNavigate(OFFICE_NO), expected: changes discarded (LR-026)

---

## Scenario: TC-LOC-ACC-023 - Phone 1 cleared shows invalid state and error icon
1. Step: clearPhone1AndBlur(), expected: Phone 1 empty
2. Step: Verify isPhone1Invalid() == true, isPhone1ErrorIconVisible() == true
3. Step: Verify isSaveEnabled() == true (Angular does NOT block save on invalid Phone 1)
4. Step: reloadAndNavigate(OFFICE_NO), expected: baseline restored (LR-026)

---

## Scenario: TC-LOC-ACC-024 - DROPPED (Unsaved Changes dialog)
DROPPED: MCP-5 verification (2026-04-07) failed. Dirty form + tab switch did NOT trigger Unsaved Changes alertdialog.

---

## Scenario: TC-LOC-ACC-025 - Account List Address filter returns matching results
1. Step: openAccountListDialog(), expected: dialog visible
2. Step: searchAccountByAddress('Beverly'), expected: results filtered
3. Step: expect.poll accountListResultsContain('Beverly'), expected: true
4. Step: cancelAccountListDialog(), expected: dialog closes

---

## Scenario: TC-LOC-ACC-026 - Account List City filter returns matching results
1. Step: openAccountListDialog(), expected: dialog visible
2. Step: searchAccountByCity('LOS ANGELES'), expected: results filtered
3. Step: expect.poll accountListResultsContain('LOS ANGELES'), expected: true
4. Step: cancelAccountListDialog(), expected: dialog closes

---

## Scenario: TC-LOC-ACC-027 - Address selection changes venue display fields
1. Step: expect.poll getVenueCityText() == ORIGINAL_ADDRESS.city, expected: 'WEST HOLLYWOOD'
2. Step: openVenueAddressDialog(), selectAddressRow(ALT_ADDRESS.address1), expected: dialog closes
3. Step: expect.poll getVenueCityText() == ALT_ADDRESS.city, expected: 'PALM SPRINGS'
4. Step: expect.poll isSaveEnabled() == true, expected: form dirty
5. Step: reloadAndNavigate(OFFICE_NO), expected: display restored to original
6. Step: expect.poll getVenueCityText() == ORIGINAL_ADDRESS.city, expected: 'WEST HOLLYWOOD'

---

## Scenario: TC-LOC-ACC-028 - Account selection changes venue name and persists
1. Step: getVenueNameValue(), store as originalName
2. Step: openAccountListDialog(), searchAccountByName(ACCOUNT_SEARCH.term), expected: results
3. Step: selectAccountListFirstRow(), expected: dialog closes, account applied
4. Step: expect.poll isSaveEnabled() == true, expected: form dirty
5. Step: clickSave(), expected: save completes, Save disabled
6. Step: reloadAndNavigate(OFFICE_NO), expected: page reloads
7. Step: expect.poll getVenueNameValue() == originalName, expected: persisted
8. Step: finally: if name changed, restore original account via Account List
