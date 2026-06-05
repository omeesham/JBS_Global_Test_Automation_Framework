/**
 * Corporate Pricing — Pricing Detail tab selectors (NM-1443, S3).
 * Grid columns (D6, live-verified 2026-06-05): ID | Product Group Name | Price | New Price | Max Discount.
 *
 * ⚠ HIGH COMPLEXITY (D7): live counts 2026-06-05 = ~3707 draggable source items, ~4861 inputs,
 * ~2430 grid data rows — heavy but fully rendered (NOT windowed). Use content-anchored reads
 * (LR-053) and NEVER full-snapshot. Grid is a shadcn/Radix HTML `<table>` (`data-slot="table-row"`/
 * `"table-cell"`), 0 data-testids → text/role/grid-header/content-anchor only (Doctrine 4 / D8).
 * Mutation fixture (S3 ONLY): detailFixture = "2021-PB6" (GUID 91acb5ca-20e2-ce8e-a9ab-8c370925fd65,
 * Inactive). Live-verified — field-inventories/corporate-pricing-detail-2026-06-05.md.
 */
export const CorporatePricingDetailGridSelectors = {
  // ---- Grid table (the management workspace, right side) ----
  /** @where Detail > Grid @el table @keys detail grid table (has the 5 product-group columns) */
  tblDetailGrid: 'table:has(th:has-text("Product Group Name"))',
  /** @where Detail > Grid @el row @keys all grid rows incl header (content-anchor per row) */
  rowDetailAny: 'table:has(th:has-text("Product Group Name")) tr',

  // ---- Grid headers (STABLE: th exact text) ----
  /** @where Detail > Grid @el columnheader @text "ID" @keys detail grid id column */
  colDetailId: 'th:has-text("ID")',
  /** @where Detail > Grid @el columnheader @text "Product Group Name" @keys detail grid product-group-name */
  colDetailProductGroupName: 'th:has-text("Product Group Name")',
  /** @where Detail > Grid @el columnheader @text "Price" @keys detail grid base price read-only */
  colDetailPrice: 'th:has-text("Price")',
  /** @where Detail > Grid @el columnheader @text "New Price" @keys detail grid new-price editable (=staging price) */
  colDetailNewPrice: 'th:has-text("New Price")',
  /** @where Detail > Grid @el columnheader @text "Max Discount" @keys detail grid max-discount editable */
  colDetailMaxDiscount: 'th:has-text("Max Discount")',

  // ---- Source list (Available Product Groups, left side, DOCX §1) ----
  /** @where Detail > Source @el draggable @keys product-group source items (ID+Name; clickable + draggable) */
  itemDraggableAny: '[draggable="true"][role="button"]',
  /** @where Detail > Source @el input @text "Search ID or Name..." @keys source-list filter (verbatim placeholder) */
  txtSourceFilter: 'input[placeholder="Search ID or Name..."]',
} as const;

/**
 * Per-row cell column index within a Pricing Detail grid `<tr>` (0-based `<td>` order, live-verified).
 * Price (col 2) is read-only text (no input); New Price (col 3) + Max Discount (col 4) carry the
 * editable inputs. Used by the page object to anchor cell reads/edits by Product Group Name.
 */
export const DETAIL_GRID_COLS = {
  id: 0,
  productGroupName: 1,
  price: 2,
  newPrice: 3,
  maxDiscount: 4,
} as const;
