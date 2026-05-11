# PLAN: Dynamic Worker Count — inline expression + fullyParallel flip on CI

**Status**: DONE
**Executed**: 2026-05-05
**Priority**: P0-EMERGENCY
**Created**: 2026-05-04
**Updated**: 2026-05-04 (audit-driven simplify per `~/.claude/plans/i-need-u-to-melodic-token.md`; no `resolveWorkerCount()` module, no denylist regex, no LR rule entries, ramp-validation subplan retired and folded in)
**Depends on**: none
**Blocks**: PLAN_VERTICAL_DELIVERY_SOX.md (via `SUBPLAN_DYNAMIC_WORKERS_FRAMEWORK` cascade-closer)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: plan
**BrowserTool**: none
**Skills**: /execute, /regression-guard, /audit, /final-q

---

## Subplan list (post-audit, 1 child)

| # | Subplan | Scope | Depends on |
|---|---|---|---|
| 1 | [SUBPLAN_DYNAMIC_WORKERS_FRAMEWORK.md](plans/pending/SUBPLAN_DYNAMIC_WORKERS_FRAMEWORK.md) | Inline `workers:` expression in 3 configs + flip `fullyParallel: true` on CI module projects + drop `--workers=2` from yml + README line update; cascade-closes this parent | none |

**Retired subplans** (deleted 2026-05-04 per audit):
- `SUBPLAN_DYNAMIC_WORKERS_RAMP_VALIDATION.md` — ramp experiment retired (Q2 lock-in: just bump and observe; no formal gradient). The `fullyParallel: true` flip was folded into FRAMEWORK.

---

## Context

Two `playwright.config.ts` files hardcoded `workers: process.env.CI ? 1 : 2,` ([playwright.config.ts:75](playwright.config.ts:75); [clients/encore/playwright.config.ts:40](clients/encore/playwright.config.ts:40)). The CI config went further with `workers: 1` ([clients/encore/playwright.config.ci.ts:48](clients/encore/playwright.config.ci.ts:48)) and `--workers=2` in the workflow yml. Net result: CI ran at 2 workers, local at 2 workers, no env-var override.

The `2` was leftover scaffolding from the AUTH-STATE-SHARED experiment (2026-04-30, see [active-experiments.md](clients/encore/specs_planning/_internal/active-experiments.md)). The shared `.auth/encore-state.json` mechanism (lock + atomic write in [auth-storage.ts](clients/encore/tests/setup/auth-storage.ts)) already supports N workers — auth is **not** the constraint. The real constraint is server-state contention on shared office=1604.

