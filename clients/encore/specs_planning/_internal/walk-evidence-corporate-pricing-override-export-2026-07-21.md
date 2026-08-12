# Walk Evidence — Corporate Pricing Product Group Override: EXPORT surface
# NM-2272 | 2026-07-21 | Office 1604 (session office; grid location-gated, unselected)

**Browser tool**: Playwright CLI (`playwright-cli` 0.1.15, headless, `state-load`)
**Reason**: functional export probe, network + download capture, unattended
**MCP_Session_Date**: 2026-07-21
**baselineScope**: baseline-absent (net-new on e2e; no nav2 equivalent — LR-ENC-001)
**Scope**: EXPORT only. Import is NM-2273 and was NOT touched.
**Status**: PARTIAL — see §6 Un-walked remainder. This file is NOT a closure claim.

---

## 0 — Environment / access notes (reusable)

- **Auth state was STALE.** `clients/encore/.auth/encore-state.json` (14:04) redirected
  `/navigator/` → `/navigator/auth/sign-in`. Symptom is deceptive: the override URL still returned
  Title "Product Group Override | Navigator" and rendered the nav shell with the correct username,
  but `<main>` was EMPTY and breadcrumb URLs carried a **double slash** (`/navigator/locations//home`)
  — the empty location slug is the tell. Console showed `Error: NEXT_REDIRECT` from
  `app/locations/layout-*.js`.
- **Fix (unattended, no human login):** `cd clients/encore && npx playwright test --project=setup`
  → SSO login succeeded attempt 1/3, state saved + validated (session+csrf cookies present).
  Then `playwright-cli state-load clients/encore/.auth/encore-state.json`.
- **Cold-start gotcha reproduced**: the first CPR page load in a cold CLI session yields a
  near-empty snapshot (0 lines). Re-navigate; do not trust the first snapshot (LRN-002).
- **`playwright-cli snapshot` writes its YAML to stdout**; redirect to a file to keep
  grep-over-disk discipline. Refs go stale after an Export click re-render — re-snapshot before
  the next `click <ref>`.
- **Root Playwright browsers are BROKEN/ABSENT** — root pins `playwright@1.58.2` (browser revision
  1208); `chromium-1208` exists but is an empty/partial extract and `chromium_headless_shell-1208`
  is absent, so **`scripts/walk-coverage/enumerate-page.mjs` cannot run** (both headless and
  `--headed`). `clients/encore` runs `playwright@1.60` with revision 1228 installed, which is why
  spec runs and `auth.setup` work while the root enumerator does not. `npx playwright install
  chromium` was started and is still extracting at time of writing.

---

## 1 — Surface baseline (office 1604, no location selected)

`main` innerText verbatim:

```
Corporate Pricing / Product Group Override / Change Local Office / Select a location /
Active only / Currency : ALL / 0 items found / Save Export Import Grid Options /
Equipment Labor / Location · Product Group · Product Group Name · Currency · Current Price ·
Override Price · Max Discount % · Active · Mod Date · Updated By / No results. / 20 rows per page
```

- **10 grid columns** (matches the prior registry note incl. `Updated By`).
- Controls + refs: `Export` f4e202 · `Import` f4e203 · `Grid Options` f4e205 ·
  tab `Equipment` [selected] f4e209 · tab `Labor` f4e211 · checkbox `Active only` f4e184 ·
  textbox `Filter Product Groups Override...` f4e215 · currency trigger `ALL`.
- **`Save` is `[disabled]`** in the empty state — correct.
- **`Export` is ENABLED in the empty state.** See §3 BUG-CANDIDATE-1.

---

## 2 — Export probe results (machine evidence)

| Probe | Action | Evidence artifact | Result |
|---|---|---|---|
| E1 | Export, Equipment tab, grid empty | `.playwright-cli/ProductGroupOverrides-20260721-143926UTC.csv` | 570,960 bytes · **8,996 data rows** · SHA256 `b25041e7993f3ec6…` |
| E2 | Export, **Labor** tab (`aria-selected` flipped to Labor, verified by eval) | `.playwright-cli/ProductGroupOverrides-20260721-144145UTC.csv` | 570,960 bytes · SHA256 `b25041e7993f3ec6…` — **byte-identical to E1** (`cmp` clean) |
| **E3** | Export with **office 1105 SELECTED** and **9 rows visible** on the Equipment tab | `.playwright-cli/ProductGroupOverrides-20260721-145550UTC.csv` | **8,996 rows · 1,782 offices** · SHA256 `b25041e7993f3ec6…` — **byte-identical to E1 and E2** |

