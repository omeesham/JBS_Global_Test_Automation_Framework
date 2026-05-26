# SUBPLAN_PARITY_W1_02 — Tooling + MD Edits + CSV Re-Export + Local-Office CSV Split

**Status**: DONE-SUPERSEDED
**Priority**: P0
**Created**: 2026-05-26
**Closed**: 2026-05-26 (superseded, never executed)
**Identity**: GARDENER
**Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
**Depends on**: SUBPLAN_PARITY_W1_01_DECISIONS_AND_DRIFT_PRETRIAGE.md
**Blocks**: ~~SUBPLAN_PARITY_W1_03_LOCAL_OFFICE_CODE_SPLIT.md, SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md~~ (downstream subplans now depend on PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md Phase 0 + Phase A-B instead)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Superseded-By**: [PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md](PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md)

---

## SUPERSEDED-BY notice (2026-05-26)

This subplan is **closed-as-superseded** before execution. The colleague's deliverable target changed from "11 per-module CSVs" to "one multi-sheet XLSX workbook" — see [PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md](PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md) for the new direction.

**Routing of W1-02's original tasks** (every task accounted for — LR-040 closure completeness):

| Original W1-02 task | New destination | Rationale |
|---|---|---|
| D1/D2 exporter fix + MD template path | XLSX plan Phase A — `export_test_cases/to-xlsx.ts` replaces `to-csv.ts`; old exporter `git rm`'d in Phase D | exporter format flips wholesale |
| A1 MD `Automation File:` path updates (9 MDs) | XLSX plan **Phase 0** prereq | MD-side prereq for clean workbook build |
| A2 MD header count fixes (5 modules) | XLSX plan **Phase 0** prereq | MD-side prereq |
| A3 MD Status sync (3 modules) | XLSX plan **Phase 0** prereq | MD-side prereq |
| A4/A5 CSV re-export (whole pipeline) | **DROPPED** — Phase D deletes all CSVs | CSV deliverable retired |
| §B per-module file-only MD edits | XLSX plan Phase 0 prereq (rolls into A1/A2/A3 work) | MD-side absorbed |
| `check-csv-sanity.mjs` authoring | W1-05 (REWRITE → `check-xlsx-sanity.mjs`) | sanity gate target flips to XLSX |
| `check-comment-sanity.mjs` authoring | W1-05 (D14 micro-phase absorbed) | unchanged target (comments not CSV) |
| `red-flag-patterns.json` authoring | W1-05 (catalog moved with sanity scripts) | unchanged purpose |
| LR-050 stale-path grep sweep | XLSX plan Phase 0 A1 (rolls into MD `Automation File:` updates) | same grep target, different phase home |
| C3 local-office CSV split into 3 | **DROPPED** — workbook has 3 separate sheets natively (local_office_settings + local_office_history + local_office_ect tabs); no source split needed; merged CSV dies with CSV dir in Phase D | XLSX structure makes CSV split moot |

**Audit trail**: contents below are preserved as-authored for traceability. Do NOT execute this subplan.

---

## Context

W1-02 owns the entire CSV side of the parity restructure end-to-end. The original SP03 covered exporter + MD edits + CSV re-export but SP02 also overlapped on "CSV split into 3" — the auditor flagged this ambiguity. This subplan resolves the overlap: W1-02 owns ALL CSV work; W1-03 only consumes split CSVs (code-side only).

Provenance: restructured from `SUBPLAN_PARITY_03_TOOLING_MD_AND_CSV_REEXPORT.md` + CSV-side of `SUBPLAN_PARITY_02_LOCAL_OFFICE_SPLIT.md` (C3 task) per Wave 1/Wave 2 split (2026-05-26).

**Strict internal ordering** (auditor finding R2-P1-3): schema reconciliation MUST precede re-export, otherwise re-export destroys SP00's added automation columns. Order is non-negotiable.

---

## Bootstrap

**Identity**: GARDENER (tooling + docs + CSV structural)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots)
- `/relevant` (Phase 0.5)
- `/final-q` (Phase 4)

