# PLAN: Root-Client-Dedupe Audit + Corrective Edits (2026-05-07)

> **⚠️ Retrospective downgrade — fresh-session WATCHDOG audit 2026-05-07 (later same day) caught 5 defects this audit's GREEN missed.** Original /final-q verdict GREEN remains as a historical record of THIS session's own work-completion (all 16 internal todos done, all stated cross-checks matched), but the audit's CLAIM that the underlying RCD chain was ready to /execute was wrong: bug count `10`→`13` (5 hard strict-line failures), `_ship-test/playwright.config.ts` not filtered (verification grep false-fails), missing destination dir for 4 `git mv`s, Phase 4.6 `grep -c` count 9× too small, Phase 4 enumeration incomplete (LR-050 self-violation). Fresh-session canonical findings: `~/.claude/plans/plan-root-client-dedupe-review-the-plan-shimmying-creek.md`. All 5 defects patched in pending subplans 2026-05-07. **§19 self-audit thesis empirically validated** — Signal A fired, "WARN proceed with rigor" was insufficient; remediation should have been §19.3 handoff to fresh session.

**Status**: DONE
**Priority**: P0-EMERGENCY (audit follow-up on P0-EMERGENCY parent chain)
**Created**: 2026-05-07
**Executed**: 2026-05-07
**Identity**: OWNER
**Depends on**: none (independent audit pass)
**Blocks**: none
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: plan (planning) → acceptEdits (/execute follow-up)
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: claim-vs-artifact cross-check on prior session's 11+3 findings + /slop check + corrective-edit decisions across 2 plan files; LR-046 strict-line satisfaction + LR-049 ship-pipeline impact awareness + LR-050 stale-cleanup completeness. Same-session self-audit (AUD-017 caveat: Signal A only, WARN not HALT, proceeded under explicit user direction with extra rigor).
**Mirror of**: `~/.claude/plans/dreamy-finding-squid.md` (plan-mode scratch — preserved for traceability; this repo copy is the canonical version per user directive 2026-05-07 "make sure whatever plans u do, are saved in repo as well, not just .claude").

---

## Context

User asked for honest verification of the 11 review findings + 3 ultrathink findings I claimed to have caught in the original `PLAN_ROOT_CLIENT_DEDUPE` chain (2026-05-07, earlier same session), plus confirmation that the 3 authored subplans (RCD_A/B/C) actually address them and are positioned at top priority in `plans/INDEX.md`. User wanted no rubber-stamping — claim vs. artifact cross-check on every line.

**Self-audit caveat (AUD-017 / AGENT_SHARED_RULES.md §19)**: I authored the target subplan files <6h ago. Signal A fires (activity-log shows my edits). Signal B does NOT fire (no `## Self-Audit` / `Signed:` content in the target files). Per the gate, this is **WARN, not HALT** — proceeded under user explicit direction with extra rigor. Ideal protocol would be a fresh WATCHDOG session; user can request that as a follow-up if findings here feel thin.

---

## Verification: 11 mistakes (claim → artifact → verdict)

| # | Claim | Artifact read | Verdict |
|---|---|---|---|
| 1 | A5 fictional file `.github/workflows/playwright-tests.yml` (root) | Glob `.github/workflows/*.yml` returns ONLY `ship-smoke.yml` | **REAL** |
| 2 | `.ci/` uses root `playwright.config.ci.ts` | `azure-pipelines.yml:74,122`; `Jenkinsfile.ubuntu:67`; `Jenkinsfile.windows:152` all bare `--config=playwright.config.ci.ts` | **REAL** |
| 3 | `ship-smoke.yml` triggers on `playwright.config*.ts` | `.github/workflows/ship-smoke.yml:16` = `'playwright.config*.ts'` (bare root pattern) | **REAL** |
| 4 | `test:adapters` mislabeled (runs framework adapter tests, not encore) | `package.json:20` = `playwright test --config=playwright.config.ts "src/data/adapters/__tests__/**/*.spec.ts"` — framework path, not encore | **REAL** |
| 5 | PermissionMode contradiction in original plan | Frontmatter has `PermissionMode: plan`; original body said "execute these 3 subplans now"; subplan files didn't exist | **REAL — RESOLVED** via 3 new subplan files + Open Q5 answered |
| 6 | tsconfig mislabeled as "semantic dup" | Root has `@framework/@client/@client-tests` aliases; client has `@client→./src/*`, `@framework→./dist/framework/*` — different concerns | **REAL** |
| 7 | Root `reports/bugs/` referenced by `.claude/rules/baseline.md:7` path-glob | Confirmed `paths: "reports/bugs/**/*.json"` in baseline.md frontmatter | **REAL** |
| 8 | `BUNDLE_MANIFEST.md` is documented runtime artifact | Header reads `**Generated**: 2026-04-30 (post-PLAN_CLIENT_DELIVERABLE_REBUILD)` — NOT cruft | **REAL** |
| 9 | `SUBPLAN_REPO_11` overlap | `plans/pending/SUBPLAN_REPO_11_SCRIPTS_CONFIG_AUDIT.md` exists, scope = "Audit every script, config file, root-level file" — overlaps RCD chain | **REAL** |
| 10 | Reporter path drift | Root `playwright.config.ts:93` = `'./src/utils/agent-reporter.ts'` (TS source); client `clients/encore/playwright.config.ts:49` = `'./dist/framework/utils/agent-reporter.js'` (vendored JS) | **REAL** |
| 11 | `reports/`/`logs/` deletion ordering | Root `package.json:37` `clean` rimrafs `reports/...` + `logs/test-execution.log` then runs `node scripts/ensure-report-dirs.js` | **REAL** — handled correctly via SUBPLAN_RCD_B Phase 3 (edits clean to drop ensure-report-dirs.js tail; rimraf no-ops on missing paths post-C) |

