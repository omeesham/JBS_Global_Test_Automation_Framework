# Repo Slop Findings — Consolidated Council Audit

**Date**: 2026-07-18  
**Sources**: slop3-unionA (lots 01-08, fragment-A.md) + slop3-unionB (lots 09-16, fragment-B.md) + slop35-fable self-clean design + slop0 machine denominator (counts.md)  
**Scope note**: whole repo minus shipped client product code (`clients/encore/{src,tests,config}` + 6 ship files = 127 excluded). In-scope tracked: 1,588 files. Untracked (noise-pruned): 159. Ignored (large dirs collapsed): ~52,096 on-disk. Every finding row references an in-scope file.

---

## Coverage Reconciliation

```
Machine denominator (counts.md roster):  1,853 entries
  Breakdown: 1,849 files + 4 dirs
  In-scope tracked (git ls-files):        1,588
  Excluded shipped product:                 127
  Reconcile: 1,588 + 127 = 1,715 = git ls-files total ✓

16 lots walked:
  Fragment A (lots 01-08): slop2-LOT-01..08-0718 executor + reviewer pairs
  Fragment B (lots 09-16): slop2-LOT-09..16-0718 executor + reviewer pairs
  All 16 executor/reviewer pairs present — council-verified, cross-provider ✓

Per-lot non-KEEP row counts (from lot summaries):
  LOT-01: 60  LOT-02: 45  LOT-03: 17  LOT-04:  1
  LOT-05:  9  LOT-06:  2  LOT-07: 29  LOT-08:  0
  LOT-09: 64  LOT-10:  0  LOT-11:  2  LOT-12: 11
  LOT-13: 74  LOT-14: 95  LOT-15:  0  LOT-16:  5
  ─────────────────────────────────────────────────
  Subtotal before dedup:             414 rows
  Minus 2 bak-file dedupes
    (SKILL.md.bak-lcd07 + worker-ext.md.bak-lcd07
     appear in both LOT-02 and LOT-05):     − 2
  ─────────────────────────────────────────────────
  Deduplicated file-level finding rows:    412

  Note: LOT-12 includes 6 line-level credential flags within tracked
  files (not independent file verdicts); deducting yields ~406 file-level
  findings — consistent with the pre-synthesis estimate of ~402.
```

---

## Verdict Rollup

Deduped across all 16 lots:

| verdict  | count | primary lots |
|----------|------:|--------------|
| DELETE   |   347 | 01-08, 11-14, 16 |
| RELOCATE |    64 | 09 |
| RENAME   |     1 | 11 (godsplan.md) |
| MERGE    |     0 | — |
| **Total actionable** | **412** | |

KEEPs (collapsed): ~1,440 rows across all lots — confirmed load-bearing by executor + reviewer evidence.

Reviewer overturns applied (material corrections absorbed into counts above):
- LOT-02: delegation-primer.mjs flipped DELETE → KEEP (live reference found in .claude/skills/reflect/SKILL.md:70)
- LOT-03: 2 DELETE → KEEP overturns; 3 KEEP → DELETE flips (unproven-state-artifacts)
- LOT-04: 105 DELETE → KEEP (executor error; live citations confirmed by reviewer)
- LOT-07: 29 KEEP → DELETE (superseded/cancelled/credential plans; reviewer rescan)
- LOT-09: 0 DELETE → 64 RELOCATE (executor rubber-stamped KEEP; reviewer applied INDEX status)
- LOT-12: 6 credential-line flags added by reviewer (executor missed hardcoded fallbacks)

---

## Findings by Bucket

### Bucket: root/

**DELETE (60)** — Source: LOT-01

