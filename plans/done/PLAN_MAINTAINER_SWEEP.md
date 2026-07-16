# PLAN: Framework Maintainer Sweep — Selector Collision Architecture Fix

**ID**: PLAN_MAINTAINER_SWEEP
**Created**: 2026-03-24
**Updated**: 2026-03-27 (post-audit — corrected for P0 Decontamination f721e15)
**Status**: SUPERSEDED
**Superseded by**: plans/pending/PLAN_LOSSLESS_DEEP_TRIM.md (2026-06-12 deep-trim disposition; per-item table in SUBPLAN_TRIM_02 Execution Summary). NOTE: the 2026-05-25 appended items SP-MNT-FCC-01/02 (LR-040 §b recipients for PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE) are still-valid — see SUBPLAN_TRIM_02 Next-batch ledger + handoff flag.
**Priority**: P2-CYCLE-3

---

## Context

Originally targeted 7 silent selector collisions + 4 refactoring tasks. P0 Decontamination (commit f721e15, 2026-03-25, 98 files) solved the collision problem architecturally — rendering SP-01, SP-02, SP-04, and most of SP-09 obsolete. This updated plan contains ONLY the 3 remaining items.

---

## Completed Items (shipped in f721e15 — DO NOT RE-EXECUTE)

| Subplan | What | Evidence |
|---------|------|----------|
| SP-01 | Collision detection — `buildAllSelectors()` in `src/selectors/index.ts:67-76` | Runtime throw on key collision. LOS deliberately excluded (lines 79-82). Separate `_LOS_COLLISION_CHECK` (lines 99-102). |
| SP-02 | All 7 collisions resolved (rename + architectural exclusion) | `notes.ts` dialog keys removed (lines 62-65 comment). auto-addon keys prefixed. LOS keys prefixed. |
| SP-04 | Barrel exports — all 11 page objects in `src/pages/index.ts:16-26` | All 9 Setup pages + LoginPage + HomePage exported. |
| SP-09 (LR-017) | Added to CLAUDE.md Learned Rules | Spread-based merging silent overwrite rule. |
| SP-07/08 | Deferred by design | No action needed. |

---

## Remaining Item 1: SP-05 — waitForNetworkIdle Extraction (P2)

### Problem
`page.waitForLoadState('networkidle', { timeout: N }).catch(() => {})` duplicated **25 times** across **9 files** (including 3 in BasePage itself).

### Exact Enumeration (grep-verified 2026-03-27)

| File | Count | Timeout Values | Lines |
|------|-------|----------------|-------|
| `src/pages/base.page.ts` | 3 | 15k, 15k, 10k | 348, 386, 393 |
| `src/core/ui-common.ts` | 1 | none (Playwright default 30s) | 112 |
| `src/pages/local-office/local-office-settings.page.ts` | 6 | 10k×2, 15k×4 | 49, 59, 71, 81, 131, 136 |
| `src/pages/locations/location-auto-addon.page.ts` | 3 | 15k×2, 10k×1 | 20, 72, 150 |
| `src/pages/locations/location-test-orchestrators.page.ts` | 4 | 15k×4 (note: `15000` not `15_000`) | 47, 52, 57, 76 |
| `src/pages/locations/location-currency.page.ts` | 5 | 5k×4, 15k×1 | 117, 137, 152, 167, 231 |
| `src/pages/locations/location-notes.page.ts` | 1 | 10k | 333 |
| `src/pages/locations/location-shared-setup-locations.page.ts` | 1 | 15k | 43 |
| `src/pages/locations/location-pricing.page.ts` | 1 | 10k | 61 |

### Implementation

**Add to `src/pages/base.page.ts`** (after `navigateToSubTab`, ~line 397):
```typescript
/**
 * Wait for network to reach idle state with a timeout.
 * Warns on timeout instead of failing — network idle is a best-effort signal.
 * MNT-003: Extracted from 25 inline occurrences across 9 files.
 */
protected async waitForNetworkIdle(timeout = 15_000): Promise<void> {
  await this.page.waitForLoadState('networkidle', { timeout }).catch(() => {
    Log.warn(`Network did not reach idle within ${timeout}ms`);
  });
}
```

**Replace 24 occurrences in BasePage + page objects** — preserve each call's original timeout:
- Calls with 15_000 (default) → `await this.waitForNetworkIdle();`
- Calls with 10_000 → `await this.waitForNetworkIdle(10_000);`
- Calls with 5_000 → `await this.waitForNetworkIdle(5_000);`

**SKIP `src/core/ui-common.ts:112`** — `UICommon` is a static utility class, not a BasePage subclass. Its no-timeout call uses Playwright's default 30s. Leave as-is.

