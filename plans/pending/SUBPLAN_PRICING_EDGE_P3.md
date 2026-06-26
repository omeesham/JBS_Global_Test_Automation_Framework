> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute SUBPLAN_PRICING_EDGE_P3.md`. DEFERRED stub — do not execute until `SUBPLAN_PRICING_FCC.md` is DONE.**
>
> The agent self-bootstraps from this file's frontmatter + sections, zero extra prompting:
> 1. **Identity**: `/identity` per the Identity field (OWNER shell; per-phase GIVER → BUILDER → HEALER → WATCHDOG).
> 2. **Skills**: per §Bootstrap.
> 3. **Model + thinking + permission-mode**: read the frontmatter fields (all three required, LR-041).
> 4. **Dependency gate**: `SUBPLAN_PRICING_FCC.md` MUST be DONE in plans/done/ (this edge plan consumes its cleaned baseline + field inventory + catalog). HALT if not.
> 5. **Context load**: master §Doctrine + the closed `SUBPLAN_PRICING_FCC.md` Execution Summary + its dated field-inventory / field-case-catalog + this file. Missing context = HALT.
> 5.5. **Browser tool**: `cli` per LR-038 v2 (catalog walk + save-cycles; no visual/CSS, no fresh-passkey, no mid-execution pause). Announce in first output.
> 6. **Phase 0 FIRST**: dependency + browser-tool + empirical gate.
> 7. **Execute Phases 1+** per Step-by-Step (full design is authored in Phase 1 of THIS plan once MAIN's catalog is the input).
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, activity-log row, master annotation, `git mv` to plans/done/, `npm run plans:reindex`, `/final-q`.
>
> **HALT + ASK USER** if: MAIN not DONE / scope ambiguity / regression-guard unrelated changes / any planned edge class not classifiable (a)/(b)/(c) per LR-040.

---

# SUBPLAN_PRICING_EDGE_P3

**Status**: PENDING
**Priority**: P3
**Created**: 2026-06-15
**Identity**: OWNER (multi-identity by phase — GIVER → BUILDER → HEALER → WATCHDOG)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: SUBPLAN_PRICING_FCC.md (must be DONE — consumes its cleaned spec, field inventory, and field-case catalog)
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: cli
**Author**: Rutvik (via Claude Opus 4.8)
**ActiveClient**: encore

co-doctrine: §False-Green Sweep Doctrine (PLAN_BIG_PIVOT_FCC_MASTER.md) — NOT a second parent (LR-048 singular-Parent schema).

---

## Context

**DEFERRED Wave-3 stub (optional-but-saved).** The user asked for a saved-but-deferred edge-case plan on top of the base Pricing FCC coverage. This file is the **grep-verifiable recipient** for the LR-040(b) edge deferrals recorded in `SUBPLAN_PRICING_FCC.md` Phase 2 — so MAIN can close honestly with its advanced-technique cells pointing here. It is intentionally a stub now; its full TC design is authored in Phase 1 below **only after MAIN closes GREEN** (so it consumes MAIN's cleaned spec + dated field inventory + field-case catalog rather than re-walking).

Target surface: same as MAIN — **Location Settings → Pricing sub-tab** (`/navigator/locations/1604/settings/location`, office 1604; Angular + Radix). Inherits the installed FCC paradigm and the per-test `ensureDefaultState` + `saveAndConfirm` helpers MAIN added.

**Seed edge classes (the deferred long-tail — each becomes a designed case-set in Phase 1):**
1. **Date BVA exotica** — leap-year (Feb 29), year-rollover (Dec 31 / Jan 1), Start = End boundary, ±1-day boundaries on Start/End (taxonomy §2 Date row; LR-008 positivity).
2. **Pairwise / combinatorial grid** — multiple grid rows with Is Alternative + Use Effective Date + dates + mixed currencies set simultaneously, then save+reload (taxonomy §2 Multi-row + pairwise; LR-053 per-row content assertion, no strict row-count).
3. **Full W3C accessibility audit** — tab order through grid + dropdowns, focus trap, label association, error-guidance text (coverage-audit notes a11y is 1/10 specs; taxonomy §2.1 escapable oracle is the kernel).
4. **Error-guessing** — rapid double-click checkbox race; concurrent edits across rows; save-failure injection + retry recovery; dropdown-load-failure recovery (the documented load-failure screenshot scenario).
5. **Tier-2 network-payload structural validation** (taxonomy §1 Tier 2) — assert the save response body reflects the committed payload (timestamps / version metadata), beyond Tier-1 reload+read. Tier-3 DB query is out of framework scope (aspirational, noted).

These are recorded in MAIN's Phase-2 catalog as `(c)` deferred with this file named as recipient (LR-040(b)).

> **Superseded-in-method (2026-06-24, SUBPLAN_CGS_A):** the 5 seed edge classes above are now codified
> generically in the [Case-Generation Standard](../../docs/read_only_docs/CASE_GENERATION_STANDARD.md)
> L2/L3 **DEEP model** + `field-case-generation.md` §3 (DEEP rows: date-BVA exotica, pairwise grids,
> full a11y, error-guessing, Tier-2 network). On activation, **regenerate this DEEP coverage via
> `/ultracoverage pricing`** (it auto-calls `/coverage` and emits QUICK+DEEP from the live inventory)
> rather than hand-authoring the seed list. **This stub is NOT deleted or moved** — it REMAINS the
> grep-verifiable LR-040(b) recipient for the edge deferrals in the closed `SUBPLAN_PRICING_FCC.md`;
> it is superseded-in-*method*, not retired-from-existence.

---

## Bootstrap

**Identity**: OWNER (sub-phases via `/identity X`).
**Skills auto-called**: `/identity` (each phase), `/relevant` (start), `/regression-guard` (pre+post BUILDER), `/find-bugs` (Phase 1 edge design), `/rca` + `/bugfix` (conditional RED), `/audit` + `/review` (fresh-context completeness), `/final-q` (closure).
**Context files (load order):**
1. `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` — §Doctrine + §False-Green Sweep + §Cascade closure rules
2. `plans/done/SUBPLAN_PRICING_FCC.md` — Execution Summary + the cleaned spec/page-object baseline this plan extends
3. `clients/encore/specs_planning/_internal/field-inventories/pricing-<MAIN-DATE>.md` + `_internal/field-case-catalogs/pricing-<MAIN-DATE>.md` — MAIN's inventory + catalog (the edge-deferred cells live here)
4. `clients/encore/specs_planning/_internal/field-case-generation.md` — §2 Date/Multi-row rows + §2.1 rejection-affordance oracle + §1 Tier-2
5. `clients/encore/tests/locations/location-pricing.spec.ts` + `src/pages/locations/location-pricing.page.ts` + `src/selectors/locations/pricing.ts` + `src/data/locations/location-pricing.ts`
6. `clients/encore/src/utils/field-case-runner.ts`
7. `clients/encore/CLAUDE.md` (LR-ENC-001/002/003, LR-008) + `.claude/rules/` (pipeline / specs / angular / browser-tool / inventory)

**Missing context file = HALT.**

---

## Phase 0 — Dependency + browser-tool + empirical-verification gate (OWNER)

- [ ] `plans/done/SUBPLAN_PRICING_FCC.md` is DONE (grep). HALT if not — this plan consumes its cleaned baseline.
- [ ] Spec/page-object/selectors/data exist with MAIN's hardening (`ensureDefaultState`, `saveAndConfirm`) present (grep).
- [ ] `.env.local` local run (LR-ENC-003); **Browser tool: CLI** announced (LR-038 v2).
- [ ] Empirical gate → `_internal/phase-0-verification-pricing-edge-<DATE>.md` PROCEED.

## Phase 1 — Edge case design + catalog (GIVER; from MAIN's catalog, no re-walk)

`/identity GIVER`. Expand each of the 5 seed edge classes into a concrete case-set using MAIN's dated field inventory + catalog as the field source (no full re-walk; spot-check only per LR-013). Classify every edge cell (a) implement / (b) already-covered-by-MAIN / (c) not-applicable (cite reason). Emit `_internal/field-case-catalogs/pricing-edge-<DATE>.md`; reconcile the TC-MD + test-plan + XLSX (`npm run xlsx:build`; `check:tc-parity` exit 0).

## Phase 2 — Build (BUILDER; blend-at-top, no `@fcc` tag)

`/identity BUILDER`. `/regression-guard` before. Blend net-new edge cases at the TOP of the existing describe, sequential IDs past MAIN's high-water mark, same tags, via `saveAndVerifyCase()`. Add any helper/selector/data needed for a11y + error-injection. Individual run green `--workers=1 --retries=0` before full suite. `/regression-guard` after.

## Phase 3 — Verify + audit (WATCHDOG/HEALER; fresh-context, AUD-017)

`/identity WATCHDOG`. `/find-bugs` + fresh-context `/review` + `/audit`; false-green fix (HEALER) on any finding; RCA RED via `/rca`. Combined run green ×2 `--retries=0 --workers=1`. File `BUG-LOC-PRI-NNN` for any real defect surfaced by error-guessing/a11y cases.

## Phase 4 — Closure (OWNER; LR-027/040/055)

`/identity OWNER`. Status→DONE + Executed; `### Execution Summary` (evidence-emission); C6 matrix audit; closure gate `validate-plan-closure.mjs --enforce` PASS; parent cascade (cite `LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)`; annotate master §Roadmap); activity-log row; `git mv` + reindex; `/final-q`; navigation.md update.

