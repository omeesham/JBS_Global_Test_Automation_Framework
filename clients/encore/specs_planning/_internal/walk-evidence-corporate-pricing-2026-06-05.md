---
artifact: walk-evidence
module: corporate-pricing
client: encore
session_date: 2026-06-05
session_tool: playwright-cli (CLI, headless then headed; LR-038 v2 / LR-054)
author_identity: HUNTER (walk discipline); writes landed under OWNER (§2/.mjs gap for walk-evidence — fixed same session)
page_url_new: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
test_entity: office 1604 ("The Parker Palm Springs")
parent_subplan: SUBPLAN_CORP_PRICING_00_FOUNDATION.md
parent_plan: PLAN_CORP_PRICING_MASTER.md
baselineScope: baseline-absent
---

# Walk Evidence — Corporate Pricing (S0 Foundation, HUNTER live walk)

> **Provenance**: this artifact lands the master plan's PROVISIONAL recon (F19). Until this file existed, the Divergence Ledger D1–D8 in `PLAN_CORP_PRICING_MASTER.md` were recon *findings*, not artifact-backed. This file CONFIRMS D1/D2/D4/D5/D6/D7/D8 and **CORRECTS D3** (1440 New Pricebook is BUILT — see §5).
>
> **Baseline**: Corporate Pricing is a **purely e2e feature with NO navigator2 (old-site) equivalent** — user-confirmed 2026-06-05. Do NOT attempt a nav2 baseline walk for this module; its absence on nav2 is expected, not a gap. `baselineScope: baseline-absent` (LR-ENC-001, not a HALT). See companion `old-site-baseline/corporate-pricing-2026-06-05.md`.
>
> **Browser tool**: Playwright CLI (`playwright-cli -s=cpr-foundation` on `clients/encore/.auth/encore-state.json`). Headless for the catalog walk; switched to headed mid-session at user request (`[BROWSER-SWITCH] from=cli-headless to=cli-headed reason=user-requested-live-visibility`). No Entra redirect — auth state valid.

---

## §0. Scope + screens walked

Three built screens, all under office 1604, all live-walked 2026-06-05:

| Screen | URL | Status |
|---|---|---|
| Search | `/navigator/locations/1604/settings/corporate-pricing` | BUILT — walked |
| Pricebook Details (Strategy tab default) | `/navigator/locations/1604/settings/corporate-pricing/details/<guid>` | BUILT — walked |
| Pricebook Details → Pricing Detail tab | (same URL, tab switch) | BUILT — walked |
| New Pricebook (NM-1440) | `/navigator/locations/1604/settings/corporate-pricing/add?type=<equipment\|labor>` | **BUILT** — entry confirmed (§5) |
| History (NM-1444) | (no tab) | **ABSENT** (§6) |

---

## §1. Search screen (`/settings/corporate-pricing`)

**Heading**: `Corporate Pricing` (h1). Page title: `Corporate Pricing | Navigator`.

**Search Criteria filters** (exact labels + control types, top-to-bottom):

| # | Label | Control | Default |
|---|---|---|---|
| 1 | Pricebook | textbox, placeholder "Enter name" | empty |
| 2 | Pricing Strategy | textbox, placeholder "Enter strategy" | empty |
| 3 | Location | combobox ("Open popover") | "All Locations" |
| 4 | Currency | combobox | "All Currencies" |
| 5 | Is Internal | checkbox | unchecked |
| 6 | Is Labor | checkbox | unchecked |
| 7 | Active Only | checkbox | **checked** (default) |

Action buttons: **Reset**, **Search**. (D2: there IS a Search button + Reset; client-side-vs-server-call filter classification is **deferred to S1** per master D2 — not probed in S0.)

**Results grid — 9 columns** (exact header text → internal sort key exposed in the column-header aria):

| # | Column header | Internal key |
|---|---|---|
| 1 | Price Book | `pricebookName` |
| 2 | Price Book Strategy | `strategyName` |
| 3 | Price Year | `strategyYear` |
| 4 | Is GSO | `isGSO` |
| 5 | Is Internal | `isInternal` |
| 6 | Is Labor | `isLabor` |
| 7 | Is Active | `isActive` |
| 8 | Is Productions | `isProduction` |
| 9 | Currency | `currencyAbbrv` |

