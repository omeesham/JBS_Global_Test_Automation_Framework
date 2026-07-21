# Walk Evidence — Corporate Pricing Product Group Override (Lot D — EA2 Drag-and-Drop Discovery)
# Date: 2026-07-17
# Walker: EA2 worker (T3 claude-opus-4.6 max)
# Ticket: TICKET-EA2 — drag-and-drop Add-Override discovery
# Browser tool: Playwright CLI headless. Session: ea2 (in-memory, cookies loaded from encore-state.json)
# Office: 4104 (designated e2e office, thin data)

---

## Auth Setup
Auth loaded from `clients/encore/.auth/encore-state.json` via playwright-cli config.
Session: ea2, browser chromium, headless.
Evidence: raw-EA2/auth-check.verify.txt

---

## Step 1 — Denominator: Full Page Snapshot + Element Enumeration

**State: Before location selection (URL /locations/4104/..., Currency=ALL)**

CLI command: `playwright-cli snapshot` → `.playwright-cli/page-2026-07-17T15-06-02-371Z.yml`

Draggable elements BEFORE location selection:
- Count: **10** (all `TH` column headers — Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By)
- These are column reorder handles on the override grid, NOT product group picker rows
- `[class*=dnd]` / `[class*=drag]` elements: 2
- `[aria-grabbed]` elements: 0
- `[data-testid]` elements: 0

Page state: "0 items found", "Select a location", "No results.", Save disabled. No Product Group panel visible.

Evidence: `raw-EA2/step1-draggable-enum-before-selection.verify.txt` sha256=F7D68D5BB19DDF76DCAC1CCA213F1ED08C699FC788D3893640FA2C9393AB69AE
Evidence: `raw-EA2/step1-initial-snapshot.verify.txt` sha256=46C3B01946BD9F3CAD5E0DBB7831934456B1CF85AAF8451D8892BC79E5A768A2

---

## Step 1b — Select Office 4104 via Change Local Office Picker

CLI commands:
1. `playwright-cli click e173` → opens "Change Local Office" dialog
2. `playwright-cli fill e406 "4104"` → resolved to testid `location-settings-modal-change-local-office-input-search`
3. `playwright-cli click e18990` (checkbox "Select row" for 4104 row) → checkbox checked
4. `playwright-cli click e18998` → resolved to testid `location-settings-modal-change-local-office-btn-select`

**Testids discovered:**
- Search box: `data-testid="location-settings-modal-change-local-office-input-search"`
- Select button: `data-testid="location-settings-modal-change-local-office-btn-select"`

Result: "4104 - Hilton Dallas Lincoln Centre" shown in search panel, "1 items found" in grid header.
Override grid row: `4104 | 4298 | Project Manager (Pre/Post) - Hourly | USD | 305.00 | 181.00 | — | Active`

**Currency still ALL. No Product Group Picker visible yet.**

Evidence: `raw-EA2/step1-select-4104.verify.txt` sha256=51FEAD6A3FF787475E580531DAD0A4EFEC5DEA9DFAD497B9FB7A3446F0AFD6D1

---

## Step 2 — Currency USD → Product Group Picker Revealed (KEY DISCOVERY)

CLI commands:
1. `playwright-cli click e186` → opens Currency combobox (id=`pg-ref-currency`, Radix UI)
2. `playwright-cli click e19175` → `await page.getByRole('option', { name: 'USD' }).click()`

**Draggable count after USD selection: 3368** (was 10 before)
- 10 column headers (same as before)
- **3358 new draggable rows** = Product Group Picker rows (Equipment items)
- Tables on page: **2** (picker table + override grid table)

**Product Group Picker Structure (DOM path):**
```
generic [ref=e19184]              ← picker container
  generic "Product Groups"        ← section heading
  textbox "Search product groups..." [ref=e19193]  ← search filter
  table [ref=e19199]              ← picker table
    rowgroup [header]: Product | Product Group Name | Price
    rowgroup [data]: draggable picker rows
```

**Picker table columns (3):** (unnamed drag handle), Product (ID), Product Group Name, Price

**First picker row structure:**
```yaml
row "271 Lift 0'-40' Boom - Daily 0.00" [ref=e19216]:
  cell [ref=e19217]: img [ref=e19219]  ← drag handle icon
  cell "271" [ref=e19226]              ← Product ID
  cell "Lift 0'-40' Boom - Daily" [ref=e19228]  ← PG Name
  cell "0.00" [ref=e19230]            ← Price
```

