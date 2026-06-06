/**
 * Corporate Pricing — Pricebook Details shell selectors (header + tabs + page-level Save).
 * URL: /navigator/locations/{office}/settings/corporate-pricing/details/{guid}
 *
 * Strategy: text/role anchored — the Details page has ZERO data-testids. The save mechanism
 * (shared "Save Changes" dialog vs direct) is not yet exercised by a mutation, so the base
 * page clickSave() is defensive. The Strategy/Detail suites confirm it on first real mutation.
 * Verified on the live app, 2026-06-05.
 */
export const CorporatePricingDetailsSelectors = {
  /** @where Details @el heading @text "Corporate Pricing Details" @keys details page title */
  hdgDetails: 'h1:text-is("Corporate Pricing Details")',
  /** @where Details > breadcrumb @el link @text "Corporate Pricing" @keys back to search */
  lnkBackToSearch: 'a:has-text("Corporate Pricing")',

  // ---- Tabs (STABLE: exact text on the tab buttons) ----
  /** @where Details > Tabs @el button @text "Pricing Strategy" @keys tab strategy */
  tabPricingStrategy: 'button:has-text("Pricing Strategy")',
  /** @where Details > Tabs @el button @text "Pricing Detail" @keys tab detail */
  tabPricingDetail: 'button:has-text("Pricing Detail")',

  // ---- Page-level Save (shared across both tabs; disabled when clean) ----
  /** @where Details @el button @text "Save" @keys save page-level disabled-when-clean (defensive) */
  btnSaveDetails: 'button:text-is("Save")',

  // ---- Read-only header block (HARDEN: label-proximity) ----
  /** @where Details > Header @el heading @text pricebook name @keys header pricebook name h2 */
  hdgPricebookName: 'h2',
  /** @where Details > Header @el label @text "Labor/Equipment" value @keys header type (label-anchored) — live-verified 2026-06-05 */
  lblHeaderType: 'p:text-is("Labor/Equipment") + p, *:has(> *:text-is("Labor/Equipment"))',
  /** @where Details > Header @el label @text "Year" value @keys header year (label-anchored) */
  lblHeaderYear: 'p:text-is("Year") + p, *:has(> *:text-is("Year"))',
  /** @where Details > Header @el label @text "Currency" value @keys header currency (label-anchored) */
  lblHeaderCurrency: '*:has(> *:text-is("Currency"))',
  /** @where Details > Header @el badge @text "Active"/"Inactive" @keys record status badge */
  lblRecordStatus: 'text=/^(Active|Inactive)$/',
} as const;
