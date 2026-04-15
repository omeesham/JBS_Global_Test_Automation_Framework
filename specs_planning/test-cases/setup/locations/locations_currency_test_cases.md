# Location - Currency Test Cases

| Module | Test Cases | Automated | Manual | Out of Scope | Updated |
|--------|------------|-----------|--------|--------------|--------|
| Locations | 28 | 27 (96%) | 1 (4%) | 0 (0%) | 2026-04-14 |

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
| 8 | Merchant (USD) | combobox | `drpUSDMerchant` / `drpCurrencyMerchant('USD')` | "316370 - PSAV US/USD" | always editable |
| 9 | Merchant (CAD) | combobox | `drpCADMerchant` / `drpCurrencyMerchant('CAD')` | (1 option) | always editable |
| 10 | Merchant (MXN) | combobox | `drpMXNMerchant` / `drpCurrencyMerchant('MXN')` | (0 options) | always editable |
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

---

## TC-LOC-CUR-001: Verify Currency grid default state
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Steps**: 1. Navigate to Setup > Location > 1604 -- **Currency** tab ✓ Tab loads 2. Verify grid structure ✓ 4 columns visible: Currency Code, Selected, Is Default, Merchant
**Expected**: Grid displays 3 currencies (USD, CAD, MXN) with correct column headers
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-002: Verify USD default configuration
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Steps**: 1. Open **Currency** tab ✓ Tab loads 2. Check USD row ✓ **Selected** checkbox checked, **Is Default** checkbox checked, **Merchant** = "316370 - PSAV US/USD"
**Expected**: USD is selected and set as default with merchant assigned
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-003: Verify CAD default state
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. Open **Currency** tab ✓ Tab loads 2. Check CAD row ✓ **Selected** unchecked, **Is Default** disabled, **Merchant** dropdown available
**Expected**: CAD is unselected with Is Default disabled
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-004: Verify MXN default state  
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. Open **Currency** tab ✓ Tab loads 2. Check MXN row ✓ **Selected** unchecked, **Is Default** disabled, **Merchant** dropdown available
**Expected**: MXN is unselected with Is Default disabled
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-005: Verify Is Default Enables When Currency Is Selected
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Steps**: 1. CAD **Is Default** is disabled (initial state) ✓ Disabled 2. Click CAD **Selected** checkbox ✓ Checked, Save button enabled 3. Verify CAD **Is Default** ✓ Enabled (clickable)
**Expected**: Selecting a currency enables its Is Default checkbox
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-006: Single default rule - auto-uncheck previous default
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Steps**: 1. USD **Is Default** checked (initial) ✓ Checked 2. Select CAD **Selected** checkbox ✓ CAD Selected checked 3. Click CAD **Is Default** checkbox ✓ CAD Is Default checked 4. Verify USD **Is Default** ✓ Auto-unchecked
**Expected**: Only ONE default currency allowed; setting new default auto-unchecks previous
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Cleanup**: Uncheck CAD **Selected** -- click USD **Is Default** to restore it checked -- click **Save** -- confirm dialog -- verify USD Selected=checked, USD Is Default=checked, CAD Selected=unchecked

---

## TC-LOC-CUR-007: Unselecting currency disables Is Default
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Steps**: 1. Select CAD **Selected**, set CAD **Is Default** ✓ Both checked 2. Uncheck CAD **Selected** ✓ Unchecked 3. Verify CAD **Is Default** ✓ Disabled and unchecked
**Expected**: Unselecting currency disables and unchecks Is Default
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Cleanup**: Click USD **Is Default** to restore it checked -- click **Save** -- confirm dialog -- verify USD Selected=checked, USD Is Default=checked, CAD Selected=unchecked, CAD Is Default=disabled

---

