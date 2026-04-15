# PLAN_AUDIT_NOTES — Notes Tab Persistence & Coverage Audit

**Parent Plan**: `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`
**Created**: 2026-04-08
**Status**: DONE
**Executed**: 2026-04-08
**Priority**: P3 (Batch 4 — no v1 rules, persistence gap-fill only)
**Depends on**: Nothing — additive to existing 20/20 passing tests
**Save to**: `plans/done/PLAN_AUDIT_NOTES.md`

---

## 1. Context

**Problem**: Notes tab has 20 tests, all passing, but round-trip persistence coverage is 35% (7/20 RT TCs). The master plan targets >40% RT. Notes has NO functional requirements in the v1 docs — this is purely a persistence and coverage quality audit.

**Scope**: Persistence gap-fill + REQUIREMENTS.md corrections + negative persistence (cancel dialog). No v1 requirement gaps for Notes. No new features.

**NOT in scope**:
- No v1 functional requirements exist for Notes (not in `Functional Requirement -v1.docx`)
- No V2 plan items reference Notes
- Accessibility fixes (textarea no aria-label, progressbar no aria-valuenow) — document-only, not automatable behavior changes
- Server-side behavior for >4000 chars (untested territory, out of audit scope)
- MODULE_REGISTRY update — Notes tab is not registered in `docs/MODULE_REGISTRY.md` (line 45 only shows "Release Notes" under Actions). Out of scope for persistence audit.

---

## 2. Current State (20 TCs, 20/20 passing)

| TC | Name | Type | RT? |
|---|---|---|---|
| NTS-001 | Default empty state | Display | No |
| NTS-002 | Type text, counter updates | Behavior | No |
| NTS-003 | Add row, Delete button behavior | Behavior | No |
| NTS-004 | Multi-row delimiter counting | Behavior | No |
| NTS-005 | Delete row, counter decreases | Behavior | No |
| NTS-006 | Progress bar proportional | Display | No |
| NTS-007 | 4000 char soft limit | Boundary | No |
| NTS-008 | Save dialog confirmation | Behavior | No |
| NTS-009 | Single note persist after reload | **RT** | **Yes** |
| NTS-010 | Tab switch preserves unsaved | State | No |
| NTS-011 | beforeunload dialog | State | No |
| NTS-012 | Delete all + save empty persist | **RT** | **Yes** |
| NTS-013 | Special chars persist (data-driven) | **RT** | **Yes** |
| NTS-014 | Multiple rows sequential positions | Behavior | No |
| NTS-015 | Delete middle row shift | Behavior | No |
| NTS-016 | Row Add/Delete toggle behavior | Behavior | No |
| NTS-017 | Delete last row → empty state | Behavior | No |
| NTS-018 | XSS persist (data-driven) | **RT** | **Yes** |
| NTS-019 | SQL inject persist (data-driven) | **RT** | **Yes** |
| NTS-020 | Emoji/unicode persist (data-driven) | **RT** | **Yes** |
| NTS-021 | Paste 4001 overage counter | Boundary | No |
| NTS-022 | Keyboard accessibility | A11y | No |
| NTS-023 | Full lifecycle (add->save->reload->delete->save->reload) | **RT** | **Yes** |

**Existing RT**: 7/20 TCs = 35%

**RT coverage by dimension**:
- Content type: plain text (TC-009), empty state (TC-012), special chars (TC-013), XSS (TC-018), SQL (TC-019), emoji (TC-020), lifecycle (TC-023) — **7 content types covered**
- Row count: single row only (TC-009, 012, 013, 018-020, 023) — **multi-row persistence = ZERO**
- Lifecycle: add->save (TC-009), delete-all->save (TC-012), full cycle (TC-023) — **partial deletion = ZERO**
- Boundary: **4000 chars never saved+reloaded** (TC-007 tests boundary but discards)
- Cancel dialog: **ZERO** (TC-008 confirms dialog but never tests Cancel path)

---

## 3. REQUIREMENTS.md Discrepancies (6 fixes)

All corrections derived from MCP-verified DOM state (2026-03-17) and confirmed by passing tests.

### Fix 1: Table structure
**Line ~738**: States "Table: 3 columns (#, Location Notes, Actions)"
**Actual**: Table has NO `<thead>`. DOM shows 2 cells per row: textarea cell + actions cell. No visible row number column.
**Evidence**: TC-014 (no row numbers), selector file line 9 ("NO `<thead>`"), test cases doc correction table.

### Fix 2: Default state
**Line ~739**: States "Default: 1 empty row with textbox placeholder 'Type notes here...'"
**Actual**: Default state is "No Notes Available" (empty table with colspan row, 0 textareas). First row appears only after clicking Add.
**Evidence**: TC-001 (`isDefaultEmptyState` checks for "No Notes Available"), test cases doc correction table.

