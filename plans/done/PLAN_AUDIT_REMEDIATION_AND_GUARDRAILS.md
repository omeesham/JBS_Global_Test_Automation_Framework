# PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS

**Source**: WATCHDOG Audit 2026-04-06 — 4 actionable findings (F-001 through F-004)
**Created**: 2026-04-06 | **Revised**: 2026-04-06 (meta-audit fixes: identity, TC math, missing files)
**Status**: READY FOR EXECUTION
**Root Cause**: `/execute` skill has no enforcement for plan finalization, activity logging, or TC drop documentation
**Identity**: OWNER (not BUILDER — remediation edits CLAUDE.md, execute/SKILL.md, plans/done/ — all OWNER-only paths per §2)

---

## Part 1: Remediation Prompt (copy-paste for new session)

The following prompt fixes all 4 audit findings. Copy-paste into a new Claude Code session:

---

```
/identity OWNER

## WATCHDOG AUDIT REMEDIATION — 4 Findings from 2026-04-06 Audit

Fix these 4 findings from the WATCHDOG audit. Each is a documentation/process gap — no code changes needed.
**IMPORTANT**: Use OWNER identity (not BUILDER). This task edits CLAUDE.md, .claude/skills/execute/SKILL.md, and plans/done/ — all OWNER-only paths per §2. If F-004 investigation requires implementing new TCs (BAS-042/043), use "override" for spec writes or switch to BUILDER for that step only.

### F-001: Activity log not updated (R06 violation)
Append today's session entry to `specs_planning/_internal/agent-activity-log.md`:

| 2026-04-06T12:00 | builder | done | tests/specs/setup/local-office/local-office-settings.spec.ts, tests/specs/setup/locations/location-legal.spec.ts, tests/specs/setup/locations/location-currency.spec.ts, tests/specs/setup/locations/location-pricing.spec.ts, tests/specs/setup/locations/location-auto-addon.spec.ts, tests/specs/setup/locations/location-local-information.spec.ts, src/pages/setup/local-office/local-office-settings.page.ts, src/pages/setup/locations/location-currency.page.ts, src/pages/setup/locations/location-legal.page.ts, src/pages/setup/locations/location-pricing.page.ts, src/common/base-page.ts, docs/REQUIREMENTS.md, tests/test-data/setup/local-office/local-office-settings.data.ts, tests/test-data/setup/locations/location-currency.data.ts, tests/test-data/setup/locations/location-pricing.data.ts, src/selectors/setup/locations/legal.ts, src/selectors/setup/locations/pricing.ts, specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md, specs_planning/test-cases/setup/locations/locations_legal_test_cases.md, specs_planning/test-plans/setup/locations/locations_legal_test_plan.md | AUDIT EXECUTION: 3 plans executed (LOS 20 TCs, Legal 1 TC, Currency 7 TCs). 2 pricing TCs added (PRI-033/035). OFFICE_NO parameterization across 3 specs (auto-addon, local-info, pricing). base-page.ts request-drain fix. REQUIREMENTS.md 12 corrections (MCP-verified). App bugs documented (Legal sort order, cross-validators not enforced). Plans: PLAN_AUDIT_LOCAL_OFFICE_SETTINGS, PLAN_AUDIT_LEGAL, PLAN_AUDIT_CURRENCY. |

### F-002: PLAN_AUDIT_LOCAL_OFFICE_SETTINGS — missing execution summary
Edit `plans/done/PLAN_AUDIT_LOCAL_OFFICE_SETTINGS.md`:
1. Change line 7 from `**Created**: 2026-04-03 | **Status**: READY FOR EXECUTION` to `**Created**: 2026-04-03 | **Executed**: 2026-04-06 | **Status**: DONE`
2. Add execution summary after line 8 (before the `---`):

```markdown
### Execution Summary (2026-04-06)
- **20 of 28 planned TCs implemented** (BAS-040/041/044/045/047/048/049/050/051/053/054/055/056/061/062/063/064/065/066/067)
- **8 TCs correctly dropped after MCP verification**:
  - BAS-042/043: Duplicate section name edit → MCP-2 showed duplicate ADD is silently rejected (no icon appears via Add New). EDIT-to-duplicate icon scenario deferred — needs separate MCP verification of edit-specific behavior
  - BAS-046/052: Delete section/room → MCP-9 confirmed NO delete UI exists. NOT-AUTOMATABLE
  - BAS-057/058/059/060: Cross-field validators (Set>=Delivery, Return>=Strike/Pickup, Pickup>=Strike) → MCP-5/6 confirmed NOT ENFORCED by Angular implementation. Only NM-1264 (Delivery>=Prep) is wired. Documented in REQUIREMENTS.md
