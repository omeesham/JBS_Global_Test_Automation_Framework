# Corporate Pricing — New Pricebook create flow Test Cases (NM-1440)

**Module**: corporate-pricing | **Total**: 30 | **Status**: Partial | **Updated**: 2026-06-09

---

## MCP_VERIFICATION_LOG — New Pricebook (NM-1440)

| Field | Value |
|-------|-------|
| Date | 2026-06-09 |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=equipment (+ `?type=labor`) |
| Office/Entity | 1604 (Parker Palm Springs) — **create mode** (no pre-existing fixture record; the form starts empty) |
| Intent oracle | DOCX `Pricing-Functional Details-JIRA STORIES 1.docx` NM-1440 + XLSX helpers `TC-ENC-PRC-1440-001..025` (baseline-absent; net-new on e2e) |
| Field-inventory | `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-new-pricebook-2026-06-09.md` |
| Divergences | `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-newpricebook-divergences-2026-06-09.md` (CPR-1440-Q1..Q5) |
| Stack | React/Next.js (App Router, RSC); form in **light DOM**; React inputs need the native value-setter (`.fill()` does not commit React state) |
| Header (live) | Pricebook Name (text) · Price Book Type (combobox, **disabled** — route-param-fixed) · Price Year (text, numeric-sanitized) · Currency (combobox, default USD; options USD/CAD/MXN) |
| Tabs (live) | Pricing Strategy (default) + Pricing Detail — shared header above both |
| Add strategy | `New Pricing Strategy` (+, icon button) opens the "New Pricing Strategy" dialog (Strategy Name + flags Is GSO/Is Active[checked]/Is Internal/Is Productions + Cancel/Add/Close) — **no separate Type field** (CPR-1440-Q2) |
| Product-group ADD | Pricing Detail tab: double-click a Product Groups source item → adds to the pricebook grid (Price 0.00). Catalog is type-specific (Equipment ≈3707 / Labor ≈547) |
| Save precondition | Pricebook Name (non-empty/non-whitespace) + Price Year + **≥1 strategy** (CPR-1440-Q5). Product groups optional (Empty-Shell) |
| Save | dialog-gated "Save Changes" alertdialog (LR-012) → `POST /navigator/api/location/pricing/save` → 200 → redirects to `/details/<new-guid>`; success grid row shows Unicode ✔ (LR-036) |
| Mutation safety | **No-commit design** — a created pricebook has NO UI delete (CPR-1440-Q4, irreversible). Save-cycle TCs assert reachability (Save enabled → dialog appears → **Cancel**); actual persistence = NOT-AUTOMATED-IN-CI. Baseline LR-019 = navigate fresh to the (always-empty) create page per test |
| data-testid coverage | near-zero — one usable `id` (`#new-strategy-name`); else text/role/placeholder/content-anchored (Doctrine 4 / D8) |

### HELPER VERIFICATION LEDGER (25 XLSX `TC-ENC-PRC-1440-*` + 1×`1443-010` → live verdict → `TC-CPR-NPB-0NN`)

