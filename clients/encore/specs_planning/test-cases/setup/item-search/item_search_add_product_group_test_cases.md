# Item Search — Create new Product Groups Test Cases

**Module**: item-search
**Submodule**: APG (Create new Product Groups — cases stay in the shared TC-ISR-PGR-* sequence)
**Page**: Add Product Group (`/locations/1101/products/product-groups` → Add — a route, not a dialog)
**Test Entity**: Office 1101
**Updated**: 2026-09-08
**Total TCs**: 4
**Coverage mode**: QUICK (L1)
**Governing Requirement**: NM-2259 (Automate → Product → Create new Product Groups); parent story NM-2253
**Verified against**: field inventory `item-search-product-groups-2026-08-31.md`; live probes 2026-08-31 (walk evidence `walk-evidence-item-search-2026-08-31.md`) and the 2026-09-02 create-group session (walk evidence `walk-evidence-item-search-save-flows-2026-09-02.md` — product group id 4581)
**Sibling file**: `item_search_product_groups_test_cases.md` holds the group list and search cases (NM-2258) — TC-ISR-PGR-001, 002, 003, 004, 005, 009, 010 — from the same TC-ISR-PGR-* sequence. The Add page is reached from that page's Add button, so every case here starts from it.

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Name | none — placeholder "Enter Product Group Name" | Text (required) | empty |
| Description | none — placeholder "Enter Product Group Description" | Text (required) | empty |
| Service Type | none | Dropdown (required) | placeholder |
| Active | none | Checkbox | checked |
| Sub Classes | none | Two-panel picker (list + drop area) | empty; instruction shown |
| Cancel / Save | none — button text | Buttons | Cancel enabled; Save disabled |

## Validation Rules

| Rule | Behaviour |
|---|---|
| Save is held back | It stays disabled while the required fields are incomplete; typing a name alone does not enable it. |
| A completed Add page saves and persists | With Name, Description, Service Type and at least one Sub Class (added by double-clicking an item in the left list) all set, Save enables; clicking it creates the group, shows a "Product Group created successfully" toast, redirects to the groups list, and posts to `POST /navigator/api/location/add-update-product-group`. The saved group is then returned by a Product Groups search on its name — persistence proven by the search-back, not by the Save click. |
| Cancel discards silently | Leaving the Add page via Cancel drops typed input with no warning prompt. |

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Add page | Route opens; required-empty form; Save disabled; instruction "Drag or double-click items from the left to add sub-classes" |
| 2 | Cancel with typed name | Returned to the list silently; input discarded |
| 3 | Create group save (2026-09-02) | Name + Description filled, Service Type chosen, one sub-class "Audio Mixer AES Card" added by double-click → Save enabled → click → "Product Group created successfully" toast and redirect to the groups list; `POST /navigator/api/location/add-update-product-group` returned 200 |
| 4 | Created group found by search (2026-09-02) | A Product Groups search on the new name returned exactly one row — the created group with its Description and Service Type "Equipment" (product group id 4581) |

---

## TC-ISR-PGR-006: The Add page opens with a held-back Save

**Automatable**: Yes
**Preconditions**: The Product Groups page is open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Add | The Add page opens (its own address under the groups page) |
| 2 | Read the form | Name and Description are empty and marked required; the Service Type selector shows its placeholder; Active is checked |
| 3 | Read the buttons | Cancel is enabled; Save is disabled |
| 4 | Type a single character into Name | Save stays disabled — the other required fields are still empty |

**Notes**: Nothing is saved in this case; step 4's input is discarded by the next case's Cancel.

---

## TC-ISR-PGR-007: The sub-class picker shows its two panels

**Automatable**: Yes
**Preconditions**: The Add page is open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the left panel | A search box and a long list of sub-class items |
| 2 | Read the Sub Classes area on the right | It is marked required and shows the instruction "Drag or double‑click items from the left to add sub‑classes" |

**Notes**: Structure only at this depth — this case reads the picker's two panels without adding anything. Actually adding a sub-class (by double-click) and creating the group is now covered by TC-ISR-PGR-011.

---

## TC-ISR-PGR-008: Cancel leaves the Add page without saving

**Automatable**: Yes
**Preconditions**: The Add page is open with a character typed into Name.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Cancel | The list page returns immediately — no warning prompt about the typed input |
| 2 | Click Add again | The form is empty again; nothing was kept |

**Notes**: Documents the actual discard-silently behavior (no unsaved-changes protection), consistent with the module's dialogs.

---

## TC-ISR-PGR-011: A completed Add page saves a new product group and it is found again

**Automatable**: Yes
**Preconditions**: The Product Groups page is open for office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Add, then fill Name and Description with a per-run unique value (e.g. a `ZZ-E2E-<timestamp>` name) | Both required fields hold the typed values, read back from the boxes |
| 2 | Choose a Service Type | The Service Type selector shows the chosen value |
| 3 | In the sub-class picker, double-click one item in the left list | The item moves to the Sub Classes area on the right, and — with Name, Description, Service Type and one sub-class all set — Save enables |
| 4 | Click Save | A "Product Group created successfully" toast appears and the page redirects to the groups list; `POST /navigator/api/location/add-update-product-group` returns 200 |
| 5 | Search the groups list for the new group's exact Name | Exactly one row returns — the group just created, showing its Description and Service Type |

**Notes**: NM-2259. This is the module's first proof a product group can be created; the earlier cases (006–008) only proved the Add page opens, gates Save, shows the two-panel picker and discards on Cancel. The sub-class is added by **double-click**, the reliable path the picker itself offers — drag is flaky and frequently never fires the drop. Persistence is proven by searching the name back after the redirect and reload (LR-067), not by the Save click. The Name is per-run unique so reruns never collide. There is no hard delete for a product group and the deactivate-via-edit path was not pinned this pass, so the case leaves its group on 1101 — accepted test residue on the writable e2e environment (LR-ENC-007), recorded in the field inventory. Verified live 2026-09-02 (product group id 4581).
