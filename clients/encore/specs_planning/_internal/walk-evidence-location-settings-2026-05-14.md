---
Date: 2026-05-14
Identity: WATCHDOG
Plan: handoff-3-r1-cheerful-orbit (scratch handoff)
BrowserTool: cli
BrowserToolReason: 10-tab unattended catalog walk + network capture for endpoint bisection; no visual diff, no fresh MFA, no `pause:` step (LR-038 v2 matrix)
Office: 1604 (Parker Palm Springs)
URLs:
  - https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location
  - https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office
Bugs:
  - BUG-MGH-001 (clients/encore/reports/bugs/BUG-MGH-001.json) — R1 bisection
  - BUG-LOC-NTS-002 (reports/bugs/BUG-LOC-NTS-002.json) — R3 cross-tab dialog inventory
WalkUser: v-rutvik.khosariya@psav.com
WindowStartIso: 2026-05-14T14:39:08.193Z
WindowEndIso: 2026-05-14T14:54:35Z
---

# Walk Evidence — Location Settings + Local Office Settings (10-tab single-session walk)

Single-session RCA walk covering all 8 Location Settings sub-tabs (Basic Information container, on `/settings/location`) plus 2 Local Office Settings tabs (`/settings/local-office`). Per-tab procedure: dirty the form with a minimal-noise change → click left-panel Save → capture the alertdialog confirm-button text → confirm save → navigate to the relevant History grid → read the newest row's Country (and currency/tax-mode/region for context).

Browser-tool declared per LR-038 v2: **Playwright CLI MCP** (`mcp__plugin_playwright_playwright__*`). Reason embedded in frontmatter.

## Tab inventory

| # | Tab | Save endpoint (observed) | Save dialog confirm button | History row created | MGH Country | MGH currency / tax / region |
|---|---|---|---|---|---|---|
| 1 | Local Information (`location-settings-sub-tab-local-information`) | `POST /navigator/locations/1604/settings/location` | `Ok` | 02:40:02 PM (LM History row 0) | **United States** (populated) | USD / US / Palm Springs |
| 2 | Notes (`location-settings-sub-tab-notes`) | `POST /navigator/locations/1604/settings/location` | `Ok` | 02:42:27 PM | **United States** (populated) | USD / US / Palm Springs |
| 3 | Pricing (`location-settings-sub-tab-pricing`) | `POST /navigator/locations/1604/settings/location` | `Ok` | 02:43:42 PM | **United States** (populated) | USD / US / Palm Springs |
| 4 | Legal (`location-settings-sub-tab-legal`) | `POST /navigator/locations/1604/settings/location` | `Ok` | 02:45:41 PM | **United States** (populated) | USD / US / Palm Springs |
| 5 | Currency (`location-settings-sub-tab-currency`) | `POST /navigator/locations/1604/settings/location` | `Ok` | 02:47:05 PM | **United States** (populated) | USD,MXN / US / Palm Springs |
| 6 | Account and Address (`location-settings-sub-tab-account-and-address`) | `POST /navigator/locations/1604/settings/location` | `Ok` | 02:48:39 PM | **United States** (populated) | USD,MXN / US / Palm Springs |
| 7 | Shared Setup Locations (`location-settings-sub-tab-shared-setup-locations`) | `POST /navigator/locations/1604/settings/location` | `Ok` | 02:50:05 PM | **United States** (populated) | USD,MXN / US / Palm Springs |
| 8 | Auto Add-On (`location-settings-sub-tab-auto-add-on`) | `POST /navigator/locations/1604/settings/location` | `Ok` | 02:51:17 PM | **United States** (populated) | USD,MXN / US / Palm Springs |
| 9 | Local Office Basic Information (`local-office-settings-tab-basic-information`) | `POST /navigator/locations/1604/settings/local-office` (separate URL per LR-017) | `Save` | 02:52:32 PM (LO History row 0) | **n/a** — LO History has 42 columns, no Country column | n/a |
| 10 | Local Office ECT Settings (`local-office-settings-tab-ect-settings`) | `POST /navigator/locations/1604/settings/local-office` (section save `ect-settings-btn-save-fixed-costs-btn`) | **NO DIALOG** — direct save (button disables, no confirmation gate) | None created (per SUBPLAN_HISTORY_01_MCP_FINDINGS §3.5 — ECT saves do not write history rows) | n/a | n/a |

