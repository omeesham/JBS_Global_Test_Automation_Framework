/**
 * Setup Module -- Auto Add-On Tab Selectors.
 * Covers: tab navigation, tabpanel, form, checkbox items, save button, dialogs.
 * DOM notes (live-verified , location 1604 Parker Palm Springs):
 * - Shadow DOM ELIMINATED: `next-location-settings` custom element no longer exists.
 * All checkboxes are standard React/Radix UI components in the main DOM.
 * - Tabpanel: [data-testid="location-settings-sub-tab-content-auto-add-on"]
 * - Form: <form data-testid="location-settings-form-auto-add-on">
 * - Checkbox element: <button role="checkbox" data-slot="checkbox" data-testid="...">
 * - Each checkbox has a paired <input> (hidden) and <label for="..."> with display text.
 * - Checkbox testid pattern: location-settings-checkbox-auto-add-on-{isDefault}_{lowercase item name}
 * isDefault is "true" for Labor, "false" for all others.
 * - Item names in testid are LOWERCASE WITH SPACES (not kebab-case).
 * - 5 items for location 1604: Encore Music (checked), Wireless Presenter (checked),
 * Express Content Design Session (unchecked), Wordly (checked), Labor (checked).
 * - Items vary per location — count and labels are dynamic.
 * - Save button: shared left-panel [data-testid="location-settings-btn-save"].
 * - Save Changes dialog: [role="alertdialog"], buttons "Cancel" + "Ok" (NO data-testid).
 * - Unsaved Changes dialog: [role="alertdialog"] data-testid="location-settings-modal-unsaved-changes", buttons "Stay" + "Discard".
 * Triggered ONLY on full page navigation away, NOT on sub-tab switching.
 * - Sub-tab switch preserves pending changes silently (no dialog).
 * - API readiness: wait for chkAutoAddonEncoreMusic to appear before asserting states.
 * Behavior notes (live-verified ):
 * - Reverting a toggle to original state RE-DISABLES Save (smart form diff, not event-based).
 * - Sub-tab navigation does NOT trigger Unsaved Changes dialog.
 * - All selector counts confirmed unique via querySelectorAll on .
 */
export const SetupAutoAddonSelectors = {
  tabAutoAddon: '[data-testid="location-settings-sub-tab-auto-add-on"]',

  contentAutoAddon: '[data-testid="location-settings-sub-tab-content-auto-add-on"]',
  formAutoAddon: '[data-testid="location-settings-form-auto-add-on"]',

  chkAutoAddonEncoreMusic: '[data-testid="location-settings-checkbox-auto-add-on-false_encore music"]',
  chkAutoAddonWirelessPresenter: '[data-testid="location-settings-checkbox-auto-add-on-false_wireless presenter"]',
  chkAutoAddonExpressContentDesignSession: '[data-testid="location-settings-checkbox-auto-add-on-false_express content design session"]',
  chkAutoAddonWordly: '[data-testid="location-settings-checkbox-auto-add-on-false_wordly"]',
  chkAutoAddonLabor: '[data-testid="location-settings-checkbox-auto-add-on-true_labor"]',

  chkAutoAddonAll: '[data-testid^="location-settings-checkbox-auto-add-on-"]',

 // DEDUPLICATION (P0-DECONTAMINATION): btnSave REMOVED — canonical version in left-panel.ts.
 // Auto-addon page object uses SetupAutoAddonSelectors.btnSave directly (private saveButton getter).

 // DEDUPLICATION (P0-DECONTAMINATION): toastLocalInfoUpdated REMOVED — canonical version in local-info.ts.

 // DEDUPLICATION (P0-DECONTAMINATION): dlgSaveChanges, btnSaveChangesCancel REMOVED — canonical in shared.ts.
  btnSaveChangesOk: '[role="alertdialog"]:has(h2:text-is("Save Changes")) button:has-text("Ok")',

 /**
 * @where Setup > Location > Auto Add-On > Unsaved Changes dialog @el alertdialog @text "Unsaved changes" @keys unsaved changes dialog navigate away
 * NOTE: Auto Add-On uses Stay/Discard buttons (not OK/Cancel like shared.ts).
 * Prefixed to avoid collision with shared.ts dlgUnsavedChanges.
  * @verified 2026-07-10 — data-testid confirmed live on office 1604 via SPA navigation trigger.
  */
  autoAddonDlgUnsavedChanges: '[data-testid="location-settings-modal-unsaved-changes"]',
  btnUnsavedChangesStay: '[role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Stay")',
  btnUnsavedChangesDiscard: '[role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Discard")',
} as const;
