# Field Inventory — Corporate Pricing Search (NM-1445) — FCC walk refresh

**Module**: corporate-pricing-search
**Client**: encore
**MCP_Session_Date**: 2026-06-10
**MCP_Session_Tool**: Playwright CLI (`@playwright/cli` v0.1.8, binary `playwright-cli`, session `-s=cpr-search-fcc`, storageState `clients/encore/.auth/encore-state.json`; plus a throwaway `@fcc-walk` runner spec driven by the proven `CorporatePricingSearchPage` helpers so each Search request URL is captured via `searchAndWaitForList()`)
**MCP_Tool_Reason**: Wave-2 FCC field-coverage walk for `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2`. Unattended catalog + network classification of a sparse-testid virtualized grid — token-efficient CLI over Chrome per LR-038 v2 (no visual/CSS, no live pause step). The `MCP_Session_Tool` enum value reads "Playwright CLI" pending SP-PWC2-05 normalization.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md

> **Supplements** the P1 base inventory `corporate-pricing-search-2026-06-05.md` (still fresh; field shapes, defaults, grid columns, and selectors are unchanged — read that file for the full field table). This refresh records ONLY the Wave-2 FCC-walk **deltas**: the complete server query-param contract (the P1 walk left 3 params unverified and **guessed one wrong**), the BVA/special/whitespace server behaviors, the checkbox toggle+revert symmetry, reset idempotency, and the compound single-query shape.
>
> **Baseline**: `baselineScope: baseline-absent` (net-new on e2e, no nav2 equivalent — LR-ENC-001). Intent oracle = DOCX NM-1445 + `field-case-generation.md` taxonomy.

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing` — Corporate Pricing **Search** screen. Read-only filter screen; only in-page filter form state exercised, then Reset-restored. **No data mutation committed.**

---

## Field Inventory — query-param contract (DELTA — the FCC-load-bearing correction)

The P1 inventory (2026-06-05) verified `pricebookName`, `isInternal`, `isLabor`, `isActive` but **guessed `strategyName` "by symmetry"** for Pricing Strategy and did not enumerate Currency/Location params. The FCC walk captured the **actual** `GET /navigator/api/location/pricing/strategies` query string for every filter (each via `searchAndWaitForList()`):

| Filter (control) | **Live query param** | Encoding / values (live-verified 2026-06-10) | Notes |
|---|---|---|---|
| Pricebook (text) | `pricebookName=<literal>` | URL-encoded literal; e.g. `2` → 583 rows, `2021-PB6` → 1 | accepts any length/char; no client validation |
| Pricing Strategy (text) | **`pricingStrategyName=<literal>`** | URL-encoded literal | **CORRECTS the P1 `strategyName` guess** |
| Currency (combobox) | **`currencyId=<int>`** | **USD=1, CAD=2, MXN=3** (`All Currencies` = param absent) | integer id, not the abbreviation |
| Location (combobox) | **`locationNo=<office#>`** | e.g. `1101` → 1 row (`All Locations` = param absent) | the office number, not a GUID |
| Is Internal (checkbox) | `isInternal=<bool>` | default `isInternal=false` present; checked → `isInternal=true` | |
| Is Labor (checkbox) | `isLabor=<bool>` | default `isLabor=false` present; checked → `isLabor=true` | |
| Active Only (checkbox) | `isActive=true` **when checked; param OMITTED when unchecked** | checked → `isActive=true`; unchecked → **no `isActive` key at all** (not `isActive=false`) | asymmetric vs the other checkboxes |
| (paging, always) | `pageNumber=1&pageSize=50` | server-side pagination | grid virtualizes 50 of N |

---

## Save-cycle observations

**N/A** — read-only Search screen (no Save). Filter state is transient UI; Reset clears it. (Unchanged from 2026-06-05.)

---

## Observations

### Bugs / Defects

**None found.** Every FCC boundary behavior is internally consistent and correct-looking:

- **Overflow (250-char Pricebook)**: input accepts all 250 chars (no `maxlength`), server query carries the full literal, returns `0 items found`, no crash.
- **Special chars** (`%_'"<>&#`): accepted literally (`aria-invalid` stays `null` — no rejection), URL-encoded correctly in the query (`pricebookName=%25_%27%22%3C%3E%26%23`), returns `0 items found`, **no client-side exception** (page-error probe = 0). A **natural Tab blurs focus out cleanly** (no focus-trap — §2.1 (b) satisfied). Distinct from the Location/Currency Radix combobox, which DOES crash on DOM-tamper (ALL-088) — the plain `<input>` is safe.
- **Whitespace-only** (`"   "`): query `pricebookName=+++`, returns the **full 592 list** — the server treats whitespace as no meaningful filter (not a 0-result, not an error).
- **Is Labor**: `isLabor=true` returns the **labor set (631 — larger than the 592 non-labor default)**, i.e. a different population, NOT a narrowing. Correct behavior, not a bug.
- **CAD currency**: `currencyId=2` → `0 items` (no active CAD strategies in 1604 at walk time) — a legitimate empty result, volatile.

The two pre-existing spec/requirements divergences (D1 8↔9 columns, D2 server-side vs DOCX client-side) were already raised via `/encore-questions` in the P1 cycle; no new clarifications surfaced.

---

### Suggestions / Improvements

none
## Staleness signal

- **Last verified**: 2026-06-10
- **Fresh-until**: 2026-06-24
- **Stale-after**: 2026-07-10
- **Refresh triggers**: any change to the `/pricing/strategies` query-param contract (param names/encodings above); currency id mapping change; Pricebook input gaining a `maxlength`/validation; Reset becoming a server call; the filter submission model flipping to client-side.

---

## Network-request evidence (FCC walk — LR-033 / LR-056)

Captured via the `@fcc-walk` runner (each row = one `searchAndWaitForList()` request URL):

| Action | Request query (after `…/pricing/strategies?`) | Result | Inference |
|---|---|---|---|
| Pricebook no-match | `isActive=true&pricebookName=ZZZ-NOPE-NOMATCH-9999&…` | `0 items found` | text filter is a server param; no-match → 0 |
| Pricebook overflow (250×`A`) | `…&pricebookName=AAA…(250)` | `0 items found`, no crash | no maxlength; server returns 0 |
| Pricebook special chars | `…&pricebookName=%25_%27%22%3C%3E%26%23&…` | `0 items found`, no crash, escapable | literal, URL-encoded; safe |
| Pricebook whitespace | `…&pricebookName=+++&…` | `592 items found` (full) | whitespace ignored server-side |
| Pricing Strategy no-match | `…&pricingStrategyName=ZZZ-NOPE-STRAT&…` | `0 items found` | **param = `pricingStrategyName`** |
| Currency USD / CAD / MXN | `…&currencyId=1` / `=2` / `=3` | 504 / 0 / 88 | `currencyId` integer enum |
| Location pick `1101` | `…&locationNo=1101&isActive=true&…` | `1 items found` | **param = `locationNo`** (office #) |
| Is Internal on / off | `…&isInternal=true&…` / restore | 4 → 592 | symmetric revert to base |
| Is Labor on / off | `…&isLabor=true&…` / restore | 631 → 592 | different set, then base restore |
| Active Only off / on | (no `isActive` key) / `isActive=true` | 699 → 592 | param OMITTED when unchecked |
| Reset (×2) | (no request) | full list, idempotent | client-side; double-Reset fires 0 calls |
| Compound (pb+ccy+chk) | `…&pricebookName=2&currencyId=1&isInternal=true&…` | `3 items found`, **1 request** | all staged params in a single query; 0 calls while staging |

**Verdict**: filtering is server-side, submitted by Search as a single query carrying every staged param; Reset is a client-side restore (no call). Consistent with the P1 D2 classification, now with the complete per-param contract.
