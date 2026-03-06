# Selector Catalog

> **Auto-generated** -- do not edit manually. Regenerate: `npm run selectors:catalog`

## Agent Lookup Flow

1. **SEARCH** this catalog (Ctrl+F or grep) by visible text, keyword, or UI location
2. **DRILL** into the source file (File column) for full selector string + context
3. **NOT FOUND?** -> discover via MCP browser, add selector WITH annotation, regenerate catalog

## Static Selectors (122)

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
| btnSaveCurrency | button | Setup > Location > Currency tab | Save | save submit currency form | locations/currency.ts |
| tblCurrencyGrid | table | Setup > Location > Currency tab | Currency Grid | currency grid table rows | locations/currency.ts |
| txtNoMatchesFound | label | Setup > Location > Currency tab | No Matches Found | empty no-results listbox | locations/currency.ts |
| chkCADIsDefault | checkbox | Setup > Location > Currency tab > CAD row | CAD Is Default | cad default primary toggle | locations/currency.ts |
| chkCADSelected | checkbox | Setup > Location > Currency tab > CAD row | CAD Selected | cad selected toggle enable | locations/currency.ts |
| drpCADMerchant | dropdown | Setup > Location > Currency tab > CAD row | CAD Merchant | cad merchant combobox | locations/currency.ts |
| colHeaderCurrencyCode | label | Setup > Location > Currency tab > Header | Currency Code | column header currency-code | locations/currency.ts |
| colHeaderIsDefault | label | Setup > Location > Currency tab > Header | Is Default | column header default | locations/currency.ts |
| colHeaderMerchant | label | Setup > Location > Currency tab > Header | Merchant | column header merchant | locations/currency.ts |
| colHeaderSelected | label | Setup > Location > Currency tab > Header | Selected | column header selected | locations/currency.ts |
| chkMXNIsDefault | checkbox | Setup > Location > Currency tab > MXN row | MXN Is Default | mxn default primary toggle | locations/currency.ts |
| chkMXNSelected | checkbox | Setup > Location > Currency tab > MXN row | MXN Selected | mxn selected toggle enable | locations/currency.ts |
| drpMXNMerchant | dropdown | Setup > Location > Currency tab > MXN row | MXN Merchant | mxn merchant combobox | locations/currency.ts |
| chkUSDIsDefault | checkbox | Setup > Location > Currency tab > USD row | USD Is Default | usd default primary toggle | locations/currency.ts |
| chkUSDSelected | checkbox | Setup > Location > Currency tab > USD row | USD Selected | usd selected toggle enable | locations/currency.ts |
| drpUSDMerchant | dropdown | Setup > Location > Currency tab > USD row | USD Merchant | usd merchant combobox | locations/currency.ts |
| btnErrorOk | button | Setup > Location > Error Dialog | Ok | error ok dismiss close | locations/shared.ts |
| dlgErrorDialog | dialog | Setup > Location > Error Dialog | Error | error alert dialog api popup | locations/shared.ts |
| dlgErrorMessage | label | Setup > Location > Error Dialog | Error Message | error message body detail | locations/shared.ts |
| btnSave | button | Setup > Location > Left Panel | Save | save submit left-panel form | locations/left-panel.ts |
| chkECommerceActive | checkbox | Setup > Location > Left Panel | eCommerce Active | ecommerce online toggle | locations/left-panel.ts |
| chkEnableProductionsOrders | checkbox | Setup > Location > Left Panel | Enable Productions Orders | production-orders toggle | locations/left-panel.ts |
| txtLocalOffice | input | Setup > Location > Left Panel | Local Office | local-office code disabled read-only | locations/left-panel.ts |
| txtOffice | input | Setup > Location > Left Panel | Office | office code disabled read-only | locations/left-panel.ts |
| txtPayToAddress | input | Setup > Location > Left Panel | Pay To Address | pay-to address name billing | locations/left-panel.ts |
| btnEffectiveDate | datepicker | Setup > Location > Local Information tab | Effective Date | effective-date calendar popover | locations/local-info.ts |
| btnSaveLocalInfo | button | Setup > Location > Local Information tab | Save | save submit local-info form | locations/local-info.ts |
| chkAllowDPCD | checkbox | Setup > Location > Local Information tab | Allow DPCD | dpcd allow toggle | locations/local-info.ts |
| chkAllowETS | checkbox | Setup > Location > Local Information tab | Allow ETS | ets allow toggle | locations/local-info.ts |
| chkAllowProductionQuote | checkbox | Setup > Location > Local Information tab | Allow Production Quote | production quote allow toggle | locations/local-info.ts |
| chkAllowResortTax | checkbox | Setup > Location > Local Information tab | Allow Resort Tax | resort-tax allow toggle | locations/local-info.ts |
| chkApplyCablesConsumablesFee | checkbox | Setup > Location > Local Information tab | Apply Cables and Consumables Fee | cables consumables cc fee apply toggle | locations/local-info.ts |
| chkApplyLDW | checkbox | Setup > Location > Local Information tab | Apply LDW | ldw apply loss-damage-waiver toggle | locations/local-info.ts |
| chkApplySetStrikeLaborMinutes | checkbox | Setup > Location > Local Information tab | Apply Set/Strike Labor Minutes | set-strike labor minutes apply toggle | locations/local-info.ts |
| chkCalculateCConNetAmount | checkbox | Setup > Location > Local Information tab | Calculate C&C on Net Amount | cables consumables cc net-amount toggle | locations/local-info.ts |
| chkCalculateCommissionTax | checkbox | Setup > Location > Local Information tab | Calculate Commission Tax | commission tax calculate toggle | locations/local-info.ts |
| chkCalculateLDWonNetAmount | checkbox | Setup > Location > Local Information tab | Calculate LDW on Net Amount | ldw calculate net-amount toggle | locations/local-info.ts |
| chkCalculateServiceChargeOnNetAmount | checkbox | Setup > Location > Local Information tab | Calculate Service Charge On Net Amount | service-charge calculate net-amount toggle | locations/local-info.ts |
| chkCanCreateExternalCustomerLink | checkbox | Setup > Location > Local Information tab | Can Create External Customer Link | external customer link create toggle | locations/local-info.ts |
| chkCommReceiver | checkbox | Setup > Location > Local Information tab | Comm Receiver | comm receiver commission toggle | locations/local-info.ts |
| chkCompanyRemitTax | checkbox | Setup > Location > Local Information tab | Company Remit Tax | company remit tax toggle | locations/local-info.ts |
| chkCompassIntegration | checkbox | Setup > Location > Local Information tab | Compass Integration | compass integration toggle | locations/local-info.ts |
| chkCreditMemoApprovalRequired | checkbox | Setup > Location > Local Information tab | Credit Memo Approval Required | credit-memo approval required toggle | locations/local-info.ts |
| chkDisplayTax | checkbox | Setup > Location > Local Information tab | Display Tax | display tax toggle | locations/local-info.ts |
| chkEnableDiscountGuidance | checkbox | Setup > Location > Local Information tab | Enable Discount Guidance | discount guidance enable toggle | locations/local-info.ts |
| chkEnableDiscountReason | checkbox | Setup > Location > Local Information tab | Enable Discount Reason | discount reason enable toggle | locations/local-info.ts |
| chkEnableIDCBilling | checkbox | Setup > Location > Local Information tab | Enable IDC Billing | idc billing enable toggle | locations/local-info.ts |
| chkEnableJobCosting | checkbox | Setup > Location > Local Information tab | Enable Job Costing | job-costing enable toggle | locations/local-info.ts |
| chkEnableProductGroup | checkbox | Setup > Location > Local Information tab | Enable Product Group | product-group enable toggle | locations/local-info.ts |
| chkEnableProposal | checkbox | Setup > Location > Local Information tab | Enable Proposal | proposal enable toggle | locations/local-info.ts |
| chkEnableSetStrikeLaborMinutes | checkbox | Setup > Location > Local Information tab | Enable Set/Strike Labor Minutes | set-strike labor minutes enable toggle | locations/local-info.ts |
| chkExcludeImpliedDiscount | checkbox | Setup > Location > Local Information tab | Exclude Implied Discount | implied-discount exclude toggle | locations/local-info.ts |
| chkExhibitShowRate | checkbox | Setup > Location > Local Information tab | Exhibit Show Rate | exhibit show rate toggle | locations/local-info.ts |
| chkHRIRemitTax2 | checkbox | Setup > Location > Local Information tab | HRI Remit Tax 2 | hri remit tax-2 toggle | locations/local-info.ts |
| chkIntercompany | checkbox | Setup > Location > Local Information tab | Intercompany | intercompany toggle | locations/local-info.ts |
| chkInternetAssetReservation | checkbox | Setup > Location > Local Information tab | Internet Asset Reservation | internet asset reservation toggle | locations/local-info.ts |
| chkInventoryOnly | checkbox | Setup > Location > Local Information tab | Inventory Only | inventory-only toggle | locations/local-info.ts |
| chkOffsiteEventLocation | checkbox | Setup > Location > Local Information tab | Offsite Event Location | offsite event location toggle | locations/local-info.ts |
| chkPromptForApproval | checkbox | Setup > Location > Local Information tab | Prompt for Approval | approval prompt toggle | locations/local-info.ts |
| chkSeparateMasterBillCommissionInvoice | checkbox | Setup > Location > Local Information tab | Separate Master Bill Commission Invoice | master-bill commission invoice separate toggle | locations/local-info.ts |
| chkServiceCharge | checkbox | Setup > Location > Local Information tab | Service Charge | service-charge fee toggle | locations/local-info.ts |
| chkShowServiceChargeAsAdministrativeFee | checkbox | Setup > Location > Local Information tab | Show Service Charge As Administrative Fee | service-charge administrative-fee display toggle | locations/local-info.ts |
| chkShowSubRental | checkbox | Setup > Location > Local Information tab | Show SubRental | sub-rental show toggle | locations/local-info.ts |
| chkSkipBilling | checkbox | Setup > Location > Local Information tab | Skip Billing | skip billing toggle | locations/local-info.ts |
| chkSuppressDayRateDiscount | checkbox | Setup > Location > Local Information tab | Suppress Day/Rate Discount | suppress day-rate discount toggle | locations/local-info.ts |
| chkTickerCalc | checkbox | Setup > Location > Local Information tab | Ticker Calc | ticker calc calculation toggle | locations/local-info.ts |
| chkUseESignature | checkbox | Setup > Location > Local Information tab | Use eSignature | esignature electronic signature toggle | locations/local-info.ts |
| chkWarehouseBilling | checkbox | Setup > Location > Local Information tab | Warehouse Billing | warehouse billing toggle | locations/local-info.ts |
| drpBillingCycle | dropdown | Setup > Location > Local Information tab | Billing Cycle | billing-cycle combobox | locations/local-info.ts |
| drpOracleOrganization | dropdown | Setup > Location > Local Information tab | Oracle Organization | oracle organization combobox | locations/local-info.ts |
| errMaxBoundary | label | Setup > Location > Local Information tab | less than or equal to 100 | validation error max boundary hundred | locations/local-info.ts |
| errMinBoundary | label | Setup > Location > Local Information tab | greater than or equal to 0 | validation error min boundary zero | locations/local-info.ts |
| errValidationMessage | label | Setup > Location > Local Information tab | Number must be | validation error message boundary | locations/local-info.ts |
| rdoBillingTypeDirect | radio | Setup > Location > Local Information tab | Direct | billing-type direct radio second | locations/local-info.ts |
| rdoBillingTypeMaster | radio | Setup > Location > Local Information tab | Master | billing-type master radio first | locations/local-info.ts |
| rdoBillingWayDaily | radio | Setup > Location > Local Information tab | Daily | billing-way daily radio second | locations/local-info.ts |
| rdoBillingWayEvent | radio | Setup > Location > Local Information tab | Event | billing-way event radio first | locations/local-info.ts |
| spinCCPercentage | spinbutton | Setup > Location > Local Information tab | Cables and Consumables Percentage | cables consumables cc percentage spin | locations/local-info.ts |
| spinETSPercentage | spinbutton | Setup > Location > Local Information tab | ETS Percentage | ets percentage spin number | locations/local-info.ts |
| spinLDWPercentage | spinbutton | Setup > Location > Local Information tab | LDW Percentage | ldw percentage default spin number | locations/local-info.ts |
| spinResortTaxPercentage | spinbutton | Setup > Location > Local Information tab | Resort Tax Percentage | resort tax percentage spin | locations/local-info.ts |
| spinSetStrikeLaborBillingGoal | spinbutton | Setup > Location > Local Information tab | Set/Strike Labor Billing Goal | set-strike labor billing goal spin | locations/local-info.ts |
| spinThreshold | spinbutton | Setup > Location > Local Information tab | Threshold Amount | threshold amount spin number | locations/local-info.ts |
| txtOracleDepartment | input | Setup > Location > Local Information tab | Oracle Department | oracle department dept text | locations/local-info.ts |
| txtOracleProduct | input | Setup > Location > Local Information tab | Oracle Product | oracle product text | locations/local-info.ts |
| btnSavePricing | button | Setup > Location > Pricing tab | Save | save submit pricing form | locations/pricing.ts |
| chkCorporatePricing | checkbox | Setup > Location > Pricing tab | Corporate Pricing | corporate pricing toggle | locations/pricing.ts |
| chkPriceGuideInclusive | checkbox | Setup > Location > Pricing tab | Price Guide Inclusive | price-guide inclusive toggle | locations/pricing.ts |
| drpCurrencyFilter | dropdown | Setup > Location > Pricing tab | Currency | currency filter combobox pricing | locations/pricing.ts |
| drpPrimaryEquipmentPricing | dropdown | Setup > Location > Pricing tab | Primary Equipment Pricing | primary equipment pricing combobox | locations/pricing.ts |
| drpPrimaryInternalEquipmentPricing | dropdown | Setup > Location > Pricing tab | Primary Internal Equipment Pricing | primary internal equipment pricing combobox | locations/pricing.ts |
| drpPrimaryLaborPricing | dropdown | Setup > Location > Pricing tab | Primary Labor Pricing | primary labor pricing combobox | locations/pricing.ts |
| drpPrimaryProductionEquipmentPricing | dropdown | Setup > Location > Pricing tab | Primary Production Equipment Pricing | primary production equipment pricing combobox | locations/pricing.ts |
| drpPrimaryProductionLaborPricing | dropdown | Setup > Location > Pricing tab | Primary Production Labor Pricing | primary production labor pricing combobox | locations/pricing.ts |
| colHeaderCurrency | label | Setup > Location > Pricing tab > Header | Currency | column header currency | locations/pricing.ts |
| colHeaderEndDate | label | Setup > Location > Pricing tab > Header | End Date | column header end-date | locations/pricing.ts |
| colHeaderIsAlternative | label | Setup > Location > Pricing tab > Header | Is Alternative | column header alternative | locations/pricing.ts |
| colHeaderPricebook | label | Setup > Location > Pricing tab > Header | Pricebook | column header pricebook | locations/pricing.ts |
| colHeaderPricingStrategy | label | Setup > Location > Pricing tab > Header | Pricing Strategy | column header pricing-strategy | locations/pricing.ts |
| colHeaderStartDate | label | Setup > Location > Pricing tab > Header | Start Date | column header start-date | locations/pricing.ts |
| colHeaderUseEffectiveDate | label | Setup > Location > Pricing tab > Header | Use Effective Dates | column header effective-date | locations/pricing.ts |
| tblSecondaryPricingGrid | table | Setup > Location > Pricing tab > Secondary | Location Secondary Pricing | secondary pricing grid table | locations/pricing.ts |
| btnSaveChangesCancel | button | Setup > Location > Save Changes Dialog | Cancel | save cancel abort dialog | locations/shared.ts |
| btnSaveChangesConfirm | button | Setup > Location > Save Changes Dialog | Save | save confirm submit dialog | locations/shared.ts |
| dlgSaveChanges | dialog | Setup > Location > Save Changes Dialog | Save Changes | save confirm dialog alert | locations/shared.ts |
| tabBasicInformation | tab | Setup > Location > Tabs | Basic Information | tab basic-info navigate | locations/left-panel.ts |
| tabCurrency | tab | Setup > Location > Tabs | Currency | tab currency navigate | locations/left-panel.ts |
| tabLocalInformation | tab | Setup > Location > Tabs | Local Information | tab local-info navigate settings | locations/left-panel.ts |
| tabPricing | tab | Setup > Location > Tabs | Pricing | tab pricing navigate | locations/left-panel.ts |
| btnUnsavedChangesCancel | button | Setup > Location > Unsaved Changes Dialog | Cancel | unsaved cancel stay abort | locations/shared.ts |
| btnUnsavedChangesOk | button | Setup > Location > Unsaved Changes Dialog | OK | unsaved ok discard confirm | locations/shared.ts |
| dlgUnsavedChanges | dialog | Setup > Location > Unsaved Changes Dialog | Any unsaved changes will be lost | unsaved discard popup warning navigate-away | locations/shared.ts |

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
*Generated: 2026-03-05T19:18:21.218Z | Total: 136 selectors (122 static + 14 dynamic)*