| Helper | Verdict (live 2026-06-09) | Re-ID |
|---|---|---|
| 001 Valid Name allows Save | VERIFIED (Name + Year + strategy ⇒ Save enabled) | TC-CPR-NPB-002/015/023 |
| 002 Single-char Name accepted | VERIFIED ("A" keeps form savable) | TC-CPR-NPB-008 |
| 003 Long Name up to limit | VERIFIED (250 chars accepted, no client truncation) | TC-CPR-NPB-009 |
| 004 Empty Name blocks Save | VERIFIED (Save disabled) | TC-CPR-NPB-011 |
| 005 Whitespace-only Name = empty | VERIFIED (whitespace ⇒ Save disabled) | TC-CPR-NPB-012 |
| 006 Special chars in Name preserved | VERIFIED-mechanism (accepted; persistence = no-commit) | TC-CPR-NPB-010 |
| 007 Equipment Type saves | **CORRECTED**: Type is disabled/display-only on create page (route-param-fixed) — CPR-1440-Q1 | TC-CPR-NPB-001/003 |
| 008 Labor Type saves | **CORRECTED**: same (Type disabled = "Labor" on `?type=labor`) | TC-CPR-NPB-028 |
| 009 Type dropdown lists only Equipment+Labor | **CORRECTED**: Type is NOT a usable dropdown on create page (disabled) — choice is at `+New ▾` toolbar (TC-016/017); CPR-1440-Q1 | TC-CPR-NPB-003 |
| 010 Valid 4-digit year accepted | VERIFIED (2026 ⇒ savable) | TC-CPR-NPB-004/015 |
| 011 Empty year blocks Save | VERIFIED (Save disabled) | TC-CPR-NPB-013 |
| 012 Non-numeric year rejected | VERIFIED (alpha reverts to last valid) | TC-CPR-NPB-014 |
| 013 Decimal year rejected | **CORRECTED**: decimal ("20.5") + 2-digit accepted client-side; not blocked — CPR-1440-Q3 (server unverified) | TC-CPR-NPB-015 |
| 014 Currency defaults USD | VERIFIED | TC-CPR-NPB-005 |
| 015 Change Currency saves | VERIFIED-options (USD/CAD/MXN; selection works; persistence = no-commit) | TC-CPR-NPB-006 |
| 016 Add single strategy (name+type) appends | **CORRECTED**: dialog has Name + 4 flags (no "Type"); Add appends — CPR-1440-Q2 | TC-CPR-NPB-016/018 |
| 017 Add second strategy, both in list | VERIFIED (Total →2) | TC-CPR-NPB-019 |
| 018 Add five strategies persist after Save | VERIFIED-multi-add; **persistence NOT-AUTOMATED-IN-CI** (no-commit, CPR-1440-Q4) | TC-CPR-NPB-019 |
| 019 Add blocked when Strategy Name empty | VERIFIED (Add = no-op; Total unchanged, dialog stays open) | TC-CPR-NPB-020 |
| 020 Add blocked when Strategy Type empty | **N/A — CORRECTED**: dialog has no Type field (CPR-1440-Q2); empty-Name is the real gate (TC-CPR-NPB-020) | (folded → TC-CPR-NPB-016/020) |
| 021 Save with zero product groups (Empty Shell) | VERIFIED (Save enabled w/ 0 product groups) | TC-CPR-NPB-023 |
| 022 Save commits header+strategies+groups | VERIFIED-reachability (dialog appears, Cancel); **commit NOT-AUTOMATED-IN-CI** (CPR-1440-Q4) | TC-CPR-NPB-024 |
| 023 Save success feedback | VERIFIED-walk (toast + redirect to `/details/<guid>`); **NOT-AUTOMATED-IN-CI** (needs commit) | (walk evidence; see §Known gaps) |
| 024 Save fails when Name missing | VERIFIED (Save disabled = the block) | TC-CPR-NPB-011 |
| 025 Access requires Revenue Management Role | **NOT-AUTOMATABLE** (single automation account; no role-less account to prove the negative) | (none — §Known gaps) |
| 1443-010 Save with no product groups in New-Pricebook mode | VERIFIED (= Empty-Shell) | TC-CPR-NPB-023 |

**Dropped**: 0 of 25 (+1443-010). All retained: 21 covered as P1 create-FCC; 3 CORRECTED to live (009/013/020); 3 persistence cases classified NOT-AUTOMATED-IN-CI (018/022/023); 1 NOT-AUTOMATABLE (025).

### Clarifications (RAISED via `/encore-questions` — Doctrine 2) — see `drafts/corporate-pricing-newpricebook-divergences-2026-06-09.md`

| # | DOCX/helper intent | Live reality | Disposition |
|---|---|---|---|
| CPR-1440-Q1 | Price Book Type = selectable Equipment/Labor dropdown | disabled/display-only (route-param-fixed) | RAISED; intentional UI (choice at `+New ▾`). Asserted live in TC-CPR-NPB-003/028 |
| CPR-1440-Q2 | strategy "Name + Type" | Name + 4 boolean flags, no Type field | RAISED; flags express classification. TC-CPR-NPB-016 asserts |
| CPR-1440-Q3 | decimal year rejected / 4-digit | decimal + 2-digit accepted client-side | RAISED (possible client-validation gap; server unverified). TC-CPR-NPB-015 documents |
| CPR-1440-Q4 | (n/a) | no UI delete/deactivate for a created pricebook | RAISED (irreversible); drives no-commit design. §Known gaps |
| CPR-1440-Q5 | Empty-Shell save (empty product groups) | Save also requires ≥1 strategy | RAISED; TC-CPR-NPB-022/023 assert the strategy precondition |

