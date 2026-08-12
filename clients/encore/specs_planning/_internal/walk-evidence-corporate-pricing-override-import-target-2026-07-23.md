# Walk Evidence — Corporate Pricing Override IMPORT-TARGET Certification (Phase 0.7 BLOCKING GATE)
# NM-2273 | 2026-07-23 | Certified target: Office 4107 (secondary canary: 1105)

**MCP_Session_Date**: 2026-07-23
**Browser tool**: Playwright CLI (headless, `-s=e2e`, `state-load .auth/encore-state.json`)
**Reason**: Phase 0.7 live certification of a healthy import target — unattended functional/network probe (LR-033 watch-network).
**Provenance**: live (every observation below is a machine-emitted `playwright-cli` network row / response body / downloaded file — no inherited/inferred health).
**Base URL**: `https://cloudapps-e2e.encoreglobal.com/navigator/`
**Auth**: `.auth/encore-state.json` (session landed on `Product Group Override | Navigator`, NOT `login.microsoftonline.com` — no auth refresh needed).

> **Why this artifact exists**: office 1604 fails on location selection alone (HTTP 500, NM-2011 dup key 4543) — a *target* defect that poisons any test aimed at it before the import surface is reached. Inherited "healthy office" claims (1105/1107/4107 from earlier walk notes) are a hypothesis, not a certification. This artifact certifies live, in this session, before any Phase 1–4 authoring.

---

## CERTIFIED TARGET: Office 4107 (designated e2e office; round-trip-proven per evidence E)

Candidate order followed strongest-first (no skip): 4107 is candidate #1 (round-trip-proven, evidence E Steps 5a/5b/6) and passed every checklist item on first certification — no need to fall through to 1105/1107.

### Certification checklist — every item live-observed (value seen, not a bare ✓)

| # | Checklist item | Observed value | Machine evidence |
|---|---|---|---|
| 1 | Location select fires no HTTP 500, no error toast | `GET /navigator/api/location/corporate-price-pg-override?localOfficeId=4107` → **200** (also `POST /navigator/api/location/location-lookup` → 200 for the picker) | network req #84 (grid), #83 (picker lookup) |
| 2 | Grid renders; Equipment + Labor counts **separately** | UI: **"1 items found"**, row `4107 4298 Project Manager (Pre/Post) - Hourly USD 305.00 152.00`. API: **Equipment = 1** (PG 4298, `isLabor:false`), **Labor = 0** | snapshot `page-2026-07-23T08-17-…`; response body #84 |
| 3 | Currency present | **USD** (single currency; grid API `currencyId: 1`, export row shows `USD`) | response body #84; export line 4346 |
| 4 | Office rows appear in tenant-wide export (round-trip can target them) | 4107 present at **export line 4346**: `4107,4298,Project Manager (Pre/Post) - Hourly,0,USD,305.00,152.00,,1` — total **8996** data rows | `ProductGroupOverrides_20260723_082110UTC.csv` (SHA256 `1d859610c2b2eb7d926536bfdae857068197573fbf51c8ab4f31d45b8c603794`, 570,964 bytes) |
| 5 | No duplicate product-group key for this office (the 4543 defect class) | Exactly **1** row matches `^4107,` in the tenant-wide export; API shows a single `productGroupId` (4298) | `grep -cE "^4107," <export>` = 1; response body #84 |

**Current 4107 baseline state** (for Phase 4 round-trip): PG 4298 Override Price = **152.00**, Current Price 305.00, Active = true, last updated `07/17/2026 11:19 PM`. This is the clean restored baseline from evidence E — Phase 4 modifies 152.00 → 152.01 → 152.00 verbatim.

**Labor limitation (recorded, not disqualifying)**: 4107 has **0 Labor rows**, so 4107's grid cannot carry a Labor-specific *grid* assertion. This does **not** block import testing — the import CSV is **tenant-wide** (Equipment + Labor in one file), so Labor rows are exercised through the file itself, not through 4107's grid. Where a Labor-populated grid oracle is wanted, use the 1105 canary below (2 Labor rows).

---

## SECONDARY CANARY: Office 1105 (live-verified; richer 9-row grid)

Purpose: because the import is **tenant-wide**, a malformed/empty-file rejection that partially applied could be invisible on 4107's single-row grid. 1105 (9 Equipment rows) is a stronger "zero rows changed" cross-check oracle, and is already a bed in the existing spec (active/sort describes).

