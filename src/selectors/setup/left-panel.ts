/**
 * Setup Module -- Left Panel & Navigation Selectors.
 * Covers: setup menu navigation, location search, tab navigation, left panel baseline fields.
 */
export const SetupLeftPanelSelectors = {
  // ---- Navigation ----
  /** @where Setup > Navigation @el button @text "Setup" @keys setup menu sidebar navigation */
  btnSetupMenu: 'button:has-text("Setup")',
  /** @where Setup > Navigation @el link @text "Settings" @keys settings location navigate sidebar */
  lnkLocation: 'a[href*="/settings"]',
  /** @where Setup > Location > Header @el button @text "Back to Location Search" @keys back return search breadcrumb */
  btnBackToLocationSearch: 'button:has-text("Back to Location Search")',

  // ---- Location Search Page ----
  /** @where Setup > Location Search @el input @text "Local Office" @keys search office-code filter find */
  txtLocalOfficeSearch: 'input[placeholder=""], label:has-text("Local Office") + input',
  /** @where Setup > Location Search @el button @text "Search" @keys search submit find locations */
  btnSearch: 'button:has-text("Search")',
  /** @where Setup > Location Search @el button @text "Reset" @keys reset clear filters */
  btnReset: 'button:has-text("Reset")',
  /** @where Setup > Location Search @el table @text "Results" @keys grid results locations list */
  gridLocationResults: '[role="grid"]',

  // ---- Basic Information Page - Left Panel (READ-ONLY baseline fields) ----
  /** @where Setup > Location > Left Panel @el input @text "Office" @keys office code disabled read-only */
  txtOffice: '[data-testid="location-settings-input-primary-location-no"]',
  /** @where Setup > Location > Left Panel @el input @text "Local Office" @keys local-office code disabled read-only */
  txtLocalOffice: '[data-testid="location-settings-input-location-no"]',
  /** @where Setup > Location > Left Panel @el input @text "Local Office Name" @keys name editable location */
  txtLocalOfficeName: '[data-testid="location-settings-input-location-name"]',
  /** @where Setup > Location > Left Panel @el checkbox @text "Active" @keys active status toggle location */
  chkActive: '[data-testid="location-settings-checkbox-active"]',
  /** @where Setup > Location > Left Panel @el datepicker @text "Live Date" @keys live-date popover calendar */
  btnLiveDate: 'button:has-text("Open popover")',
  /** @where Setup > Location > Left Panel @el dropdown @text "Tax Mode" @keys tax-mode combobox setting */
  drpTaxMode: 'label:has-text("Tax Mode") ~ [role="combobox"]',
  /** @where Setup > Location > Left Panel @el dropdown @text "Country" @keys country combobox geography */
  drpCountry: '[data-testid="location-settings-select-country"]',
  /** @where Setup > Location > Left Panel @el dropdown @text "Region" @keys region combobox geography */
  drpRegion: '[data-testid="location-settings-select-region"]',
  /** @where Setup > Location > Left Panel @el dropdown @text "Servicing Branch Office" @keys servicing-branch branch combobox */
  drpServicingBranchOffice: '[data-testid="location-settings-select-servicing-branch"]',
  /** @where Setup > Location > Left Panel @el dropdown @text "Line Of Business" @keys line-of-business lob combobox */
  drpLineOfBusiness: 'label:has-text("Line Of Business") ~ [role="combobox"]',
  /** @where Setup > Location > Left Panel @el input @text "Pay To Address" @keys pay-to address name billing */
  txtPayToAddress: '[data-testid="location-settings-input-pay-to-name"]',
  /** @where Setup > Location > Left Panel @el checkbox @text "Union" @keys union labor toggle */
  chkUnion: '[data-testid="location-settings-checkbox-is-union"]',
  /** @where Setup > Location > Left Panel @el checkbox @text "eCommerce Active" @keys ecommerce online toggle */
  chkECommerceActive: '[data-testid="location-settings-checkbox-use-ecommerce"]',
  /** @where Setup > Location > Left Panel @el checkbox @text "Enable Productions Orders" @keys production-orders toggle */
  chkEnableProductionsOrders: '[data-testid="location-settings-checkbox-enable-productions-orders"]',

  // ---- Tab Navigation ----
  /** @where Setup > Location > Tabs @el tab @text "Basic Information" @keys tab basic-info navigate */
  tabBasicInformation: '[data-testid="location-settings-tab-basic-information"]',
  /** @where Setup > Location > Tabs @el tab @text "Location Management History" @keys tab management history navigate */
  tabLocationManagementHistory: '[data-testid="location-settings-tab-management-history"]',
  /** @where Setup > Location > Tabs @el tab @text "Local Information" @keys tab local-info navigate settings */
  tabLocalInformation: '[data-testid="location-settings-sub-tab-local-information"]',
  /** @where Setup > Location > Tabs @el tab @text "Currency" @keys tab currency navigate */
  tabCurrency: '[data-testid="location-settings-sub-tab-currency"]',
  /** @where Setup > Location > Tabs @el tab @text "Pricing" @keys tab pricing navigate */
  tabPricing: '[data-testid="location-settings-sub-tab-pricing"]',
  /** @where Setup > Location > Tabs @el tab @text "Account and Address" @keys tab account address navigate */
  tabAccountAndAddress: '[data-testid="location-settings-sub-tab-account-and-address"]',
  /** @where Setup > Location > Tabs @el tab @text "Legal" @keys tab legal navigate */
  tabLegal: '[data-testid="location-settings-sub-tab-legal"]',
  /** @where Setup > Location > Tabs @el tab @text "Notes" @keys tab notes navigate */
  tabNotes: '[data-testid="location-settings-sub-tab-notes"]',
  /** @where Setup > Location > Tabs @el tab @text "Shared Setup Locations" @keys tab shared-setup navigate */
  tabSharedSetupLocations: '[data-testid="location-settings-sub-tab-shared-setup-locations"]',
  /** @where Setup > Location > Tabs @el tab @text "Auto Add-On" @keys tab auto-addon navigate */
  tabAutoAddOn: '[data-testid="location-settings-sub-tab-auto-add-on"]',
  /** @where Setup > Location > Auto Add-On tab @el panel @text "Auto Add-On" @keys shadow-host container web-component */
  pnlAutoAddOn: 'next-location-settings',

  // ---- Left Panel Save Button ----
  /** @where Setup > Location > Left Panel @el button @text "Save" @keys save submit left-panel form */
  btnSave: 'form:has(input[name="localOfficeName"]) button:has-text("Save")',
} as const;
