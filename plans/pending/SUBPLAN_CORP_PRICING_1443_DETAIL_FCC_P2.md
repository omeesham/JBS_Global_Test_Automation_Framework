# SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2 — Pricing Detail FCC field-coverage (Wave-2 STUB)

**Status**: PENDING
**Priority**: P2
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-2 STUB (F18).** FCC field-matrix for the Pricing Detail grid (NM-1443), priority P2 per Doctrine 1. Exists NOW so S3's `(b)` deferrals (numeric BVA/non-numeric/each-cell) point at a grep-verifiable recipient (LR-040(b)). Full design is authored **after Wave-1 closes** — consumes S3's detail field-inventory; detailing now = assumptions (Doctrine 1).

**Activation trigger**: Wave-1 closed P1-green; S3's detail field-inventory exists.

---

## Bootstrap

**Identity**: GIVER → BUILDER → HEALER → WATCHDOG on activation. Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/rca` (if failures), `/final-q`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_1443_PRICING_DETAIL_P1.md`, `field-case-generation.md` (numeric row), `.claude/rules/angular.md` (LR-009/011), the S3 detail field-inventory.

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm S4 (Wave-1 closure) DONE + S3 field-inventory exists. 2. LR scan: LR-ENC-002, LR-009 (revert), LR-011 (NaN reload), LR-022 (no hardcoded counts vs virtualized grid — F8), LR-040. 3. `BrowserTool=cli`, `-s=cpr-detail-fcc`. Mutation uses the `detailFixture` (F1) with restore.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume S0 baseline-absent artifact. `## Baseline diff` = "baseline-absent; intent oracle = DOCX NM-1443 + field-case-generation numeric row".

---

## Phase 1+ — Scope + seed list (full FCC design on activation)

**Seed FCC cases — grep-verifiable deferred items (from S3 `(b)` classification):**
- **New Price numeric BVA**: 0, negative, max, decimals, very-large, currency-format boundaries.
- **Max Discount numeric BVA**: 0, negative, >100%, decimals.
- **Non-numeric input** → NaN reload guard (LR-011); revert-to-original → Save disabled (LR-009).
- **Currency-format validation** (DOCX line 226): each invalid format surfaces correctly (note: "blocks Save with message" is the F6 inference — confirm HOW it surfaces).
- **Empty-override → Base-Price fallback** edge variants (DOCX line 247); read-only `Price` rejects edit.
- No hardcoded structural row counts vs the 591-row virtualized grid (LR-022, F8) — content-anchored reads.
- TC band: `TC-LOC-CPR-2NN` (Detail band, FCC slice — continues after S3's P1 IDs).

Full catalog + MD + test-plan + specs on activation; mutation restores `detailFixture` (F1).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY on activation)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: stub — reuses S0 baseline-absent artifact; net-new on activation)` | grep baseline artifact |
| GIVER | FCC test-cases/test-plan/XLSX (on activation) | `(skipped: stub — FCC numeric catalog + MD + test-plan authored on activation, seeded by S3 field-inventory; seed list above is the grep-verifiable LR-040(b) recipient)` | `npm run check:tc-parity` exit 0 (on activation) |
| BUILDER | FCC spec block (on activation) | `(skipped: stub — FCC describe block authored on activation only)` | n/a until activation |
| HEALER | (none until activation) | `(none)` | n/a |
| WATCHDOG | (none until activation) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] (STUB) Holds S3's numeric BVA/non-numeric/each-cell `(b)` deferrals as a grep-verifiable recipient (LR-040(b)) — satisfied by Phase 1+.
- [ ] (ON ACTIVATION) Wave-1 green + S3 field-inventory consumed; mutation restores `detailFixture`; no hardcoded counts (LR-022); `check:tc-parity` exit 0; suite green.

---

## Handoff

Wave-2 FCC stub for Pricing Detail. Holds S3's deferred numeric field-case matrix as grep-verifiable items. Activates after Wave-1 closes.
