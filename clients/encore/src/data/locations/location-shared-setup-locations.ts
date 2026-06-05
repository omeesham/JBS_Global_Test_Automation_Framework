/**
 * Test data for: Location Shared Setup Locations tab
 * Consumed by: tests/locations/location-shared-setup-locations.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * @office-dependent
 * Changing values here affects the listed spec.
 */

export const SSL_COLUMN_HEADERS = [
  'Local Office',
  'Local Office Name',
  'Primary Office',
  'Shares Inventory',
  '',
] as const;

export const SELF_ROW = {
  localOffice: '1604',
  localOfficeName: 'Parker Palm Springs',
} as const;

export const ADD_LOCATION = {
 /** Default name-search query (TC-010, TC-016, TC-019) — Boston returns 77 rows on e2e office 1604
  *  per BUG-LOC-SHR-001 verificationLog 2026-05-19. TC-018/020/021/024 use distinct per-TC literals
  *  (Chicago/Dallas/Denver/Atlanta) for alt-query independence — see spec inline literals. */
  searchByName: 'Boston',
 /** Max expected results after name search. Guards against full 4541-row catalog leakage.
  *  Raised 400 → 600 to accommodate Dallas/Denver/Atlanta whose e2e counts were unmeasured at
  *  T7a-refactor time; 600 retains 7x headroom vs the 4541-row full catalog. Known counts:
  *  Boston=77, Chicago=123, Marriott=295. */
  searchByNameMaxResults: 600,
 /** Search term that returns exactly 1 row (dialog number search). Used by TC-011/TC-012/TC-013 only — never saved. */
  searchByNumber: '990002',
 /** Location name matching searchByNumber. */
  expectedName: '990002 - Test Server1',
} as const;

/** Dialog heading when clicking Add. */
export const SSL_DIALOG_HEADING = 'Change Local Office';

// Granular search/multi-row test data — TC-LOC-SSL-031..044 (2026-05-22).
// Non-Miami queries throughout per BUG-LOC-SHR-001 workaround.

/** Search BVA group inputs (min / max / empty) */
export const SEARCH_BVA_1_CHAR = 'A';
export const SEARCH_BVA_LONG_200 = 'X'.repeat(200);
export const SEARCH_BVA_EMPTY = '';

/** Search special-chars / whitespace inputs */
export const SEARCH_NEG_SPECIAL = `&"'<>`;
export const SEARCH_NEG_WHITESPACE = '   ';
export const SEARCH_NEG_LEADING_TRAILING_ATLANTA = '  Atlanta  ';

/** Search edit-cycle inputs (type / clear / re-type) */
export const SEARCH_EDIT_QUERY_1 = 'Atlanta';
export const SEARCH_EDIT_QUERY_2 = 'Boston';

/** Multi-row delete query sets (non-Miami per BUG-LOC-SHR-001 workaround) */
export const SEARCH_DELETE_MIDDLE_QUERIES = ['Chicago', 'Dallas', 'Denver'] as const;
export const SEARCH_DELETE_ALL_QUERIES = ['Atlanta', 'Boston'] as const;

/** Multi-row N-boundary push (5-row) */
export const SEARCH_FIVE_ROW_QUERIES = ['Chicago', 'Boston', 'Dallas', 'Denver', 'Atlanta'] as const;

/** Single non-Miami query for cross-row independence tests */
export const SEARCH_CROSS_ROW_QUERY = 'Atlanta';

// SEARCH_BULK_LOWER_BOUND removed 2026-06-02: TC-LOC-SSL-035 now uses a relative invariant
// (cleared-count > Atlanta-filtered-count, mirroring TC-LOC-SSL-040) instead of a hardcoded
// structural threshold (LR-022). The magic number was the sole consumer.
