---
artifact: field-case-catalog
module: discount-matrix
submodule: company_matrix
client: encore
session_date: 2026-08-20
author_identity: GIVER
walk_evidence: clients/encore/specs_planning/_internal/walk-evidence/discount-matrix-company-matrix-2026-08-19.md
tc_band: TC-DSM-CMX-001..042
coverage_mode: quick
depth: L1 (QUICK) — L2/L3 deferred to PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md §1
---

# Field-Case Catalog — Discount Matrix › Company Matrix (2026-08-20)

Two axes per `field-case-generation.md`:
**Axis 1** = per-field-type cases (§2).
**Axis 2** = surface-behavior cases (§3, LR-065), QUICK depth only.

**Surface summary**: The criteria bar carries three dropdowns (Country, Currency, Business Tier) and one
formatted numeric input (GAV Discount Threshold). The grid's 189 percentage values are **static text,
not inputs** — confirmed by machine count: `tbody input = 0`, `tbody [role="spinbutton"] = 0`. All
edits happen inside the **Edit Tier dialog**, which exposes 21 formatted percentage inputs
(`type="text"`, `inputmode="decimal"`, placeholder `0`) and two buttons (`Cancel`, `Update`). Revenue
Tier boundary fields are absent from that dialog.

**Percentage input contract** (measured live — walk-evidence §§ RESOLVED, FINAL DISPOSITIONS):
- Whole numbers: `%` appended unchanged (`14` → `14%`, `1` → `1%`, `100` → `100%`).
- Decimals strictly below 1: multiplied by 100 (`0.14` → `14%`, `0.5` → `50%`).
- Decimals above 1: fraction kept (`12.5` → `12.5%`).
- Out of range (> 100): renders with `%`, `aria-invalid=true`, Update disabled.
- Empty / non-numeric: `0%`, `aria-invalid=false`, Update enabled (dialog fields).
- Negative: minus keypress refused at input handler; value unchanged.
- **Never use `fill()` on these fields** — one synthetic event mis-parses the formatter
  (`fill("20%")` rendered `15.2%`; real keystrokes rendered `20%`). Drive with `pressSequentially`.

---

## Summary table

| Field / Control | §2 Type | Case classes owed | Covered (TC) | Deferred (D-row) | Gaps |
|---|---|---|---|---|---|
| Country dropdown | Dropdown / combobox (Radix) | Positive each option, BVA first/last, Negative invalid DOM tamper, Save-cycle each option | TC-001, TC-002, TC-006 | D7 (multi-axis combinations) | none |
| Currency dropdown | Dropdown / combobox (Radix) | Positive each option, BVA first/last, Negative invalid DOM tamper, Save-cycle each option | TC-001, TC-003, TC-006 | D7 | none |
| Business Tier dropdown | Dropdown / combobox (Radix) | Positive each option, BVA first/last, Negative invalid DOM tamper, Save-cycle each option | TC-001, TC-004, TC-006 | D7 | none |
| GAV Discount Threshold | Numeric (formatted text input) | Positive min/mid/max, BVA min-1/max+1/decimal-step, Negative abc/leading-zero/negative, Save-cycle new-fill/edit/revert | TC-034–042, TC-005 | — | none |
| Grid percentage cells (189) | Read-only static text | render-state only; no input case classes apply | TC-010 (confirms read-only) | — | none |
| Edit Tier — 21 percentage inputs | Numeric (formatted text input) | Positive min/mid/max, BVA decimal step/max boundary, Negative out-of-range/non-numeric/negative, Save-cycle | TC-013–024 | D14 (per-input denominator gap) | none |
| Add Tier — End Tier input | Numeric (numeric input mode) | Positive valid, BVA max boundary, Negative non-numeric, Save-cycle commit | TC-030–033 | D1 (commit half requires mutation decision) | none |
| Header Save button | Control (save) | Disabled pristine, Enabled on valid change, Persists value | TC-005 | — | none |
| Export button | Control (io) | Real download, payload fidelity, HTTP contract | TC-025–029 | D4 (export-while-dirty) | none |
| Add Tier button | Control (add/picker) | Opens dialog, cancel discards, commit path | TC-030, TC-033 | D1 (commit half) | none |
| Delete Tier button | Control (destructive) | Confirmation dialog, commit path | — | D2 (never walked — mutation decision needed) | none |
| Import button | Control (io) | Round-trip import | — | D3 (never walked — fixture files + office decision needed) | none |

