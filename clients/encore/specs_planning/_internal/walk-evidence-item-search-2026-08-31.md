# Walk Evidence — Item Search (NM-2253) — 2026-08-31

**Module**: item-search (Products page + Product Groups sibling page)
**Office**: 1101 - Corporate Office Encore USA SGA (admin-only feature; plan-pinned)
**URLs**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products` (+ `/product-groups`, `/product-groups/add`)
**Walk mode**: quick (TDW-Q per LR-064/LR-072 — CoverageMode: quick)
**Identity**: HUNTER (machine enumeration + all live probes); OWNER only for plan-file D-rows
**Browser tool**: Playwright CLI (LR-038 v2 — catalog walkthrough, unattended; session `isr2`, state-load `clients/encore/.auth/encore-state.json`)
**Evidence dir**: `.playwright-cli/isr-2026-08-31/` (30+ dated snapshots named per probe) + `reports/walk-coverage/isr*.json|.manifest.md` (6 machine runs)
**Governing plan**: `plans/pending/PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md`
**Owner rulings honored**: OR-1..OR-6 (jira-defect-crossref-item-search-2026-08-31.md §Owner rulings)

---

## Stage 1 — Machine enumeration (LR-062 denominator; all 6 runs exit 0, 2026-08-31 20:05–20:07 IST)

| State | Report | Denominator (archetype-collapsed) | Raw |
|---|---|---|---|
| products resting | `reports/walk-coverage/isr.json` | 70 | 70 |
| products search:executed | `reports/walk-coverage/isr--search-executed.json` | 29 | 29 |
| products expand:grid-options | `reports/walk-coverage/isr--expand-grid-options.json` | 63 | 68 |
| product-groups resting | `reports/walk-coverage/isr-pgr.json` | 28 | 32 |
| product-groups search:executed | `reports/walk-coverage/isr-pgr--search-executed.json` | 28 | 28 |
| product-groups dialog:add-group | `reports/walk-coverage/isr-pgr--dialog-add-group.json` | 24 | 28 |

No ABORT-S1, no TOOTHLESS. Machine denominator is the LR-062 truth source for the GIVER
Coverage Manifests; each report's `derived_types` block carries per-element probe evidence.
Non-probeable machine entries (FORM/DIV wrappers, icon-only buttons) are resolved by the
Stage-2 human probes below.

**Selector discovery (machine)**: the search panel ships `e2e-*` data-testids —
`e2e-search-section-wrapper`, `e2e-search-form`, `e2e-search-input`, `e2e-barcode-input`,
`e2e-toggle-group`, `e2e-toggle-keyword`, `e2e-checkbox`, `e2e-popover-trigger`, `e2e-card`,
`e2e-card-header`, `e2e-card-title`, `e2e-card-content`. Grid/toolbar/dialogs expose NO testids —
role+name selectors with tracked fallback per the testid golden rule.

**Naming note**: the `dialog:add-group` branch label is a misnomer discovered live — PGR "Add" is a
page ROUTE (`…/product-groups/add`), not a dialog. The enumeration is still valid (branch clicked
the Add button and enumerated the mounted state); GIVER artifacts must call it the Add page.

## Stage 2 — Agent probes (live, session isr2; every claim snapshot-backed)

### Search panel (Products)

| Element | Live evidence | Disposition seed |
|---|---|---|
| Radio "Keyword Search" (`e2e-toggle-keyword`) | single radio in group, checked at rest ×3 reads | FCC radio (single-option group) |
| Any Field text (`e2e-search-input`) | "Amp" → 376/15,874; all 10 sampled rows contain "Amp" (OR-3 verified); help popover text: "Search by exact keywords across all product fields — item number, description, category, or product group" | FCC plain text + result-fidelity L1 |
| Barcode (`e2e-barcode-input`) | garbage "ZZNOBARCODE99" → "0 products found" + "No results" empty state (stable, skel=0); positive-filter TCs await owner barcodes (OR-4, non-blocking) | FCC plain text + empty-vol L1 |
| Quantity Greater Than Zero checkbox | unchecked at rest (reads ×3: pristine load, restored state, blind re-drive); toggling probed pre-compaction (filters to owned rows) | FCC checkbox |
| Active checkbox | checked at rest ×3 | FCC checkbox |
| Location combobox | listbox "Suggestions", 5,102 options incl. "Select Location" placeholder | FCC dropdown (large) |
| Region combobox | 106 options (105 regions + placeholder) | FCC dropdown |
| **Location ⟷ Region exclusivity (OR-2)** | VERIFIED BIDIRECTIONALLY: set Location=1101 → Region cleared to placeholder; set Region=Boston → Location cleared to placeholder. Last-set wins. | combination family TC |
| Product Organization popover (`e2e-popover-trigger`) | multi-select checkbox list: Select All / None / United States / Canada / Mexico (6 inputs); default None | FCC multi-select popover |
| Prep/Return Date Time popovers ×2 | calendar (month grid Aug 2026) + time spinner (12:00 AM); values default Aug 31 2026 12:00 AM / 11:59 PM. **OR-1**: field-level verification ONLY — no availability-behavior assertions. Mechanically the dates DO ride every search (see API section) — recorded for honesty, excluded from TC oracles per owner ruling. | FCC date/offset (field-level per OR-1) |
| Search button | executes POST search; ~11s render (search-executed profile) | action |
| Reset button | clears text/region/barcode; **restores Location = 1101 (current-office default)**, Qty>0 unchecked, Active checked; **empties grid to "0 products found" until next Search** (stable ×3 polls over 21s — not a loading window) | reset TC + empty-vol evidence |
| Collapse search panel | tooltip "Hide search"; collapse/expand probed pre-compaction | chrome toggle |
| Search help button | CLICK-triggered popover (not hover); content varies per search type | tooltip sweep (OR-6) |
| "More information" info icon | tooltip: "This is the future products page for the location." | tooltip sweep (OR-6) |

### Results grid (Products, search:executed)

- 13 columns: Category, Sub Category, Class, Product Group, Sub Class, Item, Product Code ID,
  Description, Available, Owned, Out of Service, In Sequence, Location Name.
- **Column-header click opens a per-column menu**: Sort ascending / Sort descending / Hide column
  (evidence `col-menu-owned.yml`, `tmp-sm.yml`). Sorting is menu-driven, NOT header-toggle.
- Sort verified: default = MajorCategory ascending (server `sortBy:"MajorCategory",
  sortDescending:false`); Sort descending → Video-first (flip proven). "Sort ascending" from
  default order sends an identical request (no-op re-request, same order — not a defect).
- **Blank-Category rows sort first**: the Labor "Abstracts - Project Management" row renders an
  EMPTY Category cell (empty MajorCategory in the search projection) yet its View dialog shows
  Category Name=Labor. Empty string sorts before "Audio" ascending. Observation (projection vs
  hierarchy mismatch), not a sort defect.
- Row selection: click selects (aria-selected/data-state=selected), mounts toolbar buttons.
- Cell tooltips: every cell span is a Radix tooltip trigger (503 triggers page-wide);
  tooltip fires ONLY when text is truncated (positive: truncated "Digital Services Labor" cell
  → full-text tooltip; negative: short "Audio Amplifier" cell → none). Column headers and the
  1101 location chip have NO tooltips (1 hover each; positive controls in-session).
- Pagination bar: rows-per-page combobox 50 default, options 10/20/30/40/50; page textbox
  "1 / 318"; first/prev disabled on page 1; Next → page 2 (different rows, first/prev enable);
  Go-to-first returns. 15,874 rows / 50 = 318 ✓.
- Grid Options (OR-5): menu = "Reset to Default View" + 12 column menuitemcheckboxes (Item column
  ABSENT = non-hideable). Toggle cycle proven: uncheck Owned → header count 13→12, re-open menu
  (item shows unchecked), re-check → header restored.

### Row-selected toolbar + dialogs (multi-step states, §20-Q agent-driven)

- Toolbar (visible with a row selected): Product Group | View Availability | View Product Code
  [+ segment caret] | Add Product Code [+ segment caret] | Grid Options.
- **View Product Code dialog** ("Product Code Details", `dlg-view-pc.yml`): 3 tabs.
  - Item tab: hierarchy sections Category (read-only text) / Sub Category / Class / Sub Class /
    Item, with EDITABLE comboboxes (Sub-Category Name*, Service Type*, Class Name*, Sub-Class
    Name*), Item Name*/Item Description* textboxes, Oracle Item Number, Product Type*,
    Service Type*, Active checkbox, Product Organization popover, Product Code ID (display,
    73753). Footer Save [disabled] + Close.
  - Cascade evidenced at rest: Sub-Class Name = "Please select" → its Service Type* combobox
    [disabled] "Select service type".
  - Save-enablement: typed "X" into Name (value committed to DOM) → Save STAYED disabled after
    blur. Undetermined whether view-mode or validity-gated (row's Sub Class chain incomplete).
    Recorded honestly; NOT asserted either way in TCs. React island (no Angular ng-dirty).
  - Product Code History tab: 15-column audit grid (Action, Parent Name, Product Name, Product
    Description, Product Type, Service Type Name, Product Group, Barcodeable, Weight, Eligible,
    Oracle Item Number, Active, Product Organization, Modified By, Modified Date) with its OWN
    Grid Options button — per-STATE chrome (CEO-M13): in-dialog Grid Options ≠ page Grid Options.
  - Translations tab: "Translations for Item" — 4-row editable grid (English (Canada), US English,
    Spanish (Mexico), French (Canada)) × Name + Description textboxes.
- **Segment caret (View)**: menu Item / Sub Class / Class / Sub Category / Category — opens the
  dialog scoped to that segment (first tab renames: "Item"/"Class"/"Sub Category"/"Sub Class"
  all verified open). **Category NEVER opens** — see Bugs bucket.
- **Add Product Code dialog** (`dlg-add-pc2.yml`): single tab "Item" (scoped by caret; Add caret →
  Category DOES open a "Category" tab — cross-check for the View defect). Ancestor chain read-only;
  new-item form: Name* [invalid at rest], Item Description* [invalid], Oracle Item Number,
  Product Type* combobox (10 options: EQUIPMENT, CONSUMABLE, FREIGHT, LABOR, EXPENSE, SERVICE
  CHARGE, DAMAGE WAIVER, EVENT TECHNOLOGY SUPPORT, FEE, CABLES AND CONSUMABLE) → Service Type*
  [disabled at rest]; **cascade proven live**: select LABOR → Service Type enables with a
  LABOR-FILTERED list (15+ options: Application Development, Operator Labor, Rigging Labor, Setup
  Charges, …). Product Organization popover; Save [disabled] + Close. NOTHING SAVED.
- **View Availability**: INERT — see Bugs bucket (OR-1-adjacent).
- **Product Group (toolbar)**: navigates to the product-groups page (probed pre-compaction).

### Dirty-guard sweep (§5 class 5 — Stay/Leave mandatory at QUICK)

Guard is **ABSENT module-wide** — 3 independent dirty-close probes, all discard silently with no
Stay/Leave prompt: (1) View PC dialog with modified Name → footer Close → dialog gone, edit
dropped; (2) Add PC dialog with Product Type=LABOR selected → Close → dropped; (3) PGR Add page
with Name="X" → Cancel → navigated back to list, no prompt. Class-5 disposition: guard-absent,
verified ×3. TCs assert actual behavior (close discards); guard absence flagged in Suggestions.

### Product Groups page (PGR)

- Resting: search textbox "Search Product Groups...", Active checkbox (checked), Reset, Search,
  Add button; grid EMPTY until Search (0 rows, no auto-search).
- "Audio" search → "82 product groups found", 20 rows/page (**PGR default page size = 20**, vs
  ISR 50). Columns: Name, Description, Service Type, Active (per machine run isr-pgr--search-executed).
- **Empty-criteria search returns "0 product groups found"** (stable ×3 polls over 30s, ×2
  separate searches) while ISR empty-criteria returns ALL 15,874 — divergent sibling semantics;
  see Bugs bucket.
- Add page (`/product-groups/add`, `pgr-add-page.yml`): left = sub-class item picker (Search box +
  huge scrollable list, ~7,400 snapshot lines); right form = Name* + Description* + Service Type*
  combobox + Active checkbox (checked default) + **Sub Classes* dual-list: "Drag or double-click
  items from the left to add sub-classes"** (drag-and-drop source-row archetype) + Cancel +
  Save [disabled]. Save validity-gated (stays disabled with only Name filled).

### API contracts (LR-056 anchors — endpoint-filtered, captured live)

| Call | Fires on | Notes |
|---|---|---|
| `POST /navigator/api/products/search` | every Search click AND every sort menu action | body: `{page, pageSize, sortBy:"MajorCategory", sortDescending, active, culture, useSubClass, useClass, quantityGreaterThanZero, locationNo:"1101"}` |
| `POST /navigator/api/location/navigator-legacy/getItemSearchAvailabilityAction` | immediately after each search response | body: `{LocOffID:"1101", PrepDate:"2026-08-31T00:00:00", ReturnDate:"2026-08-31T23:59:59", Items:[{ID, LocOffID}×50 page rows]}`; response fills per-row `Avail` + `QtyInSequence` → Available / In Sequence columns. **Dates ARE mechanically wired to search**; TC oracles stay field-level per OR-1. |
| `GET /navigator/api/core/product-orgs` | Product Org popover data | US/Canada/Mexico |
| `GET /navigator/api/products/get-product-hierarchy?productId=…&culture=en-US` | View PC dialog open | hierarchy chain |
| `POST /navigator/api/product/get-product-names-by-product-parent-id` | dialog combobox loads | per-segment names |

### Persistence (NM-1616 divergence — mechanism CHANGED, capability retained)

- Post-search URL carries **NO query parameters** (verified unfiltered + "Amp"-filtered):
  NM-1616's URL-param persistence does NOT exist on this build.
- Away-and-back (about:blank → return): "Amp" criteria AND 376-result set restored → persistence
  is CLIENT-STORAGE-based.
- **Sort persists across full reload**: Stage-3 blind re-drive found Video-first (descending)
  after fresh navigation — the prior sort survived; restored to ascending afterward.
- PGR search text persists likewise (cleared value stayed cleared).
- TC framing: assert criteria/results/sort survive leave-and-return; mechanism invisible to
  client English.

## Stage 3 — Blind re-drive (TDW-Q floor: min(3, live rows))

Fresh cold navigation (about:blank → products), then anchors re-read blind:
50 rows/page ✓ · 318 pages ✓ · defaults Qty>0=false + Active=true ✓ (D1 read #3) ·
15,874 total ✓ · first-row order explained by persisted sort (itself the persistence proof;
restored to default asc → blank-Category Labor row first, matching records) ·
PGR: fresh nav → empty box + 0 rows ✓; "Audio" → 82 found / 20-row page ✓ (consistent with
Stage 2; enriched: 82 total, 20/page).

## Stage 4 — Dispositions

- **covered-by-TC seeds**: every Search-panel field row above; sort flip; pagination move +
  rows-per-page; Grid Options toggle + Reset-to-Default; result fidelity (Any Field);
  barcode empty-state; Reset restore-defaults; OR-2 exclusivity; persistence trio
  (criteria/results/sort); dialog field-level rows (View/Add PC incl. cascade); PGR search +
  Add-page field rows; tooltip set (info icon, Hide search, Grid Options, truncation-cell,
  Search-help popover); empty-vol ("No results").
- **read-only-verified**: hierarchy display sections in dialogs; Product Code ID displays;
  History-tab grid render; pagination "/318" label; count labels.
- **affordance-probed (LR-057)**: View Availability (inert ×3 — bug-candidate, not a field);
  View→Category caret item (inert ×3); Save buttons at rest (disabled, enablement condition
  recorded); collapse-panel toggle.
- **deferred-to-DEEP (G1 — no classification claims)**:
  - `owned-cell click-to-edit mechanics` (88/88 first-page owned rows barcoded at 1101 in the
    Qty>0 view; no editable cell surfaced under single/double-click; LR-040-D rung-2 hunt for a
    non-barcoded editable row is DEEP work)
  - `In Sequence editor / sequence flows (NM-1804)` (needs qty/sequence data setup)
  - `View PC Save-enablement determination` (view-mode vs validity-gate — needs a row with a
    complete required chain)
  - `Translations tab save-cycle` (mutating; QUICK stays read/field-level)
  - `History tab in-dialog Grid Options + column sorts` (per-STATE chrome duplicate walk)
  - `PGR Add dual-list drag path` (drag mechanics; double-click path is the QUICK TC)
  - ~~`Product Org popover country-filter effect on results` (needs org-tagged data)~~ — **WITHDRAWN 2026-09-02**: the deferral was wrong. Org-tagged data exists on office 1101 and the effect is deterministic (UI 15,881 → 1 on a country, restored by Reset; API `productOrgIds` `[]`→15881, `[1|2|3]`→1, `[999]`→**0**, the nonsense-id zero proving the server honours the parameter). Now covered by TC-ISR-PRS-032. The 2026-08-31 pass skipped the LR-040-D rung-2 SELF-SERVE hunt that would have found the data.
  - `per-column menu sweep across all 13 columns` (Category+Owned probed; remaining 11 same
    archetype)
  - `page-number textbox direct entry` (next/first proven; textbox entry same family)
  - `region/location result-set reshaping` (OR-2 override proven; result-content assertions
    need region-tagged expectations)
- **out-of-scope families**: `out-of-scope:render-state=no link-cells or state-badge cells in
  this grid (all plain text/numeric cells; nothing navigates from cells)`.

## Opener frontier (§20-Q)

Multi-step states beyond one-click branches, walked agent-driven with snapshots (not machine
branches): row-selected toolbar (click row) → View PC dialog (+3 tabs ×5 segment scopes) /
Add PC dialog (×5 segment scopes) / View Availability (inert); per-column header menus
(2 of 13 columns probed, archetype identical); date popovers ×2; Product Org popover;
Search-help popover; PGR Add route. Unopened remainders are enumerated in the deferred-to-DEEP
list — none host in-scope QUICK fields beyond what is dispositioned.

## Owner-ruling cross-checks (all six verified live)

| Ruling | Live status |
|---|---|
| OR-1 dates field-level only | Honored; mechanics recorded (dates ride availability call) but excluded from oracles |
| OR-2 region overrides location | Verified bidirectionally (mutual exclusivity, last-set wins) |
| OR-3 any-word matching | Verified ("Amp" 376; 10/10 rows match; help text confirms field span) |
| OR-4 owner barcodes pending | Field-level + empty-state done; positive-filter TCs consume owner data when provided (non-blocking) |
| OR-5 grid options tested | Menu enumerated + toggle cycle + Reset item captured |
| OR-6 tooltip sweep | 5 tooltip classes verified (2 legit absences recorded) |

## Observations

### Bugs / Defects

1. **View Product Code → Category segment silently no-ops** — caret menu item "Category" closes
   the menu and NOTHING opens (3 attempts, 4s/8s/10s waits, console clean of errors). Positive
   controls: Item/Class/Sub Category/Sub Class ALL open the dialog in the same session, and the
   Add caret's Category item opens fine. LR-ENC-008 satisfied. Evidence: `caret-view-pc.yml`,
   `tmp-menu5.yml`, eval reads. → **FILED 2026-09-01 as `BUG-ISR-PCD-001`** (reports/bugs/).
   *Routing correction 2026-09-01: the original note said "file at GIVER/close" — §2 makes
   GIVER a READ-only consumer of bug files; filing landed under the spec-generation identity,
   and the note's `baseline-absent-env-blocked` is not a legal enum value — `baseline-absent`
   used, env-block detail kept in the bug's baselineEvidence.*
   **INVALIDATED 2026-09-01 (owner-triggered LR-044 re-verification)**: verdict FALSE /
   MISREAD. Live re-drive proved (a) the filed step order (dialog first, then caret) is
   physically impossible — the modal overlay covers the toolbar caret (elementFromPoint
   hit-test returns the overlay), and there is no caret inside the dialog; (b) via the only
   reachable path (row selected, no dialog, toolbar caret → Category) the Product Code
   Details dialog OPENS scoped to Category — twice, with each click checked for `### Error`
   output (0 errors, closing the CEO-M17 blind-instrument hole this walk's original probe
   did not check). The walk-time no-op is reclassified a stale-ref blind-instrument zero
   (CEO-M17 class). Bug status → `invalid`; TC-ISR-PCD-005 extended to include Category
   (spec run green 2026-09-01, 11 passed). Evidence:
   `.playwright-cli/isr-2026-09-01/pcd-toolbar-after-row-select.yml`,
   `pcd-caret-menu-reverify.yml`, `pcd-category-dialog-open-reverify.yml`.
