> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 5.5. **Browser tool selection**: this subplan interacts with the live app. Select Playwright CLI vs Claude in Chrome per **LR-038 v2** task-class matrix (root CLAUDE.md). For deep catalog walkthroughs (>10 fields, repeated snapshots) the default is **Playwright CLI** (YAML-on-disk, ~4× token savings); for auth-heavy / live-RCA / visual assertions the default is **Claude in Chrome**. Announce choice + reason in your first output and activity-log row.
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

# SUBPLAN SP-B-LM-R: Reconcile + Merge — Location Management Root-Column Catalog

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery — reconciliation)
**Status**: Pending
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
