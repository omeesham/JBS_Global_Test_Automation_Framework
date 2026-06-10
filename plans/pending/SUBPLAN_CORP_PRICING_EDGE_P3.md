# SUBPLAN_CORP_PRICING_EDGE_P3 — Corporate Pricing edge cases (Wave-3 STUB)

**Status**: PENDING
**Priority**: P3
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md, SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md, SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md, SUBPLAN_CORP_PRICING_PRE_EDGE.md
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
**Bug doctrine (master Doctrine 2 — applies while field-testing every case below)**: if any behavior looks suspicious or buggy (a control that won't react, a Save that silently no-ops, a field that accepts a negative/invalid value), follow the doctrine — record it as an `/encore-questions` clarification when the cause is unclear (permission-locked? interaction step missing?), or file per LR-034 once it reproduces in the runner (LR-044). Never silently absorb it; at minimum catch the bugs visible in these cases. (W15-0 modeled this — it raised Q-WV15-1 instead of false-filing.)
**Jira defect cross-ref (UNVERIFIED leads — prove each on the live site before it becomes a test expectation OR a filing, LR-044)**: check `clients/encore/specs_planning/_internal/jira-defect-crossref-2026-06-09.md` — it supplies the cross-field edges to cover (NM-1675 computed Current Price, NM-2068 strategy "Locations Using" not updated), the RBAC gate (NM-2126), and the two New-Pricebook items carried forward from the already-done 1440 (NM-2022, NM-2057 — see seed list). External AI Jira-search output — reproduce live first, cite the `NM-#`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, the 3 Wave-2 FCC subplans, the Wave-1.5 subplans (`SUBPLAN_CORP_PRICING_W15_A_OVERRIDE_FCC.md`, `SUBPLAN_CORP_PRICING_W15_B_TOOLBAR_IO_FCC.md` — this stub holds their deferred real-I/O round-trip), all 3 field-inventories + the Wave-1.5 inventories, `field-case-generation.md`.

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm the 3 Wave-2 FCC subplans DONE. 2. LR scan: LR-ENC-002, LR-022 (no hardcoded counts — F8), LR-051/052, LR-040, LR-034/LR-030/LR-044 (bug doctrine). 3. `BrowserTool=cli`, `-s=cpr-edge`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume S0 baseline-absent artifact. `## Baseline diff` = "baseline-absent; intent oracle = DOCX + SFDPOT edge heuristics".

---

## Phase 1+ — Scope + seed list (full edge design on activation)

**Seed edge cases — grep-verifiable deferred items:**
- **Compound multi-filter** (Search): several filters + Search together; order independence; reset from compound state.
- **591-row virtualization stress** + content-anchored read integrity (scroll far, read off-screen rows via content anchor; LR-022, F8).
- **Drag-drop edge** (Detail New-Pricebook mode) — activates only when NM-1440 ships (cross-ref the 1440 stub).
- **Cross-field**: strategy×detail interactions; currency consistency header↔grid — **author from the Wave-2.5 `corporate-pricing-dependency-map-*.md` artifact; cover every `depends-on` edge it lists (no cherry-picking).**
- **Accessibility**: keyboard nav, ARIA roles on grid/dialogs.
- **Export / Import real file I/O round-trip** (deferred from Wave-1.5 WV1.5-B, which covers trigger+variant only): actual download round-trip (`waitForEvent('download')` + assert file/format per the 4 variants — All Equipment/Labor Pricing, All Equipment/Labor Max Discount) AND real import upload (fixture files → validation / error / success). Needs a download-dir + committed fixture files. (Trigger-level + Grid-Options behavior is already owned by WV1.5-B — NOT re-covered here; this is the heavy I/O slice only.)
- **RBAC**: Revenue Management role gate (read-only vs edit) where applicable — cross-ref NM-2126 (non-RM users wrongly retaining export/import) in the Jira cross-ref note.
- **New-Pricebook validation (carried forward from the already-DONE `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md`, per user 2026-06-09)**: confirm-or-file two Jira leads on the create page — **NM-2022** (name uniqueness should be name+strategy, not name alone) and **NM-2057** (Price Year required but no indicator / Save silently disabled). Reproduce live; file per LR-034 only if confirmed (LR-044). 1440 is closed — these land here, not by reopening it.
- **Module-wide false-green + Excel-drift sweep (WATCHDOG, on activation — FINAL gate)**: before this subplan closes (it flips the master to DONE), run the **same B2.5 check as `SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md`** across the ENTIRE Corp Pricing spec suite (Wave-1 / 1.5 / 2 / 2.5 / 3) — the 11 false-green patterns (`PLAN_BIG_PIVOT_FCC_MASTER.md` §False-Green Sweep Doctrine) + assert-matches-XLSX-intent (no spec weakened to pass green; `check:tc-parity` already guards ID/count drift, this guards assertion-semantics drift). W15_99 covers Wave-1.5 only; THIS is the module-wide final sweep. Any false-green or Excel-drift finding = DEFECT → blocks closure.
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
- [ ] (ON ACTIVATION) **No forced green, module-wide** — the ENTIRE Corp Pricing spec suite passes the B2.5 false-green + Excel-drift sweep (per W15_99 B2.5 / BIG_PIVOT 11 patterns); one finding blocks closure (master cannot flip DONE).

---

## Handoff

Wave-3 edge stub. The LAST gating child — when this closes, the master parent flips to DONE (F16). Activates after Wave-2 FCC closes.