## TC-LOC-CUR-008: USD Merchant dropdown options
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. Click USD **Merchant** dropdown ✓ Dropdown opens 2. Verify options ✓ Two options: "316370 - PSAV US/USD", "316426 - Encore Bahamas/USD"
**Expected**: USD Merchant dropdown shows 2 merchant options
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-009: CAD Merchant dropdown options
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. Select CAD **Selected** checkbox ✓ CAD Selected checked 2. Click CAD **Merchant** dropdown ✓ Dropdown opens 3. Verify option ✓ One option: "316446 - PSAV Canada/CAD"
**Expected**: CAD Merchant dropdown shows 1 merchant option
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-010: MXN Merchant dropdown - no options
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. Select MXN **Selected** checkbox ✓ MXN Selected checked 2. Click MXN **Merchant** dropdown ✓ Dropdown opens 3. Verify message ✓ "No Matches Found"
**Expected**: MXN Merchant dropdown shows no available merchants
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Notes**: MXN has zero merchants in test environment (Office 1604). Verify with Product Owner if intentional or data gap.

---

## TC-LOC-CUR-011: Select merchant for CAD currency
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. Select CAD **Selected** checkbox ✓ CAD Selected checked 2. Click CAD **Merchant** dropdown ✓ Dropdown opens 3. Select "316446 - PSAV Canada/CAD" ✓ Merchant selected, dropdown closes 4. Verify CAD **Merchant** field ✓ Shows "316446 - PSAV Canada/CAD"
**Expected**: Merchant selection updates the field value
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-012: Merchant value persists when currency unselected
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Steps**: 1. Select CAD **Selected**, assign merchant "316446 - PSAV Canada/CAD" ✓ CAD Selected checked, Merchant assigned 2. Uncheck CAD **Selected** ✓ CAD Selected unchecked 3. Verify CAD **Merchant** field ✓ Still shows "316446 - PSAV Canada/CAD"
**Expected**: Merchant value persists even when currency is unselected
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-013: Validation - at least one currency required
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Steps**: 1. Uncheck USD **Selected** checkbox ✓ Unchecked 2. Verify CAD **Selected** ✓ Already unchecked 3. Verify MXN **Selected** ✓ Already unchecked 4. Verify **Save** button state ✓ Save is DISABLED (app prevents save when 0 currencies selected — no error dialog, Save simply stays disabled)
**Expected**: Save blocked (disabled) when no currencies selected. NOTE: Planner expected error dialog ("At least one currency must be selected") — actual app behavior is Save button disable, not error notification. Corrected during generation 2026-02-25.
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Cleanup**: Re-check USD **Selected** + USD **Is Default** (unchecking USD auto-unchecks IsDefault) -- click **Save** -- confirm

---

## TC-LOC-CUR-014: Save allowed without default currency
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. Select USD **Selected** checkbox ✓ USD Selected checked 2. Ensure USD **Is Default** unchecked ✓ Is Default unchecked 3. Click **Save** button ✓ Confirmation dialog appears: "Are you sure you want to save the changes?" 4. Verify no validation error ✓ No error, only confirmation
**Expected**: Save allowed even when no default currency is set (confirmation only)
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-015: Save button enabled on field change
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. Note **Save** button initial state ✓ Disabled 2. Click CAD **Selected** checkbox ✓ CAD Selected checked 3. Verify **Save** button ✓ Enabled
**Expected**: Save button enables when any field is modified
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-016: Change USD merchant selection
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. USD **Merchant** = "316370 - PSAV US/USD" (initial) ✓ Current value displayed 2. Click USD **Merchant** dropdown ✓ Dropdown opens 3. Select "316426 - Encore Bahamas/USD" ✓ Option selected 4. Verify USD **Merchant** field ✓ Shows "316426 - Encore Bahamas/USD"
**Expected**: USD merchant can be changed to alternate option
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Cleanup**: Click USD **Merchant** dropdown -- select "316370 - PSAV US/USD" -- click **Save** -- confirm dialog -- verify USD Merchant = "316370 - PSAV US/USD"

---

## TC-LOC-CUR-017: Multiple currencies selected without default
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. Select USD **Selected** and CAD **Selected** ✓ Both checked 2. Ensure both **Is Default** unchecked ✓ Both unchecked 3. Click **Save** button ✓ Confirmation dialog appears 4. Verify no validation error ✓ No error
**Expected**: Multiple currencies can be selected without designating a default
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-018: Currency Code field is read-only
| Priority | Status | Type |
|----------|--------|------|
| Low | ✅ Automated | User-Requested |

