/**
 * Test data for: Location Local Information tab
 * Consumed by: tests/locations/location-local-information.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * @office-dependent — checkbox defaults, field values tied to office 1604
 * Changing values here affects the listed spec.
 */

import { LocationSettingsSelectors } from '../../selectors';

type SelectorKey = keyof typeof LocationSettingsSelectors;

// ─────────────────────────────────────────────────────────────────────────────
// CHECKBOX DEFAULTS -- office 1604
// ─────────────────────────────────────────────────────────────────────────────

/** Checkboxes expected CHECKED by default */
export const CHECKED_DEFAULTS: SelectorKey[] = [
  'chkApplyLDW',
  'chkTickerCalc',
  'chkEnableSetStrikeLaborMinutes',
  'chkApplySetStrikeLaborMinutes',
  'chkCompanyRemitTax',
  'chkCommReceiver',
  'chkIntercompany',
  'chkAllowDPCD',
  'chkCreditMemoApprovalRequired',
  'chkEnableDiscountReason',
  'chkEnableProposal',
  'chkEnableJobCosting',
  'chkServiceCharge',   // enabled+checked on Navigator Cloud (was disabled+unchecked on legacy navigator2.training.psav.com baseline)
];

/** Checkboxes expected UNCHECKED by default */
export const UNCHECKED_DEFAULTS: SelectorKey[] = [
 // chkCalculateLDWonNetAmount excluded -- managed exclusively by TC-021/029 (check+save+restore cycle)
 // to avoid batch assertion failures when prior runs leave DB in dirty state.
  'chkApplyCablesConsumablesFee',
  'chkAllowETS',
  'chkAllowResortTax',
  'chkShowServiceChargeAsAdministrativeFee',
  'chkCalculateServiceChargeOnNetAmount',
  'chkInternetAssetReservation',
  'chkExcludeImpliedDiscount',
  'chkPromptForApproval',
  'chkAllowProductionQuote',
  'chkWarehouseBilling',
  'chkEnableIDCBilling',
  'chkSkipBilling',
  'chkSeparateMasterBillCommissionInvoice',
  'chkShowSubRental',
  'chkInventoryOnly',
  'chkCalculateCommissionTax',
  'chkCanCreateExternalCustomerLink',
  'chkOffsiteEventLocation',
  'chkExhibitShowRate',
  'chkEnableMultidayPricing',  // Gap #9: new checkbox, unchecked by default (SESSION_1_FINDINGS )
];

/** Checkboxes expected DISABLED by default */
export const DISABLED_CHECKBOXES: SelectorKey[] = [
  'chkSuppressDayRateDiscount',
  'chkCompassIntegration',
  'chkDisplayTax',
  'chkEnableJobCosting',      // disabled+checked for office 1604
  'chkUseESignature',         // Gap #12: disabled+checked
  'chkEnableProductGroup',    // Gap #12: disabled+unchecked
  'chkEnableDiscountGuidance', // Gap #12: disabled+checked
];

/** Disabled checkboxes: expected checked state */
export const DISABLED_CHECKBOX_STATES: Record<string, boolean> = {
  chkSuppressDayRateDiscount: false, // always disabled, unchecked
  chkCompassIntegration: true,       // disabled for existing location, checked
  chkDisplayTax: true,               // disabled when Company Remit Tax checked
  chkEnableJobCosting: true,         // disabled+checked for office 1604
  chkUseESignature: true,            // : disabled+checked for office 1604
  chkEnableProductGroup: false,      // : disabled+unchecked for office 1604
  chkEnableDiscountGuidance: true,   // : disabled+checked for office 1604
};

// ─────────────────────────────────────────────────────────────────────────────
// BOUNDARY TEST DATA -- LDW Percentage [0, 100]
// ─────────────────────────────────────────────────────────────────────────────

export interface BoundaryCase {
  label: string;
  value: string;
  valid: boolean;
  errorContains?: string;
  restoreValue: string;
 /** If the app disables the spin after reload (e.g. LDW%=0 unchecks chkApplyLDW), re-check this key before restoring */
  restoreEnableKey?: SelectorKey;
 /** Mark entry as pending -- test will be fixme'd (blocked by app behavior for office 1604) */
  pending?: string;
}

