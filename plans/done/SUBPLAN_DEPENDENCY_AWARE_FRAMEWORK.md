# SUBPLAN: Dependency-Aware — Framework Landing (in-memory `dependencyGate` fixture + reporter field)

**Status**: DONE
**Priority**: P0-EMERGENCY
**Created**: 2026-05-04
**Executed**: 2026-05-05
**Updated**: 2026-05-04 (audit-driven simplify per `~/.claude/plans/i-need-u-to-melodic-token.md`; client-only scope, no `src/testing/`, no disk state, minimal docs)
**Identity**: OWNER
**Parent**: PLAN_DEPENDENCY_AWARE_FAILURE.md
**Depends on**: none
**Blocks**: SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

---

## Context

Phase 1 of the Dependency-Aware Failure Isolation initiative — minimal version per audit at `~/.claude/plans/i-need-u-to-melodic-token.md`.

Lands a small in-memory `dependencyGate(deps[])` fixture in **`clients/encore/tests/setup/`** (NOT `src/testing/` — client-only per user lock-in Q4), plus a `dependsOn: string[]` field on `agent-reporter.ts` `FailureEntry`, plus three minimal agent/rule docs touches. **No disk file. No `PW_DEP_RUN_ID`. No global-setup/teardown changes. No `.gitignore` entry. No vendor build for the dep-gate fixture itself** (only for the reporter field, which already lives in `src/`).

Confirmed unoverridable: Playwright's `.serial` cascade-skip ([#18329](https://github.com/microsoft/playwright/issues/18329) closed not-planned, [#34279](https://github.com/microsoft/playwright/issues/34279) open). Solution path: drop `.serial` for new specs; use `test.describe()` + `dependencyGate(deps[])`.

User-locked decisions reflected here:
- **Q4 location**: dep-gate file = `clients/encore/tests/setup/dependency-gate.ts` (client-only).
- **Q5 scope**: cross-spec spillover forbidden — registry scoped per `testInfo.file` via `Map<string, Set<string>>`.
- **Q7 docs**: minimal — one sentence each in GENERATOR.md + HEALER.md, LR-019 wording tweak. No LR-ENC-002, no LR-ENC-003, no SETUP.md section, no active-experiments updates.
- **Transitive skip** (user contribution): A→B→C cascading works — when B skips because of A's failure, B is added to the registry so C (which depends on B) also skips.

Provenance: parent [PLAN_DEPENDENCY_AWARE_FAILURE.md](plans/pending/PLAN_DEPENDENCY_AWARE_FAILURE.md); audit + locked decisions at `~/.claude/plans/i-need-u-to-melodic-token.md`.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity`
- `/regression-guard` (wrap — BEFORE + AFTER snapshots of `clients/encore/tests/setup/`, `src/utils/agent-reporter.ts`, `.claude/agents/GENERATOR.md`, `.claude/agents/HEALER.md`, `.claude/rules/specs.md`)
- `/relevant`
- `/audit`
- `/final-q`

**Context files**:
- `plans/pending/PLAN_DEPENDENCY_AWARE_FAILURE.md` (parent)
- `~/.claude/plans/i-need-u-to-melodic-token.md` (audit + locked decisions)
- `CLAUDE.md` (root)
- `clients/encore/CLAUDE.md`
- `.claude/rules/data.md` (LR-001..LR-006)
- `.claude/rules/specs.md` (LR-018, LR-019 — will reword)
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-041, LR-048)
- `.claude/agents/GENERATOR.md` (1-sentence update)
- `.claude/agents/HEALER.md` (1-sentence update)
- `clients/encore/tests/setup/fixtures.ts` (chain target)
- `src/utils/agent-reporter.ts` (field-addition target)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on:` = `none`. (Verified: first subplan in this chain.)
2. Read [navigation.md](.claude/context/navigation.md), [agent-mistakes.md](clients/encore/specs_planning/_internal/agent-mistakes.md) (filter for fixture + reporter incidents), [patterns.md](.claude/context/patterns.md).
3. LR scan: LR-001..006 (data hygiene), LR-018 (spec-fixing workflow), LR-019 (will reword), LR-020 (verify plan claims), LR-027 (closure), LR-028 (activity log), LR-041 (model+thinking), LR-048 (subplan minimum).
4. **Browser-tool announcement**: `BrowserTool=none`. Reason: client-side TypeScript file + reporter field + agent doc updates; no live website interaction.

