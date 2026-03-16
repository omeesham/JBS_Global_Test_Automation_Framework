# Location - Local Information Test Plan

**Feature**: Setup > Location > Local Information Tab  
**Module**: Locations  
**Created**: 2026-02-17  
**Updated**: 2026-02-18 (Live re-verification: all 3 tabs + left panel; TC-062 to TC-066 added; TC-063 concrete values; Pricing TC-023 added)  
**Planner Agent**: LIVE-VERIFIED - Full DOM exploration of left panel, Local Information, Currency, Pricing tabs  
**URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location  
**Test Office**: 1604 - The Parker Palm Springs  
**Test Cases**: 63 requirement-aligned scenarios (TC-LOC-LI-001 to TC-LOC-LI-066, with TC-049/050/056 removed)  
**Test Cases File**: [local-information-test-cases.md](../../test-cases/locations/local-information-test-cases.md)

---

## CRITICAL DISCOVERIES (REQUIREMENTS-ALIGNED)

### Validation Behavior
- **Validation timing**: Fires on PAGE LOAD, NOT on save
- **Invalid values**: Persist to database without errors on save
- **Error messages**: Appear only after page reload
- **Boundary errors**: "Number must be ≥0" | "Number must be ≤100"
- **Required errors**: ERR_REQUIRED (Oracle fields, BillingCycle)
- **Date error**: ERR_BILLINGWAY_DATE (BillingWayEffectiveDate past date check)
- **Legal errors**: SCNAME_IS_REQD, TCNAME_IS_REQD (Legal array validations)

### Field Dependencies (CORRECTED)
1. **chkApplyLDW -- spinLDWPercentage** (unchecking RESETS value to 0, not just disables)
2. **chkApplyCablesConsumablesFee -- spinCCPercentage** (resets to 0 on uncheck)
3. **chkAllowETS -- spinETSPercentage** (defaults 0.23 non-union, 0.24 union when enabled)
4. **chkAllowResortTax -- spinResortTaxPercentage** (resets on disable AND first enable)
5. **chkAllowDPCD + chkPromptForApproval -- spinThreshold** (DUAL dependency: BOTH must be true, disabled when AllowDPCD=true OR PromptForApproval=false OR canEditLoc=false)
6. **chkSkipBilling -- disables txtOracleProduct, txtOracleDepartment, drpOracleOrganization** (all 3 become REQUIRED when SkipBilling=false)
7. **chkCommReceiver -- chkAllowDPCD, chkShowSubRental** (disabled when CommReceiver=false)
8. **chkInternalCompany -- chkEnableIDCBilling** (disabled when InternalCompany=false, resets to false)
9. **chkHRIRemitTax OR chkHRIRemitTax2 -- chkDisplayTax** (auto-set to true, disabled)
10. **isNew -- chkProposalPilot** (disabled when isNew=true), **chkCompassIntegration** (disabled when isNew=false)

### API Validations

#### Billing Way Change (checkBillWayChange)
- **Endpoint**: GET `/api/location/check-unbilled?localOfficeId=1604`
- **Trigger**: Changing Billing Way from Event to Daily (or reverse)
- **Error Path**: "There are orders that have not been billed in the current billing period. Those must be invoiced before the change can be made."
  - **Behavior**: Selection REVERTS to previous value (NOT disabled)
  - **Error Key**: ERR_BILLINGWAY_UNBILLED_ORDERS
- **Success Path**: 
  - **Behavior**: Enables `btnBillingWayEffectiveDate`, sets date to current date
  - Selection persists (no revert)
  
#### Billing Cycle Change (checkBillCycleChange)
- **Endpoint**: locationService.checkBillCycleChange()
- **Trigger**: checkLocalBillingRan() method call
- **Success (data > 0)**: Sets localBillingRan=true, DISABLES drpBillingCycle field
- **Error**: Shows alert, sets localBillingRan=true

### Required Field Validations
1. **txtOracleProduct**: maxLength=25, REQUIRED when SkipBilling=false (ERR_REQUIRED)
2. **txtOracleDepartment**: maxLength=25, REQUIRED when SkipBilling=false (ERR_REQUIRED)
3. **drpOracleOrganization**: REQUIRED when SkipBilling=false, value > 0 (billingReq error key)
4. **drpBillingCycle**: REQUIRED, cannot be 0, shows exclamation icon (ERR_REQUIRED)
5. **Legal ServiceChargeId**: REQUIRED for all Legal array items (SCNAME_IS_REQD via scReq())
6. **Legal TermsConditionsId**: REQUIRED for all Legal array items (TCNAME_IS_REQD via tcReq())

### Boundaries & Constraints
- **All spinbuttons**: min=0, max=100, step=0.01 (except Threshold: step=0.1)
- **Tested boundary values**: -5, -0.01, 0, 0.01, 50, 99.99, 100, 100.01, 150.99 (9 values)
- **Oracle textboxes**: maxLength=25 (client-side truncation before save)
- **Oracle Organization**: 8 dropdown options (--Select--, 7 business units)
- **BillingWayEffectiveDate**: must be >= today (midnight), validated via validateBillWayDate()

