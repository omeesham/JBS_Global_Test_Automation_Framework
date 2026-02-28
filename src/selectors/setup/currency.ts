/**
 * Setup Module -- Currency Tab Selectors.
 * Covers: Currency grid, save button, column headers, specific currency rows.
 *
 * DOM notes (live-verified 2026-02-25):
 * - All location detail content renders inside <next-location-settings> shadow root.
 *   Playwright pierces shadow DOM for all locators, so no special handling needed.
 * - Grid: actual <table data-testid="location-settings-table-currency"> -- no [role="tabpanel"] wrapper.
 * - Checkboxes: <button type="button" role="checkbox" aria-checked="true|false"> (Radix UI) -- NOT input[type="checkbox"].
 * - Column headers: <th> elements -- no explicit role="columnheader" attribute in DOM.
 * - Save: <button data-testid="location-settings-btn-save">.
 */
export const SetupCurrencySelectors = {
  // ---- Currency Tab Fields ----
  /** @where Setup > Location > Currency tab @el button @text "Save" @keys save submit currency form */
  btnSaveCurrency: '[data-testid="location-settings-btn-save"]',
  /** @where Setup > Location > Currency tab @el table @text "Currency Grid" @keys currency grid table rows */
  tblCurrencyGrid: '[data-testid="location-settings-table-currency"]',

  // ---- Specific Currency Rows (USD) ----
  /** @where Setup > Location > Currency tab > USD row @el checkbox @text "USD Selected" @keys usd selected toggle enable */
  chkUSDSelected: '[data-testid="location-settings-checkbox-currency-USD-selected"]',
  /** @where Setup > Location > Currency tab > USD row @el checkbox @text "USD Is Default" @keys usd default primary toggle */
  chkUSDIsDefault: '[data-testid="location-settings-checkbox-currency-USD-default"]',
  /** @where Setup > Location > Currency tab > USD row @el dropdown @text "USD Merchant" @keys usd merchant combobox */
  drpUSDMerchant: '[data-testid="location-settings-select-currency-USD-merchant"]',

  // ---- Specific Currency Rows (CAD) ----
  /** @where Setup > Location > Currency tab > CAD row @el checkbox @text "CAD Selected" @keys cad selected toggle enable */
  chkCADSelected: '[data-testid="location-settings-checkbox-currency-CAD-selected"]',
  /** @where Setup > Location > Currency tab > CAD row @el checkbox @text "CAD Is Default" @keys cad default primary toggle */
  chkCADIsDefault: '[data-testid="location-settings-checkbox-currency-CAD-default"]',
  /** @where Setup > Location > Currency tab > CAD row @el dropdown @text "CAD Merchant" @keys cad merchant combobox */
  drpCADMerchant: '[data-testid="location-settings-select-currency-CAD-merchant"]',

  // ---- Specific Currency Rows (MXN) ----
  /** @where Setup > Location > Currency tab > MXN row @el checkbox @text "MXN Selected" @keys mxn selected toggle enable */
  chkMXNSelected: '[data-testid="location-settings-checkbox-currency-MXN-selected"]',
  /** @where Setup > Location > Currency tab > MXN row @el checkbox @text "MXN Is Default" @keys mxn default primary toggle */
  chkMXNIsDefault: '[data-testid="location-settings-checkbox-currency-MXN-default"]',
  /** @where Setup > Location > Currency tab > MXN row @el dropdown @text "MXN Merchant" @keys mxn merchant combobox */
  drpMXNMerchant: '[data-testid="location-settings-select-currency-MXN-merchant"]',

  // ---- Column Headers ----
  /** @where Setup > Location > Currency tab > Header @el label @text "Currency Code" @keys column header currency-code */
  colHeaderCurrencyCode: '[data-testid="location-settings-table-currency"] th:has-text("Currency Code")',
  /** @where Setup > Location > Currency tab > Header @el label @text "Selected" @keys column header selected */
  colHeaderSelected: '[data-testid="location-settings-table-currency"] th:has-text("Selected"):not(:has-text("Is Default"))',
  /** @where Setup > Location > Currency tab > Header @el label @text "Is Default" @keys column header default */
  colHeaderIsDefault: '[data-testid="location-settings-table-currency"] th:has-text("Is Default")',
  /** @where Setup > Location > Currency tab > Header @el label @text "Merchant" @keys column header merchant */
  colHeaderMerchant: '[data-testid="location-settings-table-currency"] th:has-text("Merchant")',

  // ---- Empty State ----
  /** @where Setup > Location > Currency tab @el label @text "No Matches Found" @keys empty no-results listbox */
  txtNoMatchesFound: '[role="listbox"]:has-text("No Matches Found")',
} as const;
