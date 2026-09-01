# Item Search — Product Search Test Cases

**Module**: item-search
**Submodule**: PRS
**Page**: Products (`/locations/1101/products`) — search panel + result grid
**Test Entity**: Office 1101
**Updated**: 2026-09-01
**Total TCs**: 21
**Coverage mode**: QUICK (L1)
**Governing Requirement**: NM-2253
**Verified against**: field inventory `item-search-product-search-2026-08-31.md`; machine denominators `reports/walk-coverage/isr.json` (70, resting) + `isr--search-executed.json` (29) + `isr--expand-grid-options.json` (63); live probes 2026-08-31 (walk evidence `walk-evidence-item-search-2026-08-31.md`)

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
| Word search spans product fields | The help popover states the search covers item number, description, category and product group; a matching word filters to rows containing it. |
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
| 20 | Date render across months (2026-09-01) | 22nd picked in each of 12 months: 7 of 12 overspill the Prep box (up to +30 px, "AM" outside the border), Return +23 px — reported as a defect; March–July fit |

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

## TC-ISR-PRS-007: The Location dropdown lists offices

**Automatable**: Yes
**Preconditions**: The Products page is open and hydrated.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Location control | The office list opens with a "Select Location" placeholder entry at the top |
| 2 | Read the list size | Well over a thousand offices are offered |
| 3 | Confirm the current office appears | `1101 - Corporate Office Encore USA SGA` is in the list |
| 4 | Press Escape | The list closes without changing the selection |

**Notes**: 5,102 entries at verification time. Assert "greater than 1,000" rather than the exact number — the office list is data-driven.

---

## TC-ISR-PRS-008: The Region dropdown lists regions

**Automatable**: Yes
**Preconditions**: The Products page is open and hydrated.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Region control | The region list opens with a "Select Region" placeholder entry |
| 2 | Read the list | Around a hundred regions are offered; `Boston` is among them |
| 3 | Press Escape | The list closes without changing the selection |

**Notes**: 106 entries at verification time; assert "greater than 50" plus the presence of a known region.

---

## TC-ISR-PRS-009: Location and Region clear each other

**Automatable**: Yes
**Surface_Family**: combination (QUICK)
**Preconditions**: The Products page is open; criteria are at defaults.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Location to `1101 - Corporate Office Encore USA SGA` | Location shows the office |
| 2 | Set Region to `Boston` | Region shows Boston AND Location returns to "Select Location" |
| 3 | Set Location back to `1101 - Corporate Office Encore USA SGA` | Location shows the office AND Region returns to "Select Region" |
| 4 | Click Reset | Location returns to the current office; Region clears |

**Notes**: Owner-confirmed rule verified in both directions: feeding one control overrides the other; the last one set wins.

---

## TC-ISR-PRS-010: The Product Organization popover offers the country checklist

**Automatable**: Yes
**Preconditions**: The Products page is open and hydrated.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Product Organization control | A popover opens |
| 2 | Read its entries | It offers Select All, None, United States, Canada and Mexico as checkable items |
| 3 | Press Escape | The popover closes with the selection unchanged ("None") |

**Notes**: Field-level case. What each country selection does to results needs organization-tagged data and is left for the deeper pass.

---

## TC-ISR-PRS-011: The date fields open a calendar with a time spinner

**Automatable**: Yes
**Preconditions**: The Products page is open and hydrated.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the two date fields | Prep shows today at 12:00 AM; Return shows today at 11:59 PM |
| 2 | Click the Prep date field's popover button | A calendar for the current month opens with a time spinner below |
| 3 | Press Escape | The popover closes; the field value is unchanged |

**Notes**: Field-level verification only — the product owner has ruled that date-driven behavior is not functional yet, so no case asserts how dates change results.

---

## TC-ISR-PRS-012: Quantity Greater Than Zero narrows the results

**Automatable**: Yes
**Surface_Family**: combination (QUICK)
**Preconditions**: The Products page is open; criteria are at defaults.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Search with default criteria and note the total | The full set loads |
| 2 | Check Quantity Greater Than Zero and click Search | The count drops below the unfiltered total and is greater than zero |
| 3 | Uncheck it and click Search | The count returns to the unfiltered total |

**Notes**: Additive filter case on top of the default criteria.

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

## TC-ISR-PRS-020: A Prep date after the Return date is rejected with a message

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria (both dates on today).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Prep Date Time calendar and pick a day in a later month | The field takes the future date |
| 2 | Read the panel | "Prep date cannot be after the return date." appears in red and the Search button is locked |
| 3 | Click Reset | Both dates return to today's defaults and the message clears |

**Notes**: Proven live 2026-09-01: the cross-field rule fires as soon as the Prep date passes the Return date, Search stays locked for as long as the pair is invalid, and Reset is a full recovery. Date-driven RESULT behavior stays out of scope per the product owner; this case covers only the panel's own validation.

---

## TC-ISR-PRS-021: A date value renders fully inside its box in every month

**Automatable**: Yes
**Preconditions**: The Products page is open with default criteria.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Pick the 22nd of each of the next twelve months on Prep Date Time, measuring the field after each pick | Every rendered value fits inside the field's box |
| 2 | Pick a wide date on Return Date Time and measure it | The value fits inside the box |
| 3 | Click Reset | Both fields return to defaults |

**Notes**: KNOWN DEFECT (found 2026-09-01, filed as BUG-ISR-PRS-001): wide dates overspill the box — 7 of 12 months on Prep (up to 30 pixels past the edge; e.g. "November 22nd, 2026 12:00 AM" pushes "AM" outside the border) and Return likewise ("November 22nd, 2026 11:59 PM", 23 pixels). Only March–July fit. The automated case is marked expected-to-fail so the suite stays honest while the defect lives; when the fix lands the run will flag the case as unexpectedly passing, which is the signal to unmark it.
