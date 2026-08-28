# Discount Matrix — Region Weekly Peaks Test Cases

**Module**: discount-matrix
**Submodule**: RWP
**Page**: Location Settings → Discount Matrix (`/settings/discount-matrix`) — Region Weekly Peaks tab
**Test Entity**: Office 1604
**Updated**: 2026-08-27
**Total TCs**: 26
**Coverage mode**: QUICK (L1)
**Governing Requirement**: NM-3530
**Verified against**: field inventory `discount-matrix-region-weekly-peaks-2026-08-25.md`; machine denominator `reports/walk-coverage/dsm-rwp--tab-region-weekly-peaks.json` (20 elements, branch `tab:region-weekly-peaks`); classification-checkbox model and dirty tracking measured live 2026-08-25 — `reports/walk-coverage/dsm-revert-styling-probe.json`; year-creation / export / import contracts measured live 2026-08-26 (authorized mutation, offices 1604/1101 freed for data changes) — `reports/walk-coverage/dsm-rwp-io-recon-probe.json` + `reports/walk-coverage/dsm-rwp-io-mutating-probe.json`; criteria-bar cross-tab contracts (country re-scope, currency cascade, two-Save independence, bar save from this tab) measured live 2026-08-27 — `reports/walk-coverage/dsm-critbar-rwp-probe.json`

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Select Year | none — use `id="region-weekly-peaks-year"` | Dropdown / combobox (Radix) | `2027` |
| Region | none — use `id="region-weekly-peaks-region"` | Dropdown / combobox (Radix) | `Atlanta` |
| Week peak flags | none — use `role="checkbox"` scoped to the row | Checkbox (native + Radix) | Exactly one checked per row |
| Add Year | none — use text content | Button | Enabled once the tab is loaded (disabled only during the loading window) |
| Export | none — use text content | Button | Enabled once the tab is loaded |
| Import | none — use text content | Button | Enabled once the tab is loaded |
| Cancel | none — use text content, scoped to the RWP panel | Button | Disabled at rest |
| Save | none — use text content, scoped to the RWP panel | Button | Disabled at rest |

The tab carries **zero** `data-testid` attributes. Select Year and Region are the only two controls on this
surface with a stable non-structural anchor; everything else is reached by text scoped to the RWP panel.

The criteria bar above the tab strip (Country / Currency / Business Tier / GAV Discount Threshold / Save)
is shared chrome: its own field behaviour is covered by the criteria-bar suite, while its **interaction
with this tab** — country re-scope, currency cascade, two-Save independence, saving from this tab — is
covered here by `TC-DSM-RWP-025` / `TC-DSM-RWP-026` (see the note under Validation Rules).

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| Year and Region are pre-populated at rest | `2027` / `Atlanta`. An earlier walk recorded them as empty; that reading came from an unhydrated snapshot and is wrong. |
| The toolbar splits at rest (corrected 2026-08-25 evening) | Loaded with Year + Region selected: `Add Year`, `Export`, `Import` enabled; `Cancel` and `Save` disabled until a row changes. The earlier "all disabled" rule was a loading-window read. |
| Start dates render in the suite's pinned timezone | Week starts are stored at UTC midnight; the pinned New York browser context renders them one day back (week 1 of 2027 = `02-Jan-2027`). Date literals in cases are runner-context values. |
| Row count cannot distinguish loading from loaded | 52 rows render immediately as placeholders. Readiness is the skeleton census reaching zero, or checkbox count exceeding zero — never row count. |
| The footer count is a loading signal, not an empty signal | `Count: 0` shows for the entire ~40s load and becomes `Count: 52` only when data lands. |
| One peak flag checked per week | 156 checkboxes = 52 weeks × 3 columns, exactly one checked per row as of 2026-08-19. Live-confirmed 2026-08-25 (MCP rows 13–14): the three columns are one app-enforced choice — ticking a sibling clears the row's current tick — and a ticked box can be cleared, leaving a week with zero ticks. |
| Criteria-bar coverage splits by axis | The bar's own field behaviour (dropdown contents, threshold validation, its Save on the landing tab) is covered by the criteria-bar suite `TC-DSM-CRT-001` … `TC-DSM-CRT-030` and not duplicated here. Its interaction with THIS tab — country re-scope of the grid, the currency cascade, bar-Save vs panel-Save independence, and saving the bar while this tab is open — is covered here by `TC-DSM-RWP-025` / `TC-DSM-RWP-026` (measured 2026-08-27, `dsm-critbar-rwp-probe.json`). |

