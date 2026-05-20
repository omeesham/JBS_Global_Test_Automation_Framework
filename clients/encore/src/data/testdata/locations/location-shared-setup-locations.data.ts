/**
 * Test data for: Location Shared Setup Locations tab
 * Consumed by: specs/locations/location-shared-setup-locations.spec.ts
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
 /** Search term that returns 77 filtered rows on e2e (name match) — per BUG-LOC-SHR-001 verificationLog 2026-05-19.
  *  Switched from 'Miami' → 'Boston' by SP-D 2026-05-20 because BUG-LOC-SHR-001 proved the
  *  catalog STRUCTURALLY EXCLUDES every Miami-region office from office 1604's dialog context
  *  (returns 0 rows on e2e). Boston is the lowest-row-count e2e-proven alternate (77 < Chicago 123).
  *  Alt-query independence test per parent plan v5.1 CLOSURE-2; unblocks TC-018/019/020/021/024. */
  searchByName: 'Boston',
 /** Max expected results after name search -- guards against full 4541-row catalog returning.
  *  Raised 100 → 400 by SP-D 2026-05-20 to accommodate Chicago(123) + Marriott(295) inline
  *  queries in TC-027/TC-030 (both broken-by-data with maxResults=100; e2e row counts from
  *  BUG-LOC-SHR-001 verificationLog 2026-05-19). 400 still gives 11x guardband vs the
  *  4541-row full catalog. */
  searchByNameMaxResults: 400,
 /** Search term that returns exactly 1 row (dialog number search). Used by TC-011/TC-012/TC-013 only — never saved. */
  searchByNumber: '990002',
 /** Location name matching searchByNumber. */
  expectedName: '990002 - Test Server1',
} as const;

/** Dialog heading when clicking Add. */
export const SSL_DIALOG_HEADING = 'Change Local Office';
