# Corporate Pricing — Product Group Override Test Cases — NM-2271 (Labor Grid)

**Module**: corporate-override | **Total**: 48 | **Status**: Automated | **Updated**: 2026-07-27

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-050: Labor tab renders a populated grid with real data on office 9460
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: On the Override screen with office 9460 selected; Labor tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select office 9460 via the Change Local Office picker → switch to the Labor tab | Office 9460 is selected and the Labor grid populates. |
| 2 | Read the visible row count → greater than 0 (populated grid, not the empty state) | Rows are displayed in the Labor grid. |
| 3 | Read the "items found" total → greater than 100 (triple-digit data set) | The "items found" total is displayed in the triple digits. |
| 4 | Find the row "Banners Design" → present | The Labor tab renders a populated grid with real data: rows are visible, the items-found total is in the triple digits, and the known anchor row is present |

**Expected**: The Labor tab renders a populated grid with real data: rows are visible, the items-found total is in the triple digits, and the known anchor row is present.
**Data**: office=9460; anchor row "Banners Design"; items-found floor=100

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-051: Labor grid text filter narrows to matching rows and clearing restores the page
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 9460 selected; Labor tab active; no filter applied.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the visible row count (full page) | The visible row count on the full page is displayed. |
| 2 | Type "Banners" into the filter box → row count narrows below the full page and stays above 0 | The grid narrows to rows matching "Banners" with a row count below the full page and above 0. |
| 3 | the "Banners Design" row is visible | The "Banners Design" row is visible in the grid. |
| 4 | Clear the filter → the visible row count grows back above the narrowed count | The visible row count increases back above the narrowed count. |

**Expected**: The client-side text filter works identically on the Labor tab: it narrows the grid to matching rows and clearing it restores the fuller page. Relative row-count assertions only (no brittle totals).
**Data**: office=9460; filter needle "Banners"; anchor row "Banners Design"

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-052: Labor grid column sort orders Product Group Name ascending and descending
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: On the Override screen with office 9460 selected; Labor tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Product Group Name" header dropdown → click "Sort ascending" → read every visible name → assert the sequence is non-decreasing (case-insensitive) | The header dropdown menu opens and displays sort options. |
| 2 | Open the header dropdown → click "Sort descending" → read every visible name → assert the sequence is non-increasing | The Labor grid sorts via the same header dropdown mechanism as Equipment. The oracle is self-verifying monotonic order - resilient to data drift on the shared bed |

**Expected**: The Labor grid sorts via the same header dropdown mechanism as Equipment. The oracle is self-verifying monotonic order — resilient to data drift on the shared bed.
**Data**: office=9460; column "Product Group Name"; live-probed 2026-07-20 (ASC first "AS - Floor Supervisor Triple Time", DESC first "Weeknight Shadow Labor" — recorded for reference, not asserted)

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-053: Labor Override Price save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1105 Labor row 655 "General - Ops" at its 160.00 baseline (per-test baseline restore enforces this).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Baseline: restore row 655 to Override Price 160.00 / inactive (bounded-retry restore) | Override Price for row 655 is confirmed at 160.00 and the row is inactive. |
| 2 | Edit Override Price to 161 → Save enables | The new value commits to the Override Price cell and the Save button becomes enabled. |
| 3 | Save → confirm the "Save Changes" dialog → success toast | The save dialog is confirmed and a success toast appears. |
| 4 | Reload + re-select office 1105 + Labor tab → Override Price reads 161 | Override Price for row 655 displays 161. |
| 5 | Cleanup: restore 160.00 and verify the restore persisted | Override Price for row 655 is restored to 160.00 and the restore is confirmed. |

**Expected**: A Labor-tab Override Price edit commits through the same save pipeline as Equipment (backend save call + toast) and persists across reload. The fixture restores itself and fails loudly if the restore does not verify.
**Data**: office=1105; row 655 "General - Ops"; default 160.00; edited 161

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-054: Labor Max Discount % save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1105 Labor row 655 at baseline (Max Discount unset "—").

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Baseline restore → edit Max Discount % to 10 → Save enables | Max Discount % for row 655 accepts the value 10 and the Save button becomes enabled. |
| 2 | Save + confirm → reload + re-select + Labor tab → Max Discount reads 10 | Max Discount % for row 655 displays 10 after reload. |
| 3 | Cleanup: restore the unset baseline and verify | Max Discount % for row 655 is restored to its unset baseline. |

**Expected**: A Labor-tab Max Discount % edit persists across reload and the fixture returns to its unset ("—") baseline afterwards.
**Data**: office=1105; row 655; edited 10; baseline unset ("—")

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-055: Labor Active toggle save-cycle persists after reload and restores
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1105 Labor row 655 at baseline (inactive).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Baseline restore → read the Active checkbox state → toggle it → Save enables | The Active checkbox toggles to the opposite state and the Save button becomes enabled. |
| 2 | Save + confirm → reload + re-select + Labor tab → the toggled state persisted | The toggled Active state is displayed after reload. |
| 3 | Cleanup: restore the inactive baseline and verify | The Active state for row 655 is restored to inactive. |

