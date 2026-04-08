# PLAN_AUDIT_LEGAL — Session 1 Audit (Execute in Session 2)

**Parent**: `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`
**Target**: LEGAL (Batch 2, P1)
**Gaps covered**: #16 (ServiceChargeId null validation), #17 (TermsConditionsId null validation)
**Current state**: 15 TCs (LGL-001 to LGL-014 + LGL-018), all active, 0 skipped, 0 FIXMEs
**Created**: 2026-04-06 | **Executed**: 2026-04-06 | **Status**: DONE

### Execution Summary (Session 2, 2026-04-06)
- **MCP-1/2**: SC has no empty option, keyboard clear no effect → Gap #16 = NOT-AUTOMATABLE
- **MCP-3/4**: T&C "Blank" is real record (no error icon), keyboard clear no effect → Gap #17 = NOT-AUTOMATABLE
- **MCP-5/6**: BOTH dropdowns are NOT sorted alphabetically → **APP BUG** (v1 says sorted)
- **LGL-016/017 DROPPED**: Sort assertion tests not added — would fail against live behavior (app bug)
- **LGL-018 ADDED**: Combined SC+T&C change → save → reload → verify both persist. Passed.
- **Documentation fixes**: 3 REQUIREMENTS.md entries, 1 legal.ts JSDoc, 3 test plan selector mappings
- **All 15 tests pass individually** (verified 2026-04-06)

---

## Context

The master plan identifies 2 gaps for the Legal tab — both around **required dropdown validation** (null/empty → error icon → save disabled). The existing 14 tests provide solid positive-path coverage (navigation, defaults, dropdown interaction, dirty state, round-trip persistence, cancel, beforeunload) but zero negative/validation testing.

**The critical unknown**: Can we actually trigger null validation on office 1604? Radix UI Select dropdowns typically don't have a "clear/deselect" mechanism — once a value is selected, you can only replace it with another value. This audit determines whether the gaps are automatable or must be classified NOT-AUTOMATABLE.

**Additionally found during review**: 2 stale entries in REQUIREMENTS.md, 1 untested requirement (alphabetical sort), and 1 potential edge case ("Blank" T&C option may produce ID=0).

---

## 1. REQUIREMENTS.md Discrepancies Found (Fix During Execution)

| Line | Current (STALE) | Correct (MCP-verified) | Evidence |
|------|----------------|----------------------|----------|
| 627 | "Dedicated Save button at top-right (disabled by default)" | **NO dedicated Save button — uses shared left-panel Save** (`data-testid="location-settings-btn-save"`) | `src/selectors/setup/locations/legal.ts` line 12: MCP-verified 2026-03-18. Also confirmed by PLN-024 (agent-mistakes.md) |
| 643 | Default SC = "Service Charge" | Default SC = **"Resort Service Charge"** | `tests/test-data/setup/locations/location-legal.data.ts` line 15, spec TC-LGL-002, PLN-023 (agent-mistakes.md) |
| 157 | "Legal-specific Save (top-right inside Legal tabpanel)" | Should read: "Legal tab — no dedicated Save; uses shared left-panel Save" | Same evidence as line 627 |

These MUST be fixed during execution to prevent future agents from repeating PLN-023/PLN-024 mistakes.

### 1b. Additional Documentation Bugs Found (Post-Audit Review)

| File | Line | Current (WRONG) | Correct | Evidence |
|------|------|-----------------|---------|----------|
| `src/selectors/setup/locations/legal.ts` | 14 | "buttons Cancel + Save" | **"buttons Cancel + Ok"** | `src/selectors/setup/locations/shared.ts`: `btnSaveChangesConfirm: '...button:has-text("Ok")'`. Code works correctly (resolves from shared.ts), but JSDoc misleads future agents. |
| `specs_planning/test-plans/setup/locations/locations_legal_test_plan.md` | Selector Mapping | `btnSaveDialogCancel`, `btnSaveDialogConfirm` | **`btnSaveChangesCancel`, `btnSaveChangesConfirm`, `dlgSaveChanges`** (from shared.ts) | Test plan predates shared selector consolidation. Spec uses correct keys. |

### 1c. Auditor C-2 Correction — WORSE Than Stated

