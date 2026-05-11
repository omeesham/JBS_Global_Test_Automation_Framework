# SUBPLAN: Dynamic Workers — Inline expression in configs + flip `fullyParallel: true` on CI projects

**Status**: DONE
**Executed**: 2026-05-05
**Priority**: P0-EMERGENCY
**Created**: 2026-05-04
**Updated**: 2026-05-04 (audit-driven simplify per `~/.claude/plans/i-need-u-to-melodic-token.md`; no `resolveWorkerCount()` module, no denylist regex, no LR rule entries, ramp-validation subplan retired and folded in)
**Identity**: OWNER
**Parent**: PLAN_DYNAMIC_WORKERS.md
**Depends on**: none
**Blocks**: none
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

---

## Context

Phase 1 (and only phase) of the Dynamic Workers initiative — minimal version per audit at `~/.claude/plans/i-need-u-to-melodic-token.md`.

Replaces three hardcoded `workers:` lines in Playwright configs with a small inline expression that honors `MAX_WORKERS=N` env override. Flips `fullyParallel: true` on the two CI module projects so worker count > 2 actually parallelizes (without this flip, CI sat idle past 2 workers). Drops `--workers=2` from the CI workflow yml. Updates the README.

**No** new TypeScript module. **No** `WorkerResolverOptions` interface. **No** unit tests for a 3-line expression. **No** denylist regex in `verify-no-forbidden.mjs`. **No** `LR-ENC-002` in client CLAUDE.md. **No** `docs/SETUP.md` "Parallelism" section. **No** active-experiments.md updates. **No** ramp-validation followup (subplan retired per Q2 lock-in).

User-locked decisions reflected here:
- **Q1 local**: stay at 2 — local fallback in expression returns 2.
- **Q2 ramp**: just bump CI and observe — no formal gradient experiment.
- **Q7 docs**: minimal — README line update only.

