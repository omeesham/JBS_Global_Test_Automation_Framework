# Location Pricing Test Plan
**Module**: locations
**Test Cases**: specs_planning/test-cases/setup/locations/locations_pricing_test_cases.md
**Updated**: 2026-06-19

> Reconciled 2026-06-19 against the live app and the dated field inventory. Office 1604 is
> single-currency (USD). The office-1604 scenarios act on three stable USD rows:
> `2021-Tier 3 Urban A` (primary), `2022-Zone 5 A` (secondary), `2022-Zone 1 A` (tertiary).
> Office-1605 scenarios (TC-036..038) cover the multi-currency primary dropdowns.

Shared navigation to the Pricing tab (referenced as "navigate to Pricing tab"):
1. Open Setup menu: `btnSetupMenu`
2. Click Location: `lnkLocation`
3. Search the office: `txtLocalOfficeSearch` = office number
4. Click Search: `btnSearch`
5. Open the office: `DynamicSelectors.lnkOfficeCode(office)`
6. Click the Pricing tab: `tabPricing`

A per-test baseline restore runs before each scenario: it ensures Corporate Pricing and Include
Service Fee are checked and the test rows are clean (page object `ensureDefaultState`).

---

## Scenario: TC-LOC-PRI-001 - Verify Pricing tab default state

1. Navigate to Pricing tab (office 1604)
2. Verify Corporate Pricing checkbox: `chkCorporatePricing`, expected checked
3. Verify Include Service Fee checkbox: `chkPriceGuideInclusive`, expected checked
4. Verify Currency filter: `drpCurrencyFilter`, expected "All"

---

## Scenario: TC-LOC-PRI-002 - Verify Primary Pricing fields default state (5 USD dropdowns)

1. Navigate to Pricing tab
2. Verify enabled: `drpPrimaryLaborPricingUSD`
3. Verify enabled: `drpPrimaryEquipmentPricingUSD`
4. Verify enabled: `drpPrimaryInternalEquipmentPricingUSD`
5. Verify enabled: `drpPrimaryProductionLaborPricingUSD`
6. Verify enabled: `drpPrimaryProductionEquipmentPricingUSD`

---

## Scenario: TC-LOC-PRI-003 - Verify Location Secondary Pricing grid structure

1. Navigate to Pricing tab
2. Verify grid visible: `tblSecondaryPricingGrid`
3. Verify column headers in order: `colHeaderPricingStrategy`, `colHeaderPricebook`, `colHeaderCurrency`, `colHeaderIsAlternative`, `colHeaderUseEffectiveDate`, `colHeaderStartDate`, `colHeaderEndDate`
4. Verify primary test row present: `rowPriceBook('2021-Tier 3 Urban A')`

---

## Scenario: TC-LOC-PRI-004 - Verify grid row default state

1. Navigate to Pricing tab
2. For `2021-Tier 3 Urban A` and `2022-Zone 5 A`: `chkIsAlternative(row)` unchecked; `chkUseEffectiveDate(row)` disabled; `dtpStartDate(row)` disabled; `dtpEndDate(row)` disabled

---

## Scenario: TC-LOC-PRI-005 - Enable Use Effective Dates by checking Is Alternative

1. Navigate to Pricing tab
2. Verify `chkUseEffectiveDate('2021-Tier 3 Urban A')` disabled
3. Check `chkIsAlternative('2021-Tier 3 Urban A')`
4. Verify `chkUseEffectiveDate('2021-Tier 3 Urban A')` becomes enabled
5. Reset the row

---

## Scenario: TC-LOC-PRI-006 - Use Effective Dates stays disabled when Is Alternative unchecked

1. Navigate to Pricing tab
2. Verify `chkIsAlternative('2022-Zone 5 A')` unchecked
3. Verify `chkUseEffectiveDate('2022-Zone 5 A')` disabled (no interaction)
4. Verify `chkIsAlternative('2022-Zone 5 A')` still unchecked

---

## Scenario: TC-LOC-PRI-007 - Full cascade enables Start/End Date fields

