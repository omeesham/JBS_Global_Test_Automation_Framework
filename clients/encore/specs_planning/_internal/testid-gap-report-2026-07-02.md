---
title: Encore Navigator Cloud — data-testid Coverage & Gap Report
date: 2026-07-02
author: OWNER (deliverable-unfuck Phase 6)
scope: selector-usage inventory across clients/encore/src/selectors/**
status: INTERNAL groundwork — NOT yet a client message (see §7 before sending anything to Encore)
verification: selector-file inventory only; per-module LIVE-DOM confirmation (LR-029) REQUIRED before any missing-testid claim goes to the client
---

# data-testid Coverage & Gap Report — Encore Navigator Cloud

## 1. Purpose

Encore's own convention for the newer Navigator Cloud modules is "instrument every interactive
control with a `data-testid`, or `fixme` the test until it has one." Where a control shipped without
a `data-testid`, this framework fell back to role / text / structural selectors to preserve coverage —
a deviation that was never reported back to Encore. This report inventories those fallbacks so the
gap can be raised as a single, grouped request.

**What this report IS**: an inventory of the selectors *we currently use* that are not `data-testid`,
grouped by module and by widget family, with a suggested `data-testid` name for each family.

**What this report is NOT (yet)**: a verified list of controls the app is *missing* a `data-testid`
on. Selector files show what *we adopted*, not what *exists* — the app may already expose a
`data-testid` we never picked up, or may have added one since. Per LR-029, every "missing" claim must
be confirmed against the live DOM (`document.querySelectorAll('[data-testid]')` per page/tab)
**before** it is put in front of the client. §7 is the gating step.

## 2. Executive summary

- **Overall coverage ≈ 64%** of adopted selector values carry a `data-testid`
  (~290 testid-based vs ~162 non-testid selector values across the selector files).
- **The entire Corporate Pricing module uses ZERO `data-testid`** — all 7 selector files
  (search, override, strategy, details, pricing-detail, new-pricebook, plus dynamic pricing rows)
  rely on role / text / grid-structure selectors. This is the single largest, highest-value gap:
  ~113 non-testid selectors concentrated in one module.
- **The Locations module is mostly well-instrumented** (most tabs 90–100%), with focused gaps in a
  few surfaces: the shared dialog selectors, the Location Management History grid, the left-panel
  launcher dialogs, and the Account & Address venue block.
- **Root cause is app-side, not test-side**: Radix UI portal content (dialogs, dropdown listboxes)
  renders outside the app root and the newer modules were built without `data-testid` instrumentation;
  the legacy old-site surfaces use `name=`/`id=` by design (LR-ENC-001, out of scope for new-site
  testids).

## 3. Per-module coverage (selector-file inventory)

| Selector file | testid | non-testid | notes |
|---|---:|---:|---|
| corporate-pricing/search.ts | 0 | ~35 | grid + filter controls, all role/text |
| corporate-pricing/override.ts | 0 | ~29 | inline cell editors, spinbuttons |
| corporate-pricing/new-pricebook.ts | 0 | ~13 | create-mode grid + product-group rows |
| corporate-pricing/details.ts | 0 | ~10 | detail grid |
| corporate-pricing/pricing-detail.ts | 0 | ~9 | detail-tab controls |
| corporate-pricing/strategy.ts | 0 | ~7 | strategy list + assignment grid |
| locations/shared.ts | 3 | ~6 | shared Save / Unsaved-changes dialogs (Radix portal) |
| locations/history.ts | 4 | ~4 | Location Management History grid |
| locations/left-panel-basic-information.ts | 16 | ~12 | Pay To / address launcher dialogs |
| locations/account-address.ts | 23 | ~10 | Venue block (dt/dd positional), account list dialog |
| locations/local-info.ts | 57 | ~5 | mostly instrumented |
| local-office/local-office-settings.ts | 47 | ~6 | mostly instrumented |
| locations/auto-addon.ts | 12 | ~1 | Unsaved-changes dialog (Radix portal) |
| auth/login.ts | 0 | ~8 | Microsoft SSO screens (third-party — out of scope) |
| (fully instrumented) currency / legal / notes / pricing / shared-setup / ect / history-lo | 100% | 0 | — |

> Counts are approximate (a few files carry more than one `data-testid` per source line, so raw
> percentages can read slightly over 100%); the module-level shape is accurate and matches the
> independent audit's corrected figures.

## 4. Non-testid selectors grouped by widget family

| Family | ~count | Current selector shape (example) | Why no testid today | Suggested `data-testid` |
|---|---:|---|---|---|
| Radix dialog (portal) | — | `[role="alertdialog"]:has(h2:text-is("Unsaved changes"))` | Radix renders the dialog in a portal outside the app root; the inner buttons carry no testid (`innerCount: 0`) | `location-settings-modal-<name>`, buttons `…-btn-<action>` |
| Dropdown / listbox option | ~40 | `[role="listbox"] [role="option"]:has-text("USD")` | Radix Select portal options are unlabelled | `…-select-<field>-option-<value>` |
| Grid row / cell | ~40 | `tr:has(td:has-text("<name>"))`, `td:nth-child(4) button[role="checkbox"]` | Corporate Pricing + history grids render rows without per-row/cell testids | `…-grid-row-<key>`, `…-cell-<column>` |
| Text / role controls | ~120 role + ~139 text | `getByRole('button', { name: 'Search' })`, `:has-text("No results")` | newer modules built without instrumentation | `…-btn-<action>`, `…-msg-<name>` |
| Legacy `name=` / `id=` | 8 | `input[name="OracleProductCode"]`, `#ldwid` | old-site / legacy fields (LR-ENC-001) — **out of scope** for new-site testids | n/a (baseline-only) |
| Positional (`nth`) | 15 | `panel dd:nth-child(3)` (Venue City) | display blocks with no per-field anchor | `…-venue-<field>` |

## 5. Suggested naming convention

Follow the pattern the instrumented tabs already use:
`location-settings-<control-type>-<field-or-purpose>[-<value>]`, e.g.
`location-settings-checkbox-currency-USD-selected`, `location-settings-btn-save`,
`location-settings-modal-unsaved-changes`. For Corporate Pricing, mirror it under a
`corporate-pricing-*` prefix: `corporate-pricing-search-input`,
`corporate-pricing-grid-row-<pricebook>`, `corporate-pricing-cell-<column>`,
`corporate-pricing-override-editor-<field>`.

## 6. Priority order for the client ask

1. **Corporate Pricing (whole module)** — highest value; zero coverage today, and the grid/dialog
   families are exactly where role/text selectors are most fragile.
2. **Radix portal dialogs** (Save Changes, Unsaved Changes, error dialogs) and **dropdown listbox
   options** — shared across Locations; instrumenting these once helps many tabs.
3. **Location Management History grid** + **left-panel launcher dialogs** + **Account & Address venue
   block** — focused Locations gaps.
4. Skip: Microsoft SSO screens (third-party) and old-site `name=`/`id=` fields (baseline-only,
   LR-ENC-001).

## 7. Before this becomes a client message (gating step — do not skip)

Per LR-029, a selector-file inventory alone must not be sent as a "you are missing these testids"
claim — selector files record what we adopted, not what exists live. For each module above, before
finalizing the ask:

1. Navigate to the page/tab and run `document.querySelectorAll('[data-testid]')` on the live DOM.
2. Cross-reference the live testids against the non-testid selectors we use — drop any control the
   app *already* exposes a testid for (we simply never adopted it).
3. Only the residue — controls with no live `data-testid` — goes into the client request.

The client-facing request itself is prepared and delivered via the explicit, user-triggered
reporting path (`/encore-questions` or `/report`) — this document is the internal groundwork, not the
outbound message. Keep the current role/text selectors running until testids land; swap module by
module afterward.