**User directive (2026-05-04)**: bump CI workers — make it dynamic. Per audit-locked decisions:
- **Q1 local**: stay at 2 (we don't care about local; real tests run in CI against Encore).
- **Q2 ramp**: just bump and see — no formal gradient experiment with metrics archive.
- **Q7 docs**: minimal — README line update only. No LR-ENC-002, no SETUP.md "Parallelism" section, no active-experiments.md update.

CI starting count: **4 workers**, with `fullyParallel: true` on both module projects. Rationale (web research at audit time): `ubuntu-latest` is 2 vCPU, but Playwright tests are I/O-bound (browser + network), so 4 workers on 2 vCPU is workable. The binding constraint is server-state contention on office=1604. 4 will surface state races if they exist; if so, drop to 3 or 2 in a follow-up commit. Sources: [Playwright CI docs](https://playwright.dev/docs/ci), [TestDino](https://testdino.com/blog/optimize-playwright-workers/), [Playwright parallelism](https://playwright.dev/docs/test-parallel).

---

## Recommended approach (post-audit)

### Inline expression in 3 Playwright configs — no new module

```ts
workers: process.env.MAX_WORKERS
  ? Math.max(1, parseInt(process.env.MAX_WORKERS, 10))
  : (process.env.CI ? 4 : 2),
```

Read this as: env override wins; else CI gets 4; else local gets 2.

This is a **3-line expression**, not a function. It lives directly at the `workers:` callsite in three files:
- `playwright.config.ts:75`
- `clients/encore/playwright.config.ts:40`
- `clients/encore/playwright.config.ci.ts:48`

No `src/utils/worker-resolver.ts`. No `WorkerResolverOptions` interface. No 7 unit tests. No `src/index.ts` re-export. No vendor build for this feature.

Why not a function: only two callsites, both at module top-level, neither customizes the formula. A 5-line function would still need to be vendored and re-exported. Inline is simpler at the cost of 3-line duplication. Acceptable.

### Flip `fullyParallel: true` on CI module projects (folded in from retired ramp subplan)

`clients/encore/playwright.config.ci.ts` lines 60 and 67 set `fullyParallel: false` on the two CI projects. Without flipping these, workers > 2 sit idle. Folded into the FRAMEWORK subplan because it's a 2-line change and observation can happen in the same commit.

### Drop `--workers=2` from CI workflow yml

`clients/encore/.github/workflows/playwright-tests.yml:57` has `--workers=2`. This overrides whatever the config decides. Drop it; let the inline expression in the config decide.

### Documentation

Update `clients/encore/README.md` line 81 (one-line update describing CI default + `MAX_WORKERS=N` override). NO `docs/SETUP.md` "Parallelism" section. NO `LR-ENC-002`. NO `verify-no-forbidden.mjs` denylist regex. NO `active-experiments.md` updates.

---

## Critical files (post-audit)

### To create
None.

### To modify
| File | Change |
|---|---|
| `playwright.config.ts:75` | Replace `workers: process.env.CI ? 1 : 2,` with inline expression |
| `clients/encore/playwright.config.ts:40` | Same replacement; update line 35 comment |
| `clients/encore/playwright.config.ci.ts:48` | Replace `workers: 1,` with inline expression |
| `clients/encore/playwright.config.ci.ts:60,67` | Flip `fullyParallel: false` to `true` on both module projects |
| `clients/encore/.github/workflows/playwright-tests.yml` | Drop `--workers=2`; update header comment + job name + step name |
| `clients/encore/README.md` line 81 | One-line update referencing `MAX_WORKERS=N` override |

### Explicitly NOT touching (cut from original plan)
- `src/utils/worker-resolver.ts` (and `src/utils/__tests__/worker-resolver.test.ts`) — no new module
- `src/index.ts` "TESTING / RUNTIME" re-exports — n/a
- `scripts/verify-no-forbidden.mjs` denylist regex — Q7 lock-in
- `clients/encore/CLAUDE.md` LR-ENC-002 — Q7 lock-in
- `docs/SETUP.md` Parallelism section — Q7 lock-in
- `clients/encore/specs_planning/_internal/active-experiments.md` — Q2 lock-in: no ramp experiment ID

---

## Verification

```bash
# 1. All 3 configs load
npx playwright test --list                                                          # expect: lists tests
cd clients/encore && npx playwright test --list                                     # expect: lists tests
cd clients/encore && npx playwright test --list --config=playwright.config.ci.ts    # expect: lists tests

# 2. Override works
MAX_WORKERS=4 npx playwright test --list 2>&1 | head  # expect: 4 workers logged
MAX_WORKERS=8 npx playwright test --list 2>&1 | head  # expect: 8 workers logged

# 3. CI default (no MAX_WORKERS, CI set)
CI=true npx playwright test --list 2>&1 | head  # expect: 4 workers

# 4. Local default (no env vars)
unset MAX_WORKERS CI; npx playwright test --list 2>&1 | head  # expect: 2 workers

# 5. yml clean
grep "\-\-workers" clients/encore/.github/workflows/playwright-tests.yml  # expect: empty

# 6. Suite-pass at CI default
cd clients/encore && CI=true npx playwright test --config=playwright.config.ci.ts \
  --project=encore-local-office --project=encore-locations
# expect: same pass/fail count as pre-change baseline; document any new failures
```

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Higher worker count + `fullyParallel: true` flip triggers optimistic-lock or save-toast races on shared office=1604 | Observe in the next CI run after merge. If new failures surface, drop CI default to 2 and re-flip `fullyParallel: false`. Document the failing TCs as candidates for the dependency-aware migration's per-spec opt-out via project grouping. |
| Future client adds a config that hardcodes `workers` again | Q7 lock-in: no denylist guard. Manual code-review catches it. If recurrence becomes a pattern, add the regex guard then. |
| `MAX_WORKERS=0` or negative breaks Playwright | Expression clamps to `Math.max(1, ...)`. |
| `process.env.CI` semantics differ across runners | GitHub Actions sets `CI=true` (matches our check). GitLab/CircleCI also set `CI`. Generic enough. |

---

## Out of Scope (handled in sibling plans)

- **Dependency-aware test failure isolation** → [PLAN_DEPENDENCY_AWARE_FAILURE.md](plans/pending/PLAN_DEPENDENCY_AWARE_FAILURE.md) (sibling, independent).
- **Pipeline orchestrator changes** — pipeline only triggers single-TC Healer runs today; full-suite-from-pipeline future scope.
- **Per-spec opt-out** — destructive sequences use a Playwright `project` (SP-EFD-01 pattern). Not a per-spec annotation.

---

## Handoff (post-execution)

Cascade-closed via LR-027: SUBPLAN_DYNAMIC_WORKERS_FRAMEWORK (only subplan) flipped DONE 2026-05-05; zero pending subplans of this parent confirmed via grep. Chat-only summary per `feedback_handoff_in_chat_only.md`. Unblocks PLAN_VERTICAL_DELIVERY_SOX.md (which depended on FRAMEWORK closure).

---

## Execution Summary (2026-05-05)

**Sole subplan**: [SUBPLAN_DYNAMIC_WORKERS_FRAMEWORK.md](plans/done/SUBPLAN_DYNAMIC_WORKERS_FRAMEWORK.md) — DONE.

### Outcomes

- **Inline expression** added at all 3 in-scope `playwright.config*.ts` files (`playwright.config.ts`, `clients/encore/playwright.config.ts`, `clients/encore/playwright.config.ci.ts`). Behavior: `MAX_WORKERS=N` env override > `CI ? 4` > local 2. Negative/zero values clamp to 1.
- **CI workflow yml** dropped `--workers=2` flag and the `2-worker` text in job/step/header — config now decides.
- **Documentation** — `clients/encore/README.md` "Tuning parallelism" block rewritten to teach `MAX_WORKERS` env override.
- **Out-of-scope retained** — root `playwright.config.ci.ts` (Jenkins) explicitly stays at `workers: 1` per audit line 365.

### Plan deviation: Phase 2 NOT applied

The audit recommended flipping `fullyParallel: true` on the two CI module projects. **Skipped** per explicit user direction 2026-05-05. The pre-existing uncommitted HARD RULE comment at `clients/encore/playwright.config.ts:28-32` (added during the dep-gate disk-backed registry work) forbids the flip; user re-confirmed via `AskUserQuestion`: *"never 2+ workers on 1 spec, only 1 per spec"*. Compensating doc edits in workflow yml + README call out that `fullyParallel: false` is preserved on CI module projects so dependencyGate within-file ordering holds.

### Suite-pass parity (deferred)

No CI run was triggered as part of this subplan execution. Next manual `gh workflow run playwright-tests.yml` on `main` (or feature branch with these edits) should observe whether CI=4 introduces office=1604 server-state races. Rollback if races surface: drop CI default in the inline expression to 3 or 2 (one-line edit). The fullyParallel:false safeguard plus dep-gate disk-backed registry already absorb within-file ordering races; sibling-file races remain the open risk.

### Downstream

PLAN_VERTICAL_DELIVERY_SOX.md no longer blocked on this plan.
