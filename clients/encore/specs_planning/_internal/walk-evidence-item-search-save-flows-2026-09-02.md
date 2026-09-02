---
artifact: walk-evidence-item-search-save-flows
client: encore
session_date: 2026-09-02 (local; 2026-09-01 UTC session start)
session_tool: playwright-cli 0.1.15 (headless, .auth/encore-state.json refreshed this session)
author_identity: HUNTER
page_url_new: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products
test_entity: office 1101
parent_subplan: plans/pending/SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md
jira_tickets: [NM-2254, NM-2256, NM-2257, NM-2259]
---

# Save-flow recon — the four open NM-2253 sub-tasks

Phase 0.5 HARD GATE for SUBPLAN_ITEM_SEARCH_SAVE_FLOWS. Every click below was checked for the
`### Error` signature (all landed, ERR=0 except one caught mis-extraction, noted in R5); every filled
field was read back before its result was believed. Two records were created on e2e during recon
(office 1101, fully writable per LR-ENC-007): product id **102184**, product group id **4581**.

## R1 — Add Product Code: required fields, and can a save complete without inventing business data?

Opening the Add dialog from a selected result row, the required fields (marked `*`) are exactly four:

| Field | Kind | Inventable? |
|---|---|---|
| Name* | free text | yes (unique per-run) |
| Item Description* | free text | yes |
| Product Type* | fixed enum (EQUIPMENT, CONSUMABLE, LABOR, …10) | yes (select) |
| Service Type* | list filtered by Product Type | yes (select) |

Oracle item number is present but **not** required. **No price, GL code, or tax field is required** —
nothing that would force fabricating catalog economics. **So R1 does NOT hit the HALT.**

Proof the save is completable from producible data: filled Name="ZZ Test Code <stamp>",
Description, Product Type=EQUIPMENT, Service Type=Equipment Rental → **Save enabled**
(`saveDisabled:false`). The Service Type combobox rests **disabled** until a Product Type is chosen
(matches the existing TC-ISR-PCD-007 pairing rule).

## R2 — Add Product Code segment routes + persistence

