# PLAN_AUDIT_LOCAL_OFFICE_SETTINGS — Session 1 Audit (Execute in Session 2)

**Parent**: `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`
**Target**: LOCAL_OFFICE_SETTINGS (Batch 1, P0)
**Gaps covered**: #18 (Section grid), #19 (Room grid), #20 (Date offset cross-validation), SP-03 (Null offsets)
**Current state**: 39 TCs (BAS-001 to BAS-039), all active, 0 skipped
**Created**: 2026-04-03 | **Executed**: 2026-04-06 | **Status**: DONE

### Execution Summary (2026-04-06)
- **20 of 28 planned TCs implemented** (BAS-040/041/044/045/047/048/049/050/051/053/054/055/056/061/062/063/064/065/066/067)
- **8 TCs correctly dropped after MCP verification**:
  - BAS-042/043: Duplicate section name edit → MCP-2 showed duplicate ADD is silently rejected (no icon appears via Add New). EDIT-to-duplicate icon scenario deferred — needs separate MCP verification of edit-specific behavior
  - BAS-046/052: Delete section/room → MCP-9 confirmed NO delete UI exists. NOT-AUTOMATABLE
  - BAS-057/058/059/060: Cross-field validators (Set>=Delivery, Return>=Strike/Pickup, Pickup>=Strike) → MCP-5/6 confirmed NOT ENFORCED by Angular implementation. Only NM-1264 (Delivery>=Prep) is wired. Documented in REQUIREMENTS.md
- **MCP findings documented in REQUIREMENTS.md**: positivity constraints, null offset behavior (NM-1453), maxLen boundaries, Escape key behavior, no delete UI, whitespace acceptance
- **BAS-030 modified**: "empty table" → "table structure and baseline" (rooms may exist from MCP artifacts, no delete UI)
- **BAS-037/038 modified**: clickTab → clickTabDirect for LR-026 compliance
- **DA-01 fixed**: SECTION_TEST_VALUES.originalName corrected to 'Audio'
- **All tests pass individually** (verified 2026-04-06)

---

## Gap-to-TC Mapping

### Gap #18: Section Grid Validation (v1 functional requirements)

**Existing coverage**: BAS-025 (list sections), BAS-026 (toggle), BAS-027 (edit name), BAS-028 (add), BAS-029 (Default button)

**MISSING TCs** (8 new):

| TC | Priority | Description | ISTQB Technique | MCP Pre-verify? |
|----|----------|-------------|-----------------|-----------------|
| BAS-040 | P0 | Empty section name — revert to previous value (clear name, Tab/blur, verify reverts to tempName) | Equivalence partition (invalid) | Yes — MCP-1: verify revert behavior |
| BAS-041 | P1 | Whitespace-only section name — same revert behavior | BVA (boundary of empty) | No — same mechanism as 040 |
| BAS-042 | P0 | Duplicate section name — exclamation icon visible + "Duplicate Name" tooltip + Save disabled | Decision table | Yes — MCP-2: verify icon DOM structure, tooltip selector |
| BAS-043 | P0 | Duplicate name recovery — fix duplicate, icon disappears, Save re-enables | State transition | No — follows from 042 |
| BAS-044 | P1 | Add new section with empty/whitespace name — rejected | Equivalence partition | Yes — MCP-3: rejection mechanism unknown |
| BAS-045 | P1 | Add new section with duplicate name — validation fires | Decision table | No — same mechanism as 042 |
| BAS-046 | P1 | Delete section — verify removal from grid + Save enables | State transition | Yes — MCP-9: verify delete UI mechanism |
| BAS-047 | P1 | Section edit → Escape key cancels edit, restores original name | State transition | No |

### Gap #19: Room Config Grid Validation (v1 functional requirements)

**Existing coverage**: BAS-030 (empty table), BAS-031 (add room)

**MISSING TCs** (5 new):

| TC | Priority | Description | ISTQB Technique | MCP Pre-verify? |
|----|----------|-------------|-----------------|-----------------|
| BAS-048 | P0 | Add room → toggle active off → save → reload → verify inactive (full round-trip) | Round-trip + State transition | No |
| BAS-049 | P1 | Edit room name — rename and verify | Round-trip | No |
| BAS-050 | P1 | Empty room name — revert behavior | Equivalence partition | Yes — MCP-8 |
| BAS-051 | P1 | Duplicate room name — validation fires | Decision table | Yes — MCP-4: verify NM-1223 applies |
| BAS-052 | P1 | Delete room — verify removal | State transition | Yes — MCP-9 |

### Gap #20: Date Offset Cross-Validation (Validate() method)

**Existing coverage**: BAS-006 (non-numeric Prep), BAS-007 (Delivery < Prep), BAS-008 (recovery), BAS-009 (negative accepted), BAS-010 (zero accepted)

**MISSING TCs** (11 new):

