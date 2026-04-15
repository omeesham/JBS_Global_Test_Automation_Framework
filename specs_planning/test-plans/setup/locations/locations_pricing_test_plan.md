# Location Pricing Test Plan
**Module**: locations  
**Test Cases**: specs_planning/test-cases/locations/locations_pricing_test_cases.md

---

## Scenario: TC-LOC-PRI-001 - Verify Pricing tab default state

1. Navigate to Setup menu: `btnSetupMenu`, click, menu opens
2. Click Location link: `lnkLocation`, click, search page loads
3. Search for office 1604: `txtLocalOfficeSearch`, type "1604", value entered
4. Click Search button: `btnSearch`, click, results grid loads
5. Click office 1604 link: `DynamicSelectors.lnkOfficeCode('1604')`, click, Basic Information page loads
6. Click Pricing tab: `tabPricing`, click, Pricing tab panel loads
7. Verify Corporate Pricing checkbox: `chkCorporatePricing`, check state, expected checked
8. Verify Price Guide Inclusive checkbox: `chkPriceGuideInclusive`, check state, expected checked
9. Verify Currency filter dropdown: `drpCurrencyFilter`, check text, expected "All"

---

## Scenario: TC-LOC-PRI-002 - Verify Primary Pricingfields default state

1. Navigate to Pricing tab (see TC-001 steps 1-6): tab loads
2. Verify Primary Labor Pricing field: `drpPrimaryLaborPricing`, check enabled state, expected enabled
3. Verify Primary Equipment Pricing field: `drpPrimaryEquipmentPricing`, check enabled state, expected enabled
4. Verify Primary Internal Equipment Pricing field: `drpPrimaryInternalEquipmentPricing`, check enabled state, expected enabled
5. Verify Primary Production Labor Pricing field: `drpPrimaryProductionLaborPricing`, check enabled state, expected enabled
6. Verify Primary Production Equipment Pricing field: `drpPrimaryProductionEquipmentPricing`, check enabled state, expected enabled

---

## Scenario: TC-LOC-PRI-003 - Verify Location Secondary Pricing grid structure

1. Navigate to Pricing tab: tab loads
2. Verify Location Secondary Pricing grid: `tblSecondaryPricingGrid`, grid visible
3. Verify column header Pricing Strategy: `colHeaderPricingStrategy`, text matches
4. Verify column header Pricebook: `colHeaderPricebook`, text matches
5. Verify column header Currency: `colHeaderCurrency`, text matches
6. Verify column header Is Alternative: `colHeaderIsAlternative`, text matches
7. Verify column header Use Effective Date: `colHeaderUseEffectiveDate`, text matches
8. Verify column header Start Date: `colHeaderStartDate`, text matches
9. Verify column header End Date: `colHeaderEndDate`, text matches
10. Verify first row exists: `rowPriceBook('MEX BO GDL MXN 2025')`, row visible

---

## Scenario: TC-LOC-PRI-004 - Verify grid row default state (all unchecked)

1. Navigate to Pricing tab: tab loads
2. Locate MEX BO GDL row Is Alternative checkbox: `chkIsAlternative('MEX BO GDL MXN 2025')`, check state, expected unchecked
3. Locate MEX BO GDL row Use Effective Date checkbox: `chkUseEffectiveDate('MEX BO GDL MXN 2025')`, check state, expected disabled
4. Locate MEX BO GDL row Start Date field: `dtpStartDate('MEX BO GDL MXN 2025')`, check state, expected disabled
5. Locate MEX BO GDL row End Date field: `dtpEndDate('MEX BO GDL MXN 2025')`, check state, expected disabled
6. Locate 2021-Tier 3 Urban A row Is Alternative checkbox: `chkIsAlternative('2021-Tier 3 Urban A')`, check state, expected unchecked

---

## Scenario: TC-LOC-PRI-005 - Enable Use Effective Date by checking Is Alternative

1. Navigate to Pricing tab: tab loads
2. Locate MEX BO GDL row Use Effective Date checkbox: `chkUseEffectiveDate('MEX BO GDL MXN 2025')`, check disabled state, expected disabled
3. Click MEX BO GDL Is Alternative checkbox: `chkIsAlternative('MEX BO GDL MXN 2025')`, click, checkbox checked
4. Verify Save button: `btnSavePricing`, check enabled state, expected enabled
5. Re-check MEX BO GDL Use Effective Date checkbox: `chkUseEffectiveDate('MEX BO GDL MXN 2025')`, check enabled state, expected enabled (clickable)

