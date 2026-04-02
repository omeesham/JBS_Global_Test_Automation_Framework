/**
 * Test data for: Local Office Settings — Basic Information tab
 * Consumed by: tests/specs/setup/local-office/local-office-settings.spec.ts,
 *              tests/specs/setup/local-office/local-office-ect.spec.ts (ECT_FIXED_COST_FIELDS only)
 * Office: 1604 (Parker Palm Springs)
 * Last verified: 2026-03-23
 *
 * Changing values here affects the listed specs.
 */

/** Default date offset values for location 1604. */
export const DATE_OFFSET_DEFAULTS = [
  { key: 'txtPrepDateOffset', label: 'Prep Date Offset', value: '-1' },
  { key: 'txtReturnDateOffset', label: 'Return Date Offset', value: '1' },
  { key: 'txtSetDateOffset', label: 'Set Date Offset', value: '-1' },
  { key: 'txtStrikeDateOffset', label: 'Strike Date Offset', value: '1' },
  { key: 'txtDeliveryDateOffset', label: 'Delivery Date Offset', value: '0' },
  { key: 'txtPickupDateOffset', label: 'Pickup Date Offset', value: '0' },
] as const;

/** Checkbox default states for BAS-011 data-driven verification. */
export const CHECKBOX_DEFAULTS = [
  { key: 'chkUseFulfillment', label: 'Use Fulfillment', checked: false, disabled: false },
  { key: 'chkUseEquipmentsQc', label: 'Use Equipments QC', checked: false, disabled: true },
  { key: 'chkDefaultLaborToHourly', label: 'Default Labor to Hourly', checked: false, disabled: false },
  { key: 'chkDefaultJobOneDayEvent', label: 'Default Job 1 Day Event', checked: false, disabled: false },
  { key: 'chkDefaultJobOneDayOutside', label: 'Default Job 1 Day Outside', checked: false, disabled: false },
  { key: 'chkDefaultJobOneDayInternal', label: 'Default Job 1 Day Internal', checked: false, disabled: false },
] as const;

/** Default New Job to 1 Day sub-checkboxes for BAS-020 data-driven loop. */
export const ONE_DAY_JOB_CHECKBOXES = [
  { key: 'chkDefaultJobOneDayEvent', label: 'Event' },
  { key: 'chkDefaultJobOneDayOutside', label: 'Outside' },
  { key: 'chkDefaultJobOneDayInternal', label: 'Internal' },
] as const;

/** Expected 13 section names for location 1604 (BAS-025). Live-verified 2026-03-24. */
export const DEFAULT_SECTIONS = [
  'Audio', 'Flipcharts', 'Hybrid Meeting', 'Labor', 'Lighting',
  'Power', 'Presenter Support', 'Projection', 'Rigging',
  'Scenic', 'Staging', 'Video', 'Whiteboard',
] as const;

/** Date offset TEST values (distinct from defaults — used for boundary/recovery tests). */
export const DATE_OFFSET_TEST_VALUES = {
  valid: '-2',
  invalid: 'abc',
  deliveryInvalid: '-5',
  zero: '0',
  extremeNegative: '-10',
  recovery: '-1',  // LR-009: must differ from default (0)
} as const;

/** Phone number test values. */
export const PHONE_TEST_VALUES = {
  invalid: 'not-a-phone',
  testFormat: '555-123-4567',
  recovery: '555-000-1111',
} as const;

/** Section editing test values. */
export const SECTION_TEST_VALUES = {
  editValue: 'AV Services',       // value typed into rename field
  originalName: 'Audio Visual',    // pre-edit section name at index 0
  newSection: 'Test Section',
} as const;

/** Room test values. */
export const ROOM_TEST_VALUES = {
  testRoom: 'Ballroom A',
} as const;

/** Default Order Type test values. */
export const ORDER_TYPE_VALUES = {
  default: 'Event',
  alternate: 'Outside',
} as const;

/** PO field test values. */
export const PO_TEST_VALUES = {
  number: 'PO-TEST-123',
  label: 'Purchase Order #',
} as const;

/** XSS payload for security round-trip testing. */
export const XSS_PAYLOAD = '<script>alert(1)</script>';

/** Default Phone 1 value for location 1604. */
export const DEFAULT_PHONE_1 = '760-883-1957';

/** ECT fixed cost read-only field values for BAS-ECT-004 data-driven loop. */
export const ECT_FIXED_COST_FIELDS = [
  { key: 'fldVenueFixedCosts', label: 'Venue Fixed Costs', expected: '13.9%' },
  { key: 'fldSgaPercent', label: 'SG&A %', expected: '8.0%' },
  { key: 'fldOtherRate', label: 'Other Rate', expected: '0.0%' },
  { key: 'fldNoLabourRate', label: 'No Labor Rate', expected: '0.0%' },
  { key: 'fldApprovalThreshold', label: 'Approval Threshold', expected: '$10,000,000.00' },
  { key: 'fldPeakLaborAdjustment', label: 'Peak Labor Adjustment %', expected: '5.0%' },
  { key: 'fldNonPeakLaborAdjustment', label: 'Non-Peak Labor Adjustment %', expected: '0.0%' },
] as const;