**Item count (REQ-012, exact)**: `591 items found`.
**Virtualization**: yes — grid renders only visible rows; total 591.
**Boolean render**: Unicode `✔` in cells (LR-036 Unicode format — same as LM History; NOT SVG/Glyphicon). FALSE = empty cell.
**Row affordance**: the Price Book name is a `button` that navigates to the Details route (D4).
**Columns resizable** (each header has a "Resize column <key>" handle).

**Top action buttons** (above grid, D3): `Pricing Override`, `Loc Pricing Export`, `Loc Pricing Import`, `New` (split-button — see §5), `Export`, `Import`, `Grid Options`.

---

## §2. Pricebook Details screen (`/details/<guid>`)

Reached by clicking a grid Price Book name. Page title: `Pricebook Details | Navigator`; h1: `Corporate Pricing Details`; breadcrumb link "Corporate Pricing" → back to Search.

**Tabs (D5)**: exactly TWO — `Pricing Strategy` + `Pricing Detail`. **No History tab** (§6).

**Page-level Save**: a single `Save` button at the page header, `[disabled]` on clean load (shared across both tabs — see §9).

**Read-only header block** (D4 — example from pricebook "2021-PB6"):
- h2 = pricebook name ("2021-PB6")
- `Labor/Equipment`: `Equipment`
- `Year`: `2021`
- `Currency`: `USD`
- Status badge: `Inactive`  ← **record-level status** (see §12 divergence note re: grid "Is Active" vs record status)

---

## §3. Pricing Strategy tab (default view on Details)

Two-pane layout:

**Left pane — "Price Strategies" list** (searchable via "Search strategies..." textbox; an add `+` button in the header):
- list of strategy buttons, e.g. (2021-PB6): `2021-Tier 2 Suburban B`, `2021-Tier 2 Resort C`, `2021-Tier 2 Airport A`, `2021-Tier 3 Urban A`
- count label: `Total: 4`

**Right pane — selected-strategy editor**:
- `Pricing Strategy` textbox (editable name; value = selected strategy)
- 4 checkboxes: `Is Productions`, `Is Internal`, `Is GSO`, `Is Active`
- `Locations Using Pricing As Default` table — columns: `Local Office` | `Local Office Name` (e.g. row `4121 | The Westin Galleria & Westin Oaks Houston`)

S2 scope (master 1441): list/search, select, edit name + checkboxes, add/remove strategy, location-mapping read, dirty/clean, batch Save.

---

## §4. Pricing Detail tab (Details → "Pricing Detail")

**Grid headers (exact, D6)**: `ID` | `Product Group Name` | `Price` | `New Price` | `Max Discount`.
DOCX→live mapping (D6): Base Price → `Price`; Override Price → `New Price`; Override Discount → `Max Discount`; DOCX "staging price" → `New Price`.

**Heaviness (D7, exact live counts on 2021-PB6)**: `3707` `[draggable="true"]` elements, `4861` `<input>` elements (shadow-pierced count). Virtualized + drag-drop product-group source list. **HIGH complexity** — S3 MUST use content-anchored, virtualization-aware reads (LR-053) and MUST NOT full-snapshot (token bomb).

`Base Price` read-only; `New Price` + `Max Discount` editable (per master 1443). Management-mode = no double-click/drag add (that is New-Pricebook-mode behavior, gated 1440).

---

## §5. NM-1440 "New Pricebook" — **BUILT** (CORRECTS master D3)

Master recon provisionally said "New click did not navigate → NM-1440 likely-not-built." **Live walk proves otherwise:**

- `New` is a **split-button**. Clicking it opens a dropdown menu with TWO items: **`Equipment Pricing`** and **`Labor Pricing`** (the equipment/labor distinction the DOCX R1445-4 route-param requirement is about — F2c).
- Clicking `Equipment Pricing` **navigates** to: `/navigator/locations/1604/settings/corporate-pricing/add?type=equipment` — page title `New Pricebook | Navigator`.
- The **route-param IS present** (`?type=equipment`; `Labor Pricing` = `?type=labor` by symmetry). **Satisfies the DOCX R1445-4 "Must pass equipment/labor route-param"** requirement.

