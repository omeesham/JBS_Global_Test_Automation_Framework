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
- Spinbuttons: 6 (4 have checkbox dependencies, 2 standalone)
- Radio Groups: 2 (Billing Type, Billing Way)
- Textboxes: 2 (Oracle Product, Oracle Department)
- Dropdowns: 2 (Oracle Organization, Billing Cycle)
- Date Pickers: 1 (Effective Date - disabled)

Note on Spinbutton Values: All spinbutton percentage values are stored as raw decimals (0.04 = 0.04%, not 4%). When entering test data, use the literal decimal value (e.g., 0.04 for 4%).

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
- spinThreshold, chkAllowDPCD, chkShowSubRental, chkEnableIDCBilling, multiple spinbuttons (disabled when canEditLoc=false)

Validation Rules Discovered:
- Spinbuttons: min=0, max=100, step=0.01 (Threshold: step=0.1)
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

## TC-LOC-LI-001: Verify Navigate to Office 1604 Local Information Tab
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Navigation |

**Depends_On**: none (baseline-enforcement per LR-019)
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-001)

**Steps**: 1. Navigate to `locations/1604/settings` -- Page loads 2. Verify Basic Information tab selected -- Left/right panels visible 3. Click Local Information tab -- Tab activates 4. Verify Local Information panel loads -- 52 fields visible, Save button disabled
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

**Steps**: 1. Verify "Apply LDW" checkbox is checked 2. Verify "LDW Percentage" spinbutton is enabled. Read its current value as the office baseline rather than asserting a fixed default — the live default for office 1604 is `0.00%`; the prior `0.04%` assertion was an office-specific value left over from previous testing, not a system default.
**Expected**: Apply LDW is checked by default. LDW Percentage spinbutton is enabled. Value is the office's persisted setting (no fixed system default — read-as-baseline, restore-on-cleanup pattern).
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

**Steps**: 1. Read "LDW Percentage" spinbutton value and "Calculate LDW On Net Amount" checkbox state and store originals 2. Uncheck "Apply LDW" checkbox 3. Verify "LDW Percentage" spinbutton is disabled with value reset to 0 4. Verify "Calculate LDW On Net Amount" checkbox is disabled AND unchecked (per requirements parent-children cascade — currently asserts new-site regression) 5. Re-check "Apply LDW" checkbox 6. Verify "LDW Percentage" spinbutton is enabled with value remaining at 0 (NOT restored) 7. Verify "Calculate LDW On Net Amount" checkbox is enabled and respects its prior baseline state
**Expected**: Unchecking Apply LDW disables BOTH the LDW Percentage spinbutton (value resets to 0) AND the Calculate LDW On Net Amount sibling checkbox (per old-site baseline parent-to-children dependency convention — same expectation as Allow Service Charge children +).
Actual on the live site: only the LDW Percentage spinbutton disables; the Calculate LDW On Net Amount sibling checkbox stays checked + enabled when parent is unchecked. Save-cycle persistence of this state has not yet been verified — the assertion documents the correct contract and will fail until the application wires the Calculate-on-Net sibling to the parent.
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

**Steps**: 1. Verify "Apply C&C Fee" checkbox baseline state and read "Calculate C&C On Net Amount" sibling baseline 2. Verify "C&C Percentage" spinbutton state matches parent (enabled when parent checked, disabled when parent unchecked) 3. Toggle "Apply C&C Fee" off (if currently checked, uncheck) 4. Verify "C&C Percentage" spinbutton is disabled with value 0 5. Verify "Calculate C&C On Net Amount" checkbox is disabled AND unchecked (per requirements parent-children cascade — currently asserts new-site regression) 6. Toggle "Apply C&C Fee" back on 7. Verify "C&C Percentage" spinbutton re-enables 8. Verify "Calculate C&C On Net Amount" checkbox is re-enabled and Save button transitions to enabled with the dirty state
**Expected**: Toggling Apply C&C Fee enables/disables BOTH the C&C Percentage spinbutton AND the Calculate C&C On Net Amount sibling checkbox (per old-site baseline parent-to-children dependency convention — same expectation as Allow Service Charge children + Apply LDW children).
Actual on the live site: only the C&C Percentage spinbutton disables when parent is unchecked; the Calculate C&C On Net Amount sibling checkbox stays checked + enabled. Save-cycle persistence of this state has not yet been verified.
**Data**: `chkApplyCablesConsumablesFee=toggle` | `spinCCPercentage=enabled-to-disabled-to-enabled` | `chkCalcCACOnNetAmount=baseline-to-disabled+unchecked-to-enabled+baseline` | `bug=`
**Automatable**: Yes (assertion currently fails on new site; pin against fix)

---

## TC-LOC-LI-005: Verify Allow ETS Checkbox Dependency
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop — pending: chkAllowETS disabled for office 1604)

**Steps**: 1. Verify "Allow ETS" checkbox is unchecked — 2. Verify "ETS Percentage" spinbutton is disabled with value 0 — 3. Check "Allow ETS" checkbox — 4. Verify "ETS Percentage" spinbutton is enabled — 5. Verify "ETS Percentage" value is 23.00% (non-union office default — `0.23` raw decimal) — 6. Uncheck "Allow ETS" checkbox — 7. Verify "ETS Percentage" spinbutton is disabled with value reset to 0
**Expected**: Checking Allow ETS enables spinbutton and sets default value to 23.00% (raw `0.23`) for non-union offices, 24.00% (raw `0.24`) for union offices per requirements. Unchecking resets to 0.
**Data**: `chkAllowETS=unchecked to checked` | `spinETSPercentage=disabled,0 to enabled,23.00%` | `office=1604` | `union=false`
**Automatable**: Yes

---

## TC-LOC-LI-006: Verify Allow Resort Tax Checkbox Dependency
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop — pending: chkAllowResortTax becomes disabled after save for office 1604)

**Steps**: 1. Verify "Allow Resort Tax" checkbox is unchecked 2. Verify "Resort Tax Percentage" spinbutton is disabled with value 0 3. Check "Allow Resort Tax" checkbox 4. Verify "Resort Tax Percentage" spinbutton is enabled with value 0
**Expected**: Checking Allow Resort Tax enables Resort Tax Percentage spinbutton
**Data**: `chkAllowResortTax=unchecked to checked` | `spinResortTaxPercentage=disabled to enabled`
**Automatable**: Yes

---

## TC-LOC-LI-007: Verify Threshold Disabled When AllowDPCD Checked (Dual Dependency)
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-007)

**Steps**: 1. Verify "Allow DPCD" checkbox is checked by default 2. Read current state of "Prompt For Approval" checkbox and treat as setup baseline (live default on office 1604 is *checked*; if checked, uncheck it before continuing so the dual-condition transition can be exercised) 3. Verify "Threshold" spinbutton is disabled with value 0 4. Check "Prompt For Approval" checkbox 5. Verify "Threshold" spinbutton is STILL disabled (because Allow DPCD is checked) 6. Uncheck "Allow DPCD" checkbox 7. Verify "Prompt For Approval" checkbox is still checked 8. Verify "Threshold" spinbutton is NOW ENABLED (Allow DPCD is false AND Prompt For Approval is true)
**Expected**: Threshold has DUAL dependency: disabled when `AllowDPCD=true OR PromptForApproval=false OR canEditLoc=false`. Enabling requires AllowDPCD=false AND PromptForApproval=true.
**Data**: `AllowDPCD=true means Threshold=disabled` | `AllowDPCD=false plus PromptForApproval=true means Threshold=enabled` | `dualDependency=true` | `liveDefault2026-04-27=AllowDPCD checked + PromptForApproval checked + Threshold disabled (single-condition AllowDPCD=true is sufficient to disable)`
**Automatable**: Yes

---

## TC-LOC-LI-007A: Verify Threshold Resets to 0 When Dependencies Break
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency |

**Steps**: 1. Uncheck "Allow DPCD" checkbox and verify "Threshold" spinbutton is enabled 2. Check "Prompt For Approval" checkbox and verify "Threshold" spinbutton is still enabled 3. Set "Threshold" spinbutton to 50.5 4. Check "Allow DPCD" checkbox and verify "Threshold" spinbutton is disabled with value reset to 0 5. Uncheck "Allow DPCD" checkbox and verify "Threshold" spinbutton is enabled with value still 0 (not restored) 6. Set "Threshold" spinbutton to 25.0 7. Uncheck "Prompt For Approval" checkbox and verify "Threshold" spinbutton is disabled with value reset to 0
**Expected**: Threshold resets to 0 when AllowDPCD becomes true OR PromptForApproval becomes false
**Data**: `resetTriggers=AllowDPCD=true OR PromptForApproval=false` | `resetValue=0`
**Automatable**: Yes

---

## TC-LOC-LI-008: Verify Skip Billing Disables Oracle Fields
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency |

**Depends_On**: TC-LOC-LI-001
**Preconditions** (slate-clear): Office 1604 may carry leaked values in Oracle fields from prior testing. Reset Oracle Product to `0000`, Oracle Department to `900`, Oracle Organization to `Encore US BU` and Save before starting this TC. Read-and-restore in `finally` block.

**Steps**: 1. Verify "Oracle Product" textbox is enabled with value `0000` 2. Verify "Oracle Department" textbox is enabled with value `900` 3. Verify "Oracle Organization" dropdown is enabled with selection `Encore US BU` 4. Check "Skip Billing" checkbox 5. Verify "Oracle Product" textbox is disabled 6. Verify "Oracle Department" textbox is disabled 7. Verify "Oracle Organization" dropdown is disabled 8. Uncheck "Skip Billing" checkbox 9. Verify all 3 fields are re-enabled with original values
**Expected**: Skip Billing disables Oracle Product, Oracle Department, and Oracle Organization fields. With SkipBilling is unchecked, Oracle Organization is enabled and selectable on a healthy backend.
**Data**: `chkSkipBilling=unchecked to checked` | `txtOracleProduct=enabled to disabled` | `txtOracleDepartment=enabled to disabled` | `drpOracleOrganization=enabled to disabled` | `slateClearRequired=true`
**Automatable**: Yes

---

## TC-LOC-LI-008A: Verify Oracle Fields Required When Skip Billing Disabled
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Required Field Validation |