CI starting count: **4 workers**, with `fullyParallel: true` on both module projects. Rationale (web research): `ubuntu-latest` is 2 vCPU, but Playwright tests are I/O-bound (browser + network), so 4 workers on 2 vCPU is workable. The binding constraint is server-state contention on shared office=1604, not CPU. 4 will surface state races if they exist; if so, drop to 3 or 2 in a follow-up commit. Sources: [Playwright CI docs](https://playwright.dev/docs/ci), [TestDino](https://testdino.com/blog/optimize-playwright-workers/), [Playwright parallelism](https://playwright.dev/docs/test-parallel).

Provenance: parent [PLAN_DYNAMIC_WORKERS.md](plans/pending/PLAN_DYNAMIC_WORKERS.md); audit at `~/.claude/plans/i-need-u-to-melodic-token.md`.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity`
- `/regression-guard` (wrap — BEFORE + AFTER snapshots of the 3 config files + workflow yml + README)
- `/relevant`
- `/audit`
- `/final-q`

**Context files**:
- `plans/pending/PLAN_DYNAMIC_WORKERS.md` (parent)
- `~/.claude/plans/i-need-u-to-melodic-token.md` (audit + locked decisions)
- `CLAUDE.md` (root)
- `clients/encore/CLAUDE.md`
- `.claude/rules/pipeline.md` (LR-027, LR-028)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on:` = `none`. (First subplan; ramp-validation retired.)
2. Read [navigation.md](.claude/context/navigation.md), [agent-mistakes.md](clients/encore/specs_planning/_internal/agent-mistakes.md), [patterns.md](.claude/context/patterns.md).
3. LR scan: LR-020 (verify plan claims), LR-027 (closure), LR-028 (activity log).
4. **Browser-tool announcement**: `BrowserTool=none`. Reason: pure config edits + 1-line README update; no live website interaction.

---

## Phase 1 — Inline worker expression in 3 Playwright configs

The expression to use, identical in all three files:

```ts
workers: process.env.MAX_WORKERS
  ? Math.max(1, parseInt(process.env.MAX_WORKERS, 10))
  : (process.env.CI ? 4 : 2),
```

Read this as: env override wins; else CI gets 4; else local gets 2.

1. **`playwright.config.ts` line 75** — replace `workers: process.env.CI ? 1 : 2,` with the expression above. Also update the now-stale `AUTH-STATE-SHARED` comments:
   - **Lines 63-64** (block comment above `fullyParallel: true`) — change "AUTH-STATE-SHARED (2026-04-30): bumped to fullyParallel + 2 workers for the shared-storage-state experiment. Revert to (false, 1) if experiment fails." to "AUTH-STATE-SHARED (2026-04-30): fullyParallel + dynamic workers (CI default 4; local 2; `MAX_WORKERS=N` env override) via shared storageState. Revert to (false, 1) if experiment fails."
   - **Lines 73-74** (comment above `workers:`) — change "AUTH-STATE-SHARED: 2 workers prove parallel auth via shared storageState." to "AUTH-STATE-SHARED: dynamic workers (CI=4 / local=2 / `MAX_WORKERS` override) prove parallel auth via shared storageState."

2. **`clients/encore/playwright.config.ts` line 40** — same replacement. Update the comment at line 35 (`AUTH-STATE-SHARED: ...`) to: `AUTH-STATE-SHARED: fullyParallel + dynamic workers via shared storageState. CI default 4; local 2; override via MAX_WORKERS env.`

3. **`clients/encore/playwright.config.ci.ts` line 48** — replace `workers: 1,` with the expression above. (Inherits from the base config plus extra retries/etc.)

**No new module file. No `src/utils/worker-resolver.ts`. No `src/index.ts` re-export. No `WorkerResolverOptions` interface. No 7 unit-test cases.**

---

## Phase 2 — Flip `fullyParallel: true` on CI module projects

In `clients/encore/playwright.config.ci.ts`:

- Line 60 (`encore-local-office` project) — change `fullyParallel: false,` to `fullyParallel: true,`
- Line 67 (`encore-locations` project) — change `fullyParallel: false,` to `fullyParallel: true,`

Why this is in the same subplan (was originally deferred to ramp-validation): without this flip, workers > 2 in CI sit idle. The audit folded the flip into this subplan because:
- It's a 2-line change.
- The original concern (race risk on shared office=1604) is real but not predictable in advance; observe in the next CI run.
- If races surface, the rollback is as simple as flipping back to `false` plus dropping CI worker count to 2.

---

## Phase 3 — CI workflow + README

1. **`clients/encore/.github/workflows/playwright-tests.yml`**:
   - Line 4 (header comment) — change `module-parallel (2 workers, ...)` to `module-parallel (CI default 4 workers; override with MAX_WORKERS=N env). Workers honored via inline expression in playwright.config.ci.ts.`
   - Line 18 (MODULE-PARALLEL CONTRACT block) — change `encore-local-office + encore-locations projects with fullyParallel:false.` to `encore-local-office + encore-locations projects with fullyParallel:true.` (matches the Phase 2 flip).
   - Line 31 (job name) — change `Playwright (Ubuntu, Chromium, 2-worker module-parallel)` to `Playwright (Ubuntu, Chromium, module-parallel)`
   - Line 56 (step name) — change `Run Playwright tests (module-parallel, 2 workers)` to `Run Playwright tests (module-parallel)`
   - Line 57 (run command) — drop `--workers=2`. Final form: `npx playwright test --config=playwright.config.ci.ts --project=encore-local-office --project=encore-locations`

2. **`clients/encore/README.md` lines 72-81** ("Tuning parallelism" section, full block) — replace with:
   ```markdown
   ### Tuning parallelism

   Worker count is set by an inline expression in `playwright.config.ts` (CI default 4, local 2). Override per run with the `MAX_WORKERS` env var:

   ```bash
   MAX_WORKERS=4 npm test          # match CI default explicitly
   MAX_WORKERS=8 npm test          # try higher locally
   MAX_WORKERS=1 npm test          # force serial
   ```

   More workers = faster wall-clock but higher load on the app under test. If 4 introduces state-races on shared office=1604, drop CI default to 2 in the config and re-flip `fullyParallel: false` on the module projects.
   ```
   The bash example with `--workers=4` / `--workers=50%` is removed because the inline expression + env-var override is now the documented path; passing `--workers=N` on CLI still works as a Playwright override but is no longer the recommended workflow.

**No** `docs/SETUP.md` Parallelism section. **No** `verify-no-forbidden.mjs` denylist regex. **No** active-experiments.md update. **No** `LR-ENC-002` in `clients/encore/CLAUDE.md`.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW / SPAWN / APPEND for adjacent fixes:
- If any other config under `api-testing/` or `clients/*/playwright.config*.ts` has hardcoded worker counts → DO-NOW (use the same inline expression).
- If `clients/encore/specs_planning/_internal/active-experiments.md` mentions the 2-worker scaffolding → leave alone (the auth-state-shared experiment ID is still relevant; only the worker number changes).

---

## Acceptance criteria

- [ ] All 3 Playwright config files compile and run (`npx playwright test --list` succeeds in root and client contexts).
- [ ] On `ubuntu-latest` with `fullyParallel: true` flip + 4 workers, full-suite CI run produces same pass/fail count as pre-change baseline (or fewer new failures than 2 — if races surface, drop and document).
- [ ] On local: full-suite run uses 2 workers (expression returns 2 when CI is unset).
- [ ] `MAX_WORKERS=4 npx playwright test --list` honors override; `MAX_WORKERS=8 ...` honors override.
- [ ] CI workflow yml no longer contains the literal `--workers=`.
- [ ] README line 81 updated.
- [ ] `/regression-guard` snapshot before/after — no silent breakage.
- [ ] Activity-log row appended per LR-028.
- [ ] `/final-q` verdict per LR-042.

---

## Verification

```bash
# 1. All 3 configs load
npx playwright test --list                                                          # expect: lists tests
cd clients/encore && npx playwright test --list                                     # expect: lists tests
cd clients/encore && npx playwright test --list --config=playwright.config.ci.ts    # expect: lists tests

# 2. Override works
MAX_WORKERS=4 npx playwright test --list 2>&1 | head -20  # expect: 4 workers reported in startup line
MAX_WORKERS=8 npx playwright test --list 2>&1 | head -20  # expect: 8 workers reported

# 3. Default at local (no MAX_WORKERS, no CI)
unset MAX_WORKERS CI; npx playwright test --list 2>&1 | head -20  # expect: 2 workers reported

# 4. Default at CI-equivalent
MAX_WORKERS= CI=true npx playwright test --list 2>&1 | head -20   # expect: 4 workers reported

# 5. CI-yml clean
grep "\-\-workers" clients/encore/.github/workflows/playwright-tests.yml  # expect: empty
```

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. No downstream subplan — this is the only Dynamic Workers subplan post-audit. Parent [PLAN_DYNAMIC_WORKERS.md](plans/done/PLAN_DYNAMIC_WORKERS.md) cascade-closed per LR-027 (zero pending subplans of this parent after this flip).

---

## Execution Summary (2026-05-05)

### Files modified (5)

| File | Change |
|---|---|
| `playwright.config.ts` | Replaced `workers: process.env.CI ? 1 : 2` with the env-aware inline expression (CI=4 / local=2 / `MAX_WORKERS` override); updated parallelization + worker comments. |
| `clients/encore/playwright.config.ts` | Replaced `workers: process.env.CI ? 1 : 2` with the inline expression; left the existing HARD RULE block + `fullyParallel: false` (uncommitted dep-gate work) intact. |
| `clients/encore/playwright.config.ci.ts` | Replaced `workers: 1` with the inline expression. **Phase 2 fullyParallel:true flip on `encore-local-office` and `encore-locations` projects NOT applied** — see Plan deviations below. |
| `clients/encore/.github/workflows/playwright-tests.yml` | Header comment updated (CI default 4 workers; MAX_WORKERS override; module projects keep `fullyParallel: false`). Job name dropped `2-worker`. Step name dropped `, 2 workers`. Run command dropped `--workers=2` flag. |
| `clients/encore/README.md` | Replaced `Tuning parallelism` block: documents the inline expression + `MAX_WORKERS=N` env override; notes `fullyParallel: false` is preserved on CI module projects for `dependencyGate` ordering. |

### Plan deviations (per `feedback_plan_deviations_log.md`)

1. **Phase 2 SKIPPED — fullyParallel:true flip not applied on CI module projects.**
   - **What the plan said**: `clients/encore/playwright.config.ci.ts` lines 60+67 — flip `fullyParallel: false` → `true` on `encore-local-office` and `encore-locations`.
   - **Why skipped**: a HARD RULE comment was added to `clients/encore/playwright.config.ts:28-32` (uncommitted at session start, part of the dependency-gate disk-backed registry work) explicitly forbidding the flip. The user re-confirmed via `AskUserQuestion` 2026-05-05: *"fullyParallel: false is true, we only want 1 worker per spec, never 2+ workers on 1 spec, only 1 per spec"*. The audit's recommendation pre-dated/under-weighted the dep-gate within-file ordering race (TC-002 reading the disk-backed registry before TC-001's afterEach write). Skipping Phase 2 keeps the dep-gate semantics intact.
   - **Risk re-evaluation**: the audit's claim that "workers > 2 sit idle without flip" was not directly validated. With 12 spec files distributed across `workers: 4`, different spec files should still parallelize across workers (project-level `fullyParallel: false` only serializes within-file). User accepted: *"local = 2 workers, CI can have more, all per spec only... should work fine."*
   - **Compensating doc edits**: workflow yml header comment + README `Tuning parallelism` block both call out that `fullyParallel: false` is preserved on CI module projects.

