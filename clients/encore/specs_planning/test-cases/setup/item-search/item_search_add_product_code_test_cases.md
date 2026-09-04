# Item Search — Add Product Code Test Cases

**Module**: item-search
**Submodule**: APC (Add Product Code — cases stay in the shared TC-ISR-PCD-* sequence)
**Page**: Products (`/locations/1101/products`) — row-selection toolbar + Add Product Code dialog
**Test Entity**: Office 1101
**Updated**: 2026-09-03
**Total TCs**: 8
**Coverage mode**: QUICK (L1)
**Governing Requirement**: NM-2257 (Automate → Product → Add Product Code); feature spec NM-1386; field lengths per NM-1742
**Verified against**: field inventory `item-search-add-product-code-2026-09-03.md` (split from `item-search-product-code-2026-08-31.md`); walk evidence `walk-evidence-item-search-2026-08-31.md`, `walk-evidence-item-search-save-flows-2026-09-02.md` (real save — product id 102184) and `walk-evidence-item-search-field-lengths-2026-09-03.md` (field-length boundaries)
**Sibling file**: `item_search_product_code_test_cases.md` holds the View Product Code and availability cases (NM-2255 / NM-2256) from the same TC-ISR-PCD-* sequence.

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Add Product Code button + its segment menu | none — reach by the visible name and the arrow beside it | Split button | mounts only when a result row is selected |
| Name | none — placeholder "Enter name" | Plain text, max 50 | empty, flagged invalid |
| Item Description | none — placeholder "Enter item description" | Plain text, max 50 | empty, flagged invalid |
| Oracle Item Number | none — placeholder "Enter oracle item number" | Plain text, max 10 | empty; optional |
| Product Type | none — "Select product type" | Dropdown | placeholder; 10 types offered |
| Service Type | none — "Select service type" | Cascading dropdown | placeholder; locked until a Product Type is chosen |
| Product Code ID | none | Read-only text | "—" until the record is saved |
| Save / Close | none — button text | Buttons | Save disabled until the form is valid; Close enabled |

## Validation Rules

| Rule | Behaviour |
|---|---|
| The toolbar needs a selected row | Add Product Code appears only after clicking a result row, so every case here runs a search and selects a row first. This is a precondition of the Add cases, not a case of its own — the toolbar-reveal case (TC-ISR-PCD-001) belongs to the shared Product Code file. |
| Service Type follows Product Type | Service Type is locked until a Product Type is chosen, then offers only the services belonging to it. |
| Save is held back | Save stays disabled while any required field is missing or invalid. |
| Closing discards silently | Closing the Add dialog with a part-filled form discards it with no warning prompt. |
| Text fields stop at their maximum length | Name and Item Description accept at most 50 characters; Oracle Item Number at most 10. Typing beyond the limit simply stops — no error message is shown. |
| Over-length values are refused, not trimmed | If the typing limit is bypassed (a paste that puts more than 50 characters in the box), the field is flagged invalid and Save stays disabled, so an over-length value can never reach the server. |
| A completed form saves and persists | With Name, Item Description, Product Type and Service Type set, Save enables; clicking it creates the code under the selected row's hierarchy, shows a "Product created successfully." toast, closes the dialog, and posts to `POST /navigator/api/product/create`. Persistence is proven by searching the saved name back. |

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Add dialog opens | Required-empty form, single tab scoped to Item, ancestor chain read-only |
| 2 | Type list | 10 product types offered |
| 3 | Cascade | Choosing LABOR enabled Service Type with a labor-only list (15+ entries) |
| 4 | Segment menu (Add) | All five segments open their own hierarchy-level form; Category confirmed |
| 5 | Dirty close | Add dialog with a chosen Product Type closed silently, the choice discarded, no prompt |
| 6 | Real save (2026-09-02) | Save enabled with all four required fields → "Product created successfully." toast, dialog closed; create call returned `{"success":true,"data":{"id":102184}}` |
| 7 | Created code found by search (2026-09-02) | An Any Field search for the new name returned exactly one row carrying the selected row's category path |
| 8 | Field length attributes (2026-09-03) | Name `maxlength=50`, Item Description `maxlength=50`, Oracle Item Number `maxlength=10` |
| 9 | Typing past the limit (2026-09-03) | 60 chars → 50 landed; 70 → 50; 15 digits → 10. Field stayed valid, no error text — truncation is silent |
| 10 | Bypassing the typing limit (2026-09-03) | A pasted 60-char value left both fields invalid and Save disabled with Product Type and Service Type both chosen |
| 11 | Positive control for #10 (2026-09-03) | The same paste route at 20 chars cleared both flags and enabled Save — proving #10 is the app refusing the value, not an input method that failed to register |

