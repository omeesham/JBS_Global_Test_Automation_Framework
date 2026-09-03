# Item Search — Product Search Test Cases

**Module**: item-search
**Submodule**: PRS
**Page**: Products (`/locations/1101/products`) — search panel + result grid
**Test Entity**: Office 1101
**Updated**: 2026-09-02
**Total TCs**: 22
**Coverage mode**: QUICK (L1)
**Governing Requirement**: NM-3650 (barcode cases additionally governed by NM-1494)
**Companion file**: `item_search_product_search_filters_test_cases.md` holds the 10 Filters-section cases (NM-2254) — 007-012, 020, 021, 031, 032. Both halves share one `TC-ISR-PRS-*` sequence.
**Verified against**: field inventory `item-search-product-search-2026-08-31.md`; machine denominators `reports/walk-coverage/isr.json` (70, resting) + `isr--search-executed.json` (29) + `isr--expand-grid-options.json` (63); live probes 2026-08-31 (walk evidence `walk-evidence-item-search-2026-08-31.md`), the 2026-09-01 barcode session (twelve supplied barcodes resolved live), the 2026-09-02 Active-filter session (anchor SM58 39 → 45 → 39 across checked/unchecked/re-checked, plus ULXD1 10 → 11, Amp 378 → 669, ZED 305 → 402; walk evidence `walk-evidence-item-search-save-flows-2026-09-02.md`), and the 2026-09-02 coverage re-audit (denominator re-enumerated live at raw 70 — unchanged from 08-31; Product Organization effect proven, UI 15,881 → 1 → restored and API `productOrgIds` `[]`→15881 / `[1|2|3]`→1 / `[999]`→0, which authored TC-ISR-PRS-032 and superseded the artifact's "needs org-tagged data" deferral)

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Keyword Search (radio) | `e2e-toggle-keyword` | Radio (single option) | selected |
| Any Field | `e2e-search-input` | Text | empty after Reset |
| Barcode | `e2e-barcode-input` | Text | empty after Reset |
| Quantity Greater Than Zero | `e2e-checkbox` (first) | Checkbox | unchecked |
| Active | `e2e-checkbox` (second) | Checkbox | checked |
| Location | none — reach by its "Select Location" name; read the value from its text | Dropdown (typeahead) | current office |
| Region | none — reach by its "Select Region" name | Dropdown | empty |
| Product Organization | none — popover trigger in its labeled row | Multi-select popover | None |
| Prep / Return Date Time | none — the two popover buttons in the dates row | Date + time popovers | today 12:00 AM / 11:59 PM |
| Search / Reset | `e2e-search-button` / `e2e-reset-button` | Buttons | enabled |
| Search help | `e2e-popover-trigger` | Button (click popover) | enabled |
| Grid Options | none — button text | Button (menu) | enabled |
| Pagination cluster | none — accessible names ("Go to next page" etc.) | Buttons + page box + rows-per-page | 50 rows/page |

## Validation Rules

| Rule | Behaviour |
|---|---|
| Results load only on Search | The grid is empty at rest and after Reset ("0 products found"); rows appear only after clicking Search. |
| Readiness is the placeholder census | Loading placeholders must reach zero before reading the grid; the unfiltered search takes ~11 seconds and a first page load up to ~20. |
| Executed criteria persist | Search text, checkbox states and sort order survive leaving and returning to the page. Input typed but never searched is dropped. Tests must Reset (or set their own criteria) before asserting defaults. |
| Location and Region exclude each other | Setting one clears the other, in both directions. The last one set wins. |
| Reset restores defaults and empties results | Text fields clear, Location returns to the current office, Region clears, Quantity stays unchecked, Active stays checked, and the count shows zero until the next Search. |
| The Active filter narrows to active products | With the Active checkbox on (the default) a search returns only active products; unchecking it adds the inactive matches, so the Active-off set is a strict superset of the Active-on set — every active row still present, plus at least one inactive one. Confirmed live 2026-09-02: the anchor SM58 returned 39 with Active on and 45 with it off (six inactive rows added) and restored to 39 on re-check, plus ULXD1 10 → 11 (extra row an inactive product, Product Code ID 92342), Amp 378 → 669, ZED 305 → 402; the larger count held steady across a 30-second watch, so the effect is a real filter and not a loading-window artifact. |
| Word search spans product fields | The help popover states the search covers item number, description, category and product group; a matching word filters to rows containing it. |
| A barcode identifies one product | A barcode belongs to a single physical asset, and every asset is scanned under one product, so a valid barcode returns exactly one row. Several assets share a product, so several different barcodes legitimately return the same product — of the twelve barcodes verified on 2026-09-01, four returned the same product and another four returned a second one. |
| Barcode matching is exact, and case does not matter | The value must match a whole barcode: a shortened value returns nothing. Letter case is ignored, so a lowercase form finds the same product as the printed uppercase one. A leading space also finds nothing, while a trailing space is tolerated — the asymmetry is recorded as an open question rather than a rule, since a space is itself a legal barcode character. |
| Barcode and Any Field exclude each other | Typing in either box clears the other, in both directions — the same last-one-wins relationship Location and Region have. Only one of the two ever carries a value into a search. |
| The barcode box caps its length | The box accepts at most 42 characters and silently stops taking more, matching the Code 39 limit the feature was specified against. The character set is not policed as you type: an unusual character can be entered, and simply matches nothing. |
| Sorting is menu-driven | Clicking a column header opens a small menu (Sort ascending / Sort descending / Hide column); clicking the header alone does not flip the sort. Default order is by Category ascending, and rows with an empty Category cell come first. |
| Cell tooltips only on truncation | Grid cells show a tooltip with the full text only when the text is cut off; short values show none. Each cell caps its width and clips through an inner text element, so a cut-off check must measure that inner element — the cell box itself always reports its text as fitting (confirmed live 2026-09-01; an interim same-day note claiming "cells never truncate" came from measuring the cell box and was withdrawn). |
| Dates are display-only for results, but the pair validates | The two date fields open a calendar with a time spinner. Date-driven RESULT behavior is not functional yet per the product owner — but the pair's own validation is live (proven 2026-09-01): a Prep date after the Return date shows "Prep date cannot be after the return date." and locks Search until corrected or Reset. |

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Page hydrates on office 1101 | Placeholders reach zero; search panel + 13 grid headers + pagination render |
| 2 | Defaults after Reset | Text/Region empty, Location = current office, Quantity unchecked, Active checked, radio selected, "0 products found" |
| 3 | "Amp" search | 376 of 15,874; 10/10 sampled rows contain "Amp" |
| 4 | Garbage barcode | "0 products found" + "No results" |
| 5 | Quantity filter | Narrows to rows with stock (page of owned rows) |
| 6 | Location list | 5,102 entries incl. placeholder |
| 7 | Region list | 106 entries |
| 8 | Exclusivity | 1101 set → picking Boston cleared it; Region set → picking 1101 cleared Boston (both directions) |
| 9 | Product Organization popover | Select All / None / United States / Canada / Mexico |
| 10 | Date popovers | Calendar month grid + time spinner |
| 11 | Sort flip | Descending → Video-first; ascending restores (blank-Category rows first) |
| 12 | Pagination | 318 pages at 50/page; next → page 2, first/prev enable; back to 1 |
| 13 | Rows-per-page options | 10 / 20 / 30 / 40 / 50 |
| 14 | Grid Options | Reset to Default View + 12 column toggles; Owned hide→restore cycle |
| 15 | Tooltips | Info icon ("future products page"), "Hide search", "Grid Options", cut-off-cell full text (re-proven 2026-09-01: a clipped Description cell tooltipped its full text; a fitting cell stayed clear); none on headers/location chip |
| 16 | Persistence | "Amp" + 376 results + sort order restored after leaving and returning |
| 17 | Search help | Click popover; text names the covered fields |
| 18 | Collapse toggle | Panel hides and returns |
| 19 | Date pair validation (2026-09-01) | Prep set past Return → "Prep date cannot be after the return date." + Search locked; Reset restores defaults and clears it |
| 20 | Date render across months (2026-09-01) | 22nd picked in each of 12 months: 7 of 12 overspill the Prep box (up to +30 px, "AM" outside the border), Return +23 px — reported as a defect; March–July fit. **CORRECTION 2026-09-03**: no longer reproduces. The app now abbreviates the month, so the widest value reads "Nov 22nd, 2026 12:00 AM" at 205.1 px inside a 232 px box (Return "Dec 22nd, 2026 11:59 PM", 200.6 px) — spill 0 on both. Re-measured live on office 1101 by the same method. The 2026-09-01 reading stands as what was true that day. |
| 21 | Twelve supplied barcodes (2026-09-01) | Every one returns exactly one row: 5052320 → ZED24/28592; 1013104 → SCM268/627; 5148547 + 5192290 → Si Expression/73551; 5056210, 5056526, 5056530, 5056516 → ZED10/29205; DFW0082529, DFW0082517, DFW0082547, 5189939 → ULXD1 Bodypack/71154 |
| 22 | Barcode matching rules (2026-09-01) | Lowercase dfw0082529 → same product; six-digit prefix 505232 → 0 found; leading space → 0 found; trailing space → still 1 found (asymmetry raised with the owner) |
| 23 | Barcode ↔ Any Field exclusivity (2026-09-01) | Filling either box empties the other, proven in both directions by reading both values from the page after each keystroke set |
| 24 | Barcode length + character set (2026-09-01) | The box reports a 42-character ceiling and truncates a 50-character value to 42; no character-set policing on entry — "AB@#12" is accepted, marked valid, and simply returns 0 found |
| 25 | Active filter effect (2026-09-02) | Unchecking Active enlarges every executed search into a superset. Anchor SM58 39 → 45 → 39 (checked/unchecked/re-checked; six inactive products added, re-verified live 2026-09-02, and the case reads the whole set on one page). Corroborated across words: ULXD1 10 → 11 (adds "Shure ULXD1 Bodypack - M1", Product Code ID 92342, absent when Active is on and present when it is off — every one of the 10 active IDs also present in the 11), Amp 378 → 669, ZED 305 → 402; ZED24 stayed 1 → 1 where the data has no inactive match. The 669/378 counts held for 30 seconds, ruling out a loading-window read (LR-ENC-008). |

---
## TC-ISR-PRS-001: The Products page loads with the search panel and grid ready

**Automatable**: Yes
**Preconditions**: The automation account has access to office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Products page for office 1101 | The page begins loading |
| 2 | Wait until no loading placeholders remain | The search panel and the result grid chrome have hydrated |
| 3 | Read the grid header row | All 13 columns are present: Category, Sub Category, Class, Product Group, Sub Class, Item, Product Code ID, Description, Available, Owned, Out of Service, In Sequence, Location Name |
| 4 | Read the products count label | A count label is shown (its number is not asserted — results depend on restored criteria) |

**Notes**: Readiness case. A first page load can take ~20 seconds; reading before the placeholders clear returns empty controls.

---

## TC-ISR-PRS-002: Reset restores the default criteria and empties the results

**Automatable**: Yes
**Preconditions**: The Products page is open and hydrated for office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type any word into the Any Field box and click Search | Results load for that word |
| 2 | Click Reset | The Any Field and barcode boxes clear; Region shows its placeholder; Location shows the current office (1101); Quantity Greater Than Zero is unchecked; Active is checked; the Keyword Search option is selected |
| 3 | Read the products count | It shows zero found and the grid is empty |
| 4 | Wait ~20 seconds and read the count again | Still zero — results return only when Search is clicked again |

**Notes**: Reset is the only reliable route to the documented defaults, because previously executed criteria are restored on later visits. Step 4 guards against mistaking a slow refresh for the empty state.

---

## TC-ISR-PRS-003: An Any Field word returns only matching products

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Products page is open; criteria are at defaults (run Reset first).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Search with default criteria and note the total count | The full product set loads (a large total) |
| 2 | Type `Amp` into the Any Field box and click Search | The count drops well below the unfiltered total |
| 3 | Read the first ten result rows | Every row contains the word "Amp" in at least one column |

**Notes**: The word search spans item number, description, category and product group (as the Search help popover states). Any-word matching was confirmed with 376 of 15,874 rows.

---

## TC-ISR-PRS-004: Search help opens guidance for the selected search type

**Automatable**: Yes
**Preconditions**: The Products page is open and hydrated.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Search help button (question icon in the search panel) | A help popover opens |
| 2 | Read the popover | It is titled "Any Field" and explains the search covers item number, description, category and product group |
| 3 | Press Escape | The popover closes |

**Notes**: The popover opens on click, not hover. Its content follows the selected search type.

---

## TC-ISR-PRS-005: The header icons show their tooltips

**Automatable**: Yes
**Preconditions**: The Products page is open and hydrated.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Hover the information icon next to the page heading | A tooltip appears: "This is the future products page for the location." |
| 2 | Hover the collapse-search-panel button | A tooltip appears: "Hide search" |
| 3 | Hover the Grid Options button | A tooltip appears: "Grid Options" |

**Notes**: Tooltip sweep for the page chrome. Column headers and the office chip in the top bar have no tooltips — that is expected.

---

## TC-ISR-PRS-006: Grid cells show a tooltip only when their text is cut off

**Automatable**: Yes
**Preconditions**: A search has been executed and rows are visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Find a cell whose text is visibly cut off and hover it | A tooltip shows the cell's full text |
| 2 | Hover a cell whose text fits fully | No tooltip appears |

**Notes**: The cut-off check should be computed (text wider than its box), not hardcoded to a specific product, so the case survives data changes — and it must measure the cell's INNER text element: each cell caps its width and clips through that inner element, so the cell box itself always reads as fitting. Re-proven live 2026-09-01 (a clipped Description cell tooltipped its full 42-character text; a fitting cell stayed clear across the tooltip delay). An interim same-day rewrite of this case to "text never truncates" was itself wrong — it measured the cell box — and was withdrawn the same day.

---

## TC-ISR-PRS-013: A barcode with no match shows the empty state

**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)
**Preconditions**: The Products page is open; criteria are at defaults.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type `ZZNOBARCODE99` into the barcode box and click Search | The count shows zero found |
| 2 | Read the grid area | A "No results" message is shown and no rows render |
| 3 | Clear the barcode box and click Search | The full set returns |

