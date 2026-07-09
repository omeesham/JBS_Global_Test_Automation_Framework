# Corporate Pricing — Export ▾ All: dialog contract + real download round-trip — Test Cases (NM-2264)

**Module**: corporate-pricing | **Submodule**: export_all | **Total**: 17 | **Updated**: 2026-07-09

> The four Export ▾ variants gate behind a shared Year(s)(1–3) + Currency dialog (Continue disabled until BOTH set); on Continue the export fires and downloads a wide product-group × pricebook matrix CSV. Covers the dialog behavior, boundary values, the live currencyId map (USD=1 / CAD=2 / MXN=3), the real per-variant download round-trip (with the NM-1997 / NM-1998 / NM-2005 file-content regressions folded in), and the Axis-2 surface-behavior DEEP band. The baseline Export ▾ trigger tests (TC-CPR-TIO-002..005, corrected to this dialog contract) stay in the baseline doc.

> Shared toolbar surface reference (MCP verification log, field inventory, validation rules, selector-mapping) lives in the baseline doc `corporate_pricing_toolbar_io_test_cases.md`.

---

## TC-CPR-EXA-001: Each Export variant opens the shared "Export" Year(s)+Currency dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-TIO-001
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. For each of the 4 Export variants: open Export and click the variant
2. Confirm a dialog titled "Export" renders with a Year(s) combobox, a Currency combobox, and Cancel / Continue / Close buttons, with Continue disabled at open

**Expected**: Every variant opens the same "Export" precondition dialog (Year(s) + Currency comboboxes, Cancel/Continue/Close), and Continue is disabled before any field is set.
**Data**: office=1604
**Notes**: NM-2264 dialog contract, live-verified 2026-07-07. Parametrized across all 4 variants.

---

## TC-CPR-EXA-002: Continue stays disabled when only Year(s) is set
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-EXA-001
**Automatable**: Yes

**Preconditions**: The "Export" dialog is open for a variant (office 1604).

**Steps**:
1. Set Year(s) = 2026, leave Currency unset
2. Read the Continue button state

**Expected**: Continue remains disabled with only Year(s) selected (both fields are required).
**Data**: office=1604, years=2026
**Notes**: NM-2264 gate half-state, live-verified 2026-07-07.

---

## TC-CPR-EXA-003: Continue stays disabled when only Currency is set
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-EXA-001
**Automatable**: Yes

**Preconditions**: The "Export" dialog is open for a variant (office 1604).

**Steps**:
1. Set Currency = USD, leave Year(s) unset
2. Read the Continue button state

**Expected**: Continue remains disabled with only Currency selected (both fields are required).
**Data**: office=1604, currency=USD
**Notes**: NM-2264 gate half-state, live-verified 2026-07-07.

---

## TC-CPR-EXA-004: Continue enables when BOTH Year(s) and Currency are set
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-EXA-001
**Automatable**: Yes

**Preconditions**: The "Export" dialog is open for a variant (office 1604).

**Steps**:
1. Set Year(s) = 2026 and Currency = USD
2. Read the Continue button state

**Expected**: Continue becomes enabled only when both Year(s) and Currency are set.
**Data**: office=1604, years=2026, currency=USD
**Notes**: NM-2264 gate satisfied, live-verified 2026-07-07.

---

## TC-CPR-EXA-005: Cancel dismisses the "Export" dialog without firing any export request
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-EXA-001
**Automatable**: Yes

**Preconditions**: The "Export" dialog is open for a variant (office 1604).

**Steps**:
1. Arm a listener for any `pricing-export` request
2. Set Year(s) + Currency, then click Cancel
3. Confirm the dialog closes and no `pricing-export` request fired

**Expected**: Cancel closes the dialog and NO `pricing-export` request is sent (the gate is abandoned cleanly).
**Data**: office=1604
**Notes**: NM-2264; asserts the negative (no request) via a race between the request listener and dialog-closed.

---

## TC-CPR-EXA-006: Year(s) minimum — a single year is accepted and enables Continue
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-EXA-001
**Automatable**: Yes

**Preconditions**: The "Export" dialog is open for a variant (office 1604).

**Steps**:
1. Select exactly 1 year (2026) and Currency = USD
2. Read the Continue button state