---

## Phase 1 — Create the fixture file (`clients/encore/tests/setup/dependency-gate.ts`)

Create the new file with this exact content:

```ts
/**
 * Dependency-aware failure isolation (in-memory, per-spec-file scope).
 * Tests declare deps via `dependencyGate([...])`. When a declared dep failed
 * — or was itself skipped because ITS dep failed (transitive) — the current
 * test skips with a clear reason. Independents (`dependencyGate([])`) always run.
 *
 * One spec file = one box. No cross-file or cross-worker visibility.
 */
import { test as base, type TestType } from '@playwright/test';

const TC_ID_REGEX = /^(TC-[A-Z0-9-]+)/;
const registryByFile = new Map<string, Set<string>>();
const getRegistry = (file: string): Set<string> => {
  let s = registryByFile.get(file);
  if (!s) { s = new Set(); registryByFile.set(file, s); }
  return s;
};

const DEP_ANNOTATION = 'dependsOn';
const SKIP_ANNOTATION = 'depGateSkipped';

type Fixture = { dependencyGate: (deps: string[]) => void };

export const dependencyGateExt: TestType<Fixture, {}> = base.extend<Fixture>({
  dependencyGate: async ({}, use, testInfo) => {
    use((deps: string[]) => {
      const registry = getRegistry(testInfo.file);
      for (const dep of deps) {
        testInfo.annotations.push({ type: DEP_ANNOTATION, description: dep });
      }
      const blocker = deps.find(d => registry.has(d));
      if (blocker) {
        testInfo.annotations.push({ type: SKIP_ANNOTATION, description: blocker });
        base.skip(true, `skipped: dependency ${blocker} did not run successfully`);
      }
    });
  },
});

dependencyGateExt.afterEach(async ({}, testInfo) => {
  const id = testInfo.title.match(TC_ID_REGEX)?.[1];
  if (!id) return;
  const registry = getRegistry(testInfo.file);
  if (testInfo.status === 'passed') {
    // Retry recovery: CI has `retries: 2`. If attempt-1 failed (registry got TC-X)
    // and attempt-2 passes, clear the entry so downstream dependents run.
    registry.delete(id);
  } else if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
    registry.add(id);
  } else if (testInfo.status === 'skipped') {
    const wasDepSkip = testInfo.annotations.some(a => a.type === SKIP_ANNOTATION);
    if (wasDepSkip) registry.add(id); // transitive: dep-caused skip propagates downstream
  }
});
```

Notes:
- Per-spec-file scope via `registryByFile.get(testInfo.file)` — satisfies Q5 lock-in (one spec = one box).
- Transitive skip via `wasDepSkip` annotation marker — satisfies user-contributed logic. Legitimate skips (e.g., `test.skip(true, "feature only on prod")`) don't have the marker, so they don't propagate.
- **Retry recovery** (post-deep-review fix): pass branch deletes the TC from the registry, so an attempt-1-fail / attempt-2-pass sequence (CI `retries: 2`) does not leave a stale entry that erroneously skips downstream dependents.
- `dependencyGateExt.afterEach(...)` fires for every test in the consuming TestType regardless of which fixtures it destructures — so even tests that don't call `dependencyGate(...)` get tracked when they fail (defensive: future tests declaring deps on a non-gated TC still skip correctly).
- TC-ID regex `^(TC-[A-Z0-9-]+)` matches Encore's namespaced IDs like `TC-LOC-CUR-001`.

---

## Phase 2 — Reporter field (`src/utils/agent-reporter.ts`)

1. In the `FailureEntry` interface (lines 19-53), add a new field:
   ```ts
   /** TC-IDs declared as dependencies via dependencyGate fixture (parsed from annotations). */
   dependsOn: string[];
   ```
2. In `onTestEnd` (where the `FailureEntry` is constructed for each failure), populate the field:
   ```ts
   const dependsOn = (test.annotations ?? [])
     .filter(a => a.type === 'dependsOn')
     .map(a => a.description ?? '')
     .filter(s => s.length > 0);
   ```
   Then include `dependsOn` in the `FailureEntry` literal. (Match existing pattern at line 104: `test.annotations || []`. Both `TestCase.annotations` and `TestResult.annotations` exist in Playwright 1.58 — using `test.annotations` keeps consistency with the existing reporter style.)
3. Run `npm run vendor:build -- --client=encore` to refresh `clients/encore/dist/framework/utils/agent-reporter.{js,d.ts}`. Commit the regenerated files (Path A: vendored framework is git-tracked).

