# Location - Currency Test Cases

**Module**: locations

| Module | Test Cases | Automated | Manual | Out of Scope | Updated |
|--------|------------|-----------|--------|--------------|--------|
| Locations | 28 | 28 (100%) | 0 (0%) | 0 (0%) | 2026-06-17 |

---

## FIELD INVENTORY & DISCOVERY

**Currency Tab** (grid: 4 columns × 3 currencies):

| # | Element | Type | Selector Key | Default (1604) | State |
|---|---------|------|-------------|----------------|-------|
| 1 | Currency Code | read-only cell | `cellCurrencyCode(currency)` | USD / CAD / MXN | always disabled |
| 2 | Selected (USD) | checkbox | `chkUSDSelected` / `chkCurrencySelected('USD')` | checked | editable |
| 3 | Selected (CAD) | checkbox | `chkCADSelected` / `chkCurrencySelected('CAD')` | unchecked | editable |
| 4 | Selected (MXN) | checkbox | `chkMXNSelected` / `chkCurrencySelected('MXN')` | unchecked | editable |
| 5 | Is Default (USD) | checkbox | `chkUSDIsDefault` / `chkCurrencyIsDefault('USD')` | checked | enabled only when Selected |
| 6 | Is Default (CAD) | checkbox | `chkCADIsDefault` / `chkCurrencyIsDefault('CAD')` | disabled | enabled only when Selected |
| 7 | Is Default (MXN) | checkbox | `chkMXNIsDefault` / `chkCurrencyIsDefault('MXN')` | disabled | enabled only when Selected |
| 8 | Merchant (USD) | dropdown | `drpUSDMerchant` / `drpCurrencyMerchant('USD')` | "316370 - PSAV US/USD" | always editable |
| 9 | Merchant (CAD) | dropdown | `drpCADMerchant` / `drpCurrencyMerchant('CAD')` | (1 option) | always editable |
| 10 | Merchant (MXN) | dropdown | `drpMXNMerchant` / `drpCurrencyMerchant('MXN')` | (0 options) | always editable |
| 11 | Grid table | table | `tblCurrencyGrid` | — | — |
| 12 | Save button | button | `btnSaveCurrency` | disabled | enables on change |

**Column headers**: `colHeaderCurrencyCode`, `colHeaderSelected`, `colHeaderIsDefault`, `colHeaderMerchant`

**Behavioral Notes (Verified Live)**:
- Selecting a currency (`Selected`) -- enables its `Is Default` checkbox
- Only 1 `Is Default` allowed: checking one auto-unchecks others
- At least 1 currency must be selected (validation error on save otherwise)
- `Merchant` always editable regardless of `Selected` state
- USD: 2 merchant options; CAD: 1 option; MXN: 0 options ("No Matches Found")
- Save triggers `dlgSaveChanges` confirmation dialog

**Dependency-Aware Failure Isolation**: Spec converted from `test.describe.serial(.)` to `test.describe(.)` + `dependencyGate(deps[])` per `SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md`. Each TC declares its dependency chain via `Depends_On` below; the fixture skips dependents when their declared dep failed (no cascade-skip on independents).

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| At least one currency must remain selected | Unchecking the last selected currency disables Save as a preventive guard |
| Is Default is disabled until the currency is selected | Is Default enables only when its row's Selected checkbox is checked |
| Exactly one currency can be set as default | Checking a different row's Is Default automatically unchecks the previously checked Is Default |

---

## MCP_VERIFICATION_LOG

Observed on office 1604 in the sessions recorded in the field inventory
`currency-2026-06-17.md` (walk 2026-06-17). Each row is an observation, not an expectation.

| # | Verified | Result |
|---|---|---|
| 1 | Currency tab activation | Requires a real Playwright `click`; raw-JS `.click()` does not flip `aria-selected` (Radix needs the full pointer sequence) |
| 2 | USD Selected default | Checked |
| 3 | USD Is Default default | Checked; single-default mutual exclusion enforced — checking one clears others |
| 4 | USD Merchant default | "316370 - PSAV US/USD"; 2 merchant options available for office 1604 |
| 5 | CAD Selected default | Unchecked |
| 6 | CAD Is Default state | Disabled while CAD is unchecked; enables when CAD is selected |
| 7 | CAD Merchant | "316446 - PSAV Canada/CAD"; 1 option |
| 8 | MXN Merchant options | 0 options ("No Matches Found") — office-1604-seeded server config |
| 9 | Unchecking a currency | Auto-disables and unchecks its Is Default checkbox |
| 10 | Merchant option counts | USD=2 / CAD=1 / MXN=0 — office-1604-seeded, not framework-controlled |
| 11 | Save button at session start | Disabled (no save issued during this walk) |

