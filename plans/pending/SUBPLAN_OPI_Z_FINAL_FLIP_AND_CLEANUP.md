# SUBPLAN_OPI_Z_FINAL_FLIP_AND_CLEANUP — make officeNo required, flip workers up, full-suite green at 4 & 8, sweep stale 1604

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-04
**Identity**: OWNER
**Parent**: PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md
**Depends on**: SUBPLAN_OPI_D_MIGRATE_LOCATIONS_BATCH.md, SUBPLAN_OPI_E_MIGRATE_SSL_AND_HISTORY.md, SUBPLAN_OPI_F_MIGRATE_LOCAL_OFFICE.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: final compiler-enforced removal of `officeNo` defaults across ~44 methods + full-suite parallel run at workers=4/8 with RCA of any residual flake + parent closure = max-judgment closure work → Opus `max`.

---

## Context

Closure subplan. With all 14 specs migrated (OPI_C/D/E/F), this removes the `officeNo='1604'` defaults (making the parameter REQUIRED so the compiler flags any straggler call site — F8.3), deprecates the hardcoded `HOME_URL` env (F8.1), flips the default worker counts back up, proves the **FULL suite green at workers=4 and workers=8** (the clobber is gone), sweeps residual 1604 literals (LR-050 stale-cleanup, enumerated below — not deferred), graduates the "resolve-via-fixture / no module-level per-office const" discipline into a rule, and closes the parent (LR-027 cascade). This is a restructure-class change, so the stale-cleanup is enumerated in-scope per LR-050.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (gate) · `/regression-guard` (wrap) · `/relevant` (Phase 0.5) · `/rca` (full-suite flake — HEADED cli) · `/audit` (review — full-chain on the initiative) · `/final-q` (exit)

**Context files**:
- parent + `plans/done/SUBPLAN_OPI_{A,B,C,D,E,F}_*.md`
- `.claude/rules/specs.md`, `.claude/rules/pipeline.md` (LR-027 closure, LR-050 stale-cleanup, LR-041), `.claude/rules/plan-closure.md` (LR-055 close-gate), `.claude/rules/browser-tool.md`
- `clients/encore/CLAUDE.md` (LR-ENC-003 env), `docs/read_only_docs/LEARNED_RULES.md` (next free LR-NNN for rule graduation)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm OPI_D, OPI_E, OPI_F all in `plans/done/`.
2–5. navigation.md, agent-mistakes, patterns.md, LR scan (LR-018/024 run-all+clean, LR-027/050/055 closure, LR-ENC-003 env).
6. **Browser-tool**: `BrowserTool=cli`. Full-suite runs via runner; any residual flake RCA = HEADED cli (LR-038 `/rca`, no override).

---

## Phase 1+ — Actual work

1. **Make `officeNo` required (F8.3)** — remove the `= '1604'` / `= OFFICE_POOL[0]` defaults from the ~44 page-object navigation methods + `base-page` so `officeNo` is a required param. `npm run typecheck` now ERRORS on any call site that didn't pass `office` → fix each (there should be none if C–F were complete; any error is a found straggler). This is the compiler-enforced proof of complete migration.
2. **Deprecate hardcoded HOME_URL (F8.1)** — remove `HOME_URL=.../locations/1604/home` from `.env.local` + `.env.e2e`; derive home per-office from `base_url` + office wherever `config.home_url` was consumed (auto-addon `/home` poll, any landing nav). Confirm no consumer reads the static 1604 home.
3. **Flip default workers up** — restore `playwright.config.ts` defaults to CI=4 / local=2 (still clamped to POOL_SIZE=8); confirm `MAX_WORKERS` override still clamps. Update any CI workflow step that was pinned to `MAX_WORKERS=1` during rollout (F6.2).
4. **Stale-1604 sweep (LR-050 — enumerated, NOT deferred):**
   - `grep -rn "1604" clients/encore/src clients/encore/specs` → every remaining hit is either (a) a per-office map KEY `'1604'` (legitimate — index 0), (b) a comment/doc, or (c) a stale literal → fix (c).
   - `grep -rn "OFFICE_NO" clients/encore` → if zero non-deprecated consumers remain, remove the deprecated `OFFICE_NO` alias from `common.data.ts`; else leave + document why.
   - Stale comments referencing "office 1604 defaults" in migrated data files → reword to "pool office defaults (per-office map)".
   - `--shard` invariant doc (F1.3) confirmed present in `playwright.config.ts`.