| **E4** | Export with **Active-only ON** (grid 9 → **7 rows**) | `.playwright-cli/ProductGroupOverrides-20260721-145702UTC.csv` | 8,996 rows · **53 `Is Active=0` rows still present** · byte-identical |
| **E5** | Export with **Currency=CAD** (grid → **"0 items found"**) | `.playwright-cli/ProductGroupOverrides-20260721-<latest>UTC.csv` | 8,996 rows · USD 8,918 + CAD 41 + MXN 37 · byte-identical |
| **E6** | Export with **text filter `Analog` active** (grid 9 → **1 row**), office 1105 | `.playwright-cli/ProductGroupOverrides-20260721-161441UTC.csv` | 8,996 rows · **30 rows still match `analog`** · SHA256 `b25041e7993f3ec6…` — byte-identical |
| **E7** | Export at **rows-per-page = 10**, office 1974 (161 items, 10 rendered) | `.playwright-cli/ProductGroupOverrides-20260721-162205UTC.csv` | 8,996 rows · SHA256 `b25041e7993f3ec6…` — byte-identical |
| **E8** | Export at **rows-per-page = 50**, office 1974 (161 items, 50 rendered) | `.playwright-cli/ProductGroupOverrides-20260721-162333UTC.csv` | 8,996 rows · SHA256 `b25041e7993f3ec6…` — byte-identical |
| **E9** | Export endpoint driven at **6 locales** + 6 malformed locales (direct `fetch`, same session/cookies) | live `eval` network probe, §2b | 8,996 rows every time · **data rows byte-identical across locales**; only the header row localizes |

### VERDICT — Export ignores EVERY grid scope control

**Eight** exports across eight distinct UI states, all producing the **same SHA256 `b25041e7993f3ec6…`**:

| # | Location | Tab | Active-only | Currency | Text filter | Page size | Grid showed | Exported |
|---|---|---|---|---|---|---|---|---|
| E1 | none | Equipment | off | ALL | — | 20 | 0 ("No results.") | 8,996 / 1,782 offices |
| E2 | none | **Labor** | off | ALL | — | 20 | 0 | 8,996 / 1,782 |
| E3 | **1105** | Equipment | off | ALL | — | 20 | **9** | 8,996 / 1,782 |
| E4 | 1105 | Equipment | **ON** | ALL | — | 20 | **7** | 8,996 (53 inactive present) |
| E5 | 1105 | Equipment | ON | **CAD** | — | 20 | **0** | 8,996 (all 3 currencies) |
| **E6** | 1105 | Equipment | off | ALL | **`Analog`** | 20 | **1** | 8,996 (30 `analog` rows) |
| **E7** | **1974** | Equipment | off | ALL | — | **10** | 161 found / **10 rendered** | 8,996 |
| **E8** | 1974 | Equipment | off | ALL | — | **50** | 161 found / **50 rendered** | 8,996 |
| **E10** | 1974 | Equipment | off | ALL | — | 50 | **sorted DESC** by Product Group Name | 8,996 · **first data row unchanged** |

**Export is a fixed, unconditional tenant-wide dump.** All **seven** grid controls — location picker,
Equipment/Labor tab, Active-only, Currency, text filter, rows-per-page, and column sort — are
ignored. Every one of them demonstrably re-scoped or re-ordered the grid in the same session, so this
is app behavior, not dead primitives.

**Sort probe detail (E10).** Sorting on this grid is a **header-dropdown** action, not a header-click
toggle (`TC-CPR-OVR-035` proves the click is inert; `TC-CPR-OVR-046/047` drive the dropdown). Opening
the `Product Group Name` header menu → *Sort descending* moved the first grid row from
`1974 271 Lift 0'-40' Boom - Daily` to `1974 1156 Wireless Presenter` — a clean positive control. The
export taken in that state is byte-identical and its first data row is still
`1105,272,Lift 0'-40' Boom - Weekly,…`: **the file keeps its own server-side ordering.**

### POSITIVE CONTROL — satisfied (LR-061 C)

The earlier weak-control caveat is now **CLEARED**. With office 1105 selected the grid visibly and
verifiably changes per tab:

| State | Grid rows | Footer | File rows for 1105 |
|---|---|---|---|
| No location selected | 0 | "0 items found" / "No results." | — |
| 1105 · **Equipment** tab | **9** | "9 items found" | `Is Labor=0` = **9** ✓ |
| 1105 · **Labor** tab | **2** | "2 items found" | `Is Labor=1` = **2** ✓ |

