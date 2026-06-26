# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\locations\location-notes.spec.ts >> Location Notes — FCC @locations @notes @fcc >> TC-LOC-NTS-046: Edit partial-replace (slice middle)
- Location: specs\locations\location-notes.spec.ts:211:7

# Error details

```
TimeoutError: locator.focus: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[data-testid="location-settings-section-notes"] textarea').first()

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
                      - text: November 19th, 1991
                  - generic [ref=e192]: Tax Mode
                  - generic [ref=e196]: Country
                  - generic [ref=e201]: Region
                  - generic [ref=e205]:
                    - generic [ref=e206]: Servicing Branch Office
                    - combobox [ref=e207] [cursor=pointer]:
                      - generic: Select Servicing Branch Office
                      - img
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
                  - tab "Local Information" [ref=e227] [cursor=pointer]:
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
                  - tab "Notes" [active] [selected] [ref=e254] [cursor=pointer]:
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
                - tabpanel "Notes" [ref=e271]:
                  - generic [ref=e274]:
                    - table [ref=e276]:
                      - rowgroup [ref=e277]:
                        - row "No Notes Available" [ref=e278]:
                          - cell "No Notes Available" [ref=e279]
                    - generic [ref=e280]:
                      - generic [ref=e281]:
                        - button "Add" [ref=e282] [cursor=pointer]
                        - generic [ref=e283]:
                          - text: 0/4000
                          - generic [ref=e284]: (4000 Left)
                      - progressbar [ref=e285]
  - region "Notifications alt+T"
```

# Test source

