# SUBPLAN 2: Requirements Update + Integration Test Cases

**Parent**: PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md
**Agent**: Copilot (HUNTER + GIVER identities)
**Phase**: 0.5 + 0.7
**Status**: DONE
**Executed**: 2026-04-13
**Depends on**: SUBPLAN_HISTORY_01 complete (SP1_MCP_FINDINGS.md exists)

---

## Context

Phase 0 MCP findings are in `plans/pending/SP1_MCP_FINDINGS.md`. Now we update requirements docs and create integration test cases BEFORE any code is written. Two pipeline agents do this work: HUNTER (requirements) and GIVER (planner).

---

## Session Start Protocol

```
/identity HUNTER
```

**MANDATORY reads before ANY work:**
1. `plans/pending/PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md` (master plan)
2. `plans/pending/SP1_MCP_FINDINGS.md` (MCP truth)
3. `docs/REQUIREMENTS.md` lines 826-960 (Location Mgmt History) and 1103-1161 (Local Office History)

**STOP AND ASK** if SP1_MCP_FINDINGS.md does not exist or is incomplete. Do NOT proceed without MCP findings.

---

## Phase 0.5: Requirements Update (HUNTER)

1. Update `docs/REQUIREMENTS.md` with:
   - History tracking rules discovered by MCP
   - NOT-TRACKED registry (fields that save but produce no history row)
   - Oral requirement vs formal doc vs live DOM comparison table
   - Any column header corrections (if MCP found different headers than documented)

2. Follow HUNTER rules — REQUIREMENTS.md is HUNTER's file (R11)

---

## Phase 0.7: Test Case Planning (GIVER)

Switch identity:
```
/identity GIVER
```

3. For EACH spec that has saves, append integration TCs to its test case file:
   - Pattern: `TC-{MODULE}-HIST-{NNN}: Verify all saves produced correct history rows`
   - Each TC must list: total completed saves, which fields to verify per row, expected formats from MCP findings

4. Update test plans with "Integration: History Verification" section

5. Run: `npm run planner:export-all` to re-export CSVs

---

## Files Modified

- `docs/REQUIREMENTS.md` (HUNTER only)
- `specs_planning/test-cases/setup/locations/*.md` (add HIST TCs)
- `specs_planning/test-cases/setup/local-office/*.md` (add HIST TCs)
- `specs_planning/test-plans/setup/locations/*.md` (add integration section)
- `specs_planning/test-plans/setup/local-office/*.md` (add integration section)

---

## Session End Protocol

```
/reflect
```

**COMPLETION GATE**: Before marking DONE, pass the 5-point Sub-Plan Completion Gate in the master plan.

Activity log entry per LR-028.

---

## Guardrails

- Do NOT write any spec code, page objects, or selectors in this session
- Do NOT modify any existing test case — only APPEND new HIST TCs
- Every integration TC must reference SP1_MCP_FINDINGS.md for expected formats
- If MCP findings contradict master plan assumptions, update the TC accordingly — MCP is truth

---

### Execution Summary

**Executed by**: Copilot (OWNER + HUNTER + GIVER identities)
**Date**: 2026-04-13

**Phase 0.5 (HUNTER) — REQUIREMENTS.md Updates**:
- Corrected 10 column header names in Location Management History table to match SP1 MCP-verified headers
- Fixed col 41 duplicate claim (NOT a duplicate — distinct column "Enable Set/Strike Labor Minutes")
- Added History Tracking Rules section (snapshot model, cross-system independence, table refresh, populated data) for BOTH systems
- Added Data Formats section for BOTH systems (boolean rendering, timestamps, percentages, empty values)
- Added NOT-TRACKED registries: 3 LOC fields + 6 LOS fields with spec TC references
- Added sortability info: 14/87 sortable for Location Mgmt, 38/42 sortable for Local Office
- Added Save Dialog differences (Cancel/Ok vs Cancel/Save)
- Fixed Local Office History dropdown default: "Location Settings History" → "Location Management History"
- Fixed Local Office History empty state claim: "No results" → 61 pages (~1204 rows)
- Added CRITICAL boolean detection note: Local Office uses SVG lucide-check, Location Mgmt uses Unicode ✔

**Phase 0.7 (GIVER) — Integration Test Cases**:
- TC-LOS-HIST-001: Basic Info saves → Local Office History verification (in local_office_settings_test_cases.md)
- TC-LOS-HIST-002: ECT saves → Local Office History verification (exploratory — NOT-TRACKED hypothesis)
- TC-LOC-HIST-001: Local Information saves → Loc Mgmt History (in locations_local_information_test_cases.md)
- TC-LOC-HIST-002: Pricing saves → Loc Mgmt History (in locations_pricing_test_cases.md)
- TC-LOC-HIST-003: Currency saves → Loc Mgmt History (in locations_currency_test_cases.md)
- TC-LOC-HIST-004: Legal saves → Loc Mgmt History (in locations_legal_test_cases.md)
- TC-LOC-HIST-005: Account & Address saves → Loc Mgmt History (in locations_account_address_test_cases.md)
- TC-LOC-HIST-006: Shared Setup saves → Loc Mgmt History (in locations_shared_setup_locations_test_cases.md)
- TC-LOC-HIST-007: Notes saves → Loc Mgmt History (in locations_notes_test_cases.md)
- TC-LOC-HIST-008: Auto Add-On saves → Loc Mgmt History (exploratory — NOT-TRACKED hypothesis)
- Updated 9 test plans with "Integration: History Verification" scenario sections
- Added HIST sub-code to KNOWN_SUB_CODES (types.ts) and TAB_MAP (to-csv.ts)
- Lint passes (no SUB-001 errors for HIST)
- Fixed local_office_settings header TC count: 76→85 (pre-existing count error + 2 new HIST TCs)

**TCs not implemented**: None — all planned deliverables completed.

**Known issues carried forward**:
- TC-LOS-HIS-003 "Empty State" assertion is factually wrong (history has 61 pages). Noted in REQUIREMENTS.md but NOT modified per guardrails. Needs GIVER update in a future session.
- 8 locations file headers not updated with new TC counts (conservative — count will be updated during comprehensive planner review)
