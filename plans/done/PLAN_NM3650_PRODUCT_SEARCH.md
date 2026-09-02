# PLAN_NM3650_PRODUCT_SEARCH — own the search + result-grid half of the Product Search page

**Status**: DONE
**Priority**: P1
**Created**: 2026-09-02
**Executed**: 2026-09-02 (ownership split; the coverage itself landed 2026-08-31 → 2026-09-01 under the parent)
**Identity**: OWNER
**Parent**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md
**Depends on**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**CoverageMode**: quick
**BrowserTool**: none
**Jira**: [NM-3650 — Automate Item Search → Product Search](https://encore.atlassian.net/browse/NM-3650) (sub-task of NM-2253; assignee vikas yadav)

---

## Context

NM-2253 ("Automate Item Search") is a parent Story with seven sub-tasks. Its coverage was built and closed **by module** (PRS / PCD / PGR), not by sub-task, so no single sub-task had a plan that owned its own scope. This plan is the per-sub-task ownership record for **NM-3650**, requested by the owner on 2026-09-02 ("i want separate plan for each sub-task").

It **documents and owns existing coverage** — it authors no new test cases. The owner scoped the split as "split the existing 31 only" (2026-09-02), with the remaining depth recorded here rather than executed.

**Amended the same day.** An owner-requested live re-walk of both sub-tasks found one coverage gap, and it fell on the sibling side: the Product Organization filter sits under the `Filters` header, so **TC-ISR-PRS-032** was authored under `PLAN_NM2254_PRODUCT_SEARCH_FILTERS.md`. Nothing on this plan's side changed — the re-walk also opened one of the eleven deferred column menus live and confirmed it is the same Sort ascending / Sort descending / Hide archetype as the two already covered, so the deferral below rests on an observation rather than an assumption. The partition is now **10 / 22 = 32**.

### Where the NM-3650 / NM-2254 boundary comes from

Both sub-tasks carry byte-identical Jira descriptions (`Tool: Playwright · Scope: Field Validation, save · Environments: E2E · Outcome: Included in regression suite`), so **Jira does not define the boundary**. It is taken instead from the application's own layout: the search panel renders a literal **`Filters`** section header, evidenced in the field inventory's label census (`item-search-product-search-2026-08-31.md` § Labels + Section Names) and in a live authenticated screenshot taken 2026-09-02.

- The search inputs above that header, the panel's own actions and chrome, and the entire result grid below it → **NM-3650** (this plan).
- The seven controls under the header → **NM-2254** (`PLAN_NM2254_PRODUCT_SEARCH_FILTERS.md`).

This supersedes an earlier ad-hoc 6/25 split that assigned the three date test cases here; the `Filters` header places Prep/Return Date Time on the NM-2254 side, making the true split **22 / 9**.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/final-q` (exit per LR-042)

**Context files**:
- `plans/done/PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md` (parent)
- `plans/done/SUBPLAN_ITEM_SEARCH_BARCODE_COVERAGE.md`
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-040, LR-041, LR-048)
- `.claude/rules/inventory.md` (LR-062, LR-065, LR-072)
- `.claude/rules/plan-closure.md` (LR-055 C1–C6)
- `clients/encore/CLAUDE.md` (LR-ENC-001, LR-ENC-007, LR-ENC-009)

---

## Phase 0 — Dependency + browser-tool gate

1. `Depends on:` → `PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md` is in `plans/done/` (**Status**: DONE, **Executed**: 2026-08-31 → 2026-09-01). Satisfied.
2. Navigation registry carries no Item Search row; the surface's findings live in the dated field inventory + walk-evidence artifacts cited below, which were read in full rather than re-explored.
3. **BrowserTool = none.** This plan reclassifies existing artifacts; no live-site interaction is performed. No announcement obligation under LR-038 v2.

---

## Phase 0.5b — Baseline status (inherited)

`baselineScope: baseline-absent` — recorded per LR-ENC-001, not a HALT. The old-site baseline walk was attempted on 2026-08-31 (6 access attempts; TLS reset for automated browsers while `curl` returned 200) and is documented in `clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md`. This plan performs no new behavior classification and files no bugs, so it inherits that disposition rather than re-deriving it.

---

## Phase 1 — Scope owned by NM-3650

**Search inputs and panel actions** (above the `Filters` header):

| Control | Anchor | Inventory note |
|---|---|---|
| Keyword Search (radio) | `e2e-toggle-keyword` | the only radio in `e2e-toggle-group`; selects which help text the popover shows |
| Any Field | `e2e-search-input` | free text; filters across item number, description, category, product group |
| Barcode | `e2e-barcode-input` | `maxlength=42`; exact-match, case-insensitive; mutually exclusive with Any Field |
| Search | `e2e-search-button` | executes the search POST + availability enrichment |
| Reset | `e2e-reset-button` | restores defaults and empties results until the next Search |
| Search help | `e2e-popover-trigger` | click-triggered popover; content varies by search type |
| More information | aria-label `More information` | hover tooltip |
| Collapse search panel | accessible name `Collapse search panel` | collapse / expand |

**Result grid** (below the panel): 13 columns, menu-driven server-side sorting, truncation-conditional cell tooltips, pagination (50 default; options 10/20/30/40/50), Grid Options with 12 column toggles plus Reset to Default View, and the `0 products found` / `No results` empty state.

## Phase 2 — Test cases owned (22)

All twenty-two are implemented in `clients/encore/tests/item-search/product-search.spec.ts` and documented in `clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_search_test_cases.md`.

### Search panel and page (13)

| TC ID | Title | Surface_Family |
|---|---|---|
| TC-ISR-PRS-001 | The Products page loads with the search panel and grid ready | — |
| TC-ISR-PRS-002 | Reset restores the default criteria and empties the results | — |
| TC-ISR-PRS-003 | An Any Field word returns only matching products | result-fidelity (QUICK) |
| TC-ISR-PRS-004 | Search help opens guidance for the selected search type | — |
| TC-ISR-PRS-005 | The header icons show their tooltips | — |
| TC-ISR-PRS-006 | Grid cells show a tooltip only when their text is cut off | — |
| TC-ISR-PRS-013 | A barcode with no match shows the empty state | empty-vol (QUICK) |
| TC-ISR-PRS-014 | Sorting flips through the column menu | sorting (QUICK) |
| TC-ISR-PRS-015 | Pagination moves between pages | pagination (QUICK) |
| TC-ISR-PRS-016 | Rows-per-page offers five sizes | pagination (QUICK) |
| TC-ISR-PRS-017 | Grid Options hides and restores a column | — |
| TC-ISR-PRS-018 | An executed search survives leaving and returning | persistence (QUICK) |
| TC-ISR-PRS-019 | The search panel collapses and expands | — |

### Barcode search (9)

| TC ID | Title |
|---|---|
| TC-ISR-PRS-022 | A numeric barcode returns the single product it is scanned under |
| TC-ISR-PRS-023 | A barcode with letters resolves the same way as a numeric one |
| TC-ISR-PRS-024 | Different barcodes on the same product all return that product |
| TC-ISR-PRS-025 | Barcode matching ignores letter case |
| TC-ISR-PRS-026 | A shortened barcode matches nothing |
| TC-ISR-PRS-027 | The barcode box and the Any Field box clear each other |
| TC-ISR-PRS-028 | A barcode search survives leaving and returning |
| TC-ISR-PRS-029 | A product found by barcode opens in the product-code dialog |
| TC-ISR-PRS-030 | The barcode box stops accepting characters at its limit |

The barcode set rests on twelve owner-supplied barcodes resolved live on 2026-09-01, which mapped to five distinct products — the evidence that closed the module's open barcode question.

## Phase 3 — Depth NOT covered by this plan

**All 26 of the field inventory's `deferred-to-DEEP` elements belong to this sub-task** — every one is a result-grid control. None is charged to NM-2254.

| Group | Count | Elements | Deferral reason (verbatim class from the inventory) |
|---|---|---|---|
| Column resize handles | 13 | MajorCategory, SubCategory, Class, GroupName, SubClass, Item, ProductCodeID, Description, Available, Owned, OutOfService, InSequence, Location | column-resize drag mechanics and geometry assertions are deep-tier work |
| Column sort/hide menus | 11 | SubCategory, Class, ProductGroup, SubClass, Item, ProductCodeID, Description, Available, OutofService, InSequence, LocationName | same sort-and-hide archetype as the live-probed Category and Owned columns |
| Pagination extras | 2 | page-number input, last-page button | beyond the single move-page assertion this tier carries |

Two of the thirteen column menus **are** covered — Category by TC-ISR-PRS-014 and Owned by TC-ISR-PRS-017 — which is why the archetype is evidenced rather than assumed.

Behavioral depth also left to the deep tier:

| Gap | Disposition |
|---|---|
| Keyword Search radio validation | Inventory records "not probed (QUICK depth)"; its selection behavior rides TC-ISR-PRS-002/004. |
| Grid Options → Reset to Default View **invoked** | Menu itemization is asserted by TC-ISR-PRS-017; invoking the reset is deep-tier. |
| Horizontal table scroll | Observed live (a 1,925-px table inside a 575-px window at 900-px width) and recorded; no case authored at this tier. |
| Barcode charset and whitespace | `AB@#12` is accepted with `aria-invalid` null and returns 0; a trailing space still matches while a leading space does not. Root-caused 2026-09-01 as **server-side** — the untrimmed string reproduces the asymmetry through the API — and remains an open owner-ruling question, deliberately not filed as a bug. Evidence: `walk-evidence-item-search-barcode-whitespace-2026-09-01.md`. |
| Empty barcode returning 1,001 rows | Unreachable from the UI (the parameter is skipped, not matched); API-only observation. |
| Rows with a blank Category sort-key floating first | Recorded as an observation, not a sort defect. |

Per LR-072 these deferrals are a **legal disposition on a `CoverageMode: quick` plan**, not an incompleteness: the tier declaration is the demand signal, every element stays dispositioned, and the walk manifest holds at `Coverage_Ratio: 70/70 (100%)`.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site baseline | `(skipped: baselineScope baseline-absent — old-site TLS-resets automated browsers, 6 logged attempts 2026-08-31)` | n/a |
| GIVER | test-cases + test-plan (referenced, not modified) | clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_search_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/item-search/item_search_product_search_test_plan.md | `npm run check:tc-parity` exit 0 |
| BUILDER | spec (referenced, not modified) | clients/encore/tests/item-search/product-search.spec.ts | `npx playwright test --list` resolves TC-ISR-PRS-001…032 |
| HEALER | — | `(none)` | n/a |
| WATCHDOG | — | `(none)` | n/a |
| GARDENER | — | `(none)` | n/a |
| OWNER | this plan | plans/done/PLAN_NM3650_PRODUCT_SEARCH.md | `node scripts/validate-plan-closure.mjs --plan plans/done/PLAN_NM3650_PRODUCT_SEARCH.md --enforce --json` |

---

## Acceptance criteria

- [x] Every search-panel and grid control owned by this sub-task is named in Phase 1 and traced to the 2026-08-31 field inventory.
- [x] All 22 owned TC IDs exist in the spec and in the test-cases markdown.
- [x] 10 + 22 = 32 — the two sub-task plans partition the PRS spec exactly, with no shared or orphaned case. (Was 9 + 22 = 31 at authoring; TC-ISR-PRS-032 landed later the same day on the NM-2254 side — see that plan's Context amendment.)
- [x] All 26 `deferred-to-DEEP` elements are enumerated by name and grouped by deferral reason.
- [x] `CoverageMode: quick` matches the cited artifact's `Walk_Mode: quick` (LR-072 mismatch check).
- [x] Activity-log row appended per LR-028.
- [x] `/final-q` verdict emitted per LR-042.

---

## Verification

```bash
# All 22 NM-3650 test cases resolve in the spec
grep -o "TC-ISR-PRS-\(00[1-6]\|01[3-9]\|02[2-9]\|030\)" clients/encore/tests/item-search/product-search.spec.ts | sort -u | wc -l   # expect: 22
```

```bash
# The two plans partition the spec exactly: 22 + 10 = 32 distinct TC IDs
grep -o "TC-ISR-PRS-[0-9]\{3\}" clients/encore/tests/item-search/product-search.spec.ts | sort -u | wc -l   # expect: 32
```

```bash
# All 26 deferred-to-DEEP elements are still accounted for in the walk manifest
grep -c "deferred-to-DEEP" clients/encore/specs_planning/_internal/field-inventories/item-search-product-search-2026-08-31.md   # expect: 26
```

```bash
# Run just this sub-task's coverage
npx playwright test clients/encore/tests/item-search/product-search.spec.ts --grep "TC-ISR-PRS-(00[1-6]|01[3-9]|02[2-9]|030)"
```

---

### Execution Summary

**TCs implemented (22)**: TC-ISR-PRS-001, 002, 003, 004, 005, 006, 013, 014, 015, 016, 017, 018, 019, 022, 023, 024, 025, 026, 027, 028, 029, 030 — all authored and landed under the parent plan and `SUBPLAN_ITEM_SEARCH_BARCODE_COVERAGE.md` between 2026-08-31 and 2026-09-01, all present in `clients/encore/tests/item-search/product-search.spec.ts` (verified 2026-09-02 by grep of the spec's TC-ID set).

**TCs dropped**: none. This plan reclassifies existing coverage; it authored no new cases and removed none.

**Verification results (2026-09-02)**:
1. `grep -c "^\s*test(" clients/encore/tests/item-search/product-search.spec.ts` → `32` — the full PRS spec, of which these 22 are the search-and-grid share.
2. TC-ID census of the spec → `TC-ISR-PRS-001 … TC-ISR-PRS-032`, contiguous; all 22 owned IDs present.
3. All four cited artifact paths resolved on disk (spec, test-cases md, test-plan md, field inventory).
4. `grep -c "deferred-to-DEEP"` on the PRS inventory → `26`; per-row inspection assigns **all 26 to this plan** (13 resize, 11 column menus, 2 pagination extras) and none to NM-2254.

**Test pass confirmation**: the PRS spec last ran green as part of the item-search suite on 2026-09-02 — **55 passed / 0 failed**, exit 0 (32 PRS cases plus the sibling product-code and product-groups specs and `auth.setup`). This plan changed no executable code; the +1 over the 2026-09-01 run is TC-ISR-PRS-032, owned by the NM-2254 plan.

**Documentation changes**: this plan file only. No spec, page-object, selector, test-case, test-plan, or workbook content was modified.

**Deviations**: the owner-selected scope was "split the existing 31 only" — depth beyond the quick tier was deliberately not authored, and all 26 deferred elements are enumerated by name in Phase 3 rather than deferred silently.

---

## Handoff

NM-3650 now has a plan that owns its twenty-two test cases and names, element by element, the twenty-six grid controls its coverage stops short of. Together with the NM-2254 plan it partitions the 32-case PRS spec exactly — 22 and 10, no overlap, no orphan — on a boundary the application itself draws with its `Filters` section header rather than one inferred from two identical Jira descriptions. The whole elemental depth backlog for this page sits on this sub-task, which makes NM-3650 the right place to start if the quick tier is ever raised to deep.
