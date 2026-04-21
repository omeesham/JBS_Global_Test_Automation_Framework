> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think tier. If master plan has no row for SP-B-LO-2b, inherit SP-B-LO-2's slot (Opus + think hard) — Phase 0 bumps one notch (ultrathink) because this session includes a state-reconcile gate against the parent catalog.
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/`. If any blocker → HALT + report to user.
> 5. **Context load**: read `plans/done/SUBPLAN_HIST_PIVOT_06_B_LO_2_ECT_CATALOG.md` (parent session) + `clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md` (existing ECT catalog to extend) + `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` (for PROBE step cross-reference) + master plan §3 HEALER row (LOS-ECT-BUG-A).
> 5.5 **Browser tool selection (LR-038)**: this session REQUIRES live DOM drive on office 1604. Default = Claude in Chrome (`mcp__Claude_in_Chrome__*`) — `javascript_tool` for DOM reads, `computer` + `find` for Radix tab clicks and text-input typing. Do NOT default to Playwright MCP `browser_snapshot` (token cost ~20k per tab switch; `read_page` returns compact accessibility summary). Reconnect to an existing Claude-in-Chrome tab on office 1604 instead of creating a new tab — parent-session reconnect attempt hit a Next.js bootstrap error `"An unexpected response was received from the server"` on a fresh tab despite active SSO (see parent catalog §Evidence ledger).
> 6. **Phase 0 FIRST** (if present in Step-by-Step): execute before any edits.
> 7. **Execute Phases 1+** per Step-by-Step in order.
> 8. **Handoff**: on success, set Status: DONE + Executed date, append activity-log row (LR-028 + LR-037 wall-clock ≥ mtime of touched files), `git mv` this file to `plans/done/`, run `npm run plans:reindex`, commit one bounded commit per LR-027.
>
> **HALT + ASK USER** if:
> - SP-B-LO-2 (parent) is not DONE in `plans/done/`.
> - Office 1604 ECT form state at session start does not match parent-session terminal state OR cannot be cleanly baseline-restored (see Phase 0).
> - The ECT value-persistence observation (BM `0.0% → 21.0% → tab switch → 0.0%`) cannot be reproduced and also cannot be ruled out — this means the write path is non-deterministic and the session can't reliably measure save-to-history tracking.
> - `/regression-guard` diff shows changes unrelated to this subplan's scope.

---

# SUBPLAN SP-B-LO-2b: MCP Direct-Verify — Local Office ECT Residual Items → 42-col History Mapping

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery — batched per root-tab)
**Status**: Pending
**Priority**: P0
**Created**: 2026-04-21
**Depends on**: SP-B-LO-2 DONE (parent session completed 2026-04-21 — P1/P2 NOT-TRACKED directly verified, P3 INFERRED; 8 follow-up items listed in parent catalog §Deferred to SP-B-LO-2b).
**Identity**: HUNTER (MCP live DOM drive + possible bug filing via LR-034)
**Skills**: `/research` (MCP exploration) + `/planning` (catalog extension) + `/identity`
**Estimated**: one session (~1 hour — 8 deferred items, most are fast re-saves; PROBE is the big one)

---

## Cause

SP-B-LO-2 mapped all 3 ECT editable parent classes to save-level NOT-TRACKED but could not directly verify the P3 Labor Cost class due to a mid-session Claude-in-Chrome tab reconnect that cleared DOM context before the post-save history re-check. A clean parallel to the SP-B-LO-1 → SP-B-LO-1b workflow is required to promote P3 from INFERRED → directly verified, capture the exemplar-index-independence evidence (rows 33 + 65), probe the orphan-column hypothesis for cols 32–39, compare against the Legacy History view, and close the ECT persistence anomaly.

---

## Scope

**Target tab**: Local Office Settings → ECT Settings tab (office 1604), with one PROBE excursion to Basic Information tab.
**Target surface**: 42-col Local Office Settings History + Location Management Legacy History (for comparison).

**Deferred items to close** (from parent catalog §Deferred to SP-B-LO-2b — numbering preserved):

| # | Item | Type | Expected outcome | Catalog delta on success |
|---|---|---|---|---|
| 1 | **P3 Labor Cost row-0 post-save history re-check** | direct verification | Pagination `N/72 → N/72` + r0 timestamp unchanged after POST `/labour-costs-assumptions` 200 | Flip P3 row in §Parent → Column Map from INFERRED → CONFIRMED |
| 2 | **Labor Cost row-33 middle exemplar** (TC-LOS-ECT-014) | direct verification | Same save-level NOT-TRACKED result as row-0 | Add row to §Parent → Column Map or append note under P3 "row-index-independence confirmed (rows 0, 33, 65)" |
| 3 | **Labor Cost row-65 last exemplar** (TC-LOS-ECT-015) | direct verification | Same save-level NOT-TRACKED result as row-0 | Same as item 2 |
| 4 | **BONUS multi-field single save** (TC-LOS-ECT-016) | direct verification | Single Fixed Costs save mutating Benefits Multiplier + Historical Subrental % in one transaction produces zero history rows (same class) | Add §BONUS multi-field single-save entry under save-level tracking status |
| 5 | **PROBE — ECT-derived cols 32–39 written at Basic-Info save** | direct verification | Edit ECT value (e.g., BM), confirm no new history row (NOT-TRACKED), then edit+save a Basic Info parent, verify new r0's cols 32–39 reflect the *current* ECT values (not the pre-edit snapshot). Proves cols 32–39 are server-side JOINs captured at Basic-Info-save time. | Flip §Orphan columns inference from "inference" → "confirmed via PROBE 2026-mm-dd" |
| 6 | **Legacy History view comparison** | direct verification | Navigate to Location Management Legacy History filter, determine column set + whether ECT saves appear there | Add §Legacy History comparison section; update master plan if ECT is tracked elsewhere |
| 7 | **ECT value persistence investigation** | RCA (see LR-032, LR-033) | Classify BM-revert observation as (a) client cache, (b) silent server write-failure, or (c) MXN currency display override. Use `browser_network_requests` + fetch-interception to read API response body + confirm persistence by re-reading after forced reload. | Add §ECT persistence RCA section; file BUG-LO-nnn if confirmed silent write-failure (LR-034) |
| 8 | **Explicit baseline restore** | cleanup | All ECT values verified at `0.0% / 0.00` (MXN context) on SERVER (not just client re-render). Both Save buttons disabled. Prove restore by post-reload re-read + post-logout re-login re-read if restore state is doubtful. | End-of-session state note in §Baseline snapshot; Deferred list empty. |

**Not in scope**: Basic Info tab parent cataloging (SP-B-LO-1 / SP-B-LO-1b done), any other tab, or ECT bug filing beyond LOS-ECT-BUG-A (that goes to SP-E-LO batch).

---

## Method — MCP Direct-Verify Procedure

1. Reconnect to an **existing** Claude-in-Chrome tab on `/navigator/locations/1604/settings/local-office` (tab 1279543096 from parent session if still open, or create a tab ONLY AFTER verifying SSO is fresh and the Next.js bootstrap error does not reproduce). If a new tab is required, navigate to a simple URL first (e.g., dashboard) to prove SPA renders, then navigate to the office.
2. Install the `window.__cat` driver pattern from SP-B-LO-1 parent catalog §Method notes (fetch-watch + clickSave variants for ECT's two Save buttons + tab-switch via PointerEvent + history `readHistoryDiff2` or baseline/current comparator).
3. **Phase 0 — reconcile baseline**:
   - Read top 3 rows of 42-col history. Compare r1/r2 against parent session ledger (r1 should be `04/21 09:47:02 Omeesha`, r2 `04/20 19:58:35 Rutvik`).
   - Read current ECT form state: BM, HS, LaborCost row-0/33/65. Parent session left BM=`21.0%` and HS=`10.0%` on the client (BM reverted to 0.0% on tab re-entry); server state is unverified.
   - Decision tree:
     - If all three (BM, HS, LaborCost row-0) match baseline `0.0%/0.00` → server restored itself (probably the tab-revert was a cache refresh) → proceed.
     - If any of them is NOT at baseline → explicitly restore (set to `0.0% / 0.00`, click the appropriate Save, verify the field disables Save button + history shows no new row).
     - If restore itself produces a new history row → ECT save DID track at save level after all → HALT + ASK USER (overturns parent catalog finding, requires re-cataloging).
4. For items 1–4 (Labor Cost rows + BONUS): edit → save → **before** switching tabs, wait for the ECT-specific Save button to disable (LR-026) → switch to History tab via PointerEvent → read pagination + r0 timestamp → diff vs pre-save baseline.
5. For item 5 (PROBE):
   - (a) Ensure ECT is in a known state (e.g., BM = 0.0%, baseline).
   - (b) Edit BM to a distinct value like 7.5%. Save via Fixed Costs save. Verify no new history row (confirms NOT-TRACKED).
   - (c) DO NOT touch ECT again. Switch to Basic Information tab.
   - (d) Edit + save any Basic Info parent already in the SP-B-LO-1 catalog (pick a low-cost toggle like P18 `Default Job 1-day Event Orders` — already TRACKED to col 25).
   - (e) Switch to History tab → new r0 exists. Read r0 cols 32–39.
   - (f) Expected: col 32 (Regular Hours) = 24 (unchanged), cols 33–38 = ECT state AT BASIC-INFO-SAVE time (including BM=7.5% if the join includes BM, which it likely does not because cols 32–39 are labor-hours fields; BM is a different projection). If r0 cols 32–39 reflect the **current** (post-ECT-edit) state, the orphan-column inference is CONFIRMED.
   - (g) Document whether BM itself surfaces in any of the 42 columns on the Basic-Info-save row. If not, it is never history-auditable.
   - (h) Restore ECT BM to 0.0%; restore Basic Info parent to baseline.
6. For item 6 (Legacy History): navigate to History tab → open filter dropdown → select "Location Management Legacy History" → read column headers + top 3 rows. Determine whether any ECT field appears as a column. If yes, note which and whether it has recent rows corresponding to parent session's ECT saves.
7. For item 7 (persistence RCA): re-baseline BM to 0.0% if not already. Edit BM to a distinct value (e.g., 5.5%). Immediately install a fetch wrapper to capture the full request body + response body for POST `/ect-settings`. Save. Read response. Hard-reload page (Ctrl+F5 via `computer.keyboard` or `browser_navigate` to a different URL and back). Re-read BM field. Three-way classification:
   - BM persists across hard reload → write succeeded; earlier revert was a client-cache/re-render issue (classify as tab-switch DOM reset bug, log in catalog, no server bug).
   - BM does not persist but response body says `success: true` → silent write-failure (LR-034 bug filing required).
   - Response body indicates server validation rejected the value silently (no error displayed) → UX bug (LR-034 bug filing required — separate from LOS-ECT-BUG-A).
8. For item 8 (baseline restore): after all tests, set BM=0.0%, HS=0.0%, Labor Cost row-0/33/65=0.00. Click Fixed Costs save, click Labor Costs save. Verify each Save button disables post-save. Hard-reload. Re-read all mutated fields. Confirm all at baseline.

---

## Output Format

**Extend** the existing `clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md` in place (do NOT create a separate file). Add a new `## Direct Verification Session (SP-B-LO-2b — YYYY-MM-DD)` section appended to the §Parent → Column Map table. Fold PROBE evidence into §Orphan columns (flip "inference" → CONFIRMED/REFUTED). Add §Legacy History comparison section. Add §ECT persistence RCA section (with bug-filing reference if applicable). Update §Deferred list — ideally empty at session end.

