# ID/Naming Consistency Audit — Verdict Report (2026-06-10/11)

**Source**: 10-finder workflow (114 raw → 104 merged findings, `findings-merged.json`), orchestrator inline verification (spot-checks recorded per class).
**Verification note**: the original 3-lens × batch adversarial-verification stage (~13 more agents) was trimmed on user budget constraint; orchestrator verified the load-bearing claims directly (KNOWN_SUB_CODES, NE-001 dangling refs, @locations tags, Overview arithmetic, Module cells in both workbook dumps). REFUTED-class hygiene was applied at finder level via pre-registered false-positive shapes.

**Workflow-necessity assessment (user question)**: the 10-finder fan-out WAS load-bearing — F5/F6/F7/F8/F10 surfaced clusters unknown at launch (phantom NE sub-family, 23/24 bug IDs with no JSON, stale test-plan grammar, TestRail lint false-green, band-policy gap) that inline exploration would not have covered at acceptable context cost. The CUT stages (12 verifier agents + 1 synthesis agent) were over-provisioned for ~30 substantive findings — inline orchestrator verification suffices at this scale. Right-sized design in hindsight: ~6 finders + inline verify. Lesson recorded for /reflect.

---

## PC-1 — `TC-LOC-CPR` misprefix + number-band submodules (the trigger) — S1

150 IDs in 6 MDs + 6 specs + 6 test plans + both workbooks + blocked-reasons + navigation.md (6 rows). `LOC` = Locations module segment on a top-level module; screen identity lives in number bands (001/1xx/2xx/3xx/[4xx reserved]/5xx/6xx) — 3 of 6 files start mid-band with NO in-file band declaration. Planned (SUBPLAN_CORP_PRICING_00_FOUNDATION F10) with zero recorded rationale; `KNOWN_SUB_CODES` (export_test_cases/types.ts:162) institutionalizes `CPR` as a *submodule of LOC*; client's own seed IDs were `TC-ENC-PRC-*`.
- **Cost to FIX (rename)**: ~25 files, 7 layers; both workbooks already delivered → client-visible ID churn; mechanical map old→new committed as bridge.
- **Cost to KEEP**: ID stays semantically wrong forever; guards must allowlist; Module-column fix (PC-2) still required.
- **Options**: A full re-grammar `TC-CPR-{SUB}-NNN` + 001-renumber · B re-grammar keep tails (`TC-CPR-TIO-608`) · C keep IDs + registry override + allowlist · D = C now, rename decision deferred to a delivery milestone.

## PC-2 — Shipped workbook Module/Submodule cells wrong + 3-vocabulary label divergence — **S0 (shipped wrong)**

All 150 corp rows in `encore_test_cases.xlsx` ship Module=`locations` (from `extractModule()` to-csv.ts:688 — moduleMap has 5 speculative codes (AUTH/ORD/USR/RPT/SET) but NOT corporate-pricing); Submodule uniformly `corporate_pricing` (band collapse — screen identity carried only by sheet name); TestRail workbook says `Corporate Pricing` + per-screen Sub-Modules → **the two delivered artifacts contradict each other**. Corp sheet names ride the silent `toSheetName()` fallback (no SHEET_NAMES entries; `corporate_pricing_new_pricebook` is exactly 31 chars = Excel limit). Overview labels = raw slugs.
- **Recommendation: FUCKUP_FIX regardless of PC-1 ruling** (registry-driven Module/Submodule + pinned sheet names + regen).

## PC-3 — Overview sheet arithmetic wrong (Manual uncounted) — S0/S1

Overview has no Manual column → `Total ≠ Automated + Pending` on sheets with Manual TCs (locations_notes 58 vs 55; locations_local_information 114 vs 110; 7 Manual TCs total). Client-visible arithmetic error in the shipped workbook. **Recommendation: FUCKUP_FIX** (add Manual column to Overview).

## PC-4 — BUG-ID grammar chaos + documented-rule-vs-corpus drift — S2 (S1 where in shipped specs)

