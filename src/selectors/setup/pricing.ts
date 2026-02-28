/**
 * Setup Module -- Pricing Tab Selectors.
 * Covers: Corporate pricing, price guide, primary pricing dropdowns, secondary pricing grid.
 */
export const SetupPricingSelectors = {
  // ---- Pricing Tab Fields ----
  /** @where Setup > Location > Pricing tab @el checkbox @text "Corporate Pricing" @keys corporate pricing toggle */
  chkCorporatePricing: 'dt:has-text("Corporate Pricing") + dd button[role="checkbox"]',
  /** @where Setup > Location > Pricing tab @el checkbox @text "Price Guide Inclusive" @keys price-guide inclusive toggle */
  chkPriceGuideInclusive: 'dt:has-text("Price Guide Inclusive") + dd button[role="checkbox"]',
  /** @where Setup > Location > Pricing tab @el dropdown @text "Currency" @keys currency filter combobox pricing */
  drpCurrencyFilter: 'dt:has-text("Currency") + dd [role="combobox"]',
  /** @where Setup > Location > Pricing tab @el button @text "Save" @keys save submit pricing form */
  btnSavePricing: 'button:has-text("Save")',

  // ---- Primary Pricing Fields ----
  /** @where Setup > Location > Pricing tab @el dropdown @text "Primary Labor Pricing" @keys primary labor pricing combobox */
  drpPrimaryLaborPricing: 'dt:has-text("Primary Labor Pricing") + dd [role="combobox"]',
  /** @where Setup > Location > Pricing tab @el dropdown @text "Primary Equipment Pricing" @keys primary equipment pricing combobox */
  drpPrimaryEquipmentPricing: 'dt:has-text("Primary Equipment Pricing") + dd [role="combobox"]',
  /** @where Setup > Location > Pricing tab @el dropdown @text "Primary Internal Equipment Pricing" @keys primary internal equipment pricing combobox */
  drpPrimaryInternalEquipmentPricing: 'dt:has-text("Primary Internal Equipment Pricing") + dd [role="combobox"]',
  /** @where Setup > Location > Pricing tab @el dropdown @text "Primary Production Labor Pricing" @keys primary production labor pricing combobox */
  drpPrimaryProductionLaborPricing: 'dt:has-text("Primary Production Labor Pricing") + dd [role="combobox"]',
  /** @where Setup > Location > Pricing tab @el dropdown @text "Primary Production Equipment Pricing" @keys primary production equipment pricing combobox */
  drpPrimaryProductionEquipmentPricing: 'dt:has-text("Primary Production Equipment Pricing") + dd [role="combobox"]',

  // ---- Secondary Pricing Grid ----
  /** @where Setup > Location > Pricing tab > Secondary @el table @text "Location Secondary Pricing" @keys secondary pricing grid table */
  tblSecondaryPricingGrid: 'generic:has-text("Location Secondary Pricing") ~ table',

  // ---- Column Headers ----
  /** @where Setup > Location > Pricing tab > Header @el label @text "Pricing Strategy" @keys column header pricing-strategy */
  colHeaderPricingStrategy: '[role="columnheader"]:has-text("Pricing Strategy")',
  /** @where Setup > Location > Pricing tab > Header @el label @text "Pricebook" @keys column header pricebook */
  colHeaderPricebook: '[role="columnheader"]:has-text("Pricebook")',
  /** @where Setup > Location > Pricing tab > Header @el label @text "Currency" @keys column header currency */
  colHeaderCurrency: '[role="columnheader"]:has-text("Currency")',
  /** @where Setup > Location > Pricing tab > Header @el label @text "Is Alternative" @keys column header alternative */
  colHeaderIsAlternative: '[role="columnheader"]:has-text("Is Alternative")',
  /** @where Setup > Location > Pricing tab > Header @el label @text "Use Effective Date" @keys column header effective-date */
  colHeaderUseEffectiveDate: '[role="columnheader"]:has-text("Use Effective Date")',
  /** @where Setup > Location > Pricing tab > Header @el label @text "Start Date" @keys column header start-date */
  colHeaderStartDate: '[role="columnheader"]:has-text("Start Date")',
  /** @where Setup > Location > Pricing tab > Header @el label @text "End Date" @keys column header end-date */
  colHeaderEndDate: '[role="columnheader"]:has-text("End Date")',
} as const;
