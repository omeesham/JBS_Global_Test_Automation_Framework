# Corporate Pricing — Missing `data-testid` Report (for the Encore team)

**Module**: Corporate Pricing (net-new, e2e-only)
**Date**: 2026-06-05
**Author**: WATCHDOG (SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE, Wave-1 closure)
**Rule**: LR-029 — coverage verified on the **live DOM**, shadow-root-pierced, NOT from selector files.
**App URLs audited**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing` (Search), `/details/<guid>` (Pricebook Details — Pricing Strategy + Pricing Detail tabs), `/add?type=equipment|labor` (New Pricebook).

---

## Method

Encore renders Corporate Pricing inside **shadow roots** (React/Next.js, component `corporate-pricing-container.tsx`). A naive `document.querySelectorAll('[data-testid]')` does **not** pierce shadow roots and undercounts. This audit used a **recursive shadow-root walk**:

```js
const out = new Set();
const walk = (r) => {
  r.querySelectorAll('[data-testid]').forEach(e => out.add(e.getAttribute('data-testid')));
  r.querySelectorAll('*').forEach(e => { if (e.shadowRoot) walk(e.shadowRoot); });
};
walk(document);
```

Source: companion live walk `walk-evidence-corporate-pricing-2026-06-05.md` §7 (full audit), re-confirmed live via `playwright-cli -s=cpr-audit` spot-check on 2026-06-05 (zero drift; LR-007/LR-013 spot-check path).

---

## Findings — what exists today

| Screen | distinct `data-testid` values | Values | Verification |
|---|---|---|---|
| **Search** (`/settings/corporate-pricing`) | **3** (all generic component testids) | `e2e-card-header`, `e2e-card-title`, `e2e-checkbox` | Live re-confirmed 2026-06-05 (50 of 591 rows rendered, virtualized) |
| **Pricebook Details** — Pricing Strategy tab | **0** | — | walk-evidence §7 (live, 2026-06-05) |
| **Pricebook Details** — Pricing Detail tab | **0** | — | walk-evidence §7 (live, 2026-06-05) |
| **New Pricebook** (`/add?type=equipment\|labor`) | **0** | — | Live re-confirmed 2026-06-05 |

The 3 Search testids are **generic component hooks** (`e2e-checkbox`, `e2e-card-*`) — they cannot identify a *specific* filter, column, strategy row, or grid cell. They are not automation-grade for field-level targeting.

**Net**: the Corporate Pricing module ships with **effectively zero automation-grade `data-testid` hooks**. Our specs therefore use text / role / grid-column-header / content-anchored selectors (master Doctrine 4). This is workable but brittle against copy changes and grid virtualization.

---

## Recommended `data-testid` additions (for the Encore dev team)

Stable, field-specific `data-testid`s would materially de-risk automation of this module. Priority order:

### Search page
1. Each of the 7 filter controls: Pricebook (text), Pricing Strategy (text), Location (combobox), Currency (combobox), Is Internal / Is Labor / Active Only (checkboxes).
2. The **Search** and **Reset** action buttons.
3. Each results-grid **column header** (Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency).
4. The pricebook-name **row link** (currently `<button class="cursor-pointer hover:underline">`).
5. Action-bar items: New (split-button) + its Equipment Pricing / Labor Pricing menu items, Pricing Override, Loc Pricing Export / Import, Export, Import, Grid Options.

### Pricebook Details — Pricing Strategy tab
6. The two Details **tab buttons** (Pricing Strategy, Pricing Detail).
7. Strategy-list rows + the per-strategy edit/add/remove controls + the location-mapping control.
8. The page-level **Save** button + the "Save Changes" confirm dialog.

### Pricebook Details — Pricing Detail tab
9. Grid **column headers** (ID, Product Group Name, Price, New Price, Max Discount).
10. Per-row **New Price** + **Max Discount** inputs (content-anchored today by Product Group Name).
11. The Save button + "Save Changes" dialog.

### New Pricebook (`/add`)
12. Header fields, the multi-row strategy editor, and Save / Empty-Shell controls.

---

## Disposition

- **Not a bug.** Sparse testids are a known characteristic of this net-new module (Divergence D8, confirmed live). It does not block P1 automation — it shapes the selector strategy (Doctrine 4).
- **Action for Encore**: treat the list above as an enhancement request to add stable `data-testid` hooks; until then our content/role/header-anchored selectors carry the coverage.
- **Reported per LR-029** — every count verified on the live DOM (shadow-pierced), never from our selector files.

---

## Wave-1.5 addendum (2026-06-08) — Product Group Override screen + Search toolbar I/O

**Author**: GIVER/HUNTER (SUBPLAN_CORP_PRICING_W15_0_RECON, `playwright-cli -s=cpr-w15-recon`, shadow-pierced live walk).
**App URLs audited**: `/settings/corporate-pricing/pg-override` (Product Group Override — Equipment + Labor tabs), and the Search action-bar Export ▾ / Import ▾ / Grid Options.

### Findings — what exists today

| Screen | distinct `data-testid` values | Values | Verification |
|---|---|---|---|
| **Product Group Override** (`/pg-override`) | **0** | — | Live shadow-pierced walk 2026-06-08 (8 rows after location-select; `[data-testid]` set empty) |
| **Export ▾ / Import ▾ menus** (Search) | **0** | — | Variants are `[role="menuitem"]` with text only, no testid (live 2026-06-08) |
| **Grid Options popover** (Search) | **0** | — | Non-standard markup; no testid + no standard menu/checkbox role captured |

The Override screen continues the module-wide pattern: **zero automation-grade `data-testid` hooks** (Doctrine 4). Selectors use text/role/grid-column-header/content-anchored strategy.

### Recommended `data-testid` additions (Override screen + toolbar I/O)

13. **Override tabs**: the Equipment / Labor `role=tab` buttons.
14. **Location selector**: the "Select a location" trigger + the picker dialog's search input, per-row select checkbox, and Select/Cancel/Close buttons.
15. **Filters**: the Currency combobox, the "Active only" checkbox, the "Filter Product Groups Override..." input.
16. **Override grid**: each of the 10 column headers (Location … Updated By); the per-row **Override Price** + **Max Discount %** edit cells (currently `div[role=button]`, with an **unresolved edit-activation mechanism** — see Q-WV15-1); the per-row **Active** Radix checkbox.
17. **Override toolbar**: Save, Export, Import, Grid Options; the rows-per-page control.
18. **Search Export ▾ / Import ▾**: each of the 4 menu variants (All Equipment Pricing / All Labor Pricing / All Equipment Max Discount / All Labor Max Discount), so a specific export/import variant can be targeted without text matching.
19. **Grid Options popover**: each toggleable column item (so column show/hide can be automated reliably).

### Disposition

- **Not a bug** — same sparse-testid characteristic (D8) extended to the live-discovered Wave-1.5 nodes.
- **Highest-value asks**: items 16 (Override Price / Max Discount edit cells — currently the hardest to drive, edit mechanism unresolved) and 18 (Export/Import variants — text-only menuitems).
- **Reported per LR-029** — all counts shadow-pierced on the live DOM 2026-06-08, never from selector files.