---

## Per-Identity Satisfaction (LR-048 v3 — `<DATE>` filled at execution)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — consumes MAIN's dated inventory/baseline; spot-check only, no fresh walk) | (none) | (n/a — `(none)` per spot-check-only design) |
| GIVER | edge catalog + reconciled test-cases MD + test-plan + XLSX | clients/encore/specs_planning/_internal/field-case-catalogs/pricing-edge-<DATE>.md<br>clients/encore/specs_planning/test-cases/setup/locations/locations_pricing_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/locations/locations_pricing_test_plan.md<br>clients/encore/test_cases_xlsx/encore_test_cases.xlsx | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + page object + data + selectors (a11y/error-injection helpers) | clients/encore/tests/locations/location-pricing.spec.ts<br>clients/encore/src/pages/locations/location-pricing.page.ts | `npx playwright test --list` resolves all net-new edge TC IDs |
| HEALER | RCA-driven fixes + bug filing (conditional) | clients/encore/reports/bugs/BUG-LOC-PRI-*.json — else replace at closure with `(skipped: <reason ≥20 chars — no edge case surfaced a reproducible defect>)` | full spec green ×2 `--retries=0 --workers=1` |
| WATCHDOG | phase-0 verification + fresh-context audit | clients/encore/specs_planning/_internal/phase-0-verification-pricing-edge-<DATE>.md | Phase-0 PROCEED + fresh-context `/audit` GREEN |
| GARDENER | (none — additive edge tests, no structural refactor expected) | (none) | (n/a) |
| OWNER | closure + master annotation | plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md | `node scripts/validate-plan-closure.mjs --enforce` C1-C6 PASS |

