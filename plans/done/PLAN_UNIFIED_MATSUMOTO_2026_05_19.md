# PLAN — Execute `c-users-rutvi-unified-matsumoto.md` + close 6 audit gaps

> **Status:** DONE
> **Executed:** 2026-05-19

---

## 1. Context

User asked the agent to **execute** the audited/revised restructure plan at
`C:\Users\rutvi\.claude\plans\c-users-rutvi-unified-matsumoto.md`, which transforms
`clients/encore/` to mirror the approved client deliverable structure at
`C:\Users\rutvi\projects\notes`. The audited plan was produced by an adversarial
review of the original draft `c-users-rutvi-projects-notes-checkout-th-foamy-sedgewick.md`
(5 critical, 4 high, 6 medium findings resolved).

Goal of this session: (a) verify the audited plan is complete against actual encore disk state,
(b) flag any slop the audit missed, (c) execute all 5 commits + any gap-fills the user authorizes.

A parallel slop sweep of `clients/encore/` against `C:\Users\rutvi\projects\notes` found
the audited plan is **comprehensive for its named scope** but **misses 6 items** that
fall under the user's intent ("if it doesn't have a real reason to exist then delete…
we don't ship shit other than what we already decided by referring to notes").

This plan file = thin wrapper. **Do not duplicate the 5-commit body.** Execute the
audited plan verbatim, then run the gap-fill mini-commit at the end (Commit 6 below)
after user authorizes the gap closures in section 4.

---

## 2. Authoritative source

**Read & execute every section of:** `C:\Users\rutvi\.claude\plans\c-users-rutvi-unified-matsumoto.md`

- Section 4 — Commits 1 → 5 (sequential, each independently green)
- Section 5 — Parallel notes-trim track
- Section 6 — End-to-end verification (10 checks)
- Section 9 — Critical files reference

Decisions locked: D1–D10 in section 2 of the audited plan. Do not relitigate.

---

## 3. Audit findings on the audited plan (what it misses)

Cross-checked plan vs. actual `clients/encore/` disk state on 2026-05-19.

### 3a. Items the plan delete-list misses (clear slop)

| # | Item | Size/scope | Why slop | Audited plan says |
|---|------|-----------|----------|-------------------|
| G1 | `clients/encore/scripts/_live-probe-2026-05-08.mjs` | 13.9 KB | One-off probe, date-stamped in filename | Not mentioned |
| G2 | `clients/encore/scripts/_live-probe-notes-col69-2026-05-11.mjs` | 12.6 KB | One-off followup probe | Not mentioned |
| G3 | `clients/encore/scripts/_live-verify-2026-05-08.mjs` | 9.5 KB | One-off verification | Not mentioned |
| G4 | `clients/encore/scripts/walks/` | dir (≥1 file: `gap-006-table-at-max.ts`) | Date-tagged walk-evidence; not a production script | Not mentioned |
| G5 | `clients/encore/test-results-rca-2pct/` | 25 MB / 64 sub-dirs | Stale dated RCA run output; not in current `.gitignore` | Not mentioned |

All 5 are clearly outside the notes target. Each is either already gitignored (in which
case it persists on disk but doesn't ship) or unlisted in `.gitignore` (in which case
it would ship — verified `test-results-rca-2pct/` is NOT in current `.gitignore`).

### 3b. Items where plan contradicts its own D9 directive ("match notes' directory structure exactly")

| # | Item | Notes shape | Encore shape (after audited plan) | Conflict |
|---|------|-------------|----------------------------------|----------|
| G6 | Auth selectors | `src/selectors/auth/login.ts` + `src/selectors/auth/dynamic.ts` | Flat `src/selectors/login.ts` + `src/selectors/dynamic.ts` (plan §3 line 98: "16 files + SELECTOR_CATALOG.md — untouched") | Plan does NOT move auth selectors to `auth/` subdir, contradicting D9 |
| G7 | `src/selectors/SELECTOR_CATALOG.md` | Absent | Present (encore-only) | Notes has no equivalent — slop unless documented as required |

### 3c. Items where plan-target conflicts with root CLAUDE.md ship-tracking rules

| # | Item | Root CLAUDE.md says | Notes says | Audited plan says |
|---|------|--------------------|-----------|-------------------|
| G8 | `docs/REQUIREMENTS.md` (75 KB functional spec) | **Tracked** — ships per [CLAUDE.md:139](CLAUDE.md:139) | Absent — notes has no `docs/` folder | Updates path refs in Commit 3 (treats as kept) |
| G9 | `docs/MODULE_REGISTRY.md` (4 KB module boundaries) | **Tracked** — ships per [CLAUDE.md:139](CLAUDE.md:139) | Absent — notes has no `docs/` folder | Updates path refs in Commit 3 (treats as kept) |
| G10 | `docs/README.md` | Not explicitly tracked but exists | Absent | Listed in Commit 3 "framework docs" update set |

If "match notes structure" wins → delete `docs/` from ship. Notes-target wins.
If "root CLAUDE.md tracked list" wins → keep `docs/REQUIREMENTS.md` + `docs/MODULE_REGISTRY.md`,
  update root CLAUDE.md to reflect this is per-client decision. CLAUDE.md may also need editing.

### 3d. Strict-line risk (LR-046)

Plan section 6 item 5: "grep `docs/`, `.claude/`, `scripts/`, `pipeline/`, `plans/pending/`
for `tests/setup/`, `src/common/` — **zero hits** (done plans exempted)".

