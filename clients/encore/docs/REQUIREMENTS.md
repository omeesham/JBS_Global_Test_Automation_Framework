# Navigator Cloud Test Automation Requirements

> **Purpose**: Static knowledge base describing the Navigator Cloud application features, structure, and behaviors. Agents READ this to understand the website before exploring, planning, and generating tests.
>
> **This file is NOT modified by agents.** Only the team updates this document. Agents record element discoveries in `specs_planning/test-cases/*.md` files instead.

**Target Application**: [Navigator Cloud E2E Environment](https://cloudapps-e2e.encoreglobal.com/navigator/)

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
- Base32-encoded secret is stored in `.env` files
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

Test credentials are stored in `.env` files (`config/environments/.env.development`):
- `NAVIGATOR_USERNAME` - Microsoft SSO email
- `NAVIGATOR_PASSWORD` - Microsoft SSO password
- `NAVIGATOR_MFA_SECRET` - Base32 TOTP seed for 2FA

Credentials are loaded at runtime by `CredentialLoader` from environment variables.

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
- **Legal tab** — no dedicated Save; uses shared left-panel Save (`location-settings-btn-save`)
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
| Enable Multiday Pricing | checkbox | unchecked | independent (MCP 2026-04-10: new field, editable) |
| Allow ETS | checkbox | unchecked | independent |
| ETS Percentage | spinbutton % | 0 | disabled when Allow ETS unchecked |
| Service Charge | checkbox | ✓ checked | independent (parent of `is-administrative-fee` and `calc-service-charge-on-net` per LI parent-children convention; on office 1604 SP-DQU-04 2026-04-27 observed parent unchecked — re-verify default on slate-cleared office) |
| Show Service Charge As Administrative Fee | checkbox | unchecked | child of Service Charge — should be disabled when parent unchecked. **Currently broken on new site**: see BUG-LI-002. |
| Calculate Service Charge On Net Amount | checkbox | unchecked | child of Service Charge — should be disabled when parent unchecked. **Currently broken on new site**: see BUG-LI-002. |
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
| Use eSignature | checkbox | ✓ checked | always disabled in current UI (SP-DQU-04 2026-04-27 — not in v1 disabled-list; treat as technical constraint) |
| Enable Product Group | checkbox | unchecked | always disabled in current UI (SP-DQU-04 2026-04-27 — not in v1 disabled-list; treat as technical constraint) |
| Allow Production Quote | checkbox | unchecked | independent |
| Suppress Day/Rate Discount | checkbox | — | always disabled (technical constraint) |

**Right Column** (top to bottom):

| Field | Type | Default State (Office 1604) | Dependency |
|---|---|---|---|
| Billing Type | radio (Master / Direct) | Master | independent |
| Billing Way | radio (Event / Daily) | Event | independent |
| Effective Date | date picker | May 11th, 2007 | disabled by default; enabled only when Billing Way changes (changeBillWayActive=true) |
| Billing Cycle | dropdown | Weekly | **INVESTIGATION NEEDED**: MCP-01 (2026-04-10) shows enabled for office 1604 (localBillingRan=false). Original requirement said "disabled after billing ran." Current state may be correct if billing hasn't run for 1604, or may be app bug. Needs dev team confirmation. Info icon (?) always visible |
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
| Enable Job Costing | checkbox | ✓ checked | always disabled in current UI (SP-DQU-04 2026-04-27 — historically listed as disabled; technical constraint) |
| Enable Discount Guidance | checkbox | ✓ checked | always disabled in current UI (SP-DQU-04 2026-04-27 — not in v1 disabled-list; treat as technical constraint) |
| Enable Proposal | checkbox | ✓ checked | independent |

**Validation Requirements**:
- Right panel edits must persist after save + reload
- Left panel data must remain unchanged after right-panel save (baseline assertion)
- **Save endpoint architecture (new site)**: page-level Save POSTs to the page URL itself (`POST /navigator/locations/{id}/settings/location`) using the Next.js + React Hook Form + Server Actions pattern, NOT a separate `/api/save` endpoint as the v1 Angular implementation used. Tests asserting save-cycle behavior must observe the page URL POST, not a dedicated save API. Per BUG-LI-001 verification 2026-04-27 — on server failure (e.g. 503) the new-site UI renders no error toast or dialog (silent failure mode); tests must assert that an error feedback surface (toast / dialog / inline message) is rendered on save failure as part of the user-feedback contract.

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
- **Live verification**: field shows "Weekly" [enabled] for location 1604 (MCP-01 2026-04-10: localBillingRan=false)

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

#### Service Charge (AllowServiceCharge) → Show Service Charge As Administrative Fee + Calculate Service Charge On Net Amount
- **Children Should Be Disabled When**: Service Charge parent unchecked
- **Reset on Disable**: Children should reset to unchecked when parent unchecked (per LI parent-children convention — same pattern as Apply LDW, Apply C&C, Allow ETS, Allow Resort Tax)
- **Live verification 2026-04-27**: Currently BROKEN — children remain checked + enabled when parent unchecked. **Filed as BUG-LI-002.** Until fixed, automated tests (TC-LOC-LI-065) are blocked.

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
- Minimum 1 currency must remain selected; unchecking the only selected currency keeps Save disabled (no error dialog — passive validation via button state)
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
  - Marks `IsNew = true` if first selection — **NOT UI-TESTABLE** (backend flag, no UI indicator)
  - Enables "Use Effective Date" checkbox
- **On Uncheck**:
  - Clears all validation errors
  - Sets `IsDeleted = true` — **NOT UI-TESTABLE** (backend flag, no UI indicator)
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
- **Impact on Save button**: Grid validation errors may block Save — MCP-1 unverified (API 500 as of 2026-04-06). Tested by TC-LOC-PRI-033.

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
- No dedicated Save button — uses shared left-panel Save (`location-settings-btn-save`)
- Table: 3 columns (Language Name, Service Charge Name, Terms and Conditions Name)
- Row count depends on configured languages (1604 has 1 row: US English)

**Grid — Columns** (confirmed live DOM):

| Column | Type | Notes |
|---|---|---|
| Language Name | static text (read-only) | Language identifier |
| Service Charge Name | combobox (dropdown) | Options filtered by LanguageId. v1 says "sorted alphabetically" but **live is NOT sorted** (MCP-verified 2026-04-06: generic names first, then location-specific — APP BUG) |
| Terms and Conditions Name | combobox (dropdown) | Options filtered by LanguageId. v1 says "sorted alphabetically" but **live is NOT sorted** (MCP-verified 2026-04-06: same pattern — APP BUG) |

**Grid — Default Data** (Location 1604):

| Language | Service Charge | Terms & Conditions |
|---|---|---|
| US English | Resort Service Charge | LDW |

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
- ServiceChargeNames: Filtered by LanguageId. v1 requirement says sorted alphabetically but **live is NOT sorted** (APP BUG, MCP-verified 2026-04-06)
- TermConditionNames: Filtered by LanguageId. v1 requirement says sorted alphabetically but **live is NOT sorted** (APP BUG, MCP-verified 2026-04-06)

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
| Address | static text (clickable) | 8899 Beverly Blvd Ste 412 | clickable button — opens Select Customer Address dialog |
| City | static text | WEST HOLLYWOOD | display-only |
| State | static text | CA | display-only |
| Zip | static text | 90048 | display-only |
| Country | static text | United States | display-only |
| Phone 1 | text input | 760-883-1957 | editable |
| Phone 2 | text input | (empty) | editable |

**MASTER BILL TO ADDRESS Fields**:

| Field | Type | Default (1604) | Notes |
|---|---|---|---|
| Address | static text (clickable) | 8899 Beverly Blvd Ste 412 | clickable button — opens Select Customer Address dialog |
| City | static text | WEST HOLLYWOOD | display-only |
| State | static text | CA | display-only |
| Zip | static text | 90048 | display-only |
| Country | static text | United States | display-only |

**Validation Rules** (from requirements):
- Phone 1: Required field (`required="true"`, Error: `ERR_REQUIRED`)
- Phone 2: Optional (no validation)
- "Name" button opens Account List dialog; "Address" buttons open Select Customer Address dialog (MCP-verified 2026-04-07)
- Master Address must exist with Line1 for Save button to be enabled

---

### Notes Tab

Accessible via: Setup > Location > [Office Code] → "Notes" tab (right panel)

**Purpose**: Add and manage location-specific notes.

**UI Structure** (confirmed live, Location 1604; MCP-verified 2026-04-08):
- Table: 2 cells per row (textarea cell + actions cell). No `<thead>`, no visible row number column.
- Default: "No Notes Available" (empty table with colspan row, 0 textareas). First row appears only after clicking Add.
- "Add" button below the table to add new note rows
- Character counter: "0/4000 (4000 Left)"
- Progress bar indicator (character usage visualization)
- Delimiter counting: each additional row adds +1 delimiter character to total count. E.g., 3 rows with "Hello"(5), "World"(5), "End"(3) = 15 total (5+1+5+1+3).

**Fields**:

| Element | Type | Notes |
|---|---|---|
| Location Notes | textbox | Placeholder: "Type notes here...", no HTML `maxlength` attribute |
| Actions | button (Delete) | Delete appears when (a) single row has text content, OR (b) 2+ rows exist (all rows get Delete). Empty single row has no Delete. |
| Add button | button | Adds new note row |
| Character counter | display text | Format: "{used}/4000 ({remaining} Left)" |
| Progress bar | progressbar | Visual indicator of char usage |

**Behaviors**:
- No validation errors visible — notes are optional
- Character limit: 4000 soft limit — keyboard input blocked at 4000 by JS handler, but paste/programmatic input can exceed. Counter shows overage (e.g., "4001/4000").
- Multiple notes can be added via Add button
- Save uses shared `[data-testid="location-settings-btn-save"]` button (from `SetupSharedSelectors` in `shared.ts`). Save triggers "Save Changes" `alertdialog` with Cancel + Ok buttons.

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
- Other shared locations: Primary Office unchecked and disabled, Delete enabled
- "Add" button opens "Change Local Office" dialog with search/filter; dialog excludes already-added locations; selecting a row and clicking Select adds the location to the table (unsaved until left-panel Save)
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
- Pagination: "rows per page" dropdown (default 20), first/prev/next/last page buttons
- Horizontal scrolling for 87 columns
- Empty state message: "No results." when no history data available

**Grid — All Column Headers** (87 columns, confirmed live DOM):

| # | Column Header | Notes |
|---|---|---|
| 1 | Local Office | [MCP-CORRECTED: was "Local Office ID"] |
| 2 | Local Office Name | |
| 3 | Active | |
| 4 | Live Date | |
| 5 | Country | |
| 6 | Currency | |
| 7 | Tax Mode | [MCP-CORRECTED: was "Tax Mode Name"] |
| 8 | Region | [MCP-CORRECTED: was "Region Name"] |
| 9 | Servicing Branch Office | |
| 10 | Pay To Address | [MCP-CORRECTED: was "Pay To"] |
| 11 | Union | |
| 12 | Corporate Pricing | |
| 13 | Billing Type | |
| 14 | Billing Cycle | |
| 15 | Billing Way | |
| 16 | Billing Way Active | [MCP-CORRECTED: was "Billing Way Active Date"] |
| 17 | Labor Pricing | |
| 18 | Equip. Pricing | |
| 19 | Internal Equip. Pricing | |
| 20 | Production Labor Pricing | [MCP-CORRECTED: was "Production Labour Pricing"] |
| 21 | Production Equip. Pricing | |
| 22 | Allow DPCD | |
| 23 | Exclude Implied Discount | |
| 24 | Prompt For Approval | |
| 25 | Threshold | |
| 26 | Enable LDW | [MCP-CORRECTED: was "Apply LDW"] |
| 27 | LDW Percentage | |
| 28 | Calculate LDW on Net Amount | |
| 29 | ETS | |
| 30 | ETS Percent | |
| 31 | Allow Service Charge | [MCP-CORRECTED: was "Service Charge"] |
| 32 | Show Service Charge As Administrative Fee | |
| 33 | Calculate Service Charge On Net Amount | |
| 34 | Service Charge Name | |
| 35 | Apply Cables and Consumables Fee | |
| 36 | C&C Percent | [MCP-CORRECTED: was "C&C Percentage"] |
| 37 | Calculate CAC on Net Amount | |
| 38 | Terms and Conditions | |
| 39 | Allow Ticker Calc | |
| 40 | Set/Strike/Support Labor Billing Goal | |
| 41 | Enable Set/Strike Labor Minutes | [MCP-CORRECTED: was listed as duplicate of col 40 — NOT a duplicate. Distinct column.] |
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
- Rows per page dropdown (default: 20)
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
- ~~Column #41 is a duplicate header~~ [MCP-CORRECTED 2026-04-13]: Col 40 = "Set/Strike/Support Labor Billing Goal", Col 41 = "Enable Set/Strike Labor Minutes" — distinct columns, NOT a duplicate
- Some user-listed columns mapped to different live labels:
  - `LaborCorporatePriceBookHistory` → "Labor Pricing"
  - `NonLaborCorporatePriceBookHistory` → "Equip. Pricing"
  - `DefaultLDWPercentage` → "LDW Percentage"
  - `PBName` → "Pricing Strategy"
  - `DefaultVenueName` → "Venue/Branch Account Name"
  - `ModUser` → "Modified By"
  - `ModDate` → "Modified On"
- Col 6 and Col 64 are both named "Currency" — confirmed intentional duplicate (pricing vs primary)

**History Tracking Rules** [MCP-VERIFIED 2026-04-13, Location 1604]:

| Rule | Detail |
|------|--------|
| Snapshot model | 1 save = 1 new history row (full row snapshot, regardless of fields changed) |
| Cross-system independence | Saves on Local Office Settings do NOT create rows in Location Management History and vice versa |
| Table refresh | New row visible immediately on tab switch after save (no page reload needed) |
| Default sort | Modified On descending (most recent first) |
| Horizontal scroll | All 87 columns in DOM (no virtual scroll). scrollWidth=16065px, clientWidth=1141px |
| Populated data | Location 1604: 147 pages (~2922 rows). NOT empty |

**Data Formats** [MCP-VERIFIED 2026-04-13]:

| Format | Representation | Example |
|--------|---------------|---------|
| Boolean TRUE | Unicode checkmark "✔" | Col 3 Active |
| Boolean FALSE | Empty cell "" | Col 11 Union (when unchecked) |
| Date | MM/DD/YYYY | "11/07/2005" |
| Timestamp | MM/DD/YYYY HH:MM:SS AM/PM | "04/10/2026 03:42:00 PM" |
| Percentage | N.NN % (space before %) | "4.00 %", "55.00 %" |
| Empty/null | Empty string "" | No "null", "N/A", or "-" |
| Number | Plain text | "0000", "900" |
| Pricing | Multi-currency format | "USD: 2026-Zone 3 D; CAD: ; MXN:" |
| Email | Plain text | "s-prd-clickauto@psav.com" |

**Sortable Columns** (14 of 87): Live Date, Billing Way Active, Modified By, Modified On, Oracle Product Code, Oracle Department Code, Oracle Organization, Use eSignature, Separate Master Bill Commission Invoice, Enable Product Group, Enable Job Costing, Enable Discount Guidance, Internet Asset Reservation, Warehouse Billing

**NOT-TRACKED Fields** — Fields saved by existing specs that have NO corresponding column in 87-col history:

| Field | Spec | Notes |
|-------|------|-------|
| EnableMultidayPricing | TC-LOC-LI-071 | Not in 87 columns |
| Merchant currency selection | TC-LOC-CUR-022, CUR-024 | Not in 87 columns |
| Auto Add-On checkboxes | TC-LOC-AAO-003, AAO-004, AAO-017, AAO-018, AAO-020 | Not in 87 columns |

**Save Dialog** [MCP-VERIFIED 2026-04-13]: Location Settings uses "Save Changes" dialog with **Cancel/Ok** buttons (different from Local Office Settings which uses Cancel/Save).

**Test Architecture (2026-04-20 pivot)**: History coverage lives exclusively in dedicated hist specs (`tests/specs/setup/locations/history/*.spec.ts`). Each hist column has its own `describe()` block enumerating state-space per the root field's control type (per D1.a taxonomy). Basic-info specs carry NO history code. See [PLAN_HIST_COLUMN_FIRST_PIVOT.md](../../../plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md) and the per-surface root-column catalogs (created by SP-B-LM-* sessions).

### Plan vs DOM Column Name Comparison [MCP-VERIFIED 2026-04-13]

Cross-reference of oral/plan requirements vs live DOM for both history systems. Source: SUBPLAN_HISTORY_01_MCP_FINDINGS.md.

**Location Management History (87 columns)**:

| Col# | Plan/Oral Name | Live DOM Actual | Correction Type |
|------|---------------|-----------------|-----------------|
| 1 | Local Office ID | Local Office | Name shortened |
| 7 | Tax Mode Name | Tax Mode | Name shortened |
| 8 | Region Name | Region | Name shortened |
| 10 | Pay To | Pay To Address | Name expanded |
| 16 | Billing Way Active Date | Billing Way Active | Name shortened |
| 20 | Production Labour Pricing | Production Labor Pricing | Spelling (UK→US) |
| 26 | Apply LDW | Enable LDW | Verb changed |
| 28 | "BUG: renders i18n key" | Calculate LDW on Net Amount | Plan bug — renders correctly |
| 31 | Service Charge | Allow Service Charge | Verb added |
| 32 | Show SC As Admin Fee | Show Service Charge As Administrative Fee | Abbreviation expanded |
| 33 | Calculate SC On Net Amount | Calculate Service Charge On Net Amount | Abbreviation expanded |
| 35 | Apply C&C Fee | Apply Cables and Consumables Fee | Abbreviation expanded |
| 36 | C&C Percentage | C&C Percent | Name shortened |
| 41 | "Duplicate of col 40" | Enable Set/Strike Labor Minutes | NOT a duplicate — distinct column |
| 62 | Include SC in Price Guides | Include Service Charge in Price Guides | Abbreviation expanded |

**Local Office Settings History (42 columns)**:

| Col# | Plan/Oral Name | Live DOM Actual | Correction Type |
|------|---------------|-----------------|-----------------|
| 10 | Use Equipment QC | Use Equip QC | Name abbreviated |
| 26 | Default Job to 1 day Event | Default Job to 1 day for Event Orders | Name expanded |
| 27 | Default Job to 1 day Outside | Default Job to 1 day for Outside Orders | Name expanded |
| 28 | Default Job to 1 day Internal | Default Job to 1 day for Internal Orders | Name expanded |
| 30 | Allow tentative+confirmed same priority | Allow tentative and confirmed Status to have the same priority | Full text |
| 31 | Items Filled Return to Availability | Items Filled from Requests Return to Availability | Name expanded |

---

*Last Updated: 2026-04-13 — Live UI verified via MCP Playwright (location 1604, all 8 right-panel tabs + left panel + Management History + Local Office Settings)*

---

### Local Office Settings Page

**URL**: `/navigator/locations/{officeId}/settings/local-office`
**Page Title**: "Local Office Settings"
**Location tested**: 1604 (Parker Palm Springs, USA)
**3 outer tabs**: Basic Information | Location Settings History | ECT Settings

> **Do NOT confuse with `/settings/location`** — that is a separate page (Location Settings) with different tabs (Local Information, Legal, Pricing, Currency, Account & Address, etc.). This page covers Local Office Settings only.

---

#### Tab: Basic Information

Single **Save** button at top — disabled by default; enables when any field changes.

##### Save dialog + post-save toast [MCP-VERIFIED 2026-04-23 — SP-DQU-02 neutral-eye audit + field-inventory artifact `local-office-settings-2026-04-27.md`]

Clicking the Save button on the Basic Information tab opens the shared "Save Changes" Radix `alertdialog` (testid `location-settings-modal-save-changes`):

- **Dialog title** (verbatim): `Save Changes`
- **Dialog body** (verbatim): `Are you sure you want to save the changes?`
- **Dialog buttons** (in order, verbatim): `Cancel`, `Save` (NOT `Cancel`/`Ok` — Local Office Settings differs from Location Settings on this point; see line ~996 for the Location Settings `Cancel`/`Ok` variant)

After clicking `Save` in the dialog, the save commits and a toast notification is shown in the page-level notifications region:

- **Notifications region locator**: `aria-label="Notifications alt+T"`
- **Toast text** (verbatim): `Local office settings updated`
- **Toast duration**: transient (auto-dismisses)

Tab-switch with a dirty (unsaved) form opens a separate `Unsaved changes` alertdialog with body `Are you sure you want to leave this view? Any unsaved changes will be lost.` and buttons `Stay`, `Discard`.

##### Section: Default Date Offsets

Six numeric text inputs. Each has an "Hrs" suffix label. All enabled (editable) by default.

| Field Label | `name` attr | Value (1604) |
|---|---|---|
| Prep Date Offset (Relative to Start) | `prepDateOffsetHours` | -1 |
| Return Date Offset (Relative to End) | `returnDateOffsetHours` | 1 |
| Set Date Offset (Relative to Start) | `setDateOffsetHours` | -1 |
| Strike Date Offset (Relative to End) | `strikeDateOffsetHours` | 1 |
| Delivery Date Offset (Relative to Start) | `deliveryDateOffsetHours` | 0 |
| Pickup Date Offset (Relative to End) | `pickupDateOffsetHours` | 0 |

**Validation (live confirmed 2026-04-06, NM-1264 + MCP-5/6 findings; Return + Prep constraints re-verified 2026-04-23 SP-DQU-02 neutral-eye audit)**:

*Positivity constraints (per field type)*:
- "Relative to Start" fields (Prep, Set, Delivery) accept **negative or zero** values. Positive value → `aria-invalid="true"` and Save disabled. Empty is also accepted (treated as null per NM-1453 below).
- "Relative to End" fields (Return, Strike, Pickup) accept **zero, positive, or empty** values. Negative value → `aria-invalid="true"` and Save disabled. Empty is also accepted (treated as null per NM-1453 below).

*Cross-field validation (NM-1264 — ONLY live rule):*
- Delivery Date Offset must be >= Prep Date Offset (both Relative to Start)
- When Delivery < Prep: Save button disables; no inline error message visible in DOM
- Save re-enables when the constraint is satisfied

*Cross-validators NOT implemented in live app (MCP-5/6 verified 2026-04-06):*
- Set >= Delivery — **NOT ENFORCED** (no `aria-invalid` when violated)
- Return >= Strike — **NOT ENFORCED**
- Return >= Pickup — **NOT ENFORCED**
- Pickup >= Strike — **NOT ENFORCED**
- The v1 `Validate()` spec describes these paths but the Angular implementation only wires NM-1264.

*Non-numeric input:*
- Typing non-numeric text (e.g., "abc") into any offset field → `aria-invalid="true"` (synchronous, same-field).
- Non-numeric input corrupts Angular's internal model to NaN. Typing a valid value back does NOT reliably fix the model — **page reload is the only safe cleanup** (LR-011).

*Null/empty offsets (NM-1453, MCP-7 verified 2026-04-06):*
- Clearing an offset field → Save → Reload preserves **empty string** (not "0"). Null offsets are a valid state.
- Clearing Prep while Delivery has a value does NOT trigger NM-1264 cross-validation (Prep is treated as absent).

*MaxLen boundaries:*
- Prep Date Offset: `maxLength=3`
- Set Date Offset: `maxLength=4`
- Other offset fields: not explicitly constrained (accept longer input)

##### Section: Misc Settings

| Field | Type | Default (1604) | State |
|---|---|---|---|
| Use Fulfillment | checkbox | unchecked | enabled |
| Use Availability | checkbox | checked | enabled |
| Use Equipments QC | checkbox | unchecked | **conditionally disabled** — disabled when Use Fulfillment is unchecked, enabled when Use Fulfillment is checked [MCP-VERIFIED 2026-04-23 SP-DQU-02 audit; corrects prior "always disabled" doc] |
| Items Filled from Requests Return to Availability | checkbox | unchecked | enabled |
| Allow tentative and confirmed Status to have the same priority | checkbox | unchecked | enabled |
| Print Description (Default) | checkbox | checked | enabled |
| Use ServiceType for Subrental Inventory Sources | checkbox | checked | enabled |
| Phone 1 | textbox | 760-883-1957 | enabled; **required** |
| Phone 2 | textbox | (empty) | enabled; optional |
| Default new job to 1 day — Event | checkbox | unchecked | enabled |
| Default new job to 1 day — Outside | checkbox | unchecked | enabled |
| Default new job to 1 day — Internal | checkbox | unchecked | enabled |
| Default Order Type | combobox | Event | enabled |
| PO Number | textbox | (empty) | enabled |
| PO Number Label | textbox | (empty) | enabled |

##### Section: Section Configuration

- **Use Section** — checkbox, checked, enabled
- **Default** — button (resets sections to defaults)
- Table: 2 columns — Section Name (editable textbox per row), Active (toggle)
- Add new row: textbox with `placeholder="Add new..."` at bottom of table
- **Duplicate active name → Save disables + "Duplicate Name" warning** (NM-1223)
- **Empty/whitespace name → reverts to previous value** on blur/Tab (MCP-1, 2026-04-06)
- **Escape key does NOT cancel editing** — typed value persists after Escape (no custom keydown handler; MCP verified 2026-04-06)
- **No delete UI** — sections cannot be removed from the grid (MCP-9, 2026-04-06)

**Sections for 1604** (13 rows; 9 active, 4 inactive via toggle SVG check):

| Section Name | Active |
|---|---|
| Audio | active |
| Flipcharts | active |
| Hybrid Meeting | active |
| Labor | active |
| Lighting | active |
| Power | **inactive** |
| Presenter Support | active |
| Projection | active |
| Rigging | **inactive** |
| Scenic | active |
| Staging | **inactive** |
| Video | active |
| Whiteboard | **inactive** |

##### Section: Room Configuration

- Table: 2 columns — Room Configuration Name, Active
- Location 1604: **no rows configured** (empty table)
- Add new row: textbox with `placeholder="Add new..."`
- Same duplicate-active-name rule as Section Configuration (NM-1223)
- **Empty/whitespace name → reverts to previous value** on blur (same mechanism as sections; MCP-8, 2026-04-06)
- **No delete UI** — rooms cannot be removed from the grid (MCP-9, 2026-04-06)
- Room toggle (active/inactive) persists through save+reload round-trip

##### Section: Default Logo [MCP-VERIFIED 2026-04-23 — SP-DQU-02 neutral-eye audit + field-inventory artifact `local-office-settings-2026-04-27.md`]

| Element | Type | Default (1604) | State | testid |
|---|---|---|---|---|
| Quotes | checkbox | checked | enabled | `local-office-settings-checkbox-use-quote-logo` |
| Rental Orders/DROs | checkbox | checked | enabled | `local-office-settings-checkbox-use-rental-logo` |
| Company Logo | combobox | Encore New Logo | enabled (12 options) | `local-office-settings-select-company-logo` |
| Logo preview | image | Encore New Logo artwork | display only | `local-office-settings-logo-preview` |

> **Note**: This is a combobox for selecting a pre-uploaded logo (not a file upload input), plus two checkboxes controlling which document types display the logo. The two checkbox labels in the live DOM are `Quotes` and `Rental Orders/DROs` verbatim — earlier prose elsewhere in the codebase referenced labels like "Use Default Proposal Logo" and "Use Default Convention Services Logo", which do NOT exist in the current DOM. For office 1604 both checkboxes default to checked.

##### Section: Discount Exemptions

- Table: 2 columns — Service Type, Exempt (toggle per row)
- 75 service type rows for 1604
- Toggle active (img present) = exempt for that service type

---

#### Tab: Location Settings History

**Purpose**: Read-only history of Local Office Settings changes for this location.

**UI**:
- Filter dropdown at top (default: "Location Management History") [MCP-CORRECTED 2026-04-13: was "Location Settings History" — dropdown always shows "Location Management History" as default regardless of page. Tab name ≠ dropdown option name]
- Read-only table — no add, edit, delete, or row selection
- Empty state: "No results." shown when no history records exist. Office 1604 does NOT exercise this state (has 61 pages of data per SP1 MCP 2026-04-13). TC-LOS-HIS-003 rewritten 2026-04-15 to assert populated state on 1604 instead.
- Pagination: 20 rows/page (combobox), first/prev/next/last buttons, page indicator "{n}/{total}"

**42 columns confirmed live** (sorted by sort button presence — "Local Office" column has no sort button; all others do):

| # | Column Header |
|---|---|
| 1 | Local Office |
| 2 | Prep Date Offset |
| 3 | Return Date Offset |
| 4 | Set Date Offset |
| 5 | Strike Date Offset |
| 6 | Pickup Date Offset |
| 7 | Delivery Date Offset |
| 8 | Use Fulfillment |
| 9 | Use Availability |
| 10 | Use Equip QC |
| 11 | Print Desc |
| 12 | Use Subrent |
| 13 | Phone1 |
| 14 | Phone2 |
| 15 | Use Sect. |
| 16 | Section Name |
| 17 | Sect. Action |
| 18 | Logo Name |
| 19 | Use On Quote |
| 20 | Use On Rental |
| 21 | Service Type - Exempt |
| 22 | ST Action |
| 23 | Action |
| 24 | Notes |
| 25 | Marriott PMS Account Enabled |
| 26 | Default Job to 1 day for Event Orders | [MCP-CORRECTED: was "Default Job to 1 day Event"] |
| 27 | Default Job to 1 day for Outside Orders | [MCP-CORRECTED: was "Default Job to 1 day Outside"] |
| 28 | Default Job to 1 day for Internal Orders | [MCP-CORRECTED: was "Default Job to 1 day Internal"] |
| 29 | Default Labor to Hourly |
| 30 | Allow tentative and confirmed Status to have the same priority | [MCP-CORRECTED: was "Allow tentative+confirmed same priority"] |
| 31 | Items Filled from Requests Return to Availability | [MCP-CORRECTED: was "Items Filled Return to Availability"] |
| 32 | Default Order Type |
| 33 | Regular Hours |
| 34 | Regular Hours Multiplier |
| 35 | Over Time Hours |
| 36 | OverTime Hours Multiplier |
| 37 | Double Time Hours |
| 38 | DoubleTime Hours Multiplier |
| 39 | Holiday Multiplier |
| 40 | Recalc Labor Hours |
| 41 | Modified By |
| 42 | Modified On |

**Confirmed**: "Default Job to 1 day for Outside Orders" appears **once** (NM-1261 resolved).
Columns 33–40 (labor-to-hourly) are present in history even for US locations; they are Canada-only fields on the Basic Information tab but tracked in history globally.

**Sortable Columns** (38 of 42) [MCP-VERIFIED 2026-04-13]: All columns except Local Office, Section Name, Service Type - Exempt, and Notes (those have plain text, no sort button).

**History Tracking Rules** [MCP-VERIFIED 2026-04-13, Location 1604]:

| Rule | Detail |
|------|--------|
| Snapshot model | 1 save = 1 new history row (full row snapshot, regardless of fields changed) |
| Cross-system independence | Saves on Local Office Settings do NOT appear in Location Management History |
| Table refresh | New row visible immediately on tab switch after save (no page reload needed) |
| Populated data | Location 1604: 61 pages (~1204 rows). NOT empty |

**Data Formats** [MCP-VERIFIED 2026-04-13]:

| Format | Representation | Example |
|--------|---------------|---------|
| Boolean TRUE | SVG checkmark icon (`<svg class="lucide lucide-check">`) | Col 8 Use Fulfillment |
| Boolean FALSE | Empty cell (no content) | Col 8 when unchecked |
| Date offset | Plain integer | "-1", "1", "0" |
| Timestamp | MM/DD/YYYY HH:MM:SS AM/PM | "04/08/2026 08:31:45 AM" |
| Section data | Pipe-separated key-value | "Projection - true \| Audio - true \| ..." |
| Exemption | Pipe-separated key-value | "HSIA - Labor - true \| ..." |
| ECT hours | Plain number | "24" |
| ECT multipliers | Decimal | "1", "1.5", "2" |
| Empty/null | Empty string "" | No "null" or "N/A" |

**CRITICAL**: Local Office History uses SVG `lucide-check` icons for booleans (textContent returns "" for both true and false). Location Management History uses Unicode "✔". Detection requires `innerHTML.includes('lucide-check')`.

**NOT-TRACKED Fields** — Fields saved by existing specs that have NO corresponding column in 42-col history:

| Field | Spec | Notes |
|-------|------|-------|
| PO Number (txtPoNumber) | TC-LOS-BAS-023, BAS-039 | Not in 42 columns |
| PO Number Label (txtPoNumberLabel) | TC-LOS-BAS-024 | Not in 42 columns |
| Room toggle/rename | TC-LOS-BAS-048, BAS-049 | Not in 42 columns |
| BenefitsMultiplier | TC-LOS-ECT-005, ECT-016 | ECT editable — not tracked |
| HistoricalSubrental | TC-LOS-ECT-013, ECT-016 | ECT editable — not tracked |
| LaborCost rows | TC-LOS-ECT-009, ECT-014, ECT-015 | ECT editable — not tracked |

**Test Architecture (2026-04-20 pivot)**: History coverage lives exclusively in the dedicated hist spec (`tests/specs/setup/local-office/local-office-history.spec.ts`). Each hist column has its own `describe()` block enumerating state-space per the root field's control type (per D1.a taxonomy). Basic-info specs carry NO history code. See [PLAN_HIST_COLUMN_FIRST_PIVOT.md](../../../plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md) and the per-surface root-column catalogs (created by SP-B-LO-* sessions).

---

#### Tab: ECT Settings

**Header**: "1604 - Parker Palm Springs"
**Currency selector**: combobox at top (default "USD")
**Commission link**: "Edit/View: Commission structure" (external URL)

##### Sub-section: Event Profit Target

- Table: 4 columns (Lower Limit, Upper Limit, Target, Currency) — **read-only display** (no input fields)

| Lower Limit | Upper Limit | Target | Currency |
|---|---|---|---|
| $5,000.01 | $10,000.00 | 41.0% | USD |
| $10,000.01 | $25,000.00 | 40.0% | USD |
| $25,000.01 | $50,000.00 | 35.0% | USD |
| $50,000.01 | $100,000.00 | 30.0% | USD |
| $100,000.01 | $250,000.00 | 30.0% | USD |
| $250,000.01 | $500,000.00 | 30.0% | USD |
| $500,000.01 | $1,000,000.00 | 30.0% | USD |
| $1,000,000.01 | $2,000,000.00 | 30.0% | USD |
| $2,000,000.01 | $10,000,000.00 | 30.0% | USD |

##### Sub-section: Fixed Costs

| Field | Value (1604/USD) | State |
|---|---|---|
| Venue Fixed Costs | 13.9% | display only |
| SG&A % | 8.0% | display only |
| Benefits Multiplier | 20.0% | **editable** textbox (`data-testid="ect-settings-input-benefits-multiplier"`) |
| Other Rate | 0.0% | display only |
| No Labor Rate | 0.0% | display only |
| Approval Threshold | $10,000,000.00 | display only |
| Historical Subrental % | 0.0% | **editable** textbox (`data-testid="ect-settings-input-historical-subrental"`) — disabled when user lacks Production & Sales role (NM-1260) |
| Peak Labor Adjustment % | 5.0% | display only |
| Non-Peak Labor Adjustment % | 0.0% | display only |

- **Fixed Costs Save button** (`btnSaveFixedCosts`) — disabled by default; enables when Benefits Multiplier or Historical Subrental % is edited

##### Sub-section: Labor Cost Assumptions [MCP-VERIFIED 2026-04-23 — SP-DQU-02 neutral-eye audit + field-inventory artifact `local-office-settings-2026-04-27.md`]

- **Labor Costs Save button** (`btnSaveLaborCosts`) — disabled by default; enables when any Labor Cost cell is edited
- Table: 2 columns (Labor Class, Labor Cost)
- **66 rows** — all Labor Cost cells are editable textboxes (`data-testid="ect-settings-input-labor-cost-{0..65}"`)
- First row Labor Class: `Administrative Fee` (testid `ect-settings-input-labor-cost-0`)
- Last row Labor Class: `zzzFinishing Service`
- Representative labor classes: Administrative Fee, Audio - Operate/Show, Audio - Set/Strike, Computer - Operator/Show, Driver, Electrical - Set/Strike, Event Management, General AV - Set/Strike, Lighting - Set/Strike, Production - Set/Strike, Projection - Set/Strike, Rigging, Union - Set/Strike, Video - Set/Strike, Virtual Events Labor (66 total)

> **Default value note (Administrative Fee + other Labor Cost cells)**: numeric values for Labor Cost cells are office-state-dependent and persist across saves; per LR-015 the documented "default" must come from a fresh, slate-cleared office observed via MCP. Office 1604 has been heavily modified by prior test runs and is NOT a clean baseline. Reviewer feedback flagged a value of `42` for Administrative Fee; the SP-DQU-02 neutral-eye audit (2026-04-23) observed live `0.00` on office 1604; the prior TC text claimed `35.00`. None of these is a verified "true default". Until a fresh-location MCP walk establishes the true default, TC assertions on Labor Cost values are structural (field is editable, first-row label is `Administrative Fee`, last-row label is `zzzFinishing Service`) rather than numeric. See SP-DQU-03 TC-LOS-ECT-008 for the structural-assertion implementation, and Track G of `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` for the planned slate-clear pattern.

##### Sub-section: SubRental Matrix

- Table: 4 columns (Lower Limit, Upper Limit, Subrental Percentage, Currency) — **read-only display** (no inputs)

| Lower Limit | Upper Limit | Subrental % | Currency |
|---|---|---|---|
| $0.00 | $4,999.00 | 0.9% | USD |
| $5,000.00 | $9,999.00 | 0.6% | USD |
| $10,000.00 | $19,999.00 | 0.9% | USD |
| $20,000.00 | $49,999.00 | 1.6% | USD |
| $50,000.00 | $99,999.00 | 2.7% | USD |
| $100,000.00 | $249,999.00 | 4.7% | USD |
| $250,000.00 | $499,999.00 | 7.9% | USD |
| $500,000.00 | $999,999.00 | 10.6% | USD |
| $1,000,000.00 | $10,000,000.00 | 13.5% | USD |

---

## Auth Protocol

Authoritative reference for auth flow parameters when agents need to know what auth Encore uses. Full narrative is in `## Authentication System` (L11) above — this is the named anchor agents reference from their Client Context Bootstrap.

- **Provider**: Microsoft SSO (Azure AD / Entra ID)
- **MFA**: TOTP (Time-based One-Time Password) — seed stored in `NAVIGATOR_MFA_SECRET` env var
- **Session model**: `authenticatedSession` fixture at `clients/encore/tests/setup/fixtures.ts` — worker-scoped, fresh login per worker
- **OAuth discovery URL**: `https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration` (see `clients/encore/tests/setup/global-setup.ts`)
- **"Stay signed in?" prompt**: auto-accepted during login (see `loginPage.loginWithMicrosoft`)
- **Redirect target after auth**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/<office>/home`

Different clients will replace this section with their own auth provider + flow. Agents read this section rather than assuming "SSO = Microsoft" or "MFA = TOTP".

---

## Authorized Test Data

Agents must use ONLY the values listed here. Other values = rejection by the app or out-of-scope exploration. This is the anchor referenced by ALL-013 and by the `Client Context Bootstrap` directive in `AGENT_SHARED_RULES.md` §8.

### Authorized office / location IDs

| ID | Label | Status | Notes |
|---|---|---|---|
| `1604` | Standard test location | **AUTHORIZED** | Used by 95%+ of existing specs. Default unless user names another. |
| `1099` | Alternate (MCP discovery only) | USE-WITH-CAUTION | Referenced in MCP-3 Oracle delete test (BUG-LI-001). Do not use for persistent changes. |
| any other | — | **PROHIBITED** | Never invent or guess locations. Ask user if 1604 is insufficient. |

### Authorized user accounts

Credentials live in `clients/encore/config/environments/.env.development` (committed to git by design):

- `NAVIGATOR_USERNAME` — Microsoft SSO email (production test account)
- `NAVIGATOR_PASSWORD` — SSO password
- `NAVIGATOR_MFA_SECRET` — base32 TOTP seed

Do NOT hardcode any of these values in specs, test data, page objects, or agent prompts. Always read from env.

### Authorized client / entity IDs

Populate as discovered during MCP sessions. If an agent encounters a client/entity ID not listed here, file a mistake entry (§Mistake Detection Triggers) and ask the user before adopting.

---

## Module Naming Conventions

Used by all pipeline agents when generating files, test IDs, selectors, module references. Anchor for the `Module Naming Conventions` reference in agent prompts and the `Client Context Bootstrap` directive.

### Test Case ID prefixes

| Prefix | Scope | Example |
|---|---|---|
| `TC-LOC-LI-*` | Location Management — Local Information tab | `TC-LOC-LI-003` |
| `TC-LOC-HIST-*` | Location Management — History tab | `TC-LOC-HIST-012` |
| `TC-LOC-*` | Location Management — general (non-tab-specific) | `TC-LOC-001` |
| `TC-ECT-*` | Local Office Settings — Event Cost Type | `TC-ECT-012` |
| `TC-PRC-*` | Location Management — Pricing tab | `TC-PRC-018` |
| `TC-LOS-*` | Local Office Settings (general) | `TC-LOS-005` |

New modules: propose prefix via `clients/encore/docs/MODULE_REGISTRY.md` before creating any TC.

### Selector data-testid conventions

- Per ALL-056, every interactive element (button, input, select, link) should have a `data-testid`. The Encore app generates these server-side (see ALL-059 "Encore's AI generates data-testid for ALL elements").
- Common prefix patterns:
  - `location-settings-btn-*` — buttons on location settings tabs
  - `location-settings-input-*` — input fields
  - `location-settings-dlg-*` — dialogs
  - `ect-*` — Event Cost Type form elements (Local Office Settings)
  - `shared-*` — cross-page shared elements (Save Changes dialog, nav bar)
- When a testid is missing: file via ALL-056 (`[MISSING_TESTID]` tag) — do NOT fabricate one.

### File / directory naming

- Spec files: `{module-kebab}.spec.ts` at `clients/encore/tests/specs/{section}/{module}/`
- Page objects: `{module-kebab}.page.ts` at `clients/encore/src/pages/{section}/{module}/`
- Selectors: `{module-kebab}.ts` at `clients/encore/src/selectors/{section}/{module}/`
- Test data: `{module-kebab}.data.ts` at `clients/encore/tests/test-data/{section}/{module}/`
- Shared constants / cross-module: `common.data.ts`, `shared.ts`

See `clients/encore/docs/MODULE_REGISTRY.md` for the complete module→directory mapping.