---
## TC-LOC-CUR-001: Verify Currency grid default state
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Depends_On**: none (baseline-enforcement per LR-019)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Setup > Location > 1604 -- **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Verify grid structure ✓ 4 columns visible: Currency Code, Selected, Is Default, Merchant | Four column headers are visible: Currency Code, Selected, Is Default, Merchant. |

**Expected**: Grid displays 3 currencies (USD, CAD, MXN) with correct column headers
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-002: Verify USD default configuration
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Check USD row ✓ **Selected** checkbox checked, **Is Default** checkbox checked, **Merchant** = "316370 - PSAV US/USD" | The USD row shows Selected checked, Is Default checked, and Merchant showing "316370 - PSAV US/USD". |

**Expected**: USD is selected and set as default with merchant assigned
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-003: Verify CAD default state
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Check CAD row ✓ **Selected** unchecked, **Is Default** disabled, **Merchant** dropdown available | The CAD row shows Selected unchecked, Is Default disabled, and the Merchant dropdown available. |

**Expected**: CAD is unselected with Is Default disabled
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-004: Verify MXN default state 
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Check MXN row ✓ **Selected** unchecked, **Is Default** disabled, **Merchant** dropdown available | The MXN row shows Selected unchecked, Is Default disabled, and the Merchant dropdown available. |

**Expected**: MXN is unselected with Is Default disabled
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-005: Verify Is Default Enables When Currency Is Selected
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | CAD **Is Default** is disabled (initial state) ✓ Disabled | CAD "Is Default" is disabled. |
| 2 | Click CAD **Selected** checkbox ✓ Checked, Save button enabled | CAD "Selected" is checked and the Save button is enabled. |
| 3 | Verify CAD **Is Default** ✓ Enabled (clickable) | CAD "Is Default" is enabled and can be clicked. |

**Expected**: Selecting a currency enables its Is Default checkbox
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-006: Single default rule - auto-uncheck previous default
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | USD **Is Default** checked (initial) ✓ Checked | USD "Is Default" is checked. |
| 2 | Select CAD **Selected** checkbox ✓ CAD Selected checked | CAD "Selected" is checked. |
| 3 | Click CAD **Is Default** checkbox ✓ CAD Is Default checked | CAD "Is Default" is checked. |
| 4 | Verify USD **Is Default** ✓ Auto-unchecked | USD "Is Default" is automatically unchecked. |

**Expected**: Only ONE default currency allowed; setting new default auto-unchecks previous
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Cleanup**: Uncheck CAD **Selected** -- click USD **Is Default** to restore it checked -- click **Save** -- confirm dialog -- verify USD Selected=checked, USD Is Default=checked, CAD Selected=unchecked

---

## TC-LOC-CUR-007: Unselecting currency disables Is Default
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select CAD **Selected**, set CAD **Is Default** ✓ Both checked | CAD "Selected" is checked and CAD "Is Default" is checked. |
| 2 | Uncheck CAD **Selected** ✓ Unchecked | CAD "Selected" is unchecked. |
| 3 | Verify CAD **Is Default** ✓ Disabled and unchecked | CAD "Is Default" is disabled and unchecked. |

**Expected**: Unselecting currency disables and unchecks Is Default
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Cleanup**: Click USD **Is Default** to restore it checked -- click **Save** -- confirm dialog -- verify USD Selected=checked, USD Is Default=checked, CAD Selected=unchecked, CAD Is Default=disabled

---

## TC-LOC-CUR-008: USD Merchant dropdown options
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: none (read-only structural — server-seeded merchant catalogue, no state mutation)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click USD **Merchant** dropdown ✓ Dropdown opens | The USD Merchant dropdown opens. |
| 2 | Verify options ✓ Two options: "316370 - PSAV US/USD", "316426 - Encore Bahamas/USD" | Two options are displayed: "316370 - PSAV US/USD" and "316426 - Encore Bahamas/USD". |

