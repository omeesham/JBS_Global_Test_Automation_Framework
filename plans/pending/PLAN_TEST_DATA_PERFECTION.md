# PLAN: Test Data Perfection (TypeScript Layer)

**Priority**: P1 — Foundation for future CSV conversion
**Depends on**: None
**Blocks**: PLAN_TEST_DATA_CSV_CONVERSION

---

## Context

All test data currently lives in `tests/test-data/` as TypeScript `.data.ts` files (good baseline). However, a deep audit of all 11 spec files reveals **150+ hardcoded values** that should be extracted. Additionally, existing data files lack spec-traceability comments — humans can't tell which specs consume which data without reading imports. This plan perfects the TS test data layer so the future CSV conversion (separate plan) has a clean, complete source to convert from.

---

## Audit Findings — What Needs Extraction

### HIGH severity (25+ hardcoded values each)

**1. `local-office-settings.spec.ts`**
- Date offset test values: `'-2'`, `'-5'`, `'-10'`, `'0'`, `'abc'` (lines 37-93)
- Phone test values: `'not-a-phone'`, `'555-123-4567'`, `'555-000-1111'` (lines 147-172)
- Section names: `'AV Services'`, `'Audio Visual'`, `'Test Section'` (lines 260-267)
- Room name: `'Ballroom A'` (line 286)
- XSS payload: `'<script>alert(1)</script>'` (line 362)
- PO test values: `'PO-TEST-123'`, `'Purchase Order #'` (lines 214-229)
- Order type values: `'Event'`, `'Outside'` (lines 196-208)
- Logo options count: `12` (line 302)
- Section count: `13` (line 242)

**2. `local-office-ect.spec.ts`**
- Location display: `'1604 - Parker Palm Springs'` (line 14)
- Currency: `'USD'` (lines 16, 22)
- Label text: `'Event Profit Target'`, `'Labor Cost Assumptions'`, `'SubRental Matrix'` (lines 26, 81, 117)
- Row counts: `9`, `66`, `9` (lines 27, 82, 118)
- Benefits Multiplier values: `'20.0%'`, `'0.25'`, `'25.0%'`, `'0.2'`, `'0.21'` (lines 39-131)
- Historical Subrental: `'0.1'` (line 53)
- Labor cost values: `'41.00'`, `'42'`, `'41'` (line 96)
- Labor class names: `'Administrative Fee'`, `'zzzFinishing Service'` (lines 83-84)
- Non-numeric input: `'abc'` (line 111)

**3. `location-notes.spec.ts`**
- ~35 hardcoded character count numbers derived from imported strings (lines 25-237)
- Counter text assertions: `'0/4000'`, `'25/4000'`, `'0 Left'`, `'4001/4000'` (lines 25, 38, 92, 226)
- Keyboard test string: `'Keyboard test'`, `'a'` (lines 204, 237)

**4. `location-pricing.spec.ts`**
- **Inline test data objects** (MUST extract):
  - `CHECKBOX_PERSISTENCE_CASES` (2 items, lines 343-346)
  - `DROPDOWN_PERSISTENCE_CASES` (5 items, lines 377-382) — includes pricebook names like `'2026-Zone 3 D'`, `'2026-Tier 2 Resort B'`
- Hardcoded dates: `'04/01/2026'`, `'04/30/2026'` (lines 306-311)
- Default assertions: `'All'` currency filter (line 50)

### MEDIUM severity (8-15 hardcoded values)

**5. `location-auto-addon.spec.ts`**
- Save dialog text: `'Save Changes'`, `'Are you sure you want to save the changes?'` (lines 66-67)
- Unsaved dialog text: `'Unsaved changes'`, `'Are you sure you want to leave this view?...'` (lines 143-145)
- URL paths: `'/settings/location'`, `'/home'` (lines 157, 171)

**6. `location-currency.spec.ts`**
- Merchant IDs: `'316370'`, `'316426'`, `'316446'` (used 8+ times)
- Merchant display strings: `'316446 - PSAV Canada/CAD'`, `'316370 - PSAV US/USD'`, `'316426 - Encore Bahamas/USD'` (lines 107-125)
- Currency code: `'USD'` (line 38)
- Grid row count: `3` (line 20)

