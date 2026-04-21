# SUBPLAN 8: Bug Reports — History Discrepancies

**Parent**: PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md (SUPERSEDED)
**Depends on**: SUBPLAN_HISTORY_07 complete
**Agent**: OWNER
**Phase**: 3B
**Status**: SUPERSEDED
**Superseded by**: [PLAN_HIST_COLUMN_FIRST_PIVOT.md](PLAN_HIST_COLUMN_FIRST_PIVOT.md) — folded into SP-E-LO, SP-E-LM-CUR, SP-E-LM-OTHER (2026-04-20)
**Executed**: 2026-04-20 (folded — bug-filing work continues under the successor's gated SP-E-* subplans)

---

## Context

During SP-1 through SP-7, various history discrepancies were discovered:
- Fields that save but produce no history row (NOT-TRACKED)
- Known bugs: i18n key leak (col 28), duplicate headers (cols 41, 64)
- Any new bugs found during integration testing

This sub-plan compiles and files all bug reports. **ONLY when user authorizes.**

---

## Tasks (when authorized)

1. Read `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` for all NOT-TRACKED findings
2. Read integration test results for any assertion failures that indicate app bugs (not test bugs)
3. File bug reports to `reports/bugs/BUG-HIS-{NNN}.json` per LR-034 protocol
4. Update affected specs with `test.skip('bug-blocked: BUG-HIS-NNN')` where applicable
5. Compile summary report

---

## Known Pre-Existing Bugs to Confirm

- ~~Col 28: renders untranslated i18n key~~ [MCP-CONTRADICTED: renders correctly. Bug disproved by SP1 §4.]
- ~~Col 41: duplicate header~~ [MCP-CONTRADICTED: header is "Enable Set/Strike Labor Minutes", not duplicate. Bug disproved by SP1 §4.]
- Col 64: duplicate column name "Currency" [MCP-CONFIRMED: genuine duplicate. Use index-based access.]

## Suspected NOT-TRACKED Fields to Confirm

- PO Number / PO Number Label (Local Office)
- Room Configuration (Local Office)
- BenefitsMultiplier / HistoricalSubrental / LaborCosts (ECT)
- EnableMultidayPricing (Local Info)
- Merchant currency (Currency)
- Auto Add-On checkboxes (Auto Add-On)