**Expected**: The Labor Active checkbox (read via its checked state) toggles, commits, persists across reload, and restores. Exercises the Labor tab's per-table boolean render.
**Data**: office=1105; row 655; baseline inactive

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-056: Navigating away from a dirty grid raises the unsaved-changes dialog; Stay keeps the page and the edit
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1105 Labor tab loaded; grid clean.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit row 655 Override Price to a value differing from the saved one → Save enables (dirty) | The new value commits to the cell and the Save button becomes enabled. |
| 2 | Click the in-app Home link → the "Unsaved changes" dialog appears with the verbatim title, body, Stay and Discard buttons | The "Unsaved changes" dialog appears with the title, body text, and Stay and Discard buttons. |
| 3 | Click "Stay" → the dialog closes | The dialog closes. |
| 4 | the URL still points at the Override screen | The URL continues to show the Override screen. |
| 5 | the staged edit is intact | The staged edit is still visible in the grid. |
| 6 | Save is still enabled | The Save button remains enabled. |
| 7 | Cleanup: navigate Home again → Discard | The application navigates away from the Override screen. |

**Expected**: In-app navigation from a dirty grid is guarded. Stay keeps the user on the page with the uncommitted edit intact (the Stay path was live-verified before authoring — previously unexercised). The dialog contract is asserted verbatim.
**Data**: office=1105; dialog title "Unsaved changes"; body "Are you sure you want to leave this view? Any unsaved changes will be lost."; buttons Stay/Discard

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-057: Discard in the unsaved-changes dialog leaves the page and drops the edit
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-056
**Automatable**: Yes

**Preconditions**: Office 1105 Labor tab loaded; grid clean.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit row 655 Override Price → dirty | The new value commits to the Override Price cell and the Save button becomes enabled. |
| 2 | Click the in-app Home link → dialog → click "Discard" | An unsaved-changes dialog opens with a Discard option. |
| 3 | Assert navigation to the home page | The application navigates to the home page. |
| 4 | Re-open the Override screen + re-select 1105 + Labor tab → the row still shows its original value | Discard navigates away and the dropped edit never persists - proven by re-reading the value after a full reload |

**Expected**: Discard navigates away and the dropped edit never persists — proven by re-reading the value after a full reload.
**Data**: office=1105; row 655

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-058: Page navigation changes the visible rows and enables or disables the nav buttons at each end
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: Office 9460 Labor tab loaded (multi-page data set); page 1; default rows-per-page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | On page 1: "Go to first page" + "Go to previous page" disabled; "Go to next page" + "Go to last page" enabled | "Go to first page" and "Go to previous page" are disabled; "Go to next page" and "Go to last page" are enabled. |
| 2 | read the first row name | The first row's Product Group Name is displayed. |
| 3 | Click "Go to next page" → the first row name changes; "Go to previous page" enables | The first row displays a different Product Group Name and "Go to previous page" becomes enabled. |
| 4 | Click "Go to last page" → "Go to next page" + "Go to last page" disabled | "Go to next page" and "Go to last page" are disabled. |
| 5 | the visible row count is above 0 and no more than the rows-per-page setting | The visible row count is between 1 and the current rows-per-page setting. |

**Expected**: Page navigation works end to end: row content changes per page, and the nav buttons disable exactly at each end of the range.
**Data**: office=9460 Labor; identity assertions on first-row content, no hardcoded totals

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-059: Raising rows-per-page shows more rows without changing the total
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes

**Preconditions**: Office 9460 Labor tab loaded; default rows-per-page (20).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the visible row count and the "items found" total | The visible row count and the "items found" total are displayed. |
| 2 | Change rows-per-page to 50 | The grid re-renders to display up to 50 rows per page. |
| 3 | Assert the visible row count increased and the "items found" total is unchanged | A larger page size shows more rows on the page while the underlying record total stays constant. Relative assertions only |

**Expected**: A larger page size shows more rows on the page while the underlying record total stays constant. Relative assertions only.
**Data**: office=9460 Labor; rows-per-page 20→50

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-060: A page-1 row reads back identically after paging to the last page and returning
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-058
**Automatable**: Yes

**Preconditions**: Office 9460 Labor tab loaded; page 1.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the first row Product Group Name (content anchor) | The first row's Product Group Name is displayed. |
| 2 | Page to the last page → rows render | The grid advances to the last page and displays its rows. |
| 3 | Page back to the first page → the same content anchor reads back identically and its row is findable | content-based read integrity holds across a full page-range round trip on the largest available data set - no windowing or render corruption. content, never position |

**Expected**: Content-anchored read integrity holds across a full page-range round trip on the largest available data set — no windowing or render corruption. Content anchor, never row index.
**Data**: office=9460 Labor (212-row bed at verification time; asserted by anchor, not count)

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-062: Enter opens the Override Price editor on a focused cell; Escape closes it without dirtying the form
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 1606 fixture row at its default; grid clean.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Focus the anchor row Override Price display cell (it is keyboard-focusable) | The Override Price display cell receives keyboard focus. |
| 2 | Press Enter → the numeric editor opens showing the current value | The numeric editor opens and displays the current Override Price value. |
| 3 | Press Escape → the editor closes | The editor closes without committing a change. |
| 4 | Save remains disabled (no unsaved changes) | The Save button remains disabled. |

**Expected**: Editable cells support keyboard activation: Enter opens the editor, Escape cancels cleanly. **Documented gaps (live-verified, not automated)**: arrow keys do not move focus between cells (no grid-level keyboard navigation), and the save dialogs render hidden from assistive technology while visually modal — both recorded as findings for the accessibility review, not asserted.
**Data**: office=1606; anchor row 2609

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-063: The Product Group picker appears only when a specific currency is selected
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: —
**Automatable**: Yes

