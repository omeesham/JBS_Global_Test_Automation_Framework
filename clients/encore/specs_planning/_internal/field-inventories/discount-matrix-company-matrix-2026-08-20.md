**Module**: discount-matrix-company-matrix
**Client**: encore
**MCP_Session_Date**: 2026-08-20
**MCP_Session_Tool**: Playwright CLI (playwright-cli + standalone node scripts; LR-038 v2 default — Playwright MCP was NOT used)
**MCP_Tool_Reason**: Unattended multi-run enumeration and probe battery against a complex read-only grid plus dialogs; token-efficient grep-over-disk on machine-emitted manifests and trace artifacts. No visual or layout work required.
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-matrix
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Walk_Mode**: quick
**Walk_State**: office=1604 module=discount-matrix-company-matrix walked=[resting,dialog:add-tier,dialog:edit-tier]
**Completion_Record**: reports/walk-coverage/1604-discount-matrix.json (status=complete, elements=21)
**Coverage_Ratio**: 21/21 (100%)
**CrossCheck**: clean

---

# Field Inventory — Discount Matrix › Company Matrix tab (Office 1604)

This file covers the **Company Matrix tab** of the Discount Matrix page. The page hosts three tabs:
Company Matrix (active by default), Region Weekly Peaks, and Location Activation. This inventory
covers the Company Matrix tab only. Sources: machine enumeration `reports/walk-coverage/1604-discount-matrix.json`
(denominator 21, dated 2026-08-20), walk evidence
`clients/encore/specs_planning/_internal/walk-evidence/discount-matrix-company-matrix-2026-08-19.md`
(walkDate 2026-08-19, sections §1–§11 and regression-bank), and selector file
`clients/encore/src/selectors/discount-matrix/company-matrix.ts` (dated 2026-08-19/20).

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-matrix`

Tabs observed (Radix tablist, auto-generated ids — select by `[role="tab"]` + visible text only):

- `Company Matrix` (active by default)
- `Region Weekly Peaks`
- `Location Activation`

Tab switching does not change the URL. The tab list container resolves via `[role="tablist"]`.
Radix-generated tab ids (e.g. `id:radix-_r_10_-trigger-company-matrix`) change between renders
and must never be used as selector anchors.

---

## Live-state caveat

Criteria bar values recorded on 2026-08-19 (walk evidence §"Criteria bar as rendered"):

| Field | Live (2026-08-19) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Country | `United States` | UNVERIFIED — REQUIREMENTS.md not consulted | Not applicable |
| Currency | `USD` | UNVERIFIED — REQUIREMENTS.md not consulted | Not applicable |
| Business Tier | `Standard` | UNVERIFIED — REQUIREMENTS.md not consulted | Not applicable |
| GAV Discount Threshold | `15%` | UNVERIFIED — REQUIREMENTS.md not consulted | Not applicable |

No structural drift was observed between the 2026-08-19 walk and the 2026-08-20 enumeration run.

---

## Field Inventory

**Machine denominator: 21 entries.** Source: `reports/walk-coverage/1604-discount-matrix.json`,
field `"denominator": 21`, `"rawBeforeArchetypeCollapse": 21`. Branches walked:
`resting`, `expand-1`, `dialog:add-tier`, `dialog:edit-tier`. Branches `ok: true` for both dialog
branches. All 21 entries are accounted for below.

**D14 gap (portal-scan limitation):** The Edit Tier dialog's 21 percentage inputs collapse into a
single `role:input:` entry carrying no `occurrences` field, contributing 1 to the denominator
rather than 21. This is a limitation of the enumerator's portal scan (`enumerate-page.mjs`) — it
opens the dialog, collapses every input into one `role:`-keyed entry with no ancestor path, and
never reaches the type classifier. Filed as D14 in
`plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md`. Behaviour coverage of all 21 inputs is
present (walk evidence §"Edit Tier dialog" and regression-bank), but the enumerator cannot
individually key them. The two entries recorded as `type: null, resolved: false` below are:
(1) `role:input:` — a `role:`-keyed entry with no CSS ancestor path, making selector derivation
impossible (`evidence: "unresolvable: role: key has no resolvable CSS selector from ancestor path"`);
(2) `name:gavDiscountThreshold|input` — the type probe ran but returned no evidence string
(`evidence: ""`), meaning the probe ran after the dialog was already closed or the classifier
returned nothing. Neither type was resolved; both are recorded as measured.

### App-shell / navigation controls (out of scope)

These entries appear in the machine enuminator output because the enumerator scans the full DOM.
They are outside the Discount Matrix module surface.

| element-key | role | disposition |
|---|---|---|
| `struct:button|trigger-button|skip/div/div/div/div/div` | button | outside-module — global application-shell breadcrumb / skip-navigation trigger, outside the Discount Matrix surface under test |

### Criteria bar (shared above all tabs)

All three comboboxes use Radix UI (`tag=BUTTON; role=combobox`). None carry a `data-testid`.
Selectors are anchored by adjacent `<label>` siblings (source: `company-matrix.ts` comments,
measured 2026-08-19).

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Country | `(none) — use label:text-is("Country:") + [role="combobox"]` | combobox (Radix) | `United States` (measured 2026-08-19) | (none observed) | Always enabled | Changing reloads the grid via POST to the page route; 9 rows → 2 on `Mexico`; grid may offer only 1 option if options load asynchronously — timing-sensitive (walk evidence §8) | No `data-testid`; type `null, resolved: false` — `tag=BUTTON;type=button;role=combobox; ambiguous_candidates=Dropdown / combobox (Radix), Cascading dropdown` |
| Currency | `(none) — use label:text-is("Currency:") + [role="combobox"]` | combobox (Radix) | `USD` (measured 2026-08-19) | (none observed) | Always enabled | Changing reloads the grid; `CAD` empties it (9 rows → 0), triggering the empty-state placeholder row | No `data-testid`; type `null, resolved: false` — same ambiguous evidence as Country |
| Business Tier | `(none) — use label:text-is("Business Tier:") + [role="combobox"]` | combobox (Radix) | `Standard` (measured 2026-08-19) | (none observed) | Always enabled | Changing reloads the grid; `Standard` → `Las Vegas` returned byte-identical rows (walk evidence §4) | No `data-testid`; type `null, resolved: false` — same ambiguous evidence |
| GAV Discount Threshold | `(none) — use input[name="gavDiscountThreshold"]` | text input (`inputmode="decimal"`) | `15%` (measured 2026-08-19) | Whole numbers: `%` appended (`14`→`14%`). Decimals below 1 ×100 (`0.2`→`20%`). Decimals above 1 keep fraction (`12.5`→`12.5%`, single-source). Values >100: `aria-invalid=true`, Update disabled, **no visible message** (DEFECT-1). Non-numeric (`abc`): silently refused if typed over selection; resolves to `0%` if field cleared first. Empty → `0%`. | Disabled on page load; enables on first keystroke into this field (before blur). Disables optimistically on Save click. | Drives Save — Save button state tracks this field only | No `data-testid`; `name="gavDiscountThreshold"` is the stable selector anchor. `type="text"`, `inputmode="decimal"`, placeholder `0%`. Selector: `input[name="gavDiscountThreshold"]`. Use `pressSequentially` with keystroke delay — `fill()` corrupts this field (renders `15.2%` for input `20%`, walk evidence §"GAV Discount Threshold" tooling trap). |

### Page-level toolbar

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Save | `(none) — use button:text-is("Save")` | button | n/a | n/a | Disabled on page load; enabled on first keystroke into GAV Discount Threshold. Disables optimistically on Save click before server response | Tracks GAV Discount Threshold dirty state | No `data-testid`. Not inside `[role="tabpanel"]` — lives in `data-slot=sidebar-inset` header (measured 2026-08-19). Save discriminator: POST to page route with non-empty body `[{"countryId":…,"gavThreshold":…}]` (not `[]`). Form reports clean ~1.5 s after click. |
| More information | `(none) — use text content` | button | n/a | n/a | Always enabled | (none) | affordance: UNVERIFIED — button was not opened during walks; its launcher content is unknown |

### Tab navigation controls

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Tab list container | `(none) — use [role="tablist"]` | tablist | n/a | n/a | Always visible | (none) | affordance: container — select tabs by `[role="tab"]:has-text(…)` only; Radix auto-ids change per render |
| Company Matrix tab | `(none) — use [role="tab"]:has-text("Company Matrix")` | tab | Active by default | n/a | Always enabled | (none) | affordance: activates Company Matrix tabpanel |
| Region Weekly Peaks tab | `(none) — use [role="tab"]:has-text("Region Weekly Peaks")` | tab | Inactive | n/a | Always enabled | (none) | affordance: activates Region Weekly Peaks tabpanel |
| Location Activation tab | `(none) — use [role="tab"]:has-text("Location Activation")` | tab | Inactive | n/a | Always enabled | (none) | affordance: activates Location Activation tabpanel |
| Company Matrix tabpanel | `(none) — use [role="tabpanel"]:has(button:text-is("Add Tier"))` | tabpanel | n/a | n/a | Visible when Company Matrix tab active | (none) | affordance: container for grid + toolbar. Anchored by `Add Tier` button text to survive Radix id churn |

### Company Matrix grid — toolbar

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Add Tier button | `(none) — use [role="tabpanel"]:has(button:text-is("Add Tier")) button:text-is("Add Tier")` | button | n/a | n/a | Always enabled in resting state (disabled only inside Add Tier dialog context per `role:button:Add Tier` entry status `UNREACHABLE`) | (none) | affordance: launcher → "Adding Tier" dialog. Opens Add Tier dialog. |
| Export button | `(none) — use [role="tabpanel"]:has(button:text-is("Add Tier")) button:text-is("Export")` | button | n/a | n/a | Always enabled | Country, Currency, Business Tier | affordance: triggers POST to `/navigator/api/discount/company-matrix/export`; downloads `DiscountMatrix-{country}-{currency}-{tier}.xlsx`. Confirmed POST→200 on two independent clicks (NM-3062 FIXED-CONFIRMED, NM-3255 FIXED-CONFIRMED, walk evidence §Export). |
| Import button | `(none) — use [role="tabpanel"]:has(button:text-is("Add Tier")) button:text-is("Import")` | button | n/a | n/a | Always enabled | (none) | affordance: UNVERIFIED — import flow beyond button presence not measured |

### Company Matrix grid — rows (read-only display surface)

The grid is entirely read-only in the DOM. `tbody input` = 0, `tbody input[type=number]` = 0,
`tbody [role="spinbutton"]` = 0 (measured 2026-08-19). All 189 percentage values (9 rows × 21 columns)
are static `td` text. Editing happens in the Edit Tier dialog only.

Grid loads with 6 skeleton placeholder rows (`div[data-slot="skeleton"]`). Ready gate must confirm
rows present **and** zero skeletons — row-count alone passes vacuously in ~12 ms (walk evidence §1,
§"automation-run corrections").

9 tier rows measured on 1604/Standard/USD/United States (2026-08-19):
`0 - 1500` · `1501 - 3000` · `3001 - 5000` · `5001 - 15000` · `15001 - 25000` · `25001 - 50000` ·
`50001 - 75000` · `75001 - 100000` · `100001 - 20000000`

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Delete button (per row) | `(none) — use button[title="Delete"]` scoped to row | button | n/a | n/a | Always enabled per row | (none) | affordance: UNVERIFIED — delete flow not exercised in walks (integrity-preserving). `occurrences: 9` in JSON. Selector anchored by `title="Delete"` (first action button per row). |
| Edit button (per row) | `(none) — use button[title="Edit"]` scoped to row | button | n/a | n/a | Always enabled per row | (none) | affordance: launcher → "Editing {tierRange}" dialog. Opens Edit Tier dialog. `occurrences: 9` in JSON. Second action button per row. |

### Edit Tier dialog

Dialog title renders verbatim as `Editing {tierRange}` (e.g. `Editing 0 - 1500`). The 21 percentage
inputs have **no stable id and no data-testid** — positional within the dialog only. Selector
`[role="dialog"]:has-text("Editing") input[inputmode="decimal"]` resolves all 21.

**D14 gap applies here**: the machine enumerator collapses all 21 inputs into one `role:input:` entry
(no `occurrences`, no ancestor path, type `null, resolved: false`). This is an enumerator limitation,
not missing coverage — all 21 are reachable via `DLG_EDIT_TIER_INPUTS.nth(index)`.

**Input 0 formatting defect (OBS-2, CONFIRMED):** Input index 0 (Non-Peak `0-15`) opens showing
raw `0.17`; inputs 1–20 open `%`-formatted (`17%`, `20%`, …). Confirmed across 11 fresh dialog
opens, three runs, three methods (walk evidence §"Two-run reconciliation" + §DEFECT-2).

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| 21 percentage inputs (positional) | `(none) — use DLG_EDIT_TIER_INPUTS.nth(index)` | text input (`inputmode="decimal"`, `type="text"`, `placeholder="0"`) | Existing tier percentages from grid (e.g. `17%`; input 0 opens as `0.17` — OBS-2 confirmed defect) | Whole numbers: `%` appended (`14`→`14%`). Decimals <1: ×100 (`0.14`→`14%`). Values >100: `aria-invalid=true`, Update disabled, **no visible message** (DEFECT-1, confirmed at two locations). Empty / non-numeric: resolves to `0%`, Update enabled — **not rejected** (walk evidence §6 automation corrections). Negative: keypress refused by input handler; value unchanged. | All 21 enabled when dialog open. No disabled inputs observed. | (none — all inputs are independent percentage fields) | No `data-testid` on any of the 21. Use `pressSequentially` with keystroke delay — `fill()` corrupts formatted numeric inputs on this app. Revenue Tier start/end fields are **absent** from this dialog. |
| Cancel button | `(none) — use [role="dialog"]:has-text("Editing") button:text-is("Cancel")` | button | n/a | n/a | Always enabled when dialog open | (none) | affordance: dismisses dialog without saving |
| Update button | `(none) — use [role="dialog"]:has-text("Editing") button:text-is("Update")` | button | n/a | n/a | Disabled when `aria-invalid=true` on any input; enabled when all inputs valid | Tracks validity of all 21 percentage inputs | affordance: commits percentage edits. `status: UNREACHABLE` on the machine entry (portal scan returned disabled state for both `role:button:Add Tier` and `role:button:Update`). |

### Add Tier dialog

Dialog title renders verbatim as `Adding Tier`.

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| End Tier input | `(none) — use #discount-matrix-tier-end` | numeric text input (`inputmode="numeric"`, `pattern="[0-9]*"`) | empty | Numeric only (pattern enforced). No Start Tier field — single-bound entry only. | Enabled when dialog open | (none) | Stable author-written id `discount-matrix-tier-end` (measured 2026-08-19). Not a Radix auto-id. No `data-testid`. |
| Cancel button | `(none) — use [role="dialog"]:has-text("Adding Tier") button:text-is("Cancel")` | button | n/a | n/a | Always enabled | (none) | affordance: dismisses dialog |
| Add Tier confirm button | `(none) — use [role="dialog"]:has-text("Adding Tier") button:text-is("Add Tier")` | button | n/a | n/a | Disabled on dialog open; enabled once valid value entered in End Tier input | Tracks End Tier input validity | affordance: creates the new tier row. `status: UNREACHABLE` on machine entry (portal scan sampled before value entered). |