**What makes the picker visible:**
1. Location must be selected (not "Select a location")
2. Currency must be a SPECIFIC value (not ALL) — USD, CAD, or MXN

**API call that loads picker data:**
`GET /navigator/api/location/corporate-price-pg-override/product-group?locationNo=4104&currencyId=1` → [200]
(currencyId=1 = USD)

Evidence: `raw-EA2/step1-after-usd-selection-count.verify.txt` sha256=90082558123819D0B16C325B343FD2891307E4859E590BDDE341505771C1D8B8
Evidence: `raw-EA2/step2-before-drag.png` sha256=6CCA84830CA0F00D8309BC11B58C950671AEB47410D56E1CDBE38B2B7593EEBC

provenance: live | evidence: step1-after-usd-selection-count.verify.txt (draggableCount=3368)

---

## Step 3 — Drag Execution

**Before drag:**
- Override grid row count: **1** (4104/4298 Project Manager)
- Save button: disabled
- Screenshot: `raw-EA2/step2-before-drag.png`

**Drag command:**
```
playwright-cli drag e19216 e218
```
Resolved to: `await page.getByRole('row', { name: "Lift 0'-40' Boom - Daily 0.00" }).dragTo(page.getByRole('tabpanel', { name: 'Equipment' }))`

**After drag:**
- Override grid row count: **2** (before=1, after=2) ← CONFIRMED ROW ADDED
- New row values: `4104 | 271 | Lift 0'-40' Boom - Daily | USD | 0.00 | 0.00 | — | INACTIVE`
  - Override Price: **0.00** (not blank, but unset value)
  - Max Discount: **—** (null/blank)
  - Active: **aria-checked=false** (INACTIVE)
  - Active SVG: svg-inactive (no lucide-check icon)
  - Mod Date: empty (staging state — not persisted)
  - Updated By: empty (staging state)
- Save button: **disabled=false** → ENABLED (dirty state confirmed)
- Network calls during drag: **NONE** — drag is purely client-side; no API call fires until Save is clicked

**Active state detail:** The dragged row lands as INACTIVE (aria-checked=false). Per NM-1463, a row becomes Active when a price is set (Override Price > 0). With Override Price=0.00, the row is INACTIVE. User must set Override Price to activate the row.

Evidence: `raw-EA2/step3-drag-attempt1.verify.txt` sha256=78152810589A73489C7291FFC5AD3BC4E46ABF970FB5E987D2D78708E5412E05
Evidence: `raw-EA2/step3-rowcount-after-drag1.verify.txt` sha256=91FC30ACC61F401BB0B3B1E57DA104E116679C567BE8A9E975E53A8DB68C11FD
Evidence: `raw-EA2/step3-save-button-state.verify.txt` sha256=0CB1B7E22E60A32269D6936DA6BB74BF04135C06EFE42C90107FCB4FC1631E62
Evidence: `raw-EA2/step3-row-details-after-drag.verify.txt` sha256=A67C3F233E5CBAA6489466EE195D83B8737BE76E5F7742913F185823072BD7A0
Evidence: `raw-EA2/step3-network-after-drag.verify.txt` sha256=89480AFF5C4E4738CCEC965597993854C4897C40F61E9FA9B511C5E1576BFBC3
Evidence: `raw-EA2/step3-after-drag-row-added.png` sha256=14DF5BBF62D32FBA2255A863860E2713A360CD5B0AEF36C8A6B69F7AEBD9CB1F

provenance: live | evidence: step3-rowcount-after-drag1.verify.txt (rowCount=2)

---

## Step 4 — Discard

**Protocol:**
1. `playwright-cli goto "https://cloudapps-e2e.encoreglobal.com/navigator/locations/4104/home"` → blocked by native `beforeunload` dialogs
2. `playwright-cli dialog-dismiss` (x2) → dismissed beforeunload dialogs; stayed on pg-override page
3. `playwright-cli click e40` (Home link) → triggered React alertdialog "Unsaved changes"

**React alertdialog contents:**
- Title: "Unsaved changes"
- Body: "Are you sure you want to leave this view? Any unsaved changes will be lost."
- Buttons: "Stay" (active) | "Discard" [ref=e73153]