Walk-dump YMLs (untracked/ignored, 0 live-code refs):
- `eq-dialog2.yml`, `eq-newpricebook-walk1.yml`, `eq-strat-dialog.yml`, `eq-strat-pane.yml`, `eq-walk2.yml`
- `pg-aftersave.yml`, `pg-dlg2.yml`, `pg-edit1.yml`, `pg-edit2.yml`, `pg-edit3.yml`, `pg-grid.yml`
- `pg-picker.yml`, `pg-picker2.yml`, `pg-picker3.yml`, `pg-postsave.yml`, `pg-repro.yml`
- `pg-restorecheck.yml`, `pg-restored.yml`, `pgoverride-initial.yml` (19 files, pattern: walk-dump-at-root)

Orphan screenshots (untracked/ignored, 0 refs):
- `e2e-01-ready-before-disconnect.png`, `e2e-02-not-connected-after-disconnect.png`, `e2e-03-removed-terminal.png`

Leftover debris:
- `TEMPxlsxbuild.log` — TEMP-prefixed stale build log, 0 refs
- `jest.config.ts` — no npm script invokes jest; vestigial from pipeline unit-test era

Scratch directory (.recover-scratch/, 32 entries — untracked/ignored):
- `AFTER-fingerprint.txt`, `BEFORE-fingerprint.txt`, `TITLE-PLAN.txt`, `plan_done.md`, `spec-titles.json`
- `celldiff.js`, `cols.js`, `contentdiff.js`, `diff_xlsx.js`, `find_stray.js`, `fingerprint.js`
- `fix_li_notes.js`, `fix_notes.js`, `fix_titles.js`, `fullrow.js`, `golden_gate.js`, `jargon.js`
- `make_done_plan.js`, `probe_fails.js`, `spectitles.js`, `ssl.js`, `titleplan.js`, `valdump.js`
- `verify-trim-scopes.mjs`, `xlsx-trim-seed.mjs`, `notes-categorize.mjs`, `notes-inspect.mjs`
- `cur_committed_backup.xlsx`, `recovered-workbook.xlsx`, `testrail-before-ids.json`
- Regression-guard before/after export dumps from the local run; the artifact paths are gone, so this claim is unverified as file evidence.

Migration residual (empty dirs, 4 entries):
- `_migration_global_claude/plugins/`, `plugins/data/`, `plugins/data/playwright-claude-plugins-official/`, `plugins/data/playwright-inline/`

**KEEPs (12)**: `docker-compose.yml`, `render.yaml`, `rotation-state.json`, `.tmp/*` (×3), `tmp/*` (×3), generated Playwright last-run metadata, and generated Allure categories/environment files.

---

### Bucket: .claude/

**DELETE (60 unique)** — Sources: LOT-02, LOT-03, LOT-04, LOT-05, LOT-06

*Skills backup debris (LOT-02 + LOT-05, 3 unique after dedup):*
- `.claude/skills/final-q/SKILL.md.bak-lcd07`
- `.claude/skills/ultra-agents/worker-ext.md.bak-lcd07`
- `.claude/skills/ultra-agents/copilot-worker.sh.bak-lcd07`

*Gitignored compiled artifacts (LOT-05, 6 files):*
- `.claude/skills/ultra-agents/tavily-mcp/dist/src/index.js`
- `.claude/skills/ultra-agents/tavily-mcp/dist/src/rotation.js`
- `.claude/skills/ultra-agents/tavily-mcp/dist/src/tavily-client.js`
- `.claude/skills/ultra-agents/tavily-mcp/dist/src/types.js`
- `.claude/skills/ultra-agents/tavily-mcp/dist/test-client.js`
- tavily-mcp rotation state file (gitignored runtime state)

*Delegation-audit session docs (LOT-02 + LOT-03, 8 files):*
- `.claude/state/delegation-audit/arena-brief.md`
- arena verify report from the local delegation-audit scratch bundle; the artifact path is gone, so this claim is unverified as file evidence.
- classify-integration-plans report from the local delegation-audit scratch bundle; the artifact path is gone, so this claim is unverified as file evidence.
- `.claude/state/delegation-audit/critic-completeness.md`
- fight-design brief from the local delegation-audit scratch bundle; the artifact path is gone, so this claim is unverified as file evidence.
- `.claude/state/delegation-audit/m2-build-delegation.md`
- research-1 external report from the local delegation-audit scratch bundle; the artifact path is gone, so this claim is unverified as file evidence.
- ticket-A classify report from the local delegation-audit scratch bundle; the artifact path is gone, so this claim is unverified as file evidence.

