---
artifact: old-site-baseline
client: encore
session_date: 2026-08-10
session_tool: Playwright (headless Chromium, automated observation)
author_identity: OWNER
page_url_old: https://navigator2.training.psav.com/#/setup/DiscountPricing/settings
page_url_new_equivalent: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-optimization
test_entity: office 1604 (not a row in the list; list is global across all offices)
parent_subplan: plans/pending/PLAN_DISCOUNT_OPTIMIZATION_AUTOMATION.md
baselineScope: tab1-observed tab2-baseline-absent
jira_tickets: [NM-3342, NM-3340, NM-3327, NM-1672, NM-1183, NM-1221]
zero_mutations: true
---

# Old-Site Baseline — Discount Optimization (2026-08-10)

> **Column re-labelling, 2026-08-12** — after this artifact was recorded, the application re-labelled two
> grid columns: *No Implied Discount* → **Allow Special Rate**, and *No Implied Start* → **Special Rate
> Start Date**. This is a display-label change only; the underlying field and its Yes/No values are
> unchanged. The observations below are preserved verbatim as recorded on their date and deliberately keep
> the original column names.

> **Zero mutations confirmed.** No fields were edited, no saves were submitted, no rows were added
> or deleted. The Add-row dialog was opened to observe its form controls, then immediately cancelled
> via the Cancel button before any location was selected. The save button was never clicked (it was
> disabled in pristine state throughout).

---

## §1 Access

**Navigation path (verbatim menu labels):**

```
Top nav → Setup → Discount Optimization Settings
```

The "Setup" item is a top-level dropdown in the main navigation bar. Expanding it reveals a flat
list including "Corporate Pricing", "Corporate PG Pricing Override", **"Discount Optimization
Settings"**, "Discount Matrix", "ECT Settings", "Local Office Settings", and several others.

**Resulting URL:** `https://navigator2.training.psav.com/#/setup/DiscountPricing/settings`

**Critical architectural divergence (vs ticket prior):** The ticket corpus (NM-1072, NM-1156,
NM-1183, NM-1221, NM-967, NM-562, NM-615) predicted this surface lives under **Local Office
Settings**. On the observed legacy site it does **not** — it is a standalone entry directly under
the **Setup** top-nav dropdown. "Local Office Settings" is a separate Setup item on the same
menu. See §6 for classification.

**App version:** Navigator Order Entry 2026.03.12.978.1  
**Environment flag:** `gEnvironment = 'T'` (Training)

---

## §2 Selector style notes

Legacy site uses Angular with generated attribute selectors (`_ngcontent-ng-c3939246972`). There
are **zero `data-testid` attributes** anywhere on the page. Stable anchors available:

| Element | Stable anchor |
|---|---|
| Page panel heading | `.panel-heading` text content `"Discount Optimization"` |
| Add button | `button[title="Add"]` or `button.btn-success:has-text("Add")` |
| Save button | `button[title="Save"]` or `button.btn-success:has-text("Save")` |
| Table rows | `tr` elements under the Angular component; innerText parsing required |
| Add-row location picker | `button#locationLink` (text: "Select a Location") |
| Row count footer | text "Count NNNN" in page innerText |

No Bootstrap glyphicon checkmark icons were found on this table. Booleans render as plain text
(see §5).

---

## §3 Tab / feature inventory

| Feature | Old-site baseline | New-site equivalent |
|---|---|---|
| Tab 1 — Discount Optimization grid | **Present** (single-page, no tab chrome) | Present as Tab 1 |
| Tab 2 — Special Rate Exemptions by Service Type | **Absent** (`baseline-absent`) | Present as Tab 2 (29 service types) |
| Search box | **Absent** | Present (tab 1: "Search by location number or location name") |
| Sort on columns | **Not observed** (no sort arrow indicators found) | Present (8 sortable headers on tab 1) |
| Pagination | **Absent** — all 2155 rows rendered in one scrollable view | Absent (all rows rendered; ~22s first load) |

---

## §4 Field-level baseline

### Grid columns (Tab 1 equivalent)

| # | Column label (verbatim) | Control type | Default / observed values | Notes |
|---|---|---|---|---|
| 1 | **ID** | Read-only text | e.g. `1102`, `1105`, `1112` | Office/location number |
| 2 | **Location Name** | Read-only text | e.g. `Corporate Office - Long Beach` | May carry lifecycle suffix: `- DEACTIVATED`, `deactivated` |
| 3 | **No Implied Discount** | Read-only text (boolean) | `Yes` or `No` | Renders as plain text — see §5 |
| 4 | **No Implied Start** | Read-only text (date or empty) | e.g. `07/1/2026`, `02/24/2019`, or empty | MM/DD/YYYY format; empty cell = not set |

