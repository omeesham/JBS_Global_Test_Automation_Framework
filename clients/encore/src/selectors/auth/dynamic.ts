/**
 * Dynamic selectors -- require parameters, not included in ALL_SELECTORS lookup.
 * Use directly: DynamicSelectors.lnkOfficeCode('1604')
 */
export const DynamicSelectors = {
 // ---- Location Search Results ----
 /** @where Setup > Location Search > Results grid @el link @text "{officeCode}" @keys office-code location link navigate @param officeCode -- office code (e.g., "1604") */
  lnkOfficeCode: (officeCode: string) => `a:has-text("${officeCode}")`,

 // ---- Pricing Tab Grid ----
 // NOTE: Grid checkboxes are Radix button[role="checkbox"], not native input[type="checkbox"].
 // Date cells use input[data-slot="input"], not direct <button>. Live-verified.
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

 // Auto Add-On tab selectors are static (data-testid based) and live in
 // src/selectors/locations/auto-addon.ts — none are parameterized, so none belong in this file.
} as const;
