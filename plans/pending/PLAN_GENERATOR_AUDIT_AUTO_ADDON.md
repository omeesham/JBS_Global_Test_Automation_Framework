> **⚠️ STALE PATHS, UNIQUE VALUE**: Paths changed by PLAN_P0_LOCAL_OFFICE_DECONTAMINATION (2026-03-25). All `locations/` paths are now `setup/locations/` or `setup/local-office/`. `SetupSelectors` → `LocationSettingsSelectors`. GARDENER-reviewed 2026-04-15: Finding 2 (beforeunload ↔ fixture race + ALL-057/058/059 rules) is UNIQUE to this plan and still applicable — update paths before executing, do not supersede.

# REVISED PLAN: Generator Audit — Auto Add-On (Post-Adversarial Audit V3)

**Original**: PLAN_GENERATOR_AUDIT_AUTO_ADDON.md
**Status**: REVISED — incorporates external adversarial audit + codebase verification
**Priority**: P2-CYCLE-3
**Date**: 2026-03-25
**Audit trail**: V1 (original) → V2 (external audit found 6 errors, 2 unsupported claims, 4 rule ID collisions) → V3 (this version, all corrections applied)

---

## Context

A Copilot generator session for the Auto Add-On tab hit 7 failures across 5 root causes. The original audit correctly identified the core issues but contained factual errors, unsupported claims, and was unaware of 3 overlapping pending plans. This revision strips redundant findings, corrects all errors, and scopes to UNIQUE value only.

**Dependencies**: This plan DEPENDS ON `PLAN_MAINTAINER_SWEEP` executing first (selector collision architecture must be fixed before new selectors are safe). Finding 3 (shared.ts labels) defers to `PLAN_FULL_CHAIN_AUDIT` B-01.

---

## FINDING 1: COLLISION ARCHITECTURE — CROSS-REFERENCE ONLY

**Deferred to**: `PLAN_MAINTAINER_SWEEP` (more complete: 7 collisions found vs our original 5, all 12+ partitions audited, concrete `mergeWithCollisionCheck()` implementation).

**Original audit missed 2 collisions**:
- `tabBasicInformation` — P0 CRITICAL: left-panel.ts (line 21, `location-settings-tab-basic-information`) vs local-office-settings.ts (line 11, `local-office-settings-tab-basic-information`). Different testids = wrong page.
- `toastLocalInfoUpdated` — P3 LOW: local-info.ts (line 10) vs auto-addon.ts (line 66). Identical values, harmless.

Both are already covered by PLAN_MAINTAINER_SWEEP's exhaustive inventory. No action needed here.

---

## FINDING 2: `beforeunload` ↔ Playwright Fixture Race Condition (UNIQUE — NOT in any other plan)

### The Mechanism
```
User clicks sidebar Home with unsaved form changes
  ↓ App fires native `beforeunload` event
  ↓ fixtures.ts:138 auto-accepts it: page.on('dialog', d => d.accept())
  ↓ Browser navigation proceeds to /home
  ↓ React routing guard's alertdialog NEVER mounts (component unmounted during navigation)
  ↓ Test waits 5s for alertdialog → times out → FAIL
```

### Verified References (line numbers grep-confirmed 2026-03-25)
- **Fixture handler**: `src/infra/fixtures.ts:138` — `page.on('dialog', async (dialog) => { if (dialog.type() === 'beforeunload') { await dialog.accept(); } })`
- **Existing solution A**: `src/pages/locations/location-legal.page.ts:214` — `triggerBeforeunloadAndStay()` (reload-based, dismiss to stay)
- **Existing solution B**: `src/pages/locations/location-notes.page.ts:306` — `navigateAwayWithUnsavedChanges()` (navigate-based, dismiss to stay)
- **Existing solution C**: `src/core/base-page.ts:66` — `safeNavigateTo()` (wraps navigation with beforeunload accept handler)
- **Auto-addon's solution**: `src/pages/locations/location-auto-addon.page.ts:117-122` — window-level `onbeforeunload = null` + `stopImmediatePropagation` suppression

### Why No Gate Caught This
- ALL-052 only covers MCP browser context (about:blank → target pattern). Says NOTHING about Playwright fixture `page.on('dialog')` interaction.
- ZERO cross-referencing between existing page object patterns and new module generation.

