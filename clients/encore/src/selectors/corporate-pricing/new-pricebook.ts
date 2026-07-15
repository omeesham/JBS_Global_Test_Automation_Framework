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
  npHeading: 'h1:has-text("New Pricebook")',
  npName: 'input[placeholder="Pricebook..."]',
  npYear: 'input[placeholder="e.g. 2026"]',
  npCombobox: '[role="combobox"]',
  npOption: '[role="option"]',

  npStrategyTotal: 'text=/Total:\\s*\\d+/',
  npNoStrategies: '*:text-is("No strategies yet")',
  npNewStrategyDialog: '[role="dialog"]:has-text("New Pricing Strategy")',
  npDlgStrategyName: '#new-strategy-name',

  npSourceRow: '[draggable="true"]',
  npSearchProductGroups: 'input[placeholder="Search ID or Name..."]',
  npDetailGrid: 'table',

  npSaveDialog: '[role="alertdialog"]',
} as const;
