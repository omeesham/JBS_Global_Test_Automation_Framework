# SUBPLAN_CORP_PRICING_W15_B_TOOLBAR_IO_FCC — Export/Import/Loc-Pricing/Grid-Options, trigger-level FCC

**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_W15_0_RECON.md
**Blocks**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-1.5 (F-WV15).** Trigger-level field-coverage of the Corporate-Pricing **toolbar I/O affordances**: **Export ▾** (4 variants), **Import ▾** (4 variants), **Loc Pricing Export**, **Loc Pricing Import**, and the **Grid Options** gear (column show/hide/reorder). These are live but **undocumented** (Q-WV15-2, raised by WV1.5-0) → live = oracle, divergences raised. Consumes WV1.5-0's `corporate-pricing-toolbar-io-*` field-inventory.

**Scope boundary (Q3 decision — NO real file I/O):** this subplan covers **trigger + variant enumeration only** — dropdown opens, all variants present, each variant fires the **correct action/endpoint** (assert via `playwright-cli network` / navigation), and Grid-Options column toggle + persist-on-reload. **Real download/upload round-trip** (asserting downloaded file content/format, uploading fixture files, import validation/error/success) is **explicitly deferred** to `SUBPLAN_CORP_PRICING_EDGE_P3.md` (grep-verifiable LR-040(b) recipient) — no download-dir/fixture-file infra is built here.

**No redundancy:** these affordances were previously gestured at by a single vague EDGE_P3 line ("Export/Import/Loc-Pricing/Grid-Options deep behavior"); that line is **redirected** to this subplan (EDGE now holds only the deferred real-I/O round-trip + its existing stress/edge scope). The **`+New ▾`** dropdown is NOT in scope — it is already FULL P1 (TC-LOC-CPR-016/017) and its create-flow destination is owned by `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md`.

**Activation trigger**: WV1.5-0 closed (toolbar-io inventory exists).

---

## Bootstrap

**Identity**: GIVER (catalog + test-cases + test-plan + XLSX) → BUILDER (trigger+variant helper + spec) → HEALER (RCA if failures) → WATCHDOG (parity). Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/rca` (if failures), `/final-q`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_W15_0_RECON.md`, the `corporate-pricing-toolbar-io-*` field-inventory, `field-case-generation.md` (dropdown each-option row), `clients/encore/src/selectors/corporate-pricing/search.ts` (toolbar selectors already mapped: `btnExport/btnImport/btnLocPricingExport/btnLocPricingImport/btnGridOptions/mnu*`), `.claude/rules/{specs,browser-tool,inventory}.md` (LR-033 network RCA, LR-036, LR-052).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm WV1.5-0 DONE: `corporate-pricing-toolbar-io-*` inventory exists. 2. **POM-shape gate**. 3. LR scan: LR-ENC-002, LR-033 (network assertions), LR-040, LR-052. 4. `BrowserTool=cli`, `-s=cpr-toolbar-fcc` (network capture for endpoint-fire assertions).

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume WV1.5-0 baseline-absent note. `## Baseline diff` = "baseline-absent; intent oracle = live DOM (undocumented toolbar behavior; intent pending Q-WV15-2)".

---

## Phase 1+ — FCC scope + seed list (full catalog on activation, from the WV1.5-0 inventory)

**Trigger-level FCC seed (grep-verifiable; exact endpoints/variants from the live inventory):**
- **Export ▾**: dropdown opens; **all 4 variants present** (`All Equipment Pricing`, `All Labor Pricing`, `All Equipment Max Discount`, `All Labor Max Discount`); each variant click fires the correct action/endpoint (assert via `network`); menu dismisses on outside-click (dropdown each-option row).
- **Import ▾**: dropdown opens; same 4 variants present; each fires the correct import-trigger/endpoint (trigger only — file-chooser opened, NOT a real upload).
- **Loc Pricing Export** / **Loc Pricing Import**: each button fires its action/endpoint (trigger only).
- **Grid Options** gear: opens the column popover; each toggleable column hides/shows in the grid; reorder (if supported) reflected; **persist-on-reload** (column state survives reload).
- **DEFERRED to EDGE_P3 (LR-040(b)):** real download round-trip (`waitForEvent('download')` + assert file/format per variant) + real import upload (fixture files, validation/error/success). Grep-verifiable line lives in `SUBPLAN_CORP_PRICING_EDGE_P3.md`.
- TC band: `TC-LOC-CPR-6NN` (toolbar I/O).

**BUILDER must-build (light, reuse-first per ALL-026):** a `corporate-pricing.page.ts`-level (or override/search page) **trigger+variant-assert helper** — open a `▾` menu, enumerate items, assert each fires the expected endpoint — plus a Grid-Options popover helper (open / toggle column / read visible columns). NO file-download/upload helper (deferred). Full catalog + MD + test-plan + spec (`clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`, FCC two-describe per LR-ENC-002) authored on activation, all in the SAME change.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: reuses WV1.5-0 baseline-absent + toolbar-io field-inventory; no net-new walk artifact)` | grep baseline artifact |
| GIVER | toolbar-I/O FCC test-cases + test-plan + XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_toolbar_io_test_plan.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | trigger+variant helper + toolbar-I/O spec | `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts` | `npx playwright test --list` resolves all `TC-LOC-CPR-6NN` |
| HEALER | per-fix MD Status sync (if RCA-driven) | `(skipped: conditional — only if a first-run failure needs RCA; MD row synced then)` | `npm run check:tc-parity` exit 0 |
| WATCHDOG | (parity folded into WV1.5-99) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] WV1.5-0 toolbar-io inventory consumed; variants/endpoints taken from the **live walk**, not invented.
- [ ] Export ▾ (4) + Import ▾ (4) + Loc Pricing Export/Import + Grid Options covered at **trigger level** (dropdown opens, variants present, correct endpoint fires; column toggle + persist).
- [ ] Real download/upload round-trip explicitly **deferred** with a grep-verifiable line in `SUBPLAN_CORP_PRICING_EDGE_P3.md` (LR-040(b)) — NOT bare-deferred.
- [ ] `+New ▾` NOT re-covered (cross-ref S1 P1 + 1440); no overlap.
- [ ] Spec ↔ MD ↔ XLSX parity (LR-ENC-002): `check:tc-parity` exit 0; workbook lint clean (LR-ENC-004); suite green.

---

## Handoff

Wave-1.5 toolbar-I/O FCC (6NN), trigger-level only; real file I/O deferred to EDGE_P3. Hands off to WV1.5-99 closure.
