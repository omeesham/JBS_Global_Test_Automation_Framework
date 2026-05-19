/**
 * Test data for: Local Office History tab
 * Consumed by: specs/local-office/local-office-history.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * Last 
 * @office-dependent
 * Changing values here affects the listed spec.
 */

/** History type combobox values. */
export const HISTORY_COMBOBOX = {
  default: 'Location Management History',
  options: ['Location Management History', 'Location Management Legacy History'] as const,
} as const;
