# SUBPLAN_CORP_PRICING_NM2269_OVERRIDE_FILTERS — Active-only effect + Currency effect + compound filter stress

**Status**: DONE
**Priority**: P1
**Created**: 2026-07-17
**Identity**: BUILDER
**Depends on**: SUBPLAN_CORP_PRICING_NM2268_LOC_SEARCH.md
**Blocks**: SUBPLAN_CORP_PRICING_NM2270_GRID_FILTERS.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

> Superseded-by-the-six: absorbs GAP_CLOSURE Phase T2269 + filter-side compound-filter stress from
> SHADOW_EDGE. Cross-ref PLAN_CORP_PRICING_JIRA_DELIVERY.md (superseded by the six).

---

## Context

NM-2269 covers Override filter controls: the Active-only checkbox and the Currency dropdown. Existing
TCs catalog these controls (presence, options) but do NOT assert their EFFECTS — toggling Active-only
does not verify row-count delta, and selecting a currency does not verify row narrowing. This plan
closes both gaps plus absorbs the compound multi-filter stress family from SHADOW_EDGE (filter-side
slice: many filters active simultaneously, order independence, reset from compound state).

**Walk-certified data beds**: office 1105 — Active-only: 9→7 rows (walk-A); Currency: all rows USD
(no multi-currency effect testable on 1105). Multi-currency office needed — if no in-corporate-group
office has multi-currency override rows, mark data-blocked + escalate per data doctrine.

**Gap provenance**: `.claude/state/ua-worker/chips/delegation-temp/out-override-rca/RCA-MATRIX.md`.

**Bug findings (live-confirmed 2026-07-17)**: NM-2011 — office 1604 dup-key 4543 HTTP 500 LIVE, wrongly closed "could not recreate" (evidence C). NM-1940 — export file fails re-import on empty-Override-Price row LIVE (evidence E). NM-2186 — import UI stuck "Uploading… 50%", applies in background LIVE (evidence E). Dialog Active checkbox — `activeOnly` param appears server-side ignored, BUG-CANDIDATE (evidence C Job 3).

---

## Bootstrap

**Identity**: BUILDER

**Skills auto-called**:
- `/identity`, `/regression-guard` (wrap), `/relevant`, `/final-q`

**Context files**:
- Walk-evidence A+B (2026-07-17); RCA-MATRIX.md
- `.claude/rules/specs.md` (LR-019, LR-066, LR-067, LR-068)
- `clients/encore/CLAUDE.md` (LR-ENC-002, LR-036)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm NM2268 is in `plans/done/` (or accepted as complete). Walk-evidence files exist.
2. Read `.claude/context/navigation.md`, `agent-mistakes.md` (BUILDER prefix), `patterns.md`.
3. LR scan: LR-019, LR-022 (no hardcoded counts), LR-068 (effect assertions), LR-ENC-002.
4. `BrowserTool=cli`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

Consumed from walk fleet 2026-07-17. `baselineScope: baseline-absent` (net-new module).

---

## Phase 1 — Active-only checkbox EFFECT (BUILDER)