**Steps**: 1. Verify "Skip Billing" checkbox is unchecked (the "required" condition) 2. Clear "Oracle Product" textbox 3. Verify "Oracle Product" field shows the invalid-state indicator after clear (the empty-state error indicator is rendered on the input via aria-invalid=true) 4. Verify "Save" button is DISABLED while the form is invalid (form-validity wiring restored PRIMARY_SYMPTOM_RESOLVED) 5. Clear "Oracle Department" textbox 6. Set "Oracle Organization" dropdown to "--Select--" (ID < 1) 7. Re-verify "Save" button stays disabled 8. Restore each field to a valid value 9. Verify Save re-enables after all 3 are valid 10. Click Save and confirm successful save
**Expected**: Oracle Product, Oracle Department, and Oracle Organization are REQUIRED when Skip Billing is unchecked. When the form is invalid, the Save button is disabled (form-validity wiring) so the user cannot fire a silent save. The empty required fields render an accessible invalid-state indicator (aria-invalid=true) so screen readers see the constraint sighted users do. Once all 3 fields hold valid values, Save re-enables and clicking it submits the change successfully.
**Data**: `chkSkipBilling=unchecked` | `txtOracleProduct=[required]` | `txtOracleDepartment=[required]` | `drpOracleOrganization=[required]` | `expectedSaveButtonState=disabled when invalid` | `expectedAriaInvalid=true on empty required fields`
**Automatable**: Yes — assert form-validity-to-save-disabled wiring (matches old-site baseline per `OSB-ACCESS-VERIFY.md` §4).

---

## TC-LOC-LI-009: Verify LDW Percentage Spinbutton Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop)

**Steps**: 1. Ensure "Apply LDW" checkbox is checked and "LDW Percentage" spinbutton is enabled 2. Clear field and enter 0 — Field accepts value 3. Click Save button — Save completes 4. Reload page and navigate back to Local Information 5. Verify "LDW Percentage" spinbutton has value 0 with no error message
**Expected**: Value 0 is valid, persists, no validation error
**Data**: `spinLDWPercentage=0` | `min=0` | `max=100` | `step=0.01`
**Automatable**: Yes

---

## TC-LOC-LI-010: Verify LDW Percentage Spinbutton Boundary - Valid Min+ (0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop)

**Steps**: 1. Enter 0.01 in "LDW Percentage" spinbutton — Field accepts value 2. Click Save button and reload page 3. Verify "LDW Percentage" spinbutton has value 0.01 with no error message
**Expected**: Value 0.01 (min + step) is valid, persists, no validation error
**Data**: `spinLDWPercentage=0.01`
**Automatable**: Yes

---

## TC-LOC-LI-011: Verify LDW Percentage Spinbutton Boundary - Valid Max- (99.99)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop)

**Steps**: 1. Enter 99.99 in "LDW Percentage" spinbutton — Field accepts value 2. Click Save button and reload page 3. Verify "LDW Percentage" spinbutton has value 99.99 with no error message
**Expected**: Value 99.99 (max - step) is valid, persists, no validation error
**Data**: `spinLDWPercentage=99.99`
**Automatable**: Yes

---

## TC-LOC-LI-012: Verify LDW Percentage Spinbutton Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop)

**Steps**: 1. Enter 100 in "LDW Percentage" spinbutton — Field accepts value 2. Click Save button and reload page 3. Verify "LDW Percentage" spinbutton has value 100 with no error message
**Expected**: Value 100 (max) is valid, persists, no validation error
**Data**: `spinLDWPercentage=100`
**Automatable**: Yes

---

## TC-LOC-LI-013: Verify LDW Percentage Spinbutton Boundary - Invalid Below Min (-0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop — silent-invalid cat-B: save disabled, no inline error)

