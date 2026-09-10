# Item Search — Create new Product Groups Test Cases

**Module**: item-search
**Submodule**: APG (Create new Product Groups)
**Page**: Add Product Group (`/locations/1101/products/product-groups` → Add — a route, not a dialog)
**Test Entity**: Office 1101
**Updated**: 2026-09-09
**Total TCs**: 23
**Coverage mode**: DEEP — every control on the page has a case; the only exclusions are listed with reasons in the test plan
**Governing Requirement**: NM-2259 (Automate → Product → Create new Product Groups); parent story NM-2253. Behaviour rules taken from Jira: NM-1757 (duplicate name rejected; success message), NM-2050 (Reset keeps added sub-classes), NM-1907 (Save held back however Name is cleared), NM-2043 / NM-2055 (post-save landing — see the contradiction note on TC-ISR-APG-004)
**Verified against**: field inventory `item-search-add-product-group-2026-09-09.md` (full re-walk, three real creates, five rejected saves); the earlier `item-search-add-product-group-2026-08-31.md` and the 2026-09-02 create session (product group id 4581) remain the provenance of TC-001 to TC-004
**Sibling file**: `item_search_product_groups_test_cases.md` holds the group list and search cases (NM-2258) — TC-ISR-PGR-001 to TC-ISR-PGR-039, their own numbered sequence. The Add page is reached from that page's Add button, so every case here starts from it.

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Name | none — `name="productGroupName"`, placeholder "Enter Product Group Name" | Text (required, max 50) | empty |
| Description | none — `name="productGroupDescription"`, placeholder "Enter Product Group Description" | Text (required, max 100, unique) | empty |
| Service Type | none — combobox showing "Service Type" until chosen | Dropdown (required, 90 options, no search) | placeholder |
| Active | none — the only untagged checkbox on the page | Checkbox | checked |
| Sub Classes | none — region under the "Sub Classes *" label | Dual-list target (double-click or drag adds; × removes) | empty; instruction shown |
| Cancel / Save | none — button text | Buttons | Cancel enabled; Save disabled |
| Picker Search | none — placeholder "Search" | Text (client-side filter) | empty |
| Picker sort order | `select-currency` (misnamed) | Dropdown: Ascending / Descending | Ascending |
| Picker Labor | `e2e-checkbox` | Checkbox (filter) | unchecked |
| Picker Reset | none — button text | Button | — |
| Catalog rows | none — `[draggable="true"]` | Drag-and-drop source rows | 7,394 on 2026-09-09 |
| Collapse / Expand search panel | none — `aria-label` | Icon toggle on the divider | expanded |

## Validation Rules

| Rule | Behaviour |
|---|---|
| Save is held back | Disabled until Name, Description, Service Type and at least one Sub Class are all set; clearing any one — by any method — disables it again. Active plays no part. |
| Name and Description are capped | 50 and 100 characters; typing or pasting more is cut silently — no message. |
| Whitespace is not a name | Spaces alone leave the box invalid and Save held back; surrounding spaces are accepted and trimmed by the server. |
| Names and descriptions are unique | The server rejects a name already in use, and a description already in use, with the error toast `Product group name '<name>' or group description '<description>' already exists.`; the form is kept and Save stays enabled so it can be corrected. |
| A completed Add page saves and persists | Save creates the group, shows the "Product Group created successfully" toast, lands on the groups list and posts to `POST /navigator/api/location/add-update-product-group`. The saved group is then returned by a Product Groups search on its name — persistence proven by the search-back, not by the Save click. |
| Active decides the saved status | Checked → the group lists as Active; cleared → Inactive, visible on the list only with its Active filter cleared. |
| Reset scope (NM-2050) | The picker's Reset clears its search, Labor filter and sort order and keeps any sub-class already added. |
| Leaving discards silently | Cancel, browser Back and the breadcrumb all drop typed input with no prompt. |

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Add page | Route opens; required-empty form; Save disabled; instruction "Drag or double-click items from the left to add sub-classes" |
| 2 | Cancel with typed name | Returned to the list silently; input discarded |
| 3 | Name / Description caps (2026-09-09) | `maxlength` 50 / 100; 51st and 101st typed characters dropped; 60- and 120-character pastes cut to 50 / 100; no message |
| 4 | Clearing Name by Ctrl+A+Delete and by backspace (2026-09-09) | Both: `aria-invalid="true"`, red border + "!" icon, Save disabled; Tab leaves the box |
| 5 | Whitespace-only / padded Name (2026-09-09) | "   " → invalid, Save held back; "  Walk Probe  " → accepted; a trailing-space duplicate was rejected with the name shown trimmed |
| 6 | Service Type list (2026-09-09) | 90 options, no search box; Equipment Rental first, ZSub Rental Specialty last; End + Enter picks the last |
| 7 | Duplicate name / duplicate description (2026-09-09) | Error toast `Product group name '…' or group description '…' already exists.` for both; form kept; Save enabled |
| 8 | Picker search (2026-09-09) | "Scenery" → 8 rows all containing it; "SCENERY" → the same 8; "zzzzqqq" → 0 rows, no message; cleared → 7,394 |
| 9 | Labor filter (2026-09-09) | checked → 626 rows (first "3-Hole Punch Labor"); unchecked → 7,394 |
| 10 | Sort order (2026-09-09) | Descending reverses the list (first ↔ last swap); Ascending restores |
| 11 | Reset with an added item (2026-09-09) | Search, Labor and sort cleared; the added sub-class kept |
| 12 | Double-click / × / drag (2026-09-09) | Double-click adds once (a second double-click adds nothing); × removes and restores the instruction; a full mouse-sequence drag adds |
| 13 | Collapse toggle (2026-09-09) | Label flips to "Expand search panel"; Name box left 638→278 px and width 630→990 px; expanding restores both |
| 14 | Inactive create (2026-09-09) | Saved with Active cleared → listed as Inactive with the list's Active filter cleared, absent with it checked |
| 15 | Special-character create (2026-09-09) | `ZZ E2E Walk 2026-09-09 <b>&'"</b> C` with ZSub Rental Specialty saved; listed verbatim |
| 16 | Post-save landing (2026-09-09, three saves) | Toast + the group list page every time |
| 17 | Browser Back with typed Name (2026-09-09) | Landed on the list page; no prompt |
| 18 | "Product Groups" breadcrumb with typed Name (2026-09-09) | Landed on the list page; no prompt; Add reopened with an empty Name |

