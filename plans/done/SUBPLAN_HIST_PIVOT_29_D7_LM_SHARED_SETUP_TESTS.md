> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-D7: Location Management HIST Per-Column Tests — Shared Setup Root-Tab

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: SUPERSEDED-2026-05-11
**Superseded-by**: PLAN_PILOT_SHARED_TESTS.md
**Executed**: 2026-05-11

### Execution Summary (2026-05-11 supersession)

SUPERSEDED-2026-05-11 by `PLAN_PILOT_SHARED_TESTS.md` (vertical-pilot derivative). Content preserved 1:1 including the save-level bifurcation: `saveLevelTracking: TRACKED` → standard per-column template, `saveLevelTracking: NOT-TRACKED` → hard NOT-TRACKED assertions + bug-candidate feed to SP-E-LM-OTHER. Same dep relaxations as Notes Tests (SP-B-LM-R relaxed; SP-D0 embedded; SP-D1 relaxed).

- **TCs implemented**: 0.
- **MCP verification**: not performed.
- **Documentation changes**: none — body preserved per `feedback_dont_destroy_user_data.md`.
- **Test pass confirmation**: n/a.

(Original plan body follows below.)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LM-R + SP-D0 + SP-D1 (template)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/find-bugs` + `/identity`
**Estimated**: one session

---

## Cause

Per-column tests for Shared Setup Locations tab root parents (~3: Action, ID, Name). Save-level tracking bifurcation expected.

## Scope

**File (NEW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts`
**Source**: `hist-root-map-location-management.md` filter `Tab == Shared Setup Locations`.
**TC variants based on catalog's save-level tracking finding**:
- If saves produce rows: standard per-column template.
- If saves produce ZERO rows: save-level NOT-TRACKED hard assertions + BUG candidate feeds SP-E-LM-OTHER.

## KEEP list

- Sibling specs untouched.

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". Baseline-absent feature (ECT Settings, EnableMultidayPricing, Merchant Currency column per `OSB-ACCESS-VERIFY-2026-04-24.md`) → record `baselineScope: baseline-absent`, flag for `/encore-questions` escalation — do NOT HALT.

Check catalog first. Branch on save-level finding. Write. Run. Commit.

Commit: `feat(hist-pivot): SP-D7 — Location Mgmt HIST Shared Setup per-column tests`.

## Verification

Save-level tracking enforced per catalog. Zero soft asserts.

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-shared-setup.spec.ts | SP-D7 — Location Mgmt HIST Shared Setup tests. Save-level tracking: <result>. |
```

## Context for Cold-Start Session

- Per SP6 / snapshot model, this tab may produce zero rows. Catalog will tell you.
- Template: SP-D1. Encoding: Unicode ✔.

## Dependencies

SP-B-LM-R + SP-D0. Feeds SP-E-LM-OTHER.
