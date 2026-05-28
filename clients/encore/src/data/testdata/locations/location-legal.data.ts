/**
 * Test data for: Location Legal tab
 * Consumed by: specs/locations/location-legal.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * @office-dependent — legal defaults tied to office 1604
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

/**
 * Sentinel string for FCC TC-LOC-LGL-019 (DOM tamper negative test).
 * Not present in the 114-option SC dropdown; used to attempt invalid-value injection
 * via page.evaluate() to verify Radix React state isolation OR server-side rejection.
 */
export const LEGAL_INVALID_SC_VALUE = 'INVALID_SC_DOM_TAMPER_VALUE';