**Footer / row count:** Text `"Count 2155"` rendered below the table body. 2155 rows on old site;
new site tab 1 shows 2154 — a one-row difference. Both include deactivated locations.

**Office 1604 in the list:** NOT found. Office 1604 is the test entity but it is not a row in
this grid — the grid lists locations that have been explicitly added to the Discount Optimization
configuration. 1604 being absent means it has no entry and would inherit default behavior.

### Add-row dialog (observed, then cancelled — zero mutations)

Clicking **Add** did not open a modal; it inline-expanded a form row within the grid. The only
field observed:

| Field label | Control type | Default value | Notes |
|---|---|---|---|
| (Location picker) | Button: `id="locationLink"`, text `"Select a Location"` | None selected | Clicking would open a location search popup; **not clicked** (observation stopped at button appearance) |

**Save dialog text:** The Save button was disabled throughout (pristine + add-row cancelled). No
save confirmation dialog was triggered. **Save dialog text: not observable in this session.**

**Validation text:** No validation messages appeared. Save was disabled rather than showing inline
errors — the pristine-state model prevents observing inline validation without a live form entry.

---

## §5 Schema observations

### Boolean render format

The "No Implied Discount" column renders as **plain text `"Yes"` or `"No"`** in the table cells.
This is distinct from all three formats tracked in LR-036:

| Format | Presence |
|---|---|
| Unicode ✔ (readable via `textContent`) | **Not used** on this table |
| SVG `lucide-check` (Angular new site) | **Not used** (old site, no Lucide icons) |
| Bootstrap Glyphicon (`span.glyphicon-ok`) | **Not used** — no glyphicon elements found |
| **Plain text `"Yes"` / `"No"`** | ✅ **This table uses this format** |

**Implication for automation:** Any boolean reader for the new site tab 1 must NOT assume
old-site "Yes"/"No" text. New site uses Angular + Radix components — verify the new-site
render format independently before writing assertions.

### Date format

"No Implied Start" stores dates as `MM/DD/YYYY` (e.g. `08/30/2019`, `07/1/2026`). Empty cell =
field not set (not `null` text, just whitespace).

---

## §6 Divergence candidates

