/**
 * Corporate Pricing — New Pricebook create-flow selectors (NM-1440).
 *
 * Create page reached via `/settings/corporate-pricing/add?type=equipment|labor`. Shared header
 * (Pricebook Name / Type [disabled, route-fixed] / Price Year / Currency) above two tabs
 * (Pricing Strategy + Pricing Detail), an in-session strategy list with an Add dialog, and a
 * Pricing-Detail product-group source list (double-click ADD). Verified live 2026-06-09.
 *
 * Strategy: text/role/placeholder/content-anchored — near-zero data-testids. The ONLY usable id is
 * `#new-strategy-name` (Add-dialog name field). The form renders in LIGHT DOM (only a
 * `next-route-announcer` shadow host), so plain CSS resolves every field. React-controlled inputs
 * need the native value-setter (see the page object's `setReactInput`) — `.fill()` does not commit
 * React state.
 *
 * Key prefix `np` (mirrors Override's `ovr` precedent) so this 6th partition shares ZERO keys with
 * the Search/Details/Strategy/Detail/Override partitions and passes the intra-module collision
 * check in `src/selectors/index.ts`. The page-level Save button + the two tabs are NOT redefined
 * here — they are reused from the Details shell partition (`btnSaveDetails`, `tabPricingStrategy`,
 * `tabPricingDetail`) via the base page object's `isSaveEnabled`/`clickSaveButtonOrThrow`/`switchTab`.
 */
export const CorporatePricingNewPricebookSelectors = {
  // ---- Header (shared above both tabs) ----
  /** @where NewPricebook > Header @el heading @text "New Pricebook" @keys create page heading */
  npHeading: 'h1:has-text("New Pricebook")',
  /** @where NewPricebook > Header @el textbox @text "Pricebook..." @keys pricebook name field (React controlled) */
  npName: 'input[placeholder="Pricebook..."]',
  /** @where NewPricebook > Header @el textbox @text "e.g. 2026" @keys price year field (numeric-sanitized) */
  npYear: 'input[placeholder="e.g. 2026"]',
  /** @where NewPricebook > Header @el combobox @keys Type[nth=0, disabled] + Currency[nth=1] (exactly 2 on the page) */
  npCombobox: '[role="combobox"]',
  /** @where NewPricebook > Header @el option @keys open-listbox options (Currency: USD/CAD/MXN) */
  npOption: '[role="option"]',

  // ---- Pricing Strategy tab: list + Add dialog ----
  /** @where NewPricebook > Strategy @el text @text "Total: N" @keys strategy count */
  npStrategyTotal: 'text=/Total:\\s*\\d+/',
  /** @where NewPricebook > Strategy @el text @text "No strategies yet" @keys empty-state */
  npNoStrategies: '*:text-is("No strategies yet")',
  /** @where NewPricebook > StrategyDialog @el dialog @text "New Pricing Strategy" @keys add-strategy modal */
  npNewStrategyDialog: '[role="dialog"]:has-text("New Pricing Strategy")',
  /** @where NewPricebook > StrategyDialog @el textbox @id new-strategy-name @keys dialog strategy name (only usable id) */
  npDlgStrategyName: '#new-strategy-name',

  // ---- Pricing Detail tab: product-group source + destination grid ----
  /** @where NewPricebook > Detail @el list @attr draggable=true @keys product-group source items (type-specific catalog) */
  npSourceRow: '[draggable="true"]',
  /** @where NewPricebook > Detail @el textbox @text "Search ID or Name..." @keys product-group filter */
  npSearchProductGroups: 'input[placeholder="Search ID or Name..."]',
  /** @where NewPricebook > Detail @el table @keys pricebook detail grid (ID/Product Group Name/Price/New Price/Max Discount) */
  npDetailGrid: 'table',

  // ---- Save confirm dialog (shared "Save Changes" alertdialog) ----
  /** @where NewPricebook > SaveDialog @el alertdialog @text "Save Changes" @keys save confirm dialog (no-commit → Cancel) */
  npSaveDialog: '[role="alertdialog"]',
} as const;