The primitives demonstrably fire (0 → 9 → 2), the grid demonstrably re-scopes, and the export
demonstrably does not change. So "Export ignores location and tab" is a property of the **app**, not
a dead click. Q5 is corroborated twice over — from the file split AND from the live grid.

**Positive controls added this pass** (each observed live before the matching inert export verdict):

| Control | Positive control observed | Verdict on export |
|---|---|---|
| Text filter (E6) | office 1105, filter `Analog` → footer **"9 items found" → "1 items found"**, 1 row rendered | ignored |
| Rows-per-page (E7/E8) | office 1974, footer **"161 items found"** constant while rendered rows went **10 → 50** | ignored |

---

## 2b — Locale axis (Q6, closed)

Driven live against `…/corporate-price-pg-override/export?locale=<L>` from the authenticated page
context. **8,996 data rows and byte-identical data rows in every case** — only the header row changes.

| `locale` | HTTP | Header row (first 3 columns) | Notes |
|---|---|---|---|
| `en-US` | 200 | `Location Id,Product Group Id,Product Group Name` | baseline |
| **`fr-FR`** | 200 | `Id d'emplacement,Id du groupe de produits,Nom du groupe de produits` | **translated — but see BUG-CANDIDATE-4** |
| `fr` | 200 | identical to `fr-FR` | language-only code resolves |
| **`es-MX`** | 200 | `Id de Ubicación,Id Grupo de Producto,Nombre Grupo de Producto` | translated; `Precio de Anulación` for Override Price is correct |
| `es` | 200 | identical to `es-MX` | language-only code resolves |
| `de-DE` | 200 | **English** | no German catalog → silent English fallback |
| `en-GB` | 200 | English | fallback |
| *(param omitted)* | 200 | English | default |
| `zz-ZZ`, `xx`, `%20`, `en-US%00` | 200 | English | **malformed locale never 500s — graceful English fallback** |

**Two facts worth locking into regression tests:**

1. **Data rows are locale-invariant.** `1001.00` stays `1001.00` under `fr-FR` — the server does NOT
   apply French decimal-comma formatting. In a comma-delimited file that would have corrupted every
   money column, so this is the correct behavior and a valuable regression guard.
2. **Malformed locale input is safe** — six junk values, zero 5xx.

NM-2044 / NM-2045 (header localization drift) are **not reproduced in en-US**, but the fr-FR header
carries a distinct mistranslation defect recorded below.

---

## 2c — ⚠ HIGH: office 1604 override grid returns HTTP 500 (found via the pagination probe)

Selecting **office 1604** — the framework's own designated primary test office
(`clients/encore/CLAUDE.md`) — in the location picker leaves the grid reading **"0 items found"** with
**no error surfaced to the user**. The network layer tells a different story:

```
GET /navigator/api/location/corporate-price-pg-override?localOfficeId=1604   →  500
{"success":false,
 "validationErrors":{"exception":["An item with the same key has already been added. Key: 4543"]},
 "message":"An item with the same key has already been added. Key: 4543"}
```

**Reproduction: 3/3** — twice via the UI location picker, once via a direct `fetch` in the page
context. Console carries three matching `Failed to load resource … 500` entries.

**Blast radius characterised** (one `fetch` sweep, same session):

| Office | HTTP | Note |
|---|---|---|
| **1604** | **500** | duplicate-key crash |
| 1105 | 200 | |
| 1974 | 200 | 161 Equipment rows render fine |
| 9187 | 200 | |
| 9019 | 200 | |
| 9185 | 200 | |
| 1101 | 200 | returns empty payload (no overrides) |
| 1115 | 200 | |

So the fault is **office-1604-specific and deterministic**, not a transient or a global outage.

**Cross-check against the export (the export path does NOT crash):**

| Check | Result |
|---|---|
| Rows for `Location Id=1604` in the export | **732** (471 `Is Labor=0` + 261 `Is Labor=1`) |
| Product Group Id `4543` anywhere in the export | **0 occurrences** |
| Duplicate `(Location Id, Product Group Id)` pairs, whole file | **0** |
| Duplicate `(Location Id, Product Group Id, Currency)` triples | **0** |

The data the export returns for 1604 is clean and duplicate-free, so the duplicate key `4543` is
built inside the **grid** endpoint's own projection (a dictionary the export path does not construct).
Two distinct defects fall out of this:

1. **The 500 itself** — a server-side duplicate-key crash that makes office 1604's override grid
   completely unusable while its 732 overrides exist and export fine.
2. **The silent-failure UX** — a 500 renders as **"0 items found"**, which is visually identical to a
   legitimately-empty office. A user cannot tell "no overrides" from "the server crashed", and an
   automated test asserting an empty grid would go **green on a server error**. The Currency
   combobox also silently goes `[disabled]` in this state (it is enabled on every healthy office),
   which is the only visible tell.

---

## 2e — Affordance probes on the remaining surface controls (LR-057)

Driven live on office 1974 so that the pagination controls had a real multi-page bed (161 rows).

| Control | Probe | Observed | Token |
|---|---|---|---|
| `More information` (info icon) | hover | tooltip appears: **"This is the future product group override page"** | `affordance: popover → tooltip` |
| `Go to next page` | click on page 1 | page **1 → 2**; first/previous became enabled; first row changed to `1974 916 ProRes Video Recorder` | `affordance: none` (pure pagination action) |
| `Go to last page` | click | page **→ 4 of 4**, **11 rows** rendered (161 = 3×50 + 11 ✓); next/last became disabled | ✓ |
| `Go to previous page` | click on page 2 | page **2 → 1** | ✓ |
| `Go to first page` | click on page 4 | page **4 → 1**; first/previous became disabled | ✓ |
| `Current page number` (textbox) | fill `2` + Enter | page **→ 2**, 50 rows rendered | ✓ |
| **`Collapse search panel`** | click ×2 | label flips ⇄ but **zero layout change** — see BUG-CANDIDATE-6 | `affordance: none — DEAD CONTROL` |
| **`Resize column <n>`** ×10 | real-mouse drag +100 px on `Location` | inline style `width: 190px → 290px`, rendered width **116 px unchanged** — see BUG-CANDIDATE-7 | `affordance: none — DEAD CONTROL` |

The pagination boundary states are worth noting as free assertions: first/previous are disabled on
page 1 and next/last are disabled on the last page, both observed rather than assumed.

---

## 2f — ⚠ HIGH: `Override Discount` carries TWO incompatible scales in one column

Found while checking the acceptance gate "leading zeros preserved" on the export. The exported
`Override Discount` column and the grid's `Max Discount %` column are the same field, and the grid
multiplies the stored value by 100 to render it. Most rows store a **fraction**; a handful store a
**raw percentage**. Nothing distinguishes them.

**Verified against three independent sources — the export file, the grid's own JSON API, and the
rendered grid — which all agree:**

| Office / PG | Export file | API `maxAllowedDiscount` | Grid renders | Scale |
|---|---|---|---|---|
| 1105 / 274 | `0.06` | `0.06` | **6.00 %** | fraction ✓ |
| 1105 / 275 | `0.5` | `0.5` | **50.00 %** | fraction ✓ |
| 1105 / 300 | `0.05` | `0.05` | **5.00 %** | fraction ✓ |
| 1105 / 366 | `0.0673` | `0.0673` | **6.73 %** | fraction ✓ |
| 1174 / 2611 | `0.1` | `0.1` | **10.00 %** | fraction ✓ |
| **1174 / 4298** | **`13`** | **`13`** | **`1300.00 %`** | **raw percent ✗** |
| **1174 / 2609** | **`14`** | **`14`** | **`1400.00 %`** | **raw percent ✗** |
| **1312 / 907** | **`20`** | — | (would render `2000.00 %`) | **raw percent ✗** |
| **1604 / 907** | **`20`** | — | (grid 500s — BC-3) | **raw percent ✗** |

**Tenant-wide split**: 260 rows at ≤ 1 (fraction) vs **4 rows** at 13 / 14 / 20 (percent).

