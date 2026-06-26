# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\locations\location-account-address.spec.ts >> Location Account and Address @locations @account-address >> TC-LOC-ACC-020: Save changes persist after page reload
- Location: specs\locations\location-account-address.spec.ts:273:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "555-000-0001"
Received: ""

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
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
                      - text: February 2nd, 1992
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
                  - tab "Currency" [ref=e230] [cursor=pointer]:
                    - generic [ref=e231]:
                      - img [ref=e232]
                      - text: Currency
                  - tab "Pricing" [ref=e235] [cursor=pointer]:
                    - generic [ref=e236]:
                      - img [ref=e237]
                      - text: Pricing
                  - tab "Account and Address" [active] [selected] [ref=e241] [cursor=pointer]:
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
                - tabpanel "Account and Address" [ref=e269]:
                  - generic [ref=e272]:
                    - generic [ref=e273]:
                      - generic [ref=e275]: Venue/Branch Account
                      - generic [ref=e277]:
                        - generic [ref=e278]:
                          - term [ref=e279]:
                            - button "Name" [ref=e281] [cursor=pointer]
                          - definition [ref=e282]:
                            - generic [ref=e286]:
                              - textbox [disabled]: Parker Palm Springs
                        - generic [ref=e287]:
                          - term [ref=e288]:
                            - button "Address" [ref=e290] [cursor=pointer]
                          - definition [ref=e291]: 8899 Beverly Blvd Ste 412
                        - generic [ref=e292]:
                          - term
                          - definition [ref=e293]: WEST HOLLYWOOD
                        - generic [ref=e294]:
                          - term
                          - definition [ref=e295]: CA
                        - generic [ref=e296]:
                          - term
                          - definition [ref=e297]: "90048"
                        - generic [ref=e298]:
                          - term
                          - definition [ref=e299]: United States
                        - generic [ref=e300]:
                          - term [ref=e301]: Phone 1
                          - definition [ref=e302]:
                            - textbox [ref=e306]: 760-883-1957
                        - generic [ref=e307]:
                          - term [ref=e308]: Phone 2
                          - definition [ref=e309]:
                            - textbox [ref=e312]
                    - generic [ref=e313]:
                      - generic [ref=e315]: Master Bill To Address
                      - generic [ref=e317]:
                        - generic [ref=e318]:
                          - term [ref=e319]:
                            - button "Address" [ref=e321] [cursor=pointer]
                          - definition [ref=e322]:
                            - generic [ref=e326]: 8899 Beverly Blvd Ste 412
                        - generic [ref=e327]:
                          - term
                          - definition [ref=e328]: WEST HOLLYWOOD
                        - generic [ref=e329]:
                          - term
                          - definition [ref=e330]: CA
                        - generic [ref=e331]:
                          - term
                          - definition [ref=e332]: "90048"
                        - generic [ref=e333]:
                          - term
                          - definition [ref=e334]: United States
  - region "Notifications alt+T"
