# PLAN_HIST_TC_LOS_HIS_003_FIX

**Status**: PENDING
**Parent audit**: `C:\Users\rutvi\.claude\plans\expressive-booping-fountain.md` (Action H-4, Finding SP2-F2)
**Priority**: P1 (HIGH — known-wrong assertion left in test catalog)
**Created**: 2026-04-15
**Identity**: GIVER (TC author) — must follow LR-031 (no lazy SKIPs) + LR-034 (bug filing if app bug)
**Estimated session**: SMALL (30-45 min)
**Depends on**: PLAN_HIST_EXTERNAL_SP1_AUDIT (need verified SP1 truth)

---

## Context

`TC-LOS-HIS-003` asserts `isHistoryTableEmpty() === false` with a comment "Office 1604 always has history records." Per SP2 execution summary lines 128-130, this is **factually wrong**:

> *"TC-LOS-HIS-003 'Empty State' assertion is factually wrong (history has 61 pages of data, not empty)."*

SP1 confirmed Office 1604 Local Office History has 61 pages (~1204 rows). SP2 noted the issue but explicitly did NOT modify it ("noted in REQUIREMENTS.md but NOT modified per guardrails").

This violates LR-031 (no SKIP without exhausting investigation paths) and LR-027 (drops must be justified).

---

## Goal

`TC-LOS-HIS-003` is one of:
1. **FIXED** — assertion changed to match true behavior, with MCP evidence
2. **FILED-AS-APP-BUG** — if there's a real product expectation that history SHOULD be empty in some scenario, file BUG per LR-034 and skip with bug ref
3. **DROPPED** — if the TC is meaningless (e.g., empty-state can't exist on Office 1604), document with justification per LR-027

No "noted but not fixed" status allowed.

---

## Tasks

1. **Locate TC-LOS-HIS-003**:
   - `grep -rn "TC-LOS-HIS-003" specs_planning/test-cases/ tests/specs/`
   - Read its full definition + assertion text
2. **Determine the original intent**:
   - Why was this TC created? Read the test plan + REQUIREMENTS.md context
   - Was "Office 1604 always has history records" a mistake (wrong office assumed) OR a regression note?
3. **MCP verification**:
   - Navigate to Local Office 1604 → History tab
   - Confirm: history is populated (per SP1, 61 pages exist)
   - If a fresh office (e.g., Office 9999) has empty history, the TC may be valid for THAT office, not 1604
4. **Decide path**:
   - **Path A (FIX)**: Change assertion to `isHistoryTableEmpty() === true` with appropriate office, OR change to "history is populated and shows expected columns"
   - **Path B (FILE BUG)**: If product expects empty-state but DOM shows data → BUG. File via LR-034 → `reports/bugs/BUG-LS-{NNN}.json`
   - **Path C (DROP)**: If TC doesn't make sense for any office → remove from spec, document drop in test plan + Execution Summary
5. **Apply chosen path**:
   - Path A: Edit TC + spec, run individually to confirm pass
   - Path B: File bug, add `test.skip('TC-LOS-HIS-003', 'bug-blocked: BUG-LS-XXX', ...)` to spec
   - Path C: Remove TC from source TC file + spec, add LR-027 justification
6. **Update SP2 Execution Summary** (in `plans/done/SUBPLAN_HISTORY_02_REQUIREMENTS_AND_TCS.md`):
   - Replace "carried forward issues" entry with resolution path + date
7. **Activity log row** (LR-028)

---

## Verification

- TC-LOS-HIS-003 status is one of FIXED / FILED-BUG / DROPPED — not "noted but unfixed"
- If FIXED: spec runs and passes when --grep TC-LOS-HIS-003
- If FILED-BUG: bug report exists, spec has `test.skip(... 'bug-blocked:...')`
- If DROPPED: TC removed from source + spec + test plan with documented justification
- SP2 Execution Summary updated

---

## Acceptance Criteria

- [ ] Path decision documented with rationale
- [ ] Implementation matches chosen path
- [ ] If FIXED: spec --grep passes
- [ ] If FILED-BUG: BUG-LS-{NNN}.json exists and follows LR-034 schema
- [ ] If DROPPED: removed everywhere, justified
- [ ] SP2 Execution Summary updated
- [ ] Activity log updated
