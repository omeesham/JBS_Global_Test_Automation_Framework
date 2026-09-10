# Item Search — Search For Product Groups Test Cases

**Module**: item-search
**Submodule**: PGR (Search For Product Groups)
**Page**: Product Groups list (`/locations/1101/products/product-groups`)
**Test Entity**: Office 1101
**Updated**: 2026-09-10
**Total TCs**: 39
**Coverage mode**: DEEP (L2) — the 2026-09-09 deep re-walk over the 2026-08-31 QUICK (L1) pass (TC-ISR-PGR-001 to 007 quick; TC-ISR-PGR-008 to 039 deep)
**Governing Requirement**: NM-2258 (Automate → Product → Search For Product Groups); parent story NM-2253
**Verified against**: field inventory `item-search-product-groups-2026-09-09.md` (deep re-walk of `item-search-product-groups-2026-08-31.md`); machine denominator `reports/walk-coverage/1101-item-search-product-groups.json` (27, status=complete); live probes 2026-09-09 (evidence `.playwright-cli/pgr-2026-09-09/`: snapshots, screenshots and `probes-*.json`)
**Sibling file**: `item_search_add_product_group_test_cases.md` holds the Add Product Group cases (NM-2259) — TC-ISR-APG-001 to TC-ISR-APG-023, their own numbered sequence. This file holds TC-ISR-PGR-001 to TC-ISR-PGR-039.

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Search Product Groups | none — placeholder "Search Product Groups..." | Text (no maximum length; a × clear control shows while it holds text) | empty after Reset |
| Active | `e2e-checkbox` | Checkbox — a status switch (checked = active groups, cleared = inactive groups) | checked |
| Reset / Search / Add | none — button text | Buttons (Enter also submits) | enabled |
| Collapse / Expand search panel | none — accessible name | Toggle on the divider | expanded (not remembered) |
| Products | none — link text | Breadcrumb link | n/a |
| Grid | none | 4 columns: Name, Description, Service Type, Status — a header cell opens its column menu (sort items; Hide column on all but Name; Status has no sort), grips reorder, edge handles resize; a row click opens the Edit page | empty until Search; Name ascending |
| Grid Options | none — the toolbar menu button (accessible name "Grid Options") | Menu: Reset to Default View + Description / Service Type / Status toggles | all columns shown |
| Pagination | none — accessible names | First / previous / next / last + page box (digits only) + "/ N" total + rows per page 10 / 20 / 30 / 40 / 50 | 20 rows/page |

## Validation Rules