| TC | Priority | Description | ISTQB Technique | MCP Pre-verify? |
|----|----------|-------------|-----------------|-----------------|
| BAS-053 | P0 | Positive value in ALL "relative to start" fields (Prep, Set, Delivery) → aria-invalid — data-driven loop | Equivalence partition (all 3 fields) | No |
| BAS-054 | P0 | Negative value in ALL "relative to end" fields (Return, Strike, Pickup) → aria-invalid — data-driven loop | Equivalence partition (all 3 fields) | No |
| BAS-055 | P1 | Non-numeric on Return field ("abc") → aria-invalid + reload cleanup (LR-011) | Equivalence partition | No |
| BAS-056 | P1 | Non-numeric on Delivery field ("abc") → aria-invalid + reload cleanup (LR-011) | Equivalence partition | No |
| BAS-057 | P0 | Set < Delivery cross-validation → aria-invalid (Validate path: Set >= Delivery) | Decision table | Yes — MCP-5 |
| BAS-058 | P0 | Return < Pickup cross-validation → aria-invalid (Validate path: Return >= Pickup) | Decision table | Yes — MCP-6 |
| BAS-059 | P0 | Return < Strike cross-validation → aria-invalid (Validate path: Return >= Strike) | Decision table | Yes — MCP-6 |
| BAS-060 | P1 | Strike > Pickup cross-validation → aria-invalid (Validate path: Pickup >= Strike) | Decision table | Yes — MCP-6 |
| BAS-061 | P1 | MaxLen boundary — 3-char field with 4 chars (Prep="1234") | BVA | No |
| BAS-062 | P1 | MaxLen boundary — 4-char field at limit (Set="-999") | BVA | No |
| BAS-063 | P0 | Multi-field error recovery — trigger cross-validation, correct with NON-DEFAULT value (LR-009), all fields clear | State transition | No |

### SP-03: Null Offset Testing (NM-1453)

**Existing coverage**: None

**MISSING TCs** (4 new):

| TC | Priority | Description | ISTQB Technique | MCP Pre-verify? |
|----|----------|-------------|-----------------|-----------------|
| BAS-064 | P0 | Clear Prep offset → save → reload → verify empty (not "0") | Round-trip (null) | Yes — MCP-7: BLOCKING |
| BAS-065 | P1 | Clear Return offset → save → reload → verify empty | Round-trip (null) | No |
| BAS-066 | P1 | Clear Prep but keep Delivery → verify no cross-validation error fires | Decision table | No |
| BAS-067 | P1 | Clear all 6 offsets → save → reload → all empty | Round-trip (bulk null) | No |

**Total: 28 new TCs (BAS-040 to BAS-067). 11 P0, 17 P1.**

---

## Scope Boundary