**Steps**: 1. Enter "-0.01" in "LDW Percentage" spinbutton — Field accepts value 2. Click Save button — Save completes 3. Reload page and navigate to Local Information 4. Verify "LDW Percentage" spinbutton has value "-0.01" 5. Verify error message shows "Number must be greater than or equal to 0" 6. Cleanup: Restore "LDW Percentage" spinbutton to valid value (e.g., 0.04) and save to prevent downstream test corruption
**Expected**: Invalid value saves but displays validation error on page load
**Data**: `spinLDWPercentage=-0.01` | `errorMessage=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-014: Verify LDW Percentage Spinbutton Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop — inline error detected on blur)

**Steps**: 1. Enter "-5" in "LDW Percentage" spinbutton — Field accepts value 2. Click Save button and reload page 3. Verify "LDW Percentage" spinbutton has value "-5" with error message displayed 4. Cleanup: Restore to valid value and save
**Expected**: Invalid negative value saves, shows error on reload
**Data**: `spinLDWPercentage=-5`
**Automatable**: Yes

---

## TC-LOC-LI-015: Verify LDW Percentage Spinbutton Boundary - Invalid Above Max (100.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop — inline error detected on blur)

**Steps**: 1. Ensure "Apply LDW" checkbox is checked 2. Enter "100.01" in "LDW Percentage" field 3. Click Save 4. Reload page 5. Verify "LDW Percentage" shows "100.01" 6. Verify error message: "Number must be less than or equal to 100" 7. Cleanup: Enter valid value (0.04) and Save
**Expected**: Invalid value above max saves but displays validation error on reload.
**Data**: `LDWPercentage=100.01`

Notes: Always restore to valid value.
**Automatable**: Yes

---

## TC-LOC-LI-016: Verify LDW Percentage Spinbutton Boundary - Invalid Far Above Max (150.99)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary Value |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (LDW_BOUNDARIES loop — inline error detected on blur)

**Steps**: 1. Enter "150.99" in "LDW Percentage" spinbutton — Field accepts value 2. Click Save button and reload page 3. Verify "LDW Percentage" spinbutton has value "150.99" with error message displayed 4. Cleanup: Restore to valid value (e.g., 0.04) and save
**Expected**: Invalid value far above max saves, shows error on reload
**Data**: `spinLDWPercentage=150.99`
**Automatable**: Yes

---

## TC-LOC-LI-017: Verify All Spinbuttons Share Same Boundaries (0-100, step 0.01)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Equivalence Partitioning |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Enable "C&C Percentage" spinbutton and enter "50.50" — Field accepts value 2. Enable "ETS Percentage" spinbutton and enter "75.25" — Field accepts value 3. Enable "Resort Tax Percentage" spinbutton and enter "99.99" — Field accepts value 4. Enter "0.33" in "Labor Billing Goal" spinbutton — Field accepts value 5. Click Save button and reload page 6. Verify all values persisted with no errors
**Expected**: All 5 percentage spinbuttons (LDW, C&C, ETS, Resort Tax, Labor Goal) have same constraints: min=0, max=100, step=0.01
**Data**: `min=0` | `max=100` | `step=0.01` | `applicableTo=5 spinbuttons`
**Automatable**: Yes

---

## TC-LOC-LI-018: Verify Threshold Spinbutton Has Coarser Step (0.1)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field Attribute |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Uncheck "Allow DPCD" checkbox and check "Prompt For Approval" checkbox — "Threshold" spinbutton becomes enabled 2. Inspect "Threshold" spinbutton attributes — min=0, max=100, step=0.1 (coarser than other spinbuttons at 0.01) 3. Check "Allow DPCD" checkbox — "Threshold" spinbutton disabled again
**Expected**: Threshold spinbutton has step=0.1 (coarser than 0.01), conditionally disabled based on AllowDPCD and PromptForApproval states (see TC-LOC-LI-007)
**Data**: `spinThreshold.step=0.1` | `conditionallyDisabled=AllowDPCD OR !PromptForApproval OR !canEditLoc`
**Automatable**: Yes

---

## TC-LOC-LI-019: Verify Oracle Product Max Length Truncation (25 chars)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Max Length |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TEXT_FIELD_CONSTRAINTS loop)

**Steps**: 1. Clear "Oracle Product" textbox 2. Paste 100-character string "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789." — Field accepts value 3. Read field value — Only 25 characters stored 4. Verify maxLength attribute — maxLength=25 5. Click Save button and reload page 6. Verify "Oracle Product" textbox has value truncated to first 25 chars
**Expected**: Oracle Product enforces maxLength=25 client-side, truncates input, persists truncated value
**Data**: `txtOracleProduct.maxLength=25` | `input=100chars` | `stored=25chars`
**Automatable**: Yes

---

## TC-LOC-LI-020: Verify Oracle Department Max Length Truncation (25 chars)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Max Length |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TEXT_FIELD_CONSTRAINTS loop)

**Steps**: 1. Clear "Oracle Department" textbox 2. Paste 100-character string — Field accepts value 3. Read field value — Only 25 characters stored 4. Verify maxLength attribute — maxLength=25 5. Click Save button and reload page 6. Verify value persisted at 25 chars
**Expected**: Oracle Department enforces maxLength=25 client-side, truncates input
**Data**: `txtOracleDepartment.maxLength=25`
**Automatable**: Yes

---

## TC-LOC-LI-021: Verify Oracle Product Valid Input (1-25 chars)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Equivalence Partitioning |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-021/029)

**Steps**: 1. Enter "PROD001" (7 chars) in "Oracle Product" textbox — Field accepts value 2. Click Save button and reload page 3. Verify value persisted as "PROD001" with no error 4. Enter "ABC" (3 chars) — Field accepts and persists value 5. Enter "X" (1 char) — Field accepts and persists value
**Expected**: Valid input range 1-25 characters accepts alphanumeric values
**Data**: `txtOracleProduct=1-25 chars alphanumeric`
**Automatable**: Yes

---

## TC-LOC-LI-022: Verify Oracle Organization Dropdown Options
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Dropdown Options |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Click "Oracle Organization" dropdown — Dropdown opens 2. Count options — 8 total 3. Verify option list includes "--Select--", "Encore US BU", "Encore CA BU", "Encore BH BU", "Encore Bahamas", "Encore MX BU", "PSR Mexico", "Encore Mexico" 4. Verify current selection is "Encore US BU" with checkmark icon visible
**Expected**: 8 organization options available, default is "Encore US BU"
**Data**: `drpOracleOrganization.options=8` | `default=Encore US BU`
**Automatable**: Yes

---

## TC-LOC-LI-023: Verify Oracle Organization Selection Change Persistence
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Dropdown Selection |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Select "Encore CA BU" from "Oracle Organization" dropdown — Selection changes 2. Click Save button and reload page 3. Verify "Oracle Organization" dropdown shows "Encore CA BU" selected 4. Select "Encore Bahamas" — Selection changes 5. Click Save button and reload page 6. Verify "Encore Bahamas" persisted
**Expected**: Dropdown selection changes persist after save/reload
**Data**: `drpOracleOrganization=from Encore US BU to Encore CA BU to Encore Bahamas`
**Automatable**: Yes

---

## TC-LOC-LI-024: Verify Billing Way Change API Validation - Error Path
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | API Validation |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Billing Way" radio button shows "Event" selected 2. Click "Daily" option 3. Wait for API validation 4. Verify error dialog: "There are orders that have not been billed in the current billing period. Those must be invoiced before the change can be made." 5. Click "Ok" 6. Verify "Billing Way" reverted to "Event"
**Expected**: Changing Billing Way triggers API validation. If unbilled orders exist, selection reverts.
**Data**: `BillingWay=Event`

Notes: API: /api/location/check-unbilled. Error key: a billing constraint
**Automatable**: Yes

---

## TC-LOC-LI-024A: Verify Billing Way Change API Validation - Success Path
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | API Validation |

Preconditions (Human):
No unbilled orders exist for office (billing complete).

**Steps**: 1. Verify "Billing Way" shows "Event" selected 2. Verify "Effective Date" button is disabled 3. Click "Daily" option 4. Wait for API validation success 5. Verify "Effective Date" button is now enabled 6. Verify "Effective Date" shows current date 7. Verify "Billing Way" shows "Daily"
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

**Steps**: 1. Verify "Billing Type" radio button shows "Master" selected 2. Verify "Direct" option is available 3. Click "Direct" option 4. Click Save, reload 5. Verify "Billing Type" shows "Direct"
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

**Steps**: 1. Verify "Suppress Day/Rate Discount" checkbox is disabled (always) 2. Verify "Compass Integration" checkbox is checked and disabled (when isNew=false, see TC-LOC-LI-057) 3. Verify "Display Tax" checkbox is checked and disabled (when Company Remit Tax OR Company Remit Tax 2 is true, see TC-LOC-LI-053/054) 4. Make changes to other fields and click Save button 5. Verify all 3 checkboxes are still disabled with states unchanged
**Expected**: Suppress Day/Rate Discount always disabled. Compass Integration and Display Tax conditionally disabled based on context.
**Data**: `chkSuppressDayRateDiscount=always disabled` | `chkCompassIntegration=disabled when !isNew` | `chkDisplayTax=disabled when HRIRemitTax OR HRIRemitTax2`
**Automatable**: Yes

---

## TC-LOC-LI-027: Verify Effective Date and Billing Cycle Initial State
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Effective Date" button is disabled and shows "May 11th, 2007" 2. Verify "Billing Cycle" dropdown is disabled and shows "Weekly" 3. Make other field changes and click Save button 4. Verify both fields are still disabled with values unchanged
**Expected**: Effective Date button disabled by default (enabled after Billing Way API success, see TC-LOC-LI-024A). Billing Cycle disabled initially (can become disabled via API when localBillingRan is true, see TC-LOC-LI-048).
**Data**: `btnEffectiveDate=disabled by default` | `drpBillingCycle=disabled initially` | `note=both are conditionally disabled, not permanently`
Notes: Effective Date (BillingWay Effective Date) is a DIFFERENT field from Live Date in the left panel. Live Date = May 8th, 2007; Effective Date = May 11th, 2007. Both are correct for office 1604.
**Automatable**: Yes

---

## TC-LOC-LI-028: Verify Service Charge Checkbox Default State
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Service Charge" checkbox is checked 2. Uncheck "Service Charge" checkbox — Checkbox unchecks, Save button enabled 3. Click Save button and reload page 4. Verify "Service Charge" checkbox is unchecked (persisted) 5. Re-check checkbox, Save, and reload 6. Verify checkbox is checked again
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

**Steps**: 1. Toggle "Calculate LDW on Net Amount" checkbox — No other field changes 2. Toggle "Show Service Charge As Administrative Fee" checkbox — No other field changes 3. Toggle "Calculate Service Charge On Net Amount" checkbox — No other field changes 4. Toggle "Warehouse Billing" checkbox — No other field changes 5. Click Save button and reload page 6. Verify all 4 checkboxes have new states persisted
**Expected**: Standalone checkboxes (no dependencies) toggle independently, persist state
**Data**: `independentCheckboxes=30+ fields`
**Automatable**: Yes

---

## TC-LOC-LI-030: Verify Multiple Checkbox Dependencies Simultaneously
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Decision Table |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Enable all dependency checkboxes: "Apply C&C Fee", "Allow ETS", "Allow Resort Tax" — 3 spinbuttons enabled 2. Set "C&C Percentage" spinbutton to 10, "ETS Percentage" spinbutton to 5, "Resort Tax Percentage" spinbutton to 3 3. Click Save button and reload page 4. Verify all 3 checkboxes are checked 5. Verify all 3 spinbuttons are enabled with values persisted 6. Uncheck all 3 checkboxes — All 3 spinbuttons disabled with values reset to 0 7. Click Save button and reload page 8. Verify spinbuttons are disabled with values at 0
**Expected**: Multiple checkbox--spinbutton dependencies work simultaneously without interference
**Data**: `multiDependency=3 checkboxes + 3 spinbuttons`
**Automatable**: Yes

---

## TC-LOC-LI-031: Verify Checkbox State Combinations (Decision Table - Sample)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Decision Table |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Test combination: "Apply LDW" checkbox is checked, "Apply C&C Fee" checkbox is unchecked — "LDW Percentage" spinbutton is enabled, "C&C Percentage" spinbutton is disabled 2. Test combination: "Apply LDW" checkbox is unchecked, "Apply C&C Fee" checkbox is checked — "LDW Percentage" spinbutton is disabled (reset), "C&C Percentage" spinbutton is enabled 3. Test combination: Both checked — Both enabled 4. Test combination: Both unchecked — Both disabled 5. Save and reload after each test — States persist correctly
**Expected**: All 4 combinations (2^2) of 2 dependent checkboxes produce correct spinbutton states
**Data**: `combinations=4` | `chk1×chk2=spin1×spin2`
**Automatable**: Yes

---

## TC-LOC-LI-032: Verify Save Button Enable/Disable State
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Button State |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (TC-LOC-LI-032)

**Steps**: 1. Load page and verify Save button is disabled 2. Toggle any checkbox — Save button enables 3. Revert checkbox — Save button may stay enabled 4. Change spinbutton value — Save button enabled 5. Click Save button — Save executes successfully; Save button returns to disabled (no pending changes remain)
**Expected**: Save button enables when any field changes; returns to disabled after a successful save when no unsaved changes remain
**Data**: `btnSave=disabled--modified--enabled--save--disabled`
**Automatable**: Yes

---

## TC-LOC-LI-033: Verify Partial Field Modification Isolation
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Data Isolation |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Capture all 52 field values as baseline 2. Modify 4 fields: uncheck "Apply LDW", change "Set Strike Labor Billing Goal" from 0.33 to 0.50, change "Oracle Product" from 0000 to TEST, change "Oracle Organization" from Encore US BU to Encore CA BU 3. Leave 48 fields untouched 4. Click Save, reload 5. Verify 4 modified fields match new values 6. Verify 48 untouched fields match baseline
**Expected**: Modifying subset of fields does NOT affect untouched fields.
**Data**: `modified=4` | `untouched=48` | `total=52`
**Automatable**: Yes

---

## TC-LOC-LI-034: Verify Spinbutton Increment/Decrement Buttons
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Button Control |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Set "LDW Percentage" spinbutton to 5.50 2. Click Increment button — Value is 5.51 (step +0.01) 3. Click Increment button 10 times — Value is 5.61 4. Click Decrement button — Value is 5.60 5. Verify buttons respect min/max limits — At 100, Increment disabled; at 0, Decrement disabled
**Expected**: Increment/Decrement buttons change value by step amount (0.01), respect boundaries
**Data**: `step=0.01` | `Increment=+0.01` | `Decrement=-0.01`
**Automatable**: Yes

---

## TC-LOC-LI-035: Verify Save is disabled when a numeric field holds an invalid value
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Validation Timing |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Enter invalid value -10 in "LDW Percentage" spinbutton — Field shows invalid-state indicator (aria-invalid=true, error message "Number must be greater than or equal to 0") 2. Verify "Save" button is DISABLED while the form is invalid (user physically cannot fire a silent save) 3. Restore "LDW Percentage" to a valid value (e.g., 0 or 0.5) — Field clears the invalid-state indicator 4. Verify "Save" button transitions to enabled (form is now valid AND dirty) 5. Click Save — Save completes; reload to confirm the valid value persisted
**Expected**: Save button stays disabled when LDW Percentage = -10 (out of range; min=0). User must restore a valid value before Save enables. Form-validity behavior (Save disabled while a field holds an invalid value) is confirmed working on the live site; the previously reported issue is resolved.
**Data**: `spinLDWPercentage=-10 invalid` | `expectedSaveButtonState=disabled while invalid` | `expectedAriaInvalid=true on -10` | `validValue=0 or 0.5`
**Automatable**: Yes

---

## TC-LOC-LI-036: Verify Multiple Invalid Values Show Multiple Errors
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Multiple Validations |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Set "LDW Percentage" spinbutton to -5, "C&C Percentage" spinbutton to 150, "ETS Percentage" spinbutton to -1 — 3 invalid values 2. Click Save button and reload page 3. Verify "LDW Percentage" spinbutton shows error: "Number must be greater than or equal to 0" 4. Verify "C&C Percentage" spinbutton shows error: "Number must be less than or equal to 100" 5. Verify "ETS Percentage" spinbutton shows error: "Number must be greater than or equal to 0"
**Expected**: Multiple invalid fields show separate error messages simultaneously. Verbatim error texts (per live interface): LDW Percentage = "Number must be greater than or equal to 0"; C&C Percentage = "Number must be less than or equal to 100"; ETS Percentage = "Number must be greater than or equal to 0". Each error renders inline with its associated spinbutton (aria-invalid=true on each input); errors do not collapse to a single summary.
**Data**: `invalidFields=3` | `errorMessages=3 distinct`
**Automatable**: Yes

---

## TC-LOC-LI-037: Verify Correcting Invalid Value Removes Error
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Error Recovery |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Set "LDW Percentage" spinbutton to 150 — Invalid value 2. Save and reload page 3. Verify error displayed shows "Number must be less than or equal to 100" 4. Change "LDW Percentage" spinbutton to 50 — Valid value 5. Click Save button and reload page 6. Verify error removed — No error message, value is 50
**Expected**: Correcting invalid value to valid range removes error message on next reload
**Data**: `invalidValue=from 150 to validValue=50 to errorRemoved`
**Automatable**: Yes

---

## TC-LOC-LI-038: Verify Default Checked Checkboxes (Batch 1)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Ticker Calc" checkbox is checked 2. Verify "Enable Set/Strike Labor Minutes" checkbox is checked 3. Verify "Apply Set/Strike Labor Minutes" checkbox is checked 4. Verify "Company Remit Tax" checkbox is checked 5. Verify "Comm Receiver" checkbox is checked
**Expected**: Multiple checkboxes default to checked state
**Data**: `defaultChecked=Ticker Calc, Enable Set/Strike, Apply Set/Strike, Company Remit Tax, Comm Receiver`
**Automatable**: Yes

---

## TC-LOC-LI-039: Verify Default Checked Checkboxes (Batch 2)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Intercompany" checkbox is checked 2. Verify "Enable Job Costing" checkbox is checked 3. Verify "Enable Discount Guidance" checkbox is checked 4. Verify "Enable Proposal" checkbox is checked 5. Verify "Allow DPCD" checkbox is checked
**Expected**: Additional checkboxes default to checked state
**Data**: `defaultChecked=Intercompany, Job Costing, Discount Guidance, Proposal, DPCD`
**Automatable**: Yes

---

## TC-LOC-LI-040: Verify Default Checked Checkboxes (Batch 3)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Credit Memo Approval Required" checkbox is checked 2. Verify "Enable Discount Reason" checkbox is checked 3. Verify "Use eSignature" checkbox is checked 4. Verify "Service Charge" checkbox is checked
**Expected**: Final batch of checkboxes default to checked state
**Data**: `defaultChecked=Credit Memo Approval, Discount Reason, eSignature, Service Charge`
**Automatable**: Yes

---

## TC-LOC-LI-041: Verify Default Unchecked Checkboxes (User-Enabled)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Calculate LDW on Net Amount" checkbox is unchecked 2. Verify "Apply C&C Fee" checkbox is unchecked 3. Verify "Calculate C&C On Net Amount" checkbox is unchecked 4. Verify "Allow ETS" checkbox is unchecked 5. Verify "Allow Resort Tax" checkbox is unchecked 6. Verify "Show Service Charge As Administrative Fee" checkbox is unchecked 7. Verify "Calculate Service Charge On Net Amount" checkbox is unchecked
**Expected**: User-configurable checkboxes default to unchecked
**Data**: `defaultUnchecked=LDW Net Amount, C&C Fee, C&C Net Amount, ETS, Resort Tax, etc.`
**Automatable**: Yes

---

## TC-LOC-LI-042: Verify Default Unchecked Checkboxes (Optional Features)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Internet Asset Reservation" checkbox is unchecked 2. Verify "Exclude Implied Discount" checkbox is unchecked 3. Verify "Prompt For Approval" checkbox is unchecked 4. Verify "Enable Product Group" checkbox is unchecked 5. Verify "Allow Production Quote" checkbox is unchecked 6. Verify "Warehouse Billing" checkbox is unchecked
**Expected**: Optional feature checkboxes default to unchecked
**Data**: `defaultUnchecked=Internet Asset, Implied Discount, Prompt Approval, Product Group, Production Quote, Warehouse Billing`
**Automatable**: Yes

---

## TC-LOC-LI-043: Verify Default Unchecked Checkboxes (Billing Features)
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Enable IDC Billing" checkbox is unchecked 2. Verify "Skip Billing" checkbox is unchecked 3. Verify "Separate Master Bill Commission Invoice" checkbox is unchecked 4. Verify "Show SubRental" checkbox is unchecked 5. Verify "Inventory Only" checkbox is unchecked 6. Verify "Calculate Commission Tax" checkbox is unchecked 7. Verify "Can Create External Customer Link" checkbox is unchecked 8. Verify "Offsite Event Location" checkbox is unchecked 9. Verify "Exhibit Show Rate" checkbox is unchecked
**Expected**: Billing-related optional checkboxes default to unchecked
**Data**: `defaultUnchecked=IDC Billing, Skip Billing, Master Bill Commission, SubRental, Inventory Only, etc.`
**Automatable**: Yes

---

## TC-LOC-LI-044: Verify All Field State Persistence After Full Random Modification
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Comprehensive Test |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Randomly modify 25+ of 51 fields (mix of checkboxes, spinbuttons, textboxes, dropdowns, radios) 2. Store all modifications 3. Click Save, reload 4. Verify ALL 51 fields -- 25+ modified match new values, 25+ unmodified match baseline
**Expected**: Large-scale random modifications persist correctly, no field corruption or side effects
**Data**: `randomlyModified=25+` | `total=51`
**Automatable**: Yes

---

## TC-LOC-LI-045: Verify Field Change Detection Across All Field Types
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Change Detection |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts

**Steps**: 1. Change 1 checkbox -- Save enables 2. Change 1 spinbutton -- Save enables 3. Change 1 textbox -- Save enables 4. Change 1 dropdown -- Save enables 5. Change 1 radio -- Save enables 6. Verify each triggers dirty state -- Save button activated
**Expected**: All 5 field types (checkbox, spinbutton, textbox, dropdown, radio) trigger change detection
**Data**: `fieldTypes=5` | `allTriggerChange=true`
**Automatable**: Yes

---

## TC-LOC-LI-046: Verify BillingWay Effective Date Past Date Validation
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Date Validation |

**Depends_On**: TC-LOC-LI-001
Preconditions (Human):
Billing Way change succeeded (see TC-LOC-LI-024A). "Effective Date" button is enabled.

**Steps**: 1. Verify "Effective Date" shows current date 2. Click date picker 3. Select yesterday's date 4. Click Save 5. Verify error: "Date cannot be in the past" 6. Select today or future date 7. Click Save and verify success
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
**Steps**: 1. Verify "Billing Cycle" dropdown has valid selection 2. Verify no exclamation icon visible 3. Clear selection to empty/default (if editable) 4. Verify exclamation icon appears 5. Hover question mark icon and verify tooltip appears
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

**Steps**: 1. Navigate to Local Information for office that has run billing 2. Verify "Billing Cycle" dropdown is disabled 3. Verify alert/tooltip surfaces the verbatim message: `Corporate billing for the local batch must be completed before the billing cycle can be changed.` (sourced from the `billingCycleMsg` key in the bundled `useLocationMetadata` localization map; rendered when `localBillingRan === true`) 4. Make other changes, Save 5. Verify "Billing Cycle" remains disabled
**Expected**: Billing Cycle disabled if billing has already run. The user-visible alert/tooltip text is the verbatim string: `Corporate billing for the local batch must be completed before the billing cycle can be changed.`
**Data**: `BillingCycle=disabled` | `expectedAlertText="Corporate billing for the local batch must be completed before the billing cycle can be changed."` | `localBillingRan is true`

Notes: API: BillingCycle change handler. localBillingRan is true when data > 0. Sibling localization key `billingDesc` ("There are orders that have not been billed in the current billing period. Those must be invoiced before the change can be made.") is a DIFFERENT message (different trigger) and MUST NOT be conflated with `billingCycleMsg`.
**Automatable**: Yes

---

> **[TC-LOC-LI-049 and TC-LOC-LI-050 removed]** These IDs were reserved and subsequently removed before completion. They are excluded from the total TC count.

## TC-LOC-LI-051: Verify AllowDPCD Disabled When IsCommReceiver False
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop)

**Steps**: 1. Verify "Comm Receiver" checkbox is checked (default) 2. Verify "Allow DPCD" checkbox is enabled and checked 3. Uncheck "Comm Receiver" checkbox 4. Verify "Allow DPCD" checkbox is DISABLED 5. Verify "Allow DPCD" checkbox value is reset to false (unchecked) 6. Re-check "Comm Receiver" checkbox 7. Verify "Allow DPCD" checkbox is enabled again (but remains unchecked, not auto-restored)
**Expected**: AllowDPCD disabled when IsCommReceiver=false, resets to false
**Data**: `IsCommReceiver=false means AllowDPCD=disabled,false` | `resetTrigger=IsCommReceiver=false`
**Automatable**: Yes

---

## TC-LOC-LI-052: Verify ShowSubRental Disabled When IsCommReceiver False
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop)

**Steps**: 1. Verify "Comm Receiver" checkbox is checked 2. Verify "Show SubRental" checkbox is enabled 3. Check "Show SubRental" checkbox 4. Uncheck "Comm Receiver" checkbox 5. Verify "Show SubRental" checkbox is DISABLED 6. Verify "Show SubRental" checkbox value resets to false (same behavior as Allow DPCD) 7. Re-check "Comm Receiver" checkbox 8. Verify "Show SubRental" checkbox is enabled but remains unchecked (not restored)
**Expected**: ShowSubRental disabled when IsCommReceiver=false. Value resets to false (same as AllowDPCD).
**Data**: `IsCommReceiver=false means ShowSubRental=disabled,false` | `resetBehavior=resets to false`
**Automatable**: Yes

---

## TC-LOC-LI-053: Verify DisplayTax Auto-Set When HRIRemitTax Enabled
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Auto-Set Behavior |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop)

**Steps**: 1. Verify "Display Tax" checkbox is checked and disabled 2. Verify "Company Remit Tax" checkbox is checked (default) 3. Uncheck "Company Remit Tax" checkbox 4. Verify "Display Tax" checkbox becomes enabled if Company Remit Tax 2 is also false, or remains disabled if Company Remit Tax 2 is true 5. Re-check "Company Remit Tax" checkbox 6. Verify "Display Tax" checkbox is auto-set to true (checked) and DISABLED
**Expected**: DisplayTax automatically set to true and disabled when HRIRemitTax=true
**Data**: `HRIRemitTax=true means DisplayTax=true,disabled` | `autoSet=true`
**Automatable**: Yes

---

## TC-LOC-LI-054: Verify DisplayTax Auto-Set When HRIRemitTax2 Enabled
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Auto-Set Behavior |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Uncheck "Company Remit Tax" checkbox 2. Verify "Display Tax" checkbox state (enabled when second Company Remit Tax is false, or disabled when second Company Remit Tax is true) 3. Check the second "Company Remit Tax" checkbox (skip this step for countries where second checkbox is not present) 4. Verify "Display Tax" is auto-checked and disabled 5. Uncheck both remit tax checkboxes 6. Verify "Display Tax" is enabled and toggleable
**Expected**: Display Tax auto-set when either Company Remit Tax is checked.
**Data**: `RemitTax=true means DisplayTax=auto-checked,disabled`

Notes: Second remit tax (HRIRemitTax2) visibility varies by country. Skip steps 3-4 if not visible.
**Automatable**: Yes

---

## TC-LOC-LI-055: Verify EnableIDCBilling Disabled When InternalCompany False
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field Dependency |

**Depends_On**: TC-LOC-LI-001
Automation File: specs/locations/location-local-information.spec.ts (ACTIVE_DEPENDENCIES loop)

**Steps**: 1. Verify "Intercompany" checkbox is checked (default) 2. Verify "Enable IDC Billing" checkbox is enabled 3. Uncheck "Intercompany" checkbox 4. Verify "Enable IDC Billing" checkbox is DISABLED 5. Verify "Enable IDC Billing" checkbox value is reset to false (unchecked) 6. Re-check "Intercompany" checkbox 7. Verify "Enable IDC Billing" checkbox is enabled (unchecked, not restored)
**Expected**: EnableIDCBilling disabled when InternalCompany=false, resets to false
**Data**: `InternalCompany=false means EnableIDCBilling=disabled,false` | `resetTrigger=InternalCompany=false`
**Automatable**: Yes

---

> **[TC-LOC-LI-056 removed]** This ID was reserved and subsequently removed before completion. It is excluded from the total TC count.

## TC-LOC-LI-057: Verify Compass Integration Disabled For Existing Locations
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Open existing location (office 1604, isNew=false) and verify "Compass Integration" checkbox is DISABLED 2. Navigate to create new location (isNew=true) and verify "Compass Integration" checkbox is ENABLED 3. Check "Compass Integration" checkbox and Save new location 4. Re-open created location (now isNew=false) and verify "Compass Integration" checkbox is DISABLED (cannot uncheck after creation)
**Expected**: IsIntegratedWithCOMPASS disabled when !isNew (updating existing location), enabled only during creation
**Data**: `isNew=false means Compass=disabled` | `isNew=true means Compass=enabled`
**Automatable**: Yes

---

## TC-LOC-LI-058: Verify USA Country Rules (country selection)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Country Branch |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify office 1604 is USA location (country selection) 2. Verify "Company Remit Tax" field visibility and state 3. Verify second remit tax field is unchecked or disabled 4. Verify discount fields are enabled on Local Information tab 5. Compare field visibility to non-USA office
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

**Steps**: 1. Navigate to Canadian/Mexican/international office (country selection) 2. Verify Company Remit Tax field is visible 3. Verify discount checking is disabled 4. Verify field behaviors differ from USA offices — International rule set applied
**Expected**: Non-USA offices (country selection) have different rules via updateControlStatus(countryId)
**Data**: `country selection` | `` | ``
**Automatable**: Yes

---

## TC-LOC-LI-060: Verify canEditLoc=false Read-Only State
| Priority | Status | Type |
|----------|--------|------|
| Critical | Manual | Permission State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Login as read-only user with Location Viewer role (canEditLoc=false) - requires manual provisioning of test account with readonly permissions 2. Navigate to office 1604 Local Information 3. Verify "LDW Percentage" spinbutton is DISABLED (canEditLoc=false) 4. Verify "C&C Percentage" spinbutton is DISABLED 5. Verify "ETS Percentage" spinbutton is DISABLED 6. Verify "Resort Tax Percentage" spinbutton is DISABLED 7. Verify "Threshold" spinbutton is DISABLED 8. Verify "Allow DPCD" checkbox is DISABLED 9. Verify "Show SubRental" checkbox is DISABLED 10. Verify "Display Tax" checkbox is DISABLED 11. Verify Save button is DISABLED or hidden
**Expected**: Users without canEditLoc permission see all conditional fields as disabled (read-only)
**Data**: `canEditLoc=false means allConditionalFields=disabled` | `permissionState=read-only` | `testAccount=requires manual provisioning of Location Viewer role account` | `role=Location Viewer`
**Automatable**: Yes

---

## TC-LOC-LI-061: Verify ResortTaxPercent First Enable Reset
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Reset Behavior |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Allow Resort Tax" checkbox is unchecked and "Resort Tax Percentage" spinbutton is disabled with value 0 2. Check "Allow Resort Tax" checkbox 3. Verify "Resort Tax Percentage" spinbutton is enabled with value reset to 0 (first enable reset) 4. Set "Resort Tax Percentage" spinbutton to 5.5 5. Uncheck "Allow Resort Tax" checkbox and verify "Resort Tax Percentage" spinbutton is disabled with value reset to 0 6. Re-check "Allow Resort Tax" checkbox and verify "Resort Tax Percentage" spinbutton is enabled 7. Verify "Resort Tax Percentage" spinbutton value is reset to 0 again (first enable reset triggers every time)
**Expected**: ResortTaxPercent resets to 0 when disabled OR when first enabled (every enable is treated as "first")
**Data**: `resetTriggers=disabled OR firstEnabled` | `alwaysResetTo0=true`
**Automatable**: Yes

---

## TC-LOC-LI-062: Verify Left Panel Disabled Fields Are Non-Interactive (READ-ONLY)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Read-Only Verification |

**Depends_On**: TC-LOC-LI-001
**Preconditions**: User is on `locations/1604/settings`. Left panel is visible alongside the right-panel tabs.

**Steps**: 1. Verify "Office" input field is rendered as disabled (cannot type, click, or change value) — Non-interactive 2. Verify "Local Office" input field is rendered as disabled — Non-interactive 3. Verify "Pay To Address" input field is rendered as disabled — Non-interactive 4. Verify "eCommerce Active" checkbox is rendered as disabled (grayed out, cannot be checked/unchecked) — Non-interactive 5. Verify "Enable Productions Orders" checkbox is rendered as disabled — Non-interactive 6. Attempt to interact with any disabled field — No state change occurs
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
**Preconditions**: User is on `locations/1604/settings`. Left panel is visible.

**Steps**: 1. Read "Office" input field value — Displays "1604" 2. Read "Local Office" input field value — Displays "1604" 3. Read "Pay To Address" input field value — Displays "Encore" 4. Read "eCommerce Active" checkbox state — Is checked and disabled (non-interactive) 5. Read "Enable Productions Orders" checkbox state — Is checked and disabled (non-interactive) 6. Perform any right-panel tab edit (e.g., toggle any Local Information checkbox) and Save 7. Re-verify all 5 left-panel fields — Office="1604", Local Office="1604", Pay To Address="Encore", eCommerce Active=checked+disabled, Enable Productions Orders=checked+disabled
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

**Steps**: 1. Verify "Ticker Calc" checkbox is checked by default — Checked 2. Uncheck "Ticker Calc" checkbox — Checkbox unchecks, Save button enables 3. Click Save and reload page 4. Verify "Ticker Calc" checkbox is unchecked — State persisted 5. Re-check "Ticker Calc" checkbox — Checkbox checks, Save button enables 6. Click Save and reload page 7. Verify "Ticker Calc" checkbox is checked — State restored
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

**Steps**: 1. Set "Service Charge" parent checkbox to checked 2. Verify "Show Service Charge As Administrative Fee" defaults to unchecked AND is enabled (parent-checked enables children) 3. Verify "Calculate Service Charge On Net Amount" defaults to unchecked AND is enabled 4. Check "Show Service Charge As Administrative Fee" -- no side effects on other fields 5. Check "Calculate Service Charge On Net Amount" -- no side effects on other fields 6. Click Save and reload the page 7. Verify both children persisted as checked 8. Uncheck "Service Charge" parent 9. Verify per documented requirement: both children become disabled and values reset to unchecked
**Expected**: Service Charge parent to children dependency: when parent is unchecked, both children should be disabled (and unchecked). When parent is checked, children are independently togglable. Same pattern as Apply LDW to LDW Percentage, Apply C&C to C&C children, Allow ETS to ETS Percentage. Actual on the live site: the dependent options remain active (checked and enabled) regardless of the parent state. Pending an application fix for the Service Charge parent-to-children dependency.
**Data**: `chkServiceCharge=parent` | `chkShowServiceChargeAsAdministrativeFee=child1` | `chkCalculateServiceChargeOnNetAmount=child2` | `expectedDependency=parent-checked enables children, parent-unchecked disables and resets children` | `actualBehavior=children always active`
**Automatable**: Yes — once is fixed, automation should assert the dependency. Until fixed, this TC documents the contract gap.

---

## TC-LOC-LI-066: Verify Enable Job Costing and Enable Proposal checkboxes persist
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field State |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Verify "Enable Job Costing" checkbox is checked by default — Checked 2. Verify "Enable Proposal" checkbox is checked by default — Checked 3. Uncheck "Enable Job Costing" — Unchecks, Save button enables, no dependency triggered on other fields 4. Uncheck "Enable Proposal" — Unchecks, no dependency triggered 5. Click Save and reload page 6. Verify "Enable Job Costing" is unchecked — Persisted 7. Verify "Enable Proposal" is unchecked — Persisted 8. Re-check both, click Save, reload 9. Verify "Enable Job Costing" is checked — Restored 10. Verify "Enable Proposal" is checked — Restored
**Expected**: Enable Job Costing and Enable Proposal both default to checked, are independent (no cross-field effects), and persist toggle state after save/reload.
**Data**: `chkEnableJobCosting=checked default` | `chkEnableProposal=checked default` | `independent=true`
**Automatable**: Yes

---

## TC-LOC-LI-067: Checkbox Labels Display Correct Visible Text
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| Medium | Automated | UI Validation | Yes | specs/locations/location-local-information.spec.ts:338 |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. For each checkbox on Local Information tab, read the visible label text -> Labels collected 2. Compare each label against expected text from CHECKBOX_LABEL_CASES test data -> All labels validated 3. Collect all mismatches and assert zero failures -> Pass/fail in one assertion
**Expected**: All checkbox fields display their correct, human-readable labels matching the requirements specification.
**Data**: CHECKBOX_LABEL_CASES array (key to expected label pairs)
**Automatable**: Yes
Notes: Bulk validation test — tests all checkbox labels in one pass. Added per requirements update.

---

## TC-LOC-LI-068: Oracle Product Accepts Special Characters; Value Persists
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Field Persistence | Yes | specs/locations/location-local-information.spec.ts:351 |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Read current Oracle Product value -> Original saved 2. Enter special characters test value into Oracle Product field -> Value set 3. Click Save -> Save completes 4. Reload page and navigate back to Local Info tab -> Page reloads 5. Verify Oracle Product contains the special characters value -> Persisted 6. Restore original value and Save -> Baseline restored
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
**Steps**: 1. Read current Oracle Department value -> Original saved 2. Enter alphanumeric test value into Oracle Department field -> Value set 3. Click Save -> Save completes 4. Reload page and navigate back to Local Info tab -> Page reloads 5. Verify Oracle Department contains the test value -> Persisted 6. Restore original value and Save -> Baseline restored
**Expected**: Oracle Department text field accepts and persists alphanumeric values after save+reload cycle. Original value restored at cleanup.
**Data**: `txtOracleDepartment` | `oracleDeptTest` value | `office=1604`
**Automatable**: Yes
Notes: — server now accepts persistent changes for office 1604.

---

## TC-LOC-LI-070: Skip Billing Toggle Persists After Save+Reload
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Field Persistence | Yes | specs/locations/location-local-information.spec.ts:377 |

**Steps**: 1. Wait for Skip Billing checkbox to be visible and interactive -> Checkbox ready 2. Read initial checked/unchecked state of Skip Billing -> Initial state recorded 3. Toggle Skip Billing to opposite state -> Toggled 4. Click Save -> Save completes 5. Reload page and navigate back to Local Info tab -> Page reloads 6. Verify Skip Billing is in the toggled state -> Persisted after save+reload 7. Restore original state and Save -> Baseline restored (always-restore in finally block)
**Expected**: Skip Billing checkbox toggle persists after save+reload cycle. Original state always restored regardless of test outcome. Skip Billing does NOT disable Oracle Product — it is a billing flag only.
**Data**: `chkSkipBilling` | `office=1604`
**Automatable**: Yes
Notes: MCP-verified — Skip Billing does NOT disable Oracle Product (checkbox is billing flag only). Updated from the prior version to test actual toggle+persist behavior.

---

## TC-LOC-LI-071: Enable Multiday Pricing — Toggle and Persist After Save+Reload
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Field State | Yes | specs/locations/location-local-information.spec.ts:172 |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Check "Enable Multiday Pricing" checkbox (default: unchecked) -> Save button enables 2. Click Save -> Save completes 3. Reload page and navigate back to Local Info tab -> Page reloads 4. Verify "Enable Multiday Pricing" is checked -> Persisted after save+reload 5. Uncheck "Enable Multiday Pricing" to restore baseline -> Unchecked 6. Click Save -> Baseline restored
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
**Steps**: 1. Check "Enable IDC Billing" checkbox -> Checked 2. Click Save -> Save completes 3. Reload page and navigate back to Local Info tab -> Page reloads 4. Verify "Enable IDC Billing" is checked -> Persisted after save+reload 5. Uncheck "Enable IDC Billing" to restore baseline -> Unchecked 6. Click Save -> Baseline restored
**Expected**: Enable IDC Billing checkbox persists as checked after save+reload cycle.
**Data**: `chkEnableIDCBilling` | `office=1604`
**Automatable**: Yes
Notes: Added per requirements update (Jira). MCP-verified.

---

## TC-LOC-LI-073: DisplayTax Auto-Sets True When CompanyRemitTax Re-Checked
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Dependency | Yes | specs/locations/location-local-information.spec.ts:187 |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Uncheck "Company Remit Tax" -> "Display Tax" becomes enabled (editable) 2. Uncheck "Display Tax" -> Unchecked 3. Re-check "Company Remit Tax" -> "Display Tax" auto-sets to checked AND becomes disabled 4. Click Save -> Cascade behavior persisted
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
**Steps**: 1. "Combo A" (DPCD=on, PFA=off — baseline): Verify Threshold is disabled 2. "Combo B" (DPCD=on, PFA=on): Check Prompt For Approval -> Threshold stays disabled 3. "Combo D" (DPCD=off, PFA=on): Uncheck Allow DPCD -> Threshold becomes enabled 4. "Combo C" (DPCD=off, PFA=off): Uncheck Prompt For Approval -> Threshold disabled again 5. Return to Combo D: Re-check Prompt For Approval -> Threshold enabled 6. Set Threshold to 50.00 7. Re-check Allow DPCD (-> Combo B) -> Threshold disabled AND value resets to 0 8. Restore baseline (Combo A) and Save
**Expected**: Threshold is ONLY enabled when Allow DPCD=false AND Prompt For Approval=true (Combo D). All other 3 combos disable it. When Threshold becomes disabled, its value resets to 0.
**Data**: `chkAllowDPCD` | `chkPromptForApproval` | `spinThreshold` | `4-combo decision table`
**Automatable**: Yes
Notes: Dual dependency. Added per requirements update (Jira). a prior observation from exploration.

---

## TC-LOC-LI-075: C&C Percentage Resets to 0 When Apply C&C Fee Unchecked
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Dependency | Yes | specs/locations/location-local-information.spec.ts:211 |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Check "Apply Cables & Consumables Fee" -> C&C Percentage spinbutton becomes enabled 2. Set C&C Percentage to 5.00 -> Value set 3. Uncheck "Apply Cables & Consumables Fee" -> C&C Percentage disabled AND value resets to 0 4. Click Save -> Reset state persisted
**Expected**: Checking Apply C&C Fee enables C&C% spinbutton. Unchecking disables it AND resets value to 0 (not just disable).
**Data**: `chkApplyCablesConsumablesFee` | `spinCCPercentage` | `reset-on-disable=true`
**Automatable**: Yes
Notes: MCP ref: MCP-05. Confirms a prior observation (unchecking dependency resets values).

---

## TC-LOC-LI-076: Resort Tax Percentage Resets to 0 When Allow Resort Tax Unchecked
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Dependency | Yes | specs/locations/location-local-information.spec.ts:222 |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Check "Allow Resort Tax" -> Resort Tax Percentage spinbutton becomes enabled 2. Set Resort Tax Percentage to 3.00 -> Value set 3. Uncheck "Allow Resort Tax" -> Resort Tax Percentage disabled AND value resets to 0 4. Click Save -> Reset state persisted
**Expected**: Checking Allow Resort Tax enables Resort Tax% spinbutton. Unchecking disables it AND resets value to 0.
**Data**: `chkAllowResortTax` | `spinResortTaxPercentage` | `reset-on-disable=true`
**Automatable**: Yes
Notes: MCP ref: MCP-06. Same reset-on-disable pattern as C&C Fee.

---

## TC-LOC-LI-077: Verify ETS Percentage enables when Allow ETS is checked and resets on uncheck
| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Dependency | Yes | specs/locations/location-local-information.spec.ts:198 |

**Depends_On**: TC-LOC-LI-001
**Steps**: 1. Check "Allow ETS" -> ETS Percentage spinbutton becomes enabled AND pre-fills with 23.00% (non-union default for office 1604) 2. Verify ETS Percentage value is 23 -> Non-union default applied 3. Uncheck "Allow ETS" -> ETS Percentage disabled AND value resets to 0 4. Click Save -> Reset state persisted
**Expected**: Checking Allow ETS enables ETS% and pre-fills it with the union/non-union default (23% for non-union office 1604). Unchecking disables and resets to 0.
**Data**: `chkAllowETS` | `spinETSPercentage` | `nonUnionDefault=23` | `office=1604 (non-union)`
**Automatable**: Yes
Notes: MCP ref: MCP-03. Office 1604 is non-union, so default is 23%. Union offices would default to 24%.

---

## TC-LOC-LI-078: Verify Apply LDW disables the Calculate LDW on Net Amount checkbox
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency (Negative) |


**Steps**: 1. Read "Calculate LDW On Net Amount" checkbox baseline (default: checked on office 1604) 2. Uncheck "Apply LDW" parent checkbox 3. Verify "Calculate LDW On Net Amount" sibling checkbox transitions to disabled AND unchecked (per the required parent-to-children dependency) 4. Re-check "Apply LDW" parent 5. Verify "Calculate LDW On Net Amount" sibling re-enables and respects its baseline 6. Cleanup: restore baseline state, no save (transient assertion only)
**Expected**: Unchecking Apply LDW disables AND unchecks the Calculate LDW On Net Amount sibling checkbox per the LI parent-to-children cascade convention (same expectation as Allow Service Charge children + Apply C&C children per LI-079).
Actual on the live site: the sibling stays checked + enabled when parent is unchecked (only the LDW Percentage spinbutton disables). Save-cycle persistence not verified.
**Data**: `chkApplyLDW=toggle` | `chkCalcLDWOnNetAmount=expected disabled+unchecked when parent unchecked` | `bug=`
**Automatable**: Yes (assertion currently fails on new site; pin against fix)

---

## TC-LOC-LI-079: Verify Apply C&C disables the Calculate C&C on Net Amount checkbox
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field Dependency (Negative) |


**Steps**: 1. Read "Calculate C&C On Net Amount" checkbox baseline (default: checked on office 1604) 2. Uncheck "Apply C&C Fee" parent checkbox 3. Verify "Calculate C&C On Net Amount" sibling checkbox transitions to disabled AND unchecked 4. Re-check "Apply C&C Fee" parent 5. Verify "Calculate C&C On Net Amount" sibling re-enables and respects its baseline 6. Cleanup: restore baseline state, no save (transient assertion only)
**Expected**: Unchecking Apply C&C Fee disables AND unchecks the Calculate C&C On Net Amount sibling checkbox per the LI parent-to-children cascade convention (same expectation as LI-078 LDW variant + Service Charge variant).
Actual on the live site: the sibling stays checked + enabled when parent is unchecked. Save-cycle persistence not verified.
**Data**: `chkApplyCablesConsumablesFee=toggle` | `chkCalcCACOnNetAmount=expected disabled+unchecked when parent unchecked` | `bug=`
**Automatable**: Yes (assertion currently fails on new site; pin against fix)

---

## TC-LOC-LI-080: Verify Enable Set/Strike Minutes disables Apply Set/Strike Minutes
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field Dependency (Negative) |

**Steps**: 1. Read "Apply Set/Strike Labor Minutes" checkbox baseline (default: checked on office 1604 when Enable Set/Strike Minutes is checked) 2. Uncheck "Enable Set/Strike Labor Minutes" parent checkbox 3. Verify "Apply Set/Strike Labor Minutes" child checkbox transitions to disabled (and unchecked per cascade convention) 4. Re-check "Enable Set/Strike Labor Minutes" parent 5. Verify "Apply Set/Strike Labor Minutes" child re-enables 6. Cleanup: restore baseline state, no save (transient assertion only)
**Expected**: Unchecking Enable Set/Strike Labor Minutes disables and unchecks the Apply Set/Strike Labor Minutes child checkbox per the LI parent-to-children cascade convention. This cascade was not previously covered by any test case; that coverage gap is now closed.
**Data**: `chkEnableSetStrikeMinutes=toggle` | `chkApplySetStrikeMinutes=expected disabled+unchecked when parent unchecked`
**Automatable**: Yes

---

## TC-LOC-LI-081: Verify C&C Percentage Spinbutton Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**: 1. Ensure "Apply C&C Fee" is checked and "C&C Percentage" spinbutton is enabled 2. Clear field and enter 0 — Field accepts 3. Click Save and reload 4. Verify "C&C Percentage" persists as 0 with no error
**Expected**: Value 0 is valid for C&C Percentage, persists, no error message.
**Data**: `spinCCPercentage=0` | `min=0` | `max=100`
**Automatable**: Yes

---

## TC-LOC-LI-082: Verify C&C Percentage Spinbutton Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**: 1. Enter 100 in "C&C Percentage" — Field accepts 2. Save and reload 3. Verify value persists as 100 with no error
**Expected**: Value 100 is valid (max), persists, no error.
**Data**: `spinCCPercentage=100`
**Automatable**: Yes

---

## TC-LOC-LI-083: Verify C&C Percentage Spinbutton Boundary - Invalid Below Min (-0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter -0.01 in "C&C Percentage" — Field accepts but renders error indicator (aria-invalid=true) 2. Verify Save button is DISABLED (form-validity gate PRIMARY_SYMPTOM_RESOLVED) 3. Verify error message: "Number must be greater than or equal to 0" 4. Restore valid value to clear error
**Expected**: -0.01 invalid (just below min). aria-invalid=true. Save disabled until valid.
**Data**: `spinCCPercentage=-0.01` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-084: Verify C&C Percentage Spinbutton Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter -5 in "C&C Percentage" — Field accepts but renders error 2. Verify Save disabled 3. Verify error: "Number must be greater than or equal to 0"
**Expected**: -5 invalid (far below min). aria-invalid=true. Save disabled.
**Data**: `spinCCPercentage=-5` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-085: Verify C&C Percentage Spinbutton Boundary - Invalid Above Max (100.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter 100.01 in "C&C Percentage" — Field renders error 2. Verify Save disabled 3. Verify error: "Number must be less than or equal to 100"
**Expected**: 100.01 invalid (just above max). aria-invalid=true. Save disabled.
**Data**: `spinCCPercentage=100.01` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-086: Verify C&C Percentage Spinbutton Boundary - Invalid Far Above Max (150.99)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter 150.99 in "C&C Percentage" — Field renders error 2. Verify Save disabled 3. Verify error: "Number must be less than or equal to 100"
**Expected**: 150.99 invalid (far above max). Save disabled.
**Data**: `spinCCPercentage=150.99` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-087: Verify ETS Percentage Spinbutton Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**: 1. Ensure "Allow ETS" is checked and "ETS Percentage" spinbutton is enabled 2. Clear and enter 0 3. Save and reload 4. Verify value persists as 0
**Expected**: Value 0 valid for ETS Percentage, persists, no error.
**Data**: `spinETSPercentage=0`
**Automatable**: Yes

---

## TC-LOC-LI-088: Verify ETS Percentage Spinbutton Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**: 1. Enter 100 in "ETS Percentage" 2. Save and reload 3. Verify value persists as 100
**Expected**: Value 100 valid (max), persists.
**Data**: `spinETSPercentage=100`
**Automatable**: Yes

---

## TC-LOC-LI-089: Verify ETS Percentage Spinbutton Boundary - Invalid Below Min (-0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter -0.01 in "ETS Percentage" 2. Verify aria-invalid=true and Save disabled 3. Verify error: "Number must be greater than or equal to 0"
**Expected**: -0.01 invalid. Save disabled.
**Data**: `spinETSPercentage=-0.01` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-090: Verify ETS Percentage Spinbutton Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter -5 in "ETS Percentage" 2. Verify Save disabled 3. Verify error: "Number must be greater than or equal to 0"
**Expected**: -5 invalid (far below min). Save disabled.
**Data**: `spinETSPercentage=-5` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-091: Verify ETS Percentage Spinbutton Boundary - Invalid Above Max (100.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter 100.01 in "ETS Percentage" 2. Verify Save disabled 3. Verify error: "Number must be less than or equal to 100"
**Expected**: 100.01 invalid (just above max). Save disabled.
**Data**: `spinETSPercentage=100.01` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-092: Verify ETS Percentage Spinbutton Boundary - Invalid Far Above Max (150.99)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter 150.99 in "ETS Percentage" 2. Verify Save disabled 3. Verify error: "Number must be less than or equal to 100"
**Expected**: 150.99 invalid (far above max). Save disabled.
**Data**: `spinETSPercentage=150.99` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-093: Verify Resort Tax Percentage Spinbutton Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**: 1. Ensure "Allow Resort Tax" is checked and "Resort Tax Percentage" spinbutton is enabled 2. Clear and enter 0 3. Save and reload 4. Verify value persists as 0
**Expected**: Value 0 valid for Resort Tax Percentage, persists.
**Data**: `spinResortTaxPercentage=0`
**Automatable**: Yes

---

## TC-LOC-LI-094: Verify Resort Tax Percentage Spinbutton Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**: 1. Enter 100 in "Resort Tax Percentage" 2. Save and reload 3. Verify value persists as 100
**Expected**: Value 100 valid (max), persists.
**Data**: `spinResortTaxPercentage=100`
**Automatable**: Yes

---

## TC-LOC-LI-095: Verify Resort Tax Percentage Spinbutton Boundary - Invalid Below Min (-0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter -0.01 in "Resort Tax Percentage" 2. Verify aria-invalid=true and Save disabled 3. Verify error: "Number must be greater than or equal to 0"
**Expected**: -0.01 invalid. Save disabled.
**Data**: `spinResortTaxPercentage=-0.01` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-096: Verify Resort Tax Percentage Spinbutton Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter -5 in "Resort Tax Percentage" 2. Verify Save disabled 3. Verify error: "Number must be greater than or equal to 0"
**Expected**: -5 invalid (far below min). Save disabled.
**Data**: `spinResortTaxPercentage=-5` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-097: Verify Resort Tax Percentage Spinbutton Boundary - Invalid Above Max (100.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter 100.01 in "Resort Tax Percentage" 2. Verify Save disabled 3. Verify error: "Number must be less than or equal to 100"
**Expected**: 100.01 invalid (just above max). Save disabled.
**Data**: `spinResortTaxPercentage=100.01` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-098: Verify Resort Tax Percentage rejects a value far above the maximum
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter 150.99 in "Resort Tax Percentage" 2. Verify Save disabled 3. Verify error: "Number must be less than or equal to 100"
**Expected**: 150.99 invalid (far above max). Save disabled.
**Data**: `spinResortTaxPercentage=150.99` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-099: Verify Set/Strike Labor Billing Spinbutton Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**: 1. Ensure "Set/Strike Labor Billing Goal" spinbutton is enabled 2. Clear and enter 0 3. Save and reload 4. Verify value persists as 0
**Expected**: Value 0 valid for Set/Strike Labor Billing, persists.
**Data**: `spinSetStrikeLaborBilling=0`
**Automatable**: Yes

---

## TC-LOC-LI-100: Verify Set/Strike Labor Billing Spinbutton Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Steps**: 1. Enter 100 in "Set/Strike Labor Billing" 2. Save and reload 3. Verify value persists as 100
**Expected**: Value 100 valid (max), persists.
**Data**: `spinSetStrikeLaborBilling=100`
**Automatable**: Yes

---

## TC-LOC-LI-101: Verify Set/Strike Labor Billing Spinbutton Boundary - Invalid Below Min (-0.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter -0.01 in "Set/Strike Labor Billing" 2. Verify aria-invalid=true and Save disabled 3. Verify error: "Number must be greater than or equal to 0"
**Expected**: -0.01 invalid. Save disabled.
**Data**: `spinSetStrikeLaborBilling=-0.01` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-102: Verify Set/Strike Labor Billing Spinbutton Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter -5 in "Set/Strike Labor Billing" 2. Verify Save disabled 3. Verify error: "Number must be greater than or equal to 0"
**Expected**: -5 invalid (far below min). Save disabled.
**Data**: `spinSetStrikeLaborBilling=-5` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-103: Verify Set/Strike Labor Billing Spinbutton Boundary - Invalid Above Max (100.01)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter 100.01 in "Set/Strike Labor Billing" 2. Verify Save disabled 3. Verify error: "Number must be less than or equal to 100"
**Expected**: 100.01 invalid (just above max). Save disabled.
**Data**: `spinSetStrikeLaborBilling=100.01` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-104: Verify Set/Strike Labor Billing rejects a value far above the maximum
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Steps**: 1. Enter 150.99 in "Set/Strike Labor Billing" 2. Verify Save disabled 3. Verify error: "Number must be less than or equal to 100"
**Expected**: 150.99 invalid (far above max). Save disabled.
**Data**: `spinSetStrikeLaborBilling=150.99` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-105: Verify Threshold Spinbutton Boundary - Valid Min (0)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Preconditions**: AllowDPCD=false AND PromptForApproval=true (Combo D per TC-074), so Threshold is enabled.

**Steps**: 1. Place office in Combo D so Threshold is enabled 2. Clear and enter 0 in Threshold 3. Save and reload 4. Verify value persists as 0
**Expected**: Value 0 valid for Threshold (note: Threshold step=0.1 not 0.01).
**Data**: `spinThreshold=0` | `step=0.1`
**Automatable**: Yes

---

## TC-LOC-LI-106: Verify Threshold Spinbutton Boundary - Valid Max (100)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative Suite) |

**Preconditions**: Combo D (Threshold enabled).

**Steps**: 1. Enter 100 in Threshold 2. Save and reload 3. Verify value persists as 100
**Expected**: Value 100 valid (max), persists.
**Data**: `spinThreshold=100`
**Automatable**: Yes

---

## TC-LOC-LI-107: Verify Threshold Spinbutton Boundary - Invalid Below Min (-0.1)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Preconditions**: Combo D (Threshold enabled).

**Steps**: 1. Enter -0.1 in Threshold (one step below min) 2. Verify aria-invalid=true and Save disabled 3. Verify error: "Number must be greater than or equal to 0"
**Expected**: -0.1 invalid. Save disabled.
**Data**: `spinThreshold=-0.1` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-108: Verify Threshold Spinbutton Boundary - Invalid Far Below Min (-5)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Preconditions**: Combo D (Threshold enabled).

**Steps**: 1. Enter -5 in Threshold 2. Verify Save disabled 3. Verify error: "Number must be greater than or equal to 0"
**Expected**: -5 invalid (far below min). Save disabled.
**Data**: `spinThreshold=-5` | `expectedError=Number must be greater than or equal to 0`
**Automatable**: Yes

---

## TC-LOC-LI-109: Verify Threshold Spinbutton Boundary - Invalid Above Max (100.1)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Boundary Value (Negative) |

**Preconditions**: Combo D (Threshold enabled).

**Steps**: 1. Enter 100.1 in Threshold (one step above max) 2. Verify Save disabled 3. Verify error: "Number must be less than or equal to 100"
**Expected**: 100.1 invalid (just above max). Save disabled.
**Data**: `spinThreshold=100.1` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-110: Verify Threshold Spinbutton Boundary - Invalid Far Above Max (150.9)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Boundary Value (Negative) |

**Preconditions**: Combo D (Threshold enabled).

**Steps**: 1. Enter 150.9 in Threshold 2. Verify Save disabled 3. Verify error: "Number must be less than or equal to 100"
**Expected**: 150.9 invalid (far above max). Save disabled.
**Data**: `spinThreshold=150.9` | `expectedError=Number must be less than or equal to 100`
**Automatable**: Yes

---

## TC-LOC-LI-111: Verify Oracle Product Accepts SQL-Injection Characters (Document Live Behavior)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Input Validation (Negative) |

**Preconditions**: Skip Billing unchecked (Oracle fields required); slate-clear per TC-008 to baseline 0000.

**Steps**: 1. Type semicolons, single quotes, and double quotes into Oracle Product field (e.g., `'; DROP TABLE--`) within the maxLength=25 cap 2. Read the field value back via interface 3. Tab off the field 4. Click Save 5. Reload page 6. Verify either: (a) the literal characters persisted exactly as typed, OR (b) the input was sanitized/rejected at client and the live behavior is captured verbatim
**Expected**: Observe and record the live behavior: client-side acceptance vs sanitization vs rejection. The TC documents what the system actually does — it does NOT prescribe a server-side hardening contract. If raw SQL characters persist to the server, record the finding for follow-up with the application team.
**Data**: `txtOracleProduct=' DROP TABLE-- (or similar)` | `maxLength=25` | `outcome=document live behavior`
**Notes**: Kept as a manual check - this is a security / exploratory verification that requires tester observation each run
**Automatable**: Yes