| Rule | Behaviour |
|---|---|
| No results without a Search | The grid is empty on load; results appear only after clicking Search. |
| An empty search returns nothing | Clicking Search with an empty box yields "0 product groups found" — unlike the Products page, which returns everything. Under discussion with the product team; the case asserts today's behavior. |
| Executed searches persist | A searched word and its results are restored when returning to the page; text typed without searching is dropped. |
| Reset clears and empties | The text box clears, results empty to zero found, and Active stays checked. |
| This page turns 20 rows per page | Its default page size is 20 (the Products page uses 50). |
| Enter submits | Pressing Enter in the search box runs the search exactly like the Search button (NM-1617). |
| Phrase match over Name or Description | The trimmed term is matched case-insensitively as one in-order phrase inside the Name or the Description; reversed words, or a Name word plus a Description word, find nothing. |
| Special characters are literal | `&'`, `<b>`, `%`, `_` and `@` are searched as typed — none is a wildcard (NM-1620, NM-1756); a 200-character term is accepted. |
| Spaces-only counts as empty | Five spaces return "0 product groups found", like an empty box. |
| Active is a status switch | Checked lists active groups only; cleared lists inactive groups only; there is no "both". The flag rides with the executed search and survives a reload. |
| Rows open the Edit page | Any cell click navigates to the group's Edit page; browser Back and the Product Groups breadcrumb restore the results and the page number (NM-1924). |
| Default order is Name ascending | Ignoring letter case (NM-1618; verified 2026-09-10 on the Description column); one sort at a time; Name, Description and Service Type sort via the header cell or the column menu; Status is not sortable. |
| Sort persists | A sort survives a new search, the form Reset and a reload; sorting from a later page returns to page 1 (NM-2064); only Reset to Default View clears it. |
| Rows per page is retained | 10 / 20 / 30 / 40 / 50; a change re-runs the search and is kept across navigation and reload (NM-1910). |
| Reset resets the pager | From any page, Reset returns to page 1 of 1 with zero found (NM-1909). |
| Grid layout is remembered locally | Hidden columns, column order and column widths persist across reload; Reset to Default View restores all of them plus Name ascending and page 1 (NM-1852). |
| Page box accepts digits only | Non-digits are ignored while typing; an out-of-range page snaps back to the current page on Enter. |
| × clears the box only | The results, the count and the stored term stay until Reset or a new search. |
| Collapse is not remembered | Collapsing the search panel widens the grid; a reload reopens the panel. |
| Typing debounce (accepted behaviour) | A submit within about 250 ms of the last keystroke runs the previous term (the first search on a fresh page runs empty); ruled accepted behaviour, not a defect, by the owner on 2026-09-10. TC-016 pins it as a passing case; every other case pauses before submitting. |

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Fresh load | Search panel + 4-column grid chrome; zero rows without a search |
| 2 | "Audio" search | "82 product groups found"; 20 rows on page 1; sample row "Audio Adaptor · Equipment Rental · Active" |
| 3 | Empty-criteria search | "0 product groups found" — stable across repeated polls and a second run |
| 4 | Reset | Text cleared, count zero, Active stayed checked |
| 5 | Persistence | "Audio" + 82 + rows restored after leaving and returning; unsearched text dropped |
| 6 | Page size | Rows-per-page control shows 20 |
| 7 | Enter vs button (2026-09-09 re-walk, evidence `.playwright-cli/pgr-2026-09-09/`) | `ZZ E2E` + Enter and + Search both "22 product groups found" |
| 8 | Search matrix, 17 terms | case/space variants 22; `Group 1788335968232` 1; reversed 0; `Automated group create check` 15 (description only); `Group Automated` 0; `&'` 5; `<b>` 5; `%` 4 literal; `_` / `@` 0; no-match 0 + No results; 5 spaces 0; 200 × `a` 0; single match "1 product groups found" (`probes-search-matrix.json`) |
| 9 | Active cleared | `ZZ E2E` → "5 product groups found", every row Inactive; re-checked → 22 Active (`06-active-unchecked.yml`) |
| 10 | Reload with Active cleared | box, flag, rows and count restored from session state |
| 11 | Row click | Name cell → `/edit/4583`, Description cell → `/edit/4594`; heading "Edit", form pre-filled, Active checked, "Not Priced" badge, Save disabled, Cancel enabled (`05-row-click.yml`) |
| 12 | Return from Edit | browser Back and the Product Groups crumb both restore page 2 of 2 with its 2 rows |
| 13 | Pager | last → page 2 (2 rows, next/last disabled), first → page 1; page box `2` jumps, `9` / `0` snap back, `abc` not accepted; "/ 2" total |
| 14 | Rows per page | options 10 / 20 / 30 / 40 / 50; 50 → 22 rows "1 / 1"; 10 → "1 / 3"; retained after the Products crumb + Back and after a fresh navigation (`15-rpp-open.yml`) |
| 15 | Sorting | Name menu: Sort ascending / Sort descending; Description + Service Type menus add Hide column; Status menu: Hide column only; icons arrow-up / arrow-down; sort from page 2 → page 1; sort kept after re-search, Reset and reload (`09-name-menu-open.yml`, `10-sorted-svc-desc.yml`, `23-th-click-status-menu.yml`, `25-description-menu-open.yml`) |
| 16 | Grid Options | Reset to Default View + Description / Service Type / Status toggles; Description hidden → 3 headers, persists across reload; Hide column from the Service Type menu writes the same preference (`14-grid-options-open.yml`) |
| 17 | Reset to Default View | from Status hidden + Name descending + page 2 → 4 columns, Name ascending, page 1, stored preference back to defaults (`19-after-reset-default-view.png`) |
| 18 | Column reorder | Name grip dragged onto Service Type → Description, Name, Service Type, Status; kept after reload (`18-after-reorder.png`) |
| 19 | Column resize | a +150 px drag stores 600 for Name and renders about 11 px wider; all four handles store their own delta; kept after reload (`probes-resize-response.json`, `probes-resize-all-handles.json`) |
| 20 | Collapse panel | container 360 → 0 px, table left 638 → 278; label flips to "Expand search panel"; reload reopens (`12-panel-before.png`, `13-panel-collapsed.png`) |
| 21 | × clear | box emptied, 22 rows and stored term kept; × hidden until text returns |
| 22 | Loader | `svg.lucide-loader-circle.animate-spin` in the form + 132 skeleton cells for about 370 ms (`16-loader-during-search.png`) |
| 23 | Markup names | `ZZ E2E Special <b>&'"</b> …` rendered as literal text |
| 24 | Debounce | Enter 0 ms after typing runs the previous term in 10 of 10 fresh contexts; 250 ms or more is correct; a fast `Audio` after `ZZ E2E` leaves the `ZZ E2E` rows (`probes-debounce.json`, `probes-first-submit.json`, `21-stale-second-search.png`) |

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

