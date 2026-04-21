/**
 * Test data for: Location Pricing tab
 * Consumed by: tests/specs/setup/locations/location-pricing.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * Last 
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

/** Primary pricing dropdown selector keys (5 editable comboboxes) */
export const PRIMARY_PRICING_DROPDOWNS = [
  'drpPrimaryLaborPricing',
  'drpPrimaryEquipmentPricing',
  'drpPrimaryInternalEquipmentPricing',
  'drpPrimaryProductionLaborPricing',
  'drpPrimaryProductionEquipmentPricing',
] as const;

/** Currency filter expected options. MCP-verified : office 1604 has only USD rows -- 2 options only. */
export const CURRENCY_FILTER_OPTIONS = ['All', 'USD'] as const;

/** Price books for multi-row alternate pricing test (TC-021). MCP-verified : all 3 exist and are USD. */
export const MULTI_ALT_PRICEBOOKS = [
  '2021-Tier 3 Urban A',
  '2022-eCommerce',
  '2022-NP LB1',
] as const;

/** Primary test row. MCP-verified : first row in grid, always present, USD. */
export const PRIMARY_TEST_ROW = '2021-Tier 3 Urban A';

/** Secondary test row. MCP-verified : second row, USD. */
export const SECONDARY_TEST_ROW = '2022-eCommerce';

/** Tertiary test row for independent cascade tests. MCP-verified : USD. */
export const ECOMMERCE_TEST_ROW = '2022-NP LB1';

/** Default currency filter value. */
export const DEFAULT_CURRENCY_FILTER = 'All';

/**
 * Dropdown persistence test cases (TC-026..030). MNT-008: data-driven loop.
 * Each entry has `option` (target/DB value) and `alternateOption` (different value for bidirectional toggle).
 * The toggle pattern ensures tests ALWAYS change the dropdown — fixing the silent-pass bug where
 * selectPrimaryDropdownOption skips interaction when current DB value already matches `option`.
 * Alternate options MCP-verified : all confirmed to exist in the live dropdown popover.
 */
export const DROPDOWN_PERSISTENCE_CASES = [
  { tcId: 'TC-LOC-PRI-026', key: 'drpPrimaryLaborPricing', option: '2026-Zone 3 D', alternateOption: '2026-Zone 3 E', label: 'Primary Labor Pricing' },
  { tcId: 'TC-LOC-PRI-027', key: 'drpPrimaryEquipmentPricing', option: '2026-Tier 2 Resort B', alternateOption: '2026-Tier 2 Resort A', label: 'Primary Equipment Pricing' },
  { tcId: 'TC-LOC-PRI-028', key: 'drpPrimaryInternalEquipmentPricing', option: '2023-Internal2', alternateOption: '2023-Internal1', label: 'Primary Internal Equipment Pricing' },
  { tcId: 'TC-LOC-PRI-029', key: 'drpPrimaryProductionLaborPricing', option: '2026-NP LB3', alternateOption: '2026-NP LB2', label: 'Primary Production Labor Pricing' },
  { tcId: 'TC-LOC-PRI-030', key: 'drpPrimaryProductionEquipmentPricing', option: '2026-NP Tier 2', alternateOption: '2026-NP Tier 1', label: 'Primary Production Equipment Pricing' },
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
