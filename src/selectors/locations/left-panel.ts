/**
 * Setup Module -- Left Panel & Tab Navigation Selectors.
 * Covers: tab navigation, left panel baseline fields used by page objects.
 * Navigation/search selectors (Setup menu, Location Search) will be added when those flows are automated.
 */
export const SetupLeftPanelSelectors = {
  // ---- Basic Information Page - Left Panel (READ-ONLY baseline fields) ----
  /** @where Setup > Location > Left Panel @el input @text "Office" @keys office code disabled read-only */
  txtOffice: '[data-testid="location-settings-input-primary-location-no"]',
  /** @where Setup > Location > Left Panel @el input @text "Local Office" @keys local-office code disabled read-only */
  txtLocalOffice: '[data-testid="location-settings-input-location-no"]',
  /** @where Setup > Location > Left Panel @el input @text "Pay To Address" @keys pay-to address name billing */
  txtPayToAddress: '[data-testid="location-settings-input-pay-to-name"]',
  /** @where Setup > Location > Left Panel @el checkbox @text "eCommerce Active" @keys ecommerce online toggle */
  chkECommerceActive: '[data-testid="location-settings-checkbox-use-ecommerce"]',
  /** @where Setup > Location > Left Panel @el checkbox @text "Enable Productions Orders" @keys production-orders toggle */
  chkEnableProductionsOrders: '[data-testid="location-settings-checkbox-enable-productions-orders"]',

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
  btnSave: 'form:has(input[name="localOfficeName"]) button:has-text("Save")',
} as const;
