# SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK — New Pricebook create-mode (NM-1440 — PRIORITY; page BUILT per S0/D3)

**Status**: DONE
**Executed**: 2026-06-09
**Priority**: P1
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_00_FOUNDATION.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-1.5 PRIORITY (F-WV15) — the core "add" JIRA story.** NM-1440 "UI: New Pricebook" is a full DOCX story; **S0 corrected D3 to BUILT** (the New Pricebook page IS live, route-param `?type=equipment|labor`). This is **no longer a gated stub** — it runs in the Wave-1.5 priority wave (the "add" / create flow is the main thing needed first). It also absorbs S1's New-Pricing route-param (F2c) and S3's New-Pricebook-mode drag/drop ADD (LR-040(b)). Full GIVER→BUILDER design is authored from the **live walk** of the create page + its **two options** (Equipment Pricing / Labor Pricing) and the submodules inside each — NEVER assume field shape, walk it (Doctrine 1).

**Activation trigger**: page is BUILT (S0/D3) → runs now. Phase-0 **re-confirms BUILT on the first walk** (NEVER-ASSUME) — HALT only if the page is genuinely absent.

---

## Bootstrap

**Identity**: GIVER (Phase 1) → BUILDER (Phase 2) → HEALER (Phase 3, conditional) → WATCHDOG (Phase 4) on activation. Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/rca` (if failures), `/final-q`.
**Bug doctrine (master Doctrine 2 — applies while field-testing every case below)**: if any behavior looks suspicious or buggy (a control that won't react, a Save that silently no-ops, a field that accepts a negative/invalid value), follow the doctrine — record it as an `/encore-questions` clarification when the cause is unclear (permission-locked? interaction step missing?), or file per LR-034 once it reproduces in the runner (LR-044). Never silently absorb it; at minimum catch the bugs visible in these cases. (W15-0 modeled this — it raised Q-WV15-1 instead of false-filing.)
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_00_FOUNDATION.md`, `.claude/rules/{inventory,specs,angular,browser-tool,data}.md`, `clients/encore/CLAUDE.md` (LR-ENC-001/002/003, LR-012/017/036), `field-case-generation.md`.

---

## Phase 0 — Dependency + browser-tool + activation gate (MANDATORY)

1. Confirm S0 DONE. 2. **Re-confirm BUILT** on the first walk (S0/D3 says BUILT — verify live; HALT only if genuinely absent — NEVER-ASSUME). 3. LR scan: LR-ENC-001, LR-017, LR-040, LR-029, LR-034/LR-030/LR-044 (bug doctrine). 4. `BrowserTool=cli`, `-s=cpr-newpricebook` on `clients/encore/.auth/encore-state.json`. 5. **POM-shape gate**: assert `tests/corporate-pricing/` + `src/data/corporate-pricing/` + `src/fixtures/pages.fixture.ts` exist (restructure landed); HALT if the tree is half-moved.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume S0 baseline-absent artifact. `## Baseline diff` = "baseline-absent; intent oracle = DOCX NM-1440".

---

## Phase 1+ — Scope + seed list (full GIVER→WATCHDOG design on activation)

**Seed cases — grep-verifiable deferred items (DOCX NM-1440 + 25 XLSX helpers `TC-ENC-PRC-1440-001…025`):**
- R1440-1 RBAC: Revenue Management role required to access/save.
- R1440-2 Price Book Name mandatory — Save blocked if null/empty.
- R1440-3 Price Book Type dropdown (Equipment | Labor); R1440-4 Price Year required; R1440-5 Currency defaults to USD.
- R1440-6/7 multi-strategy add (Strategy Name + Type, appended to list + summary view).
- R1440-8 Save commits header + strategies + selected product groups; R1440-9 Empty-Shell (Save handles empty product-group array gracefully).
- **New-Pricebook-mode product-group ADD** (double-click + drag-drop) — the behavior S3 (1443) deferred here (DOCX R1443-2 / R1443-9).
- **New-Pricing equipment/labor route-param destination** — the DOCX "Must" S1 (1445) deferred here (DOCX R1445-4, line 18). **Scope boundary (no dup):** the `+New ▾` toolbar affordance + its Equipment/Labor dropdown *presence* is already FULL P1 (TC-LOC-CPR-016/017) and re-touched by Wave-1.5's toolbar surface; THIS subplan owns only the create-flow **destination** page (header / strategies / Save / New-Pricebook-mode drag-drop ADD) — it does NOT re-cover the dropdown itself.
- **FCC each create option separately**: the Equipment Pricing flow AND the Labor Pricing flow (the two `+New ▾` options), including the submodules inside each (header → multi-row strategies → product-group selection → Save) — walked + FCC'd independently.
- TC band: `TC-LOC-CPR-3NN` (New Pricebook).

