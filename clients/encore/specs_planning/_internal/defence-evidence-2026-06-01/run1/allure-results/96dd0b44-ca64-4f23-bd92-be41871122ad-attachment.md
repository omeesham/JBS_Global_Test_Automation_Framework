# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\locations\location-local-information.spec.ts >> Location Local Info @locations @local-info >> TC-LOC-LI-021/029: Oracle Product valid input + Calculate LDW Net Amount toggle persist
- Location: specs\locations\location-local-information.spec.ts:346:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e4]:
    - generic [ref=e7]:
      - list [ref=e9]:
        - listitem [ref=e10]:
          - button "1604 Parker Palm Springs" [ref=e11] [cursor=pointer]:
            - generic [ref=e13]: "1604"
            - generic [ref=e14]:
              - generic [ref=e15]: Parker Palm Springs
              - img [ref=e16]
      - generic [ref=e22]:
        - list [ref=e24]:
          - listitem [ref=e25]:
            - link "Home" [ref=e26] [cursor=pointer]:
              - /url: /navigator/locations/1604/home
              - img [ref=e27]
              - generic [ref=e30]: Home
          - listitem [ref=e31]:
            - link "Inbox" [ref=e32] [cursor=pointer]:
              - /url: /navigator/locations/1604/inbox
              - img [ref=e33]
              - generic [ref=e36]: Inbox
          - listitem [ref=e37]:
            - button "Actions" [ref=e38] [cursor=pointer]:
              - img [ref=e39]
              - generic [ref=e41]: Actions
              - img [ref=e42]
          - listitem [ref=e44]:
            - button "Commissions" [ref=e45] [cursor=pointer]:
              - img [ref=e46]
              - generic [ref=e48]: Commissions
              - img [ref=e49]
          - listitem [ref=e51]:
            - button "Tax" [ref=e52] [cursor=pointer]:
              - img [ref=e53]
              - generic [ref=e56]: Tax
              - img [ref=e57]
          - listitem [ref=e59]:
            - button "Setup" [ref=e60] [cursor=pointer]:
              - img [ref=e61]
              - generic [ref=e64]: Setup
              - img [ref=e65]
          - listitem [ref=e67]:
            - button "Studio" [ref=e68] [cursor=pointer]:
              - img [ref=e69]
              - generic [ref=e71]: Studio
              - img [ref=e72]
        - generic [ref=e74]:
          - generic [ref=e75]: Search
          - list [ref=e77]:
            - listitem [ref=e78]:
              - button "Order Search" [disabled]:
                - img
                - generic: Order Search
            - listitem [ref=e79]:
              - link "Job Search" [ref=e80] [cursor=pointer]:
                - /url: /navigator/locations/1604/fulfillments
                - img [ref=e81]
                - generic [ref=e84]: Job Search
            - listitem [ref=e85]:
              - link "Asset Search" [ref=e86] [cursor=pointer]:
                - /url: /navigator/locations/1604/assets
                - img [ref=e87]
                - generic [ref=e90]: Asset Search
            - listitem [ref=e91]:
              - link "Customer Search" [ref=e92] [cursor=pointer]:
                - /url: /navigator/locations/1604/customers
                - img [ref=e93]
                - generic [ref=e96]: Customer Search
            - listitem [ref=e97]:
              - button "DRO Search" [disabled]:
                - img
                - generic: DRO Search
            - listitem [ref=e98]:
              - button "Payment Search" [disabled]:
                - img
                - generic: Payment Search
            - listitem [ref=e99]:
              - link "Item Search" [ref=e100] [cursor=pointer]:
                - /url: /navigator/locations/1604/products
                - img [ref=e101]
                - generic [ref=e111]: Item Search
            - listitem [ref=e112]:
              - button "ECT Search" [disabled]:
                - img
                - generic: ECT Search
            - listitem [ref=e113]:
              - button "Event Agendas" [disabled]:
                - img
                - generic: Event Agendas
        - list [ref=e115]:
          - listitem [ref=e116]:
            - button "Navigator Assistant" [ref=e117] [cursor=pointer]:
              - img [ref=e118]
              - generic [ref=e120]: Navigator Assistant
      - list [ref=e123]:
        - listitem [ref=e124]:
          - button "PC prd click auto" [ref=e125] [cursor=pointer]:
            - generic [ref=e127]: PC
            - generic [ref=e129]: prd click auto
            - img [ref=e130]
      - button "Click to restore sidebar" [ref=e134]
    - main [ref=e135]:
      - generic [ref=e138]:
        - generic [ref=e140]:
          - button "trigger-button" [ref=e141] [cursor=pointer]:
            - img
          - generic [ref=e143]:
            - heading "Location Settings" [level=1] [ref=e145]
            - button "More information" [ref=e146]:
              - img [ref=e147]
        - generic [ref=e151]:
          - tablist [ref=e152]:
            - tab "Basic Information" [selected] [ref=e153] [cursor=pointer]:
              - generic [ref=e154]:
                - img [ref=e155]
                - text: Basic Information
            - tab "Location Management History" [ref=e158] [cursor=pointer]:
              - generic [ref=e159]:
                - img [ref=e160]
                - text: Location Management History
          - tabpanel "Basic Information" [ref=e164]:
            - generic [ref=e165]:
              - generic [ref=e173]:
                - generic [ref=e174]:
                  - button "Save" [disabled]
                - generic [ref=e175]:
                  - generic [ref=e176]:
                    - generic [ref=e177]: Office
                    - textbox "Office" [disabled]:
                      - /placeholder: No office available
                      - text: "1604"
                  - generic [ref=e178]:
                    - generic [ref=e179]: Local Office
                    - generic [ref=e180]:
                      - textbox "Local Office" [disabled]: "1604"
                  - generic [ref=e181]:
                    - generic [ref=e182]: Local Office Name
                    - textbox "Local Office Name" [ref=e184]: Parker Palm Springs
                  - generic [ref=e185]:
                    - generic [ref=e186]: Active
                    - checkbox "Active" [checked] [ref=e187] [cursor=pointer]:
                      - generic:
                        - img
                  - generic [ref=e188]:
                    - generic [ref=e189]: Live Date
                    - button "Open popover" [ref=e190] [cursor=pointer]:
                      - img
                      - text: December 16th, 1991
                  - generic [ref=e192]: Tax Mode
                  - generic [ref=e196]: Country
                  - generic [ref=e201]: Region
                  - generic [ref=e206]: Servicing Branch Office
                  - generic [ref=e208]:
                    - generic [ref=e209]: Line Of Business
                    - combobox [disabled] [ref=e211]:
                      - generic: Hotel Services Division
                      - img
                  - generic [ref=e212]:
                    - generic [ref=e213] [cursor=pointer]: Pay To Address
                    - generic [ref=e214]:
                      - textbox "Pay To Address" [disabled]: Encore
                  - generic [ref=e215]:
                    - generic [ref=e216]: Union
                    - checkbox "Union" [ref=e217] [cursor=pointer]
                  - generic [ref=e218]:
                    - generic [ref=e219]: eCommerce Active
                    - checkbox "eCommerce Active" [checked] [disabled] [ref=e220]:
                      - generic:
                        - img
                  - generic [ref=e221]:
                    - generic [ref=e222]: Enable Productions Orders
                    - checkbox "Enable Productions Orders" [checked] [disabled] [ref=e223]:
                      - generic:
                        - img
              - generic [ref=e225]:
                - tablist [ref=e226]:
                  - tab "Local Information" [selected] [ref=e227] [cursor=pointer]:
                    - generic [ref=e228]:
                      - img [ref=e229]
                      - text: Local Information
                  - tab "Currency" [ref=e232] [cursor=pointer]:
                    - generic [ref=e233]:
                      - img [ref=e234]
                      - text: Currency
                  - tab "Pricing" [ref=e237] [cursor=pointer]:
                    - generic [ref=e238]:
                      - img [ref=e239]
                      - text: Pricing
                  - tab "Account and Address" [ref=e243] [cursor=pointer]:
                    - generic [ref=e244]:
                      - img [ref=e245]
                      - text: Account and Address
                  - tab "Legal" [ref=e248] [cursor=pointer]:
                    - generic [ref=e249]:
                      - img [ref=e250]
                      - text: Legal
                  - tab "Notes" [ref=e254] [cursor=pointer]:
                    - generic [ref=e255]:
                      - img [ref=e256]
                      - text: Notes
                  - tab "Shared Setup Locations" [ref=e259] [cursor=pointer]:
                    - generic [ref=e260]:
                      - img [ref=e261]
                      - text: Shared Setup Locations
                  - tab "Auto Add-On" [ref=e264] [cursor=pointer]:
                    - generic [ref=e265]:
                      - img [ref=e266]
                      - text: Auto Add-On
                - tabpanel "Local Information" [ref=e271]:
                  - generic [ref=e274]:
                    - generic [ref=e275]:
                      - generic [ref=e276]:
                        - term [ref=e277]: Apply LDW
                        - definition [ref=e278]:
                          - checkbox [checked] [ref=e281] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e282]:
                        - term [ref=e283]: LDW Percentage
                        - definition [ref=e284]:
                          - textbox "0.00%" [ref=e287]: 4.00%
                      - generic [ref=e288]:
                        - term [ref=e289]: Calculate LDW on Net Amount
                        - definition [ref=e290]:
                          - checkbox [ref=e293] [cursor=pointer]
                      - generic [ref=e294]:
                        - term [ref=e295]: Apply Cables and Consumables Fee
                        - definition [ref=e296]:
                          - checkbox [ref=e299] [cursor=pointer]
                      - generic [ref=e300]:
                        - term [ref=e301]: C&C Percentage
                        - definition [ref=e302]:
                          - generic [ref=e304]:
                            - textbox "0.00%" [disabled]
                      - generic [ref=e305]:
                        - term [ref=e306]: Calculate C&C on Net Amount
                        - definition [ref=e307]:
                          - checkbox [ref=e311] [cursor=pointer]
                      - generic [ref=e312]:
                        - term [ref=e313]: Enable Multiday Pricing
                        - definition [ref=e314]:
                          - checkbox [ref=e317] [cursor=pointer]
                      - generic [ref=e318]:
                        - term [ref=e319]: Allow ETS
                        - definition [ref=e320]:
                          - checkbox [ref=e323] [cursor=pointer]
                      - generic [ref=e324]:
                        - term [ref=e325]: ETS Percentage
                        - definition [ref=e326]:
                          - generic [ref=e328]:
                            - textbox "0.00%" [disabled]
                      - generic [ref=e329]:
                        - term [ref=e330]: Service Charge
                        - definition [ref=e331]:
                          - checkbox [checked] [ref=e334] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e335]:
                        - term [ref=e336]: Show Service Charge As Administrative Fee
                        - definition [ref=e337]:
                          - checkbox [ref=e340] [cursor=pointer]
                      - generic [ref=e341]:
                        - term [ref=e342]: Calculate Service Charge On Net Amount
                        - definition [ref=e343]:
                          - checkbox [ref=e346] [cursor=pointer]
                      - generic [ref=e347]:
                        - term [ref=e348]: Allow Resort Tax
                        - definition [ref=e349]:
                          - checkbox [ref=e352] [cursor=pointer]
                      - generic [ref=e353]:
                        - term [ref=e354]: Resort Tax Percentage
                        - definition [ref=e355]:
                          - generic [ref=e357]:
                            - textbox "0.00%" [disabled]
                      - generic [ref=e358]:
                        - term [ref=e359]: Ticker Calc
                        - definition [ref=e360]:
                          - checkbox [checked] [ref=e363] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e364]:
                        - term [ref=e365]: Set/Strike/Support Labor Billing Goal
                        - definition [ref=e366]:
                          - textbox "0.00%" [ref=e369]: 33.00%
                      - generic [ref=e370]:
                        - term [ref=e371]: Enable Set/Strike Labor Minutes
                        - definition [ref=e372]:
                          - checkbox [checked] [ref=e375] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e376]:
                        - term [ref=e377]: Apply Set/Strike Labor Minutes
                        - definition [ref=e378]:
                          - checkbox [checked] [ref=e381] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e382]:
                        - term [ref=e383]: Internet Asset Reservation
                        - definition [ref=e384]:
                          - checkbox [ref=e387] [cursor=pointer]
                      - generic [ref=e388]:
                        - term [ref=e389]: Allow DPCD
                        - definition [ref=e390]:
                          - checkbox [checked] [ref=e393] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e394]:
                        - term [ref=e395]: Exclude Implied Discount
                        - definition [ref=e396]:
                          - checkbox [ref=e399] [cursor=pointer]
                      - generic [ref=e400]:
                        - term [ref=e401]: Prompt for Approval
                        - definition [ref=e402]:
                          - checkbox [ref=e405] [cursor=pointer]
                      - generic [ref=e406]:
                        - term [ref=e407]: Threshold
                        - definition [ref=e408]:
                          - generic [ref=e410]:
                            - textbox "0.00%" [disabled]
                      - generic [ref=e411]:
                        - term [ref=e412]: Credit Memo Approval Required
                        - definition [ref=e413]:
                          - checkbox [checked] [ref=e416] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e417]:
                        - term [ref=e418]: Enable Discount Reason
                        - definition [ref=e419]:
                          - checkbox [checked] [ref=e422] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e423]:
                        - term [ref=e424]: Use eSignature
                        - definition [ref=e425]:
                          - checkbox [checked] [disabled] [ref=e428]:
                            - generic:
                              - img
                      - generic [ref=e429]:
                        - term [ref=e430]: Enable Product Group
                        - definition [ref=e431]:
                          - checkbox [disabled] [ref=e434]
                      - generic [ref=e435]:
                        - term [ref=e436]: Allow Production Quote
                        - definition [ref=e437]:
                          - checkbox [ref=e440] [cursor=pointer]
                      - generic [ref=e441]:
                        - term [ref=e442]: Suppress Day/Rate Discount
                        - definition [ref=e443]:
                          - checkbox [disabled] [ref=e446]
                    - generic [ref=e447]:
                      - generic [ref=e448]:
                        - term [ref=e449]: Billing Type
                        - definition [ref=e450]:
                          - radiogroup [ref=e453]:
                            - generic [ref=e454]:
                              - radio "Master" [checked] [ref=e455]:
                                - img [ref=e456]
                              - generic [ref=e458]: Master
                              - radio "Direct" [ref=e459]
                              - generic [ref=e460]: Direct
                      - generic [ref=e461]:
                        - term [ref=e462]: Billing Way
                        - definition [ref=e463]:
                          - radiogroup [ref=e466]:
                            - generic [ref=e467]:
                              - radio "Event" [checked] [ref=e468]:
                                - img [ref=e469]
                              - generic [ref=e471]: Event
                              - radio "Daily" [ref=e472]
                              - generic [ref=e473]: Daily
                      - generic [ref=e474]:
                        - term [ref=e475]: Effective Date
                        - definition [ref=e476]:
                          - generic [ref=e478]:
                            - button "Open popover" [disabled]:
                              - img
                              - text: March 16th, 2007
                      - generic [ref=e479]:
                        - term [ref=e480]: Billing Cycle
                        - definition [ref=e481]:
                          - combobox [ref=e485] [cursor=pointer]:
                            - generic: Weekly
                            - img
                      - generic [ref=e486]:
                        - term [ref=e487]: Warehouse Billing
                        - definition [ref=e488]:
                          - checkbox [ref=e491] [cursor=pointer]
                      - generic [ref=e492]:
                        - term [ref=e493]: Oracle Product
                        - definition [ref=e494]:
                          - textbox [ref=e498]: PROD001
                      - generic [ref=e499]:
                        - term [ref=e500]: Oracle Department
                        - definition [ref=e501]:
                          - textbox [ref=e505]: "900"
                      - generic [ref=e506]:
                        - term [ref=e507]: Oracle Organization
                        - definition [ref=e508]:
                          - combobox [disabled] [ref=e512]:
                            - generic: "--Select--"
                            - img
                      - generic [ref=e513]:
                        - term [ref=e514]: Compass Integration
                        - definition [ref=e515]:
                          - checkbox [checked] [disabled] [ref=e518]:
                            - generic:
                              - img
                      - generic [ref=e519]:
                        - term [ref=e520]: Company Remit Tax / GST/HST / VAT Tax
                        - definition [ref=e521]:
                          - checkbox [checked] [ref=e524] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e525]:
                        - term [ref=e526]: Display Tax
                        - definition [ref=e527]:
                          - checkbox [checked] [disabled] [ref=e530]:
                            - generic:
                              - img
                      - generic [ref=e531]:
                        - term [ref=e532]: Comm Receiver
                        - definition [ref=e533]:
                          - checkbox [checked] [ref=e536] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e537]:
                        - term [ref=e538]: Enable IDC Billing
                        - definition [ref=e539]:
                          - checkbox [ref=e542] [cursor=pointer]
                      - generic [ref=e543]:
                        - term [ref=e544]: Skip Billing
                        - definition [ref=e545]:
                          - checkbox [ref=e548] [cursor=pointer]
                      - generic [ref=e549]:
                        - term [ref=e550]: Separate Master Bill Commission Invoice
                        - definition [ref=e551]:
                          - checkbox [ref=e554] [cursor=pointer]
                      - generic [ref=e555]:
                        - term [ref=e556]: Show SubRental
                        - definition [ref=e557]:
                          - checkbox [ref=e560] [cursor=pointer]
                      - generic [ref=e561]:
                        - term [ref=e562]: Inventory Only
                        - definition [ref=e563]:
                          - checkbox [ref=e566] [cursor=pointer]
                      - generic [ref=e567]:
                        - term [ref=e568]: Intercompany
                        - definition [ref=e569]:
                          - checkbox [checked] [ref=e572] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e573]:
                        - term [ref=e574]: Calculate Commission Tax
                        - definition [ref=e575]:
                          - checkbox [ref=e578] [cursor=pointer]
                      - generic [ref=e579]:
                        - term [ref=e580]: Can Create External Customer Link
                        - definition [ref=e581]:
                          - checkbox [ref=e584] [cursor=pointer]
                      - generic [ref=e585]:
                        - term [ref=e586]: Offsite Event Location
                        - definition [ref=e587]:
                          - checkbox [ref=e590] [cursor=pointer]
                      - generic [ref=e591]:
                        - term [ref=e592]: Exhibit Show Rate
                        - definition [ref=e593]:
                          - checkbox [ref=e596] [cursor=pointer]
                      - generic [ref=e597]:
                        - term [ref=e598]: Enable Job Costing
                        - definition [ref=e599]:
                          - checkbox [checked] [disabled] [ref=e602]:
                            - generic:
                              - img
                      - generic [ref=e603]:
                        - term [ref=e604]: Enable Discount Guidance
                        - definition [ref=e605]:
                          - checkbox [checked] [disabled] [ref=e608]:
                            - generic:
                              - img
                      - generic [ref=e609]:
                        - term [ref=e610]: Enable Proposal
                        - definition [ref=e611]:
                          - checkbox [checked] [ref=e614] [cursor=pointer]:
                            - generic:
                              - img
                      - generic [ref=e615]:
                        - term [ref=e616]: Product Organization
                        - definition [ref=e617]:
                          - combobox [ref=e620] [cursor=pointer]:
                            - generic: United States
                            - img
  - region "Notifications alt+T"
