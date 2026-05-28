---
status: DONE
executed: 2026-05-27
identity: OWNER
permissionMode: ask
---

# PLAN_SLOP_SWEEP_POST_CSV_XLSX_MIGRATION

## Context

User invoked `/final-q /ultrathink` to adversarially audit the prior session's GREEN closure of `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION`, then mid-audit asked: "what about deleting bullshits like `clients/encore/test_cases_csv`... what else /slop is still not yet cleaned up? and what about encore deliverables, is it clean or junked? make sure its as good as it was before all these changes!"

The adversarial audit revealed the prior /final-q GREEN was mechanically correct (manifest landed, INDEX updated, activity log row written, parity PASS) but **overly optimistic about cleanup completeness**. Multiple slop layers remained:

- 6 garbled `C:Users...` scratch files (~544 KB) at repo root from bash/Windows path mishaps
- 14 scratch audit scripts in `scripts/` (`audit-left-legal-LI-*.mjs` + `audit-pri-ssl-overview-v2.mjs`, ~85 KB)
- Empty `.gitkeep`-only `clients/encore/test_cases_csv/` directory still tracked at HEAD
- `~$encore_test_cases.xlsx` lock file (Excel currently open, PID 35720)
- `--from-csv` mode + `CSV_DIR` constant in `export_test_cases/to-xlsx.ts` (~50 lines, Phase D explicitly called for removal — NOT done)
- `scripts/xlsx-vs-csv-parity.mjs` (14.6 KB) — defunct (no CSVs left to compare)
- `scripts/shared-paths.ts:102` — `exports: clientPath('test_cases_csv')` DEPRECATED line, marked but not deleted
- `scripts/check-tc-parity.ts:103-104` — defensive existsSync guard now permanent dead code
- `package.json` — `xlsx:vs-csv-parity` + `check:tc-parity:fix --fix-csv` script entries point at defunct paths
- `.gitignore` — missing `~$*.xlsx` (Excel lock) and `C\:*` (Windows-path mishap) patterns

**Ship-target assessment**: 10+ CSVs still tracked at HEAD. `npm run client:ship` produces `git archive HEAD clients/encore/` — until working-tree deletions land in a commit, the next ship would re-deliver the old CSVs.

## Goal

Drive the deliverable repo to a clean post-migration state that matches the parent plan's intent: zero CSV remnants, zero scratch artifacts, zero defunct CSV-mode code paths, and a `.gitignore` armored against the two slop patterns that recurred this week.

## Two-tier scope

### Tier 1 — Pure slop sweep (LOW RISK, ~10 min)

Non-code artifacts. No behavior change.

**A. Repo-root scratch files** — delete 6 garbled-path files (`C:UsersrutviAppDataLocalTemppri_csv_ids.txt`, `..._pri_xlsx_ids.txt`, `..._ssl_csv_ids.txt`, `..._ssl_xlsx_ids.txt`, `..._xlsx-dump-full.txt`, `C:Usersrutviprojectsencore_framework.xlsx-dump-tmp.txt`).

**B. Scratch audit scripts** — delete 14 files from `scripts/` (`audit-left-legal-LI-v2*.mjs` × 5, `audit-left-legal-LI-v3*.mjs` × 8, `audit-pri-ssl-overview-v2.mjs` × 1).

**C. Empty CSV directories** — `git rm clients/encore/test_cases_csv/.gitkeep` + `rmdir clients/encore/test_cases_csv` + `rmdir export_test_cases/exports/`.

**D. Excel lock file** — close Excel + delete `clients/encore/test_cases_xlsx/~$encore_test_cases.xlsx`. **HALT here if Excel cannot be closed** — flag and skip, do not force-close.

**E. `.gitignore` additions** — append `~$*.xlsx`, `~$*.xls`, `/C:*` patterns with comments.

### Tier 2 — Defunct CSV-mode code removal (MEDIUM RISK, ~30 min)

Code changes. Phase D of the parent plan explicitly required this; this tier finishes Phase D.

**F. `export_test_cases/to-xlsx.ts`** — remove `--from-csv` mode (`buildFromCsvSource()` function, branch in `buildWorkbook`, CLI arg parsing + messaging, header comments). Verify `--list-only` remains operative.

**G. `scripts/xlsx-vs-csv-parity.mjs`** — delete entirely (14.6 KB defunct).

**H. `scripts/shared-paths.ts:102`** — remove the `exports: clientPath('test_cases_csv')` line.

**I. `scripts/check-tc-parity.ts`** — remove CSV fallback machinery (`getCsvTcIds()` + caller + display + `--fix-csv` handler + header comment).

