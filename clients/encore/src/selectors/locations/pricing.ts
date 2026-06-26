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

 // ---- Primary Pricing Fields (per-currency, matching currency.ts pattern) ----
 // Office 1604 default currency is USD; only USD entries enumerated until live-DOM
 // verification confirms whether CAD/MXN dropdowns render. Add per-ccy variants when
 // a spec needs them and the testid is confirmed present.
 /** @where Setup > Location > Pricing tab > USD @el dropdown @text "Primary Labor Pricing" @keys primary labor pricing combobox usd */
  drpPrimaryLaborPricingUSD: '[data-testid="location-settings-select-primary-labor-pricing-usd"]',
 /** @where Setup > Location > Pricing tab > USD @el dropdown @text "Primary Equipment Pricing" @keys primary equipment pricing combobox usd */
  drpPrimaryEquipmentPricingUSD: '[data-testid="location-settings-select-primary-equipment-pricing-usd"]',
 /** @where Setup > Location > Pricing tab > USD @el dropdown @text "Primary Internal Equipment Pricing" @keys primary internal equipment pricing combobox usd */
  drpPrimaryInternalEquipmentPricingUSD: '[data-testid="location-settings-select-primary-internal-equipment-pricing-usd"]',
 /** @where Setup > Location > Pricing tab > USD @el dropdown @text "Primary Production Labor Pricing" @keys primary production labor pricing combobox usd */
  drpPrimaryProductionLaborPricingUSD: '[data-testid="location-settings-select-primary-production-labor-pricing-usd"]',
 /** @where Setup > Location > Pricing tab > USD @el dropdown @text "Primary Production Equip. Pricing" @keys primary production equipment pricing combobox usd */
  drpPrimaryProductionEquipmentPricingUSD: '[data-testid="location-settings-select-primary-production-equipment-pricing-usd"]',

 // ---- Primary Pricing Fields — CAD (multi-currency offices only, e.g. 1605) ----
 // Live-verified 2026-06-19: all five render and are enabled on office 1605 when Corporate Pricing
 // is checked. Their option lists are currently empty on 1605 ("No pricing strategy found.").
 /** @where Setup > Location > Pricing tab > CAD @el dropdown @text "Primary Labor Pricing" @keys primary labor pricing combobox cad */
  drpPrimaryLaborPricingCAD: '[data-testid="location-settings-select-primary-labor-pricing-cad"]',
 /** @where Setup > Location > Pricing tab > CAD @el dropdown @text "Primary Equipment Pricing" @keys primary equipment pricing combobox cad */
  drpPrimaryEquipmentPricingCAD: '[data-testid="location-settings-select-primary-equipment-pricing-cad"]',
 /** @where Setup > Location > Pricing tab > CAD @el dropdown @text "Primary Internal Equipment Pricing" @keys primary internal equipment pricing combobox cad */
  drpPrimaryInternalEquipmentPricingCAD: '[data-testid="location-settings-select-primary-internal-equipment-pricing-cad"]',
 /** @where Setup > Location > Pricing tab > CAD @el dropdown @text "Primary Production Labor Pricing" @keys primary production labor pricing combobox cad */
  drpPrimaryProductionLaborPricingCAD: '[data-testid="location-settings-select-primary-production-labor-pricing-cad"]',
 /** @where Setup > Location > Pricing tab > CAD @el dropdown @text "Primary Production Equip. Pricing" @keys primary production equipment pricing combobox cad */
  drpPrimaryProductionEquipmentPricingCAD: '[data-testid="location-settings-select-primary-production-equipment-pricing-cad"]',

 // ---- Primary Pricing Fields — MXN (multi-currency offices only, e.g. 1605) ----
 // Live-verified 2026-06-19: all five render and are enabled on office 1605 when Corporate Pricing
 // is checked. Labor and Equipment carry selectable pricing strategies; the other three are empty.
 /** @where Setup > Location > Pricing tab > MXN @el dropdown @text "Primary Labor Pricing" @keys primary labor pricing combobox mxn */
  drpPrimaryLaborPricingMXN: '[data-testid="location-settings-select-primary-labor-pricing-mxn"]',
 /** @where Setup > Location > Pricing tab > MXN @el dropdown @text "Primary Equipment Pricing" @keys primary equipment pricing combobox mxn */
  drpPrimaryEquipmentPricingMXN: '[data-testid="location-settings-select-primary-equipment-pricing-mxn"]',
 /** @where Setup > Location > Pricing tab > MXN @el dropdown @text "Primary Internal Equipment Pricing" @keys primary internal equipment pricing combobox mxn */
  drpPrimaryInternalEquipmentPricingMXN: '[data-testid="location-settings-select-primary-internal-equipment-pricing-mxn"]',
 /** @where Setup > Location > Pricing tab > MXN @el dropdown @text "Primary Production Labor Pricing" @keys primary production labor pricing combobox mxn */
  drpPrimaryProductionLaborPricingMXN: '[data-testid="location-settings-select-primary-production-labor-pricing-mxn"]',
 /** @where Setup > Location > Pricing tab > MXN @el dropdown @text "Primary Production Equip. Pricing" @keys primary production equipment pricing combobox mxn */
  drpPrimaryProductionEquipmentPricingMXN: '[data-testid="location-settings-select-primary-production-equipment-pricing-mxn"]',

 // ---- Secondary Pricing Grid ----
 /** @where Setup > Location > Pricing tab > Secondary @el table @text "Location Secondary Pricing" @keys secondary pricing grid table */
  tblSecondaryPricingGrid: '[data-testid="location-settings-table-secondary-pricing"]',

 // ---- Column Headers ----
 /** @where Setup > Location > Pricing tab > Header @el label @text "Pricing Strategy" @keys column header pricing-strategy */
  colHeaderPricingStrategy: '[data-testid="location-settings-table-pricing-col-pricing-strategy"]',
 /** @where Setup > Location > Pricing tab > Header @el label @text "Pricebook" @keys column header pricebook */
  colHeaderPricebook: '[data-testid="location-settings-table-pricing-col-pricebook"]',
 /** @where Setup > Location > Pricing tab > Header @el label @text "Currency" @keys column header currency */
  colHeaderCurrency: '[data-testid="location-settings-table-pricing-col-currency"]',
 /** @where Setup > Location > Pricing tab > Header @el label @text "Is Alternative" @keys column header alternative */
  colHeaderIsAlternative: '[data-testid="location-settings-table-pricing-col-is-alternate"]',
 /** @where Setup > Location > Pricing tab > Header @el label @text "Use Effective Dates" @keys column header effective-date */
  colHeaderUseEffectiveDate: '[data-testid="location-settings-table-pricing-col-use-effective-dates"]',
 /** @where Setup > Location > Pricing tab > Header @el label @text "Start Date" @keys column header start-date */
  colHeaderStartDate: '[data-testid="location-settings-table-pricing-col-start-date"]',
 /** @where Setup > Location > Pricing tab > Header @el label @text "End Date" @keys column header end-date */
  colHeaderEndDate: '[data-testid="location-settings-table-pricing-col-end-date"]',
} as const;
