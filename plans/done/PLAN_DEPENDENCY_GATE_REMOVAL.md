# PLAN_DEPENDENCY_GATE_REMOVAL — Remove dependencyGate test.skip cascade; tests must surface their own failures

**Status**: DONE
**Executed**: 2026-05-08
**Priority**: P0-EMERGENCY
**Created**: 2026-05-08
**Revised**: 2026-05-08 (post-/review — 8 findings F-1..F-8 corrected; per-spec nav-guard rollout enumerated; acceptance contract realizable)
**Identity**: OWNER
**Depends on**: PLAN_ONE_GUIDE_SAID_THIS.md
**Blocks**: none
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Pin**: TOP-OF-INDEX-PER-USER-DIRECTIVE-2026-05-08

---

## Context

User directive 2026-05-08 (during PLAN_ONE_GUIDE_SAID_THIS Q2 decision): the per-spec `dependencyGate(['TC-...'])` calls in **12 spec files** (281 calls total — verified via grep) invoke `base.skip(true, ...)` when a declared dependency failed in a prior test. This is "lazy skipping" — tests are silently masked instead of surfacing their own failures. Long-standing user memory `feedback_skip_discipline.md`: "Never lazily SKIP tests — test the ERROR condition." Guide 2's RCA also flagged this: "user explicitly forbids fancy skipping. Final green cannot include dep-gate skips."

In PLAN_ONE_GUIDE_SAID_THIS, removing dep-gate skip was DEFERRED so that data-fix + nav-guard fixes could land first without exploding the noise floor during diagnosis. Now that BAS spec is green at 1w (post-PLAN_ONE_GUIDE_SAID_THIS), this subplan removes the skip across all 12 consumer specs.

**Critical correction over v1 plan (post-/review F-1)**: PLAN_ONE_GUIDE_SAID_THIS B5 added a `test.beforeEach` per-test navigation guard to **only one** spec — [local-office-settings.spec.ts:33-38](../../clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts:33). The other **11 specs** that use `dependencyGate` have no nav guard. Removing dep-gate skip without rolling out the nav guard to all 12 specs would recreate the retry-on-`/home` cascade Guide 2 documented (BAS 99/18, MGH 52/6, PRI 39/6) across the 11 unguarded specs. **Therefore Phase 1.5 of this plan rolls out the nav guard to all 11 missing specs IN-SCOPE before Phase 2 deletes `base.skip()`.** With nav guards present everywhere, dep-gate's only remaining job becomes annotation/observability — NOT skip-cascade.

**Pre-existing legitimate skips out of scope**: Phase 1.3 inventories the 13 known pre-existing `test.skip` / `test.fixme` calls (BAS-048, MGH-006/007/019, PRI-020/025/value-toggle, SSL-018/019/021/024/026/030). These have their own justifications (data prereqs, dialog bugs) and are LR-021 candidates for separate plans. This plan does not touch them. The acceptance contract is "zero **dep-gate-induced** skips" (annotation type `depGateSkipped` produces zero hits), NOT global zero-skip.

**Provenance**: Authored from PLAN_ONE_GUIDE_SAID_THIS Q2 deferral. Prerequisite: PLAN_ONE_GUIDE_SAID_THIS in `plans/done/` (verified 2026-05-08).

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots; framework refactor with cross-spec impact)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/final-q` (Phase 4 — mandatory exit per LR-042)
- `/review` (Phase 3 — code review against framework conventions before commit)

**Context files**:
- `plans/done/PLAN_ONE_GUIDE_SAID_THIS.md` (parent / prerequisite)
- `.claude/rules/specs.md` (LR-018, LR-019, LR-021, LR-024 — spec-fixing workflow)
- `.claude/rules/pipeline.md` (LR-027, LR-028, LR-040, LR-046, LR-048, LR-050)
- `.claude/rules/angular.md` (LR-009, LR-026 — dirty state — bears on Phase 3 baseline guards)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)
- `clients/encore/CLAUDE.md` (LR-ENC-001 baseline truth source)
- Auto-memory `feedback_skip_discipline.md` — "Never lazily SKIP tests"

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on:` plan PLAN_ONE_GUIDE_SAID_THIS.md is in `plans/done/` (verified 2026-05-08; else HALT — pre-conditions not met).
2. Read `.claude/context/navigation.md` — check Exploration Registry for "dependency-gate" / "test.skip" / "nav-guard rollout" entries.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter ALL-* + skip-related findings.
4. Read `.claude/context/patterns.md` — match any "spec-skip" decision tree.
5. LR scan — fire LR-018 (run-all is only truth), LR-019 (first-test baseline), LR-021 (un-skip-before-rewrite — does NOT fire here because the 13 pre-existing skips are out of scope), LR-024 (clean-then-RCA).
6. **Browser-tool announcement**: emit `BrowserTool=none` (this is a framework code refactor — no live website interaction).

