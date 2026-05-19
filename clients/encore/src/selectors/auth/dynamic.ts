/**
 * Dynamic selectors -- require parameters, not included in ALL_SELECTORS lookup.
 * Use directly: DynamicSelectors.lnkOfficeCode('1604')
 */
export const DynamicSelectors = {
 // ---- Location Search Results ----
 /** @where Setup > Location Search > Results grid @el link @text "{officeCode}" @keys office-code location link navigate @param officeCode -- office code (e.g., "1604") */
  lnkOfficeCode: (officeCode: string) => `a:has-text("${officeCode}")`,

 // ---- Currency Tab Grid ----
 /** @where Setup > Location > Currency tab > Grid @el checkbox @text "{currency}" @keys currency selected toggle enable @param currency -- currency code (e.g., "USD") */
  chkCurrencySelected: (currency: string) => `[data-testid="location-settings-checkbox-currency-${currency}-selected"]`,
 /** @where Setup > Location > Currency tab > Grid @el checkbox @text "{currency}" @keys currency default primary @param currency -- currency code (e.g., "USD") */
  chkCurrencyIsDefault: (currency: string) => `[data-testid="location-settings-checkbox-currency-${currency}-default"]`,
 /** @where Setup > Location > Currency tab > Grid @el dropdown @text "{currency}" @keys currency merchant combobox @param currency -- currency code (e.g., "USD") */
  drpCurrencyMerchant: (currency: string) => `[data-testid="location-settings-select-currency-${currency}-merchant"]`,
 /** @where Setup > Location > Currency tab > Grid @el cell @text "{currency}" @keys currency code cell value @param currency -- currency code (e.g., "USD") */
  cellCurrencyCode: (currency: string) => `[data-testid="location-settings-cell-currency-${currency}-code"]`,

 // ---- Dropdown Options ----
 /** @where Setup > Location > Currency tab > Merchant dropdown @el row @text "{merchantName}" @keys merchant option listbox select @param merchantName -- merchant name */
  optMerchant: (merchantName: string) => `[role="listbox"] [role="option"]:has-text("${merchantName}")`,

 // ---- Pricing Tab Grid ----
 // NOTE: Grid checkboxes are Radix button[role="checkbox"], not native input[type="checkbox"].
 // Date cells use input[data-slot="input"], not direct <button>. MCP-verified .
 /** @where Setup > Location > Pricing tab > Grid @el row @text "{priceBookName}" @keys price-book row pricing @param priceBookName -- price book name */
  rowPriceBook: (priceBookName: string) => `tr:has(td:has-text("${priceBookName}"))`,
 /** @where Setup > Location > Pricing tab > Grid @el checkbox @text "{priceBookName}" @keys alternative price-book toggle @param priceBookName -- price book name */
  chkIsAlternative: (priceBookName: string) => `tr:has(td:has-text("${priceBookName}")) td:nth-child(4) button[role="checkbox"]`,
 /** @where Setup > Location > Pricing tab > Grid @el checkbox @text "{priceBookName}" @keys effective-date price-book toggle @param priceBookName -- price book name */
  chkUseEffectiveDate: (priceBookName: string) => `tr:has(td:has-text("${priceBookName}")) td:nth-child(5) button[role="checkbox"]`,
 /** @where Setup > Location > Pricing tab > Grid @el datepicker @text "{priceBookName}" @keys start-date price-book calendar @param priceBookName -- price book name */
  dtpStartDate: (priceBookName: string) => `tr:has(td:has-text("${priceBookName}")) td:nth-child(6) input[data-slot="input"]`,
 /** @where Setup > Location > Pricing tab > Grid @el datepicker @text "{priceBookName}" @keys end-date price-book calendar @param priceBookName -- price book name */
  dtpEndDate: (priceBookName: string) => `tr:has(td:has-text("${priceBookName}")) td:nth-child(7) input[data-slot="input"]`,

 /** @where Setup > Location > Pricing tab > Currency filter @el row @text "{currency}" @keys currency filter option listbox @param currency -- currency code */
  optCurrencyFilter: (currency: string) => `[role="listbox"] [role="option"]:has-text("${currency}")`,

 // ---- Auto Add-On Tab ----
 // NOTE: Shadow DOM (next-location-settings >>) was eliminated. Use static selectors in src/selectors/setup/locations/auto-addon.ts instead.
 // These dynamic selectors are DEPRECATED — kept only for reference. Use the data-testid-based selectors.
} as const;