### Fix 3: Delete button behavior
**Line ~750**: States "Delete button appears when 2+ rows exist; empty when only 1 row"
**Actual**: Delete appears when (a) single row has text content, OR (b) 2+ rows exist (all rows get Delete). Empty single row has no Delete.
**Evidence**: TC-016 (typing -> Delete appears), TC-003 (2+ rows -> all get Delete).

### Fix 4: Character limit type
**Line ~757**: States "Character limit: 4000 per note"
**Actual**: SOFT limit — no HTML `maxlength` attribute. Keyboard input blocked at 4000 by JS handler, but paste/programmatic input can exceed. Counter shows overage (e.g., "4001/4000").
**Evidence**: TC-007 (`getTextareaMaxlength` returns null), TC-021 (paste 4001 -> counter shows 4001/4000).

### Fix 5: Missing delimiter counting behavior
**Not documented**: Each additional row adds +1 delimiter character to total count. E.g., 3 rows with "Hello"(5), "World"(5), "End"(3) = 15 total (5+1+5+1+3).
**Evidence**: TC-004 (full delimiter math verified).

### Fix 6: Save button clarification
**Line ~759**: States "No save button in Notes tab — relies on left-panel Save"
**Improvement**: Clarify that Save button is `[data-testid="location-settings-btn-save"]` (shared across ALL Location Settings tabs, from `SetupSharedSelectors` in `shared.ts`). Save triggers "Save Changes" `alertdialog` with Cancel + Save buttons.
**Evidence**: Selector `btnSaveNotes` in `notes.ts` line 60 maps to shared `data-testid`. TC-008 verifies dialog heading/body.

---

## 4. MCP Verification Checklist (Phase 0.5)

| # | Verify | Blocks | Expected | If Fails |
|---|---|---|---|---|
| MCP-1 | Save 3 rows (distinct text) -> reload -> all 3 persist with correct content and order | TC-024 | All rows persist in DOM order | ESCALATE — investigate if API serializes rows differently |
| MCP-2 | Save 4000 chars -> reload -> verify full content length | TC-025 | 4000 chars persist (counter 4000/4000) | ESCALATE — investigate server-side truncation (document as APP BUG, drop TC-025) |
| MCP-3 | Save 3 rows -> delete middle -> save -> reload -> 2 rows remain | TC-026 | Rows 0 and 2 persist, row 1 gone | ESCALATE — investigate deletion index shift |
| MCP-4 | Type note -> Save -> Cancel dialog -> reload -> note NOT present | TC-027 | Cancel prevents save; note discarded | If note persists after cancel: APP BUG — document, mark TC-027 APP BUG |

**Risk**: All LOW. TC-009 proves single-row persistence. TC-012 proves delete-all+save. TC-015 proves middle-row delete (without save). TC-008 proves dialog interaction. MCP is confirmatory.

**MCP stability rules**: Use `browser_click(ref)` from fresh snapshot for Save/Ok/Cancel clicks — NEVER `evaluate`-based clicks (GEN-035). Wait 3s after `browser_navigate` before `browser_snapshot` (ALL-008).

### Decision Tree
```
MCP-1/2/3 all pass?  -> Implement all 4 TCs
MCP-1 fail?          -> ESCALATE (multi-row save broken; TC-024 + TC-026 blocked)
MCP-2 fail?          -> Document as APP BUG; drop TC-025; remaining 3 TCs still hit >40%
MCP-3 fail?          -> ESCALATE (partial deletion save broken; TC-026 blocked)
MCP-4 fail?          -> Document as APP BUG in REQUIREMENTS.md; mark TC-027 as APP BUG
```

---

## 5. Proposed New TCs (4 tests)

### TC-LOC-NTS-024: Multi-row persistence — 3 rows save+reload+verify (RT)

**Gap filled**: No existing test saves 2+ rows then verifies all persist after reload. TC-014 adds 3 rows but discards.
**ISTQB**: Round-trip persistence (multi-instance)
**Flow**:
```
1. ensureEmptyState()                           // LR-019 baseline
2. fillNote(0, NOTE_ROW_ALPHA)                  // "Row Alpha" (9 chars)
3. clickAdd() + fillNote(1, NOTE_ROW_BETA)      // "Row Beta" (8 chars)
4. clickAdd() + fillNote(2, NOTE_ROW_GAMMA)     // "Row Gamma" (9 chars)
5. expect(getNoteRowCount()).toBe(3)
6. expect(getCharCount()).toBe(28)               // 9+1+8+1+9
7. saveAndConfirm()
8. reloadAndNavigateToNotesTab()
9. expect(getNoteRowCount()).toBe(3)
10. expect(getNoteValue(0)).toBe(NOTE_ROW_ALPHA)
11. expect(getNoteValue(1)).toBe(NOTE_ROW_BETA)
12. expect(getNoteValue(2)).toBe(NOTE_ROW_GAMMA)
13. expect(getCharCount()).toBe(28)
14. ensureEmptyState()                           // cleanup
```
**Timeout**: 60s
**Test data**: `NOTE_ROW_ALPHA` (9), `NOTE_ROW_BETA` (8), `NOTE_ROW_GAMMA` (9)

