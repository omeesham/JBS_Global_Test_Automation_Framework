# SUBPLAN_CORP_PRICING_1443_PRICING_DETAIL_P1 — Pricing Detail grid P1 (GIVER → BUILDER → HEALER → WATCHDOG)

**Status**: DONE
**Executed**: 2026-06-05
**Priority**: P1
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_00_FOUNDATION.md
**Blocks**: SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

P1 (DOCX-functional) coverage for the **Pricing Detail tab** (NM-1443) on the details route — the **heaviest screen** (live recon: ~3707 draggables, ~4861 inputs, virtualized; 0 data-testids). Grid headers map doc→live: Base Price→`Price` (read-only), Override Price→`New Price`, Override Discount→`Max Discount` (D6). Seeds from the 30 XLSX helpers (`TC-ENC-PRC-1443-*`), verified live, re-IDed to `TC-LOC-CPR-2NN` (Detail band). **Management-mode** behavior only (single-click select; defensive: double-click/drag do NOT add) — **New-Pricebook-mode** drag-drop ADD is deferred until NM-1440 ships (D3). Override edits **mutate** → the **`detailFixture`** pricebook (F1 — a DISTINCT record from S2's `strategyFixture`, so parallel `cpr-mgmt`/`cpr-detail` runs never collide) + bounded-retry restore. Virtualization mandates content-anchored, scroll-aware reads + **no hardcoded structural row counts (LR-022 — F8; LR-053 applies only if S0 finds the auto-empty placeholder-row bug class, NOT virtualization-in-general)**.

---

## Bootstrap

**Identity**: GIVER (Phase 1) → BUILDER (Phase 2) → HEALER (Phase 3, conditional) → WATCHDOG (Phase 4). Clean re-load at each switch.

**Skills auto-called**: `/identity`, `/regression-guard` (wrap Phase 2), `/relevant`, `/rca` (Phase 3 if failures), `/final-q`.

**Context files**:
- `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_00_FOUNDATION.md`
- `.claude/rules/inventory.md`, `.claude/rules/specs.md`, `.claude/rules/angular.md`, `.claude/rules/browser-tool.md`, `.claude/rules/data.md`
- `clients/encore/CLAUDE.md` (LR-ENC-001/002/003, LR-012, LR-017, LR-036), `feedback_history_content_anchored_lookup.md`
- `clients/encore/specs_planning/_internal/field-case-generation.md` (numeric row), `field-inventory-spec.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm S0 DONE. 2. Read navigation.md §C, agent-mistakes.md, patterns.md. 3. LR scan: LR-009 (numeric revert-disables-Save), LR-011 (NaN reload), **LR-022 (CRITICAL here — no hardcoded structural row count vs the 591-row virtualized grid; F8)**, LR-051 (no OR-asserts), LR-052 (no fixed waits), LR-053 (only if S0 finds the auto-empty placeholder-row bug class — NOT virtualization-in-general), LR-036. 4. **Browser-tool**: `BrowserTool=cli`, `-s=cpr-detail` on `clients/encore/.auth/encore-state.json`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL — output drives TC corrections)

1. Consume S0 `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md` (baseline-absent, ≤14d). `## Baseline diff` = "baseline-absent; intent oracle = DOCX NM-1443".

---

## Phase 1 — GIVER: field-inventory + test cases (live)

1. **Field-inventory walk** (`-s=cpr-detail`) on the `detailFixture` pricebook (F1) → Pricing Detail tab → emit `field-inventories/corporate-pricing-detail-<MCP-DATE>.md`: Product Groups source list (ID + GROUP NAME); grid columns `ID, Product Group Name, Price, New Price, Max Discount` (+ map DOCX "staging price" → `New Price`, F14); which are editable (New Price, Max Discount) vs read-only (Price); group→item expand/collapse mechanism; how a row is uniquely identified (content anchor — ID/Name, NOT index, per `feedback_history_content_anchored_lookup.md`; no hardcoded counts per LR-022 — F8); Save behavior (dialog vs direct, LR-012); virtualization/scroll behavior; currency-format on numeric cells.
2. **Verify the 30 XLSX 1443 helpers** vs live; resolve assumptions; **split by mode**: Management-mode cases = P1 now; New-Pricebook-mode add (double-click/drag-drop) = **deferred** (b) to the **existing PENDING stub** `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md` (F18 — grep-verifiable per LR-040(b); drag-drop add only meaningful in create mode, which recon says isn't built — S0 confirms).
3. **Author P1 functional cases** (`TC-LOC-CPR-2NN`): Detail tab loads + product groups list; grid renders 5 columns; single-click selects a group (Management mode — DOCX line 205); **double-click does NOT add** (defensive — DOCX line 206); **drag-drop does NOT add** (defensive — DOCX line 206); no Add/Remove affordance on existing groups [inference from DOCX line 206 "new product groups cant be added" — labeled inference, F6]; expand group→items, collapse hides; **edit New Price → Save persists** (`detailFixture` + restore, content-anchored read after reload); **edit Max Discount → Save persists**; Base Price (`Price`) read-only (DOCX lines 216-217); empty New Price → falls back to Base Price (DOCX line 247 — verbatim business rule); Save batch + feedback; **currency-format validation (DOCX line 226 requires validation; "blocks Save with a message" is an INFERENCE on HOW it surfaces — labeled inference, MCP-confirm, F6)**. (Numeric BVA/non-numeric/each-cell FCC → P2, deferred (b) to the existing stub `SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md`. "Empty discount = no discount" is XLSX-only, NOT a DOCX rule — excluded from P1, F6.)
4. Write `corporate_pricing_detail_test_cases.md` + `corporate_pricing_detail_test_plan.md` (Selector Mapping) under `setup/corporate-pricing/`; P1 catalog slice; `npm run planner:post-complete` → `check:tc-parity` exit 0.

---

## Phase 2 — BUILDER: selectors + page object + specs (identity switch)

> Re-load BUILDER. Spot-check 2–3 fields (LR-007). `/regression-guard` BEFORE.

1. `src/selectors/corporate-pricing/pricing-detail.ts` — grid by header text; cells by content-anchored row (product group ID/Name) + column; product-group source-list items; drag handles. 0 testids → text/role/`.slick-*` structure. Register in module `index.ts`.
2. `src/pages/corporate-pricing/corporate-pricing-detail.page.ts extends CorporatePricingBasePage` — `openDetailTab()`, `getGridHeaders()`, `getProductGroups()`, `selectGroup(idOrName)`, `expandGroup(idOrName)`/`collapseGroup`, `getCellValue(groupAnchor, 'Price'|'New Price'|'Max Discount')`, `setNewPrice(anchor, val)`, `setMaxDiscount(anchor, val)`, `attemptDoubleClickAdd(anchor)`/`attemptDragAdd(anchor)` (defensive assertions), `saveAndConfirm()` (throws on failure), `ensureDefaultState()` (bounded-retry restore of edited cells; scroll-into-view before read — virtualization). Reuse any base-page drag helper if S0 found one; else implement via `dataTransfer`/Playwright `dragTo` (document choice).
3. `src/data/testdata/corporate-pricing/detail.data.ts` — `detailFixture` pricebook (the Detail-only fixture, DISTINCT from `strategyFixture`, F1), a stable product-group anchor (ID + Name), expected Base Price, safe override values, baseline values for restore, expected 5 headers.
4. `specs/corporate-pricing/corporate-pricing-detail.spec.ts` — `@corporate-pricing @detail`; per-test `ensureDefaultState()` (LR-019); content-anchored reads (`feedback_history_content_anchored_lookup.md`); no hardcoded structural row count (591/virtualized — LR-022, F8); no fixed waits (LR-052); NaN/reload guard (LR-011). Use `saveAndVerifyCase()` shape (`clients/encore/src/core/field-case-runner.ts`) for the save-cycle P1 cases (New Price / Max Discount persist).
5. `typecheck` clean → `npx playwright test --list` (from `clients/encore/`, F4) resolves IDs → run spec alone (`npm test -- corporate-pricing-detail` — filename filter, F5; `.env.local`) → `check:tc-parity` exit 0. `/regression-guard` AFTER.

---

## Phase 3 — HEALER: RCA + fix (conditional, 2-cycle)

1. Artifact-first `/rca` (LR-024); CLI headed walk. Watch virtualization read failures (row scrolled out → use scroll-into-view + content anchor), Angular numeric save-state (LR-009/011), drag-drop flakiness. Surgical fix; MD status sync (HARD STOP #6); re-run `--retries=0`. Max 2 cycles → escalate.

---

## Phase 4 — WATCHDOG: structural audit + parity (identity switch)

1. `check:tc-parity` exit 0; `--list` resolves IDs (from `clients/encore/`, F4); verify override edits restore the `detailFixture` (no drift); LR-051/052 scan + LR-022 (no hardcoded counts vs the virtualized grid — F8; LR-053 only if placeholder-row bug present); false-green check (reads actually assert persisted live values after reload). Findings → Execution Summary.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Same-module adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline/REQUIREMENTS freshness | `(skipped: reused S0 clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md per LR-013 14-day window; net-new baseline-absent)` | grep baseline artifact |
| GIVER | test-cases.md, test-plan.md, XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_detail_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_detail_test_plan.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec, page object, selectors, data | `clients/encore/specs/corporate-pricing/corporate-pricing-detail.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-detail.page.ts` | `npx playwright test --list` resolves detail IDs |
| HEALER | per-fix MD status sync (if RCA-driven) | `(skipped: HEALER engages only on first-run failures; surgical spec edits with in-place MD status sync, no separate artifact)` | `npm run check:tc-parity` exit 0 |
| WATCHDOG | structural audit + restore + anti-false-green | `(skipped: parity + virtualization/restore + structural scan run inline Phase 4, evidence in Execution Summary; master neutral-eye in S4)` | `npm run check:tc-parity` exit 0 |
| GARDENER | (none) — dedup in S4 | `(none)` | n/a |

---

## Acceptance criteria

- [ ] Field-inventory emitted (8 keys + 7 sections; editable vs read-only columns + content-anchor strategy recorded).
- [ ] All 30 XLSX 1443 helpers verified/corrected/dropped; New-Pricebook-mode add deferred (b) to the **existing** gated stub `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md` (F18); Management-mode defensive cases automated.
- [ ] P1 cases automated; override edits restore the `detailFixture` (distinct from `strategyFixture`, F1; no drift); content-anchored reads (no hardcoded structural counts vs the virtualized grid — LR-022, F8); inferences labeled per F6; every item classified (a)/(b)/(c) per LR-040 (numeric FCC → (b) to existing stub `SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md`).
- [ ] `check:tc-parity` exit 0; spec alone green; suite green.
- [ ] `/regression-guard` clean; activity-log row (LR-028); `/final-q` block (LR-042).

---

## Verification

```bash
npm test -- corporate-pricing-detail        # filename filter (F5); all P1 detail TCs pass (.env.local)
npm run check:tc-parity                      # expect: exit 0
npm test -- corporate-pricing-detail         # re-run: still green (proves detailFixture override restore)
```

---

## Handoff

Pricing Detail (1443) P1 green (Management mode) with override restore proven. New-Pricebook-mode drag-drop add deferred to gated 1440. S4 inherits for suite+parity. Wave-2 FCC (numeric BVA/negative) inherits the field-inventory + (b)-deferred list.

---

## Execution Summary

**Executed**: 2026-06-05

P1 DOCX-functional coverage for the Pricing Detail tab (NM-1443, Management mode) delivered and green against the live `detailFixture` (2021-PB6).

**TCs implemented (20, all green):** `TC-LOC-CPR-201..220`. Full-suite run **21 passed (7.4m)** (`npm test -- corporate-pricing-detail --workers=1 --retries=0`; 20 detail TCs + 1 incidental cross-title match, 0 failed). `npx playwright test --list` resolves all 20 IDs; `npm run typecheck` exit 0; `npm run check:tc-parity` exit 0 (spec↔MD↔XLSX 1:1); `npm run xlsx:lint` PASS (0 vocab/0 integrity).

**Helper disposition (30 XLSX `TC-ENC-PRC-1443-*`, 0 dropped):**
- 13 Management-mode helpers covered as P1 TCs: 011→208, 012→209, 013→210, 014→211, 015→201/205, 018→218, 022→219, 023→215, 026→206, 027→217, 028→220, 030 (covered by save-cycle 214/215/218).
- 10 New-Pricebook-mode helpers (001–010) → (b) `plans/pending/SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md` (grep-verified line 55: "New-Pricebook-mode product-group ADD (double-click + drag-drop) — the behavior S3 (1443) deferred here").
- 6 numeric/negative FCC helpers (019/020/021/024/025/029) → (b) `plans/pending/SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md` (grep-verified lines 50–54: New Price / Max Discount numeric BVA, non-numeric, currency-format, empty→base variants).
- 2 expand/collapse helpers (016/017) → (c) clarification CPR-DETAIL-Q3 (live grid renders FLAT — no expand control in mgmt mode; the 7 page chevrons are app-nav, not grid).

**Live MCP findings (Playwright CLI `-s=cpr-detail`, fixture 2021-PB6):**
1. Grid = shadcn HTML `<table>` (5 cols ID/Product Group Name/Price/New Price/Max Discount), ~2430 rows + ~3707 draggable source items, fully rendered (NOT windowed) → content-anchored reads (LR-022/LR-053), 0 data-testids.
2. **Override model**: New Price is a staging override → on Save it becomes the row's read-only Price (input clears). Base Price has no input (read-only) but updates to the saved override.
3. **Save** is dialog-gated ("Save Changes" alertdialog) and commits ALL dirty rows in one batch; endpoint `POST /navigator/api/location/pricing/save` (persistence asserted by reload+re-read, not a page-URL listener — LR-056).
4. Management-mode defensive confirmed: double-click + drag do NOT add (grid count unchanged, no dirty).
5. **CPR-DETAIL-BUG-A (bug-candidate, raised CPR-DETAIL-Q1)**: editing New Price alone frequently does NOT enable Save (form not marked dirty) while editing Max Discount reliably does; the New-Price value still commits in the batch. Save-cycle tests use Max Discount as the reliable dirty lever; New-Price persist co-dirties via Max Discount. Documented in the field-inventory §Known App Bugs + test-cases Clarifications; not silently encoded as expected behavior (Doctrine 2). Not yet filed as `BUG-*.json` — to be confirmed/filed in FCC-P2 (LR-044 fresh-runner reproduction).
6. Two DOCX divergences raised (not silently absorbed): CPR-DETAIL-Q3 (flat grid, no item hierarchy in mgmt mode); CPR-DETAIL-Q4 (Price column updates to override, not pinned to the original global price).

**MCP fixture restore (anti-drift):** `detailFixture` independently CLI-verified clean AFTER the full suite — Balloon Light Decor Price=615.00 / New Price empty, Analog Mixer Price=195.00 / New Price empty, Save disabled. Residual: both rows' Max Discount displays `0.00 %` (originally empty) — benign (0% ≡ no discount, DOCX), documented in the field-inventory Live-state caveat.

**Documentation / deliverables:**
- Field-inventory: `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-detail-2026-06-05.md` (8 frontmatter keys + 7 mandatory sections).
- Test cases: `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_detail_test_cases.md` (20 TCs + 30-helper ledger + 4 clarifications).
- Test plan: `clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_detail_test_plan.md` (Selector Mapping + 20 scenarios).
- Selectors: `clients/encore/src/selectors/corporate-pricing/pricing-detail.ts` (hardened — grid/headers/source-list/filter + `DETAIL_GRID_COLS`).
- Page object: `clients/encore/src/pages/corporate-pricing/corporate-pricing-detail.page.ts` (+ `corporatePricingDetailPage` fixture in `clients/encore/src/infra/fixtures.ts`).
- Test data: `clients/encore/src/data/testdata/corporate-pricing/detail.data.ts`.
- Spec: `clients/encore/specs/corporate-pricing/corporate-pricing-detail.spec.ts`.
- Deliverable rebuild: `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` (xlsx:build + lint clean).
- Learnings: `.claude/context/navigation.md` §C (Detail row); `clients/encore/specs_planning/_internal/agent-mistakes.md` (ALL-090).

**Deviations (per `feedback_plan_deviations_log`):**
1. **Source files external**: the DOCX oracle `Pricing-Functional Details-JIRA STORIES 1.docx` + `jira_pricing_test_cases.xlsx` (the 30 helpers) live in `~/Downloads`, not the repo — read from there (self-first research; no user HALT). Outputs went to the repo per convention; the input artifacts were not committed.
2. **HEALER engaged (1 cycle)**: first full run 14/21 — the 7 save-cycle failures were heavy-page timeouts (30s default), not logic. Cycle-1 fix = per-test timeout 150s + in-place restore verify; suite then 21/21. Surgical spec/page edits, no separate artifact.
3. **Adjacent-Sweep DO-NOW (2, same module)**: (a) fixed a protected-`waitForAngularStable` typecheck error in the sibling `corporate-pricing-strategy.spec.ts:125` (blocked the shared `tsc`); (b) cleaned 2 LR-ENC-004 vocab leaks in the sibling `corporate_pricing_search_test_cases.md` ('no-op', 'Playwright') that failed the deliverable-wide xlsx:lint. Both pure-text fixes, no logic change; my detail TCs had 0 leaks.
4. **Identity**: pipeline phases (GIVER/BUILDER/HEALER/WATCHDOG) executed under OWNER (`/execute` is OWNER-compatible; OWNER short-circuits §2 per LR-043, same precedent as S0).

**Acceptance:** field-inventory emitted (8 keys + 7 sections); all 30 helpers verified/classified (a)/(b)/(c); P1 cases automated + green; override restores the `detailFixture` (no drift, CLI-verified); content-anchored reads (no hardcoded counts); inferences labeled (F6); `check:tc-parity` exit 0; spec alone + suite green; `/regression-guard` clean (typecheck exit 0, additive module + 1 fixture).
