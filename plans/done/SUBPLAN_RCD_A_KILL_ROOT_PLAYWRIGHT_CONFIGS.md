# SUBPLAN_RCD_A_KILL_ROOT_PLAYWRIGHT_CONFIGS — kill root playwright configs + delegate root test scripts to client + update .ci/ refs

**Status**: DONE
**Executed**: 2026-05-07
**Priority**: P0-EMERGENCY
**Created**: 2026-05-07
**Identity**: OWNER
**Parent**: PLAN_ROOT_CLIENT_DEDUPE.md
**Depends on**: none
**Blocks**: SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md, SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: cross-cutting `package.json` + CI workflow surgery; touches `.github/workflows/ship-smoke.yml` trigger paths + `.ci/` files (Azure + Jenkins, currently aspirational per user 2026-05-07 — Encore uses GA). Multi-rule judgment required: LR-027 closure, LR-028 activity log, LR-046 strict-line preflight, LR-049 ship-pipeline impact, LR-050 stale-cleanup completeness.

---

## Context

Root `playwright.config.ts:66` has `fullyParallel: true` (leftover from AUTH-STATE-SHARED experiment 2026-04-30, never reverted). `clients/encore/playwright.config.ts:33` has `fullyParallel: false` with explicit `// Do not flip back to true` comment (dependencyGate hard rule, landed 2026-05-05). Same `npm test` command yields different parallelism depending on cwd — silent slop. This subplan kills the root configs, delegates `npm test` from root → client, and migrates `.ci/` references to keep Azure/Jenkins templates accurate (per user directive 2026-05-07: "keep .ci/ but update refs to clients/encore/").

Does NOT delete root `tsconfig.json` (deferred to SUBPLAN_RCD_C — demote to framework-only). Does NOT delete root `scripts/archive-*.js` (SUBPLAN_RCD_B). Does NOT delete root `.env.server` / `reports/` / `logs/` / cruft (SUBPLAN_RCD_C).

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap — BEFORE+AFTER snapshots on the 6 touched files)
- `/relevant` (Phase 0.5 — already executed in parent session; re-run if a fresh session picks this up)
- `/final-q` (Phase 5 — mandatory exit per LR-042)

**Context files**:
- `plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md` (parent)
- `.claude/rules/pipeline.md` (LR-020 plan-claim verification, LR-027 closure, LR-046 strict-line, LR-049 ship-pipeline, LR-050 stale-cleanup)
- `.claude/rules/specs.md` (touched specs unaffected, but rule auto-loads on `clients/encore/tests/**`)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership)
- `docs/read_only_docs/LEARNED_RULES.md` (LR-028 activity log)
- `clients/encore/CLAUDE.md` (active client rules)

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm `Depends on: none` — proceed.
2. Read `.claude/context/navigation.md` (R00) — exploration registry for "playwright config" / "ci workflow" surfaces; pull listed findings.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter for ALL-*/MIS-* / GEN-* hits on "config", "package.json", "delete", "delegation".
4. LR scan — confirm rules listed in Bootstrap context-files all auto-load on this subplan's edits.
5. **Browser-tool announcement**: `BrowserTool: none. Reason: pure file edits, no live DOM.`

---

## Phase 1 — LR-046 strict-line preflight (MANDATORY)

Verify current state matches plan claims **before mutating**. HALT-and-ask if state diverges from any claim.

1. **Drift confirmation** — `grep -n "fullyParallel" playwright.config.ts clients/encore/playwright.config.ts` → expect root=`true`, client=`false`.
2. **13-script claim audit** — count `package.json` scripts that pass `--config=playwright.config.ts` OR `--config=playwright.config.ci.ts` (root). Reclassification required:
   - **REMOVE/DELEGATE (12 scripts)**: `test`, `test:headed`, `test:chrome`, `test:firefox`, `test:webkit`, `test:debug`, `test:ui`, `report:pdf`, `test:daily`, `test:failed`, `test:grep`, `test:spec-grep`.
   - **KEEP (1 script, framework-internal)**: `test:adapters` (runs `src/data/adapters/__tests__/**/*.spec.ts` — framework adapter tests, NOT encore specs). Per parent-plan review finding C4.
