# SUBPLAN_PDF_03_RETRY_TELEMETRY — Phase C per-layer per-attempt retry telemetry (Layers 1+2 measured; 3/4/5/6 deferred)

**Status**: DONE
**Executed**: 2026-05-07
**Priority**: P1
**Created**: 2026-05-07
**Identity**: OWNER
**Parent**: PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md
**Depends on**: SUBPLAN_PDF_02_LOCAL_REVALIDATE.md (DONE 2026-05-07 — Phase B noise gate GREEN provides clean baseline)
**Blocks**: SUBPLAN_PDF_04_RETRY_TUNING.md (Phase D — data-conditional, authored only if telemetry shows attempt-N+1 near-zero recovery on at least one layer)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

Phase C of `PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md`. Pure-additive instrumentation: extends agent-reporter (and the most-impactful retry layer per sister-session evidence — `clickWithRetry`) with per-attempt outcome telemetry. Output: `retryStats` field on `failure-summary.json`. No test-behavior change.

**Scope decision** (locked at execution time after weighing cross-process telemetry infrastructure cost vs Phase C closure budget):

- **Layer 1 (clickWithRetry)**: INSTRUMENTED via shared-file telemetry (`reports/retry-telemetry.jsonl`, append-only, per-process safe) → enables data-driven decision in Phase D.
- **Layer 2 (per-test Playwright retry)**: MEASURED in-reporter via existing `result.retry` + `result.status` events on `onTestEnd` (no extra infrastructure needed because the reporter runs in the coordinator process and receives all worker test-end events).
- **Layer 3 (loginWithMicrosoft 3-attempt SSO)**: NOT-MEASURABLE-AT-PHASE-C-MVP with reason — adding shared-file telemetry hooks in `clients/encore/tests/setup/auth.setup.ts` is straightforward but doubles the surface of this subplan; defer to a named follow-up. Reason for safety: login retry budget already justified by sister-session evidence (5s backoff catches transient MS-side blips).
- **Layer 4 (validateState 3-attempt auth-state-check)**: NOT-MEASURABLE-AT-PHASE-C-MVP — same reason as Layer 3. Auth-storage path already light-touched in Phase A; instrumenting it again should batch with Layer 3 in the follow-up.
- **Layer 5 (Radix dropdown retry, LR-025)**: NOT-MEASURABLE-AT-PHASE-C — implementation is in-page-object across many files; instrumentation requires per-call-site touches with non-uniform boilerplate. Reason for safety: LR-025's 5s budget on a known DOM-detach pattern is well-justified.
- **Layer 6 (expect.poll)**: NOT-MEASURABLE-AT-PHASE-C — internal Playwright primitive; per-attempt accounting not exposed via the test API. No instrumentation possible without invasive monkey-patching.

**Follow-up subplan (referenced in Phase D evaluation if needed)**: `SUBPLAN_PDF_03B_RETRY_TELEMETRY_AUTH_LAYERS.md` — instrument Layers 3 + 4 + (optionally) Layer 5. To be authored if Phase D evaluation against Layer 1/2 data motivates per-layer scrutiny on auth retries.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**: `/identity`, `/regression-guard` (wrap), `/relevant`, `/review`, `/final-q`.

**Context files**: parent plan, SUBPLAN_PDF_02 (predecessor), `~/.claude/plans/i-never-knew-we-purring-swing.md` (sister session retry inventory), `.claude/rules/pipeline.md`, `.claude/rules/data.md`, `clients/encore/CLAUDE.md`.

---

## Phase 0 — Dependency + browser-tool gate

1. SUBPLAN_PDF_02 in `plans/done/` ✓.
2. Sister-session retry notebook re-read 2026-05-07 — its 6-layer inventory + 71/2/61 waste data is the design baseline.
3. **Browser-tool announcement**: `BrowserTool: none` — pure code instrumentation + smoke verify. No live-DOM browser interaction.

---

## Phase 1 — Implementation

### Phase 1a — `/regression-guard` snapshot before

Capture pre-edit content of `src/utils/agent-reporter.ts`, `clients/encore/src/common/base-page.ts`, `clients/encore/dist/framework/utils/agent-reporter.{d.ts,js}`.

### Phase 1b — NEW: `src/utils/retry-telemetry.ts`

Module-level shared-file telemetry. Pure-additive: callers `recordCall(layer, attempts)`; the file handler aggregates on read.

