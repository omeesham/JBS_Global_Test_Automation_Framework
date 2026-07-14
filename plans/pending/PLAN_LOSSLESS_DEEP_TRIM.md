# PLAN_LOSSLESS_DEEP_TRIM — Repo-wide lossless deep trim (master tracker)

**Status**: PENDING
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
| 5 | `scripts/priority-sweep.mjs`, `scripts/validation-gates.ts`, `scripts/migrate-queue-csv-to-xlsx.mjs` | dead script deletion | no npm/hook/config caller found in survey; re-proof mandatory | TRIM_04 | Med |
| 6 | Dead npm scripts in root `package.json` pointing at nonexistent files (enumerated in-session) | npm script prune | survey indication; in-session enumeration | TRIM_04 | Low |
| 7 | `export_test_cases/to-jira.ts`, `to-json.ts`, `to-testmo.ts` + prune their `index.ts` dispatch branches; `markdown-parser.ts` KEEP (live via `to-csv.ts` → `to-xlsx.ts`) | transitive-dead converters | referenced ONLY by `export_test_cases/index.ts` (verified 2026-06-12); reachability analysis required | TRIM_05 | Med (deliverable-adjacent) |
| 8 | 4 root archive scripts + 8 dead allure npm scripts | root scripts dedupe | per SUBPLAN_RCD_B (adopted as-written) | RCD_B | Med |
| 9 | Root tsconfig demotion, `.env.server` delete, root `reports/bugs/` RELOCATION, root cruft sweep (counts regenerated in-session) | env/reports/cruft | per SUBPLAN_RCD_C (adopted + provenance amendment) | RCD_C | High (user data → relocate-only) |
| 10 | Minor docs/.claude residue: skills INDEX count drift check ("28 vs 29"); anything else only via next-batch ledgers | docs/config polish | survey verdict: surface near-clean | TRIM_06 | Low |

Anything NOT in this table is out of bounds for trim sessions (next-batch ledger only).

---

## Execution order (one interactive session each)

1. [SUBPLAN_TRIM_01_COMMIT_PENDING_DELETIONS.md](SUBPLAN_TRIM_01_COMMIT_PENDING_DELETIONS.md) — clean fingerprint baseline.
2. [SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md](SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md) — disposition before execution: exactly one plan governs each deletion category.
3. [SUBPLAN_TRIM_03_PLAN_CORPUS_HYGIENE.md](SUBPLAN_TRIM_03_PLAN_CORPUS_HYGIENE.md) — one move+reindex pass catches pre-existing resolved plans + TRIM_02 flips.
4. [SUBPLAN_TRIM_04_SCRIPTS_DEADWEIGHT.md](SUBPLAN_TRIM_04_SCRIPTS_DEADWEIGHT.md), [SUBPLAN_TRIM_05_EXPORT_CONVERTERS.md](SUBPLAN_TRIM_05_EXPORT_CONVERTERS.md), [SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md](SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md) → [SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md](SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md) — any order, sequential.
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
