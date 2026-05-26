# SUBPLAN_PARITY_03 — Tooling, MD Fixes, CSV Re-Export [SUPERSEDED]

**Status**: SUPERSEDED
**Superseded by**: `SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md`
**Superseded date**: 2026-05-26
**Reason**: Restructured into Wave 1 with explicit internal ordering (schema reconciliation FIRST per auditor R2-P1-3) + absorbed CSV-side of former SP02 (C3 local-office CSV split).

### Execution Summary (LR-027)

- Tasks: D1 exporter + D2 template + A1-A5 MD edits + CSV re-export + sanity scripts + red-flag catalog
- Implemented: 0 (none executed; restructured before run)
- Routed to W1-02: ALL D1-D2 + A1-A5 + sanity scripts + red-flag catalog + NEW: GP-2 schema reconciliation, GP-3 content cleansing, GP-4 Notes ID/FCC reconciliation (auditor additions)
- Traceability artifact: `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`

---

**Parent**: `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`
**Phase**: 4 + 5 + 6 of parent (SUPERSEDED)
**PermissionMode**: auto
**BrowserTool**: none
**Skills**: /execute, /regression-guard
**Identity**: GARDENER (tooling + docs)
**Created**: 2026-05-20

## Change Log (for future audit)

- **2026-05-25 (same-day revert)** — Prior 2026-05-25 SP00 cross-thread additions reverted. SP00 was directionally reversed + consolidated in the same session: it generates throwaway demo CSVs and reverts source CSVs without ever adding `.fixme` stubs to specs. Drift Check "SP00 awareness" note + Step 14a "post-export SP00 re-run" are no longer applicable and were removed. SP03's real durable CSV exporter is unaffected by SP00's throwaway demo cycle. Original pre-2026-05-25 SP03 content unchanged. Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`.

---

## Bootstrap (read first)

1. `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — sections A, D1-D2, per-module MD fixes in B
2. Existing CSV exporter — locate by `Glob clients/encore/scripts/*test-case*` or `Grep "test_cases_csv" clients/encore/scripts`
3. `clients/encore/specs_planning/_internal/test-case-template.md` — the template that drives MD authoring
4. All 13 MD test-case files at `clients/encore/specs_planning/test-cases/setup/{locations,local-office}/*.md`
5. SUBPLAN_PARITY_02 closure note (LOS split must be done before this subplan runs)

## Drift Check (MANDATORY FIRST STEP — do not skip)

**Evidence discipline binding (per parent §rule 4)**: every claim needs proof — fresh Read/Grep/Bash output, cited with file:line. Banned: "I assume", "should be", "probably", "seems to". Re-Read every MD before Edit; spot-Read after Edit. Exporter "fixed" claim requires actual idempotent re-run output (not source-read inspection). 2-failure stop → switch to artifact-first RCA. Closure requires an Evidence Audit table.

Authored 2026-05-21. Other plans may have landed since. Before any edit:

1. **Re-Glob** every MD at `clients/encore/specs_planning/test-cases/setup/**/*.md` — confirm 13 still exist.
2. **Re-Grep** `**Automation File**:` lines across all MDs; confirm count of stale `tests/specs/setup/...` paths matches parent's "9 MD files" claim (could be 0 if SP-XYZ already fixed paths; could be 9; could be different).
3. **Re-Grep** each MD's header count vs `## TC-` body count for the 5 modules listed in A2 (currency, legal, pricing, account_address, shared_setup_locations) — confirm header still wrong.
4. **Cross-check parent's per-module §B rows** — for each module, has the MD already been edited by another plan?
5. **Re-Glob** `clients/encore/scripts/` for the CSV exporter — confirm it still exists at the expected path (and still merges LOS).
6. **Read activity log** for entries since 2026-05-21 touching `test-cases/`, `test_cases_csv/`, or `scripts/`.
7. **Emit a Drift Note** with per-module verdict. If >30% of scope is stale → HALT and request re-planning.

