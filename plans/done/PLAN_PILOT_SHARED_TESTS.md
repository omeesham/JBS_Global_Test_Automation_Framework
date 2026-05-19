# PLAN_PILOT_SHARED_TESTS — Vertical Pilot — Shared Location Setup (Jira 1713) — HIST per-column tests

**Status**: SUPERSEDED
**Superseded by**: PLAN_SHARED_SETUP_DQU.md (Track A pilot #1) + PLAN_LM_HISTORY_COVERAGE.md (col-69 + Shared-Setup-rooted cols); forbidden location-hist-shared-setup.spec.ts NOT salvaged as file
**Priority**: P0-EMERGENCY
**Created**: 2026-05-11
**Identity**: BUILDER
**Parent**: PLAN_VERTICAL_RESTRUCTURE_PENDING.md
**Supersedes**: SUBPLAN_HIST_PIVOT_29_D7_LM_SHARED_SETUP_TESTS.md
**Depends on**: PLAN_PILOT_SHARED_DISCOVERY.md (intra-pilot)
**Blocks**: none (final plan in the pilot — gates scaling to 1706/1710/1711 via user sign-off)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Skills**: /identity, /execute, /regression-guard, /find-bugs, /final-q

---

## Context

Shared Setup vertical-pilot TESTS plan — Sonnet/hi writes `clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts`. **Branches on Plan 3's save-level tracking finding**:
- `saveLevelTracking: TRACKED` → standard per-column template (mirror Notes Tests).
- `saveLevelTracking: NOT-TRACKED` → hard NOT-TRACKED assertions + bug-candidate feed.

**Supersedes SP-D7** (`SUBPLAN_HIST_PIVOT_29_D7_LM_SHARED_SETUP_TESTS.md`). All SP-D7 content preserved: bifurcation logic, LR-ENC-001 baseline-first check, tc-authoring-rules mandatory load, save-level NOT-TRACKED hard-assertion path.

**Relaxed dependencies**:
- **SP-B-LM-R** — RELAXED (per-tab catalog from DISCOVERY plan sufficient).
- **SP-D0** — already embedded in PLAN_PILOT_NOTES_TESTS; this plan verifies presence via grep, applies if Notes Tests ran in a separate clone/branch and somehow missed it.
- **SP-D1** — RELAXED, same template chain as Notes Tests.

---

## Bootstrap

**Identity**: BUILDER

**Skills auto-called**: `/identity`, `/regression-guard`, `/find-bugs`, `/final-q`.

**Context files**:
- Parent: `plans/pending/PLAN_VERTICAL_RESTRUCTURE_PENDING.md`
- Intra-pilot dep: `plans/done/PLAN_PILOT_SHARED_DISCOVERY.md`
- Catalog input: `clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md` (READ frontmatter `saveLevelTracking:` to branch)
- Test-cases: `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md`
- TC authoring rules: `clients/encore/specs_planning/_internal/tc-authoring-rules.md`
- Test plan: `clients/encore/specs_planning/test-plans/setup/locations/locations_shared_setup_locations_test_plan.md`
- Shared Setup page object: `clients/encore/src/pages/setup/locations/location-shared-setup-locations.page.ts` (375 lines)
- HIST page object: `clients/encore/src/pages/setup/locations/location-management-history.page.ts` (SP-D0 patched)
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-041, LR-046, LR-048, LR-050)
- `.claude/rules/specs.md` (LR-019)
- `clients/encore/CLAUDE.md` (LR-ENC-001, LR-026)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `PLAN_PILOT_SHARED_DISCOVERY.md` Status: DONE in `plans/done/`. If pending → HALT.
2. **SP-D0 idempotent grep-verify** (should be present from PLAN_PILOT_NOTES_TESTS):
   - Grep `clients/encore/src/pages/setup/locations/location-management-history.page.ts` for LR-036 Unicode branch.
   - If found → no-op.
   - If missing → apply the 15-LOC patch (mirror LO history's LR-036).
3. **Branch decision** — read `clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md` frontmatter `saveLevelTracking:` field:
   - `TRACKED` → standard per-column template (Phase 1 path A).
   - `NOT-TRACKED` → hard NOT-TRACKED assertions + bug-candidate feed (Phase 1 path B).
4. **Template selection** (path A only): prefer `tests/specs/setup/locations/history/location-hist-currency.spec.ts`; else any `tests/specs/setup/**/history/*.spec.ts`; else from scratch.
5. **LR-ENC-001 old-site baseline check**: reuse DISCOVERY plan's baseline if ≤14d; else fresh nav2 visit.
6. **`tc-authoring-rules.md` MANDATORY load + Phase 0 grep** per SP-L1.
7. Browser-tool announcement: `Browser tool: none.`

---

## Phase 1 — Author Shared Setup HIST per-column spec (BRANCHES)

### Path A — saveLevelTracking: TRACKED (standard per-column)

1. **File creation**: `clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts` (NEW).
2. **Source**: read catalog. Filter `Tab == Shared Setup Locations`. ~3 parents (Action, ID, Name — or per-catalog).
3. **TC structure** (per-parent template, preserved from SP-D7):
   - TC-SS-HIST-01-ACTION: edit Action → save → verify Action column populated.
   - TC-SS-HIST-02-ID: edit ID → save → verify ID column populated.
   - TC-SS-HIST-03-NAME: edit Name → save → verify Name column populated.
   - (Additional TCs per catalog finding.)
4. **Mirror template** from Notes Tests / Currency / fallback.
5. **LR-019 baseline-state** as first TC.
6. **Zero soft asserts**.
7. **Office 1604 cleanup** in `afterAll`.

### Path B — saveLevelTracking: NOT-TRACKED (hard assertions + bug feed)

1. **File creation**: same path.
2. **TC structure** — hard NOT-TRACKED assertions (preserved from SP-D7 §Method bifurcation):
   - TC-SS-HIST-NOT-TRACKED-01: edit Action → save → verify ZERO new history rows.
   - TC-SS-HIST-NOT-TRACKED-02: edit ID → save → verify ZERO new history rows.
   - TC-SS-HIST-NOT-TRACKED-03: edit Name → save → verify ZERO new history rows.
3. **Bug-candidate cross-reference**: every NOT-TRACKED TC adds a comment `// SSL-SAVE-BUG-A: tracked at reports/bugs/BUG-SSL-SAVE-A.json — remove these assertions when bug fixed and Shared Setup saves produce history rows`. Feed into SP-E-LM-OTHER per SP-D7 §Dependencies.
4. **LR-019 baseline-state** as first TC.
5. **Zero soft asserts**.
6. **Office 1604 cleanup** in `afterAll`.

---

## Phase 2 — Run spec + commit

1. Run: `npx playwright test clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts`.
2. All TCs pass.
3. `/regression-guard` AFTER snapshot.
4. Commit: `feat(hist-pivot): PILOT-SHARED-TESTS — Location Mgmt HIST Shared Setup tests (path <A|B>, <N> TCs).`

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Same disposition rules.

---

## Acceptance criteria

- [ ] SP-D0 patch present.
- [ ] New spec file at `clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts`.
- [ ] Spec branch matches catalog's `saveLevelTracking:` value.
- [ ] All TCs pass locally with zero soft asserts.
- [ ] LR-019 baseline-state enforced as first TC.
- [ ] Office 1604 restored in `afterAll`.
- [ ] If path B: cross-reference comment to `BUG-SSL-SAVE-A.json` in every NOT-TRACKED TC.
- [ ] `/regression-guard` = no silent breakage.
- [ ] Activity-log row per LR-028.
- [ ] `/final-q` v2 verdict emitted.

---

## Verification

```bash
# Spec exists
test -f clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts

# At least 3 test() blocks
grep -c 'test(' clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts
# expect: ≥3

# TC IDs match catalog branch
TRACKING=$(grep -E '^saveLevelTracking:' clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md | awk '{print $2}')
if [ "$TRACKING" = "TRACKED" ]; then
  grep -c 'TC-SS-HIST-0' clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts
  # expect: ≥3
else
  grep -c 'NOT-TRACKED' clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts
  # expect: ≥3
fi

# Suite passes
npx playwright test clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts --reporter=line
```

---

## Handoff

Chat-only summary per `feedback_handoff_in_chat_only.md`:
- Spec path + path A/B branch.
- TC pass result.
- SP-D0 patch status.
- Commit hash.
- `/regression-guard` verdict.

No obstacle claims. **Final plan in pilot**: on close, user reviews all 4 pilot outputs. On approval → scale the pattern (PLAN_PILOT_*) to Jira 1706 / 1710 / 1711 + remaining modules per PLAN_VERTICAL_RESTRUCTURE_PENDING ordering.

Activity-log row:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts | PLAN_PILOT_SHARED_TESTS — Location Mgmt HIST Shared Setup tests (path <A|B>, <N> TCs). |
```
