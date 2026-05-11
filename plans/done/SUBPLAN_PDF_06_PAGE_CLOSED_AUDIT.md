# SUBPLAN_PDF_06_PAGE_CLOSED_AUDIT — Phase F classification: Issue #5 page-closed mid-test

**Status**: DONE
**Executed**: 2026-05-07
**Priority**: P1
**Created**: 2026-05-07
**Identity**: OWNER
**Parent**: PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md
**Depends on**: SUBPLAN_PDF_02_LOCAL_REVALIDATE.md (DONE 2026-05-07 — confirmed Issue #5 still reproduces post-Phase-A)
**Blocks**: none (this subplan's deliverable is a classification + DEFERRED tracking; the actual fix is a separate future plan)
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

Phase F of `PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md`. Triggered because Issue #5 (`Target page, context or browser has been closed`) reproduced 5 times in Phase B's run-3 (2026-05-07), affecting the parent-plan-predicted TCs: TC-LOS-BAS-012 (×2 retries), TC-LOS-BAS-014 (×2), TC-LOS-BAS-020 (×1).

This subplan **CLASSIFIES** Issue #5 as either (a) Issue #1 fallout (a click on a wrong-URL element timed out 30s → page got closed during teardown — would auto-resolve with Phase A's fix) OR (b) distinct race (the page-closure happens for a different reason — needs separate fix).

Per the parent plan body line ~100, the original guidance was to walk the `trace.zip` artifacts. Direct evidence comparison between Run-1 (pre-Phase-A) and Run-3 (post-Phase-A) is sufficient for classification without opening trace.zip — see Phase 1 below.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**: `/identity`, `/relevant`, `/final-q`.

**Context files**: parent plan, SUBPLAN_PDF_02 (predecessor evidence), `clients/encore/reports/{run1,run3}-failure-summary.json`.

---

## Phase 0 — Dependency + browser-tool gate

1. SUBPLAN_PDF_02 in `plans/done/` ✓.
2. **Browser-tool announcement**: `BrowserTool: none` — pure read-only artifact comparison; no live-DOM or browser interaction.

---

## Phase 1 — Run-1 vs Run-3 evidence comparison (no trace.zip walkthrough needed)

Direct compare of Issue #5 hits across both runs (verified 2026-05-07 via `node` parse of failure-summary.json files):

| Metric | Run-1 (2026-05-06, pre-Phase-A) | Run-3 (2026-05-07, post-Phase-A) |
|---|---|---|
| Issue #5 hits | 5 | 5 |
| Affected TCs | TC-LOS-BAS-012 (×2), TC-LOS-BAS-014 (×2), TC-LOS-BAS-020 (×1) | TC-LOS-BAS-012 (×2), TC-LOS-BAS-014 (×2), TC-LOS-BAS-020 (×1) |
| `lastActions` pattern | "Before Hooks" → "Expect \"toBe\"" → "After Hooks" → "Worker Cleanup" | identical |
| `pageUrl` at failure | `/locations/1604/home` (URL drift active) | `about:blank` (no URL drift; page never warmed by validateState side-effect) |
| `urlBreadcrumbs.length` | 5–6 entries | 0 entries |
| Error message | "Test timeout of 30000ms exceeded \| locator.click: Target page, context or browser has been closed" | identical |

**Critical observation**: Run-1 and Run-3 have **IDENTICAL** Issue #5 hit counts (5) on **IDENTICAL** TCs (BAS-012/014/020). The `lastActions` chain ending in `"Worker Cleanup"` is identical. The error string is identical.

The only differences are downstream artifacts of the URL-drift fix (Run-3's `pageUrl=about:blank` vs Run-1's `pageUrl=/home`; Run-3's empty `urlBreadcrumbs` vs Run-1's populated breadcrumbs). Those differences are surface-level diagnostics changes, not changes to the underlying race.

**Verdict**: Issue #5 is **PRE-EXISTING**, **NOT** Issue #1 fallout. The page-closed-during-Worker-Cleanup race exists independently of URL drift. Phase A's fix could not have caused or cured Issue #5; the 5 hits in both runs are the SAME 5 hits (same TCs, same chain).

---

## Phase 2 — Classification + DEFERRED handoff

Per parent plan acceptance criterion #4 (LR-040 (a)/(b)/(c)):

- **Classification**: **DEFERRED** — Issue #5 is a distinct race in the test-cleanup path (pages getting closed before all teardown actions complete), not within this parent plan's scope. The 3 TCs (BAS-012/014/020) need their own RCA + fix subplan because the failure mode is in the spec-author / page-object boundary, not the framework auth/fixture path that this parent plan owns.
- **Tracking subplan**: a future plan (proposed name `PLAN_LOS_BAS_012_014_020_PAGE_CLOSED_RCA.md`) will:
  1. Open the trace.zip artifacts at `clients/encore/reports/test-results/tests-specs-setup-local-of-226e7-ades-to-QC-enabled-disabled-chromium*/` for BAS-012 (and similar for BAS-014/020).
  2. Identify the exact step where the page closes during teardown.
  3. RCA the underlying race (likely candidates: `test.afterEach`'s order vs Playwright's worker-recycle-on-failure path; or the dependencyGate's `afterEach` racing with the worker fixture's `await context.close()`).
  4. Implement the fix (most likely a teardown-order or cleanup-guard change in fixtures.ts or a per-spec adjustment).
- **Reopen criterion**: the future plan reopens with a `repeats` field on a single fresh 12-spec run showing Issue #5 hit count > 0. Run-3's 5 hits are already evidence enough to author the future plan immediately if Rutvik chooses; otherwise the future plan can also batch with other "real test bugs surface post-Phase-A" findings.

---

## Phase 3 — Phase A diagnostics-collector regression observation (out-of-scope addendum)

A second observation surfaced from Run-3 evidence that is NOT Issue #5 but is worth filing for traceability:

**Symptom**: Run-1 had `0/138 (0%)` failure entries with `pageUrl=about:blank`. Run-3 has `123/135 (91%)`. Run-1 always populated `urlBreadcrumbs` (≥5 entries per failure); Run-3's failures often have `urlBreadcrumbs=[]`.

**Hypothesis**: pre-Phase-A, validateState's side-effect navigated the worker's primary page to `baseUrl` BEFORE every test received the fixture — so the page was "warmed" with at least one URL event captured by the diagnostics collector. Post-Phase-A, with state-fresh path being the common case, the worker's primary page stays on `about:blank` until the test's page-object calls its own `navigate()`. Tests that fail BEFORE the page-object's navigate completes show `pageUrl=about:blank` and empty `urlBreadcrumbs` — this is a diagnostics-collector observability regression, NOT a regression in test execution (224 passed proves the framework still runs tests fine).

**Impact**: low — `pageUrl` becomes less informative on early-failure entries, but the failure error message and `lastActions` are still complete. Phase B's noise gate is unaffected (the strict-line gate is `retry=1 + pageUrl=/home`; about:blank entries are not /home).

**Tracking**: file in the same future plan as Issue #5's fix, OR file separately as `PLAN_DIAGNOSTICS_COLLECTOR_PAGE_WARM_UP.md`. Reopen criterion: any future session that wants to use `pageUrl` as a primary triage signal will need to ensure the collector hooks fire before the page-object's first navigation, OR the fixture's worker-scope finishes by performing a no-op `page.goto(config.base_url)` before `await use(...)` to provide a baseline URL event (similar to the OLD code's incidental warm-up via validateState's side-effect — but as a deliberate, isolated step, not a side-effect of an auth-state-check helper).

---

## Acceptance criteria

- [ ] Run-1 vs Run-3 Issue #5 evidence comparison documented (Phase 1 table) with `node` parse cite.
- [ ] Classification = DEFERRED with named successor plan + reopen criterion.
- [ ] Phase A diagnostics-collector observability regression filed as a separate addendum (Phase 3).
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp.
- [ ] Subplan `git mv` to `plans/done/` after Status flip.
- [ ] `npm run plans:reindex` re-run.
- [ ] `/final-q` verdict block emitted.

---

## Verification

```bash
# Issue #5 surface identical between runs
node -e "
const r1=JSON.parse(require('fs').readFileSync('clients/encore/reports/run1-failure-summary.json','utf8')).failures||[];
const r3=JSON.parse(require('fs').readFileSync('clients/encore/reports/run3-failure-summary.json','utf8')).failures||[];
const i5r1=r1.filter(x=>(x.error||'').includes('Target page, context or browser has been closed'));
const i5r3=r3.filter(x=>(x.error||'').includes('Target page, context or browser has been closed'));
console.log('r1 issue5:', i5r1.length, 'TCs:', JSON.stringify([...new Set(i5r1.map(x=>x.testName.split(':')[0]))].sort()));
console.log('r3 issue5:', i5r3.length, 'TCs:', JSON.stringify([...new Set(i5r3.map(x=>x.testName.split(':')[0]))].sort()));
"
# expect: identical TC sets across runs (BAS-012, BAS-014, BAS-020)
```

---

## Handoff (post-execution)

Phase F closes via classification: Issue #5 is PRE-EXISTING, NOT Phase-A fallout (verified by direct Run-1 vs Run-3 evidence compare — same 5 hits on same TCs with same `lastActions` chain). DEFERRED to a future plan named `PLAN_LOS_BAS_012_014_020_PAGE_CLOSED_RCA.md` for the actual trace.zip walkthrough + RCA + fix. A second addendum filed: Phase A introduced a diagnostics-collector observability regression (pageUrl=about:blank on early-failure entries due to loss of the validateState side-effect's incidental page warm-up); also DEFERRED with reopen criterion. Both deferrals satisfy parent plan acceptance criterion #4 LR-040 option (c). No follow-on subplan in THIS parent plan's chain — Phase D depends on Phase C, not on Phase F.

---

### Execution Summary (LR-027)

**Authored + executed**: 2026-05-07 within the same session as Phase A + B closure.

**Output**: classification (DEFERRED) + tracking subplan name + reopen criterion + diagnostics-collector observability regression addendum. No code or framework files modified by this subplan.

**Stewardship attestations**:
- **P1 cause-not-symptom**: Phase A's fix removed Issue #1 (URL drift) at the source; Issue #5's persistence in Run-3 confirms it's a separate race, NOT a symptom of Issue #1 — classification is honest.
- **P5 never ship framework noise**: until Issue #5's future RCA plan lands, Phase G stays parked (the colleague-facing CI report would still surface BAS-012/014/020 as flaky which is real failure visibility, not framework noise per se — but parent plan defers this judgement to the user).
- **P6 documented**: this Execution Summary + Run-1 vs Run-3 evidence table + named successor plan + reopen criterion.

**LR compliance**: LR-027 (this section), LR-028 (activity-log row), LR-035 (plans:reindex), LR-037 (timestamp ≥ touched-file mtimes), LR-040 option (c) (DEFERRED with named tracking + reopen criterion), LR-042 (final-q verdict in chat), LR-046 (no rescope; the strict line "classify Issue #5" is satisfied).