---

## TC-ISR-APG-001: The Add page opens with a held-back Save

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

## TC-ISR-APG-002: The sub-class picker shows its two panels

**Automatable**: Yes
**Preconditions**: The Add page is open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the left panel | A search box and a long list of sub-class items |
| 2 | Read the Sub Classes area on the right | It is marked required and shows the instruction "Drag or double‑click items from the left to add sub‑classes" |

**Notes**: Structure only — this case reads the picker's two panels without adding anything. Adding by double-click is covered by TC-ISR-APG-004 and TC-ISR-APG-017, by drag in TC-ISR-APG-018; the panel's own controls have their own cases (020–023, 026).

---

## TC-ISR-APG-003: Cancel leaves the Add page without saving

**Automatable**: Yes
**Preconditions**: The Add page is open with a character typed into Name.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Cancel | The list page returns immediately — no warning prompt about the typed input |
| 2 | Click Add again | The form is empty again; nothing was kept |

**Notes**: Documents the actual discard-silently behavior (no unsaved-changes protection), consistent with the module's dialogs.

---

## TC-ISR-APG-004: A completed Add page saves a new product group and it is found again

**Automatable**: Yes
**Preconditions**: The Product Groups page is open for office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Add, then fill Name and Description with a per-run unique value (e.g. a `ZZ-E2E-<timestamp>` name) | Both required fields hold the typed values, read back from the boxes |
| 2 | Choose a Service Type | The Service Type selector shows the chosen value |
| 3 | In the sub-class picker, double-click one item in the left list | The item appears in the Sub Classes area on the right (and stays in the left list), and — with Name, Description, Service Type and one sub-class all set — Save enables |
| 4 | Click Save | A "Product Group created successfully" toast appears and the page lands on the groups list (its address ends in `/products/product-groups`); `POST /navigator/api/location/add-update-product-group` returns 200 |
| 5 | Search the groups list for the new group's exact Name | Exactly one row returns — the group just created, showing its Description and Service Type |

**Notes**: NM-2259. Persistence is proven by searching the name back after the landing and reload (LR-067), not by the Save click. The Name is per-run unique so reruns never collide. There is no delete for a product group, so the case leaves its group on 1101 — accepted test residue on the writable e2e environment (LR-ENC-007), recorded in the field inventory. **Landing page contradiction (2026-09-09):** the live app lands on the group list after every save; Jira NM-2043 / NM-2055 (dev lead, June 2026) say the group's details page. The case pins the observed list landing and the inventory carries the open BUG-CANDIDATE — if the app is changed to the details page this step will fail and that is the intended signal. Verified live 2026-09-02 (product group id 4581) and 2026-09-09 (three creates).

---

## TC-ISR-APG-005: Name accepts exactly 50 characters and drops the rest silently