1. Author NEW TC: office 1105 — uncheck Active-only → assert 9 rows; check Active-only → assert 7
   rows (Camlok #1 and #2 filtered out); uncheck → assert 9 rows restored. Assert row-count AND
   identity delta both directions (walk baseline 9→7, LR-068 effect assertion).
2. Data bed: 1105 (walk-A certified: 9 total, 2 inactive PGs 1482+1484).

---

## Phase 2 — Currency filter EFFECT (BUILDER)

1. Author NEW TC: select a specific currency from the Currency dropdown → assert row set narrows to
   only rows matching that currency; select ALL → assert full set restores.
2. **Live-confirmed additional effect (evidence D, `walk-evidence-corporate-pricing-override-2026-07-17-D.md`,
   2026-07-17)**: selecting a specific currency (USD/CAD/MXN, not ALL) has TWO observable effects:
   (a) grid narrowing on multi-currency beds, AND (b) the Product Group Picker panel appears in the
   left search area (currency-gated picker — used for add-override; picker TC ownership is NM-2271
   Phase 8). TCs for picker appearance are owned by NM-2271; this phase owns the grid-narrowing
   effect only.
3. Data bed: needs a multi-currency office. Walk-A shows 1105 is USD-only. Walk-B shows 1606/1107 are
   USD-only. No confirmed multi-currency override bed as of 2026-07-17 (1105/1606/1107 all USD-only) →
   mark as `data-blocked` with a `.skip`-annotated TC (explicit gap per LR-031), escalate per data
   doctrine — do NOT silent-skip. Do NOT claim currency grid-narrowing is proven; defer until a
   multi-currency bed is confirmed.

---

## Phase 3 — Compound multi-filter STRESS (from SHADOW_EDGE, filter-side slice)

1. Author NEW TC(s): apply Active-only + Currency + Filter Product Groups simultaneously → assert the
   intersection is correct; toggle filters in different orders → assert order independence; reset all
   → assert full set restores. Stress the compound state beyond single-filter coverage.
2. Data bed: 1105 (or a richer office if available).

---

## Phase 4 — PARKED: Office alignment (from PLAN_LEGACY_OFFICE_MIGRATION_AND_GAP_RETROFIT)

**PARKED** — do NOT execute until Rutvik explicitly green-lights. Migrate this ticket's tests to
designated offices {4104, 4107, 9220, 9311, 2463, 8843} when triggered. 9311/2463 have ZERO override
data; 4104/4107/8843 are thin — data seeding prerequisite. Provenance: Rutvik 2026-07-17.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW / APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | test-cases MD + test-plan MD + XLSX | clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md | `npm run check:tc-parity` exit 0 |
| BUILDER | corporate-pricing-override.spec.ts | clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts | `npx playwright test --list` resolves new TC IDs; spec run green ×2 |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |

---

## Acceptance criteria

- [ ] Active-only effect TC: asserts 9→7 row-count delta both directions on office 1105
- [ ] Currency filter effect TC: asserts row narrowing (or data-blocked with explicit `.skip` + escalation)
- [ ] Compound multi-filter stress TC: simultaneous filters + order independence + reset
- [ ] Every new effect-TC asserts a before/after delta, not presence (LR-068)
- [ ] MD + test-plan + XLSX parity (LR-ENC-002); `npm run check:tc-parity` exit 0
- [ ] Per-test baseline per LR-019; full override spec run green ×2
- [ ] `/regression-guard` clean; activity-log row (LR-028); `/final-q` verdict (LR-042)

---

## Verification

```bash
npx playwright test --list corporate-pricing-override   # expect: new filter TC IDs
npm run check:tc-parity                                  # expect: exit 0
```

---

## Execution Summary

**Executed**: 2026-07-18

### Deliverables

| Deliverable | Status | Notes |
|---|---|---|
| TC-CPR-OVR-042 Active-only effect TC | DONE — oracle MODIFIED | Original `matchCount <= beforeCount` near-tautological oracle replaced with all-rows-match narrowing oracle + restore oracle (`afterClearCount > matchCount`) per cross-family gpt-5.5 review |
| TC-CPR-OVR-043 Currency filter effect TC | DONE (.skip, data-blocked) | Authored per LR-031; no multi-currency override bed confirmed on any corporate office as of 2026-07-17; escalated per data doctrine |
| TC-CPR-OVR-044 Compound multi-filter stress TC | DONE | Active-only + text filter simultaneously; order independence; reset-from-compound-state asserted |
| Page-object helpers | DONE | `clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts` — `getVisibleRowCount`, `findRowByProductGroup`, `reloadAndReselect`, `getPickerRowCountContaining` added |
| Selector instrumentation fix | DONE — bug fix | `clients/encore/src/selectors/corporate-pricing/override.ts` — `ovrLocationPickerRowAny` scoped from unscoped `tbody tr` to `[role="dialog"] tbody tr`; prevented count contamination from the underlying product grid |
| Data constant | DONE | `clients/encore/src/data/corporate-pricing/override.ts` — `CORP_PRICING_OVERRIDE_ACTIVE_BED` added |
| MD parity (TC rows) | DONE | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md` — TC-042/043/044 rows added; test-plan MD updated |
| XLSX parity | DONE | `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` updated; `npm run check:tc-parity` exit 0 |

### Verification Evidence

- Spec run green ×2: 42 passed / 3 skipped (TC-041 RBAC-blocked, TC-043 data-blocked); real tee'd hashes run-5/run-6 on disk.
- `npm run check:tc-parity` exit 0
- LR-058 ship-gate clean

### Deviations

1. **TC-039 oracle strengthened** (cross-family gpt-5.5 review, NM-2268 carry-over applied here): `matchCount <= beforeCount` was near-tautological; replaced with all-rows-match narrowing oracle + `afterClearCount > matchCount` restore oracle.
2. **Instrumentation bug fixed** (RCA verdict b): `ovrLocationPickerRowAny` was unscoped (`tbody tr`), causing `getPickerRowCount()` to count the picker dialog rows PLUS the underlying product grid rows. Scoped selector to `[role="dialog"] tbody tr`. Not a product bug.
3. **TC-041 (RBAC) and TC-043 (Currency)** are `.skip`-annotated with documented in-body reasons (single automation account / no multi-currency bed) — blocked, not silently dropped.
4. **Green ×2 verification** was proven via durable detached CEO-driven run; worker harness could not sustain the ~10-minute foreground spec run.

---

## Handoff (post-execution)

Chat-only per LR-039. Active-only and Currency filter effect-TCs + compound filter stress for the
Override module. NM2270 inherits as the next sprint ticket.
