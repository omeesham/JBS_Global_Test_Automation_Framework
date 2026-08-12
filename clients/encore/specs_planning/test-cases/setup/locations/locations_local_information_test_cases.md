# Location - Local Information Test Cases

**Module**: locations

**Numbering note (2026-06-11)**: the former neutral-eye sub-series TC-LOC-LI-NE-011..047 was folded into the numeric sequence as TC-LOC-LI-078..114 (offset +67), and TC-LOC-LI-SKIP-BILLING was renamed back to TC-LOC-LI-070 (the slot it physically occupies). Letter-suffixed IDs (008A, 024A) are the registered insertion mechanism (module-codes.json). Gaps 049/050/056 = removed cases (see in-file notes).

| Module | Test Cases | Automated | Manual | Out of Scope | Updated |
|--------|------------|-----------|--------|--------------|---------|
| Locations | 114 | 26 (23%) | 88 (77%) | 0 (0%) | |
---

## FIELD INVENTORY & DISCOVERY

Total Fields: 54 interactive fields (live count via SP-DQU-04 LI neutral-eye audit — `radix-_r_1i_-content-local-information` panel)
- Checkboxes: 41 (34 editable, 7 always- or context-disabled)
- fields: 6 (4 have checkbox dependencies, 2 standalone)
- Radio Groups: 2 (Billing Type, Billing Way)
- Textboxes: 2 (Oracle Product, Oracle Department)
- Dropdowns: 2 (Oracle Organization, Billing Cycle)
- Date Pickers: 1 (Effective Date - disabled)

Note on field Values: All field percentage values are stored as raw decimals (0.04 = 0.04%, not 4%). When entering test data, use the literal decimal value (e.g., 0.04 for 4%).

Field Dependencies Discovered:
- chkApplyLDW -- spinLDWPercentage (unchecking resets to 0)
- chkApplyCablesConsumablesFee -- spinCCPercentage
- chkAllowETS -- spinETSPercentage (RECONFIRMED : enabling on office 1604 non-union sets value to 23.00%; v1 0.23/0.24 union/non-union default is correct — earlier "stays at 0" annotation was a stale mid-cycle observation)
- chkAllowResortTax -- spinResortTaxPercentage (resets on disable AND first enable)
- chkAllowServiceCharge -- chkIsAdministrativeFee, chkCalcServiceChargeOnNet (parent to children dependency per LI v1 convention; CURRENTLY BROKEN on new site — children remain checked + enabled with parent unchecked. See.)
- chkSkipBilling -- disables txtOracleProduct, txtOracleDepartment, drpOracleOrganization (all become required when unchecked)
- chkAllowDPCD + chkPromptForApproval -- spinThreshold (DUAL dependency: both must be true to enable)
- chkCommReceiver -- chkAllowDPCD, chkShowSubRental (disabled when CommReceiver=false)
- chkInternalCompany -- chkEnableIDCBilling (disabled when InternalCompany=false)
- chkHRIRemitTax OR chkHRIRemitTax2 -- chkDisplayTax (auto-set to true, disabled)
- rdoBillingWay change -- API validation, enables btnBillingWayEffectiveDate on success, reverts on error

Conditionally-Disabled Fields (Context-Dependent):
- chkSuppressDayRateDiscount (always disabled)
- chkCompassIntegration (disabled when !isNew - updating existing location)
- chkDisplayTax (disabled when HRIRemitTax OR HRIRemitTax2 = true)
- chkUseEsignature (always disabled — observed disabled on office 1604 default state per SP-DQU-04 ; not present in v1 disabled-list)
- chkEnableProductGroup (always disabled — observed disabled on office 1604 default state per SP-DQU-04 ; not present in v1 disabled-list)
- chkDiscountGuidance (always disabled — observed disabled on office 1604 default state per SP-DQU-04 ; not present in v1 disabled-list)
- btnEffectiveDate (disabled by default, enabled after successful Billing Way API change)
- drpBillingCycle (disabled when localBillingRan is true via API)
- spinThreshold, chkAllowDPCD, chkShowSubRental, chkEnableIDCBilling, multiple fields (disabled when canEditLoc=false)

Validation Rules Discovered:
- fields: min=0, max=100, step=0.01 (Threshold: step=0.1)
- Oracle Product: maxLength=25, REQUIRED when SkipBilling is false
- Oracle Department: maxLength=25, REQUIRED when SkipBilling is false
- Oracle Organization: REQUIRED when SkipBilling is false (billingReq error)
- BillingCycleID: REQUIRED, cannot be 0, shows exclamation icon
- BillingWay Effective Date: must be >= today (no past dates), validated via BillingWay date validation
- Legal ServiceChargeId: REQUIRED for all Legal array items (SCNAME_IS_REQD)
- Legal TermsConditionsId: REQUIRED for all Legal array items (TCNAME_IS_REQD)
- Validation fires on page LOAD, not on save
- Invalid values persist to database, show errors on reload
- API validations: Billing Way change, Billing Cycle change
- Save endpoint: page-level Save POSTs to the page URL itself (Next.js + React Hook Form Server Action pattern — `POST /navigator/locations/{id}/settings/location`), NOT a separate `/api/save` the application endpoint. On server failure (e.g. 503) the new-site UI renders no error toast or dialog (silent failure mode). Tests asserting Save behavior MUST also assert that an error feedback surface (toast / dialog / inline message) is rendered on save failure — see primary symptom. (---

## Validation Rules

| Rule | Behaviour |
|---|---|
| Percentage spin fields: min 0, max 100, step 0.01 (Threshold: step 0.1) | Values outside range are rejected |
| Oracle Product is required when Skip Billing is unchecked | maxLength=25; field is required when SkipBilling=false |
| Oracle Department is required when Skip Billing is unchecked | maxLength=25; field is required when SkipBilling=false |
| Oracle Organization is required when Skip Billing is unchecked | Required when SkipBilling=false; shows billing requirement error |
| Billing Cycle ID is required | Cannot be 0; shows an exclamation icon when unset |
| Billing Way Effective Date must be today or future | Past dates are rejected via BillingWay date validation |

---

## MCP_VERIFICATION_LOG

Observations for this module were recorded before the verification-log convention existed; the paired
field inventory is absent (a neutral-eye audit exists at
`_internal/neutral-eye-audits/local-information-2026-04-27.md` but predates the field-inventory
convention and was performed under degraded backend conditions). A fresh walk must populate this
table before the next behavioural edit to this file.

---
## TC-LOC-LI-001: Verify Navigate to Office 1604 Local Information Tab
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Navigation |

**Depends_On**: none (baseline-enforcement per LR-019)
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-001)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the location Settings page and verify it loads. | The Location Settings page loads and the URL reflects the office 1604 settings path. |
| 2 | Verify the "Basic Information" tab is selected with the left and right panels visible. | The "Basic Information" tab is active with the left panel and right panel both visible. |
| 3 | Click the "Local Information" tab and verify it activates. | The "Local Information" tab becomes active and its content panel is displayed. |
| 4 | Verify the Local Information panel loads with all fields visible and "Save" button disabled. | The Local Information panel shows all fields and the Save button is disabled. |

**Expected**: Local Information tab displays all fields in default state, Save button disabled
**Data**: `Office=1604` | `URL=locations/1604/settings`
**Automatable**: Yes

---

## TC-LOC-LI-002: Verify Apply LDW Checkbox Default State
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field State |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-002 batch defaults)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Apply LDW" checkbox is checked | The "Apply LDW" checkbox is checked. |
| 2 | Verify "LDW Percentage" field is enabled and read its current value as the office baseline. Office 1604 currently shows `0.00%`, so do not assert a fixed default value. | The "LDW Percentage" field is enabled and displays the office baseline value. |

**Expected**: Apply LDW is checked by default. The LDW Percentage field is enabled. Its value is the office's saved setting; there is no fixed default value.
**Data**: `chkApplyLDW=checked` | `spinLDWPercentage=read-as-baseline` | `office=1604 (live default 0.00%)`
**Automatable**: Yes

---

## TC-LOC-LI-003: Verify Apply LDW disables LDW Percentage and Calculate LDW on Net Amount
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Status: Blocked by (calc-on-net sibling cascade currently broken — children stay enabled when parent unchecked).

Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read "LDW Percentage" field value and "Calculate LDW On Net Amount" checkbox state and store originals | The original LDW Percentage value and Calculate LDW On Net Amount state are read and stored. |
| 2 | Uncheck "Apply LDW" checkbox | The "Apply LDW" checkbox is unchecked. |
| 3 | Verify "LDW Percentage" field is disabled with value reset to 0 | The "LDW Percentage" field is disabled and its value is 0. |
| 4 | Verify "Calculate LDW On Net Amount" checkbox is disabled AND unchecked | The "Calculate LDW On Net Amount" checkbox is disabled and unchecked. |
| 5 | Re-check "Apply LDW" checkbox | The "Apply LDW" checkbox is checked again. |
| 6 | Verify "LDW Percentage" field is enabled with value remaining at 0 (NOT restored) | The "LDW Percentage" field is enabled and shows 0 (the original value is not restored). |
| 7 | Verify "Calculate LDW On Net Amount" checkbox is enabled and respects its prior baseline state | The "Calculate LDW On Net Amount" checkbox is enabled and reflects its prior baseline state. |

**Expected**: Unchecking Apply LDW should disable BOTH the LDW Percentage field (value resets to 0) AND the Calculate LDW On Net Amount checkbox, matching the dependency behavior of the other parent-and-children field groups. On the live site today, only the LDW Percentage field disables; the Calculate LDW On Net Amount checkbox stays checked and enabled when the parent is unchecked. This is a known open issue, so this check is expected to fail until it is fixed.
**Data**: `chkApplyLDW=toggle` | `spinLDWPercentage=baseline to 0 to 0` | `chkCalcLDWOnNetAmount=baseline to disabled+unchecked to enabled+baseline` | `bug=`
**Automatable**: Yes (assertion currently fails on new site; pin against fix)

---

## TC-LOC-LI-004: Verify Apply C&C Fee Checkbox Dependency AND Calculate C&C On Net Amount Sibling
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Status: Blocked by (calc-on-net sibling cascade currently broken — children stay enabled when parent unchecked).

Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop — pending: chkApplyCablesConsumablesFee disabled for office 1604)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Apply C&C Fee" checkbox baseline state and read "Calculate C&C On Net Amount" sibling baseline | The "Apply C&C Fee" baseline state and "Calculate C&C On Net Amount" sibling baseline are read and stored. |
| 2 | Verify "C&C Percentage" field state matches parent (enabled when parent checked, disabled when parent unchecked) | The "C&C Percentage" field is enabled when the parent is checked and disabled when the parent is unchecked. |
| 3 | Toggle "Apply C&C Fee" off (if currently checked, uncheck) | The "Apply C&C Fee" checkbox is unchecked. |
| 4 | Verify "C&C Percentage" field is disabled with value 0 | The "C&C Percentage" field is disabled and shows 0. |
| 5 | Verify "Calculate C&C On Net Amount" checkbox is disabled AND unchecked | The "Calculate C&C On Net Amount" checkbox is disabled and unchecked. |
| 6 | Toggle "Apply C&C Fee" back on | The "Apply C&C Fee" checkbox is checked again. |
| 7 | Verify "C&C Percentage" field re-enables | The "C&C Percentage" field is re-enabled. |
| 8 | Verify "Calculate C&C On Net Amount" checkbox is re-enabled and Save button transitions to enabled with the unsaved changes | The "Calculate C&C On Net Amount" checkbox is re-enabled and the Save button becomes enabled. |

**Expected**: Toggling Apply C&C Fee enables/disables BOTH the C&C Percentage field AND the Calculate C&C On Net Amount sibling checkbox (per old-site baseline parent-to-children dependency convention — same expectation as Allow Service Charge children + Apply LDW children).
Actual on the live site: only the C&C Percentage field disables when parent is unchecked; the Calculate C&C On Net Amount sibling checkbox stays checked + enabled. Save-cycle persistence of this state has not yet been verified.
**Data**: `chkApplyCablesConsumablesFee=toggle` | `spinCCPercentage=enabled-to-disabled-to-enabled` | `chkCalcCACOnNetAmount=baseline-to-disabled+unchecked-to-enabled+baseline` | `bug=`
**Automatable**: Yes (assertion currently fails on new site; pin against fix)

---

## TC-LOC-LI-005: Verify Allow ETS Checkbox Dependency
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop — pending: chkAllowETS disabled for office 1604)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Allow ETS" checkbox is unchecked. | The "Allow ETS" checkbox is unchecked. |
| 2 | Verify "ETS Percentage" field is disabled with value 0. | The "ETS Percentage" field is disabled and shows 0. |
| 3 | Check "Allow ETS" checkbox. | The "Allow ETS" checkbox is checked. |
| 4 | Verify "ETS Percentage" field is enabled. | The "ETS Percentage" field is enabled. |
| 5 | Verify "ETS Percentage" value is 23.00% (non-union office default). | The "ETS Percentage" field shows 23.00. |
| 6 | Uncheck "Allow ETS" checkbox. | The "Allow ETS" checkbox is unchecked. |
| 7 | Verify "ETS Percentage" field is disabled with value reset to 0. | The "ETS Percentage" field is disabled and its value is 0. |

**Expected**: Checking Allow ETS enables field and sets default value to 23.00% for non-union offices, 24.00% for union offices per requirements. Unchecking resets to 0.
**Data**: `chkAllowETS=unchecked to checked` | `spinETSPercentage=disabled,0 to enabled,23.00%` | `office=1604` | `union=false`
**Automatable**: Yes

---

## TC-LOC-LI-006: Verify Allow Resort Tax Checkbox Dependency
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop — pending: chkAllowResortTax becomes disabled after save for office 1604)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Allow Resort Tax" checkbox is unchecked | The "Allow Resort Tax" checkbox is unchecked. |
| 2 | Verify "Resort Tax Percentage" field is disabled with value 0 | The "Resort Tax Percentage" field is disabled and shows 0. |
| 3 | Check "Allow Resort Tax" checkbox | The "Allow Resort Tax" checkbox is checked. |
| 4 | Verify "Resort Tax Percentage" field is enabled with value 0 | The "Resort Tax Percentage" field is enabled and shows 0. |

**Expected**: Checking Allow Resort Tax enables Resort Tax Percentage field
**Data**: `chkAllowResortTax=unchecked to checked` | `spinResortTaxPercentage=disabled to enabled`
**Automatable**: Yes

---

## TC-LOC-LI-007: Verify Threshold Disabled When Allow DPCD Checked (Dual Dependency)
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-007)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Allow DPCD" checkbox is checked by default | The "Allow DPCD" checkbox is checked. |
| 2 | Read the current state of "Prompt For Approval" checkbox and record it as the baseline. | The current state of "Prompt For Approval" is recorded as the baseline. |
| 3 | If "Prompt For Approval" is checked, uncheck it so the starting state has both conditions needed to keep "Threshold" disabled. | If "Prompt For Approval" was checked, it is now unchecked. The "Threshold" field remains disabled. |
| 4 | Verify "Threshold" field is disabled with value 0 | The "Threshold" field is disabled and shows 0. |
| 5 | Check "Prompt For Approval" checkbox | The "Prompt For Approval" checkbox is checked. |
| 6 | Verify "Threshold" field is STILL disabled (because Allow DPCD is checked) | The "Threshold" field remains disabled (Allow DPCD is still checked). |
| 7 | Uncheck "Allow DPCD" checkbox | The "Allow DPCD" checkbox is unchecked. |
| 8 | Verify "Prompt For Approval" checkbox is still checked | The "Prompt For Approval" checkbox is still checked. |
| 9 | Verify "Threshold" field is NOW ENABLED (Allow DPCD is unchecked AND Prompt For Approval is checked) | The "Threshold" field is now enabled (Allow DPCD unchecked AND Prompt For Approval checked). |

