---
module: item-search
date: 2026-08-31
identity: HUNTER
baselineScope: baseline-absent (environment-blocked — nav2 host unreachable from every Playwright-launched browser engine this session; server itself alive per curl; see §Access record)
scope: PRS (Product Search) · PCD (Product Code) · PGR (Product Groups) — NM-2253, office 1101
out_of_scope: Asset Information internals (NM-1506) · Smart Search ranking (NM-2031)
old_site: https://navigator2.training.psav.com/#/ (legacy "item search" — exact route undiscovered this session, host-level access blocked before route discovery)
new_site: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products
offices_observed: [1101 (new site only)]
jira_tickets: [NM-2253, NM-1385, NM-1386, NM-1387, NM-1388, NM-1433, NM-1493, NM-1494, NM-1495, NM-1506, NM-1616, NM-1702, NM-1750, NM-1790, NM-1802, NM-1826, NM-1833, NM-1908, NM-2449]
evidence: .playwright-cli/isr-2026-08-31/ (at-rest-p1.yml, post-search.yml, row-selected.yml, qty-filtered.yml, full-again.yml, owned-cell-probe.yml, owned-dblclick2.yml — new-site captures; nav2 attempts produced only browser error pages, transcribed below)
Observation_Only: true
Walk_Authorization: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK Phase 0.3 (owner-approved 2026-08-31) — observation-only nav2 walk for office 1101, zero mutations; blocked at host TLS layer before any page rendered
---

# Old-site baseline — Item Search (PRS / PCD / PGR), 2026-08-31

## Access record — nav2 UNREACHABLE from automated browsers this session (evidence-backed)