**Preconditions**: Office 4104 selected; Currency at its ALL default.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With Currency = ALL: the "Product Groups" picker panel (search box) is absent | The "Product Groups" picker panel is absent from the screen. |
| 2 | Select Currency = USD → the picker panel appears with its search box | The "Product Groups" picker panel appears with a search box. |
| 3 | Count the picker draggable product-group rows → greater than 0 | The add-override affordance is a currency-gated picker: absent on ALL, present with draggable rows once a specific currency is selected |

**Expected**: The add-override affordance is a currency-gated picker: absent on ALL, present with draggable rows once a specific currency is selected.
**Data**: office=4104; gating currency USD; picker search placeholder "Search product groups..."

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-064: Dragging a picker row stages a new override row with no request until Save; Discard drops it
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Functional |

**Depends_On**: TC-CPR-OVR-063
**Automatable**: Yes

**Preconditions**: Office 4104 selected; Currency USD; picker visible; Equipment tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the grid row count → attach a network listener for the backend save endpoint | The current grid row count is displayed. |
| 2 | Drag the picker first row into the Equipment grid panel | The dragged row is added to the Equipment grid. |
| 3 | Assert: row count +1 | The grid row count increases by 1. |
| 4 | ZERO save requests fired during the drag | No save request fires during the drag. |
| 5 | Save button enabled | The Save button becomes enabled. |
| 6 | the staged row shows Override Price 0.00 and inactive | The staged row displays Override Price 0.00 and the Active checkbox unchecked. |
| 7 | Navigate Home → "Unsaved changes" dialog → Discard | An unsaved-changes dialog opens, and Discard navigates to the home page. |
| 8 | Re-open + re-select 4104 + USD → the row count is back to its pre-drag value | Drag staging is purely client-side (no request until Save), lands at 0.00/inactive, dirties the form, and evaporates on Discard - proven by a post-reload recount. Nothing is ever saved |

**Expected**: Drag staging is purely client-side (no request until Save), lands at 0.00/inactive, dirties the form, and evaporates on Discard — proven by a post-reload recount. Nothing is ever saved.
**Data**: office=4104; currency USD; staged defaults 0.00/inactive

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-065: The picker serves the Labor tab and drag staging works there too
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-063, TC-CPR-OVR-064
**Automatable**: Yes

**Preconditions**: Office 4104 selected; Currency USD; picker visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Switch to the Labor tab → the picker panel persists and lists draggable Labor rows | The Labor tab becomes active and its grid, along with the product-group picker, is displayed. |
| 2 | Read the Labor grid row count → drag the picker first row into the Labor grid panel | The current Labor grid row count is displayed. |
| 3 | Assert the row count increased by 1 and Save enabled | The Labor grid row count increases by 1 and the Save button becomes enabled. |
| 4 | Navigate Home → Discard (nothing persists) | The same currency-gated picker serves Labor product groups, and drag staging behaves identically on the Labor tab |

**Expected**: The same currency-gated picker serves Labor product groups, and drag staging behaves identically on the Labor tab.
**Data**: office=4104; currency USD; Labor tab


---

## Wave-2 Coverage Expansion (NM-2271) — TC-CPR-OVR-066 through TC-CPR-OVR-127

## TC-CPR-OVR-084: Clicking Override Price cell on Labor reveals an editable field
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated; on the Override screen with office 1134 selected, Labor tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134, find row by Product Group 565 -> row resolves | Office 1134 loads on the Labor tab with the Product Group 565 row visible. |
| 2 | Click the Override Price cell (role=button) -> a numeric editor (field) reveals | The Override Price cell switches to edit mode. |
| 3 | Read the editor value -> pre-filled with `13.00` | The editor displays the pre-filled value 13.00. |
| 4 | Press Escape -> editor closes without committing | The Override Price cell on Labor is click-to-edit - clicking reveals a field pre-filled with the current value (13.00 for PG 565) |

**Expected**: The Override Price cell on Labor is click-to-edit — clicking reveals a field pre-filled with the current value (13.00 for PG 565).
**Data**: office=1134, tab=Labor, productGroup=565

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-085: Override Price accepts 0 on Labor (min valid)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 565 (reload restores originals) | The Labor row for PG 565 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '0')` | The value 0 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true, displayedValue='0.00', saveEnabled=true | Override Price accepts 0 as a valid value; editor closes; cell displays 0.00; Save enables |

**Expected**: Override Price accepts 0 as a valid value; editor closes; cell displays `0.00`; Save enables.
**Data**: office=1134, tab=Labor, productGroup=565, input=0, expectedDisplay=`0.00`

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-086: Override Price accepts mid-value decimal on Labor (25.50)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 565 (reload restores originals) | The Labor row for PG 565 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '25.50')` | The value 25.50 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true, displayedValue='25.50', saveEnabled=true | Override Price accepts a mid-range decimal; editor closes; cell displays 25.50; Save enables |

