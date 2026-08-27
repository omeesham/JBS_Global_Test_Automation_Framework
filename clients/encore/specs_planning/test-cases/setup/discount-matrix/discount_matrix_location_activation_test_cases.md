# Discount Matrix — Location Activation Test Cases

**Module**: discount-matrix
**Submodule**: LOA
**Page**: Location Settings → Discount Matrix (`/settings/discount-matrix`) — Location Activation tab
**Test Entity**: Office 1604 (listing parity cross-checked on office 1101)
**Updated**: 2026-08-26
**Total TCs**: 11
**Coverage mode**: QUICK (L1)
**Governing Requirement**: NM-3530 (automation scope) · NM-2221 (tab feature contract)
**Verified against**: field inventory `discount-matrix-location-activation-2026-08-25.md`; machine denominator `reports/walk-coverage/dsm-loa--tab-location-activation.json` (20 elements, branch `tab:location-activation`); populated-state probes `reports/walk-coverage/dsm-loa-load-timeline-probe.json` · `dsm-loa-affordance-probe.json` · `dsm-loa-affordance-probe2.json` · `dsm-loa-active-editor-probe.json` · `dsm-loa-toggle-dirty-probe.json`

---

## Correction — this tab HAS data; the earlier "no data" read was the loading window

The first version of this file recorded `0 matching locations` with a disabled toolbar on both
authorized offices and limited every case to that empty contract. That read captured the tab's
**loading window, not its final state**: from tab click to ~41s the grid holds textless placeholder
rows with the search box disabled, and the real listing lands at ~43s — the same ~40s per-tab lazy
fetch the Region Weekly Peaks tab shows. Once loaded, BOTH offices show the full country-scoped
listing (`2041 matching locations` for United States at the time of measurement), which matches
NM-2221's contract: the tab "lists all locations for the selected country". The prior escalation
about what populates this grid on e2e is withdrawn — nothing associates rows to an office; the
listing is country-keyed.

Two findings surfaced while re-measuring the populated grid (both inside NM-2221's own scope line
"sortable / filterable per legacy behavior"); both have since been ruled intended behaviour by the
owner and withdrawn:

- **BUG-DSM-LOA-001 — WITHDRAWN (owner ruling 2026-08-26: accepted behaviour, not a defect)** —
  the enabled search box silently ignores input typed during the first ~1.5–2 minutes after the
  tab renders; the same typing filters correctly after that window (restated 2026-08-26 —
  originally filed as "filters nothing" from probes that all typed inside the dead window;
  staged-retry evidence: reports/walk-coverage/dsm-loa-search-reverify2.json). The measured facts
  stand; only the classification changed. TC-DSM-LOA-010 now waits out the warm-up and proves the
  steady-state filter as a passing case.
- **BUG-DSM-LOA-002 — WITHDRAWN (owner ruling 2026-08-26: working as designed, not a defect)** —
  the grid is not sortable (header clicks reorder nothing; no sort indicator; the only header
  controls are the resize handles). The owner ruled sorting is not part of this grid's design —
  and the authorized old-site check showed the legacy grid does not sort either, so the divergence
  was only against the ticket's wording, not against behaviour.

TC-DSM-LOA-010 and TC-DSM-LOA-011 both pass: -010 proves the steady-state filter after the
accepted warm-up, -011 pins the display-only header contract.

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Search by location number or location name | none — use the placeholder text | Plain text input | Empty; disabled during load, enabled once rows land |
| Workflow Start Date (row cell editor) | none — per-row `input` with placeholder `MM/DD/YYYY` | Date / offset | Per-location date, or empty (`MM/DD/YYYY` showing) |
| Open calendar | none — use `aria-label="Open calendar"` | Button — opens a calendar dialog | One per row |
| Active (row cell) | none — use text content scoped to the cell | Label button `Yes`/`No` that swaps to an inline checkbox editor on click | Per-location flag |
| Resize column | none — use `aria-label^="Resize column"` | Button | One per grid header |
| Cancel | none — use text content scoped to the LOA panel | Button | Disabled until a row edit |
| Save | none — use text content scoped to the LOA panel | Button | Disabled until a row edit |

The tab carries **zero** `data-testid` attributes.