---

## Acceptance Criteria

- [ ] Phase 0 dependency gate: MAIN is DONE; verification artifact PROCEED.
- [ ] Phase 1 edge catalog emitted; every seed edge class expanded + each cell (a)/(b)/(c); MD/test-plan/XLSX reconciled; `check:tc-parity` exit 0.
- [ ] Phase 2 edge cases blended at top via `saveAndVerifyCase`, no `@fcc` tag; individual green `--workers=1 --retries=0`; regression-guard before/after.
- [ ] Phase 3 fresh-context `/review`+`/audit` GREEN; combined run green ×2; bugs filed for any real defect.
- [ ] Phase 4 Execution Summary + C6 + closure gate PASS; master annotated (cascade-SKIPPED citation); activity-log; `git mv` + reindex; `/final-q`.

## Out of scope

- Anything already covered by `SUBPLAN_PRICING_FCC.md` (base field×case coverage, the 7 documented skips, multi-currency per-currency dropdowns).
- Tier-3 DB-query verification — no DB access from the test suite (aspirational, noted only).
- The Corporate Pricing module — separate.

## Handoff (chat-only per feedback_handoff_in_chat_only.md)

Describes outcomes only (LR-039). On close, surface: net-new edge TC IDs by class (date-BVA / pairwise / a11y / error-guessing / Tier-2), any bugs filed, and the `/final-q` verdict.

---

## Execution Summary

_(Populated at closure per LR-027 — not yet executed. DEFERRED stub: full edge-case design is authored in Phase 1 once SUBPLAN_PRICING_FCC.md is DONE.)_
