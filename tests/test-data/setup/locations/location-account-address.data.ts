/**
 * Test data for Location Account and Address tab tests.
 * Baseline values from office 1604 (Parker Palm Springs).
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

/** Save Changes dialog confirmation message. */
export const SAVE_CHANGES_MESSAGE = 'Are you sure you want to save the changes?';
