# BUG-DOP-LOC-002 — T14 persistence conclusion overturned by T16 positive-control run

**severity**: ~~High~~ — NOT A DEFECT
**tab**: Tab 1 (Locations)
**baselineComparison**: not-checked
**status**: CLOSED — NOT A PRODUCT DEFECT (T14's verdict overturned; confirmed by repeated runs)
**date**: 2026-08-11
**closedDate**: 2026-08-11

## ⚠️ CLOSED — the product behaves correctly

Saving a `No Implied Start` date works. The save fires a `PUT` (HTTP 200) and the value survives a
reload. This file is retained as the record of how the wrong verdict was reached, not as an open defect.

**Final confirmation (2026-08-11, after the test-side fix):** TC-DOP-OPT-050 passed 5/5 in isolation and
passed in all four full-suite runs recorded under `reports/test-runs/` — two at the repository's default
worker count and two at four workers. The original failure was caused by the test asserting persistence
on a grid row that seventeen sibling tests also mutate; pointing it at a dedicated row removed the
interference. Root cause: a test-isolation defect on our side, compounded by the unsaved-changes dialog
swallowing input during the original probe.

## summary
T14 RCA concluded that saving a `No Implied Start` date change for "The Abbey Resort" fires zero
network requests and the value reverts after reload (PRODUCT-DEFECT). T16 positive-control run
overturns this: a PUT request DID fire (HTTP 200) and the value DID persist after reload.
TC-DOP-OPT-050's failure is therefore a **test defect**, not a product defect.

## what T14 observed (now known to be incorrect)
- `pressSequentially` and calendar-picker inputs both appeared to set the date correctly
- Save became enabled and the click landed (button went disabled)
- Network filter (`url.includes('discount') || url.includes('optimization') || url.includes('navigator/api')`)
  captured **0 requests**
- After reload the date read `08/08/2019` (the original value)
- Verdict recorded: PRODUCT-DEFECT

## what T16 found (positive-control run, 2026-08-11)

### positive control
- `GET https://cloudapps-e2e.encoreglobal.com/navigator/api/discount/optimization?skipPagination=true 200`
  — seen immediately after page load, proving the network capture was functional.

### full request dump around Save
```
PUT https://cloudapps-e2e.encoreglobal.com/navigator/api/discount/optimization/locations  200
```
(1 request total; no GET/POST/PATCH/DELETE)

### reload check
After reload, `No Implied Start` for "The Abbey Resort" read **`01/15/2020`** — the changed value,
not the original `08/08/2019`. The save persisted correctly.

### row restore
After confirming persistence, the row was restored to `08/08/2019` via a second Save cycle.
Final confirmed value on reload: **`08/08/2019`**.

## root cause of T14 error
T14's instrumented run did not dismiss the `alert-dialog-overlay` that appears immediately after
clicking the Abbey Resort toggle button. That overlay intercepted all subsequent pointer events,
preventing the date input from actually receiving the type sequence. The Save button may have
become enabled due to other dirty state already present on the page, not the date change.
The network capture correctly reported 0 matching requests — because no date-save was actually
triggered. The T14 confounder analysis ("both beforeunload guard and 500 error would show a
request, so none rules both out") was correct in logic but the underlying save cycle was
not actually exercised.

## stepsToReproduce (confirmed working flow)
1. Navigate to Discount Optimization Settings for office 1604.
2. Wait for the Locations tab to load fully.
3. Click the Abbey Resort row toggle button to expand it.
4. If an alert-dialog appears, dismiss it (Escape or Cancel).
5. Locate the `No Implied Start` date input (`input[aria-label="Select date"]`).
6. Clear the input and type `01/15/2020`.
7. Tab out — Save button becomes enabled.
8. Click Save — a `PUT /navigator/api/discount/optimization/locations` fires (HTTP 200).
9. Reload the page and expand the Abbey Resort row.
10. `No Implied Start` reads `01/15/2020` — change persisted.

## baselineComparison
`not-checked` — per ticket constraint, `navigator2.training.psav.com` was not visited.

## action required
- TC-DOP-OPT-050 must be reclassified as a **test defect** and fixed to handle the
  alert-dialog that appears on row expand before interacting with the date input.
- The PRODUCT-DEFECT comment added by T14 in the spec should be removed once the test fix is
  verified.
- The T14 rca-report.md should be annotated with this correction.

## relatedTests
TC-DOP-OPT-050 (currently failing — test defect, not product defect)

## evidence
- `t16-03-after-save.png` — state after Save click (PUT fired, button disabled)
- `t16-04-after-reload.png` — page after reload showing date `01/15/2020` persisted
- `t16-05-restored.png` — page after restore showing `08/08/2019`
  (all in `clients/encore/reports/walk-evidence/discount-optimization-2026-08-11/`)
