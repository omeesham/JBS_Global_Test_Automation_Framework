# Corporate Pricing — Pricebook Management / Pricing Detail Test Cases (NM-1443)

**Module**: corporate-pricing | **Total**: 20 | **Status**: Partial | **Updated**: 2026-06-05

---

## MCP_VERIFICATION_LOG — Pricing Detail Tab (NM-1443)

| Field | Value |
|-------|-------|
| Date | 2026-06-05 |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/91acb5ca-20e2-ce8e-a9ab-8c370925fd65 |
| Office/Entity | 1604 (Parker Palm Springs) — pricebook `2021-PB6` (`detailFixture`, Inactive) |
| Intent oracle | Pricing functional spec NM-1443 (baseline-absent; net-new on e2e) |
| Field-inventory | `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-detail-2026-06-05.md` |
| Mode | **Management mode** only (existing pricebook). New-Pricebook-mode ADD (double-click/drag-drop) is gated to `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md` |
| Grid (live) | HTML `<table>`, 5 columns: ID / Product Group Name / Price / New Price / Max Discount. ~2430 product-group rows, fully rendered (heavy; content-anchored reads, no exact counts — LR-022/LR-053) |
| Source list | "Available Product Groups" — ~3707 draggable items + a "Search ID or Name..." filter |
| Editable vs read-only | Price (Base Price) = read-only text; New Price (Override) + Max Discount (Override Discount) = editable inputs |
| Save | Single top-level "Save"; disabled when there are no pending changes; **dialog-gated** ("Save Changes" → Cancel/Save); commits ALL changed rows in one batch |
| Override model | "New Price" is a staging override → on Save it becomes the row's "Price" after reload; the input clears. Reliable dirty lever = Max Discount; a New-Price-only edit does not reliably enable Save (CPR-DETAIL-BUG-A) |
| data-testid coverage | **0** on this page → text/role/content-anchored selectors (Doctrine 4 / D8) |
| Mutation safety | Save-cycle TCs run against `detailFixture` with per-test `ensureDefaultState()` bounded-retry restore of anchors `Balloon Light Decor` (277) + `Analog Mixer 12 - 23 Ch` (280) — LR-019 |

### HELPER VERIFICATION LEDGER (30 workbook cases → live verdict → disposition) — INTERNAL, does not ship

