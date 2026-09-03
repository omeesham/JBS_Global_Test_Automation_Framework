# Item Search — Product Search Filters Test Cases

**Module**: item-search
**Submodule**: PRS (filters half — the case ids stay in the shared Product Search sequence)
**Page**: Products (`/locations/1101/products`) — the controls under the search panel's "Filters" heading
**Test Entity**: Office 1101
**Updated**: 2026-09-03
**Total TCs**: 10
**Coverage mode**: QUICK (L1)
**Governing Requirement**: NM-2254
**Verified against**: the same sessions as the companion file — see `item_search_product_search_test_cases.md` for the shared FIELD INVENTORY, Validation Rules and MCP_VERIFICATION_LOG. This file carries the Location, Region, Product Organization, date-pair and checkbox cases; the companion carries the search inputs and the results grid. Both halves share one `TC-ISR-PRS-*` numbering sequence, so no id changes when a case moves between them.

---

## FIELD INVENTORY

The controls under the search panel's "Filters" heading. The full page inventory — including the
search inputs and grid controls this file does not cover — is in the companion file.

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Location | none — reach by its "Select Location" name; read the value from its text | Dropdown (typeahead) | current office |
| Region | none — reach by its "Select Region" name | Dropdown | empty |
| Product Organization | none — popover trigger in its labeled row | Multi-select popover | None |
| Prep / Return Date Time | none — the two popover buttons in the dates row | Date + time popovers | today 12:00 AM / 11:59 PM |
| Quantity Greater Than Zero | `e2e-checkbox` (first) | Checkbox | unchecked |
| Active | `e2e-checkbox` (second) | Checkbox | checked |

## Validation Rules

| Rule | Behaviour |
|---|---|
| Location and Region exclude each other | Setting one clears the other, in both directions. The last one set wins. |
| Reset restores defaults and empties results | Location returns to the current office, Region clears, Quantity stays unchecked, Active stays checked, and the count shows zero until the next Search. |
| The Active filter narrows to active products | With the Active checkbox on (the default) a search returns only active products; unchecking it adds the inactive matches, so the Active-off set is a strict superset of the Active-on set — every active row still present, plus at least one inactive one. |
| Quantity Greater Than Zero narrows the results | Checking it returns a strictly smaller, non-empty set; unchecking restores the unfiltered total. |
| Product Organization filters by country | Choosing a country returns a smaller, non-empty set and Reset restores the unfiltered total. Only a small slice of the catalogue is country-tagged, so cases assert the relationship rather than any fixed count. |
| Dates are display-only for results, but the pair validates | The two date fields open a calendar with a time spinner. Date-driven RESULT behavior is not functional yet per the product owner — but the pair's own validation is live: a Prep date after the Return date shows "Prep date cannot be after the return date." and locks Search until corrected or Reset. |

## MCP_VERIFICATION_LOG

Shared with the companion file — these cases were verified in the same live sessions, and the
numbered log in `item_search_product_search_test_cases.md` is the single record. The rows covering
the fields in this file are:

| # (companion) | Verified | Result |
|---|---|---|
| 2 | Defaults after Reset | Location = current office, Region empty, Quantity unchecked, Active checked, "0 products found" |
| 5 | Quantity filter | Narrows to rows with stock |
| 6 | Location list | 5,102 entries incl. placeholder |
| 7 | Region list | 106 entries |
| 8 | Exclusivity | 1101 set → picking Boston cleared it; Region set → picking 1101 cleared Boston (both directions) |
| 9 | Product Organization popover | Select All / None / United States / Canada / Mexico |
| 10 | Date popovers | Calendar month grid + time spinner |
| 19 | Date pair validation (2026-09-01) | Prep set past Return → "Prep date cannot be after the return date." + Search locked; Reset restores defaults and clears it |
| 20 | Date render across months (2026-09-01) | 22nd picked in each of 12 months: 7 of 12 overspill the Prep box (up to +30 px), Return +23 px — reported as a defect; March–July fit |
| 25 | Active filter effect (2026-09-02) | Unchecking Active enlarges every executed search into a superset — anchor SM58 39 → 45 → 39, ULXD1 10 → 11, Amp 378 → 669, ZED 305 → 402; counts held for 30 seconds, ruling out a loading-window read |

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