**Notes**: The owner will supply real barcode numbers for the positive filter case; until then this case covers the field and the empty state. The positive case is planned as a follow-up addition.

---

## TC-ISR-PRS-014: Sorting flips through the column menu

**Automatable**: Yes
**Surface_Family**: sorting (QUICK)
**Preconditions**: A default search has been executed (full set, default order).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Category column header | A small menu opens: Sort ascending, Sort descending, Hide column |
| 2 | Click Sort descending | The first rows change to the end of the alphabet (Video categories first) |
| 3 | Open the menu again and click Sort ascending | The original order returns — rows with an empty Category cell first, then Audio |

**Notes**: Clicking the header alone never flips the sort — the menu does. The empty-Category-first order is correct for ascending (empty sorts before any letter).

---

## TC-ISR-PRS-015: Pagination moves between pages

**Automatable**: Yes
**Surface_Family**: pagination (QUICK)
**Preconditions**: A default search has been executed (many pages available).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the pagination bar | Page 1 of a large page count; first and previous are disabled |
| 2 | Click "Go to next page" | The page number reads 2, the rows change, and first/previous enable |
| 3 | Click "Go to first page" | Page 1 returns with its original first row |

**Notes**: With 15,874 products at 50 per page the bar showed 318 pages — assert "more than 100 pages" rather than the exact count.

