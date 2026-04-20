> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think tier.
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/`. If any blocker → HALT + report to user.
> 5. **Context load**: read `plans/done/SUBPLAN_HIST_PIVOT_05_B_LO_1_BASIC_INFO_CATALOG.md` (parent session) + `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` (existing catalog to extend) + master plan §5 SP-B section.
> 5.5 **Browser tool selection (LR-038)**: this session REQUIRES live DOM drive on office 1604. Default = Claude in Chrome (`mcp__Claude_in_Chrome__*`) — `javascript_tool` for DOM reads, `computer` + `find` for native Radix tab clicks and text-input typing. Do NOT use Playwright MCP `browser_snapshot` (token cost ~20k per tab switch). Pattern proven in parent SP-B-LO-1 session — see its catalog §Method notes for the Radix PointerEvent sequence + Angular triple_click→type→Tab pattern.
> 6. **Phase 0 FIRST** (if present in Step-by-Step): execute before any edits.
> 7. **Execute Phases 1+** per Step-by-Step in order.
> 8. **Handoff**: on success, set Status: DONE + Executed date, append activity-log row (LR-028 + LR-037 wall-clock ≥ mtime of touched files), `git mv` this file to `plans/done/`, run `npm run plans:reindex`, commit one bounded commit per LR-027.
>
> **HALT + ASK USER** if:
> - SP-B-LO-1 (parent) is not DONE in `plans/done/`.
> - Office 1604 baseline does not match end-of-SP-B-LO-1 baseline at session start (means another agent edited 1604 between sessions — investigate before cataloging).
> - Any residual parent below fails to produce a clean 1-col diff (likely NOT-TRACKED — file as bug candidate via LR-034 instead of force-coercing a mapping).
> - `/regression-guard` diff shows changes unrelated to this subplan's scope.

---

# SUBPLAN SP-B-LO-1b: MCP Catalog — Local Office Basic Info Residual Parents → 42-col History Mapping

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery — batched per root-tab)
**Status**: Pending
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-B-LO-1 DONE (parent session completed 2026-04-20 — 15 of ~22 Basic Info parents mapped; this session catalogs the residual).
**Identity**: HUNTER (MCP session operates on live DOM)
**Skills**: `/research` (MCP exploration) + `/planning` (catalog extension) + `/identity`
**Estimated**: one session (~1–1.5 hours — ≤7 residual parents, reuse of SP-B-LO-1 driver pattern)

---

## Cause

SP-B-LO-1 hit its ≤15-parent session hard cap with ~7 Basic Info parents left uncataloged. Those parents must be mapped before SP-B-LO-R (Local Office reconciliation) can finalize `hist-root-map-local-office.md`, and before SP-C1 can write per-column TCs for those cols with full coverage.

---

## Scope

**Target tab**: Local Office Settings → Basic Information (office 1604).
**Target surface**: 42-col Local Office Settings History table.
**Residual parents to catalog** (from SP-B-LO-1 catalog §Deferred):

| # | Parent field (expected testid) | Expected col | Control type | Notes |
|---|---|---|---|---|
| 1 | Use Equipment QC (`local-office-settings-checkbox-use-equipment-qc`) | col 9 "Use Equipment QC" | checkbox | Baseline FALSE. Toggle to TRUE, save, diff. |
| 2 | Marriott PMS Account (`local-office-settings-checkbox-marriott-pms` — testid TBC) | col 24 "Marriott PMS Account Enabled" | checkbox | Baseline FALSE. |
| 3 | Default Job 1-day Event Orders | col 25 | checkbox | Baseline FALSE. Verify testid via DOM read. |
| 4 | Default Job 1-day Outside Orders | col 26 | checkbox | Baseline FALSE. |
| 5 | Default Job 1-day Internal Orders | col 27 | checkbox | Baseline FALSE. |
| 6 | Default Labor to Hourly | col 28 | checkbox | Baseline FALSE. |
| 7 | Allow tentative + confirmed Same Priority | col 29 | checkbox | Baseline FALSE. |
| 8 | Items Filled from Requests Return to Availability | col 30 | checkbox | Baseline FALSE. |
| 9 | Default Order Type | col 31 | combobox | Baseline "Event". Change to a different option per LR-025 Radix retry pattern. |
| 10 | Notes | col 23 | textarea | Baseline empty. |
| 11 | Company Logo | col 17 "Logo Name" | combobox | Baseline "Encore New Logo". |
| 12 | Section sub-table row op (add/edit/delete one row) | cols 15/16 | sub-table | Expect col 15 "Section Name" to reflect row change, col 16 "Sect. Action" to change from "Update" to "Insert"/"Delete" on actual row add/delete. |
| 13 | Service Type Exemption sub-table row op | cols 20/21 | sub-table | Same pattern — expect col 20 content change + col 21 action label change. |

If DOM inspection reveals more than 13 parents (e.g., PO Number / PO Number Label / Room Config parents mentioned in LOS test-plan History Coverage section), these go to **SP-B-LO-1c** — do not exceed 15 in this session.

**Not in scope**: ECT tab (cols 32–39) — SP-B-LO-2 territory.

---

## Method — MCP Catalog Procedure (mirrors SP-B-LO-1)

1. Open office 1604 → Local Office Settings → Basic Information tab.
2. Capture full 42-col history top row (baseline). Must byte-match end-of-SP-B-LO-1 baseline (see parent catalog §Baseline row) modulo `Modified On`. If it does not match → HALT + ASK (means something edited between sessions).
3. Install or re-install the `window.__cat` driver from parent catalog §Method notes (clickSave, readHistoryDiff2, switchTab using PointerEvent sequence). The old 19:06 handoff driver-install block in SP-B-LO-1's chat is the canonical source.
4. For each parent field:
   - a. Capture current value/state.
   - b. Apply a distinct change (checkbox toggle, combobox select different option, textarea type text, sub-table add/edit/delete row).
   - c. Save via `window.__cat.clickSave()`.
   - d. Switch to History tab via PointerEvent sequence.
   - e. Diff top row vs row 1. Expect one target column + `Modified On` + (possibly) `Modified By`.
   - f. Classify: TRACKED / NOT-TRACKED / SPURIOUS / DUPLICATE. NOT-TRACKED → file bug candidate per LR-034.
   - g. Restore baseline + save.
   - h. Verify restore diff is clean (one target col back to baseline value + Modified On).
5. For booleans: confirm LR-036 SVG `lucide-check` encoding (should be consistent with SP-B-LO-1 findings).
6. For combobox (Default Order Type, Company Logo): LR-025 Radix retry pattern may apply — wrap open+option-click in retry loop if >50 options.

---

## Output Format

**Extend** the existing `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` in place (do NOT create a separate file). Add a new `## Residual Parents (SP-B-LO-1b session — YYYY-MM-DD)` section appended to the §Parent → Column Map table, and fold any new NOT-TRACKED entries into the existing NOT-TRACKED registry. Update the §Boolean-encoding registry to confirm (or flip) the inferred entries (cols 9, 24–30) from "inferred" to "confirmed".