**Expected**: Threshold has DUAL dependency: disabled when Allow DPCD is checked, OR Prompt For Approval is unchecked, OR the user lacks location-edit permission. Enabling requires Allow DPCD to be unchecked AND Prompt For Approval to be checked.
**Data**: `AllowDPCD=true means Threshold=disabled` | `AllowDPCD=false plus PromptForApproval=true means Threshold=enabled` | `dualDependency=true` | `liveDefault2026-04-27=AllowDPCD checked + PromptForApproval checked + Threshold disabled (single-condition AllowDPCD=true is sufficient to disable)`
**Automatable**: Yes

---

## TC-LOC-LI-007A: Verify Threshold Resets to 0 When Dependencies Break
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Uncheck "Allow DPCD" checkbox and verify "Threshold" field is enabled | The "Allow DPCD" checkbox is unchecked and the "Threshold" field is enabled. |
| 2 | Check "Prompt For Approval" checkbox and verify "Threshold" field is still enabled | The "Prompt For Approval" checkbox is checked and the "Threshold" field remains enabled. |
| 3 | Set "Threshold" field to 50.5 | The "Threshold" field shows 50.5. |
| 4 | Check "Allow DPCD" checkbox and verify "Threshold" field is disabled with value reset to 0 | The "Allow DPCD" checkbox is checked and the "Threshold" field is disabled with value reset to 0. |
| 5 | Uncheck "Allow DPCD" checkbox and verify "Threshold" field is enabled with value still 0 (not restored) | The "Allow DPCD" checkbox is unchecked and the "Threshold" field is enabled showing 0 (50.5 is not restored). |
| 6 | Set "Threshold" field to 25.0 | The "Threshold" field shows 25.0. |
| 7 | Uncheck "Prompt For Approval" checkbox and verify "Threshold" field is disabled with value reset to 0 | The "Prompt For Approval" checkbox is unchecked and the "Threshold" field is disabled with value reset to 0. |

**Expected**: Threshold resets to 0 when Allow DPCD is checked OR Prompt For Approval is unchecked.
**Data**: `resetTriggers=AllowDPCD=true OR PromptForApproval=false` | `resetValue=0`
**Automatable**: Yes

---

## TC-LOC-LI-008: Verify Skip Billing Does Not Disable Oracle Fields
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency |

**Depends_On**: TC-LOC-LI-001
**Preconditions** (slate-clear): Office 1604 may carry leaked values in Oracle fields from prior testing. Reset Oracle Product to `0000`, Oracle Department to `900`, Oracle Organization to `Encore US BU` and Save before starting this TC. Read-and-restore in `finally` block.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Oracle Product" field is enabled with value `0000` | The "Oracle Product" field is enabled and shows "0000". |
| 2 | Verify "Oracle Department" field is enabled with value `900` | The "Oracle Department" field is enabled and shows "900". |
| 3 | Verify "Oracle Organization" dropdown is enabled with selection `Encore US BU` | The "Oracle Organization" dropdown is enabled and shows "Encore US BU" selected. |
| 4 | Check "Skip Billing" checkbox | The "Skip Billing" checkbox is checked. |
| 5 | Verify "Oracle Product" field stays enabled | The "Oracle Product" field remains enabled. |
| 6 | Verify "Oracle Department" field stays enabled | The "Oracle Department" field remains enabled. |
| 7 | Verify "Oracle Organization" dropdown stays enabled | The "Oracle Organization" dropdown remains enabled. |
| 8 | Uncheck "Skip Billing" checkbox | The "Skip Billing" checkbox is unchecked. |
| 9 | Verify all 3 fields remain enabled with their original values | All 3 fields remain enabled and retain their original values. |

**Expected**: Checking Skip Billing does not disable the Oracle Product, Oracle Department, or Oracle Organization fields; they stay enabled because Skip Billing is a billing flag only. Oracle Organization remains enabled and selectable.
**Data**: `chkSkipBilling=unchecked to checked` | `txtOracleProduct=stays enabled` | `txtOracleDepartment=stays enabled` | `drpOracleOrganization=stays enabled` | `slateClearRequired=true`
**Automatable**: Yes

---

## TC-LOC-LI-008A: Verify Oracle Fields Required When Skip Billing Disabled
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Required Field Validation |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Skip Billing" checkbox is unchecked (the "required" condition). | The "Skip Billing" checkbox is unchecked. |
| 2 | Clear "Oracle Product" textbox. | The "Oracle Product" textbox is cleared. |
| 3 | Verify "Oracle Product" field is shown as invalid after being cleared. | The "Oracle Product" field is shown as invalid. |
| 4 | Verify "Save" button is DISABLED while the form is invalid. | The "Save" button is disabled while the form is invalid. |
| 5 | Clear "Oracle Department" textbox. | The "Oracle Department" textbox is cleared. |
| 6 | Set "Oracle Organization" dropdown to "--Select--". | The "Oracle Organization" dropdown shows "--Select--". |
| 7 | Re-verify "Save" button stays disabled. | The "Save" button remains disabled. |
| 8 | Restore each field to a valid value. | Each field is restored to a valid value. |
| 9 | Verify "Save" re-enables after all 3 fields are valid. | The "Save" button is re-enabled after all 3 fields hold valid values. |
| 10 | Click "Save" and confirm the save completes successfully. | The save completes successfully and the page confirms the change. |

**Expected**: Oracle Product, Oracle Department, and Oracle Organization are REQUIRED when Skip Billing is unchecked. When the form is invalid, the "Save" button is disabled so the user cannot submit without correcting the errors. The empty required fields are shown as invalid so the user can identify which fields need values. Once all 3 fields hold valid values, "Save" re-enables and clicking it submits the change successfully.
**Data**: `chkSkipBilling=unchecked` | `txtOracleProduct=[required]` | `txtOracleDepartment=[required]` | `drpOracleOrganization=[required]` | `expectedSaveButtonState=disabled when invalid` | `expectedAriaInvalid=true on empty required fields`
**Automatable**: Yes — assert form-validity-to-save-disabled wiring (matches old-site baseline per `OSB-ACCESS-VERIFY.md` §4).

---

## TC-LOC-LI-009: Verify LDW Percentage field Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Ensure "Apply LDW" checkbox is checked and "LDW Percentage" field is enabled. | The "Apply LDW" checkbox is checked and the "LDW Percentage" field is enabled. |
| 2 | Clear the field and enter 0. | The "LDW Percentage" field shows 0. |
| 3 | Click "Save" and verify it completes. | The save completes successfully. |
| 4 | Reload the page and navigate back to Local Information. | The page reloads and the Local Information tab is displayed. |
| 5 | Verify "LDW Percentage" field has value 0 with no error message. | The "LDW Percentage" field shows 0 with no error message. |

**Expected**: Value 0 is valid, persists, no validation error
**Data**: `spinLDWPercentage=0` | `min=0` | `max=100` | `step=0.01`
**Automatable**: Yes

---

## TC-LOC-LI-010: Verify LDW Percentage field Boundary - Valid Min+ (0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 0.01 in "LDW Percentage" field. | The "LDW Percentage" field shows 0.01. |
| 2 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 3 | Verify "LDW Percentage" field has value 0.01 with no error message. | The "LDW Percentage" field shows 0.01 with no error message. |

**Expected**: Value 0.01 (min + step) is valid, persists, no validation error
**Data**: `spinLDWPercentage=0.01`
**Automatable**: Yes

---

## TC-LOC-LI-011: Verify LDW Percentage field Boundary - Valid Max- (99.99)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 99.99 in "LDW Percentage" field. | The "LDW Percentage" field shows 99.99. |
| 2 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 3 | Verify "LDW Percentage" field has value 99.99 with no error message. | The "LDW Percentage" field shows 99.99 with no error message. |

**Expected**: Value 99.99 (max - step) is valid, persists, no validation error
**Data**: `spinLDWPercentage=99.99`
**Automatable**: Yes

---

## TC-LOC-LI-012: Verify LDW Percentage field Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100 in "LDW Percentage" field. | The "LDW Percentage" field shows 100. |
| 2 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 3 | Verify "LDW Percentage" field has value 100 with no error message. | The "LDW Percentage" field shows 100 with no error message. |

**Expected**: Value 100 (max) is valid, persists, no validation error
**Data**: `spinLDWPercentage=100`
**Automatable**: Yes

---

## TC-LOC-LI-013: Verify LDW Percentage field Boundary - Invalid Below Min (-0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop — silent-invalid cat-B: save disabled, no inline error)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter "-0.01" in "LDW Percentage" field. | The "LDW Percentage" field accepts the input "-0.01". |
| 2 | Click "Save" and verify it completes. | The save completes. |
| 3 | Reload the page and navigate to Local Information. | The page reloads and the Local Information tab is displayed. |
| 4 | Verify "LDW Percentage" field has value "-0.01". | The "LDW Percentage" field shows "-0.01". |
| 5 | Verify the error message shows "Number must be greater than or equal to 0". | An error message reads "Number must be greater than or equal to 0". |
| 6 | Cleanup: Restore "LDW Percentage" field to a valid value (e.g., 0.04) and save to prevent downstream test corruption. | The "LDW Percentage" field is restored to a valid value and the save completes. |