---

## TC-ISR-PRS-016: Rows-per-page offers five sizes

**Automatable**: Yes
**Surface_Family**: pagination (QUICK)
**Preconditions**: A default search has been executed.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the rows-per-page control | It shows 50 |
| 2 | Open it | Exactly five options are offered: 10, 20, 30, 40, 50 |
| 3 | Press Escape | The list closes; 50 remains selected and the grid still shows 50 rows |

**Notes**: Option-set case; changing the size is left to the deeper pass to keep this case read-only.

---

## TC-ISR-PRS-017: Grid Options hides and restores a column

**Automatable**: Yes
**Preconditions**: A default search has been executed; all 13 columns visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Grid Options | A menu opens with "Reset to Default View" and a Columns section listing 12 column entries, all checked; the Item column is not in the list |
| 2 | Click the Owned entry | The menu closes and the Owned column disappears from the grid |
| 3 | Open Grid Options again | The Owned entry now shows unchecked |
| 4 | Click Owned again | The Owned column returns to the grid |

**Notes**: The Item column cannot be hidden — it has no menu entry. Invoking "Reset to Default View" is left to the deeper pass; its presence is asserted here.

---

## TC-ISR-PRS-018: An executed search survives leaving and returning

**Automatable**: Yes
**Surface_Family**: persistence (QUICK)
**Preconditions**: The Products page is open; criteria are at defaults.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type `Amp` into Any Field and click Search; note the count | Matching results load |
| 2 | Navigate away from the page entirely, then navigate back and wait for hydration | The Any Field box still holds `Amp`, the same count shows, and the rows are back without clicking Search |

