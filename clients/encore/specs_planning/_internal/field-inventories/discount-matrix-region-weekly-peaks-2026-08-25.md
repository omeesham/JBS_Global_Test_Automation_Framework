# Field Inventory — Discount Matrix: Region Weekly Peaks (RWP)

**Module**: discount-matrix-region-weekly-peaks
**Client**: encore
**MCP_Session_Date**: 2026-08-25
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Unattended catalog walk over the Region Weekly Peaks tab state with grep-over-disk snapshots; no visual/CSS assertion and no fresh-passkey need, so LR-038 v2 selects the CLI path.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-matrix
**Test_Entity**: Office 1604
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-2026-08-25.md
**Walk_Mode**: quick

Coverage_Ratio: 20/20 (100%) — the Region Weekly Peaks tab state: 11 shared-chrome controls (criteria bar + tab strip, dispositioned in full in the sibling criteria artifact) plus 9 controls unique to this tab. 24 cases authored (TC-DSM-RWP-001 … -024).
Completion_Record: reports/walk-coverage/dsm-rwp--tab-region-weekly-peaks.json (status=complete, elements=20)
Walk_State: module=discount-matrix-region-weekly-peaks walked=[resting,tab:region-weekly-peaks]
CrossCheck: clean — both A△B review-set elements in this state are classified (see Coverage Manifest notes)
jira_tickets: [NM-3530, NM-3485, NM-3475, NM-3441, NM-3440, NM-3435, NM-3391, NM-3294, NM-3293, NM-3275, NM-3256, NM-3253, NM-3238, NM-3234, NM-3232, NM-3230, NM-3229, NM-3062]
baselineScope: complete