---

## Scenario: TC-LOC-PRI-006 - Is Alternative remains unchecked when Use Effective Date disabled

1. Navigate to Pricing tab: tab loads
2. Verify 2021-Tier 3 row Is Alternative: `chkIsAlternative('2021-Tier 3 Urban A')`, check state, expected unchecked
3. Attempt to click Use Effective Date: `chkUseEffectiveDate('2021-Tier 3 Urban A')`, click attempt, no interaction (disabled)
4. Verify Is Alternative still unchecked: `chkIsAlternative('2021-Tier 3 Urban A')`, check state, expected unchecked

---

## Scenario: TC-LOC-PRI-007 - Enable Start/End Date fields by cascading checkboxes

1. Navigate to Pricing tab: tab loads
2. Verify MEX BO GDL Start Date disabled: `dtpStartDate('MEX BO GDL MXN 2025')`, check state, expected disabled with placeholder "MM/DD/YYYY"
3. Verify MEX BO GDL End Date disabled: `dtpEnd Date('MEX BO GDL MXN 2025')`, check state, expected disabled
4. Click MEX BO GDL Is Alternative: `chkIsAlternative('MEX BO GDL MXN 2025')`, click, checked
5. Verify Use Effective Date enabled: `chkUseEffectiveDate('MEX BO GDL MXN 2025')`, check state, expected enabled
6. Click MEX BO GDL Use Effective Date: `chkUseEffectiveDate('MEX BO GDL MXN 2025')`, click, checked
7. Verify Start Date enabled: `dtpStartDate('MEX BO GDL MXN 2025')`, check state, expected enabled (date picker clickable)
8. Verify End Date enabled: `dtpEndDate('MEX BO GDL MXN 2025')`, check state, expected enabled

---

## Scenario: TC-LOC-PRI-008 - Start/End Date remain disabled when Use Effective Date unchecked

1. Navigate to Pricing tab: tab loads
2. Click 2022-eCommerce Is Alternative: `chkIsAlternative('2022-eCommerce')`, click, checked
3. Verify Use Effective Date enabled: `chkUseEffectiveDate('2022-eCommerce')`, check state, expected enabled
4. Verify Use Effective Date checkbox state: `chkUseEffectiveDate('2022-eCommerce')`, check state, expected unchecked
5. Verify Start Date disabled: `dtpStartDate('2022-eCommerce')`, check state, expected disabled
6. Verify End Date disabled: `dtpEndDate('2022-eCommerce')`, check state, expected disabled

---

## Scenario: TC-LOC-PRI-009 - Uncheck Use Effective Date clears Start/End Date values

1. Navigate to Pricing tab: tab loads
2. Enable cascade (Is Alternative checked, Use Effective Date checked): checkboxes checked
3. Click MEX BO GDL Start Date: `dtpStartDate('MEX BO GDL MXN 2025')`, click, date picker opens
4. Enter Start Date: date picker, select "03/01/2026", date entered
5. Click MEX BO GDL End Date: `dtpEndDate('MEX BO GDL MXN 2025')`, click, date picker opens
6. Enter End Date: date picker, select "03/31/2026", date entered
7. Uncheck Use Effective Date: `chkUseEffectiveDate('MEX BO GDL MXN 2025')`, click, unchecked
8. Re-check Use Effective Date: `chkUseEffectiveDate('MEX BO GDL MXN 2025')`, click, checked again
9. Verify Start Date field: `dtpStartDate('MEX BO GDL MXN 2025')`, check value, expected empty (cleared)
10. Verify End Date field: `dtpEndDate('MEX BO GDL MXN 2025')`, check value, expected empty (cleared)

---

## Scenario: TC-LOC-PRI-010 - Uncheck Is Alternative disables and clears all row fields

1. Navigate to Pricing tab: tab loads
2. Configure MEX BO GDL row: `chkIsAlternative`, `chkUseEffectiveDate`, `dtpStartDate`, all configured (Is Alternative checked, Use Effective Date checked, Start Date = "02/15/2026")
3. Uncheck MEX BO GDL Is Alternative: `chkIsAlternative('MEX BO GDL MXN 2025')`, click, unchecked
4. Verify Use Effective Date: `chkUseEffectiveDate('MEX BO GDL MXN 2025')`, check state, expected disabled and unchecked
5. Verify Start Date: `dtpStartDate('MEX BO GDL MXN 2025')`, check state and value, expected disabled and empty
6. Verify End Date: `dtpEndDate('MEX BO GDL MXN 2025')`, check state and value, expected disabled and empty

