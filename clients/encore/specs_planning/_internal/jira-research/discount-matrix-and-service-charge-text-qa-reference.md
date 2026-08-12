---
title: Discount Matrix & Service Charge Text — QA Data Requirements Reference
source: Jira (encore.atlassian.net, project NM) + Confluence (space NM)
compiled: 2026-07-28
verified_live: NO — this is a Jira/Confluence research compilation, not a live-UI-verified field inventory
---

# Discount Matrix & Service Charge Text — QA Data Requirements Reference

## How to use this document

This is a QA knowledge-base reference for two Navigator modules — **Discount Matrix** and **Service Charge Text (SCT)** — compiled entirely from Jira tickets and Confluence design specs. It exists to give the whole QA team one place to see: what data each module manages, what the business rules and validations are supposed to be, what's already broken (known defects to use as regression checks), and what data sets automation/manual testers need to seed.

**This is not a live-verified field inventory.** Nothing here was confirmed against the running app. Before writing test cases or automation off of this doc, cross-check the relevant screen live — several items below are *known contradictions between the Jira AC and the current QA Defects* (flagged inline), and Jira descriptions occasionally disagree with each other (also flagged). Treat this as a fast-start map, not ground truth.

Ticket keys are Navigator Microservices project (`NM-`) on `https://encore.atlassian.net`.

---

# Module 1: Discount Matrix

## 1.1 Business purpose

The Discount Matrix controls how much discount an order can carry before it requires manager approval. It's configured per **Country / Currency / Business Tier**, and feeds directly into the **Order Approval (Discount, EPT, Capped)** workflow in Order Entry: when an order's effective discount % meets or exceeds the matrix limit for its revenue tier + peak type + booking window, the order is blocked from quoting/RTI until approved. This makes Discount Matrix data correctness a **direct gate on revenue**, not just a setup screen — a bad tier boundary or wrong peak-type mapping can either wrongly force approvals or wrongly let orders through un-approved.

