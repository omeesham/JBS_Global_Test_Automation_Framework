**Status**: Pending  
**Priority**: HIGH  
**PermissionMode**: default  
**Date**: 2026-07-18  
**Owner**: OWNER  
**Source**: Whole-repo council slop sweep — 16-lot machine-denominator audit (slop0 through slop3, cross-provider council review)

---

# PLAN_REPO_SLOP_SWEEP — Full Cleanup of Everything Claude and Copilot Have Touched

## Objective

Clean everything Claude and Copilot have ever written — inside this repository and outside it. The in-repo audit identified ~412 actionable findings (347 DELETE, 64 RELOCATE, 1 RENAME) across all tracked, untracked, and ignored files. A separate ~1.9 GB out-of-repo denominator (`~/.claude/`, `~/.copilot/`, `%LOCALAPPDATA%/Temp/claude/`) has never been in scope until now; its lots are enumerated in the "Out-of-Repo Scope" section below.

**Nothing executes without Rutvik GO.** Category C and D lots require explicit per-item GO before any action is taken. Category A and B lots are dispatchable once Rutvik confirms the overall plan.

---

## ⚠ TRI-PLAN MUTUAL GATE — welded to ULTRAAUDIT + FIX_WAVE (2026-07-20, Rutvik-directed)

These three plans are ONE gated unit — running any ONE obligates the other two: `PLAN_COPILOT_INTEGRATION_ULTRAAUDIT` ⇄ `PLAN_ULTRAAUDIT_FIX_WAVE` ⇄ `PLAN_REPO_SLOP_SWEEP` (this). The shared re-hunt (full **1,853** machine denominator) + fix-list ⇄ delete-list reconciliation is performed **ONCE and shared** across all three — whoever runs first performs it; the other two CONSUME the artifact, they do not repeat it. **Shared artifact path**: plans/pending/_TRIPLAN_RECONCILIATION.md — produced once by whichever plan runs first; the other two consume it and do not regenerate it. Required sections: collision matrix, staged-artifact register, folded-in new S0/S1 findings. **Staleness note (2026-07-30)**: this roster was enumerated 2026-07-18. The file is 1,937 total lines / 1,901 non-blank — the 1,901 figure is a NON-BLANK count and must not be used as a line offset (doing so silently drops the final ~36 rows, including website/frontend entries such as website/frontend/src/data/jiraconfig.txt). Commits have landed since enumeration. Re-run the enumerator and diff against this roster before certifying any sweep complete. The ULTRAAUDIT parent now also carries this gate (previously naked — its `_ULTRAAUDIT_MANIFEST.md` ~197-file denominator is SUPERSEDED by the 1,853 roster; this makes Owner Decision (e) below accurate). The mechanics for this plan are STEP 0 of the Execution Order immediately below.

---

## Execution Order (READ FIRST — baked 2026-07-19, Rutvik-directed)

This plan is PARKED. A future (rested) session runs these IN ORDER — do not rush to execute:

1. **STEP 0 - Upgrade + reconcile ULTRAAUDIT FIRST (mandatory; Owner Decision (e) = YES).** Before ANY Category C/D lot here touches a `.claude/**` harness file, run the `PLAN_ULTRAAUDIT_FIX_WAVE.md` upgrade: re-run its bug hunt over the full machine denominator (the local slop sweep denominator artifact, not tracked) and reconcile its fix-list against this sweep's DELETE-list. Reason: both plans touch the same harness files - fixing a file another lot deletes (or deleting one another lot fixes) is exactly the collision this prevents. See `PLAN_ULTRAAUDIT_FIX_WAVE.md` -> "Execution Prerequisite".
2. **STEP 1 — Category A** (safe untracked/ignored debris: root walk-dumps, scratch dirs, temp logs) may run independently of Step 0 — it touches no tracked source ULTRAAUDIT cares about. **Out-of-repo Category A lots (ORP-A1 through ORP-A3 in "Out-of-Repo Scope") are also independent of Step 0 and may run at this step.**
3. **STEP 2 — Categories B/C/D** run only AFTER Step 0's reconciliation, and only for items whose Owner Decision (below) is answered. C/D are per-item GO. **Out-of-repo Category C lots (ORP-C1 memory-prune — "Out-of-Repo Scope" section; Lot C3 pending-plan triage — Category C section) wait alongside in-repo C/D — per-item GO required for each.**
4. **Answer the Owner Decisions batch first** — an unanswered decision means that lot waits, it does not proceed on a guess.

No step is skipped for speed. If anything is unclear at run time: STOP, re-read this block + Owner Decisions — do not improvise.

---

## Why ULTRAAUDIT Missed This

The prior audit built its file denominator by **model judgment** — "list the framework files" — instead of mechanical enumeration. Proven consequences:

1. **~1,080 non-client files were simply never in scope.** No judgment pass volunteers files it doesn't think to name. The slop2 audit only reached them because reviewers re-derived denominators mechanically (`git ls-files` triad + `Get-ChildItem -Force` full-disk walk, as in LOT-05 review).

2. **All gitignored on-disk cruft was structurally invisible.** Judgment enumeration starts from tracked files and mental maps. The `/.gitignore` had already hidden 52,096 ignored on-disk files from every `git status` any model ever saw. The 19 walk-dump YMLs at root, the 35-file `.recover-scratch/` dir, the 5 tavily dist/ compiled artifacts — none appeared in any prior audit because gitignore had already made them invisible to the judgment pass.

3. **Reference-counting inflated KEEPs.** Generated `plans/INDEX.md`, closure-audit manifests, and done-plan prose cite everything. "N refs found" was counted as liveness. LOT-07 reviewer overturned exactly this: 29 blanket KEEPs flipped to DELETE after re-checking INDEX status (SUPERSEDED/CANCELLED/ARCHIVED-REFERENCE). LOT-09 reviewer flipped 64 more.

4. **Executors claimed grep sentinels that reviewers falsified.** LOT-01 review MISS-02/03: a missing file was classified as a delete candidate; "no matches" claims contained matches. The slop2 method's mandatory cross-provider reviewer re-executed all evidence — single-executor self-verification is insufficient.

5. **This plan drew the same boundary at the repository edge.** After diagnosing the above, it set its own denominator at `git ls-files` — `~/.claude`, `~/.copilot`, and `%LOCALAPPDATA%/Temp/claude/` appeared nowhere in it. Roughly 1.9 GB of files written by Claude and Copilot lived outside that edge and were not in scope. This is the fourth instance of the same root cause: any boundary drawn by hand rather than by machine inherits the blind spots of whoever drew it.

**Root cause** = a model-judged denominator inherits the model's blind spots (violates the machine-denominator law: judgment enumerates, machines own denominators). The fix is baked into this sweep's verification battery and into the self-cleaner's permanent denominator design.

---

## Out-of-Repo Scope

Everything Claude and Copilot have written outside the repository boundary. Dispatcher measured 2026-07-29; figures are independently reproduced below.

### Denominator

**`~/.claude/` — dispatcher: ~932 MB · verified: 900.8 MB (−3.4%, within tolerance)**

| Path | Dispatcher | Verified | Files | Note |
|---|---|---|---|---|
| `projects/` | 902 MB | 877.5 MB | 1,538 | Session transcripts; ~870 MB is this repo. Live memory folder. |
| `delegation/` | 10.7 MB | 7.0 MB ⚠ | 1,494 | Live config + accumulated run state |
| `plugins/` | 9.5 MB | 7.8 MB ⚠ | 728 | |
| `state/` | 3.2 MB | 3.1 MB | 22 | gate-fires.log, hook-failures.log, delegation-nudge-failures.log, task-envelopes, ua-worker |
| `oneliners/` | 1.9 MB | 1.9 MB | 11 | |
| `tasks/` | 1.7 MB | 0.4 MB ⚠ | 1,005 | |
| `telemetry/` | 1.4 MB | 1.3 MB | 31 | |
| `session-env/` | 640 KB | ~0 | 0 | Empty dir |
| `plans/` | 480 KB | 307 KB | 33 | Plan files outside the repo — random-word filenames, never in `plans/INDEX.md` |
| `shell-snapshots/` | 457 KB | 205 KB ⚠ | 75 | |
| `backups/` + `cache/` | 752 KB | 819 KB | 6 | |
| loose files | — | — | — | `may_activity.txt` 327 KB, `history.jsonl`, `stats-cache.json`, 3 stale `settings.json.bak-*` |

