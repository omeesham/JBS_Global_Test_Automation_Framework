# SUBPLAN 6: Location Mgmt History Integration — Remaining Specs

**Parent**: PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md
**Agent**: Copilot (BUILDER identity)
**Phase**: 2.6, 2.7, 2.8, 2.9, 2.10
**Status**: DONE
**Executed**: 2026-04-16
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

---

## Execution Summary (LR-027)

**Executed by**: BUILDER (Opus 4.6, /ultrathink+/execute) on 2026-04-16

### TCs Implemented

| TC ID | Spec File | Line | Status |
|-------|-----------|------|--------|
| TC-LOC-LGL-HIST | location-legal.spec.ts | :198 | IMPLEMENTED |
| TC-LOC-ACC-HIST | location-account-address.spec.ts | :301 | IMPLEMENTED |
| TC-LOC-SSL-HIST | location-shared-setup-locations.spec.ts | :390 | IMPLEMENTED |
| TC-LOC-NTS-HIST | location-notes.spec.ts | :371 | IMPLEMENTED |
| TC-LOC-AAO-HIST | location-auto-addon.spec.ts | :264 | IMPLEMENTED |

**Total: 5 implemented, 0 dropped, 0 deferred.**

### Adversarial Audit Findings (pre-execution)

1. **Save count discrepancies** (CRITICAL): Plan claimed legal=10, actual=6; account=6, actual=4; auto-addon=21, actual=12. Resolved by using SP5 timestamp-window + gap detection pattern (never assert exact row counts per LR-022).
2. **Conditional saves non-deterministic**: TC-001 baselines, ensureEmptyState, finally blocks produce 0-1 rows depending on DB state. Handled by `toBeGreaterThan(0)` sanity + field-value gap detection.
3. **No HEADERS arrays in plan**: Derived from SP1 column mapping + test data analysis during execution.

### Per-Phase Notes

- **Phase 2.6 (Legal)**: Gap detection on Service Charge Name (col 34) and Terms and Conditions (col 38). Values: LEGAL_ALT_SC/LEGAL_DEFAULTS + LEGAL_ALT_TC/LEGAL_DEFAULTS.
- **Phase 2.7 (Account-Address)**: Gap detection on Phone2 (col 57) and Venue Name (col 55). 4 guaranteed saves.
- **Phase 2.8 (SSL)**: Gap detection on Action/ID/Name (cols 59-61). 15 saves from add/delete/toggle cycles. Checks for non-empty shared setup data.
- **Phase 2.9 (Notes)**: Gap detection on Notes column (col 70). 11+ saves; ensureEmptyState may add conditional rows. Checks for non-empty Notes values.
- **Phase 2.10 (Auto-Addon)**: SP1 §8 NOT-TRACKED. Test handles both cases: rows=0 (save-level NOT-TRACKED) and rows>0 (verify Modified By/On). No addon-specific columns exist in 87-col schema.

### Verification

- `npx tsc --noEmit`: 0 new errors (all pre-existing in worker/unit-tests/website)
- `npx playwright test --list | grep HIST`: all 5 new TCs registered across chrome/chromium/firefox/webkit
- **Individual spec runs (2026-04-16)**: All 5 specs pass individually:
  - location-legal: 16/16 (HIST 3.0s)
  - location-account-address: 27/27 (HIST 4.5s)
  - location-shared-setup-locations: 25/25 (HIST 5.2s)
  - location-notes: 28/28 (HIST 4.6s)
  - location-auto-addon: 20/20 (HIST 4.2s)
- **Full location suite run (2026-04-16)**: 148 passed, 4 failed, 10 skipped, 71 did not run
  - 3/5 HIST tests ran and passed in full suite (ACC-HIST, SSL-HIST, NTS-HIST)
  - 2/5 HIST tests did not run (LGL-HIST, AAO-HIST) — their serial block TC-001 failed first (SSO timeout)
  - 4 failures are pre-existing auth/SSO timeout on TC-001 of legal, auto-addon, pricing, and MGH-008 — same pattern seen in SP5 full-suite run. NOT caused by HIST changes.
  - No serial contamination detected — all failures on first test of their blocks (auth timeout), not mid-block.
  - **Verdict**: HIST changes verified clean. Pre-existing SSO timeout pattern documented in SP5 (`reports/sp5-full-run.log`).

### Bugs Fixed During Verification

1. **Navigation from any URL**: Removed intermediate reload-to-tab; `navigateToHistoryTab(OFFICE_NO)` handles everything.
2. **Legal SC/T&C values**: History stores `"US English: Resort Service Charge"` not `"Resort Service Charge"` — gap detection updated to use `${LEGAL_DEFAULTS.languageName}: ${value}` format.

### Documentation Changes

None (spec-only changes; test cases/test plans were already updated by SP2).