The external auditor flagged C-2 as "stale selector keys" only. In reality, test plan line 18 has **TWO errors in one line**:
- **Key name wrong**: `btnSaveDialogConfirm` → should be `btnSaveChangesConfirm`
- **Button TEXT wrong**: `button:has-text("Save")` → actual button says **"Ok"** (per shared.ts: `button:has-text("Ok")`)

Also: test plan line 16 has `dlgSaveChanges` with selector `[role="alertdialog"]` — but shared.ts has `[role="alertdialog"]:has-text("Save Changes")`. The test plan's broader selector could match error dialogs too.

### 1d. Test Plan ↔ Spec Divergences

| Test plan step | Spec implementation | Issue |
|---------------|---------------------|-------|
| TC-014 step 2: select **"Blank"** | TC-014 line 146: `selectTerms(LEGAL_ALT_TC)` = "Encore Terms and Conditions" | Test plan deliberately chose "Blank" — a potentially ambiguous option that MIGHT be a null placeholder. Spec chose a safer value. The plan divergence means "Blank" was never tested by the spec. |
| TC-005 step 6: verify "Blank" exists | Spec TC-005: only checks `toContain(LEGAL_ALT_TC)` | Spec doesn't explicitly verify "Blank" option exists |

**Source of "Blank"**: `specs_planning/test-cases/setup/locations/locations_legal_test_cases.md` line 153 lists it as one of 50 T&C options. Observed during original 2026-02-19 MCP session. MCP-3 must verify it still exists.

### 1e. Dead Code Flag

| File | Method | Status |
|------|--------|--------|
| `src/pages/setup/locations/location-legal.page.ts` | `getCheckedOption()` | **Unused** — no test calls it. Created for checked-state verification but spec only uses `toContain()`. Flag for cleanup if not needed by new TCs. |

---

## 2. MCP Verification Checklist (6 items)

Per LR-007: all planner claims require live MCP verification before writing test code.

| # | What to verify | How | Blocks | Expected |
|---|---------------|-----|--------|----------|
| MCP-1 | **SC dropdown has empty/none/placeholder option?** | Open `drpLegalServiceCharge0` → scroll to very top of listbox → read ALL option texts → look for "", "--Select--", "(None)", or blank entry | Gap #16 | No empty option (114 named options) |
| MCP-2 | **SC keyboard clear works?** | Focus `drpLegalServiceCharge0` (closed), press: Backspace, Delete, Ctrl+A then Delete, Ctrl+Backspace → read combobox textContent after each | Gap #16 | No effect — Radix ignores keyboard clear |
| MCP-3 | **T&C "Blank" option: does it still exist? If so, null ID or real record?** | Open `drpLegalTerms0` → FIRST verify "Blank" option exists (source: 2026-02-19 MCP session, 6 weeks stale). If present: select it → check: (a) does error icon appear in T&C cell? (b) does save enable? (c) if save, does it persist as "Blank"? If "Blank" is GONE: document as removed, skip rest. | Gap #17 — **KEY** | Likely still exists and is a real record (ID > 0), no error. But if error icon appears → Gap #17 is NEW. If "Blank" is gone → skip. |
| MCP-4 | **T&C keyboard clear works?** | Same as MCP-2 for `drpLegalTerms0` | Gap #17 | No effect |
| MCP-5 | **SC options sorted alphabetically?** | Open `drpLegalServiceCharge0` → get all 114 options → verify array is sorted case-insensitively | Untested requirement (v1: "sorted alphabetically") | Yes — sorted |
| MCP-6 | **T&C options sorted alphabetically?** | Open `drpLegalTerms0` → get all 50 options → same check | Untested requirement | Yes — sorted |

### MCP Decision Tree