---

## KEEP list — DO NOT TOUCH

- Office 1604 final state: must restore to baseline ECT values (BM=0.0%, HS=0.0%, LaborCost all rows=0.00) AND baseline Basic Info values (SP-B-LO-1b retry #3 terminal state) by session end.
- `hist-root-map-local-office-ect.md` §Parent → Column Map rows P1–P3 (parent session) — append only.
- `hist-root-map-local-office-basic-info.md` — read only (PROBE requires looking up a Basic Info parent to test; do not extend the Basic Info catalog).
- `SUBPLAN_HIST_PIVOT_06_B_LO_2_ECT_CATALOG.md` in `plans/done/` — parent session, do not edit.
- Any other tab (Local Information, Legal, Currency, Pricing, etc.) — out of scope.

---

## Step-by-Step Execution

1. `/identity HUNTER`.
2. Dependency gate: verify SP-B-LO-2 is in `plans/done/`. HALT if not.
3. Open (or reconnect to) Claude-in-Chrome tab on `/navigator/locations/1604/settings/local-office`. Verify Microsoft SSO auto-login.
4. Install `window.__cat` driver (code pattern from parent catalog §Method notes).
5. **Phase 0 — baseline reconcile**: per Method §3. HALT conditions apply.
6. For each deferred item 1–8: execute per Method §4–§8. Record each result in a running session note with exact save + history timestamps.
7. After all items complete, verify final baseline restoration (Method §8).
8. Extend `hist-root-map-local-office-ect.md` per §Output Format.
9. Execution Summary in this subplan body per LR-027.
10. Activity-log row per LR-028 + LR-037 (wall-clock ≥ mtime of all touched files).
11. `git mv` subplan from `plans/pending/` → `plans/done/`.
12. `npm run plans:reindex`.
13. `npm run validate:activity-log:preflight`.
14. Commit: `docs(hist-pivot): SP-B-LO-2b — direct-verify ECT residual (P3 + rows 33/65 + BONUS + PROBE + Legacy + persistence RCA)`.

---

## Verification

1. Catalog file updated with §Direct Verification Session + §Orphan columns CONFIRMED/REFUTED + §Legacy History comparison + §ECT persistence RCA.
2. Every new entry has MCP-evidence timestamps (save ts → row ts) + response-body excerpt where relevant.
3. Every NOT-TRACKED entry inherits LOS-ECT-BUG-A class-level evidence; any NEW bug candidate (e.g., silent write-failure from item 7) has a `BUG-LO-nnn` ID assigned per LR-034.
4. Office 1604 state byte-matches SP-B-LO-1b retry #3 terminal baseline (Basic Info) + ECT all-zero baseline (ECT).
5. §Deferred list in catalog reduced to 0 items (or to items explicitly re-deferred with justification).

---

## Handoff Signals

1. Set this file's `**Status**: DONE`, add `**Executed**: YYYY-MM-DD`.
2. Activity-log row (LR-028 + LR-037 wall-clock):
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md (extended), plans/done/SUBPLAN_HIST_PIVOT_06B_B_LO_2b_ECT_DIRECT_VERIFY.md (moved from pending/) | SP-B-LO-2b COMPLETE — P3 Labor Cost directly verified NOT-TRACKED (rows 0/33/65 + BONUS). PROBE: cols 32-39 orphan-inference CONFIRMED|REFUTED. Legacy History: ECT tracked|not tracked there. Persistence RCA: cache|silent-failure|currency-override. Office 1604 restored to baseline. Unblocks SP-B-LO-R. |
   ```
3. `git mv` this subplan to `plans/done/`.
4. `npm run plans:reindex`.
5. One bounded commit per LR-027.

---

## Context for Cold-Start Session

- SP-B-LO-2 parent session: `plans/done/SUBPLAN_HIST_PIVOT_06_B_LO_2_ECT_CATALOG.md` + `clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md`.
- SP-B-LO-1 / SP-B-LO-1b parent sessions (for Basic Info PROBE): `plans/done/SUBPLAN_HIST_PIVOT_05_B_LO_1_BASIC_INFO_CATALOG.md`, `plans/done/SUBPLAN_HIST_PIVOT_05b_B_LO_1b_BASIC_INFO_RESIDUAL.md`, `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md`.
- Driver code (Radix PointerEvent sequence for tab switch, Angular triple_click→type→Tab pattern for numeric inputs, `clickSaveAndConfirm`-style helper though ECT saves do NOT raise a confirm dialog — note the difference) — see SP-B-LO-1b retry #3 Execution Summary "Driver discovery" + parent ECT catalog §ECT save flow quirks.
- LR-025 Radix retry pattern — only applies to `[role="option"]` clicks; ECT fields are all numeric text inputs (no comboboxes) so this is unlikely to trigger this session.
- LR-026 Angular dirty state — ECT Save disables after 200 but does not reliably mark form pristine; handle Unsaved Changes alertdialog if tab-switching mid-dirty.
- LR-032/LR-033 — RCA step (item 7) MUST use `browser_network_requests` or fetch interception, not theory. 30 seconds of live debugging beats 30 lines of hypothesis.
- LR-034 — if persistence RCA item 7 concludes silent write-failure, file `BUG-LO-NNN` (module code TBD — probably `ECT` or `LOS-ECT`) with MCP evidence + network-response excerpt.
- LR-036 — N/A for ECT (all numeric).
- LR-038 — Claude in Chrome declared; do NOT default to Playwright MCP.
- Parent-session blocker context: new Chrome tab 1279543106 hit Next.js bootstrap error `"An unexpected response was received from the server"` despite active SSO → reconnect to existing tab OR navigate to a known-healthy URL first before the office URL.

---

## Dependencies

- **Depends on**: SP-B-LO-2 DONE.
- **Unblocks**: SP-B-LO-R (Local Office reconciliation — now has complete ECT evidence). SP-C2 (ECT per-column TC implementation — now has confirmed save-level NOT-TRACKED finding to encode as `test.skip('bug-blocked: LOS-ECT-BUG-A')` or as a negative assertion suite).
- **Parallel-safe with**: SP-B-LM-* subplans (Location Management family — different URL, different surface, no contention on office 1604 ECT state).

---

## Run Order Recommendation

**Next after SP-B-LO-2** (which just completed). Reasoning:

- MCP environment (office 1604, Claude-in-Chrome tab setup, driver code, baseline knowledge, endpoint observations) is freshest immediately after SP-B-LO-2.
- SP-B-LO-R reconciliation explicitly depends on both SP-B-LO-1/1b and SP-B-LO-2/2b — leaving 2b pending delays R.
- SP-B-LM-* subplans can run in parallel if a second MCP operator is available, but on a single-operator queue, 2b is the smaller, highly-primed task; do it first.

**Master plan slot**: SP-B-LO-2b inserted at order "06b" in the Execution Order table — between SP-B-LO-2 (06) and SP-B-LO-R or SP-B-LM-1 (whichever comes next). Priority P0, Group 2. Same Opus + think-hard profile as SP-B-LO-2 (Phase 0 bumps to ultrathink).