---

## FIELD INVENTORY — New Pricebook

Full dated inventory: `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-new-pricebook-2026-06-09.md`. 1 usable `id` (`#new-strategy-name`); else text/role/placeholder/content-anchored.

| Field | Type | Default (live 2026-06-09) | State | Notes |
|---|---|---|---|---|
| Pricebook Name | text input | `""` | editable | mandatory; whitespace = empty; long/special accepted (TC-CPR-NPB-008..012) |
| Price Book Type | combobox | `Equipment`/`Labor` per route | **disabled** | display-only (CPR-1440-Q1; TC-CPR-NPB-003/028) |
| Price Year | text input (numeric-sanitized) | `""` | editable | mandatory; alpha rejected; decimal/2-digit accepted (CPR-1440-Q3; TC-CPR-NPB-013..015) |
| Currency | combobox | `USD` | editable | options USD/CAD/MXN (TC-CPR-NPB-005/006) |
| New Pricing Strategy (+) | icon button | — | enabled | opens dialog (TC-CPR-NPB-016) |
| Strategy Name (dialog) | text input `#new-strategy-name` | `""` | enabled | empty ⇒ Add no-op (TC-CPR-NPB-020) |
| Flags (dialog) | checkboxes | Is Active checked; rest unchecked | enabled | TC-CPR-NPB-017 |
| Product Groups source list | draggable list | Eq ≈3707 / Labor ≈547 | enabled | type-specific catalog (TC-CPR-NPB-025/030) |
| Pricebook detail grid | HTML table | empty | — | double-click adds rows (TC-CPR-NPB-026/027) |
| Save | button | disabled | enables on Name+Year+strategy | dialog-gated; no-commit (TC-CPR-NPB-021..024) |

## Validation Rules

- **Save precondition**: Pricebook Name (non-empty, non-whitespace) + Price Year (non-empty) + ≥1 strategy. Product groups optional (Empty-Shell). Type/Currency are defaulted (CPR-1440-Q5).
- **Name**: empty or whitespace-only ⇒ Save disabled; 1-char / 250-char / special chars accepted.
- **Price Year**: empty ⇒ Save disabled; alpha rejected (input reverts); decimal + short values accepted client-side (CPR-1440-Q3).
- **Type**: disabled/display-only, fixed by `?type=` route param (CPR-1440-Q1).
- **Strategy dialog**: empty Strategy Name ⇒ "Add" is a no-op (Total unchanged, dialog stays open).
- **Mutation safety**: a committed pricebook is irreversible via UI (CPR-1440-Q4) ⇒ tests are no-commit (assert Save reachability, Cancel the confirm dialog).

---

## TC-CPR-NPB-001: New Pricebook (Equipment) create page loads via the type route param
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: Authenticated on office 1604.

**Steps**:
1. Navigate to the New Pricebook create page with the Equipment type route param -> Page loads
2. Verify the page title and heading -> Title "New Pricebook | Navigator"; heading "New Pricebook" visible

**Expected**: The Equipment New Pricebook create page loads from its `?type=equipment` route (this is the `+ New ▾ → Equipment Pricing` destination).
**Data**: office=1604, type=equipment

---

## TC-CPR-NPB-002: Pricebook Name field is present and editable
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
1. Open the create page -> Page loads
2. Enter a value into the Pricebook Name field -> Field accepts and shows the value

**Expected**: The Pricebook Name field (label "Pricebook Name") is present and accepts input.
**Data**: office=1604

---

