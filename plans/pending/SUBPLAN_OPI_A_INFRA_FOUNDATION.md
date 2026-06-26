# SUBPLAN_OPI_A_INFRA_FOUNDATION — pool + worker-office fixture + clamp (backward-compatible, zero specs migrated)

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-04
**Identity**: OWNER
**Parent**: PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md
**Depends on**: none
**Blocks**: SUBPLAN_OPI_B_POOL_SELECTION_ACCESS_CAPTURE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: n/a

---

## Context

Foundation layer for the per-worker office pool (see parent §Strategy). Lands the pool, the worker-scoped `office` fixture, the per-office data TYPES, the `playwright.config.ts` worker clamp, and per-office RCA tagging — **all backward-compatible**. Index 0 of the pool is `1604`, and `OFFICE_NO` is re-sourced to `OFFICE_POOL[0]`, so with **zero specs migrated** the suite behaves exactly as today. This subplan changes no test assertions and adds no office besides 1604; it only makes the machinery exist and proves it inert. Owns edge cases **F1.1 (the discipline rule), F1.2, F1.3 (doc), F8.3 (alias), F10.3**.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap — exports/imports/fixtures snapshot before+after)
- `/relevant` (Phase 0.5 injection)
- `/final-q` (Phase 4 exit per LR-042)

