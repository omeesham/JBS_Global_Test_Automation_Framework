# PLAN_HIST_SP2_PER_TC_MCP_AUDIT

**Status**: PENDING
**Parent audit**: `C:\Users\rutvi\.claude\plans\expressive-booping-fountain.md` (Action H-3, Findings SP2-F3/F4/F5)
**Priority**: P1 (HIGH — SP2 has no per-TC MCP citations, AUD-015 violation)
**Created**: 2026-04-15
**Identity**: WATCHDOG (Mode 2 Agent Audit, GIVER lens)
**Estimated session**: MEDIUM (60-90 min)
**Depends on**: PLAN_HIST_EXTERNAL_SP1_AUDIT (must trust SP1 findings before citing them)

---

## Context

SP2 created 9 new HIST TCs (TC-LOS-HIST-001 + TC-LOS-HIST-002 + TC-LOC-HIST-001..008). Per AUD-015 (audit agent rules):

> *"Never approve planner output without verifying MCP_VERIFICATION_LOG exists and is complete. Missing log = critical finding."*

SP2 cites SP1_MCP_FINDINGS.md as the proxy MCP evidence — but SP1 verified DOM structure (column count, headers, formats), NOT per-TC expected values. Each new TC's expected behavior should cite a specific section of SP1_MCP_FINDINGS or have its own MCP verification.

Today: 9 TCs, 0 per-TC MCP citations. Anyone reading these TCs cannot tell which expected values came from real DOM observation vs. assumption.

---

## Goal

Each of the 9 HIST TCs has a `MCP_VERIFICATION_LOG` line citing:
1. The DOM observation that justifies its expected values
2. The session date / SP1_MCP_FINDINGS.md section / line range where that observation lives
3. Or, if MCP didn't cover it: an explicit `[NEEDS-MCP-VERIFICATION]` flag

---

## Tasks

1. **Inventory the 9 HIST TCs**:
   - `grep -n "TC-LOS-HIST-\|TC-LOC-HIST-" specs_planning/test-cases/setup/`
   - List each by ID + file location + expected behavior summary
2. **For each TC, identify what it asserts**:
   - Column existence? → Cite SP1_MCP_FINDINGS §1 (Loc Mgmt) or §2 (Local Office) headers list
   - Row appears after save? → Cite SP1 row-granularity finding (1 save = 1 row snapshot)
   - Specific format (boolean, date, etc.)? → Cite SP1's data formats section
   - NOT-TRACKED status? → Cite SP1's NOT-TRACKED registry
3. **For each TC where SP1 doesn't directly cover it**:
   - Mark `[NEEDS-MCP-VERIFICATION]` and add to a follow-up list
   - These need an actual MCP session before the TC can be trusted
4. **Add `MCP_VERIFICATION_LOG` block to each TC** in the source TC files:
   ```markdown
   **MCP_VERIFICATION_LOG**:
   - Expected: <what the TC asserts>
   - Source: SP1_MCP_FINDINGS.md §[N] line [X-Y] (session 2026-04-13 14:42)
   - Verified: ✅ (or [NEEDS-MCP-VERIFICATION] if not covered)
   ```
5. **For each TC tagged [NEEDS-MCP-VERIFICATION]**:
   - Run a brief MCP session to verify
   - Document the new observation
   - Update the TC's MCP_VERIFICATION_LOG
6. **Update SP2's Execution Summary** (in `plans/done/SUBPLAN_HISTORY_02_REQUIREMENTS_AND_TCS.md`):
   - Add `### MCP Verification Log Update (YYYY-MM-DD)` section
   - Note: 9/9 TCs now have MCP citations
   - List any TCs that needed fresh MCP runs
7. **Append to activity log** (LR-028) with `watchdog: audit | scope: SP2 per-TC MCP` row

---

## Verification

- Each of the 9 HIST TCs has a `MCP_VERIFICATION_LOG` block
- Zero TCs remain `[NEEDS-MCP-VERIFICATION]`
- SP2 Execution Summary updated
- AUD-015 satisfied: planner output now has MCP_VERIFICATION_LOG complete

---

## Acceptance Criteria

- [ ] All 9 HIST TC IDs listed with current expected behavior
- [ ] Each TC has explicit MCP source citation (SP1 section + line range, or fresh MCP session)
- [ ] Any [NEEDS-MCP-VERIFICATION] TCs resolved via fresh MCP run
- [ ] SP2 Execution Summary updated
- [ ] Activity log updated
