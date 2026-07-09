# Corporate Pricing — Loc Pricing Export Test Cases (NM-2262)

**Module**: corporate-pricing | **Submodule**: loc_pricing_export | **Total**: 7 | **Updated**: 2026-07-08

> The REAL Loc Pricing Export download round-trip + downloaded-file verification — the file itself, beyond the network-only endpoint check. LEX-007 is a data-blocked empty-dataset stub (Manual until an empty-location-pricebook office is confirmed).

> Shared toolbar surface reference (MCP verification log, field inventory, validation rules, selector-mapping) is now consolidated per-ticket; the toolbar_io submodule was dissolved and its coverage folded into the delivered tickets.

---

## TC-CPR-LEX-001: Loc Pricing Export downloads a real CSV file with the expected filename
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Click "Loc Pricing Export" and wait for the browser download event to fire
2. Read the downloaded file's suggested filename

**Expected**: A real file download occurs; the filename matches `LocationPricebooks_<YYYYMMDD>_<HHMMSS>UTC.csv`.
**Data**: office=1604

---

## TC-CPR-LEX-002: Downloaded Loc Pricing Export file is non-empty and parseable as CSV
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes
**Surface_Family**: empty-vol (QUICK)

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Download the Loc Pricing Export file
2. Read its raw contents and parse the header row

**Expected**: The file is non-empty and a header row parses out (length > 0).
**Data**: office=1604

---

## TC-CPR-LEX-003: Downloaded CSV carries the expected header columns and at least one data row
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-LEX-002
**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Download the Loc Pricing Export file and parse the header + data rows
2. Compare the header row to the expected 11-column set/order; confirm >= 1 data row

**Expected**: The header row equals `LocationNo, PricingStrategy, PriceBook, Currency, IsInternal, IsLabor, IsAlternate, IsProduction, UseDate, StartDate, EndDate` (exact set + order — the file is the oracle) and the export has at least one data row.
**Data**: office=1604; expected columns = the 11 live-verified headers (2026-07-06)

---

## TC-CPR-LEX-004: The Loc Pricing Export download request carries the locale param
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Trigger the Loc Pricing Export and capture the export request on the SAME click that produces the download
2. Inspect the captured request URL

**Expected**: The download's own request URL contains `location-export` and `locale=en-US` (distinct from the separate network-only endpoint check; this asserts the locale on the request tied to the actual downloaded file).
**Data**: office=1604

---

## TC-CPR-LEX-005: A second consecutive Loc Pricing Export fires a fresh download
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes
**Surface_Family**: render-state (QUICK)

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Download the Loc Pricing Export once
2. Without reloading, click "Loc Pricing Export" again and capture the second download

**Expected**: A fresh download occurs on the second consecutive click; both filenames match the pattern and the second file is non-empty (no state residue blocks re-trigger).
**Data**: office=1604

---

## TC-CPR-LEX-006: Downloaded CSV rows are well-formed, values match the column formats, and the date-window is internally consistent
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-LEX-003
**Automatable**: Yes
**Surface_Family**: result-fidelity (DEEP)

**Preconditions**: On the Search screen with the grid loaded (office 1604).

**Steps**:
1. Download and parse the Loc Pricing Export (quote-aware CSV parse)
2. For EVERY data row (not a sample), verify the row has the full column set, LocationNo is numeric, the Currency is a supported code (USD/CAD/MXN), the boolean flags (IsInternal/IsLabor/IsAlternate/IsProduction) are 0/1, UseDate is 0/1, and the date-window columns (StartDate/EndDate) are both empty when UseDate=0 and both populated when UseDate=1

**Expected**: EVERY data row (all ~38k) has the full 11 columns, a numeric LocationNo, a supported Currency (USD/CAD/MXN), 0/1 boolean flags, a 0/1 UseDate, and a date-window that is empty exactly when UseDate=0 and populated exactly when UseDate=1 — a malformed row anywhere in the file fails the test. (Value-format fidelity — the exported file is the oracle; the export is an all-locations dataset, not the on-screen strategy grid, so structure/format is asserted rather than a grid row-for-row diff. The exact date-string format is not yet assertable — no export sample with UseDate=1 has been observed; this is a documented data-blocked boundary, not a silent gap.)
**Data**: office=1604

---

## TC-CPR-LEX-007: Empty-dataset Loc Pricing Export yields a header-only valid CSV
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Functional |

**Depends_On**: none
**Automatable**: No (data-blocked)
**Surface_Family**: empty-vol (DEEP)

**Preconditions**: A tenant with zero location pricebooks anywhere (population path: the export is tenant-wide, not office-scoped — every observed download spans all locations starting at office 1101 — so an empty office is not sufficient; a whole zero-pricebook tenant is needed and none is available on the shared e2e server, so this is data-blocked and skipped until such a tenant exists).

**Steps**:
1. On a zero-location-pricebook tenant, download the Loc Pricing Export
2. Parse the header + data rows

**Expected**: The CSV is header-only-but-valid (headers present, zero data rows) — never a zero-byte file. (Un-skip once such a tenant is identified.)
**Data**: office=<zero-location-pricebook tenant, TBD>

---

## Surface-Behavior Coverage (NM-2262 Loc Pricing Export) — Axis-2 disposition

Loc Pricing Export is a file-I/O action (trigger -> full-dataset CSV download), not a query grid. The exported file is the oracle. Disposition of the 7 surface/behavior families:

- **behavior-cases: result-fidelity, empty-vol, render-state**
  - `result-fidelity` — QUICK: TC-CPR-LEX-001 (filename), TC-CPR-LEX-003 (exact header columns + >=1 row), TC-CPR-LEX-004 (locale on the download's own request). DEEP: TC-CPR-LEX-006 (row well-formedness + currency/boolean value-format fidelity + UseDate/StartDate/EndDate cross-field window consistency; exact date-string format data-blocked pending a UseDate=1 sample).
  - `empty-vol` — QUICK: TC-CPR-LEX-002 (non-empty file, comma-delimited, header parses). DEEP: TC-CPR-LEX-007 (empty-office header-only vs zero-byte — data-blocked stub; population path = a zero-location-pricebook TENANT, since the export is tenant-wide not office-scoped; classification = data-blocked; escalate if no such tenant is found).
  - `render-state` — QUICK: TC-CPR-LEX-005 (second consecutive download fires fresh, no state residue).
- `out-of-scope:pagination=Loc Pricing Export is a single full-dataset CSV GET with no rows-per-page control on the action; grid paging does not affect the exported file`
- `out-of-scope:sorting=the export endpoint emits a server-ordered CSV; grid sort is not a request parameter, so there is no sort behavior on the export surface to assert`
- `out-of-scope:combination=Loc Pricing Export is a parameterless full-dataset GET (locale only); active grid filter/sort/paginate state does not compose into the exported file`
- `out-of-scope:persistence=the export is a stateless read-only download with no persisted UI state (no sort/filter/page setting on the action) to survive reload`, column="Price Year"

---