---

## Scenario: TC-LOC-PRI-011 - Corporate Pricing master toggle disables Primary pricing fields

1. Navigate to Pricing tab: tab loads
2. Verify Primary Labor Pricing enabled: `drpPrimaryLaborPricing`, check state, expected enabled
3. Uncheck Corporate Pricing checkbox: `chkCorporatePricing`, click, unchecked
4. Verify Save button enabled: `btnSavePricing`, check state, expected enabled
5. Verify Primary Labor Pricing disabled: `drpPrimaryLaborPricing`, check state, expected disabled
6. Verify Primary Equipment Pricing disabled: `drpPrimaryEquipmentPricing`, check state, expected disabled
7. Verify Primary Internal Equipment Pricing disabled: `drpPrimaryInternalEquipmentPricing`, check state, expected disabled
8. Verify Primary Production Labor Pricing disabled: `drpPrimaryProductionLaborPricing`, check state, expected disabled
9. Verify Primary Production Equipment Pricing disabled: `drpPrimaryProductionEquipmentPricing`, check state, expected disabled

---

## Scenario: TC-LOC-PRI-012 - Corporate Pricing toggle does NOT disable grid fields

1. Navigate to Pricing tab: tab loads
2. Configure MEX BO GDL row: `chkIsAlternative`, `chkUseEffectiveDate`, both checked
3. Uncheck Corporate Pricing: `chkCorporatePricing`, click, unchecked
4. Verify MEX BO GDL Is Alternative: `chkIsAlternative('MEX BO GDL MXN 2025')`, check state, expected enabled (clickable)
5. Verify MEX BO GDL Use Effective Date: `chkUseEffectiveDate('MEX BO GDL MXN 2025')`, check state, expected enabled

---

## Scenario: TC-LOC-PRI-013 - Re-enable fields by checking Corporate Pricing

1. Navigate to Pricing tab: tab loads
2. Uncheck Corporate Pricing: `chkCorporatePricing`, click, Primary fields disabled
3. Check Corporate Pricing: `chkCorporatePricing`, click, checked
4. Verify Primary Labor Pricing enabled: `drpPrimaryLaborPricing`, check state, expected enabled (clickable)

---

## Scenario: TC-LOC-PRI-014 - Currency filter displays "All" by default

1. Navigate to Pricing tab: tab loads
2. Check Currency filter dropdown: `drpCurrencyFilter`, check text, expected "All"

---

## Scenario: TC-LOC-PRI-015 - Currency filter dropdown options

1. Navigate to Pricing tab: tab loads
2. Click Currency filter dropdown: `drpCurrencyFilter`, click, dropdown opens
3. Verify options visible: listbox, check options, expected "All", "USD", "MXN", "CAD" (at minimum)

---

## Scenario: TC-LOC-PRI-016 - Filter grid by selecting specific currency

1. Navigate to Pricing tab: tab loads
2. Click Currency filter: `drpCurrencyFilter`, click, dropdown opens
3. Select USD option: `DynamicSelectors.optCurrencyFilter('USD')`, click, filter applied
4. Verify grid rows: grid, check visible rows, expected only USD price books (MEX BO GDL MXN 2025 hidden)
5. Click Currency filter: `drpCurrencyFilter`, click, dropdown opens
6. Select All option: `DynamicSelectors.optCurrencyFilter('All')`, click, filter cleared
7. Verify grid rows: grid, check all rows, expected all currencies visible

---

## Scenario: TC-LOC-PRI-017 - Primary pricing fields accept dropdown selections

1. Navigate to Pricing tab: tab loads
2. Ensure Corporate Pricing checked: `chkCorporatePricing`, check state, expected checked
3. Click Primary Labor Pricing dropdown: `drpPrimaryLaborPricing`, click, dropdown opens
4. Select option (TBD): listbox option, click, option selected
5. Verify dropdown shows selection: `drpPrimaryLaborPricing`, check text, expected selected value
6. Click Save button: `btnSavePricing`, click, save completes
7. Verify dropdown persists: `drpPrimaryLaborPricing`, check text, expected value persists

---

## Scenario: TC-LOC-PRI-018 - Start Date validates MM/DD/YYYY format

