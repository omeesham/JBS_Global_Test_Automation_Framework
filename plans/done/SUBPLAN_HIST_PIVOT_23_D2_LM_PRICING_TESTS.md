> **ARCHIVED — DO NOT EXECUTE.** Superseded by: PLAN_LM_HISTORY_COVERAGE (Pricing column tests)

---

# SUBPLAN SP-D2: Location Management HIST Per-Column Tests — Pricing Root-Tab

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: SUPERSEDED
**Superseded by**: PLAN_LM_HISTORY_COVERAGE (Pricing column tests)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LM-R + SP-D0 + SP-D1 (as template reference)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/find-bugs` + `/identity`
**Estimated**: one session

---

## Cause

Per-column tests for columns whose root lives on Pricing tab. Key focus: col 63 "Currency" (Pricing-owned duplicate header of col 5). Plus BUG-HIS-001 EnableMultidayPricing NOT-TRACKED verification.

---

## Scope

**File (NEW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-pricing.spec.ts`
**Source**: `hist-root-map-location-management.md`, filter `Tab == Pricing`.

**TCs**:
- State-space per Pricing parent (equivalence classes).
- Col 63 cross-contamination: verify col 5 "Currency" unchanged across Pricing saves.
- NOT-TRACKED guards (e.g., EnableMultidayPricing phantom-row per BUG-HIS-001).
- Metadata + fidelity + negative cases (same template as SP-D1).

---

## KEEP list

- SP-D1 Currency spec untouched (sibling file).
- All Pricing-tab production code — untouched.

---

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". Baseline-absent feature (ECT Settings, EnableMultidayPricing, Merchant Currency column per `OSB-ACCESS-VERIFY-2026-04-24.md`) → record `baselineScope: baseline-absent`, flag for `/encore-questions` escalation — do NOT HALT.

Mirror SP-D1 structure. Write spec file. Run individually. Triage. Commit.

Commit: `feat(hist-pivot): SP-D2 — Location Mgmt HIST Pricing per-column tests`.

---

## Verification

All TCs pass. Zero `expect.soft()`. Col 5 untouched across Pricing saves.

---

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-pricing.spec.ts | SP-D2 — Location Mgmt HIST Pricing tests. Col 63 cross-contamination guard active. |
```

---

## Context for Cold-Start Session

- BUG-HIS-001 is pre-existing — new TC formalizes it as hard phantom-row assertion.
- Template: SP-D1.

---

## Dependencies

SP-B-LM-R + SP-D0. Feeds SP-E-LM-OTHER.