## TC-ISR-PGR-005: An executed group search survives leaving and returning

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

## TC-ISR-PGR-006: Result rows show their status

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: An `Audio` search has been executed with Active checked.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Status column of the visible rows | Every row shows `Active` |
| 2 | Read the Service Type column | Each row carries a service type (e.g. `Equipment Rental`) |

**Notes**: Render check under the active filter; inactive-group rendering needs the filter unchecked and known inactive data — deferred.

---

## TC-ISR-PGR-007: Reset clears the search and keeps the Active filter

**Automatable**: Yes
**Preconditions**: An `Audio` search has been executed.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Reset | The search box clears; the count returns to zero found; the grid empties |
| 2 | Read the Active checkbox | It remains checked |

**Notes**: Matches the Products page's clear-and-empty pattern.

---

## TC-ISR-PGR-008: The Enter key runs the group search
**Automatable**: Yes
**Surface_Family**: result-fidelity (DEEP)
**Preconditions**: The Product Groups page is open with a clean search (Reset).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type `ZZ E2E`, pause a moment, press Enter | The count label reports groups found and rows render — no click on Search was needed |
| 2 | Note the count, Reset, type the same word and click Search instead | The same count and the same first row come back |

**Notes**: NM-1617 (Enter did nothing; fixed). The pause before Enter matters — see TC-016 for the debounce defect this page still carries.

---

## TC-ISR-PGR-009: The description column is searched too
**Automatable**: Yes
**Surface_Family**: result-fidelity (DEEP)
**Preconditions**: Clean search; the automated groups exist (their descriptions start with "Automated group create check", their names do not contain that phrase).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search `Automated group create check` | At least one group is found |
| 2 | Read every visible row | Each row's Description contains the phrase while its Name does not — the match came from the description |

**Notes**: NM-972 AC "search Name and Description". 15 groups at verification time; assert per-row matching, not the total.

---

## TC-ISR-PGR-010: Search ignores case and surrounding spaces; a spaces-only search counts as empty

**Automatable**: Yes
**Surface_Family**: result-fidelity (DEEP)
**Preconditions**: Clean search.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search `ZZ E2E` and note the count | Groups are found (22 at verification) |
| 2 | Search `zz e2e` | The same count |
| 3 | Search `   ZZ E2E   ` (three spaces either side) | The same count; the box keeps the spaces as typed |
| 4 | Search five spaces only | "0 product groups found" and "No results" — treated as an empty search |

**Notes**: Trimming and case-folding happen on the server; the box itself is not rewritten.

---

## TC-ISR-PGR-011: Search matches the typed words in order, as one phrase

