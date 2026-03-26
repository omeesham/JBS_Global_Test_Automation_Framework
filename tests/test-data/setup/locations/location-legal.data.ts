/** Legal tab test data -- verified on live MCP 2026-03-18 (office 1604). */

export const LEGAL_COLUMN_HEADERS = ['Language Name', 'Service Charge Name', 'Terms and Conditions Name'] as const;

export const LEGAL_DEFAULTS = {
  languageName: 'US English',
  serviceChargeName: 'Resort Service Charge',
  termsName: 'LDW',
} as const;

export const LEGAL_SC_OPTION_COUNT = 114;
export const LEGAL_TC_OPTION_COUNT = 50;

/** Alternate SC value used for change/save/revert tests. */
export const LEGAL_ALT_SC = 'Administrative Fee';
/** Alternate T&C value used for change/save tests. */
export const LEGAL_ALT_TC = 'Encore Terms and Conditions';