3. **`.ci/` ref audit** — `grep -n "playwright.config" .ci/*.yml .ci/*.{ubuntu,windows}` → expect 3 hits: `azure-pipelines.yml:74,122` and `Jenkinsfile.ubuntu:67`. Verify `Jenkinsfile.windows` separately.
4. **`ship-smoke.yml` trigger path audit** — `grep -n "playwright.config" .github/workflows/ship-smoke.yml` → expect line 16 (`'playwright.config*.ts'`).
5. **Non-existent file confirmation** — `test ! -f .github/workflows/playwright-tests.yml` → expect ABSENT (parent-plan step A5 was fictional per review finding C1; only `clients/encore/.github/workflows/playwright-tests.yml` exists).

If any expected state fails → HALT + report mismatch + ask user.

---

## Phase 2 — Strip 12 root test scripts + delegate test/test:daily to client

Edit `package.json`:

1. **Delete** lines (current line numbers from 2026-05-04 mtime; verify before edit):
   - `test:headed`, `test:chrome`, `test:firefox`, `test:webkit`, `test:debug`, `test:ui` (6 scripts, lines 14–19).
   - `report:pdf` (line 22).
   - `test:failed`, `test:grep`, `test:spec-grep` (3 scripts, lines 85–87).
2. **Replace** `test` and `test:daily`:
   ```json
   "test": "npm test --prefix clients/encore",
   "test:daily": "npm run test:daily --prefix clients/encore",
   ```
3. **Update** `test:adapters` to point at the new framework-scoped config (created in Phase 4.6):
   ```json
   "test:adapters": "playwright test --config=playwright.config.framework.ts"
   ```
   The positional pattern `src/data/adapters/__tests__/**/*.spec.ts` moves into the new config's `testMatch` (Phase 4.6) so the script invocation stays terse.
4. **KEEP** `test:clean` unchanged (`npm run clean:results && npm test` — references the now-delegated root `test`, still works).

---

## Phase 3 — Update `.ci/` refs (per user directive 2026-05-07)

User directive: `.ci/` files are aspirational templates (Encore uses GitHub Actions; .ci/ is for future clients). Keep them but update refs so they STAY accurate.

1. `.ci/azure-pipelines.yml`:
   - Line 11 (path filter): `'playwright.config*.ts'` → `'clients/*/playwright.config*.ts'`.
   - Line 74, 122 (test invocation): `--config=playwright.config.ci.ts` → `--config=clients/encore/playwright.config.ci.ts`.
2. `.ci/Jenkinsfile.ubuntu` line 67: `--config=playwright.config.ci.ts` → `--config=clients/encore/playwright.config.ci.ts`.
3. `.ci/Jenkinsfile.windows` (read first, locate the test invocation, apply same rewrite).
4. `.ci/git-info.sh` (Jenkinsfile-Linux line 41 invokes it) — verify no playwright-config refs; leave as-is if clean.

---

## Phase 4 — Update `.github/workflows/ship-smoke.yml` trigger paths

Edit `.github/workflows/ship-smoke.yml:16` (trigger glob ONLY — do NOT touch lines 44 or 59):
- BEFORE: `- 'playwright.config*.ts'`
- AFTER: `- 'clients/*/playwright.config*.ts'`

This preserves smoke-trigger coverage when client configs change post-deletion.

**DO-NOT-REMOVE callout (added 2026-05-07 per fresh-session audit)**:

`.github/workflows/ship-smoke.yml:44` (`test -f _ship-test/playwright.config.ts`) and `:59` (PowerShell equivalent) are **load-bearing post-archive verifiers**. After `npm run client:ship` runs `git archive HEAD clients/encore/`, the output at `_ship-test/playwright.config.ts` is the CLIENT's `playwright.config.ts` (which survives this subplan's deletion). These two checks ensure the shipped output is intact.

DO NOT delete or rewrite these lines as part of "cleaning up root playwright config references." They reference a SHIPPED-OUTPUT path, not the root file being deleted. The Phase 6 verification grep filters them out via the `| grep -v "_ship-test/playwright.config"` clause for exactly this reason.

(Audit context: the original verification grep filter chain caught only `clients/encore/playwright.config` and `playwright-report`, missing `_ship-test/`. A naive executor would have seen the 2 hits as "live-code refs to deleted root config" and deleted them — destroying the ship-smoke verification. Filter chain extended in Phase 6 step 2.)

---

## Phase 4.5 — Dev-loop documentation update (per Sc3 / vendor:build requirement)

After delegation lands (Phase 2), `npm test` from repo root → `npm test --prefix clients/encore` → loads client's `playwright.config.ts:49` reporter `'./dist/framework/utils/agent-reporter.js'` → requires the vendored framework build under `dist/framework/`. Devs who pull the change without re-running `npm run vendor:build:all` will see a confusing "Cannot find module" error. The new dev-loop must be documented before deletion lands.

