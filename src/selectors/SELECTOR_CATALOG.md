# Selector Catalog

> **Auto-generated** -- do not edit manually. Regenerate: `npm run selectors:catalog`

## Agent Lookup Flow

1. **SEARCH** this catalog (Ctrl+F or grep) by visible text, keyword, or UI location
2. **DRILL** into the source file (File column) for full selector string + context
3. **NOT FOUND?** -> discover via MCP browser, add selector WITH annotation, regenerate catalog

## Static Selectors (214)

| Key | Type | Where | Text | Keywords | File |
|-----|------|-------|------|----------|------|
| btnNext | button | Microsoft Login | Next | next continue email-submit | login.ts |
| btnSignIn | button | Microsoft Login | Sign in | sign-in submit login authenticate | login.ts |
| divError | label | Microsoft Login | Error | error username-error password-error validation | login.ts |
| txtEmail | input | Microsoft Login | Email | email username sign-in sso | login.ts |
| txtPassword | input | Microsoft Login | Password | password credential secret | login.ts |
| btnVerify | button | Microsoft Login > MFA | Verify | verify mfa submit totp | login.ts |
| txtOtpCode | input | Microsoft Login > MFA | OTP Code | totp mfa otp code verify | login.ts |
| btnNoStaySignedIn | button | Microsoft Login > Stay Signed In | No | stay-signed-in decline no | login.ts |
| btnYesStaySignedIn | button | Microsoft Login > Stay Signed In | Yes | stay-signed-in remember yes | login.ts |
| btnContinueNow | button | Navigator Cloud Sign-In | Continue Now | continue-now pre-sso sign-in navigator-cloud | login.ts |
| errAccPhone1Required | label | Setup > Location > Account and Address tab | Phone 1 Required | phone required validation error | setup/shared.ts |
| txtAccPhone1 | input | Setup > Location > Account and Address tab | Phone 1 | phone contact primary | setup/shared.ts |
| txtAccPhone2 | input | Setup > Location > Account and Address tab | Phone 2 | phone contact secondary | setup/shared.ts |
| txtAccVenueName | input | Setup > Location > Account and Address tab | Venue Name | venue name text editable | setup/shared.ts |
| btnAccMasterAddress | button | Setup > Location > Account and Address tab > Master | Address | master-bill address lookup | setup/shared.ts |
| btnAccName | button | Setup > Location > Account and Address tab > Venue | Name | account name venue-branch lookup | setup/shared.ts |
| btnAccVenueAddress | button | Setup > Location > Account and Address tab > Venue | Address | account address venue-branch lookup | setup/shared.ts |
| btnAccListCancel | button | Setup > Location > Account List Dialog | Cancel | cancel abort dialog account | setup/shared.ts |
| btnAccListClose | button | Setup > Location > Account List Dialog | Close | close dismiss dialog account | setup/shared.ts |
| btnAccListReset | button | Setup > Location > Account List Dialog | Reset | reset clear filter account | setup/shared.ts |
| btnAccListSearch | button | Setup > Location > Account List Dialog | Search | search submit find account | setup/shared.ts |
| btnAccListSelect | button | Setup > Location > Account List Dialog | Select | select confirm choose account | setup/shared.ts |
| chkAccListRowSelect | checkbox | Setup > Location > Account List Dialog | Select Row | row select checkbox first account | setup/shared.ts |
| dlgAccountList | dialog | Setup > Location > Account List Dialog | Account List | account list dialog search popup | setup/shared.ts |
| drpAccListCountry | dropdown | Setup > Location > Account List Dialog | Country | country combobox filter | setup/shared.ts |
| drpAccListState | dropdown | Setup > Location > Account List Dialog | State | state combobox filter | setup/shared.ts |
| tblAccListResults | table | Setup > Location > Account List Dialog | Results | results grid table account | setup/shared.ts |
| txtAccListAccountName | input | Setup > Location > Account List Dialog | Account Name | account name search filter | setup/shared.ts |
| txtAccListAccountNumber | input | Setup > Location > Account List Dialog | Account Number | account number search filter | setup/shared.ts |
| txtAccListAddress | input | Setup > Location > Account List Dialog | Address | address search filter | setup/shared.ts |
| txtAccListCity | input | Setup > Location > Account List Dialog | City | city search filter | setup/shared.ts |
| chkAutoAddOnEncoreMusic | checkbox | Setup > Location > Auto Add-On tab | Encore Music | auto-addon encore music shadow-dom | setup/shared.ts |
| chkAutoAddOnExpressContentDesign | checkbox | Setup > Location > Auto Add-On tab | Express Content Design Session | auto-addon express content design shadow-dom | setup/shared.ts |
| chkAutoAddOnLabor | checkbox | Setup > Location > Auto Add-On tab | Labor | auto-addon labor shadow-dom | setup/shared.ts |
| chkAutoAddOnWirelessPresenter | checkbox | Setup > Location > Auto Add-On tab | Wireless Presenter | auto-addon wireless presenter shadow-dom | setup/shared.ts |
| chkAutoAddOnWordly | checkbox | Setup > Location > Auto Add-On tab | Wordly | auto-addon wordly translation shadow-dom | setup/shared.ts |
| pnlAutoAddOn | panel | Setup > Location > Auto Add-On tab | Auto Add-On | shadow-host container web-component | setup/left-panel.ts |
| btnSaveCurrency | button | Setup > Location > Currency tab | Save | save submit currency form | setup/currency.ts |
| tblCurrencyGrid | table | Setup > Location > Currency tab | Currency Grid | currency grid table rows | setup/currency.ts |
| txtNoMatchesFound | label | Setup > Location > Currency tab | No Matches Found | empty no-results listbox | setup/currency.ts |
| chkCADIsDefault | checkbox | Setup > Location > Currency tab > CAD row | CAD Is Default | cad default primary toggle | setup/currency.ts |
| chkCADSelected | checkbox | Setup > Location > Currency tab > CAD row | CAD Selected | cad selected toggle enable | setup/currency.ts |
| drpCADMerchant | dropdown | Setup > Location > Currency tab > CAD row | CAD Merchant | cad merchant combobox | setup/currency.ts |
| colHeaderCurrencyCode | label | Setup > Location > Currency tab > Header | Currency Code | column header currency-code | setup/currency.ts |
| colHeaderIsDefault | label | Setup > Location > Currency tab > Header | Is Default | column header default | setup/currency.ts |
| colHeaderMerchant | label | Setup > Location > Currency tab > Header | Merchant | column header merchant | setup/currency.ts |
| colHeaderSelected | label | Setup > Location > Currency tab > Header | Selected | column header selected | setup/currency.ts |
| chkMXNIsDefault | checkbox | Setup > Location > Currency tab > MXN row | MXN Is Default | mxn default primary toggle | setup/currency.ts |
| chkMXNSelected | checkbox | Setup > Location > Currency tab > MXN row | MXN Selected | mxn selected toggle enable | setup/currency.ts |
| drpMXNMerchant | dropdown | Setup > Location > Currency tab > MXN row | MXN Merchant | mxn merchant combobox | setup/currency.ts |
| chkUSDIsDefault | checkbox | Setup > Location > Currency tab > USD row | USD Is Default | usd default primary toggle | setup/currency.ts |
| chkUSDSelected | checkbox | Setup > Location > Currency tab > USD row | USD Selected | usd selected toggle enable | setup/currency.ts |
| drpUSDMerchant | dropdown | Setup > Location > Currency tab > USD row | USD Merchant | usd merchant combobox | setup/currency.ts |
| btnErrorOk | button | Setup > Location > Error Dialog | Ok | error ok dismiss close | setup/shared.ts |
| dlgErrorDialog | dialog | Setup > Location > Error Dialog | Error | error alert dialog api popup | setup/shared.ts |
| dlgErrorMessage | label | Setup > Location > Error Dialog | Error Message | error message body detail | setup/shared.ts |
| dlgErrorTitle | label | Setup > Location > Error Dialog | Error | error title heading | setup/shared.ts |
| btnBackToLocationSearch | button | Setup > Location > Header | Back to Location Search | back return search breadcrumb | setup/left-panel.ts |
| btnLiveDate | datepicker | Setup > Location > Left Panel | Live Date | live-date popover calendar | setup/left-panel.ts |
| btnSave | button | Setup > Location > Left Panel | Save | save submit left-panel form | setup/left-panel.ts |
| chkActive | checkbox | Setup > Location > Left Panel | Active | active status toggle location | setup/left-panel.ts |
| chkECommerceActive | checkbox | Setup > Location > Left Panel | eCommerce Active | ecommerce online toggle | setup/left-panel.ts |
| chkEnableProductionsOrders | checkbox | Setup > Location > Left Panel | Enable Productions Orders | production-orders toggle | setup/left-panel.ts |
| chkUnion | checkbox | Setup > Location > Left Panel | Union | union labor toggle | setup/left-panel.ts |
| drpCountry | dropdown | Setup > Location > Left Panel | Country | country combobox geography | setup/left-panel.ts |
| drpLineOfBusiness | dropdown | Setup > Location > Left Panel | Line Of Business | line-of-business lob combobox | setup/left-panel.ts |
| drpRegion | dropdown | Setup > Location > Left Panel | Region | region combobox geography | setup/left-panel.ts |
| drpServicingBranchOffice | dropdown | Setup > Location > Left Panel | Servicing Branch Office | servicing-branch branch combobox | setup/left-panel.ts |
| drpTaxMode | dropdown | Setup > Location > Left Panel | Tax Mode | tax-mode combobox setting | setup/left-panel.ts |
| txtLocalOffice | input | Setup > Location > Left Panel | Local Office | local-office code disabled read-only | setup/left-panel.ts |
| txtLocalOfficeName | input | Setup > Location > Left Panel | Local Office Name | name editable location | setup/left-panel.ts |
| txtOffice | input | Setup > Location > Left Panel | Office | office code disabled read-only | setup/left-panel.ts |
| txtPayToAddress | input | Setup > Location > Left Panel | Pay To Address | pay-to address name billing | setup/left-panel.ts |
| btnSaveLegal | button | Setup > Location > Legal tab | Save | save submit legal form | setup/shared.ts |
| errLegalCellValidation | label | Setup > Location > Legal tab | Validation Error | validation error exclamation invalid legal cell | setup/shared.ts |
| tblLegalGrid | table | Setup > Location > Legal tab | Legal Grid | legal grid table language service-charge terms | setup/shared.ts |
| colHeaderLanguageName | label | Setup > Location > Legal tab > Header | Language Name | column header language | setup/shared.ts |
| colHeaderServiceChargeName | label | Setup > Location > Legal tab > Header | Service Charge Name | column header service-charge | setup/shared.ts |
| colHeaderTermsAndConditionsName | label | Setup > Location > Legal tab > Header | Terms and Conditions Name | column header terms-conditions | setup/shared.ts |
| cellLangNameUsEnglish | cell | Setup > Location > Legal tab > US English row | US English | language us-english first-row cell | setup/shared.ts |
| drpServiceChargeName | dropdown | Setup > Location > Legal tab > US English row | Service Charge Name | service-charge combobox us-english | setup/shared.ts |
| drpTermsAndConditionsName | dropdown | Setup > Location > Legal tab > US English row | Terms and Conditions Name | terms-conditions combobox us-english | setup/shared.ts |
| btnEffectiveDate | datepicker | Setup > Location > Local Information tab | Effective Date | effective-date calendar popover | setup/local-info.ts |
| btnSaveLocalInfo | button | Setup > Location > Local Information tab | Save | save submit local-info form | setup/local-info.ts |
| chkAllowDPCD | checkbox | Setup > Location > Local Information tab | Allow DPCD | dpcd allow toggle | setup/local-info.ts |
| chkAllowETS | checkbox | Setup > Location > Local Information tab | Allow ETS | ets allow toggle | setup/local-info.ts |
| chkAllowProductionQuote | checkbox | Setup > Location > Local Information tab | Allow Production Quote | production quote allow toggle | setup/local-info.ts |
| chkAllowResortTax | checkbox | Setup > Location > Local Information tab | Allow Resort Tax | resort-tax allow toggle | setup/local-info.ts |
| chkApplyCablesConsumablesFee | checkbox | Setup > Location > Local Information tab | Apply Cables and Consumables Fee | cables consumables cc fee apply toggle | setup/local-info.ts |
| chkApplyLDW | checkbox | Setup > Location > Local Information tab | Apply LDW | ldw apply loss-damage-waiver toggle | setup/local-info.ts |
| chkApplySetStrikeLaborMinutes | checkbox | Setup > Location > Local Information tab | Apply Set/Strike Labor Minutes | set-strike labor minutes apply toggle | setup/local-info.ts |
| chkCalculateCConNetAmount | checkbox | Setup > Location > Local Information tab | Calculate C&C on Net Amount | cables consumables cc net-amount toggle | setup/local-info.ts |
| chkCalculateCommissionTax | checkbox | Setup > Location > Local Information tab | Calculate Commission Tax | commission tax calculate toggle | setup/local-info.ts |
| chkCalculateLDWonNetAmount | checkbox | Setup > Location > Local Information tab | Calculate LDW on Net Amount | ldw calculate net-amount toggle | setup/local-info.ts |
| chkCalculateServiceChargeOnNetAmount | checkbox | Setup > Location > Local Information tab | Calculate Service Charge On Net Amount | service-charge calculate net-amount toggle | setup/local-info.ts |
| chkCanCreateExternalCustomerLink | checkbox | Setup > Location > Local Information tab | Can Create External Customer Link | external customer link create toggle | setup/local-info.ts |
| chkCommReceiver | checkbox | Setup > Location > Local Information tab | Comm Receiver | comm receiver commission toggle | setup/local-info.ts |
| chkCompanyRemitTax | checkbox | Setup > Location > Local Information tab | Company Remit Tax | company remit tax toggle | setup/local-info.ts |
| chkCompassIntegration | checkbox | Setup > Location > Local Information tab | Compass Integration | compass integration toggle | setup/local-info.ts |
| chkCreditMemoApprovalRequired | checkbox | Setup > Location > Local Information tab | Credit Memo Approval Required | credit-memo approval required toggle | setup/local-info.ts |
| chkDisplayTax | checkbox | Setup > Location > Local Information tab | Display Tax | display tax toggle | setup/local-info.ts |
| chkEnableDiscountGuidance | checkbox | Setup > Location > Local Information tab | Enable Discount Guidance | discount guidance enable toggle | setup/local-info.ts |
| chkEnableDiscountReason | checkbox | Setup > Location > Local Information tab | Enable Discount Reason | discount reason enable toggle | setup/local-info.ts |
| chkEnableIDCBilling | checkbox | Setup > Location > Local Information tab | Enable IDC Billing | idc billing enable toggle | setup/local-info.ts |
| chkEnableJobCosting | checkbox | Setup > Location > Local Information tab | Enable Job Costing | job-costing enable toggle | setup/local-info.ts |
| chkEnableProductGroup | checkbox | Setup > Location > Local Information tab | Enable Product Group | product-group enable toggle | setup/local-info.ts |
| chkEnableProposal | checkbox | Setup > Location > Local Information tab | Enable Proposal | proposal enable toggle | setup/local-info.ts |
| chkEnableSetStrikeLaborMinutes | checkbox | Setup > Location > Local Information tab | Enable Set/Strike Labor Minutes | set-strike labor minutes enable toggle | setup/local-info.ts |
| chkExcludeImpliedDiscount | checkbox | Setup > Location > Local Information tab | Exclude Implied Discount | implied-discount exclude toggle | setup/local-info.ts |
| chkExhibitShowRate | checkbox | Setup > Location > Local Information tab | Exhibit Show Rate | exhibit show rate toggle | setup/local-info.ts |
| chkHRIRemitTax2 | checkbox | Setup > Location > Local Information tab | HRI Remit Tax 2 | hri remit tax-2 toggle | setup/local-info.ts |
| chkIntercompany | checkbox | Setup > Location > Local Information tab | Intercompany | intercompany toggle | setup/local-info.ts |
| chkInternetAssetReservation | checkbox | Setup > Location > Local Information tab | Internet Asset Reservation | internet asset reservation toggle | setup/local-info.ts |
| chkInventoryOnly | checkbox | Setup > Location > Local Information tab | Inventory Only | inventory-only toggle | setup/local-info.ts |
| chkOffsiteEventLocation | checkbox | Setup > Location > Local Information tab | Offsite Event Location | offsite event location toggle | setup/local-info.ts |
| chkPromptForApproval | checkbox | Setup > Location > Local Information tab | Prompt for Approval | approval prompt toggle | setup/local-info.ts |
| chkSeparateMasterBillCommissionInvoice | checkbox | Setup > Location > Local Information tab | Separate Master Bill Commission Invoice | master-bill commission invoice separate toggle | setup/local-info.ts |
| chkServiceCharge | checkbox | Setup > Location > Local Information tab | Service Charge | service-charge fee toggle | setup/local-info.ts |
| chkShowServiceChargeAsAdministrativeFee | checkbox | Setup > Location > Local Information tab | Show Service Charge As Administrative Fee | service-charge administrative-fee display toggle | setup/local-info.ts |
| chkShowSubRental | checkbox | Setup > Location > Local Information tab | Show SubRental | sub-rental show toggle | setup/local-info.ts |
| chkSkipBilling | checkbox | Setup > Location > Local Information tab | Skip Billing | skip billing toggle | setup/local-info.ts |
| chkSuppressDayRateDiscount | checkbox | Setup > Location > Local Information tab | Suppress Day/Rate Discount | suppress day-rate discount toggle | setup/local-info.ts |
| chkTickerCalc | checkbox | Setup > Location > Local Information tab | Ticker Calc | ticker calc calculation toggle | setup/local-info.ts |
| chkUseESignature | checkbox | Setup > Location > Local Information tab | Use eSignature | esignature electronic signature toggle | setup/local-info.ts |
| chkWarehouseBilling | checkbox | Setup > Location > Local Information tab | Warehouse Billing | warehouse billing toggle | setup/local-info.ts |
| drpBillingCycle | dropdown | Setup > Location > Local Information tab | Billing Cycle | billing-cycle combobox | setup/local-info.ts |
| drpOracleOrganization | dropdown | Setup > Location > Local Information tab | Oracle Organization | oracle organization combobox | setup/local-info.ts |
| errMaxBoundary | label | Setup > Location > Local Information tab | less than or equal to 100 | validation error max boundary hundred | setup/local-info.ts |
| errMinBoundary | label | Setup > Location > Local Information tab | greater than or equal to 0 | validation error min boundary zero | setup/local-info.ts |
| errValidationMessage | label | Setup > Location > Local Information tab | Number must be | validation error message boundary | setup/local-info.ts |
| rdoBillingTypeDirect | radio | Setup > Location > Local Information tab | Direct | billing-type direct radio second | setup/local-info.ts |
| rdoBillingTypeMaster | radio | Setup > Location > Local Information tab | Master | billing-type master radio first | setup/local-info.ts |
| rdoBillingWayDaily | radio | Setup > Location > Local Information tab | Daily | billing-way daily radio second | setup/local-info.ts |
| rdoBillingWayEvent | radio | Setup > Location > Local Information tab | Event | billing-way event radio first | setup/local-info.ts |
| spinCCPercentage | spinbutton | Setup > Location > Local Information tab | Cables and Consumables Percentage | cables consumables cc percentage spin | setup/local-info.ts |
| spinETSPercentage | spinbutton | Setup > Location > Local Information tab | ETS Percentage | ets percentage spin number | setup/local-info.ts |
| spinLDWPercentage | spinbutton | Setup > Location > Local Information tab | LDW Percentage | ldw percentage default spin number | setup/local-info.ts |
| spinResortTaxPercentage | spinbutton | Setup > Location > Local Information tab | Resort Tax Percentage | resort tax percentage spin | setup/local-info.ts |
| spinSetStrikeLaborBillingGoal | spinbutton | Setup > Location > Local Information tab | Set/Strike Labor Billing Goal | set-strike labor billing goal spin | setup/local-info.ts |
| spinThreshold | spinbutton | Setup > Location > Local Information tab | Threshold Amount | threshold amount spin number | setup/local-info.ts |
| txtOracleDepartment | input | Setup > Location > Local Information tab | Oracle Department | oracle department dept text | setup/local-info.ts |
| txtOracleProduct | input | Setup > Location > Local Information tab | Oracle Product | oracle product text | setup/local-info.ts |
| btnMgmtHistoryFirstPage | button | Setup > Location > Management History tab | First Page | pagination first-page navigate | setup/shared.ts |
| btnMgmtHistoryLastPage | button | Setup > Location > Management History tab | Last Page | pagination last-page navigate | setup/shared.ts |
| btnMgmtHistoryNextPage | button | Setup > Location > Management History tab | Next Page | pagination next-page navigate | setup/shared.ts |
| btnMgmtHistoryPrevPage | button | Setup > Location > Management History tab | Previous Page | pagination previous-page navigate | setup/shared.ts |
| drpMgmtHistoryRowsPerPage | dropdown | Setup > Location > Management History tab | Rows Per Page | management history rows-per-page pagination | setup/shared.ts |
| tblMgmtHistory | table | Setup > Location > Management History tab | Management History | management history grid table read-only | setup/shared.ts |
| txtMgmtHistoryEmptyState | label | Setup > Location > Management History tab | No results. | management history empty no-data | setup/shared.ts |
| barNotesProgress | label | Setup > Location > Notes tab | Progress | notes progress character-count bar | setup/shared.ts |
| btnNotesAdd | button | Setup > Location > Notes tab | Add | notes add new create | setup/shared.ts |
| btnNotesDelete | button | Setup > Location > Notes tab | Delete | notes delete remove | setup/shared.ts |
| lblNotesCharCount | label | Setup > Location > Notes tab | Character Count | notes char-count remaining limit | setup/shared.ts |
| tblNotes | table | Setup > Location > Notes tab | Location Notes | notes grid table list | setup/shared.ts |
| txtNoteInput | input | Setup > Location > Notes tab | Location Notes | notes textarea text input note | setup/shared.ts |
| btnSavePricing | button | Setup > Location > Pricing tab | Save | save submit pricing form | setup/pricing.ts |
| chkCorporatePricing | checkbox | Setup > Location > Pricing tab | Corporate Pricing | corporate pricing toggle | setup/pricing.ts |
| chkPriceGuideInclusive | checkbox | Setup > Location > Pricing tab | Price Guide Inclusive | price-guide inclusive toggle | setup/pricing.ts |
| drpCurrencyFilter | dropdown | Setup > Location > Pricing tab | Currency | currency filter combobox pricing | setup/pricing.ts |
| drpPrimaryEquipmentPricing | dropdown | Setup > Location > Pricing tab | Primary Equipment Pricing | primary equipment pricing combobox | setup/pricing.ts |
| drpPrimaryInternalEquipmentPricing | dropdown | Setup > Location > Pricing tab | Primary Internal Equipment Pricing | primary internal equipment pricing combobox | setup/pricing.ts |
| drpPrimaryLaborPricing | dropdown | Setup > Location > Pricing tab | Primary Labor Pricing | primary labor pricing combobox | setup/pricing.ts |
| drpPrimaryProductionEquipmentPricing | dropdown | Setup > Location > Pricing tab | Primary Production Equipment Pricing | primary production equipment pricing combobox | setup/pricing.ts |
| drpPrimaryProductionLaborPricing | dropdown | Setup > Location > Pricing tab | Primary Production Labor Pricing | primary production labor pricing combobox | setup/pricing.ts |
| colHeaderCurrency | label | Setup > Location > Pricing tab > Header | Currency | column header currency | setup/pricing.ts |
| colHeaderEndDate | label | Setup > Location > Pricing tab > Header | End Date | column header end-date | setup/pricing.ts |
| colHeaderIsAlternative | label | Setup > Location > Pricing tab > Header | Is Alternative | column header alternative | setup/pricing.ts |
| colHeaderPricebook | label | Setup > Location > Pricing tab > Header | Pricebook | column header pricebook | setup/pricing.ts |
| colHeaderPricingStrategy | label | Setup > Location > Pricing tab > Header | Pricing Strategy | column header pricing-strategy | setup/pricing.ts |
| colHeaderStartDate | label | Setup > Location > Pricing tab > Header | Start Date | column header start-date | setup/pricing.ts |
| colHeaderUseEffectiveDate | label | Setup > Location > Pricing tab > Header | Use Effective Date | column header effective-date | setup/pricing.ts |
| tblSecondaryPricingGrid | table | Setup > Location > Pricing tab > Secondary | Location Secondary Pricing | secondary pricing grid table | setup/pricing.ts |
| btnSaveChangesCancel | button | Setup > Location > Save Changes Dialog | Cancel | save cancel abort dialog | setup/shared.ts |
| btnSaveChangesConfirm | button | Setup > Location > Save Changes Dialog | Save | save confirm submit dialog | setup/shared.ts |
| dlgSaveChanges | dialog | Setup > Location > Save Changes Dialog | Save Changes | save confirm dialog alert | setup/shared.ts |
| txtSaveChangesMessage | label | Setup > Location > Save Changes Dialog | Are you sure | save confirm message prompt | setup/shared.ts |
| btnAddrCancel | button | Setup > Location > Select Address Dialog | Cancel | address cancel abort dialog | setup/shared.ts |
| btnAddrClose | button | Setup > Location > Select Address Dialog | Close | address close dismiss dialog | setup/shared.ts |
| btnAddrSave | button | Setup > Location > Select Address Dialog | Save | address save submit | setup/shared.ts |
| btnAddrSelect | button | Setup > Location > Select Address Dialog | Select | address select confirm choose | setup/shared.ts |
| chkAddrRow | checkbox | Setup > Location > Select Address Dialog | Select Row | address row select checkbox first | setup/shared.ts |
| dlgSelectAddress | dialog | Setup > Location > Select Address Dialog | Select Customer Address | address select dialog popup | setup/shared.ts |
| lblAddrTotal | label | Setup > Location > Select Address Dialog | Total Addresses | address total count label | setup/shared.ts |
| tblAddrResults | table | Setup > Location > Select Address Dialog | Results | address results grid table | setup/shared.ts |
| txtAddrSearch | input | Setup > Location > Select Address Dialog | Search... | address search filter | setup/shared.ts |
| btnSelectLocationClearSearch | button | Setup > Location > Select Location Dialog | Clear | select location clear search reset | setup/shared.ts |
| btnSelectLocationClose | button | Setup > Location > Select Location Dialog | Close | select location close dismiss | setup/shared.ts |
| dlgSelectLocation | dialog | Setup > Location > Select Location Dialog | Select Location | select location dialog popup shared | setup/shared.ts |
| tblSelectLocationResults | table | Setup > Location > Select Location Dialog | Results | select location results grid | setup/shared.ts |
| txtSelectLocationSearch | input | Setup > Location > Select Location Dialog | Search | select location search filter | setup/shared.ts |
| btnSharedAdd | button | Setup > Location > Shared Setup Locations tab | Add | shared-setup add new location | setup/shared.ts |
| btnSharedDelete | button | Setup > Location > Shared Setup Locations tab | Delete | shared-setup delete remove row | setup/shared.ts |
| chkSharedPrimaryOffice | checkbox | Setup > Location > Shared Setup Locations tab | Primary Office | shared-setup primary office checkbox | setup/shared.ts |
| chkSharedSharesInventory | checkbox | Setup > Location > Shared Setup Locations tab | Shares Inventory | shared-setup shares inventory checkbox | setup/shared.ts |
| tblSharedSetupLocations | table | Setup > Location > Shared Setup Locations tab | Shared Setup | shared-setup grid table locations | setup/shared.ts |
| tabAccountAndAddress | tab | Setup > Location > Tabs | Account and Address | tab account address navigate | setup/left-panel.ts |
| tabAutoAddOn | tab | Setup > Location > Tabs | Auto Add-On | tab auto-addon navigate | setup/left-panel.ts |
| tabBasicInformation | tab | Setup > Location > Tabs | Basic Information | tab basic-info navigate | setup/left-panel.ts |
| tabCurrency | tab | Setup > Location > Tabs | Currency | tab currency navigate | setup/left-panel.ts |
| tabLegal | tab | Setup > Location > Tabs | Legal | tab legal navigate | setup/left-panel.ts |
| tabLocalInformation | tab | Setup > Location > Tabs | Local Information | tab local-info navigate settings | setup/left-panel.ts |
| tabLocationManagementHistory | tab | Setup > Location > Tabs | Location Management History | tab management history navigate | setup/left-panel.ts |
| tabNotes | tab | Setup > Location > Tabs | Notes | tab notes navigate | setup/left-panel.ts |
| tabPricing | tab | Setup > Location > Tabs | Pricing | tab pricing navigate | setup/left-panel.ts |
| tabSharedSetupLocations | tab | Setup > Location > Tabs | Shared Setup Locations | tab shared-setup navigate | setup/left-panel.ts |
| btnUnsavedChangesCancel | button | Setup > Location > Unsaved Changes Dialog | Cancel | unsaved cancel stay abort | setup/shared.ts |
| btnUnsavedChangesOk | button | Setup > Location > Unsaved Changes Dialog | OK | unsaved ok discard confirm | setup/shared.ts |
| dlgUnsavedChanges | dialog | Setup > Location > Unsaved Changes Dialog | Any unsaved changes will be lost | unsaved discard popup warning navigate-away | setup/shared.ts |
| btnReset | button | Setup > Location Search | Reset | reset clear filters | setup/left-panel.ts |
| btnSearch | button | Setup > Location Search | Search | search submit find locations | setup/left-panel.ts |
| gridLocationResults | table | Setup > Location Search | Results | grid results locations list | setup/left-panel.ts |
| txtLocalOfficeSearch | input | Setup > Location Search | Local Office | search office-code filter find | setup/left-panel.ts |
| btnSetupMenu | button | Setup > Navigation | Setup | setup menu sidebar navigation | setup/left-panel.ts |
| lnkLocation | link | Setup > Navigation | Settings | settings location navigate sidebar | setup/left-panel.ts |

