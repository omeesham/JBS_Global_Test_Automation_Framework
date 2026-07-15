/**
 * Setup Module -- Legal Tab Selectors.
 * Covers: Legal table, Service Charge combobox, Terms and Conditions combobox, save dialog.
 * DOM notes (live-verified ):
 * - Legal tab content: [data-testid="location-settings-sub-tab-content-legal"].
 * - Table: <table data-testid="location-settings-table-legal" data-slot="table">.
 * - Table has <thead> with 3 column headers and <tbody> with data rows.
 * - Service Charge combobox: <button role="combobox" data-testid="location-settings-select-legal-{i}-service-charge">.
 * - Terms combobox: <button role="combobox" data-testid="location-settings-select-legal-{i}-terms">.
 * - Dropdown: Radix UI Select — opens a [role="listbox"] with [role="option"] children. NO search/filter input.
 * - NO dedicated Legal Save button — uses shared left-panel Save [data-testid="location-settings-btn-save"].
 * - Save dialog: [role="alertdialog"] — heading "Save Changes", body "Are you sure you want to save the changes?",
 * buttons Cancel + Ok. NO data-testid on dialog or its children.
 * - Location 1604: 1 row (US English), SC = "Resort Service Charge" (114 options), T&C = "LDW" (50 options).
 * - All selector counts confirmed unique via querySelectorAll on .
 */
export const SetupLegalSelectors = {
  tabLegal: '[data-testid="location-settings-sub-tab-legal"]',

  contentLegal: '[data-testid="location-settings-sub-tab-content-legal"]',

  tblLegal: '[data-testid="location-settings-table-legal"]',

  colHeaderLanguageName: '[data-testid="location-settings-table-legal-col-language-name"]',
  colHeaderServiceChargeName: '[data-testid="location-settings-table-legal-col-service-charge-name"]',
  colHeaderTermsAndConditionsName: '[data-testid="location-settings-table-legal-col-terms-and-conditions-name"]',

  drpLegalServiceCharge0: '[data-testid="location-settings-select-legal-0-service-charge"]',

  drpLegalTerms0: '[data-testid="location-settings-select-legal-0-terms"]',

 // NOTE: Save dialog selectors (dlgSaveChanges, btnSaveChangesCancel, btnSaveChangesConfirm)
 // live in shared.ts -- reuse those keys, do NOT duplicate here.
  btnSaveLegal: '[data-testid="location-settings-btn-save"]',
} as const;
