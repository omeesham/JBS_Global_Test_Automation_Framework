/**
 * Test data for: Local Office ECT (Event Cost Template)
 * Consumed by: tests/local-office/local-office-ect.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * @office-dependent — values tied to office 1604 server data
 * Changing values here affects the listed spec.
 */

/** ECT page identifiers. */
export const ECT_PAGE = {
  locationDisplay: '1604 - Parker Palm Springs',
  currency: 'USD',
} as const;

/** ECT grid section labels. */
export const ECT_SECTIONS = {
  eventProfitTarget: 'Event Profit Target',
  laborCostAssumptions: 'Labor Cost Assumptions',
  subRentalMatrix: 'SubRental Matrix',
} as const;

/** Benefits Multiplier test values. */
export const BENEFITS_MULTIPLIER = {
  defaultDisplay: '20.0%',
  testInput: '0.25',
  expectedAfterSave: '25.0%',
  restoreValue: '0.2',
  altTestValue: '0.21',
} as const;

/** Historical Subrental test values. */
export const HISTORICAL_SUBRENTAL = {
  testValue: '0.1',
  defaultDisplay: '0.0%',
  expectedAfterSave: '10.0%',
  restoreValue: '0',
} as const;

/** Labor cost rows for data-driven round-trip tests. */
export const LABOR_COST_RT_ROWS = [
  { rowIndex: 33, name: 'Middle row' },
  { rowIndex: 65, name: 'Last row' },
] as const;

/** Labor cost test values. */
export const LABOR_COST_TEST = {
  currentValue: '41.00',
  testValue: '42',
  altValue: '41',
  firstClass: 'Administrative Fee',
  lastClass: 'zzzFinishing Service',
  invalidInput: 'abc',
} as const;