---

## SECTION A — Header dropdowns (criteria bar)

### Field: Country

**Walk evidence**: criteria bar, `[role="combobox"]`, renders `United States` on office 1604.
**§2 field type**: Dropdown / combobox (Radix).

| Case class | TC | Coverage note |
|---|---|---|
| Positive — selection loads grid for that key | TC-002 | Changing Country re-keys the grid; new or empty state renders, stale rows never retained |
| Positive — default renders on load | TC-001 | Grid loads with `United States` selected; grid non-zero |
| Positive — empty state when no rows for key | TC-006 | Empty state renders correctly when key resolves to no data |
| BVA — first/last option | deferred D7 | Multi-axis BVA (all option combinations) deferred to DEEP |
| Negative — invalid value via DOM tamper | GAP — no case authored; live DOM tamper would need a fixture or API bypass not exercised during the walk. No evidence this field performs server-side rejection independently of the grid-reload; cannot author without measurement. |
| Save-cycle — each option save+reload | not applicable | Country does not participate in the header Save; it keys the grid read. No save-cycle dimension exists for this control independently. |

---

### Field: Currency

**Walk evidence**: criteria bar, `[role="combobox"]`, renders `USD` on office 1604.
**§2 field type**: Dropdown / combobox (Radix).

| Case class | TC | Coverage note |
|---|---|---|
| Positive — selection re-keys grid | TC-003 | Changing Currency re-queries; stale rows not retained |
| Positive — default renders on load | TC-001 | Grid loads with `USD` selected |
| Positive — empty state when no rows | TC-006 | Empty state correct |
| BVA — first/last option | deferred D7 | Multi-axis BVA deferred to DEEP |
| Negative — invalid value via DOM tamper | GAP — same basis as Country above; no measurement of per-field server rejection. |
| Save-cycle | not applicable | Currency keys the grid read; no independent save-cycle dimension. |

---

### Field: Business Tier

**Walk evidence**: criteria bar, `[role="combobox"]`, renders `Standard` on office 1604.
**§2 field type**: Dropdown / combobox (Radix).

| Case class | TC | Coverage note |
|---|---|---|
| Positive — selection re-keys grid | TC-004 | Changing Business Tier re-queries; stale rows not retained |
| Positive — default renders on load | TC-001 | Grid loads with `Standard` selected |
| Positive — empty state when no rows | TC-006 | Empty state correct |
| BVA — first/last option | deferred D7 | Multi-axis BVA deferred to DEEP |
| Negative — invalid value via DOM tamper | GAP — same basis as Country above. |
| Save-cycle | not applicable | Business Tier keys the grid read; no independent save-cycle dimension. |

---

## SECTION E — GAV Discount Threshold

**Walk evidence**: `input[name="gavDiscountThreshold"]`, `type="text"`, `inputmode="decimal"`,
placeholder `0%`, baseline `15%` on office 1604. No `pattern`, no `maxlength`.
**§2 field type**: Numeric / formatted text input.

