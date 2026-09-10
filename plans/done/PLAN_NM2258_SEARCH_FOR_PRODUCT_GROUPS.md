# PLAN_NM2258_SEARCH_FOR_PRODUCT_GROUPS — the Product Groups list page (NM-2258): packaged as its own deliverable, re-walked to depth and covered

**Status**: DONE
**Priority**: P1
**Created**: 2026-09-08 (as one plan for both Product Groups sub-tasks; a plan of its own since 2026-09-10)
**Executed**: 2026-09-08 (Phases 1–5) · 2026-09-09 (Phases 6 and 8) · 2026-09-10 (Phase 9, the owner ruling, the sort-order fix, Phase 10)
**Identity**: OWNER (spec + data + page-object + selector work under BUILDER; the re-walk under GIVER; registries, manifest and plan under OWNER)
**Parent**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md
**Sibling**: PLAN_NM2259_CREATE_NEW_PRODUCT_GROUPS.md — the Add Product Group page, the other half of the Product Groups coverage; pushed on its own branch after this one
**Depends on**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md, SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md
**Blocks**: none
**Model**: claude-opus-5
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**CoverageMode**: quick
**BrowserTool**: cli
**Jira**: [NM-2258 — Automate → Product → Search For Product Groups](https://encore.atlassian.net/browse/NM-2258) (sub-task of NM-2253; assignee vikas yadav)

---

## Context

NM-2253 ("Automate Item Search") is a parent Story with seven sub-tasks. Coverage was originally
built **by module** (PRS / PCD / PGR), so the Product Groups cases sat in one file mixing two
sub-tasks: the group **list/search** page (NM-2258 — this plan) and the **Add Product Group** page
(NM-2259 — the sibling plan). NM-2254, NM-3650 and NM-2257 were already separated the same way —
one workbook per sub-task — and pushed.

The automation was already complete and green before the split started: 11 cases, a page object, a
selector set, a field inventory and two walk-evidence sessions (2026-08-31 structural, 2026-09-02 real
create — product group id 4581). What was missing was the packaging: per-sub-task workbooks,
per-sub-task specs, and folders a reviewer can tell apart across seven delivery branches. That
packaging (Phases 1–6) was done once for both sub-tasks and is recorded in both plans, each from its
own side. The list page's own coverage work — the 2026-09-09 deep re-walk and its 32 new cases
(Phase 8), the renumbering (Phase 9), the 2026-09-10 owner ruling and the sort-order fix — is
recorded only here.

**Why this is a plan of its own (2026-09-10, owner-directed — Phase 10).** The two sub-tasks were
planned and executed as one plan. The owner's delivery process pushes each ticket on its own branch,
one after the other, so a branch must carry only its own ticket's record. The combined plan was
divided into this one and the sibling; nothing was dropped, only assigned to the ticket it belongs to.

### The naming convention this plan lands

Owner instruction (2026-09-08, restating the rule first given during NM-2257): folders under
`tests/`, `testcases/` and `src/` are named for **the sub-task's own feature**, never for the
parent NM-2253 ticket ("Item Search"). With seven branches otherwise showing an identical
`tests/item-search/` tree, the parent name is what makes them indistinguishable at review time.

Folder names come from the Jira sub-task titles verbatim, kebab-cased:

| Sub-task | Jira title | Folder |
|---|---|---|
| NM-2258 | Search For Product Groups | `search-for-product-groups` |
| NM-2259 | Create new Product Groups | `create-new-product-groups` |

Workbook filenames keep the `item-search-` prefix, so the parent module is still readable from the
file names — the same shape NM-2257 shipped with. The case ids first stayed in one shared
`TC-ISR-PGR-*` sequence; Phase 9 (2026-09-10) gave each sub-task its own contiguous sequence,
`TC-ISR-PGR-001…039` for the list page and `TC-ISR-APG-001…023` for the Add page.

### Where the NM-2258 / NM-2259 boundary comes from

The two sub-tasks carry different Jira titles but the boundary is taken from the application, not
from judgement: the group list page has an **Add** button that routes to a separate page
(`/products/product-groups/add` — a route, not a dialog). Everything on the list page is NM-2258;
everything behind the Add button is NM-2259.

| | NM-2258 — Search For Product Groups (this plan) | NM-2259 — Create new Product Groups (sibling) |
|---|---|---|
| Surface | Group list page: search box, Active filter, Reset/Search, 4-column grid, pagination | Add Product Group page: Name, Description, Service Type, Active, sub-class picker, Cancel/Save |
| Cases at the split | TC-ISR-PGR-001 to 007 (7; numbered 001–005, 009, 010 until Phase 9) | TC-ISR-APG-001 to 004 (4; numbered TC-ISR-PGR-006–008, 011 until Phase 9) |
| Cases now | 39 (Phase 8 added 32) | 23 (the sibling's Phase 7 added 19) |
| Save | none — every case reads or resets | TC-ISR-APG-004 creates a real group and proves it by searching it back |

7 + 4 = 11, verified by command against the pre-split file — no overlap and no orphan.

TC-ISR-PGR-007 (Reset) sits on the search side even though it was authored in the same describe
block as the Add-page field cases: Reset is a control on the list page's search panel, and the
boundary is the surface, not the block it happened to be written in.

---

### Execution Summary

Phases 1–6 are the packaging, done once for both sub-tasks on 2026-09-08 and 2026-09-09: no new
coverage, the 11 existing cases repartitioned into two sub-task deliverables, their source moved into
feature-named folders, and the whole Item Search family re-run to prove nothing already delivered
regressed. Phase 8 onwards is the list page's own work.

**Phase 1 — Registries.**

| File | Change |
|---|---|
| `export_test_cases/module-codes.json` | `ISR.PGR` gains `display: "Search For Product Groups"` + `dir: "search-for-product-groups"`; a new `ISR.APG` entry for the Add page (`display: "Create new Product Groups"`, sheet `item_search_add_product_group`, `dir: "create-new-product-groups"`, first with `idModule: ISR` / `idSubmodule: PGR` so the ids stayed in the PGR sequence — the same indirection `ISR.PRF` and `ISR.APC` use; **reversed in Phase 9**, the Add page now carries `TC-ISR-APG-*`) |
| `export_test_cases/types.ts` | `APG` added to `KNOWN_SUB_CODES` (the registry-to-types drift gate fails otherwise) |
| `export_test_cases/to-xlsx.ts` | Sheet display names for both halves; split-file map repointed to the two new folders |
| `scripts/deliverable/delivery-manifest.encore.json` | `ISR.PGR` entry updated (new spec path, new workbook path, 7 tc_ids then, 39 since Phase 9, 3 src paths); a new `ISR.APG` entry for the sibling. **Both `withheld`** — neither has an approval row, and the owner has not asked for the push |

Sheet name `item_search_add_product_group` is 29 characters, inside Excel's 31-char cap — no
shortening note needed.

**Phase 2 — Source moves (feature-named folders).** The page object moved to
`clients/encore/src/pages/product-groups/product-groups.page.ts` (one page object serves the list
page and the Add page), the selectors to
`clients/encore/src/selectors/product-groups/product-groups.ts`, and the five PGR constants out of
the shared Item Search data module into a new
`clients/encore/src/data/product-groups/product-groups.ts` (`PGR_ROUTE`, `PGR_SEARCH_WORD`,
`PGR_COLUMNS`, `PGR_DEFAULT_PAGE_SIZE`, `PGR_ADD_GROUP` — renamed off the `ISR_` prefix now that
they live in their own module).

`clients/encore/tests/item-search/product-search.spec.ts` — already delivered as ISR.PRS — imports
`ProductGroupsPage` for its leave-and-return cases; its import line was repointed. That is the
only delivered file the packaging touched, and the full-family runs below prove it still passes.

**Phase 3 — Spec split.** The single 11-case spec became
`clients/encore/tests/search-for-product-groups/search-for-product-groups.spec.ts` (7 cases, two
describes — the surface-behavior block plus a search-panel field block holding the Reset case, TC-005
then and TC-ISR-PGR-007 since Phase 9) and
`clients/encore/tests/create-new-product-groups/create-new-product-groups.spec.ts` (4 cases, one
describe — the sibling's). Case bodies moved verbatim apart from the constant renames. Both keep the
300s describe timeout, the per-test `ensureCleanSearch` baseline in `beforeEach`, and the
`dependencyGate([])` first line in every case.

Two gate registries carried the old spec path and were repointed:
`scripts/check-per-test-baseline.mjs` (the create describe is the save-capable one) and
`scripts/check-save-route-parity.mjs`.

**Phase 4 — Markdown + workbooks.** Test cases and test plans split along the same boundary, each
half carrying its own field inventory table, validation rules, verification log and a sibling-file
pointer. The list page's are
`clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_groups_test_cases.md`
and
`clients/encore/specs_planning/test-plans/setup/item-search/item_search_product_groups_test_plan.md`.
Workbooks rebuilt via `npm run xlsx:build` into
`clients/encore/testcases/search-for-product-groups/` (7 rows then, 39 now) and
`clients/encore/testcases/create-new-product-groups/` (the sibling's); the superseded combined
workbook under `clients/encore/testcases/item-search/` was removed.

**Phase 5 — Field inventory split.** This was authored the other way first: the walk artifact was
annotated with a `Subtask_Ownership:` line and deliberately NOT split, on the reasoning that its
machine denominators are per-state rather than per-ticket. The pre-commit gate (SP-AAE-01) rejected
the commit — every test-case markdown module needs its own paired dated field inventory — and it was
right: the `dialog:add-group` state IS the NM-2259 surface, so the partition the enumerator already
made is the ticket partition. `item-search-add-product-group-2026-08-31.md` was split out the same
way `item-search-add-product-code-2026-09-03.md` was for NM-2257.

No new walk was run and no disposition changed. The Add-page field table, labels, save-cycle
observations, LR-029 rows and the two picker deferrals moved to the new artifact and were REMOVED
from the list-page base rather than copied, so a later correction cannot land in one copy and rot in
the other. Both artifacts keep `Coverage_Ratio` 100% and `CrossCheck: clean`.

**Phase 6 — the source tree renamed off the parent story name (added 2026-09-09, owner-directed).**

Phases 1–5 shipped with the deviation recorded below (the shared grid base left under
`src/pages/item-search/`) and flagged to the owner as "the one remaining Item Search path." **That
flag under-counted the problem by a factor of six, and the correction is recorded here rather than
quietly fixed.** The NM-2258 spec legitimately drives the Products page and the Product Code page —
that is how a user reaches Product Groups in the application, and it is what TC-ISR-PGR-001 and
TC-ISR-PGR-005 exercise — so the branch depended on six files across three `item-search`-named
folders, not one:

| Path | Why the branch needs it |
|---|---|
| `src/pages/item-search/item-search-grid.page.ts` | abstract grid base both page objects extend |
| `src/pages/item-search/item-search.page.ts` | Products page — search persistence case |
| `src/pages/item-search/product-code.page.ts` | in-app entry to Product Groups |
| `src/selectors/item-search/products.ts` | reached through the Products page |
| `src/selectors/item-search/product-code.ts` | reached through the Product Code page |
| `src/data/item-search/item-search.ts` | the office constant and the Products search word |

A second finding forced the shape of the fix: a folder cannot be named for one sub-task when two
sub-tasks share the file. The Products page object serves NM-2254 and NM-3650; the Product Code page
object serves ISR.PCD and NM-2257. Naming either folder for a single ticket would make another
ticket's branch depend on a folder named for a ticket it is not. The achievable rule — and the one
the structural-names gate already states — is that a folder carries the **feature** name.

The owner chose the full rename to the application's own name for the area (the page is titled
Products and lives at `/locations/{office}/products`), which drops the parent story name entirely:

| Before | After |
|---|---|
| `src/pages/item-search/` | `src/pages/products/` |
| `item-search-grid.page.ts` (`ItemSearchGridBasePage`) | `products-grid.page.ts` (`ProductsGridBasePage`) |
| `item-search.page.ts` (`ItemSearchPage`) | `products.page.ts` (`ProductsPage`) |
| `src/selectors/item-search/` | `src/selectors/products/` |
| `src/data/item-search/item-search.ts` | `src/data/products/products.ts` |

Renames plus import and identifier rewrites only — 52 insertions against 52 deletions, no logic
touched. Three doc comments that named the parent story were rewritten in plain English. Six path
entries in the delivery manifest were repointed (ISR.PRS, ISR.PCD, ISR.APC); no `evidence` or status
field was altered. Constant prefixes (`ISR_*`) and the selector export names were deliberately left
alone: they are file content, not structural names, and the naming gate scopes to basenames.

**Why the blast radius is smaller than it looks.** `scripts/ship-branch.sh:251` records that
source-level dead-code elimination was disabled on 2026-07-20 with the owner decision to ship the
source tree whole. Every delivery branch therefore carries the entire `src/` tree regardless of which
modules it declares — so this rename removes the parent story name from every future branch, not just
this one, and no branch was ever pruned to the manifest path lists in the first place.

**Still carrying the parent story name and deliberately out of this phase's scope**:
`clients/encore/tests/item-search/` and `clients/encore/testcases/item-search/`, which hold the
Product Search, Product Search Filters and Product Code deliverables. Surfaced to the owner as an
open item; renaming them was not authorised here and was not assumed.

**Phase 7 — the Add Product Group page re-walked and covered to depth (2026-09-09).** The Add page
belongs to NM-2259 and its re-walk is recorded in the sibling plan. It touched the list-page
deliverable only through the shared page object (three page-object fixes, all of them in the Add-page
methods) and through the family runs below.

**Phase 8 — the Product Groups list page re-walked to depth and covered (added 2026-09-09, owner-directed).**

The owner asked for the same treatment the Add page had just had ("fix the inventory first, re-walk
the page, then add the missing test cases. automate them test them"). The 2026-08-31 artifact was a
QUICK (L1) pass — seven cases over the search box, the Active filter, the rows-per-page default and the
first pager click — with its DEEP seed list (column sorting, inactive rendering, the grid's layout
controls) parked in SUBPLAN_PRODUCTS_DQU.md. The page was re-walked in full on 2026-09-09 under GIVER,
Jira first (NM-972, NM-1617, NM-1618, NM-1620, NM-1622, NM-1633, NM-1756, NM-1852, NM-1909, NM-1910,
NM-1924, NM-1939, NM-2064, NM-1707, NM-1644, NM-1863 — no Confluence spec), the enumerator re-run for
the resting and search-executed states (27 keys after archetype collapse,
`reports/walk-coverage/1101-item-search-product-groups.json`, CrossCheck clean), with on-disk evidence
in `.playwright-cli/pgr-2026-09-09/` (search-semantics matrix, pager, sorting, Grid Options, drag
reorder, resize, panel collapse, Edit landing, the debounce timing matrix). The artifact
`clients/encore/specs_planning/_internal/field-inventories/item-search-product-groups-2026-09-09.md`
replaces the 08-31 one as the live source (`Provenance: RE-WALK`, `Walk_Mode: deep`, 27/27). The
enumerator needed one config change (owner-only `scripts/`): the list module's `Add` opener was a
route to the Add page, not a dialog — following it duplicated the list keys and, once the Add page
carried its 7,394-row catalog, hung the derive-type pass — so the opener was dropped and the Add page
keeps its own entry (`scripts/walk-coverage/lib/module-config.mjs`, `enumerate-page.mjs`).

Thirty-two cases were added under BUILDER — TC-ISR-PGR-008 … 039 (numbered 031 … 062 at the time) —
beside the seven delivered, so the NM-2258 deliverable now carries 39 (workbook sheet
`item_search_product_groups`, 39 rows; per-ticket workbook
`clients/encore/testcases/search-for-product-groups/item-search-search-for-product-groups.xlsx`).

| Area | Cases |
|---|---|
| Search contract | 008 (Enter runs the search, same rows as the button — NM-1617), 009 (Description is searched — NM-972), 010 (case and surrounding spaces ignored; spaces-only counts as empty), 011 (in-order phrase match; reversed words and a name-plus-description phrase find nothing — NM-1622 / NM-1633), 012 (`&'`, `<b>` and `%` searched literally — NM-1620 / NM-1756), 013 (no match → zero, "No results", pager disabled; a 200-character term accepted), 014 (single match → count 1, one row), 015 (markup in names renders as text) |
| Status filter, rows, return paths | 017 (Active cleared lists inactive groups only), 018 (filter and results survive a reload), 019 (row click opens the Edit page: heading, form values, Not Priced badge, Save disabled, Cancel enabled, crumbs, translations control — NM-972 / NM-1644), 020 (browser Back and the Product Groups crumb restore the results and page 2 — NM-1924), 021 (the × clears the box, keeps the results; a reload restores the executed term), 022 (loader and placeholder rows show during a search — NM-1939), 023 (the Products crumb leaves, Back returns) |
| Pagination | 024 (last/first jumps, page-of-total label, pager states), 025 (page box jumps; out-of-range snaps back; letters refused), 026 (10 … 50 rows per page reshape the pages), 027 (rows-per-page and page survive leaving through a crumb and a fresh navigation — NM-1910), 028 (Reset from page 2 → page 1 of 1 — NM-1909) |
| Sorting | 029 (Name ascending by default, arrow drawn, stored sortBy/asc — NM-1618), 030 (Name menu sorts descending and back), 031 (Description and Service Type sort; one marker at a time), 032 (a sort from page 2 returns to page 1 — NM-2064), 033 (the sort survives a new search, a Reset and a reload; only Reset to Default View clears it), 034 (every header opens its menu, Escape closes; Status has no sort) |
| Grid layout | 035 (Grid Options hides/shows columns, remembered across a reload; Hide column in the column menu writes the same preference — NM-1852), 036 (Reset to Default View restores columns, sort, page and the stored preferences), 037 (drag-reorder by full pointer sequence persists), 038 (drag-resize stores the whole delta; the rendered width grows), 039 (panel collapse widens the grid, not remembered) |
| Typing debounce | 016 (a submit inside the typing delay runs the previous term — a deliberately failing case until the 2026-09-10 ruling, a passing pin of the accepted behaviour since; both paragraphs below) |

**Spot-check before the specs (Phase 0.5a).** Active filter, search box and rows-per-page agreed with
the fresh artifact (3/3, plus the pager, page box, headers, Grid Options, column menu, sort, reset,
stored state and Edit landing as extras — `reports/walkthrough/isr-pgr-2026-09-09.walkthrough.yaml`,
written by OWNER at close-out, the §2 gap recorded in the deviations). One drift: the Name header
draws the ascending arrow at rest and after a search; the inventory had said "no arrow until a sort".
TC-029 and the two inventory rows were corrected before the specs were written.

**What the walk surfaced — three bugs filed (all `baseline-absent`: the old site has no Product Groups
page), one reading withdrawn.** BUG-ISR-PGR-001 (medium): a search submitted within about 250 ms of
the last keystroke runs the previously committed term — the empty term on a first visit (0 found with
the word still in the box), the old word after an executed search; 10 of 10 fresh contexts, Enter and
button alike, a 250 ms pause always avoids it. BUG-ISR-PGR-002 (low): a column-edge drag stores the
whole distance (400 → 550 for +150 px) but renders about 6 % of it because the table is pinned to its
container width; the Products grid follows the pointer with the same control. BUG-ISR-PGR-003 (low): a
single match reads "1 product groups found". Withdrawn: "the Status column's sort items are inert" —
the click's error had been suppressed and the unchanged grid misread (agent-mistakes CEO-M29); the menu
re-mounts once about a second after opening and an immediate click lands on a detached item; waiting
for the menu to stay mounted made every item work, and the page object carries that wait. Jira was
read-only this session, so the three bugs were filed in `clients/encore/reports/bugs/` and not raised
as NM tickets.

The list page's Jira pass also corrected an Add-page case note (NM-1851 states the description
uniqueness rule TC-ISR-APG-012 had called unstated) — recorded in the sibling plan.

**Withdrawn 2026-09-10 by owner ruling — all three list-page bugs.** Vikas ruled in chat that none of
the three is a defect: the debounce-window submit, the damped column resize and the plural count label
are accepted behaviour of the page. The three records in `clients/encore/reports/bugs/` now carry
`status: withdrawn` with a `WITHDRAWN-ACCEPTED-BEHAVIOR` entry each; the measured facts stand, only the
classification changed. TC-ISR-PGR-016 was flipped the same day from a deliberately failing statement
of intent into a passing pin of both halves of the accepted contract (an immediate submit runs the
previously committed term; a submit after the pause runs the typed word); TC-ISR-PGR-038 and
TC-ISR-PGR-014 already asserted the accepted behaviour and are unchanged. The same ruling closed the
sibling's only open item (the post-save landing contradiction, recorded there as a Jira
contradiction), so both sub-tasks carry zero open bugs.

**Sort-order oracle corrected 2026-09-10.** The first full list run after the flip failed
TC-ISR-PGR-031 on both attempts: Description sorted descending read walk, Toast, special, Probe,
Automated — the grid sorts ignoring letter case, while the spec's helper compared by character code,
which puts every lowercase initial after every uppercase one. The helper held only while every family
description started with the same case; the two probe groups the sibling's live checks created that
morning (`ZZ E2E Probe …`, `ZZ E2E Toast …`) were the first mixed-case descriptions in the family.
Verified live with a read-only probe (`.playwright-cli/pgr-2026-09-10/pgr-desc-sort-probe.json`:
code-point descending false, case-insensitive descending and ascending true; screenshot beside it),
the helper now compares with case ignored (`isNonDescendingIgnoringCase`), and the case file's three
"by character code" claims plus the inventory's NM-1618 row read "letter case ignored". The probe
groups stay: they are ordinary family data and the reason the wrong oracle surfaced.

**TC-ISR-PGR-016 ran and failed on purpose until the 2026-09-10 ruling above.** The case could not be
skipped: the skip gate demands a bug id on the skip line and the shipped-source jargon gate bans that
id in a spec — both denials are on the record; no override was requested and no loophole used. The
case stated the intended behaviour (the typed term runs at once) and failed with four precise diffs
(the first-visit submit ran '' not 'ZZ E2E'; 0 found; the immediate re-submit ran 'ZZ E2E' not
'Audio'; first row unchanged) — the owner's standing direction for a filed defect. A signal probe
(`.playwright-cli/pgr-2026-09-09/probes-debounce-signals.json`) settled the mechanics first: the
first-visit fast submit starts no search at all (it records the empty term), while the fast edit
re-runs the old word with a full loader cycle — the page object's completion wait was built on that.
The gate deadlock, and the tracing-teardown error that follows every failing case ("Must start tracing
before stopping", pre-existing), were routed to task chips.

**The family runs.** The full Products / Product Groups family (item-search +
create-new-product-groups + search-for-product-groups, 101 cases) ran after the specs landed: 100
passed, TC-016 failed by design, and one Add-page case flaked on a toast read (its fix is the
sibling's). The second family run (2026-09-10) then surfaced one more test-side failure, this time in
the list spec: TC-ISR-PGR-013 types a 200-character term by keystrokes at 40 ms per key, so the typing
alone takes 8 s, and with the run about a quarter slower than the day before the action overran the
suite's standard 10 s budget on both attempts (`locator.pressSequentially: Timeout 10000ms exceeded`,
the box still empty in the call log — the app was never reached). The shared grid base's typing helper
now gives the action its own per-key delay on top of the standard budget
(`ACTION_BUDGET_MS + length × TYPING_DELAY_MS`), a figure derived from the two numbers the helper
already owned rather than a tuned one; short values keep the same 10 s they always had. Verified by the
case alone and by the whole list spec (rows below).

**Phase 9 — one contiguous case sequence per sub-task (added 2026-09-10, owner-directed).** The
owner asked that each ticket's test-case file number its cases 1 to N with no gaps ("like
1,2,3,4,5,6"). Until now both files drew on one shared `TC-ISR-PGR-*` sequence, so the list file
read 001–005, 009–010, 031–062 and the Add file 006–008, 011–030. Every case was renumbered in
place — none added, dropped or re-worded — and the Add page took its own id code, `TC-ISR-APG-*`
(the registry's `ISR.APG` sub-code, which the Phase 1 `idSubmodule: PGR` indirection had kept out
of the ids; that indirection is removed, so the workbook lint now checks the Add sheet's ids
against `ISR/APG`). Numbering follows the spec's describe order, so the spec, the case file and the
workbook read the same way top to bottom; the list case file's blocks were reordered to match.
Nothing about what a case does changed, so the Phase 8 run results stand — the rows below and the
HTML reports of those runs carry the ids in force when they ran.

Old → new, list page (NM-2258): 001–004 → 001–004 · 009 → 005 · 010 → 006 · 005 → 007 ·
031–037 → 008–014 · 060 → 015 · 062 → 016 · 038–041 → 017–020 · 058 → 021 · 059 → 022 ·
061 → 023 · 042–045 → 024–027 · 054 → 028 · 046–051 → 029–034 · 052 → 035 · 053 → 036 ·
055 → 037 · 056 → 038 · 057 → 039. The Add page's map is in the sibling plan.

Carried along in the same pass: both specs, both case files and test plans, the four Product
Groups inventories (2026-08-31 and 2026-09-09) plus the product-search inventory and the Item
Search catalog that cite list-page ids, `BUG-ISR-PGR-001/002/003` (`affectedTests`), the
manifest's two `tc_ids` lists (39 + 23), `module-codes.json`, this plan's case references, two other
plans that cite these ids, the walkthrough log, and the rebuilt workbooks. Run logs under
`.playwright-cli/` and activity-log rows keep the ids they were written with — they are the record of
what ran.

**Phase 10 — one plan per ticket (added 2026-09-10, owner-directed).** The owner asked for a separate
plan for each ticket, because the two tickets are pushed on different branches one after the other and
each branch must carry only its own record. The combined plan (`PLAN_NM2258_NM2259_PRODUCT_GROUPS`,
created 2026-09-08 and committed with the packaging) was divided into this plan and
PLAN_NM2259_CREATE_NEW_PRODUCT_GROUPS.md and removed from the tree; its history stays in git. Every
phase, run result, deviation and open item was kept and assigned to the ticket it belongs to; the
packaging phases (1–6) appear in both plans because both branches carry that work. Two smaller
tidy-ups rode along: the list page's sort probe moved out of the Add page's dated evidence folder into
`.playwright-cli/pgr-2026-09-10/`, so each ticket's evidence sits under its own prefix (`pgr-` for
the list page, `apg-` for the Add page), and `plans/INDEX.md` was regenerated. Activity-log rows
written before the split name the combined plan; they are the record of what was done under it and
are unchanged.

What both branches will share — the files the packaging and the shared page object put on both sides
of the boundary, so the branch cut has to carry them twice rather than split them:

| Shared file | Why both branches need it |
|---|---|
| `clients/encore/src/pages/product-groups/product-groups.page.ts` | one page object serves the list page and the Add page; TC-ISR-APG-004 proves its save through the list page's search-back |
| `clients/encore/src/selectors/product-groups/product-groups.ts`, `clients/encore/src/data/product-groups/product-groups.ts` | selectors and constants for both pages |
| `clients/encore/src/pages/products/products-grid.page.ts` and the rest of the Phase 6 rename | the grid base both page objects extend; the in-app route to Product Groups |
| `export_test_cases/module-codes.json`, `export_test_cases/types.ts`, `export_test_cases/to-xlsx.ts` | one registry edit created both sub-codes |
| `scripts/deliverable/delivery-manifest.encore.json` | both entries live in one manifest |
| `clients/encore/testcases/encore_test_cases.xlsx` | the master workbook carries both sheets |
| `clients/encore/specs_planning/_internal/agent-activity-log.md` | one log; rows for both tickets |
| `scripts/check-per-test-baseline.mjs`, `scripts/check-save-route-parity.mjs` | gate registries repointed in Phase 3 |

**Phase 11 — shipped to the client repo (2026-09-10, owner-directed).** The owner asked for the
commit and the NM-2258 push first, on a new branch, and confirmed sprint 18 when asked, so the
branch is `feature/sprint18-vikas-NM-2258`. Approval-log row 61 records the decision and the
manifest's `ISR.PGR` entry moved to approved-next (commit b8d27451, every approval pin re-hashed to
the log's new blob with the validator's defect classes unchanged). The ship script's dry run then
failed its scope gate twice, both times correctly: the list spec's header comment named the
sibling's `tests/` folder, which the gate reads as a reference to a surface not on the branch
(fixed in the comment under BUILDER, commit dc7a90e3); and the NM-2259 workbook rode into the
payload, because the script's workbook resolver matches only module-level folders, so every
feature-named workbook folder is "unresolvable" and kept fail-open, the same class as the
documented corporate-override and discount-matrix stragglers. The payload was corrected by the
documented method rather than by editing the script: in the kept scratch the six foreign workbooks
were removed, the deliverable commit amended, a fresh archive extracted, and all three ship gates
re-run green (deny-list on 147 files, approved scope, structural names) before pushing from the
scratch with the script's own first-push command. Verified on the remote by fetching the URL: tip
`c31899aa`, 147 files, one spec with TC-ISR-PGR-001 … 039 (39 unique ids), the per-ticket workbook
plus the master trimmed to Overview + `item_search_product_groups` and the standing QA tracker, no
internal material, the shipped `.env.local` a blank template. The branch is new, so there is no
earlier TC set to regress against. The team repo is not pushed. The Add page follows on its own
branch; its workbook will need the same removal until the resolver learns the sub-task folders.

---

## Verification

| Check | Result |
|---|---|
| Root `tsc --noEmit` | exit 0 |
| Client `tsc --noEmit` | exit 0 |
| `npm run check:tc-parity` | PASS — all spec TCs present in both markdown and XLSX |
| `npm run check:per-test-baseline` | PASS — 23 entries (20 enforced, 3 pre-existing waivers) |
| `node scripts/check-save-route-parity.mjs` | PASS — 4 registered save routes |
| `npm run check:step-labels` | PASS — 32 page files, 42 spec files, 0 violations |
| `npm run check:structural-names` | PASS — no ticket-ID names on shippable paths |
| `npm run xlsx:lint` | PASS — 5133 rows, 0 vocab hits, 0 integrity violations |
| `npm run check:coverage-manifest` | 42/42 fixtures pass |
| `npm run check:untracked-knowledge` | CLEAN |
| `npm run xlsx:build` | green — `item_search_product_groups` 7 rows, `item_search_add_product_group` 4 rows |
| NM-2258 spec solo after the split | **8 passed** (7 cases + auth setup), 0 failed |
| Full Item Search family (item-search + add-product-code + both new folders) | **59 passed, 0 failed** (9.3m) |
| Full Item Search family after the Phase 6 rename (2026-09-09, before the re-walks) | **59 passed, 0 failed** (11.9m) |
| Full Item Search family after the sibling's Phase 7 fixes | **77 passed, 0 failed, 0 retries** (14.9m) — 59 → 77 because the Add-page spec grew from 4 cases to 22 |
| Close-out battery, 2026-09-09 | root + client `tsc` exit 0 · `check:tc-parity` PASS · `check:per-test-baseline` PASS (23 registered) · save-route parity PASS (4 routes) · `check:step-labels` PASS · `check:structural-names` PASS · `check:spec-quality` exit 0 (announce-mode receipt for TC-SVC-HIS-012, pre-existing) · `xlsx:build` green · `xlsx:lint` PASS · `check:coverage-manifest` 42/42 |
| NM-2258 spec after the Phase 8 re-walk — first run (38 cases) | **39 passed** (38 cases + auth setup), 0 failed, 0 retries (5.6m); no case over 30 s |
| NM-2258 spec with TC-ISR-PGR-016 (39 cases) | 39 passed, **1 failed by design** (6.0m) — TC-ISR-PGR-016 (TC-062 at the time of the run) was the evidence case for BUG-ISR-PGR-001; both attempts show the same four diffs |
| Phase 9 — `npm run check:tc-parity` after the renumber | PASS — all spec TCs present in both markdown and XLSX |
| Phase 9 — `npm run xlsx:lint` | PASS — 5302 rows, 0 vocab hits, 0 integrity violations |
| Phase 9 — rebuilt workbook read back | list workbook: 39 unique ids, TC-ISR-PGR-001 … 039 in order; the master workbook's sheet matches |
| Phase 9 — root + client `tsc --noEmit` | exit 0 / exit 0 |
| Phase 9 — `npx playwright test --list` on the list spec (under BUILDER; the labor gate refuses the listing to OWNER) | 39 `TC-ISR-PGR-*` titles resolve, listed 001 … 039 in order |
| Phase 9 — `check:spec-quality`, `check:step-labels`, `check:structural-names`, `check:per-test-baseline`, save-route parity, per-row-await, `verify-no-forbidden --staged-diff` | PASS — the same pre-existing notes as before (TC-SVC-HIS-012 receipt in announce mode; two INFO loops in local-office-settings); no marker hits in the staged diff |
| Family run 2 (2026-09-10; 102 tests: the three Item Search specs + both Product Groups specs) | **100 passed, 2 failed, 0 flaky** (17.3m) — TC-ISR-PGR-016 by design; TC-ISR-PGR-013 failed on both attempts on the typing budget (next rows); the sibling's toast-read fix held |
| Typing-budget fix — TC-ISR-PGR-013 alone | 2 passed (the case + auth setup), 0 retries (1.1m) |
| Typing-budget fix — list spec solo (39 cases) | 39 passed, **1 failed by design** (TC-ISR-PGR-016), 0 retries elsewhere (6.3m) |
| Typing-budget fix — client `tsc --noEmit`, `check:step-labels`, save-honesty, `check:spec-quality`, spec-sleeps, `verify-no-forbidden --staged-diff` | exit 0 / PASS / PASS / the pre-existing TC-SVC-HIS-012 receipt note only / 0 fixed sleeps in specs / no marker hits |
| Owner ruling 2026-09-10 — flipped TC-ISR-PGR-016 alone, twice | 2 passed each (the case + auth setup), 0 retries (57.6 s / 55.3 s) |
| Owner ruling 2026-09-10 — list spec solo after the flip (39 cases) | 39 passed, **1 failed** — TC-ISR-PGR-031 on both attempts (5.9m): the Description sort is case-insensitive, the helper compared by character code; surfaced by the two mixed-case probe groups |
| Sort-order oracle fix — TC-ISR-PGR-031 alone | 2 passed (the case + auth setup), 0 retries (60.0 s) |
| Sort-order oracle fix — list spec solo (39 cases) | **40 passed** (39 cases + auth setup), 0 failed, 0 retries (5.8m) — the list spec's first fully green run |
| Ruling close-out gates — client `tsc --noEmit`, `check:spec-quality`, spec-sleeps, `check:step-labels`, `check:tc-parity`, `xlsx:build` + `xlsx:lint`, `verify-no-forbidden --staged-diff` | exit 0 / the pre-existing TC-SVC-HIS-012 receipt note only / none / PASS / PASS / PASS with 0 vocab hits / no marker hits |
| Phase 10 — plan closure validator on this plan and the sibling, `plans:reindex`, activity-log validator, `verify-no-forbidden --staged-diff` | PASS on both (enforced at write time by the plan-closure gate and re-run by command after the index was rebuilt) · `plans/INDEX.md` regenerated · OK, no backdating · no marker hits |
| Phase 11 — delivery-manifest validator after the approval edit | same classes as its baseline (the pre-existing evidence warnings on delivered rows only); approval log append-only (`1 0` in the numstat) |
| Phase 11 — ship dry runs (`--keep-scratch`) | scope gate FAIL ×2, both correct: the sibling-folder comment (fixed, dc7a90e3) and the withheld NM-2259 workbook (removed from the scratch payload) |
| Phase 11 — gates on the corrected extract | deny-list OK (147 files) · approved scope PASS · structural names PASS |
| Phase 11 — remote after the push (fetched by URL) | `feature/sprint18-vikas-NM-2258` tip `c31899aa`, 147 files, 1 spec, 39 unique TC ids, 3 workbooks, leak check clean, `.env.local` blank |

The full-family runs are the load-bearing ones: they prove the page-object move and the Phase 6
rename did not break the three sub-tasks already delivered to the client (ISR.PRS, ISR.PRF, ISR.APC),
and the 2026-09-10 solo run is the list spec's first fully green one.

Pre-existing and unrelated: the `check:spec-quality` reject-oracle receipt for TC-SVC-HIS-012
(announce mode, exit 0) and the tc-parity title-divergence flags on CPR / LOS / LOC — no ISR rows
in either.

---

## Deliberate deviations

1. **Markdown test cases and plans stay in the module-grouped planning directory.** They live
   under the per-client planning tree, which is gitignored from the deliverable and never ships, and
   the parity gate accepts either the module's directory or the submodule's declared one. The folder
   rule applies to what actually reaches the client.
2. **The shared grid base stayed under the Item Search page directory at first commit — the owner
   then reversed it (Phase 6).** The original reasoning was that an abstract base extended by both
   the Products page and `ProductGroupsPage` is not ownable by any one sub-task, so moving it would
   rewrite paths in ISR.PRS, ISR.PRF and ISR.APC. It was flagged to the owner as the one remaining
   Item Search path in the branch, and that flag was WRONG — the correction is recorded in Phase 6.
   The owner chose the full rename.
3. **TC-ISR-PGR-016 was a deliberately failing case, not a skip (Phase 8).** Two write-time gates
   contradict each other for a new skip in a shipped spec (a bug id required by one, banned by the
   other). Neither an override nor a loophole was used: the case asserted the intended behaviour and
   failed with precise diffs, and that failure was the evidence for BUG-ISR-PGR-001 — the owner's
   standing direction for filed defects. The workbook's list-only build stamps it "Automated / Pass",
   which that build defines as "automated and not skipped or fixme"; the case note in the MD and the
   bug file both said it failed on purpose. (Superseded 2026-09-10: the bug was withdrawn by owner
   ruling and the case flipped to a passing pin of the accepted behaviour — Phase 8 withdrawal
   paragraph.)
4. **The walkthrough spot-check log was written by OWNER (Phase 8).** BUILDER ran the three checks
   before the specs were written but has no §2 row for `reports/walkthrough/`, and the identity gate
   denied the write; the log's header records that provenance rather than pretending BUILDER wrote
   it. The durable fix is a §2 row for BUILDER.
5. **The packaging phases are recorded twice (Phase 10).** Phases 1–6 appear in this plan and in the
   sibling because both branches carry that work and each branch must stand on its own plan. A done
   plan is frozen, so the two copies cannot drift; the ticket-specific phases live in one plan only.

## Not done — and why

- **Shipped to the client repo on 2026-09-10 (Phase 11), team repo not pushed.** Approval-log
  row 61, `ISR.PGR` approved-next, client branch `feature/sprint18-vikas-NM-2258` at tip
  `c31899aa`. The framework commits behind it (005eb8bd, b8d27451, dc7a90e3) sit on NM-2253 and
  go to the team repo only when the owner asks.
- **Coverage deliberately outside the list page.** The Add page (the sibling's), editing on the Edit
  page (a different route with its own form; no ticket among NM-2253/2258/2259 covers it), the
  NM-1707 layout rule, and a both-statuses listing — listed with reasons in the test plan's
  out-of-scope table. The 2026-08-31 DEEP seed list (column sorting, inactive rendering, grid layout)
  is covered by Phase 8.
- **No open bug on the list page after the 2026-09-10 ruling.** The three findings were filed as
  BUG-ISR-PGR-001 / 002 / 003 (Phase 8) and withdrawn by the owner as accepted behaviour; the records
  keep the measured facts.
- **`reports/walkthrough/` has no §2 row for BUILDER.** The spot-check log was written by OWNER at
  close-out after the identity gate denied BUILDER; a governance fix to §2 is the durable answer.
- **The Add page's branch — not yet.** NM-2259 follows on its own client branch after this one,
  on the owner's go; its workbook has to be kept off by hand until the ship script's workbook
  resolver learns the sub-task folders (Phase 11). The Phase 10 table names the files both branches
  carry.