**Context files**:
- `plans/pending/PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (parent)
- `.claude/rules/specs.md` (LR-018/019/022/024 — spec-run discipline)
- `.claude/rules/pipeline.md` (LR-028 activity log, LR-041 frontmatter)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`
- `clients/encore/CLAUDE.md` (LR-ENC-003 env selection; office 1604 facts)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. `Depends on: none` — ready.
2. Read `.claude/context/navigation.md` Exploration Registry for fixtures/config/parallelism findings; reuse instead of re-exploring.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` (filter ALL-* + any GEN-* about fixtures/config).
4. Read `.claude/context/patterns.md` for matching decision trees.
5. LR scan: LR-028 (activity log), LR-018/024 (run-all/clean-before-RCA when verifying).
6. **Browser-tool**: `BrowserTool=none` — pure code + `npx playwright test` runs (the test runner is not a browser-tool choice per LR-038).

---

## Phase 1+ — Actual work

1. **`clients/encore/src/data/office-pool.ts`** (NEW):
   - `export const OFFICE_POOL = ['1604'] as const;` — **index 0 = 1604 only at this stage** (B appends the other 7 after they are confirmed; do NOT invent office numbers here per NEVER-ASSUME).
   - `export type PoolOffice = typeof OFFICE_POOL[number];`
   - `export const POOL_SIZE = OFFICE_POOL.length;`
   - `export function officeForParallelIndex(parallelIndex: number): PoolOffice` — returns `OFFICE_POOL[parallelIndex]`; **throws loudly** if `undefined` (F1.2): message names `parallelIndex`, `POOL_SIZE`, and "clamp workers or grow OFFICE_POOL".
2. **`clients/encore/src/data/office-data.types.ts`** (NEW):
   - `export type ByOffice<T> = Record<PoolOffice, T>;`
   - `export function forOffice<T>(map: ByOffice<T>, office: PoolOffice, mapName: string): T` — throws if the office key is absent (F1.1 runtime net), message names `mapName`, `office`, and the available keys.
3. **`clients/encore/src/fixtures/pages.fixture.ts`**:
   - Add `office: PoolOffice` to `WorkerFixtures`.
   - Add worker-scoped fixture: `office: [async ({}, use, workerInfo) => { const o = officeForParallelIndex(workerInfo.parallelIndex); Log.info(\`[office] parallelIndex=\${workerInfo.parallelIndex} -> office \${o}\`); await use(o); }, { scope: 'worker' }]`.
   - Wire `office` into each page-object fixture's constructor call (3rd arg) — see step 4. Keep existing behavior identical when pool=['1604'].
4. **`clients/encore/src/pages/base.page.ts`**:
   - Constructor gains optional `officeNo: string = OFFICE_POOL[0]`; store `protected readonly officeNo`.
   - `navigateToSubTab(...)` default param becomes `officeNo: string = this.officeNo` (replaces literal `'1604'`).
   - Leave all subclass `navigateToXTab(officeNo = '1604')` defaults AS-IS for now (changed to required only in OPI_Z — F8.3); they still compile and resolve to 1604.
5. **`clients/encore/playwright.config.ts`** — replace the `workers:` expression (currently `:39-41`, `MAX_WORKERS ?? (CI?4:2)`) with a `resolveWorkers()` that computes `requested` as today, then `min(requested, POOL_SIZE)`, `console.warn`-ing when clamped (F1.2). Add a one-line comment forbidding concurrent `--shard` against the shared e2e server unless the pool is globally partitioned (F1.3 doc). NOTE the config also already has `fullyParallel: false` (`:34`) + `dependencies: ['setup']` on the module projects (`:176/:183`) — do not disturb those.
6. **`clients/encore/src/data/common.ts`** (was `common.data.ts` pre-2026-06-05 restructure — `.data` suffix dropped) — re-source `export const OFFICE_NO = OFFICE_POOL[0];` with a `@deprecated Use the office worker fixture` JSDoc (F8.3 backward-compat for unmigrated specs).
7. **`clients/encore/src/reporter/agent-reporter.ts`** (was `src/utils/agent-reporter.ts` pre-restructure — the reporter moved to `src/reporter/`; currently captures `workerIndex` at `:42`/`:229`) — capture `result.parallelIndex` AND the resolved office (read from the test's annotations, or recompute from `parallelIndex` via `officeForParallelIndex`) into the `FailureEntry` + `failure-summary.json` (F10.3 — per-office RCA visibility). Add `parallelIndex`/`office` to the `FailureEntry` interface.
8. **`scripts/check-office-isolation.mjs`** (NEW) + ESLint `no-restricted-syntax` — **standing enforcement** the prior audit adopted (W5) but was never written into a subplan. Gate, at pre-commit (the repo already has ~20 `scripts/*.mjs` + a `.githooks/pre-commit` chain — wire into it) + lint: (a) F1.1 — no module-level `*For(` resolution in spec files (the retry-lands-on-different-office trap); (b) F1.3 — no `--shard` invocation marker against the shared server; (c) no NEW `'1604'` literal introduced in a migrated spec/data file. Scans NEW content so it never wedges legitimate index-0 map keys. **LR-058:** any comment in the shipped script/files = plain English, no internal IDs (write-time jargon hook).

**Sonnet-safe vs Opus**: steps 1–6 are deterministic file edits ([SONNET-SAFE]); step 7 (reporter), step 8 (enforcement script logic) + the verification run + any flake RCA are [OPUS-ONLY].

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Any adjacent infra nit noticed (e.g., a stray `'1604'` literal in a touched file) → DO-NOW if same-file + <30 min, else APPEND a grep-verifiable line to OPI_Z (the stale-1604 sweep) and verify with `grep -F`. No bare "out of scope".

---

## Acceptance criteria

- [ ] `office-pool.ts` + `office-data.types.ts` exist; `officeForParallelIndex` and `forOffice` both throw loudly on miss (unit-exercise by a temporary `--workers=2` log line, then remove).
- [ ] `office` worker fixture resolves and logs `parallelIndex -> office` per worker.
- [ ] `npm run typecheck` clean (`tsc -p clients/encore`).
- [ ] **Full suite green at `MAX_WORKERS=1`** (must match today — LR-018 run-all truth) with zero specs migrated.
- [ ] **Full suite green at `MAX_WORKERS=2`** — NOTE: this still has all specs on 1604, so a 2-worker run may surface the pre-existing clobber. Acceptance = "no NEW failures introduced by this subplan vs the 2-worker baseline"; document the 2-worker baseline failure set so OPI_C–G can show it shrinking. (This subplan does not claim to fix the clobber — only to add inert machinery.)
- [ ] `failure-summary.json` includes `parallelIndex` + `office` fields (F10.3) — confirm by forcing one trivial failure.
- [ ] `scripts/check-office-isolation.mjs` exists + wired into `.githooks/pre-commit`; ESLint `no-restricted-syntax` rule present; gate proven to FLAG a deliberately-planted module-level `*For(` resolution and a new `'1604'` literal, then pass on clean tree (F1.1/F1.3 standing enforcement — W5).
- [ ] `/regression-guard` before/after = the only export/fixture deltas are the intended `office` fixture + new modules.
- [ ] Activity-log row per LR-028 with LR-037 timestamp ≥ touched-file mtimes.
- [ ] `/final-q` verdict block emitted.

---

## Verification

```bash
npx tsc -p clients/encore --noEmit                       # expect: no errors
cd clients/encore && MAX_WORKERS=1 npx playwright test    # expect: same pass set as today
cd clients/encore && MAX_WORKERS=2 npx playwright test    # expect: no NEW failures vs documented 2-worker baseline
grep -n "parallelIndex" clients/encore/src/reporter/agent-reporter.ts  # expect: capture + interface field
grep -n "OFFICE_POOL\[0\]" clients/encore/src/data/common.ts  # expect: OFFICE_NO re-sourced
test -f scripts/check-office-isolation.mjs   # expect: enforcement gate exists (step 8)
```

---

## Handoff (post-execution)

Lands the inert foundation: the pool, the `office` worker fixture, fail-fast accessors, the worker clamp, the deprecated `OFFICE_NO` alias, and per-office RCA tagging. The suite still runs entirely on 1604 (pool has one entry), so nothing about test behavior changes yet — this is the scaffold OPI_B populates with real offices and OPI_C–G migrate specs onto. Next: OPI_B confirms the 7 additional offices, proves the automation user can save them, and captures their baselines.
