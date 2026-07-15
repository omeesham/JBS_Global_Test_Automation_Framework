/**
 * Setup Module -- Currency Tab Selectors.
 * Covers: Currency grid, save button, column headers, specific currency rows.
 * DOM notes (live-verified ):
 * - All location detail content renders inside <next-location-settings> shadow root.
 * Playwright pierces shadow DOM for all locators, so no special handling needed.
 * - Grid: actual <table data-testid="location-settings-table-currency"> -- no [role="tabpanel"] wrapper.
 * - Checkboxes: <button type="button" role="checkbox" aria-checked="true|false"> (Radix UI) -- NOT input[type="checkbox"].
 * - Column headers: <th> elements -- no explicit role="columnheader" attribute in DOM.
 * - Save: <button data-testid="location-settings-btn-save">.
 */
export const SetupCurrencySelectors = {
  btnSaveCurrency: '[data-testid="location-settings-btn-save"]',
  tblCurrencyGrid: '[data-testid="location-settings-table-currency"]',

  chkUSDSelected: '[data-testid="location-settings-checkbox-currency-USD-selected"]',
  chkUSDIsDefault: '[data-testid="location-settings-checkbox-currency-USD-default"]',
  drpUSDMerchant: '[data-testid="location-settings-select-currency-USD-merchant"]',

  chkCADSelected: '[data-testid="location-settings-checkbox-currency-CAD-selected"]',
  chkCADIsDefault: '[data-testid="location-settings-checkbox-currency-CAD-default"]',
  drpCADMerchant: '[data-testid="location-settings-select-currency-CAD-merchant"]',

  chkMXNSelected: '[data-testid="location-settings-checkbox-currency-MXN-selected"]',
  chkMXNIsDefault: '[data-testid="location-settings-checkbox-currency-MXN-default"]',
  drpMXNMerchant: '[data-testid="location-settings-select-currency-MXN-merchant"]',

  colHeaderCurrencyCode: '[data-testid="location-settings-table-currency-col-code"]',
  colHeaderSelected: '[data-testid="location-settings-table-currency-col-selected"]',
  colHeaderIsDefault: '[data-testid="location-settings-table-currency-col-is-default"]',
  colHeaderMerchant: '[data-testid="location-settings-table-currency-col-merchant"]',

  txtNoMatchesFound: '[role="listbox"]:has-text("No Matches Found")',
} as const;