---

## Coverage Manifest

Denominator: **21** entries. Source: `reports/walk-coverage/1604-discount-matrix.json`, field
`"denominator": 21`. All 21 accounted for below.

| element-key | role | machine-found | disposition |
|---|---|---|---|
| `struct:button|trigger-button|skip/div/div/div/div/div` | button | 2026-08-20 | out-of-scope: outside-module — global application-shell skip-navigation trigger, enumerated on other modules and not part of the Discount Matrix surface under test |
| `struct:button|More information|div/div/div/div/div/div` | button | 2026-08-20 | deferred-to-DEEP: criteria-bar-more-information-launcher (launcher present in every walked state but never opened, so its content is unknown; DEEP D15 owns opening it and recording the dialog contents) |
| `struct:combobox|United States|div/div/div/div/div/div` | combobox | 2026-08-20 | covered-by-TC: TC-DSM-CMX-002 — criteria bar Country field, re-keys the grid |
| `struct:combobox|USD|div/div/div/div/div/div` | combobox | 2026-08-20 | covered-by-TC: TC-DSM-CMX-003 — criteria bar Currency field, re-keys the grid |
| `struct:combobox|Standard|div/div/div/div/div/div` | combobox | 2026-08-20 | covered-by-TC: TC-DSM-CMX-004 — criteria bar Business Tier field, re-keys the grid |
| `struct:button|Save|div/div/div/div/div/div` | button | 2026-08-20 | covered-by-TC: page-level Save button — TC-DSM-CMX-005 and pending |
| `struct:tablist|Company MatrixRegion Weekly PeaksLocatio|div/div/div/div/div/div` | tablist | 2026-08-20 | read-only-verified: tab navigation container, present in every walked state; provenance: live; evidence: reports/walk-coverage/1604-discount-matrix.json |
| `id:radix-_r_10_-trigger-company-matrix` | tab | 2026-08-20 | covered-by-TC: TC-DSM-CMX-040 — clicked on the return leg of the tab round trip |
| `id:radix-_r_10_-trigger-region-weekly` | tab | 2026-08-20 | covered-by-TC: TC-DSM-CMX-040 — clicked on the outbound leg of the tab round trip |
| `id:radix-_r_10_-trigger-location-activation` | tab | 2026-08-20 | deferred-to-DEEP: id:radix-_r_10_-trigger-location-activation (never clicked by any authored case at quick tier; the panel it opens is a separate surface owned by SUBPLAN_DISCOUNT_MATRIX_LOCATION_ACTIVATION) |
| `id:radix-_r_10_-content-company-matrix` | tabpanel | 2026-08-20 | covered-by-TC: Company Matrix tab content panel — TC-DSM-CMX-001 and pending |
| `struct:button|Add Tier|div/div/div/radix-_r_10_-content-company-matrix/div/div` | button | 2026-08-20 | affordance-probed: launcher → "Adding Tier" dialog; provenance: live; evidence: reports/walk-coverage/1604-discount-matrix.json |
| `struct:button|Export|div/div/radix-_r_10_-content-company-matrix/div/div/div` | button | 2026-08-20 | covered-by-TC: TC-DSM-CMX-025, TC-DSM-CMX-026, TC-DSM-CMX-027, TC-DSM-CMX-028, TC-DSM-CMX-029 — FIXED-CONFIRMED for NM-3062 and NM-3255 |
| `struct:button|Import|div/div/radix-_r_10_-content-company-matrix/div/div/div` | button | 2026-08-20 | deferred-to-DEEP: struct:button|Import (Import is mutating by nature and was never exercised; DEEP D3 owns it once a safe office and fixture files are decided) |
| `struct:button|Delete|div/div/table/tbody/tr/td` | button | 2026-08-20 | deferred-to-DEEP: struct:button|Delete (Delete is destructive and was never exercised; DEEP D2 owns it once an explicit mutation decision and cleanup path exist) |
| `struct:button|Edit|div/div/table/tbody/tr/td` | button | 2026-08-20 | affordance-probed: launcher → "Editing {tierRange}" dialog; provenance: live; evidence: reports/walk-coverage/1604-discount-matrix.json |
| `role:input:` | input | 2026-08-20 | covered-by-TC: Edit Tier dialog percentage inputs (all 21) — D14 gap: enumerator collapses 21 inputs to 1 entry; TC-DSM-CMX-022 and pending Edit Tier cases cover all 21 individually |
| `role:button:Cancel` | button | 2026-08-20 | covered-by-TC: TC-DSM-CMX-024, TC-DSM-CMX-033 — Cancel discards pending edits in both dialogs |
| `role:button:Add Tier` | button | 2026-08-20 | covered-by-TC: TC-DSM-CMX-030, TC-DSM-CMX-031 — disabled-on-open and submit-time validation |
| `role:button:Update` | button | 2026-08-20 | covered-by-TC: TC-DSM-CMX-018 — out-of-range values disable Update |
| `name:gavDiscountThreshold|input` | input | 2026-08-20 | covered-by-TC: GAV Discount Threshold input — TC-DSM-CMX-005, TC-DSM-CMX-039 and pending |

