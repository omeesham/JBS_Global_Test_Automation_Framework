> **ARCHIVED — DO NOT EXECUTE.** Superseded by: PLAN_LM_HISTORY_COVERAGE (Local Info Part A column tests)

---

# SUBPLAN SP-D3a: Location Management HIST Per-Column Tests — Local Info Root-Tab (Part A)

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: SUPERSEDED
**Superseded by**: PLAN_LM_HISTORY_COVERAGE (Local Info Part A column tests)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LM-R + SP-D0 + SP-D1 (template)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/find-bugs` + `/identity`
**Estimated**: one session (cap ~20 cols per file or split)

---

## Cause

Local Info has the largest set of columns (~20+). Split into 3a/3b to keep sessions focused and file size manageable.

---

## Scope

**File (NEW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-local-info.spec.ts`
**Source**: `hist-root-map-location-management.md`, filter `Tab == Local Information` (subset from SP-B-LM-3a catalog).

**TCs**: per standard template (SP-D1). Key columns: Billing Type (col 12), Billing Cycle (col 14), Billing Way (col 15/16), Labor/Equip Pricing (cols 17-21), Allow DPCD (col 22), Exclude Implied Discount (col 23), Prompt For Approval (col 24), Threshold (col 25), Enable LDW (col 26), LDW Percentage (col 27), etc.

---

## KEEP list

- Sibling spec files — untouched.
- Production code — untouched.

---

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". Baseline-absent feature (ECT Settings, EnableMultidayPricing, Merchant Currency column per `OSB-ACCESS-VERIFY-2026-04-24.md`) → record `baselineScope: baseline-absent`, flag for `/encore-questions` escalation — do NOT HALT.

Mirror SP-D1. Write TCs for Part-A columns (those mapped in SP-B-LM-3a). Create file. Run. Triage. Commit.

If file approaches 1500 LOC: close this subplan + spawn SP-D3b for remaining cols.

---

## Verification

All TCs pass. File stays under 1500 LOC (or spawn 3b).

---

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-local-info.spec.ts | SP-D3a — Local Info per-column tests Part A. N cols covered. |
```

---

## Context for Cold-Start Session

- Local Info has ~20+ cols — do not try to do them all in one session.
- Template: SP-D1.
- LR-009 reminder: recovery values must differ from server-saved to trigger Angular dirty detection.

---

## Dependencies

SP-B-LM-R + SP-D0. Feeds SP-D3b + SP-E-LM-OTHER.