**7. `location-local-information.spec.ts`**
- Billing type: `'Master'` (line 40)
- Oracle Product test values: `'PROD001'`, `'0000'` (lines 159-163)
- Special chars: `'TEST@#$%&*()'` (line 219)
- Department test: `'DEPT001'`, `'CHG'`, `'900'` (lines 195-237)

**8. `local-office-history.spec.ts`**
- Combobox value: `'Location Management History'` (line 14)
- Options array: `['Location Management History', 'Location Management Legacy History']` (lines 31-32)
- Column header count: `42` (line 20)
- Pagination count: `4` (line 38)

### LOW severity (well-structured, minor issues)

**9. `location-account-address.spec.ts`** — 5 values (URL path, phone test `'111-222-3333'`)
**10. `location-legal.spec.ts`** — 5 values (row count `1`, language `'US English'`, option counts `114`, `50`)
**11. `location-shared-setup-locations.spec.ts`** — 8 values (dialog heading `'Change Local Office'`, row counts)

---

## Subplan Structure

### SP-01: Add spec-traceability comments to ALL existing data files

**Files to modify** (10 files):
- `tests/test-data/common.data.ts`
- `tests/test-data/setup/local-office/local-office-settings.data.ts`
- `tests/test-data/setup/locations/location-account-address.data.ts`
- `tests/test-data/setup/locations/location-auto-addon.data.ts`
- `tests/test-data/setup/locations/location-currency.data.ts`
- `tests/test-data/setup/locations/location-legal.data.ts`
- `tests/test-data/setup/locations/location-local-info.data.ts`
- `tests/test-data/setup/locations/location-notes.data.ts`
- `tests/test-data/setup/locations/location-pricing.data.ts`
- `tests/test-data/setup/locations/location-shared-setup-locations.data.ts`

**Comment format** (every exported constant gets):
```typescript
/**
 * @specs tests/specs/setup/locations/location-currency.spec.ts
 * @tc TC-LOC-CUR-003, TC-LOC-CUR-004
 * @fields Currency checkbox states (Selected, Is Default) for CAD and MXN
 * @verified office 1604, 2026-03-XX
 */
export const UNSELECTED_CURRENCY_STATES = [ ... ];
```

**File-level header** (top of every data file):
```typescript
/**
 * Test data for: [Feature Name]
 * Consumed by: [list of spec file relative paths]
 * Office: 1604 (Parker Palm Springs)
 * Last verified: [date]
 *
 * HUMAN NOTE: Changing values here affects the listed specs.
 * Each constant documents which test cases depend on it.
 */
```

**Work**: Read each spec file's imports to build the exact spec-to-data mapping. Add JSDoc to every export.

---

### SP-02: Extract hardcoded data from `local-office-settings.spec.ts`

**New/modified data file**: `tests/test-data/setup/local-office/local-office-settings.data.ts`

**Constants to add**:
```typescript
// Date offset test values (TC boundary/recovery tests)
export const DATE_OFFSET_TEST_VALUES = {
  valid: '-2',
  invalid: 'abc',
  deliveryInvalid: '-5',
  zero: '0',
  extremeNegative: '-10',
  recovery: '-1',
} as const;

// Phone number test values
export const PHONE_TEST_VALUES = {
  invalid: 'not-a-phone',
  testFormat: '555-123-4567',
  recovery: '555-000-1111',
} as const;

// Section editing test values
export const SECTION_TEST_VALUES = {
  rename: 'AV Services',
  originalName: 'Audio Visual',
  newSection: 'Test Section',
} as const;

// Room test values
export const ROOM_TEST_VALUES = {
  testRoom: 'Ballroom A',
} as const;

// Order type test values
export const ORDER_TYPE_VALUES = {
  default: 'Event',
  options: ['Event', 'Outside'] as const,
  alternate: 'Outside',
} as const;

// Misc test values
export const PO_TEST_VALUES = {
  number: 'PO-TEST-123',
  label: 'Purchase Order #',
} as const;

export const XSS_PAYLOAD = '<script>alert(1)</script>';
export const LOGO_OPTIONS_COUNT = 12;
```

