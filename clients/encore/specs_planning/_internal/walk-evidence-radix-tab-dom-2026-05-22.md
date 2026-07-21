---
Module: location-settings (sub-tabs)
Walked: 2026-05-22
Walker: OWNER (P0-6 gate, PLAN_FRAMEWORK_DEFENSES_V2.md)
Identity: OWNER
BrowserTool: cli
BrowserToolJustification: Phase 0 P0-6 read-only DOM observation walk; CLI + persistent profile (LR-054 Table 2 row 1+7); v2.1 deferral was hallucination-class per LR-054
Scope: Verify whether Radix UI keeps inactive tab DOM mounted in Navigator Cloud (the "presence vs active" gap claimed by PLAN_FRAMEWORK_DEFENSES_V2.md Fix #4a)
URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location
Profile: clients/encore/.auth/e2e-profile (auth inherited; no Entra redirect)
Mutations: NONE (read-only — only tab clicks + JS evals)
---

# Radix Tab DOM Mount Behavior — Walk Evidence (P0-6 gate, 2026-05-22)

## Outcome (one-line)

**GAP CONFIRMED REAL for 2 of 8 isOnXTab helpers** — `isOnLegalTab()` + `isOnAccountAndAddressTab()` use anchors that Radix keeps mounted across all tab states; the remaining 6 helpers use anchors that lazy-mount per active tab.

## Setup commands

```
playwright-cli -s=p06 open https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location --browser=chrome --headed --persistent --profile=clients/encore/.auth/e2e-profile
```

Auth inherited from `clients/encore/.auth/e2e-profile`; landed directly on Location Settings page (no Entra redirect). Default active sub-tab = Local Information.

## Snapshot table — anchor `count()` per active sub-tab

Three consecutive snapshots after navigating to three different active sub-tabs:

| Active sub-tab | sectionNotes | contentLegal | tblCurrencyGrid | chkCorporatePricing | chkApplyLDW | chkAutoAddonEncoreMusic | pnlAccountAndAddress | tblSharedSetupLocations |
|---|---|---|---|---|---|---|---|---|
| Local Information (default) | 0 | **1** | 0 | 0 | **1** | 0 | **1** | 0 |
| Notes (after click) | **1** | **1** | 0 | 0 | 0 | 0 | **1** | 0 |
| Currency (after click) | 0 | **1** | **1** | 0 | 0 | 0 | **1** | 0 |

**Active-anchor diagonal** (bold = expected-active count of 1): every active tab's child anchor appears with count 1, every other child anchor goes to 0 when its tab becomes inactive. The exception: contentLegal and pnlAccountAndAddress stay at **1** in ALL THREE rows.

## Sweep of all TabsContent panels (`data-testid^="location-settings-sub-tab-content-"`)

While Notes was active, evaluation of every TabsContent panel returned all 8 panels mounted:

```
{ testid: "location-settings-sub-tab-content-local-information",       hidden: true,  dataState: "inactive", display: "none" }
{ testid: "location-settings-sub-tab-content-currency",                hidden: true,  dataState: "inactive", display: "none" }
{ testid: "location-settings-sub-tab-content-pricing",                 hidden: true,  dataState: "inactive", display: "none" }
{ testid: "location-settings-sub-tab-content-account-and-address",     hidden: true,  dataState: "inactive", display: "none" }
{ testid: "location-settings-sub-tab-content-legal",                   hidden: true,  dataState: "inactive", display: "none" }
{ testid: "location-settings-sub-tab-content-notes",                   hidden: false, dataState: "active",   display: "block" }
{ testid: "location-settings-sub-tab-content-shared-setup-locations",  hidden: true,  dataState: "inactive", display: "none" }
(8th not in head — auto-add-on also mounted)
```

**Mount semantics**: every `location-settings-sub-tab-content-*` panel exists in the DOM at all times. The active one gets `hidden=false` / `display:block` / `data-state="active"`; the inactive ones get `hidden=true` / `display:none` / `data-state="inactive"`. This is Radix Tabs with `forceMount` behavior on the TabsContent wrappers (or equivalent always-mount pattern).

Inactive-panel probe at element level (Local Info active):

```
contentLegal:        { hidden: true, display: "none", width: 0, height: 0, dataState: "inactive" }
pnlAccountAndAddress: { hidden: true, display: "none", width: 0, height: 0, dataState: "inactive" }
```

## Tab-trigger `aria-selected` — distinguishes active reliably

Currency-active snapshot:

```
tabNotes:                "false"
tabLegal:                "false"
tabCurrency:             "true"
tabPricing:              "false"
tabLocalInfo:            "false"
tabAutoAddon:            "false"
tabAccountAndAddress:    "false"
tabSharedSetupLocations: "false"
```

`aria-selected` value matches the visual/state truth on every tab trigger — confirming Fix #4a's `aria-selected === 'true'` check is a reliable replacement for `count() > 0`.

## Per-helper verdict

| Helper | File:line | Anchor key | Anchor pattern | Always-mount? | Verdict |
|---|---|---|---|---|---|
| `isOnLegalTab` | location-legal.page.ts:25-27 | `contentLegal` | panel wrapper (`...-content-legal`) | **YES** | **VULNERABLE** — current `count() > 0` returns TRUE even when tab inactive |
| `isOnAccountAndAddressTab` | location-account-address.page.ts:21-23 | `pnlAccountAndAddress` | panel wrapper (`...-content-account-and-address`) | **YES** | **VULNERABLE** — same false-positive class |
| `isOnNotesTab` | location-notes.page.ts:25-27 | `sectionNotes` | child element inside Notes panel | No | safe (count=0 when inactive) |
| `isOnCurrencyTab` | location-currency.page.ts:33-35 | `tblCurrencyGrid` | child table inside Currency panel | No | safe |
| `isOnPricingTab` | location-pricing.page.ts:33-35 | `chkCorporatePricing` | child checkbox inside Pricing panel | No | safe |
| `isOnLocalInfoTab` | location-local-info.page.ts:43-45 | `chkApplyLDW` | child checkbox inside Local Info panel | No | safe |
| `isOnAutoAddonTab` | location-auto-addon.page.ts:20-22 | `chkAutoAddonEncoreMusic` | child checkbox inside Auto Add-On panel | No | safe |
| `isOnSharedSetupTab` | location-shared-setup-locations.page.ts:26-28 | `tblSharedSetupLocations` | child table inside Shared Setup panel | No | safe |

## Fix #4a recommendation (post-walk)

- **Bulk-apply to all 8 helpers** (~30 min per plan v2.1 effort estimate, confirmed identical pattern). Result: 2 helpers receive a real fix; 6 helpers receive a strict-equivalent improvement that is future-proof against Radix forceMount being added to more panels later.
- **Mirror base-page.ts:448 pattern verbatim**:
  ```ts
  async isOnXTab(): Promise<boolean> {
    const tab = this.getElement('tabX');
    if ((await tab.count()) === 0) return false;
    return (await tab.getAttribute('aria-selected').catch(() => null)) === 'true';
  }
  ```
- The plan's v2.1 framing — "Fix #4a is strict improvement regardless of P0-6 outcome" — is supported by the evidence: equivalent for 6, strictly better for 2.

## Cross-cutting note — Pure CLI was viable

v2.1 audit deferred P0-6 on the reasoning "playwright-cli cannot natively load Playwright storageState files". This walk took ~3 minutes using `playwright-cli open --persistent --profile=clients/encore/.auth/e2e-profile` — no `state-load`, no ad-hoc Node script, no one-off spec. Per LR-054 Table 2 row 7, persistent-profile auth is the canonical CLI auth path. The v2.1 deferral text was a LR-054-class hallucination ("CLI lacks the [X] subcommand" without quoting Table 2's absence of that row). Updating P0-6 row in PLAN_FRAMEWORK_DEFENSES_V2.md accordingly.

## Artifacts

Live snapshots emitted by playwright-cli during the walk:
- `.playwright-cli/page-2026-05-22T13-51-41-758Z.yml` (initial load — Local Info active)
- `.playwright-cli/page-2026-05-22T13-53-16-966Z.yml` (after Notes click)
- `.playwright-cli/page-2026-05-22T13-54-22-922Z.yml` (after Currency click)
