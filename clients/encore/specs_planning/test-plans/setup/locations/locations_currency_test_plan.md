# Location Currency Test Plan
**Module**: locations
**Test Cases**: specs_planning/test-cases/locations/locations_currency_test_cases.md

## Scenario: TC-LOC-CUR-001 - Verify Currency grid default state
1. Step: Navigate to Setup > Location > [Office] -- tab[Currency], expected: tab panel loads
2. Step: Verify table columnheader[Currency Code], columnheader[Selected], columnheader[Is Default], columnheader[Merchant], expected: 4 column headers visible
3. Step: Count table rows, expected: 3 currency rows (USD, CAD, MXN)

---

## Scenario: TC-LOC-CUR-002 - Verify USD default configuration
1. Step: Navigate to tab[Currency], expected: tab loads
2. Step: Verify USD row checkbox[Selected], expected: checked
3. Step: Verify USD row checkbox[Is Default], expected: checked
4. Step: Verify USD row combobox[Merchant], expected: displays "316370 - PSAV US/USD"

---

## Scenario: TC-LOC-CUR-003 - Verify CAD default state
1. Step: Navigate to tab[Currency], expected: tab loads
2. Step: Verify CAD row checkbox[Selected], expected: unchecked
3. Step: Verify CAD row checkbox[Is Default], expected: disabled state

---

## Scenario: TC-LOC-CUR-004 - Verify MXN default state  
1. Step: Navigate to tab[Currency], expected: tab loads
2. Step: Verify MXN row checkbox[Selected], expected: unchecked
3. Step: Verify MXN row checkbox[Is Default], expected: disabled state

---

## Scenario: TC-LOC-CUR-005 - Enable Is Default by selecting currency
1. Step: Navigate to tab[Currency], expected: tab loads
2. Step: Verify CAD row checkbox[Is Default] disabled attribute, expected: true
3. Step: Click CAD row checkbox[Selected], expected: checkbox checked
4. Step: Verify CAD row checkbox[Is Default] disabled attribute, expected: false (enabled)

---

## Scenario: TC-LOC-CUR-006 - Single default rule - auto-uncheck previous default
1. Step: Navigate to tab[Currency], expected: tab loads, USD checkbox[Is Default] checked
2. Step: Click CAD row checkbox[Selected], expected: CAD Selected checked
3. Step: Click CAD row checkbox[Is Default], expected: CAD Is Default checked
4. Step: Verify USD row checkbox[Is Default], expected: unchecked (auto-toggled)

---

## Scenario: TC-LOC-CUR-007 - Unselecting currency disables Is Default
1. Step: Click CAD row checkbox[Selected], expected: checked
2. Step: Click CAD row checkbox[Is Default], expected: checked
3. Step: Click CAD row checkbox[Selected] to uncheck, expected: unchecked
4. Step: Verify CAD row checkbox[Is Default], expected: disabled and unchecked

---

## Scenario: TC-LOC-CUR-008 - USD Merchant dropdown options
1. Step: Navigate to tab[Currency], expected: tab loads
2. Step: Click USD row combobox[Merchant], expected: dropdown opens
3. Step: Verify listbox option[316370 - PSAV US/USD], expected: present
4. Step: Verify listbox option[316426 - Encore Bahamas/USD], expected: present
5. Step: Count listbox options, expected: 2 options total

---

## Scenario: TC-LOC-CUR-009 - CAD Merchant dropdown options
1. Step: Navigate to tab[Currency], expected: tab loads
2. Step: Click CAD row combobox[Merchant], expected: dropdown opens
3. Step: Verify listbox option[316446 - PSAV Canada/CAD], expected: present
4. Step: Count listbox options, expected: 1 option total

---

## Scenario: TC-LOC-CUR-010 - MXN Merchant dropdown - no options
1. Step: Click MXN row checkbox[Selected], expected: checked
2. Step: Click MXN row combobox[Merchant], expected: dropdown opens
3. Step: Verify listbox text "No Matches Found", expected: message displayed
4. Step: Count listbox options, expected: 0 selectable options

---

## Scenario: TC-LOC-CUR-011 - Select merchant for CAD currency
1. Step: Click CAD row checkbox[Selected], expected: checked
2. Step: Click CAD row combobox[Merchant], expected: dropdown opens
3. Step: Click listbox option[316446 - PSAV Canada/CAD], expected: option selected, dropdown closes
4. Step: Verify CAD row combobox[Merchant] text, expected: "316446 - PSAV Canada/CAD"

---

