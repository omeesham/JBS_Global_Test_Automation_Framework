# Location Legal Test Plan
**Module**: locations
**Test Cases**: specs_planning/test-cases/locations/locations_legal_test_cases.md

## Scenario: TC-LOC-LGL-001 - Verify Legal grid default structure
1. Step: Navigate to Setup > Location > 1604 -- tab[Legal], expected: Legal tabpanel loads
2. Step: Verify columnheader[Language Name], expected: visible
3. Step: Verify columnheader[Service Charge Name], expected: visible
4. Step: Verify columnheader[Terms and Conditions Name], expected: visible
5. Step: Count table rows in Legal tabpanel tbody, expected: 1 data row
6. Step: Verify button[Save] within Legal tabpanel, expected: [disabled] state

---

## Scenario: TC-LOC-LGL-002 - Verify Legal grid default field values
1. Step: Navigate to tab[Legal], expected: tab loads
2. Step: Verify cell in row[US English] column 1, expected: text "US English"
3. Step: Verify combobox in row[US English] column 2, expected: displays "Service Charge"
4. Step: Verify combobox in row[US English] column 3, expected: displays "LDW"

---

## Scenario: TC-LOC-LGL-003 - Verify Language Name cell is read-only
1. Step: Navigate to tab[Legal], expected: tab loads
2. Step: Observe cell[US English] in Language Name column, expected: no combobox rendered, static text only
3. Step: Attempt to click Language Name cell, expected: no editor launched, cell remains static text

---

## Scenario: TC-LOC-LGL-004 - Service Charge Name dropdown opens and shows options
1. Step: Navigate to tab[Legal], expected: tab loads
2. Step: Click combobox[Service Charge] in row[US English] column 2, expected: listbox/dropdown opens
3. Step: Verify listbox contains option[Service Charge], expected: present with selection indicator
4. Step: Verify listbox contains option[Administrative Fee], expected: present
5. Step: Verify listbox contains option[ETS], expected: present
6. Step: Press Escape, expected: dropdown closes, value unchanged ("Service Charge")

---

## Scenario: TC-LOC-LGL-005 - Terms and Conditions Name dropdown opens and shows options
1. Step: Navigate to tab[Legal], expected: tab loads
2. Step: Click combobox[LDW] in row[US English] column 3, expected: listbox/dropdown opens
3. Step: Verify listbox contains option[LDW], expected: present with selection indicator
4. Step: Verify listbox contains option[Encore Terms and Conditions], expected: present
5. Step: Verify listbox contains option[Blank], expected: present
6. Step: Press Escape, expected: dropdown closes, value unchanged ("LDW")

---

## Scenario: TC-LOC-LGL-006 - Search/filter within Service Charge Name dropdown
1. Step: Navigate to tab[Legal], expected: tab loads
2. Step: Click combobox[Service Charge] in row[US English] column 2, expected: dropdown opens
3. Step: Type "marriott" in search input (hidden search combobox), expected: list filters to Marriott-related options
4. Step: Verify filtered options all contain "Marriott", expected: true
5. Step: Press Escape, expected: dropdown closes, original value retained

---

## Scenario: TC-LOC-LGL-007 - Legal Save button disabled by default
1. Step: Navigate to tab[Legal], expected: tab loads
2. Step: Verify button[Save] within Legal tabpanel, expected: [disabled]
3. Step: Verify no changes made, expected: unsaved changes flag = false

---

## Scenario: TC-LOC-LGL-008 - Changing Service Charge Name enables Legal Save button
1. Step: Navigate to tab[Legal], expected: tab loads
2. Step: Verify Legal button[Save], expected: [disabled]
3. Step: Verify left-panel button[Save], expected: [disabled]
4. Step: Click combobox[Service Charge] -- select option[Administrative Fee], expected: combobox shows "Administrative Fee"
5. Step: Verify Legal button[Save], expected: enabled/not disabled
6. Step: Verify left-panel button[Save], expected: still [disabled] (unaffected by Legal tab changes)

---

