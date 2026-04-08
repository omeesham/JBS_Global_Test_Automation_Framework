# PLAN_AUDIT_CURRENCY — Session 1 Audit (Execute in Session 2)

**Parent**: `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`
**Target**: CURRENCY (Batch 3, P2)
**Gap**: Persistence (Currency RT% = 0%, target >50%)
**Current state**: 20 tests (TC-LOC-CUR-001 to TC-LOC-CUR-020), all active, 0 skipped, 0 FIXMEs
**Created**: 2026-04-06 | **Executed**: 2026-04-06 | **Status**: DONE
**Self-audit**: 2 critical, 4 high, 2 medium findings — all resolved in this version

### Execution Summary (2026-04-06)
- **All 7 TCs implemented**: TC-LOC-CUR-021 through TC-LOC-CUR-027
- **MCP-1**: CAD Selected persists after save+reload → PASS
- **MCP-2**: USD Merchant change persists → PASS
- **MCP-3**: CAD IsDefault cascade persists → PASS
- **MCP-4**: Beforeunload dialog fires on dirty form → PASS (TC-026 kept)
- **Page object**: reloadAndNavigateToCurrencyTab(), triggerBeforeunloadAndStay() added
- **Test data**: ALTERNATE_USD_MERCHANT added (references MERCHANT_DATA.bahamas)
- **REQUIREMENTS.md line 397**: Fixed validation error description (no dialog — passive Save button state)
- **All 27 tests pass individually** (verified 2026-04-06)

---

## 1. Context

Master plan identifies Currency as having **0% round-trip persistence** — worst page in the suite. All 3 v1 functional requirements already have test coverage:

| v1 Requirement | Existing Coverage |
|---|---|
| `isValidCurrency()`: >= 1 currency selected | TC-LOC-CUR-013: uncheck only selected, verify Save disabled |
| Single default: new default auto-unchecks previous | TC-LOC-CUR-006: set CAD default, verify USD auto-unchecked |
| Merchant filtering by CurrencyId | TC-LOC-CUR-008/009/010: USD=2, CAD=1, MXN=0 options |

**The gap is purely persistence**: no test saves → reloads → verifies the value survived. This audit adds round-trip tests and fixes one documentation discrepancy.

---

## 2. REQUIREMENTS.md Discrepancy (1 fix)

| Line | Current (WRONG) | Correct |
|---|---|---|
| 397 | "shows validation error: 'At least one currency must be selected'" | **Save button stays disabled. No error dialog.** (Confirmed by TC-LOC-CUR-013, spec line 133-143) |

**Fix**: "Minimum 1 currency must remain selected; unchecking the only selected currency keeps Save disabled (no error dialog — passive validation via button state)"

---

## 3. MCP Verification Checklist (4 items — execute in Session 2)

| # | What to verify | Blocks | Expected |
|---|---|---|---|
| MCP-1 | Check CAD Selected → Save → reload → CAD still Selected? | TC-LOC-CUR-021 | Yes |
| MCP-2 | Change USD Merchant to Bahamas → Save → reload → merchant persists? | TC-LOC-CUR-022 | Yes |
| MCP-3 | Set CAD as default → Save → reload → CAD=default, USD=not-default? | TC-LOC-CUR-023 | Yes |
| MCP-4 | Make Currency change (dirty) → trigger reload → beforeunload dialog fires? | TC-LOC-CUR-026 | Likely yes (shared Angular form) |

### Decision Tree
```
MCP-1/2/3 all pass? → Implement TC-LOC-CUR-021 through TC-LOC-CUR-027
MCP-1/2/3 any fail? → ESCALATE (save API not wired for Currency — investigate network)
MCP-4 fails?        → Drop TC-LOC-CUR-026 only. Other 6 TCs unaffected.
```

---

## 4. New TCs (7 total)

**Naming convention**: Spec uses `TC-LOC-CUR-XXX` format (verified spec line 9). All new TCs MUST use this format in test names.

### Round-Trip Persistence (P0)

| TC | Description | ISTQB |
|---|---|---|
| TC-LOC-CUR-021 | Select CAD → save → reload → CAD still selected | RT persistence |
| TC-LOC-CUR-022 | Change USD merchant to Bahamas → save → reload → merchant persists | RT persistence |
| TC-LOC-CUR-023 | Select CAD + set as default → save → reload → CAD=default, USD=not-default | RT + state transition |
| TC-LOC-CUR-024 | Combined: select CAD + change USD merchant → save → reload → both persist | RT (decision table R9) |