**Why this is a defect, not a curiosity.** The app enforces a **0–100 cap** on this field at input —
`TC-CPR-OVR-023` and `TC-CPR-OVR-037` both prove it (`aria-invalid` + "Please enter a valid
percentage…" above 100). Yet the grid happily *renders* **1300.00 %** and **1400.00 %**, values its
own validation would refuse. Three consequences:

1. A user sees a discount that cannot be re-entered — editing anything else on that row and saving
   may be blocked or may silently rewrite the value.
2. If the pricing engine honors the stored number, a 1300 % discount makes the item free or negative.
3. It is a landmine for the **NM-2273** import work: a consumer reading `0.5` cannot tell 0.5 % from
   50 %, so any round-trip has to guess the scale. Recorded here so that plan inherits the hazard
   rather than rediscovering it.

Guarded by `TC-CPR-OVR-087`, which pins the current split (fraction-scale is the norm; the four
percent-scale rows are the known exceptions) so that both a fix and a spread are caught.

---

## 2d — File-I/O DEEP checks (computed on E8)

| Check | Result | Verdict |
|---|---|---|
| Filename pattern | `ProductGroupOverrides_20260721_162333UTC.csv` | matches `override.export.filenamePattern` ✓ |
| Line endings | **LF only** — 8,997 line feeds, **zero** carriage returns (byte-counted) | see correction note below |
| Field count, every data row | **9 on all 8,996 rows** | ✓ |
| Quoting | **2,490 rows RFC-4180 double-quote-escaped** (inch marks, e.g. `"House Video Monitor LED 50""-59"""`) | ✓ correct escaping |
| Scientific notation in money columns | **0 occurrences** | ✓ |
| `Current Price` non-2-decimal values | **0** | ✓ |
| `Override Price` non-2-decimal values (excluding the 1 empty) | **0** | ✓ |
| Date coercion of numeric IDs | none observed | ✓ |
| Encoding | **UTF-8, non-ASCII present** (`≤` = `E2 89 A4`, 16 rows) | — |
| **Byte-order mark** | **ABSENT** | ⚠ **BUG-CANDIDATE-5** |

The file is UTF-8 but ships **without a BOM**. Excel on Windows — the client's expected consumer —
defaults to the system ANSI codepage when a CSV has no BOM, so `Simple Wi-Fi (≤25/User)` renders as
`Simple Wi-Fi (â‰¤25/User)`. Prefixing `EF BB BF` fixes it with no impact on any other consumer.

> **Correction (self-caught by the authored test).** An earlier revision of this table recorded
> "CRLF ✓". That was **wrong** — it came from a `grep -o "\\\\r"` over `od -c` output, which matches
> od's own `\r` glyph rather than a real carriage return, so it reported a CR that was never there.
> `TC-CPR-OVR-077` asserted `toContain('\r\n')` on the strength of that note and **failed on the
> first run**. A byte count settles it: **8,997 LF, 0 CR, no BOM.** The constant and the assertion
> are now LF, and the test additionally asserts *zero* carriage returns so the file cannot drift to
> CRLF unnoticed. Recorded rather than quietly edited: the authored test caught an error in the walk
> that produced it, which is the check working as intended.

**Header row (verbatim, en-US)** — exactly 9 columns, unchanged from 2026-07-17:

```
Location Id,Product Group Id,Product Group Name,Is Labor,Currency,Current Price,Override Price,Override Discount,Is Active
```

**File-content facts (computed from E1):**

| Fact | Value |
|---|---|
| Data rows | **8,996** (identical to evidence E, 2026-07-17 — stable across 4 days) |
| Distinct `Location Id` | **1,782 offices** (tenant-wide confirmed) |
| Currency distribution | USD 8,918 · CAD 41 · MXN 37 |
| `Is Labor` split (whole file) | `0` = 6,198 · `1` = 2,798 |
| Rows with EMPTY `Override Price` | **exactly 1** — `1115,286,01D Double Screen Set Kit,0,USD,0.00,,,0` |
| Office 1105 rows | **11** → `Is Labor=0` **9** + `Is Labor=1` **2** |
| Office 1105 active split | `Is Active=1` **7** · `Is Active=0` **4** |
| Office 1107 rows | 5 (all `Is Labor=0`) |

---

## 3 — Seed-question dispositions

| Q | Question | Verdict | Evidence |
|---|---|---|---|
| **Q1** | Export respects Equipment/Labor tab? | **NO — tab entirely ignored.** E1 vs E2 byte-identical (same SHA256). The Labor-tab export still carries 6,198 `Is Labor=0` rows. | §2 E1/E2 |
| **Q5** | 1105: 9 grid rows vs 11 file rows? | **RESOLVED — not a defect.** 11 = 9 `Is Labor=0` + 2 `Is Labor=1`. The 9 reconciles exactly with the Equipment tab's 9 rows (evidence E Step 1). The file folds BOTH tabs; the tab filters only the view. | §2 |
| **Q7** | Export on a zero-row surface? | **Export fires and returns the full tenant dump.** See BUG-CANDIDATE-1. | §2 E1 |
| **Q6** | `locale` changes the header? | **YES — header only; data rows are locale-invariant.** `fr-FR` / `es-MX` translate the header; `de-DE` / `en-GB` / malformed values fall back to English with no 5xx. Money stays `1001.00` under `fr-FR` (no decimal-comma corruption). | §2b (E9) |
| **Q2** | Currency filter respected? | **NO — ignored.** With Currency=CAD the grid read "0 items found"; the export still returned all 8,996 rows (USD 8,918 · CAD 41 · MXN 37), byte-identical. | E5 |
| **Q3** | Active-only respected? | **NO — ignored.** With Active-only ON the grid dropped 9 → 7; the export still carried **53 `Is Active=0` rows**, byte-identical. | E4 |
| **Q4** | Text filter respected? | **NO — ignored.** Filter `Analog` on office 1105 drove the grid **9 → 1** (footer "1 items found"); the export was still byte-identical and still carries 30 rows matching `analog`. | E6 |
| **A5** | Rows-per-page respected? | **NO — ignored.** Office 1974, rendered rows **10 → 50** with the footer constant at "161 items found"; both exports byte-identical to E1. | E7/E8 |

**Positive-control honesty (LR-061 C).** For Q1 the tab click was confirmed to fire — `aria-selected`
flipped `Equipment` → `Labor` via eval — but with no location selected both tabs showed 0 rows, so the
tab switch produced no visible grid delta. That WEAKER control is now **superseded**: the 1105 bed
shows 9 Equipment vs 2 Labor, and the §2 positive-control table records the visible delta. Every
inert-export verdict in this table is now backed by an observed grid delta on the same control.

---

## 4 — Bug leads verified (LR-044)

| Lead | Verdict | Evidence |
|---|---|---|
| **NM-1940** | **CONFIRMED — STILL LIVE.** The export emits exactly one row with an empty `Override Price`, byte-identical to the 2026-07-17 observation: `1115,286,01D Double Screen Set Kit,0,USD,0.00,,,0`. Unchanged in 4 days. | §2 |
| **NM-2044 / NM-2045** | **NOT REPRODUCED in en-US** — header exact + unlocalized. Non-en-US locales now driven (§2b): headers DO localize for `fr-FR`/`es-MX`, and the fr-FR header carries a separate mistranslation (BUG-CANDIDATE-4). | §2b |
| NM-2206 (blank Current Price) | **NOT REPRODUCED on the export.** `Current Price` is non-empty and 2-decimal on all 8,996 rows (0 violations). | §2d |

---

## Observations

### Bugs / Defects

| # | Surface | What's wrong | Severity signal | Status |
|---|---|---|---|---|
| **BUG-CANDIDATE-1** | Override grid → Export | The grid displays **"0 items found" / "No results."** (no location selected) yet **Export is enabled and silently downloads the entire tenant dataset — 8,996 rows across 1,782 offices, 570,960 bytes.** A user who sees an empty grid and clicks Export has no indication they are exporting every office in the tenant. There is no confirmation, no row-count warning, and no scoping. | User-surprise / possible data-exposure concern — the on-screen scope and the delivered scope are completely unrelated | NEW — needs REQ-014 classification (intentional "export all" vs defect). Do NOT auto-file per LR-034 dedup-first. |
| **BUG-CANDIDATE-2** | Override grid → Export vs Equipment/Labor tab | Switching to the Labor tab has **zero** effect on the export — the file is byte-identical and still contains 6,198 Equipment rows. The tab is a view filter the export ignores entirely. | Same class as BC-1 (displayed scope ≠ exported scope); lower severity as it is plausibly by design | NEW — classify per REQ-014 |
| **NM-1940** | Export file content | Export emits a row with an empty `Override Price`, which the app's OWN import then rejects (`Error Row#:19, … OverridePrice is required`). Export/import round-trip is broken by the app's own output. | Confirmed regression, 4 days unchanged | EXISTING — re-confirmed live |
| **BUG-CANDIDATE-3** ⚠ **HIGH** | Override grid — office **1604** | `GET …/corporate-price-pg-override?localOfficeId=1604` returns **HTTP 500** — `"An item with the same key has already been added. Key: 4543"`. The grid is **unusable** for this office, yet its 732 overrides exist and export cleanly. Deterministic 3/3; offices 1105/1974/9187/9019/9185/1101/1115 all return 200. **1604 is the framework's own designated primary test office.** | HIGH — total feature loss on one office; server-side duplicate-key defect | NEW — §2c |
| **BUG-CANDIDATE-3b** ⚠ | Override grid — error handling | The 500 above renders as **"0 items found"** with **no error message, no toast, no retry**. A crashed fetch is visually identical to a legitimately-empty office, so a test asserting "grid is empty" goes **green on a server error**. The only tell is the Currency combobox silently becoming `[disabled]`. | HIGH (masking) — turns a 5xx into a false-green | NEW — §2c |
| **BUG-CANDIDATE-4** | Export file — `fr-FR` header | `Override Price` is translated as **`Prix des commissions indirectes`** ("indirect commissions price") and `Override Discount` as **`Remise de remplacement`** ("replacement discount"). Neither means "override". The `es-MX` catalog gets it right (`Precio de Anulación`), so this is a French-catalog error, not a design choice. | MEDIUM — wrong column meaning for French users; corrupts any header-mapped import | NEW — §2b |
| **BUG-CANDIDATE-6** | Override grid — "Collapse search panel" | The button flips its own `aria-label` **"Collapse search panel" ⇄ "Expand search panel"**, but **nothing collapses**. Measured across 60 `<main>` descendants in both states: **byte-identical geometry**; the search panel stays 360×244 and the Currency control stays 328×36 / `visibility: visible` / `opacity: 1`. The click registers (the label flips), so the handler fires and does nothing. | MEDIUM — a visible, permanently dead control on the surface | NEW — §2e |
| **BUG-CANDIDATE-7** | Override grid — column resize (all 10 columns) | Every header exposes a `col-resize` handle and the drag **is tracked correctly** — dragging `Location` +100 px rewrites its inline style `width: 190px` → `width: 290px`. But the rendered width **stays 116 px**, because the table is `table-layout: auto` with `width: 100%`, so the browser redistributes and discards the authored width. **All 10 resize handles are functionally inert.** | MEDIUM — 10 dead affordances; fix is `table-layout: fixed` or a `<colgroup>` | NEW — §2e |
| **BUG-CANDIDATE-8** ⚠ **HIGH** | `Override Discount` / `Max Discount %` — export, API and grid | **One column, two scales.** 260 rows store a fraction (`0.06` → grid shows `6.00 %`); 4 rows store a raw percentage (`13`, `14`, `20`) and the grid renders them as **`1300.00 %`**, **`1400.00 %`**, `2000.00 %` — above the 0–100 cap the app enforces on input (`TC-CPR-OVR-023` / `037`). Confirmed against the export file, the grid JSON API, and the rendered grid independently. | HIGH — displays impossible discounts; a pricing engine honoring 1300% would zero out the item; makes any export/import round-trip scale-ambiguous (NM-2273 hazard) | NEW — §2f |
| **BUG-CANDIDATE-5** | Export file — encoding | The CSV is **UTF-8 with no BOM** while carrying non-ASCII data (`≤`, 16 rows). Excel on Windows falls back to the ANSI codepage, rendering `Simple Wi-Fi (≤25/User)` as `Simple Wi-Fi (â‰¤25/User)`. | MEDIUM — visible corruption for the primary consumer; one-line fix (`EF BB BF`) | NEW — §2d |

### Suggestions / Improvements

| # | Suggestion |
|---|---|
| S1 | Export on an empty/unscoped grid should either disable, or warn ("This will export all 1,782 locations"), or scope to the selection — the current silent full-tenant dump is the surprising branch of a three-way design choice. |
| S2 | The exported file has no scope metadata (no locale, no filter state, no "all locations" marker) — a header comment or a scope column would make a downloaded file self-describing. |
| S3 | `Save` correctly disables on the empty grid; `Export` does not follow the same state discipline. Aligning them would be internally consistent. |
| S4 | Prefix the CSV with a UTF-8 BOM (`EF BB BF`). Excel then reads it correctly and every other consumer is unaffected — the cheapest fix in this list (BC-5). |
| S5 | The grid should distinguish "no data" from "the request failed". A 5xx should surface an inline error + retry rather than the empty-state copy, which is what makes BC-3b dangerous for both users and tests. |
| S6 | `de-DE` and `en-GB` fall back to English silently. Harmless today, but if German is ever a supported UI language the export will silently disagree with the UI — worth a translation-coverage check tied to the supported-locale list. |

---

## 5 — Case ledger (Phase 0.7) — COMPLETE

Every row carries a terminal disposition. New TC IDs start at **`TC-CPR-OVR-066`** (NM-2271 holds
050..065 on its own branch — see the plan's cross-branch guard command).

| Candidate case | Source | Disposition |
|---|---|---|
| Export fires + downloads CSV, filename/endpoint/header | §3 file-I/O | `already-covered: TC-CPR-OVR-032` |
| Every row well-formed (cols/IDs/currency/flags/money) | §3 file-I/O | `already-covered: TC-CPR-OVR-038` |
| Export scope = tenant-wide, >1 distinct Location Id | §3 result-fidelity | `authored: TC-CPR-OVR-066` |
| Export volume floor (dynamic, LR-022) | §3 empty-vol | `authored: TC-CPR-OVR-067` |
| Export ignores Equipment/Labor tab (with visible grid delta) | Q1 | `authored: TC-CPR-OVR-068` |
| Export ignores the location picker | A6 | `authored: TC-CPR-OVR-069` |
| Export ignores Active-only (inactive rows survive) | Q3 | `authored: TC-CPR-OVR-070` |
| Export ignores the Currency filter (all 3 currencies survive) | Q2 | `authored: TC-CPR-OVR-071` |
| Export ignores the text filter | Q4 | `authored: TC-CPR-OVR-072` |
| Export ignores rows-per-page | A5 / §3 pagination | `authored: TC-CPR-OVR-073` |
| Export on an empty/unscoped grid still returns full tenant | Q7 / BC-1 | `authored: TC-CPR-OVR-074` |
| 1105 `Is Labor=0` count == Equipment grid row count | Q5 | `authored: TC-CPR-OVR-075` |
| NM-1940 empty-`Override Price` tolerated, not required | §3 render-state | `authored: TC-CPR-OVR-076` |
| CSV structural integrity — 9 fields/row, CRLF, RFC-4180 quoting | §3 file-I/O DEEP | `authored: TC-CPR-OVR-077` |
| Money fidelity — 2dp, no scientific notation, no date coercion | §3 file-I/O DEEP | `authored: TC-CPR-OVR-078` |
| Locale header localization + locale-invariant data rows | Q6 | `authored: TC-CPR-OVR-079` |
| Malformed locale → graceful English fallback, never 5xx | Q6 / §2.1 rejection | `authored: TC-CPR-OVR-080` |
| Grid endpoint health across offices (BC-3 regression guard) | §2c | `authored: TC-CPR-OVR-081` |
| `combination` (tab × currency × active-only) | §3 combination | `authored: TC-CPR-OVR-082` |
| `persistence` — page-size/currency survive reload, export unchanged | §3 persistence | `authored: TC-CPR-OVR-083` |
| Export ignores column sort (row order is server-side) | §3 sorting | `authored: TC-CPR-OVR-084` — sorting DOES exist via the header dropdown (TC-CPR-OVR-046/047). The earlier "headers do not sort" reading of TC-CPR-OVR-035 refers to header *clicks* only and would have wrongly retired this whole family. |
| Export button concurrency / rapid double-fire | §2 action trigger | `out-of-scope: concurrency is a deferred family in the Case-Generation Standard, and a repeat download cannot be distinguished from the first without a mutation` |
| Import-side round-trip of the exported file | NM-1940 | `out-of-scope: the Override import dialog is owned exclusively by NM-2273 per its plan line 23` |

---

## 6 — Un-walked remainder

**None.** Every item previously listed here has been driven live this session:

| Previously open | Closed by |
|---|---|
| LR-062 machine denominator uncomputed | `reports/walk-coverage/1604-corporate-pricing-override.json` — **denominator=70**, union 70 / intersection 47 / A△B 23, CDP-G1 hits 1. Matches the 2026-06-23 rewalk value exactly (independent parity). |
| Q2 / Q3 un-driven | E4 / E5 |
| Q4 (text filter) un-driven | **E6** — grid 9 → 1, export byte-identical |
| Q6 (locale) un-driven | **§2b / E9** — 6 locales + 6 malformed values |
| A5 (rows-per-page) un-driven | **E7 / E8** — 10 → 50 rendered rows on office 1974 |
| No location ever selected | offices **1105**, **1604**, and **1974** all selected and driven through the picker this session |
| `combination` / `persistence` / `pagination` / `sorting` families | dispositioned in §5 above |

The environment blocker recorded in §0 (root Playwright browser install) is **resolved** — root
`@playwright/test` was on 1.58.2, which hangs during zip extraction on Node ≥ 24.16
(playwright#41000 / #40998); this machine runs Node v24.17.0. Bumped to 1.61.1, cleared the stale
`__dirlock`, and the enumerator now runs.

Per LR-062 condition 5, nothing above is dispositioned from inference — the blanks stay blank.

<!-- INCREMENTAL APPEND POINT — END -->
