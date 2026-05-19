> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-B-LO-1: MCP Catalog — Local Office Basic Info → 42-col History Mapping

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery — batched per root-tab)
**Status**: DONE
**Priority**: P0
**Created**: 2026-04-20
**Executed**: 2026-04-20
**Depends on**: SP-A2 complete (clean Local Office specs to work against)
**Identity**: HUNTER or BUILDER with MCP (session operates on live DOM)
**Skills**: `/research` (MCP exploration) + `/planning` (catalog authoring) + `/identity`
**Estimated**: one session (2–3 hours — ≤15 parent fields per session hard cap)

---

## Cause

The Local Office Settings History has 42 columns. To write per-column tests we need to know WHICH root field on WHICH tab populates each column. No such catalog exists. This session maps the Basic Info tab's parent fields to their corresponding hist columns via live MCP — ≤15 parents per session to prevent context overflow / hallucination.

---

## Scope

**Target tab**: Local Office Settings → Basic Information tab (office 1604).
**Parent field budget**: up to 15 fields (if Basic Info has more, split a follow-up session SP-B-LO-1b). Prioritize top-level Basic Info fields first: Name, Active, Live Date, Tax Mode, Country, Region, Servicing Branch Office, Line Of Business, Pay To Address, Union, eCommerce Active, Enable Productions Orders, plus ~3 sub-section toggles.
**Target surface**: 42-col Local Office Settings History table.

---

## Method — MCP Catalog Procedure

