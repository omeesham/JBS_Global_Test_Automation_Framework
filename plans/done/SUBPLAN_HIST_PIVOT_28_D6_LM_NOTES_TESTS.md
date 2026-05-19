> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-D6: Location Management HIST Per-Column Tests — Notes Root-Tab

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: SUPERSEDED-2026-05-11
**Superseded-by**: PLAN_PILOT_NOTES_TESTS.md
**Executed**: 2026-05-11

### Execution Summary (2026-05-11 supersession)

SUPERSEDED-2026-05-11 by `PLAN_PILOT_NOTES_TESTS.md` (vertical-pilot derivative). Content preserved 1:1 in the successor plan, with relaxed deps: SP-B-LM-R (master reconcile) → relaxed to per-tab catalog from `PLAN_PILOT_NOTES_DISCOVERY.md`; SP-D0 (15-LOC patch) → embedded as Phase 0 idempotent grep-and-patch step; SP-D1 (Currency template) → relaxed to template-fallback chain (Currency → any HIST spec → from scratch).

- **TCs implemented**: 0 (work folded into successor plan).
- **MCP verification**: not performed.
- **Documentation changes**: none — file body preserved verbatim per `feedback_dont_destroy_user_data.md`.
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

Per-column tests for Notes tab — single aggregate column (snapshot col 69 or equivalent).

## Scope

**File (NEW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-notes.spec.ts`
**Source**: `hist-root-map-location-management.md` filter `Tab == Notes`.
**TCs**: text equivalence classes (empty, valid, long, special chars, newlines, unicode). Verify aggregate column stores full blob, not delta.

## KEEP list

- Sibling specs untouched.

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". Baseline-absent feature (ECT Settings, EnableMultidayPricing, Merchant Currency column per `OSB-ACCESS-VERIFY-2026-04-24.md`) → record `baselineScope: baseline-absent`, flag for `/encore-questions` escalation — do NOT HALT.

Mirror SP-D1. Text content equivalence focus. Run. Commit.

Commit: `feat(hist-pivot): SP-D6 — Location Mgmt HIST Notes per-column tests`.

## Verification

Aggregate column matches saved Notes blob byte-for-byte (or with expected encoding transforms). Zero soft asserts.

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-notes.spec.ts | SP-D6 — Location Mgmt HIST Notes tests (aggregate column). |
```

## Context for Cold-Start Session

- Aggregate snapshot col, not per-field.
- Watch for HTML escaping / newline handling.
- Encoding: `text`.

## Dependencies

SP-B-LM-R + SP-D0. Feeds SP-E-LM-OTHER.
