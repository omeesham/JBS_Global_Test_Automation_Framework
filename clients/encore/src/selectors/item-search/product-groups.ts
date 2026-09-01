/**
 * Selectors for the Product Groups page and its Add page.
 *
 * Page: `/locations/{office}/products/product-groups` (+ `/add` — a route, not a dialog).
 *
 * Only the Active checkbox carries a testid here (verified live 2026-08-31); everything
 * else anchors on placeholders, visible text, or accessible names. Kept separate from the
 * Products-page selectors per the different-URL partition rule — "Search"/"Reset" exist
 * on both pages and must never merge into one flat object.
 */
export const itemSearchProductGroups = {
  /** Skeleton placeholder shown while any region is still loading. */
  skeleton: '[data-slot="skeleton"]',

  // ---------------------------------------------------------------- list page
  PLACEHOLDER_SEARCH: 'Search Product Groups...',
  chkActive: '[data-testid="e2e-checkbox"]',
  TEXT_RESET: 'Reset',
  TEXT_SEARCH: 'Search',
  TEXT_ADD: 'Add',
  LINK_PRODUCTS: 'Products',
  gridHeaderCells: 'thead th',
  gridRows: 'tbody tr',
  NAME_NEXT_PAGE: 'Go to next page',
  NAME_FIRST_PAGE: 'Go to first page',
  NAME_PAGE_NUMBER: 'Current page number',

  // ---------------------------------------------------------------- add page
  PLACEHOLDER_ADD_NAME: 'Enter Product Group Name',
  PLACEHOLDER_ADD_DESC: 'Enter Product Group Description',
  TEXT_CANCEL: 'Cancel',
  TEXT_SAVE: 'Save',
} as const;