Live corpus splits 3-segment (BUG-LOC-NTS/SHR/ACC/AAO/BI/MGH/ECT, BUG-LOS-ECT/BAS) vs 2-segment (BUG-CPR/HIS/LI/LS/MGH). LR-034 itself documents the 2-seg form (rule drifted vs corpus). Collisions: `BUG-MGH-001` ≠ `BUG-LOC-MGH-001` (two different bugs share the tail); `BUG-LOC-ECT-001` vs `BUG-LOS-ECT-001` (module flip, local-office surface under LOC); `BUG-LOC-LOS-001` (inverted grammar); SSL surface bugs filed as SHR (TC-LOC-SSL-* vs BUG-LOC-SHR-001, 17 refs in shipped spec); `BUG-CPR-001` (2-seg) cited by shipped corp spec. Mixed numbering conventions (sequential vs TC-derived).
- **Options**: standardize 3-segment canonical (registry `bugPrefixes`, update LR-034 + navigation routing row, rename live refs + the 1 on-disk JSON with formerIds ledger) · register-existing-only (document, no renames) · defer.

## PC-5 — Phantom/dangling internal references — S2

(a) 37× `Depends_On: TC-LOC-LI-NE-001` → defined nowhere (NE-001..010 phantom; family starts at 011). (b) 23 of 24 live-referenced bug IDs have NO JSON on disk; navigation.md cites ≥8 specific `.json` paths with content claims that don't exist; docs prescribe root `reports/bugs/` which doesn't exist (actual: `clients/encore/reports/bugs/`). (c) 16 `TC-NEW-SSL-*`/`TC-LOS-ECT-NEW-1` placeholders never reconciled. (d) 75 lines across 7 MDs + 7 test-plan pointers + 14 test-cases pointers reference pre-restructure paths (`specs/`, `test-cases/locations/`). (e) fixme-registry stale-claim layers. **Recommendation: FUCKUP_FIX (internal batch)** — fix Depends_On to nearest real anchor or drop; correct doc paths; ledger placeholders; path-fix the 75+21 stale pointers.

## PC-6 — Test plans stale vs test cases — S2

LI plan uses obsolete 2-seg grammar (TC-LOC-001..015, 34 refs, none resolve) + claims 63 cases vs 114 actual; SSL plan Total 24 vs 44 headers; Notes plan 27 vs 58; MGH plan 19 vs 25; orphan duplicate `locations_left_panel_test_plan.md` (pairs with no cases file); self-referencing sibling lists in 2 local-office plans. **Recommendation: FUCKUP_FIX (internal batch)** — refresh counts/ranges, fix grammar refs, delete/merge orphan plan, fix sibling lists.

## PC-7 — Shipped LI-family grammar anomalies — S1

37× 4-segment `TC-LOC-LI-NE-*` (undefined "NE" token, starts at 011), `TC-LOC-LI-SKIP-BILLING` (non-numeric), `008A`/`024A` letter suffixes, LI-070 relocated→renamed to SKIP-BILLING with no note. All in the shipped workbook + 8 blocked-reasons keys + TERSE allowlist. Renaming churns delivered LI rows like PC-1 does for CPR.
- **Options**: grandfather + register as documented exceptions (+ add the missing LI-070 note) · rename now to canonical (client churn) · defer.

## PC-8 — Code-table hygiene — S2

5 dead TAB_MAP codes (PRC/LCL/HST/HIST/HISL) duplicated across to-csv.ts + humanize.ts (dead parallel surface: TAB_MAP + 9 functions) + unused `LO_PREFIX_TO_SHEET` (3rd alias copy); extractModule's 5 speculative module codes + missing corporate-pricing; 3 parallel label vocabularies (to-csv slugs / to-xlsx display / _gen-testrail Title-Case). **Recommendation: FUCKUP_FIX** — registry becomes single source; dead copies removed.

## PC-9 — Spec-side tag/title anomalies — S2/S3

All 3 local-office specs tagged `@locations` (verified); ECT-014/015 IDs minted via template-literal (invisible to static scanners); 37 bare `TC-NNN` shorthand comment refs in shipped specs. **Recommendation: FUCKUP_FIX for the @locations tags; document the rest.**

## PC-10 — Sheet-name/label divergences — S3 (mostly mechanical)

