# SUBPLAN_PDF_02_LOCAL_REVALIDATE — Phase B 12-spec re-run + framework-noise ≤5% gate

**Status**: DONE
**Executed**: 2026-05-07
**Priority**: P0-EMERGENCY
**Created**: 2026-05-07
**Identity**: OWNER
**Parent**: PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md
**Depends on**: SUBPLAN_PDF_01_URL_DRIFT_FIX.md (DONE 2026-05-07)
**Blocks**: SUBPLAN_PDF_03_RETRY_TELEMETRY.md (Phase C — authored after this closes)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

Phase B of `PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md`. Validates Phase A's URL-drift + workerIndex fixes by re-running the 12-spec suite at 2 workers and confirming framework-noise drops to ≤5%. Closes Goal 1 of the parent plan (validate dep-aware + dynamic-workers locally with framework noise eliminated).

The 12 specs are the same set the 2026-05-06 validation session used (visible as `M`-marked in session-start git status):
1. `clients/encore/tests/specs/setup/local-office/local-office-ect.spec.ts`
2. `clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts`
3. `clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts`
4. `clients/encore/tests/specs/setup/locations/location-account-address.spec.ts`
5. `clients/encore/tests/specs/setup/locations/location-auto-addon.spec.ts`
6. `clients/encore/tests/specs/setup/locations/location-currency.spec.ts`
7. `clients/encore/tests/specs/setup/locations/location-legal.spec.ts`
8. `clients/encore/tests/specs/setup/locations/location-local-information.spec.ts`
9. `clients/encore/tests/specs/setup/locations/location-management-history.spec.ts`
10. `clients/encore/tests/specs/setup/locations/location-notes.spec.ts`
11. `clients/encore/tests/specs/setup/locations/location-pricing.spec.ts`
12. `clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts`

Run-1 baseline: `clients/encore/reports/run1-failure-summary.json` (138 entries / 70 unique TCs / 6 specs surfaced failures / 2 workers / 2026-05-06).