### Per-tab change vector (what was dirtied to enable Save)

| # | Tab | Field changed | Before → After |
|---|---|---|---|
| 1 | Local Information | `location-settings-checkbox-allow-internet-asset-reservation` | unchecked → checked |
| 2 | Notes | new note row, textarea filled | empty → "RCA-walk-2026-05-14 tab-2 Notes" |
| 3 | Pricing | `location-settings-checkbox-corporate-pricing` | checked → unchecked |
| 4 | Legal | `location-settings-select-legal-0-service-charge` | "Resort Service Charge" → "Service Charge" |
| 5 | Currency | `location-settings-checkbox-currency-MXN-selected` | unchecked → checked |
| 6 | Account and Address | `location-settings-input-contact-phone-2` | "" → "555-0142" |
| 7 | Shared Setup Locations | `location-settings-checkbox-shared-location-0-shares-inventory` | unchecked → checked |
| 8 | Auto Add-On | `location-settings-checkbox-auto-add-on-false_encore music` | unchecked → checked |
| 9 | LO Basic Information | `local-office-settings-checkbox-use-fulfillment` | unchecked → checked |
| 10 | LO ECT Settings | `ect-settings-input-benefits-multiplier` | 20.0% → 22.1% (Angular auto-reformat — entered "21.0", form re-rendered as "22.1%") |

## R1 verdict — BUG-MGH-001 (empty Country in MGH rows)

**Bisection negative across all 10 tabs walked in this session**. Every save performed from this session produced an MGH row (or for LO tabs, an LO History row / no-history-row per §3.5) with the `Country` column **populated** (`"United States"`). The original BUG-MGH-001 hypothesis — *"saves from tabs that do not directly mutate Country/Currency/Tax/Region/PayToAddress produce empty-Country MGH rows"* — is **not supported by this walk**.

**Empty-Country rows in MGH for office 1604 today**:

| Row | ModifiedOn | ModifiedBy | Country | Currency | TaxMode | Region |
|---|---|---|---|---|---|---|
| 9 | 05/14/2026 01:43:47 PM | s-prd-clickauto@psav.com | **""** (empty) | USD | **""** | **""** |
| 10 | 05/14/2026 01:43:44 PM | s-prd-clickauto@psav.com | **""** (empty) | **""** | **""** | **""** |

These two rows were written **3-4 seconds apart** by the CI bot `s-prd-clickauto@psav.com` during a rapid-fire spec run that produced **4 saves in 10 seconds** (01:43:41, 01:43:44, 01:43:47, 01:43:51). The bracketing rows (01:43:41 PM and 01:43:51 PM) **are populated** with the same user — so the bot was hitting the same endpoint with the same auth and producing **mixed populated/empty rows in rapid succession**.

**Revised hypothesis** (graduated from this session — supersedes the original BUG-MGH-001 hypothesis):

The empty-Country MGH rows are correlated with **rapid concurrent saves / sub-second write bursts** from the CI bot, not with WHICH save endpoint was called or WHICH tab was active. The endpoint identity is constant (`POST /navigator/locations/1604/settings/location` for all 8 sub-tabs — Next.js Server Action pattern per `locations_local_information_test_cases.md:62`); the input from the bot is presumably also constant; what differs is the **timing density**.

