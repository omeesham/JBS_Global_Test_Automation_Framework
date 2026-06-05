# SUBPLAN_CORP_PRICING_EDGE_P3 — Corporate Pricing edge cases (Wave-3 STUB)

**Status**: PENDING
**Priority**: P3
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md, SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md, SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-3 STUB (F18).** Edge / stress / cross-cutting coverage for the Corporate Pricing module, priority P3 per Doctrine 1 (P1 → P2 → P3). Exists NOW so any edge-class deferral from earlier waves points at a grep-verifiable recipient (LR-040(b)). Full design is authored **after Wave-2 (FCC) closes** — detailing now = assumptions (Doctrine 1).

**Activation trigger**: Wave-2 FCC subplans closed.

---

## Bootstrap

**Identity**: GIVER → BUILDER → HEALER → WATCHDOG on activation. Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/find-bugs` (adversarial edge), `/rca` (if failures), `/final-q`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, the 3 Wave-2 FCC subplans, all 3 field-inventories, `field-case-generation.md`.

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm the 3 Wave-2 FCC subplans DONE. 2. LR scan: LR-ENC-002, LR-022 (no hardcoded counts — F8), LR-051/052, LR-040. 3. `BrowserTool=cli`, `-s=cpr-edge`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume S0 baseline-absent artifact. `## Baseline diff` = "baseline-absent; intent oracle = DOCX + SFDPOT edge heuristics".

---

## Phase 1+ — Scope + seed list (full edge design on activation)

**Seed edge cases — grep-verifiable deferred items:**
- **Compound multi-filter** (Search): several filters + Search together; order independence; reset from compound state.
- **591-row virtualization stress** + content-anchored read integrity (scroll far, read off-screen rows via content anchor; LR-022, F8).
- **Drag-drop edge** (Detail New-Pricebook mode) — activates only when NM-1440 ships (cross-ref the 1440 stub).
- **Cross-field**: strategy×detail interactions; currency consistency header↔grid.
- **Accessibility**: keyboard nav, ARIA roles on grid/dialogs.
- **Export / Import / Loc Pricing Export-Import / Grid Options** deep behavior (the extra nav buttons from D3 — presence covered in S1 P1, behavior here).
- **RBAC**: Revenue Management role gate (read-only vs edit) where applicable.
- TC band: `TC-LOC-CPR-9NN` (edge).

Full catalog + MD + test-plan + specs on activation.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY on activation)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: stub — reuses S0 baseline-absent artifact; net-new on activation)` | grep baseline artifact |
| GIVER | edge test-cases/test-plan/XLSX (on activation) | `(skipped: stub — edge catalog + MD + test-plan authored on activation after Wave-2; seed list above is the grep-verifiable LR-040(b) recipient)` | `npm run check:tc-parity` exit 0 (on activation) |
| BUILDER | edge spec block (on activation) | `(skipped: stub — edge specs authored on activation only)` | n/a until activation |
| HEALER | (none until activation) | `(none)` | n/a |
| WATCHDOG | (none until activation) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] (STUB) Holds edge-class deferrals as a grep-verifiable recipient (LR-040(b)) — satisfied by Phase 1+.
- [ ] (ON ACTIVATION) Wave-2 FCC closed; full GIVER→WATCHDOG cycle; `check:tc-parity` exit 0; suite green.

---

## Handoff

Wave-3 edge stub. The LAST gating child — when this closes, the master parent flips to DONE (F16). Activates after Wave-2 FCC closes.
