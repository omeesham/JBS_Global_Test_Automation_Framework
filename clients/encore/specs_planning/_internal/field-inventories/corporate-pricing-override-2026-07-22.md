# Field Inventory — Corporate Pricing › Product Group Override (coverage-closure 2026-07-22)

**Module**: corporate-override
**Client**: encore
**MCP_Session_Date**: 2026-07-22
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Coverage-closure artifact. Field content carried forward from corporate-pricing-override-2026-07-09.md (keystone NM-1472 re-walk). Oracle facts re-established 2026-07-22 via 6 live Playwright-driven worker walks across 2 vendors (see ORACLE-FACTS.md provenance table). Coverage Manifest reconciled 2026-07-23 to 148 slots after section-subtotal recount; the closure map still covers 67/67 gap slots.
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/4107/settings/corporate-pricing/pg-override
**Test_Entity**: Offices 4107 (Equipment), 1134 (Labor BVA), 9460 (Labor pagination), 1145 (currency filter), 1606 (Equipment baseline)
**Coverage_Ratio**: 148/148 (100%) of AGENT-derived case slots — ⚠ NOT the LR-062 machine denominator. `enumerate-page.mjs` ran 2026-07-22 and reports **504 elements at 0% dispositioned** (`reports/walk-coverage/4107-corporate-pricing-override.json`). See the PROVENANCE CAVEAT under `## Coverage Manifest`.
**Walk_State**: office=4107 currency=ALL tab=Equipment+Labor; office=1134 tab=Labor; office=9460 tab=Labor; office=1145 currency=USD+CAD+MXN; office=1606 tab=Equipment
**CrossCheck**: UNEARNED — the enumerator produced a 442-element A△B review set; none of it was ever classified, and the machine manifest still reads `CrossCheck: <pending>` (LR-062 condition 3). See the PROVENANCE CAVEAT under `## Coverage Manifest`.

---

## URL(s) visited

