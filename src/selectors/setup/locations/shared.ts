/**
 * Setup Module -- Shared Cross-Tab Dialog Selectors.
 * Covers: Error Dialog, Save Changes Dialog, Unsaved Changes Dialog.
 * Other tab-specific selectors (Legal, Account & Address, Notes, etc.) will be added
 * when those modules enter test generation.
 */
export const SetupSharedSelectors = {
  // ---- API Error Dialog ----
  /** @where Setup > Location > Error Dialog @el dialog @text "Error" @keys error alert dialog api popup */
  dlgErrorDialog: '[role="alertdialog"]:has(h2:has-text("Error"))',
  /** @where Setup > Location > Error Dialog @el label @text "Error Message" @keys error message body detail */
  dlgErrorMessage: '[role="alertdialog"] p',
  /** @where Setup > Location > Error Dialog @el button @text "Ok" @keys error ok dismiss close */
  btnErrorOk: '[role="alertdialog"] button:has-text("Ok")',

  // ---- Save Changes Dialog ----
  /** @where Setup > Location > Save Changes Dialog @el dialog @text "Save Changes" @keys save confirm dialog alert */
  dlgSaveChanges: '[role="alertdialog"]:has-text("Save Changes")',
  /** @where Setup > Location > Save Changes Dialog @el button @text "Cancel" @keys save cancel abort dialog */
  btnSaveChangesCancel: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel")',
  /** @where Setup > Location > Save Changes Dialog @el button @text "Ok" @keys save confirm submit dialog */
  btnSaveChangesConfirm: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Ok")',

  // ---- Unsaved Changes Dialog ----
  /** @where Setup > Location > Unsaved Changes Dialog @el dialog @text "Any unsaved changes will be lost" @keys unsaved discard popup warning navigate-away */
  dlgUnsavedChanges: '[role="alertdialog"]:has-text("Any unsaved changes will be lost")',
  /** @where Setup > Location > Unsaved Changes Dialog @el button @text "OK" @keys unsaved ok discard confirm */
  btnUnsavedChangesOk: '[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("OK")',
  /** @where Setup > Location > Unsaved Changes Dialog @el button @text "Cancel" @keys unsaved cancel stay abort */
  btnUnsavedChangesCancel: '[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("Cancel")',
} as const;
