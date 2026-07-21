# Hist Root Map — Location Management History / Notes Tab

**Session**: 2026-05-11
**Agent**: WATCHDOG (Rutvik via Claude Opus 4.7, max thinking)
**Browser tool**: Claude in Chrome (Phase 1a — same Chrome session that did Phase 0.5b nav2 baseline walk; staying in-tool for cost reasons — see PLAN_PILOT_NOTES_DISCOVERY Phase 3 deviation log)
**Office**: 1604 (Parker Palm Springs), `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location`
**Scope**: Notes sub-tab parent → 87-col Location Management History
**Plan**: [PLAN_PILOT_NOTES_DISCOVERY.md](../../../../plans/pending/PLAN_PILOT_NOTES_DISCOVERY.md) (this catalog is Phase 1a Step 8)
**Reference**:
- [SUBPLAN_HISTORY_01_MCP_FINDINGS.md §1](../../../../plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md) — canonical 87-col header list
- [hist-root-map-location-management-currency.md](./hist-root-map-location-management-currency.md) — format precedent
- [Notes baseline (nav2)](../_internal/old-site-baseline/notes-2026-05-11.md) — old-site architectural reference

---

## Summary

- **1/1 Notes parent cataloged** via 3 save-cycles (Save 1 typed text, Save 2 failed-delete, Save 3 cleared-and-save-empty).
- **1/1 parent TRACKED**: the Notes textarea content maps directly to col 69 "Notes" via aggregate serialization rule discovered this session.
- **0/1 parents NOT-TRACKED** (no silent drops).
- **Col 69 encoding rule** (new, MCP-observed this session): `<MM/DD/YYYY> - <text content>` per note row, separator ` | ` between rows when multiple notes exist. Trailing empty row produces ` | <MM/DD/YYYY> -` placeholder. See §State-space matrix.
- **NEW APP BUG discovered during catalog session**: Delete button on a row WITHOUT first clearing the textarea value does NOT persist the deletion server-side — a history row writes but Notes col 69 retains pre-delete content (Save 2 evidence). Filed as `BUG-LOC-NTS-001`.
- **Baseline restored**: Office 1604 Notes is back to empty state at session end (Save 3 success, 11:55:37 AM).

---

## Parent → Column Map