**Expected**: USD Merchant dropdown shows 2 merchant options
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-009: CAD Merchant dropdown options
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: none (read-only structural — server-seeded merchant catalogue)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select CAD **Selected** checkbox ✓ CAD Selected checked | CAD "Selected" is checked. |
| 2 | Click CAD **Merchant** dropdown ✓ Dropdown opens | The CAD Merchant dropdown opens. |
| 3 | Verify option ✓ One option: "316446 - PSAV Canada/CAD" | One option is displayed: "316446 - PSAV Canada/CAD". |

**Expected**: CAD Merchant dropdown shows 1 merchant option
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-010: MXN Merchant dropdown - no options
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select MXN **Selected** checkbox ✓ MXN Selected checked | MXN "Selected" is checked. |
| 2 | Click MXN **Merchant** dropdown ✓ Dropdown opens | The MXN Merchant dropdown opens. |
| 3 | Verify message ✓ "No Matches Found" | The dropdown shows "No Matches Found". |

**Expected**: MXN Merchant dropdown shows no available merchants
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Notes**: MXN has zero merchants in test environment (Office 1604). 

---

## TC-LOC-CUR-011: Select merchant for CAD currency
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select CAD **Selected** checkbox ✓ CAD Selected checked | CAD "Selected" is checked. |
| 2 | Click CAD **Merchant** dropdown ✓ Dropdown opens | The CAD Merchant dropdown opens. |
| 3 | Select "316446 - PSAV Canada/CAD" ✓ Merchant selected, dropdown closes | The dropdown closes and "316446 - PSAV Canada/CAD" is selected. |
| 4 | Verify CAD **Merchant** field ✓ Shows "316446 - PSAV Canada/CAD" | The CAD Merchant field shows "316446 - PSAV Canada/CAD". |

**Expected**: Merchant selection updates the field value
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-012: Merchant value persists when currency unselected
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select CAD **Selected**, assign merchant "316446 - PSAV Canada/CAD" ✓ CAD Selected checked, Merchant assigned | CAD "Selected" is checked and the Merchant field shows "316446 - PSAV Canada/CAD". |
| 2 | Uncheck CAD **Selected** ✓ CAD Selected unchecked | CAD "Selected" is unchecked. |
| 3 | Verify CAD **Merchant** field ✓ Still shows "316446 - PSAV Canada/CAD" | The CAD Merchant field still shows "316446 - PSAV Canada/CAD". |

**Expected**: Merchant value persists even when currency is unselected
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-013: Validation - at least one currency required
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Uncheck USD **Selected** checkbox ✓ Unchecked | USD "Selected" is unchecked. |
| 2 | Verify CAD **Selected** ✓ Already unchecked | CAD "Selected" is unchecked. |
| 3 | Verify MXN **Selected** ✓ Already unchecked | MXN "Selected" is unchecked. |
| 4 | Verify **Save** button state ✓ Save is DISABLED (app prevents save when 0 currencies selected — no error dialog, Save simply stays disabled) | The Save button is disabled. |

**Expected**: Save is disabled (no error dialog) when no currency is selected.
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Cleanup**: Re-check USD **Selected** + USD **Is Default** (unchecking USD auto-unchecks IsDefault) -- click **Save** -- confirm

---

## TC-LOC-CUR-014: Save allowed without default currency
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select USD **Selected** checkbox ✓ USD Selected checked | USD "Selected" is checked. |
| 2 | Ensure USD **Is Default** unchecked ✓ Is Default unchecked | USD "Is Default" is unchecked. |
| 3 | Click **Save** button ✓ Confirmation dialog appears: "Are you sure you want to save the changes?" | The "Save Changes" confirmation dialog appears. |
| 4 | Verify no validation error ✓ No error, only confirmation | No validation error appears — only the confirmation dialog. |

**Expected**: Save allowed even when no default currency is set (confirmation only)
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-015: Save button enabled on field change
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note **Save** button initial state ✓ Disabled | The Save button is disabled. |
| 2 | Click CAD **Selected** checkbox ✓ CAD Selected checked | CAD "Selected" is checked. |
| 3 | Verify **Save** button ✓ Enabled | The Save button is enabled. |