---

## TC-LOC-LI-112: Verify Oracle Product Accepts Unicode/Emoji Input (Document Live Behavior)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Input Validation (Negative) |

**Preconditions**: Skip Billing unchecked; slate-clear to 0000.

**Steps**: 1. Type a Unicode mix into Oracle Product field within maxLength=25 (e.g., `日本語🎉Café`) 2. Tab off, Save, reload 3. Read the persisted value 4. Document whether the field preserves multibyte chars exactly, normalizes, replaces with `?`, or rejects
**Expected**: Observe and record the live behavior — preservation vs normalization vs rejection. Multibyte char count vs maxLength=25 (does Oracle Product count by code-point or byte?).
**Data**: `txtOracleProduct=日本語🎉Café (or similar Unicode mix)` | `maxLength=25` | `outcome=document live behavior`
**Notes**: Kept as a manual check - this is a security / exploratory verification that requires tester observation each run
**Automatable**: Yes

---

## TC-LOC-LI-113: Verify the Oracle Department field stores special characters as text
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Input Validation (Negative) |

**Preconditions**: Skip Billing unchecked; slate-clear to 900.

**Steps**: 1. Type semicolons, single quotes, double quotes into Oracle Department field within maxLength=25 2. Tab off, Save, reload 3. Read the persisted value 4. Document client-side acceptance vs sanitization vs rejection (mirror LI-111 for the Oracle Department field)
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

