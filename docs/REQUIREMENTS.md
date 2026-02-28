# Navigator Cloud Test Automation Requirements

> **Purpose**: Static knowledge base describing the Navigator Cloud application features, structure, and behaviors. Agents READ this to understand the website before exploring, planning, and generating tests.
>
> **This file is NOT modified by agents.** Only the team updates this document. Agents record element discoveries in `specs_planning/test-cases/*.md` files instead.

**Target Application**: [Navigator Cloud Dev Environment](https://ca-nginx-dev.proudmoss-1eeb612c.centralus.azurecontainerapps.io/navigator/)

---

## Authentication System

Navigator Cloud uses **Microsoft SSO (Single Sign-On)** with **TOTP-based 2FA (Two-Factor Authentication)**.

### Login Flow
1. User navigates to the Navigator Cloud base URL
2. Application shows a sign-in page with a "Continue Now" button
3. Clicking "Continue Now" redirects to Microsoft login (login.microsoftonline.com)
4. Microsoft login page appears with:
   - Email/username field (`input[type="email"][name="loginfmt"]`)
   - "Next" button
5. After entering email and clicking Next:
   - Password field appears (`input[type="password"][name="passwd"]`)
   - "Sign in" button appears
6. After password submission:
   - If MFA is required: TOTP code input field appears (`input[name="otc"]`)
   - User must enter 6-digit code from Microsoft Authenticator app
   - "Verify" button submits the code
7. Optional "Stay signed in?" prompt may appear:
   - "Yes" button keeps session alive longer
   - "No" button creates temporary session
8. After authentication, Microsoft redirects back to Navigator Cloud
9. User lands on Navigator Cloud home page (URL: .../navigator/locations/{officeId}/home)

### Session Behavior
- Sessions last approximately 8 hours before expiring
- Expired sessions redirect back to Microsoft login
- Session state is stored in browser cookies and localStorage
- Session can be saved and reused via Playwright `storageState`

### MFA/TOTP Details
- OTP codes are generated using TOTP algorithm (Time-based One-Time Password)
- Base32-encoded secret is stored in credential vault
- Codes are 6 digits, valid for 30 seconds
- Framework uses `otplib` npm package for code generation

---

## Application Structure

Navigator Cloud is a modern web application built with Radix UI that loads after authentication.

### Known Features
- Home/dashboard view with sidebar navigation
- Setup module with Location Settings (Basic Information, Local Information, Currency, Pricing, etc.)
- Sidebar navigation with Setup, Home, and other modules
- User profile/settings menu
- Logout functionality
- Search functionality

### URL Structure
Navigator Cloud uses path-based routing (e.g., `.../navigator/locations/1604/settings/location`).
Key routes:
- Home: `/navigator/locations/{officeId}/home`
- Settings: `/navigator/locations/{officeId}/settings/location`
- Sign-in: `/navigator/auth/sign-in`

### UI Framework
- Built with **Radix UI** components (replaces Angular)
- Extensive use of `data-testid` attributes for test automation
- No Angular bundle download delays

---

## Known Issues & Workarounds

### Microsoft Login Detection
- Framework must detect when redirected to Microsoft login page
- Check for URL containing `login.microsoftonline.com`
- Error handling for invalid credentials (error div: `#usernameError, #passwordError`)

### Session Timeout Handling
- Monitor page for unexpected redirects to Microsoft login
- If session expires mid-test, trigger re-authentication
- Session expiry is detected by URL change to `login.microsoftonline.com`

---

## Discovery Tasks for Agents

**Planner Agent must discover:**
- Dashboard layout and structure
- Navigation menu selectors and module names
- User menu selectors (profile, logout)
- Search functionality selectors
- Common UI patterns (buttons, forms, notifications)
- Module-specific selectors as test scenarios are defined

**All discoveries should be recorded in:**
- `src/selectors/index.ts` (TypeScript selectors)
- `specs_planning/test-cases/*.md` (test case documentation)
- `specs_planning/test-plans/*.md` (technical automation plans)

---

## Test Data Strategy

Test credentials are stored in encrypted vault (`config/secrets/.vault.enc`):
- `NAVIGATOR_USERNAME` - Microsoft SSO email
- `NAVIGATOR_PASSWORD` - Microsoft SSO password
- `NAVIGATOR_MFA_SECRET` - Base32 TOTP seed for 2FA

The `Vault` class implementation lives in `src/security/vault.ts` (AES-256-GCM encryption). A backward-compatible re-export exists at `config/secrets/vault.ts` for script consumers. Vault is decrypted at runtime using `VAULT_PASSPHRASE` environment variable (never stored in files).

---

## Application Features

**Status**: Navigator Cloud application features will be documented here as they are discovered during test planning and execution.

**Current Knowledge**:
- Authentication: Microsoft SSO with TOTP 2FA (documented above)
- Session Management: 8-hour session persistence via authenticated session fixture
- Technology: Modern web application with Radix UI, path-based routing, data-testid attributes

**Discovery Process**:
1. Planner agent explores the application after successful login
2. Interactive elements, navigation patterns, and user flows are documented
3. Element selectors are stored in `src/selectors/index.ts`
4. Test cases are documented in `specs_planning/test-cases/*.md`
5. This file remains READ-ONLY for agents — discoveries go to test case files

---

### Setup Module

#### Select Location Feature

Accessible via: Dashboard → "Setup" menu (top navigation) → "Select Location"

**Purpose**: Configure and manage location/office-specific settings.

**Workflow**:
1. User clicks "Setup" in top navigation → Dropdown expands
2. User selects "Select Location" from dropdown
3. Search page appears with "Local Office" field
4. User enters office code (e.g., "1604") and searches
5. Results display in table with columns including "Local Office"
6. User clicks office code in results (e.g., "1604" in Local Office column)
7. "Basic Information" page opens with two-panel layout:
   - **Left Panel**: Basic Information master data (see field details below)
   - **Right Panel**: 8 editable configuration tabs: Local Information (default), Currency, Pricing, Account and Address, Legal, Notes, Shared Setup Locations, Auto Add-On

**Page Layout**:
- **Save button** (top area of left panel): Present for Basic Information fields; [disabled] until content changes
- **Pricing-specific Save** (top-right inside Pricing tabpanel): Separate Save button unique to the Pricing tab, always enabled when Pricing tab is open
- **Legal-specific Save** (top-right inside Legal tabpanel): Separate Save button, disabled by default until Legal data changes
- **Other tabs** (Local Information, Currency, Account & Address, Notes, Shared Setup Locations, Auto Add-On): No dedicated Save button — rely on the main left-panel Save
- Two outer tabs: "Basic Information" (active), "Location Management History"

**Left Panel — Basic Information**:
Test strategy: treat as read-only baseline — do NOT modify in tests.
Technically disabled (cannot interact): Office, Local Office, Pay To Address, eCommerce Active, Enable Productions Orders
Technically editable (but excluded from test edits): Local Office Name, Active, Live Date, Tax Mode, Country, Region, Servicing Branch Office, Line Of Business, Union

**Right Panel Tabs** (8 tabs total):
Local Information | Currency | Pricing | Account and Address | Legal | Notes | Shared Setup Locations | Auto Add-On

---

### Local Information Tab — Complete Field Inventory

**Left Column** (top to bottom):

| Field | Type | Default State (Office 1604) | Dependency |
|---|---|---|---|
| Apply LDW | checkbox | ✓ checked | independent |
| LDW Percentage | spinbutton % | 0.04 | enabled only when Apply LDW ✓ |
| Calculate LDW on Net Amount | checkbox | unchecked | independent |
| Apply Cables and Consumables Fee | checkbox | unchecked | independent |
| C&C Percentage | spinbutton % | 0 | disabled when Apply C&C unchecked |
| Calculate C&C on Net Amount | checkbox | — | disabled when Apply C&C unchecked |
| Allow ETS | checkbox | unchecked | independent |
| ETS Percentage | spinbutton % | 0 | disabled when Allow ETS unchecked |
| Service Charge | checkbox | ✓ checked | independent |
| Show Service Charge As Administrative Fee | checkbox | unchecked | independent |
| Calculate Service Charge On Net Amount | checkbox | unchecked | independent |
| Allow Resort Tax | checkbox | unchecked | independent |
| Resort Tax Percentage | spinbutton % | 0 | disabled when Allow Resort Tax unchecked |
| Ticker Calc | checkbox | ✓ checked | independent |
| Set/Strike/Support Labor Billing Goal | spinbutton % | 0.33 | independent |
| Enable Set/Strike Labor Minutes | checkbox | ✓ checked | independent |
| Apply Set/Strike Labor Minutes | checkbox | ✓ checked | independent |
| Internet Asset Reservation | checkbox | unchecked | independent |
| Allow DPCD | checkbox | ✓ checked | requires IsCommReceiver=true |
| Exclude Implied Discount | checkbox | unchecked | independent |
| Prompt for Approval | checkbox | unchecked | independent |
| Threshold | spinbutton % | 0 | disabled when Allow DPCD=true OR Prompt for Approval=false |
| Credit Memo Approval Required | checkbox | ✓ checked | independent |
| Enable Discount Reason | checkbox | ✓ checked | independent |
| Use eSignature | checkbox | ✓ checked | independent |
| Enable Product Group | checkbox | unchecked | independent |
| Allow Production Quote | checkbox | unchecked | independent |
| Suppress Day/Rate Discount | checkbox | — | always disabled (technical constraint) |

**Right Column** (top to bottom):

| Field | Type | Default State (Office 1604) | Dependency |
|---|---|---|---|
| Billing Type | radio (Master / Direct) | Master | independent |
| Billing Way | radio (Event / Daily) | Event | independent |
| Effective Date | date picker | May 11th, 2007 | disabled by default; enabled only when Billing Way changes (changeBillWayActive=true) |
| Billing Cycle | dropdown | Weekly | disabled when billing has run (localBillingRan=true); info icon (?) always visible |
| Warehouse Billing | checkbox | unchecked | independent |
| Oracle Product | text input | 0000 | required when Skip Billing is unchecked |
| Oracle Department | text input | 900 | required when Skip Billing is unchecked |
| Oracle Organization | dropdown | Encore US BU | required when Skip Billing is unchecked |
| Compass Integration | checkbox | ✓ checked | disabled for existing locations (enabled only on new location creation) |
| Company Remit Tax / GST/HST / VAT Tax | checkbox | ✓ checked | independent (code: HRIRemitTax) |
| Display Tax | checkbox | ✓ checked | disabled and auto-set to true when Company Remit Tax OR Company Remit Tax 2 is checked |
| Comm Receiver | checkbox | ✓ checked | independent (code: IsCommReceiver) |
| Enable IDC Billing | checkbox | unchecked | disabled when Intercompany=false |
| Skip Billing | checkbox | unchecked | controls Oracle field requirements |
| Separate Master Bill Commission Invoice | checkbox | unchecked | independent |
| Show SubRental | checkbox | unchecked | disabled when Comm Receiver=false |
| Inventory Only | checkbox | unchecked | independent |
| Intercompany | checkbox | ✓ checked | independent (code: InternalCompany) |
| Calculate Commission Tax | checkbox | unchecked | independent |
| Can Create External Customer Link | checkbox | unchecked | independent |
| Offsite Event Location | checkbox | unchecked | independent |
| Exhibit Show Rate | checkbox | unchecked | independent |
| Enable Job Costing | checkbox | ✓ checked | independent |
| Enable Discount Guidance | checkbox | ✓ checked | independent |
| Enable Proposal | checkbox | ✓ checked | independent |

**Validation Requirements**:
- Right panel edits must persist after save + reload
- Left panel data must remain unchanged after right-panel save (baseline assertion)

### Field Validation Rules (Component: location-detail-local-information.component.ts)

#### Effective Date (code: BillingWayEffectiveDate)
- **Rule**: Date cannot be in the past
- **Method**: `validateBillWayDate()`
- **Error Key**: `pastDate`
- **Condition**: Date must be >= today (midnight)
- **Error Message**: `ERR_BILLINGWAY_DATE`
- **State**: Disabled by default; enabled only when Billing Way is actively changed (changeBillWayActive=true)
- **Live verification**: Field shows "May 11th, 2007" [disabled] — activates when Billing Way radio is switched

#### Oracle Organization (code: OracleOrgId)
- **Rule**: Required when Skip Billing is unchecked
- **Method**: `validateOracleOrg()`
- **Error Key**: `billingReq`
- **Condition**: If Skip Billing=false and OracleOrgId < 1
- **Error Message**: `ERR_REQUIRED`
- **UI**: Dropdown field

#### Oracle Product (code: OracleProductCode)
- **Rule**: Required when Skip Billing is unchecked
- **Max Length**: 25 characters
- **Error Message**: `ERR_REQUIRED`
- **UI**: Text input

#### Oracle Department (code: OracleDeptCode)
- **Rule**: Required when Skip Billing is unchecked
- **Max Length**: 25 characters
- **Error Message**: `ERR_REQUIRED`
- **UI**: Text input

#### Billing Cycle (code: BillingCycleID)
- **Rule**: Required field, cannot be 0
- **Visual Indicator**: Exclamation icon when value is 0 or has required error; question mark (ⓘ) info icon always visible
- **Error Message**: `ERR_REQUIRED`
- **Special Case**: Disabled when billing has already run (`localBillingRan=true`)
- **Live verification**: field shows "Weekly" [disabled] for location 1604 — billing has already run

### Legal Data Validations

See [Legal Tab](#legal-tab) for full validation rules (ServiceChargeId, TermsConditionsId).

### API-Dependent Validations

#### Billing Way Change (UI: "Billing Way" radio + "Effective Date" field)
- **API**: `locationService.checkBillWayChange()`
- **Method**: `changeBillWay()`
- **Trigger**: User switches Billing Way radio (Event ↔ Daily)
- **Rule**: Cannot change if unbilled orders exist
- **Error Message**: `ERR_BILLINGWAY_UNBILLED_ORDERS`
- **On Success**: Enables "Effective Date" field (changeBillWayActive=true), sets date to today
- **On Error**: Reverts "Billing Way" to previous value

#### Billing Cycle Change (UI: "Billing Cycle" dropdown)
- **API**: `locationService.checkBillCycleChange()`
- **Method**: `checkLocalBillingRan()`
- **Trigger**: User changes Billing Cycle dropdown value
- **Rule**: Cannot change if billing has already run for this location
- **On Success** (API returns data > 0): Disables "Billing Cycle" field (localBillingRan=true)
- **On Error**: Shows alert, sets `localBillingRan = true`

### Conditional Field States & Rules

> UI labels used below. Code names provided in parentheses for reference.

#### Apply LDW (IsLDWEnabled) → LDW Percentage
- **LDW Percentage Disabled When**: Apply LDW unchecked OR `!canEditLoc`
- **Reset to 0**: When Apply LDW is unchecked

#### Apply Cables and Consumables Fee (IsCablesAndConsumablesEnabled) → C&C Percentage
- **C&C Percentage Disabled When**: Apply C&C unchecked OR `!canEditLoc`
- **Calculate C&C on Net Amount Disabled When**: Apply C&C unchecked
- **Reset to 0**: When Apply C&C is unchecked

#### Allow ETS → ETS Percentage
- **ETS Percentage Disabled When**: Allow ETS unchecked OR `!canEditLoc`
- **Default Values when Allow ETS is checked**:
  - `0.24` if Union = true
  - `0.23` if Union = false
  - ⚠️ **Live Note**: ETS defaults NOT auto-set on enable observed in testing (stays 0) — verify behavior with actual save cycle
- **Reset to 0**: When Allow ETS unchecked

#### Allow Resort Tax → Resort Tax Percentage
- **Resort Tax Percentage Disabled When**: Allow Resort Tax unchecked OR `!canEditLoc`
- **Reset to 0**: When disabled or first enabled

#### Allow DPCD + Prompt for Approval → Threshold
- **Threshold Disabled When**: `Allow DPCD = true` OR `Prompt for Approval = false` OR `!canEditLoc`
- **Dual dependency**: BOTH Allow DPCD=false AND Prompt for Approval=true required for Threshold to be editable
- **Reset to 0**: When Allow DPCD=true OR Prompt for Approval=false
- **Live verification**: Allow DPCD ✓ + Prompt for Approval unchecked → Threshold [disabled] ✓

#### Comm Receiver (IsCommReceiver) → Allow DPCD + Show SubRental
- **Allow DPCD and Show SubRental Disabled When**: Comm Receiver unchecked OR `!canEditLoc`
- **Reset Allow DPCD to false**: When Comm Receiver unchecked

#### Company Remit Tax (HRIRemitTax / HRIRemitTax2) → Display Tax
- **Display Tax Disabled When**: Company Remit Tax OR Company Remit Tax 2 checked — OR `!canEditLoc`
- **Auto-set to true**: When either Company Remit Tax checkbox is checked
- **Live verification**: Company Remit Tax ✓ → Display Tax auto-checked and [disabled] ✓

#### Intercompany (InternalCompany) → Enable IDC Billing
- **Enable IDC Billing Disabled When**: Intercompany unchecked
- **Reset to false**: When Intercompany unchecked

#### Compass Integration (IsIntegratedWithCOMPASS)
- **Disabled When**: Updating existing location (`!isNew`)
- **Live verification**: Location 1604 (existing) → Compass Integration [disabled] ✓

#### Suppress Day/Rate Discount (SuppressDayRateDiscount)
- **Always Disabled**: Regardless of all conditions
- **Live verification**: Confirmed [disabled] ✓

### Country-Based Rules

**Method**: `updateControlStatus(countryId)` — triggers on Country dropdown change

**For CountryId = 1 (USA, "United States")**:
- `hideRemitTax = true` — hides Company Remit Tax 2 field
- `HRIRemitTax2 = false` — resets Company Remit Tax 2
- `CheckDiscount = true`

**For All Other Countries**:
- `hideRemitTax = false` — shows Company Remit Tax 2 field
- `CheckDiscount = false`

---

### Currency Tab

Accessible via: Setup > Location > [Office Code] → "Currency" tab (right panel)

**Purpose**: Configure currency selections and merchant associations for the location.

**UI Structure**:
- Save button: shared left-panel Save (top-left) handles all tabs; no separate Pricing-style Save for Currency.
- Grid/table with 4 columns, 3 rows

**Grid — Exact Columns** (confirmed live DOM):
1. **Currency Code** — static text (read-only identifier)
2. **Selected** — checkbox
3. **Is Default** — checkbox
4. **Merchant** — editable dropdown

**Grid — Rows** (3 currencies, confirmed):

| Currency | Selected | Is Default | Merchant Options |
|---|---|---|---|
| USD | ✓ checked | ✓ checked | 2 options: "316370 - PSAV US/USD", "316426 - Encore Bahamas/USD" |
| CAD | unchecked | disabled | 1 option: "316446 - PSAV Canada/CAD" |
| MXN | unchecked | disabled | 0 options ("No Matches Found") |

**Verified Behaviors**:
- Is Default checkbox is **disabled** when Selected is unchecked (CAD and MXN confirmed)
- Is Default checkbox is **enabled** only when Selected is checked
- Merchant dropdown is **always accessible** (clickable) regardless of Selected state — CAD and MXN dropdowns open even when not selected
- Only one currency can be "Is Default" at a time — selecting a new default auto-deselects the previous (single-default enforcement)
- Minimum 1 currency must remain selected; attempting to uncheck the only selected currency shows validation error: "At least one currency must be selected"
- Merchant value persists against a currency row even when Selected is unchecked

**Validation Rules** (confirmed):
- **Single default**: Only one row can have Is Default checked; selecting another auto-deselects current default
- **Selected prerequisite for Is Default**: Is Default cannot be checked unless Selected is checked first
- **Merchant conditional**: MXN has no available merchant — dropdown shows "No Matches Found"
- **Minimum selection**: Cannot uncheck all currencies (at least 1 must be Selected)

---

### Pricing Tab

Accessible via: Setup > Location > [Office Code] → "Pricing" tab (right panel)

**Purpose**: Manage primary price book assignments and alternate pricing strategies with date-based effectiveness.

**Source Component**: `HeliosWeb/client/src/app/features/setup/location-detail/location-detail-pricing/location-detail-pricing.component.ts`

**UI Structure** (two-panel layout within the Pricing tab):
- **Dedicated Save button** at top-right of Pricing tab (purple, separate from the left-panel Save)
- **Left card** — Primary Pricing configuration
- **Right section** — "LOCATION SECONDARY PRICING" grid

---

#### Left Card — Primary Pricing

| Field | Type | Default (Office 1604) | Notes |
|---|---|---|---|
| Corporate Pricing | checkbox | ✓ checked | Master toggle for all price book editing |
| Price Guide Inclusive | checkbox | ✓ checked | independent |
| Currency | dropdown | "All" | Filter for what's shown in Primary Pricing section below |
| Primary Labor Pricing | **editable dropdown** | empty | Shown per-currency group (e.g., "USD" group label) |
| Primary Equipment Pricing | **editable dropdown** | empty | per-currency |
| Primary Internal Equipment Pricing | **editable dropdown** | empty | per-currency |
| Primary Production Labor Pricing | **editable dropdown** | empty | per-currency |
| Primary Production Equipment Pricing | **editable dropdown** | empty | per-currency |

> **CORRECTION from prior documentation**: Primary Pricing fields are **editable dropdowns** (comboboxes), NOT read-only display fields.

---

#### Right Section — Location Secondary Pricing Grid

**Column Headers** (7 columns, confirmed live DOM):

| Column | Type | Notes |
|---|---|---|
| Pricing Strategy | read-only text | Price book name/strategy label |
| Pricebook | read-only text | Price book code |
| Currency | read-only text | Currency code (USD, MXN, etc.) |
| Is Alternative | checkbox | Master toggle for this row's alternate pricing |
| Use Effective Date | checkbox | Disabled when Is Alternative=unchecked |
| Start Date | date picker (MM/DD/YYYY) | Disabled when Use Effective Date=unchecked OR Is Alternative=unchecked |
| End Date | date picker (MM/DD/YYYY) | Disabled when Use Effective Date=unchecked OR Is Alternative=unchecked |

> **CORRECTION from prior documentation**: Column labels are "Pricing Strategy" and "Pricebook" (not "Price Book Name" / "Price Book Code"). Total is 7 columns (not 8).

**Grid Row Count**: 50+ rows visible for location 1604 (mix of USD and MXN currencies)

**Sample Price Books** (confirmed rows for 1604):
- MXN: MEX BO GDL MXN 2025
- USD: 2021-Tier 3 Urban A, 2022-eCommerce, 2022-LB_WDW_Quote, 2022-NP LB1/LB2/LB3, 2022-NP Tier 1/2/3
- USD: 2022-Stand-Alone Virtual LB_US, 2022-Stand-Alone Virtual_US
- USD: 2022-Tier 1 Airport A/B, Branch, Convention Center, Luxury A/B/C, Offsite Events, Resort A/B, Suburban A/B/C, Urban A/B
- USD: 2022-Tier 2 Airport A/B/C, Branch A/B, Convention Center, Luxury A/B, Offsite Events, Resort A/B/C, Suburban A/B/C, Urban A/B
- USD: 2022-Tier 3 Airport A/B, Branch A/B, Convention Center, Luxury A/B, Offsite Events, Resort A/B/C, Suburban A/B/C, Urban A/B/C

---

#### Field Validation Rules

##### Date Validation
- **Custom Validator**: `customDateValidator`
- **Fields**: Start Date, End Date
- **Method**: `validateForm()` via `priceBookValidationService`
- **Rule**: Both dates must pass `isValidDate()` check

##### Is Alternative Checkbox
- **UI Label**: "Is Alternative" (code: `IsAlternate`)
- **On Check**:
  - Marks `IsNew = true` if first selection
  - Enables "Use Effective Date" checkbox
- **On Uncheck**:
  - Clears all validation errors
  - Sets `IsDeleted = true`
  - Sets Use Effective Date = false
  - Clears Start Date and End Date values

##### Use Effective Date Checkbox
- **UI Label**: "Use Effective Date" (code: `UseDate`)
- **Enabled When**: Is Alternative = checked
- **Disabled When**: Is Alternative = unchecked
- **On Uncheck**: Clears Start Date and End Date values

##### Start Date / End Date
- **Enabled When**: Is Alternative = checked AND Use Effective Date = checked
- **Disabled otherwise**
- **Format**: MM/DD/YYYY (handled by `NullDateEditor`)
- **Validation**: Must be valid date via `isValidDate()`

#### Corporate Pricing Master Toggle
- **Method**: `corporatePricebookCheckChanged()`
- **When Corporate Pricing = unchecked**: Disables primary pricing dropdowns (Primary Labor/Equipment/etc.); Secondary grid fields remain editable (LIVE-VERIFIED — differs from prior assumption that entire grid disables)
- **When Corporate Pricing = checked**: Primary pricing dropdowns enabled; Secondary grid editable per row rules

#### Grid-Level Validation
- **Method**: `validateCorporatePriceGrid()`
- Iterates all price book rows; if any row has errors, sets `CorporatePrices` control error `{ invalid: true }`
- **Service**: `priceBookValidationService.validate()` runs after any cell value change or checkbox toggle

#### Cell Edit Restrictions (`onBeforeEditCell`)
- **Start Date / End Date**: Editable only if Is Alternative=true AND Use Effective Date=true
- **Use Effective Date**: Editable only if Is Alternative=true
- **Pricing Strategy (name)**: Never editable
- **Other Fields**: Editable if `canEditLoc=true` AND item not null

---

### Left Panel — Basic Information Form-Level Validations

Source Component: `location-detail.component.ts` (Parent Component)

**Left Panel Fields** (confirmed live, Location 1604):

| Field | Type | Default (1604) | State |
|---|---|---|---|
| Office | text input | 1604 | disabled (always) |
| Local Office | text input | 1604 | disabled (always) |
| Local Office Name | text input | Parker Palm Springs | editable |
| Active | checkbox | ✓ checked | editable |
| Live Date | date picker/popover | May 11th, 2007 | editable (popover) |
| Tax Mode | combobox (dropdown) | US | editable |
| Country | combobox (dropdown) | United States | editable |
| Region | combobox (dropdown) | Palm Springs | editable |
| Servicing Branch Office | combobox (dropdown) | Select Servicing Branch Office | editable |
| Line Of Business | combobox (dropdown) | Hotel Services Division | editable |
| Pay To Address | text input | Encore | disabled (always) |
| Union | checkbox | unchecked | editable |
| eCommerce Active | checkbox | ✓ checked | disabled (always) |
| Enable Productions Orders | checkbox | ✓ checked | disabled (always) |

**Save Button** (left panel, top): Disabled by default. Located above left panel fields.

#### Form-Level Validation Rules

##### GLServicingDivisionValue
- **Rule**: Minimum value must be 1
- **Validator**: `Validators.min(1)`
- **Error Indicator**: Exclamation icon with `ERR_REQUIRED`
- **Condition**: Value must be greater than 0

##### LOBId (Line of Business)
- **Rule**: Minimum value must be 1
- **Validator**: `Validators.min(1)`
- **Error Indicator**: Exclamation icon with `ERR_REQUIRED`
- **Condition**: Value must be greater than 0

##### LocalOfficeId
- **Rule**: Must be numeric only
- **Pattern**: `^\d+$`
- **Max Length**: 10 characters
- **Required**: Yes
- **Error Message**: `LOCATION_ID_NUMERIC`

##### LocalOfficeName
- **Rule**: Required field
- **Required**: Yes
- **Max Length**: 50 characters
- **Error Message**: `ERR_REQUIRED`

##### TaxModeID
- **Rule**: Required field, must be greater than 0
- **Condition**: `locationDetail.TaxModeID == 0`
- **Error Message**: `ERR_REQUIRED`

##### CountryID
- **Rule**: Required field, must be greater than 0
- **Condition**: `locationDetail.CountryID == 0`
- **Error Message**: `ERR_REQUIRED`

##### PayToName / PayToId
- **Rule**: Required field, must be greater than 0
- **Condition**: `locationDetail.PayToId == 0`
- **Error Message**: `ERR_REQUIRED`

#### Save Button Disabled Conditions

The Save button is disabled when ANY of the following is true:
- `locationDetailForm.pristine` (no changes made)
- `locationDetailForm.invalid`
- `!locationDetail.MasterAddress || !locationDetail.MasterAddress.Line1` (missing master address)
- `priceBookHasErrors` (Pricing tab has validation errors)
- `!canEditLoc` (no edit permission)
- `!isValidLegalData()` (Legal tab data invalid)
- `locationDetail.CountryID == 0`
- `locationDetail.TaxModeID == 0`
- `!isValidCurrency()` (no currency selected)
- `locationDetail.PayToId == 0`
- `locationDetail.OracleOrgId == 0`

#### Business Logic Validations

##### LocalOfficeId Uniqueness
- **Method**: `validLocalOfficeId()`
- **Applies to**: New locations only
- **Error Message**: `LOCALOFFICE_ALREADY_EXISTS`

##### Country Change Handler
- **Method**: `countryChange()`
- **Actions**:
  - Updates `CheckDiscount` based on country
  - Updates `EnableJobCosting` (enabled for US only)
  - Calls `localInformation.updateControlStatus()`
  - Resets Region
  - Resets Tax Mode and shows validation error
  - Resets ServiceChargeName and TermsConditionsName for all languages in Legal tab and shows validation error

---

### Legal Tab

Accessible via: Setup > Location > [Office Code] → "Legal" tab (right panel)

**Purpose**: Configure legal terms (Service Charge and Terms & Conditions) per language for the location.

**Source Component**: `location-detail-legal` in Navigator App

**UI Structure** (confirmed live, Location 1604):
- Dedicated Save button at top-right (disabled by default)
- Table: 3 columns (Language Name, Service Charge Name, Terms and Conditions Name)
- Row count depends on configured languages (1604 has 1 row: US English)

**Grid — Columns** (confirmed live DOM):

| Column | Type | Notes |
|---|---|---|
| Language Name | static text (read-only) | Language identifier |
| Service Charge Name | combobox (dropdown) | Options filtered by LanguageId, sorted alphabetically |
| Terms and Conditions Name | combobox (dropdown) | Options filtered by LanguageId, sorted alphabetically |

**Grid — Default Data** (Location 1604):

| Language | Service Charge | Terms & Conditions |
|---|---|---|
| US English | Service Charge | LDW |

**Validation Rules**:

##### ServiceChargeId
- **Rule**: `LOC_SERVICE_CHARGE_ID_GT_ZERO`
- **Method**: `scReq()` within `validateLegalDataProperty()`
- **Editor Validator**: `serviceChargeDdlValidator`
- **Condition**: Cannot be null or empty string
- **Error Message**: `SCNAME_IS_REQD`
- **Visual**: Exclamation icon in grid cell

##### TermsConditionsId
- **Rule**: `LOC_TERMS_CONDITION_ID_GT_ZERO`
- **Method**: `tcReq()` within `validateLegalDataProperty()`
- **Editor Validator**: `termsConditionsDdlValidator`
- **Condition**: Cannot be null or empty string
- **Error Message**: `TCNAME_IS_REQD`
- **Visual**: Exclamation icon in grid cell

**Dropdown Options**:
- ServiceChargeNames: Filtered by LanguageId, sorted alphabetically
- TermConditionNames: Filtered by LanguageId, sorted alphabetically

**Item Validation**:
- **Method**: `validateLegalDataProperty()`
- Sets `item.IsValid` based on validation results
- Triggers grid invalidation and re-render

**Acceptance Criteria** (from requirements):
1. Display Terms/Conditions and Service Charge based on saved location settings
2. Grid uses dropdown editors populated with values filtered by language and sorted alphabetically
3. Validates both Service Charge and Terms & Conditions are selected for each row
4. Error indicator (exclamation icon) shown when validation fails
5. Grid editable only when `canEditProp = true`; otherwise read-only
6. Grid resizes responsively
7. Component updates grid and validation when `locationDetail` changes
8. Accessible and keyboard-navigable

**Cross-Tab Impact**:
- Country change resets ServiceChargeName and TermsConditionsName for all languages and shows validation error
- Save button (left panel) disabled when `!isValidLegalData()`

---

### Account and Address Tab

Accessible via: Setup > Location > [Office Code] → "Account and Address" tab (right panel)

**Purpose**: Display and manage venue/branch account details and master bill-to address.

**UI Structure** (confirmed live, Location 1604):
- Two side-by-side cards/sections:
  - Left: **VENUE/BRANCH ACCOUNT**
  - Right: **MASTER BILL TO ADDRESS**

**VENUE/BRANCH ACCOUNT Fields**:

| Field | Type | Default (1604) | State |
|---|---|---|---|
| Name | text input | Parker Palm Springs | disabled |
| Address | static text (clickable) | 4200 E Palm Canyon Dr | clickable button (likely opens Address editor) |
| City | static text | PALM SPRINGS | display-only |
| State | static text | CA | display-only |
| Zip | static text | 92264 | display-only |
| Country | static text | United States | display-only |
| Phone 1 | text input | 760-883-1957 | editable |
| Phone 2 | text input | (empty) | editable |

**MASTER BILL TO ADDRESS Fields**:

| Field | Type | Default (1604) | Notes |
|---|---|---|---|
| Address | static text (clickable) | 4200 E Palm Canyon Dr | clickable button |
| City | static text | PALM SPRINGS | display-only |
| State | static text | CA | display-only |
| Zip | static text | 92264 | display-only |
| Country | static text | United States | display-only |

**Validation Rules** (from requirements):
- Phone 1: Required field (`required="true"`, Error: `ERR_REQUIRED`)
- Phone 2: Optional (no validation)
- "Name" and "Address" labels are clickable buttons — clicking did NOT open a modal in live testing (may require specific permissions or edit mode)
- Master Address must exist with Line1 for Save button to be enabled

---

### Notes Tab

Accessible via: Setup > Location > [Office Code] → "Notes" tab (right panel)

**Purpose**: Add and manage location-specific notes.

**UI Structure** (confirmed live, Location 1604):
- Table: 3 columns (#, Location Notes, Actions)
- Default: 1 empty row with textbox placeholder "Type notes here..."
- "Add" button below the table to add new note rows
- Character counter: "0/4000 (4000 left)"
- Progress bar indicator (character usage visualization)

**Fields**:

| Element | Type | Notes |
|---|---|---|
| # (row number) | static text | Auto-incremented |
| Location Notes | textbox | Placeholder: "Type notes here...", max 4000 chars |
| Actions | button (Delete) | Delete button appears when 2+ rows exist; empty when only 1 row |
| Add button | button | Adds new note row |
| Character counter | display text | Format: "{used}/4000 ({remaining} left)" |
| Progress bar | progressbar | Visual indicator of char usage |

**Behaviors** (observed):
- No validation errors visible — notes are optional
- Character limit: 4000 per note
- Multiple notes can be added via Add button
- No save button in Notes tab — relies on left-panel Save

---

### Shared Setup Locations Tab

Accessible via: Setup > Location > [Office Code] → "Shared Setup Locations" tab (right panel)

**Purpose**: Configure which locations share setup configurations with this location.

**UI Structure** (confirmed live, Location 1604):
- Table: 5 columns (Location No, Location Name, Primary Office, Shares Inventory, [Actions])
- "Add" button at bottom of table to add shared locations

**Grid — Columns**:

| Column | Type | Notes |
|---|---|---|
| Location No | static text | Location number identifier |
| Location Name | static text | Display name |
| Primary Office | checkbox | Disabled for self-location (checked); indicates primary |
| Shares Inventory | checkbox | Editable toggle for inventory sharing |
| [Actions] | button (Delete) | Disabled for self-location entry |

**Default Data** (Location 1604):

| Location No | Location Name | Primary Office | Shares Inventory | Delete |
|---|---|---|---|---|
| 1604 | Parker Palm Springs | ✓ checked [disabled] | unchecked [editable] | disabled |

**Behaviors**:
- Self-location row: Primary Office checked and disabled, Delete disabled
- Other shared locations: Primary Office editable, Delete enabled
- "Add" button opens location search/picker (needs further exploration — may require permissions)
- No dedicated Save — relies on left-panel Save

---

### Auto Add-On Tab

Accessible via: Setup > Location > [Office Code] → "Auto Add-On" tab (right panel)

**Purpose**: Configure which add-on items are automatically included for this location.

**UI Structure** (confirmed live, Location 1604):
- Simple vertical checkbox list (no table/grid)
- Each item is a labeled checkbox

**Available Add-On Items** (Location 1604):

| Item | Default State |
|---|---|
| Encore Music | ✓ checked |
| Wireless Presenter | ✓ checked |
| Express Content Design Session | unchecked |
| Wordly | ✓ checked |
| Test Labor - Jonathan | unchecked |
| Labor | ✓ checked |

**Behaviors**:
- Pure checkbox toggles — no complex validation
- List items may vary per location
- No dedicated Save — relies on left-panel Save
- No validation rules apparent — items are optional toggles

---

### Location Management History

Accessible via: Setup > Location > [Office Code] → "Location Management History" outer tab (next to "Basic Information")

**Purpose**: View a read-only historical record of all management changes for a location.

**Source Component**: `location-detail-history.component.ts`

**UI Structure** (confirmed live, Location 1604):
- Read-only DataTable (no editing, adding, or deleting)
- Pagination: "rows per page" dropdown (default 10), first/prev/next/last page buttons
- Horizontal scrolling for 87 columns
- Empty state message: "No results." when no history data available

**Grid — All Column Headers** (87 columns, confirmed live DOM):

| # | Column Header | Notes |
|---|---|---|
| 1 | Local Office ID | |
| 2 | Local Office Name | |
| 3 | Active | |
| 4 | Live Date | |
| 5 | Country | |
| 6 | Currency | |
| 7 | Tax Mode Name | |
| 8 | Region Name | |
| 9 | Servicing Branch Office | |
| 10 | Pay To | |
| 11 | Union | |
| 12 | Corporate Pricing | |
| 13 | Billing Type | |
| 14 | Billing Cycle | |
| 15 | Billing Way | |
| 16 | Billing Way Active Date | |
| 17 | Labor Pricing | |
| 18 | Equip. Pricing | |
| 19 | Internal Equip. Pricing | |
| 20 | Production Labour Pricing | |
| 21 | Production Equip. Pricing | |
| 22 | Allow DPCD | |
| 23 | Exclude Implied Discount | |
| 24 | Prompt For Approval | |
| 25 | Threshold | |
| 26 | Apply LDW | |
| 27 | LDW Percentage | |
| 28 | Calculate LDW on Net Amount | |
| 29 | ETS | |
| 30 | ETS Percent | |
| 31 | Service Charge | |
| 32 | Show Service Charge As Administrative Fee | |
| 33 | Calculate Service Charge On Net Amount | |
| 34 | Service Charge Name | |
| 35 | Apply Cables and Consumables Fee | |
| 36 | C&C Percentage | |
| 37 | Calculate CAC on Net Amount | |
| 38 | Terms and Conditions | |
| 39 | Allow Ticker Calc | |
| 40 | Set/Strike/Support Labor Billing Goal | |
| 41 | Set/Strike/Support Labor Billing Goal | duplicate header name |
| 42 | Apply Set/Strike Labor Minutes | |
| 43 | Credit Memo Approval Required | |
| 44 | Display Tax | |
| 45 | Company Remit Tax / GST/HST / VAT Tax | |
| 46 | Remit PST Tax | |
| 47 | Comm Receiver | |
| 48 | Enable IDC Billing | |
| 49 | Skip Billing | |
| 50 | Show SubRental | |
| 51 | Inventory Only | |
| 52 | Intercompany | |
| 53 | Calculate Commission Tax | |
| 54 | Can Create External Customer Link | |
| 55 | Venue/Branch Account Name | |
| 56 | Venue/Branch Account Phone1 | |
| 57 | Venue/Branch Account Phone2 | |
| 58 | Master Bill To Address Name | |
| 59 | Action of Shared Setup Location | |
| 60 | Shared Setup Location ID | |
| 61 | Shared Setup Location Name | |
| 62 | Include Service Charge in Price Guides | |
| 63 | Pricing Strategy | |
| 64 | Currency | |
| 65 | Pricing Action | |
| 66 | Is Alternate | |
| 67 | Use Effective Dates | |
| 68 | Start Date | |
| 69 | End Date | |
| 70 | Notes | |
| 71 | Modified By | |
| 72 | Modified On | |
| 73 | Oracle Product Code | |
| 74 | Oracle Department Code | |
| 75 | Oracle Organization | |
| 76 | Allow Resort Tax | |
| 77 | Resort Tax Percentage | |
| 78 | Discount Reason | |
| 79 | Offsite Event Location | |
| 80 | Use eSignature | |
| 81 | Separate Master Bill Commission Invoice | |
| 82 | Enable Product Group | |
| 83 | Allow Production Quote | |
| 84 | Enable Job Costing | |
| 85 | Enable Discount Guidance | |
| 86 | Internet Asset Reservation | |
| 87 | Warehouse Billing | |

**Pagination Controls**:
- Rows per page dropdown (default: 10)
- Go to first page, previous page, next page, last page buttons
- Page indicator: "{current} / {total}"

**API**: `/api/location/{locationNo}/history?IsCorporate=true`

**Acceptance Criteria** (from requirements):
1. Read-only table (no add/edit/delete)
2. Displayed under "Location Management History" tab
3. Columns use appropriate formatters and translated headers
4. All sortable columns support sorting
5. Data fetched from backend API endpoint
6. Empty state message shown when no history available
7. No validation required (read-only display)

**Notable Differences from User Requirements vs Live DOM**:
- User requirements listed ~80+ columns matching individual DB fields; live DOM shows 87 column headers
- Column #41 is a duplicate header ("Set/Strike/Support Labor Billing Goal" appears twice)
- Some user-listed columns mapped to different live labels:
  - `LaborCorporatePriceBookHistory` → "Labor Pricing"
  - `NonLaborCorporatePriceBookHistory` → "Equip. Pricing"
  - `DefaultLDWPercentage` → "LDW Percentage"
  - `PBName` → "Pricing Strategy"
  - `DefaultVenueName` → "Venue/Branch Account Name"
  - `ModUser` → "Modified By"
  - `ModDate` → "Modified On"

---

*Last Updated: 2026-02-18 — Live UI verified via MCP Playwright (location 1604, all 8 right-panel tabs + left panel + Management History)*
