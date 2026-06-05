# SUBPLAN_OPI_C_MIGRATE_LEGAL_PILOT — migrate Legal spec to per-office; establish the recipe

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-04
**Identity**: OWNER
**Parent**: PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md
**Depends on**: SUBPLAN_OPI_A_INFRA_FOUNDATION.md, SUBPLAN_OPI_B_POOL_SELECTION_ACCESS_CAPTURE.md
**Blocks**: SUBPLAN_OPI_D_MIGRATE_LOCATIONS_BATCH.md, SUBPLAN_OPI_E_MIGRATE_SSL_AND_HISTORY.md, SUBPLAN_OPI_F_MIGRATE_LOCAL_OFFICE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: n/a

---

## Context

Legal is the cleanest pilot: it already has a working bounded-retry `ensureDefaultState(defaults)` and the proven editable/fixed split idiom. Migrating it end-to-end **establishes the repeatable per-spec recipe** that D/E/F follow, and is the first proof that per-worker offices kill the clobber. Owns **F1.1, F1.4, F2.2, F8.4 (Legal scope)**. No TC semantics change — this is a data-sourcing refactor, so no Phase 0.5b baseline walk and no new test cases.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (gate) · `/regression-guard` (wrap) · `/relevant` (Phase 0.5) · `/rca` (only if `--workers=2` flakes) · `/final-q` (exit)

**Context files**:
- `plans/pending/PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (parent)
- `plans/done/SUBPLAN_OPI_B_POOL_SELECTION_ACCESS_CAPTURE.md` (per-office Legal baselines)
- `.claude/rules/specs.md` (LR-018 run-all, LR-019 per-test baseline, LR-024 clean-before-RCA, LR-025 Radix retry)
- `.claude/rules/angular.md` (LR-009/026 dirty-state)
- `.claude/rules/browser-tool.md` (LR-038/054)
- `clients/encore/CLAUDE.md` (LR-012 shared dialog, LR-ENC-002 FCC parity)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm OPI_A + OPI_B are in `plans/done/`.
2–5. navigation.md, agent-mistakes (GEN-*/ALL-*), patterns.md, LR scan (LR-018/019/024/025, LR-009/026, LR-012).
6. **Browser-tool**: `BrowserTool=cli`. Reason: spec runs via `npx playwright test` (runner, not a browser-tool); any `--workers=2` flake RCA runs HEADED cli per LR-038 `/rca` row.

---

## Phase 1+ — Actual work (THE RECIPE — D/E/F reuse verbatim)

1. **Data → per-office maps** (`clients/encore/src/data/testdata/locations/location-legal.data.ts`): convert `LEGAL_DEFAULTS` → `LEGAL_EDITABLE_BY_OFFICE: ByOffice<{serviceChargeName; termsName}>`; convert fixed values (languageName, alt SC/Terms) → `LEGAL_FIXED_BY_OFFICE`. Add accessors `legalDefaultsFor(office)` / `legalFixedFor(office)` using `forOffice`. Live-read each pool office's Legal values at migration time (LR-015, the `LP_DEFAULTS` pattern), reconcile vs nav2 (F5.1), and paste into the maps with dated provenance — OPI_B does not pre-capture values. Keep dropdown CATALOGS + dialog text FLAT (office-independent).
2. **Spec → office fixture** (`clients/encore/specs/locations/location-legal.spec.ts`): drop `import { OFFICE_NO }`; add `office` to each test/`beforeEach` signature; replace `navigateToLegalTab(OFFICE_NO)` → `navigateToLegalTab(office)`; replace `ensureDefaultState(LEGAL_DEFAULTS)` → `ensureDefaultState(legalDefaultsFor(office))`; replace any fixed-value assertion (language name, etc.) with `legalFixedFor(office).<field>`.
3. **F1.1 discipline**: resolve `legalDefaultsFor(office)`/`legalFixedFor(office)` INSIDE `beforeEach`/test body — never as a module-level const. (Grep the spec for any top-level `*For(` call → must be zero.)
4. **F2.2**: ensure the save path asserts Save ENABLED before confirm (Legal's `ensureDefaultState` already loops on post-reload re-read; confirm the dirty-check guards a read-only office).
5. **Page object** (`location-legal.page.ts`): no body change needed (already takes `defaults` + `officeNo`); confirm the fixture injects `office` into its constructor (from OPI_A wiring).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Stray `'1604'` in Legal files → DO-NOW. Cross-tab Legal mutation noticed from left-panel → APPEND grep-verifiable line to OPI_D. No bare "out of scope".

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) — offices confirmed in OPI_B; Legal values live-read here at migration (LR-015) | (none) |
| GIVER | test-cases / test-plans / XLSX | (skipped: no TC semantics change — data-sourcing refactor only; parity must still verify clean) | `npm run check:tc-parity` exit 0 |
| BUILDER | `clients/encore/specs/locations/location-legal.spec.ts` + `.../location-legal.data.ts` | per-office maps + `office`-fixture spec; first-run pass | `cd clients/encore && npx playwright test specs/locations/location-legal.spec.ts --list` |
| HEALER | per-fix MD | (none) | (none) |
| WATCHDOG | findings | (none) | (none) |
| GARDENER | refactor citation | (none) | (none) |

---

## Acceptance criteria

- [ ] `location-legal.data.ts` exposes `LEGAL_EDITABLE_BY_OFFICE` / `LEGAL_FIXED_BY_OFFICE` + accessors; every pool office has an entry (TS `Record<PoolOffice,T>` enforces).
- [ ] Spec imports no `OFFICE_NO`; zero module-level `*For(` calls (F1.1).
- [ ] **Legal spec green single-worker** (`--workers=1`) == today's Legal result.
- [ ] **Legal spec green in isolation at `--workers=2`** running on ≥2 distinct pool offices (proves isolation; this is the first clobber-killed proof for one spec).
- [ ] `npm run check:tc-parity` exit 0 (LR-ENC-002).
- [ ] `npm run typecheck` clean.
- [ ] `/regression-guard` before/after. Activity-log row (LR-028). `/final-q` verdict.

---

## Verification

```bash
cd clients/encore && npx playwright test specs/locations/location-legal.spec.ts --workers=1   # expect: green == today
cd clients/encore && npx playwright test specs/locations/location-legal.spec.ts --workers=2   # expect: green on distinct offices
grep -nE "import .*OFFICE_NO" clients/encore/specs/locations/location-legal.spec.ts            # expect: empty
grep -nE "^(export )?const .*=.*(legalDefaultsFor|legalFixedFor)\(" clients/encore/specs/locations/location-legal.spec.ts  # expect: empty (no module-level resolution)
npm run check:tc-parity   # expect: exit 0
```

---

## Handoff (post-execution)

Legal is fully per-office and proven isolated at workers=2 — the first spec whose clobber is structurally gone. The 5-step recipe (data→maps, spec→fixture, F1.1 in-body resolution, F2.2 enabled-Save, page-object wiring) is now the template OPI_D/E/F apply to the remaining specs. Next: OPI_D migrates the remaining Location Settings specs as a batch using this recipe.