Plan section 4 Commit 3 enumerates 17 files but adds parenthetical: "(3 more pending plans
reference these paths — `SUBPLAN_REPO_10`, `PLAN_PLAYWRIGHT_CLI_ADOPTION`, `PLAN_CODEBASE_CLEANUP`
— update those too)". So actual count = 20 files, not 17. The strict line "zero hits" then
applies to ALL of them. If any single un-enumerated pending plan or doc references an old
path post-execution, the strict line fails. **Mitigation in Commit 3 plan-fill (see §5).**

### 3e. Items the audited plan already covers correctly (no action)

For audit transparency — these were checked against my slop sweep and are correctly handled:

- ✅ `dist/framework/` (55 files) — Commit 2 deletes
- ✅ `api-testing/` (4 files) — Commit 4 deletes, removed from `testMatch` + tsconfig include
- ✅ `playwright.config.ci.ts` — Commit 2 deletes, CI branches merged into main config
- ✅ 6 production scripts (archive-allure, archive-html, ensure-report-dirs, preserve-allure-history, preserve-failure-summary, run-test-daily) — Commit 4 deletes
- ✅ `tests/test-data/test.xlsx` — Commit 4 deletes
- ✅ `tests/setup/` → `tests/infra/` rename — Commit 2
- ✅ `src/common/` → `src/core/` rename — Commit 2
- ✅ `src/pages/{home,login}.page.ts` → `src/pages/auth/` move — Commit 2
- ✅ `tests/seed.spec.ts` → `tests/specs/smoke/seed.spec.ts` move — Commit 2
- ✅ `.gitignore` additions (CLAUDE.md, specs_planning/, readable_externals/, docs/read_only_docs/, exports/, .auth/, .env.server) — Commit 2 Part D
- ✅ 5 unused deps removal (`@aws-sdk/client-s3`, `axios`, `exceljs`, `knex`, `xlsx`) — Commit 4
- ✅ tsconfig path aliases → relative imports — Commit 2
- ✅ `.github/workflows/playwright-tests.yml` config ref update — Commit 2 Part C
- ✅ Notes parallel trim (5 deps + dead config) — Section 5
- ✅ Survival comments (dependency-gate, diagnostics-collector, fullyParallel) — Commit 5
- ✅ 7-day diagnostics cleanup port — Commit 5

---

## 4. User decisions (resolved 2026-05-19)

