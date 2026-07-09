/**
 * Corporate Pricing — Product Group Override screen test data (live-discovered).
 * Consumed by `corporate-pricing-override.page.ts` + `corporate-pricing-override.spec.ts`.
 *
 * Verified on the live app (office 1604, 2026-06-08); re-anchored to office 1606 on 2026-07-06 because
 * office 1604 no longer carries Product Group Override data on this environment: its grid reads "0 items"
 * while a same-screen Export still lists rows for 1604, and importing that data fails server-side with a
 * duplicate-key error. This is an OPEN question raised to the Encore product team (see `encore-qa-tracker.xlsx`
 * and NM-1463); office 1606 is the healthy control. REVERT THIS FIXTURE TO OFFICE 1604 WHEN ENCORE RESOLVES IT:
 *   office '1604';
 *   mutationRowAnchor { productGroupId '2605', productGroupName 'House Video Monitor - Specialty',
 *                       overridePriceDefault '445.00', activeDefault true };
 *   readAnchors 2605 @ 445.00 / 2606 @ 470.00 / 2607 @ 600.00;
 *   OVERRIDE_NUMERIC_CASES.overridePrice.default '445.00'.
 * No design doc for this screen → the live DOM
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

  /** Item-count footer — VOLATILE on the shared office; assert this pattern, never the number. */
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

  /** Location picker dialog title (verbatim). */
  locationModalTitle: 'Change Local Office',

  /** Grid Options popover — a reversible column to toggle in tests (a trailing, non-first column). */
  gridOptionsToggleColumn: 'Updated By',
  /** Grid Options "restore all columns" control label. */
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
    /** The 9 header columns, in file order (live-verified 2026-07-09). */
    expectedHeaders: [
      'Location Id', 'Product Group Id', 'Product Group Name', 'Is Labor',
      'Currency', 'Current Price', 'Override Price', 'Override Discount', 'Is Active',
    ],
    /** Currency values actually observed across the full file (live-verified 2026-07-09). */
    validCurrencies: ['USD', 'CAD', 'MXN'],
    /** 0/1 flag columns (live-verified: no other value ever appears). */
    booleanColumns: ['Is Labor', 'Is Active'],
    /** Always populated, always a plain money value (live-verified: 0 malformed of 8,995 rows). */
    moneyColumn: 'Current Price',
    /** Almost always populated with a plain money value; blank on 1 of 8,995 live-verified rows. */
    optionalMoneyColumn: 'Override Price',
    /** Blank on most rows (8,731 of 8,995 live-verified); when set, a plain decimal (percentage), never a "%" sign. */
    optionalPercentColumn: 'Override Discount',
  },

  /** Override-page Import opens a custom in-app dialog (never a native chooser); tests never upload a real file. */
  importDialog: {
    title: 'Import All Pricing Overrides',
    buttons: ['Browse', 'Cancel', 'Upload', 'Close'] as const,
  },

  /** Max Discount % upper cap: values up to and including 100 commit; over 100 is flagged (aria-invalid) and rejected. */
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
  /** Live-observed content anchors for read-only assertions (office 1606, 2026-07-06, Equipment tab). */
  readAnchors: [
    { productGroupId: '2609', productGroupName: 'House Video Monitor LED 70"-79"', overridePrice: '500.00' },
    { productGroupId: '2606', productGroupName: 'House Video Monitor LED 40"-49"', overridePrice: '170.00' },
    { productGroupId: '2607', productGroupName: 'House Video Monitor LED 50"-59"', overridePrice: '278.00' },
  ],
} as const;
