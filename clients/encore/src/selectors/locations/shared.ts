/**
 * Setup Module -- Shared Cross-Tab Dialog Selectors.
 * Covers: Error Dialog, Save Changes Dialog, Unsaved Changes Dialog.
 * Other tab-specific selectors (Legal, Account & Address, Notes, etc.) will be added
 * when those modules enter test generation.
 */
export const SetupSharedSelectors = {
 // ---- API Error Dialog ----
 // No container testid is rendered for the error dialog. Forcing several save-error and offline
 // paths fired the error (console-confirmed) but never rendered a dialog or any error/alert testid,
 // so these are a role+text fallback — revisit when the app exposes a testid or documents the trigger.
 /** @where Setup > Location > Error Dialog @el dialog @text "Error" @keys error alert dialog api popup */
  dlgErrorDialog: '[role="alertdialog"]:has-text("Error")',
 /** @where Setup > Location > Error Dialog @el label @text "Error Message" @keys error message body detail */
  dlgErrorMessage: '[role="alertdialog"]:has-text("Error") p',
 /** @where Setup > Location > Error Dialog @el button @text "Ok" @keys error ok dismiss close */
  btnErrorOk: '[role="alertdialog"]:has-text("Error") button:has-text("Ok")',

 // ---- Save Changes Dialog ----
 // No container testid is rendered (only Radix internals present); match by role+text.
 // Switch to a testid if the app adds one.
 /** @where Setup > Location > Save Changes Dialog @el dialog @text "Save Changes" @keys save confirm dialog alert */
  dlgSaveChanges: '[role="alertdialog"]:has-text("Save Changes")',
 /** @where Setup > Location > Save Changes Dialog @el button @text "Cancel" @keys save cancel abort dialog */
  btnSaveChangesCancel: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel")',
 /** @where Setup > Location > Save Changes Dialog @el button @text "Ok" @keys save confirm submit dialog */
  btnSaveChangesConfirm: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Ok")',

 // ---- Unsaved Changes Dialog ----
 // Verified PRESENT in live DOM (2026-04-29). Trigger path: dirty form on Local Information
 // sub-tab → click TOP-LEVEL tab (location-settings-tab-management-history). Sub-tab clicks do
 // NOT trigger this dialog. Inner button labels are "Discard" (leave/discard) and "Stay"
 // (cancel-leave), NOT "OK"/"Cancel". Inner buttons have NO testids (innerCount: 0).
 /** @where Setup > Location > Unsaved Changes Dialog @el dialog @text "Any unsaved changes will be lost" @keys unsaved discard popup warning navigate-away */
  dlgUnsavedChanges: '[data-testid="location-settings-modal-unsaved-changes"]',
 /** @where Setup > Location > Unsaved Changes Dialog @el button @text "Discard" @keys unsaved discard leave-confirm */
 // Button text is "Discard", NOT "OK". Key name kept for usage stability;
 // semantically this is the "leave / discard changes" affirmative-leave button.
  btnUnsavedChangesOk: '[data-testid="location-settings-modal-unsaved-changes"] button:has-text("Discard")',
 /** @where Setup > Location > Unsaved Changes Dialog @el button @text "Stay" @keys unsaved stay cancel-leave */
 // Button text is "Stay", NOT "Cancel". Key name kept for usage stability;
 // semantically this is the "stay / cancel-the-leave" button.
  btnUnsavedChangesCancel: '[data-testid="location-settings-modal-unsaved-changes"] button:has-text("Stay")',
} as const;