**Disposition correction**: NM-1440 (New Pricebook) page **EXISTS and is reachable**. The gated `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md` is therefore **NOT gated-absent** — the page is built; full coverage (header fields, multi-row strategies, Save + Empty-Shell, RBAC, drag/drop ADD) can be designed when its wave is reached. For S1 (1445 Search), the **New-Pricing route-param assertion is P1** (master D3: "IF S0 finds New Pricing navigates with a param, S1 asserts equipment/labor route-param as P1") — S0 found it; **S1 asserts it as P1**.

> Read-only discipline: I observed the `/add?type=equipment` page existence + title only. I did NOT fill or save any new pricebook (REQ-008).

---

## §6. NM-1444 "History" — **ABSENT**

The Details page exposes only `Pricing Strategy` + `Pricing Detail` tabs. **No History tab anywhere** on Search or Details. Matches D5 and the DOCX's own "(Placeholder) NM-1444" label → expected-not-yet-built, **not a defect**. Gated `SUBPLAN_CORP_PRICING_1444_HISTORY.md` stays gated-absent until a History tab ships.

---

## §7. data-testid coverage audit (LR-029 — live DOM, shadow-pierced)

> Method (S0 adversarial-audit finding): Encore renders module content inside **shadow roots**; `document.querySelector` does NOT pierce them (navigation.md:92; agent-mistakes LRN-017 "Playwright auto-pierces shadow DOM"). A naive `document.querySelectorAll('[data-testid]')` UNDERCOUNTS. I used a recursive shadow-root walk for accurate counts.

| Screen | distinct `data-testid` values found | values |
|---|---|---|
| Search | 3 | `e2e-card-header`, `e2e-card-title`, `e2e-checkbox` |
| Details / Pricing Strategy | 0 | — |
| Pricing Detail | 0 | — |

**Confirms D8**: testids are near-zero and, where present, **generic component testids** (`e2e-checkbox`, `e2e-card-*`) — NOT field-specific. They cannot identify a specific filter, column, strategy, or grid cell.

**→ Selector strategy (Doctrine 4)**: text / role / grid-column-header / content-anchored row lookup. NO `data-testid` assumptions. NO reuse of `selectors/locations/pricing.ts` (per-location Pricing tab — different module, LR-017).

**Missing-testid gap → flag for Encore team**: the Corporate Pricing module ships with effectively no automation-grade `data-testid` hooks (3 generic on Search; 0 on Details/Strategy/Detail). Recommend Encore add stable `data-testid`s to: search filter inputs, grid column headers/cells, the two Details tabs, the page-level Save, the New split-button + Equipment/Labor menu items, and the Pricing Detail grid rows. (Reported per LR-029 — verified on live DOM, not from selector files.)

---

## §8. Mutation fixtures (F1 — TWO distinct pricebooks, distinct GUIDs)

Two **distinct** pricebook records designated so S2 (Strategy-tab) and S3 (Detail-tab) — and the `workers:2` S4 suite — never mutate the same row:

| Fixture | Pricebook name | GUID | Record status | Consumed by |
|---|---|---|---|---|
| `detailFixture` | **2021-PB6** | `91acb5ca-20e2-ce8e-a9ab-8c370925fd65` | **Inactive** | S3 (Pricing Detail mutations) ONLY |
| `strategyFixture` | **2022-NP Tier 1** | `5f2a4088-9268-b033-4925-a48146afb1cb` | Active | S2 (Pricing Strategy mutations) ONLY |

**Selection rationale (honest classification — safety cannot be proven without mutating)**:
- `detailFixture` = the **Inactive** record (lowest blast radius) is assigned to the heavier-mutation Detail tab (New Price / Max Discount on product groups).
- `strategyFixture` = an Active record; acceptable because (a) e2e is the test env ("whole env fair game", Doctrine 7) and (b) S2 MUST restore via a bounded-retry `ensureDefaultState()` after every mutation. If S2 wants stricter isolation, a second Inactive book can be sourced by setting the Search "Active Only" filter off and re-searching.
- Both are DISTINCT records (different GUIDs) → no parallel-mutation collision.
- Read-only assertions (S1, and read tests in S2/S3) use the broad existing 591-row dataset, not these fixtures.

---

## §9. Save behavior (LR-012 — defensive default, NOT mutation-probed in S0)