**Expected**: Invalid value saves but displays validation error on page load
**Data**: `spinLDWPercentage=-0.01` | `errorMessage=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-014: Verify LDW Percentage field Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop — inline error detected on blur)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter "-5" in "LDW Percentage" field. | The "LDW Percentage" field accepts the input "-5". |
| 2 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 3 | Verify "LDW Percentage" field has value "-5" with error message displayed. | The "LDW Percentage" field shows "-5" with an error message displayed. |
| 4 | Cleanup: Restore to a valid value and save. | The "LDW Percentage" field is restored to a valid value and the save completes. |

**Expected**: Invalid negative value saves, shows error on reload
**Data**: `spinLDWPercentage=-5`
**Automatable**: Yes

---

## TC-LOC-LI-015: Verify LDW Percentage field Boundary - Invalid Above Max (100.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop — inline error detected on blur)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Ensure "Apply LDW" checkbox is checked | The "Apply LDW" checkbox is checked and the "LDW Percentage" field is enabled. |
| 2 | Enter "100.01" in "LDW Percentage" field | The "LDW Percentage" field accepts the input "100.01". |
| 3 | Click Save | The save completes. |
| 4 | Reload page | The page reloads. |
| 5 | Verify "LDW Percentage" shows "100.01" | The "LDW Percentage" field shows "100.01". |
| 6 | Verify error message: "Number must be less than or equal to 100" | An error message reads "Number must be less than or equal to 100". |
| 7 | Cleanup: Enter valid value (0.04) and Save | The "LDW Percentage" field is restored to 0.04 and the save completes. |

**Expected**: Invalid value above max saves but displays validation error on reload.
**Data**: `LDWPercentage=100.01`

Notes: Always restore to valid value.
**Automatable**: Yes

---

## TC-LOC-LI-016: Verify LDW Percentage field Boundary - Invalid Far Above Max (150.99)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop — inline error detected on blur)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter "150.99" in "LDW Percentage" field. | The "LDW Percentage" field accepts the input "150.99". |
| 2 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 3 | Verify "LDW Percentage" field has value "150.99" with error message displayed. | The "LDW Percentage" field shows "150.99" with an error message displayed. |
| 4 | Cleanup: Restore to a valid value (e.g., 0.04) and save. | The "LDW Percentage" field is restored to a valid value and the save completes. |

**Expected**: Invalid value far above max saves, shows error on reload
**Data**: `spinLDWPercentage=150.99`
**Automatable**: Yes

---

## TC-LOC-LI-017: Verify All Percentage Fields Share the Same Limits (0-100, step 0.01)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Equivalence Partitioning |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enable "C&C Percentage" field and enter "50.50". | The "C&C Percentage" field shows 50.50 with no error. |
| 2 | Enable "ETS Percentage" field and enter "75.25". | The "ETS Percentage" field shows 75.25 with no error. |
| 3 | Enable "Resort Tax Percentage" field and enter "99.99". | The "Resort Tax Percentage" field shows 99.99 with no error. |
| 4 | Enter "0.33" in "Labor Billing Goal" field. | The "Labor Billing Goal" field shows 0.33 with no error. |
| 5 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 6 | Verify all values persisted with no errors. | All four field values persist with no error messages. |

**Expected**: All 5 percentage fields (LDW, C&C, ETS, Resort Tax, Labor Goal) have the same constraints: minimum 0, maximum 100, changing in increments of 0.01
**Data**: `min=0` | `max=100` | `step=0.01` | `applicableTo=5 fields`
**Automatable**: Yes

---

## TC-LOC-LI-018: Verify Threshold field Has Coarser Step (0.1)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field Attribute |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Uncheck "Allow DPCD" checkbox and check "Prompt For Approval" checkbox so the "Threshold" field becomes enabled. | The dependencies are set and the "Threshold" field is enabled. |
| 2 | Inspect "Threshold" field and verify its step is 0.1, which is coarser than the other fields at 0.01. | The "Threshold" field has a step value of 0.1, which is coarser than the 0.01 step of the other fields. |
| 3 | Check "Allow DPCD" checkbox and verify "Threshold" is disabled again. | The "Allow DPCD" checkbox is checked and the "Threshold" field is disabled again. |

**Expected**: The Threshold field steps in increments of 0.1 (coarser than 0.01) and is conditionally disabled depending on the related approval settings.
**Data**: `spinThreshold.step=0.1` | `conditionallyDisabled=AllowDPCD OR !PromptForApproval OR !canEditLoc`
**Automatable**: Yes

---

## TC-LOC-LI-019: Verify Oracle Product Max Length Truncation (25 chars)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Max Length |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TEXT_FIELD_CONSTRAINTS loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear "Oracle Product" textbox. | The "Oracle Product" textbox is cleared. |
| 2 | Paste the 100-character string "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789." and verify the field accepts the input. | The field accepts the pasted input. |
| 3 | Read the field value and verify only 25 characters are stored. | The field value contains exactly 25 characters. |
| 4 | Verify the field enforces a maximum length of 25 characters. | The field enforces a maximum of 25 characters. |
| 5 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 6 | Verify "Oracle Product" textbox holds only the first 25 characters. | The "Oracle Product" textbox holds only the first 25 characters. |

**Expected**: Oracle Product enforces a maximum of 25 characters, truncates input, persists truncated value
**Data**: `txtOracleProduct.maxLength=25` | `input=100chars` | `stored=25chars`
**Automatable**: Yes

---

## TC-LOC-LI-020: Verify Oracle Department Max Length Truncation (25 chars)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Max Length |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TEXT_FIELD_CONSTRAINTS loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear "Oracle Department" textbox. | The "Oracle Department" textbox is cleared. |
| 2 | Paste a 100-character string and verify the field accepts the input. | The field accepts the pasted input. |
| 3 | Read the field value and verify only 25 characters are stored. | The field value contains exactly 25 characters. |
| 4 | Verify the field enforces a maximum length of 25 characters. | The field enforces a maximum of 25 characters. |
| 5 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 6 | Verify the value persisted at 25 characters. | The "Oracle Department" textbox holds 25 characters and the value is preserved. |

**Expected**: Oracle Department enforces a maximum of 25 characters, truncates input
**Data**: `txtOracleDepartment.maxLength=25`
**Automatable**: Yes

---

## TC-LOC-LI-021: Verify Oracle Product Valid Input (1-25 chars)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Equivalence Partitioning |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-021/029)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter "PROD001" (7 characters) in "Oracle Product" textbox. | The "Oracle Product" textbox shows "PROD001". |
| 2 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 3 | Verify the value persisted as "PROD001" with no error. | The "Oracle Product" textbox shows "PROD001" with no error. |
| 4 | Enter "ABC" (3 characters) and verify it accepts and persists. | The value "ABC" is accepted and persists after save and reload. |
| 5 | Enter "X" (1 character) and verify it accepts and persists. | The value "X" is accepted and persists after save and reload. |

**Expected**: Valid input range 1-25 characters accepts alphanumeric values
**Data**: `txtOracleProduct=1-25 chars alphanumeric`
**Automatable**: Yes

---

## TC-LOC-LI-022: Verify Oracle Organization Dropdown Options
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Dropdown Options |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Oracle Organization" dropdown and verify it opens. | The "Oracle Organization" dropdown opens and displays its options. |
| 2 | Count the options and verify there are 8 total. | The dropdown shows exactly 8 options. |
| 3 | Verify the option list includes "--Select--", "Encore US BU", "Encore CA BU", "Encore BH BU", "Encore Bahamas", "Encore MX BU", "PSR Mexico", and "Encore Mexico". | All 8 expected options are present: "--Select--", "Encore US BU", "Encore CA BU", "Encore BH BU", "Encore Bahamas", "Encore MX BU", "PSR Mexico", and "Encore Mexico". |
| 4 | Verify the current selection is "Encore US BU" with a checkmark icon visible next to it. | The "Encore US BU" option is currently selected with a checkmark icon next to it. |

**Expected**: 8 organization options available, default is "Encore US BU"
**Data**: `drpOracleOrganization.options=8` | `default=Encore US BU`
**Automatable**: Yes

---

## TC-LOC-LI-023: Verify Oracle Organization Selection Change Persistence
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Dropdown Selection |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select "Encore CA BU" from "Oracle Organization" dropdown and verify the selection changes. | The "Oracle Organization" dropdown shows "Encore CA BU" selected. |
| 2 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 3 | Verify "Oracle Organization" dropdown shows "Encore CA BU" selected. | The "Oracle Organization" dropdown shows "Encore CA BU" selected. |
| 4 | Select "Encore Bahamas" and verify the selection changes. | The "Oracle Organization" dropdown shows "Encore Bahamas" selected. |
| 5 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 6 | Verify "Encore Bahamas" persisted. | The "Oracle Organization" dropdown shows "Encore Bahamas" as the selected value. |

**Expected**: Dropdown selection changes persist after save/reload
**Data**: `drpOracleOrganization=from Encore US BU to Encore CA BU to Encore Bahamas`
**Automatable**: Yes

---

## TC-LOC-LI-024: Verify Billing Way Change When Unbilled Orders Exist - Error Path
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | API Validation |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Billing Way" radio button shows "Event" selected | The "Billing Way" radio group shows "Event" selected. |
| 2 | Click "Daily" option | The "Daily" option is selected. |
| 3 | Wait for the system to check for unbilled orders | The system makes an API call to check for unbilled orders. |
| 4 | Verify error dialog: "There are orders that have not been billed in the current billing period. Those must be invoiced before the change can be made." | An error dialog appears: "There are orders that have not been billed in the current billing period. Those must be invoiced before the change can be made." |
| 5 | Click "Ok" | The dialog closes. |
| 6 | Verify "Billing Way" reverted to "Event" | The "Billing Way" radio group reverts to "Event" selected. |

**Expected**: Changing Billing Way makes the system check for unbilled orders. If unbilled orders exist, the selection reverts.
**Data**: `BillingWay=Event`

Notes: API: /api/location/check-unbilled. Error key: a billing constraint
**Automatable**: Yes

---

## TC-LOC-LI-024A: Verify Billing Way Change When No Unbilled Orders - Success Path
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | API Validation |

Preconditions (Human):
No unbilled orders exist for office (billing complete).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Billing Way" shows "Event" selected | The "Billing Way" radio group shows "Event" selected. |
| 2 | Verify "Effective Date" button is disabled | The "Effective Date" button is disabled. |
| 3 | Click "Daily" option | The "Daily" option is selected. |
| 4 | Wait for the system's unbilled-orders check to complete | The API call to check for unbilled orders completes with no error. |
| 5 | Verify "Effective Date" button is now enabled | The "Effective Date" button is now enabled. |
| 6 | Verify "Effective Date" shows current date | The "Effective Date" field shows today's date. |
| 7 | Verify "Billing Way" shows "Daily" | The "Billing Way" radio group shows "Daily" selected. |

**Expected**: Successful Billing Way change enables Effective Date button.
**Data**: `BillingWay=from Event to Daily`
**Automatable**: Yes

---

## TC-LOC-LI-025: Verify Billing Type Radio Group Default State
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field State |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-025)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Billing Type" radio button shows "Master" selected | The "Billing Type" radio group shows "Master" selected. |
| 2 | Verify "Direct" option is available | The "Direct" option is visible and available. |
| 3 | Click "Direct" option | The "Direct" option is selected. |
| 4 | Click Save, reload | The save completes and the page reloads. |
| 5 | Verify "Billing Type" shows "Direct" | The "Billing Type" radio group shows "Direct" selected. |

**Expected**: Billing Type defaults to "Master", can change to "Direct", persists.
**Data**: `BillingType=Master`
**Automatable**: Yes

---

## TC-LOC-LI-026: Verify Always-Disabled and Conditionally-Disabled Checkboxes
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field State |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Suppress Day/Rate Discount" checkbox is disabled (always) | The "Suppress Day/Rate Discount" checkbox is disabled. |
| 2 | Verify "Compass Integration" checkbox is checked and disabled. | The "Compass Integration" checkbox is checked and disabled. |
| 3 | Verify "Display Tax" checkbox is checked and disabled when Company Remit Tax or Company Remit Tax 2 is on. | The "Display Tax" checkbox is checked and disabled when Company Remit Tax or Company Remit Tax 2 is enabled. |
| 4 | Make changes to other fields and click Save button | The save completes. |
| 5 | Verify all 3 checkboxes are still disabled with states unchanged | All 3 checkboxes remain disabled with their states unchanged after save. |

**Expected**: Suppress Day/Rate Discount always disabled. Compass Integration and Display Tax conditionally disabled based on context.
**Data**: `chkSuppressDayRateDiscount=always disabled` | `chkCompassIntegration=disabled when !isNew` | `chkDisplayTax=disabled when HRIRemitTax OR HRIRemitTax2`
**Automatable**: Yes

---

## TC-LOC-LI-027: Verify Effective Date and Billing Cycle Initial State
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Effective Date" button is disabled and shows "May 11th, 2007" | The "Effective Date" button is disabled and shows "May 11th, 2007". |
| 2 | Verify "Billing Cycle" dropdown is disabled and shows "Weekly" | The "Billing Cycle" dropdown is disabled and shows "Weekly". |
| 3 | Make other field changes and click Save button | The save completes. |
| 4 | Verify both fields are still disabled with values unchanged | Both "Effective Date" and "Billing Cycle" remain disabled with their values unchanged. |

**Expected**: The Effective Date button is disabled by default and becomes enabled once the billing details load. The Billing Cycle is disabled initially.
**Data**: `btnEffectiveDate=disabled by default` | `drpBillingCycle=disabled initially` | `note=both are conditionally disabled, not permanently`
Notes: Effective Date (BillingWay Effective Date) is a DIFFERENT field from Live Date in the left panel. Live Date = May 8th, 2007; Effective Date = May 11th, 2007. Both are correct for office 1604.
**Automatable**: Yes

---

## TC-LOC-LI-028: Verify Service Charge Checkbox Default State
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Service Charge" checkbox is checked. | The "Service Charge" checkbox is checked. |
| 2 | Uncheck "Service Charge" checkbox and verify the "Save" button becomes enabled. | The "Service Charge" checkbox is unchecked and the Save button becomes enabled. |
| 3 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 4 | Verify "Service Charge" checkbox is unchecked. | The "Service Charge" checkbox is unchecked. |
| 5 | Re-check the checkbox, save, and reload. | The "Service Charge" checkbox is re-checked, the save completes, and the page reloads. |
| 6 | Verify the checkbox is checked again. | The "Service Charge" checkbox is checked. |

**Expected**: Service Charge checkbox is checked by default, can toggle, persists state
**Data**: `chkServiceCharge=checked default`
**Automatable**: Yes

---

## TC-LOC-LI-029: Verify Standalone Checkboxes Toggle Independently
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field Behavior |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-021/029)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Toggle "Calculate LDW on Net Amount" checkbox and verify no other field changes. | The "Calculate LDW on Net Amount" checkbox changes state and no other fields change. |
| 2 | Toggle "Show Service Charge As Administrative Fee" checkbox and verify no other field changes. | The "Show Service Charge As Administrative Fee" checkbox changes state and no other fields change. |
| 3 | Toggle "Calculate Service Charge On Net Amount" checkbox and verify no other field changes. | The "Calculate Service Charge On Net Amount" checkbox changes state and no other fields change. |
| 4 | Toggle "Warehouse Billing" checkbox and verify no other field changes. | The "Warehouse Billing" checkbox changes state and no other fields change. |
| 5 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 6 | Verify all 4 checkboxes have their new states persisted. | All 4 checkboxes show their new toggled states after reload. |

**Expected**: Standalone checkboxes (no dependencies) toggle independently, persist state
**Data**: `independentCheckboxes=30+ fields`
**Automatable**: Yes

---

## TC-LOC-LI-030: Verify Multiple Checkbox Dependencies Simultaneously
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Decision Table |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enable all dependency checkboxes: "Apply C&C Fee", "Allow ETS", and "Allow Resort Tax", and verify all three fields become enabled. | All 3 dependency checkboxes are checked and the C&C, ETS, and Resort Tax Percentage fields become enabled. |
| 2 | Enter 10, 5, and 3 into "C&C Percentage", "ETS Percentage", and "Resort Tax Percentage" respectively. | C&C Percentage shows 10, ETS Percentage shows 5, and Resort Tax Percentage shows 3. |
| 3 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 4 | Verify all 3 checkboxes are checked. | All 3 checkboxes are checked. |
| 5 | Verify all 3 fields are enabled with their values persisted. | All 3 fields are enabled and display their saved values. |
| 6 | Uncheck all 3 checkboxes and verify all 3 fields become disabled with values reset to 0. | All 3 checkboxes are unchecked and all 3 fields become disabled with values reset to 0. |
| 7 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 8 | Verify fields are disabled with values at 0. | All 3 fields are disabled and show 0. |

**Expected**: Multiple checkbox-to-field dependencies work simultaneously without interference
**Data**: `multiDependency=3 checkboxes + 3 fields`
**Automatable**: Yes

---

## TC-LOC-LI-031: Verify Checkbox State Combinations (Decision Table - Sample)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Decision Table |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Check "Apply LDW" and uncheck "Apply C&C Fee", then verify "LDW Percentage" is enabled and "C&C Percentage" is disabled. | The "LDW Percentage" field is enabled and the "C&C Percentage" field is disabled. |
| 2 | Uncheck "Apply LDW" and check "Apply C&C Fee", then verify "LDW Percentage" is disabled (reset) and "C&C Percentage" is enabled. | The "LDW Percentage" field is disabled with value reset to 0, and the "C&C Percentage" field is enabled. |
| 3 | Check both and verify both fields are enabled. | Both "LDW Percentage" and "C&C Percentage" fields are enabled. |
| 4 | Uncheck both and verify both fields are disabled. | Both "LDW Percentage" and "C&C Percentage" fields are disabled. |
| 5 | Save and reload after each combination and verify states persist correctly. | After each save and reload, the field states match the checkbox states for that combination. |

**Expected**: All 4 combinations (2^2) of 2 dependent checkboxes produce correct field states
**Data**: `combinations=4` | `chk1×chk2=spin1×spin2`
**Automatable**: Yes

---

## TC-LOC-LI-032: Verify Save Button Enable/Disable State
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Button State |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-032)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Load the page and verify "Save" is disabled. | The page loads with the Save button disabled. |
| 2 | Toggle any checkbox and verify "Save" becomes enabled. | The Save button becomes enabled after the checkbox is toggled. |
| 3 | Revert the checkbox and note that "Save" may stay enabled. | After reverting the checkbox, the Save button state may remain enabled. |
| 4 | Change a field value and verify "Save" is enabled. | The Save button is enabled after the field value changes. |
| 5 | Click "Save" and verify it executes successfully and then returns to disabled with no pending changes remaining. | The save completes and the Save button returns to disabled with no pending changes remaining. |

**Expected**: Save button enables when any field changes; returns to disabled after a successful save when no unsaved changes remain
**Data**: `btnSave=disabled--modified--enabled--save--disabled`
**Automatable**: Yes

---

## TC-LOC-LI-033: Verify Partial Field Modification Isolation
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Data Isolation |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Capture all 52 field values as baseline | All 52 current field values are read and recorded as the baseline. |
| 2 | Modify 4 fields: uncheck "Apply LDW", change "Set Strike Labor Billing Goal" from 0.33 to 0.50, change "Oracle Product" from 0000 to TEST, change "Oracle Organization" from Encore US BU to Encore CA BU | The 4 specified fields are modified: Apply LDW unchecked, Set Strike Labor Goal set to 0.50, Oracle Product set to "TEST", Oracle Organization set to "Encore CA BU". |
| 3 | Leave the rest of the fields untouched | The remaining fields are unchanged. |
| 4 | Click Save, reload | The save completes and the page reloads. |
| 5 | Verify 4 modified fields match new values | The 4 modified fields reflect their new values. |
| 6 | Verify all untouched fields match baseline | All untouched fields retain their baseline values. |

**Expected**: Modifying subset of fields does NOT affect untouched fields.
**Data**: `modified=4` | `untouched=48` | `total=52`
**Automatable**: Yes

---

## TC-LOC-LI-034: Verify field Increment/Decrement Buttons
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Button Control |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set "LDW Percentage" field to 5.50. | The "LDW Percentage" field shows 5.50. |
| 2 | Click the Increment button and verify the value is 5.51. | The "LDW Percentage" field shows 5.51. |
| 3 | Click the Increment button 10 more times and verify the value is 5.61. | The "LDW Percentage" field shows 5.61. |
| 4 | Click the Decrement button and verify the value is 5.60. | The "LDW Percentage" field shows 5.60. |
| 5 | Verify the buttons respect min/max limits: Increment is disabled at 100, and Decrement is disabled at 0. | The Increment button is disabled at 100 and the Decrement button is disabled at 0. |

**Expected**: Increment/Decrement buttons change value by step amount (0.01), respect boundaries
**Data**: `step=0.01` | `Increment=+0.01` | `Decrement=-0.01`
**Automatable**: Yes

---

## TC-LOC-LI-035: Verify Save is disabled when a numeric field holds an invalid value
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Validation Timing |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -10 in "LDW Percentage" and verify the field is shown as invalid with the error "Number must be greater than or equal to 0". | The "LDW Percentage" field is shown as invalid with the error "Number must be greater than or equal to 0" displayed. |
| 2 | Verify "Save" is DISABLED while the entry is invalid. | The Save button is disabled. |
| 3 | Restore "LDW Percentage" to a valid value (e.g., 0 or 0.5) and verify the invalid indicator clears. | The "LDW Percentage" field is valid and the invalid indicator clears. |
| 4 | Verify "Save" becomes enabled because the entry is now valid and there are unsaved changes. | The Save button becomes enabled. |
| 5 | Click "Save" and verify it completes. Reload to confirm the valid value persisted. | The save completes and the valid value persists after reload. |

**Expected**: "Save" is disabled when "LDW Percentage" is -10 (below the minimum of 0). The user must restore a valid value before "Save" enables.
**Data**: `spinLDWPercentage=-10 invalid` | `expectedSaveButtonState=disabled while invalid` | `validValue=0 or 0.5`
**Automatable**: Yes

---

## TC-LOC-LI-036: Verify Multiple Invalid Values Show Multiple Errors
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Multiple Validations |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set "LDW Percentage" to -5, "C&C Percentage" to 150, and "ETS Percentage" to -1 to create three invalid values. | All 3 invalid values are accepted by their respective fields. |
| 2 | Click "Save" and reload the page. | The Save button remains disabled while invalid values are present; no save or reload occurs. |
| 3 | Verify "LDW Percentage" shows the error "Number must be greater than or equal to 0". | The "LDW Percentage" field shows the error "Number must be greater than or equal to 0". |
| 4 | Verify "C&C Percentage" shows the error "Number must be less than or equal to 100". | The "C&C Percentage" field shows the error "Number must be less than or equal to 100". |
| 5 | Verify "ETS Percentage" shows the error "Number must be greater than or equal to 0". | The "ETS Percentage" field shows the error "Number must be greater than or equal to 0". |

**Expected**: Multiple invalid fields show separate error messages simultaneously. Verbatim error texts (per live interface): LDW Percentage = "Number must be greater than or equal to 0"; C&C Percentage = "Number must be less than or equal to 100"; ETS Percentage = "Number must be greater than or equal to 0". Each error renders inline next to its associated field, which is shown as invalid; errors do not collapse to a single summary.
**Data**: `invalidFields=3` | `errorMessages=3 distinct`
**Automatable**: Yes

---

## TC-LOC-LI-037: Verify Correcting Invalid Value Removes Error
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Error Recovery |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set "LDW Percentage" field to 150 to create an invalid value. | The "LDW Percentage" field accepts 150 and shows it as invalid. |
| 2 | Save and reload the page. | The invalid value prevents saving; the page remains on the form with the validation error visible. |
| 3 | Verify the error displayed shows "Number must be less than or equal to 100". | The error "Number must be less than or equal to 100" is displayed. |
| 4 | Change "LDW Percentage" field to 50 to create a valid value. | The "LDW Percentage" field shows 50. |
| 5 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 6 | Verify no error message is shown and the value is 50. | No error message is shown and the "LDW Percentage" field shows 50. |

**Expected**: Correcting invalid value to valid range removes error message on next reload
**Data**: `invalidValue=from 150 to validValue=50 to errorRemoved`
**Automatable**: Yes

---

## TC-LOC-LI-038: Verify Default Checked Checkboxes (Batch 1)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Ticker Calc" checkbox is checked | The "Ticker Calc" checkbox is checked. |
| 2 | Verify "Enable Set/Strike Labor Minutes" checkbox is checked | The "Enable Set/Strike Labor Minutes" checkbox is checked. |
| 3 | Verify "Apply Set/Strike Labor Minutes" checkbox is checked | The "Apply Set/Strike Labor Minutes" checkbox is checked. |
| 4 | Verify "Company Remit Tax" checkbox is checked | The "Company Remit Tax" checkbox is checked. |
| 5 | Verify "Comm Receiver" checkbox is checked | The "Comm Receiver" checkbox is checked. |

**Expected**: Multiple checkboxes default to checked state
**Data**: `defaultChecked=Ticker Calc, Enable Set/Strike, Apply Set/Strike, Company Remit Tax, Comm Receiver`
**Automatable**: Yes

---

## TC-LOC-LI-039: Verify Default Checked Checkboxes (Batch 2)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Intercompany" checkbox is checked | The "Intercompany" checkbox is checked. |
| 2 | Verify "Enable Job Costing" checkbox is checked | The "Enable Job Costing" checkbox is checked. |
| 3 | Verify "Enable Discount Guidance" checkbox is checked | The "Enable Discount Guidance" checkbox is checked. |
| 4 | Verify "Enable Proposal" checkbox is checked | The "Enable Proposal" checkbox is checked. |
| 5 | Verify "Allow DPCD" checkbox is checked | The "Allow DPCD" checkbox is checked. |

**Expected**: Additional checkboxes default to checked state
**Data**: `defaultChecked=Intercompany, Job Costing, Discount Guidance, Proposal, DPCD`
**Automatable**: Yes

---

## TC-LOC-LI-040: Verify Default Checked Checkboxes (Batch 3)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Credit Memo Approval Required" checkbox is checked | The "Credit Memo Approval Required" checkbox is checked. |
| 2 | Verify "Enable Discount Reason" checkbox is checked | The "Enable Discount Reason" checkbox is checked. |
| 3 | Verify "Use eSignature" checkbox is checked | The "Use eSignature" checkbox is checked. |
| 4 | Verify "Service Charge" checkbox is checked | The "Service Charge" checkbox is checked. |

**Expected**: Final batch of checkboxes default to checked state
**Data**: `defaultChecked=Credit Memo Approval, Discount Reason, eSignature, Service Charge`
**Automatable**: Yes

---

## TC-LOC-LI-041: Verify Default Unchecked Checkboxes (User-Enabled)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Calculate LDW on Net Amount" checkbox is unchecked | The "Calculate LDW on Net Amount" checkbox is unchecked. |
| 2 | Verify "Apply C&C Fee" checkbox is unchecked | The "Apply C&C Fee" checkbox is unchecked. |
| 3 | Verify "Calculate C&C On Net Amount" checkbox is unchecked | The "Calculate C&C On Net Amount" checkbox is unchecked. |
| 4 | Verify "Allow ETS" checkbox is unchecked | The "Allow ETS" checkbox is unchecked. |
| 5 | Verify "Allow Resort Tax" checkbox is unchecked | The "Allow Resort Tax" checkbox is unchecked. |
| 6 | Verify "Show Service Charge As Administrative Fee" checkbox is unchecked | The "Show Service Charge As Administrative Fee" checkbox is unchecked. |
| 7 | Verify "Calculate Service Charge On Net Amount" checkbox is unchecked | The "Calculate Service Charge On Net Amount" checkbox is unchecked. |

**Expected**: User-configurable checkboxes default to unchecked
**Data**: `defaultUnchecked=LDW Net Amount, C&C Fee, C&C Net Amount, ETS, Resort Tax, etc.`
**Automatable**: Yes

---

## TC-LOC-LI-042: Verify Default Unchecked Checkboxes (Optional Features)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Internet Asset Reservation" checkbox is unchecked | The "Internet Asset Reservation" checkbox is unchecked. |
| 2 | Verify "Exclude Implied Discount" checkbox is unchecked | The "Exclude Implied Discount" checkbox is unchecked. |
| 3 | Verify "Prompt For Approval" checkbox is unchecked | The "Prompt For Approval" checkbox is unchecked. |
| 4 | Verify "Enable Product Group" checkbox is unchecked | The "Enable Product Group" checkbox is unchecked. |
| 5 | Verify "Allow Production Quote" checkbox is unchecked | The "Allow Production Quote" checkbox is unchecked. |
| 6 | Verify "Warehouse Billing" checkbox is unchecked | The "Warehouse Billing" checkbox is unchecked. |

**Expected**: Optional feature checkboxes default to unchecked
**Data**: `defaultUnchecked=Internet Asset, Implied Discount, Prompt Approval, Product Group, Production Quote, Warehouse Billing`
**Automatable**: Yes

---

## TC-LOC-LI-043: Verify Default Unchecked Checkboxes (Billing Features)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Enable IDC Billing" checkbox is unchecked | The "Enable IDC Billing" checkbox is unchecked. |
| 2 | Verify "Skip Billing" checkbox is unchecked | The "Skip Billing" checkbox is unchecked. |
| 3 | Verify "Separate Master Bill Commission Invoice" checkbox is unchecked | The "Separate Master Bill Commission Invoice" checkbox is unchecked. |
| 4 | Verify "Show SubRental" checkbox is unchecked | The "Show SubRental" checkbox is unchecked. |
| 5 | Verify "Inventory Only" checkbox is unchecked | The "Inventory Only" checkbox is unchecked. |
| 6 | Verify "Calculate Commission Tax" checkbox is unchecked | The "Calculate Commission Tax" checkbox is unchecked. |
| 7 | Verify "Can Create External Customer Link" checkbox is unchecked | The "Can Create External Customer Link" checkbox is unchecked. |
| 8 | Verify "Offsite Event Location" checkbox is unchecked | The "Offsite Event Location" checkbox is unchecked. |
| 9 | Verify "Exhibit Show Rate" checkbox is unchecked | The "Exhibit Show Rate" checkbox is unchecked. |

**Expected**: Billing-related optional checkboxes default to unchecked
**Data**: `defaultUnchecked=IDC Billing, Skip Billing, Master Bill Commission, SubRental, Inventory Only, etc.`
**Automatable**: Yes

---

## TC-LOC-LI-044: Verify All Field State Persistence After Full Random Modification
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Comprehensive Test |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Randomly modify at least half of the form's fields (a mix of checkboxes, fields, and text boxes). | At least half of the form fields show changed values in the form and the form is dirty. |
| 2 | Store all modifications. | All modification values are recorded. |
| 3 | Click "Save" and reload. | The save completes and the page reloads. |
| 4 | Verify every field: the modified ones match the new values and the unmodified ones are unchanged. | Every modified field shows its new value and every unmodified field retains its baseline value. |

**Expected**: Large-scale random modifications persist correctly, no field corruption or side effects
**Data**: `randomlyModified=25+`
**Automatable**: Yes

---

## TC-LOC-LI-045: Verify Field Change Detection Across All Field Types
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Change Detection |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change 1 checkbox and verify "Save" becomes enabled. | The Save button becomes enabled after the checkbox is changed. |
| 2 | Change 1 field and verify "Save" is still enabled. | The Save button remains enabled after the field is changed. |
| 3 | Change 1 textbox and verify "Save" is still enabled. | The Save button remains enabled after the textbox is changed. |
| 4 | Change 1 dropdown and verify "Save" is still enabled. | The Save button remains enabled after the dropdown is changed. |
| 5 | Change 1 radio button and verify "Save" is still enabled. | The Save button remains enabled after the radio button is changed. |
| 6 | Verify each field type triggers unsaved changes with the "Save" button activated. | All 5 field types confirm that any change activates the Save button. |

**Expected**: All 5 field types (checkbox, field, textbox, dropdown, radio) trigger change detection
**Data**: `fieldTypes=5` | `allTriggerChange=true`
**Automatable**: Yes

---

## TC-LOC-LI-046: Verify BillingWay Effective Date Past Date Validation
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Date Validation |

**Depends_On**: TC-LOC-LI-001
Preconditions (Human):
Billing Way change succeeded. "Effective Date" button is enabled.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Effective Date" shows current date | The "Effective Date" shows today's date. |
| 2 | Click date picker | The date picker opens. |
| 3 | Select yesterday's date | Yesterday's date is selected. |
| 4 | Click Save | The save is submitted. |
| 5 | Verify error: "Date cannot be in the past" | An error message reads "Date cannot be in the past". |
| 6 | Select today or future date | A valid present or future date is selected. |
| 7 | Click Save and verify success | The save completes successfully. |

**Expected**: Effective Date must be today or later. Past dates show error.
**Data**: `pastDate=invalid` | `today/future=valid`

Notes: Error key: a billing-date validation. Validation: BillingWay date validation
**Automatable**: Yes

---

## TC-LOC-LI-047: Verify BillingCycleID Required Field Validation
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Required Field |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Billing Cycle" dropdown has valid selection | The "Billing Cycle" dropdown shows a valid selected option. |
| 2 | Verify no exclamation icon visible | No exclamation icon is visible next to the "Billing Cycle" field. |
| 3 | Clear selection to empty/default (if editable) | The dropdown selection is cleared to empty or default. |
| 4 | Verify exclamation icon appears | An exclamation icon appears next to the "Billing Cycle" field. |
| 5 | Hover question mark icon and verify tooltip appears | A tooltip appears with the required-field validation message. |

**Expected**: Billing Cycle is required. Empty value shows exclamation icon.
**Data**: `BillingCycle=[required]`

Notes: Error key: a required-field validation. Tooltip text from a tooltip message constant.
**Automatable**: Yes

---

## TC-LOC-LI-048: Verify BillingCycleID Disabled When Billing Has Run
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | API Disable |

**Depends_On**: TC-LOC-LI-001
Preconditions (Human):
Office has already processed billing for current period. System automatically checks this on page load.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Local Information for office that has run billing | The Local Information tab for the selected office is displayed. |
| 2 | Verify "Billing Cycle" dropdown is disabled | The "Billing Cycle" dropdown is disabled. |
| 3 | Verify the alert/tooltip displays the verbatim message: `Corporate billing for the local batch must be completed before the billing cycle can be changed.` | The alert or tooltip reads: "Corporate billing for the local batch must be completed before the billing cycle can be changed." |
| 4 | Make other changes, Save | The save completes. |
| 5 | Verify "Billing Cycle" remains disabled | The "Billing Cycle" dropdown remains disabled. |

**Expected**: Billing Cycle disabled if billing has already run. The user-visible alert/tooltip text is the verbatim string: `Corporate billing for the local batch must be completed before the billing cycle can be changed.`
**Data**: `BillingCycle=disabled` | `expectedAlertText="Corporate billing for the local batch must be completed before the billing cycle can be changed."` | `localBillingRan is true`

Notes: API: BillingCycle change handler. localBillingRan is true when data > 0. Sibling localization key `billingDesc` ("There are orders that have not been billed in the current billing period. Those must be invoiced before the change can be made.") is a DIFFERENT message (different trigger) and MUST NOT be conflated with `billingCycleMsg`.
**Automatable**: Yes

---

> **[TC-LOC-LI-049 and TC-LOC-LI-050 removed]** These IDs were reserved and subsequently removed before completion. They are excluded from the total TC count.

## TC-LOC-LI-051: Verify Allow DPCD Disabled When Comm Receiver Is Unchecked
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Comm Receiver" checkbox is checked (default) | The "Comm Receiver" checkbox is checked. |
| 2 | Verify "Allow DPCD" checkbox is enabled and checked | The "Allow DPCD" checkbox is enabled and checked. |
| 3 | Uncheck "Comm Receiver" checkbox | The "Comm Receiver" checkbox is unchecked. |
| 4 | Verify "Allow DPCD" checkbox is DISABLED | The "Allow DPCD" checkbox is disabled. |
| 5 | Verify "Allow DPCD" checkbox value is reset to false (unchecked) | The "Allow DPCD" checkbox value is reset to false (unchecked). |
| 6 | Re-check "Comm Receiver" checkbox | The "Comm Receiver" checkbox is checked again. |
| 7 | Verify "Allow DPCD" checkbox is enabled again (but remains unchecked, not auto-restored) | The "Allow DPCD" checkbox is enabled but remains unchecked (not auto-restored). |

**Expected**: Allow DPCD is disabled when Comm Receiver is unchecked, and its value resets to unchecked
**Data**: `IsCommReceiver=false means AllowDPCD=disabled,false` | `resetTrigger=IsCommReceiver=false`
**Automatable**: Yes

---

## TC-LOC-LI-052: Verify Show SubRental Disabled When Comm Receiver Unchecked
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Comm Receiver" checkbox is checked | The "Comm Receiver" checkbox is checked. |
| 2 | Verify "Show SubRental" checkbox is enabled | The "Show SubRental" checkbox is enabled. |
| 3 | Check "Show SubRental" checkbox | The "Show SubRental" checkbox is checked. |
| 4 | Uncheck "Comm Receiver" checkbox | The "Comm Receiver" checkbox is unchecked. |
| 5 | Verify "Show SubRental" checkbox is DISABLED | The "Show SubRental" checkbox is disabled. |
| 6 | Verify "Show SubRental" checkbox value resets to false (same behavior as Allow DPCD) | The "Show SubRental" checkbox value resets to false (unchecked). |
| 7 | Re-check "Comm Receiver" checkbox | The "Comm Receiver" checkbox is checked again. |
| 8 | Verify "Show SubRental" checkbox is enabled but remains unchecked (not restored) | The "Show SubRental" checkbox is enabled but remains unchecked (not restored). |

**Expected**: Show SubRental is disabled when Comm Receiver is unchecked. Its value resets to unchecked (the same behavior as Allow DPCD).
**Data**: `IsCommReceiver=false means ShowSubRental=disabled,false` | `resetBehavior=resets to false`
**Automatable**: Yes

---

## TC-LOC-LI-053: Verify Display Tax Auto-Set When Company Remit Tax Enabled
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Auto-Set Behavior |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Display Tax" checkbox is checked and disabled | The "Display Tax" checkbox is checked and disabled. |
| 2 | Verify "Company Remit Tax" checkbox is checked (default) | The "Company Remit Tax" checkbox is checked. |
| 3 | Uncheck "Company Remit Tax" checkbox | The "Company Remit Tax" checkbox is unchecked. |
| 4 | Verify "Display Tax" checkbox becomes enabled if Company Remit Tax 2 is also false, or remains disabled if Company Remit Tax 2 is true | The "Display Tax" checkbox becomes enabled if Company Remit Tax 2 is also false, or remains disabled if Company Remit Tax 2 is true. |
| 5 | Re-check "Company Remit Tax" checkbox | The "Company Remit Tax" checkbox is checked again. |
| 6 | Verify "Display Tax" checkbox is auto-set to true (checked) and DISABLED | The "Display Tax" checkbox is automatically set to true (checked) and disabled. |

**Expected**: Display Tax is automatically checked and disabled when Company Remit Tax is enabled
**Data**: `HRIRemitTax=true means DisplayTax=true,disabled` | `autoSet=true`
**Automatable**: Yes

---

## TC-LOC-LI-054: Verify Display Tax Auto-Set When Second Company Remit Tax Enabled
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Auto-Set Behavior |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Uncheck "Company Remit Tax" checkbox | The "Company Remit Tax" checkbox is unchecked. |
| 2 | Verify "Display Tax" checkbox state (enabled when second Company Remit Tax is false, or disabled when second Company Remit Tax is true) | The "Display Tax" checkbox state updates: enabled when both Company Remit Tax fields are false, disabled when either is true. |
| 3 | Check the second "Company Remit Tax" checkbox (skip this step for countries where second checkbox is not present) | The second "Company Remit Tax" checkbox is checked. |
| 4 | Verify "Display Tax" is auto-checked and disabled | The "Display Tax" checkbox is automatically set to true (checked) and disabled. |
| 5 | Uncheck both remit tax checkboxes | Both remit tax checkboxes are unchecked. |
| 6 | Verify "Display Tax" is enabled and toggleable | The "Display Tax" checkbox is enabled and can be toggled freely. |

**Expected**: Display Tax auto-set when either Company Remit Tax is checked.
**Data**: `RemitTax=true means DisplayTax=auto-checked,disabled`

Notes: Second remit tax (HRIRemitTax2) visibility varies by country. Skip steps 3-4 if not visible.
**Automatable**: Yes

---

## TC-LOC-LI-055: Verify Enable IDC Billing Disabled When Intercompany Unchecked
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Intercompany" checkbox is checked (default) | The "Intercompany" checkbox is checked. |
| 2 | Verify "Enable IDC Billing" checkbox is enabled | The "Enable IDC Billing" checkbox is enabled. |
| 3 | Uncheck "Intercompany" checkbox | The "Intercompany" checkbox is unchecked. |
| 4 | Verify "Enable IDC Billing" checkbox is DISABLED | The "Enable IDC Billing" checkbox is disabled. |
| 5 | Verify "Enable IDC Billing" checkbox value is reset to false (unchecked) | The "Enable IDC Billing" checkbox value is reset to false (unchecked). |
| 6 | Re-check "Intercompany" checkbox | The "Intercompany" checkbox is checked again. |
| 7 | Verify "Enable IDC Billing" checkbox is enabled (unchecked, not restored) | The "Enable IDC Billing" checkbox is enabled but remains unchecked (not auto-restored). |

**Expected**: Enable IDC Billing is disabled when Intercompany is unchecked, and its value resets to unchecked
**Data**: `InternalCompany=false means EnableIDCBilling=disabled,false` | `resetTrigger=InternalCompany=false`
**Automatable**: Yes

---

> **[TC-LOC-LI-056 removed]** This ID was reserved and subsequently removed before completion. It is excluded from the total TC count.

## TC-LOC-LI-057: Verify Compass Integration Disabled For Existing Locations
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open an existing location (office 1604) and verify "Compass Integration" checkbox is DISABLED | The "Compass Integration" checkbox is disabled for the existing office 1604 location. |
| 2 | Navigate to create a new location and verify "Compass Integration" checkbox is ENABLED | The "Compass Integration" checkbox is enabled when creating a new location. |
| 3 | Check "Compass Integration" checkbox and Save the new location | The "Compass Integration" checkbox is checked and the new location is saved. |
| 4 | Re-open the created location (now an existing location) and verify "Compass Integration" checkbox is DISABLED (cannot uncheck after creation) | The "Compass Integration" checkbox is disabled when the newly created location is reopened as an existing record. |

**Expected**: Compass Integration is disabled when updating an existing location, and enabled only during creation
**Data**: `isNew=false means Compass=disabled` | `isNew=true means Compass=enabled`
**Automatable**: Yes

---

## TC-LOC-LI-058: Verify USA Country Rules (country selection)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Country Branch |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify office 1604 is USA location (country selection) | Office 1604 is confirmed as a USA location. |
| 2 | Verify "Company Remit Tax" field visibility and state | The "Company Remit Tax" field is visible and in its USA-specific state. |
| 3 | Verify second remit tax field is unchecked or disabled | The second remit tax field is unchecked or disabled. |
| 4 | Verify discount fields are enabled on Local Information tab | The discount fields are enabled on the Local Information tab. |
| 5 | Compare field visibility to non-USA office | The field visibility and enablement differ from a non-USA office because USA-specific rules are applied. |

**Expected**: USA offices have specific field visibility and enable/disable rules.
**Data**: `country selection` | `USA rules active`

Notes: Internal: for USA.
**Automatable**: Yes

---

## TC-LOC-LI-059: Verify Non-USA Country Rules
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Country Branch |

**Depends_On**: TC-LOC-LI-001
Preconditions (Human):
Navigator is open. User has access to international offices (Canada, Mexico, or other non-USA locations).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to a Canadian, Mexican, or other international office. | The Local Information tab for the international office is displayed. |
| 2 | Verify the "Company Remit Tax" field is visible. | The "Company Remit Tax" field is visible. |
| 3 | Verify discount checking is disabled. | The discount check fields are disabled. |
| 4 | Verify field behaviors differ from USA offices because the international rule set is applied. | The field behaviors differ from a USA office because the international rule set is applied. |

**Expected**: Non-USA offices (country selection) have different rules via updateControlStatus(countryId)
**Data**: `country selection` | `` | ``
**Automatable**: Yes

---

## TC-LOC-LI-060: Verify Read-Only State For Users Without Edit Permission
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Permission State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Login as a read-only user with the Location Viewer role - this requires manually provisioning a test account with read-only permissions | Login completes and the user is authenticated as a read-only viewer. |
| 2 | Navigate to office 1604 Local Information | The Local Information tab for office 1604 is displayed. |
| 3 | Verify "LDW Percentage" field is DISABLED | The "LDW Percentage" field is disabled. |
| 4 | Verify "C&C Percentage" field is DISABLED | The "C&C Percentage" field is disabled. |
| 5 | Verify "ETS Percentage" field is DISABLED | The "ETS Percentage" field is disabled. |
| 6 | Verify "Resort Tax Percentage" field is DISABLED | The "Resort Tax Percentage" field is disabled. |
| 7 | Verify "Threshold" field is DISABLED | The "Threshold" field is disabled. |
| 8 | Verify "Allow DPCD" checkbox is DISABLED | The "Allow DPCD" checkbox is disabled. |
| 9 | Verify "Show SubRental" checkbox is DISABLED | The "Show SubRental" checkbox is disabled. |
| 10 | Verify "Display Tax" checkbox is DISABLED | The "Display Tax" checkbox is disabled. |
| 11 | Verify Save button is DISABLED or hidden | The Save button is disabled or hidden. |

**Expected**: Users without edit permission see all conditional fields as disabled (read-only)
**Data**: `canEditLoc=false means allConditionalFields=disabled` | `permissionState=read-only` | `testAccount=requires manual provisioning of Location Viewer role account` | `role=Location Viewer`
**Automatable**: Yes

---

## TC-LOC-LI-061: Verify ResortTaxPercent First Enable Reset
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Reset Behavior |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Allow Resort Tax" checkbox is unchecked and "Resort Tax Percentage" field is disabled with value 0 | The "Allow Resort Tax" checkbox is unchecked and the "Resort Tax Percentage" field is disabled with value 0. |
| 2 | Check "Allow Resort Tax" checkbox | The "Allow Resort Tax" checkbox is checked. |
| 3 | Verify "Resort Tax Percentage" field is enabled with value reset to 0 (first enable reset) | The "Resort Tax Percentage" field is enabled and shows 0 (first-enable reset). |
| 4 | Set "Resort Tax Percentage" field to 5.5 | The "Resort Tax Percentage" field shows 5.5. |
| 5 | Uncheck "Allow Resort Tax" checkbox and verify "Resort Tax Percentage" field is disabled with value reset to 0 | The "Allow Resort Tax" checkbox is unchecked and the "Resort Tax Percentage" field is disabled with value reset to 0. |
| 6 | Re-check "Allow Resort Tax" checkbox and verify "Resort Tax Percentage" field is enabled | The "Allow Resort Tax" checkbox is checked again. |
| 7 | Verify "Resort Tax Percentage" field value is reset to 0 again (first enable reset triggers every time) | The "Resort Tax Percentage" field is enabled and shows 0 (the first-enable reset fires every time the checkbox is enabled). |

**Expected**: ResortTaxPercent resets to 0 when disabled OR when first enabled (every enable is treated as "first")
**Data**: `resetTriggers=disabled OR firstEnabled` | `alwaysResetTo0=true`
**Automatable**: Yes

---

## TC-LOC-LI-062: Verify Left Panel Disabled Fields Are Non-Interactive (READ-ONLY)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Read-Only Verification |

**Depends_On**: TC-LOC-LI-001
**Preconditions**: User is on the location Settings page. Left panel is visible alongside the right-panel tabs.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify the "Office" input field is rendered as disabled and cannot be typed into or changed. | The "Office" input field is disabled and cannot accept keyboard input or be changed. |
| 2 | Verify the "Local Office" input field is rendered as disabled. | The "Local Office" input field is disabled. |
| 3 | Verify the "Pay To Address" input field is rendered as disabled. | The "Pay To Address" input field is disabled. |
| 4 | Verify the "eCommerce Active" checkbox is rendered as disabled (grayed out and cannot be checked or unchecked). | The "eCommerce Active" checkbox is grayed out and cannot be checked or unchecked. |
| 5 | Verify the "Enable Productions Orders" checkbox is rendered as disabled. | The "Enable Productions Orders" checkbox is grayed out and cannot be checked or unchecked. |
| 6 | Attempt to interact with any disabled field and verify no state change occurs. | No state change occurs on any disabled field when interaction is attempted. |

**Expected**: All 5 confirmed-disabled left-panel fields (Office, Local Office, Pay To Address, eCommerce Active, Enable Productions Orders) are rendered as non-interactive. No value changes are possible.
**Data**: `office=1604` | `disabledFields=5` | `Office, Local Office, Pay To Address, eCommerce Active, Enable Productions Orders`

Notes: DO NOT attempt to edit, clear, or change any left-panel field value — read-only verification ONLY. Disabled state is by design; these are master data controlled outside the location detail screen.
**Automatable**: Yes

---

## TC-LOC-LI-063: Verify Left Panel Static Display Values for Office 1604
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Read-Only Verification |

**Depends_On**: TC-LOC-LI-001
**Preconditions**: User is on the location Settings page. Left panel is visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the "Office" field value and verify it displays "1604". | The "Office" field displays "1604". |
| 2 | Read the "Local Office" field value and verify it displays "1604". | The "Local Office" field displays "1604". |
| 3 | Read the "Pay To Address" field value and verify it displays "Encore". | The "Pay To Address" field displays "Encore". |
| 4 | Read the "eCommerce Active" checkbox state and verify it is checked and disabled. | The "eCommerce Active" checkbox is checked and disabled. |
| 5 | Read the "Enable Productions Orders" checkbox state and verify it is checked and disabled. | The "Enable Productions Orders" checkbox is checked and disabled. |
| 6 | Perform any right-panel tab edit (for example, toggle any Local Information checkbox) and save. | The right-panel change is saved. |
| 7 | Re-verify all 5 left-panel fields and confirm their values are unchanged. | All 5 left-panel fields retain their original values after the right-panel save. |

**Expected**: Office="1604", Local Office="1604", Pay To Address="Encore", eCommerce Active=checked+disabled, Enable Productions Orders=checked+disabled. All values unchanged after right-panel save.
**Data**: `office=1604` | `localOffice=1604` | `payToAddress=Encore` | `eCommerceActive=checked+disabled` | `enableProductionsOrders=checked+disabled`

Notes: DO NOT attempt to edit any left-panel value — all 5 fields are disabled by design. Values confirmed via live interface snapshot. Key assertion: right-panel saves do NOT mutate left-panel data.
**Automatable**: Yes

---

## TC-LOC-LI-064: Verify Ticker Calc Checkbox Default State and Toggle Persistence
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field State |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-064/065)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Ticker Calc" checkbox is checked by default. | The "Ticker Calc" checkbox is checked. |
| 2 | Uncheck "Ticker Calc" checkbox and verify the "Save" button becomes enabled. | The "Ticker Calc" checkbox is unchecked and the Save button becomes enabled. |
| 3 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 4 | Verify "Ticker Calc" checkbox is unchecked. | The "Ticker Calc" checkbox is unchecked. |
| 5 | Re-check "Ticker Calc" checkbox and verify the "Save" button becomes enabled. | The "Ticker Calc" checkbox is checked again and the Save button becomes enabled. |
| 6 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 7 | Verify "Ticker Calc" checkbox is checked again. | The "Ticker Calc" checkbox is checked. |

**Expected**: Ticker Calc defaults to checked. Toggle is independent (no side effects on other fields). Persists after save/reload cycle.
**Data**: `chkTickerCalc=checked default` | `independent=true`
**Automatable**: Yes

---

## TC-LOC-LI-065: Verify the Admin Fee and Calculate on Net Amount Service Charge checkboxes
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field State |

**Depends_On**: TC-LOC-LI-001

Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-064/065)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set "Service Charge" parent checkbox to checked. | The "Service Charge" parent checkbox is checked. |
| 2 | Verify "Show Service Charge As Administrative Fee" defaults to unchecked and is enabled because the parent is checked. | The "Show Service Charge As Administrative Fee" checkbox is unchecked and enabled. |
| 3 | Verify "Calculate Service Charge On Net Amount" defaults to unchecked and is enabled. | The "Calculate Service Charge On Net Amount" checkbox is unchecked and enabled. |
| 4 | Check "Show Service Charge As Administrative Fee" and verify no side effects on other fields. | The "Show Service Charge As Administrative Fee" checkbox is checked with no side effects on other fields. |
| 5 | Check "Calculate Service Charge On Net Amount" and verify no side effects on other fields. | The "Calculate Service Charge On Net Amount" checkbox is checked with no side effects on other fields. |
| 6 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 7 | Verify both children persisted as checked. | Both child checkboxes are checked after reload. |
| 8 | Uncheck "Service Charge" parent. | The "Service Charge" parent checkbox is unchecked. |
| 9 | Verify per the documented requirement that both children become disabled and their values reset to unchecked. | Both child checkboxes become disabled and unchecked per the documented dependency (currently failing on live site — children remain active). |

**Expected**: Service Charge parent to children dependency: when parent is unchecked, both children should be disabled (and unchecked). When parent is checked, children are independently togglable. Same pattern as Apply LDW to LDW Percentage, Apply C&C to C&C children, Allow ETS to ETS Percentage. Actual on the live site: the dependent options remain active (checked and enabled) regardless of the parent state.
**Data**: `chkServiceCharge=parent` | `chkShowServiceChargeAsAdministrativeFee=child1` | `chkCalculateServiceChargeOnNetAmount=child2` | `expectedDependency=parent-checked enables children, parent-unchecked disables and resets children` | `actualBehavior=children always active`
**Automatable**: Yes — once is fixed, automation should assert the dependency. Until fixed, this TC documents the contract gap.

---

## TC-LOC-LI-066: Verify Enable Job Costing and Enable Proposal checkboxes persist
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify "Enable Job Costing" checkbox is checked by default. | The "Enable Job Costing" checkbox is checked. |
| 2 | Verify "Enable Proposal" checkbox is checked by default. | The "Enable Proposal" checkbox is checked. |
| 3 | Uncheck "Enable Job Costing" and verify the "Save" button becomes enabled with no dependency triggered on other fields. | The "Enable Job Costing" checkbox is unchecked and the Save button becomes enabled with no dependency triggered on other fields. |
| 4 | Uncheck "Enable Proposal" and verify no dependency is triggered. | The "Enable Proposal" checkbox is unchecked with no dependency triggered on other fields. |
| 5 | Click "Save" and reload the page. | The save completes and the page reloads. |
| 6 | Verify "Enable Job Costing" is unchecked. | The "Enable Job Costing" checkbox is unchecked. |
| 7 | Verify "Enable Proposal" is unchecked. | The "Enable Proposal" checkbox is unchecked. |
| 8 | Re-check both, click "Save", and reload. | Both checkboxes are re-checked, the save completes, and the page reloads. |
| 9 | Verify "Enable Job Costing" is checked. | The "Enable Job Costing" checkbox is checked. |
| 10 | Verify "Enable Proposal" is checked. | The "Enable Proposal" checkbox is checked. |

**Expected**: Enable Job Costing and Enable Proposal both default to checked, are independent (no cross-field effects), and persist toggle state after save/reload.
**Data**: `chkEnableJobCosting=checked default` | `chkEnableProposal=checked default` | `independent=true`
**Automatable**: Yes

---

## TC-LOC-LI-067: Checkbox Labels Display Correct Visible Text
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| Medium | Automated | UI Validation | Yes | specs/locations/location-local-information.spec.ts:338 |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | For each checkbox on the "Local Information" tab, read the visible label text and collect all labels. | All visible label texts for every checkbox on the "Local Information" tab are collected. |
| 2 | Compare each label against the expected text from CHECKBOX_LABEL_CASES test data and verify all labels match. | Each label matches the corresponding expected text from the CHECKBOX_LABEL_CASES test data. |
| 3 | Collect all mismatches and verify zero failures. | Zero mismatches are found across all checkbox labels. |

**Expected**: All checkbox fields display their correct, human-readable labels matching the requirements specification.
**Data**: CHECKBOX_LABEL_CASES array (key to expected label pairs)
**Automatable**: Yes
Notes: Bulk validation test — tests all checkbox labels in one pass. Added per requirements update.

---

## TC-LOC-LI-068: Oracle Product accepts special characters and the value persists
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Field Persistence | Yes | specs/locations/location-local-information.spec.ts:351 |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current "Oracle Product" value and save it as the original. | The original "Oracle Product" value is read and recorded. |
| 2 | Enter the special characters test value into "Oracle Product". | The "Oracle Product" field contains the special characters test value. |
| 3 | Click "Save" and verify it completes. | The save completes successfully. |
| 4 | Reload the page and navigate back to the "Local Information" tab. | The page reloads and the "Local Information" tab is displayed. |
| 5 | Verify "Oracle Product" contains the special characters value. | The "Oracle Product" field contains the special characters value exactly as entered. |
| 6 | Restore the original value and save. | The original value is restored and the save completes. |

**Expected**: Oracle Product text field accepts and persists special characters after save+reload cycle. Original value restored at cleanup.
**Data**: `txtOracleProduct` | `specialChars` test value | `office=1604`
**Automatable**: Yes
Notes: — server now accepts persistent changes for office 1604.

---

## TC-LOC-LI-069: Oracle Department Alphanumeric Value Persists After Save
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Field Persistence | Yes | specs/locations/location-local-information.spec.ts:364 |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current "Oracle Department" value and save it as the original. | The original "Oracle Department" value is read and recorded. |
| 2 | Enter the alphanumeric test value into "Oracle Department". | The "Oracle Department" field contains the alphanumeric test value. |
| 3 | Click "Save" and verify it completes. | The save completes successfully. |
| 4 | Reload the page and navigate back to the "Local Information" tab. | The page reloads and the "Local Information" tab is displayed. |
| 5 | Verify "Oracle Department" contains the test value. | The "Oracle Department" field contains the test value. |
| 6 | Restore the original value and save. | The original value is restored and the save completes. |

**Expected**: Oracle Department text field accepts and persists alphanumeric values after save+reload cycle. Original value restored at cleanup.
**Data**: `txtOracleDepartment` | `oracleDeptTest` value | `office=1604`
**Automatable**: Yes
Notes: — server now accepts persistent changes for office 1604.

---

## TC-LOC-LI-070: Skip Billing Toggle Persists After Save+Reload
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Field Persistence | Yes | specs/locations/location-local-information.spec.ts:377 |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Wait for the "Skip Billing" checkbox to be visible and interactive. | The "Skip Billing" checkbox is visible and interactive. |
| 2 | Read the initial checked or unchecked state of "Skip Billing". | The initial checked or unchecked state of "Skip Billing" is recorded. |
| 3 | Toggle "Skip Billing" to the opposite state. | The "Skip Billing" checkbox is in the opposite state. |
| 4 | Click "Save" and verify it completes. | The save completes successfully. |
| 5 | Reload the page and navigate back to the "Local Information" tab. | The page reloads and the "Local Information" tab is displayed. |
| 6 | Verify "Skip Billing" is in the toggled state. | The "Skip Billing" checkbox shows the toggled state. |
| 7 | Restore the original state and save. | The original state is restored and the save completes. |

**Expected**: The Skip Billing checkbox toggle persists after a save and reload. The original state is always restored at the end, regardless of test outcome.
**Data**: `chkSkipBilling` | `office=1604`
**Automatable**: Yes
Notes: MCP-verified — Skip Billing does NOT disable Oracle Product (checkbox is billing flag only). Updated from the prior version to test actual toggle+persist behavior.

---

## TC-LOC-LI-071: Enable Multiday Pricing — Toggle and Persist After Save+Reload
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Field State | Yes | specs/locations/location-local-information.spec.ts:172 |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Check "Enable Multiday Pricing" (default is unchecked) and verify the "Save" button becomes enabled. | The "Enable Multiday Pricing" checkbox is checked and the Save button becomes enabled. |
| 2 | Click "Save" and verify it completes. | The save completes. |
| 3 | Reload the page and navigate back to the "Local Information" tab. | The page reloads and the "Local Information" tab is displayed. |
| 4 | Verify "Enable Multiday Pricing" is checked. | The "Enable Multiday Pricing" checkbox is checked. |
| 5 | Uncheck "Enable Multiday Pricing" to restore the baseline. | The "Enable Multiday Pricing" checkbox is unchecked to restore the baseline. |
| 6 | Click "Save" and verify the baseline is restored. | The save completes and the baseline is restored. |

**Expected**: Enable Multiday Pricing checkbox toggles ON, persists after save+reload, and can be restored to baseline.
**Data**: `chkEnableMultidayPricing=unchecked default` | `office=1604`
**Automatable**: Yes
Notes: Added per requirements update (Jira). MCP-verified.

---

## TC-LOC-LI-072: Enable IDC Billing — Persist After Save+Reload
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Field State | Yes | specs/locations/location-local-information.spec.ts:233 |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Check "Enable IDC Billing" and verify it is checked. | The "Enable IDC Billing" checkbox is checked. |
| 2 | Click "Save" and verify it completes. | The save completes. |
| 3 | Reload the page and navigate back to the "Local Information" tab. | The page reloads and the "Local Information" tab is displayed. |
| 4 | Verify "Enable IDC Billing" is checked. | The "Enable IDC Billing" checkbox is checked. |
| 5 | Uncheck "Enable IDC Billing" to restore the baseline. | The "Enable IDC Billing" checkbox is unchecked to restore the baseline. |
| 6 | Click "Save" and verify the baseline is restored. | The save completes and the baseline is restored. |

**Expected**: Enable IDC Billing checkbox persists as checked after save+reload cycle.
**Data**: `chkEnableIDCBilling` | `office=1604`
**Automatable**: Yes
Notes: Added per requirements update (Jira). MCP-verified.

---

## TC-LOC-LI-073: Display Tax Auto-Checks When Company Remit Tax Re-Checked
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Dependency | Yes | specs/locations/location-local-information.spec.ts:187 |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Uncheck "Company Remit Tax" and verify "Display Tax" becomes enabled. | The "Company Remit Tax" checkbox is unchecked and the "Display Tax" checkbox becomes enabled. |
| 2 | Uncheck "Display Tax". | The "Display Tax" checkbox is unchecked. |
| 3 | Re-check "Company Remit Tax" and verify "Display Tax" auto-sets to checked and becomes disabled. | The "Company Remit Tax" checkbox is checked and the "Display Tax" checkbox automatically sets to true (checked) and becomes disabled. |
| 4 | Click "Save" and verify the cascade behavior is persisted. | The save completes successfully. |

**Expected**: Unchecking Company Remit Tax releases Display Tax for editing. Re-checking Company Remit Tax auto-sets Display Tax to true and disables it (cascade dependency).
**Data**: `chkCompanyRemitTax` | `chkDisplayTax` | `cascade=true`
**Automatable**: Yes
Notes: Cascade dependency. MCP ref: MCP-09.

---

## TC-LOC-LI-074: Threshold Decision Table — All 4 Combos + Reset-to-0 on Disable
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Decision Table | Yes | specs/locations/location-local-information.spec.ts:127 |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Combo A (Allow DPCD on, Prompt For Approval off, baseline): Verify "Threshold" is disabled. | With Allow DPCD on and Prompt For Approval off (Combo A), the "Threshold" field is disabled. |
| 2 | Combo B (Allow DPCD on, Prompt For Approval on): Check "Prompt For Approval" and verify "Threshold" stays disabled. | With Allow DPCD on and Prompt For Approval on (Combo B), the "Threshold" field remains disabled. |
| 3 | Combo D (Allow DPCD off, Prompt For Approval on): Uncheck "Allow DPCD" and verify "Threshold" becomes enabled. | With Allow DPCD off and Prompt For Approval on (Combo D), the "Threshold" field becomes enabled. |
| 4 | Combo C (Allow DPCD off, Prompt For Approval off): Uncheck "Prompt For Approval" and verify "Threshold" is disabled again. | With Allow DPCD off and Prompt For Approval off (Combo C), the "Threshold" field is disabled again. |
| 5 | Return to Combo D: re-check "Prompt For Approval" and verify "Threshold" is enabled. | With Prompt For Approval re-checked (Combo D), the "Threshold" field is enabled. |
| 6 | Set "Threshold" to 50.00. | The "Threshold" field shows 50.00. |
| 7 | Re-check "Allow DPCD" (Combo B) and verify "Threshold" is disabled and its value resets to 0. | With Allow DPCD re-checked (Combo B), the "Threshold" field is disabled and its value resets to 0. |
| 8 | Restore the baseline (Combo A) and save. | The baseline is restored and the save completes. |

**Expected**: Threshold is only enabled when Allow DPCD is unchecked AND Prompt For Approval is checked (Combo D). All other 3 combinations disable it. When Threshold becomes disabled, its value resets to 0.
**Data**: `chkAllowDPCD` | `chkPromptForApproval` | `spinThreshold` | `4-combo decision table`
**Automatable**: Yes
Notes: Dual dependency. Added per requirements update (Jira). a prior observation from exploration.

---

## TC-LOC-LI-075: C&C Percentage Resets to 0 When Apply C&C Fee Unchecked
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Dependency | Yes | specs/locations/location-local-information.spec.ts:211 |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Check "Apply Cables and Consumables Fee" and verify the "C&C Percentage" field becomes enabled. | The "Apply Cables and Consumables Fee" checkbox is checked and the "C&C Percentage" field becomes enabled. |
| 2 | Set "C&C Percentage" to 5.00. | The "C&C Percentage" field shows 5.00. |
| 3 | Uncheck "Apply Cables and Consumables Fee" and verify "C&C Percentage" is disabled and its value resets to 0. | The "Apply Cables and Consumables Fee" checkbox is unchecked and the "C&C Percentage" field is disabled with its value reset to 0. |
| 4 | Click "Save" and verify the reset state is persisted. | The save completes and the reset state is persisted after reload. |

**Expected**: Checking Apply C&C Fee enables C&C% field. Unchecking disables it AND resets value to 0 (not just disable).
**Data**: `chkApplyCablesConsumablesFee` | `spinCCPercentage` | `reset-on-disable=true`
**Automatable**: Yes
Notes: MCP ref: MCP-05. Confirms a prior observation (unchecking dependency resets values).

---

## TC-LOC-LI-076: Resort Tax Percentage Resets to 0 When Allow Resort Tax Unchecked
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Dependency | Yes | specs/locations/location-local-information.spec.ts:222 |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Check "Allow Resort Tax" and verify the "Resort Tax Percentage" field becomes enabled. | The "Allow Resort Tax" checkbox is checked and the "Resort Tax Percentage" field becomes enabled. |
| 2 | Set "Resort Tax Percentage" to 3.00. | The "Resort Tax Percentage" field shows 3.00. |
| 3 | Uncheck "Allow Resort Tax" and verify "Resort Tax Percentage" is disabled and its value resets to 0. | The "Allow Resort Tax" checkbox is unchecked and the "Resort Tax Percentage" field is disabled with its value reset to 0. |
| 4 | Click "Save" and verify the reset state is persisted. | The save completes and the reset state is persisted after reload. |

**Expected**: Checking Allow Resort Tax enables Resort Tax% field. Unchecking disables it AND resets value to 0.
**Data**: `chkAllowResortTax` | `spinResortTaxPercentage` | `reset-on-disable=true`
**Automatable**: Yes
Notes: MCP ref: MCP-06. Same reset-on-disable pattern as C&C Fee.

---

## TC-LOC-LI-077: Verify ETS Percentage enables when Allow ETS is checked and resets on uncheck
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Dependency | Yes | specs/locations/location-local-information.spec.ts:198 |

**Depends_On**: TC-LOC-LI-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Check "Allow ETS" and verify the "ETS Percentage" field becomes enabled and pre-fills with 23.00% (non-union default for office 1604). | The "Allow ETS" checkbox is checked and the "ETS Percentage" field becomes enabled, showing a pre-filled value of 23.00. |
| 2 | Verify "ETS Percentage" value is 23. | The "ETS Percentage" field shows 23. |
| 3 | Uncheck "Allow ETS" and verify "ETS Percentage" is disabled and its value resets to 0. | The "Allow ETS" checkbox is unchecked and the "ETS Percentage" field is disabled with its value reset to 0. |
| 4 | Click "Save" and verify the reset state is persisted. | The save completes and the reset state is persisted after reload. |

**Expected**: Checking Allow ETS enables ETS% and pre-fills it with the union/non-union default (23% for non-union office 1604). Unchecking disables and resets to 0.
**Data**: `chkAllowETS` | `spinETSPercentage` | `nonUnionDefault=23` | `office=1604 (non-union)`
**Automatable**: Yes
Notes: MCP ref: MCP-03. Office 1604 is non-union, so default is 23%. Union offices would default to 24%.

---

## TC-LOC-LI-078: Verify Apply LDW disables the Calculate LDW on Net Amount checkbox
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency (Negative) |


**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read "Calculate LDW On Net Amount" checkbox baseline (default: checked on office 1604) | The "Calculate LDW On Net Amount" checkbox baseline state is recorded. |
| 2 | Uncheck "Apply LDW" parent checkbox | The "Apply LDW" parent checkbox is unchecked. |
| 3 | Verify "Calculate LDW On Net Amount" sibling checkbox transitions to disabled AND unchecked | The "Calculate LDW On Net Amount" sibling checkbox is disabled and unchecked per the expected design contract (currently stays enabled on live site — this assertion is expected to fail until the bug is fixed). |
| 4 | Re-check "Apply LDW" parent | The "Apply LDW" parent checkbox is checked again. |
| 5 | Verify "Calculate LDW On Net Amount" sibling re-enables and respects its baseline | The "Calculate LDW On Net Amount" sibling checkbox is re-enabled and reflects its baseline state. |
| 6 | Cleanup: restore baseline state, no save (transient assertion only) | The baseline state is restored with no save. |

**Expected**: Unchecking Apply LDW is expected to disable and uncheck the Calculate LDW On Net Amount sibling checkbox (the same parent-to-child behavior as the Service Charge and C&C groups).
Actual on the live site: the sibling stays checked + enabled when parent is unchecked (only the LDW Percentage field disables). Save-cycle persistence not verified.
**Data**: `chkApplyLDW=toggle` | `chkCalcLDWOnNetAmount=expected disabled+unchecked when parent unchecked` | `bug=`
**Automatable**: Yes (assertion currently fails on new site; pin against fix)

---

## TC-LOC-LI-079: Verify Apply C&C disables the Calculate C&C on Net Amount checkbox
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency (Negative) |


**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read "Calculate C&C On Net Amount" checkbox baseline (default: checked on office 1604) | The "Calculate C&C On Net Amount" checkbox baseline state is recorded. |
| 2 | Uncheck "Apply C&C Fee" parent checkbox | The "Apply C&C Fee" parent checkbox is unchecked. |
| 3 | Verify "Calculate C&C On Net Amount" sibling checkbox transitions to disabled AND unchecked | The "Calculate C&C On Net Amount" sibling checkbox is disabled and unchecked per the expected design contract (currently stays enabled on live site — this assertion is expected to fail until the bug is fixed). |
| 4 | Re-check "Apply C&C Fee" parent | The "Apply C&C Fee" parent checkbox is checked again. |
| 5 | Verify "Calculate C&C On Net Amount" sibling re-enables and respects its baseline | The "Calculate C&C On Net Amount" sibling checkbox is re-enabled and reflects its baseline state. |
| 6 | Cleanup: restore baseline state, no save (transient assertion only) | The baseline state is restored with no save. |

**Expected**: Unchecking Apply C&C Fee disables and unchecks the Calculate C&C On Net Amount sibling checkbox.
Actual on the live site: the sibling stays checked + enabled when parent is unchecked. Save-cycle persistence not verified.
**Data**: `chkApplyCablesConsumablesFee=toggle` | `chkCalcCACOnNetAmount=expected disabled+unchecked when parent unchecked` | `bug=`
**Automatable**: Yes (assertion currently fails on new site; pin against fix)

---

## TC-LOC-LI-080: Verify Enable Set/Strike Minutes disables Apply Set/Strike Minutes
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field Dependency (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read "Apply Set/Strike Labor Minutes" checkbox baseline (default: checked on office 1604 when Enable Set/Strike Minutes is checked) | The "Apply Set/Strike Labor Minutes" checkbox baseline state is recorded. |
| 2 | Uncheck "Enable Set/Strike Labor Minutes" parent checkbox | The "Enable Set/Strike Labor Minutes" parent checkbox is unchecked. |
| 3 | Verify "Apply Set/Strike Labor Minutes" child checkbox transitions to disabled (and unchecked per cascade convention) | The "Apply Set/Strike Labor Minutes" child checkbox is disabled and unchecked per the cascade convention. |
| 4 | Re-check "Enable Set/Strike Labor Minutes" parent | The "Enable Set/Strike Labor Minutes" parent checkbox is checked again. |
| 5 | Verify "Apply Set/Strike Labor Minutes" child re-enables | The "Apply Set/Strike Labor Minutes" child checkbox is re-enabled. |
| 6 | Cleanup: restore baseline state, no save (transient assertion only) | The baseline state is restored with no save. |

**Expected**: Unchecking Enable Set/Strike Labor Minutes disables and unchecks the Apply Set/Strike Labor Minutes child checkbox (the parent-to-child cascade behavior).
**Data**: `chkEnableSetStrikeMinutes=toggle` | `chkApplySetStrikeMinutes=expected disabled+unchecked when parent unchecked`
**Automatable**: Yes

---

## TC-LOC-LI-081: Verify C&C Percentage field Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Ensure "Apply C&C Fee" is checked and "C&C Percentage" field is enabled. | The "Apply C&C Fee" checkbox is checked and the "C&C Percentage" field is enabled. |
| 2 | Clear the field and enter 0. | The "C&C Percentage" field shows 0. |
| 3 | Click "Save" and reload. | The save completes and the page reloads. |
| 4 | Verify "C&C Percentage" persists as 0 with no error. | The "C&C Percentage" field shows 0 with no error message. |

**Expected**: Value 0 is valid for C&C Percentage, persists, no error message.
**Data**: `spinCCPercentage=0` | `min=0` | `max=100`
**Automatable**: Yes

---

## TC-LOC-LI-082: Verify C&C Percentage field Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100 in "C&C Percentage". | The "C&C Percentage" field shows 100. |
| 2 | Save and reload. | The save completes and the page reloads. |
| 3 | Verify the value persists as 100 with no error. | The "C&C Percentage" field shows 100 with no error message. |

**Expected**: Value 100 is valid (max), persists, no error.
**Data**: `spinCCPercentage=100`
**Automatable**: Yes

---

## TC-LOC-LI-083: Verify C&C Percentage field Boundary - Invalid Below Min (-0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -0.01 in "C&C Percentage" and verify the field is shown as invalid. | The "C&C Percentage" field shows -0.01 as invalid. |
| 2 | Verify "Save" is DISABLED. | The Save button is disabled. |
| 3 | Verify the error message "Number must be greater than or equal to 0" is shown. | The error message "Number must be greater than or equal to 0" is displayed. |
| 4 | Restore a valid value to clear the error. | A valid value is entered and the error clears. |

**Expected**: -0.01 is below the minimum and the field is shown as invalid. "Save" is disabled until the value is corrected.
**Data**: `spinCCPercentage=-0.01` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-084: Verify C&C Percentage field Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -5 in "C&C Percentage" and verify the field is shown as invalid. | The "C&C Percentage" field shows -5 as invalid. |
| 2 | Verify "Save" is disabled. | The Save button is disabled. |
| 3 | Verify the error "Number must be greater than or equal to 0" is shown. | The error message "Number must be greater than or equal to 0" is displayed. |

**Expected**: -5 is far below the minimum and the field is shown as invalid. "Save" is disabled.
**Data**: `spinCCPercentage=-5` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-085: Verify C&C Percentage field Boundary - Invalid Above Max (100.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100.01 in "C&C Percentage" and verify the field is shown as invalid. | The "C&C Percentage" field shows 100.01 as invalid. |
| 2 | Verify "Save" is disabled. | The Save button is disabled. |
| 3 | Verify the error "Number must be less than or equal to 100" is shown. | The error message "Number must be less than or equal to 100" is displayed. |

**Expected**: 100.01 is above the maximum and the field is shown as invalid. "Save" is disabled.
**Data**: `spinCCPercentage=100.01` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-086: Verify C&C Percentage field Boundary - Invalid Far Above Max (150.99)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 150.99 in "C&C Percentage" and verify the field is shown as invalid. | The "C&C Percentage" field shows 150.99 as invalid. |
| 2 | Verify "Save" is disabled. | The Save button is disabled. |
| 3 | Verify the error "Number must be less than or equal to 100" is shown. | The error message "Number must be less than or equal to 100" is displayed. |

**Expected**: 150.99 invalid (far above max). Save disabled.
**Data**: `spinCCPercentage=150.99` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-087: Verify ETS Percentage field Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Ensure "Allow ETS" is checked and "ETS Percentage" field is enabled | The "Allow ETS" checkbox is checked and the "ETS Percentage" field is enabled. |
| 2 | Clear and enter 0 | The "ETS Percentage" field shows 0. |
| 3 | Save and reload | The save completes and the page reloads. |
| 4 | Verify value persists as 0 | The "ETS Percentage" field shows 0 with no error message. |

**Expected**: Value 0 valid for ETS Percentage, persists, no error.
**Data**: `spinETSPercentage=0`
**Automatable**: Yes

---

## TC-LOC-LI-088: Verify ETS Percentage field Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100 in "ETS Percentage" | The "ETS Percentage" field shows 100. |
| 2 | Save and reload | The save completes and the page reloads. |
| 3 | Verify value persists as 100 | The "ETS Percentage" field shows 100 with no error message. |

**Expected**: Value 100 valid (max), persists.
**Data**: `spinETSPercentage=100`
**Automatable**: Yes

---

## TC-LOC-LI-089: Verify ETS Percentage field Boundary - Invalid Below Min (-0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -0.01 in "ETS Percentage" and verify the field is shown as invalid. | The "ETS Percentage" field shows -0.01 as invalid. |
| 2 | Verify "Save" is disabled. | The Save button is disabled. |
| 3 | Verify the error "Number must be greater than or equal to 0" is shown. | The error message "Number must be greater than or equal to 0" is displayed. |

**Expected**: -0.01 invalid. Save disabled.
**Data**: `spinETSPercentage=-0.01` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-090: Verify ETS Percentage field Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -5 in "ETS Percentage" | The "ETS Percentage" field shows -5 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be greater than or equal to 0" | The error message "Number must be greater than or equal to 0" is displayed. |

**Expected**: -5 invalid (far below min). Save disabled.
**Data**: `spinETSPercentage=-5` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-091: Verify ETS Percentage field Boundary - Invalid Above Max (100.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100.01 in "ETS Percentage" | The "ETS Percentage" field shows 100.01 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be less than or equal to 100" | The error message "Number must be less than or equal to 100" is displayed. |

**Expected**: 100.01 invalid (just above max). Save disabled.
**Data**: `spinETSPercentage=100.01` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-092: Verify ETS Percentage field Boundary - Invalid Far Above Max (150.99)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 150.99 in "ETS Percentage" | The "ETS Percentage" field shows 150.99 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be less than or equal to 100" | The error message "Number must be less than or equal to 100" is displayed. |

**Expected**: 150.99 invalid (far above max). Save disabled.
**Data**: `spinETSPercentage=150.99` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-093: Verify Resort Tax Percentage field Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Ensure "Allow Resort Tax" is checked and "Resort Tax Percentage" field is enabled | The "Allow Resort Tax" checkbox is checked and the "Resort Tax Percentage" field is enabled. |
| 2 | Clear and enter 0 | The "Resort Tax Percentage" field shows 0. |
| 3 | Save and reload | The save completes and the page reloads. |
| 4 | Verify value persists as 0 | The "Resort Tax Percentage" field shows 0 with no error message. |

**Expected**: Value 0 valid for Resort Tax Percentage, persists.
**Data**: `spinResortTaxPercentage=0`
**Automatable**: Yes

---

## TC-LOC-LI-094: Verify Resort Tax Percentage field Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100 in "Resort Tax Percentage" | The "Resort Tax Percentage" field shows 100. |
| 2 | Save and reload | The save completes and the page reloads. |
| 3 | Verify value persists as 100 | The "Resort Tax Percentage" field shows 100 with no error message. |

**Expected**: Value 100 valid (max), persists.
**Data**: `spinResortTaxPercentage=100`
**Automatable**: Yes

---

## TC-LOC-LI-095: Verify Resort Tax Percentage field Boundary - Invalid Below Min (-0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -0.01 in "Resort Tax Percentage" and verify the field is shown as invalid. | The "Resort Tax Percentage" field shows -0.01 as invalid. |
| 2 | Verify "Save" is disabled. | The Save button is disabled. |
| 3 | Verify the error "Number must be greater than or equal to 0" is shown. | The error message "Number must be greater than or equal to 0" is displayed. |

**Expected**: -0.01 invalid. Save disabled.
**Data**: `spinResortTaxPercentage=-0.01` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-096: Verify Resort Tax Percentage field Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -5 in "Resort Tax Percentage" | The "Resort Tax Percentage" field shows -5 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be greater than or equal to 0" | The error message "Number must be greater than or equal to 0" is displayed. |

**Expected**: -5 invalid (far below min). Save disabled.
**Data**: `spinResortTaxPercentage=-5` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-097: Verify Resort Tax Percentage field Boundary - Invalid Above Max (100.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100.01 in "Resort Tax Percentage" | The "Resort Tax Percentage" field shows 100.01 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be less than or equal to 100" | The error message "Number must be less than or equal to 100" is displayed. |

**Expected**: 100.01 invalid (just above max). Save disabled.
**Data**: `spinResortTaxPercentage=100.01` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-098: Verify Resort Tax Percentage rejects a value far above the maximum
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 150.99 in "Resort Tax Percentage" | The "Resort Tax Percentage" field shows 150.99 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be less than or equal to 100" | The error message "Number must be less than or equal to 100" is displayed. |

**Expected**: 150.99 invalid (far above max). Save disabled.
**Data**: `spinResortTaxPercentage=150.99` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-099: Verify Set/Strike Labor Billing field Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Ensure "Set/Strike Labor Billing Goal" field is enabled | The "Set/Strike Labor Billing Goal" field is enabled. |
| 2 | Clear and enter 0 | The "Set/Strike Labor Billing Goal" field shows 0. |
| 3 | Save and reload | The save completes and the page reloads. |
| 4 | Verify value persists as 0 | The "Set/Strike Labor Billing Goal" field shows 0 with no error message. |

**Expected**: Value 0 valid for Set/Strike Labor Billing, persists.
**Data**: `spinSetStrikeLaborBilling=0`
**Automatable**: Yes

---

## TC-LOC-LI-100: Verify Set/Strike Labor Billing field Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100 in "Set/Strike Labor Billing" | The "Set/Strike Labor Billing Goal" field shows 100. |
| 2 | Save and reload | The save completes and the page reloads. |
| 3 | Verify value persists as 100 | The "Set/Strike Labor Billing Goal" field shows 100 with no error message. |

**Expected**: Value 100 valid (max), persists.
**Data**: `spinSetStrikeLaborBilling=100`
**Automatable**: Yes

---

## TC-LOC-LI-101: Verify Set/Strike Labor Billing field Boundary - Invalid Below Min (-0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -0.01 in "Set/Strike Labor Billing" and verify the field is shown as invalid. | The "Set/Strike Labor Billing Goal" field shows -0.01 as invalid. |
| 2 | Verify "Save" is disabled. | The Save button is disabled. |
| 3 | Verify the error "Number must be greater than or equal to 0" is shown. | The error message "Number must be greater than or equal to 0" is displayed. |

**Expected**: -0.01 invalid. Save disabled.
**Data**: `spinSetStrikeLaborBilling=-0.01` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-102: Verify Set/Strike Labor Billing field Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -5 in "Set/Strike Labor Billing" | The "Set/Strike Labor Billing Goal" field shows -5 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be greater than or equal to 0" | The error message "Number must be greater than or equal to 0" is displayed. |

**Expected**: -5 invalid (far below min). Save disabled.
**Data**: `spinSetStrikeLaborBilling=-5` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-103: Verify Set/Strike Labor Billing field Boundary - Invalid Above Max (100.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100.01 in "Set/Strike Labor Billing" | The "Set/Strike Labor Billing Goal" field shows 100.01 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be less than or equal to 100" | The error message "Number must be less than or equal to 100" is displayed. |

**Expected**: 100.01 invalid (just above max). Save disabled.
**Data**: `spinSetStrikeLaborBilling=100.01` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-104: Verify Set/Strike Labor Billing rejects a value far above the maximum
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 150.99 in "Set/Strike Labor Billing" | The "Set/Strike Labor Billing Goal" field shows 150.99 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be less than or equal to 100" | The error message "Number must be less than or equal to 100" is displayed. |

**Expected**: 150.99 invalid (far above max). Save disabled.
**Data**: `spinSetStrikeLaborBilling=150.99` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-105: Verify Threshold field Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Preconditions**: Allow DPCD is unchecked AND Prompt For Approval is checked (Combo D), so Threshold is enabled.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Place office in Combo D so Threshold is enabled | The office is in Combo D and the "Threshold" field is enabled. |
| 2 | Clear and enter 0 in Threshold | The "Threshold" field shows 0. |
| 3 | Save and reload | The save completes and the page reloads. |
| 4 | Verify value persists as 0 | The "Threshold" field shows 0 with no error message. |

**Expected**: Value 0 valid for Threshold (Threshold changes in increments of 0.1, not 0.01).
**Data**: `spinThreshold=0` | `step=0.1`
**Automatable**: Yes

---

## TC-LOC-LI-106: Verify Threshold field Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Preconditions**: Combo D (Threshold enabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100 in Threshold | The "Threshold" field shows 100. |
| 2 | Save and reload | The save completes and the page reloads. |
| 3 | Verify value persists as 100 | The "Threshold" field shows 100 with no error message. |

**Expected**: Value 100 valid (max), persists.
**Data**: `spinThreshold=100`
**Automatable**: Yes

---

## TC-LOC-LI-107: Verify Threshold field Boundary - Invalid Below Min (-0.1)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Preconditions**: Combo D (Threshold enabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -0.1 in "Threshold" (one step below the minimum). | The "Threshold" field shows -0.1 as invalid and the Save button is disabled. |
| 2 | Verify the field is shown as invalid and "Save" is disabled. | The "Threshold" field remains invalid with the Save button disabled. |
| 3 | Verify the error "Number must be greater than or equal to 0" is shown. | The error message "Number must be greater than or equal to 0" is displayed. |

**Expected**: -0.1 invalid. Save disabled.
**Data**: `spinThreshold=-0.1` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-108: Verify Threshold field Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Preconditions**: Combo D (Threshold enabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter -5 in Threshold | The "Threshold" field shows -5 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be greater than or equal to 0" | The error message "Number must be greater than or equal to 0" is displayed. |

**Expected**: -5 invalid (far below min). Save disabled.
**Data**: `spinThreshold=-5` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-109: Verify Threshold field Boundary - Invalid Above Max (100.1)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Preconditions**: Combo D (Threshold enabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 100.1 in Threshold (one step above max) | The "Threshold" field shows 100.1 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be less than or equal to 100" | The error message "Number must be less than or equal to 100" is displayed. |

**Expected**: 100.1 invalid (just above max). Save disabled.
**Data**: `spinThreshold=100.1` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-110: Verify Threshold field Boundary - Invalid Far Above Max (150.9)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Preconditions**: Combo D (Threshold enabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter 150.9 in Threshold | The "Threshold" field shows 150.9 as invalid. |
| 2 | Verify Save disabled | The Save button is disabled. |
| 3 | Verify error: "Number must be less than or equal to 100" | The error message "Number must be less than or equal to 100" is displayed. |

**Expected**: 150.9 invalid (far above max). Save disabled.
**Data**: `spinThreshold=150.9` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-111: Verify Oracle Product Accepts SQL-Injection Characters (Document Live Behavior)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Input Validation (Negative) |

**Preconditions**: Skip Billing unchecked (Oracle fields required). The Oracle fields are cleared to their baseline (0000) before the test.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type semicolons, single quotes, and double quotes into Oracle Product field (e.g., `'; DROP TABLE--`) within the 25-character limit | The "Oracle Product" field accepts the SQL-like input and shows the entry within the 25-character limit. |
| 2 | Read the field value back via interface | The field value is read back and displayed as entered. |
| 3 | Tab off the field | The cursor leaves the field. |
| 4 | Click Save | The save is submitted. |
| 5 | Reload page | The page reloads. |
| 6 | Verify either: (a) the literal characters persisted exactly as typed, OR (b) the input was cleaned up or rejected, and the live behavior is captured exactly | The "Oracle Product" field shows the outcome: the live behavior (accepted as-is, cleaned up, or rejected) is captured and recorded. |

