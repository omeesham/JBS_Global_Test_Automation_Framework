# PLAN_HIST_SP3_MISSING_TCS

**Status**: DONE (NO-OP — premise invalidated)
**Executed**: 2026-04-15
**Parent audit**: `C:\Users\rutvi\.claude\plans\expressive-booping-fountain.md` (Action CR-4, Finding SP3-F5)
**Priority**: P0 (CRITICAL — spec is incomplete vs plan)
**Created**: 2026-04-15
**Identity**: BUILDER (Generator) + GIVER lens (TC source-of-truth)
**Estimated session**: SMALL-MEDIUM (30-60 min)
**Depends on**: PLAN_HIST_SP3_STATUS_RECONCILE (need accurate baseline first)

---

## Context

The audit found `tests/specs/setup/locations/location-management-history.spec.ts` is **199 lines / 14 TCs** (13 in the serial block + 1 commented future). But:
- Activity log claim (2026-04-14T09:00): "generated 19-TC structural spec"
- Plan source (`SUBPLAN_HISTORY_03_INFRASTRUCTURE.md` Phase 1.0): refers to `specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md` as the 19-TC source

So we have a **5-TC gap**: spec has 14, claim says 19, source TC file should disambiguate.

Per LR-027 (execution summary must justify drops) and LR-031 (no lazy SKIPs without investigation), this gap needs resolution.

---

## Goal

The MGH spec either:
1. Has all 19 TCs that the source TC file specifies, OR
2. Has fewer TCs with each missing TC explicitly documented as DROPPED with reason (NOT-AUTOMATABLE / DEFERRED / APP-BUG-BLOCKED)

No silent gaps allowed.

---

## Tasks

1. **Find the source-of-truth TC count**:
   - `wc -l specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md`
   - `grep -c "^### TC-" specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md` — count actual TC headers
   - List the TC IDs (TC-LOC-MGH-001 through ?)
2. **Inventory the spec's actual TCs**:
   - `grep -n "test('TC-LOC-MGH-" tests/specs/setup/locations/location-management-history.spec.ts` — list IDs
   - `grep -n "test\.skip('TC-LOC-MGH-" tests/specs/setup/locations/location-management-history.spec.ts`
3. **Diff the two lists**:
   - Which TC IDs are in source but NOT in spec? → these are the "missing 5"
4. **For each missing TC, decide**:
   - Add to spec? — only if it's a structural test that the page object can support today
   - Skip with `test.skip('TC-LOC-MGH-XXX', ...)` + reason — if blocked
   - Document as DROPPED in SP3 Execution Summary — if not applicable
5. **If adding TCs**:
   - Read each TC from the source file
   - Implement following the existing pattern in the spec (POM compliance, fixtures import, header, no inline selectors)
   - Run `npm run typecheck` after each addition
   - Run `npx playwright test --grep "TC-LOC-MGH-XXX"` to verify each
6. **Update SP3's Execution Summary** (or add one) with:
   - Final TC count
   - List of dropped TCs with reason per LR-027
7. **Update agent-mistakes.md** if you find a pattern (e.g., "Generator silently truncated when count exceeded budget" — graduate to GEN-XXX rule)

---

## Verification

- `grep -c "test\(\|test\.skip\(" tests/specs/setup/locations/location-management-history.spec.ts` returns 19 (or matches the source TC file count)
- SP3 Execution Summary lists every dropped TC with justification
- All non-skipped TCs pass when run individually

---

## Acceptance Criteria

- [x] Source TC count established with grep evidence
- [x] Spec TC count matches source (or every gap explicitly justified)
- [x] Any added TCs pass typecheck + individual run (N/A — no adds needed)
- [x] SP3 Execution Summary updated per LR-027 (already done by PLAN_HIST_SP3_STATUS_RECONCILE)
- [x] Activity log updated

---

## Execution Summary (LR-027)

**Executed by**: builder on 2026-04-15
**Outcome**: **NO-OP**. The audit's premise ("spec has 14 TCs, source has 19") is incorrect. Actual counts match — no gap exists, no TCs to add/drop/skip.

### Evidence — Task 1 (source TC count)
- File: `specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md`
- Header row line 1: `**Total**: 19`
- `grep "^## TC-LOC-MGH-" …` returns **19 matches** (TC-LOC-MGH-001 → TC-LOC-MGH-019 at lines 103, 118, 135, 150, 164, 182, 201, 220, 241, 258, 274, 291, 307, 323, 339, 354, 371, 386, 402).

### Evidence — Task 2 (spec TC inventory)
- File: `tests/specs/setup/locations/location-management-history.spec.ts`
- `grep "TC-LOC-MGH"` returns **19 `test(` declarations** (TC-LOC-MGH-001..019) at lines 34, 41, 49, 54, 59, 67, 71, 78, 90, 105, 120, 126, 132, 138, 149, 153, 158, 165, 171.
- Two of those (TC-006 at line 67, TC-007 at line 71) use `test.skip(true, reason)` inside the body to skip at runtime — counted as "present with runtime skip", not missing.
- Zero `test.skip('TC-LOC-MGH-...` declarations at the top level (no pre-skipped tests).

### Diff (Task 3)
| In source | In spec | Diff |
|---|---|---|
| TC-LOC-MGH-001..019 (19) | TC-LOC-MGH-001..019 (19) | **None — full parity** |

### Task 4-5 (decisions / adds)
No missing TCs → no adds, no skips-with-reason, no drop-justifications needed. Skipping Task 5 entirely (nothing to implement).

### Task 6 (SP3 Execution Summary update)
Not needed — SP3's Execution Summary (in `plans/done/SUBPLAN_HISTORY_03_INFRASTRUCTURE.md`, authored by `PLAN_HIST_SP3_STATUS_RECONCILE` on 2026-04-15) **already correctly documents 19 TCs**:
> "`tests/specs/setup/locations/location-management-history.spec.ts` created (199 lines, 19 TCs: TC-LOC-MGH-001 … TC-LOC-MGH-019)"
> "16 passed / 2 skipped / 1 failed (out of 19)"

TC-006 and TC-007 are documented as env-conditional skips; TC-019 as the known visibility failure tracked by `PLAN_HIST_RUN_SP3_SP4_SPECS.md`. Already LR-027 compliant.

### Root cause of the false audit finding
`expressive-booping-fountain.md` (Action CR-4, Finding SP3-F5) miscounted the spec as "14 TCs". The spec has always had 19. Likely causes: counting only the first 14 visible `test(` calls before scrolling, or pattern-matching a grep that missed the lower half of the file. Either way, no code defect exists.

### Task 7 (agent-mistakes graduation)
No new pattern warranted. This is covered by existing guidance:
- LR-020 "verify all plan claims against actual codebase before finalizing" already prescribes `grep -c "test("` before asserting test counts.
- LR-024 "clean + run fresh before RCA" covers evidence-first verification.
Adding an "audit claim vs reality" rule would duplicate LR-020. The audit that produced Finding SP3-F5 should itself be corrected — but that's an audit-side defect, not a pipeline-agent pattern.

### Deliverables
- This plan finalized with no-op Execution Summary.
- File moved `plans/pending/` → `plans/done/`.
- Activity log entry appended.
- **No spec, page object, selector, test data, or SP3 plan changes** — the system was already correct.