**Expected**: Save button enables when any field is modified
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-016: Change USD merchant selection
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | USD **Merchant** = "316370 - PSAV US/USD" (initial) ✓ Current value displayed | USD Merchant shows "316370 - PSAV US/USD". |
| 2 | Click USD **Merchant** dropdown ✓ Dropdown opens | The USD Merchant dropdown opens. |
| 3 | Select "316426 - Encore Bahamas/USD" ✓ Option selected | "316426 - Encore Bahamas/USD" is selected. |
| 4 | Verify USD **Merchant** field ✓ Shows "316426 - Encore Bahamas/USD" | USD Merchant shows "316426 - Encore Bahamas/USD". |

**Expected**: USD merchant can be changed to alternate option
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Cleanup**: Click USD **Merchant** dropdown -- select "316370 - PSAV US/USD" -- click **Save** -- confirm dialog -- verify USD Merchant = "316370 - PSAV US/USD"

---

## TC-LOC-CUR-017: Multiple currencies selected without default
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select USD **Selected** and CAD **Selected** ✓ Both checked | Both USD "Selected" and CAD "Selected" are checked. |
| 2 | Ensure both **Is Default** unchecked ✓ Both unchecked | Both "Is Default" checkboxes are unchecked. |
| 3 | Click **Save** button ✓ Confirmation dialog appears | The "Save Changes" confirmation dialog appears. |
| 4 | Verify no validation error ✓ No error | No validation error appears. |

**Expected**: Multiple currencies can be selected without designating a default
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-018: Currency Code field is read-only
| Priority | Status | Type |
|----------|--------|------|
| Low | ✅ Automated | User-Requested |

**Depends_On**: none (read-only structural — column-cell behaviour, no state mutation)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Attempt to click USD **Currency Code** field ✓ No input field becomes editable | No input field becomes editable after clicking the USD Currency Code cell. |
| 2 | Verify field behavior ✓ Static text only, not editable | The cell displays static text only and cannot be edited. |

**Expected**: Currency Code column is read-only/static
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-019: Merchant dropdown available for unselected currency
| Priority | Status | Type |
|----------|--------|------|
| Low | ✅ Automated | User-Requested |

**Depends_On**: none (read-only structural — dropdown accessibility, no state mutation)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | CAD **Selected** unchecked (initial) ✓ Unchecked | CAD "Selected" is unchecked. |
| 2 | Click CAD **Merchant** dropdown ✓ Dropdown opens | The CAD Merchant dropdown opens. |
| 3 | Verify dropdown accessible ✓ Options displayed (not disabled) | The dropdown displays its options and is not disabled. |

**Expected**: Merchant dropdown is accessible even when currency is not selected
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-020: All three currencies can be selected simultaneously
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select USD **Selected** ✓ Checked | USD "Selected" is checked. |
| 2 | Select CAD **Selected** ✓ Checked | CAD "Selected" is checked. |
| 3 | Select MXN **Selected** ✓ Checked | MXN "Selected" is checked. |
| 4 | Verify all checkboxes ✓ All three **Selected** checkboxes checked | All three "Selected" checkboxes are checked simultaneously. |

**Expected**: All three currencies can be selected at the same time
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-021: Selected currency persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Round-Trip Persistence |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Check CAD **Selected** checkbox ✓ CAD Selected checked | CAD "Selected" is checked. |
| 3 | Verify **Save** button enabled ✓ Enabled | The Save button is enabled. |
| 4 | Click **Save** ✓ Save dialog confirmed, save completes | The save dialog is confirmed and the save completes. |
| 5 | Verify **Save** button disabled ✓ Disabled (post-save) | The Save button is disabled. |
| 6 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab reloads and its content is visible. |
| 7 | Verify CAD **Selected** ✓ Still checked (persisted) | CAD "Selected" is still checked. |

**Expected**: Selecting a currency and saving persists the selection through page reload
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Cleanup**: Uncheck CAD **Selected** -- click **Save** -- confirm dialog

---

