# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\locations\location-notes.spec.ts >> Location Notes — FCC @locations @notes @fcc >> TC-LOC-NTS-047: Edit clear-to-empty (row stays with empty value)
- Location: specs\locations\location-notes.spec.ts:239:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: ""
Received: "Base text"
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
                      - text: November 14th, 1991
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
                  - tab "Account and Address" [ref=e241] [cursor=pointer]:
                    - generic [ref=e242]:
                      - img [ref=e243]
                      - text: Account and Address
                  - tab "Legal" [ref=e246] [cursor=pointer]:
                    - generic [ref=e247]:
                      - img [ref=e248]
                      - text: Legal
                  - tab "Notes" [active] [selected] [ref=e252] [cursor=pointer]:
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
                - tabpanel "Notes" [ref=e269]:
                  - generic [ref=e272]:
                    - table [ref=e274]:
                      - rowgroup [ref=e275]:
                        - row "No Notes Available" [ref=e276]:
                          - cell "No Notes Available" [ref=e277]
                    - generic [ref=e278]:
                      - generic [ref=e279]:
                        - button "Add" [ref=e280] [cursor=pointer]
                        - generic [ref=e281]:
                          - text: 0/4000
                          - generic [ref=e282]: (4000 Left)
                      - progressbar [ref=e283]
  - region "Notifications alt+T"
