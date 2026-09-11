# PLAN_NM2259_CREATE_NEW_PRODUCT_GROUPS — the Add Product Group page (NM-2259): packaged as its own deliverable, re-walked to depth and covered

**Status**: DONE
**Priority**: P1
**Created**: 2026-09-08 (as one plan for both Product Groups sub-tasks; a plan of its own since 2026-09-10)
**Executed**: 2026-09-08 (Phases 1–5) · 2026-09-09 (Phases 6 and 7, the correction in Phase 8) · 2026-09-10 (the toast-read fix, Phase 9, the landing ruling, Phase 10) · 2026-09-11 (Phase 11, the ship)
**Identity**: OWNER (spec + data + page-object + selector work under BUILDER; the re-walk under GIVER; registries, manifest and plan under OWNER)
**Parent**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md
**Sibling**: PLAN_NM2258_SEARCH_FOR_PRODUCT_GROUPS.md — the Product Groups list page, the other half of the Product Groups coverage; pushed on its own branch before this one
**Depends on**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md, SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md
**Blocks**: none
**Model**: claude-opus-5
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**CoverageMode**: quick
**BrowserTool**: cli
**Jira**: [NM-2259 — Automate → Product → Create new Product Groups](https://encore.atlassian.net/browse/NM-2259) (sub-task of NM-2253; assignee vikas yadav)

---

## Context

NM-2253 ("Automate Item Search") is a parent Story with seven sub-tasks. Coverage was originally
built **by module** (PRS / PCD / PGR), so the Product Groups cases sat in one file mixing two
sub-tasks: the group **list/search** page (NM-2258 — the sibling plan) and the **Add Product Group**
page (NM-2259 — this plan). NM-2254, NM-3650 and NM-2257 were already separated the same way — one
workbook per sub-task — and pushed.

The automation was already complete and green before the split started: 11 cases, a page object, a
selector set, a field inventory and two walk-evidence sessions (2026-08-31 structural, 2026-09-02 real
create — product group id 4581). What was missing was the packaging: per-sub-task workbooks,
per-sub-task specs, and folders a reviewer can tell apart across seven delivery branches. That
packaging (Phases 1–6) was done once for both sub-tasks and is recorded in both plans, each from its
own side. The Add page's own coverage work — the 2026-09-09 deep re-walk and its 19 new cases
(Phase 7), the toast-read fix, the renumbering (Phase 9), the 2026-09-10 landing ruling and the live
re-check of the page's Jira defects — is recorded only here.

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

| | NM-2258 — Search For Product Groups (sibling) | NM-2259 — Create new Product Groups (this plan) |
|---|---|---|
| Surface | Group list page: search box, Active filter, Reset/Search, 4-column grid, pagination | Add Product Group page: Name, Description, Service Type, Active, sub-class picker, Cancel/Save |
| Cases at the split | TC-ISR-PGR-001 to 007 (7; numbered 001–005, 009, 010 until Phase 9) | TC-ISR-APG-001 to 004 (4; numbered TC-ISR-PGR-006–008, 011 until Phase 9) |
| Cases now | 39 (the sibling's Phase 8 added 32) | 23 (Phase 7 added 19) |
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
regressed. Phase 7 onwards is the Add page's own work.

**Phase 1 — Registries.**

| File | Change |
|---|---|
| `export_test_cases/module-codes.json` | new `ISR.APG` (`display: "Create new Product Groups"`, sheet `item_search_add_product_group`, `dir: "create-new-product-groups"`, first with `idModule: ISR` / `idSubmodule: PGR` so the ids stayed in the PGR sequence — the same indirection `ISR.PRF` and `ISR.APC` use; **reversed in Phase 9**, the Add page now carries `TC-ISR-APG-*`); `ISR.PGR` gains its own `display` + `dir` for the sibling |
| `export_test_cases/types.ts` | `APG` added to `KNOWN_SUB_CODES` (the registry-to-types drift gate fails otherwise) |
| `export_test_cases/to-xlsx.ts` | Sheet display names for both halves; split-file map repointed to the two new folders |
| `scripts/deliverable/delivery-manifest.encore.json` | new `ISR.APG` entry (4 tc_ids then, 23 since Phase 9); the `ISR.PGR` entry updated for the sibling. **Both `withheld`** — neither has an approval row, and the owner has not asked for the push |

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
`clients/encore/tests/create-new-product-groups/create-new-product-groups.spec.ts` (4 cases, one
describe) and
`clients/encore/tests/search-for-product-groups/search-for-product-groups.spec.ts` (7 cases, two
describes — the sibling's). Case bodies moved verbatim apart from the constant renames. Both keep the
300s describe timeout, the per-test `ensureCleanSearch` baseline in `beforeEach`, and the
`dependencyGate([])` first line in every case.

Two gate registries carried the old spec path and were repointed:
`scripts/check-per-test-baseline.mjs` (the create describe is the save-capable one) and
`scripts/check-save-route-parity.mjs`.

**Phase 4 — Markdown + workbooks.** Test cases and test plans split along the same boundary, each
half carrying its own field inventory table, validation rules, verification log and a sibling-file
pointer. The Add page's are
`clients/encore/specs_planning/test-cases/setup/item-search/item_search_add_product_group_test_cases.md`
and
`clients/encore/specs_planning/test-plans/setup/item-search/item_search_add_product_group_test_plan.md`.
Workbooks rebuilt via `npm run xlsx:build` into
`clients/encore/testcases/create-new-product-groups/` (4 rows then, 23 now) and
`clients/encore/testcases/search-for-product-groups/` (the sibling's); the superseded combined
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
the other. The new artifact restates the denominator caveat the base already carried: the add-group
run's 24 keys are the list page's control set (its snapshot fired before the route change), so that
number is not Add-form coverage — the form is agent-walked with snapshot evidence, and every field is
inventoried. Both artifacts keep `Coverage_Ratio` 100% and `CrossCheck: clean`.

**Phase 6 — the source tree renamed off the parent story name (added 2026-09-09, owner-directed).**

Phases 1–5 shipped with the deviation recorded below (the shared grid base left under
`src/pages/item-search/`) and flagged to the owner as "the one remaining Item Search path." **That
flag under-counted the problem by a factor of six, and the correction is recorded here rather than
quietly fixed.** The list-page spec legitimately drives the Products page and the Product Code page —
that is how a user reaches Product Groups in the application — so the branch depended on six files
across three `item-search`-named folders, not one:

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
Nineteen cases were added under BUILDER — TC-ISR-APG-005 … 023 (numbered TC-ISR-PGR-012 … 030 at the
time) — beside the four already delivered, so the NM-2259 deliverable now carries 23 (workbook sheet
`item_search_add_product_group`, 23 rows; per-ticket workbook
`clients/encore/testcases/create-new-product-groups/item-search-create-new-product-groups.xlsx`).

| What the owner named | Cases |
|---|---|
| Text boxes at the caps and with rejected input | 005 (Name: 50-char cap — the 51st keystroke is dropped, an over-long paste is cut, the box still lets Tab out), 006 (Description: 100-char cap), 007 (clearing by select-all and by backspace both hold Save back and mark the box invalid — the Add-page twin of NM-1907), 008 (whitespace-only counts as empty; a padded name is accepted and trimmed) |
| Service Type list | 010 (all 90 options verbatim and in order, no search box; first, middle and last select), 021 (the last option saves for real, with markup and quotes in the name stored as plain text) |
| Active and Labor | 009 (each required field gates Save; Active does not), 020 (a group saved with Active cleared is created Inactive and found only with the list's Active filter cleared), 014 (Labor narrows the catalog to labor rows; unchecking restores it) |
| Ascending / Descending | 015 (first and last row swap) |
| Every button | 016 (Reset clears search, Labor and sort but keeps an added sub-class — NM-2050), 019 (the divider collapses and expands the panel, measured), 003 / 022 / 023 (Cancel, browser Back, breadcrumb — all leave without saving or warning), Save through every create and rejection case |
| Left-list items | 017 (double-click adds once; × removes and the instruction returns), 018 (drag adds — full mouse sequence, proven against the double-click positive control), 013 / 014 / 015 (filtered and sorted reads) |
| Search box | 013 (substring, case-insensitive; no match empties the list with no message; clearing restores the live count) |
| Server rules | 011 (duplicate name rejected, with and without a trailing space — the server trims), 012 (duplicate description rejected even with a new name — first written up as a rule no Jira story states and tagged `DOM-only` in the spec; WRONG — NM-1851 states it, corrected 2026-09-09, the Phase 8 correction below) |

**What the walk surfaced (recorded in the inventory's Observations; none filed as a bug):**
(1) post-save landing — the live app lands on the group list; NM-2043 and NM-2055 (dev lead, June)
say the group's details page. BUG-CANDIDATE pending an owner/dev answer; the cases pin the observed
landing and cite the contradiction (ruled 2026-09-10, below). (2) Description uniqueness is enforced
with no stated requirement — discussion item (withdrawn 2026-09-09: NM-1851, a Done QA defect, asked
for exactly this check at creation — the Phase 8 correction). (3) Rejection toasts never auto-hide and
follow the user to the list page and onto a fresh Add form until dismissed, while the success toast
hides in ~3 s — BUG-CANDIDATE (UX) pending an owner ruling; found by the automation run, not the walk.
(Corrected 2026-09-09: they expire after about 10 s — the family run's TC-012 flake measured it — so
the candidate is withdrawn; the family-run paragraph below.)

**Automation fixes the first run forced (19 passed / 3 failed / 1 flaky → 23 passed, 0 retries).**
The shared `typeByKeys` clears a box before typing, so "type one more character at the cap" had
replaced the content — new `appendToAddName` / `appendToAddDescription` type at the end without
clearing. The Service Type locator was anchored on its placeholder text, which vanishes once a value
is chosen — re-anchored on the page's only testid-less combobox. The rejection read waited for "a
toast matching the text", which resolved instantly on a toast left over from the previous save — a
vacuous green in TC-011's second read and a strict-mode flake in TC-012 — so it first counted matching
toasts before the click and waited for one more, reading the newest (replaced again on 2026-09-10,
below). The page object also asserts the post-save landing URL, and `ensureCleanSearch` restores the
list's Active filter so the inactive-create case cannot leak its state into the next test.

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

**Phase 8 — the Product Groups list page re-walked to depth (2026-09-09).** The list page belongs to
NM-2258 and its re-walk is recorded in the sibling plan. Three things from that phase belong here.

**Correction to Phase 7.** TC-ISR-APG-012's "a rule no Jira story states" was wrong: NM-1851 (QA
Defect, Done — "Duplicate Product Group description is allowed during creation but blocks update
operation later") asked for the description check at creation. Found by the list page's Jira pass; the
Add-page inventory (Jira row, frontmatter, Observations), the Add-page case note, the spec comment and
this plan now cite it, and the discussion item is withdrawn.

**The family run and its one flake.** The full Products / Product Groups family (item-search +
create-new-product-groups + search-for-product-groups, 101 cases) ran after the list-page specs
landed: 100 passed, the list page's TC-016 failed by design (the sibling's), and TC-ISR-APG-012 (Add
page, duplicate description) failed its first attempt and passed the retry. Artifacts first: the
attempt's trace shows the Save click, the server's 500 with the correct rejection message half a
second later (`add-update-product-group`, "… or group description 'walk probe A' already exists."),
then a 20 s wait for the matching-toast count to reach "before + 1" = 3 that read 2, 2, 2, 2, then 1,
then 0; the failure screenshot shows the form intact and no toast at all. The two toasts counted
before the click were TC-ISR-APG-011's, raised at 16:27:44.9Z and 16:27:46.3Z; they expired during
the wait — rejection toasts last about 10 s, not forever, which corrects the Phase 7 "never auto-hide"
reading and withdraws that UX candidate. A count-based read cannot tell "this click's toast appeared
as an older one left" from "no toast appeared", so the read was wrong, not the app: the rejection read
now records the toast node the click itself adds (a watch armed before the click) and returns its
text, independent of whatever was already on screen and of how long it lives. Verified by the Add-page
spec solo and a second family run (rows below). That second run (2026-09-10) surfaced one further
test-side failure, in the list spec (a typing budget) — the sibling's fix.

**Ruled not a bug 2026-09-10 (owner) — the post-save landing.** The one item still open from Phase 7
was the landing contradiction: the live app lands on the group list after a save, while NM-2043 and
NM-2055 (dev lead, June) say the group's details page. Vikas ruled in chat that this is not a bug; it
is recorded in the Add-page inventory's Observations as a Jira contradiction for the dev lead to
settle, and the cases keep pinning the observed landing. It was re-verified live the same day on
office 1101 with two read-only-plus-create probes under `.playwright-cli/apg-2026-09-10/`
(`apg-live-probe.json`, `apg-toast-timing-probe.json`, four screenshots): five saves all landed on
the list page within about 1.2 s, the success toast appearing about 0.5 s after the click and still
showing on the list. The same probes re-checked the page's Jira defects on e2e: NM-1907 fixed (on the
Edit page, group id 4620, select-all + Delete and backspacing to empty both leave Save disabled and
mark the Name box invalid), NM-1757 and NM-2055 fixed as stated, NM-1851 and NM-2050 fixed (the
owner confirmed both are the developers' closed defects, not findings of this work), NM-2036 (role-based
access) needing a read-only user the automation account cannot provide. The two groups those probes
created (`ZZ E2E Probe …`, `ZZ E2E Toast …`) stay as ordinary family data; their mixed-case descriptions
are what exposed the list spec's sort-order oracle (the sibling's fix). NM-2259 therefore carries zero
open bugs.

**Phase 9 — one contiguous case sequence per sub-task (added 2026-09-10, owner-directed).** The
owner asked that each ticket's test-case file number its cases 1 to N with no gaps ("like
1,2,3,4,5,6"). Until now both files drew on one shared `TC-ISR-PGR-*` sequence, so the Add file
read 006–008, 011–030 and the list file 001–005, 009–010, 031–062. Every case was renumbered in
place — none added, dropped or re-worded — and the Add page took its own id code, `TC-ISR-APG-*`
(the registry's `ISR.APG` sub-code, which the Phase 1 `idSubmodule: PGR` indirection had kept out
of the ids; that indirection is removed, so the workbook lint now checks the Add sheet's ids
against `ISR/APG`). Numbering follows the spec's describe order, so the spec, the case file and the
workbook read the same way top to bottom. Nothing about what a case does changed, so the Phase 7 run
results stand — the rows below and the HTML reports of those runs carry the ids in force when they
ran.

Old → new, Add page (NM-2259): TC-ISR-PGR-006 / 007 / 008 / 011 → TC-ISR-APG-001–004 ·
012–030 → 005–023 (each old number minus 7). The list page's map is in the sibling plan.

Carried along in the same pass: both specs, both case files and test plans, the four Product
Groups inventories (2026-08-31 and 2026-09-09) plus the product-search inventory and the Item
Search catalog that cite list-page ids, the manifest's two `tc_ids` lists (39 + 23),
`module-codes.json`, this plan's case references, two other plans that cite these ids, the
walkthrough log, and the rebuilt workbooks. Run logs under `.playwright-cli/` and activity-log rows
keep the ids they were written with — they are the record of what ran.

**Phase 10 — one plan per ticket (added 2026-09-10, owner-directed).** The owner asked for a separate
plan for each ticket, because the two tickets are pushed on different branches one after the other and
each branch must carry only its own record. The combined plan (`PLAN_NM2258_NM2259_PRODUCT_GROUPS`,
created 2026-09-08 and committed with the packaging) was divided into this plan and
PLAN_NM2258_SEARCH_FOR_PRODUCT_GROUPS.md and removed from the tree; its history stays in git. Every
phase, run result, deviation and open item was kept and assigned to the ticket it belongs to; the
packaging phases (1–6) appear in both plans because both branches carry that work. Two smaller
tidy-ups rode along: the list page's sort probe moved out of this page's dated evidence folder into
`.playwright-cli/pgr-2026-09-10/`, so each ticket's evidence sits under its own prefix (`apg-` for
the Add page, `pgr-` for the list page), and `plans/INDEX.md` was regenerated. Activity-log rows
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

**Phase 11 — shipped to the client repo (2026-09-11, owner-directed).** The owner asked to start the
NM-2259 ship on sprint 18, so the branch is `feature/sprint18-vikas-NM-2259`. Approval-log row 62
records the decision and the manifest's `ISR.APG` entry moved to approved-next (every approval pin
re-hashed to the log's new blob, the validator's defect classes unchanged, the log append-only). The
Add-page spec ran on its own first for the ticket's HTML report (`reports/html-report-nm-2259`,
gitignored): 24 passed — 23 cases plus the auth setup — 0 failed, 0 flaky, 4.0 min, at HEAD 9c706aef.
The ship script's dry run passed its three gates at the first attempt: with the workbook-resolver fix
committed that morning (9c706aef) the list page's workbook was trimmed automatically, and only the
four documented module-level stragglers (corporate-override-location-picker and the three
discount-matrix workbooks) rode along. They were removed by the documented method rather than by
editing the script — `git rm` in the kept scratch, the deliverable commit amended under the
deliverable identity, a fresh archive extracted and all three gates re-run green (deny-list on 147
files, approved scope, structural names) — before pushing from the scratch with the script's own
first-push command. Verified on the remote: tip `6efda9d7`, 147 files, one spec with TC-ISR-APG-001
… 023 (23 unique ids), the per-ticket workbook plus the master trimmed to Overview +
`item_search_add_product_group` and the standing QA tracker, no internal material, the shipped
`.env.local` a blank template. The branch is new, so there is no earlier TC set to regress against.
The spec's header comment names the sibling's `tests/` folder by path; the scope gate accepts it
because the sibling is approved and delivered, and the sentence is true of the sibling's branch. The
team repo is not pushed.

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
| NM-2259 spec solo after the split | **5 passed** (4 cases + auth setup), 0 failed |
| Full Item Search family (item-search + add-product-code + both new folders) | **59 passed, 0 failed** (9.3m) |
| Full Item Search family after the Phase 6 rename (2026-09-09, before the re-walks) | **59 passed, 0 failed** (11.9m) |
| NM-2259 spec after the re-walk — first run (22 cases) | 19 passed, 3 failed, 1 flaky (5.6m) — the three page-object defects in Phase 7, all fixed |
| NM-2259 spec after the fixes (22 cases) | **23 passed** (22 cases + auth setup), 0 failed, 0 retries (3.5m) |
| Full Item Search family after the fixes | **77 passed, 0 failed, 0 retries** (14.9m) — 59 → 77 because the NM-2259 spec grew from 4 cases to 22 |
| NM-2259 spec with TC-ISR-APG-023 (23 cases) | **24 passed** (23 cases + auth setup), 0 failed, 0 retries (3.5m) |
| Close-out battery, 2026-09-09 | root + client `tsc` exit 0 · `check:tc-parity` PASS · `check:per-test-baseline` PASS (23 registered) · save-route parity PASS (4 routes) · `check:step-labels` PASS · `check:structural-names` PASS · `check:spec-quality` exit 0 (announce-mode receipt for TC-SVC-HIS-012, pre-existing) · `xlsx:build` green (`item_search_add_product_group` 23 rows) · `xlsx:lint` PASS · `check:coverage-manifest` 42/42 |
| `check:walk-observations` | FAIL on 7 pre-existing artifacts (service-charge, barcode, save-flows evidence files); the 2026-09-09 Add-page inventory is not among them |
| Closure dry-run after Phase 7 was added | PASS — the validator's coverage check reads only artifacts cited in a Per-Identity matrix, and this plan carries none, so the Phase 7 prose was never under it. A plan that cites the 2026-09-09 census artifact in a matrix is denied on `Completion_Record` until the enumerator runs; that is the intended state, not a pass to lean on |
| Phase 9 — `npm run check:tc-parity` after the renumber | PASS — all spec TCs present in both markdown and XLSX |
| Phase 9 — `npm run xlsx:lint` | PASS — 5302 rows, 0 vocab hits, 0 integrity violations; the Add sheet's ids now check against `ISR/APG` |
| Phase 9 — rebuilt workbook read back | Add workbook: 23 unique ids, TC-ISR-APG-001 … 023 in order; the master workbook's sheet matches |
| Phase 9 — root + client `tsc --noEmit` | exit 0 / exit 0 |
| Phase 9 — `npx playwright test --list` on the Add spec (under BUILDER; the labor gate refuses the listing to OWNER) | 23 `TC-ISR-APG-*` titles resolve, listed 001 … 023 in order |
| Phase 9 — `check:spec-quality`, `check:step-labels`, `check:structural-names`, `check:per-test-baseline`, save-route parity, per-row-await, `verify-no-forbidden --staged-diff` | PASS — the same pre-existing notes as before (TC-SVC-HIS-012 receipt in announce mode; two INFO loops in local-office-settings); no marker hits in the staged diff |
| Toast-read fix (2026-09-10, owner-directed) — TC-ISR-APG-011 + 012 run on their own first | 3 passed (2 cases + auth setup), 0 retries (1.4m); the fixed read returned the rejection text on all three saves |
| Toast-read fix — Add-page spec solo (23 cases) | **24 passed** (23 cases + auth setup), 0 failed, 0 retries (3.6m) |
| Toast-read fix — family run 2 (102 tests: the three Item Search specs + both Product Groups specs) | **100 passed, 2 failed, 0 flaky** (17.3m) — TC-ISR-APG-012 passed at the first attempt (the flake is gone); the two failures are the sibling's (TC-ISR-PGR-016 by design, TC-ISR-PGR-013 on a typing budget) |
| Toast-read fix — client `tsc --noEmit`, `check:step-labels`, save-honesty, `check:spec-quality`, spec-sleeps, `verify-no-forbidden --staged-diff` | exit 0 / PASS / PASS / the pre-existing TC-SVC-HIS-012 receipt note only / 0 fixed sleeps in specs / no marker hits |
| Landing ruling 2026-09-10 — live probes on 1101 (`.playwright-cli/apg-2026-09-10/`) | five saves, all landing on the list page within ~1.2 s with the success toast still showing; NM-1907 / NM-1757 / NM-2055 / NM-1851 / NM-2050 fixed on e2e; NM-2036 needs a read-only user |
| Ruling close-out gates — client `tsc --noEmit`, `check:spec-quality`, spec-sleeps, `check:step-labels`, `check:tc-parity`, `xlsx:build` + `xlsx:lint`, `verify-no-forbidden --staged-diff` | exit 0 / the pre-existing TC-SVC-HIS-012 receipt note only / none / PASS / PASS / PASS with 0 vocab hits / no marker hits |
| Phase 10 — plan closure validator on this plan and the sibling, `plans:reindex`, activity-log validator, `verify-no-forbidden --staged-diff` | PASS on both (enforced at write time by the plan-closure gate and re-run by command after the index was rebuilt) · `plans/INDEX.md` regenerated · OK, no backdating · no marker hits |
| Phase 11 — Add-page spec on its own for the ticket's HTML report (`reports/html-report-nm-2259`) | **24 passed** (23 cases + auth setup), 0 failed, 0 flaky, 0 retries (4.0m) at HEAD 9c706aef |
| Phase 11 — delivery-manifest validator after the approval edit | same classes as its baseline (18 pre-existing evidence warnings on delivered rows); approval log append-only (`1 0` in the numstat), 12 pins re-hashed to the new blob |
| Phase 11 — ship dry run (`--keep-scratch`) | deny-list OK (151 files) · approved scope PASS · structural names PASS at the first attempt; the list page's workbook trimmed by the resolver fix (9c706aef); the four module-level stragglers kept fail-open, as documented |
| Phase 11 — gates on the corrected extract, then the remote after the push | deny-list OK (147 files) · approved scope PASS · structural names PASS; `feature/sprint18-vikas-NM-2259` tip `6efda9d7`, 147 files, 1 spec, 23 unique TC ids, 3 workbooks (own + master trimmed to Overview + `item_search_add_product_group` + tracker), leak check clean, `.env.local` blank |