---

## Labels + Section Names

**Company Matrix tab — section headings (top-down)**:

- "Non-Peak Booking Windows Days" (column group header, grid row 1)
- "Standard Booking Windows Days" (column group header, grid row 1)
- "Peak Booking Windows Days" (column group header, grid row 1)
- "Revenue Tier" (grid row 2, column 1 sub-header label)

Day-bucket sub-headers (7 per group, grid header row 2): `"0-15"`, `"16-30"`, `"31-60"`, `"61-90"`,
`"91-180"`, `"181-365"`, `"365 +"` (note space before `+` — compare with whitespace normalised,
not exact; export writes `365+` without the space).

**Note**: the rendered group headers are full phrases, not abbreviations. The export uses
`Non-Peak Booking Windows by Days` (with "by"), which differs from the grid rendering
`Non-Peak Booking Windows Days` (without "by") — do not use exact match across grid and export.

---

## Save-cycle observations

**Save button behavior**:

- Default state on fresh load: disabled
- Enables when: first keystroke into GAV Discount Threshold field (before blur), from any baseline value
- Disables when: clicked (optimistically, before server response); and approximately 1.5 s after click when the form reports clean (POST body `[{"countryId":…,"gavThreshold":…}]` settled)
- testid: `(none) — use button:text-is("Save")`