1. Navigate to Pricing tab: tab loads
2. Enable date fields (Is Alternative checked, Use Effective Date checked): fields enabled
3. Click MEX BO GDL Start Date: `dtpStartDate('MEX BO GDL MXN 2025')`, click, date picker opens
4. Enter invalid date: date input field, type "13/45/2026", value entered
5. Click outside field: any other element, click, validation triggers
6. Verify error indicator: error element (TBD selector), check visibility, expected error shown

---

## Scenario: TC-LOC-PRI-019 - End Date validates MM/DD/YYYY format

1. Navigate to Pricing tab: tab loads
2. Enable date fields: fields enabled
3. Click MEX BO GDL End Date: `dtpEndDate('MEX BO GDL MXN 2025')`, click, date picker opens
4. Enter invalid date: date input field, type "99/99/9999", value entered
5. Click outside field: any other element, click, validation triggers
6. Verify error indicator: error element (TBD selector), check visibility, expected error shown

---

## Scenario: TC-LOC-PRI-020 - Valid dates persist after save

1. Navigate to Pricing tab: tab loads
2. Enable dates (Is Alternative checked, Use Effective Date checked): fields enabled
3. Enter Start Date: `dtpStartDate('MEX BO GDL MXN 2025')`, select "04/01/2026", date entered
4. Enter End Date: `dtpEndDate('MEX BO GDL MXN 2025')`, select "04/30/2026", date entered
5. Click Save: `btnSavePricing`, click, save completes
6. Refresh page or navigate away and return: browser refresh or tab navigation, return to Pricing tab
7. Verify MEX BO GDL Start Date: `dtpStartDate('MEX BO GDL MXN 2025')`, check value, expected "04/01/2026"
8. Verify MEX BO GDL End Date: `dtpEndDate('MEX BO GDL MXN 2025')`, check value, expected "04/30/2026"
9. Verify MEX BO GDL Is Alternative: `chkIsAlternative('MEX BO GDL MXN 2025')`, check state, expected checked
10. Verify MEX BO GDL Use Effective Date: `chkUseEffectiveDate('MEX BO GDL MXN 2025')`, check state, expected checked

---

## Scenario: TC-LOC-PRI-021 - Multiple price books can have alternate pricing simultaneously

1. Navigate to Pricing tab: tab loads
2. Check MEX BO GDL Is Alternative: `chkIsAlternative('MEX BO GDL MXN 2025')`, click, checked
3. Check 2021-Tier 3 Is Alternative: `chkIsAlternative('2021-Tier 3 Urban A')`, click, checked
4. Check 2022-eCommerce Is Alternative: `chkIsAlternative('2022-eCommerce')`, click, checked
5. Verify all three rows: `chkIsAlternative` selectors, check states, expected all three checked simultaneously

---

## Scenario: TC-LOC-PRI-022 - Grid validates all rows via validateCorporatePriceGrid

1. Navigate to Pricing tab: tab loads
2. Configure MEX BO GDL: `chkIsAlternative`, `chkUseEffectiveDate`, `dtpStartDate`, set invalid date "99/99/9999"
3. Configure 2021-Tier 3: `chkIsAlternative`, `chkUseEffectiveDate`, `dtpStartDate`, set valid date "05/01/2026"
4. Attempt Save: `btnSavePricing`, click, validation runs
5. Verify grid-level error: error indicator (TBD selector), check visibility, expected grid error displayed indicating CorporatePrices form control has {invalid: true}

---
## Scenario: TC-LOC-PRI-023 - Verify Pricing tab has dedicated Save button (separate from left-panel Save)

1. Navigate to Pricing tab: `tabPricing`, click, Pricing tabpanel loads
2. Verify Pricing-specific Save button: `btnSavePricing` (inside tabpanel "Pricing"), check exists, expected present and always enabled
3. Navigate to Local Information tab: `tabLocalInformation`, click, verify NO tab-specific Save inside tabpanel
4. Navigate to Currency tab: `tabCurrency`, click, verify NO tab-specific Save inside tabpanel
5. Return to Pricing tab: `tabPricing`, click, Pricing tabpanel loads
6. Check any Is Alternative checkbox: `chkIsAlternative('MEX BO GDL MXN 2025')`, click, checked
7. Click Pricing Save: `btnSavePricing`, click, save completes (no confirmation dialog)
8. Reload page and return to Pricing tab: verify Is Alternative state persisted

---

## Scenario: TC-LOC-PRI-024 - Price Guide Inclusive — edit and persist

