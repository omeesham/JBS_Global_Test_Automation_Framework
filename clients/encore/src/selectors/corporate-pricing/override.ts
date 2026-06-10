/**
 * Corporate Pricing — Product Group Override screen selectors (Wave-1.5, live-discovered).
 * URL: /navigator/locations/{office}/settings/corporate-pricing/pg-override
 * Reached via the Search action-bar "Pricing Override" button (navigation confirmed BUILT 2026-06-08).
 *
 * Selector strategy: text / role / grid-column-header / content-anchored. This screen ships
 * **ZERO data-testids** (live audit 2026-06-08) — same sparse-testid reality as the other
 * Corporate Pricing screens (Doctrine 4). Do NOT reuse selectors/locations/pricing.ts.
 *
 * Key-naming: every key is `ovr`-prefixed so this partition shares ZERO keys with the Search /
 * Details / Strategy / Detail partitions — required because `src/selectors/index.ts`
 * `_CORPORATE_PRICING_COLLISION_CHECK` runs `buildAllSelectors` across all partitions and THROWS
 * on a duplicate key (Search already owns generic `btnExport`/`btnImport`/`btnGridOptions`/`btnSave`,
 * pointing at the SEARCH page's controls, LR-017).
 *
 * Per-row cell selectors (`ovrCell*`) are RELATIVE — chain them off a row Locator resolved by
 * content (Product Group name), never an index (LR-022 content-anchored).
 *
 * Verified on the live app, 2026-06-08 (`field-inventories/corporate-pricing-override-2026-06-08.md`).
 */
