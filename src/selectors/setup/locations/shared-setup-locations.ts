/**
 * Setup Module -- Shared Setup Locations Tab Selectors.
 * Covers: Tab navigation, table, row checkboxes, Delete/Add buttons,
 *         Change Local Office dialog (search, select, cancel).
 *
 * DOM notes (live-verified 2026-03-19):
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
 * - All selector counts confirmed unique via querySelectorAll on 2026-03-19.
 */
export const SetupSharedSetupLocationsSelectors = {
  // ---- Tab Navigation ----
  /** @where Setup > Location > Tabs @el tab @text "Shared Setup Locations" @keys tab shared setup locations navigate */
  tabSharedSetupLocations: '[data-testid="location-settings-sub-tab-shared-setup-locations"]',

  // ---- Main Table ----
  /** @where Setup > Location > Shared Setup Locations tab @el table @text "Shared setup locations grid" @keys table grid shared locations */
  tblSharedSetupLocations: '[data-testid="location-settings-table-shared-setup"]',

  // ---- Self-Row Selectors (first data row = current location) ----
  /** @where Setup > Location > Shared Setup Locations tab > self-row @el checkbox @text "Primary Office" @keys primary office self checked disabled */
  chkSelfPrimaryOffice: '[data-testid="location-settings-table-shared-setup"] tbody tr:first-child td:nth-child(3) [role="checkbox"]',
  /** @where Setup > Location > Shared Setup Locations tab > self-row @el checkbox @text "Shares Inventory" @keys shares inventory self editable toggle */
  chkSelfSharesInventory: '[data-testid="location-settings-table-shared-setup"] tbody tr:first-child td:nth-child(4) [role="checkbox"]',
  /** @where Setup > Location > Shared Setup Locations tab > self-row @el button @text "Delete" @keys delete self disabled button */
  btnSelfDelete: '[data-testid="location-settings-table-shared-setup"] tbody tr:first-child td:nth-child(5) button',

  // ---- Add Button ----
  /** @where Setup > Location > Shared Setup Locations tab @el button @text "Add" @keys add shared location button */
  btnSharedAdd: '[data-testid="location-settings-table-shared-setup"] tbody tr:last-child button',

  // ---- Change Local Office Dialog ----
  /** @where Setup > Location > Change Local Office dialog @el dialog @text "Change Local Office" @keys dialog add location picker */
  dlgChangeLocalOffice: '[role="dialog"]:has(h2)',
  /** @where Setup > Location > Change Local Office dialog @el heading @text "Change Local Office" @keys dialog heading title */
  dlgChangeLocalOfficeHeading: '[role="dialog"] h2',
  /** @where Setup > Location > Change Local Office dialog @el input @text "Search by Location Name, Number" @keys search input filter */
  txtDlgSearch: '[role="dialog"] input[placeholder="Search by Location Name, Number"]',
  /** @where Setup > Location > Change Local Office dialog @el table @text "Location results table" @keys dialog table results list */
  tblDlgResults: '[role="dialog"] table',
  /** @where Setup > Location > Change Local Office dialog @el button @text "Select" @keys dialog select confirm add */
  btnDlgSelect: '[role="dialog"] button:has-text("Select")',
  /** @where Setup > Location > Change Local Office dialog @el button @text "Cancel" @keys dialog cancel abort close */
  btnDlgCancel: '[role="dialog"] button:has-text("Cancel")',
  /** @where Setup > Location > Change Local Office dialog @el button @text "Close" @keys dialog close x dismiss */
  btnDlgClose: '[role="dialog"] button:last-of-type',
} as const;
