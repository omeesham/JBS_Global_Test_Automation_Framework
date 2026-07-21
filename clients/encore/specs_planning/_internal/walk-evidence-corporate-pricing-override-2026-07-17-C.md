# Walk Evidence — Corporate Pricing / Product Group Override
**Date**: 2026-07-17
**Worker**: EA1 (T2 council-worker)
**Browser Tool**: playwright-cli (headless, saved state: encore-state.json)
**Auth state**: clients/encore/.auth/encore-state.json
**Base URL**: https://cloudapps-e2e.encoreglobal.com/navigator/
**Page**: /pg-override (Corporate Pricing → Product Group Override)
**Scope**: READ-ONLY — zero mutations, zero saves, zero imports

---

## Job 1 — 1604 Duplicate-Key Retest

### Order (a): Direct navigation → select 1604 via dialog

**Timestamp**: 2026-07-17T15:29 UTC  
**Repro path**: `state-load encore-state.json` → `goto /locations/1604/settings/corporate-pricing/pg-override` → click "Select a location" → search "1604" → check row → click Select  
**Failing request**:  
```
GET https://cloudapps-e2e.encoreglobal.com/navigator/api/location/corporate-price-pg-override?localOfficeId=1604
→ 500
```
**Response body (verbatim)**:
```json
{"success":false,"validationErrors":{"exception":["An item with the same key has already been added. Key: 4543"]},"message":"An item with the same key has already been added. Key: 4543"}
```
**Console error**: `Failed to load resource: the server responded with a status of 500 () @ …corporate-price-pg-override?localOfficeId=1604`  
**UI state**: Left panel shows "1604 - Parker Palm Springs" selected; grid shows "0 items found" / "No results."  
**Verdict**: **REPRO** — HTTP 500, duplicate key 4543, identical to 2026-07-17 prior observation.

### Order (b): NM-2011 repro order — 1105 first → switch to 1604

**Timestamp**: 2026-07-17T15:33 UTC  
**Repro path**: fresh page → dialog → 1105 → Select (200 OK, 9 Equipment rows confirmed) → Change Local Office → 1604 → Select  
**1105 confirms healthy**:  
```
GET /api/location/corporate-price-pg-override?localOfficeId=1105 → 200
Grid: "9 items found" (Product Groups 272, 274, 275, 276, 279, 300, 366, 1482, 1484)
```
**Switch to 1604 fails**:  
```
GET /api/location/corporate-price-pg-override?localOfficeId=1604 → 500
Body: {"success":false,"validationErrors":{"exception":["An item with the same key has already been added. Key: 4543"]},"message":"An item with the same key has already been added. Key: 4543"}
```
**UI state**: Grid shows "0 items found" / "No results."  
**Verdict**: **REPRO** — NM-2011 order also reproduces. Error is at server level (key 4543), not order-dependent.

**SUMMARY JOB 1**: Both repro orders REPRO. The API `GET /api/location/corporate-price-pg-override?localOfficeId=1604` ALWAYS returns HTTP 500 with body `{"message":"An item with the same key has already been added. Key: 4543"}`. NM-2011 "could not recreate" is incorrect — bug is live as of 2026-07-17.

---

## Job 2 — Office 1117 Census

**Source**: Disk-only salvage from tee files at `raw-EA1/job2-*`. No re-walk of 1117 was performed.

### Equipment Tab

| Metric | Value | Source tee file |
|---|---|---|
| API response | `{"success":true,"data":[]}` | job2-1117-api-response.verify.txt |
| DOM rows (inferred from API data:[]) | 0 | job2-1117-api-response.verify.txt |
| Footer total (inferred from data:[]) | "0 items found" | job2-1117-api-response.verify.txt |
| Inactive-row count | 0 (no rows) | job2-1117-api-response.verify.txt |
| Blank Override-Price count | 0 (no rows) | job2-1117-api-response.verify.txt |

**Note**: DOM row count and footer were NOT directly read from a snapshot. These are inferred from the API returning `data:[]`. The API GET `/api/location/corporate-price-pg-override?localOfficeId=1117` returned HTTP 200 with body `{"success":true,"data":[]}` (see job2-1117-api-response.verify.txt).