export const CorporatePricingOverrideSelectors = {
  // ---- Page chrome ----
  /** @where Override @el heading @text "Product Group Override" @keys page title */
  ovrHeading: 'h1:text-is("Product Group Override")',

  // ---- Equipment / Labor tabs (Radix role=tab, aria-selected) ----
  /** @where Override @el tab @text "Equipment" @keys equipment tab default-selected */
  ovrTabEquipment: '[role="tab"]:has-text("Equipment")',
  /** @where Override @el tab @text "Labor" @keys labor tab */
  ovrTabLabor: '[role="tab"]:has-text("Labor")',

  // ---- Left panel: location selector + picker dialog ----
  /** @where Override > Left @el card @text "Select a location" @keys location trigger placeholder (opens picker) */
  ovrSelectLocationText: 'text=Select a location',
  /** @where Override > Picker dialog @el textbox @text "Search by Location Name, Number" @keys location typeahead */
  ovrLocationPickerSearch: 'input[placeholder="Search by Location Name, Number"]',
  /** @where Override > Picker dialog @el row @keys location result row (scope with hasText in page object) */
  ovrLocationPickerRowAny: 'tbody tr',
  /** @where Override > Picker dialog @el checkbox @keys per-row select (relative to a picker row) */
  ovrLocationPickerRowCheckbox: '[role="checkbox"]',
  /** @where Override > Picker dialog @el button @text "Select" @keys confirm location */
  ovrLocationPickerSelect: 'button:text-is("Select")',
  /** @where Override > Picker dialog @el button @text "Cancel" @keys dismiss picker */
  ovrLocationPickerCancel: 'button:text-is("Cancel")',
  /** @where Override > Picker dialog @el button @text "Close" @keys close picker */
  ovrLocationPickerClose: 'button:text-is("Close")',

  // ---- Filters (left panel) ----
  /** @where Override > Left @el combobox @text "Currency :" @keys currency filter (default ALL; opts ALL/USD/CAD/MXN) */
  ovrCurrencyDropdown: 'button[role="combobox"]:has-text("ALL")',
  /** @where Override > Left @el checkbox @text "Active only" @keys active-only filter default-unchecked */
  ovrActiveOnlyCheckbox: 'div:has(> *:text-is("Active only")) [role="checkbox"]',
  /** @where Override @el textbox @text "Filter Product Groups Override..." @keys client-side grid filter */
  ovrFilterInput: 'input[placeholder="Filter Product Groups Override..."]',

  // ---- Grid (10 cols: Location, Product Group, Product Group Name, Currency, Current Price,
  //      Override Price, Max Discount %, Active, Mod Date, Updated By). Real HTML <table>. ----
  // NOTE: use `:has-text` (substring), NOT `:text-is` (exact) — each grid `<th>` nests a "Resize column"
  // button, so the header's full text is e.g. "Override Price Resize column price"; an exact match misses it.
  /** @where Override > Grid @el table @keys override grid (scope by the "Override Price" header) */
  ovrGrid: 'table:has(th:has-text("Override Price"))',
  /** @where Override > Grid @el row @keys data row tbody tr (content-anchored) */
  ovrGridRowAny: 'table:has(th:has-text("Override Price")) tbody tr',
  /** @where Override > Grid @el columnheader @keys 10 column headers th */
  ovrColHeaderAny: 'table:has(th:has-text("Override Price")) th',

  // ---- Per-row editable cells (RELATIVE — chain off a row Locator) ----
  /** @where Override > Grid row @el button @keys Override Price click-to-edit cell (col 6; edit-reveal unresolved — W15-A) */
  ovrCellOverridePrice: 'td:nth-child(6) [role="button"]',
  /** @where Override > Grid row @el button @keys Max Discount % click-to-edit cell (col 7) */
  ovrCellMaxDiscount: 'td:nth-child(7) [role="button"]',
  /** @where Override > Grid row @el checkbox @keys Active toggle (col 8; LR-036 Radix-checkbox boolean — read aria-checked) */
  ovrCellActiveCheckbox: 'td:nth-child(8) [role="checkbox"]',

  // ---- Toolbar (the Override screen's OWN — direct actions, no variant menu) ----
  /** @where Override > Toolbar @el button @text "Save" @keys page-level save (disabled on clean, dialog-gated) */
  ovrBtnSave: 'button:text-is("Save")',
  /** @where Override > Toolbar @el button @text "Export" @keys direct export (no variant dropdown) */
  ovrBtnExport: 'button:text-is("Export")',
  /** @where Override > Toolbar @el button @text "Import" @keys direct import (no variant dropdown) */
  ovrBtnImport: 'button:text-is("Import")',
  /**
   * @where Override > Toolbar @el button @text "Grid Options" @keys column show/hide/reorder popover
   * Grid Options is an sr-only ICON button — its "Grid Options" label sits in a visually-hidden span
   * (NOT a visible text node like the sibling Export/Import buttons; confirmed on the live Override AX
   * tree), so `:text-is("Grid Options")` matches no VISIBLE text and never resolves. Anchor on the
   * accessible name, mirroring the live-verified Search sibling (`search.ts` btnGridOptions). (LR-029.)
   */
  ovrBtnGridOptions: 'button[aria-label="Grid Options"]',

  // ---- Pagination + empty state ----
  /** @where Override > Footer @el combobox @text "20" @keys rows-per-page (opts 10/20/30/40/50) */
  ovrRowsPerPage: 'button[role="combobox"]:has-text("20")',
  /** @where Override > Grid @el text @text "No results." @keys empty state (before location selected) */
  ovrNoResults: 'text=No results.',
  /** @where Override > Footer @el text @keys "N items found" count (VOLATILE — assert pattern not value) */
  ovrItemsFound: 'text=/\\d[\\d,]*\\s+items found/',

  // ---- Save confirmation dialog ----
  // W15-A live finding (2026-06-09): the dialog is `<div role="alertdialog">` but Playwright's
  // `getByRole('alertdialog')` does NOT match it (shadow/portal-nested → excluded from the a11y-role
  // engine), and its buttons carry no computed accessible NAME. Target via the CSS attribute selector
  // + button TEXT (NOT getByRole, NOT the base `confirmSaveDialogIfPresent` which is getByRole-based).
  /** @where Override > Save dialog @el div[role=alertdialog] @text "Save Changes" @keys save confirm dialog */
  ovrSaveDialog: '[role="alertdialog"]',
  /** @where Override > Save dialog @el button @text "Save" @keys confirm save (text-anchored) */
  ovrSaveDialogConfirm: '[role="alertdialog"] button:text-is("Save")',
  /** @where Override > Save dialog @el button @text "Cancel" @keys abort save (text-anchored) */
  ovrSaveDialogCancel: '[role="alertdialog"] button:text-is("Cancel")',
} as const;
