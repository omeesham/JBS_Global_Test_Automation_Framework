# SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK — New Pricebook create-mode (GATED STUB)

**Status**: PENDING
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

**GATED STUB (F18).** NM-1440 "UI: New Pricebook" is a full DOCX story (P1 by priority), but live recon (master D3) found the New Pricebook page **not built** ("New" click did not navigate). This file exists NOW so every deferral pointing at it — S1's New-Pricing route-param (F2c) and S3's New-Pricebook-mode drag/drop ADD — is **grep-verifiable per LR-040(b)**, not a phantom handoff. Full GIVER→BUILDER design is authored on **activation**, when a walk confirms the page shipped. Until then this stub holds scope + seed list only (authoring now would be assumption-laden, forbidden by Doctrine 1).

**Activation trigger**: walk-evidence records 1440 build-status = BUILT with live evidence. Until BUILT, this subplan stays PENDING-gated and is NOT executed.

---

## Bootstrap

**Identity**: GIVER (Phase 1) → BUILDER (Phase 2) → HEALER (Phase 3, conditional) → WATCHDOG (Phase 4) on activation. Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/rca` (if failures), `/final-q`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_00_FOUNDATION.md`, `.claude/rules/{inventory,specs,angular,browser-tool,data}.md`, `clients/encore/CLAUDE.md` (LR-ENC-001/002/003, LR-012/017/036), `field-case-generation.md`.

---

## Phase 0 — Dependency + browser-tool + activation gate (MANDATORY)

1. Confirm S0 DONE. 2. **Activation gate**: confirm walk-evidence records 1440 = BUILT; if NOT built → HALT (stay gated, do not author). 3. LR scan: LR-ENC-001, LR-017, LR-040, LR-029. 4. `BrowserTool=cli`, `-s=cpr-newpricebook` on `clients/encore/.auth/encore-state.json`.

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
- **New-Pricing equipment/labor route-param destination** — the DOCX "Must" S1 (1445) deferred here (DOCX R1445-4, line 18).
- TC band: `TC-LOC-CPR-3NN` (New Pricebook).

Full field-inventory + test-cases + test-plan + specs authored on activation, same shape as S1/S2/S3 (mutation uses a dedicated create-mode fixture, NOT `strategyFixture`/`detailFixture`).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY on activation)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: stub — reuses S0 baseline-absent artifact; confirmed net-new on activation)` | grep baseline artifact |
| GIVER | test-cases/test-plan (on activation) | `(skipped: stub — field-inventory + test-cases authored on activation when 1440 ships; the seed list above is the grep-verifiable LR-040(b) recipient)` | `npm run check:tc-parity` exit 0 (on activation) |
| BUILDER | spec/page/selectors/data (on activation) | `(skipped: stub — selectors/page/spec/data authored on activation only)` | n/a until activation |
| HEALER | (none until activation) | `(none)` | n/a |
| WATCHDOG | (none until activation) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] (STUB) Scope + 25-helper seed list present and grep-verifiable per LR-040(b) — satisfied by Phase 1+ above.
- [ ] (ON ACTIVATION) 1440 = BUILT confirmed in walk-evidence BEFORE any authoring.
- [ ] (ON ACTIVATION) Full GIVER→WATCHDOG cycle per S1/S2/S3 shape; `check:tc-parity` exit 0; suite green.

---

## Handoff

Gated stub for NM-1440. Holds the New-Pricing route-param (from S1) + New-Pricebook-mode ADD (from S3) deferrals as grep-verifiable items. Activates when the New Pricebook page ships.