```

# Test source

```ts
  257 |   test('TC-LOC-LI-075: C&C% resets to 0 when Apply C&C Fee unchecked', async ({ locationLocalInfoPage, dependencyGate }) => {
  258 |     dependencyGate(['TC-LOC-LI-001']);
  259 |     await locationLocalInfoPage.checkCheckbox('chkApplyCablesConsumablesFee');
  260 |     await expect.poll(() => locationLocalInfoPage.getSpinState('spinCCPercentage').then(s => s.disabled), { timeout: 5_000 }).toBe(false);
  261 |     await locationLocalInfoPage.setSpinValue('spinCCPercentage', '5.00');
  262 |     await locationLocalInfoPage.uncheckCheckbox('chkApplyCablesConsumablesFee');
  263 |     await expect.poll(() => locationLocalInfoPage.getSpinState('spinCCPercentage').then(s => s.disabled), { timeout: 5_000 }).toBe(true);
  264 |     await expect.poll(() => locationLocalInfoPage.getSpinState('spinCCPercentage').then(s => parseFloat(s.value)), { timeout: 5_000 }).toBe(0);
  265 |     await locationLocalInfoPage.clickSave();
  266 |   });
  267 | 
  268 |  // : AllowResortTax=enabled for 1604. Same pattern as TC-075.
  269 |   test('TC-LOC-LI-076: ResortTax% resets to 0 when Allow Resort Tax unchecked', async ({ locationLocalInfoPage, dependencyGate }) => {
  270 |     dependencyGate(['TC-LOC-LI-001']);
  271 |     await locationLocalInfoPage.checkCheckbox('chkAllowResortTax');
  272 |     await expect.poll(() => locationLocalInfoPage.getSpinState('spinResortTaxPercentage').then(s => s.disabled), { timeout: 5_000 }).toBe(false);
  273 |     await locationLocalInfoPage.setSpinValue('spinResortTaxPercentage', '3.00');
  274 |     await locationLocalInfoPage.uncheckCheckbox('chkAllowResortTax');
  275 |     await expect.poll(() => locationLocalInfoPage.getSpinState('spinResortTaxPercentage').then(s => s.disabled), { timeout: 5_000 }).toBe(true);
  276 |     await expect.poll(() => locationLocalInfoPage.getSpinState('spinResortTaxPercentage').then(s => parseFloat(s.value)), { timeout: 5_000 }).toBe(0);
  277 |     await locationLocalInfoPage.clickSave();
  278 |   });
  279 | 
  280 |  // : IDC Billing persists after save+reload. 2 save+reload cycles.
  281 |   test('TC-LOC-LI-072: Enable IDC Billing persists after save+reload', async ({ locationLocalInfoPage, dependencyGate }) => {
  282 |     dependencyGate(['TC-LOC-LI-001']);
  283 |     test.setTimeout(120_000);
  284 |     await locationLocalInfoPage.checkCheckbox('chkEnableIDCBilling');
  285 |     await locationLocalInfoPage.clickSave();
  286 |     await locationLocalInfoPage.reloadAndNavigateToLocalInfo(OFFICE_NO);
  287 |     await locationLocalInfoPage.waitForFormReady('chkApplyLDW', 15_000);
  288 |     expect((await locationLocalInfoPage.getCheckboxState('chkEnableIDCBilling')).checked).toBe(true);
  289 |     await locationLocalInfoPage.uncheckCheckbox('chkEnableIDCBilling');
  290 |     await locationLocalInfoPage.clickSave();
  291 |   });
  292 | 
  293 |   for (const bc of LDW_BOUNDARIES) {
  294 |     test(`TC-LOC-LI: LDW% = ${bc.value} (${bc.label})`, async ({ locationLocalInfoPage, dependencyGate }) => {
  295 |       dependencyGate(['TC-LOC-LI-001']);
  296 |  // server now accepts LDW% changes for office 1604.
  297 |  // Valid cases do 2 save+confirmation+reload cycles (~20s each) -- 90s covers worst case.
  298 |       if (bc.valid) test.setTimeout(90_000);
  299 |       const result = await locationLocalInfoPage.testBoundaryValue(
  300 |         'spinLDWPercentage', bc.value, bc.valid, bc.errorContains, bc.restoreValue, OFFICE_NO, bc.restoreEnableKey,
  301 |       );
  302 |       expect(result.passed, result.detail).toBe(true);
  303 |     });
  304 |   }
  305 | 
  306 |   for (const tc of TEXT_FIELD_CONSTRAINTS) {
  307 |     test(`TC-LOC-LI: ${String(tc.key)} maxLength=${tc.maxLength}`, async ({ locationLocalInfoPage, dependencyGate }) => {
  308 |       dependencyGate(['TC-LOC-LI-001']);
  309 |       const result = await locationLocalInfoPage.testMaxLength(tc.key, tc.maxLength, tc.restoreValue);
  310 |       expect(result.passed, result.detail).toBe(true);
  311 |     });
  312 |   }
  313 | 
  314 |   test('TC-LOC-LI-064/065: Ticker Calc + Service Charge group -- toggle and restore', async ({ locationLocalInfoPage, dependencyGate }) => {
  315 |     dependencyGate(['TC-LOC-LI-001']);
  316 |     test.setTimeout(60_000);
  317 |     await locationLocalInfoPage.uncheckCheckbox('chkTickerCalc');
  318 |     expect(await locationLocalInfoPage.isSaveEnabled()).toBe(true);
  319 |     await locationLocalInfoPage.checkCheckbox('chkTickerCalc');
  320 |     await locationLocalInfoPage.checkCheckbox('chkShowServiceChargeAsAdministrativeFee');
  321 |     await locationLocalInfoPage.checkCheckbox('chkCalculateServiceChargeOnNetAmount');
  322 |     expect((await locationLocalInfoPage.getCheckboxState('chkShowServiceChargeAsAdministrativeFee')).checked).toBe(true);
  323 |     expect((await locationLocalInfoPage.getCheckboxState('chkCalculateServiceChargeOnNetAmount')).checked).toBe(true);
  324 |     await locationLocalInfoPage.uncheckCheckbox('chkShowServiceChargeAsAdministrativeFee');
  325 |     await locationLocalInfoPage.uncheckCheckbox('chkCalculateServiceChargeOnNetAmount');
  326 |     await locationLocalInfoPage.clickSave();
  327 |   });
  328 | 
  329 |  // Timeout: 90s -- 2 save+reload cycles (~20-25s each).
  330 |  // server now accepts Billing Type changes for office 1604.
  331 |   test('TC-LOC-LI-025: Billing Type radio -- Direct persists, restored to Master', async ({ locationLocalInfoPage, dependencyGate }) => {
  332 |     dependencyGate(['TC-LOC-LI-001']);
  333 |     test.setTimeout(90_000);
  334 |     expect(await locationLocalInfoPage.getBillingType()).toBe(LOCAL_INFO_TEST_VALUES.billingType);
  335 |     await locationLocalInfoPage.selectBillingType(LOCAL_INFO_TEST_VALUES.billingTypeDirect);
  336 |     expect(await locationLocalInfoPage.isSaveEnabled()).toBe(true);
  337 |     await locationLocalInfoPage.clickSave();
  338 |     await locationLocalInfoPage.reloadAndNavigateToLocalInfo(OFFICE_NO);
  339 |     expect(await locationLocalInfoPage.getBillingType()).toBe(LOCAL_INFO_TEST_VALUES.billingTypeDirect);
  340 |     await locationLocalInfoPage.selectBillingType(LOCAL_INFO_TEST_VALUES.billingType);
  341 |     await locationLocalInfoPage.clickSave();
  342 |   });
  343 | 
  344 |  // TC-021: valid short text persists; TC-029: standalone checkbox toggle + persist.
  345 |  // server now accepts persistent changes for office 1604.
  346 |   test('TC-LOC-LI-021/029: Oracle Product valid input + Calculate LDW Net Amount toggle persist', async ({ locationLocalInfoPage, dependencyGate }) => {
  347 |     dependencyGate(['TC-LOC-LI-001']);
  348 |     test.setTimeout(120_000);
  349 |     await locationLocalInfoPage.fillText('txtOracleProduct', LOCAL_INFO_TEST_VALUES.oracleProductTest);
  350 |     await locationLocalInfoPage.clickSave();
  351 |     await locationLocalInfoPage.reloadAndNavigateToLocalInfo(OFFICE_NO);
  352 |     expect(await locationLocalInfoPage.getTextValue('txtOracleProduct')).toBe(LOCAL_INFO_TEST_VALUES.oracleProductTest);
  353 |     await locationLocalInfoPage.fillText('txtOracleProduct', LOCAL_INFO_TEST_VALUES.oracleProductDefault);
  354 |     await locationLocalInfoPage.checkCheckbox('chkCalculateLDWonNetAmount');
  355 |     await locationLocalInfoPage.clickSave();
  356 |     await locationLocalInfoPage.reloadAndNavigateToLocalInfo(OFFICE_NO);
> 357 |     expect((await locationLocalInfoPage.getCheckboxState('chkCalculateLDWonNetAmount')).checked).toBe(true);
      |                                                                                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  358 |     await locationLocalInfoPage.uncheckCheckbox('chkCalculateLDWonNetAmount');
  359 |     await locationLocalInfoPage.clickSave();
  360 |   });
  361 | 
  362 |  // TC-026: always-disabled + conditionally-disabled states are preserved after a save cycle.
  363 |   test('TC-LOC-LI-026: Disabled checkbox states persist after save', async ({ locationLocalInfoPage, dependencyGate }) => {
  364 |     dependencyGate(['TC-LOC-LI-001']);
  365 |     const disabledResult = await locationLocalInfoPage.verifyCheckboxDisabledStates(
  366 |       Object.fromEntries(DISABLED_CHECKBOXES.map(k => [k, true])),
  367 |     );
  368 |     expect(disabledResult.allPassed, disabledResult.failures.join('; ')).toBe(true);
  369 |     const disabledCheckedResult = await locationLocalInfoPage.verifyCheckboxDefaults(DISABLED_CHECKBOX_STATES);
  370 |     expect(disabledCheckedResult.allPassed, disabledCheckedResult.failures.join('; ')).toBe(true);
  371 |   });
  372 | 
  373 |  // TC-045: all 5 interactive field types (checkbox, spinbutton, textbox, dropdown, radio) enable Save.
  374 |   test('TC-LOC-LI-045: All field types trigger Save enable', async ({ locationLocalInfoPage, dependencyGate }) => {
  375 |     dependencyGate(['TC-LOC-LI-001']);
  376 |  // radio -- already verified by TC-025 inline; just assert current save-disabled state
  377 |     expect(await locationLocalInfoPage.isSaveEnabled()).toBe(false);
  378 |  // checkbox
  379 |     await locationLocalInfoPage.toggleCheckbox('chkWarehouseBilling');
  380 |     expect(await locationLocalInfoPage.isSaveEnabled()).toBe(true);
  381 |     await locationLocalInfoPage.toggleCheckbox('chkWarehouseBilling');
  382 |  // spinbutton
  383 |     await locationLocalInfoPage.setSpinValue('spinLDWPercentage', '0.50');
  384 |     expect(await locationLocalInfoPage.isSaveEnabled()).toBe(true);
  385 |     await locationLocalInfoPage.setSpinValue('spinLDWPercentage', '0.04');
  386 |  // textbox
  387 |     await locationLocalInfoPage.fillText('txtOracleProduct', LOCAL_INFO_TEST_VALUES.oracleProductShort);
  388 |     expect(await locationLocalInfoPage.isSaveEnabled()).toBe(true);
  389 |     await locationLocalInfoPage.fillText('txtOracleProduct', LOCAL_INFO_TEST_VALUES.oracleProductDefault);
  390 |     await locationLocalInfoPage.clickSave();
  391 |   });
  392 | 
  393 |  // Checkbox label text verification (merged from location-local-info-validation.spec.ts).
  394 |   test('TC-LOC-LI-067: Checkbox labels display correct visible text', async ({ locationLocalInfoPage, dependencyGate }) => {
  395 |     dependencyGate(['TC-LOC-LI-001']);
  396 |     const failures: string[] = [];
  397 |     for (const item of CHECKBOX_LABEL_CASES) {
  398 |       const label = await locationLocalInfoPage.getCheckboxLabel(item.key);
  399 |       if (label !== item.expected) {
  400 |         failures.push(`${item.key}: expected "${item.expected}", got "${label}"`);
  401 |       }
  402 |     }
  403 |     expect(failures, failures.join('; ')).toHaveLength(0);
  404 |   });
  405 | 
  406 |  // Special chars in Oracle Product persist after save+reload; restore original value.
  407 |  // server now accepts persistent changes for office 1604.
  408 |   test('TC-LOC-LI-068: Oracle Product accepts special characters; value persists', async ({ locationLocalInfoPage, dependencyGate }) => {
  409 |     dependencyGate(['TC-LOC-LI-001']);
  410 |     test.setTimeout(90_000);
  411 |     const original = await locationLocalInfoPage.getTextValue('txtOracleProduct');
  412 |     await locationLocalInfoPage.fillText('txtOracleProduct', LOCAL_INFO_TEST_VALUES.specialChars);
  413 |     await locationLocalInfoPage.clickSave();
  414 |     await locationLocalInfoPage.reloadAndNavigateToLocalInfo(OFFICE_NO);
  415 |     expect(await locationLocalInfoPage.getTextValue('txtOracleProduct')).toBe(LOCAL_INFO_TEST_VALUES.specialChars);
  416 |     await locationLocalInfoPage.fillText('txtOracleProduct', original || LOCAL_INFO_TEST_VALUES.oracleProductDefault);
  417 |     await locationLocalInfoPage.clickSave();
  418 |   });
  419 | 
  420 |  // Alphanumeric value in Oracle Department persists after save+reload; restore original value.
  421 |  // server now accepts persistent changes for office 1604.
  422 |   test('TC-LOC-LI-069: Oracle Department alphanumeric value persists after save', async ({ locationLocalInfoPage, dependencyGate }) => {
  423 |     dependencyGate(['TC-LOC-LI-001']);
  424 |     test.setTimeout(90_000);
  425 |     const original = await locationLocalInfoPage.getTextValue('txtOracleDepartment');
  426 |     await locationLocalInfoPage.fillText('txtOracleDepartment', LOCAL_INFO_TEST_VALUES.oracleDeptTest);
  427 |     await locationLocalInfoPage.clickSave();
  428 |     await locationLocalInfoPage.reloadAndNavigateToLocalInfo(OFFICE_NO);
  429 |     expect(await locationLocalInfoPage.getTextValue('txtOracleDepartment')).toBe(LOCAL_INFO_TEST_VALUES.oracleDeptTest);
  430 |     await locationLocalInfoPage.fillText('txtOracleDepartment', original || LOCAL_INFO_TEST_VALUES.oracleDeptDefault);
  431 |     await locationLocalInfoPage.clickSave();
  432 |   });
  433 | 
  434 |  // MCP-verified : Skip Billing does NOT disable Oracle Product (checkbox is a billing flag only).
  435 |  // Rewritten to test actual behavior: toggle persists after save+reload.
  436 |   test('TC-LOC-LI-SKIP-BILLING: Skip Billing toggle persists after save+reload', async ({ locationLocalInfoPage, dependencyGate }) => {
  437 |     dependencyGate(['TC-LOC-LI-001']);
  438 |     test.setTimeout(120_000);
  439 |  // Wait for Angular form hydration before ANY interaction
  440 |     await locationLocalInfoPage.waitForFormReady('chkSkipBilling');
  441 |  // Read initial state
  442 |     const initial = await locationLocalInfoPage.getCheckboxState('chkSkipBilling');
  443 |     try {
  444 |  // Toggle to opposite state
  445 |       if (initial.checked) {
  446 |         await locationLocalInfoPage.uncheckCheckbox('chkSkipBilling');
  447 |       } else {
  448 |         await locationLocalInfoPage.checkCheckbox('chkSkipBilling');
  449 |       }
  450 |       await locationLocalInfoPage.clickSave();
  451 |       await locationLocalInfoPage.reloadAndNavigateToLocalInfo(OFFICE_NO);
  452 |       await locationLocalInfoPage.waitForFormReady('chkSkipBilling');
  453 |  // Verify toggled state persisted
  454 |       const afterToggle = await locationLocalInfoPage.getCheckboxState('chkSkipBilling');
  455 |       expect(afterToggle.checked).toBe(!initial.checked);
  456 |     } finally {
  457 |  // ALWAYS restore original state -- prevents pollution for LI-002 on next run
```