1. Navigate to Pricing tab
2. Verify `dtpStartDate('2021-Tier 3 Urban A')` and `dtpEndDate('2021-Tier 3 Urban A')` disabled
3. Check `chkIsAlternative('2021-Tier 3 Urban A')`
4. Verify `chkUseEffectiveDate('2021-Tier 3 Urban A')` enabled, then check it
5. Verify `dtpStartDate(...)` and `dtpEndDate(...)` enabled
6. Reset the row

---

## Scenario: TC-LOC-PRI-008 - Start/End Date remain disabled when Use Effective Dates unchecked

1. Navigate to Pricing tab
2. Check `chkIsAlternative('2022-Zone 1 A')`; verify `chkUseEffectiveDate('2022-Zone 1 A')` enabled
3. Leave Use Effective Dates unchecked
4. Verify `dtpStartDate('2022-Zone 1 A')` and `dtpEndDate('2022-Zone 1 A')` disabled
5. Reset the row

---

## Scenario: TC-LOC-PRI-009 - Uncheck Use Effective Dates clears Start/End Date values

1. Navigate to Pricing tab
2. Enable full cascade on `2021-Tier 3 Urban A`
3. Enter Start Date 03/01/2026, End Date 03/31/2026
4. Uncheck then re-check `chkUseEffectiveDate('2021-Tier 3 Urban A')`
5. Verify `dtpStartDate(...)` and `dtpEndDate(...)` cleared
6. Reset the row

---

## Scenario: TC-LOC-PRI-010 - Uncheck Is Alternative disables and clears all row fields

1. Navigate to Pricing tab
2. Enable full cascade on `2021-Tier 3 Urban A`, enter Start Date 05/15/2026
3. Uncheck `chkIsAlternative('2021-Tier 3 Urban A')`
4. Verify Use Effective Dates disabled + unchecked; Start/End Date disabled
5. Reload to discard

---

## Scenario: TC-LOC-PRI-011 - Corporate Pricing unchecked disables all Primary pricing dropdowns

1. Navigate to Pricing tab
2. Verify the five `drpPrimary*PricingUSD` dropdowns enabled
3. Uncheck `chkCorporatePricing`
4. Verify all five primary dropdowns disabled
5. Re-check `chkCorporatePricing`

---

## Scenario: TC-LOC-PRI-012 - Corporate Pricing toggle does NOT disable grid fields

1. Navigate to Pricing tab
2. Check `chkIsAlternative('2021-Tier 3 Urban A')` and `chkUseEffectiveDate('2021-Tier 3 Urban A')`
3. Uncheck `chkCorporatePricing`
4. Verify the row's Is Alternative and Use Effective Dates still enabled
5. Re-check Corporate Pricing, reset the row

---

## Scenario: TC-LOC-PRI-013 - Re-enable Primary fields by checking Corporate Pricing

1. Navigate to Pricing tab
2. Uncheck `chkCorporatePricing`; verify primary dropdowns disabled
3. Check `chkCorporatePricing`; verify primary dropdowns re-enabled

---

## Scenario: TC-LOC-PRI-014 - Currency filter displays "All" by default

1. Navigate to Pricing tab
2. Verify `drpCurrencyFilter` shows "All"

---

## Scenario: TC-LOC-PRI-015 - Currency filter dropdown has expected options

1. Navigate to Pricing tab
2. Open `drpCurrencyFilter`
3. Verify the option set is ["All", "USD"] (clean office 1604, USD-only rows)

---

## Scenario: TC-LOC-PRI-016 - Filter grid by selecting USD keeps USD rows visible

1. Navigate to Pricing tab
2. Record grid row count
3. Select USD in `drpCurrencyFilter`
4. Verify row count unchanged and `rowPriceBook('2021-Tier 3 Urban A')` visible
5. Reset filter to All

---

## Scenario: TC-LOC-PRI-017 - Primary pricing dropdowns accept selections

1. Navigate to Pricing tab, ensure Corporate Pricing checked
2. Verify `drpPrimaryLaborPricingUSD` enabled and interactive (specific persistence covered by TC-026..030)

---

## Scenario: TC-LOC-PRI-018 - Start Date is calendar-only with a missing-date validation message

1. Navigate to Pricing tab
2. Enable full cascade on `2021-Tier 3 Urban A`
3. Verify `dtpStartDate(...)` is read-only (cannot type)
4. Open the Start Date calendar popover with no date set
5. Verify a missing-date validation message appears
6. Close the popover, reset the row

