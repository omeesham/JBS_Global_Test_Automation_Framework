# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\locations\location-account-address.spec.ts >> Location Account and Address @locations @account-address >> TC-LOC-ACC-004: Account List search returns results
- Location: specs\locations\location-account-address.spec.ts:120:7

# Error details

```
TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
```

# Page snapshot

```yaml
- generic:
  - alert
  - generic:
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - list:
                - listitem:
                  - button:
                    - generic:
                      - generic: "1604"
                    - generic:
                      - generic: Parker Palm Springs
                      - img
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - list:
                        - listitem:
                          - link:
                            - /url: /navigator/locations/1604/home
                            - img
                            - generic: Home
                        - listitem:
                          - link:
                            - /url: /navigator/locations/1604/inbox
                            - img
                            - generic: Inbox
                        - listitem:
                          - button:
                            - img
                            - generic: Actions
                            - img
                        - listitem:
                          - button:
                            - img
                            - generic: Commissions
                            - img
                        - listitem:
                          - button:
                            - img
                            - generic: Tax
                            - img
                        - listitem:
                          - button:
                            - img
                            - generic: Setup
                            - img
                        - listitem:
                          - button:
                            - img
                            - generic: Studio
                            - img
                    - generic:
                      - generic: Search
                      - generic:
                        - list:
                          - listitem:
                            - button [disabled]:
                              - img
                              - generic: Order Search
                          - listitem:
                            - link:
                              - /url: /navigator/locations/1604/fulfillments
                              - img
                              - generic: Job Search
                          - listitem:
                            - link:
                              - /url: /navigator/locations/1604/assets
                              - img
                              - generic: Asset Search
                          - listitem:
                            - link:
                              - /url: /navigator/locations/1604/customers
                              - img
                              - generic: Customer Search
                          - listitem:
                            - button [disabled]:
                              - img
                              - generic: DRO Search
                          - listitem:
                            - button [disabled]:
                              - img
                              - generic: Payment Search
                          - listitem:
                            - link:
                              - /url: /navigator/locations/1604/products
                              - img
                              - generic: Item Search
                          - listitem:
                            - button [disabled]:
                              - img
                              - generic: ECT Search
                          - listitem:
                            - button [disabled]:
                              - img
                              - generic: Event Agendas
                    - generic:
                      - list:
                        - listitem:
                          - button:
                            - img
                            - generic: Navigator Assistant
            - generic:
              - generic:
                - list:
                  - listitem:
                    - button:
                      - generic:
                        - generic: PC
                      - generic:
                        - generic: prd click auto
                      - img
            - button
      - main:
        - generic:
          - generic:
            - generic:
              - generic:
                - generic:
                  - button:
                    - img
                  - generic:
                    - generic:
                      - generic:
                        - heading [level=1]: Location Settings
                      - button:
                        - img
              - generic:
                - generic:
                  - generic:
                    - tablist:
                      - tab [selected]:
                        - generic:
                          - img
                          - text: Basic Information
                      - tab:
                        - generic:
                          - img
                          - text: Location Management History
                    - tabpanel:
                      - generic:
                        - generic:
                          - generic:
                            - generic:
                              - generic:
                                - generic:
                                  - generic:
                                    - generic:
                                      - generic:
                                        - generic:
                                          - button [disabled]: Save
                                        - generic:
                                          - generic:
                                            - generic: Office
                                            - textbox [disabled]:
                                              - /placeholder: No office available
                                              - text: "1604"
                                          - generic:
                                            - generic: Local Office
                                            - generic:
                                              - textbox [disabled]:
                                                - /placeholder: Local Office
                                                - text: "1604"
                                          - generic:
                                            - generic: Local Office Name
                                            - generic:
                                              - textbox: Parker Palm Springs
                                          - generic:
                                            - generic: Active
                                            - checkbox [checked]:
                                              - generic:
                                                - img
                                          - generic:
                                            - generic: Live Date
                                            - button:
                                              - img
                                              - text: February 3rd, 1992
                                          - generic:
                                            - generic: Tax Mode
                                            - generic:
                                              - combobox:
                                                - generic: US
                                                - img
                                          - generic:
                                            - generic: Country
                                            - generic:
                                              - combobox:
                                                - generic: United States
                                                - img
                                          - generic:
                                            - generic: Region
                                            - generic:
                                              - combobox:
                                                - generic: Palm Springs
                                                - img
                                          - generic:
                                            - generic: Servicing Branch Office
                                            - combobox:
                                              - generic: Select Servicing Branch Office
                                              - img
                                          - generic:
                                            - generic: Line Of Business
                                            - generic:
                                              - combobox [disabled]:
                                                - generic: Hotel Services Division
                                                - img
                                          - generic:
                                            - generic: Pay To Address
                                            - generic:
                                              - textbox [disabled]: Encore
                                          - generic:
                                            - generic: Union
                                            - checkbox
                                          - generic:
                                            - generic: eCommerce Active
                                            - checkbox [checked] [disabled]:
                                              - generic:
                                                - img
                                          - generic:
                                            - generic: Enable Productions Orders
                                            - checkbox [checked] [disabled]:
                                              - generic:
                                                - img
                        - generic:
                          - generic:
                            - tablist:
                              - tab:
                                - generic:
                                  - img
                                  - text: Local Information
                              - tab:
                                - generic:
                                  - img
                                  - text: Currency
                              - tab:
                                - generic:
                                  - img
                                  - text: Pricing
                              - tab [selected]:
                                - generic:
                                  - img
                                  - text: Account and Address
                              - tab:
                                - generic:
                                  - img
                                  - text: Legal
                              - tab:
                                - generic:
                                  - img
                                  - text: Notes
                              - tab:
                                - generic:
                                  - img
                                  - text: Shared Setup Locations
                              - tab:
                                - generic:
                                  - img
                                  - text: Auto Add-On
                            - generic:
                              - generic:
                                - generic:
                                  - tabpanel:
                                    - generic:
                                      - generic:
                                        - generic:
                                          - generic:
                                            - generic:
                                              - generic: Venue/Branch Account
                                            - generic:
                                              - generic:
                                                - generic:
                                                  - term:
                                                    - generic:
                                                      - button: Name
                                                  - definition:
                                                    - generic:
                                                      - generic:
                                                        - generic:
                                                          - generic:
                                                            - textbox [disabled]: Parker Palm Springs
                                                - generic:
                                                  - term:
                                                    - generic:
                                                      - button: Address
                                                  - definition: 8899 Beverly Blvd Ste 412
                                                - generic:
                                                  - definition: WEST HOLLYWOOD
                                                - generic:
                                                  - definition: CA
                                                - generic:
                                                  - definition: "90048"
                                                - generic:
                                                  - definition: United States
                                                - generic:
                                                  - term: Phone 1
                                                  - definition:
                                                    - generic:
                                                      - generic:
                                                        - generic:
                                                          - textbox: 760-883-1957
                                                - generic:
                                                  - term: Phone 2
                                                  - definition:
                                                    - generic:
                                                      - generic:
                                                        - textbox
                                          - generic:
                                            - generic:
                                              - generic: Master Bill To Address
                                            - generic:
                                              - generic:
                                                - generic:
                                                  - term:
                                                    - generic:
                                                      - button: Address
                                                  - definition:
                                                    - generic:
                                                      - generic:
                                                        - generic:
                                                          - generic: 8899 Beverly Blvd Ste 412
                                                - generic:
                                                  - definition: WEST HOLLYWOOD
                                                - generic:
                                                  - definition: CA
                                                - generic:
                                                  - definition: "90048"
                                                - generic:
                                                  - definition: United States
  - region "Notifications alt+T"
  - dialog "Account List" [ref=e2]:
    - generic [ref=e3]:
      - heading "Account List" [level=2] [ref=e4]
      - paragraph [ref=e5]
    - generic [ref=e6]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - term [ref=e11]:
            - generic [ref=e12]: Account Number
          - definition [ref=e13]:
            - textbox "Account Number" [ref=e14]
        - generic [ref=e15]:
          - term [ref=e16]:
            - generic [ref=e17]: Account Name
          - definition [ref=e18]:
            - textbox "Account Name" [ref=e19]: Parker
        - generic [ref=e20]:
          - term [ref=e21]:
            - generic [ref=e22]: Address
          - definition [ref=e23]:
            - textbox "Address" [ref=e24]
        - generic [ref=e25]:
          - term [ref=e26]:
            - generic [ref=e27]: City
          - definition [ref=e28]:
            - textbox "City" [ref=e29]
        - generic [ref=e30]:
          - term [ref=e31]:
            - generic [ref=e32]: State
          - definition [ref=e33]:
            - combobox [ref=e34] [cursor=pointer]:
              - generic: Select State
              - img
            - combobox [ref=e35]
        - generic [ref=e36]:
          - term [ref=e37]:
            - generic [ref=e38]: Country
          - definition [ref=e39]:
            - combobox [ref=e40] [cursor=pointer]:
              - generic: Select Country
              - img
            - combobox [ref=e41]
        - generic [ref=e42]:
          - button "Search" [active] [ref=e43] [cursor=pointer]
          - button "Reset" [ref=e44] [cursor=pointer]
      - table [ref=e50]:
        - rowgroup [ref=e51]:
          - row [ref=e52]:
            - columnheader [ref=e53]
            - columnheader [ref=e55]
            - columnheader [ref=e57]
            - columnheader [ref=e59]
            - columnheader [ref=e61]
            - columnheader [ref=e63]
            - columnheader [ref=e65]
        - rowgroup [ref=e67]:
          - row [ref=e68]:
            - cell [ref=e69]
            - cell [ref=e71]
            - cell [ref=e73]
            - cell [ref=e75]
            - cell [ref=e77]
            - cell [ref=e79]
            - cell [ref=e81]
          - row [ref=e83]:
            - cell [ref=e84]
            - cell [ref=e86]
            - cell [ref=e88]
            - cell [ref=e90]
            - cell [ref=e92]
            - cell [ref=e94]
            - cell [ref=e96]
          - row [ref=e98]:
            - cell [ref=e99]
            - cell [ref=e101]
            - cell [ref=e103]
            - cell [ref=e105]
            - cell [ref=e107]
            - cell [ref=e109]
            - cell [ref=e111]
          - row [ref=e113]:
            - cell [ref=e114]
            - cell [ref=e116]
            - cell [ref=e118]
            - cell [ref=e120]
            - cell [ref=e122]
            - cell [ref=e124]
            - cell [ref=e126]
          - row [ref=e128]:
            - cell [ref=e129]
            - cell [ref=e131]
            - cell [ref=e133]
            - cell [ref=e135]
            - cell [ref=e137]
            - cell [ref=e139]
            - cell [ref=e141]
          - row [ref=e143]:
            - cell [ref=e144]
            - cell [ref=e146]
            - cell [ref=e148]
            - cell [ref=e150]
            - cell [ref=e152]
            - cell [ref=e154]
            - cell [ref=e156]
          - row [ref=e158]:
            - cell [ref=e159]
            - cell [ref=e161]
            - cell [ref=e163]
            - cell [ref=e165]
            - cell [ref=e167]
            - cell [ref=e169]
            - cell [ref=e171]
          - row [ref=e173]:
            - cell [ref=e174]
            - cell [ref=e176]
            - cell [ref=e178]
            - cell [ref=e180]
            - cell [ref=e182]
            - cell [ref=e184]
            - cell [ref=e186]
          - row [ref=e188]:
            - cell [ref=e189]
            - cell [ref=e191]
            - cell [ref=e193]
            - cell [ref=e195]
            - cell [ref=e197]
            - cell [ref=e199]
            - cell [ref=e201]
          - row [ref=e203]:
            - cell [ref=e204]
            - cell [ref=e206]
            - cell [ref=e208]
            - cell [ref=e210]
            - cell [ref=e212]
            - cell [ref=e214]
            - cell [ref=e216]
    - generic [ref=e219]:
      - button "Select" [disabled]
      - button "Cancel" [ref=e220] [cursor=pointer]
    - button "Close" [ref=e221] [cursor=pointer]:
      - img
      - generic [ref=e222]: Close
```

