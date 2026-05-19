/**
 * Setup Module -- Local Information Tab Selectors.
 * Covers: spinbuttons, textboxes, checkboxes, radio groups, additional fields, validation errors.
 */
export const SetupLocalInfoSelectors = {
 // ---- Local Information Tab Save ----
 /** @where Setup > Location > Local Information tab @el button @text "Save" @keys save submit local-info form */
  btnSaveLocalInfo: '[data-testid="location-settings-btn-save"]',
 /** @where Setup > Location > Local Information tab @el notification toast @text "Local information updated" @keys save success toast notification */
  toastLocalInfoUpdated: 'li:has-text("Local information updated")',

 // ---- Spinbuttons ----
 /** @where Setup > Location > Local Information tab @el spinbutton @text "LDW Percentage" @keys ldw percentage default spin number */
  spinLDWPercentage: '[data-testid="location-settings-input-default-ldw-percentage"]',
 /** @where Setup > Location > Local Information tab @el spinbutton @text "Cables and Consumables Percentage" @keys cables consumables cc percentage spin */
  spinCCPercentage: '[data-testid="location-settings-input-cables-consumables-percentage"]',
 /** @where Setup > Location > Local Information tab @el spinbutton @text "ETS Percentage" @keys ets percentage spin number */
  spinETSPercentage: '[data-testid="location-settings-input-ets-percentage"]',
 /** @where Setup > Location > Local Information tab @el spinbutton @text "Resort Tax Percentage" @keys resort tax percentage spin */
  spinResortTaxPercentage: '[data-testid="location-settings-input-resort-tax-percent"]',
 /** @where Setup > Location > Local Information tab @el spinbutton @text "Set/Strike Labor Billing Goal" @keys set-strike labor billing goal spin */
  spinSetStrikeLaborBillingGoal: '[data-testid="location-settings-input-set-strike-labor-billing"]',
 /** @where Setup > Location > Local Information tab @el spinbutton @text "Threshold Amount" @keys threshold amount spin number */
  spinThreshold: '[data-testid="location-settings-input-threshold-amount"]',

 // ---- Textboxes ----
 /** @where Setup > Location > Local Information tab @el input @text "Oracle Product" @keys oracle product text */
  txtOracleProduct: '[data-testid="location-settings-input-oracle-product"]',
 /** @where Setup > Location > Local Information tab @el input @text "Oracle Department" @keys oracle department dept text */
  txtOracleDepartment: '[data-testid="location-settings-input-oracle-dept"]',

 // ---- Error Messages ----
 /** @where Setup > Location > Local Information tab @el label @text "Number must be" @keys validation error message boundary */
  errValidationMessage: 'p:has-text("Number must be")',
 /** @where Setup > Location > Local Information tab @el label @text "greater than or equal to 0" @keys validation error min boundary zero */
  errMinBoundary: 'p:has-text("Number must be greater than or equal to 0")',
 /** @where Setup > Location > Local Information tab @el label @text "less than or equal to 100" @keys validation error max boundary hundred */
  errMaxBoundary: 'p:has-text("Number must be less than or equal to 100")',

 // ---- Checkboxes (data-testid pattern) ----
 /** @where Setup > Location > Local Information tab @el checkbox @text "Apply LDW" @keys ldw apply loss-damage-waiver toggle */
  chkApplyLDW: '[data-testid="location-settings-checkbox-apply-ldw"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Calculate LDW on Net Amount" @keys ldw calculate net-amount toggle */
  chkCalculateLDWonNetAmount: '[data-testid="location-settings-checkbox-calc-ldw-on-net-amount"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Apply Cables and Consumables Fee" @keys cables consumables cc fee apply toggle */
  chkApplyCablesConsumablesFee: '[data-testid="location-settings-checkbox-apply-cables-consumables"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Calculate C&C on Net Amount" @keys cables consumables cc net-amount toggle */
  chkCalculateCConNetAmount: '[data-testid="location-settings-checkbox-calc-cac-on-net-amount"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Enable Multiday Pricing" @keys multiday pricing enable toggle */
  chkEnableMultidayPricing: '[data-testid="location-settings-checkbox-enable-multiday-pricing"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Allow ETS" @keys ets allow toggle */
  chkAllowETS: '[data-testid="location-settings-checkbox-allow-ets"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Service Charge" @keys service-charge fee toggle */
  chkServiceCharge: '[data-testid="location-settings-checkbox-allow-service-charge"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Show Service Charge As Administrative Fee" @keys service-charge administrative-fee display toggle */
  chkShowServiceChargeAsAdministrativeFee: '[data-testid="location-settings-checkbox-is-administrative-fee"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Calculate Service Charge On Net Amount" @keys service-charge calculate net-amount toggle */
  chkCalculateServiceChargeOnNetAmount: '[data-testid="location-settings-checkbox-calc-service-charge-on-net"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Allow Resort Tax" @keys resort-tax allow toggle */
  chkAllowResortTax: '[data-testid="location-settings-checkbox-allow-resort-tax"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Ticker Calc" @keys ticker calc calculation toggle */
  chkTickerCalc: '[data-testid="location-settings-checkbox-allow-tick-calc"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Enable Set/Strike Labor Minutes" @keys set-strike labor minutes enable toggle */
  chkEnableSetStrikeLaborMinutes: '[data-testid="location-settings-checkbox-enable-set-strike-minutes"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Apply Set/Strike Labor Minutes" @keys set-strike labor minutes apply toggle */
  chkApplySetStrikeLaborMinutes: '[data-testid="location-settings-checkbox-apply-set-strike-minutes"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Internet Asset Reservation" @keys internet asset reservation toggle */
  chkInternetAssetReservation: '[data-testid="location-settings-checkbox-allow-internet-asset-reservation"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Allow DPCD" @keys dpcd allow toggle */
  chkAllowDPCD: '[data-testid="location-settings-checkbox-allow-dpcd"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Exclude Implied Discount" @keys implied-discount exclude toggle */
  chkExcludeImpliedDiscount: '[data-testid="location-settings-checkbox-exclude-implied-discount"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Prompt for Approval" @keys approval prompt toggle */
  chkPromptForApproval: '[data-testid="location-settings-checkbox-prompt-for-approval"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Credit Memo Approval Required" @keys credit-memo approval required toggle */
  chkCreditMemoApprovalRequired: '[data-testid="location-settings-checkbox-credit-memo-approval"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Enable Discount Reason" @keys discount reason enable toggle */
  chkEnableDiscountReason: '[data-testid="location-settings-checkbox-check-discount"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Use eSignature" @keys esignature electronic signature toggle */
  chkUseESignature: '[data-testid="location-settings-checkbox-use-esign"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Enable Product Group" @keys product-group enable toggle */
  chkEnableProductGroup: '[data-testid="location-settings-checkbox-enable-product-group"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Allow Production Quote" @keys production quote allow toggle */
  chkAllowProductionQuote: '[data-testid="location-settings-checkbox-allow-production-quote"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Suppress Day/Rate Discount" @keys suppress day-rate discount toggle */
  chkSuppressDayRateDiscount: '[data-testid="location-settings-checkbox-suppress-discount"]',

 // ---- Radio Groups ----
 /** @where Setup > Location > Local Information tab @el radio @text "Master" @keys billing-type master radio first */
  rdoBillingTypeMaster: '[data-testid="location-settings-input-billing-type"] button[role="radio"][value="true"]',
 /** @where Setup > Location > Local Information tab @el radio @text "Direct" @keys billing-type direct radio second */
  rdoBillingTypeDirect: '[data-testid="location-settings-input-billing-type"] button[role="radio"][value="false"]',
 /** @where Setup > Location > Local Information tab @el radio @text "Event" @keys billing-way event radio first */
  rdoBillingWayEvent: '[data-testid="location-settings-input-billing-way"] button[role="radio"][value="true"]',
 /** @where Setup > Location > Local Information tab @el radio @text "Daily" @keys billing-way daily radio second */
  rdoBillingWayDaily: '[data-testid="location-settings-input-billing-way"] button[role="radio"][value="false"]',

 // ---- Additional Fields ----
 /** @where Setup > Location > Local Information tab @el datepicker @text "Effective Date" @keys effective-date calendar popover */
  btnEffectiveDate: '[data-testid="location-settings-btn-effective-date"]',
 /** @where Setup > Location > Local Information tab @el dropdown @text "Billing Cycle" @keys billing-cycle combobox */
  drpBillingCycle: '[data-testid="location-settings-select-billing-cycle"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Warehouse Billing" @keys warehouse billing toggle */
  chkWarehouseBilling: '[data-testid="location-settings-checkbox-warehouse-billing"]',
 /** @where Setup > Location > Local Information tab @el dropdown @text "Oracle Organization" @keys oracle organization combobox */
  drpOracleOrganization: '[data-testid="location-settings-select-oracle-org"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Compass Integration" @keys compass integration toggle */
  chkCompassIntegration: '[data-testid="location-settings-checkbox-compass-integration"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Company Remit Tax" @keys company remit tax toggle */
  chkCompanyRemitTax: '[data-testid="location-settings-checkbox-company-remit-tax"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Display Tax" @keys display tax toggle */
  chkDisplayTax: '[data-testid="location-settings-checkbox-display-tax"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Comm Receiver" @keys comm receiver commission toggle */
  chkCommReceiver: '[data-testid="location-settings-checkbox-comm-receiver"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Enable IDC Billing" @keys idc billing enable toggle */
  chkEnableIDCBilling: '[data-testid="location-settings-checkbox-enable-idc-billing"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Skip Billing" @keys skip billing toggle */
  chkSkipBilling: '[data-testid="location-settings-checkbox-skip-billing"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Separate Master Bill Commission Invoice" @keys master-bill commission invoice separate toggle */
  chkSeparateMasterBillCommissionInvoice: '[data-testid="location-settings-checkbox-separate-commission-invoice"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Show SubRental" @keys sub-rental show toggle */
  chkShowSubRental: '[data-testid="location-settings-checkbox-show-sub-rental"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Inventory Only" @keys inventory-only toggle */
  chkInventoryOnly: '[data-testid="location-settings-checkbox-inventory-only"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Intercompany" @keys intercompany toggle */
  chkIntercompany: '[data-testid="location-settings-checkbox-intercompany"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Calculate Commission Tax" @keys commission tax calculate toggle */
  chkCalculateCommissionTax: '[data-testid="location-settings-checkbox-calculate-commission-tax"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Can Create External Customer Link" @keys external customer link create toggle */
  chkCanCreateExternalCustomerLink: '[data-testid="location-settings-checkbox-can-create-external-link"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Offsite Event Location" @keys offsite event location toggle */
  chkOffsiteEventLocation: '[data-testid="location-settings-checkbox-offsite-event-location"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Exhibit Show Rate" @keys exhibit show rate toggle */
  chkExhibitShowRate: '[data-testid="location-settings-checkbox-exhibit-show-rate"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Enable Job Costing" @keys job-costing enable toggle */
  chkEnableJobCosting: '[data-testid="location-settings-checkbox-enable-job-costing"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Enable Discount Guidance" @keys discount guidance enable toggle */
  chkEnableDiscountGuidance: '[data-testid="location-settings-checkbox-discount-guidance"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "Enable Proposal" @keys proposal enable toggle */
  chkEnableProposal: '[data-testid="location-settings-checkbox-enable-proposal"]',
 /** @where Setup > Location > Local Information tab @el checkbox @text "HRI Remit Tax 2" @keys hri remit tax-2 toggle */
  chkHRIRemitTax2: 'dt:has-text("HRI Remit Tax 2") + dd button[role="checkbox"]',
} as const;
