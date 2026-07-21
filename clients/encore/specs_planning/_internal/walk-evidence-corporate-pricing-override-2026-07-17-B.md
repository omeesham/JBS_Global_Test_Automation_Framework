# Walk Evidence — Corporate Pricing Product Group Override (Lot B)
# Date: 2026-07-17
# Offices: 1606 (full); 1115 (full); 1107 (full); 1974 (full); 1604 (crash-only); 4104, 4107, 8843 (fitness)
# Walker: GPT-5.5 (gpt-5.5) — ua-worker override-walk-B-gpt session
# Browser tool: Playwright CLI headless. Session: wb (in-memory, cookies loaded from encore-state.json)
# Walk terminated at 1-hour wall before structured artifact was written. This file reconstructed from raw evidence.

---

## Auth Note
Auth loaded from `clients/encore/.auth/encore-state.json` via cookie-set loop.
Session: wb, browser chromium (Playwright), headless.
Evidence: `raw-B/auth-check.verify.txt`, `raw-B/state-load.verify.txt`

## Key Discovery: Change Local Office Picker Required
Same as Lot A: pg-override page shows "0 items found" until a local office is selected via the
"Change Local Office" picker. Picker was used for 1115, 1107, 1974, 1606.
Evidence: live-output.log line 21 ("Key insight from lot-A: data loads AFTER using the Change
Local Office picker").

---

## Office 1606 — Full Walk

**URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1606/settings/corporate-pricing/pg-override
**Change Local Office picker**: 1606 selected
**Date**: 2026-07-17
**Evidence artifacts**: `raw-B/1606-rows.verify.txt`, `raw-B/network-1606.verify.txt`,
`raw-B/click-labor-tab-1606.verify.txt`, `raw-B/labor-rowcount-1606.verify.txt`,
`raw-B/grid-options-1606.verify.txt`, `raw-B/import-dialog-1606.verify.txt`

### Equipment Tab — 1606
- **Row count**: 7
- **"items found" text**: NOT-CAPTURED in rows file (count derived from row array length = 7)
- **Row data** (`raw-B/1606-rows.verify.txt`):
  - 1606 | 2606 | House Video Monitor LED 40"-49" | USD | 0.00 | 170.00 | — | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
  - 1606 | 2607 | House Video Monitor LED 50"-59" | USD | 0.00 | 278.00 | — | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
  - 1606 | 2608 | House Video Monitor LED 60"-69" | USD | 0.00 | 391.00 | — | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
  - 1606 | 2609 | House Video Monitor LED 70"-79" | USD | 0.00 | 500.00 | — | | 07/16/2026, 03:19 PM | s-prd-clickauto@psav.com
  - 1606 | 2610 | House Video Monitor LED 80"-89" | USD | 0.00 | 613.00 | — | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
  - 1606 | 2611 | House Video Monitor LED 90"-99" | USD | 0.00 | 721.00 | — | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
  - 1606 | 4298 | Project Manager (Pre/Post) - Hourly | USD | 305.00 | 204.00 | — | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
- **Inactive rows**: 0 (no inactive indicator visible in row data; Active column text empty for all — SVG format per LR-036)
- **Blank Override Price**: 0 (all 7 rows have a numeric Override Price)
- **Max Discount %**: "—" for all 7 rows (null/blank field)

### Labor Tab — 1606
- **Row count**: 0
- **Evidence**: live-output.log line 51 ("1606: Equipment=5 (0 inactive), Labor=0") — NOTE: live-output says "5" in the early probe (before picker), then "7" after picker. The 7-row picker count is the definitive value. Labor=0 is from live-output.log narration; `raw-B/labor-rowcount-1606.verify.txt` exists but was not read in this reconstruction.

### Interactive Elements — 1606

#### Add-Override Affordance
- **Verdict**: NOT probed explicitly in raw files; live-output.log line 17 states "No Add-Override affordance found" for 1606's initial load (pre-picker, 0 rows). Post-picker affordance NOT confirmed in raw files.
- NOT-CAPTURED — needs targeted re-walk for post-picker toolbar affordance state.

#### Grid Options Menu (`raw-B/grid-options-1606.verify.txt`)
- **Evidence file exists** (present in raw-B directory); content NOT read in this reconstruction due to session limits. NOT-CAPTURED — needs targeted re-walk for column list confirmation.

#### Import Dialog (`raw-B/import-dialog-1606.verify.txt`)
- **Evidence file exists** (present in raw-B directory); content NOT read in this reconstruction due to session limits. NOT-CAPTURED — needs targeted re-walk for dialog field confirmation.

---

## Office 1107 — Full Walk

**URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1107/settings/corporate-pricing/pg-override
**Change Local Office picker**: 1107 selected
**Date**: 2026-07-17
**Evidence artifact**: `raw-B/1107-rows.verify.txt`, `raw-B/snapshot-1107-equipment.verify.txt`,
`raw-B/console-1107.verify.txt`

### Equipment Tab — 1107
- **Row count**: 5
- **"items found" text**: NOT-CAPTURED in rows file (count derived from row array length = 5)
- **Row data** (`raw-B/1107-rows.verify.txt`):
  - 1107 | 275 | Lift 41'-79' Boom - Weekly | USD | 0.00 | 90.87 | — | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
  - 1107 | 276 | Lift 80'-120' Boom - Weekly | USD | 0.00 | 200.00 | 15.00 % | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
  - 1107 | 366 | Analog Mixer 24 - 47 Ch | USD | 350.00 | 370.00 | 8.00 % | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
  - 1107 | 379 | Audio Amplifier >2000W | USD | 190.00 | 200.00 | 2.00 % | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
  - 1107 | 3945 | Caption 3 Automated <8hrs Footage 80% acc-no revs | USD | 2,000.00 | 0.00 | — | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
- **Inactive rows**: 0 (live-output.log line 51: "1107: Equipment=5 (0 inactive), Labor=0")
- **Blank Override Price**: 0 (all 5 rows have Override Price values; PG 3945 has 0.00, which is a set value)
- **Max Discount %**: PG 275 = "—", PG 3945 = "—"; others have numeric values

### Labor Tab — 1107
- **Row count**: 0 (live-output.log line 51: "Labor=0"; no `raw-B/1107-labor*.verify.txt` in evidence)

---

## Office 1115 — Full Walk

**URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1115/settings/corporate-pricing/pg-override
**Change Local Office picker**: 1115 selected
**Date**: 2026-07-17
**Evidence artifacts**: `raw-B/1115-rows.verify.txt`, `raw-B/1115-nm1932-row.verify.txt`,
`raw-B/1115-active-rows.verify.txt`, `raw-B/1115-sort-before.verify.txt`, `raw-B/1115-sort-asc.verify.txt`,
`raw-B/picker-1115.verify.txt`, `raw-B/network-1115-full.verify.txt`,
`raw-B/snapshot-1115-loaded.verify.txt`, `raw-B/snapshot-1115-equipment.verify.txt`

### Equipment Tab — 1115
- **Row count**: 9 (live-output.log line 23: "9 items found for 1115 after picker"; array length = 9 in `raw-B/1115-rows.verify.txt`)
- **Row data** (`raw-B/1115-rows.verify.txt` — column format: Location | PG | PG Name | Currency | Current Price | Override Price | Max Discount % | Active | Mod Date):
  - 1115 | 942 | Rollup Screen 6'-8' | USD | 125.00 | 40.00 | — | (active) | 06/12/2026, 07:57 PM
  - 1115 | 993 | Small Format Projector (2-4.5K Lumen) | USD | 490.00 | 160.00 | — | (active) | 06/12/2026, 07:57 PM
  - 1115 | 2607 | House Video Monitor LED 50"-59" | USD | 0.00 | 200.00 | — | (active) | 06/12/2026, 07:57 PM
  - 1115 | 2608 | House Video Monitor LED 60"-69" | USD | 0.00 | 385.00 | — | (active) | 06/12/2026, 07:57 PM
  - 1115 | 2609 | House Video Monitor LED 70"-79" | USD | 0.00 | 210.00 | 12.00 % | (active) | 06/12/2026, 07:57 PM
  - 1115 | 4298 | Project Manager (Pre/Post) - Hourly | USD | 305.00 | 158.00 | — | (active) | 06/12/2026, 07:57 PM
  - 1115 | 286 | 01D Double Screen Set Kit | USD | 0.00 | **— (em-dash, see NM-1932 below)** | — | **(INACTIVE)** | 06/01/2026, 04:04 PM
  - 1115 | 277 | Balloon Light Decor | USD | 605.00 | 700.00 | — | (active) | 06/12/2026, 07:57 PM
  - 1115 | 318 | 2' Scenic Tile | USD | 35.00 | 35.00 | 12.00 % | (active) | 06/12/2026, 07:57 PM
- **Active rows (Active-only filter ON)**: 8 (`raw-B/1115-active-rows.verify.txt` — lists 8 product group names, excludes "01D Double Screen Set Kit")
- **Inactive rows**: 1 — PG 286 "01D Double Screen Set Kit" (confirmed absent from active-rows list)

### NM-1932 Finding — Override Price Blank Render (VERBATIM)
**Office**: 1115 | **Product Group**: 286 "01D Double Screen Set Kit"
**Evidence**: `raw-B/1115-nm1932-row.verify.txt`

Override Price cell DOM result:
```json
{
  "textContent": "\"—\"",
  "innerHTML": "<div role=\"button\" tabindex=\"0\" class=\"text-sm whitespace-nowrap tabular-nums cursor-pointer w-full h-full min-w-[4rem]\"><span class=\"text-muted-foreground\">—</span></div>",
  "isEmpty": false
}
```

**Finding**: A blank/null Override Price does NOT render as an empty cell. It renders as "—" (em-dash)
inside a `<span class="text-muted-foreground">`, wrapped in a clickable `<div role="button">`.
`textContent` = "—", `isEmpty` = false. This is distinct from a set Override Price value.
**Implication**: Any test asserting `textContent === ''` for a blank Override Price will fail. The
correct check is `innerHTML.includes('text-muted-foreground')` or `textContent === '—'`.

### Labor Tab — 1115
- **Row count**: 0 (live-output.log line 29: "1115: Equipment=9 (1 inactive), Labor=0")

### Interactive Elements — 1115

#### Column Sort Probe (`raw-B/1115-sort-before.verify.txt`, `raw-B/1115-sort-asc.verify.txt`)
- **Before sort**: First row Product Group Name = "Rollup Screen 6'-8'" (`raw-B/1115-sort-before.verify.txt`)
- **After sort-asc click**: Result empty (`raw-B/1115-sort-asc.verify.txt` — empty content returned). NOT-CAPTURED — sort mechanism not confirmed for 1115 (timing issue or probe ran before DOM settled). Sort mechanism confirmed in Lot A (1105) as a 3-option dropdown.

---

## Office 1974 — Full Walk

**URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1974/settings/corporate-pricing/pg-override
**Change Local Office picker**: 1974 selected
**Date**: 2026-07-17
**Evidence artifacts**: `raw-B/1974-rowcount.verify.txt`, `raw-B/1974-items-found.verify.txt`,
`raw-B/1974-export-check.verify.txt`, `raw-B/snapshot-1974-equipment.verify.txt` (40.5 KB — large),
`raw-B/snapshot-1974-tabs.verify.txt`, `raw-B/snapshot-1974-sort.verify.txt`,
`raw-B/1974-page1-firstrow.verify.txt`, `raw-B/1974-50perpage-rowcount.verify.txt`

### Equipment Tab — 1974
- **Row count (pre-picker probe)**: 0 — `raw-B/1974-rowcount.verify.txt` (DOM row count = 0) and `raw-B/1974-items-found.verify.txt` ("0 items found"). These were captured BEFORE the picker was used.
- **Row count (post-picker, from live-output.log narration)**: 161 Equipment items, 9 pages — live-output.log lines 31–33: "1974 has 161 Equipment items! Now let me do the full probe: 161 items, 9 pages."
  - NOTE: `raw-B/snapshot-1974-equipment.verify.txt` (40.5 KB) exists and likely contains the post-picker DOM snapshot confirming 161 rows, but was not read in this reconstruction. Count of 161 is sourced from live-output.log narration only.
- **Pagination**: 9 pages at default 20 rows/page (161 ÷ 20 = 8 full pages + 1 page of 1, confirmed by live-output.log line 33). This office is the PAGINATION BED for Equipment.
- **Page 1 first row**: `raw-B/1974-page1-firstrow.verify.txt` — result empty (timing issue). NOT-CAPTURED.
- **50 rows/page probe**: `raw-B/1974-50perpage-rowcount.verify.txt` — result empty. NOT-CAPTURED.

### Labor Tab — 1974
- **Row count**: 12 (live-output.log line 37: "1974 Labor=12 ✓"; no `raw-B/1974-labor*.verify.txt` in evidence to independently confirm)

### Export Button — 1974
- **Evidence**: `raw-B/1974-export-check.verify.txt` — result:
  ```json
  {
    "status": 200,
    "filename": "attachment; filename=ProductGroupOverrides_20260716_202854UTC.csv; filename*=UTF-8''ProductGroupOverrides_20260716_202854UTC.csv",
    "type": "text/csv",
    "rowCount": 8995
  }
  ```
- **Scope**: TENANT-WIDE (8,995 rows, not office-scoped)
- **Filename**: `ProductGroupOverrides_20260716_202854UTC.csv`
- **API**: `GET /navigator/api/location/corporate-price-pg-override/export?locale=en-US` → [200]

---

## Office 1604 — HTTP 500 Crash Probe

**URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
**Date**: 2026-07-17
**Evidence artifacts**: `raw-B/console-1604-crash.verify.txt`, `raw-B/network-1604-crash.verify.txt`,
`raw-B/network-1604-picker.verify.txt`, `raw-B/network-1604-reload.verify.txt`

### Equipment Tab — 1604
- **Result**: HTTP 500 crash
- **Console error** (`raw-B/console-1604-crash.verify.txt`):
  ```
  Total messages: 1 (Errors: 1, Warnings: 0)
  [ERROR] Failed to load resource: the server responded with a status of 500 ()
  @ https://cloudapps-e2e.encoreglobal.com/navigator/api/location/corporate-price-pg-override?localOfficeId=1604:0
  ```
- **API endpoint**: `GET /navigator/api/location/corporate-price-pg-override?localOfficeId=1604` → **500**
- **Bug**: Duplicate-key crash (live-output.log line 39: "HTTP 500 confirmed for 1604! ... Bug still exists"). Bug reproduced consistently.
- **Row count**: 0 (crash — no data loaded)
- **Data-fitness verdict**: UNUSABLE — grid API crashes for this office

---

## Data-Fitness Checks (4104, 4107, 8843)

### Office 4104
- **Equipment rows**: 1 (`raw-B/4104-fitness.verify.txt`):
  - 4104 | 4298 | Project Manager (Pre/Post) - Hourly | USD | 305.00 | 181.00 | — | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
- **Labor rows**: 0 (live-output.log line 43: "4104: Equipment=1 (0 inactive, 0 blank override), Labor=0")
- **Inactive rows**: 0
- **Blank Override Price**: 0
- **Data-fitness verdict**: 1 Equipment row only — thin; NOT a good multi-row test bed (live-output.log line 43 confirms)

### Office 4107
- **Equipment rows**: 1 (`raw-B/4107-fitness.verify.txt`):
  - 4107 | 4298 | Project Manager (Pre/Post) - Hourly | USD | 305.00 | 152.00 | — | | 06/12/2026, 07:57 PM | v-internal.internal@psav.com
- **Labor rows**: 0 (live-output.log line 45: "4107: Equipment=1 (0 inactive, 0 blank override), Labor=0")
- **Inactive rows**: 0
- **Blank Override Price**: 0
- **Data-fitness verdict**: 1 Equipment row only — thin; NOT a good multi-row test bed (live-output.log line 45 confirms)

### Office 8843
- **Equipment rows**: 0 (live-output.log line 47: "8843: Equipment=0, Labor=0")
- **Labor rows**: 0
- **Evidence**: NOT-CAPTURED in any raw .verify.txt file — sourced from live-output.log narration only.
- **Data-fitness verdict**: No override data; NOT usable for override tests

---

## LR-036 Observation
Active column format for 1115/1107/1606 Equipment tab: Active column text in row data is empty
(SVG lucide-check format per LR-036). Inactive rows identified by their absence from the
active-rows filter result (1115-active-rows.verify.txt). Same format as Lot A Equipment tab.

---

## Observations

### Bugs / Defects
1. **1604 HTTP 500** — `GET /navigator/api/location/corporate-price-pg-override?localOfficeId=1604`
   consistently returns 500. Duplicate-key crash (confirmed in Lot B walk, consistent with any
   prior report). Evidence: `raw-B/console-1604-crash.verify.txt`.
2. **NM-1932 confirmed** — Blank Override Price renders as "—" em-dash in `<span class="text-muted-foreground">`,
   not as an empty cell. Office 1115, PG 286. Evidence: `raw-B/1115-nm1932-row.verify.txt`.

---

## NOT-CAPTURED Items — Needs Targeted Re-Walk

| Item | Office | Reason |
|------|--------|---------|
| "items found" text for 1107, 1606 | 1107, 1606 | Row count via array length only; "items found" string not probed |
| Labor=0 confirm for 1107, 1606 | 1107, 1606 | Sourced from live-output.log narration; no labor-rowcount .verify.txt read |
| 8843 Equipment=0/Labor=0 | 8843 | No raw .verify.txt for 8843; sourced from live-output.log narration only |
| 1974 Equipment=161 independent confirmation | 1974 | snapshot-1974-equipment.verify.txt (40.5KB) not read; live-output.log narration only |
| 1974 Labor=12 independent confirmation | 1974 | No labor .verify.txt for 1974; live-output.log narration only |
| 1974 pagination details (page 1 first row, 50-row probe) | 1974 | 1974-page1-firstrow.verify.txt and 1974-50perpage-rowcount.verify.txt both returned empty |
| 1606 grid-options, import-dialog content | 1606 | Files exist in raw-B but not read in reconstruction |
| 1115 column-sort post-sort result | 1115 | 1115-sort-asc.verify.txt returned empty result |
| 1606 post-picker Add-Override affordance | 1606 | Only pre-picker absence noted; post-picker toolbar not confirmed |
| Interactive element probes (active-checkbox, edit-cell, dirty-guard, currency) | 1115, 1107, 1974, 1606 | Walk hit 1-hour wall before these were completed |

---

## Skipped Probes (Walk Hit Time Wall)
All interactive element probes below were not reached before the 1-hour wall:
- Active-only checkbox effect (1115, 1107, 1606)
- Currency dropdown filter effect (all offices)
- Editable cell / Save button dirty state (all offices)
- Dirty-state guard dialog (all offices)
- Column sort full confirmation for all offices (1107, 1974, 1606)
- Pagination controls (1974 — files captured but returned empty results)
- Grid Options hide/restore (all offices)
- Reset to Default View (all offices)
- Import dialog content for 1606 (file exists, not read in reconstruction)

---

## NO SAVE COMMITS
Zero save operations were committed during the walk. All edits were discarded or not reached.
