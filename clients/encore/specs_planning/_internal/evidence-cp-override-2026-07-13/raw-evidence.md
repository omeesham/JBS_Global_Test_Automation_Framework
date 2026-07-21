# Raw Evidence — CP Override Live Walk 2026-07-13

**Walk date**: 2026-07-13  
**Agent**: council-worker (TICKET-cp-f2-override-0713)  
**Auth**: clients/encore/.auth/encore-state.json (state from 2026-07-10; still valid — no Entra redirect observed)  
**Base URL**: https://cloudapps-e2e.encoreglobal.com/navigator/  

---

## E1 — Office 1604 Grid State (CORE READ-ONLY)

**URL navigated**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override`  
**Location picker**: searched "1604", selected "1604 - Parker Palm Springs", confirmed via "Select" button  

**Grid body text (verbatim)**:
```
Product Group Override
Change Local Office
1604 - Parker Palm Springs
Active only
Currency : ALL
0 items found
Save / Export / Import / Grid Options
Equipment / Labor tabs
Column headers: Location | Product Group | Product Group Name | Currency | Current Price | Override Price | Max Discount % | Active | Mod Date | Updated By
No results.
20 rows per page
/1
```

**Confirmed**: `0 items found` with `No results.` — grid empty even with Currency=ALL and Active Only=unchecked.

---

## E2 — Grid API HTTP Status for 1604

**Endpoint**: `GET https://cloudapps-e2e.encoreglobal.com/navigator/api/location/corporate-price-pg-override?localOfficeId=1604`  
**Network log entry**: `[GET] .../corporate-price-pg-override?localOfficeId=1604 => [500]`  
**Direct fetch response** (verbatim):
```json
{
  "success": false,
  "validationErrors": {
    "exception": ["An item with the same key has already been added. Key: 4543"]
  },
  "message": "An item with the same key has already been added. Key: 4543"
}
```
**HTTP status**: 500  
**Console error logged by browser**: `[ERROR] Failed to load resource: the server responded with a status of 500 () @ https://cloudapps-e2e.encoreglobal.com/navigator/api/location/corporate-price-pg-override?localOfficeId=1604:0`

---

## E3 — Export API (Tenant-Wide)

**Endpoint**: `GET https://cloudapps-e2e.encoreglobal.com/navigator/api/location/corporate-price-pg-override/export?locale=en-US`  
**Network log entry**: `[GET] .../corporate-price-pg-override/export?locale=en-US => [200]`  
**HTTP status**: 200  
**CSV response stats** (fetched via in-page fetch):
```
total rows (excl header): 8,995
rows for location 1604:   731
rows for PG-4543 on 1604: 0   (product group 4543 not present in export for 1604)
header: Location Id,Product Group Id,Product Group Name,Is Labor,Currency,Current Price,Override Price,Override Discount,Is Active
first 1604 row: 1604,271,Lift 0'-40' Boom - Daily,0,USD,0.00,56.00,0.08,1
```

**Note on ticket claim**: The ticket originally stated "Export returns a file listing 8 override rows for 1604" (from 2026-07-06). Actual count today (2026-07-13) is **731 rows**. Export is a tenant-wide dump (no `localOfficeId` param); it is NOT scoped to the selected office.

---

## E4 — Grid API HTTP Status for 1606 (Control)

**Endpoint**: `GET https://cloudapps-e2e.encoreglobal.com/navigator/api/location/corporate-price-pg-override?localOfficeId=1606`  
**HTTP status**: 200  
**Response summary**:
```json
{
  "status": 200,
  "locationCount": 1,
  "totalOverrides": 7,
  "success": true
}
```

---

## E5 — Office 1606 Grid State (Control)

**Location picker**: searched "1606", selected "1606 - Embassy Suites by Hilton Washington DC Convention Center"  
**Grid result**: `7 items found` — grid populated correctly  

**Verbatim body text**:
```
Product Group Override
Change Local Office
1606 - Embassy Suites by Hilton Washington DC Convention Center
Active only
Currency : ALL
7 items found
Save / Export / Import / Grid Options
Equipment / Labor tabs
[column headers rendered]
```

---

## E6 — Import Sub-Claims

**Assessment**: `data-blocked: no safe import fixture for override-pg Import screen`  
**Rationale**: The Override page Import dialog is titled "Import All Pricing Overrides". Existing fixtures at `src/data/corporate-pricing/fixtures/import-all/` contain only `empty.csv` (empty file) and `malformed.csv` (garbage data). No valid product-group override fixture with real row data exists that could test the specific sub-claims (Project Manager group / 3-group file). Importing with unknown data on a shared env is destructive.  
**Indirect evidence**: The raw error "An item with the same key has already been added. Key: 4543" (ticket sub-claim) exactly matches the grid API error (E2). Both share the same root cause — product group 4543 duplicate key in 1604's backend data structure.

---

## E7 — Full Network Log (relevant subset)

```
[GET] /navigator/api/location/corporate-price-pg-override?localOfficeId=1604 => [500]
[GET] /navigator/api/location/corporate-price-pg-override/export?locale=en-US => [200]
[POST] /navigator/api/location/location-lookup => [200]
```
