export const CORP_PRICING_OVERRIDE = {
  tabs: ['Equipment', 'Labor'] as const,
  defaultTab: 'Equipment' as const,

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

  readOnlyColumns: ['Location', 'Product Group', 'Product Group Name', 'Currency', 'Current Price', 'Mod Date', 'Updated By'] as const,
  editableCells: ['Override Price', 'Max Discount %', 'Active'] as const,

  currencyOptions: ['ALL', 'USD', 'CAD', 'MXN'] as const,
  currencyDefault: 'ALL' as const,

  rowsPerPageOptions: ['10', '20', '30', '40', '50'] as const,
  rowsPerPageDefault: '20' as const,

  activeOnlyDefault: false,

  activeBooleanRender: 'radix-checkbox-aria-checked' as const,

  filterPlaceholder: 'Filter Product Groups Override...',
  filterMode: 'client-side' as const,

  emptyStateText: 'No results.',

  itemCountPattern: /\d[\d,]*\s+items found/,

  locationPicker: {
    searchPlaceholder: 'Search by Location Name, Number',
    columns: ['Local Office', 'Local Office Name'] as const,
    confirmButton: 'Select',
    cancelButtons: ['Cancel', 'Close'] as const,
  } as const,

  saveDialogTitlePattern: /save changes/i,
  saveDialog: { title: 'Save Changes', body: 'Are you sure you want to save the changes?' },
  saveSuccessToast: 'Pricing overrides saved successfully.',

  saveApiPath: '/navigator/api/location/corporate-price-pg-override',

  locationModalTitle: 'Change Local Office',

  gridOptionsToggleColumn: 'Updated By',
  gridOptionsResetLabel: 'Reset to Default',

  /**
   * Override-page Export = a DIRECT CSV download (no Year/Currency dialog — distinct from the
   * Search screen's Export menu). Filter the download's own request on the backend API path, never the page URL.
   *
   * The exported file is the oracle — a tenant-wide dump (rows begin around office 1101, not scoped to
   * whichever office is selected on screen when Export is clicked), a different dataset from the on-screen
   * grid (which has 10 columns incl. Mod Date / Updated By; the file has these 9 instead, incl. Location Id
   * and Is Labor which the grid does not show). Live-verified 2026-07-09 from a real download (8,995 rows):
   * every row splits into exactly 9 comma-separated fields (Product Group Name may contain literal `"`
   * inch-mark characters, RFC4180-quoted/escaped, but never an unquoted comma, so a plain `split(',')` is safe).
   */
  export: {
    filenamePattern: /^ProductGroupOverrides_\d{8}_\d{6}UTC\.csv$/,
    apiPathFragment: 'corporate-price-pg-override/export',
    localeParam: 'locale=en-US',
    expectedHeaders: [
      'Location Id', 'Product Group Id', 'Product Group Name', 'Is Labor',
      'Currency', 'Current Price', 'Override Price', 'Override Discount', 'Is Active',
    ],
    validCurrencies: ['USD', 'CAD', 'MXN'],
    booleanColumns: ['Is Labor', 'Is Active'],
    moneyColumn: 'Current Price',
    optionalMoneyColumn: 'Override Price',
    optionalPercentColumn: 'Override Discount',
  },

  importDialog: {
    title: 'Import All Pricing Overrides',
    buttons: ['Browse', 'Cancel', 'Upload', 'Close'] as const,
  },

  maxDiscountCap: 100,
} as const;

/**
 * Numeric field-coverage values for the Override Price + Max Discount % cells (live-verified editable 2026-06-09).
 * Reuses the Pricing Detail numeric-BVA shape on a distinct screen/fixture. `edited` differs from the
 * fixture default so it produces a net change (a revert-to-original must use the default, not `edited`).
 */
export const OVERRIDE_NUMERIC_CASES = {
  overridePrice: {
    default: '500.00',
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
    boundary: '100', // the inclusive upper cap — commits
    justOver: '101', // one over the cap — flagged aria-invalid, does not commit
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
/**
 * Walk-certified sort oracles for office 1105 Equipment tab (NM-2270).
 * Verified 2026-07-17 (walk-A): the Override grid column sort is triggered via a header
 * dropdown menu ("Sort ascending" / "Sort descending" / "Hide column") — NOT a header-click toggle.
 * Product Group Name ASC first cell: "07A Compass Screen Set Kit";
 * Product Group Name DESC first cell: "Whiteboard Supply - Marker 4 Pk"
 *   (confirmed via live run — the prior constant "Whiteboard Supply" was truncated; full value confirmed 2026-07-18).
 */
export const CORP_PRICING_OVERRIDE_SORT_BED = {
  office: '1105',
  productGroupNameAscFirstCell: '07A Compass Screen Set Kit',
  productGroupNameDescFirstCell: 'Whiteboard Supply - Marker 4 Pk',
  /** Walk-A certified: all 10 columns visible at default state (after Reset to Default). */
  gridDefaultColumnCount: 10,
  /** Walk-A certified: 9 columns visible after hiding "Max Discount %" via Grid Options. */
  gridHiddenColumnCount: 9,
  /** Column hidden in TC-CPR-OVR-048 to exercise the hide/reset round-trip. */
  gridHideTestColumn: 'Max Discount %',
} as const;

/**
 * Read-only data bed for Active-only filter effect tests (office 1105).
 * Verified 2026-07-17: 9 Equipment rows total, 7 active, 2 inactive.
 * The two inactive rows are Product Groups 1482 (Camlok #1) and 1484 (Camlok #2).
 * All rows carry USD currency — no multi-currency data on this office.
 */
export const CORP_PRICING_OVERRIDE_ACTIVE_BED = {
  office: '1105',
  totalRows: 9,
  activeOnlyRows: 7,
  inactiveGroupName1: "Camlok #1 - 50' (Set of 5 Conductors)",
  inactiveGroupName2: "Camlok #2 - 10'",
  textFilterCamlok: 'Camlok',
  camlokTotalRows: 2,
  /**
   * Currency that has override rows on this office. Selecting it must show exactly totalRows.
   * Verified 2026-07-17: all 9 Equipment rows carry USD — no multi-currency data on office 1105.
   */
  presentCurrency: 'USD' as const,
  /**
   * A currency with no override rows on this office. Selecting it must show exactly 0 rows.
   * Verified 2026-07-17 (same walk — 1105 is USD-only; CAD has no rows).
   */
  absentCurrency: 'CAD' as const,
} as const;

export const CORP_PRICING_OVERRIDE_FIXTURE = {
  office: '1606',
  tab: 'Equipment' as const,
  currency: 'ALL' as const,
  /**
   * Mutation-row anchor — CONFIRMED reversible on the live save-cycle (Override Price round-trips
   * 500.00 → 446 → 500.00, office 1606, 2026-07-06). `overridePriceDefault` / `activeDefault` are
   * the baseline `ensureDefaultState` restores to.
   */
  mutationRowAnchor: {
    productGroupId: '2609',
    productGroupName: 'House Video Monitor LED 70"-79"',
    overridePriceDefault: '500.00',
    activeDefault: true,
  },
  readAnchors: [
    { productGroupId: '2609', productGroupName: 'House Video Monitor LED 70"-79"', overridePrice: '500.00' },
    { productGroupId: '2606', productGroupName: 'House Video Monitor LED 40"-49"', overridePrice: '170.00' },
    { productGroupId: '2607', productGroupName: 'House Video Monitor LED 50"-59"', overridePrice: '278.00' },
  ],
} as const;