```
MCP-1: SC dropdown has empty/none option?
  YES ──→ Gap #16 = NEW. Need error icon selector (MCP-7 below).
  NO  ──→ MCP-2: Keyboard clear works on SC?
            YES ──→ Gap #16 = NEW.
            NO  ──→ Gap #16 = NOT-AUTOMATABLE.
                    Reason: "Radix Select prevents null state on existing
                    data; validation only triggers on country change
                    (destructive on 1604)"

MCP-3: T&C "Blank" produces error icon?
  YES ──→ Gap #17 = NEW (automatable by selecting "Blank").
  NO  ──→ MCP-4: Keyboard clear works on T&C?
            YES ──→ Gap #17 = NEW.
            NO  ──→ Gap #17 = NOT-AUTOMATABLE. Same reason as #16.

MCP-5/6: Options sorted?
  YES ──→ Add assertion TC (see Path A+ below).
  NO  ──→ Log as app bug in audit findings.
```

If EITHER gap becomes NEW, add:

| MCP-7 | **Error icon DOM structure** | Inspect cell DOM around combobox when error visible: look for SVG, tooltip-trigger, `[data-state]`, or exclamation element. Get exact selector. | New TC selectors | Follow account-address `isPhone1ErrorIconVisible` SVG sibling pattern |

---

## 3. Gap Classification & TC Mapping

### Path A: Both gaps NOT-AUTOMATABLE (most likely)

**Zero new validation TCs.** But the audit found additional value to add:

#### Path A+ Additions (regardless of gap outcome)

| TC | Priority | Description | ISTQB Technique | Depends on |
|----|----------|-------------|-----------------|------------|
| LGL-016 | P2 | SC dropdown options are sorted alphabetically | Equivalence partition (ordering) | MCP-5 confirms |
| LGL-017 | P2 | T&C dropdown options are sorted alphabetically | Equivalence partition (ordering) | MCP-6 confirms |
| LGL-018 | P2 | Change BOTH SC and T&C simultaneously → save → reload → both persist | Round-trip (combined) | None |

**Why these matter**:
- LGL-016/017: The v1 requirement says "sorted alphabetically" — currently untested. Simple assertion using `getServiceChargeOptions()` / `getTermsOptions()` and checking array equals its sorted copy.
- LGL-018: Current tests change SC and T&C in separate tests (LGL-011, LGL-012). A combined change verifies there's no save conflict when both fields change in a single save operation. This is a decision table gap (both conditions true simultaneously).

**LR-022 CONSTRAINT on LGL-016/017**: Do NOT assert `options.length === 114` or `options.length === 50`. Only assert sorted order: `expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })))`. Option counts are informational (from planner observation), not assertion targets.

**TC numbering note**: TC-015 slot is RESERVED (country cascade, OMITTED). New TCs start at 016.

### Path B: One or both gaps are NEW (unlikely)

Add validation TCs:

| TC | Priority | Description | ISTQB Technique | Depends on |
|----|----------|-------------|-----------------|------------|
| LGL-019 | P0 | Clear SC to null → error icon visible in SC cell → Save disabled | Error guessing + Decision table | MCP-1 or MCP-2 |
| LGL-020 | P0 | Clear T&C to null → error icon visible in T&C cell → Save disabled | Error guessing + Decision table | MCP-3 or MCP-4 |
| LGL-021 | P0 | Clear SC → reselect valid → error clears → Save enables (error recovery) | State transition | LGL-019 |
| LGL-022 | P0 | Clear T&C → reselect valid → error clears → Save enables (error recovery) | State transition | LGL-020 |
| LGL-023 | P1 | Clear BOTH SC and T&C → both error icons → Save disabled → fix both → Save enables | Decision table (multi-field) | LGL-019 + LGL-020 |

**Path B implementation requires**:

| Artifact | Changes |
|----------|---------|
| **Selectors** (`legal.ts`) | Add `iconLegalServiceChargeError0`, `iconLegalTermsError0` (after MCP-7 DOM inspection) |
| **Page object** (`location-legal.page.ts`) | Add `clearServiceCharge()`, `clearTerms()`, `isServiceChargeErrorVisible()`, `isTermsErrorVisible()` |
| **Test data** (`location-legal.data.ts`) | No changes needed — uses existing `LEGAL_DEFAULTS` for recovery |
| **Spec** (`location-legal.spec.ts`) | Add TCs LGL-019 through LGL-023 at end of serial block |

---

## 4. ISTQB Technique Audit (Comprehensive)

### Equivalence Partitioning