## TC-LOC-CUR-022: Merchant change persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Round-Trip Persistence |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Open USD **Merchant** dropdown, select "316426 - Encore Bahamas/USD" ✓ Merchant changed | USD Merchant shows "316426 - Encore Bahamas/USD". |
| 3 | Verify USD **Merchant** field ✓ Shows "316426" | The USD Merchant field shows "316426". |
| 4 | Verify **Save** enabled ✓ Enabled | The Save button is enabled. |
| 5 | Click **Save** ✓ Save completes | The save completes. |
| 6 | Verify **Save** disabled ✓ Disabled (post-save) | The Save button is disabled. |
| 7 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab reloads and its content is visible. |
| 8 | Verify USD **Merchant** ✓ Still shows "316426 - Encore Bahamas/USD" (persisted) | USD Merchant still shows "316426 - Encore Bahamas/USD". |

**Expected**: Changing merchant and saving persists the selection through page reload
**Data**: office=1604 | alternate_merchant=316426 - Encore Bahamas/USD
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Cleanup**: Select USD **Merchant** "316370 - PSAV US/USD" (original) -- click **Save** -- confirm dialog

---

## TC-LOC-CUR-023: IsDefault change persists after save and reload (cascade)
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Round-Trip Persistence |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Check CAD **Selected** checkbox ✓ CAD Selected checked | CAD "Selected" is checked. |
| 3 | Check CAD **Is Default** checkbox ✓ CAD Is Default checked | CAD "Is Default" is checked. |
| 4 | Verify USD **Is Default** auto-unchecked ✓ Unchecked (cascade) | USD "Is Default" is automatically unchecked. |
| 5 | Verify **Save** enabled ✓ Enabled | The Save button is enabled. |
| 6 | Click **Save** ✓ Save completes | The save completes. |
| 7 | Verify **Save** disabled ✓ Disabled (post-save) | The Save button is disabled. |
| 8 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab reloads and its content is visible. |
| 9 | Verify CAD **Is Default** ✓ Checked (persisted) | CAD "Is Default" is checked. |
| 10 | Verify USD **Is Default** ✓ Unchecked (cascade persisted) | USD "Is Default" is unchecked. |

**Expected**: Changing default currency and saving persists the cascade through page reload
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Cleanup**: Uncheck CAD **Selected** (auto-disables CAD Is Default) -- check USD **Is Default** -- click **Save** -- confirm dialog

---

## TC-LOC-CUR-024: Combined changes persist after single save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Round-Trip Persistence |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Check CAD **Selected** checkbox ✓ CAD Selected checked | CAD "Selected" is checked. |
| 3 | Change USD **Merchant** to "316426 - Encore Bahamas/USD" ✓ Merchant changed | USD Merchant shows "316426 - Encore Bahamas/USD". |
| 4 | Verify **Save** enabled ✓ Enabled | The Save button is enabled. |
| 5 | Click **Save** (single save for both changes) ✓ Save completes | The save completes. |
| 6 | Verify **Save** disabled ✓ Disabled (post-save) | The Save button is disabled. |
| 7 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab reloads and its content is visible. |
| 8 | Verify CAD **Selected** ✓ Checked (persisted) | CAD "Selected" is checked. |
| 9 | Verify USD **Merchant** ✓ Shows "316426 - Encore Bahamas/USD" (persisted) | USD Merchant shows "316426 - Encore Bahamas/USD". |

**Expected**: Multiple changes in a single save cycle all persist through page reload
**Data**: office=1604 | alternate_merchant=316426 - Encore Bahamas/USD
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Cleanup**: Uncheck CAD **Selected** -- select USD **Merchant** "316370 - PSAV US/USD" -- click **Save** -- confirm dialog

---

## TC-LOC-CUR-025: Cancel save discards changes — reload shows original state
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Check CAD **Selected** checkbox ✓ CAD Selected checked | CAD "Selected" is checked. |
| 3 | Verify **Save** enabled ✓ Enabled | The Save button is enabled. |
| 4 | Click **Save** button ✓ Save Changes dialog appears | The "Save Changes" dialog appears. |
| 5 | Click **Cancel** on Save Changes dialog ✓ Dialog dismissed | The dialog closes and the Currency tab remains with the pending change in place. |
| 6 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab reloads and its content is visible. |
| 7 | Verify CAD **Selected** ✓ Unchecked (change was NOT saved) | CAD "Selected" is unchecked, confirming the change was not saved. |

