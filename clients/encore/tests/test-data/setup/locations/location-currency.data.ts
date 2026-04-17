/**
 * Test data for: Location Currency tab
 * Consumed by: tests/specs/setup/locations/location-currency.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * Last verified: 2026-04-01
 * @office-dependent — merchant IDs and currency rows tied to office 1604
 *
 * Changing values here affects the listed spec.
 */

/** Expected column headers (left to right) */
export const CURRENCY_COLUMN_HEADERS = ['Currency Code', 'Selected', 'Is Default', 'Merchant'];

/** Initial checkbox states for unselected currencies (loop for TC-003, TC-004) */
export const UNSELECTED_CURRENCY_STATES = [
  { tcId: '003', currency: 'CAD', selectedKey: 'chkCADSelected', isDefaultKey: 'chkCADIsDefault' },
  { tcId: '004', currency: 'MXN', selectedKey: 'chkMXNSelected', isDefaultKey: 'chkMXNIsDefault' },
] as const;

/** @office-dependent — merchant IDs tied to office 1604 server config */
export const MERCHANT_DATA = {
  usd: { id: '316370', display: '316370 - PSAV US/USD' },
  bahamas: { id: '316426', display: '316426 - Encore Bahamas/USD' },
  canada: { id: '316446', display: '316446 - PSAV Canada/CAD' },
} as const;

/** Alternate USD merchant for round-trip persistence tests */
export const ALTERNATE_USD_MERCHANT = MERCHANT_DATA.bahamas;

/** Default currency for office 1604. */
export const DEFAULT_CURRENCY = 'USD';
