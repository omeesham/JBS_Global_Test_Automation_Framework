/**
 * Corporate Pricing — Search toolbar I/O test data (NM-1604/1625/1446).
 * Consumed by `corporate-pricing-search.page.ts` + `corporate-pricing-toolbar-io.spec.ts`.
 *
 * Live-verified on the e2e app, 2026-06-09 (office 1604).
 * Trigger-level only: variant enumeration + the correct endpoint/dialog per affordance. Real
 * download/upload round-trip (file content, import validation/error/success) is deferred to
 * a later edge-case test phase. Only live-verified values are committed.
 */

/**
 * Backend export endpoints — filter network listeners on these API paths, NEVER the page URL
 * (filter on the backend API path: Next.js App-Router fires RSC POSTs to the page URL that are NOT data calls).
 */
/** Export ▾ (grid-scoped) — one path, 4 variants distinguished by `isLabor` + `isMaxDiscount` query params. */
export const CORP_PRICING_EXPORT_API = '/navigator/api/location/pricing/pricing-export' as const;
/** "Loc Pricing Export" (location-scoped) — a distinct direct-download endpoint. */
export const CORP_PRICING_LOC_EXPORT_API = '/navigator/api/location/pricing/location-export' as const;

export const CORP_PRICING_TOOLBAR_IO = {
  /**
   * Export ▾ and Import ▾ expose the SAME 4 variant labels (live-verified identical lists).
   * Each export variant fires `pricing-export?isLabor=<x>&isMaxDiscount=<y>&locale=en-US` — the
   * `isLabor`/`isMaxDiscount` pair maps 1:1 to the variant (the live answer to
   * NM-1604 "4 export variants + locale").
   */
  variants: [
    { label: 'All Equipment Pricing', isLabor: false, isMaxDiscount: false },
    { label: 'All Labor Pricing', isLabor: true, isMaxDiscount: false },
    { label: 'All Equipment Max Discount', isLabor: false, isMaxDiscount: true },
    { label: 'All Labor Max Discount', isLabor: true, isMaxDiscount: true },
  ] as const,

  /** Every export request carries the UI locale (NM-1604 locale facet). */
  exportLocaleParam: 'locale=en-US',

  /**
   * Clicking an Import ▾ variant opens a CUSTOM in-app dialog (NOT a native OS file chooser).
   * Dialog title = `titlePrefix` + the variant label, e.g. "Import All Equipment Pricing".
   * No backend request fires on trigger — the upload POST fires only after a file is chosen and
   * "Upload" is clicked (deferred to a later edge-case test phase).
   */
  importDialog: {
    titlePrefix: 'Import ',
    prompt: 'Choose a file to import data',
    buttons: ['Browse', 'Cancel', 'Upload', 'Close'],
  } as const,

  /** "Loc Pricing Import" opens its own import dialog with this exact title. */
  locPricingImportDialogTitle: 'Import All Location Pricing',

  /**
   * Grid Options menu = one `menuitemcheckbox` per grid column (live-verified, all checked by
   * default). Assert each expected column label is offered — never the count.
   */
  gridColumns: [
    'Price Book',
    'Price Book Strategy',
    'Price Year',
    'Is GSO',
    'Is Internal',
    'Is Labor',
    'Is Active',
    'Is Productions',
    'Currency',
  ] as const,

  /**
   * A non-first, reversible column used by the toggle/persist tests. Toggling it OFF hides its
   * `<th>`; the hidden state persists across reload; toggling it back ON restores it (mutation
   * safety — the column-visibility preference is server-persisted per user).
   */
  toggleColumn: 'Price Year',
} as const;