**Automatable**: Yes
**Preconditions**: The Add page is open with an empty form.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type 50 characters into Name, one key at a time | The box holds all 50 |
| 2 | Type one more character | The box still holds 50 — the 51st is dropped; no message appears and the box is not marked invalid |
| 3 | Select all and paste a 60-character value | The box holds exactly the first 50 |
| 4 | Press Tab | Focus leaves the box normally |
| 5 | Click Cancel | The list page returns; nothing was saved |

**Notes**: Boundary set for the Name field (max, max+1 by key and by paste). The cap is silent — a suggestion in the inventory, not a defect. The escapability check in step 4 is the rejection-affordance oracle: a capped box must not trap the cursor.

---

## TC-ISR-APG-006: Description accepts exactly 100 characters and drops the rest silently

**Automatable**: Yes
**Preconditions**: The Add page is open with an empty form.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Paste a 120-character value into Description | The box holds exactly the first 100 |
| 2 | Press End and type one more character | The box still holds 100 |
| 3 | Press Tab | Focus leaves the box normally |
| 4 | Click Cancel | The list page returns; nothing was saved |

**Notes**: Boundary set for the Description field (max, max+1 by paste and by key).

---

## TC-ISR-APG-007: Clearing a filled Name by either method holds Save back and marks the box invalid

**Automatable**: Yes
**Preconditions**: The Add page is open with Name, Description, a Service Type and one sub-class set, so Save is enabled.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click into Name, select all and press Delete | The box is empty, shows a red border and is marked invalid; Save is disabled |
| 2 | Press Tab | Focus leaves the box — the invalid state does not trap it |
| 3 | Type the name again | The invalid mark clears and Save enables |
| 4 | Press Backspace once per character until the box is empty | The same invalid state; Save is disabled |
| 5 | Type the name again | Save enables |
| 6 | Click Cancel | The list page returns; nothing was saved |

**Notes**: The Add-page counterpart of NM-1907 (fixed on the Edit page): Save must react the same way whether the value is cleared at once or character by character. The invalid state is a red border plus an icon — the app renders no message text (inventory suggestion).

---

## TC-ISR-APG-008: A whitespace-only Name counts as empty; a padded Name is accepted

**Automatable**: Yes
**Preconditions**: The Add page is open with Description, a Service Type and one sub-class set.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Fill Name with spaces only | The box is marked invalid and Save stays disabled |
| 2 | Fill Name with a value surrounded by spaces | The box is not marked invalid and Save enables |
| 3 | Click Cancel | The list page returns; nothing was saved |

**Notes**: Negative set for the Name field (whitespace-only, leading/trailing space). The server trims surrounding spaces before saving — proven by TC-ISR-APG-011's trailing-space rejection, so no padded group is created here.

---

## TC-ISR-APG-009: Every required field gates Save, and Active does not

**Automatable**: Yes
**Preconditions**: The Add page is open with an empty form.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Fill Name and Description and choose a Service Type | Save is still disabled — no sub-class yet |
| 2 | Double-click one catalog item | Save enables |
| 3 | Clear Description | Save is disabled |
| 4 | Refill Description | Save enables |
| 5 | Remove the added sub-class with its × control | The instruction text returns and Save is disabled |
| 6 | Double-click a catalog item again | Save enables |
| 7 | Clear Active, then check it again | Save stays enabled both times |
| 8 | Click Cancel | The list page returns; nothing was saved |

**Notes**: The required set is Name, Description, Service Type and at least one sub-class; Active is optional. Name's own clearing is TC-ISR-APG-007.

---

## TC-ISR-APG-010: The Service Type list offers its 90 options with no search box, and first, middle and last all select

**Automatable**: Yes
**Preconditions**: The Add page is open with an empty form.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Service Type list | It opens with exactly the 90 options recorded in the inventory, in that order, starting with "Equipment Rental" and ending with "ZSub Rental Specialty"; there is no search box inside the list |
| 2 | Choose the first option | The selector shows "Equipment Rental" |
| 3 | Open the list, press End, press Enter | The selector shows "ZSub Rental Specialty" |
| 4 | Open the list and click a middle option ("Lighting") | The selector shows "Lighting" |
| 5 | Click Cancel | The list page returns; nothing was saved |

**Notes**: Dropdown set: each documented option is checked for presence and order against the inventory's list; first, last and one middle option are selected. Saving the first option is every create case; saving the last is TC-ISR-APG-021. Saving each of the 90 is out of scope (see the plan).

---

## TC-ISR-APG-011: A name already used by another group is rejected, with or without a trailing space