---

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Tab reachable and enumerable on office 1604 | `role=tab, name="Region Weekly Peaks"`; branch run added 20 elements |
| 2 | Select Year anchor and default | `id="region-weekly-peaks-year"`, value `2027` |
| 3 | Select Year option set | 3 options — `2027`, `2026`, `2025` |
| 4 | Region anchor and default | `id="region-weekly-peaks-region"`, value `Atlanta` |
| 5 | Region option set | 28 options; `LA / AL` present |
| 6 | Toolbar state at rest | `Add Year`, `Export`, `Import`, `Cancel`, `Save` all observed `disabled` |
| 7 | Grid column headers | `Week` \| `Start Date` \| `Non-Peak` \| `Standard` \| `Peak` |
| 8 | Two-stage load measured | tab click +2ms → 52 rows, 0 checkboxes, 260 skeletons, `Count: 0`; +40595ms → 52 rows, 156 checkboxes, 0 skeletons, `Count: 52` |
| 9 | Total navigation to usable data | 134s |
| 10 | Checkbox control type | Machine-resolved as Checkbox (native + Radix); `tag=BUTTON;type=button;role=checkbox` |
| 11 | Week row shape (2026-08-19 evidence) | `1 / 03-Jan-2027`, `2 / 10-Jan-2027`, … each with three checkboxes, exactly one checked — dates as rendered in THAT session's timezone; see row 17 |
| 12 | NM-3234 (Add Year enabled with no Year/Region) | Superseded by row 18 — the "disabled" read was the loading window, and a loaded tab always has Year/Region selected, so the ticket's no-selection state is not reachable on a normal open |
| 13 | Classification model (2026-08-25) | Clicking an unticked box ticks it **and clears the previously ticked one** — the three columns are one choice, enforced by the app |
| 14 | NM-3238 (ticked box cannot be cleared) | Not reproducible on `2027` / `Atlanta` — clicking the ticked box cleared it, leaving week 1 with zero ticked and Save enabled |
| 15 | Grid dirty tracking | Toggling enables Save; clicking the originally ticked box back disables it again |
| 16 | Evidence | `reports/walk-coverage/dsm-revert-styling-probe.json` |
| 17 | Start-date rendering is timezone-dependent (2026-08-25 evening) | The server stores week starts at UTC midnight; the suite's pinned New York browser renders week 1 as `02-Jan-2027` / week 2 as `09-Jan-2027`, one day back from what a local-timezone probe reads. The pinned suite context is the contract the specs assert |
| 18 | At-rest toolbar, loaded state (2026-08-25 evening run screenshot) | `Add Year`, `Export`, `Import` enabled; `Cancel`, `Save` disabled. The earlier "all five disabled" read (row 6) was taken during the ~40s loading window |
| 19 | Save transport (2026-08-25 evening) | The panel save reaches the server on the page's own sync POST, which can fire ~30s after the click with nothing in flight before it — persistence is proven only by reload-and-read, and the spec's save helper waits the sync out |
| 20 | Old-site RWP baseline captured (2026-08-26, authorized single tab click) | The legacy panel matches structurally: same grid columns (Week / Start Date / Non-Peak / Standard / Peak), three checkboxes per week with exactly one checked in live data, the same 28-region list with Atlanta first and selected, and the same at-rest toolbar split — Add Year / Export / Import enabled, Save / Cancel disabled. The corrected row-18 contract is therefore a baseline MATCH, not a new-site invention |
| 21 | Old-site default-year divergence (2026-08-26) | The legacy tab rests on year 2026 with options listed oldest-first (2025 / 2026 / 2027); the new site rests on 2027 listed newest-first. Same three-year set on both. Recorded as an intentional-looking default-policy divergence (current year vs next year) for classification, not filed as a defect. Legacy week 1 of 2026 renders 04-Jan-2026 in the probing machine timezone — Sunday starts, consistent with the new site read in the same context |
| 22 | `LA / AL` region data (2026-08-26) | Selecting `LA / AL` re-queries and lands the full year: 52 rows, 156 boxes, `Count: 52`, week 1 `02-Jan-2027`, first five rows each with exactly one tick; restore to `Atlanta` read back clean. Machine evidence: reports/walk-coverage/dsm-rwp-laal-probe.json |
| 23 | Cancel-after-dirty (2026-08-26) | Week 1 at rest held one tick with the toolbar closed; ticking a different class flipped the tick and enabled Cancel + Save; Cancel restored the original tick and disabled both; no dialog appeared; a post-probe reload read the at-rest state back, so nothing reached the server. Machine evidence: reports/walk-coverage/dsm-rwp-cancel-revert-probe.json |
| 24 | Create Year window (2026-08-26, authorized mutation) | Add Year opens a `Create Year` window whose controls sit disabled ~40s while it loads its own data (NM-3074 tracks the slowness); its year list then offers only unconfigured years, starting with the one after the newest (`2028`, `2029`, `2030` while 2027 was newest); picking a year auto-fills Week 1 Start Date (`01/01/2028`) and shows Last Week of Previous Year (`12/25/2027 - 12/31/2027`); `Initialize with previous year` defaults ON. Create took ~59s and `2028` joined the selector. Machine evidence: reports/walk-coverage/dsm-rwp-io-mutating-probe.json |
| 25 | Default-year policy (2026-08-26) | After `2028` was created, a fresh load rested on `2028` — the tab always opens on the NEWEST configured year, and the created year arrived as a full copy of 2027 (52 rows, every week exactly one tick). Rows 2–3's fixed `2027` reads describe the seed state, which is now the fixed TAIL of a growing list. Extends the row-21 divergence record: legacy rests on the current year, the new site on the newest configured year |
| 26 | Export contract (2026-08-26) | Direct download with no window or prompt: `RegionWeeklyPeakExport_<date, time>.xlsx`, ~8.6 KB; the unzipped sheet carries the instruction banner, a header row (Country, Currency, Region, week numbers 1–52), a start-date row, then one digit row per region (29 rows) |
| 27 | Import contract (2026-08-26, authorized mutation) | Native single-file chooser, no window; the chosen workbook auto-APPLIED to the grid ~70s after the chooser closed AND auto-PERSISTED server-side with NO Save click — a reload read the imported tick back (~171s end to end). Machine evidence: reports/walk-coverage/dsm-rwp-io-mutating-probe.json |
| 28 | Import file-name sensitivity + second timing (2026-08-26, authorized mutation) | Import silently ignores a file that lacks the workbook's `.xlsx` name — the identical workbook fed from an extensionless temporary copy produced a five-minute no-op TWICE (no message, no grid change), while the same content saved under a proper `.xlsx` name applied in ~41s and persisted (2029 `Austin`, week 1 AND week 2 restored together — the year-boundary week is NOT special; export carries its digit, verified in the file). Machine evidence: reports/walk-coverage/dsm-rwp-2029-import-split-probe.json + dsm-rwp-2029-restore-and-export-content.json |

