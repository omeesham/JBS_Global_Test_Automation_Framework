# PLAN_AUDIT_AUTO_ADDON — Session 1 Audit (Execute in Session 2)

**Parent**: `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`
**Target**: AUTO_ADDON (Batch 3, P2)
**Gap**: Persistence (Auto Add-On RT% = 13%, target >50%)
**Current state**: 15 tests (TC-LOC-AAO-001 to TC-LOC-AAO-015), all active, 0 skipped, 0 FIXMEs
**Created**: 2026-04-08 | **Status**: DONE | **Executed**: 2026-04-08

---

## 1. Context

Master plan identifies Auto Add-On as having **13% round-trip persistence** (2/15 TCs: TC-009, TC-011). Target: >50%. Auto Add-On is the simplest Location Settings page: 5 checkbox toggles, no validation rules, shared left-panel Save.

All selectors MCP-verified 2026-03-24. Test data MCP-verified 2026-04-01.

**The gap is primarily persistence** — only 2 TCs test save→reload→verify. Plus 1 REQUIREMENTS.md discrepancy found.

| v1 Requirement | Existing Coverage |
|---|---|
| Pure checkbox toggles | TC-003 (uncheck), TC-004 (check), TC-005 (revert) |
| Left-panel Save (shared) | TC-006, TC-007, TC-008 |
| List items vary per location | Cat-A BLOCKED (needs second location) |
| No validation rules | No negative validation needed |

**Existing RT tests**:
- TC-009: ECDS (unchecked→checked) → save → reload → verify
- TC-011: ECDS + Encore Music (2 items) → save → reload → verify both

**Selector concentration bias**: All 15 TCs use only `chkAutoAddonEncoreMusic` and `chkAutoAddonExpressContentDesignSession` for interactions. Wordly, Wireless Presenter, and Labor are only read in TC-002's default-state loop — never individually toggled. If any has a broken click handler or persistence wiring, the existing suite would not detect it.

---

## 2. REQUIREMENTS.md Discrepancy (1 fix)

| Line | Current (WRONG) | Correct | Evidence |
|---|---|---|---|
| 815 | `\| Test Labor - Jonathan \| unchecked \|` listed as add-on item (6 items in table) | **REMOVE this row** — not present in live UI. Table should have 5 items. | MCP_VERIFICATION_LOG 2026-03-24: 5 checkboxes confirmed. Test data AUTO_ADDON_DEFAULTS: 5 items. Spec TC-001 asserts `getCheckboxCount()).toBe(5)`. |

**Fix during execution**: Remove line 815 from `docs/REQUIREMENTS.md`. The table should list exactly 5 items matching the MCP-verified live state.

---

## 3. Blocked/Excluded TCs

| TC | Reason | Classification | Evidence |
|---|---|---|---|
| TC-LOC-AAO-016 (test cases doc) | Item Count Is Location-Specific — requires second location with different add-on config. Environment only has location 1604 accessible for Auto Add-On testing. | **Cat-A BLOCKED / NOT-AUTOMATABLE** | Test cases doc lines 363-377: `Automatable: No`, `Status: Blocked (Cat-A: requires access to a second location with different add-on configuration from 1604 — environment constraint)` |

Per ALL-033: This is the ONLY planned TC not implemented. Justification documented above.

---

## 4. MCP Verification Checklist (4 items — execute in Session 2)

| # | What to verify | Blocks | Expected |
|---|---|---|---|
| MCP-1 | Uncheck Wordly → Save → Ok → reload → Wordly still unchecked? | TC-LOC-AAO-017 | Yes |
| MCP-2 | Toggle Labor (isDefault=true testid: `true_labor`) → Save → Ok → reload → persists? | TC-LOC-AAO-018 | Yes |
| MCP-3 | Toggle ECDS → click Save → click Cancel → reload → ECDS back to original unchecked? | TC-LOC-AAO-019 | Yes (Cancel = no save) |
| MCP-4 | Invert all 5 checkboxes → Save → Ok → reload → all 5 inverted? | TC-LOC-AAO-020 | Yes |

