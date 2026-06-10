/**
 * Corporate Pricing — Search screen test data.
 * Consumed by `corporate-pricing-search.page.ts` + `corporate-pricing-search.spec.ts`.
 *
 * Verified on the live app, 2026-06-05 (office 1604). Only live-verified values are
 * committed. Counts that are volatile on the shared office (item total) are asserted by
 * pattern, not value.
 */

/** The backend list/search endpoint — filter network listeners on `/navigator/api/`, never the page URL. */
export const CORP_PRICING_SEARCH_API = '/navigator/api/location/pricing/strategies' as const;

export const CORP_PRICING_SEARCH = {
  /** Live grid headers, in DOM order (9 — "Productions Currency" renders split into Is Productions + Currency). */
  liveColumns: [
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

  /** The 8 columns named in the requirements to verify ALL present. */
  docxColumns: [
    'Price Book',
    'Price Book Strategy',
    'Price Year',
    'Is GSO',
    'Is Internal',
    'Is Labor',
    'Is Active',
    'Productions Currency',
  ] as const,

  /** Live header count. Verifying count===9 while all 8 named columns are present surfaces the 8-vs-9 difference. */
  liveColumnCount: 9,

  /** Internal sort/resize keys per column (from `aria-label="Resize column <key>"`), DOM order. */
  columnKeys: [
    'pricebookName',
    'strategyName',
    'strategyYear',
    'isGSO',
    'isInternal',
    'isLabor',
    'isActive',
    'isProduction',
    'currencyAbbrv',
  ] as const,

  /** The boolean columns (render Unicode ✔ / empty). */
  booleanColumns: ['Is GSO', 'Is Internal', 'Is Labor', 'Is Active', 'Is Productions'] as const,
  /** Render: TRUE = Unicode ✔ (readable via textContent); FALSE = empty cell. */
  booleanTrueMarker: '✔',

  /** Filter default states (live-verified). */
  filterDefaults: {
    pricebook: '',
    pricingStrategy: '',
    location: 'All Locations',
    currency: 'All Currencies',
    isInternal: false,
    isLabor: false,
    activeOnly: true, // default checked
  } as const,

  /** Currency dropdown options (live-verified). */
  currencyOptions: ['All Currencies', 'USD', 'CAD', 'MXN'] as const,

  /** Location dropdown: searchable popover, first entry "Clear selection"; >200 options (live 2652 — not asserted). */
  locationDefault: 'All Locations',
  locationFirstEntry: 'Clear selection',
  // Location popover is virtualized/lazy (live 2652 options) — assert only that it POPULATES (> this),
  // never a large structural count (the exact 2652 figure is volatile).
  locationOptionFloor: 2,

  /** Item-count footer is volatile on shared 1604 — assert this pattern, never the number. */
  itemCountPattern: /\d[\d,]*\s+items found/,
  itemCountReference: 591, // reference only, NOT asserted

  /** A stable filter-match fixture (live-verified 2026-06-05): Pricebook="2021-PB6" → exactly 1 row. */
  pricebookFilterSample: { value: '2021-PB6', expectedName: '2021-PB6' } as const,

  /** Is Internal Search → narrows (live-verified → "3 items found", first "2023-Internal1"). */
  isInternalSample: { firstNarrowedName: '2023-Internal1' } as const,

  /** Action-bar buttons present (exact text). */
  actionButtons: [
    'New',
    'Pricing Override',
    'Loc Pricing Export',
    'Loc Pricing Import',
    'Export',
    'Import',
    'Grid Options',
  ] as const,

  /** New split-button menu items + route-param destinations. */
  newMenu: {
    equipment: { item: 'Equipment Pricing', routeParam: 'type=equipment' },
    labor: { item: 'Labor Pricing', routeParam: 'type=labor' },
  } as const,

  /**
   * FCC P2 (Wave-2) — live-verified 2026-06-10 (`field-inventories/corporate-pricing-search-2026-06-10.md`).
   * The complete server query-param contract + BVA/each-option samples. The P1 walk left `currencyId`/
   * `locationNo` unverified and GUESSED `strategyName` — corrected here to the live `pricingStrategyName`.
   */
  fcc: {
    /** Server query-param NAMES (each verified by capturing the Search request URL). */
    params: {
      pricebook: 'pricebookName',
      strategy: 'pricingStrategyName',
      currency: 'currencyId',
      location: 'locationNo',
      isInternal: 'isInternal',
      isLabor: 'isLabor',
      isActive: 'isActive',
    },
    /** Currency dropdown → server `currencyId` integer (USD=1, CAD=2, MXN=3). `All Currencies` = param absent. */
    currencyId: { USD: 1, CAD: 2, MXN: 3 },
    /** Pricebook BVA / negative samples. */
    pricebookNoMatch: 'ZZZ-NOPE-NOMATCH-9999',
    pricebookOverflow: 'A'.repeat(250), // no maxlength — accepted in full, server returns 0
    pricebookSpecial: `%_'"<>&#`, // accepted literally; URL-encoded; no crash; escapable (§2.1)
    pricebookSpecialEncoded: 'pricebookName=%25_%27%22%3C%3E%26%23',
    pricebookWhitespace: '   ', // server ignores whitespace → full list
    /** A broad substring matching many pricebooks (live: 583) — used to stage compound/reset cases. */
    pricebookBroad: '2',
    /** Pricing Strategy negative sample. */
    strategyNoMatch: 'ZZZ-NOPE-STRAT',
  },
} as const;