### Conditional Field States (Context-Dependent)
1. **chkSuppressDayRateDiscount**: Always disabled (system flag)
2. **chkCompassIntegration**: Disabled when isNew=false (updating existing location)
3. **chkDisplayTax**: Disabled when HRIRemitTax=true OR HRIRemitTax2=true (auto-set)
4. **btnEffectiveDate**: Disabled by default, ENABLED after successful Billing Way API change
5. **drpBillingCycle**: Disabled when localBillingRan=true (API-driven)
6. **chkProposalPilot**: Disabled when isNew=true (creating new location)
7. **Multiple fields disabled when canEditLoc=false**: spinLDWPercentage, spinCCPercentage, spinETSPercentage, spinResortTaxPercentage, spinThreshold, chkAllowDPCD, chkShowSubRental, chkDisplayTax

### Country-Based Rules (updateControlStatus)
- **USA (CountryId=1)**: hideRemitTax=true, HRIRemitTax2=false, CheckDiscount=true
- **Other Countries**: hideRemitTax=false, CheckDiscount=false

### Union-Based Defaults
- **ETSPercentage**: Defaults to 0.24 if IsUnion=true, 0.23 if IsUnion=false (when AllowETS enabled)

### Permission-Based States
- **canEditLoc=false**: 8+ fields become disabled (read-only mode for users without edit permission)

---

## Navigation Discovery