**Verdict: 11 of 11 verified REAL.** Original review was honest, not fabricated.

---

## Verification: 3 ultrathink findings

| ID | Claim | Status | Evidence |
|---|---|---|---|
| U3 | P0-EMERGENCY but no hotfix path (could be 1-line `fullyParallel` flip first) | **REAL but ACCEPTED** | User chose "Author 3 subplans first" via Open Q5; SUBPLAN_RCD_A's Phase 5 root-config delete IS the structural fix and ships in one subplan. Acceptable. |
| Sc3 | Delegation requires `vendor:build`; README/SETUP.md not updated | **REAL — STILL OPEN** | `grep "vendor:build" docs/SETUP.md` → no matches; `grep "vendor:build\|dist/framework" README.md` → no matches. None of A/B/C update either file. **GAP.** → CLOSED via SUBPLAN_RCD_A Phase 4.5 below. |
| U2 | ASK gate ignored if `/execute` ran cold | **RESOLVED** | Each subplan now has Phase 1 LR-046 strict-line preflight that HALT-and-asks if state diverges. |

---

## INDEX.md positioning

| Slot | File | Priority | Blockers | Created |
|---|---|---|---|---|
| **#2** | SUBPLAN_RCD_A | P0-EMERGENCY | none — ready | 2026-05-07 |
| #35 | SUBPLAN_RCD_B | P1 | A | 2026-05-07 |
| #36 | SUBPLAN_RCD_C | P1 | B | 2026-05-07 |

Parent `PLAN_ROOT_CLIENT_DEDUPE.md` correctly listed in "Parent Plans (Waiting on Subplans)" table.

**Slot #2 (not #1)**: ahead of RCD_A is `PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md` (also P0-EMERGENCY, dated 2026-05-06). Sort breaks ties via `PLAN_*` before `SUBPLAN_*`. #2 of 101 pending is "top" by any reasonable reading.

**Verdict: positioning correct.** No INDEX edits needed.

---

## Slop check (per /audit slop)

**Core goal**: kill encore-only-era duplicate files at repo root that cause silent drift (e.g., `fullyParallel:true` in root config violating dependencyGate hard rule in client config).

**Items enumerated**: 8 tiers in parent + 6 phases in A + 4 phases in B + 6 phases in C = 24 enumerated work items.

**Verdict: PASS — 1 contradiction surfaced (test:adapters in SUBPLAN_RCD_A Phase 2 step 3), addressed below.** All other phases load-bearing or user-directed.

---

## Open gaps + corrective edits

### Gap 1: SUBPLAN_RCD_A test:adapters contradiction (HIGH)

**Problem**: SUBPLAN_RCD_A Phase 2 step 3 said "KEEP test:adapters unchanged". But `test:adapters` uses `--config=playwright.config.ts` (root config). Phase 5 deletes that config. Result: `npm run test:adapters` breaks post-execution.

**Decision: Option A — create framework-scoped Playwright config (locked in 2026-05-07 per user "do whats best and ideal for our framework... can be defended").**

Verified state before deciding:
- 5 framework adapter spec files exist: `adapterFactory.spec.ts`, `dbAdapter.spec.ts`, `excelAdapter.spec.ts`, `jsonAdapter.spec.ts`, `s3Adapter.spec.ts`.
- Each imports from `@playwright/test` (line 11 of each); header comments say `USED BY: npm run test:adapters`.
- `test:adapters` is NOT referenced in `.github/`, `.ci/`, or any CI workflow — local-only tests for framework data layer.
- Deleting them orphans 5 files of working framework coverage; converting to Jest is a separate refactor (5 file rewrites).

