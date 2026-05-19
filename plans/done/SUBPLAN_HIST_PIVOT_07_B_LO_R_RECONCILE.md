> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-B-LO-R: Reconcile + Merge — Local Office Root-Column Catalog

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery — reconciliation)
**Status**: DONE
**Executed**: 2026-04-22
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-B-LO-1 + SP-B-LO-2 complete
**Identity**: HUNTER or OWNER (desk work — no MCP required)
**Skills**: `/planning` + `/audit` + `/identity`
**Estimated**: one session (~1.5 hours, desk work)

---

## Cause

Per-tab catalog sessions (SP-B-LO-1, SP-B-LO-2) may leave orphan columns ("no parent identified in scope") and may have cross-session conflicts (same column claimed by two parents). Reconciliation merges session catalogs into one authoritative surface-wide catalog, resolves orphans, and produces the final registry that SP-C1/C2 implementation sessions consume.

---

## Scope

**Inputs**:
- `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` (from SP-B-LO-1)
- `clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md` (from SP-B-LO-2)
- `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` §2 — authoritative 42-col header list

**Output**: `clients/encore/specs_planning/catalogs/hist-root-map-local-office.md` (merged, authoritative)

---

## Method

1. Union both session catalogs. Every column (1–42) in the 42-col list must appear exactly once.
2. Resolve conflicts:
   - Same column claimed by two parents from different tabs → flag in new "multi-writer columns" section. Both sessions' evidence carries.
   - Same column with conflicting values → re-run a narrow MCP session (SP-B-LO-1c or -2b) to resolve. Blocks SP-B-LO-R completion until resolved.
3. Orphans: columns in the 42-col list not claimed by either session → mark `UNKNOWN_ROOT — needs cross-tab MCP`. If more than 3 orphans, spawn SP-B-LO-3 to hunt for their roots in other UI areas. If ≤3 and they are boolean/date metadata (Modified By, Modified On, etc.), classify as `SYSTEM-POPULATED` and close.
4. Duplicate-header columns: consolidate entries from both sessions, classify each as `INTENTIONAL-DIFFERENT-PARENT` or `SAME-PARENT-BUG` (feeds SP-E-LO).
5. NOT-TRACKED registry: merge both sessions' NOT-TRACKED entries into one list with unique bug candidate IDs.
6. Boolean-encoding registry: all Local Office columns should be `encoding: svg` per LR-036. Confirm every boolean column has this tag.

---

## Output File Structure

```markdown
# Hist Root Map — Local Office Settings History (Authoritative, 42 cols)
**Reconciled**: 2026-04-20
**Source sessions**: SP-B-LO-1 (Basic Info), SP-B-LO-2 (ECT)
**Coverage**: 42/42 columns (0 unresolved if complete)

## Column-by-column Map
| Col # | Header | Primary parent | Tab | Control type | Status | Encoding |
|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... | ... |
| 42 | ... | ... | ... | ... | ... | ... |

## Multi-writer columns (one column written by multiple parents)
| Col | Header | Parents (tab, field) | Test design implication |
|---|---|---|---|

## Orphan / System-populated columns
| Col | Header | Classification | Notes |
|---|---|---|---|

## NOT-TRACKED registry (FINAL — feeds SP-E-LO)
| Parent field | Tab | Control type | Bug candidate ID | MCP session |
|---|---|---|---|---|

## Duplicate-header registry
| Cols with same header | Classification | Notes |
|---|---|---|

## Boolean-encoding registry (per LR-036)
| Col | Encoding | Detection pattern |
|---|---|---|

## Gate Check
- [ ] All 42 columns classified
- [ ] Zero conflicts unresolved
- [ ] NOT-TRACKED entries have bug candidate IDs
- [ ] Every boolean column has encoding tag
```

---

## KEEP list

- Session source files (SP-B-LO-1, SP-B-LO-2 output) — do NOT delete. They are historical evidence. Can mark them as "superseded by hist-root-map-local-office.md" at top, but keep content.
- `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` — still authoritative for 42-col header list.

---

## Step-by-Step Execution

