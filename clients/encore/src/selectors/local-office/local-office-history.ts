/**
 * Local Office Settings — History tab selectors.
 * URL: /navigator/locations/{officeId}/settings/local-office (History tab)
 * Shared tab/dialog infrastructure (tabHistory, tabContentHistory, dlgSaveChanges, dlgUnsavedLocalOffice)
 * lives in LocalOfficeSettingsSelectors; HistoryPage cascades through both namespaces.
 */
export const LocalOfficeHistorySelectors = {
  secHistoryTypeSelector: '[data-testid="local-office-settings-history-type-selector"]',
  drpHistoryType: '[data-testid="local-office-settings-history-select-type"]',
  secHistoryTableContainer: '[data-testid="local-office-settings-history-table-container"]',
  tblHistory: '[data-testid="local-office-settings-history-table"]',
} as const;