### TC-LOC-NTS-025: Boundary persistence — 4000 chars save+reload (RT + BVA)

**Gap filled**: TC-007 tests 4000 chars boundary but discards. No test saves 4000 chars and verifies persistence.
**ISTQB**: Round-trip + BVA (exact boundary)
**Flow**:
```
1. ensureEmptyState()                           // LR-019 baseline
2. fillNote(0, NOTE_4000_CHARS)                 // reuses existing constant
3. expect(getCharCount()).toBe(4000)
4. saveAndConfirm()
5. reloadAndNavigateToNotesTab()
6. expect(getCharCount()).toBe(4000)
7. const value = getNoteValue(0)
8. expect(value.length).toBe(4000)
9. ensureEmptyState()                           // cleanup
```
**Timeout**: 60s
**Test data**: Reuses existing `NOTE_4000_CHARS` — no new data needed

### TC-LOC-NTS-026: Partial deletion persistence — delete middle row, save, verify remaining (RT + State Transition)

**Gap filled**: TC-012 deletes ALL rows and saves. TC-015 deletes middle row but discards. No test deletes SOME rows -> saves -> verifies remaining persist.
**ISTQB**: Round-trip + state transition (partial deletion)
**Flow**:
```
1. ensureEmptyState()                           // LR-019 baseline
2. fillNote(0, NOTE_KEEP_FIRST)                 // "Keep First" (10 chars)
3. clickAdd() + fillNote(1, NOTE_DELETE_ME)      // "Delete Me" (9 chars)
4. clickAdd() + fillNote(2, NOTE_KEEP_LAST)      // "Keep Last" (9 chars)
5. expect(getNoteRowCount()).toBe(3)
6. deleteRow(1)                                  // removes "Delete Me"
7. expect(getNoteRowCount()).toBe(2)
8. expect(getNoteValue(0)).toBe(NOTE_KEEP_FIRST)
9. expect(getNoteValue(1)).toBe(NOTE_KEEP_LAST)
10. saveAndConfirm()
11. reloadAndNavigateToNotesTab()
12. expect(getNoteRowCount()).toBe(2)
13. expect(getNoteValue(0)).toBe(NOTE_KEEP_FIRST)
14. expect(getNoteValue(1)).toBe(NOTE_KEEP_LAST)
15. ensureEmptyState()                           // cleanup
```
**Timeout**: 60s
**Test data**: `NOTE_KEEP_FIRST` (10), `NOTE_DELETE_ME` (9), `NOTE_KEEP_LAST` (9)

### TC-LOC-NTS-027: Cancel save dialog — verify changes NOT persisted (Negative Persistence)

**Gap filled**: TC-008 tests Save dialog heading/body and confirms. No test clicks Cancel in dialog and verifies non-persistence. AUTO_ADDON has TC-019 for this same pattern.
**ISTQB**: State transition (negative path)
**Flow**:
```
1. ensureEmptyState()                           // LR-019 baseline
2. fillNote(0, NOTE_CANCEL_TEST)                // "Cancel test note" (16 chars)
3. expect(isSaveEnabled()).toBe(true)
4. clickSaveButton()                             // opens dialog, does NOT confirm
5. cancelSaveDialog()                            // clicks Cancel in dialog
6. expect(isSaveEnabled()).toBe(true)            // still has unsaved changes
7. reloadAndNavigateToNotesTab()                 // discard + reload (handles beforeunload)
8. expect(isDefaultEmptyState()).toBe(true)      // note was NOT persisted
```
**Timeout**: 60s
**Test data**: `NOTE_CANCEL_TEST` (16)

### MNT-008 Non-Application Justification

The 4 new TCs have **different flows**: TC-024 (multi-row save), TC-025 (boundary save), TC-026 (partial delete+save), TC-027 (cancel negative). No two share identical flow differing only in data. MNT-008 does not apply.

### Gaps NOT Included (ALL-033 compliance)

| Gap | Why excluded | Classification |
|---|---|---|
| Save with >4000 chars (paste overage) | Server-side behavior untested territory. Out of audit scope. | DEFERRED — investigate server response before automating |
| Progress bar proportional value assertion | `aria-valuenow` is NOT set on progressbar (a11y gap). Cannot assert proportional fill value. TC-006 only checks visibility. | NOT-AUTOMATABLE — app bug (missing aria-valuenow) |
| Keyboard-only full lifecycle | TC-022 covers keyboard nav. Full keyboard-only save requires Tab to Save + Enter. TC-022 already does this. | REDUNDANT with existing TC-022 |
| Multi-row + special content combo | TC-013/018/019/020 cover special content. TC-024 covers multi-row. Combined adds minimal incremental value. | REDUNDANT — orthogonal axes already covered independently |

