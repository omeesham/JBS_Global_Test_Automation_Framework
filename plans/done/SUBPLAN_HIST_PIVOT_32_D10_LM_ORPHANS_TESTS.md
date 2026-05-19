> **ARCHIVED — DO NOT EXECUTE.** Superseded by: PLAN_LM_HISTORY_COVERAGE (LM orphans column tests)

---

# SUBPLAN SP-D10: Location Management HIST Per-Column Tests — Orphan Columns

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: SUPERSEDED
**Superseded by**: PLAN_LM_HISTORY_COVERAGE (LM orphans column tests)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LM-R + SP-D0 + SP-D1 (template)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/find-bugs` + `/identity`
**Estimated**: one session (or skip if no orphans)

---

## Cause

Any 87-col Location Management History columns that SP-B-LM-R classified as TRUE ORPHAN (not system-populated, no root identified anywhere) deserve phantom-row guard tests. These are likely app bugs — column exists, nothing writes to it.

## Scope

**File (NEW, CONDITIONAL)**: `clients/encore/tests/specs/setup/locations/history/location-hist-orphans.spec.ts`
**Source**: `hist-root-map-location-management.md` → "Orphan / System-populated" section, filter TRUE ORPHAN rows.
**TCs**: per orphan, one phantom-row TC that saves every related parent (candidates from all tabs) and asserts the orphan col stays empty across all saves.

## KEEP list

- Sibling specs untouched.

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". For orphan columns: verify orphan status holds on old-site LM History (same 87-col schema) — if the column is also empty-everywhere on old site, the orphan classification is confirmed cross-site (strong discussion-item per `feedback_discussion_item_not_bug.md`). If SKIPPED path is taken (zero TRUE ORPHANs), note "baseline consultation N/A — subplan closed without TC authoring" in the close commit.

1. `/identity BUILDER`.
2. Read orphan section. If zero TRUE ORPHANs → mark this subplan `SKIPPED` in status, commit the subplan status change, and close. No spec file created.
3. If TRUE ORPHANs exist: create the spec file. For each orphan col:
   - Write a TC that saves a representative variety of parent fields (1–2 per tab).
   - After each save, assert orphan col stays empty/default.
   - Aggregate findings → BUG candidate `BUG-HIS-ORPHAN-COL{N}` for SP-E-LM-OTHER.
4. Run spec. Triage.
5. Commit: `feat(hist-pivot): SP-D10 — Location Mgmt HIST orphan-column phantom-row tests`.

## Verification

1. If spec file created: all TCs pass (orphan col correctly stays empty).
2. Each orphan col has bug candidate documented for SP-E-LM-OTHER.
3. If skipped: clean skip marker + no dangling files.

## Handoff Signals

If executed:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-orphans.spec.ts | SP-D10 — Location Mgmt HIST orphan-column guards. N orphan cols tested. |
```

If skipped:
```
| YYYY-MM-DDThh:mm | builder | skipped | plans/pending/SUBPLAN_HIST_PIVOT_D10_LM_ORPHANS_TESTS.md | SP-D10 — no TRUE ORPHANs in catalog; subplan not applicable. |
```

## Context for Cold-Start Session

- SP-B-LM-R catalog is the SOLE input for scope selection.
- Template: SP-D1 with phantom-row adaptation.

## Dependencies

SP-B-LM-R + SP-D0. Feeds SP-E-LM-OTHER if orphans found.