| # | Parent field | Parent testid (new-site) | Control type | State space | Target col (0-idx, header) | Status | Encoding | Evidence (change save → row timestamp) |
|---|---|---|---|---|---|---|---|---|
| P1 | Notes (multi-row table; each row is a textarea named `notes.notes.{i}.note`) | `[data-testid="location-settings-section-notes"]` (section wrapper); rows have no testid — selector pattern `textarea[name="notes.notes.{i}.note"]`. Add/Delete/Save also lack per-row testid. Save shared at `[data-testid="location-settings-btn-save"]`. | Multi-row textarea via Angular FormArray (`notes.notes[]`). HTML `maxlength` NOT set — SOFT 4000-char limit enforced by counter UI only (paste/programmatic can exceed). | text content per row, plus row-count cardinality | col 69 "Notes" | **TRACKED** | `<MM/DD/YYYY> - <row 0 text> \| <MM/DD/YYYY> - <row 1 text> \| ...` (date is the save date prefixed to each row's content; trailing empty row produces ` \| MM/DD/YYYY -`) | Saves 1, 2, 3 (see §State-space matrix below) |

> **Single-parent catalog**: unlike Currency (9 parents) or Pricing (multi-parent), Notes is a SINGLE-CONTROL feature. The entire sub-tab is one Angular FormArray; the user can only add/remove rows of one shape (text rows). No checkboxes, no dropdowns, no booleans, no cross-field dependencies. Catalog reflects this — 1 parent, 1 column, fully MCP-proven via direct save-cycle evidence.

---

## State-space coverage matrix (col 69 "Notes")

All 3 save-cycles executed against Office 1604 on 2026-05-11.

| Save # | Description | Notes-tab pre-save state | Notes-tab post-save state | Notes-tab user-visible textareas | Save timestamp | Resulting col 69 value |
|---|---|---|---|---|---|---|
| baseline | Pre-session row (clickauto save) | — | — | — | 2026-05-11 10:41:10 AM | empty (`""`) |
| Save 1 | Add row + type test text + Save | "No Notes Available", 0 textareas | row 0 = test text, row 1 = empty placeholder (app auto-creates) | 2 (row 0 + 1) | 2026-05-11 11:49:08 AM | `"05/11/2026 - hello world test 2026-05-11 PILOT_NOTES_DISCOVERY \| 05/11/2026 -"` |
| Save 2 | Click Delete×2 + Save (NO textarea-clear) | 2 textareas (row 0 text + row 1 empty from Save 1) | UI: "No Notes Available" briefly; server: rolled back to row 0 text + row 1 empty | (server-side unchanged) | 2026-05-11 11:51:52 AM | `"05/11/2026 - hello world test 2026-05-11 PILOT_NOTES_DISCOVERY \| 05/11/2026 -"` (UNCHANGED from Save 1 — **APP BUG**) |
| Save 3 | Textarea.value="" + Delete×2 + Save | 2 textareas (row 0 text + row 1 empty) | "No Notes Available", 0 textareas | 0 | 2026-05-11 11:55:37 AM | empty (`""`) — RESTORED |

**Derived serialization rules** (MCP-observed; must be codified into any HIST spec for col 69 — SP-D6):

- **Per-row format**: `MM/DD/YYYY - <row.value>` where MM/DD/YYYY is the save-action date (NOT the row-creation date — Save 1 wrote both rows with `05/11/2026`, which is today). Note: leading 0s preserved (e.g. `05/11/2026`, not `5/11/2026`).
- **Row separator**: ` | ` (space-pipe-space).
- **Trailing empty row**: produces `MM/DD/YYYY -` (date-dash with no text content after the dash + space). This is the app-auto-created "Add" placeholder slot that gets persisted alongside the user's actual content.
- **Zero notes** (empty-state save, all rows deleted): col 69 = empty string `""`.
- **Date independence**: col 69 ignores row insertion order (rows are positional within the FormArray; col 69 enumerates them in array order, not by typing order).

**Save 2 ROLLBACK observation** — Save 2 produced a new history row (timestamp 11:51:52) but Notes col 69 was IDENTICAL to Save 1's value. The Save handler did fire (Modified On updated, history row created) but the persisted FormArray content matched the pre-Save-2 state — meaning the Delete buttons modified the UI without flipping the underlying FormArray's value. The form's "dirty" flag was set (Save button was enabled), but the actual submitted payload reverted the deletion. This is reproducible via the Save 3 vs Save 2 contrast: Save 3 explicitly modified textarea.value to "" THEN clicked Delete, and that sequence DID persist the deletion. See `BUG-LOC-NTS-001` in `reports/bugs/`.

---

## Save-cycle behavior

- **One save = one new history row**. Confirmed via Save 1, 2, 3 each generating a new top-row entry (newest at index 0). History table capacity = 20 rows; FIFO eviction (oldest row scrolled off when 21st row would be created).
- **`MM/DD/YYYY HH:MM:SS AM/PM` Modified On format** (col 71): 12-hour clock with AM/PM (e.g. `05/11/2026 11:49:08 AM`).
- **Modified By format** (col 70): UPN string (`v-internal.internal@psav.com` for my logged-in session; `s-prd-clickauto@psav.com` for automation user pre-test rows).
- **Save dialog** (per LR-012): `[role="alertdialog"]` with heading "Save Changes" + body "Are you sure you want to save the changes?" + buttons `Cancel` / **`Ok`** (NOT `Save` — TC drift; see field-inventory §6 Known App Bugs).
- **No-op save** (no changes pending): Save button stays disabled — clicking has no effect; no dialog opens.

---

## Parent classification (LR-040 closure)

Per LR-040 (a)/(b)/(c) — every enumerated parent must be classified:

| Parent | Classification | Evidence |
|---|---|---|
| P1 Notes (col 69) | **(a) Directly MCP-proven** | Save 1 (typed text → col 69 contains text) + Save 3 (cleared all → col 69 empty) — two-way mapping confirmed. Save 2 confirms the parent column is col 69 (no other column flipped on the buggy delete-only attempt). |

**Zero (b) or (c) classifications needed** — single parent, directly proven both ways.

---

## Duplicate-header flag + Col 69 cross-contamination guard

**Duplicate headers in the 87-col history** (MCP-confirmed via Phase 1 header read this session):

- **Col 5 "Currency"** (0-idx) — Currency-tab-owned (per [hist-root-map-location-management-currency.md](./hist-root-map-location-management-currency.md)).
- **Col 63 "Currency"** (0-idx) — Pricing-tab-owned.
- **Col 69 "Notes"** — UNIQUE — no duplicate header.

**Cross-contamination guard** (3 save-cycles, all driven from Notes tab):

| Save # | Notes-tab action | Col 5 ("Currency") | Col 63 ("Currency") | Col 69 ("Notes") |
|---|---|---|---|---|
| baseline (10:41:10) | — | `"USD"` | `""` | `""` |
| Save 1 (11:49:08) | Add+type+save text | `"USD"` | `""` | `"05/11/2026 - hello world... \| 05/11/2026 -"` |
| Save 2 (11:51:52) | Delete-only+save | `"USD"` | `""` | `"05/11/2026 - hello world... \| 05/11/2026 -"` (unchanged — bug) |
| Save 3 (11:55:37) | Clear+delete+save | `"USD"` | `""` | `""` |

✓ Col 5 + Col 63 stayed constant — zero cross-contamination from Notes-tab saves. Notes is fully isolated to col 69.

---

## Diff vs baseline (old-site nav2)

| Behavior | Old site (nav2 baseline) | New site (this catalog) | Classification |
|---|---|---|---|
| Storage shape | Single textarea (one note) | FormArray (multi-row) | intentional-UX-change |
| Max length | 1000-char HARD (HTML `maxlength`) | 4000-char SOFT (counter only) | intentional-UX-change |
| History column | Old site has its own LM History table (Glyphicon booleans per LR-036) — Notes column position not verified this session | Col 69 of 87 — UNIQUE header | (consistent expectation — Notes is one column on each side; column position is implementation-detail) |
| Save dialog | None observed on baseline (single textarea-blur saved directly via top Save button) | `"Save Changes" / Cancel \| Ok` alertdialog | intentional-UX-change |
| Add/Delete row controls | None | `Add` + `Delete`-per-row | intentional-UX-change |
| Encoding semantics | Single text blob | `MM/DD/YYYY - <text> \| MM/DD/YYYY - <text>` aggregate | intentional-UX-change (new affordance) |
| Delete persistence | (not tested on baseline — observation-only per LR-ENC-001) | **BUG**: delete UI alone does NOT persist deletion | regression-from-pure-form-semantics? No — old site doesn't have multi-row delete, so cannot be a regression. Classify as net-new APP BUG on new site (BUG-LOC-NTS-001) |

---

## Known APP bugs discovered (LR-034 candidates)

| ID | Title | Severity | Evidence | Filed |
|---|---|---|---|---|
| BUG-LOC-NTS-001 | Notes delete-row UI does not persist deletion when textarea value is not explicitly cleared first | High | Save 2 (11:51:52 AM): clicked Delete on both rows + Save → new history row written but col 69 still contains pre-delete content. Save 3 (11:55:37 AM) confirmed the fix-path: textarea.value="" + Delete + Save → col 69 empty. | Phase 2 of this plan |
| BUG-LOC-NTS-002 | Save Changes confirmation dialog button labeled "Ok" (not "Save" per test cases / per LR-012 convention used on other tabs) | Low / TC-drift | Save 1 dialog DOM walk: button text = "Ok"; existing `locations_notes_test_cases.md` MCP_VERIFICATION_LOG (dated 2026-03-17) and TC-LOC-NTS-008 specify "Save" button on alertdialog | Phase 2 of this plan |
| BUG-LOC-NTS-003 | App auto-creates an empty placeholder row alongside saved content; this placeholder is persisted to history (col 69 trailing ` \| MM/DD/YYYY -` artifact) | Low / UX | Save 1 evidence: typed ONE row, saved, then post-save Notes tab showed TWO textareas (row 0 = text, row 1 = empty); col 69 reflected both via trailing pipe. May be intentional ("add next" affordance), but it creates a noise row in history. | Phase 2 of this plan (mark as discussion-item if Encore confirms intentional) |

**Total APP bug count: 3** — under LR-046 strict-line gate of 5. **No HALT.**

---

## Save-restore checklist

✓ Office 1604 Notes state at session start: empty (`"No Notes Available"`, 0 textareas, col 69 = `""`).
✓ Office 1604 Notes state at session end (post-Save-3): empty (`"No Notes Available"`, 0 textareas, col 69 = `""`).
✓ Net delta to office 1604 server-state: **zero functional change** (3 history rows added — Save 1, Save 2, Save 3 — but data state restored).

---

## LR coverage statement

| LR | Where covered |
|---|---|
| LR-036 (boolean encoding per table) | §State-space matrix — Notes is text, not boolean; LM History uses Unicode ✔ for boolean cells (col 2 `Active`, col 11 `Union`, col 21 `Allow DPCD`, etc. — confirmed via top-row DOM walk this session) consistent with LR-036 |
| LR-038 v2 (browser tool announcement + switch protocol) | Header — Browser tool: Claude in Chrome; cross-ref plan body for staying-on-Chrome deviation justification |
| LR-040 (closure-gate completeness) | §Parent classification — single parent (a) MCP-proven; no (b) or (c) needed |
| LR-046 (strict-line HALT) | §Known APP bugs — 3 bugs ≤ 5 threshold; no HALT |
| LR-ENC-001 (Encore baseline-truth source) | §Diff vs baseline — references `old-site-baseline/notes-2026-05-11.md` for intent / divergence classification |

---

## Cross-refs

- [`reports/bugs/BUG-LOC-NTS-001.json`](../../../../reports/bugs/BUG-LOC-NTS-001.json) (filed in Phase 2)
- [`reports/bugs/BUG-LOC-NTS-002.json`](../../../../reports/bugs/BUG-LOC-NTS-002.json) (filed in Phase 2)
- [`reports/bugs/BUG-LOC-NTS-003.json`](../../../../reports/bugs/BUG-LOC-NTS-003.json) (filed in Phase 2)
- [Notes field-inventory (this session's Phase 1b)](../_internal/field-inventories/notes-2026-05-11.md)
- [Notes baseline (Phase 0.5b)](../_internal/old-site-baseline/notes-2026-05-11.md)
- [Plan body — PLAN_PILOT_NOTES_DISCOVERY.md](../../../../plans/pending/PLAN_PILOT_NOTES_DISCOVERY.md)
- [Plan parent — PLAN_VERTICAL_RESTRUCTURE_PENDING.md](../../../../plans/pending/PLAN_VERTICAL_RESTRUCTURE_PENDING.md)