### Verification
```bash
grep -rn "waitForLoadState.*networkidle" src/
# Expected: ONLY ui-common.ts:112 + base-page.ts method definition
npx tsc --noEmit
```

**Risk**: LOW — mechanical find-replace. Each timeout preserved. TypeScript catches type errors.

---

## Remaining Item 2: SP-06 — CheckboxState → framework-contracts (P2)

### Problem
Circular import: `src/pages/base.page.ts:15` imports `CheckboxState` from `../pages/setup/locations/location-form-helpers.page` — a page object that extends BasePage via its own inheritance chain. Works only because TypeScript resolves at type level, but architecturally wrong and fragile.

### Files Importing CheckboxState Today

| File | Current Import Path |
|------|-------------------|
| `src/pages/base.page.ts:15` | `../pages/setup/locations/location-form-helpers.page` **(CIRCULAR)** |
| `src/pages/locations/location-auto-addon.page.ts:5` | `./location-form-helpers.page` |
| `src/pages/locations/location-currency.page.ts:24` | `./location-form-helpers.page` |
| `src/pages/locations/location-local-info.page.ts:21` | `./location-form-helpers.page` (also SpinState) |
| `src/pages/locations/location-pricing.page.ts:24` | `./location-form-helpers.page` |
| `src/pages/locations/location-shared-setup-locations.page.ts:23` | `./location-form-helpers.page` |
| `src/pages/local-office/local-office-settings.page.ts:17` | `../locations/location-form-helpers.page` |

### Implementation

**1. Create `src/framework-contracts/types.ts`:**
```typescript
/** Checkbox state snapshot (Radix UI checkboxes use aria-checked, not native checked) */
export interface CheckboxState {
  checked: boolean;
  disabled: boolean;
}

/** Spinbutton value + enabled state */
export interface SpinState {
  value: string;
  disabled: boolean;
}
```

**2. Update `src/framework-contracts/index.ts`** — add:
```typescript
export { CheckboxState, SpinState } from './types';
```

**3. Update `src/pages/base.page.ts:15`:**
```typescript
// FROM: import { CheckboxState } from '../pages/setup/locations/location-form-helpers.page';
// TO:
import { CheckboxState } from '../framework-contracts';
```

**4. Update `src/pages/locations/location-form-helpers.page.ts`** — remove local interface definitions (lines 18-28), add import + re-export:
```typescript
import { CheckboxState, SpinState } from '../../../framework-contracts';
// Keep re-export so downstream files don't break:
export type { CheckboxState, SpinState };
```

**5. Update `src/pages/local-office/local-office-settings.page.ts:17`:**
```typescript
// FROM: import { CheckboxState } from '../locations/location-form-helpers.page';
// TO:
import { CheckboxState } from '../../../framework-contracts';
```

### Verification
```bash
npx tsc --noEmit
grep -rn "from.*location-form-helpers" src/core/  # → 0 matches (circular import gone)
```

**Risk**: LOW — TypeScript catches all import breakage. Re-export preserves downstream compatibility.

---

## Remaining Item 3: SP-09 (partial) — MNT-013 + MNT-014

### Problem
Two learned rules from the original plan were never written to `specs_planning/_internal/agent-mistakes.md`.

### Implementation

**Append after MNT-012 row (line 230 of agent-mistakes.md):**

```
| MNT-013 | Within-partition collision detection: `buildAllSelectors()` in `src/selectors/index.ts` throws at import time if any key collides across selector partitions. Resolution: (a) use shared.ts by deleting duplicate, or (b) use page-specific prefix (e.g., `btnSaveAutoAddon`). **Trigger**: Any selector key addition to partition files | 7 silent collisions discovered 2026-03-24; fixed by partition-aware merge + decontamination (f721e15) |
| MNT-014 | Never define dialog selectors as bare `[role="alertdialog"]`. Always scope with `:has(h2:text-is(...))` or `:has-text(...)`. Unscoped selectors match ANY dialog on page | Notes.ts had bare `[role="alertdialog"]` — matched wrong dialog when multiple were open. Fixed: duplicate removed, canonical scoped version in shared.ts |
```

**NOTE**: PLAN_18_FRAMEWORK_CLEANUP proposed MNT-013/014 with different definitions (orphan detection / empty export sweep). Those were never written. These definitions are more actionable — they document actual bugs. If PLAN_18 definitions are still needed later, use MNT-015/016.

### Verification
Visual review: MNT-013/014 appear correctly in the Framework Maintainer table.

**Risk**: NONE — documentation only.

---

## Execution Order

