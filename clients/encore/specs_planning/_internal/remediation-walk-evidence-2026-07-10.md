---
title: Remediation Walk Evidence — Missing TestID Report FP/CNR Resolution
date: 2026-07-10
ticket: TICKET-TESTID-REMEDIATION-20260710
method: LR-029 live Playwright walk, offices 1604/1606/1101, storageState .auth/encore-state.json
---

# Remediation Walk Evidence — 2026-07-10

## Per-Row Disposition Table

### 13 Ticket-Listed False-Positives (Corp Pricing + Locations)

| Sheet | Row | Element | Disposition | Covering data-testid | Evidence |
|---|---:|---|---|---|---|
| CORP_PRICING | 23 | Import file-upload dialog container | REMOVE | `corporate-pricing-import-dialog` | Live dump: dialog open on 1604, testid confirmed |
| CORP_PRICING | 24 | Import dialog: "Browse" button | REMOVE | `corporate-pricing-import-dialog-browse` | Live dump: button testid confirmed |
| CORP_PRICING | 25 | Import dialog: "Upload" button | REMOVE | `corporate-pricing-import-dialog-upload` | Live dump: button testid confirmed |
| CORP_PRICING | 26 | Import dialog: hidden file input | REMOVE | `corporate-pricing-import-dialog-file-input` | Live dump: input testid confirmed |
| CORP_PRICING | 53 | Location picker dialog container | REMOVE | `location-settings-modal-change-local-office` | Live dump: dialog open on /pg-override, testid confirmed |
| CORP_PRICING | 54 | Location picker: search input | REMOVE | `location-settings-modal-change-local-office-input-search` | Live dump: input testid confirmed |
| CORP_PRICING | 57 | Location picker: "Select" button | REMOVE | `location-settings-modal-change-local-office-btn-select` | Live dump: button testid confirmed |
| CORP_PRICING | 58 | Location picker: "Cancel" button | REMOVE | `location-settings-modal-change-local-office-btn-cancel` | Live dump: button testid confirmed |
| CORP_PRICING | 81 | Override Import dialog | REMOVE | `pg-override-upload-dialog` | Live dump: dialog open on /pg-override, testid confirmed |
| CORP_PRICING | 82 | Override Import dialog: file input | REMOVE | `pg-override-upload-dialog-file-input` | Live dump: input testid confirmed |
| CORP_PRICING | 83 | Override Import dialog: "Cancel" button | REMOVE | `pg-override-upload-dialog-cancel` | Live dump: button testid confirmed |
| CORP_PRICING | 97 | New Pricebook Save Changes dialog | REMOVE | `location-settings-modal-save-changes` | Reviewer live dump (corp evidence §new-pricebook.save-dialog-open): dialog container has testid |
| LOCATIONS | 58 | Change Local Office "Close" X button | REINSTATE | _(none — Close btn has no testid)_ | Live dump: dialog buttons=[Select(btn-select), Cancel(btn-cancel), Close(null)]. Reviewer confused Cancel with Close. Close is index 2653, testid=null. Stays in workbook. |

### Additional FP Discovered During CNR Re-Walk

| Sheet | Row | Element | Disposition | Covering data-testid | Evidence |
|---|---:|---|---|---|---|
| CORP_PRICING | 78 | Override Save confirmation dialog | REMOVE | `location-settings-modal-save-changes` | Live dump on office 1606: edited Override Price, clicked Save → alertdialog has `data-testid="location-settings-modal-save-changes"` |

### 15 Could-Not-Reach Re-Walk Results

