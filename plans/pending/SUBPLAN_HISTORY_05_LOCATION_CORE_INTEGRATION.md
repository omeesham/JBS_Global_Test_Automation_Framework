# SUBPLAN 5: Location Mgmt History Integration — Core Specs

**Parent**: PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md
**Agent**: Copilot (BUILDER identity)
**Phase**: 2.3, 2.4, 2.5
**Status**: Pending
**Depends on**: SUBPLAN_HISTORY_01 + SUBPLAN_HISTORY_03 complete
**History System**: Location Management History (87 columns)

---

## Context

Three core Location Management specs need history integration tests. Every completed save = its own history row verified.

**Save counts (from audit):**
- `location-local-information.spec.ts`: **27 completed saves** — biggest spec, ~45 of 87 history columns
- `location-pricing.spec.ts`: **9 completed saves** — ALL BLOCKED by API 500 (may still be blocked)
- `location-currency.spec.ts`: **30 completed saves**, 2 canceled

**Total rows to verify: ~66** (if pricing unblocked)

---

## Session Start Protocol

```
/identity BUILDER
/regression-guard
```

**MANDATORY reads before ANY work:**
1. `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` — column headers, formats, granularity
2. Read ENTIRE spec file for each spec you're working on
3. `src/pages/setup/locations/location-management-history.page.ts` — history page object from SP-3

**CRITICAL RULE: Audit saves FIRST, code SECOND.**
For each spec, grep ALL save calls. Classify each as COMPLETED or CANCELED. Build complete save-to-column mapping BEFORE writing test code.

---

## Phase 2.3: location-local-information Integration Test

- 27 completed saves — this is the biggest integration test
- Key columns: Billing Type (13), LDW fields (26-28), ETS (29-30), SC (31-33), C&C (35-37), Oracle (73-75), misc checkboxes
- ~~Col 28 i18n key leak~~ [MCP-CONTRADICTED: renders correctly as "Calculate LDW on Net Amount". SP1 §4.]
- Timeout: `test.setTimeout(180_000)` — 27 rows is heavy
- Use `expect.soft()` for everything — we want ALL mismatches reported

## Phase 2.4: location-pricing Integration Test

- 9 completed saves BUT spec header says ALL 27 tests BLOCKED by API 500
- **CHECK FIRST**: Run `npx playwright test location-pricing.spec.ts --headed` to see if still blocked
- If STILL blocked → `test.skip('blocked: API 500 on pricing tab — all saves unreachable')`
- If UNBLOCKED → verify 9 rows: Price Guide Inclusive (62), pricebook fields (63-69)

## Phase 2.5: location-currency Integration Test

- 30 completed saves, 2 canceled (CUR-014, CUR-017 — dialog canceled)
- Key columns: Currency (6, 64) — note col 64 is KNOWN duplicate header
- Merchant currency may be NOT-TRACKED (SP1 determines)
- Timeout: `test.setTimeout(180_000)` — 30 rows

---

## Test Pattern (same for all three)

```typescript
test('TC-{MODULE}-HIST: Verify all saves produced correct history rows', async ({ ... }) => {
  test.setTimeout(180_000);
  
  // 1. Reload + dismiss unsaved dialog (LR-026)
  // 2. Navigate to Location Management History tab
  // 3. Sort by Modified On desc
  // 4. Read top N rows
  // 5. For EACH completed save (in reverse chronological order):
  //    - Read the row's changed columns by HEADER TEXT
  //    - Assert values match what the save set
  //    - Assert Modified By non-empty, Modified On non-empty
  // 6. All assertions via expect.soft()
});
```

---

## Guardrails

- ZERO changes to existing tests — APPEND only
- Every completed save = verified row. No shortcuts.
- Canceled saves (dialog dismissed) = NO row. Don't look for them.
- Column access by HEADER TEXT only — never indices
- Formats from SUBPLAN_HISTORY_01_MCP_FINDINGS.md only — never assume
- Run each spec individually after adding integration test
- If a save has no matching history column → document as NOT-TRACKED finding, don't skip the row check entirely (other columns like Modified By/On should still be present)

---

## Session End Protocol

**COMPLETION GATE**: Before marking DONE, pass the 5-point Sub-Plan Completion Gate in the master plan.

```
/regression-guard
/reflect
```

Activity log entry per LR-028.
