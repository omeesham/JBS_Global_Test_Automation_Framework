# PLAN: Codebase Cleanup — Verified Dead Code + Safe Consolidation

**ID**: PLAN_CODEBASE_CLEANUP
**Created**: 2026-03-24
**Status**: pending
**Priority**: HIGH
**Scope**: Full repo — src/, scripts/, website/, tests/, config/
**Replaces**: PLAN_FRAMEWORK_CLEANUP (88 items, many false positives) + PLAN_DEAD_CODE_AUDIT (verified subset)

---

## Context

Months of vibe coding accumulated orphaned files, dead exports, and unused components. The original PLAN_FRAMEWORK_CLEANUP identified 88 issues but contained **11 false positives** that would have broken working code. This merged plan contains ONLY items verified through triple-grep passes with false positives eliminated.

---

## PART A: DEAD CODE REMOVAL (grep-verified, zero risk)

### A1 — Delete orphaned files (8 files, ~1,150 lines)

| # | File | Lines | Evidence |
|---|------|-------|----------|
| 1 | `src/utils/dom-diff.ts` | ~230 | 8 exports, 0 consumers anywhere |
| 2 | `src/utils/selector-registry-validator.ts` | ~210 | 9 exports, 0 consumers anywhere |
| 3 | `src/worker/progress-extractor.ts` | ~100 | 2 exports, 0 consumers anywhere |
| 4 | `src/utils/bug-hunt-classifier.ts` | ~260 | 0 production callers; only consumer is its own unit test |
| 5 | `tests/unit/bug-hunt-classifier.test.ts` | ~120 | Tests for dead code (#4) |
| 6 | `website/frontend/src/components/dashboard/TestIdChangePanel.tsx` | ~80 | 0 imports in any .tsx file |
| 7 | `website/frontend/src/services/testIdApi.ts` | ~60 | Only consumer was #6 (dead) |
| 8 | `website/frontend/src/components/pipeline/EscalationBanner.tsx` | ~90 | 0 imports in any .tsx file. Keep escalationApi.ts (alive, used by ChatTriageCard) |

### A2 — Surgical removal in live files

| # | File | What to remove | Evidence |
|---|------|----------------|----------|
| 9 | `src/common/ui-common.ts` | Gut all 4 methods, keep deprecated class shell (external barrel consumers) | grep `UiCommon` → 0 callers in entire repo |
| 10 | `src/common/base-page.ts` | Remove `getSelectorFromTs()` (L41-48) | grep → only the definition; `getLocator()` at L32 does same with error handling |
| 11 | `src/utils/agent-notification-writer.ts` | Remove 4 dead functions: `writeNotification`, `readPendingNotifications`, `ackNotification`, `ackAllNotifications`. Keep `notifyStaleArtifacts` | Only `notifyStaleArtifacts()` alive via healer-post-complete.ts:154 |
| 12 | `tests/unit/agent-notification-writer.test.ts` | Remove test cases for the 4 deleted functions | Tests for dead code = dead tests |
| 13 | `src/selectors/locations/account-address.ts` | Remove `btnAccMasterAddress: 'SCOPED_IN_PAGE_OBJECT'` | Literal placeholder; page object at L254 constructs selector inline |

---

## PART B: SAFE CONSOLIDATION (verified duplications, low risk)

### B1 — Remove unnecessary `as any` casts (4 casts)

`PipelineRunStatus` at `src/orchestrator/types.ts:68` ALREADY includes `'completed' | 'awaiting_triage' | 'awaiting_approval'`. These casts are pointless.

| File | Line | Change |
|------|------|--------|
| `src/orchestrator/orchestrator.ts` | ~427 | `'completed' as any` → `'completed'` |
| `src/orchestrator/orchestrator.ts` | ~434 | `'awaiting_triage' as any` → `'awaiting_triage'` |
| `src/orchestrator/orchestrator.ts` | ~494 | `'awaiting_approval' as any` → `'awaiting_approval'` |
| `src/server/routes/pipeline.ts` | ~337 | `'completed' as any` → `'completed'` |

**DO NOT touch** other `as any` casts (sdk-executor, s3Adapter, progress-extractor — different context).

### B2 — Add 3 missing barrel exports (additive only)

Add to `src/pages/index.ts`:
- `export { LocationLegalPage } from './locations/location-legal.page';`
- `export { LocationLocalOfficeSettingsPage } from './locations/location-local-office-settings.page';`
- `export { LocationSharedSetupLocationsPage } from './locations/location-shared-setup-locations.page';`

Do NOT add abstract classes (LocationFormHelpers, LocationTestOrchestrators) — intentionally private.

### B3 — SELECTOR_PREFIXES deduplication (3 copies → 1)

Create `src/utils/selector-prefixes.ts` with base (13) + extended (22) arrays. Update:
- `src/utils/agent-reporter.ts` ~L100
- `src/utils/diagnostics-collector.ts` ~L26
- `scripts/generator-validate-selectors.ts` ~L18

### B4 — Fix CheckboxState circular dependency

Move `CheckboxState` + `SpinState` interfaces to `src/framework-contracts/index.ts`. Update imports in:
- `src/common/base-page.ts` L15
- `src/pages/locations/location-form-helpers.page.ts` (remove definitions, add re-export)
- 5 other page objects that import CheckboxState

### B5 — Extract `safeLoadJson` utility (22 files use raw JSON.parse)

Create `scripts/utils/safe-load-json.ts` with `safeLoadJson<T>()` + `loadQueueItemOrDie<T>()`. Replace in sub-batches of 5 files at a time across 22 scripts.

---

## PART C: DEPRECATED COMMENT CLEANUP (cosmetic)

| # | File | What | Evidence |
|---|------|------|----------|
| C1 | `src/selectors/dynamic.ts` ~L41-43 | Remove deprecated Shadow DOM comment block | File itself says "DEPRECATED — kept only for reference" |

---

## FALSE POSITIVES — DO NOT TOUCH

These were flagged by PLAN_FRAMEWORK_CLEANUP but verified as ALIVE or INCORRECT:

| Original Claim | Verdict | Evidence |
|---|---|---|
| 5.3: `buildDryRunPrompt()` never defined (P0) | **FALSE** | Defined at orchestrator.ts:577, called at pipeline.ts:116 |
| 5.4: Auth bypass via query param (P0) | **FALSE** | Requires BOTH `role=admin` AND `secret=WORKER_SECRET` |
| 5.5: Convergence guards disabled (P0) | **FALSE** | Guards fully implemented at orchestrator.ts:177-250, enforced at L299 |
| 2.3: Custom matchers dead (P2) | **FALSE** | Wired via `expect.extend()` in fixtures.ts, declared in framework-contracts |
| 2.4: global-teardown.ts dead (P3) | **FALSE** | Referenced in playwright.config.ts:194 |
| 8.3: Silent catch blocks (P2) | **FALSE** | All have documented fallbacks or state assignments |
| 3.1: Status union missing 'completed' (P1) | **FALSE** | `PipelineRunStatus` at types.ts:68 includes it. Casts are unnecessary, not type-unsafe |
| 4.4: God object 700 lines (P1) | **FALSE** | Actually 455 lines, well-organized with comment headers |
| 4.5: God script 800 lines (P1) | **FALSE** | 766 lines, focused validation orchestrator with distinct gate functions |
| 6.1: .fill() on Angular forms (P1) | **FALSE** | Calls are on plain HTML inputs, not Angular form controls |
| 1.1: classifyFailure() "3 identical copies" (P1) | **MISLEADING** | 3 different signatures serving different purposes; B and C overlap but A is distinct |
| 1.6: Save dialog "dead copies" (P1) | **RISKY** | auto-addon.ts has DIFFERENT selectors (h2 check, 'Ok' button); notes.ts has generic version that OVERWRITES shared.ts in merged object |

---

## Execution Order

1. **Part A1** — Delete 8 orphaned files (zero risk, biggest line reduction)
2. **Part A2** — Surgical removals in live files (low risk, targeted)
3. **Part C** — Comment cleanup (cosmetic)
4. **Part B1** — Remove pointless `as any` casts (low risk)
5. **Part B2** — Add barrel exports (additive, zero risk)
6. **Part B3** — SELECTOR_PREFIXES dedup (medium risk, 3 files)
7. **Part B4** — CheckboxState circular dep fix (medium risk, 7 files)
8. **Part B5** — Extract safeLoadJson (higher risk, 22 files, sub-batched)

## Verification After Each Step

```bash
npx tsc --noEmit                    # Full typecheck
npx playwright test --list          # All test files discoverable
npm run build                       # Dist compiles clean
```

After full execution:
```bash
grep -rn "dom-diff\|selector-registry-validator\|progress-extractor\|bug-hunt-classifier\|TestIdChangePanel\|testIdApi\|EscalationBanner\|getSelectorFromTs\|btnAccMasterAddress" src/ tests/ website/ scripts/ --include="*.ts" --include="*.tsx"
# Should return 0 hits
```
