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
  /** Product Group Override route — reached via the Search "Pricing Override" button. */
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
} as const;
