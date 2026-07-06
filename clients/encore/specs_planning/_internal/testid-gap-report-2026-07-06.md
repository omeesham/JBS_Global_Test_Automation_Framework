---
title: Encore Navigator Cloud — data-testid Coverage & Gap Report (v2, LR-029 live-verified)
date: 2026-07-06
author: OWNER (WS-E of PLAN_GATE_BACKLOG_AND_1604_TRACKER — testid-first golden rule)
supersedes: testid-gap-report-2026-07-02.md (v1 — selector-file inventory only, NOT live-verified)
scope: Corporate Pricing surfaces, live-DOM verified via playwright-cli on cloudapps-e2e (office 1604), 2026-07-06
verification: LR-029 SATISFIED for Corporate Pricing — every "missing testid" claim below is confirmed against the live DOM (dumps in testid-live-dumps-2026-07-06/). Locations-module rows remain v1 selector-file inventory (NOT re-swept here) and are carried forward as UNVERIFIED.
status: INTERNAL groundwork. The Corporate-Pricing section is now client-ready (live-verified). §7 gating still applies to the carried-forward Locations rows.
---

# data-testid Coverage & Gap Report v2 — Encore Navigator Cloud

## 0. What changed from v1 (and why it matters)

v1 (2026-07-02) was a **selector-file inventory** — it read the selectors *we adopted*, not what the
app *exposes*. Per LR-029 that is not a defensible "you are missing these testids" claim, because a
selector file cannot see a `data-testid` the app added that we simply never picked up. v1 headlined
"**the entire Corporate Pricing module uses ZERO data-testid**".

A live-DOM sweep on 2026-07-06 (playwright-cli, office 1604, fresh auth) **corrects that claim**:

- **Corporate Pricing does expose a few generic `data-testid`s** — but only 3 unique, all on the
  Search screen, and **none are usable to target a specific control** (details in §2).
- Every other Corporate Pricing surface swept — Product Group Override, New Pricebook
  (equipment + labor), Pricebook Details (including the Pricing Strategy and Pricing Detail tabs) —
  has **zero** `data-testid` live, confirming the practical gap.

So the *practical* conclusion of v1 stands (the controls we automate have no adoptable testid), but the
*absolute* "zero testids" wording was wrong and would have embarrassed us in front of the client. This
is exactly the failure mode LR-029 exists to prevent. v2 states the precise, live-verified position.

## 1. Method (LR-029 satisfied for Corporate Pricing)

For each surface: `playwright-cli` fresh-auth navigate → settle → `document.querySelectorAll('[data-testid]')`
(+ interactive-control counts to prove the screen actually rendered, not a spinner). Raw per-screen
dumps live alongside this file in `testid-live-dumps-2026-07-06/`. A dropdown/menu was opened on Search
to confirm portal/overlay content surfaces no additional testids.

## 2. Live-verified per-surface findings (Corporate Pricing)

| Surface | Route | Live `data-testid` count | testids present | Controls rendered (btn / input / role / rows) | Disposition |
|---|---|---:|---|---|---|
| Search | `…/settings/corporate-pricing` | **5** (3 unique) | `e2e-card-header`, `e2e-card-title`, `e2e-checkbox` | 107 / 7 / 7 / 51 | generic hooks only — see §3 |
| Product Group Override | `…/corporate-pricing/pg-override` | **0** | — | 50 / 2 / 10 / 1 | no testid live |
| New Pricebook (equipment) | `…/corporate-pricing/add?type=equipment` | **0** | — | 22 / 3 / 3 / 0 | no testid live |
| New Pricebook (labor) | `…/corporate-pricing/add?type=labor` | **0** | — | 22 / 3 / 3 / 0 | no testid live |
| Pricebook Details (+ Pricing Strategy / Pricing Detail tabs) | `…/corporate-pricing/details/<id>` | **0** | — | 24 / 2 / 9 / 1 | no testid live (tabs "Pricing Strategy" + "Pricing Detail" present, still 0) |
| Search dropdown / menu overlay | (Search, menu opened) | **+0** | — | listbox 0 / options 0 | portals/menus add no testid |

Raw evidence: `testid-live-dumps-2026-07-06/{search,pg-override,new-pricebook-equipment,new-pricebook-labor,details}.json`,
`search-testid-detail.json`, `details-tabs-probe.json`, `search-dropdown-portal.json`.

## 3. The 3 Search testids — why they are NOT adoptable

| testid | count | element | sample text | verdict |
|---|---:|---|---|---|
| `e2e-card-header` | 1 | `div` | "Search Criteria" | card chrome, not a control |
| `e2e-card-title` | 1 | `div` | "Search Criteria" | card chrome, not a control |
| `e2e-checkbox` | 3 | `button` | (empty) | shared component hook — **non-unique** across 3 checkboxes, cannot target a specific one |

These are generic component-library hooks (all `e2e-*`, stamped on wrapper components), not purpose-built
instrumentation. `e2e-card-*` mark the card container/title; `e2e-checkbox` is the same string on every
checkbox, so it cannot distinguish which checkbox. **None of the actual Search controls** — the Search
button, the criteria inputs, the results-grid rows/cells — carry a testid. So the module still needs
per-control instrumentation; the generic hooks do not close the gap.

