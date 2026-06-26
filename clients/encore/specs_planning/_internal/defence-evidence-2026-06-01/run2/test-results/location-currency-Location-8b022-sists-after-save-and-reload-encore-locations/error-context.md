# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\locations\location-currency.spec.ts >> Location Currency @locations @currency >> TC-LOC-CUR-021: Selected currency persists after save and reload
- Location: specs\locations\location-currency.spec.ts:212:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
                      - text: July 23rd, 1991
                  - generic [ref=e191]:
                    - generic [ref=e192]: Tax Mode
                    - combobox [ref=e194] [cursor=pointer]:
                      - generic: US
                      - img
                  - generic [ref=e195]:
                    - generic [ref=e196]: Country
                    - combobox [ref=e198] [cursor=pointer]:
                      - generic: United States
                      - img
                  - generic [ref=e199]:
                    - generic [ref=e200]: Region
                    - combobox [ref=e202] [cursor=pointer]:
                      - generic: Palm Springs
                      - img
                  - generic [ref=e203]:
                    - generic [ref=e204]: Servicing Branch Office
                    - combobox [ref=e205] [cursor=pointer]:
                      - generic: Select Servicing Branch Office
                      - img
                  - generic [ref=e206]:
                    - generic [ref=e207]: Line Of Business
                    - combobox [disabled] [ref=e209]:
                      - generic: Hotel Services Division
                      - img
                  - generic [ref=e210]:
                    - generic [ref=e211] [cursor=pointer]: Pay To Address
                    - generic [ref=e212]:
                      - textbox "Pay To Address" [disabled]: Encore
                  - generic [ref=e213]:
                    - generic [ref=e214]: Union
                    - checkbox "Union" [ref=e215] [cursor=pointer]
                  - generic [ref=e216]:
                    - generic [ref=e217]: eCommerce Active
                    - checkbox "eCommerce Active" [checked] [disabled] [ref=e218]:
                      - generic:
                        - img
                  - generic [ref=e219]:
                    - generic [ref=e220]: Enable Productions Orders
                    - checkbox "Enable Productions Orders" [checked] [disabled] [ref=e221]:
                      - generic:
                        - img
              - generic [ref=e223]:
                - tablist [ref=e224]:
                  - tab "Local Information" [ref=e225] [cursor=pointer]:
                    - generic [ref=e226]:
                      - img [ref=e227]
                      - text: Local Information
                  - tab "Currency" [active] [selected] [ref=e230] [cursor=pointer]:
                    - generic [ref=e231]:
                      - img [ref=e232]
                      - text: Currency
                  - tab "Pricing" [ref=e235] [cursor=pointer]:
                    - generic [ref=e236]:
                      - img [ref=e237]
                      - text: Pricing
                  - tab "Account and Address" [ref=e241] [cursor=pointer]:
                    - generic [ref=e242]:
                      - img [ref=e243]
                      - text: Account and Address
                  - tab "Legal" [ref=e246] [cursor=pointer]:
                    - generic [ref=e247]:
                      - img [ref=e248]
                      - text: Legal
                  - tab "Notes" [ref=e252] [cursor=pointer]:
                    - generic [ref=e253]:
                      - img [ref=e254]
                      - text: Notes
                  - tab "Shared Setup Locations" [ref=e257] [cursor=pointer]:
                    - generic [ref=e258]:
                      - img [ref=e259]
                      - text: Shared Setup Locations
                  - tab "Auto Add-On" [ref=e262] [cursor=pointer]:
                    - generic [ref=e263]:
                      - img [ref=e264]
                      - text: Auto Add-On
                - tabpanel "Currency" [ref=e269]:
                  - table [ref=e275]:
                    - rowgroup [ref=e276]:
                      - row "Currency Code Selected Is Default Merchant" [ref=e277]:
                        - columnheader "Currency Code" [ref=e278]
                        - columnheader "Selected" [ref=e279]
                        - columnheader "Is Default" [ref=e280]
                        - columnheader "Merchant" [ref=e281]
                    - rowgroup [ref=e282]:
                      - row "USD" [ref=e283]:
                        - cell "USD" [ref=e284]
                        - cell [ref=e285]:
                          - checkbox [checked] [ref=e286] [cursor=pointer]:
                            - generic:
                              - img
                          - checkbox [checked]
                        - cell [ref=e287]:
                          - checkbox [checked] [ref=e288] [cursor=pointer]:
                            - generic:
                              - img
                          - checkbox [checked]
                        - cell [ref=e289]:
                          - combobox [ref=e290] [cursor=pointer]:
                            - generic: 316370 - PSAV US/USD
                            - img
                          - combobox [ref=e291]
                      - row "CAD" [ref=e292]:
                        - cell "CAD" [ref=e293]
                        - cell [ref=e294]:
                          - checkbox [ref=e295] [cursor=pointer]
                          - checkbox
                        - cell [ref=e296]:
                          - checkbox [disabled] [ref=e297]
                          - checkbox [disabled]
                        - cell [ref=e298]:
                          - combobox [ref=e299] [cursor=pointer]:
                            - generic: 316446 - PSAV Canada/CAD
                            - img
                          - combobox [ref=e300]
                      - row "MXN" [ref=e301]:
                        - cell "MXN" [ref=e302]
                        - cell [ref=e303]:
                          - checkbox [ref=e304] [cursor=pointer]
                          - checkbox
                        - cell [ref=e305]:
                          - checkbox [disabled] [ref=e306]
                          - checkbox [disabled]
                        - cell [ref=e307]:
                          - combobox [ref=e308] [cursor=pointer]:
                            - img
                          - combobox [ref=e309]
  - region "Notifications alt+T"
