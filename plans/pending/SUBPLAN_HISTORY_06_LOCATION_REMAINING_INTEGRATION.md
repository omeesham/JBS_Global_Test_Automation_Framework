# SUBPLAN 6: Location Mgmt History Integration — Remaining Specs

**Parent**: PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md
**Agent**: Copilot (BUILDER identity)
**Phase**: 2.6, 2.7, 2.8, 2.9, 2.10
**Status**: Pending
**Depends on**: SUBPLAN_HISTORY_01 + SUBPLAN_HISTORY_03 complete
**History System**: Location Management History (87 columns)

---

## Context

Five remaining Location Management specs need history integration tests. Same rule: every completed save = its own history row verified.

**Save counts (from audit):**
- `location-legal.spec.ts`: **10 completed saves**, 1 canceled
- `location-account-address.spec.ts`: **6 completed saves**
- `location-shared-setup-locations.spec.ts`: **15 completed saves**
- `location-notes.spec.ts`: **11 completed saves**, 1 canceled
- `location-auto-addon.spec.ts`: **21 completed saves**, 3 canceled

**Total rows to verify: ~63**

---

## Session Start Protocol

```
/identity BUILDER
/regression-guard
```

**MANDATORY reads before ANY work:**
1. `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md`
2. Read EACH spec file fully before writing its integration test
3. `src/pages/setup/locations/location-management-history.page.ts`

**CRITICAL RULE: Audit saves FIRST, code SECOND.**

---

## Phase 2.6: location-legal (10 saves)
- Key columns: Service Charge Name (34), Terms & Conditions (38)
- 1 canceled save (LGL-013) — no row for it

## Phase 2.7: location-account-address (6 saves)
- Key columns: Phone fields (56, 57), Venue/Branch Account Name (55)

## Phase 2.8: location-shared-setup-locations (15 saves)
- Key columns: Shared Setup Action/ID/Name (59-61)
- Complex: saves involve adding/deleting rows — history may track differently

## Phase 2.9: location-notes (11 saves)
- Key column: Notes (70)
- 1 canceled save (NTS-027) — no row for it
- Notes saves include: fill note, delete all notes, special chars, multi-row, boundary (4000 chars)

## Phase 2.10: location-auto-addon (21 saves)
- **LIKELY NOT-TRACKED**: Auto add-on checkboxes have NO mapped column in the 87-column spec
- 3 canceled saves (AAO-006, AAO-007, AAO-019) — no rows
- SP1 findings determine if auto-addon saves appear in history at all
- If NOT-TRACKED → `test.skip('Auto add-on saves not tracked in Location Management History — see SUBPLAN_HISTORY_01_MCP_FINDINGS.md')`

---

## Test Pattern

Same as SP-5. For each spec, append ONE test at end of `describe.serial`:
- Audit all saves first (grep clickSave/saveAndConfirm/etc.)
- Read top N rows from history (N = completed save count)
- Verify each row's changed columns
- `expect.soft()` for every assertion
- Header text access, never indices

---

## Guardrails

- ZERO changes to existing tests
- Every completed save = verified row
- Canceled saves = no row
- Formats from SP1 only
- Run each spec individually after adding test
- NOT-TRACKED finding ≠ skip. If a save has no column for its changed field, still verify Modified By/On are present in the row. The field absence IS the finding.

---

## Session End Protocol

**COMPLETION GATE**: Before marking DONE, pass the 5-point Sub-Plan Completion Gate in the master plan.

```
/regression-guard
/reflect
```

Activity log entry per LR-028.