**Automatable**: Yes
**Surface_Family**: result-fidelity (DEEP)
**Preconditions**: Clean search; the group `ZZ E2E Group 1788335968232` (description "Automated group create check 1788335968232") exists.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search `Group 1788335968232` | Exactly one row: `ZZ E2E Group 1788335968232` |
| 2 | Search `1788335968232 Group` (the same words reversed) | "0 product groups found" |
| 3 | Search `Group Automated` (a word from the Name plus a word from the Description) | "0 product groups found" |

**Notes**: NM-1622 / NM-1633 asked for accurate two-word searches; the live contract is an in-order phrase match inside one field. A change to word-AND matching would flip steps 2–3 — revisit this case if the search contract changes.

---

## TC-ISR-PGR-012: Special characters are searched literally
**Automatable**: Yes
**Surface_Family**: result-fidelity (DEEP)
**Preconditions**: Clean search; the special-character groups (`ZZ E2E Special <b>&'"</b> …`) exist; at least one group name contains a literal `%`.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search `&'` | Only groups whose Name or Description contains `&'` are found (5 at verification), each row shows the characters verbatim |
| 2 | Search `<b>` | The same five groups |
| 3 | Search `%` | Only names containing a literal `%` come back (the "Caption … 80% …" groups) — `%` is not a wildcard, so the result is far smaller than the full catalog |

**Notes**: NM-1620 (special characters returned nothing) and NM-1756 (`@a` ignored the `@`) are both fixed; the case pins that characters are neither dropped nor treated as wildcards.

---

## TC-ISR-PGR-013: A term matching nothing shows zero groups and "No results"; a 200-character term is accepted

**Automatable**: Yes
**Surface_Family**: empty-vol (DEEP)
**Preconditions**: Clean search.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search `zzzz-no-match-9f3` | "0 product groups found", the "No results" placeholder, no rows, every pager button disabled, page box "1" with total "/ 1" |
| 2 | Search a 200-character term | The box holds all 200 characters (no maximum length); the same zero state, no error |

**Notes**: Complements TC-003 (empty box). The zero state after a real term looks identical to the resting state.

---

## TC-ISR-PGR-014: A single match reports a count of 1 with one row

**Automatable**: Yes
**Surface_Family**: result-fidelity (DEEP)
**Preconditions**: Clean search; the group `ZZ E2E Group 1788335968232` exists.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search the full name `ZZ E2E Group 1788335968232` | The count is 1 and exactly one row renders, named as searched |
| 2 | Read the pager | Every pager button disabled, "1 / 1" |

**Notes**: The label currently reads "1 product groups found" (plural) — recorded as BUG-CANDIDATE PGR-COUNT-GRAMMAR in the inventory. The case asserts the number and the row, not the grammar, so it stays green; tighten it to the singular wording once the label is fixed.

---

## TC-ISR-PGR-015: Names containing markup render as literal text

**Automatable**: Yes
**Surface_Family**: render-state (DEEP)
**Preconditions**: The special-character groups exist.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search `<b>` | Every row's Name shows the characters `<b>&'"</b>` verbatim — no bold text, no missing characters |
| 2 | Read the row's cell markup | The cell contains no `<b>` element; the angle brackets are text |

**Notes**: A render-safety check on the grid (no HTML injection through group names).

---

## TC-ISR-PGR-016: A submit inside the typing debounce runs the previous term; after the pause the typed word runs

**Automatable**: Yes
**Surface_Family**: result-fidelity (DEEP)
**Preconditions**: A fresh page load with a clean search (no executed term stored).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the box, type `ZZ E2E` by keystrokes and press Enter immediately (no pause) | The previously committed term runs — on a first visit the empty term: "0 product groups found", no rows, `ZZ E2E` still in the box |
| 2 | Type `ZZ E2E` again, pause, and press Enter | The `ZZ E2E` groups are found |
| 3 | Select all, type `Audio` and press Enter at once | The `ZZ E2E` rows and count stay while the box reads `Audio` |
| 4 | Type `Audio` again, pause, and press Enter | The `Audio` groups replace the rows |