5. **Graduate the discipline rule** — add a new `LR-NNN` (grep `docs/read_only_docs/LEARNED_RULES.md` for the next free number) to `.claude/rules/specs.md`: "Per-office test data MUST be resolved via the `office` fixture inside the test/`beforeEach`, never as a module-level const (retry lands on a different worker/office; module consts don't follow)." Trigger: any spec consuming `*_BY_OFFICE` maps.
6. **Full-suite proof** — clean artifacts (LR-024), run FULL suite at `--workers=4` and `--workers=8`; both GREEN. Re-run the original 2-worker repro (was 7/20) → now 20/20. Generate clean HTML/Allure report.
7. **Closure** — Status DONE + Execution Summary (LR-027) on this subplan; parent-cascade close `PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (last subplan); annotate each child DONE line in the parent body; `npm run plans:reindex`.

**Sonnet boundary**: the make-required edit + grep sweep + env edits [SONNET-SAFE]; full-suite runs at 4/8 + flake RCA + closure judgment [OPUS-ONLY].

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Any residual 1604 literal or stale comment surfaced by the sweep → DO-NOW (this subplan IS the sweep). Genuinely separate findings → SPAWN with self-contained prompt. No bare "out of scope".

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) | (none) |
| GIVER | test-cases / test-plans / XLSX | (skipped: no TC semantics change across the initiative; closure verifies parity clean) | `npm run check:tc-parity` exit 0 |
| BUILDER | specs/**/*.spec.ts + page objects (required-param ripple) | required `officeNo` ripple-fixed; full-suite green at 4 & 8 | `cd clients/encore && npx playwright test --workers=8` |
| HEALER | per-fix MD | (none) | (none) |
| WATCHDOG | findings | `/audit` review verdict block on the OPI initiative (in chat) | `/audit` review run |
| GARDENER | refactor citation | new `LR-NNN` in `.claude/rules/specs.md` (resolve-via-fixture rule) + removed `officeNo` defaults | `grep -n "office fixture" .claude/rules/specs.md` |

---

## Acceptance criteria (LR-050 stale-cleanup enumerated)

- [ ] `officeNo` is REQUIRED on all navigation methods; `npm run typecheck` clean (zero straggler call sites — compiler-proven).
- [ ] Hardcoded `HOME_URL` removed from both env files; no consumer reads a static 1604 home.
- [ ] `grep -rn "1604" clients/encore/src clients/encore/specs` → every hit is a map key / comment, ZERO stale literals.
- [ ] Default workers restored (CI=4/local=2, clamped to 8); CI full-suite job no longer pinned to `MAX_WORKERS=1`.
- [ ] New `LR-NNN` (resolve-via-fixture, no module-level per-office const) added to `.claude/rules/specs.md` with next free number (grep-verified non-colliding).
- [ ] **FULL suite GREEN at `--workers=4` AND `--workers=8`** (clean run per LR-024); original 2-worker repro now 20/20.
- [ ] `npm run check:tc-parity` exit 0. `/regression-guard` before/after. Activity-log row (LR-028).
- [ ] Parent `PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` closed (Status DONE + Execution Summary + child annotations) via LR-027 cascade; `npm run plans:reindex` run. Close-gate (LR-055) PASS.
- [ ] `/final-q` verdict block emitted.

---

## Verification

```bash
npx tsc -p clients/encore --noEmit                         # expect: clean (no missing-officeNo errors)
grep -rn "1604" clients/encore/src clients/encore/specs    # expect: only map keys + comments
cd clients/encore && npm run clean && npx playwright test --workers=4   # expect: full suite GREEN
cd clients/encore && npm run clean && npx playwright test --workers=8   # expect: full suite GREEN
grep -n "HOME_URL" clients/encore/config/environments/.env.local clients/encore/config/environments/.env.e2e  # expect: empty (deprecated)
```

---

## Handoff (post-execution)

The initiative is complete: `officeNo` is compiler-required (no silent 1604 fallback can survive), the hardcoded HOME_URL is gone, default workers are back up and clamped to the pool, and the FULL suite is green at workers=4 and 8 — the original 7/20 two-worker flake is now 20/20. The resolve-via-fixture discipline is graduated to a path-scoped rule so future specs can't reintroduce the retry-data-mismatch trap. Parent plan closed via cascade; INDEX reindexed. Raising workers beyond 8 later is a one-line `OFFICE_POOL` append (with a fresh OPI_B-style capture for the new offices).