# Test source

```ts
  174 |     if (count === 0) return false;
  175 |     const inputs = await dd.locator('input, textarea, [contenteditable="true"]').count();
  176 |     return inputs === 0;
  177 |   }
  178 | 
  179 |  // ─────────────────────────────────────────────────────────────────────────────
  180 |  // ACCOUNT LIST DIALOG
  181 |  // ─────────────────────────────────────────────────────────────────────────────
  182 | 
  183 |  /** Open Account List dialog by clicking the Name button. */
  184 |   async openAccountListDialog(): Promise<void> {
  185 |     await this.clickWithRetry('btnAccName');
  186 |     await this.waitForElement('dlgAccountList', 10_000);
  187 |     Log.info('[OK] Account List dialog opened');
  188 |   }
  189 | 
  190 |  /** Check if Account List dialog is visible. */
  191 |   async isAccountListDialogVisible(): Promise<boolean> {
  192 |     return this.isElementVisible('dlgAccountList', 3_000);
  193 |   }
  194 | 
  195 |  /** Fill account name filter and click Search. Waits for results to render with actual content. */
  196 |   async searchAccountByName(name: string): Promise<void> {
  197 |     await this.searchAccountByFilter('txtAccListAccountName', name, 'name');
  198 |   }
  199 | 
  200 |  /** Check if the Select button in Account List dialog is disabled. */
  201 |   async isAccountListSelectDisabled(): Promise<boolean> {
  202 |     return this.getElement('btnAccListSelect').isDisabled();
  203 |   }
  204 | 
  205 |  /** Click the first row checkbox in Account List results. */
  206 |   async checkAccountListFirstRow(): Promise<void> {
  207 |     await this.clickWithRetry('chkAccListRowSelect');
  208 |     Log.info('Checked first row in Account List');
  209 |   }
  210 | 
  211 |  /** Click Cancel in Account List dialog. */
  212 |   async cancelAccountListDialog(): Promise<void> {
  213 |     await this.clickWithRetry('btnAccListCancel');
  214 |     await this.getElement('dlgAccountList').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  215 |     Log.info('Cancelled Account List dialog');
  216 |   }
  217 | 
  218 |  /** Click Reset in Account List dialog. */
  219 |   async resetAccountListSearch(): Promise<void> {
  220 |     await this.clickWithRetry('btnAccListReset');
  221 |     Log.info('Reset Account List search');
  222 |   }
  223 | 
  224 |  /** Get the Account Name filter field value. */
  225 |   async getAccountNameFilterValue(): Promise<string> {
  226 |     return this.getFieldDisplayValue('txtAccListAccountName');
  227 |   }
  228 | 
  229 |  /** Check if the results table has a "No results" row. */
  230 |   async isAccountListEmpty(): Promise<boolean> {
  231 |     const table = this.getElement('tblAccListResults');
  232 |     const text = await table.textContent();
  233 |     return (text || '').includes('No results');
  234 |   }
  235 | 
  236 |  /** Check if a specific text appears in the Account List results table. Waits briefly for content. */
  237 |   async accountListResultsContain(text: string): Promise<boolean> {
  238 |     const table = this.getElement('tblAccListResults');
  239 |  // Wait for table body to have text content
  240 |     try {
  241 |       await table.locator(`tbody:has-text("${text}")`).waitFor({ state: 'visible', timeout: 10_000 });
  242 |       return true;
  243 |     } catch {
  244 |       return false;
  245 |     }
  246 |   }
  247 | 
  248 |  /** Fill Address filter and click Search. Waits for results. */
  249 |   async searchAccountByAddress(address: string): Promise<void> {
  250 |     await this.searchAccountByFilter('txtAccListAddress', address, 'address');
  251 |   }
  252 | 
  253 |  /** Fill City filter and click Search. Waits for results. */
  254 |   async searchAccountByCity(city: string): Promise<void> {
  255 |     await this.searchAccountByFilter('txtAccListCity', city, 'city');
  256 |   }
  257 | 
  258 |  /** Fill Account Number filter and click Search. Waits for results (TC-LOC-ACC-030). */
  259 |   async searchAccountByNumber(num: string): Promise<void> {
  260 |     await this.searchAccountByFilter('txtAccListAccountNumber', num, 'number');
  261 |   }
  262 | 
  263 |  /** Shared search logic: fill a filter field, click Search, wait for results to render. */
  264 |   private async searchAccountByFilter(selectorKey: string, value: string, label: string): Promise<void> {
  265 |     await this.fillWithValidation(selectorKey, value);
  266 |     await this.clickWithRetry('btnAccListSearch');
  267 |     const table = this.getElement('tblAccListResults');
  268 |     const firstDataCell = table.locator('tbody tr:first-child td:nth-child(2)');
  269 |     await firstDataCell.waitFor({ state: 'visible', timeout: 15_000 });
  270 |     // LR-052: poll for the actual transition (first data cell's text becoming non-empty)
  271 |     // via waitForFunction instead of a fixed-sleep loop. Budget mirrors the prior
  272 |     // 30×500ms = 15s. Selector is rebuilt from the same testid (single source of truth).
  273 |     const firstDataCellSelector = `${this.getLocator('tblAccListResults')} tbody tr:first-child td:nth-child(2)`;
> 274 |     await this.page.waitForFunction(
      |                     ^ TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
  275 |       (selector: string) => {
  276 |         const el = document.querySelector(selector);
  277 |         return !!el && (el.textContent ?? '').trim().length > 0;
  278 |       },
  279 |       firstDataCellSelector,
  280 |       { timeout: 15_000 }
  281 |     );
  282 |     Log.info(`Searched account by ${label}: ${value}`);
  283 |   }
  284 | 
  285 |  /** Check first row and click Select to apply account. Waits for dialog to close. */
  286 |   async selectAccountListFirstRow(): Promise<void> {
  287 |     await this.clickWithRetry('chkAccListRowSelect');
  288 |     await this.clickWithRetry('btnAccListSelect');
  289 |     await this.getElement('dlgAccountList').waitFor({ state: 'hidden', timeout: 10_000 });
  290 |     Log.info('[OK] Selected first account row and applied');
  291 |   }
  292 | 
  293 |  /** Check if Account List dialog has filter fields. */
  294 |   async hasAccountListFilters(): Promise<boolean> {
  295 |     const numField = await this.isElementVisible('txtAccListAccountNumber', 3_000);
  296 |     const nameField = await this.isElementVisible('txtAccListAccountName', 3_000);
  297 |     return numField && nameField;
  298 |   }
  299 | 
  300 |  /** Check if Account List dialog has Search and Reset buttons. */
  301 |   async hasAccountListActionButtons(): Promise<boolean> {
  302 |     const search = await this.isElementVisible('btnAccListSearch', 3_000);
  303 |     const reset = await this.isElementVisible('btnAccListReset', 3_000);
  304 |     return search && reset;
  305 |   }
  306 | 
  307 |  /** Check if Account List dialog has results table. */
  308 |   async hasAccountListTable(): Promise<boolean> {
  309 |     return this.isElementVisible('tblAccListResults', 3_000);
  310 |   }
  311 | 
  312 |  // ─────────────────────────────────────────────────────────────────────────────
  313 |  // SELECT CUSTOMER ADDRESS DIALOG
  314 |  // ─────────────────────────────────────────────────────────────────────────────
  315 | 
  316 |  /** Open Select Customer Address dialog from Venue Address button. */
  317 |   async openVenueAddressDialog(): Promise<void> {
  318 |     await this.clickWithRetry('btnAccVenueAddress');
  319 |     await this.waitForElement('dlgSelectAddress', 10_000);
  320 |     Log.info('[OK] Select Customer Address dialog opened (venue)');
  321 |   }
  322 | 
  323 |  /** Open Select Customer Address dialog from Master Address button. */
  324 |   async openMasterAddressDialog(): Promise<void> {
  325 |     await this.clickWithRetry('btnAccMasterAddress');
  326 |     await this.waitForElement('dlgSelectAddress', 10_000);
  327 |     Log.info('[OK] Select Customer Address dialog opened (master)');
  328 |   }
  329 | 
  330 |  /** Check if Select Customer Address dialog is visible. */
  331 |   async isAddressDialogVisible(): Promise<boolean> {
  332 |     return this.isElementVisible('dlgSelectAddress', 3_000);
  333 |   }
  334 | 
  335 |  /** Get the number of visible data rows in the address dialog table (excludes hidden/footer rows). */
  336 |   async getAddressRowCount(): Promise<number> {
  337 |     const table = this.getElement('tblAddrResults');
  338 |     await table.waitFor({ state: 'visible', timeout: 5_000 });
  339 |  // Client-side filter hides rows via CSS — count only visible rows with data
  340 |     const count = await table.locator('tbody tr').evaluateAll(
  341 |       rows => rows.filter(r => (r as HTMLElement).offsetHeight > 0 && r.querySelector('td:nth-child(2)')?.textContent?.trim()).length
  342 |     );
  343 |     return count;
  344 |   }
  345 | 
  346 |  /** Check if Select button in address dialog is disabled. */
  347 |   async isAddressSelectDisabled(): Promise<boolean> {
  348 |     return this.getElement('btnAddrSelect').isDisabled();
  349 |   }
  350 | 
  351 |  /** Check if Save button in address dialog is disabled. */
  352 |   async isAddressSaveDisabled(): Promise<boolean> {
  353 |     return this.getElement('btnAddrSave').isDisabled();
  354 |   }
  355 | 
  356 |  /** Click the first row checkbox in address dialog. */
  357 |   async checkAddressFirstRow(): Promise<void> {
  358 |     await this.clickWithRetry('chkAddrRow');
  359 |     Log.info('Checked first row in Address dialog');
  360 |   }
  361 | 
  362 |  /** Filter address rows using the search bar. Waits for client-side filter to apply. */
  363 |   async searchAddress(term: string): Promise<void> {
  364 |     const table = this.getElement('tblAddrResults');
  365 |     const initialRowCount = await table.locator('tbody tr').count();
  366 |     await this.fillWithValidation('txtAddrSearch', term);
  367 |  // Client-side filter removes non-matching rows from DOM — wait for last pre-filter row to detach
  368 |     if (term && initialRowCount > 1) {
  369 |       await table.locator('tbody tr').nth(initialRowCount - 1).waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  370 |     }
  371 |     Log.info(`Filtered addresses: ${term}`);
  372 |   }
  373 | 
  374 |  /** Check if address search bar is visible. */
```