**The Active column's render format is a `Yes` / `No` label button** — not a Unicode tick, not an
SVG check, not an empty cell. Clicking the label swaps the cell to an inline checkbox
(`role="checkbox"`) whose checked state mirrors the label. Any column-reader helper written for
another boolean format returns the wrong answer here. Machine-confirmed 2026-08-25 on populated rows.

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| Data lands ~43s after the tab click | Placeholder rows (textless) with a disabled search box render first; readiness is placeholders cleared AND rows carrying text — row count alone cannot distinguish loading from loaded |
| The footer displays the total record count | e.g. `2041 matching locations` (NM-2221 acceptance criterion: display count of records) |
| The grid renders a bounded window | ~28 DOM rows against the 2041 total — virtualized scrolling, no paginator |
| The listing is country-scoped, not office-scoped | Identical listing and count on office 1604 and office 1101 for the same country |
| Toolbar at rest | Search enabled (once loaded); Cancel and Save disabled until a row edit |
| Active cell edit cycle | Label click → inline checkbox reflecting the value (not yet a change); checking it enables Save AND Cancel; Cancel restores the label and value and re-disables both; no confirmation dialog at any step |
| Search filters only after a warm-up window | Accepted behaviour (owner ruling 2026-08-26; BUG-DSM-LOA-001 withdrawn) — the box enables ~40s in, but typed input is honoured only from ~2 minutes after the tab renders; at steady state it filters by location number or name |
| Headers are display-only | Working as designed (owner ruling 2026-08-26; BUG-DSM-LOA-002 withdrawn) — clicks never reorder the listing and no sort indicator exists; the only header control is the resize handle, matching the legacy grid |
| Criteria-bar coverage lives elsewhere | Country, Currency, Business Tier, Save and the GAV Discount Threshold are covered by `TC-DSM-CRT-001` … `-030`. Not duplicated here. |

---

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Tab reachable and enumerable on office 1604 | `role=tab, name="Location Activation"`; branch run added 20 elements |
| 2 | Grid column headers | `Location` \| `Workflow Start Date` \| `Active` |
| 3 | Footer with no data loaded yet | `0 matching locations` — later shown to be the loading window, see rows 14+ |
| 4 | Placeholder row count | 12 rows, no cell text (loading window) |
| 5 | Toolbar state during load | Search box, `Cancel` and `Save` all observed disabled |
| 6 | Second-office check | Same loading-window state on office 1101 (both reads pre-data, see row 15) |
| 7 | Criteria state during the check | Country `United States`, Currency `USD`, Business Tier `Standard` — fully set |
| 8 | Search box control type | `tag=INPUT;type=text` |
| 9 | Workflow Start Date cell editor | `tag=INPUT;type=text` inside a `td`; populated rows carry placeholder `MM/DD/YYYY` |
| 10 | Date picker opener | `Open calendar` button present per row; opens a calendar dialog |
| 11 | Active column render format | `Yes` / `No` label button inside `td`; swaps to inline checkbox on click |
| 12 | Column resize affordance | One `Resize column` button per grid header |
| 13 | First capture of this surface | No prior walk of Location Activation exists in this repository |
| 14 | Populated state (correction) | Footer `2041 matching locations` on office 1604; real rows (`1101 - Corporate Office Encore USA SGA`, …); search enabled — first seen in the spec run's failure screenshots, then re-measured |
| 15 | Load timeline, both offices | Tab click → ~41s: skeletons 30, textless rows, search disabled; ~43s: skeletons 0, 28 rendered rows with text, search enabled. Identical shape on 1604 and 1101 |
| 16 | Office parity once loaded | Both offices render the same country-scoped listing (28-row window, same leading rows) |
| 17 | Search defect | Typed `1102` (value read back from the input), waited 20s polling + Enter + 3s: footer and rows unchanged |
| 18 | Sort defect | Clicked the `Location` header: row order unchanged, no `aria-sort` attribute before or after |
| 19 | Active edit cycle | Label `No` → click → checkbox `aria-checked="false"`, Save/Cancel still disabled → check → `aria-checked="true"`, Save AND Cancel enabled → Cancel → label `No`, both disabled again; no dialog |
| 20 | Calendar affordance | `Open calendar` click opens a dialog containing a calendar grid; Escape closes it without dirtying |
| 21 | Intent contract | NM-2221 (Done) fetched: country-scoped listing, inline activate/deactivate with dirty tracking + bulk save, "sortable / filterable per legacy behavior", footer record count |
| 22 | External data drift noted | Row `1101` Workflow Start Date read `08/15/2029` in the spec run and `08/16/2029` ~35 min later; neither session edits dates — shared-environment activity, recorded as an observation |
| 23 | Old-site LOA baseline captured | The authorized single tab click on the legacy page rendered the Location Activation panel: same three columns (Location / Workflow Start Date / Active), same leading country-scoped rows (1101, 1102, 1105, 1107, 1112…), a search box above the rows, and Active as a plain checkbox per row |
| 24 | Legacy sort affordance: NONE | Every legacy header has no click handler, no link, default cursor, and no sort state — the legacy grid is not sortable, so the no-sort behaviour on the new site is a baseline MATCH and the "sortable per legacy behavior" ticket line diverges from both implementations. The legacy search box carries no visible binding; its function was not driven (typing is outside the one-click authorization) |

