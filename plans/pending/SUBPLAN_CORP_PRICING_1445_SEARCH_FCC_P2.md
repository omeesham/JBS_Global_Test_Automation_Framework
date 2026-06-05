# SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2 — Search FCC field-coverage (Wave-2 STUB)

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

**WAVE-2 STUB (F18).** FCC (Field-Case-Coverage) field-matrix for the Search page (NM-1445), priority P2 per Doctrine 1 (P1 first, FCC second). This file exists NOW so S1's `(b)` deferrals (BVA / each-option / compound) point at a grep-verifiable recipient (LR-040(b)). Full design is authored **after Wave-1 closes** — it consumes S1's live field-inventory (`field-inventories/corporate-pricing-search-*.md`), so detailing it now would be assumptions (forbidden by Doctrine 1).

**Activation trigger**: Wave-1 (S1/S2/S3 + S4) closed P1-green; S1's search field-inventory exists.

---

## Bootstrap

**Identity**: GIVER → BUILDER → HEALER → WATCHDOG on activation. Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/rca` (if failures), `/final-q`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_1445_SEARCH_P1.md`, `clients/encore/specs_planning/_internal/field-case-generation.md` (FCC taxonomy), the S1 search field-inventory.

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm S4 (Wave-1 closure) DONE + S1 field-inventory exists. 2. LR scan: LR-ENC-002 (FCC parity structural), LR-040, LR-051/052, LR-022. 3. `BrowserTool=cli`, `-s=cpr-search-fcc`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume S0 baseline-absent artifact. `## Baseline diff` = "baseline-absent; intent oracle = DOCX NM-1445 + field-case-generation taxonomy".

---

## Phase 1+ — Scope + seed list (full FCC design on activation)

**Seed FCC cases — grep-verifiable deferred items (from S1 `(b)` classification):**
- **Pricebook text filter**: BVA (min/max length), special chars, empty, whitespace, no-match (per `field-case-generation.md` plain-text row).
- **Dropdown each-option**: Pricing Strategy / Location / Currency — exercise EACH option narrows correctly + clears (dropdown row).
- **Checkbox toggle+revert**: Is Internal / Is Labor / Active Only — toggle on→filter, off→restore (checkbox row).
- **Reset idempotency**: reset after compound filters restores full list; double-reset no-op.
- **Compound multi-filter** (deferred from S1 P1, helper `TC-ENC-PRC-1445-030`): combine text + dropdown + checkbox into a single Search submission; assert the server query (`/navigator/api/location/pricing/strategies`) carries all staged params together and the grid narrows by all conditions at once (compound row).
- **Each-option enumeration deferred from S1 P1**: Currency each-option (USD/CAD/MXN beyond the one representative narrows-case), Location each-option (2652 options, LR-025), Pricing Strategy text-filter no-match/special-chars — these are the S1 `(b)` items whose representative case is covered in P1.
- **Client-side network assertions** (D2 verdict from S1 = SERVER-SIDE on Search): confirm no server call while staging (typing/selecting), and the Search-button `/pricing/strategies` query-param shape per filter.
- TC band: `TC-LOC-CPR-0NN` (Search band, FCC slice — continues after S1's P1 IDs).

Full field-case-catalog + test-cases + test-plan + specs authored on activation (FCC two-describe shape per LR-ENC-002).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY on activation)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: stub — reuses S0 baseline-absent artifact; net-new on activation)` | grep baseline artifact |
| GIVER | FCC test-cases/test-plan/XLSX (on activation) | `(skipped: stub — FCC catalog + MD + test-plan authored on activation, seeded by S1 field-inventory; seed list above is the grep-verifiable LR-040(b) recipient)` | `npm run check:tc-parity` exit 0 (on activation) |
| BUILDER | FCC spec block (on activation) | `(skipped: stub — FCC describe block authored on activation only)` | n/a until activation |
| HEALER | (none until activation) | `(none)` | n/a |
| WATCHDOG | (none until activation) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] (STUB) Holds S1's BVA/each-option/compound `(b)` deferrals as a grep-verifiable recipient (LR-040(b)) — satisfied by Phase 1+.
- [ ] (ON ACTIVATION) Wave-1 green + S1 field-inventory consumed; FCC parity structural per LR-ENC-002; `check:tc-parity` exit 0; suite green.

---

## Handoff

Wave-2 FCC stub for Search. Holds S1's deferred field-case matrix as grep-verifiable items. Activates after Wave-1 closes.