## TC-CPR-NPB-003: Price Book Type shows Equipment and is read-only (route-param-fixed)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
1. Open the create page -> Page loads
2. Read the "Labor / Equipment" type control -> Value "Equipment"
3. Inspect its enabled state -> Disabled (read-only)

**Expected**: Type shows "Equipment" and is disabled — it is fixed by the route parameter, not a user-selectable dropdown on this page (the Equipment/Labor choice is made on the previous screen).
**Data**: office=1604, type=equipment

---

## TC-CPR-NPB-004: Price Year field is present and editable
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
1. Open the create page -> Page loads
2. Enter "2026" into the Price Year field -> Field accepts and shows "2026"

**Expected**: The Price Year field (label "Price Year", placeholder "e.g. 2026") is present and accepts a valid year.
**Data**: office=1604

---

## TC-CPR-NPB-005: Currency defaults to USD
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page in a fresh load.

**Steps**:
1. Open the create page -> Page loads
2. Read the Currency control's value -> "USD"

**Expected**: Currency defaults to USD on first load.
**Data**: office=1604

---

## TC-CPR-NPB-006: Currency dropdown offers USD, CAD, MXN
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-005
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
1. Open the create page -> Page loads
2. Open the Currency dropdown -> Options render
3. Read the option list -> Exactly "USD", "CAD", "MXN"

**Expected**: The Currency dropdown lists USD, CAD, and MXN.
**Data**: office=1604

---

## TC-CPR-NPB-007: Tabs render — Pricing Strategy + Pricing Detail
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
1. Open the create page -> Page loads
2. Read the tab buttons -> "Pricing Strategy" and "Pricing Detail" present

**Expected**: Both tabs render above the shared header.
**Data**: office=1604

---

## TC-CPR-NPB-008: Single-character Pricebook Name keeps the form savable
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Year and one strategy already added (so Name is the only variable).

**Steps**:
1. Set Year=2026 and add one strategy -> Save precondition met except Name
2. Enter a single character "A" as the Pricebook Name -> Field accepts
3. Observe the Save button -> Enabled

**Expected**: A 1-character name satisfies the Name requirement (Save enabled).
**Data**: office=1604

---

## TC-CPR-NPB-009: Long Pricebook Name (250 chars) is accepted
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Year and one strategy added.

**Steps**:
1. Enter a 250-character Pricebook Name -> Field accepts the full value (no client truncation)
2. Observe the Save button -> Enabled

**Expected**: A long name is accepted with no client-side truncation; the form stays savable. (Persisted limit not asserted — no-commit.)
**Data**: office=1604

---

## TC-CPR-NPB-010: Special characters in Pricebook Name are accepted
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Year and one strategy added.

**Steps**:
1. Enter a name with special characters (e.g. `AT&T <Tag> #1 "Q" é`) -> Field accepts the full value
2. Observe the Save button -> Enabled

**Expected**: Special characters are accepted in the Name field; the form stays savable. (Persistence not asserted — no-commit.)
**Data**: office=1604

---

## TC-CPR-NPB-011: Empty Pricebook Name blocks Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Year and one strategy added.

**Steps**:
1. Leave the Pricebook Name empty -> Field empty
2. Observe the Save button -> Disabled

**Expected**: An empty name blocks Save (Name is mandatory).
**Data**: office=1604

---

## TC-CPR-NPB-012: Whitespace-only Pricebook Name is treated as empty (blocks Save)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-002
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Year and one strategy added.

**Steps**:
1. Enter only spaces ("   ") as the Pricebook Name -> Field shows whitespace
2. Observe the Save button -> Disabled

**Expected**: A whitespace-only name is treated as empty and blocks Save.
**Data**: office=1604

---

## TC-CPR-NPB-013: Empty Price Year blocks Save
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-004
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Name and one strategy added.

**Steps**:
1. Leave the Price Year empty -> Field empty
2. Observe the Save button -> Disabled

**Expected**: An empty Price Year blocks Save (Year is required).
**Data**: office=1604

---

## TC-CPR-NPB-014: Non-numeric Price Year input is rejected
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-004
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page; Price Year holds a valid value.

**Steps**:
1. Attempt to enter alphabetic text ("abcd") into Price Year -> Input rejects it (value reverts to the last valid numeric)