1. Open office 1604 → Local Office Settings → Basic Information tab.
2. Read 42-col history table current state: capture full top row values (baseline).
3. For each parent field in scope (≤15):
   a. Capture baseline value + state (checked / unchecked / current value).
   b. Change the field to a VALID new state (per control-type taxonomy in master plan §5 SP-C1 template).
   c. Click Save. Wait for save confirmation (Angular dirty state cleared per LR-026).
   d. Navigate to History tab (or scroll if already visible).
   e. Capture top-row values again.
   f. Diff: which columns changed? Which column reflects the parent's new value?
   g. Record mapping: `(parent field → target column + evidence + status)` per catalog output format.
   h. Classify: TRACKED (value appeared in expected col), NOT-TRACKED (no col reflects the change), SPURIOUS (col changed but shouldn't have), DUPLICATE (multiple cols reflect same change).
   i. Restore baseline state + save (keeps office state clean for next session).
4. For boolean fields: record encoding per LR-036 (SVG `lucide-check` for Local Office — confirmed prior). `assertBooleanCell` will need `encoding: 'svg'` for all Local Office columns.
5. For NOT-TRACKED fields: note as candidate for SP-E-LO bug filing.

---

## Output Format

**File**: `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md`

```markdown
# Hist Root Map — Local Office Settings History / Basic Information Tab
**Session**: 2026-04-20 (or actual date)
**Agent**: HUNTER/BUILDER (<name>)
**Office**: 1604 (Parker Palm Springs)
**Scope**: Basic Information tab parents → 42-col Local Office Settings History
**Reference**: SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2 for 42-col header list

## Parent → Column Map

| Parent field | Control type | State space | Target col (index, header) | Status | Encoding | Evidence (save timestamp → row timestamp) | Notes / Bug candidate |
|---|---|---|---|---|---|---|---|
| Local Office Name | textbox | {empty, valid, long, special-chars} | col 2 "Local Office Name" | TRACKED | text | 14:05 save "Parker-X" → 14:06 row "Parker-X" | — |
| Active | checkbox | {true, false} | col 3 "Active" | TRACKED | svg lucide-check | 14:08 uncheck → 14:09 row svg absent | — |
| ... | | | | | | | |

## Orphan columns (no parent identified in this session)
| Col index | Header | Suspected source | Follow-up |
|---|---|---|---|

## NOT-TRACKED registry (feeds SP-E-LO)
| Parent field | Control type | MCP evidence | Bug candidate ID |
|---|---|---|---|

## Duplicate-header flag
| Cols with same header text | Same parent or different | Notes |
|---|---|---|

## Boolean-encoding registry (per LR-036)
| Col index | Header | Encoding (svg \| unicode \| text) | Detection pattern |
|---|---|---|---|
```

---

## KEEP list — DO NOT TOUCH

- Office 1604 final state: restore to baseline before ending session.
- `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` — input artifact, do not edit.
- Existing page object methods — use them via MCP, do not modify code in this session.
- Any other tab on Local Office Settings — out of scope (handled by SP-B-LO-2 for ECT).

---

## Step-by-Step Execution

1. `/identity HUNTER` (or BUILDER if you need to cross-reference page object methods).
2. MCP navigate to office 1604 → Local Office Settings → Basic Information.
3. Capture 42-col history baseline (top row) via `browser_snapshot` or `browser_evaluate(() => [...document.querySelectorAll('...row-cells')].map(c => c.textContent))`.
4. For each of up to 15 parent fields: follow Method procedure steps 3a–i. Keep a running notes doc.
5. After all parents mapped, restore office 1604 to baseline state. Confirm by re-reading top row.
6. Author the catalog file per Output Format.
7. Commit: `docs(hist-pivot): SP-B-LO-1 — catalog Local Office Basic Info → 42-col history mapping`.

---

## Verification

1. Catalog file created at the specified path.
2. Every entry has MCP-evidence columns filled (save timestamp + row timestamp + diff).
3. Every NOT-TRACKED entry has a bug candidate ID assigned (even if batch-filed later in SP-E).
4. Office 1604 Basic Info state restored to pre-session baseline.
5. Session covered ≤15 parents (hard cap).

---

## Handoff Signals

1. the file's Status field to DONE + Executed date.
2. Activity-log row (LR-037 wall-clock):
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md | SP-B-LO-1 — MCP catalog session: Basic Info → 42-col history. N parents mapped: X TRACKED, Y NOT-TRACKED, Z orphan. |
   ```
3. `git mv` this subplan to `plans/done/`.
4. `npm run plans:reindex`.

---

## Context for Cold-Start Session

- Master plan §5 SP-B section for catalog file format.
- `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` §2 has the 42-col header list — READ FIRST.
- LR-036 declared Local Office history uses SVG `lucide-check` for booleans — detection via `innerHTML.includes('lucide-check')`.
- LR-025 if sort on history table needed (Radix retry pattern exists in page object method `clickSortColumn`).
- LR-026 Angular dirty state — wait for Save button to disable AFTER save completes to confirm persistence.
- LR-032 MCP agents investigate, don't theorize — actually drive the save; don't infer mappings from docs.

---

## Dependencies

- Depends on SP-A2 (so Local Office specs are clean — not strictly necessary for MCP work, but avoids confusion).
- Unblocks SP-B-LO-R (reconciliation) and eventually SP-C1 (Basic Info column tests).
- If Basic Info has >15 parents: spawn SP-B-LO-1b with residual parents.

---

## Execution Summary (2026-04-20)

**Catalog**: `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` — 15 parents mapped, all TRACKED, clean 1-col diffs, no cascades, no spurious cols, baseline restored.

**Plan correction** (flagged in catalog): the subplan's §Scope listed Location Management fields (Name, Active, Live Date, Tax Mode, Country, Region, LOB, eCommerce Active, Enable Productions Orders). Those fields live on the Location Management → Basic Information page, not the Local Office Settings → Basic Information page (different tabs on different pages). Local Office Basic Info exposes date offsets, service-type/logo/section checkboxes, phone numbers, default-job/default-order toggles, Notes, and combobox parents. 15 parents of this correct set were cataloged.

**Parents cataloged (15 / 15 session cap — ≤15 per LR rule honored)**

| # | Parent | Target col | Status |
|---|---|---|---|
| P1 | Prep Date Offset | col 1 | TRACKED |
| P2 | Return Date Offset | col 2 | TRACKED |
| P3 | Set Date Offset | col 3 | TRACKED |
| P4 | Strike Date Offset | col 4 | TRACKED |
| P5 | Delivery Date Offset | col 6 | TRACKED |
| P6 | Pickup Date Offset | col 5 | TRACKED |
| P7 | Use Fulfillment | col 7 | TRACKED |
| P8 | Use Availability | col 8 | TRACKED |
| P9 | Print Description | col 10 | TRACKED |
| P10 | Use Subrent Service Type | col 11 | TRACKED |
| P11 | Phone 1 | col 12 | TRACKED |
| P12 | Phone 2 | col 13 | TRACKED |
| P13 | Use Section | col 14 | TRACKED (no cascade on Section sub-table) |
| P14 | Use On Quote (Logo) | col 18 | TRACKED (no cascade on Logo Name) |
| P15 | Use On Rental (Logo) | col 19 | TRACKED (no cascade on Logo Name) |

**MCP verification**

- Office 1604, cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office.
- Baseline top row read at session start; restore confirmed end-of-session (all 40 non-timestamp columns byte-match).
- Tool mix: Claude in Chrome (`javascript_tool`, `computer`, `find`) for most cycles; native click via Pointer event sequence required for Radix tab switches (documented as method note in catalog).
- Every change+save produced clean 1-col diff (target col + Modified On). No cascades on sub-table columns, no spurious col flips. Boolean encoding confirmed `svg lucide-check` for all 8 boolean parents tested this session.

**Deferred to SP-B-LO-1b**: ~7 Basic Info parents remain uncataloged — Use Equipment QC, Marriott PMS, Default Job 1-day Event/Outside/Internal trio, Default Labor Hourly, Same Priority, Items Filled, Default Order Type combobox, Notes textarea, Company Logo combobox, Section sub-table row ops, Service Type Exempt sub-table row ops. 15-parent session cap reached for SP-B-LO-1; 1b session will continue.

**Deferred to SP-B-LO-2**: ECT tab → cols 32–39.

**Documentation changes**

- Created `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` (new, ~265 lines).
- This subplan: Status → DONE, Executed 2026-04-20, this Execution Summary added.
- Activity log row appended per LR-028 / LR-037 (wall-clock ≥ mtime of touched files).

**Test pass confirmation**: N/A for this session — no test code written or changed. The catalog is an input artifact for SP-C1 (per-column TCs) and SP-B-LO-R (reconciliation).

**Rules honored**: LR-020 (plan claim of Location-Management-style field list verified against MCP before cataloging — confirmed wrong, flagged as plan correction in catalog), LR-027 (this Execution Summary), LR-028 (activity-log row), LR-032 (all mappings came from live MCP drives, not doc inference), LR-035 (plans:reindex to follow), LR-037 (activity-log wall-clock time ≥ mtime of touched files).

**Unblocks**: SP-B-LO-1b (residual Basic Info), SP-B-LO-R (reconciliation), SP-C1 (can start per-column TCs for the 15 mapped parents immediately).

outcome:pass, attempts:1, rules-written:0.
