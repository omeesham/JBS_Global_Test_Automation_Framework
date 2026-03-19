/**
 * Setup Module -- Legal Tab Selectors.
 * Covers: Legal table, Service Charge combobox, Terms and Conditions combobox, save dialog.
 *
 * DOM notes (live-verified 2026-03-18):
 * - Legal tab content: [data-testid="location-settings-sub-tab-content-legal"].
 * - Table: <table data-testid="location-settings-table-legal" data-slot="table">.
 * - Table has <thead> with 3 column headers and <tbody> with data rows.
 * - Service Charge combobox: <button role="combobox" data-testid="location-settings-select-legal-{i}-service-charge">.
 * - Terms combobox: <button role="combobox" data-testid="location-settings-select-legal-{i}-terms">.
 * - Dropdown: Radix UI Select — opens a [role="listbox"] with [role="option"] children. NO search/filter input.
 * - NO dedicated Legal Save button — uses shared left-panel Save [data-testid="location-settings-btn-save"].
 * - Save dialog: [role="alertdialog"] — heading "Save Changes", body "Are you sure you want to save the changes?",
 *   buttons Cancel + Save. NO data-testid on dialog or its children.
 * - Location 1604: 1 row (US English), SC = "Resort Service Charge" (114 options), T&C = "LDW" (50 options).
 * - All selector counts confirmed unique via querySelectorAll on 2026-03-18.
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