1. Navigate to Pricing tab: `tabPricing`, click, tab loads
2. Verify Price Guide Inclusive default: `chkPriceGuideInclusive`, check state, expected checked
3. Uncheck Price Guide Inclusive: `chkPriceGuideInclusive`, click, unchecked
4. Click Save: `btnSavePricing`, click, save completes
5. Reload page and navigate to Pricing tab: tab loads
6. Verify Price Guide Inclusive persisted unchecked: `chkPriceGuideInclusive`, check state, expected unchecked
7. Re-check Price Guide Inclusive: `chkPriceGuideInclusive`, click, checked
8. Click Save: `btnSavePricing`, click, save completes
9. Reload and verify Price Guide Inclusive: `chkPriceGuideInclusive`, check state, expected checked (default restored)

---

## Scenario: TC-LOC-PRI-025 - Corporate Pricing — toggle state persists after Save

1. Navigate to Pricing tab: `tabPricing`, click, tab loads
2. Verify Corporate Pricing default: `chkCorporatePricing`, check state, expected checked
3. Uncheck Corporate Pricing: `chkCorporatePricing`, click, unchecked
4. Verify Primary pricing fields disabled: `drpPrimaryLaborPricing`, check disabled state, expected disabled
5. Click Save: `btnSavePricing`, click, save completes
6. Reload page and navigate to Pricing tab: tab loads
7. Verify Corporate Pricing persisted unchecked: `chkCorporatePricing`, check state, expected unchecked
8. Re-check Corporate Pricing: `chkCorporatePricing`, click, checked
9. Verify Primary pricing fields re-enabled: `drpPrimaryLaborPricing`, check enabled state, expected enabled
10. Click Save: `btnSavePricing`, click, save completes
11. Reload and verify Corporate Pricing: `chkCorporatePricing`, check state, expected checked (default restored)

---

## Scenario: TC-LOC-PRI-026 - Primary Labor Pricing — select and persist specific value

1. Navigate to Pricing tab: `tabPricing`, click, tab loads
2. Verify Corporate Pricing is checked: `chkCorporatePricing`, check state, expected checked
3. Click Primary Labor Pricing dropdown: `drpPrimaryLaborPricing`, click, dropdown opens
4. Select option "2026-Zone 3 D": `drpPrimaryLaborPricing`, select "2026-Zone 3 D", value shown in field
5. Click Save: `btnSavePricing`, click, save completes
6. Reload page and navigate to Pricing tab: tab loads
7. Verify Primary Labor Pricing persisted: `drpPrimaryLaborPricing`, check text, expected "2026-Zone 3 D"

---

## Scenario: TC-LOC-PRI-027 - Primary Equipment Pricing — select and persist specific value

1. Navigate to Pricing tab: `tabPricing`, click, tab loads
2. Verify Corporate Pricing is checked: `chkCorporatePricing`, check state, expected checked
3. Click Primary Equipment Pricing dropdown: `drpPrimaryEquipmentPricing`, click, dropdown opens
4. Select option "2026-Tier 2 Resort B": `drpPrimaryEquipmentPricing`, select "2026-Tier 2 Resort B", value shown in field
5. Click Save: `btnSavePricing`, click, save completes
6. Reload page and navigate to Pricing tab: tab loads
7. Verify Primary Equipment Pricing persisted: `drpPrimaryEquipmentPricing`, check text, expected "2026-Tier 2 Resort B"

---

## Scenario: TC-LOC-PRI-028 - Primary Internal Equipment Pricing — select and persist specific value

1. Navigate to Pricing tab: `tabPricing`, click, tab loads
2. Verify Corporate Pricing is checked: `chkCorporatePricing`, check state, expected checked
3. Click Primary Internal Equipment Pricing dropdown: `drpPrimaryInternalEquipmentPricing`, click, dropdown opens
4. Select option "2023-Internal2": `drpPrimaryInternalEquipmentPricing`, select "2023-Internal2", value shown in field
5. Click Save: `btnSavePricing`, click, save completes
6. Reload page and navigate to Pricing tab: tab loads
7. Verify Primary Internal Equipment Pricing persisted: `drpPrimaryInternalEquipmentPricing`, check text, expected "2023-Internal2"

---

## Scenario: TC-LOC-PRI-029 - Primary Production Labor Pricing — select and persist specific value