**Expected**: Override Price accepts a mid-range decimal; editor closes; cell displays `25.50`; Save enables.
**Data**: office=1134, tab=Labor, productGroup=565, input=25.50, expectedDisplay=`25.50`

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-087: Override Price accepts a large value on Labor (9999.99)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 565 (reload restores originals) | The Labor row for PG 565 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '9999.99')` | The value 9999.99 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true, displayedValue='9,999.99', saveEnabled=true | Override Price accepts a large value; editor closes; cell renders with thousands separator as 9,999.99; Save enables |

**Expected**: Override Price accepts a large value; editor closes; cell renders with thousands separator as `9,999.99`; Save enables.
**Data**: office=1134, tab=Labor, productGroup=565, input=9999.99, expectedDisplay=`9,999.99`

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-088: Override Price rejects -0.01 on Labor (below-min boundary)
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 565 (reload restores originals) | The Labor row for PG 565 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '-0.01')` | The value -0.01 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert: committed=false, ariaInvalid='true', borderColor contains oklch(0.577 0.245 27.325), errorText='' (no message — defect #4), saveEnabled=false, escapable=true | -0.01 is rejected - editor stays open, is invalid, red border, Save disabled, no error message (defect #4), escapable via Tab |

**Expected**: `-0.01` is rejected — editor stays open, aria-invalid=true, red border, Save disabled, no error message (defect #4), escapable via Tab.
**Data**: office=1134, tab=Labor, productGroup=565, input=-0.01, oracle=REJECTED

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-089: Override Price accepts 0.01 on Labor (just above zero)
| Priority | Status | Type |
|----------|--------|------|
| Low | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 893 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 893 (reload restores originals) | The Labor row for PG 893 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '0.01')` | The value 0.01 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true, displayedValue='0.01', saveEnabled=true | The smallest positive decimal step commits - cell displays 0.01, Save enables |

**Expected**: The smallest positive decimal step commits — cell displays `0.01`, Save enables.
**Data**: office=1134, tab=Labor, productGroup=893, input=0.01, expectedDisplay=`0.01`

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-090: Override Price 3rd decimal precision on Labor (12.345)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 565 (reload restores originals) | The Labor row for PG 565 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '12.345')` | The value 12.345 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true | The value commits and the Override Price editor closes. |
| 4 | read displayedValue — **Pending verification**: expected `12.35` (rounded) or `12.345` (3 decimals) or `12.34` (truncated) | A 3rd-decimal-place input commits (editor closes, Save enables). Exact displayed format is "Pending verification" - precision/rounding behavior on Override Price has not been probed |

**Expected**: A 3rd-decimal-place input commits (editor closes, Save enables). Exact displayed format is **Pending verification** — precision/rounding behavior on Override Price has not been probed.
**Data**: office=1134, tab=Labor, productGroup=565, input=12.345, expectedDisplay=Pending verification

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-091: Override Price above-max probe on Labor (999999.99)
| Priority | Status | Type |
|----------|--------|------|
| Low | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 893 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 893 (reload restores originals) | The Labor row for PG 893 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '999999.99')` | The value 999999.99 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true, displayedValue='999,999.99', saveEnabled=true — **Pending verification**: no confirmed hard max for Override Price | The value commits and displays as 999,999.99, and the Save button becomes enabled. |
| 4 | if rejected, apply OVERRIDE_REJECTION_SIGNATURE instead | "Pending verification" - no confirmed hard max for Override Price exists. If accepted: displays 999,999.99. If rejected: full rejection signature applies. TC-021 on Equipment states "a large number" is accepted, so acceptance is the expected path |

**Expected**: **Pending verification** — no confirmed hard max for Override Price exists. If accepted: displays `999,999.99`. If rejected: full rejection signature applies. TC-021 on Equipment states "a large number" is accepted, so acceptance is the expected path.
**Data**: office=1134, tab=Labor, productGroup=893, input=999999.99, expectedDisplay=Pending verification

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-092: Defect — abc blanks Override Price to dash, Save stays enabled (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Defect evidence |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 565 (reload restores originals) | The Labor row for PG 565 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', 'abc')` | The characters abc are entered into the Override Price field and Enter is pressed. |
| 3 | Assert the DEFECT: committed=true, displayedValue='—' (em-dash, blanked), saveEnabled=true | The cell blanks to an em-dash, the editor closes, and the Save button stays enabled. |
| 4 | **Expected (asserting the BUG — test FAILS when app is fixed)**: `abc` is not rejected — it blanks the cell to `—` and Save stays enabled, meaning an emptied price can be saved. When the app is fixed, `committed` will become `false` (proper rejection) and this test fails loudly. | The defect is documented: non-numeric input blanks the Override Price cell instead of being rejected. |

