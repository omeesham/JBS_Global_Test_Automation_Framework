**Status**: Pending  
**Priority**: HIGH  
**PermissionMode**: default  
**Date**: 2026-07-18  
**Owner**: OWNER  
**Source**: Whole-repo council slop sweep — 16-lot machine-denominator audit (slop0 through slop3, cross-provider council review)

---

# PLAN_REPO_SLOP_SWEEP — Whole-Repo Slop Cleanup

## Objective

Clean the repo to only load-bearing files. Remove ~412 actionable findings (347 DELETE, 64 RELOCATE, 1 RENAME) identified by a machine-denominator 16-lot council audit across all in-scope tracked, untracked, and ignored files.

**Nothing executes without Rutvik GO.** Category C and D lots require explicit per-item GO before any action is taken. Category A and B lots are dispatchable once Rutvik confirms the overall plan.

---

## Execution Order (READ FIRST — baked 2026-07-19, Rutvik-directed)

This plan is PARKED. A future (rested) session runs these IN ORDER — do not rush to execute:

1. **STEP 0 — Upgrade + reconcile ULTRAAUDIT FIRST (mandatory; Owner Decision (e) = YES).** Before ANY Category C/D lot here touches a `.claude/**` harness file, run the `PLAN_ULTRAAUDIT_FIX_WAVE.md` upgrade: re-run its bug hunt over the full machine denominator (`.claude/state/ua-worker/slop0-enum-0718-artifacts/denominator.md`) and reconcile its fix-list against this sweep's DELETE-list. Reason: both plans touch the same harness files — fixing a file another lot deletes (or deleting one another lot fixes) is exactly the collision this prevents. See `PLAN_ULTRAAUDIT_FIX_WAVE.md` → "Execution Prerequisite".
2. **STEP 1 — Category A** (safe untracked/ignored debris: root walk-dumps, scratch dirs, temp logs) may run independently of Step 0 — it touches no tracked source ULTRAAUDIT cares about.
3. **STEP 2 — Categories B/C/D** run only AFTER Step 0's reconciliation, and only for items whose Owner Decision (below) is answered. C/D are per-item GO.
4. **Answer the Owner Decisions batch first** — an unanswered decision means that lot waits, it does not proceed on a guess.

No step is skipped for speed. If anything is unclear at run time: STOP, re-read this block + Owner Decisions — do not improvise.

---

## Why ULTRAAUDIT Missed This

The prior audit built its file denominator by **model judgment** — "list the framework files" — instead of mechanical enumeration. Proven consequences:

1. **~1,080 non-client files were simply never in scope.** No judgment pass volunteers files it doesn't think to name. The slop2 audit only reached them because reviewers re-derived denominators mechanically (`git ls-files` triad + `Get-ChildItem -Force` full-disk walk, as in LOT-05 review).

2. **All gitignored on-disk cruft was structurally invisible.** Judgment enumeration starts from tracked files and mental maps. The `/.gitignore` had already hidden 52,096 ignored on-disk files from every `git status` any model ever saw. The 19 walk-dump YMLs at root, the 35-file `.recover-scratch/` dir, the 5 tavily dist/ compiled artifacts — none appeared in any prior audit because gitignore had already made them invisible to the judgment pass.

3. **Reference-counting inflated KEEPs.** Generated `plans/INDEX.md`, closure-audit manifests, and done-plan prose cite everything. "N refs found" was counted as liveness. LOT-07 reviewer overturned exactly this: 29 blanket KEEPs flipped to DELETE after re-checking INDEX status (SUPERSEDED/CANCELLED/ARCHIVED-REFERENCE). LOT-09 reviewer flipped 64 more.

4. **Executors claimed grep sentinels that reviewers falsified.** LOT-01 review MISS-02/03: a missing file was classified as a delete candidate; "no matches" claims contained matches. The slop2 method's mandatory cross-provider reviewer re-executed all evidence — single-executor self-verification is insufficient.

**Root cause** = a model-judged denominator inherits the model's blind spots (violates the machine-denominator law: judgment enumerates, machines own denominators). The fix is baked into this sweep's verification battery and into the self-cleaner's permanent denominator design.

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
- `.claude/skills/ultra-agents/tavily-mcp/rotation-state.json`

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

