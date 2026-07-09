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
  /**
   * @where Search > Action bar @el button @text "Grid Options" @keys grid options columns
   * Live correction (2026-06-09): Grid Options is a 32×32 ICON button — its "Grid Options" label is
   * sr-only, so `:text-is("Grid Options")` matches no VISIBLE text and never resolves. Anchor on the
   * accessible name instead (`aria-label`, `aria-haspopup="menu"`). Live-verified, not invented.
   */
  btnGridOptions: 'button[aria-label="Grid Options"]',

  // ---- Toolbar I/O dropdowns + dialogs (live-verified 2026-06-09) ----
  /** @where Search > Export ▾ / Import ▾ @el menuitem @keys the 4 export/import variant items (menu must be open) */
  mnuToolbarVariant: '[role="menuitem"]',
  /** @where Search > Grid Options @el menuitemcheckbox @keys per-column show/hide toggles (menu must be open) */
  mnuGridColumn: '[role="menuitemcheckbox"]',
  /**
   * @where Search > Import ▾ / Loc Pricing Import @el dialog @keys the custom "Import ..." upload dialog
   * Matches either ARIA role (the app's confirm/import dialogs are sometimes `alertdialog`, portal-nested);
   * callers scope it further by the "Choose a file to import data" prompt text to disambiguate.
   */
  dlgImport: '[role="dialog"], [role="alertdialog"]',
  /** @where Import dialog @el button @text "Browse" @keys opens the native file chooser; choosing a file auto-submits the import (no separate Upload click — live-verified 2026-07-07) */
  btnImportBrowse: 'button:text-is("Browse")',
  /** @where Import dialog @el button @text "Upload" @keys legacy submit button; the app auto-submits on file choice, so this is not the automation path */
  btnImportUpload: 'button:text-is("Upload")',
  /** @where Import dialog @el input @keys the hidden file input (accept=".csv"); driven via setInputFiles, scoped to the dialog */
  inputImportFile: 'input[type="file"]',

  // ---- Export precondition dialog (NM-2264 — Year(s) + Currency gate; live-verified 2026-07-07) ----
  /**
   * @where Search > Export ▾ variant @el dialog @keys the "Export" Year(s)+Currency precondition dialog
   * Base role selector; the page object scopes it by the unique prompt text ("Select between 1 and 3 years")
   * so it never collides with the import dialog or other page dialogs.
   */
  dlgExport: '[role="dialog"]',
  /** @where Export dialog @el combobox @keys the Year(s) + Currency comboboxes inside the dialog */
  cmbExportField: 'button[role="combobox"]',
  /** @where Export dialog listbox @el option @keys Year(s) / Currency options (portalled; list must be open) */
  optExportListItem: '[role="option"]',

  // ---- Import ▾ All precondition dialog + publish modal (NM-2265; live-verified 2026-07-08) ----
  /**
   * @where Search > Import ▾ variant @el dialog @keys the "Import" Year(s)+Currency precondition dialog
   * Base role selector; the page object scopes it by the unique prompt AND the "Import" title (the Export
   * dialog carries the identical prompt), so it never collides with the Export or upload dialogs.
   */
  dlgImportAll: '[role="dialog"]',
  /** @where Import precondition dialog @el combobox @keys the Year(s) (nth 0) + Currency (nth 1) comboboxes */
  cmbImportAllField: 'button[role="combobox"]',
  /** @where Import precondition listbox @el option @keys Year(s) / Currency options (portalled; list must be open) */
  optImportAllListItem: '[role="option"]',
  /**
   * @where Search > Import All upload dialog @el dialog @keys the "Select items to publish" delta-review modal
   * Scoped in the page object by its heading; lists one row per changed cell with a per-row + select-all checkbox.
   */
  dlgPublishItems: '[role="dialog"]',
  /** @where Publish modal @el checkbox @keys per-row + select-all checkboxes; callers scope to the modal (or its tbody for per-row). Publish is disabled until ≥1 is checked */
  chkPublishRow: '[role="checkbox"]',
  /** @where Publish modal @el button @text "Publish" @keys commits the selected staged rows (the only mutating action) */
  btnPublish: 'button:text-is("Publish")',

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
  /** @where Search > Grid empty-state @el text @text "No results." @keys verbatim empty message when a filter matches nothing */
  lblNoResults: 'text="No results."',

  // ---- Pagination (live-verified: shadcn DataTable footer; page 1 → first/prev disabled, next/last enabled) ----
  /** @where Search > Pagination @el button @keys go to first page (disabled on page 1) */
  btnPageFirst: 'button[aria-label="Go to first page"]',
  /** @where Search > Pagination @el button @keys go to previous page (disabled on page 1) */
  btnPagePrev: 'button[aria-label="Go to previous page"]',
  /** @where Search > Pagination @el button @keys go to next page */
  btnPageNext: 'button[aria-label="Go to next page"]',
  /** @where Search > Pagination @el button @keys go to last page */
  btnPageLast: 'button[aria-label="Go to last page"]',
  /**
   * @where Search > Pagination @el combobox @keys rows-per-page selector
   * The page-size selector is the only [role="combobox"] whose label is purely digits (the Location /
   * Currency filter comboboxes show words). Default "50"; options 10/20/30/40/50. Resolve via the
   * digit-text filter in the page object (a bare role selector would also match the filter comboboxes).
   */
  drpPageSizeRole: '[role="combobox"]',
} as const;
