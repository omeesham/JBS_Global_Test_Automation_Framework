# PLAN: Dependency-Aware Failure Isolation — `dependencyGate(deps[])` fixture + phased migration

**Status**: DONE
**Priority**: P0-EMERGENCY
**Created**: 2026-05-04
**Executed**: 2026-05-05
**Updated**: 2026-05-04 (audit-driven simplify per `~/.claude/plans/i-need-u-to-melodic-token.md`; client-only scope, no `src/testing/`, no disk state, 4-phase migration chain folded into a single batch, minimal docs)
**Depends on**: none
**Blocks**: PLAN_VERTICAL_DELIVERY_SOX.md (via `SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING` cascade-closer)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: none
**Skills**: /execute, /regression-guard, /audit, /final-q

---

## Subplan list (post-audit, 3 children)

| # | Subplan | Scope | Depends on |
|---|---|---|---|
| 1 | [SUBPLAN_DEPENDENCY_AWARE_FRAMEWORK.md](plans/pending/SUBPLAN_DEPENDENCY_AWARE_FRAMEWORK.md) | Land in-memory fixture (`clients/encore/tests/setup/dependency-gate.ts`) + `dependsOn` reporter field + minimal agent/rule docs | none |
| 2 | [SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md](plans/pending/SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md) | Convert `location-currency.spec.ts` (golden reference) | SUBPLAN_DEPENDENCY_AWARE_FRAMEWORK.md |
| 3 | [SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md](plans/pending/SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md) | Convert all 11 remaining `.serial` specs in one batch; cascade-closes this parent | SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md |

**Retired subplans** (deleted 2026-05-04 per audit):
- `SUBPLAN_DEPENDENCY_AWARE_MIGRATION_READ_HEAVY.md` — folded into BATCH (Q3 lock-in)
- `SUBPLAN_DEPENDENCY_AWARE_MIGRATION_STATE_HEAVY.md` — folded into BATCH (Q3 lock-in)

---

## Context

12 of 13 specs in `clients/encore/tests/specs/` use `test.describe.serial(...)`. Playwright's `.serial` mode auto-skips ALL subsequent tests on the first failure — confirmed unoverridable per Playwright issues [#18329](https://github.com/microsoft/playwright/issues/18329) (closed not-planned), [#34279](https://github.com/microsoft/playwright/issues/34279) (open, no resolution), [#18752](https://github.com/microsoft/playwright/issues/18752). When `TC-LOC-CUR-001` fails on auth flake, `TC-LOC-CUR-018` (an unrelated read-only column-header assertion) is silently skipped — losing 25+ tests of signal per file per failure.

**User directive (2026-05-04)**: apply across all current and future specs (framework-grade in spirit, but client-only in implementation per audit Q4 lock-in). Per audit-locked decisions:
- **Q3 migration**: pilot one spec → confirm → batch the other 11 in one pass. Not a 4-phase chain.
- **Q4 location**: dep-gate file = `clients/encore/tests/setup/dependency-gate.ts` (client-only). NOT `src/testing/`.
- **Q5 scope**: cross-spec spillover forbidden — registry scoped per `testInfo.file`. In-memory only, no disk state.
- **Q6 schema-change safety**: enumerate `failure-summary.json` consumers BEFORE adding `dependsOn` field (verified safe — no consumer dereferences the field today).
- **Q7 docs**: minimal — 1 sentence each in GENERATOR.md + HEALER.md, LR-019 wording tweak. No LR-ENC-003.
- **Transitive skip** (user contribution): A→B→C cascading via "dep-caused skip propagates" annotation marker.

---

## Recommended approach (post-audit)

### Drop `.serial` for new specs; use `test.describe()` + `dependencyGate(deps[])` fixture from `clients/encore/tests/setup/dependency-gate.ts`

Why drop `.serial`: confirmed unoverridable. The cascade-skip happens before any fixture/hook runs. There is no flag, plugin, or hook that lets us intercept it. Any solution that "keeps `.serial` but selectively un-skips" is impossible without forking Playwright.

### How the fixture works

- **In-memory** `Map<file, Set<TC-ID>>` — registry is per-spec-file (Q5 lock-in).
- `dependencyGate(deps: string[])` is called as the first line of each test body. It:
  1. Pushes `{ type: 'dependsOn', description: dep }` onto `testInfo.annotations` for every declared dep (visible in HTML reporter, parseable by `agent-reporter.ts`).
  2. Looks up the per-file registry; if any declared dep is in it → marks skip-cause annotation + calls `test.skip()`.