---

## TC-ISR-PCD-006: Add Product Code opens a required-empty form with Save held back

**Automatable**: Yes
**Preconditions**: A result row is selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Add Product Code | The dialog opens with a single tab named "Item" |
| 2 | Read the ancestor sections | The selected row's Category, Sub Category, Class and Sub Class values display as plain text (dashes where the row has none) |
| 3 | Read the entry form | Name and Item Description are empty and flagged as required; the type selector shows "Select product type"; the service selector shows "Select service type" and is locked |
| 4 | Read the footer | Save is disabled |

**Notes**: The service selector's locked state before any type is chosen is the resting half of the pairing rule; the live half is the next case.

---

---

## TC-ISR-PCD-007: Choosing a Product Type unlocks and filters Service Type

**Automatable**: Yes
**Preconditions**: The Add Product Code dialog is open (previous case state).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Product Type selector | Ten types are offered, including EQUIPMENT, CONSUMABLE, LABOR and FEE |
| 2 | Choose LABOR | The Service Type selector unlocks |
| 3 | Open the Service Type selector | Only labor services are offered (a list including Operator Labor, Rigging Labor and Setup Charges) |
| 4 | Press Escape, then close the dialog | The dialog closes; nothing is saved |

**Notes**: Pairing rule proven in both halves: unlock on selection, and the list is filtered to the chosen type's services.

---

---

## TC-ISR-PCD-008: The Add segment menu opens per-segment forms

**Automatable**: Yes
**Preconditions**: A result row is selected; no dialog open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the arrow beside Add Product Code | A menu lists Item, Sub Class, Class, Sub Category, Category |
| 2 | Click Category | The dialog opens and its single tab is named "Category" |
| 3 | Close the dialog | The grid is unchanged |

**Notes**: The add-side Category opens its scoped form, as does the view-side Category (TC-ISR-PCD-005). An earlier reading that the view-side Category opened nothing was a probe artifact and was invalidated on 2026-09-01 — BUG-ISR-PCD-001, status invalid.

---

---

## TC-ISR-PCD-011: A completed Add Product Code form saves and the new code is found again