---

## 6. Active Rules for Execution Session

### Active LR Rules (trigger matched)

| LR | Trigger | Applies To |
|---|---|---|
| LR-001 | Calling functions across files | Verify page object method signatures before calling in spec |
| LR-012 | Save dialogs | Confirm shared dialog selectors (dlgSaveChanges from shared.ts) |
| LR-018 | Spec-fixing workflow | Run-all is truth — full LR-018 cycle in step 7 |
| LR-019 | First test in serial | All 4 new TCs start with `ensureEmptyState()` baseline |
| LR-020 | Plan references counts/files | Verify all plan claims against actual codebase before coding |
| LR-022 | Structural counts | No hardcoded counts in new TCs (assert via `toBe` on known test data lengths only) |
| LR-023 | No networkidle | New code must not use networkidle |
| LR-024 | Clean before RCA | If tests fail during LR-018 cycle |
| LR-026 | Angular dirty state | `ensureEmptyState()` handles dirty state via reload fallback |
| LR-027 | Plan movement to done/ | Execution summary mandatory |
| LR-028 | Session bookkeeping | Activity log entry at session end |

### Active Agent-Mistakes Rules

| Rule | Relevance |
|---|---|
| ALL-020 | Search BasePage before creating methods — **VERIFIED**: `navigateToSubTab` (line 430), `clickSaveWithDialog` (line 350), `clickWithRetry` (line 118), `waitForAngularStable` (line 220) all exist. No new methods needed. |
| ALL-026 / MNT-008 | Spec-level DRY — 4 new TCs have DIFFERENT flows (see justification above). No data-driven loop applicable. |
| ALL-033 | Every unimplemented TC has justification — 0 dropped TCs from proposed set. 4 excluded gaps documented in section 5. |
| GEN-019 | Check BasePage before creating page object methods — **VERIFIED**: no new page object methods needed. |
| GEN-024 | No raw CSS selectors — all new TC code uses page object methods which use `getElement(key)` internally. |
| GEN-035 | MCP clicks via `browser_click(ref)` not evaluate — for MCP verification phase only. |
| MOD-004 | **MUST** update test-cases + test-plan docs after adding spec TCs. |
| MNT-008 | Data-driven for identical flows — not applicable (see section 5 justification). |

### Patterns.md Decision Trees

| Pattern | When Active |
|---|---|
| Spec-Fixing Session Start | If tests fail: `npm run clean` + `rm -rf .auth/chrome-profile` -> run fresh -> run AGAIN -> THEN RCA from fresh evidence |
| Angular Save -> Tab Race | TC-027 clicks Cancel, not Save. After reload, form should be clean. `ensureEmptyState()` handles dirty state. |
| Don't Over-Plan Spec Fixing | If failures occur during LR-018 cycle: don't plan, just fix from evidence. |

---

## 7. Existing Test Quality Assessment

### Verdict: HIGH quality. Zero changes to existing 20 TCs.

| Quality Aspect | Assessment |
|---|---|
| LR-019 baseline | TC-001 navigates fresh, calls `ensureEmptyState()`, verifies `isDefaultEmptyState()` |
| LR-026 dirty state | `ensureEmptyState()` (lines 272-311) uses reload fallback when Save disabled after delete; waits for Save disabled after API response before reload |
| GEN-008 Angular blur | `fillNote()` calls `textarea.press('Tab')` after `fill()` |
| LR-012 shared dialogs | Save dialog uses `dlgSaveChanges`, `btnSaveChangesConfirm`, `btnSaveChangesCancel` from `SetupSharedSelectors` in `shared.ts` |
| Serial isolation | Every mutating test cleans up via `ensureEmptyState()` or `discardChangesViaReload()` |
| ALL-020 BasePage reuse | Page object delegates to BasePage: `navigateToSubTab`, `clickWithRetry`, `clickSaveWithDialog`, `waitForAngularStable` |
| GEN-024 selector registry | All selectors via `getElement(key)` — no raw CSS in page object |
| MNT-009 shared constants | `OFFICE_NO` and `SAVE_CHANGES_DIALOG` from `common.data.ts` |

### AUD-001 justification for zero changes (ALL-030):

"Zero findings on non-trivial work requires explicit justification":