### State Transition (P1-P2)

| TC | Description | ISTQB |
|---|---|---|
| TC-LOC-CUR-025 | Select CAD → Save dialog → cancel → reload → CAD still unselected | Cancel-discard path |
| TC-LOC-CUR-026 | Select CAD (dirty) → trigger reload → beforeunload dialog fires → stay | Beforeunload (conditional on MCP-4) |

### Edge Case (P2)

| TC | Description | ISTQB |
|---|---|---|
| TC-LOC-CUR-027 | Uncheck USD IsDefault → save (auto-confirms dialog) → reload → no default set | No-default persistence |

**Total**: 20 → 27 tests. RT field-type coverage: 3/3 = 100% (Selected, IsDefault, Merchant).

### Why 50% TC-count target is wrong for Currency

Currency has 20 tests and only 3 mutable field types. Testing each type once = 4 RT / 27 total = 15%. Reaching 50% would require per-currency redundant tests (3 currencies x 3 types = 9 identical-pattern tests). The meaningful metric is **100% mutable field-type coverage**, not TC ratio. Recommend updating master plan to use this metric for persistence-only pages.

### Gaps NOT included (documented, not attempted)

| Gap | Why excluded |
|---|---|
| Tab-switch `dlgUnsavedChanges` dialog | Different from native beforeunload. No existing Currency test covers either. TC-LOC-CUR-026 covers beforeunload. Tab-switch unsaved dialog is a future opportunity. |

---

## 5. ISTQB Technique Summary

| Technique | Before | After |
|---|---|---|
| Equivalence Partitioning | All functional partitions covered | +3 persistence partitions (021/022/023) |
| BVA | N/A (checkboxes + dropdowns, no ranges) | N/A |
| Decision Table | R1-R5 covered (dirty/revert/change) | +R6-R10 (save→persist, combined, cancel) |
| State Transition | CLEAN→DIRTY, DIRTY→SAVED | +SAVED→PERSISTED, DIRTY→CANCEL, DIRTY→BEFOREUNLOAD |
| Round-Trip | 0% | 100% field-type coverage |
| Error Guessing | CUR-013 (min 1 selected) | +CUR-027 (no-default persist) |

---

## 6. Existing Test Quality

**Verdict: High quality. Zero changes to existing 20 TCs.**

| Quality aspect | Assessment |
|---|---|
| LR-019 baseline | TC-001 (spec lines 10-21) restores USD=selected+default, CAD/MXN=unselected |
| LR-026 dirty state | All mutating tests clean up via restore + save |
| HLR-007 cascade | TC-007 and TC-006 correctly handle Selected/IsDefault cascade |
| Serial isolation | Every mutating test restores before exiting |
| TC ordering | Non-sequential by TC number, sequential by dependency — intentional |

---

## 7. Implementation Changes

### 7a. Page Object: `location-currency.page.ts` (2-3 new methods)