---

## Scope (IN)

- D1: update CSV exporter — emit 1 CSV per MD (no merging); carry corrected `Automation File` path; tested against all 13 MDs
- D2: update MD template — replace `tests/specs/setup/...` with `specs/...` in any path examples
- A1: in every MD with `**Automation File**:` field, replace `tests/specs/setup/...` path with `specs/...`
- A2: fix MD header counts where they disagree with body section count (currency 28→27, legal 19→18, pricing 35→33, account_address 29→28, shared_setup_locations 25→24)
- A3: sync MD Status fields (auto_addon Manual→Automated, pricing mixed→honest split, shared_setup_locations Automated→Partial 75%)
- All per-module MD edits in parent §B (header fixes, adding missing `Automation File` lines, inline reason notes for DROPPED TCs, etc.)
- A4 + A5: re-export ALL 13 CSVs after MD edits land
- **NEW — CSV Cleanliness Sanity Check** (canonical home — other subplans reference this): author `clients/encore/scripts/ci/check-csv-sanity.mjs` and run it on all 13 re-exported CSVs. Script checks:
  - **Content leaks** (must NOT appear in any CSV cell): agent identity strings (HUNTER/GIVER/BUILDER/HEALER/WATCHDOG/GARDENER/OWNER), `PLAN_`/`SUBPLAN_`/`SP-`/`SP_` refs, `LR-NNN`/`LR-ENC-NNN` rule cites, `.claude/`/`clients/encore/`/worktree paths, "TODO"/"FIXME"/"XXX"/"WIP"/"TBD"/"lorem"/"asdf", `playwright-cli`/`MCP`/`expect(`/`test.skip`/`test.fixme` (framework jargon), worktree refs like `loving-allen-408532`, `cloudapps-e2e.encoreglobal.com` (env URL leak — Office 1604 is fine)
  - **Character red flags**: BOM (U+FEFF) at file start, smart quotes (" " ' '), em/en-dash where `-` expected (— –), non-breaking space (U+00A0), zero-width chars (U+200B/200C/200D), mojibake patterns (Ã©, â€™), mixed CRLF+LF in same file, trailing whitespace, control chars (<0x20 except `\n`/`\r`/`\t`)
  - **Formatting leaks**: leftover markdown (`**bold**`, `*italic*`, `_underscore_`, `\`code\``, `# heading`), HTML entities (`&amp;`, `&lt;`), literal escape chars (`\n`, `\t`), footnote markers (`[1]`, `[^1]`)
  - **Structural red flags**: empty required cells (TC ID, Title, Steps, Expected can NOT be blank), unclosed quotes (CSV parse failure), inconsistent column count per row, duplicate TC IDs within one file, rows ending mid-word (truncation), extra blank lines between rows, header row doesn't match agreed 12-column schema (post-SP00 v13 augment: original 9 cols TC ID/Title/Module/Submodule/Specific Field/Preconditions/Steps/Expected Result/Notes + 3 new cols Automated/Automation Execution/If Failed Reason of Failure)
  - Script exits 1 on ANY finding; emits a per-CSV report at `.claude/state/csv-sanity-<YYYY-MM-DD>.json`
