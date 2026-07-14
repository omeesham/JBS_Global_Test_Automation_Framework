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
 // ---- Tab Navigation ----
 /** @where Setup > Location > Tabs @el tab @text "Shared Setup Locations" @keys tab shared setup locations navigate */
  tabSharedSetupLocations: '[data-testid="location-settings-sub-tab-shared-setup-locations"]',

 // ---- Main Table ----
 /** @where Setup > Location > Shared Setup Locations tab @el table @text "Shared setup locations grid" @keys table grid shared locations */
  tblSharedSetupLocations: '[data-testid="location-settings-table-shared-setup"]',

 // ---- Column Headers ----
 /** @where Setup > Location > Shared Setup Locations > Header @el label @text "Local Office" @keys column header local-office */
  colHeaderLocalOffice: '[data-testid="location-settings-table-shared-setup-col-local-office"]',
 /** @where Setup > Location > Shared Setup Locations > Header @el label @text "Local Office Name" @keys column header local-office-name */
  colHeaderLocalOfficeName: '[data-testid="location-settings-table-shared-setup-col-local-office-name"]',
 /** @where Setup > Location > Shared Setup Locations > Header @el label @text "Primary Office" @keys column header primary-office */
  colHeaderPrimaryOffice: '[data-testid="location-settings-table-shared-setup-col-primary-office"]',
 /** @where Setup > Location > Shared Setup Locations > Header @el label @text "Shares Inventory" @keys column header shares-inventory */
  colHeaderSharesInventory: '[data-testid="location-settings-table-shared-setup-col-shares-inventory"]',
 /** @where Setup > Location > Shared Setup Locations > Header @el label @text "Actions" @keys column header actions */
  colHeaderActions: '[data-testid="location-settings-table-shared-setup-col-actions"]',

 // ---- Self-Row Selectors (first data row = current location) ----
 /** @where Setup > Location > Shared Setup Locations tab > self-row @el checkbox @text "Primary Office" @keys primary office self checked disabled @verified */
  chkSelfPrimaryOffice: '[data-testid="location-settings-checkbox-shared-location-0-primary"]',
 /** @where Setup > Location > Shared Setup Locations tab > self-row @el checkbox @text "Shares Inventory" @keys shares inventory self editable toggle @verified */
  chkSelfSharesInventory: '[data-testid="location-settings-checkbox-shared-location-0-shares-inventory"]',
 /** @where Setup > Location > Shared Setup Locations tab > self-row @el button @text "Delete" @keys delete self disabled button @verified */
  btnSelfDelete: '[data-testid="location-settings-btn-delete-shared-location-0"]',

 // ---- Add Button ----
 /** @where Setup > Location > Shared Setup Locations tab @el button @text "Add" @keys add shared location button
  * LIVE-VERIFIED 2026-07-10: data-testid="location-settings-btn-add-shared-location-1" confirmed present
  * BUT the suffix "-1" is the DOM row-index (row 0 = self-row, row 1 = Add row). When shared
  * locations are added, the Add row shifts down and its testid changes to -2, -3, etc.
  * Decision: KEEP positional selector — testid is unstable (row-index-based, changes on insert/delete).
  */
  btnSharedAdd: '[data-testid="location-settings-table-shared-setup"] tbody tr:last-child button',

 // ---- Change Local Office Dialog ----
 /** @where Setup > Location > Change Local Office dialog @el dialog @text "Change Local Office" @keys dialog add location picker */
  dlgChangeLocalOffice: '[data-testid="location-settings-modal-change-local-office"]',
 /** @where Setup > Location > Change Local Office dialog @el heading @text "Change Local Office" @keys dialog heading title */
 // No heading testid available; defensively scoped inside container (2026-04-29).
  dlgChangeLocalOfficeHeading: '[data-testid="location-settings-modal-change-local-office"] h2',
 /** @where Setup > Location > Change Local Office dialog @el input @text "Search by Location Name, Number" @keys search input filter */
  txtDlgSearch: '[data-testid="location-settings-modal-change-local-office-input-search"]',
 /** @where Setup > Location > Change Local Office dialog @el table @text "Location results table" @keys dialog table results list */
 // No results-table testid available; defensively scoped inside container (2026-04-29).
  tblDlgResults: '[data-testid="location-settings-modal-change-local-office"] table',
 /** @where Setup > Location > Change Local Office dialog @el button @text "Select" @keys dialog select confirm add */
  btnDlgSelect: '[data-testid="location-settings-modal-change-local-office-btn-select"]',
 /** @where Setup > Location > Change Local Office dialog @el button @text "Cancel" @keys dialog cancel abort close */
  btnDlgCancel: '[data-testid="location-settings-modal-change-local-office-btn-cancel"]',
 /** @where Setup > Location > Change Local Office dialog @el button @text "Close" @keys dialog close x dismiss */
 // No Close btn testid available; defensively scoped to last button inside container (2026-04-29).
  btnDlgClose: '[data-testid="location-settings-modal-change-local-office"] button:last-of-type',
} as const;