Full field-inventory + test-cases + test-plan + specs authored on activation, same shape as S1/S2/S3 (mutation uses a dedicated create-mode fixture, NOT `strategyFixture`/`detailFixture`).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY on activation)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: net-new on e2e, no nav2 equivalent — reused S0 baseline-absent artifact clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md; recorded baselineScope baseline-absent in the field-inventory)` | grep baseline artifact |
| GIVER | test-cases / test-plan / field-inventory / divergences | clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_new_pricebook_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_new_pricebook_test_plan.md<br>clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-new-pricebook-2026-06-09.md<br>`(skipped: XLSX workbook rebuild blocked by 27 pre-existing cross-module vocab-lint hits + 6 TC-LOC-MGH md gaps — none in this subplan; deferred to spawned chip task_6ac2db33; the 30 TCs are spec+MD parity-clean and the new content is lint-clean)` | `npm run check:tc-parity` (spec↔MD clean for CPR-3NN; XLSX gap is pre-existing-debt, see Summary) |
| BUILDER | spec / page object / selectors / data | clients/encore/tests/corporate-pricing/corporate-pricing-new-pricebook.spec.ts<br>clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts<br>clients/encore/src/selectors/corporate-pricing/new-pricebook.ts<br>clients/encore/src/data/corporate-pricing/new-pricebook.ts | `npx playwright test --list` resolves 30 TC-LOC-CPR-301..330 |
| HEALER | (none — spec passed first run, no RCA/fix needed) | `(none)` | n/a |
| WATCHDOG | divergence clarifications raised (Doctrine 2) | clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-newpricebook-divergences-2026-06-09.md | grep CPR-1440-Q1..Q5 present |
| GARDENER | shared-primitive dedup (ALL-026) | clients/encore/src/pages/corporate-pricing/corporate-pricing.page.ts | `npm run typecheck` exit 0 |

---

## Acceptance criteria

- [x] 1440 = BUILT confirmed on the live walk BEFORE authoring (page title "New Pricebook | Navigator" at `/add?type=equipment`).
- [x] Full GIVER→BUILDER→(HEALER n/a)→WATCHDOG cycle: field-inventory + test-cases + test-plan + divergences + selectors + page object + data + spec, all authored.
- [x] All 25 XLSX helpers `TC-ENC-PRC-1440-001..025` (+ deferred `1443-010`) verified/corrected against live DOM → 30 `TC-LOC-CPR-301..330`; helper ledger complete (21 covered / 3 corrected / 3 NOT-AUTOMATED-IN-CI / 1 NOT-AUTOMATABLE / 1 absorbed).
- [x] Spec green: 30/30 `TC-LOC-CPR-301..330` passed individually (31 incl. auth-setup) AND all 30 passed within the 94-test full CPR suite (the lone full-suite failure was pre-existing intermittent `TC-LOC-CPR-217` in the Detail spec — passed on isolated re-run, not this work).
- [x] spec↔MD parity clean for the 30 CPR TCs; new content lint-clean; `typecheck` exit 0.
- [ ] `check:tc-parity` exit 0 — **deferred (user-authorized 2026-06-09)**: blocked by 27 PRE-EXISTING cross-module vocab-lint hits (6 modules) + 6 `TC-LOC-MGH-020..025` md gaps that block the workbook rebuild; spun off to chip `task_6ac2db33`. Not introduced by this subplan.

---

## Handoff

Activated NM-1440 (BUILT). New Pricebook create flow fully automated for BOTH options (Equipment + Labor): 30 green TCs, field-inventory + test-cases + test-plan + selectors + page object + data, 5 divergences raised (CPR-1440-Q1..Q5), shared `setReactInput` primitive extracted to the base. No-commit design (create is UI-irreversible). The only open item is the XLSX/parity green, blocked by pre-existing cross-module deliverable debt — spun off to chip `task_6ac2db33`; once that lands, the 30 TCs flow into the workbook automatically (already in spec + MD).

---

## Execution Summary

**Executed**: 2026-06-09

- **Deliverable files**:
  - `clients/encore/tests/corporate-pricing/corporate-pricing-new-pricebook.spec.ts` (30 specs)
  - `clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts`
  - `clients/encore/src/selectors/corporate-pricing/new-pricebook.ts`
  - `clients/encore/src/data/corporate-pricing/new-pricebook.ts`
  - `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_new_pricebook_test_cases.md`
  - `clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_new_pricebook_test_plan.md`
  - `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-new-pricebook-2026-06-09.md`
  - `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-newpricebook-divergences-2026-06-09.md`
  - (modified) `clients/encore/src/pages/corporate-pricing/corporate-pricing.page.ts`, `clients/encore/src/selectors/corporate-pricing/index.ts`, `clients/encore/src/data/corporate-pricing/common.ts`, `clients/encore/src/fixtures/pages.fixture.ts`, `clients/encore/src/selectors/index.ts`
- **TCs implemented (30)**: `TC-LOC-CPR-301..330` — Equipment header/defaults/tabs (301–307), Name FCC (308–312), Year FCC (313–315), strategy add dialog (316–320), Save gating + no-commit reachability (321–324), product-group double-click ADD (325–327), Labor parity + catalog (328–330). All green ×2 (individual 31-pass + all 30 green in the full CPR suite).
- **Helper verification (25 XLSX `TC-ENC-PRC-1440-*` + `1443-010`)**: 21 covered as create-FCC; **3 CORRECTED** to live (007/008/009 → Type is disabled/route-fixed, not an in-page dropdown; 013 → decimal year accepted client-side; 020 → no strategy "Type" field); **3 NOT-AUTOMATED-IN-CI** (018/022/023 actual persistence — create is irreversible, no delete path); **1 NOT-AUTOMATABLE** (025 RBAC — single automation account); 0 dropped.
- **Live divergences raised (Doctrine 2 — not absorbed, not false-filed)**: CPR-1440-Q1 (Type disabled), Q2 (no strategy Type field), Q3 (Price Year accepts decimal/short client-side), Q4 (no UI delete for a created pricebook — irreversible), Q5 (≥1 strategy required to save).
- **Mutation safety**: Save = `POST /navigator/api/location/pricing/save` → "Save Changes" dialog → redirect to `/details/<new-guid>`; NO UI delete/deactivate anywhere → **NO-COMMIT spec** (asserts Save reachability + Cancels). One record (`QA-AUTODEL-20260609-EQ`) was created during the endpoint-discovery walk and disclosed in the field-inventory + Q4 (UI-irreversible).
- **Stack findings**: React/Next light DOM (native value-setter required — `.fill()` no-ops React state); LR-056 confirmed (the `…/add?type=` POSTs are RSC framework noise; real save is `/navigator/api/location/pricing/save`); Unicode ✔ booleans (LR-036); type-specific product-group catalogs (Eq ≈3707 / Labor ≈547).
- **Structure**: new `np`-prefixed selector partition (6th CPR partition, collision-checked); `setReactInput` + `gotoNewPricebook` added to `CorporatePricingBasePage` (ALL-026 dedup); fixture `corporatePricingNewPricebookPage` wired; `newPricebook: [300,399]` TC band added.
- **Deviations**: (1) `check:tc-parity` not exit 0 — blocked by 27 PRE-EXISTING cross-module vocab hits + 6 MGH md gaps (workbook self-lint fails the whole rebuild); user chose **defer** → spun off to chip `task_6ac2db33`; my content is spec+MD parity-clean + lint-clean. (2) HEALER phase a no-op (spec green first run). (3) Observed: `TC-LOC-CPR-217` (Detail spec) intermittent in the long workers=1 run — passed on isolated re-run (pre-existing timing fragility).
- **Parent**: stays PENDING per F16 auto-close exemption; this child's DONE line annotated in the master body.