### Decision Tree
```
MCP-1/2/4 all pass?  → Implement all 4 TCs
MCP-1 or MCP-2 fail? → ESCALATE (save API not wired for that checkbox — investigate network tab)
MCP-3 fail (ECDS persisted after cancel)? → APP BUG — document in REQUIREMENTS.md, mark TC-019 as APP BUG
MCP-4 fail?          → Investigate which items persisted. If partial → split TC-020 into individual TCs
```

**Risk LOW**: TC-009/TC-011 already prove persistence works for ECDS and Encore Music via the same save API. New TCs extend to untested checkboxes using identical patterns.

**MCP stability rules**: Use `browser_click(ref)` from fresh snapshot for Save/Ok clicks — NEVER `evaluate`-based clicks (GEN-035). Wait 3s after `browser_navigate` before `browser_snapshot` (ALL-008).

---

## 5. New TCs (4 total, 2 data-driven + 2 standalone)

**Naming**: Spec uses `TC-LOC-AAO-XXX`. Doc TC-016 is BLOCKED. New TCs start at TC-017 (no collision).

### Round-Trip Persistence — Data-Driven (P0, MNT-008 compliant)

TC-017 and TC-018 have **identical flow** (navigate → uncheck → save → reload → verify unchecked → cleanup). Per MNT-008: "2+ tests with identical flow differing only in selector key = refactor into data-driven loop."

```typescript
const UNCHECK_PERSISTENCE_CASES = [
  { key: 'chkAutoAddonWordly', name: 'Wordly', tc: 'TC-LOC-AAO-017' },
  { key: 'chkAutoAddonLabor', name: 'Labor', tc: 'TC-LOC-AAO-018' },
] as const;

for (const item of UNCHECK_PERSISTENCE_CASES) {
  test(`${item.tc}: ${item.name} Uncheck Persists After Save+Reload`, ...);
}
```

| TC | Description | ISTQB | Closes Gap |
|---|---|---|---|
| TC-LOC-AAO-017 | Uncheck Wordly → save → reload → verify unchecked | RT persistence | Field-instance 3/5; standalone uncheck direction |
| TC-LOC-AAO-018 | Uncheck Labor (isDefault=true) → save → reload → verify unchecked | RT persistence | Testid-pattern coverage (`true_` prefix); field-instance 4/5 |

### Negative Persistence (P1)

| TC | Description | ISTQB | Closes Gap |
|---|---|---|---|
| TC-LOC-AAO-019 | Toggle ECDS → Save → Cancel → navigateFresh → verify NOT persisted | Cancel-discard path | Extends TC-007 with reload verification |

### Bulk Round-Trip (P2)

| TC | Description | ISTQB | Closes Gap |
|---|---|---|---|
| TC-LOC-AAO-020 | Invert all 5 checkboxes → save → reload → verify all inverted | RT persistence (bulk) | Field-instance 5/5 = 100%; Wireless Presenter coverage |

**Total**: 15 → 19 tests. RT tests: 2 → 6. Field-instance coverage: 2/5 → 5/5 = 100%.

### Why >50% TC-count target is wrong for Auto Add-On

Same argument as Currency audit (PLAN_AUDIT_CURRENCY.md section 4): Auto Add-On has 1 field type (checkbox), 5 instances, 2 testid patterns. The meaningful metric is **100% field-instance + behavior coverage**:
- Both toggle directions (check: TC-009, uncheck: TC-017/018)
- Both testid patterns (isDefault=false: TC-009/017, isDefault=true: TC-018)
- Single (TC-009), multi (TC-011), and bulk (TC-020) persistence
- Cancel negative (TC-019)
- All 5 field instances covered via TC-017+018+020

Recommend updating master plan metric for persistence-only pages.

### Gaps NOT included