The full-family runs are the load-bearing ones: they prove the page-object move and the Phase 6
rename did not break the three sub-tasks already delivered to the client (ISR.PRS, ISR.PRF, ISR.APC),
and the Add-page spec has run green on its own three times since its cases were added.

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
   under the per-client planning tree, which is gitignored from the deliverable and never ships, and
   the parity gate accepts either the module's directory or the submodule's declared one. The folder
   rule applies to what actually reaches the client.
3. **The shared grid base stayed under the Item Search page directory at first commit — the owner
   then reversed it (Phase 6).** The original reasoning was that an abstract base extended by both
   the Products page and `ProductGroupsPage` is not ownable by any one sub-task, so moving it would
   rewrite paths in ISR.PRS, ISR.PRF and ISR.APC. It was flagged to the owner as the one remaining
   Item Search path in the branch, and that flag was WRONG — the correction is recorded in Phase 6.
   The owner chose the full rename.
4. **The Add-page denominator is a disclosed snapshot census, not enumerator output (Phase 7).** The
   walk doctrine wants the page to enumerate itself; the enumerator hung twice on this page. The
   alternative — classifying from the census and calling it machine output — is the fabrication
   class the doctrine exists to prevent, so the artifact names the census as a census, keeps
   `Completion_Record: NONE`, and accepts the closure-gate failure until the tool is fixed.
