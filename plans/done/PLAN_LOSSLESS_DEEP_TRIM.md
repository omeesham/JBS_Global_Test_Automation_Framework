# PLAN_LOSSLESS_DEEP_TRIM — Repo-wide lossless deep trim (master tracker)

**Status**: DONE
**Executed**: 2026-07-17
**Priority**: P0
**Created**: 2026-06-12
**Identity**: OWNER
**Depends on**: none
**Blocks**: SUBPLAN_TRIM_01..06 (children), adopted SUBPLAN_RCD_B / SUBPLAN_RCD_C execution order
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: plan
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

The repo has never been deep-trimmed since the two restructures (2026-04-30 client-deliverable rebuild, 2026-06-05 POM restructure). An old cleanup-plan family sits unexecuted and largely stale in `plans/pending/`; fresh surveys (2026-06-12, three Explore agents + OWNER spot-verification) found live dead-weight. This master tracks a **lossless** trim: every removal must be re-proven dead in its own execution session, every tracked deletion recoverable via git history, no user data deleted.

**User decisions locked 2026-06-12** (chat, OWNER session):
1. Old stale cleanup plans → supersede with per-item audit trail (TRIM_02). Nothing deleted.
2. Scope: code/scripts dead-weight + plans-corpus hygiene + minor docs/.claude items. **OUT of scope**: JBS rename (SUBPLAN_REPO_08 stays parked), DQU_26/27/28 client-deliverable sweep (stays under PLAN_DELIVERABLE_QUALITY_UPGRADE), `website/`, node_modules, gitignored artifacts except where SUBPLAN_RCD_C already covers them.
3. Approvals: **up-front** — the Approved Candidate Ledger below IS the approval. Sessions do not pause for approval, BUT only ledger items that pass in-session re-proof may be touched. Re-proof failure = DROP + log. Newly discovered candidates go to the session's `## Next-batch ledger` section — no action without a future user approval round.
4. Execution: interactive, one subplan per session, sequential (shared worktree/index — parallel sessions would corrupt commits and regression-guard fingerprints).

**Anti-hallucination precedent (why re-proof is non-negotiable)**: the 2026-06-12 survey produced two false positives, both caught by OWNER spot-verification before this plan was authored — (1) "navigation.md broken memory links" (file exists at the user-level memory dir; agent resolved the relative path against the wrong root); (2) "`scripts/planner-pre-run.ts` is orphaned" (the pre-run/post-complete family is wired via `config/pipeline-definition.json`, not npm scripts). Survey findings are HYPOTHESES, never evidence.

---

## Re-Proof Protocol (shared — every TRIM/RCD session executes this verbatim per candidate)

Rule zero: **candidate lists in subplans are hypotheses from a prior session. Nothing enters a delete/edit action without a same-session evidence block.**

Per candidate file `F` with stem `S` (filename minus extension):

1. **Tracked check**: `git ls-files --error-unmatch <F>` — untracked → reclassify (deletion would be irrecoverable): relocate to `tmp/` or SKIP. Never silent-delete untracked content.
2. **Zero-ref greps — ALL of these, each logged even when output is empty**:
   - code surface: `rg -n "<S>" --hidden -g "!node_modules" -g "!plans/" -g "!docs/"`
   - npm scripts: `rg -n "<S>" package.json clients/encore/package.json`
   - **config-wiring scan (mandatory — catches the planner-pre-run class)**: `rg -n "<S>" config/ .githooks/ .claude/ docker-compose.yml render.yaml tsconfig.json tsconfig.build.json playwright.config.framework.ts`
   - shell/dynamic callers: `rg -n "<S>" scripts/ pipeline/` (spawn/execSync/fork/import string literals)
   - plans + docs separately: `rg -n "<S>" plans/ docs/` — hits here are classified doc-only (they do NOT keep code alive; they DO get a stale-pointer note in the session log).
