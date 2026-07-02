/**
 * Test data for: Location Pricing tab
 * Consumed by: tests/locations/location-pricing.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * @office-dependent — price book rows and currency options tied to office 1604
 * Changing values here affects the listed spec.
 */

/** Expected column headers (left to right, 7 total). MCP-verified */
export const PRICING_COLUMN_HEADERS = [
  'Pricing Strategy',
  'Pricebook',
  'Currency',
  'Is Alternate',
  'Use Effective Dates',
  'Start Date',
  'End Date',
] as const;

/**
 * Primary pricing dropdown selector keys (5 editable comboboxes).
 * @office-dependent — office 1604 default currency is USD; the per-currency variants
 * (CAD/MXN) live in the selector index but office 1604 specs target USD only.
 * Cross-currency tests should override this list with the matching `*CAD` / `*MXN` keys.
 */
export const PRIMARY_PRICING_DROPDOWNS = [
  'drpPrimaryLaborPricingUSD',
  'drpPrimaryEquipmentPricingUSD',
  'drpPrimaryInternalEquipmentPricingUSD',
  'drpPrimaryProductionLaborPricingUSD',
  'drpPrimaryProductionEquipmentPricingUSD',
] as const;

/** Currency filter expected options. Live-verified 2026-05-08: clean office 1604 has only USD
 * price-book rows -> dropdown shows ['All', 'USD'] (2 options). The dropdown is computed from
 * grid rows, so cross-spec pollution from location-currency.spec.ts (selecting CAD/MXN currencies
 * adds price-book rows) can transiently bump it to 4. The May 8 failure log captured a polluted
 * state; the underlying assertion of 2 options for clean state is correct. */
export const CURRENCY_FILTER_OPTIONS = ['All', 'USD'] as const;

/** Primary test row. Live-verified 2026-06-19: first row in office 1604's grid, always present, USD. */
export const PRIMARY_TEST_ROW = '2021-Tier 3 Urban A';

/** Secondary test row. Live-verified 2026-06-19: present in office 1604's grid, USD, Is Alternative enabled. */
export const SECONDARY_TEST_ROW = '2022-Zone 5 A';

/** Tertiary test row for independent cascade tests. Live-verified 2026-06-19: present in office 1604's grid, USD. */
export const TERTIARY_TEST_ROW = '2022-Zone 1 A';

/** Price books for the multi-row alternate-pricing test (TC-021). All three live-verified 2026-06-19 on office 1604. */
export const MULTI_ALT_PRICEBOOKS = [
  PRIMARY_TEST_ROW,
  SECONDARY_TEST_ROW,
  TERTIARY_TEST_ROW,
] as const;

/** Default currency filter value. */
export const DEFAULT_CURRENCY_FILTER = 'All';

/**
 * Dropdown persistence test cases (TC-026..030). Data-driven loop.
 * Each entry has `option` (target/DB value) and `alternateOption` (different value for bidirectional toggle).
 * The toggle pattern ensures tests ALWAYS change the dropdown — fixing the silent-pass bug where
 * selectPrimaryDropdownOption skips interaction when current DB value already matches `option`.
 * Alternate options MCP-verified : all confirmed to exist in the live dropdown popover.
 */
export const DROPDOWN_PERSISTENCE_CASES = [
  { tcId: 'TC-LOC-PRI-026', key: 'drpPrimaryLaborPricingUSD', option: '2026-Zone 3 D', alternateOption: '2026-Zone 3 E', label: 'Primary Labor Pricing' },
  { tcId: 'TC-LOC-PRI-027', key: 'drpPrimaryEquipmentPricingUSD', option: '2026-Tier 2 Resort B', alternateOption: '2026-Tier 2 Resort A', label: 'Primary Equipment Pricing' },
  { tcId: 'TC-LOC-PRI-028', key: 'drpPrimaryInternalEquipmentPricingUSD', option: '2023-Internal2', alternateOption: '2023-Internal1', label: 'Primary Internal Equipment Pricing' },
  { tcId: 'TC-LOC-PRI-029', key: 'drpPrimaryProductionLaborPricingUSD', option: '2026-NP LB3', alternateOption: '2026-NP LB2', label: 'Primary Production Labor Pricing' },
  { tcId: 'TC-LOC-PRI-030', key: 'drpPrimaryProductionEquipmentPricingUSD', option: '2026-NP Tier 2', alternateOption: '2026-NP Tier 1', label: 'Primary Production Equipment Pricing' },
] as const;

