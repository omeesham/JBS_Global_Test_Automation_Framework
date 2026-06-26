# SUBPLAN_OPI_E_MIGRATE_SSL_AND_HISTORY — SSL self-row + history identity/re-tighten + per-office home

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-04
**Identity**: OWNER
**Parent**: PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md
**Depends on**: SUBPLAN_OPI_C_MIGRATE_LEGAL_PILOT.md
**Blocks**: SUBPLAN_OPI_Z_FINAL_FLIP_AND_CLEANUP.md
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: SSL self-row hang (BLOCKER F3.1) + catalog-count semantics + history append-only identity + re-tightening relaxed assertions are adaptive, RCA-class judgments requiring live verification → Opus `max`.

---

## Context

The highest-risk migration group. SSL hardcodes `office !== '1604'` in `findNonSelfRow()` — on any non-1604 office this returns the SELF row and the cleanup loop tries to delete an undeletable self-row → **hang/timeout (F3.1, BLOCKER)**. History specs strict-assert the row-0 office identity (`'1604'`/`'Parker Palm Springs'`) and have **relaxed** Active/Currency assertions whose only justification (cross-spec interleave) **disappears** under per-office isolation (F4.1). This subplan also fixes the per-office home URL consumers + the `discardAndReturn` double-`navigator` latent bug. Owns **F3.1, F3.2, F4.1, F4.2, F8.1 (consumers), F8.2, F8.4 (SSL/history)**. Covers `location-shared-setup-locations`, `location-management-history`, `location-notes`, `local-office-history` (history identity only; settings/ect = OPI_F). **CORRECTION (2026-06-12):** the 2026-06-03 draft listed a `location-hist-notes` spec under a `tests/locations/history/` subdir — neither exists. The real Notes spec is `tests/locations/location-notes.spec.ts` (a flat sibling); it writes office 1604 and is NOT covered by OPI_D, so it is migrated here. No new TCs → no Phase 0.5b.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (gate) · `/regression-guard` (wrap) · `/relevant` (Phase 0.5) · `/rca` (SSL/history `--workers=2` flake — HEADED cli) · `/final-q` (exit)