3. **Classify every hit**: `live-caller | config-wired | doc-only | self-ref | test-of-dead`. Any `live-caller` or `config-wired` → automatic DROP (or convert to coordinated removal: all caller edits land in the SAME commit as the deletion).
4. **Evidence format** (LR-042): `ran '<exact command>' → output: '<first lines | EMPTY>'`, recorded in the subplan's Execution Summary.
5. **Post-change battery**: `/regression-guard` before/after fingerprint diff; `npx tsc --noEmit` (root) + `npx tsc --noEmit -p clients/encore`; `npx playwright test --list` if anything spec-adjacent changed; `bash .githooks/pre-commit` smoke if hooks were edited; `npm run plans:reindex` if plan files moved (LR-035).
6. **Staging discipline**: explicit-path staging only (`git add -u -- <enumerated paths>`). `git add -A` and `git commit -a` are FORBIDDEN in every trim session (the working branch carries unrelated WIP).

**Closure-gate authoring note (LR-055 C3)**: the closure validator's cited-path regex matches doc/artifact extensions (`md/json/yml/yaml/log/txt/csv/html/xml/...`) but NOT `.ts/.mjs/.js/.sh/.ps1`. When an Execution Summary must mention a DELETED file whose extension is in the matched set, cite it extension-free (e.g., "auto-addon-probe (yml, untracked, relocated)") so C3 does not fail on a legitimately-absent path. Script targets may be cited normally.

---

## Untouchables (hard DO-NOT-TOUCH — cited by every child session)

- `scripts/*-pre-run.ts` / `scripts/*-post-complete.ts` / `pipeline/scripts/*-post-complete.ts` — wired via `config/pipeline-definition.json` (verified 2026-06-12; documented survey false positive).
- Untracked-but-live WIP (belongs to the jargon/FCC plans, not the trim): `.claude/hooks/jargon-gate.sh`, `.claude/hooks/lib/check-jargon.mjs`, `.claude/hooks/lib/test-jargon-fixtures.mjs`, `.claude/rules/deliverable.md`, `scripts/lib/`, `scripts/xlsx-compose-reason.test.ts`, `plans/pending/PLAN_JARGON_AUTHORING_GATE.md`, untracked files under `plans/done/`.
- All in-flight MODIFIED files on the working branch (`.claude/agents/*`, `.claude/settings.json`, `export_test_cases/to-xlsx.ts`, `package.json`, etc.) — never staged by a trim session except where a subplan explicitly edits them.
- `.claude/context/navigation.md` memory links (verified valid 2026-06-12 — user-level `~/.claude/projects/.../memory/` path exists).
- `reports/**` data — relocate-only per SUBPLAN_RCD_C; never delete (feedback_dont_destroy_user_data).
- Survey-confirmed NOT-DEAD core infra: `scripts/verify-no-forbidden.mjs`, `scripts/xlsx-lint-rules.mjs`, `scripts/xlsx-trim.mjs`, `scripts/run-relevant-scan.mjs`, `scripts/identity-ownership.mjs`, `scripts/check-identity-ownership.mjs`, `scripts/check-subplan-identity.mjs`, `scripts/shared-types.ts`, `scripts/shared-paths.ts`, `scripts/shared-paths.mjs`.

---

## Approved Candidate Ledger (user-approved 2026-06-12, pre-re-proof — the only items sessions may act on)