**Expected**: The Price Year input does not accept alphabetic characters.
**Data**: office=1604

---

## TC-CPR-NPB-015: Valid Price Year keeps the form savable (decimal/short not blocked client-side)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-004
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a valid Name and one strategy added.

**Steps**:
1. Enter "2026" -> Save enabled
2. Enter a decimal "20.5" -> Field holds "20.5"; Save remains enabled (client does NOT reject)

**Expected**: A valid 4-digit year keeps the form savable; the page does not block a decimal or short year on the client (server-side validation on save is not exercised, since the test does not commit).
**Data**: office=1604

---

## TC-CPR-NPB-016: New Pricing Strategy (+) opens the add dialog (Name + flags, no Type field)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Strategy tab.

**Steps**:
1. Click "New Pricing Strategy" (+) -> The "New Pricing Strategy" dialog opens
2. Inspect the dialog -> Strategy Name field + flag toggles (Is GSO, Is Active, Is Internal, Is Productions) + Cancel/Add buttons; no separate Type field

**Expected**: The add dialog presents a Strategy Name and the four flag toggles (there is no separate "Type" selection in the dialog).
**Data**: office=1604

---

## TC-CPR-NPB-017: Strategy dialog defaults — Is Active checked
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-NPB-016
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Strategy tab.

**Steps**:
1. Open the New Pricing Strategy dialog -> Dialog opens
2. Read the flag states -> "Is Active" checked; "Is GSO"/"Is Internal"/"Is Productions" unchecked

**Expected**: The dialog defaults to Is Active checked, the other flags unchecked.
**Data**: office=1604

---

## TC-CPR-NPB-018: Adding a strategy appends it to the list
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-016
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Strategy tab, zero strategies ("No strategies yet", Total: 0).

**Steps**:
1. Open the dialog, enter a Strategy Name, click "Add" -> Dialog closes
2. Read the strategy list -> The empty state clears; Total increments 0 -> 1; the strategy is in the list

**Expected**: Adding a strategy via the dialog appends it (Total 0 -> 1, empty state cleared).
**Data**: office=1604

---

## TC-CPR-NPB-019: Adding a second strategy lists both
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-018
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with one strategy already added.

**Steps**:
1. Add a second strategy via the dialog -> Dialog closes
2. Read the count -> Total -> 2

**Expected**: A second strategy appends to the list (Total -> 2). (Multi-strategy persistence after Save is NOT-AUTOMATED-IN-CI per CPR-1440-Q4.)
**Data**: office=1604

---

## TC-CPR-NPB-020: Add with an empty Strategy Name does nothing
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-016
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Strategy tab, the dialog open with an empty Strategy Name.

**Steps**:
1. With the Strategy Name empty, click "Add" -> No strategy is added
2. Observe -> Total unchanged; the dialog stays open

**Expected**: Clicking Add with an empty Strategy Name adds no row and leaves the dialog open (the empty-name guard).
**Data**: office=1604

---

## TC-CPR-NPB-021: Save is disabled on the empty create form
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On a freshly-loaded Equipment New Pricebook page (nothing entered).

**Steps**:
1. Open the create page; enter nothing -> Form empty
2. Observe the Save button -> Disabled

**Expected**: Save is disabled on the empty form.
**Data**: office=1604

---

## TC-CPR-NPB-022: Save stays disabled without a strategy (≥1 strategy required)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-001
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with Name + Year filled and zero strategies.

**Steps**:
1. Enter a valid Name and Year; add no strategy -> Header complete, Total: 0
2. Observe the Save button -> Disabled

**Expected**: Save stays disabled until at least one pricing strategy is added (a strategy is required to save).
**Data**: office=1604

---

## TC-CPR-NPB-023: Save enables with Name + Year + one strategy and zero product groups (Empty-Shell)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-018
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
1. Enter a valid Name and Year; add one strategy; add NO product groups -> All preconditions met, 0 product groups
2. Observe the Save button -> Enabled

**Expected**: With a Name, a Year, and at least one strategy — and zero product groups — Save is enabled (saving with no product groups is permitted).
**Data**: office=1604