| Case class | TC | Coverage note |
|---|---|---|
| Positive — whole number accepted, `%` appended | TC-034 | `20` → `20%`, valid, no message |
| Positive — decimal below 1 multiplied by 100 | TC-035 | `0.2` → `20%`, valid |
| Positive — fraction above 1 kept | TC-036 | `12.5` → `12.5%`, valid |
| Positive — zero and empty resolve to zero percent | TC-038 | `0` and clear both → `0%`, valid |
| BVA — max accepted (100) | TC-041 | `100` → `100%`, `aria-invalid=false`, Save enabled |
| BVA — max+1 rejected (`aria-invalid=true`, no message) | TC-037 | `101` → `aria-invalid=true`, no visible message (DEFECT-1, second location) |
| Negative — non-numeric refused, selection variant | TC-039 path 1 | Overtyping `abc` onto existing value → value unchanged, `aria-invalid=false` |
| Negative — non-numeric after clear resolves to zero | TC-039 path 2 | Clear then `abc` → `0%`, `aria-invalid=false` |
| Negative — negative sign refused | TC-042 | `-5` → only `5` reaches the field → `5%`, `aria-invalid=false` |
| Save-cycle — persists after save and reload | TC-005 | Header Save persists the threshold; grid values unchanged |
| Save-cycle — unsaved value survives tab switch, discarded on reload | TC-040 | Unsaved threshold persists across tab round-trip; disappears on reload; no in-app prompt |
| Revert-to-original disables Save (LR-009) | GAP — no case authored isolating revert-disables-Save for this field specifically. TC-040 confirms the value is not persisted on reload but does not assert Save-button state on revert to original. |

---

## SECTION C — Edit Tier dialog (21 percentage inputs)

**Walk evidence**: dialog title `Editing 0 - 1500`, 21 `type="text"` `inputmode="decimal"` inputs,
placeholder `0`, buttons `Cancel` and `Update`. Revenue Tier start/end absent.
**§2 field type**: Numeric / formatted text input (same contract as GAV Discount Threshold).

| Case class | TC | Coverage note |
|---|---|---|
| Positive — dialog roster correct | TC-013 | 21 inputs, correct types, `Cancel` + `Update`, no tier-boundary fields |
| Positive — whole number accepted | TC-014 | `14` → `14%`, `aria-invalid=false`, Update enabled (NM-3235 regression lock) |
| Positive — single-digit `1` renders `1%` | TC-016 | `1` → `1%` (NM-3387 regression lock) |
| Positive — decimal below 1 multiplied by 100 | TC-015 | `0.14` → `14%`, `0.5` → `50%` |
| BVA — upper boundary: 100 accepted, 101 rejected | TC-017 | `100` → valid enabled; `101` → `aria-invalid=true`, Update disabled |
| BVA — decimal above 1 keeps fraction | TC-015 (implicitly), walk evidence | `12.5` → `12.5%` (single-source Run B) |
| Negative — out-of-range shows no message | TC-019 | `101`, `150`, `3456` all: `aria-invalid=true`, no visible message anywhere (DEFECT-1) |
| Negative — out-of-range does not persist | TC-018 | After Cancel, row byte-identical to baseline |
| Negative — empty and non-numeric resolve to `0%` | TC-021 | Both render `0%`, `aria-invalid=false`, Update enabled |
| Negative — negative sign refused | TC-020 | `-` keypress refused; `1` after → `1%` |
| Negative — repeated focus cycles do not alter invalid value | TC-023 | `3456` stable across 3 focus cycles, Update disabled (NM-3390 regression lock) |
| Save-cycle — Cancel discards all pending edits | TC-024 | Row byte-identical after Cancel |
| Save-cycle — Update commit | GAP — no case drives Update through to commit and verifies persistence after reload. Every dialog case uses Cancel. Deferred: D1 notes the commit-half decision; that deferral is for Add Tier (tier creation). For Edit Tier the barrier is different — editing percentage values is non-destructive and reversible — but no case was authored for the full Update→persist path. No D-row covers this gap explicitly. |
| Bug evidence — input 0 opens in raw decimal format | TC-022 | Index 0 renders `0.17`; indices 1–20 render `%`-formatted (DEFECT-2, 11 fresh opens across 3 runs) |

---

## SECTION D — Toolbar surfaces

### Control: Export button

**Walk evidence**: walk-evidence §§ Export surface, Full-payload fidelity.

