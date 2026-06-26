# SUBPLAN_OPI_Z_FINAL_FLIP_AND_CLEANUP — make officeNo required, flip workers up, full-suite green at 4 & 8, sweep stale 1604

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-04
**Identity**: OWNER
**Parent**: PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md
**Depends on**: SUBPLAN_OPI_D_MIGRATE_LOCATIONS_BATCH.md, SUBPLAN_OPI_E_MIGRATE_SSL_AND_HISTORY.md, SUBPLAN_OPI_F_MIGRATE_LOCAL_OFFICE.md, SUBPLAN_OPI_G_MIGRATE_CORP_PRICING.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: final compiler-enforced removal of `officeNo` defaults across ~23 page-object methods (re-verified 2026-06-12; was estimated "~44") + full-suite parallel run at workers=4/8 with RCA of any residual flake + parent closure = max-judgment closure work → Opus `max`.

---

## Context

Closure subplan. With all specs migrated (OPI_C/D/E/F locations + local-office, **OPI_G corp-pricing**), this removes the `officeNo='1604'` defaults (making the parameter REQUIRED so the compiler flags any straggler call site — F8.3), deprecates the hardcoded `HOME_URL` env (F8.1), decides the corp-pricing project question (**F11.3** — add a dedicated `encore-corporate-pricing` project vs include the `chromium` catch-all in the flipped parallel run, per OPI_G's handoff), flips the default worker counts back up, proves the **FULL suite green at workers=4 and workers=8** (the clobber is gone), sweeps residual 1604 literals (LR-050 stale-cleanup, enumerated below — not deferred), graduates the "resolve-via-fixture / no module-level per-office const" discipline into a rule, and closes the parent (LR-027 cascade). This is a restructure-class change, so the stale-cleanup is enumerated in-scope per LR-050.

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

1. Confirm OPI_D, OPI_E, OPI_F, OPI_G all in `plans/done/`.
2–5. navigation.md, agent-mistakes, patterns.md, LR scan (LR-018/024 run-all+clean, LR-027/050/055 closure, LR-ENC-003 env).
6. **Browser-tool**: `BrowserTool=cli`. Full-suite runs via runner; any residual flake RCA = HEADED cli (LR-038 `/rca`, no override).

---

## Phase 1+ — Actual work

1. **Make `officeNo` required (F8.3)** — remove the `= '1604'` / `= OFFICE_POOL[0]` defaults from the ~23 page-object navigation methods (12 files, re-verified 2026-06-12) + `base.page.ts` so `officeNo` is a required param. `npm run typecheck` now ERRORS on any call site that didn't pass `office` → fix each (there should be none if C–G were complete; any error is a found straggler). This is the compiler-enforced proof of complete migration.
2. **Deprecate hardcoded HOME_URL (F8.1)** — remove `HOME_URL=.../locations/1604/home` from the client-root env files `clients/encore/.env.e2e` (confirmed present at `:11`, 2026-06-12) and `clients/encore/.env.local` (gitignored — verify + remove at execution); derive home per-office from `base_url` + office wherever `config.home_url` (`src/utils/env-config.ts:25`) is consumed (auto-addon `/home` poll, any landing nav). Confirm no consumer reads the static 1604 home.
3. **Flip default workers up** — restore `playwright.config.ts` defaults to CI=4 / local=2 (still clamped to POOL_SIZE=8); confirm `MAX_WORKERS` override still clamps. Update any CI workflow step that was pinned to `MAX_WORKERS=1` during rollout (F6.2).
3a. **Decide the corp-pricing project (F11.3, from OPI_G handoff)** — corp-pricing currently runs under the `chromium` catch-all (`playwright.config.ts:134-136`), not a module project. EITHER add a dedicated `encore-corporate-pricing` project (testDir `./tests/corporate-pricing`, `dependencies:['setup']`, `fullyParallel:false`, clamped to POOL_SIZE) so corp-pricing runs module-parallel + isolated like locations, OR confirm the flipped run includes `chromium` with the same clamp. Do NOT leave corp-pricing on a different worker policy than locations. (The CI-gap F11.4 — corp-pricing absent from `playwright-tests.yml` — stays a SEPARATE CI finding; flag, don't fix here.)
4. **Stale-1604 sweep (LR-050 — enumerated, NOT deferred):**
   - `grep -rn "1604" clients/encore/src clients/encore/tests` → every remaining hit is either (a) a per-office map KEY `'1604'` (legitimate — index 0), (b) a comment/doc, or (c) a stale literal → fix (c). **Scope:** locations + local-office + **corporate-pricing** (OPI_G migrated it — its residual 1604 is swept too; the only legit corp-pricing 1604 is the `CORP_PRICING_FIXTURES_BY_OFFICE` map KEY).
   - `grep -rn "OFFICE_NO" clients/encore` → if zero non-deprecated consumers remain, remove the deprecated `OFFICE_NO` alias from `src/data/common.ts` (was `common.data.ts` pre-restructure); else leave + document why.
   - Stale comments referencing "office 1604 defaults" in migrated data files → reword to "pool office defaults (per-office map)".
   - `--shard` invariant doc (F1.3) confirmed present in `playwright.config.ts`.
5. **Graduate the discipline rule** — add a new `LR-NNN` (grep `docs/read_only_docs/LEARNED_RULES.md` for the next free number) to `.claude/rules/specs.md`: "Per-office test data MUST be resolved via the `office` fixture inside the test/`beforeEach`, never as a module-level const (retry lands on a different worker/office; module consts don't follow)." Trigger: any spec consuming `*_BY_OFFICE` maps.
6. **Full-suite proof** — clean artifacts (LR-024), run FULL suite at `--workers=4` and `--workers=8`; both GREEN. Re-run the original 2-worker repro (was 7/20) → now 20/20. Generate clean HTML/Allure report.
7. **Closure** — Status DONE + Execution Summary (LR-027) on this subplan; parent-cascade close `PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (last subplan); annotate each child DONE line in the parent body; `npm run plans:reindex`. **Record in the Execution Summary the one accepted KNOWN LIMITATION:** office state is reset via UI `ensureDefaultState` (LR-019), NOT an API — a worker that crashes mid-save can leave residual server-side state that UI clicks may not fully undo; this is rare and mitigated by per-test baseline reset + OPI_B's verify-clean preflight, and was a deliberate choice (no backend reset/provision API exists — see master Model-choice rationale), not an oversight.

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
- [ ] `grep -rn "1604" clients/encore/src clients/encore/tests` → every hit (locations + local-office + corp-pricing scope) is a map key / comment, ZERO stale literals.
- [ ] Default workers restored (CI=4/local=2, clamped to 8); CI full-suite job no longer pinned to `MAX_WORKERS=1`.
- [ ] OPI_A's `scripts/check-office-isolation.mjs` + ESLint guard still active and green on the final tree (no module-level `*For(` resolution, no new 1604 literal).
- [ ] New `LR-NNN` (resolve-via-fixture, no module-level per-office const) added to `.claude/rules/specs.md` with next free number (grep-verified non-colliding).
- [ ] **FULL suite GREEN at `--workers=4` AND `--workers=8`** (clean run per LR-024); original 2-worker repro now 20/20.
- [ ] `npm run check:tc-parity` exit 0. `/regression-guard` before/after. Activity-log row (LR-028).
- [ ] Parent `PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` closed (Status DONE + Execution Summary + child annotations) via LR-027 cascade; `npm run plans:reindex` run. Close-gate (LR-055) PASS.
- [ ] `/final-q` verdict block emitted.

---

## Verification

```bash
npx tsc -p clients/encore --noEmit                         # expect: clean (no missing-officeNo errors)
grep -rn "1604" clients/encore/src clients/encore/tests    # expect: only map keys + comments (locations + local-office + corp-pricing scope)
cd clients/encore && npm run clean && npx playwright test --workers=4   # expect: full suite GREEN
cd clients/encore && npm run clean && npx playwright test --workers=8   # expect: full suite GREEN
grep -n "HOME_URL" clients/encore/.env.local clients/encore/.env.e2e   # expect: empty (deprecated; env files live at client root post-2026-06-05, NOT config/environments/)
```

---

## Handoff (post-execution)

The initiative is complete: `officeNo` is compiler-required (no silent 1604 fallback can survive), the hardcoded HOME_URL is gone, default workers are back up and clamped to the pool, and the FULL suite is green at workers=4 and 8 — the original 7/20 two-worker flake is now 20/20. The resolve-via-fixture discipline is graduated to a path-scoped rule so future specs can't reintroduce the retry-data-mismatch trap. Parent plan closed via cascade; INDEX reindexed. Raising workers beyond 8 later is a one-line `OFFICE_POOL` append (with a fresh OPI_B-style capture for the new offices).