**Expected**: Cancelling the Save Changes dialog discards all pending changes
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Notes**: No cleanup needed — cancel means nothing was saved

---

## TC-LOC-CUR-026: Browser warns before leaving the page when there are unsaved changes
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Check CAD **Selected** checkbox ✓ CAD Selected checked (when there are unsaved changes) | CAD "Selected" is checked. |
| 3 | Verify **Save** enabled ✓ Enabled | The Save button is enabled. |
| 4 | Attempt page reload ✓ The browser's leave-page confirmation fires | The browser's leave-page confirmation dialog appears. |
| 5 | Dismiss dialog (stay on page) ✓ Page stays | The dialog is dismissed and the page remains on the Currency tab. |

**Expected**: The browser's leave-page confirmation fires when attempting to navigate away when there are unsaved changes
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Cleanup**: Reload and navigate to **Currency** tab to discard unsaved changes
**Notes**: MCP-verified (MCP-4)

---

## TC-LOC-CUR-027: No-default state persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | Edge Case |

**Depends_On**: TC-LOC-CUR-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab loads and its content is visible. |
| 2 | Uncheck USD **Is Default** checkbox ✓ Unchecked (no currency is default) | USD "Is Default" is unchecked. |
| 3 | Verify **Save** enabled ✓ Enabled | The Save button is enabled. |
| 4 | Click **Save** ✓ Save dialog confirmed, save completes | The save dialog is confirmed and the save completes. |
| 5 | Verify **Save** disabled ✓ Disabled (post-save) | The Save button is disabled. |
| 6 | Reload and navigate to **Currency** tab ✓ Tab loads | The Currency tab reloads and its content is visible. |
| 7 | Verify USD **Is Default** ✓ Still unchecked (no-default state persisted) | USD "Is Default" is unchecked. |

**Expected**: Saving with no default currency set persists that state through page reload
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Cleanup**: Check USD **Is Default** -- click **Save** -- confirm dialog

---

## Granular Cases

Added 2026-06-17 — per-field-type case-completeness pass over the 3×4 currency grid. The 27 cases above already provide near-complete (surface × case) coverage; this pass adds the one genuinely-uncovered assertion and records the full coverage classification.

### Coverage classification (every editable surface × taxonomy case)

| Surface | Case | Disposition |
|---|---|---|
| Selected USD/CAD/MXN | default-state | covered (TC-002/003/004) |
| Selected CAD | toggle→Save-enables | covered (TC-015) |
| Selected CAD | check-persist (save+reload) | covered (TC-021) |
| Selected | revert-to-saved → Save re-disables (no net change) | **net-new TC-028** |
| Is Default (all) | cascade-enable / single-default / disable-on-unselect / persist | covered (TC-005/006/007/010/023/027) |
| USD Merchant | options / change / save-cycle persist + restore | covered (TC-008/016/022) |
| CAD Merchant | options / select / persist-when-unselected | covered (TC-009/011/012) |
| CAD / MXN Merchant | save-cycle round-trip | deferred — data-thin (CAD 1 option, MXN 0 options) on office 1604; no alternate to round-trip |
| MXN Merchant | empty ("No Matches Found") | covered (TC-010) |
| Grid rule: cascade / single-default / at-least-one | behavior | covered (TC-005/006/013) |
| Currency Code (USD/CAD/MXN) | read-only / static | covered (TC-018; live-probed static, no interactive affordance) |

---

## TC-LOC-CUR-028: Reverting a currency selection re-disables Save (no net change)
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: none (per-test enforced baseline)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | From the enforced default state, click CAD **Selected** ✓ CAD Selected checked, **Save** enabled | CAD "Selected" is checked and the Save button is enabled. |
| 2 | Uncheck CAD **Selected** (revert to saved state) ✓ CAD Selected unchecked | CAD "Selected" is unchecked. |
| 3 | Verify **Save** button ✓ Returns to disabled (form detects no net change) | The Save button is disabled. |

**Expected**: Reverting a checkbox change back to its saved state re-disables Save (the form detects no actual change, so there is nothing to save). The form compares against the saved state, not just whether a change event fired.
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-currency.spec.ts
**Notes**: No cleanup — no save issued; the per-test baseline re-enforces the default state for the next test.