2. **View Availability toolbar button fully inert** — enabled-looking button; clicked ×3 (5s/15s/
   12s waits) on a Labor item row AND an equipment row (Available=1, Owned=1): no dialog, no
   popover, no navigation, ZERO network activity. **OR-1-adjacent**: availability is date-driven
   and owner ruled "dates are not functional yet" — classified defect-candidate-under-OR-1
   (probable not-yet-functional surface shipping an enabled button). TC = button-enabled
   assertion only; behavior deferred until dates go functional.
3. **PGR empty-criteria search returns 0 groups** while ISR empty-criteria returns all 15,874 —
   divergent sibling semantics (stable ×3 polls ×2 searches; "Audio" positive control returns 82
   in-session). Discussion-item (possible required-term by design, but inconsistent + unhinted).
4. **Search projection drops Category for some rows** — Labor rows render blank Category cells
   (empty MajorCategory in search index) though the dialog hierarchy shows Category=Labor; blank
   rows float to top on ascending sort. Observation/discussion-item (data projection, not UI).
5. **Prep/Return date value render — checked, renders fitting** — the 22nd picked across all 12 months on both fields; every value renders fully inside its box (widest ~205 px in a 232 px box), spill 0. Verified live on office 1101 2026-09-03. The pair VALIDATION (Prep > Return → inline error +
   disabled Search) is separate and works — covered green by TC-ISR-PRS-020.