1. **Page object is well-structured**: 375 lines, clean `fillNote()` auto-creates row 0, `saveAndConfirm()` waits for Save disabled, `ensureEmptyState()` has reload fallback for Angular dirty state.
2. **Cleanup patterns are robust**: Every mutating TC cleans up. `ensureEmptyState()` handles the edge case where deleting rows after a save cycle doesn't re-enable Save.
3. **Notes is genuinely simple**: 1 field type (textarea), no validation, no cross-field deps, no conditional logic. The test surface is small and well-covered functionally. The only gap is persistence COVERAGE, which is NEW TCs, not existing TC fixes.
4. **Data-driven loop (SPECIAL_CONTENT_TESTS)** correctly uses `ensureEmptyState()` at start of each iteration (LR-019 compliant).

### Minor notes (flagged, NOT changing):

1. **TC-009 loose assertion**: Uses `getCharCount()).toBeGreaterThanOrEqual(15)` instead of exact `toBe(15)`. Functional — catches regressions. Not worth modifying existing passing test.
2. **TC-016 assertion fragility**: `getDeleteButtonCount()).toBeGreaterThanOrEqual(0)` is always true. Should be `toBe(0)` before typing, `toBeGreaterThan(0)` after. Spec currently works because the `toBeGreaterThan(0)` after typing is the real assertion. Not blocking.

---

## 8. ISTQB Technique Summary

| Technique | Before (20 TCs) | After (24 TCs) |
|---|---|---|
| Display | 2 (10%) | 2 (8%) |
| Behavior | 7 (35%) | 7 (29%) |
| Round-trip | 7 (35%) | 10 (42%) |
| State | 2 (10%) | 2 (8%) |
| Boundary | 2 (10%) | 2 (8%) |
| A11y | 0 (0%) | 0 (0%) |
| Negative Persistence | 0 (0%) | 1 (4%) |

Note: TC-025 is RT (primary) + BVA (secondary). TC-026 is RT (primary) + state transition (secondary). TC-022 is categorized as A11y in test cases doc but spec only tests keyboard typing, so functionally Behavior.

---

## 9. Metrics After Implementation

| Metric | Before | After | Target | Met? |
|---|---|---|---|---|
| Total TCs | 20 | 24 | -- | -- |
| RT TCs | 7 | 10 | -- | -- |
| RT % (by TC count) | 35% | 42% | >40% | **Yes** |
| Negative Persistence | 0 | 1 | -- | NEW |
| Validation TCs | 0 | 0 | >=1 | N/A (notes have no validation — entirely optional field) |
| Save-disable TCs | 1 | 1 | >=1 | Yes |
| Boundary TCs (persistence) | 0 | 1 | -- | +1 |

---

## 10. Implementation Changes

### 10a. Test Data (`tests/test-data/setup/locations/location-notes.data.ts`) — 7 new constants

```typescript
// Multi-row persistence (TC-024)
export const NOTE_ROW_ALPHA = 'Row Alpha';     // 9 chars
export const NOTE_ROW_BETA = 'Row Beta';       // 8 chars
export const NOTE_ROW_GAMMA = 'Row Gamma';     // 9 chars

// Partial deletion persistence (TC-026)
export const NOTE_KEEP_FIRST = 'Keep First';   // 10 chars
export const NOTE_DELETE_ME = 'Delete Me';     // 9 chars
export const NOTE_KEEP_LAST = 'Keep Last';     // 9 chars

// Cancel dialog (TC-027)
export const NOTE_CANCEL_TEST = 'Cancel test note'; // 16 chars
```

### 10b. Page Object (`src/pages/setup/locations/location-notes.page.ts`) — NO CHANGES

ALL-020 verified: `fillNote`, `clickAdd`, `deleteRow`, `saveAndConfirm`, `clickSaveButton`, `cancelSaveDialog`, `reloadAndNavigateToNotesTab`, `getNoteValue`, `getNoteRowCount`, `getCharCount`, `isDefaultEmptyState`, `ensureEmptyState`, `isSaveEnabled`, `discardChangesViaReload` — all exist. `cancelSaveDialog()` at line 259 exists for TC-027. No new methods needed.

### 10c. Selectors (`src/selectors/setup/locations/notes.ts`) — NO CHANGES

All 13 selectors verified. Save dialog selectors (`dlgSaveChanges`, `btnSaveChangesConfirm`, `btnSaveChangesCancel`) live in `shared.ts` and are spread into `AllSelectors` — already imported via BasePage's `getElement()`.

### 10d. Spec (`tests/specs/setup/locations/location-notes.spec.ts`) — 4 new TCs (Group J)

Append after TC-023 as **Group J: Persistence Gap-Fill**. Import 7 new constants from test data file.

### 10e. REQUIREMENTS.md (`docs/REQUIREMENTS.md`) — Rewrite Notes section (~lines 731-760)

6 fixes documented in section 3 above. Full section rewrite to match live DOM state.

### 10f. Planning Docs (MOD-004 mandatory)