Also update the §Deferred section to remove parents this session cataloged, and update the §Follow-on plans unblocked section (SP-B-LO-R should become fully actionable after this session).

---

## KEEP list — DO NOT TOUCH

- Office 1604 final state: must restore to end-of-SP-B-LO-1 baseline before session end.
- `hist-root-map-local-office-basic-info.md` §Parent → Column Map rows P1–P15 (parent session) — read only; append new rows, do not overwrite.
- `SUBPLAN_HIST_PIVOT_05_B_LO_1_BASIC_INFO_CATALOG.md` in `plans/done/` — parent session, do not edit.
- Any ECT tab field — SP-B-LO-2 scope.

---

## Step-by-Step Execution

1. `/identity HUNTER` — load HUNTER rules + MCP tool whitelist.
2. Dependency gate: verify SP-B-LO-1 is in `plans/done/`. HALT if not.
3. Open new Claude in Chrome tab → navigate to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office`. Verify Microsoft SSO auto-login.
4. Install `window.__cat` driver (code block in SP-B-LO-1 session chat; also mirrored in parent catalog §Method notes).
5. **Baseline check**: read top row of 42-col history. Compare against SP-B-LO-1 baseline (parent catalog §Baseline row). Confirm 40/40 non-timestamp columns match. HALT if any drift.
6. For each residual parent (≤13 this session, ≤15 hard cap): execute Method steps 4a–h. Record each mapping in a running session note with exact save + row timestamps.
7. After all parents cataloged, restore office 1604 to baseline; re-read top row; confirm 40/40 match.
8. Extend `hist-root-map-local-office-basic-info.md` per §Output Format.
9. Execution Summary in this subplan body per LR-027.
10. Activity-log row per LR-028 + LR-037 (wall-clock ≥ mtime of all touched files).
11. `mv` subplan from `plans/pending/` → `plans/done/`.
12. `npm run plans:reindex`.
13. Commit: `docs(hist-pivot): SP-B-LO-1b — catalog Local Office Basic Info residuals → 42-col history (N parents)`.

---

## Verification

1. Catalog file updated with new Residual Parents section.
2. Every new entry has MCP-evidence timestamps (save ts → row ts) filled.
3. Every NOT-TRACKED entry has a `BUG-LO-NNN` bug candidate ID assigned (file via LR-034 protocol same session).
4. Office 1604 state byte-matches end-of-SP-B-LO-1 baseline (all 40 non-timestamp cols).
5. Boolean-encoding registry — inferred entries for cols 9, 24–30 confirmed (or flipped if different encoding discovered).
6. `§Deferred` section in catalog reduced by the parents cataloged this session.

---

## Handoff Signals

1. Set this file's `**Status**: DONE`, add `**Executed**: YYYY-MM-DD`.
2. Activity-log row (LR-028 + LR-037 wall-clock):
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md (extended), plans/done/SUBPLAN_HIST_PIVOT_05b_B_LO_1b_BASIC_INFO_RESIDUAL.md (moved from pending/) | SP-B-LO-1b COMPLETE — N residual Basic Info parents cataloged. X TRACKED, Y NOT-TRACKED (bug candidates BUG-LO-nnn..nnn), Z SPURIOUS. Boolean encoding for cols 9, 24–30 confirmed as svg lucide-check. Office 1604 restored. Unblocks SP-B-LO-R. |
   ```