### Suggestions / Improvements

1. No unsaved-changes guard anywhere in the module (3 dirty-close probes discard silently) —
   consider a Stay/Leave prompt for dialog/page forms with edits (DSM precedent has guards).
2. Restore nav2 automated-browser access (TLS-fingerprint middlebox rejects Playwright
   Chromium/Edge ClientHello; curl/schannel gets 200) — baseline walks stay blocked until then.
3. View Availability button should be disabled (or hidden) while the feature is non-functional;
   an enabled inert control reads as broken.
4. PGR default page size (20) differs from ISR (50) — align or make deliberate.

## Staleness signal

Valid while the products MFE bundle hash `9277-4872ac36ca4fdf4e.js` (console-log chunk) and the
6 machine reports' completion_records stay current. Re-walk triggers: any change to search-panel
testids, column set (13), Grid Options item count (12), dialog tab set (3), or the two API
contract shapes above. LR-013: >30d = stale.

## Completion record

Stage 1 ✓ (6/6 machine runs exit 0) · Stage 2 ✓ (probe log above, 30+ dated snapshots) ·
Stage 3 ✓ (blind anchors consistent; sort-persistence bonus find) · Stage 4 ✓ (dispositions
enumerated; 10 deferred-to-DEEP rows, G1-clean). Nav2 baseline: environment-blocked, retry #6
15:14 UTC identical failure — recorded in `old-site-baseline/item-search-2026-08-31.md`.
HUNTER walk complete 2026-08-31T20:50+05:30.

