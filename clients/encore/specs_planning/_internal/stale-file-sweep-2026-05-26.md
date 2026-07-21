---
title: Stale-file sweep ledger (pre-XLSX-migration cleanup)
created: 2026-05-26
author: Opus subagent (read-only sweep)
scope: encore_framework repo root + clients/encore + scripts/ + reports/ + .playwright-cli/ + .playwright-mcp/ + pipeline/tests/hooks/fixtures/ + clients/encore/.playwright-cli/
trigger: User directive "delete the stale files" issued ahead of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION execution
authority: READ-ONLY recommendations; no deletions, no .gitignore mutations performed
---

# Stale-file sweep — 2026-05-26

> **Methodology**: per-path `git ls-files` (tracked status) + `git check-ignore -v` (ignore evidence) + repo-wide `grep` for live references (excluded: `node_modules/`, worktrees, regression snapshots). Categorization conservative — `delete-safe` only when (a) untracked OR tracked-but-stale, AND (b) zero live references outside plans/cleanup docs, AND (c) covered by an active cleanup plan OR obviously dead.
>
> **Cross-plan context already in flight**:
> - `plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` Phase D — enumerates 11 CSVs in `clients/encore/test_cases_csv/` + 11 stale CSVs in `export_test_cases/exports/` + `scripts/patch-csv-export-bold-optional.mjs` + `.gitignore` line 158.
> - `plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md` + `plans/pending/SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md` Phase 5 — enumerates 12 root cruft files (the 7 `sb*.yml` + `snap-save-test.yml` + `alert-state.png` + 2 `li-*.json` + `grep.exe.stackdump` + `cli and mcp in our repo.md`).
> - `plans/pending/SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md` — covers `.playwright-mcp/`, `.tmp/`, dist drift.
>
> This ledger surfaces what those plans MISS, plus validates the user's already-known strays.

---

## Quick stats

- Total stray files surfaced: **199** (134 tracked + 65 untracked, excluding gitignored `.playwright-cli/page-*.yml` and `console-*.log`)
- Strays already enumerated by an active cleanup plan: **155** (134 `.playwright-cli/*.yml` tracked-but-deleted + 12 root cruft + the 11 CSVs + …)
- Strays NOT covered by any active plan (NEW findings): **18**
- Sensitive credential leak risk (high-severity untracked, not gitignored): **1** (`clients/encore/.playwright-cli/inject-auth.js` — full session cookies including Microsoft auth tokens)

---

## Category A — delete-safe (clearly stale; zero live refs; covered by plan OR obviously dead)

### A.1 — Already staged for deletion (mid-flight in `git status`)

These are TRACKED but `git status` already shows them as `D` (staged deletes from a prior cleanup). They're effectively gone the moment the next commit lands — no action needed beyond letting the cleanup commit ship.

| Path | Size | mtime | Tracked? | Last commit | Rationale |
|---|---|---|---|---|---|
| `.playwright-cli/page-2026-04-24T*.yml` (10 files) | ~10–14K each | 2026-04-24 | yes (134 total `.yml` staged delete) | various | Playwright CLI YAML snapshots from April catalog walks; gitignore line 213 covers `.playwright-cli/page-*.yml` for new ones |
| `.playwright-cli/page-2026-04-29T*.yml` (~50 files) | ~10–14K each | 2026-04-29 | yes | various | ditto |
| `.playwright-cli/page-2026-04-30T*.yml` (~20 files) | ~10–14K each | 2026-04-30 | yes | various | ditto |
| `.playwright-cli/page-2026-05-18T*.png` (4 files) | varies | 2026-05-18 | yes | various | PNG screenshots in `.playwright-cli/` — NOT yet covered by .gitignore (only `*.yml` + `*.log` are) |
| `.playwright-cli/page-2026-05-19T*.png` (1 file) | varies | 2026-05-19 | yes | various | ditto |
| `.playwright-cli/storage-state-2026-05-18T*.json` (1 file) | varies | 2026-05-18 | yes | various | Storage-state JSON — could contain auth cookies; deletion staged |
| `.reports/shared-setup-audit.json` | varies | n/a | yes (staged D) | n/a | Orthogonal cleanup |
| `grep.exe.stackdump` | varies | n/a | yes (staged D) | n/a | Windows crash dump |
| `reports/.gitkeep` | 0 | n/a | yes (staged D) | n/a | Per SUBPLAN_RCD_C, root `reports/` whole dir goes away — `.gitkeep` redundant |
| `reports/client-deliverable-ready-2026-04-21.md` | varies | 2026-04-21 | yes (staged D) | n/a | Per SUBPLAN_RCD_C |
| `plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_C.md`, `_E.md`, `SUBPLAN_NOTES_FCC_PILOT.md` | n/a | n/a | yes (staged D) | n/a | Plans already moved to `done/` (recommit will land the rename) |