---

## TC-DSM-RWP-001: The tab opens on the newest year with a region selected

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: Location Settings is open for office 1604 on the Discount Matrix page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the `Region Weekly Peaks` tab | The Region Weekly Peaks panel becomes the active tab |
| 2 | Wait until the panel finishes loading (no loading placeholders remain) | The grid shows week rows and the footer reads `Count: 52` |
| 3 | Read the Select Year control | It shows the newest configured year — the top entry of its own list |
| 4 | Read the Region control | It shows `Atlanta` |

**Notes**: Guards the correction made on 2026-08-25 — an earlier walk recorded both controls as empty, having read them before the page finished loading. Reworded 2026-08-26 (verification log row 25): the resting year is the NEWEST configured year, not a fixed `2027` — the list grows as TC-DSM-RWP-022 creates years, so the expected value is computed from the list itself.

---

## TC-DSM-RWP-002: Select Year lists the configured years, newest first

**Automatable**: Yes
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Select Year control | The year list opens |
| 2 | Read every option in the list | The years descend newest-first with no order breaks, and the list ends with the three seed years `2027`, `2026`, `2025` |
| 3 | Press Escape | The list closes and the control still shows one of the listed years |

**Notes**: Option-set case. Closing with Escape leaves the selection untouched, so the test mutates nothing. Reworded 2026-08-26 (verification log row 25): the list GROWS as TC-DSM-RWP-022 creates years and the app offers no way to delete one, so the contract is the list's shape — strictly descending with the seed years as its fixed tail — never an exact fixed set.