**Notes**: Keystrokes are committed to the search model on a short delay (about 250 ms) and a submit reads the model, so a submit inside that window runs the previously committed term; reproduced in every fresh context with Enter and with the Search button. Ruled accepted behaviour, not a defect, by the owner on 2026-09-10 (BUG-ISR-PGR-001 withdrawn). Until that ruling the case asserted the typed term running at once and failed on purpose as the defect's evidence; it now pins both halves of the contract — an immediate submit runs the previous term, a paused submit runs the typed word. The Search button is not driven here; every other case submits only after the page object's settle pause.

---

## TC-ISR-PGR-017: Clearing the Active filter lists inactive groups only

**Automatable**: Yes
**Surface_Family**: combination (QUICK)
**Preconditions**: Clean search; inactive automated groups exist (`ZZ E2E Inactive …`, `ZZ E2E Walk 2026-09-09 B`).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear the Active checkbox and search `ZZ E2E` | Groups are found and every row's Status reads `Inactive` |
| 2 | Re-check Active and search again | Every row's Status reads `Active`; the count differs from step 1 |

**Notes**: The checkbox is a status switch, not an "include inactive" toggle — there is no way to list both statuses at once. Restore the filter to checked at the end (the shared baseline does this too).

---

## TC-ISR-PGR-018: The Active filter and its results survive a full reload

**Automatable**: Yes
**Surface_Family**: persistence (DEEP)
**Preconditions**: TC-017 state: Active cleared, `ZZ E2E` searched, inactive rows shown.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload the page by address and wait for hydration | The box still holds `ZZ E2E`, Active is still cleared, the same inactive rows and count are back |
| 2 | Re-check Active, search, reload again | The active set is back with Active checked |

**Notes**: The executed search state (text, filter, sort, page, page size) is kept in session storage and replayed on load.

---

## TC-ISR-PGR-019: Clicking a result row opens that group's Edit page
**Automatable**: Yes
**Surface_Family**: render-state (DEEP)
**Preconditions**: `ZZ E2E` searched; the first row is an automated group.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note the first row's Name and Description, then click its Description cell | The address becomes `…/product-groups/edit/<id>` and the heading reads "Edit" |
| 2 | Read the form | The Name box holds the row's name, the Description box the row's description, Active is checked, Save is disabled and Cancel enabled |
| 3 | Read the badge beside Active and the breadcrumb | A "Not Priced" (or "Priced") badge is shown; the breadcrumb reads Products › Product Groups |

**Notes**: Any cell of the row navigates (Name and Description cells were both proven). Editing the group is outside NM-2258 — the case stops at the landing. NM-1644 places the Priced badge on this maintenance form.

---

## TC-ISR-PGR-020: Returning from the Edit page restores the results and the page number
**Automatable**: Yes
**Surface_Family**: persistence (DEEP)
**Preconditions**: `ZZ E2E` searched (more than 20 results); the grid moved to page 2.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click a row on page 2, then use the browser Back | The list shows the same count, page 2 with its rows, the box still holds `ZZ E2E` |
| 2 | Click a row again, then click the "Product Groups" breadcrumb on the Edit page | The same page-2 state comes back |

**Notes**: NM-1924 (results were cleared on return). Both return paths restore the page index, not just the results.

---

## TC-ISR-PGR-021: The clear control empties the box but keeps the results

**Automatable**: Yes
**Preconditions**: `ZZ E2E` searched.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the search box | A clear (×) control shows inside the box while it holds text |
| 2 | Click the × | The box is empty; the count, the rows and the pager are unchanged; the × is gone |
| 3 | Type `ZZ` | The × reappears |
| 4 | Reload the page by address | The executed `ZZ E2E` search is restored — the × never touched the stored term |

**Notes**: The × is a local edit aid, not a Reset; only Reset or a new search changes the results.

---

