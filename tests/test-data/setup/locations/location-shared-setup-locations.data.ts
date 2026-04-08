/**
 * Test data for: Location Shared Setup Locations tab
 * Consumed by: tests/specs/setup/locations/location-shared-setup-locations.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * Last verified: 2026-04-01
 * @office-dependent
 *
 * Changing values here affects the listed spec.
 */

export const SSL_COLUMN_HEADERS = [
  'Local Office',
  'Local Office Name',
  'Primary Office',
  'Shares Inventory',
  '',
] as const;

export const SELF_ROW = {
  localOffice: '1604',
  localOfficeName: 'Parker Palm Springs',
} as const;

export const ADD_LOCATION = {
  /** Search term that returns ~69 filtered rows (name match). */
  searchByName: 'Miami',
  /** Max expected results after name search -- guards against full 4614-row list returning. */
  searchByNameMaxResults: 100,
  /** Search term that returns exactly 1 row (dialog number search). Used by TC-011/TC-012/TC-013 only — never saved. */
  searchByNumber: '990002',
  /** Location name matching searchByNumber. */
  expectedName: '990002 - Test Server1',
} as const;

/** Dialog heading when clicking Add. */
export const SSL_DIALOG_HEADING = 'Change Local Office';