3. `mv` this subplan to `plans/done/`.
4. `npm run plans:reindex`.
5. One bounded commit per LR-027.

---

## Context for Cold-Start Session

- SP-B-LO-1 parent session: `plans/done/SUBPLAN_HIST_PIVOT_05_B_LO_1_BASIC_INFO_CATALOG.md` + `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md`.
- Method details (driver code, Radix PointerEvent sequence, Angular native-typing pattern, history tab refresh quirk, cols 16/21/22 "Update" literal) — see parent catalog §Method notes / learnings folded in.
- LR-025 Radix retry pattern for Default Order Type combobox (50+ options likely not an issue here — only ~5 order types — but retry helper exists in page object method `clickSortColumn`).
- LR-026 Angular dirty state handling (wait for Save button disabled after save completes).
- LR-034 bug filing protocol for any NOT-TRACKED parent.
- LR-036 boolean encoding registry — svg `lucide-check` confirmed for Local Office Basic Info cols 7, 8, 10, 11, 14, 18, 19.
- LR-038 browser tool selection — Claude in Chrome default, NOT Playwright MCP.

---

## Dependencies

- **Depends on**: SP-B-LO-1 DONE. (Parent session provides the 15-parent baseline + driver pattern + office 1604 restored state.)
- **Unblocks**: SP-B-LO-R (reconciliation — needs both 1, 1b, 2 complete to finalize `hist-root-map-local-office.md`). SP-C1 can start immediately on the SP-B-LO-1 + SP-B-LO-1b combined 22-ish parents (cols 1–19 of 42).
- **Parallel-safe with**: SP-B-LO-2 (ECT tab) — different tabs on same page, could run in parallel on different browsers/sessions but sequential on the shared office 1604 to avoid state contention.

---

## Run Order Recommendation

**Next after SP-B-LO-1** (which just completed). Reasoning:

- The MCP environment (office 1604, Claude in Chrome tab setup, driver code, baseline knowledge) is freshest in Claude's memory immediately after SP-B-LO-1. Context reuse is maximal.
- SP-B-LO-R explicitly depends on both SP-B-LO-1 and SP-B-LO-1b — leaving 1b pending delays R.
- SP-B-LO-2 (ECT) can run in parallel if a second MCP operator is available, but on a single-operator queue, 1b is the smaller, highly-primed task; do it first, then ECT, then R.

**Master plan slot**: SP-B-LO-1b is inserted at order "05b" in the Execution Order table — between SP-B-LO-1 (05) and SP-B-LO-2 (06). Priority P0, Group 2. Same Opus + ultrathink profile as SP-B-LO-1.
