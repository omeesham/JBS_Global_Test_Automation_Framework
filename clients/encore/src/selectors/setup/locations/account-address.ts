/**
 * Setup Module -- Account and Address Tab Selectors.
 * Covers: Venue/Branch Account card, Master Bill To Address card,
 * Account List dialog, Select Customer Address dialog, phone fields.
 * DOM notes (planner-verified ):
 * - All location detail content renders inside <next-location-settings> shadow root.
 * Playwright pierces shadow DOM for all locators.
 * - Name/Address labels are <dt> elements containing clickable <button>.
 * - Address display fields (City, State, Zip, Country) are <dd> static text.
 * - Phone fields: input[name="accountAndAddress.contactPhone1|2"].
 * - Dialogs: Radix UI [role="dialog"].
 * - Row checkboxes: button[role="checkbox"] (Radix UI pattern).
 * - Left-panel Save (shared btnSave in left-panel.ts) used for this tab.
 */
export const SetupAccountAddressSelectors = {
 // ---- Tab Navigation ----
 /** @where Setup > Location > Tabs @el tab @text "Account and Address" @keys tab account-address navigate */
  tabAccountAndAddress: '[data-testid="location-settings-sub-tab-account-and-address"]',
 /** @where Setup > Location > Account and Address @el tabpanel @text "Account and Address content" @keys tabpanel content container */
  pnlAccountAndAddress: '[data-testid="location-settings-sub-tab-content-account-and-address"]',

 // ---- Venue/Branch Account Card ----
 /** @where Setup > Location > Account and Address > Venue @el button @text "Name" @keys venue name open account-list dialog */
  btnAccName: '[data-testid="location-settings-btn-lookup-venue"]',
 /** @where Setup > Location > Account and Address > Venue @el input @text "Venue Name" @keys venue name disabled read-only */
  txtAccVenueName: '[data-testid="location-settings-input-venue-name"]',
 /** @where Setup > Location > Account and Address > Venue @el button @text "Address" @keys venue address open select-address dialog first */
  btnAccVenueAddress: '[data-testid="location-settings-btn-venue-address"]',
 /** @where Setup > Location > Account and Address > Venue @el input @text "Phone 1" @keys phone1 contact required editable */
  txtAccPhone1: '[data-testid="location-settings-input-contact-phone-1"]',
 /** @where Setup > Location > Account and Address > Venue @el input @text "Phone 2" @keys phone2 contact optional editable @verified */
  txtAccPhone2: '[data-testid="location-settings-input-contact-phone-2"]',

 // ---- Save Button (left-panel, same as other tabs) ----
 /** @where Setup > Location > Account and Address @el button @text "Save" @keys save submit left-panel */
  btnSaveAccountAddress: '[data-testid="location-settings-btn-save"]',

 // ---- Master Bill To Address Card ----
 /** @where Setup > Location > Account and Address > Master @el button @text "Address" @keys master address open select-address dialog second */
  btnAccMasterAddress: '[data-testid="location-settings-btn-master-address"]',

 // ---- Account List Dialog ----
 /** @where Setup > Location > Account List Dialog @el dialog @text "Account List" @keys account list search dialog modal */
  dlgAccountList: '[data-testid="location-settings-modal-account-list"]',
 /** @where Setup > Location > Account List Dialog @el input @text "Account Number" @keys filter account-number search @verified */
  txtAccListAccountNumber: '[data-testid="location-settings-input-account-number"]',
 /** @where Setup > Location > Account List Dialog @el input @text "Account Name" @keys filter account-name search @verified */
  txtAccListAccountName: '[data-testid="location-settings-input-account-name"]',
 /** @where Setup > Location > Account List Dialog @el input @text "Address" @keys filter address search @verified */
  txtAccListAddress: '[data-testid="location-settings-input-account-address"]',
 /** @where Setup > Location > Account List Dialog @el input @text "City" @keys filter city search @verified */
  txtAccListCity: '[data-testid="location-settings-input-account-city"]',
 /** @where Setup > Location > Account List Dialog @el combobox @text "State" @keys filter state dropdown @verified */
  drpAccListState: '[data-testid="location-settings-select-account-state"]',
 /** @where Setup > Location > Account List Dialog @el combobox @text "Country" @keys filter country dropdown @verified */
  drpAccListCountry: '[data-testid="location-settings-select-account-country"]',
 /** @where Setup > Location > Account List Dialog @el button @text "Search" @keys search submit filter @verified */
  btnAccListSearch: '[data-testid="location-settings-btn-search-account"]',
 /** @where Setup > Location > Account List Dialog @el button @text "Reset" @keys reset clear filters @verified */
  btnAccListReset: '[data-testid="location-settings-btn-reset-account-search"]',
 /** @where Setup > Location > Account List Dialog @el button @text "Select" @keys select confirm row choose */
  btnAccListSelect: '[data-testid="location-settings-btn-select-account"]',
 /** @where Setup > Location > Account List Dialog @el button @text "Cancel" @keys cancel close dismiss @verified */
  btnAccListCancel: '[data-testid="location-settings-btn-cancel-account-search"]',
 /** @where Setup > Location > Account List Dialog @el button @text "Close" @keys close x dismiss dialog */
 // PARTIAL FIX (2026-04-29): engineer added modal container testid; inner Close btn still text-scoped — defensively scoped inside container.
  btnAccListClose: '[data-testid="location-settings-modal-account-list"] button:has-text("Close")',
 /** @where Setup > Location > Account List Dialog @el checkbox @text "Row Select" @keys row selection checkbox first */
  chkAccListRowSelect: '[data-testid="location-settings-modal-account-list"] tbody tr:first-child td:first-child button[role="checkbox"]',
 /** @where Setup > Location > Account List Dialog @el table @text "Results" @keys results grid table rows */
  tblAccListResults: '[data-testid="location-settings-modal-account-list"] table',

 // ---- Select Customer Address Dialog ----
 // FIXME (OWNER 2026-04-29 evening): engineer claimed 6 testids for this dialog in Jira reply, but
 // OWNER live-DOM walk verified ALL 6 are MISSING (containerHasTestid: false, innerTestids: [], only
 // Radix internals data-state/data-slot present). Evidence: reports/testid-verification/myown-dlg-customer-address-2026-04-29.json.
 // Reverted to role-based + text-match scope until engineer ships the testids.
 /** @where Setup > Location > Select Customer Address Dialog @el dialog @text "Select Customer Address" @keys address select dialog modal */
  dlgSelectAddress: '[role="dialog"]:has-text("Select Customer Address")',
 /** @where Setup > Location > Select Customer Address Dialog @el input @text "Search..." @keys search filter address client-side */
  txtAddrSearch: '[role="dialog"]:has-text("Select Customer Address") input[placeholder="Search..."]',
 /** @where Setup > Location > Select Customer Address Dialog @el button @text "Select" @keys select confirm address choose */
  btnAddrSelect: '[role="dialog"]:has-text("Select Customer Address") button:has-text("Select")',
 /** @where Setup > Location > Select Customer Address Dialog @el button @text "Cancel" @keys cancel close dismiss */
  btnAddrCancel: '[role="dialog"]:has-text("Select Customer Address") button:has-text("Cancel")',
 /** @where Setup > Location > Select Customer Address Dialog @el button @text "Save" @keys save disabled always */
  btnAddrSave: '[role="dialog"]:has-text("Select Customer Address") button:has-text("Save")',
 /** @where Setup > Location > Select Customer Address Dialog @el button @text "Close" @keys close x dismiss dialog */
  btnAddrClose: '[role="dialog"]:has-text("Select Customer Address") button:has-text("Close")',
 /** @where Setup > Location > Select Customer Address Dialog @el checkbox @text "Row Select" @keys row selection checkbox first */
  chkAddrRow: '[role="dialog"]:has-text("Select Customer Address") tbody tr:first-child td:first-child button[role="checkbox"]',
 /** @where Setup > Location > Select Customer Address Dialog @el table @text "Results" @keys address grid table rows */
  tblAddrResults: '[role="dialog"]:has-text("Select Customer Address") table',
 /** @where Setup > Location > Select Customer Address Dialog @el generic @text "Total Addresses:" @keys footer count total */
  lblAddrTotal: '[role="dialog"]:has-text("Select Customer Address") :text("Total Addresses")',

 // ---- Save Changes Dialog (message text -- supplements shared.ts) ----
 /** @where Setup > Location > Save Changes Dialog @el paragraph @text "Are you sure" @keys save confirmation message text */
 // FIXME (OWNER 2026-04-29 evening): engineer claimed location-settings-modal-save-changes container,
 // but OWNER walk verified containerTestid: null (only Radix data-state/data-slot present).
 // Evidence: reports/testid-verification/myown-dlg-save-changes-2026-04-29.json.
 // Reverted to role-based scope until engineer ships the container testid.
  txtSaveChangesMessage: '[role="alertdialog"]:has-text("Save Changes") p',
} as const;