**Steps**: 1. Attempt to click USD **Currency Code** field ✓ No input field becomes editable 2. Verify field behavior ✓ Static text only, not editable
**Expected**: Currency Code column is read-only/static
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-019: Merchant dropdown available for unselected currency
| Priority | Status | Type |
|----------|--------|------|
| Low | ✅ Automated | User-Requested |

**Steps**: 1. CAD **Selected** unchecked (initial) ✓ Unchecked 2. Click CAD **Merchant** dropdown ✓ Dropdown opens 3. Verify dropdown accessible ✓ Options displayed (not disabled)
**Expected**: Merchant dropdown is accessible even when currency is not selected
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-020: All three currencies can be selected simultaneously
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | User-Requested |

**Steps**: 1. Select USD **Selected** ✓ Checked 2. Select CAD **Selected** ✓ Checked 3. Select MXN **Selected** ✓ Checked 4. Verify all checkboxes ✓ All three **Selected** checkboxes checked
**Expected**: All three currencies can be selected at the same time
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts

---

## TC-LOC-CUR-021: Selected currency persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Round-Trip Persistence |

**Steps**: 1. Reload and navigate to **Currency** tab ✓ Tab loads 2. Check CAD **Selected** checkbox ✓ CAD Selected checked 3. Verify **Save** button enabled ✓ Enabled 4. Click **Save** ✓ Save dialog confirmed, save completes 5. Verify **Save** button disabled ✓ Disabled (post-save) 6. Reload and navigate to **Currency** tab ✓ Tab loads 7. Verify CAD **Selected** ✓ Still checked (persisted)
**Expected**: Selecting a currency and saving persists the selection through page reload
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Cleanup**: Uncheck CAD **Selected** -- click **Save** -- confirm dialog

---

## TC-LOC-CUR-022: Merchant change persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Round-Trip Persistence |

**Steps**: 1. Reload and navigate to **Currency** tab ✓ Tab loads 2. Open USD **Merchant** dropdown, select "316426 - Encore Bahamas/USD" ✓ Merchant changed 3. Verify USD **Merchant** field ✓ Shows "316426" 4. Verify **Save** enabled ✓ Enabled 5. Click **Save** ✓ Save completes 6. Verify **Save** disabled ✓ Disabled (post-save) 7. Reload and navigate to **Currency** tab ✓ Tab loads 8. Verify USD **Merchant** ✓ Still shows "316426 - Encore Bahamas/USD" (persisted)
**Expected**: Changing merchant and saving persists the selection through page reload
**Data**: office=1604 | alternate_merchant=316426 - Encore Bahamas/USD
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Cleanup**: Select USD **Merchant** "316370 - PSAV US/USD" (original) -- click **Save** -- confirm dialog

---

## TC-LOC-CUR-023: IsDefault change persists after save and reload (cascade)
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Round-Trip Persistence |

**Steps**: 1. Reload and navigate to **Currency** tab ✓ Tab loads 2. Check CAD **Selected** checkbox ✓ CAD Selected checked 3. Check CAD **Is Default** checkbox ✓ CAD Is Default checked 4. Verify USD **Is Default** auto-unchecked ✓ Unchecked (cascade) 5. Verify **Save** enabled ✓ Enabled 6. Click **Save** ✓ Save completes 7. Verify **Save** disabled ✓ Disabled (post-save) 8. Reload and navigate to **Currency** tab ✓ Tab loads 9. Verify CAD **Is Default** ✓ Checked (persisted) 10. Verify USD **Is Default** ✓ Unchecked (cascade persisted)
**Expected**: Changing default currency and saving persists the cascade through page reload
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Cleanup**: Uncheck CAD **Selected** (auto-disables CAD Is Default) -- check USD **Is Default** -- click **Save** -- confirm dialog

---

## TC-LOC-CUR-024: Combined changes persist after single save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Round-Trip Persistence |