- **MCP findings documented in REQUIREMENTS.md**: positivity constraints, null offset behavior (NM-1453), maxLen boundaries, Escape key behavior, no delete UI, whitespace acceptance
- **BAS-030 modified**: "empty table" → "table structure and baseline" (rooms may exist from MCP artifacts, no delete UI)
- **BAS-037/038 modified**: clickTab → clickTabDirect for LR-026 compliance
- **DA-01 fixed**: SECTION_TEST_VALUES.originalName corrected to 'Audio'
- **All tests pass individually** (verified 2026-04-06)
```

### F-003: PLAN_AUDIT_CURRENCY — status says PENDING but was executed
Edit `plans/done/PLAN_AUDIT_CURRENCY.md`:
1. Change line 7 from `**Created**: 2026-04-06 | **Status**: PENDING` to `**Created**: 2026-04-06 | **Executed**: 2026-04-06 | **Status**: DONE`
2. Add execution summary after line 9 (after the self-audit line, before `---`):

```markdown
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
```

### F-004: BAS-042/043 gap — investigate and document
1. Read `plans/done/PLAN_AUDIT_LOCAL_OFFICE_SETTINGS.md` MCP-2 entry
2. Check if the EDIT-to-duplicate scenario (renaming an existing section to match another active section's name) triggers the NM-1223 "Duplicate Name" warning icon
3. If the icon appears: implement BAS-042 (icon visible + Save disabled) and BAS-043 (fix duplicate → icon disappears → Save re-enables)
4. If the icon does NOT appear for edits (only for adds): document as "NOT-AUTOMATABLE — NM-1223 only triggers on Add New, not on edit" in the execution summary
5. Either way, update the plan's execution summary with the finding

### After all 4 fixes:
- Verify all changes are correct by re-reading each modified file
- Commit with message: "fix: WATCHDOG audit remediation — activity log, plan status, execution summaries"
```

---

## Part 2: Permanent Guardrails (3 new rules)

### LR-027: Plan finalization protocol — execution summary mandatory before moving to done/

Add to CLAUDE.md Learned Rules section:

```markdown
### LR-027: Plan finalization — execution summary MANDATORY before move to done/
When moving a plan from `plans/pending/` to `plans/done/`:
1. Update status field: `**Status**: DONE`
2. Add `**Executed**: YYYY-MM-DD` date
3. Write `### Execution Summary` section with:
   - TCs implemented (count + IDs)
   - TCs dropped (count + IDs + per-TC justification citing MCP finding)
   - MCP verification results (numbered, with outcome)
   - Documentation changes made
   - Test pass confirmation with date
4. If ANY planned TC is not implemented, it MUST have one of:
   - `NOT-AUTOMATABLE` — with MCP evidence why
   - `DEFERRED` — with reason and tracking reference
   - `APP BUG` — with documentation in REQUIREMENTS.md
   A TC with no justification = audit finding.
**Trigger**: Any plan movement from pending/ to done/.
**Graduated from**: WATCHDOG audit 2026-04-06 (F-002, F-003, F-004).
```

### LR-028: Session bookkeeping — activity log MANDATORY at session end

Add to CLAUDE.md Learned Rules section:

```markdown
### LR-028: Session bookkeeping — activity log entry at session end
Before ending any session that modified pipeline artifacts (specs, page objects, selectors,
test data, test cases, test plans, REQUIREMENTS.md):
1. Append entry to `specs_planning/_internal/agent-activity-log.md`
   Format: `| YYYY-MM-DDThh:mm | agent | done | file1, file2, ... | DESCRIPTION |`
2. If unexpected behaviors were discovered → write to `agent-mistakes.md`
3. If MCP findings contradicted plan assumptions → update the plan's execution summary
Activity log is the audit trail. Missing entry = invisible session = audit finding.
**Trigger**: End of any session that touched pipeline files.
**Graduated from**: WATCHDOG audit 2026-04-06 (F-001).
```

### ALL-033: TC drop documentation — every planned TC must be accounted for

Add to `specs_planning/_internal/agent-mistakes.md` under ALL- section:

```markdown
| ALL-033 | Every planned TC not implemented MUST have per-TC justification in the plan's execution summary. Acceptable reasons: NOT-AUTOMATABLE (MCP evidence), DEFERRED (tracking ref), APP BUG (REQUIREMENTS.md entry), MERGED (into another TC with ID). Missing justification = undocumented coverage gap = audit finding. | WATCHDOG audit 2026-04-06: BAS-042/043 dropped without documented reason |
```

---

## Part 3: Execute Skill Enhancement

Add Phase 3.5 to `.claude/skills/execute/SKILL.md` after Phase 3 (line 137, after the Learning Completion Checklist):

```markdown
## Phase 3.5: Plan Finalization (MANDATORY — enforced by LR-027/LR-028)

