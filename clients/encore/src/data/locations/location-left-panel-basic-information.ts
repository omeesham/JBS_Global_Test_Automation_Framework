/**
 * Test data — Location Settings Left Panel (Basic Information), office 1604.
 *
 * All defaults are LIVE DOM reads on 2026-06-03. Never hardcode a server value
 * without a dated live read behind it.
 */

/** Office-1604 default field values/states (live 2026-06-03). */
export const LP_DEFAULTS = {
  office: '', // primary-location-no renders empty for 1604 (placeholder "No office available")
  localOffice: '1604',
  localOfficeName: 'Parker Palm Springs',
  active: true,
  liveDate: 'June 15th, 1990',
  taxMode: 'US',
  country: 'United States',
  region: 'Palm Springs',
  servicingBranch: 'Select Servicing Branch Office', // unselected placeholder (required, value=0)
  lineOfBusiness: 'Hotel Services Division', // read-only in edit mode (NM-831 / NM-1140)
  payToAddress: 'Encore',
  union: false,
} as const;

/**
 * Mutable-field baseline consumed by `ensureDefaultState` (per-test reset). Only the editable fields the
 * spec actually mutates — restored per-test so a prior crashed/retried run cannot poison defaults.
 * Order matters at reset time: Country is set FIRST (its change cascade-clears Tax Mode + Region),
 * then Tax Mode, then Region.
 */
export const LP_BASELINE = {
  country: 'United States',
  taxMode: 'US',
  region: 'Palm Springs',
  localOfficeName: 'Parker Palm Springs',
  active: true,
  union: false,
} as const;

/** Dropdown option sets (live 2026-06-03). Small enums assert exact (the complete set IS the feature). */
export const LP_DROPDOWN = {
  taxMode: ['US', 'International'] as const,
  country: ['United States', 'Mexico', 'Canada', 'Bahamas'] as const,
  // Large dropdowns — assert content + lower bound, NOT exact count. Live counts recorded
  // for the inventory only: Region 59, Servicing Branch 218.
  regionContains: 'Boston',
  regionLowerBound: 50,
  servicingBranchLowerBound: 200,
} as const;

/**
 * Pay To Address launcher constants (live 2026-06-11, office 1604).
 * The Pay To Address field is a launcher → "Pay To List" dialog. Selection persists
 * (`financial.payToId`). Restore is ID-anchored — the name "Encore" is AMBIGUOUS (IDs 1 & 4
 * both display "Encore"), so the name can never be a safe restore anchor — never name-anchor a restore.
 * Source: live field verification 2026-06-11 (launcher dialogs).
 */
export const PAY_TO_ORIGINAL = { id: 1, name: 'Encore' } as const;
/** Uniquely-named alternate Pay To row (ID 7) — distinct name makes the persistence assertion unambiguous. */
export const PAY_TO_ALTERNATE = { id: 7, name: 'Encore Bahamas' } as const;

/** Values used by the editable-field tests (recovery/alt values differ from the saved value to force a net change). */
export const LP_TEST_VALUES = {
  localOfficeNameMaxLength: 255, // LIVE input maxlength (the spec doc claimed 50 — corrected against live; flagged to Encore)
  // 50 chars exactly (TC-010 maxlength boundary).
  localOfficeName50: 'AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEE',
  // ≤50, differs from default (TC-025 save-persist).
  localOfficeNamePersist: 'Parker Palm Springs QA',
  taxModeAlt: 'International', // TC-027 save-persist (US -> International -> US)
  regionAlt: 'Boston', // TC-028 save-persist (Palm Springs -> Boston -> Palm Springs)
  countryAlt: 'Canada', // cascade tests TC-018..022
} as const;