**Files (31 tracked):**

clients/encore root debris (14):
- `clients/encore/clients/encore/specs_planning/_internal/evidence-cp-review-2026-07-13/02-detail-after-A10.png`
- `clients/encore/clients/encore/specs_planning/_internal/evidence-cp-review-2026-07-13/02-detail-after-A11.png`
- `clients/encore/clients/encore/specs_planning/_internal/evidence-cp-review-2026-07-13/03-detail-after-A11.png`
- `clients/encore/job3b-current-state.png`, `clients/encore/job3b-screenshot-checked-search11.png`
- `clients/encore/job3b-screenshot-checked.png`, `clients/encore/job3b-screenshot-unchecked-search11.png`
- `clients/encore/job3b-screenshot-unchecked.png`
- `clients/encore/review2-spec-1.txt`, `clients/encore/review2-spec-2.txt`, `clients/encore/review2-tc-parity.txt`
- `clients/encore/step1-4107-equipment.png`, `clients/encore/step3-import-dialog.png`, `clients/encore/step4-import1-ready.png`

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

website debris (2):
- `website/FRONTEND_INTEGRATION_RESPONSE.md`
- `website/plan.md`

.claude/ leftover (2):
- `.claude/channel/KT_PROMPT_FOR_COLLEAGUE.md`
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
- `.claude/state/delegation-audit/arena-brief.md`, `arena-verify.md`, `classify-integration-plans.md`
- `.claude/state/delegation-audit/critic-completeness.md`, `fight-design-brief.md`
- `.claude/state/delegation-audit/m2-build-delegation.md`, `research-1-external.md`, `ticket-A-classify.md`
- `.claude/state/delegation-audit/inputs/hooks/delegation-gate.mjs`
- `.claude/state/delegation-audit/inputs/hooks/ua-worker-guard.mjs`
- `.claude/state/delegation-audit/inputs/memory/feedback_agent_cost_frugality.md` (and 34 other feedback_* files — see _REPO_SLOP_FINDINGS.md § .claude/ bucket for full list)

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
- `plans/pending/godsplan.md` — RENAME to `plans/pending/PLAN_GODSPLAN.md` (6 live refs must be updated)

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

**Scope**: Build the SessionStart-throttled automatic sweeper designed in `.claude/state/ua-worker/slop35-fable-selfclean-0718-artifacts/self-clean-design.md`.

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
- `.claude/channel/broadcast/BROADCAST.md` — dev DB credentials at line 19 (scrub value; keep file)

**Action**:
1. `git rm plans/done/PLAN_34_BACKEND_CLEANUP.md plans/done/PLAN_23_MONOREPO_INTEGRATION.md plans/done/PLAN_27_DEV_ENVIRONMENT.md plans/done/PLAN_31_VERIFICATION.md`
2. Edit `.claude/context/CURRENT_STATE.md:37` and `.claude/channel/broadcast/BROADCAST.md:19` — replace credential values with `[redacted]` placeholders
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

**Reference**: Full design at `.claude/state/ua-worker/slop35-fable-selfclean-0718-artifacts/self-clean-design.md`

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

**(b) plans/done archival (640 files, 64 flagged for RELOCATE)**  
Options: move 64 SUPERSEDED/SUBSUMED/FOLDED entries to `plans/archive/` (Lot B5) vs leave all in `plans/done/` (no action).  
Recommendation: create `plans/archive/` and move the 64; keeps done/ as "recently executed" vs archive/ as "superseded history". Non-blocking for other lots.

**(c) website/ frontend sub-tree disposition**  
`website/` is referenced 57× in `.claude` docs and confirmed LIVE (active SaaS product per README.md:42 + CURRENT_STATE.md).  
Options: keep in place (no action beyond Lot D2 credential removal) vs relocate to a separate repo.  
Recommendation: keep in place; the only action needed is Lot D2 (jiraconfig.txt removal). No structural change to website/ required by this sweep.

**(d) Self-cleaner build timing**  
Options: build now (Lot C1 in this sweep) vs defer to a separate plan after the manual cleanup lots complete.  
Recommendation: build after Category A/B lots execute, so the sweeper's first run measures the post-cleanup baseline rather than re-reporting already-handled items. Non-blocking for Category A/B.

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