⚠ = delta >10% from dispatcher figure; attributed to runtime churn between measurement windows (delegation, tasks, shell-snapshots are high-churn runtime dirs). All totals within 10%.

**`~/.copilot/` — dispatcher: ~981 MB · verified: 1,047.4 MB (+6.8%, within tolerance)**

| Path | Dispatcher | Verified | Files | Note |
|---|---|---|---|---|
| `session-state/` | 786 MB | 749.8 MB | 8,489 | Largest single pile in the audit |
| `updater/` | 185 MB | 181.3 MB | 2 | Update artifacts |
| `logs/` | 8 MB | 7.8 MB | 56 | |
| `data.db` | 2.7 MB | 2.6 MB | 1 | Live |
| `data.db.pre-update-backup-*` | 2 MB | — | 1 | Superseded |
| `agents-variants-archive/` | 76 KB | 102 KB | 10 | |

**Elsewhere** — `%LOCALAPPDATA%/Temp/claude/`: dispatcher 645 MB · verified 614.1 MB (−4.8%). Session scratch dirs. Also: `~/.claude.json` 54 KB live; 40 `*.bak-*` files across `~/.claude` and `~/.copilot`; 3 orphan project dirs under `~/.claude/projects/` for repos other than this one.

---

### NEVER TOUCH — Hard Block (applies to every out-of-repo lot, read before acting on any path below)

The following are the live delegation system shipped to the team repo on 2026-07-29 (commit `e37d13cf`). **No lot in this plan may delete, move, or modify any item below.** Deleting any of them breaks the workforce on this machine and desynchronises it from what colleagues installed.

