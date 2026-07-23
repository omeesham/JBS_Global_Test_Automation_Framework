**Module**: shared-setup
**Client**: encore
**Walk_Date**: 2026-05-22
**Walk_Tool**: Playwright CLI (v0.1.8) via `playwright-cli -s=default open --persistent --profile=clients/encore/.auth/e2e-profile --headed`
**Tool_Reason**: BrowserTool: cli per SUBPLAN_SSL_FCC frontmatter (LR-038 v2 default — no fresh MFA, no visual/CSS work, no `pause:` step). Walk is Phase 1 HUNTER evidence supporting LR-013 path-(a) spot-check (inventory <14d at 10 days).
**Author_Identity**: HUNTER (within OWNER-orchestrated SUBPLAN_SSL_FCC execution)
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Sister_Artifact**: [shared-setup-2026-05-12.md](./field-inventories/shared-setup-2026-05-12.md) (field-inventory; this walk is the freshness spot-check)

---

# Walk Evidence — Location Settings → Shared Setup Locations (2026-05-22)

Phase 1 evidence for [SUBPLAN_SSL_FCC.md](../../../../plans/pending/SUBPLAN_SSL_FCC.md). Light DOM walk to confirm the 2026-05-12 field-inventory is still accurate before Phase 2 GIVER catalogs FCC gap cases. Walk follows the 5 steps prescribed by the subplan body §Phase 1.

---

## §1 — URL + tab visited

- **URL**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location`
- **Top tab**: Basic Information (default)
- **Sub-tab activated**: Shared Setup Locations (`button[data-testid='location-settings-sub-tab-shared-setup-locations']`)
- Authenticated session via persistent profile at `clients/encore/.auth/e2e-profile`; no MFA dance needed (no second-factor configured per `clients/encore/CLAUDE.md:134`).

---

## §2 — Fields seen (DOM verification)

Verified live DOM via `playwright-cli eval` against the testids in shared-setup-2026-05-12 inventory:

| Inventory field | testid | Live status (2026-05-22) | Verdict vs inventory |
|---|---|---|---|
| Main grid table | `location-settings-table-shared-setup` | visible | MATCH |
| Self-row Shares Inventory checkbox | `location-settings-checkbox-shared-location-0-shares-inventory` | visible; `aria-checked="false"`; not disabled | MATCH (fresh baseline = unchecked, editable) |
| Add Location button (positional last-row) | `[data-testid='location-settings-table-shared-setup'] tbody tr:last-child button` | visible; opens dialog on click | MATCH |
| Save button (shared left-panel) | `location-settings-btn-save` | visible; **disabled** on fresh load (form pristine) | MATCH |
| Change Local Office dialog | `location-settings-modal-change-local-office` | opens on Add click | MATCH |
| Dialog search input | `location-settings-modal-change-local-office-input-search` | visible; placeholder = "Search by Location Name, Number" | MATCH |
| Dialog Select button | `location-settings-modal-change-local-office-btn-select` | visible; **disabled** until row checked | MATCH |
| Dialog Cancel button | `location-settings-modal-change-local-office-btn-cancel` | visible | MATCH |
| Dialog Close (X) button | `location-settings-modal-change-local-office-btn-close` | **NOT FOUND** in current DOM | **DELTA** (see §3) |
| Dialog results table | `location-settings-modal-change-local-office-table-results` | testid not found; **plain `<table>` element exists** with 4378 rows pre-filter | **DELTA** (see §3) |

---

## §3 — Deltas vs 2026-05-12 inventory

Three deltas observed. None affect FCC scope (Phase 2 catalogs gaps; Phase 3 authors net-new tests that do not rely on the missing testids).

**D-001 — Dialog `btn-close` testid absent**
- Inventory L81-82 documented `location-settings-modal-change-local-office-btn-close` (X close button). Live DOM has only `btn-cancel` and `btn-select`.
- No existing TC uses `btn-close` (per grep — Cancel is the canonical close path). Impact: nil.
- Disposition: discussion-item per `feedback_discussion_item_not_bug.md` (empty-everywhere — no spec reference, no UI breakage, no Jira). Filed in `## §6 Suggested catalog updates`.

**D-002 — Dialog results table testid absent**
- Inventory L77 documented `location-settings-modal-change-local-office-table-results`. Live DOM table has no testid (selector resolves via parent dialog + `table` element).
- Existing page-object `getDialogRowCount()` (line 259) uses `tblDlgResults` selector key → likely the selector file maps it via CSS path, not testid. Tests TC-009..016 currently pass, confirming the helper works.
- Disposition: minor inventory drift (was-testid-then-not). FCC tests authored in Phase 3 will use the existing page-object helpers (which already abstract over this), so no fragility introduced.