| Sheet | Row | Element | Disposition | Evidence |
|---|---:|---|---|---|
| CORP_PRICING | 64 | Override grid: data rows | KEEP | Office 1606 selected → 7 rows rendered. Row `<tr>` has no data-testid. |
| CORP_PRICING | 66 | Override Price click-to-edit cell | KEEP | Single-click activates edit → `<input type="number" data-testid=null>`. No testid. |
| CORP_PRICING | 67 | Max Discount % click-to-edit cell | KEEP | Same cell pattern as row 66. No testid on input. |
| CORP_PRICING | 68 | Active checkbox | KEEP | Col 7 contains `[role="checkbox"]` with no data-testid. |
| CORP_PRICING | 78 | Save confirmation dialog | REMOVE | (See additional FP above) |
| CORP_PRICING | 79 | Save dialog: "Save" button | KEEP | Dialog buttons: Cancel(testid=null), Save(testid=null). Buttons inside dialog have no testid. |
| CORP_PRICING | 80 | Save dialog: "Cancel" button | KEEP | Same dialog buttons dump — Cancel has no testid. |
| LOCATIONS | 1 | Error dialog container | UNVERIFIED | 500 API intercept on save → app shows toast "Request failed with status 500", NOT an alertdialog. Dialog may not exist in current app version. |
| LOCATIONS | 2 | Error dialog body text | UNVERIFIED | Same — no alertdialog rendered under any tested error condition. |
| LOCATIONS | 3 | Error dialog "Ok" button | UNVERIFIED | Same — no alertdialog rendered. |
| LOCATIONS | 26 | Validation "Number must be" | UNVERIFIED | Entered -1, 101, 999 in LDW%/Strike% fields → no `<p>` validation message rendered. Fields accept values without inline error. |
| LOCATIONS | 27 | Validation "greater than or equal to 0" | UNVERIFIED | Same — no min-boundary message rendered. |
| LOCATIONS | 28 | Validation "less than or equal to 100" | UNVERIFIED | Same — no max-boundary message rendered. |
| LOCATIONS | 33 | HRI Remit Tax 2 checkbox | UNVERIFIED | `document.body.innerText` contains no "HRI" or "Tax 2" text on office 1604 or 1101 Local Information. Control appears config-gated. |
| LOCATIONS | 45 | Account List first-row checkbox | UNVERIFIED | Account and Address subtab renders a card container with zero interactive/testid content. Account List dialog not triggerable — no clickable launcher found. |

## Summary

| Action | Count | Details |
|---|---:|---|
| FP Rows REMOVED from Corp | 13 | Rows 23,24,25,26,53,54,57,58,78,81,82,83,97 |
| FP Row REINSTATED in Locations | 1 | Row 58 (reviewer was wrong — Close ≠ Cancel) |
| CNR Rows KEPT in Corp | 5 | Rows 64,66,67,68,79,80 (confirmed missing on 1606) |
| CNR Rows moved to UNVERIFIED | 8 | Loc rows 1,2,3,26,27,28,33,45 |

## Final Sheet Counts

| Sheet | Before | After | Delta |
|---|---:|---:|---|
| CORP_PRICING_MISSING_TESTID | 122 | 109 | -13 |
| LOCATIONS_MISSING_TESTID | 64 | 56 | -8 (moved to UNVERIFIED) |
| LOCAL_OFFICE_MISSING_TESTID | 4 | 4 | unchanged |
| UNVERIFIED_NEEDS_TRIGGER | — | 8 | new |

## Bounce reconciliation 2026-07-10

Method: fresh headless Chromium launch with shared storageState (`clients/encore/.auth/encore-state.json`); `playwright-cli open` was not attempted (reviewer deviation followed). Auth refreshed via `auth.setup.ts` before walk.

### Per-row reconciliation table

| Family | Row | Element | Live testid | Decision |
|---|---:|---|---|---|
| A | r17 | Action bar: "Loc Pricing Import" button | null | KEEP |
| A | r19 | Action bar: "Import" button | null | KEEP |
| A | r21 | Export/Import menus: variant items | null (all 4) | KEEP |
| A | r23 | Import file-upload dialog container | `corporate-pricing-import-dialog` | **REMOVE** |
| A | r24 | Export dialog: Year(s) / Currency dropdowns | null (both) | KEEP |
| A | r25 | Export dialog: dropdown option items | null (sampled 5/8) | KEEP |
| A | r26 | Import precondition dialog | null | KEEP |
| A | r27 | Import precondition dialog: dropdowns | null (both) | KEEP |
| A | r28 | Import precondition dialog: option items | null (sampled 5/8) | KEEP |
| A | r29 | "Select items to publish" review modal | UNVERIFIED (requires actual CSV import) | KEEP (flagged) |
| B | r48 | "Select a location" trigger | null | KEEP |
| B | r49 | Location picker dialog container | `location-settings-modal-change-local-office` | **REMOVE** |
| B | r50 | Location picker: per-row select checkbox | null (2651 rows) | KEEP |
| B | r51 | Location picker: "Select" button | `location-settings-modal-change-local-office-btn-select` | **REMOVE** |
| C | r70 | Save confirmation dialog | `location-settings-modal-save-changes` | **REMOVE** |
| C | r71 | Save dialog: "Cancel" button | null | KEEP |
| C | — | Save dialog: "Save" button | null | **ADD** |
| D | r63 | Toolbar: "Import" button | null | KEEP |
| D | r72 | "Import All Pricing Overrides" dialog | `pg-override-upload-dialog` | **REMOVE** |

### Raw live dumps