## TC-ISR-PGR-022: A loader shows in the search box while a search runs
**Automatable**: Yes
**Surface_Family**: render-state (DEEP)
**Preconditions**: Clean search.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Arm a watcher for the loader and the grid placeholders, type `ZZ E2E`, pause, press Enter | During the request a spinning loader renders inside the search panel and placeholder rows render in the grid |
| 2 | Wait for the rows | The loader and the placeholders are gone and the count is shown |

**Notes**: NM-1939 (the input loader was missing on this page). The window is short (~0.4 s on 22 rows), so the case must record the loader as it appears rather than poll after the fact.

---

## TC-ISR-PGR-023: The Products breadcrumb returns to the Products page

**Automatable**: Yes
**Preconditions**: The Product Groups page is open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Products" in the breadcrumb | The address is the Products page (`/locations/1101/products`) and its search panel renders |
| 2 | Use the browser Back | The Product Groups page returns with its last executed search restored |

**Notes**: The 2026-08-31 walk left this link unprobed; it is the page's only outbound navigation besides Add and the result rows.

---

## TC-ISR-PGR-024: Last and first page jumps and the page-of-total label

**Automatable**: Yes
**Surface_Family**: pagination (DEEP)
**Preconditions**: `ZZ E2E` searched at 20 rows per page (22 groups → 2 pages).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the pager | Page box "1", total "/ 2", first/previous disabled, next/last enabled |
| 2 | Click "Go to last page" | Page box "2", the remainder rows only (2 at verification), first/previous enabled, next/last disabled |
| 3 | Click "Go to first page" | Page box "1", 20 rows, the count label unchanged throughout |

**Notes**: Extends TC-004 (next/first) with the last-page jump and the total label.

---

## TC-ISR-PGR-025: The page-number box jumps to a valid page and snaps back on invalid input

**Automatable**: Yes
**Surface_Family**: pagination (DEEP)
**Preconditions**: `ZZ E2E` searched, 2 pages, page 1 shown.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type `2` into the page box and press Enter | Page 2 renders (remainder rows, next/last disabled) |
| 2 | Type `9` and press Enter | The box snaps back to `2` and page 2 stays |
| 3 | Type `0` and press Enter | Same — back to `2` |
| 4 | Try to type `abc` | The box does not accept the letters (digits only) |
| 5 | Go to the first page, type `2`, press Enter | Page 2 again |

**Notes**: Out-of-range values are silently reverted (an improvement suggestion is recorded); the box is `inputmode=numeric` and filters non-digits while typing.

---

## TC-ISR-PGR-026: Rows per page offers 10 to 50 and reshapes the pages

**Automatable**: Yes
**Surface_Family**: pagination (DEEP)
**Preconditions**: `ZZ E2E` searched (22 groups at verification).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the rows-per-page selector | Options 10, 20, 30, 40, 50 with 20 selected |
| 2 | Choose 50 | All groups on one page (22 rows), every pager button disabled, "1 / 1" |
| 3 | Choose 10 | 10 rows, "1 / 3", next/last enabled; "Go to last page" shows page 3 with the remainder |
| 4 | Choose 20 again | Back to a 20-row page |

**Notes**: The count label never changes — only the page shape does. Volume check for the empty-vol family: 50 rows fit on one page without a second request.

---

## TC-ISR-PGR-027: The chosen rows-per-page and page survive leaving and returning
**Automatable**: Yes
**Surface_Family**: persistence (DEEP)
**Preconditions**: `ZZ E2E` searched; rows per page set to 10; the grid moved to page 3.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the "Products" breadcrumb, then use the browser Back | The list is back at 10 rows per page, page 3, with its rows and the same count |
| 2 | Navigate to the page by address | The same 10-per-page, page-3 state |
| 3 | Restore 20 rows per page | The pager reshapes to 2 pages |

**Notes**: NM-1910 was closed as "not a bug": the page size is a retained preference and changing it re-runs the search. The case pins that designed behaviour.

---

