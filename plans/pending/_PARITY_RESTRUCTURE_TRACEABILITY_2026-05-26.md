# Parity Restructure Traceability — SP01-SP08 → W1-01..W2-09 + Wave 0 (XLSX migration)

**Created**: 2026-05-26
**Updated**: 2026-05-27 (XLSX migration Phase C — W1-02 retired-as-superseded; W1-04 / W2-08 REWRITE-light; W1-05 / W2-09 REWRITE; parent `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` moved to `plans/done/` per supersede)
**Status**: TRACEABILITY-ARTIFACT (not a subplan)

> **XLSX-migration disposition (Phase C, 2026-05-27): REWRITE.** This traceability artifact is the canonical map between the SP01-SP08 numbering and the W1-01..W2-09 numbering. After the supersede of `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`, the table below remains accurate for W1-01 / W1-03 / W2-06 / W2-07 (PRESERVE) and the W1/W2 subplans that received REWRITE banners. Per the migration's [triage ledger](../../clients/encore/specs_planning/_internal/plan-triage-ledger-2026-05-27.md): W1-02 already in `plans/done/`; W1-04 / W2-08 REWRITE-light; W1-05 / W2-09 REWRITE for XLSX retargeting; W2-06 / W2-07 unchanged.

**Purpose**: prove every task from former SP01-SP08 has a destination in the new W1/W2 subplans + Wave 0 before archival per LR-027 / LR-040.

---

## Wave 0 — XLSX deliverable migration (added 2026-05-26)

**Plan**: [PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md](PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md)

**Trigger**: JBS colleague's deliverable target flipped from "11 per-module CSVs" to "one multi-sheet `encore_test_cases.xlsx` workbook" (Overview tab + per-module tabs + trailing summary rows). CSV physically cannot host sheets per RFC 4180.

**Supersedes**: SUBPLAN_PARITY_W1_02 (closed-as-superseded; moved to `plans/done/`).

**Wave 0 absorbs from W1-02**:
- MD-side prereqs A1/A2/A3 (Automation File path updates + header counts + Status sync) → XLSX plan Phase 0
- GP-3 CSV content cleansing → XLSX plan Phase 0 (MD-side scrub only; CSV dies in Phase D)
- GP-4 Notes ID/FCC reconciliation → XLSX plan Phase 0
- Duplicate TC-LOC-NTS-035 resolution → XLSX plan Phase 0

**Wave 0 drops (CSV-side W1-02 work, no destination)**:
- D1/D2 exporter fix — exporter rewrites wholesale to `to-xlsx.ts`; old `to-csv.ts` `git rm`'d in Phase D
- A4/A5 CSV re-export — CSV deliverable retired
- C3 local-office CSV split — XLSX has 3 separate native sheets; merged CSV dies with the dir in Phase D

**Wave 0 hands off to W1-05**:
- `check-csv-sanity.mjs` → renamed `check-xlsx-sanity.mjs`, authored fresh by W1-05
- `check-comment-sanity.mjs` → authored fresh by W1-05
- `red-flag-patterns.json` → authored fresh by W1-05

**Wave 0 hands off to XLSX plan Phase 0**:
- LR-050 stale-path grep sweep — rolled into Phase 0 A1 MD `Automation File:` updates

---

## Mapping table — every task accounted for

### SP01 — Decisions + Shady-Pass Audit

| SP01 task | Routed to | Notes |
|---|---|---|
| E1-E7 questionnaire | W1-01 | file-only |
| B.5 9 shady-pass live walks | W2-06 | e2e |
| Verdict artifact | W2-06 | output of W2-06 |
| Jira filings for OMITTED/skip rows | W1-01 (pre-triage) + W2-06 (live-verified) | split per evidence type |
| Activity log + Reflect | W1-01 + W2-06 (each closes independently) | standard |

### SP02 — Local-Office Structural Split

| SP02 task | Routed to | Notes |
|---|---|---|
| C1: split page object | W1-03 | code-side |
| C2: split selectors | W1-03 | code-side (LR-017) |
| C3: split CSV | ~~W1-02~~ → **Wave 0** (DROPPED — XLSX has 3 native sheets; merged CSV dies in Phase D) | superseded by XLSX structure |
| C4: HIS + ECT field-inventory walks | W2-07 | e2e |
| C5: HIS + ECT neutral-eye audits | W2-07 | e2e |
| C6: catalog rename | W1-03 | file-only |
| C7: fixtures.ts updates | W1-03 | file-only |
| C8: spec import rewrites | W1-03 | file-only |
| C9: anti-pattern sweep list | W1-03 | file-only list |

### SP03 — Tooling + MD + CSV Re-Export

| SP03 task | Routed to | Notes |
|---|---|---|
| D1: exporter fix (one CSV per MD) | ~~W1-02~~ → **Wave 0** Phase A (rewrites to `to-xlsx.ts`) + Phase D (`git rm to-csv.ts`) | exporter format flips wholesale |
| D2: MD template path update | ~~W1-02~~ → **Wave 0** Phase 0 (MD prereqs) | MD-side absorbed |
| A1: MD `Automation File:` path updates | ~~W1-02~~ → **Wave 0** Phase 0 | MD prereq for clean workbook |
| A2: MD header count fixes (5 modules) | ~~W1-02~~ → **Wave 0** Phase 0 | MD prereq |
| A3: MD Status sync | ~~W1-02~~ → **Wave 0** Phase 0 | MD prereq |
| A4-A5: CSV re-export | ~~W1-02~~ → **Wave 0** DROPPED (CSV retired Phase D) | superseded |
| §B per-module file-only MD edits | ~~W1-02~~ → **Wave 0** Phase 0 | MD-side absorbed |
| `check-csv-sanity.mjs` authoring | ~~W1-02~~ → **W1-05** (renamed `check-xlsx-sanity.mjs`) | target flipped + author home flipped |
| `check-comment-sanity.mjs` authoring | ~~W1-02~~ → **W1-05** | author home flipped |
| `red-flag-patterns.json` authoring | ~~W1-02~~ → **W1-05** | author home flipped |
| LR-050 stale-path grep sweep | ~~W1-02~~ → **Wave 0** Phase 0 A1 | rolled into Automation File path updates |

