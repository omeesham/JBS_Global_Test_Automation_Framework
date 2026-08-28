# Field Inventory — Discount Matrix: Location Activation (LOA)

**Module**: discount-matrix-location-activation
**Client**: encore
**MCP_Session_Date**: 2026-08-25
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Unattended catalog walk over the Location Activation tab state with grep-over-disk snapshots; no visual/CSS assertion and no fresh-passkey need, so LR-038 v2 selects the CLI path.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-matrix
**Test_Entity**: Office 1604
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-2026-08-25.md
**Walk_Mode**: quick

Coverage_Ratio: 20/20 (100%) — the Location Activation tab state: 11 shared-chrome controls (criteria bar + tab strip; their FIELD behaviour is dispositioned in the sibling criteria artifact, where the covering CRT cases drive them on the LANDING tab only — their interaction with THIS tab state is covered here: country listing swap + currency cascade by TC-DSM-LOA-012, bar save from this tab by TC-DSM-LOA-013, measured 2026-08-27 in `reports/walk-coverage/dsm-critbar-loa-probe.json`; Currency/Tier changed from this tab: deferred-to-DEEP: critbar-currency-tier-on-loa (same bar mechanics as Country, which the probe showed cascades Currency anyway)) plus 9 controls unique to this tab. 13 cases authored (TC-DSM-LOA-001 … -013).
Completion_Record: reports/walk-coverage/dsm-loa--tab-location-activation.json (status=complete, elements=20)
Walk_State: module=discount-matrix-location-activation walked=[resting,tab:location-activation]
CrossCheck: clean — both A△B review-set elements in this state are classified (see Coverage Manifest notes)
jira_tickets: [NM-3530, NM-3485, NM-3475, NM-3441, NM-3440, NM-3435, NM-3391, NM-3294, NM-3293, NM-3275, NM-3256, NM-3253, NM-3238, NM-3234, NM-3232, NM-3230, NM-3229, NM-3062]
baselineScope: complete

