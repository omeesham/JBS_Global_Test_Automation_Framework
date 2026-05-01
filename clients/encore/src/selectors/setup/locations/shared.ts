/**
 * Setup Module -- Shared Cross-Tab Dialog Selectors.
 * Covers: Error Dialog, Save Changes Dialog, Unsaved Changes Dialog.
 * Other tab-specific selectors (Legal, Account & Address, Notes, etc.) will be added
 * when those modules enter test generation.
 */
// VERIFICATION NOTE (OWNER 2026-04-29 evening live DOM walk):
// - location-settings-modal-account-list  ✓ PRESENT (engineer claim verified)
// - location-settings-modal-change-local-office  ✓ PRESENT (engineer claim verified)
// - location-settings-modal-unsaved-changes  ✓ PRESENT (engineer claim verified — fires on top-level
//   tab nav, NOT sub-tab; inner buttons are "Discard"/"Stay", NOT "OK"/"Cancel")
// - location-settings-modal-save-changes  ✗ MISSING (containerTestid: null in live DOM) — REVERTED below
// - location-settings-modal-select-customer-address (and 5 inner)  ✗ ALL 6 MISSING — REVERTED in account-address.ts
// - location-settings-modal-error  ✗ MISSING (UPDATED 2026-04-29 evening 2 — was NOT-VERIFIED;
//   forced 4 save-error paths via playwright-cli route + offline (HTTP 500/400/422 + 200/isSuccess=false +
//   network offline); console confirmed each error fired; in every case form stayed dirty and dialog
//   never rendered; 0 testids matching error/modal/alert/toast in DOM. Either trigger condition is
//   different or testid was claimed in error. Verdict upgraded NOT-VERIFIED → MISSING — REVERTED below.
// Evidence: reports/testid-verification/myown-dlg-{account-list,change-local-office,unsaved-changes,save-changes,customer-address,error}-2026-04-29.json
// Full report: reports/testid-verification/JIRA_VERIFICATION_2026-04-29.md
export const SetupSharedSelectors = {
 // ---- API Error Dialog ----
 // FIXME (OWNER 2026-04-29 evening 2): engineer claimed location-settings-modal-error in Jira reply.
 // 4 distinct save-error paths forced via playwright-cli route mocking on **/api/location/update-properties
 // (HTTP 500, HTTP 400, HTTP 422 with structured payload, HTTP 200 with isSuccess=false body) PLUS full
 // network-offline mode. In every case the error fired (browser console confirmed) but no dialog
 // rendered in DOM and no testid matching error/modal/alert/toast was present. Verdict upgraded from
 // NOT-VERIFIED to MISSING. Reverted to role+text-match. Re-migrate when engineer ships the testid OR
 // documents the trigger condition. Evidence: reports/testid-verification/myown-dlg-error-forced-2026-04-29.json.
 /** @where Setup > Location > Error Dialog @el dialog @text "Error" @keys error alert dialog api popup */
  dlgErrorDialog: '[role="alertdialog"]:has-text("Error")',
 /** @where Setup > Location > Error Dialog @el label @text "Error Message" @keys error message body detail */
  dlgErrorMessage: '[role="alertdialog"]:has-text("Error") p',
 /** @where Setup > Location > Error Dialog @el button @text "Ok" @keys error ok dismiss close */
  btnErrorOk: '[role="alertdialog"]:has-text("Error") button:has-text("Ok")',

 // ---- Save Changes Dialog ----
 // FIXME (OWNER 2026-04-29 evening): engineer claimed location-settings-modal-save-changes container,
 // but OWNER walk verified containerTestid: null (only Radix data-state/data-slot present in live DOM).
 // Evidence: reports/testid-verification/myown-dlg-save-changes-2026-04-29.json.
 // Reverted to role-based + text-match scope until engineer ships the container testid.
 /** @where Setup > Location > Save Changes Dialog @el dialog @text "Save Changes" @keys save confirm dialog alert */
  dlgSaveChanges: '[role="alertdialog"]:has-text("Save Changes")',
 /** @where Setup > Location > Save Changes Dialog @el button @text "Cancel" @keys save cancel abort dialog */
  btnSaveChangesCancel: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel")',
 /** @where Setup > Location > Save Changes Dialog @el button @text "Ok" @keys save confirm submit dialog */
  btnSaveChangesConfirm: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Ok")',

 // ---- Unsaved Changes Dialog ----
 // VERIFIED (OWNER 2026-04-29 evening): engineer claim location-settings-modal-unsaved-changes is
 // PRESENT in live DOM. Trigger path: dirty form on Local Information sub-tab → click TOP-LEVEL tab
 // (location-settings-tab-management-history). Sub-tab clicks do NOT trigger this dialog.
 // Evidence: reports/testid-verification/myown-dlg-unsaved-changes-2026-04-29.json.
 // CORRECTION: inner button labels are "Discard" (leave/discard) and "Stay" (cancel-leave), NOT
 // "OK" / "Cancel". Inner buttons have NO testids (innerCount: 0).
 /** @where Setup > Location > Unsaved Changes Dialog @el dialog @text "Any unsaved changes will be lost" @keys unsaved discard popup warning navigate-away */
  dlgUnsavedChanges: '[data-testid="location-settings-modal-unsaved-changes"]',
 /** @where Setup > Location > Unsaved Changes Dialog @el button @text "Discard" @keys unsaved discard leave-confirm */
 // FIX (OWNER 2026-04-29 evening): button text is "Discard", NOT "OK". Key name kept for usage stability;
 // semantically this is the "leave / discard changes" affirmative-leave button.
  btnUnsavedChangesOk: '[data-testid="location-settings-modal-unsaved-changes"] button:has-text("Discard")',
 /** @where Setup > Location > Unsaved Changes Dialog @el button @text "Stay" @keys unsaved stay cancel-leave */
 // FIX (OWNER 2026-04-29 evening): button text is "Stay", NOT "Cancel". Key name kept for usage stability;
 // semantically this is the "stay / cancel-the-leave" button.
  btnUnsavedChangesCancel: '[data-testid="location-settings-modal-unsaved-changes"] button:has-text("Stay")',
} as const;
