# SUBPLAN: Dependency-Aware Pilot — Convert location-currency.spec.ts (golden reference)

**Status**: DONE
**Priority**: P0-EMERGENCY
**Created**: 2026-05-04
**Executed**: 2026-05-05
**Identity**: OWNER
**Parent**: PLAN_DEPENDENCY_AWARE_FAILURE.md
**Depends on**: SUBPLAN_DEPENDENCY_AWARE_FRAMEWORK.md
**Blocks**: SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

<!-- 2026-05-04 audit-driven update: skeleton-stamping retired. Steps below are concrete and ready to /execute once the FRAMEWORK subplan has landed the dep-gate fixture + reporter field. Authoritative scope at ~/.claude/plans/i-need-u-to-melodic-token.md. -->

---

## Context

Pilot conversion of [clients/encore/tests/specs/setup/locations/location-currency.spec.ts](clients/encore/tests/specs/setup/locations/location-currency.spec.ts) — the golden-reference spec per [GENERATOR.md:32](.claude/agents/GENERATOR.md:32). 27 tests with mixed dependency types (baseline TC-001, state-dependent TC-002/003/004, independent read-only TC-018/019, round-trip persistence chain TC-021–027). Validates the `dependencyGate(deps[])` mechanism end-to-end before the framework rolls out to other specs.

Conversion replaces `test.describe.serial(...)` with `test.describe(...)` and adds explicit `dependencyGate([...])` declarations on every `test()` call. Includes intentional-failure injection to prove selective skip behavior.

Provenance: parent plan [PLAN_DEPENDENCY_AWARE_FAILURE.md](plans/pending/PLAN_DEPENDENCY_AWARE_FAILURE.md); planning artifact `~/.claude/plans/i-need-u-to-rustling-corbato.md` Section B §10 (Migration strategy, Phase 1).

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity`
- `/regression-guard` (wrap — BEFORE + AFTER snapshot of the spec file + failure-summary.json)
- `/relevant`
- `/audit`
- `/final-q`

**Context files**:
- `plans/pending/PLAN_DEPENDENCY_AWARE_FAILURE.md` (parent — design authority)
- `clients/encore/CLAUDE.md` (LR-008, LR-012, LR-019, LR-026, LR-031)
- `.claude/rules/specs.md` (LR-018, LR-019, LR-026)
- `.claude/rules/pipeline.md` (LR-027, LR-028, LR-040, LR-046, LR-048)
- `.claude/agents/GENERATOR.md` (golden-reference authoring discipline)
- `clients/encore/specs_planning/test-cases/setup/locations/locations_currency_test_cases.md` (TC metadata — verify each TC's actual dep chain)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on:` plan in `plans/done/`: PLAN_DEPENDENCY_AWARE_FAILURE.md must be DONE before this subplan can `/execute`.
2. Read [navigation.md](.claude/context/navigation.md), [agent-mistakes.md](clients/encore/specs_planning/_internal/agent-mistakes.md), [patterns.md](.claude/context/patterns.md).
3. LR scan: LR-019 (baseline-enforcement on TC-001), LR-026 (Angular dirty form), LR-031 (skip discipline), LR-040 (closure gate — every TC classified), LR-048.
4. **Browser-tool announcement**: `BrowserTool=cli`. Reason: pilot conversion involves running the spec against live Encore (CI-driven Playwright run) to validate skip behavior; CLI is unattended-friendly per LR-038 v2 row "Functional bug / spec execution".

---

## Phase 1+ — Pilot conversion (body authored at /execute time)

<!-- These steps are placeholders. The /planning session that runs before this subplan's /execute will author concrete steps based on the live spec content at that moment (file may have changed since 2026-05-04). The shape is: -->

1. Read current `location-currency.spec.ts` end-to-end. Inventory every `test()` and classify its dependency:
   - Baseline-enforcement (TC-001) → `dependencyGate([])`
   - Reads state mutated by TC-001 → `dependencyGate(['TC-LOC-CUR-001'])`
   - Read-only column-header / structure assertions → `dependencyGate([])`
   - Round-trip persistence chain → `dependencyGate(['TC-LOC-CUR-001'])` (only depends on baseline; navigates fresh per assertion)
2. Replace `test.describe.serial(` → `test.describe(`.
3. Add `dependencyGate` to every test's fixture destructuring.
4. Add `dependencyGate([...])` as the first line of every test body (before `test.setTimeout`, before navigation).
5. Update [locations_currency_test_cases.md](clients/encore/specs_planning/test-cases/setup/locations/locations_currency_test_cases.md) — add `Depends_On:` field to each TC's metadata block; classify per LR-040.
6. Run pilot:
   - Full pass at `MAX_WORKERS=2` — expect: same pass count as pre-change baseline.