**Steps**: 1. Type Unicode mix into Oracle Department field within maxLength=25 2. Tab off, Save, reload 3. Read the persisted value 4. Document preservation vs normalization vs rejection (mirror LI-112 for Oracle Department)
**Expected**: Observe and record the live behavior — multibyte preservation vs normalization vs rejection. Same maxLength code-point-vs-byte ambiguity as LI-112.
**Data**: `txtOracleDepartment=日本語🎉Café (or similar Unicode mix)` | `maxLength=25` | `outcome=document live behavior`
**Notes**: Kept as a manual check - this is a security / exploratory verification that requires tester observation each run
**Automatable**: Yes

---

## Execution Notes

| Metric | Value |
|--------|-------|
| Explored | + (Requirements-aligned + deep field exploration + live re-verification) |
| Total TCs | 114 (77 base + 37 NE-NNN added per SP-DQU-05D: LI-078/012/013 + ARCH-009 cascade gaps, LI-081.LI-110 30 boundary TCs across C&C/ETS/ResortTax/Set-Strike/Threshold spinbuttons, LI-111.LI-114 4 Oracle text negatives) |
| Total Fields | 54 interactive (8 inputs + 41 Radix checkboxes + 2 Radix comboboxes + 2 Radix radio groups + 1 disabled date button) per SP-DQU-04 live DOM walk |
| Dependencies | 10 discovered: 6 checkbox--spinbutton, 1 dual (AllowDPCD+PromptForApproval), 3 permission-based |
| Conditional Fields | 6 context-dependent (Compass, DisplayTax, Threshold, BillingCycle, etc.) |
| Validation Rules | 8 types: spinbutton boundaries, maxLength, required fields, date validation, Legal array rules |
| API Validations | 2 endpoints: checkBillWayChange, BillingCycle change handler |
| Error Messages | 6 types: boundary (2), required (a required-field validation), Legal (SCNAME_IS_REQD, TCNAME_IS_REQD), date (a billing-date validation) |
| Boundary Values | 9 values per spinbutton: -5, -0.01, 0, 0.01, 50, 99.99, 100, 100.01, 150.99 |
| Business Rules | Country-based (USA vs intl), Permission-based (canEditLoc) |
| Dropdown Options | Oracle Organization: 8 options (--Select--, 7 business units) |
| Default States | 18 checked, 19 unchecked checkboxes |
| URL | `locations/1604/settings` |
| Requirements Coverage | ~98% (63 TCs vs REQUIREMENTS.md) — left-panel, Ticker Calc, Service Charge group, Enable Job Costing, Enable Proposal now covered |