31-char Excel truncations (`locations_shared_setup_location`, `locations_left_panel_basic_info`); `local_office_settings` named by screen-bucket vs content; TestRail header schema differences (by-design import format). **Recommendation: BY_DESIGN_KEEP + allowlist; pin corp sheet names explicitly (PC-2 fix).**

## PC-11 — Validation gaps (guards pre-approved by user) — S1

No check covers: ID-module-segment vs file/dir (SUB-001 checks only submodule codes — and its list registers CPR under LOC); ID vs sheet (634 rows unvalidated); Module/Submodule cell vs sheet; BUG grammar anywhere; TERSE allowlist/blocked-reasons liveness; xlsx⊃md parity direction; band policy (an Override TC numbered 050 would pass everything); TestRail workbook invisible to commit lint + **ship-time lint column-name-blind → false-green** (directly affects PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT); 3 inconsistent ID regexes across validators. **Recommendation: FUCKUP_FIX — guardrail 6/7 + C8, registry-driven; default strictness FAIL-now with pre-seeded exceptions.**

## PC-12 — Misc artifact-header defects — S2/S3

PRI file Total=35 vs 34 headers (034 documented-skip); LP summary table duplicate "Automated" column; 3 coexisting Module-header formats across 19 MDs; `****` scrub damage in the LOS-BAS gap table; stale LP catalog mapping; catalog filename convention drift. **Recommendation: FUCKUP_FIX (cheap batch).**

## PC-13 — Confirmed by-design / false-positive boundary notes — REPORT_ONLY

MGH refs in notes MD (relocation cross-refs); TC-ENC-PRC provenance (boundary note: also appears in `_internal/` + corp MD ledger sections, not only plans/); TC-LOS-BAS 8 gaps have in-file disposition table; PRI-034 documented skip; comment-only LP-024/LGL-015..017 omission notes; TestRail header schema (import format); duplicate corp TestRail xlsx (user-approved delete).

---

## Gate rulings (user, 2026-06-11)

- **Gate 1 (PC-1/2/3)**: **A — full re-grammar + clean renumber.** `TC-LOC-CPR-NNN` → `TC-CPR-{SRC|STR|DET|NPB|OVR|TIO}-NNN`, 001-based per screen. Applied (188 TC renames incl. LI; map at `id-rename-map.csv`).
- **Gate 2 (PC-4/5/6)**: **standardize 3-segment BUG grammar.** `BUG-{MOD}-{SUB}-{NNN}` with registry codes; LR-034 + navigation updated; live renames BUG-CPR-001→BUG-CPR-OVR-001 (+JSON formerIds), BUG-LOC-SHR-001→BUG-LOC-SSL-001, BUG-HIS-001/002→BUG-LOC-MGH-002/003; unresolvable historical prefixes (BUG-LS, BUG-LOC-BI, …) registered as `unresolvedHistorical`.
- **Gate 3 (PC-7)**: user — "client hasn't seen it, permanent fixes only, no temp fixes" → **LI family normalized**: NE-011..047 → TC-LOC-LI-078..114, SKIP-BILLING → TC-LOC-LI-070; 008A/024A kept as the REGISTERED letter-suffix insertion mechanism; 37 dangling Depends_On dropped.
- **Gate 4 (hygiene)**: **fix all now.** Overview Manual column, stale paths, test-plan truth-sync + regenerated Coverage Indexes + orphan plan deletion, dead code-table surfaces removed, @locations tags fixed, scrub-damage repaired (NM-1264 restored; 2 unrecoverable `| ****` tails stripped — logged as deviation).
- **Guard strictness** (defaulted, announced): FAIL-now; exceptions list EMPTY (full fixes made allowlisting unnecessary).

## Execution addendum

- Guardrail 6 caught a real off-by-one in the rename map on its FIRST run (bands start X01 → families started at 002) — fixed via one-pass decrement; organic negative-test of the guard.
- V13: C8 vs the pre-fix workbook (git HEAD extract) = **162 violations** → guard provably catches the shipped defect. Current workbook: 0.
- Encoding incident: one PowerShell `Set-Content` corrupted 2 MDs (mojibake) — recovered via deterministic cp1252-reverse (`unmojibake.mjs`); all rewrites since via Node utf8 only.