**Context files**:
- `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §A cross-cutting, §B per-module MD edits, §C3 (CSV split), §D1-D2 tooling
- `clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-<date>.md` — Rutvik's E1–E7 answers (specifically E5 smoke_seed, E6 BAS-068)
- `.claude/rules/pipeline.md` (LR-020 verify, LR-035 INDEX auto-gen, LR-046 strict-line, LR-048 minimum, LR-050 cleanup-in-scope, LR-ENC-002 FCC parity)
- `clients/encore/CLAUDE.md` (LR-017 selector namespaces, LR-ENC-001 baseline, LR-ENC-002 FCC parity)
- `export_test_cases/to-csv.ts` + `export_test_cases/markdown-parser.ts` — the exporter
- `clients/encore/specs_planning/_internal/test-case-template.md` — the MD template

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm W1-01 closed GREEN — read its `/final-q` artifact + decision file at `clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-*.md`.
2. Read navigation.md, agent-mistakes.md, patterns.md per `/execute` Phase 0.
3. **BrowserTool announcement**: `BrowserTool=none`. Reason: pure file + tooling work, no live verification.

---

## Phase 1+ — Actual work (STRICT INTERNAL ORDERING)

### Phase 1 — Drift Check (MANDATORY)

1. Re-Glob every MD at `clients/encore/specs_planning/test-cases/setup/**/*.md` — confirm count.
2. Re-Grep `**Automation File**:` lines — count stale `tests/specs/setup/...` paths.
3. Re-Grep each MD's header count vs `## TC-` body count (currency, legal, pricing, account_address, shared_setup_locations).
4. Re-Glob exporter at `export_test_cases/to-csv.ts` — confirm current schema (currently emits 16-col `full` mode; current CSVs are 12-col with `Specific Field`).
5. Read activity log since 2026-05-26.
6. Emit Drift Note. >30% stale → HALT.

### Phase 2 — D1 + GP-2: Schema reconciliation (RUNS FIRST)

The auditor identified a hard schema mismatch:
- Current CSVs on disk: 12-col header = `TC ID, Title, Module, Submodule, Specific Field, Preconditions, Steps, Expected Result, Notes, Automated, Automation Execution, If Failed Reason of Failure`
- Local-office CSV has `Tags` in column 5 (different label, same position)
- Exporter `human` mode emits 10 cols (id, title, module, submodule, tags, status, preconditions, steps, expected, notes) — NO `Specific Field`, NO automation columns
- Exporter `full` mode emits 16 cols (all agent + human)