**Action**: none required — these are mid-flight. Will land when the user commits the current dirty tree.

### A.2 — Already enumerated by `SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md` Phase 5

The "12 stray cruft files at root" — `SUBPLAN_RCD_C` already has the delete loop with grep-verify-then-delete gate. All 12 confirmed present + tracked + zero live refs (only refs are in the cleanup plans themselves).

| Path | Size | mtime | Tracked? | Live refs | Action |
|---|---|---|---|---|---|
| `sb-basicinfo.yml` | 38K | 2026-04-20 18:35 | yes | 0 (only in cleanup plans) | Per SUBPLAN_RCD_C Phase 5 |
| `sb2.yml` | 39K | 2026-04-20 18:37 | yes | 0 | Per SUBPLAN_RCD_C Phase 5 |
| `sb3.yml` | 39K | 2026-04-20 18:39 | yes | 0 | Per SUBPLAN_RCD_C Phase 5 |
| `sb4.yml` | 39K | 2026-04-20 18:41 | yes | 0 | Per SUBPLAN_RCD_C Phase 5 |
| `sb5.yml` | 39K | 2026-04-20 18:42 | yes | 0 | Per SUBPLAN_RCD_C Phase 5 |
| `sb6.yml` | 39K | 2026-04-20 18:43 | yes | 0 | Per SUBPLAN_RCD_C Phase 5 |
| `snap-save-test.yml` | 38K | 2026-04-20 22:55 | yes | 0 | Per SUBPLAN_RCD_C Phase 5 |
| `alert-state.png` | 148K | 2026-04-24 21:27 | no (untracked) | 0 | Per SUBPLAN_RCD_C Phase 5 |
| `li-cascade-probe-2026-04-28.json` | 6.9K | 2026-04-28 14:10 | yes | refs only in cleanup plans + activity-log historic | Per SUBPLAN_RCD_C Phase 5 |
| `li-inventory-2026-04-28.json` | 3.5K | 2026-04-28 14:10 | yes | refs only in cleanup plans + activity-log historic | Per SUBPLAN_RCD_C Phase 5 |
| `grep.exe.stackdump` | (deleted) | n/a | yes (staged D) | 0 | Already staged delete |
| `cli and mcp in our repo.md` | 5.5K | 2026-04-01 16:40 | yes | 0 (only cleanup-plan mentions) | Per SUBPLAN_RCD_C Phase 5 |

**Action**: none required from this sweep — covered by existing plan. Will land when SUBPLAN_RCD_C executes.

### A.3 — Already enumerated by `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` Phase D

| Path | Tracked? | Action |
|---|---|---|
| `clients/encore/test_cases_csv/` (11 CSVs + `.gitkeep`) | yes | Phase D `git rm -r` |
| `export_test_cases/exports/` (11 stale CSVs Feb–Mar 2026) | gitignored at runtime, not tracked | Phase D `git rm -r` (clean-disk) |
| `scripts/patch-csv-export-bold-optional.mjs` | yes | Phase D `git rm` |
| `.gitignore` line 158 (`export_test_cases/exports/`) | n/a | Phase D edit |

