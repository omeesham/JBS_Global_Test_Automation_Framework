# Field Inventory — Corporate Pricing / New Pricebook (Labor + Equipment)

**Module**: corporate-pricing-new-pricebook
**Client**: encore
**MCP_Session_Date**: 2026-06-30
**MCP_Session_Tool**: Playwright CLI (Bash, headless, shared auth state-load)
**MCP_Tool_Reason**: Functional cross-route live-verify of the New-Pricebook Save primitive on the Labor route (positive control + commit fixture); unattended, no visual assertion — CLI per LR-038 v2.
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=labor
**Test_Entity**: Office 1604 — Parker Palm Springs

> **Provenance / honest scope**: this artifact TRANSCRIBES two real, dated live Playwright-CLI
> sessions — it is not a fresh walk performed at authoring time. The 2026-06-30 session (recorded
> verbatim in `walk-evidence-corp-pricing-labor-save-2026-06-30.md`) was a FOCUSED Labor-route
> Save positive-control + commit-fixture capture, driving the exact primitives that the new Labor
> Save tests (TC-CPR-NPB-051 / -052) exercise. The EXHAUSTIVE per-field New-Pricebook inventory
> (all form fields, both routes, data-testids) was captured on 2026-06-23
> (`walk-evidence-corporate-pricing-2026-06-23.md`, the NM-2263 walk) and 2026-06-09
> (`corporate-pricing-new-pricebook-2026-06-09.md`, now stale). This 2026-06-30 record is the fresh
> live-verification anchor for the New-Pricebook test-case changes committed 2026-07-01; the older
> artifacts remain the full field reference. See the "Known gaps" section.

---

## URL(s) visited

- `…/locations/1604/settings/corporate-pricing/add?type=labor` (Labor create route — this session)
- `…/locations/1604/settings/corporate-pricing/add?type=equipment` (Equipment create route — the
  already-covered sibling; the two routes differ only by the `?type=` query param: a disabled Type
  field + the type-specific product-group catalog).

Route activation: the create form is reached from the Corporate Pricing search action bar ("New
Pricebook"); the `?type=` query param selects Labor vs Equipment and disables the Type field.

---

## Live-state caveat

The New-Pricebook create form is a fresh (empty) form on every load, so there is no long-lived-entity
drift to record. No drift observed — the live Labor form matched the documented New-Pricebook shape.

---

## Field Inventory

Live-observed on 2026-06-30 (Labor route). Where no `data-testid` was captured this session, the
control was driven by verbatim text / `[draggable=true]` per LR-014 fallback; the full testid table
is in the 2026-06-23 / 2026-06-09 artifacts.

### New Pricebook — create form (Labor route)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Type | (none) — use label "Type" | dropdown (disabled) | "Labor" | fixed by `?type=` param | always disabled on create route | — | Equipment route shows "Equipment"; value cannot be changed in-form |
| Currency | (none) — use label "Currency" | dropdown | "USD" | — | enabled | — | Read live as "USD" on office 1604 |
| Name | (none) — use label "Name" | text | (empty) | required for Save-enable | enabled | part of the Save-enable set | — |
| Price Year | (none) — use label "Price Year" | text/number | (empty) | required for Save-enable; on-screen check blocks letters only (see corporate-pricing-strategy / new-pricebook UX questions) | enabled | part of the Save-enable set | — |
| Strategy (add ≥1) | (none) — use section "Strategy" | section-row | (none) | ≥1 strategy required for Save-enable | enabled | part of the Save-enable set | `Total: 1` after adding one |
| Product-group selector | (none) — use `[draggable=true]:has-text("<group>")` | section-row (dual-list, double-click / drag to add) | source catalog populated, target empty | ≥1 product group required for a savable book | enabled | part of the Save-enable set | Labor catalog = **547** draggable source rows (Equipment ≈ 3707); sample rows: `400 Banners Design`, `428 Branding Media Production`, `521 Content Development`, `565 Digital Signage Design`, `572 DJ`. Double-clicking `Banners Design` moved it into the detail grid as `400 Banners Design 0.00` (1 grid row) |
| Save | (none) — use button "Save" | button | disabled (empty form) | enables only when name + year + ≥1 strategy + ≥1 product group all present | `saveDisabled: true` on empty form → `false` once the savable set is complete | gated by all four above | Shared Details-shell Save button; opens the confirm dialog below |

---

## Labels + Section Names

**New Pricebook create form — headings (top-down, verbatim)**:

- "New Pricebook"
- "Type"
- "Currency"
- "Name"
- "Price Year"
- "Strategy"
- (product-group dual-list: source catalog + selected-detail grid)

---

## Save-cycle observations

**Save button behavior**:

- Default state on fresh (empty) load: **disabled** (`saveDisabled: true`).
- Enables when: Name + Price Year + ≥1 Strategy + ≥1 product group are all present (`saveDisabled: false`).
- testid: (none captured) — use button text "Save".

**Save dialog** (confirm gate):

- Triggered by: click of the Save button on a savable form.
- Locator: `[role="alertdialog"]`.
- Text (verbatim): "Save Changes Are you sure you want to save the changes? Cancel Save"
- Buttons (in order, verbatim): "Cancel", "Save"
- The dialog text, the Save button, and the catalog mechanics are **identical** to the Equipment
  route (shared page-level Save shell); the routes differ only by `?type=` param + catalog contents.

**Post-save toast**: not exercised this session (recon left no committed pricebook — see below). Toast
behavior on a real Labor commit is covered by TC-CPR-NPB-052.

**No-commit safety**: clicking the dialog "Cancel" dismissed it, the URL stayed on `…/add?type=labor`,
and no pricebook was committed during recon (read-only positive control).

---

## Known App Bugs

No app bugs identified in this session. The Labor route's load, catalog, add, Save-enable, and
Save-dialog behaviors matched expectations and were indistinguishable from the already-covered
Equipment route. (The coverage *gap* that motivated this session was a test-suite gap — Labor stopped
at Save-enable and never proved a Labor pricebook saves — not an app defect.)

---

## Staleness signal

- **Last verified**: 2026-06-30
- **Fresh-until**: 2026-07-14
- **Stale-after**: 2026-07-30
- **Refresh triggers**: Encore release announcement · New-Pricebook schema change · generator
  spot-check disagreed with this artifact · client-flagged DOM change.

---

## Known gaps

- This 2026-06-30 session was a FOCUSED Labor Save positive-control + commit fixture, not an
  exhaustive per-field walk. The complete New-Pricebook field/testid inventory (both routes) lives in
  `walk-evidence-corporate-pricing-2026-06-23.md` (fresh, NM-2263) and the now-stale
  `corporate-pricing-new-pricebook-2026-06-09.md`. Consumers needing the full data-testid set should
  read those alongside this record.
- Server-side validation on final Save (e.g. Price Year format acceptance) was not exhaustively
  exercised here; the on-screen behavior is recorded, and the open product/UX question about Price
  Year is tracked in the Corporate Pricing tracker.
