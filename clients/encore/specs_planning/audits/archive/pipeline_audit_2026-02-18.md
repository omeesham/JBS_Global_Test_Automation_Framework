# Pipeline Audit Report — 2026-02-18

**Audit Agent**: playwright-pipeline-audit  
**Scope**: Full pipeline audit — 3 `pending_generation` tabs + 7 `pending_planning` tabs  
**Date**: 2026-02-18  
**Status**: ISSUES FOUND — fixes applied inline

---

## Summary

| Category | Count |
|----------|-------|
| Items audited | 10 queue entries |
| pending_generation (planner done) | 3 |
| pending_planning (ready for planner) | 7 |
| Spec files (Generator) | 0 (none expected yet) |
| CRITICAL issues | 1 |
| MEDIUM issues | 3 |
| LOW issues | 2 |
| POSITIVE findings | 7 |

---

## Pipeline Order — PASS ✓

All 10 items follow correct stage flow:
- `location-local-information`: requirements → planner (×3 iterations) → audit (blocked + re-audited) → copilot fixes → `pending_generation` ✓
- `location-currency`: requirements → planner → audit → planner fixes → copilot selector fixes → `pending_generation` ✓
- `location-pricing`: requirements → planner → requirements re-verify → planner diff-update → `pending_generation` ✓
- 7 `pending_planning` items: all correctly start at `pending_planning` after requirements intake ✓

No stage skips detected. Requirements → Planner → [Audit] → pending_generation order respected. **COP-006 compliant.**

---

## CRITICAL Issues