---

## TC-DSM-LOA-001: The tab opens and shows its three columns

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: Location Settings is open for office 1604 on the Discount Matrix page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the `Location Activation` tab | The Location Activation panel becomes the active tab |
| 2 | Wait until no loading placeholders remain and rows carry text | The panel has finished loading |
| 3 | Read the grid column headers left to right | They are `Location`, `Workflow Start Date`, `Active` |

**Notes**: Structural case, and the first automated capture of this surface in this repository.

---

## TC-DSM-LOA-002: The loaded grid reports its record count in the footer

**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)
**Preconditions**: The Location Activation tab is open for office 1604 and has finished loading.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the grid footer | It reads `<total> matching locations` with a total greater than zero |
| 2 | Read the rendered body rows | Every rendered data row carries cell text; the one full-width height-spacer row that implements virtual scrolling is structural, not data |
| 3 | Compare the rendered data-row count to the footer total | The grid renders a bounded window smaller than the total — it virtualizes instead of paginating |

**Notes**: The footer count is an acceptance criterion of the tab's own ticket (display count of
records). The total is asserted as a format plus greater-than-zero, never as a fixed number — the
listing grows as locations are added.

---

## TC-DSM-LOA-003: The search box is disabled while loading and enabled once locations arrive

**Automatable**: Yes
**Preconditions**: Location Settings is open for office 1604 on the Discount Matrix page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the `Location Activation` tab and immediately read the search box | The control is present and disabled while the grid is still loading |
| 2 | Wait for the grid to finish loading and read the search box again | It is enabled |

**Notes**: Two-phase contract measured live: the disabled window lasts ~40s, so step 1's read is
stable. What typing does once enabled is TC-DSM-LOA-010's subject.

---

## TC-DSM-LOA-004: Cancel and Save are disabled while no change is pending

**Automatable**: Yes
**Preconditions**: The Location Activation tab is open for office 1604 and has finished loading.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Cancel button in the Location Activation panel | It is disabled |
| 2 | Read the Save button in the Location Activation panel | It is disabled |

**Notes**: Nothing has been edited, so both actions stay closed. Their enable path is
TC-DSM-LOA-009's subject.

---

## TC-DSM-LOA-005: The listing loads with criteria fully set and belongs to the selected country

**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)
**Preconditions**: Location Settings is open for office 1604 on the Discount Matrix page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the criteria bar | Country `United States`, Currency `USD`, Business Tier `Standard` — all three set |
| 2 | Click the `Location Activation` tab and wait for loading to finish | The panel is active and populated |
| 3 | Read the grid footer and the leading rows | The footer total is greater than zero and the corporate location `1101 - Corporate Office Encore USA SGA` appears in the listing |

**Notes**: The listing is keyed by the selected country, and the corporate office is the most
stable row to anchor on. A per-country re-query case (change Country, expect the listing to
reload) is deliberately deferred to the deep tier — it costs two full ~40s tab loads.

---

## TC-DSM-LOA-006: The listing is country-scoped, not office-specific

**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)
**Preconditions**: The automation account has access to office 1604 and office 1101.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open Discount Matrix → Location Activation for office 1604, wait for loading to finish, read the footer total | A total greater than zero |
| 2 | Open Discount Matrix → Location Activation for office 1101, wait for loading to finish, read the footer total | The same total as office 1604 |

**Notes**: The tab lists all locations for the selected country, so two authorized offices under
the same country must agree on the total. Asserted as equality between the two reads, never as a
fixed number.

---

## TC-DSM-LOA-007: Every column header offers a resize control

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: The Location Activation tab is open for office 1604 and has finished loading.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Count the `Resize column` controls in the grid header row | There is one per column header |

**Notes**: Grid chrome. Asserted by count against the header set rather than a fixed number, so
adding a column does not silently pass.

---

