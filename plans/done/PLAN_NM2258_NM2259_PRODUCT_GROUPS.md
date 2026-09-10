# PLAN_NM2258_NM2259_PRODUCT_GROUPS — split the Product Groups coverage into its two sub-task deliverables

**Status**: DONE
**Priority**: P1
**Created**: 2026-09-08
**Executed**: 2026-09-08 (Phases 1–5) · 2026-09-09 (Phases 6–8) · 2026-09-10 (Phase 9)
**Identity**: OWNER (spec + data + page-object + selector work under BUILDER; registries, manifest and plan under OWNER)
**Parent**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md
**Depends on**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md, SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md
**Blocks**: none
**Model**: claude-opus-5
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**CoverageMode**: quick
**BrowserTool**: cli
**Jira**: [NM-2258 — Automate → Product → Search For Product Groups](https://encore.atlassian.net/browse/NM-2258) + [NM-2259 — Automate → Product → Create new Product Groups](https://encore.atlassian.net/browse/NM-2259) (sub-tasks of NM-2253; assignee vikas yadav)

---

## Context

NM-2253 ("Automate Item Search") is a parent Story with seven sub-tasks. Coverage was originally
built **by module** (PRS / PCD / PGR), so the Product Groups cases sat in one file mixing two
sub-tasks: the group **list/search** page (NM-2258) and the **Add Product Group** page (NM-2259).
NM-2254, NM-3650 and NM-2257 were already separated the same way — one workbook per sub-task —
and pushed. This plan does the same for the two Product Groups sub-tasks, which the owner asked
to finish and ship together in one branch.

The automation itself was already complete and green before this plan started: 11 cases, a page
object, a selector set, a field inventory and two walk-evidence sessions (2026-08-31 structural,
2026-09-02 real create — product group id 4581). **No new test coverage was authored here.** What
was missing was the packaging: per-sub-task workbooks, per-sub-task specs, and folders a reviewer
can tell apart across seven delivery branches.

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

| | NM-2258 — Search For Product Groups | NM-2259 — Create new Product Groups |
|---|---|---|
| Surface | Group list page: search box, Active filter, Reset/Search, 4-column grid, pagination | Add Product Group page: Name, Description, Service Type, Active, sub-class picker, Cancel/Save |
| Cases | TC-ISR-PGR-001 to 007 (7; numbered 001–005, 009, 010 until Phase 9) | TC-ISR-APG-001 to 004 (4; numbered TC-ISR-PGR-006–008, 011 until Phase 9) |
| Save | none — every case reads or resets | TC-ISR-APG-004 creates a real group and proves it by searching it back |

7 + 4 = 11, verified by command against the pre-split file — no overlap and no orphan.

TC-ISR-PGR-007 (Reset) sits on the search side even though it was authored in the same describe
block as the Add-page field cases: Reset is a control on the list page's search panel, and the
boundary is the surface, not the block it happened to be written in.

---

### Execution Summary

Executed 2026-09-08 in one session. No new coverage; the 11 existing cases were repartitioned into
two sub-task deliverables, their source moved into feature-named folders, and the whole Item Search
family re-run to prove nothing already delivered regressed.

**Phase 1 — Registries.**

| File | Change |
|---|---|
| `export_test_cases/module-codes.json` | `ISR.PGR` gains `display: "Search For Product Groups"` + `dir: "search-for-product-groups"`; new `ISR.APG` (`display: "Create new Product Groups"`, sheet `item_search_add_product_group`, `dir: "create-new-product-groups"`, `idModule: ISR` / `idSubmodule: PGR` so the ids stay in the PGR sequence — the same indirection `ISR.PRF` and `ISR.APC` use; **reversed in Phase 9**, the Add page now carries `TC-ISR-APG-*`) |
| `export_test_cases/types.ts` | `APG` added to `KNOWN_SUB_CODES` (the registry-to-types drift gate fails otherwise) |
| `export_test_cases/to-xlsx.ts` | Sheet display names for both halves; split-file map repointed to the two new folders |
| `scripts/deliverable/delivery-manifest.encore.json` | `ISR.PGR` entry updated (new spec path, new workbook path, 7 tc_ids, 3 src paths); new `ISR.APG` entry (4 tc_ids). **Both `withheld`** — neither has an approval row, and the owner has not asked for the push |

Sheet name `item_search_add_product_group` is 29 characters, inside Excel's 31-char cap — no
shortening note needed.

**Phase 2 — Source moves (feature-named folders).** The page object moved to
`clients/encore/src/pages/product-groups/product-groups.page.ts`, the selectors to
`clients/encore/src/selectors/product-groups/product-groups.ts`, and the five PGR constants out of
the shared Item Search data module into a new
`clients/encore/src/data/product-groups/product-groups.ts` (`PGR_ROUTE`, `PGR_SEARCH_WORD`,
`PGR_COLUMNS`, `PGR_DEFAULT_PAGE_SIZE`, `PGR_ADD_GROUP` — renamed off the `ISR_` prefix now that
they live in their own module).

`clients/encore/tests/item-search/product-search.spec.ts` — already delivered as ISR.PRS — imports
`ProductGroupsPage` for its leave-and-return cases; its import line was repointed. That is the
only delivered file this plan touched, and the full-family run below proves it still passes.

**Phase 3 — Spec split.** The single 11-case spec became
`clients/encore/tests/search-for-product-groups/search-for-product-groups.spec.ts` (7 cases, two
describes — the surface-behavior block plus a search-panel field block holding the Reset case, TC-005 then and TC-ISR-PGR-007 since Phase 9) and
`clients/encore/tests/create-new-product-groups/create-new-product-groups.spec.ts` (4 cases, one
describe). Case bodies moved verbatim apart from the constant renames. Both keep the 300s describe
timeout, the per-test `ensureCleanSearch` baseline in `beforeEach`, and the `dependencyGate([])`
first line in every case.

Two gate registries carried the old spec path and were repointed:
`scripts/check-per-test-baseline.mjs` (the create describe is the save-capable one) and
`scripts/check-save-route-parity.mjs`.

**Phase 4 — Markdown + workbooks.** Test cases and test plans split along the same boundary, each
half carrying its own field inventory table, validation rules, verification log and a sibling-file
pointer. Workbooks rebuilt via `npm run xlsx:build` into
`clients/encore/testcases/search-for-product-groups/` (7 rows) and
`clients/encore/testcases/create-new-product-groups/` (4 rows); the superseded combined workbook
under `clients/encore/testcases/item-search/` was removed.

**Phase 5 — Field inventory split.** This was authored the other way first: the walk artifact was
annotated with a `Subtask_Ownership:` line and deliberately NOT split, on the reasoning that its
machine denominators are per-state rather than per-ticket. The pre-commit gate (SP-AAE-01) rejected
the commit — every test-case markdown module needs its own paired dated field inventory — and it was
right: the `dialog:add-group` state IS the NM-2259 surface, so the partition the enumerator already
made is the ticket partition. `item-search-add-product-group-2026-08-31.md` was split out the same
way `item-search-add-product-code-2026-09-03.md` was for NM-2257.

No new walk was run and no disposition changed. The Add-page field table, labels, save-cycle
observations, LR-029 rows and the two picker deferrals moved to the new artifact and were REMOVED
from the base rather than copied, so a later correction cannot land in one copy and rot in the other.
The new artifact restates the denominator caveat the base already carried: the add-group run's 24
keys are the list page's control set (its snapshot fired before the route change), so that number is
not Add-form coverage — the form is agent-walked with snapshot evidence, and every field is
inventoried. Both artifacts keep `Coverage_Ratio` 100% and `CrossCheck: clean`.

**Phase 6 — the source tree renamed off the parent story name (added 2026-09-09, owner-directed).**

Phases 1–5 shipped with Deviation #3 above: the shared grid base was left under
`src/pages/item-search/` and flagged to the owner as "the one remaining Item Search path." **That
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

**Phase 7 — the Add Product Group page re-walked and covered to depth (added 2026-09-09, owner-directed).**

The owner asked whether the Add page's text boxes had been tried at their maximum and minimum
lengths and with rejected input, and whether every Service Type option, the Active and Labor
checkboxes, Ascending/Descending, every button, the left-list items and the search box had been
exercised. The honest answer was no on every count: the 2026-08-31 inventory was split out of the
list-page walk, carried seven form controls, and missed the picker's own controls entirely — three
of them (the picker search, its sort order, its Labor filter) had never been inventoried. The page was
re-walked in full on 2026-09-09 under GIVER, Jira first (NM-2043, NM-2055, NM-1757, NM-2050,
NM-1907, NM-2036 — no Confluence spec exists), with on-disk evidence in
`.playwright-cli/apg-2026-09-09/` and the artifact
`clients/encore/specs_planning/_internal/field-inventories/item-search-add-product-group-2026-09-09.md`.
Nineteen cases were added under BUILDER — TC-ISR-APG-005 … 023 (numbered TC-ISR-PGR-012 … 030 at the time) — beside the four already delivered,
so the NM-2259 deliverable now carries 23 (workbook sheet `item_search_add_product_group`, 23 rows).

| What the owner named | Cases |
|---|---|
| Text boxes at the caps and with rejected input | 005 (Name: 50-char cap — the 51st keystroke is dropped, an over-long paste is cut, the box still lets Tab out), 006 (Description: 100-char cap), 007 (clearing by select-all and by backspace both hold Save back and mark the box invalid — the Add-page twin of NM-1907), 008 (whitespace-only counts as empty; a padded name is accepted and trimmed) |
| Service Type list | 010 (all 90 options verbatim and in order, no search box; first, middle and last select), 021 (the last option saves for real, with markup and quotes in the name stored as plain text) |
| Active and Labor | 009 (each required field gates Save; Active does not), 020 (a group saved with Active cleared is created Inactive and found only with the list's Active filter cleared), 014 (Labor narrows the catalog to labor rows; unchecking restores it) |
| Ascending / Descending | 015 (first and last row swap) |
| Every button | 016 (Reset clears search, Labor and sort but keeps an added sub-class — NM-2050), 019 (the divider collapses and expands the panel, measured), 003 / 022 / 023 (Cancel, browser Back, breadcrumb — all leave without saving or warning), Save through every create and rejection case |
| Left-list items | 017 (double-click adds once; × removes and the instruction returns), 018 (drag adds — full mouse sequence, proven against the double-click positive control), 013 / 014 / 015 (filtered and sorted reads) |
| Search box | 013 (substring, case-insensitive; no match empties the list with no message; clearing restores the live count) |
| Server rules | 011 (duplicate name rejected, with and without a trailing space — the server trims), 012 (duplicate description rejected even with a new name — first written up as a rule no Jira story states and tagged `DOM-only` in the spec; WRONG — NM-1851 states it, corrected 2026-09-09, see Phase 8) |

**What the walk surfaced (recorded in the inventory's Observations; none filed as a bug yet):**
(1) post-save landing — the live app lands on the group list; NM-2043 and NM-2055 (dev lead, June)
say the group's details page. BUG-CANDIDATE pending an owner/dev answer; the cases pin the observed
landing and cite the contradiction. (2) Description uniqueness is enforced with no stated requirement
— discussion item (withdrawn 2026-09-09: NM-1851, a Done QA defect, asked for exactly this check at
creation — see Phase 8). (3) Rejection toasts never auto-hide and follow the user to the list page and onto a
fresh Add form until dismissed, while the success toast hides in ~3 s — BUG-CANDIDATE (UX) pending an
owner ruling; found by the automation run, not the walk. (Corrected 2026-09-09: they expire after about
10 s — the family run's TC-012 flake measured it — so the candidate is withdrawn; see Phase 8.)

**Automation fixes the first run forced (19 passed / 3 failed / 1 flaky → 23 passed, 0 retries).**
The shared `typeByKeys` clears a box before typing, so "type one more character at the cap" had
replaced the content — new `appendToAddName` / `appendToAddDescription` type at the end without
clearing. The Service Type locator was anchored on its placeholder text, which vanishes once a value
is chosen — re-anchored on the page's only testid-less combobox. The rejection read waited for "a
toast matching the text", which resolved instantly on a toast left over from the previous save — a
vacuous green in TC-011's second read and a strict-mode flake in TC-012 — so it now counts matching
toasts before the click and waits for one more, reading the newest. The page object also asserts the
post-save landing URL, and `ensureCleanSearch` restores the list's Active filter so the inactive-create
case cannot leak its state into the next test.

**The machine denominator could not be produced.** `enumerate-page.mjs` gained a config for the page
(`item-search-add-product-group`, two opener branches) and hung on it twice — 27 min with the CDP
pass, 25 min without, idle after the resting state's derive-type phase. The page holds 7,394 draggable
catalog rows at rest. The inventory carries a disclosed snapshot census instead (112 keys, every one
dispositioned, `Walk_Mode: deep`) and states in `Completion_Record` that no enumerator JSON exists,
so the LR-062 completion-record check fails on it by design. The unlock is a fix to the enumerator
(owner-only `scripts/`), a re-run for the three states, and a GIVER pass replacing the census with the
machine manifest — routed to a task chip as a tooling defect, not chipped as a red test.

The Phase 0.5 spot-check log `reports/walkthrough/isr-apg-2026-09-09.walkthrough.yaml` (local —
`reports/` is gitignored) was written by OWNER at close-out: BUILDER ran the checks but has no §2 row
for `reports/walkthrough/`, and the identity gate denied the write. Recorded as a §2 gap.

**Phase 8 — the Product Groups list page re-walked to depth and covered (added 2026-09-09, owner-directed).**

The owner asked for the same treatment for the NM-2258 list page ("fix the inventory first, re-walk
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

Thirty-two cases were added under BUILDER — TC-ISR-PGR-008 … 039 (numbered 031 … 062 at the time) — beside the seven delivered, so the
NM-2258 deliverable now carries 39 (workbook sheet `item_search_product_groups`, 39 rows; per-ticket
workbook `clients/encore/testcases/search-for-product-groups/item-search-search-for-product-groups.xlsx`).

| Area | Cases |
|---|---|
| Search contract | 008 (Enter runs the search, same rows as the button — NM-1617), 009 (Description is searched — NM-972), 010 (case and surrounding spaces ignored; spaces-only counts as empty), 011 (in-order phrase match; reversed words and a name-plus-description phrase find nothing — NM-1622 / NM-1633), 012 (`&'`, `<b>` and `%` searched literally — NM-1620 / NM-1756), 013 (no match → zero, "No results", pager disabled; a 200-character term accepted), 014 (single match → count 1, one row), 015 (markup in names renders as text) |
| Status filter, rows, return paths | 017 (Active cleared lists inactive groups only), 018 (filter and results survive a reload), 019 (row click opens the Edit page: heading, form values, Not Priced badge, Save disabled, Cancel enabled, crumbs, translations control — NM-972 / NM-1644), 020 (browser Back and the Product Groups crumb restore the results and page 2 — NM-1924), 021 (the × clears the box, keeps the results; a reload restores the executed term), 022 (loader and placeholder rows show during a search — NM-1939), 023 (the Products crumb leaves, Back returns) |
| Pagination | 024 (last/first jumps, page-of-total label, pager states), 025 (page box jumps; out-of-range snaps back; letters refused), 026 (10 … 50 rows per page reshape the pages), 027 (rows-per-page and page survive leaving through a crumb and a fresh navigation — NM-1910), 028 (Reset from page 2 → page 1 of 1 — NM-1909) |
| Sorting | 029 (Name ascending by default, arrow drawn, stored sortBy/asc — NM-1618), 030 (Name menu sorts descending and back), 031 (Description and Service Type sort; one marker at a time), 032 (a sort from page 2 returns to page 1 — NM-2064), 033 (the sort survives a new search, a Reset and a reload; only Reset to Default View clears it), 034 (every header opens its menu, Escape closes; Status has no sort) |
| Grid layout | 035 (Grid Options hides/shows columns, remembered across a reload; Hide column in the column menu writes the same preference — NM-1852), 036 (Reset to Default View restores columns, sort, page and the stored preferences), 037 (drag-reorder by full pointer sequence persists), 038 (drag-resize stores the whole delta; the rendered width grows — pinned to the defect below), 039 (panel collapse widens the grid, not remembered) |
| Known defect | 016 (a submit inside the typing delay runs the previous term — runs and fails on purpose, see below) |

**Spot-check before the specs (Phase 0.5a).** Active filter, search box and rows-per-page agreed with
the fresh artifact (3/3, plus the pager, page box, headers, Grid Options, column menu, sort, reset,
stored state and Edit landing as extras — `reports/walkthrough/isr-pgr-2026-09-09.walkthrough.yaml`,
written by OWNER at close-out, the same §2 gap as Phase 7). One drift: the Name header draws the
ascending arrow at rest and after a search; the inventory had said "no arrow until a sort". TC-029 and
the two inventory rows were corrected before the specs were written.

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
read-only this session, so the three bugs are filed in `clients/encore/reports/bugs/` and not yet raised
as NM tickets.

**TC-ISR-PGR-016 runs and fails on purpose.** The case could not be skipped: the skip gate demands a
bug id on the skip line and the shipped-source jargon gate bans that id in a spec — both denials are on
the record; no override was requested and no loophole used. The case states the intended behaviour
(the typed term runs at once) and fails today with four precise diffs (the first-visit submit ran ''
not 'ZZ E2E'; 0 found; the immediate re-submit ran 'ZZ E2E' not 'Audio'; first row unchanged) — the
owner's standing direction for a filed defect; it passes unchanged once the fix lands. A signal probe
(`.playwright-cli/pgr-2026-09-09/probes-debounce-signals.json`) settled the mechanics first: the
first-visit fast submit starts no search at all (it records the empty term), while the fast edit
re-runs the old word with a full loader cycle — the page object's completion wait was built on that.
The gate deadlock, and the tracing-teardown error that follows every failing case ("Must start tracing
before stopping", pre-existing), were routed to task chips.

**Correction to Phase 7.** TC-ISR-APG-012's "a rule no Jira story states" was wrong: NM-1851 (QA
Defect, Done — "Duplicate Product Group description is allowed during creation but blocks update
operation later") asked for the description check at creation. Found by this phase's Jira pass; the
Add-page inventory (Jira row, frontmatter, Observations), the Add-page case note, the spec comment and
this plan now cite it, and the discussion item is withdrawn.

**The family run and its one flake.** The full Products / Product Groups family (item-search +
create-new-product-groups + search-for-product-groups, 101 cases) ran after the specs landed: 100
passed, TC-016 failed by design, and TC-ISR-APG-012 (Add page, duplicate description) failed its first
attempt and passed the retry. Artifacts first: the attempt's trace shows the Save click, the server's
500 with the correct rejection message half a second later (`add-update-product-group`, "… or group
description 'walk probe A' already exists."), then a 20 s wait for the matching-toast count to reach
"before + 1" = 3 that read 2, 2, 2, 2, then 1, then 0; the failure screenshot shows the form intact and
no toast at all. The two toasts counted before the click were TC-ISR-APG-011's, raised at 16:27:44.9Z and
16:27:46.3Z; they expired during the wait — rejection toasts last about 10 s, not forever, which
corrects the Phase 7 "never auto-hide" reading and withdraws that UX candidate. A count-based read
cannot tell "this click's toast appeared as an older one left" from "no toast appeared", so the read
was wrong, not the app: the rejection read now records the toast node the click itself adds (a watch
armed before the click) and returns its text, independent of whatever was already on screen and of
how long it lives. Verified by the Add-page spec solo and a second family run (rows below).

**Phase 9 — one contiguous case sequence per sub-task (added 2026-09-10, owner-directed).** The
owner asked that each ticket's test-case file number its cases 1 to N with no gaps ("like
1,2,3,4,5,6"). Until now both files drew on one shared `TC-ISR-PGR-*` sequence, so the list file
read 001–005, 009–010, 031–062 and the Add file 006–008, 011–030. Every case was renumbered in
place — none added, dropped or re-worded — and the Add page took its own id code, `TC-ISR-APG-*`
(the registry's `ISR.APG` sub-code, which the Phase 1 `idSubmodule: PGR` indirection had kept out
of the ids; that indirection is removed, so the workbook lint now checks the Add sheet's ids
against `ISR/APG`). Numbering follows the spec's describe order, so the spec, the case file and the
workbook read the same way top to bottom; the list case file's blocks were reordered to match.
Nothing about what a case does changed, so the Phase 7 and Phase 8 run results stand — the rows
below and the HTML reports of those runs carry the ids in force when they ran.

Old → new, list page (NM-2258): 001–004 → 001–004 · 009 → 005 · 010 → 006 · 005 → 007 ·
031–037 → 008–014 · 060 → 015 · 062 → 016 · 038–041 → 017–020 · 058 → 021 · 059 → 022 ·
061 → 023 · 042–045 → 024–027 · 054 → 028 · 046–051 → 029–034 · 052 → 035 · 053 → 036 ·
055 → 037 · 056 → 038 · 057 → 039.
Old → new, Add page (NM-2259): TC-ISR-PGR-006 / 007 / 008 / 011 → TC-ISR-APG-001–004 ·
012–030 → 005–023 (each old number minus 7).

Carried along in the same pass: both specs, both case files and test plans, the four Product
Groups inventories (2026-08-31 and 2026-09-09) plus the product-search inventory and the Item
Search catalog that cite list-page ids, `BUG-ISR-PGR-001/002/003` (`affectedTests`), the
manifest's two `tc_ids` lists (now 39 + 23), `module-codes.json`, this plan's Phase 7 / Phase 8
case references, two other plans that cite these ids, the walkthrough log, and the rebuilt
workbooks. Run logs under `.playwright-cli/` and activity-log rows keep the ids they were written
with — they are the record of what ran.

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
| NM-2258 spec solo | **8 passed** (7 cases + auth setup), 0 failed |
| NM-2259 spec solo | **5 passed** (4 cases + auth setup), 0 failed |
| Full Item Search family (item-search + add-product-code + both new folders) | **59 passed, 0 failed** (9.3m) |
| Full Item Search family after the Phase 6 rename (2026-09-09, before the re-walk) | **59 passed, 0 failed** (11.9m) |
| NM-2259 spec after the re-walk — first run (22 cases) | 19 passed, 3 failed, 1 flaky (5.6m) — the three page-object defects in Phase 7, all fixed |
| NM-2259 spec after the fixes (22 cases) | **23 passed** (22 cases + auth setup), 0 failed, 0 retries (3.5m) |
| Full Item Search family after the fixes | **77 passed, 0 failed, 0 retries** (14.9m) — 59 → 77 because the NM-2259 spec grew from 4 cases to 22 |
| NM-2259 spec with TC-ISR-APG-023 (23 cases) | **24 passed** (23 cases + auth setup), 0 failed, 0 retries (3.5m) |
| Close-out battery, 2026-09-09 | root + client `tsc` exit 0 · `check:tc-parity` PASS · `check:per-test-baseline` PASS (23 registered) · save-route parity PASS (4 routes) · `check:step-labels` PASS · `check:structural-names` PASS · `check:spec-quality` exit 0 (announce-mode receipt for TC-SVC-HIS-012, pre-existing) · `xlsx:build` green (`item_search_add_product_group` 23 rows) · `xlsx:lint` PASS · `check:coverage-manifest` 42/42 |
| `check:walk-observations` | FAIL on 7 pre-existing artifacts (service-charge, barcode, save-flows evidence files); the 2026-09-09 Add-page inventory is not among them |
| Closure dry-run after Phase 7 was added | PASS — but only because the validator reads the artifacts cited in the Per-Identity matrix (the 2026-08-31 walk that closed Phases 1–5), not the Phase 7 prose. A plan that cites the 2026-09-09 census artifact in its matrix is denied on `Completion_Record` until the enumerator runs; that is the intended state, not a pass to lean on |
| NM-2258 spec after the Phase 8 re-walk — first run (38 cases) | **39 passed** (38 cases + auth setup), 0 failed, 0 retries (5.6m); no case over 30 s |
| NM-2258 spec with TC-ISR-PGR-016 (39 cases) | 39 passed, **1 failed by design** (6.0m) — TC-ISR-PGR-016 (TC-062 at the time of the run) is the evidence case for BUG-ISR-PGR-001; both attempts show the same four diffs |
| Phase 9 — `npm run check:tc-parity` after the renumber | PASS — all spec TCs present in both markdown and XLSX |
| Phase 9 — `npm run xlsx:lint` | PASS — 5302 rows, 0 vocab hits, 0 integrity violations; the Add sheet's ids now check against `ISR/APG` |
| Phase 9 — rebuilt workbooks read back | list workbook: 39 unique ids, TC-ISR-PGR-001 … 039 in order; Add workbook: 23 unique ids, TC-ISR-APG-001 … 023 in order; the master workbook's two sheets match |
| Phase 9 — root + client `tsc --noEmit` | exit 0 / exit 0 |
| Phase 9 — `npx playwright test --list` on both specs (under BUILDER; the labor gate refuses the listing to OWNER) | 39 `TC-ISR-PGR-*` titles resolve, listed 001 … 039 in order; 23 `TC-ISR-APG-*` titles resolve, 001 … 023 in order |
| Phase 9 — `check:spec-quality`, `check:step-labels`, `check:structural-names`, `check:per-test-baseline`, save-route parity, per-row-await, `verify-no-forbidden --staged-diff` | PASS — the same pre-existing notes as before (TC-SVC-HIS-012 receipt in announce mode; two INFO loops in local-office-settings); no marker hits in the staged diff |

The full-family run is the load-bearing one: it proves the page-object move did not break the
three sub-tasks already delivered to the client (ISR.PRS, ISR.PRF, ISR.APC).

Pre-existing and unrelated: the `check:spec-quality` reject-oracle receipt for TC-SVC-HIS-012
(announce mode, exit 0) and the tc-parity title-divergence flags on CPR / LOS / LOC — no ISR rows
in either.

---

## Deliberate deviations

1. **The Add-page inventory was split out, and the two artifacts point at each other rather than
   duplicating.** The Add-page field table, labels, save-cycle observations and picker deferrals
   were MOVED, not copied — a duplicated table is how a later correction lands in one file and rots
   in the other. The new artifact restates the denominator caveat the base already carried: the
   add-group run's 24 keys are the list page's control set, so 24/24 is not Add-form coverage; the
   form is agent-walked with snapshot evidence and every field is inventoried.
2. **Markdown test cases and plans stay in the module-grouped planning directory.** They live
   under the per-client planning tree, which is gitignored and never ships, and the parity gate
   accepts either the module's directory or the submodule's declared one. The folder rule applies
   to what actually reaches the client.
3. **The shared grid base stayed under the Item Search page directory at first commit — the owner
   then reversed it (see Phase 6).** The original reasoning was that an abstract base extended by
   both the Products page and `ProductGroupsPage` is not ownable by any one sub-task, so moving it
   would rewrite paths in ISR.PRS, ISR.PRF and ISR.APC. It was flagged to the owner as the one
   remaining Item Search path in the NM-2258/NM-2259 branch, and that flag was WRONG — see the
   correction recorded in Phase 6. The owner chose the full rename.

---

4. **The Add-page denominator is a disclosed snapshot census, not enumerator output (Phase 7).** The
   walk doctrine wants the page to enumerate itself; the enumerator hung twice on this page. The
   alternative — classifying from the census and calling it machine output — is the fabrication
   class the doctrine exists to prevent, so the artifact names the census as a census, keeps
   `Completion_Record: NONE`, and accepts the closure-gate failure until the tool is fixed.
5. **The walkthrough spot-check log was written by OWNER.** BUILDER ran the three checks before the
   spec was written but has no §2 row for `reports/walkthrough/`; the log's header records that
   provenance rather than pretending BUILDER wrote it.
6. **TC-ISR-PGR-016 is a deliberately failing case, not a skip (Phase 8).** Two write-time gates
   contradict each other for a new skip in a shipped spec (a bug id required by one, banned by the
   other). Neither an override nor a loophole was used: the case asserts the intended behaviour and
   fails with precise diffs, and that failure is the evidence for BUG-ISR-PGR-001 — the owner's
   standing direction for filed defects. The workbook's list-only build stamps it "Automated / Pass",
   which that build defines as "automated and not skipped or fixme"; the case note in the MD and the
   bug file both say it fails on purpose.
7. **The walkthrough spot-check log was written by OWNER again (Phase 8)** — the same §2 gap as
   deviation 5; the durable fix is a §2 row for BUILDER.

## Not done — and why

- **No approval-log row, no push.** Both manifest entries are `withheld`. The owner's standing
  instruction on this work was "don't push or ship until i asked you to", and an approval row
  records an owner decision that has not been given. The branch name and the push remain the
  owner's call.
- **Coverage still open after Phase 7 (NM-2259).** Editing or deactivating a created group (a
  different route with its own form; there is no delete), role-based access (NM-2036 — one
  automation user), and saving each of the 90 Service Type options (presence and order are
  asserted; the first and last are saved). Listed with reasons in the test plan's out-of-scope
  table. The NM-2258 list page's DEEP seed list (column sorting, inactive rendering, grid layout) is
  covered by Phase 8; what stays out for the list page is in its test plan's out-of-scope table (the
  Add page, editing on the Edit page, the NM-1707 layout rule, a both-statuses listing).
- **No machine denominator for the Add page.** `enumerate-page.mjs` hangs on the 7,394-row catalog
  (Phase 7); the inventory carries a disclosed census and fails the completion-record check on
  purpose. Unlock: fix the enumerator, re-run the three states, replace the census under GIVER.
- **One Add-page finding is unfiled.** The post-save landing contradiction (NM-2043 / NM-2055 vs
  the live app) needs an owner or dev ruling before a bug is raised; it sits in the Add-page
  inventory's Observations as a BUG-CANDIDATE. (The other two Phase 7 items are not findings:
  description uniqueness is NM-1851's rule, and rejection toasts expire after about 10 s — both
  corrected 2026-09-09, Phase 8.) The three list-page findings ARE filed — BUG-ISR-PGR-001 / 002 /
  003 (Phase 8).
- **`reports/walkthrough/` has no §2 row for BUILDER.** The spot-check log was written by OWNER at
  close-out after the identity gate denied BUILDER; a governance fix to §2 is the durable answer.
- **One branch per ticket, each run on its own — not started.** The owner's process update (push
  NM-2258 and NM-2259 on separate branches and run each independently) waits for the owner's go
  on branch names; both specs already run standalone (NM-2258: 39 cases in
  `search-for-product-groups` after Phase 8; NM-2259: 23 cases in `create-new-product-groups`). TC-ISR-APG-004
  proves its save through the list page's search-back, a one-way dependency that stays inside
  NM-2259.