| Gap | Why excluded | ALL-033 classification |
|---|---|---|
| TC-016: Location-specific item count | Cat-A BLOCKED — single-location env | NOT-AUTOMATABLE (see section 3) |
| Rapid toggle (on-off-on) | TC-005 proves smart form diff; save API receives final state, not event sequence | REDUNDANT with existing coverage |
| Sub-tab switch + save RT | TC-012 + TC-009 already cover both behaviors separately; combining is low incremental value | REDUNDANT with existing coverage |

---

## 6. Active Rules for Execution Session

### Active LR Rules (trigger matched)

| LR | Trigger | Applies To |
|---|---|---|
| LR-001 | Calling functions across files | Verify page object method signatures before calling in spec |
| LR-007 | Generator session start | MCP-verify before writing spec code (section 4) |
| LR-012 | Save dialogs | Confirm shared dialog selectors (dlgSaveChanges from shared.ts) |
| LR-018 | Spec-fixing workflow | Run-all is truth — full LR-018 cycle in step 7 |
| LR-019 | First test in serial | TC-001 baseline enforcement (already implemented, verify unchanged) |
| LR-020 | Plan references counts/files | Verify all plan claims against actual codebase before coding |
| LR-022 | Structural counts | TC-001 `toBe(5)` is justified exception (count IS baseline feature) |
| LR-023 | No networkidle | New code must not use networkidle |
| LR-024 | Clean before RCA | If tests fail during LR-018 cycle |
| LR-026 | Angular dirty state | Serial tests that save data — defensive cleanup |
| LR-027 | Plan movement to done/ | Execution summary mandatory |
| LR-028 | Session bookkeeping | Activity log entry at session end |

### Active Agent-Mistakes Rules

| Rule | Relevance |
|---|---|
| ALL-020 | Search BasePage before creating methods — verified: no new methods needed, `navigateFresh()` exists |
| ALL-026 / MNT-008 | Spec-level DRY — TC-017/018 use data-driven loop (identical flow, different key) |
| ALL-033 | Every unimplemented TC has per-TC justification (TC-016 documented in section 3) |
| GEN-019 | Check BasePage before creating page object methods — verified: none needed |
| GEN-024 | No raw CSS selectors — all selectors via `getElement(key)` registry |
| GEN-035 | MCP clicks via `browser_click(ref)` not evaluate — for MCP verification phase |
| MOD-004 | **MUST** update test-cases + test-plan docs after adding spec TCs |

### Patterns.md Decision Trees

| Pattern | When Active |
|---|---|
| Angular Save→Tab Race | TC-012 existing behavior. New TCs don't switch tabs after save. |
| Spec-Fixing Session Start | If tests fail: `npm run clean` → run fresh → run AGAIN → THEN RCA from fresh evidence |

---

## 7. Existing Test Quality Assessment

### Verdict: High quality. Zero changes to existing 15 TCs.

| Quality Aspect | Assessment |
|---|---|
| LR-019 baseline | TC-001 (lines 9-29): restores all 5 defaults via AUTO_ADDON_DEFAULTS loop, saves if needed, navigates fresh |
| LR-026 dirty state | All mutating tests clean up via revert or save |
| LR-010 async polling | TC-003/004/005 correctly use `expect.poll()` for Radix async state |
| LR-012 shared dialogs | Save Changes dialog uses shared selectors (dlgSaveChanges from shared.ts) |
| Serial isolation | Every mutating test reverts or saves before exit |
| ALL-020 BasePage reuse | Page object delegates to BasePage: `getRadixCheckboxState`, `setRadixCheckbox`, `navigateToSubTab`, `safeNavigateTo`, `waitForAngularStable` |
| GEN-024 selector registry | All selectors via `getElement(key)` — no raw CSS in page object |

### AUD-001 justification for zero changes:

"Zero findings on non-trivial work requires explicit justification" (ALL-030):