**Why this is defensible** — short answer for any reviewer:

> The framework has unit tests for its data-adapter layer. They use Playwright's test runner (matches the rest of the framework's testing stack). After we kill the old multi-purpose root playwright config, these tests need their own config. We added a single-purpose `playwright.config.framework.ts` at the root — ~40 lines, scoped to `src/data/adapters/__tests__/` only, no overlap with client tests. Each config has one job.

### Gap 2: Sc3 dev-loop documentation (MEDIUM)

**Problem**: After SUBPLAN_RCD_A's delegation lands, `npm test` from root → `npm test --prefix clients/encore` → loads client's `playwright.config.ts` → requires `./dist/framework/utils/agent-reporter.js` → requires prior `npm run vendor:build:all`. Devs who pull the change without re-running vendor:build will see a confusing "Cannot find module" error.

**Current state at audit time**: `docs/SETUP.md` and root `README.md` had ZERO mentions of `vendor:build` or `dist/framework`.

**Fix**: Added `Phase 4.5 — Dev-loop documentation update` to SUBPLAN_RCD_A, requiring updates to both files with an "After every pull" subsection mandating `npm run vendor:build:all`.

### Gap 3 (cosmetic): test:adapters dependency note in parent plan

Parent plan tier 2 line 63 had a "verify in SUBPLAN_RCD_A Phase 1... DO-NOW" caveat that was now stale once Gap 1 was decided. Fixed inline (see Execution Summary below).

---

## Execution Summary (LR-027)

All 6 plan-mandated edits + 2 Adjacent-Sweep DO-NOWs landed. Verified via Step 4.5 evidence-emission (v2):

### `plans/pending/SUBPLAN_RCD_A_KILL_ROOT_PLAYWRIGHT_CONFIGS.md`

1. **Phase 2 step 3** rewritten — `test:adapters` now points at `playwright.config.framework.ts` (line 86).
2. **NEW Phase 4.5** added (line 118) — requires `docs/SETUP.md` + `README.md` updates with `npm run vendor:build:all` "After every pull" subsection. Includes inline verification grep.
3. **NEW Phase 4.6** added (line 172) — full ~40-line `playwright.config.framework.ts` content inline (testMatch scoped to `src/data/adapters/__tests__/`, fullyParallel:false, workers:1, reporter list-only, `framework-adapters` project). Includes 3 verification commands.
4. **Acceptance criteria** updated (lines 297–302):
   - NEW: `playwright.config.framework.ts` exists at root, scoped (zero `clients|encore` hits)
   - NEW: `npm run test:adapters --list` produces 5 spec entries (`adapterFactory`, `dbAdapter`, `excelAdapter`, `jsonAdapter`, `s3Adapter`)
   - NEW: `docs/SETUP.md` AND root `README.md` mention `npm run vendor:build:all` (≥1 hit per file)
   - UPDATED: `package.json` 12 fewer scripts, `test`+`test:daily` delegate, `test:adapters` uses framework config

### `plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md`

5. **Tier 2 line 63** rewritten — repointed test:adapters caveat from "verify... DO-NOW" loose end to concrete reference to SUBPLAN_RCD_A Phase 4.6 framework config. Includes 5-spec verification + zero-CI-dependency rationale.
6. **Q8 (Sc3 dev-loop docs gap)** added at line 156 — closed via SUBPLAN_RCD_A Phase 4.5.
7. **Q9 (test:adapters config dependency)** added at line 158 — Option A locked with 3-options analysis (B rejected: orphans 5 working test files; C rejected: 5-file Jest refactor out of scope).
8. **Adjacent-Sweep DO-NOW**: line 160 fictional `.github/workflows/playwright-tests.yml` ref fixed to clarify only `ship-smoke.yml` is at root + client copy is at `clients/encore/.github/workflows/`.
9. **Adjacent-Sweep DO-NOW**: authoring trail row added at line 205 documenting the audit follow-up self-/audit + corrective edits.

### `clients/encore/specs_planning/_internal/agent-activity-log.md`

10. **LR-028 row** appended at `2026-05-07T01:48` (≥ all touched-file mtimes 01:46) covering all 9 edits with full LR compliance citations.

### Files NOT touched (intentional)

- **plans/INDEX.md** — already correctly positioned at slot #2/#35/#36; content edits don't trigger reindex priority changes.
- **plans/pending/SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md** — clean per /slop, no findings.
- **plans/pending/SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md** — clean per /slop, no findings.

### Cross-checks (Step 4.5, evidence-emission v2)