### Pipeline Blind Spot
3 existing solutions exist but are invisible to generators — no pattern documentation, no cross-module discovery rule.

### Fix — 3 New Rules

**ALL-057** (AGENT_SHARED_RULES.md): "In Playwright specs, fixture `beforeunload` auto-accept means React routing guard dialogs NEVER appear unless `window.onbeforeunload = null` is called first. When testing navigation-away dialogs: (1) suppress beforeunload, (2) click navigation, (3) assert alertdialog. Reference: `location-legal.page.ts:214 triggerBeforeunloadAndStay()`."

**PLN-043** (planner agent): "For navigation-away dialog TCs: run `browser_evaluate(() => typeof window.onbeforeunload)`. If non-null, add TC NOTE: App fires beforeunload. Generator must suppress onbeforeunload before nav click."

**GEN-042** (generator agent): "Before writing navigation-away dialog tests: grep `src/pages/` for `beforeunload|navigateAway|UnsavedChanges` to find existing patterns. REUSE existing solutions."

---

## FINDING 3: shared.ts WRONG BUTTON LABELS — CROSS-REFERENCE ONLY

**Deferred to**: `PLAN_FULL_CHAIN_AUDIT` B-01 (already proposes renaming `btnUnsavedChangesOk` → `btnUnsavedChangesDiscard` and `btnUnsavedChangesCancel` → `btnUnsavedChangesStay` with page object reference updates).

No action needed here.

---

## FINDING 4: Serial State Pollution — DOWNGRADED TO HYPOTHESIS

**Status**: HYPOTHESIS — needs MCP verification.

**Theory**: Sub-tab switch (Auto Add-On → Local Information → back) may reset the React routing guard's dirty flag, causing subsequent navigation-away tests to miss the unsaved changes dialog.

**Evidence gap**: Zero code evidence. No routing guard function identified. No dirty flag variable cited. No React component name provided. The planner verified "state preserved" but only checked UI state, not routing guard behavior after re-mount.

**Action**: Before executing any fix, verify on MCP:
1. Navigate to Auto Add-On tab, toggle a checkbox (form is dirty)
2. Switch to Local Information sub-tab, then back to Auto Add-On
3. Click Home sidebar link
4. Does the unsaved changes dialog appear? If yes → hypothesis disproven. If no → hypothesis confirmed, needs architectural fix.

---

## FINDING 5: Blind Toggle Inheritance Override (UNIQUE)

### The Real Problem
`location-auto-addon.page.ts:35-37` overrides the parent's smart toggle with a blind `.click()`:

```typescript
// auto-addon — BLIND (just clicks, doesn't verify state)
async toggleCheckbox(key: string): Promise<void> {
  await this.getElement(key).click();
}
```

vs the parent class `location-form-helpers.page.ts:85-92` — SMART toggle:
```typescript
async toggleCheckbox(selectorKey: keyof typeof SetupSelectors): Promise<boolean> {
  const el = this.getElement(selectorKey);
  const wasChecked = await el.isChecked();
  if (wasChecked) { await el.uncheck(); } else { await el.check(); }
  return await el.isChecked();
}
```

Explicit methods also exist at `location-form-helpers.page.ts:75-83`:
- `checkCheckbox(key)` — checks only if unchecked
- `uncheckCheckbox(key)` — unchecks only if checked

### Impact
When cleanup code uses blind `toggleCheckbox` to restore state, a preceding silent save failure means the toggle goes the wrong direction → DB pollution cascades through subsequent serial tests.

### Note on `.catch(() => false)` framing
Original audit cited 23 instances. Actual count is **27** across 9 files. But ALL 27 are visibility/state probes (`isVisible().catch(() => false)`, `isChecked().catch(() => false)`) — NOT save operations. The `.catch` pattern itself is fine for probes. The real issue is the blind toggle override above.

### Fix

**GEN-043** (generator agent): "Cleanup code MUST use explicit `checkCheckbox(key)` / `uncheckCheckbox(key)` from LocationFormHelpers, never blind `toggleCheckbox`. Prevents cascade failures from silent save errors."

**Code fix**: Remove the blind `toggleCheckbox` override from `location-auto-addon.page.ts:35-37`. Let the parent's smart version handle it. Or replace with calls to `checkCheckbox`/`uncheckCheckbox`.