**Spec changes**: Replace all hardcoded literals with imported constants.

---

### SP-03: Extract hardcoded data from `local-office-ect.spec.ts`

**New data file**: `tests/test-data/setup/local-office/local-office-ect.data.ts`

**Constants to add**:
```typescript
// ECT page identifiers
export const ECT_PAGE = {
  locationDisplay: '1604 - Parker Palm Springs',
  currency: 'USD',
} as const;

// Grid section metadata
export const ECT_SECTIONS = {
  eventProfitTarget: { label: 'Event Profit Target', rowCount: 9 },
  laborCostAssumptions: { label: 'Labor Cost Assumptions', rowCount: 66 },
  subRentalMatrix: { label: 'SubRental Matrix', rowCount: 9 },
} as const;

// Benefits Multiplier test values
export const BENEFITS_MULTIPLIER = {
  defaultDisplay: '20.0%',
  testInput: '0.25',
  expectedAfterSave: '25.0%',
  restoreValue: '0.2',
  altTestValue: '0.21',
} as const;

// Historical Subrental test values
export const HISTORICAL_SUBRENTAL = {
  testValue: '0.1',
} as const;

// Labor cost test values
export const LABOR_COST_TEST = {
  currentValue: '41.00',
  testValue: '42',
  altValue: '41',
  firstClass: 'Administrative Fee',
  lastClass: 'zzzFinishing Service',
  invalidInput: 'abc',
} as const;
```

---

### SP-04: Extract hardcoded data from `location-notes.spec.ts`

**Modified data file**: `tests/test-data/setup/locations/location-notes.data.ts`

**Constants to add** (computed from existing string constants):
```typescript
// Character counts (derived from string constants above)
export const NOTE_CHAR_COUNTS = {
  textShort: NOTE_TEXT_SHORT.length,        // 25
  row1: NOTE_ROW1.length,                   // 10
  row2: NOTE_ROW2.length,                   // 11
  hello: NOTE_HELLO.length,                 // 5
  world: NOTE_WORLD.length,                 // 5
  end: NOTE_END.length,                     // 3
  saved: NOTE_SAVED.length,                 // 18
  persistent: NOTE_PERSISTENT.length,       // 15
  maxLength: 4000,
} as const;

// Counter format helper (used in assertions)
export const noteCounter = (chars: number) => `${chars}/4000`;
export const NOTE_COUNTER_EMPTY = '0/4000';
export const NOTE_COUNTER_FULL = '0 Left';

// Keyboard test values
export const KEYBOARD_TEST = {
  text: 'Keyboard test',
  singleChar: 'a',
} as const;
```

**Spec changes**: Replace all `'25/4000'`, `'0/4000'` etc. with `noteCounter(NOTE_CHAR_COUNTS.textShort)`, `NOTE_COUNTER_EMPTY`, etc. Replace hardcoded `25`, `10`, `11`, `5`, etc. with `NOTE_CHAR_COUNTS.x`.

---

### SP-05: Extract hardcoded data from `location-pricing.spec.ts`

**Modified data file**: `tests/test-data/setup/locations/location-pricing.data.ts`

**Constants to add**:
```typescript
// Inline test data objects (extracted from spec lines 343-382)
export const CHECKBOX_PERSISTENCE_CASES = [
  { tcId: 'TC-LOC-PRI-024', key: 'chkPriceGuideInclusive', label: 'Include Service Fee in Price Guides' },
  { tcId: 'TC-LOC-PRI-025', key: 'chkCorporatePricing', label: 'Corporate Pricing' },
] as const;

export const DROPDOWN_PERSISTENCE_CASES = [
  { tcId: 'TC-LOC-PRI-026', key: 'drpPrimaryLaborPricing', option: '2026-Zone 3 D', label: 'Primary Labor Pricing' },
  { tcId: 'TC-LOC-PRI-027', key: 'drpPrimaryEquipmentPricing', option: '2026-Tier 2 Resort B', label: 'Primary Equipment Pricing' },
  { tcId: 'TC-LOC-PRI-028', key: 'drpPrimaryInternalEquipmentPricing', option: '2023-Internal2', label: 'Primary Internal Equipment Pricing' },
  { tcId: 'TC-LOC-PRI-029', key: 'drpPrimaryProductionLaborPricing', option: '2026-NP LB3', label: 'Primary Production Labor Pricing' },
  { tcId: 'TC-LOC-PRI-030', key: 'drpPrimaryProductionEquipmentPricing', option: '2026-NP Tier 2', label: 'Primary Production Equipment Pricing' },
] as const;

// Date test values for effective dates testing
export const DATE_TEST_VALUES = {
  startDate: '04/01/2026',
  endDate: '04/30/2026',
} as const;

// Default filter value
export const DEFAULT_CURRENCY_FILTER = 'All';
```