- **NEW — Red-flag pattern catalog** (canonical, monotonically growing): author `clients/encore/scripts/ci/red-flag-patterns.json` with sections `{content_leaks, character_red_flags, formatting_leaks, structural_red_flags, comment_red_flags}`. Seed entries cover the parent §"In-depth quality" starter list. Each entry shape: `{pattern: <regex or literal>, category, discovered_by_subplan: "SP03", discovered_date: "2026-05-21", allow_list_paths?: [...], description}`. Both sanity scripts (CSV + comment) read this catalog at runtime — every new entry locks out that pattern across the whole repo forever.
- **NEW — Comment / MD Cleanliness Sanity Check** (canonical home for code comments + MD body — referenced by every other subplan): author `clients/encore/scripts/ci/check-comment-sanity.mjs`. Scope: every `.spec.ts`, `.page.ts`, selectors `.ts`, `.data.ts`, exporter `.mjs`, and every MD under `specs_planning/test-cases/`. Loads patterns from `red-flag-patterns.json` (catalog-driven, not hardcoded). Allow-list flag for legitimate context (e.g., the literal string "Office 1604" in code is allowed).
- **NEW — Refactor `check-csv-sanity.mjs` to read from the same catalog** — no hardcoded red-flag lists in the script body; everything sources from `red-flag-patterns.json` so future graduations affect both scripts.
- **Quality sweep on every MD this subplan touches** — while editing each MD's header/path/status, scan the MD body for the red-flag list and clean inline. Document removals as one-liners in the closure note (not as deviations — quality cleanup is in-scope per parent §"In-depth quality").
- LR-050: enumerate every stale `tests/specs/setup/...` reference IN-SCOPE — grep entire repo, rewrite all

## Scope (OUT)

- No spec edits (Phases 7 territory)
- No new MD content (no inventing TCs that don't exist — that's SUBPLAN_PARITY_05 LI add-back territory)
- No CI guardrail wiring (SUBPLAN_PARITY_08)
- No live walks (this is a doc + tooling session)

## Step-by-step

1. **`/regression-guard` snapshot** before any edit
2. **Locate exporter**: `Glob clients/encore/scripts/*` + `Grep "fs.writeFile.*csv"` to find the CSV-emit code path
3. **D1**: update exporter to:
   - read each MD individually, emit one CSV per MD
   - never merge multiple MDs into one CSV (was happening for LOS: BAS+HIS+ECT)
   - propagate `**Automation File**:` path verbatim from MD into CSV header row or skip column
4. **Unit-test exporter**: run it against test_cases/setup/locations/locations_currency_test_cases.md, confirm output matches existing CSV row-for-row (modulo path)
5. **D2**: rewrite MD template path examples to `specs/...`
6. **A1**: for each of the 9 MDs with `**Automation File**:`, sed/replace `tests/specs/setup/` → `specs/`. Verify file actually exists at new path after edit.
7. **A2**: fix headers — edit each MD individually, change `Test Cases: N` to actual body count
8. **A3**: edit MD Status fields per parent §B
9. **Per-module MD edits in B**:
   - account_address: add `**Automation File**: specs/locations/location-account-address.spec.ts` (was missing). Add CSV TC-028 step 1 ("Read current venue name") — handled in CSV re-export from updated MD. Reconcile TC-015 wording. Add DROPPED reason inline for TC-021 + TC-024.
   - auto_addon: add `**Automation File**:` line. Flip Status.
   - local_information (LI add-back belongs to SUBPLAN_PARITY_05; this subplan only fixes path + count)