**REQUIREMENTS.md vs Reality:**
- **REQUIREMENTS.md stated:** "Setup > Select Location"
- **Actual UI:** Setup -- Location (not "Select Location"  
- **"Select a Location"** text appears as office picker dropdown in top header, NOT as menu option
- **Correct navigation path:** Dashboard -- Setup (dropdown menu) -- Location menu item -- Search page -- Enter office code -- Click office in results -- Basic Information page

**Navigation Selectors:**
```typescript
SetupSelectors.btnSetupMenu: 'button:has-text("Setup")'
SetupSelectors.lnkLocation: 'a[href="locations"]'
SetupSelectors.txtLocalOfficeSearch: 'label:has-text("Local Office") + input'
SetupSelectors.btnSearch: 'button:has-text("Search")'
SetupSelectors.lnkOfficeCode: (officeCode: string) => `a:has-text("${officeCode}")`
```

---

## Page Structure

### Two-Panel Layout

**Left Panel (Read-Only Baseline):** Office/location master data that MUST remain unchanged  
**Right Panel (Editable Tabs):** Configuration settings including Local Information tab (our test target)

### Available Tabs
1. **Basic Information** (selected by default when page loads)
2. Location Management History
3. **Local Information** ← Test target
4. Currency
5. Pricing
6. Account and Address
7. Legal
8. Notes
9. Shared Setup Locations
10. Auto Add-On

---

## Left Panel - Baseline Fields (READ-ONLY)

**Purpose:** These fields MUST be captured as baseline and verified after saves to ensure no unauthorized changes.

| Field | Type | Selector | Initial Value (Office 1604) | Editable | Notes |
|-------|------|----------|------------------------------|----------|-------|
| Office | textbox | `SetupSelectors.txtOffice` | 1604 | No (disabled) | Primary key field |
| Local Office | textbox | `SetupSelectors.txtLocalOffice` | 1604 | No (disabled) | Same as Office |
| Local Office Name | textbox | `SetupSelectors.txtLocalOfficeName` | Parker Palm Springs | **YES** | Editable name field |
| Active | checkbox | `SetupSelectors.chkActive` | checked | **YES** | Office active status |
| Live Date | date button | `SetupSelectors.btnLiveDate` | May 11th, 2007 | **YES** (popover) | Date picker |
| Tax Mode | dropdown | `SetupSelectors.drpTaxMode` | US | **YES** | Tax calculation mode |
| Country | dropdown | `SetupSelectors.drpCountry` | United States | **YES** | Location country |
| Region | dropdown | `SetupSelectors.drpRegion` | Palm Springs | **YES** | Geographic region |
| Servicing Branch Office | dropdown | `SetupSelectors.drpServicingBranchOffice` | (not selected) | **YES** | Parent office |
| Line Of Business | dropdown | `SetupSelectors.drpLineOfBusiness` | Hotel Services Division | **YES** | Business unit |
| Pay To Address | textbox | `SetupSelectors.txtPayToAddress` | Encore | No (disabled) | Payment address |
| Union | checkbox | `SetupSelectors.chkUnion` | unchecked | **YES** | Union location flag |
| eCommerce Active | checkbox | `SetupSelectors.chkECommerceActive` | checked | No (disabled) | eCommerce enabled |
| Enable Productions Orders | checkbox | `SetupSelectors.chkEnableProductionsOrders` | checked | No (disabled) | Productions flag |

**Baseline Validation Strategy:**
1. Before ANY test runs: Capture all left panel field values as BASELINE
2. After EVERY save operation on Local Information tab: Re-read left panel values
3. Assert all baseline values match original snapshot (no changes allowed)

---

## Local Information Tab - ALL Discovered Fields

### Field Categories

#### 1. Checkboxes with Dependent Spinbuttons/Percentages

| Field Label | Checkbox Selector | Spinner Selector | Initial Value | Enabled | Dependencies |
|-------------|-------------------|------------------|---------------|---------|--------------|
| Apply LDW | `chkApplyLDW` | `spinLDWPercentage` | ✓ checked / 0.04% | YES | Spinner only enabled if checkbox checked |
| Calculate LDW on Net Amount | `chkCalculateLDWonNetAmount` | - | unchecked | YES | - |
| Apply Cables and Consumables Fee | `chkApplyCablesConsumablesFee` | `spinCCPercentage` | unchecked / 0% | YES | Spinner disabled when checkbox unchecked |
| Calculate C&C on Net Amount | `chkCalculateCConNetAmount` | - | unchecked | YES | - |
| Allow ETS | `chkAllowETS` | `spinETSPercentage` | unchecked / 0% | YES | Spinner disabled when checkbox unchecked |
| Service Charge | `chkServiceCharge` | - | ✓ checked | YES | - |
| Show Service Charge As Administrative Fee | `chkShowServiceChargeAsAdministrativeFee` | - | unchecked | YES | - |
| Calculate Service Charge On Net Amount | `chkCalculateServiceChargeOnNetAmount` | - | unchecked | YES | - |
| Allow Resort Tax | `chkAllowResortTax` | `spinResortTaxPercentage` | unchecked / 0% | YES | Spinner disabled when checkbox unchecked |
| Ticker Calc | `chkTickerCalc` | - | ✓ checked | YES | - |
| Set/Strike/Support Labor Billing Goal | - | `spinSetStrikeLaborBillingGoal` | 0.33% | YES | Always editable |
| Enable Set/Strike Labor Minutes | `chkEnableSetStrikeLaborMinutes` | - | ✓ checked | YES | - |
| Apply Set/Strike Labor Minutes | `chkApplySetStrikeLaborMinutes` | - | ✓ checked | YES | - |

#### 2. Standalone Checkboxes

| Field Label | Selector | Initial Value | Enabled | Notes |
|-------------|----------|---------------|---------|-------|
| Internet Asset Reservation | `chkInternetAssetReservation` | unchecked | YES | - |
| Allow DPCD | `chkAllowDPCD` | ✓ checked | YES | - |
| Exclude Implied Discount | `chkExcludeImpliedDiscount` | unchecked | YES | - |
| Prompt for Approval | `chkPromptForApproval` | unchecked | YES | Has dependent Threshold spinbutton |
| Credit Memo Approval Required | `chkCreditMemoApprovalRequired` | ✓ checked | YES | - |
| Enable Discount Reason | `chkEnableDiscountReason` | ✓ checked | YES | - |
| Use eSignature | `chkUseESignature` | ✓ checked | YES | - |
| Enable Product Group | `chkEnableProductGroup` | unchecked | YES | - |
| Allow Production Quote | `chkAllowProductionQuote` | unchecked | YES | - |
| Suppress Day/Rate Discount | `chkSuppressDayRateDiscount` | unchecked | NO (disabled) | Read-only field |
| Warehouse Billing | `chkWarehouseBilling` | unchecked | YES | - |
| Compass Integration | `chkCompassIntegration` | ✓ checked | NO (disabled) | System-controlled |
| Company Remit Tax / GST/HST / VAT Tax | `chkCompanyRemitTax` | ✓ checked | YES | - |
| Display Tax | `chkDisplayTax` | ✓ checked | NO (disabled) | System-controlled |
| Comm Receiver | `chkCommReceiver` | ✓ checked | YES | - |
| Enable IDC Billing | `chkEnableIDCBilling` | unchecked | YES | - |
| Skip Billing | `chkSkipBilling` | unchecked | YES | - |
| Separate Master Bill Commission Invoice | `chkSeparateMasterBillCommissionInvoice` | unchecked | YES | - |
| Show SubRental | `chkShowSubRental` | unchecked | YES | - |
| Inventory Only | `chkInventoryOnly` | unchecked | YES | - |
| Intercompany | `chkIntercompany` | ✓ checked | YES | - |
| Calculate Commission Tax | `chkCalculateCommissionTax` | unchecked | YES | - |
| Can Create External Customer Link | `chkCanCreateExternalCustomerLink` | unchecked | YES | - |
| Offsite Event Location | `chkOffsiteEventLocation` | unchecked | YES | - |
| Exhibit Show Rate | `chkExhibitShowRate` | unchecked | YES | - |
| Enable Job Costing | `chkEnableJobCosting` | ✓ checked | YES | - |
| Enable Discount Guidance | `chkEnableDiscountGuidance` | ✓ checked | YES | - |
| Enable Proposal | `chkEnableProposal` | ✓ checked | YES | - |

#### 3. Radio Button Groups

| Field Label | Radio Options | Selector | Initial Value | Enabled |
|-------------|---------------|----------|---------------|---------|
| Billing Type | Master / Direct | `rdoBillingTypeMaster`, `rdoBillingTypeDirect` | Master (checked) | YES |
| Billing Way | Event / Daily | `rdoBillingWayEvent`, `rdoBillingWayDaily` | Event (checked) | YES |

#### 4. Text Inputs

| Field Label | Selector | Type | Initial Value | Enabled |
|-------------|----------|------|---------------|---------|
| Oracle Product | `txtOracleProduct` | text | 0000 | YES |
| Oracle Department | `txtOracleDepartment` | text | 900 | YES |

#### 5. Dropdowns

| Field Label | Selector | Initial Value | Enabled |
|-------------|----------|---------------|---------|
| Billing Cycle | `drpBillingCycle` | Weekly | NO (disabled) |
| Oracle Organization | `drpOracleOrganization` | Encore US BU | YES |

#### 6. Date/Button Controls

| Field Label | Selector | Type | Initial Value | Enabled |
|-------------|----------|------|---------------|---------|
| Effective Date | `btnEffectiveDate` | date popover | May 11th, 2007 | NO (disabled) |
| Threshold | `spinThreshold` | spinbutton | 0% | NO (disabled when Prompt for Approval unchecked) |

**Save Button:** `SetupSelectors.btnSaveLocalInfo: 'button:has-text("Save")'`  
**Save Button Initial State:** Disabled (becomes enabled when any field changes)

---

## Test Scenario 1: TC-LOC-001 - Navigate to Office 1604

**Test Case Reference:** `specs_planning/test-cases/locations/local-information-test-cases.md` TC-LOC-001  
**Related Cases:** TC-LOC-003 (tab access validation)

**Preconditions:**
- User authenticated to Navigator Cloud
- Session active

**Steps:**
1. Click Setup button in top navigation  
   - Selector: `SetupSelectors.btnSetupMenu`
   - Expected: Dropdown menu expands

2. Click "Location" menu item  
   - Selector: `SetupSelectors.lnkLocation`
   - Expected: Navigate to `locations`, search page appears

3. Enter "1604" in Local Office search field  
   - Selector: `SetupSelectors.txtLocalOfficeSearch`
   - Input: "1604"
   - Expected: Text appears in search field

4. Click Search button  
   - Selector: `SetupSelectors.btnSearch`
   - Expected: Results grid displays with offic 1604

5. Click "1604" link in gridresults (or click office name "The Parker Palm Springs")  
   - Selector: `SetupSelectors.lnkOfficeCode('1604')`
   - Expected: Navigate to `locations/1604/settings`, Basic Information page loads

6. Wait for page to fully render  
   - Expected: Both panels (left baseline panel + right tabs panel) visible
   - Expected: "Basic Information" tab selected by default
   - Expected: URL: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings`

**Success Criteria:**
- Office 1604 detail page loads successfully
- Basic Information tab selected
- Left panel shows all baseline fields
- Right panel shows tab list with Local Information tab

---

## Test Scenario 2: TC-LOC-002 - Capture Baseline Snapshot

**Test Case Reference:** `specs_planning/test-cases/locations/local-information-test-cases.md` TC-LOC-002

**Preconditions:**
- Test Case TC-LOC-001 passed
- User on office 1604 Basic Information page

**Steps:**
1. Read all LEFT PANEL field values  
   - Loop through all SetupSelectors.txt*, SetupSelectors.chk*, SetupSelectors.drp*, SetupSelectors.btn* for baseline fields
   - Store values in baseline snapshot object: `{ fieldName: value }`
   - Expected: All 14 baseline fields captured

2. Verify baseline fields are read-only where expected  
   - Assert `txtOffice` is disabled
   - Assert `txtLocalOffice` is disabled
   - Assert `txtPayToAddress` is disabled
   - Assert `chkECommerceActive` is disabled
   - Assert `chkEnableProductionsOrders` is disabled
   - Expected: Disabled fields cannot be modified

3. Log baseline values for reference  
   - Log full baseline snapshot to test output
   - Expected: Baseline logged with 14 fields

**Success Criteria:**
- Baseline snapshot captured with all 14 left panel fields
- Snapshot stored in test memory for later validation
- All disabled fields verified as non-editable

**Baseline Snapshot Structure:**
```typescript
interface BaselineSnapshot {
  txtOffice: string;              // "1604"
  txtLocalOffice: string;         // "1604"
  txtLocalOfficeName: string;     // "Parker Palm Springs"
  chkActive: boolean;             // true
  btnLiveDate: string;            // "May 11th, 2007"
  drpTaxMode: string;             // "US"
  drpCountry: string;             // "United States"
  drpRegion: string;              // "Palm Springs"
  drpServicingBranchOffice: string; // "" or selected value
  drpLineOfBusiness: string;      // "Hotel Services Division"
  txtPayToAddress: string;        // "Encore"
  chkUnion: boolean;              // false
  chkECommerceActive: boolean;    // true
  chkEnableProductionsOrders: boolean; // true
}
```

---

## Test Scenario 3: TC-LOC-013 - Full Random Modification with Persistence

**Test Case Reference:** `specs_planning/test-cases/locations/local-information-test-cases.md` TC-LOC-013  
**Related Cases:** TC-LOC-004 (text fields), TC-LOC-005 (dropdown), TC-LOC-006 (radios), TC-LOC-007-008 (dependencies), TC-LOC-009 (checkboxes), TC-LOC-010 (boundaries), TC-LOC-011 (partial), TC-LOC-012 (zero-change), TC-LOC-014 (disabled), TC-LOC-015 (state transitions)

**Preconditions:**
- TC-LOC-002 passed (baseline captured)
- User on office 1604 Basic Information page

**Steps:**

### Step 1: Click Local Information Tab
- Selector: `SetupSelectors.tabLocalInformation`
- Expected: Local Information tab becomes selected
- Expected: Local Information panel displays with all fields visible

### Step 2: Randomization Logic (Generator Implementation)

**For each editable field:**

1. **Random Decision:** Skip OR Modify (Coin flip - true random, no fixed percentage)

2. **If Modify:**

   **Checkboxes:**
   - Random action: Check OR Uncheck (50/50 random)
   - Store: `{ fieldName: { original: boolean, new: boolean } }`

   **Spinbuttons/Percentages:**
   - Generate random percentage: 0.01% to 99.99% (random float)
   - Store: `{ fieldName: { original: string, new: string } }`

   **Radio Groups:**
   - Randomly select one of the available options
   - Store: `{ fieldName: { original: string, new: string } }`

   **Textboxes:**
   - Generate random alphanumeric string (length: 4-20 characters, random)
   - Store: `{ fieldName: { original: string, new: string } }`

   **Dropdowns:**
   - Get all available options from dropdown
   - Randomly select any option (exclude current selection if possible)
   - Store: `{ fieldName: { original: string, new: string } }`

3. **Store Modifications:**
   - All modifications stored in test memory object
   - Structure: `Map<fieldName, {original: value, new: value}>`

### Step 3: Click Save Button
- Selector: `SetupSelectors.btnSaveLocalInfo`
- Expected: Save button becomes enabled after first field change
- Expected: Save operation triggers
- Expected: Success notification appears (or page reloads, or button disables)

### Step 4: Wait for Save Completion
- Wait for save confirmation (check for notifications, button state change, or page reload)
- Expected: Save completes without errors
- Expected: No error messages displayed

### Step 5: Refresh Page
- Navigate away (click "Back to Location Search")
- Navigate back to office 1604 (repeat TC-LOC-001 steps 3-6)
- Navigate to Local Information tab
- Expected: Page reloads with saved values

### Step 6: Validate Baseline (Left Panel Unchanged)
- Re-read all left panel fields
- Compare with baseline snapshot from TC-LOC-002
- Assert: ALL baseline values match original snapshot (no changes)
- Expected: **100% match - left panel NEVER changes**

### Step 7: Validate Local Information (Right Panel Changes Persisted)
- For each field in modifications map:
  - Re-read field value from page
  - Compare with `modifications[fieldName].new`
  - Assert: Field value matches stored new value
- Expected: **ALL modified field values match what was saved**

**Success Criteria:**
- Random modifications applied successfully (non-deterministic, varies per run)
- Save operation completes without errors
- Baseline validation passes (left panel unchanged)
- Persistence validation passes (right panel changes retained)
- Test memory accurately tracks all modifications

---

## Randomization Requirements for Generator Agent

**Critical:** Randomization MUST be truly random, non-deterministic.

### Field Type Handlers

**1. Checkbox Fields:**
```typescript
async randomizeCheckbox(selector: string): Promise<{original: boolean, new: boolean}> {
  const original = await checkbox.isChecked();
  const action = Math.random() > 0.5 ? 'check' : 'uncheck';
  if (action === 'check' && !original) await checkbox.check();
  if (action === 'uncheck' && original) await checkbox.uncheck();
  return { original, new: await checkbox.isChecked() };
}
```

**2. Spinbutton/Percentage Fields:**
```typescript
async randomizeSpinbutton(selector: string): Promise<{original: string, new: string}> {
  const original = await spinbutton.inputValue();
  const randomPercent = (Math.random() * 99.99).toFixed(2); // 0.01 to 99.99
  await spinbutton.fill(randomPercent);
  return { original, new: randomPercent };
}
```

**3. Radio Groups:**
```typescript
async randomizeRadioGroup(options: Locator[]): Promise<{original: string, new: string}> {
  const original = await getCheckedRadio();
  const randomIndex = Math.floor(Math.random() * options.length);
  await options[randomIndex].check();
  return { original, new: await getCheckedRadio() };
}
```

**4. Textbox Fields:**
```typescript
async randomizeTextbox(selector: string): Promise<{original: string, new: string}> {
  const original = await textbox.inputValue();
  const length = Math.floor(Math.random() * 17) + 4; // 4-20 chars
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomString = Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  await textbox.fill(randomString);
  return { original, new: randomString };
}
```

**5. Dropdown Fields:**
```typescript
async randomizeDropdown(selector: string): Promise<{original: string, new: string}> {
  const original = await dropdown. textContent();
  const options = await dropdown.locator('option').allTextContents();
  const filteredOptions = options.filter(opt => opt !== original);
  const randomOption = filteredOptions[Math.floor(Math.random() * filteredOptions.length)];
  await dropdown.selectOption(randomOption);
  return { original, new: randomOption };
}
```

**Field Modification Decision:**
```typescript
const shouldModify = Math.random() > 0.5; // True random, 50/50 per field
```

---

## Field Dependencies & Validation Rules

**Checkbox -- Spinbutton Dependencies:**
1. `chkApplyLDW` checked -- `spinLDWPercentage` enabled
2. `chkApplyCablesConsumablesFee` checked -- `spinCCPercentage` enabled
3. `chkAllowETS` checked -- `spinETSPercentage` enabled
4. `chkAllowResortTax` checked -- `spinResortTaxPercentage` enabled
5. `chkPromptForApproval` checked -- `spinThreshold` enabled

**Generator Agent Validation:**
- Before modifying dependent spinbutton, ensure parent checkbox is checked
- If parent checkbox is unchecked, skip spinbutton modification

---

## Known Issues & Edge Cases

1. **Save Button Behavior:**
   - Disabled initially
   - Becomes enabled after ANY field change
   - After successful save, may return to disabled state OR reload page
   - Generator must handle both behaviors

2. **Disabled Fields:**
   - Some checkboxes are system-controlled and cannot be modified
   - Generator must check `.isDisabled()` before attempting modification
   - Skip disabled fields in randomization loop

3. **Field Dependencies:**
   - Nested dependencies exist (checkbox enables spinbutton)
   - Randomizing parent checkbox may affect child field state
   - Generator must handle cascading enabling/disabling

4. **Page Reload vs In-Place Save:**
   - Application might reload page after save OR update in-place
   - Generator must handle both scenarios when verifying persistence

---

## Generator Agent Implementation Notes

**Page Object Structure:**
```typescript
// src/pages/setup.page.ts
export class SetupPage extends BasePage {
  async navigateToOffice(officeCode: string): Promise<void> {
    await this.clickWithRetry('btnSetupMenu');
    await this.clickWithRetry('lnkLocation');
    await this.fillWithValidation('txtLocalOfficeSearch', officeCode);
    await this.clickWithRetry('btnSearch');
    await this.clickWithRetry(SetupSelectors.lnkOfficeCode(officeCode));
  }
  
  async captureBaseline(): Promise<BaselineSnapshot> {
    // Capture all left panel field values
  }
  
  async randomizeLocalInformation(): Promise<ModificationMap> {
    // Implement randomization logic per field type
  }
  
  async validateBaseline(baseline: BaselineSnapshot): Promise<boolean> {
    // Re-read left panel, compare with baseline
  }
  
  async validatePersistence(modifications: ModificationMap): Promise<boolean> {
    // Re-read modified fields, compare with saved values
  }
}
```

**Test Spec Structure:**
```typescript
// tests/specs/navigator/select-location-local-information.spec.ts
import { test, expect } from '../../setup/fixtures';

test.describe('Setup > Location > Local Information', () => {
  let baseline: BaselineSnapshot;
  let modifications: ModificationMap;
  
  test('TC-LOC-001: Navigate to office 1604', async ({ setupPage }) => {
    await setupPage.navigateToOffice('1604');
    // Assertions...
  });
  
  test('TC-LOC-002: Capture baseline snapshot', async ({ setupPage }) => {
    baseline = await setupPage.captureBaseline();
    // Store in test context...
  });
  
  test('TC-LOC-013: Full random field modification + validation', async ({ setupPage }) => {
    await setupPage.clickTab('tabLocalInformation');
    modifications = await setupPage.randomizeLocalInformation();
    await setupPage.saveLocalInformation();
    await setupPage.navigateToOffice('1604'); // Refresh
    await setupPage.clickTab('tabLocalInformation');
    
    // Validate baseline unchanged
    expect(await setupPage.validateBaseline(baseline)).toBe(true);
    
    // Validate modifications persisted
    expect(await setupPage.validatePersistence(modifications)).toBe(true);
  });
});
```

---

---

## Scenario: TC-LOC-LI-062 - Verify left panel disabled state for 5 fields

1. Navigate to `locations/1604/settings`: page loads, left panel visible
2. Verify `textbox[name="Office"][disabled]` exists: expected disabled attribute = true
3. Verify `textbox[name="Local Office"][disabled]` exists: expected disabled attribute = true
4. Verify `textbox[name="Pay To Address"][disabled]` exists: expected disabled attribute = true
5. Verify `checkbox[aria-label="eCommerce Active"][disabled]` exists: expected disabled attribute = true
6. Verify `checkbox[aria-label="Enable Productions Orders"][disabled]` exists: expected disabled attribute = true
7. Attempt to type into `textbox[name="Office"]`: expected no value change (disabled, unresponsive)

---

## Scenario: TC-LOC-LI-063 - Verify left panel static display values for Office 1604

1. Navigate to `locations/1604/settings`: page loads, left panel visible
2. Get value of `textbox[name="Office"]`: expected value = "1604"
3. Get value of `textbox[name="Local Office"]`: expected value = "1604"
4. Get value of `textbox[name="Pay To Address"]`: expected value = "Encore"
5. Get checked state of `checkbox[aria-label="eCommerce Active"]`: expected checked = true
6. Get checked state of `checkbox[aria-label="Enable Productions Orders"]`: expected checked = true
7. Toggle any Local Information field and click shared Save button: save completes
8. Re-verify all 5 left-panel values: expected all unchanged (right-panel saves do NOT mutate left panel)

---

## Scenario: TC-LOC-LI-064 - Verify Ticker Calc checkbox default state and toggle persistence

1. Navigate to Local Information tab: tab loads
2. Verify `term:has-text("Ticker Calc") ~ definition input[type="checkbox"]` checked state: expected checked = true
3. Uncheck Ticker Calc checkbox: unchecked, Save enabled
4. Click shared Save button: save completes
5. Reload page and navigate to Local Information tab: tab loads
6. Verify Ticker Calc checked state: expected checked = false (persisted)
7. Re-check Ticker Calc: checked, Save enabled
8. Click Save and reload: verify Ticker Calc = true (restored)

---

## Scenario: TC-LOC-LI-065 - Verify Service Charge group checkboxes default state and persistence

1. Navigate to Local Information tab: tab loads
2. Verify `term:has-text("Service Charge") ~ definition input[type="checkbox"]` checked state: expected checked = true
3. Verify `term:has-text("Show Service Charge As Administrative Fee") ~ definition input[type="checkbox"]` checked state: expected checked = false
4. Verify `term:has-text("Calculate Service Charge On Net Amount") ~ definition input[type="checkbox"]` checked state: expected checked = false
5. Check Show Service Charge As Administrative Fee: checked, no cascade effects
6. Check Calculate Service Charge On Net Amount: checked, no cascade effects
7. Click Save and reload: expected both persist as checked
8. Uncheck both, Save, reload: expected both persist as unchecked

---

## Scenario: TC-LOC-LI-066 - Verify Enable Job Costing and Enable Proposal default state and persistence

1. Navigate to Local Information tab: tab loads
2. Verify `term:has-text("Enable Job Costing") ~ definition input[type="checkbox"]` checked state: expected checked = true
3. Verify `term:has-text("Enable Proposal") ~ definition input[type="checkbox"]` checked state: expected checked = true
4. Uncheck Enable Job Costing: unchecked, no dependency triggered on other fields
5. Uncheck Enable Proposal: unchecked, no dependency triggered
6. Click Save and reload: expected both persist as unchecked
7. Re-check both, Save, reload: expected both persist as checked

---

## Test Case Coverage Summary

**63 Granular Test Cases Created** (see `specs_planning/test-cases/locations/locations_local_information_test_cases.md`):
> Note: ID range TC-LOC-LI-001–066 with TC-049, TC-050, TC-056 removed (Legal scope + ProposalPilot field doesn't exist).

**Navigation & Setup:**
- TC-LOC-LI-001: Navigate to office 1604 Local Information tab

**Field Dependencies (checkbox -- spinbutton):**
- TC-LOC-LI-002 to TC-LOC-LI-007A: Apply LDW, C&C Fee, ETS, Resort Tax, Dual-dependency Threshold, Skip Billing -- Oracle fields

**Boundary Value Testing (spinbuttons):**
- TC-LOC-LI-009 to TC-LOC-LI-025A: 9 boundary values × 5 spinbuttons (LDW, C&C, ETS, Resort Tax, Threshold)

**Required Field Validations:**
- TC-LOC-LI-026 to TC-LOC-LI-029: Oracle Product, Oracle Department, Oracle Organization maxLength; Billing Cycle required

**Radio Groups & Textboxes:**
- TC-LOC-LI-030 to TC-LOC-LI-039: Billing Type, Billing Way API, Effective Date, Oracle textboxes

**Permission-Based States:**
- TC-LOC-LI-040 to TC-LOC-LI-044: canEditLoc=false disables conditional fields; Compass Integration; Display Tax auto-set

**Country-Based & Union Rules:**
- TC-LOC-LI-045 to TC-LOC-LI-047: USA vs international CountryId rules; ETS union-based defaults

**Standalone Checkboxes (persist/toggle):**
- TC-LOC-LI-048 to TC-LOC-LI-061: Credit Memo, Discount Reason, eSignature, Product Group, Allow Production Quote, Suppress Day/Rate Discount (always-disabled)

**Left Panel Read-Only Verification:**
- TC-LOC-LI-062: Left panel 5 disabled fields verify non-interactive
- TC-LOC-LI-063: Left panel exact values (Office=1604, Local Office=1604, Pay To Address=Encore, eCommerce Active=checked+disabled, Enable Productions Orders=checked+disabled)

**Coverage Gap Fields (live-verified 2026-02-18):**
- TC-LOC-LI-064: Ticker Calc default=checked, independent toggle, persist
- TC-LOC-LI-065: Service Charge group (Service Charge=checked, Show As Admin Fee=unchecked, Calc On Net=unchecked), all independent
- TC-LOC-LI-066: Enable Job Costing=checked, Enable Proposal=checked, independent, persist

**Coverage:** Navigation ✓ | Baseline ✓ | Field types ✓ | Dependencies ✓ | Boundaries ✓ | Edge cases ✓ | State transitions ✓ | Left panel read-only ✓ | Coverage gaps ✓

---

## Artifacts & Deliverables

**Created by Planner:**
- ✅ Test Plan: `specs_planning/test-plans/locations/locations_local_information_test_plan.md` (this file)
- ✅ Selectors: Added to `src/selectors/index.ts` (SetupSelectors object with 80+ selectors; left-panel selectors confirmed via live DOM)
- ✅ Test Cases: `specs_planning/test-cases/locations/locations_local_information_test_cases.md` (63 granular scenarios, TC-LOC-LI-001 to TC-LOC-LI-066 with TC-049/050/056 removed)

**To Be Created by Generator:**
- Page Object: `src/pages/setup.page.ts`
- Test Spec: `tests/specs/locations/local-information.spec.ts`
- Barrel Export: Update `src/pages/index.ts` to export SetupPage
- Fixture: Add `setupPage` to `tests/setup/fixtures.ts`

---

## Discovery Notes

**Planner Observations:**
- Total fields discovered: **53 total fields** in Local Information tab (52 interactive + 1 always-disabled: Suppress Day/Rate Discount)
- Field types breakdown: Checkboxes (~36 editable, 3 context-disabled: Compass Integration, Display Tax, Suppress Day/Rate Discount), Spinbuttons (6), Radio groups (2), Textboxes (2), Dropdowns (2: Oracle Organization, Billing Cycle), Date picker (1: Effective Date)
- Page uses `<term>` and `<definition>` HTML elements for labeled field pairs
- Consistent selector pattern: `term:has-text("Label") ~ definition input[type="..."]`
- Save button: left-panel shared Save (disabled -- enabled on change -- disabled after save). Pricing tab has its OWN dedicated Save button (always enabled when Pricing tab open)
- Application uses route-based navigation: `locations/{officeCode}/settings`
- Left panel: Office, Local Office, Pay To Address = read-only textboxes; eCommerce Active, Enable Productions Orders = read-only checked checkboxes
- Live DOM verified 2026-02-18: all field states, values, disabled states confirmed via accessibility snapshot

**REQUIREMENTS.md Discrepancy Noted:**
- Menu item is "Location" not "Select Location"
- Updated `specs_planning/_internal/agent-mistakes.md` with MISTAKE-PLN-001

**Generator Recommendations:**
- Use Page Object inheritance from BasePage for retry/validation logic
- Implement field-type-specific randomization methods
- Store modifications in TypeScript Map for type safety
- Use Playwright's `.isDisabled()` to skip uneditable fields
- Implement baseline snapshot as strongly-typed interface
- Consider creating SetupPage.randomFieldSelector() to randomly choose which fields to modify

---

**Planner Agent Completion**: 2026-02-18 (live re-verified all 3 tabs + left panel)  
**Ready for Generator Agent**: YES  
**All selectors discovered**: YES (live DOM confirmed on 2026-02-18)  
**Test cases created**: 63 granular scenarios (TC-LOC-LI-001 to TC-LOC-LI-066, TC-049/050/056 removed)  
**Example test patterns referenced**: `tests/examples/*.spec.ts`