---

## TC-DSM-RWP-003: Region offers the full set of 28 regions

**Automatable**: Yes
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Region control | The region list opens |
| 2 | Count the options | 28 options are offered |
| 3 | Confirm the list contains `Atlanta`, `LA / AL`, `SF` and `VA / W PA` | All four are present |
| 4 | Press Escape | The list closes and the control still shows `Atlanta` |

**Notes**: Option-set case. `LA / AL` is checked explicitly because NM-3293 reports that region failing to display data — this case proves only that the option exists, not that it returns rows.

---

## TC-DSM-RWP-004: The grid shows the five weekly-peak columns

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the grid column headers left to right | They are `Week`, `Start Date`, `Non-Peak`, `Standard`, `Peak` |

**Notes**: Structural case. The three right-hand columns are the peak-classification columns each week row carries.

---

## TC-DSM-RWP-005: A loaded year shows 52 week rows and a matching footer count

**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open for office 1604 with `2027` and `Atlanta` selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Wait until no loading placeholders remain in the grid | The grid has finished loading |
| 2 | Count the week rows | 52 rows are present |
| 3 | Read the footer count | It reads `Count: 52` |

**Notes**: Volume case. The footer must agree with the row count once loading has finished.

---

## TC-DSM-RWP-006: The grid is still loading while the footer reads zero

**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)
**Preconditions**: Location Settings is open for office 1604 on the Discount Matrix page, Company Matrix tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the `Region Weekly Peaks` tab and read the grid immediately | 52 rows are already present but they are placeholders — no checkboxes are rendered |
| 2 | Read the footer at the same moment | It reads `Count: 0` |
| 3 | Wait until the loading placeholders disappear | Checkboxes appear and the footer changes to `Count: 52` |

**Notes**: Render-state case, and the one that protects every other test on this tab. Row count is 52 in both the loading and loaded states, so a test that waits on row count passes against an empty grid. Measured 2026-08-25: data lands ~40.6s after the tab click, 134s from navigation.

---

## TC-DSM-RWP-007: Each week row carries exactly one peak classification

**Automatable**: Yes
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `2027` / `Atlanta`.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Count all checkboxes in the grid | 156 checkboxes are present — 52 rows × 3 columns |
| 2 | For every week row, count how many of its three checkboxes are checked | Exactly one is checked in every row |

**Notes**: Data-integrity case. The app enforces this as mutual exclusivity — live-confirmed 2026-08-25 (MCP row 13): ticking an unticked box clears the row's previously ticked one. A row can still be left with zero ticks by clearing its tick (MCP row 14, exercised by TC-DSM-RWP-014), so this case asserts the at-rest data shape, not an invariant the app forbids breaking.

---

## TC-DSM-RWP-008: Week rows are numbered in sequence with weekly start dates

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `Atlanta` selected.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Pin the reference year: choose `2027` in Select Year and wait for the reload | The control shows `2027` — the tab itself rests on the newest configured year, which changes as years are created |
| 2 | Read the Week and Start Date cells of the first row | Week `1`, Start Date `02-Jan-2027` |
| 3 | Read the Week and Start Date cells of the second row | Week `2`, Start Date `09-Jan-2027` |
| 4 | Read the Week value of the last row | It is `52` |
| 5 | Confirm each successive start date is seven days after the previous one | Dates advance one week at a time with no gap or repeat |

**Notes**: Result-fidelity case. The start dates are derived from the selected year, so the date-exact reads are pinned to the reference year `2027` (step added 2026-08-26 when the resting year became the newest configured year).

---

## TC-DSM-RWP-009: Data actions are open and edit actions closed at rest

**Automatable**: Yes
**Preconditions**: Location Settings is open for office 1604 on the Discount Matrix page.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the `Region Weekly Peaks` tab and wait for loading to finish | The panel is active with its year and region selected and the grid loaded |
| 2 | Read the state of `Add Year`, `Export` and `Import` | All three are enabled — the data actions are available once the tab is loaded |
| 3 | Read the state of `Cancel` and `Save` | Both are disabled — the edit pair stays closed until a row changes |

**Notes**: At-rest contract, corrected 2026-08-25 evening: the first draft expected all five
disabled, but that was a read taken during the tab's ~40s loading window (the same misread class
the Location Activation tab suffered). Once loaded, the tab always has a year and region selected,
so the no-selection state NM-3234 describes is not reachable on a normal open — the run's
screenshot proves `Add Year` enabled at rest, and whether NM-3234's original no-selection defect
is fixed remains unverified either way.