Contrast: the Locations tabs use purpose-built `location-settings-*` testids (per-control, unique). The
absence of that pattern on Corporate Pricing is the real, live-verified ask.

## 4. Non-testid selectors we currently use (Corporate Pricing) — grouped by widget family

Live counts from the testid-preference gate full-scan (`scripts/check-testid-preference.mjs`), 2026-07-06:

| Selector file | non-testid selector lines |
|---|---:|
| corporate-pricing/override.ts | 25 |
| corporate-pricing/search.ts | 22 |
| corporate-pricing/details.ts | 8 |
| corporate-pricing/pricing-detail.ts | 8 |
| corporate-pricing/new-pricebook.ts | 6 |
| corporate-pricing/strategy.ts | 6 |

| Family | Current selector shape (example) | Live status | Target `data-testid` (suggested) |
|---|---|---|---|
| Search controls | `getByRole('button',{name:'Search'})`, criteria inputs | no testid live | `corporate-pricing-search-btn`, `corporate-pricing-search-<field>` |
| Search results grid | `tr:has(td:has-text("<pricebook>"))`, cell `td:nth-child(n)` | no testid live | `corporate-pricing-grid-row-<key>`, `…-cell-<column>` |
| Checkbox (grid/criteria) | `button[role="checkbox"]` | `e2e-checkbox` present but **non-unique** | `corporate-pricing-<purpose>-checkbox` (unique per purpose) |
| Product-group Override editors | inline `input`/spinbutton by position | no testid live | `corporate-pricing-override-editor-<field>` |
| New Pricebook form | `getByLabel`/role inputs | no testid live | `corporate-pricing-new-<field>` |
| Details / Strategy / Pricing-Detail grids | role/text/grid-structure | no testid live | `corporate-pricing-detail-<control>`, `…-strategy-<control>` |
| Radix dropdown / listbox option | `[role="listbox"] [role="option"]:has-text("…")` | no portal testid live | `corporate-pricing-select-<field>-option-<value>` |

## 5. Switch-back checklist (golden-rule obligation — track each until the testid lands)

Per the testid-first golden rule (AGENT_SHARED_RULES.md §5 + LR-014): each row below currently runs on
the next-best locator; when Encore adds the target testid, switch the selector back and harden.

| # | Family / control | Current locator kind | Target testid | Live status (2026-07-06) | Switch-back status |
|---|---|---|---|---|---|
| 1 | Search button | role/name | `corporate-pricing-search-btn` | MISSING | pending app testid |
| 2 | Search criteria inputs | role/label | `corporate-pricing-search-<field>` | MISSING | pending app testid |
| 3 | Search results grid rows/cells | text/nth-child | `corporate-pricing-grid-row-<key>` / `…-cell-<col>` | MISSING | pending app testid |
| 4 | Grid/criteria checkbox | `button[role=checkbox]` | `corporate-pricing-<purpose>-checkbox` | GENERIC `e2e-checkbox` (non-unique) | pending unique app testid |
| 5 | Product Group Override editors | positional input | `corporate-pricing-override-editor-<field>` | MISSING | pending app testid |
| 6 | New Pricebook form fields | role/label | `corporate-pricing-new-<field>` | MISSING | pending app testid |
| 7 | Details / Strategy / Pricing-Detail grids | role/text/grid | `corporate-pricing-detail-*` / `…-strategy-*` | MISSING | pending app testid |
| 8 | Dropdown listbox options | text within portal | `corporate-pricing-select-<field>-option-<value>` | MISSING | pending app testid |

All 8 remain on their fallback locators and RUN today (golden rule — coverage is never dropped for a
missing testid). Each is a switch-back candidate the moment the app exposes the target.

## 6. The single client-ask (rolled up)

**One module-level request to Encore**: instrument the Corporate Pricing controls with purpose-built,
per-control `data-testid`s (the `corporate-pricing-*` names in §4/§5), mirroring the `location-settings-*`
pattern already used on the Locations tabs. Today the module exposes only 3 generic component hooks on
Search (`e2e-card-header`, `e2e-card-title`, and a non-unique `e2e-checkbox`) — none target a specific
control, so our specs run on role/text/grid fallbacks that break when copy or layout changes. This is
the highest-value instrumentation gap; the Override and results-grid families are where the fallbacks
are most fragile.

## 7. Carried-forward Locations rows (still UNVERIFIED — v1 gating applies)

v2 live-verified **Corporate Pricing only**. The v1 Locations-module rows (shared Radix dialogs, Location
Management History grid, left-panel launcher dialogs, Account & Address venue block) are **carried
forward unchanged and remain selector-file inventory, NOT live-verified**. Before any Locations testid
gap is sent to the client, run the same LR-029 live-DOM sweep per tab (`document.querySelectorAll('[data-testid]')`),
drop any control the app already instruments, and keep only the live-confirmed residue. Do NOT forward
the Locations rows as a client claim on the strength of v1 alone.

The client-facing request is delivered via the explicit, user-triggered reporting path
(`/encore-questions` / `/report`) and the shipped QA tracker — this document is the internal groundwork.
Keep the current fallback locators running until testids land; switch back per §5 afterward.