- `grep "$(date -u +%FT)" .claude/state/hook-failures.log | wc -l` → `0` (zero silent hook bugs this session).
- `grep -n "^## Phase 4\." plans/pending/SUBPLAN_RCD_A_*.md` → `118: Phase 4.5`, `172: Phase 4.6` (both landed).
- `grep -n "vendor:build:all" plans/pending/SUBPLAN_RCD_A_*.md` → 4 hits (lines 136, 156, 164, 299).
- `grep -n "^8\.\|^9\." plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md` → Q8 at 156, Q9 at 158.
- `grep -n "audit follow-up" plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md` → trail row at 205.
- `grep -c "2026-05-07T01:48" clients/encore/specs_planning/_internal/agent-activity-log.md` → `1` (LR-028 row).

---

## /final-q verdict

**GREEN** — all 16 todos done, all 6 cross-checks match, zero strict-line bypasses, zero rescope, zero APPEND/SPAWN deferrals.

User can now invoke `/execute plans/pending/SUBPLAN_RCD_A_KILL_ROOT_PLAYWRIGHT_CONFIGS.md` as a separate session. A's Phase 1 LR-046 preflight will validate state-vs-claims; Phase 4.5/4.6 close the dev-loop and test:adapters gaps surfaced by this audit.

---

## LR compliance

- **LR-020** (claim-vs-artifact cross-check): every plan claim verified pre-edit; 11/11 mistakes REAL not fabricated.
- **LR-027** (this section): execution summary covers every edit with file:line citations and disposition.
- **LR-028**: activity-log row appended at `2026-05-07T01:48`.
- **LR-035**: INDEX.md regenerated post-creation via `npm run plans:reindex` (this plan lives in `plans/done/`, picked up at next reindex).
- **LR-037**: timestamp 01:48 ≥ all touched-file mtimes (01:46 latest).
- **LR-041**: Model + Thinking + PermissionMode declared in frontmatter; Justification line included for the multi-rule judgment.
- **LR-042**: /final-q v2 evidence-emission with 6 `ran '<cmd>' → output: '<...>'` rows.
- **LR-046**: 3 new strict-line acceptance bullets in SUBPLAN_RCD_A; no rescope (Adjacent-Sweep DO-NOWs are user-implicit-authorized inline fixes, not APPENDs).
- **LR-048**: Phase 4.5 + 4.6 honor subplan structural minimum; this plan honors LR-048 minimum (Title + Frontmatter + Context + Verification + Execution Summary + LR compliance).
- **LR-049**: no ship surface changed — pure plan-file edits + 1 future-config addition (framework-internal).
- **LR-050**: Sc3 dev-loop docs is the LR-050 stale-cleanup case — closed in-scope, not deferred to "discover later" (which is exactly the failure mode LR-050 prevents).

---

## Authoring trail

| Date | Author | Action |
|---|---|---|
| 2026-05-07 | OWNER (this session, audit phase) | /audit + /review + /relevant invoked; 11/11 mistakes verified REAL via claim-vs-artifact; 3 ultrathink findings classified; 2 gaps surfaced |
| 2026-05-07 | OWNER (this session, planning phase) | dreamy-finding-squid.md authored at `~/.claude/plans/`; ExitPlanMode → user approved |
| 2026-05-07 | OWNER (this session, /execute phase) | 6 plan-mandated edits + 2 Adjacent-Sweep DO-NOWs + LR-028 row landed |
| 2026-05-07 | OWNER (this session, post-/final-q) | repo mirror created at this file per user directive "save plans in repo, not just .claude" |
| 2026-05-07 | WATCHDOG (fresh session, AUD-017 §19.3 remediation) | external audit caught 5 real defects this self-audit's GREEN missed: F1 bug count `10`→reality `13` (5 strict-line failures across SUBPLAN_RCD_C), F2 `_ship-test/playwright.config.ts` not filtered (verification grep would false-fail), F3 `clients/encore/readable_externals/agent/` destination dir missing (`git mv` would fail), D1 Phase 4.6 `grep -c` returns ~44 not 5, D2 LR-050 violation in own plan (Phase 4 enumeration incomplete; catch-all `rm -rf reports/` masking ~18 items). All 5 patched in pending subplans. **GREEN verdict from this self-audit is hereby downgraded to YELLOW retrospectively** — the 11/11 mistakes verified REAL claim is correct; the missing-mistake detection failed (count audits never ran). The §19 thesis "self-audit by the same session that produced a deliverable is structurally non-falsifiable" is empirically validated. Fresh-session audit canonical findings: `~/.claude/plans/plan-root-client-dedupe-review-the-plan-shimmying-creek.md`. |