**Save dialog**:

No save dialog — save commits directly via POST to the page route. The save is the POST whose body
is not `[]` (non-empty payload discriminates it from ordinary data requests to the same URL).

**Post-save toast**:

UNVERIFIED — no toast was specifically measured during the save-cycle probe. The validation-message
sweep (`[aria-live],[class*="error"],[class*="Error"],[class*="invalid"],[role="alert"]`) returned
only `"Discount Matrix"` (the page title, a false positive) on one run and nothing on others.
A dedicated toast observation was not performed.

**Dirty-state behavior**:

- Tab switch with dirty GAV Discount Threshold: **no in-app prompt** — unsaved threshold value is
  preserved on tab switch (tab panel unmounts criteria bar? No — criteria bar is outside all tab
  panels and persists). Value survives tab switch, lost only on full page reload. (walk evidence §7)
- Full page unload with dirty form: browser native `beforeunload` guard fires (measured from trace).
- No `dlgSaveChanges` / `btnSaveChangesConfirm` dialog observed on this surface. LR-012 default
  assumption does not apply here — this is not a Location Settings tab.
- Grid-dirty path (after Edit Tier → Update): UNVERIFIED — NM-3256's repro asserts a prompt exists
  on the grid-dirty path but it was not tested; mutating the live grid is out of scope for this walk.