Test Philosophy Applied:
- One field = Multiple test cases: Critical spinbuttons have 8+ TCs each (default, dependency, 6 boundaries)
- Granular & Team-Reviewable: Every TC tests ONE behavior, executable without guessing
- Deep Exploration: Clicked/typed every field, discovered resets, API triggers, validation timing
- Boundary Value Analysis: min, min+, max-, max, below, above for all spinbuttons
- Equivalence Partitioning: Valid (0-100) vs Invalid (<0 or >100); Valid text (1-25 chars)
- Decision Tables: Checkbox combinations -- spinbutton states
- Disabled Field Mapping: Documented always-disabled + conditionally-disabled fields

Critical Discoveries (Requirements-Aligned):
1. Threshold has DUAL dependency: AllowDPCD=false AND PromptForApproval=true both required (NOT broken, just complex)
2. Billing Way API on ERROR reverts selection (not disables field) - success enables BillingWay Effective Date
3. ETS Percentage defaults UNVERIFIED: Code claims 0.24 (union)/0.23 (non-union), but live test showed value stays 0
4. Oracle fields are REQUIRED when SkipBilling is false (not just disabled)
5. Validation fires on PAGE LOAD, not on save - invalid values persist to database
6. Unchecking dependency checkboxes RESETS spinbutton values to 0 (not just disable)
7. Country-based rules: USA (country selection) has 8. Permission states: canEditLoc=false disables 8+ conditional fields
9. Legal array validations: ServiceChargeId and TermsConditionsId required for all Legal items (moved to Legal pipeline)
10. Auto-set behaviors: DisplayTax auto-sets to true when HRIRemitTax OR HRIRemitTax2 enabled

Coverage Analysis:
 COMPLETE: Field dependencies (10), Boundary values (spinbuttons), API validations (2), Required fields (5), Permission states (canEditLoc), Country rules (USA/intl), Union-based defaults (ETS), Legal array validations (2), Date validation (BillingWay Effective Date), Dual dependencies (Threshold)

PARTIAL: Tab-specific behaviors (Legal tab may have additional fields beyond array validations), Multi-user concurrency (not testable without 2 sessions)

Future Coverage:
- Other tabs deep-dive (Currency, Pricing, Account/Address, Notes, Shared Setup, Auto Add-On)
- Legal tab UI fields (beyond ServiceChargeId/TermsConditionsId array validation)
- Concurrency (multi-user edit conflicts, optimistic locking)
- Performance (save with 1000+ Legal items, large data sets)
