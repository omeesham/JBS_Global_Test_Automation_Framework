/**
 * Setup Module — Left Panel (Basic Information) Selectors.
 *
 * Covers the shared left-panel card on Location Settings (`/settings/location`, Basic Information):
 * 6 read-only + 8 editable fields, tab navigation, and the shared Save button.
 *
 * Renamed from `left-panel.ts` (2026-06-03). Selector
 * KEYS are unchanged (page objects resolve by key via ALL_SELECTORS); only the export name +
 * file name changed, plus the 9 net-new field selectors below.
 *
 * Live-verified 2026-06-03 — see field-inventories/left-panel-basic-information-2026-06-03.md.
 * Tax Mode / Live Date / Line Of Business have NO data-testid → label-anchored selectors
 * (Playwright's CSS engine pierces open shadow roots AND supports `:has()` / `:text-is()`).
 */
export const SetupLeftPanelBasicInformationSelectors = {
  // ---- READ-ONLY fields (6) ----
  /** @where Setup > Location > Left Panel @el input @text "Office" @keys office code disabled read-only */
  txtOffice: '[data-testid="location-settings-input-primary-location-no"]',
  /** @where Setup > Location > Left Panel @el input @text "Local Office" @keys local-office code disabled read-only */
  txtLocalOffice: '[data-testid="location-settings-input-location-no"]',
  /** @where Setup > Location > Left Panel @el input @text "Pay To Address" @keys pay-to address name billing read-only */
  txtPayToAddress: '[data-testid="location-settings-input-pay-to-name"]',
  /** @where Setup > Location > Left Panel @el checkbox @text "eCommerce Active" @keys ecommerce online toggle disabled */
  chkECommerceActive: '[data-testid="location-settings-checkbox-use-ecommerce"]',
  /** @where Setup > Location > Left Panel @el checkbox @text "Enable Productions Orders" @keys production-orders toggle disabled */
  chkEnableProductionsOrders: '[data-testid="location-settings-checkbox-enable-productions-orders"]',
  /**
   * @where Setup > Location > Left Panel @el combobox @text "Line Of Business" @keys lob division disabled read-only
   * Read-only/disabled in EDIT mode by Encore design (NM-831 / NM-1140 — only selectable during
   * location CREATION). No data-testid → label-anchored.
   */
  drpLineOfBusiness: 'div:has(> label:text-is("Line Of Business")) button[role="combobox"]',

  // ---- EDITABLE fields (8) ----
  /** @where Setup > Location > Left Panel @el input @text "Local Office Name" @keys name editable maxlength-50 */
  txtLocalOfficeName: '[data-testid="location-settings-input-location-name"]',
  /** @where Setup > Location > Left Panel @el checkbox @text "Active" @keys active toggle editable */
  chkActive: '[data-testid="location-settings-checkbox-active"]',
  /** @where Setup > Location > Left Panel @el button @text "Live Date" @keys live-date popover datepicker editable. No testid → label-anchored. */
  btnLiveDate: 'div:has(> label:text-is("Live Date")) button',
  /** @where Setup > Location > Left Panel @el combobox @text "Tax Mode" @keys tax-mode dropdown editable. No testid → label-anchored. */
  drpTaxMode: 'div:has(> label:text-is("Tax Mode")) button[role="combobox"]',
  /** @where Setup > Location > Left Panel @el combobox @text "Country" @keys country dropdown cascade editable */
  drpCountry: '[data-testid="location-settings-select-country"]',
  /** @where Setup > Location > Left Panel @el combobox @text "Region" @keys region dropdown editable */
  drpRegion: '[data-testid="location-settings-select-region"]',
  /** @where Setup > Location > Left Panel @el combobox @text "Servicing Branch Office" @keys servicing-branch dropdown large editable */
  drpServicingBranch: '[data-testid="location-settings-select-servicing-branch"]',
  /** @where Setup > Location > Left Panel @el checkbox @text "Union" @keys union toggle editable */
  chkUnion: '[data-testid="location-settings-checkbox-is-union"]',

  // ---- Tab Navigation ----
  /** @where Setup > Location > Tabs @el tab @text "Basic Information" @keys tab basic-info navigate */
  tabBasicInformation: '[data-testid="location-settings-tab-basic-information"]',
  /** @where Setup > Location > Tabs @el tab @text "Local Information" @keys tab local-info navigate settings */
  tabLocalInformation: '[data-testid="location-settings-sub-tab-local-information"]',
  /** @where Setup > Location > Tabs @el tab @text "Currency" @keys tab currency navigate */
  tabCurrency: '[data-testid="location-settings-sub-tab-currency"]',
  /** @where Setup > Location > Tabs @el tab @text "Pricing" @keys tab pricing navigate */
  tabPricing: '[data-testid="location-settings-sub-tab-pricing"]',

  // ---- Left Panel Save Button ----
  /** @where Setup > Location > Left Panel @el button @text "Save" @keys save submit left-panel form */
  btnSave: '[data-testid="location-settings-btn-save"]',
} as const;