```ts
  52  |     const handler = async (d: import('@playwright/test').Dialog) => {
  53  |       try { await d.accept(); } catch { /* dialog may already be handled */ }
  54  |     };
  55  |     this.page.on('dialog', handler);
  56  |     try {
  57  |       await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
  58  |     } finally {
  59  |       this.page.removeListener('dialog', handler);
  60  |     }
  61  |     await this.clickNotesTab();
  62  |   }
  63  | 
  64  |  // ─────────────────────────────────────────────────────────────────────────────
  65  |  // ROW MANAGEMENT
  66  |  // ─────────────────────────────────────────────────────────────────────────────
  67  | 
  68  |  /** Click the Add button to create a new note row. */
  69  |   async clickAdd(): Promise<void> {
  70  |     await this.clickWithRetry('btnNotesAdd');
  71  |   }
  72  | 
  73  |  /**
  74  |  * Fill the textarea at the given row index and press Tab (Angular blur trigger).
  75  |  * Row 0 = first row, Row 1 = second row, etc.
  76  |  * Auto-creates row 0 if page is in "No Notes Available" state (0 textareas).
  77  |  */
  78  |   async fillNote(row: number, text: string): Promise<void> {
  79  |     if (row === 0) {
  80  |       const count = await this.getElement('txtNoteInputAll').count();
  81  |       if (count === 0) {
  82  |         await this.clickAdd();
  83  |       }
  84  |     }
  85  |     const textarea = this.getElement('txtNoteInputAll').nth(row);
  86  |     await textarea.waitFor({ state: 'visible', timeout: 5_000 });
  87  |     if (text.includes('\n')) {
  88  |       await this.pasteIntoNote(row, text);
  89  |       return;
  90  |     }
  91  |     await textarea.fill(text);
  92  |     await textarea.press('Tab');
  93  |     Log.info(`[OK] Filled note row ${row} with ${text.length} chars`);
  94  |   }
  95  | 
  96  |  /**
  97  |  * Programmatic paste — bypasses JS keyboard handler (soft limit).
  98  |  * Used for TC-007/TC-021 boundary test (4001+ chars via paste).
  99  |  * Dispatches input+change events to trigger Angular model update.
  100 |  * Auto-creates row 0 if page is in "No Notes Available" state.
  101 |  */
  102 |   async pasteIntoNote(row: number, text: string): Promise<void> {
  103 |     if (row === 0) {
  104 |       const count = await this.getElement('txtNoteInputAll').count();
  105 |       if (count === 0) {
  106 |         await this.clickAdd();
  107 |       }
  108 |     }
  109 |     const textarea = this.getElement('txtNoteInputAll').nth(row);
  110 |     await textarea.focus();
  111 |     await textarea.evaluate((el: HTMLTextAreaElement, t: string) => {
  112 |       const setter = Object.getOwnPropertyDescriptor(
  113 |         window.HTMLTextAreaElement.prototype, 'value'
  114 |       )?.set;
  115 |       setter?.call(el, t);
  116 |       el.dispatchEvent(new Event('input', { bubbles: true }));
  117 |       el.dispatchEvent(new Event('change', { bubbles: true }));
  118 |     }, text);
  119 |     await textarea.press('Tab');
  120 |     Log.info(`[OK] Pasted ${text.length} chars into note row ${row}`);
  121 |   }
  122 | 
  123 |  /** Append text to row N's existing value via Angular-friendly input event. FCC γ (edit) helper. */
  124 |   async appendToNote(row: number, suffix: string): Promise<void> {
  125 |     const textarea = this.getElement('txtNoteInputAll').nth(row);
  126 |     await textarea.focus();
  127 |     await textarea.evaluate((el: HTMLTextAreaElement, s: string) => {
  128 |       const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  129 |       setter?.call(el, el.value + s);
  130 |       el.dispatchEvent(new Event('input', { bubbles: true }));
  131 |       el.dispatchEvent(new Event('change', { bubbles: true }));
  132 |     }, suffix);
  133 |     await textarea.press('Tab');
  134 |   }
  135 | 
  136 |  /** Prepend text to row N's existing value via Angular-friendly input event. FCC γ (edit) helper. */
  137 |   async prependToNote(row: number, prefix: string): Promise<void> {
  138 |     const textarea = this.getElement('txtNoteInputAll').nth(row);
  139 |     await textarea.focus();
  140 |     await textarea.evaluate((el: HTMLTextAreaElement, p: string) => {
  141 |       const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  142 |       setter?.call(el, p + el.value);
  143 |       el.dispatchEvent(new Event('input', { bubbles: true }));
  144 |       el.dispatchEvent(new Event('change', { bubbles: true }));
  145 |     }, prefix);
  146 |     await textarea.press('Tab');
  147 |   }
  148 | 
  149 |  /** Replace [start, end) of row N's value with newText via Angular-friendly input event. FCC γ (edit) helper. */
  150 |   async replaceSliceInNote(row: number, start: number, end: number, newText: string): Promise<void> {
  151 |     const textarea = this.getElement('txtNoteInputAll').nth(row);
> 152 |     await textarea.focus();
      |                    ^ TimeoutError: locator.focus: Timeout 10000ms exceeded.
  153 |     await textarea.evaluate((el: HTMLTextAreaElement, args: { s: number; e: number; n: string }) => {
  154 |       const v = el.value;
  155 |       const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  156 |       setter?.call(el, v.slice(0, args.s) + args.n + v.slice(args.e));
  157 |       el.dispatchEvent(new Event('input', { bubbles: true }));
  158 |       el.dispatchEvent(new Event('change', { bubbles: true }));
  159 |     }, { s: start, e: end, n: newText });
  160 |     await textarea.press('Tab');
  161 |   }
  162 | 
  163 |  /** Clear row N's textarea via Angular-friendly input event (LR-026 + BUG-LOC-NTS-001 workaround pattern). FCC ε (delete) prerequisite. */
  164 |   async clearNote(row: number): Promise<void> {
  165 |     const textarea = this.getElement('txtNoteInputAll').nth(row);
  166 |     await textarea.focus();
  167 |     await textarea.evaluate((el: HTMLTextAreaElement) => {
  168 |       const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  169 |       setter?.call(el, '');
  170 |       el.dispatchEvent(new Event('input', { bubbles: true }));
  171 |       el.dispatchEvent(new Event('change', { bubbles: true }));
  172 |     });
  173 |     await textarea.press('Tab');
  174 |   }
  175 | 
  176 |  /** Ensure at least 1 empty textarea row exists. Clicks Add if in "No Notes Available" state. */
  177 |   async prepareEmptyRow(): Promise<void> {
  178 |     const count = await this.getElement('txtNoteInputAll').count();
  179 |     if (count === 0) {
  180 |       await this.clickAdd();
  181 |     }
  182 |   }
  183 | 
  184 |  /** Click Delete button on the given row index. */
  185 |   async deleteRow(row: number): Promise<void> {
  186 |     const deleteBtn = this.getElement('btnNotesDelete').nth(row);
  187 |     await deleteBtn.click();
  188 |     Log.info(`[OK] Deleted note row ${row}`);
  189 |   }
  190 | 
  191 |  /** Delete all note rows by clicking Delete buttons until none remain. */
  192 |   async deleteAllRows(): Promise<void> {
  193 |     let count = await this.getElement('btnNotesDelete').count();
  194 |     while (count > 0) {
  195 |       const prev = count;
  196 |       await this.getElement('btnNotesDelete').first().click();
  197 |       await expect.poll(
  198 |         () => this.getElement('btnNotesDelete').count(),
  199 |         { timeout: 5_000 },
  200 |       ).toBeLessThan(prev);
  201 |       count = await this.getElement('btnNotesDelete').count();
  202 |     }
  203 |     Log.info('[OK] All note rows deleted');
  204 |   }
  205 | 
  206 |  // ─────────────────────────────────────────────────────────────────────────────
  207 |  // STATE CHECKS
  208 |  // ─────────────────────────────────────────────────────────────────────────────
  209 | 
  210 |  /** Check if "No Notes Available" empty state is visible. */
  211 |   async isEmptyStateVisible(): Promise<boolean> {
  212 |     return this.getElement('lblNoNotesAvailable').isVisible();
  213 |   }
  214 | 
  215 |  /** Get input value of the textarea at the given row index. */
  216 |   async getNoteValue(row: number): Promise<string> {
  217 |     const el = this.getElement('txtNoteInputAll').nth(row);
  218 |     await el.waitFor({ state: 'visible', timeout: 15_000 });
  219 |     return el.inputValue();
  220 |   }
  221 | 
  222 |  /** Count the number of note textarea rows currently in the DOM. */
  223 |   async getNoteRowCount(): Promise<number> {
  224 |     return this.getElement('txtNoteInputAll').count();
  225 |   }
  226 | 
  227 |  /** Get the full text content of the character counter element. */
  228 |   async getCharCounterText(): Promise<string> {
  229 |     return (await this.getElement('lblNotesCharCounter').textContent()) ?? '';
  230 |   }
  231 | 
  232 |  /** Parse the numeric character count from the counter text (e.g., "25/4000" → 25). */
  233 |   async getCharCount(): Promise<number> {
  234 |     const text = await this.getCharCounterText();
  235 |     const match = text.match(/(\d+)\/4000/);
  236 |     return match && match[1] ? parseInt(match[1], 10) : -1;
  237 |   }
  238 | 
  239 |  /** Count the number of Delete buttons currently visible. */
  240 |   async getDeleteButtonCount(): Promise<number> {
  241 |     return this.getElement('btnNotesDelete').count();
  242 |   }
  243 | 
  244 |  /** Check if the Add button is visible. */
  245 |   async isAddButtonVisible(): Promise<boolean> {
  246 |     return this.getElement('btnNotesAdd').isVisible();
  247 |   }
  248 | 
  249 |  /** Check if the progress bar is visible. */
  250 |   async isProgressBarVisible(): Promise<boolean> {
  251 |     return this.getElement('barNotesProgress').isVisible();
  252 |   }
```