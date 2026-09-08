/**
 * Test data for the Product Groups pages — the group list/search page (NM-2258) and the
 * Add Product Group page behind its Add button (NM-2259).
 *
 * Both sub-tasks share this file because they share one surface: the create flow is
 * reached from the list page and is proven by searching the new group back on it.
 * Values common to the whole Products area (the office, the Products-page search word)
 * stay in the shared `data/item-search/item-search.ts` module.
 *
 * Every constant below was read from the live application on office 1101 during the
 * 2026-08-31 verification session; the create values were exercised end to end on
 * 2026-09-02 (product group id 4581).
 */

/** URL path builder for the group list page. */
export const PGR_ROUTE = (office: string) => `/locations/${office}/products/product-groups`;

/** Reference search word for the Product Groups page — 82 groups at verification. */
export const PGR_SEARCH_WORD = 'Audio';

/** The Product Groups grid columns, verbatim and in order. */
export const PGR_COLUMNS = ['Name', 'Description', 'Service Type', 'Status'] as const;

/** The Product Groups page turns a smaller page — 20 rows — by design difference. */
export const PGR_DEFAULT_PAGE_SIZE = '20';

/**
 * Values for creating a product group from the Add page. A group needs a name, a
 * description, a service type and at least one sub-class (added by double-clicking any
 * item in the picker's list). A per-run unique name is appended in the test so repeated
 * runs never collide; the created group is proven by searching the name back.
 */
export const PGR_ADD_GROUP = {
  serviceType: 'Equipment Rental',
  namePrefix: 'ZZ E2E Group',
  descriptionPrefix: 'Automated group create check',
} as const;