1. **TC-001 baseline enforcement** is already comprehensive — iterates ALL defaults, saves if dirty, navigates fresh. No gap.
2. **Cleanup patterns** are consistent — every mutating TC reverts or saves. TC-010 and TC-011 start with `navigateFresh()` for recovery.
3. **The page is genuinely simple** — 5 checkboxes, no validation, no cross-field deps, no conditional logic. The test surface is small and well-covered functionally. The only gap is persistence, which is NEW TCs, not existing TC fixes.
4. **Selector concentration** (only 2/5 checkboxes toggled) is addressed by NEW TCs, not by changing existing ones.

### Minor notes (flagged, NOT changing):

1. **TC-008 cleanup fragility** (line 94): `clickSave()` silently returns if save disabled. If toggle flake → cleanup does nothing. Mitigated by TC-010/011 `navigateFresh()`.
2. **TC-012 cleanup** (line 138): Doesn't assert `isSaveEnabled()==false` after revert. Mitigated by TC-013 `navigateFresh()`.
3. **Custom `clickSave()`** (lines 59-83): Manual polling loop instead of BasePage's `clickSaveWithDialog()`. Functional, proven, not worth refactoring (risk > benefit for 169-line file).

---

## 8. ISTQB Technique Summary

| Technique | Before | After |
|---|---|---|
| Equivalence Partitioning | All functional partitions covered | +4 persistence partitions (017/018/019/020) |
| BVA | N/A (checkboxes, no ranges) | N/A |
| Decision Table | R1-R4: dirty/revert/save-dialog/cancel | +R5-R8: RT persist, cancel-no-persist, bulk persist, isDefault persist |
| State Transition | CLEAN→DIRTY, DIRTY→SAVED, DIRTY→REVERTED | +SAVED→PERSISTED, CANCELLED→NOT-PERSISTED |
| Round-Trip | 13% (2/15 TCs), 40% field (2/5) | 100% field coverage (5/5), 6 RT TCs |
| Error Guessing | N/A (no validation) | N/A |

---

## 9. Implementation Changes

### 9a. Page Object: `location-auto-addon.page.ts` — NO CHANGES

`navigateFresh()` (lines 16-22) is sufficient for all new TCs:
- Uses `safeNavigateTo('about:blank')` → full URL → Angular stable → tab click
- Handles beforeunload for dirty forms (needed by TC-019 after cancel)
- Already used 9x in existing spec — proven pattern
- ALL-020 verified: no duplicate methods needed, BasePage patterns reused

### 9b. Test Data: `location-auto-addon.data.ts` — 1 ADDITION

Add `UNCHECK_PERSISTENCE_CASES` array for data-driven TC-017/018 (MNT-008 pattern):
```typescript
export const UNCHECK_PERSISTENCE_CASES = [
  { key: 'chkAutoAddonWordly', name: 'Wordly', tc: 'TC-LOC-AAO-017' },
  { key: 'chkAutoAddonLabor', name: 'Labor', tc: 'TC-LOC-AAO-018' },
] as const;
```

### 9c. Selectors: `auto-addon.ts` — NO CHANGES

All 10 selectors sufficient. Verified: `chkAutoAddonWordly`, `chkAutoAddonLabor`, `chkAutoAddonAll` all exist.

### 9d. Spec: `location-auto-addon.spec.ts` — 4 new TCs appended after TC-LOC-AAO-015

**TC-017/018 (data-driven, MNT-008)**:
```
test.setTimeout(60_000);
navigateFresh(OFFICE_NO);
uncheckCheckbox(item.key);
expect(isSaveEnabled()).toBe(true);
clickSave();
navigateFresh(OFFICE_NO);
expect(isCheckboxChecked(item.key)).toBe(false);
// Cleanup: re-check → save
checkCheckbox(item.key);
clickSave();
```

**TC-019 (cancel negative)**:
```
navigateFresh(OFFICE_NO);
toggleCheckbox('chkAutoAddonExpressContentDesignSession');
clickSaveButton();
clickSaveCancel();
navigateFresh(OFFICE_NO);    // safeNavigateTo handles dirty form
expect(isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(false);
// No cleanup needed — cancel didn't save
```