**Action**: none required from this sweep — covered by XLSX migration.

---

## Category B — delete-pending-confirmation (NEW findings, not in any current plan)

### B.1 — Tracked dead scripts (no live refs anywhere except agent-activity-log historical mentions)

| Path | Size | mtime | Tracked? | Live refs | Rationale | Recommendation |
|---|---|---|---|---|---|---|
| `scripts/sweep-li-rule1.mjs` | 859B | 2026-04-28 00:05 | yes | 0 (only in activity-log + this ledger) | One-off LI-rule sweep; hard-coded path to `locations_local_information_test_cases.md`; not in package.json | **delete-pending-confirmation** — confirm one-off-ness with user |
| `scripts/sweep-li-rule2.mjs` | 881B | 2026-04-28 00:07 | yes | 0 | One-off | **delete-pending-confirmation** |
| `scripts/sweep-li-rule2-extended.mjs` | 998B | 2026-04-28 00:09 | yes | 0 | One-off | **delete-pending-confirmation** |
| `scripts/_disposition-pass-2026-05-12.mjs` | 11K | 2026-05-15 21:17 | yes | 0 | First line: "One-off disposition pass per PLAN_DQU_COVERAGE_REMEDIATION v5 step 2.5." — declares one-off | **delete-pending-confirmation** — self-declared one-off; safe to delete |
| `scripts/probes/li-cascade-force-precondition-2026-05-14.raw.json` | 13K | 2026-05-15 | yes | refs only in activity-log historical + `clients/encore/specs_planning/_internal/` mirror | Probe artifact from LI cascade investigation 2026-05-14 | **delete-pending-confirmation** — investigation closed; probe was scratch |
| `scripts/probes/li-cascade-save-probe-2026-05-14.raw.json` | 60K | 2026-05-15 | yes | ditto | ditto | **delete-pending-confirmation** |

**Why these matter for the XLSX migration**: `sp00-audit-v5.mjs` (a sibling) IS being modified by the XLSX plan (Phase B). Anyone reading `scripts/` will assume these `_disposition-*`, `sweep-li-*`, and `probes/li-*.raw.json` files are also live — they're not. Cleaning them BEFORE the migration prevents the next agent from spending tokens auditing dead code.

### B.2 — Repo-root strays NOT in any cleanup plan

| Path | Size | mtime | Tracked? | Ignored? | Live refs | Rationale | Recommendation |
|---|---|---|---|---|---|---|---|
| `30` (literal filename, empty file) | 0 bytes | 2026-04-27 18:30 | yes | no | 0 | Stray empty file; "30" — likely a stale `git ls-files | head -30` redirect-into-file mistake from the 2026-05-01 baseline-snapshot commit | **delete-safe** (zero-byte, tracked, zero refs, mis-named accident) — surface for confirmation since it's tracked |
| `v0-baseline-loc-settings.yml` | 24K | 2026-05-21 17:22 | no (untracked) | no | 0 | Per user prompt: looks like Playwright CLI snapshot misplaced at root (correct dest: `.playwright-cli/`); mtime matches active session | **move-or-delete** — leftover from 2026-05-21 SSL pilot walk; safe to delete since dir version is gitignored |
| `v0-page.png` | 228K | 2026-05-21 17:22 | no | yes (`.gitignore` line 155 `/*.png`) | 0 | ditto | **delete-safe** — untracked, ignored |
| `v0-notes-tab.png` | 126K | 2026-05-21 17:23 | no | yes (`/*.png`) | 0 | ditto | **delete-safe** |