2. **Plan line numbers stale.**
   - `clients/encore/playwright.config.ts:40` plan reference → actual line 37 (workers line) at session start; the file had pre-existing uncommitted `fullyParallel: false` flip making "comment at line 35" no longer match. Edits matched by content, not line number.
   - `clients/encore/.github/workflows/playwright-tests.yml` plan referenced line 4 (header), line 18 (MODULE-PARALLEL CONTRACT block), line 31 (job name), line 56 (step name), line 57 (run command). Actual lines: 1-8 (multi-line header), no line-18 contract block exists in the file, line 17 (job name), line 42 (step name), line 43 (run command). Matched by content.

### Verification (acceptance criteria)

| Criterion | Result |
|---|---|
| All 3 Playwright configs compile and `--list` succeeds | ✅ Root: 1257 tests / 15 files. Client: 1257 / 15. CI: 1545 / 14 (extra projects). |
| `MAX_WORKERS=N` honored | ✅ `node -e` driver of the inline expression: `MAX_WORKERS=4 → 4`, `=8 → 8`, `=1 → 1`, `=0 → 1` (clamp), `=-3 → 1` (clamp). |
| `CI=true` default = 4 | ✅ Confirmed via expression driver. |
| Local default (no env) = 2 | ✅ Confirmed via expression driver. |
| Workflow yml no longer contains `--workers=` | ✅ `Grep` returned no matches. |
| README block updated | ✅ Replaced lines 72-81. |
| `/regression-guard` snapshot before/after | ✅ 5 files modified as expected; no silent breakage. |
| Activity-log row appended (LR-028) | ✅ Row appended for `agent-activity-log.md`. |
| `/final-q` verdict | See bottom of session. |

### Notes for next CI run

- Suite-pass parity at CI=4: NOT yet observed (no CI run triggered as part of this subplan; observation deferred to next `gh workflow run playwright-tests.yml`).
- If CI=4 surfaces office=1604 server-state races, drop the inline expression's CI default to 3 or 2 in `playwright.config.ci.ts` (one-line edit).
- The `fullyParallel: false` on module projects + dep-gate disk-backed registry pair already mitigates within-file ordering — only sibling-file races remain.