**Data**: office=1134, tab=Labor, productGroup=565, input=abc, oracle=DEFECT-COMMITTED

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-093: Defect — 1.2.3 silently corrupts Override Price to 1.23 (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Defect evidence |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 565 (reload restores originals) | The Labor row for PG 565 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '1.2.3')` — real keyboard input (method rule) | The characters 1.2.3 are typed into the Override Price field and Enter is pressed. |
| 3 | Assert the DEFECT: committed=true, displayedValue='1.23' (no % suffix — Override Price format), saveEnabled=true | The value commits as 1.23, the editor closes, and the Save button becomes enabled. |
| 4 | **Expected (asserting the BUG — test FAILS when app is fixed)**: `1.2.3` (a typo) is not rejected — the browser swallows the second dot, committing `1.23` as if valid. When fixed, the app will reject `1.2.3` and `committed` will become `false`. | The defect is documented: the app accepts 1.2.3 as 1.23 instead of rejecting the malformed multi-dot input. |

**Data**: office=1134, tab=Labor, productGroup=565, input=1.2.3, oracle=DEFECT-COMMITTED, expectedDisplay=`1.23`

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-094: Rejected — negative -5 on Override Price with full affordance oracle (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 565 (reload restores originals) | The Labor row for PG 565 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '-5')` — captures step-5 order BEFORE escape | The value -5 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert rejection oracle (all 7 affordances): | The editor remains open with the rejected value -5 still displayed. |
| 4 | - committed = false (editor stays open, value NOT committed) | The value is not committed and the Override Price editor stays open. |
| 5 | - ariaInvalid = 'true' | The field is displayed marked as invalid. |
| 6 | - borderColor contains `oklch(0.577 0.245 27.325)` (red) | The field border is displayed in red. |
| 7 | - errorText = '' (empty — defect #4: no error message ever shown) | No error message text is displayed next to the field. |
| 8 | - saveEnabled = false (Save DISABLED) | The Save button is displayed disabled. |
| 9 | - escapable = true (Tab moves focus out — NOT a focus trap) | Pressing Tab moves focus out of the field. |
| 10 | Assert `[role="alert"]` displayed text is empty (defect #4 evidence) | -5 is rejected with the full override rejection signature. The rejection is LOUD (visual cues) but SILENT (no error text - defect #4). Editor stays open; Save is disabled; focus is NOT trapped |

**Expected**: `-5` is rejected with the full OVERRIDE_REJECTION_SIGNATURE. The rejection is LOUD (visual cues) but SILENT (no error text — defect #4). Editor stays open; Save is disabled; focus is NOT trapped.
**Data**: office=1134, tab=Labor, productGroup=565, input=-5, oracle=OVERRIDE_REJECTION_SIGNATURE

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-095: Override Price leading zeros stripped on Labor (007 → 7.00)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 893 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 893 (reload restores originals) | The Labor row for PG 893 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '007')` | The value 007 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true, displayedValue='7.00', saveEnabled=true | Leading zeros are stripped - 007 commits as 7.00 (no % suffix on Override Price). Save enables |

**Expected**: Leading zeros are stripped — `007` commits as `7.00` (no `%` suffix on Override Price). Save enables.
**Data**: office=1134, tab=Labor, productGroup=893, input=007, expectedDisplay=`7.00`

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-096: Override Price scientific notation 1e5 on Labor
| Priority | Status | Type |
|----------|--------|------|
| Medium | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 893 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 893 (reload restores originals) | The Labor row for PG 893 is displayed with its original Override Price. |
| 2 | Call `probeEditOracle(row, 'overridePrice', '1e5')` | The value 1e5 is entered into the Override Price field and Enter is pressed. |
| 3 | Assert committed=true, displayedValue='100,000.00', saveEnabled=true | 1e5 commits on Override Price and displays as 100,000.00. Save enables. Max Discount % rejects 1e5 because the >100 cap fires (1e5 = 100000 > 100), not because the app refuses scientific notation; Override Price has no such cap, so it accepts the value |

**Expected**: `1e5` commits on Override Price and displays as `100,000.00`. Save enables. Max Discount % rejects `1e5` because the >100 cap fires (1e5 = 100000 > 100), not because the app refuses scientific notation; Override Price has no such cap, so it accepts the value.
**Data**: office=1134, tab=Labor, productGroup=893, input=1e5, expectedDisplay=`100,000.00`

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-097: Reverting Override Price to original disables Save on Labor
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Functional |

**Depends_On**: TC-CPR-OVR-B-01
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 565 (reload restores originals) | The Labor row for PG 565 is displayed with its original Override Price. |
| 2 | Call `editAndRevertToOriginal(row, 'overridePrice', '99.99', '13.00')` | The value 99.99 is entered, then the field is reverted to the original value 13.00. |
| 3 | Assert saveEnabledAfterEdit=true, saveDisabledAfterRevert=true | Editing Override Price to 99.99 enables Save; reverting to the original 13.00 disables Save (no net change). No data is committed - reload would restore regardless |

**Expected**: Editing Override Price to `99.99` enables Save; reverting to the original `13.00` disables Save (no net change, LR-009). No data is committed — reload would restore regardless.
**Data**: office=1134, tab=Labor, productGroup=565, editValue=99.99, originalValue=13.00

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-098: Active toggle-then-revert disables Save on Labor
| Priority | Status | Type |
|----------|--------|------|
| High | Ready | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: On the Override screen, office 1134, Labor tab, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor row PG 565 (reload restores originals) | The Labor row for PG 565 is displayed with its original Active state. |
| 2 | Read initial Active state (aria-checked) | The Active checkbox state is displayed. |
| 3 | Toggle the Active checkbox -> Save enables (form is dirty) | The Active checkbox flips to the opposite state and the Save button becomes enabled. |
| 4 | Toggle the Active checkbox again (revert to original state) -> Save disables (no net change) | Toggling Active then toggling back to the original state leaves zero net change - Save returns to disabled. No data is committed |

**Expected**: Toggling Active then toggling back to the original state leaves zero net change — Save returns to disabled (LR-009). No data is committed.
**Data**: office=1134, tab=Labor, productGroup=565

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-099: Committed — Max Discount % accepts 0 as min valid (Labor)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending | BVA / Positive |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 565 | The row for Product Group 565 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '0')` | The value 0 is entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert value commits as 0.00 % | The value commits and displays as 0.00 %. Save becomes enabled. |

**Expected**:
- `committed` = `true`
- `displayedValue` = `'0.00 %'`
- `saveEnabled` = `true`

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-100: Committed — Max Discount % accepts 50 as mid-value (Labor)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending | BVA / Positive |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 893 | The row for Product Group 893 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '50')` | The value 50 is entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert value commits as 50.00 % | The value commits and displays as 50.00 %. Save becomes enabled. |

**Expected**:
- `committed` = `true`
- `displayedValue` = `'50.00 %'`
- `saveEnabled` = `true`

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-101: Committed — Max Discount % accepts 100 as inclusive cap (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | BVA / Positive |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 565 | The row for Product Group 565 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '100')` | The value 100 is entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert value commits as 100.00 % | The value commits and displays as 100.00 %. Save becomes enabled. |

**Expected**:
- `committed` = `true`
- `displayedValue` = `'100.00 %'`
- `saveEnabled` = `true`

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-102: Rejected — Max Discount % rejects -0.01 just below minimum (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | BVA / Boundary |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 893 | The row for Product Group 893 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '-0.01')` | The value -0.01 is entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert result matches override rejection signature | The value is rejected with an invalid-state indicator. Save remains disabled and the field is escapable. |

**Expected**:
- `committed` = `false`
- `ariaInvalid` = `'true'`
- `borderColor` contains `oklch(0.577 0.245 27.325)`
- `errorText` = `''` (empty — no message ever shown)
- `saveEnabled` = `false`
- `escapable` = `true`

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-103: Defect — Max Discount % 0.5 misread as 50.00 % (100× multiplier bug, Labor)
| Priority | Status | Type |
|----------|--------|------|
| Critical | Pending | BVA / Defect evidence |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 565 | The row for Product Group 565 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '0.5')` | The value 0.5 is entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert the DEFECT: value commits as `50.00 %` instead of the correct `0.50 %` | The value commits and displays as 50.00 % instead of the correct 0.50 %. |
| 5 | **Expected (asserting the BUG — test FAILS when app is fixed)**: | The 100x multiplier defect is documented for the Labor tab's Max Discount % field. |
| 6 | - `committed` = `true` (editor closes — the app accepted this) | The editor closes, confirming the app accepted the entry. |
| 7 | - `displayedValue` = `'50.00 %'` (WRONG — should be `0.50 %`; a half-percent cap silently becomes fifty percent) | The cell displays 50.00 % instead of the intended 0.50 %. |
| 8 | - `saveEnabled` = `true` | The Save button becomes enabled. |
| 9 | **When the app is fixed**: `displayedValue` will change to `'0.50 %'`. The test fails, naming both values — the 100× multiplier bug is gone. | The defect baseline is recorded: 50.00 % is the value displayed for input 0.5 on the Labor tab's Max Discount % field. |

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-104: Committed — Max Discount % accepts 99.99 just below cap (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | BVA / Boundary |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 893 | The row for Product Group 893 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '99.99')` | The value 99.99 is entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert value commits as 99.99 % | The value commits and displays as 99.99 %. Save becomes enabled. |

**Expected**:
- `committed` = `true`
- `displayedValue` = `'99.99 %'`
- `saveEnabled` = `true`

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-105: Rejected — Max Discount % rejects 150 above 100 cap (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | BVA / Boundary |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 565 | The row for Product Group 565 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '150')` | The value 150 is entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert result matches override rejection signature | The value is rejected with an invalid-state indicator. Save remains disabled and the field is escapable. |

**Expected**:
- `committed` = `false`
- `ariaInvalid` = `'true'`
- `borderColor` contains `oklch(0.577 0.245 27.325)`
- `errorText` = `''` (empty — no message ever shown)
- `saveEnabled` = `false`
- `escapable` = `true`

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-106: Rejected — Max Discount % rejects -5 negative value (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | BVA / Boundary |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 893 | The row for Product Group 893 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '-5')` | The value -5 is entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert result matches override rejection signature | The value is rejected with an invalid-state indicator. Save remains disabled and the field is escapable. |

**Expected**:
- `committed` = `false`
- `ariaInvalid` = `'true'`
- `borderColor` contains `oklch(0.577 0.245 27.325)`
- `errorText` = `''` (empty — no message ever shown)
- `saveEnabled` = `false`
- `escapable` = `true`

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-107: Defect — Max Discount % 'abc' blanks cell to dash, Save stays enabled (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | Negative / Defect evidence |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 565 | The row for Product Group 565 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', 'abc')` | The characters abc are entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert the DEFECT: value blanks to `—` and Save remains enabled | The cell blanks to an em-dash and the Save button remains enabled. |
| 5 | **Expected (asserting the BUG — test FAILS when app is fixed)**: | The defect is documented for the Labor tab's Max Discount % field. |
| 6 | - `committed` = `true` (editor closes — the app accepted this non-numeric input) | The editor closes, confirming the app accepted the non-numeric input. |
| 7 | - `displayedValue` = `'—'` (cell blanked — an emptied discount cap can be saved) | The cell displays an em-dash. |
| 8 | - `saveEnabled` = `true` (WRONG — a blanked value should not be saveable) | The Save button stays enabled. |
| 9 | **When the app is fixed**: either the input is rejected (editor stays open, `committed`=false) or Save is disabled. The test fails, exposing the fix. | The defect baseline is recorded: the Max Discount % cell blanks to an em-dash on the Labor tab with Save left enabled. |

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-108: Defect — Max Discount % '1.2.3' silently corrupts to 1.23 % (Labor)
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | Negative / Defect evidence |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 893 | The row for Product Group 893 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '1.2.3')` | The characters 1.2.3 are typed into the Max Discount % field and Enter is pressed. |
| 4 | Assert the DEFECT: value commits as `1.23 %` (second dot swallowed) | The value commits as 1.23 % with the second dot dropped. |
| 5 | **Expected (asserting the BUG — test FAILS when app is fixed)**: | The defect is documented for the Labor tab's Max Discount % field. |
| 6 | - `committed` = `true` (editor closes — should have been rejected) | The editor closes, confirming the app accepted the malformed entry. |
| 7 | - `displayedValue` = `'1.23 %'` (WRONG — a multi-dot input is silently corrupted) | The cell displays 1.23 % instead of being rejected. |
| 8 | - `saveEnabled` = `true` | The Save button becomes enabled. |
| 9 | **When the app is fixed**: the input is rejected (editor stays open, `committed`=false, aria-invalid=true). The test fails, naming the change. | The defect baseline is recorded: 1.2.3 commits as 1.23 % on the Labor tab's Max Discount % field. |

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-109: Committed — Max Discount % strips leading zeros from 007 (Labor)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending | Negative / Coercion |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 565 | The row for Product Group 565 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '007')` | The value 007 is entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert value commits with leading zeros stripped | The value commits with leading zeros stripped and displays as 7.00 %. Save becomes enabled. |

