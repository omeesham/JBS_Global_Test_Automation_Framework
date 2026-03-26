# Location Account and Address Test Plan
**Module**: locations | **Updated**: 2026-02-19
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
4. Step: Verify tbody tr.count(), expected: 8 rows
5. Step: Verify button:has-text("Select"), button:has-text("Cancel"), button:has-text("Save"), expected: all visible

---

## Scenario: TC-LOC-ACC-009 - Address dialog – Select button disabled until row checked
1. Step: Open Select Customer Address dialog, expected: visible
2. Step: Verify button:has-text("Select").isDisabled(), expected: true
3. Step: tbody tr:first-child td:first-child button[role="checkbox"].click(), expected: data-state="checked"
4. Step: Verify button:has-text("Select").isDisabled(), expected: false

---

## Scenario: TC-LOC-ACC-010 - Address dialog – Search bar filters results client-side
1. Step: Open Select Customer Address dialog, expected: 8 rows
2. Step: input[placeholder="Search..."].fill("Beverly"), expected: rows filter
3. Step: Verify tbody tr.count(), expected: less than 8 (filter applied)
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
3. Step: Verify tbody tr.count(), expected: 8 rows (same dialog, same data)

---

## Scenario: TC-LOC-ACC-013 - Venue address display fields are read-only
1. Step: tab[Account and Address].click(), expected: tabpanel loads
2. Step: Verify definition containing "PALM SPRINGS" (first occurrence) — no input child, expected: true (read-only text)
3. Step: Verify definitions: CA, 92264, United States in Venue card, expected: static text only

---

## Scenario: TC-LOC-ACC-014 - Master address display fields are read-only
1. Step: tab[Account and Address].click(), expected: tabpanel loads
2. Step: Verify definition containing "PALM SPRINGS" (second occurrence, Master card) — no input child, expected: true
3. Step: Verify definitions: CA, 92264, United States in Master card, expected: static text only

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
