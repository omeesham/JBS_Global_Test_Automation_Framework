> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 2 diff (LM reconcile)

---

# SUBPLAN SP-B-LM-R: Reconcile + Merge — Location Management Root-Column Catalog

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery — reconciliation)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 2 diff (LM reconcile)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LM-1 through SP-B-LM-9 complete (all LM catalog sessions)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**Identity**: HUNTER or OWNER (desk work — no MCP required, or minimal MCP for spot-checks)
**Skills**: `/planning` + `/audit` + `/identity`
**Estimated**: one session (~2 hours)

---

## Cause

Merge 9+ per-tab catalog files into one authoritative 87-col surface-wide catalog. Resolve orphans (columns with no parent identified in any session). Produce final registries (multi-writer, NOT-TRACKED, duplicate-header, boolean-encoding) for SP-D* consumption.

## Scope

**Inputs** (9 files):
- `hist-root-map-location-management-currency.md` (SP-B-LM-1)
- `hist-root-map-location-management-pricing.md` (SP-B-LM-2)
- `hist-root-map-location-management-local-info-a.md` (SP-B-LM-3a)
- `hist-root-map-location-management-local-info-b.md` (SP-B-LM-3b)
- `hist-root-map-location-management-account-address.md` (SP-B-LM-4)
- `hist-root-map-location-management-legal.md` (SP-B-LM-5)
- `hist-root-map-location-management-notes.md` (SP-B-LM-6)
- `hist-root-map-location-management-shared-setup.md` (SP-B-LM-7)
- `hist-root-map-location-management-auto-addon.md` (SP-B-LM-8)
- `hist-root-map-location-management-top-level.md` (SP-B-LM-9)

**Output**: `clients/encore/specs_planning/catalogs/hist-root-map-location-management.md` (authoritative, 87 cols).

## Method

1. Union all 9+ session catalogs.
2. Walk each of 87 cols → pick primary parent.
3. Multi-writer cases: col claimed by multiple tabs → document in "Multi-writer columns" section (e.g., col 5 vs col 63 "Currency" if either session missed something).
4. Conflicts (same col, different values claimed): resolve via one narrow MCP session; block completion until resolved.
5. Orphans: cols in 87-col list with no parent identified → classify as system-populated (Modified By/On, timestamps) or TRUE ORPHAN (potential app bug: col exists, nothing populates it → feeds SP-E-LM-OTHER).
6. Duplicate-header registry: every repeated header in 87 cols classified `INTENTIONAL-DIFFERENT-PARENT` or `SAME-PARENT-BUG`.
7. NOT-TRACKED registry: merged list across all 9 sessions.
8. Boolean-encoding registry: confirm all boolean cols tagged `unicode` for Location Mgmt (per LR-036).
9. Gate Check before closing.

## Output File Structure

```markdown
# Hist Root Map — Location Management History (Authoritative, 87 cols)
**Reconciled**: 2026-04-20
**Source sessions**: SP-B-LM-1 through SP-B-LM-9
**Coverage**: 87/87 columns

## Column-by-column Map
| Col # | Header | Primary parent | Tab | Control type | Status | Encoding |
...

## Multi-writer columns
## Orphan / System-populated columns
## NOT-TRACKED registry (feeds SP-E-LM-CUR, SP-E-LM-OTHER)
## Duplicate-header registry
## Boolean-encoding registry
## Gate Check
- [ ] All 87 columns classified
- [ ] Zero conflicts unresolved
- [ ] NOT-TRACKED entries have bug candidate IDs
- [ ] Every boolean column has encoding=unicode
```

## KEEP list

- All 9 source session files — do NOT delete. Keep as historical evidence.
- SP1 MCP findings artifact.
- Existing BUG-*.json files.

## Step-by-Step

1. `/identity HUNTER` or `/identity OWNER`.
2. Read all 9 source files.
3. Build 87-row authoritative table.
4. Resolve orphans + conflicts (spawn follow-up MCP if needed).
5. Write authoritative file.
6. Gate Check — all boxes must tick.
7. Commit: `docs(hist-pivot): SP-B-LM-R — reconciled Location Mgmt hist-root-map (authoritative, 87/87 columns)`.

## Verification

1. Authoritative file lists all 87 cols exactly once.
2. Gate Check passes.
3. NOT-TRACKED entries are ready-to-file (LR-034 fields available).

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management.md | SP-B-LM-R — reconciled 87-col hist root-map. 87/87 classified. X NOT-TRACKED candidates. |
   ```
3. `git mv` to done/. Reindex.

## Context for Cold-Start Session

- If Gate Check fails, DO NOT proceed to SP-D* implementation. Spawn follow-up MCP session.
- LR-020 applies: verify plan claims. Cross-check every row against its session source.

## Dependencies

- Requires SP-B-LM-1 through SP-B-LM-9 complete.
- Unblocks SP-D1 through SP-D10 (implementation).