> **Restructure note (2026-08-27)**: this artifact was split out of the module-wide
> `discount-matrix-2026-08-25.md`, which covered all three tabs in one file. Every other module in
> this client pairs one inventory per submodule (matching its test-case file), so the module-wide
> form was the outlier. Content, dates, denominators and dispositions are carried over unchanged
> from the 2026-08-25 walk; only the file boundary moved. The sibling artifacts are
> `discount-matrix-criteria-2026-08-25.md` and
> `discount-matrix-region-weekly-peaks-2026-08-25.md`.

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-matrix` — single route; all three sub-tabs share it.
  - **Location Activation** — activated by `role=tab, name="Location Activation"` (`tab:location-activation`).
  - The criteria bar above the tab and the tab strip itself are the 11 shared-chrome controls; their full field rows live in `discount-matrix-criteria-2026-08-25.md`.
- Same route confirmed on office **1101** for the LOA emptiness check (N≥2 per LR-061-A).

## Live-state caveat

| Field | Live (2026-08-25) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Location Activation grid | `0 matching locations` *(loading-window read — rescinded)* | 2041 matching locations after the ~43s late load | **CORRECTED 2026-08-26.** The `0 matching locations` footer is the loading state, not the data state: both authorized offices carry 2041 rows once the late load lands (walk-evidence correction, same day). Both original zero-reads shared the same pre-settle wait, so N≥2 offered no protection. The `/encore-questions` escalation was withdrawn; NM-3253's "cloudapps-dev only" reading is falsified for viewing rows on e2e. |
| Search box | recorded `disabled` | enabled once the ~43s load lands | Same loading-window cause. The box is enabled well before it is *functional* — see the field row below. |
| Workflow Start Date (row 1101) | `08/15/2029` in the 17:0x reads, `08/16/2029` in the 17:30+ probes | *(no assertable default)* | Shared-environment data with an external writer active on this surface; neither the specs nor the probes type into date cells. Recorded so a future persistence case knows this cell is not stable ground. |

## Field Inventory

### Location Activation (LOA)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Search by location number or location name | `(none) — use placeholder text` | Plain text | empty | not probed (QUICK depth) | **enabled once the ~43s load lands** (2041 rows); the "disabled with 0 locations" read was the loading window — corrected 2026-08-26 | none observed | `tag=INPUT;type=text`. Function has a warm-up window: input typed during the first ~1.5–2 min after the tab paints is silently ignored; the same typing filters correctly afterwards (evidence reports/walk-coverage/dsm-loa-search-reverify2.json). ACCEPTED as loading behaviour by owner ruling 2026-08-26 — BUG-DSM-LOA-001 withdrawn; TC-DSM-LOA-010 now passes by retyping in bounded rounds until the warm-up ends. |
| Workflow Start Date (cell editor) | `(none) — use placeholder="Select date"` | Date / offset | per-row live dates (e.g. `08/15/2029` on row 1101; shared-environment data, drifts) | not probed (QUICK depth) | enabled on loaded rows (`disabled: false` per dsm-loa-affordance-probe.json firstRows) | pairs with Open calendar | `tag=INPUT;type=text` inside a `td`. Editing persists shared data — deferred to DEEP; QUICK records the affordance only. |
| Open calendar | `(none) — use aria-label="Open calendar"` | *(action — not one of the 13 field types)* | n/a | n/a | enabled on loaded rows | opens the date picker for the cell | `affordance: launcher → date-picker dialog (calendar grid; title not captured)` — **live-probed 2026-08-25**: click opens the dialog (dsm-loa-affordance-probe.json dateCellAfterClick.dialogOpen=true, gridCalendar=true), Escape closes without dirtying (LOA MD MCP row 20). Driving the editor is DEEP-tier. |
| Active — Yes | `(none) — use text content` | *(boolean render — LR-036)* | n/a | n/a | enabled on loaded rows; **driven** by TC-DSM-LOA-009 (label click → checkbox editor → value flip → Cancel discard; never saved) | pairs with No | **LR-036 answered for this table**: at rest the `Active` column is a `Yes`/`No` **label button** — not a Unicode tick, not an SVG lucide-check, not an empty cell; clicking swaps it to a checkbox editor. A reader helper written for the other formats would have been wrong. Covered by TC-DSM-LOA-009. |
| Active — No | `(none) — use text content` | *(boolean render — LR-036)* | n/a | n/a | enabled on loaded rows; **driven** by TC-DSM-LOA-009 (same flow) | pairs with Yes | See above. Covered by TC-DSM-LOA-009. |
| Resize column | `(none) — use aria-label="Resize column"` | *(action — not one of the 13 field types)* | n/a | n/a | enabled | none | One per grid header. `affordance: none` — column chrome. The header text itself is display-only: clicking it never reorders the listing (owner ruling 2026-08-26, working as designed; the legacy grid does not sort either). Pinned by TC-DSM-LOA-011. |
| Cancel (LOA) | `(none) — use text content` | *(action — not one of the 13 field types)* | n/a | n/a | **disabled** | dirty state | `affordance: none` at rest. |
| Save (LOA) | `(none) — use text content` | *(action — not one of the 13 field types)* | n/a | n/a | **disabled** | dirty state | `affordance: none` at rest. |

> **CORRECTED 2026-08-26 — the original caution was a loading-window artifact.** The grid loads
> **2041 matching locations** on both authorized offices once the ~43s late load lands; the earlier
> `0 matching locations` reads were taken before settle, and the row controls are real, operable
> controls — not placeholder templates. Established since: the Active Yes/No pair is driven end-to-end
> by TC-DSM-LOA-009 (edit mode, value flip, Cancel discard); the Open-calendar launcher opens its
> date-picker dialog (dsm-loa-affordance-probe.json); the search box honours input only after a
> ~2-min warm-up — accepted behaviour per the owner's 2026-08-26 ruling, BUG-DSM-LOA-001 withdrawn;
> the headers are display-only by design (owner ruling 2026-08-26 — BUG-DSM-LOA-002 withdrawn). The
> date-cell editor itself is deferred to DEEP — editing persists shared data. The `/encore-questions`
> escalation was withdrawn.

## Labels + Section Names

- **Criteria bar (all tabs)**: "Discount Matrix" · "Country" · "Currency" · "Business Tier" · "GAV Discount Threshold" · "Save"
- **Tab strip**: "Company Matrix" · "Region Weekly Peaks" · "Location Activation"
- **Location Activation**: "Search by location number or location name" · "Cancel" · "Save" — grid headers "Location" · "Workflow Start Date" · "Active" — footer "<n> matching locations" (`0 matching locations` while loading, `2041 matching locations` once loaded)

## Save-cycle observations

### Save button behavior
This tab carries its own Save, independent of the criteria bar's. It is **disabled at rest** and enables only once a row edit changes a value. Nothing in the authored cases saves on this tab — the Active-flag case discards through Cancel.

### Save dialog
**Not observed.** No save was executed on this tab during the walk or in the authored cases. Unknown, not absent.

### Post-save toast
**Not observed.** Same reason.

### Dirty-state behavior
Established by TC-DSM-LOA-009: clicking the `Active` label swaps it to a checkbox mirroring the current value — that alone is not a change and Save stays disabled; flipping the value enables both Cancel and Save; Cancel restores the label, the original value, and the closed toolbar, with no confirmation dialog at any step.

## Observations

### Bugs / Defects
Two defects were confirmed by the same-day post-walk probes and filed (the walk itself confirmed none); both were later withdrawn under same-day owner rulings — this section reflects the final state:

- **BUG-DSM-LOA-001 — WITHDRAWN** — the enabled LOA search box silently ignores input typed during the first ~1.5–2 min after the tab renders; it filters correctly after that window (restated 2026-08-26). The owner ruled the window accepted loading behaviour the same day; the report is withdrawn and TC-DSM-LOA-010 now passes against the steady-state contract.
- **BUG-DSM-LOA-002 — WITHDRAWN** — LOA grid columns are not sortable despite the NM-2221 scope wording; legacy does not sort either. The owner ruled it working as designed (2026-08-26 — sorting is not part of this grid's design); the report is withdrawn and TC-DSM-LOA-011 now passes against the display-only header contract.

### Suggestions / Improvements
- Recorded as a discussion item, not filed: an external writer (person or job) is active on this surface — row `1101 - Corporate Office Encore USA SGA`'s Workflow Start Date changed between two same-evening reads while neither the specs nor the probes typed into date cells and Save stayed disabled throughout. A future persistence case must not treat these cells as stable ground.

## LR-029 missing-testid report

Every control below was verified against live DOM by the enumerator on 2026-08-25, not from a static grep.

| Control | Surface | Has testid | Next-best stable anchor |
|---|---|---|---|
| Search box | LOA | no | placeholder text |
| Workflow Start Date / Open calendar | LOA | no | placeholder `Select date` / aria-label |
| Active Yes / No | LOA | no | text content, scoped to the cell |
| Resize column | LOA | no | `aria-label="Resize column"` |
| Cancel / Save | LOA | no | text content, scoped to the LOA panel |

**Zero `data-testid` attributes exist anywhere on this module.** Nothing on this tab has a non-structural anchor beyond placeholder text and aria-labels.

## Staleness signal

- **Last verified**: 2026-08-25
- **Fresh-until**: 2026-09-08
- **Stale-after**: 2026-09-24
- **Refresh triggers**: the search warm-up shortens or disappears (the accepted ~2-min window measured 2026-08-26 — re-walk the readiness contract) · the headers gain a sort affordance (display-only by design per the owner's 2026-08-26 ruling, BUG-DSM-LOA-002 withdrawn — a sort appearing would be a design change; re-walk the header contract) · the `Active` column stops rendering as a Yes/No label-button pair · the listing stops being country-scoped (identical count across offices) · hydration timing shifts such that the skeleton census no longer reaches zero within 180s

## Coverage Manifest (machine-enumerated)

Machine denominator: **20** — the Location Activation tab state. Provenance: `reports/walk-coverage/dsm-loa--tab-location-activation.json` (20).
Composition: 11 shared chrome + 9 LOA-unique.

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
| `struct:tablist\|Company MatrixRegion Weekly PeaksLocatio\|div/div/div/div/div/div` | tablist | 2026-08-25 | out-of-scope: not-interactive — structural container only; the three tab triggers it holds carry the behaviour and are dispositioned in the criteria artifact |
| `id:radix-_r_10_-trigger-company-matrix` | tab | 2026-08-25 | affordance-probed: affordance: navigation → Company Matrix panel · provenance: live · evidence: reports/walk-coverage/dsm-crt-skelgate.json (2026-08-25, base_state.atRest=[Company Matrix]) |
| `id:radix-_r_10_-trigger-region-weekly` | tab | 2026-08-25 | affordance-probed: affordance: navigation → Region Weekly Peaks panel · provenance: live · evidence: reports/walk-coverage/dsm-rwp--tab-region-weekly-peaks.json (2026-08-25, branches[0].ok=true addedKeys=20) |
| `id:radix-_r_10_-trigger-location-activation` | tab | 2026-08-25 | affordance-probed: affordance: navigation → Location Activation panel · provenance: live · evidence: reports/walk-coverage/dsm-loa--tab-location-activation.json (2026-08-25, branches[0].ok=true addedKeys=20) |
| `id:radix-_r_10_-content-location-activation` | tabpanel | 2026-08-25 | out-of-scope: not-interactive — structural container; its nine controls are enumerated and dispositioned individually |
| `struct:input\|Search by location number or location na\|div/radix-_r_10_-content-location-activation/div/div/div/div` | input | 2026-08-25 | covered-by-TC: TC-DSM-LOA-003, TC-DSM-LOA-010 |
| `struct:button\|Cancel\|div/div/radix-_r_10_-content-location-activation/div/div/div` *(A△B review)* | button | 2026-08-25 | covered-by-TC: TC-DSM-LOA-004, TC-DSM-LOA-009 |
| `struct:button\|Save\|div/div/radix-_r_10_-content-location-activation/div/div/div` *(A△B review)* | button | 2026-08-25 | covered-by-TC: TC-DSM-LOA-004 |
| `struct:button\|Resize column\|div/div/table/thead/tr/th` | button | 2026-08-25 | covered-by-TC: TC-DSM-LOA-007, TC-DSM-LOA-011 |
| `struct:input\|Select date\|td/div/div/div/div/div` | input | 2026-08-25 | deferred-to-DEEP: loa-workflow-start-date-cell-editor (persisting shared-data grid mutation; QUICK records the affordance only) |
| `struct:button\|Open calendar\|div/div/div/div/div/div` | button | 2026-08-25 | affordance-probed: affordance: launcher → date-picker dialog (calendar grid; title not captured) · provenance: live · evidence: reports/walk-coverage/dsm-loa-affordance-probe.json (2026-08-25, dateCellAfterClick.dialogOpen=true, gridCalendar=true) |
| `struct:button\|Yes\|div/table/tbody/tr/td/div` | button | 2026-08-25 | covered-by-TC: TC-DSM-LOA-009 |
| `struct:button\|No\|div/table/tbody/tr/td/div` | button | 2026-08-25 | covered-by-TC: TC-DSM-LOA-009 |

### A△B review-set classification (CrossCheck)

Two of the module's six symmetric-difference elements belong to this state. Both are classified, so `CrossCheck: clean`:

| element | lens | classification |
|---|---|---|
| `Cancel` (LOA panel) | A∖B | Real control, `disabled` at rest — the A lens under-reports disabled controls. Kept in the denominator. |
| `Save` (LOA panel) | A∖B | Same. Kept. |

### §3 surface families (LR-065)

| surface | families |
|---|---|
| LOA location grid | `behavior-cases: render-state, empty-vol, result-fidelity, sorting` *(result-fidelity via TC-DSM-LOA-010 — passing steady-state search since the owner accepted the ~2-min warm-up and BUG-DSM-LOA-001 was withdrawn, 2026-08-26; sorting via TC-DSM-LOA-011, passing against the display-only-by-design header contract — owner ruling 2026-08-26, BUG-DSM-LOA-002 withdrawn)* · `deferred-to-DEEP: loa-persistence-save-path (persistence family — persisting shared-data grid mutation; the dirty-and-discard half is covered at QUICK by TC-DSM-LOA-009)` · `out-of-scope: pagination=no pager control was enumerated — the grid renders its 2041 rows as a single virtualized scroll list` · `out-of-scope: combination=the only two result-shaping controls are the search (functional only after its accepted ~2-min warm-up — owner ruling 2026-08-26) and sorting (absent by design — owner ruling 2026-08-26), so no second working control exists to combine with` — *row corrected 2026-08-26: every prior reason cited the rescinded zero-locations loading-window reading; search half restated same day from "non-functional" to the dead-window finding* |

**Render-state is the load-bearing family.** The grid's row count does not distinguish loading from empty — it renders 12 placeholder rows against `0 matching locations` before its ~43s load lands 2041 rows. Any test on this surface must gate on the skeleton census reaching zero, never on row count.

### Opener frontier (state-graph exhaustion)

- **In-module openers**: the **Open-calendar launcher** is affordance-probed (dialog opens, Escape closes without dirtying); driving the date editor inside it is DEEP-tier and recorded as `deferred-to-DEEP: loa-workflow-start-date-cell-editor`. No other unopened opener exists on this tab.