**`reloadAndNavigateToCurrencyTab()`** — following Legal pattern (legal.page.ts:45-57).
No parameters (Legal's `reloadAndNavigateToLegalTab()` takes none — audit finding H-3).
Uses inline `import('@playwright/test').Dialog` type (audit finding C-1 — Currency only imports `Page`, not `Dialog`).

```typescript
/** Reload page and return to Currency tab. Handles potential beforeunload dialog. */
async reloadAndNavigateToCurrencyTab(): Promise<void> {
  const handler = async (d: import('@playwright/test').Dialog) => {
    try { await d.accept(); } catch { /* dialog may already be handled */ }
  };
  this.page.on('dialog', handler);
  try {
    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
  } finally {
    this.page.removeListener('dialog', handler);
  }
  await this.waitForAngularStable();
  await this.clickWithRetry('tabCurrency');
  await this.getElement('tblCurrencyGrid').waitFor({ state: 'visible', timeout: 15_000 });
  await this.waitForAngularStable();
}
```

**Key design decisions**:
- `clickWithRetry('tabCurrency')` — retries up to 3x (more robust than single `click()` after reload). `tabCurrency` resolves via `SetupLeftPanelSelectors` → `LocationSettingsSelectors` spread → `getTsSelector()`.
- Grid wait after tab click — confirms tab content loaded.
- Angular stable wait — ensures form state settled.

**`triggerBeforeunloadAndStay()`** — conditional on MCP-4, following Legal pattern (legal.page.ts:228-242):

```typescript
/** Trigger reload to check if beforeunload fires. Dismisses dialog (stays on page). */
async triggerBeforeunloadAndStay(): Promise<boolean> {
  let dialogFired = false;
  const handler = async (d: import('@playwright/test').Dialog) => {
    dialogFired = true;
    try { await d.dismiss(); } catch { /* already handled */ }
  };
  this.page.on('dialog', handler);
  try {
    await this.page.reload({ timeout: 5_000 }).catch(() => {});
  } finally {
    this.page.removeListener('dialog', handler);
  }
  return dialogFired;
}
```

**JSDoc update** (audit finding H-4): Replace line 14 text.
- Before: "no reload-verify-persistence orchestration"
- After: "reload-verify-persistence orchestration added for round-trip tests"

### 7b. Test Data: `location-currency.data.ts` (1 constant)

```typescript
/** Alternate USD merchant for round-trip persistence tests */
export const ALTERNATE_USD_MERCHANT = MERCHANT_DATA.bahamas;
```

### 7c. Spec: `location-currency.spec.ts` (7 new TCs appended after TC-LOC-CUR-020)

**Pattern for persistence TCs** (following Legal LGL-011/012/018):
```
test.setTimeout(60_000);
reloadAndNavigateToCurrencyTab();   // LR-026: clean form state
make change(s);
expect(isSaveEnabled()).toBe(true);
const result = await clickSave();   // auto-confirms dialog + tracks API errors
expect(result.success).toBe(true);
expect(isSaveEnabled()).toBe(false); // save completed
reloadAndNavigateToCurrencyTab();   // full page reload
assert persisted value(s);
cleanup: restore original → save;
```

**Audit finding C-2**: TC-LOC-CUR-027 uses `clickSave()` (not `clickSaveAndCaptureDialog()` + `confirmSaveDialog()`). `clickSave()` delegates to `clickSaveWithDialog()` which auto-confirms the dialog AND tracks network errors AND drains in-flight requests. TC-LOC-CUR-014 already proves the no-default dialog is 'save-changes' type.

**Cleanup per TC**:

| TC | Cleanup |
|---|---|
| TC-LOC-CUR-021 | Uncheck CAD Selected → save |
| TC-LOC-CUR-022 | Select original USD merchant → save |
| TC-LOC-CUR-023 | Uncheck CAD Selected (auto-disables CAD IsDefault) → check USD IsDefault → save |
| TC-LOC-CUR-024 | Uncheck CAD + restore USD merchant → save |
| TC-LOC-CUR-025 | Reload (cancel = nothing saved, reload discards dirty state) |
| TC-LOC-CUR-026 | Reload (dirty = nothing saved) |
| TC-LOC-CUR-027 | Check USD IsDefault → save |

**Serial contamination recovery** (audit finding M-2): If a TC's cleanup fails, the next TC's `reloadAndNavigateToCurrencyTab()` loads fresh DB state. Checkbox operations are idempotent (`checkCheckbox` only clicks if unchecked). TC-001 baseline enforcement handles re-run scenarios.

### 7d. Selectors — NO CHANGES

All 16 selectors in `currency.ts` + shared dialog selectors in `shared.ts` + `tabCurrency` in `left-panel.ts` are sufficient. Verified via `LocationSettingsSelectors` spread (selectors/index.ts:51-62).

### 7e. REQUIREMENTS.md — Fix line 397 (section 2 above)

### 7f. Master Plan — Update Currency row: test count 20→27, RT% 0%→100% field-type coverage

---

## 8. Execution Plan (Session 2)

### Step 0: Read agent-mistakes.md (5 min)
Read `specs_planning/_internal/agent-mistakes.md` — specifically HLR-007 (cascade cleanup) and MNT-003 (checkbox delegation). Verify no new Currency-related entries since audit.

### Step 1: MCP Verification (15 min)
Execute MCP-1 through MCP-4 in sequence. Each verifies persistence by save → reload → observe.
**Gate**: MCP-1 must pass. If save+reload doesn't preserve CAD Selected, ALL persistence TCs are blocked.

### Step 2: Classify MCP Results (5 min)
Apply decision tree (section 3). Three outcomes:
- All pass → implement 7 TCs
- MCP-4 fails → drop TC-LOC-CUR-026, implement 6 TCs
- MCP-1/2/3 fail → ESCALATE, investigate save API

### Step 3: Fix REQUIREMENTS.md (5 min)
Line 397: apply correction from section 2.

### Step 4: Add Page Object Methods (10 min)
1. Add `reloadAndNavigateToCurrencyTab()` in NAVIGATION section (after `navigateToCurrencyTab`)
2. If MCP-4 passed: add `triggerBeforeunloadAndStay()` in SAVE / ERROR section
3. Update JSDoc line 14

### Step 5: Add Test Data Constant (2 min)
Add `ALTERNATE_USD_MERCHANT` export.

### Step 6: Implement New TCs (30 min)
Append 7 (or 6) TCs at end of serial block. Order follows serial dependency:
1. TC-LOC-CUR-021 (Selected persistence — simplest, proves pattern)
2. TC-LOC-CUR-022 (Merchant persistence — different field type)
3. TC-LOC-CUR-023 (IsDefault persistence — involves cascade)
4. TC-LOC-CUR-024 (Combined — tests both in single save)
5. TC-LOC-CUR-025 (Cancel discards)
6. TC-LOC-CUR-026 (Beforeunload — conditional)
7. TC-LOC-CUR-027 (No-default persistence)

### Step 7: Run & Fix — LR-018 cycle (20 min)
1. `npm run clean` (clean artifacts — LR-024)
2. Run Currency individually: `npx playwright test tests/specs/setup/locations/location-currency.spec.ts --project=chrome`
3. Fix failures
4. Run ALL location specs: `npx playwright test tests/specs/setup/locations/ --project=chrome`
5. Fix serial contamination if any
6. Re-run Currency individually to confirm
7. Re-run all together for green

### Step 8: Update Master Plan (5 min)
Update `PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`: test count + RT metrics.

---

## 9. Critical Files

| File | Action |
|---|---|
| `src/pages/setup/locations/location-currency.page.ts` | Add 2-3 methods, update JSDoc |
| `tests/specs/setup/locations/location-currency.spec.ts` | Append 7 TCs |
| `tests/test-data/setup/locations/location-currency.data.ts` | Add 1 constant |
| `docs/REQUIREMENTS.md` | Fix line 397 |
| `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` | Update metrics |

---

## 10. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Save API doesn't persist Currency changes | LOW | HIGH (blocks all) | MCP-1 is gate check before any code |
| Angular dirty state phantom dialog on reload | MEDIUM | LOW | `reloadAndNavigateToCurrencyTab()` auto-accepts via handler |
| Beforeunload doesn't fire for Currency (MCP-4) | MEDIUM | LOW | Drop TC-LOC-CUR-026 only |
| IsDefault cascade corrupts cleanup (TC-LOC-CUR-023) | MEDIUM | MEDIUM | Cleanup restores both CAD Selected + USD IsDefault. Next TC reloads. |
| Cleanup failure leaves dirty DB for next TC | LOW | MEDIUM | Per-TC reload fetches fresh DB. Idempotent ops. TC-001 re-run baseline. |
| 60s timeout tight for persistence TCs | LOW | LOW | Legal uses same timeout for same pattern. Proven sufficient. |

---

## 11. Self-Audit Trail

**Findings resolved in this version**:

| ID | Severity | Finding | Resolution |
|---|---|---|---|
| C-1 | CRITICAL | Dialog type import: bare `Dialog` fails TS compilation | Use inline `import('@playwright/test').Dialog` (Legal pattern) |
| C-2 | CRITICAL | CUR-027 used `confirmSaveDialog()` which lacks API error tracking | Changed to `clickSave()` which auto-confirms + tracks errors |
| H-1 | HIGH | Missing Step 0: read agent-mistakes.md | Added as execution Step 0 |
| H-2 | HIGH | TC naming: plan used `CUR-021` shorthand, spec uses `TC-LOC-CUR-XXX` | Fixed all references to full format |
| H-3 | HIGH | `officeNo` param unnecessary on reload method | Removed (follows Legal pattern) |
| H-4 | HIGH | JSDoc update text unspecified | Added exact replacement text |
| M-1 | MEDIUM | Tab-switch unsaved dialog gap undocumented | Added to section 4 gaps table |
| M-2 | MEDIUM | Serial contamination recovery undocumented | Added to section 7c |

**Verified correct (no changes)**:
- TC-LOC-CUR-023 cleanup cascade handling
- TC-LOC-CUR-025 cancel + beforeunload interaction
- REQUIREMENTS.md line 397 discrepancy
- All ISTQB analysis (EP, DT, ST)
- Selector resolution chain: `tabCurrency` → `left-panel.ts:25` → `LocationSettingsSelectors` → `getTsSelector()`
- 50% target metric argument