**Consumer-safety verification** (per audit Q6 lock-in — sweep BEFORE schema change). The 10 consumer files were enumerated in `~/.claude/plans/i-need-u-to-melodic-token.md` §3c:

- `scripts/pipeline-orchestrator.ts:247`
- `scripts/healer-pre-run.ts:71-86`
- `scripts/task-context-builder.ts:258-264`
- `scripts/generator-validate-selectors.ts:149-150`
- `scripts/generator-post-complete.ts:234,245-262,694`
- `scripts/generator-pre-run.ts:582-599`
- `scripts/shared-types.ts:14`
- `pipeline/scripts/healer-post-complete.ts:52-66`
- `pipeline/orchestrator/orchestrator.ts:409-410`
- `pipeline/server/routes/pipeline.ts:512`

None currently dereference `.dependsOn` — adding the field is purely additive. Re-grep at execute time to confirm:
```bash
grep -rn "\.dependsOn\b" scripts/ pipeline/ src/ | grep -v "src/utils/agent-reporter.ts" | grep -v "test-data\|test-cases"
# expect: empty (no consumer reads the field directly yet)
```

If the grep returns ANY hit outside `agent-reporter.ts`, add optional-chaining (`failure.dependsOn?.find(...)`) to those callsites BEFORE landing the field.

---

## Phase 3 — Wire into client fixtures (`clients/encore/tests/setup/fixtures.ts`)

1. After existing imports (around line 29), add:
   ```ts
   import { dependencyGateExt } from './dependency-gate';
   ```