The Details page has ONE page-level `Save` button, `[disabled]` when clean. HUNTER is read-only (REQ-008) so I did **not** dirty-and-save to observe the confirm-dialog mechanism. Per LR-012 ("Save dialogs are SHARED unless proven otherwise"), the base page object's `clickSave()` is implemented **defensively**: click Save → if a `Save Changes` alertdialog appears, confirm it; if a direct save (no dialog), proceed. **Open question handed to S2/S3**: verify on first real mutation whether Corporate Pricing uses the shared "Save Changes" dialog or a direct save, and whether Strategy + Detail share the one page-level Save (they appear to — single Save button across both tabs).

---

## §10. Divergence Ledger D1–D8 — live re-verification

| # | Master recon said | Live S0 finding (2026-06-05) | Verdict |
|---|---|---|---|
| D1 | DOCX 8 cols incl "Productions Currency"; live 9 | **9 columns** confirmed; "Productions Currency" splits → `Is Productions` + `Currency` | **CONFIRMED** |
| D2 | client-side filter "no API"; Search btn + Reset; 591; virtualized | Search + Reset present; **591 items**; virtualized. client-vs-server classification deferred to S1 | **CONFIRMED** (S1 classifies API) |
| D3 | New "likely-not-built", route-param TBD | **1440 BUILT**: New split-button → Equipment/Labor → `/add?type=equipment\|labor`; **route-param present** | **CORRECTED — BUILT** |
| D4 | grid name → `/details/<guid>`, "Pricebook Details" | Confirmed; title "Pricebook Details", h1 "Corporate Pricing Details" | **CONFIRMED** |
| D5 | tabs = Strategy + Detail only, no History | Confirmed; 2 tabs, no History | **CONFIRMED (1444 absent)** |
| D6 | grid `ID, Product Group Name, Price, New Price, Max Discount` | Exact match | **CONFIRMED** |
| D7 | Detail tab ~3707 draggables / ~4861 inputs, virtualized | Exact: 3707 draggables, 4861 inputs | **CONFIRMED** |
| D8 | 5 testids Search / 0 Details-Detail | 3 distinct generic testids Search / 0 Details-Detail (shadow-pierced) | **CONFIRMED (sparse)** |

---

## §11. TC-ID reservation (authoritative — F10)

- **Prefix**: `TC-LOC-CPR-NNN` (validated for set-membership by `check-tc-parity.ts` `TC_PATTERN`; NOT defined by `tc-authoring-rules`, which is text-hygiene only — F9).
- **Numbering bands** (per-screen, reserved here):
  - Search (1445): `001–099`
  - Strategy (1441): `100–199`
  - Detail (1443): `200–299`

---

## §12. Observations / divergences for GIVER (S1/S2/S3)

1. **Grid "Active Only" / "Is Active" ≠ pricebook record status.** 2021-PB6 appears in the default (Active-Only-checked) grid yet its Details header shows `Inactive`. The grid `Is Active` column / `Active Only` filter track the **strategy** active flag; the Details badge tracks the **pricebook record** status. Do not conflate them in assertions.
2. **8↔9 column split (D1)** — cover the 8 DOCX-named columns (verify present), assert the live 9-count, RAISE the split as an `/encore-questions` clarification (likely benign UI expansion, not a defect) per Doctrine 2.
3. **Client-vs-server filter (D2)** — S1 classifies via `playwright-cli network` whether typing filters client-side vs the Search button calling the server.
4. **1440 route-param (§5)** — S1 asserts the equipment/labor route-param as P1 (DOCX R1445-4 satisfied live).
5. **Selector strategy** — text/role/grid-header/content-anchor only (§7).

---

## §13. FCC-lens divergences (per field-case-generation.md §2)

Field types present that will need FCC coverage in Wave 2 (P2), surfaced here for GIVER:
- **text** filters: Pricebook, Pricing Strategy (Search).
- **dropdown each-option**: Location, Currency (Search).
- **checkbox toggle+revert**: Is Internal, Is Labor, Active Only (Search); Is Productions/Is Internal/Is GSO/Is Active (Strategy editor).
- **numeric BVA/negative/save-cycle**: New Price, Max Discount (Detail); read-only Base Price (`Price`).
- **multi-row FormArray**: Price Strategies list (add/edit/remove/delete-all).
Full FCC design is deferred to Wave 2 by Doctrine 1 (needs P1's live field-inventories) — listed here only as the FCC-lens seed.
</content>
