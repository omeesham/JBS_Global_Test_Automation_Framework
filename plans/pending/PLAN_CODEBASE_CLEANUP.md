# PLAN: Codebase Cleanup — Audit-Corrected Version

**Original**: PLAN_CODEBASE_CLEANUP (2026-03-24)
**This version**: Audit-corrected 2026-03-26
**Status**: pending
**Priority**: P2-CYCLE-3
**Scope**: Full repo — src/, scripts/, website/, tests/

---

## Context

Months of vibe coding accumulated orphaned files, dead exports, and unused components. This is the audit-corrected version of PLAN_CODEBASE_CLEANUP with all errors fixed, B2 removed (already done), counts corrected, and executor safety notes added.

---

## PART A: DEAD CODE REMOVAL (grep-verified, zero risk)

### A1 — Delete orphaned files (8 files, ~1,150 lines)

> **EXECUTOR NOTE**: Files #1, #2, #4 have `@agent-doc USED-BY:` headers claiming they're used by Healer/Audit/Generator agents. These headers are **aspirational documentation, not reality** — zero actual `import`/`require` statements exist anywhere in the codebase. Verified via triple-grep. Safe to delete.

| # | File | Lines | Evidence |
|---|------|-------|----------|
| 1 | `src/utils/dom-diff.ts` | ~230 | 8 exports, 0 consumers. @agent-doc header is aspirational — no runtime import exists |
| 2 | `src/utils/selector-registry-validator.ts` | ~210 | 9 exports, 0 consumers. @agent-doc header is aspirational — no runtime import exists |
| 3 | `src/worker/progress-extractor.ts` | ~100 | 2 exports, 0 consumers anywhere |
| 4 | `src/utils/bug-hunt-classifier.ts` | ~260 | 0 production callers; only consumer is its own unit test. @agent-doc header is aspirational |
| 5 | `tests/unit/bug-hunt-classifier.test.ts` | ~120 | Tests for dead code (#4) — entire file can be deleted |
| 6 | `website/frontend/src/components/dashboard/TestIdChangePanel.tsx` | ~80 | 0 imports in any .tsx file |
| 7 | `website/frontend/src/services/testIdApi.ts` | ~60 | Only consumer was #6 (dead). Both orphaned together |
| 8 | `website/frontend/src/components/pipeline/EscalationBanner.tsx` | ~90 | 0 imports in any .tsx file. **KEEP** `escalationApi.ts` — alive, used by ChatTriageCard |

### A2 — Surgical removal in live files

| # | File | What to remove | Evidence |
|---|------|----------------|----------|
| 9 | `src/core/ui-common.ts` | Gut all 4 methods, keep deprecated class shell (barrel export at `src/index.ts:29` still references it) | grep `UiCommon` → exported but 0 actual call sites in entire repo |
| 10 | `src/core/base-page.ts` | Remove `getSelectorFromTs()` method only | **Zero callers** across entire codebase. Note: NOT a duplicate of `getLocator()` (different error contracts — getLocator throws, getSelectorFromTs returns null), but it has zero consumers so safe to remove regardless |
| 11 | `src/utils/agent-notification-writer.ts` | Remove 4 dead functions: `writeNotification`, `readPendingNotifications`, `ackNotification`, `ackAllNotifications`. **KEEP `notifyStaleArtifacts`** | Only `notifyStaleArtifacts()` is alive via `healer-post-complete.ts` |
| 12 | `tests/unit/agent-notification-writer.test.ts` | Remove test `describe` blocks for the 4 deleted functions (lines 30-118). **KEEP the `notifyStaleArtifacts` describe block (lines 120-135)** and file-level setup (lines 1-28) | Tests for dead functions = dead tests. The notifyStaleArtifacts tests must stay — they cover a live production function |
| 13 | `src/selectors/locations/account-address.ts` | Remove `btnAccMasterAddress: 'SCOPED_IN_PAGE_OBJECT'` (line 41) | Literal placeholder string; page object constructs selector inline. Zero consumers of this key |

---

## PART B: SAFE CONSOLIDATION (verified duplications, low risk)

### ~~B2 — DELETED (already done)~~

> The 3 barrel exports (LocationLegalPage, LocalOfficeSettingsPage, LocationSharedSetupLocationsPage) **already exist** in `src/pages/index.ts` at lines 23, 24, 26. Added during the `locations/` → `setup/locations/` refactor. No action needed.

### B1 — Remove unnecessary `as any` status casts (4 casts)

`PipelineRunStatus` at `src/orchestrator/types.ts:68` ALREADY includes `'completed' | 'awaiting_triage' | 'awaiting_approval'`. These 4 casts are pointless:

| File | Line | Change |
|------|------|--------|
| `src/orchestrator/orchestrator.ts` | 427 | `'completed' as any` → `'completed'` |
| `src/orchestrator/orchestrator.ts` | 434 | `'awaiting_triage' as any` → `'awaiting_triage'` |
| `src/orchestrator/orchestrator.ts` | 494 | `'awaiting_approval' as any` → `'awaiting_approval'` |
| `src/server/routes/pipeline.ts` | 337 | `'completed' as any` → `'completed'` |

**DO NOT touch** these other `as any` casts (different context, different types):
- `orchestrator.ts:401` — `definition as any` (StageDefinition extension)
- `orchestrator.ts:405` — `triageReport as any` (dynamic triage shape)
- Any casts in sdk-executor, s3Adapter, progress-extractor

### B3 — SELECTOR_PREFIXES deduplication (3 copies → 1 shared source)

**Current state** (verified):
- `src/utils/agent-reporter.ts:100` — 13 prefixes (CORE)
- `src/utils/diagnostics-collector.ts:26` — 13 prefixes (identical to above)
- `scripts/generator-validate-selectors.ts:18` — **23 prefixes** (CORE 13 + 10 extras: `lbl`, `bar`, `cell`, `opt`, `row`, `dtp`, `nav`, `mod`, `ico`, `div`)

**The generator array is intentionally larger** — it validates ALL possible selector prefixes from the catalog, not just commonly-reported ones.

**Action**: Create `src/utils/selector-prefixes.ts` with TWO exports:
```typescript
/** Core prefixes used for error classification and diagnostics (13) */
export const CORE_SELECTOR_PREFIXES = ['btn', 'txt', 'drp', 'chk', 'lnk', 'rdo', 'dlg', 'tbl', 'err', 'col', 'spin', 'tab', 'pnl'] as const;

/** Extended prefixes for comprehensive validation — includes all catalog entries (23) */
export const EXTENDED_SELECTOR_PREFIXES = [...CORE_SELECTOR_PREFIXES, 'lbl', 'bar', 'cell', 'opt', 'row', 'dtp', 'nav', 'mod', 'ico', 'div'] as const;
```

Update consumers:
- `agent-reporter.ts` → import `CORE_SELECTOR_PREFIXES`
- `diagnostics-collector.ts` → import `CORE_SELECTOR_PREFIXES`
- `generator-validate-selectors.ts` → import `EXTENDED_SELECTOR_PREFIXES`

### B4 — Move CheckboxState/SpinState interfaces (code smell cleanup)

> **Context**: `base-page.ts:15` imports `CheckboxState` from `location-form-helpers.page.ts`, which extends `BasePage`. This compiles fine (interface is erased at compile time) but is a **code smell** — a base class shouldn't import from a subclass. NOT a runtime circular dependency.

Move `CheckboxState` + `SpinState` interfaces to `src/framework-contracts/index.ts`. Update imports in:
- `src/core/base-page.ts` line 15 — change import source
- `src/pages/locations/location-form-helpers.page.ts` — remove definitions, add re-export for backward compat
- 5 other page objects that import CheckboxState

### B5 — Extract `safeLoadJson` utility (22 files, 53 calls use raw JSON.parse)

Create `scripts/utils/safe-load-json.ts` with `safeLoadJson<T>()` + `loadQueueItemOrDie<T>()`. Replace in sub-batches of 5 files at a time across 22 script files.

**File count verified**: 22 files, 53 total `JSON.parse` calls in `scripts/`.

---

## PART C: COSMETIC CLEANUP

| # | File | What | Evidence |
|---|------|------|----------|
| C1 | `src/selectors/dynamic.ts` lines 41-43 | Remove deprecated Shadow DOM / Auto Add-On comment block (3 lines before closing `} as const;`) | File itself says "DEPRECATED — kept only for reference". The actual auto-addon selectors live in `src/selectors/locations/auto-addon.ts` |
| C2 | `src/pages/components/` | Delete empty directory | Orphaned from restructuring |
| C3 | `src/selectors/shared/` | Delete empty directory | Orphaned from restructuring |

---

## FALSE POSITIVES — DO NOT TOUCH

These were flagged by PLAN_FRAMEWORK_CLEANUP but verified as ALIVE or INCORRECT. **Re-verified by independent audit 2026-03-26:**

| Original Claim | Verdict | Evidence |
|---|---|---|
| 5.3: `buildDryRunPrompt()` never defined (P0) | **FALSE** | Defined at orchestrator.ts:577, called at pipeline.ts:116 |
| 5.4: Auth bypass via query param (P0) | **FALSE** | Requires BOTH `role=admin` AND `secret=WORKER_SECRET` (events.ts:52-58) |
| 5.5: Convergence guards disabled (P0) | **FALSE** | Guards fully implemented at orchestrator.ts:177-250, enforced at L299 |
| 2.3: Custom matchers dead (P2) | **FALSE** | Wired via `import './custom-matchers'` in fixtures.ts:13, declared in framework-contracts |
| 2.4: global-teardown.ts dead (P3) | **FALSE** | Referenced in playwright.config.ts:201 |
| 8.3: Silent catch blocks (P2) | **FALSE** | All have documented fallbacks or state assignments |
| 3.1: Status union missing 'completed' (P1) | **FALSE** | `PipelineRunStatus` at types.ts:68 includes it. Casts are unnecessary, not type-unsafe |
| 4.4: God object 700 lines (P1) | **FALSE** | Actually 455 lines, well-organized |
| 4.5: God script 800 lines (P1) | **FALSE** | 766 lines, focused validation orchestrator |
| 6.1: .fill() on Angular forms (P1) | **FALSE** | Calls are on plain HTML inputs, not Angular form controls |
| 1.1: classifyFailure() "3 identical copies" (P1) | **MISLEADING** | 3 different signatures serving different purposes |
| 1.6: Save dialog "dead copies" (P1) | **RISKY** | auto-addon.ts has DIFFERENT selectors (btnSaveChangesOk, Stay/Discard buttons). Do NOT merge |

---

## Execution Order

1. **Part A1** — Delete 8 orphaned files (zero risk, biggest line reduction)
2. **Part A2** — Surgical removals in live files (low risk, targeted)
3. **Part C** — Comment + empty directory cleanup (cosmetic)
4. **Part B1** — Remove pointless `as any` status casts (low risk, 4 changes)
5. **Part B3** — SELECTOR_PREFIXES dedup with dual-tier export (medium risk, 4 files)
6. **Part B4** — CheckboxState code smell cleanup (medium risk, 7 files)
7. **Part B5** — Extract safeLoadJson (higher risk, 22 files, sub-batched)

> B2 removed from execution — already done.

## Verification After Each Step

```bash
npx tsc --noEmit                    # Full typecheck
npx playwright test --list          # All test files discoverable
npm run build                       # Dist compiles clean
```

After full execution:
```bash
grep -rn "dom-diff\|selector-registry-validator\|progress-extractor\|bug-hunt-classifier\|TestIdChangePanel\|testIdApi\|EscalationBanner\|getSelectorFromTs\|btnAccMasterAddress" src/ tests/ website/ scripts/ --include="*.ts" --include="*.tsx"
# Should return 0 hits (except notifyStaleArtifacts which is kept)
```

---

## Audit Trail

| Audit | Findings | Disposition |
|-------|----------|-------------|
| External (Copilot) 2026-03-26 | 8 findings | 3 correct (B2 invalid, B3 mismatch, @agent-doc confusion), 3 wrong (misread A2.12, wrong file count, overstated rationale issue), 2 partial |
| Independent (Opus) 2026-03-26 | 5 fixes needed | All incorporated into this version. B2 deleted, B3 count fixed, B4 reframed, A2.10/12 clarified, @agent-doc notes added |
