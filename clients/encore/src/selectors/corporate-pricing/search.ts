export const CorporatePricingSearchSelectors = {
  hdgCorporatePricing: 'h1:text-is("Corporate Pricing")',

  txtFilterPricebook: 'input[placeholder="Enter name"]',
  txtFilterStrategy: 'input[placeholder="Enter strategy"]',

  drpFilterLocation: 'button[role="combobox"]:has-text("All Locations")',
  drpFilterCurrency: 'button[role="combobox"]:has-text("All Currencies")',

  chkFilterIsInternal: 'label:has-text("Is Internal") [role="checkbox"], div:has(> *:text-is("Is Internal")) [role="checkbox"]',
  chkFilterIsLabor: 'div:has(> *:text-is("Is Labor")) [role="checkbox"]',
  chkFilterActiveOnly: 'div:has(> *:text-is("Active Only")) [role="checkbox"]',

  btnSearch: 'button:text-is("Search")',
  btnReset: 'button:text-is("Reset")',

  btnNew: 'button:text-is("New")',
  mnuNewEquipmentPricing: '[role="menuitem"]:text-is("Equipment Pricing")',
  mnuNewLaborPricing: '[role="menuitem"]:text-is("Labor Pricing")',
  btnPricingOverride: 'button:text-is("Pricing Override")',
  btnLocPricingExport: 'button:text-is("Loc Pricing Export")',
  btnLocPricingImport: 'button:text-is("Loc Pricing Import")',
  btnExport: 'button:text-is("Export")',
  btnImport: 'button:text-is("Import")',
  /**
   * @where Search > Action bar @el button @text "Grid Options" @keys grid options columns
   * Live correction (2026-06-09): Grid Options is a 32×32 ICON button — its "Grid Options" label is
   * sr-only, so `:text-is("Grid Options")` matches no VISIBLE text and never resolves. Anchor on the
   * accessible name instead (`aria-label`, `aria-haspopup="menu"`). Live-verified, not invented.
   */
  btnGridOptions: 'button[aria-label="Grid Options"]',

  mnuToolbarVariant: '[role="menuitem"]',
  mnuGridColumn: '[role="menuitemcheckbox"]',
  /**
   * @where Search > Import ▾ / Loc Pricing Import @el dialog @keys the custom "Import ..." upload dialog
   * Matches either ARIA role (the app's confirm/import dialogs are sometimes `alertdialog`, portal-nested);
   * callers scope it further by the "Choose a file to import data" prompt text to disambiguate.
   */
  dlgImport: '[role="dialog"], [role="alertdialog"]',
  btnImportBrowse: 'button:text-is("Browse")',
  btnImportUpload: 'button:text-is("Upload")',
  inputImportFile: 'input[type="file"]',

  /**
   * @where Search > Export ▾ variant @el dialog @keys the "Export" Year(s)+Currency precondition dialog
   * Base role selector; the page object scopes it by the unique prompt text ("Select between 1 and 3 years")
   * so it never collides with the import dialog or other page dialogs.
   */
  dlgExport: '[role="dialog"]',
  cmbExportField: 'button[role="combobox"]',
  optExportListItem: '[role="option"]',

  /**
   * @where Search > Import ▾ variant @el dialog @keys the "Import" Year(s)+Currency precondition dialog
   * Base role selector; the page object scopes it by the unique prompt AND the "Import" title (the Export
   * dialog carries the identical prompt), so it never collides with the Export or upload dialogs.
   */
  dlgImportAll: '[role="dialog"]',
  cmbImportAllField: 'button[role="combobox"]',
  optImportAllListItem: '[role="option"]',
  dlgPublishItems: '[role="dialog"]',
  chkPublishRow: '[role="checkbox"]',
  btnPublish: 'button:text-is("Publish")',

  // Live walk found ZERO role="grid"/"row"/"columnheader" — the grid is a shadcn/TanStack
  // DataTable rendering `<table><thead><th>` + `<tbody><tr><td>`. The prior role-based
  // selectors resolved to nothing. Corrected to tag selectors. (verified live 2026-06-05)
  gridResults: 'table',
  rowGridAny: 'tbody tr',
  colHeaderAny: 'th',
  colResizeHandleAny: 'button[aria-label^="Resize column "]',
  rowNameButton: 'tbody tr td button.cursor-pointer',
  cellBooleanTrue: 'td span.text-primary',
  lblItemsFound: 'text=/\\d[\\d,]*\\s+items found/',
  lblNoResults: 'text="No results."',

  btnPageFirst: 'button[aria-label="Go to first page"]',
  btnPagePrev: 'button[aria-label="Go to previous page"]',
  btnPageNext: 'button[aria-label="Go to next page"]',
  btnPageLast: 'button[aria-label="Go to last page"]',
  /**
   * @where Search > Pagination @el combobox @keys rows-per-page selector
   * The page-size selector is the only [role="combobox"] whose label is purely digits (the Location /
   * Currency filter comboboxes show words). Default "50"; options 10/20/30/40/50. Resolve via the
   * digit-text filter in the page object (a bare role selector would also match the filter comboboxes).
   */
  drpPageSizeRole: '[role="combobox"]',
} as const;
