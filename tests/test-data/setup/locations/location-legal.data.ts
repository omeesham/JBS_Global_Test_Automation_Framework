/**
 * Test data for: Location Legal tab
 * Consumed by: tests/specs/setup/locations/location-legal.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * Last verified: 2026-04-01
 * @office-dependent — legal defaults tied to office 1604
 *
 * Changing values here affects the listed spec.
 */

export const LEGAL_COLUMN_HEADERS = ['Language Name', 'Service Charge Name', 'Terms and Conditions Name'] as const;

export const LEGAL_DEFAULTS = {
  languageName: 'US English',
  serviceChargeName: 'Resort Service Charge',
  termsName: 'LDW',
} as const;

/** Alternate SC value used for change/save/revert tests. */
export const LEGAL_ALT_SC = 'Administrative Fee';
/** Alternate T&C value used for change/save tests. */
export const LEGAL_ALT_TC = 'Encore Terms and Conditions';
