# Corporate Pricing — Export ▾ All Test Plan (NM-2264)

**Module**: corporate-pricing | **Submodule**: export_all | **Total**: 16 | **Updated**: 2026-07-08

> Shared toolbar surface reference (live model, selector mapping, page-object contract) is now consolidated per-ticket; the toolbar_io submodule was dissolved and its coverage folded into the delivered tickets.

---

## Scope

**Grid Export ▾ real round-trip — NOW IN SCOPE (NM-2264, added 2026-07-07)**: the four `Export ▾` variants now gate behind a shared **Year(s)(1–3) + Currency** dialog (Continue disabled until both set); on Continue the export fires `pricing-export?isLabor&isMaxDiscount&currencyId&locale&years`. The former trigger-only coverage is corrected to that dialog contract; TC-CPR-EXA-001..016 add the dialog behavior, boundary values, the live currencyId map (USD=1/CAD=2/MXN=3), the real per-variant download round-trip (reusing the NM-2262 helper), and the Axis-2 combination/result-fidelity/empty-vol DEEP band. The export file-content defects NM-1997/1998/2005 are now covered by the real downloads (TC-CPR-EXA-010..013).

## Export ▾ All — dialog contract, boundaries, currency mapping, and real round-trip (NM-2264)

> The four Export ▾ variants gate behind a shared Year(s)+Currency dialog; on Continue the export fires and downloads a wide product-group × pricebook matrix CSV. The file + the request params are the dual oracle. Axis-2 surface-family disposition lives in the test-cases file.

## Scenario: TC-CPR-EXA-001 - Each Export variant opens the shared "Export" dialog
1. Step: For each of the 4 variants, open Export ▾ and click it, expected: an "Export" dialog with Year(s)+Currency comboboxes + Cancel/Continue/Close, Continue disabled at open

## Scenario: TC-CPR-EXA-002 - Continue disabled with only Year(s) set
1. Step: Set Year(s)=2026, leave Currency unset, expected: Continue stays disabled

## Scenario: TC-CPR-EXA-003 - Continue disabled with only Currency set
1. Step: Set Currency=USD, leave Year(s) unset, expected: Continue stays disabled

## Scenario: TC-CPR-EXA-004 - Continue enables when both Year(s) + Currency set
1. Step: Set Year(s)=2026 + Currency=USD, expected: Continue enables

## Scenario: TC-CPR-EXA-005 - Cancel dismisses without firing an export request
1. Step: Arm a pricing-export listener, set fields, click Cancel, expected: dialog closes and no pricing-export request fired

## Scenario: TC-CPR-EXA-006 - Year(s) minimum (1 year) accepted
1. Step: Select 1 year (2026) + Currency=USD, expected: accepted, Continue enables

## Scenario: TC-CPR-EXA-007 - Year(s) maximum is 3; a 4th cannot be added
1. Step: Select 3 years (2026,2027,2028), expected: all 3 selected
2. Step: Attempt a 4th (2025), expected: selection stays at 3
3. Step: Set Currency=USD + Continue, expected: request `years` carries exactly 3 years, never 4

## Scenario: TC-CPR-EXA-008 - Currency options present (USD/CAD/MXN)
1. Step: Open the Currency combobox, expected: USD, CAD, MXN offered

## Scenario: TC-CPR-EXA-009 - Each Currency maps to the correct currencyId
1. Step: For USD/CAD/MXN, run Export → All Equipment Pricing → year 2026 → currency → Continue, expected: currencyId=1 (USD) / 2 (CAD) / 3 (MXN) in the request

## Scenario: TC-CPR-EXA-010 - All Equipment Pricing real round-trip + NM-1997/1998
1. Step: Export → All Equipment Pricing → 2026 → USD → Continue, capture download + response, expected: EquipmentPricings.csv, 200, `isLabor=false&isMaxDiscount=false`, matrix header, ≥1 row, unique Product Group Ids

## Scenario: TC-CPR-EXA-011 - All Labor Pricing real round-trip + NM-1998
1. Step: Export → All Labor Pricing → 2026 → USD → Continue, expected: LaborPricings.csv, 200, `isLabor=true&isMaxDiscount=false`, ≥1 labor row, unique Product Group Ids

## Scenario: TC-CPR-EXA-012 - All Equipment Max Discount round-trip + NM-2005
1. Step: Derive the active-pricebook set (sibling Equipment Pricing columns) + labor-PG set (Labor export rows)
2. Step: Export → All Equipment Max Discount → 2026 → USD → Continue, expected: EquipmentMaxDiscounts.csv, 200, `isMaxDiscount=true`, every sibling pricebook column present, ZERO labor-PG rows, unique Product Group Ids

## Scenario: TC-CPR-EXA-013 - All Labor Max Discount round-trip + pricebook completeness
1. Step: Derive the sibling Labor Pricing pricebook set
2. Step: Export → All Labor Max Discount → 2026 → USD → Continue, expected: LaborMaxDiscounts.csv, 200, `isLabor=true&isMaxDiscount=true`, every sibling Labor pricebook column present, unique Product Group Ids

## Scenario: TC-CPR-EXA-014 - Combination DEEP (bounded pairwise)
1. Step: Run a pairwise covering array over {4 variants} × {1 year / 3 years} × {USD/CAD/MXN}, expected: each combo fires the correct isLabor/isMaxDiscount/currencyId/years params, 200

## Scenario: TC-CPR-EXA-015 - Result-fidelity DEEP (per-variant scope)
1. Step: Download all 4 variants (USD, 2026), expected: Equipment vs Labor carry disjoint product groups + different pricebook columns; Pricing vs Max Discount share the structure and are distinguished by the isMaxDiscount param (no false structural assertion)

## Scenario: TC-CPR-EXA-016 - Empty/minimal-scope DEEP (CAD equipment)
1. Step: Download All Equipment Pricing at CAD + the USD sibling, expected: the CAD file is a valid CSV with the two base columns and strictly fewer pricebook columns than USD (the live empty-scope oracle) — never a zero-byte/malformed file


## Coverage Index

- TC-CPR-EXA-001 — Each Export variant opens the shared "Export" Year(s)+Currency dialog
- TC-CPR-EXA-002 — Continue stays disabled when only Year(s) is set
- TC-CPR-EXA-003 — Continue stays disabled when only Currency is set
- TC-CPR-EXA-004 — Continue enables when BOTH Year(s) and Currency are set
- TC-CPR-EXA-005 — Cancel dismisses the "Export" dialog without firing any export request
- TC-CPR-EXA-006 — Year(s) minimum — a single year is accepted and enables Continue
- TC-CPR-EXA-007 — Year(s) maximum is 3 — a 4th year cannot be added and no 4-year export fires
- TC-CPR-EXA-008 — Currency options present — USD, CAD, MXN
- TC-CPR-EXA-009 — Each Currency maps to the correct currencyId on Continue
- TC-CPR-EXA-010 — All Equipment Pricing — real download round-trip + file verification
- TC-CPR-EXA-011 — All Labor Pricing — real download round-trip + file verification
- TC-CPR-EXA-012 — All Equipment Max Discount — round-trip + NM-2005 regression (pricebooks present, zero labor rows)
- TC-CPR-EXA-013 — All Labor Max Discount — round-trip + labor-scope + no-duplicate regression
- TC-CPR-EXA-014 — Combination DEEP — bounded pairwise variant × Year × Currency
- TC-CPR-EXA-015 — Result-fidelity DEEP — each variant's file reflects its scope
- TC-CPR-EXA-016 — Empty/minimal-scope DEEP — a currency with no pricebooks yields a valid header-only-style CSV
