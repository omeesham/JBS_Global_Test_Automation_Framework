/**
 * Corporate Pricing — Search screen selectors.
 * URL: /navigator/locations/{office}/settings/corporate-pricing
 *
 * Selector strategy: this screen ships near-zero automation-grade data-testids (live audit
 * 2026-06-05: Search = 3 GENERIC values only — e2e-card-header, e2e-card-title, e2e-checkbox —
 * none field-specific; Details/Detail = 0). So selectors are text / role / grid-column-header /
 * content-anchored, NOT data-testid. Do NOT reuse selectors/locations/pricing.ts (that is the
 * per-location Pricing tab — a different module).
 *
 * Stability tiers:
 *  - STABLE (walk-verified, unique anchor): placeholders, exact-text buttons, role+exact-text headers.
 *  - HARDEN: label-proximity comboboxes / per-row grid cells — left as best-effort label anchors here.
 *
 * Verified on the live app, 2026-06-05.
 */
export const CorporatePricingSearchSelectors = {
  // ---- Page chrome ----
  /** @where Corporate Pricing > Search @el heading @text "Corporate Pricing" @keys page title heading */
  hdgCorporatePricing: 'h1:text-is("Corporate Pricing")',

  // ---- Search Criteria filters (STABLE: placeholders are unique) ----
  /** @where Search > Filters @el textbox @text "Pricebook" @keys filter pricebook name */
  txtFilterPricebook: 'input[placeholder="Enter name"]',
  /** @where Search > Filters @el textbox @text "Pricing Strategy" @keys filter strategy */
  txtFilterStrategy: 'input[placeholder="Enter strategy"]',

  // ---- Filter comboboxes (HARDEN: label-proximity; default text shown) ----
  /** @where Search > Filters @el combobox @text "Location" @keys filter location all-locations */
  drpFilterLocation: 'button[role="combobox"]:has-text("All Locations")',
  /** @where Search > Filters @el combobox @text "Currency" @keys filter currency all-currencies */
  drpFilterCurrency: 'button[role="combobox"]:has-text("All Currencies")',

  // ---- Filter checkboxes (HARDEN: anchored by adjacent label text) ----
  /** @where Search > Filters @el checkbox @text "Is Internal" @keys filter checkbox is-internal */
  chkFilterIsInternal: 'label:has-text("Is Internal") [role="checkbox"], div:has(> *:text-is("Is Internal")) [role="checkbox"]',
  /** @where Search > Filters @el checkbox @text "Is Labor" @keys filter checkbox is-labor */
  chkFilterIsLabor: 'div:has(> *:text-is("Is Labor")) [role="checkbox"]',
  /** @where Search > Filters @el checkbox @text "Active Only" @keys filter checkbox active-only default-checked */
  chkFilterActiveOnly: 'div:has(> *:text-is("Active Only")) [role="checkbox"]',

  // ---- Filter actions (STABLE: exact text) ----
  /** @where Search > Filters @el button @text "Search" @keys search submit filters */
  btnSearch: 'button:text-is("Search")',
  /** @where Search > Filters @el button @text "Reset" @keys reset clear filters */
  btnReset: 'button:text-is("Reset")',

  // ---- Top action bar (STABLE: exact text) ----
  /** @where Search > Action bar @el button @text "New" (split-button → Equipment/Labor Pricing) @keys new pricebook create */
  btnNew: 'button:text-is("New")',
  /** @where Search > New menu @el menuitem @text "Equipment Pricing" @keys new equipment route-param type=equipment */
  mnuNewEquipmentPricing: '[role="menuitem"]:text-is("Equipment Pricing")',
  /** @where Search > New menu @el menuitem @text "Labor Pricing" @keys new labor route-param type=labor */
  mnuNewLaborPricing: '[role="menuitem"]:text-is("Labor Pricing")',
  /** @where Search > Action bar @el button @text "Pricing Override" @keys pricing override */
  btnPricingOverride: 'button:text-is("Pricing Override")',
  /** @where Search > Action bar @el button @text "Loc Pricing Export" @keys location pricing export */
  btnLocPricingExport: 'button:text-is("Loc Pricing Export")',
  /** @where Search > Action bar @el button @text "Loc Pricing Import" @keys location pricing import */
  btnLocPricingImport: 'button:text-is("Loc Pricing Import")',
  /** @where Search > Action bar @el button @text "Export" @keys export grid */
  btnExport: 'button:text-is("Export")',
  /** @where Search > Action bar @el button @text "Import" @keys import grid */
  btnImport: 'button:text-is("Import")',
  /** @where Search > Action bar @el button @text "Grid Options" @keys grid options columns */
  btnGridOptions: 'button:text-is("Grid Options")',

  // ---- Results grid (HARDENED 2026-06-05: real HTML <table>, NOT ARIA grid roles) ----
  // Live walk found ZERO role="grid"/"row"/"columnheader" — the grid is a shadcn/TanStack
  // DataTable rendering `<table><thead><th>` + `<tbody><tr><td>`. The prior role-based
  // selectors resolved to nothing. Corrected to tag selectors. (verified live 2026-06-05)
  /** @where Search > Grid @el table @keys results grid table virtualized 591 */
  gridResults: 'table',
  /** @where Search > Grid @el row @keys data row tbody tr content-anchored (50 rendered, virtualized) */
  rowGridAny: 'tbody tr',
  /** @where Search > Grid @el columnheader @keys 9 column headers th */
  colHeaderAny: 'th',
  /** @where Search > Grid @el button @keys per-column resize handle, aria-label "Resize column <internalKey>" (stable per-column anchor) */
  colResizeHandleAny: 'button[aria-label^="Resize column "]',
  /** @where Search > Grid @el button @keys Price Book name cell → navigates to /details/<guid> (content-anchored) */
  rowNameButton: 'tbody tr td button.cursor-pointer',
  /** @where Search > Grid @el span @text "✔" @keys boolean TRUE marker (Unicode; FALSE = empty td) */
  cellBooleanTrue: 'td span.text-primary',
  /** @where Search > Grid footer @el text @text "N items found" @keys item count total (VOLATILE — assert pattern not value) */
  lblItemsFound: 'text=/\\d[\\d,]*\\s+items found/',
} as const;