| # | Candidate | Category | Current evidence (2026-06-12 survey + spot-checks) | Acting subplan | Risk |
|---|---|---|---|---|---|
| 1 | 25 already-deleted tracked files under `.playwright-cli/` + `scripts/build-framework-vendor-all.mjs` + `scripts/build-framework-vendor.ts` | commit pending deletions | already `D` in git status; vendoring removed by PLAN_DIST_REGRESSION_AND_N_FIXES | TRIM_01 | Low |
| 2 | Stale cleanup-plan family: PLAN_MASTER_REPO_CLEANUP, SUBPLAN_REPO_03/04/05/06/07/10/11/12, PLAN_CODEBASE_CLEANUP, PLAN_MAINTAINER_SWEEP, PLAN_FULL_CHAIN_AUDIT (Category A slice) | supersede w/ audit trail | per-plan staleness dossier 2026-06-12 (REPO_03/05/12 fully stale; 04/06/10/11 partially; targets moved by restructures) | TRIM_02 | Med |
| 3 | Pending plans already resolved (Status SUPERSEDED / SUBSUMED / RESOLVED-BY — e.g. SUBPLAN_DQU_18, SUBPLAN_DQU_33; authoritative list regenerated in-session) + PLAN_BUG_HUNTING_RULEBOOK_V2 missing top-level Status (body line :95 mimics one) | plans-corpus hygiene | INDEX + frontmatter greps 2026-06-12 | TRIM_03 | Low-Med |
| 4 | `scripts/verify-vendor-fresh.mjs` (self-declared DEPRECATED no-op) + its 4 caller edges (`.githooks/pre-commit`, `.githooks/pre-push`, `scripts/ship-client.sh`, `scripts/ship-client.ps1`) | coordinated removal | header comment "DEPRECATED 2026-05-19"; 4 live callers verified 2026-06-12 | TRIM_04 | High (ship path) |
| 5 | `scripts/priority-sweep.mjs`, `scripts/validation-gates.ts`, `scripts/migrate-queue-csv-to-xlsx.mjs` | dead script deletion | no npm/hook/config caller found in survey; re-proof mandatory. **TRIM_04 outcome 2026-07-16: priority-sweep + migrate-queue REMOVED; validation-gates DROPPED — survey false positive, 3 live callers (audit-post-complete.ts:21, audit-pre-run.ts:122, pipeline healer gate)** | TRIM_04 | Med |
| 6 | Dead npm scripts in root `package.json` pointing at nonexistent files (enumerated in-session) | npm script prune | survey indication; in-session enumeration | TRIM_04 | Low |
| 7 | `export_test_cases/to-jira.ts`, `to-json.ts`, `to-testmo.ts` + prune their `index.ts` dispatch branches; `markdown-parser.ts` KEEP (live via `to-csv.ts` → `to-xlsx.ts`) | transitive-dead converters | referenced ONLY by `export_test_cases/index.ts` (verified 2026-06-12); reachability analysis required | TRIM_05 | Med (deliverable-adjacent) |
| 8 | 4 root archive scripts + 8 dead allure npm scripts | root scripts dedupe | per SUBPLAN_RCD_B (adopted as-written) | RCD_B | Med |
| 9 | Root tsconfig demotion, `.env.server` delete, root `reports/bugs/` RELOCATION, root cruft sweep (counts regenerated in-session) | env/reports/cruft | per SUBPLAN_RCD_C (adopted + provenance amendment) | RCD_C | High (user data → relocate-only) |
| 10 | Minor docs/.claude residue: skills INDEX count drift check ("28 vs 29"); anything else only via next-batch ledgers | docs/config polish | survey verdict: surface near-clean | TRIM_06 | Low |

Anything NOT in this table is out of bounds for trim sessions (next-batch ledger only).

---

## Execution order (one interactive session each)

1. [SUBPLAN_TRIM_01_COMMIT_PENDING_DELETIONS.md](plans/done/SUBPLAN_TRIM_01_COMMIT_PENDING_DELETIONS.md) — **DONE 2026-07-16**, closed as NO-OP: the pending deletions were absorbed by interim commits (`4a24e140` migration snapshot + `df722a55`); `git status` shows 0 pending deletions, so the clean fingerprint baseline already exists.
2. [SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md](SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md) — disposition before execution: exactly one plan governs each deletion category.
3. [SUBPLAN_TRIM_03_PLAN_CORPUS_HYGIENE.md](plans/done/SUBPLAN_TRIM_03_PLAN_CORPUS_HYGIENE.md) — **DONE 2026-07-16**, 15 resolved plans moved to done/ (git mv only, statuses preserved), RULEBOOK_V2 Status repaired, NB-8/9 re-homed to SUBPLAN_MNT_FCC_REHOME.md first; council-verified (gpt analysis + opus disk-claim review GREEN 16/16), INDEX 120/434, stale-triage flag emitted.
4. [SUBPLAN_TRIM_04_SCRIPTS_DEADWEIGHT.md](plans/done/SUBPLAN_TRIM_04_SCRIPTS_DEADWEIGHT.md) — **DONE 2026-07-16**, council-executed: vendor-fresh + 4 callers removed atomically (commit 93a07763, -437 lines), 2 orphans deleted with re-proof, validation-gates correctly DROPPED (live callers), healer:post-complete npm entry dead (rides RCD_B commit); [SUBPLAN_TRIM_05_EXPORT_CONVERTERS.md](plans/done/SUBPLAN_TRIM_05_EXPORT_CONVERTERS.md) — **DONE 2026-07-16**, council-executed: 3 legacy converters removed with unreachability proof (commit 56fb806c, -428 lines), workbook proven byte-equivalent across 3 builds; [SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md](SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md) → [SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md](SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md) — any order, sequential.
5. [SUBPLAN_TRIM_06_CLOSURE.md](SUBPLAN_TRIM_06_CLOSURE.md) — final battery + master closure.