**File**: `src/pages/locations/location-auto-addon.page.ts` (lines 35-37 — delete or replace)

---

## FINDING 6: Async URL Check After Dialog Navigation (UNIQUE)

After clicking "Discard" in the unsaved changes dialog, client-side routing hasn't completed yet. Synchronous `getCurrentUrl()` (`base-page.ts:238-240`, returns `page.url()`) returns stale URL.

### Fix

**GEN-044** (generator agent): "After dialog actions triggering client-side routing (Discard, navigate away): use `expect.poll(() => page.url()).toContain('/target')`, not synchronous `getCurrentUrl()`."

---

## FINDING 7: Generator Didn't Discover Existing Patterns (UNIQUE)

The generator created `clickSidebarHome()` with inline `window.onbeforeunload = null` instead of reusing `safeNavigateTo()` from `base-page.ts:66` or studying how Legal/Notes handled identical scenarios.

A simple `grep -r "beforeunload\|navigateAway\|UnsavedChanges" src/pages/` would have surfaced 3+ existing solutions.

### Fix

**GEN-045** (generator agent): "Before creating ANY new page object method: grep `src/pages/` for similar method names and behavioral patterns. If a method solving the same problem exists in another page object, extract to BasePage or copy the pattern."

---

## COMPLETE CHANGES SUMMARY

### New Rules to Add

| ID | Target File | Rule Text |
|----|------------|-----------|
| ALL-057 | `docs/read_only_docs/AGENT_SHARED_RULES.md` | beforeunload ↔ fixture race — suppress before nav click |
| PLN-043 | `.github/agents/playwright-test-planner.agent.md` | Check `typeof window.onbeforeunload` for nav-away TCs |
| GEN-042 | `.github/agents/playwright-test-generator.agent.md` | Grep existing beforeunload patterns before writing nav-away tests |
| GEN-043 | `.github/agents/playwright-test-generator.agent.md` | Explicit check/uncheck in cleanup, never blind toggle |
| GEN-044 | `.github/agents/playwright-test-generator.agent.md` | `expect.poll` for URL after dialog-triggered routing |
| GEN-045 | `.github/agents/playwright-test-generator.agent.md` | Grep existing page objects for similar patterns before creating new methods |

### Code Changes

| File | Change | Lines |
|------|--------|-------|
| `src/pages/locations/location-auto-addon.page.ts` | Delete blind `toggleCheckbox` override (let parent's smart version handle it) | 35-37 |

### Agent Mistakes Log

| File | Change |
|------|--------|
| `specs_planning/_internal/agent-mistakes.md` | Add GEN-042 through GEN-045 with evidence from this session |

### Cross-References (NO action needed — handled by other plans)

| Issue | Handled By |
|-------|-----------|
| Selector collision architecture | PLAN_MAINTAINER_SWEEP |
| shared.ts wrong button labels | PLAN_FULL_CHAIN_AUDIT B-01 |
| GEN-028 duplicate ID | PLAN_FULL_CHAIN_AUDIT A-01 |

---

## Verification Plan

1. **After removing blind toggleCheckbox**: Run `npx playwright test --project=chrome specs/locations/location-auto-addon.spec.ts` — verify all TC cleanup code still works via inherited smart toggle
2. **After adding ALL-057**: Verify rule is referenced in planner + generator agent files
3. **After GEN-042-045**: Dry-run generator on a different module — verify no false positives from new rules
4. **Finding 4 hypothesis**: Perform MCP verification steps listed above before any serial isolation fix
5. **Cross-plan check**: After PLAN_MAINTAINER_SWEEP executes, verify auto-addon selectors resolve correctly through shared.ts

---

## Audit Trail

| Version | Auditor | Changes |
|---------|---------|---------|
| V1 | Original plan author | 7 findings, blame table, cascade diagram |
| V2 | External adversarial (Opus 4.6) | Found: 3 wrong line numbers, wrong catch count (27 not 23), 2 missed collisions, Finding 4 unverified, all GEN rule IDs collide with PLAN_FULL_CHAIN_AUDIT, 60% redundant with PLAN_MAINTAINER_SWEEP |
| V3 | Revised (this version) | Stripped F1/F3 to cross-refs, downgraded F4 to hypothesis, corrected all line numbers, reassigned rule IDs to GEN-042+, reframed F5 evidence from catch pattern to inheritance override, added dependency declaration |