export const LDW_BOUNDARIES: BoundaryCase[] = [
 // Valid decimal input range: 0.1-1.0 (= 10%-100%). Blur -> x100 -> displays "X.XX%".
 // restoreValue '0.04' is grandfathered DB value; accepted by server as existing value.
 // testBoundaryValue compares: parseFloat(value) x 100 === stripped display (e.g. 0.10x100=10.00).
 // server now accepts LDW% changes for office 1604.
  { label: 'valid min (10%)',           value: '0.10',  valid: true,  restoreValue: '0.04' },
  { label: 'valid mid (50%)',           value: '0.50',  valid: true,  restoreValue: '0.04' },
  { label: 'valid near max (99%)',      value: '0.99',  valid: true,  restoreValue: '0.04' },
  { label: 'valid max (100%)',          value: '1.00',  valid: true,  restoreValue: '0.04' },
 // Invalid values -- CLIENT validates on blur (inline error shown); no DB mutation.
 // errMinBoundary: "Number must be greater than or equal to 0" (< 0 values)
 // errMaxBoundary: "Number must be less than or equal to 100" (> 1.0 values after x100 display)
 // Both contain "Number must be" -- errorContains uses the common prefix.
 // NOTE: '0' and values like 0.01-0.09 are omitted: client accepts them (>= 0) but server
 // rejects silently. : no detectable client-side signal for server-min violations.
  { label: 'invalid negative (-0.01)',  value: '-0.01', valid: false, errorContains: 'Number must be', restoreValue: '0.04' },
  { label: 'invalid far below (-0.05)', value: '-0.05', valid: false, errorContains: 'Number must be', restoreValue: '0.04' },
  { label: 'invalid above max (1.01)', value: '1.01',  valid: false, errorContains: 'Number must be', restoreValue: '0.04' },
  { label: 'invalid far above (1.5)',  value: '1.5',   valid: false, errorContains: 'Number must be', restoreValue: '0.04' },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEPENDENCY TEST DATA -- checkbox toggle -> field enable/disable
// ─────────────────────────────────────────────────────────────────────────────

export interface DependencyCase {
  label: string;
 /** Checkbox that controls the target */
  trigger: SelectorKey;
 /** Action on trigger: 'check' enables target, 'uncheck' enables target */
  triggerAction: 'check' | 'uncheck';
 /** Target element affected */
  target: SelectorKey;
 /** Target type for assertion */
  targetType: 'spin' | 'checkbox';
 /** Expected target disabled state AFTER triggering */
  expectedDisabled: boolean;
 /** For checkboxes: expected checked state after trigger (if applicable) */
  expectedChecked?: boolean;
 /** Restore actions: keys to restore original state */
  restore: { key: SelectorKey; action: 'check' | 'uncheck' }[];
 /** Optional spin restore: set spin value after checkbox restores (e.g. restore LDW%=0.04 after Apply LDW test) */
  spinRestore?: { key: SelectorKey; value: string };
 /** Mark entry as pending -- test will be fixme'd (blocked by app behavior for office 1604) */
  pending?: string;
}

export const SIMPLE_DEPENDENCIES: DependencyCase[] = [
  {
    label: 'Apply LDW -> LDW Percentage',
    trigger: 'chkApplyLDW', triggerAction: 'uncheck',
    target: 'spinLDWPercentage', targetType: 'spin',
    expectedDisabled: true,
    restore: [{ key: 'chkApplyLDW', action: 'check' }],
    spinRestore: { key: 'spinLDWPercentage', value: '0.04' }, // uncheck resets spin to 0; restore to '0.04' (decimal = 4%) so subsequent saves don't leave LDW%=0
  },
 // : chkApplyCablesConsumablesFee is ENABLED for 1604. Tested in TC-075 (standalone).
 // : chkAllowETS is ENABLED for 1604. Tested in TC-077 (standalone).
 // : chkAllowResortTax is ENABLED for 1604. Tested in TC-076 (standalone).
  {
    label: 'Skip Billing -> Oracle Product disabled',
    trigger: 'chkSkipBilling', triggerAction: 'check',
    target: 'txtOracleProduct', targetType: 'spin', // using spin for generic disabled check
    expectedDisabled: true,
    restore: [{ key: 'chkSkipBilling', action: 'uncheck' }],
    pending: 'Tested standalone — Skip Billing requires save+reload, not immediate toggle. See TC-LOC-LI-SKIP-BILLING in spec.',
  },
  {
    label: 'Comm Receiver -> Allow DPCD',
    trigger: 'chkCommReceiver', triggerAction: 'uncheck',
    target: 'chkAllowDPCD', targetType: 'checkbox',
    expectedDisabled: true, expectedChecked: false,
    restore: [
      { key: 'chkCommReceiver', action: 'check' },
      { key: 'chkAllowDPCD', action: 'check' },
    ],
  },
  {
    label: 'Comm Receiver -> Show SubRental',
    trigger: 'chkCommReceiver', triggerAction: 'uncheck',
    target: 'chkShowSubRental', targetType: 'checkbox',
    expectedDisabled: true,
    restore: [
      { key: 'chkCommReceiver', action: 'check' },
      { key: 'chkAllowDPCD', action: 'check' },
    ],
  },
  {
    label: 'Company Remit Tax -> Display Tax',
    trigger: 'chkCompanyRemitTax', triggerAction: 'uncheck',
    target: 'chkDisplayTax', targetType: 'checkbox',
    expectedDisabled: false,
    restore: [{ key: 'chkCompanyRemitTax', action: 'check' }],
  },
  {
    label: 'Intercompany -> Enable IDC Billing',
    trigger: 'chkIntercompany', triggerAction: 'uncheck',
    target: 'chkEnableIDCBilling', targetType: 'checkbox',
    expectedDisabled: true, expectedChecked: false,
    restore: [{ key: 'chkIntercompany', action: 'check' }],
  },
];

/** Active dependencies only -- excludes entries blocked by office 1604 limitations */
export const ACTIVE_DEPENDENCIES = SIMPLE_DEPENDENCIES.filter(d => !d.pending);

// ─────────────────────────────────────────────────────────────────────────────
// LEFT PANEL BASELINE -- office 1604
// ─────────────────────────────────────────────────────────────────────────────

export const LEFT_PANEL_EXPECTED = {
  office: '1604',
  payToAddress: 'Encore',
  eCommerceActive: true,
  enableProductionsOrders: true,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TEXT FIELD CONSTRAINTS
// ─────────────────────────────────────────────────────────────────────────────

export interface MaxLengthCase {
  key: SelectorKey;
  maxLength: number;
  restoreValue: string;
}

export const TEXT_FIELD_CONSTRAINTS: MaxLengthCase[] = [
  { key: 'txtOracleProduct', maxLength: 25, restoreValue: '0000' },
  { key: 'txtOracleDepartment', maxLength: 25, restoreValue: '900' },
];

// ─────────────────────────────────────────────────────────────────────────────
// CHECKBOX LABEL VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckboxLabelCase {
  key: string;
  expected: string;
}

/** Test values for inline spec assertions (billing, Oracle fields, special chars). */
export const LOCAL_INFO_TEST_VALUES = {
  billingType: 'Master',
  billingTypeDirect: 'Direct',
  oracleProductTest: 'PROD001',
  oracleProductDefault: '0000',
  oracleDeptTest: 'DEPT001',
  oracleProductShort: 'CHG',
  oracleDeptDefault: '900',
  specialChars: 'TEST@#$%&*()',
} as const;

/** Verified label text extracted from dt:has-text("...") in src/selectors/locations/local-info.ts */
export const CHECKBOX_LABEL_CASES: CheckboxLabelCase[] = [
  { key: 'chkApplyLDW',          expected: 'Apply LDW' },
  { key: 'chkSkipBilling',       expected: 'Skip Billing' },
  { key: 'chkWarehouseBilling',  expected: 'Warehouse Billing' },
  { key: 'chkCommReceiver',      expected: 'Comm Receiver' },
  { key: 'chkAllowDPCD',             expected: 'Allow DPCD' },
  { key: 'chkEnableMultidayPricing', expected: 'Enable Multiday Pricing' },  // Gap #9
];