**Notes**: The restore is app-managed (no address-bar parameters are involved). Only executed searches are restored — text typed without clicking Search is dropped on return.

---

## TC-ISR-PRS-019: The search panel collapses and expands

**Automatable**: Yes
**Preconditions**: The Products page is open and hydrated.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the collapse-search-panel button | The search panel hides and the grid area widens |
| 2 | Click the button again | The search panel returns with its values intact |

**Notes**: Chrome toggle; values must survive the collapse cycle.

---

## TC-ISR-PRS-022: A numeric barcode returns the single product it is scanned under

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria and no executed search.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type the barcode 5052320 into the barcode box | The box holds the value; the Any Field box stays empty |
| 2 | Click Search | The count reads one product found and the grid shows a single row |
| 3 | Read that row's Item and Product Code ID | Item "Allen & Heath ZED24", Product Code ID 28592 |

**Notes**: Verified live 2026-09-01 with a barcode the product owner supplied. The case asserts the product's identity, not just the row count — a wrong product with the right count must fail.

---

## TC-ISR-PRS-023: A barcode with letters resolves the same way as a numeric one

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria and no executed search.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type the barcode DFW0082529 into the barcode box | The box holds the value |
| 2 | Click Search | One product found, a single row in the grid |
| 3 | Read that row's Item and Product Code ID | Item "Shure ULXD1 Bodypack - G50", Product Code ID 71154 |

