/**
 * Local Office Settings — Basic Information tab selectors + shared tab/dialog infrastructure.
 * URL: /navigator/locations/{officeId}/settings/local-office
 * History-tab selectors live in `./local-office-history.ts` (LocalOfficeHistorySelectors).
 * ECT-tab selectors live in `./local-office-ect.ts` (LocalOfficeEctSelectors).
 * Tab navigation + content panels + Save Changes / Unsaved dialogs stay here as shared infra
 * — HistoryPage / EctPage cascade through this namespace via their getElement overrides.
 */
export const LocalOfficeSettingsSelectors = {
 // ---- Tab Navigation ----
 /** @where Local Office Settings > Tabs @el div[data-testid] @text tab container @keys tabs tablist */
  tabContainer: '[data-testid="local-office-settings-tabs"]',
 /** @where Local Office Settings > Tabs @el tab @text "Basic Information" @keys tab basic-info default */
  tabBasicInformation: '[data-testid="local-office-settings-tab-basic-information"]',
 /** @where Local Office Settings > Tabs @el tab @text "Location Settings History" @keys tab history */
  tabHistory: '[data-testid="local-office-settings-tab-location-settings-history"]',
 /** @where Local Office Settings > Tabs @el tab @text "ECT Settings" @keys tab ect */
  tabEctSettings: '[data-testid="local-office-settings-tab-ect-settings"]',

 // ---- Tab Content Panels ----
 /** @where Local Office Settings > Basic Information @el div @text tab content panel @keys tabpanel basic-info */
  tabContentBasicInfo: '[data-testid="local-office-settings-tab-content-basic-information"]',
 /** @where Local Office Settings > History @el div @text tab content panel @keys tabpanel history */
  tabContentHistory: '[data-testid="local-office-settings-tab-content-history"]',
 /** @where Local Office Settings > ECT @el div @text tab content panel @keys tabpanel ect */
  tabContentEct: '[data-testid="local-office-settings-tab-content-ect-settings"]',

 // ---- Form & Header ----
 /** @where Local Office Settings > Basic Info @el form @text form wrapper @keys form basic-info */
  frmBasicInfo: '[data-testid="local-office-settings-form"]',
 /** @where Local Office Settings > Basic Info @el h3 @text "1604 - Parker Palm Springs" @keys header location name */
  lblLocationHeader: '[data-testid="local-office-settings-location-header"]',
 /** @where Local Office Settings > Basic Info @el button @text "Save" @keys save submit disabled-by-default */
  btnSave: '[data-testid="local-office-settings-btn-save"]',

 // ---- Default Date Offsets ----
 /** @where Local Office Settings > Date Offsets @el div @text section wrapper @keys section date-offsets */
  secDateOffsets: '[data-testid="local-office-settings-section-date-offsets"]',
 /** @where Local Office Settings > Date Offsets @el input @text Prep Date Offset @keys prep offset hours numeric */
  txtPrepDateOffset: '[data-testid="local-office-settings-input-prep-date-offset"]',
 /** @where Local Office Settings > Date Offsets @el input @text Return Date Offset @keys return offset hours numeric */
  txtReturnDateOffset: '[data-testid="local-office-settings-input-return-date-offset"]',
 /** @where Local Office Settings > Date Offsets @el input @text Set Date Offset @keys set offset hours numeric */
  txtSetDateOffset: '[data-testid="local-office-settings-input-set-date-offset"]',
 /** @where Local Office Settings > Date Offsets @el input @text Strike Date Offset @keys strike offset hours numeric */
  txtStrikeDateOffset: '[data-testid="local-office-settings-input-strike-date-offset"]',
 /** @where Local Office Settings > Date Offsets @el input @text Delivery Date Offset @keys delivery offset hours NM-1264 */
  txtDeliveryDateOffset: '[data-testid="local-office-settings-input-delivery-date-offset"]',
 /** @where Local Office Settings > Date Offsets @el input @text Pickup Date Offset @keys pickup offset hours numeric */
  txtPickupDateOffset: '[data-testid="local-office-settings-input-pickup-date-offset"]',

 // ---- Misc Settings ----
 /** @where Local Office Settings > Misc @el div @text section wrapper @keys section misc-settings */
  secMiscSettings: '[data-testid="local-office-settings-section-misc-settings"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Use Fulfillment @keys fulfillment toggle enables-qc */
  chkUseFulfillment: '[data-testid="local-office-settings-checkbox-use-fulfillment"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Use Availability @keys availability toggle */
  chkUseAvailability: '[data-testid="local-office-settings-checkbox-use-availability"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Use Equipments QC @keys qc conditionally-disabled fulfillment-cascade */
  chkUseEquipmentsQc: '[data-testid="local-office-settings-checkbox-use-equipments-qc"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Items Filled from Requests Return to Availability @keys requests availability return */
  chkRequestItemsReturn: '[data-testid="local-office-settings-checkbox-request-items-return"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Allow tentative and confirmed Status same priority @keys tentative confirmed priority */
  chkSamePriority: '[data-testid="local-office-settings-checkbox-same-priority"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Print Description (Default) @keys print description default */
  chkPrintDescription: '[data-testid="local-office-settings-checkbox-print-description"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Use ServiceType for Subrental Inventory Sources @keys subrental service-type inventory */
  chkUseSubrentServiceType: '[data-testid="local-office-settings-checkbox-use-subrent-service-type"]',
 /** @where Local Office Settings > Misc @el input @text Phone 1 @keys phone contact required format-validated */
  txtPhone1: '[data-testid="local-office-settings-input-phone-1"]',
 /** @where Local Office Settings > Misc @el input @text Phone 2 @keys phone contact optional */
  txtPhone2: '[data-testid="local-office-settings-input-phone-2"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Default new job to 1 day - Event @keys job one-day event */
  chkDefaultJobOneDayEvent: '[data-testid="local-office-settings-checkbox-default-job-one-day-event"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Default new job to 1 day - Outside @keys job one-day outside */
  chkDefaultJobOneDayOutside: '[data-testid="local-office-settings-checkbox-default-job-one-day-outside"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Default new job to 1 day - Internal @keys job one-day internal */
  chkDefaultJobOneDayInternal: '[data-testid="local-office-settings-checkbox-default-job-one-day-internal"]',
 /** @where Local Office Settings > Misc @el button[role=checkbox] @text Default Labor to Hourly @keys labor hourly default */
  chkDefaultLaborToHourly: '[data-testid="local-office-settings-checkbox-default-labor-to-hourly"]',
 /** @where Local Office Settings > Misc @el button[role=combobox] @text Default Order Type @keys order-type event outside combobox */
  drpDefaultOrderType: '[data-testid="local-office-settings-select-default-order-type"]',
 /** @where Local Office Settings > Misc @el input @text PO Number @keys po purchase-order textbox */
  txtPoNumber: '[data-testid="local-office-settings-input-po-number"]',
 /** @where Local Office Settings > Misc @el input @text PO Number Label @keys po label textbox */
  txtPoNumberLabel: '[data-testid="local-office-settings-input-po-number-label"]',

 // ---- Section Configuration ----
 /** @where Local Office Settings > Section @el div @text section wrapper @keys section-config */
  secSections: '[data-testid="local-office-settings-section-sections"]',
 /** @where Local Office Settings > Section @el button[role=checkbox] @text Use Section @keys section toggle enable */
  chkUseSection: '[data-testid="local-office-settings-checkbox-use-section"]',
 /** @where Local Office Settings > Section @el button @text Default @keys section reset default */
  btnDefaultSection: '[data-testid="local-office-settings-btn-default-section"]',
 /** @where Local Office Settings > Section @el div @text section table wrapper @keys section-table grid */
  tblSections: '[data-testid="local-office-settings-table-sections"]',

 // ---- Room Configuration ----
 /** @where Local Office Settings > Room Config @el div @text room config wrapper @keys room-config */
  secRoomConfig: '[data-testid="local-office-settings-section-room-config"]',
 /** @where Local Office Settings > Room Config @el div @text room table wrapper @keys room-table grid */
  tblRoomConfig: '[data-testid="local-office-settings-table-room-config"]',

 // ---- Default Logo ----
 /** @where Local Office Settings > Logo @el div @text default logo section @keys logo section */
  secDefaultLogo: '[data-testid="local-office-settings-section-default-logo"]',
 /** @where Local Office Settings > Logo @el button[role=checkbox] @text Quotes @keys logo quotes toggle */
  chkLogoQuotes: '[data-testid="local-office-settings-checkbox-use-quote-logo"]',
 /** @where Local Office Settings > Logo @el button[role=checkbox] @text Rental Orders/DROs @keys logo rental-orders toggle */
  chkLogoRentalOrders: '[data-testid="local-office-settings-checkbox-use-rental-logo"]',
 /** @where Local Office Settings > Logo @el button[role=combobox] @text Company Logo @keys logo company-logo combobox select */
  drpCompanyLogo: '[data-testid="local-office-settings-select-company-logo"]',
 /** @where Local Office Settings > Logo @el img @text logo preview @keys logo preview image display-only */
  imgLogoPreview: '[data-testid="local-office-settings-logo-preview"]',

 // ---- Discount Exemptions ----
 /** @where Local Office Settings > Exemptions @el div @text discount exemptions section @keys discount exemptions */
  secDiscountExemptions: '[data-testid="local-office-settings-section-discount-exemptions"]',
 /** @where Local Office Settings > Exemptions @el div @text discount exemptions table @keys exemption-table grid */
  tblDiscountExemptions: '[data-testid="local-office-settings-table-discount-exemptions"]',

 // ---- Dialogs (shared across BAS/HIS/ECT specs) ----
 // NOTE: Local Office Settings "Save Changes" dialog uses "Save" button (NOT "Ok" like Location Settings).
 // Live-verified: alertdialog has Cancel + Save buttons.
 // The unsaved-changes dialog has custom Stay/Discard buttons (not shared OK/Cancel).
 /** @where Local Office Settings > Save Changes Dialog @el alertdialog @text "Save Changes" @keys save dialog confirm */
  dlgSaveChanges: '[role="alertdialog"]:has-text("Save Changes")',
 /** @where Local Office Settings > Save Changes Dialog @el button @text "Save" @keys save confirm submit dialog */
  btnSaveChangesConfirm: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Save")',
 /** @where Local Office Settings > Save Changes Dialog @el button @text "Cancel" @keys save cancel abort dialog */
  btnSaveChangesCancel: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel")',
 /** @where Local Office Settings > Unsaved Dialog @el alertdialog @text "Any unsaved changes will be lost" @keys unsaved leave stay discard */
  dlgUnsavedLocalOffice: '[role="alertdialog"]:has-text("Any unsaved changes will be lost")',
 /** @where Local Office Settings > Unsaved Dialog @el button @text "Stay" @keys unsaved stay cancel keep */
  btnUnsavedStay: '[role="alertdialog"] button:has-text("Stay")',
 /** @where Local Office Settings > Unsaved Dialog @el button @text "Discard" @keys unsaved discard leave navigate */
  btnUnsavedDiscard: '[role="alertdialog"] button:has-text("Discard")',
} as const;