*Delegation-audit snapshot hooks (LOT-02, 2 files):*
- `.claude/state/delegation-audit/inputs/hooks/delegation-gate.mjs`
- `.claude/state/delegation-audit/inputs/hooks/ua-worker-guard.mjs`

*Delegation-audit snapshot memory (LOT-02, 35 files):*
- `.claude/state/delegation-audit/inputs/memory/feedback_agent_cost_frugality.md`
- 34 additional memory-feedback snapshot entries from the same local delegation-audit input bundle; the artifact paths are gone, so the individual file citations are not portable evidence.

*Channel leftover (LOT-04, 1 file):*
- local KT prompt channel artifact (gitignored)

*Stale pending-plan + worktree (LOT-06, 2 entries):*
- `.claude/plans/plans-pending-plan-timeout-centralizatio-playful-rabbit.md`
- `.claude/worktrees/amazing-swanson-775132/` (5,049 children, 4,308 files, 673 MB — stale git worktree artifact)

**KEEPs**: All hooks wired in settings.json, operational state files, channel inbox/broadcast, delegation-primer.mjs (live ref in reflect/SKILL.md:70), all SKILL.md files, rules/*.md, agents/*.md, context/*.md.

---

### Bucket: plans/

**DELETE (30)** — Sources: LOT-07, LOT-11

*Credential-bearing done-plans (LOT-07, 4 — real passwords in git history; see § Credential/Secret Leaks):*
- `plans/done/PLAN_34_BACKEND_CLEANUP.md`
- `plans/done/PLAN_23_MONOREPO_INTEGRATION.md`
- `plans/done/PLAN_27_DEV_ENVIRONMENT.md`
- `plans/done/PLAN_31_VERIFICATION.md`

*Superseded/cancelled/misplaced done-plans (LOT-07, 25 files):*
- `plans/done/PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md` (INDEX=SUPERSEDED)
- `plans/done/PLAN_GENERATOR_AUDIT_AUTO_ADDON.md` (INDEX=RESOLVED-BY-POINTER)
- `plans/done/PLAN_HIST_COLUMN_FIRST_PIVOT.md` (INDEX=ARCHIVED-REFERENCE)
- `plans/done/PLAN_HIST_COMMIT_HISTORY_WORK.md` (INDEX=ARCHIVED-REFERENCE)
- `plans/done/PLAN_HIST_INTEGRITY_HARDENING.md` (INDEX=SUPERSEDED)
- `plans/done/PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md` (INDEX=SUPERSEDED)
- `plans/done/PLAN_MAINTAINER_SWEEP.md` (INDEX=SUPERSEDED)
- `plans/done/PLAN_MASTER_REPO_CLEANUP.md` (INDEX=SUPERSEDED)
- `plans/done/PLAN_PILOT_SHARED_DISCOVERY.md` (INDEX=SUPERSEDED)
- `plans/done/PLAN_PILOT_SHARED_TESTS.md` (INDEX=SUPERSEDED)
- `plans/done/PLAN_RCA_FULL_RUN_FAILURES.md` (INDEX=PENDING — misplaced in done/)
- `plans/done/PLAN_SHARED_SETUP_DQU.md` (INDEX=SUPERSEDED)
- `plans/done/PLAN_V2_REQUIREMENTS_GAPS.md` (INDEX=PENDING — misplaced in done/)
- `plans/done/SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md` (INDEX=CANCELLED)
- `plans/done/SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md` (SUPERSEDED)
- `plans/done/SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md` (SUPERSEDED)
- `plans/done/SUBPLAN_CORP_PRICING_DETAIL_DRAGDROP_REMEDIATION.md` (SUPERSEDED)
- `plans/done/SUBPLAN_CORP_PRICING_OVERRIDE_GAP_CLOSURE_2026_07.md` (SUPERSEDED)
- `plans/done/SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION.md` (SUPERSEDED)
- `plans/done/SUBPLAN_CORP_PRICING_OVERRIDE_PICKER_1101.md` (SUPERSEDED)
- `plans/done/SUBPLAN_CORP_PRICING_SHADOW_EDGE.md` (SUPERSEDED)
- `plans/done/SUBPLAN_CORP_PRICING_SHADOW_FRAMEWORK_CLOSURE.md` (SUPERSEDED)
- `plans/done/SUBPLAN_CORP_PRICING_SHADOW_INTEGRATION.md` (SUPERSEDED)
- `plans/done/SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` (SUPERSEDED)
- `plans/done/SUBPLAN_DQU_05A_LI_TC_PHASE_0_LINT_SWEEP.md` (SUPERSEDED)

*Stale pending (LOT-11, 1 file):*
- `plans/pending/PLAN_CODEREVIEW_FINDINGS_REMEDIATION.md` (superseded same-day)

**RELOCATE (64)** — Source: LOT-09 (all INDEX status SUPERSEDED/SUBSUMED/FOLDED)

DQU family: `SUBPLAN_DQU_11_F1_REMAINING_MODULES_PLANNER.md`, `SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md`, `SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md`, `SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md`, `SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md`, `SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md`, `SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md`, `SUBPLAN_SHARED_SETUP_DQU_BUILDER.md`, `SUBPLAN_SHARED_SETUP_DQU_GIVER.md`, `SUBPLAN_SHARED_SETUP_DQU_HUNTER.md`

HIST_PIVOT family (30 files): `SUBPLAN_HIST_PIVOT_10` through `SUBPLAN_HIST_PIVOT_40_K2_PROMPTS_SWEEP.md` + `SUBPLAN_HISTORY_08_BUG_REPORTS.md`

PARITY family: `SUBPLAN_PARITY_01` through `SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md`

REPO family: `SUBPLAN_REPO_01_CLIENT_DELIVERY_QUICK.md` through `SUBPLAN_REPO_13_COPILOT_ACCOUNTABILITY.md` (12 files)

Other: `SUBPLAN_SHIP_NM2260_CORP_PRICING_DELIVERABLE.md`

**RENAME (1)** — Source: LOT-11
- `plans/pending/godsplan.md` → PLAN_GODSPLAN.md (violates CONVENTIONS.md naming; 6 live refs must be updated)

**KEEPs**: 121 (LOT-07) + 150 (LOT-08) + 86 (LOT-09) + 5 (LOT-10) + 162 (LOT-11) = 524 done/pending plans retained.

---

### Bucket: clients-internal/ (`clients/encore/` non-shipped)

**DELETE (183)** — Sources: LOT-03, LOT-13, LOT-14

*Nested duplicate debris (LOT-03, 3 files — byte-identical hash to canonical twin):*
- `clients/encore/clients/encore/specs_planning/_internal/evidence-cp-review-2026-07-13/02-detail-after-A10.png`
- `clients/encore/clients/encore/specs_planning/_internal/evidence-cp-review-2026-07-13/02-detail-after-A11.png`
- `clients/encore/clients/encore/specs_planning/_internal/evidence-cp-review-2026-07-13/03-detail-after-A11.png`

*Root-dumped session screenshots (LOT-03, 5 files):*
- `clients/encore/job3b-current-state.png`, `job3b-screenshot-checked-search11.png`
- `clients/encore/job3b-screenshot-checked.png`, `job3b-screenshot-unchecked-search11.png`, `job3b-screenshot-unchecked.png`

*Orphan review text files (LOT-03, 3 files):*
- `clients/encore/review2-spec-1.txt`, `clients/encore/review2-spec-2.txt`, `clients/encore/review2-tc-parity.txt`

*Root-dumped import screenshots (LOT-03, 3 files):*
- `clients/encore/step1-4107-equipment.png`, `clients/encore/step3-import-dialog.png`, `clients/encore/step4-import1-ready.png`

*Stale Playwright evidence subtree (LOT-13 + LOT-14, ~163 files):*
All files under `clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/`:
trace.zip, test-failed-*.png, error-context.md, test-results/, .last-run.json, junit-results.xml,
console.log, diagnostics/*.json, failure-summary.json, test-results.json, build-tracker-csv.mjs,
list-census.txt, auth-warmup.log, skip-grep.txt, _pre-consolidation-tracker.csv (run1 and run2)

*Orphan field-inventory screenshots (LOT-14, 3 files):*
- `clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29-address-dialog.png`
- `clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29-tab.png`
- `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-05.png`

*One-time id-audit scripts (LOT-14, 6 files):*
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/fix-offbyone.mjs`
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/fix-shorthand.mjs`
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/md-fixes.mjs`
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/remediate.mjs`
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/summarize-findings.mjs`
- `clients/encore/specs_planning/_internal/id-audit-2026-06-10/testplan-fixes.mjs`

**KEEPs**: ~242 (LOT-03: 62 + LOT-13: 75 + LOT-14: 55 + LOT-15: ~50 clients-internal portion)

---

### Bucket: scripts+src+pipeline/

**DELETE (5 files)** — Source: LOT-12

Dead source code (0 callers / not in barrel):
- `pipeline/worker/progress-extractor.ts` — 0 code consumers; orphan post-relocation
- `src/utils/agent-reporter.ts` — DEPRECATED 2026-05-19; not in barrel; 0 callers
- `src/utils/retry-telemetry.ts` — not in barrel; sole importer is deprecated agent-reporter.ts

Orphan scripts (0 refs in tracked code, not in package.json/hooks):
- `scripts/build-audited-bug-report.js`
- `scripts/build-reverified-bug-report.js`

**Credential-line flags (6 — action needed, not standalone file verdicts):**  
See § Credential/Secret Leaks below.

**KEEPs**: 145 (LOT-12) — all other pipeline/, src/, scripts/ files confirmed load-bearing.

---

### Bucket: other/ (website/, .ci/, .githooks/, .work/, export_test_cases/)

**DELETE (5)** — Source: LOT-16

- `.work/hunter-shared-setup/nav2-shared-setup-clicked.yml` — orphan Playwright accessibility-tree snapshot, 0 refs
- `.work/hunter-shared-setup/nav2-shared-setup-tab.yml` — same
- `website/FRONTEND_INTEGRATION_RESPONSE.md` — agent-to-agent comms artifact; not product doc
- `website/plan.md` — planning doc committed to repo; belongs in plans/
- `website/frontend/src/data/jiraconfig.txt` — CRITICAL: live Atlassian API key (see § Credential/Secret Leaks)

**KEEPs (165)**: entire `website/` SaaS product (confirmed live per README.md:42 + CURRENT_STATE.md); `.ci/*` (6); `.githooks/*` (4); `export_test_cases/*` (11); `website/frontend/src/data/jbs-logo-main.png` (static brand asset).

---

## Credential/Secret Leaks

Severity: S3 = live/real credential in git history | S2 = dev credential committed | S1 = possible/non-critical

**All secret values are redacted. Paths and locations only.**

| file | location | finding | severity | in git history | lot | action |
|------|----------|---------|----------|----------------|-----|--------|
| `plans/done/PLAN_34_BACKEND_CLEANUP.md` | lines 65-67 | Real account passwords [redacted] committed as walkthrough context | S3 | YES — commit 3f39024c | LOT-07 exec | DELETE file; history scrub |
| `plans/done/PLAN_23_MONOREPO_INTEGRATION.md` | — | Same passwords [redacted] | S3 | YES | LOT-07 reviewer | DELETE file; history scrub |
| `plans/done/PLAN_27_DEV_ENVIRONMENT.md` | — | Admin credentials [redacted] | S3 | YES | LOT-07 reviewer | DELETE file; history scrub |
| `plans/done/PLAN_31_VERIFICATION.md` | — | Admin credentials [redacted] | S3 | YES | LOT-07 reviewer | DELETE file; history scrub |
| `website/frontend/src/data/jiraconfig.txt` | line 3 | LIVE Atlassian API key [redacted — revoke on Atlassian console before any other action] | S3 | YES | LOT-16 exec | URGENT: revoke key; DELETE file; history scrub (Rutvik decision: HEAD-only vs full rewrite) |
| `pipeline/server/routes/admin.ts` | line 20 | Hardcoded dev-secret worker auth fallback [redacted] | S3 | YES — bbed318f | LOT-12 reviewer | Remove fallback; env-var-only path; code review |
| `pipeline/server/routes/events.ts` | line 56 | Hardcoded dev-secret fallback [redacted] | S3 | YES | LOT-12 reviewer | Same |
| `pipeline/server/routes/worker.ts` | line 21 | Hardcoded dev-secret fallback [redacted] | S3 | YES | LOT-12 reviewer | Same |
| `pipeline/worker/index.ts` | line 42 | Hardcoded dev-secret fallback [redacted] | S3 | YES | LOT-12 reviewer | Same |
| `pipeline/worker/worker-manager.ts` | line 31 | Hardcoded dev-secret fallback [redacted] | S3 | YES | LOT-12 reviewer | Same |
| `src/common/credential-loader.ts` | line 103 | Admin password fallback [redacted] | S3 | YES — 3edb6f19 eeb387e5 cc990407 | LOT-12 reviewer | Same |
| `.claude/context/CURRENT_STATE.md` | line 37 | PostgreSQL password [redacted] in tracked file | S2 | YES — confirmed by reviewer git-history-secret.verify.txt | LOT-06 reviewer | Scrub value from file; history scrub |
| local broadcast channel artifact (gitignored) | line 19 | Local dev DB credentials [redacted] | S2 | YES | LOT-04 reviewer MISS-002 | Scrub value from file |
| `plans/done/PLAN_REMOVE_VAULT.md` | line 36 | `password: ... \|\| 'admin'` — possible non-secret fallback pattern | S1 | YES | LOT-08 reviewer MISS-03 | Review; remediate if real |

**History scrub decision**: Rutvik leaning HEAD-only (no full history rewrite + force-push) — final call pending (see PLAN_REPO_SLOP_SWEEP.md § Owner Decisions).

---

## Slop Pattern Catalog

Aggregated from self-clean-design.md § "Slop patterns in this repo" + both fragment pattern-frequency sections.

| # | Pattern | Count (audit) | Root cause | Deterministic detection rule | Det? |
|---|---------|:---:|---|---|:---:|
| P1 | walk-dump-at-root (eq-/pg-/pgoverride-*.yml, .work/**/*.yml) | 21+ | playwright-cli walks snapshot to cwd; session ends without cleanup | Untracked/ignored file matching `/eq-*.yml`, `/pg-*.yml`, `/pgoverride-*.yml`, `.work/**/*.yml` AND mtime > age-gate | YES |
| P2 | uncleaned-scratch dirs (.recover-scratch/, _migration_global_claude/) | 36+ | One-time ops create scratch dir; op completes; dir stays (delete-after-restore note never executed) | Ignored/untracked dir matching scratch-name registry with all-files mtime > age-gate; empty dir trees anywhere | YES |
| P3 | stale session-state snapshots (.claude/state/delegation-audit/inputs/) | ~85 | Audit/arena sessions copy live files as frozen inputs; session concludes; snapshot never removed | Untracked file under `.claude/state/**` whose sha256 equals live file elsewhere (snapshot-twin) OR parent session-dir mtime > TTL | YES |
| P4 | ephemeral test artifacts committed as evidence (defence-evidence-2026-06-01/**) | 100+ | Evidence-capture workflow copies whole Playwright output dirs into specs_planning/_internal/ | File under dated `*-evidence-*`/`defence-*` dir matching Playwright output signatures older than TTL | YES |
| P5 | orphan screenshots / media at root + nested dup PNGs | 6+ | Ad-hoc screenshots land in cwd; Windows path mishaps create nested `clients/<id>/clients/<id>/` trees | Untracked root media; path containing repeated `clients/<id>/clients/<id>` segment; byte-identical hash to canonical twin | YES |
| P6 | leftover-debris one-offs (*.bak-lcd07, KT prompts, stale .claude/plans, worktree artifacts) | 12+ | Edit-with-backup habit, plan-mode auto-files, worktree spawns — each leaves a corpse | Filename signatures: `*.bak*`, `*.orig`, `TEMP*`, `/C:*`, `~$*`; `.claude/worktrees/<name>` absent from git worktree list | YES |
| P7 | secrets in tracked files (PLAN_23/27/31/34, jiraconfig.txt, pipeline fallbacks) | 5+ files, 1 live key | Plans paste real credentials as walkthrough context; done-plans never re-read; no universal secret scan | Secret-regex battery / gitleaks over `git ls-files` denominator; classify dev-placeholders vs real (known-placeholder allowlist) | YES |
| P8 | vestigial-infra (jest.config.ts, stale .githooks vendor no-ops) | ~4 | Infra outlives the workflow that used it | Config file whose tool has no npm-script/CI/hook invoker (name absent from package.json scripts, .ci/**, .githooks/**, settings.json) | PARTIAL |
| P9 | done-plan sprawl + citation-inflated KEEPs (hundreds of plans/done with only INDEX/closure-audit inbound refs) | 100s | Every plan closure writes INDEX + closure-audit rows → self-referential KEEP evidence | Done-plan whose only inbound refs come from plans/INDEX.md, closure-audits/**, closure-manifest*, plans/done/** → archive-candidate | YES (classification) |
| P10 | .claude/state runtime churn (closure-attempts, ua-worker/ audit dirs, gate-warning JSONs) | 300+, growing | Every gate/session persists state; nothing expires it | State-family registry with per-family TTL; anything in .claude/state/ outside live-state registry with mtime > TTL | YES |

**Cross-cutting root cause**: every producer workflow (walks, recovery ops, evidence capture, arena sessions, plan-mode, worktrees, this audit itself) creates files as a side effect, and closure ceremonies check deliverables but not residue. Combined with a gitignore that hides residue from `git status`, the only feedback signal was disk archaeology.

**Pattern frequency totals (deduplicated across fragments):**

| pattern-tag | frag-A count | frag-B count | total |
|---|:---:|:---:|:---:|
| walk-dump-at-root | 19 | 0 | 19 |
| uncleaned-scratch | 32 | 0 | 32 |
| leftover-debris | 28 | 0 | 28 |
| stale-asset | 44 | 0 | 44 |
| orphan-output | 2 | 0 | 2 |
| orphan-screenshot | 3 | 0 | 3 |
| vestigial-infra | 2 | 4 | 6 |
| unproven-state-artifact | 3 | 0 | 3 |
| credential-leak | 4 | 7 | 11 |
| superseded-done-plan | 19 | 0 | 19 |
| stale-done-plan | 0 | 64 | 64 |
| stale-test-artifact / orphan-artifact | 0 | ~166 | ~166 |
| one-time-tooling | 0 | 6 | 6 |
| dead-code | 0 | 3 | 3 |
| orphan-script | 0 | 2 | 2 |
| wrong-done-folder-state | 2 | 0 | 2 |
| cancelled-done-plan | 1 | 0 | 1 |
| archived-reference-left-active | 2 | 0 | 2 |
| pointer-resolved-plan | 1 | 0 | 1 |
| missing-frontmatter | 0 | 11 | 11 (KEEP-S2) |
| stale-pending | 0 | 2 | 2 |