| Step | What | Commit Message |
|------|------|---------------|
| 1 | SP-05: Extract waitForNetworkIdle | `refactor: extract waitForNetworkIdle to BasePage (25 inline calls across 9 files)` |
| 2 | SP-06: Move CheckboxState/SpinState | `refactor: move CheckboxState/SpinState to framework-contracts (fix circular import)` |
| 3 | SP-09: Write MNT-013 + MNT-014 | `docs: add MNT-013 (collision detection) and MNT-014 (scoped dialog selectors)` |
| 4 | Close plan | Move this file → `plans/done/`, add completion note |

---

## Post-Execution Verification

```bash
# 1. Clean compile
npx tsc --noEmit

# 2. waitForNetworkIdle extraction complete
grep -rn "waitForLoadState.*networkidle" src/
# Expected: ONLY ui-common.ts:112 + base-page.ts method def

# 3. Circular import eliminated
grep -rn "from.*location-form-helpers" src/core/
# Expected: 0 matches

# 4. Collision detection still works
node -e "require('./src/selectors')"
# Expected: no throw
```

---

## Concurrent Work Safety

| Other Plan | Overlap | Status |
|-----------|---------|--------|
| PLAN_CODEBASE_CLEANUP B4 (CheckboxState) | `src/framework-contracts/`, `base-page.ts` | SP-06 is **prerequisite** for B4. Run SP-06 first. |
| PLAN_CODEBASE_CLEANUP A2.10 (`getSelectorFromTs`) | `src/pages/base.page.ts` | No overlap — different methods. |
| PLAN_CODEBASE_CLEANUP B3 (SELECTOR_PREFIXES) | No overlap | Safe. |

---

## Risk Assessment

| Step | Risk | Mitigation |
|------|------|------------|
| SP-05 | LOW | Mechanical find-replace. 3 distinct timeout values (5k, 10k, 15k) preserved per-call. TypeScript catches type errors. |
| SP-06 | LOW | TypeScript catches import breakage. Re-export preserves downstream compatibility. |
| SP-09 | NONE | Documentation only. |

---

## Appended 2026-05-25 — FCC structural cure follow-ups (Phase 2.5 Adjacent-Sweep from PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE)

These two items were declared out-of-scope by `plans/pending/PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE.md` §9 and are appended here as **named-recipient line items per LR-040 §b** so the parent plan's closure passes the phantom-handoff check.

### SP-MNT-FCC-01: Patch or formally decommission `scripts/sync-agent-mistakes.ts`

**Trigger**: post-2026-04-27 Copilot eviction, `sync-agent-mistakes.ts` is no-op for `.claude/agents/*` (AGENT_CONDENSED + AGENT_COMPACT_FORMAT envelopes are empty for these paths). PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE (2026-05-25) dropped the SYNC-ONLY framing from SKILL.md / AGENT_SHARED_RULES.md prose to acknowledge this reality; the script itself remains on disk untouched.

**Two paths**:
- **(a)** Patch the script to write to `.claude/agents/*.md` (preserve auto-graduation workflow but redirect to new paths). Requires re-introducing the AGENT_CONDENSED + AGENT_COMPACT_FORMAT envelope builders for the new path scheme.
- **(b)** Formally decommission the script (mark deprecated, remove from any pipeline triggers, document the manual OWNER graduation path as canonical).

**Decision criterion**: do agents ever need automated rule-graduation from `agent-mistakes.md` rows to the agent file's HARD STOPS / scope clauses, or is manual OWNER editing sufficient? If never automated → (b). If yes/occasionally → (a).

**Verification**: `grep -rn "sync:mistakes\|sync-agent-mistakes" .claude/ docs/ scripts/ package.json` → either zero hits (decommissioned) or hits only in patched-paths context (no `.github/agents/` references).

### SP-MNT-FCC-02: Add `--module=<module>` flag to `scripts/check-tc-parity.ts`

**Trigger**: pre-commit Gate A (added 2026-05-25 via PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE, enforces ALL-071) currently runs full-repo `check:tc-parity` whenever any spec is staged. Runtime ~10-30s — acceptable but could be ~2-5s with module-scoped check.

**Implementation**: add `--module=<id>` arg parsing; restrict scan to `clients/${ACTIVE_CLIENT}/tests/<module>/`, `test-cases/<module>_test_cases.md`, `test-plans/<module>.md`, and the `<module>` sheet of `test_cases_xlsx/encore_test_cases.xlsx` (the per-module CSVs were retired in PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase D). Default (no flag) preserves full-repo behavior.

**Pre-commit gate enhancement (downstream)**: once `--module` exists, pre-commit Gate A could parse staged spec paths via `git diff --cached --name-only`, derive the module from `clients/<client>/specs/<module>/`, and pass `--module=<derived>` for faster CI. Optional follow-up after this SP lands.

**Verification**: `npm run check:tc-parity -- --module=notes` returns same-or-narrower findings vs full-repo run; `npm run check:tc-parity` (no flag) preserves current behavior.