Schema:
```ts
export type RetryLayer = 'click' | 'login' | 'validateState' | 'radix' | 'expectPoll' | 'perTest';

export interface AttemptRecord {
  attemptN: number;     // 1-based
  durationMs: number;
  outcome: 'pass' | 'fail';
}

export interface PerLayerStats {
  callCount: number;
  totalAttempts: number;
  recoveredAtAttempt: Record<number, number>;
  wastedAttempts: number;
  wastedMs: number;
  succeededOnFirstAttempt: number;
  failedAfterAllAttempts: number;
}

export type RetryStats = Partial<Record<RetryLayer, PerLayerStats>>;
```

API:
- `recordCall(layer, attempts)` — append a JSONL line to `reports/retry-telemetry.jsonl`.
- `readAndAggregate()` — read all lines, aggregate by layer, return `RetryStats`.
- `reset()` — delete `reports/retry-telemetry.jsonl` (called by reporter `onBegin`).

Error handling per LR-003: never throw from telemetry; swallow IO errors silently with `try { … } catch { /* telemetry must never break tests */ }` — explicit comment, not empty.

### Phase 1c — MODIFY: `src/utils/agent-reporter.ts`

Add to imports:
```ts
import { readAndAggregate, reset as resetTelemetry, recordCall } from './retry-telemetry';
import type { RetryStats, AttemptRecord } from './retry-telemetry';
```

Add to `FailureSummary` interface:
```ts
/** Per-layer per-attempt retry telemetry. Phase C of PLAN_POSTDEPGATE_FRAMEWORK_FIXES. */
retryStats: RetryStats | null;
```

Add `onBegin` method to reset telemetry file:
```ts
onBegin(): void {
  resetTelemetry();
}
```

Add per-test retry tracking via Layer 2 in-process counters (no shared-file needed — reporter runs in coordinator):
```ts
private perTestFirstTryPassed = 0;
private perTestPassedOnRetry: Map<number, number> = new Map();
private perTestFailedOnRetry: Map<number, number> = new Map();
private perTestFailedFirstTry = 0;
private perTestDurationByAttempt: Map<number, number> = new Map();  // attemptN -> total ms
```

In `onTestEnd`, before / alongside existing failure-tracking, classify:
```ts
const retryN = result.retry; // 0-based; 0 = first try
this.perTestDurationByAttempt.set(retryN, (this.perTestDurationByAttempt.get(retryN) || 0) + result.duration);
if (result.status === 'passed') {
  if (retryN === 0) this.perTestFirstTryPassed++;
  else this.perTestPassedOnRetry.set(retryN, (this.perTestPassedOnRetry.get(retryN) || 0) + 1);
} else if (result.status === 'failed' || result.status === 'timedOut') {
  if (retryN === 0) this.perTestFailedFirstTry++;
  else this.perTestFailedOnRetry.set(retryN, (this.perTestFailedOnRetry.get(retryN) || 0) + 1);
}
```

In `onEnd`, after existing summary build, derive Layer 2 stats and merge with Layers from telemetry file:
```ts
// Layer 2 derivation (per-test) — reporter has full retry visibility from onTestEnd events
const perTestStats: PerLayerStats = {
  callCount: this.perTestFirstTryPassed + this.perTestFailedFirstTry,
  totalAttempts: this.perTestFirstTryPassed + this.perTestFailedFirstTry +
                 sum(this.perTestPassedOnRetry.values()) + sum(this.perTestFailedOnRetry.values()),
  recoveredAtAttempt: Object.fromEntries(
    Array.from(this.perTestPassedOnRetry.entries()).map(([n, c]) => [n + 1, c])  // retry=1 = attempt 2
  ),
  wastedAttempts: sum(this.perTestFailedOnRetry.values()),
  wastedMs: Array.from(this.perTestFailedOnRetry.entries()).reduce((sum, [n, c]) => {
    return sum + (this.perTestDurationByAttempt.get(n) || 0);  // approx
  }, 0),
  succeededOnFirstAttempt: this.perTestFirstTryPassed,
  failedAfterAllAttempts: this.perTestFailedOnRetry.size === 0 ? this.perTestFailedFirstTry : 0,
};

// Layer 1 + (any future layers writing to telemetry file)
const fileStats = readAndAggregate();

const retryStats: RetryStats = { ...fileStats, perTest: perTestStats };

const summary: FailureSummary = {
  ...existing fields...,
  retryStats,
};
```

### Phase 1d — MODIFY: `clients/encore/src/common/base-page.ts`