```

# Test source

```ts
  124 |     await locationCurrencyPage.checkCheckbox('chkMXNSelected');
  125 |     expect((await locationCurrencyPage.getCheckboxState('chkMXNIsDefault')).disabled).toBe(false);
  126 |     await locationCurrencyPage.checkCheckbox('chkMXNIsDefault');
  127 |     expect((await locationCurrencyPage.getCheckboxState('chkMXNIsDefault')).checked).toBe(true);
  128 |     expect(await locationCurrencyPage.isMerchantNoMatchesFound('drpMXNMerchant')).toBe(true);
  129 |     await locationCurrencyPage.uncheckCheckbox('chkMXNSelected');
  130 |     await locationCurrencyPage.clickSave();
  131 |   });
  132 | 
  133 |   test('TC-LOC-CUR-011: Select merchant for CAD currency', async ({ locationCurrencyPage, dependencyGate }) => {
  134 |     dependencyGate(['TC-LOC-CUR-001']);
  135 |     await locationCurrencyPage.checkCheckbox('chkCADSelected');
  136 |     await locationCurrencyPage.selectMerchantOption('drpCADMerchant', MERCHANT_DATA.canada.display);
  137 |     expect(await locationCurrencyPage.getMerchantValue('drpCADMerchant')).toContain(MERCHANT_DATA.canada.id);
  138 |     await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
  139 |     await locationCurrencyPage.clickSave();
  140 |   });
  141 | 
  142 |   test('TC-LOC-CUR-012: Merchant value persists when currency is unselected', async ({ locationCurrencyPage, dependencyGate }) => {
  143 |     dependencyGate(['TC-LOC-CUR-001']);
  144 |     await locationCurrencyPage.checkCheckbox('chkCADSelected');
  145 |     await locationCurrencyPage.selectMerchantOption('drpCADMerchant', MERCHANT_DATA.canada.display);
  146 |     await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
  147 |     expect(await locationCurrencyPage.getMerchantValue('drpCADMerchant')).toContain(MERCHANT_DATA.canada.id);
  148 |     await locationCurrencyPage.clickSave();
  149 |   });
  150 | 
  151 |   test('TC-LOC-CUR-016: USD Merchant can be changed to alternate option', async ({ locationCurrencyPage, dependencyGate }) => {
  152 |     dependencyGate(['TC-LOC-CUR-001']);
  153 |     expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(MERCHANT_DATA.usd.id);
  154 |     await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', MERCHANT_DATA.bahamas.display);
  155 |     expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(MERCHANT_DATA.bahamas.id);
  156 |     await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', MERCHANT_DATA.usd.display);
  157 |     await locationCurrencyPage.clickSave();
  158 |   });
  159 | 
  160 |   test('TC-LOC-CUR-013: Validation -- at least one currency must be selected', async ({ locationCurrencyPage, dependencyGate }) => {
  161 |     dependencyGate(['TC-LOC-CUR-001']);
  162 |  // Uncheck USD (the only selected currency) -- app disables Save to enforce minimum-1-currency constraint
  163 |  // NOTE: unchecking USD also auto-unchecks USD IsDefault; both must be restored
  164 |     await locationCurrencyPage.uncheckCheckbox('chkUSDSelected');
  165 |     expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).disabled).toBe(true);
  166 |     const saveBlocked = !(await locationCurrencyPage.isSaveEnabled());
  167 |  // Full restore: re-select USD AND re-apply IsDefault so TC-014+ start clean
  168 |     await locationCurrencyPage.checkCheckbox('chkUSDSelected');
  169 |     await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
  170 |     await locationCurrencyPage.clickSave();
  171 |     expect(saveBlocked, 'Save must be blocked when no currency is selected').toBe(true);
  172 |   });
  173 | 
  174 |   test('TC-LOC-CUR-014: Save without default currency shows confirmation dialog (not an error)', async ({ locationCurrencyPage, dependencyGate }) => {
  175 |     dependencyGate(['TC-LOC-CUR-001']);
  176 |     await locationCurrencyPage.uncheckCheckbox('chkUSDIsDefault');
  177 |     const dialogType = await locationCurrencyPage.clickSaveAndCaptureDialog();
  178 |     expect(dialogType).toBe('save-changes');
  179 |     await locationCurrencyPage.cancelCurrentDialog();
  180 |     await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
  181 |     await locationCurrencyPage.clickSave();
  182 |   });
  183 | 
  184 |   test('TC-LOC-CUR-017: Multiple currencies selected without default -- save confirmation shown', async ({ locationCurrencyPage, dependencyGate }) => {
  185 |     dependencyGate(['TC-LOC-CUR-001']);
  186 |     await locationCurrencyPage.checkCheckbox('chkCADSelected');
  187 |     await locationCurrencyPage.uncheckCheckbox('chkUSDIsDefault');
  188 |     const dialogType = await locationCurrencyPage.clickSaveAndCaptureDialog();
  189 |     expect(dialogType).toBe('save-changes');
  190 |     await locationCurrencyPage.cancelCurrentDialog();
  191 |     await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
  192 |     await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
  193 |     await locationCurrencyPage.clickSave();
  194 |   });
  195 | 
  196 |   test('TC-LOC-CUR-020: All three currencies can be selected simultaneously', async ({ locationCurrencyPage, dependencyGate }) => {
  197 |     dependencyGate(['TC-LOC-CUR-001']);
  198 |     await locationCurrencyPage.checkCheckbox('chkCADSelected');
  199 |     await locationCurrencyPage.checkCheckbox('chkMXNSelected');
  200 |     expect((await locationCurrencyPage.getCheckboxState('chkUSDSelected')).checked).toBe(true);
  201 |     expect((await locationCurrencyPage.getCheckboxState('chkCADSelected')).checked).toBe(true);
  202 |     expect((await locationCurrencyPage.getCheckboxState('chkMXNSelected')).checked).toBe(true);
  203 |     await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
  204 |     await locationCurrencyPage.uncheckCheckbox('chkMXNSelected');
  205 |     await locationCurrencyPage.clickSave();
  206 |   });
  207 | 
  208 |  // ─────────────────────────────────────────────────────────────────────────────
  209 |  // ROUND-TRIP PERSISTENCE (P0)
  210 |  // ─────────────────────────────────────────────────────────────────────────────
  211 | 
  212 |   test('TC-LOC-CUR-021: Selected currency persists after save and reload', async ({ locationCurrencyPage, dependencyGate }) => {
  213 |     dependencyGate(['TC-LOC-CUR-001']);
  214 |     test.setTimeout(60_000);
  215 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  216 |  // Select CAD
  217 |     await locationCurrencyPage.checkCheckbox('chkCADSelected');
  218 |     expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
  219 |     const result = await locationCurrencyPage.clickSave();
  220 |     expect(result.success).toBe(true);
  221 |     expect(await locationCurrencyPage.isSaveEnabled()).toBe(false);
  222 |  // Reload and verify persistence
  223 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
> 224 |     expect((await locationCurrencyPage.getCheckboxState('chkCADSelected')).checked).toBe(true);
      |                                                                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  225 |  // Cleanup: uncheck CAD → save
  226 |     await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
  227 |     await locationCurrencyPage.clickSave();
  228 |   });
  229 | 
  230 |   test('TC-LOC-CUR-022: Merchant change persists after save and reload', async ({ locationCurrencyPage, dependencyGate }) => {
  231 |     dependencyGate(['TC-LOC-CUR-001']);
  232 |     test.setTimeout(60_000);
  233 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  234 |  // Change USD merchant to Bahamas
  235 |     await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', ALTERNATE_USD_MERCHANT.display);
  236 |     expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(ALTERNATE_USD_MERCHANT.id);
  237 |     expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
  238 |     const result = await locationCurrencyPage.clickSave();
  239 |     expect(result.success).toBe(true);
  240 |     expect(await locationCurrencyPage.isSaveEnabled()).toBe(false);
  241 |  // Reload and verify persistence
  242 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  243 |     expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(ALTERNATE_USD_MERCHANT.id);
  244 |  // Cleanup: restore original USD merchant → save
  245 |     await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', MERCHANT_DATA.usd.display);
  246 |     await locationCurrencyPage.clickSave();
  247 |   });
  248 | 
  249 |   test('TC-LOC-CUR-023: IsDefault change persists after save and reload (cascade)', async ({ locationCurrencyPage, dependencyGate }) => {
  250 |     dependencyGate(['TC-LOC-CUR-001']);
  251 |     test.setTimeout(60_000);
  252 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  253 |  // Select CAD + set as default (auto-unchecks USD IsDefault)
  254 |     await locationCurrencyPage.checkCheckbox('chkCADSelected');
  255 |     await locationCurrencyPage.checkCheckbox('chkCADIsDefault');
  256 |     expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).checked).toBe(false);
  257 |     expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
  258 |     const result = await locationCurrencyPage.clickSave();
  259 |     expect(result.success).toBe(true);
  260 |     expect(await locationCurrencyPage.isSaveEnabled()).toBe(false);
  261 |  // Reload and verify
  262 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  263 |     expect((await locationCurrencyPage.getCheckboxState('chkCADIsDefault')).checked).toBe(true);
  264 |     expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).checked).toBe(false);
  265 |  // Cleanup: uncheck CAD Selected (auto-disables CAD IsDefault) → restore USD IsDefault → save
  266 |     await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
  267 |     await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
  268 |     await locationCurrencyPage.clickSave();
  269 |   });
  270 | 
  271 |   test('TC-LOC-CUR-024: Combined changes persist after single save and reload', async ({ locationCurrencyPage, dependencyGate }) => {
  272 |     dependencyGate(['TC-LOC-CUR-001']);
  273 |     test.setTimeout(60_000);
  274 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  275 |  // Select CAD + change USD merchant — two changes in one save
  276 |     await locationCurrencyPage.checkCheckbox('chkCADSelected');
  277 |     await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', ALTERNATE_USD_MERCHANT.display);
  278 |     expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
  279 |     const result = await locationCurrencyPage.clickSave();
  280 |     expect(result.success).toBe(true);
  281 |     expect(await locationCurrencyPage.isSaveEnabled()).toBe(false);
  282 |  // Reload and verify both persisted
  283 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  284 |     expect((await locationCurrencyPage.getCheckboxState('chkCADSelected')).checked).toBe(true);
  285 |     expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(ALTERNATE_USD_MERCHANT.id);
  286 |  // Cleanup: uncheck CAD + restore USD merchant → save
  287 |     await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
  288 |     await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', MERCHANT_DATA.usd.display);
  289 |     await locationCurrencyPage.clickSave();
  290 |   });
  291 | 
  292 |  // ─────────────────────────────────────────────────────────────────────────────
  293 |  // STATE TRANSITION (P1-P2)
  294 |  // ─────────────────────────────────────────────────────────────────────────────
  295 | 
  296 |   test('TC-LOC-CUR-025: Cancel save discards changes — reload shows original state', async ({ locationCurrencyPage, dependencyGate }) => {
  297 |     dependencyGate(['TC-LOC-CUR-001']);
  298 |     test.setTimeout(60_000);
  299 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  300 |  // Make a change
  301 |     await locationCurrencyPage.checkCheckbox('chkCADSelected');
  302 |     expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
  303 |  // Click save but cancel the dialog
  304 |     const dialogType = await locationCurrencyPage.clickSaveAndCaptureDialog();
  305 |     expect(dialogType).toBe('save-changes');
  306 |     await locationCurrencyPage.cancelCurrentDialog();
  307 |  // Reload — change should NOT have persisted (cancel = discard)
  308 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  309 |     expect((await locationCurrencyPage.getCheckboxState('chkCADSelected')).checked).toBe(false);
  310 |  // No cleanup needed — cancel means nothing was saved
  311 |   });
  312 | 
  313 |   test('TC-LOC-CUR-026: Beforeunload dialog fires when form is dirty', async ({ locationCurrencyPage, dependencyGate }) => {
  314 |     dependencyGate(['TC-LOC-CUR-001']);
  315 |     test.setTimeout(60_000);
  316 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  317 |  // Make a dirty change
  318 |     await locationCurrencyPage.checkCheckbox('chkCADSelected');
  319 |     expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
  320 |  // Trigger reload — beforeunload should fire and dismiss keeps us on page
  321 |     const dialogFired = await locationCurrencyPage.triggerBeforeunloadAndStay();
  322 |     expect(dialogFired).toBe(true);
  323 |  // Cleanup: reload discards dirty state (nothing was saved)
  324 |     await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
```