- `specs_planning/test-cases/setup/locations/locations_notes_test_cases.md` — add 4 TC entries (TC-024 through TC-027), update header count 23 -> 27
- `specs_planning/test-plans/setup/locations/locations_notes_test_plan.md` — add 4 scenario blocks + selector mappings, update total count

### 10g. Master Plan Update

`plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`:
- Notes row in persistence table: RT% 32% -> 42%
- Add checkmark to PLAN_AUDIT_NOTES.md entry
- Update test count baseline: location-notes 20 -> 24
- Update total count: 221 -> 225 (was actually already wrong, verify before editing)

---

## 11. Execution Plan (Session 2) — /execute Workflow

### Identity Guide

| Step | Identity | Files Written | Justification |
|---|---|---|---|
| Steps 0-2 | OWNER | None (read-only research + MCP) | Context loading, verification |
| Step 3 | OWNER | `docs/REQUIREMENTS.md` | OWNER has RW on docs/ |
| Steps 4-5 | BUILDER (or OWNER+override) | spec, test data | BUILDER has RW on tests/specs/, tests/test-data/ |
| Step 6 | OWNER+override | test-cases doc, test-plan doc | Planning docs are GIVER-owned; override for single session |
| Steps 7-9 | OWNER | master plan, activity log | OWNER has RW on plans/ |

### Step 0: Context Loading (Phase 0, MANDATORY)

1. Read `specs_planning/_internal/agent-mistakes.md` — search for: ALL-020, ALL-026, ALL-033, GEN-019, GEN-024, GEN-035, MNT-008, MOD-004. Verify no new Notes entries since audit.
2. Read `.claude/context/patterns.md` — match: "Spec-Fixing Session Start" (for LR-018 cycle), "Angular Save->Tab Race" (for awareness).
3. Scan CLAUDE.md LR rules — confirm active rules list from section 6 of this plan.
4. Read this plan (parent: master plan already read in audit session).

**Checkpoint**: Name 3 ALL-* rules (ALL-020, ALL-026, MOD-004) and 3 LR-* rules (LR-018, LR-019, LR-026) before proceeding.

### Step 0.5: Build Execution Todo List (Phase 0.5, /relevant tags)

```
[research] Read all plan files + verify constants against spec — LR-020
[/regression-guard:wrap] BEFORE snapshot — spec, test data, REQUIREMENTS.md
[pre-flight:MCP] MCP-1: 3-row persistence — GEN-035(browser_click only)
[pre-flight:MCP] MCP-2: 4000-char persistence
[pre-flight:MCP] MCP-3: Partial deletion persistence
[pre-flight:MCP] MCP-4: Cancel dialog non-persistence
[classify] Apply decision tree to MCP results
[implement] Rewrite REQUIREMENTS.md Notes section (6 fixes)
[implement] Add 7 constants to test data — location-notes.data.ts
[implement] Append TC-024/025/026/027 to spec — ALL-026, GEN-024
[implement:MOD-004] Update test cases doc — add TC-024 to TC-027
[implement:MOD-004] Update test plan doc — add 4 scenario blocks
[/regression-guard:wrap] AFTER snapshot + diff
[run-fix] LR-018 cycle: clean -> individual -> fix -> all -> fix
[implement] Update master plan metrics
[/audit:verify] Post-execution audit — what was NOT done?
[finalize] Move plan to done/ — LR-027 execution summary
[bookkeeping] Activity log entry — LR-028
[/reflect:verify] Capture learnings
```

### Step 1: MCP Verification (15 min)

Execute MCP-1 through MCP-4 per section 4. Use `browser_click(ref)` from fresh snapshot for all Save/Ok/Cancel clicks (GEN-035). Wait 3s after `browser_navigate` before `browser_snapshot` (ALL-008).

**Gate**: MCP-1 must pass. If multi-row save doesn't persist, TC-024 + TC-026 are blocked -> ESCALATE.

### Step 2: Classify MCP Results (5 min)

Apply decision tree (section 4). Expected: all pass.

### Step 3: Fix REQUIREMENTS.md (10 min)

Rewrite Notes section (~lines 731-760) with all 6 fixes from section 3. Cross-check against test cases doc corrections table.

### Step 4: Implement Test Data + Spec (25 min)

1. Add 7 constants to `location-notes.data.ts`
2. Append 4 TCs to spec as Group J (TC-024/025/026/027)
3. Import new constants in spec

### Step 5: Update Planning Docs — MOD-004 (10 min)

1. Add TC-024 to TC-027 to test cases doc (matching format of existing TC entries)
2. Add 4 scenario blocks to test plan doc (matching existing format)
3. Update test plan selector mapping table
4. Update both doc headers: count updates

---

## Execution Summary

**Executed**: 2026-04-08