| Case class | TC | Coverage note |
|---|---|---|
| Download occurs; filename derived from criteria | TC-025 | `DiscountMatrix-US-USD-Standard.xlsx` (NM-3255 regression lock) |
| HTTP contract: POST → 200, correct content-type | TC-026 | POST body carries criteria; 200 + spreadsheet MIME (NM-3062 regression lock) |
| Exported values match grid cell for cell | TC-027 | 189/189 cells match |
| Workbook shape matches round-trip template | TC-028 | Sheet name, row layout, sub-headers |
| Export ID column is a platform identifier | TC-029 | 36-char GUID (NM-3236 by-design) |
| Export while dirty (NM-3256) | deferred D4 | Needs a dirty-state sequence; deferred to DEEP |

---

### Control: Add Tier button

**Walk evidence**: walk-evidence Edit Tier dialog §, TC-030..TC-033.

| Case class | TC | Coverage note |
|---|---|---|
| Dialog opens; End Tier field present; confirm disabled on open | TC-030 | Title `Adding Tier`, one input, `Cancel` + `Add Tier` disabled |
| End Tier validation is submit-time, not blur-time | TC-031 | `30000000` → no inline error, confirm enables; stops before submit (NM-3237 partial) |
| Non-numeric End Tier silently refused | TC-032 | `abc` → field stays empty, confirm stays disabled |
| Cancel leaves grid untouched | TC-033 | Row count and ranges unchanged |
| Commit half (valid End Tier → submit → row persists) | deferred D1 | Requires explicit mutation decision + cleanup path |

---

### Control: Delete Tier button

**Walk evidence**: button `title="Delete"` observed per row; never exercised.

| Case class | TC | Coverage note |
|---|---|---|
| All Delete Tier cases | deferred D2 | Never walked; NM-3239 and NM-3435 require destructive mutation decision |

---

### Control: Import button

**Walk evidence**: button observed in toolbar; never exercised.

| Case class | TC | Coverage note |
|---|---|---|
| All Import cases | deferred D3 | Never walked; requires fixture files and office decision |

---

## SECTION B — Grid surface (Axis 2, §3 surface-behavior families)

**Surface**: 9 tier rows, 21 percentage columns, 189 static-text cells, read-only. No pagination
(all rows rendered). No sortable column headers on the main grid (headers are group labels, not
sort triggers). Walk evidence: machine denominator §.

| Family | Applicable | TC | QUICK must-assert |
|---|---|---|---|
| **render-state** | YES | TC-008, TC-010, TC-011, TC-012 | Column structure 3 groups × 7 buckets; percentage cells are static text (zero `<input>` in `tbody`); grid readiness is data-driven (skeleton → data); every tier row has Delete and Edit buttons |
| **result-fidelity** | YES | TC-008, TC-009, TC-012, TC-027 | Column structure matches contract; tier ranges contiguous and non-overlapping; exported values match grid 189/189 |
| **empty-vol** | YES | TC-006 | Empty state renders when no rows match the criteria key (NM-2219 AC1) |
| **persistence** | YES | TC-005 | GAV threshold persists through header Save and reload; matrix rows are not written by header Save |
| **sorting** | NO | — | `out-of-scope: sorting=the grid column headers are group labels (Non-Peak/Standard/Peak Booking Windows Days) and day-bucket sub-headers; no sort affordance was observed on any column header in the walk` |
| **pagination** | NO | — | `out-of-scope: pagination=all 9 tier rows render at once; no pager control was observed` |
| **combination** | YES (partial) | TC-007 | Header-key change after a cancelled dialog edit does not carry pending values; multi-axis combination (Country × Currency × Tier) deferred D7 |

**Surface_Family**: render-state (QUICK) — TC-008, TC-010, TC-011, TC-012
**Surface_Family**: result-fidelity (QUICK) — TC-008, TC-009, TC-012, TC-027
**Surface_Family**: empty-vol (QUICK) — TC-006
**Surface_Family**: persistence (QUICK) — TC-005
**Surface_Family**: combination (QUICK, partial) — TC-007