| # | Time (UTC) | Engine | Result (verbatim page text) |
|---|---|---|---|
| 1 | 2026-08-31T14:18 | Playwright Chromium (headless, fresh context) | "This site can't provide a secure connection — navigator2.training.psav.com sent an invalid response." |
| 2 | 2026-08-31T14:20 | Playwright Chromium (same session, retry after ~2 min) | identical SSL error |
| 3 | 2026-08-31T14:22 | msedge channel (system Edge, fresh session) | "Hmmm… can't reach this page — The connection was reset." |
| 4 | 2026-08-31T14:23:52 | Playwright Chromium (fresh session, varied-wait retry) | "This site can't be reached — The connection was reset." |
| 5 | (firefox engine) | not installed in this environment — launch failed before navigation | n/a |
| 6 | 2026-08-31T15:14 | Playwright Chromium (fresh CLI session `nav2retry`, pre-GIVER varied-wait retry ~50 min after #4) | "This site can't provide a secure connection — navigator2.training.psav.com sent an invalid response." (identical SSL class; retry obligation from Disposition paragraph SATISFIED — blocker persists) |

**Server-alive cross-evidence (same machine, same minutes)**: `curl` (Windows schannel TLS stack)
returns `HTTP/1.1 200 OK` (`X-AspNetMvc-Version: 5.2`); protocol matrix: TLS 1.2-only server
(`--tlsv1.2 --tls-max 1.2` → 200; `--tls-max 1.0` → handshake fail; `--tlsv1.3` → handshake fail).
Diagnosis class: the host negotiates with the OS schannel stack but rejects/resets the
BoringSSL-fingerprint ClientHello of current Playwright Chromium/Edge builds (legacy cipher-suite
or TLS-fingerprint middlebox). NOT an auth issue (failures occur pre-login, with and without
loaded state), NOT office-specific (host-level). Prior sessions reached nav2 as recently as
2026-08-26 (discount-matrix baseline) — access drift occurred after that date.

**Disposition**: environment-blocked baseline READ, recorded per the plan's Phase 0.3 fallback and
LR-060 obligation 2 (only the env-blocked step defers). The pre-GIVER varied-wait retry fired at
15:14 UTC (row 6): identical SSL failure — blocker CONFIRMED persistent for this execution.
Baseline remains `baseline-absent (environment-blocked)`; divergence classes for this module stay
Jira-lead-based (see counterpart-status table). If nav2 access returns in a later session, refresh
this artifact in place with the real walk before any DEEP pass consumes it.

## Counterpart status (Jira-lead layer only — no DOM observation possible)

| Zone | Old site (nav2) — per Jira leads, UNOBSERVED | New site (e2e 1101, observed 2026-08-31) |
|---|---|---|
| Item search page | EXISTS per NM-1385/1493/1494/1495 ("behaves the same as Navigator" family) + BIG_PIVOT 2026-06-22 recon note ("nav2 equivalent: item search") | `locations/1101/products` — Products heading, search panel (radio search-type, Any Field, barcode, Qty>0, Active, Location, Region, Product Organization, Prep/Return date-times), Reset+Search, 13-column results grid, pagination 50/page |
| Country criteria + Price column | present on legacy per NM-1385 | REMOVED (intentional per NM-1385) — grid shows no Price; criteria show no Country |
| Product Code dialogs | legacy equivalents unknown (view/add/edit shipped as new-site work NM-1386/87/1433) | View/Add via selection-gated toolbar; carets for edit variants |
| Product Groups | legacy product-group segment per NM-1603/1801 | own URL `/products/product-groups` with search + Add + Name/Description/Service Type/Status grid |
| Availability | legacy availability existed (NM-2042 fixed a legacy 500) | per-row Available/Owned/OOS/In-Sequence + Check Availability calendar (NM-1846) |

## Baseline diff

1. **Every old-vs-new behavioral divergence classification this execution is (c) baseline-absent
   (environment)** — the old site produced zero observable DOM this session. No (a) regression and
   no (b) intentional-UX classification is made from an unobserved baseline (never fabricate).
   Jira-documented intentional deltas (Country criteria removed, Price column removed — NM-1385)
   are recorded as **(b)-by-ticket LEADS**, not observed classifications.
2. **D1 (Qty>0/Active defaults)** and **D2 (Location/Region defaults)** are therefore resolved
   against Jira + fresh new-site state only (see walk evidence): D2 matches NM-1493 exactly;
   D1 contradicts NM-1495 and is classified **stale-ticket (suspected NM-1903 redefinition)**
   pending the read-×2 confirmation in the walk artifact — not filed as a bug (a defect claim
   would need the baseline or a governing current-intent ticket; neither is available).
3. **No selector parity** is recorded (old UI would use name=/id= anyway per OSB-ACCESS-VERIFY
   precedent); LR-029 constraints for the new site live in the field inventories.

## FCC-lens divergences (new-site observation layer)

- Search-type radio ("Keyword Search"/Any Field chip) + Smart-Search option class → Dropdown/option-set rows (§2) once enumerated; smart option = deterministic smoke only (NM-2031 In Progress).
- Barcode input: constrained plain-text (§2 Plain text + Code-39 charset negatives per NM-1494).
- Qty>0 / Active: §2 Checkbox rows; filter EFFECT rides Axis-2 result-fidelity.
- Location/Region: §2 Dropdown rows + NM-1493 mutual-exclusion cross-field pair.
- Prep/Return: §2 Date/offset rows (Return≥Prep negative per LR-008 family).
- Owned cell: §2 Click-to-edit grid cell — **mechanics unresolved at probe time** (button renders `locations.product.ownedCount` on non-barcoded rows; single+double click select the row, no inline editor materialized; all 88 owned@1101 rows are barcoded → LR-040-D ladder continues in walk Stage 2).
- Launchers: View Availability / View Product Code / Add Product Code (selection-gated, role-clear), Product Organization popover, date popovers, Grid Options, Product Group navigation → §2 Lookup-launcher rows.

## Surface-family classification (Axis 2 lens, new site)

- PRS grid: result-fidelity ✔ · **pagination ✔ (live: rows-per-page 50, page textbox "1"/318, first/prev/next/last)** · sorting ✔ (header sort buttons) · combination ✔ · render-state ✔ · empty-vol ✔ ("0 products found" at rest) · persistence ✔ (NM-1616 URL params).
- PCD dialogs: render-state ✔; others expected out-of-scope (no grid inside dialog) — walk confirms.
- PGR grid: result-fidelity ✔ · empty-vol ✔ (0 groups at rest) · render-state ✔ · pagination/sorting/persistence — walk decides.

## Observations

### Bugs / Defects
none (no old-site DOM was observable; new-site observations live in the walk-evidence artifact).

### Suggestions / Improvements
- Restore automated-browser access to nav2 (TLS 1.2 legacy-cipher/fingerprint issue) or bless an alternate baseline host — every future module baseline is blocked the same way until then (raised as a discussion item, not a bug; LR-ENC-009 does not apply — this is environment, not app markup).