**Steps**: 1. Reload and navigate to **Currency** tab ✓ Tab loads 2. Check CAD **Selected** checkbox ✓ CAD Selected checked 3. Change USD **Merchant** to "316426 - Encore Bahamas/USD" ✓ Merchant changed 4. Verify **Save** enabled ✓ Enabled 5. Click **Save** (single save for both changes) ✓ Save completes 6. Verify **Save** disabled ✓ Disabled (post-save) 7. Reload and navigate to **Currency** tab ✓ Tab loads 8. Verify CAD **Selected** ✓ Checked (persisted) 9. Verify USD **Merchant** ✓ Shows "316426 - Encore Bahamas/USD" (persisted)
**Expected**: Multiple changes in a single save cycle all persist through page reload
**Data**: office=1604 | alternate_merchant=316426 - Encore Bahamas/USD
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Cleanup**: Uncheck CAD **Selected** -- select USD **Merchant** "316370 - PSAV US/USD" -- click **Save** -- confirm dialog

---

## TC-LOC-CUR-025: Cancel save discards changes — reload shows original state
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Steps**: 1. Reload and navigate to **Currency** tab ✓ Tab loads 2. Check CAD **Selected** checkbox ✓ CAD Selected checked 3. Verify **Save** enabled ✓ Enabled 4. Click **Save** button ✓ Save Changes dialog appears 5. Click **Cancel** on Save Changes dialog ✓ Dialog dismissed 6. Reload and navigate to **Currency** tab ✓ Tab loads 7. Verify CAD **Selected** ✓ Unchecked (change was NOT saved)
**Expected**: Cancelling the Save Changes dialog discards all pending changes
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Notes**: No cleanup needed — cancel means nothing was saved

---

## TC-LOC-CUR-026: Beforeunload dialog fires when form is dirty
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Steps**: 1. Reload and navigate to **Currency** tab ✓ Tab loads 2. Check CAD **Selected** checkbox ✓ CAD Selected checked (form dirty) 3. Verify **Save** enabled ✓ Enabled 4. Attempt page reload ✓ Beforeunload dialog fires 5. Dismiss dialog (stay on page) ✓ Page stays
**Expected**: Browser beforeunload dialog fires when attempting to navigate away from a dirty form
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Cleanup**: Reload and navigate to **Currency** tab to discard dirty state
**Notes**: MCP-verified 2026-04-06 (MCP-4)

---

## TC-LOC-CUR-027: No-default state persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | Edge Case |

**Steps**: 1. Reload and navigate to **Currency** tab ✓ Tab loads 2. Uncheck USD **Is Default** checkbox ✓ Unchecked (no currency is default) 3. Verify **Save** enabled ✓ Enabled 4. Click **Save** ✓ Save dialog confirmed, save completes 5. Verify **Save** disabled ✓ Disabled (post-save) 6. Reload and navigate to **Currency** tab ✓ Tab loads 7. Verify USD **Is Default** ✓ Still unchecked (no-default state persisted)
**Expected**: Saving with no default currency set persists that state through page reload
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: tests/specs/locations/location-currency.spec.ts
**Cleanup**: Check USD **Is Default** -- click **Save** -- confirm dialog

---

# Integration: History Verification Test Cases

## TC-LOC-HIST-003: Currency Saves — Location Management History Row Verification

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Integration | Yes |

**Completed saves to verify**: TC-LOC-CUR-021 (CAD Selected), TC-LOC-CUR-023 (CAD+default cascade), TC-LOC-CUR-024 (CAD+merchant), TC-LOC-CUR-027 (USD IsDefault uncheck)

**Steps**:
1. After CUR save TCs complete, navigate to Location Management History tab -> Tab loads
2. Verify new rows exist: row count increased -> Count increased
3. Verify latest row Modified On timestamp is recent (+/-5 min) -> Timestamp check
4. Verify col 6 Currency reflects latest saved state -> Value matches
5. Verify col 64 Currency (2nd — pricing currency) if pricing currency changed -> Value check
6. Note: TC-LOC-CUR-022/024 merchant changes are NOT-TRACKED (no column in 87) -> Confirm no merchant column

**Expected**: Currency selection saves produce history rows. Col 6/64 reflect currency state. Merchant dropdown changes NOT tracked in history.
**Data**: location=1604 | Formats per SP1_MCP_FINDINGS.md section 1
**Automatable**: Yes
