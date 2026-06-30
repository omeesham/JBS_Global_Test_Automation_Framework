/**
 * Test data for: Shared constants (cross-spec)
 * Consumed by: All specs in tests/
 * Office: 1604 (Parker Palm Springs)
 * Shared constants used across multiple specs live here, not redefined per spec.
 * Changing values here affects ALL specs.
 */

/** Standard test office — The Parker Palm Springs. */
export const OFFICE_NO = '1604';

/** Shared Save Changes dialog text (used by auto-addon, account-address, notes specs). */
export const SAVE_CHANGES_DIALOG = {
  heading: 'Save Changes',
  body: 'Are you sure you want to save the changes?',
} as const;

/** Shared Unsaved Changes dialog text (used by auto-addon spec). */
export const UNSAVED_CHANGES_DIALOG = {
  heading: 'Unsaved changes',
  body: 'Are you sure you want to leave this view? Any unsaved changes will be lost.',
} as const;