---

## TC-DSM-RWP-010: Cancel and Save stay disabled while nothing has been edited

**Automatable**: Yes
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Without touching any control, read the Cancel and Save buttons in the Region Weekly Peaks panel | Both are disabled |
| 2 | Open the Region list and press Escape without choosing anything | Both remain disabled |

**Notes**: Pristine-state case. Opening and dismissing a dropdown is not an edit and must not dirty the form.

---

## TC-DSM-RWP-011: Switching region reloads the grid for that region

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `2027` / `Atlanta`.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note the checked column for week 1 | The current classification is recorded |
| 2 | Open the Region list and choose `Austin` | The control shows `Austin` |
| 3 | Wait until the loading placeholders disappear | The grid finishes reloading and the footer returns a count |
| 4 | Read the grid again | 52 week rows are present for the newly selected region |
| 5 | Restore: choose `Atlanta` again and wait for the reload | The control shows `Atlanta` and the grid reloads |

**Notes**: Re-query case. Read-only — no Save is pressed, so no application state changes. Step 3 must gate on loading placeholders clearing, not on row count, which stays 52 throughout.

---

## TC-DSM-RWP-012: Switching year reloads the grid with that year's dates

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `Atlanta` selected (any starting year — the tab rests on the newest configured one).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Select Year list and choose `2026` | The control shows `2026` |
| 2 | Wait until the loading placeholders disappear | The grid finishes reloading |
| 3 | Read the Start Date of week 1 | It falls in January 2026, not 2027 |
| 4 | Restore: choose `2027` again and wait for the reload | The control shows `2027` and week 1 reads `02-Jan-2027` |

**Notes**: Re-query case on the second criteria axis. Read-only.

---

## TC-DSM-RWP-013: Region Weekly Peaks keeps the criteria bar above it

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: Location Settings is open for office 1604 on the Discount Matrix page, Company Matrix tab active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read Country, Currency and Business Tier in the criteria bar | They show `United States`, `USD` and `Standard` |
| 2 | Click the `Region Weekly Peaks` tab and wait for loading to finish | The Region Weekly Peaks panel is active |
| 3 | Read the criteria bar again | The same three values are still shown and the bar is still present |

**Notes**: The criteria bar is shared chrome across all three tabs. This case asserts only that it survives the tab switch; its field behaviour is covered by the criteria-bar suite `TC-DSM-CRT-001` … `TC-DSM-CRT-030`.

---

## TC-DSM-RWP-014: A ticked classification can be cleared, leaving the week unclassified

**Automatable**: Yes — mutating; restores its own change without saving.
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `2027` / `Atlanta`.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note which of week 1's three boxes is ticked | The starting classification is captured |
| 2 | Click the ticked box | It clears — week 1 now has **no** classification ticked at all |
| 3 | Count the ticked boxes in week 1 | Zero |
| 4 | Read the Save button | It is enabled, so the unclassified row could be submitted |
| 5 | Restore: click the box captured in step 1 | It is ticked again and Save returns to disabled |

**Notes**: Two things are worth flagging here. First, NM-3238 reported that a ticked Peak / Standard / Non-Peak box could not be cleared; on office 1604 with `2027` / `Atlanta` it clears without resistance, so that report does not reproduce on this data as of 2026-08-25. Second, and more useful: the grid allows a week to be left with no classification and offers to save it that way, which contradicts the one-per-row rule that TC-DSM-RWP-007 asserts across all 52 rows. Whether the server refuses such a row is not covered here — this case deliberately stops before Save. If leaving a week unclassified is not intended, this case is the evidence for it.

---

## TC-DSM-RWP-015: Selecting 2025 reloads the grid with that year's dates

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `Atlanta` selected (any starting year — the tab rests on the newest configured one).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Select Year list and choose `2025` | The control shows `2025` |
| 2 | Wait until the loading placeholders disappear | The grid finishes reloading |
| 3 | Read the Start Date of week 1 | It falls in January 2025 |
| 4 | Restore: choose `2027` again and wait for the reload | The control shows `2027` and week 1 reads `02-Jan-2027` |

