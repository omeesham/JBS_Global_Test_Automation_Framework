/**
 * Corporate Pricing — Product Group Override screen test data (live-discovered).
 * Consumed by `corporate-pricing-override.page.ts` + `corporate-pricing-override.spec.ts`.
 *
 * Verified on the live app, 2026-06-08 (office 1604). No design doc for this screen → the live DOM
 * is the source of truth. Only live-verified values are committed; counts that are volatile on the
 * shared office (item total) are asserted by pattern, never value (assert content, not exact counts).
 * Route builder lives in
 * `common.ts` (`CORPORATE_PRICING_ROUTES.overridePath`) — not duplicated here.
 */

export const CORP_PRICING_OVERRIDE = {
  /** Equipment / Labor tabs (Radix `role=tab`, `aria-selected`). */
  tabs: ['Equipment', 'Labor'] as const,
  defaultTab: 'Equipment' as const,

  /**
   * Live grid headers, in DOM order — **10 columns**. Initial exploration noted 9
   * (`Location…Mod Date`); live adds a 10th, `Updated By`. Verify ALL present.
   */
  gridColumns: [
    'Location',
    'Product Group',
    'Product Group Name',
    'Currency',
    'Current Price',
    'Override Price',
    'Max Discount %',
    'Active',
    'Mod Date',
    'Updated By',
  ] as const,

  /** 0-based column indices (for per-row cell access). */
  columnIndex: {
    location: 0,
    productGroup: 1,
    productGroupName: 2,
    currency: 3,
    currentPrice: 4,
    overridePrice: 5,
    maxDiscount: 6,
    active: 7,
    modDate: 8,
    updatedBy: 9,
  } as const,

  /** Read-only (display) columns vs. editable cells (live-observed). */
  readOnlyColumns: ['Location', 'Product Group', 'Product Group Name', 'Currency', 'Current Price', 'Mod Date', 'Updated By'] as const,
  editableCells: ['Override Price', 'Max Discount %', 'Active'] as const,

  /** Currency filter options (live-verified). */
  currencyOptions: ['ALL', 'USD', 'CAD', 'MXN'] as const,
  currencyDefault: 'ALL' as const,

  /** Rows-per-page options + default. */
  rowsPerPageOptions: ['10', '20', '30', '40', '50'] as const,
  rowsPerPageDefault: '20' as const,

  /** Active-only filter default = OFF (differs from the Search screen's Active Only, which defaults ON). */
  activeOnlyDefault: false,

  /**
   * `Active` column boolean render = **Radix checkbox** (a per-table boolean render format). Read via
   * `aria-checked` ('true'/'false'), NEVER `textContent` (empty) or `lucide-check` innerHTML.
   */
  activeBooleanRender: 'radix-checkbox-aria-checked' as const,

  /** Filter input — client-side live filter (no Search button; typing narrows the rendered grid). */
  filterPlaceholder: 'Filter Product Groups Override...',
  filterMode: 'client-side' as const,

  /** Empty state shown before a location is selected (grid is location-gated). */
  emptyStateText: 'No results.',

  /** Item-count footer — VOLATILE on shared 1604; assert this pattern, never the number. */
  itemCountPattern: /\d[\d,]*\s+items found/,

  /** Location picker dialog (opened by the "Select a location" card). */
  locationPicker: {
    searchPlaceholder: 'Search by Location Name, Number',
    columns: ['Local Office', 'Local Office Name'] as const,
    confirmButton: 'Select',
    cancelButtons: ['Cancel', 'Close'] as const,
  } as const,

  /**
   * Save = disabled on clean; dialog-gated (shared Corporate Pricing "Save Changes" alertdialog).
   * Verbatim text + the success toast are live-verified (2026-06-09).
   */
  saveDialogTitlePattern: /save changes/i,
  saveDialog: { title: 'Save Changes', body: 'Are you sure you want to save the changes?' },
  saveSuccessToast: 'Pricing overrides saved successfully.',

  /** Backend save endpoint — filter network listeners on this, NEVER the page URL. */
  saveApiPath: '/navigator/api/location/corporate-price-pg-override',
} as const;

/**
 * Numeric field-coverage values for the Override Price + Max Discount % cells (live-verified editable 2026-06-09).
 * Reuses the Pricing Detail numeric-BVA shape on a distinct screen/fixture. `edited` differs from the
 * fixture default so it produces a net change (a revert-to-original must use the default, not `edited`).
 */
export const OVERRIDE_NUMERIC_CASES = {
  overridePrice: {
    default: '445.00',
    edited: '446',
    zero: '0',
    decimal: '123.45',
    large: '999999',
    nonNumeric: 'abc',
    negative: '-5',
  },
  maxDiscount: {
    edited: '10',
    zero: '0',
    overHundred: '150',
    decimal: '12.5',
    negative: '-5',
  },
} as const;

/**
 * Dedicated Override mutation fixture (F1 isolation) — DISTINCT from the pricebook-GUID fixtures.
 *
 * The Override screen is **NOT pricebook-GUID-based**: it is the `/pg-override` screen, a
 * per-(location, tab) product-group override grid. There is therefore **ZERO row-collision** with
 * `strategyFixture` / `detailFixture` (`CORPORATE_PRICING_FIXTURES` in `common.ts`, which mutate
 * pricebook RECORDS on the `/details/<guid>` screens) — by construction, a different screen and a
 * different data model. Under `workers:2` the Override suite and the Strategy/Detail suites
 * never touch the same row, so no cross-fixture collision is possible.
 *
 * The mutation-row anchor below was **PROVISIONAL** when first live-observed (2026-06-08), then
 * finalized AFTER resolving the Override grid's edit-activation mechanism — the click-to-edit cells
 * did NOT reveal an input via click/dblclick/Enter during the initial read-only exploration.
 * Anchored by content (Product Group ID + Name), never index (assert content, not position).
 */
export const CORP_PRICING_OVERRIDE_FIXTURE = {
  office: '1604',
  tab: 'Equipment' as const,
  currency: 'ALL' as const,
  /**
   * Mutation-row anchor — CONFIRMED reversible (2026-06-09: round-tripped Override Price
   * 445.00 → 446.00 → 445.00 via the live save-cycle). `overridePriceDefault` / `activeDefault` are
   * the baseline `ensureDefaultState` restores to.
   */
  mutationRowAnchor: {
    productGroupId: '2605',
    productGroupName: 'House Video Monitor - Specialty',
    overridePriceDefault: '445.00',
    activeDefault: true,
  },
  /** Live-observed content anchors for read-only assertions (2026-06-08, Equipment tab). */
  readAnchors: [
    { productGroupId: '2605', productGroupName: 'House Video Monitor - Specialty', overridePrice: '445.00' },
    { productGroupId: '2606', productGroupName: 'House Video Monitor LED 40"-49"', overridePrice: '470.00' },
    { productGroupId: '2607', productGroupName: 'House Video Monitor LED 50"-59"', overridePrice: '600.00' },
  ],
} as const;