### Labor Tab

| Metric | Value | Source tee file |
|---|---|---|
| API call status | 200 OK | job2-1117-labor-network.verify.txt |
| API response body | NOT captured in tee files | — |
| Labor rows (confirmed via CSV cross-ref) | 0 | job2-export-crossref.verify.txt |
| Inactive-row count | 0 (confirmed by CSV) | job2-export-crossref.verify.txt |
| Blank Override-Price count | 0 (no rows) | job2-export-crossref.verify.txt |

**Note**: The Labor API call (`GET /api/location/corporate-price-pg-override?localOfficeId=1117&type=labor → 200`) was made but its response body was not captured in any tee file. However, the tenant-wide CSV export (`job2-export-crossref`) confirms `1117-rows:0`, which covers both Equipment (Is Labor=false) and Labor (Is Labor=true) rows.

### Currency Dropdown Options

| Options (from job2-1117-currency-options.verify.txt) |
|---|
| ALL |
| USD |
| CAD |
| MXN |

### Export Reconciliation

| Metric | Value | Source tee file |
|---|---|---|
| CSV export status | 200 | job2-1117-export-csv.verify.txt |
| CSV total rows (all offices) | 8,996 | job2-1117-export-csv.verify.txt |
| 1117 rows in CSV | 0 | job2-1117-export-csv.verify.txt |
| CSV headers (prefix) | `Location Id,Product Group Id,Product Group Name,Is Labor,Currency,Current Price,Override Price,...` | job2-1117-export-csv.verify.txt |
| Export filename | NOT RECOVERABLE (direct API eval, not UI-clicked download) | — |
| Cross-ref: 1105 rows | 11 | job2-export-crossref.verify.txt |
| Cross-ref: 1117 rows | 0 | job2-export-crossref.verify.txt |
| Cross-ref: 1606 rows | 7 | job2-export-crossref.verify.txt |

**Note on export endpoint**: The per-location export check (`GET /api/location/corporate-price-pg-override?localOfficeId=1117&export=true`) also returned `{"success":true,"data":[]}` with content-type `application/json` (job2-1117-export-check.verify.txt). The tenant-wide CSV export (`/api/location/corporate-price-pg-override/export?locale=en-US`) was used for reconciliation — it is confirmed tenant-wide (contains 1105, 1606, and other office rows).

### Fitness Verdict

**1117 is NOT a valid automation bed for populated-Labor + editable-cell cases.**

- Equipment rows: 0 (API `data:[]`)
- Labor rows: 0 (CSV cross-ref confirmed)
- The client claim "Equipment AND Labor populated" for 1117 is **CONTRADICTED** by this evidence.
- Comparison: 1105 has 11 rows; 1606 has 7 rows; 1117 has 0.

---

## Job 3 — Dialog Active-Checkbox Evidence Pack

**Browser Tool**: playwright-cli (headless, `encore-state.json` loaded via `state-load .auth\encore-state.json`)  
**Start office for walk**: 4107 (The Lodge at Spruce Peak) — healthy office  
**Dialog**: Change Local Office modal dialog (opened from Corporate Pricing → Product Group Override page)

### a. Active Checkbox Default State

| Attribute | Value | Source tee file |
|---|---|---|
| `data-state` | `unchecked` | job3b-active-initial-state.verify.txt |
| `aria-checked` | `false` | job3b-active-initial-state.verify.txt |

**Default: UNCHECKED** — when the dialog opens, the Active filter is OFF (all locations visible).  
**Screenshot** (dialog open, Active UNCHECKED): `job3b-screenshot-unchecked.png`  
Confirmed: dialog shows "All Locations → 1101, 1102, 1105, 1107, 1112..." with empty checkbox.

### b. Full Location Lists

**Current API state** (2026-07-17 this run):
- `POST /navigator/api/location/location-lookup` (default body) → 2,651 locations, `inactive-count:0`
- Source: `job3b-inactive-api-check.verify.txt`