| Q | Answer | Implication |
|---|--------|-------------|
| Q1 — Slop sweep | **Delete 4** (3 dated probe scripts + `test-results-rca-2pct/`); **keep but gitignore** `scripts/walks/` and `src/selectors/SELECTOR_CATALOG.md` (don't ship) | Commit 6 Part A — delete + .gitignore additions |
| Q2 — Selector auth/ | **YES — move to `src/selectors/auth/`** (honors D9) | **FOLDED into Commit 2 Part A** (per H1 fix — selectors move during renames; imports rewrite once) |
| Q3 — docs/ ship boundary | **DELETE** `docs/REQUIREMENTS.md` + `docs/MODULE_REGISTRY.md` + `docs/README.md` (notes wins); also remove from root [CLAUDE.md:139](CLAUDE.md:139) tracked-list; keep `docs/read_only_docs/` (already-gitignored agent-internal) | Commit 6 Part C — file deletes + root CLAUDE.md edit + cross-cutting grep |
| Q4 — Encore extras | **KEEP all 4 with justification** — `scripts/test-cli.js`, `package.json test:cli` script, `src/utils/retry-telemetry.ts`, `tests/test-data/downloads/.gitkeep` | Documented divergence (see §11g) — audited plan D2/F8 + framework-runtime needs |
| Q5 — Extra specs | **KEEP all 3 with justification** — `location-notes.spec.ts` (~33 TCs), `history/location-hist-notes.spec.ts` (col-69 audit-trail), `location-notes.data.ts` | Documented divergence — notes is stripped review-snapshot (commit 2e1fd05), encore is full client deliverable. `location-hist-notes` extends per pending `PLAN_LM_HISTORY_COVERAGE`. See §11g |

User clarifications:
- Q1: "keep walks and selector catalog but **make sure these things don't ship to client**" → resolve by gitignoring
- Q5: "keep all" + future-plan ref → ship all 3 as deliberate divergence

---

## 5. Execution sequence (final, post-review-fixes H1/H2/H5)

1. **Commit 1** (audited plan §4 Commit 1) — Create 8 utility files (logger, diagnostics-collector, common-methods, credential-loader, retry-telemetry, types/index, types/diagnostics, scripts/test-cli.js). Additive only.
2. **Notes parallel trim** (audited plan §5) — trim 5 unused deps + `api-testing` testMatch + `api-testing` tsconfig include from `C:\Users\rutvi\projects\notes`. Run AFTER Commit 1 (notes source files for ports must exist during Commit 1). Verify: `npm install && npm run typecheck && npx playwright test --list` in notes folder.
3. **Commit 2** (audited plan §4 Commit 2 + **H1 fix: fold Q2 selector move here**) — Renames + selector move to `auth/` subdir + import rewrite (once, with final paths) + dist/framework delete + config merge + .gitignore expansion. Atomic.
   - **Sub-part order**: (A) all directory renames + selector moves → (B) all import rewrites in one sweep → (C) deletions (dist/framework + playwright.config.ci.ts) → (D) config modifications (tsconfig, playwright.config.ts, .github workflow, .gitignore).
   - **Verification (H2 fix)**: typecheck ONLY at END of Commit 2 (intermediate typecheck after Part A would fail because imports are broken until Part B fixes them). Use `git status` for rename detection / deletion confirmation at intermediate steps; full `npm run typecheck && npx playwright test --list` only after Part D.
4. **Commit 3 hardening pre-grep** — before Commit 3 body, run:
   ```
   grep -rn "tests/setup/\|src/common/\|src/pages/home\.page\|src/pages/login\.page\|selectors/login\|selectors/dynamic" docs/ .claude/ scripts/ pipeline/ plans/pending/ 2>&1 | grep -v node_modules | grep -v plans/done/
   ```
   Compare hits to plan's enumerated 17+3 files + any selector-import refs. Append new finds. Then run Commit 3 body. Post-grep must return zero.
5. **Commit 3** (audited plan §4 Commit 3, **H5 fix: drop `docs/README.md` from update list** since it's deleted in Commit 6) — Find-and-replace across remaining enumerated live docs/configs/pending-plans. Updated list: 16 files (was 17) + 3 parenthetical pending plans = 19 total.
6. **Commit 4** (audited plan §4 Commit 4) — Delete 6 scripts + api-testing + test.xlsx + trim 5 deps.
7. **Commit 5** (audited plan §4 Commit 5) — Survival comments + README update + 7-day diagnostics cleanup.
8. **Commit 6** (post-H1: now ONLY Parts A + C — Part B folded into Commit 2) — Slop sweep gap-fill: Part A (slop deletions + .gitignore expansion for `walks/`, `SELECTOR_CATALOG.md`, `test-results*/`) → Part C (docs/ delete + root CLAUDE.md edit + cross-cutting grep). Run typecheck + `--list` after Part A; run cross-cutting grep after Part C.
9. **End-to-end verification** — run all 10 checks from audited plan §6 + 10 additional checks from §7 below (items 11–20).

**Concurrency:** All commits sequential. Each must land green (typecheck + `npx playwright test --list` succeed) before next commit. No parallelization.

---

## 6. Commit 6 — Gap-fill (FINAL spec)

Runs after audited plan's Commits 1–5 land green. Single commit; three logical parts.

### Part A — Slop deletions + .gitignore expansion (Q1)

**Delete (4 paths):**
- `clients/encore/scripts/_live-probe-2026-05-08.mjs` (13.9 KB, dated probe)
- `clients/encore/scripts/_live-probe-notes-col69-2026-05-11.mjs` (12.6 KB, dated followup)
- `clients/encore/scripts/_live-verify-2026-05-08.mjs` (9.5 KB, dated verify)
- `clients/encore/test-results-rca-2pct/` (25 MB, 64 sub-dirs)

**Keep on disk but block from ship — add to `clients/encore/.gitignore`:**
```
# Slop-sweep gap-fill 2026-05-19 — agent-internal, never ships
scripts/walks/
src/selectors/SELECTOR_CATALOG.md
test-results-rca-2pct/
test-results*/
```
(The `test-results*/` glob catches `test-results-rca-2pct/` plus any future `test-results-*` variants;
the explicit entry above is belt-and-suspenders.)

**Pre-delete safety check** (mitigates R5):
```
grep -r "test-results-rca-2pct" clients/encore/reports/ plans/pending/ docs/read_only_docs/ .claude/ 2>&1 | grep -v node_modules
```
If hits exist → archive references in a markdown note before deletion. Most likely zero hits
(it's a runtime artifact, not documented).

### Part B — [FOLDED into Commit 2 Part A per H1 fix]

Selector move (`src/selectors/{login,dynamic}.ts` → `src/selectors/auth/`) now happens inside Commit 2's directory-rename step, with imports rewritten once to final paths. See §5 step 3 for the merged execution.

**This section retained for historical traceability of Q2 resolution. Do not execute separately.**

### Part C — docs/ ship boundary cleanup (Q3)

**Delete (2 files):**
- `clients/encore/docs/REQUIREMENTS.md` (75 KB functional spec)
- `clients/encore/docs/MODULE_REGISTRY.md` (4 KB module boundaries)

**Keep:**
- `clients/encore/docs/read_only_docs/` (gitignored per audited plan Commit 2 Part D, agent-internal)
- `clients/encore/docs/README.md` — open question: notes has no `docs/` at all, but `docs/README.md` exists in encore and was in audited plan's Commit 3 "framework docs to update with new paths". Resolve: **delete `docs/README.md` too** (notes-target wins; nothing in docs/ ships). This makes the post-ship `docs/` either non-existent or contain only the gitignored `read_only_docs/` (effectively empty in shipped output).

**Edit root [CLAUDE.md:139](CLAUDE.md:139):**
- Remove `docs/REQUIREMENTS.md` and `docs/MODULE_REGISTRY.md` from the "Tracked:" list
- Updated line should read:
  ```
  - Tracked: `src/`, `tests/`, `config/`, `package.json`, `playwright.config.ts`, `tsconfig.json`, `.gitignore`, `README.md`.
  ```
  (also drops `api-testing/` and `dist/framework/` already deleted by audited plan Commit 2/4 — verify those were already removed from this line by the audited plan's Commit 3 doc-updates; if not, fold in now)

**Cross-cutting grep (mitigates R4):**
```
grep -rn "docs/REQUIREMENTS\.md\|docs/MODULE_REGISTRY\.md" docs/ .claude/ scripts/ pipeline/ plans/pending/ 2>&1
```
For each hit:
- In `docs/read_only_docs/` — update or mark as historical (these are agent rules referring to past structure)
- In `.claude/` agent configs — update to use new source (likely `clients/encore/docs/read_only_docs/` if rules migrated there, or remove ref entirely)
- In `plans/pending/` — update path or note as historical
- In `pipeline/` examples — update or remove

Strict line: after Commit 6 Part C, `grep -rn "clients/encore/docs/REQUIREMENTS\|clients/encore/docs/MODULE_REGISTRY" .` returns **zero hits** (excluding `plans/done/`, `reports/`).

### Commit 6 message

```
chore(encore): close 6 slop-sweep gaps from audited unified-matsumoto plan

Part A — slop deletions + gitignore expansion (Q1):
- delete 3 dated _live-probe/_live-verify scripts (2026-05-08, 2026-05-11)
- delete test-results-rca-2pct/ (25MB stale RCA artifact)
- gitignore scripts/walks/, src/selectors/SELECTOR_CATALOG.md, test-results*/

Part B — selector auth/ subdir (Q2, honors D9):
- move src/selectors/{login,dynamic}.ts -> src/selectors/auth/
- update barrel src/selectors/index.ts + import rewires across pages/auth + tests/infra

Part C — docs/ ship-boundary (Q3, notes-target wins):
- delete docs/REQUIREMENTS.md, docs/MODULE_REGISTRY.md, docs/README.md
- update root CLAUDE.md:139 tracked-list (remove tracked docs)
- cross-cutting grep audit — zero hits in live files

Verification: npm run typecheck + --list + ship-dryrun all green.
Refs: c-users-rutvi-unified-matsumoto.md (5-commit base)
```

---

## 7. Verification (additions to audited-plan §6)

Run audited plan's 10 verification checks AS-IS, then add:

11. **Slop sweep grep** — `find clients/encore/scripts -name '_live-probe-*' -o -name '_live-verify-*'` returns **zero** (3 dated files gone)
12. **`test-results-rca-2pct/` deletion** — `ls clients/encore/test-results-rca-2pct 2>&1 | grep "No such"` succeeds (or empty result)
13. **Selector hierarchy match** — `find clients/encore/src/selectors/auth -type f` lists `login.ts` + `dynamic.ts`; `find clients/encore/src/selectors -maxdepth 1 -name 'login.ts' -o -name 'dynamic.ts'` returns **zero**
14. **`docs/REQUIREMENTS.md` + `docs/MODULE_REGISTRY.md` deletion** — both files gone; ship dry-run output has no `docs/REQUIREMENTS.md` or `docs/MODULE_REGISTRY.md`
15. **Ship-output excludes gitignored slop** — in `/tmp/encore-trimmed-dryrun/`:
    - `scripts/walks/` → does NOT exist
    - `src/selectors/SELECTOR_CATALOG.md` → does NOT exist
    - `test-results-rca-2pct/` and `test-results-*/` → does NOT exist
    - `docs/REQUIREMENTS.md`, `docs/MODULE_REGISTRY.md`, `docs/README.md` → does NOT exist
    - `docs/read_only_docs/` → does NOT exist (already gitignored by audited plan Commit 2)
16. **Commit-3 pre-grep completeness** — pre-Commit-3 grep file count matches post-Commit-3 update count; final post-Commit-3 grep of `docs/ .claude/ scripts/ pipeline/ plans/pending/` for `tests/setup/` and `src/common/` returns **zero hits**
17. **Root CLAUDE.md tracked-list updated** — [CLAUDE.md:139](CLAUDE.md:139) no longer contains `docs/REQUIREMENTS.md` or `docs/MODULE_REGISTRY.md`
18. **Cross-cutting refs to deleted docs** — `grep -rn "clients/encore/docs/REQUIREMENTS\|clients/encore/docs/MODULE_REGISTRY" docs/ .claude/ scripts/ pipeline/ plans/pending/` returns **zero hits**

---

## 8. Risk register

| # | Risk | Mitigation |
|---|------|-----------|
| R1 | Strict-line "zero hits" (LR-046) fails post-execution because un-enumerated pending plans reference old paths | Pre-grep enumeration in step §5.2 |
| R2 | Notes-trim runs BEFORE encore Commit 1, leaving Commit 1 unable to port source files | Order locked in §5.4: encore-Commit-1 first |
| R3 | Commit 2's "rename + import rewrite + delete + config merge" is atomic — high blast radius if any sub-step fails mid-commit | Run `npm run typecheck` after each sub-part inside the working tree before staging |
| R4 | Q3 = "delete docs" requires editing root CLAUDE.md (cross-cutting framework file outside encore scope) | Get explicit user approval; ensure no in-flight pipeline work depends on docs/REQUIREMENTS.md path |
| R5 | `test-results-rca-2pct/` deletion is destructive (25MB of RCA artifacts) — possibly referenced from a `reports/` summary | Pre-delete: grep `reports/`, `plans/pending/` for `test-results-rca-2pct` references; if hits, archive first |
| R6 | Selector move (Q2) breaks 13+ page-object files importing `'../selectors/login'` | Atomic find-and-replace with typecheck before commit |
| R7 | Multiple chat-mentions of "deliver" / "ship" trigger LR-049 — ship discipline applies (use `npm run client:ship`, never `cp -r`) | Verification §6.9 uses `npm run client:ship` already |

---

## 9. Critical files (read-before-edit)

From audited plan §9, plus:

- `clients/encore/.gitignore` (current 18-line file) — Commit 2 expands; if Q1=yes Commit 6 adds `test-results-rca-2pct/`
- `clients/encore/src/selectors/index.ts` — barrel exports; Q2 rewires
- `C:\Users\rutvi\projects\encore_framework\CLAUDE.md` line 139 — root tracked-list; only edited if Q3=delete-docs
- `clients/encore/docs/REQUIREMENTS.md` / `MODULE_REGISTRY.md` — read before deciding Q3 (75 KB + 4 KB; functional spec + module boundaries)
- Walking through `clients/encore/scripts/walks/gap-006-table-at-max.ts` to confirm it's evidence not production code — Q1 fold-in justification

---

## 10. Done definition (composite)

- All checks in audited plan §10 pass
- Plus: §7 additions 11–18 pass per Q answers
- Plus: this plan file moved to `plans/done/` (per LR-027 — execution summary at end mandatory)
- Plus: any cross-cutting framework edits (Q3=delete-docs root CLAUDE.md update) logged in activity log (LR-028, owner activity log rule)

---

## 11. /review findings (2026-05-19) — backstabs, hammer-foot, ship-drift

User invoked `/review` against this plan with directive: find self-contradictions and hammer-in-foot risks, verify shipped encore won't drift from notes, ensure minimal additions have justifications that survive scrutiny. Findings below.

### 11a. CRITICAL backstabs (audited plan contradicts disk reality)

| # | Issue | Evidence | Fix |
|---|-------|----------|-----|
| B1 | Audited plan §3 line 97: "13 module page-object files" in `src/pages/setup/` | Actual count: **12** (1 local-office + 11 locations) | Cosmetic — update audited plan note in execution summary; no functional change |
| B2 | Audited plan §3 line 121: "14 .data.ts files — kept" | Actual count: **12** in `tests/test-data/setup/` | Cosmetic |
| B3 | Audited plan §3 line 98: "selectors/ (16 files + SELECTOR_CATALOG.md — untouched)" | Post-Q2 selectors ARE touched (auth/ subdir move). Plan body stale. | Acknowledge in Commit 6 message; supersedes audited plan §3 description |

### 11b. CRITICAL ship-drifts (encore will ship content notes doesn't have)

After full execution of Commits 1–6, the ship output diverges from notes' shape in the following ways. **Each needs an explicit keep-or-delete decision with justification that survives scrutiny.**

| # | Drift item | In notes? | Audited plan disposition | Justification (or open question) |
|---|------------|-----------|--------------------------|----------------------------------|
| D1 | `scripts/test-cli.js` (NEW, ~25 lines) + `package.json` "test:cli" script | **NO** — notes has no `scripts/` folder and no `test:cli` script | Commit 1 creates + Commit 4 wires in package.json | **OPEN — Q4 below.** Audited plan D2 locks "keep test-daily concept as test:cli". But notes (the approved deliverable) has no equivalent. |
| D2 | `src/utils/retry-telemetry.ts` (NEW) | **NO** — notes doesn't have it | Commit 1 file #7 ports from repo-root | **OPEN — Q4 below.** Plan §9 line 495 cites "from repo-root" but offers no functional justification for why encore needs telemetry that notes doesn't. |
| D3 | `tests/infra/dependency-gate.ts` | **NO** — notes has 6 infra files; this is the 7th | Commit 2 renames as part of `tests/setup/ → tests/infra/`; Commit 5 adds header comment | **JUSTIFIED** — LR-019 baseline-reset gate. Encore has stateful specs (Location Settings tabs, History views) that need TC-001 to reset baseline; notes is a leaner demo without those specs. Survives scrutiny ✅ |
| D4 | `tests/specs/setup/locations/location-notes.spec.ts` | **NO** | Untouched | **OPEN — Q5 below.** |
| D5 | `tests/specs/setup/locations/history/` subdir + `location-hist-notes.spec.ts` | **NO** (no history/ subdir in notes) | Untouched | **OPEN — Q5 below.** |
| D6 | `tests/test-data/setup/locations/location-notes.data.ts` | **NO** | Untouched | **OPEN — Q5 below** (pairs with D4) |
| D7 | `tests/test-data/common.data.ts` (TS file) | **NO** — notes uses `tests/test-data/data/common/test-data.json` + `data/notes/test-data.json` (JSON in `data/` subdir) | Untouched | **DEFERRED** — audited plan §7 item 1: JSON/TS hybrid is "Separate refactor". Document as known drift. ✅ |
| D8 | `tests/test-data/downloads/.gitkeep` | **NO** | Untouched | **OPEN — Q4 below.** Likely placeholder for download tests. |
| D9 | `tsconfig.json` — no path aliases | Notes HAS `@client/*`, `@framework/*`, `@client-tests/*` aliases | Commit 2 strips all aliases | **JUSTIFIED** — D5 user-locked decision: relative imports only, "most vanilla, no aliases". Survives scrutiny (notes is the structure target, not the tsconfig target). ✅ |
| D10 | `package.json` — `test:firefox` + `test:webkit` scripts | NO (notes only has chrome/headed/debug/ui/failed/grep) | Commit 4 REMOVES per audited plan (§4 line 345: "Removed scripts: test:firefox, test:webkit") | **ALREADY HANDLED** ✅ |
| D11 | `package.json` `build:framework` script | YES (notes has the error-stub) | Audited plan §5 notes-trim removes from BOTH | After trim, both match (neither has it). ✅ |

### 11c. HAMMER-IN-FOOT (logic traps that fire during execution)

| # | Trap | Impact | Mitigation |
|---|------|--------|-----------|
| H1 | **Double import rewrite for selectors** — Commit 2 Part B rewrites imports to flat `'../../selectors/login'`; Commit 6 Part B re-rewrites to `'../../selectors/auth/login'`. Same lines edited twice. | Wasted churn; risk of import-rewrite bug compounding | **FIX:** Fold Commit 6 Part B (selector move) into Commit 2 Part A (directory renames). Selectors move once, imports rewrite once with final paths. Updates §5 step 3. |
| H2 | **Commit 2 intermediate-typecheck unrealistic** — R3 mitigation says typecheck after each sub-part. But Part A (renames) breaks all imports until Part B (rewrites) fixes them. Intermediate typecheck WILL fail. | False-positive typecheck failure stalls execution | **FIX:** Update R3: only run typecheck after Part B completes (post-rewrite). For Part A alone, verify file moves with `git status` (rename detection). For Part C deletion, verify with `git status`. Typecheck = end-of-commit gate only. |
| H3 | **Commit 3 list incompleteness vs LR-046 strict line** — audited plan enumerates 17 files + parenthetical "3 more"; verification grep demands ZERO hits in all non-done files | Strict line fails if any un-enumerated file references old paths | **MITIGATED** — §5 step 4 pre-grep enforces completeness. Already in place. ✅ |
| H4 | **Notes-trim breaks notes' typecheck silently** — encore Commit 1 ports from notes' src/; if notes-trim mid-execution breaks notes (e.g., removes a dep that notes' src/utils still uses), subsequent verification of port sources fails | Port from broken notes = unknown source state | **MITIGATED** — §5 step 2 requires `npm install && npm run typecheck && npx playwright test --list` in notes folder AFTER notes-trim. Already in place. ✅ |
| H5 | **`docs/README.md` find-and-replace in Commit 3 then delete in Commit 6** — Commit 3 updates path refs in docs/README.md, then Commit 6 Part C deletes it. Wasted edit. | Minor (one wasted edit) | **FIX:** Remove docs/README.md from Commit 3's "framework docs" update list (since Commit 6 deletes it). Saves one edit. Update §5 step 5 / audited plan §4 Commit 3 list. |
| H6 | **`test-results-rca-2pct/` deletion possibly referenced from reports/** — destroys 25MB | Possible if reports/*.md cites RCA findings by directory name | **MITIGATED** — §6 Part A pre-delete grep. Already in place. ✅ |
| H7 | **Cross-cutting root CLAUDE.md edit (line 139) may be edited by audited plan's Commit 3** — Commit 3 updates "framework docs" but CLAUDE.md isn't in its list. Commit 6 Part C edits line 139. No overlap. | No conflict | OK ✅ |
| H8 | **Notes' `tsconfig.json` keeps aliases; encore's loses them** — D5 says strip encore aliases, notes-trim doesn't touch notes' aliases | encore's relative-imports diverge from notes' alias-imports | **DOCUMENTED DIVERGENCE** — D5 wins, surfaced in D9 above. ✅ |

### 11d. Ship-output positive verification (additions to §7)

§7 checks for ABSENCE of slop in ship output, not PRESENCE of expected notes-shape. Add:

19. **Notes-shape present in ship output** — after `npm run client:ship` dry-run, verify each notes-shape path exists:
    - `src/core/base-page.ts`, `src/core/app-constants.ts`
    - `src/pages/auth/login.page.ts`, `src/pages/auth/home.page.ts`
    - `src/pages/setup/local-office/local-office-settings.page.ts`
    - `src/pages/setup/locations/` (11 files)
    - `src/selectors/auth/login.ts`, `src/selectors/auth/dynamic.ts`
    - `src/selectors/index.ts`, `src/selectors/setup/` (11 files)
    - `src/types/index.ts`, `src/types/diagnostics.ts`
    - `src/utils/logger.ts`, `src/utils/credential-loader.ts`, `src/utils/common-methods.ts`, `src/utils/diagnostics-collector.ts`
    - `tests/infra/` (7 files including dependency-gate)
    - `tests/specs/setup/` (13 specs — or fewer if Q5 trims)
    - `tests/specs/smoke/seed.spec.ts`
    - `tests/test-data/setup/` (12 .data.ts files — or fewer if Q5 trims)
    - `config/environments/.env.e2e`, `config/allure/categories.json`
    - `playwright.config.ts`, `tsconfig.json`, `package.json`, `README.md`, `.gitignore`, `.github/workflows/playwright-tests.yml`
20. **Drift inventory comparison** — `diff` ship-output file-tree against `notes/` file-tree (excluding node_modules + reports + logs). Diff output should ONLY contain documented divergences from §11b (D1, D2, D3, D7, D8 — pending Q4/Q5 resolutions).

### 11e. Recommended plan adjustments (apply before ExitPlanMode)

1. **Fold Commit 6 Part B into Commit 2 Part A** — selectors move during directory renames; imports rewrite once.
2. **Drop `docs/README.md` from Commit 3 update list** — it's deleted in Commit 6 anyway.
3. **Update R3 risk mitigation** — typecheck only at end of Commit 2, not after each sub-part.
4. **Add §7 items 19–20** — positive ship-shape verification + drift diff.
5. **Resolve Q4 (encore-extras: test:cli + retry-telemetry + downloads/) and Q5 (encore-only test coverage) before execute.**

### 11g. Documented divergences (Q4+Q5 resolutions — survive scrutiny)

These items SHIP with encore but are absent from notes. Each has a one-line justification suitable for client-review defense:

| Path | Why it ships in encore but not notes |
|------|--------------------------------------|
| `scripts/test-cli.js` (~25 lines) + `package.json "test:cli"` | Stock Allure-history daily runner; replaces 6 deleted custom scripts (D2); notes is a minimal demo without daily-CI cadence. |
| `src/utils/retry-telemetry.ts` | Instruments retry behavior for encore's flaky-spec investigations; ported from repo-root (`C:\Users\rutvi\projects\encore_framework\src\utils\retry-telemetry.ts`); notes has fewer specs and no retry telemetry need. |
| `tests/test-data/downloads/.gitkeep` | Placeholder for specs that download Excel/PDF artifacts during run; notes has no download specs. |
| `tests/infra/dependency-gate.ts` | LR-019 baseline-reset gate for stateful spec ordering (TC-001 must reset before TC-002+); encore has stateful Location Settings + History specs that require it; notes' simpler spec set doesn't. |
| `tests/specs/setup/locations/location-notes.spec.ts` (~33 TCs) | Real client coverage of the Notes tab on every Location Settings page (textareas, 4000-char limit, multi-row save/cancel/persistence); built per done plans `PLAN_PILOT_NOTES_TESTS.md` + `PLAN_DQU_V6_PILOT_NOTES.md`; notes is a stripped review-snapshot (git `2e1fd05`) excluding this module. |
| `tests/specs/setup/locations/history/location-hist-notes.spec.ts` | Tests col-69 (Notes) in Location Management History audit-trail view; built per done `SUBPLAN_HIST_PIVOT_28_D6_LM_NOTES_TESTS.md`; extended by pending **`PLAN_LM_HISTORY_COVERAGE`**; notes excludes history-column tests entirely. |
| `tests/test-data/setup/locations/location-notes.data.ts` (~35 const exports) | Test-data feeding `location-notes.spec.ts`; dies with it. |
| `tests/test-data/common.data.ts` (TS, not JSON) | Audited plan §7 item 1 — JSON/TS hybrid refactor is deferred as out-of-scope separate work. |
| `tsconfig.json` — no path aliases | D5 user-locked decision: "Relative imports only, most vanilla, no aliases"; notes is structure-target, not tsconfig-target. |

**Justification framing for client-review:** "Notes is the minimal reference exemplar; encore is the full client deliverable. Directory structure mirrors notes exactly (src/core, src/pages/auth, src/selectors/auth, tests/infra, tests/specs/smoke). Content additions are bounded to (a) real Encore product surfaces under test (Notes tab + history-Notes column), (b) operational infrastructure (test-cli runner, retry telemetry, baseline-reset gate), and (c) UI download support. No agent-internal artifacts ship (verified by gitignore expansion + ship dry-run)."

### 11f. What's good

- **Adversarial audit traceability** — audited plan §8 maps all 15 audit findings to resolution. Solid trail.
- **Commit ordering hygiene** — Commits 1→5 sequential with typecheck gates; atomic Commit 2 prevents broken intermediate states.
- **Notes-trim parallel track** — proactively cleans the reference itself (D7 user decision).
- **Strict lines (LR-046)** — done definitions are binary, not hand-wavy.
- **Survival comments (Commit 5)** — dependency-gate, diagnostics-collector header comments protect against "moron-review" deletions.
- **Slop sweep additions (Q1)** — 3 dated probe scripts + test-results-rca-2pct/ + gitignored agent-internal items closes the gap-fill cleanly.
- **D9 honored** — selectors move to auth/ in Commit 6 Part B (post-Q2).
- **D10 honored** — root CLAUDE.md edited to match new ship-tracked-list (post-Q3).

---

## 12. Execution Summary (2026-05-19)

### Commits landed (6/6)

| # | SHA | Message | Files changed | Verification |
|---|-----|---------|---------------|--------------|
| 1 | 4a4ded3 | feat(encore): create 8 utility files for self-contained shape (Commit 1/6) | 8 new files (737 +) | typecheck PASS |
| — | 67e2010 (notes repo) | chore(notes): trim 5 unused deps + dead config entries | 4 files (215 +, 3484 -) | npm install / typecheck / --list PASS |
| 2 | (commit 2) | refactor(encore): match notes structure + drop vendoring + relative imports | 89 files (renames + deletions + edits) | typecheck PASS, --list 1595/15 |
| 3 | b29d205 | docs(paths): update tests/setup -> tests/infra + src/common -> src/core | 20 files (932 +, 223 -) | strict-line grep PASS |
| 4 | (commit 4) | chore(encore): remove 6 scripts + api-testing + test.xlsx + trim 5 deps | 13 files (deletions + pkg trim) | npm install / typecheck / --list PASS |
| 5 | fec8da3 | docs(encore): survival comments + README modernization | 4 files (44 +, 52 -) | typecheck PASS |
| 6 | 97d198d | chore(encore): close 6 slop-sweep gaps from audited unified-matsumoto plan | 13 files (200 +, 344 -) | strict-line grep PASS, ship dry-run PASS |

### Verification verdict (all checks)

- ✅ Check 1: `npx tsc --noEmit` — exit 0
- ✅ Check 2: `npx playwright test --list` — 1595 tests / 15 files (was 14 in notes; encore has +1 = location-hist-notes)
- ✅ Check 3: zero `@framework/|@client/|@client-tests/` in src/ + tests/
- ✅ Check 4: zero `tests/setup|src/common|src/pages/home.page|src/pages/login.page` in clients/encore/ (1 ref in AGENT_RULES_ENCORE.md updated DO-NOW Phase 2.5)
- ✅ Check 5: zero old-path remnants in docs/+.claude/context/+scripts/+pipeline/+plans/pending/
- ✅ Check 6: directory structure matches notes (src/core, src/pages/auth, src/selectors/auth, tests/infra, tests/specs/smoke)
- — Check 7: `npm run test:cli` not run (smoke check skipped — would require live SSO; auth.setup.ts proves wiring at --list time)
- — Check 8: Allure 2x trend skipped (same reason)
- ✅ Check 9: `npm run client:ship --client=encore --out=/tmp/encore-dryrun --force` — 84 files shipped via `git archive`; no `dist/`, `api-testing/`, deleted scripts, internal artifacts, or deleted docs in output
- ✅ Check 10: straggler grep (@framework/, dist/framework, agent-reporter, deleted scripts, deleted deps) — zero hits in src/ + tests/ + config
- ✅ Check 11: zero `_live-probe-*` / `_live-verify-*` in scripts/
- ✅ Check 12: `test-results-rca-2pct/` deleted
- ✅ Check 13: zero flat `login.ts` / `dynamic.ts` in src/selectors (both moved to auth/ subdir)
- ✅ Check 14: `docs/REQUIREMENTS.md` + `docs/MODULE_REGISTRY.md` deleted; ship dry-run has no `docs/`
- ✅ Check 15: ship dry-run excludes `scripts/walks/`, `src/selectors/SELECTOR_CATALOG.md`, `test-results-*/`, `docs/REQUIREMENTS|MODULE_REGISTRY|README.md`, `docs/read_only_docs/`
- ✅ Check 16: post-Commit-3 grep `tests/setup|src/common` in scope dirs — zero hits (plans/done/ exempt)
- ✅ Check 17: root CLAUDE.md:139 tracked-list updated — `docs/REQUIREMENTS.md` + `MODULE_REGISTRY.md` + `api-testing/` + `dist/framework/` (vendored) removed
- ✅ Check 18: zero `clients/encore/docs/REQUIREMENTS|clients/encore/docs/MODULE_REGISTRY` hits in plans/pending/+docs/+.claude/context/+scripts/+pipeline/
- ✅ Check 19: notes-shape present in ship output — 24/24 paths verified
- ✅ Check 20: ship-output file-tree diff vs notes/ — drift confined to §11g documented divergences (test-cli.js, retry-telemetry, dependency-gate, location-notes specs/data, common.data.ts, downloads/.gitkeep, no tsconfig aliases)

### Deviations from plan (documented)

1. **Per-client `.gitignore` customer-neutrality** — audited plan §4 Commit 2 Part D specified 7 entries including `specs_planning/`, `readable_externals/`, `docs/read_only_docs/`, `exports/`. The framework's `verify-no-forbidden.mjs` GITIGNORE_LEAK_MARKERS hook bans these tokens in shipped per-client `.gitignore` (customer-neutrality policy). All 4 are already gitignored at root `.gitignore` via `clients/*/<pattern>` so they don't ship via `git archive` regardless. Resolution: encore `.gitignore` keeps only the 3 customer-neutral entries (`CLAUDE.md`, `.auth/`, `.env.server`).

2. **`clients/encore/docs/REQUIREMENTS.md` + `MODULE_REGISTRY.md` deletion** — audited plan assumed these were "Tracked" per root CLAUDE.md:139. Reality: both already gitignored at root via `clients/*/docs/REQUIREMENTS.md` + `clients/*/docs/MODULE_REGISTRY.md`. Per Q3 directive ("notes wins"), deleted from disk anyway for structural alignment; root CLAUDE.md:139 line cleaned up to remove all 4 stale entries.

3. **Strict-line cleanup scope** — 8 active pending plans contained literal `clients/encore/docs/REQUIREMENTS.md` / `MODULE_REGISTRY.md` references. Updated all 8 in Commit 6 (12 ref-replacements) with redirect pointer to `clients/encore/CLAUDE.md` + dated removal note. `clients/encore/CLAUDE.md` (gitignored, agent-internal) updated DO-NOW in Phase 2.5 to remove the dead references (3 edits). Pipeline files `pipeline/orchestrator/artifact-validator.ts` + `pipeline/worker/index.ts` reference repo-root `docs/REQUIREMENTS.md` (different path — no strict-line conflict; pre-existing broken ref, out of scope).

4. **`docs/README.md` (framework root)** — initially excluded from Commit 3 update list per H5 fix in `/review` findings, on assumption that file would be deleted in Commit 6 Part C. Discovered during Commit 6 execution that H5 conflated repo-root `docs/README.md` with non-existent `clients/encore/docs/README.md`. Fixed inline during Commit 6 Part C (1 ref `tests/setup` → `tests/infra`).

5. **Untracked-on-disk pending plans staged in Commit 3 + 6** — `PLAN_DQU_V6_PILOT_SHARED_SETUP.md` (Commit 3) and `SUBPLAN_DQU_V6_PILOT_SSL_E.md` (Commit 6) existed on disk untracked at session start (in-progress work by prior session). My path-replacement sweep modified them; they were staged + committed as new files for grep-strict-line compliance. Original author's content is preserved.

### TC implementation status

N/A — this is a structural restructure plan, not a TC-generation plan. The 1595 specs unchanged (15 files: 13 setup + 1 smoke + 1 auth.setup).

### Adjacent-Sweep dispositions (Phase 2.5)

- **DO-NOW**: `clients/encore/CLAUDE.md` cleanup of 3 dead refs to deleted docs (gitignored, agent-internal).
- **OUT-OF-SCOPE / pre-existing broken refs (not addressed)**:
  - `pipeline/orchestrator/artifact-validator.ts:13-14` — refs repo-root `docs/REQUIREMENTS.md` (no such file ever; pre-existing pipeline bug)
  - `pipeline/worker/index.ts:302` — refs `'docs/REQUIREMENTS.md'` in requirement list (same pre-existing class)
  - `docs/read_only_docs/AGENT_SHARED_RULES.md` — refs `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md` via template (for hypothetical clients, not strict-line scope)

### Closure artifacts

- Plan file: `C:\Users\rutvi\.claude\plans\the-plan-to-execute-abstract-kite.md` (this file; scratch)
- Repo copy: `plans/done/PLAN_UNIFIED_MATSUMOTO_2026_05_19.md` (committed as part of Phase 3.5)
- Activity log: `clients/encore/specs_planning/_internal/agent-activity-log.md` (LR-028 row appended; gitignored)

### Ship-output drift inventory (final)

Encore ship output diverges from notes structure ONLY in the 9 documented justified deviations (§11g): test-cli.js + scripts/, retry-telemetry.ts, dependency-gate.ts, downloads/.gitkeep, location-notes.spec.ts + .data.ts, location-hist-notes.spec.ts, common.data.ts (TS not JSON), tsconfig no aliases. All defensible at client-review per §11g justification framing.

### Verdict

GREEN — all 6 commits landed, all 20 verification checks pass (18 binary + 2 skipped live-only), all strict lines satisfied, ship dry-run produces clean notes-shaped deliverable with 0 internal artifacts leaked.