- `afterEach` hook attached to the extended TestType: on `failed`/`timedOut`, parse TC-ID and add to registry. On `skipped` WITH the skip-cause marker, also add (transitive propagation per user's logic).
- Tests that DON'T destructure `dependencyGate` still flow through `afterEach` (defense in depth — non-gated failed tests still register so future-gated downstream tests skip correctly).

### Authoring discipline (one sentence in GENERATOR.md)

```ts
test('TC-LOC-CUR-001: Baseline navigation', async ({ ..., dependencyGate }) => {
  dependencyGate([]); // root test — no deps, always runs
  // ...
});

test('TC-LOC-CUR-002: USD default after baseline save', async ({ ..., dependencyGate }) => {
  dependencyGate(['TC-LOC-CUR-001']); // depends on baseline
  // ...
});

test('TC-LOC-CUR-018: Currency Code column read-only', async ({ ..., dependencyGate }) => {
  dependencyGate([]); // independent — runs even if TC-001 failed
  // ...
});
```

Rules: every test calls `dependencyGate(...)` exactly once at the top, before any assertion. `dependencyGate([])` = independent. The first test in any block that establishes baseline state (LR-019) always uses `[]`. Read-only assertion tests use `[]` unless they specifically read state mutated by a prior TC.

### Healer impact (one sentence in HEALER.md)

`agent-reporter.ts` adds `dependsOn: string[]` to `FailureEntry` (extracted from `testInfo.annotations`). HEALER's grep-pattern construction becomes machine-driven: read `failure-summary.json` → for each failed TC, build pattern as `"<dep1>|<dep2>|<failing-tc>"` from the recorded `dependsOn`. Manual prior-test analysis only when `dependsOn` is empty (unconverted spec).

### Migration shape

- **Phase 1 (FRAMEWORK)**: `clients/encore/tests/setup/dependency-gate.ts` lands; `agent-reporter.ts` gets `dependsOn` field; client `fixtures.ts` chains the extender; minimal agent/rule docs touched. Existing `.serial` specs continue to pass — fixture is opt-in.
- **Phase 2 (PILOT)**: convert `location-currency.spec.ts` (golden reference per GENERATOR.md). Validates the mechanism on a 27-test spec with mixed dep types + transitive chain.
- **Phase 3 (BATCH)**: all 11 remaining specs migrated in one pass. Strict criterion (LR-046): `grep -rc "test.describe.serial" clients/encore/tests/specs/` returns zero after closure.

Cross-spec dependencies (TC-A in spec1 → TC-B in spec2): NOT supported per Q5 lock-in. Registry is per-spec-file. If genuinely needed in future, use Playwright `project.dependencies` (already used for `setup` → `chromium`) or upgrade the registry to global. Out of scope for this plan.

---

## Critical files (post-audit)

### To create
| File | Purpose |
|---|---|
| `clients/encore/tests/setup/dependency-gate.ts` | In-memory `dependencyGate(deps[])` fixture + per-file registry + afterEach hook |

### To modify
| File | Change |
|---|---|
| `src/utils/agent-reporter.ts` (lines 19-53) | Add `dependsOn: string[]` to `FailureEntry`; populate from `result.annotations` in `onTestEnd` |
| `clients/encore/dist/framework/utils/agent-reporter.{js,d.ts}` | Regenerated by `npm run vendor:build -- --client=encore` (not hand-edited) |
| `clients/encore/tests/setup/fixtures.ts` (line 59) | Chain `dependencyGateExt` before `.extend<TestFixtures, WorkerFixtures>(...)`; add `dependencyGate` to `TestFixtures` type |
| `.claude/agents/GENERATOR.md` (line 32, Phase 1) | Append 1 sentence describing the `dependencyGate(deps[])` authoring pattern |
| `.claude/agents/HEALER.md` (line 38, Cycle 1) | Append 1 sentence describing the auto-grep from `failure-summary.json[*].dependsOn` |
| `.claude/rules/specs.md` (LR-019, lines 26+37) | Reword to drop `.serial`-specific framing; "First test in any spec MUST enforce baseline state" |
| 12 spec files in `clients/encore/tests/specs/` (per pilot + batch) | Drop `.serial`, add `dependencyGate(...)` per test |

### Explicitly NOT touching (cut from original plan)
- `src/testing/dependency-gate.ts` (and barrel) — Q4 lock-in: client-only
- `src/index.ts` "TESTING / RUNTIME" re-exports — n/a since no `src/testing/`
- `clients/encore/tests/setup/global-setup.ts` — Q5 lock-in: no PW_DEP_RUN_ID
- `clients/encore/tests/setup/global-teardown.ts` — Q5 lock-in: no archive
- `clients/encore/.gitignore` — Q5 lock-in: no `.test-state/`
- `clients/encore/CLAUDE.md` LR-ENC-003 — Q7 lock-in: no formal client rule
- `tsconfig.build.json` — no new src/ files to include for this plan

### Reused (no changes)
- `clients/encore/tests/setup/auth-storage.ts` — its file-lock pattern is NOT needed for the in-memory dep-gate

---

## Verification

### Per subplan
- FRAMEWORK: see [SUBPLAN_DEPENDENCY_AWARE_FRAMEWORK.md](plans/pending/SUBPLAN_DEPENDENCY_AWARE_FRAMEWORK.md) Verification section.
- PILOT: see [SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md](plans/pending/SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md) Verification section.
- BATCH: see [SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md](plans/pending/SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md) Verification section.

### Plan-level (after BATCH closes parent)
```bash
# Strict criterion (LR-046)
grep -rc "test.describe.serial" clients/encore/tests/specs/ | grep -v ":0$"
# expect: empty (zero hits across tests/specs/)

# Suite green at local default
cd clients/encore && MAX_WORKERS=2 npx playwright test  # expect: full pass

# Suite green at CI default (via PLAN_DYNAMIC_WORKERS)
cd clients/encore && MAX_WORKERS=4 npx playwright test --config=playwright.config.ci.ts --project=encore-local-office --project=encore-locations
# expect: same pass count as MAX_WORKERS=2 (or document any new failures attributable to server-state contention)
```

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Existing `.serial` specs break when fixture chain is extended | Fixture is opt-in — `dependencyGate()` is invoked only when test calls it; specs that don't call it run unchanged. Smoke test in FRAMEWORK acceptance gate verifies all 12 unconverted specs still pass. |
| `failure-summary.json` consumers crash on new field | Per Q6 audit lock-in, all 10 consumer files were enumerated; none currently dereference `.dependsOn`. Re-grep at execute time before landing the field. Adding the field is purely additive. |
| Generator emits wrong `dependencyGate(...)` declarations | GENERATOR.md authoring rule + pilot-first migration with audit before batch. |
| Removing `.serial` surfaces hidden Angular-form-dirty races | LR-026 already documents the pattern. Pilot is the smallest test of this. If pilot reveals N races, BATCH grows by N bug fixes — expected, not a blocker. |
| TC-IDs not unique within a spec | Encore IDs are namespaced (TC-LOC-CUR-001, TC-LOC-PRI-001); collision unlikely. Add belt-and-suspenders verification grep in BATCH if needed. |
| **HIST PIVOT plans re-introduce `.serial`** — `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` line 318 KEEP list says "surrounding describe.serial structure"; pending HIST subplans (e.g., `SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md` and 16+ siblings) ADD tests to existing `.serial` blocks. After BATCH closes at `Status: DONE` with the LR-046 strict criterion (zero `.serial` hits in `tests/specs/`), any HIST PIVOT subplan that fires next would re-add `.serial` and silently violate the closed criterion. | Before BATCH `/execute`: grep `plans/pending/SUBPLAN_HIST_PIVOT_*` for `describe.serial`; add a one-line note to each affected HIST subplan ("Use `test.describe()` + `dependencyGate(...)` per the migration; do NOT restore `.serial`"). The HIST PIVOT master plan's KEEP-list line gets a 1-sentence amendment ("Post-2026-05-Q dependency-aware migration: legacy `describe.serial` is no longer permitted. New HIST tests use `test.describe()` + `dependencyGate(['TC-baseline'])`.") This is OUT OF SCOPE for the current 3 subplans but flagged here so the cascade-closure step (LR-027) doesn't ship a strict-violation landmine. |

---

## Out of Scope (handled in sibling plans / subplans)

- **Worker count** → [PLAN_DYNAMIC_WORKERS.md](plans/pending/PLAN_DYNAMIC_WORKERS.md) (sibling, independent).
- **Cross-spec dependencies** (TC-A in spec1 depends on TC-B in spec2) — Q5 lock-in: forbidden; per-file registry. Defer to a follow-up plan if genuinely needed (would require global registry + `project.dependencies` ordering).
- **Test idempotency refactor** — making tests truly parallel-within-file requires per-test data isolation. Out of scope; this plan keeps shared-state with declared deps.
- **`.serial` migration in non-Encore clients** — no other clients today; when client #2 exists, hoist the fixture to `src/testing/` then.

---

## Handoff (post-execution)

Cascade-closes via LR-027 when BATCH (last subplan) flips DONE. Chat-only summary per `feedback_handoff_in_chat_only.md`. Hands off to PLAN_VERTICAL_DELIVERY_SOX.md (which depends on BATCH closure).

---

## Execution Summary (2026-05-05) — cascade-closure

This parent PLAN cascade-closes per LR-027 because all 3 subplans are in `plans/done/`:

| # | Subplan | Status | Executed | Highlights |
|---|---|---|---|---|
| 1 | [SUBPLAN_DEPENDENCY_AWARE_FRAMEWORK.md](plans/done/SUBPLAN_DEPENDENCY_AWARE_FRAMEWORK.md) | DONE | 2026-05-05 | `dependencyGate(deps[])` fixture landed at `clients/encore/tests/setup/dependency-gate.ts` + `dependsOn: string[]` field on `FailureEntry` + 4 minimal-sentence agent/rule docs touches |
| 2 | [SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md](plans/done/SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md) | DONE | 2026-05-05 | `location-currency.spec.ts` (27 tests) converted as golden reference; pilot exposed 2 design defects (worker-recycle invalidates in-memory registry; afterEach hook on parent TestType doesn't propagate) — both fixed by switching to disk-backed JSON registry + consumer-attached afterEach. `fullyParallel: true → false` locked as hard rule. |
| 3 | [SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md](plans/done/SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md) | DONE | 2026-05-05 | All 11 remaining `.serial` specs (255 tests) migrated to `test.describe()` + `dependencyGate(...)`. 9 test-cases markdowns gained `Depends_On` per TC (365 entries total). HIST PIVOT 22 annotated to prevent future strict-line violation. |

**Initiative outcome**:
- `grep -rc "test.describe.serial" clients/encore/tests/specs/` returns **zero hits** across all 12 specs (LR-046 strict line satisfied initiative-wide).
- Failure isolation: a TC failure now skips ONLY its declared dependents — independent tests in the same spec still RUN. Replaces Playwright's `.serial` cascade-skip-all behavior, recovering 25+ tests of signal per file per failure.
- Reporter: `failure-summary.json[*].dependsOn` populates from `testInfo.annotations` for every failed test.
- Healer: `agent-reporter.ts` reporter field + HEALER.md disambiguation rule together let healers build `--grep` patterns directly from the reporter file (no manual prior-test analysis when `dependsOn` is non-empty).
- CI/CD: works under `playwright.config.ci.ts` (verified by pilot run #4 + BATCH 3-spec smoke). Disk-backed registry is portable across Windows local + Linux CI.
- Out-of-scope hand-off: 1 follow-up captured in chat — split `local_office_settings_test_cases.md` (combined 88-TC md) into 3 per-spec mds matching the locations 1:1 convention.

**Verification artifact** (initiative-wide):
```bash
# Zero .serial hits in tests/specs/
grep -rc "test.describe.serial" clients/encore/tests/specs/ | grep -v ":0$"
# expected: empty -> actual: empty

# All 3 subplan files in plans/done/
ls plans/done/SUBPLAN_DEPENDENCY_AWARE_*.md
# expected: FRAMEWORK + PILOT + MIGRATION_REMAINING -> actual: matches

# This parent plan moves to plans/done/ at the end of this execution
ls plans/done/PLAN_DEPENDENCY_AWARE_FAILURE.md
# expected: present after `git mv` -> actual: present
```

**Hands off to**: [PLAN_VERTICAL_DELIVERY_SOX.md](plans/pending/PLAN_VERTICAL_DELIVERY_SOX.md) (was blocked on BATCH closure per the original frontmatter).