## Scenario: TC-LOC-CUR-012 - Merchant value persists when currency unselected
1. Step: Click CAD row checkbox[Selected], expected: checked
2. Step: Click CAD row combobox[Merchant], select option[316446 - PSAV Canada/CAD], expected: merchant assigned
3. Step: Click CAD row checkbox[Selected] to uncheck, expected: unchecked
4. Step: Verify CAD row combobox[Merchant] text, expected: still displays "316446 - PSAV Canada/CAD"

---

## Scenario: TC-LOC-CUR-013 - Validation - at least one currency required
1. Step: Uncheck USD row checkbox[Selected], expected: unchecked
2. Step: Verify CAD row checkbox[Selected], expected: unchecked (already)
3. Step: Verify MXN row checkbox[Selected], expected: unchecked (already)
4. Step: Click button[Save], expected: error notification appears
5. Step: Verify notification text "At least one currency must be selected", expected: error message displayed

---

## Scenario: TC-LOC-CUR-014 - Save allowed without default currency
1. Step: Verify USD row checkbox[Selected], expected: checked
2. Step: Uncheck USD row checkbox[Is Default] if checked, expected: unchecked
3. Step: Verify no other checkbox[Is Default] checked, expected: no default set
4. Step: Click button[Save], expected: alertdialog[Save Changes] appears
5. Step: Verify dialog paragraph "Are you sure you want to save the changes?", expected: confirmation message (no validation error)

---

## Scenario: TC-LOC-CUR-015 - Save button enabled on field change
1. Step: Navigate to tab[Currency], expected: tab loads
2. Step: Verify button[Save] disabled attribute, expected: true (initially disabled)
3. Step: Click CAD row checkbox[Selected], expected: checked
4. Step: Verify button[Save] disabled attribute, expected: false (enabled)

---

## Scenario: TC-LOC-CUR-016 - Change USD merchant selection
1. Step: Verify USD row combobox[Merchant], expected: displays "316370 - PSAV US/USD"
2. Step: Click USD row combobox[Merchant], expected: dropdown opens
3. Step: Click listbox option[316426 - Encore Bahamas/USD], expected: option selected
4. Step: Verify USD row combobox[Merchant] text, expected: "316426 - Encore Bahamas/USD"

---

## Scenario: TC-LOC-CUR-017 - Multiple currencies selected without default
1. Step: Click USD row checkbox[Selected], expected: checked
2. Step: Click CAD row checkbox[Selected], expected: checked
3. Step: Uncheck USD row checkbox[Is Default] if checked, expected: unchecked
4. Step: Verify CAD row checkbox[Is Default], expected: unchecked
5. Step: Click button[Save], expected: alertdialog[Save Changes] appears (no validation error)

---

## Scenario: TC-LOC-CUR-018 - Currency Code field is read-only
1. Step: Navigate to tab[Currency], expected: tab loads
2. Step: Attempt to click USD row cell[Currency Code], expected: no editable input field appears
3. Step: Verify cell[USD] type, expected: static text cell (not input/textbox)

---

## Scenario: TC-LOC-CUR-019 - Merchant dropdown available for unselected currency
1. Step: Verify CAD row checkbox[Selected], expected: unchecked
2. Step: Click CAD row combobox[Merchant], expected: dropdown opens
3. Step: Verify listbox visible, expected: options displayed (dropdown functional)

---

## Scenario: TC-LOC-CUR-020 - All three currencies can be selected simultaneously
1. Step: Click USD row checkbox[Selected] if unchecked, expected: checked
2. Step: Click CAD row checkbox[Selected], expected: checked
3. Step: Click MXN row checkbox[Selected], expected: checked
4. Step: Verify all three checkbox[Selected] states, expected: all checked

---

## Scenario: TC-LOC-CUR-021 - Selected currency persists after save and reload
1. Step: Reload page and navigate to tab[Currency], expected: tab loads with clean state
2. Step: Click CAD row checkbox[Selected], expected: checked
3. Step: Verify button[Save] enabled, expected: true
4. Step: Click button[Save], expected: alertdialog[Save Changes] appears, confirm, save completes
5. Step: Verify button[Save] disabled, expected: true (post-save)
6. Step: Reload page and navigate to tab[Currency], expected: tab loads
7. Step: Verify CAD row checkbox[Selected], expected: checked (persisted)
8. Cleanup: Uncheck CAD Selected → Save → confirm dialog

---