- **Product Group Override**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/<office>/settings/corporate-pricing/pg-override`
- Offices walked: 4107 (Equipment editable fields), 1134 (Labor BVA — 2 rows: PG 565, PG 893), 9460 (Labor pagination — 212 rows), 1145 (currency filter — 11 rows: 10 USD, 1 CAD, 0 MXN), 1606 (Equipment baseline — 7 rows).

Tabs observed:
- `Equipment` (active by default)
- `Labor` (click tab to activate; same 10-column layout, separate dataset)

---

## Live-state caveat

| Field | Live (2026-07-22) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Product-Group Picker | renders ONLY when a specific location AND a specific currency (not ALL) are selected | DOCX-absent | NM-1472 currency-gated |
| Override Price auto-activate | setting Override Price 0.00→50.00 auto-activates the row (Active false→true) | NM-1463 | Bidirectional coupling confirmed live |
| Max Discount validation | `<input type=number min=0 max=100>`, value >100 → `aria-invalid=true`, red border, Save disabled | NM-1932/1463 | Capped at 100 inclusive |
| `0.5` input | `0.5` in Max Discount → displays `50.00 %` (100× misread) | Expected `0.50 %` | APP BUG — confirmed on both tabs by 2 vendors |
| `1.2.3` input | `1.2.3` → `1.23` (Override Price) or `1.23 %` (Max Discount) | Expected: rejected | APP BUG — silent multi-dot corruption |
| `abc` input | `abc` blanks cell to `—`, Save stays ENABLED | Expected: rejected or no-op | APP BUG — non-numeric commits blank value |
| Error messages | `[role="alert"]` exists, textContent always empty on rejection | Expected: descriptive error | APP BUG — no error text ever rendered |
| Two editors | Clicking another cell mid-edit opens a second spinbutton (`visibleSpinbuttons: 2`) | Expected: first editor closes | APP BUG — concurrent editors |

---

## Field Inventory

### Override Grid — Editable Fields (Equipment + Labor, same structure)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Override Price | (none) — use `div[role="button"]` click → `[role="spinbutton"]` | number (spinbutton) | varies by PG (e.g. PG 4298: `152.00`) | min ≥ 0; no hard upper max; `1e5` = 100,000.00 accepted | always editable when row exists | editing inactive row auto-activates it (NM-1463) | per-field display: no `%` suffix |
| Max Discount % | (none) — use `div[role="button"]` click → `[role="spinbutton"]` | number (spinbutton) | varies by PG (e.g. PG 4298: `—` empty) | 0 ≤ value ≤ 100 inclusive; >100 rejected `aria-invalid` | always editable when row exists | (none) | per-field display: `%` suffix; `0.5` bug: displays `50.00 %` |
| Active | (none) — use `[role="checkbox"][aria-checked]` | checkbox | varies by PG | boolean toggle | always editable | toggle-then-revert = Save disabled (LR-009) | LR-036 4th boolean render |

### Override Grid — Read-Only Columns

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Location | (none) | text (read-only) | office number | (none) | always disabled | (none) | affordance: none |
| Product Group | (none) | text (read-only) | PG number | (none) | always disabled | (none) | affordance: none |
| Product Group Name | (none) | text (read-only) | PG name | (none) | always disabled | (none) | affordance: none |
| Currency | (none) | text (read-only) | USD/CAD/MXN | (none) | always disabled | (none) | affordance: none |
| Current Price | (none) | text (read-only) | money value | (none) | always disabled | (none) | affordance: none; never blank (NM-2206) |
| Mod Date | (none) | text (read-only) | date | (none) | always disabled | (none) | affordance: none; volatile |
| Updated By | (none) | text (read-only) | user name | (none) | always disabled | (none) | affordance: none; volatile |

### Toolbar Controls

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Change Local Office | (none) — use `text=Change Local Office` | button (launcher) | no office selected | (none) | always enabled | picker gates grid population | affordance: launcher → "Change Local Office" |
| Currency filter | (none) — use `button[role="combobox"]:has-text("ALL")` | combobox | ALL | options: ALL, USD, CAD, MXN | always enabled | specific currency gates Product Group Picker | (none) |
| Active-only | (none) — use checkbox by label | checkbox | unchecked (OFF) | boolean | always enabled | composes with text filter | (none) |
| Filter text input | (none) — use `input` by placeholder | text | empty | free text; client-side match on PG ID + Name | always enabled | (none) | does NOT match Currency column |
| Grid Options | (none) — use `button[aria-label="Grid Options"]` | button (launcher) | (none) | (none) | always enabled | (none) | affordance: launcher → dropdown with 10 menuitemcheckbox |
| Export | (none) — use button text | button | (none) | (none) | always enabled | (none) | direct CSV download |
| Loc Pricing Export | (none) — use button text | button | (none) | (none) | always enabled | (none) | direct CSV download |
| Import | (none) — use button text | button (launcher) | (none) | (none) | always enabled | (none) | affordance: launcher → "Import All Pricing Overrides" dialog |
| Rows per page | (none) — use `button[role="combobox"]` | combobox | 20 | options: 10, 20, 30, 40, 50 | always enabled | (none) | (none) |
| Save | (none) — use button text | button | disabled | (none) | disabled until grid dirty AND valid | (none) | (none) |

---

## Labels + Section Names

**Equipment — section headings (top-down)**:
- "Product Group Override"

**Labor — section headings (top-down)**:
- "Product Group Override"

**Override grid columns (10, verbatim)**: "Location", "Product Group", "Product Group Name", "Currency", "Current Price", "Override Price", "Max Discount %", "Active", "Mod Date", "Updated By"

**Picker table columns (3)**: "Product", "Product Group Name", "Price"

**Action buttons**: "Export", "Loc Pricing Export", "Grid Options", "Save"

---

## Save-cycle observations

**Save button behavior**:
- Default state on fresh load: disabled
- Enables when: any cell edited from baseline OR row added via picker
- Disables when: all edits reverted to baseline (LR-009 net-zero)
- testid: (none) — use button text "Save"

**Save dialog**:
- Triggered by: click of Save button
- testid: `[role="alertdialog"]` (CSS selector — `getByRole` misses it)
- Title (verbatim): "Save Changes"
- Body (verbatim): "Are you sure you want to save changes?"
- Buttons (in order, verbatim): "Cancel", "Save Changes"

**Post-save toast**:
- Region testid / aria-label: toast notification region
- Text (verbatim): success message after POST completes
- Duration: transient

**Dirty-state behavior**:
- Tab switch with dirty form: switches silently (no alertdialog between Equipment/Labor)
- Navigation away with dirty form: native `beforeunload` dialog
- Staged picker rows discard on reload

---

## Observations

### Bugs / Defects

| Bug ID | Field / Feature | Observed | Expected (per requirements) | Status |
|---|---|---|---|---|
| BUG-CPR-OVR-001 | Max Discount % | `0.5` → `50.00 %` (100× misread); `50` also yields `50.00 %` — two different inputs, same stored value | `0.5` should display `0.50 %` | open — HIGHEST SEVERITY (direct money impact) |
| BUG-CPR-OVR-002 | Override Price, Max Discount % | `1.2.3` → `1.23` or `1.23 %` — typo silently becomes plausible number | Should be rejected (multi-dot is not a valid number) | open |
| BUG-CPR-OVR-003 | Override Price, Max Discount % | `abc` blanks cell to `—`, Save stays ENABLED — emptied value can be saved | Should be rejected or restore original value | open |
| BUG-CPR-OVR-004 | All rejection cases | `[role="alert"]` element exists, textContent always empty — no error message rendered | Should display descriptive error text | open |
| BUG-CPR-OVR-005 | Override grid | Clicking another cell mid-edit leaves first editor open (`visibleSpinbuttons: 2`) | First editor should close when second opens | open |
| BUG-CPR-OVR-006 | Max Discount % | Values >100 (e.g. `150`, `100.01`) rejected with `aria-invalid="true"`, red border, editor stays open, Save disabled, but NO error message and focus is NOT trapped (Tab/Escape work) | Rejection is correct; lack of error message is BUG-CPR-OVR-004 | open — rejection behavior is correct |

### Suggestions / Improvements

none

---

## Staleness signal

- **Last verified**: 2026-07-22
- **Fresh-until**: 2026-08-05
- **Stale-after**: 2026-08-21
- **Refresh triggers**: Encore release announcement affecting Corporate Pricing; Override grid column add/remove; Max Discount validation rule change (0.5 bug fix would change test expectations); Save dialog redesign; import mechanism change; BUG-CPR-OVR-001..006 resolution.

---

## Coverage Manifest

Denominator: **148 slots**, every one dispositioned. Provenance is stated honestly below — read it before citing this number.

**⚠ PROVENANCE CAVEAT (2026-07-23) — this 148 is AGENT-derived; the machine enumerator ran and said something else entirely.**

LR-062 condition 1 requires the denominator to come from `scripts/walk-coverage/enumerate-page.mjs`.
**That script DID run for this module** — 2026-07-22, output at
`reports/walk-coverage/4107-corporate-pricing-override.json` + `.manifest.md`. **Its output was then
never consumed.** What it actually says:

```
denominator                : 504   (rawBeforeArchetypeCollapse 527)
setAlgebra                 : union 504 · intersection 62 · symDiff 442
its own generated manifest : Coverage_Ratio 0/504 (0%) · CrossCheck <pending>
every row                  : _undispositioned_
```

**Do not read 504 as "356 missing tests" — the units differ, and 504 is itself inflated.** Role split:
`tr` 414 · button 55 · th 10 · a 7 · option 5 · input 3 · combobox 2 · tab 2 · tabpanel 2 · checkbox 1.
**414 of the 504 (82%) are `tr` grid data rows** — the enumerator's homogeneous-row archetype collapse
barely fired here (527 → 504, 23 collapsed), so the raw union over-counts one grid row per record. The
genuinely distinct interactive controls number roughly **90**. The 504 also includes global app chrome
(sidebar nav, Inbox, Order/Job/Asset Search, Navigator Assistant) that belongs in `out-of-scope`.

Three **incompatible units** are in play, and prior notes conflated them:

| Figure | Unit | Source | Kind |
|---|---|---|---|
| 504 | DOM interactive elements | `enumerate-page.mjs` 2026-07-22 | machine, un-collapsed, **0% dispositioned** |
| 141 | test-case slots | opus blind count (`GAP-REPORT.md:9`) | agent estimate |
| 151 | test-case slots | gpt blind count (`GAP-REPORT.md:9`) | agent estimate |
| **148** | test-case slots | this manifest's enumerated table | hand-built enumeration |

148 is in the same unit as 141/151 (per-field case slots — e.g. "Equipment — Override Price (15 slots)"
is 15 BVA/negative cases for ONE field). It is **not** comparable to 504 at all.

| Figure | Source | Kind |
|---|---|---|
| 141 | opus blind count (`GAP-REPORT.md:9`) | agent estimate |
| 151 | gpt blind count (`GAP-REPORT.md:9`) | agent estimate |
| **148** | this manifest's enumerated table rows | hand-built enumeration |

The GAP-REPORT headline itself wrote `~151` — approximate from the start. The +10 opus/gpt delta was
*explained* (decimal-step BVA, LR-009 net-zero, absent-currency, export tenant-scope) but never
*reconciled* to one agreed figure. So an earlier note here claiming "the 151 denominator was overstated
by 3" was itself unproven and has been withdrawn: **151 was never an enumeration to be overstated.** 148
is simply the only figure that is an actual row-by-row count — which is why it is used, not because the
other two were disproved.

Consequences to respect:
- `**Coverage_Ratio**: 148/148 (100%)` is 100% *of an agent-derived case-slot denominator*. It does not
  carry the LR-062 condition-1 guarantee, which keys on the machine element denominator (504, at 0%).
- `**CrossCheck**: clean` is **UNEARNED**. LR-062 condition 3 requires every symmetric-difference (A△B)
  element to be classified. The enumerator produced that review set — **442 elements** — and its own
  manifest still reads `CrossCheck: <pending>`. Nothing in it was ever classified.
- This artifact's `MCP_Session_Date` is 2026-07-22, **after** the 2026-06-19 grandfather date, so it is
  **not** exempt from conditions 1–4.

**What would close this properly** (in order):
1. Fix the archetype collapse for this page, or collapse the 414 `tr` rows to per-column archetypes by
   hand, so the denominator reflects distinct controls (~90) rather than one entry per grid record.
2. Disposition every element in the collapsed denominator — the bulk of the global-chrome entries
   (sidebar nav, Inbox, the Search family, Navigator Assistant) are honest `out-of-scope: <reason>`.
3. Classify the A△B review set so `CrossCheck` can legitimately read `clean`.
4. Only then set `Coverage_Ratio` from the machine denominator.

Until all four are done this manifest is LR-062-*shaped*, not LR-062-*satisfied*, and no closure may
cite it as proof of condition 1 or 3.

**How this was missed**: the enumerator ran on 2026-07-22 and wrote 358 KB of provenance JSON that
nobody opened. The closure then quoted a hand-built number and labelled it "machine-enumerated". The
machine's own verdict — `0/504 (0%)` — was sitting on disk the whole time. A generated artifact that
nothing reads is the same as no artifact, except that it also makes the claim look substantiated.

None of the above disputes the coverage work itself: 127 tests exist, each carries an audit-ledger row,
and the disposition of every one of these 148 rows is real. The defect is in the denominator's
provenance, not in the dispositions.

### Equipment — Override Price (15 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-E-OP-P1 | positive: 0 min valid | 2026-07-21 | covered-by-TC: TC-CPR-OVR-021 |
| OVR-E-OP-P2 | positive: mid decimal | 2026-07-21 | covered-by-TC: TC-CPR-OVR-020 |
| OVR-E-OP-P3 | positive: large value | 2026-07-21 | covered-by-TC: TC-CPR-OVR-021 |
| OVR-E-OP-B1 | BVA: exact min 0 (overlaps P1) | 2026-07-21 | covered-by-TC: TC-CPR-OVR-021 |
| OVR-E-OP-B2 | BVA: below-min -0.01 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-067 |
| OVR-E-OP-B3 | BVA: decimal-step 0.001 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-068 |
| OVR-E-OP-B4 | BVA: large/max boundary | 2026-07-21 | covered-by-TC: TC-CPR-OVR-021 |
| OVR-E-OP-B5 | BVA: above-max | 2026-07-21 | covered-by-TC: TC-CPR-OVR-069 |
| OVR-E-OP-N1 | negative: abc | 2026-07-21 | covered-by-TC: TC-CPR-OVR-022 |
| OVR-E-OP-N2 | negative: 1.2.3 multi-dot | 2026-07-21 | covered-by-TC: TC-CPR-OVR-070 |
| OVR-E-OP-N3 | negative: -5 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-066 |
| OVR-E-OP-N4 | negative: leading-zero 007 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-071 |
| OVR-E-OP-N5 | negative: scientific 1e5 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-072 |
| OVR-E-OP-S1 | save-cycle: fill save reload | 2026-07-21 | covered-by-TC: TC-CPR-OVR-025 |
| OVR-E-OP-S2 | save-cycle: edit save reload | 2026-07-21 | covered-by-TC: TC-CPR-OVR-025 |
| OVR-E-OP-S3 | save-cycle: revert disables Save | 2026-07-21 | covered-by-TC: TC-CPR-OVR-019 |

### Equipment — Max Discount % (15 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-E-MD-P1 | positive: 0 min valid | 2026-07-21 | covered-by-TC: TC-CPR-OVR-037 |
| OVR-E-MD-P2 | positive: 50 mid | 2026-07-21 | covered-by-TC: TC-CPR-OVR-073 |
| OVR-E-MD-P3 | positive: 100 inclusive cap | 2026-07-21 | covered-by-TC: TC-CPR-OVR-037 |
| OVR-E-MD-B1 | BVA: -0.01 below-min | 2026-07-21 | covered-by-TC: TC-CPR-OVR-074 |
| OVR-E-MD-B2 | BVA: 0.5 decimal step | 2026-07-21 | covered-by-TC: TC-CPR-OVR-075 |
| OVR-E-MD-B3 | BVA: 99.99 just-below-max | 2026-07-21 | covered-by-TC: TC-CPR-OVR-076 |
| OVR-E-MD-B4 | BVA: 100.00 at-max | 2026-07-21 | covered-by-TC: TC-CPR-OVR-037 |
| OVR-E-MD-B5 | BVA: 100.01 above-max | 2026-07-21 | covered-by-TC: TC-CPR-OVR-077 |
| OVR-E-MD-N1 | negative: abc | 2026-07-21 | covered-by-TC: TC-CPR-OVR-078 |
| OVR-E-MD-N2 | negative: 1.2.3 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-079 |
| OVR-E-MD-N3 | negative: scientific 1e5 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-080 |
| OVR-E-MD-N4 | negative: leading-zero 007 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-081 |
| OVR-E-MD-S1 | save-cycle: fill save reload | 2026-07-21 | covered-by-TC: TC-CPR-OVR-026 |
| OVR-E-MD-S2 | save-cycle: edit save reload | 2026-07-21 | covered-by-TC: TC-CPR-OVR-026 |
| OVR-E-MD-S3 | save-cycle: revert disables Save | 2026-07-21 | covered-by-TC: TC-CPR-OVR-082 |

### Equipment — Active (5 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-E-ACT-P1 | positive: toggle ON | 2026-07-21 | covered-by-TC: TC-CPR-OVR-024 |
| OVR-E-ACT-P2 | positive: toggle OFF | 2026-07-21 | covered-by-TC: TC-CPR-OVR-024 |
| OVR-E-ACT-S1 | save-cycle: toggle ON persist | 2026-07-21 | covered-by-TC: TC-CPR-OVR-027 |
| OVR-E-ACT-S2 | save-cycle: toggle OFF persist | 2026-07-21 | covered-by-TC: TC-CPR-OVR-027 |
| OVR-E-ACT-S3 | save-cycle: toggle-revert net-zero | 2026-07-21 | covered-by-TC: TC-CPR-OVR-083 |

### Labor — Override Price (15 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-L-OP-P1 | positive: 0 min valid | 2026-07-21 | covered-by-TC: TC-CPR-OVR-085 |
| OVR-L-OP-P2 | positive: mid decimal | 2026-07-21 | covered-by-TC: TC-CPR-OVR-086 |
| OVR-L-OP-P3 | positive: large value | 2026-07-21 | covered-by-TC: TC-CPR-OVR-087 |
| OVR-L-OP-B1 | BVA: below-min -0.01 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-088 |
| OVR-L-OP-B2 | BVA: just-above-zero 0.01 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-089 |
| OVR-L-OP-B3 | BVA: 3rd-decimal 12.345 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-090 |
| OVR-L-OP-B4 | BVA: large value 999999.99 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-091 |
| OVR-L-OP-B5 | BVA: above-max probe | 2026-07-21 | covered-by-TC: TC-CPR-OVR-091 |
| OVR-L-OP-N1 | negative: abc | 2026-07-21 | covered-by-TC: TC-CPR-OVR-092 |
| OVR-L-OP-N2 | negative: 1.2.3 multi-dot | 2026-07-21 | covered-by-TC: TC-CPR-OVR-093 |
| OVR-L-OP-N3 | negative: -5 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-094 |
| OVR-L-OP-N4 | negative: leading-zero 007 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-095 |
| OVR-L-OP-N5 | negative: scientific 1e5 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-096 |
| OVR-L-OP-S1 | save-cycle: fill save reload | 2026-07-21 | covered-by-TC: TC-CPR-OVR-053 |
| OVR-L-OP-S2 | save-cycle: edit save reload | 2026-07-21 | covered-by-TC: TC-CPR-OVR-053 |
| OVR-L-OP-S3 | save-cycle: revert disables Save | 2026-07-21 | covered-by-TC: TC-CPR-OVR-097 |

### Labor — Max Discount % (15 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-L-MD-P1 | positive: 0 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-099 |
| OVR-L-MD-P2 | positive: 50 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-100 |
| OVR-L-MD-P3 | positive: 100 inclusive cap | 2026-07-21 | covered-by-TC: TC-CPR-OVR-101 |
| OVR-L-MD-B1 | BVA: -0.01 below-min | 2026-07-21 | covered-by-TC: TC-CPR-OVR-102 |
| OVR-L-MD-B2 | BVA: 0.5 decimal step | 2026-07-21 | covered-by-TC: TC-CPR-OVR-103 |
| OVR-L-MD-B3 | BVA: 99.99 just-below-max | 2026-07-21 | covered-by-TC: TC-CPR-OVR-104 |
| OVR-L-MD-B4 | BVA: above-cap 150 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-105 |
| OVR-L-MD-B5 | BVA: 1e5 rejected by >100 cap | 2026-07-21 | covered-by-TC: TC-CPR-OVR-110 |
| OVR-L-MD-N1 | negative: abc | 2026-07-21 | covered-by-TC: TC-CPR-OVR-107 |
| OVR-L-MD-N2 | negative: 1.2.3 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-108 |
| OVR-L-MD-N3 | negative: -5 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-106 |
| OVR-L-MD-N4 | negative: leading-zero 007 | 2026-07-21 | covered-by-TC: TC-CPR-OVR-109 |
| OVR-L-MD-S1 | save-cycle: fill save reload | 2026-07-21 | covered-by-TC: TC-CPR-OVR-054 |
| OVR-L-MD-S2 | save-cycle: edit save reload | 2026-07-21 | covered-by-TC: TC-CPR-OVR-054 |
| OVR-L-MD-S3 | save-cycle: revert disables Save | 2026-07-21 | covered-by-TC: TC-CPR-OVR-111 |

### Labor — Active (5 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-L-ACT-P1 | positive: toggle ON | 2026-07-21 | covered-by-TC: TC-CPR-OVR-055 |
| OVR-L-ACT-P2 | positive: toggle OFF | 2026-07-21 | covered-by-TC: TC-CPR-OVR-055 |
| OVR-L-ACT-S1 | save-cycle: toggle ON persist | 2026-07-21 | covered-by-TC: TC-CPR-OVR-055 |
| OVR-L-ACT-S2 | save-cycle: toggle OFF persist | 2026-07-21 | covered-by-TC: TC-CPR-OVR-055 |
| OVR-L-ACT-S3 | save-cycle: toggle-revert net-zero | 2026-07-21 | covered-by-TC: TC-CPR-OVR-098 |

### Tabs (4 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-TAB-1 | Equipment default selected | 2026-07-21 | covered-by-TC: TC-CPR-OVR-001 |
| OVR-TAB-2 | Labor click → selected | 2026-07-21 | covered-by-TC: TC-CPR-OVR-002 |
| OVR-TAB-3 | Equipment click → selected | 2026-07-21 | covered-by-TC: TC-CPR-OVR-002 |
| OVR-TAB-4 | Grid reloads per-tab | 2026-07-21 | covered-by-TC: TC-CPR-OVR-002 |

### Change Local Office Picker (10 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-LOC-1 | launcher opens dialog | 2026-07-21 | covered-by-TC: TC-CPR-OVR-030 |
| OVR-LOC-2 | search narrows rows | 2026-07-21 | covered-by-TC: TC-CPR-OVR-039 |
| OVR-LOC-3 | Select disabled until checked | 2026-07-21 | covered-by-TC: TC-CPR-OVR-030 |
| OVR-LOC-4 | row select → location applied | 2026-07-21 | covered-by-TC: TC-CPR-OVR-004 |
| OVR-LOC-5 | Cancel closes no apply | 2026-07-21 | covered-by-TC: TC-CPR-OVR-030 |
| OVR-LOC-6 | Esc closes no apply | 2026-07-21 | covered-by-TC: TC-CPR-OVR-112 |
| OVR-LOC-7 | Cancel/dismiss closes no apply | 2026-07-21 | covered-by-TC: TC-CPR-OVR-113 |
| OVR-LOC-8 | no-results empty state | 2026-07-21 | covered-by-TC: TC-CPR-OVR-114 |
| OVR-LOC-9 | clear search restores list | 2026-07-21 | covered-by-TC: TC-CPR-OVR-039 |
| OVR-LOC-10 | re-select current office net-zero | 2026-07-21 | covered-by-TC: TC-CPR-OVR-115 |

### Currency Filter (5 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-CUR-1 | options render | 2026-07-21 | covered-by-TC: TC-CPR-OVR-009 |
| OVR-CUR-2 | ALL default full set | 2026-07-21 | covered-by-TC: TC-CPR-OVR-009 |
| OVR-CUR-3 | USD → only USD rows | 2026-07-21 | covered-by-TC: TC-CPR-OVR-125 |
| OVR-CUR-4 | CAD → only CAD rows | 2026-07-21 | covered-by-TC: TC-CPR-OVR-126 |
| OVR-CUR-5 | MXN → 0 rows | 2026-07-21 | covered-by-TC: TC-CPR-OVR-127 |

### Active-Only Filter (4 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-ACF-1 | defaults OFF | 2026-07-21 | covered-by-TC: TC-CPR-OVR-010 |
| OVR-ACF-2 | toggle ON removes inactive | 2026-07-21 | covered-by-TC: TC-CPR-OVR-042 |
| OVR-ACF-3 | toggle OFF restores | 2026-07-21 | covered-by-TC: TC-CPR-OVR-042 |
| OVR-ACF-4 | intersection with text filter | 2026-07-21 | covered-by-TC: TC-CPR-OVR-044 |

### Text Filter (8 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-TXT-1 | partial name match | 2026-07-21 | covered-by-TC: TC-CPR-OVR-012 |
| OVR-TXT-2 | exact ID match | 2026-07-21 | covered-by-TC: TC-CPR-OVR-013 |
| OVR-TXT-3 | no-match → 0 rows | 2026-07-21 | covered-by-TC: TC-CPR-OVR-015 |
| OVR-TXT-4 | clear restores | 2026-07-21 | covered-by-TC: TC-CPR-OVR-015 |
| OVR-TXT-5 | scoped to ID+Name only | 2026-07-21 | covered-by-TC: TC-CPR-OVR-014 |
| OVR-TXT-6 | whitespace tolerant | 2026-07-21 | covered-by-TC: TC-CPR-OVR-016 |
| OVR-TXT-7 | special chars tolerant | 2026-07-21 | covered-by-TC: TC-CPR-OVR-016 |
| OVR-TXT-8 | 1-char boundary | 2026-07-21 | covered-by-TC: TC-CPR-OVR-116 |

### Grid Options (5 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-GO-1 | panel opens full list | 2026-07-21 | covered-by-TC: TC-CPR-OVR-031 |
| OVR-GO-2 | toggle OFF removes column | 2026-07-21 | covered-by-TC: TC-CPR-OVR-031 |
| OVR-GO-3 | toggle ON restores column | 2026-07-21 | covered-by-TC: TC-CPR-OVR-048 |
| OVR-GO-4 | Reset to Default restores all | 2026-07-21 | covered-by-TC: TC-CPR-OVR-048 |
| OVR-GO-5 | pref persists across reload | 2026-07-21 | covered-by-TC: TC-CPR-OVR-031 |

### Export (5 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-EXP-1 | Export → CSV downloaded | 2026-07-21 | covered-by-TC: TC-CPR-OVR-032 |
| OVR-EXP-2 | CSV has 9 headers | 2026-07-21 | covered-by-TC: TC-CPR-OVR-032 |
| OVR-EXP-3 | row values well-formed | 2026-07-21 | covered-by-TC: TC-CPR-OVR-038 |
| OVR-EXP-4 | file is tenant-wide | 2026-07-21 | covered-by-TC: TC-CPR-OVR-032 |
| OVR-EXP-5 | blank Override Price renders blank | 2026-07-21 | covered-by-TC: TC-CPR-OVR-061 |

### Import (5 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-IMP-1 | Import → dialog opens | 2026-07-21 | covered-by-TC: TC-CPR-OVR-033 |
| OVR-IMP-2 | dialog shows controls | 2026-07-21 | covered-by-TC: TC-CPR-OVR-033 |
| OVR-IMP-3 | valid CSV UPSERT-ALL | 2026-07-21 | deferred-to: `plans/pending/SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT.md` Phase 4; recipient owns the full export -> modify -> upload -> restore round-trip |
| OVR-IMP-4 | empty price rejection | 2026-07-21 | deferred-to: `plans/pending/SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT.md` Phase 4; TC-CPR-OVR-117 remains `test.skip` here because NM-2273 authors the NM-1940 negative-path rejection test |
| OVR-IMP-5 | Cancel closes no upload | 2026-07-21 | covered-by-TC: TC-CPR-OVR-033 |

### Rows Per Page (6 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-RPP-1 | options render | 2026-07-21 | covered-by-TC: TC-CPR-OVR-011 |
| OVR-RPP-2 | 10 → ≤10 rows | 2026-07-21 | covered-by-TC: TC-CPR-OVR-121 |
| OVR-RPP-3 | 20 → ≤20 rows (default) | 2026-07-21 | covered-by-TC: TC-CPR-OVR-011 |
| OVR-RPP-4 | 30 → ≤30 rows | 2026-07-21 | covered-by-TC: TC-CPR-OVR-122 |
| OVR-RPP-5 | 40 → ≤40 rows | 2026-07-21 | covered-by-TC: TC-CPR-OVR-123 |
| OVR-RPP-6 | 50 → ≤50 rows | 2026-07-21 | covered-by-TC: TC-CPR-OVR-124 |

### Product Group Picker (6 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-PGP-1 | picker appears on specific currency | 2026-07-21 | covered-by-TC: TC-CPR-OVR-063 |
| OVR-PGP-2 | picker absent on ALL | 2026-07-21 | covered-by-TC: TC-CPR-OVR-063 |
| OVR-PGP-3 | drag → row staged | 2026-07-21 | covered-by-TC: TC-CPR-OVR-064 |
| OVR-PGP-4 | no POST until Save | 2026-07-21 | covered-by-TC: TC-CPR-OVR-064 |
| OVR-PGP-5 | discard drops staged row | 2026-07-21 | covered-by-TC: TC-CPR-OVR-064 |
| OVR-PGP-6 | picker serves Labor tab | 2026-07-21 | covered-by-TC: TC-CPR-OVR-065 |

### §3 SBC — Equipment (7 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-SBC-E1 | result-fidelity | 2026-07-21 | covered-by-TC: TC-CPR-OVR-045 |
| OVR-SBC-E2 | pagination | 2026-07-21 | covered-by-TC: TC-CPR-OVR-058 |
| OVR-SBC-E3 | sorting | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 |
| OVR-SBC-E4 | combination | 2026-07-21 | covered-by-TC: TC-CPR-OVR-049 |
| OVR-SBC-E5 | render-state | 2026-07-21 | covered-by-TC: TC-CPR-OVR-006 |
| OVR-SBC-E6 | empty-vol | 2026-07-21 | covered-by-TC: TC-CPR-OVR-003 |
| OVR-SBC-E7 | persistence: dirty tab-switch | 2026-07-21 | covered-by-TC: TC-CPR-OVR-118 |

### §3 SBC — Labor (7 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-SBC-L1 | result-fidelity | 2026-07-21 | covered-by-TC: TC-CPR-OVR-051 |
| OVR-SBC-L2 | pagination | 2026-07-21 | covered-by-TC: TC-CPR-OVR-121 |
| OVR-SBC-L3 | sorting | 2026-07-21 | covered-by-TC: TC-CPR-OVR-052 |
| OVR-SBC-L4 | combination | 2026-07-21 | covered-by-TC: TC-CPR-OVR-119 |
| OVR-SBC-L5 | render-state | 2026-07-21 | covered-by-TC: TC-CPR-OVR-050 |
| OVR-SBC-L6 | empty-vol | 2026-07-21 | covered-by-TC: TC-CPR-OVR-008 |
| OVR-SBC-L7 | persistence: dirty tab-switch | 2026-07-21 | covered-by-TC: TC-CPR-OVR-120 |

### Read-Only Render (4 slots)

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| OVR-RO-1 | Current Price Equipment | 2026-07-21 | covered-by-TC: TC-CPR-OVR-036 |
| OVR-RO-2 | Current Price Labor | 2026-07-21 | covered-by-TC: TC-CPR-OVR-050 |
| OVR-RO-3 | blank Override Price → em-dash | 2026-07-21 | covered-by-TC: TC-CPR-OVR-061 |
| OVR-RO-4 | Mod Date / Updated By render | 2026-07-21 | read-only-verified |

---

**Manifest total**: 148 elements. 145 covered-by-TC. 1 read-only-verified. 2 deferred-to. 0 out-of-scope. 0 unresolved.