**Expected**: Observe and record the live behavior: whether the value is accepted, cleaned up, or rejected. The TC documents what the system actually does — it does not set any requirement for how the input must be handled. If raw SQL characters are stored as-is, record the finding for follow-up with the application team.
**Data**: `txtOracleProduct=' DROP TABLE-- (or similar)` | `maxLength=25` | `outcome=document live behavior`
**Notes**: Kept as a manual check - this is a security / exploratory verification that requires tester observation each run
**Automatable**: Yes

---

## TC-LOC-LI-112: Verify Oracle Product Accepts Unicode/Emoji Input (Document Live Behavior)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Input Validation (Negative) |

**Preconditions**: Skip Billing unchecked; slate-clear to 0000.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a Unicode mix into Oracle Product field within the 25-character limit (e.g., `日本語🎉Café`) | The "Oracle Product" field accepts the Unicode input and displays the result in the field. |
| 2 | Tab off, Save, reload | The save completes and the page reloads. |
| 3 | Read the persisted value | The persisted value is read from the field. |
| 4 | Document whether the field preserves multibyte chars exactly, normalizes, replaces with `?`, or rejects | The live behavior is documented: whether characters are kept exactly, normalized, replaced, or rejected, and how multi-byte characters count against the 25-character limit. |

**Expected**: Observe and record what happens to the characters: whether they are kept as typed, changed, or rejected, and whether multi-byte characters (such as emoji) each count as one character against the 25-character limit.
**Data**: `txtOracleProduct=日本語🎉Café (or similar Unicode mix)` | `maxLength=25` | `outcome=document live behavior`
**Notes**: Kept as a manual check - this is a security / exploratory verification that requires tester observation each run
**Automatable**: Yes