## Post-closure machine-gate pass (2026-09-01, GIVER)

Closure gate Cx surfaced three artifact classes needing machine-grade upgrades; all resolved live:

1. **PCD dialog machine enumerations re-run** (both `dialog:view-product-code` 94 elements and
   `dialog:add-product-code` 82, completion_record.status=complete, 0 UNREACHABLE) after two tooling
   fixes: the branch-path portal scan (added 2026-09-01) and the portal-scan disabled-status fix —
   disabled portal elements previously minted `status: UNREACHABLE` (a semantics no other enumeration
   path uses; first ever triggered by these dialog walks), now they carry `disabled: true` like every
   other path. The 6 disabled-flagged view-state controls (Save, Select service type, Barcodeable
   checkbox, read-only input, first/previous pagination) are the machine evidence of the disabled-at-rest
   contracts TC-ISR-PCD-002/006/007 assert. Inventory manifest rebuilt: 94-row view-state table
   (machine order, keys verbatim, carets bound by DOM order) + add-state supplement (2 add-only keys).
   Case rows emitted for both JSONs (`emit-case-rows --merge`, Path A = Path B = 12841 view / add rows
   merged); `verifyDenominator` ok:true.

2. **th affordance probes — PRS 13 + PGR 4 (playwright-cli, session isr2, trusted clicks)**. Protocol:
   settle proven (13/4 th present, 0 skeletons), positive control FIRST (column-menu button click →
   menu open with Sort ascending/Sort descending[/Hide column] — `isr-2026-09-01/prs-positive-control-category-menu.yml`
   PRS, `isr-2026-09-01/pgr-positive-control-name-menu.yml` PGR), then per-column trusted click on the columnheader
   itself with an immediate eval oracle. **Finding: 17/17 th clicks OPEN the column menu** (menu:true,
   aria-sort untouched, no navigation) — the th delegates to its embedded menu trigger. The prior
   "static header cell" classification in both inventories was WRONG and is corrected to
   `affordance-probed: affordance: popover → column sort/hide menu` with per-page post-click snapshot
   evidence (PRS `isr-2026-09-01/prs-th-click-menu-open.yml`, PGR `isr-2026-09-01/pgr-th-click-menu-open.yml`).
   Probe-hygiene note: the first 4 clicks of the run silently no-oped on stale snapshot refs ("Ref not
   found") and read menu:false — caught by checking the click output for errors before trusting the
   oracle (blind-instrument zero); re-run with a fresh snapshot per click.

3. **Out-of-scope citation upgrades** (no behavior change): PRS/PGR app-shell sidebar rows →
   `outside-module` (cross-registry evidenced), PRS 7 structural wrappers → `not-interactive` prefix,
   PCD host-page rows → `outside-module` → product-search inventory. Module-own OOS after upgrades:
   PRS 7/69 ≈ 10%, PGR 0, PCD 0 — all under the 15% cap, no exemption needed.

Auth note: the shared CLI state expired mid-pass; refreshed via the suite's own
`npx playwright test --project=setup` (unattended, no MFA) and `state-load` of
`clients/encore/.auth/encore-state.json` (client path, per the state-file gotcha), then `goto` on the
existing tab (a fresh `open` recreates the context and drops the loaded state).