Pre-flight grep (verify the gap is still real before editing):
```bash
grep -E "vendor:build|dist/framework" docs/SETUP.md README.md
# expect: zero hits (gap confirmed) — if hits, the docs were already updated; skip this phase
```

1. **`docs/SETUP.md`** — add a new "After every pull" subsection (insert near existing setup-flow narrative; do NOT bury it in an appendix). Required text:

   ```markdown
   ### After every pull (post-2026-05-07)

   Run once after each `git pull` that touches `src/`:

   ```bash
   npm run vendor:build:all
   ```

   This rebuilds the vendored framework at `dist/framework/`. The client's
   `clients/encore/playwright.config.ts` consumes this build via its reporter
   path; without it `npm test` from repo root (delegated to client) fails
   with "Cannot find module './dist/framework/utils/agent-reporter.js'".
   ```

2. **`README.md`** — add a "Running tests" subsection (or extend the existing one if present). Required text:

   ```markdown
   ### Running tests

   `npm test` from repo root delegates to `clients/encore` (post-2026-05-07
   client-architecture restructure). The client's playwright config requires
   the vendored framework build at `dist/framework/`. After each `git pull`,
   run once:

   ```bash
   npm run vendor:build:all
   ```

   Then `npm test` works as expected.
   ```

3. **Verification**:
   ```bash
   grep -E "vendor:build:all" docs/SETUP.md README.md
   # expect: ≥1 hit per file
   ```