**Expected**:
- `committed` = `true`
- `displayedValue` = `'7.00 %'`
- `saveEnabled` = `true`

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-110: Rejected — Max Discount % rejects scientific notation 1e5 (Labor)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending | Negative / Coercion |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 893 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 893 | The row for Product Group 893 is displayed. |
| 3 | Call `probeEditOracle(row, 'maxDiscount', '1e5')` | The value 1e5 is entered into the Max Discount % field and Enter is pressed. |
| 4 | Assert result matches override rejection signature | The value is rejected with an invalid-state indicator. Save remains disabled and the field is escapable. |

**Expected**:
- `committed` = `false`
- `ariaInvalid` = `'true'`
- `borderColor` contains `oklch(0.577 0.245 27.325)`
- `errorText` = `''` (empty — no message ever shown)
- `saveEnabled` = `false`
- `escapable` = `true`

**Data**: office=1134, tab=Labor, productGroup=893, baselineMaxDiscount=6.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-111: Save-cycle — reverting Max Discount % to original disables Save on Labor
| Priority | Status | Type |
|----------|--------|------|
| High | Pending | Save-cycle / Net-zero |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated, office 1134 selected, Labor tab active, PG 565 row visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Labor tab on office 1134 | Office 1134 loads on the Labor tab. |
| 2 | Find row by product group anchor PG 565 | The row for Product Group 565 is displayed. |
| 3 | Call `editAndRevertToOriginal(row, 'maxDiscount', '50', '14.00')` | The value 50 is entered, then the field is reverted to the original value 14.00. |
| 4 | Assert Save enables after edit, then disables after revert | Save enables after editing to a new value and disables after reverting to the original value. |

