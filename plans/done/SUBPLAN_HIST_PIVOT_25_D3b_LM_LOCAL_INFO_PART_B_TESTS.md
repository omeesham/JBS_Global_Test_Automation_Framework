> **ARCHIVED — DO NOT EXECUTE.** Superseded by: PLAN_LM_HISTORY_COVERAGE (Local Info Part B column tests)

---

# SUBPLAN SP-D3b: Location Management HIST Per-Column Tests — Local Info Root-Tab (Part B)

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: SUPERSEDED
**Superseded by**: PLAN_LM_HISTORY_COVERAGE (Local Info Part B column tests)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-D3a complete + SP-B-LM-R + SP-D0
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/find-bugs` + `/identity`
**Estimated**: one session

---

## Cause

Complete per-column tests for Local Info columns deferred by SP-D3a.

---

## Scope

**File (NEW or GROW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-local-info-b.spec.ts` if 3a's file is >1500 LOC, else GROW the 3a file.
**Source**: `hist-root-map-location-management.md` — columns mapped in SP-B-LM-3b.

---

## KEEP list

- SP-D3a file untouched unless growing it.
- All other sibling specs untouched.

---

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". Baseline-absent feature (ECT Settings, EnableMultidayPricing, Merchant Currency column per `OSB-ACCESS-VERIFY-2026-04-24.md`) → record `baselineScope: baseline-absent`, flag for `/encore-questions` escalation — do NOT HALT.

Mirror SP-D1. Write TCs for Part-B cols. Run. Commit.

---

## Verification

All TCs pass. Combined 3a + 3b covers all Local Info cols.

---

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-local-info-b.spec.ts | SP-D3b — Local Info per-column tests Part B. Combined with 3a: all Local Info cols covered. |
```

---

## Context for Cold-Start Session

- Check SP-D3a file first — determine GROW vs NEW FILE based on size.

---

## Dependencies

SP-D3a. Feeds SP-E-LM-OTHER.
