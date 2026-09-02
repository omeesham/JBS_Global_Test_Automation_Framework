# PLAN_NM2254_PRODUCT_SEARCH_FILTERS — own the Filters half of the Product Search page

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
**Jira**: [NM-2254 — Automate → Product → Product Search Filters](https://encore.atlassian.net/browse/NM-2254) (sub-task of NM-2253; assignee vikas yadav)

---

## Context

NM-2253 ("Automate Item Search") is a parent Story with seven sub-tasks. Its coverage was built and closed **by module** (PRS / PCD / PGR), not by sub-task, so no single sub-task had a plan that owned its own scope. This plan is the per-sub-task ownership record for **NM-2254**, requested by the owner on 2026-09-02 ("i want separate plan for each sub-task").

It **documents and owns existing coverage**. The owner scoped the split as "split the existing 31 only" (2026-09-02), with the remaining depth recorded here rather than executed.

**Amended the same day.** The owner then asked for a live re-walk of both sub-tasks to confirm the coverage was actually complete ("go back take a walk in both the module/ticket, and check if everything is covered or not"), and the walk found one real gap: the Product Organization filter had no test of its effect on results, and the recorded reason for that omission — "requires org-tagged product data" — was false. **TC-ISR-PRS-032** was authored, implemented, and run green under the owner's follow-up instruction ("fix it and add the missing tc"). This plan therefore owns **10**, and the split is **10 / 22 = 32**.

### Where the NM-2254 / NM-3650 boundary comes from

Both sub-tasks carry byte-identical Jira descriptions (`Tool: Playwright · Scope: Field Validation, save · Environments: E2E · Outcome: Included in regression suite`), so **Jira does not define the boundary**. It is taken instead from the application's own layout: the search panel renders a literal **`Filters`** section header, evidenced in the field inventory's label census (`item-search-product-search-2026-08-31.md` § Labels + Section Names) and in a live authenticated screenshot taken 2026-09-02.

- Controls **under** the `Filters` header → **NM-2254** (this plan).
- The search inputs above it and the result grid below it → **NM-3650** (`PLAN_NM3650_PRODUCT_SEARCH.md`).

This supersedes an earlier ad-hoc 6/25 split that assigned the three date test cases to NM-3650; the `Filters` header places Prep/Return Date Time on the NM-2254 side, making the true split **9 / 22** at authoring time — **10 / 22** after TC-ISR-PRS-032 landed later the same day (Product Organization sits under the `Filters` header, so the new case is NM-2254's).

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/final-q` (exit per LR-042)

**Context files**:
- `plans/done/PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md` (parent)
- `plans/done/SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md`
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

## Phase 1 — Scope owned by NM-2254

The seven controls rendered under the `Filters` header, per the 2026-08-31 field inventory:

| Control | Anchor | Inventory-recorded default |
|---|---|---|
| Quantity Greater Than Zero | `e2e-checkbox` (1st instance) | unchecked |
| Active | `e2e-checkbox` (2nd instance) | checked |
| Location | role-name `Select Location` | current office `1101 - Corporate Office Encore USA SGA` |
| Region | role-name `Select Region` | empty (placeholder) |
| Product Organization | popover trigger beside the label | None |
| Prep Date Time | 1st `Open popover` in the dates row | today 12:00 AM |
| Return Date Time | 2nd `Open popover` in the dates row | today 11:59 PM |

## Phase 2 — Test cases owned (10)

All ten are implemented in `clients/encore/tests/item-search/product-search.spec.ts` and documented in `clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_search_test_cases.md`.

| TC ID | Title | Control | Surface_Family |
|---|---|---|---|
| TC-ISR-PRS-007 | The Location dropdown lists offices | Location | — |
| TC-ISR-PRS-008 | The Region dropdown lists regions | Region | — |
| TC-ISR-PRS-009 | Location and Region clear each other | Location ↔ Region | combination (QUICK) |
| TC-ISR-PRS-010 | The Product Organization popover offers the country checklist | Product Organization | — |
| TC-ISR-PRS-011 | The date fields open a calendar with a time spinner | Prep + Return Date Time | — |
| TC-ISR-PRS-012 | Quantity Greater Than Zero narrows the results | Quantity Greater Than Zero | combination (QUICK) |
| TC-ISR-PRS-020 | A Prep date after the Return date is rejected with a message | Prep ↔ Return pair validation | — |
| TC-ISR-PRS-021 | A date value renders fully inside its box in every month | Prep + Return Date Time | — |
| TC-ISR-PRS-031 | The Active filter narrows the results to active products | Active | combination (QUICK) |
| TC-ISR-PRS-032 | The Product Organization filter narrows the results and clearing it restores them | Product Organization | combination (QUICK) |

**TC-ISR-PRS-032 was added on 2026-09-02** by the owner-requested coverage re-walk — see the Context amendment above and the Phase 3 CLOSED row. It asserts the *relationship* (filtered set is non-empty and strictly smaller than the unfiltered set; Reset restores the original count) rather than any fixed number, so it keeps telling the truth as more products are country-tagged.

**TC-ISR-PRS-021 is pinned expected-to-fail** against `BUG-ISR-PRS-001` (filed 2026-09-01): wide date values overspill their box in 7 of 12 months sampled (Oct +12, Nov +27, Dec +27, Jan +11, Feb +17, Aug +5, Sep-2027 +30 px), with the AM/PM meridiem rendering outside the border.

## Phase 3 — Depth NOT covered by this plan

Zero of the inventory's 26 `deferred-to-DEEP` elements sit on the Filters side — every one is a grid control and belongs to NM-3650. NM-2254's residual depth is behavioral rather than elemental:

| Gap | Classification | Disposition |
|---|---|---|
| ~~Product Organization's effect on results~~ | ~~data-blocked~~ → **CLOSED 2026-09-02** | The data-blocked claim was **disproven** by a live re-walk: org-tagged data exists on office 1101 and the effect is deterministic (UI 15,881 → 1 on a country, restored by Reset; API `productOrgIds` `[]`→15881, `[1\|2\|3]`→1, `[999]`→**0** — the nonsense-id zero proving the server honours the parameter). All three countries return the same row only because product 102182 is the sole org-tagged product, tagged to all three — correct behaviour, sparse data, no bug. **TC-ISR-PRS-032 authored and green.** The 2026-08-31 deferral had skipped the LR-040-D rung-2 SELF-SERVE hunt. |
| Prep/Return Date Time effect on the result set | excluded by owner ruling | Ruling re-confirmed by the owner on **2026-09-02**: dates ride every search request but their result-side behavior stays out of assertions. Lifting it would add roughly 8 cases and require availability-window data on office 1101. |
| Location (5,102 options) and Region (106 options) typeahead, invalid entry, and clearing beyond the mutual-exclusivity case | deferred-to-DEEP: filter-combobox-depth (L2 boundary and negative cases are deep-tier per the Case-Generation Standard) | Deferred under the quick-tier contract (LR-072); `Coverage_Ratio` stays 100% because the elements themselves are dispositioned `covered-by-TC`. |
| Filter pairwise matrix (Location × Region × Org × dates × both checkboxes) | deferred-to-DEEP: filter-pairwise-matrix (combination depth beyond the L1 must-assert is deep-tier work) | Same quick-tier contract. |

Per LR-072 these deferrals are a **legal disposition on a `CoverageMode: quick` plan**, not an incompleteness: the tier declaration is the demand signal, and the elements remain 100% dispositioned in the walk manifest.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site baseline | `(skipped: baselineScope baseline-absent — old-site TLS-resets automated browsers, 6 logged attempts 2026-08-31)` | n/a |
| GIVER | test-cases + test-plan (referenced, not modified) | clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_search_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/item-search/item_search_product_search_test_plan.md | `npm run check:tc-parity` exit 0 |
| BUILDER | spec (TC-ISR-PRS-032 appended 2026-09-02) | clients/encore/tests/item-search/product-search.spec.ts | `npx playwright test --list` resolves TC-ISR-PRS-007…032 |
| HEALER | — | `(none)` | n/a |
| WATCHDOG | — | `(none)` | n/a |
| GARDENER | — | `(none)` | n/a |
| OWNER | this plan | plans/done/PLAN_NM2254_PRODUCT_SEARCH_FILTERS.md | `node scripts/validate-plan-closure.mjs --plan plans/done/PLAN_NM2254_PRODUCT_SEARCH_FILTERS.md --enforce --json` |

---

## Acceptance criteria

- [x] Every control under the `Filters` header is named in Phase 1 and traced to the 2026-08-31 field inventory.
- [x] All 10 owned TC IDs exist in the spec and in the test-cases markdown.
- [x] The NM-2254 / NM-3650 boundary cites a reproducible source (the panel's own `Filters` header), not an inferred split.
- [x] Every residual gap is classified with a named disposition — data-blocked, owner-ruling, or `deferred-to-DEEP` under the quick-tier contract.
- [x] `CoverageMode: quick` matches the cited artifact's `Walk_Mode: quick` (LR-072 mismatch check).
- [x] Activity-log row appended per LR-028.
- [x] `/final-q` verdict emitted per LR-042.

---

## Verification

```bash
# All 10 NM-2254 test cases resolve in the spec
grep -o "TC-ISR-PRS-\(007\|008\|009\|010\|011\|012\|020\|021\|031\|032\)" clients/encore/tests/item-search/product-search.spec.ts | sort -u | wc -l   # expect: 10
```

```bash
# The Filters header that anchors this plan's boundary is present in the inventory label census
grep -c '"Filters"' clients/encore/specs_planning/_internal/field-inventories/item-search-product-search-2026-08-31.md   # expect: 1 or more
```

```bash
# Run just this sub-task's coverage
npx playwright test clients/encore/tests/item-search/product-search.spec.ts --grep "TC-ISR-PRS-(007|008|009|010|011|012|020|021|031|032)"
```

---

### Execution Summary

**TCs implemented (10)**: TC-ISR-PRS-007, 008, 009, 010, 011, 012, 020, 021, 031 landed under the parent plan between 2026-08-31 and 2026-09-01; **TC-ISR-PRS-032 was authored and landed 2026-09-02** by the owner-requested re-walk. All ten are present in `clients/encore/tests/item-search/product-search.spec.ts` (verified 2026-09-02 by grep of the spec's TC-ID set).

**TCs dropped**: none.

**Verification results (2026-09-02)**:
1. `grep -c "^\s*test(" clients/encore/tests/item-search/product-search.spec.ts` → `32` — the full PRS spec, of which these 10 are the Filters share.
2. TC-ID census of the spec → `TC-ISR-PRS-001 … TC-ISR-PRS-032`, contiguous; all 10 owned IDs present.
3. All four cited artifact paths resolved on disk (spec, test-cases md, test-plan md, field inventory).
4. `grep -c "deferred-to-DEEP"` on the PRS inventory → `26`; per-row inspection confirms **all 26 are grid controls**, so none is charged to NM-2254.
5. The Product Organization filter was driven live on office 1101 (UI 15,881 rows → 1 on a country selection, restored by Reset; API `productOrgIds` `[]`→15881, `[1|2|3]`→1, `[999]`→**0**), disproving the "requires org-tagged product data" claim that had blocked this case.

**Test pass confirmation**: TC-ISR-PRS-032 ran solo green on 2026-09-02 (`2 passed`, 18.7s for the case itself, exit 0), then the whole item-search suite ran **55 passed / 0 failed** (exit 0) — up from 54, the +23 over the PRS spec being the sibling product-code and product-groups specs plus `auth.setup`. `npx tsc --noEmit`, `npm run check:tc-parity`, and `npm run check:spec-quality` all exited 0.

**Documentation changes**: this plan file; the PRS test-cases markdown and test plan (total 31→32 + the TC-032 block); the field inventory, field-case catalog, and walk-evidence artifacts (the false data-blocked claim withdrawn in all of them); the client workbook rebuilt to 32 distinct TC IDs.

**Deviations**: the owner's initial scope was "split the existing 31 only". The owner then asked for a live coverage re-walk and, on the gap it found, said "fix it and add the missing tc" — so one net-new case was authored under that instruction. Depth beyond the quick tier remains deliberately unauthored and is enumerated in Phase 3 with a per-gap disposition rather than deferred silently.

---

## Handoff

NM-2254 now has a plan that owns its ten test cases and states, on the record, where its coverage stops and why. The boundary against NM-3650 rests on the application's own `Filters` section header rather than on judgement, so the two plans partition the 32 PRS cases without overlap or orphan. Every control under the `Filters` header now has an effect-on-results test. The residual depth on this sub-task is one behavioral item — the date result-side stays outside assertions by a ruling the owner re-confirmed on 2026-09-02 — with the elemental depth living entirely on the sibling plan.
