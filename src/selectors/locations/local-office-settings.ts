/**
 * Local Office Settings Page — Basic Information, History, ECT tabs.
 * URL: /navigator/locations/{officeId}/settings/local-office
 * MCP-verified on location 1604, 2026-03-23.
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

  // ---- History Tab ----
  /** @where Local Office Settings > History @el div @text history type selector wrapper @keys history type-selector */
  secHistoryTypeSelector: '[data-testid="local-office-settings-history-type-selector"]',
  /** @where Local Office Settings > History @el button[role=combobox] @text "Location Management History" @keys history select-type combobox */
  drpHistoryType: '[data-testid="local-office-settings-history-select-type"]',
  /** @where Local Office Settings > History @el div @text history table container @keys history table-container */
  secHistoryTableContainer: '[data-testid="local-office-settings-history-table-container"]',
  /** @where Local Office Settings > History @el table @text history audit log @keys history table read-only */
  tblHistory: '[data-testid="local-office-settings-history-table"]',

  // ---- ECT Settings Tab ----
  /** @where Local Office Settings > ECT @el div @text ECT section header @keys ect header section */
  secEctHeader: '[data-testid="ect-settings-section-header"]',
  /** @where Local Office Settings > ECT @el div @text ECT header wrapper @keys ect header */
  secEctHeaderInner: '[data-testid="ect-settings-header"]',
  /** @where Local Office Settings > ECT @el h6 @text "1604 - Parker Palm Springs" @keys ect location-name label */
  lblEctLocationName: '[data-testid="ect-settings-label-location-name"]',
  /** @where Local Office Settings > ECT @el a @text "Commission structure" @keys ect commission link external */
  lnkCommissionStructure: '[data-testid="ect-settings-link-commission-structure"]',
  /** @where Local Office Settings > ECT @el button[role=combobox] @text "USD" @keys ect currency select combobox */
  drpCurrency: '[data-testid="ect-settings-select-currency"]',

  // ---- ECT: Event Profit Target ----
  /** @where Local Office Settings > ECT > Profit Target @el div @text event profit target section @keys ect profit-target section */
  secEventProfitTarget: '[data-testid="ect-settings-section-event-profit-target"]',
  /** @where Local Office Settings > ECT > Profit Target @el h4 @text "Event Profit Target" @keys ect profit-target title */
  lblEventProfitTarget: '[data-testid="ect-settings-section-title-event-profit-target"]',
  /** @where Local Office Settings > ECT > Profit Target @el div @text profit target table wrapper @keys ect profit-target table read-only */
  tblEventProfitTarget: '[data-testid="ect-settings-table-event-profit-target"]',

  // ---- ECT: Fixed Costs ----
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text Save button wrapper for fixed costs @keys ect save fixed-costs */
  secSaveFixedCosts: '[data-testid="ect-settings-btn-save-fixed-costs"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el button @text "Save" @keys ect save fixed-costs button disabled-by-default */
  btnSaveFixedCosts: '[data-testid="ect-settings-btn-save-fixed-costs-btn"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text fixed costs section wrapper @keys ect fixed-costs section */
  secFixedCosts: '[data-testid="ect-settings-section-fixed-costs"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Venue Fixed Costs" field @keys ect venue-fixed-costs read-only */
  fldVenueFixedCosts: '[data-testid="ect-settings-field-venue-fixed-costs"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text "SG&A %" field @keys ect sga-percent read-only */
  fldSgaPercent: '[data-testid="ect-settings-field-sga-percent"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Benefits Multiplier" field wrapper @keys ect benefits-multiplier */
  fldBenefitsMultiplier: '[data-testid="ect-settings-field-benefits-multiplier"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el input @text Benefits Multiplier editable @keys ect benefits-multiplier input decimal-to-percent */
  txtBenefitsMultiplier: '[data-testid="ect-settings-input-benefits-multiplier"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Other Rate" field @keys ect other-rate read-only */
  fldOtherRate: '[data-testid="ect-settings-field-other-rate"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text "No Labor Rate" field @keys ect no-labour-rate read-only */
  fldNoLabourRate: '[data-testid="ect-settings-field-no-labour-rate"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Approval Threshold" field @keys ect approval-threshold read-only */
  fldApprovalThreshold: '[data-testid="ect-settings-field-approval-threshold"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Historical Subrental %" field wrapper @keys ect historical-subrental */
  fldHistoricalSubrental: '[data-testid="ect-settings-field-historical-subrental"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el input @text Historical Subrental % editable @keys ect historical-subrental input decimal-to-percent */
  txtHistoricalSubrental: '[data-testid="ect-settings-input-historical-subrental"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Peak Labor Adjustment %" field @keys ect peak-labor read-only */
  fldPeakLaborAdjustment: '[data-testid="ect-settings-field-peak-labor-adjustment"]',
  /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Non-Peak Labor Adjustment %" field @keys ect non-peak-labor read-only */
  fldNonPeakLaborAdjustment: '[data-testid="ect-settings-field-non-peak-labor-adjustment"]',

  // ---- ECT: Labor Cost Assumptions ----
  /** @where Local Office Settings > ECT > Labor Costs @el div @text Save button wrapper for labor costs @keys ect save labor-costs */
  secSaveLaborCosts: '[data-testid="ect-settings-btn-save-labor-costs"]',
  /** @where Local Office Settings > ECT > Labor Costs @el button @text "Save" @keys ect save labor-costs button disabled-by-default */
  btnSaveLaborCosts: '[data-testid="ect-settings-btn-save-labor-costs-btn"]',
  /** @where Local Office Settings > ECT > Labor Costs @el div @text labor cost assumptions section @keys ect labor-cost section */
  secLaborCostAssumptions: '[data-testid="ect-settings-section-labor-cost-assumptions"]',
  /** @where Local Office Settings > ECT > Labor Costs @el h4 @text "Labor Cost Assumptions" @keys ect labor-cost title */
  lblLaborCostAssumptions: '[data-testid="ect-settings-section-title-labor-cost-assumptions"]',
  /** @where Local Office Settings > ECT > Labor Costs @el div @text labor cost table wrapper @keys ect labor-cost table editable */
  tblLaborCostAssumptions: '[data-testid="ect-settings-table-labor-cost-assumptions"]',

  // ---- ECT: SubRental Matrix ----
  /** @where Local Office Settings > ECT > SubRental @el div @text subrental matrix section @keys ect subrental-matrix section */
  secSubRentalMatrix: '[data-testid="ect-settings-section-sub-rental-matrix"]',
  /** @where Local Office Settings > ECT > SubRental @el h4 @text "SubRental Matrix" @keys ect subrental-matrix title */
  lblSubRentalMatrix: '[data-testid="ect-settings-section-title-sub-rental-matrix"]',
  /** @where Local Office Settings > ECT > SubRental @el div @text subrental matrix table wrapper @keys ect subrental-matrix table read-only */
  tblSubRentalMatrix: '[data-testid="ect-settings-table-sub-rental-matrix"]',

  // ---- Dialogs ----
  // NOTE: Local Office Settings uses the SHARED "Save Changes" dialog from shared.ts.
  //       Selectors: dlgSaveChanges, btnSaveChangesConfirm, btnSaveChangesCancel.
  //       The unsaved-changes dialog has custom Stay/Discard buttons (not shared OK/Cancel).
  /** @where Local Office Settings > Unsaved Dialog @el alertdialog @text "Any unsaved changes will be lost" @keys unsaved leave stay discard */
  dlgUnsavedLocalOffice: '[role="alertdialog"]:has-text("Any unsaved changes will be lost")',
  /** @where Local Office Settings > Unsaved Dialog @el button @text "Stay" @keys unsaved stay cancel keep */
  btnUnsavedStay: '[role="alertdialog"] button:has-text("Stay")',
  /** @where Local Office Settings > Unsaved Dialog @el button @text "Discard" @keys unsaved discard leave navigate */
  btnUnsavedDiscard: '[role="alertdialog"] button:has-text("Discard")',
} as const;