---

## TC-LOC-LI-113: Verify the Oracle Department field stores special characters as text
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Input Validation (Negative) |

**Preconditions**: Skip Billing unchecked; slate-clear to 900.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type semicolons, single quotes, double quotes into Oracle Department field within the 25-character limit | The "Oracle Department" field accepts the SQL-like input within the 25-character limit. |
| 2 | Tab off, Save, reload | The save completes and the page reloads. |
| 3 | Read the persisted value | The persisted value is read from the field. |
| 4 | Document whether the value is accepted, cleaned up, or rejected | The live behavior is documented: whether the value is accepted as-is, cleaned up, or rejected. |

**Expected**: Observe and record the live behavior. Same security manual review criteria as LI-111.
**Data**: `txtOracleDepartment=' DROP TABLE-- (or similar)` | `maxLength=25` | `outcome=document live behavior`
**Notes**: Kept as a manual check - this is a security / exploratory verification that requires tester observation each run
**Automatable**: Yes

---

## TC-LOC-LI-114: Verify Oracle Department Accepts Unicode/Emoji Input (Document Live Behavior)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Input Validation (Negative) |

**Preconditions**: Skip Billing unchecked; slate-clear to 900.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type Unicode mix into Oracle Department field within the 25-character limit | The "Oracle Department" field accepts the Unicode input and displays the result. |
| 2 | Tab off, Save, reload | The save completes and the page reloads. |
| 3 | Read the persisted value | The persisted value is read from the field. |
| 4 | Record whether the characters are kept as typed, changed, or rejected | The live behavior is documented: whether characters are kept exactly, changed, or rejected, and how they count against the 25-character limit. |