## TC-ISR-PGR-028: Reset from a later page returns the pager to page 1 of 1
**Automatable**: Yes
**Surface_Family**: pagination (DEEP)
**Preconditions**: `ZZ E2E` searched, 2 pages, the grid moved to page 2.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Reset | The box clears, "0 product groups found", the page box reads "1" with total "/ 1", every pager button disabled |
| 2 | Search `ZZ E2E` again | Page 1 of 2 renders |

**Notes**: NM-1909 (after Reset the pager showed "4/1"). Extends TC-007 with the later-page precondition.

---

## TC-ISR-PGR-029: Results default to Name ascending
**Automatable**: Yes
**Surface_Family**: sorting (QUICK)
**Preconditions**: Grid Options → Reset to Default View applied; `ZZ E2E` searched.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Name column on page 1 | Every name is ≤ the next one (ascending with letter case ignored — `<` sorts before `A`) |
| 2 | Read the header markers | The Name header shows the ascending arrow; Description and Service Type show the neutral (unsorted) marker; Status shows none |

**Notes**: NM-1618 (the list was descending). The order is server-side and ignores letter case (verified 2026-09-10: descriptions sorted descending read walk, Toast, special, Probe, Automated), so a name starting with `<` still precedes one starting with `A`.

---

## TC-ISR-PGR-030: The Name column menu sorts descending and ascending

**Automatable**: Yes
**Surface_Family**: sorting (DEEP)
**Preconditions**: `ZZ E2E` searched.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Name column menu | Items: Sort ascending, Sort descending (Name cannot be hidden, so no Hide item) |
| 2 | Choose Sort descending | The names on page 1 now descend; the Name header shows the down arrow |
| 3 | Open the menu again and choose Sort ascending | The names ascend again; the up arrow shows |

**Notes**: The first page holds the 20 largest names after step 2 and the 20 smallest after step 3.

---

## TC-ISR-PGR-031: Description and Service Type sort through their column menus

**Automatable**: Yes
**Surface_Family**: sorting (DEEP)
**Preconditions**: `ZZ E2E` searched (two service types present at verification).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Description menu and choose Sort descending | The Description column on page 1 descends; the arrow moves to the Description header and leaves Name |
| 2 | Open the Service Type menu and choose Sort ascending, then Sort descending | The Service Type column ascends, then descends; the arrow sits on Service Type |

**Notes**: One sort at a time — applying a new column's sort clears the previous column's arrow.

---

## TC-ISR-PGR-032: Sorting from a later page returns to page 1
**Automatable**: Yes
**Surface_Family**: sorting (DEEP)
**Preconditions**: `ZZ E2E` searched, 2 pages, the grid moved to page 2.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Description menu and choose Sort descending | The page box reads "1" and a full 20-row page renders in the new order |

**Notes**: NM-2064 (sorting stayed on the current page here while the Products page returned to page 1).

---

## TC-ISR-PGR-033: The applied sort survives a new search, a Reset and a reload

**Automatable**: Yes
**Surface_Family**: persistence (DEEP)
**Preconditions**: `ZZ E2E` searched and sorted by Service Type descending.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Search `ZZ E2E` again | The rows are still Service Type descending; the arrow stays on Service Type |
| 2 | Click Reset, then search `ZZ E2E` | Still Service Type descending — the form Reset does not clear the sort |
| 3 | Reload the page by address | The sorted result set is restored |
| 4 | Grid Options → Reset to Default View | Name ascending is back |

**Notes**: The form Reset clears criteria and results but keeps the sort; only Reset to Default View clears it (recorded as a design question in the inventory).

---

## TC-ISR-PGR-034: Every column header opens a sort menu and Escape closes it

**Automatable**: Yes
**Surface_Family**: sorting (DEEP)
**Preconditions**: `ZZ E2E` searched.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Name header cell | A menu opens with Sort ascending and Sort descending |
| 2 | Press Escape | The menu closes |
| 3 | Open the Description and Service Type menus in turn | Each lists Sort ascending, Sort descending, Hide column |
| 4 | Open the Status menu | It lists Hide column only — Status is not sortable and shows no sort icon |

