---
artifact: service-charge-p1-editmode-probe
client: encore
session_date: 2026-08-16
author_identity: OWNER
page_url: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge
ticket: TICKET-p70-P1-PROBE
---

# Service Charge — P1 Edit-Mode-Click Probe

## Decision Token

DISTINCT-ARCHETYPE

**Distinguishing attributes**: `tagName` (A vs INPUT), `inputmode` (null vs decimal), `href` (present vs null). The 6 controls are sidebar navigation anchor links, not form inputs.

## Positive Control

Status: **PROBE-VALID**

First percentage input (`data-testid=service-charge-percentage-0`):
- tagName: INPUT
- type: null
- inputmode: decimal
- role: null
- href: null

## 6 Edit-Mode-Click Controls — Full Attribute Table

| control_key | linkName | tagName | type | inputmode | role | href | formcontrolname | data-testid | id |
|---|---|---|---|---|---|---|---|---|---|
| struct:a\|Home\|div/div/div/div/ul/li | Home | A | null | null | null | /navigator/locations/1604/home | null | null | null |
| struct:a\|Inbox\|div/div/div/div/ul/li | Inbox | A | null | null | null | /navigator/locations/1604/inbox | null | null | null |
| struct:a\|Job Search\|div/div/div/div/ul/li | Job Search | A | null | null | null | /navigator/locations/1604/fulfillments | null | null | null |
| struct:a\|Asset Search\|div/div/div/div/ul/li | Asset Search | A | null | null | null | /navigator/locations/1604/assets | null | null | null |
| struct:a\|Customer Search\|div/div/div/div/ul/li | Customer Search | A | null | null | null | /navigator/locations/1604/customers | null | null | null |
| struct:a\|Item Search\|div/div/div/div/ul/li | Item Search | A | null | null | null | /navigator/locations/1604/products | null | null | null |

Post-click: all 6 remained on service-charge URL (click attempted; page did not navigate away). No reveal state — these are plain navigation anchors, not click-to-edit controls.

## PCT Sample (3 representative inputs)

| data-testid | tagName | type | inputmode | formcontrolname | href |
|---|---|---|---|---|---|
| service-charge-percentage-0 | INPUT | null | decimal | null | null |
| service-charge-percentage-20 | INPUT | null | decimal | null | null |
| service-charge-percentage-50 | INPUT | null | decimal | null | null |

## Attribute Comparison: 6 nav links vs 79 pct inputs

| attribute | 6 edit-mode-click controls | 79 pct inputs |
|---|---|---|
| tagName | **A** | INPUT |
| type | null | null |
| inputmode | **null** | **decimal** |
| href | **present (nav path)** | null |
| formcontrolname | null | null |
| data-testid | null | service-charge-percentage-N |

## Conclusion

The 6 controls are sidebar navigation `<A href>` links — not form fields at all. The enumerator's `probe: 'edit-mode-click'` classification is a **false positive**: these controls were included in the walk denominator as interactive elements, but they carry no editable state and no form attributes. They need their own classification path in the enumerator's classifier:
- Classifier rule to add: `tagName === 'A' && href present` → type = `navigation-link` (not any form-input archetype)

A single `SAME-CLASS` rule covering both would be incorrect — navigation links must not be treated as numeric inputs.

## Raw Artifacts

- `out-P1/p1-editmode-controls.verify.json` — full JSON with all attrs before/after click
- `out-P1/p1-pct-sample.verify.json` — pct sample
- `out-P1/p1-positive-control.verify.txt` — positive control
- `out-P1/P1-HASHES.txt` — SHA256 of all verify artifacts

## Observations

### Bugs/Defects

- BUG-CANDIDATE: The `enumerate-page.mjs` walk-coverage denominator includes sidebar navigation links (Home, Inbox, Job Search, Asset Search, Customer Search, Item Search) as enumerated controls on the service-charge page. These are global nav elements present on every page, not service-charge-specific form controls. Their inclusion inflates the denominator and causes spurious `unresolved:edit-mode-click` records. The classifier fix must exclude `<A href>` nav elements or restrict the denominator to controls within the page's content area.

### Suggestions

none