---

### SP-06: Extract hardcoded data from `location-auto-addon.spec.ts`

**New/modified data file**: `tests/test-data/setup/locations/location-auto-addon.data.ts`

**Constants to add**:
```typescript
// Dialog text constants (shared across multiple specs)
export const SAVE_DIALOG = {
  heading: 'Save Changes',
  body: 'Are you sure you want to save the changes?',
} as const;

export const UNSAVED_DIALOG = {
  heading: 'Unsaved changes',
  body: 'Are you sure you want to leave this view? Any unsaved changes will be lost.',
} as const;
```

**Note**: These dialog strings appear in multiple specs (auto-addon, account-address, pricing). Consider putting shared dialog text in `common.data.ts` if 3+ specs use the same strings.

---

### SP-07: Extract hardcoded data from `location-currency.spec.ts`

**Modified data file**: `tests/test-data/setup/locations/location-currency.data.ts`

**Constants to add**:
```typescript
// Merchant data for office 1604
export const MERCHANT_DATA = {
  usd: { id: '316370', display: '316370 - PSAV US/USD' },
  bahamas: { id: '316426', display: '316426 - Encore Bahamas/USD' },
  canada: { id: '316446', display: '316446 - PSAV Canada/CAD' },
} as const;

// Default USD currency assertion
export const DEFAULT_CURRENCY = 'USD';

// Grid structure
export const CURRENCY_GRID_ROW_COUNT = 3;
```

---

### SP-08: Extract hardcoded data from MEDIUM/LOW severity specs

**`location-local-information.spec.ts`** — add to `location-local-info.data.ts`:
```typescript
export const LOCAL_INFO_TEST_VALUES = {
  billingType: 'Master',
  oracleProductTest: 'PROD001',
  oracleProductDefault: '0000',
  oracleDeptTest: 'DEPT001',
  oracleDeptShort: 'CHG',
  oracleDeptDefault: '900',
  specialChars: 'TEST@#$%&*()',
} as const;
```

**`local-office-history.spec.ts`** — new `tests/test-data/setup/local-office/local-office-history.data.ts`:
```typescript
export const HISTORY_COMBOBOX = {
  default: 'Location Management History',
  options: ['Location Management History', 'Location Management Legacy History'],
} as const;

export const HISTORY_GRID = {
  columnHeaderCount: 42,
  paginationButtonCount: 4,
} as const;
```

**`location-legal.spec.ts`** — add to `location-legal.data.ts`:
```typescript
export const LEGAL_GRID = {
  defaultRowCount: 1,
  serviceChargeOptionsCount: 114,
  termsOptionsCount: 50,
  defaultLanguage: 'US English',
} as const;
```

**`location-shared-setup-locations.spec.ts`** — add to `location-shared-setup-locations.data.ts`:
```typescript
export const SSL_DIALOGS = {
  changeOfficeHeading: 'Change Local Office',
} as const;
```

**`location-account-address.spec.ts`** — add to `location-account-address.data.ts`:
```typescript
export const ACCOUNT_TEST_PHONE = '111-222-3333';
export const ACCOUNT_PHONE_FORMAT_TEST = '555-123-4567';
```

---

### SP-09: Consolidate shared constants to `common.data.ts`