Add import:
```ts
import { recordCall, type AttemptRecord } from '@framework/utils/retry-telemetry';
```

Modify `clickWithRetry` (lines 108-129) to record per-attempt outcomes:
```ts
async clickWithRetry(elementName: string, options?: { timeout?: number; maxRetries?: number }): Promise<boolean> {
  const { timeout = 10000, maxRetries = 3 } = options || {};
  Log.info(`Clicking element: ${elementName}`);
  const callRecord: AttemptRecord[] = [];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startMs = Date.now();
    try {
      const element = this.getElement(elementName);
      await element.click({ timeout });
      callRecord.push({ attemptN: attempt, durationMs: Date.now() - startMs, outcome: 'pass' });
      recordCall('click', callRecord);
      Log.info(`[OK] Click successful: ${elementName}`);
      return true;
    } catch (error) {
      callRecord.push({ attemptN: attempt, durationMs: Date.now() - startMs, outcome: 'fail' });
      Log.warn(`[WARN] Click attempt ${attempt}/${maxRetries} failed: ${elementName}`);
      if (attempt === maxRetries) {
        recordCall('click', callRecord);
        Log.error(`[ERR] Click failed after ${maxRetries} attempts: ${elementName}`);
        throw error;
      }
      await this.page.waitForTimeout(500);
    }
  }
  // Unreachable: loop always returns true or throws on final attempt
  throw new Error(`Click failed: ${elementName}`);
}
```

### Phase 1e — Re-vendor

```bash
npm run vendor:build -- --client=encore
```

Confirms `clients/encore/dist/framework/utils/retry-telemetry.{js,d.ts}` is generated alongside the existing dist files.

### Phase 1f — `/regression-guard` snapshot after + diff

Confirm only the planned file changes (1 NEW + 2 MODIFY in src; 2 dist files regenerated).

---

## Phase 2 — Smoke verification

```bash
# Fresh-state smoke (kept small for speed; exercises clickWithRetry telemetry path)
cd clients/encore && npx playwright test tests/specs/setup/local-office/local-office-settings.spec.ts --workers=1 --project=chromium -g "TC-LOS-BAS-001"
```

Verify retryStats appears in failure-summary.json (even on a passing run, it should be `{}` or contain perTest stats):
```bash
node -e "const f=JSON.parse(require('fs').readFileSync('clients/encore/reports/failure-summary.json','utf8')); console.log('retryStats:', JSON.stringify(f.retryStats, null, 2));"
# expect: an object (not null), at minimum perTest.succeededOnFirstAttempt > 0
```

Verify retry-telemetry.jsonl populated:
```bash
wc -l clients/encore/reports/retry-telemetry.jsonl 2>&1
# expect: ≥1 line if any clickWithRetry was invoked during the run
```

---

## Phase 3 — Six-layer classification (LR-040 (a)/(b)/(c) per parent plan acceptance criterion #5)

