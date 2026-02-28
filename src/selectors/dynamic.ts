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
  chkCurrencySelected: (currency: string) => `[data-testid="currency-${currency.toLowerCase()}-selected"]`,
  /** @where Setup > Location > Currency tab > Grid @el checkbox @text "{currency}" @keys currency default primary @param currency -- currency code (e.g., "USD") */
  chkCurrencyIsDefault: (currency: string) => `[data-testid="currency-${currency.toLowerCase()}-default"]`,
  /** @where Setup > Location > Currency tab > Grid @el dropdown @text "{currency}" @keys currency merchant combobox @param currency -- currency code (e.g., "USD") */
  drpCurrencyMerchant: (currency: string) => `[data-testid="currency-${currency.toLowerCase()}-merchant"]`,
  /** @where Setup > Location > Currency tab > Grid @el cell @text "{currency}" @keys currency code cell value @param currency -- currency code (e.g., "USD") */
  cellCurrencyCode: (currency: string) => `[data-testid="currency-${currency.toLowerCase()}-code"]`,

  // ---- Dropdown Options ----
  /** @where Setup > Location > Currency tab > Merchant dropdown @el row @text "{merchantName}" @keys merchant option listbox select @param merchantName -- merchant name */
  optMerchant: (merchantName: string) => `[role="listbox"] [role="option"]:has-text("${merchantName}")`,

  // ---- Pricing Tab Grid ----
  /** @where Setup > Location > Pricing tab > Grid @el row @text "{priceBookName}" @keys price-book row pricing @param priceBookName -- price book name */
  rowPriceBook: (priceBookName: string) => `tr:has(cell:has-text("${priceBookName}"))`,
  /** @where Setup > Location > Pricing tab > Grid @el checkbox @text "{priceBookName}" @keys alternative price-book toggle @param priceBookName -- price book name */
  chkIsAlternative: (priceBookName: string) => `tr:has(cell:has-text("${priceBookName}")) td:nth-child(4) input[type="checkbox"]`,
  /** @where Setup > Location > Pricing tab > Grid @el checkbox @text "{priceBookName}" @keys effective-date price-book toggle @param priceBookName -- price book name */
  chkUseEffectiveDate: (priceBookName: string) => `tr:has(cell:has-text("${priceBookName}")) td:nth-child(5) input[type="checkbox"]`,
  /** @where Setup > Location > Pricing tab > Grid @el datepicker @text "{priceBookName}" @keys start-date price-book calendar @param priceBookName -- price book name */
  dtpStartDate: (priceBookName: string) => `tr:has(cell:has-text("${priceBookName}")) td:nth-child(6) button`,
  /** @where Setup > Location > Pricing tab > Grid @el datepicker @text "{priceBookName}" @keys end-date price-book calendar @param priceBookName -- price book name */
  dtpEndDate: (priceBookName: string) => `tr:has(cell:has-text("${priceBookName}")) td:nth-child(7) button`,

  /** @where Setup > Location > Pricing tab > Currency filter @el row @text "{currency}" @keys currency filter option listbox @param currency -- currency code */
  optCurrencyFilter: (currency: string) => `[role="listbox"] [role="option"]:has-text("${currency}")`,

  // ---- Auto Add-On Tab (Shadow DOM) ----
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "{itemName}" @keys auto-addon item toggle shadow-dom @param itemName -- add-on item label (e.g., "Encore Music") */
  chkAutoAddOnItem: (itemName: string) => `next-location-settings >> div:has(label:text-is("${itemName}")) button[data-slot="checkbox"]`,
  /** @where Setup > Location > Auto Add-On tab @el label @text "{itemName}" @keys auto-addon item label shadow-dom @param itemName -- add-on item label */
  lblAutoAddOnItem: (itemName: string) => `next-location-settings >> label:text-is("${itemName}")`,
} as const;