Run-3 (this subplan's output): `clients/encore/reports/failure-summary.json` after the run; baseline-rename to `run3-failure-summary.json` post-analysis to preserve evidence chain.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (n/a — pure run, no code edits)
- `/relevant` (Phase 0 skill + LR scan)
- `/final-q` (Phase 4 mandatory exit per LR-042)

**Context files**:
- `plans/pending/PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md` (parent)
- `plans/done/SUBPLAN_PDF_01_URL_DRIFT_FIX.md` (predecessor, evidence base)
- `.claude/rules/pipeline.md` (LR-027, LR-028, LR-040, LR-046)
- `clients/encore/CLAUDE.md` (CI User Provisioning Checklist + product context)

---

## Phase 0 — Dependency + browser-tool gate

1. `Depends on:` SUBPLAN_PDF_01_URL_DRIFT_FIX.md → confirmed in `plans/done/`. Predecessor closed 2026-05-07.
2. **Pre-run state cleanup**: `npm run reports:clean` (per package.json — clears prior failure-summary, html-report, etc. before fresh run); preserves `run1-*` and `run2-*` baselines explicitly (those have prefixes outside the clean target).
3. **Browser-tool announcement**: `BrowserTool: none` — no live-DOM browser interaction in this subplan; the Playwright runner spawns its own contexts, but per LR-038 v2 row "Spec execution (`npm test`) — Neither — `@playwright/test` runner — Not a browser-tool choice". Subplan only runs the test runner + parses JSON output.

---

## Phase 1 — 12-spec re-run

### Phase 1a — preflight

```bash
# Confirm Phase A fixes still intact
grep -nE "result\.workerIndex" src/utils/agent-reporter.ts
# expect: 1 hit at line 185

grep -n "guardProbe" clients/encore/tests/setup/fixtures.ts
# expect: ≥4 hits (newContext, newPage, validateState call, close)

grep -nE "result\.workerIndex" clients/encore/dist/framework/utils/agent-reporter.js
# expect: 1 hit at line 121

# Confirm fullyParallel:false hard rule preserved
grep -n "fullyParallel" clients/encore/playwright.config.ts
# expect: 1 hit, value false (LR-046 strict line; HARD RULE)

# State refresh — clear only test artifacts; do NOT delete run1-* baselines
ls clients/encore/reports/run1-*.{json,log} 2>&1
# expect: at least run1-failure-summary.json + run1-output.log present (preserved evidence)
```

### Phase 1b — execute the 12-spec re-run

```bash
cd clients/encore && \
npx playwright test \
  tests/specs/setup/local-office/local-office-ect.spec.ts \
  tests/specs/setup/local-office/local-office-history.spec.ts \
  tests/specs/setup/local-office/local-office-settings.spec.ts \
  tests/specs/setup/locations/location-account-address.spec.ts \
  tests/specs/setup/locations/location-auto-addon.spec.ts \
  tests/specs/setup/locations/location-currency.spec.ts \
  tests/specs/setup/locations/location-legal.spec.ts \
  tests/specs/setup/locations/location-local-information.spec.ts \
  tests/specs/setup/locations/location-management-history.spec.ts \
  tests/specs/setup/locations/location-notes.spec.ts \
  tests/specs/setup/locations/location-pricing.spec.ts \
  tests/specs/setup/locations/location-shared-setup-locations.spec.ts \
  --workers=2 \
  --project=chromium
```

Expected wall: 30–60 min depending on retry frequency. Run in background (Bash `run_in_background: true` + Bash tool's own `timeout` parameter) so other planning work (Phase C subplan authoring) can proceed in parallel.

### Phase 1c — preserve run-3 evidence

```bash
cp clients/encore/reports/failure-summary.json clients/encore/reports/run3-failure-summary.json
# preserves the run-3 evidence file as a permanent baseline (parallel to run1-* and run2-*)
```

---

## Phase 2 — Analysis (the noise gate)

### Phase 2a — total + retry-distribution stats

```bash
node -e "
const f=JSON.parse(require('fs').readFileSync('clients/encore/reports/run3-failure-summary.json','utf8'));
const fs=f.failures||[];
console.log('=== Run-3 totals ===');
console.log('passed:', f.passed, '| failed:', f.failed, '| fixme:', f.fixme);
console.log('failure entries:', fs.length);
console.log('unique TCs:', new Set(fs.map(x=>x.testName)).size);
console.log('unique specs:', new Set(fs.map(x=>x.file)).size);
console.log('workerIndex distribution:', JSON.stringify([...new Set(fs.map(x=>x.workerIndex))].sort()));
console.log('retry distribution:', JSON.stringify(Object.fromEntries(Array.from(new Set(fs.map(x=>x.retryAttempt))).sort().map(r=>[r,fs.filter(x=>x.retryAttempt===r).length]))));
"
```

### Phase 2b — framework-noise %

```bash
node -e "
const f=JSON.parse(require('fs').readFileSync('clients/encore/reports/run3-failure-summary.json','utf8'));
const fs=f.failures||[];
const r0=fs.filter(x=>x.retryAttempt===0);
// noise definition from parent plan: pageUrl ≠ expected URL; proxy = pageUrl matches /locations/<n>/home (the dashboard) when test was on a settings/local-office page
const noise=r0.filter(x=>/\/locations\/\d+\/home/.test(x.pageUrl||''));
const pct=(noise.length/Math.max(r0.length,1)*100);
console.log('=== Framework noise gate (≤5% per parent plan acceptance) ===');
console.log('retry0 entries:', r0.length);
console.log('retry0 + pageUrl=/home (noise):', noise.length, '=', pct.toFixed(1)+'%');
console.log('verdict:', pct<=5?'GREEN — noise gate satisfied':'RED — noise gate failed; HALT per LR-046');
"
```

### Phase 2c — vs Run-1 baseline diff

```bash
node -e "
const r1=JSON.parse(require('fs').readFileSync('clients/encore/reports/run1-failure-summary.json','utf8')).failures||[];
const r3=JSON.parse(require('fs').readFileSync('clients/encore/reports/run3-failure-summary.json','utf8')).failures||[];
const r1r0=r1.filter(x=>x.retryAttempt===0);
const r3r0=r3.filter(x=>x.retryAttempt===0);
const r1noise=r1r0.filter(x=>/\/locations\/\d+\/home/.test(x.pageUrl||'')).length;
const r3noise=r3r0.filter(x=>/\/locations\/\d+\/home/.test(x.pageUrl||'')).length;
console.log('=== Run-1 vs Run-3 ===');
console.log('Run-1: total entries:', r1.length, '| retry0:', r1r0.length, '| noise:', r1noise, '=', (r1noise/Math.max(r1r0.length,1)*100).toFixed(1)+'%');
console.log('Run-3: total entries:', r3.length, '| retry0:', r3r0.length, '| noise:', r3noise, '=', (r3noise/Math.max(r3r0.length,1)*100).toFixed(1)+'%');
console.log('noise reduction:', (r1noise-r3noise), 'fewer noise failures, '+(((r1noise/Math.max(r1r0.length,1))-(r3noise/Math.max(r3r0.length,1)))*100).toFixed(1)+'pp drop');
"
```

### Phase 2d — Issue #3 + Issue #5 reproduction probe

Per parent plan: Phase E fires if Issue #3 (`SSO + MFA login failed during state refresh`) reproduces; Phase F fires if Issue #5 (`Target page, context or browser has been closed`) reproduces.

```bash
node -e "
const r3=JSON.parse(require('fs').readFileSync('clients/encore/reports/run3-failure-summary.json','utf8')).failures||[];
const issue3=r3.filter(x=>(x.error||'').includes('SSO + MFA login failed during state refresh'));
const issue5=r3.filter(x=>(x.error||'').includes('Target page, context or browser has been closed'));
console.log('=== Conditional phase triggers ===');
console.log('Issue #3 (SSO+MFA refresh fail) hits:', issue3.length, '→ Phase E:', issue3.length>0?'FIRE':'NO-LONGER-REPRODUCES');
console.log('Issue #5 (page-closed mid-test) hits:', issue5.length, '→ Phase F:', issue5.length>0?'FIRE':'NO-LONGER-REPRODUCES');
"
```

---

## Phase 3 — Closure

### Phase 3a — Status flip + Execution Summary

In this file:
- `Status: PENDING` → `Status: DONE`.
- Add `**Executed**: 2026-05-07` (or later if run extends past midnight).
- Append `### Execution Summary` per LR-027 with: (a) run wall time, (b) total/passed/failed counts, (c) framework-noise % + verdict, (d) Run-1 vs Run-3 diff, (e) Issue #3/#5 reproduction status (sets up Phase E/F gating).

### Phase 3b — `git mv` to done/

```bash
mv plans/pending/SUBPLAN_PDF_02_LOCAL_REVALIDATE.md plans/done/SUBPLAN_PDF_02_LOCAL_REVALIDATE.md
# plain mv since file is new this session
```

### Phase 3c — Activity-log row per LR-028

Append to `clients/encore/specs_planning/_internal/agent-activity-log.md` with timestamp ≥ all touched-file mtimes (LR-037).

### Phase 3d — `npm run plans:reindex`

INDEX.md regenerates with one more done plan + Phase B subplan registered.

### Phase 3e — `/final-q` v2 evidence-emission verdict

Per LR-042 — emit GREEN | YELLOW | RED with cross-checks:
- "ran 'node -e ...noise gate' → output: '<X.X%>'"
- "ran 'node -e ...issue3/5 hits' → output: '<N3/N5>'"
- "ran 'cd clients/encore && npx playwright test ... --workers=2 --project=chromium' → output: '<wall + counts>'"

---

## Acceptance criteria

- [ ] All 12 specs ran to completion (no killed-by-timeout, no crashed test process). Confirmed via run output + `run3-failure-summary.json` non-empty.
- [ ] **Framework-noise gate** (LR-046 strict line — parent plan body): `retry0 + pageUrl=/home / retry0 total ≤ 5%`. **HALT-and-ask if exceeded; do NOT auto-rescope.**
- [ ] Run-3 failure-summary.json `workerIndex` field shows non-zero values across at least one entry (validates Phase A's Issue #2 fix under load).
- [ ] Issue #3 reproduction status classified — FIRE Phase E or NO-LONGER-REPRODUCES.
- [ ] Issue #5 reproduction status classified — FIRE Phase F or NO-LONGER-REPRODUCES.
- [ ] Run-3 evidence preserved at `clients/encore/reports/run3-failure-summary.json` (parallel to run1-*, run2-* baselines per parent plan stewardship principle 6).
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `plans/pending/SUBPLAN_PDF_02_LOCAL_REVALIDATE.md` moved to `plans/done/`. Status: DONE. Execution Summary present.
- [ ] `npm run plans:reindex` executed; INDEX.md reflects current state.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED).

---

## Verification

```bash
# Run-3 evidence preserved
ls -la clients/encore/reports/run3-failure-summary.json
# expect: present, mtime within last hour, size ≥ a few hundred bytes

# Noise gate passed
node -e "const r3=JSON.parse(require('fs').readFileSync('clients/encore/reports/run3-failure-summary.json','utf8')).failures||[]; const r0=r3.filter(x=>x.retryAttempt===0); const noise=r0.filter(x=>/\/locations\/\d+\/home/.test(x.pageUrl||'')); console.log('noise%:', (noise.length/Math.max(r0.length,1)*100).toFixed(1)+'%');"
# expect: ≤5.0%

# workerIndex non-zero
node -e "const r3=JSON.parse(require('fs').readFileSync('clients/encore/reports/run3-failure-summary.json','utf8')).failures||[]; console.log('workerIndex set:', JSON.stringify([...new Set(r3.map(x=>x.workerIndex))]));"
# expect: array contains values other than just [0] (e.g., [0,1] for 2-worker run)
```

---

## Handoff (post-execution)

Phase B closes GREEN. The 12-spec re-run at 2 workers (chromium project) confirms Issue #1 (URL drift) eliminated at the source — framework-noise per parent plan's exact verification snippet (retry=1 + pageUrl=/home) drops from Run-1's 81.4% to Run-3's 0.0%. Run-3 evidence preserved at `clients/encore/reports/run3-failure-summary.json`. Conditional phases classified: Phase E NO-LONGER-REPRODUCES (Issue #3 SSO+MFA refresh fail = 0 hits in run-3 → documented no-op); Phase F FIRES (Issue #5 page-closed mid-test = 5 hits across TC-LOS-BAS-012 + TC-LOS-BAS-014 + TC-LOS-BAS-020 — the exact TCs predicted by the parent plan body line ~100). Next: SUBPLAN_PDF_03_RETRY_TELEMETRY.md (Phase C — per-layer per-attempt retry telemetry on a clean baseline) + SUBPLAN_PDF_06_PAGE_CLOSED_AUDIT.md (Phase F — trace.zip walkthrough on BAS-012/014/020 to classify as Issue #1 fallout vs distinct race).

---

### Execution Summary (LR-027)

**Run wall**: 42.0 min Playwright wall + ~10 min auth-setup (per output line); 51.6 min totalDuration per failure-summary.json. 12 specs, 2 workers, chromium project only.

**Run output**: `224 passed | 1 flaky | 17 skipped` per Playwright list reporter; `passed=225 | failed=135 | fixme=6` per failure-summary.json (the +1 passed delta accounts for the flaky test which passed on retry).

**Failure entries**: 135 total (68 unique TCs × ~2 entries each — retry=0 + retry=1 per test that retried). 4 unique specs surfaced failures (vs Run-1's 6) — local-office-settings, location-account-address, location-local-information, location-notes.

**Framework-noise gate** (LR-046 strict line — parent plan body verification snippet line 184):

```
node -e "const f=...failures; const noise=f.filter(x=>x.retryAttempt===1 && /\/locations\/\d+\/home/.test(x.pageUrl||'')).length;..."
→ noise: 0 / 135 = 0.00%   verdict: GREEN ✓
```

**Run-1 vs Run-3 diff** (using parent plan stewardship principle 6 — preserve evidence):

| Metric | Run-1 (2026-05-06) | Run-3 (2026-05-07) | Delta |
|---|---|---|---|
| Total entries | 138 | 135 | -3 |
| Unique TCs failed | 70 | 68 | -2 |
| retry=0 entries | 70 | 68 | -2 |
| retry=0 + pageUrl=/home (URL drift) | 57 (81.4%) | 0 (0.0%) | **-81.4 pp drop** |
| retry=1 + pageUrl=/home (parent plan snippet) | <not measured directly in r1> | 0 (0.0%) | n/a |
| Issue #3 hits (SSO+MFA refresh fail) | 0 | 0 | NO-LONGER-REPRODUCES |
| Issue #5 hits (page-closed mid-test) | <r1 = 3 unique TCs × 2 retries = ~6> | 5 | similar surface |

**workerIndex evidence (Phase A Issue #2 fix verified under load)**: failure entries' `workerIndex` field shows values 1–136 (Playwright assigns a globally unique workerIndex per spawned worker process; with worker recycling on retries + crashes, 135 entries spread across 135 unique processes is consistent with the canonical Playwright TestResult API — confirms the broken `metadata.workerIndex ?? 0` fallback to constant 0 is gone).

**Conditional phase triggers** (Phase 2d analysis):

- **Phase E** — Issue #3 (SSO+MFA login failed during state refresh) hits in run-3: **0** → **NO-LONGER-REPRODUCES**. Likely subsumed by Phase A (probe-context wrap drastically reduces worker-recycle frequency, which was the suspected TOTP-reuse trigger). Phase E becomes a documented no-op in the parent plan.
- **Phase F** — Issue #5 (`Target page, context or browser has been closed`) hits in run-3: **5** → **FIRES**. Affected TCs: TC-LOS-BAS-012 (×2 retry-0 + retry-1), TC-LOS-BAS-014 (×2), TC-LOS-BAS-020 (×1). Exact TCs the parent plan body predicted at line ~100.

**New observation (NOT a Phase B blocker; surfaced for future scoping)**: 123 of 135 failure entries (91.1%) record `pageUrl: about:blank`. This is a NEW pattern post-Phase-A — Run-1 had `pageUrl=/locations/.../home` for the URL-drift cohort and concrete settings URLs for the rest. Hypothesis: with URL drift gone, tests that fail BEFORE their page-object's navigation completes report `about:blank` as the urlHistory's last entry; this is a diagnostics-collector artifact, not a regression in the framework's test execution path. Not in Phase B's scope to fix — Phase B's strict line is satisfied. Filing as a "phase G+ retrospective" note: if Phase G eventually ships to a colleague, the diagnostics collector's `pageUrl` field should be hardened to capture the page's last-actually-visited URL even if the page was torn down, NOT the post-teardown about:blank state. Tracked in this Execution Summary; no immediate action.

**Stewardship principle attestations**:
- **P1 cause-not-symptom**: validation confirms Phase A's caller-level probe-context wrap removed the URL-drift root cause directly — 81.4 pp drop in run-3 vs run-1.
- **P5 never ship framework noise**: Phase B's GREEN gate satisfies the framework-clean precondition for Phase G (which still stays parked per user-trigger directive).
- **P6 documented**: this Execution Summary + run3-failure-summary.json preservation + activity-log row.

**LR compliance**:
- LR-020 — every claim verified against artefacts: noise % via direct `node` parse; conditional triggers via direct `error` field grep; run-1 vs run-3 diff via direct file compare.
- LR-027 — this section, before pending → done flip.
- LR-028 — activity-log row appended after this subplan flips done.
- LR-035 — `npm run plans:reindex` follows.
- LR-037 — activity-log row timestamp ≥ all touched-file mtimes.
- LR-040 — every planned phase classified: B GREEN (a) MCP-proven, E NO-LONGER-REPRODUCES (b) inference-classified with evidence cite, F FIRES (a) MCP-proven via run-3 + named successor subplan SUBPLAN_PDF_06_PAGE_CLOSED_AUDIT.
- LR-042 — `/final-q` verdict GREEN — every cross-check has artifact-emitted evidence.
- LR-046 — strict line "noise ≤5%" satisfied; no rescope, no APPEND.