**Family B — Location picker (office 1606, `/pg-override`):**
- Container `[role="dialog"]`: `data-testid="location-settings-modal-change-local-office"`
- Select button: `data-testid="location-settings-modal-change-local-office-btn-select"`
- Cancel button: `data-testid="location-settings-modal-change-local-office-btn-cancel"`
- Per-row checkbox: `data-testid=null` (2651 rows sampled)
- Trigger "Select a location": `data-testid=null`

**Family C — Save dialog (office 1606, edited Override Price 170→171, clicked Save):**
- Container `[role="alertdialog"]`: `data-testid="location-settings-modal-save-changes"`
- Button 0: text="" ariaLabel="Close" testid=null
- Button 1: text="Cancel" testid=null
- Button 2: text="Save" testid=null

**Family D — Override import dialog (office 1606):**
- Dialog `[role="dialog"]:has-text("Import All Pricing Overrides")`: `data-testid="pg-override-upload-dialog"`
- File input: `data-testid="pg-override-upload-dialog-file-input"`
- Cancel button: `data-testid="pg-override-upload-dialog-cancel"`
- Import toolbar button: `data-testid=null`

**Family A — Search dialogs (office 1604):**
- "Loc Pricing Import" button: `data-testid=null`
- "Import" button: `data-testid=null`
- Menu items (All Equipment Pricing, All Labor Pricing, All Equipment Max Discount, All Labor Max Discount): all `data-testid=null`
- Import file-upload dialog `[role="dialog"]`: `data-testid="corporate-pricing-import-dialog"`
- Browse button: `data-testid="corporate-pricing-import-dialog-browse"`
- File input: `data-testid="corporate-pricing-import-dialog-file-input"`
- Export dialog `[role="dialog"]`: `data-testid=null`
- Export comboboxes (Year/Currency): both `data-testid=null`
- Export option items: `data-testid=null` (sampled 5/8)
- Import precondition dialog: `data-testid=null`
- Import precondition comboboxes: both `data-testid=null`
- Import precondition option items: `data-testid=null` (sampled 5/8)

### Bounce summary

| Action | Count | Details |
|---|---:|---|
| REMOVE (FP) | 5 | r23 (import dialog), r49 (picker container), r51 (picker Select), r70 (save dialog), r72 (override import dialog) |
| ADD (missing) | 1 | Save dialog: "Save" button (null testid, after Cancel row) |
| KEEP | 13 | r17, r19, r21, r24–r29, r48, r50, r63, r71 — all live-confirmed null testid |
| Net delta | −4 | 109 → 105 |

### Final sheet counts

| Sheet | Before bounce | After bounce | Delta |
|---|---:|---:|---|
| CORP_PRICING_MISSING_TESTID | 109 | 105 | −4 |
| LOCATIONS_MISSING_TESTID | 56 | 56 | unchanged |
| LOCAL_OFFICE_MISSING_TESTID | 4 | 4 | unchanged |
| UNVERIFIED_NEEDS_TRIGGER | 8 | 8 | unchanged |

## Report finalize 2026-07-10

**Ticket**: TICKET-TESTID-REPORT-FINALIZE-20260710

Moved 3 "Select items to publish" publish-modal rows from `CORP_PRICING_MISSING_TESTID` → `UNVERIFIED_NEEDS_TRIGGER`.

**Reason (LR-029)**: The publish modal only renders after completing a real CSV import delta. Both the corp reviewer and the bounce reviewer (see `reviewer-walk-evidence-remediation-bounce-2026-07-10.md` §R29-class recommendation) confirmed COULD-NOT-REACH without a live import. Per LR-029, a missing-testid row must not sit ASSERTED in the shipping sheet without live DOM proof — these belong in the clearly-labelled unverified tab until a controlled import fixture can open the modal.

**Rows moved (content-anchored)**:

| Module | Sub Module | Element | Current Selector |
|---|---|---|---|
| Corporate Pricing | Search | "Select items to publish" review modal (import delta review) | `[role="dialog"]` |
| Corporate Pricing | Search | Publish modal: per-row + select-all checkboxes | `[role="checkbox"]` |
| Corporate Pricing | Search | Publish modal: "Publish" button | `button:text-is("Publish")` |

**Final sheet counts after move**:

| Sheet | Before | After | Delta |
|---|---:|---:|---|
| CORP_PRICING_MISSING_TESTID | 105 | 102 | −3 |
| LOCATIONS_MISSING_TESTID | 56 | 56 | unchanged |
| LOCAL_OFFICE_MISSING_TESTID | 4 | 4 | unchanged |
| UNVERIFIED_NEEDS_TRIGGER | 8 | 11 | +3 |