| Helper | Verdict (live 2026-06-05) | Disposition |
|---|---|---|
| 001 Available list loads (New-Pricebook mode) | Management-mode list-load VERIFIED (source list + grid populate) | P1 → TC-LOC-CPR-203/205 (mgmt). New-Pricebook framing (b)→1440 |
| 002 double-click ADDS (New Pricebook mode) | New-Pricebook-mode behavior — not built in mgmt | (b) → SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md |
| 003 drag ADDS (New Pricebook mode) | New-Pricebook-mode behavior | (b) → 1440 |
| 004 drop-zone visual feedback | New-Pricebook-mode, IMAGE-ONLY | (b) → 1440 |
| 005 add multiple (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 006 add then remove (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 007 expand group in Active grid (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 008 collapse (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 009 save new associations (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 010 save empty shell (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 011 single-click selects/displays (mgmt) | **CORRECTED**: single-click does NOT add a row; no visible selection-state change observed | TC-LOC-CPR-208 (assert no-add) + Clarification CPR-DETAIL-Q2 |
| 012 double-click does NOT add (mgmt, defensive) | VERIFIED (grid row count unchanged, no pending changes, no dialog) | TC-LOC-CPR-209 |
| 013 drag-drop does NOT add (mgmt, defensive) | VERIFIED-mechanism (attempt drag → grid unchanged) | TC-LOC-CPR-210 |
| 014 no Add/Remove affordance on existing groups (mgmt) | VERIFIED (rows expose no buttons) | TC-LOC-CPR-211 |
| 015 Pricing Details load on tab activation (mgmt) | VERIFIED (grid + overrides load on Detail tab) | TC-LOC-CPR-201/205 |
| 016 expand group → items (mgmt) | **CORRECTED**: grid renders FLAT — no expand control in mgmt mode (7 page chevrons are app-nav) | (c) Clarification CPR-DETAIL-Q3 |
| 017 collapse group (mgmt) | **CORRECTED**: no expand/collapse control live | (c) Clarification CPR-DETAIL-Q3 |
| 018 Override Price valid + Save persists | **CORRECTED**: New Price is a staging override → on Save it becomes the row's Price; input clears | TC-LOC-CPR-218 |
| 019 Override Price BVA-low | numeric FCC | (b) → SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md |
| 020 Override Price BVA-high | numeric FCC | (b) → FCC-P2 |
| 021 Override Price non-numeric | numeric FCC | (b) → FCC-P2 |
| 022 empty Override Price → Base Price fallback | VERIFIED-intent (clean rows show base in Price; no override = base) | TC-LOC-CPR-219 |
| 023 Override Discount valid + Save persists | VERIFIED (Max Discount edit enables Save; persists "N.NN %") | TC-LOC-CPR-215 |
| 024 Override Discount non-numeric | numeric FCC | (b) → FCC-P2 |
| 025 empty Override Discount → no discount | workbook-only assumption (not a stated rule, F6) | (b) → FCC-P2 |
| 026 Base Price read-only | VERIFIED (Price column has no input) | TC-LOC-CPR-206 |
| 027 Save commits all overrides (batch) | VERIFIED-intent (one Save commits all changed rows) | TC-LOC-CPR-217 |
| 028 Save validates currency-format (valid persists) | VERIFIED-intent (valid currency persists) | TC-LOC-CPR-220 |
| 029 invalid currency blocks Save w/ message | F6 inference on HOW it surfaces — not exercised destructively | (b) → FCC-P2 (negative path) |
| 030 Save confirmation feedback | VERIFIED-intent (confirmation dialog + return to clean state observed) | Covered by the save-state lifecycle in TC-LOC-CPR-212 (clean) → TC-LOC-CPR-213 (changed) → TC-LOC-CPR-216 (returns to clean after Save); confirmation dialog itself in TC-LOC-CPR-214 |

**Dropped**: 0 of 30. **Covered P1 (mgmt)**: 13 helpers → 12 TCs. **(c) clarification**: 016, 017 (no expand control live). **(b) deferred**: 001–010 → 1440; 019/020/021/024/025/029 → FCC-P2.

### Clarifications (TO RAISE) — INTERNAL, does not ship

**Status (2026-06-05): RAISED — see `drafts/corporate-pricing-detail-divergences-2026-06-05.md`** (`_internal/encore-questions-drafts/`). CPR-DETAIL-Q3 + CPR-DETAIL-Q4 are documented there for `/encore-questions` Tier-A review and (if unresolved) escalation to the Encore team. CPR-DETAIL-Q1 + CPR-DETAIL-Q2 remain staged below pending the same review.

| # | Intended behavior (per spec) | Live reality | Disposition |
|---|---|---|---|
| CPR-DETAIL-Q1 | NM-1443: editing the Override Price should let the user Save the override | Editing **New Price alone does not reliably enable Save** (the form is not marked as changed); editing Max Discount on the row reliably enables Save and the New-Price value then commits in the batch (CPR-DETAIL-BUG-A) | Bug-candidate — reproduce in the test runner (LR-044), then file `BUG-*.json` / raise. TC-218 persists the override via the proven grid-batch save; the Save-enable asymmetry is the open question. |
| CPR-DETAIL-Q2 | NM-1443 (mgmt): single-click "displays the selected group" | Single-click adds nothing and shows no observable selection-state change | Likely benign (selection is subtle/none in mgmt mode). TC-208 asserts the load-bearing property — single-click does not ADD. |
| CPR-DETAIL-Q3 | NM-1443: "Product Groups, which can be expanded to show Individual Items/Products" | Grid renders FLAT — no per-row expand/collapse control in management mode (page chevrons are the app nav sidebar) | **RAISED** — see drafts/corporate-pricing-detail-divergences-2026-06-05.md (Q3). Expand/collapse not present in mgmt grid; helpers 016/017 classified (c). |
| CPR-DETAIL-Q4 | NM-1443: "Base Price displays the original global price for reference" | The Price column **updates to the saved New-Price override** after save (it is not pinned to the original global price) | **RAISED** — see drafts/corporate-pricing-detail-divergences-2026-06-05.md (Q4). Asserted live in TC-218 (override becomes Price). |

---

## FIELD INVENTORY — Pricing Detail Tab

Full dated inventory: `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-detail-2026-06-05.md`. Management mode (existing pricebook `2021-PB6`); 0 `data-testid` on this page → text/role/content-anchored selectors (D8).

| Field | Type | Default (live 2026-06-05) | State | Selector strategy |
|---|---|---|---|---|
| Product-group grid | table — 5 cols: ID / Product Group Name / Price / New Price / Max Discount | ~2430 rows, fully rendered | mixed | content-anchored (`<table>`, row text) |
| Base Price (Price column) | text cell | per product group | read-only | column / row-anchored |
| New Price (override) | numeric input | empty | editable | row-anchored input |
| Max Discount (override) | numeric input | empty | editable | row-anchored input |
| Available Product Groups (source list) | list + "Search ID or Name…" filter | ~3707 items | read-only in mgmt mode | text / placeholder |
| Save | button | disabled when clean | dialog-gated ("Save Changes" → Cancel/Save) | `button:has-text("Save")` |

## Validation Rules

- **Override model**: "New Price" is a staging override → on Save it replaces the row's "Price" and the input clears (asserted live, TC-LOC-CPR-218 / CPR-DETAIL-Q4).
- **Save-enable asymmetry (CPR-DETAIL-BUG-A)**: editing New Price alone does not reliably enable Save; editing Max Discount reliably marks the form dirty. Bug-candidate raised (CPR-DETAIL-Q1) — see `_internal/encore-questions-drafts/corporate-pricing-detail-divergences-2026-06-05.md`.
- **Read-only**: Base Price exposes no input (TC-LOC-CPR-206); existing grid rows expose no Add/Remove affordance in management mode (TC-LOC-CPR-211).
- **Batch save**: a single Save commits all changed rows in one batch (TC-LOC-CPR-217). Numeric BVA / non-numeric override paths are deferred to the Detail FCC P2 subplan.

## TC-LOC-CPR-201: Pricing Detail tab activates and the product-group grid renders
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page for the test pricebook (office 1604), with the page freshly loaded on the Pricing Strategy tab (before the Pricing Detail tab is opened).

**Steps**:
1. Open the Pricebook Details page for the test pricebook (office 1604) -> Page loads on the Pricing Strategy tab
2. Click the "Pricing Detail" tab -> Tab activates and the product-group grid renders
3. Verify the grid contains product-group rows -> One or more rows present (content-anchored, not an exact count)

**Expected**: The Pricing Detail tab activates and its product-group grid renders with rows; the grid loads its data when the tab is activated.
**Data**: office=1604, pricebook=2021-PB6

---

## TC-LOC-CPR-202: Verify the Pricing Detail grid shows its five columns
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-201
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the product-group grid loaded.

**Steps**:
1. Open the Pricing Detail tab -> Grid renders
2. Read the grid column headers -> "ID", "Product Group Name", "Price", "New Price", "Max Discount" present in order

**Expected**: The grid shows five columns in order: ID, Product Group Name, Price, New Price, Max Discount. "Price" displays the base price, "New Price" captures the override price, and "Max Discount" captures the override discount.
**Data**: office=1604

---

## TC-LOC-CPR-203: The Available Product Groups source list loads
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-201
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the Available Product Groups source list rendered alongside the grid.

**Steps**:
1. Open the Pricing Detail tab -> Grid + source list render
2. Inspect the Available Product Groups list -> The list populates with selectable product groups (count greater than zero)

**Expected**: The Available Product Groups source list loads with product groups available for browsing and selection.
**Data**: office=1604

---

## TC-LOC-CPR-204: The source list provides a Search (ID or Name) filter
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-203
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the Available Product Groups source list rendered.

**Steps**:
1. Open the Pricing Detail tab -> Source list renders
2. Look for a search/filter input over the Available Product Groups list -> A "Search ID or Name..." filter input is present

**Expected**: The source list exposes a "Search ID or Name..." filter so the user can browse and select product groups.
**Data**: office=1604

---

## TC-LOC-CPR-205: Pricing details load on tab activation
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-201
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page in management mode (an existing pricebook), with the page loaded and the Pricing Detail tab not yet opened.

**Steps**:
1. Open a pricebook in management mode and click the Pricing Detail tab -> Tab activates
2. Observe the grid -> The current pricing details (product-group rows with Price + override cells) load and appear

**Expected**: When the Pricing Detail tab is activated, the current pricing details load into the grid.
**Data**: office=1604

---

## TC-LOC-CPR-206: Base Price (Price column) is read-only
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-201
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row ("Balloon Light Decor") located.

**Steps**:
1. Open the Pricing Detail tab and locate a known product-group row -> Row visible
2. Inspect its Price (Base Price) cell -> The cell is read-only text with no editable input

**Expected**: The Base Price cell is read-only (no input) — it is displayed for reference only.
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-LOC-CPR-207: New Price and Max Discount cells are editable
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-201
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row ("Balloon Light Decor") located.

**Steps**:
1. Open the Pricing Detail tab and locate a known product-group row -> Row visible
2. Inspect its New Price and Max Discount cells -> Both expose editable inputs (not read-only/disabled)

**Expected**: The New Price (override price) and Max Discount (override discount) cells are editable input fields.
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-LOC-CPR-208: Single-clicking a source product group does not add a grid row
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-203
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and the Available Product Groups source list rendered.

**Steps**:
1. Open the Pricing Detail tab and note the current grid row count -> Count captured
2. Single-click a product group in the Available list -> Selection acknowledged
3. Re-read the grid row count -> Unchanged (no row added)

**Expected**: In management mode a single-click selects/displays the group without adding it to the grid. No row is added.
**Data**: office=1604

---

## TC-LOC-CPR-209: Double-click a source-list product group does NOT add a grid row (defensive)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-203
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and the Available Product Groups source list rendered.

**Steps**:
1. Open the Pricing Detail tab and note the current grid row count -> Count captured
2. Double-click a product group in the Available list -> No add occurs
3. Re-read the grid row count -> Unchanged; the grid stays clean (Save disabled); no dialog appears

**Expected**: Double-click does NOT add a product group in management mode — new product groups cannot be added when editing an existing pricebook.
**Data**: office=1604

---

## TC-LOC-CPR-210: Drag a source-list product group onto the grid does NOT add (defensive)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-203
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and the Available Product Groups source list rendered.

**Steps**:
1. Open the Pricing Detail tab and note the current grid row count -> Count captured
2. Drag a product group from the Available list and drop it onto the grid -> The drop is rejected / not initiated
3. Re-read the grid row count -> Unchanged (no row added)

**Expected**: Drag-and-drop does NOT add a product group in management mode.
**Data**: office=1604

---

## TC-LOC-CPR-211: Existing grid rows expose no Add/Remove affordance (Management mode)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-201
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a product-group row ("Balloon Light Decor") located.

**Steps**:
1. Open the Pricing Detail tab and locate a product-group row -> Row visible
2. Inspect the row for any add/remove control -> None present

**Expected**: Existing product-group rows carry no Add/Remove control in management mode (consistent with new product groups not being addable; live-confirmed).
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-LOC-CPR-212: Unmodified grid shows the clean state (Save disabled)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-201
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid loaded, with no edits made to any row.

**Steps**:
1. Open the Pricing Detail tab; make no changes -> Grid loads
2. Observe the Save button -> Save is disabled

**Expected**: With no pending changes the grid is clean — the Save button's disabled state is the indicator that nothing has changed (there is no separate badge).
**Data**: office=1604

---

## TC-LOC-CPR-213: Editing a Max Discount changes the state to dirty (Save enabled)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-212
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded and clean (Save disabled), and a row's Max Discount cell editable.

**Steps**:
1. Open the Pricing Detail tab (clean) -> Save disabled
2. Edit a row's Max Discount cell -> Save button enables
3. Discard (reload) without Save -> Baseline restored

**Expected**: Editing an editable override cell (Max Discount) marks the grid as changed, and the Save button enables.
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-LOC-CPR-214: Save is dialog-gated (Save Changes confirmation)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-213
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a reversible Max Discount edit ready to be made on a row.

**Steps**:
1. Open the Pricing Detail tab and make a reversible Max Discount edit -> Save enables
2. Click Save -> A "Save Changes" confirmation dialog appears ("Are you sure you want to save the changes?" / Cancel / Save)
3. Confirm the dialog -> Save proceeds; restore baseline afterward

**Expected**: Save opens a "Save Changes" confirmation dialog that must be confirmed before the changes commit (shared confirmation pattern per LR-012).
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-LOC-CPR-215: Edit a Max Discount, Save, and the change persists across reload (with restore)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-214
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid loaded; the anchor row is at its default state (base price, no discount) before the edit.

**Steps**:
1. Ensure default state (anchors at base, no discount) -> Clean baseline
2. Edit a row's Max Discount to a new value and Save (confirm dialog) -> Save completes
3. Reload the page and reopen the Pricing Detail tab -> The new Max Discount value persists for that row
4. Restore the row via ensureDefaultState (cleanup) -> Baseline restored

**Expected**: A saved Max Discount (override discount) persists across reload; the test data is restored afterward so there is no cross-run drift.
**Data**: office=1604, row="Balloon Light Decor", value="12"

---

## TC-LOC-CPR-216: Save resets the state from dirty to clean after success
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-214
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid loaded; the anchor row is at its default state before the edit.

**Steps**:
1. Ensure default state -> Clean baseline
2. Make a reversible Max Discount edit -> Save enabled (changed)
3. Click Save and confirm -> Save returns to disabled (clean)
4. Restore baseline via ensureDefaultState -> Baseline restored

**Expected**: After a successful Save the grid returns to the clean state (Save disabled).
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-LOC-CPR-217: Save commits grid override edits in one batch (with restore)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-215
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid loaded; two anchor rows are at their default state before the edits.

**Steps**:
1. Ensure default state -> Clean baseline
2. Edit the Max Discount on two different product-group rows -> Save enabled
3. Click Save and confirm -> Save completes
4. Reload and reopen the Pricing Detail tab -> Both rows reflect the committed Max Discount values
5. Restore both rows via ensureDefaultState -> Baseline restored

**Expected**: A single Save commits all pending grid override edits — every changed price and discount across the rows — in one batch.
**Data**: office=1604, rows="Balloon Light Decor" + "Analog Mixer 12 - 23 Ch"

---

## TC-LOC-CPR-218: Verify a saved New Price override becomes the row Price after reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-CPR-215
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid loaded; the anchor row is at its base Price before the override is entered.

**Steps**:
1. Ensure default state (anchor row at its base Price) -> Clean baseline
2. Enter a New Price (override) on the row and commit it via the grid Save (confirm dialog) -> Save completes
3. Reload and reopen the Pricing Detail tab -> The row's Price column now shows the entered override value; the New Price input has cleared (staging)
4. Restore the row to its base Price via ensureDefaultState -> Baseline restored

**Expected**: A New Price (override price / staging price) entered and saved supersedes the base value — the Price column reflects it on reload. NOTE: the Save-enable asymmetry on a New-Price-only edit is raised as CPR-DETAIL-Q1.
**Data**: office=1604, row="Analog Mixer 12 - 23 Ch", value="250.00"

---

## TC-LOC-CPR-219: An empty New Price leaves the Base Price in effect
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-201
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid loaded; a row with no override (New Price empty) located.

**Steps**:
1. Open the Pricing Detail tab and locate a row with no override (New Price empty) -> Row visible
2. Read the row's New Price input and Price cell -> New Price is empty; Price shows the base price

**Expected**: When the New Price (override price) is empty, the Base Price remains in effect for the row — if the user leaves the override field empty, the system defaults back to the Base Price. Asserted as: empty New Price + a non-empty Base Price displayed.
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-LOC-CPR-220: Save accepts a valid currency-formatted New Price
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-CPR-218
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid loaded; the anchor row is at its base Price before the override is entered.

**Steps**:
1. Ensure default state -> Clean baseline
2. Enter a valid currency-formatted New Price (two-decimal value) on a row and commit via Save -> Save accepts the value
3. Reload and reopen the Pricing Detail tab -> The valid value persisted (Price reflects it)
4. Restore the row via ensureDefaultState -> Baseline restored

**Expected**: Save accepts a valid currency-formatted numeric entry and persists it — numeric entries are validated against the pricebook's currency format. The invalid-format negative path (a malformed entry being rejected with a message) is covered separately by the negative-path field-case suite.
**Data**: office=1604, row="Analog Mixer 12 - 23 Ch", value="250.00"
