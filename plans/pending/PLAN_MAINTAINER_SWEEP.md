# PLAN: Framework Maintainer Sweep — Selector Collision Architecture Fix

**ID**: PLAN_MAINTAINER_SWEEP
**Created**: 2026-03-24
**Status**: pending
**Priority**: CRITICAL (3 P0 cross-page collisions + 4 P1 dialog collisions)
**Branch**: `fix/selector-collision-architecture`
**Atomic Commit**: SP-01 + SP-02 ship as ONE commit. No intermediate broken state.
**Overlaps**: PLAN_CODEBASE_CLEANUP (FALSE POSITIVE 1.6 — marked DO-NOT-TOUCH; B3, B4)

---

## Context

The selector barrel export (`src/selectors/index.ts`) merges 11 partition files via object spread into `SetupSelectors`. The collision detection function `buildAllSelectors()` only checks Login vs Setup — **not within Setup partitions**. Object spread silently overwrites duplicate keys with the last definition. TypeScript cannot detect this at compile time (confirmed: microsoft/TypeScript#29239).

A full exhaustive audit of all ~281 selector keys across 12 partition files found **7 colliding keys**, 3 of which are **P0 CRITICAL** because the winning value targets a completely wrong page/element.

### Self-Audit Trail

This plan was subjected to two rounds of adversarial review. Corrections applied:
- V1: 4 critical defects, 9 high-risk gaps, 8 ambiguity bombs → full rewrite
- V2: 7 discrepancies found via code verification → corrections below
- V3 (this version): All claims grep-verified, counts corrected, cross-references fixed

---

## COMPLETE COLLISION INVENTORY (Exhaustive — all 12 partition files audited)

### P0 CRITICAL — Different Values, Wrong Page/Element Wins

| # | Key | Defined In | Winner (last spread) | Impact |
|---|-----|-----------|---------------------|--------|
| 1 | `btnSave` | left-panel.ts (pos 1): `location-settings-btn-save`, auto-addon.ts (pos 10): same, **local-office-settings.ts (pos 11)**: `local-office-settings-btn-save` | **local-office-settings** (DIFFERENT testid) | `getTsSelector('btnSave')` returns wrong save button. Auto-addon sidesteps via direct import. local-office-settings.page.ts lines 65, 80 use this. |
| 2 | `tabBasicInformation` | left-panel.ts (pos 1): `location-settings-tab-basic-information`, **local-office-settings.ts (pos 11)**: `local-office-settings-tab-basic-information` | **local-office-settings** (DIFFERENT testid) | Completely different pages. local-office-settings.page.ts line 28 passes to `navigateToSubTab()` which calls `getElement()` at base-page.ts:388. |
| 3 | `dlgSaveChanges` | shared.ts (pos 6): `:has-text("Save Changes")`, notes.ts (pos 8): `[role="alertdialog"]` (ANY dialog!), **auto-addon.ts (pos 10)**: `:has(h2:text-is("Save Changes"))` | **auto-addon** (3 different selectors) | 6 page objects use this key. |

### P1 HIGH — Different Values, Reduced Specificity

| # | Key | Defined In | Winner | Impact |
|---|-----|-----------|--------|--------|
| 4 | `dlgUnsavedChanges` | shared.ts: `"Any unsaved changes will be lost"`, **auto-addon.ts**: `"Unsaved changes"` | **auto-addon** | shared-setup-locations.page.ts:53 uses this. |
| 5 | `btnSaveChangesConfirm` | shared.ts: scoped `button:has-text("Save")`, **notes.ts**: unscoped `[role="alertdialog"] button:has-text("Save")` | **notes** (dangerously broad) | 4+ page objects use via `clickSaveWithDialog` defaults. |
| 6 | `btnSaveChangesCancel` | shared.ts: scoped, notes.ts: unscoped, **auto-addon.ts**: scoped via `h2:text-is` | **auto-addon** | local-office-settings.page.ts:85 uses this (previously untracked). |

### P3 LOW — Identical Values (Redundant but Harmless)

| # | Key | Defined In | Winner |
|---|-----|-----------|--------|
| 7 | `toastLocalInfoUpdated` | local-info.ts, auto-addon.ts | auto-addon — identical values, no behavior difference |

---

## POST-FIX STATE: What `shared.ts` Selectors Resolve To

After SP-02, 6 non-auto-addon page objects resolve dialog keys to `shared.ts`:

```typescript
// shared.ts lines 17-30 — VERIFIED by direct file read
dlgSaveChanges:        '[role="alertdialog"]:has-text("Save Changes")'
btnSaveChangesCancel:  '[role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel")'
btnSaveChangesConfirm: '[role="alertdialog"]:has-text("Save Changes") button:has-text("Save")'
dlgUnsavedChanges:     '[role="alertdialog"]:has-text("Any unsaved changes will be lost")'
btnUnsavedChangesOk:   '[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("OK")'
btnUnsavedChangesCancel:'[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("Cancel")'
```

**Safety assessment**: `:has-text("Save Changes")` on `[role="alertdialog"]` is safe — the `role` attribute scoping prevents stray matches. This is Playwright's recommended dialog targeting pattern. Less specific than auto-addon's `h2:text-is()` but correct for the shared dialog structure.

---

## SUBPLANS

### SP-01 + SP-02: Fix Collision Detection + Resolve All 7 Key Conflicts (P0) — SINGLE ATOMIC COMMIT

**These execute and commit together. No intermediate broken state.**

#### SP-01: Collision Detection Architecture

**File: `src/selectors/index.ts`**

Replace the merge logic (find via `grep -n "SetupSelectors\|buildAllSelectors\|ALL_SELECTORS" src/selectors/index.ts`):

1. Define named partitions array:
```typescript
const SETUP_PARTITIONS: { name: string; selectors: Record<string, string> }[] = [
  { name: 'left-panel', selectors: SetupLeftPanelSelectors },
  { name: 'local-info', selectors: SetupLocalInfoSelectors },
  { name: 'currency', selectors: SetupCurrencySelectors },
  { name: 'pricing', selectors: SetupPricingSelectors },
  { name: 'account-address', selectors: SetupAccountAddressSelectors },
  { name: 'shared', selectors: SetupSharedSelectors },
  { name: 'shared-setup-locations', selectors: SetupSharedSetupLocationsSelectors },
  { name: 'notes', selectors: SetupNotesSelectors },
  { name: 'legal', selectors: SetupLegalSelectors },
  { name: 'auto-addon', selectors: SetupAutoAddonSelectors },
  { name: 'local-office-settings', selectors: LocalOfficeSettingsSelectors },
];
```

2. New `mergeWithCollisionCheck(partitions)`:
   - Iterates all partitions, tracking `Map<key, { partition, value }[]>`
   - On collision: throws listing ALL collisions (batch, not first-fail)
   - Returns merged `Record<string, string>` only if zero collisions

3. Apply to both exports:
```typescript
export const SetupSelectors = mergeWithCollisionCheck(SETUP_PARTITIONS);
export const ALL_SELECTORS = mergeWithCollisionCheck([
  { name: 'login', selectors: MicrosoftLoginSelectors },
  ...SETUP_PARTITIONS,
]);
```

4. **Future improvement** (not in this commit): Add `npm run selectors:lint` CI script that imports `src/selectors/index.ts` and catches collision throws at build time. Document this in SP-09.

#### SP-02: Resolve All 7 Collisions

**Collision #1: `btnSave` (3-way)**

| File | Action | New Key |
|------|--------|---------|
| `left-panel.ts` | KEEP | `btnSave` (canonical shared save) |
| `auto-addon.ts` | RENAME | `btnSaveAutoAddon` |
| `local-office-settings.ts` | RENAME | `btnSaveLocalOffice` |

Page object updates:
- `location-auto-addon.page.ts` line 53: `SetupAutoAddonSelectors.btnSave` → `SetupAutoAddonSelectors.btnSaveAutoAddon`
- `location-local-office-settings.page.ts` lines 65, 80: `getElement('btnSave')` → `getElement('btnSaveLocalOffice')`
  - Find via: `grep -n "getElement.*btnSave" src/pages/locations/location-local-office-settings.page.ts`

**Collision #2: `tabBasicInformation` (2-way)**

| File | Action | New Key |
|------|--------|---------|
| `left-panel.ts` | KEEP | `tabBasicInformation` (canonical) |
| `local-office-settings.ts` | RENAME | `tabLocalOfficeBasicInfo` |

Page object update:
- `location-local-office-settings.page.ts` line 28: `navigateToSubTab('tabBasicInformation', ...)` → `navigateToSubTab('tabLocalOfficeBasicInfo', ...)`
  - `navigateToSubTab` calls `this.getElement(tabKey)` at base-page.ts:388, so string key matters

**Collision #3: `dlgSaveChanges` + #5 `btnSaveChangesConfirm` + #6 `btnSaveChangesCancel` (3-way)**

| File | Action | Keys Affected |
|------|--------|---------------|
| `shared.ts` | KEEP as canonical | `dlgSaveChanges`, `btnSaveChangesConfirm`, `btnSaveChangesCancel` |
| `notes.ts` | DELETE 3 keys | `dlgSaveChanges`, `btnSaveChangesConfirm`, `btnSaveChangesCancel` |
| `auto-addon.ts` | RENAME 2 keys | `dlgSaveChanges` → `dlgAutoAddonSaveChanges`, `btnSaveChangesCancel` → `btnAutoAddonSaveCancel` |

Notes.ts comment to add: `// Save dialog selectors live in shared.ts — do NOT duplicate. See MNT-013, MNT-014.`
Also add scoping warning: `// WARNING: Never use bare '[role="alertdialog"]' — always scope with :has-text(...) or :has(h2:text-is(...))`

Page object updates after notes.ts deletion:
- `location-notes.page.ts` lines 230, 239, 240, 245, 246 — uses `dlgSaveChanges`, `btnSaveChangesConfirm`, `btnSaveChangesCancel`. After deletion from notes.ts, these resolve to shared.ts. **No code changes needed.**

Page object updates for auto-addon.ts renames:
- `location-auto-addon.page.ts` — **13 getElement refs** to update:
  - `'dlgSaveChanges'` → `'dlgAutoAddonSaveChanges'` (6 refs: find via `grep -n "'dlgSaveChanges'" src/pages/locations/location-auto-addon.page.ts`)
  - `'btnSaveChangesCancel'` → `'btnAutoAddonSaveCancel'` (1 ref: find via `grep -n "'btnSaveChangesCancel'" src/pages/locations/location-auto-addon.page.ts`)
  - `'dlgUnsavedChanges'` → `'dlgAutoAddonUnsavedChanges'` (5 refs: find via `grep -n "'dlgUnsavedChanges'" src/pages/locations/location-auto-addon.page.ts`)
  - `SetupAutoAddonSelectors.btnSave` → `SetupAutoAddonSelectors.btnSaveAutoAddon` (1 ref)

Previously untracked collision victim:
- `location-local-office-settings.page.ts` line 85: `getElement('btnSaveChangesCancel')` — currently resolves to auto-addon's version. After fix, resolves to shared.ts. Correct behavior, **no code change needed**.

**Collision #4: `dlgUnsavedChanges` (2-way)**

| File | Action | New Key |
|------|--------|---------|
| `shared.ts` | KEEP | `dlgUnsavedChanges` (canonical) |
| `auto-addon.ts` | RENAME | `dlgAutoAddonUnsavedChanges` |

- `shared-setup-locations.page.ts` line 53: uses `getElement('dlgUnsavedChanges')` — resolves to shared.ts after fix. Verify shared.ts selector matches dialog on that page.
- `location-auto-addon.page.ts`: 5 refs updated (covered above in Collision #3)

**Collision #7: `toastLocalInfoUpdated` (identical values)**

| File | Action |
|------|--------|
| `local-info.ts` | KEEP (canonical) |
| `auto-addon.ts` | DELETE + add comment: `// Toast selector lives in local-info.ts — do not duplicate` |

- `location-auto-addon.page.ts` line 105: `getElement('toastLocalInfoUpdated')` — resolves to local-info.ts. Same value, **no behavior change**.

#### Complete File Change List

| File | Action | Details |
|------|--------|---------|
| `src/selectors/index.ts` | REWRITE merge logic | `mergeWithCollisionCheck()` replaces raw spread |
| `src/selectors/locations/auto-addon.ts` | RENAME 4 keys, DELETE 1 | `btnSave→btnSaveAutoAddon`, `dlgSaveChanges→dlgAutoAddonSaveChanges`, `btnSaveChangesCancel→btnAutoAddonSaveCancel`, `dlgUnsavedChanges→dlgAutoAddonUnsavedChanges`, DELETE `toastLocalInfoUpdated` |
| `src/selectors/locations/notes.ts` | DELETE 3 keys + add comments | `dlgSaveChanges`, `btnSaveChangesConfirm`, `btnSaveChangesCancel` |
| `src/selectors/locations/local-office-settings.ts` | RENAME 2 keys | `btnSave→btnSaveLocalOffice`, `tabBasicInformation→tabLocalOfficeBasicInfo` |
| `src/pages/locations/location-auto-addon.page.ts` | UPDATE 13 getElement refs + 1 direct import ref | All renamed keys |
| `src/pages/locations/location-local-office-settings.page.ts` | UPDATE 3 refs | `btnSave→btnSaveLocalOffice` (×2), `tabBasicInformation→tabLocalOfficeBasicInfo` (×1 in navigateToSubTab call) |
| `src/selectors/SELECTOR_CATALOG.md` | REGENERATE | Run `npm run selectors:catalog` (confirmed in package.json:64) |

#### Verification (SP-01+SP-02 together)

```bash
# 1. Compile check
npx tsc --noEmit

# 2. Runtime collision check — no throw
npx ts-node -e "require('./src/selectors')"

# 3. Collision resolution grep checks
grep -rn "dlgSaveChanges:" src/selectors/locations/    # ONLY shared.ts
grep -rn "btnSave:" src/selectors/locations/            # each file has unique key
grep -rn "tabBasicInformation:" src/selectors/locations/ # ONLY left-panel.ts

# 4. Test runs — all affected page objects
npm test -- --project=chrome tests/specs/locations/location-auto-addon.spec.ts
npm test -- --project=chrome tests/specs/locations/location-currency.spec.ts
npm test -- --project=chrome tests/specs/locations/location-legal.spec.ts
npm test -- --project=chrome tests/specs/locations/location-local-office-settings.spec.ts

# 5. Regenerate catalog
npm run selectors:catalog
```

**Risk**: HIGH — key renames propagate to 2 page objects with 16 references total. Wrong rename = runtime failure.
**Mitigation**: Grep-first navigation for EVERY edit (never trust line numbers). Run 4 spec files covering all affected page objects.
**Reversibility**: Full (single commit revert).

---

### SP-04: Barrel Export Completeness (P2) — MNT-002

**Current state** (`src/pages/index.ts`): Exports 7 classes (Login, Home, Currency, LocalInfo, Pricing, AccountAddress, Notes).

**Add 4 exports** (standard page objects added recently):
```typescript
export { LocationAutoAddonPage } from './locations/location-auto-addon.page';
export { LocationLegalPage } from './locations/location-legal.page';
export { LocationLocalOfficeSettingsPage } from './locations/location-local-office-settings.page';
export { LocationSharedSetupLocationsPage } from './locations/location-shared-setup-locations.page';
```

**Intentionally SKIPPED** (2 classes — internal utilities, not standalone pages):
- `LocationFormHelpers` — used only by other page objects as a mixin. Exporting exposes internals.
- `LocationTestOrchestrators` — multi-page coordination class. Imported by specs directly.

**Verification**: `npx tsc --noEmit`
**Risk**: NONE (additive)

---

### SP-05: `waitForNetworkIdle` Method Extraction (P2)

**Problem**: `page.waitForLoadState('networkidle', { timeout: N }).catch(() => {})` duplicated **20 times** across 7 files (including 1 in BasePage itself).

**Exact enumeration** (grep-verified):

| File | Occurrences | Timeout Values |
|------|-------------|----------------|
| `location-local-office-settings.page.ts` | 5 | 10_000 (×2), 15_000 (×3) |
| `location-auto-addon.page.ts` | 3 | 15_000 (×2), 10_000 (×1) |
| `location-test-orchestrators.page.ts` | 4 | 15_000 (×4, note: `15000` not `15_000`) |
| `location-currency.page.ts` | 5 | 5_000 (×4), 15_000 (×1) |
| `location-notes.page.ts` | 1 | 10_000 |
| `location-shared-setup-locations.page.ts` | 1 | 15_000 |
| `base-page.ts` (navigateToSubTab, line 386) | 1 | 15_000 |

**File: `src/common/base-page.ts`** — Add:
```typescript
protected async waitForNetworkIdle(timeout = 15_000): Promise<void> {
  await this.page.waitForLoadState('networkidle', { timeout }).catch(() => {
    Log.warn(`Network did not reach idle within ${timeout}ms`);
  });
}
```

**Each replacement**: `await this.waitForNetworkIdle(N)` — preserving the ORIGINAL timeout value. Do NOT default to 15_000 when the original uses 5_000 or 10_000.

**Verification**: `grep -rn "waitForLoadState.*networkidle.*catch" src/pages/ src/common/base-page.ts | wc -l` → 0 hits (excluding the new method definition)
**Risk**: LOW (identical behavior)

---

### SP-06: CheckboxState Circular Import Fix (P2)

**File: `src/framework-contracts/types.ts`** (NEW file)
```typescript
/** UI state types shared across page objects and base classes. */
export interface CheckboxState { checked: boolean; disabled: boolean; }
export interface SpinState { value: string; disabled: boolean; }
```

**File: `src/framework-contracts/index.ts`** — Add: `export { CheckboxState, SpinState } from './types';`
**File: `src/common/base-page.ts`** — Change import from `'../pages/locations/location-form-helpers.page'` to `'../framework-contracts'`
**File: `src/pages/locations/location-form-helpers.page.ts`** — Remove local definitions, import from `'../../framework-contracts'`

**Verification**: `npx tsc --noEmit`
**Risk**: LOW

---

### SP-07 + SP-08: Shared Constants + Timeout Consolidation — DEFERRED

Both deferred to avoid scope creep. SP-07 (SELECTOR_PREFIXES) owned by PLAN_CODEBASE_CLEANUP B3. SP-08 (timeout consolidation) is P3 cosmetic. Data captured in plan for future execution.

**SELECTOR_PREFIXES diff** (for reference):
- `diagnostics-collector.ts:26` + `agent-reporter.ts:100`: 13 items (identical): `btn, txt, drp, chk, lnk, rdo, dlg, tbl, err, col, spin, tab, pnl`
- `generator-validate-selectors.ts:18`: 23 items (superset): adds `lbl, bar, cell, opt, row, dtp, nav, mod, ico, div`

---

### SP-09: New Learned Rules + Documentation

**File: `specs_planning/_internal/agent-mistakes.md`** — Append after MNT-012:

**MNT-013**: Within-partition collision detection. `mergeWithCollisionCheck()` in `src/selectors/index.ts` throws at import time if any key collides across partitions. Resolution: (a) use shared.ts by deleting duplicate, or (b) use tab-specific prefix (e.g., `dlgAutoAddonSaveChanges`). **Trigger**: Any selector key addition to partition files.

**MNT-014**: Never define dialog selectors as bare `[role="alertdialog"]`. Always scope with `:has(h2:text-is(...))` or `:has-text(...)`. Unscoped selectors match ANY dialog on page. **Trigger**: Any new dialog selector.

**File: CLAUDE.md** — Append to Learned Rules:

**LR-017**: Spread-based object merging (`{ ...a, ...b }`) silently overwrites duplicate keys. TypeScript cannot detect this (microsoft/TypeScript#29239). When merging partitioned config/selector objects, ALWAYS use a collision-detecting function. **Trigger**: Any barrel export or config merge.

**Future CI improvement** (document, don't implement in this plan):
Add `"selectors:lint": "npx ts-node -e \"require('./src/selectors')\""` to package.json scripts. Run in CI as primary collision defense. Runtime throw is the safety net.

---

## EXECUTION ORDER

| Phase | Subplans | Git Commit |
|-------|----------|------------|
| 1 | **SP-01 + SP-02** (atomic) | `fix: resolve 7 silent selector collisions + add partition-aware detection` |
| 2 | SP-04 | `chore: add missing page object barrel exports` |
| 3 | SP-06 | `refactor: move CheckboxState/SpinState to framework-contracts` |
| 4 | SP-05 | `refactor: extract waitForNetworkIdle to BasePage (20 occurrences)` |
| 5 | SP-09 | `docs: add MNT-013, MNT-014, LR-017 learned rules` |

---

## GUARD RAILS

1. After SP-01+SP-02: `npx tsc --noEmit` + run 4 spec files (auto-addon, currency, legal, local-office-settings) + `npm run selectors:catalog`
2. After SP-04: `npx tsc --noEmit`
3. After SP-06: `npx tsc --noEmit`
4. After SP-05: `grep -rn "waitForLoadState.*networkidle.*catch" src/pages/ src/common/base-page.ts | wc -l` → 0 (excluding method definition) + run one spec
5. After SP-09: visual review of appended rules

---

## CONCURRENT WORK SAFETY

| Other Plan | Overlapping Files | Status |
|-----------|------------------|--------|
| **PLAN_CODEBASE_CLEANUP FALSE POSITIVE 1.6** (save dialog dedup) | `src/selectors/locations/{shared,auto-addon,notes}.ts` | **DO-NOT-TOUCH — owned by this plan (SP-02)**. Mark 1.6 as RESOLVED after execution. |
| **PLAN_CODEBASE_CLEANUP B3** (SELECTOR_PREFIXES) | `src/utils/agent-reporter.ts`, `diagnostics-collector.ts`, `generator-validate-selectors.ts` | No overlap. Owned by CODEBASE_CLEANUP. |
| **PLAN_CODEBASE_CLEANUP B4** (CheckboxState) | `src/framework-contracts/`, `base-page.ts`, `form-helpers.page.ts` | This plan's SP-06 is **prerequisite** for B4. Run SP-06 first. |
| **PLAN_CODEBASE_CLEANUP A2.10** (`getSelectorFromTs` removal) | `src/common/base-page.ts` | No overlap. Owned by CODEBASE_CLEANUP. |
| **PLAN_CODEBASE_CLEANUP A2.13** (`btnAccMasterAddress` placeholder) | `src/selectors/locations/account-address.ts` | No overlap. Owned by CODEBASE_CLEANUP. |
| **Generator queue** (`location-pricing` at `pending_generation`) | `src/selectors/locations/pricing.ts` | Zero collisions in pricing. Safe to run concurrently. |

---

## RISK ASSESSMENT

| Subplan | Risk | Mitigation |
|---------|------|------------|
| SP-01+SP-02 | **HIGH** | Grep-first navigation. Run 4 spec files. Single atomic commit. 16 page object refs to update across 2 files. |
| SP-04 | NONE | Additive only. FormHelpers + TestOrchestrators intentionally excluded (internal utilities). |
| SP-05 | MEDIUM | 20 replacements preserving 3 different timeout values (5k, 10k, 15k). Grep verification after. |
| SP-06 | LOW | TypeScript catches type mismatches. Also migrates SpinState (not just CheckboxState). |
| SP-09 | NONE | Documentation only. Appended after MNT-012 in agent-mistakes.md. |