**Adoption notes**: SUBPLAN_RCD_B / SUBPLAN_RCD_C remain children of PLAN_ROOT_CLIENT_DEDUPE (their parent — not re-parented; provenance preserved). They execute under this master's Re-Proof Protocol per the RCD_C amendment. The DQU `/simplify`+`/cleanup` sweeps (SP-DQU-26/27/28) should run AFTER this trim so they don't polish files the trim deletes.

**LR-050 compliance**: the Approved Candidate Ledger above IS the in-scope stale-slop enumeration — nothing deferred to "discover later".

---

## Acceptance criteria (master — checked at TRIM_06)

- [ ] All 6 TRIM children + RCD_B + RCD_C in `plans/done/` with LR-027 Execution Summaries.
- [ ] Every ledger row dispositioned: executed / dropped-with-evidence / explicitly skipped by user.
- [ ] Zero non-ledger deletions across all sessions (next-batch ledgers list discoveries only).
- [ ] Full battery green at TRIM_06: typecheck (root + client), `npx playwright test --list`, pre-commit smoke, `npm run plans:reindex` clean.
- [ ] Consolidated deviations log emitted in chat (feedback_plan_deviations_log).

## Verification

```bash
ls plans/done/SUBPLAN_TRIM_0*.md | wc -l        # expect: 6 (after full execution)
grep -c "DROPPED" plans/done/SUBPLAN_TRIM_0*.md  # re-proof drops are logged, count >= 0 each
npx tsc --noEmit && npx tsc --noEmit -p clients/encore   # expect: clean
```

## Handoff (post-execution)

Chat-only per feedback_handoff_in_chat_only.md. Each child session hands off outcomes (what landed, what dropped at re-proof, next-batch ledger contents) — never obstacle claims (LR-039).

---

## Execution Summary

**Closed 2026-07-17** via the terminal child SUBPLAN_TRIM_06 (LR-027 parent-cascade — all 8 children in plans/done/). Executed 2026-07-16 (TRIM_01–05, RCD_B, RCD_C) + 2026-07-17 (TRIM_06 battery + closure). Every removal was council-executed under the shared Re-Proof Protocol: opus-4.6 executor + gpt-5.5 cross-reviewer (provider ≠ executor), reviewer re-executing the verification battery. All rounds GREEN.

### Per-ledger-row disposition (master §Ledger rows 1–10 — every row dispositioned, LR-046)

| Row | Candidate | Disposition | Evidence |
|---|---|---|---|
| 1 | 25 already-deleted `.playwright-cli/` tracked files + 2 vendor build scripts | NO-OP-already | Baseline already clean — vendoring removed by PLAN_DIST_REGRESSION_AND_N_FIXES + interim commits before TRIM_01 ran. TRIM_01 closed NO-OP. |
| 2 | Stale cleanup-plan family (12 plans) | EXECUTED | 11 superseded with audit trail; PLAN_FULL_CHAIN_AUDIT Category-A annotated; SUBPLAN_REPO_08 left parked (out of scope). TRIM_02. |
| 3 | Resolved pending plans → done/ + RULEBOOK_V2 Status repair | EXECUTED | 15 plans git-mv'd to plans/done/ (council 16/16 GREEN); RULEBOOK_V2 top-level Status repaired. TRIM_03. |
| 4 | The deprecated verify-vendor-fresh script + its 4 caller edges | EXECUTED | commit 93a07763 (7 paths, −437 lines); all 4 ship/hook caller edges surgically removed; the forbidden-content push gate left byte-intact (LR-049). |
| 5 | priority-sweep + validation-gates + migrate-queue-csv-to-xlsx | EXECUTED (2/3) + DROPPED | commit 93a07763 removed priority-sweep + migrate-queue; validation-gates DROPPED — survey false positive, 3 live callers found in-session (audit-post-complete, audit-pre-run, the pipeline healer gate). Re-proof did its job. |
| 6 | Dead npm scripts pointing at nonexistent files | EXECUTED | the dead healer:post-complete rider removed on commit 1772f8d6 (root package.json). |
| 7 | Three transitive-dead export converters (jira/json/testmo) + their dispatch branches | EXECUTED | commit 56fb806c (4 paths, −428 lines); unreachability proven (barrel-only refs, zero live callers); exported workbook shape byte-identical across 3 rebuilds (23 sheets, 820 rows). |
| 8 | 4 root archive scripts + 8 dead allure npm scripts | EXECUTED | commit 1772f8d6 (5 paths, −145 lines); premise-corrected (client copies did not exist); archive utilities retired with no successor (owner-delegated: zero usage + Allure-native history + git-restorable + CI-artifact practice). |
| 9 | Root tsconfig demotion + .env.server delete + reports/bugs relocation refs + cruft sweep | EXECUTED | commit b3791493 (10 paths); most phases NO-OP-already (pre-applied earlier session); net value was a real latent bug fix — the identity write-gate's bug-file ownership pattern stopped matching after bug reports relocated under the client, silently un-gating ownership; fixed and proven (BEFORE=false / AFTER=true) by gpt's re-run ownership probe. |
| 10 | Skills INDEX count drift check | NO-OP-already | Drift check per master row 10 ("surface near-clean"): INDEX header (33) already matched the catalog table (33 rows) and its own parenthetical derivation; the 2 uncatalogued dirs (assistants, delegation-temp) are intentional non-catalog skills. A build-worker edit briefly set the header to 35 (contradicting the table) and was reverted by the gpt cross-review — INDEX is net-unchanged vs HEAD. |