**J. `package.json`** — remove 3 defunct entries (`xlsx:vs-csv-parity`, `check:tc-parity:fix`, `_xlsx:build:_comment`).

## Ship-state remediation (parallel to scope tiers)

Independent of Tier 1/2 execution, the ship-target needs a coherent commit before next `npm run client:ship`. **Commit is the user's call** — proposed message documented in /final-q chat output but not executed.

## Verification (post-execute, by tier)

After Tier 1: filesystem free of `C:Users` files, audit scripts, empty CSV dir; `.gitignore` covers new patterns.

After Tier 2: `npm run check:tc-parity` PASS, `npm run xlsx:lint` PASS, no residual `--from-csv` / `xlsx-vs-csv-parity` / `fix-csv` / `getCsvTcIds` / `buildFromCsvSource` symbols in active code paths.

## Non-goals / out of scope

- Pushing commits to remote
- Pushing to the `encore_deliverables_test` repo — JBS-human channel
- Renaming or restructuring any migration outputs that already landed
- Touching FCC template SSL-031..044 Steps (flagged INTENTIONAL by prior session)
- Pre-existing activity-log timestamp violations on rows 363/364
- The GARDENER row at line 366 being chronologically out-of-order
- Modifying `sp00-augment-logic.ts` from-csv branch (still standalone-callable; deferred for separate plan)
- Deleting `audit-lo-parity.mjs` (out of strict plan scope, same migration-session vintage)
- Deleting `triage-plans-csv-references.mjs` and `sp00-audit-v5.mjs` (likely defunct; APPEND for separate plan)

## Execution Summary

**Executed**: 2026-05-27 (via `/execute /ultrathink` from scratch path `~/.claude/plans/whimsical-sparking-anchor.md`)

Both Tier 1 (A, B, C, E) and Tier 2 (F, G, H, I, J) landed. Tier 1.D SKIPPED per HALT clause (Excel held workbook open).

### Tier 1 outcomes