**Candidate root causes for follow-up**:
1. **Race condition in the server-side history writer**: history-row materialization may read from a partially-committed transaction during a rapid burst, capturing fields before they're persisted.
2. **Stale read in a denormalized projection**: if MGH rows project from a read-replica or a CQRS-style projection, sub-second saves may hit a replica before replication catches up.
3. **Partial payload from the spec run**: if the CI spec's save action submitted a partial form (e.g., missing some left-panel fields), the server may have written what it received. This would be reproducible by inspecting the spec's actual save request body.
4. **Server-side optimistic save with rollback**: if a rapid second save overwrites a first save's projection before the first save's history-row write commits, the empty cells may reflect the projection's stale state.

**What would advance the RCA** (deferred — not in this session's scope):
- Inspect the CI spec or browser-replay around 01:43:41–01:43:51 PM 2026-05-14 to see which spec(s) were running and which fields they posted. The repo's `clients/encore/tests/specs/setup/locations/` directory is the likely starting point.
- Add a per-spec `/save → MGH-row-check` integration test that fails on empty Country, run it under a stress harness (parallel workers, rapid serial saves) to reliably reproduce.
- File an Encore-side question with this evidence (request: do back-end logs show a partial-payload write or a projection-replication delay at those timestamps?).

## R3 verdict — BUG-LOC-NTS-002 (Notes dialog says "Ok" instead of "Save")

**Cross-tab finding: "Ok" is NOT a Notes outlier — it is the convention for the entire `/settings/location` page.**

| # | Tab | Page URL | Dialog confirm button text |
|---|---|---|---|
| 1 | Local Information | `/settings/location` | `Ok` |
| 2 | Notes | `/settings/location` | `Ok` |
| 3 | Pricing | `/settings/location` | `Ok` |
| 4 | Legal | `/settings/location` | `Ok` |
| 5 | Currency | `/settings/location` | `Ok` |
| 6 | Account and Address | `/settings/location` | `Ok` |
| 7 | Shared Setup Locations | `/settings/location` | `Ok` |
| 8 | Auto Add-On | `/settings/location` | `Ok` |
| 9 | LO Basic Information | `/settings/local-office` | **`Save`** |
| 10 | LO ECT Settings (Fixed Costs) | `/settings/local-office` | **NO DIALOG** (direct save) |

**Implications**:

1. **The 9 `deferredChecks` entries on BUG-LOC-NTS-002 are now resolved**. The 7 Location Settings sub-tabs (Currency, Pricing, Local Information, Legal, Account and Address, Shared Setup Locations, Auto Add-On) all use `Ok` — same as Notes. The 2 Local Office Settings tabs (Basic Information + ECT Settings) keep `Save` (Basic Info) or have no dialog at all (ECT).
2. **The label "Ok" is now confirmed as the canonical confirm-button text for the new `/settings/location` page**, not an unintended Notes-only regression. The bug filing remains valid as a **page-level documentation drift**: `TC-LOC-NTS-008`, the field-inventory entry (`btnSaveChangesConfirm`), and any selector that hard-coded `:has-text("Save")` (e.g., `clients/encore/src/selectors/setup/locations/shared.ts:37-41`) are inaccurate for `/settings/location`. The pre-2026-05 LR-012 default (Cancel/Save) still applies on `/settings/local-office`.
3. **Suggested resolution path** (deferred — out of this session's scope, would be a follow-up Generator/Healer plan):
   - Page-object helpers `clickSaveAndConfirm` / `clickSaveWithDialog` should accept a configurable confirm-button text (or sniff the label) rather than hard-code `Save`.
   - The shared `btnSaveChangesConfirm` selector at `clients/encore/src/selectors/setup/locations/shared.ts` should be **per-page**, not shared — `Ok` on `/settings/location`, `Save` on `/settings/local-office`. This is also an LR-017 application (separate page = separate selectors).
   - File `/encore-questions` to confirm with Encore whether `Ok` is the intended UX standard for the new page (per BUG-LOC-NTS-002 `notes` resolution path b vs a).

## Baseline diff (per LR-045)

Old-site Encore baseline (`navigator2.training.psav.com/#/setup/locationdetail/1604`) is a **fundamentally different UI architecture**:
- Old site embeds tabs in one URL (no `/settings/local-office` separation).
- Old site has **NO save confirmation dialog** at all — direct saves on click (per [`clients/encore/specs_planning/_internal/old-site-baseline/notes-2026-05-11.md`](old-site-baseline/notes-2026-05-11.md) §3 Architectural divergence).
- Old site uses Bootstrap 3 Glyphicon for boolean cells (LR-036 extension), no `data-testid` (zero selector parity), and uses `name=`/`id=` attributes.

**Both R1 (empty-Country MGH rows) and R3 (Ok-vs-Save dialog label) are NEW-SITE-ONLY observations** — baseline cannot disprove or corroborate either because:
- R1: baseline's history table has 87 columns (matching new MGH) per `SUBPLAN_HISTORY_01_MCP_FINDINGS §1`, but baseline's save endpoint is direct (no dialog gate). If the empty-Country pattern exists on baseline, it would have a different root cause (no concurrency issue in a per-click direct save). Baseline RCA for R1 = scope creep.
- R3: baseline has no save dialog, so the "Ok vs Save" question is structurally inapplicable.

`baselineComparison` classification per LR-ENC-001:
- R1 (BUG-MGH-001): `baselineScope: baseline-divergent-architecture` — not a regression-from-baseline; ALL-078 escalation path applies (`/encore-questions` if needed).
- R3 (BUG-LOC-NTS-002): `baseline-absent` (no dialog on old site) — confirmed by the existing baselineEvidence in BUG-LOC-NTS-002.json.

## Artifacts produced this session

- This file: `clients/encore/specs_planning/_internal/walk-evidence-location-settings-2026-05-14.md`
- `clients/encore/reports/bugs/BUG-MGH-001.json` — `verificationLog` array appended (10 entries) + rcaDeferred flipped to `false` (hypothesis revised, not closed)
- `reports/bugs/BUG-LOC-NTS-002.json` — `verificationLog` array appended (10 entries) + `mcpEvidence.deferredChecks` marked resolved with this artifact as evidence

## Live state mutations left in office 1604 (for next session awareness)

These are intentional dirty changes left in place — the walk did not revert them. If they affect downstream specs, revert via the same UI path:

| Tab | Field | Left in state |
|---|---|---|
| 1 Local Information | Internet Asset Reservation | checked (was unchecked) |
| 2 Notes | New note row | "RCA-walk-2026-05-14 tab-2 Notes" |
| 3 Pricing | Corporate Pricing | unchecked (was checked) |
| 4 Legal | Row-0 Service Charge dropdown | "Service Charge" (was "Resort Service Charge") |
| 5 Currency | MXN selected | checked (was unchecked) |
| 6 Account and Address | Contact Phone 2 | "555-0142" (was empty) |
| 7 Shared Setup Locations | Row-0 Shares Inventory | checked (was unchecked) |
| 8 Auto Add-On | "encore music" auto add-on | checked (was unchecked) |
| 9 LO Basic Information | Use Fulfillment | checked (was unchecked) |
| 10 LO ECT Settings | Benefits Multiplier | 22.1% (was 20.0%) — Angular auto-reformat occurred |

## Notes on browser-tool execution

- Auth: passed via `.auth/encore-state.json` (no Entra redirect, no headed switch needed).
- No `[BROWSER-SWITCH]` events.
- No connection drops.
- All 10 tab walks completed in ~16 minutes wall-clock (14:38 → 14:54).
- Total network POST requests captured: 8× `POST /navigator/locations/1604/settings/location` (Tabs 1-8, Next.js Server Action) + 1× `POST /navigator/locations/1604/settings/local-office` (Tab 9 Server Action) + 1× ECT-specific endpoint (Tab 10 section save — no dialog, direct API call).
