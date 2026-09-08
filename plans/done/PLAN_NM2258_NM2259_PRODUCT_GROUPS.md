# PLAN_NM2258_NM2259_PRODUCT_GROUPS — split the Product Groups coverage into its two sub-task deliverables

**Status**: DONE
**Priority**: P1
**Created**: 2026-09-08
**Executed**: 2026-09-08
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

Workbook filenames keep the `item-search-` prefix and the case ids stay `TC-ISR-PGR-*`, so the
parent module is still readable from three places — the same shape NM-2257 shipped with.

### Where the NM-2258 / NM-2259 boundary comes from

The two sub-tasks carry different Jira titles but the boundary is taken from the application, not
from judgement: the group list page has an **Add** button that routes to a separate page
(`/products/product-groups/add` — a route, not a dialog). Everything on the list page is NM-2258;
everything behind the Add button is NM-2259.

| | NM-2258 — Search For Product Groups | NM-2259 — Create new Product Groups |
|---|---|---|
| Surface | Group list page: search box, Active filter, Reset/Search, 4-column grid, pagination | Add Product Group page: Name, Description, Service Type, Active, sub-class picker, Cancel/Save |
| Cases | TC-ISR-PGR-001, 002, 003, 004, 005, 009, 010 (7) | TC-ISR-PGR-006, 007, 008, 011 (4) |
| Save | none — every case reads or resets | TC-ISR-PGR-011 creates a real group and proves it by searching it back |

7 + 4 = 11, verified by command against the pre-split file — no overlap and no orphan.

TC-ISR-PGR-005 (Reset) sits on the search side even though it was authored in the same describe
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
| `export_test_cases/module-codes.json` | `ISR.PGR` gains `display: "Search For Product Groups"` + `dir: "search-for-product-groups"`; new `ISR.APG` (`display: "Create new Product Groups"`, sheet `item_search_add_product_group`, `dir: "create-new-product-groups"`, `idModule: ISR` / `idSubmodule: PGR` so the ids stay in the PGR sequence — the same indirection `ISR.PRF` and `ISR.APC` use) |
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
describes — the surface-behavior block plus a search-panel field block holding TC-005) and
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
3. **The shared grid base stays under the Item Search page directory.** It is an abstract base
   extended by both `ItemSearchPage` and `ProductGroupsPage` and is therefore not ownable by any
   one sub-task. Moving it would rewrite paths in ISR.PRS, ISR.PRF and ISR.APC, all already
   delivered. Flagged to the owner as the one remaining Item Search path in the NM-2258/NM-2259
   branch; a decision on it is open, not assumed.

---

## Not done — and why

- **No approval-log row, no push.** Both manifest entries are `withheld`. The owner's standing
  instruction on this work was "don't push or ship until i asked you to", and an approval row
  records an owner decision that has not been given. The branch name and the push remain the
  owner's call.
- **No new test coverage.** The 11 cases are the ones authored under the parent plan and
  SUBPLAN_ITEM_SEARCH_SAVE_FLOWS. Anything deeper (drag-to-add sub-class, group edit/deactivate,
  Service Type option set, inactive-group rendering, column sorting) stays in the DEEP seed list
  in SUBPLAN_PRODUCTS_DQU.md.