> **Restructure note (2026-08-27)**: this artifact was split out of the module-wide
> `discount-matrix-2026-08-25.md`, which covered all three tabs in one file. Every other module in
> this client pairs one inventory per submodule (matching its test-case file), so the module-wide
> form was the outlier. Content, dates, denominators and dispositions are carried over unchanged
> from the 2026-08-25 walk; only the file boundary moved. The sibling artifacts are
> `discount-matrix-criteria-2026-08-25.md` and
> `discount-matrix-location-activation-2026-08-25.md`.

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-matrix` — single route; all three sub-tabs share it.
  - **Region Weekly Peaks** — activated by `role=tab, name="Region Weekly Peaks"` (`tab:region-weekly-peaks`).
  - The criteria bar above the tab and the tab strip itself are the 11 shared-chrome controls; their full field rows live in `discount-matrix-criteria-2026-08-25.md`.

## Live-state caveat

| Field | Live (2026-08-25) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Select Year | `2027` | *(an earlier entry in the walk artifact recorded it **empty**)* | Unhydrated-snapshot read; corrected in the walk artifact 2026-08-25. Hydration on this surface finishes at t=91–100s. |
| Region | `Atlanta` | *(an earlier entry recorded it **empty**)* | Same cause, same correction. |
| Add Year / Export / Import | **enabled at rest** | *(the morning walk recorded all toolbar buttons **disabled**)* | **CORRECTED 2026-08-25 evening.** The all-disabled read was taken inside the ~40s loading window; once the tab loads, the three data actions are enabled. Cancel and Save remain genuinely disabled until the grid is dirty. |
| Year list | `2027`, `2026`, `2025` at the walk | *(grows over time)* | Each full suite run creates the next year, so the list grows. The three walked years are the fixed tail; the newest year is whatever was last created, and the tab rests on it. |

## Field Inventory

### Region Weekly Peaks (RWP)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Select Year | `(none) — use id="region-weekly-peaks-year"` | Dropdown / combobox (Radix) | newest configured year (`2027` at the walk) | 3 options at the walk: `2027`, `2026`, `2025` — the list grows as years are created | enabled at rest | Year + Region together gate the whole toolbar | Stable `id` — materially better than the criteria bar's nameless comboboxes. |
| Region | `(none) — use id="region-weekly-peaks-region"` | Dropdown / combobox (Radix) | `Atlanta` | 28 options (full list in the walk artifact) | enabled at rest | see above | `LA / AL` is present — the exact region named in NM-3293. **Probed 2026-08-26**: it returns the full classified year (52 rows / 156 boxes / Count: 52 — dsm-rwp-laal-probe.json); pinned by TC-DSM-RWP-020. |
| Week peak flags | `(none) — use role="checkbox"` | Checkbox (native + Radix) | exactly one checked per row (2026-08-19 evidence) | not probed (QUICK depth) | enabled once data loads | Non-Peak / Standard / Peak are one app-enforced choice per row — **confirmed 2026-08-25** (RWP MD MCP rows 13–14) | The one element the taxonomy resolved uniquely from DOM signals. 156 checkboxes = 52 weeks × 3 columns. Live-probed 2026-08-25: ticking a sibling clears the row's current tick, and a ticked box CAN be cleared (leaving zero ticks) — NM-3238 not reproducible; uncheck case authored as TC-DSM-RWP-014. |
| Add Year | `(none) — use text content` | *(action — not one of the 13 field types)* | n/a | n/a | **enabled at rest (loaded)** — the earlier "disabled" was the ~40s loading window (RWP MD MCP rows 6→18, corrected 2026-08-25 evening) | Year + Region | Launcher, DRIVEN 2026-08-26 (owner-authorized mutation): opens the `Create Year` window — controls disabled ~40s while it loads (NM-3074), offers only unconfigured years (newest+1 first), `Initialize with previous year` ON by default, create ~59s, new year lands as a full copy and becomes the resting year. covered-by-TC: TC-DSM-RWP-022 (RWP MD MCP rows 24–25; evidence reports/walk-coverage/dsm-rwp-io-mutating-probe.json). NM-3234 (enabled with no Year/Region) is **unreachable on a normal open** — a loaded tab always has Year + Region selected (RWP MD MCP row 12); do not re-file. |
| Export | `(none) — use text content` | *(action — not one of the 13 field types)* | n/a | n/a | **enabled at rest (loaded)** — same loading-window correction as Add Year | Year + Region | io control, DRIVEN 2026-08-26: direct download, no window — `RegionWeeklyPeakExport_<date, time>.xlsx`, ~8.6 KB, one digit row per region for the whole year. covered-by-TC: TC-DSM-RWP-023 (RWP MD MCP row 26). |
| Import | `(none) — use text content` | *(action — not one of the 13 field types)* | n/a | n/a | **enabled at rest (loaded)** — same loading-window correction as Add Year | Year + Region | io control, DRIVEN 2026-08-26 (owner-authorized mutation): native single-file chooser, no window; the workbook auto-applies to the grid and auto-persists server-side with NO Save click (reload-verified). **File-name sensitive** — an upload that does not carry the workbook extension is silently ignored, so a downloaded file must be saved under a proper name before being fed back. covered-by-TC: TC-DSM-RWP-024 (RWP MD MCP rows 27–28; evidence reports/walk-coverage/dsm-rwp-io-mutating-probe.json + dsm-rwp-2029-import-split-probe.json). |
| Cancel (RWP) | `(none) — use text content` | *(action — not one of the 13 field types)* | n/a | n/a | **disabled at rest** | dirty state | `affordance: none` at rest. Probed 2026-08-26: Cancel after a dirty tick reverts the tick, closes the toolbar with no dialog, and a reload proves the server untouched (dsm-rwp-cancel-revert-probe.json); covered by TC-DSM-RWP-021. |
| Save (RWP) | `(none) — use text content` | *(action — not one of the 13 field types)* | n/a | n/a | **disabled at rest** | dirty state | `affordance: none` at rest. The save rides a page-route sync request that can land up to ~30s after the click; persistence is proven by reload-and-read, never by the button disabling. |

## Labels + Section Names

- **Criteria bar (all tabs)**: "Discount Matrix" · "Country" · "Currency" · "Business Tier" · "GAV Discount Threshold" · "Save"
- **Tab strip**: "Company Matrix" · "Region Weekly Peaks" · "Location Activation"
- **Region Weekly Peaks**: "Select Year" · "Region" · "Add Year" · "Export" · "Import" · "Cancel" · "Save" — grid headers "Week" · "Start Date" · "Non-Peak" · "Standard" · "Peak" — footer "Count: 52"

## Save-cycle observations

### Save button behavior
This tab carries its own Save, independent of the criteria bar's. It is **disabled at rest** and enables on a grid edit. No Save was pressed during the walk itself; the authored cases drive it, and the commit is proven by reloading and reading the classification back.

### Save dialog
**Not observed** during the walk. No save was executed, so no confirmation dialog was reached. *(Established later by the authored cases: the grid save commits without a confirmation dialog.)*

### Post-save toast
**Not observed.** Same reason.

### Dirty-state behavior
**Not observed during the walk**; established by the 2026-08-26 probe: ticking a different class in a row enables Cancel and Save, Cancel restores the original tick and re-disables both, and no dialog appears at any step (dsm-rwp-cancel-revert-probe.json). The app-wide Angular save/dirty trap — Save disables optimistically on click while the dirty flag persists — applies here: the grid's own pending-changes flag is the truthful commit signal, not the button state.

## Observations

### Bugs / Defects
none — no defect was confirmed on this tab during the walk or the same-day probes.

Two candidate signals from the walk resolved without filing:

- NM-3234 (`Add Year` enabled with no Year/Region selected) — the at-rest "disabled" read was the loading window (corrected by RWP MD MCP row 18: Add Year is **enabled** at rest); the ticket's no-selection state is unreachable on a normal open because a loaded tab always has Year + Region selected (MCP row 12). Not reproducible; do not re-file.
- NM-3238 (a checked peak flag could not be unchecked) — resolved by live probe 2026-08-25 (RWP MD MCP row 14): clicking the ticked box cleared it. Not reproducible; the uncheck behaviour is covered by TC-DSM-RWP-014.

### Suggestions / Improvements
- ~~Confirm whether Non-Peak / Standard / Peak mutual exclusivity is the intended model before an uncheck case is authored.~~ **Resolved 2026-08-25**: mutual exclusivity is app-enforced and unchecking is allowed (RWP MD MCP rows 13–14); TC-DSM-RWP-014 authored.
- The import is slow enough to need a multi-minute budget in any automated case (tracked as NM-3074 on the app side).
- `waitReadyContent` in the enumerator is hardcoded to the Service Charge History markers (`Modified By` plus a `tbody` row). Any future module that sets `contentGate: true` will wait for a header that never renders and fail as a timeout that reads like application slowness. It should take its markers from the branch config.

## LR-029 missing-testid report

Every control below was verified against live DOM by the enumerator on 2026-08-25, not from a static grep.

| Control | Surface | Has testid | Next-best stable anchor |
|---|---|---|---|
| Select Year / Region | RWP | no | `id="region-weekly-peaks-year"` / `id="region-weekly-peaks-region"` |
| Add Year / Export / Import / Cancel / Save | RWP | no | text content, scoped to the RWP panel |
| Week peak flags | RWP | no | `role="checkbox"`, scoped to the week row |

**Zero `data-testid` attributes exist anywhere on this module.** The two RWP dropdowns carry stable Radix `id`s — the best anchors in the module; the toolbar buttons and grid checkboxes have none.

## Staleness signal

- **Last verified**: 2026-08-25
- **Fresh-until**: 2026-09-08
- **Stale-after**: 2026-09-24
- **Refresh triggers**: the Region option list changes from 28 entries · the week grid stops rendering exactly one tick per row · the import stops auto-persisting without a Save click, or its file-name sensitivity changes · the Create Year window stops defaulting `Initialize with previous year` to ON · hydration timing shifts such that the skeleton census no longer reaches zero within 180s

## Coverage Manifest (machine-enumerated)

Machine denominator: **20** — the Region Weekly Peaks tab state. Provenance: `reports/walk-coverage/dsm-rwp--tab-region-weekly-peaks.json` (20).
Composition: 11 shared chrome + 9 RWP-unique.

All 20 rows below are dispositioned. **Coverage_Ratio: 20/20.**

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `struct:button\|trigger-button\|skip/div/div/div/div/div` | button | 2026-08-25 | covered-by-TC: TC-DSM-CRT-014 |
| `struct:button\|More information\|div/div/div/div/div/div` | button | 2026-08-25 | covered-by-TC: TC-DSM-CRT-013 |
| `struct:combobox\|United States\|div/div/div/div/div/div` | combobox | 2026-08-25 | covered-by-TC: TC-DSM-CRT-002 |
| `struct:combobox\|USD\|div/div/div/div/div/div` | combobox | 2026-08-25 | covered-by-TC: TC-DSM-CRT-003 |
| `struct:combobox\|Standard\|div/div/div/div/div/div` | combobox | 2026-08-25 | covered-by-TC: TC-DSM-CRT-004 |
| `name:gavDiscountThreshold\|input` | input | 2026-08-25 | covered-by-TC: TC-DSM-CRT-011 |
| `struct:button\|Save\|div/div/div/div/div/div` *(A△B review)* | button | 2026-08-25 | covered-by-TC: TC-DSM-CRT-005 |
| `struct:tablist\|Company MatrixRegion Weekly PeaksLocatio\|…` | tablist | 2026-08-25 | out-of-scope: not-interactive — structural container only; the three tab triggers it holds carry the behaviour and are dispositioned in the criteria artifact |
| `id:radix-_r_10_-trigger-company-matrix` | tab | 2026-08-25 | affordance-probed: affordance: navigation → Company Matrix panel · provenance: live · evidence: reports/walk-coverage/dsm-crt-skelgate.json (2026-08-25, base_state.atRest=[Company Matrix]) |
| `id:radix-_r_10_-trigger-region-weekly` | tab | 2026-08-25 | affordance-probed: affordance: navigation → Region Weekly Peaks panel · provenance: live · evidence: reports/walk-coverage/dsm-rwp--tab-region-weekly-peaks.json (2026-08-25, branches[0].ok=true addedKeys=20) |
| `id:radix-_r_10_-trigger-location-activation` | tab | 2026-08-25 | affordance-probed: affordance: navigation → Location Activation panel · provenance: live · evidence: reports/walk-coverage/dsm-loa--tab-location-activation.json (2026-08-25, branches[0].ok=true addedKeys=20) |
| `id:radix-_r_10_-content-region-weekly` | tabpanel | 2026-08-25 | out-of-scope: not-interactive — structural container; its nine controls are enumerated and dispositioned individually |
| `id:region-weekly-peaks-year` | combobox | 2026-08-25 | covered-by-TC: TC-DSM-RWP-002 |
| `id:region-weekly-peaks-region` | combobox | 2026-08-25 | covered-by-TC: TC-DSM-RWP-003 |
| `struct:button\|Add Year\|…content-region-weekly…` | button | 2026-08-25 | covered-by-TC: TC-DSM-RWP-009, TC-DSM-RWP-022 (driven 2026-08-26) |
| `struct:button\|Export\|…content-region-weekly…` | button | 2026-08-25 | covered-by-TC: TC-DSM-RWP-009, TC-DSM-RWP-023 (driven 2026-08-26) |
| `struct:button\|Import\|…content-region-weekly…` | button | 2026-08-25 | covered-by-TC: TC-DSM-RWP-009, TC-DSM-RWP-024 (driven 2026-08-26) |
| `struct:button\|Cancel\|…content-region-weekly…` *(A△B review)* | button | 2026-08-25 | covered-by-TC: TC-DSM-RWP-010, TC-DSM-RWP-021 |
| `struct:button\|Save\|…content-region-weekly…` *(A△B review)* | button | 2026-08-25 | covered-by-TC: TC-DSM-RWP-010 |
| `struct:checkbox\|\|div/div/table/tbody/tr/td` | checkbox | 2026-08-25 | covered-by-TC: TC-DSM-RWP-007 |

### A△B review-set classification (CrossCheck)

Two of the module's six symmetric-difference elements belong to this state. Both are classified, so `CrossCheck: clean`:

| element | lens | classification |
|---|---|---|
| `Cancel` (RWP panel) | A∖B | Real control, `disabled` at rest — the A lens under-reports disabled controls. Kept in the denominator. |
| `Save` (RWP panel) | A∖B | Same. Kept. |

### §3 surface families (LR-065)

| surface | families |
|---|---|
| RWP week grid | `behavior-cases: render-state, empty-vol, persistence` · `out-of-scope: pagination=the grid renders all 52 weeks in one view and no pager control was enumerated` · `out-of-scope: sorting=no sortable column affordance was enumerated on this grid` · `out-of-scope: result-fidelity=rows are generated from the Year selection rather than returned by a query whose results could diverge` · `out-of-scope: combination=Year and Region are the only two inputs and neither filters the row set` |

**Render-state is the load-bearing family.** The grid's row count does not distinguish loading from empty — it renders 52 placeholder rows with `Count: 0` for ~40s after the tab click. Any test on this surface must gate on the skeleton census reaching zero, never on row count.

### Opener frontier (state-graph exhaustion)

- **In-module openers — RESOLVED 2026-08-26**: the owner authorized data mutation on offices 1604/1101, and all three io openers on this tab are now driven end-to-end — the **Add Year dialog** by TC-DSM-RWP-022 (real year created), the **Export download** by TC-DSM-RWP-023 (real file downloaded), the **Import file chooser** by TC-DSM-RWP-024 (real workbook imported and persistence-verified). Measured contracts in RWP MD MCP rows 24–28; machine evidence `reports/walk-coverage/dsm-rwp-io-mutating-probe.json`.
- **Deferred**: `rwp-create-year-variants` — the Create Year window's non-default paths (unticking `Initialize with previous year`, picking a non-adjacent year) are DEEP-tier; QUICK drives the default path only.