| Partition | Tests | Status |
|-----------|-------|--------|
| Valid SC (default) | LGL-002, LGL-004 | COVERED |
| Valid SC (alternate) | LGL-008, LGL-011 | COVERED |
| Invalid SC (null) | NONE | NOT-AUTOMATABLE pending MCP |
| Valid T&C (default) | LGL-002, LGL-005 | COVERED |
| Valid T&C (alternate) | LGL-009, LGL-012 | COVERED |
| Invalid T&C (null) | NONE | NOT-AUTOMATABLE pending MCP |
| Language Name (read-only) | LGL-003 | COVERED |
| Dropdown sort order | NONE | **NEW** — add LGL-016/017 |
| RBAC read-only (canEditProp=false) | NONE | NOT-AUTOMATABLE (requires non-admin account) |
| Keyboard/accessibility navigation | NONE | OUT OF SCOPE (accessibility testing) |

**Assessment**: 2 valid partitions per dropdown is SUFFICIENT (default + alternate cover the happy path). Invalid partition blocked by Radix constraint. Sort order gap identified and addressed. RBAC and accessibility partitions are out of scope for this audit (documented, not attempted).

### Boundary Value Analysis

**N/A** for dropdown fields. Dropdowns have discrete option lists, not continuous ranges. No boundaries to test. This is correct — BVA doesn't apply to Legal.

### Decision Table

| Rule | SC changed | T&C changed | Reverted | Save state | Covered by |
|------|-----------|-------------|----------|------------|------------|
| R1 | No | No | -- | Disabled | LGL-007 |
| R2 | Yes | No | No | Enabled | LGL-008 |
| R3 | No | Yes | No | Enabled | LGL-009 |
| R4 | Yes | No | Yes | **Enabled** (dirty persists) | LGL-010 |
| R5 | Yes | Yes | No | Enabled | LGL-008+009 serial |
| **R6** | **Yes** | **Yes** | **No** | **Save → persist both** | **NEW** — add LGL-018 |
| R7 | SC=null | -- | -- | Disabled (`!isValidLegalData`) | NOT-AUTOMATABLE |
| R8 | -- | T&C=null | -- | Disabled (`!isValidLegalData`) | NOT-AUTOMATABLE |

**Gap found**: R6 (combined change + save) is untested. Added as LGL-018.

### State Transition

```
              [Load page]
                  |
                  v
            +----------+
            |  CLEAN   |  Save disabled
            +----------+
                  |
           [Change SC/T&C]
                  |
                  v
            +----------+
            |  DIRTY   |  Save enabled
            +----------+
           / |    |    \
    [Save]  [Revert] [Cancel] [Beforeunload]
      |       |        |         |
      v       v        v         v
   SAVED   DIRTY*   DIRTY    DIALOG
   (clean)  (still)  (still)  (stay/leave)
```

| Transition | Covered by | Status |
|------------|-----------|--------|
| CLEAN → DIRTY | LGL-008, LGL-009 | COVERED |
| DIRTY → SAVED | LGL-011, LGL-012 | COVERED |
| DIRTY → DIRTY (revert) | LGL-010 | COVERED |
| DIRTY → DIRTY (cancel dialog) | LGL-013 | COVERED |
| DIRTY → BEFOREUNLOAD | LGL-014 | COVERED |
| CLEAN → ERROR (null) | NONE | NOT-AUTOMATABLE |
| ERROR → DIRTY (recovery) | NONE | NOT-AUTOMATABLE |

**All automatable transitions covered.** Missing transitions require null state (blocked).

### Error Guessing

| Error scenario | Testable? | Status |
|---------------|-----------|--------|
| Null ServiceChargeId | Pending MCP | NOT-AUTOMATABLE (likely) |
| Null TermsConditionsId | Pending MCP | NOT-AUTOMATABLE (likely) |
| "Blank" T&C = null ID? | MCP-3 | Must verify |
| Save with network error | Infrastructure-level | Out of scope |
| Double-click Save | Low value | Out of scope |

### Round-Trip Persistence

| Field | Covered by | Cycle |
|-------|-----------|-------|
| ServiceChargeName | LGL-011 | Change → Save → Reload → Verify → Restore |
| TermsConditionsName | LGL-012 | Change → Save → Reload → Verify → Restore |
| Cancel discards | LGL-013 | Change → Cancel → Reload → Verify original |
| **Both simultaneously** | **NONE** | **NEW — add LGL-018** |

