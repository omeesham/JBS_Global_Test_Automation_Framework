/**
 * Test data for: Local Office Settings — Basic Information tab
 * Consumed by: tests/local-office/local-office-settings.spec.ts,
 * tests/local-office/local-office-ect.spec.ts (ECT_FIXED_COST_FIELDS only)
 * Office: 1604 (Parker Palm Springs)
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

/** Expected 13 canonical section names for location 1604 (BAS-025).
 * Live-verified 2026-05-08 against /locations/1604/settings/local-office
 * (see reports/live-verification-2026-05-08.md). Index 0 is 'AV Services',
 * NOT 'Audio' as previously assumed — the app default was renamed.
 * Live grid currently also contains a stray 'Test Section' row from prior
 * test-run leakage; BAS-025's assertion filters that out.
 */
export const DEFAULT_SECTIONS = [
  'AV Services', 'Flipcharts', 'Hybrid Meeting', 'Labor', 'Lighting',
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
  recovery: '-1',  //: must differ from default (0)
} as const;

/** Phone number test values. */
export const PHONE_TEST_VALUES = {
  invalid: 'not-a-phone',
  testFormat: '555-123-4567',
  recovery: '555-000-1111',
} as const;

/** Section editing test values.
 * Updated 2026-05-08 per live verification:
 *  - originalName must match DEFAULT_SECTIONS[0] (live = 'AV Services').
 *  - editValue MUST DIFFER from originalName (Angular dirty-state) — net-zero edit
 *    leaves Angular form pristine and Save disabled (was the BAS-027 failure).
 *  - newSection is 'Test Section Z' to avoid collision with the existing
 *    'Test Section' leak in the live grid (was the BAS-028 failure).
 */
export const SECTION_TEST_VALUES = {
  editValue: 'AV Test',             // value typed into rename field — must differ from live index-0 name
  originalName: 'AV Services',      // pre-edit section name at index 0 (matches DEFAULT_SECTIONS[0])
  newSection: 'Test Section Z',     // unique add-name; avoid 'Test Section' which is already leaked into live
} as const;

/** Room test values. */
export const ROOM_TEST_VALUES = {
  testRoom: 'Conference Room Z',
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

/** "Relative to start" fields — positive value is INVALID (pattern: neg or zero only). BAS-053. */
export const POSITIVITY_VIOLATIONS_START = [
  { key: 'txtPrepDateOffset', label: 'Prep', invalidValue: '5', defaultValue: '-1' },
  { key: 'txtSetDateOffset', label: 'Set', invalidValue: '3', defaultValue: '-1' },
  { key: 'txtDeliveryDateOffset', label: 'Delivery', invalidValue: '2', defaultValue: '0' },
] as const;

/** "Relative to end" fields — negative value is INVALID (pattern: positive or empty only). BAS-054. */
export const POSITIVITY_VIOLATIONS_END = [
  { key: 'txtReturnDateOffset', label: 'Return', invalidValue: '-3', defaultValue: '1' },
  { key: 'txtStrikeDateOffset', label: 'Strike', invalidValue: '-2', defaultValue: '1' },
  { key: 'txtPickupDateOffset', label: 'Pickup', invalidValue: '-1', defaultValue: '0' },
] as const;

/** Fields to test non-numeric input (extends BAS-006 to Return/Delivery). BAS-055/056. */
export const NON_NUMERIC_TEST_FIELDS = [
  { key: 'txtReturnDateOffset', label: 'Return', defaultValue: '1' },
  { key: 'txtDeliveryDateOffset', label: 'Delivery', defaultValue: '0' },
] as const;

/** MaxLen boundary test values. BAS-061/062.
 * Prep maxLen=3, Set maxLen=4 per v1 requirements. */
export const MAXLEN_BOUNDARY = {
  threeChar: { key: 'txtPrepDateOffset', overLimit: '1234', defaultValue: '-1' },
  fourChar: { key: 'txtSetDateOffset', atLimit: '-999', defaultValue: '-1' },
} as const;

/** Multi-field error recovery: trigger cross-validation, correct with non-default value. BAS-063.
 * recoveryValue MUST differ from defaultValue to keep form dirty. */
export const MULTI_FIELD_RECOVERY = {
  triggerField: 'txtDeliveryDateOffset',
  triggerValue: '-5',       // Delivery (-5) < Prep (-1) → NM-1264 cross-validation error
  recoveryValue: '-1',      //: differs from default (0), satisfies Delivery >= Prep
  defaultValue: '0',
} as const;

/** Null offset round-trip test fields. BAS-064/065/067.
 * verified: clearing an offset → save → reload preserves empty (not "0"). */
export const NULL_OFFSET_FIELDS = [
  { key: 'txtPrepDateOffset', label: 'Prep', defaultValue: '-1' },
  { key: 'txtReturnDateOffset', label: 'Return', defaultValue: '1' },
  { key: 'txtSetDateOffset', label: 'Set', defaultValue: '-1' },
  { key: 'txtStrikeDateOffset', label: 'Strike', defaultValue: '1' },
  { key: 'txtDeliveryDateOffset', label: 'Delivery', defaultValue: '0' },
  { key: 'txtPickupDateOffset', label: 'Pickup', defaultValue: '0' },
] as const;

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
