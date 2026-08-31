# Item Search — Product Groups Test Cases

**Module**: item-search
**Submodule**: PGR
**Page**: Product Groups (`/locations/1101/products/product-groups`) + its Add page
**Test Entity**: Office 1101
**Updated**: 2026-08-31
**Total TCs**: 10
**Coverage mode**: QUICK (L1)
**Governing Requirement**: NM-2253
**Verified against**: field inventory `item-search-product-groups-2026-08-31.md`; machine denominators `reports/walk-coverage/isr-pgr.json` (28) + siblings; live probes 2026-08-31 (walk evidence `walk-evidence-item-search-2026-08-31.md`)

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Search Product Groups | none — placeholder "Search Product Groups..." | Text | empty after Reset |
| Active | `e2e-checkbox` | Checkbox | checked |
| Reset / Search / Add | none — button text | Buttons | enabled |
| Grid | none | 4 columns: Name, Description, Service Type, Status | empty until Search |
| Pagination | none — accessible names | Buttons + page box + rows-per-page | 20 rows/page |
| Add page: Name / Description | none — placeholders | Text (required) | empty |
| Add page: Service Type | none | Dropdown (required) | placeholder |
| Add page: Active | none | Checkbox | checked |
| Add page: Sub Classes | none | Two-panel picker (list + drop area) | empty; instruction shown |
| Add page: Cancel / Save | none — button text | Buttons | Cancel enabled; Save disabled |

## Validation Rules

| Rule | Behaviour |
|---|---|
| No results without a Search | The grid is empty on load; results appear only after clicking Search. |
| An empty search returns nothing | Clicking Search with an empty box yields "0 product groups found" — unlike the Products page, which returns everything. Under discussion with the product team; the case asserts today's behavior. |
| Executed searches persist | A searched word and its results are restored when returning to the page; text typed without searching is dropped. |
| Reset clears and empties | The text box clears, results empty to zero found, and Active stays checked. |
| This page turns 20 rows per page | Its default page size is 20 (the Products page uses 50). |
| Save on the Add page is held back | It stays disabled while the required fields are incomplete; typing a name alone does not enable it. |
| Cancel discards silently | Leaving the Add page via Cancel drops typed input with no warning prompt. |

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Fresh load | Search panel + 4-column grid chrome; zero rows without a search |
| 2 | "Audio" search | "82 product groups found"; 20 rows on page 1; sample row "Audio Adaptor · Equipment Rental · Active" |
| 3 | Empty-criteria search | "0 product groups found" — stable across repeated polls and a second run |
| 4 | Reset | Text cleared, count zero, Active stayed checked |
| 5 | Persistence | "Audio" + 82 + rows restored after leaving and returning; unsearched text dropped |
| 6 | Add page | Route opens; required-empty form; Save disabled; instruction "Drag or double-click items from the left to add sub-classes" |
| 7 | Cancel with typed name | Returned to the list silently; input discarded |
| 8 | Page size | Rows-per-page control shows 20 |

---

## TC-ISR-PGR-001: The Product Groups page loads without auto-searching

**Automatable**: Yes
**Preconditions**: The automation account has access to office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On the Products page, select a result row and click Product Group in the toolbar | The Product Groups page opens |
| 2 | Wait until no loading placeholders remain | The search panel, Add button and the 4-column grid header (Name, Description, Service Type, Status) are shown |
| 3 | Read the grid | No rows are loaded until a search runs (unless a previous search is being restored — see the persistence case) |

**Notes**: The toolbar button is the in-app route; the page also opens by direct address. Step 3 tolerates restored results by first clicking Reset when the box is non-empty.

---

## TC-ISR-PGR-002: A search word returns matching groups

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Product Groups page is open; the search box is empty (Reset if needed).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type `Audio` into the search box and click Search | A count label appears with dozens of groups found |
| 2 | Read the visible rows | Every row's name contains "Audio" |

**Notes**: 82 groups at verification time — assert "more than 20" plus per-row matching, not the exact total.

---

## TC-ISR-PGR-003: Searching with an empty box returns zero groups

**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)
**Preconditions**: The Product Groups page is open; the search box is empty.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Search with the box empty | The count shows "0 product groups found" and no rows render |
| 2 | Wait ~20 seconds and read again | Still zero — this is the settled response, not a loading gap |

**Notes**: Deliberately different from the Products page, where an empty search returns the full set. The inconsistency is flagged for discussion with the product team; this case asserts today's actual behavior and should be revisited if the empty-search rule changes.

---

## TC-ISR-PGR-004: Pagination pages through at twenty rows

**Automatable**: Yes
**Surface_Family**: pagination (QUICK)
**Preconditions**: An `Audio` search has been executed (multiple pages available).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the pagination bar | Rows-per-page shows 20; page 1 of several; first/previous disabled |
| 2 | Click "Go to next page" | Page 2 shows different rows; first/previous enable |
| 3 | Click "Go to first page" | Page 1 returns |

**Notes**: This page's default size (20) differs from the Products page (50) — flagged as an alignment suggestion, asserted as-is here.

---

## TC-ISR-PGR-005: Reset clears the search and keeps the Active filter

**Automatable**: Yes
**Preconditions**: An `Audio` search has been executed.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Reset | The search box clears; the count returns to zero found; the grid empties |
| 2 | Read the Active checkbox | It remains checked |

**Notes**: Matches the Products page's clear-and-empty pattern.

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

**Notes**: Structure only at this depth — actually adding a sub-class (by drag or double-click) builds a group and is left for the deeper, data-writing pass.

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

## TC-ISR-PGR-009: An executed group search survives leaving and returning

**Automatable**: Yes
**Surface_Family**: persistence (QUICK)
**Preconditions**: The Product Groups page is open; the box is empty.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type `Audio`, click Search, note the count | Results load |
| 2 | Navigate away entirely, then return and wait for hydration | The box still holds `Audio`, the same count shows, and the rows are back |

**Notes**: Only executed searches persist — typed-but-unsearched text is dropped on return (proven live). Keep the two behaviors distinct if extending this case.

---

## TC-ISR-PGR-010: Result rows show their status

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: An `Audio` search has been executed with Active checked.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Status column of the visible rows | Every row shows `Active` |
| 2 | Read the Service Type column | Each row carries a service type (e.g. `Equipment Rental`) |

**Notes**: Render check under the active filter; inactive-group rendering needs the filter unchecked and known inactive data — deferred.
