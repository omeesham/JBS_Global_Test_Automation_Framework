> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-B-LO-1b: MCP Catalog — Local Office Basic Info Residual Parents → 42-col History Mapping

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery — batched per root-tab)
**Status**: DONE
**Executed**: 2026-04-21
**Priority**: P0
**Created**: 2026-04-20
**Last attempted**: 2026-04-21 (retry #3 — complete; all 8 residual save-cycle parents CONFIRMED TRACKED + P18 baseline restored)
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

---

## Execution Summary (retry #2 — 2026-04-20, partial; RCA-corrected 2026-04-21)

**Outcome**: **partial** — 2 additional parents cataloged (P18, P22); 8 save-cycle parents deferred to retry #3. Session originally wrote up the remaining blocker as a synthetic-event trust gate and authored ALL-076 as a framework-risk rule. **That framing is wrong.** The actual root cause is that the agent never interacted with the Radix AlertDialog that gates Encore's save flow — the existing helper `clickSaveAndConfirm` (at [`local-office-settings.page.ts:138`](../../clients/encore/src/pages/setup/local-office/local-office-settings.page.ts), wrapping [`clickSaveWithDialog`](../../clients/encore/src/common/base-page.ts) from `base-page.ts:350`) already drives the full two-step flow and is proven by 15+ passing calls in `local-office-settings.spec.ts`. LR-012 documents the pattern. Retry #3 uses this helper per-parent; no framework risk exists.

**TCs/Parents confirmed TRACKED this session** (unchanged — evidence is real):

| # | Parent | Target col | Evidence |
|---|---|---|---|
| P18 | Default Job 1-day Event Orders | col 25 | user-assisted save 2026-04-20 05:18:29 PM — clean 1-col diff + Modified On |
| P22 | Same Priority | col 29 | user-manual ghost rows 04:54:18 + 04:55:12 PM — clean 1-col diff pair, reversible |

**DOM-only classifications carried from prior retry-session work** (P16 Equipment QC disabled on 1604, P17 Marriott PMS absent on 1604, P25 Notes absent on 1604) remain as prior-session findings in the catalog — all three route to SP-E-LO bug reports (BUG-LO-001/002/003) per LR-034; NOT filed in this plan.

**Still deferred** (8 parents): P19, P20, P21, P23 (checkboxes), P24 (combobox), P26 (combobox), P27 (sub-table), P28 (sub-table). **Unblocker**: drive each save via `clickSaveAndConfirm` from `local-office-settings.page.ts:138` — no user-in-loop needed, no investigation needed.

**Documentation changes this session** (post-correction):
- `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` extended with `## Residual Parents (SP-B-LO-1b retry session — 2026-04-20, partial)` section. RCA-corrected 2026-04-21: retry-#2 write-up re-framed from "synthetic-event trust gate" to "missed Save Changes AlertDialog"; method note #5 rewritten to point at `clickSaveAndConfirm`; "Automation limitation — framework-level note" paragraph removed; Still-deferred "Blocker" column replaced with neutral "Pending" column. Genuine findings preserved: P18→col 25, P22→col 29, boolean-encoding confirmed cols 25+29, Section 13 rows / Room Config 3 rows / ST Exempt 74+ rows, no-op save 05:18:30 PM observation.
- `clients/encore/specs_planning/_internal/agent-mistakes.md`: **ALL-076 REWRITTEN** (same-day, before downstream sync propagated original text) — now a DOM-symptom-differential rule pointing at `clickSaveAndConfirm`, not a framework-risk fiction.
- `.claude/context/navigation.md` §C Exploration Registry: new row for Save Changes AlertDialog pattern.
- `.claude/context/patterns.md`: new decision tree "Save/Submit button disables but nothing persists".
- `.claude/skills/execute/SKILL.md` Phase 2: symptom-triggered guardrail referencing the patterns.md decision tree.
- This plan body: Execution Summary corrected.

**Plan not moved to `plans/done/`** — stays in `plans/pending/` pending retry #3.

**Baseline state for retry #3**:
- **Office 1604 form**: all fields at SP-B-LO-1 baseline EXCEPT P18 `Default Job 1-day Event Orders` = TRUE (was FALSE).
- **History**: 20 rows, top row 04/20/2026 05:18:30 PM. Use timestamps (not indices) to locate rows; SP-B-LO-1 baseline row is now deeper in the table.

**Retry #3 direction**:
1. First action: toggle P18 → uncheck + `clickSaveAndConfirm` — produces reverse col 25 TRUE→"" diff row AND restores baseline in one shot.
2. Iterate P19, P20, P21, P23 (checkbox toggle + `clickSaveAndConfirm` + reverse-toggle + `clickSaveAndConfirm`).
3. P24 (Default Order Type combobox — change to non-Event option, save, restore).
4. P26 (Company Logo combobox — change, save, restore; apply LR-025 Radix retry if option list large).
5. P27 (Section sub-table row op — rename or toggle Active on one row).
6. P28 (Service Type Exempt sub-table row op — toggle any non-exempt row on, restore off).
7. Extend catalog §Residual Parents with a new `retry #3 (YYYY-MM-DD, complete)` section; flip boolean-encoding registry entries for cols 26/27/28/30 from `inferred` to CONFIRMED; flip Status → DONE; `git mv` to `plans/done/`; `npm run plans:reindex`; single commit.

**Rules honored this session**: LR-020 (plan claims verified against live DOM — P18 baseline FALSE, confirmed drifted), LR-028 (activity-log row per session), LR-032 (investigate not theorize — genuine findings came from live MCP drive), LR-033 (network RCA — fetch/XHR hooks captured evidence), LR-037 (wall-clock ≥ mtimes), LR-038 (browser tool selection announced).

**Rules-written (post-correction)**: 1 (ALL-076 rewritten as DOM-symptom-differential rule). Original "framework-risk" framing retracted.

outcome:partial, attempts:2, rules-written:1 (ALL-076 rewritten).

---

## Execution Summary (retry #3 — 2026-04-21, complete)

**Outcome**: **COMPLETE** — all 8 residual save-cycle parents CONFIRMED TRACKED via live save cycles on office 1604; P18 baseline drift restored as first cycle. Office 1604 form state verified back at SP-B-LO-1 baseline (all 14 Basic Info checkboxes FALSE/TRUE per original; P24 "Event"; P26 "Encore New Logo"; Save button disabled).

**Browser tool**: Claude in Chrome (`mcp__Claude_in_Chrome__*`). Reason (LR-038): Claude Code exploratory/catalog work, auth-heavy surface (inherits user's Chrome session), live DOM drive of 9 save cycles with user available.

**TCs/Parents confirmed TRACKED this session** (9 cycles, 18 saves, all 200 PUT `/navigator/api/location/navigator-settings`):

| # | Parent | Target col | Encoding | Forward save (UTC-8) | Restore save | Status |
|---|---|---|---|---|---|---|
| P18 | Default Job 1-day Event Orders | col 25 | svg lucide-check | n/a (was TRUE on server from retry #2) | 07:35:23 PM — col 25 ✔→"" | **TRACKED** (baseline restored) |
| P19 | Default Job 1-day Outside Orders | col 26 | svg lucide-check | 07:39:11 PM — col 26 ""→✔ | 07:39:34 PM — col 26 ✔→"" | **TRACKED** |
| P20 | Default Job 1-day Internal Orders | col 27 | svg lucide-check | 07:41:10 PM — col 27 ""→✔ | 07:41:34 PM — col 27 ✔→"" | **TRACKED** |
| P21 | Default Labor to Hourly | col 28 | svg lucide-check | 07:42:01 PM — col 28 ""→✔ | 07:42:35 PM — col 28 ✔→"" | **TRACKED** |
| P23 | Items Filled from Requests Return | col 30 | svg lucide-check | 07:43:05 PM — col 30 ""→✔ | 07:43:32 PM — col 30 ✔→"" | **TRACKED** |
| P24 | Default Order Type (combobox) | col 31 | plain text | 07:46:36 PM — col 31 "Event"→"Outside" | 07:49:16 PM — col 31 "Outside"→"Event" | **TRACKED** |
| P26 | Company Logo (combobox) | col 17 "Logo Name" | plain text | 07:53:18 PM — col 17 "Encore New Logo"→"Header with Dust Ears and Text" | 07:54:40 PM — col 17 "Header..."→"Encore New Logo" | **TRACKED** |
| P27 | Section sub-table — toggle Power row Active | col 15 "Section Name" | pipe-joined `name - true` (alphabetized) | 07:55:51 PM — col 15 added "Power - true" | 07:56:28 PM — col 15 removed "Power - true" | **TRACKED** (col 15; col 16 literal "Update") |
| P28 | Service Type Exempt sub-table — toggle "APP Downloaded" Exempt | col 20 "Service Type - Exempt" | pipe-joined `name - true` (alphabetized, exempt-only) | 07:57:58 PM — col 20 added "APP Downloaded - true" | 07:58:35 PM — col 20 removed "APP Downloaded - true" | **TRACKED** (col 20; col 21 literal "Update") |

**Boolean-encoding registry** — flipped to CONFIRMED for cols 25 (from retry #2 + retry #3 reverse evidence), 26, 27, 28, 29 (from retry #2), 30. Cols 9 + 24 remain unconfirmed (parents absent/disabled — bugs BUG-LO-001/002 deferred to SP-E-LO).

**TCs dropped**: 0. Every planned parent cataloged.

**Unblocks**: SP-B-LO-R (Local Office reconciliation) + SP-C1 (Basic Info per-column TC implementation — now 40 of 42 cols have known parents; cols 9 + 24 bug-blocked pending SP-E-LO).

**Documentation changes this session**:
- `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` — appended `## Residual Parents (SP-B-LO-1b retry #3 — 2026-04-21, complete)` section with 9 parent TRACKED rows + boolean-encoding registry flip (cols 26/27/28/30) + method notes addendum #9–12 (Radix AlertDialog visibility via data-state, Radix Select option selection via find+computer.left_click ref, CDP 45s timeout workaround, 20-row history FIFO eviction). Also updated top-of-file Boolean-encoding registry table (rows 25–30 flipped to CONFIRMED) and `assertBooleanCell` note.
- This plan body: Execution Summary retry #3 section added; Status → DONE; Executed 2026-04-21.

**Driver discovery (retry #3 novel)**:
- Radix AlertDialog visibility check: `data-state="open"` (NOT `offsetParent !== null` — portal positioning returns null even when rendered).
- Radix Select option click: `find('<option text>') → computer.left_click(ref)` via Claude in Chrome tool. Dispatched PointerEvent+MouseEvent sequence works for checkboxes, Save button, tab switches, dialog Save, and sub-table toggle cells but NOT for `[role="option"]` elements.
- CDP `Runtime.evaluate` 45s timeout workaround: split per-parent cycles into 3 short JS calls (toggle+save, switch+read, restore+save). Work continues in tab even after CDP timeout — verify with a small follow-up read.

**Rules honored this session**: LR-012 (Save dialogs are SHARED — `clickSaveAndConfirm` / `clickSaveWithDialog` pattern used throughout), LR-020 (plan claims verified against live DOM — P18 baseline state TRUE confirmed drifted), LR-025 (Radix retry — applied spirit to all `[role="option"]` selections, not just large lists), LR-026 (Angular dirty state — Save button disabled verified post-save before tab switch, dialog-gate prevents no-op saves), LR-028 (activity-log row appended), LR-034 (bug filing deferred to SP-E-LO for P16/P17/P25), LR-037 (activity-log timestamp ≥ mtime), LR-038 (Claude in Chrome announced as browser tool).

outcome:complete, attempts:3, rules-written:0 (no new rules — retry #3 worked as predicted by retry #2 RCA correction).