**Expected**: A single-year selection is accepted (minimum of the 1–3 range) and Continue enables with Currency set.
**Data**: office=1604, years=2026, currency=USD
**Notes**: NM-2264 boundary (min), live-verified 2026-07-07.

---

## TC-CPR-EXA-007: Year(s) maximum is 3 — a 4th year cannot be added and no 4-year export fires
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-EXA-001
**Automatable**: Yes

**Preconditions**: The "Export" dialog is open for a variant (office 1604).

**Steps**:
1. Select 3 years (2026, 2027, 2028); confirm all 3 are selected
2. Attempt to select a 4th year (2025); confirm the selection stays at 3 (the 4th is refused)
3. Set Currency = USD and Continue; inspect the export request `years` param

**Expected**: The Year(s) combobox caps at 3 — a 4th year cannot be added (selection stays at exactly 3 years), and the fired `pricing-export` request carries exactly the 3 chosen years, never 4.
**Data**: office=1604, years=2026,2027,2028 (+attempted 2025), currency=USD
**Notes**: NM-2264 negative boundary (R6), live-verified 2026-07-07 — the app silently refuses the 4th year (no aria-disabled; the pick simply does not register).

---

## TC-CPR-EXA-008: Currency options present — USD, CAD, MXN
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-EXA-001
**Automatable**: Yes

**Preconditions**: The "Export" dialog is open for a variant (office 1604).

**Steps**:
1. Open the Currency combobox
2. Read the options

**Expected**: The Currency combobox offers USD, CAD, and MXN (each selectable).
**Data**: office=1604
**Notes**: NM-2264, live-verified 2026-07-07.

---

## TC-CPR-EXA-009: Each Currency maps to the correct currencyId on Continue
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |
**Surface_Family**: combination (QUICK)

**Depends_On**: TC-CPR-EXA-008
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. For each currency (USD, CAD, MXN): open Export → All Equipment Pricing → Year(s) = 2026 → Currency → Continue
2. Inspect each fired `pricing-export` request's `currencyId` param

**Expected**: Each currency sends its own distinct currency identifier on Continue — USD, CAD, and MXN each map to a different value (USD=1, CAD=2, MXN=3), confirmed against the live export request; the currency chosen in the gate maps one-to-one to the request.
**Data**: office=1604, years=2026, currencies=USD/CAD/MXN
**Notes**: NM-2264 currencyId mapping (R7) — CAD/MXN captured LIVE, never hardcoded from memory (LR-022). Combination QUICK: one variant × one Year × each Currency proves the multi-parameter gate.

---

## TC-CPR-EXA-010: All Equipment Pricing — real download round-trip + file verification
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |
**Surface_Family**: result-fidelity (QUICK)

**Depends_On**: TC-CPR-EXA-004
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Export → All Equipment Pricing → Year(s) = 2026 → Currency = USD → Continue; capture the real download + the backing request/response
2. Assert the filename, HTTP 200, the matrix header (Product Group Id, Product Group Name, then pricebook columns), a non-empty file, and the network params
3. Assert the exported file has no duplicate product-group rows (each Product Group Id appears once)

**Expected**: A real `EquipmentPricings.csv` downloads; the backing request returns HTTP 200 for the equipment standard-pricing scope; the CSV parses with the two base columns + pricebook columns and at least one product-group row; and every Product Group Id is unique (no duplicate product-group rows).
**Data**: office=1604, years=2026, currency=USD
**Notes**: NM-2264 round-trip via the reused NM-2262 download helper; guards the duplicate-product-group defects NM-1997/1998; status captured as a concrete number (throws if the response is not captured — no null escape).

---

## TC-CPR-EXA-011: All Labor Pricing — real download round-trip + file verification
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |
**Surface_Family**: result-fidelity (QUICK)

**Depends_On**: TC-CPR-EXA-004
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Export → All Labor Pricing → Year(s) = 2026 → Currency = USD → Continue; capture the download + request/response
2. Assert filename `LaborPricings.csv`, HTTP 200 for the labor standard-pricing scope, the matrix header, a non-empty file with at least one labor product-group row
3. Assert the exported file has no duplicate product-group rows (each Product Group Id appears once)

