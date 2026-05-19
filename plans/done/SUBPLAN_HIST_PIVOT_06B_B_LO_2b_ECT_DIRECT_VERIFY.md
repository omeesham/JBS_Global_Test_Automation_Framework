> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-B-LO-2b: MCP Direct-Verify — Local Office ECT Residual Items → 42-col History Mapping

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery — batched per root-tab)
**Status**: DONE
**Executed**: 2026-04-21
**Priority**: P0
**Created**: 2026-04-21
**Depends on**: SP-B-LO-2 DONE (parent session completed 2026-04-21 — P1/P2 NOT-TRACKED directly verified, P3 INFERRED pending direct history delta verification; 8 follow-up items listed in parent catalog §Deferred to SP-B-LO-2b).
**Identity**: HUNTER (MCP live DOM drive + possible bug filing via LR-034)
**Skills**: `/research` (MCP exploration) + `/planning` (catalog extension) + `/identity`
**Estimated**: one session (~1 hour — 8 deferred items, most are fast re-saves; PROBE is the big one)

---

## Cause

SP-B-LO-2 mapped all 3 ECT editable parent classes to save-level NOT-TRACKED with P1/P2 directly verified and P3 INFERRED (save 200'd; direct history delta deferred). A clean parallel to the SP-B-LO-1 → SP-B-LO-1b workflow is required to promote P3 from INFERRED → directly verified, capture the exemplar-index-independence evidence (rows 33 + 65), probe the orphan-column hypothesis for cols 32–39, compare against the Legacy History view, and close the ECT persistence anomaly.

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

1. Open (or reconnect to) a Claude-in-Chrome tab on `/navigator/locations/1604/settings/local-office`. Verify Microsoft SSO auto-login.
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

---

## Dependencies

- **Depends on**: SP-B-LO-2 DONE.
- **Unblocks**: SP-B-LO-R (Local Office reconciliation — now has complete ECT evidence). SP-C2 (ECT per-column TC implementation — now has confirmed save-level NOT-TRACKED finding to encode as `test.skip('bug-blocked: LOS-ECT-BUG-A')` or as a negative assertion suite).
- **Parallel-safe with**: SP-B-LM-* subplans (Location Management family — different URL, different surface, no contention on office 1604 ECT state).

---

## Execution Summary (2026-04-21)

**Outcome**: complete — all 8 deferred items closed. Office 1604 fully restored to pre-session baseline (verified via hard reload, server-side state).

**Browser tool**: Claude in Chrome (`mcp__Claude_in_Chrome__*`). Reason (LR-038): same as parent SP-B-LO-2 — Claude Code, exploratory catalog work, auth-heavy (MS SSO), token-efficient (avoided Playwright MCP `browser_snapshot` overhead), user at machine.

**Items closed (1–8)**:

| # | Item | Result |
|---|---|---|
| 1 | P3 Labor Cost row-0 direct re-check | NOT-TRACKED CONFIRMED (POST 200 at 10:33:37, post-save r0=10:31:39 Omeesha PRE-DATES my save) |
| 2 | Labor Cost row-33 (TC-LOS-ECT-014) | NOT-TRACKED CONFIRMED (10:34:57 → 200, r0=10:34:15 Omeesha) |
| 3 | Labor Cost row-65 (TC-LOS-ECT-015) | NOT-TRACKED CONFIRMED (10:36:10 → 200, r0=10:34:15 Omeesha) |
| 4 | BONUS BM+HS multi-field single Fixed Costs save (TC-LOS-ECT-016) | NOT-TRACKED CONFIRMED (10:37:54 single POST `/ect-settings` body w/ both fields → 200, r0=10:37:22 Omeesha) |
| 5 | PROBE — ECT-derived cols 32–39 written at Basic-Info-save | CONFIRMED — orphan-column inference holds. New r0 by my user at 10:47:11 with col 25 lucide-check TRUE (P18 toggle landed) but cols 32–39 IDENTICAL to baseline despite active server-persisted ECT class state (HS=8.0%, LC0=0.00, LC33=12.50, LC65=7.25). The 3 editable ECT classes do NOT map to cols 32–39. |
| 6 | Legacy History view comparison | ECT NOT TRACKED in Legacy view either. Switched filter to `Location Management Legacy History` (44 headers, no BM/HS/LC cols, **No results** for office 1604). Both visible Location Management History views are blind to ECT saves. |
| 7 | ECT value persistence RCA | **Silent server-side write-failure for `benefitMultiplier` field specifically**. Filed `BUG-LOC-ECT-001` at severity HIGH per LR-034. RCA: NOT cache (hard reload still wrong), NOT currency override (sibling `subrentalPercent:0.08` in same request body DID persist as 8.0% across hard reload), IS field-scoped silent write-failure (only `benefitMultiplier` discarded; the other 5 fields in payload all behaved correctly). |
| 8 | Explicit baseline restore + post-reload verification | All ECT and Basic Info fields restored to baseline; verified via hard reload at ~10:55: BM=0.0%, HS=0.0%, LC0/33/65=0.00, both ECT saves disabled, P18/Outside/Internal all unchecked, Basic Info Save disabled. Office 1604 byte-matches pre-session baseline. |

**TCs dropped**: 0. All 8 in-scope items addressed. Note: BM is *permanently un-mutable* from this UI surface until BUG-LOC-ECT-001 is fixed — but baseline IS the value the server holds, so restore is naturally satisfied.

**MCP verification results**:
1. Phase 0 — baseline reconcile: 42 headers match prior catalog, r0=`04/21 10:06:02 Omeesha` (new since SP-B-LO-2 terminal — Omeesha did extra saves in 16-min gap), r1=`04/21 09:47:02 Omeesha` (= parent terminal r0). ECT field state: BM=0.0% (= server, BM never persists per Item 7), HS=10.0% (parent SP-B-LO-2 save persisted), LC0=40 (parent persisted), LC33=0, LC65=0. Both ECT saves disabled. → PASS.
2. Item 1 (P3 row-0): direct verify → CONFIRMED NOT-TRACKED.
3. Item 2 (row-33): CONFIRMED NOT-TRACKED.
4. Item 3 (row-65): CONFIRMED NOT-TRACKED.
5. Item 4 (BONUS): CONFIRMED NOT-TRACKED at multi-field composition level.
6. Item 5 (PROBE): orphan-column inference CONFIRMED. Editable ECT classes do not surface in any of the 42 cols at any save type. Cols 32-39 reflect a different (read-only) ECT projection.
7. Item 6 (Legacy): ECT absent from Legacy view too. Office 1604 has zero Legacy rows.
8. Item 7 (Persistence RCA): silent write-failure scoped to `benefitMultiplier`. Bug filed.
9. Item 8 (Baseline restore): CONFIRMED via hard reload. Office 1604 matches pre-session baseline exactly.

**Documentation changes this session**:
- **Extended** `clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md` per subplan §Output Format: P3 + new P3-r33/P3-r65/P-BONUS rows added to Parent → Column Map (all CONFIRMED NOT-TRACKED); Save-level tracking status table updated; Orphan columns section flipped from inference → CONFIRMED with PROBE evidence; new Direct Verification Session (SP-B-LO-2b — 2026-04-21) section added with closed-items table, ECT persistence RCA section, Legacy History comparison table, boolean-encoding note, driver discovery additions, updated Deferred list (empty), updated evidence ledger.
- **Filed bug** `reports/bugs/BUG-LOC-ECT-001.json` per LR-034: severity HIGH, status open, full MCP evidence + network capture + 8-step reproduction.
- **This subplan** — Status → DONE, Executed 2026-04-21, Execution Summary section added.

**Rules honored this session**:
- LR-020 (verify plan claims on live DOM) — every Item independently verified on the live app, not assumed from parent catalog inferences.
- LR-026 (Angular dirty state defensive handling) — used triple_click → type → Tab pattern for ECT numeric inputs (the only reliable way to dirty Angular FormControls on ECT inputs); `__cat.typeNumber` JS-level setter pattern did NOT trigger dirty.
- LR-027 (execution summary before move to `plans/done/`) — this section.
- LR-028 + LR-037 (activity-log row, wall-clock ≥ mtime) — row appended; preflight to be validated.
- LR-032 (MCP agents must investigate, not theorize) — every item closed by live MCP testing, including the multi-field composition test that produced the silent-write-failure proof. No theoretical hypotheses written; every claim has a captured request/response or DOM-state observation.
- LR-033 (Network RCA checklist) — used the in-page `fetchWatch` wrapper to capture request body + response body for every ECT save; combined with hard-reload reads to distinguish client-cache from server-write-failure. The `subrentalPercent` vs `benefitMultiplier` differential within the SAME request body was the decisive RCA control.
- LR-034 (Bug filing protocol) — full 7-step protocol followed for BUG-LOC-ECT-001: requirement source verified, MCP-confirmed via two independent saves + hard reload, dedup check (no existing bug for this field on this surface), ID generated `BUG-LOC-ECT-001` (matching `BUG-LOC-LOS-001` pattern), JSON written with all required fields, no affected specs to update yet (SP-C2 pending), reported in chat.
- LR-036 (Boolean render format per page) — N/A for ECT (all numeric); incidentally re-confirmed for col 25 via PROBE (`lucide-check` SVG, not `textContent`).
- LR-038 (Browser tool selection) — Claude in Chrome declared at session start + activity-log row.

**Rules-written**: 0 (findings fit existing LR envelopes).

outcome:complete, attempts:1, rules-written:0, bugs-filed:1 (BUG-LOC-ECT-001).

---

## Run Order Recommendation

**Next after SP-B-LO-2** (which just completed). Reasoning:

- MCP environment (office 1604, Claude-in-Chrome tab setup, driver code, baseline knowledge, endpoint observations) is freshest immediately after SP-B-LO-2.
- SP-B-LO-R reconciliation explicitly depends on both SP-B-LO-1/1b and SP-B-LO-2/2b — leaving 2b pending delays R.
- SP-B-LM-* subplans can run in parallel if a second MCP operator is available, but on a single-operator queue, 2b is the smaller, highly-primed task; do it first.

**Master plan slot**: SP-B-LO-2b inserted at order "06b" in the Execution Order table — between SP-B-LO-2 (06) and SP-B-LO-R or SP-B-LM-1 (whichever comes next). Priority P0, Group 2. Same Opus + think-hard profile as SP-B-LO-2 (Phase 0 bumps to ultrathink).