**Notes**: The oldest seed year. With `2027` date-pinned by TC-DSM-RWP-008 and TC-DSM-RWP-012 and `2026` covered by TC-DSM-RWP-012, all three seed years are exercised; years created above them are covered by the list-shape case (TC-DSM-RWP-002) and the creation case (TC-DSM-RWP-022). Read-only — no Save is pressed.

---

## TC-DSM-RWP-016: Selecting the last region in the list reloads the grid

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `2027` / `Atlanta`.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Region list and choose `VA / W PA`, the last of the 28 options | The control shows `VA / W PA` |
| 2 | Wait until the loading placeholders disappear | The grid finishes reloading and the footer returns a count |
| 3 | Read the grid | 52 week rows are present for the newly selected region |
| 4 | Restore: choose `Atlanta` again and wait for the reload | The control shows `Atlanta` and the grid reloads |

**Notes**: End-of-list case. `Atlanta` is both the first option and the resting selection, so the opposite end of the list is already exercised by every other case in this file; `VA / W PA` is the one that is not. A long option list is where a dropdown is most likely to fail to reach its final entry, which is why the last option gets its own case while the middle 26 do not.

---

## TC-DSM-RWP-017: Choosing a different classification moves it off the previous one

**Automatable**: Yes — mutating; restores its own change without saving.
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `2027` / `Atlanta`.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read week 1's three classification boxes and note which one is ticked, and read the Save button | Exactly one box is ticked and Save is disabled |
| 2 | Click one of the two unticked boxes | The clicked box becomes ticked **and the previously ticked box clears on its own** |
| 3 | Count the ticked boxes in week 1 | Exactly one is ticked — the one just clicked |
| 4 | Read the Save button | It is now enabled |
| 5 | Restore: click the box that was ticked in step 1 | That box is ticked again and the other clears |

**Notes**: This is the case that proves the three columns are genuinely one choice rather than three independent switches — the app clears the old selection for you. It is the behavioural basis for TC-DSM-RWP-007's one-per-row rule. Nothing is saved: step 5 puts the row back the way it was found, and TC-DSM-RWP-018 proves that restoring this way really does cancel the edit.

---

## TC-DSM-RWP-018: Undoing a classification change returns Save to disabled

**Automatable**: Yes
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `2027` / `Atlanta`.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note which of week 1's three boxes is ticked, and read the Save button | One box is ticked and Save is disabled |
| 2 | Click one of the two unticked boxes | Save becomes enabled |
| 3 | Click the box that was ticked in step 1 | That box is ticked again and Save returns to disabled |

**Notes**: Dirty-tracking case for the grid, matching TC-DSM-CRT-026 for the threshold field. Save returning to disabled is what makes the restore steps in the other classification cases trustworthy — without it, every one of them would leave the form dirty and the next case would inherit it.

---

## TC-DSM-RWP-019: A classification change survives a save and reload