## TC-DSM-LOA-008: Location Activation keeps the criteria bar above it

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: Location Settings is open for office 1604 on the Discount Matrix page, Company Matrix tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read Country, Currency and Business Tier in the criteria bar | They show `United States`, `USD` and `Standard` |
| 2 | Click the `Location Activation` tab and wait for loading to finish | The Location Activation panel is active |
| 3 | Read the criteria bar again | The same three values are still shown and the bar is still present |

**Notes**: The criteria bar is shared chrome across all three tabs. This case asserts only that it
survives the tab switch; its field behaviour is covered by `TC-DSM-CRT-001` … `-030`.

---

## TC-DSM-LOA-009: Toggling a location's Active flag dirties the form and Cancel discards it

**Automatable**: Yes
**Preconditions**: The Location Activation tab is open for office 1604 and has finished loading. Nothing is saved by this case.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | In the row for `1102 - Corporate Office - Long Beach`, read the Active cell | It renders as a text label button (`Yes` or `No`) |
| 2 | Click the label | The cell swaps to an inline checkbox whose checked state mirrors the label; Save and Cancel stay disabled — entering edit mode is not yet a change |
| 3 | Click the checkbox to flip the value | The checkbox flips; Save AND Cancel both become enabled |
| 4 | Click Cancel | The cell returns to its original label with the original value; Save and Cancel are disabled again; no confirmation dialog appears at any step |

**Notes**: The full edit-discard cycle measured live 2026-08-25. Persisting a toggle (Save →
reload → read back → restore) is a shared-data mutation deferred to the deep tier; this case
proves the dirty tracking and the discard path without ever saving.

---

## TC-DSM-LOA-010: Searching filters the listing by location number

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Location Activation tab is open for office 1604 and has finished loading. The search box honours input only once the tab's warm-up ends (~2 minutes after render) — enabled is not yet functional, and the warm-up is accepted product behaviour.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Type a known location number (e.g. `1102`) into the search box; if the listing has not responded within ~30 seconds, clear the box and type it again (repeat — the warm-up can take a couple of minutes) | Once the warm-up ends, a typed round takes effect |
| 2 | Read the listing and the footer | The listing narrows to the one matching location (`1102 - Corporate Office - Long Beach`) and the footer reads `1 matching locations` |
| 3 | Clear the search box | The full listing and the original footer total return |

**Notes**: Steady-state contract per the tab's ticket ("filterable per legacy behavior") and the
control's own placeholder, asserted with bounded retyped rounds so the warm-up window cannot fail
the case. History: originally filed as the defect "search filters nothing" (2026-08-25), restated
2026-08-26 to the ~1.5–2-minute silent warm-up (staged-retry evidence
reports/walk-coverage/dsm-loa-search-reverify2.json — same typing fails at +0s and +30s after
settle, succeeds after a further +60s idle, matching the owner's working-search screenshot), then
ruled accepted behaviour by the owner the same day and the report withdrawn (BUG-DSM-LOA-001,
status withdrawn). The case accordingly changed from expected-failure (immediate-readiness
contract) to this passing steady-state form. Baseline note
(2026-08-26): the legacy page exposes the same search box above the listing, so the affordance is
inherited from legacy; whether the legacy one filters (or shares the dead window) was not driven
(typing sits outside the one-click baseline authorization).

---

## TC-DSM-LOA-011: Column headers are display-only and never reorder the listing

**Automatable**: Yes
**Surface_Family**: sorting (QUICK)
**Preconditions**: The Location Activation tab is open for office 1604 and has finished loading.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the leading rows of the listing | A baseline order is captured |
| 2 | Click the `Location` column header | The listing order is unchanged and no sort indicator appears |
| 3 | Click the same header again | The order is still unchanged |

The headers are display-only by design: their only control is the per-column resize handle, and
clicking the header text is inert. This case pins that contract so a header click starting to
mutate the listing would be caught as an unintended change.

**History (2026-08-26)**: originally authored as a sort-expected case against the ticket's
"sortable per legacy behavior" wording and filed as BUG-DSM-LOA-002 when header clicks reordered
nothing. The authorized old-site check then showed the legacy grid does not sort either — no
header carries a click handler, sort state, or pointer cursor — and the owner ruled sorting is
not part of this grid's design. The report is withdrawn and the case asserts the display-only
behaviour as correct.

**Notes**: Working as designed per the product owner (2026-08-26) — sorting is not in this
feature's design. BUG-DSM-LOA-002 withdrawn; the legacy page matches (no sort affordance there
either).
