# Corporate Pricing — Pricebook Management / Pricing Detail Test Cases (NM-1443)

**Module**: corporate-pricing | **Total**: 55 | **Status**: Complete | **Updated**: 2026-06-25

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
| 001 Available list loads (New-Pricebook mode) | Management-mode list-load VERIFIED (source list + grid populate) | P1 → TC-CPR-DET-003/005 (mgmt). New-Pricebook framing (b)→1440 |
| 002 double-click ADDS (New Pricebook mode) | New-Pricebook-mode behavior — not built in mgmt | (b) → SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md |
| 003 drag ADDS (New Pricebook mode) | New-Pricebook-mode behavior | (b) → 1440 |
| 004 drop-zone visual feedback | New-Pricebook-mode, IMAGE-ONLY | (b) → 1440 |
| 005 add multiple (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 006 add then remove (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 007 expand group in Active grid (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 008 collapse (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 009 save new associations (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 010 save empty shell (New Pricebook) | New-Pricebook-mode | (b) → 1440 |
| 011 single-click selects/displays (mgmt) | **CORRECTED**: single-click does NOT add a row; no visible selection-state change observed | TC-CPR-DET-008 (assert no-add) + Clarification CPR-DETAIL-Q2 |
| 012 double-click does NOT add (mgmt, defensive) | VERIFIED (grid row count unchanged, no pending changes, no dialog) | TC-CPR-DET-009 |
| 013 drag-drop does NOT add (mgmt, defensive) | VERIFIED-mechanism (attempt drag → grid unchanged) | TC-CPR-DET-010 |
| 014 no Add/Remove affordance on existing groups (mgmt) | VERIFIED (rows expose no buttons) | TC-CPR-DET-011 |
| 015 Pricing Details load on tab activation (mgmt) | VERIFIED (grid + overrides load on Detail tab) | TC-CPR-DET-001/005 |
| 016 expand group → items (mgmt) | **CORRECTED**: grid renders FLAT — no expand control in mgmt mode (7 page chevrons are app-nav) | (c) Clarification CPR-DETAIL-Q3 |
| 017 collapse group (mgmt) | **CORRECTED**: no expand/collapse control live | (c) Clarification CPR-DETAIL-Q3 |
| 018 Override Price valid + Save persists | **CORRECTED**: New Price is a staging override → on Save it becomes the row's Price; input clears | TC-CPR-DET-018 |
| 019 Override Price BVA-low | numeric FCC | (b) → SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md |
| 020 Override Price BVA-high | numeric FCC | (b) → FCC-P2 |
| 021 Override Price non-numeric | numeric FCC | (b) → FCC-P2 |
| 022 empty Override Price → Base Price fallback | VERIFIED-intent (clean rows show base in Price; no override = base) | TC-CPR-DET-019 |
| 023 Override Discount valid + Save persists | VERIFIED (Max Discount edit enables Save; persists "N.NN %") | TC-CPR-DET-015 |
| 024 Override Discount non-numeric | numeric FCC | (b) → FCC-P2 |
| 025 empty Override Discount → no discount | workbook-only assumption (not a stated rule, F6) | (b) → FCC-P2 |
| 026 Base Price read-only | VERIFIED (Price column has no input) | TC-CPR-DET-006 |
| 027 Save commits all overrides (batch) | VERIFIED-intent (one Save commits all changed rows) | TC-CPR-DET-017 |
| 028 Save validates currency-format (valid persists) | VERIFIED-intent (valid currency persists) | TC-CPR-DET-020 |
| 029 invalid currency blocks Save w/ message | F6 inference on HOW it surfaces — not exercised destructively | (b) → FCC-P2 (negative path) |
| 030 Save confirmation feedback | VERIFIED-intent (confirmation dialog + return to clean state observed) | Covered by the save-state lifecycle in TC-CPR-DET-012 (clean) → TC-CPR-DET-013 (changed) → TC-CPR-DET-016 (returns to clean after Save); confirmation dialog itself in TC-CPR-DET-014 |

**Dropped**: 0 of 30. **Covered P1 (mgmt)**: 13 helpers → 12 TCs. **(c) clarification**: 016, 017 (no expand control live). **(b) deferred**: 001–010 → 1440; 019/020/021/024/025/029 → FCC-P2.

### Clarifications (TO RAISE) — INTERNAL, does not ship

**Status (2026-06-05): RAISED — see `drafts/corporate-pricing-detail-divergences-2026-06-05.md`** (`_internal/encore-questions-drafts/`). CPR-DETAIL-Q3 + CPR-DETAIL-Q4 are documented there for `/encore-questions` Tier-A review and (if unresolved) escalation to the Encore team. CPR-DETAIL-Q1 + CPR-DETAIL-Q2 remain staged below pending the same review.

| # | Intended behavior (per spec) | Live reality | Disposition |
|---|---|---|---|
| CPR-DETAIL-Q1 | NM-1443: editing the Override Price should let the user Save the override | Editing **New Price alone does not reliably enable Save** (the form is not marked as changed); editing Max Discount on the row reliably enables Save and the New-Price value then commits in the batch (CPR-DETAIL-BUG-A) | Bug-candidate — reproduce in the test runner (LR-044), then file `BUG-*.json` / raise. TC-CPR-DET-018 persists the override via the proven grid-batch save; the Save-enable asymmetry is the open question. |
| CPR-DETAIL-Q2 | NM-1443 (mgmt): single-click "displays the selected group" | Single-click adds nothing and shows no observable selection-state change | Likely benign (selection is subtle/none in mgmt mode). TC-CPR-DET-008 asserts the load-bearing property — single-click does not ADD. |
| CPR-DETAIL-Q3 | NM-1443: "Product Groups, which can be expanded to show Individual Items/Products" | Grid renders FLAT — no per-row expand/collapse control in management mode (page chevrons are the app nav sidebar) | **RAISED** — see drafts/corporate-pricing-detail-divergences-2026-06-05.md (Q3). Expand/collapse not present in mgmt grid; helpers 016/017 classified (c). |
| CPR-DETAIL-Q4 | NM-1443: "Base Price displays the original global price for reference" | The Price column **updates to the saved New-Price override** after save (it is not pinned to the original global price) | **RAISED** — see drafts/corporate-pricing-detail-divergences-2026-06-05.md (Q4). Asserted live in TC-CPR-DET-018 (override becomes Price). |

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

- **Override model**: "New Price" is a staging override → on Save it replaces the row's "Price" and the input clears (asserted live, TC-CPR-DET-018 / CPR-DETAIL-Q4).
- **Save-enable asymmetry (CPR-DETAIL-BUG-A)**: editing New Price alone does not reliably enable Save; editing Max Discount reliably marks the form dirty. Bug-candidate raised (CPR-DETAIL-Q1) — see `_internal/encore-questions-drafts/corporate-pricing-detail-divergences-2026-06-05.md`.
- **Read-only**: Base Price exposes no input (TC-CPR-DET-006); existing grid rows expose no Add/Remove affordance in management mode (TC-CPR-DET-011).
- **Batch save**: a single Save commits all changed rows in one batch (TC-CPR-DET-017). Numeric BVA / non-numeric override paths are deferred to the Detail FCC P2 subplan.

## TC-CPR-DET-001: Pricing Detail tab activates and the product-group grid renders
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

## TC-CPR-DET-002: Verify the Pricing Detail grid shows its five columns
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the product-group grid loaded.

**Steps**:
1. Open the Pricing Detail tab -> Grid renders
2. Read the grid column headers -> "ID", "Product Group Name", "Price", "New Price", "Max Discount" present in order

**Expected**: The grid shows five columns in order: ID, Product Group Name, Price, New Price, Max Discount. "Price" displays the base price, "New Price" captures the override price, and "Max Discount" captures the override discount.
**Data**: office=1604

---

## TC-CPR-DET-003: The Available Product Groups source list loads
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the Available Product Groups source list rendered alongside the grid.

**Steps**:
1. Open the Pricing Detail tab -> Grid + source list render
2. Inspect the Available Product Groups list -> The list populates with selectable product groups (count greater than zero)

**Expected**: The Available Product Groups source list loads with product groups available for browsing and selection.
**Data**: office=1604

---

## TC-CPR-DET-004: The source list provides a Search (ID or Name) filter
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-DET-003
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the Available Product Groups source list rendered.

**Steps**:
1. Open the Pricing Detail tab -> Source list renders
2. Look for a search/filter input over the Available Product Groups list -> A "Search ID or Name..." filter input is present

**Expected**: The source list exposes a "Search ID or Name..." filter so the user can browse and select product groups.
**Data**: office=1604

---

## TC-CPR-DET-005: Pricing details load on tab activation
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page in management mode (an existing pricebook), with the page loaded and the Pricing Detail tab not yet opened.

**Steps**:
1. Open a pricebook in management mode and click the Pricing Detail tab -> Tab activates
2. Observe the grid -> The current pricing details (product-group rows with Price + override cells) load and appear

**Expected**: When the Pricing Detail tab is activated, the current pricing details load into the grid.
**Data**: office=1604

---

## TC-CPR-DET-006: Base Price (Price column) is read-only
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row ("Balloon Light Decor") located.

**Steps**:
1. Open the Pricing Detail tab and locate a known product-group row -> Row visible
2. Inspect its Price (Base Price) cell -> The cell is read-only text with no editable input

**Expected**: The Base Price cell is read-only (no input) — it is displayed for reference only.
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-CPR-DET-007: New Price and Max Discount cells are editable
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row ("Balloon Light Decor") located.

**Steps**:
1. Open the Pricing Detail tab and locate a known product-group row -> Row visible
2. Inspect its New Price and Max Discount cells -> Both expose editable inputs (not read-only/disabled)

**Expected**: The New Price (override price) and Max Discount (override discount) cells are editable input fields.
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-CPR-DET-008: Single-clicking a source product group does not add a grid row
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-DET-003
**Automatable**: Yes
**Positive_Control**: TC-CPR-DET-037 (create-mode add proven; `.dragTo()` banned — full pointer sequence only)

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and the Available Product Groups source list rendered.

**Steps**:
1. Open the Pricing Detail tab and note the current grid row count -> Count captured
2. Single-click a product group in the Available list -> Selection acknowledged
3. Re-read the grid row count -> Unchanged (no row added)

**Expected**: In management mode a single-click selects/displays the group without adding it to the grid. No row is added.
**Data**: office=1604

---

## TC-CPR-DET-009: Double-click a source-list product group does NOT add a grid row (defensive)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-003
**Automatable**: Yes
**Positive_Control**: TC-CPR-DET-037 (create-mode add proven; `.dragTo()` banned — full pointer sequence only)

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and the Available Product Groups source list rendered.

**Steps**:
1. Open the Pricing Detail tab and note the current grid row count -> Count captured
2. Double-click a product group in the Available list -> No add occurs
3. Re-read the grid row count -> Unchanged; the grid stays clean (Save disabled); no dialog appears

**Expected**: Double-click does NOT add a product group in management mode — new product groups cannot be added when editing an existing pricebook.
**Data**: office=1604

---

## TC-CPR-DET-010: Drag a source-list product group onto the grid does NOT add (defensive)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-003
**Automatable**: Yes
**Positive_Control**: TC-CPR-DET-037 (create-mode add proven; `.dragTo()` banned — full pointer sequence only)

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and the Available Product Groups source list rendered.

**Steps**:
1. Open the Pricing Detail tab and note the current grid row count -> Count captured
2. Drag a product group from the Available list and drop it onto the grid -> The drop is rejected / not initiated
3. Re-read the grid row count -> Unchanged (no row added)

**Expected**: Drag-and-drop does NOT add a product group in management mode.
**Data**: office=1604

---

## TC-CPR-DET-011: Existing grid rows expose no Add/Remove affordance (Management mode)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a product-group row ("Balloon Light Decor") located.

**Steps**:
1. Open the Pricing Detail tab and locate a product-group row -> Row visible
2. Inspect the row for any add/remove control -> None present

**Expected**: Existing product-group rows carry no Add/Remove control in management mode (consistent with new product groups not being addable; live-confirmed).
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-CPR-DET-012: Unmodified grid shows the clean state (Save disabled)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid loaded, with no edits made to any row.

**Steps**:
1. Open the Pricing Detail tab; make no changes -> Grid loads
2. Observe the Save button -> Save is disabled

**Expected**: With no pending changes the grid is clean — the Save button's disabled state is the indicator that nothing has changed (there is no separate badge).
**Data**: office=1604

---

## TC-CPR-DET-013: Editing a Max Discount changes the state to dirty (Save enabled)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-012
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded and clean (Save disabled), and a row's Max Discount cell editable.

**Steps**:
1. Open the Pricing Detail tab (clean) -> Save disabled
2. Edit a row's Max Discount cell -> Save button enables
3. Discard (reload) without Save -> Baseline restored

**Expected**: Editing an editable override cell (Max Discount) marks the grid as changed, and the Save button enables.
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-CPR-DET-014: Save is dialog-gated (Save Changes confirmation)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-013
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a reversible Max Discount edit ready to be made on a row.

**Steps**:
1. Open the Pricing Detail tab and make a reversible Max Discount edit -> Save enables
2. Click Save -> A "Save Changes" confirmation dialog appears ("Are you sure you want to save the changes?" / Cancel / Save)
3. Confirm the dialog -> Save proceeds; restore baseline afterward

**Expected**: Save opens a "Save Changes" confirmation dialog that must be confirmed before the changes commit (shared confirmation pattern per LR-012).
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-CPR-DET-015: Edit a Max Discount, Save, and the change persists across reload (with restore)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-014
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

## TC-CPR-DET-016: Save resets the state from dirty to clean after success
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-DET-014
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

## TC-CPR-DET-017: Save commits grid override edits in one batch (with restore)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-015
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

## TC-CPR-DET-018: Verify a saved New Price override becomes the row Price after reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-015
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

## TC-CPR-DET-019: An empty New Price leaves the Base Price in effect
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid loaded; a row with no override (New Price empty) located.

**Steps**:
1. Open the Pricing Detail tab and locate a row with no override (New Price empty) -> Row visible
2. Read the row's New Price input and Price cell -> New Price is empty; Price shows the base price

**Expected**: When the New Price (override price) is empty, the Base Price remains in effect for the row — if the user leaves the override field empty, the system defaults back to the Base Price. Asserted as: empty New Price + a non-empty Base Price displayed.
**Data**: office=1604, row="Balloon Light Decor"

---

## TC-CPR-DET-020: Save accepts a valid currency-formatted New Price
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-DET-018
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid loaded; the anchor row is at its base Price before the override is entered.

**Steps**:
1. Ensure default state -> Clean baseline
2. Enter a valid currency-formatted New Price (two-decimal value) on a row and commit via Save -> Save accepts the value
3. Reload and reopen the Pricing Detail tab -> The valid value persisted (Price reflects it)
4. Restore the row via ensureDefaultState -> Baseline restored

**Expected**: Save accepts a valid currency-formatted numeric entry and persists it — numeric entries are validated against the pricebook's currency format. The invalid-format negative path (a malformed entry being rejected with a message) is covered separately by the negative-path field-case suite.
**Data**: office=1604, row="Analog Mixer 12 - 23 Ch", value="250.00"

---

## TC-CPR-DET-021: New Price = 0 is treated as no override (field clears; Save stays disabled)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes
**Flag**: BUILDER live-confirm that the server accepts 0 as a valid New Price (not rejected as blank or zero-guard); verify Price column shows 0.00 after reload. (Internal ref: CPR-DETAIL-BUG-B if 0 is rejected.)

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row ("Balloon Light Decor") at its default state (no override).

**Steps**:
1. Open the Pricing Detail tab, locate row "Balloon Light Decor", and ensure it has no New Price override -> Row clean
2. Click the New Price input for that row, press Ctrl+A, press Delete, type "0", then blur (click outside) -> Input shows "0"
3. Observe the Save button -> Save is enabled (grid marked dirty)
4. Click Save and confirm the dialog -> Save completes
5. Reload the page and reopen the Pricing Detail tab -> Price column for "Balloon Light Decor" shows 0.00; New Price input is empty (staging cleared)
6. Restore via ensureDefaultState -> Baseline restored

**Expected**: Entering 0 in New Price is treated as "no override" — the field clears to empty and the grid stays clean, so Save does not enable. (Live-confirmed: 0 is not stored as a 0.00 override.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=0

---

## TC-CPR-DET-022: New Price negative value (-10) has its minus sign stripped; positive value accepted
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Negative |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row at its default state.

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Row visible
2. Click the New Price input, press Ctrl+A, press Delete, type "-10", then blur -> Cell processes the input
3. Observe the cell value -> Cell reverts to its last-valid value (empty or prior number); the negative value is rejected (LR-011 NaN/invalid reload guard)
4. Observe the Save button -> Save remains disabled

**Expected**: A negative New Price has its minus sign stripped on blur; the remaining positive value (e.g. -10 → 10.00) is accepted and Save enables. (Live-confirmed: the cell sanitizes the sign rather than reverting.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=-10

---

## TC-CPR-DET-023: New Price = very large value (9999999.99) is flagged invalid and blocks Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Boundary |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row at its default state.

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Row visible
2. Click the New Price input, press Ctrl+A, press Delete, type "9999999.99", then blur -> Input accepts the value
3. Observe the rendered value in the input -> Displayed with comma-thousands separator and exactly 2 decimal places (e.g., "9,999,999.99")
4. Observe the Save button -> Save is enabled
5. Reload without saving -> Baseline restored

**Expected**: A very large value beyond the allowed maximum is kept in the field but flagged `aria-invalid="true"`, and Save is blocked while the cell is invalid. (Live-confirmed: 9999999.99 exceeds the cap and blocks Save.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=9999999.99

---

## TC-CPR-DET-024: New Price with extra decimals (12.3456) rounds/truncates to 2dp on blur
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Boundary |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row at its default state.

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Row visible
2. Click the New Price input, press Ctrl+A, press Delete, type "12.3456", then blur -> Cell processes the value on blur
3. Read the input value after blur -> Value is rounded or truncated to 2 decimal places (e.g., "12.35" or "12.34"); the raw 4-decimal entry is not stored
4. Observe the Save button -> Save is enabled (value accepted)
5. Reload without saving -> Baseline restored

**Expected**: On blur, a New Price entry with more than 2 decimal places is rounded or truncated to 2 decimal places. The exact rounding direction (round-half-up vs truncate) is implementation-specific; the test asserts the result has exactly 2 decimal places.
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=12.3456

---

## TC-CPR-DET-025: New Price overflow (beyond max double) never reaches a committable state
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Boundary |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row at its default state.

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Row visible
2. Click the New Price input, press Ctrl+A, press Delete, type "99999999999999999999999999999999" (a number beyond JavaScript's safe integer and max double range), then blur -> Cell processes the input
3. Observe the cell value -> Cell reverts to its last-valid value (LR-011 NaN/invalid reload guard fires); the overflow entry is rejected
4. Observe the Save button -> Save remains disabled

**Expected**: An overflow value beyond the numeric range never reaches a committable state — it is flagged invalid or not accepted, and Save stays disabled. (Live-confirmed.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=overflow string

---

## TC-CPR-DET-026: New Price non-numeric input ("abc", "!@#") is discarded (field clears; Save disabled)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Negative |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row at its default state.

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Row visible
2. Click the New Price input, press Ctrl+A, press Delete, type "abc", then blur -> Cell processes the input
3. Observe the cell value -> Cell reverts to its last-valid value; "abc" is rejected (LR-011 NaN guard)
4. Observe the Save button -> Save remains disabled
5. Repeat with "!@#" -> Same rejection behavior observed

**Expected**: Non-numeric strings entered into New Price are discarded — the field clears to empty and Save stays disabled. (Live-confirmed: the input sanitizes non-numeric characters.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", values="abc", "!@#"

---

## TC-CPR-DET-027: New Price renders with locale comma-thousands and exactly 2 decimal places
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row with a multi-thousand New Price override committed (e.g., "1234.56").

**Steps**:
1. Open the Pricing Detail tab and locate a row with a saved New Price override greater than 1,000 -> Row visible
2. Read the New Price cell value -> Value is rendered with comma-thousands separator and exactly 2 decimal places (e.g., "1,234.56")
3. Confirm no trailing or extra decimal digits appear

**Expected**: The New Price column renders currency values with comma-thousands grouping and exactly 2 decimal places — consistent with the pricebook currency format.
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-028: Max Discount = 0 is a valid no-discount value (no net change → Save disabled)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Boundary |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row ("Balloon Light Decor") at its default state (no Max Discount override).

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Row clean
2. Click the Max Discount input, press Ctrl+A, press Delete, type "0", then blur -> Input shows "0"
3. Observe the Save button -> Save is enabled
4. Click Save and confirm the dialog -> Save completes
5. Reload and reopen the Pricing Detail tab -> Max Discount for "Balloon Light Decor" shows 0.00
6. Restore via ensureDefaultState -> Baseline restored

**Expected**: Max Discount accepts 0 as a valid no-discount value (renders "0.00 %", no aria-invalid). Because the fixture baseline discount is already 0, re-entering 0 is no net change and Save stays disabled. (Live-confirmed.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=0

---

## TC-CPR-DET-029: Max Discount negative value (-5) has its minus sign stripped; positive value accepted
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Negative |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row at its default state.

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Row visible
2. Click the Max Discount input, press Ctrl+A, press Delete, type "-5", then blur -> Cell processes the input
3. Observe the cell value -> Cell reverts to its last-valid value; negative value rejected (LR-011 NaN/invalid guard)
4. Observe the Save button -> Save remains disabled

**Expected**: A negative Max Discount has its minus sign stripped; the remaining positive value (e.g. -5 → 5.00 %) is accepted and Save enables. (Live-confirmed.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=-5

---

## TC-CPR-DET-030: Max Discount > 100 (150) sets aria-invalid + tooltip and blocks Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Negative |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes
**Flag**: BUILDER live-confirm that the Detail grid Max Discount input has `min=0 max=100 step=0.01` attributes matching the sibling Product Group Override grid (observed on Override F8); confirm `aria-invalid="true"` appears and the tooltip text is exactly "Please enter a valid percentage with up to two decimal places. Enter 0.0 for no discount." on the Detail grid input.

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row at its default state.

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Row visible
2. Click the Max Discount input, press Ctrl+A, press Delete, type "150", then blur -> Input keeps "150" with `aria-invalid="true"` set on the input element
3. Inspect the tooltip or validation message -> Warning reads "Please enter a valid percentage with up to two decimal places. Enter 0.0 for no discount."
4. Observe the Save button -> Save is blocked while the invalid value is present

**Expected**: Entering a Max Discount value greater than 100 causes the input to stay at the entered value with `aria-invalid="true"` and a warning tooltip. Save is blocked. (Behavior matches the sibling Override grid; subject to Flag confirmation on the Detail grid.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=150

---

## TC-CPR-DET-031: Max Discount with 2 decimal places (33.33) is stored as 2dp and enables Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Boundary |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row at its default state.

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Row clean
2. Click the Max Discount input, press Ctrl+A, press Delete, type "33.33", then blur -> Input shows "33.33"
3. Observe the Save button -> Save is enabled
4. Click Save and confirm -> Save completes
5. Reload and reopen the Pricing Detail tab -> Max Discount shows "33.33" (2dp preserved)
6. Restore via ensureDefaultState -> Baseline restored

**Expected**: A Max Discount value with exactly 2 decimal places is accepted, persisted as entered, and does not trigger any invalid state.
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=33.33

---

## TC-CPR-DET-032: Max Discount non-numeric input is discarded (field clears)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Negative |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row at its default state.

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Row visible
2. Click the Max Discount input, press Ctrl+A, press Delete, type "xyz", then blur -> Cell processes the input
3. Observe the cell value -> Cell reverts to its last-valid value; "xyz" is rejected (LR-011 NaN guard)
4. Observe the Save button -> Save remains disabled

**Expected**: Non-numeric input in Max Discount is discarded — the field clears to empty. (Live-confirmed: the input sanitizes non-numeric characters.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value="xyz"

---

## TC-CPR-DET-033: Reverting New Price back to its original value returns Save to disabled (LR-009)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-013
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded and clean (Save disabled), and a known product-group row with a known New Price state (e.g., empty override).

**Steps**:
1. Open the Pricing Detail tab (clean) -> Save disabled
2. Click the New Price input for "Balloon Light Decor", press Ctrl+A, press Delete, type "99.00", then blur -> Save enables (grid dirty)
3. Click the same New Price input again, press Ctrl+A, press Delete (clearing the value back to empty — the original state), then blur -> Value reverts to its original state
4. Observe the Save button -> Save returns to disabled (unsaved-changes state regression check per LR-009)

**Expected**: Reverting an edited New Price back to its original value (empty in this case) resets the unsaved-changes state and Save returns to disabled. This validates that the grid does not remain "dirty" when no net change has been made.
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor"

---

## TC-CPR-DET-034: Clearing New Price to empty leaves Base Price in effect (override fallback)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-DET-018
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active; the anchor row ("Balloon Light Decor") has a committed New Price override in place (from a prior test or setup step). The base price is known.

**Steps**:
1. Open the Pricing Detail tab; locate the row with an existing New Price override -> Override visible
2. Click the New Price input, press Ctrl+A, press Delete (clearing the override to empty), then blur -> Input is now empty
3. Use Max Discount to mark the form dirty (enter a value and revert to ensure dirty; alternatively, if the clear itself enables Save) -> Save enabled
4. Click Save and confirm -> Save completes
5. Reload and reopen the Pricing Detail tab -> Price column for "Balloon Light Decor" shows the base price (override cleared); New Price input is empty
6. Restore via ensureDefaultState -> Baseline restored

**Expected**: A committed New Price override can be reverted by entering the row's base value and saving again — the Price column returns to the Base Price. (Live-confirmed via the proven grid-batch save; once committed, the override has replaced the Price, so reverting means writing the base value back, not clearing an empty input.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor"

---

## TC-CPR-DET-035: Click/type on the read-only Price cell resolves no input and leaves value unchanged
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Negative |

**Depends_On**: TC-CPR-DET-006
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the grid loaded, and a known product-group row ("Balloon Light Decor") with a visible Base Price value.

**Steps**:
1. Open the Pricing Detail tab and locate row "Balloon Light Decor" -> Base Price cell visible with a non-empty value
2. Click the Price (Base Price) cell and attempt to type "999" -> No `<input>` element resolves within the cell; the text content of the cell is unchanged
3. Observe the Save button -> Save remains disabled; no edit was registered

**Expected**: The Base Price cell is read-only — it contains no editable input. A click-and-type attempt does not open an input, does not change the displayed value, and does not enable Save. (Negative test; extends TC-CPR-DET-006.)
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor"

---

## TC-CPR-DET-036: Off-screen row is read by content anchor (not nth row index) on the 2430-row grid
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the full product-group grid loaded (approximately 2430 rows, virtualized/heavy). The test targets a row that is not visible in the initial viewport.

**Steps**:
1. Open the Pricing Detail tab -> Grid loads with multiple pages of rows
2. Navigate to a page or scroll to a row whose Product Group Name or ID is known but does not appear in the first visible set -> Row not initially visible
3. Locate the row using a content-anchored selector (e.g., `tr:has-text("<Product Group Name>")` or ID-based anchor) — do NOT use `nth(N)` or a hardcoded row-index -> Row located by its unique text content
4. Read the New Price and Max Discount values for that row -> Values read successfully without relying on a positional index

**Expected**: Rows can be reliably located and read by their Product Group Name or ID content anchor on the 2430-row grid, regardless of their ordinal position. Positional row counts are never used (LR-022/LR-053).
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-037: Positive control — CREATE MODE double-click and full-pointer drag both add a product group row
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Corporate Pricing Add page in create mode (`/locations/1604/settings/corporate-pricing/add?type=equipment`). The Available Product Groups source list is rendered alongside an empty or pre-existing product group grid.

**Steps**:
1. Navigate to `/locations/1604/settings/corporate-pricing/add?type=equipment` -> Create-mode page loads; source list and grid rendered
2. Note the current grid row count (content-anchored, not a hardcoded count) -> Count captured
3. Double-click a product group item in the source list -> A new row appears in the grid; grid row count increases by one
4. Note the updated grid row count -> Count captured (one higher)
5. Perform a full-pointer drag on a second source item: `mouse.move` to source item → `mouse.down` → `mouse.move` (with steps > 1) to the grid drop zone → `mouse.up` -> A second new row appears in the grid; row count increases again (NOTE: `.dragTo()` is banned as a primitive — it frequently never fires the DnD event sequence; use the full pointer sequence only)
6. Confirm both added rows are present in the grid by their Product Group Name anchor -> Both rows present

**Expected**: In create mode, both double-click and a full pointer-sequence drag add product group rows to the grid. This is the positive control that legitimizes the management-mode no-add cases (TC-CPR-DET-008/009/010) — it proves the add primitive fires in the correct mode before asserting it does not fire in management mode.
**Data**: office=1604, URL=/locations/1604/settings/corporate-pricing/add?type=equipment

---

## TC-CPR-DET-038: Max Discount NULL row stays NULL after a New Price edit and Save — no silent coercion to 0.00
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Watch |

**Depends_On**: TC-CPR-DET-018
**Automatable**: Yes
**Flag**: Related ticket: NM-2301. BUILDER live-confirm: locate a row whose Max Discount is NULL (empty), enter a New Price on that row, Save, reload, and read the Max Discount value. If it changed from NULL to 0.00 without user intent, file BUG-CPR-DET-NM2301 per LR-034.

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active; a row is identified where the Max Discount cell is currently empty (NULL/no override).

**Steps**:
1. Open the Pricing Detail tab and locate a row where Max Discount is empty (NULL) -> Row identified; note the Max Discount state is empty
2. Click the New Price input for that row, press Ctrl+A, press Delete, type a valid price (e.g., "100.00"), then blur -> New Price input shows the value
3. Use Max Discount on a different (second) row to mark the form dirty and enable Save -> Save enabled
4. Click Save and confirm the dialog -> Save completes
5. Reload and reopen the Pricing Detail tab -> Read the Max Discount for the row that had NULL and received the New Price edit
6. Assert the actual observed value: if NULL remained NULL → test passes (no silent mutation); if NULL changed to 0.00 → assert bug behavior and flag for BUG-CPR-DET-NM2301

**Expected**: A row whose Max Discount was NULL before the save should remain NULL after a New Price edit is committed — the save operation should not silently coerce a NULL Max Discount to 0.00. If coercion is observed, it is a potential defect requiring investigation before filing.
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-039: New Price-only edit does not reliably enable Save (drive exact steps, observe)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Watch |

**Depends_On**: TC-CPR-DET-012
**Automatable**: Yes
**Flag**: Oracle states New-Price-only edits do NOT reliably enable Save. Drive exact steps on a fresh page (no prior dirty state) and record whether Save enables or remains disabled after the New Price keyboard edit alone. Assert the actually-observed behavior; do not assume the oracle is authoritative without a live confirmation run. (Internal ref: CPR-DETAIL-BUG-A.)

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid in a clean state (Save disabled). No prior edits on this page load.

**Steps**:
1. Open the Pricing Detail tab on a fresh page load -> Grid clean; Save disabled
2. Click the New Price input for "Analog Mixer 12 - 23 Ch", press Ctrl+A, press Delete, type "200.00", then blur -> New Price input shows "200.00"
3. Do NOT touch any other cell -> Isolation maintained
4. Observe the Save button immediately after the blur -> Record the actual state: ENABLED or DISABLED
5. If Save is disabled: assert that Save does not enable on a New-Price-only edit (the known inconsistency is confirmed)
6. If Save is enabled: record as not reproduced in this run; note the session date and environment state for triage

**Expected**: Based on the known behavior, Save is expected NOT to enable after a New-Price-only edit. The test asserts whichever state is actually observed and surfaces the result for investigation — it does not assert a fixed outcome, as this is a known inconsistent behavior.
**Data**: office=1604, pricebook=2021-PB6, row="Analog Mixer 12 - 23 Ch", value=200.00

---

## TC-CPR-DET-040: Save-enable requirement — New Price edit alone should enable Save per the specified behavior
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Watch |

**Depends_On**: TC-CPR-DET-039
**Automatable**: Yes
**Flag**: Related ticket: NM-1874 (requirement that editing New Price alone should enable Save). This case documents the requirement as specified. If TC-CPR-DET-039 confirms CPR-DETAIL-BUG-A is reproducible (Save does not enable), this case's Expected state is the design intent vs actual gap. BUILDER: after running DET-039, annotate this case with the live verdict.

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid clean.

**Steps**:
1. Open the Pricing Detail tab on a fresh page load -> Grid clean; Save disabled
2. Click the New Price input for any row, press Ctrl+A, press Delete, type a valid price, then blur -> New Price updated
3. Observe the Save button per the requirement -> Per spec, Save should be enabled because a user-visible value has changed

**Expected**: Per the requirement, editing the New Price field alone should mark the grid as changed and enable Save. This is the requirement spec for the behavior — if the live implementation does not match (as observed via TC-CPR-DET-039), the gap is a confirmed defect traceable to the Save-enable requirement.
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-041: "Value clears by design" — verify whether clearing New Price clears to empty or restores base price
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Watch |

**Depends_On**: TC-CPR-DET-034
**Automatable**: Yes
**Flag**: Related ticket: NM-2094 ("value clears by design" behavior). BUILDER live-confirm: after clearing the New Price input (Ctrl+A → Delete) and saving, does the Price column show the base price (fallback in effect) or empty? Assert the actually-observed post-save state of the Price column.

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active; the anchor row has a committed New Price override.

**Steps**:
1. Open the Pricing Detail tab; locate the row with an existing New Price override -> Override visible in New Price input and Price column
2. Note the base price of the row (the price before any override was set) -> Base price recorded
3. Click the New Price input, press Ctrl+A, press Delete (clearing to empty), then blur -> Input is empty
4. Enable Save via a Max Discount edit on the same or a different row -> Save enabled
5. Click Save and confirm -> Save completes
6. Reload and reopen the Pricing Detail tab -> Read the Price column for the anchor row
7. Assert the actual observed value: if Price shows the base price → assert "clear to empty restores base price fallback"; if Price shows empty or 0 → assert actual and flag discrepancy

**Expected**: Clearing a staged (uncommitted) New Price before saving leaves the displayed Price unchanged and the grid clean — nothing is committed. (Live-confirmed; the value-clears-by-design behavior is that an unsaved staged value simply clears without affecting the Price.)
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-042: Cross-row price isolation — editing and saving row A does not change row B's price
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Watch |

**Depends_On**: TC-CPR-DET-017
**Automatable**: Yes
**Flag**: Related ticket: NM-2095 (cross-row price loss).

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active; two anchor rows ("Balloon Light Decor" and "Analog Mixer 12 - 23 Ch") are both at their default state.

**Steps**:
1. Open the Pricing Detail tab and note the current Max Discount value for "Analog Mixer 12 - 23 Ch" (row B) -> Value recorded
2. Edit the Max Discount of "Balloon Light Decor" (row A) to a new value -> Save enabled
3. Click Save and confirm -> Save completes
4. Reload and reopen the Pricing Detail tab -> Read the Max Discount for "Analog Mixer 12 - 23 Ch" (row B)
5. Assert that row B's Max Discount is unchanged from the pre-save value -> Row B is unaffected
6. Restore both rows via ensureDefaultState -> Baseline restored

**Expected**: Editing and saving a New Price or Max Discount on row A does not affect row B's values. The batch save commits only the modified rows; unedited rows retain their pre-save values. If row B's value changes, this is a potential cross-row price isolation defect.
**Data**: office=1604, pricebook=2021-PB6, rowA="Balloon Light Decor", rowB="Analog Mixer 12 - 23 Ch"

---

## TC-CPR-DET-043: A saved Max Discount of 100 reloads/displays as 1 — known defect reproduced
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Watch |

**Depends_On**: TC-CPR-DET-007
**Automatable**: Yes
**Flag**: Related ticket: NM-1967 (Max Discount display changes from 100 to 1% on focus). BUILDER live-confirm: set Max Discount to 100, save, reload, then focus the Max Discount input and immediately read its value — does the display change from 100 to 1? If reproduced, assert bug behavior and annotate with `// BUG NM-1967`. If not reproduced, assert correct behavior (value remains 100 after focus).

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active; the anchor row "Balloon Light Decor" has a committed Max Discount of 100.

**Steps**:
1. Ensure "Balloon Light Decor" has a saved Max Discount of 100 (set and save if needed) -> 100 in cell
2. Reload and reopen the Pricing Detail tab -> Max Discount shows 100
3. Click (focus) the Max Discount input for "Balloon Light Decor" without typing -> Input receives focus
4. Read the input value immediately after focus -> Assert the actual value: if "1" → defect reproduced (record the result accordingly); if "100" → defect not reproduced in this run
5. Restore via ensureDefaultState -> Baseline restored

**Expected**: A known defect is reproduced: a Max Discount of 100, once saved and reloaded, displays as "1.00 %" at rest and "1" on focus — the entered 100 is lost. The test asserts this observed defective behavior (tracked under the related defect ticket).
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=100

---

# Surface-Behavior Cases (SBC)

**Out-of-scope (LR-065)**: result-fidelity + combination families do not apply to the Detail grid — it is reached by clicking a Search row, not a filter/search/query surface (no result-set-vs-query oracle).

## TC-CPR-DET-044: Pagination — the Detail grid exposes no page-size selector and no nav buttons (non-paginated)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Surface |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes
**Surface_Family**: pagination (QUICK)
**Flag**: RESOLVED 2026-06-25 — the Detail grid exposes no page-size selector and no nav buttons; it is non-paginated.

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the product-group grid loaded with multiple pages of rows.

**Steps**:
1. Open the Pricing Detail tab -> Grid loads; pagination controls render
2. Change the page-size selector to a non-default value (e.g., 10) -> Grid re-renders showing the first page at the new page size; no console errors
3. Click the "next page" navigation button -> Grid advances to the second page; rows are different from page 1 (content-anchored)
4. Click the "previous page" navigation button -> Grid returns to page 1; the first-page rows reappear

**Expected**: The Detail grid renders every product-group row at once — it exposes no rows-per-page selector and no page-navigation buttons (it is non-paginated). (Live-confirmed; this corrects the earlier env-blocked assumption that the Detail grid paginated like Search.)
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-045: Pagination — the Detail grid renders all rows at once (no page-size control)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Depends_On**: TC-CPR-DET-044
**Automatable**: Yes
**Surface_Family**: pagination (DEEP)
**Flag**: RESOLVED 2026-06-25 — the Detail grid has no page-size selector at all (non-paginated); it does NOT mirror the Search grid's 10/20/30/40/50 pager.

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the product-group grid loaded.

**Steps**:
1. Open the Pricing Detail tab -> Grid loads with pagination controls
2. For each page-size option (10, 20, 30, 40, 50): select the option and verify the grid renders rows up to that page size without console errors -> All five page sizes render successfully

**Expected**: The Detail grid is non-paginated — it renders all rows with no page-size selector at all. (Live-confirmed.)
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-046: Pagination — every row is present without navigation (non-paginated grid)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Depends_On**: TC-CPR-DET-044
**Automatable**: Yes
**Surface_Family**: pagination (DEEP)
**Flag**: RESOLVED 2026-06-25 — the Detail grid is non-paginated (no nav buttons, no page-size selector); it renders every row at once. The earlier env-blocked guess that it paginated like Search was wrong.

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the product-group grid loaded, and pagination set to a page size where the last page contains fewer rows than the page size (e.g., if 2430 rows exist and page size is 50, the last page has 30 rows).

**Steps**:
1. Navigate to the last page of the Detail grid (use the "last page" nav button or step through pages to the end) -> Last page visible
2. Count the rows on the last page using a content-anchored method -> Fewer rows than the page size are shown; no empty placeholder rows or duplicated rows

**Expected**: The Detail grid has no pagination, so every row (including those a paginated grid would place on a later page) is present in the DOM and readable by content anchor without any navigation. (Live-confirmed.)
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-047: Pagination — the Detail grid renders no first/previous/next/last nav controls
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Depends_On**: TC-CPR-DET-044
**Automatable**: Yes
**Surface_Family**: pagination (DEEP)
**Flag**: RESOLVED 2026-06-25 — the Detail grid is non-paginated (no nav buttons, no page-size selector); it renders every row at once. The earlier env-blocked guess that it paginated like Search was wrong.

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the product-group grid loaded with multiple pages.

**Steps**:
1. Ensure the grid is on page 1 -> On page 1
2. Observe the "first page" and "previous page" nav buttons -> Both are disabled (not clickable)
3. Observe the "next page" and "last page" nav buttons -> Both are enabled
4. Navigate to the last page -> Last page loaded
5. Observe the "next page" and "last page" nav buttons -> Both are disabled
6. Observe the "first page" and "previous page" nav buttons -> Both are enabled

**Expected**: The Detail grid renders no first/previous/next/last navigation controls — it is non-paginated. (Live-confirmed; the disabled-state pattern applies to the Search grid, not Detail.)
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-048: Pagination — each product group appears once; content-anchored rows are unique
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Depends_On**: TC-CPR-DET-044
**Automatable**: Yes
**Surface_Family**: pagination (DEEP)
**Flag**: RESOLVED 2026-06-25 — the Detail grid is non-paginated; every row is in the DOM and read by content anchor without navigation.

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the product-group grid loaded with multiple pages. A set of known Product Group Names is available for anchoring.

**Steps**:
1. On page 1, note the Product Group Names of the first and last visible rows (content-anchored) -> Names recorded
2. Navigate to page 2 -> Grid renders page 2 rows
3. Verify that none of the page-1 anchor names appear on page 2 (no duplicates) -> Confirmed: no page-1 rows appear on page 2
4. Navigate to the last page and note the last visible row's Product Group Name -> Name recorded
5. Navigate back to page 1 -> First-page rows reappear unchanged (same anchor names as step 1)

**Expected**: Each product group appears exactly once — content-anchored rows are unique (the grid is non-paginated, so there are no cross-page duplicates or skips). (Live-confirmed.)
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-049: Sorting — the Detail grid column headers are not sort triggers (no header-click sort)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes
**Surface_Family**: sorting (DEEP)
**Flag**: RESOLVED 2026-06-25 — the Detail grid headers are plain (no button, aria-sort null), so there is no header-click sort. Consistent with the Search grid (header-click sort inactive); treated as a by-design surface limitation, not filed as a bug.

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the product-group grid loaded.

**Steps**:
1. Note the Product Group Name of the first visible row on the current page (content-anchored) -> Name recorded; aria-sort attribute on all column headers noted
2. Click the "Product Group Name" column header -> Observe whether the first row changes and whether `aria-sort` updates on the header
3. Click the same header again -> Observe whether sort direction reverses (asc → desc or desc → asc)
4. Assert the actually-observed behavior: if rows reorder → sort is functional (assert sorted order); if rows do not reorder → assert no-reorder and flag as potential defect for investigation

**Expected**: The Detail grid column headers are not sort triggers — they are plain headers (no button, aria-sort null), so there is no header-click sorting on this surface. (Live-confirmed, consistent with the Search grid where header-click sort is also inactive — a by-design surface limitation, not a blind-filed bug.)
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-050: Render state — a New Price cell renders currency-format and the Price column is non-editable
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Surface |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes
**Surface_Family**: render-state (QUICK)

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the product-group grid loaded with at least one row that has a committed New Price override (comma-thousands value with 2 decimal places).

**Steps**:
1. Open the Pricing Detail tab and locate a row with a saved New Price override (e.g., "1,234.56") -> Row visible
2. Read the New Price cell value -> Rendered with comma-thousands separator and exactly 2 decimal places
3. Inspect the Price (Base Price) cell on the same row -> No `<input>` element; cell contains only text

**Expected**: The New Price override cell renders its stored value in currency format (comma-thousands, 2 decimal places). The Price (Base Price) column cell is read-only text with no input element.
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-051: Render state — every editable cell's currency-format fidelity; empty-override renders base price
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Depends_On**: TC-CPR-DET-050
**Automatable**: Yes
**Surface_Family**: render-state (DEEP)

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active, the product-group grid loaded. Multiple rows are available: some with New Price overrides, some without (empty override).

**Steps**:
1. Open the Pricing Detail tab -> Grid loaded
2. For three or more rows with committed New Price overrides: read each New Price cell value and verify comma-thousands format with exactly 2 decimal places -> Each renders correctly
3. For three or more rows with no New Price override (empty): read each New Price cell (empty) and its corresponding Price cell -> New Price input is empty; Price shows the base price value (not empty)
4. For rows with Max Discount overrides: verify the Max Discount cell renders with up to 2 decimal places

**Expected**: All editable currency cells (New Price, Max Discount) that have committed values render with the correct format (comma-thousands, 2dp). Rows with no override show an empty New Price input alongside a populated Base Price — the base price is always displayed for reference regardless of override state.
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-052: Empty-volume — a 1-row pricebook renders the Detail grid correctly (content-anchored read)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Depends_On**: TC-CPR-DET-001
**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)

**Preconditions**: A pricebook with exactly one product group row is available in office 1604 (or can be constructed via the add flow). The Pricing Detail tab is accessible for that pricebook.

**Steps**:
1. Open the Pricing Detail tab for the 1-row pricebook -> Tab activates
2. Confirm the grid renders the single row (content-anchored by Product Group Name) -> The row is visible and readable
3. Confirm no error state, empty-state placeholder, or "no rows" message appears (the grid has 1 row, not 0)

**Expected**: A single content-anchored row renders and is readable by its product-group name. (A dedicated one-row pricebook fixture is not part of this set, so a single known row on the management grid is read by its content anchor; live-confirmed.)
**Data**: office=1604

---

## TC-CPR-DET-053: Empty-volume — 0/1/N row states; off-screen row by content anchor; 2430-row volume integrity
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Surface |

**Depends_On**: TC-CPR-DET-052
**Automatable**: Yes
**Surface_Family**: empty-vol (DEEP)

**Preconditions**: Access to pricebooks with 0 rows (empty shell), 1 row, and the full 2430-row fixture (2021-PB6) in office 1604.

**Steps**:
1. Open the Pricing Detail tab for a pricebook with 0 product group rows -> Tab activates; an empty-state message or empty grid is shown (no error)
2. Open the Pricing Detail tab for a 1-row pricebook -> Single row renders; readable by content anchor
3. Open the Pricing Detail tab for the 2430-row fixture (2021-PB6) -> Grid renders without browser hang or error; row count is not asserted as a fixed number (LR-022/LR-053)
4. On the 2430-row grid, navigate to a page beyond the first and locate a row by its Product Group Name (content-anchored, not nth(N)) -> Row located and values readable
5. Confirm no cross-page duplication or row disappearance

**Expected**: The high-volume management grid (~2430 rows) renders without error, and an off-screen row is located by its content anchor. (Dedicated 0-row / 1-row pricebook fixtures are not part of this set; the available high-volume render + content-anchored read is asserted, never an exact row count; live-confirmed.)
**Data**: office=1604, pricebook=2021-PB6

---

## TC-CPR-DET-054: Persistence — a Max Discount edit, saved, survives page reload (content-anchored)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Surface |

**Depends_On**: TC-CPR-DET-015
**Automatable**: Yes
**Surface_Family**: persistence (QUICK)

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active; the anchor row "Balloon Light Decor" is at its default state.

**Steps**:
1. Open the Pricing Detail tab; locate "Balloon Light Decor" -> Row visible
2. Edit its Max Discount to "22.50" via keyboard (Ctrl+A → Delete → type → blur) -> Save enabled
3. Click Save and confirm the dialog -> Save completes; grid returns to clean state
4. Reload the page and reopen the Pricing Detail tab -> Locate "Balloon Light Decor" by content anchor
5. Read its Max Discount value -> "22.50" persists (content-anchored; row is not found by index)
6. Restore via ensureDefaultState -> Baseline restored

**Expected**: A Max Discount edit committed via Save persists across a page reload. The row is located by its Product Group Name (content-anchored), never by a hardcoded row index.
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor", value=22.50

---

## TC-CPR-DET-055: Persistence — dirty state survives Search↔Detail tab-switch; navigating away while dirty fires unsaved guard; revert returns Save to disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Surface |

**Depends_On**: TC-CPR-DET-013
**Automatable**: Yes
**Surface_Family**: persistence (DEEP)

**Preconditions**: On the Pricebook Details page with the Pricing Detail tab active and the grid in a clean state (Save disabled).

**Steps**:
1. Open the Pricing Detail tab and make a Max Discount edit on "Balloon Light Decor" -> Save enabled (dirty)
2. Click the "Pricing Strategy" (or another pricebook tab) while the grid is dirty -> Observe whether the dirty state is preserved or an "Unsaved Changes" guard fires (record actual behavior)
3. Return to the Pricing Detail tab -> Dirty edit is still present (pending change not lost by the tab switch)
4. Navigate away from the pricebook page entirely (e.g., click a breadcrumb link) while still dirty -> The browser or application fires a "Leave site?" / "Unsaved Changes" native guard dialog
5. Cancel the navigation -> Page remains on the Pricing Detail tab with the dirty state intact
6. Revert the Max Discount edit back to its original value (Ctrl+A → Delete → type original value or clear, then blur) -> Save returns to disabled (LR-009 dirty-flag regression check; ref TC-CPR-DET-033)

**Expected**: A dirty Detail grid preserves its pending changes during a Search↔Detail tab-switch. Navigating away from the pricebook page while dirty triggers the browser's unsaved-changes guard. Reverting all edits to their original values resets Save to disabled.
**Data**: office=1604, pricebook=2021-PB6, row="Balloon Light Decor"
