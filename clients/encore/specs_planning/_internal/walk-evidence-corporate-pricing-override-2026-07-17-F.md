# Walk Evidence — Corporate Pricing / Product Group Override (EA4 — Inactive Office 1222 Probe)
# Date: 2026-07-17
# Ticket: EA4
# Browser Tool: Playwright CLI (headless, encore-state.json)
# Reason: functional API bug investigation, unattended, network capture needed
# Auth: clients/encore/.auth/encore-state.json
# RUN_DIR: .claude/state/ua-worker/chips/delegation-temp/out-encore-answers/raw-EA4/
# Base URL: https://cloudapps-e2e.encoreglobal.com/navigator/
# Scope: READ-ONLY — zero mutations (no deactivation, no save, no import, no cell edits)

---

## Step 0 — Setup

- RUN_DIR: `C:\Users\rutvi\projects\encore_framework\.claude\state\ua-worker\chips\delegation-temp\out-encore-answers\raw-EA4\`
- Auth state: `clients/encore/.auth/encore-state.json`
- CWD for playwright-cli: `clients/encore/`
- Evidence file: `walk-evidence-corporate-pricing-override-2026-07-17-F.md`
- EA1 prior finding (built on, not re-derived):
  - UNCHECKED run: 2,651 locations (inactive-count:0 in current API); prior run had 512 inactive (8500+ range)
  - CHECKED run: 2,139 locations (prior run)
  - location-lookup API: POST /api/location/location-lookup
  - Search: client-side filter (no API call per keystroke)

---

## Step 0 — Auth + Navigation

**CMD**: `playwright-cli open "https://cloudapps-e2e.encoreglobal.com/navigator/" -s=ea4` → opened, redirected to sign-in  
**CMD**: `playwright-cli state-load ".auth\encore-state.json" -s=ea4` → "Storage state restored from .auth\encore-state.json"  
**CMD**: `playwright-cli goto "https://cloudapps-e2e.encoreglobal.com/navigator/locations/4107/settings/corporate-pricing/pg-override" -s=ea4` → Title: "Product Group Override | Navigator"  
**Auth check**: URL did NOT redirect to login — authenticated session confirmed.  
**Artifact**: `raw-EA4/step0-goto-pgoverride.verify.txt`

---

## Step 1 — Confirm 1222 is Inactive (Primary Status Check)

### 1a — Full location list (activeOnly:false), search for 1222
**CMD**: `playwright-cli eval "async () => { const r = await fetch('/navigator/api/location/location-lookup', {method:'POST',...,body:JSON.stringify({activeOnly:false,searchTerm:'',page:1,pageSize:9999})}); ... return JSON.stringify({total,inactiveCount,loc1222}); }" -s=ea4`  
**RESULT (verbatim)**: `{"total":2651,"inactiveCount":0,"loc1222":"NOT_FOUND"}`  
**Artifact**: `raw-EA4/step1-full-list-search1222.verify.txt`

### 1c — Full location list (activeOnly:true), search for 1222
**CMD**: `playwright-cli eval "... activeOnly:true ... find 1222 ..." -s=ea4`  
**RESULT (verbatim)**: `{"total":2651,"status":200,"loc1222":"NOT_FOUND"}`  
**Artifact**: `raw-EA4/step1c-full-list-checked.verify.txt`

### 1g — Direct location detail API for 1222
**CMD**: `playwright-cli eval "async () => { const r = await fetch('/navigator/api/location/1222'); const d = await r.json(); ... return JSON.stringify({id,locationNo,locationName,active}); }" -s=ea4`  
**RESULT (verbatim)**: `{"id":"8914a7bb-a96b-8ce6-4f6b-51b5565cceac","locationNo":"1222","locationName":"Hyatt Fairfax at Fair Lakes","active":false}`  
**Artifact**: `raw-EA4/step1g-1222-location-detail.verify.txt`

**Step 1 CONCLUSION**: Office 1222 ("Hyatt Fairfax at Fair Lakes") is CONFIRMED INACTIVE: `active:false` via `/api/location/1222`. It is NOT present in `location-lookup` response for EITHER `activeOnly:false` (2,651 results, all active:true) OR `activeOnly:true` (2,651 results). The picker's data source excludes 1222 entirely — it is not present to be filtered by the Active checkbox.

---

## EA4B — UI Dialog Probe + Positive Control (continuation run 2026-07-17)

### Step 2 — Open Change Local Office Dialog + UI evidence

**Session**: ea4b (playwright-cli, headless, encore-state.json)  
**CMD**: `playwright-cli open "https://cloudapps-e2e.encoreglobal.com/navigator/" -s=ea4b` → redirect to sign-in  
**CMD**: `playwright-cli state-load ".auth\encore-state.json" -s=ea4b` → "Storage state restored"  
**CMD**: `playwright-cli goto "https://cloudapps-e2e.encoreglobal.com/navigator/locations/4107/settings/corporate-pricing/pg-override" -s=ea4b` → Title: "Product Group Override | Navigator"  
**Auth check**: URL did NOT redirect to login — authenticated.  
**Artifacts**: `raw-EA4/step2-open.verify.txt`, `step2-stateload.verify.txt`, `step2-goto.verify.txt`

**CMD**: `playwright-cli snapshot -s=ea4b` → snapshot shows PG-override page; "Change Local Office" element at `ref=e173`, "Active only" checkbox at `ref=e182`.  
**Artifact**: `raw-EA4/step2-snapshot-pre.verify.txt`

**CMD**: `playwright-cli click e173 -s=ea4b` → clicked `getByText('Change Local OfficeSelect a')` → dialog opened.  
**CMD**: `playwright-cli snapshot -s=ea4b` → snapshot is 1MB (dialog loaded full location list).  
**Artifact**: `raw-EA4/step2-click-clo.verify.txt`, `step2-dialog-snapshot.verify.txt`

**Dialog structure confirmed from snapshot** (grepped from 1MB output):
- `dialog "Change Local Office" [ref=e384]`
- `checkbox "Active" [ref=e398] [cursor=pointer]` — Active filter checkbox
- `textbox "Search by Location Name, Number" [ref=e406]` — search box (data-testid: `location-settings-modal-change-local-office-input-search`)

**CMD**: `playwright-cli screenshot --filename ".playwright-cli\ss-dialog-1222-checked.png" -s=ea4b` → dialog open, no search yet.  
**Artifact**: `raw-EA4/step2-ss-dialog-open.png` sha256=CD9F32B1EDA56409D0EF821BD850839E352A9C72920E0C2C7CE5BE794C00B1A2

---

### Step 2b — Dialog: 1222 searched, Active UNCHECKED

**CMD**: `playwright-cli fill e406 1222 -s=ea4b` → filled `[data-testid="location-settings-modal-change-local-office-input-search"]` with "1222"  
**State verify (eval)**: `{"checkboxAriaChecked":"false","searchValue":"1222","resultRowCount":1,"noResultsText":""}` — Active UNCHECKED, search=1222, table has 1 body row  
**Snapshot confirm**: `dialog rows=["No results."]` (the single row is the "No results." placeholder)  
**Artifacts**: `raw-EA4/step2-fill-1222-checked.verify.txt`, `step2-dialog-state.verify.txt`, `step2-snapshot-1222-checked.verify.txt`

**CMD**: screenshot taken  
**Artifact**: `raw-EA4/step2-ss-1222-unchecked-nosearch.png` sha256=CA2D4B5BCE02B84C2E17695EF49990B3A8981C9EF1EE1CE7150B5504C00A9179

---

### Step 3 — Dialog: 1222 searched, Active CHECKED (toggled on)

**CMD**: `playwright-cli click e398 -s=ea4b` → `getByRole('checkbox', {name:'Active'}).click()` — checked Active  
**State verify (eval)**: `{"active":"true","search":"1222","rowCount":1,"rows":["No results."]}` — Active CHECKED, search=1222, result="No results."  
**Artifact**: `raw-EA4/step2-state-after-check.verify.txt`

**Screenshot (Active CHECKED + "1222" = No results)**:  
**Artifact**: `raw-EA4/step3-ss-1222-active-checked.png` sha256=AEBC4D45EEE07CEC4E45A4E9CD87A93065FEF54847F6F8ACBAC6230F73AED65F  
**Verify txt**: `raw-EA4/step3-ss-1222-active-checked.verify.txt`

**Network capture** (after checkbox toggle): `[POST] /navigator/api/location/location-lookup => [200]` — confirms checkbox DID trigger a new API call.  
**Artifact**: `raw-EA4/step3-network-1222-checked.verify.txt`

**CMD**: `playwright-cli click e398 -s=ea4b` → unchecked Active again  
**State verify (eval)**: `{"active":"false","search":"1222","rowTexts":["No results."]}` — Active UNCHECKED, still "No results."  
**Artifact**: `raw-EA4/step3-state-unchecked.verify.txt`

**Screenshot (Active UNCHECKED + "1222" = No results)**:  
**Artifact**: `raw-EA4/step3-ss-1222-active-unchecked.png` sha256=EFD3A73BC635FA35C34060ECD283292193AC98491954ECABA147A243C8626263  
**Verify txt**: `raw-EA4/step3-ss-1222-active-unchecked.verify.txt`

---

### Step 4 — Positive Control: Office 4107

**CMD**: `playwright-cli fill e406 4107 -s=ea4b` → filled search with "4107"  
**State verify (eval)**: `{"active":"false","search":"4107","rowCount":1,"rowTexts":["4107The Lodge at Spruce Peak"]}` — search=4107, 1 result row = "4107 The Lodge at Spruce Peak" FOUND  
**Artifact**: `raw-EA4/step4-state-4107.verify.txt`

**Screenshot (Active UNCHECKED + "4107" = 4107 appears)**:  
**Artifact**: `raw-EA4/step4-ss-4107-positive-control.png` sha256=126974A3F2A8007441C62D63E8B57F4BC4B41142D3FBCCFDE48D8C52190822EB  
**Verify txt**: `raw-EA4/step4-ss-4107-positive-control.verify.txt`

**Positive control CONFIRMED**: The search mechanism works correctly — known-active office 4107 appears immediately when searched. The absence of 1222 is not a broken search primitive; it reflects 1222 being absent from the location-lookup data source entirely.

---

### Step 5 — Verdict

**VERDICT: BUG-CONFIRMED-B**

**Root cause**: The `POST /api/location/location-lookup` endpoint ignores the `activeOnly` parameter. Both `{activeOnly:true}` and `{activeOnly:false}` return the identical 2,651 active-only location set (`inactiveCount:0`). Office 1222 ("Hyatt Fairfax at Fair Lakes") is confirmed inactive (`active:false` per `/api/location/1222`) but is NEVER present in any location-lookup response regardless of `activeOnly` value.

**Evidence chain**:
1. 1222 status: `active:false` — `raw-EA4/step1g-1222-location-detail.verify.txt`
2. `activeOnly:false` response: 2,651 results, inactiveCount=0, 1222 NOT_FOUND — `raw-EA4/step1-full-list-search1222.verify.txt`
3. `activeOnly:true` response: 2,651 results, 1222 NOT_FOUND — `raw-EA4/step1c-full-list-checked.verify.txt`
4. UI Active CHECKED + "1222" → "No results." — `raw-EA4/step3-ss-1222-active-checked.png`
5. UI Active UNCHECKED + "1222" → "No results." — `raw-EA4/step3-ss-1222-active-unchecked.png`
6. Positive control: 4107 appears when searched — `raw-EA4/step4-ss-4107-positive-control.png`
7. Network: checkbox toggle DID fire a new location-lookup POST — `raw-EA4/step3-network-1222-checked.verify.txt`

**Impact**: The "Active" checkbox in the Change Local Office dialog is non-functional with respect to inactive locations — the `activeOnly:false` path never returns inactive locations. Users cannot select an inactive office as the pricing override context, even if they explicitly uncheck "Active."

---