## Scenario: TC-LOC-LGL-009 - Changing Terms and Conditions Name enables Legal Save button
1. Step: Navigate to tab[Legal], expected: tab loads
2. Step: Click combobox[LDW] -- select option[Encore Terms and Conditions], expected: combobox shows "Encore Terms and Conditions"
3. Step: Verify Legal button[Save], expected: enabled
4. Step: Click combobox[Encore Terms and Conditions] -- select option[LDW], expected: combobox shows "LDW"
5. Step: Verify Legal button[Save], expected: [disabled] (net-zero change)

---

## Scenario: TC-LOC-LGL-010 - Reverting both dropdowns to original disables Legal Save
1. Step: Navigate to tab[Legal], expected: tab loads
2. Step: Change Service Charge combobox to "Administrative Fee", expected: Legal button[Save] enabled
3. Step: Change T&C combobox to "Encore Terms and Conditions", expected: Legal button[Save] still enabled
4. Step: Revert Service Charge combobox to "Service Charge", expected: Legal button[Save] still enabled (T&C still different)
5. Step: Revert T&C combobox to "LDW", expected: Legal button[Save] becomes [disabled]

---

## Scenario: TC-LOC-LGL-011 - Save legal data change persists after Save
1. Step: Navigate to tab[Legal], expected: tab loads
2. Step: Change T&C combobox to "Encore Terms and Conditions", expected: Legal button[Save] enabled
3. Step: Click Legal button[Save], expected: save executes
4. Step: Verify Legal button[Save], expected: [disabled] (changes saved)
5. Step: Switch to tab[Local Information], then back to tab[Legal], expected: Legal tab reloads
6. Step: Verify T&C combobox, expected: displays "Encore Terms and Conditions" (persisted)
7. Step: [CLEANUP] Change T&C back to "LDW" -- Click Legal button[Save], expected: reverted and saved

---

## Scenario: TC-LOC-LGL-012 - Country change resets both Legal dropdowns
1. Step: Navigate to tab[Legal], expected: default values: SC="Service Charge", T&C="LDW"
2. Step: Navigate to Basic Information left panel, change combobox[Country] to "Canada", expected: Country updated
3. Step: Switch to tab[Legal], expected: Legal tab visible
4. Step: Verify combobox in row[US English] column 2, expected: value reset (not "Service Charge")
5. Step: Verify combobox in row[US English] column 3, expected: value reset (not "LDW")
6. Step: [CLEANUP] Revert combobox[Country] to "United States"

---

## Scenario: TC-LOC-LGL-013 - Validation error indicator shown after Legal data reset
1. Step: Trigger Legal data reset via Country change (see TC-LOC-LGL-012), expected: Legal dropdowns reset
2. Step: Navigate to tab[Legal], expected: tab visible
3. Step: Observe row[US English] column 2 (Service Charge cell), expected: exclamation error indicator visible
4. Step: Observe row[US English] column 3 (T&C cell), expected: exclamation error indicator visible

---

## Scenario: TC-LOC-LGL-014 - Left panel Save disabled when Legal data is invalid
1. Step: Trigger Legal data invalidation via Country change (see TC-LOC-LGL-012), expected: Legal dropdowns reset
2. Step: Verify left-panel button[Save], expected: [disabled] due to !isValidLegalData()
3. Step: Confirm no fix applied to Legal dropdowns, expected: errors persist

---

## Scenario: TC-LOC-LGL-015 - Fixing invalid Legal data re-enables left panel Save
1. Step: Continue from TC-LOC-LGL-014 (Legal data invalid), expected: left-panel Save [disabled]
2. Step: Navigate to tab[Legal], expected: exclamation icons visible in SC and T&C cells
3. Step: Click Service Charge combobox -- select option[Service Charge], expected: SC error icon clears
4. Step: Click T&C combobox -- select option[LDW], expected: T&C error icon clears
5. Step: Verify Legal button[Save], expected: enabled
6. Step: Verify left-panel button[Save], expected: enabled (legal data valid again)
7. Step: [CLEANUP] Revert Country to "United States" -- Save

---
