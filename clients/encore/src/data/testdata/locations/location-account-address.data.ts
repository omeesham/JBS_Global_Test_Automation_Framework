/**
 * Test data for: Location Account and Address tab
 * Consumed by: specs/locations/location-account-address.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * @office-dependent — venue name, phone, address tied to office 1604
 * Changing values here affects the listed spec.
 */

/** Venue/Branch Account display fields (read-only, TC-013). Order: City, State, Zip, Country. */
export const VENUE_DISPLAY_FIELDS = [
  { label: 'City', expected: 'WEST HOLLYWOOD' },
  { label: 'State', expected: 'CA' },
  { label: 'Zip', expected: '90048' },
  { label: 'Country', expected: 'United States' },
] as const;

/** Master Bill To Address display fields (read-only, TC-014). Same values as venue for office 1604. */
export const MASTER_DISPLAY_FIELDS = [
  { label: 'City', expected: 'WEST HOLLYWOOD' },
  { label: 'State', expected: 'CA' },
  { label: 'Zip', expected: '90048' },
  { label: 'Country', expected: 'United States' },
] as const;

/** Venue Name baseline value (disabled field). */
export const VENUE_NAME = 'Parker Palm Springs';

/** Phone 1 baseline value. */
export const PHONE1_BASELINE = '760-883-1957';

/** Account List search term → expected result. */
export const ACCOUNT_SEARCH = { term: 'Parker', expectedResult: 'Parker Palm Springs' };

/** Address dialog search term → expected match and row count. */
export const ADDRESS_SEARCH = { filterTerm: 'Beverly', expectedMatch: 'Beverly', totalRows: 7 };

/** Test phone value for save/persist tests. */
export const TEST_PHONE2_VALUE = '555-000-0001';

/** Test phone number for save-enable/persistence tests (TC-018). */
export const ACCOUNT_TEST_PHONE = '111-222-3333';

/** Account List filter terms for TC-025/026. MCP-verified : "Beverly" in Address returns 3 accounts. */
export const ACCOUNT_LIST_FILTERS = {
  address: 'Beverly',
  addressExpected: 'Beverly',  // Results contain "Beverly" in address column
  city: 'LOS ANGELES',
  cityExpected: 'LOS ANGELES', // Results contain "LOS ANGELES" in city column
} as const;

/** Alternate address for TC-027: PALM SPRINGS address row (row 2 in dialog, verified). */
export const ALT_ADDRESS = {
  city: 'PALM SPRINGS',
  zip: '92264',
  address1: '4200 E Palm Canyon Dr',
} as const;

/** Original venue address for TC-027 restore (verified). */
export const ORIGINAL_ADDRESS = {
  city: 'WEST HOLLYWOOD',
  zip: '90048',
  address1: '8899 Beverly Blvd Ste 412',
} as const;