```

# Test source

```ts
  180 |     await locationAccountAddressPage.cancelAddressDialog();
  181 |   });
  182 | 
  183 |   test('TC-LOC-ACC-010: Address dialog search bar filters results client-side', async ({ locationAccountAddressPage, dependencyGate }) => {
  184 |     dependencyGate(['TC-LOC-ACC-001']);
  185 |     await locationAccountAddressPage.openVenueAddressDialog();
  186 |     const initialRows = await locationAccountAddressPage.getAddressRowCount();
  187 |     await locationAccountAddressPage.searchAddress(ADDRESS_SEARCH.filterTerm);
  188 |     const filteredRows = await locationAccountAddressPage.getAddressRowCount();
  189 |     expect(filteredRows).toBeLessThan(initialRows);
  190 |     expect(await locationAccountAddressPage.addressResultsContain(ADDRESS_SEARCH.expectedMatch)).toBe(true);
  191 |     await locationAccountAddressPage.cancelAddressDialog();
  192 |   });
  193 | 
  194 |   test('TC-LOC-ACC-011: Address dialog Save button always disabled', async ({ locationAccountAddressPage, dependencyGate }) => {
  195 |     dependencyGate(['TC-LOC-ACC-001']);
  196 |     await locationAccountAddressPage.openVenueAddressDialog();
  197 |     expect(await locationAccountAddressPage.isAddressSaveDisabled()).toBe(true);
  198 |     await locationAccountAddressPage.checkAddressFirstRow();
  199 |     expect(await locationAccountAddressPage.isAddressSaveDisabled()).toBe(true);
  200 |     await locationAccountAddressPage.cancelAddressDialog();
  201 |   });
  202 | 
  203 |   test('TC-LOC-ACC-012: Master Address button opens same Select Customer Address dialog', async ({ locationAccountAddressPage, dependencyGate }) => {
  204 |     dependencyGate(['TC-LOC-ACC-001']);
  205 |     await locationAccountAddressPage.openMasterAddressDialog();
  206 |     expect(await locationAccountAddressPage.isAddressDialogVisible()).toBe(true);
  207 |     expect(await locationAccountAddressPage.getAddressRowCount()).toBe(ADDRESS_SEARCH.totalRows);
  208 |     await locationAccountAddressPage.cancelAddressDialog();
  209 |   });
  210 | 
  211 |   test('TC-LOC-ACC-013: Venue address display fields are read-only', async ({ locationAccountAddressPage, dependencyGate }) => {
  212 |     dependencyGate(['TC-LOC-ACC-001']);
  213 |     for (const field of VENUE_DISPLAY_FIELDS) {
  214 |       expect(await locationAccountAddressPage.isDisplayFieldReadOnly('Venue/Branch Account', field.expected),
  215 |         `${field.label} should be read-only`).toBe(true);
  216 |     }
  217 |   });
  218 | 
  219 |   test('TC-LOC-ACC-014: Master address display fields are read-only', async ({ locationAccountAddressPage, dependencyGate }) => {
  220 |     dependencyGate(['TC-LOC-ACC-001']);
  221 |     for (const field of MASTER_DISPLAY_FIELDS) {
  222 |       expect(await locationAccountAddressPage.isDisplayFieldReadOnly('Master Bill To Address', field.expected),
  223 |         `${field.label} should be read-only`).toBe(true);
  224 |     }
  225 |   });
  226 | 
  227 |   test('TC-LOC-ACC-015: Phone 1 required field shows inline error when cleared', async ({ locationAccountAddressPage, dependencyGate }) => {
  228 |     dependencyGate(['TC-LOC-ACC-001']);
  229 |     await locationAccountAddressPage.clearPhone1AndBlur();
  230 |     expect(await locationAccountAddressPage.isPhone1Invalid()).toBe(true);
  231 |     expect(await locationAccountAddressPage.isPhone1ErrorIconVisible()).toBe(true);
  232 |  // Restore baseline
  233 |     await locationAccountAddressPage.fillPhone1(PHONE1_BASELINE);
  234 |     await locationAccountAddressPage.clickSave();
  235 |   });
  236 | 
  237 |   test('TC-LOC-ACC-016: Phone 2 optional, no validation error when empty', async ({ locationAccountAddressPage, dependencyGate }) => {
  238 |     dependencyGate(['TC-LOC-ACC-001']);
  239 |     expect(await locationAccountAddressPage.isPhone2Invalid()).toBe(false);
  240 |   });
  241 | 
  242 |   test('TC-LOC-ACC-017: Save button disabled when no pending changes', async ({ locationAccountAddressPage, dependencyGate }) => {
  243 |     dependencyGate(['TC-LOC-ACC-001']);
  244 |     expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
  245 |   });
  246 | 
  247 |   test('TC-LOC-ACC-018: Save button enables on field change', async ({ locationAccountAddressPage, dependencyGate }) => {
  248 |     dependencyGate(['TC-LOC-ACC-001']);
  249 |     test.setTimeout(60_000);
  250 |  // Ensure Phone 2 baseline is clean (may be dirty from prior failed run)
  251 |     const currentPhone2 = await locationAccountAddressPage.getPhone2Value();
  252 |     if (currentPhone2) {
  253 |       await locationAccountAddressPage.fillPhone2('');
  254 |       await locationAccountAddressPage.clickSave();
  255 |  // Reload to ensure Angular form is fully re-initialized before testing fill → save behavior
  256 |       await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
  257 |     }
  258 |     expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
  259 |     await locationAccountAddressPage.fillPhone2(ACCOUNT_TEST_PHONE);
  260 |     await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  261 |  // Discard changes
  262 |     await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
  263 |   });
  264 | 
  265 |   test('TC-LOC-ACC-019: Save flow -- confirmation dialog then success', async ({ locationAccountAddressPage, dependencyGate }) => {
  266 |     dependencyGate(['TC-LOC-ACC-001']);
  267 |     await locationAccountAddressPage.fillPhone2(TEST_PHONE2_VALUE);
  268 |     await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  269 |     await locationAccountAddressPage.clickSave();
  270 |     expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
  271 |   });
  272 | 
  273 |   test('TC-LOC-ACC-020: Save changes persist after page reload', async ({ locationAccountAddressPage, dependencyGate }) => {
  274 |     dependencyGate(['TC-LOC-ACC-001']);
  275 |     test.setTimeout(60_000);
  276 |     expect(await locationAccountAddressPage.getPhone2Value()).toBe(TEST_PHONE2_VALUE);
  277 |     await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
  278 |  // Defensive poll: reloadAndNavigate now awaits getLocationDetail hydration (where phone2
  279 |  // binds), so phone2 should be populated by the time we read. Poll retained as safety net.
> 280 |     await expect.poll(() => locationAccountAddressPage.getPhone2Value(), { timeout: 5_000 }).toBe(TEST_PHONE2_VALUE);
      |                                                                                              ^ Error: expect(received).toBe(expected) // Object.is equality
  281 |     expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
  282 |  // Cleanup: restore Phone 2 to empty baseline
  283 |     await locationAccountAddressPage.fillPhone2('');
  284 |     await locationAccountAddressPage.clickSave();
  285 |   });
  286 | 
  287 |  // ─── Account & Address audit additions ─────────────────────────────────────
  288 |  // TC-021 DROPPED: live verification proved Phone 1 is account-linked.
  289 |  // Save completes but value always reverts to account phone on reload. NOT-AUTOMATABLE.
  290 | 
  291 |   test('TC-LOC-ACC-022: Cancel Save dialog discards save without persisting', async ({ locationAccountAddressPage, dependencyGate }) => {
  292 |     dependencyGate(['TC-LOC-ACC-001']);
  293 |     test.setTimeout(60_000);
  294 |     await locationAccountAddressPage.fillPhone2(ACCOUNT_TEST_PHONE);
  295 |     await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  296 |  // Click Save → Cancel in confirmation dialog
  297 |     await locationAccountAddressPage.openSaveDialog();
  298 |     await locationAccountAddressPage.cancelSaveDialog();
  299 |  // Verify: Save still enabled (changes not committed), value still present
  300 |     expect(await locationAccountAddressPage.isSaveEnabled()).toBe(true);
  301 |     expect(await locationAccountAddressPage.getPhone2Value()).toBe(ACCOUNT_TEST_PHONE);
  302 |  // Discard changes via reload
  303 |     await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
  304 |   });
  305 | 
  306 |   test('TC-LOC-ACC-023: Phone 1 cleared shows invalid state and error icon', async ({ locationAccountAddressPage, dependencyGate }) => {
  307 |     dependencyGate(['TC-LOC-ACC-001']);
  308 |  // MCP-verified : clearing Phone 1 shows aria-invalid=true but Save stays enabled.
  309 |  // This TC verifies validation indicators; Save blocking is NOT app behavior.
  310 |     await locationAccountAddressPage.clearPhone1AndBlur();
  311 |     expect(await locationAccountAddressPage.isPhone1Invalid()).toBe(true);
  312 |     expect(await locationAccountAddressPage.isPhone1ErrorIconVisible()).toBe(true);
  313 |  // Save remains enabled even with invalid field (Angular doesn't block)
  314 |     expect(await locationAccountAddressPage.isSaveEnabled()).toBe(true);
  315 |  // Discard — reload to restore server-saved baseline
  316 |     await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
  317 |   });
  318 | 
  319 |   test('TC-LOC-ACC-025: Account List Address filter returns matching results', async ({ locationAccountAddressPage, dependencyGate }) => {
  320 |     dependencyGate(['TC-LOC-ACC-001']);
  321 |     test.setTimeout(60_000);
  322 |     await locationAccountAddressPage.openAccountListDialog();
  323 |     await locationAccountAddressPage.searchAccountByAddress(ACCOUNT_LIST_FILTERS.address);
  324 |     await expect.poll(
  325 |       () => locationAccountAddressPage.accountListResultsContain(ACCOUNT_LIST_FILTERS.addressExpected),
  326 |       { timeout: 20_000, message: 'Address filter should return matching results' }
  327 |     ).toBe(true);
  328 |     await locationAccountAddressPage.cancelAccountListDialog();
  329 |   });
  330 | 
  331 |   test('TC-LOC-ACC-026: Account List City filter returns matching results', async ({ locationAccountAddressPage, dependencyGate }) => {
  332 |     dependencyGate(['TC-LOC-ACC-001']);
  333 |     test.setTimeout(60_000);
  334 |     await locationAccountAddressPage.openAccountListDialog();
  335 |     await locationAccountAddressPage.searchAccountByCity(ACCOUNT_LIST_FILTERS.city);
  336 |     await expect.poll(
  337 |       () => locationAccountAddressPage.accountListResultsContain(ACCOUNT_LIST_FILTERS.cityExpected),
  338 |       { timeout: 20_000, message: 'City filter should return matching results' }
  339 |     ).toBe(true);
  340 |     await locationAccountAddressPage.cancelAccountListDialog();
  341 |   });
  342 | 
  343 |   test('TC-LOC-ACC-027: Address selection changes venue display fields', async ({ locationAccountAddressPage, dependencyGate }) => {
  344 |     dependencyGate(['TC-LOC-ACC-001']);
  345 |     test.setTimeout(60_000);
  346 |  // MCP-verified : address selection updates display but does NOT persist through save+reload.
  347 |  // Angular form model doesn't serialize the new address. This TC tests E2E display change only.
  348 |  // Verify starting state
  349 |     await expect.poll(() => locationAccountAddressPage.getVenueCityText(), { timeout: 5_000 }).toBe(ORIGINAL_ADDRESS.city);
  350 |  // Select alternate address
  351 |     await locationAccountAddressPage.openVenueAddressDialog();
  352 |     await locationAccountAddressPage.selectAddressRow(ALT_ADDRESS.address1);
  353 |  // Verify display changed
  354 |     await expect.poll(() => locationAccountAddressPage.getVenueCityText(), { timeout: 5_000 }).toBe(ALT_ADDRESS.city);
  355 |  // Save enables (form dirty from selection)
  356 |     await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  357 |  // Discard: reload restores original
  358 |     await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
  359 |     await expect.poll(() => locationAccountAddressPage.getVenueCityText(), { timeout: 10_000 }).toBe(ORIGINAL_ADDRESS.city);
  360 |   });
  361 | 
  362 |   test('TC-LOC-ACC-028: Account selection changes venue name and persists', async ({ locationAccountAddressPage, dependencyGate }) => {
  363 |     dependencyGate(['TC-LOC-ACC-001']);
  364 |     test.setTimeout(120_000);
  365 |     const originalName = await locationAccountAddressPage.getVenueNameValue();
  366 |     try {
  367 |  // Open Account List → search for current account → select (re-selecting same triggers dirty)
  368 |       await locationAccountAddressPage.openAccountListDialog();
  369 |       await locationAccountAddressPage.searchAccountByName(ACCOUNT_SEARCH.term);
  370 |       await expect.poll(
  371 |         () => locationAccountAddressPage.accountListResultsContain(ACCOUNT_SEARCH.expectedResult),
  372 |         { timeout: 20_000 }
  373 |       ).toBe(true);
  374 |       await locationAccountAddressPage.selectAccountListFirstRow();
  375 |  // Verify form dirty → Save enabled
  376 |       await expect.poll(() => locationAccountAddressPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  377 |  // Save and verify persistence
  378 |       await locationAccountAddressPage.clickSave();
  379 |       expect(await locationAccountAddressPage.isSaveEnabled()).toBe(false);
  380 |       await locationAccountAddressPage.reloadAndNavigate(OFFICE_NO);
```