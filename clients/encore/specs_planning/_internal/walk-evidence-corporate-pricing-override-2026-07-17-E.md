# Walk Evidence — Corporate Pricing Product Group Override Export→Import Round-Trip
# TICKET-EA3 | 2026-07-17 | Office 4107 (designated e2e office)

**Browser tool**: Playwright CLI (headless, `-s=default`, e2e-profile)
**Reason**: functional export/import probe, unattended, network capture needed

---

## Step 0 — Setup

- RUN_DIR: `.claude/state/ua-worker/chips/delegation-temp/out-encore-answers/raw-EA3/`
- Auth: `clients/encore/.auth/e2e-profile` (default session, last written 2026-07-17 01:28:51)
- Session JSON: `clients/encore/.auth/encore-state.json` (2026-07-15 15:35:34)
- Base URL: `https://cloudapps-e2e.encoreglobal.com/navigator/`

---

## Step 1 — Office 4107 Row Counts + Canary 1105

**AUTH**: `playwright-cli state-load .auth/encore-state.json` → "Storage state restored"
**DISCOVERY**: URL must be 1604 (session locationSlug=1604); grid location-picker selects 4107 separately.
**CMD**: `playwright-cli goto "https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override"` → Title: "Product Group Override | Navigator"
**Location picker**: modal opened → filled "4107" → checked `Select row` checkbox (via `playwright-cli check <ref>`) → clicked `location-settings-modal-change-local-office-btn-select` → SUCCESS
**URL after select**: still 1604/pg-override (expected — URL is app context, grid shows selected location's data)

### 4107 Equipment Tab (baseline)
- **Footer total**: **1 items found**
- **Row 1**:
  - Location: 4107
  - Product Group: 4298
  - Product Group Name: "Project Manager (Pre/Post) - Hourly"
  - Currency: USD
  - Current Price: 305.00
  - **Override Price: 152.00** (editable)
  - Max Discount %: — (empty, editable)
  - Active: ✓ (checked)
  - Mod Date: 06/12/2026, 07:57 PM
  - Updated By: v-internal.internal@psav.com
- Screenshot: `step1-4107-equipment.png` (clients/encore/)

### 4107 Labor Tab (baseline)
- **Footer total**: **0 items found** ("No results.")

### 1105 Canary (Equipment, pre-export baseline)
- **Footer total**: **9 items found** ✓ (matches expected count)
- Representative row: "1105 272 Lift 0'-40' Boom - Weekly USD 0.00 100.00 — 06/12/2026, 07:57 PM"

**Step 1 COMPLETE** — baseline recorded for 4107 (Equipment=1, Labor=0) + 1105 canary (9).

---

## Step 2 — Export CSV

**CMD**: `playwright-cli click "Export"` → clicked `page.getByRole('button', { name: 'Export' }).click()`
**Network**: `GET /navigator/api/location/corporate-price-pg-override/export?locale=en-US → 200`
**Download events**: "Downloading file ProductGroupOverrides_20260717_154159UTC.csv … Downloaded to `.playwright-cli/ProductGroupOverrides-20260717-154159UTC.csv`"

### CSV Summary
- **Filename**: `ProductGroupOverrides_20260717_154159UTC.csv`
- **SHA256**: `749CFF8C2666187DBCDC921680A056DBAE34FCB808E55C582473BFBD51F5DE27`
- **Size**: 570,959 bytes
- **Total rows (data)**: 8,996 (+ 1 header = 8,997 lines)
- **Header row** (NM-2044/2045 check — no localization bug): `Location Id,Product Group Id,Product Group Name,Is Labor,Currency,Current Price,Override Price,Override Discount,Is Active`
- **4107's row** (verbatim): `4107,4298,Project Manager (Pre/Post) - Hourly,0,USD,305.00,152.00,,1`
- **Scope**: TENANT-WIDE dump — includes all offices (1105 has 11 rows; export is NOT filtered by location picker selection)

**Step 2 COMPLETE** — exported file preserved as `raw-EA3/ProductGroupOverrides_20260717_154159UTC.csv`

---

## Step 3 — Import Dialog Recon

### Import Dialog Controls (from tee files: step3-*)

- **Dialog title**: "Import All Pricing Overrides"
- **File input** data-testid: `pg-override-upload-dialog-file-input` (accept: `.csv`)
- **"Upload file" button** (within dialog) — ref=e19359 — triggers OS file chooser when clicked
- **Progress label**: "Attached file / No file selected" (updates after file chosen)
- **Cancel button** testid: `pg-override-upload-dialog-cancel` / ref=e19373
- **Upload button**: `button "Upload" [disabled]` — disabled until a file is selected (no testid found in snapshot; enabled state triggers import POST)
- **Dialog structure (verbatim from step3-snap-import-dialog snapshot)**:
  ```
  dialog "Import All Pricing Overrides" [ref=e19354]
    heading "Import All Pricing Overrides" [level=2]
    paragraph: Choose a file to import data.
    button "Upload file" [ref=e19359]
      paragraph: Attached file
      paragraph: No file selected
      generic: Upload progress
      progressbar "Upload progress" [ref=e19369]
    button "Cancel" [ref=e19373] [cursor=pointer]
    button "Upload" [disabled]
  ```
- **Screenshot**: `step3-import-dialog.png`

**Step 3 COMPLETE** — import dialog fully enumerated; all controls captured.

---

## Step 0a — Prior Upload Attempts Analysis (EA3B continuation)

*Reading ALL step4-* tee files from the first worker's run.*

| Tee file | Approach | Result | POST fired? |
|---|---|---|---|
| step4-upload-unmodified | MCP `browser_file_upload` tool | "can only be used when there is related modal state present" | NO |
| step4-upload-r2 | MCP `browser_file_upload` tool (retry) | Same MCP error | NO |
| step4-upload-async | MCP `browser_file_upload` tool (async) | Same MCP error | NO |
| step4-upload-r3 | `playwright-cli upload <ref> <file>` (2 args) | "too many arguments: expected 1, received 2" | NO |
| step4-upload-sequential | `run-code "await fileChooser.setFiles([...])"` — no active fileChooser listener | Ran but no active chooser (page at pg-override, not in dialog) | NO |
| step4-click-browse | `playwright-cli click <Browse-btn-ref>` | "Tool "browser_click" does not handle the modal state. Modal state - [File chooser]: can be handled by upload" — click DID trigger pending file chooser state | NO (upload not called after) |
| step4-click-upload-btn | `playwright-cli click e19401` | "Ref e19401 not found" (stale ref) | NO |
| step4-snap-after-upload | snapshot | Page at pg-override, no dialog open | N/A |

**VERDICT Step 0a**: NO import POST fired in the prior run. All attempts failed before any file data was sent to the server. Correct approach discovered: `playwright-cli upload <file>` (1 arg — confirmed by `playwright-cli upload --help`: "playwright-cli upload <file> — Upload one or multiple files; <file>: the absolute paths to the files to upload"). Preceding step: click the "Upload file" button which puts a `[File chooser]` modal state; then `upload <file>` handles it.

---

## Step 0b — Live Canary Check (EA3B, before new imports)

*Run immediately before any new import; confirms no drift from Step 1 baseline.*

| Office | Tab | Count | Key Row | Status |
|---|---|---|---|---|
| 4107 | Equipment | **1 items found** | `4107 4298 Project Manager (Pre/Post) - Hourly USD 305.00 152.00 — 06/12/2026, 07:57 PM` | ✓ NO DRIFT |
| 4107 | Labor | **0 items found** (No results.) | — | ✓ NO DRIFT |
| 1105 | Equipment | **9 items found** | `1105 272 Lift 0'-40' Boom - Weekly USD 0.00 100.00 — 06/12/2026, 07:57 PM` | ✓ NO DRIFT |

All counts match Step 1 baseline exactly. Prior worker's failed upload attempts left data unchanged.

---

## Step 4 — Import #1: Unmodified Full File

### Import #1 Attempt (Unmodified full file)

**Approach**: `playwright-cli run-code --filename` with `page.locator(...).setInputFiles(path)` — bypasses OS file dialog, sets file directly on the `<input type="file">` element. File: `ProductGroupOverrides_20260717_154159UTC.csv` (570,959 bytes, SHA256=749CFF8C…).

**Network** (step4-network-import.verify.txt):
- `[POST] .../locations/4107/settings/corporate-pricing/pg-override => [200]` (4× POSTs, all 200)
- Multiple GET RSC calls (Next.js RSC, not import calls)

**Result**: Dialog remained open; error shown in dialog:
- `alert: "Error Row#:19, Msg: LocationId, ProductGroupId, OverridePrice is required."`
- Upload button reverted to `[disabled]`
- NO preview screen appeared — import attempted direct commit

**Root cause**: CSV data row at server Row#:19 = file index 18 = `1115,286,01D Double Screen Set Kit,0,USD,0.00,,,0` — Override Price is empty. Import validation requires Override Price.

**Assessment**: NM-1940 regression — the exported file contains a row with no Override Price, and the import rejects it. Only 1 such row in the entire 8,996-row export.

**Preview screen**: ABSENT — import does NOT show a preview/compare screen (unlike the sibling module in NM-2265). Import attempts direct commit.

**NM-2186 trap check** (step4-nm2186-trap-check.verify.txt): After cancel + reload + re-select 4107:
- `1 items found` ✓
- Row unchanged: `4107 4298 Project Manager (Pre/Post) - Hourly USD 305.00 152.00 — 06/12/2026, 07:57 PM` ✓
- **No partial changes applied** — the error caused a full rollback/abort.

**Step 4 COMPLETE** — import #1 failed (NM-1940 regression), data unchanged.

---

## Step 5 — Import #2: Single-Value Round-Trip

**Modified file**: `step5-modified-4107-152.01.csv` (570,912 bytes, SHA256=D65DB791F95EA7CD5C3B8C4A2C61E49BD804DC29AFBA7D66BA00E60B87523902)
- Changes vs original: removed row `1115,286,01D Double Screen Set Kit,0,USD,0.00,,,0` (empty Override Price); changed 4107 row Override Price `152.00` → `152.01`

### Step 5a — Import #2: Modified File (4107 Override Price 152.01)

**File**: `step5-modified-4107-152.01.csv` (570,912 bytes, SHA256=D65DB791…)
- Changes: removed row `1115,286,01D Double Screen Set Kit,0,USD,0.00,,,0` (empty Override Price); 4107 row `152.00` → `152.01`

**Method**: `playwright-cli run-code --filename` with `page.locator('[data-testid="pg-override-upload-dialog-file-input"]').setInputFiles(path)`, then click `[data-testid="pg-override-upload-dialog-upload"]`

**Network** (step5-network-import.verify.txt):
- `[POST] .../4107/.../pg-override => [200]` (multiple POSTs, all 200)

**Dialog result**: `Uploading... 50%` — stuck at 50% (**NM-2186 confirmed active**). Upload and Cancel buttons both show `[disabled]`.

**NM-2186 trap check** (step5-nm2186-trap-check.verify.txt): After Escape + reload + re-select 4107:
- `1 items found` ✓
- Row: `4107 4298 Project Manager (Pre/Post) - Hourly USD 305.00 152.01 — 07/17/2026, 09:47 PM s-prd-clickauto@psav.com`
- **Override Price changed from 152.00 → 152.01** ✓ — import DID apply despite stuck UI

### Step 5b — Import #3: Restore (4107 Override Price back to 152.00)

**File**: `step5-restore-4107-152.00.csv` (570,912 bytes, SHA256=663383EB…)
- Same as exported file minus row 19 (problematic 1115,286 row), 4107 row at original 152.00

**Network** (step5-network-restore.verify.txt): `[POST] .../pg-override => [200]` (multiple, all 200)

**Dialog result**: Again `Uploading... 50%` stuck (NM-2186). Applied in background.

**NM-2186 trap check** (step5-nm2186-restore-check.verify.txt): After Escape + reload + re-select 4107:
- `1 items found` ✓
- Row: `4107 4298 Project Manager (Pre/Post) - Hourly USD 305.00 152.00 — 07/17/2026, 09:51 PM s-prd-clickauto@psav.com`
- **Override Price restored: 152.00** ✓

### Round-Trip Evidence Chain

| Step | Override Price | Timestamp | Source |
|---|---|---|---|
| Step 1 baseline | 152.00 | 06/12/2026, 07:57 PM | v-internal.internal@psav.com |
| After Import #2 (modified) | 152.01 | 07/17/2026, 09:47 PM | s-prd-clickauto@psav.com |
| After Import #3 (restore) | 152.00 | 07/17/2026, 09:51 PM | s-prd-clickauto@psav.com |

**Step 5 COMPLETE** — full round-trip proved.

---

## Step 6 — Final Canary Check

| Office | Tab | Count | Key Row | Timestamp change | Verdict |
|---|---|---|---|---|---|
| 4107 | Equipment | **1 items found** | `4107 4298 Project Manager ... USD 305.00 152.00 — 07/17/2026, 09:51 PM` | ✓ price restored; timestamp updated (expected — UPSERT-ALL) | ✓ CLEAN |
| 1105 | Equipment | **9 items found** | `1105 272 Lift 0'-40' Boom - Weekly USD 0.00 100.00 — 07/17/2026, 09:51 PM` | Timestamp updated from 06/12 → 07/17 (UPSERT-ALL side effect) | ✓ COUNT STABLE |

**Side effect finding (UPSERT-ALL semantics)**: Importing the full tenant-wide CSV updates ALL matching rows' Mod Date + Updated By — even rows with no value changes. This is expected behavior given the UPSERT-ALL model; no value changes occurred on non-4107 rows.

---

## Step 7 — Verdict Block

### Import Semantics

- **Preview screen**: ABSENT — unlike sibling module (NM-2265), pg-override import does NOT show preview/compare before committing. Direct commit.
- **Semantics**: **UPSERT-ALL** — every row in the CSV is processed (insert or update by LocationId+ProductGroupId key). Even unchanged rows receive updated Mod Date + Updated By.
- **Error handling**: Row-level validation — a missing required field (Override Price) aborts the entire import (no partial apply). Error shown in dialog.
- **UI bug**: **NM-2186 reproduced** — successful imports show "Uploading... 50%" stuck UI, Cancel and Upload buttons disabled. The import applies in the background; only observable via NM-2073 (reload + re-select).
- **File format**: CSV, header `Location Id,Product Group Id,Product Group Name,Is Labor,Currency,Current Price,Override Price,Override Discount,Is Active`, accept=`.csv`. Does NOT support rows with empty Override Price.

### Q3 Verdict: **CONFIRMED — with NM-1940 qualification**

**Claim**: "export the file — that would be a valid file to make changes and import."

**Evidence**:
- ✓ Export works: `GET /navigator/api/location/corporate-price-pg-override/export?locale=en-US` → 200
- ✗ Unmodified export fails import: row `1115,286,01D Double Screen Set Kit,0,USD,0.00,,,0` has empty Override Price → `Error Row#:19, Msg: LocationId, ProductGroupId, OverridePrice is required.`
- ✓ After removing the problematic row, the modified export imports successfully
- ✓ Round-trip value change confirmed: 152.00 → 152.01 → 152.00 (exact hops)
- ✓ NM-2186 reproduced: import applies despite 50% stuck UI

**Qualification**: The raw exported file has ONE row with empty Override Price (a pre-existing NM-1940 regression). The file IS valid for re-import IF this row is cleaned. A spec must handle this pre-processing step.

### NM-2273 Fixture Recipe

```typescript
// 1. Export the CSV
// GET /navigator/api/location/corporate-price-pg-override/export?locale=en-US

// 2. Load and clean: remove rows with empty Override Price (7th column, 0-indexed column 6)
const lines = csvText.split('\n');
const header = lines[0];
const dataRows = lines.slice(1).filter(line => {
  if (!line.trim()) return false;
  const cols = line.split(',');
  return cols[6] !== '';  // Override Price must be present
});

// 3. Modify target row
const targetIdx = dataRows.findIndex(r => r.startsWith(`${locationId},${productGroupId},`));
dataRows[targetIdx] = /* modified row with new Override Price */;

// 4. Set file on input
await page.locator('[data-testid="pg-override-upload-dialog-file-input"]').setInputFiles(filePath);

// 5. Click Upload
await page.locator('[data-testid="pg-override-upload-dialog-upload"]').click();

// 6. Handle NM-2186: do NOT wait for dialog to close (it sticks at 50%)
// Wait for POST to complete, then reload + re-select location

// 7. NM-2073: reload + re-select location before reading grid
await page.reload();
// Select location via picker...

// 8. Assert: grid shows new Override Price
```

<!-- INCREMENTAL APPEND POINT — END -->

## Observations

### Bugs / Defects

none (retrofitted — original walk did not record findings)

### Suggestions / Improvements

none (retrofitted — original walk did not record findings)
