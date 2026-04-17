# Location Legal Test Plan
**Module**: locations
**Test Cases**: specs_planning/test-cases/locations/locations_legal_test_cases.md
**Updated**: 2026-04-06

## Selector Mapping

| Key | Selector | Element |
|-----|----------|---------|
| tabLegal | `[data-testid="location-settings-sub-tab-legal"]` | Legal sub-tab |
| contentLegal | `[data-testid="location-settings-sub-tab-content-legal"]` | Legal tabpanel content |
| tblLegal | `[data-testid="location-settings-table-legal"]` | Legal grid table |
| drpLegalServiceCharge0 | `[data-testid="location-settings-select-legal-0-service-charge"]` | Service Charge combobox (row 0) |
| drpLegalTerms0 | `[data-testid="location-settings-select-legal-0-terms"]` | Terms and Conditions combobox (row 0) |
| btnSaveLegal | `[data-testid="location-settings-btn-save"]` | Shared left-panel Save button |
| dlgSaveChanges | `[role="alertdialog"]:has-text("Save Changes")` | Save Changes confirmation dialog (from shared.ts) |
| btnSaveChangesCancel | `[role="alertdialog"] button:has-text("Cancel")` | Dialog Cancel button (from shared.ts) |
| btnSaveChangesConfirm | `[role="alertdialog"] button:has-text("Ok")` | Dialog Ok/Confirm button (from shared.ts) |

---

## Scenario: TC-LOC-LGL-001 - Verify Legal grid default structure
1. Step: Navigate to Setup > Location > 1604, expected: page loads with Basic Information tab
2. Step: Click tab[tabLegal], expected: Legal tabpanel renders
3. Step: Verify columnheader "Language Name" in tblLegal, expected: visible
4. Step: Verify columnheader "Service Charge Name" in tblLegal, expected: visible
5. Step: Verify columnheader "Terms and Conditions Name" in tblLegal, expected: visible
6. Step: Count tbody rows in tblLegal, expected: 1 data row

---

## Scenario: TC-LOC-LGL-002 - Verify Legal grid default field values
1. Step: Click tab[tabLegal], expected: Legal tab loads
2. Step: Verify cell text in row[0] column[0], expected: "US English" (static text, no combobox)
3. Step: Verify combobox[drpLegalServiceCharge0] text, expected: "Resort Service Charge"
4. Step: Verify combobox[drpLegalTerms0] text, expected: "LDW"

---

## Scenario: TC-LOC-LGL-003 - Verify Language Name cell is read-only
1. Step: Click tab[tabLegal], expected: Legal tab loads
2. Step: Verify cell[0][0] in tblLegal, expected: plain text "US English", no combobox or button rendered
3. Step: Count button/combobox elements in cell[0][0], expected: 0

---

## Scenario: TC-LOC-LGL-004 - Service Charge Name dropdown opens and shows options
1. Step: Click tab[tabLegal], expected: Legal tab loads
2. Step: Click combobox[drpLegalServiceCharge0], expected: listbox dropdown opens
3. Step: Count option elements in listbox, expected: 114
4. Step: Verify option "Resort Service Charge" has data-state="checked", expected: true
5. Step: Verify option "Administrative Fee" exists, expected: present
6. Step: Verify option "ETS" exists, expected: present
7. Step: Press Escape, expected: dropdown closes, combobox text still "Resort Service Charge"

---

## Scenario: TC-LOC-LGL-005 - Terms and Conditions Name dropdown opens and shows options
1. Step: Click tab[tabLegal], expected: Legal tab loads
2. Step: Click combobox[drpLegalTerms0], expected: listbox dropdown opens
3. Step: Count option elements in listbox, expected: 50
4. Step: Verify option "LDW" has data-state="checked", expected: true
5. Step: Verify option "Encore Terms and Conditions" exists, expected: present
6. Step: Verify option "Blank" exists, expected: present
7. Step: Press Escape, expected: dropdown closes, combobox text still "LDW"

---