**Expected**: A real `LaborPricings.csv` downloads (a different, labor-scoped product-group population than Equipment); the backing request returns HTTP 200 for the labor standard-pricing scope; the file parses with at least one row; and every Product Group Id is unique.
**Data**: office=1604, years=2026, currency=USD
**Notes**: NM-2264 round-trip; guards the duplicate-product-group defect NM-1998; the Labor variant carries its own product groups + pricebook columns (proven distinct from Equipment in TC-CPR-EXA-015).

---

## TC-CPR-EXA-012: All Equipment Max Discount — round-trip + missing-pricebook and stray-labor-row checks
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |
**Surface_Family**: result-fidelity (QUICK)

**Depends_On**: TC-CPR-EXA-010

**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Download the sibling Equipment Pricing export (USD, 2026) to derive the active-pricebook set (its pricebook column headers) and download the Labor Pricing export (USD, 2026) to derive the labor-PG-Id set
2. Export → All Equipment Max Discount → Year(s) = 2026 → Currency = USD → Continue; capture the download + request/response
3. Assert filename `EquipmentMaxDiscounts.csv`, HTTP 200 for the equipment max-discount scope, unique Product Group Ids, that every pricebook column from the sibling Equipment Pricing export is present, and that ZERO rows carry a labor Product Group Id

**Expected**: `EquipmentMaxDiscounts.csv` downloads (HTTP 200 for the max-discount scope); every active pricebook column from the sibling Equipment Pricing export is present (no active pricebook silently missing); and no row's Product Group Id belongs to the labor set (no stray labor product groups on the equipment-scoped max-discount export).
**Data**: office=1604, years=2026, currency=USD
**Notes**: Guards defect NM-2005 (missing pricebooks + stray labor product groups on the max-discount export). Oracle derived LIVE from companion exports (sibling Pricing for the pricebook set; Labor variant for the labor product-group set) — adapted to the real wide-matrix file format (pricebooks = columns, product groups = rows), not the normalized-tuple form the plan body assumed.

---

## TC-CPR-EXA-013: All Labor Max Discount — round-trip + labor-scope + no-duplicate regression
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |
**Surface_Family**: result-fidelity (QUICK)

**Depends_On**: TC-CPR-EXA-011

**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Download the sibling Labor Pricing export (USD, 2026) to derive its pricebook-column set
2. Export → All Labor Max Discount → Year(s) = 2026 → Currency = USD → Continue; capture the download + request/response
3. Assert filename `LaborMaxDiscounts.csv`, HTTP 200 for the labor max-discount scope, unique Product Group Ids, and that every pricebook column from the sibling Labor Pricing export is present

**Expected**: `LaborMaxDiscounts.csv` downloads (HTTP 200 for the labor max-discount scope); Product Group Ids are unique; and every pricebook column from the sibling Labor Pricing export is present (no active labor pricebook silently missing from the labor max-discount export).
**Data**: office=1604, years=2026, currency=USD
**Notes**: The labor scope has no equipment product groups by construction, so the "zero stray labor rows" cross-check is Equipment-variant-specific (TC-CPR-EXA-012); this labor case guards the pricebook-completeness half.

---

## TC-CPR-EXA-014: Combination DEEP — bounded pairwise variant × Year × Currency
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |
**Surface_Family**: combination (DEEP)

**Depends_On**: TC-CPR-EXA-009

**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Run a bounded pairwise covering array over {4 variants} × {1 year / 3 years} × {USD / CAD / MXN} (not the full cartesian product)
2. For each combo: open the variant, set the years + currency, Continue, and inspect the fired request params

**Expected**: Every pairwise combo fires `pricing-export` with the correct `isLabor`/`isMaxDiscount` (per variant), `currencyId` (per currency), and `years` (per year selection), returning 200 — no combination breaks the parameter mapping.
**Data**: office=1604; pairwise set across variants × {2026 | 2026,2027,2028} × {USD,CAD,MXN}
**Notes**: NM-2264 Axis-2 combination DEEP — pairwise keeps the matrix bounded (the Case-Generation Standard combinatorial method) instead of 4×2×3 full cartesian.

---

## TC-CPR-EXA-015: Result-fidelity DEEP — each variant's file reflects its scope
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |
**Surface_Family**: result-fidelity (DEEP)

**Depends_On**: TC-CPR-EXA-010

**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Download all four variants (USD, 2026) and compare their contents
2. Assert Equipment vs Labor carry DIFFERENT product-group populations (disjoint Product Group Id sets) and different pricebook columns
3. Assert Pricing vs Max Discount share the same matrix structure for a given scope, and rely on the network `isMaxDiscount` param to distinguish them (do NOT assert a false structural difference where the structure is identical)