1. `/identity HUNTER` or `/identity OWNER`.
2. Read SP-B-LO-1 + SP-B-LO-2 catalog files.
3. Build a 42-row table (one per column) in memory / scratch pad.
4. Walk each column → pick primary parent from session findings. If multiple claim → multi-writer. If none claim → orphan hunt or system-populated.
5. Resolve conflicts via one narrow MCP session if needed (document reason before spawning).
6. Populate all sections per Output File Structure.
7. Run Gate Check — all 4 boxes must be checked.
8. Commit: `docs(hist-pivot): SP-B-LO-R — reconciled Local Office hist-root-map (authoritative, 42/42 columns)`.

---

## Verification

1. `hist-root-map-local-office.md` exists and lists all 42 columns.
2. No column is missing, no column appears twice.
3. All Gate Check boxes ticked.
4. NOT-TRACKED entries are ready-to-file (have all LR-034 fields available).

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log row:
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-local-office.md | SP-B-LO-R — reconciled Local Office hist root-map. 42/42 columns classified. X NOT-TRACKED candidates for SP-E-LO. |
   ```
3. `git mv` to `plans/done/`.
4. `npm run plans:reindex`.

---

## Context for Cold-Start Session

- Master plan §5 SP-B section.
- SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2 has the 42-col header list.
- If Gate Check fails, DO NOT proceed to SP-C1. Spawn follow-up MCP session.
- LR-033 for network checking if a parent save produces zero API calls (client blocked vs server rejected).

---

## Dependencies

- Requires SP-B-LO-1 + SP-B-LO-2 complete.
- Unblocks SP-C1 (Local Office Basic Info column tests) and SP-C2 (ECT column tests).

---

## Execution Summary (2026-04-22)

**Browser tool**: NONE — desk work only (per LR-038 declaration in activity-log row).

**Output produced** (1 new file):
- [`clients/encore/specs_planning/catalogs/hist-root-map-local-office.md`](../../clients/encore/specs_planning/catalogs/hist-root-map-local-office.md) — authoritative 42-col reconciled root-map (1-indexed in output; source per-tab catalogs were 0-indexed; translation rule documented at top of output).

**TCs**: none — this plan is a pure documentation merge / reconciliation. No spec or test artefacts touched.

**MCP verification**: none required. All save-cycle / class-level evidence was settled by upstream catalog sessions:
- SP-B-LO-1 (Basic Info parents P1–P15 — TRACKED via timestamped MCP evidence)
- SP-B-LO-1b residual (P16/P17/P25 DOM-only classification → bug candidates)
- SP-B-LO-1b retry #2 (P18/P22 TRACKED) + retry #3 (P19/P20/P21/P23/P24/P26/P27/P28 TRACKED)
- SP-B-LO-2 (3 ECT classes class-level NOT-TRACKED at save level → LOS-ECT-BUG-A inferred for class)
- SP-B-LO-2b direct verification (class-level CONFIRMED for all 3 ECT classes via row-0/33/65 Labor Cost exemplars + multi-field BONUS save + cols 33–40 PROBE; BUG-LOC-ECT-001 silent-write-failure for `benefitMultiplier` filed at `reports/bugs/BUG-LOC-ECT-001.json`).

**Documentation changes**: 1 new catalog file (above). Source per-tab catalogs explicitly marked superseded-but-retained for evidence preservation.

**Coverage**: 42/42 columns classified. Multi-writer conflicts: 0. Unresolved orphans: 0 (14 orphans all evidenced as DERIVED / SUB-TABLE-ACTION / RECORD-ACTION / SYSTEM-POPULATED-at-Basic-Info-save). NOT-TRACKED bug candidates carried to SP-E-LO: 5 (BUG-LO-001, BUG-LO-002, BUG-LO-003, LOS-ECT-BUG-A, BUG-LOC-ECT-001 cross-link). Newly discovered Basic Info fields without history columns (PO Number, PO Number Label, Room Configuration sub-table) deferred to SP-E-LO pending REQUIREMENTS cross-check.

**Gate Check** (subplan §Output File Structure): all 4 boxes ticked in the output file with explicit evidence trail to source catalogs.

**Pass confirmation**: 4/4 gate-check boxes legitimately ticked + LR-020 cross-reference verification pass (all 5 referenced files — reports/bugs/BUG-LOC-ECT-001.json, clients/encore/CLAUDE.md (LR-036), both per-tab catalogs, SUBPLAN_HISTORY_01_MCP_FINDINGS.md — verified to exist on disk).

**Unblocks**: SP-C1 (Basic Info per-column TC implementation) + SP-C2 (ECT per-column TC implementation).