- (off-repo) ~/a local credentials store (untracked by design — never committed) — live credentials
- (off-repo) ~/.claude/settings.json — live and load-bearing (wires the delegation hooks)
- (off-repo) ~/.claude/mcp.json
- (off-repo) ~/.claude.json
- (off-repo) ~/.claude/hooks/*.mjs
- (off-repo) ~/.claude/delegation/config.json
- (off-repo) ~/.claude/delegation/model-registry.json
- (off-repo) ~/.claude/delegation/registry-block.sh
- (off-repo) ~/.claude/delegation/DUTY_STACK.md
- (off-repo) ~/a delegation-era scratch file (removed — never tracked)
- (off-repo) ~/.claude/delegation/routing-policy.json
- (off-repo) ~/.claude/delegation/ticket-template.md
- (off-repo) ~/a delegation-era scratch file (removed — never tracked)
- (off-repo) ~/.claude/delegation/gates/ (entire directory)
- (off-repo) ~/.copilot/agents/
- `~/(this file lives in the user home directory `~/.copilot/`, not in the repo)`
- `~/.copilot/mcp-config.json`

---

### Categorisation

**Category A (dispatchable, no per-item GO):** `%LOCALAPPDATA%/Temp/claude/` session scratch dirs · `~/.copilot/updater/` · `~/.copilot/logs/` · `data.db.pre-update-backup-*` · the 42 (machine-enumerated 2026-07-30) `*.bak-*` files · `~/.claude/shell-snapshots/` · `~/.claude/session-env/` · `~/.claude/cache/`

**Category C/D (per-item GO before anything):** `~/.claude/projects/` transcripts — 898 MB, but they are the provenance record for every session; deletion is a real loss, not just space · `~/.copilot/session-state/` 786 MB — the evidence behind every worker run · `~/.claude/plans/` — read all 33 before disposition; a plan outside `plans/` may hold work nobody tracked · `~/.claude/delegation/` accumulated run state, excluding the live config named in the NEVER-TOUCH block above

---

### Lot ORP-A1 — Temp scratch dirs + stale update artifacts *(Category A — dispatchable)*

**Blocked pending carve-out**: 19 of the 42 matched files carry DO-NOT-DELETE, pending-GO, or NEVER-TOUCH rulings (11 sit inside ~/.claude/delegation/gates/ and ~/.copilot/agents/, both NEVER-TOUCH per this plan's own lines 114-115). This lot MUST NOT run as Category A until those 19 are excluded. The remaining 23 stay Category A.

**Scope:** `%LOCALAPPDATA%/Temp/claude/` (614 MB), `~/.copilot/updater/` (181 MB), `~/.copilot/logs/` (7.8 MB), `data.db.pre-update-backup-*` (1 file), the 42 (machine-enumerated 2026-07-30) `*.bak-*` files across `~/.claude` and `~/.copilot`.

**Action**: Remove the above. Confirm none is in the NEVER-TOUCH list before removing.

**Verify battery**:
1. `%LOCALAPPDATA%/Temp/claude/` → empty or absent after removal
2. None of the NEVER-TOUCH paths modified — verify each exists and is unchanged after

#### ORP-A1 — EXCLUDED (per-item Rutvik GO required)

| # | File | Collision type | Citation |
|---|---|---|---|
| 1 | `~/.claude/hooks/delegation-gate.mjs.bak-lcd07` | **DO NOT DELETE — UNIQUE CONTENT** | `_ULTRAAUDIT_FINDINGS.md:142` (P2-LOT08-03); FIX_WAVE Decision 3 |
| 2 | `~/.claude/delegation/config.json.bak-lcd04` | **DO NOT DELETE — merge first** | `_ULTRAAUDIT_FINDINGS.md:129` (P2-13) |
| 3 | `~/.claude/hooks/check-delegation-envelope.mjs.bak-cheatproof-20260715` | PENDING-GO (Rutvik GO per file) | `_ULTRAAUDIT_FINDINGS.md:528` (P2-LOT08 batch) |
| 4 | `~/.claude/hooks/delegation-gate.mjs.bak-cheatproof-20260715` | PENDING-GO | P2-LOT08 batch |
| 5 | `~/.claude/hooks/delegation-nudge.mjs.bak-lcd03` | PENDING-GO | P2-LOT08-04 |
| 6 | `~/.claude/hooks/delegation-nudge.mjs.bak-lcd04` | PENDING-GO | P2-LOT08-05 |
| 7 | `~/.claude/hooks/delegation-primer.mjs.bak-lcd03` | PENDING-GO | P2-LOT08-06 |
| 8 | `~/.claude/hooks/labor-gate.mjs.bak-cheatproof-20260715` | PENDING-GO | P2-LOT08 batch |
| 9 | `~/.claude/delegation/gates/verify-run.mjs.bak2-cheatproof-20260715` | NEVER-TOUCH directory | `PLAN_REPO_SLOP_SWEEP.md:114` — `gates/` is entire-dir protected |
| 10 | `~/.copilot/agents/chief.agent.md.bak-2026-07-14T09-38-29-747Z` | NEVER-TOUCH dir + PENDING-GO | `PLAN_REPO_SLOP_SWEEP.md:115` + P2-LOT10 |
| 11 | `~/.copilot/agents/chief.agent.md.bak-cheatproof-20260715` | NEVER-TOUCH dir + PENDING-GO | same |
| 12 | `~/(this file lives in the user home directory `~/.copilot/`, not in the repo).bak-cheatproof-20260715` | NEVER-TOUCH dir + PENDING-GO | same |
| 13 | `~/(this file lives in the user home directory `~/.copilot/`, not in the repo).bak-cheatproof-20260715` | NEVER-TOUCH dir + PENDING-GO | same |
| 14 | `~/(this file lives in the user home directory `~/.copilot/`, not in the repo).bak-cheatproof-20260715` | NEVER-TOUCH dir + PENDING-GO | same |
| 15 | `~/.copilot/agents/council-worker.agent.md.bak-cheatproof-20260715` | NEVER-TOUCH dir + PENDING-GO | same |
| 16 | `~/.copilot/agents/council-worker.agent.md.bak-hardening-20260725` | NEVER-TOUCH dir (post-audit, no individual ruling) | `PLAN_REPO_SLOP_SWEEP.md:115` |
| 17 | `~/.copilot/agents/council-worker.agent.md.bak-prefix-kill-20260725` | NEVER-TOUCH dir | same |
| 18 | `~/.copilot/agents/council-worker.agent.md.bak-prefix-kill-20260725155919` | NEVER-TOUCH dir | same |
| 19 | `~/.copilot/agents/council-worker.agent.md.bak-repin46-20260725` | NEVER-TOUCH dir | same |

---

### Lot ORP-A2 — Shell-snapshots + session-env + cache *(Category A — dispatchable)*

**Scope:** `~/.claude/shell-snapshots/` (75 files) · `~/.claude/session-env/` (empty dir) · `~/.claude/cache/` (1 file)

**Action**: Remove contents. Confirm `~/.claude/settings.json` (NEVER-TOUCH) is unchanged before and after.

**Verify battery**:
1. `git status --porcelain` in repo root → no repo files touched
2. NEVER-TOUCH paths untouched

---

### Lot ORP-C1 — Memory-topic prune *(Category C — per-item Rutvik GO)*

**Scope**: `~/.claude/projects/C--Users-RutvikKhorasiya-projects-encore-framework/memory/` — one index file plus 102 topic files.

**Background**: A compaction on 2026-07-29 shortened wording only; the entry count did not move, so the index re-trips its size ceiling the moment anything is added. The real work is merging overlapping topic files and archiving stale ones so the *count* drops, not just the wording length.

**Action (requires per-topic Rutvik GO)**: Read all 102 topic files. Identify overlapping topics (merge candidates) and stale topics (rules superseded by newer ones). Produce a triage table: file, current topic, recommendation (keep / merge-into / archive). **Stop.** Wait for per-item GO before merging or removing any file.

**Verify battery**:
1. Triage table covers all 102 topic files — count confirmed before and after
2. No memory file modified, merged, or deleted until GO received — directory contents unchanged

---

## Fix Lots (A/B/C/D)

### Category A — Safe mechanical (delete untracked debris, move walk-dumps)

No special GO required. Verify battery applies to each lot before marking done.

---

#### Lot A1 — Root walk-dump YMLs + orphan PNGs + temp logs

**Files (23):**
- `eq-dialog2.yml`, `eq-newpricebook-walk1.yml`, `eq-strat-dialog.yml`, `eq-strat-pane.yml`, `eq-walk2.yml`
- `pg-aftersave.yml`, `pg-dlg2.yml`, `pg-edit1.yml`, `pg-edit2.yml`, `pg-edit3.yml`, `pg-grid.yml`
- `pg-picker.yml`, `pg-picker2.yml`, `pg-picker3.yml`, `pg-postsave.yml`, `pg-repro.yml`
- `pg-restorecheck.yml`, `pg-restored.yml`, `pgoverride-initial.yml`
- `e2e-01-ready-before-disconnect.png`, `e2e-02-not-connected-after-disconnect.png`, `e2e-03-removed-terminal.png`
- `TEMPxlsxbuild.log`

**Action**: These are untracked/ignored files (no `git rm` needed). `Remove-Item` each. Confirm untracked status with `git ls-files --error-unmatch <file>` should exit 128 (not tracked) before deletion.

**Verify battery**:
1. `git ls-files --others --ignored --exclude-standard | grep -E "(eq-|pg-|pgoverride-|e2e-0|TEMP)"` → 0 output after removal
2. `git status --porcelain` → no tracked file changes

---

#### Lot A2 — Scratch directories

**Files (~39 entries):**
- `.recover-scratch/` entire directory (35 files including scripts, xlsx backups, json snapshots, regguard fingerprints)
- `_migration_global_claude/plugins/` tree (4 empty dirs)

**Action**: `Remove-Item -Recurse -Force .recover-scratch`, `Remove-Item -Recurse -Force _migration_global_claude`. Confirm untracked: `git ls-files .recover-scratch/ _migration_global_claude/` → empty before deletion.

**Verify battery**:
1. `git ls-files .recover-scratch/ _migration_global_claude/` → empty (confirms nothing tracked)
2. `git status --porcelain` → clean after removal

---

#### Lot A3 — Gitignored compiled artifacts

**Files (6):**
- `.claude/skills/ultra-agents/tavily-mcp/dist/src/index.js`
- `.claude/skills/ultra-agents/tavily-mcp/dist/src/rotation.js`
- `.claude/skills/ultra-agents/tavily-mcp/dist/src/tavily-client.js`
- `.claude/skills/ultra-agents/tavily-mcp/dist/src/types.js`
- `.claude/skills/ultra-agents/tavily-mcp/dist/test-client.js`
- the Tavily rotation-state file (exists locally, untracked runtime state)

**Action**: `Remove-Item -Recurse -Force .claude/skills/ultra-agents/tavily-mcp/dist/` + `Remove-Item rotation-state.json`. Both are gitignored — confirm with `git check-ignore -v <path>` before deletion.

**Verify battery**:
1. `git check-ignore -v .claude/skills/ultra-agents/tavily-mcp/dist/src/index.js` → confirms gitignored
2. `git status --porcelain` → clean after removal

---

#### Lot A4 — Stale Playwright evidence subtree

**Files (~163 tracked):** Entire `clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/` tree — trace.zip, test-failed-*.png, error-context.md files, test-results/, .last-run.json, junit-results.xml, console.log, diagnostics/*.json, failure-summary.json, test-results.json, build-tracker-csv.mjs, list-census.txt, auth-warmup.log, skip-grep.txt, _pre-consolidation-tracker.csv (run1 and run2, ~163 total)

**Action**: `git rm -r clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/`

**Verify battery**:
1. `git ls-files clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/ | wc -l` → 0 after removal
2. `git status --porcelain` → only expected staged deletions, then clean after commit
3. `npx tsc --noEmit` (typecheck) → 0 errors (no TS imports into evidence subtree expected)

---

#### Lot A5 — Misc leftover debris

**Files (29 tracked):**

clients/encore root debris (14):
- (artifact path was malformed — the referenced screenshot/evidence file no longer exists)
- (artifact path was malformed — the referenced screenshot/evidence file no longer exists)
- (artifact path was malformed — the referenced screenshot/evidence file no longer exists)
- (the cited path does not resolve to any file in the repo), (the cited path does not resolve to any file in the repo)
- (the cited path does not resolve to any file in the repo), (the cited path does not resolve to any file in the repo)
- (the cited path does not resolve to any file in the repo)
- (the cited path does not resolve to any file in the repo), (the cited path does not resolve to any file in the repo), (the cited path does not resolve to any file in the repo)
- (the cited path does not resolve to any file in the repo), (the cited path does not resolve to any file in the repo), (the cited path does not resolve to any file in the repo)

clients/encore id-audit scripts (6):
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/fix-offbyone.mjs`
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/fix-shorthand.mjs`
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/md-fixes.mjs`
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/remediate.mjs`
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/summarize-findings.mjs`
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/testplan-fixes.mjs`

clients/encore orphan screenshots (3):
- `clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29-address-dialog.png`
- `clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29-tab.png`
- `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-05.png`

website debris (2) — **REMOVED from scope per Owner Decision (c): website/ stays; see "Owner Decisions" below.**

.claude/ leftover (2):
- an internal channel file (untracked scratch state)
- `.claude/plans/plans-pending-plan-timeout-centralizatio-playful-rabbit.md`

.work/ orphan YMLs (2):
- `.work/hunter-shared-setup/nav2-shared-setup-clicked.yml`
- `.work/hunter-shared-setup/nav2-shared-setup-tab.yml`

**Action**: `git rm` all tracked files above. Confirm each with `git ls-files --error-unmatch <path>` first.

**Verify battery**:
1. `git grep -r "review2-spec-1\|job3b-screenshot\|id-audit-2026-06-10\|fix-offbyone\|KT_PROMPT_FOR_COLLEAGUE"` → 0 live refs in any non-done-plan file
2. `npx tsc --noEmit` → 0 errors
3. `git status --porcelain` → clean after commit

---

### Category B — Behavior-adjacent (dead scripts/exports, config changes, plan moves)

Dispatchable after Rutvik confirms overall plan. Each lot requires the verify battery to pass before marking done.

---

#### Lot B1 — Dead source code

**Files (3):**
- `pipeline/worker/progress-extractor.ts` — 0 code consumers; orphan despite relocation
- `src/utils/agent-reporter.ts` — DEPRECATED 2026-05-19; not in barrel; 0 callers
- `src/utils/retry-telemetry.ts` — not in barrel; sole importer is deprecated agent-reporter.ts

**Action**: `git rm pipeline/worker/progress-extractor.ts src/utils/agent-reporter.ts src/utils/retry-telemetry.ts`

**Verify battery**:
1. `git grep -r "progress-extractor\|agent-reporter\|retry-telemetry" -- "*.ts" "*.mjs" "*.js"` → 0 hits outside plans/
2. `npx tsc --noEmit` → 0 errors
3. `git status --porcelain` → clean after commit

---

#### Lot B2 — Orphan scripts

**Files (2):**
- `scripts/build-audited-bug-report.js`
- `scripts/build-reverified-bug-report.js`

**Action**: Confirm `grep -r "build-audited-bug-report\|build-reverified-bug-report" package.json .githooks/ .ci/` → 0 hits. Then `git rm scripts/build-audited-bug-report.js scripts/build-reverified-bug-report.js`.

**Verify battery**:
1. Pre-delete grep confirmed (see above)
2. `node -e "require('./package.json')"` → parses cleanly (no broken script refs)
3. `git status --porcelain` → clean after commit

---

#### Lot B3 — Stale delegation-audit state (~43 tracked files)

**Files:**
- (the cited path does not resolve to any file in the repo), `arena-verify.md`, `classify-integration-plans.md`
- (the cited path does not resolve to any file in the repo), `fight-design-brief.md`
- (the cited path does not resolve to any file in the repo), `research-1-external.md`, `ticket-A-classify.md`
- `.claude/state/delegation-audit/inputs/hooks/delegation-gate.mjs`
- `.claude/state/delegation-audit/inputs/hooks/ua-worker-guard.mjs` (gitignored — not git-tracked; filesystem delete, not git rm)
- (the cited path does not resolve to any file in the repo) (and 34 other feedback_* files — see _REPO_SLOP_FINDINGS.md § .claude/ bucket for full list)

**KEEP** (reviewer overturn — confirmed live reference):
- `.claude/state/delegation-audit/inputs/hooks/delegation-primer.mjs` (referenced in `.claude/skills/reflect/SKILL.md:70`)

**Action**: `git rm` the 43 listed files. Do NOT remove delegation-primer.mjs.

**Verify battery**:
1. `git grep -l "delegation-gate\|ua-worker-guard\|arena-brief\|arena-verify" -- "*.md" "*.mjs" "*.ts"` → 0 live refs outside plans/done/ and .claude/state/
2. Hook fixtures: `node .githooks/pre-push --dry-run` (or equivalent hook self-test) → passes
3. `git status --porcelain` → clean after commit

---

#### Lot B4 — Superseded done-plans (non-credential)

**Files (25):** All `plans/done/` files listed under DELETE in § Plans bucket of _REPO_SLOP_FINDINGS.md, excluding the 4 credential-bearing plans (those are Lot D1).

Plans with INDEX status SUPERSEDED, CANCELLED, ARCHIVED-REFERENCE, RESOLVED-BY-POINTER, or misplaced (PENDING status files that belong in plans/pending/).

**Action**: `git rm` the 25 files. For the 2 misplaced-in-done/ files with INDEX=PENDING (`PLAN_RCA_FULL_RUN_FAILURES.md`, `PLAN_V2_REQUIREMENTS_GAPS.md`): move to `plans/pending/` before deleting from done/.

**Verify battery**:
1. `git grep -r "PLAN_MAINTAINER_SWEEP\|PLAN_PILOT_SHARED\|SUBPLAN_AAE_06\|SUBPLAN_CORP_PRICING_SHADOW" -- "*.ts" "*.mjs" "*.js"` → 0 live code imports
2. `git status --porcelain` → clean after commit

---

#### Lot B5 — plans/done archival batch (64 RELOCATE)

**Files (64):** All LOT-09 RELOCATE verdicts — DQU family, HIST_PIVOT family (30 files), PARITY family, REPO family, and others. See _REPO_SLOP_FINDINGS.md § Plans/RELOCATE for full list.

**Action**: Move to `plans/archive/` (create dir if needed) via `git mv`. Update `plans/INDEX.md` status entries for each. **Await Rutvik decision (§ Owner Decisions item b) before executing** — option is archive vs keep-in-done.

**Verify battery**:
1. `git grep` for each filename → no live TS/JS imports (archival-citation-only refs expected and acceptable)
2. `plans/INDEX.md` updated with new status/location for all 64
3. `git status --porcelain` → clean after commit

---

#### Lot B6 — plans/pending cleanup

**Files (2):**
- `plans/pending/PLAN_CODEREVIEW_FINDINGS_REMEDIATION.md` — DELETE (superseded same-day by done/ counterpart)
- `plans/pending/godsplan.md` — RENAME to (the referenced plan file does not exist — it was never created or was renamed) (6 live refs must be updated)

**Action**:
1. `git rm plans/pending/PLAN_CODEREVIEW_FINDINGS_REMEDIATION.md`
2. Find 6 live refs: `git grep -l "godsplan" -- "*.md" "*.ts" "*.mjs"`. Update each ref to `PLAN_GODSPLAN.md`. Then `git mv plans/pending/godsplan.md plans/pending/PLAN_GODSPLAN.md`.

**Verify battery**:
1. `git grep "godsplan" -- "*.md" "*.ts" "*.mjs"` → 0 hits after rename + ref updates
2. `git status --porcelain` → clean after commit

---

### Category C — Protected control surface (per-item Rutvik GO required)

Each item below needs explicit Rutvik GO before any implementation.

---

#### Lot C1 — Self-cleaner mechanism build *(per-item Rutvik GO)*

**Scope**: Build the SessionStart-throttled automatic sweeper designed in worker chip output (ephemeral — not tracked in git).

**Components**:
- `selfclean-sweep.sh` SessionStart hook (registered beside chain-pause-notice.sh in settings.json)
- `sweep.mjs` detached background sweeper (`.claude/hooks/lib/selfclean/sweep.mjs`)
- `selfclean-config.json` tracked rule registry (`.claude/selfclean-config.json`)
- npm scripts: `selfclean`, `selfclean:restore`, `selfclean:gc`, `selfclean:status`
- Quarantine dir: `.claude/state/selfclean/quarantine/` (gitignored runtime)

**Posture**: auto-quarantine + report (never hard-delete on first sweep). All rules land in `announce` mode first; promote per-rule to `quarantine` after ≥3 sweeps with zero false-positive flags (LR-069 §3.3 ramp).

**Verify battery**:
1. `npm run selfclean` → announce-mode dry run; report generated at `.claude/state/selfclean/sweep-<date>.md`; 0 tracked files modified (`git status --porcelain` clean)
2. Hook self-test: SessionStart hook exits 0 in <200ms when throttle is fresh
3. Full hook fixture suite → all existing gates pass

---

#### Lot C2 — Pipeline credential fallback removal *(per-item Rutvik GO)*

**Files (6 lines within tracked files)**:
- `pipeline/server/routes/admin.ts:20` — hardcoded dev-secret worker auth fallback
- `pipeline/server/routes/events.ts:56` — same
- `pipeline/server/routes/worker.ts:21` — same
- `pipeline/worker/index.ts:42` — same
- `pipeline/worker/worker-manager.ts:31` — same
- `src/common/credential-loader.ts:103` — hardcoded admin password fallback

**Action**: Replace hardcoded fallback values with env-var-only paths (throw/warn if env var absent, do not silently fall back to a literal). Code review required before commit to confirm no auth regressions.

**Verify battery**:
1. `npx tsc --noEmit` → 0 errors
2. Confirm env-var paths: each modified file reads from `process.env.<VAR>` and throws/logs a clear error if unset
3. `git status --porcelain` → clean after commit

---

#### Lot C3 — Pending-plan triage *(Category C — per-item Rutvik GO — no action without approval)*

**Scope**: Every `.md` file in `plans/pending/` — plans that were built and never executed.

**Action**: Assign each plan to one of four buckets: **useless** (orphaned, no value) · **vision worth salvaging** (good idea, never started) · **needs refining** (stale or incomplete) · **keep as-is** (active, still valid). Produce a triage table with one-line rationale per plan. **Stop.** The lot produces the triage table and stops.

**⚠ CONSTRAINT: No pending plan is moved, edited, or deleted without Rutvik's explicit approval and interrogation after seeing the triage. This constraint is not a formality — every individual plan disposition requires his GO before any action is taken.**

**Verify battery**:
1. Triage table covers every `.md` file in `plans/pending/` — `git ls-files plans/pending/ | grep "\.md$" | wc -l` (currently 122) matches row count
2. No pending plan file modified, moved, or deleted — `git status --porcelain` clean
3. Nothing staged, committed, or pushed

---

### Category D — Tracked/history-bearing content (per-item Rutvik GO required)

Each item requires explicit Rutvik GO. Category D operations touch git history or large tracked deletions.

---

#### Lot D1 — Credential-bearing plan files + tracked-file credential scrub *(per-item Rutvik GO)*

**Files (6)**:
- `plans/done/PLAN_34_BACKEND_CLEANUP.md` — real passwords in git history (commit 3f39024c)
- `plans/done/PLAN_23_MONOREPO_INTEGRATION.md` — same passwords in git history
- `plans/done/PLAN_27_DEV_ENVIRONMENT.md` — admin credentials in git history
- `plans/done/PLAN_31_VERIFICATION.md` — admin credentials in git history
- `.claude/context/CURRENT_STATE.md` — PostgreSQL password at line 37 (scrub value; keep file)
- an internal channel file (untracked scratch state) — dev DB credentials at line 19 (scrub value; keep file)

**Action**:
1. `git rm plans/done/PLAN_34_BACKEND_CLEANUP.md plans/done/PLAN_23_MONOREPO_INTEGRATION.md plans/done/PLAN_27_DEV_ENVIRONMENT.md plans/done/PLAN_31_VERIFICATION.md`
2. Edit `.claude/context/CURRENT_STATE.md:37` and the local broadcast channel artifact line 19 - replace credential values with `[redacted]` placeholders
3. History scrub: HEAD-only deletion leaves credentials in git history — Rutvik decides scope (see § Owner Decisions item a)

**Verify battery**:
1. `git log --all --oneline -- plans/done/PLAN_34_BACKEND_CLEANUP.md` — confirms deletion commit
2. Scan of HEAD: `git grep -i "<credential-patterns>"` (patterns per Lot D1 context) → 0 hits in HEAD after removal
3. `git status --porcelain` → clean after commit

---

#### Lot D2 — Live Atlassian API key *(per-item Rutvik GO — URGENT)*

**File**: `website/frontend/src/data/jiraconfig.txt` — contains a live Atlassian API key (S3/CRITICAL)

**Action** (strictly in this order):
1. **Revoke the key** on the Atlassian console BEFORE any git operation
2. `git rm website/frontend/src/data/jiraconfig.txt`
3. History scrub per Rutvik decision (see § Owner Decisions item a)
4. Confirm website/ still functions (key was for Jira integration — ensure no active code paths break)

**Verify battery**:
1. Atlassian console confirms key revoked (manual step; screenshot as evidence)
2. `git grep -r "jiraconfig"` + key-pattern scan → 0 hits in HEAD after removal
3. `git status --porcelain` → clean after commit

---

#### Lot D3 — Stale worktree + vestigial jest config *(per-item Rutvik GO)*

**Items (2)**:
- `.claude/worktrees/amazing-swanson-775132/` — 4,308 files, ~673 MB; stale git worktree artifact. Reviewer confirmed DELETE; scope is large.
- `jest.config.ts` — no npm script invokes jest; vestigial from pipeline unit-test era (contested: executor DELETE, some reviewer discussion; proceeding as DELETE per LOT-01 exec verdict)

**Action**:
1. `git worktree list --porcelain` — confirm `amazing-swanson-775132` is stale (not checked out)
2. `git worktree remove --force .claude/worktrees/amazing-swanson-775132`
3. `git rm jest.config.ts` — confirm no package.json jest scripts first

**Verify battery**:
1. `git worktree list` → amazing-swanson-775132 absent
2. `git grep "jest.config" -- "package.json" ".ci/**"` → 0 refs
3. `npx tsc --noEmit` → 0 errors
4. `git status --porcelain` → clean after commit

---

## Self-Cleaning Mechanism

**Reference**: Full design was in the local slop35 self-clean design worker artifact (not tracked).

**Posture**: auto-quarantine + report. A SessionStart-throttled background sweeper enumerates the full repo (machine triad: `git ls-files`, untracked, ignored — never judgment-based) and applies deterministic pattern rules from a tracked config. Findings move to a quarantine dir (path-preserving, reversible, manifest-tracked) rather than hard-delete. A one-line report fires in SessionStart context if the previous sweep has unacknowledged quarantines.

**Why this posture**: nag-only automation is disproven by stale-bot literature and by this repo's own `npm run clean:root` (existed, never run). Auto-hard-delete violates reversibility doctrine and is falsified by the audit itself (LOT-01 and LOT-04 reviewers disagreed with executors on specific files — a glob rule must not get kill authority). Quarantine makes a wrong classification cost a restore, not data loss.

**10 pattern rules** (P1–P10, fully described in _REPO_SLOP_FINDINGS.md § Slop Pattern Catalog):
- **Tier A (auto-quarantine)**: P1 walk-dump YMLs, P2 scratch dirs, P3 stale session-state snapshots, P4 ephemeral test artifacts (untracked portion), P5 orphan screenshots/dup PNGs, P6 leftover-debris one-offs, P10 state runtime churn
- **Tier B (detect + report only, never touch)**: P7 tracked secrets (→ pre-push deny), P8 vestigial infra, P9 done-plan archive candidates

**Key safety rails**: age-gate (7-day minimum before quarantine — never sweeps current work-week), LR-042 chain-state untouchable, live-state registry allowlist (rotation-state.json, .auth/, .env*, .tmp/, etc.), post-sweep `git status --porcelain` self-test (auto-restore + abort if tracked files touched), fail-open on every error path.

**Ramp**: all rules start in `announce` mode; promote to `quarantine` after ≥3 false-positive-free sweeps per LR-069 §3.3.

**Prior fix on trial**: `scripts/clean-root.ts` (`npm run clean:root`) is **CONVICTED** — scoped to 2025-era debris patterns; never ran automatically; patterns don't cover eq-/pg- walk dumps, PNGs, TEMP logs. Retire it: absorb patterns into the sweeper's rule registry and delete the script in the implementing subplan.

**Category**: C (control surface — hooks, settings). Requires Rutvik GO (Lot C1 above).

---

## Owner Decisions (batch)

Decisions awaiting Rutvik. Nothing here runs until answered; C/D lots are per-item GO.
**To answer later, just reply with picks, e.g. "(b) archive, (c) keep, (d) after, (e) yes".**

**(a) Atlassian key scrub — ✅ RESOLVED + DONE (2026-07-19).**
Rutvik chose HEAD-only, no rotation (training-instance key). Scrubbed in place (value → env-var placeholder) and committed isolated: **`2a37d1bf`**. History retains it (246 commits deep, already pushed to private remotes) — residual accepted, no force-push. Preference saved to memory.
- **Sub-decision STILL OPEN — test passwords in `plans/done/PLAN_23/27/31/34*.md`:** same HEAD-only scrub (blank → placeholder), or leave (they're training creds in done-plans)? *Recommendation: scrub them the same way in Lot D — one commit, consistent with (a).*

**(b) plans/done archival (640 files, 64 flagged for RELOCATE) — ✅ RESOLVED (2026-07-29).**
They stay. `plans/done/` is the log of what was done; all 640 files remain in place. The 64 RELOCATE flags from LOT-09 come off the action list — Lot B5 is removed from the execution queue. *He redirected the concern:* the real problem is `plans/pending/` — plans that were built and never executed. Lot C3 (added above) triages them into four buckets; it produces the triage table and stops. No pending plan is moved, edited, or deleted without Rutvik's explicit approval and interrogation.

**(c) website/ frontend sub-tree disposition — ✅ RESOLVED (2026-07-29).**
Keep. No longer needed, but may be revived for reference or built on later. It stays until Rutvik deletes it himself. `website/` is removed from the DELETE list entirely — the two files previously listed as "website debris" in Lot A5 (`FRONTEND_INTEGRATION_RESPONSE.md`, `plan.md`) are no longer in scope for that lot. Lot D2 still applies independently to `website/frontend/src/data/jiraconfig.txt` (credential removal).

**(d) Self-cleaner build timing — ✅ RESOLVED (2026-07-29).**
Now. His words: now is the best time to do these things, never tomorrow. Lot C1 proceeds as part of this sweep, not deferred to a later plan.

**(e) Upgrade ULTRAAUDIT — ✅ RESOLVED (2026-07-19): YES, upgrade-first.**
Rutvik decided: upgrade `PLAN_ULTRAAUDIT_FIX_WAVE.md`, don't redo it. Its S0/S1 bug findings stay valid, but it inherited the same model-guessed-denominator blind spot (~197 files; ~1,080 harness/code files never got a correctness pass) and its fix-list may collide with this sweep's DELETE-list. **This is now baked as STEP 0 in "Execution Order" above** and as the "Execution Prerequisite" in the ULTRAAUDIT plan: when either plan runs, re-run the bug hunt over the full machine denominator + reconcile the two lists BEFORE any harness file is touched. No open sub-question remains here.

---

## Explicit Exclusions

The following are **out of scope** for this sweep — council confirmed KEEP or outside audit boundary:

- **Shipped client product code**: `clients/encore/src/`, `clients/encore/tests/`, `clients/encore/config/` + 6 ship files (127 files total). Never touched by this plan.
- **website/ SaaS product** (except jiraconfig.txt credential — Lot D2): confirmed live by LOT-16 review.
- **All 16-lot KEEP verdicts** (~1,440 rows): load-bearing files confirmed by executor + cross-provider reviewer. Not revisited here.
- **plans/pending/ files with missing Status frontmatter** (11 files, LOT-11 KEEP-S2): flagged as hygiene gap, not slop — address in a separate frontmatter-hygiene pass.
- **`.claude/state/` live operational families**: gate-fires.log, closure-attempts/, warning JSONs, active worktrees, chain-sessions/, ua-worker/ current-audit artifacts. Protected by the self-cleaner's live-state registry (see Lot C1).

---

### Execution Summary

Execution not yet performed. This plan is explicitly PARKED (see "Execution Order" §STEP 0 and the TRI-PLAN MUTUAL GATE). No lots have been actioned; no deletions, relocations, or fixes have been applied. The plan awaits Rutvik GO and completion of the shared reconciliation prerequisite.

---

# EXECUTION ORDER + ONE-SYSTEM SCOPE (added 2026-08-05, Rutvik GO)

**Run order for the tri-plan unit**: 1️⃣ **this plan** (its § S-0 rebuilds the denominator everything else
consumes) → 2️⃣ `PLAN_ULTRAAUDIT_FIX_WAVE` (its PREREQ-1 is only satisfiable after § S-0a runs) →
3️⃣ `PLAN_COPILOT_INTEGRATION_ULTRAAUDIT` (most complete; back it up first — it is gitignored, one copy).
This reconciles the older "Execution Order" STEP 0 above: STEP 0's protection stands (no Category C/D
harness lot before the re-hunt + reconciliation), but the re-hunt now runs over the § S-0a regenerated
four-quadrant denominator, which THIS plan produces first — FIX_WAVE consumes it, it does not lead.

**ONE SYSTEM (scoping law for every lot and DECIDE below)**: Claude and Copilot are halves of the same
framework. Every lot, pass, and decision in this plan applies across the WHOLE system — the repository,
`~/.claude/` (hooks, delegation control plane, memory), and `~/.copilot/` (agents, config, state) — unless
its text names a narrower scope with a reason. A lot executed Claude-only or repo-only, when its class of
target exists on the other side too, is a scoping defect, not a done lot.

**Execution mechanics**: at execution start, batch every unfilled `DECIDE:` line through `/questionnaire`
(decision mode) so Rutvik answers in one pass, not scattered mid-run asks. `/regression-guard` WRAPs every
code-touching lot (B1, B2, C1, C2, D3). Evidence home: the audit artifacts cited below are preserved
in-repo at `plans/pending/_audit-evidence-0805/` — `C:\Users\RutvikKhorasiya\aud\` is scheduled for teardown and
must never be the only copy.

---

# AUDIT FINDINGS TO DISPOSITION (wired 2026-08-05)

**Where this came from**: a two-round council audit of everything the framework touched 2026-07-27 →
2026-08-05, plus a from-scratch rebuild of the machine denominator. Full report:
`plans/pending/_audit-evidence-0805/AUDIT-REPORT-V2.md`. Ledger:
`plans/pending/_audit-evidence-0805/PROGRESS.md`. Re-runnable check:
`plans/pending/_audit-evidence-0805/reaudit2.mjs` (6/6 at wiring time; ran from the since-torn-down
`C:\Users\RutvikKhorasiya\aud\` workspace — the copies here are the durable record, sha256-verified).

**The audit was READ-ONLY by instruction.** Every action below was deliberately NOT taken so the owner
could decide. **This plan is where they actually get done** — create, update, delete, or just read, as
each decision goes.

**How to use this section**: every block ends in a `DECIDE:` line. Fill it, then execute it through this
plan's normal lot flow. An unfilled DECIDE blocks that item only — nothing else.

**State at wiring** (council-measured, 40 roster items): DONE 13 · PARTIAL 14 · NOT-STARTED 8 ·
SUPERSEDED 1 · UNVERIFIABLE 4 → **about 33% done**.

---

## S-0 · The denominator this plan uses covers 1.2% of what exists

This plan's machine denominator is the local slop sweep denominator artifact (not tracked),
generated 2026-07-18. Rebuilt from scratch on 2026-08-05 across four quadrants with no judgment
exclusions:

| population | files |
|---|---|
| repo tracked | 2,053 |
| repo untracked (not ignored) | 55,751 |
| repo ignored | 81,126 |
| `~/.claude` | 5,489 |
| `~/.copilot` | 11,599 |
| **total, deduped** | **156,018** |
| **the roster this plan calls its denominator** | **1,854 rows** |
| **roster rows that match something existing today** | **1,503 — 0.96%** |
| **roster rows covering either off-repo root** | **0** |

Cross-checked with a second instrument (PowerShell `Get-ChildItem -Force` against bash `find`): agreed
within 1 and 3 files on live directories that had active sessions writing to them.

**A second council seat re-derived this whole accounting blind** — none of these numbers appeared in its
ticket. It reproduced the totals exactly, its bucket sum closed at 156,018 with **zero fall-through rows**
(the dispatcher's own sum was one short, and the seat found the row that had been lost — a `.docx` whose
filename contains spaces). It also corrected the coverage figure: 1,854 is the roster's *row count*, but
only **1,503** of those rows match a file that exists today, so the honest coverage is **0.96% — about 1
path in 104.** And it flagged a trap worth keeping: if you dedupe without preserving root scope, five
`~/.claude` paths collide with same-named repository paths and the total silently drops to 156,013.

**Worse than the coverage number**: of the 1,854 rows, **1,773 are tagged `normal`** and only **81** carry
a slop smell. The action list was built from the smelly rows. Anything tagged `normal` was enumerated once
and then never considered again by anything.

**And it is not a one-off.** A council lot judged the surviving `normal` population and found a
**12-file dead cluster** — the entire two-agent collaboration system: `.claude/AGENT_SCHOOL.md`,
`scripts/agent-channel.mjs`, `.claude/agents/COLLEAGUE.agent.md`, `.claude/agents/RUTVIK.agent.md`,
`.claude/context/CURRENT_OWNER.md`, `.claude/context/VISION.md`, `.claude/context/WORKFLOW.md`,
`.claude/context/CURRENT_STATE.md`, `launch.json`, and the start-dev / restart-loop scripts.

Its verdict, verbatim: *"The smell taxonomy had no tag for 'part of a system' — it classified files
atomically, so a dead system where each file references its siblings (which all exist and look
well-formed) appears healthy."* Each file looks fine alone; together they form a closed reference loop
citing each other and nothing else. `agent-channel.mjs` appears in no npm script. `VISION.md` was
superseded by the guiding-vision file (exists locally, untracked by design — private contract). `docs/SETUP.md` still onboards new collaborators into
this dead system.

It also found **7 roster rows tagged `normal` that point at files no longer on disk** (4 channel files,
3 `.auth` files, a lock, a `.claude/plans/` file) — the roster is stale for those.

Measured false-normal rate: **12 of 1,458 = 0.8%**. The classifier was sound for isolated files and blind
to dead *systems*.

> **Correction to carry**: that lot works from a clone, and reported `.claude/channel/` as deleted. It is
> not — it exists live with 4 files. It is **untracked**, so no clone can see it. The cluster is still
> dead on the timestamp evidence (nothing in `channel/` touched since 2026-03-16); only that one sentence
> of the reasoning is a clone-frame artifact.

> **DECIDE — S-0a**: regenerate the denominator across all four quadrants before any lot runs, and treat
> the 2026-07-18 roster as historical? (This plan's own staleness note already demands a re-run; this
> additionally requires covering the two off-repo roots it has never covered at all.) **Regeneration must
> also add `%LOCALAPPDATA%/Temp/claude/` as a FIFTH root — this plan names it in its Out-of-Repo scope
> (614 MB), but it was not one of the four quadrants the 156,018 count covered (owner-caught, 2026-08-05).**
> `DECIDE: ____`

> **DECIDE — S-0b**: add a liveness test to the classifier — last-change date, who references it, and
> whether it is wired in `package.json` / `settings.json` / a hook / a skill — plus a cluster pass that
> detects closed reference loops, so "nothing loads this" becomes a tag instead of silence?
> `DECIDE: ____`

> **DECIDE — S-0c**: the 12-file dead cluster — archive it, keep it, or trim to the parts still true?
> Note `docs/SETUP.md` and `.claude/settings.local.json` both still reference it and would need updating
> either way.
> `DECIDE: ____`

---

## S-1 · The out-of-repo half was declared in scope and never reached

Commit `db1c0443` widened this plan "past the repository boundary" and named a ~1.9 GB denominator across
three roots. A council lot checked every claim against file timestamps:

- **0 of 3 ORP-A cleanup lots executed.**
- **0 of 2 required triage tables produced** — both plans say "Produce a triage table… Stop."
- `SUBPLAN_OFFREPO_RECONCILIATION.md` — **95 findings including 2 security-class**, filed 2026-08-03,
  never started, still Pending.
- Counted and untouched: `tasks/` 1,005 files · `plugins/` 728 · `plans/` 33 · `telemetry/` 31.
- The seat's summary: *"The denominator was measured; the work never reached it."*
- 12 IN-VISION-UNTOUCHED rows, each quoting this plan's own scope statement. Of 8 rows that looked
  "reached", only 2 are genuine work — the rest are runtime churn from workers writing files, not from
  anyone cleaning them.

> **DECIDE — S-1**: run the out-of-repo half inside this plan (ORP-A1 through A3, both triage tables, and
> SUBPLAN_OFFREPO_RECONCILIATION's 95 findings with the 2 security-class first), or formally drop it from
> scope and delete the widening claim so the plan stops promising it?
> `DECIDE: ____`

---

## S-2 · Root debris this plan's own verify commands structurally cannot see

Still on disk at wiring time, all named by this plan as delete targets:

- **22** gitignored root walk-dumps (`eq-*`, `pg-*`, `pgoverride-*`, `e2e-0*`, `TEMP*`) — Lot A1.
- `rotation-state.json` and `.claude/skills/ultra-agents/tavily-mcp/dist/` — Lot A3.
- (Lot A2's `.recover-scratch` and `_migration_global_claude` are genuinely gone.)

**And a hole in the net**: 8 root entries appear **zero** times in this plan — `100`, `accept-denom.mjs`,
`strip_ex3.ps1`, `test-regex.mjs`, `out-e2e/`, `out-lots/`, `out-merge/`, `_archive/`. The first four are
untracked **and** un-ignored, so Lot A1's verify command cannot see them at all — it filters on
`--ignored`. The command would certify a clean root with those four sitting in it.

> **DECIDE — S-2a**: execute A1 and A3 as written against the 22 + 2 targets still present?
> `DECIDE: ____`
> **DECIDE — S-2b**: widen Category A to the untracked-and-unignored stratum and fix the verify commands
> so they can see it?
> `DECIDE: ____`

---

## S-3 · `_archive/` — 55,797 files, 1.8 GB, untracked, inside the repository

Found when the audit's own staging script choked on it, not by any lot. Eight other untracked directories
sit alongside it. It is the largest object in the working tree and no plan names it.

> **DECIDE — S-3**: delete, move outside the repository, or keep with a stated reason?  `DECIDE: ____`

---

## S-4 · Memory drift — five operating lessons exist only on this machine

`CLAUDE.md` tells a collaborator to copy `.claude/collaborator-memory/*.md` into their personal memory
folder. That copy happened, then stopped tracking. Of the memory files changed in the audit window, 31
have a repository counterpart: **22 byte-identical, 9 differ**. A council lot opened all nine diffs —
**none contradicts the other side**:

- **4 cosmetic** — the repository sanitized quoted language; the machine kept the original wording. Same
  instruction either way. The repository's version is the one to keep.
- **5 machine-only additions** (three of them delete not a single line), dated 2026-08-03 and 08-04:
  never edit the dispatch wrapper while a job is live (bash resumes a running script by byte offset) ·
  budget a worker by whether its job is bounded, not by whether it writes · the invisibility-as-evidence
  test · a declined claim needs the same disk check as an applied one · a CLI-limits reference correction.

Nothing here is broken. But five lessons this system learned in three days exist on exactly one machine,
and no fresh clone or other collaborator has any of them.

> **DECIDE — S-4a**: merge the 5 machine-only additions back into `.claude/collaborator-memory/`?
> `DECIDE: ____`
> **DECIDE — S-4b**: push the 4 sanitized versions out to the machine so both sides match?
> `DECIDE: ____`
> **DECIDE — S-4c**: add a sync check so this drift is visible next time instead of found by an audit?
> `DECIDE: ____`

---

## S-5 · Consolidation candidates — the efficiency question

Council-produced, every row carrying a "what would break" column:

- **5 duplicate-content rows**: browser-tool doctrine (2 files) · navigation-first (3) · identity
  semantics (3) · jargon ban (3).
- `plans/pending/` — **128 files, 24,023 lines, 2.2 MB**.
- `_TRIPLAN_RECONCILIATION.md` — **3,417 lines**; realistic as an index at 400–700.
- `.claude/collaborator-memory/` — 140 files, **62 with zero references** — and the seat explicitly warned
  against deleting on grep alone, because a loader may read the whole directory.

> **DECIDE — S-5**: adopt the consolidation table as a lot in this plan, or defer it?  `DECIDE: ____`

---

## S-6 · Populations no list has ever contained

Beyond the roster: **137,427 repository files** absent from it, and **17,088 off-repo files** never
enumerated at all. Grouped, largest first: `_archive` 55,773 · `.claude` 25,794 · `node_modules` 23,654 ·
`website` 18,444 · `.copilot` 11,599 · `clients` 11,485 · `~/.claude` 5,489. Plus **351 roster rows that
no longer exist on disk**.

A council lot grouped all of it with a verdict per group, where a "bulk, ignore it" verdict had to state
what would make ignoring it wrong. **Result** (`plans/pending/_audit-evidence-0805/NEVER-ENUMERATED-FINDINGS.md`):

| | files |
|---|---|
| never enumerated, total | **154,515** |
| **bulk-dismissable, each with a named reason** (session/runtime logs, dependency trees, browser and auth caches, generated output, reports, archives) | **147,164** |
| **genuinely needs human decisions** (off-repo agent / delegation / control-plane / config, plus in-repo framework skills, hooks, rules, memory, client source, plans, scripts) | **7,326** |
| undetermined (malformed or stray quoted `_archive` paths, and the numeric `100` group) | 25 |

**The seat's recommended first lot**: `~/.claude/delegation`, **2,047 files** — *"the personal-machine
delegation authority surface containing tickets, grants, reviews, and control-plane material that can
change what agents are allowed to do, while the prior roster had zero rows there."*

That reduces "156,018 files, unknowable" to **7,326 files that need a human, and everything else excluded
by a stated, counted reason.** That is what "every file accounted for" actually looks like.

> **DECIDE — S-6a**: adopt the group verdicts as this plan's scope boundary, so every one of the 156,018
> files is either inside a lot or inside a named, counted, reasoned exclusion?
> `DECIDE: ____`
> **DECIDE — S-6b**: send the first lot at `~/.claude/delegation` (2,047 files) as the seat recommends?
> `DECIDE: ____`

---

## S-7 · Things this plan itself says to do, that were never done

Found by checking the plan's own text against the working tree. Each is this plan promising something and
the promise not landing.

**Should have been removed.** `scripts/clean-root.ts` and its `npm run clean:root` entry both still exist.
This plan's own words: *"Retire it: absorb patterns into the sweeper's rule registry and delete the
script."*

**Should have been updated — and this one is actively misleading.** This plan states that certain
`.claude/state/` families are *"Protected by the self-cleaner's live-state registry (see Lot C1)."* **That
registry was overturned** — the reconciliation file records the self-cleaner's "READY FOR GO" as WITHDRAWN
on 2026-07-30. So those files have no stated protection, while this plan tells a reader they do. This plan
also points at a design document at a path that does not exist.

**Half applied.** Telemetry was added to three "dark" gates; the same day's review named more. *(Flagged by
the seat as inference rather than a counted fact — verify before acting.)*

> **DECIDE — S-7a**: retire `scripts/clean-root.ts` + `npm run clean:root` as this plan already says to,
> or strike the retirement instruction?
> `DECIDE: ____`
> **DECIDE — S-7b**: fix the false protection claim — either rebuild the live-state registry or delete the
> sentence, because right now the plan protects those files on paper only?
> `DECIDE: ____`
> **DECIDE — S-7c**: fix or remove the dead design-document path?  `DECIDE: ____`
> **DECIDE — S-7d**: count the remaining dark gates properly rather than inheriting the inference?
> `DECIDE: ____`

---

## S-8 · Content-level consolidation — the CUD *inside* files, which nothing above does

Everything in this plan so far operates on **whole files**: find it, classify it, delete or move it. The
owner's efficiency goal is broader and was stated plainly: *"we don't just CUD the files, we also CUD the
data in the files."* Four files becoming one, or each of the four getting smaller.

**That work is not in this plan today, and the tools built to do it have not run.**

### The tools that exist and are idle

| tool | what it does | last run |
|---|---|---|
| `.claude/skills/compile-learnings/SKILL.md` | merges duplicate memory entries, prunes superseded ones, graduates recurring patterns into permanent rules | **2026-04-27** |
| `anthropic-skills:consolidate-memory` (plugin) | reflective pass over memory files — merge duplicates, fix stale facts, prune the index | **never referenced by any plan** |

`compile-learnings` appears in this plan family **only as a file to be audited** — zero DECIDE blocks name
it, and nothing anywhere instructs anyone to run it. It is a subject, never an action.

The memory index states what actually happened instead, verbatim: *"Index compacted 2026-07-31 (20.5KB →
15.1KB)."* That was **delete-and-archive, not consolidation.** Entries were removed and links collapsed;
nothing was merged. The distinction matters — a smaller index over the same 178 unmerged files is a
narrower table of contents, not less content.

### The population, and the half nobody wired

| population | files | bytes |
|---|---|---|
| repo `.claude/collaborator-memory/` | 140 | 685 KB |
| machine `~/.claude/projects/…/memory/` | 178 | 1,001 KB |
| of those, paired across both sides | **31** | — |
| **machine-only, unpaired** | **147** | — |
| machine `_archive/` | 12 | — |

**§ S-4 covers only the 31 paired files** — and only their drift, not their content. **The 147 machine-only
memory files have never been in any plan's scope.** They are the largest single body of instruction text
this system loads, and no consolidation pass has touched them in over three months.

A separate signal from the same population: the council's efficiency lot found **62 of the repo's 140
memory files carry zero references** — while explicitly warning that a loader may read the whole directory,
so a zero-reference count is a candidate signal, never a delete authorisation.

### What this is not

This is not the same question as § S-5. S-5 lists *which files* duplicate each other. S-8 is about running
the passes that actually merge and prune — including inside files that are individually fine but say the
same thing three ways.

> **DECIDE — S-8a**: run `/compile-learnings` over both memory populations as a lot in this plan? It is
> three months idle and it is the tool built for exactly this.
> `DECIDE: ____`

> **DECIDE — S-8b**: bring the **147 machine-only memory files** into scope — they are in no plan today,
> and they are instruction text every session loads?
> `DECIDE: ____`

> **DECIDE — S-8c**: after merging, reconcile the two sides so the repo and the machine hold the same
> consolidated set — otherwise consolidation on one side becomes fresh drift (see § S-4)?
> `DECIDE: ____`

> **DECIDE — S-8d**: apply the same content-level pass to the non-memory duplicates § S-5 names — the
> browser-tool doctrine in 2 files, navigation-first in 3, identity semantics in 3, the jargon ban in 3 —
> rather than only counting them?
> `DECIDE: ____`

> **DECIDE — S-8e**: `_TRIPLAN_RECONCILIATION.md` at **3,417 lines** against a realistic 400–700 as an
> index — is that a content-consolidation target, and does anything break if it shrinks?
> `DECIDE: ____`

---

## S-9 · Every surviving file gets the content-level pass — both halves of the system

Rutvik's directive (2026-08-05, verbatim intent): *"the same file level CRUD should happen with EVERY FILE
that survives slop sweep… such that we really really deep clean and make things efficient all around our
system"* — and *"not just on claude only! copilot and claude are part of the same system!"*

**Nothing wires that today.** The machinery exists — `PLAN_COPILOT_INTEGRATION_ULTRAAUDIT` Phase 2
(line-level slop pass, zero unreviewed rows) and Phase 2.5 (the efficiency question: is every loaded line
earning rent) — but its denominator predates this audit, and no plan states that the files SURVIVING this
sweep's file-level disposition get that pass. § S-8 runs it only over memory populations and five named
duplicate clusters.

**The lot**: after file-level disposition (delete / relocate / keep decided), every KEEP within the § S-6
human-relevant boundary (~7,326 files minus deletions — bulk-excluded groups stay excluded by their named,
counted reasons) receives a line-level content pass: dead code, duplicated logic, redundant prose, broken
or half-applied fixes, and compaction that saves Claude/Copilot tokens with zero meaning loss. Explicitly
BOTH halves: repository + `~/.claude/` (hooks, delegation doctrine, memory) + `~/.copilot/` (agent
profiles, config). Ticket doctrine for the lots: `.claude/skills/cleanup/SKILL.md` (dead code + duplicate
consolidation) and `.claude/skills/audit/SKILL.md` `--mode=slop` (DROP/KEEP), plus COPILOT_UA Phase 2.5's
efficiency question. Execution routes through COPILOT_UA's Phase 2/2.5 machinery with its denominator set
to this sweep's survivors — the pass runs once, not twice.

> **DECIDE — S-9**: adopt the survivor content pass as this plan's terminal lot (boundary = § S-6
> human-relevant set, both halves of the system, executed via COPILOT_UA Phase 2/2.5 machinery)?
> `DECIDE: ____`