## Scenario: TC-LOC-CUR-022 - Merchant change persists after save and reload
1. Step: Reload page and navigate to tab[Currency], expected: tab loads
2. Step: Click USD row combobox[Merchant], select "316426 - Encore Bahamas/USD", expected: merchant changed
3. Step: Verify USD row combobox[Merchant] text, expected: contains "316426"
4. Step: Verify button[Save] enabled, expected: true
5. Step: Click button[Save], expected: save completes
6. Step: Verify button[Save] disabled, expected: true (post-save)
7. Step: Reload page and navigate to tab[Currency], expected: tab loads
8. Step: Verify USD row combobox[Merchant] text, expected: "316426 - Encore Bahamas/USD" (persisted)
9. Cleanup: Select USD Merchant "316370 - PSAV US/USD" → Save → confirm dialog

---

## Scenario: TC-LOC-CUR-023 - IsDefault change persists after save and reload (cascade)
1. Step: Reload page and navigate to tab[Currency], expected: tab loads
2. Step: Click CAD row checkbox[Selected], expected: checked
3. Step: Click CAD row checkbox[Is Default], expected: checked
4. Step: Verify USD row checkbox[Is Default], expected: unchecked (auto-cascade)
5. Step: Verify button[Save] enabled, expected: true
6. Step: Click button[Save], expected: save completes
7. Step: Verify button[Save] disabled, expected: true (post-save)
8. Step: Reload page and navigate to tab[Currency], expected: tab loads
9. Step: Verify CAD row checkbox[Is Default], expected: checked (persisted)
10. Step: Verify USD row checkbox[Is Default], expected: unchecked (cascade persisted)
11. Cleanup: Uncheck CAD Selected → check USD Is Default → Save → confirm dialog

---

## Scenario: TC-LOC-CUR-024 - Combined changes persist after single save and reload
1. Step: Reload page and navigate to tab[Currency], expected: tab loads
2. Step: Click CAD row checkbox[Selected], expected: checked
3. Step: Click USD row combobox[Merchant], select "316426 - Encore Bahamas/USD", expected: merchant changed
4. Step: Verify button[Save] enabled, expected: true
5. Step: Click button[Save] (single save for both changes), expected: save completes
6. Step: Verify button[Save] disabled, expected: true (post-save)
7. Step: Reload page and navigate to tab[Currency], expected: tab loads
8. Step: Verify CAD row checkbox[Selected], expected: checked (persisted)
9. Step: Verify USD row combobox[Merchant] text, expected: "316426 - Encore Bahamas/USD" (persisted)
10. Cleanup: Uncheck CAD Selected → select USD Merchant "316370 - PSAV US/USD" → Save → confirm dialog

---

## Scenario: TC-LOC-CUR-025 - Cancel save discards changes — reload shows original state
1. Step: Reload page and navigate to tab[Currency], expected: tab loads
2. Step: Click CAD row checkbox[Selected], expected: checked
3. Step: Verify button[Save] enabled, expected: true
4. Step: Click button[Save], expected: alertdialog[Save Changes] appears
5. Step: Click Cancel on dialog, expected: dialog dismissed
6. Step: Reload page and navigate to tab[Currency], expected: tab loads
7. Step: Verify CAD row checkbox[Selected], expected: unchecked (change NOT saved)

---

## Scenario: TC-LOC-CUR-026 - Beforeunload dialog fires when form is dirty
1. Step: Reload page and navigate to tab[Currency], expected: tab loads
2. Step: Click CAD row checkbox[Selected], expected: checked (form dirty)
3. Step: Verify button[Save] enabled, expected: true
4. Step: Attempt page reload, expected: beforeunload dialog fires
5. Step: Dismiss dialog (stay on page), expected: page stays, no navigation
6. Cleanup: Reload to discard dirty state

---

## Scenario: TC-LOC-CUR-027 - No-default state persists after save and reload
1. Step: Reload page and navigate to tab[Currency], expected: tab loads
2. Step: Uncheck USD row checkbox[Is Default], expected: unchecked (no currency is default)
3. Step: Verify button[Save] enabled, expected: true
4. Step: Click button[Save], expected: alertdialog[Save Changes] appears, confirm, save completes
5. Step: Verify button[Save] disabled, expected: true (post-save)
6. Step: Reload page and navigate to tab[Currency], expected: tab loads
7. Step: Verify USD row checkbox[Is Default], expected: unchecked (no-default state persisted)
8. Cleanup: Check USD Is Default → Save → confirm dialog

---

## Integration: History Verification

### TC-LOC-HIST-003 (CUR saves → Location Management History)
1. After CUR save TCs complete, navigate to Location Management History tab
2. Verify row count increased
3. Verify col 6 (Currency) reflects latest saved state; col 64 if pricing currency changed
4. Confirm NOT-TRACKED: Merchant currency selections have no column in 87
5. Expected: Currency selection saves = history rows. Merchant changes NOT tracked