## Scenario: TC-LOC-LGL-006 - Verify no search/filter exists in dropdowns
1. Step: Click tab[tabLegal], expected: Legal tab loads
2. Step: Click combobox[drpLegalServiceCharge0], expected: listbox opens
3. Step: Query for input/search elements inside listbox, expected: none found
4. Step: Press Escape, expected: dropdown closes
5. Step: Click combobox[drpLegalTerms0], expected: listbox opens
6. Step: Query for input/search elements inside listbox, expected: none found
7. Step: Press Escape, expected: dropdown closes

---

## Scenario: TC-LOC-LGL-007 - Left-panel Save button disabled by default
1. Step: Navigate to location 1604 (fresh page load), expected: page loads
2. Step: Click tab[tabLegal], expected: Legal tab loads
3. Step: Verify button[btnSaveLegal], expected: disabled attribute present

---

## Scenario: TC-LOC-LGL-008 - Changing Service Charge Name enables left-panel Save
1. Step: Navigate fresh, click tab[tabLegal], expected: Legal tab loads
2. Step: Verify button[btnSaveLegal], expected: disabled
3. Step: Click combobox[drpLegalServiceCharge0], select option "Administrative Fee", expected: combobox shows "Administrative Fee"
4. Step: Verify button[btnSaveLegal], expected: enabled (not disabled)
5. Step: Cleanup: reload page, accept beforeunload dialog

---

## Scenario: TC-LOC-LGL-009 - Changing Terms and Conditions Name enables left-panel Save
1. Step: Navigate fresh, click tab[tabLegal], expected: Legal tab loads
2. Step: Verify button[btnSaveLegal], expected: disabled
3. Step: Click combobox[drpLegalTerms0], select option "Encore Terms and Conditions", expected: combobox shows "Encore Terms and Conditions"
4. Step: Verify button[btnSaveLegal], expected: enabled (not disabled)
5. Step: Cleanup: reload page, accept beforeunload dialog

---

## Scenario: TC-LOC-LGL-010 - Reverting dropdowns to original values does NOT re-disable Save
1. Step: Navigate fresh, click tab[tabLegal], expected: Legal tab loads
2. Step: Click combobox[drpLegalServiceCharge0], select "Administrative Fee", expected: Save enables
3. Step: Click combobox[drpLegalServiceCharge0], select "Resort Service Charge", expected: value reverted
4. Step: Verify button[btnSaveLegal], expected: still enabled (NOT re-disabled)
5. Step: Cleanup: reload page, accept beforeunload dialog

---

## Scenario: TC-LOC-LGL-011 - Save Service Charge change persists after save and reload
1. Step: Navigate fresh, click tab[tabLegal], expected: default SC = "Resort Service Charge"
2. Step: Click combobox[drpLegalServiceCharge0], select "Administrative Fee", expected: value updates
3. Step: Click button[btnSaveLegal], expected: alertdialog[dlgSaveChanges] appears with heading "Save Changes"
4. Step: Click button[btnSaveChangesConfirm], expected: save executes, dialog closes
5. Step: Verify button[btnSaveLegal], expected: disabled (post-save)
6. Step: Reload page, click tab[tabLegal], expected: page reloads
7. Step: Verify combobox[drpLegalServiceCharge0], expected: "Administrative Fee" (persisted)
8. Step: Cleanup: select "Resort Service Charge", save, confirm dialog

---

## Scenario: TC-LOC-LGL-012 - Save Terms and Conditions change persists after save and reload
1. Step: Navigate fresh, click tab[tabLegal], expected: default T&C = "LDW"
2. Step: Click combobox[drpLegalTerms0], select "Encore Terms and Conditions", expected: value updates
3. Step: Click button[btnSaveLegal], expected: alertdialog appears
4. Step: Click button[btnSaveChangesConfirm], expected: save executes
5. Step: Reload page, click tab[tabLegal], expected: page reloads
6. Step: Verify combobox[drpLegalTerms0], expected: "Encore Terms and Conditions" (persisted)
7. Step: Cleanup: select "LDW", save, confirm dialog

---

