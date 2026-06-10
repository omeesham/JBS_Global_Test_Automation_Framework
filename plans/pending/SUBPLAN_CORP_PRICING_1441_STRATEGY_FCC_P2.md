# SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2 — Strategy FCC field-coverage (Wave-2 STUB)

**Status**: PENDING
**Priority**: P2
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-2 STUB (F18).** FCC field-matrix for the Pricing Strategy tab (NM-1441), priority P2 per Doctrine 1. Exists NOW so S2's `(b)` deferrals (multi-row FormArray BVA/negative/each-type/delete-all) point at a grep-verifiable recipient (LR-040(b)). Full design is authored **after Wave-1 closes** — consumes S2's strategy field-inventory; detailing now = assumptions (Doctrine 1).

**Activation trigger**: Wave-1 **and Wave-1.5 (W15_99 closure)** closed; POM shape present; S2's strategy field-inventory exists.

---

## Bootstrap

**Identity**: GIVER → BUILDER → HEALER → WATCHDOG on activation. Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/rca` (if failures), `/final-q`.
**Bug doctrine (master Doctrine 2 — applies while field-testing every case below)**: if any behavior looks suspicious or buggy (a control that won't react, a Save that silently no-ops, a field that accepts a negative/invalid value), follow the doctrine — record it as an `/encore-questions` clarification when the cause is unclear (permission-locked? interaction step missing?), or file per LR-034 once it reproduces in the runner (LR-044). Never silently absorb it; at minimum catch the bugs visible in these cases. (W15-0 modeled this — it raised Q-WV15-1 instead of false-filing.)
**Jira defect cross-ref (UNVERIFIED leads — prove each on the live site before it becomes a test expectation OR a filing, LR-044)**: before raising/filing, check `clients/encore/specs_planning/_internal/jira-defect-crossref-2026-06-09.md` for an already-filed `NM-####` match on this screen (NM-2047 flag mutual-exclusion + IsLabor/Currency lock after create, NM-2059 duplicate strategy names allowed). It is an external AI's Jira-search output (mixed-env, statuses unreliable, some by-design) — reproduce live first, then cite the `NM-#` instead of re-discovering.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_1441_MGMT_STRATEGY_P1.md`, `field-case-generation.md` (multi-row FormArray row), `.claude/rules/angular.md` (LR-009 save-cycle), the S2 strategy field-inventory.

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm Wave-1.5 closed (W15_99 DONE; transitively Wave-1) + S2 field-inventory exists + POM shape present. 2. LR scan: LR-ENC-002, LR-009 (revert-disables-Save), LR-026 (dirty), LR-040, LR-034/LR-030/LR-044 (bug doctrine). 3. `BrowserTool=cli`, `-s=cpr-strategy-fcc`. Mutation uses the `strategyFixture` (F1) with restore.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume S0 baseline-absent artifact. `## Baseline diff` = "baseline-absent; intent oracle = DOCX NM-1441 + field-case-generation taxonomy".

---

## Phase 1+ — Scope + seed list (full FCC design on activation)

**Seed FCC cases — grep-verifiable deferred items (from S2 `(b)` classification):**
- **Multi-row FormArray**: add N strategies; edit each; remove each; delete-all then save; re-add (per `field-case-generation.md` multi-row row).
- **Save-cycle revert** (LR-009): edit a strategy field → revert to original → Save stays disabled (recovery≠pristine).
- **Each strategy-type option**: exercise every Strategy Type / boolean flag (Is Productions/Internal/GSO/Active) combination relevant to the form.
- **Negative**: duplicate strategy name; empty required field blocks Save.
- TC band: `TC-LOC-CPR-1NN` (Strategy band, FCC slice — continues after S2's P1 IDs).

Full catalog + MD + test-plan + specs on activation; mutation restores `strategyFixture` (F1).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY on activation)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: stub — reuses S0 baseline-absent artifact; net-new on activation)` | grep baseline artifact |
| GIVER | FCC test-cases/test-plan/XLSX (on activation) | `(skipped: stub — FCC catalog + MD + test-plan authored on activation, seeded by S2 field-inventory; seed list above is the grep-verifiable LR-040(b) recipient)` | `npm run check:tc-parity` exit 0 (on activation) |
| BUILDER | FCC spec block (on activation) | `(skipped: stub — FCC describe block authored on activation only)` | n/a until activation |
| HEALER | (none until activation) | `(none)` | n/a |
| WATCHDOG | (none until activation) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] (STUB) Holds S2's multi-row FormArray `(b)` deferrals as a grep-verifiable recipient (LR-040(b)) — satisfied by Phase 1+.
- [ ] (ON ACTIVATION) Wave-1 green + S2 field-inventory consumed; mutation restores `strategyFixture`; `check:tc-parity` exit 0; suite green.

---

## Handoff

Wave-2 FCC stub for Strategy. Holds S2's deferred multi-row field-case matrix as grep-verifiable items. Activates after Wave-1 closes.