10. **A4 + A5**: run updated exporter against all 13 MDs; output to `clients/encore/test_cases_csv/`. Confirm 13 CSVs land (was 10 before — adds notes, local_office_history, local_office_ect; splits LOS CSV).
11. **Author `clients/encore/scripts/ci/check-csv-sanity.mjs`** per the Scope IN definition above (content leaks, character red flags, formatting leaks, structural red flags). Include each red-flag class as a separate check function so failures point at the exact category. Provide an `--allow-list` flag for known-safe exceptions (e.g., Office 1604 is OK even though it's an Encore-specific identifier).
12. **Run CSV sanity check**: `node clients/encore/scripts/ci/check-csv-sanity.mjs clients/encore/test_cases_csv/*.csv` — must exit 0. Any findings → fix in MD (CSVs are exports, not source) and re-run exporter.
12a. **Author `clients/encore/scripts/ci/red-flag-patterns.json`** — the monotonically-growing catalog (parent §"Mission: find all + permanent prevention"). Seed with parent's starter list. Each entry: `{pattern, category, discovered_by_subplan, discovered_date, allow_list_paths?, description}`.
12b. **Author `clients/encore/scripts/ci/check-comment-sanity.mjs`** — reads patterns from `red-flag-patterns.json` (no hardcoded list). Same exit-1-on-finding semantics, JSON report at `.claude/state/comment-sanity-<YYYY-MM-DD>.json`.
12c. **Refactor `check-csv-sanity.mjs`** to source from the same `red-flag-patterns.json` (replace hardcoded lists from step 11 with catalog reads).
12d. **Exhaustive discovery pass** on all 13 MDs + exporter + template: scan manually beyond the script's catch for NEW patterns (per parent §"Mission" step B). For every new pattern found, append to `red-flag-patterns.json` with provenance, re-run scripts, then clean artifacts. Iterate until scripts exit 0 AND manual scan finds nothing additional.
12e. **Run both sanity checks**: `node clients/encore/scripts/ci/check-comment-sanity.mjs clients/encore/specs_planning/test-cases/**/*.md clients/encore/scripts/test-case-export.* clients/encore/specs_planning/_internal/test-case-template.md` AND `node clients/encore/scripts/ci/check-csv-sanity.mjs clients/encore/test_cases_csv/*.csv` — both must exit 0.
13. **LR-050 grep sweep**: `grep -r "tests/specs/setup/" clients/encore/` — must be empty post-fix. Same for any stale `tests/specs/` reference in docs.
14. **`/regression-guard` diff**: structural fingerprint should show 13 MD edits, 1 exporter edit, 1 template edit, 13 CSV files (some new, some updated), 1 new sanity-check script, 1 sanity report artifact

## Verification

- Every MD's `**Automation File**:` points at a file that exists at `clients/encore/specs/...`
- Every MD's header count matches actual `## TC-` body count
- `clients/encore/test_cases_csv/` has 13 CSV files (was 10)
- No stale `tests/specs/setup/` reference anywhere in `clients/encore/` (excluding `.claude/worktrees/`)
- Exporter is idempotent (running twice produces identical output)
- **`check-csv-sanity.mjs` script exists and exits 0 on all 13 CSVs** — sanity report at `.claude/state/csv-sanity-<date>.json` shows zero findings across content / character / formatting / structural categories
- `/regression-guard` post-snapshot matches expectation

## Reflect + Graduate (mandatory before /final-q)

Per parent §rule 5. Workflow per root-cause mistake found:

1. **Reflection seed for SP03** — likely mistakes to investigate:
   - Why did MD `Automation File` paths drift unchallenged after the 2026-05-19 restructure? No existing CI check that `**Automation File**:` paths resolve — the structural answer (D4 in this plan) IS that prevention.
   - Why did CSV exporter merge BAS+HIS+ECT into one CSV from 3 separate MDs? No "one MD = one CSV" convention rule? Or one exists but exporter logic predated it?
   - Why did MD header counts drift from body section count? No CI check (D3 fixes structurally) — but is there a memory rule that says "MD header must match body"? If yes, why didn't it fire?

2. **Pre-graduate check** — Grep agent-mistakes.md / LEARNED_RULES.md / .claude/rules/ / feedback_*.md / clients/encore/CLAUDE.md.

3. **Decision**: most SP03 mistakes likely have NO existing learning (this is net-new tooling territory). Add new LR-NNNs in canonical location with `Graduated from: SUBPLAN_PARITY_03`. The STRUCTURAL fix (D3/D4 CI checks) is already in scope of SP08 — note the connection in each new LR's body.

4. **Emit Reflection table** in `/final-q`:

   | Root-cause mistake | Already-existing learning? | Action taken |
   |---|---|---|

5. **Anti-duplicate check** — Grep similarity; >70% → rollback + structural escalation.

Closure-gate rejects if Reflection table missing, near-duplicate added, or mistake mapped to "more reading" actions.

## Closure

- LR-028 activity log entry
- LR-050 cleanup roster appended
- `/final-q` GREEN required before moving to `plans/done/`