**2 mutable fields, both with dedicated RT tests = 100% field coverage.** The 14% TC ratio is misleading because Legal only has 2 mutable fields. Coverage EXCEEDS the master plan's >50% target. LGL-018 adds the combined-change scenario.

---

## 5. Existing Test Quality Review

**Verdict: High quality. No changes to existing 14 TCs.**

| Quality aspect | Assessment |
|---------------|------------|
| LR-019 baseline enforcement | TC-001 restores defaults if dirty from prior failed run |
| LR-025 Radix retry | `selectComboboxOptionExact()` has 3-retry loop for detached DOM |
| LR-026 dirty state handling | TC-012 reloads after TC-011's save cycle before proceeding |
| GEN-026 reload between saves | TC-012/013 both reload before starting |
| GEN-027 selector namespace | Save dialog selectors in shared.ts, not duplicated in legal.ts |
| GEN-032 large dropdown | SC (114 options) uses exact-match + retry loop |
| GEN-033 Angular save != pristine | Save methods wait for button disabled, beforeunload handled |
| Serial isolation | Each test that makes changes does cleanup (reload or restore+save) |
| Timeout management | Navigation + save tests have 60s timeout; dropdown tests use defaults |

**No issues found.** The spec follows every applicable learned rule and agent-mistakes pattern.

---

## 6. Execution Plan (for Session 2)

### Step 1: MCP Verification (15 min)

Execute MCP-1 through MCP-6 (and MCP-7 if needed). Record results.

### Step 2: Classify Gaps (5 min)

Apply decision tree. Update master plan gap #16 and #17 status.

### Step 3: Fix ALL Stale Documentation (15 min)

**REQUIREMENTS.md**:
- Line 157: Change "Legal-specific Save" to "Legal tab — no dedicated Save; uses shared left-panel Save"
- Line 627: Change "Dedicated Save button at top-right" to "No dedicated Save button — uses shared left-panel Save (`location-settings-btn-save`)"
- Line 643: Change "Service Charge" to "Resort Service Charge"

**legal.ts JSDoc** (line 14):
- Change "buttons Cancel + Save" to "buttons Cancel + Ok"

**locations_legal_test_plan.md** (Selector Mapping, lines 16-18):
- Line 16: Change `[role="alertdialog"]` to `[role="alertdialog"]:has-text("Save Changes")`
- Line 17: Change `btnSaveDialogCancel` to `btnSaveChangesCancel`
- Line 18: Change `btnSaveDialogConfirm` / `button:has-text("Save")` to `btnSaveChangesConfirm` / `button:has-text("Ok")`

### Step 4: Implement New TCs (30-45 min)

**Minimum (Path A+)**: 3 new TCs (LGL-016, LGL-017, LGL-018)
- LGL-016: Sort assertion on SC options
- LGL-017: Sort assertion on T&C options
- LGL-018: Combined SC+T&C change → save → reload → verify both

**Maximum (Path B)**: 3 + 5 = 8 new TCs (if validation gaps are automatable)
- All Path A+ TCs plus LGL-019 through LGL-023 (validation + error recovery)

### Step 5: Run & Fix (15-30 min)

Per LR-018 / LR-024:
1. Clean artifacts (`npm run clean`)
2. Run Legal spec individually: `npx playwright test tests/specs/setup/locations/location-legal.spec.ts --project=chrome`
3. Fix any failures
4. Run ALL location specs together: `npx playwright test tests/specs/setup/locations/ --project=chrome`
5. Fix serial contamination if any
6. Run Legal individually AGAIN to confirm
7. Run all together AGAIN for green

### Step 6: Update Master Plan (5 min)

Update gap #16/#17 status in `PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`.
Update test count from 14 to 17 (Path A+) or 22 (Path B).

---

## 7. Critical Files