**Expected**: Equipment and Labor exports are genuinely different scopes (disjoint product groups); Pricing and Max Discount exports for the same scope share the same column structure and are distinguished by the `isMaxDiscount` network param, not by column shape — the file content faithfully reflects each variant's `isLabor`/`isMaxDiscount` scope.
**Data**: office=1604, years=2026, currency=USD
**Notes**: NM-2264 Axis-2 result-fidelity DEEP; honors the plan's rule "assert on the network param when the structure is identical, never assert a false structural difference."

---

## TC-CPR-EXA-016: Empty/minimal-scope DEEP — a currency with no pricebooks yields a valid header-only-style CSV
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |
**Surface_Family**: empty-vol (DEEP)

**Depends_On**: TC-CPR-EXA-010

**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Download All Equipment Pricing at Currency = CAD, Year(s) = 2026 (the live empty-scope oracle — office 1604 has no CAD equipment pricebooks) and the USD sibling for comparison
2. Assert the CAD file is a well-formed CSV whose header carries the two base columns (Product Group Id, Product Group Name), with strictly fewer pricebook columns than the USD export

**Expected**: A currency with no pricebooks in scope still produces a valid CSV — the two base columns are present and there are strictly fewer pricebook columns than the USD export (CAD is the minimal/empty end of the currency-scoped volume) — never a zero-byte or malformed file.
**Data**: office=1604, years=2026, currencies=CAD (vs USD)
**Notes**: NM-2264 Axis-2 empty-vol DEEP satisfied with a LIVE oracle (R4) rather than a data-blocked stub — the CAD equipment scope carried 0 pricebook columns on 2026-07-07 while USD carried ~79. Asserts "fewer than USD" (robust to a CAD pricebook being added later) rather than an exact zero.

---

## TC-CPR-EXA-017: Export menu dismisses on outside-click
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Open the Export dropdown (menu confirmed open — it lists the export variants)
2. Click outside the menu (on the page heading) -> the menu closes

**Expected**: The Export dropdown menu dismisses on an outside-click (standard dropdown behavior). The per-variant Year(s)+Currency dialog contract is covered by TC-CPR-EXA-001..009.
**Data**: office=1604

---

## Surface-Behavior Coverage (NM-2264 Export ▾ All) — Axis-2 disposition

Export ▾ All is a 4-variant file-I/O flow behind a Year(s)+Currency precondition gate. The exported file (a wide product-group × pricebook matrix) plus the request params are the dual oracle. Disposition of the 7 surface/behavior families:

- **behavior-cases: result-fidelity, combination, empty-vol**
  - `result-fidelity` — QUICK: TC-CPR-EXA-010/011/012/013 (each variant's real file non-empty + expected matrix header + variant params + NM-1997/1998/2005 regression). DEEP: TC-CPR-EXA-015 (Equipment≠Labor scope; Pricing vs Max Discount distinguished by the network param where the structure is identical).
  - `combination` — QUICK: TC-CPR-EXA-009 (one variant × one Year × each Currency → correct currencyId params). DEEP: TC-CPR-EXA-014 (bounded pairwise across {4 variants} × {Year 1/3} × {USD/CAD/MXN}).
  - `empty-vol` — QUICK: TC-CPR-EXA-010 (a non-empty file per variant). DEEP: TC-CPR-EXA-016 (CAD equipment scope = live empty/minimal-scope oracle — valid CSV, base columns, strictly fewer pricebook columns than USD; a live oracle per R4, not a data-blocked stub).
- `out-of-scope:pagination=Export ▾ emits a full-dataset file per variant with no rows-per-page control on the action; grid paging does not affect the export`
- `out-of-scope:sorting=the export GET emits a server-ordered file; grid sort is not a request parameter, so there is no sort behavior on the export surface to assert`
- `out-of-scope:render-state=the Export ▾ surface is a precondition dialog + action, not a cell-rendering grid; combobox option rendering is an Axis-1 dropdown field case (TC-CPR-EXA-008), not a render-state link/boolean cell`
- `out-of-scope:persistence=the Export ▾ Year+Currency dialog is modal and resets on each open; there is no persisted surface state to survive reload`

---