**Automatable**: Yes
**Preconditions**: A default search has been executed on the Products page for office 1101 and a result row is selected (the new code is created under that row's category hierarchy).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open Add Product Code and fill Name and Item Description with a per-run unique value (e.g. a `ZZ-E2E-<timestamp>` name) | Both required text fields hold the typed values, read back from the boxes |
| 2 | Choose Product Type `EQUIPMENT`, then choose Service Type `Equipment Rental` | Service Type unlocks once the Product Type is set; with all four required fields present, Save enables |
| 3 | Click Save | A "Product created successfully." toast appears and the dialog closes; `POST /navigator/api/product/create` returns success with a new id |
| 4 | Reset the search, type the new code's exact Name into Any Field, and click Search | Exactly one row returns — the product just created, carrying the category path of the row that was selected when Add opened |

**Notes**: NM-2257. This is the module's first proof that a product code can actually be created; the earlier cases (006–009) only proved the form opens, gates Save, filters Service Type and discards on close. Persistence is proven by searching the saved name back after the grid reloads (LR-067), never by the Save click's own return. The Name is per-run unique so reruns never collide. Only the **Item** segment is exercised here — the Item segment IS NM-2257's Add Product Code. The other four Add segments (Sub Class / Class / Sub Category / Category) each open a DISTINCT hierarchy-level form with its own Save (confirmed by live probe 2026-09-02 — field counts grow up the tree, Sub Class through Category) and create catalog-classification nodes, not product codes, which is a distinct catalog-management feature outside the whole NM-2253 Item Search epic. Per LR-066 they are WAIVED with that stated reason and its probe evidence, never silently narrowed; a future catalog-management effort could cover them. There is no hard delete for a product code — the reversal is a deactivate (uncheck Active in the View dialog and Save), whose save round-trip was not exercised this pass — so the case leaves its product on 1101, accepted test residue on the writable e2e environment (LR-ENC-007), recorded in the field inventory. Verified live 2026-09-02 (product id 102184).

---

---

## TC-ISR-PCD-012: The text fields stop accepting input at their maximum lengths

**Automatable**: Yes
**Preconditions**: A search has been run on the Products page for office 1101, a result row is selected, and the Add Product Code dialog is open on the Item segment.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type 60 characters into Name | Exactly 50 characters land in the box; the extra 10 are never accepted |
| 2 | Read the Name box's error state | The field is not flagged invalid and no error message is shown — the field simply stopped accepting input |
| 3 | Type 70 characters into Item Description | Exactly 50 characters land in the box, with no error message |
| 4 | Type 15 digits into Oracle Item Number | Exactly 10 characters land in the box |

**Notes**: The governing requirement is NM-1742, which reduced the product `Name` and `Description` database columns to `NVARCHAR(50)` so the Oracle integration and the legacy product sync stay consistent with legacy sizes. NM-1386's "256 characters" line is **stale** and must not be used as the oracle: QA raised the 50-character behaviour as a defect in NM-1835 and it was closed as a rejection — *"input field lengths changed from 256 to 50/100 characters to match legacy size"*. The 10-character Oracle Item Number cap was measured live and has no ticket of its own. The limits are identical in the View dialog. Deliberately no content/character-class assertion: the business analyst ruled on NM-1835 that *"the current system allows anything… the field size is all that matters,"* so values like `.....` are valid by design and must not be asserted against. Verified live 2026-09-03 (office 1101).

---

---

## TC-ISR-PCD-013: An over-length value that bypasses the typing limit cannot be saved

**Automatable**: Yes
**Preconditions**: A result row is selected and the Add Product Code dialog is open on the Item segment.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Put a 60-character value into Name and into Item Description by a route that bypasses the typing limit (the paste/scripted-fill path) | Both boxes hold all 60 characters — the typing limit does not apply to this route |
| 2 | Choose Product Type `LABOR`, then Service Type `Application Development` | Service Type unlocks and accepts the choice, so every required field now holds a value |
| 3 | Read the two text fields' error state and the Save button | Both fields are flagged invalid and Save is disabled, even though all four required fields are filled |
| 4 | Replace both values with valid short ones by the same route | Both fields clear their invalid flag and Save becomes enabled |

**Notes**: Step 4 is the case's built-in positive control and is not optional — without it, step 3 cannot be distinguished from an input method that silently never registered, which is exactly the false-negative class LR-061(C) exists to prevent. Together the steps prove the 50-character limit is enforced **twice**: the input stops typing at 50, and the form model independently refuses an over-length value if that first guard is bypassed, so no over-length value can reach the server. This matters because the backing columns are `NVARCHAR(50)` (NM-1742) — the model-level guard is what keeps an over-length payload from ever reaching them. Verified live 2026-09-03: 60 characters → both fields invalid, Save disabled; the same route with 20 characters → both valid, Save enabled.

---

---

## TC-ISR-PCD-014: A name at exactly the 50-character limit saves and reads back complete

**Automatable**: Yes
**Preconditions**: A default search has been executed on the Products page for office 1101 and a result row is selected (the new code is created under that row's category hierarchy).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open Add Product Code and fill Name with a per-run unique value that is exactly 50 characters long, plus an Item Description | The Name box holds all 50 characters, read back from the box |
| 2 | Choose Product Type `EQUIPMENT`, then Service Type `Equipment Rental` | Save enables |
| 3 | Click Save | A "Product created successfully." toast appears and the dialog closes; the create call returns success |
| 4 | Reset the search, type the full 50-character name into Any Field and search | Exactly one row returns and its Item cell holds all 50 characters — the value was stored whole, not shortened |

**Notes**: This is the boundary half of the length contract — TC-012 proves the field refuses a 51st character, this proves the 50th one actually survives the round trip to the database and back. It is the direct regression guard on NM-1742, which shrank these columns to `NVARCHAR(50)`: if a column were ever narrowed again, or the save path trimmed a character, step 4 is where it would show. Like TC-011 this leaves its product code on office 1101 — there is no hard delete for a product code, so the residue is accepted on the writable e2e environment (LR-ENC-007) and is recorded in the field inventory rather than hidden. The name is per-run unique so repeated runs never collide.

---

## TC-ISR-PCD-015: Closing the Add dialog with a part-filled form discards it silently

**Automatable**: Yes
**Preconditions**: A search has been run on the Products page for office 1101 and a result row is selected, so the Add Product Code button is available.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open Add Product Code and type a name into the Name box | The value appears in the box |
| 2 | Choose any Product Type | The choice is taken and Service Type unlocks |
| 3 | Click Close | The dialog closes immediately — no unsaved-changes prompt appears |
| 4 | Reopen Add Product Code | The form is empty again: the name is gone and Product Type is back on its placeholder |

**Notes**: This records the app's actual behaviour — the Add dialog has no unsaved-changes protection. It gives NM-2257 its own discard coverage so the Add deliverable stands alone without depending on the View Product Code work. The shared Product Code file's TC-ISR-PCD-009 currently covers the discard on both dialogs, so for now the two overlap on the Add half; when NM-2255 (View Product Code) is picked up, TC-ISR-PCD-009 should be narrowed to the View dialog and this case remains the Add-side owner. If a warning prompt ever appears here the app has changed and this case should be updated deliberately.
