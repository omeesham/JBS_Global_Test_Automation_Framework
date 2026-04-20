> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 5.5. **Browser tool selection**: this subplan interacts with the live app. Select Claude in Chrome vs Playwright MCP per **LR-038** (root CLAUDE.md). Default for Claude Code: **Claude in Chrome** (auth-heavy, catalog work, token-efficient). Announce choice + reason in your first output and activity-log row.
> 6. **Phase 0 FIRST (if present in Step-by-Step)**: execute the "Phase 0 — Date-Forensic Self-Discovery" step before any code or doc edits. Document findings (with dispositions) in your activity-log row.
> 7. **Execute Phases 1+** per Step-by-Step in order.
> 8. **Handoff**: on success, apply the Handoff Signals block — set the file's Status field to DONE + Executed date in this file, append activity-log row (LR-028 + LR-037 wall-clock time ≥ mtime of every touched file), `git mv` this file to `plans/done/`, run `npm run plans:reindex`, commit (one commit per LR-027 boundary).
>
> **HALT + ASK USER** (do NOT silently proceed) if:
> - Any `**Depends on**` item is not DONE.
> - Phase 0 uncovers scope extension >30% beyond the listed starting point (user confirms before acting on unscoped items).
> - Genuine ambiguity in scope beyond the master plan §3 KEEP list.
> - `/regression-guard` diff shows changes unrelated to this subplan's stated scope.
> - Activity-log preflight (`npm run validate:activity-log:preflight`) would fail for your row.

---

# SUBPLAN SP-B-LO-R: Reconcile + Merge — Local Office Root-Column Catalog

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery — reconciliation)
**Status**: Pending
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