---

## Scenario: TC-LOC-PRI-019 - End Date is calendar-only with a missing-date validation message

1. Navigate to Pricing tab
2. Reset row, enable full cascade on `2021-Tier 3 Urban A`
3. Verify `dtpEndDate(...)` is read-only and empty
4. Open the End Date calendar popover with no date set
5. Verify a missing-date validation message appears
6. Close the popover, reset the row

---

## Scenario: TC-LOC-PRI-020 - Valid dates persist after save

1. Navigate to Pricing tab
2. Enable full cascade on `2021-Tier 3 Urban A`
3. Enter Start Date 04/01/2026, End Date 04/30/2026
4. Click `btnSavePricing`, confirm the Save Changes dialog
5. Reload the Pricing tab
6. Verify dates and the Is Alternative + Use Effective Dates states persisted
7. Reset the row and save

---

## Scenario: TC-LOC-PRI-021 - Multiple price books can have alternate pricing simultaneously

1. Navigate to Pricing tab
2. Check `chkIsAlternative` for `2021-Tier 3 Urban A`, `2022-Zone 5 A`, `2022-Zone 1 A`
3. Verify all three checked at once
4. Reset all three rows

---

## Scenario: TC-LOC-PRI-022 - Grid validates all rows — missing date shows validation error

1. Navigate to Pricing tab
2. Enable full cascade on `2021-Tier 3 Urban A` (leave dates empty)
3. Enable full cascade on `2022-Zone 5 A`, enter Start Date 05/01/2026
4. Open the Start Date popover on `2021-Tier 3 Urban A`
5. Verify a missing-date validation message appears
6. Reset both rows

---

## Scenario: TC-LOC-PRI-023 - Pricing tab has a dedicated Save button

1. Navigate to Pricing tab (reload for a clean state)
2. Verify `btnSavePricing` disabled on clean load
3. Uncheck `chkCorporatePricing`
4. Verify `btnSavePricing` enables
5. Reload to discard

---

## Scenario: TC-LOC-PRI-024 - Include Service Fee in Price Guides — uncheck, save, reload, persists; restore

1. Navigate to Pricing tab
2. Verify `chkPriceGuideInclusive` checked
3. Uncheck it, click `btnSavePricing`, confirm
4. Reload; verify it stays unchecked
5. Re-check it, save, confirm
6. Reload; verify it is checked again

---

## Scenario: TC-LOC-PRI-025 - Corporate Pricing — toggle state persists after save (BLOCKED)

1. Navigate to Pricing tab
2. Uncheck `chkCorporatePricing`, click `btnSavePricing`, confirm (save returns HTTP 200)
3. Reload; the checkbox reverts to checked
4. **Blocked by application defect BUG-LOC-PRI-001** — the save reports success but the value does
   not persist. Reproduced on offices 1604 and 1605. Scenario kept skipped until the defect is fixed.

---

## Scenario: TC-LOC-PRI-026 - Primary Labor Pricing — bidirectional persist

1. Navigate to Pricing tab
2. Select `2026-Zone 3 E` in `drpPrimaryLaborPricingUSD`, save, reload, verify persisted
3. Select `2026-Zone 3 D`, save, reload, verify persisted (restores the original)

---

## Scenario: TC-LOC-PRI-027 - Primary Equipment Pricing — bidirectional persist

1. Navigate to Pricing tab
2. Select `2026-Tier 2 Resort A` in `drpPrimaryEquipmentPricingUSD`, save, reload, verify persisted
3. Select `2026-Tier 2 Resort B`, save, reload, verify persisted

---

## Scenario: TC-LOC-PRI-028 - Primary Internal Equipment Pricing — bidirectional persist

1. Navigate to Pricing tab
2. Select `2023-Internal1` in `drpPrimaryInternalEquipmentPricingUSD`, save, reload, verify persisted
3. Select `2023-Internal2`, save, reload, verify persisted

---

## Scenario: TC-LOC-PRI-029 - Primary Production Labor Pricing — bidirectional persist

1. Navigate to Pricing tab
2. Select `2026-NP LB2` in `drpPrimaryProductionLaborPricingUSD`, save, reload, verify persisted
3. Select `2026-NP LB3`, save, reload, verify persisted

