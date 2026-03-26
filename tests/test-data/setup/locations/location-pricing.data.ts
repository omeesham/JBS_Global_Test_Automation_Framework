/**
 * Location Pricing tab test data.
 * MCP-verified against live DOM 2026-03-02 (office 1604, dev environment).
 * NOTE: Office 1604 has ONLY USD price book rows -- no MXN/CAD rows present.
 *       Currency filter therefore only shows ['All', 'USD'].
 */

/** Expected column headers (left to right, 7 total). MCP-verified 2026-03-02 */
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

/** Currency filter expected options. MCP-verified 2026-03-02: office 1604 has only USD rows -- 2 options only. */
export const CURRENCY_FILTER_OPTIONS = ['All', 'USD'] as const;

/** Price books for multi-row alternate pricing test (TC-021). MCP-verified 2026-03-02: all 3 exist and are USD. */
export const MULTI_ALT_PRICEBOOKS = [
  '2021-Tier 3 Urban A',
  '2022-eCommerce',
  '2022-NP LB1',
] as const;

/** Primary test row. MCP-verified 2026-03-02: first row in grid, always present, USD. */
export const PRIMARY_TEST_ROW = '2021-Tier 3 Urban A';

/** Secondary test row. MCP-verified 2026-03-02: second row, USD. */
export const SECONDARY_TEST_ROW = '2022-eCommerce';

/** Tertiary test row for independent cascade tests. MCP-verified 2026-03-02: USD. */
export const ECOMMERCE_TEST_ROW = '2022-NP LB1';
