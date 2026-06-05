/**
 * Test data — Location Settings Left Panel (Basic Information), office 1604.
 *
 * All defaults are LIVE DOM reads on 2026-06-03 (LR-015) — see
 * field-inventories/left-panel-basic-information-2026-06-03.md. Never hardcode a server value
 * without a dated MCP/CLI read behind it.
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
 * Mutable-field baseline consumed by `ensureDefaultState` (LR-019). Only the editable fields the
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
  // Large dropdowns — assert content + lower bound, NOT exact count (LR-022). Live counts recorded
  // for the inventory only: Region 59, Servicing Branch 218.
  regionContains: 'Boston',
  regionLowerBound: 50,
  servicingBranchLowerBound: 200,
} as const;

/** Values used by the editable-field tests (recovery/alt values differ from the saved value per LR-009). */
export const LP_TEST_VALUES = {
  localOfficeNameMaxLength: 255, // LIVE input maxlength (MD claimed 50 — corrected per LR-020; flagged to Encore)
  // 50 chars exactly (TC-010 maxlength boundary).
  localOfficeName50: 'AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEE',
  // ≤50, differs from default (TC-025 save-persist).
  localOfficeNamePersist: 'Parker Palm Springs QA',
  taxModeAlt: 'International', // TC-027 save-persist (US -> International -> US)
  regionAlt: 'Boston', // TC-028 save-persist (Palm Springs -> Boston -> Palm Springs)
  countryAlt: 'Canada', // cascade tests TC-018..022
} as const;
