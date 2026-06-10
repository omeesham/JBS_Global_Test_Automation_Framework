/**
 * Corporate Pricing — common/shared test data.
 * Consumed by the Search / Strategy / Detail page objects + the base page object.
 *
 * Verified on the live app, 2026-06-05. Only live-verified values are committed here;
 * values not yet enumerated (e.g. full Location / Currency dropdown option lists) are
 * left to the per-screen data files — never fabricated.
 */

/** Route PATH builders (suffix appended to config.base_url by the page object). */
export const CORPORATE_PRICING_ROUTES = {
  searchPath: (office = '1604'): string =>
    `/locations/${office}/settings/corporate-pricing`,
  detailsPath: (office: string, pricebookId: string): string =>
    `/locations/${office}/settings/corporate-pricing/details/${pricebookId}`,
  /** New Pricebook route — the `type` route param is required. */
  newPricebookPath: (office: string, type: 'equipment' | 'labor'): string =>
    `/locations/${office}/settings/corporate-pricing/add?type=${type}`,
  /** Product Group Override route (Wave-1.5) — reached via the Search "Pricing Override" button (built 2026-06-08). */
  overridePath: (office = '1604'): string =>
    `/locations/${office}/settings/corporate-pricing/pg-override`,
} as const;

/** Two distinct mutation fixtures — different pricebook records, so the Strategy and Detail suites never collide. */
export const CORPORATE_PRICING_FIXTURES = {
  /** Used by the Pricing Detail mutation tests only. Inactive record = lowest impact. */
  detailFixture: {
    name: '2021-PB6',
    guid: '91acb5ca-20e2-ce8e-a9ab-8c370925fd65',
    recordStatus: 'Inactive' as const,
  },
  /** Used by the Pricing Strategy mutation tests only. Active record; restored via ensureDefaultState(). */
  strategyFixture: {
    name: '2022-NP Tier 1',
    guid: '5f2a4088-9268-b033-4925-a48146afb1cb',
    recordStatus: 'Active' as const,
  },
} as const;

export const CORPORATE_PRICING_COMMON = {
  office: '1604',

  /** Search results grid — 9 columns ("Productions Currency" renders split into Is Productions + Currency). */
  searchColumns: [
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
  /** The 8 columns named in the requirements to verify present. */
  docxSearchColumns: [
    'Price Book',
    'Price Book Strategy',
    'Price Year',
    'Is GSO',
    'Is Internal',
    'Is Labor',
    'Is Active',
    'Productions Currency',
  ] as const,

  /** Search filters (exact labels, live-verified). */
  searchFilters: {
    pricebook: { label: 'Pricebook', type: 'text', placeholder: 'Enter name' },
    pricingStrategy: { label: 'Pricing Strategy', type: 'text', placeholder: 'Enter strategy' },
    location: { label: 'Location', type: 'combobox', default: 'All Locations' },
    currency: { label: 'Currency', type: 'combobox', default: 'All Currencies' },
    isInternal: { label: 'Is Internal', type: 'checkbox', default: false },
    isLabor: { label: 'Is Labor', type: 'checkbox', default: false },
    activeOnly: { label: 'Active Only', type: 'checkbox', default: true },
  } as const,

  /** Reference only — VOLATILE on shared 1604 (assert pattern `\d+ items found`, not the exact count). */
  itemCountReference: 591,

  /** Grid boolean cells render as a Unicode ✔ (empty cell = false). */
  booleanRender: 'unicode-check' as const,

  /** Pricebook Details — 2 tabs only; a History tab is absent on the live app. */
  detailsTabs: ['Pricing Strategy', 'Pricing Detail'] as const,

  /** Pricing Strategy editor. */
  strategyEditor: {
    checkboxes: ['Is Productions', 'Is Internal', 'Is GSO', 'Is Active'] as const,
    locationsTableColumns: ['Local Office', 'Local Office Name'] as const,
  } as const,

  /** Pricing Detail grid columns. */
  detailGridColumns: ['ID', 'Product Group Name', 'Price', 'New Price', 'Max Discount'] as const,

  /** TC-ID convention — prefix + per-screen numbering bands. */
  tcIdPrefix: 'TC-LOC-CPR',
  tcBands: {
    search: [1, 99] as const,
    strategy: [100, 199] as const,
    detail: [200, 299] as const,
    newPricebook: [300, 399] as const, // 3NN — New Pricebook create flow
    // Wave-1.5 reservations (consumed downstream — grep-verifiable handoff per LR-040(b)):
    override: [500, 599] as const, // 5NN — Product Group Override FCC
    toolbarIo: [600, 699] as const, // 6NN — Export/Import/Grid Options toolbar I/O FCC
  } as const,

  /**
   * Not enumerated here (left to the Search data file; never fabricated):
   *  - full Location dropdown option list
   *  - full Currency dropdown option list (only USD observed in grid data at the time)
   *  - client-side-vs-server filter classification
   */
  deferredToS1: ['locationOptions', 'currencyOptions', 'filterApiClassification'] as const,
} as const;
