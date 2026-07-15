/**
 * Setup Module -- Shared Setup Locations Tab Selectors.
 * Covers: Tab navigation, table, row checkboxes, Delete/Add buttons,
 * Change Local Office dialog (search, select, cancel).
 * DOM notes (live-verified ):
 * - Tab: [data-testid="location-settings-sub-tab-shared-setup-locations"]
 * - Table: <table data-testid="location-settings-table-shared-setup"> with <thead> and <tbody>.
 * - Column headers: Local Office | Local Office Name | Primary Office | Shares Inventory | (empty actions).
 * - Self-row (current location): Primary Office checked+disabled, Shares Inventory editable, Delete disabled.
 * - Non-self rows: Primary Office unchecked+disabled, Shares Inventory checked+editable, Delete enabled.
 * - Add button: <button> in last table row -- opens "Change Local Office" dialog.
 * - Dialog heading: <h2>"Change Local Office"</h2> -- NOT "Select Location".
 * - Dialog has: search input, 3-col table (checkbox, Local Office, Local Office Name), Select/Cancel/Close buttons.
 * - Dialog table: 4614 rows (full location list), filterable by search input.
 * - Dialog row selection: <button role="checkbox" aria-label="Select row"> per row. Space to toggle.
 * - Select button disabled until a row checkbox is checked.
 * - Delete: instant removal, no confirmation dialog.
 * - Checkboxes: Radix UI <button role="checkbox"> (NOT <input type="checkbox">).
 * - All selector counts confirmed unique via querySelectorAll on .
 */
export const SetupSharedSetupLocationsSelectors = {
  tabSharedSetupLocations: '[data-testid="location-settings-sub-tab-shared-setup-locations"]',

  tblSharedSetupLocations: '[data-testid="location-settings-table-shared-setup"]',

  colHeaderLocalOffice: '[data-testid="location-settings-table-shared-setup-col-local-office"]',
  colHeaderLocalOfficeName: '[data-testid="location-settings-table-shared-setup-col-local-office-name"]',
  colHeaderPrimaryOffice: '[data-testid="location-settings-table-shared-setup-col-primary-office"]',
  colHeaderSharesInventory: '[data-testid="location-settings-table-shared-setup-col-shares-inventory"]',
  colHeaderActions: '[data-testid="location-settings-table-shared-setup-col-actions"]',

  chkSelfPrimaryOffice: '[data-testid="location-settings-checkbox-shared-location-0-primary"]',
  chkSelfSharesInventory: '[data-testid="location-settings-checkbox-shared-location-0-shares-inventory"]',
  btnSelfDelete: '[data-testid="location-settings-btn-delete-shared-location-0"]',

 /** @where Setup > Location > Shared Setup Locations tab @el button @text "Add" @keys add shared location button
  * LIVE-VERIFIED 2026-07-10: data-testid="location-settings-btn-add-shared-location-1" confirmed present
  * BUT the suffix "-1" is the DOM row-index (row 0 = self-row, row 1 = Add row). When shared
  * locations are added, the Add row shifts down and its testid changes to -2, -3, etc.
  * Decision: KEEP positional selector — testid is unstable (row-index-based, changes on insert/delete).
  */
  btnSharedAdd: '[data-testid="location-settings-table-shared-setup"] tbody tr:last-child button',

  dlgChangeLocalOffice: '[data-testid="location-settings-modal-change-local-office"]',
 // No heading testid available; defensively scoped inside container (2026-04-29).
  dlgChangeLocalOfficeHeading: '[data-testid="location-settings-modal-change-local-office"] h2',
  txtDlgSearch: '[data-testid="location-settings-modal-change-local-office-input-search"]',
 // No results-table testid available; defensively scoped inside container (2026-04-29).
  tblDlgResults: '[data-testid="location-settings-modal-change-local-office"] table',
  btnDlgSelect: '[data-testid="location-settings-modal-change-local-office-btn-select"]',
  btnDlgCancel: '[data-testid="location-settings-modal-change-local-office-btn-cancel"]',
 // No Close btn testid available; defensively scoped to last button inside container (2026-04-29).
  btnDlgClose: '[data-testid="location-settings-modal-change-local-office"] button:last-of-type',
} as const;