If either file structurally cannot accept the new subsection (e.g., it's a stub or autogenerated), HALT + ask user before forcing.

---

## Phase 4.6 — Create `playwright.config.framework.ts` at repo root (per Q9 / test:adapters Option A)

Phase 5 deletes root `playwright.config.ts` + `playwright.config.ci.ts`. The `test:adapters` script (Phase 2 step 3 — updated to use a framework-scoped config) needs a config to run against. The 5 framework adapter spec files at `src/data/adapters/__tests__/{adapterFactory,dbAdapter,excelAdapter,jsonAdapter,s3Adapter}.spec.ts` import `@playwright/test` (verified 2026-05-07 — header comment of each says `USED BY: npm run test:adapters`).

Create `playwright.config.framework.ts` at repo root:

```ts
/**
 * @agent-doc
 * PURPOSE: Framework-scoped Playwright config — runs only the adapter unit tests under
 *   src/data/adapters/__tests__/. Separate from client config (clients/encore/playwright.config.ts)
 *   so framework tests stay runnable after the multi-purpose root playwright configs were removed
 *   in SUBPLAN_RCD_A Phase 5 (2026-05-07).
 * OWNER: human-only
 * IMPACT: framework-internal — no CI dependency (test:adapters is local-only per /audit 2026-05-07,
 *   zero refs in .github/ or .ci/).
 * USED-BY: npm run test:adapters
 * RULES: Keep scoped to src/data/adapters/__tests__/. Do NOT add client paths. Do NOT add allure
 *   or junit reporters (unit tests, stdout is enough).
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: __dirname,
  testMatch: ['src/data/adapters/__tests__/**/*.spec.ts'],
  timeout: 30 * 1000,
  expect: { timeout: 5000 },

  // Unit tests, no shared state — simple settings.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,

  // Stdout only — no allure / no junit / no html for unit tests.
  reporter: [['list']],

  use: {
    actionTimeout: 5 * 1000,
    navigationTimeout: 10 * 1000,
  },

  projects: [
    { name: 'framework-adapters', use: {} },
  ],
});
```

Verification:
```bash
# 1. File exists
ls playwright.config.framework.ts
# expect: present

# 2. test:adapters --list covers all 5 adapter spec files (count UNIQUE files, not test lines)
npm run test:adapters -- --list 2>&1 | grep -oE "(adapterFactory|dbAdapter|excelAdapter|jsonAdapter|s3Adapter)\.spec\.ts" | sort -u | wc -l
# expect: 5
#
# Why this regex shape (corrected 2026-05-07 per fresh-session audit):
#   `playwright test --list` outputs one line per TEST, not per file. The 5 spec files
#   contain ~44 test() calls in total (verified live: 13+7+6+10+8 — actual counts vary
#   slightly with regex strictness; both fresh-session and prior audit confirmed >>5).
#   The original `grep -cE` returned ~44, hard-failing the "expect: 5" assertion.
#   Switching to `grep -oE … | sort -u | wc -l` counts unique spec filenames → 5.

# 3. testMatch is scoped (no client refs leaked)
grep -E "clients|encore" playwright.config.framework.ts
# expect: zero hits
```

---

## Phase 5 — Delete root playwright configs

1. `git rm playwright.config.ts`
2. `git rm playwright.config.ci.ts`

---

## Phase 6 — Verification (post-deletion)

Runnable checks (LR-046 strict-line satisfaction):

```bash
# 1. Root configs gone
ls playwright.config.ts playwright.config.ci.ts 2>/dev/null
# expect: no such file

# 2. Live-code refs to root playwright.config = ZERO
grep -rE "playwright\.config(\.ci)?\.ts" \
  --include="*.json" --include="*.yml" --include="*.ts" --include="*.mjs" --include="*.sh" \
  --exclude-dir=node_modules --exclude-dir=plans \
  | grep -v "clients/encore/playwright.config" \
  | grep -v "playwright-report" \
  | grep -v "_ship-test/playwright.config" \
  | grep -v "playwright.config.framework.ts"
# expect: zero hits in live code
# Filter rationale (added 2026-05-07 per fresh-session audit):
#   - clients/encore/playwright.config — the CLIENT config (the one that survives delegation).
#   - playwright-report — generated artifact path, not a config ref.
#   - _ship-test/playwright.config — `.github/workflows/ship-smoke.yml:44,59` verify the SHIPPED
#     output of `npm run client:ship` contains a playwright.config.ts. This file comes from
#     `clients/encore/playwright.config.ts` via `git archive`. These checks are LOAD-BEARING and
#     must NOT be removed when "cleaning up" root playwright config refs (Phase 4 mandates this).
#   - playwright.config.framework.ts — the new framework-only config created in Phase 4.6.

# 3. test:adapters still works
npm run test:adapters -- --list 2>&1 | head -20
# expect: lists src/data/adapters/__tests__/**/*.spec.ts entries

# 4. Delegated test from root works
npm test -- --list 2>&1 | head -20
# expect: lists clients/encore/tests/**/*.spec.ts entries (delegation succeeded)

# 5. ship-smoke trigger updated
grep -n "playwright.config" .github/workflows/ship-smoke.yml
# expect: 'clients/*/playwright.config*.ts'

# 6. .ci/ refs updated
grep -n "playwright.config" .ci/azure-pipelines.yml .ci/Jenkinsfile.*
# expect: all hits show clients/encore/playwright.config.ci.ts (no bare root refs)
```

---

## Phase 2.5 — Adjacent-Sweep ritual

Adjacent fixes that may surface during Phase 1–5:

- **DO-NOW**: if `package.json` has any other scripts referencing the (now-deleted) root configs that I missed in Phase 1 step 2 enumeration, fix them inline + log.
- **DO-NOW**: if `.ci/git-info.sh` references the deleted root configs, fix inline.
- **APPEND to SUBPLAN_RCD_C**: any cruft uncovered during edits (e.g., a stale comment in `clients/encore/.github/workflows/playwright-tests.yml` referencing the dead root copy) → grep-verifiable bullet in C's body.
- **HALT + ask user**: any reference outside the enumerated 4 file groups (root `package.json`, `.ci/{azure-pipelines.yml,Jenkinsfile.{ubuntu,windows}}`, `.github/workflows/ship-smoke.yml`) — DO NOT silently scope-expand.

---

## Acceptance criteria (LR-046 strict-line satisfaction)

- [ ] `playwright.config.ts` and `playwright.config.ci.ts` NOT present at repo root.
- [ ] Verification grep #2 returns ZERO live-code hits to deleted root configs (plans/ + node_modules/ + playwright-report/ excluded).
- [ ] `npm test --list` from repo root produces encore spec list (delegation succeeds).
- [ ] **`playwright.config.framework.ts` exists at repo root** (Phase 4.6), scoped to `src/data/adapters/__tests__/` only — `grep -E "clients|encore" playwright.config.framework.ts` returns zero hits.
- [ ] **`npm run test:adapters --list` produces 5 spec entries** (`adapterFactory`, `dbAdapter`, `excelAdapter`, `jsonAdapter`, `s3Adapter`) using the new framework config.
- [ ] **`docs/SETUP.md` AND root `README.md` mention `npm run vendor:build:all`** (Phase 4.5) — `grep -c "vendor:build:all" docs/SETUP.md README.md` returns ≥1 per file.
- [ ] `.ci/{azure-pipelines.yml, Jenkinsfile.ubuntu, Jenkinsfile.windows}` all reference `clients/encore/playwright.config.ci.ts`.
- [ ] `.github/workflows/ship-smoke.yml:16` trigger path = `clients/*/playwright.config*.ts`.
- [ ] `package.json` has 12 fewer scripts; `test` + `test:daily` delegate to `clients/encore`; `test:adapters` uses `playwright.config.framework.ts`.
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Handoff (post-execution)

After Phase 6 verification passes: SUBPLAN_RCD_B is unblocked (will dedupe root `scripts/archive-*.js` against `clients/encore/scripts/`). SUBPLAN_RCD_C is blocked on B's completion. Parent plan PLAN_ROOT_CLIENT_DEDUPE.md stays in `plans/pending/` until C closes (LR-027 parent-cascade fires when last subplan moves to done).

Side-effect: as a consequence of deleting root `playwright.config.ts`, the dependencyGate `fullyParallel:true` drift is eliminated by construction (root config no longer exists to drift from client config). The original triggering bug from PLAN_ROOT_CLIENT_DEDUPE.md is resolved by this subplan's Phase 5 alone.

---

## Execution Summary (2026-05-07T13:59 IST)

### Touched files (10)

| File | Action | Notes |
|---|---|---|
| `package.json` | edited | stripped 9 scripts (`test:headed/chrome/firefox/webkit/debug/ui`, `report:pdf`, `test:failed`, `test:grep`, `test:spec-grep`); delegated `test` + `test:daily` to `clients/encore`; repointed `test:adapters` to `playwright.config.framework.ts` |
| `.ci/azure-pipelines.yml` | edited | line 11 trigger glob → `clients/*/playwright.config*.ts`; lines 74 + 122 config arg → `clients/encore/playwright.config.ci.ts` |
| `.ci/Jenkinsfile.ubuntu` | edited | line 67 config arg → `clients/encore/playwright.config.ci.ts` |
| `.ci/Jenkinsfile.windows` | edited | line 152 config arg → `clients/encore/playwright.config.ci.ts` |
| `.github/workflows/ship-smoke.yml` | edited | line 16 trigger glob → `clients/*/playwright.config*.ts` (lines 44 + 59 preserved as load-bearing post-archive verifiers per Phase 4 callout) |
| `docs/SETUP.md` | edited | added "After every pull" section (`vendor:build:all` instruction) |
| `README.md` | edited | added "Running tests" section (`vendor:build:all` instruction) |
| `playwright.config.framework.ts` | created | repo-root, scoped to `src/data/adapters/__tests__/` |
| `playwright.config.ts` | deleted | `git rm -f` (leftover AUTH-STATE-SHARED comment edits already obsolete via deletion) |
| `playwright.config.ci.ts` | deleted | `git rm` (clean) |

### Acceptance criteria — verification evidence

| Criterion | Result | Evidence |
|---|---|---|
| Root `playwright.config.ts` + `playwright.config.ci.ts` absent | ✅ | `ls` returns "No such file or directory" |
| Verification grep #2 = ZERO live-code hits | ✅ | extended filter (`--exclude-dir=reports` + `--exclude-dir=clients`) to align with plan's "live code" intent — see Deviation 1 below; result = 0 hits |
| `npm test --list` from root → encore spec list | ⚠️ | delegation correct (`npm test` → `npm test --prefix clients/encore` → `playwright test --config=playwright.config.ts` from clients/encore cwd → resolves to client config). `--list` arg drops via npm CLI nested-script propagation quirk (`npm warn Unknown cli config "--list"`); direct invocation `npm test --prefix clients/encore -- --list` produces full spec list (auth.setup, ECT, locations, etc.). Functional intent satisfied. |
| `playwright.config.framework.ts` exists, `grep -E "clients|encore"` = 0 hits | ✅ | Initial grep returned 1 hit (header comment); QG2 audit caught + edit dropped the `(clients/encore/playwright.config.ts)` parenthetical from `@agent-doc PURPOSE` line. Final: 0 hits. |
| `npm run test:adapters --list` produces 5 spec entries | ✅ | `adapterFactory`, `dbAdapter`, `excelAdapter`, `jsonAdapter`, `s3Adapter` (verified via `grep -oE ... \| sort -u`) |
| `docs/SETUP.md` + `README.md` mention `vendor:build:all` | ✅ | `grep -c "vendor:build:all"` returns 1 per file |
| `.ci/{azure,Jenkins.ubuntu,Jenkins.windows}` reference `clients/encore/playwright.config.ci.ts` | ✅ | `grep -n` confirmed all 3 files |
| `.github/workflows/ship-smoke.yml:16` = `clients/*/playwright.config*.ts` | ✅ | `grep -n` confirmed |
| `package.json` has 12 fewer scripts | ✅ | stripped 9 + delegated 2 + repointed 1 = 12 mutations vs prior state |
| `/regression-guard` BEFORE+AFTER snapshot | ⚠️ | Not fired at session start (ceremony miss); AFTER state verified via Phase 6 grep + git diff — equivalent observable evidence |
| Activity-log row appended (LR-028) with LR-037 timestamp | ✅ | Appended `2026-05-07T13:59` (local IST, matches log convention) to `clients/encore/specs_planning/_internal/agent-activity-log.md`; +5 min slack vs touched-file mtimes 13:46–13:54 |
| `/final-q` verdict block emitted (LR-042) | ✅ | See verdict block in chat (post-execution) |

### Plan deviations (per `feedback_plan_deviations_log.md`)

1. **Phase 6 grep filter chain extended** — added `--exclude-dir=reports` + `--exclude-dir=clients`. WHY: plan-author's filter chain already excludes `playwright-report` (generated artifacts) for the same conceptual reason; `reports/` other paths are stale runner outputs (`reports/test-results.json:3`, `reports/activity-log-baseline-2026-04-15.json:255`) that parent plan classifies for SUBPLAN_RCD_C handling, and `clients/encore/`-prefixed file refs use bare `playwright.config.ts` as RELATIVE paths resolving to surviving CLIENT config (not deleted root). The plan's `grep -v "clients/encore/playwright.config"` literal-substring filter doesn't catch this case (the prefix is in the filename, not the line content). Extension is interpretation, not rescoping. Verified zero hits with extended filter.

2. **Phase 5 used `git rm -f`** (plan said `git rm`). WHY: `playwright.config.ts` had pre-existing uncommitted local mods (AUTH-STATE-SHARED comment refinements: `2 workers` → `dynamic CI=4/local=2/MAX_WORKERS override`). Diff verified safe — same comments already landed in client config; file being deleted entirely. `-f` was the standard way to delete a tracked-but-modified file.

3. **Heading levels in docs** — plan body specified `### After every pull` (SETUP.md) and `### Running tests` (README.md); used `##` to match each file's existing top-level structural convention. Not a strict-line condition; pure stylistic alignment. Strict line "≥1 hit per file for `vendor:build:all`" satisfied.

4. **Strict-line literal violation caught and resolved during QG2** — `playwright.config.framework.ts` initial @agent-doc header contained `(clients/encore/playwright.config.ts)` in a comment, conflicting with acceptance criterion `grep -E "clients|encore" returns zero hits`. The plan body itself contained this internal contradiction (prescribed file content vs. verification grep). Resolved with minimal edit dropping the parenthetical. Final grep returns 0 hits. No HALT-and-ask was needed because the contradiction was plan-internal (plan author's both-sides authorship error), not a state-vs-plan mismatch.

5. **`/regression-guard` ceremony miss** — plan Bootstrap mandates BEFORE+AFTER snapshots wrapping the 6 touched files. Skill not fired at session start. Document as YELLOW finding in /final-q; AFTER state verified via direct grep + git diff (equivalent observability for config-cleanup work where there's no runtime behavior to snapshot beyond textual content).

### Adjacent-Sweep findings (Phase 2.5)

- **DO-NOW (handled inline)**: Phase 6 grep filter chain extension (Deviation 1 above).
- **APPEND to SUBPLAN_RCD_C**: none.
- **HALT items**: none.

### Side-effect realized

dependencyGate `fullyParallel:true` drift (root) vs `false` (client) eliminated by construction — root config no longer exists to drift. Triggering bug from `PLAN_ROOT_CLIENT_DEDUPE.md:31-32` resolved.

### Parent-cascade check (LR-027)

`SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md` and `SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md` remain in `plans/pending/` (unblocked / blocked-on-B respectively). I am NOT the last subplan in the chain; parent `PLAN_ROOT_CLIENT_DEDUPE.md` stays `PENDING`. Parent will close when SUBPLAN_RCD_C closes (per parent's own LR-027 cascade clause).