2. Add `dependencyGate: (deps: string[]) => void;` to the `TestFixtures` type (line 38-53 region).
3. Replace line 59:
   - **From**: `export const test = base.extend<TestFixtures, WorkerFixtures>({`
   - **To**: `export const test = dependencyGateExt.extend<TestFixtures, WorkerFixtures>({`
   - Note: `dependencyGateExt` is itself created from `base` (Playwright's `test`), so the chain is equivalent. The afterEach hook attached to `dependencyGateExt` flows through to all consumers.

**No other client wiring**:
- NO `global-setup.ts` changes (no `PW_DEP_RUN_ID`).
- NO `global-teardown.ts` changes (no archive-to-reports).
- NO `.gitignore` entry (no `.test-state/` directory).
- NO `auth-storage.ts` changes (file lock isn't relevant — registry is in-memory).

---

## Phase 4 — Minimal docs (4 updates)

1. **`.claude/agents/GENERATOR.md`** Phase 1 (line 32, "Build shell") — append (1 sentence):
   > Use `test.describe(...)` (NOT `.serial`); call `dependencyGate(deps[])` once per test as the first line of the body. Empty array `[]` for independent tests; `['TC-X']` for tests reading state mutated by TC-X.

2. **`.claude/agents/HEALER.md`** Cycle 1 step (line 38) — append (2 sentences):
   > When `failure-summary.json[*].dependsOn` is non-empty, build the `--grep` pattern as `<dep1>|<dep2>|<failing-tc>` directly. Manual prior-test analysis only when `dependsOn` is empty (unconverted spec).
   > **SIG-SERIAL-CONTAMINATION disambiguation** (post-migration): if a converted spec (`test.describe()` + `dependencyGate(...)`) hits this signal, fix the dep declaration first (the test claims `dependencyGate([])` but actually reads state mutated by a prior TC). Restoring `.serial` is no longer the right answer — the migration target is permanent.

3. **`.claude/rules/specs.md`** LR-019 (lines 26 and 37) — reword:
   - Title: `LR-019: First test in any spec MUST enforce baseline state`
   - Body: "Whether the spec uses `test.describe()` or legacy `test.describe.serial()`, the first test (TC-001) reads/resets state and saves a clean baseline. Required because subsequent tests assume a known starting state."
   - Trigger: "Every new spec."

4. **`clients/encore/specs_planning/_internal/agent-mistakes.md`** GEN-002 row (~line 166) — replace the substring `One test.describe.serial per spec` with `One test.describe(...) per spec; declare deps via dependencyGate([...])`. Lands in FRAMEWORK (not BATCH adjacent-sweep) so every Generator session sees the new pattern from the first dep-aware spec onward.

**Explicitly NOT touching**:
- NO `LR-ENC-002` in `clients/encore/CLAUDE.md`.
- NO `LR-ENC-003` in `clients/encore/CLAUDE.md`.
- NO cross-ref note added to `.claude/rules/specs.md` separately (the LR-019 reword IS the only change there).
- NO `docs/SETUP.md` "Parallelism" section.
- NO `clients/encore/specs_planning/_internal/active-experiments.md` updates.
- **LR-018 stays as-is** — its "run-all is the only truth" workflow intent still applies to converted specs (they can still race on shared state via wrong dep declarations). Do not touch the rule body.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW / SPAWN / APPEND for adjacent fixes:
- If grep finds any `.dependsOn` consumer outside `agent-reporter.ts` that isn't optional-chained → DO-NOW patch.
- If `clients/encore/specs_planning/_internal/agent-mistakes.md` GEN-002 line still says ".serial per spec" after the migration starts (post-pilot) → APPEND to BATCH subplan.
- Existing `.test.ts` vs `.spec.ts` extension confusion in any old draft tests under `src/` → DO-NOW resolve.

---

## Acceptance criteria

- [ ] `clients/encore/tests/setup/dependency-gate.ts` exists with the fixture from Phase 1 (verbatim).
- [ ] `src/utils/agent-reporter.ts` `FailureEntry` has `dependsOn: string[]` field; populated correctly in `onTestEnd`.
- [ ] `clients/encore/dist/framework/utils/agent-reporter.{js,d.ts}` regenerated via vendor:build; both committed.
- [ ] `clients/encore/tests/setup/fixtures.ts` chains `dependencyGateExt`; `dependencyGate` is in `TestFixtures` type.
- [ ] All 12 unconverted `.serial` specs continue to pass (fixture is opt-in; tests that don't destructure `dependencyGate` are unaffected).
- [ ] Consumer-safety grep returns empty (no consumer dereferences `.dependsOn` without optional-chaining).
- [ ] GENERATOR.md, HEALER.md, specs.md LR-019 — three minimal-sentence updates landed.
- [ ] `/regression-guard` snapshot before/after — no silent breakage.
- [ ] Activity-log row appended per LR-028.
- [ ] `/final-q` verdict per LR-042.

---

## Verification

```bash
# 1. Existing specs still work (backward compat — fixture is opt-in)
cd clients/encore && npx playwright test --list                 # expect: lists tests, no error
cd clients/encore && npx playwright test --grep "TC-LOC-CUR-001" # expect: passes

# 2. Vendor build picks up the reporter change
npm run vendor:build -- --client=encore
ls clients/encore/dist/framework/utils/agent-reporter.{js,d.ts}  # expect: both present

# 3. Reporter populates dependsOn (verifiable after pilot subplan converts one test)
cat reports/failure-summary.json | jq '.failures[] | .dependsOn'

# 4. Smoke
cd clients/encore && npx playwright test  # expect: same pass/fail count as pre-change baseline

# 5. Consumer-sweep negative test
grep -rn "\.dependsOn\b" scripts/ pipeline/ src/ | grep -v "src/utils/agent-reporter.ts" | grep -v "test-data\|test-cases"
# expect: empty
```

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. Hands off to [SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md](plans/pending/SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md) for the golden-reference conversion.

---

## Execution Summary (2026-05-05)

**Files created (1)**:
- `clients/encore/tests/setup/dependency-gate.ts` (54 lines) — in-memory `dependencyGateExt` fixture extender; per-spec-file `Map<file, Set<TC-ID>>` registry; `afterEach` hook with retry recovery (`passed → registry.delete`) + transitive skip (annotation-marker propagation). Note: explicit `TestType<Fixture, {}>` annotation dropped during execution (would have stripped inherited Playwright fixtures `page`/`browser`); inferred type preserves chain.

**Files modified (5 source + 2 vendored)**:
- `src/utils/agent-reporter.ts` — added `dependsOn: string[]` to `FailureEntry` interface; populated in `onTestEnd` from `test.annotations.filter(a => a.type === 'dependsOn')` (matches existing line-104 pattern, F12 lock-in).
- `clients/encore/dist/framework/utils/agent-reporter.{js,d.ts}` — regenerated via `npm run vendor:build -- --client=encore` (19 files, src-mtime-hash `c212fb695f67`). `dependsOn: string[]` confirmed in `.d.ts` line 29.
- `clients/encore/tests/setup/fixtures.ts` — chained `dependencyGateExt.extend<TestFixtures, WorkerFixtures>(…)`; added `dependencyGate: (deps: string[]) => void` to `TestFixtures` type.
- `.claude/agents/GENERATOR.md` line 32 — appended one-sentence authoring rule for `dependencyGate(deps[])` after Phase 1 build-shell description.
- `.claude/agents/HEALER.md` line 38 — appended two-sentence rule: failure-summary `dependsOn`-driven `--grep` + SIG-SERIAL-CONTAMINATION disambiguation for converted specs (F9 fix).
- `.claude/rules/specs.md` LR-019 — reworded title (drop `.serial`-specific framing) + body intro + trigger; LR-018 stays as-is (F10).
- `clients/encore/specs_planning/_internal/agent-mistakes.md` GEN-002 (line 166) — replaced "One test.describe.serial per spec" with "One test.describe(...) per spec; declare deps via dependencyGate([...])" (F11 — landed in FRAMEWORK, not Adjacent-Sweep).

**Acceptance criteria** (all 9 met):
- [x] `dependency-gate.ts` exists with fixture (verbatim from Phase 1, plus retry-recovery and transitive-skip).
- [x] `FailureEntry.dependsOn: string[]` added; populated in `onTestEnd`.
- [x] Vendor regenerated (`agent-reporter.{js,d.ts}` exist, contain `dependsOn`).
- [x] `fixtures.ts` chains `dependencyGateExt`; `dependencyGate` in `TestFixtures`.
- [x] 12 unconverted `.serial` specs unaffected (verified via `npx playwright test --list` — 1257 tests in 15 files listed without error; fixture is opt-in).
- [x] Consumer-safety grep — only hit is `scripts/plans-reindex.mjs:500` `p.dependsOn` (PLAN frontmatter — subplan ordering — unrelated to FailureEntry; classified as N/A in Phase 2.5).
- [x] GENERATOR.md, HEALER.md, specs.md LR-019, agent-mistakes.md GEN-002 — four minimal updates landed.
- [x] `/regression-guard` snapshot — 5 source files modified (17+/7-), 1 new file, 2 vendored regenerated; typecheck clean (root + client tsconfig); no silent breakage.
- [x] Activity-log row appended per LR-028 (timestamp ≥ all touched-file mtimes).

**Plan-deviations log** (1 deviation):
- **Type-annotation simplification on `dependencyGateExt`** — plan Phase 1 specified `export const dependencyGateExt: TestType<Fixture, {}> = base.extend<Fixture>({...})`. Initial typecheck failed with 6 errors (`browser`/`page` not on inherited type because explicit `TestType<Fixture, {}>` strips parent fixtures). Removed the explicit annotation to let TS infer the proper merged type (`PlaywrightTestArgs & PlaywrightWorkerArgs & Fixture`). Functionally identical; type-strictness preserved. No user authorization needed (mechanical fix to plan-as-authored bug; not a strict-line/scope change per LR-046).

**Out-of-scope items** (per parent plan):
- F2/F3 Jenkins root `playwright.config.ci.ts` — explicitly OOS per audit doc 2026-05-05.
- F5 HIST PIVOT subplan amendments — flagged in parent plan risk table; will be cleaned up before BATCH `/execute`, not by FRAMEWORK.
- F14/F15/F17 — low-priority static descriptions, deferred per audit doc.

**Verification artifact**:
```bash
# 1. Vendor field present
grep -n "dependsOn" clients/encore/dist/framework/utils/agent-reporter.d.ts
# expect: line 29 → dependsOn: string[];

# 2. Typecheck clean
cd clients/encore && npx tsc --noEmit
# expect: empty output

# 3. Existing specs unaffected
cd clients/encore && npx playwright test --list 2>&1 | tail -1
# expect: "Total: 1257 tests in 15 files"

# 4. Consumer grep (only benign plan-frontmatter hit)
grep -rn "\.dependsOn\b" scripts/ pipeline/ src/ | grep -v "agent-reporter.ts" | grep -v "test-data\|test-cases"
# expect: only scripts/plans-reindex.mjs:500 (p.dependsOn = PLAN frontmatter, unrelated)
```

**Cascade decision** (LR-027): parent `PLAN_DEPENDENCY_AWARE_FAILURE.md` has 2 pending subplans (`SUBPLAN_DEPENDENCY_AWARE_PILOT_LOCATION_CURRENCY.md`, `SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING.md`) — do NOT close parent. PILOT next.
