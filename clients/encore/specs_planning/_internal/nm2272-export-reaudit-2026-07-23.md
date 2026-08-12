# NM-2272 (Override Export) — full re-audit vs current tree

**Date**: 2026-07-23 · **Auditor seat**: WATCHDOG (BUILDER session) · **Mode**: document-only (per Rutvik —
re-audit fully, record every gap incl. the three reviewer-flagged ones, **fix nothing here**).

**Plan**: `plans/pending/SUBPLAN_CORP_PRICING_NM2272_OVERRIDE_EXPORT.md`
**Spec**: `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts`
**Scope note**: NM-2272's import-side phases (dialog guards / malformed / empty / valid round-trip) are now
satisfied by the NM-2273 import work (TC-050…054). This re-audit focuses on the EXPORT half, which NM-2272
uniquely owns, plus a status line per NM-2272 acceptance criterion.

---

## Acceptance-criterion matrix

| # | NM-2272 acceptance criterion | Status | Evidence (file:line) |
|---|---|---|---|
| 1 | Export downloads with the `ProductGroupOverrides_YYYYMMDD_HHMMSSUTC.csv` filename pattern | **PASS** | TC-CPR-OVR-032 `spec:421` (`filenamePattern`) |
| 2 | Export request hits the export endpoint (not a page URL) + carries locale | **PASS** | TC-032 `spec:422-423` (`apiPathFragment`, `localeParam`) |
| 3 | Export is non-empty | **PASS** | TC-032 `spec:424`; TC-038 `spec:454` (`dataLines>0`) |
| 4 | 9-column header, exact set + order | **PASS** | TC-032 `spec:425` (`toEqual(expectedHeaders)`) |
| 5 | Content integrity — no ragged rows, numeric IDs, supported currency, 0/1 flags, well-formed money/percent | **PASS** | TC-CPR-OVR-038 `spec:435-473` (per-row column-count + format validation over the whole file) |
| 6 | UTF-8 handling (BOM-safe) | **PASS** | `downloadOverrideExport` strips a leading BOM + reads utf-8 (`corporate-pricing-override.page.ts` `downloadOverrideExport`) |
| 7 | **Tenant-wide row count ≥ 8000** (Phase 1.2 — dynamic `≥8000`, not a hardcoded 8,996) | **GAP #1** | TC-038 asserts `dataLines.length > 0` only (`spec:454`); no `≥8000` assertion anywhere |
| 8 | **Export spot-check — a known grid value appears in the file** (content-anchored) | **GAP #2** | no dedicated spot-check TC. TC-053 incidentally reads the `4107,4298` row FROM the export (`spec:893`), but nothing asserts the LIVE grid value for a known (office,PG) equals the file's value |
| 9 | **Excel-drift — numeric columns survive a CSV round-trip without format corruption** (Phase 3) | **GAP #3 (partial cover)** | TC-038's money regex `^\d+\.\d{2}$` (`spec:467-469`) catches gross numeric corruption, but there is NO dedicated Excel-consumption/round-trip TC (e.g. scientific-notation / trailing-zero / thousands-separator drift) |
| 10 | Import dialog guard states (Upload-disabled-until-file) | **PASS** (via NM-2273) | TC-CPR-OVR-050 |
| 11 | Import malformed.csv → user-facing error, grid unchanged | **PASS** (via NM-2273) | TC-CPR-OVR-051 |
| 12 | Import empty.csv → graceful error | **PASS** (via NM-2273) | TC-CPR-OVR-052 |
| 13 | Import valid round-trip | **PASS** (via NM-2273) | TC-CPR-OVR-053 |

## The three documented GAPs (NOT fixed here — per instruction)

- **GAP #1 — no `≥8000` tenant-wide row-count assertion.** Add to TC-038 (or a new export TC):
  `expect(dataLines.length).toBeGreaterThanOrEqual(8000)` — a dynamic floor, never the hardcoded 8,996
  (LR-022). This is the single strongest "the export is the WHOLE tenant, not the on-screen office" proof
  and it is currently absent.
- **GAP #2 — no export spot-check.** Add a TC that reads a known live grid value (e.g. office 4107 / PG 4298
  Override Price from the grid) and asserts that exact `(LocationId, ProductGroupId, OverridePrice)` tuple
  appears in the downloaded file — content-anchored, closing the "the file actually reflects the grid" loop.
- **GAP #3 — no dedicated Excel-drift TC.** Add a TC that parses the money/percent columns and asserts they
  are canonical decimal strings (no scientific notation `1.5E2`, no thousands separators, exactly two
  decimals for money), simulating an Excel round-trip. TC-038's inline regex is a partial net, not a
  dedicated documented case.

## Cross-observations

- **Row-count comment drift (8,995 vs 8,996)**: `override.ts:76` records "8,995 rows" (2026-07-09 live);
  the NM-2272 plan records "8,996" (2026-07-17). Both are dated point-in-time observations — the tenant
  row count DRIFTS with data. Neither is asserted (no hardcoded count in the spec), so this is a stale
  *comment*, not a test defect. Reconciled in the NM-2273 remediation by wording the `override.ts` comment
  as an approximate, drift-aware value.
- No NM-2272 export TC is skipped/`fixme`. The export half is structurally sound; the three GAPs are
  *missing assertions*, not broken ones.

## Routing (LR-040(b) — documented destination, no fix here)

The three GAPs are recorded here and carried by **`plans/pending/SUBPLAN_CORP_PRICING_NM2272_OVERRIDE_EXPORT.md`**
(its Acceptance criteria lines already enumerate the row-count / spot-check / Excel-drift items — they
remain unchecked). This audit is the evidence that they are real and unimplemented; closing them is a
NM-2272 follow-up, explicitly out of scope for the NM-2273 remediation.
