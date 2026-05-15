/**
 * Test data for: Location Management History tab
 * Consumed by: tests/specs/setup/locations/location-management-history.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * Last 
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

/**
 * All 87 column headers in L-to-R order (1, MCP-verified ).
 * Use for full-header verification if needed by integration tests.
 */
export const ALL_COLUMN_HEADERS = [
  'Local Office', 'Local Office Name', 'Active', 'Live Date', 'Country',
  'Currency', 'Tax Mode', 'Region', 'Servicing Branch Office', 'Pay To Address',
  'Union', 'Corporate Pricing', 'Billing Type', 'Billing Cycle', 'Billing Way',
  'Billing Way Active', 'Labor Pricing', 'Equip. Pricing', 'Internal Equip. Pricing',
  'Production Labor Pricing', 'Production Equip. Pricing', 'Allow DPCD',
  'Exclude Implied Discount', 'Prompt For Approval', 'Threshold', 'Enable LDW',
  'LDW Percentage', 'Calculate LDW on Net Amount', 'ETS', 'ETS Percent',
  'Allow Service Charge', 'Show Service Charge As Administrative Fee',
  'Calculate Service Charge On Net Amount', 'Service Charge Name',
  'Apply Cables and Consumables Fee', 'C&C Percent',
  'Calculate CAC on Net Amount', 'Terms and Conditions',
  'Allow Ticker Calc', 'Set/Strike/Support Labor Billing Goal',
  'Enable Set/Strike Labor Minutes', 'Apply Set/Strike Labor Minutes',
  'Credit Memo Approval Required', 'Display Tax',
  'Company Remit Tax / GST/HST / VAT Tax', 'Remit PST Tax',
  'Comm Receiver', 'Enable IDC Billing', 'Skip Billing', 'Show SubRental',
  'Inventory Only', 'Intercompany', 'Calculate Commission Tax',
  'Can Create External Customer Link', 'Venue/Branch Account Name',
  'Venue/Branch Account Phone1', 'Venue/Branch Account Phone2',
  'Master Bill To Address Name', 'Action of Shared Setup Location',
  'Shared Setup Location ID', 'Shared Setup Location Name',
  'Include Service Charge in Price Guides', 'Pricing Strategy', 'Currency',
  'Pricing Action', 'Is Alternate', 'Use Effective Dates', 'Start Date',
  'End Date', 'Notes', 'Modified By', 'Modified On',
  'Oracle Product Code', 'Oracle Department Code', 'Oracle Organization',
  'Allow Resort Tax', 'Resort Tax Percentage', 'Discount Reason',
  'Offsite Event Location', 'Use eSignature',
  'Separate Master Bill Commission Invoice', 'Enable Product Group',
  'Allow Production Quote', 'Enable Job Costing', 'Enable Discount Guidance',
  'Internet Asset Reservation', 'Warehouse Billing',
] as const;
