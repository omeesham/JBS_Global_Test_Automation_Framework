/**
 * Test data for: Local Office History tab
 * Consumed by: tests/specs/setup/local-office/local-office-history.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * Last verified: 2026-04-01
 * @office-dependent
 *
 * Changing values here affects the listed spec.
 */

/** History type combobox values. */
export const HISTORY_COMBOBOX = {
  default: 'Location Management History',
  options: ['Location Management History', 'Location Management Legacy History'] as const,
} as const;