**Previous run tee files** (same day, ~30 min earlier, from first EA1 run):
- Active UNCHECKED: 2,651 rows (`job3-active-unchecked-list.verify.txt`)
- Active CHECKED: 2,139 rows (`job3-active-checked-list.verify.txt`)
- Diff: +512 rows when unchecked (all 8500+ range, Canadian offices) → `job3-inactive-diff.txt` (sha256=deed9e76adf5d20cec3f54518d2f366bf0308ab128edfa5331bd7f2688020aee)
- Sample inactive: 8501 Quebec City, 8502 Calgary, 8503 Edmonton, 8504 Fredericton, 8505 Halifax, 8506 London, 8507 Canada SGA, 8508 Ottawa, 8509 Saskatoon, 8510 Toronto, 8511 Vancouver, 8512 Victoria, 8513 Winnipeg... (512 total)

**Discrepancy note**: This run's API returns `inactive-count:0` (all 2,651 have `active:true`). Prior run saw 512 inactive. Cause: data state may have changed between runs, or the dialog uses a different parameter structure than the direct fetch test. Not guessed — flagged in ASK.

### c. Network During Active Toggle

| Probe | Finding | Source tee file |
|---|---|---|
| BEFORE toggle | Last request: `POST /api/location/location-lookup => [200]` (dialog load) | job3b-pre-toggle-network.verify.txt |
| AFTER toggle | New `POST /api/location/location-lookup => [200]` fired | job3b-post-toggle-network.verify.txt |
| Previous run AFTER toggle | `POST /api/location/location-lookup => [200]` | job3-post-active-click-network.verify.txt |

**The toggle IS NOT silent** — it fires a new `location-lookup` request. The original ticket expected "no network call" — this REFUTES that assumption. Checkbox is functional.

### d. List Diff

| State | Count | Source |
|---|---|---|
| Active CHECKED (previous run) | 2,139 | job3-active-checked-list.verify.txt |
| Active UNCHECKED (previous run) | 2,651 | job3-active-unchecked-list.verify.txt |
| Inactive (diff) | 512 (8500+ Canadian offices) | job3-inactive-diff.txt |

### e. Search Interplay

**Screenshots**:
- `job3b-screenshot-unchecked-search11.png` — search "11", Active UNCHECKED; list filtered to 11xx offices (1101, 1102, 1105, 1107, 1112...) visible in viewport; "Current: 4107" shown
- `job3b-screenshot-checked-search11.png` — search auto-populated to "4107" when Active CHECKED; shows 1 result (current office 4107 selected)

**Search behavior**: Client-side filtering. No additional API call fired per keystroke (confirmed: no new location-lookup requests in network during search typing).

### f. LR-061 §C Positive Control

| Probe | State | Source tee file |
|---|---|---|
| BEFORE click | `data-state:unchecked aria-checked:false` | job3b-active-initial-state.verify.txt |
| AFTER click | `data-state:checked aria:true` | job3b-after-click-state.verify.txt |

**POSITIVE CONTROL CONFIRMED**: Checkbox state changed from `unchecked` → `checked`. The click primitive worked correctly. The checkbox IS interactive.

### Screenshots Summary

| File | State | Search |
|---|---|---|
| job3b-screenshot-unchecked.png | Active UNCHECKED (default) | None |
| job3b-screenshot-checked.png | Active CHECKED | None |
| job3b-screenshot-unchecked-search11.png | Active UNCHECKED | "11" |
| job3b-screenshot-checked-search11.png | Active CHECKED | "4107" (auto-populated) |

### Job 3 Verdict

1. **Active checkbox IS functional** — triggers `POST /api/location/location-lookup` when toggled (NOT silent/inert).
2. **Default state = UNCHECKED** (all offices visible).
3. **Previous run found 512 inactive offices** in 8500+ range; current API shows `inactive-count:0` (data state discrepancy, flagged in ASK).
4. **Search: client-side filtering** — no API call per keystroke; search works correctly.
5. **Original observation "no API call and no list change" was INCORRECT** — both occur on toggle.

---