**Expected**:
- `saveEnabledAfterEdit` = `true` (editing to 50 dirties the form)
- `saveDisabledAfterRevert` = `true` (reverting to 14.00 — the original — disables Save)

**Data**: office=1134, tab=Labor, productGroup=565, baselineMaxDiscount=14.00 %

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-119: Sort produces verifiable monotonic order on Labor tab
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-OVR-050
**Automatable**: Yes
**Surface_Family**: combination (QUICK)

**Preconditions**: On the Override screen with office 1134 selected; Labor tab active; 2 rows visible (PG 565, PG 893); no filter or sort active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the visible row count → 2 (baseline) | 2 rows are displayed. |
| 2 | Type "565" into the text filter → grid narrows to 1 row (PG 565 only) | 1 row is displayed. |
| 3 | Open the "Product Group" column header dropdown → click "Sort ascending" | The column header dropdown menu opens and the sort is applied. |
| 4 | Assert: still 1 row visible (filter survives the sort) | 1 row is still displayed after the sort. |
| 5 | the row is PG 565 | PG 565 is the visible row. |
| 6 | Clear the text filter → 2 rows restored | Both rows are displayed again. |
| 7 | assert sort order is maintained (Product Group values non-decreasing) | The Product Group values are displayed in non-decreasing order. |

**Expected**: Filter and sort compose without resetting each other on the Labor tab. Applying a sort while a text filter is active does not clear the filter; clearing the filter preserves the active sort. The 2-row dataset on 1134 is minimal but exercises the composition.
**Data**: office=1134; Labor tab; filter needle "565"; sort column "Product Group"; expected filtered count=1; expected full count=2

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-121: Select 10 rows-per-page → grid renders exactly 10 rows (OVR-RPP-2)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-011
**Automatable**: Yes
**Surface_Family**: dropdown (QUICK)

**Preconditions**: On the Override screen with office 9460 selected (via `CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED`); Labor tab active; grid populated with 212 rows; default rows-per-page is 20.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 9460, Labor tab (via volume bed constant) | Office 9460 loads on the Labor tab with 212 rows available. |
| 2 | Confirm the grid loads with the default page size (20 visible rows) | 20 rows are displayed on the page. |
| 3 | Open the rows-per-page selector and choose "10" | The grid re-renders to display 10 rows on the page. |
| 4 | Count visible grid rows → assert exactly 10 | 10 rows are displayed. |
| 5 | Confirm pagination state is consistent (page indicator shows page 1 of a page count > what 20/page would produce) | Selecting "10" re-renders the grid to show exactly 10 rows on page 1. The pagination updates to reflect 10-row pages. The default of 20 differs from 10, so this assertion "fails if the control does nothing" (an inactive control yields 20 visible rows ≠ 10) |