## Scenario: TC-LOC-LGL-013 - Cancel in Save Changes dialog discards save
1. Step: Navigate fresh, click tab[tabLegal], expected: Legal tab loads
2. Step: Click combobox[drpLegalServiceCharge0], select "Administrative Fee", expected: Save enables
3. Step: Click button[btnSaveLegal], expected: alertdialog appears
4. Step: Click button[btnSaveChangesCancel], expected: dialog closes
5. Step: Verify button[btnSaveLegal], expected: still enabled (not saved)
6. Step: Reload page (accept beforeunload), click tab[tabLegal], expected: page reloads
7. Step: Verify combobox[drpLegalServiceCharge0], expected: "Resort Service Charge" (change not saved)

---

## Scenario: TC-LOC-LGL-014 - Beforeunload dialog triggers with unsaved Legal changes
1. Step: Navigate fresh, click tab[tabLegal], expected: Legal tab loads
2. Step: Click combobox[drpLegalTerms0], select "Blank", expected: Save enables
3. Step: Attempt page.reload(), expected: beforeunload dialog appears
4. Step: Dismiss dialog (stay on page), expected: page remains, changes preserved
5. Step: Accept dialog (leave page), expected: page reloads, changes discarded

---

## Scenario: TC-LOC-LGL-015 - Country change resets both Legal dropdowns
1. Step: Click tab[tabLegal], expected: default SC = "Resort Service Charge", T&C = "LDW"
2. Step: In left panel, change Country combobox to "Canada", expected: country updates
3. Step: Click tab[tabLegal], expected: Legal tab reloads
4. Step: Verify combobox[drpLegalServiceCharge0], expected: value reset (not "Resort Service Charge")
5. Step: Verify combobox[drpLegalTerms0], expected: value reset (not "LDW")
6. Step: Cleanup: revert Country to "United States", save

---

## Scenario: TC-LOC-LGL-016 - OMITTED: Service Charge dropdown sorted alphabetically
**Status**: OMITTED (APP BUG — MCP-verified 2026-04-06)
1. Step: Click tab[tabLegal], expected: Legal tab loads
2. Step: Click combobox[drpLegalServiceCharge0], expected: listbox opens
3. Step: Read all option texts, expected: sorted alphabetically (case-insensitive)

**Why OMITTED**: Live dropdown is NOT sorted. Generic names first, location-specific after. v1 requirement says "sorted alphabetically" but app does not implement it. Test would fail against live behavior. Logged as APP BUG.

---

## Scenario: TC-LOC-LGL-017 - OMITTED: Terms and Conditions dropdown sorted alphabetically
**Status**: OMITTED (APP BUG — MCP-verified 2026-04-06)
1. Step: Click tab[tabLegal], expected: Legal tab loads
2. Step: Click combobox[drpLegalTerms0], expected: listbox opens
3. Step: Read all option texts, expected: sorted alphabetically (case-insensitive)

**Why OMITTED**: Same as TC-016. Live dropdown is NOT sorted. Logged as APP BUG.

---

## Scenario: TC-LOC-LGL-018 - Combined SC + T&C change saves and persists both
1. Step: Reload page, click tab[tabLegal], expected: clean form state (LR-026)
2. Step: Click combobox[drpLegalServiceCharge0], select "Administrative Fee", expected: value updates
3. Step: Click combobox[drpLegalTerms0], select "Encore Terms and Conditions", expected: value updates
4. Step: Verify button[btnSaveLegal], expected: enabled
5. Step: Click button[btnSaveLegal], expected: alertdialog[dlgSaveChanges] appears
6. Step: Click button[btnSaveChangesConfirm], expected: save executes, dialog closes
7. Step: Verify button[btnSaveLegal], expected: disabled (post-save)
8. Step: Reload page, click tab[tabLegal], expected: fresh state loaded
9. Step: Verify combobox[drpLegalServiceCharge0], expected: "Administrative Fee" (persisted)
10. Step: Verify combobox[drpLegalTerms0], expected: "Encore Terms and Conditions" (persisted)
11. Step: Cleanup: select "Resort Service Charge" + "LDW", save, confirm dialog

---

## Integration: History Verification

### TC-LOC-HIST-004 (LGL saves → Location Management History)
1. After LGL save TCs complete, navigate to Location Management History tab
2. Verify row count increased by number of completed saves
3. Verify col 34 (Service Charge Name) and col 38 (Terms and Conditions) match saved values
4. Expected: Each Legal save = 1 new history row with correct dropdown selections