**Context files**:
- parent + `plans/done/SUBPLAN_OPI_C_*` (recipe) + `plans/done/SUBPLAN_OPI_B_*` (confirmed offices + inventory; per-office history identity live-read at migration)
- `.claude/rules/specs.md` (LR-018/022/024, LR-051 no `.toBe(true)` OR-expr, LR-052 no fixed waits in polls, LR-053 auto-empty-row)
- `.claude/rules/browser-tool.md`, `.claude/rules/data.md`
- `clients/encore/CLAUDE.md` (LR-036 boolean render per table, LR-ENC-002 parity)
- auto-memory `feedback_history_content_anchored_lookup.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm OPI_C in `plans/done/`.
2–5. navigation.md, agent-mistakes (GEN-*/ALL-*), patterns.md, LR scan (LR-022/036/051/052/053, content-anchored history lookup).
6. **Browser-tool**: `BrowserTool=cli`. SSL self-row + history freshness are flake-prone → `--workers=2` RCA runs HEADED cli (LR-038 `/rca` row, no override).

---

## Phase 1+ — Actual work

1. **SSL self-row (F3.1 BLOCKER)** — in `location-shared-setup-locations.page.ts`, replace EVERY hardcoded `office !== '1604'` / `'1604'` self-comparison with `this.officeNo` (the worker's office). Audit `findNonSelfRow`, `getSelfRowText`, `ensureCleanSSLTable`, the self-row delete-disabled helpers. Confirm the cleanup loop can never target the self-row on any pool office.
2. **SSL data (F3.2/F8.4)** — `SELF_ROW` → `SSL_SELF_ROW_BY_OFFICE`; keep GLOBAL catalog search targets (`990002`, Boston, etc.) FLAT only after OPI_B confirmed catalog scoping is global (F3.3/F3.4). Keep count assertions RELATIVE (already done; do not reintroduce absolute bounds — LR-022).
3. **History identity (F4.1/F8.4)** — `ROW_1_EXPECTED` identity fields (`Local Office`, `Local Office Name`) → `MGH_ROW1_IDENTITY_BY_OFFICE` (fixed per office). `local-office-history` row identity likewise.
4. **Re-tighten relaxed assertions (F4.1)** — Active/Currency were relaxed to non-empty ONLY because cross-spec interleave mutated row 0. Per-office isolation removes interleave → restore exact per-office expected values (live-read per office at migration, LR-015, reconcile vs nav2 F5.1 — no OPI_B pre-capture). Use a branching assertion / `.toContain`, NOT `.toBe(true)` on an OR-expr (LR-051).
5. **History freshness (F4.2)** — confirm each pool office was warmed (OPI_B); if a thin office trips `waitForRecentTopRow`'s window, relax the window for sparse-history offices (documented), keep PAGE-1-ONLY content-anchored lookup.
6. **Per-office home + double-segment (F8.1 consumer / F8.2)** — fix `discardAndReturn` in `location-shared-setup-locations.page.ts`: derive home from `base_url` + `this.officeNo` and remove the duplicated `navigator/` segment (base_url already ends in `/navigator/`). Update auto-addon's `/home` poll consumer if it relies on the hardcoded HOME_URL (the env var itself is deprecated in OPI_Z).
7. **Spec → office fixture** for all four specs per the OPI_C recipe; resolve `*For(office)` in-body only (F1.1); skip-reasons that cite "1604 has 2900+ rows" → re-derive per office or make conditional (F8.5).

**Sonnet boundary**: data-map + literal-swap edits [SONNET-SAFE]; SSL self-row logic verification, history re-tightening, freshness-window RCA, `--workers=2` runs [OPUS-ONLY].

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Stray `'1604'` literal or boolean-render (LR-036) nit in touched files → DO-NOW. HOME_URL env deprecation → APPEND grep-verifiable line to OPI_Z (it owns the env change). No bare "out of scope".

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) — captured in OPI_B | (none) |
| GIVER | test-cases / test-plans / XLSX | (skipped: data-sourcing refactor + assertion re-tighten; no NEW TCs — re-tightened assertions match captured per-office values, parity unchanged) | `npm run check:tc-parity` exit 0 |
| BUILDER | `tests/locations/location-shared-setup-locations.spec.ts`, `tests/locations/location-management-history.spec.ts`, `tests/locations/location-notes.spec.ts`, `tests/local-office/local-office-history.spec.ts` (+ their `src/data/**/*.ts` + SSL page object) | self-row fix + per-office maps + re-tightened asserts; first-run pass | `cd clients/encore && npx playwright test tests/locations/location-shared-setup-locations.spec.ts tests/locations/location-management-history.spec.ts tests/locations/location-notes.spec.ts tests/local-office/local-office-history.spec.ts --list` |
| HEALER | per-fix MD | (none) | (none) |
| WATCHDOG | findings | (none) | (none) |
| GARDENER | refactor citation | (none) | (none) |

---

## Acceptance criteria

- [ ] **(F3.1)** Zero hardcoded `'1604'` self-comparisons remain in `location-shared-setup-locations.page.ts` — all use `this.officeNo`; SSL cleanup loop verified it never targets the self-row on a non-1604 office.
- [ ] **(F4.1)** History row-0 identity is per-office; Active/Currency assertions RE-TIGHTENED to exact per-office values (no leftover non-empty-only relaxation justified by interleave).
- [ ] **(F8.2)** `discardAndReturn` produces a single `/navigator/` segment for any pool office.
- [ ] All four specs green `--workers=1` (==today) AND green in isolation at `--workers=2` on distinct offices (SSL proven NOT to hang on a non-1604 office).
- [ ] No absolute SSL count bounds reintroduced (LR-022); no `.toBe(true)` on OR-expr (LR-051).
- [ ] Zero module-level `*For(` resolution (F1.1). `npm run check:tc-parity` exit 0. `npm run typecheck` clean.
- [ ] `/regression-guard`. Activity-log row (LR-028). `/final-q` verdict.

---

## Verification

```bash
grep -n "'1604'" clients/encore/src/pages/locations/location-shared-setup-locations.page.ts   # expect: empty (all -> this.officeNo)
cd clients/encore && npx playwright test tests/locations/location-shared-setup-locations.spec.ts --workers=2   # expect: green, no hang/timeout on non-1604 office
cd clients/encore && npx playwright test tests/locations/location-management-history.spec.ts --workers=2       # expect: green, per-office row-0 identity
grep -nE "navigator/navigator" clients/encore/src/pages/locations/location-shared-setup-locations.page.ts      # expect: empty (F8.2 fixed)
```

---

## Handoff (post-execution)

The SSL self-row hang (the worst blocker) is gone — self-row identity is the worker's office everywhere. History row-0 identity is per-office and the Active/Currency assertions are re-tightened now that isolation removed the interleave that forced the relaxation. The `discardAndReturn` double-segment bug and per-office home are fixed. Remaining: local-office settings + ECT (OPI_F), then the final flip (OPI_Z) which makes `officeNo` required, deprecates the hardcoded HOME_URL env, and proves the full suite green at workers=4 and 8.