### SP04 — Spec Fixes (Easy Modules)

| SP04 task | Routed to | Notes |
|---|---|---|
| currency assertions per CUR verdict | **W2-08** | verdict-dependent |
| legal TC-015 implementation | **W2-08** | needs Country selector |
| legal TC-016/017 OMITTED-BUG comments | **W2-08** | depends on W2-06 Jira confirmation |
| account_address TC-015 wording | W1-04 | file-only post-W1-02 reconciliation |
| account_address TC-021/024 DROPPED comments | W1-04 | file-only |
| auto_addon typecheck | W1-04 | file-only |
| notes count + parity verification | W1-04 (file-only ID reconciliation per GP-4) | file-only |
| pricing TC-018/019/022 rewrite per PRI verdict | **W2-08** | verdict-dependent |
| Comment sanity passes | W1-04 + W2-08 (per file touched) | shared |

### SP05 — Spec Fixes (Investigative)

| SP05 task | Routed to | Notes |
|---|---|---|
| MGH TC-013/014 verdict-driven rewrite | **W2-08** | verdict-dependent |
| MGH TC-006/007/019 un-skip + RCA | **W2-08** | e2e (RCA needs live runs) |
| SSL fixmes un-skip per LR-021 (current: TC-031/032/007/026/030) | **W2-08** | e2e |
| LI-EXTRA MD add-back | **DEFERRED — ALREADY DONE per audit** | TC-LOC-LI-064/077/SKIP-BILLING already in MD/CSV/spec; W1-04 verifies parity only |
| Comment sanity passes | W2-08 (per file touched) | shared |

### SP06 — Spec Fixes (LOS Trio + smoke_seed)

| SP06 task | Routed to | Notes |
|---|---|---|
| BAS-068 add to spec + CSV | W1-04 (spec) + W1-04 Phase 10 (targeted CSV refresh) | file-only |
| BAS-048 un-skip per LR-021 | **W2-08** | e2e |
| HIS-7 42-column enumeration | W1-04 | file-only (deterministic) |
| ECT-018 implementation | W1-04 | file-only |
| ECT-001/010 verdict-driven rewrite | **W2-08** | verdict-dependent |
| smoke_seed restore/delete per W1-01 E5 | W1-04 | file-only per decision |
| Comment sanity passes | W1-04 + W2-08 | shared |

### SP07 — Left Panel Spec

| SP07 task | Routed to | Notes |
|---|---|---|
| 24 TCs / MD / CSV / test plan / selectors / spec | **FCC master roadmap line** (`SUBPLAN_LEFT_PANEL_FCC`) | USER-AUTHORIZED drop 2026-05-26: "do not create it" |

### SP08 — CI Guardrails + Full-Suite Verification

| SP08 task | Routed to | Notes |
|---|---|---|
| D3: MD header count validator | W1-05 | script authoring |
| D4: MD `Automation File:` path validator | W1-05 | script |
| D5+D6: MD↔spec bijection | W1-05 | script |
| D7: unjustified skip detector | W1-05 | script |
| D8: bare count assertion detector | W1-05 | script |
| D9: no-op assertion detector | W1-05 | script |
| D10: assertionless test detector | W1-05 | script |
| D11: weekly drift cron | **W2-09** | CI infra |
| D12: CSV cleanliness CI script | W1-05 (script) + W2-09 (wire) | split |
| D13: MD cleanliness CI script | W1-05 (script) + W2-09 (wire) | split |
| D14: code-comment sanity CI script | W1-05 (script) + W2-09 (wire) | split |
| D15: PR template checklist | **W2-09** | CI infra |
| D16: catalog-growth tracking | **W2-09** | CI infra |
| D17: drift-back sweep | **W2-09** | e2e + repo-wide |
| Phase 9 full-suite playwright run | **W2-09** | e2e |
| Final parity report | **W2-09** | closure artifact |
| Parent plan closure (LR-027) | **W2-09** | closure |

---

## Coverage check

- **9 source subplans** → **8 destination subplans** (W1-02 closed-as-superseded → tasks redistributed to Wave 0 + W1-05) + **1 FCC roadmap line** (SP07) + **Wave 0 PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION** (replaces W1-02 CSV-side; absorbs MD-side prereqs)
- Every task accounted for; zero orphans.
- **Not claimed**: "every task appears exactly once across W1+W2." Some tasks split deliberately (e.g., D12 script authoring W1-05 + wiring W2-09; comment sanity passes per touched file in both W1-04 and W2-08). The traceability is HONEST — every task has at least one destination + may have related work across multiple subplans.
- **W1-02 supersession (2026-05-26)**: CSV-deliverable work retired in favor of XLSX workbook. MD-side prereqs absorbed by Wave 0 Phase 0; sanity-script authoring rehomed at W1-05; downstream subplans' depends-on updated to Wave 0 + Phase D.

## Verification

```bash
# All 9 new subplans exist
ls plans/pending/SUBPLAN_PARITY_W*_*.md | wc -l  # expect: 9

# FCC roadmap line added
grep "SUBPLAN_LEFT_PANEL_FCC" plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md  # expect: at least 1 match

# Source subplans still in pending (to be archived next)
ls plans/pending/SUBPLAN_PARITY_0*_*.md | wc -l  # expect: 9 (SP00 still here pending closure, + SP01-SP08)
```
