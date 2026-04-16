# SUBPLAN 2: Requirements Update + Integration Test Cases

**Parent**: PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md
**Agent**: Copilot (HUNTER + GIVER identities)
**Phase**: 0.5 + 0.7
**Status**: DONE
**Executed**: 2026-04-13
**Depends on**: SUBPLAN_HISTORY_01 complete (SUBPLAN_HISTORY_01_MCP_FINDINGS.md exists)

---

## Context

Phase 0 MCP findings are in `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md`. Now we update requirements docs and create integration test cases BEFORE any code is written. Two pipeline agents do this work: HUNTER (requirements) and GIVER (planner).

---

## Session Start Protocol

```
/identity HUNTER
```

**MANDATORY reads before ANY work:**
1. `plans/pending/PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md` (master plan)
2. `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` (MCP truth)
3. `docs/REQUIREMENTS.md` lines 826-960 (Location Mgmt History) and 1103-1161 (Local Office History)

**STOP AND ASK** if SUBPLAN_HISTORY_01_MCP_FINDINGS.md does not exist or is incomplete. Do NOT proceed without MCP findings.

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
- Every integration TC must reference SUBPLAN_HISTORY_01_MCP_FINDINGS.md for expected formats
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
- ~~TC-LOS-HIS-003 "Empty State" assertion is factually wrong~~ **RESOLVED 2026-04-15** via `PLAN_HIST_TC_LOS_HIS_003_FIX.md` — Path A (FIX). TC rewritten to "Table Populated for Office 1604", asserting `isHistoryTableEmpty() === false`. Spec was already corrected at commit 87f80cc; test-cases markdown + test plan + REQUIREMENTS.md now aligned. GIVER identity; LR-031 investigation exhaustion satisfied via SP1 MCP evidence (Office 1604 = 61 pages). No app bug filed — original TC was authored against wrong assumption, not a product defect.
- 8 locations file headers not updated with new TC counts (conservative — count will be updated during comprehensive planner review)

---

### MCP Verification Log Update (2026-04-15)

**Audit by**: Claude Opus (WATCHDOG identity, GIVER lens)
**Plan**: `plans/pending/PLAN_HIST_SP2_PER_TC_MCP_AUDIT.md`
**Trigger**: AUD-015 violation — SP2 created HIST TCs with only file-level SP1 reference, no per-TC MCP_VERIFICATION_LOG citations.

**Inventory correction**: Plan said "9 HIST TCs"; actual count is **10 TCs** (TC-LOS-HISL-001, TC-LOS-HISL-002, TC-LOC-HIST-001..008). Naming note: Local Office TCs use suffix `HISL` (Integration-LO-History-Local) not `HIST` as the plan's parent text suggested.

**Per-TC MCP_VERIFICATION_LOG blocks added** (10/10):

| TC | File | Verification Status | SP1 Coverage |
|---|---|---|---|
| TC-LOS-HISL-001 | local_office_settings_test_cases.md | ✅ | §2 + §3 (LO causal) + §4 + §8 |
| TC-LOS-HISL-002 | local_office_settings_test_cases.md | ✅ (resolved 2026-04-15) | §2 + §8 structural + §3.5 causal (added 2026-04-15 followup MCP) |
| TC-LOC-HIST-001 | locations_local_information_test_cases.md | ✅ | §1 + §3 (LOC Union causal) + §8 |
| TC-LOC-HIST-002 | locations_pricing_test_cases.md | ✅ (extrapolated) | §1 structural + §3 LOC snapshot extrapolated to Pricing |
| TC-LOC-HIST-003 | locations_currency_test_cases.md | ✅ | §1 + §3 + §8 (Merchant NOT-TRACKED) |
| TC-LOC-HIST-004 | locations_legal_test_cases.md | ✅ (extrapolated) | §1 structural + §3 LOC snapshot extrapolated to Legal |
| TC-LOC-HIST-005 | locations_account_address_test_cases.md | ✅ (extrapolated) | §1 structural + §3 LOC snapshot extrapolated to Account |
| TC-LOC-HIST-006 | locations_shared_setup_locations_test_cases.md | ✅ (extrapolated) | §1 structural + §3 LOC snapshot extrapolated to SSL |
| TC-LOC-HIST-007 | locations_notes_test_cases.md | ✅ (extrapolated) | §1 structural + §3 LOC snapshot extrapolated to Notes |
| TC-LOC-HIST-008 | locations_auto_addon_test_cases.md | ✅ (hypothesis) | §1 + §8 NOT-TRACKED — exploratory by design |

**Open gap (1 TC) — RESOLVED 2026-04-15**: TC-LOS-HISL-002 causal claim was previously not tested by SP1 — §3 only causally tested Basic Info saves on Local Office and the Union toggle on Location Management. **Followup MCP session executed 2026-04-15 09:36–09:41 UTC** by Claude Opus (WATCHDOG identity) per `plans/pending/PLAN_HIST_SP2_PER_TC_MCP_AUDIT.md` Task 5.

**Followup result — ECT save causality CONFIRMED no-tracking**:
- Method: 2-cycle BenefitsMultiplier save test (20.0% → 21.0% → 20.0%) on Office 1604
- Save proof: fetch interception captured POST `/navigator/api/location/ect-settings` at 09:39:03Z (1 API call per save click)
- History delta: rowCountBefore=64 pages → rowCountAfter=64 pages after BOTH saves (top row Modified On unchanged at 04/15/2026 08:43:18 AM, which was the prior Basic Info save row)
- Verdict: **2 ECT saves = 0 new history rows.** TC-LOS-HISL-002 expected behavior fully confirmed.
- Documentation: new §3.5 "ECT Causality" added to SUBPLAN_HISTORY_01_MCP_FINDINGS.md with full method/evidence; TC-LOS-HISL-002 MCP_VERIFICATION_LOG flipped from [NEEDS-MCP-VERIFICATION] to ✅ with citation to §3.5.
- Bonus finding: ECT panel saves IMMEDIATELY on Save-button click — no "Save Changes" confirmation dialog (differs from Basic Info Cancel/Save flow). Documented in §3.5; relevant for spec implementation.

**Scope caveat (from §3.5)**: BenefitsMultiplier was the only ECT field individually MCP-tested. HistoricalSubrental and LaborCost row edits were NOT separately verified — their NOT-TRACKED status is inferred from §8 registry + shared `/api/location/ect-settings` endpoint + the BenefitsMultiplier evidence. TC-LOS-HISL-002 covers all six ECT save TCs (ECT-005, 009, 013, 014, 015, 016) on this inference basis.

**No expected behavior modified** — per plan guardrail "Do NOT modify the TC's expected behavior — only ADD the MCP_VERIFICATION_LOG block".

**No LR-030 finding filed** — no TC's expected behavior contradicts SP1 evidence. All structural claims (column positions, header names, data formats, NOT-TRACKED registry membership) are directly cited from SP1 §1/§2/§8. All causal claims are either directly cited from §3/§3.5 (TC-LOS-HISL-001, TC-LOS-HISL-002, TC-LOC-HIST-001) or marked as extrapolated/exploratory in the verification log.

**AUD-015 status**: 10/10 TCs have complete MCP_VERIFICATION_LOG with ✅ source citations. Zero open [NEEDS-MCP-VERIFICATION] flags remain. AUD-015 fully satisfied.