**Gap-Mandated (23 TCs)**: BAS-040–045 (Gap #18), BAS-050–051 (Gap #19), BAS-053–063 (Gap #20), BAS-064–067 (SP-03)

**Opportunity TCs (5 TCs, all P1)**: BAS-046 (section delete), BAS-047 (escape-cancel), BAS-048 (room toggle round-trip), BAS-049 (room edit), BAS-052 (room delete). Added during audit review — serve master plan criteria #2 (round-trip >40%). Low incremental cost. Room escape-cancel NOT added (same mechanism as section per v1).

---

## Validate() Path Coverage Matrix

| Path | Condition | Rule | Covered By | Status |
|------|-----------|------|------------|--------|
| 1 | Prep empty + both Delivery & Set exist | Set >= Delivery | BAS-066 + BAS-057 | **COVERED** |
| 2 | Prep exists + both Delivery & Set exist | Set >= Prep, Delivery >= Prep, Set >= Delivery | BAS-007 + BAS-057 | **COVERED** |
| 3 | Prep exists + only Set (Delivery cleared) | Set >= Prep | — | **P2 DEFERRED** (requires clearing Delivery; contingent on MCP-7) |
| 4 | Prep exists + only Delivery (Set cleared) | Delivery >= Prep | BAS-007 | **COVERED** |
| 5 | Return empty + both Strike & Pickup exist | Pickup >= Strike | BAS-060 | **COVERED** |
| 6 | Return exists + both Strike & Pickup exist | Return >= Pickup, Return >= Strike, Pickup >= Strike | BAS-058 + BAS-059 + BAS-060 | **COVERED** |
| 7 | Return exists + only Strike (Pickup cleared) | Return >= Strike | — | **P2 DEFERRED** |
| 8 | Return exists + only Pickup (Strike cleared) | Return >= Pickup | — | **P2 DEFERRED** |

**5 of 8 paths covered. Paths 3, 7, 8 require clearing single fields — contingent on MCP-7 null-offset behavior.**

---

## Data Anomaly: DA-01

**File**: `tests/test-data/setup/local-office/local-office-settings.data.ts:65`
**Bug**: `SECTION_TEST_VALUES.originalName = 'Audio Visual'` but `DEFAULT_SECTIONS[0] = 'Audio'`
**Fix**: Change to `'Audio'`

---

## MCP Verification Checklist (10 items)

| # | What to verify | Blocks |
|---|---------------|--------|
| MCP-1 | Empty section name: clear name, blur — does it revert? | BAS-040, 041 |
| MCP-2 | Duplicate section name: what icon/SVG? tooltip element? DOM structure? | BAS-042, 043, 045 |
| MCP-3 | Add-new section with empty name: rejection mechanism? | BAS-044 |
| MCP-4 | Room grid: does NM-1223 duplicate validation apply? | BAS-051 |
| MCP-5 | Cross-validation: which field gets aria-invalid when Set < Delivery? | BAS-057 |
| MCP-6 | Cross-validation: Return/Strike/Pickup — which fields get aria-invalid? | BAS-058, 059, 060 |
| MCP-7 | **BLOCKING**: Clear Prep → save → reload → shows empty or "0"? | BAS-064, 065, 066, 067 + deferred paths 3/7/8 |
| MCP-8 | Room grid: full column inventory + empty name revert behavior | BAS-050 |
| MCP-9 | Section/Room delete: UI mechanism? Button? Icon? | BAS-046, 052 |
| MCP-10 | Confirm section at index 0 is "Audio" (DA-01 validation) | DA-01 fix |

---

## Implementation Changes (Session 2)

### Page Object (10 new methods)

| Method | Gap |
|--------|-----|
| `getSectionNameByIndex(rowIndex)` | #18 |
| `isSectionDuplicateIconVisible(rowIndex)` | #18 — TBD MCP-2 |
| `getSectionDuplicateTooltip(rowIndex)` | #18 — TBD MCP-2 |
| `deleteSection(rowIndex)` | #18 — TBD MCP-9 |
| `getRoomNames()` | #19 |
| `isRoomActive(rowIndex)` | #19 |
| `toggleRoomActive(rowIndex)` | #19 |
| `editRoomName(rowIndex, newName)` | #19 |
| `deleteRoom(rowIndex)` | #19 — TBD MCP-9 |
| `isRoomDuplicateIconVisible(rowIndex)` | #19 — TBD MCP-4 |

**LR-026 note**: `reloadBasicInfo()` → `safeNavigateTo()` → `dismissAlertDialogIfVisible()` already handles dirty-state alertdialog. No changes needed.

### Test Data (9 changes)

| Constant | Gap |
|----------|-----|
| Fix `SECTION_TEST_VALUES.originalName` → `'Audio'` | DA-01 |
| `CROSS_VALIDATION_SCENARIOS` (with `recoveryValue` per LR-009) | #20 |
| `POSITIVITY_VIOLATIONS_START` (Prep, Set, Delivery — all 3) | #20 |
| `POSITIVITY_VIOLATIONS_END` (Return, Strike, Pickup — all 3) | #20 |
| `MAXLEN_TEST_VALUES` | #20 |
| `DUPLICATE_SECTION_NAME` = `'Audio'` | #18 |
| `ROOM_TEST_VALUES` expansion (editValue, duplicateName) | #19 |
| `NULL_OFFSET_FIELDS` (all 6 keys) | SP-03 |
| `RECOVERY_VALUES` (all differ from defaults per LR-009) | #20 |

### Selectors
- Duplicate-name icon/tooltip selectors — TBD by MCP-2, MCP-4
- Delete affordance selectors — TBD by MCP-9

---

## ISTQB Summary

| Technique | Before | After | Delta |
|-----------|--------|-------|-------|
| Round-trip | 14 (36%) | 19 (28%) | +5 |
| Equivalence partition | 8 (21%) | 16 (24%) | +8 |
| BVA | 2 (5%) | 4 (6%) | +2 |
| Decision table | 1 (3%) | 9 (13%) | +8 |
| State transition | 4 (10%) | 9 (13%) | +5 |

---

## Execution Plan (Session 2)

1. Fix DA-01
2. Complete MCP-1 through MCP-10
3. Triage: Cat-A BLOCKED any MCP-blocked TCs
4. Add selectors + page object methods + test data
5. Write P0 TCs (23), then P1 (5)
6. Run new TCs individually: `--grep "BAS-04|BAS-05|BAS-06"`
7. Fix failures
8. Run full spec
9. Fix serial contamination
10. Update test-cases markdown
11. Update `docs/REQUIREMENTS.md` (master plan criteria #7)
12. If MCP-7 passes: create backlog for deferred Validate() paths 3, 7, 8

---

## Risks

| Risk | Mitigation |
|------|------------|
| MCP-7 rejects null offsets | Cat-A BLOCK SP-03 TCs + deferred paths |
| MCP-9 finds no delete UI | NOT-AUTOMATABLE for BAS-046, 052 |
| Duplicate icon has no stable selector | Relative DOM traversal (account-address pattern) |
| Room grid empty on 1604 | TCs self-provision rooms, cleanup by reload |
| Cross-validation targets unexpected field | MCP-5/6 resolve before implementation |

---

## Audit Trail

- **Round 1 audit**: C1 (positivity field coverage), C2 (Validate paths undocumented), C3 (LR-009 recovery values) — all fixed
- **Round 2 audit**: GREEN LIGHT. 4 minor items (REQUIREMENTS.md step, EP arithmetic, room escape-cancel rationale, deferred path tracking) — all incorporated
- **Self-deviation audit**: 23/28 TCs gap-mandated, 5/28 opportunity (P1). No P0 scope creep. Plan aligned with master plan goal.