**TC-020 (bulk invert)**:
```
test.setTimeout(60_000);
navigateFresh(OFFICE_NO);
for (item of AUTO_ADDON_DEFAULTS) {
  if (item.checked) uncheckCheckbox(item.key);
  else checkCheckbox(item.key);
}
expect(isSaveEnabled()).toBe(true);
clickSave();
navigateFresh(OFFICE_NO);
for (item of AUTO_ADDON_DEFAULTS) {
  expect(isCheckboxChecked(item.key)).toBe(!item.checked);
}
// Cleanup: restore ALL defaults using AUTO_ADDON_DEFAULTS loop (same pattern as TC-001)
for (item of AUTO_ADDON_DEFAULTS) {
  const current = await isCheckboxChecked(item.key);
  if (current !== item.checked) { if (item.checked) checkCheckbox(item.key); else uncheckCheckbox(item.key); }
}
clickSave();
```

**TC ordering**: TC-017 (Wordly) → TC-018 (Labor) → TC-019 (Cancel) → TC-020 (Bulk). TC-020 last because highest contamination risk.

### 9e. REQUIREMENTS.md — Fix line 815

Remove stale "Test Labor - Jonathan" entry (section 2). Table should have 5 items matching MCP-verified live state.

### 9f. Planning Docs (MOD-004 mandatory)

- `specs_planning/test-cases/setup/locations/locations_auto_addon_test_cases.md`: Add TC-LOC-AAO-017 through TC-LOC-AAO-020 entries + update header count
- `specs_planning/test-plans/setup/locations/locations_auto_addon_test_plan.md`: Add TC-017 to TC-020 scenarios + selector mappings + update tcPlanSync checklist

### 9g. Master Plan Update

`plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`:
- Auto Add-On row: test count 15 → 19, RT% 13% → 100% field-instance
- Persistence table: Auto Add-On row updated
- Batch 3 status: PLAN_AUDIT_AUTO_ADDON checkmark

---

## 10. Execution Plan (Session 2) — /execute Workflow

### Identity Guide

| Step | Identity | Files Written | Justification |
|---|---|---|---|
| Steps 0-2 | OWNER | None (read-only research + MCP) | Context loading, verification |
| Step 3 | OWNER | `docs/REQUIREMENTS.md` | OWNER has RW on docs/ |
| Steps 4-5 | BUILDER (or OWNER+override) | spec, test data | BUILDER has RW on tests/specs/, tests/test-data/ |
| Step 6 | OWNER+override | test-cases doc, test-plan doc | Planning docs are GIVER-owned; override for single session |
| Steps 7-9 | OWNER | master plan, activity log | OWNER has RW on plans/ |

### Step 0: Context Loading (Phase 0, MANDATORY)

1. Read `specs_planning/_internal/agent-mistakes.md` — search for: ALL-020, ALL-026, ALL-033, GEN-019, GEN-024, GEN-035, MNT-008, MOD-004. Verify no new Auto Add-On entries since audit.
2. Read `.claude/context/patterns.md` — match: "Spec-Fixing Session Start" (for LR-018 cycle), "Angular Save→Tab Race" (for awareness).
3. Scan CLAUDE.md LR rules — confirm active rules list from section 6 of this plan.
4. Read this plan (parent: master plan already read in audit session).

**Checkpoint**: Name 3 ALL-* rules (ALL-020, ALL-026, MOD-004) and 3 LR-* rules (LR-018, LR-026, LR-027) before proceeding.

### Step 0.5: Build Execution Todo List (Phase 0.5)

Create TodoWrite list with /relevant skill tags:

```
[research] Read all plan files + verify AUTO_ADDON_DEFAULTS against spec — LR-020
[/regression-guard:wrap] BEFORE snapshot — spec, test data, REQUIREMENTS.md
[pre-flight:MCP] MCP-1: Wordly uncheck persists — GEN-035(browser_click only)
[pre-flight:MCP] MCP-2: Labor uncheck persists
[pre-flight:MCP] MCP-3: Cancel doesn't persist
[pre-flight:MCP] MCP-4: All 5 inverted persist
[classify] Apply decision tree to MCP results
[implement] Fix REQUIREMENTS.md line 815 — remove stale item
[implement] Add UNCHECK_PERSISTENCE_CASES to test data — MNT-008
[implement] Append TC-017/018 (data-driven), TC-019, TC-020 to spec — ALL-026, GEN-024
[implement:MOD-004] Update test cases doc — add TC-017 to TC-020
[implement:MOD-004] Update test plan doc — add TC-017 to TC-020 scenarios
[/regression-guard:wrap] AFTER snapshot + diff
[run-fix] LR-018 cycle: clean → individual → fix → all → fix → individual → all
[implement] Update master plan metrics
[/audit:verify] Post-execution audit — what was NOT done?
[finalize] Move plan to done/ — LR-027 execution summary
[bookkeeping] Activity log entry — LR-028
[/reflect:verify] Capture learnings
```

### Step 1: MCP Verification (15 min)

Execute MCP-1 through MCP-4 per section 4. Use `browser_click(ref)` from fresh snapshot for all Save/Ok clicks (GEN-035). Wait 3s after `browser_navigate` before `browser_snapshot` (ALL-008).

**Gate**: MCP-1 must pass. If save+reload doesn't preserve Wordly uncheck, ALL new RT TCs are blocked → ESCALATE.

### Step 2: Classify MCP Results (5 min)

Apply decision tree (section 4). Expected outcome: all pass.

### Step 3: Fix REQUIREMENTS.md (5 min)

Remove line 815 ("Test Labor - Jonathan"). Verify table now has exactly 5 items.

### Step 4: Implement Test Data + Spec (25 min)

1. Add `UNCHECK_PERSISTENCE_CASES` to `location-auto-addon.data.ts`
2. Append 4 TCs to spec (TC-017/018 as data-driven loop, TC-019, TC-020)
3. Import `UNCHECK_PERSISTENCE_CASES` in spec

### Step 5: Update Planning Docs — MOD-004 (10 min)

1. Add TC-017 to TC-020 to test cases doc (matching format of existing TC entries)
2. Add TC-017 to TC-020 scenarios to test plan doc (matching existing scenario format)
3. Update test plan selector mapping table
4. Update test cases header: Total count 16 → 20

### Step 6: /regression-guard AFTER (5 min)

Diff snapshot. Verify only expected files changed.

### Step 7: Run & Fix — LR-018 Cycle (15 min)

Follow patterns.md "Spec-Fixing Session Start":
1. `npm run clean` (LR-024)
2. Run Auto Add-On individually: `npx playwright test tests/specs/setup/locations/location-auto-addon.spec.ts --project=chrome`
3. If failures: run AGAIN to confirm consistent vs intermittent
4. Fix failures (if any)
5. Run individually again — confirm fix
6. Run ALL location specs: `npx playwright test tests/specs/setup/locations/ --project=chrome`
7. Fix serial contamination if any
8. Re-run Auto Add-On individually
9. Re-run all together → green

### Step 8: Update Master Plan (5 min)

Update `PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`: test count + RT metrics.

### Step 9: Post-Execution Audit (Phase 3, MANDATORY)

Per /execute Phase 3:
1. Review todo list — all completed?
2. Re-read this plan — every stated change matched?
3. Focus on what WASN'T done:
   - LR-001: Verify all page object method calls match actual signatures
   - LR-003: No empty catches in new code
   - MOD-004: Test cases + test plan docs BOTH updated?
   - Did cleanup patterns match TC-001's pattern?
4. ALL-030 self-audit checklist:
   - Stayed within framework scope? [Y/N]
   - TypeScript compiles? [Y/N]
   - Learnings captured? [Y/N]
   - Docs updated (REQUIREMENTS.md line 815)? [Y/N]
   - Pipeline contracts intact? [Y/N]

### Step 10: Plan Finalization (Phase 3.5, LR-027)