---

## TC-CPR-NPB-024: Save opens the confirmation dialog; Cancel aborts without committing
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-023
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page with a savable form (Name + Year + one strategy).

**Steps**:
1. Click the enabled Save button -> A "Save Changes" confirmation dialog appears ("Are you sure you want to save the changes?", Cancel/Save)
2. Click "Cancel" -> Dialog closes; no record is committed; stays on the create page

**Expected**: Clicking Save opens the "Save Changes" confirmation dialog, and Cancel closes it without saving. The test intentionally stops at the confirmation step and does not complete the save, because a created pricebook cannot be removed through the UI (so confirming would leave a permanent record).
**Data**: office=1604

---

## TC-CPR-NPB-025: Pricing Detail tab shows the Product Groups source list (Equipment catalog)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-007
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page.

**Steps**:
1. Click the "Pricing Detail" tab -> Tab activates
2. Read the left "Product Groups" source list -> Renders draggable product-group rows (ID + GROUP NAME); a search input "Search ID or Name..." is present

**Expected**: The Pricing Detail tab in create mode shows the Equipment product-group source list (assert presence / > 0, never an exact count per LR-022).
**Data**: office=1604, type=equipment

---

## TC-CPR-NPB-026: Double-clicking a product group adds it to the pricebook grid
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-NPB-025
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Detail tab, empty pricebook grid.

**Steps**:
1. Double-click a known product group in the source list (e.g. "Balloon Light Decor") -> The item is added to the pricebook detail grid (Price 0.00)
2. Read the grid -> The added product group appears with editable New Price + Max Discount

**Expected**: Double-clicking a product group in the source list adds it to the new pricebook's grid with a starting price of 0.00.
**Data**: office=1604, product group="Balloon Light Decor"

---

## TC-CPR-NPB-027: Adding multiple product groups appends rows
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-026
**Automatable**: Yes

**Preconditions**: On the Equipment New Pricebook page, Pricing Detail tab.

**Steps**:
1. Double-click a first product group -> Added (grid has 1 content row)
2. Double-click a second, different product group -> Added (grid has 2 content rows)
3. Read the grid by content -> Both product groups present

**Expected**: Each double-click appends a distinct product-group row (content-anchored, not count-asserted beyond the two added).
**Data**: office=1604, product groups="Balloon Light Decor", "Analog Mixer 12 - 23 Ch"

---

## TC-CPR-NPB-028: New Pricebook (Labor) create page loads; Type shows Labor (read-only)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: Authenticated on office 1604.

**Steps**:
1. Navigate to the New Pricebook create page with the Labor type route param -> Page loads ("New Pricebook")
2. Read the Type control -> Value "Labor", disabled

**Expected**: The Labor create page loads from `?type=labor` (the `+ New ▾ → Labor Pricing` destination); Type shows "Labor" and is read-only.
**Data**: office=1604, type=labor

---

## TC-CPR-NPB-029: Labor flow header parity + Save gating
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-028
**Automatable**: Yes

**Preconditions**: On the Labor New Pricebook page.

**Steps**:
1. Read the header -> Pricebook Name + Price Year fields present; Currency defaults USD
2. Verify Save is disabled initially -> Disabled
3. Enter Name + Year + add a strategy via the dialog -> Save enabled

**Expected**: The Labor flow mirrors Equipment (same header fields, USD default, strategy dialog) and gates Save identically (Name + Year + ≥1 strategy).
**Data**: office=1604, type=labor

---

## TC-CPR-NPB-030: Labor Pricing Detail shows a Labor-specific product-group catalog
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-NPB-028
**Automatable**: Yes

**Preconditions**: On the Labor New Pricebook page.

**Steps**:
1. Click the "Pricing Detail" tab -> Tab activates
2. Read the Product Groups source list -> Renders Labor product groups (e.g. "Banners Design", "Branding Media Production", "Content Development")

**Expected**: The Labor Pricing Detail source list contains Labor/service product groups (a different catalog than Equipment) — the `?type=` route param selects the catalog. Assert by content/`> 0`, never exact count.
**Data**: office=1604, type=labor