**Expected**: Selecting "10" re-renders the grid to show exactly 10 rows on page 1. The pagination updates to reflect 10-row pages. The default of 20 differs from 10, so this assertion **fails if the control does nothing** (an inactive control yields 20 visible rows ≠ 10).
**Data**: office=9460 (CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED); Labor tab; page size=10; default page size=20

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-122: Select 30 rows-per-page → grid renders exactly 30 rows (OVR-RPP-4)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-011
**Automatable**: Yes
**Surface_Family**: dropdown (QUICK)

**Preconditions**: On the Override screen with office 9460 selected (via `CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED`); Labor tab active; grid populated with 212 rows; default rows-per-page is 20.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 9460, Labor tab (via volume bed constant) | Office 9460 loads on the Labor tab with 212 rows available. |
| 2 | Confirm the grid loads with the default page size (20 visible rows) | 20 rows are displayed on the page. |
| 3 | Open the rows-per-page selector and choose "30" | The grid re-renders to display 30 rows on the page. |
| 4 | Count visible grid rows → assert exactly 30 | 30 rows are displayed. |
| 5 | Confirm pagination state is consistent (page count decreased relative to default 20-per-page) | Selecting "30" re-renders the grid to show exactly 30 rows on page 1. The pagination updates to reflect 30-row pages. The default of 20 differs from 30, so this assertion "fails if the control does nothing" (an inactive control yields 20 visible rows ≠ 30) |

**Expected**: Selecting "30" re-renders the grid to show exactly 30 rows on page 1. The pagination updates to reflect 30-row pages. The default of 20 differs from 30, so this assertion **fails if the control does nothing** (an inactive control yields 20 visible rows ≠ 30).
**Data**: office=9460 (CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED); Labor tab; page size=30; default page size=20

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-123: Select 40 rows-per-page → grid renders exactly 40 rows (OVR-RPP-5)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-011
**Automatable**: Yes
**Surface_Family**: dropdown (QUICK)

**Preconditions**: On the Override screen with office 9460 selected (via `CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED`); Labor tab active; grid populated with 212 rows; default rows-per-page is 20.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 9460, Labor tab (via volume bed constant) | Office 9460 loads on the Labor tab with 212 rows available. |
| 2 | Confirm the grid loads with the default page size (20 visible rows) | 20 rows are displayed on the page. |
| 3 | Open the rows-per-page selector and choose "40" | The grid re-renders to display 40 rows on the page. |
| 4 | Count visible grid rows → assert exactly 40 | 40 rows are displayed. |
| 5 | Confirm pagination state is consistent (page count decreased relative to default 20-per-page) | Selecting "40" re-renders the grid to show exactly 40 rows on page 1. The pagination updates to reflect 40-row pages. The default of 20 differs from 40, so this assertion "fails if the control does nothing" (an inactive control yields 20 visible rows ≠ 40) |

**Expected**: Selecting "40" re-renders the grid to show exactly 40 rows on page 1. The pagination updates to reflect 40-row pages. The default of 20 differs from 40, so this assertion **fails if the control does nothing** (an inactive control yields 20 visible rows ≠ 40).
**Data**: office=9460 (CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED); Labor tab; page size=40; default page size=20

---


## MCP_VERIFICATION_LOG

See corporate_override_core_test_cases.md — shared screen verification (2026-06-09, 2026-07-09).

## FIELD INVENTORY

See corporate_override_core_test_cases.md — all fields on the Product Group Override screen are documented in the core file's FIELD INVENTORY section.

## Validation Rules

See corporate_override_core_test_cases.md — validation rules for Override Price, Max Discount %, and Save are documented in the core file.

---

## TC-CPR-OVR-124: Select 50 rows-per-page → grid renders exactly 50 rows (OVR-RPP-6)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-OVR-011
**Automatable**: Yes
**Surface_Family**: dropdown (QUICK)

**Preconditions**: On the Override screen with office 9460 selected (via `CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED`); Labor tab active; grid populated with 212 rows; default rows-per-page is 20.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to office 9460, Labor tab (via volume bed constant) | Office 9460 loads on the Labor tab with 212 rows available. |
| 2 | Confirm the grid loads with the default page size (20 visible rows) | 20 rows are displayed on the page. |
| 3 | Open the rows-per-page selector and choose "50" | The grid re-renders to display 50 rows on the page. |
| 4 | Count visible grid rows → assert exactly 50 | 50 rows are displayed. |
| 5 | Confirm pagination state is consistent (page count decreased relative to default 20-per-page) | Selecting "50" re-renders the grid to show exactly 50 rows on page 1. The pagination updates to reflect 50-row pages. The default of 20 differs from 50, so this assertion "fails if the control does nothing" (an inactive control yields 20 visible rows ≠ 50) |

**Expected**: Selecting "50" re-renders the grid to show exactly 50 rows on page 1. The pagination updates to reflect 50-row pages. The default of 20 differs from 50, so this assertion **fails if the control does nothing** (an inactive control yields 20 visible rows ≠ 50).
**Data**: office=9460 (CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED); Labor tab; page size=50; default page size=20

---

