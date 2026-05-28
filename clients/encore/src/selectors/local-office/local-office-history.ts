/**
 * Local Office Settings — History tab selectors.
 * URL: /navigator/locations/{officeId}/settings/local-office (History tab)
 * Shared tab/dialog infrastructure (tabHistory, tabContentHistory, dlgSaveChanges, dlgUnsavedLocalOffice)
 * lives in LocalOfficeSettingsSelectors; HistoryPage cascades through both namespaces.
 */
export const LocalOfficeHistorySelectors = {
 // ---- History Tab ----
 /** @where Local Office Settings > History @el div @text history type selector wrapper @keys history type-selector */
  secHistoryTypeSelector: '[data-testid="local-office-settings-history-type-selector"]',
 /** @where Local Office Settings > History @el button[role=combobox] @text "Location Management History" @keys history select-type combobox */
  drpHistoryType: '[data-testid="local-office-settings-history-select-type"]',
 /** @where Local Office Settings > History @el div @text history table container @keys history table-container */
  secHistoryTableContainer: '[data-testid="local-office-settings-history-table-container"]',
 /** @where Local Office Settings > History @el table @text history audit log @keys history table read-only */
  tblHistory: '[data-testid="local-office-settings-history-table"]',
} as const;
