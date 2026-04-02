/**
 * Test data for: Location Account and Address tab
 * Consumed by: tests/specs/setup/locations/location-account-address.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * Last verified: 2026-04-01
 * @office-dependent — venue name, phone, address tied to office 1604
 *
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
