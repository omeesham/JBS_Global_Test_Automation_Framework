/**
 * Setup Module -- Auto Add-On Tab Selectors.
 * Covers: tab navigation, tabpanel, form, checkbox items, save button, dialogs.
 *
 * DOM notes (live-verified 2026-03-23, location 1604 Parker Palm Springs):
 * - Shadow DOM ELIMINATED: `next-location-settings` custom element no longer exists.
 *   All checkboxes are standard React/Radix UI components in the main DOM.
 * - Tabpanel: [data-testid="location-settings-sub-tab-content-auto-add-on"]
 * - Form: <form data-testid="location-settings-form-auto-add-on">
 * - Checkbox element: <button role="checkbox" data-slot="checkbox" data-testid="...">
 * - Each checkbox has a paired <input> (hidden) and <label for="..."> with display text.
 * - Checkbox testid pattern: location-settings-checkbox-auto-add-on-{isDefault}_{lowercase item name}
 *   isDefault is "true" for Labor, "false" for all others.
 * - Item names in testid are LOWERCASE WITH SPACES (not kebab-case).
 * - 5 items for location 1604: Encore Music (checked), Wireless Presenter (checked),
 *   Express Content Design Session (unchecked), Wordly (checked), Labor (checked).
 * - Items vary per location — count and labels are dynamic.
 * - Save button: shared left-panel [data-testid="location-settings-btn-save"].
 * - Save Changes dialog: [role="alertdialog"], buttons "Cancel" + "Ok" (NO data-testid).
 * - Unsaved Changes dialog: [role="alertdialog"], buttons "Stay" + "Discard" (NO data-testid).
 *   Triggered ONLY on full page navigation away, NOT on sub-tab switching.
 * - Sub-tab switch preserves pending changes silently (no dialog).
 * - API readiness: wait for chkAutoAddonEncoreMusic to appear before asserting states.
 *
 * Behavior notes (live-verified 2026-03-23):
 * - Reverting a toggle to original state RE-DISABLES Save (smart form diff, not event-based).
 * - Sub-tab navigation does NOT trigger Unsaved Changes dialog.
 * - All selector counts confirmed unique via querySelectorAll on 2026-03-23.
 */
export const SetupAutoAddonSelectors = {
  // ---- Tab Navigation ----
  /** @where Setup > Location > Right Panel tabs @el tab @text "Auto Add-On" @keys auto addon tab navigate settings */
  tabAutoAddon: '[data-testid="location-settings-sub-tab-auto-add-on"]',

  // ---- Tabpanel & Form Wrappers ----
  /** @where Setup > Location > Auto Add-On tab @el tabpanel @text "Auto Add-On" @keys auto addon content panel wrapper */
  contentAutoAddon: '[data-testid="location-settings-sub-tab-content-auto-add-on"]',
  /** @where Setup > Location > Auto Add-On tab @el form @text "auto-add-on form" @keys auto addon form container */
  formAutoAddon: '[data-testid="location-settings-form-auto-add-on"]',

  // ---- Checkbox Items (location 1604 — items are location-specific) ----
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "Encore Music" @keys encore music checkbox add-on */
  chkAutoAddonEncoreMusic: '[data-testid="location-settings-checkbox-auto-add-on-false_encore music"]',
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "Wireless Presenter" @keys wireless presenter checkbox add-on */
  chkAutoAddonWirelessPresenter: '[data-testid="location-settings-checkbox-auto-add-on-false_wireless presenter"]',
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "Express Content Design Session" @keys express content design session checkbox add-on */
  chkAutoAddonExpressContentDesignSession: '[data-testid="location-settings-checkbox-auto-add-on-false_express content design session"]',
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "Wordly" @keys wordly checkbox add-on */
  chkAutoAddonWordly: '[data-testid="location-settings-checkbox-auto-add-on-false_wordly"]',
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "Labor" @keys labor checkbox add-on default */
  chkAutoAddonLabor: '[data-testid="location-settings-checkbox-auto-add-on-true_labor"]',

  // ---- All Checkboxes (dynamic count) ----
  /**
   * @where Setup > Location > Auto Add-On tab @el checkbox list @text "all add-on checkboxes" @keys all auto addon checkboxes list
   * NOTE: Use this with .all() or nth() to iterate when item count is unknown.
   */
  chkAutoAddonAll: '[data-testid^="location-settings-checkbox-auto-add-on-"]',

  // ---- Left Panel Save Button (shared across all tabs) ----
  /** @where Setup > Location > Left Panel @el button @text "Save" @keys save submit form left-panel */
  btnSave: '[data-testid="location-settings-btn-save"]',

  // ---- Toast Notification ----
  /** @where Setup > Location > Toast @el notification @text "Local information updated" @keys save success toast notification */
  toastLocalInfoUpdated: 'li:has-text("Local information updated")',

  // ---- Save Changes Dialog (alertdialog on Save click) ----
  /** @where Setup > Location > Save Changes dialog @el alertdialog @text "Save Changes" @keys save changes dialog confirm */
  dlgSaveChanges: '[role="alertdialog"]:has(h2:text-is("Save Changes"))',
  /** @where Setup > Location > Save Changes dialog @el button @text "Ok" @keys dialog ok confirm save changes */
  btnSaveChangesOk: '[role="alertdialog"]:has(h2:text-is("Save Changes")) button:has-text("Ok")',
  /** @where Setup > Location > Save Changes dialog @el button @text "Cancel" @keys dialog cancel dismiss save */
  btnSaveChangesCancel: '[role="alertdialog"]:has(h2:text-is("Save Changes")) button:has-text("Cancel")',

  // ---- Unsaved Changes Dialog (alertdialog on page navigation away) ----
  /**
   * @where Setup > Location > Unsaved Changes dialog @el alertdialog @text "Unsaved changes" @keys unsaved changes dialog navigate away
   * NOTE: Triggered on sidebar/page navigation ONLY. Sub-tab switching does NOT trigger this.
   */
  dlgUnsavedChanges: '[role="alertdialog"]:has(h2:text-is("Unsaved changes"))',
  /** @where Setup > Location > Unsaved Changes dialog @el button @text "Stay" @keys dialog stay remain on page */
  btnUnsavedChangesStay: '[role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Stay")',
  /** @where Setup > Location > Unsaved Changes dialog @el button @text "Discard" @keys dialog discard abandon changes leave */
  btnUnsavedChangesDiscard: '[role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Discard")',
} as const;