- `GET /navigator/api/location/corporate-price-pg-override?localOfficeId=1105` → **200** (network req #91)
- **Equipment = 9**, **Labor = 2**, currency **USD** (`currencyId: 1`), **no duplicate PG keys**
- Active breakdown: **7 active / 2 inactive** (the two inactive Camlok rows — matches `CORP_PRICING_OVERRIDE_ACTIVE_BED`)

---

## REJECTED / NEVER-USE

- **Office 1604 — NEVER certify, NEVER target.** Known HTTP 500 on location selection alone (NM-2011, duplicate product-group key 4543). Excluded a priori per the standing instruction; not selected or driven in this session. Any Phase 1–4 TC that targets 1604 is a defect.

No other candidate was tested-and-rejected: candidate #1 (4107) passed, so the strongest-first order terminated at the first pass (no skip-ahead to record).

---

## Upsert-scope note (state the semantics so nobody later misreads a refreshed Mod Date as a bug)

The import **upserts only the rows present in the uploaded file**: every row in the file gets its Mod Date + Updated By stamped (**including rows whose values did not change**), and any location NOT in the file is left completely untouched. So the *full* tenant export is what makes a full-file import touch every office (it contains every row) — the semantics are per-file-row, not an unconditional tenant-wide restamp. A **partial file** (header + one row) stamps only that one row. This is **live-verified 2026-07-23** in the same session (see the partial-import round-trip section below): a partial import of 4107/4298 left the 1105 canary's row count AND its first row's Mod Date **unchanged**. A refreshed Mod Date on rows that WERE in the uploaded file is expected upsert behavior, not a regression.

## NM-1940 pre-processing note (still live 2026-07-23)

The raw tenant-wide export STILL contains exactly **one** row with an empty Override Price at **line 19**: `1115,286,01D Double Screen Set Kit,0,USD,0.00,,,0`. Import validation rejects the whole file on this row (`Error Row#:19, Msg: LocationId, ProductGroupId, OverridePrice is required.` — evidence E Step 4). The negative-path TC (TC-CPR-OVR-054) uploads the raw export verbatim to document this NM-1940 regression. The **positive** round-trip (TC-CPR-OVR-053) sidesteps the raw-export empty-row problem entirely by importing a minimal file (header + the single target row) rather than the filtered full dump — see below.

---

## Import-behavior walk (Phases 1–3 oracles — live-observed 2026-07-23 on 4107)

All three walked live this session against the certified target (4107); each rejection re-verified zero rows changed (reload + re-select → grid still PG 4298 / price 152 / `updatedAt 2026-07-17T17:49:32` unchanged).

| Phase | Input | Live-observed behavior | Machine evidence |
|---|---|---|---|
| 1 (upload-disabled gate) | (no file) → file | BEFORE file: Upload button `disabled = true`, "No file selected" visible. AFTER `setInputFiles`: Upload `disabled = false`, "Attached file" shown. Dialog title "Import All Pricing Overrides"; Cancel present. | `eval` button.disabled reads; testids `pg-override-upload-dialog-file-input` / `-upload` |
| 2 (malformed.csv) | `import-all/malformed.csv` (`just,some,garbage\nno,proper,header`) | `[role="alert"]` = **"Error Row#:2, Msg: LocationId, ProductGroupId, OverridePrice is required."** Dialog stays OPEN. Grid unchanged after reload (152, same timestamp). | `[role="alert"]` textContent; grid API response body |
| 3 (empty.csv) | `import-all/empty.csv` (0 bytes) | Upload ENABLES on the 0-byte file (`disabled=false`); on click Upload → `[role="alert"]` = **"Please check the upload file format."** (distinct message from malformed). Dialog stays OPEN. Grid unchanged after reload. | `[role="alert"]` textContent; grid API response body |

**Message-format note**: malformed → per-row `Error Row#:N, Msg: LocationId, ProductGroupId, OverridePrice is required.` (same validator as NM-1940 raw-export reject); empty → the format-level `Please check the upload file format.` These are two DISTINCT rejection paths — assert each on its own literal.

**Fixture reuse (per plan line)**: Phases 2–3 reuse the existing generic `src/data/corporate-pricing/fixtures/import-all/{malformed,empty}.csv` via a spec-level path helper — no new fixtures fabricated; the Override page object supplies its own upload method.

**Phase 4 grounding**: the round-trip (baseline→baseline+0.01→baseline) is proven in evidence E (2026-07-17, ≤14 days) AND re-confirmed today (export works, NM-1940 row still at export line 19, `setInputFiles` works, malformed/empty rejections work). The Phase-4 spec drives the mutation live on every run — the spec run is its own re-walk. **Design refinement (2026-07-23, below)**: the positive round-trip uploads a **minimal** file (header + the one target row) rather than the filtered full dump — this returns a clean HTTP 200 (no NM-2186 stall) and needs no NM-1940 filtering.

---

## Partial-import round-trip design (live-verified 2026-07-23, same session — supersedes the full-dump round-trip approach)

The positive round-trip originally re-uploaded the whole tenant dump with one row edited. That path is fragile: a valid full-dump upload stalls the client at "Uploading… 50%" (NM-2186) with **no** response, so the test had no clean completion signal and raced the in-flight 570 KB upload against its own reload. A live diagnostic this session established a strictly better vehicle — a **minimal** file (header + the single target row):

| Probe | Machine evidence (raw `playwright-cli run-code` output) |
|---|---|
| Minimal file import returns a clean response (NOT the NM-2186 stall) | `importResp = { status: 200, ms: 2101 }` — `POST /navigator/api/location/corporate-price-pg-override/import` returned **200 in ~2.1s**; the POST `requestfinished` fired at 682 ms on a repeat probe. |
| The minimal import applied the target value | `targetAfter = { pg: "4298", override: "152.02", modDate: "07/23/2026, 05:37 PM" }` after re-select. |
| A partial import upserts ONLY its own rows (canary untouched) | `canaryBefore = { count: 9, firstPg: "272", firstMod: "07/23/2026, 05:32 PM" }` → `canaryAfter = { count: 9, firstPg: "272", firstMod: "07/23/2026, 05:32 PM" }` → **`canaryUnchanged: true`** (office 1105 row count AND first-row Mod Date both unchanged across the 4107 partial import). |
| The "50%" progressbar is a fixed UI state, NOT a body-sent signal | progressbar reached `aria-valuenow=50` at **263 ms** (before any body could be sent), then dropped to 0/none as the dialog closed at ~4.9s — so waiting on "≥50%" is not a valid upload-complete oracle; the network response is. |

**Consequence for TC-CPR-OVR-053**: import a 2-line file, wait for the import POST response, assert **status 200**, then reload-read the committed value. The 1105 canary (row count unchanged) is retained as a real safety oracle — it proves "Import All" upserts additively rather than destructively replacing rows for locations absent from the file. No full-dump upload, no NM-2186 stall, no NM-1940 filtering, no tenant-wide restamp.

---

## Import validation matrix (live-probed 2026-07-23, office 4107 / PG 4298 — full field-level walk)

**Model (load-bearing):** the Override import is a **per-row partial-success API**. It returns **HTTP 200**
with body `{"success":true,"data":{"successRecordCount":N,"failureRecordCount":M,"errors":[{"error":"…"}]}}`.
**A 200 does NOT mean a row applied** — a file whose every row is invalid still returns 200 with
`failureRecordCount>0` and `successRecordCount:0`. The authoritative oracle is the response BODY, not the
HTTP status. Rows are **atomic** (any one invalid field rejects the whole row — a valid Override Price in
the same row does not partially apply). Rejections surface on **two** layers:

- **Parse/format layer → alert toast, NO server POST**: empty file, header-only, too-few-columns,
  non-numeric Override Price, malformed structure.
- **Semantic/data layer → HTTP 200 body `errors[]`, NO toast**: invalid currency value, negative price,
  Override Discount > 100, nonexistent ProductGroupId, nonexistent LocationNo.
- **Client file-type gate**: a non-`.csv` file leaves the Upload button **disabled** with "Unsupported
  file type. Allowed: .csv" — the upload never fires.

| # | Bad input | Layer | Verbatim server/UI message | Applied? | Machine evidence |
|---|---|---|---|---|---|
| 1 | Invalid currency (`GBP`) | 200-body | `"Row 1 has invalid data for Currency"` (`failureRecordCount:1`) | no | probe-v2 `currency_GBP` |
| 2 | Non-numeric price (`abc`) | toast | `Error Row#:2, Msg: The Override Price should be decimal format within two decimal places.` | no | probe-v2 `nonnumeric_abc` |
| 3 | Negative price (`-5`) | 200-body | `"Row 1 has invalid data for OverridePrice"` | no | probe-v2 `negative_-5` |
| 4 | Discount > 100 (`150`) | 200-body | `"Row 1 has invalid data for OverrideDiscount"` — **UI ≤100 cap is enforced on import too (backdoor closed)** | no | probe-v2 `discount_150` |
| 5 | Header-only (0 data rows) | toast | `Please check the upload file format.` | no | probe `c5_header_only` |
| 6 | Too few columns | toast | `Error Row#:2, Msg: LocationId, ProductGroupId, OverridePrice is required.` | no | probe `c6_too_few_cols` |
| 7 | Extra trailing columns | 200-body | `successRecordCount:1` — **ACCEPTED, extra columns ignored** (row applied: 152.00→153.11) | yes → restored | probe-v2 `extra_cols` |
| 8 | Wrong extension (`.txt`) | client gate | Upload button **disabled** + `Unsupported file type. Allowed: .csv` | no | probe `c8_wrong_ext_txt` |
| 9 | Nonexistent ProductGroupId (`9999999`) | 200-body | `"Row 1 ProductGroupId '9999999' does not exist"` | no | probe-v2 `bad_pg` |
| 10 | Nonexistent LocationNo (`9999999`) | 200-body | `"Row 1 LocationNo '9999999' does not exist"` | no | probe-v2 `foreign_loc` |

Office 4107 / PG 4298 restored to the certified `152.00 / USD / no discount / active` after every probe
(final RESTORE import: `successRecordCount:1`, grid re-read = 152.00). No shared-tenant residue.

### Batch / multi-row behavior (live-probed 2026-07-23, same office)

| Case | File | Result (verbatim body) | Meaning |
|---|---|---|---|
| Mixed valid + invalid | 4298 valid row + `4107,9999999` invalid row | `successRecordCount:1, failureRecordCount:1, "Row 2 ProductGroupId '9999999' does not exist"` | **Partial success is real** — the valid row applies WHILE the invalid one fails; a bad row does NOT abort the file (body-error path). Rows are processed independently. |
| Duplicate rows | 4298 twice (same key) | `successRecordCount:2, failureRecordCount:0` | Duplicates are **accepted, not rejected** — no duplicate-key error; idempotent (last value wins). |
| Large batch | 6000 rows, all `4107,9999999` (invalid) | `successRecordCount:0, failureRecordCount:6000`, ~7.5s, HTTP 200 | **No oversized-file gate** — a 6000-row (~294 KB) file is processed per-row and reports every failure; no "file too large" error and NO stuck-upload stall (the NM-2186 stall is specific to a full-tenant VALID dump, not row count). |

These fund TC-CPR-OVR-066 (mixed partial-success), 067 (duplicate idempotent), 068 (large batch). Distinct-record multi-valid (two different valid records in one file) is behaviourally implied by the mixed case (a distinct valid record applies alongside a failure) + the duplicate case (a two-row batch both succeed) — not separately driven because it would require mutating a second controlled office.

---

## Observations (LR-064)

### Bugs / Defects
- **NM-1940** (reconfirmed live 2026-07-23) — a freshly-exported tenant CSV cannot be re-imported: the one
  empty-Override-Price row aborts that row (`OverridePrice is required`), so a naive export→re-import fails.
  Covered by TC-CPR-OVR-054. Filed: `clients/encore/reports/bugs/`.
- **NM-2186** (reconfirmed live) — a full 570 KB tenant-dump valid import stalls the client at
  "Uploading… 50%" with no response, though it applies in the background. A minimal file does not stall.
  Filed: `clients/encore/reports/bugs/`.
- No NEW field-validation defect: the import validates currency, price sign/format, the ≤100 discount cap,
  and referential integrity (PG/Location existence) correctly — there is **no import-side backdoor** around
  the grid's client validations.

### Suggestions / Improvements (discussion-items, NOT filed as bugs)
- The import returns **HTTP 200 even when every row fails** (failures reported only in the body). A 4xx on
  a whole-file failure would let clients detect failure by status alone. Discussion-item.
- **Extra trailing columns are silently ignored** rather than flagged — lenient parsing; low risk, noted.
- The upload progress bar shows a fixed **50%** immediately (before bytes are sent) and is not a real
  progress signal. **Per Rutvik 2026-07-23 this is NOT a bug** — recorded as a neutral UI note only.

---

## GATE (Phase 0.7 → Phases 1–4)

**PASS.** Phases 1–4 consume **office 4107** (the office named here), with **1105** as the tenant-wide "zero rows changed" canary. Artifact exists and names a certified target — no HALT, no fallback to a hardcoded office, and 1604 is never targeted.