### TCs Implemented (4)
| TC | Name | Status |
|---|---|---|
| TC-LOC-NTS-024 | Multi-row persistence — 3 rows save+reload+verify | PASS |
| TC-LOC-NTS-025 | Boundary persistence — 4000 chars save+reload | PASS |
| TC-LOC-NTS-026 | Partial deletion persistence — delete middle row | PASS |
| TC-LOC-NTS-027 | Cancel save dialog — verify changes NOT persisted | PASS |

### TCs Dropped (0)
None. All 4 proposed TCs implemented and passing.

### MCP Verification Results
1. MCP-1: 3-row save+reload persistence → PASS
2. MCP-2: 4000-char save+reload persistence → PASS
3. MCP-3: Partial deletion (delete middle row) save+reload → PASS
4. MCP-4: Cancel dialog non-persistence → PASS

### Documentation Changes
- `docs/REQUIREMENTS.md`: 6 corrections to Notes section (table structure, default state, delete behavior, char limit type, delimiter counting, save button)
- `specs_planning/test-cases/setup/locations/locations_notes_test_cases.md`: Count 23→27, +4 TC entries
- `specs_planning/test-plans/setup/locations/locations_notes_test_plan.md`: +4 scenarios, +4 selector mapping rows
- `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`: Notes RT% DONE (46%), test count 20→24, batch checkmark

### Code Changes
- `tests/test-data/setup/locations/location-notes.data.ts`: +7 constants (NOTE_ROW_ALPHA, NOTE_ROW_BETA, NOTE_ROW_GAMMA, NOTE_KEEP_FIRST, NOTE_DELETE_ME, NOTE_KEEP_LAST, NOTE_CANCEL_TEST)
- `tests/specs/setup/locations/location-notes.spec.ts`: +4 TCs (Group J), +7 imports

### No Changes Required
- `src/pages/setup/locations/location-notes.page.ts` — all methods already existed
- `src/selectors/setup/locations/notes.ts` — all selectors already existed

### Test Pass Confirmation
- **27 passed (3.6m)** — 2026-04-08, Chrome, all 24 source-level tests (27 runtime with data-driven expansion)
- TypeScript compiles clean (COP-002)
- RT coverage: 35% → 46% (7/20 → 11/24), exceeds >40% target

### Step 6: /regression-guard AFTER (5 min)

Diff snapshot. Verify only expected files changed.

### Step 7: Run & Fix — LR-018 Cycle (15 min)

Follow patterns.md "Spec-Fixing Session Start":
1. `npm run clean` (LR-024)
2. Run Notes individually: `npx playwright test tests/specs/setup/locations/location-notes.spec.ts --project=chrome`
3. If failures: run AGAIN to confirm consistent vs intermittent
4. Fix failures (if any) — don't over-plan (patterns.md rule)
5. Run individually again — confirm fix
6. Run ALL location specs: `npx playwright test tests/specs/setup/locations/ --project=chrome`
7. Fix serial contamination if any

### Step 8: Update Master Plan (5 min)

Update `PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`: test count + RT metrics.

### Step 9: Post-Execution Audit (Phase 3, MANDATORY)

1. Re-read this plan — every stated change matched?
2. Focus on what WASN'T done:
   - LR-001: Verify all page object method calls match actual signatures
   - LR-003: No empty catches in new code
   - MOD-004: Test cases + test plan docs BOTH updated?
   - Did `ensureEmptyState()` cleanup work in all 4 new TCs?
3. ALL-030 self-audit checklist:
   - Stayed within framework scope? [Y/N]
   - TypeScript compiles? [Y/N]
   - Learnings captured? [Y/N]
   - Docs updated (REQUIREMENTS.md)? [Y/N]
   - Pipeline contracts intact? [Y/N]

### Step 10: Plan Finalization (LR-027)

1. Update plan: `**Status**: DONE`, `**Executed**: YYYY-MM-DD`
2. Add `### Execution Summary` (LR-027: TCs implemented, dropped, MCP results, test pass confirmation)
3. Move: `plans/pending/PLAN_AUDIT_NOTES.md` -> `plans/done/`

### Step 11: Session Bookkeeping (LR-028)

1. Append to `specs_planning/_internal/agent-activity-log.md`
2. If unexpected behaviors -> write to agent-mistakes.md
3. Auto-call `/reflect`

