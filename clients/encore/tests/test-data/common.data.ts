/**
 * Test data for: Shared constants (cross-spec)
 * Consumed by: All specs in tests/specs/setup/
 * Office: 1604 (Parker Palm Springs)
 * Last verified: 2026-04-02
 *
 * MNT-009: values used identically in 3+ specs belong here, not redefined per spec.
 * Changing values here affects ALL specs.
 */

/** Standard test office — The Parker Palm Springs (ALL-013). */
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