**Notes**: A click anywhere on the header cell opens the same menu as its trigger button. Status being non-sortable matches the Products grid's Available / In Sequence columns.

---

## TC-ISR-PGR-035: Grid Options hides and shows columns and remembers the choice
**Automatable**: Yes
**Surface_Family**: persistence (DEEP)
**Preconditions**: `ZZ E2E` searched, four columns shown.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open Grid Options | Reset to Default View plus checked toggles for Description, Service Type and Status (Name is not offered) |
| 2 | Uncheck Description and close the menu | Three headers remain: Name, Service Type, Status; the rows lose their description cell |
| 3 | Reload the page by address | Description is still hidden |
| 4 | Open Grid Options and check Description | Four columns again |
| 5 | Open the Service Type column menu and choose Hide column, then restore it through Grid Options | The column disappears and returns the same way |

**Notes**: Both hide paths write the same local preference (`columnVisibility`). Step 4's wording keeps the restore explicit: the hidden column can only be brought back from Grid Options.

---

## TC-ISR-PGR-036: Reset to Default View restores columns, sort, page and stored preferences
**Automatable**: Yes
**Surface_Family**: persistence (DEEP)
**Preconditions**: `ZZ E2E` searched; Status hidden through Grid Options; Name sorted descending; the grid moved to page 2.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open Grid Options and choose Reset to Default View | All four columns are back, the Name header shows the ascending arrow and the names ascend, the page box reads "1", the results are kept |
| 2 | Read the stored grid preference | Column visibility, order and sizing are back to their defaults |

**Notes**: NM-1852 lists exactly these five resets (order, width, visibility, sorting, saved preferences). Pagination reset by this control differs from NM-1909, which is the form Reset (TC-028).

---

## TC-ISR-PGR-037: Dragging a column header reorders the columns and the order persists
**Automatable**: Yes
**Surface_Family**: persistence (DEEP)
**Preconditions**: `ZZ E2E` searched; Reset to Default View applied.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Drag the Name header's grip onto the Service Type header and release | The header order changes (Name moves right of Description at verification); the row cells follow |
| 2 | Reload the page by address | The new order is still in place |
| 3 | Grid Options → Reset to Default View | Name, Description, Service Type, Status again |

**Notes**: The grip is the dotted handle at the left of each header; the whole cell is draggable. Assert that Name is no longer first and that the stored `columnOrder` changed, not an exact slot — the drop slot depends on the pointer path.

---

## TC-ISR-PGR-038: Dragging a column edge resizes it and the width persists
**Automatable**: Yes
**Surface_Family**: persistence (DEEP)
**Preconditions**: `ZZ E2E` searched; Reset to Default View applied.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Drag the Name column's resize handle 150 px to the right and release | The stored width for Name grows by 150 and the rendered Name header is wider than before |
| 2 | Reload the page by address | The Name header keeps its new width and the stored value is unchanged |
| 3 | Grid Options → Reset to Default View | The default width and an empty sizing preference are back |

**Notes**: The rendered change is small: the table is pinned to the container width, so a 150 px drag widens the header by only ~10 px while the stored value moves the full 150 (BUG-CANDIDATE PGR-RESIZE-DAMPED — the Products grid grows its table with the drag). The case asserts "wider than before" plus the stored delta; do not assert a 1:1 rendered change until the defect is fixed.

---

## TC-ISR-PGR-039: The search panel collapses and expands; the state is not remembered

**Automatable**: Yes
**Preconditions**: `ZZ E2E` searched.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the divider control "Collapse search panel" | The panel's container shrinks to zero width and the grid moves left and widens; the control is now named "Expand search panel"; the rows and count are untouched |
| 2 | Reload the page by address | The panel is open again ("Collapse search panel") — the collapsed state is not persisted |
| 3 | Collapse, then click "Expand search panel" | The panel and grid geometry are back to the original |

**Notes**: Measure the panel container and the table's left edge; the form element inside keeps its own width, so measuring the form alone reads as "no change".
