---
artifact: walk-evidence
subject: Corporate Pricing — New Pricebook (Labor) Save positive-control + commit-fixture capture
client: encore
session_date: 2026-06-30
MCP_Session_Date: 2026-06-30
session_tool: playwright-cli (Bash, headless, shared auth state-load)
author_identity: HUNTER
page_url: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=labor
test_entity: "1604 — Parker Palm Springs"
parent_subplan: plans/pending/SUBPLAN_CORP_PRICING_LABOR_SAVE_AND_ROUTE_PARITY_GATE.md
purpose: >
  LR-061 positive-control + commit-fixture capture for the Labor Save coverage gap (TC-CPR-NPB-051/052).
  NOT a full field-inventory walk — this is a focused proof that the Save primitive fires on the Labor
  route and that one product-group is add-able, so the new Labor Save tests rest on observed truth, not
  assumption. (New-Pricebook field-inventory + surface coverage already complete per NM-2263 /
  walk-evidence-corporate-pricing-2026-06-23.md.)
---

# Labor Save — live positive-control capture (2026-06-30)

## Why

NM-2263 shipped New-Pricebook with **asymmetric Save coverage**: Equipment exercises the Save dialog
(TC-024) + a real commit (TC-031); Labor stopped at Save-*enable* (TC-029) and never proved that a
Labor pricebook actually saves. Before authoring the two missing Labor tests, this session proves —
live, with the exact primitives those tests will use — that:
1. the Save confirmation dialog is reachable on the Labor route (positive control, LR-061-C), and
2. a known Labor product-group is add-able (the commit fixture for TC-052),

so the new tests are not built on an assumption that "Labor saves like Equipment."

## Method

`playwright-cli` (Bash, headless) on the shared auth state (`clients/encore/.auth/encore-state.json`,
refreshed via `auth.setup.ts` this session). Route: `…/locations/1604/settings/corporate-pricing/add?type=labor`.
Reads via short `eval`; the add + Save drive via real `dblclick` / `click` (full pointer sequence — never
raw-JS `.click()` for the React/Angular-controlled controls).

## Evidence (raw, observed)

| # | Claim | Raw evidence | provenance |
|---|---|---|---|
| 1 | Labor create page loads authenticated | `heading: "New Pricebook"`, `type: "Labor"`, `currency: "USD"`, `saveDisabled: true` (empty form) | live · `.playwright-cli/page-2026-06-30T08-21-40-140Z.yml` |
| 2 | Labor product-group catalog present + sized | `sourceCount: 547` draggable rows; first rows: `400 Banners Design`, `428 Branding Media Production`, `521 Content Development`, `565 Digital Signage Design`, `572 DJ`, … | live · same session |
| 3 | Existing `laborGroupSample` names NOT drifted | all three of `Banners Design` / `Branding Media Production` / `Content Development` present in the live 547-row catalog | live |
| 4 | **Add-ability** of the commit fixture | double-click `[draggable=true]:has-text("Banners Design")` → detail grid row `400 Banners Design 0.00` (`gridRows: 1`, `hasBanners: true`) | live · `.playwright-cli/page-2026-06-30T08-23-55-549Z.yml` |
| 5 | Save **enables** on Labor (full savable form) | name + year + 1 strategy (`Total: 1`) + 1 product group → `saveDisabled: false` | live · `.playwright-cli/page-2026-06-30T08-25-31-087Z.yml` |
| 6 | **Save dialog reachable on Labor (POSITIVE CONTROL)** | click `Save` → `[role="alertdialog"]` visible, text = `"Save Changes Are you sure you want to save the changes? Cancel Save"` | live · `.playwright-cli/page-2026-06-30T08-25-48-461Z.yml` |
| 7 | No-commit safety (recon left nothing behind) | clicked dialog `Cancel` → dialog gone, `url` still `…/add?type=labor`, `stillOnAdd: true` — **no pricebook committed during recon** | live · `.playwright-cli/page-2026-06-30T08-25-53-834Z.yml` |

The dialog text, the Save button, and the catalog mechanics are **identical** to the Equipment route —
consistent with the shared page-level Save shell (the New-Pricebook selector partition reuses the Details
shell's Save button + the shared `[role="alertdialog"]`). The two routes differ only by the `?type=` param
(disabled Type field + the type-specific catalog: ~3707 Equipment vs **547 Labor**).

## Capture for the spec/data

- **`laborGroupA = 'Banners Design'`** (catalog ID 400) — live-verified present + add-able (rows 2 + 4 above).
- Commit-name prefix for TC-052: a distinct **`persistNamePrefixLabor`** so committed Labor books are
  separable from Equipment (`QA-Persist-…`) in Search.
- TC-051 (dialog→Cancel) and TC-052 (commit→persist→Search) reuse the existing route-agnostic helpers
  (`fillMinimalSavable`, `clickSaveExpectDialog`, `cancelSaveDialog`, `fillSavableWithProductGroup(name, year, group)`,
  `confirmSaveAndGetNewId`, `readSavedDetailGroups`, search `findRowByName`) — no page-object change needed
  (`fillSavableWithProductGroup` already takes a `group` param).

## Observations

### Bugs / Defects
none — the Labor route's load, catalog, add, Save-enable, and Save-dialog behaviors matched expectations
and were indistinguishable from the already-covered Equipment route. (The coverage *gap* that motivated
this work is a test-suite gap, not an app defect.)

### Suggestions / Improvements
none.
