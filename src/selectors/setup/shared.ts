/**
 * Setup Module -- Shared Cross-Tab Selectors.
 * Covers: Legal, Account & Address, Notes, Shared Setup Locations,
 * Management History, Auto Add-On tabs, and shared dialogs (Error, Save Changes, Unsaved Changes).
 */
export const SetupSharedSelectors = {
  // ---- API Error Dialog ----
  /** @where Setup > Location > Error Dialog @el dialog @text "Error" @keys error alert dialog api popup */
  dlgErrorDialog: '[role="alertdialog"]:has(h2:has-text("Error"))',
  /** @where Setup > Location > Error Dialog @el label @text "Error" @keys error title heading */
  dlgErrorTitle: '[role="alertdialog"] h2:has-text("Error")',
  /** @where Setup > Location > Error Dialog @el label @text "Error Message" @keys error message body detail */
  dlgErrorMessage: '[role="alertdialog"] p',
  /** @where Setup > Location > Error Dialog @el button @text "Ok" @keys error ok dismiss close */
  btnErrorOk: '[role="alertdialog"] button:has-text("Ok")',

  // ---- Save Changes Dialog ----
  /** @where Setup > Location > Save Changes Dialog @el dialog @text "Save Changes" @keys save confirm dialog alert */
  dlgSaveChanges: '[role="alertdialog"]:has-text("Save Changes")',
  /** @where Setup > Location > Save Changes Dialog @el label @text "Are you sure" @keys save confirm message prompt */
  txtSaveChangesMessage: '[role="alertdialog"] p:has-text("Are you sure")',
  /** @where Setup > Location > Save Changes Dialog @el button @text "Cancel" @keys save cancel abort dialog */
  btnSaveChangesCancel: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel")',
  /** @where Setup > Location > Save Changes Dialog @el button @text "Save" @keys save confirm submit dialog */
  btnSaveChangesConfirm: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Save")',

  // ---- Unsaved Changes Dialog ----
  /** @where Setup > Location > Unsaved Changes Dialog @el dialog @text "Any unsaved changes will be lost" @keys unsaved discard popup warning navigate-away */
  dlgUnsavedChanges: '[role="alertdialog"]:has-text("Any unsaved changes will be lost")',
  /** @where Setup > Location > Unsaved Changes Dialog @el button @text "OK" @keys unsaved ok discard confirm */
  btnUnsavedChangesOk: '[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("OK")',
  /** @where Setup > Location > Unsaved Changes Dialog @el button @text "Cancel" @keys unsaved cancel stay abort */
  btnUnsavedChangesCancel: '[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("Cancel")',

  // ---- Legal Tab Fields ----
  /** @where Setup > Location > Legal tab @el button @text "Save" @keys save submit legal form */
  btnSaveLegal: 'tabpanel:has([role="columnheader"]:has-text("Language Name")) button:has-text("Save")',
  /** @where Setup > Location > Legal tab @el table @text "Legal Grid" @keys legal grid table language service-charge terms */
  tblLegalGrid: 'tabpanel:has([role="columnheader"]:has-text("Language Name")) table',
  /** @where Setup > Location > Legal tab > Header @el label @text "Language Name" @keys column header language */
  colHeaderLanguageName: '[role="columnheader"]:has-text("Language Name")',
  /** @where Setup > Location > Legal tab > Header @el label @text "Service Charge Name" @keys column header service-charge */
  colHeaderServiceChargeName: '[role="columnheader"]:has-text("Service Charge Name")',
  /** @where Setup > Location > Legal tab > Header @el label @text "Terms and Conditions Name" @keys column header terms-conditions */
  colHeaderTermsAndConditionsName: '[role="columnheader"]:has-text("Terms and Conditions Name")',
  /** @where Setup > Location > Legal tab > US English row @el cell @text "US English" @keys language us-english first-row cell */
  cellLangNameUsEnglish: 'tr:has([role="cell"]:has-text("US English")) [role="cell"]:first-child',
  /** @where Setup > Location > Legal tab > US English row @el dropdown @text "Service Charge Name" @keys service-charge combobox us-english */
  drpServiceChargeName: 'tr:has([role="cell"]:has-text("US English")) td:nth-child(2) [role="combobox"]',
  /** @where Setup > Location > Legal tab > US English row @el dropdown @text "Terms and Conditions Name" @keys terms-conditions combobox us-english */
  drpTermsAndConditionsName: 'tr:has([role="cell"]:has-text("US English")) td:nth-child(3) [role="combobox"]',
  /** @where Setup > Location > Legal tab @el label @text "Validation Error" @keys validation error exclamation invalid legal cell */
  errLegalCellValidation: 'tabpanel:has([role="columnheader"]:has-text("Language Name")) [role="cell"] img[src*="exclamation"], tabpanel:has([role="columnheader"]:has-text("Language Name")) [role="cell"] [aria-invalid="true"]',

  // ---- Account and Address Tab Fields ----
  /** @where Setup > Location > Account and Address tab > Venue @el button @text "Name" @keys account name venue-branch lookup */
  btnAccName: 'tabpanel:has-text("Venue/Branch Account") term button:has-text("Name")',
  /** @where Setup > Location > Account and Address tab > Venue @el button @text "Address" @keys account address venue-branch lookup */
  btnAccVenueAddress: 'tabpanel:has-text("Venue/Branch Account") term button:has-text("Address")',
  /** @where Setup > Location > Account and Address tab > Master @el button @text "Address" @keys master-bill address lookup */
  btnAccMasterAddress: 'tabpanel:has-text("Master Bill To Address") term button:has-text("Address")',
  /** @where Setup > Location > Account and Address tab @el input @text "Venue Name" @keys venue name text editable */
  txtAccVenueName: 'input[name="accountAndAddress.venueName"]',
  /** @where Setup > Location > Account and Address tab @el input @text "Phone 1" @keys phone contact primary */
  txtAccPhone1: 'input[name="accountAndAddress.contactPhone1"]',
  /** @where Setup > Location > Account and Address tab @el input @text "Phone 2" @keys phone contact secondary */
  txtAccPhone2: 'input[name="accountAndAddress.contactPhone2"]',
  /** @where Setup > Location > Account and Address tab @el label @text "Phone 1 Required" @keys phone required validation error */
  errAccPhone1Required: 'input[name="accountAndAddress.contactPhone1"] ~ p',

  // ---- Account List Dialog ----
  /** @where Setup > Location > Account List Dialog @el dialog @text "Account List" @keys account list dialog search popup */
  dlgAccountList: '[role="dialog"]:has(h2:has-text("Account List"))',
  /** @where Setup > Location > Account List Dialog @el input @text "Account Number" @keys account number search filter */
  txtAccListAccountNumber: '[role="dialog"]:has(h2:has-text("Account List")) input[placeholder="Account Number"]',
  /** @where Setup > Location > Account List Dialog @el input @text "Account Name" @keys account name search filter */
  txtAccListAccountName: '[role="dialog"]:has(h2:has-text("Account List")) input[placeholder="Account Name"]',
  /** @where Setup > Location > Account List Dialog @el input @text "Address" @keys address search filter */
  txtAccListAddress: '[role="dialog"]:has(h2:has-text("Account List")) input[placeholder="Address"]',
  /** @where Setup > Location > Account List Dialog @el input @text "City" @keys city search filter */
  txtAccListCity: '[role="dialog"]:has(h2:has-text("Account List")) input[placeholder="City"]',
  /** @where Setup > Location > Account List Dialog @el dropdown @text "State" @keys state combobox filter */
  drpAccListState: '[role="dialog"]:has(h2:has-text("Account List")) dt:has-text("State") + dd [role="combobox"]',
  /** @where Setup > Location > Account List Dialog @el dropdown @text "Country" @keys country combobox filter */
  drpAccListCountry: '[role="dialog"]:has(h2:has-text("Account List")) dt:has-text("Country") + dd [role="combobox"]',
  /** @where Setup > Location > Account List Dialog @el button @text "Search" @keys search submit find account */
  btnAccListSearch: '[role="dialog"]:has(h2:has-text("Account List")) button:has-text("Search")',
  /** @where Setup > Location > Account List Dialog @el button @text "Reset" @keys reset clear filter account */
  btnAccListReset: '[role="dialog"]:has(h2:has-text("Account List")) button:has-text("Reset")',
  /** @where Setup > Location > Account List Dialog @el button @text "Select" @keys select confirm choose account */
  btnAccListSelect: '[role="dialog"]:has(h2:has-text("Account List")) button:has-text("Select")',
  /** @where Setup > Location > Account List Dialog @el button @text "Cancel" @keys cancel abort dialog account */
  btnAccListCancel: '[role="dialog"]:has(h2:has-text("Account List")) button:has-text("Cancel")',
  /** @where Setup > Location > Account List Dialog @el button @text "Close" @keys close dismiss dialog account */
  btnAccListClose: '[role="dialog"]:has(h2:has-text("Account List")) button:has-text("Close")',
  /** @where Setup > Location > Account List Dialog @el checkbox @text "Select Row" @keys row select checkbox first account */
  chkAccListRowSelect: '[role="dialog"]:has(h2:has-text("Account List")) tbody tr:first-child td:first-child button[role="checkbox"]',
  /** @where Setup > Location > Account List Dialog @el table @text "Results" @keys results grid table account */
  tblAccListResults: '[role="dialog"]:has(h2:has-text("Account List")) table',

  // ---- Select Customer Address Dialog ----
  /** @where Setup > Location > Select Address Dialog @el dialog @text "Select Customer Address" @keys address select dialog popup */
  dlgSelectAddress: '[role="dialog"]:has(h2:has-text("Select Customer Address"))',
  /** @where Setup > Location > Select Address Dialog @el input @text "Search..." @keys address search filter */
  txtAddrSearch: '[role="dialog"]:has(h2:has-text("Select Customer Address")) input[placeholder="Search..."]',
  /** @where Setup > Location > Select Address Dialog @el button @text "Select" @keys address select confirm choose */
  btnAddrSelect: '[role="dialog"]:has(h2:has-text("Select Customer Address")) button:has-text("Select")',
  /** @where Setup > Location > Select Address Dialog @el button @text "Cancel" @keys address cancel abort dialog */
  btnAddrCancel: '[role="dialog"]:has(h2:has-text("Select Customer Address")) button:has-text("Cancel")',
  /** @where Setup > Location > Select Address Dialog @el button @text "Save" @keys address save submit */
  btnAddrSave: '[role="dialog"]:has(h2:has-text("Select Customer Address")) button:has-text("Save")',
  /** @where Setup > Location > Select Address Dialog @el button @text "Close" @keys address close dismiss dialog */
  btnAddrClose: '[role="dialog"]:has(h2:has-text("Select Customer Address")) button:has-text("Close")',
  /** @where Setup > Location > Select Address Dialog @el checkbox @text "Select Row" @keys address row select checkbox first */
  chkAddrRow: '[role="dialog"]:has(h2:has-text("Select Customer Address")) tbody tr:first-child td:first-child button[role="checkbox"]',
  /** @where Setup > Location > Select Address Dialog @el table @text "Results" @keys address results grid table */
  tblAddrResults: '[role="dialog"]:has(h2:has-text("Select Customer Address")) table',
  /** @where Setup > Location > Select Address Dialog @el label @text "Total Addresses" @keys address total count label */
  lblAddrTotal: '[role="dialog"]:has(h2:has-text("Select Customer Address")) :text("Total Addresses")',

  // ---- Notes Tab Fields ----
  /** @where Setup > Location > Notes tab @el input @text "Location Notes" @keys notes textarea text input note */
  txtNoteInput: 'textarea[name^="notes.notes."]',
  /** @where Setup > Location > Notes tab @el table @text "Location Notes" @keys notes grid table list */
  tblNotes: 'table:has(th:has-text("Location Notes"))',
  /** @where Setup > Location > Notes tab @el button @text "Add" @keys notes add new create */
  btnNotesAdd: ':has(> table:has(th:has-text("Location Notes"))) button:has-text("Add")',
  /** @where Setup > Location > Notes tab @el button @text "Delete" @keys notes delete remove */
  btnNotesDelete: 'table:has(th:has-text("Location Notes")) button:has-text("Delete")',
  /** @where Setup > Location > Notes tab @el label @text "Progress" @keys notes progress character-count bar */
  barNotesProgress: ':has(> table:has(th:has-text("Location Notes"))) [role="progressbar"]',
  /** @where Setup > Location > Notes tab @el label @text "Character Count" @keys notes char-count remaining limit */
  lblNotesCharCount: ':has(> table:has(th:has-text("Location Notes"))) button:has-text("Add") + *',

  // ---- Shared Setup Locations Tab Fields ----
  /** @where Setup > Location > Shared Setup Locations tab @el table @text "Shared Setup" @keys shared-setup grid table locations */
  tblSharedSetupLocations: 'tabpanel:has([role="columnheader"]:has-text("Shares Inventory")) table',
  /** @where Setup > Location > Shared Setup Locations tab @el button @text "Add" @keys shared-setup add new location */
  btnSharedAdd: 'tabpanel:has([role="columnheader"]:has-text("Shares Inventory")) button:has-text("Add")',
  /** @where Setup > Location > Shared Setup Locations tab @el checkbox @text "Primary Office" @keys shared-setup primary office checkbox */
  chkSharedPrimaryOffice: 'tabpanel:has([role="columnheader"]:has-text("Shares Inventory")) tbody tr:first-child td:nth-child(3) [role="checkbox"]',
  /** @where Setup > Location > Shared Setup Locations tab @el checkbox @text "Shares Inventory" @keys shared-setup shares inventory checkbox */
  chkSharedSharesInventory: 'tabpanel:has([role="columnheader"]:has-text("Shares Inventory")) tbody tr:first-child td:nth-child(4) [role="checkbox"]',
  /** @where Setup > Location > Shared Setup Locations tab @el button @text "Delete" @keys shared-setup delete remove row */
  btnSharedDelete: 'tabpanel:has([role="columnheader"]:has-text("Shares Inventory")) tbody tr:first-child button:has-text("Delete")',

  // ---- Select Location Dialog ----
  /** @where Setup > Location > Select Location Dialog @el dialog @text "Select Location" @keys select location dialog popup shared */
  dlgSelectLocation: '[role="dialog"]:has(h2:has-text("Select Location"))',
  /** @where Setup > Location > Select Location Dialog @el input @text "Search" @keys select location search filter */
  txtSelectLocationSearch: '[role="dialog"]:has(h2:has-text("Select Location")) input',
  /** @where Setup > Location > Select Location Dialog @el button @text "Close" @keys select location close dismiss */
  btnSelectLocationClose: '[role="dialog"]:has(h2:has-text("Select Location")) button:has-text("Close")',
  /** @where Setup > Location > Select Location Dialog @el button @text "Clear" @keys select location clear search reset */
  btnSelectLocationClearSearch: '[role="dialog"]:has(h2:has-text("Select Location")) input + button',
  /** @where Setup > Location > Select Location Dialog @el table @text "Results" @keys select location results grid */
  tblSelectLocationResults: '[role="dialog"]:has(h2:has-text("Select Location")) table',

  // ---- Management History Tab Fields ----
  /** @where Setup > Location > Management History tab @el table @text "Management History" @keys management history grid table read-only */
  tblMgmtHistory: 'tabpanel:has([role="columnheader"]:has-text("Local Office Name")) table',
  /** @where Setup > Location > Management History tab @el dropdown @text "Rows Per Page" @keys management history rows-per-page pagination */
  drpMgmtHistoryRowsPerPage: 'tabpanel:has([role="columnheader"]:has-text("Local Office Name")) [role="combobox"]',
  /** @where Setup > Location > Management History tab @el button @text "First Page" @keys pagination first-page navigate */
  btnMgmtHistoryFirstPage: '[aria-label="Go to first page"]',
  /** @where Setup > Location > Management History tab @el button @text "Previous Page" @keys pagination previous-page navigate */
  btnMgmtHistoryPrevPage: '[aria-label="Go to previous page"]',
  /** @where Setup > Location > Management History tab @el button @text "Next Page" @keys pagination next-page navigate */
  btnMgmtHistoryNextPage: '[aria-label="Go to next page"]',
  /** @where Setup > Location > Management History tab @el button @text "Last Page" @keys pagination last-page navigate */
  btnMgmtHistoryLastPage: '[aria-label="Go to last page"]',
  /** @where Setup > Location > Management History tab @el label @text "No results." @keys management history empty no-data */
  txtMgmtHistoryEmptyState: 'tabpanel:has([role="columnheader"]:has-text("Local Office Name")) :text("No results.")',

  // ---- Auto Add-On Tab (Static Selectors) ----
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "Encore Music" @keys auto-addon encore music shadow-dom */
  chkAutoAddOnEncoreMusic: 'next-location-settings >> div:has(label:text-is("Encore Music")) button[data-slot="checkbox"]',
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "Wireless Presenter" @keys auto-addon wireless presenter shadow-dom */
  chkAutoAddOnWirelessPresenter: 'next-location-settings >> div:has(label:text-is("Wireless Presenter")) button[data-slot="checkbox"]',
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "Express Content Design Session" @keys auto-addon express content design shadow-dom */
  chkAutoAddOnExpressContentDesign: 'next-location-settings >> div:has(label:text-is("Express Content Design Session")) button[data-slot="checkbox"]',
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "Wordly" @keys auto-addon wordly translation shadow-dom */
  chkAutoAddOnWordly: 'next-location-settings >> div:has(label:text-is("Wordly")) button[data-slot="checkbox"]',
  /** @where Setup > Location > Auto Add-On tab @el checkbox @text "Labor" @keys auto-addon labor shadow-dom */
  chkAutoAddOnLabor: 'next-location-settings >> div:has(label:text-is("Labor")) button[data-slot="checkbox"]',
} as const;
