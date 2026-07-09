# Corporate Pricing — Loc Pricing Export Test Plan (NM-2262)

**Module**: corporate-pricing | **Submodule**: loc_pricing_export | **Total**: 7 | **Updated**: 2026-07-08

> Shared toolbar surface reference (live model, selector mapping, page-object contract) is now consolidated per-ticket; the toolbar_io submodule was dissolved and its coverage folded into the delivered tickets.

---

## Scope

**Real Loc Pricing Export round-trip — NOW IN SCOPE (NM-2262, added 2026-07-06)**: TC-CPR-LEX-001..007 capture the actual downloaded CSV via `waitForEvent('download')`, read it from the browser temp path (nothing lands in the repo), and verify the FILE itself — filename pattern, non-empty/parseable, exact header columns, data rows, value-format fidelity, and the download's own locale param. The exported file is an all-locations dataset (rows begin at office 1101), a different dataset from the on-screen strategy grid, so the file's own structure/content is the oracle — not a grid row-for-row diff.

## Loc Pricing Export — real file round-trip (NM-2262)

> The exported file is the oracle: an all-locations CSV (rows begin at office 1101), a different dataset from the on-screen strategy grid. The file's own structure/content is asserted, not a grid diff. File is read from the browser temp path — nothing lands in the repo. Surface-family disposition (Axis-2) lives in the test-cases file.

## Scenario: TC-CPR-LEX-001 - Loc Pricing Export downloads a real CSV file
1. Step: Click "Loc Pricing Export", wait for the download event, expected: real file downloads
2. Step: Read the suggested filename, expected: matches `LocationPricebooks_<YYYYMMDD>_<HHMMSS>UTC.csv`

## Scenario: TC-CPR-LEX-002 - Downloaded file is non-empty and parseable
1. Step: Download + read raw contents, expected: content non-empty, header row parses out

## Scenario: TC-CPR-LEX-003 - Downloaded CSV has the expected header columns + >=1 row
1. Step: Download + parse, expected: header row equals the 11 live-verified columns (exact set + order)
2. Step: Count data rows, expected: >= 1 data row

## Scenario: TC-CPR-LEX-004 - The download request carries the locale param
1. Step: Trigger the export, capture the request on the same click, expected: URL contains `location-export` + `locale=en-US`

## Scenario: TC-CPR-LEX-005 - A second consecutive export fires a fresh download
1. Step: Download once, then click again without reloading, expected: both filenames match; the second file is non-empty

## Scenario: TC-CPR-LEX-006 - Downloaded rows are well-formed, value-format faithful, and date-window consistent
1. Step: Download + parse (quote-aware), validate EVERY data row, expected: each row has the full column set; LocationNo numeric; Currency is a supported code (USD/CAD/MXN); boolean flags are 0/1; UseDate is 0/1; StartDate/EndDate are both empty when UseDate=0 and both populated when UseDate=1

## Scenario: TC-CPR-LEX-007 - Empty-dataset export yields a header-only valid CSV (data-blocked stub)
1. Step: On a zero-location-pricebook tenant (the export is tenant-wide, not office-scoped), download + parse, expected: headers present, zero data rows (not a zero-byte file) — Manual/skip until such a tenant is confirmed


## Coverage Index

- TC-CPR-LEX-001 — Loc Pricing Export downloads a real CSV file with the expected filename
- TC-CPR-LEX-002 — Downloaded Loc Pricing Export file is non-empty and parseable as CSV
- TC-CPR-LEX-003 — Downloaded CSV carries the expected header columns and at least one data row
- TC-CPR-LEX-004 — The Loc Pricing Export download request carries the locale param
- TC-CPR-LEX-005 — A second consecutive Loc Pricing Export fires a fresh download
- TC-CPR-LEX-006 — Downloaded CSV rows are well-formed, values match the column formats, and the date-window is internally consistent
- TC-CPR-LEX-007 — Empty-dataset Loc Pricing Export yields a header-only valid CSV