Reconciliation steps:
1. Decide canonical schema for the deliverable. Recommended: 12-col `deliverable` mode matching current CSVs (so SP00's automation columns are preserved on re-export).
2. Update `export_test_cases/to-csv.ts`:
   - Add a new `'deliverable'` ExportType
   - Add 3 column entries to COLUMNS: `automated`, `automationExecution`, `reasonOfFailure` (all audience `'human'` or new audience `'deliverable'`)
   - Replace `tags` with `specificField` for column 5 (or unify via a per-module override)
   - Drop `status` from `human` mode (current CSVs don't have it)
3. Update markdown-parser to emit `automated` / `automationExecution` / `reasonOfFailure` from MD metadata if present (default empty — SP00 augment-v2 re-populates from spec source).
4. Unit-test the new exporter against `locations_currency_test_cases.md` → confirm output matches current `locations_currency_test_cases.csv` row-for-row (modulo content fixes from this subplan).

### Phase 3 — D2: MD template update

Edit `clients/encore/specs_planning/_internal/test-case-template.md`:
- Replace `tests/specs/setup/...` path examples with `specs/...`
- Add the 3 deliverable columns to the metadata block schema

### Phase 4 — A1: MD `Automation File:` path updates

For each of the 9 MDs with `**Automation File**:` lines, rewrite `tests/specs/setup/` → `specs/`. Use `Read` then `Edit replace_all` per MD. Verify each new path resolves to an actual `.spec.ts` file.

### Phase 5 — A2: MD header count fixes

- currency: 28 → 27
- legal: 19 → 18
- pricing: 35 → 33
- account_address: 29 → 28
- shared_setup_locations: 25 → 24

### Phase 6 — A3: MD Status sync

- auto_addon: Manual → Automated (spec automates 20/20)
- pricing: mixed → honest per-TC breakdown
- shared_setup_locations: Automated → Partial (5 fixmes remain post-SP00)

### Phase 7 — §B per-module file-only MD edits

- account_address: add `**Automation File**:` line (was missing); reconcile TC-015 wording; inline DROPPED reason for TC-021/024
- auto_addon: add `**Automation File**:` line
- ~~local_information: LI-EXTRA MD authoring~~ ALREADY DONE per audit — verify parity only

### Phase 8 — GP-4: Notes ID/FCC reconciliation (NEW per auditor)

Notes module has three-way TC ID drift:
- **MD** (`locations_notes_test_cases.md`): 27 FCC IDs (e.g., `TC-LOC-NTS-FCC-001`)
- **CSV** + **spec**: post-SP00 use normalized non-FCC IDs (e.g., `TC-LOC-NTS-039`)
- **Spec duplicate**: `TC-LOC-NTS-035` appears TWICE — fixme at `location-notes.spec.ts:425` + test at `location-notes.spec.ts:1085`

Reconciliation:
1. Resolve duplicate `TC-LOC-NTS-035` — assign one a new ID. The fixme at line 425 (Delete one-of-one) is older; the test at line 1085 (Save empty row) is newer FCC-derived. Default: rename line 425 to next available (TC-LOC-NTS-062 or similar) since it's blocked anyway. CONFIRM with user before mass-rename.
2. Rename 27 FCC IDs in MD to match CSV/spec normalized IDs. Use SP00's FCC rename ledger as source of truth.
3. Verify three-way parity per LR-ENC-002: MD ↔ CSV ↔ spec all have the same TC ID set.
4. Update parent plan §Findings Notes count if reconciliation changes baseline.

### Phase 9 — GP-3: CSV content cleansing pass

SP00 already did a cleanse pass. Remaining issues to scan for:
- Hardcoded e2e URL (`cloudapps-e2e.encoreglobal.com`) embedded in `Preconditions` / `Steps` cells
- Any residual internal jargon SP00's `cleanCell()` scrub list missed

Adversarial grep across all 11 CSVs. Replace with `<base URL>` placeholder or strip.

### Phase 10 — C3: Local-office CSV split (W1-02 OWNS this — not W1-03)

The current `local_office_settings_test_cases.csv` is a merged file with BAS + HIS + ECT TCs (83 rows total). Per parent §C3:

1. Read merged file. Identify TC prefix per row: TC-LOS-BAS-NNN / TC-LOS-HIS-NNN / TC-LOS-ECT-NNN.
2. Author 3 separate MDs (if not already present) at `clients/encore/specs_planning/test-cases/setup/local-office/`:
   - `local_office_basic_info_test_cases.md` (BAS)
   - `local_office_history_test_cases.md` (HIS)
   - `local_office_ect_test_cases.md` (ECT)
3. Re-export via the new deliverable exporter → 3 separate CSVs:
   - `local_office_basic_info_test_cases.csv`
   - `local_office_history_test_cases.csv`
   - `local_office_ect_test_cases.csv`
4. Delete the merged `local_office_settings_test_cases.csv` (or keep + flag for cleanup in Phase 12).

### Phase 11 — A4 + A5: CSV re-export (LAST — after schema + content + split are done)

Run the updated exporter against all MDs. Confirm output count:
- 11 → 13 CSVs (was 11; +2 from LO split: BAS becomes own, HIS new, ECT new — but LO Settings merge gets dropped, so net 11 + 3 new - 1 merged = 13)
- Or 11 → 12 if the merged file is kept alongside the split files (NOT recommended).

Verify SP00's automation columns survived re-export. If any row lost its `Automated/Automation Execution/Reason` values, re-run SP00's augment-v2 to repopulate.

### Phase 12 — Author sanity scripts + red-flag catalog

Per parent §D:
1. Author `clients/encore/scripts/ci/check-csv-sanity.mjs` — checks content leaks, character red flags, formatting leaks, structural red flags
2. Author `clients/encore/scripts/ci/red-flag-patterns.json` — monotonically-growing catalog
3. Author `clients/encore/scripts/ci/check-comment-sanity.mjs` — same catalog, applied to code comments + MD bodies
4. Run all 3 scripts against current state. They must exit 0 before W1-02 closes.

**Note**: scripts authored here are validators ONLY — wiring into CI happens in W2-09. Per the auditor's R2-P2-3 finding, D11/D15/D16 belong to W2-09.

### Phase 13 — LR-050 stale-slop sweep

`grep -r "tests/specs/setup/" clients/encore/` → must be empty post-fix. Same for any stale path reference in docs.

---

## Per-Identity Satisfaction Matrix (LR-048 v2)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) | n/a |
| GIVER | test-cases.md, test-plans.md, CSV via exporter | 9 MDs path-updated + 5 header counts fixed + 3 Status sync + 3 LO MDs created + 13 CSVs re-exported with deliverable schema | `npm run check:tc-parity` exit 0 + `node scripts/ci/check-csv-sanity.mjs clients/encore/test_cases_csv/*.csv` exit 0 |
| BUILDER | specs/<module>/*.spec.ts | (none) — no spec edits in this subplan | n/a |
| HEALER | per-fix MD update | (none) | n/a |
| WATCHDOG | findings table | (none) | n/a |
| GARDENER | exporter + sanity scripts + catalog | `to-csv.ts` deliverable mode added + `check-csv-sanity.mjs` + `red-flag-patterns.json` + `check-comment-sanity.mjs` | `node export_test_cases/to-csv.ts --mode=deliverable` runs clean + scripts exit 0 |

All non-(none) cells classified (a) MCP-proven (actual run output cited in `/final-q`).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed: DO-NOW / SPAWN / APPEND. Bare "out of scope" = HALT.

---

## Acceptance criteria

- [ ] `to-csv.ts` has new `deliverable` ExportType emitting the 12-col schema with 3 automation columns
- [ ] Every MD `**Automation File**:` resolves to an existing `.spec.ts`
- [ ] Every MD header `Test Cases: N` matches body `## TC-` section count
- [ ] 3 LO MDs exist (BAS / HIS / ECT) + 3 split CSVs exist
- [ ] `clients/encore/test_cases_csv/` has 13 CSVs (was 11; +3 from LO split, -1 merged dropped)
- [ ] Notes ID/FCC reconciliation complete — MD/CSV/spec all align on the same TC ID set; no duplicate IDs in spec
- [ ] No stale `tests/specs/setup/` reference anywhere in `clients/encore/`
- [ ] `check-csv-sanity.mjs` + `check-comment-sanity.mjs` + `red-flag-patterns.json` exist; both scripts exit 0
- [ ] SP00's 3 automation columns survived re-export (spot-check 5 random rows per CSV)
- [ ] `/regression-guard` snapshot before/after = expected diff (exporter + 9 MDs + 13 CSVs + 3 scripts + 1 catalog)
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes
- [ ] `/final-q` verdict block emitted

---

## Verification

```bash
# Exporter has deliverable mode
grep "deliverable" export_test_cases/to-csv.ts  # expect: at least 1 match

# 13 CSVs present
ls clients/encore/test_cases_csv/*.csv | wc -l  # expect: 13

# 3 LO CSVs present
ls clients/encore/test_cases_csv/local_office_*.csv  # expect: 3 files (basic_info, history, ect)

# No stale paths
grep -r "tests/specs/setup/" clients/encore/  # expect: empty

# Sanity scripts exist + green
node clients/encore/scripts/ci/check-csv-sanity.mjs clients/encore/test_cases_csv/*.csv && echo OK  # expect: OK
node clients/encore/scripts/ci/check-comment-sanity.mjs clients/encore/specs_planning/test-cases/**/*.md && echo OK  # expect: OK

# Notes parity (no duplicate TC IDs)
grep -c "TC-LOC-NTS-035" clients/encore/specs/locations/location-notes.spec.ts  # expect: 1 (was 3 pre-fix)
```

---

## Handoff (post-execution)

~~CSV deliverable schema unified; 13 CSVs in place; LO split complete; sanity scripts authored. W1-03 consumes the split CSVs (code-side only). W1-04 consumes the reconciled MD/CSV state for spec fixes.~~

---

## Execution Summary (per LR-027) — closed-as-superseded 2026-05-26

**Outcome**: Not executed. Superseded before kickoff by [PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md](PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md).

**Why superseded**: JBS colleague's deliverable target changed from "11 per-module CSVs" to "one multi-sheet XLSX workbook" (Overview tab + per-module tabs, each ending in a trailing summary row with date). CSV format physically cannot host sheets (RFC 4180 = one flat table). The new XLSX plan absorbs every load-bearing task from W1-02 (MD-side prereqs into Phase 0; sanity scripts re-targeted to W1-05; LO split obviated by native sheet structure) and discards CSV-specific work (exporter rewrite, schema reconciliation, CSV re-export, CSV split) since the entire CSV deliverable retires in Phase D.

**Task routing**: see SUPERSEDED-BY table near top of file. Every original task has a destination — XLSX plan Phase 0 / W1-05 / DROPPED-with-cause.

**Downstream impact**:
- W1-03 (LR-PARITY_W1_03_LOCAL_OFFICE_CODE_SPLIT) — format-agnostic, unaffected. Depends on Phase A workbook build instead of W1-02 CSV split.
- W1-04 (verdict-independent spec fixes) — file-only spec work unaffected. "Targeted CSV refresh" wording flips to "Targeted XLSX rebuild" (REWRITE-light, this session).
- W1-05 (CI local validators) — absorbs sanity scripts + red-flag-patterns catalog + LR-050 grep work originally scoped to W1-02; sanity gate target flips CSV → XLSX (REWRITE, this session).
- Parent plan (PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT) — stays open in pending/; closed by W2-09 final report which cites this supersession.

**Audit cite**: closure decision derived from 3-pass audit on PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION (2026-05-26) + 5-item counter-audit verifying filesystem evidence per finding.

## Post-Closure Note (added 2026-05-26 by SUBPLAN_XLSX_PREP_01)

The TC IDs referenced in this historical execution log using the now-deprecated `-FCC-` segment in their identifier have been retroactively renamed to canonical submodule-only form per the 2026-05-26 naming-policy directive (Rutvik). Canonical mapping lives in `clients/encore/specs_planning/_internal/content-dedupe-audit-2026-05-26.md` §6. This historical record stays as-is (per LR-027 audit-trail principle) — do not rewrite body text.