---

## State-transition coverage

| Transition | TC |
|---|---|
| All three keys set → grid loads | TC-001 |
| Header key change → grid re-keys | TC-002, TC-003, TC-004 |
| Key combination → empty state | TC-006 |
| Cancelled dialog edit + header change → no carry-over | TC-007 |
| Threshold edit → Save → persist | TC-005 |
| Threshold edit → tab round-trip → survives (not persisted until Save) | TC-040 |
| Dialog open → edit valid → Cancel → no persist | TC-024 |
| Dialog open → out-of-range → `aria-invalid=true` → Cancel | TC-018 |
| Negative input refused at input layer | TC-020, TC-042 |

---

## DEEP deferral summary (D-rows from PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md §1)

| D-row | What was deferred | Unlock |
|---|---|---|
| D1 | Add Tier — commit half (End Tier submit path and post-create persistence) | Explicit mutation decision + cleanup path |
| D2 | Delete Tier — all cases (NM-3239, NM-3435) | Walk the delete affordance; destructive mutation decision |
| D3 | Import — all cases | Safe office + fixture files decision |
| D4 | Export while dirty (NM-3256) | Drive threshold dirty, click Export, take Discard |
| D5 | Permission gating (`!canEdit`, ROLE_FUNCTION_REVENUEMGMT Read vs Edit) | Second read-only test account |
| D6 | Volume / large result set | Office with materially more tier rows |
| D7 | Multi-axis header combinations (Country × Currency × Business Tier) | Enumerate all valid option triples |
| D8 | Cross-session and cross-tab persistence | Reload-independent persistence probe |
| D9 | Render-state — error/invalid render geometry | Element screenshot or `boundingBox` on a live rejection |
| D10 | UI↔DB column mapping | API schema (not reachable from UI) |
| D11 | Country dropdown option count timing sensitivity | Deterministic readiness signal for options list |
| D12 | Transient element in validation sweep | Isolated reproduction run |
| D13 | Save→navigate write loss (BUG-CANDIDATE) | nav2 baseline comparison |
| D14 | Edit Tier 21-input denominator gap in walk-coverage tooling | Per-field key with ancestor path in portal scan |

---

## Gaps recorded

1. **GAP — Country dropdown Negative (DOM tamper)**: no case authored; live DOM-tamper rejection behaviour for each header dropdown was not measured; no evidence of per-field server rejection independent of the grid re-key.
2. **GAP — Currency dropdown Negative (DOM tamper)**: same basis as Country.
3. **GAP — Business Tier dropdown Negative (DOM tamper)**: same basis as Country.
4. **GAP — GAV Discount Threshold revert-to-original disables Save**: no case isolates the LR-009 revert-disables-Save probe for this field. TC-040 confirms non-persistence on reload but does not assert Save-button state on reverting to the original value.
5. **GAP — Edit Tier full Update commit path**: no case drives Update through to commit and verifies persistence after reload. Every dialog case is cancel-only. No D-row covers this explicitly (D1 covers the Add Tier commit half, not Edit Tier).

---

## Totals

- **Criteria bar fields mapped**: 4 (Country, Currency, Business Tier, GAV Discount Threshold)
- **Dialog fields mapped**: 21 percentage inputs (as a single §2 type group) + 1 End Tier input (Add Tier)
- **Grid static cells**: confirmed read-only; covered under render-state
- **Toolbar controls**: Export (5 cases), Add Tier (4 cases), Delete Tier (deferred), Import (deferred)
- **Axis 2 §3 families**: 4 applicable (render-state, result-fidelity, empty-vol, persistence, combination partial); 2 out-of-scope (sorting, pagination)
- **TCs cross-referenced**: TC-DSM-CMX-001..042
- **D-row deferrals**: D1–D14 (all from PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md §1)
- **GAP entries**: 5
