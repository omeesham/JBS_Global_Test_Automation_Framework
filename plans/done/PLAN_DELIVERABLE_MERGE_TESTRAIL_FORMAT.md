# PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT — merge both Encore excels into ONE permanent TestRail-layout deliverable

> 🤖 **SESSION BOOTSTRAP — invoke with `/execute PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT.md`.**
> On load: **(1)** `/identity` OWNER. **(2)** read `export_test_cases/module-codes.json` (ID-grammar registry — single source of truth) + `scripts/xlsx-lint-rules.mjs` (C1–C8 + `HEADER_ALIASES`) + `scripts/check-tc-parity.ts` (guardrails 1–7) BEFORE touching the emitter. **(3)** Phase 0 gates first. **(4)** Phases 1→5. **(5)** closure per LR-027 (Status flip + Execution Summary + `git mv` to done + `plans:reindex`) + LR-028 activity-log row.
>
> **HALT + ASK** if: any gate (build self-lint / xlsx:lint / parity guardrails 6-7 / sheet-name test) stays red after 2 evidence-based fix attempts, or a column-name decision would break the registry/guard lockstep in a way not covered below.

**Status**: DONE
**Executed**: 2026-06-11
**Priority**: P1
**Created**: 2026-06-09
**Updated**: 2026-06-11 v2 (rebased onto PLAN_ID_NAMING_AUDIT_AND_REMEDIATION outcomes — see §Rebase — then HARDENED by an evidence sweep: 3 explorer agents + 1 adversarial Plan-agent pass, every load-bearing claim re-verified first-hand at file:line; user rulings 2026-06-11: QA tracker stays separate · with-run gets a REAL fix · this plan executes BEFORE PLAN_DELIVERABLE_QUALITY_UPGRADE)
**Identity**: OWNER
**Parent**: (none)
**Depends on**: PLAN_EXCEL_REVERT_RECOVERY.md (DONE 2026-06-10) · PLAN_ID_NAMING_AUDIT_AND_REMEDIATION.md (executed 2026-06-11 — renames + registry + guards this plan builds on)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## §Rebase (2026-06-11) — what changed under this plan since it was written

The ID/naming audit (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION) landed the following — every item below is ALREADY DONE and this plan must build on it, not re-do or undo it:

1. **All Corporate Pricing IDs renamed**: `TC-LOC-CPR-NNN` (band-numbered) → `TC-CPR-{SRC|STR|DET|NPB|OVR|TIO}-NNN` (001-based per screen). LI grammar normalized (`NE-*` folded to `TC-LOC-LI-078..114`, `SKIP-BILLING` → `LI-070`). Rename map: `clients/encore/specs_planning/_internal/id-audit-2026-06-10/id-rename-map.csv`.
2. **ID-grammar registry exists**: `export_test_cases/module-codes.json` — module/submodule codes, sheet ownership, gap ledger, bug grammar. `to-csv.ts` derives Module/Submodule cells from it; `KNOWN_SUB_CODES` (types.ts) is parity-asserted against it.
3. **Semantic guards exist and are wired into every gate**: parity guardrails 6 (ID↔dir/file/sheet congruence, registry-driven; 6d reads the workbook's `Module`/`Submodule` cells; 6f blocked-reasons/allowlist liveness; 6g gap ledger) + 7 (BUG grammar), and lint **C8** (per-row Module/Submodule cells + ID-prefix ↔ sheet owner; STRICT for the file named `encore_test_cases.xlsx`). Negative-tested against the pre-fix workbook (162 C8 hits).
4. **`HEADER_ALIASES` exists in `xlsx-lint-rules.mjs`** (`ID`→`TC ID`, `Sub-Module`→`Submodule`, `Steps (Step)`→`Steps`, `Steps (Expected Result)`→`Expected Result`) — added to close the TestRail-format false-green; **becomes load-bearing for the merged file** if TestRail-style headers are kept.
5. **Overview already has the `Manual` column** (`Total = Automated + Pending + Manual` reconciles) — the original plan's Overview item is DONE; do not re-add.
6. **Corp sheet names + display names are pinned** in `SHEET_NAMES`/`SHEET_DISPLAY_NAMES` (no more silent fallback). `_gen-testrail.ts` still exists and still emits the second workbook — retiring it remains THIS plan's job. (This also ANSWERS the open question in PLAN_ID_NAMING_AUDIT_AND_REMEDIATION Phase 6 — "promote or retire `_gen-testrail.ts`" → **retire**.)
7. **Hardening sweep (2026-06-11)**: every workbook consumer was mapped and verified first-hand. Three explorer-agent claims were REFUTED on inspection — lint C6 (`xlsx-lint-rules.mjs:414`), C8 (`:457`) and planner-post-complete Q4 (`countXlsxRowsForModule`, `:606`) already filter blank-TC-ID rows, so step-expanded continuation rows do NOT break them. The §Verified-safe consumers section below is the DO-NOT-TOUCH list; the new findings are folded into the sections that follow.

## Context (why)

Two generated artifacts exist today: `encore_test_cases.xlsx` (main — flat one-row-per-case, Overview dashboard + per-sheet SUMMARY + real status columns) and `encore_test_cases_testrail.xlsx` (TestRail "Test Case (Steps)" export — step-expanded rows, lossy: collapses status into `Automation Type`). Senior approval: **consolidate to ONE permanent deliverable** that succeeds both — TestRail step-expanded rows/columns AND Overview + SUMMARY AND real status columns — **generated from the single MD source**, held to the same lint/parity/ship gates so the new shape is self-enforcing.

## Locked intent

- **One file, generated.** The merged workbook **becomes** `SHARED_PATHS.workbook` (`encore_test_cases.xlsx`); the testrail file + its converter are **retired**. Sole output of `npm run xlsx:build`. (Keeping the filename also keeps lint C8 in STRICT mode — it keys on this basename.)
- **Rows/columns = TestRail step-expanded layout**, with `Automation Type` **replaced by the real status columns**: `Coverage Status` + `Automation Status` (+ the blocked-reason content via the merged Notes column below).
- **Per-step Expected:** keep the auto-generated middle-step expecteds (final step = authored expected). *(user choice)*
- **Notes + Reason → ONE column (`Notes / Reason`)**: reason leads with its `Blocked — ` marker (machine-detectable), Notes appended under a `Notes:` label when both present. *(user choice; composition rules unchanged — see §Notes/Reason merge)*
- **Test Data column: kept + sanitized + improved** — strip the banned host, drop `(existing fixture)`/`(created by Planner)`/raw role; add an "automation user" line; labels from config, not hardcoded. *(user choice)*
- **Naming (LOCKSTEP-CRITICAL, updated 2026-06-11):** key column stays **`TC ID`** (not `ID`) and the submodule column stays **`Submodule`** (not TestRail's `Sub-Module`) — parity guardrail 6d and C8 read `Module`/`Submodule` cells BY NAME without aliasing in check-tc-parity; keeping canonical names means **zero guard churn**. (If TestRail import strictly requires `Sub-Module`, the alternative is extending guardrail 6d to consult `HEADER_ALIASES` — extra code for no content gain; default = canonical names.)

## Per-module branch ship constraint (added 2026-06-11 — user-raised)

Encore receives deliverables **per module branch** on the mock (`RutviK-JBS/encore_deliverables_test`, 5 branches: notes / ssl / legal / account-address / corporate-pricing — gh-api verified 2026-06-11: ALL FIVE currently carry the testrail twin). The ship pattern (navigation.md "Push per-branch deliverables" row, 2026-06-10) is: `git archive` extract → trim `tests/` to the module's surface dir + `auth.setup.ts` → trim `encore_test_cases.xlsx` to that module's sheets → throwaway `git init` → `verify-no-forbidden --target` exit-0 gate → force-with-lease push.

**Tooling forensics (2026-06-11, no assumptions)**: the per-branch `push_branch()` bash flow was written INLINE in the 2026-06-10 ship session and was never saved — it exists only in that session's transcript (**gone**). The xlsx trim helper survives at the transient path `C:\Temp\xlsx-trim.mjs` (1.2 KB, read + verified: exceljs keep-list → `removeWorksheet` → assert kept sheets exist → rewrite in place; takes raw sheet-name CSV; **does NOT filter Overview rows**). That gap is visible on the live `legal` branch (workbook downloaded + dumped 2026-06-11): only `Overview` + `locations_legal` sheets kept ✓, **but Overview still lists ALL modules' rows** — dead hyperlinks to removed sheets, leaking other modules' names/counts to a single-module recipient.

**USAGE RULE (user directive 2026-06-11)**: per-module shipping is how Encore receives deliverables TODAY but is not guaranteed permanent. The trim/push tooling below is **ON-DEMAND ONLY — invoked solely when the user explicitly says "ship module-wise"**. It must NEVER be wired into `client:ship`, `xlsx:build`, hooks, or any default path; the repo always holds the FULL all-modules workbook.

**This plan therefore owns (permanent fixes, no temp scripts):**

1. **Mint a TRACKED `scripts/xlsx-trim.mjs`** (internal, never ships) — SEED from the surviving `C:\Temp\xlsx-trim.mjs` copy (copy it into the working tree BEFORE `C:\Temp` gets wiped; its core logic: `const keep=new Set(list); wb.eachSheet(ws=>{if(!keep.has(ws.name))toRemove.push(ws.name)}); toRemove.forEach(n=>wb.removeWorksheet(wb.getWorksheet(n).id));` + assert kept sheets exist + rewrite in place). Upgrades over the seed: `--modules=<code,...>` (codes from `module-codes.json`; sheet ownership from the registry's `submodules[].sheet` — single source, no hardcoded sheet lists) AND **filter Overview rows to surviving sheets** (fixes the dead-hyperlink/leak defect). Leaves columns/SUMMARY/step-rows untouched (sheet-level surgery only — layout-agnostic, so the merged step-expanded shape needs no special handling).
2. **Persist the push flow as `scripts/ship-branch.sh`** (internal, never ships; on-demand per the usage rule): `git archive HEAD clients/encore/ | tar -x --strip-components=2` → trim `tests/` to surface dir + `auth.setup.ts` → `node scripts/xlsx-trim.mjs --modules=<codes>` → throwaway `git init` with EXPLICIT `user.email`/`user.name`/`commit.gpgsign false` (never inherited in temp dirs) → commit → CLEAN re-extract (`git archive HEAD | tar -x` into a FRESH temp dir, never the scratch dir itself) → `node scripts/verify-no-forbidden.mjs --target=<extract>` with the push HARD-GATED on its exit code (`|| exit 1` — per `feedback_gate_push_on_denylist`, echo-and-continue already leaked once) → re-fetch live tip → `git push --force-with-lease=<branch>:<live-tip> encore-mock HEAD:refs/heads/<branch>`.
3. **Trimmed output stays gate-clean**: trimmed file keeps basename `encore_test_cases.xlsx` → lint C8 stays STRICT on it; acceptance runs `lintWorkbook()` + `verify-no-forbidden --target` against a trim of EACH of the 5 module scopes (build + verify only — NO push during this plan).
4. **Branch stale-artifact cleanup (LR-050, enumerate now)**: the next per-branch refresh after this plan lands must DELETE `encore_test_cases_testrail.xlsx` from every one of the 5 module branches (the merged single file replaces it); `encore-qa-tracker.xlsx` is a separate hand-maintained artifact and STAYS (user ruling 2026-06-11 — "only 1 excel" means one TEST-CASES excel).
5. **Docs correction**: `SHIP_TO_ENCORE.md` cited by the original touchpoint map does NOT exist on disk (verified 2026-06-11) — the ship pattern's only live home is the navigation.md row. Update that row (and row 99) to name the tracked scripts; recreating a gitignored runbook is optional but the navigation row is the canonical pointer.

## Target column schema (per module sheet)

First row of each case carries cols 1–11; **continuation step-rows carry only `Steps (Step)` + `Steps (Expected Result)`**:

`TC ID | Title | Module | Submodule | Test Data | Type | Priority | Coverage Status | Automation Status | Notes / Reason | Preconditions | Steps (Step) | Steps (Expected Result)`

- `Type`=Functional, `Priority`=Medium (TestRail-isms, constant).
- `Module`/`Submodule` cell VALUES keep coming from the registry via `to-csv.ts` (`extractModule`/`extractSubmodule`) — do NOT introduce a second source.
- SUMMARY footer + Overview unchanged in spirit (Overview `Manual` column already landed).

### Status-column semantics (added 2026-06-11 — hardening sweep)

- **`--with-run` is currently a STUB and the user ruled: FIX IT PROPERLY.** Verified at `export_test_cases/sp00-augment-logic.ts:73-78`: `automationExecution` is set ONLY under `opts.mode === 'list-only'` (fixme→Blocked, skip→Skipped, else **assumed Pass**); in with-run mode it stays blank and the blank passes `EXECUTION_ENUM` silently — the "reads actual pass/fail" header claim (`:13-14`) is false today. This plan makes with-run REAL: execute the suite with the JSON reporter and stamp actual Pass/Fail per TC. The everyday default build stays `--list-only` with its documented assumed-Pass semantic (state this in a code comment at the assumed-Pass branch). No stub left behind.
- **Naming-collision guard**: the MD source grammar ALREADY has a field named `Automation Status` meaning *coverage* (`export_test_cases/markdown-parser.ts:102`, enum at `types.ts:98`; `to-jira.ts:32,132` emits a Jira column of the same name with coverage semantics). The merged workbook's `Automation Status` column means *execution* (Pass/Fail/Skipped/Blocked). Keep the user-locked column name, but add a disambiguating comment at BOTH definition sites so no future agent "fixes" one to match the other.

### Continuation-row scan contract (added 2026-06-11 — must be explicit + tested)

Blank-TC-ID continuation rows are a NEW row class; the lint/parity stack handles them correctly today only half-by-design:
- **By design**: C6 (`xlsx-lint-rules.mjs:414`) and C8 (`:457`) skip blank IDs; parity census (`check-tc-parity.ts:129`), guardrail 6d (`:383`) and Q4 (`planner-post-complete.ts:606`) filter on `/^TC-/` — all SAFE, do not touch.
- **By accident**: integrity checks C1–C5 tolerate continuation rows only because both status enums contain `''` (`xlsx-lint-rules.mjs:76-77`). Codify this with a comment: `''` in the enums IS the continuation-row contract, not slop.
- **Wanted behavior**: vocab + C7 scans (`:329-362`) DO run on all rows — step text is client-visible and MUST stay scanned. `readWorkbookRows` gains an `ownerTcId` carry-forward (last non-blank TC ID per sheet) so hits on continuation rows report an actionable TC instead of `tcId=''`.
- **New unit test** (sibling of `to-xlsx-sheet-name.test.ts`): a synthetic step-expanded fixture asserts blank-ID rows are EXCLUDED from C6/C8/ID-census and INCLUDED in vocab/C7 with correct `ownerTcId` attribution.

### Notes/Reason merge — composition + integrity

Compose from `tc.notes` + `tc.ifFailedReason`: **both** → `Blocked — <reason>` + blank line + `Notes: <notes>`; **reason only** → `Blocked — <reason>`; **notes only** → `<notes>`; **neither** → blank.

**Marker idempotency (added 2026-06-11 — VERIFIED: 17 live `blocked-reasons.json` entries ALREADY begin with `Blocked — `)**: the composer MUST strip any existing leading `Blocked — `/`Blocked –`/`Blocked -` marker from the reason before prefixing, or those 17 rows ship `Blocked — Blocked — …` on day one. And **C5's <4-word terse check must count words EXCLUDING the marker** — otherwise `Blocked` + `—` add 2 tokens and a 2-word internal label ("Oracle required") silently passes the exact check built to catch it.

Make C1/C3/C4/C5 **marker-aware** on the merged column (`Blocked — ` segment) and key them on `Automation Status`:
- **C1**: `Automation Status = Pass` AND a `Blocked — ` segment → FAIL.
- **C3**: `Blocked` AND no `Blocked — ` segment → WARN.
- **C4**: `Manual` may carry plain Notes but no `Blocked — ` segment + blank status.
- **C5**: ≥4-word rule applies to the `Blocked — <reason>` segment only.

## Architecture — fold the converter into the build

Move `parseSteps` / `perStepExpected` / `deriveTestData` out of `scripts/_gen-testrail.ts` into a shared module `export_test_cases/testrail-format.ts`; change `to-xlsx.ts`'s per-case emit to loop over `parseSteps(tc.steps)`, emitting first row + continuation rows. `accumulate(metrics, tc)` stays once per case (Overview/SUMMARY counts stay per-case). Retire `_gen-testrail.ts`.

## Touchpoint map (re-verified against post-audit code, 2026-06-11)

| Area | File | Change | Status |
|---|---|---|---|
| Emitter | `export_test_cases/to-xlsx.ts` | step-expand rows; new column set; SUMMARY/Overview reuse (Overview `Manual` ALREADY landed) | re-verified ✓ |
| Step logic | `export_test_cases/testrail-format.ts` (new) | port `parseSteps`/`perStepExpected`/improved `deriveTestData` | unchanged |
| **Schema lockstep** | `scripts/xlsx-lint-rules.mjs` | `CHECKED_COLS` → add `Notes / Reason` + `Automation Status` ONLY — do **NOT** add `Steps (Step)`/`Steps (Expected Result)` (VERIFIED `:287-290`: `readWorkbookRows` keeps the alias key while copying to canonical `Steps`/`Expected Result`, which are already in `CHECKED_COLS:59` — adding the alias names would vocab/C7-scan every step cell TWICE and double the hit counts). Retire dead keys post-merge (LR-050): `Notes`, `If Failed Reason of Failure`, `Automation Execution`, `Automation Type` (`:64`), and the now-dead `ID`→`TC ID` / `Sub-Module`→`Submodule` aliases (the merged file keeps canonical headers; the `Steps (*)` aliases STAY — they become the load-bearing ones). Marker-aware C1/C3/C4/C5 (see §Notes/Reason merge); `EXECUTION_ENUM` re-keyed to `Automation Status`; `readWorkbookRows` gains `ownerTcId` carry-forward; C8 + `loadModuleRegistry()` already exist — keep C8 keyed on `Module`/`Submodule` canonical headers | NEW lockstep surface vs original plan |
| **with-run fix** | `export_test_cases/sp00-augment-logic.ts` | make with-run mode REAL (JSON-reporter run → actual Pass/Fail per TC); comment the assumed-Pass semantic at the list-only branch (`:73-78`); fix the false header claim (`:13-14`) | NEW (user ruling 2026-06-11) |
| **Per-module trim** | `scripts/xlsx-trim.mjs` (NEW, tracked, internal) | seed from surviving `C:\Temp\xlsx-trim.mjs`; registry-driven `--modules=`; Overview-row filter; on-demand only | NEW (user-raised 2026-06-11) |
| **Per-branch push** | `scripts/ship-branch.sh` (NEW, tracked, internal) | persist the transcript-only `push_branch()` flow; deny-list hard gate; on-demand only | NEW (user-raised 2026-06-11) |
| **Audit tooling compat** | `scripts/sp00-audit-v5.mjs` | `loadSheets` (`:142-147`) discards blank-first-cell rows — switch its TC counting to distinct `/^TC-/` IDs so step rows aren't mis-dropped; manual-run-only tool (nothing live invokes it) | NEW since original plan |
| **Oracle-CSV dead vocab** | `export_test_cases/to-csv.ts:67-69` + `blocked-reasons.json` `_README` | last live occurrences of `Automation Execution`/`If Failed Reason of Failure` labels post-merge — rename in the oracle header list + the `_README` prose (inert for the workbook, but LR-050 says no dead vocabulary left behind) | NEW since original plan |
| **Invariant unit test** | `scripts/` (sibling of `to-xlsx-sheet-name.test.ts`) | continuation-row contract test (see §Continuation-row scan contract) | NEW since original plan |
| **Parity guardrails** | `scripts/check-tc-parity.ts` | guardrails 1–5: no change (TC-ID-set based, blank continuation rows skipped). **Guardrail 6d reads `row['Module']`/`row['Submodule']` by canonical name — keeping canonical headers means no change; renaming headers would require aliasing here too** | NEW since original plan |
| Registry | `export_test_cases/module-codes.json` | none (sheet set unchanged) — but ANY new sheet/column semantics must be minted here first | NEW since original plan |
| Build/commit lint | `scripts/xlsx-vocab-lint.mjs` | none (inherits rules module) | re-verified ✓ |
| Ship gate | `scripts/verify-no-forbidden.mjs` | none structurally; its `lintXlsxDir` now lints ALL workbooks correctly via `HEADER_ALIASES` (false-green fixed 2026-06-11); after retirement TWO files remain in the lint path — the merged workbook + the hand-maintained `encore-qa-tracker.xlsx`, which passes vacuously (no `TC ID` column, non-strict C8) and STAYS per user ruling | re-verified ✓ (wording corrected 2026-06-11) |
| Pre-commit | `.githooks/pre-commit` gate 5 | none — already fires on xlsx + `module-codes.json` + specs (extended 2026-06-11) | NEW since original plan |
| Sheet-name test | `scripts/to-xlsx-sheet-name.test.ts` | update if it asserts headers; corp entries now explicit in `SHEET_NAMES` | re-verified ✓ |
| Retire | `scripts/_gen-testrail.ts` + `…_testrail.xlsx` | delete converter + workbook; drop from tracking | unchanged |
| Docs | `.claude/context/navigation.md` rows **70 AND 99**, `export_test_cases/README.md` | "two files" → one; record the merged schema; row 70 (ship pattern) names the tracked `xlsx-trim.mjs`/`ship-branch.sh`; row 99 (§C XLSX-pipeline registry) currently documents `_gen-testrail.ts` as the TestRail refresh mechanism — rewrite for the merged single-workbook architecture; `export_test_cases/README.md` updated for step-expanded layout + generator retirement. (`SHIP_TO_ENCORE.md` from the original map does NOT exist on disk — verified 2026-06-11; removed as a target.) | corrected 2026-06-11 |

## Verified-safe consumers (2026-06-11 sweep — DO NOT TOUCH)

Each verified first-hand; the executor must NOT "fix" these for step-expansion:

- `scripts/xlsx-freshness.ts:42-48` — mtime-only comparison, layout-agnostic.
- `scripts/xlsx-dump.ts` — raw row emit; step rows appear as-is (correct, just longer output).
- `scripts/check-tc-parity.ts:129` (`getXlsxScan`) + `:383` (guardrail 6d) — `/^TC-/` filters skip blank-ID rows; ID-set parity counts stay TC-based.
- `scripts/planner-post-complete.ts:606` (`countXlsxRowsForModule`) — counts only `/^TC-/` rows; Q4 stays correct.
- `xlsx-lint-rules.mjs:414` (C6) + `:457` (C8) — blank IDs skipped.
- SUMMARY detection — literal `SUMMARY` in the `TC ID` cell everywhere; cannot be confused with blank continuation rows.
- `.githooks/pre-push` (path-glob deny only), `generator-post-complete.ts` / `validate-queue-integrity.ts` / `archive-queue.ts` (queue metadata only, no workbook reads), CI workflow (no xlsx logic), `.claude/skills/**` (zero workbook refs), `pipeline/` (zero workbook readers), `clients/encore/README.md` + `package.json` (zero workbook mentions), to-xlsx self-lint subprocess (arg-less, path hardcoded in `xlsx-vocab-lint.mjs:18`).

## Cross-plan rebase (write these notes during execution — LR-020)

- `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` — edits the SAME emitters. **User ruling 2026-06-11: THIS plan goes first**; add a rebase note there pointing at the merged layout.
- `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` — its verification recipe cites `Automation Execution=Pass`, `If Failed Reason of Failure=<empty>` and recommends `xlsx:build:with-run` — all three change under this plan; add a rebase note with the new column names + fixed with-run semantics.
- `SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md` — plans to fold validators into `sp00-audit-v5.mjs`; note the step-expanded row model + the distinct-ID counting fix.
- `SUBPLAN_TESTRAIL_DEEP_SWEEP.md` — references the testrail demo workbook; note its retirement.
- `PLAN_SPEC_FIX_HIST_SSL_ACC_REENABLE_2026_06_02.md:129` — cites `encore-qa-tracker.csv` (stale path variant; the live artifact is `encore-qa-tracker.xlsx`); one-line correction.
- `PLAN_ID_NAMING_AUDIT_AND_REMEDIATION.md` — its Phase-6 open question "promote `_gen-testrail.ts`?" is answered RETIRE by this plan (cross-ref at that plan's closure).

## Out of scope (confirmed, with evidence — do not chase)

- `website/` TestRail mentions (`website/plan.md`, `website/backend/src/routes/test-cases.routes.ts`) — the OTHER product's export-format feature, unrelated to the Encore deliverable.
- `encore-qa-tracker.xlsx` — separate hand-maintained artifact (no generator exists anywhere; user ruling 2026-06-11: stays).
- Historical artifacts (`plans/done/**`, activity logs, closure manifests, `_internal/` dated audit artifacts) — record-keeping; never edited.
- `.recover-scratch/` untracked stale `_gen-testrail` references — optional disk-cleanup note only; acceptance grep below is disk-level so they can't masquerade as live refs.

## Test Data improvement spec

`deriveTestData` rewrite — config-driven labels, no banned tokens: `User: automation user (location-edit permission)` / `Location: test office <id from config>` / `Application: Navigator` / `Sample input N: "<literal from steps>"`. Removes the banned host, `(existing fixture)`, `(created by Planner)`, raw role string. Source labels from config/`TEST_DATA_CONTEXT` constant — not hardcoded. `Test Data` is ALREADY in `CHECKED_COLS` (added 2026-06-11), so it is scanned from day one.

## Phases

0. **Gates green pre-work** (Phase-0 gate): `npm run xlsx:build` + `xlsx:lint` + `check:tc-parity` + `test:xlsx-sheet-name` all green on the CURRENT shape before touching anything (HALT if not — fix upstream first). ALSO: copy the surviving `C:\Temp\xlsx-trim.mjs` seed into the working tree NOW (it is one Temp-wipe away from joining the push flow in oblivion).
1. **Schema + shared module.** Add `testrail-format.ts`; define merged `MODULE_SHEET_HEADERS`; mirror in `CHECKED_COLS` + integrity refs per the corrected lockstep row (NO alias names in CHECKED_COLS); `ownerTcId` carry-forward; **continuation-row invariant unit test** (see §Continuation-row scan contract) written FIRST so Phase 2's emitter is born tested.
2. **Emitter + with-run.** Step-expanded emit; status cols on row 1; SUMMARY per-case; marker-idempotent Notes/Reason composer; **fix `sp00-augment-logic.ts` with-run to join REAL run results** (user ruling — no stub left).
3. **Gates green.** build self-lint → `xlsx:lint` (C1–C8) → `check:tc-parity` (guardrails 1–7) → sheet-name test → invariant test; fix lockstep fallout until clean.
4. **Retire the old + dead-vocab sweep (LR-050).** Delete `_gen-testrail.ts` + the testrail xlsx; retire dead lint keys/aliases + `Automation Type`; rename to-csv oracle headers (`to-csv.ts:67-69`) + `blocked-reasons.json` `_README` prose; `sp00-audit-v5.mjs` distinct-ID counting fix; add a **regression test** that FAILS if the old column set or a second `*_testrail.xlsx` reappears; record the 5-branch twin-deletion obligation (next module-wise ship).
4.5. **Per-module ship tooling (build + verify, NO push).** `scripts/xlsx-trim.mjs` (registry-driven + Overview-row filter) + `scripts/ship-branch.sh` (deny-list hard-gated); verify a trim of EACH of the 5 module scopes passes `lintWorkbook()` + `verify-no-forbidden --target` and its Overview lists ONLY surviving sheets. Tools stay on-demand (used only when the user says "ship module-wise").
5. **Permanence verify + docs + cross-plan notes.** `npm run xlsx:build` is the only producer; hooks gate every future change; **disk-level grep** (`rg -uu _gen-testrail`, not just `git grep` — untracked `.recover-scratch/` copies must not masquerade) → history/scratch only; navigation rows 70+99 + `export_test_cases/README.md` updated; §Cross-plan rebase notes written.

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — no live-site walk) | (none) | (none) |
| GIVER | XLSX deliverable shape (OWNER-executed; MD sources untouched) | clients/encore/test_cases_xlsx/encore_test_cases.xlsx | `npm run check:tc-parity` exit 0 |
| BUILDER | (none — no spec changes) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none — guards already landed; this plan only keeps them green) | (none) | (none) |
| GARDENER | converter retirement + shared module extraction + ship tooling persistence | export_test_cases/testrail-format.ts<br>scripts/xlsx-trim.mjs<br>scripts/ship-branch.sh | `npm run test:xlsx-sheet-name` pass + old-shape regression test pass + invariant test pass |

## Acceptance criteria

- [ ] `npm run xlsx:build` emits the merged file at `SHARED_PATHS.workbook`; self-lint (C1–C8) passes; Test Data clean.
- [ ] `npm run xlsx:lint` + `npm run check:tc-parity` clean — ID set unchanged vs spec/MD; guardrails 6/7 green with zero new exceptions.
- [ ] Spot-open: each case = 1 first-row + N step-rows; columns per target schema; Coverage + Automation Status + merged Notes/Reason on row 1; Overview `Manual` reconciles.
- [ ] The 17 pre-marked blocked reasons show EXACTLY ONE `Blocked — ` marker each (idempotency proof); C5 catches a synthetic 2-word reason despite the marker.
- [ ] with-run produces REAL Pass/Fail from an actual run (spot-evidence: at least one genuinely-failing TC stamps `Fail`); default `--list-only` semantics unchanged and commented.
- [ ] Continuation-row invariant test green (blank-ID rows: out of C6/C8/census, in vocab/C7, correct `ownerTcId`).
- [ ] `test:xlsx-sheet-name` passes; new old-shape regression test fails on the prior column set or a second `*_testrail.xlsx`.
- [ ] `scripts/_gen-testrail.ts` and `encore_test_cases_testrail.xlsx` deleted; **disk-level** `rg -uu _gen-testrail` → history/scratch only.
- [ ] `scripts/xlsx-trim.mjs` + `scripts/ship-branch.sh` exist, tracked, wired into NOTHING (on-demand only); trim of each of the 5 module scopes passes `lintWorkbook()` + `verify-no-forbidden --target`; trimmed Overview lists ONLY surviving sheets.
- [ ] Docs: navigation rows 70+99 + `export_test_cases/README.md` updated; all 6 §Cross-plan rebase notes written (grep-verifiable per LR-040 (b)).
- [ ] Activity-log row (LR-028); plan closed per LR-027.

## Execution Summary

**Executed**: 2026-06-11 (OWNER). This is a tooling/format plan — NO test cases implemented or dropped; the 634 TC count is unchanged vs the pre-merge workbook. All work is on the emitter + lint + ship pipeline.

**What landed (Phases 0→5):**
- **Phase 1 — schema + shared module.** New `export_test_cases/testrail-format.ts` (ported `parseSteps` / `perStepExpected` + config-driven `deriveTestData` from the retired converter; `TEST_DATA_CONTEXT` config). `to-xlsx.ts` `MODULE_SHEET_HEADERS` → merged 13-col schema (`TC ID·Title·Module·Submodule·Test Data·Type·Priority·Coverage Status·Automation Status·Notes / Reason·Preconditions·Steps (Step)·Steps (Expected Result)`); naming-collision disambiguating comments at the execution-axis `Automation Status` site. `scripts/xlsx-lint-rules.mjs` lockstep: `CHECKED_COLS` adds `Notes / Reason`+`Automation Status`, retires `Notes`/`Automation Execution`/`If Failed Reason of Failure`/`Automation Type` + the dead `ID`/`Sub-Module` aliases (kept load-bearing `Steps (*)`); `EXECUTION_ENUM` re-keyed to `Automation Status`; marker-aware C1/C3/C4/C5 via new `splitNotesReason`; `ownerTcId` carry-forward in `readWorkbookRows`; continuation-row `''`-enum contract comment.
- **Phase 1/2 — emitter + with-run.** `to-xlsx.ts` step-expanded emit (first row cols 1-11 + N continuation step-rows cols 12-13; `accumulate` once per case); marker-idempotent `composeNotesReason`. `sp00-augment-logic.ts` with-run made REAL — `runAndMapOutcomes`/`mapRunOutcomes`/`classifySpecOutcome` run `npx playwright test --reporter=json` and stamp actual Pass/Fail (captures the JSON from the non-zero-exit stdout so a failing run yields real `Fail`); list-only assumed-pass commented + unchanged.
- **Phase 1 test-first.** `scripts/xlsx-continuation-row.test.mjs` (10 invariants: blank-ID rows out of C6/C8/census, in vocab/C7 with `ownerTcId`, C5 catches a 2-word Blocked reason). `scripts/sp00-with-run.test.ts` (synthetic-report mapping + a REAL no-browser Playwright run whose failing TC stamps `Fail`).
- **Phase 4 — retire + dead-vocab.** Deleted `scripts/_gen-testrail.ts` + `encore_test_cases_testrail.xlsx`. Renamed `to-csv.ts` oracle headers + `blocked-reasons.json` `_README` prose (`Automation Execution`→`Automation Status`, `If Failed Reason of Failure`→`Notes / Reason`). `sp00-audit-v5.mjs` compat (distinct-`/^TC-/` counting + merged columns + module-agnostic `TC_ID_PATTERN`). New `scripts/xlsx-merged-shape.test.mjs` regression guard (negative-tested: exit 1 on a planted `*_testrail.xlsx`, exit 0 after).
- **Phase 4.5 — ship tooling (on-demand only, wired into nothing).** `scripts/xlsx-trim.mjs` (registry-driven `--modules` + Overview-row prune) + `scripts/ship-branch.sh` (persisted push flow, DRY-RUN default, deny-list HARD-gated). Verified a trim of all 5 module scopes passes `lintWorkbook()` + `verify-no-forbidden --target` with Overview listing only surviving sheets.
- **Phase 5 — docs + cross-plan.** navigation.md rows 70+99 + `export_test_cases/README.md` updated; 6 grep-verifiable rebase notes written (PLAN_DELIVERABLE_QUALITY_UPGRADE · SUBPLAN_PARITY_W1_04 · SUBPLAN_PARITY_W1_05 · SUBPLAN_TESTRAIL_DEEP_SWEEP · PLAN_SPEC_FIX_HIST_SSL_ACC (+`encore-qa-tracker.csv`→`.xlsx` correction) · PLAN_ID_NAMING_AUDIT (Phase-6 question answered RETIRE)).

**Verification** (consolidated, all exit 0): `xlsx:build` (self-lint C1-C8, 0/0/0, 2796 rows / 634 cases) · `xlsx:lint` · `check:tc-parity` (guardrails 1-7) · `test:xlsx-sheet-name` · `test:xlsx-continuation-row` · `test:xlsx-merged-shape` · `test:sp00-with-run`. Spot-opens: SSL-024/CPR-OVR-023 single `Blocked — ` marker; PRI-020 keeps `Skipped — ` (not mislabeled); NTS-018 Manual = plain Notes; 0 double-markers across 634 cases; Overview `Manual` reconciles 19/19 sheets. Regression-guard before/after: purely additive (no removed exports/signatures). Typecheck: changed files 100% clean (pre-existing 77-error breakage is in the deprecated, removal-tracked `scripts/build-framework-vendor.ts`).

**Deviations (documented, both higher-quality than the literal plan text):**
1. **Notes/Reason composer is execution-gated** — the `Blocked — ` marker is applied ONLY when execution is actually `Blocked`, not unconditionally on any reason. The plan's literal "reason only → `Blocked — <reason>`" would have mislabeled Skipped/Pending reasons (`Skipped — …`, `Not yet automated — …`) as `Blocked — Skipped — …` AND broken lint C1/C3 (which tie the marker to execution=Blocked). Proven correct by PRI-020 (Skipped) keeping its own marker.
2. **sp00-audit-v5 extended beyond the scoped counting fix** — also re-sourced its dead column names to the merged schema and made `TC_ID_PATTERN` module-agnostic (it predated the CPR module and flagged every Corporate Pricing ID as malformed). Required to keep it functional + carry no dead vocabulary (LR-050). It is manual-run-only (not a gate); its residual 69 advisory defects are pre-existing tool design opinions + MD content, not merge regressions.

**Adjacent-Sweep dispositions:** `scripts/build-framework-vendor.ts` typecheck breakage → already tracked for removal by `plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md` (grep-verified). 3 pre-existing MD-content observations (LI-058 "Internal: for USA" note + 2 account-address empty authored-expecteds) → spawned `task_bd102f6b`.

## Handoff

Chat-only summary at session end (LR-039). No ship/commit/push beyond the plan's own commits unless asked (LR-049).