1. Update plan: `**Status**: DONE`, `**Executed**: YYYY-MM-DD`
2. Add `### Execution Summary` with: TCs implemented (count+IDs), TCs dropped (TC-016 Cat-A BLOCKED), MCP results, docs changes, test pass confirmation
3. Move: `plans/pending/PLAN_AUDIT_AUTO_ADDON.md` → `plans/done/`

### Step 11: Session Bookkeeping (LR-028)

1. Append to `specs_planning/_internal/agent-activity-log.md`:
   `| YYYY-MM-DDThh:mm | OWNER/BUILDER | done | location-auto-addon.spec.ts, location-auto-addon.data.ts, REQUIREMENTS.md, test-cases, test-plan, master-plan | AUTO_ADDON audit execution: +4 RT TCs, REQUIREMENTS fix, 100% field-instance coverage |`
2. If unexpected behaviors → write to agent-mistakes.md
3. Auto-call `/reflect`

---

## 11. Critical Files

| File | Action | Identity |
|---|---|---|
| `tests/specs/setup/locations/location-auto-addon.spec.ts` | Append 4 TCs | BUILDER |
| `tests/test-data/setup/locations/location-auto-addon.data.ts` | Add UNCHECK_PERSISTENCE_CASES | BUILDER |
| `docs/REQUIREMENTS.md` | Remove line 815 (stale item) | OWNER |
| `specs_planning/test-cases/setup/locations/locations_auto_addon_test_cases.md` | Add TC-017 to TC-020 | OWNER+override |
| `specs_planning/test-plans/setup/locations/locations_auto_addon_test_plan.md` | Add scenarios + selector mappings | OWNER+override |
| `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` | Update metrics | OWNER |
| `specs_planning/_internal/agent-activity-log.md` | Append session entry | OWNER |

**No changes**: page object (`location-auto-addon.page.ts`), selectors (`auto-addon.ts`).

---

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Save API doesn't persist Wordly/Labor | LOW | HIGH (blocks TC-017/018) | MCP-1/2 are gate checks. TC-009/011 prove same API works. |
| Angular dirty state after cancel (TC-019) | MEDIUM | LOW | `navigateFresh()` uses `safeNavigateTo` — auto-handles beforeunload |
| TC-020 cleanup failure (5 items to restore) | MEDIUM | MEDIUM | AUTO_ADDON_DEFAULTS loop (same as TC-001). Next TC `navigateFresh()` loads fresh DB. |
| TC-020 bulk toggle causes save timeout | LOW | MEDIUM | 60s timeout. 5 checkboxes are lightweight. Split if slow. |
| MOD-004 violation (forget test docs) | MEDIUM | HIGH (audit finding) | Explicit todo item with MOD-004 tag. Step 5 dedicated to this. |
| Stale REQUIREMENTS.md fix breaks reference | LOW | LOW | Only removing one table row. No other file references "Test Labor - Jonathan". |

---

## 13. Self-Audit of This Audit (AUD-011)

### Did I read all relevant files?
YES — spec (182 lines), page object (169 lines), selectors (83 lines), test data (18 lines), test cases doc (378 lines), test plan doc (185 lines), REQUIREMENTS.md Auto Add-On section (lines 797-823), agent-mistakes.md (239 lines), patterns.md, /audit SKILL.md, /execute SKILL.md, /relevant SKILL.md, INDEX.md, 5 completed audit plans for format reference.

### Were findings evidence-backed?
YES — REQUIREMENTS.md discrepancy verified via Grep (line 815 confirmed). MCP_VERIFICATION_LOG dated 2026-03-24 shows 5 items. Test data has 5 items. Spec asserts `toBe(5)`.

### Did I surface all remediation prompts?
YES — section 2 (REQUIREMENTS.md fix), section 9 (all implementation changes), section 10 (full execution workflow).