**Notes**: Barcodes at this office come in two printed forms — plain digits and a site-prefixed form such as DFW0082529. Both are ordinary values to the search; this case proves the lettered form is not a special case.

---

## TC-ISR-PRS-024: Different barcodes on the same product all return that product

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria and no executed search.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search the barcode DFW0082529 and read the row's Product Code ID | One row, Product Code ID 71154 |
| 2 | Replace the barcode with DFW0082517 and search again | One row, the same Product Code ID 71154 |
| 3 | Replace the barcode with 5189939 and search again | One row, the same Product Code ID 71154 |

**Notes**: This is the point of the feature — a barcode identifies a physical asset, and many assets are scanned under one product. The third value is deliberately numeric while the first two carry letters, proving the printed form of a barcode has no bearing on which product it resolves to. All three were verified live 2026-09-01.

---

## TC-ISR-PRS-025: Barcode matching ignores letter case

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria and no executed search.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search the barcode in its printed uppercase form, DFW0082529 | One row, Product Code ID 71154 |
| 2 | Replace it with the same barcode in lowercase, dfw0082529, and search | One row, the same Product Code ID 71154 |

**Notes**: Someone typing a barcode by hand should not have to match the label's case. Verified live 2026-09-01.

---

## TC-ISR-PRS-026: A shortened barcode matches nothing

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria and no executed search.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search the full barcode 5052320 | One product found |
| 2 | Replace it with the first six digits, 505232, and search | Zero products found and the "No results" empty state |
| 3 | Search the full barcode again with a space typed in front of it | Zero products found |

**Notes**: The search wants a whole barcode — it does not match a prefix, which is what keeps one scan from pulling up a shelf of near-neighbours. Step 1 is a deliberate positive control so a zero in steps 2 and 3 can only mean "no match" and never "the search never ran". Step 3 records an open question rather than a rule: a leading space finds nothing, but a trailing space is tolerated and still finds the product. Because a space is itself a legal barcode character under the governing specification, neither half is obviously wrong, and the asymmetry has been raised with the product owner instead of being asserted as intended behaviour.

---

## TC-ISR-PRS-027: The barcode box and the Any Field box clear each other

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a word into the Any Field box | The word is held; the barcode box is empty |
| 2 | Type a barcode into the barcode box | The barcode is held and the Any Field box has emptied |
| 3 | Type a word into the Any Field box again | The word is held and the barcode box has emptied |
| 4 | Click Reset | Both boxes are empty |

**Notes**: The two boxes are alternatives, not filters that combine — the same last-one-wins relationship Location and Region already have. Discovered live 2026-09-01 while preparing the barcode cases; it had never been covered.

---

## TC-ISR-PRS-028: A barcode search survives leaving and returning

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search the barcode 1013104 | One product found, a single row |
| 2 | Navigate away to Product Groups and back to Products | The page returns with the barcode still in its box |
| 3 | Read the count and the row without searching again | One product found, and the row is the same product as before |

**Notes**: Executed criteria are restored on a later visit, and a barcode is no exception. The case mirrors the word-search persistence case so the two paths stay honest about the same behaviour.

---

## TC-ISR-PRS-029: A product found by barcode opens in the product-code dialog

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search the barcode 5052320 | One row, Product Code ID 28592 |
| 2 | Select that row | The row-selection toolbar appears |
| 3 | Click View Product Code | The details dialog opens on the Item tab and shows the same product |

**Notes**: A barcode search is only useful if the row it produces behaves like any other result. This joins the two halves — finding the product and opening it — that the other cases test separately.

---

## TC-ISR-PRS-030: The barcode box stops accepting characters at its limit

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a fifty-character value into the barcode box | The box holds only the first forty-two characters |
| 2 | Click Search | Zero products found and the "No results" empty state |
| 3 | Click Reset | The box is empty again |

**Notes**: Forty-two characters is the ceiling the feature was specified against (NM-1494), and the box enforces it by refusing the extra characters rather than by showing an error. The specification also names a character set, but that half is not policed as you type — an unusual character can be entered and simply matches nothing, which step 2 records. Verified live 2026-09-01.

---