/** Date test values (used in skipped TC-020). */
export const DATE_TEST_VALUES = {
  startDate: '04/01/2026',
  endDate: '04/30/2026',
} as const;

/** Date test values for TC-033 (grid validation → Save). Different from DATE_TEST_VALUES to avoid cross-test date collision with TC-020. */
export const TC033_DATE_VALUES = {
  startDate: '05/01/2026',
  endDate: '05/31/2026',
} as const;

/**
 * Per-test baseline for office 1604 (the net-zero-vulnerable starting state every test resets to).
 * Both checkboxes default checked; the test price-book rows default to Is Alternative unchecked.
 * Consumed by the page object's ensureDefaultState() in the spec beforeEach so a crashed prior run
 * (e.g. a left-checked checkbox or grid row) cannot make the next test's "change" a no-op.
 * Live-verified 2026-06-19: office 1604 Corporate Pricing + Include Service Fee both checked.
 *
 * The five primary pricing dropdowns are intentionally NOT reset here: on office 1604 they start
 * unset ("--Select--") with no canonical default value, and most carry no selectable strategies,
 * so there is nothing to restore them to. The multi-currency persistence tests (office 1605) that
 * do select a strategy restore their own dropdown to unset in-test — so no crash-safety gap exists.
 */
export const PRICING_DEFAULTS = {
  corporatePricing: true,
  priceGuideInclusive: true,
  gridRows: [PRIMARY_TEST_ROW, SECONDARY_TEST_ROW, TERTIARY_TEST_ROW],
} as const;

// ---------------------------------------------------------------------------
// MULTI-CURRENCY (office 1605)
// ---------------------------------------------------------------------------
// Office 1604 is single-currency (USD only — no CAD/MXN primary dropdowns render).
// Office 1605 is multi-currency: it renders all 15 primary dropdowns (5 USD + 5 CAD + 5 MXN).
// Live-verified 2026-06-19.

/** Multi-currency test office (renders the CAD and MXN primary-pricing dropdowns). */
export const MULTI_CURRENCY_OFFICE_NO = '1605';

/** CAD primary-pricing dropdown selector keys (office 1605). All five render and are enabled. */
export const PRIMARY_PRICING_DROPDOWNS_CAD = [
  'drpPrimaryLaborPricingCAD',
  'drpPrimaryEquipmentPricingCAD',
  'drpPrimaryInternalEquipmentPricingCAD',
  'drpPrimaryProductionLaborPricingCAD',
  'drpPrimaryProductionEquipmentPricingCAD',
] as const;

/** MXN primary-pricing dropdown selector keys (office 1605). All five render and are enabled. */
export const PRIMARY_PRICING_DROPDOWNS_MXN = [
  'drpPrimaryLaborPricingMXN',
  'drpPrimaryEquipmentPricingMXN',
  'drpPrimaryInternalEquipmentPricingMXN',
  'drpPrimaryProductionLaborPricingMXN',
  'drpPrimaryProductionEquipmentPricingMXN',
] as const;

/**
 * MXN primary-pricing dropdowns that have selectable pricing strategies on office 1605, with a
 * verified option to select. Each one starts unset ("--Select--") on a clean office, so selecting
 * a value is always a real change (no net-zero risk). The persist test sets the value, confirms it
 * round-trips after reload, then restores the dropdown to unset.
 *
 * Live-verified 2026-06-19: of the ten CAD/MXN dropdowns, only these two carry pricing strategies
 * for their currency on 1605 — all five CAD dropdowns and the other three MXN dropdowns show
 * "No pricing strategy found." (empty option list), so they have no value to persist.
 * The chosen option for each was selected, saved, reloaded, confirmed persisted, and restored.
 */
export const MXN_PRIMARY_PERSISTENCE_CASES = [
  { tcId: 'TC-LOC-PRI-037', key: 'drpPrimaryLaborPricingMXN', option: 'MEX DYN LB1 MXN 2025', label: 'Primary Labor Pricing (MXN)' },
  { tcId: 'TC-LOC-PRI-038', key: 'drpPrimaryEquipmentPricingMXN', option: 'MEX BO CDMX MXN 2025', label: 'Primary Equipment Pricing (MXN)' },
] as const;