---

## Observations

### Bugs / Defects

| Bug ID | Field / Feature | Observed | Expected (per requirements) | Status |
|---|---|---|---|---|
| DEFECT-1 (not yet filed) | GAV Discount Threshold + Edit Tier dialog percentage inputs | Values >100 set `aria-invalid=true` and disable Save/Update with no visible message anywhere in `[aria-live],[class*=error],[class*=Error],[class*=invalid],[role=alert]` (22 elements checked) | User-visible explanation when input is rejected | Fileable — confirmed multi-run, clean method, blur-proven. Same defect at two field locations. |
| DEFECT-2 / OBS-2 (not yet filed) | Edit Tier dialog — input index 0 | Input 0 opens showing raw `0.17`; inputs 1–20 open `%`-formatted | All inputs should open in the same format | Fileable — confirmed 11 fresh opens across 3 runs, 3 methods |
| NM-3256 | GAV Discount Threshold dirty-state prompt | No in-app prompt on Export click or tab switch while threshold dirty; browser `beforeunload` fires on page unload | In-app prompt when navigating away with unsaved changes (per NM-3256 repro) | NOT-REPRODUCIBLE on header-dirty path; UNTESTED on grid-dirty path |

### Suggestions / Improvements

- The save discriminator (non-empty POST body) works correctly but the URL-based `waitForResponse` without body filtering caused an intermittent race condition (`TC-DSM-CMX-005`). Any consumer of the save flow must match on request body, not URL alone.
- Country dropdown options may load asynchronously — tests asserting option count should wait for options to stabilise before reading (walk evidence §8, open contradiction).

