> **ARCHIVED — DO NOT EXECUTE.** Superseded by: PLAN_LM_HISTORY_COVERAGE (Account & Address column tests)

---

# SUBPLAN SP-D4: Location Management HIST Per-Column Tests — Account & Address Root-Tab

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: SUPERSEDED
**Superseded by**: PLAN_LM_HISTORY_COVERAGE (Account & Address column tests)
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

Per-column tests for columns whose root lives on Account & Address tab (~6 parents).

## Scope

**File (NEW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-account-address.spec.ts`
**Source**: `hist-root-map-location-management.md` filter `Tab == Account and Address`.
**TCs**: standard template. Text-field equivalence classes + metadata + fidelity + negative.

## KEEP list

- Other sibling specs untouched.
- Production code untouched.

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". Baseline-absent feature (ECT Settings, EnableMultidayPricing, Merchant Currency column per `OSB-ACCESS-VERIFY-2026-04-24.md`) → record `baselineScope: baseline-absent`, flag for `/encore-questions` escalation — do NOT HALT.

Mirror SP-D1. Write. Run. Triage. Commit.

Commit: `feat(hist-pivot): SP-D4 — Location Mgmt HIST Account & Address per-column tests`.

## Verification

All TCs pass. Zero `expect.soft()`.

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-account-address.spec.ts | SP-D4 — Location Mgmt HIST Account & Address tests. |
```

## Context for Cold-Start Session

- Phone fields: equivalence classes include empty, valid format, invalid format, edge cases.
- Encoding: Unicode ✔.
- Template: SP-D1.

## Dependencies

SP-B-LM-R + SP-D0. Feeds SP-E-LM-OTHER.