After post-execution audit, before declaring done:

1. **Update plan status**: Edit the plan file:
   - Add `**Executed**: YYYY-MM-DD` to header
   - Change `**Status**:` to `DONE`
   - Add `### Execution Summary` section (see LR-027 for required fields)
   - Document EVERY planned TC: implemented, dropped (with reason), or deferred

2. **Move plan**: `mv plans/pending/PLAN_XXX.md plans/done/PLAN_XXX.md`

3. **Update activity log**: Append session entry to `specs_planning/_internal/agent-activity-log.md`
   Format: `| YYYY-MM-DDThh:mm | {agent} | done | {files} | {description} |`

4. **Update agent-mistakes.md**: If ANY unexpected behavior was found during execution
   (MCP showed different behavior than plan assumed, selector didn't match, validation
   didn't fire as expected), add a new rule entry.

Skip Phase 3.5 ONLY if the plan was NOT in plans/pending/ (ad-hoc execution without plan).
```

---

## Implementation Files

| File | Action | Lines |
|------|--------|-------|
| `CLAUDE.md` | ADD LR-027 and LR-028 after LR-026 | +20 lines |
| `specs_planning/_internal/agent-mistakes.md` | ADD ALL-033 | +1 line |
| `.claude/skills/execute/SKILL.md` | ADD Phase 3.5 after line 137 | +18 lines |
| `plans/done/PLAN_AUDIT_LOCAL_OFFICE_SETTINGS.md` | ADD execution summary, update status | +15 lines |
| `plans/done/PLAN_AUDIT_CURRENCY.md` | ADD execution summary, update status | +12 lines |
| `specs_planning/_internal/agent-activity-log.md` | APPEND session entry | +1 line |

---

## Enemy Audit

### Round 1 — Scope
- Checked: `/execute` skill has NO plan finalization steps → root cause confirmed
- Checked: `/chain` skill auto-calls `/execute` per plan → fix propagates automatically
- Checked: `/reflect` captures learnings but NOT activity log → separate enforcement needed
- Checked: ALL LR rule numbers (last = LR-026) → LR-027/028 are next available
- Checked: ALL shared rule numbers (last = ALL-032) → ALL-033 is next available

### Round 2 — Naming & Design
- LR-027/028 follow exact format of existing LR entries (title, body, trigger, graduated-from)
- ALL-033 follows exact table format in agent-mistakes.md
- Phase 3.5 naming follows existing Phase 0/0.5/1/2/3 pattern in execute skill

### Round 3 — Breaking Changes
- Execute skill additions are purely additive (new phase, no existing steps modified)
- LR rules are additive (new entries, no existing rules modified)
- ALL-033 is additive (new entry, no existing rules modified)
- No risk of breaking existing behavior

### Round 4 — Meta-Audit Fixes (2026-04-06 revision)
- **FIXED (CRITICAL)**: Identity changed from `/identity BUILDER` to `/identity OWNER`. BUILDER cannot write to CLAUDE.md, .claude/skills/, or plans/done/ per §2. OWNER has RW on all target paths. Gate 1 would have blocked BUILDER immediately.
- **FIXED (HIGH)**: TC math corrected. BAS-042/043/046/052/057/058/059/060 = 8 dropped, not 7. 28 - 8 = 20 implemented, not 21. List of 20 TC IDs was already correct — only the count text was wrong.
- **FIXED (HIGH)**: Activity log entry (F-001) was missing 6 modified files: location-auto-addon.spec.ts, location-local-information.spec.ts, location-legal.page.ts, pricing.ts selectors, and 2 test-cases .md files. Also corrected "LOS 21 TCs" → "LOS 20 TCs" and added OFFICE_NO parameterization note.
- **NOTED**: F-004 may require BUILDER override if BAS-042/043 TCs need implementation. Added note to prompt.

---

## Verification

After execution:
1. Read CLAUDE.md — verify LR-027 and LR-028 are present after LR-026
2. Read agent-mistakes.md — verify ALL-033 is present after ALL-032
3. Read execute/SKILL.md — verify Phase 3.5 exists after Phase 3
4. Read both plan files in done/ — verify execution summaries and DONE status
5. Read agent-activity-log.md — verify 2026-04-06 entry exists
6. Run in next session: execute any pending plan and verify Phase 3.5 fires