5. **The walkthrough spot-check log was written by OWNER.** BUILDER ran the three checks before the
   spec was written but has no §2 row for `reports/walkthrough/`; the log's header records that
   provenance rather than pretending BUILDER wrote it.
6. **The packaging phases are recorded twice (Phase 10).** Phases 1–6 appear in this plan and in the
   sibling because both branches carry that work and each branch must stand on its own plan. A done
   plan is frozen, so the two copies cannot drift; the ticket-specific phases live in one plan only.

## Not done — and why

- **Shipped to the client repo on 2026-09-11 (Phase 11), team repo not pushed.** Approval-log
  row 62, `ISR.APG` approved-next, client branch `feature/sprint18-vikas-NM-2259` at tip
  `6efda9d7`. The framework-side record (approval row 62, the manifest flip, this plan phase, the
  activity-log rows) is on the local NM-2253 branch and reaches the team repo only when the owner
  asks.
- **Coverage still open after Phase 7.** Editing or deactivating a created group (a different route
  with its own form; there is no delete), role-based access (NM-2036 — one automation user), and
  saving each of the 90 Service Type options (presence and order are asserted; the first and last are
  saved). Listed with reasons in the test plan's out-of-scope table.
- **No machine denominator for the Add page.** `enumerate-page.mjs` hangs on the 7,394-row catalog
  (Phase 7); the inventory carries a disclosed census and fails the completion-record check on
  purpose. Unlock: fix the enumerator, re-run the three states, replace the census under GIVER.
- **No open bug on the Add page after the 2026-09-10 ruling.** The post-save landing contradiction
  (NM-2043 / NM-2055 vs the live app) was ruled not a bug by the owner and sits in the Add-page
  inventory's Observations as a recorded Jira contradiction; the other two Phase 7 items are not
  findings (description uniqueness is NM-1851's rule; rejection toasts expire after about 10 s).
- **`reports/walkthrough/` has no §2 row for BUILDER.** The spot-check log was written by OWNER at
  close-out after the identity gate denied BUILDER; a governance fix to §2 is the durable answer.
- **The branch cut — done.** NM-2258 went first (`feature/sprint18-vikas-NM-2258`, 2026-09-10) and
  this ticket followed on its own branch on 2026-09-11 (Phase 11). Each branch carries only its own
  spec and workbook plus the shared files in the Phase 10 table, and each spec ran green on its own
  the day it shipped (this one 24 of 24; TC-ISR-APG-004 proves its save through the list page's
  search-back, a one-way dependency that stays inside NM-2259 through the shared page object).