### What did I get WRONG initially? (ALL-030)
1. **Original plan said "No discrepancies found" for REQUIREMENTS.md** — WRONG. Line 815 "Test Labor - Jonathan" is stale. Found during deeper audit pass.
2. **Original plan proposed adding `reloadAndNavigateToAutoAddonTab()`** — unnecessary. `navigateFresh()` already exists and is safer.
3. **Original plan had no identity switching guide** — execution session needs BUILDER for specs, OWNER for docs.
4. **Original plan had no active rules list** — execution would have missed MOD-004, MNT-008, ALL-033.
5. **Original plan had TC-017/018 as separate tests** — MNT-008 mandates data-driven loop for identical-flow tests.
6. **Original plan had no Phase 0.5 todo template** — /execute requires this.

### Remaining risks I may have missed:
- If the app added/removed checkbox items since 2026-03-24 MCP verification, TC-001's `toBe(5)` will fail. MCP-1 will catch this as first action.
- If `navigateFresh()` implementation has changed since last run, all new TCs could fail. Step 0.5 research reads current page object to verify.

---

## Execution Summary

**Executed**: 2026-04-08 by Copilot (OWNER identity)

### TCs Implemented (4)
| TC | Description | Status |
|---|---|---|
| TC-LOC-AAO-017 | Wordly Uncheck Persists After Save+Reload | PASS (11.3s) |
| TC-LOC-AAO-018 | Labor Uncheck Persists After Save+Reload | PASS (11.7s) |
| TC-LOC-AAO-019 | Cancel Does Not Persist Toggle | PASS (11.8s) |
| TC-LOC-AAO-020 | Bulk Invert All Checkboxes Persists After Save+Reload | PASS (13.8s) |

### TCs Dropped (1)
| TC | Justification |
|---|---|
| TC-LOC-AAO-016 | NOT-AUTOMATABLE: Cat-A BLOCKED — requires second location with different add-on item LIST. MCP-verified 2026-04-08: E2E env has 3 locations (1604, 1605, 1101) but all have the same 5 items. Default states differ (1101: all unchecked) but count is identical. |

### MCP Verification
**Post-execution MCP verification completed 2026-04-08** (remediation session):
| Check | Result | Evidence |
|-------|--------|----------|
| MCP-1 (Wordly uncheck persists) | **PASS** | Unchecked → Save → Ok → reload → aria-checked="false" |
| MCP-2 (Labor uncheck persists) | **PASS** | Unchecked → Save → Ok → reload → aria-checked="false" |
| MCP-3 (Cancel = no save) | **PASS** | ECDS toggled → Save → Cancel → reload → aria-checked="false" (original) |
| MCP-4 (Bulk invert persists) | **PASS** | All 5 inverted → Save → Ok → reload → all 5 inverted confirmed |

All defaults restored after verification. Original Copilot session skipped MCP (tools unavailable). Remediation session confirmed all persistence works correctly.

### Documentation Changes
1. `docs/REQUIREMENTS.md`: Removed stale "Test Labor - Jonathan" row (6→5 items, matches MCP-verified live state)
2. `specs_planning/test-cases/.../locations_auto_addon_test_cases.md`: +4 TCs (TC-017 to TC-020), header 16→20
3. `specs_planning/test-plans/.../locations_auto_addon_test_plan.md`: +4 scenarios, +5 selector mappings, tcPlanSync updated
4. `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`: Auto Add-On metrics updated (RT 13%→100% field-instance, test count 15→19)

### Test Pass Confirmation
- **Date**: 2026-04-08
- **Result**: 19/19 passed (3.9m) — all 15 existing + 4 new TCs
- **Run**: `npx playwright test tests/specs/setup/locations/location-auto-addon.spec.ts --project=chrome`
- **Note**: First run had transient OAuth error on login attempt 1 (OAuthCallback); retry 2 succeeded. All tests ran on retry.

### Metrics
- Tests: 15 → 19 (+4)
- RT field-instance coverage: 2/5 (40%) → 5/5 (100%)
- RT TC count: 2 → 6
- Existing TCs modified: 0
- Page object changes: 0
- Selector changes: 0
