# SUBPLAN_CORP_PRICING_1444_HISTORY — Pricebook Management History tab (GATED STUB)

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

**GATED STUB (F18).** The DOCX lists a third Management tab "History: (Placeholder) NM-1444" (line 144) but gives **no requirements/fields/acceptance** for it, and live recon (master D5) found **no History tab** — only Strategy + Detail. This file exists NOW so S2's History-absent deferral (F2b) points at a grep-verifiable recipient (LR-040(b)). It also carries the **`/encore-questions` clarification** that S2 raises (is the History tab planned? when?). Full design is authored on **activation**, when both the tab ships AND Encore supplies the (currently absent) functional spec.

**Activation trigger**: walk-evidence records a live History tab present AND a DOCX/Encore spec exists for it. Until both, this stays PENDING-gated.

---

## Bootstrap

**Identity**: GIVER → BUILDER → HEALER → WATCHDOG on activation. Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/encore-questions` (the History-intent clarification), `/final-q`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_00_FOUNDATION.md`, `SUBPLAN_CORP_PRICING_1441_MGMT_STRATEGY_P1.md`, `clients/encore/CLAUDE.md` (LR-036 boolean render — History grids historically render booleans).

---

## Phase 0 — Dependency + browser-tool + activation gate (MANDATORY)

1. Confirm S0 DONE. 2. **Activation gate**: confirm walk-evidence shows a live History tab AND an Encore-supplied spec; if either absent → HALT (stay gated). 3. LR scan: LR-ENC-001, LR-036, LR-040, LR-029. 4. `BrowserTool=cli`, `-s=cpr-history`. 5. **POM-shape gate**: assert `tests/corporate-pricing/` + `src/data/corporate-pricing/` + `src/fixtures/pages.fixture.ts` exist (restructure landed); HALT if the tree is half-moved.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume S0 baseline-absent artifact. `## Baseline diff` = "baseline-absent; intent oracle = DOCX NM-1444 (placeholder only)".

---

## Phase 1+ — Scope + seed list (full design on activation)

**Seed items — grep-verifiable deferred items:**
- The **DOCX-3-tab-intent clarification** raised by S2 (F2b): confirm with Encore whether/when the History tab ships and its intended columns.
- On activation: History grid columns + boolean render format (LR-036 — MCP-verify per table, do NOT assume ✔ vs SVG vs glyph), row content, pagination/virtualization, read-only nature.
- No XLSX helpers exist for 1444 (no `TC-ENC-PRC-1444-*` sheet) — cases authored fresh from the live tab on activation.
- TC band: `TC-LOC-CPR-4NN` (History).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY on activation)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: stub — reuses S0 baseline-absent artifact; History net-new/absent on e2e)` | grep baseline artifact |
| GIVER | test-cases/test-plan (on activation) | `(skipped: stub — no DOCX requirements + tab absent; authored on activation once Encore supplies spec + tab ships; History-intent clarification is the grep-verifiable recipient for S2's F2b deferral)` | `npm run check:tc-parity` exit 0 (on activation) |
| BUILDER | spec/page/selectors/data (on activation) | `(skipped: stub — authored on activation only)` | n/a until activation |
| HEALER | (none until activation) | `(none)` | n/a |
| WATCHDOG | (none until activation) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] (STUB) Holds S2's History-absent / 3-tab-intent deferral as a grep-verifiable recipient (LR-040(b)) — satisfied by Phase 1+.
- [ ] (ON ACTIVATION) Live History tab + Encore spec both confirmed BEFORE authoring.
- [ ] (ON ACTIVATION) Full GIVER→WATCHDOG cycle; boolean-render format MCP-verified (LR-036); `check:tc-parity` exit 0.

---

## Handoff

Gated stub for NM-1444 History. Holds S2's History-absent deferral + the DOCX-3-tab-intent clarification as grep-verifiable items. Activates when the History tab ships and Encore supplies its spec.
