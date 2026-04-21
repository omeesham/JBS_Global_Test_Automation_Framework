/**
 * Setup Module -- Pricing Tab Selectors.
 * Covers: Corporate pricing, price guide, primary pricing dropdowns, secondary pricing grid.
 */
export const SetupPricingSelectors = {
 // ---- Pricing Tab Fields ----
 // NOTE: Pricing tab uses div/span layout (NOT dt/dd like Local Information tab).
 // Checkboxes are Radix button[role="checkbox"], dropdowns are button[role="combobox"].
 // MCP-verified .
 /** @where Setup > Location > Pricing tab @el checkbox @text "Corporate Pricing" @keys corporate pricing toggle */
  chkCorporatePricing: '[data-testid="location-settings-checkbox-corporate-pricing"]',
 /** @where Setup > Location > Pricing tab @el checkbox @text "Include Service Fee in Price Guides" @keys price-guide inclusive service-fee toggle */
  chkPriceGuideInclusive: '[data-testid="location-settings-checkbox-price-guide-inclusion"]',
 /** @where Setup > Location > Pricing tab @el dropdown @text "Currency" @keys currency filter combobox pricing */
  drpCurrencyFilter: '[data-testid="location-settings-select-pricing-currency"]',
 /** @where Setup > Location > Pricing tab @el button @text "Save" @keys save submit pricing form */
  btnSavePricing: '[data-testid="location-settings-btn-save"]',

 // ---- Primary Pricing Fields ----
 /** @where Setup > Location > Pricing tab @el dropdown @text "Primary Labor Pricing" @keys primary labor pricing combobox */
  drpPrimaryLaborPricing: 'div:has(> span:text-is("Primary Labor Pricing")) button[role="combobox"]',
 /** @where Setup > Location > Pricing tab @el dropdown @text "Primary Equipment Pricing" @keys primary equipment pricing combobox */
  drpPrimaryEquipmentPricing: 'div:has(> span:text-is("Primary Equipment Pricing")) button[role="combobox"]',
 /** @where Setup > Location > Pricing tab @el dropdown @text "Primary Internal Equipment Pricing" @keys primary internal equipment pricing combobox */
  drpPrimaryInternalEquipmentPricing: 'div:has(> span:text-is("Primary Internal Equipment Pricing")) button[role="combobox"]',
 /** @where Setup > Location > Pricing tab @el dropdown @text "Primary Production Labor Pricing" @keys primary production labor pricing combobox */
  drpPrimaryProductionLaborPricing: 'div:has(> span:text-is("Primary Production Labor Pricing")) button[role="combobox"]',
 /** @where Setup > Location > Pricing tab @el dropdown @text "Primary Production Equip. Pricing" @keys primary production equipment pricing combobox */
  drpPrimaryProductionEquipmentPricing: 'div:has(> span:text-is("Primary Production Equip. Pricing")) button[role="combobox"]',

 // ---- Secondary Pricing Grid ----
 /** @where Setup > Location > Pricing tab > Secondary @el table @text "Location Secondary Pricing" @keys secondary pricing grid table */
  tblSecondaryPricingGrid: '[role="tabpanel"] table',

 // ---- Column Headers ----
 /** @where Setup > Location > Pricing tab > Header @el label @text "Pricing Strategy" @keys column header pricing-strategy */
  colHeaderPricingStrategy: 'th:has-text("Pricing Strategy")',
 /** @where Setup > Location > Pricing tab > Header @el label @text "Pricebook" @keys column header pricebook */
  colHeaderPricebook: 'th:has-text("Pricebook")',
 /** @where Setup > Location > Pricing tab > Header @el label @text "Currency" @keys column header currency */
  colHeaderCurrency: 'th:has-text("Currency")',
 /** @where Setup > Location > Pricing tab > Header @el label @text "Is Alternative" @keys column header alternative */
  colHeaderIsAlternative: 'th:has-text("Is Alternate")',
 /** @where Setup > Location > Pricing tab > Header @el label @text "Use Effective Dates" @keys column header effective-date */
  colHeaderUseEffectiveDate: 'th:has-text("Use Effective Dates")',
 /** @where Setup > Location > Pricing tab > Header @el label @text "Start Date" @keys column header start-date */
  colHeaderStartDate: 'th:has-text("Start Date")',
 /** @where Setup > Location > Pricing tab > Header @el label @text "End Date" @keys column header end-date */
  colHeaderEndDate: 'th:has-text("End Date")',
} as const;