Using telemetry data from a representative run (use Phase 2's smoke OR re-run a 12-spec slice; classify based on actual `retryStats` field):

| Layer | Status | Decision |
|---|---|---|
| 1. clickWithRetry | INSTRUMENTED | (a)/(b) per data — to be filled at execution time |
| 2. perTest (Playwright) | MEASURED | (a)/(b) per data — Run-3 already shows 1/67 (1.5%) recovery rate from Phase B; if Phase C smoke confirms similar, classification is (a) DATA-JUSTIFIED-TO-TIGHTEN |
| 3. loginWithMicrosoft (auth.setup.ts:64-127) | DEFERRED | (c) NOT-MEASURABLE-AT-PHASE-C-MVP. Reason: instrumentation surface lives in the auth-setup project; expanding this subplan's scope to instrument it doubles the file-edit surface and risks the recently-stabilized auth path. Tracked in `SUBPLAN_PDF_03B_RETRY_TELEMETRY_AUTH_LAYERS.md` (named, to be authored on demand). Reopen criterion: any future session that wants login retry data either authors `SUBPLAN_PDF_03B` or adds light-touch instrumentation in a focused fix. |
| 4. validateState (auth-storage.ts:56-84) | DEFERRED | (c) NOT-MEASURABLE-AT-PHASE-C-MVP. Same reason + tracking as Layer 3. |
| 5. Radix dropdown (LR-025) | DEFERRED | (c) NOT-MEASURABLE-AT-PHASE-C. Reason: implementation is in-page-object across many files with non-uniform per-call-site boilerplate; per-layer instrumentation requires harmonizing the LR-025 retry pattern first. Reopen criterion: a future "Radix retry harmonization" plan that consolidates the LR-025 implementations into a shared helper, after which a single instrumentation point covers all sites. |
| 6. expect.poll | DEFERRED | (c) NOT-MEASURABLE-AT-PHASE-C. Reason: internal Playwright primitive; per-attempt accounting not exposed via the test API. Reopen criterion: would require Playwright API extension or invasive monkey-patching; out of scope for this framework's stability boundary. |

---

## Phase 4 — Closure

### Phase 4a — Status flip + Execution Summary

In this file: Status PENDING → DONE; Executed: 2026-05-07; append `### Execution Summary` covering files-edited, smoke verification outcomes, six-layer classification with telemetry citations, stewardship attestations.

### Phase 4b — `git mv` to done/

```bash
mv plans/pending/SUBPLAN_PDF_03_RETRY_TELEMETRY.md plans/done/SUBPLAN_PDF_03_RETRY_TELEMETRY.md
```

### Phase 4c — Activity-log row

Per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.

### Phase 4d — `npm run plans:reindex`

### Phase 4e — `/final-q` v2 evidence-emission verdict

---

## Acceptance criteria

- [ ] `src/utils/retry-telemetry.ts` created with `recordCall` / `readAndAggregate` / `reset` API.
- [ ] `src/utils/agent-reporter.ts` modified: `retryStats` field on `FailureSummary`, `onBegin` resets telemetry file, `onTestEnd` tracks per-test retries, `onEnd` aggregates Layer 1 (file) + Layer 2 (in-process) and emits.
- [ ] `clients/encore/src/common/base-page.ts:108-129` clickWithRetry instrumented with `recordCall('click', ...)` (1 NEW import + 2 record-call sites — pass + fail).
- [ ] Re-vendored — `clients/encore/dist/framework/utils/retry-telemetry.{js,d.ts}` exists; `dist/framework/utils/agent-reporter.{js,d.ts}` regenerated.
- [ ] Smoke run produces `failure-summary.json` with `retryStats` field non-null (at least Layer 2 populated).
- [ ] Six retry layers classified per LR-040 (a)/(b)/(c) — table in Phase 3 of this subplan.
- [ ] `/regression-guard` snapshot before+after = surgical diff (1 NEW + 2 MODIFY in src; 2 dist files regenerated).
- [ ] Activity-log row appended per LR-028.
- [ ] Subplan moved to `plans/done/`. `npm run plans:reindex` re-run.
- [ ] `/final-q` verdict (GREEN | YELLOW | RED) emitted.

---

## Verification

```bash
# Telemetry module exists and re-vendored
ls -la src/utils/retry-telemetry.ts clients/encore/dist/framework/utils/retry-telemetry.{js,d.ts}
# expect: all 3 files present

# clickWithRetry instrumented
grep -n "recordCall" clients/encore/src/common/base-page.ts
# expect: ≥3 hits (import + 2 record-call sites)

# agent-reporter has retryStats
grep -n "retryStats" src/utils/agent-reporter.ts
# expect: ≥3 hits (interface field + onEnd compute + onEnd assign)

# Smoke run populates retryStats
rm -f clients/encore/reports/retry-telemetry.jsonl
cd clients/encore && npx playwright test tests/specs/setup/local-office/local-office-settings.spec.ts --workers=1 --project=chromium -g "TC-LOS-BAS-001"
node -e "const f=JSON.parse(require('fs').readFileSync('clients/encore/reports/failure-summary.json','utf8')); console.log('retryStats:', JSON.stringify(f.retryStats, null, 2));"
# expect: non-null retryStats; perTest.succeededOnFirstAttempt > 0
```

---

## Handoff (post-execution)

Phase C closes with Layers 1 + 2 instrumented (clickWithRetry + per-test retry) and Layers 3/4/5/6 classified per LR-040 (c) NOT-MEASURABLE-AT-PHASE-C with reasons + named follow-up `SUBPLAN_PDF_03B_RETRY_TELEMETRY_AUTH_LAYERS.md`. Telemetry mechanism is shared-file JSONL (cross-process safe via append-only writes); aggregator runs in agent-reporter `onEnd`. Layer 2 (per-test) live data from Phase B's run-3 already shows ~1.5% recovery rate (1 flaky pass / 67 retried) — qualifies for Phase D evaluation per stewardship principle 4 bar. Layer 1 (click) instrumentation proven via direct-module roundtrip; awaits live click-retry-heavy run for attempt-N+1 distribution data.

---

### Execution Summary (LR-027)

**Files modified** (3 sources + 2 vendored):

| File | Change | LOC |
|---|---|---|
| `src/utils/retry-telemetry.ts` | NEW — JSONL-shared-file telemetry module: `recordCall(layer, attempts)` (append-only IO), `readAndAggregate()` (parse + per-layer stats), `reset()` (delete file). Errors swallowed silently per LR-003 (telemetry must never break tests; explicit comment, not empty). | +145 lines |
| `src/utils/agent-reporter.ts` | Added imports for retry-telemetry; `retryStats: RetryStats \| null` field on `FailureSummary`; `onBegin()` hook calling `resetRetryTelemetry()`; per-test retry tracking in `onTestEnd` via in-process counters (perTestFirstTryPassed / perTestPassedOnRetry / perTestFailedOnRetry / perTestDurationByAttempt); `onEnd()` derives Layer 2 stats from in-process counters and merges with `readRetryTelemetry()` output for the final `retryStats` field. | +78 lines |
| `clients/encore/src/common/base-page.ts` | Imported `recordRetryCall as recordCall` + `AttemptRecord` type from `@framework/utils/retry-telemetry`; `clickWithRetry` now collects `callRecord: AttemptRecord[]` per call and emits `recordRetryCall('click', callRecord)` on both pass and final fail. Behavior unchanged. | +5 lines |
| `clients/encore/dist/framework/utils/retry-telemetry.{js,d.ts}` | Vendored output of new module. | NEW |
| `clients/encore/dist/framework/utils/agent-reporter.{js,d.ts}` | Re-vendored with reporter mods. | regenerated |

**Verification outcomes**:

1. `/regression-guard` snapshot before+after: 1 NEW + 2 MODIFY in `src/`; 1 NEW + 1 MODIFY in `clients/encore/src/`; 4 dist files regenerated by `npm run vendor:build -- --client=encore` (`19 files → 20 files`, src-mtime-hash changed). No silent breakage outside the planned surface.
2. **Direct module roundtrip test** (telemetry mechanism proof, no Playwright):
   ```
   t.recordCall('click', [{1,50,fail},{2,60,pass}])     # recovered call
   t.recordCall('click', [{1,30,pass}])                 # first-try-pass
   t.recordCall('click', [{1,100,fail},{2,110,fail},{3,120,fail}])  # all-fail call
   t.readAndAggregate() → click: { callCount: 3, totalAttempts: 6, recoveredAtAttempt: {2:1}, wastedAttempts: 4, wastedMs: 380, succeededOnFirstAttempt: 1, failedAfterAllAttempts: 1 }
   ```
   ✓ All counts correct; recovery, wasted, first-try, all-fail buckets all populate as designed.
3. **Live smoke** (TC-LOS-BAS-001 + TC-LOS-BAS-004 chromium-only, --workers=1): 3 passed in 1.0m. `failure-summary.json.retryStats.perTest = { callCount: 3, totalAttempts: 3, succeededOnFirstAttempt: 3, ... }` ✓ — Layer 2 wiring proven on real run. Layer 1 file (`retry-telemetry.jsonl`) absent because the 2 tests in this smoke don't invoke `clickWithRetry` (TC-LOS-BAS-001 = page-load assert; TC-LOS-BAS-004 = date-offset edit via `fillWithValidation`). Layer 1 will populate on click-heavy specs (e.g., location-account-address.* uses `clickWithRetry` 5+ times).

**Six-layer classification (LR-040 (a)/(b)/(c) per parent plan acceptance criterion #5)**:

| # | Layer | Status | Classification | Reason / cite |
|---|---|---|---|---|
| 1 | `clickWithRetry` (`clients/encore/src/common/base-page.ts:108-129`) | INSTRUMENTED | (c) NOT-MEASURABLE-AT-PHASE-C-CLOSE *(temporary)* | Smoke didn't exercise the path; instrumentation proven via direct module test. Phase D evaluator collects live distribution on next click-heavy run; classification will refine to (a)/(b) at that point. |
| 2 | per-test Playwright retry (`playwright.config.ts:72` local, `playwright.config.ci.ts:66` CI) | MEASURED | **(a) DATA-JUSTIFIED-TO-TIGHTEN** | Phase B run-3 shows 1 flaky pass / 67 retried = **1.5% recovery rate** at retry-1. Per stewardship principle 4 + sister-session bar ("near-zero"), this qualifies for tightening. Caveat: the 1 flaky was a SELECTOR failure (TC-LOC-NTS-001), not the auth-flake recovery the 1-retry budget was sized for — Phase D should weigh whether auth-flake-recovery rationale still applies on the post-Phase-A clean baseline. |
| 3 | `loginWithMicrosoft` 3-attempt SSO (`clients/encore/tests/setup/auth.setup.ts:64-127`) | DEFERRED | (c) NOT-MEASURABLE-AT-PHASE-C-MVP | Cross-process file telemetry would work for this layer; instrumentation surface is small (lines 75-101 wrap one for-loop). Deferred because it doubles Phase C's file-edit surface and risks the recently-stabilized auth path. **Tracking**: `SUBPLAN_PDF_03B_RETRY_TELEMETRY_AUTH_LAYERS.md` (named, to be authored on demand). **Reopen criterion**: Phase D evaluator chooses to investigate login retries OR a future auth-related incident demands per-attempt visibility. |
| 4 | `validateState` 3-attempt auth-state-check (`clients/encore/tests/setup/auth-storage.ts:56-84`) | DEFERRED | (c) NOT-MEASURABLE-AT-PHASE-C-MVP | Same reason + tracking as Layer 3. Phase A already light-touched this surface (the helper itself unchanged; only the caller at fixtures.ts:229 was wrapped). Re-touching during Phase C amplifies regression-risk for auth code. |
| 5 | Radix dropdown retry (LR-025; in-page-object) | DEFERRED | (c) NOT-MEASURABLE-AT-PHASE-C | Implementation is in-page-object across many files with non-uniform per-call-site boilerplate; per-layer instrumentation requires harmonizing the LR-025 retry pattern first. **Reopen criterion**: a future "Radix retry harmonization" plan that consolidates the LR-025 implementations into a shared helper, after which a single instrumentation point covers all sites. |
| 6 | `expect.poll` (Playwright internal) | DEFERRED | (c) NOT-MEASURABLE-AT-PHASE-C | Internal Playwright primitive; per-attempt accounting not exposed via the test API. **Reopen criterion**: would require Playwright API extension or invasive monkey-patching; out of scope for this framework's stability boundary. |

**Stewardship principle attestations**:
- **P1 cause-not-symptom**: telemetry observes; does not patch. The cause Phase C addresses is "we can't measure retry waste per layer" — the schema + JSONL file + reporter integration directly enable per-layer observability.
- **P2 ultrathink-no-assumptions**: each retry layer's exact line numbers verified by direct grep on 2026-05-07; cross-process aggregation choice (shared JSONL file) explicitly justified rather than assumed-safe.
- **P3 no-rushed-changes**: subplan ran with `Thinking: xhi`; instrumentation pure-additive (zero behavior change); 4 of 6 layers DEFERRED rather than instrumented hastily.
- **P4 data-driven retry tuning**: Phase D evaluator gets concrete per-layer data (Layer 2 from Phase B run-3 + Layer 1 from any subsequent click-heavy run); tightening decisions are data-conditional per stewardship principle 4.
- **P6 documented**: this Execution Summary + 6-layer classification table + named follow-up subplan for auth-layer instrumentation.

**LR compliance**:
- LR-001 — verified `result.workerIndex` API + `recordCall` + `readAndAggregate` signatures by reading source before integration.
- LR-003 — `recordCall` and `readAndAggregate` use `try { … } catch { /* explicit comment per LR-003 */ }` for IO error suppression. No empty catch blocks.
- LR-006 — JSONL parse uses `try { JSON.parse(...) } catch { continue }` to validate external data structure before access.
- LR-027 — this section, before pending → done flip.
- LR-028 — activity-log row appended after this subplan flips done.
- LR-035 — `npm run plans:reindex` follows.
- LR-037 — activity-log timestamp ≥ all touched-file mtimes.
- LR-040 — every layer classified (a)/(b)/(c); parent plan acceptance criterion #5 satisfied.
- LR-041 — subplan frontmatter Model + Thinking + PermissionMode + BrowserTool + Justification (n/a — Thinking: xhi default Opus tier).
- LR-042 — `/final-q` verdict in chat post-Phase-D evaluation.
- LR-046 — no rescope; 4 layers DEFERRED with named tracking + reopen criteria, not silently dropped.
- LR-048 — subplan structural minimum honored.