| # | Observed fact | Classification | Evidence |
|---|---|---|---|
| D-1 | Surface lives under **Setup → Discount Optimization Settings**, NOT under Local Office Settings | `INTENTIONAL-UX-CHANGE` | Ticket corpus predicted Local Office Settings; live DOM shows Setup dropdown. The feature is global-scope (all offices), so a global Setup home is architecturally coherent. |
| D-2 | **No tabs on old site** — single-page grid; new site has 2 tabs | `INTENTIONAL-UX-CHANGE` | Tab 2 (Special Rate Exemptions by Service Type) is a new feature addition; old site predates it. |
| D-3 | **No search box on old site** | `INTENTIONAL-UX-CHANGE` | NM-3327 added search to new site (PR #3111 merged 2026-08-04). Old site never had search. |
| D-4 | **Booleans render as text "Yes"/"No"** on old site vs Angular/Radix on new site | `INTENTIONAL-UX-CHANGE` | Different rendering stacks; not a bug. |
| D-5 | Row count **2155 old** vs **2154 new** (one-row difference) | `REQUIREMENT-GAP` | Unclear which is authoritative; one location may have been added or removed between environments. |
| D-6 | Tab 2 (Special Rate Exemptions by Service Type) **absent on old site** | `BASELINE-ABSENT` | Feature postdates old site. Product owner confirmed data not synced. |
| D-7 | Office 1604 **not a row** in the grid on old site | `INTENTIONAL-UX-CHANGE` | Grid only lists locations with explicit Discount Optimization configuration; 1604 has none. Same behavior expected on new site (1604 absent from tab 1 list initially). |

---

## Baseline diff

| Dimension | Old site (navigator2.training.psav.com) | New site (cloudapps-e2e) |
|---|---|---|
| Navigation path | Setup → Discount Optimization Settings | (varies; tab-based setup page) |
| URL pattern | `/#/setup/DiscountPricing/settings` | `/navigator/locations/1604/settings/discount-optimization` |
| Tab structure | None (single page) | Tab 1: Discount Optimization; Tab 2: Special Rate Exemptions by Service Type |
| Tab 1 columns | ID, Location Name, No Implied Discount, No Implied Start | ID, Location Name, No Implied Discount, No Implied Start (+ per-row remove control) |
| Tab 1 row count | 2155 | 2154 |
| Tab 1 search | Absent | Present ("Search by location number or location name") |
| Tab 1 sort | Not observed | 8 sortable headers present |
| Tab 2 | Absent (baseline-absent) | 29 service types; columns: Service Type, Exempt; no search, no Add, no Save |
| Boolean render | Plain text "Yes" / "No" | To be verified per LR-036 (not assumed) |
| Add affordance | Button "Add" → inline row with location picker button | Button "Add" present |
| Save affordance | Button "Save" (disabled when pristine) | Button "Save" present |
| Save dialog | Not observable (Save was disabled) | Not yet observed in baseline walk |
| Pagination | None (all rows rendered) | None (all rows rendered; ~22s first load) |
| Search | None | Present on tab 1 only |
| Office 1604 row | Absent from list | Absent from list (same pattern expected) |

---

## Observations

### Bugs / Defects

none

### Suggestions / Improvements

- The old site's "Count 2155" vs new site's "2154" row-count difference should be confirmed with
  the client before authoring row-count assertions. The safe assertion is "> 2000 rows" (or
  wait-for-non-zero) rather than an exact count.
- The old site Add-row form shows only a location picker button (no inline text fields for the
  boolean columns), suggesting defaults are applied on add. The new site Add flow should be
  observed independently to determine if it matches this pattern.

---

## ASSUMPTIONS-MADE

1. The "Training" environment (`gEnvironment = 'T'`) is the intended old-site observation target.
   The domain `navigator2.training.psav.com` matches the ticket instruction verbatim.
2. The Add-row dialog was opened only to observe the form field structure; the location picker
   button (`#locationLink`) was NOT clicked. The cancellation was via the Cancel button that
   appeared on the inline row. No location was selected; no state was dirtied.
3. "No sort observed" means no sort-arrow indicators were found in the column header DOM. This
   does not prove sort is absent — the selector may have missed a non-standard implementation.
   Old-site sort capability should be treated as UNVERIFIED, not confirmed-absent.
4. Office 1604 absent from the list is treated as expected (no configured entry), not as a data
   gap or defect, consistent with new-site behaviour (1604 also absent from tab 1 list initially).

## ASK

none

---

## Coverage Manifest

**MCP_Session_Date**: 2026-08-11
**Coverage_Ratio**: 2/2 — both enumerated controls (Add, Save) dispositioned `read-only-verified`. NOTE: this denominator is small because this baseline walk enumerated only the two panel-header controls; it is not a full-surface enumeration. Read this ratio as "everything this artifact enumerated is dispositioned", not as "the whole old-site surface was walked".
**CrossCheck**: clean — corrected 2026-08-17. The earlier INCOMPLETE was a selector defect, not a rendering failure: the old-site grid uses ARIA role divs (`[role=row]`), never `<tbody><tr>`, so the original `tbody tr` poll could never match. A re-walk on 2026-08-17 observed 39 rows rendered in ~32s headless, footer "Count 2155" — the same footer the original walk recorded.
**Completion_Record**: clients/encore/specs_planning/_internal/old-site-baseline/legacy-completion-record.json
**Enumeration_Script**: `scripts/nav2-legacy-discount-walk.mjs` (T41 menu-click run)
**Session_Hash**: `walk-t41-2026-08-11`
**Row_Count_Confirmed**: 39 rows observed via `[role=row]` on 2026-08-17 (virtualised grid renders a page at a time); footer text "Count 2155" is the authoritative total. The earlier "0 rows in tbody" reading came from querying `tbody tr`, which this grid does not use.
**Footer_Text_Observed**: "Count 2155"
**Auth_State**: `clients/encore/.auth/nav2-state.json` (e2e state NOT overwritten: true)
**Mutation_Attestation**: Zero mutations. No fields edited, no saves submitted, no rows added or deleted.

**DROPDOWN_PROOF**: PROVED — Setup dropdown opened via hover (no force click). Siblings confirmed: Corporate Pricing, Discount Matrix, ECT Settings, Local Office Settings. Full verbatim list in `.claude/state/ua-worker/chips/discount-optimization/out-t41/legacy-menu-walk.md` §DROPDOWN_PROOF.

**REACHABLE_VS_RENDERING**: Page is REACHABLE and RENDERING — corrected 2026-08-17. Correct URL confirmed, dropdown proven open, link clicked, footer "Count 2155" rendered, and 39 grid rows observed via `[role=row]`. The earlier "reachable but not rendering" finding is RETRACTED: it was produced by polling `tbody tr` on a grid that renders ARIA role divs.

| Control Ref | Disposition | Label | Notes |
|---|---|---|---|
| `button::Add` | `read-only-verified` provenance: live evidence: `.claude/state/ua-worker/chips/discount-optimization/out-t41/legacy-menu-walk.md` | Add | Panel header — Add row button |
| `button::Save` | `read-only-verified` provenance: live evidence: `.claude/state/ua-worker/chips/discount-optimization/out-t41/legacy-menu-walk.md` | Save | Panel header — Save button (disabled in pristine state) |