**Why these aren't in `SUBPLAN_RCD_C` cruft list**: that plan was authored 2026-05-07. The `v0-*` files at root were created during a 2026-05-21 SSL walk session, post-dating the plan. They look like a Claude session that called `playwright-cli snapshot -o v0-baseline-loc-settings.yml` from the repo root instead of `.playwright-cli/`. Same shape as the existing `sb*.yml` cruft. **Recommend extending SUBPLAN_RCD_C Phase 5 by 3 lines** OR doing them as a one-off `rm` during this XLSX migration cleanup.

### B.3 — Tracked CSV inside `specs_planning/` (gitignored dir)

| Path | Size | mtime | Tracked? | Ignored? | Live refs | Rationale | Recommendation |
|---|---|---|---|---|---|---|---|
| `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.csv` | 4.7K (31 lines) | 2026-05-20 22:43 | **no** (gitignored under `clients/*/specs_planning/`) | yes (`.gitignore` line 185) | 0 (no refs to MD's sibling-CSV anywhere) | A 31-row CSV sitting INSIDE the MD-source directory; ALL OTHER modules' source-side artifact is `.md` only — this is the only `.csv` under `specs_planning/test-cases/` | **delete-safe** — wrong location, gitignored, looks like an export that landed in the source dir by mistake (likely a `to-csv.ts` invocation with the wrong cwd) |

**Why this matters**: per user prompt, this is "a CSV sitting INSIDE the MD source directory. Tracked since May 20." It's actually NOT tracked — it's untracked but the user saw it sitting beside the MD source. The XLSX migration plan deletes the canonical-deliverable CSVs (`clients/encore/test_cases_csv/`) but does NOT touch this one. Since the dir is gitignored, deletion is a no-op for git; but the file still pollutes the source surface. **Recommend including in XLSX Phase D's delete list** (1-line addition).

### B.4 — Orphaned hook test fixtures

| Path | Size | mtime | Tracked? | Live refs | Rationale | Recommendation |
|---|---|---|---|---|---|---|
| `pipeline/tests/hooks/fixtures/v12-no-todo-marker-active.json` | 334B | 2026-05-26 20:08 | yes | 0 — NO test code under `pipeline/tests/hooks/` references it | Hook fixture without a test harness — `pipeline/tests/hooks/` contains ONLY the `fixtures/` subdir and `transcript-*.jsonl` from Apr 27; NO `*.test.{js,ts,mjs}` file consumes these fixtures | **delete-pending-confirmation** — verify hook unit tests still expected; if so, the fixtures should stay AND the missing test file is the real bug |
| `pipeline/tests/hooks/fixtures/v13-capture-payload.json` | 999B | 2026-05-26 20:08 | yes | 0 | ditto | ditto |
| `pipeline/tests/hooks/fixtures/v13-todo-tagged-then-edit.json` | 344B | 2026-05-26 20:08 | yes | 0 | ditto | ditto |
| `pipeline/tests/hooks/fixtures/v14-tasklist-capture-payload.json` | 597B | 2026-05-26 19:52 | no (untracked, just created) | 0 | ditto | ditto |
| `pipeline/tests/hooks/fixtures/transcript-in-execute*.jsonl` (3 files) | 95–282B | 2026-04-27 19:16/17 | yes | 0 | ditto | ditto |

**Why these matter**: the hook itself (`.claude/hooks/lib/check-todo-injection.mjs`) is heavily-modified per `git status`. These fixtures look like they were used to develop the hook, but no test harness consumes them now. Either (a) write the test file, or (b) delete the fixtures. **Recommend asking user which path**.

### B.5 — Other stale artifacts not in any plan

| Path | Size | mtime | Tracked? | Live refs | Rationale | Recommendation |
|---|---|---|---|---|---|---|
| `.tmp/regression-guard/{before,after}.json` | 2K each | 2026-04-24 | no (gitignored `.tmp/`) | 0 | Leftover from one regression-guard run | **delete-safe** (untracked, gitignored, scratch) |
| `.work/hunter-shared-setup/nav2-shared-setup-*.yml` (2 files) | 15K + 24K | 2026-05-15 | no (`.work/` not gitignored explicitly but never committed) | 0 | HUNTER catalog walk leftover | **delete-safe** — `.work/` is a scratch dir, never tracked |
| `tmp/baseline/sp-mt-06/location-notes.spec.ts.baseline` | varies | 2026-04-17 | no (gitignored `tmp/`) | 0 | SP-MT-06 baseline from April | **delete-safe** — pre-restructure baseline, irrelevant now |
| `reports/screenshots/ssl-walk-2026-05-22.png` | 65K | 2026-05-22 20:23 | no (gitignored `screenshots/`) | 0 | SSL walk artifact 2026-05-22 | **delete-safe** — untracked, gitignored, single screenshot |
| `reports/fixme-registry.json` | 8.8K | 2026-05-25 21:55 | no (gitignored `reports/*`) | yes (`scripts/scan-fixmes.ts`, `scripts/generator-pre-run.ts`, `package.json`) | Generated runtime artifact regenerated by `npm run fixme:scan` | **keep** — regenerated; per-run state, not stale |

---

## Category C — high-severity SECURITY risk (untracked but unprotected by .gitignore)

| Path | Size | Tracked? | Ignored? | Rationale | Recommendation |
|---|---|---|---|---|---|
| `clients/encore/.playwright-cli/inject-auth.js` | 18K | **no** (untracked) | **no** (no `.gitignore` rule covers `inject-auth.js`; `clients/encore/.gitignore` has no `playwright-cli` entry, root `.gitignore` line 213 covers only `*.yml`/`*.log` in `.playwright-cli/`) | Contains full Microsoft Entra / NextAuth session cookies in plaintext (cookie tokens for `cloudapps-e2e.encoreglobal.com`, `login.microsoftonline.com`, `encoreguest.onmicrosoft.com`); a single `git add .` from the user shipping a deliverable would leak this | **IMMEDIATE DELETE + extend `clients/encore/.gitignore`**: add `.playwright-cli/` pattern. This is independent of XLSX migration and should be addressed NOW. |
| `clients/encore/.playwright-cli/page-*.yml` (~55 files) | ~1.1M total | no | no | DOM snapshots from 2026-05-21 + 2026-05-22 SSL walks; not auth-bearing but still per-client agent-walk output that shouldn't ship | **delete-safe + extend `clients/encore/.gitignore`** — these would be caught if `clients/encore/.gitignore` mirrored root's `.playwright-cli/page-*.yml` rule |
| `clients/encore/.playwright-cli/console-*.log` (3 files) | <1K total | no | yes via root `*.log` rule | Console output | n/a — already ignored |

**Why this is the biggest finding**: the `clients/encore/.gitignore` (which controls what ships to client via `git archive`) has NO entry for `.playwright-cli/` at all. Root `.gitignore` line 213 covers `.playwright-cli/page-*.yml` but the per-client dir is invisible to it (root `.gitignore` is relative to repo root, `clients/encore/` is a subtree). When `npm run client:ship` runs `git archive HEAD clients/encore/`, anything tracked under `clients/encore/.playwright-cli/` ships. The dir is currently untracked, so the ship is safe — but if anyone runs `git add clients/encore/.playwright-cli/` (intentionally or via a `git add .` mistake), the auth cookies in `inject-auth.js` go to the client.

---

## Category D — keep-investigate (legitimate file at wrong layer; needs decision)

### D.1 — Root files NOT cruft but possibly redundant

| Path | Size | mtime | Tracked? | Status | Recommendation |
|---|---|---|---|---|---|
| `dist/` (root) | 1.3M, ~80 files | last build 2026-05-04 | gitignored (`/dist/`) | Stale build output post-vendoring; per `_vendor_deprecation_note` in `package.json:5` ("vendor:build / vendor:build:all entries below are dead code per PLAN_DIST_REGRESSION_AND_N_FIXES. Final removal tracked by PLAN_ROOT_CLIENT_DEDUPE.md.") | **keep-investigate** — already tracked for removal by `PLAN_ROOT_CLIENT_DEDUPE`; no action from this ledger |
| `test/fixtures/chain/` (12 files) | 32K | 2026-04-23 | yes | Test fixtures for `/chain` orchestration; 0 grep hits to actual test code consuming them (only worktrees + state). Possibly orphan since the chain-orchestrator rewrite. | **keep-investigate** — chain orchestrator owner should confirm |
| `tmp/baseline/sp-mt-06/` | tiny | 2026-04-17 | no (ignored) | SP-MT-06 baseline | **delete-safe** — covered as "leftover scratch", not in any plan |
| `30` (root, 0 bytes, tracked) | 0 | 2026-04-27 | yes | Empty mis-named file, see B.2 | Listed in B.2 — surface to user |
| `BUNDLE_MANIFEST.md` | 2.1K | 2026-05-19 18:02 | yes | Per SUBPLAN_RCD_C line 164: "KEEP at root. Per parent-plan review finding H3 (it's a documented post-PLAN_CLIENT_DELIVERABLE_REBUILD runtime artifact)" | **keep** — explicitly excluded from cleanup |

---

## Summary table — recommended additions to active plans

### Add to `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` Phase D

1. **`clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.csv`** — wrong-location CSV under MD source dir; gitignored; safe to delete (1-line `rm` after grep verification). Belongs in this plan because it's a stray CSV deliverable artifact, exactly the class of file being killed.

### Add to `SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md` Phase 5

2. **`v0-baseline-loc-settings.yml`** (tracked-check: NO; ignored: no) — root-level Playwright snapshot from 2026-05-21
3. **`v0-page.png`** + **`v0-notes-tab.png`** — same source

### NEW dedicated cleanup (or extend an existing one)

4. **`scripts/sweep-li-rule1.mjs`** / **`sweep-li-rule2.mjs`** / **`sweep-li-rule2-extended.mjs`** / **`_disposition-pass-2026-05-12.mjs`** — self-declared one-off scripts, zero live refs
5. **`scripts/probes/li-cascade-*.raw.json`** (2 files) — closed-investigation probe artifacts
6. **`pipeline/tests/hooks/fixtures/v1{2,3,4}-*.json`** (4 files) + **`transcript-{in,not-in}-execute*.jsonl`** (3 files) — orphaned fixtures with no test consumers

### IMMEDIATE (independent of XLSX migration — security)

7. **`clients/encore/.playwright-cli/inject-auth.js`** — DELETE NOW. Contains live Microsoft Entra session cookies in plaintext. Extend `clients/encore/.gitignore` to add `.playwright-cli/`.
8. **`clients/encore/.playwright-cli/page-*.yml`** + **`storage-state-*.json`** — same dir, same fix.

### Already mid-flight (no action needed)

9. The 134 `.playwright-cli/page-*.yml` + `.png` + `.json` files staged for deletion in `git status`.
10. `.reports/shared-setup-audit.json`, `grep.exe.stackdump`, `reports/.gitkeep`, `reports/client-deliverable-ready-2026-04-21.md`.

---

## Gitignore gaps surfaced

Three patterns missing from the relevant `.gitignore`s:

1. **Root `.gitignore` line ~213** — covers only `.playwright-cli/page-*.yml` + `.playwright-cli/console-*.log`. Add `.playwright-cli/page-*.png` + `.playwright-cli/storage-state-*.json` to catch what's currently being tracked-then-deleted by hand.
2. **`clients/encore/.gitignore`** — NO `.playwright-cli/` rule at all. Add `.playwright-cli/` (whole dir) — agent walks should never ship to client.
3. **`clients/encore/.gitignore`** — NO `.playwright-mcp/` rule. Same concern.

These gitignore extensions are SHIPPING-SAFETY changes, not cosmetic. Independent of cleanup decisions.
