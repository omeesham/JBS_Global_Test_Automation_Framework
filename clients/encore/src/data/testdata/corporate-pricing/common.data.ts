/**
 * Corporate Pricing — common/shared test data (S0 foundation).
 * Consumed by S1 (Search) / S2 (Strategy) / S3 (Detail) + the base page object.
 *
 * Source of truth: live walk 2026-06-05 (walk-evidence-corporate-pricing-2026-06-05.md).
 * Per LR-015, only LIVE-VERIFIED values are committed here. Values NOT enumerated in S0
 * (e.g. full Location / Currency dropdown option lists) are explicitly deferred to the
 * screen owner (S1) — never fabricated.
 */

/** Route PATH builders (suffix appended to config.base_url by the page object). */
export const CORPORATE_PRICING_ROUTES = {
  searchPath: (office = '1604'): string =>
    `/locations/${office}/settings/corporate-pricing`,
  detailsPath: (office: string, pricebookId: string): string =>
    `/locations/${office}/settings/corporate-pricing/details/${pricebookId}`,
  /** NM-1440 New Pricebook (BUILT) — route-param `type` is REQUIRED (DOCX R1445-4). */
  newPricebookPath: (office: string, type: 'equipment' | 'labor'): string =>
    `/locations/${office}/settings/corporate-pricing/add?type=${type}`,
} as const;

/** TWO distinct mutation fixtures (F1) — different pricebook records, no S2/S3 collision. */
export const CORPORATE_PRICING_FIXTURES = {
  /** S3 (Pricing Detail mutations) ONLY. Inactive record = lowest blast radius. */
  detailFixture: {
    name: '2021-PB6',
    guid: '91acb5ca-20e2-ce8e-a9ab-8c370925fd65',
    recordStatus: 'Inactive' as const,
  },
  /** S2 (Pricing Strategy mutations) ONLY. Active record; S2 restores via ensureDefaultState(). */
  strategyFixture: {
    name: '2022-NP Tier 1',
    guid: '5f2a4088-9268-b033-4925-a48146afb1cb',
    recordStatus: 'Active' as const,
  },
} as const;

export const CORPORATE_PRICING_COMMON = {
  office: '1604',

  /** Search results grid — 9 columns (D1; "Productions Currency" split into Is Productions + Currency). */
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
  /** The 8 DOCX-named columns to verify present (Doctrine 2 gospel-coverage). */
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

  /** Grid boolean cell render = Unicode ✔ (LR-036 Unicode format; FALSE = empty). */
  booleanRender: 'unicode-check' as const,

  /** Pricebook Details — 2 tabs only (D5); History (NM-1444) ABSENT. */
  detailsTabs: ['Pricing Strategy', 'Pricing Detail'] as const,

  /** Pricing Strategy editor (S2). */
  strategyEditor: {
    checkboxes: ['Is Productions', 'Is Internal', 'Is GSO', 'Is Active'] as const,
    locationsTableColumns: ['Local Office', 'Local Office Name'] as const,
  } as const,

  /** Pricing Detail grid columns (D6). */
  detailGridColumns: ['ID', 'Product Group Name', 'Price', 'New Price', 'Max Discount'] as const,

  /** TC-ID convention (F10) — prefix + per-screen numbering bands. */
  tcIdPrefix: 'TC-LOC-CPR',
  tcBands: {
    search: [1, 99] as const,
    strategy: [100, 199] as const,
    detail: [200, 299] as const,
  } as const,

  /**
   * NOT enumerated in S0 (deferred to S1, the Search owner — LR-015, do not fabricate):
   *  - full Location dropdown option list
   *  - full Currency dropdown option list (only USD observed in grid data; master guessed USD/CAD/MXN — unverified)
   *  - client-side-vs-server filter classification (D2)
   */
  deferredToS1: ['locationOptions', 'currencyOptions', 'filterApiClassification'] as const,
} as const;
