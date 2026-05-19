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
 // ---- Legal Tab Navigation ----
 /** @where Setup > Location > Tabs @el tab @text "Legal" @keys tab legal navigate settings */
  tabLegal: '[data-testid="location-settings-sub-tab-legal"]',

 // ---- Legal Section Wrapper ----
 /** @where Setup > Location > Legal tab @el region @text "Legal content" @keys legal tab content panel wrapper */
  contentLegal: '[data-testid="location-settings-sub-tab-content-legal"]',

 // ---- Legal Table ----
 /** @where Setup > Location > Legal tab @el table @text "Legal grid" @keys legal table grid rows columns */
  tblLegal: '[data-testid="location-settings-table-legal"]',

 // ---- Column Headers ---- (added 2026-04-29)
 /** @where Setup > Location > Legal tab > Header @el label @text "Language Name" @keys column header language */
  colHeaderLanguageName: '[data-testid="location-settings-table-legal-col-language-name"]',
 /** @where Setup > Location > Legal tab > Header @el label @text "Service Charge Name" @keys column header service-charge */
  colHeaderServiceChargeName: '[data-testid="location-settings-table-legal-col-service-charge-name"]',
 /** @where Setup > Location > Legal tab > Header @el label @text "Terms and Conditions Name" @keys column header terms-and-conditions */
  colHeaderTermsAndConditionsName: '[data-testid="location-settings-table-legal-col-terms-and-conditions-name"]',

 // ---- Service Charge Combobox (Row 0) ----
 /** @where Setup > Location > Legal tab > Row 0 @el combobox @text "Service Charge Name" @keys service charge dropdown select legal row0 */
  drpLegalServiceCharge0: '[data-testid="location-settings-select-legal-0-service-charge"]',

 // ---- Terms and Conditions Combobox (Row 0) ----
 /** @where Setup > Location > Legal tab > Row 0 @el combobox @text "Terms and Conditions Name" @keys terms conditions dropdown select legal row0 */
  drpLegalTerms0: '[data-testid="location-settings-select-legal-0-terms"]',

 // ---- Left Panel Save Button (shared across tabs) ----
 // NOTE: Save dialog selectors (dlgSaveChanges, btnSaveChangesCancel, btnSaveChangesConfirm)
 // live in shared.ts -- reuse those keys, do NOT duplicate here.
 /** @where Setup > Location > Left Panel @el button @text "Save" @keys save submit form left-panel */
  btnSaveLegal: '[data-testid="location-settings-btn-save"]',
} as const;