**Automatable**: Yes — mutating; saves, then restores through the same path.
**Surface_Family**: persistence (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `2027` / `Atlanta`.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note which of week 1's three boxes is ticked | The starting classification is captured |
| 2 | Click one of the two unticked boxes | It becomes ticked, the previous one clears, and Save is enabled |
| 3 | Click Save | The save is submitted |
| 4 | Reload the page, reopen Region Weekly Peaks, and wait for loading to finish | The page is freshly loaded |
| 5 | Read week 1's boxes | The classification chosen in step 2 is still the ticked one |
| 6 | Restore: click the box captured in step 1, save, reload, and read week 1 back | Week 1 is ticked exactly as it was found |

**Notes**: The only saving case in this file, and the only proof that an edit on this grid reaches the server. Step 4 is not optional — Save greys out the instant it is clicked, so a disabled button says nothing about whether the change persisted. Step 6 restores through the same save-and-reload path, because a restore that is not read back is not a restore. First ran green in the 2026-08-25 module suite run — the change survived the reload and the restore read back clean, so the persistence contract holds on this grid.

---

## TC-DSM-RWP-020: Switching to the LA / AL region loads that region's complete weekly grid

**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `2027` / `Atlanta`.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Choose `LA / AL` in the Region list and wait for the grid to reload | The Region control shows `LA / AL` |
| 2 | Count the week rows and the classification boxes | 52 rows and 156 boxes — the full year, not an empty or partial set |
| 3 | Read the footer | `Count: 52` |
| 4 | Read the first five week rows | Each carries exactly one ticked classification |
| 5 | Restore: choose `Atlanta` and wait for the reload | The Region control shows `Atlanta` again |

**Notes**: Region-specific data check on the one region with a defect history: NM-3293 reported this tab's weekly-peaks data for `LA / AL`. Measured live 2026-08-26 (verification log row 22) — the full classified year is present, so this case pins the healthy contract and fails the moment that region's data regresses to empty or partial. Complements TC-DSM-RWP-011, which proves the switch mechanics on another region at count level; this case reads the classification data itself on the named risk region. Nothing is edited or saved.

---

## TC-DSM-RWP-021: Cancel discards a pending classification change and closes the toolbar

**Automatable**: Yes
**Surface_Family**: persistence (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with `2027` / `Atlanta`.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note which of week 1's three boxes is ticked and read the toolbar | One box is ticked; Cancel and Save are both disabled |
| 2 | Click one of the two unticked boxes | The tick moves to it, and Cancel and Save both become enabled |
| 3 | Click Cancel | The pending change is discarded |
| 4 | Read week 1's boxes and the toolbar | The original box is ticked again, and Cancel and Save are disabled |

**Notes**: The discard half of this grid's edit lifecycle — TC-DSM-RWP-019 proves the save path, this case proves the throw-away path. Measured live 2026-08-26 (verification log row 23): Cancel reverted the tick, closed the toolbar with no dialog, and a reload confirmed nothing reached the server. The history that motivates it: NM-3485 records a past defect where Cancel reverted values that were already saved and left Save enabled — this case pins the corrected contract and fails if that behaviour ever returns. Nothing is saved at any point.

---

## TC-DSM-RWP-022: Add Year creates the next year as a full copy of the previous one

**Automatable**: Yes
**Surface_Family**: io (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604. Year creation is PERMANENT — the app offers no way to delete a year — and data changes on offices 1604/1101 were authorized before this case was authored; the case always creates the year after the newest, so every run stays repeatable.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the year list, then click Add Year | A `Create Year` window opens with its controls disabled while it loads its own data (slow — a tracked performance issue; allow minutes) |
| 2 | Wait for the window's year selector to enable, then open it | It offers only unconfigured years, starting with the year after the newest |
| 3 | Read the `Initialize with previous year` box | Ticked by default |
| 4 | Choose the first offered year and click `Create Year` | The window closes once the server finishes creating the year (around a minute) |
| 5 | Open the year list again | The created year now sits at the top |
| 6 | Reload the page and reopen the tab | The tab rests on the created year — the newest always wins |
| 7 | Read all 52 week rows | Every week carries exactly one classification — the new year is a full copy of the previous one |

**Notes**: Measured live 2026-08-26 (verification log rows 24–25): window enable ~40s, creation ~59s, `2028` created as a full copy of 2027, and a fresh load rested on it. The default copy also keeps the suite self-sustaining — each run creates the next year from a fully classified predecessor, so step 7 holds run after run. NM-3074 already tracks the window's slow load; the case budgets generously rather than re-filing it.

---

## TC-DSM-RWP-023: Export downloads the full peak workbook without any window

**Automatable**: Yes
**Surface_Family**: io (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Choose the last region in the Region list and wait for the reload | The grid loads for that region |
| 2 | Click Export | A file downloads immediately — no window or prompt appears |
| 3 | Read the downloaded file's name | It starts with `RegionWeeklyPeakExport_` and ends in `.xlsx` |
| 4 | Check the downloaded file's size | Several kilobytes — the workbook carries every region's row for the year, not just the selected region |

**Notes**: Measured live 2026-08-26: Export fires straight from the toolbar with no dialog and
names the file `RegionWeeklyPeakExport_<date, time>.xlsx` (~8.8 KB with 29 region rows). The
workbook's layout: an instruction banner ("Alert the weeks only for each region with a single
digit — 0 Non-Peak / 1 Standard / 2 Peak / 3 Inactive"), a header row (Country, Currency, Region,
week numbers 1–52), a row of week start dates, then one digit row per region. Exporting with the
last region selected shows the download is year-scoped rather than filtered to the selected
region. Reading the workbook's cell contents back is deliberately left to the deeper pass — this
case pins that the download happens, is named correctly, and is not an empty shell.

---

## TC-DSM-RWP-024: Import applies an exported workbook and persists it without Save

**Automatable**: Yes
**Surface_Family**: io (QUICK)
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604, on the newest year with region `Austin` selected. Data changes on office 1604 are authorized; the exported workbook itself is the restore vehicle, so the case ends with the server back in its starting state.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select the newest year and region `Austin`; note which of week 1's boxes is ticked | Week 1 carries exactly one tick |
| 2 | Click Export and keep the downloaded file | The current state of every region is snapshotted into the workbook |
| 3 | Clear week 1's tick, Save, reload, reselect the year and `Austin` | Week 1 shows no tick — the clear genuinely reached the server |
| 4 | Click Import and pick the exported workbook in the file chooser | No window appears; after processing (minutes — the same tracked slowness) the grid shows week 1's original tick again |
| 5 | Reload, reselect the year and `Austin`, read week 1 — Save is never clicked after the import | The original tick is back and week 1 carries exactly one classification: the import persisted on its own |

**Notes**: Measured live 2026-08-26 (verification log row 27): the workbook auto-applied to the grid ~70s after the chooser closed and auto-persisted server-side with no Save click (~171s end to end, reload-verified). Running on `Austin` — not the resting region — proves import is not tied to the default selection; together with TC-DSM-RWP-023's last-region export, the different-region axis rides the io pair. NM-3074 tracks the import slowness — the case budgets generously rather than re-filing it. The exported snapshot must be fed back under its real `.xlsx` name: import silently ignores a file without it (verification log row 28), so the automation saves the download to a properly named copy before importing. If a crashed earlier run left week 1 unclassified, the automated case first repairs it with a real, verified save before starting the round-trip.

---

## TC-DSM-RWP-025: Changing Country re-scopes the weekly grid and switching back restores it

**Automatable**: Yes
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604 with the resting criteria (United States / USD / Standard). No save is involved — a criteria selection is a view switch, never an edit.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With the tab loaded, note the selected year, region and week 1's ticks | The newest year and `Atlanta` are selected; week 1 carries its saved classification |
| 2 | In the bar above the tabs, change Country to `Canada` | The page stays on this tab; Currency follows the country on its own, reading `CAD` |
| 3 | Read the tab's Region selector | It now rests on a Canadian region — `Atlanta` is no longer the selection: the whole tab re-scoped to the new country |
| 4 | Read the bar's Save | Still disabled — choosing a country is navigation, not a pending change |
| 5 | Change Country back to `United States` | Currency returns to `USD`; the tab returns to the newest year and `Atlanta`, showing 52 week rows with week 1's ticks exactly as noted in step 1 |

**Notes**: Contracts measured live 2026-08-27 (`dsm-critbar-rwp-probe.json`): the tab held focus through both country changes, Currency cascaded `USD -> CAD -> USD` with the country, the Canadian context rested on `Central GTHA` with an empty year selector (no years configured for Canada on this server — the case therefore asserts the region moved off `Atlanta` rather than pinning Canadian data), and the United States state returned identically. The bar's Save stayed disabled throughout, proving the selection carries no dirty state.

---

## TC-DSM-RWP-026: The threshold saves from this tab, independent of the tab's own Save

**Automatable**: Yes
**Preconditions**: The Region Weekly Peaks tab is open and finished loading for office 1604. Data changes on office 1604 are authorized; the case restores the prior threshold through a verified save before it ends.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | With the tab loaded, note the threshold, then type a different in-range value and leave the field | The bar's Save enables |
| 2 | Read the tab's own Save inside the panel | Still disabled — an edit in the bar never marks the weekly grid dirty: the two Saves are independent |
| 3 | Switch to Company Matrix and back to Region Weekly Peaks | No warning appears, the typed value survives the round trip, and the bar's Save is still enabled |
| 4 | Click the bar's Save while this tab is open, then reload the page | The typed value is what the page shows after reload — the save committed from this tab |
| 5 | Restore the noted threshold with another save and reload | The original value is back |

**Notes**: Contracts measured live 2026-08-27 (`dsm-critbar-rwp-probe.json`): the edit enabled only the bar's Save (the panel's stayed disabled), the pending value survived a tab round trip with no dialog, and the save clicked from this tab reached the server (confirmed by reload, not by the click). The page rests on Company Matrix after any reload, so the post-save read happens there — the threshold is the same bar either way. Restore uses the same verified save-reload-read path the automation uses everywhere on this page.

---