---

## TC-ISR-PRS-031: The Active filter narrows the results to active products

**Automatable**: Yes
**Surface_Family**: combination (QUICK)
**Preconditions**: The Products page is open with default criteria (Active checked); no search has been executed.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type `SM58` into the Any Field box and click Search with Active checked | A set of products loads; record every visible row's Product Code ID |
| 2 | Uncheck the Active filter and click Search again | The count grows, and the new result contains every Product Code ID from step 1 plus at least one more — a strict superset |
| 3 | Compare the two Product Code ID sets | The unchecked set holds every ID from step 1 plus at least one the Active filter had hidden — an inactive product for the same search |
| 4 | Re-check Active and click Search | The result returns to the step 1 set — the added rows are gone again |

**Notes**: NM-2254. The assertion is identity-based, not a bare count: the Active-off row set must be a strict superset of the Active-on set (every active Product Code ID still present, at least one inactive ID added) and re-checking must restore the original set — together this proves both that the filter has an effect and its direction (off widens the set by adding inactive products). `SM58` is the anchor because both states fit on a single page (39 active, 45 with the inactive ones included — a margin of six rows) so the two ID sets diff cleanly on one page; confirmed live 2026-09-02, the count moving 39 → 45 → 39 across checked, unchecked and re-checked. The same effect was confirmed on broader searches (`Amp` 378 → 669, `ZED` 305 → 402) and held steady across a 30-second watch, so it is a real filter and not a loading-window read (LR-ENC-008). The case asserts the superset relationship rather than hardcoding any single ID, so ordinary catalog changes cannot make it lie. This case mutates only filter state — nothing is saved.

---

## TC-ISR-PRS-032: The Product Organization filter narrows the results and clearing it restores them

**Automatable**: Yes
**Surface_Family**: combination (QUICK)
**Preconditions**: The Products page is open with default criteria (Product Organization shows `None`); no search has been executed.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Search with Product Organization left at `None` | The unfiltered result loads; record the count as the baseline total |
| 2 | Open the Product Organization popover and choose `United States` | The popover closes and the field now reads `United States` instead of `None` |
| 3 | Click Search again | The count drops to a strictly smaller, non-zero number — the filter narrowed the set rather than emptying or ignoring it |
| 4 | Read the returned rows | Every visible row belongs to the filtered set; the set is a strict subset of the step 1 result |
| 5 | Click Reset, then Search once more | Product Organization returns to `None` and the count returns to the step 1 baseline |

**Notes**: NM-2254. **Authored 2026-09-02 by the coverage re-audit** — this is the effect-delta case TC-ISR-PRS-010 structurally could not provide. TC-010 opens the popover, asserts the country checklist is itemised, then dismisses **without choosing**, so it never proves the control filters anything; a filter with no BEFORE/AFTER delta is the silent-omission class the walk doctrine forbids. The 2026-08-31 inventory had recorded this effect as deferred "needs org-tagged data" — that reading was **wrong and is superseded**: org-tagged data exists on office 1101 and the effect is deterministic. Measured live 2026-09-02 — unfiltered `15,881 products found`, `United States` → `1 products found` (item 102182), Reset → back to the baseline; skeleton census 132 → 0 before each read, so these are post-settle values (LR-ENC-008). The direct API probe on `POST /navigator/api/products/search` supplies the positive control demanded before any zero/degenerate reading may be trusted (HARD STOP #21): `productOrgIds:[]` → totalCount 15881, `[1]`/`[2]`/`[3]` → 1, `[1,2,3]` → 1, and nonsense ids `[999]`/`[42]` → **0**. The nonsense-id zeros prove the server genuinely honours the parameter, so the fact that all three countries return the same single row is **sparse tagging — product 102182 is the only org-tagged product in the catalogue and it carries all three countries — not a defect**; no bug is filed. Because of that sparsity the case deliberately asserts the *relationship* (strictly smaller, non-zero, restored by Reset) instead of hardcoding `1` or any country's identity, so it stays honest if the catalogue is ever tagged more widely. This case mutates only filter state — nothing is saved.