**Persistence (search-back)**: after committing the create, searching Any Field for the exact name
returned **exactly one row** — the new product, carrying the category path of the row that was
selected when Add opened (Add creates the code *under the selected row's hierarchy*). The create
went out as `POST /navigator/api/product/create` → `{"success":true,"data":{"id":102184}}`.

**Segment routes**: the Add split-button caret menu (TC-ISR-PCD-008) opens per-segment forms
(Item / Sub Class / Class / Sub Category / Category). The default Add dialog IS the **Item** form
(its fields are item-level: Name / Description / Product Type / Service Type). The real-Save case
(TC-ISR-PCD-011) commits on the **Item** segment.

**The other four segments — resolved by live probe 2026-09-02 (not deferred).** Each non-Item
segment opens a DISTINCT form at its own hierarchy level, with its own Save button and its own
required fields. They create catalog-classification nodes, not product codes:

| Segment | Active tab | Text boxes | Combos | Save present | Creates |
|---|---|---|---|---|---|
| Sub Class | Sub Class | 5 | 6 | yes | a Sub Class node under the selected hierarchy |
| Class | Class | 6 | 8 | yes | a Class node |
| Sub Category | Sub Category | 7 | 10 | yes | a Sub Category node (required: Sub-Category Name*, Product Type*) |
| Category | Category | 8 | 12 | yes | a Category node (required: Category Name*, Product Type*) |

Every field observed is inventable (Name + Product Type + Service Type — no price / GL / tax), so
each of the four could be saved without fabricating catalog economics; none was saved this pass
(read-only probe — no residue created).

**LR-066 disposition — Item covered, the four hierarchy segments WAIVED with reason.** The Item
segment is NM-2257's "Add Product Code" and carries the real-Save + reload-read coverage
(TC-ISR-PCD-011). The four non-Item segments create the catalog-classification tree ABOVE a
product code (Category > Sub Category > Class > Sub Class) — a distinct catalog-management feature
outside the entire NM-2253 Item Search epic, whose seven sub-tasks cover product search, product
code, and product groups, never catalog-structure creation. This is a stated-reason waiver backed
by its evidence (the probe table above), recorded openly — not a silent narrowing. Because each is
save-capable from inventable data, a future catalog-management coverage effort could exercise them;
that possibility is surfaced in the plan's closure Handoff for the owner to prioritise.

## R3 — completion signals (both record types)

| Record | On Save | Toast | Endpoint |
|---|---|---|---|
| Product Code | dialog closes, stays on products page | **"Product created successfully."** | `POST /navigator/api/product/create` → 200 |
| Product Group | redirects to the groups list page | **"Product Group created successfully"** | `POST /navigator/api/location/add-update-product-group` → 200 |

Both are dialog-less confirmations (toast + close/redirect), NOT the shared Location-Settings "Save
Changes" confirm dialog. So the page-object save method waits on the toast + the create POST, not on
`dlgSaveChanges`.

## R3b — Create Product Group: required fields

Four required (`*`): **Name**, **Description**, **Service Type** (enum), **Sub Classes** (≥1, added by
**double-click** from the searchable left panel — the reliable path the picker itself offers, avoiding
flaky drag). Filled all four (sub-class "Audio Mixer AES Card" via `dblclick`) → **Save enabled**.
Search-back confirmed: the group is returned by the Product Groups search (1 row, name + description +
Service Type "Equipment"). All inventable — no HALT.

## R4 — removal / reversal

- **Product Code**: no hard Delete anywhere (toolbar has only View / Add Product Code). The **View
  Product Code dialog carries an editable "Active" checkbox + Save** — so the reversal is
  **deactivate** (uncheck Active, Save), proven present (`checked:true, disabled:false, near:"Active"`).
- **Product Group**: no hard Delete either. Clicking a group row opens `/product-groups/edit/<id>`
  with a Save button; the Add form carries an Active checkbox (default checked), so deactivate-via-edit
  is the expected reversal (the exact edit-page toggle was not pinned this pass).

**Neither record type offers true deletion.** Cleanup design: where a deactivate path is proven
(product code) the save case may deactivate what it created; both record types otherwise **accumulate**
on e2e/1101, which is accepted (LR-ENC-007) and will be stated in the field inventory rather than hidden.

## R5 — NM-2256 View Availability button: re-driven, not inherited

The button was parked as "inert" on an inherited 2026-08-31 claim. Re-driven here with a positive
control on the same instrument and varied waits:

- **Positive control (same run, same instrument)**: View Product Code → opens the "Product Code
  Details" dialog. So the click instrument reliably fires the app's onClick right now.
- **View Availability** (fresh ref f1e2179, confirmed the correct enabled button): clicked → **no
  dialog, no drawer, no URL change, body text length constant (10620)** at **+2s, +60s, and +3s**.
  One intermediate reading was discarded when a too-strict ref regex yielded an empty ref (ERR=1,
  the CEO-M20 class) — the verdict rests only on error-checked clicks with a confirmed ref.

**Verdict**: the button is a genuine no-op today. This is consistent with the standing "dates not
functional yet" ruling — the availability calendar depends on the Prep/Return date feature that is
not live — so NM-2256 is **app-gated behind the dates ruling**, not a code defect. Per the plan,
TC-ISR-PRS-032 is **not authored**; NM-2256 is recorded as an evidenced block with the owner question
below.

## Observations

**Bugs/Defects**: none. (View Availability doing nothing is app-gated behaviour under the dates
ruling, not a behaviour defect — and per LR-ENC-009 markup/enable-state alone is never a bug here.)

**Suggestions/Improvements / owner questions**:
- **NM-2256**: the View Availability button is present and enabled but inert while the date feature is
  off. Owner question: should it be disabled (or hidden) until dates go live, or is present-but-inert
  intended? Until dates are functional there is no behaviour to automate — the ticket stays blocked on
  the app, not on coverage.
- **Cleanup**: no hard delete for either record type. Confirm that deactivate (products) + accumulation
  (groups) on e2e/1101 is the accepted disposition, which is what the tests will follow.