**Expected**: Observe and record what happens to the multi-byte characters: whether they are kept as typed, changed, or rejected, and how they count against the 25-character limit.
**Data**: `txtOracleDepartment=日本語🎉Café (or similar Unicode mix)` | `maxLength=25` | `outcome=document live behavior`
**Notes**: Kept as a manual check - this is a security / exploratory verification that requires tester observation each run
**Automatable**: Yes

---

## Execution Notes

| Metric | Value |
|--------|-------|
| Explored | + (Requirements-aligned + deep field exploration + live re-verification) |
| Total TCs | 114 (77 base + 37 NE-NNN added per SP-DQU-05D: LI-078/012/013 + ARCH-009 cascade gaps, LI-081.LI-110 30 boundary TCs across C&C/ETS/ResortTax/Set-Strike/Threshold fields, LI-111.LI-114 4 Oracle text negatives) |
| Total Fields | 54 interactive (8 inputs + 41 Radix checkboxes + 2 Radix dropdownes + 2 Radix radio groups + 1 disabled date button) per SP-DQU-04 live DOM walk |
| Dependencies | 10 discovered: 6 checkbox--field, 1 dual (AllowDPCD+PromptForApproval), 3 permission-based |
| Conditional Fields | 6 context-dependent (Compass, DisplayTax, Threshold, BillingCycle, etc.) |
| Validation Rules | 8 types: field boundaries, maxLength, required fields, date validation, Legal array rules |
| API Validations | 2 endpoints: checkBillWayChange, BillingCycle change handler |
| Error Messages | 6 types: boundary (2), required (a required-field validation), Legal (SCNAME_IS_REQD, TCNAME_IS_REQD), date (a billing-date validation) |
| Boundary Values | 9 values per field: -5, -0.01, 0, 0.01, 50, 99.99, 100, 100.01, 150.99 |
| Business Rules | Country-based (USA vs intl), Permission-based (canEditLoc) |
| Dropdown Options | Oracle Organization: 8 options (--Select--, 7 business units) |
| Default States | 18 checked, 19 unchecked checkboxes |
| URL | `locations/1604/settings` |
| Requirements Coverage | ~98% (63 TCs vs REQUIREMENTS.md) — left-panel, Ticker Calc, Service Charge group, Enable Job Costing, Enable Proposal now covered |