## Dynamic Selectors (14)

> Require parameters -- use `DynamicSelectors.key(param)` directly.

| Key | Type | Where | Text | Keywords | Param | File |
|-----|------|-------|------|----------|-------|------|
| chkAutoAddOnItem | checkbox | Setup > Location > Auto Add-On tab | {itemName} | auto-addon item toggle shadow-dom | itemName -- add-on item label (e.g., "Encore Music") | dynamic.ts |
| lblAutoAddOnItem | label | Setup > Location > Auto Add-On tab | {itemName} | auto-addon item label shadow-dom | itemName -- add-on item label | dynamic.ts |
| cellCurrencyCode | cell | Setup > Location > Currency tab > Grid | {currency} | currency code cell value | currency -- currency code (e.g., "USD") | dynamic.ts |
| chkCurrencyIsDefault | checkbox | Setup > Location > Currency tab > Grid | {currency} | currency default primary | currency -- currency code (e.g., "USD") | dynamic.ts |
| chkCurrencySelected | checkbox | Setup > Location > Currency tab > Grid | {currency} | currency selected toggle enable | currency -- currency code (e.g., "USD") | dynamic.ts |
| drpCurrencyMerchant | dropdown | Setup > Location > Currency tab > Grid | {currency} | currency merchant combobox | currency -- currency code (e.g., "USD") | dynamic.ts |
| optMerchant | row | Setup > Location > Currency tab > Merchant dropdown | {merchantName} | merchant option listbox select | merchantName -- merchant name | dynamic.ts |
| optCurrencyFilter | row | Setup > Location > Pricing tab > Currency filter | {currency} | currency filter option listbox | currency -- currency code | dynamic.ts |
| chkIsAlternative | checkbox | Setup > Location > Pricing tab > Grid | {priceBookName} | alternative price-book toggle | priceBookName -- price book name | dynamic.ts |
| chkUseEffectiveDate | checkbox | Setup > Location > Pricing tab > Grid | {priceBookName} | effective-date price-book toggle | priceBookName -- price book name | dynamic.ts |
| dtpEndDate | datepicker | Setup > Location > Pricing tab > Grid | {priceBookName} | end-date price-book calendar | priceBookName -- price book name | dynamic.ts |
| dtpStartDate | datepicker | Setup > Location > Pricing tab > Grid | {priceBookName} | start-date price-book calendar | priceBookName -- price book name | dynamic.ts |
| rowPriceBook | row | Setup > Location > Pricing tab > Grid | {priceBookName} | price-book row pricing | priceBookName -- price book name | dynamic.ts |
| lnkOfficeCode | link | Setup > Location Search > Results grid | {officeCode} | office-code location link navigate | officeCode -- office code (e.g., "1604") | dynamic.ts |

---
*Generated: 2026-02-27T09:12:03.065Z | Total: 228 selectors (214 static + 14 dynamic)*
