# Test Plan — Terms and Conditions L2/L3 DEEP

**Module**: terms-conditions
**Submodule**: CORE
**Depth**: L2 + L3 (DEEP)
**Cases**: TC-TNC-CORE-047 through TC-TNC-CORE-092 (46 cases)
**Authored**: 2026-08-06
**Source plan**: `PLAN_TERMS_CONDITIONS_AUTOMATION.md` Phase 7b/7c

## Execution Prerequisites

- Office 1604 accessible on `cloudapps-e2e.encoreglobal.com`
- Auth session valid (`.auth/encore-state.json`)
- Grid has existing rows with known content for isolation/persistence tests
- Network interception capability for save-failure and payload cases

## Execution Groups

### Group 1 — RTE persistence BVA (TC-047 to TC-054)
- **Dependencies**: Clean save path working (no residue-row 500)
- **Risk**: DEF-TNC-002 may cause batch failures if residue rows present
- **Strategy**: Use content-anchored row selection; each case creates permanent content

### Group 2 — Editor state isolation (TC-055 to TC-057)
- **Dependencies**: Distinct content pre-loaded in multiple cells
- **Strategy**: Dismiss unsaved-changes dialogs explicitly per step

### Group 3 — Cross-language independence (TC-058 to TC-059)
- **Dependencies**: Rows in at least 2 languages
- **Strategy**: Use Language filter "All" for visibility

### Group 4 — Batch/save-failure (TC-060 to TC-062)
- **Dependencies**: Network interception for TC-062
- **Risk**: TC-060/061 expected to FAIL (DEF-TNC-002/005)

### Group 5 — Text BVA (TC-063 to TC-068)
- **Dependencies**: None beyond standard page access
- **Strategy**: Use unique sentinel names to avoid duplicate-block

### Group 6 — Pairwise array (TC-069)
- **Dependencies**: Rows in 4 languages; Language filter "All"
- **Strategy**: Execute all 12 trials sequentially, save once, verify all

### Group 7 — State transitions (TC-070 to TC-081)
- **Dependencies**: Network interception for TC-074
- **Risk**: TC-074 FAILS (DEF-TNC-005); TC-078 documents known gap; TC-081 blocked

### Group 8 — Integration (TC-082 to TC-083)
- **Dependencies**: `location-management-history.page.ts`, `location-legal.page.ts`
- **Risk**: NM-1544 may cause TC-083 to fail on Legal tab

### Group 9 — Error-guessing (TC-084 to TC-087)
- **Dependencies**: Network interception for TC-085
- **Risk**: TC-085 FAILS (DEF-TNC-005)

### Group 10 — Accessibility (TC-088 to TC-090)
- **Dependencies**: Standard keyboard navigation
- **Note**: Findings are cases, NOT bug reports per client rule

### Group 11 — Network payload + Volume (TC-091 to TC-092)
- **Dependencies**: Network interception for TC-091
- **Strategy**: TC-092 uses content-anchor (name) not index for row identification

## Known-Failing Cases (bug evidence)

| TC | Defect | Expectation |
|---|---|---|
| TC-060 | DEF-TNC-002 | Batch save fails with residue rows |
| TC-061 | DEF-TNC-002 | No partial commit possible |
| TC-062 | DEF-TNC-005 | Error not surfaced, Save not re-enabled |
| TC-074 | DEF-TNC-005 | Save-Failed should return to Dirty |
| TC-085 | DEF-TNC-005 | Retry blocked by premature Save disable |

## Blocked Cases

| TC | Reason |
|---|---|
| TC-054 | Pending-probe: tooltip rendering not measured |
| TC-081 | No settings tab link found to test |
