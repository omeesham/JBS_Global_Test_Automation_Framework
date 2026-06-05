/**
 * Corporate Pricing — Search screen (NM-1445) test data.
 * Consumed by `corporate-pricing-search.page.ts` + `corporate-pricing-search.spec.ts`.
 *
 * Source of truth: live walk 2026-06-05 (Playwright CLI, office 1604) —
 * `specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-05.md`.
 * Per LR-015, only LIVE-VERIFIED values committed. Counts that are VOLATILE on the shared
 * office (item total) are asserted by PATTERN, not value (LR-022).
 */

/** The backend list/search endpoint — filter network listeners on `/navigator/api/` (LR-056/ALL-086, NEVER the page URL). */
export const CORP_PRICING_SEARCH_API = '/navigator/api/location/pricing/strategies' as const;

export const CORP_PRICING_SEARCH = {
  /** Live grid headers, in DOM order (9 — D1: "Productions Currency" split into Is Productions + Currency). */
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

  /** The 8 DOCX-named columns (NM-1445 §Columns) to verify ALL present (Doctrine 2 gospel-coverage). */
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

  /** Live header count (D1). Verifying count===9 + all 8 DOCX names present raises the 8↔9 divergence. */
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

  /** The boolean columns (render Unicode ✔ / empty — LR-036). */
  booleanColumns: ['Is GSO', 'Is Internal', 'Is Labor', 'Is Active', 'Is Productions'] as const,
  /** LR-036 render: TRUE = Unicode ✔ (readable via textContent); FALSE = empty cell. */
  booleanTrueMarker: '✔',

  /** Filter default states (live-verified). */
  filterDefaults: {
    pricebook: '',
    pricingStrategy: '',
    location: 'All Locations',
    currency: 'All Currencies',
    isInternal: false,
    isLabor: false,
    activeOnly: true, // DEFAULT CHECKED (resolves helper-003 [ASSUMPTION])
  } as const,

  /** Currency dropdown options (live-verified — replaces S0's unverified USD/CAD/MXN guess). */
  currencyOptions: ['All Currencies', 'USD', 'CAD', 'MXN'] as const,

  /** Location dropdown: searchable popover, first entry "Clear selection"; >200 options (live 2652 — NOT asserted, LR-025). */
  locationDefault: 'All Locations',
  locationFirstEntry: 'Clear selection',
  // Location popover is virtualized/lazy (live 2652 options) — assert only that it POPULATES (> this),
  // never a large structural count (LR-022/LR-025; the 2652 figure lives in the field-inventory).
  locationOptionFloor: 2,

  /** Item-count footer is VOLATILE on shared 1604 — assert this PATTERN, never the number (LR-022). */
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

  /** New split-button menu items + route-param destinations (DOCX R1445-4 "Must"). */
  newMenu: {
    equipment: { item: 'Equipment Pricing', routeParam: 'type=equipment' },
    labor: { item: 'Labor Pricing', routeParam: 'type=labor' },
  } as const,
} as const;
