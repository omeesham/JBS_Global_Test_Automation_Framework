/**
 * Setup Module -- Location Management History Tab Selectors.
 * Covers: History tab navigation, history table, pagination, history type dropdown.
 * Page: Location Settings (/navigator/locations/{officeId}/settings/location)
 */
export const SetupHistorySelectors = {
 // ---- Tab ----
 /** @where Setup > Location > Tabs @el tab @text "Location Management History" @keys tab management-history navigate */
  tabLocationManagementHistory: '[data-testid="location-settings-tab-management-history"]',

 // ---- History Type Dropdown ----
 /** @where Setup > Location > History @el button[role=combobox] @text "Location Management History" @keys history type-selector combobox filter */
  drpHistoryType: '[data-testid="location-settings-select-history-type"]',

 // ---- History Table ----
 /** @where Setup > Location > History @el table @text history audit log @keys history table read-only management */
  tblMgmtHistory: '[data-testid="location-settings-table-management-history"]',

 // ---- Pagination ----
 /** @where Setup > Location > History > Pagination @el button[role=combobox] @text "20" @keys rows-per-page dropdown pagination */
  drpMgmtHistoryRowsPerPage: '[data-testid="location-settings-tab-content-management-history"] button[role="combobox"]:not([data-testid="location-settings-select-history-type"])',
 /** @where Setup > Location > History > Pagination @el button @text "Go to first page" @keys pagination first navigate */
  btnMgmtHistoryFirstPage: 'button[aria-label="Go to first page"]',
 /** @where Setup > Location > History > Pagination @el button @text "Go to previous page" @keys pagination previous back */
  btnMgmtHistoryPrevPage: 'button[aria-label="Go to previous page"]',
 /** @where Setup > Location > History > Pagination @el button @text "Go to next page" @keys pagination next forward */
  btnMgmtHistoryNextPage: 'button[aria-label="Go to next page"]',
 /** @where Setup > Location > History > Pagination @el button @text "Go to last page" @keys pagination last end */
  btnMgmtHistoryLastPage: 'button[aria-label="Go to last page"]',
} as const;