1. Navigate to Pricing tab: `tabPricing`, click, tab loads
2. Verify Corporate Pricing is checked: `chkCorporatePricing`, check state, expected checked
3. Click Primary Production Labor Pricing dropdown: `drpPrimaryProductionLaborPricing`, click, dropdown opens
4. Select option "2026-NP LB3": `drpPrimaryProductionLaborPricing`, select "2026-NP LB3", value shown in field
5. Click Save: `btnSavePricing`, click, save completes
6. Reload page and navigate to Pricing tab: tab loads
7. Verify Primary Production Labor Pricing persisted: `drpPrimaryProductionLaborPricing`, check text, expected "2026-NP LB3"

---

## Scenario: TC-LOC-PRI-030 - Primary Production Equipment Pricing — select and persist specific value

1. Navigate to Pricing tab: `tabPricing`, click, tab loads
2. Verify Corporate Pricing is checked: `chkCorporatePricing`, check state, expected checked
3. Click Primary Production Equipment Pricing dropdown: `drpPrimaryProductionEquipmentPricing`, click, dropdown opens
4. Select option "2026-NP Tier 2": `drpPrimaryProductionEquipmentPricing`, select "2026-NP Tier 2", value shown in field
5. Click Save: `btnSavePricing`, click, save completes
6. Reload page and navigate to Pricing tab: tab loads
7. Verify Primary Production Equipment Pricing persisted: `drpPrimaryProductionEquipmentPricing`, check text, expected "2026-NP Tier 2"

---

## Scenario: TC-LOC-PRI-031 - Save dialog Cancel — edit, Save, Cancel, form stays dirty, no data saved

1. Check Is Alternative on primary test row: checkbox checked, form dirty
2. Verify Save button enabled: `btnSavePricing`, expected enabled
3. Click Save button: `btnSavePricing`, click, Save Changes dialog appears
4. Click Cancel on dialog: dialog dismissed
5. Verify Save button still enabled: `btnSavePricing`, expected enabled (form still dirty)
6. Reload Pricing tab: tab loads with clean state
7. Verify Is Alternative on primary test row: expected unchecked (data NOT persisted)

---

## Scenario: TC-LOC-PRI-032 - Unsaved changes dialog — edit, navigate away, Stay returns to form

1. Navigate to Pricing tab: `tabPricing`, click, tab loads
2. Uncheck Corporate Pricing: `chkCorporatePricing`, uncheck, form dirty
3. Verify Save button enabled: `btnSavePricing`, expected enabled
4. Click sidebar Home link: triggers unsaved changes dialog
5. Verify unsaved changes dialog visible: expected true
6. Click Stay: dialog dismissed, stays on Pricing tab
7. Verify URL contains locations path: expected still on pricing page
8. Verify Save button still enabled: `btnSavePricing`, expected enabled (form still dirty)
9. Cleanup: Re-check Corporate Pricing → reload Pricing tab

---

## Scenario: TC-LOC-PRI-033 - Grid validation errors block Save — missing dates with cascade enabled

1. Reload Pricing tab: tab loads with clean state (LR-026)
2. Verify Save button disabled: `btnSavePricing`, expected disabled (no pending changes)
3. Check Is Alternative on primary test row: checkbox checked
4. Poll for Use Effective Date enabled: expected enabled (LR-010)
5. Check Use Effective Date on primary test row: checkbox checked
6. Poll for date fields enabled: expected enabled (LR-010)
7. Verify Save button state with empty dates: expected disabled (validation: required dates missing)
8. Enter valid Start Date and End Date: dates entered
9. Verify Save button enabled: `btnSavePricing`, expected enabled (dirty + no validation errors)
10. Cleanup: Reset grid row (uncheck Is Alternative) → reload Pricing tab (LR-026)

---

## Scenario: TC-LOC-PRI-035 - Read-only columns (Pricing Strategy, Pricebook, Currency) have no interactive elements

1. Navigate to Pricing tab: `tabPricing`, click, tab loads
2. Inspect columns 1-3 on primary test row: check for button, checkbox, input elements
3. Verify interactive element count: expected 0 (display-only columns)
Note: TC-LOC-PRI-034 intentionally does not exist (skipped ID)

---

## Integration: History Verification

### TC-LOC-HIST-002 (PRI saves → Location Management History)
1. After PRI save TCs complete, navigate to Location Management History tab
2. Verify row count increased
3. Verify col 62 (Include Service Charge in Price Guides) reflects PriceGuideInclusive state
4. Limited coverage due to API 500 errors blocking most pricing saves
5. Expected: PRI-024 save = 1 new history row