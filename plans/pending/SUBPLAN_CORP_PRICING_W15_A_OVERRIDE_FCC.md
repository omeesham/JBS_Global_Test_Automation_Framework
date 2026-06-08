# SUBPLAN_CORP_PRICING_W15_A_OVERRIDE_FCC — Product Group Override screen, full FCC

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

**WAVE-1.5 (F-WV15).** Full field-coverage (FCC) of the **Product Group Override** screen (reached via "Pricing Override"), per-field-type per `field-case-generation.md`. The screen is **live but absent from the DOCX** — so per master Doctrine 2 the **live DOM is the oracle**, every test asserts observed reality, and the undocumented-screen + validation-rule divergences are RAISED (Q-WV15-1, raised by WV1.5-0) rather than encoded as assumed intent. Consumes WV1.5-0's `corporate-pricing-override-*` field-inventory + the scaffolded `corporate-pricing-override.page.ts` / selectors / `override.ts` data / Override fixture.

**Why a distinct subplan (no redundancy):** the Override screen is a **distinct node** from Search (0NN) / Strategy (1NN) / Detail (2NN). Its `Override Price` / `Max Discount %` numeric fields **reuse the numeric-BVA pattern** from the 1443 Detail FCC stub (`field-case-generation.md` numeric row), but on a different screen / fixture / TC band — reuse, not duplication.

**Activation trigger**: WV1.5-0 closed (inventory + scaffold exist).

---

## Bootstrap

**Identity**: GIVER (FCC catalog + test-cases + test-plan + XLSX) → BUILDER (selectors fill-in + spec) → HEALER (RCA if failures) → WATCHDOG (parity). Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/rca` (if failures), `/final-q`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_W15_0_RECON.md`, the `corporate-pricing-override-*` field-inventory, `field-case-generation.md` (FCC taxonomy), `clients/encore/src/utils/field-case-runner.ts` (`saveAndVerifyCase` — MANDATORY for save-cycle FCC), `.claude/rules/{specs,angular,inventory}.md` (LR-009 revert, LR-011 NaN reload, LR-019 per-test baseline, LR-022 no hardcoded counts, LR-036 boolean).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm WV1.5-0 DONE: `corporate-pricing-override-*` inventory + `corporate-pricing-override.page.ts` + Override fixture exist. 2. **POM-shape gate** (tests/ + src/data/corporate-pricing/ + src/fixtures/ present). 3. LR scan: LR-ENC-002 (FCC parity structural), LR-009, LR-011, LR-019, LR-022, LR-036, LR-040, LR-051/052. 4. `BrowserTool=cli`, `-s=cpr-override-fcc`. Mutation uses the **Override fixture** (F1) with bounded-retry `ensureDefaultState()` restore.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume WV1.5-0 baseline-absent note. `## Baseline diff` = "baseline-absent; intent oracle = live DOM (undocumented screen; intent confirmation pending Q-WV15-1)".

---

## Phase 1+ — FCC scope + seed list (full catalog on activation, from the WV1.5-0 inventory)

**Per-field-type FCC seed (grep-verifiable; exact cases authored from the live inventory — NOT invented here):**
- **Equipment / Labor tabs**: each tab renders its own grid; tab-switch preserves filters or resets (observe + assert); content per tab distinct.
- **Location selector** (left panel): select a location → grid scopes; clear/Active-only interaction (dropdown / each-option row, LR-025 if large).
- **Currency filter** (`ALL` + each option): each option narrows; `ALL` restores (dropdown row).
- **`Active only` checkbox**: toggle on→filters to active, off→restores (checkbox toggle+revert row).
- **Grid filter search** (`Filter Product Groups Override…`): BVA (min/max len), special chars, empty, whitespace, no-match (plain-text row); React controlled-input fill pattern (reuse search page's proven setter).
- **`Override Price`** (numeric): BVA 0 / negative / max / decimals / very-large / currency-format boundary; non-numeric → NaN reload guard (LR-011); revert-to-original → Save disabled (LR-009). **Reuses the 1443 numeric pattern.**
- **`Max Discount %`** (numeric): BVA 0 / negative / >100% / decimals; same NaN + revert guards.
- **`Active`** boolean column: render format MCP-verified (LR-036).
- **Save-cycle**: edit → `saveAndVerifyCase()` → reload → persisted-value assertion → restore fixture. Save dialog-gated handling reused from base.
- **Empty state** (`No results`): a filter combination yielding zero rows renders the empty state correctly.
- No hardcoded structural row counts vs the grid (LR-022) — content-anchored reads.
- TC band: `TC-LOC-CPR-5NN` (Override).

Full field-case-catalog + test-cases MD (`specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md`) + test-plan (`…/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md`, Selector-Mapping table) + spec (`clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts`, FCC two-describe shape per LR-ENC-002) + XLSX rebuild — authored on activation, all landing in the SAME change (LR-ENC-002 structural parity).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: reuses WV1.5-0 baseline-absent + override field-inventory; no net-new walk artifact)` | grep baseline artifact |
| GIVER | Override FCC test-cases + test-plan + XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | Override spec (FCC) | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` | `npx playwright test --list` resolves all `TC-LOC-CPR-5NN` |
| HEALER | per-fix MD Status sync (if RCA-driven) | `(skipped: conditional — only if a first-run failure needs RCA; MD row synced then)` | `npm run check:tc-parity` exit 0 |
| WATCHDOG | (parity folded into WV1.5-99) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] WV1.5-0 inventory + scaffold consumed; Override FCC catalog derived from the **live inventory**, not invented.
- [ ] Per-field-type coverage: tabs, location, currency, Active-only, filter search, Override Price + Max Discount % numeric BVA, Active boolean, save-cycle, empty state — each traced to an inventory field OR labelled `[inference]`.
- [ ] Save-cycle tests use `saveAndVerifyCase()`; mutation restores the **Override fixture** (proven across re-runs, zero drift).
- [ ] No hardcoded structural counts (LR-022); LR-009 revert + LR-011 NaN guards present where applicable.
- [ ] Spec ↔ MD ↔ XLSX parity (LR-ENC-002 structural): `check:tc-parity` exit 0; workbook builds + lints clean (LR-ENC-004); suite green.

---

## Handoff

Wave-1.5 Override-screen FCC. Distinct node (5NN), reuses the 1443 numeric pattern on a separate screen/fixture. Hands off to WV1.5-99 closure.