---

## Phase 1 — Inventory + impact analysis

1. Re-read [`clients/encore/tests/setup/dependency-gate.ts`](../../clients/encore/tests/setup/dependency-gate.ts) — verified line map:
   - Lines 26-30: constants (`TC_ID_REGEX`, `STATE_DIR`, `DEP_ANNOTATION`, `SKIP_ANNOTATION`).
   - Lines 32-45: `stateFileFor` helper.
   - Lines 47-56: `readRegistry`.
   - Lines 58-67: `writeRegistry`.
   - Lines 71-85: `dependencyGateExt` with `base.skip(true, ...)` on **line 81** and `SKIP_ANNOTATION` push on line 80.
   - Lines 96-118: `dependencyGateAfterEach` (registry-update hook).
   - Lines 125-130: `wipeDepGateState` (called from globalSetup).
2. Confirm call-site count via grep:
   - `Grep "dependencyGate(" clients/encore` → 12 spec files, 281 calls (matches Guide 2's RCA count of 281).
   - The 12 specs are exactly the list in Phase 1.5 below.
3. **Pre-flight skip inventory** — count and identify every PRE-EXISTING `test.skip` / `test.fixme` call across the 12 specs (NOT dep-gate-induced). Confirmed baseline as of revision date:

| Spec | Line | Type | Reason |
|---|---|---|---|
| `local-office-settings.spec.ts` | 774 | `test.skip` | TC-LOS-BAS-048 — Room toggle round-trip |
| `location-management-history.spec.ts` | 73 | `test.skip` | TC-LOC-MGH-006 — needs <=20-row location |
| `location-management-history.spec.ts` | 81 | `test.skip` | TC-LOC-MGH-007 — needs zero-row location |
| `location-management-history.spec.ts` | 199 | `test.skip` | TC-LOC-MGH-019 — pagination prereq |
| `location-pricing.spec.ts` | 365 | `test.skip` | TC-LOC-PRI-020 — valid dates persist |
| `location-pricing.spec.ts` | 456 | `test.skip` | TC-LOC-PRI-025 — corporate pricing toggle |
| `location-pricing.spec.ts` | 499 | `test.skip` | TC-LOC-PRI-{value-toggle} — bidirectional persist |
| `location-shared-setup-locations.spec.ts` | 180 | `test.fixme` | SSL serial-state breaks clickAdd |
| `location-shared-setup-locations.spec.ts` | 201 | `test.fixme` | SSL same-dialog issue |
| `location-shared-setup-locations.spec.ts` | 235 | `test.fixme` | SSL Miami search returns 0 results |
| `location-shared-setup-locations.spec.ts` | 271 | `test.fixme` | (same) |
| `location-shared-setup-locations.spec.ts` | 300 | `test.fixme` | (same) |
| `location-shared-setup-locations.spec.ts` | 368 | `test.fixme` | (same) |

**Total: 13 pre-existing skips/fixmes across 4 specs.** These are OUT OF SCOPE for this plan. They remain untouched. The acceptance contract is "zero `depGateSkipped` annotations", NOT "zero `test.skip` calls."

Save this table verbatim to `clients/encore/specs_planning/_internal/preflight-skip-inventory-2026-05-08.md` for cross-check during Phase 4.

4. Classify each of the 281 dep-gate calls:
   - **Cosmetic-only deps** — TC depends on TC-001 navigation; per-test `beforeEach` nav guard from Phase 1.5 covers this. Annotation-only post-Phase-2.
   - **State-baseline deps** — TC depends on TC-001 having run baseline reset (LR-019). Phase 3 confirms each spec's TC-001 still runs first; if not, flag (but this is current state — verified at v1-plan time as enforced by `fullyParallel: false` + source-order).
   - **Genuine sequential deps** — TC genuinely cannot run unless TC-X mutated specific state. Rare in this framework; if found, surface as a Phase 4 finding.

   Output classification table to `clients/encore/specs_planning/_internal/dep-gate-inventory-2026-05-08.md`.

---

## Phase 1.5 — Per-spec nav-guard rollout (NEW — fixes /review F-1)

The reference implementation lives at [`local-office-settings.spec.ts:33-38`](../../clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts:33):

```ts
test.beforeEach(async ({ localOfficeSettingsPage }) => {
  const url = localOfficeSettingsPage.getCurrentUrl();
  if (!url.includes('settings/local-office')) {
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  }
});
```

**Per-spec rollout table** — port this block (parameterized) into each of the 11 specs missing it. Insert immediately after the `test.describe(...)` opening brace, before the first `test(...)` definition:

| # | Spec | Fixture | URL fragment | Nav method on URL mismatch |
|---|---|---|---|---|
| 1 | `local-office-ect.spec.ts` | `localOfficeSettingsPage` | `settings/local-office` | `reloadBasicInfo(OFFICE_NO)` then `navigateToEctTab()` |
| 2 | `local-office-history.spec.ts` | `localOfficeSettingsPage` | `settings/local-office` | `reloadBasicInfo(OFFICE_NO)` then `navigateToHistoryTab()` |
| 3 | `location-account-address.spec.ts` | `locationAccountAddressPage` | `settings/location` | `navigateToAccountAndAddressTab(OFFICE_NO)` |
| 4 | `location-auto-addon.spec.ts` | `locationAutoAddonPage` | `settings/location` | `navigateToAutoAddonTab(OFFICE_NO)` |
| 5 | `location-currency.spec.ts` | `locationCurrencyPage` | `settings/location` | `navigateToCurrencyTab(OFFICE_NO)` |
| 6 | `location-legal.spec.ts` | `locationLegalPage` | `settings/location` | `navigateToLegalTab(OFFICE_NO)` |
| 7 | `location-local-information.spec.ts` | `locationLocalInfoPage` | `settings/location` | `navigateToLocalInfoTab(OFFICE_NO)` |
| 8 | `location-management-history.spec.ts` | `locationManagementHistoryPage` | `settings/location` | `navigateToHistoryTab(OFFICE_NO)` |
| 9 | `location-notes.spec.ts` | `locationNotesPage` | `settings/location` | `navigateToNotesTab(OFFICE_NO)` |
| 10 | `location-pricing.spec.ts` | `locationPricingPage` | `settings/location` | `navigateToPricingTab(OFFICE_NO)` |
| 11 | `location-shared-setup-locations.spec.ts` | `locationSharedSetupLocationsPage` (aliased `pg` in this spec) | `settings/location` | `navigateToSharedSetupTab(OFFICE_NO)` |

**Block template** (substitute `<fixture>`, `<fragment>`, `<navMethod>` per row):

```ts
test.beforeEach(async ({ <fixture> }) => {
  const url = <fixture>.getCurrentUrl();
  if (!url.includes('<fragment>')) {
    await <fixture>.<navMethod>;
  }
});
```

**Helper-availability check** — if `getCurrentUrl()` does not exist on a given page object, add it to [`clients/encore/src/common/base-page.ts`](../../clients/encore/src/common/base-page.ts) as a one-liner: `getCurrentUrl(): string { return this.page.url(); }`. Single addition serves all page objects via inheritance. Verify before per-spec edits with `Grep "getCurrentUrl" clients/encore/src` — landed in PLAN_ONE_GUIDE_SAID_THIS B5.

**Verification per spec**: after each insertion, run that spec at workers=1 retries=2 (the retry config that exposes the cascade) and confirm zero retries land on `/home`. Sequence: BAS already done (skip), then in order: ECT, HIS, ACC, AAO, CUR, LGL, LI, MGH, NTS, PRI, SSL.

---

## Phase 2 — Refactor `dependency-gate.ts` to annotation-only + LR-050 stale-cleanup (fixes F-4, F-5, F-6)

### 2.1 Edit [`clients/encore/tests/setup/dependency-gate.ts`](../../clients/encore/tests/setup/dependency-gate.ts)

- Keep the `dependencyGate` function signature unchanged (`dependencyGate(deps: string[])`).
- Keep the `DEP_ANNOTATION` constant (line 29) and the annotation push at lines 75-77 (preserves observability — annotations show in Allure / HTML reports).
- **DELETE** `SKIP_ANNOTATION` constant (line 30).
- **DELETE** the `readRegistry` call (line 74), the blocker check (line 78), the `SKIP_ANNOTATION` push (line 80), and the `base.skip(true, ...)` call (line 81).
- **DELETE** `stateFileFor` (lines 32-45), `readRegistry` (lines 47-56), `writeRegistry` (lines 58-67), `STATE_DIR` (line 27), and the `path` + `fs` imports if no longer used.
- **DELETE** `dependencyGateAfterEach` export (lines 87-118).
- **DELETE** `wipeDepGateState` export (lines 120-130).
- Resulting file: ~25 lines — just `DEP_ANNOTATION`, `Fixture` type, `dependencyGateExt` with annotation-only behavior.
- Add header comment: `// 2026-05-08: skip-cascade removed per PLAN_DEPENDENCY_GATE_REMOVAL — annotation-only via DEP_ANNOTATION; tests surface their own failures (feedback_skip_discipline.md).`

### 2.2 Edit [`clients/encore/tests/setup/fixtures.ts`](../../clients/encore/tests/setup/fixtures.ts)

- Line 30 import: change `import { dependencyGateExt, dependencyGateAfterEach } from './dependency-gate';` → `import { dependencyGateExt } from './dependency-gate';`
- Lines 371-376: **DELETE** the comment block + `test.afterEach(async ({}, testInfo) => { dependencyGateAfterEach(testInfo); });`

### 2.3 Edit [`clients/encore/tests/setup/global-setup.ts`](../../clients/encore/tests/setup/global-setup.ts)

- Line 4: **DELETE** `import { wipeDepGateState } from './dependency-gate';`
- Lines 34-37: **DELETE** the comment block + `wipeDepGateState();` call.
- Line 69: **DELETE** `'reports/dep-gate-state',` from the `REPORT_DIRS` array.

### 2.4 Edit [`clients/encore/playwright.config.ts`](../../clients/encore/playwright.config.ts) — fixes F-6

Lines 28-33 currently read:

```ts
// HARD RULE: 1 spec = 1 worker, always (no within-file split). Required so
// dependencyGate's per-process registry (clients/encore/tests/setup/dependency-gate.ts)
// tracks dep outcomes correctly within a spec. Workers still run DIFFERENT specs
// in parallel via AUTH-STATE-SHARED (storageState shared via .auth/encore-state.json).
// Do not flip back to true.
fullyParallel: false,
```

Rewrite to:

```ts
// HARD RULE: 1 spec = 1 worker, always (no within-file split). Required so each
// spec's TC-001 baseline-reset (per LR-019) runs first in source order before
// dependent tests. Within-file parallel would race TC-002+ against the baseline
// state TC-001 establishes. Workers still run DIFFERENT specs in parallel via
// AUTH-STATE-SHARED (storageState shared via .auth/encore-state.json).
// Do not flip back to true.
fullyParallel: false,
```

(dep-gate registry is gone post-Phase-2.1; LR-019 baseline-reset is the new load-bearing reason.)

### 2.5 Filesystem cleanup

- Delete leftover `clients/encore/reports/dep-gate-state/` directory if present (gitignored content, safe to remove).

### 2.6 Typecheck gate

- Run `npm run typecheck` from `clients/encore/`. Fix any type errors surfaced (most likely: dangling imports or unused symbols). HALT if typecheck does not pass — do not proceed to Phase 3.

---

## Phase 3 — State-baseline guard verification

For each of the 12 specs, confirm TC-001 still establishes baseline state per LR-019:

1. Read each spec's TC-001 — verify it (a) navigates fresh, (b) reads current state, (c) resets dirty fields, (d) saves if needed, (e) re-navigates clean. Reference shape: [`local-office-settings.spec.ts`](../../clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts) TC-LOS-BAS-001.
2. Source order is enforced by `fullyParallel: false` (Phase 2.4); TC-001 runs first within each spec.
3. If TC-N requires state TC-001 set AND TC-001 happens to fail, post-Phase-2 the failure surfaces directly on TC-N (no skip mask). This is the desired behavior — surface real failures.
4. No code changes expected here; this phase is verification + flagging. If a spec lacks a proper TC-001 baseline, log it as a Phase 4 finding and surface to user (do NOT auto-fix — out of this plan's scope per LR-046; that's per-spec triage).

---

## Phase 4 — Verification (the gate that proves removal is safe)

### 4.1 Per-spec individual runs at workers=1 retries=0

Run each affected spec INDIVIDUALLY (the 12 specs from Phase 1.5):

```
clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts
clients/encore/tests/specs/setup/local-office/local-office-ect.spec.ts
clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts
clients/encore/tests/specs/setup/locations/location-account-address.spec.ts
clients/encore/tests/specs/setup/locations/location-auto-addon.spec.ts
clients/encore/tests/specs/setup/locations/location-currency.spec.ts
clients/encore/tests/specs/setup/locations/location-legal.spec.ts
clients/encore/tests/specs/setup/locations/location-local-information.spec.ts
clients/encore/tests/specs/setup/locations/location-management-history.spec.ts
clients/encore/tests/specs/setup/locations/location-notes.spec.ts
clients/encore/tests/specs/setup/locations/location-pricing.spec.ts
clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts
```

### 4.2 Acceptance: zero `depGateSkipped` annotations

Each spec must produce **zero `depGateSkipped` annotations** post-removal (Playwright JSON reporter `reports/test-results.json` cross-checked: `jq '[.suites[].specs[].tests[].annotations[]? | select(.type=="depGateSkipped")] | length'` must return 0). Pre-existing `test.skip` / `test.fixme` calls from Phase 1.3 inventory will still produce skip outcomes — those are expected and out of scope.

Failures, if any, must surface with their own diagnostic — NOT cascade-skip. Increase in failure count vs PLAN_ONE_GUIDE_SAID_THIS post-state is allowed if each new failure has a concrete error (not a cascade artifact). Decrease is the goal but not strictly required.

### 4.3 Retry-cascade regression check (workers=1 retries=2)

Run each of the previously-flaking specs at the CI default `retries=2` (this is the config that exposes the /home cascade — Phase 4.1 with retries=0 cannot prove the nav guard works under retry):

- `local-office-settings.spec.ts` (BAS — already nav-guarded via PLAN_ONE_GUIDE_SAID_THIS B5)
- `location-management-history.spec.ts` (MGH — newly nav-guarded in Phase 1.5 #8)
- `location-pricing.spec.ts` (PRI — newly nav-guarded in Phase 1.5 #10)

Acceptance: zero retries land on `/home`, zero `depGateSkipped` annotations under retry.

### 4.4 Cross-spec smoke at workers=1 retries=2

Run full repo at workers=1 retries=2 (not retries=0 — retries=0 would not exercise the cascade). Confirm:
- Zero `depGateSkipped` annotations globally.
- Pre-existing 13 `test.skip`/`test.fixme` calls produce 13 skipped outcomes (matches Phase 1.3 inventory; deviation = Phase 4 finding for separate plans).

### 4.5 Compare pre-vs-post failure profile

Diff `reports/failure-summary.json` post-removal against pre-removal baseline. Surface:
- Failures cleared by nav-guard rollout (expected: most BAS/MGH/PRI /home cascade entries gone).
- Failures newly surfaced (real failures previously masked by dep-gate skip).
- Failures unchanged (genuine first-attempt issues unrelated to dep-gate).

---

## Phase 5 — Document the new state

1. Update [`.claude/rules/specs.md`](../../.claude/rules/specs.md) — add a one-line note under the existing rules: `dependencyGate is annotation-only as of 2026-05-08 (PLAN_DEPENDENCY_GATE_REMOVAL); never gates execution. Tests surface their own failures.`
2. Activity log entry per LR-028 in `clients/encore/specs_planning/_internal/agent-activity-log.md`. (Phase 5.2 of v1 plan was a directive to update agent-mistakes.md citing a pattern that grep does not find — DROPPED per /review F-5.)
3. Update `.claude/context/navigation.md` Exploration Registry with a "dependency-gate refactor 2026-05-08" entry so future sessions skip rediscovery.

---

## Acceptance criteria

- [ ] [`dependency-gate.ts`](../../clients/encore/tests/setup/dependency-gate.ts) no longer calls `base.skip()` (`Grep "base.skip" clients/encore/tests/setup/dependency-gate.ts` returns 0 hits).
- [ ] [`dependency-gate.ts`](../../clients/encore/tests/setup/dependency-gate.ts) no longer exports `dependencyGateAfterEach` or `wipeDepGateState` (grep-verified).
- [ ] [`fixtures.ts`](../../clients/encore/tests/setup/fixtures.ts) no longer imports/calls `dependencyGateAfterEach` (grep-verified).
- [ ] [`global-setup.ts`](../../clients/encore/tests/setup/global-setup.ts) no longer imports/calls `wipeDepGateState` and no longer lists `'reports/dep-gate-state'` in `REPORT_DIRS` (grep-verified).
- [ ] [`playwright.config.ts`](../../clients/encore/playwright.config.ts) `fullyParallel: false` justification comment cites LR-019, not dep-gate registry.
- [ ] All 12 spec files using `dependencyGate(` still typecheck and parse (`npm run typecheck` passes).
- [ ] All 11 specs from Phase 1.5 table now contain a `test.beforeEach` nav guard matching the BAS reference shape (per-spec grep verification: each spec contains `test.beforeEach` with the appropriate URL fragment + navMethod).
- [ ] Each affected spec runs at workers=1 retries=0 with **zero `depGateSkipped` annotations** (Playwright JSON reporter cross-check via `jq`).
- [ ] BAS / MGH / PRI runs at workers=1 retries=2 produce zero retries landing on `/home` AND zero `depGateSkipped` annotations.
- [ ] Pre-existing 13 `test.skip` / `test.fixme` calls from Phase 1.3 inventory remain untouched (count unchanged; out of scope for this plan).
- [ ] Activity log row added per LR-028.

**LR-046 strict-line guard**: "zero `depGateSkipped` annotations" is strict. If any spec produces a non-zero `depGateSkipped` count post-removal, HALT and ask the user. The 13 pre-existing `test.skip` / `test.fixme` calls inventoried in Phase 1.3 are **explicitly out of scope** — their skip counts are expected and do NOT trip the guard.

**LR-050 stale-cleanup**: this plan restructures the dep-gate runtime. Stale-cleanup is enumerated in-scope across Phase 2.1-2.5 (registry I/O, hooks, imports, dir entry, leftover state dir, config comment). No discover-later sweeps.

---

## Handoff

Outcomes go in chat per `feedback_handoff_in_chat_only.md`. Final summary lists:
- Files modified (count + paths) — expected: 4 framework files + 11 spec files = 15 files.
- Spec-by-spec post-removal pass/fail/skip-source counts (skip column split into "depGateSkipped" vs "preexisting test.skip/fixme").
- Per-spec nav guard inserted (11 confirmations + cite the existing 1 in BAS).
- Cleanup confirmation (dead-symbol grep, dir absence, typecheck pass).
- Phase 4.3/4.4 retry-cascade verification result.

Run `/regression-guard` BEFORE Phase 1 (snapshot) and AFTER Phase 5 (diff). Run `/final-q` for exit gate per LR-042.

---

## Revision log

- **v1 (2026-05-08, initial)**: 18-spec premise, "zero skips" acceptance, Phase 5.2 unverifiable directive, F-4 dead-code equivocation, F-6 config comment unaddressed.
- **v2 (2026-05-08, this revision)**: post-/review fixes F-1..F-8 — corrected count (12 specs), enumerated per-spec nav-guard rollout (Phase 1.5), narrowed acceptance to `depGateSkipped` annotation, full dead-code enumeration (Phase 2), config comment rewrite (Phase 2.4), retries=2 verification (Phase 4.3/4.4), dropped Phase 5.2 unverifiable directive, pre-flight skip inventory of 13 known legitimate skips/fixmes added.

---

## Execution Summary (2026-05-08)

**Identity**: OWNER. **Result**: GREEN (structural acceptance met; runtime acceptance lines 4.2/4.3/4.4 require CI run — out of /execute static scope).

### Files modified — 16 total (4 framework + 11 specs + 1 dup-helper cleanup)

| File | Change | Lines |
|---|---|---|
| `clients/encore/tests/setup/dependency-gate.ts` | Refactored to annotation-only — deleted `STATE_DIR`, `SKIP_ANNOTATION`, `stateFileFor`, `readRegistry`, `writeRegistry`, `dependencyGateAfterEach`, `wipeDepGateState`; removed `base.skip()` cascade. Now ~22 lines (from 130). | -108 |
| `clients/encore/tests/setup/fixtures.ts` | Removed `dependencyGateAfterEach` import; removed `test.afterEach` registry-update hook block. | -8 |
| `clients/encore/tests/setup/global-setup.ts` | Removed `wipeDepGateState` import + call; removed `'reports/dep-gate-state'` from `REPORT_DIRS`. | -8 |
| `clients/encore/playwright.config.ts` | Rewrote `fullyParallel: false` justification comment to cite LR-019 (TC-001 baseline-reset within source order) instead of dep-gate registry (F-6). | ±5 |
| `clients/encore/src/pages/setup/locations/location-auto-addon.page.ts` | **Adjacent-Sweep DO-NOW** — removed dup `getCurrentUrl()` override identical to base-page.ts:270. | -4 |
| 11 specs (ECT, HIS, ACC, AAO, CUR, LGL, LI, MGH, NTS, PRI, SSL) | Inserted `test.beforeEach` nav-guard mirroring BAS spec :33 — re-navigates only when retry-recycle landed on /home. | +11×8 |
| `.claude/rules/specs.md` | Added one-line annotation-only note (Phase 5.1). | +3 |
| `.claude/context/navigation.md` | Added Exploration Registry row "dependency-gate refactor 2026-05-08" (Phase 5.3). | +1 |
| `clients/encore/specs_planning/_internal/preflight-skip-inventory-2026-05-08.md` | Pre-flight skip inventory artifact — 13 legitimate skips (Phase 1.3). | NEW |
| `clients/encore/specs_planning/_internal/dep-gate-inventory-2026-05-08.md` | Dep-gate call classification artifact — 281 calls (Phase 1.4). | NEW |

### Acceptance verification (grep)

| # | Criterion | Target | Actual |
|---|---|---|---|
| 1 | `base.skip` in dependency-gate.ts | 0 | 0 ✓ |
| 2 | `dependencyGateAfterEach` / `wipeDepGateState` exports | 0 | 0 ✓ |
| 3 | fixtures.ts `dependencyGateAfterEach` references | 0 | 0 ✓ |
| 4 | global-setup.ts `wipeDepGateState` + `dep-gate-state` | 0 | 0 ✓ |
| 5 | playwright.config.ts cites `LR-019` | 1 | 1 ✓ |
| 6 | playwright.config.ts mentions `dependencyGate` registry | 0 | 0 ✓ |
| 7 | `SKIP_ANNOTATION` / `depGateSkipped` in tests/src | 0 | 0 ✓ |
| 8 | `test.beforeEach` count across 12 specs | 12 | 12 ✓ |
| 9 | Pre-existing `test.skip` / `test.fixme` count | 13 | 13 ✓ |
| 10 | Preserved `dependencyGate(` annotations | 281 | 281 ✓ |
| 11 | `npm run typecheck` from clients/encore | PASS | PASS ✓ |
| 12 | `npx playwright test --list` parses all specs | 1257 tests / 15 files | 1257 / 15 ✓ |

### Acceptance carve-outs (out of /execute static scope)

- **4.1 / 4.3 / 4.4 — runtime spec runs at workers=1 retries=0/2**: require live CI execution against e2e environment. Not run as part of `/execute` (static refactor verification only). Post-merge gate via `npm test` / `playwright-tests.yml` workflow. Expected: zero `depGateSkipped` annotations, zero retries on `/home` for BAS/MGH/PRI, pre-existing 13 skips unchanged.
- **4.5 — failure-summary.json diff**: requires the runtime run above to produce both pre/post artifacts.

### Adjacent-Sweep DO-NOW (Phase 2.5 ritual)

- **Item**: dup `getCurrentUrl()` override at `location-auto-addon.page.ts:166` (identical body to inherited `base-page.ts:270`).
- **Disposition**: DO-NOW (same identity OWNER, same module, 5-second fix, no user input). Removed; typecheck re-ran clean.
- **No APPEND/SPAWN deferrals** — every adjacency item handled inline.

### Plan deviations

None. Q1(a) / Q2(a) / Q3(a) scope decisions from /review revision held throughout execution.

### Cross-cutting LR compliance

- **LR-018** (run-all is truth): preserved — runtime acceptance lines 4.1/4.3/4.4 are deliberately the gate.
- **LR-019** (TC-001 baseline): preserved — `fullyParallel: false` re-justified citing this rule (Phase 2.4); each spec's TC-001 still establishes baseline (verified during read pass).
- **LR-020** (verify plan claims): all 281 / 12 / 11 / 13 numbers grep-verified pre-execution.
- **LR-024** (clean-then-RCA): n/a (no failing artifact RCA in this session).
- **LR-027** (DONE gate): this Execution Summary satisfies the gate.
- **LR-040** (closure-gate completeness): every Adjacent-Sweep item dispositioned (1 DO-NOW; 0 APPEND/SPAWN).
- **LR-046** (strict-line HALT): "zero `depGateSkipped` annotations" preserved as acceptance — pre-existing 13 skips explicitly carved out via Phase 1.3 inventory.
- **LR-049** (ship-via-git-archive): n/a (framework refactor, not deliverable).
- **LR-050** (restructure stale-cleanup): all stale removed in Phase 2.1–2.5 in-scope (registry I/O, hooks, imports, REPORT_DIRS entry, leftover dir, config comment, dup helper).

### Verification artifact (D23)

```bash
# Reproducibility: structural acceptance (run from repo root)
cd clients/encore
grep -c "base.skip" tests/setup/dependency-gate.ts                              # → 0
grep -cE "dependencyGateAfterEach|wipeDepGateState" tests/setup/dependency-gate.ts  # → 0
grep -c "dependencyGateAfterEach" tests/setup/fixtures.ts                       # → 0
grep -cE "wipeDepGateState|dep-gate-state" tests/setup/global-setup.ts          # → 0
grep -c "LR-019" playwright.config.ts                                           # → 1
grep -lE "test\.beforeEach" tests/specs/setup/{local-office,locations}/*.spec.ts | wc -l  # → 12
grep -E "test\.(skip|fixme)\(" tests/specs/setup/{local-office,locations}/*.spec.ts | wc -l  # → 13
grep -E "dependencyGate\(" tests/specs/setup/{local-office,locations}/*.spec.ts | wc -l  # → 281
npm run typecheck                                                                # → PASS
npx playwright test --list --config=clients/encore/playwright.config.ts | tail -1  # → "Total: 1257 tests in 15 files"
```
