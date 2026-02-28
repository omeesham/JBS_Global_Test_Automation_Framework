/**
 * Location Currency tab test data.
 * Verified live 2026-02-18 (office 1604).
 */

/** Expected column headers (left to right) */
export const CURRENCY_COLUMN_HEADERS = ['Currency Code', 'Selected', 'Is Default', 'Merchant'];

/** Initial checkbox states for unselected currencies (loop for TC-003, TC-004) */
export const UNSELECTED_CURRENCY_STATES = [
  { tcId: '003', currency: 'CAD', selectedKey: 'chkCADSelected', isDefaultKey: 'chkCADIsDefault' },
  { tcId: '004', currency: 'MXN', selectedKey: 'chkMXNSelected', isDefaultKey: 'chkMXNIsDefault' },
] as const;