Legacy: `DiscountMatrixController.cs` / `DiscountMatrixBLL`. New home: `DiscountsService` (being extended, not a new microservice) — see [Order Approval (Discount, EPT, Capped) — Microservice Design](https://encore.atlassian.net/wiki/spaces/NM/pages/3874095123).

## 1.2 Architecture / ownership

- **Epic/parent stories**: [NM-1668](https://encore.atlassian.net/browse/NM-1668) (MFE page), [NM-1681](https://encore.atlassian.net/browse/NM-1681) (Location Activation API), [NM-1657](https://encore.atlassian.net/browse/NM-1657) (Region Weekly Peak read API)
- **UI**: React/Next.js MFE, replacing legacy Angular `discount-pricing-matrix.component.ts`, `company-matrix.component.ts`, `region-weekly-peak.component.ts`, `location-activation.component.ts`
- **Storage**: Cosmos DB (`DiscountMatrixRegionPeak` documents, etc.) — legacy SQL Server IDs are being replaced by Cosmos GUIDs (see §1.7 export ID discussion)
- **Route**: `/setup/discount-pricing/matrix`
- **Adjacent/related service** (do not confuse with Discount Matrix): the separate **Pricing Microservice** (`PricingService` — pricebooks, product-group prices, max-discount overrides) is a related but distinct system. See [Pricing](https://encore.atlassian.net/wiki/spaces/NM/pages/3866099713) if a ticket mentions "pricebook" — that's not this module.
- **Order Service integration** (consumer of this data): [NM-2976](https://encore.atlassian.net/browse/NM-2976) — Order Service resolves discount limits + approval thresholds from DiscountsService. Status: **To Do** as of this compile — i.e. the Order Entry side of the integration was not yet built.

## 1.3 Page structure

One page, one header strip, three tabs:

| Header field | Type | Notes |
|---|---|---|
| Country | dropdown | drives currency/tier context |
| Currency | dropdown | also derives `currencyAbbrv` used in export filenames |
| Business Tier | dropdown | defaults to `Standard` if present, else first available |
| GAV Discount Threshold | percent input, 1 decimal | non-negative; validation message key `INVALID_GAV_DISCOUNT_THRESHOLD` |

Culture-based default `(countryId, currencyId)` on page load (legacy parity, [NM-2218](https://encore.atlassian.net/browse/NM-2218)):

| Culture | Default countryId/currencyId |
|---|---|
| `en-CA` / `fr-CA` | `4 / 2` |
| `es-MX` | `3 / 3` |
| default (else) | `1 / 1` |

Header `Save` persists **only** the GAV Threshold (`PUT /api/discount-matrix/countries/{countryId}/currencies/{currencyId}/threshold`). Each tab saves itself independently.

Tabs, in order:

1. **Company Matrix** — [NM-2219](https://encore.atlassian.net/browse/NM-2219)
2. **Region Weekly Peaks** — [NM-2220](https://encore.atlassian.net/browse/NM-2220)
3. **Location Activation** — [NM-2221](https://encore.atlassian.net/browse/NM-2221)

## 1.4 Field inventory by tab

### Tab 1 — Company Matrix

Grid of discount tiers keyed by `(countryId, currencyId, businessTierTypeId)`. Legacy: `company-matrix.component.ts`.

| Field | Notes |
|---|---|
| ID | **Cosmos GUID**, not the legacy sequential SQL int (see §1.7 — disputed as bug vs. expected by different people) |
| Revenue Tier (Start–End) | numeric range; tiers auto-split/recalculate when a new tier is inserted inside an existing range |
| Non-Peak % (per booking-window bucket) | percent, editable via "Edit Tier" popup |
| Standard % (per booking-window bucket) | percent |
| Peak % (per booking-window bucket) | percent |
| Booking window buckets | legacy pattern is day ranges, e.g. "0–15 days"; Confluence order-approval doc references booking windows spanning 15–365+ days |

Actions: **Add Tier**, **Delete Tier**, inline edit, bulk **Save**, **Import** (`.xlsx`, validated server-side, row-level errors surfaced, gated on `canEdit`), **Export** (`.xlsx`).

Export filename convention (per AC): `DiscountMatrix-{countryAbbrv}-{currencyAbbrv}-{tier}.xlsx` (e.g. `DiscountMatrix-CAN-CAD-Standard.xlsx`) — **currently broken**, see NM-3255 below.

### Tab 2 — Region Weekly Peaks

52-week grid of peak-type flags per region for a selected year. Legacy: `region-weekly-peak.component.ts`.

| Field | Notes |
|---|---|
| Year | dropdown, populated per country |
| Region | dropdown, populated per country (e.g. "Chicago", the invalid "Western RVP Region - BCAB" seen in NM-3275) |
| Week 1–52 | each week has a Peak / Standard / Non-Peak checkbox (mutually exclusive selection expected) |

Actions: **Create new year** (enter year + week-start date, optional "Copy previous year" toggle, server-side overlap pre-check), bulk **Save**, **Import**/**Export** `.xlsx`.

API surface ([NM-1657](https://encore.atlassian.net/browse/NM-1657)):
```
GET  /api/DiscountMatrix/Region/Years
GET  /api/DiscountMatrix/Region/List
GET  /api/DiscountMatrix/Region/Weeks
GET  /api/DiscountMatrix/Region/Weeks/PreviousYear/LastWeek
POST /api/DiscountMatrix/Region/Weeks/Update
POST /api/DiscountMatrix/Region/Weeks/AddYear
POST /api/discount-matrix/region-peaks/import?countryId&culture
GET  /api/discount-matrix/region-peaks/export?countryId&year&culture
```

### Tab 3 — Location Activation

List of every location for the selected country, with an activate/deactivate toggle. Legacy: `location-activation.component.ts`.

| Field | Notes |
|---|---|
| localOfficeId | location identifier |
| isActivated | boolean toggle, inline-editable |

Actions: inline toggle (marks row dirty), bulk **Save** (only changed rows sent). Record count displayed bottom-right of grid ([NM-2221](https://encore.atlassian.net/browse/NM-2221) AC #6).

API ([NM-1681](https://encore.atlassian.net/browse/NM-1681)):
```
GET  /api/DiscountMatrix/Location?countryId=       (countryId must be > 0)
POST /api/DiscountMatrix/Location/Activation
```
`UpdateAsync` validator: non-empty list, **all items must share the same countryId**, `localOfficeId` non-empty. On update, publishes event `DiscountMatrixLocationActivationUpdated` to topic `discount-matrix`:
```json
{ "countryId": 0, "modUser": "", "modDate": "", "changedLocations": [{ "localOfficeId": "", "isActivated": true }] }
```
— only for items where `isActivated` actually changed.

## 1.5 Business rules this data feeds (Order Approval)

Source: [Order Approval (Discount, EPT, Capped) — Microservice Design](https://encore.atlassian.net/wiki/spaces/NM/pages/3874095123).

- Discount approval is required when `effectiveDiscount ≥ locationLimit`.
- `effectiveDiscount = EffectiveDiscount / (EffectiveDiscount + OrderTotalWithNoTax)`
- The limit is resolved from the matrix by **(revenue tier) × (peak type: Peak/Standard/Non-Peak) × (booking window 15–365+ days)** — i.e. Company Matrix % values and Region Weekly Peak's per-week peak-type assignment combine to produce the actual limit used at order time.
- **Exemptions** (discount matrix + capped-discount approval both skipped): Managed/Growth segment orders.
- If a GAV revenue % exists and is below its threshold, the discount limit is forced to **0** — this is where the header's **GAV Discount Threshold** field is consumed.
- A 2.5% pad tolerance applies against a previously-approved discount before re-triggering approval (configurable, exposed in enterprise UI per the design doc).
- **QA implication**: testing Discount Matrix in isolation (this module's own UI) is necessary but not sufficient — full validation of tier/peak/threshold correctness requires an Order Entry test that actually exercises `effectiveDiscount` against a seeded matrix. As of this compile, [NM-2976](https://encore.atlassian.net/browse/NM-2976) (Order Service ↔ DiscountsService integration) is still **To Do**, so that end-to-end path may not yet be testable.

## 1.6 Permissions

Role function: **`ROLE_FUNCTION_REVENUEMGMT`** (client constant `NavRevenueMgmt`), enforced both client-side (`roleCanView`/`roleCanEdit`) and server-side (`UserBLL.UserHasAccess`) per the [Navigator Legacy Permissions — Design Spec](https://encore.atlassian.net/wiki/spaces/NM/pages/3871342594).

| Access level | Value | Behavior |
|---|---|---|
| None | 1 | page/menu hidden |
| Read | 2 | view only, edit controls disabled |
| Edit (Update) | 3 | full edit + save |

Location Activation API explicitly requires `ROLE_FUNCTION_REVENUEMGMT` + `ROLE_ACCESS_READ` (GET) and `+ ROLE_ACCESS_UPDATE` (POST). This is enforced consistently client and server side (unlike Service Charge Text — see §2.6).

**Test data need**: at least 3 test users/roles per environment — no access, read-only, edit — to verify each of the three tabs independently gates Save/Import/Export controls.

## 1.7 Known defects / edge cases (use as regression bank)

All from Jira QA Defects filed against this module. Status noted — some are already fixed (`Done`), some rejected as not-a-bug, some still open. **Re-verify current status before treating any of these as still-broken.**

| Ticket | Status | Summary | Repro (condensed) |
|---|---|---|---|
| [NM-3239](https://encore.atlassian.net/browse/NM-3239) | QA | Company Matrix: deleting a newly-split revenue tier recalculates the *wrong* remaining boundary (e.g. deleting `100001–400000` should leave `100001–20000000` but leaves `75001–400000` with `400001–20000000` untouched) | Add tier at End=400000 splitting `100001–20000000` into two → delete either half → check the survivor's boundary |
| [NM-3237](https://encore.atlassian.net/browse/NM-3237) | Done | A valid End Tier value *greater* than current max (e.g. 30,000,000 when max is 20,000,000) is rejected with "Invalid End Tier value" — also reproduces on a page with zero existing tiers (fresh country/business-tier combo) | Add Tier → End Tier = 30000000 → Add; also try Mexico / SVP Productions with no existing rows |
| [NM-3236](https://encore.atlassian.net/browse/NM-3236) | Done | Company Matrix export ID column shows Cosmos GUID instead of legacy numeric ID — **note**: a dev comment on [NM-2219](https://encore.atlassian.net/browse/NM-2219) (dated 7/27/2026) says this is *expected* post-Cosmos-migration, contradicting the defect. Confirm current stance before re-testing. |
| [NM-3235](https://encore.atlassian.net/browse/NM-3235) | Review | GAV Discount Threshold and Company Matrix % fields: entering a whole number (e.g. `14`) converts to `1400%` and fails validation; entering the decimal form (`0.14`) works correctly. Whole-number percent entry is broken across both fields. | Enter `14` in GAV Threshold, tab out; repeat with `0.14`; repeat both in Company Matrix Edit-Tier popup |
| [NM-3233](https://encore.atlassian.net/browse/NM-3233) | QA | Add Tier/Export/Import button placement on Company Matrix is inconsistent with other pages (e.g. Tier/Flat Commission); a naive fix (moving to shared action bar) would double up Export/Import on the Region Weekly Peaks tab, which has its own | UI/layout comparison — not a functional bug |
| [NM-3230](https://encore.atlassian.net/browse/NM-3230) | Rejected | Region Weekly Peaks footer "Count" (50) doesn't match visible weeks (up to Week 52) | Select year 2028 + region Chicago, compare grid rows vs footer count |
| [NM-3238](https://encore.atlassian.net/browse/NM-3238) | Done | Peak/Standard/Non-Peak checkbox in Region Weekly Peaks could not be *unchecked* once selected (Training env allowed uncheck) | Click a peak-type checkbox to select, click again to attempt uncheck |
| [NM-3234](https://encore.atlassian.net/browse/NM-3234) | Code Review | "Add Year" button enabled even when Year/Region not selected — should stay disabled until both are chosen | Select Country=Bahamas → Region Weekly Peaks tab → observe Add Year enabled state before selecting Year/Region |
| [NM-3275](https://encore.atlassian.net/browse/NM-3275) | Rejected | Region Weekly Peaks export for United States contains a region ("Western RVP Region - BCAB") that doesn't exist in the Region dropdown and isn't valid for the country — re-importing the unmodified export fails validation | Export US region weekly peaks for 2026 → compare regions in file vs dropdown → re-import |
| [NM-3074](https://encore.atlassian.net/browse/NM-3074) | QA | Region Peak Import and Add-Year operations are slow | Perf/timing observation, no fixed threshold given in ticket |
| [NM-3062](https://encore.atlassian.net/browse/NM-3062) | Done | Company Matrix / Region Weekly Peak export returned HTTP 500 | Export from either tab |
| [NM-3256](https://encore.atlassian.net/browse/NM-3256) | Review | Clicking **Discard** on the Unsaved Changes popup (triggered by clicking Export while dirty) closes the popup but does **not** proceed with the export — browser shows "Couldn't download – Network issue" | Modify GAV Threshold (don't save) → click Export → Unsaved Changes popup appears → click Discard |
| [NM-3255](https://encore.atlassian.net/browse/NM-3255) | Review | Exported Company Matrix filename is a raw timestamp (`DiscountMatrixExport_7_27_2026, 9_41_48 AM.xlsx`) instead of the documented `DiscountMatrix-{countryAbbrv}-{currencyAbbrv}-{tier}.xlsx` convention | Export Company Matrix for any Country/Currency/Tier, inspect downloaded filename |
| NM-3253 *(title only, not re-fetched)* | QA | Save is allowed on Location Activation even when the grid has validation errors | See ticket for full repro |

## 1.8 Test data requirements

- **Countries**: at minimum US, Canada (to hit both `en-CA` and `fr-CA` culture defaults), Mexico (`es-MX` default), plus one edge-case country with **zero existing Company Matrix rows** (used in NM-3237 repro — e.g. a fresh Country/Business-Tier combination) and Bahamas (used in NM-3234 repro, small/edge market).
- **Currencies**: USD, CAD, MXN at minimum — needed to exercise `currencyAbbrv` in export filenames.
- **Business Tiers**: `Standard` (default), plus at least one named tier seen in tickets (`SVP Productions`, `Las Vegas`) to test business-tier-specific matrices.
- **Revenue tier boundaries**: need a matrix with an existing max tier (e.g. up to 20,000,000) to test adding a tier both *inside* an existing range (split case, NM-3239) and *above* the current max (NM-3237). Also test 0, negative, and decimal End Tier inputs (not covered by any existing ticket — worth adding as new coverage).
- **Percent fields**: whole numbers (14, 100, 0) and decimals (0.14, 0.005) for every % input, given the confirmed whole-number conversion bug (NM-3235).
- **Regions**: a region name that is NOT in the live dropdown (to retest NM-3275 style orphan-region handling), plus a normal valid region (e.g. Chicago).
- **Years**: current year, a future year (2028 seen in a ticket), and the "create new year" flow with/without "copy previous year".
- **Locations**: multiple locations under one country for Location Activation bulk-save testing (activate some, deactivate others, verify only changed rows post).
- **Import files**: a valid `.xlsx` matching current export schema, an invalid one (bad region, missing columns, wrong data types) to test server-side row-level validation messaging.
- **Users/roles**: none / read / edit for `ROLE_FUNCTION_REVENUEMGMT`, per §1.6.

## 1.9 Manual test scenarios (checklist)

Header:
- [ ] Country change reloads GAV Threshold; Currency change reloads GAV Threshold + updates `currencyAbbrv`
- [ ] Business Tier defaults to Standard when present, else first available
- [ ] GAV Threshold rejects negative values; accepts 1-decimal percent; **verify whole-number vs decimal conversion (NM-3235 regression)**
- [ ] Save button stays disabled until form is dirty+valid; enabled Save persists only threshold, shows success toast, resets to pristine
- [ ] Read-only role: all edit controls disabled/hidden; edit role: fully functional

Company Matrix:
- [ ] Grid loads only once Country+Currency+Business Tier are all set; empty state otherwise
- [ ] Add Tier inside an existing range correctly splits it; add tier **above** current max correctly extends it (NM-3237 regression)
- [ ] Delete either half of a just-split tier and confirm the *correct* boundary survives (NM-3239 regression)
- [ ] Edit-Tier popup % fields: whole number and decimal entry both produce the expected percent (NM-3235 regression)
- [ ] Export downloads with correct `DiscountMatrix-{countryAbbrv}-{currencyAbbrv}-{tier}.xlsx` name (NM-3255 regression) and does not 500 (NM-3062 regression)
- [ ] Export while dirty → Discard on Unsaved Changes prompt still completes the export (NM-3256 regression)
- [ ] Import: valid file succeeds and reloads grid; invalid file surfaces row-level errors, does not partially apply
- [ ] Save persists all edited rows; canEdit=false disables Add/Delete/Import/inline-edit

Region Weekly Peaks:
- [ ] Year/Region dropdowns populate for the active country; 52-week grid loads for the selected pair
- [ ] Peak/Standard/Non-Peak checkbox: select AND un-select both work (NM-3238 regression); only one of the three can be active per week (mutual exclusivity)
- [ ] "Add Year" stays disabled until both Year and Region are chosen (NM-3234 regression)
- [ ] Create-new-year overlap check rejects an overlapping year/week-start with a translated error
- [ ] Export regions match what's selectable in the Region dropdown, and a re-import of an untouched export succeeds without validation errors (NM-3275 regression)
- [ ] Footer record count matches the number of week rows actually rendered (NM-3230 — was Rejected, re-verify if still relevant)
- [ ] Import/Add-Year complete in reasonable time on a large dataset (NM-3074 perf regression — no documented SLA, flag if it feels materially slow)

Location Activation:
- [ ] Grid loads/reloads on country change
- [ ] Toggling activation marks only that row dirty; Save posts only changed rows
- [ ] Save is blocked when the grid has a validation error present (NM-3253 — verify save is actually blocked, not silently allowed)
- [ ] Record count shown bottom-right matches grid row count
- [ ] `POST` payload only includes locations sharing the current `countryId`; mixed-country payloads are rejected server-side

## 1.10 Automation notes

**API surface to hit directly** (bypass UI for data setup/teardown and negative-path testing):
```
GET/PUT /api/discount-matrix/countries/{countryId}/currencies/{currencyId}/threshold
GET     /api/discount-matrix/countries | /currencies | /business-tiers
GET     /api/DiscountMatrix/Location?countryId=
POST    /api/DiscountMatrix/Location/Activation
GET     /api/DiscountMatrix/Region/Years | /Region/List | /Region/Weeks | /Region/Weeks/PreviousYear/LastWeek
POST    /api/DiscountMatrix/Region/Weeks/Update | /Region/Weeks/AddYear
POST/GET /api/discount-matrix/region-peaks/import | /export
```
- All write endpoints require `ROLE_FUNCTION_REVENUEMGMT` + `ROLE_ACCESS_UPDATE` — automation needs a token/user fixture with this role at Update level, and a second at Read level for negative-permission tests.
- `Location/Activation` validator rejects a request whose items span more than one `countryId` — good candidate for an automated negative test hitting the API directly (cheaper than driving the UI).
- Percent-field whole-number-vs-decimal bug (NM-3235) is a strong candidate for a small parameterized unit/API test: submit `{14}` and `{0.14}` through the same endpoint and assert both resolve to `14%`.
- Revenue-tier split/delete recalculation (NM-3239) is inherently stateful — better suited to an integration test that seeds a matrix, adds/deletes tiers via API, and asserts final boundaries, rather than a pure UI test.
- Export filename + content shape (NM-3255, NM-3236) are cheap to assert via direct `GET .../export` response headers/content — no need to drive a browser download.

---

# Module 2: Service Charge Text (SCT)

## 2.1 Business purpose

Service Charge Text is a **Setup → Legal** screen for managing the multilingual text/HTML shown for service charges on quotes and invoices (legacy `SetupBLL` / `Setup/GetServiceCharges` / `Setup/SaveServiceCharges`). It is a content-management screen, not a calculation engine — it does not compute the service charge amount or percentage (that lives elsewhere, e.g. `Venue Line Of Business Contract Commissions` / order pricing). Do not confuse it with the general "Service Charge %" configuration used in commission/tax calculations — those are separate Jira tickets (e.g. NM-3165, NM-3097, NM-2992) that were excluded from this doc as out of scope.

## 2.2 Architecture / ownership

- **Epic**: [NM-1694](https://encore.atlassian.net/browse/NM-1694) "Service Charge Text" (status: To Do at epic level even though most child stories are Done — epic-level status likely stale)
- **Main UI story**: [NM-1728](https://encore.atlassian.net/browse/NM-1728) "SCT - UI: Service Charge Text Page" — Next.js rewrite of the legacy Angular screen
- **Storage migration**: [NM-1729](https://encore.atlassian.net/browse/NM-1729) — one-time migrator from legacy SQL `ServiceCharge` table (HeliosCorp) into a new `ServiceChargeText` CosmosDB container
- **Web component packaging**: [NM-2188](https://encore.atlassian.net/browse/NM-2188) — standalone Next.js web component exposed via Module Federation, consumed by the Angular host with `canEdit`, `authToken`, `theme` props
- **Backend**: Core Service, `IServiceChargeTextManager` / `IServiceChargeTextRepository` ([NM-1695](https://encore.atlassian.net/browse/NM-1695), [NM-1696](https://encore.atlassian.net/browse/NM-1696), [NM-1697](https://encore.atlassian.net/browse/NM-1697)), Kafka sync consumer to HeliosCorp (NM-1698)
- Sprint notes ([Sprint 2026-13](https://encore.atlassian.net/wiki/spaces/NM/pages/3851419649)) as of this compile: "service charge text UI is 80% done with backend in progress... expected completion for service charge text by mid-July" — **treat this module as still actively in flux**, re-check ticket statuses before planning a coverage pass.

## 2.3 Page structure & fields

Single grid + rich-text editor panel, no tabs. Legacy reference: the Angular Setup screen under Location Setup → Legal → Service Charge Text.

| Field | Editable where | Required? | Notes |
|---|---|---|---|
| Language | inline grid | required | filter dropdown defaults to a specific language (see §2.7 — contradicts current defect) |
| Service Charge Name | inline grid | required | must be **unique within the same Language** |
| Service Charge Display Name | inline grid | required | |
| Report Column Name | inline grid | required | |
| HTML Display Text | CKEditor panel only (not inline) | required per current validator, **but** NM-2372 says it should be optional to match legacy — open discrepancy, confirm current behavior before testing | |
| HTML Display Text V2 | CKEditor panel only (not inline) | not specified as required | |
| "Service Charge Text on Quote V2 and V3" | grid column | — | filed as **missing from the grid** (NM-2924) — may or may not be the same field as HTML Display Text V2; not resolved in the tickets reviewed, confirm current schema before writing test cases that assume they're distinct |

Supported languages (labels per AC): US English (`en-US`, default), Canadian English (`en-CA`), French Canadian (`fr-CA`), Spanish Mexico (`es-MX`), plus an **All** pseudo-filter.

Grid behaviors:
- Add new row → client-generated ID, marked dirty, requires validation before save
- Inline edit limited to the four metadata columns; HTML fields are edit-only via the CKEditor panel, selected by clicking the HTML cell (visually highlighted)
- Column drag-reorder and column sort are both supported per design (both currently reported broken — see §2.7)
- Report preview available for a selected row with language context; opens in a modal without discarding page state
- Dirty-state tracked **separately** for grid edits vs. editor edits
- Unsaved-changes protection: on language-filter change, on switching selected HTML cell, and on navigating away (federation-aware: emits dirty state to the Angular host shell when embedded, or blocks navigation directly when standalone — [NM-2190](https://encore.atlassian.net/browse/NM-2190))
- Save All: commits the active grid cell edit first, blocked if any validation error exists, submits the **full dataset for the current location**, reloads from source of truth on success, clears both dirty flags

## 2.4 APIs

- **Read**: [NM-2311](https://encore.atlassian.net/browse/NM-2311) — new Core Service GET endpoint by `languageId`, with an "all languages" sentinel equivalent to legacy `languageId = "All"`; returns **active** records only. Replaces legacy `Setup/GetServiceCharges`.
- **Write**: [NM-1696](https://encore.atlassian.net/browse/NM-1696) / [NM-1697](https://encore.atlassian.net/browse/NM-1697) — `UpsertServiceChargeTextAsync` (single) and `SaveServiceChargeTextsAsync` (bulk insert+update in one call) on `IServiceChargeTextManager`, exposed via FastEndpoints at `/api/servicechargetexts` (legacy parity: `Setup/SaveServiceCharges`). Every mutation writes a history row (`InsertHistoryAsync`) with Action/ModUser/ModDate/before-after snapshot.
- **Validators** (per NM-1696, as currently implemented per NM-2372):
  - `ServiceChargeName`: required, unique per `LanguageId`
  - `HtmlDisplayText`: **currently required** — NM-2372 flags this as wrong; legacy/expected behavior treats it as optional
  - `LanguageId`: required, validated via `ILanguageRepository`
  - `ReportColumnName`: required
  - `ServiceChargeDisplayName`: required
- HTTP status codes: 200 success, 400 validation, 403 auth, 404 not found (per [NM-1697](https://encore.atlassian.net/browse/NM-1697))
- **Performance note** (NM-2372): saving with the "All" language filter selected takes noticeably longer than legacy, which saved instantly — flagged as an observation, not yet root-caused as of this compile.

## 2.5 Web component embedding

Per [NM-2188](https://encore.atlassian.net/browse/NM-2188), the SCT screen is a standalone Next.js web component exposed via Module Federation and consumed by the legacy Angular host as a custom element, accepting `canEdit: boolean`, `authToken: string`, `theme: string` as input props. This embedding model is directly relevant to §2.6's permission gap — the host controls `canEdit`, and per the permissions spec it currently always passes `true`.

## 2.6 Permissions — important gap

Per the [Navigator Legacy Permissions — Design Spec](https://encore.atlassian.net/wiki/spaces/NM/pages/3871342594) "Client / Server Discrepancies" table:

> **Service charge text (Next.js)** — Client: `canEdit = true` **hardcoded**. Server: `SetupController` uses `NavigatorLegal` (`ROLE_FUNCTION_CORP_LEGAL`) / `NavRevenueMgmt`.

In other words: **the UI always renders as fully editable regardless of the logged-in user's actual role**, while the backend API is supposed to enforce `ROLE_FUNCTION_CORP_LEGAL` + `ROLE_ACCESS_UPDATE` on writes (per [NM-1696](https://encore.atlassian.net/browse/NM-1696)). [NM-1728](https://encore.atlassian.net/browse/NM-1728) AC #10 lists the intended role guard as "Need to confirm" — i.e. this was still an open question on the main UI story.

**This is a high-value test target**: log in as a user with **no** `ROLE_FUNCTION_CORP_LEGAL` access, confirm the UI still shows edit controls (per the hardcode), then attempt to actually save — verify whether the backend correctly rejects it (403) or whether the permission check is missing/broken end-to-end. This is exactly the kind of client/server mismatch that's easy to miss with UI-only testing and needs a direct API test.

## 2.7 Known defects / edge cases (use as regression bank)

All `Done` status as of this compile — **re-verify against the live app**, since "Done" in this tracker reflects dev/QA sign-off at filing time, not a guarantee the fix is deployed to the environment you're testing.

| Ticket | Status | Summary | Repro (condensed) |
|---|---|---|---|
| [NM-3126](https://encore.atlassian.net/browse/NM-3126) | Done | Column drag-reorder not working in Test env (worked in Training) | Setup → Service Charge Text → drag a column header |
| [NM-2924](https://encore.atlassian.net/browse/NM-2924) | Done | "Service Charge Text on Quote V2 and V3" column missing from the grid entirely | Open Service Charge Text, inspect grid columns |
| [NM-2923](https://encore.atlassian.net/browse/NM-2923) | Done | Language filter defaults to **All** instead of **US English** — **directly contradicts** NM-1728 AC #1 ("default selected language is English (en-US)") | Open Service Charge Text fresh, check Language filter default |
| [NM-2922](https://encore.atlassian.net/browse/NM-2922) | Done | Page title/header "Service Charge Text" missing in Test env (present in Training) — ticket description is internally inconsistent (title mentions page header, body mentions grid column header), confirm which is actually missing when re-testing | Setup → Service Charge Text, look for page title above the grid |
| [NM-2919](https://encore.atlassian.net/browse/NM-2919) | Done | Column sort does not work on any sortable column header click (asc/desc toggle) | Click a column header, click again |
| [NM-2916](https://encore.atlassian.net/browse/NM-2916) | Done | Changing the Language filter after editing a grid field does **not** show the Unsaved Changes confirmation — silently discards the edit — **directly contradicts** NM-2190/NM-1728 AC around unsaved-changes protection on language-filter change | Edit any grid field, don't save, change Language dropdown |
| [NM-2915](https://encore.atlassian.net/browse/NM-2915) | Done | Discard on the Unsaved Changes dialog does not actually revert the CKEditor content, and the editor stays enabled/editable instead of returning to its disabled default | Select HTML cell → edit in CKEditor → click another cell → Discard on the prompt → check editor state and content |
| [NM-2372](https://encore.atlassian.net/browse/NM-2372) | Done | (a) `HtmlDisplayText` incorrectly enforced as required (should be optional, matching legacy); (b) Save is noticeably slower than legacy when "All" language is selected | Try saving a row with empty HTML content; separately, time a Save-All with Language=All |

**Cross-cutting observation**: four of these seven defects (2923, 2916, 2915, and the header/2922) are direct contradictions of explicitly-stated ACs on the parent story ([NM-1728](https://encore.atlassian.net/browse/NM-1728)). This module's basic dirty-state / unsaved-changes handling — the same class of behavior called out as a defect on Discount Matrix too (NM-3256) — looks like a recurring weak spot across both modules. Worth a dedicated cross-module regression pass on "unsaved changes" behavior specifically.

## 2.8 Test data requirements

- **Languages**: `en-US` (default), `en-CA`, `fr-CA`, `es-MX`, plus the `All` pseudo-filter — need at least one Service Charge Text record per language to test filtering, and duplicate-name-across-different-languages (should be **allowed**) vs. duplicate-name-within-same-language (should be **rejected**).
- **Required-field negative cases**: empty Service Charge Name, empty Service Charge Display Name, empty Report Column Name, empty Language — one row per case. Empty `HtmlDisplayText` is a special case given the NM-2372 dispute — test both assuming it's required (current validator) and flag if legacy-parity (optional) is expected by the time you test.
- **HTML content edge cases**: empty/placeholder HTML, large HTML blob, HTML with embedded scripts/tags (since this is a rich-text field rendered elsewhere, e.g. on quotes/invoices — worth an XSS-style sanitization check even if not explicitly called out in any ticket), and separately-populated vs. empty `HTML Display Text V2`.
- **New row**: at least one never-saved new row per test pass, to hit the "new row + dirty" validation path.
- **Role fixtures**: a user with **no** `ROLE_FUNCTION_CORP_LEGAL` access (to test the hardcoded-`canEdit` gap in §2.6), a read-only user, and a full-update user.
- **Embedding context**: since the component can run standalone (MFE) or federated inside the Angular host, test unsaved-changes navigation-blocking in **both** contexts if feasible — the AC explicitly describes different behavior per context (host emits dirty state vs. standalone blocks navigation directly).

## 2.9 Manual test scenarios (checklist)

Load & filtering:
- [ ] Language list loads before the grid; grid loads for the selected language after
- [ ] Default Language filter is **US English**, not All (NM-2923 regression)
- [ ] Switching Language with no unsaved changes reloads the grid immediately
- [ ] Switching Language **with** unsaved grid or editor changes prompts an Unsaved Changes confirmation (NM-2916 regression); Cancel restores the previous language selection, Confirm discards and reloads

Grid:
- [ ] All expected columns render, including "Service Charge Text on Quote V2 and V3" (NM-2924 regression)
- [ ] Column drag-reorder works (NM-3126 regression)
- [ ] Column header click sorts ascending, click again sorts descending, with a visible sort indicator (NM-2919 regression)
- [ ] Page header/title "Service Charge Text" is visible above the grid (NM-2922 regression — confirm exact missing element live)
- [ ] Inline edit works for Language, Service Charge Name, Display Name, Report Column Name; HTML columns are **not** inline-editable
- [ ] Add new row: appears with empty defaults, marked dirty, blocks save until valid
- [ ] Duplicate Service Charge Name within the same language is rejected; the same name under a **different** language is accepted
- [ ] Required-field validation fires per-row/per-field for all four required metadata fields

HTML editor:
- [ ] Clicking an HTML cell loads its content into the CKEditor and highlights the cell; editor is disabled until a valid cell is selected
- [ ] Editor changes are tracked independently of grid dirty state
- [ ] Switching to a different HTML cell while the editor is dirty prompts a confirm; Cancel keeps current selection, Confirm loads the new cell
- [ ] "Save to row" commits editor content back to the grid row, marks it dirty, resets editor dirty state, shows a temporary success indicator
- [ ] **Discard actually reverts editor content and returns the editor to its disabled state** (NM-2915 regression — currently broken per ticket)

Save & preview:
- [ ] Save All commits the active cell edit first, is blocked while any validation error exists, submits the full location dataset, reloads from source of truth, and clears both dirty flags on success
- [ ] Save failure shows an error and preserves unsaved edits
- [ ] Report preview opens for a selected row with language context, without losing unsaved page state
- [ ] Save-All timing with Language=All is not materially slower than a single-language save (NM-2372 perf regression — no documented SLA, flag qualitatively)

Permissions (see §2.6 — priority item):
- [ ] As a user **without** `ROLE_FUNCTION_CORP_LEGAL`, confirm the UI still shows full edit controls (expected, given the hardcode)
- [ ] As that same user, attempt an actual save — verify whether the backend rejects it. If it does **not** reject, file this as a security/permissions bug — it's a real edit-without-authorization path, not just a UI cosmetic issue.

## 2.10 Automation notes

**API surface to hit directly**:
```
GET  /api/servicechargetexts?languageId={langId|all}     (per NM-2311; exact route TBD from OpenAPI/Swagger)
POST /api/servicechargetexts                              (upsert/save, per NM-1696/1697)
```
- Automated coverage of the four required-field validators (`ServiceChargeName`, `LanguageId`, `ReportColumnName`, `ServiceChargeDisplayName`) is cheap and high-value at the API layer — submit each with the field blank and assert a 400 with the specific message.
- `HtmlDisplayText` required-vs-optional (NM-2372) is a single boolean toggle in the validator — a good candidate for a standing regression test that locks in whichever behavior is decided as correct, so it can't silently flip back.
- **Priority automation target**: the `canEdit` hardcode (§2.6) — write an API-level test that calls the save endpoint as a token with no `ROLE_FUNCTION_CORP_LEGAL` grant and asserts a 403. This is the one test in this whole doc that most needs to live in an automated suite rather than rely on manual re-checking, since it's an authorization boundary, not a UI cosmetic.
- Bulk save (`SaveServiceChargeTextsAsync`) accepting mixed insert+update in one call is worth a dedicated integration test: one brand-new row + one modified existing row in the same payload, assert both persist correctly and a single history row is written per mutated record.
- Uniqueness validation (`ServiceChargeName` unique per `LanguageId`) is a good parameterized case: same name + same language (reject) vs. same name + different language (accept).

---

# Appendix: Full ticket reference

## Discount Matrix

| Key | Type | Summary | Status |
|---|---|---|---|
| [NM-1668](https://encore.atlassian.net/browse/NM-1668) | Story | MFE - Discount Matrix Page (parent) | QA |
| [NM-2218](https://encore.atlassian.net/browse/NM-2218) | Sub-task | Page Shell + Header + GAV Threshold | QA |
| [NM-2219](https://encore.atlassian.net/browse/NM-2219) | Sub-task | Company Matrix tab | QA |
| [NM-2220](https://encore.atlassian.net/browse/NM-2220) | Sub-task | Region Weekly Peak tab | QA |
| [NM-2221](https://encore.atlassian.net/browse/NM-2221) | Sub-task | Location Activation tab | QA |
| [NM-1681](https://encore.atlassian.net/browse/NM-1681) | Story | API - Location Activation | QA |
| [NM-1657](https://encore.atlassian.net/browse/NM-1657) | Story | API - Region Weekly Peak Read Methods | QA |
| [NM-2976](https://encore.atlassian.net/browse/NM-2976) | Story | Order Service — Pricing & Discounts integration | To Do |
| [NM-2339](https://encore.atlassian.net/browse/NM-2339) | Sub-task | MFE - Import Company Matrix Tier Data | Done |
| [NM-2447](https://encore.atlassian.net/browse/NM-2447) | Sub-task | Manage Translation | Done |
| [NM-2452](https://encore.atlassian.net/browse/NM-2452) | Sub-task | Import | QA |
| [NM-2333](https://encore.atlassian.net/browse/NM-2333) | Story | Cosmos-Container.json change for discount matrix db | Done |
| [NM-3074](https://encore.atlassian.net/browse/NM-3074) | Story | Region Peak - Import/Add Year performance | QA |
| [NM-3062](https://encore.atlassian.net/browse/NM-3062) | Story | Export returns 500 | Done |
| [NM-3275](https://encore.atlassian.net/browse/NM-3275) | QA Defect | Invalid region in Region Weekly Peaks export | Rejected |
| [NM-3256](https://encore.atlassian.net/browse/NM-3256) | QA Defect | Export not triggered after Discard | Review |
| [NM-3255](https://encore.atlassian.net/browse/NM-3255) | QA Defect | Export filename naming convention | Review |
| [NM-3239](https://encore.atlassian.net/browse/NM-3239) | QA Defect | Revenue Tier recalculation after delete | QA |
| [NM-3238](https://encore.atlassian.net/browse/NM-3238) | QA Defect | Peak checkbox cannot be unchecked | Done |
| [NM-3237](https://encore.atlassian.net/browse/NM-3237) | QA Defect | Valid End Tier value rejected | Done |
| [NM-3236](https://encore.atlassian.net/browse/NM-3236) | QA Defect | Export shows GUID not numeric ID | Done |
| [NM-3235](https://encore.atlassian.net/browse/NM-3235) | QA Defect | Whole-number percent conversion bug | Review |
| [NM-3233](https://encore.atlassian.net/browse/NM-3233) | QA Defect | Button placement inconsistency | QA |
| [NM-3230](https://encore.atlassian.net/browse/NM-3230) | QA Defect | Record count mismatch | Rejected |
| [NM-3234](https://encore.atlassian.net/browse/NM-3234) | QA Defect | Add Year button enabled when fields empty | Code Review |
| NM-3253 | QA Defect | Save allowed despite grid validation errors | QA (title only, not fetched in full) |

## Service Charge Text

| Key | Type | Summary | Status |
|---|---|---|---|
| [NM-1694](https://encore.atlassian.net/browse/NM-1694) | Epic | Service Charge Text | To Do (epic-level; children mostly Done) |
| [NM-1728](https://encore.atlassian.net/browse/NM-1728) | Story | UI: Service Charge Text Page (parent) | QA |
| [NM-1729](https://encore.atlassian.net/browse/NM-1729) | Story | HeliosCorp → CosmosDB Migration | Done |
| [NM-2311](https://encore.atlassian.net/browse/NM-2311) | Story | API: get by Language Id | Done |
| [NM-2188](https://encore.atlassian.net/browse/NM-2188) | Story | Standalone web component (Module Federation) | Done |
| [NM-1696](https://encore.atlassian.net/browse/NM-1696) | Story | API — Upsert (manager methods) | Done |
| [NM-1697](https://encore.atlassian.net/browse/NM-1697) | Story | API — Upsert endpoint | Done |
| [NM-1695](https://encore.atlassian.net/browse/NM-1695) | Story | Repository write methods | Done |
| [NM-1698](https://encore.atlassian.net/browse/NM-1698) | Story | Kafka Sync Consumer to HeliosCorp | QA |
| [NM-1724](https://encore.atlassian.net/browse/NM-1724) | Story | Angular Monolith Redirect (Host) | Done |
| [NM-2190](https://encore.atlassian.net/browse/NM-2190) | Story | Unsaved changes warning modal | QA |
| [NM-3126](https://encore.atlassian.net/browse/NM-3126) | QA Defect | Column reordering broken | Done |
| [NM-2924](https://encore.atlassian.net/browse/NM-2924) | QA Defect | "Quote V2/V3" column missing | Done |
| [NM-2923](https://encore.atlassian.net/browse/NM-2923) | QA Defect | Wrong default Language filter | Done |
| [NM-2922](https://encore.atlassian.net/browse/NM-2922) | QA Defect | Missing header | Done |
| [NM-2919](https://encore.atlassian.net/browse/NM-2919) | QA Defect | Column sort broken | Done |
| [NM-2916](https://encore.atlassian.net/browse/NM-2916) | QA Defect | No unsaved-changes prompt on language switch | Done |
| [NM-2915](https://encore.atlassian.net/browse/NM-2915) | QA Defect | Discard doesn't revert HTML editor | Done |
| [NM-2372](https://encore.atlassian.net/browse/NM-2372) | QA Defect | HtmlDisplayText required + slow All-language save | Done |

## Confluence design docs referenced

- [Order Approval (Discount, EPT, Capped) — Microservice Design](https://encore.atlassian.net/wiki/spaces/NM/pages/3874095123/Order+Approval+Discount+EPT+Capped+Microservice+Design)
- [Pricing](https://encore.atlassian.net/wiki/spaces/NM/pages/3866099713/Pricing) — adjacent/related module, not Discount Matrix itself
- [Navigator Legacy Permissions — Design Spec](https://encore.atlassian.net/wiki/spaces/NM/pages/3871342594/Navigator+Legacy+Permissions+Design+Spec)
- [Sprint 2026-13](https://encore.atlassian.net/wiki/spaces/NM/pages/3851419649/Sprint+2026-13) — current-sprint status snapshot for both modules at time of compile
