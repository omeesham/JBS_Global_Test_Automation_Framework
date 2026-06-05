# SUBPLAN: Leftover-State Audit — Enumerate Mutable-State Touchpoints Per Spec

**Status**: Pending
**Priority**: P1-CYCLE-2
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-01
**Blocks**: SP-DQU-22 (slate-clear pattern design)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_21_G1_LEFTOVER_STATE_AUDIT.md`
**Identity**: WATCHDOG
**Skills auto-called**: /identity, /audit, /find-bugs
**Model + thinking**: Opus + high (state analysis needs reasoning)
**Dependency gate**: SP-DQU-01 `Status: DONE`
**Context files**:
- All spec files under `tests/locations/` + `tests/local-office/` (11 specs)
- Existing cleanup patterns in specs (`CLEANUP REQUIRED` notes in MDs, afterEach hooks in specs)
- LR-026 (Angular dirty state) + LR-018 (spec-fixing workflow)
**Phase 0 directive**: no browser needed — static analysis of spec code.

## Purpose

Per user vision: "local info page, if changed by human and saved, how will our scripts adapt... clear the slate before testing and maybe after testing... anything leftover or messed up by someone else does not affect the specs running, they are bulletproof".

Enumerate every mutable-state touchpoint per spec. Identify what can go wrong if office 1604 gets manually edited between runs. Produce state matrix as input to SP-DQU-22/23.

## Step-by-step

1. For each of 11 specs, grep for save button clicks + form field type/select calls + checkbox toggles. Build state-write matrix.
2. For each state-write site: list the field, expected default, fallback when default was overwritten by a human.
   - Known-unknown to capture: Local Office Settings → Cost Tab → Labor Cost Assumptions → **Administrative Fee** true-default on a slate-cleared office 1604 (currently observed `42` is suspected office-state-dependent, not a true default — see TC-LOS-ECT-010 in `clients/encore/specs_planning/test-cases/setup/local-office/local_office_ect_test_cases.md` (split from combined LOS test-cases on 2026-05-05) and field-inventory artifact `clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md` §Known App Bugs). Once true-default known, update TC-LOS-ECT-010 baseline assertion accordingly. Hand-off owner: SP-DQU-03 (closed 2026-04-27).
3. For each spec's afterEach/afterAll: list what (if anything) gets restored. Usually nothing → that's the gap.
4. Categorize mutable state by recovery complexity:
   - Cat-1 (trivial): single-field reset (e.g., Prep Date Offset = -1).
   - Cat-2 (medium): multi-field cascade (e.g., Intercompany → IDC Billing chain).
   - Cat-3 (hard): persistent state with side effects (new Section added, new Notes row).
5. Produce state matrix file `clients/encore/specs_planning/_internal/spec-state-matrix-2026-04-22.md` with: spec, test ID, field, write type, Cat, recommended recovery approach (reload / type-original-value / API restore / snapshot+restore).
6. Activity-log row.

## Acceptance criteria

- [ ] State matrix covers all 11 specs.
- [ ] Every state-write site categorized Cat-1/2/3.
- [ ] Recovery approach recommended per site.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-22 (pre-test slate-clear pattern design). Chat summary: Cat counts per spec, highest-risk sites.