**Shared across 3+ specs** — move to `common.data.ts`:
```typescript
// URL path patterns (used in navigation assertions)
export const URL_PATHS = {
  locationSettings: 'locations/1604/settings',
  localOfficeSettings: 'locations/1604/settings/local-office',
  settingsLocation: '/settings/location',
  home: '/home',
} as const;

// Shared dialog text (used by auto-addon, account-address, pricing, etc.)
export const SAVE_CHANGES_DIALOG = {
  heading: 'Save Changes',
  body: 'Are you sure you want to save the changes?',
} as const;

export const UNSAVED_CHANGES_DIALOG = {
  heading: 'Unsaved changes',
  body: 'Are you sure you want to leave this view? Any unsaved changes will be lost.',
} as const;
```

**Remove duplicates** from individual data files (e.g., `SAVE_CHANGES_MESSAGE` in `location-account-address.data.ts`).

---

### SP-10: Update agent prompts for test data standards

**Files to modify**:
- `.github/agents/playwright-test-generator.agent.md`
- `.github/agents/playwright-test-healer.agent.md`
- `docs/read_only_docs/AGENT_SHARED_RULES.md`

**New rule (ALL-XXX)**: _All test data values (strings, numbers, objects used as inputs or expected values) MUST live in `tests/test-data/`. Specs MUST NOT contain hardcoded test data. Every exported constant in a data file MUST have a JSDoc comment with `@specs`, `@tc`, `@fields`, and `@verified` tags._

**Generator update (GEN-XXX)**: _When creating test data, add spec-traceability JSDoc to every export. Shared constants (dialog text, URL paths, office number) go in `common.data.ts`. Feature-specific data goes in the feature's `.data.ts` file._

---

### SP-11: Update data-driven example

**File**: `tests/examples/data-driven-pattern.spec.ts`

Add a comment block showing the traceability comment convention and the import pattern for both async (AdapterFactory) and sync (typed imports) data consumption.

---

## Execution Order

```
SP-01 (traceability comments)     ── independent, do first
SP-09 (shared constants)          ── do before feature extractions
SP-02 (local-office-settings)     ┐
SP-03 (local-office-ect)          │
SP-04 (location-notes)            │
SP-05 (location-pricing)          ├── parallel, independent
SP-06 (location-auto-addon)       │
SP-07 (location-currency)         │
SP-08 (medium/low severity)       ┘
SP-10 (agent prompts)             ── do after all extractions
SP-11 (example update)            ── do last
```

---

## Verification

After each SP:
1. `npx tsc --noEmit` — type check passes
2. Run the affected spec(s) individually — zero regressions
3. Verify all imports resolve correctly

After all SPs complete:
4. Run full test suite — zero regressions
5. `grep -r "hardcoded" tests/specs/` — no remaining inline test data
6. Every `.data.ts` file has file-level and per-export JSDoc with `@specs` tags
7. `common.data.ts` contains all cross-spec shared constants (no duplicates)

---

## Files Touched

**New files** (2):
- `tests/test-data/setup/local-office/local-office-ect.data.ts`
- `tests/test-data/setup/local-office/local-office-history.data.ts`

**Modified data files** (10):
- `tests/test-data/common.data.ts`
- `tests/test-data/setup/local-office/local-office-settings.data.ts`
- `tests/test-data/setup/locations/location-account-address.data.ts`
- `tests/test-data/setup/locations/location-auto-addon.data.ts`
- `tests/test-data/setup/locations/location-currency.data.ts`
- `tests/test-data/setup/locations/location-legal.data.ts`
- `tests/test-data/setup/locations/location-local-info.data.ts`
- `tests/test-data/setup/locations/location-notes.data.ts`
- `tests/test-data/setup/locations/location-pricing.data.ts`
- `tests/test-data/setup/locations/location-shared-setup-locations.data.ts`

**Modified spec files** (11):
- All 11 spec files in `tests/specs/setup/`

**Modified agent files** (3):
- `.github/agents/playwright-test-generator.agent.md`
- `.github/agents/playwright-test-healer.agent.md`
- `docs/read_only_docs/AGENT_SHARED_RULES.md`

**Modified example** (1):
- `tests/examples/data-driven-pattern.spec.ts`