- **1.A — 6 `C:Users*` files**: DONE. Removed via `rm ./C:Users*` with `./` prefix to override Windows drive-prefix interpretation. Post-verify `ls ./C:Users*` returned no matches.
- **1.B — 14 audit scripts**: DONE. 5 v2 + 8 v3 + 1 ssl-overview, all under `scripts/`. `audit-lo-parity.mjs` deliberately NOT touched (not in plan's 14-file list).
- **1.C — empty CSV dirs**: DONE. `git rm clients/encore/test_cases_csv/.gitkeep` auto-removed the dir; `export_test_cases/exports/` rmdir OK.
- **1.D — Excel lock**: SKIPPED. Excel PID 35720 still open (MainWindowTitle `encore_test_cases - Excel`). Plan HALT clause invoked. `.gitignore` now covers `~$*.xlsx` so the lock stays out of commits regardless. User can `rm clients/encore/test_cases_xlsx/~$encore_test_cases.xlsx` post-close if it persists.
- **1.E — .gitignore patterns**: DONE. Appended `~$*.xlsx`, `~$*.xls`, `/C:*` (3 patterns + 2 comment lines + 1 blank separator) at the end of `.gitignore`.

### Tier 2 outcomes

- **2.F — `export_test_cases/to-xlsx.ts`**: DONE. Removed `buildFromCsvSource()` function (~73 lines), the `opts.mode === 'from-csv'` branch in `buildWorkbook`, `--from-csv` CLI arg parsing + messaging, and cleaned up header doc. `CSV_DIR` const + `loadCsvLookup()` retained as defensive dead-code (return empty when dir absent) — plan-strict (plan said remove the MODE, not the supplementary lookup). Total ~95 lines changed.
- **2.G — `scripts/xlsx-vs-csv-parity.mjs`**: DONE. `rm scripts/xlsx-vs-csv-parity.mjs` — 14.6 KB gone.
- **2.H — `scripts/shared-paths.ts`**: DONE. Removed `exports: clientPath('test_cases_csv')` line from `SHARED_PATHS`. Verified zero other callers via grep — only `check-tc-parity.ts:102` referenced it (removed in 2.I).
- **2.I — `scripts/check-tc-parity.ts`**: DONE. Removed `getCsvTcIds()` function entirely, the call site, the CSV-fallback console.log clause, and the `--fix-csv` handler (~30 lines total). Main docstring rewritten to drop CSV-fallback prose.
- **2.J — `package.json`**: DONE. Removed `xlsx:vs-csv-parity`, `check:tc-parity:fix`, and `_xlsx:build:_comment` script entries.

### Plan-deviations (LR-046 log)

1. **Tier 2.F scope expansion** — plan said `~50 lines` for `--from-csv` mode removal. Actual was ~95 lines because the `buildFromCsvSource()` function body (~73 lines) had to go with the mode that called it. WHY: only call site was the from-csv branch, so leaving it would be unreachable code. Plan acknowledged the function name in passing but didn't enumerate it.
2. **Tier 2.F — `loadCsvLookup()` retained as defensive dead-code** — plan said "remove `--from-csv` mode" not "remove all CSV-supplementary code". `loadCsvLookup()` is invoked from `buildFromMdSource()` for Specific Field + Tags backfill. Post-Phase-D, `fs.existsSync(CSV_DIR)` returns false, so it short-circuits to empty maps — graceful no-op. WHY: minimizes blast radius; plan-strict; future cleanup can remove if MD format extends to carry Specific Field directly.
3. **Tier 2.F — `default arg adjustment` was a no-op** — plan said "adjust default arg" but the existing default `let mode: AugmentMode = 'list-only';` is already correct. No change needed.
4. **Tier 2.I scope expansion** — plan said `lines 103-104` (the `existsSync` guard + `csvFiles` block). Actual change removed the whole `getCsvTcIds()` function (lines 99-112), its call site (line 137), the CSV-fallback display clause (line 149), the entire `--fix-csv` handler (lines 181-189), and the main docstring's CSV references. WHY: removing only `lines 103-104` would leave `getCsvTcIds()` definition referencing the now-removed `SHARED_PATHS.exports` (Tier 2.H), causing a runtime undefined access. Coordinated full removal was required.
5. **Tier 2.H — workbook comment line touched** — plan only said remove the `exports:` line. I also rewrote the trailing comment on the surviving `workbook:` line to make the post-Phase-D state explicit. Comment-only.
6. **Tier 1.B — `audit-lo-parity.mjs` NOT deleted** — plan's 14-file list does NOT include this script. Same migration-session vintage (mtime 2026-05-27 10:41). FLAGGED for separate decision. Strict plan adherence.
7. **Phase 2.5 DO-NOW expansion** — 4 stale-comment fixes in adjacent files (NOT in plan): `export_test_cases/humanize.ts`, `scripts/xlsx-dump.ts`, `export_test_cases/sp00-augment-logic.ts` (two locations). These referenced deleted `xlsx-vs-csv-parity.mjs` and `buildFromCsvSource()`. Comment-only, same module surface, no logic change. `/execute` Phase 2.5 explicitly authorizes DO-NOW for same-identity/same-module/5-min/no-user-input items.

### Verification evidence

- `npm run check:tc-parity` → `Spec TCs: 350, Markdown TCs: 477, XLSX TCs: 477, PASS`
- `npm run xlsx:lint` → `rows scanned: 490, categories: 0, total hits: 0, PASS`
- `npx tsc --noEmit` → 0 errors in touched files (pre-existing parse errors in `scripts/build-framework-vendor.ts` — known-dead-code per `package.json` `_vendor_deprecation_note`, last commit `f99eed7`)
- Residual grep `from-csv|xlsx-vs-csv-parity|fix-csv|getCsvTcIds|buildFromCsvSource` excluding `plans/` → only historical-context comments in `export_test_cases/to-xlsx.ts` (lines 177, 213, 410, 411) and the still-standalone `export_test_cases/sp00-augment-logic.ts` from-csv branch (out of plan scope)
- `npm run xlsx:build` NOT RUN — Excel still has workbook open; rebuild would fail Windows file lock. Workbook in tree was built fresh by prior session at 14:53 today; current state remains valid

### Ship-target status

Working tree contains all migration deletions + the workbook. HEAD still has the 10 tracked CSVs in `clients/encore/test_cases_csv/` (per `git ls-tree`) until a commit lands. Per plan scope, **commit is the user's call** — staging looks coherent for a single closure commit covering: XLSX workbook + CSV deletions + spec/page-object/selector/fixture/infra/plan changes from the migration session + the slop-sweep deletions from this session + the `.gitignore` + the `package.json` + `.githooks/pre-commit` additions.

### Outstanding follow-ups (APPEND, not in scope)

1. User to close Excel and `rm clients/encore/test_cases_xlsx/~$encore_test_cases.xlsx` if it persists (Tier 1.D residual).
2. User to decide on `scripts/audit-lo-parity.mjs` (likely same vintage as 14 just-deleted scripts).
3. Future plan: clean up `export_test_cases/sp00-augment-logic.ts` from-csv branch (no callers remain post this plan; type union narrows).
4. Future plan: assess `scripts/triage-plans-csv-references.mjs` and `scripts/sp00-audit-v5.mjs` (likely defunct meta-scripts).
5. Future plan: assess `xlsx:build:list-only` vs `xlsx:build` `package.json` duplication (both invoke `--list-only`).
6. User commits and pushes when ready.