Test Philosophy Applied:
- One field = Multiple test cases: Critical fields have 8+ TCs each (default, dependency, 6 boundaries)
- Granular & Team-Reviewable: Every TC tests ONE behavior, executable without guessing
- Deep Exploration: Clicked/typed every field, discovered resets, API triggers, validation timing
- Boundary Value Analysis: min, min+, max-, max, below, above for all fields
- Equivalence Partitioning: Valid (0-100) vs Invalid (<0 or >100); Valid text (1-25 chars)
- Decision Tables: Checkbox combinations -- field states
- Disabled Field Mapping: Documented always-disabled + conditionally-disabled fields

Critical Discoveries (Requirements-Aligned):
1. Threshold has DUAL dependency: AllowDPCD=false AND PromptForApproval=true both required (NOT broken, just complex)
2. Billing Way API on ERROR reverts selection (not disables field) - success enables BillingWay Effective Date
3. ETS Percentage defaults UNVERIFIED: Code claims 0.24 (union)/0.23 (non-union), but live test showed value stays 0
4. Oracle fields are REQUIRED when SkipBilling is false (not just disabled)
5. Validation fires on PAGE LOAD, not on save - invalid values persist to database
6. Unchecking dependency checkboxes RESETS field values to 0 (not just disable)
7. Country-based rules: USA (country selection) has 8. Permission states: canEditLoc=false disables 8+ conditional fields
9. Legal array validations: ServiceChargeId and TermsConditionsId required for all Legal items (moved to Legal pipeline)
10. Auto-set behaviors: DisplayTax auto-sets to true when HRIRemitTax OR HRIRemitTax2 enabled

Coverage Analysis:
 COMPLETE: Field dependencies (10), Boundary values (fields), API validations (2), Required fields (5), Permission states (canEditLoc), Country rules (USA/intl), Union-based defaults (ETS), Legal array validations (2), Date validation (BillingWay Effective Date), Dual dependencies (Threshold)

PARTIAL: Tab-specific behaviors (Legal tab may have additional fields beyond array validations), Multi-user concurrency (not testable without 2 sessions)

Future Coverage:
- Other tabs deep-dive (Currency, Pricing, Account/Address, Notes, Shared Setup, Auto Add-On)
- Legal tab UI fields (beyond ServiceChargeId/TermsConditionsId array validation)
- Concurrency (multi-user edit conflicts, optimistic locking)
- Performance (save with 1000+ Legal items, large data sets)