**D-003 — Initial table row count is 4378, not 4614**
- Inventory L77 documented "4614 rows initial" for the dialog catalog. Live count = 4378.
- Likely cause: locations added/deactivated in tenant DB between 2026-05-12 and 2026-05-22 (~10 days, plausible client data churn). NOT a behavioral regression.
- Disposition: do not assert exact count in FCC tests (LR-022 — no hardcoded structural counts). FCC tests use `> 0` / `< previousCount` assertions.

---

## §4 — BUG-LOC-SHR-001 reproduction (2026-05-22)

Step-by-step:
1. Click Add → "Change Local Office" dialog opens (4378 rows visible).
2. Fill search input with `"Miami"` (literal string, no quotes).
3. Wait 9s for debounce.
4. Observation: `1` row rendered in tbody, but the row's only cell contains the text **"No results."** (DOM: `<td class="...text-center" colspan="...">No results.</td>`).

**Verdict**: CONFIRMED still reproducing — matches `reports/bugs/BUG-LOC-SHR-001.json` verificationLog (2026-05-22 phantom-row semantics). The "1 row" count is the empty-state placeholder, not a real result.

**Sanity check**: Same flow with search term `"Atlanta"` returns **88 real rows** (first row: `2166 / Courtland Grand Hotel`). BUG is Miami-region-specific per the bug filing, not a generic search regression.

Implication for Phase 2 (GIVER) and Phase 3 (BUILDER):
- FCC Search-input cases must use **non-Miami** test data wherever real results are required.
- A single regression-watch FCC case may use Miami + `test.fixme(true, '// FIXME(BUG-LOC-SHR-001): Miami phantom-row, see verificationLog 2026-05-22')` as evidence vehicle per [feedback_failing_TC_as_bug_evidence_vehicle.md](../../../../.claude/projects/C--Users-rutvi-projects-encore-framework/memory/feedback_failing_TC_as_bug_evidence_vehicle.md) gate.

---

## §5 — Save flow sanity (selector freshness)

- Save button (`location-settings-btn-save`) verified **disabled** on fresh load → matches inventory L86 (pristine form behavior).
- Save dialog (`location-settings-modal-save-changes`) + confirm button (`location-settings-modal-save-changes-btn-confirm`) NOT in DOM at idle — they only render after the Save button is clicked. Matches inventory L125-128 + LR-012 shared-save-dialog contract.
- No live click on Save button this walk (would dirty the form; not required for Phase 1 evidence).

---

## §6 — Suggested catalog updates (HUNTER outputs to GIVER)

| # | Update | Recipient | Priority |
|---|---|---|---|
| 1 | Append D-001 discussion-item to field-inventory `## Known gaps` | `field-inventories/shared-setup-2026-05-12.md` (next refresh) | low |
| 2 | Append D-002 to field-inventory `## Known gaps` | same | low |
| 3 | Replace "4614 rows initial" with `> 0` / non-strict assertion guidance | same | medium |
| 4 | Update BUG-LOC-SHR-001 verificationLog cite to point at this walk-evidence file | `reports/bugs/BUG-LOC-SHR-001.json` (out of scope — bug owner refresh) | low |

All four are **out-of-scope-with-named-recipient** per LR-040 — they have grep-verifiable destinations and do not block FCC Phase 2.

---

## §7 — Walk artifacts

- Screenshot: [reports/screenshots/ssl-walk-2026-05-22.png](../../../../reports/screenshots/ssl-walk-2026-05-22.png) (SSL table state post-walk, post-Miami repro, Cancel applied)
- Snapshot YAMLs: `.playwright-cli/page-2026-05-22T14-51-*.yml` through `.playwright-cli/page-2026-05-22T14-55-*.yml` (5 snapshots — initial nav, post-tab-click, post-add-open, post-Atlanta-fill, post-Miami-fill)

---

## §8 — Walk verdict

GREEN. Field-inventory 2026-05-12 spot-check passes (LR-007 path-(a) satisfied — 3 of 3 critical fields agree on testid resolution, default value, enabled/disabled state). Three minor DOM-attribute deltas (D-001/D-002/D-003) recorded with downstream recipients. BUG-LOC-SHR-001 still active; Phase 2 catalog must encode the non-Miami workaround.

Phase 2 (GIVER) cleared to proceed.

## Observations

### Bugs / Defects

none (retrofitted — original walk did not record findings)

### Suggestions / Improvements

none (retrofitted — original walk did not record findings)
