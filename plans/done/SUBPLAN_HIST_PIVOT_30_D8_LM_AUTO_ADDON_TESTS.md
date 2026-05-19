> **ARCHIVED — DO NOT EXECUTE.** Superseded by: PLAN_LM_HISTORY_COVERAGE (Auto Add-On column tests)

---

# SUBPLAN SP-D8: Location Management HIST Per-Column Tests — Auto Add-On Root-Tab

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: SUPERSEDED
**Superseded by**: PLAN_LM_HISTORY_COVERAGE (Auto Add-On column tests)
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

Per-column tests for Auto Add-On tab (5 checkbox parents). SP-B-LM-8 bifurcation determines whether saves produce rows at all. Spec encodes the confirmed behavior as hard assertions.

## Scope

**File (NEW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-auto-addon.spec.ts`
**Source**: `hist-root-map-location-management.md` filter `Tab == Auto Add-On`.
**Branch on catalog finding**:
- If AAO saves produce Modified-By-only rows: write TCs asserting that specific behavior.
- If AAO saves produce ZERO rows: write TCs asserting row count unchanged post-save. All 5 parents get a SAVE-NOROW hard assertion.

## KEEP list

- Sibling specs untouched.

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". Baseline-absent feature (ECT Settings, EnableMultidayPricing, Merchant Currency column per `OSB-ACCESS-VERIFY-2026-04-24.md`) → record `baselineScope: baseline-absent`, flag for `/encore-questions` escalation — do NOT HALT.

Check catalog. Branch. Write. Run. Commit.

Commit: `feat(hist-pivot): SP-D8 — Location Mgmt HIST Auto Add-On per-column tests`.

## Verification

All TCs pass. Zero soft asserts. Save-level tracking per catalog enforced.

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-auto-addon.spec.ts | SP-D8 — Location Mgmt HIST Auto Add-On tests. Save-level tracking: <confirmed bifurcation>. |
```

## Context for Cold-Start Session

- Candidate AAO-BUG-A: 5 checkbox fields NOT-TRACKED. Spec hard-asserts the confirmed bifurcation.
- Encoding: Unicode ✔ (LM history).
- Template: SP-D1.

## Dependencies

SP-B-LM-R + SP-D0. Feeds SP-E-LM-OTHER.
