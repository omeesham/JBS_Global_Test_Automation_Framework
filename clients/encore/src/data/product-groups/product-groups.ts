/**
 * Test data for the Product Groups pages — the group list/search page (NM-2258) and the
 * Add Product Group page behind its Add button (NM-2259).
 *
 * Both sub-tasks share this file because they share one surface: the create flow is
 * reached from the list page and is proven by searching the new group back on it.
 * Values common to the whole Products area (the office, the Products-page search word)
 * stay in the shared `data/products/products.ts` module.
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

/** The caps the Add page's two text boxes enforce through their maxlength (read live 2026-09-09). */
export const PGR_ADD_LIMITS = {
  nameMaxLength: 50,
  descriptionMaxLength: 100,
} as const;

/**
 * A product group created on office 1101 on 2026-09-09 and never edited. The duplicate-name
 * and duplicate-description cases reuse it as a fixed fixture. There is no delete for product
 * groups, so it stays; if it is ever renamed or removed those cases fail on purpose — restore
 * the fixture rather than loosen the assertion.
 */
export const PGR_EXISTING_GROUP = {
  name: 'ZZ E2E Walk 2026-09-09 A',
  description: 'walk probe A',
} as const;

/** Values the cases drive the sub-class picker with (read live 2026-09-09). */
export const PGR_PICKER = {
  /** Matches a small set of catalog rows (8 on 2026-09-09) — every match contains the word. */
  searchWord: 'Scenery',
  /** Matches nothing in the catalog. */
  noMatchWord: 'zzzzqqq',
  sortAscending: 'Ascending',
  sortDescending: 'Descending',
} as const;

/** Variants the create and dropdown cases use beyond the plain happy path. */
export const PGR_ADD_VARIANTS = {
  /** A Service Type from the middle of the list, chosen by click. */
  middleServiceType: 'Lighting',
  /** The last Service Type in the list, reached with the End key and saved for real. */
  lastServiceType: 'ZSub Rental Specialty',
  /** Embedded in a group name to prove markup and quotes are stored as plain text. */
  specialCharsNamePart: `<b>&'"</b>`,
  inactiveNamePrefix: 'ZZ E2E Inactive',
  specialNamePrefix: 'ZZ E2E Special',
} as const;

/** The Service Type list on the Add page, verbatim and in order — 90 entries on 2026-09-09. */
export const PGR_SERVICE_TYPES = [
  'Equipment Rental',
  'APP Downloaded',
  'App Quality Assurance',
  'App Quality Assurance – M',
  'App Remote Access',
  'Application Development',
  'Application Development – M',
  'Application Programming',
  'Application Programming – M',
  'Audio Conferencing',
  'Cables & Consumables Fee',
  'Cancellation Fee',
  'Commission',
  'Computer Rental',
  'Concise Equipment',
  'Concise Labor - M',
  'Concise Support Labor',
  'Creative Content',
  'Creative Services',
  'Cvent Application Programming – M',
  'Cvent Mobile App',
  'Cvent Remote Access',
  'Cvent Support Labor',
  'Delivery Pickup Labor',
  'Digital Branding',
  'Digital Services',
  'Digital Services Equipment',
  'Digital Services Labor',
  'Digital Services Subrental',
  'Discount',
  'Event Technology Support',
  'Extended Venue Access Managed Services',
  'Freight',
  'HSIA - Equipment',
  'HSIA - Labor',
  'HSIA - Subrental Equipment',
  'HSIA - Wi-Fi Services',
  'HSIA Services',
  'Inter Office',
  'Lighting',
  'Lighting Subrental',
  'Loss Damage Waiver',
  'Misc Revenue',
  'Mobile Apps',
  'Music Access',
  'Operator Labor',
  'Photographic Services',
  'Power Infrastructure',
  'Power Labor',
  'Power Rental Equipment',
  'Power Sub-rental Equipment',
  'Production Labor',
  'Production Management',
  'Receivable',
  'Reimbursed Expense',
  'Revenue',
  'Rigging Equipment - Subrental',
  'Rigging Equipment Rental',
  'Rigging Labor',
  'Rigging Labor - External',
  'Sales & Consumables',
  'Scenic Equipment Rental',
  'Scenic Sub-Rental',
  'Service Charge',
  'Setup Charges',
  'Shipping Resale',
  'Sub-Contracted Labor',
  'Sub-Rental Equipment',
  'Tax',
  'Technical Design & Engineering',
  'Technician - Support Services',
  'Telecom Equipment',
  'Telecom Labor',
  'Telecom Services',
  'Telecom Subrental',
  'TRA/AVT Royalty/Redevance',
  'Venue Equipment Rental',
  'Video Conferencing',
  'Virtual Events Equipment',
  'Virtual Events Professional Service',
  'Virtual Events Support Labor',
  'Web Conferencing',
  'Wedding Event Equipment Rental',
  'Wedding Event Labor',
  'Wedding Event Sales & Consumables',
  'xAdministrative Fee',
  'xHSIA Reimbursed Expense',
  'xMiscellaneous Services',
  'ZSub Contractor Specialty Labor',
  'ZSub Rental Specialty',
] as const;
