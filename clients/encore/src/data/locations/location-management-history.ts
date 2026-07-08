/**
 * Test data for: Location Management History tab
 * Consumed by: tests/locations/location-management-history.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * @office-dependent
 * Column names verified against the live DOM.
 * Boolean format: Unicode "✔" (textContent readable).
 * Date format: MM/DD/YYYY. Timestamp: MM/DD/YYYY HH:MM:SS AM/PM.
 * Percentage: N.NN % (space before %).
 */

/** Total column count (1: 87 confirmed). */
export const COLUMN_COUNT = 87;

/** First column header. */
export const FIRST_COLUMN = 'Local Office';

/** Last column header. */
export const LAST_COLUMN = 'Warehouse Billing';

/** Default rows per page (6: 20 confirmed). */
export const DEFAULT_ROWS_PER_PAGE = '20';

/** Rows per page dropdown options. */
export const ROWS_PER_PAGE_OPTIONS = ['10', '20', '30', '40', '50'] as const;

/** Non-sortable columns for TC-LOC-MGH-012 (1: 73 non-sortable). */
export const NON_SORTABLE_COLUMNS = [
  'Active',
  'Corporate Pricing',
  'Allow DPCD',
  'Allow Production Quote',
] as const;

/** Row 1 expected stable values for office 1604 (from latest row data).
 * Dynamic fields (Modified By, Oracle Product Code) are asserted via toBeTruthy in the spec. */
export const ROW_1_EXPECTED = {
  'Local Office': '1604',
  'Local Office Name': 'Parker Palm Springs',
  'Active': '\u2714', // Unicode checkmark ✔
  'Currency': 'USD',
} as const;