---

## Scenario: TC-LOC-PRI-030 - Primary Production Equipment Pricing — bidirectional persist

1. Navigate to Pricing tab
2. Select `2026-NP Tier 1` in `drpPrimaryProductionEquipmentPricingUSD`, save, reload, verify persisted
3. Select `2026-NP Tier 2`, save, reload, verify persisted

---

## Scenario: TC-LOC-PRI-031 - Save dialog Cancel — form stays dirty, no data saved

1. Navigate to Pricing tab
2. Check `chkIsAlternative('2021-Tier 3 Urban A')`; verify `btnSavePricing` enabled
3. Click `btnSavePricing`; verify the Save Changes dialog appears
4. Click Cancel; verify the dialog closes and Save stays enabled
5. Reload; verify Is Alternative is unchecked (nothing saved)

---

## Scenario: TC-LOC-PRI-032 - Unsaved changes dialog — Stay returns to form

1. Navigate to Pricing tab
2. Uncheck `chkCorporatePricing` (form dirty); verify `btnSavePricing` enabled
3. Click the sidebar Home link; verify the Unsaved changes dialog appears
4. Click Stay; verify we remain on the Pricing page with Save still enabled
5. Re-check Corporate Pricing, reload to discard

---

## Scenario: TC-LOC-PRI-033 - Grid validation errors block Save — missing dates with cascade enabled

1. Navigate to Pricing tab (reload for clean state); verify `btnSavePricing` disabled
2. On `2021-Tier 3 Urban A`: check Is Alternative, then Use Effective Dates
3. Verify Save stays disabled with empty required dates
4. Enter valid Start (05/01/2026) and End (05/31/2026) dates
5. Verify Save enables
6. Reset the row, reload

---

## Scenario: TC-LOC-PRI-035 - Read-only columns have no interactive elements

1. Navigate to Pricing tab
2. Inspect columns 1-3 (Pricing Strategy, Pricebook, Currency) on `2021-Tier 3 Urban A`
3. Verify no button/checkbox/input elements present

---

## Scenario: TC-LOC-PRI-036 - All per-currency primary pricing dropdowns render and are enabled (office 1605)

1. Navigate to Pricing tab on office 1605, ensure Corporate Pricing checked
2. Verify all fifteen primary dropdowns render and are enabled: `drpPrimary*PricingUSD`, `drpPrimary*PricingCAD`, `drpPrimary*PricingMXN`

---

## Scenario: TC-LOC-PRI-037 - Primary Labor Pricing (MXN) — select, save, persists (office 1605)

1. Navigate to Pricing tab on office 1605, ensure Corporate Pricing checked
2. Ensure `drpPrimaryLaborPricingMXN` is unset
3. Select `MEX DYN LB1 MXN 2025`, click `btnSavePricing`, confirm
4. Reload; verify the value persisted
5. Restore the dropdown to unset and save

---

## Scenario: TC-LOC-PRI-038 - Primary Equipment Pricing (MXN) — select, save, persists (office 1605)

1. Navigate to Pricing tab on office 1605, ensure Corporate Pricing checked
2. Ensure `drpPrimaryEquipmentPricingMXN` is unset
3. Select `MEX BO CDMX MXN 2025`, click `btnSavePricing`, confirm
4. Reload; verify the value persisted
5. Restore the dropdown to unset and save

---

## History Coverage

The Pricing tab has no dedicated history grid; pricing changes appear in the shared Location
Management History (covered by the history test suite). No pricing-specific history scenarios.

---

## Coverage Index (regenerated 2026-06-19 from the test-cases file)

- Default state: TC-001, TC-002, TC-004, TC-014
- Structure: TC-003, TC-035, TC-036
- Cascade / state transition: TC-005, TC-006, TC-007, TC-008, TC-009, TC-010, TC-011, TC-012, TC-013
- Currency filter: TC-014, TC-015, TC-016
- Validation: TC-018, TC-019, TC-022, TC-033
- Persistence: TC-020, TC-024, TC-026, TC-027, TC-028, TC-029, TC-030, TC-037, TC-038
- Save / dialogs: TC-023, TC-031, TC-032
- Blocked (application defect): TC-025
- Reserved/skipped ID: TC-034 (does not exist)