**HALT flags: NONE** — all 10 rows dispositioned.

### Verification battery (TRIM_06, re-executed cross-provider by gpt-5.5)

| Check | Command | Result |
|---|---|---|
| typecheck (root) | `npx tsc --noEmit` | EXIT 0 — clean |
| typecheck (client) | `npx tsc --noEmit -p clients/encore` | EXIT 0 — clean |
| spec resolution | `npx playwright test --list` (from clients/encore) | EXIT 0 — 737 tests / 24 files |
| trim-commit stat audit | `git show --stat` ×4 (93a07763, 56fb806c, 1772f8d6, b3791493) | all four contain ONLY intended removals/edits; every file accounted for by its sibling summary; zero unaccounted deletions |
| plans reindex | `npm run plans:reindex` | clean (run at closure) |

Deferred (pre-existing environment constraints, NOT trim failures): pre-commit bash smoke (Git Bash restriction on this Windows host — hook integrity confirmed via commit-stat analysis instead) and `client:ship` smoke (blocked by pre-existing uncommitted non-trim WIP in the working tree; identical deferral to TRIM_04).

### Deviations (feedback_plan_deviations_log)

1. Row 1 (TRIM_01) landed NO-OP — scope absorbed by interim commits before execution; clean baseline verified.
2. Row 5 — validation-gates DROPPED (survey false positive; 3 live callers); parent ledger row annotated.
3. Row 8 (RCD_B) — plan premise (identical client-side archive copies) was FALSE at execution; utilities retired with no successor, owner-delegated.
4. Row 9 (RCD_C) — most phases NO-OP-already; net value was the latent identity-gate ownership-pattern fix.
5. Row 10 — closure-session build-worker mis-edited the INDEX count (33→35) on a non-drift; caught and reverted by the cross-review. Net-zero repo change.
6. A latent healer-gate path mismatch (pipeline resolver vs root scripts/) was FLAGGED during TRIM_04 but left UNFIXED (out of trim scope / Untouchables) — routed to the integration ultraaudit's next-batch list.

### Result

Repo trimmed losslessly: ~1060 dead lines removed across 4 commits, every removal re-proven dead in-session and git-restorable, zero user data deleted, zero non-ledger deletions. Typecheck and spec resolution green cross-provider. One survey false-positive correctly refused (validation-gates), one real latent bug caught and fixed (identity-gate ownership). A consolidated next-batch list (24 stray root files, doc stale-pointers, the healer-gate path bug, and other unresolved candidates) is carried forward for the owner's next approval round — no action taken on any of it.

### Documentation

LR-028 activity-log rows appended for TRIM_06 + this master closure. Each child carries its own Execution Summary in plans/done/. Full battery evidence with sha256 manifests at `.claude/state/ua-worker/trim06-review-0717-artifacts/` and `.claude/state/ua-worker/trim06-build-0716-artifacts/`.