**Automatable**: Yes
**Preconditions**: The Add page is open. The fixture group `ZZ E2E Walk 2026-09-09 A` (description `walk probe A`) exists on office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Fill Name with the fixture group's name, a fresh Description, a Service Type and one sub-class | Save enables |
| 2 | Click Save | An error toast reads `Product group name 'ZZ E2E Walk 2026-09-09 A' or group description '<the fresh description>' already exists.`; the page stays on the Add form with every value kept; Save is still enabled |
| 3 | Change Name to the same name with a trailing space and click Save | The same error toast, showing the name without the trailing space — the server trims before comparing |
| 4 | Click Cancel | The list page returns; nothing was created |

**Notes**: NM-1757's duplicate rule, current message shape. The fixture group is the one this walk created on 2026-09-09; its name and description live in the test data, and if it is ever renamed or removed this case fails loudly, which is the intended signal.

---

## TC-ISR-APG-012: A description already used by another group is rejected even with a new name

**Automatable**: Yes
**Preconditions**: The Add page is open. The fixture group `ZZ E2E Walk 2026-09-09 A` (description `walk probe A`) exists on office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Fill Name with a per-run unique value, Description with the fixture group's description, a Service Type and one sub-class | Save enables |
| 2 | Click Save | An error toast reads `Product group name '<the new name>' or group description 'walk probe A' already exists.`; the page stays on the Add form; Save is still enabled |
| 3 | Click Cancel | The list page returns; nothing was created |

**Notes**: NM-1851 (QA Defect, Done) asked for exactly this: duplicate descriptions used to pass creation and block a later update, and the fix applies the description check at creation "similar to duplicate name validation". The 2026-09-09 walk first recorded the rule as unstated; the same-day Jira pass for the list page found the ticket and the inventory's discussion item was withdrawn. The case pins the fixed behaviour.

---

## TC-ISR-APG-013: The picker search filters the catalog by substring regardless of case and empties on no match

**Automatable**: Yes
**Surface_Family**: result-fidelity + empty-vol (DEEP)
**Preconditions**: The Add page is open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the catalog row count | A positive count — the full catalog, read live rather than assumed (several thousand rows) |
| 2 | Type "Scenery" into the picker's Search | Fewer rows than step 1, and every remaining row contains "Scenery" |
| 3 | Replace it with "SCENERY" | The same number of rows as step 2 |
| 4 | Replace it with a value that matches nothing | Zero rows |
| 5 | Clear the Search box | The count from step 1 returns |
| 6 | Click Cancel | The list page returns |

**Notes**: Client-side substring filter, case-insensitive. The empty state shows no message (inventory suggestion) — the case asserts zero rows and that the box still holds the term.

---

## TC-ISR-APG-014: The Labor filter narrows the catalog and unchecking restores it

**Automatable**: Yes
**Preconditions**: The Add page is open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the catalog row count and first row | The full catalog |
| 2 | Check Labor | Fewer rows than step 1 (a few hundred labor sub-classes), and the first row is a different item |
| 3 | Uncheck Labor | The count and first row from step 1 return |
| 4 | Click Cancel | The list page returns |

**Notes**: The filter selects labor sub-classes by category, not by the word "Labor" in the name, so the assertion is on the count dropping and the first row changing, never on a text match.

---

## TC-ISR-APG-015: Sort order flips the catalog between ascending and descending

**Automatable**: Yes
**Surface_Family**: sorting (DEEP)
**Preconditions**: The Add page is open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the first and last catalog rows with the order at Ascending | Two different items |
| 2 | Choose Descending | The first row is step 1's last row and the last row is step 1's first row |
| 3 | Choose Ascending | Step 1's first and last rows return |
| 4 | Click Cancel | The list page returns |

**Notes**: Content-anchored (first/last swap), never row-index. The selector offers exactly two options.

---

## TC-ISR-APG-016: Reset clears the picker's search, filter and sort but keeps an added sub-class

**Automatable**: Yes
**Surface_Family**: combination (DEEP)
**Preconditions**: The Add page is open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Double-click one catalog item | It appears in the Sub Classes area |
| 2 | Type "Scenery" into Search, check Labor, choose Descending | Search holds "Scenery", Labor is checked, the order shows Descending, and the three filters compose as one (the catalog holds no labor scenery, so the list may well be empty) |
| 3 | Click Reset | Search is empty, Labor is unchecked, the order shows Ascending, the full catalog is back — and the sub-class added in step 1 is still in the Sub Classes area |
| 4 | Click Cancel | The list page returns |

**Notes**: NM-2050 (fixed): Reset used to remove already-added sub-classes. The three panel controls compose as an AND, so the combination step also covers the surface's combination family.

---