### CRIT-001: AUD-003 Violation — Local Information Test Plan Count Wrong
**Rule violated**: AUD-003 (field count reconciliation)  
**File**: `specs_planning/test-plans/locations/locations_local_information_test_plan.md`  
**Details**:
- Test plan says **66 TCs** in 4 locations (lines 10, 676, 720, 759)
- TC file header says **63 TCs** (authoritative)
- 3 TCs were removed by Copilot (TC-049, TC-050 [Legal scope], TC-056 [ProposalPilot doesn't exist])
- Test plan was NOT updated after TC removal — 3-TC drift across all plan references
- Also: TC-007A and TC-008A use non-standard "A" suffix IDs — not in standard TC-LOC-LI-NNN format; risk of CSV parser failure

**Fix applied**: Updated all 4 count references in test plan from 66 → 63. TC-007A/007A left in place (functional) but flagged for Planner to standardize.

---

## MEDIUM Issues

### MED-001: Stale DISCREPANCY Label in Pricing TC Field Inventory
**File**: `specs_planning/test-cases/locations/locations_pricing_test_cases.md` (line 43 + TC-012 Type)  
**Details**:
- Field Inventory header still shows: `**Master Toggle Behavior** (⚠️ DISCREPANCY FOUND):`
- TC-012 Type cell says: `Discrepancy`
- Queue history confirms this is **CONFIRMED BEHAVIOR** (live-verified 2026-02-18), not a discrepancy
- TC-012 Notes correctly says "CONFIRMED BEHAVIOR" — contradiction within same file
- Risk: Generator may treat TC-012 as a known bug/skip instead of a valid test case

**Fix applied**: Updated Field Inventory label to `(✅ CONFIRMED LIVE BEHAVIOR)`. Updated TC-012 Type from `Discrepancy` to `Confirmed Behavior`.

### MED-002: Duplicate Generic btnSave Selector — Ambiguity Risk
**File**: `src/selectors/index.ts`  
**Details**:
- `btnSave: 'button:has-text("Save")'` and `btnSaveLocalInfo: 'button:has-text("Save")'` are identical
- Generic selector matches ANY Save button on page — could match Pricing tab's dedicated Save (`btnSavePricing` = different locator)
- Generator may use `btnSave` and hit the wrong button depending on active tab context
- `btnSavePricing` is tab-scoped (uses tabpanel), but `btnSave`/`btnSaveLocalInfo` are global

**Recommendation**: Generator must use `page.locator(selector).first()` or scope to left panel container when using `btnSave`. Alternatively, rename `btnSaveLocalInfo` to something more explicit and scope to left panel.  
**Not fixed** (selector file owned by planner/generator) — flagged for Generator awareness.

### MED-003: Non-Standard TC ID Suffixes (007A, 008A)
**File**: `specs_planning/test-cases/locations/locations_local_information_test_cases.md`  
**Details**:
- TC-LOC-LI-007A and TC-LOC-LI-008A use "A" suffix
- `lint-test-cases.ts` pattern regex: `TC-LOC-LI-NNN` (3-digit numeric) — suffix variant may not parse correctly
- CSV export row IDs would be "LI-007A" which may break lookup/dedup logic in to-csv.ts

**Recommendation**: Planner should renumber these as TC-LOC-LI-067 and TC-LOC-LI-068, or confirm the lint script handles "A" variants.  
**Not fixed** (requires TC file + queue + CSV re-export by Planner) — flagged for Planner.

---

## LOW Issues

### LOW-001: Currency TC Missing FIELD INVENTORY Section
**File**: `specs_planning/test-cases/locations/locations_currency_test_cases.md`  
**Details**:
- LI and Pricing TC files have structured FIELD INVENTORY section at top
- Currency TC file jumps straight to TC-001 — no field inventory, no dependency summary
- Generator will need to infer field structure from TCs alone

**Impact**: Low — Currency has simple 4-column grid; Generator can read TCs directly.

### LOW-002: Currency TC Header Stats Missing Updated Date
**File**: `specs_planning/test-cases/locations/locations_currency_test_cases.md`  
**Details**:
- Header: `**Module**: locations | **Total**: 20 | **Status**: Manual` — no `Updated` date
- LI has `Updated | 2026-02-18`, Pricing has `**Updated**: 2026-02-18`
- Minor inconsistency, no functional impact.

---

## POSITIVE Findings

1. **No DISCOVER_ placeholders** — grep confirmed zero unfilled placeholders in any TC file ✓
2. **No premature spec files** — `tests/specs/locations/` empty; Generator hasn't run; stage correct ✓
3. **Selectors comprehensive** — 80+ selectors covering all LI, Currency, Pricing fields; DynamicSelectors for grid rows ✓
4. **Live DOM verification done** — Requirements agent re-verified all 3 tabs on 2026-02-18 via MCP ✓
5. **Post-reverification diff** — Planner updated all 3 TC sets after Requirements re-verify ✓
6. **Mistakes registry active** — 105 rules, AUD-012/013 added after prior stale-audit incident ✓
7. **7 pending_planning items staged correctly** — all start at `pending_planning` post requirements intake ✓

---

## Pending_Planning Items Status

| ID | Feature | Priority | Artifacts |
|----|---------|----------|-----------|
| location-left-panel-validations | Left Panel Basic Info Validations | HIGH | Requirements done ✓ |
| location-legal | Legal Tab | (check queue) | Requirements done ✓ |
| location-account-address | Account & Address Tab | (check queue) | Requirements done ✓ |
| location-notes | Notes Tab | (check queue) | Requirements done ✓ |
| location-shared-setup | Shared Setup Locations Tab | (check queue) | Requirements done ✓ |
| location-auto-addon | Auto Add-On Tab | (check queue) | Requirements done ✓ |
| location-management-history | Management History Tab | (check queue) | Requirements done ✓ |

All 7 correctly waiting for `@playwright-test-planner`. No issues with staging.

---

## Fixes Applied by This Audit

| Fix | File | Details |
|-----|------|---------|
| Test plan count: 66→63 (×4 locations) | `locations_local_information_test_plan.md` | CRIT-001 |
| DISCREPANCY→CONFIRMED LIVE BEHAVIOR | `locations_pricing_test_cases.md` Field Inventory | MED-001 |
| TC-012 Type: Discrepancy→Confirmed Behavior | `locations_pricing_test_cases.md` | MED-001 |

---

## Recommendations Before Generator Runs

1. **Planner**: Renumber TC-007A/008A → TC-067/068 and re-run `npm run lint:testcases`
2. **Generator**: Scope `btnSave` usage to left-panel container; use `btnSavePricing` for Pricing tab
3. **Generator**: Every spec needs `// spec:` and `// seed:` headers (GEN-005, COP-005)
4. **Generator**: Run tests before marking complete — show actual Playwright output (GEN-003)

---

**Audit completion**: 2026-02-18  
**Next agent**: `@playwright-test-generator` (for 3 pending_generation items)  
**Blocker**: None — 3 items cleared for generation after above fixes