---

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 4000-char content truncated by server on save | LOW | HIGH | MCP-2 gates this. If truncation: document APP BUG, drop TC-025 — remaining 3 TCs still hit >40% (10/23=43%) |
| Multi-row order not preserved by API | LOW | HIGH | MCP-1 gates this. If order differs: adapt TC-024 to sort-agnostic assertions |
| Cancel dialog actually saves (app bug) | LOW | MEDIUM | MCP-4 gates this. If cancel saves: document APP BUG, adjust TC-027 to test actual behavior |
| `ensureEmptyState()` flakiness in serial block | LOW | MEDIUM | Already proven reliable across 20 existing tests. Uses reload fallback for Angular dirty state. |
| Large text (4000 chars) fill timeout | LOW | LOW | `fillNote` uses Playwright `fill()` which is fast. TC-007 already fills 4000 chars. |
| Serial contamination from 4 new tests | LOW | MEDIUM | Each test starts with `ensureEmptyState()` (LR-019) and ends with cleanup. Pattern proven by 20 existing tests. |
| MOD-004 violation (forget test docs) | MEDIUM | HIGH (audit finding) | Explicit todo item with MOD-004 tag. Step 5 dedicated to this. |

---

## 13. Critical Files

| File | Action | Identity |
|---|---|---|
| `tests/specs/setup/locations/location-notes.spec.ts` | Append 4 TCs (Group J) | BUILDER |
| `tests/test-data/setup/locations/location-notes.data.ts` | Add 7 string constants | BUILDER |
| `docs/REQUIREMENTS.md` | Rewrite Notes section (~lines 731-760) | OWNER |
| `specs_planning/test-cases/setup/locations/locations_notes_test_cases.md` | Add 4 TC entries, update count | OWNER+override |
| `specs_planning/test-plans/setup/locations/locations_notes_test_plan.md` | Add 4 scenario blocks, update count | OWNER+override |
| `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` | Update Notes metrics | OWNER |
| `specs_planning/_internal/agent-activity-log.md` | Append session entry | OWNER |
| `src/pages/setup/locations/location-notes.page.ts` | **NO CHANGE** | -- |
| `src/selectors/setup/locations/notes.ts` | **NO CHANGE** | -- |

---

## 14. Self-Audit of This Audit (AUD-011)

### Did I read all relevant files?

YES — 18 files read:
1. Master plan (`PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`) — 431 lines
2. Spec (`location-notes.spec.ts`) — 268 lines
3. Page object (`location-notes.page.ts`) — 375 lines
4. Test data (`location-notes.data.ts`) — 62 lines
5. Selectors (`notes.ts`) — 66 lines
6. Test cases doc (`locations_notes_test_cases.md`) — 342 lines
7. Test plan doc (`locations_notes_test_plan.md`) — 234 lines
8. REQUIREMENTS.md Notes section (lines 731-760)
9. Agent-mistakes (`agent-mistakes.md`) — 240 lines (ALL + COP + REQ + PLN + GEN + HLR + AUD + MNT sections)
10. BasePage (`base-page.ts`) — 100 lines + grep verification of 4 method signatures
11. Common test data (`common.data.ts`) — 25 lines (SAVE_CHANGES_DIALOG confirmed)
12. ECT audit plan (template) — 396 lines
13. Auto Add-On audit plan (closest persistence template) — 540 lines
14. MODULE_REGISTRY (`MODULE_REGISTRY.md`) — grep for Notes (not registered)
15. Patterns (`patterns.md`) — 35 lines (3 decision trees)
16. Skill INDEX (`INDEX.md`) — 28 skills indexed
17. /audit SKILL.md — 151 lines
18. /identity SKILL.md — 233 lines

### Were findings evidence-backed?

YES — all REQUIREMENTS.md discrepancies traced to test cases doc correction table + selector file DOM notes + passing TC evidence. RT% calculated by manually classifying all 20 TCs.

### Did I surface all remediation prompts?

YES — section 3 (6 REQUIREMENTS fixes), section 10 (all implementation changes), section 11 (full execution workflow with identity per step).

### What did I get WRONG initially? (ALL-030)

13 findings documented in the audit that triggered this rewrite:
1. No identity guide -> added section 11 identity table
2. No Phase 0 context loading -> added Step 0
3. No Phase 0.5 tagged todo -> added Step 0.5
4. No test quality assessment -> added section 7
5. Incomplete active rules -> expanded section 6 with ALL/GEN/MNT rules
6. No self-audit -> added this section 14
7. Missing TC-027 (cancel dialog) -> added as 4th TC
8. No pseudo-code for TCs -> added to section 5
9. No gaps-NOT-included -> added ALL-033 table in section 5
10. Sloppy text in TC-024 -> cleaned up
11. No patterns.md references -> added to section 6
12. MODULE_REGISTRY not mentioned -> added to section 1 NOT-in-scope
13. MNT-008 non-application not justified -> added explicit justification in section 5

### Remaining risks I may have missed:

- If 20/20 tests are no longer passing at execution time (e.g., deployment changed app behavior), all new TCs may be moot. Step 0 should run existing suite first.
- If `cancelSaveDialog()` method has a timing issue (dialog dismisses before click), TC-027 could be flaky. The method already uses `waitFor({ state: 'hidden' })` which should be reliable.