4. Screenshot of dialog: `raw-EA2/step4-unsaved-changes-dialog.png`
5. `playwright-cli click e73153` → `await page.getByRole('button', { name: 'Discard' }).click()`
6. Page navigated to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/4104/home`

Evidence: `raw-EA2/step4-click-discard.verify.txt` sha256=9AB8E7428D848CB08C6C05D6B5E2A7E67470F336F28B49EBE713058CCA9A5AC1
Evidence: `raw-EA2/step4-unsaved-changes-dialog.png` sha256=C0C7DD1E458935B091FCBBD32A3393335F492D15DD5C7EA545E2EFBF54A4B80A

---

## Step 5 — Discard Verification

Navigated back to pg-override page, re-selected 4104, changed currency to USD.

`playwright-cli eval "() => { var rows = document.querySelectorAll('[role=tabpanel] table tbody tr'); return { rowCount: rows.length, rowTexts: Array.from(rows).map(...) }; }"`

**Result: rowCount = 1** (4104/4298 Project Manager only — row 271 GONE)

Row 271 (Lift 0'-40' Boom - Daily) is ABSENT from the grid. Discard confirmed.

Evidence: `raw-EA2/step5-verify-row-count.verify.txt` sha256=2A95552B2311DDD65D239DAB46FDBF7C4D8F709DF00E9D5A62C945B19D9EEA34

provenance: live | evidence: step5-verify-row-count.verify.txt (rowCount=1)

---

## Step 6 — Labor Tab Picker Check

`playwright-cli click e211` (Labor tab)

**After tab switch:**
- Draggable count: **430** (420 Labor PG rows + 10 column headers)
- Tables: **2** (picker + override grid)
- Override grid Labor rows: **0** (4104 has no Labor overrides)

**Same picker API endpoint** used for Labor tab:
`GET /api/location/corporate-price-pg-override/product-group?locationNo=4104&currencyId=1` → [200]

The tab switch does NOT change the API endpoint. The picker likely returns both Equipment and Labor items in one response and the client filters by item type (isLabor flag).

**Conclusion (Labor tab):** The same Product Group Picker serves Labor items. Same drag mechanism applies. 4104 has no existing Labor overrides (0 rows), so drag-to-add would work identically to Equipment.

Evidence: `raw-EA2/step6-labor-picker-check.verify.txt` sha256=07BA0AE7171B1C66FEB44E0C3C8A9FC26E6CA8565358BD1FEA05DC0883DA5AEE
Evidence: `raw-EA2/step6-network-labor-tab.verify.txt` sha256=E155C2149C3F25AD88C10660BFDCE8F0CEB44B4B062851773CDCAE53D3D9E167

---

## Step 7 — Add-LOCATION Affordance Check

**Page chrome audit:**
- All main buttons: USD (dropdown), Product, Product Group Name, Price (picker headers), Save, Export, Import, Grid Options, Equipment, Labor, Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By, 20 (rows-per-page)
- **No "New" or "Add" button found anywhere on the page**

**Change Local Office dialog audit:**
- Dialog title: "Change Local Office"
- Buttons: Select (enabled when row checked), Cancel, Close, per-row checkboxes, column sort buttons
- **No "Add New Location" button or link** — dialog is search-and-select ONLY

**Conclusion (Add-LOCATION flow):**
No dedicated New/Add-location button observed on 4104 (USD context). The eligible-new-locations / zero-override-location add flow was NOT verified — open item.

Evidence: `raw-EA2/step7-add-location-affordance.verify.txt` sha256=8DAAECBB64AFBED17DD05DDEA9055A98D66DB5F6B5F86A542EB726186AB3506E
Evidence: `raw-EA2/step7-page-chrome-buttons.verify.txt` sha256=8B4258E4B7BF1B36121A48A1B1F80A0B2434D3A052CC87F04844B118F9BF7C17
Evidence: `raw-EA2/step7-final-state.png` sha256=A9FC5E1B55DE69E6BD58FEC4B4C87523C9D3B2F34EA10A44FA94F8C5E8C1E458

---

## NO SAVE COMMITS
Zero save operations committed during this walk. All staged rows were discarded via the "Unsaved changes" alertdialog Discard button. Grid confirmed back to 1 row on reload.