## TC-ISR-APG-017: Double-click adds an item once and the × control removes it

**Automatable**: Yes
**Preconditions**: The Add page is open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Double-click the first catalog item | It appears once in the Sub Classes area; the instruction text is gone; the catalog still lists it |
| 2 | Double-click the same item again | The Sub Classes area still shows it once |
| 3 | Click the × on the added row | The Sub Classes area is empty and the instruction text is back; the catalog is unchanged |
| 4 | Click Cancel | The list page returns |

**Notes**: The picker copies rather than moves, and de-duplicates. The × control has no accessible name (LR-029 row); it is anchored on its class inside the added row.

---

## TC-ISR-APG-018: Dragging an item onto the Sub Classes area adds it

**Automatable**: Yes
**Preconditions**: The Add page is open with no sub-class added.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Press the mouse on a catalog item, move it in steps onto the Sub Classes area, release | The item appears in the Sub Classes area and the instruction text is gone |
| 2 | Click Cancel | The list page returns |

**Notes**: Proven 2026-09-09 with the full mouse sequence (`move → down → move in steps → up`) after a double-click positive control on the same page; Playwright's `dragTo` is not used. Replaces the earlier "drag is flaky" deferral.

---

## TC-ISR-APG-019: The divider button collapses and expands the sub-class panel

**Automatable**: Yes
**Preconditions**: The Add page is open.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Name box's left edge and width | Values with the panel shown |
| 2 | Click the "Collapse search panel" button | The button now reads "Expand search panel"; the Name box starts further left and is wider than in step 1 — the form has taken the panel's room |
| 3 | Click the "Expand search panel" button | The button reads "Collapse search panel" again and the Name box has step 1's left edge and width |
| 4 | Click Cancel | The list page returns |

**Notes**: The collapsed panel's inputs keep a DOM box behind the form, so visibility is asserted through the form's geometry and the toggle's label, never through an element-visible check on the search box.

---

## TC-ISR-APG-020: A group saved with Active cleared is created inactive and found with the list's Active filter cleared

**Automatable**: Yes
**Preconditions**: The Product Groups page is open for office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Add; fill a per-run unique Name and Description, choose a Service Type, add one sub-class by double-click, and clear Active | Save is enabled |
| 2 | Click Save | The "Product Group created successfully" toast appears and the page lands on the groups list |
| 3 | Search the list for the new name with the Active filter checked | Zero rows |
| 4 | Clear the Active filter and search again | Exactly one row — the new group, with Status "Inactive" |

**Notes**: Checkbox save-cycle (toggle off → save). The list's Active checkbox is a two-way status filter (checked = active only, cleared = inactive only), which is why step 3 must return nothing. Leaves one inactive group per run as accepted residue (LR-ENC-007).

---

## TC-ISR-APG-021: Special characters in the name are stored verbatim and the last Service Type saves

**Automatable**: Yes
**Preconditions**: The Product Groups page is open for office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Add; fill Name with a per-run unique value containing `<b>&'"</b>`, a Description, choose "ZSub Rental Specialty" (the last option) and add one sub-class | Save is enabled |
| 2 | Click Save | The success toast appears and the page lands on the groups list |
| 3 | Search the list for the new group | Exactly one row — Name shown exactly as typed, tags and quotes included, as plain text; Service Type "ZSub Rental Specialty"; Status "Active" |

**Notes**: Negative set for Name (special characters, HTML-as-text) plus the dropdown's last-option save-cycle. Leaves one group per run as accepted residue (LR-ENC-007).

---

## TC-ISR-APG-022: Browser Back leaves the Add page without saving or warning

**Automatable**: Yes
**Preconditions**: The Add page is open, reached from the list page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a value into Name | The box holds it |
| 2 | Go back in the browser history | The list page returns with no warning prompt |
| 3 | Click Add | The form is empty; nothing was kept |

**Notes**: Persistence family for a form with no stored state: there is no navigate-away guard on this page — the same silent discard as Cancel (TC-ISR-APG-003), by the other exit.

## TC-ISR-APG-023: The breadcrumb leaves the Add page without saving or warning

**Automatable**: Yes
**Preconditions**: The Add page is open, reached from the list page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a value into Name | The box holds it |
| 2 | Click the "Product Groups" breadcrumb above the form | The list page opens with no warning prompt |
| 3 | Click Add | The form is empty; nothing was kept |

**Notes**: The third exit from the page after Cancel (TC-ISR-APG-003) and browser Back (TC-ISR-APG-022): the breadcrumb is a plain link, so it discards typed input silently too — probed live before authoring (no prompt, empty form on return). Persistence family for a form with no stored state.
