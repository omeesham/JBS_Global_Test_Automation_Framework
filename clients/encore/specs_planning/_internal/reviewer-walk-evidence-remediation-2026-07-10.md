---
title: Reviewer Walk Evidence - Missing TestID Remediation Review
date: 2026-07-10
ticket: TICKET-TESTID-REMEDIATION-REVIEW-20260710
auth_state: clients\encore\.auth\encore-state.json
fresh_dump_utc: 2026-07-10T11:54:15.350Z
verdict: RED
---

# Reviewer Walk Evidence - 2026-07-10

Method: attempted `playwright-cli` with `state-load`; runtime denied `open`, so the live DOM dump below was produced by a fresh headless Chromium Playwright launch using the same shared storage state.

## Workbook read-back

| Sheet | Data rows | Header |
|---|---:|---|
| CORP_PRICING_MISSING_TESTID | 109 | `["Module","Sub Module","Element","Current Selector"]` |
| LOCATIONS_MISSING_TESTID | 56 | `["Module","Sub Module","Element","Current Selector"]` |
| LOCAL_OFFICE_MISSING_TESTID | 4 | `["Module","Sub Module","Element","Current Selector"]` |
| UNVERIFIED_NEEDS_TRIGGER | 8 | `["Module","Sub Module","Element","Current Selector"]` |

Ticket row labels shifted in the current workbook. Matched current rows by element text: override data rows=CORP row 56, Override Price=58, Max Discount=59, Active=60, save dialog container=70, save dialog Cancel=71; no current CORP row exists for save dialog `Save` button.

Spot absence checks: exact strings `corporate-pricing-import-dialog*` and `location-settings-modal-change-local-office*` are absent from CORP selectors, but matching control labels still remain at CORP rows 23, 49, and 51.

## Raw live dump - Corp Override office 1606

```json
{
  "url": "https://cloudapps-e2e.encoreglobal.com/navigator/locations/1606/settings/corporate-pricing/pg-override",
  "locationPicker": {
    "container": {"tag":"div","role":"dialog","dataTestId":"location-settings-modal-change-local-office"},
    "selectButton": {"tag":"button","text":"Select","dataTestId":"location-settings-modal-change-local-office-btn-select"},
    "cancelButton": {"tag":"button","text":"Cancel","dataTestId":"location-settings-modal-change-local-office-btn-cancel"}
  },
  "gridRowCount": 7,
  "gridRows": [
    {"index":0,"tag":"tr","dataTestId":null,"text":"1606 2606 House Video Monitor LED 40-49 USD 0.00 170.00"},
    {"index":1,"tag":"tr","dataTestId":null,"text":"1606 2607 House Video Monitor LED 50-59 USD 0.00 278.00"},
    {"index":2,"tag":"tr","dataTestId":null,"text":"1606 2608 House Video Monitor LED 60-69 USD 0.00 391.00"},
    {"index":3,"tag":"tr","dataTestId":null,"text":"1606 2609 House Video Monitor LED 70-79 USD 0.00 500.00"},
    {"index":4,"tag":"tr","dataTestId":null,"text":"1606 2610 House Video Monitor LED 80-89 USD 0.00 613.00"},
    {"index":5,"tag":"tr","dataTestId":null,"text":"1606 2611 House Video Monitor LED 90-99 USD 0.00 721.00"},
    {"index":6,"tag":"tr","dataTestId":null,"text":"1606 4298 Project Manager (Pre/Post) - Hourly USD 305.00 204.00"}
  ],
  "rowTr": {"tag":"tr","dataTestId":null},
  "overridePriceInput": {"tag":"input","type":"number","dataTestId":null,"valueBefore":"170"},
  "maxDiscountInput": {"tag":"input","type":"number","dataTestId":null,"valueBefore":""},
  "activeCheckbox": {"tag":"button","role":"checkbox","ariaChecked":"true","dataTestId":null},
  "saveDialogContainer": {"tag":"div","role":"alertdialog","dataTestId":"location-settings-modal-save-changes","text":"Save Changes Are you sure you want to save the changes? Cancel Save"},
  "saveDialogButtons": [
    {"index":0,"text":"","ariaLabel":"Close","dataTestId":null},
    {"index":1,"text":"Cancel","dataTestId":null},
    {"index":2,"text":"Save","dataTestId":null}
  ]
}
```

## Raw live dump - Locations office 1604

```json
{
  "url": "https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location",
  "dialogContainer": {"tag":"div","role":"dialog","text":"Change Local Office Current: 1604 - Parker Palm Springs Select Cancel Close","dataTestId":"location-settings-modal-change-local-office"},
  "buttons": [
    {"index":0,"text":"Select","dataTestId":"location-settings-modal-change-local-office-btn-select"},
    {"index":1,"text":"Cancel","dataTestId":"location-settings-modal-change-local-office-btn-cancel"},
    {"index":2,"text":"Close","dataTestId":null,"attributes":{"data-slot":"dialog-close"}}
  ]
}
```

## Per-claim verdicts

| Ticket row | Surface | Verdict | Evidence |
|---:|---|---|---|
| 64 | Corp Override grid data row `<tr>` | REPRODUCED | Live 1606 grid rendered 7 rows; sampled `<tr>` and all dumped row entries have `dataTestId:null`; current workbook keeps it as CORP row 56. |
| 66 | Corp Override Price click-to-edit input | REPRODUCED | Activated editor is `<input type="number">` with `dataTestId:null`; current workbook keeps related element as CORP row 58. |
| 67 | Corp Max Discount % click-to-edit input | REPRODUCED | Activated editor is `<input type="number">` with `dataTestId:null`; current workbook keeps related element as CORP row 59. |
| 68 | Corp Active checkbox cell | REPRODUCED | Live control is `<button role="checkbox" aria-checked="true">` with `dataTestId:null`; current workbook keeps it as CORP row 60. |
| 78 | Corp Save confirm dialog container | WRONG | Live container has `dataTestId:"location-settings-modal-save-changes"`, but current workbook still lists Product Group Override `Save confirmation dialog` as CORP row 70 with `[role="alertdialog"]`; remove that false positive. |
| 79 | Corp Save confirm dialog `Save` button | WRONG | Live `Save` button has `dataTestId:null`, but current workbook has no Product Group Override `Save dialog: "Save" button` row; reinstate/add this missing-testid row. |
| 80 | Corp Save confirm dialog `Cancel` button | REPRODUCED | Live `Cancel` button has `dataTestId:null`; current workbook keeps it as CORP row 71. |
| 58 | Locations Change Local Office Close X | REPRODUCED | Live buttons are Select=`location-settings-modal-change-local-office-btn-select`, Cancel=`location-settings-modal-change-local-office-btn-cancel`, Close=`null`; current workbook keeps Close as LOC row 51. |

VERDICT: RED

Discrepancies: (1) Corp Product Group Override save dialog container still appears in the workbook even though live DOM has `location-settings-modal-save-changes`. (2) Corp Product Group Override save dialog `Save` button is absent from the workbook even though live DOM shows no `data-testid`. (3) Exact removed-FP testid strings are absent from CORP, but matching control labels for import/location-picker still remain at CORP rows 23, 49, and 51.
