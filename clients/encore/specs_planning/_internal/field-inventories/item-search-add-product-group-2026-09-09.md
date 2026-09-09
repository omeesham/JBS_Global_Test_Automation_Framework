# Field Inventory — Item Search: Add Product Group page (APG) — re-walk

**Module**: item-search-add-product-group
**Client**: encore
**MCP_Session_Date**: 2026-09-09
**MCP_Session_Tool**: Playwright CLI (`playwright-cli`, session `apg`, state-load of the suite's refreshed auth) + `scripts/walk-coverage/enumerate-page.mjs` attempted for the machine denominator (it hung on this page in both logged attempts — see Coverage Manifest) + one standalone Playwright script for the drag probe (`.playwright-cli/apg-2026-09-09/apg-drag-probe.mjs`)
**MCP_Tool_Reason**: Unattended catalog walk with on-disk YAML snapshots and DOM reads; no pixel assertion beyond error-state captures, which the CLI screenshot covers (LR-038 v2). The drag probe needs raw `mouse.move/down/move/up`, which the CLI does not expose, so it runs as a Playwright script reusing the same saved session.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups/add
**Test_Entity**: Office 1101 - Corporate Office Encore USA SGA (admin-only feature; plan-pinned)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md
**Stale_After**: 2026-10-09
**Walk_Mode**: deep

Coverage_Ratio: 112/112 (100%) — measured against the DISCLOSED SNAPSHOT CENSUS in the Coverage Manifest, not against a machine denominator: `enumerate-page.mjs` hung on this page in both logged attempts and produced no JSON. Every census key is dispositioned; the closure gate must still treat this artifact as machine-incomplete (see Completion_Record).
Completion_Record: NONE — no `reports/walk-coverage/isr-apg*.json` exists. `enumerate-page.mjs --module=item-search-add-product-group` was run with the CDP listener pass (killed idle after 27 min) and with `--no-cdp` (killed idle after 25 min); both stopped logging after the resting-state `[derive-type]` phase with node and the browser at rest (logs `apg-enumerate.log`, `apg-enumerate-nocdp.log` in the session scratchpad). The Coverage Manifest is a census of the on-disk accessibility snapshots, declared as such; it fails the closure gate's completion-record check by design until the enumerator is fixed and re-run (open tooling item for the owner).
Walk_State: module=item-search-add-product-group walked=[resting, expand:service-type, expand:sort-order, picker:no-match, item:added, panel:collapsed, post-save, save:rejected, breadcrumb:exit]
CrossCheck: not-computable — the enumerator's two lenses (A: heuristic net, B: focusable pass) never ran, so there is no A△B review set; the census is a single lens. Recorded as a gate failure, not as clean.
jira_tickets: [NM-2253, NM-2259, NM-2043, NM-1757, NM-2055, NM-2050, NM-1907, NM-2036]
Provenance: RE-WALK of the page first inventoried in `item-search-add-product-group-2026-08-31.md`. That artifact was split out of the list-page walk and carried only the seven form controls; it missed the sub-class panel's own controls (search, sort order, Labor filter, Reset, the panel collapse toggle, the per-item remove control) and never probed boundaries, the option set, uniqueness, or the picker's behaviours. Its "24/24" ratio was measured against the LIST page's control set (the branch snapshot fired before the route change). This walk was configured to enumerate the Add page directly under its own surface config (`item-search-add-product-group` in `scripts/walk-coverage/enumerate-page.mjs`), but the enumerator hung on this page in both attempts (Completion_Record above), so the denominator is a disclosed census of the Add page's own snapshots — still the Add page's controls, never the list page's. Every observation below was made live on 2026-09-09; nothing is carried over unverified.
baselineScope: baseline-absent (environment-blocked — see Baseline_Artifact; the old site could not be reached by automated browsers on 2026-08-31 and was not retried here)

---

## URL(s) visited

- `…/locations/1101/products/product-groups/add` — the Add Product Group PAGE (a route, not a dialog), reached from the Add button on the group list page. Left card "SUB-CLASS": a search box, a sort-order selector (Ascending/Descending), a Labor checkbox, a Reset button, and the full sub-class catalog as a draggable list. Right form: Name* / Description* / Service Type* / Active + Sub Classes* dual-list target + Cancel / Save. A divider button between the two collapses and expands the left card.
- `…/locations/1101/products/product-groups` — the group list page, used as the entry point (Add button) and as the search-back oracle for every save. Its own controls are inventoried in the sibling artifact `item-search-product-groups-2026-08-31.md`; one list-page fact this walk relied on is recorded under **List-page facts relied on** below.

## Live-state caveat

| Field | Live (2026-09-09) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Every form field | empty / placeholder / Active checked | same | Each arrival is a fresh form; nothing persists across visits (re-verified after three saves and several Cancels). |
| Sub-class catalog | 7,394 rows, Ascending, Labor unchecked, search empty | same | The whole catalog renders into the DOM (no virtualisation); the count is data-dependent and read live at the start of any case that asserts on it. |

## Jira/Confluence Findings (PLN-051 / LR-063)

Rovo search 2026-09-09: JQL over `project = NM` for product group / sub-class tickets (50 hits reviewed), plus the tickets below read in full. Confluence CQL for an Add-Product-Group spec returned nothing relevant (two unrelated pages) — **no Confluence spec exists for this form.**

| Ticket | What it fixes / states | Live DOM 2026-09-09 | Classification |
|---|---|---|---|
| NM-2043 (Story, Done) "New Product Group" | Dev lead (2026-06-08): after a successful save the user is redirected to the group's **details page**, "just like other components". | After every successful save the app lands on the group **list** page with the success toast. | **Contradiction — recorded as BUG-CANDIDATE (requirement contradiction), not coded around.** The last written intent says details page; the live app goes to the list. Either the e2e build predates that change or the change was reverted. Needs a dev/owner answer; the cases pin the observed landing and cite this row. |
| NM-2055 (QA Defect, Done) "does not redirect to the landing search page" | Closed "not a bug" by the dev lead (2026-06-01): "we changed this so … we redirect to details page". Earlier PR 1813 (2026-05-19) had implemented the list-page redirect. | list page | Same contradiction as above (two Jira statements, list vs details; live = list). |
| NM-1757 (QA Defect, Done) "Save remains enabled after creation" | Duplicate names rejected with a message; Save must not stay enabled after a save; a success message must show. | Duplicate rejected (see uniqueness rows); the page leaves after save so Save cannot linger; toast "Product Group created successfully" shows. | intentional / matches |
| NM-2050 (QA Defect, Done) "Reset removes already added Sub Classes" | Reset must clear only the panel's search / filters / sorting, never the added sub-classes. | Reset cleared search, Labor and sort; the added sub-class stayed. | fixed — verified; required TC |
| NM-1907 (QA Defect, Done, Edit page) "Save inconsistent when clearing required Name" | Save must stay disabled whenever Name is empty regardless of how it was cleared. | On the Add page both select-all+Delete and character-by-character backspace disable Save and mark the box invalid. | fixed — verified on Add; required TC |
| NM-2036 (QA Defect, Done) read-only role could add groups | role gate | not probed (single automation user) | out-of-scope: `rbac` family (deferred family per §3) |
| NM-2064 / NM-1924 / NM-1909 / NM-1910 | list-page sorting / result retention / pagination reset | list page | sibling artifact (NM-2258) |
| NM-2449 (To Do) duplicate sub-class/item names warning | Product Code page | n/a | different surface |

## Field Inventory

### Right form (agent-walked; census from snapshot `.playwright-cli/apg-2026-09-09/01-resting.yml` — the enumerator did not complete, see Coverage Manifest)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Name | `(none) — name="productGroupName", placeholder "Enter Product Group Name"` | Plain text | empty | required; **maxlength 50** — the 51st typed character is dropped and a 60-char paste is cut to 50, silently (no message, `aria-invalid` stays false); whitespace-only is treated as empty (box marked invalid, Save held back); leading/trailing spaces are accepted in the box and **trimmed by the server** (a name with a trailing space was rejected as a duplicate of the trimmed name); consecutive spaces collapse to one while typing; HTML-looking text (`<b>&'"</b>`) is stored and listed verbatim as text | enabled | required-set member | `affordance: none`. Empty-after-edit state: red border + red "!" icon + `aria-invalid="true"`; `aria-describedby` points at a message element that is never rendered — **no text message**. Tab moves focus out (no trap). |
| Description | `(none) — name="productGroupDescription", placeholder "Enter Product Group Description"` | Plain text | empty | required; **maxlength 100** (paste of 120 cut to 100; typing at the cap dropped); **must be unique across groups** — a new name with an already-used description is rejected by the server | enabled | required-set member | `affordance: none` |
| Service Type | `(none) — button[role=combobox] showing "Service Type" until chosen` | Dropdown / combobox (Radix Select) | placeholder | required; **90 options**, no search box inside the list (PLN-026 checked); first "Equipment Rental", last "ZSub Rental Specialty"; keyboard End+Enter selects the last | enabled | required-set member | Full option list under **Labels + option sets**. Both first and last options save (first: every create case; last: the special-character create). |
| Active | `(none) — button[role=checkbox] id "_r_18_-form-item" (+ hidden native input)` | Checkbox (Radix + native) | checked | none — not part of the required set; toggling it never changes Save | enabled | saved value drives the list's Active/Inactive status | Unchecked at save → the group is created **Inactive** and is found on the list only with the Active filter cleared. |
| Sub Classes (target) | `(none) — region under the "Sub Classes *" label` | Dual-list target (drop zone + added-item rows) | empty; instruction "Drag or double‑click items from the left to add sub‑classes" (non-breaking hyphens) | required (≥ 1 item); an item is added by **double-click** or by **drag** (full mouse sequence — proven 2026-09-09, see Interaction-axis deltas); adding the same item twice keeps one entry; each added row carries an unnamed icon button (×) that removes it | enabled | required-set member | The catalog row is NOT removed from the left list when added (copy, not move). |
| Added-item remove control | `(none) — button.text-xs.cursor-pointer inside the added row; no accessible name` | icon button | n/a | n/a | enabled | removing the last item restores the instruction and holds Save back | LR-029 row: no name, no testid. |
| Cancel | `(none) — text "Cancel"` | *(action)* | n/a | n/a | enabled | returns to the list; typed input discarded silently (no prompt) | |
| Save | `(none) — text "Save"` | *(action)* | n/a | disabled until Name, Description, Service Type and ≥ 1 sub-class are all set; clearing any one re-disables it; **stays enabled after a server rejection** (duplicate) so the user can correct the form | validity-gated | | Only one Save on the page (PLN-024). |

### Left card "SUB-CLASS" (agent-walked; census from the same snapshot)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Search | `(none) — input placeholder "Search"` (no maxlength) | Plain text (client-side filter) | empty | substring, case-insensitive ("Scenery" and "SCENERY" both → 8 rows); no-match → 0 rows and **no empty-state message**; clearing restores the full catalog | enabled | composes with Labor and sort | `affordance: none` |
| Sort order | `data-testid="select-currency"` (misnamed — copied from the currency selector) | Dropdown (Radix Select, 2 options: Ascending / Descending) | Ascending | flips the whole catalog order (Ascending first row ↔ Descending last row) | enabled | composes with search + Labor | LR-029 row: testid present but wrong. The first Ascending row is `" AIO Breakout Tech Table Kit Cable - 200' Reel"` — its name carries a **leading space** in the data, which is why it sorts before `01A…`; that is data, not a sort defect. |
| Labor | `data-testid="e2e-checkbox"` (same testid as the list page's Active filter) | Checkbox (Radix + native) | unchecked | checked → 626 labor sub-classes (e.g. "3-Hole Punch Labor", "A/V Graphics Operator"); unchecked → full catalog | enabled | composes with search + sort | |
| Reset | `(none) — text "Reset"` | *(action)* | n/a | clears search, Labor and sort order in one click; **keeps added sub-classes** (NM-2050) | enabled | | |
| Catalog rows | `(none) — div[draggable="true"]` (7,394 on 2026-09-09) | Drag-and-drop source rows + double-click | full catalog, Ascending | double-click or drag adds; the row stays in the catalog | enabled | filtered by search / Labor / sort | Collapsed to one archetype in the census (the enumerator never completed on this page). |
| Collapse / Expand search panel | `(none) — aria-label "Collapse search panel" / "Expand search panel"` | icon toggle on the divider | expanded | collapsing hides the left card and widens the form (Name box left 638→278 px, width 630→990 px at 1280 wide); expanding restores both | enabled | | The card's inputs keep a DOM box while collapsed (they sit behind the form), so visibility must be asserted by the form's geometry + the toggle's label, never by an element-visible check on the search box. |

## Labels + option sets

- Right form starred labels: Name, Description, Service Type, Sub Classes. Active is unstarred. Left card heading: "SUB-CLASS".
- Instruction under Sub Classes: "Drag or double-click items from the left to add sub-classes" — rendered with non-breaking hyphens; assertions must be hyphen-agnostic.
- Sort order options (2): Ascending, Descending.
- Service Type options (90, in list order): Equipment Rental · APP Downloaded · App Quality Assurance · App Quality Assurance – M · App Remote Access · Application Development · Application Development – M · Application Programming · Application Programming – M · Audio Conferencing · Cables & Consumables Fee · Cancellation Fee · Commission · Computer Rental · Concise Equipment · Concise Labor - M · Concise Support Labor · Creative Content · Creative Services · Cvent Application Programming – M · Cvent Mobile App · Cvent Remote Access · Cvent Support Labor · Delivery Pickup Labor · Digital Branding · Digital Services · Digital Services Equipment · Digital Services Labor · Digital Services Subrental · Discount · Event Technology Support · Extended Venue Access Managed Services · Freight · HSIA - Equipment · HSIA - Labor · HSIA - Subrental Equipment · HSIA - Wi-Fi Services · HSIA Services · Inter Office · Lighting · Lighting Subrental · Loss Damage Waiver · Misc Revenue · Mobile Apps · Music Access · Operator Labor · Photographic Services · Power Infrastructure · Power Labor · Power Rental Equipment · Power Sub-rental Equipment · Production Labor · Production Management · Receivable · Reimbursed Expense · Revenue · Rigging Equipment - Subrental · Rigging Equipment Rental · Rigging Labor · Rigging Labor - External · Sales & Consumables · Scenic Equipment Rental · Scenic Sub-Rental · Service Charge · Setup Charges · Shipping Resale · Sub-Contracted Labor · Sub-Rental Equipment · Tax · Technical Design & Engineering · Technician - Support Services · Telecom Equipment · Telecom Labor · Telecom Services · Telecom Subrental · TRA/AVT Royalty/Redevance · Venue Equipment Rental · Video Conferencing · Virtual Events Equipment · Virtual Events Professional Service · Virtual Events Support Labor · Web Conferencing · Wedding Event Equipment Rental · Wedding Event Labor · Wedding Event Sales & Consumables · xAdministrative Fee · xHSIA Reimbursed Expense · xMiscellaneous Services · ZSub Contractor Specialty Labor · ZSub Rental Specialty. (Snapshot `02-service-type-open.yml`.) "Equipment Rental" sits first, out of alphabetical order — the default-looking placement, not a sort defect.

## Interaction-axis deltas (§20 BEFORE/AFTER, every filter/toggle/sort/guard/io control)

| Control | Before | Action | After | Restore |
|---|---|---|---|---|
| Search | 7,394 rows | "Scenery" | 8 rows, all containing "Scenery" (first "01A Basic Scenery 1 Set Kit", last "MISC - Scenery Equipment") | clear → 7,394 |
| Search (case) | 8 rows for "Scenery" | "SCENERY" | the same 8 rows | — |
| Search (no match) | 7,394 | "zzzzqqq" | 0 rows; nothing rendered under Reset (no message) | clear → 7,394 |
| Search (broad) | 7,394 | "a" | 6,092 rows | clear → 7,394 |
| Labor | 7,394, first "AIO Breakout…" | check | 626 rows, first "3-Hole Punch Labor" | uncheck → 7,394 |
| Sort order | Ascending, first " AIO Breakout…", last "zzzzLight Fixture Lens DO NOT USE RETIRE ASSET" | Descending | first "zzzzLight Fixture…", last " AIO Breakout…" | Ascending → original order |
| Search + Labor + Descending | 7,394 | "Scenery" + Labor + Descending | 0 rows (no labor scenery) | Reset → search "", Labor unchecked, Ascending, 7,394 |
| Reset with an added item (NM-2050) | 1 added item; search "Scenery"; Labor checked | Reset | search "", Labor unchecked, Ascending; **the added item is still there** | — |
| Double-click catalog row | 0 added | dblclick " AIO Breakout…" | 1 added; catalog still 7,394 (copy, not move); instruction gone; Save unchanged (other fields empty) | × → 0 added, instruction back |
| Double-click the same row again | 1 added | dblclick the same row | still 1 (no duplicate) | — |
| Drag catalog row → Sub Classes (standalone script) | 0 added (after a dblclick positive control added 1 and × removed it) | `mouse.move → down → move(6 steps) → move(30 steps) → up` from row 0 onto the instruction box | **1 added** — drag works with the full mouse sequence | — |
| Remove control (×) | 1 added, everything else filled, Save enabled | click × | 0 added, instruction back, **Save disabled** | dblclick → Save enabled |
| Active | checked | click | unchecked; Save unchanged | click → checked |
| Name (required set complete) | Save enabled | Ctrl+A, Delete | "" ; `aria-invalid=true`; red border + "!" icon; Save disabled | retype → Save enabled |
| Name | Save enabled | Backspace ×10 (character by character) | same as above | retype → enabled |
| Name | — | "   " (spaces only) | box reads " " (collapsed), `aria-invalid=true`, Save disabled | — |
| Name | — | "  Walk Probe  " | box reads " Walk Probe ", Save enabled | — |
| Description (set complete) | Save enabled | clear | Save disabled | refill → enabled |
| Collapse search panel | Name box left 638 / width 630; label "Collapse search panel" | click | left 278 / width 990; label "Expand search panel" | click → 638 / 630; "Collapse search panel" |
| Browser Back with a typed Name | on Add, Name "dirty" | `history.back()` | on the list page, **no prompt**; the list still shows its previous search | — |

## Save-cycle observations (three real creates, one inactive; five rejected attempts)

### Save button behavior
Disabled at rest and while any of Name / Description / Service Type / ≥ 1 Sub Class is missing; enabled the moment the set completes; re-disabled when any member is cleared or the last sub-class is removed. Active never affects it. After a server-side rejection the form is kept and Save **stays enabled**.

### Save dialog
None — Save commits directly.

### Post-save
Toast `Product Group created successfully` (visible ~3 s) and the app lands on the **group list page** (`…/products/product-groups`), whose previous search is re-run so the new group is visible at once if it matches. Jira's last statement (NM-2043 / NM-2055, dev lead) says the details page — see the contradiction row above.

### Server-side rules (verbatim messages)
- Duplicate **name**: error toast `Product group name 'ZZ E2E Walk 2026-09-09 A' or group description 'dup probe' already exists.` — the form stays, Save stays enabled, one console error (the failed create call). Screenshot `14-duplicate-toast.png`.
- Rejection toasts **do not auto-hide and follow the user off the page** (found by the automation run of 2026-09-09, not by the walk): the two duplicate-name toasts raised by TC-ISR-PGR-018 were still on screen when TC-ISR-PGR-019, in the same browser, had gone through Cancel, the list page and a fresh Add form — at least 12 s later. The failure screenshot showed the front toast reading `Product group name 'ZZ E2E Walk 2026-09-09 A' or group description 'duplicate name check 1788952487101' already exists.` (TC-018's values) on TC-019's form; the run log (`.playwright-cli/apg-2026-09-09/apg-spec-run1.txt` — the runner's console output, kept as `.txt` because `.log` files are ignored by git) keeps the strict-mode error listing both `<li data-sonner-toast data-type="error">` elements (`data-index` 0 and 1). The screenshot itself was not retained — the run-1 artifacts were cleared before run 2. The success toast, by contrast, hides in ~3 s. Consequence for the page object: a rejection read must wait for the toast the Save click itself raises (matching-toast count grows by one) — the first version matched "any toast with the text", resolved instantly on the leftover, and TC-018's second Save was never actually observed.
- Duplicate **description** with a new name: the same message shape (`… name 'ZZ E2E Walk 2026-09-09 B' or group description 'walk probe A' already exists.`) — **description uniqueness is enforced** although no Jira ticket states it (NM-1757 only mentions the name).
- Trailing space in the name: rejected as a duplicate with the name shown **trimmed** in the message → the server trims before comparing; no near-duplicate is created.
- Special characters: `ZZ E2E Walk 2026-09-09 <b>&'"</b> C` saved and is listed verbatim as text.

### Dirty-state behavior
No unsaved-changes guard on Cancel, on browser Back, or on the breadcrumb — all three discard silently. Breadcrumb probe (2026-09-09, `playwright-cli` session `apg2`): Name typed ("dirty crumb", read back), "Product Groups" crumb clicked → the group list page (`/products/product-groups`), 0 alert dialogs, 0 dialogs, skeletons 0 (`15-breadcrumb-exit.yml`); Add clicked again → the Name box is empty.

### Residue created by this walk (accepted on the fully-writable e2e environment, LR-ENC-007 — there is no delete path)
| Group | Description | Service Type | Active |
|---|---|---|---|
| `ZZ E2E Walk 2026-09-09 A` | `walk probe A` | Equipment Rental | yes |
| `ZZ E2E Walk 2026-09-09 B` | `walk probe B` | Equipment Rental | **no** |
| `ZZ E2E Walk 2026-09-09 <b>&'"</b> C` | `special chars C` | ZSub Rental Specialty | yes |

Group A is reused deliberately by the duplicate-name and duplicate-description cases as a stable fixture (its name and description live in `src/data/product-groups/product-groups.ts`); if it is ever renamed or removed those cases fail loudly, which is the intended signal.

## List-page facts relied on (sibling surface, NM-2258)

- The list's Active checkbox is a **two-way status filter**: checked → only Active groups ("ZZ E2E Walk" → group A), unchecked → only **Inactive** groups (group B), never "all". The inactive-create case searches back with the filter cleared for that reason.
- The list re-runs its last search when the Add page returns to it (NM-1924), so a freshly created group that matches the previous term appears without a new Search click.

## Observations

### Bugs / Defects
- **BUG-CANDIDATE (requirement contradiction, needs owner/dev confirmation)** — post-save landing: live app → group list page; NM-2043 (2026-06-08) and NM-2055 (2026-06-01) state the group's details page. Not filed as a defect by this walk: two Jira statements point opposite ways over three weeks (PR 1813 list → "we changed to details"), so the intended behaviour must be confirmed before a bug is raised. The cases pin the observed list landing.
- **Description uniqueness is enforced without a stated requirement** — a new name with an already-used description is rejected. Recorded as a discussion item (is a unique description intended?), not a bug.
- **BUG-CANDIDATE (UX, needs owner ruling)** — a rejection toast never hides by itself and survives leaving the page: after a duplicate-name rejection the error is still showing on the group list and on a fresh, empty Add form until its × is clicked (≥ 12 s observed in the 2026-09-09 automation run — see Server-side rules), while the success toast hides in ~3 s. A user opening a new group sees "already exists" about a previous attempt. Not filed: a sticky error toast may be the intended notification style; the question is whether it should clear on navigation.

### Suggestions / Improvements
- The Name/Description caps (50 / 100) are silent — no counter, no message when the limit trims a paste.
- The required-empty state shows only a red border and "!" icon; the message element the input references is never rendered, so there is no text such as "Name is required".
- The sub-class picker shows nothing at all for a no-match search (no "no results" text).
- The sort-order selector carries `data-testid="select-currency"` (copy-paste from the currency selector) and the Labor checkbox reuses `e2e-checkbox`; the × remove control has no accessible name. Reported in the LR-029 table, not as bugs.
- A catalog row name begins with a space (" AIO Breakout Tech Table Kit Cable - 200' Reel"), which pins it to the top of the Ascending list — data quality, not a sort defect.

## LR-029 missing / misnamed testid report

Verified against live DOM 2026-09-09.

| Control | Surface | Has testid | Next-best stable anchor |
|---|---|---|---|
| Name, Description | form | no | `input[name="productGroupName"]`, `input[name="productGroupDescription"]` (placeholders also stable) |
| Service Type | form | no | `button[role=combobox]` without a testid, text "Service Type" until chosen |
| Active | form | no | `button[role=checkbox]` without a testid (the only such checkbox on the page) |
| Sub Classes × remove | form | no, no accessible name | `button.text-xs.cursor-pointer` inside the added row (unique on the page) |
| Cancel, Save | form | no | button text |
| Search | left card | no | placeholder "Search" |
| Sort order | left card | **yes, misnamed** `select-currency` | the testid (stable but misleading) or `button[role=combobox]` with text Ascending/Descending |
| Labor | left card | `e2e-checkbox` (shared with the list's Active filter — unique on this page) | the testid, scoped to this page |
| Reset | left card | no | button text |
| Catalog rows | left card | no | `[draggable="true"]` |
| Collapse / Expand | divider | no | `aria-label` "Collapse search panel" / "Expand search panel" |

## Staleness signal

- **Last verified**: 2026-09-09 (full walk, three creates)
- **Fresh-until**: 2026-09-23
- **Stale-after**: 2026-10-09
- **Refresh triggers**: the post-save landing changes (details page) · the required set or the 50/100 caps change · a Service Type option is added or removed (90 today) · the Add page becomes a dialog · the picker gains virtualisation, testids or an empty-state message · the description-uniqueness rule is lifted · group A (`ZZ E2E Walk 2026-09-09 A`) is renamed or removed.

## Coverage Manifest (snapshot census — the machine denominator was NOT produced)

**Machine denominator: not produced.** `scripts/walk-coverage/enumerate-page.mjs --module=item-search-add-product-group` was run twice on 2026-09-09 — with the CDP listener pass (killed idle after 27 min) and with `--no-cdp` (killed idle after 25 min). Both logged the resting state's `[derive-type]` warnings and then nothing; node and the browser sat at rest (logs `apg-enumerate.log` / `apg-enumerate-nocdp.log`, session scratchpad). No `reports/walk-coverage/isr-apg*.json` exists. The page holds 7,394 draggable catalog rows in the DOM at rest, which no other walked surface approaches; the hang is an open tooling defect for the owner (`scripts/` is owner-only), not something this walk may work around by self-counting and calling it machine output.

**What this table is**: a census of the on-disk accessibility snapshots taken during the walk, scoped to the page's `main` region, archetype-collapsed the way the enumerator collapses (one row per identical control family, count noted). It is the honest denominator this walk CAN offer, labelled so nobody mistakes it for the enumerator's union lens. Every key is dispositioned; nothing is deferred (Walk_Mode deep). LR-062 condition 1 (machine-enumerated) is NOT met and `Completion_Record` says so.

Census sources: `.playwright-cli/apg-2026-09-09/01-resting.yml` (resting), `02-service-type-open.yml`, `03-sort-order-open.yml`, `04-picker-no-match.yml`, `05-item-added.yml`, `08-after-create-A.yml`, `15-breadcrumb-exit.yml`, screenshots `06`–`14`. **112 keys**: 17 resting controls + 1 catalog-row archetype (×7,394) + 90 Service Type options + 2 sort options + 1 added-row remove control + 1 toast dismiss control. **Coverage_Ratio: 112/112.**

| element-key | role | found (date / source) | disposition |
|---|---|---|---|
| `census:button\|trigger-button\|app shell (ref e177)` | button | 2026-09-09 / 01-resting.yml | out-of-scope: outside-module — app-shell sidebar toggle, Navigator layout chrome outside every products-module denominator; dispositioned the same way by the sibling item-search inventories |
| `census:link\|Products\|breadcrumb (ref e181)` | link | 2026-09-09 / 01-resting.yml | out-of-scope: duplicate-of: `census:link\|Product Groups\|breadcrumb` — the same shell breadcrumb archetype and the same silent-discard exit; the nearer crumb is the one a user editing a group would reach for, and TC-ISR-PGR-030 drives it |
| `census:link\|Product Groups\|breadcrumb (ref e185)` | link | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-030 |
| `census:textbox\|Search\|sub-class card (ref e206)` | textbox | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-020, TC-ISR-PGR-023 |
| `census:combobox\|sort order, visible trigger\|sub-class card (ref e207, testid select-currency)` | combobox | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-022, TC-ISR-PGR-023 |
| `census:combobox\|sort order, hidden native select\|sub-class card (ref e208)` | combobox | 2026-09-09 / 01-resting.yml | out-of-scope: not-interactive — hidden native select the selector library renders behind the visible trigger for form submission; not focusable or clickable by a user (the visible trigger row carries the coverage) |
| `census:checkbox\|Labor\|sub-class card (ref e211, testid e2e-checkbox)` | checkbox | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-021, TC-ISR-PGR-023 |
| `census:button\|Reset\|sub-class card (ref e213)` | button | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-023 |
| `census:button\|Collapse search panel / Expand search panel\|divider (ref e15008)` | button | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-026 (both labels of the one control) |
| `census:button\|Cancel\|form (ref e15012)` | button | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-008 |
| `census:button\|Save\|form (disabled at rest)` | button | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-006, TC-ISR-PGR-011, TC-ISR-PGR-016, TC-ISR-PGR-018, TC-ISR-PGR-019, TC-ISR-PGR-027, TC-ISR-PGR-028 |
| `census:textbox\|Enter Product Group Name\|form (ref e15022)` | textbox | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-012, TC-ISR-PGR-014, TC-ISR-PGR-015, TC-ISR-PGR-018, TC-ISR-PGR-028 |
| `census:textbox\|Product Group Description\|form (ref e15030)` | textbox | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-013, TC-ISR-PGR-016, TC-ISR-PGR-019 |
| `census:combobox\|Service Type, visible trigger\|form (ref e15040)` | combobox | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-017, TC-ISR-PGR-028 |
| `census:combobox\|Service Type, hidden native select\|form (ref e15041)` | combobox | 2026-09-09 / 01-resting.yml | out-of-scope: not-interactive — hidden native select behind the visible trigger, as above |
| `census:checkbox\|Active, visible\|form (ref e15046)` | checkbox | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-016, TC-ISR-PGR-027 |
| `census:checkbox\|Active, hidden native input\|form` | checkbox | 2026-09-09 / 01-resting.yml | out-of-scope: not-interactive — hidden native checkbox input behind the visible control; not user-reachable |
| `census:row\|catalog item [archetype×7,394]\|sub-class card (div[draggable=true])` | draggable row | 2026-09-09 / 01-resting.yml | covered-by-TC: TC-ISR-PGR-024 (double-click add), TC-ISR-PGR-025 (drag add), TC-ISR-PGR-020 / TC-ISR-PGR-021 / TC-ISR-PGR-022 (filtered and sorted reads) |
| `census:option\|Service Type option [archetype×90]\|listbox (refs e15059…)` | option | 2026-09-09 / 02-service-type-open.yml | covered-by-TC: TC-ISR-PGR-017 (all 90 asserted verbatim in order; first, middle and last selected), TC-ISR-PGR-028 (last option saved for real) |
| `census:option\|Ascending / Descending [archetype×2]\|listbox (refs e15333, e15337)` | option | 2026-09-09 / 03-sort-order-open.yml | covered-by-TC: TC-ISR-PGR-022 |
| `census:button\|added sub-class × remove\|form (ref e58470; no accessible name)` | button | 2026-09-09 / 05-item-added.yml | covered-by-TC: TC-ISR-PGR-024 |
| `census:button\|toast dismiss ×\|notifications region (present only while a toast shows)` | button | 2026-09-09 / 14-duplicate-toast.png | out-of-scope: outside-module — the notification region's dismiss control is app-shell chrome present on every page; the toast TEXT this page raises is asserted by TC-ISR-PGR-011, TC-ISR-PGR-018 and TC-ISR-PGR-019, and its persistence is recorded under Observations |

### State supplements (agent-walked; no enumerator run for any state)

- **expand:service-type** (`02-service-type-open.yml`) — adds the 90-option listbox above; no other control appears; no search box inside the list (PLN-026 checked).
- **expand:sort-order** (`03-sort-order-open.yml`) — adds the 2-option listbox above.
- **picker:no-match** (`04-picker-no-match.yml`) — the catalog region holds zero rows and no message; every resting control is unchanged.
- **item:added** (`05-item-added.yml`) — adds the remove control above; the instruction text under Sub Classes is replaced by the added row.
- **panel:collapsed** (`12-panel-collapsed.png`) — the divider control relabels to "Expand search panel"; the left card's controls leave the visible layout (they keep DOM boxes behind the form — see the Collapse row's Notes).
- **post-save** (`08-after-create-A.yml`, `13-list-with-C.png`) — the group list page; its controls are the sibling inventory's (`item-search-product-groups-2026-08-31.md`).
- **save:rejected** (`09-duplicate-name.png`, `14-duplicate-toast.png`) — the form unchanged plus the error toast and its dismiss control.
- **breadcrumb:exit** (`15-breadcrumb-exit.yml`) — the group list page after the "Product Groups" crumb was clicked on a dirty form; no prompt (probe recorded under Dirty-state behavior).

### §3 surface families (LR-065) — the sub-class catalog (a list surface) and the Sub Classes target

`behavior-cases: result-fidelity (TC-ISR-PGR-020, TC-ISR-PGR-021 — every filtered row contains the term / is a labor row), sorting (TC-ISR-PGR-022 — first and last row swap between Ascending and Descending), empty-vol (TC-ISR-PGR-020 — no-match → 0 rows, cleared → the full catalog count read live), combination (TC-ISR-PGR-023 — search + Labor + sort reset together with an added item kept), render-state (TC-ISR-PGR-024 — the added row renders with its remove control and the instruction returns on removal; TC-ISR-PGR-026 — panel geometry), persistence (TC-ISR-PGR-029, TC-ISR-PGR-030 — nothing survives leaving the page; picker state is not stored across visits, Live-state caveat)`
- `out-of-scope:pagination=the catalog is one scrolling list with no pager; all 7,394 rows render at rest (01-resting.yml)`
