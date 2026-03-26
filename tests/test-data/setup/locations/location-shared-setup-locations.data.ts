/**
 * Test data for Location Shared Setup Locations tab.
 * MCP-verified 2026-03-19 against office 1604 (Parker Palm Springs).
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
  /** Search term that returns exactly 1 row. */
  searchByNumber: '1099',
  /** Location name matching searchByNumber. */
  expectedName: 'Corporate Company',
} as const;