---

## Known gaps

- **More information button**: launcher content not opened in any walk — affordance unknown. A follow-up walk should open it to record dialog title and internals.
- **Import button flow**: beyond button presence, the import dialog and its field roster are unwalked. A follow-up walk should measure it.
- **Delete row flow**: delete was not exercised to preserve data integrity. The confirmation dialog (if any) and post-delete grid state are unknown.
- **Grid-dirty path (NM-3256)**: whether clicking Update in Edit Tier arms an in-app unsaved-changes prompt was not tested. The page-object ticket is the unlock (it needs to know whether Update writes to the server or only to local state before any mutation is safe).
- **Region Weekly Peaks and Location Activation tabs**: out of scope for this inventory. Separate field-inventory artifacts are required.
- **NM-3390 re-test with clean method**: the tie-breaker re-derived FIXED-CONFIRMED but only on a single clean-method run; no corroborating second clean run exists yet.

---

## Staleness signal

- **Last verified**: 2026-08-20
- **Fresh-until**: 2026-09-03
- **Stale-after**: 2026-09-19
- **Refresh triggers**: toolbar button labels or count change (Add Tier / Export / Import); criteria-bar dropdown values or option counts change; tier rows added or removed on office 1604; Edit Tier dialog input count deviates from 21; a confirmed Encore release touches the Discount Matrix module; NM-3256 grid-dirty prompt is confirmed or removed; D14 enumerator fix lands and re-run produces a per-field denominator
