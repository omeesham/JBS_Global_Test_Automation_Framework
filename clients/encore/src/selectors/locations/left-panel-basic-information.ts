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
 * Live-verified 2026-06-03.
 * Tax Mode / Live Date / Line Of Business have NO data-testid → label-anchored selectors
 * (Playwright's CSS engine pierces open shadow roots AND supports `:has()` / `:text-is()`).
 */
export const SetupLeftPanelBasicInformationSelectors = {
  txtOffice: '[data-testid="location-settings-input-primary-location-no"]',
  txtLocalOffice: '[data-testid="location-settings-input-location-no"]',
  txtPayToAddress: '[data-testid="location-settings-input-pay-to-name"]',
  chkECommerceActive: '[data-testid="location-settings-checkbox-use-ecommerce"]',
  chkEnableProductionsOrders: '[data-testid="location-settings-checkbox-enable-productions-orders"]',
  /**
   * @where Setup > Location > Left Panel @el combobox @text "Line Of Business" @keys lob division disabled read-only
   * Read-only/disabled in EDIT mode by Encore design (NM-831 / NM-1140 — only selectable during
   * location CREATION). No data-testid → label-anchored.
   */
  drpLineOfBusiness: 'div:has(> label:text-is("Line Of Business")) button[role="combobox"]',

  txtLocalOfficeName: '[data-testid="location-settings-input-location-name"]',
  chkActive: '[data-testid="location-settings-checkbox-active"]',
  btnLiveDate: 'div:has(> label:text-is("Live Date")) button',
  drpTaxMode: 'div:has(> label:text-is("Tax Mode")) button[role="combobox"]',
  drpCountry: '[data-testid="location-settings-select-country"]',
  drpRegion: '[data-testid="location-settings-select-region"]',
  drpServicingBranch: '[data-testid="location-settings-select-servicing-branch"]',
  chkUnion: '[data-testid="location-settings-checkbox-is-union"]',

  tabBasicInformation: '[data-testid="location-settings-tab-basic-information"]',
  tabLocalInformation: '[data-testid="location-settings-sub-tab-local-information"]',
  tabCurrency: '[data-testid="location-settings-sub-tab-currency"]',
  tabPricing: '[data-testid="location-settings-sub-tab-pricing"]',

  btnSave: '[data-testid="location-settings-btn-save"]',

  // Live-verified 2026-06-11. Pay To Address is a LAUNCHER:
  // the disabled display input (`txtPayToAddress` above) shows the current Pay To NAME, but the
  // field's <label> opens the "Pay To List" search dialog. A plain Playwright .click() on the label
  // is BLOCKED (the label's `for=` points at the disabled input → "element is not enabled") → the
  // page object drives the launcher via dispatchEvent('click') / click({force:true}).
  // No data-testid on the dialog; mirrors the Select Customer Address dialog.
  // Uses a role+text fallback; switch to testids if the app adds them.
  /**
   * @where Setup > Location > Left Panel @el label @text "Pay To Address" @keys pay-to launcher dialog opener
   * Launcher affordance lives on the LABEL (React onClick). Drive via dispatched/forced click — a
   * standard click is blocked by the disabled-input `for=` association (`affordance: launcher → "Pay To List"`).
   */
  lblPayToAddress: 'label:has-text("Pay To Address")',
  dlgPayToList: '[role="dialog"]:has-text("Pay To List")',
  // The 5 filter inputs (Pay To ID / Pay To Name / Address / Phone / Fax) derive their ACCESSIBLE NAME
  // from a sibling label element (no stable CSS attribute — confirmed via the live a11y tree 2026-06-11),
  // so the page object locates them by accessible name: `dlgPayToList.getByRole('textbox', { name })`.
  // Not expressible as a CSS-string selector key here (getByRole is the only robust handle).
  btnPTLSearch: '[role="dialog"]:has-text("Pay To List") button:has-text("Search")',
  btnPTLReset: '[role="dialog"]:has-text("Pay To List") button:has-text("Reset")',
  btnPTLSelect: '[role="dialog"]:has-text("Pay To List") button:text-is("Select")',
  btnPTLCancel: '[role="dialog"]:has-text("Pay To List") button:has-text("Cancel")',
  btnPTLClose: '[role="dialog"]:has-text("Pay To List") button:has-text("Close")',
  tblPTLResults: '[role="dialog"]:has-text("Pay To List") table',
  chkPTLRowFirst: '[role="dialog"]:has-text("Pay To List") tbody tr:first-child td:first-child button[role="checkbox"]',
} as const;