| File | Action |
|------|--------|
| `tests/specs/setup/locations/location-legal.spec.ts` | Add 3-8 new TCs at end of serial block |
| `src/pages/setup/locations/location-legal.page.ts` | Path B only: add clear/error methods |
| `src/selectors/setup/locations/legal.ts` | Fix JSDoc line 14 + Path B: add error icon selectors |
| `tests/test-data/setup/locations/location-legal.data.ts` | No changes expected |
| `docs/REQUIREMENTS.md` | Fix 3 stale entries (lines 157, 627, 643) |
| `specs_planning/test-plans/setup/locations/locations_legal_test_plan.md` | Fix selector mapping lines 16-18 (keys + text + specificity) |
| `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` | Update gap status + test count |

---

## 8. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Both gaps NOT-AUTOMATABLE | HIGH | Low (documentation only, no wasted effort) | Pre-classified before coding |
| "Blank" T&C produces null ID | LOW | Medium (Gap #17 becomes NEW) | MCP-3 tests explicitly |
| Sort assertion flaky (options loaded async) | LOW | Low | Use `getServiceChargeOptions()` which waits for listbox → options |
| Combined save (LGL-018) triggers Angular dirty race | LOW | Medium | Follow LR-026: reload before + after |
| LGL-016/017 sort assertion wrong locale | LOW | Low | Use case-insensitive `.sort()` comparison, not strict |

---

## 9. NOT-AUTOMATABLE Registry (if Path A confirmed)

| Gap | Requirement | Why Not Automatable | Could Be Tested With |
|-----|------------|--------------------|--------------------|
| #16 | ServiceChargeId null → SCNAME_IS_REQD error | Radix Select has no deselect/clear mechanism; validation only triggers on country change (resets Legal data to null) | Different office OR new location creation flow |
| #17 | TermsConditionsId null → TCNAME_IS_REQD error | Same as #16 | Same as #16 |
| TC-015 | Country cascade resets Legal | Destructive on office 1604 | Different test office |

---

## 10. Audit Evidence Trail

**Sources verified**:
1. `src/selectors/setup/locations/legal.ts` — MCP-verified 2026-03-18, 44 lines, 6 selectors
2. `src/pages/setup/locations/location-legal.page.ts` — 242 lines, 21 methods (14 public + 6 internal/protected + 1 private)
3. `tests/specs/setup/locations/location-legal.spec.ts` — 156 lines, 14 active TCs
4. `tests/test-data/setup/locations/location-legal.data.ts` — 23 lines, last verified 2026-04-01
5. `docs/REQUIREMENTS.md` lines 618-686 — Legal section, 3 stale entries found
6. `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` — master plan, gaps #16/#17
7. `specs_planning/_internal/agent-mistakes.md` — rules ALL-006/007/008/010/015/017/022/024/026/027, PLN-001/004/005/021-028, GEN-001/008/009/015/018/019/021/025/026/027/032/033, REQ-002/012/013
8. CLAUDE.md learned rules LR-007/009/018/019/022/023/024/025/026

**False positive prevention**: Every new TC assertion will be MCP-verified before coding (LR-007). Sort order assertions use the existing `getServiceChargeOptions()`/`getTermsOptions()` methods which are already proven reliable (used in TC-004/005).

### Counter-Audit of External Auditor Review (2026-04-06)

**Auditor findings VERIFIED correct**: C-1 (legal.ts JSDoc button text), I-1 (REQUIREMENTS.md stale entries), I-2 (LR-022 constraint), I-3 (dead `getCheckedOption()`)

**Auditor findings UNDERSOLD**:
- C-2 is TWO errors per line, not one — wrong key AND wrong button text ("Save" → "Ok"). Auditor only flagged the key rename.
- Test plan `dlgSaveChanges` selector is also less-specific (`[role="alertdialog"]` vs `[role="alertdialog"]:has-text("Save Changes")`)

**Auditor MISSED**:
1. Test plan TC-014 uses "Blank" as alternate T&C value, but spec uses "Encore Terms and Conditions" — meaningful divergence
2. "Blank" T&C option comes from 2026-02-19 MCP session (6 weeks stale) — needs re-verification in MCP-3
3. Test plan is comprehensively stale and should be regenerated after changes (not flagged by auditor)

**Auditor NOT wrong about anything** — all findings are legitimate, just incomplete on C-2 scope.