```

# Test source

```ts
  161 |       },
  162 |       cleanup: () => locationNotesPage.ensureEmptyState(),
  163 |     });
  164 |   });
  165 | 
  166 |   // ─── Group γ — Edit operations (append / prepend / replace / clear) ───────
  167 |   test('TC-LOC-NTS-064: Edit append', async ({ locationNotesPage, dependencyGate }) => {
  168 |     dependencyGate([]);
  169 |     test.setTimeout(90_000);
  170 |     await saveAndVerifyCase({
  171 |       id: 'TC-LOC-NTS-064',
  172 |       label: 'Edit append after baseline save',
  173 |       baseline: async () => {
  174 |         await locationNotesPage.ensureEmptyState();
  175 |         await locationNotesPage.fillNote(0, NOTE_APPEND_BASE);
  176 |         await locationNotesPage.saveAndConfirm();
  177 |         await locationNotesPage.reloadAndNavigateToNotesTab();
  178 |       },
  179 |       act: () => locationNotesPage.appendToNote(0, NOTE_APPEND_SUFFIX),
  180 |       saveAndConfirm: () => locationNotesPage.saveAndConfirm(),
  181 |       reload: () => locationNotesPage.reloadAndNavigateToNotesTab(),
  182 |       expectAfterReload: async () => {
  183 |         expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_APPEND_BASE + NOTE_APPEND_SUFFIX);
  184 |       },
  185 |       cleanup: () => locationNotesPage.ensureEmptyState(),
  186 |     });
  187 |   });
  188 | 
  189 |   test('TC-LOC-NTS-045: Edit prepend', async ({ locationNotesPage, dependencyGate }) => {
  190 |     dependencyGate([]);
  191 |     test.setTimeout(90_000);
  192 |     await saveAndVerifyCase({
  193 |       id: 'TC-LOC-NTS-045',
  194 |       label: 'Edit prepend after baseline save',
  195 |       baseline: async () => {
  196 |         await locationNotesPage.ensureEmptyState();
  197 |         await locationNotesPage.fillNote(0, NOTE_APPEND_BASE);
  198 |         await locationNotesPage.saveAndConfirm();
  199 |         await locationNotesPage.reloadAndNavigateToNotesTab();
  200 |       },
  201 |       act: () => locationNotesPage.prependToNote(0, NOTE_PREPEND_PREFIX),
  202 |       saveAndConfirm: () => locationNotesPage.saveAndConfirm(),
  203 |       reload: () => locationNotesPage.reloadAndNavigateToNotesTab(),
  204 |       expectAfterReload: async () => {
  205 |         expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_PREPEND_PREFIX + NOTE_APPEND_BASE);
  206 |       },
  207 |       cleanup: () => locationNotesPage.ensureEmptyState(),
  208 |     });
  209 |   });
  210 | 
  211 |   test('TC-LOC-NTS-046: Edit partial-replace (slice middle)', async ({ locationNotesPage, dependencyGate }) => {
  212 |     dependencyGate([]);
  213 |     test.setTimeout(90_000);
  214 |     const expected =
  215 |       NOTE_REPLACE_BASE.slice(0, NOTE_REPLACE_SLICE.start) +
  216 |       NOTE_REPLACE_SLICE.replacement +
  217 |       NOTE_REPLACE_BASE.slice(NOTE_REPLACE_SLICE.end);
  218 |     await saveAndVerifyCase({
  219 |       id: 'TC-LOC-NTS-046',
  220 |       label: 'Edit partial-replace slice',
  221 |       baseline: async () => {
  222 |         await locationNotesPage.ensureEmptyState();
  223 |         await locationNotesPage.fillNote(0, NOTE_REPLACE_BASE);
  224 |         await locationNotesPage.saveAndConfirm();
  225 |         await locationNotesPage.reloadAndNavigateToNotesTab();
  226 |       },
  227 |       act: () => locationNotesPage.replaceSliceInNote(
  228 |         0, NOTE_REPLACE_SLICE.start, NOTE_REPLACE_SLICE.end, NOTE_REPLACE_SLICE.replacement,
  229 |       ),
  230 |       saveAndConfirm: () => locationNotesPage.saveAndConfirm(),
  231 |       reload: () => locationNotesPage.reloadAndNavigateToNotesTab(),
  232 |       expectAfterReload: async () => {
  233 |         expect(await locationNotesPage.getNoteValue(0)).toBe(expected);
  234 |       },
  235 |       cleanup: () => locationNotesPage.ensureEmptyState(),
  236 |     });
  237 |   });
  238 | 
  239 |   test('TC-LOC-NTS-047: Edit clear-to-empty (row stays with empty value)', async ({ locationNotesPage, dependencyGate }) => {
  240 |     dependencyGate([]);
  241 |     test.setTimeout(90_000);
  242 |     await saveAndVerifyCase({
  243 |       id: 'TC-LOC-NTS-047',
  244 |       label: 'Edit clear-to-empty after baseline save',
  245 |       baseline: async () => {
  246 |         await locationNotesPage.ensureEmptyState();
  247 |         await locationNotesPage.fillNote(0, NOTE_APPEND_BASE);
  248 |         await locationNotesPage.saveAndConfirm();
  249 |         await locationNotesPage.reloadAndNavigateToNotesTab();
  250 |       },
  251 |       act: () => locationNotesPage.clearNote(0),
  252 |       saveAndConfirm: () => locationNotesPage.saveAndConfirm(),
  253 |       reload: () => locationNotesPage.reloadAndNavigateToNotesTab(),
  254 |       expectAfterReload: async () => {
  255 |         // After clear+save+reload, two acceptable states per BUG-LOC-NTS-003 placeholder behavior:
  256 |         // (a) row 0 exists with empty textarea value, OR (b) default empty state (no rows).
  257 |         // Branch on isDefaultEmptyState — no catch-swallow (LR-051 spirit, LR-053 no row-count).
  258 |         if (await locationNotesPage.isDefaultEmptyState()) {
  259 |           expect(await locationNotesPage.isDefaultEmptyState()).toBe(true);
  260 |         } else {
> 261 |           expect(await locationNotesPage.getNoteValue(0)).toBe('');
      |                                                           ^ Error: expect(received).toBe(expected) // Object.is equality
  262 |         }
  263 |       },
  264 |       cleanup: () => locationNotesPage.ensureEmptyState(),
  265 |     });
  266 |   });
  267 | 
  268 |   // ─── Group δ — Multi-row positive cases ──────────────────────────────────
  269 |   test('TC-LOC-NTS-048: 2-row positive (smallest multi-row save+reload)', async ({ locationNotesPage, dependencyGate }) => {
  270 |     dependencyGate([]);
  271 |     test.setTimeout(60_000);
  272 |     await saveAndVerifyCase({
  273 |       id: 'TC-LOC-NTS-048',
  274 |       label: '2-row positive',
  275 |       baseline: () => locationNotesPage.ensureEmptyState(),
  276 |       act: async () => {
  277 |         await locationNotesPage.fillNote(0, NOTE_2ROW_A);
  278 |         await locationNotesPage.clickAdd();
  279 |         await locationNotesPage.fillNote(1, NOTE_2ROW_B);
  280 |       },
  281 |       saveAndConfirm: () => locationNotesPage.saveAndConfirm(),
  282 |       reload: () => locationNotesPage.reloadAndNavigateToNotesTab(),
  283 |       expectAfterReload: async () => {
  284 |         expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_2ROW_A);
  285 |         expect(await locationNotesPage.getNoteValue(1)).toBe(NOTE_2ROW_B);
  286 |       },
  287 |       cleanup: () => locationNotesPage.ensureEmptyState(),
  288 |     });
  289 |   });
  290 | 
  291 |   test('TC-LOC-NTS-049: 5-row positive (smoke at moderate count)', async ({ locationNotesPage, dependencyGate }) => {
  292 |     dependencyGate([]);
  293 |     test.setTimeout(90_000);
  294 |     await saveAndVerifyCase({
  295 |       id: 'TC-LOC-NTS-049',
  296 |       label: '5-row positive',
  297 |       baseline: () => locationNotesPage.ensureEmptyState(),
  298 |       act: async () => {
  299 |         for (let i = 0; i < NOTE_5ROW.length; i++) {
  300 |           if (i > 0) await locationNotesPage.clickAdd();
  301 |           await locationNotesPage.fillNote(i, NOTE_5ROW[i]!);
  302 |         }
  303 |       },
  304 |       saveAndConfirm: () => locationNotesPage.saveAndConfirm(),
  305 |       reload: () => locationNotesPage.reloadAndNavigateToNotesTab(),
  306 |       expectAfterReload: async () => {
  307 |         for (let i = 0; i < NOTE_5ROW.length; i++) {
  308 |           expect(await locationNotesPage.getNoteValue(i)).toBe(NOTE_5ROW[i]!);
  309 |         }
  310 |       },
  311 |       cleanup: () => locationNotesPage.ensureEmptyState(),
  312 |     });
  313 |   });
  314 | 
  315 |   test('TC-LOC-NTS-050: Mixed-content (row 0 = 1-char, row 1 = 4000-char) save+reload', async ({ locationNotesPage, dependencyGate }) => {
  316 |     dependencyGate([]);
  317 |     test.setTimeout(90_000);
  318 |     await saveAndVerifyCase({
  319 |       id: 'TC-LOC-NTS-050',
  320 |       label: 'Mixed short+long rows',
  321 |       baseline: () => locationNotesPage.ensureEmptyState(),
  322 |       act: async () => {
  323 |         await locationNotesPage.fillNote(0, NOTE_MIXED_SHORT);
  324 |         await locationNotesPage.clickAdd();
  325 |         await locationNotesPage.pasteIntoNote(1, NOTE_MIXED_LONG);
  326 |       },
  327 |       saveAndConfirm: () => locationNotesPage.saveAndConfirm(),
  328 |       reload: () => locationNotesPage.reloadAndNavigateToNotesTab(),
  329 |       expectAfterReload: async () => {
  330 |         expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_MIXED_SHORT);
  331 |         expect(await locationNotesPage.getNoteValue(1)).toBe(NOTE_MIXED_LONG);
  332 |       },
  333 |       cleanup: () => locationNotesPage.ensureEmptyState(),
  334 |     });
  335 |   });
  336 | 
  337 |   test('TC-LOC-NTS-051: Edit row 1 of 2 — row 0 unchanged after save+reload', async ({ locationNotesPage, dependencyGate }) => {
  338 |     dependencyGate([]);
  339 |     test.setTimeout(90_000);
  340 |     const editSuffix = ' — edited';
  341 |     await saveAndVerifyCase({
  342 |       id: 'TC-LOC-NTS-051',
  343 |       label: 'Edit row 1 leaves row 0 intact',
  344 |       baseline: async () => {
  345 |         await locationNotesPage.ensureEmptyState();
  346 |         await locationNotesPage.fillNote(0, NOTE_2ROW_A);
  347 |         await locationNotesPage.clickAdd();
  348 |         await locationNotesPage.fillNote(1, NOTE_2ROW_B);
  349 |         await locationNotesPage.saveAndConfirm();
  350 |         await locationNotesPage.reloadAndNavigateToNotesTab();
  351 |       },
  352 |       act: () => locationNotesPage.appendToNote(1, editSuffix),
  353 |       saveAndConfirm: () => locationNotesPage.saveAndConfirm(),
  354 |       reload: () => locationNotesPage.reloadAndNavigateToNotesTab(),
  355 |       expectAfterReload: async () => {
  356 |         expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_2ROW_A);
  357 |         expect(await locationNotesPage.getNoteValue(1)).toBe(NOTE_2ROW_B + editSuffix);
  358 |       },
  359 |       cleanup: () => locationNotesPage.ensureEmptyState(),
  360 |     });
  361 |   });
```