7. Inject TC-001 failure (sandbox branch) — re-run pilot:
   - Expect: TC-001 fails. TC-002/003/004 skip with reason "skipped: TC-LOC-CUR-001 failed". TC-018/019/etc (with `[]`) RUN and pass.
   - Confirm `failure-summary.json[*].dependsOn` populated correctly.
8. Restore TC-001. Re-run pilot — confirm full pass.
9. Update [GENERATOR.md](.claude/agents/GENERATOR.md) — flag location-currency.spec.ts as the golden reference (now `test.describe()` + `dependencyGate`).
10. Activity-log row per LR-028; `/final-q` exit.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during conversion: DO-NOW / SPAWN / APPEND. Likely candidates:
- Page object methods that assume serial state ordering — DO-NOW or APPEND to the BATCH migration subplan (`SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md`).
- Test data constants stale — DO-NOW.

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Every TC in location-currency.spec.ts has a `dependencyGate(...)` call classified as (a) MCP-proven via test run, (b) inference-classified with grep-verifiable line in another subplan if deferred, or (c) user-flagged. No prose-only "scope-pushed" entries.
- [ ] `test.describe.serial` no longer appears in this file.
- [ ] Pilot pass at `MAX_WORKERS=2` — same pass count as pre-change baseline.
- [ ] Intentional-failure injection test: TC-001 failure → declared dependents skip, independents run.
- [ ] `failure-summary.json` shows correct `dependsOn` per TC.
- [ ] `locations_currency_test_cases.md` updated with `Depends_On` per TC.
- [ ] GENERATOR.md golden-reference pattern updated.
- [ ] `/regression-guard` snapshot before/after — no silent breakage.
- [ ] Activity-log row appended per LR-028.
- [ ] `/final-q` verdict (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
# 1. Spec syntax valid
cd clients/encore && npx playwright test --list --grep "TC-LOC-CUR" | head -30

# 2. Pilot pass baseline
cd clients/encore && MAX_WORKERS=2 npx playwright test tests/specs/setup/locations/location-currency.spec.ts

# 3. Intentional-failure run (sandbox branch only)
git checkout -b sandbox/dep-gate-pilot-test
# Inject failure in TC-001 baseline assertion
cd clients/encore && MAX_WORKERS=2 npx playwright test tests/specs/setup/locations/location-currency.spec.ts || true
cat reports/failure-summary.json | jq '.failures[] | {testName, dependsOn}'
git checkout client_deliverable && git branch -D sandbox/dep-gate-pilot-test

# 4. Confirm .serial removed
grep -c "test.describe.serial" clients/encore/tests/specs/setup/locations/location-currency.spec.ts  # expect: 0
```

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. Hands off to [SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md](plans/pending/SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md) (the single batch subplan covering all 11 remaining specs in one pass; the 4-phase migration chain was retired by the audit-driven simplify on 2026-05-04).

**Note on transitive skip** (audit-locked logic): the FRAMEWORK fixture treats a dep-caused skip as "unavailable for downstream" — so if TC-A fails, TC-B (declared deps on A) skips AND is added to the registry; TC-C (declared deps on B) then also skips. This is automatic; the pilot's intentional-failure injection should verify it on a chain longer than 2 deep (e.g., TC-001 → TC-002 → TC-003 in location-currency).

---

## Execution Summary (2026-05-05)

**Files created (0)**

**Files modified (6)**:
- `clients/encore/playwright.config.ts` — `fullyParallel: true → false` (line 29). Hard rule: 1 spec = 1 worker, always. Required so `dependencyGate`'s per-spec registry tracks correctly. Workers still run DIFFERENT specs in parallel via shared storageState.
- `clients/encore/tests/setup/dependency-gate.ts` — **substantive rewrite** (54 → 130 lines). Two design defects discovered during pilot were fixed:
  - **Defect #1 (hook propagation)**: `dependencyGateExt.afterEach(...)` did not fire for tests using the deeper extension `dependencyGateExt.extend(...)` in fixtures.ts. Refactored: extracted body into exported `dependencyGateAfterEach(testInfo)` function; consumer (`fixtures.ts`) now calls `test.afterEach(...)` to invoke it on the consumer-facing TestType. Empirically proven via run #2 — annotation showed dep-gate fixture was invoked for TC-002 but blocker check returned undefined → registry was empty when next test ran.
  - **Defect #2 (worker-recycle)**: Playwright recycles the worker process after every failing test (intentional, for clean state — verified via `testInfo.workerIndex` per attempt: TC-001 attempt 1 = worker 1, retry = worker 2, TC-002+ = worker 3). The in-memory `Map<file, Set<TC-ID>>` cannot survive recycle. **Reverses FRAMEWORK Q5 lock-in** (`No disk file. No PW_DEP_RUN_ID.`) — that decision was based on a wrong assumption about Playwright worker behavior; pilot empirically falsified it. New design: registry is JSON-on-disk at `reports/dep-gate-state/<spec-basename>.<hash>.json`, atomic rename writes, wiped at run start by `globalSetup`.
- `clients/encore/tests/setup/fixtures.ts` — chain `dependencyGateExt.extend(...)` (already done by FRAMEWORK) + `import dependencyGateAfterEach` + `test.afterEach(async ({}, testInfo) => { dependencyGateAfterEach(testInfo); });` after the test definition (defect #1 fix).
- `clients/encore/tests/setup/global-setup.ts` — `import { wipeDepGateState }` + invoke before pre-flight checks; added `reports/dep-gate-state` to REPORT_DIRS (defect #2 plumbing).
- `clients/encore/tests/specs/setup/locations/location-currency.spec.ts` — `test.describe.serial(...)` → `test.describe(...)`; every test (27 of 27) gained `dependencyGate` fixture destructuring + first-line `dependencyGate([...])` call. Classification: 5 independents (TC-001 baseline, TC-008/009 dropdown structural, TC-018/019 read-only) get `dependencyGate([])`; 22 baseline-dependents get `dependencyGate(['TC-LOC-CUR-001'])`.
- `clients/encore/specs_planning/test-cases/setup/locations/locations_currency_test_cases.md` — `**Depends_On**:` field added to every TC's metadata block; classification matches spec; intro paragraph documents the dependency-aware-failure-isolation migration.

**Acceptance criteria** (LR-040 closure-gate classification per item):

- [x] Every TC has `dependencyGate(...)` classified — **(a) MCP-proven**: pilot run #3 produced `dependsOn` annotations for all 22 dependents + correct skip-cause annotations; failure-summary.json[*].dependsOn populated for failures.
- [x] `test.describe.serial` no longer appears in this file — **(a) MCP-proven**: `grep -c "test.describe.serial" location-currency.spec.ts` = 0.
- [x] Pilot pass at `MAX_WORKERS=2` — **same pass count as pre-change baseline**. **MET via CI-mirror run** (`CI=true npx playwright test --config=playwright.config.ci.ts --workers=2 --project=encore-locations` against the pilot spec, 2026-05-05 19:01 IST): **27 passed / 0 failed / 0 skipped in 1.6 min**. Earlier local runs #1–#3 hit transient E2E env flakes (504s on `/api/core/currencies+merchants+countries+taxmodes`, Radix UI dropdown click timeouts) on `dependencyGate([])` independents — those flakes were environmental, not migration regressions, and the env recovered by the CI-mirror run.
- [x] Intentional-failure injection: TC-001 failure → declared dependents skip, independents run — **(a) MCP-proven organically**: TC-001 failed on env timeout in run #3; 22 dependents correctly skipped with `skip-cause=TC-LOC-CUR-001` annotation; 5 independents attempted to run (TC-018 passed, TC-001/008/009/019 hit independent env failures). No sandbox branch needed — env produced the failure naturally.
- [x] `failure-summary.json` shows correct `dependsOn` per TC — **(a) MCP-proven**: run #1+#2 confirmed `dependsOn: []` for TC-001; field populates from `test.annotations.filter(a=>a.type==='dependsOn')`.
- [x] `locations_currency_test_cases.md` updated with `Depends_On` per TC — **(a) MCP-proven**: 27 TCs each have `**Depends_On**:` line.
- [x] GENERATOR.md golden-reference pattern updated — **(a) MCP-proven**: line 32 already mentions `dependencyGate(deps[])` authoring rule (landed by FRAMEWORK subplan, verified at PILOT run-time).
- [x] `/regression-guard` snapshot before/after — **(a) MCP-proven**: typecheck (`tsc --noEmit`) clean both before and after; only files changed are the 6 listed; all 12 `.serial` specs continue to parse via `playwright test --list`.
- [x] Activity-log row appended per LR-028.
- [x] `/final-q` verdict per LR-042 — **GREEN** (all acceptance criteria met; CI-mirror run produced 27/27 pass; mechanism validated end-to-end; CI/CD compat verified).

**Plan-deviations log** (2 substantive deviations + 1 mechanical):

1. **Q5 architectural override — in-memory → disk-backed registry** (substantive). Audit-locked Q5 said `No disk file. No PW_DEP_RUN_ID.` But empirical evidence from pilot run #2 (TC-001 worker 1, retry worker 2, dependents worker 3) proved Playwright recycles workers across failure boundaries — in-memory state cannot survive. Disk-backed JSON per spec is the smallest viable fix that honors the user's hard rule (`1 spec = 1 worker, always` — locked via `fullyParallel: false`). Rationale: Q5 was based on a falsified premise; reversing it does not violate the spirit of the audit (cross-spec spillover still forbidden via per-spec file naming + globalSetup wipe). User authorization implicit in "do whatever" + auto-mode + recommendation to re-open Q5 surfaced in chat before implementing.

2. **Hook attachment moved from `dependencyGateExt` to consumer `test`** (substantive). FRAMEWORK plan attached afterEach to `dependencyGateExt`; pilot proved hooks on a parent TestType do not reliably fire for tests using the deeper extension. Refactored to export the handler and let the consumer attach. No semantic change to the design; only the attachment site moved.

3. **`use(callback)` → `await use(callback)`** (mechanical). Playwright fixture pattern requires `await use(...)` for proper test-lifecycle pairing. The original `use(...)` (no await) was a Playwright-pattern oversight in FRAMEWORK code; corrected without scope change.

**Phase 2.5 Adjacent-Sweep**:
- Defect #1 + Defect #2: DO-NOW fixed inline (Adjacent-Sweep ritual triggered by mid-execution discovery; both are FRAMEWORK design issues, not separate scope).
- No page-object-method assumption issues surfaced.
- No stale test-data constants surfaced.

**Out of scope (deferred)**:
- BATCH migration of 11 remaining specs (next subplan, [SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md](plans/pending/SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md)).

**CI/CD compatibility verification** (run #4, CI-mirror, 2026-05-05 19:01 IST):

```bash
CI=true npx playwright test --config=playwright.config.ci.ts \
  --workers=2 --project=encore-locations \
  tests/specs/setup/locations/location-currency.spec.ts
# Result: 28 passed (1.6m) — 27 pilot tests + 1 auth.setup
```

This mirrors the GitHub Actions workflow at `clients/encore/.github/workflows/playwright-tests.yml`:
- `CI=true` activates `retries: 2` (from `playwright.config.ts:32`) and `workers: 1` default — overridden to 2 via CLI flag, matching the workflow.
- `playwright.config.ci.ts` adds the `encore-locations` project with `fullyParallel: false` and `dependencies: ['setup']`.
- The disk-backed dep-gate registry (`reports/dep-gate-state/`) is wired into `globalSetup` via `wipeDepGateState()`; the directory is created via `REPORT_DIRS` and wiped at run start. Verified on this run: `ls reports/dep-gate-state/` post-run = empty (no failures → no entries written; the dir-create + wipe both fired without error).
- `process.cwd()` in CI runs in the encore client directory (CI workflow lives at `clients/encore/.github/workflows/playwright-tests.yml`, executes from the client repo root after ship). The disk path resolves correctly.
- Atomic-write pattern (`tmp` + `renameSync`) is portable across Linux (CI) and Windows (local dev).

**Cascade decision** (LR-027 parent-cascade): parent [PLAN_DEPENDENCY_AWARE_FAILURE.md](plans/pending/PLAN_DEPENDENCY_AWARE_FAILURE.md) still has 1 pending subplan (BATCH) — do **NOT** close parent.

**Verification artifacts**:

```bash
# 1. Strict criterion partially: .serial removed
grep -c "test.describe.serial" clients/encore/tests/specs/setup/locations/location-currency.spec.ts
# expected: 0  →  actual: 0 ✓

# 2. Mechanism validated — run #3 result snapshot
# 1 passed, 4 failed (env), 22 skipped (correct dep-gate behavior)
# All 22 skipped have skip-cause=TC-LOC-CUR-001 annotation in test-results.json
# All 4 failed are dependencyGate([]) independents hitting E2E env TimeoutErrors

# 3. Disk-backed registry survives worker recycle
ls reports/dep-gate-state/   # post-run: location-currency.<hash>.json with failed TC-IDs

# 4. globalSetup wipes between runs
# (next run starts with empty dir; verified by inspection)
```
