# SUBPLAN_RCD_C_ENV_REPORTS_CRUFT — demote root tsconfig to framework-only + relocate root reports/ to client + sweep env + cruft

**Status**: PENDING
**Priority**: P0
**Created**: 2026-05-07
**Identity**: OWNER
**Parent**: PLAN_ROOT_CLIENT_DEDUPE.md
**Depends on**: SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md
**Blocks**: none (last subplan in chain — closes parent on its DONE-flip per LR-027 parent-cascade)
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: max because Phase 4 (relocate `reports/bugs/` + update 57 cross-cutting refs incl. `.claude/rules/baseline.md:7` path-glob) is multi-rule judgment under LR-049 (ship-pipeline impact) AND LR-040 (closure-gate completeness on per-bug-file references) AND LR-046 (strict-line "zero refs" assertion). One missed reference = silent baseline-rule miss = audit RED.

---

## Context

After A (configs gone) and B (scripts/ deduped), root still has: (1) multi-tenant `tsconfig.json` (per user 2026-05-07: demote to framework-only), (2) `config/environments/.env.server` (frozen 2026-03-15, gitignored, zero refs in `pipeline/` / `src/`), (3) root `reports/` dual-store (per user 2026-05-07: "the whole root reports is just for encore, why is it even at root?" — implies "shouldn't be at root"), (4) root `logs/test-execution.log` (May 5 mtime, written by global-setup.ts), (5) 12 stray cruft files (sb*.yml, snap-save-test.yml, alert-state.png, li-*.json, cli-and-mcp-doc, grep.exe.stackdump). `BUNDLE_MANIFEST.md` is documented runtime artifact (post-PLAN_CLIENT_DELIVERABLE_REBUILD) — KEEP, NOT cruft.

Highest-risk step: relocating `reports/bugs/` (13 BUG-*.json files; verified live 2026-05-07). 57 files repo-wide reference `reports/bugs` and `.claude/rules/baseline.md:7` declares it as a path-glob (`paths: "reports/bugs/**/*.json"`). Move requires either (a) cross-cutting reference updates, or (b) keeping `reports/bugs/` at root as a structural exception. Phase 4 picks one explicitly, with user-visible impact callout.

> **Provenance amendment (2026-06-12, PLAN_LOSSLESS_DEEP_TRIM adoption)**: this subplan's counts and file inventories (13 BUG-*.json; 12 cruft files; ref counts) are STALE — a 2026-06-12 spot-check saw ~5 bug JSONs at root. Regenerate every count/list in-session from `git ls-files` / `git status` / fresh `rg` before acting; the executing session is bound by the master's Re-Proof Protocol and Untouchables list in `plans/pending/PLAN_LOSSLESS_DEEP_TRIM.md` (tracked = lossless delete; untracked = relocate-to-tmp or skip, NEVER silent-delete; `reports/**` user data = relocate-only).

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap)
- `/cleanup` (cruft sweep)
- `/final-q` (mandatory exit)

**Context files**:
- `plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md` (parent)
- `plans/pending/SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md` (predecessor — must be in `plans/done/`)
- `.claude/rules/pipeline.md` (LR-027, LR-028, LR-040, LR-046, LR-049, LR-050)
- `.claude/rules/baseline.md` (path-glob `reports/bugs/**/*.json` — must update if relocating)
- `.claude/rules/data.md` (path-scoped — auto-loads on env file edits)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`
- `docs/read_only_docs/LEARNED_RULES.md`
- `clients/encore/CLAUDE.md`

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm `SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md` in `plans/done/`.
2. Read `.claude/context/navigation.md`, `clients/encore/specs_planning/_internal/agent-mistakes.md`.
3. LR scan.
4. **Browser-tool announcement**: `BrowserTool: none. Reason: pure file edits + git mv operations.`

---

## Phase 1 — Demote root `tsconfig.json` to framework-only (per user choice 2026-05-07)

Edit `tsconfig.json`:

1. Remove `"@client/*": ["clients/encore/src/*"]` and `"@client-tests/*": ["clients/encore/tests/*"]` from `paths` (lines 28, 29 of current file).
2. Add `"@pipeline/*": ["pipeline/*"]` to `paths` (so root tsconfig covers framework + pipeline IDE/typecheck).
3. Update `include` array — keep `"**/*.ts"` but add `exclude: "clients/**"` (clients have their own `tsconfig.json` per LR-017).
4. Update the `@agent-doc` block at top of file: change "Path aliases (multi-tenant — see PLAN_MULTI_TENANT_RESTRUCTURE)" to reflect framework-only scope; reference SUBPLAN_RCD_C.
5. Verify `npm run typecheck` from root still succeeds (no client refs needed at root level).
6. Verify `cd clients/encore && npx tsc --noEmit` still succeeds (client tsconfig is independent).

---

## Phase 2 — Delete root `.env.server` (gitignored, zero refs)

1. Confirm zero refs in live code: `grep -rE "\\.env\\.server" --include="*.ts" --include="*.js" --include="*.mjs" --exclude-dir=node_modules --exclude-dir=plans` → expect zero hits in `pipeline/`, `src/`, `scripts/`. Documentation refs in `docs/SETUP.md:53` and `.claude/AGENT_SCHOOL.md:55` get updated next.
2. `rm config/environments/.env.server` (already gitignored at `.gitignore:49`, so no `git rm` needed).
3. Update `docs/SETUP.md:53` — remove `cp config/environments/.env.server.example config/environments/.env.server` line OR redirect to `clients/encore/config/environments/.env.local` per current SP-MT-03 layout.
4. Update `.claude/AGENT_SCHOOL.md:55` — remove or redirect.
5. Verify `config/environments/` directory is now empty: `ls config/environments/` → zero files. If empty, `rmdir config/environments`. If `config/` itself is empty, `rmdir config/`.

---

## Phase 3 — Move root `reports/bugs/` → `clients/encore/reports/bugs/` + update path-glob

`reports/bugs/**/*.json` is referenced in `.claude/rules/baseline.md:7` (auto-load path-glob). **13 BUG-*.json files at root** (verified live 2026-05-07 via `ls reports/bugs/ | wc -l` → 13): BUG-HIS-001/002, BUG-LI-001/002/003, BUG-LOC-BI-001, BUG-LOC-ECT-001, BUG-LOC-LOS-001, BUG-LOC-MGH-001, BUG-LOS-BAS-016, **BUG-LOS-ECT-001, BUG-LOS-ECT-010, BUG-LS-001** (last 3 added per fresh-session audit 2026-05-07 that caught the original 10-count miss).

1. **Move files**:
   ```bash
   git mv reports/bugs clients/encore/reports/bugs
   ```
2. **Update path-glob** in `.claude/rules/baseline.md:7`:
   - BEFORE: `paths: "reports/bugs/**/*.json"`
   - AFTER: `paths: "clients/*/reports/bugs/**/*.json"`
3. **Audit 57-file cross-reference** (per parent-plan review evidence) — distinguish the two categories:
   - **Plan-history references** (in `plans/done/SUBPLAN_HISTORY_*.md`, `plans/done/PLAN_BUG_*.md`, etc.): historical record of where files WERE — DO NOT rewrite (LR-027 historical-fact preservation).
   - **Live-code references** (in `.claude/skills/*/SKILL.md`, `.claude/rules/*.md`, `.claude/context/navigation.md`, scripts): MUST be rewritten to `clients/${ACTIVE_CLIENT}/reports/bugs/` form.
4. **Grep + rewrite live-code refs**:
   ```bash
   grep -rEln '(?<!plans/)reports/bugs' \
     .claude/ scripts/ docs/ src/ pipeline/ \
     --include="*.md" --include="*.ts" --include="*.mjs" --include="*.json" \
     | grep -v "plans/done"
   ```
   For each hit: rewrite to `clients/${ACTIVE_CLIENT}/reports/bugs/` (using template var when in skill prose; literal `clients/encore/reports/bugs/` in client-specific docs).
5. **Verify**: `grep -rEln '"reports/bugs"' .claude/rules/` → zero hits (path-glob is updated form, not bare).

---

## Phase 4 — Relocate other root `reports/` artifacts; delete root `reports/` + `logs/`

**Phase 4 step 0 — pre-flight destination dirs (MANDATORY, added 2026-05-07 per fresh-session audit)**:

`git mv` requires destination parent directories to exist. The fresh-session audit verified live state:
- `clients/encore/readable_externals/` exists with only `jbs/` subdir → **`agent/` does NOT exist**.
- `clients/encore/reports/` exists → `bugs/` will be created by Phase 3's `git mv`.
- `clients/encore/specs_planning/_internal/` exists.

Run before any `git mv` in this Phase:

```bash
mkdir -p clients/encore/readable_externals/agent/
# Verify: ls -d clients/encore/readable_externals/agent/  → present
```

Skipping this step = Phase 4 fails on the first `git mv reports/bundle-* clients/encore/readable_externals/agent/...` with "destination directory does not exist" (or, depending on git version, the first file is moved to a regular file named `agent` and subsequent moves are rejected — partial-state corruption).

Root `reports/` (post-Phase 3) still has:

| Artifact (root) | Destination | Reason |
|---|---|---|
| `reports/allure-report/`, `allure-results/`, `html-report/`, `test-results/`, `test-results.json`, `failure-summary.json`, `junit-results.xml`, `diagnostics/`, `dep-gate-state/`, `batch-suite.log`, `preflight-check.json` | DELETE | stale test outputs (last write 2026-04-30 or earlier; `clients/encore/reports/` has fresh May 5–6 versions) |
| `reports/pilot/`, `reports/regression-guard/`, `reports/testid-verification/` | DELETE | stale subdirs (verified 2026-05-07; SP-PWC2-07 pilot artifacts + SP-DQU-03 regression-guard snapshots + testid-coverage scratch — all superseded or transient) |
| `reports/sp-efd-01-verify-run1.log`, `reports/sp5-cur-run.log`, `sp5-full-run.log`, `sp5-li-run7.log`, `sp5-li-run8.log`, `sp5-pri-run.log`, `sp5-pri-run2.log` | DELETE | SP-EFD-01 + SP5 spec-run logs from completed subplans |
| `reports/sp6-rca-run1.log`, `sp6-rca-run2.log`, `sp6-rca-run3-postfix.log`, `sp6-rca-run4-postfix.log`, `sp6-full-suite-rca-findings.md` | DELETE | SP6 RCA-run logs + findings (subplan completed; findings live in `plans/done/` execution summary) |
| `reports/failure-summary.json.pre-bas-048`, `failure-summary.json.pre-mgh-verify`, `failure-summary.json.pre-nts-013` | DELETE | pre-fix backups of `failure-summary.json` (NOT matched by `*.json` glob due to `.pre-*` suffix; require explicit removal) |
| `reports/fieldinventory-staleness-baseline-2026-04-25.json`, `tc-mcp-citations-baseline-2026-04-25.json` | DELETE | LR-013 staleness-baseline snapshots from 2026-04-25 (regenerated each /audit cycle inside `clients/encore/reports/`) |
| `reports/activity-log-baseline-2026-04-15.json` | MOVE → `clients/encore/specs_planning/_internal/agent-activity-log-baseline-2026-04-15.json` | snapshot of client-side activity log; belongs with the live log |
| `reports/bundle-op-hardening-2026-04-21.md`, `bundle-smoke-2026-04-21.md`, `client-deliverable-ready-2026-04-21.md`, `client-handoff-validation-2026-04-21.md` | MOVE → `clients/encore/readable_externals/agent/<file>` (after Phase 4 step 0 mkdir) | client-deliverable-related execution evidence |
| `reports/cce-alignment/V0-V11-summary-2026-04-27.md` | MOVE → `clients/encore/specs_planning/_internal/cce-alignment-V0-V11-2026-04-27.md` | CCE alignment audit, client-internal |
| `reports/.gitkeep` (if present) | DELETE (root reports/ entirely going) | n/a |

**LR-050 self-citation (added 2026-05-07 per fresh-session audit)**: this enumeration is now exhaustive against `ls reports/` live state on 2026-05-07. The earlier draft relied on the catch-all `rm -rf reports/` to nuke whatever wasn't enumerated — exactly the LR-050 anti-pattern (defer-to-discover-later) this whole plan was supposed to model the FIX for. Per LR-050: "Deferring to 'follow-up subplan' / 'discover-later sweep' / 'TODO clean up someday' is FORBIDDEN. Plan author has perfect knowledge at authoring time of the prior layout." The previous draft enumerated 5 classes (Tier 5 in master plan) but left ~18 items to the catch-all; this revision enumerates them. The catch-all `rm -rf reports/` at the end is now belt-and-suspenders, not load-bearing.

After moves: `rm -rf reports/` at root. Then `rm -rf logs/` (test-execution.log is regenerated at next test run inside `clients/encore/logs/` post-SUBPLAN_RCD_A delegation).

---

## Phase 5 — Stray cruft sweep

For each of the 12 cruft files at root, grep first then delete (per parent-plan Open Question 3 user choice "Delete after grep verifies zero refs"):

```bash
for f in sb-basicinfo.yml sb2.yml sb3.yml sb4.yml sb5.yml sb6.yml snap-save-test.yml alert-state.png \
         li-cascade-probe-2026-04-28.json li-inventory-2026-04-28.json grep.exe.stackdump; do
  hits=$(grep -rln "${f}" --exclude-dir=node_modules --exclude-dir=plans 2>/dev/null | wc -l)
  echo "${f}: ${hits} live-ref hits"
  [ "${hits}" -eq 0 ] && rm -f "${f}"
done
# Special case: 'cli and mcp in our repo.md' — has spaces in filename
[ "$(grep -rln 'cli and mcp in our repo' --exclude-dir=node_modules --exclude-dir=plans 2>/dev/null | wc -l)" -eq 0 ] && \
  rm -f "cli and mcp in our repo.md"
```

If any file has nonzero hits → HALT + report + ask user (do NOT silently archive or move; user explicitly chose "delete after grep verifies zero refs", so nonzero means investigate).

`BUNDLE_MANIFEST.md` — KEEP at root. Per parent-plan review finding H3 (it's a documented post-PLAN_CLIENT_DELIVERABLE_REBUILD runtime artifact).

---

## Phase 6 — Verification

```bash
# 1. Root tsconfig demoted (no client/* aliases)
node -e "const p=require('./tsconfig.json').compilerOptions.paths; console.log('client alias:', '@client/*' in p ? 'PRESENT (FAIL)' : 'gone (ok)'); console.log('framework alias:', '@framework/*' in p ? 'present (ok)' : 'MISSING (FAIL)')"
# expect: client alias = "gone (ok)", framework alias = "present (ok)"

# 2. Typecheck still passes from root
npm run typecheck
# expect: zero errors

# 3. .env.server gone, config/environments/ empty (or removed)
ls config/environments/.env.server 2>/dev/null
# expect: no such file

# 4. reports/ + logs/ gone from root
ls reports/ logs/ 2>/dev/null
# expect: no such file or directory (2x)

# 5. clients/encore/reports/bugs/ has the 13 moved BUG files
ls clients/encore/reports/bugs/*.json | wc -l
# expect: 13

# 6. Path-glob in baseline.md updated
grep -n "reports/bugs" .claude/rules/baseline.md
# expect: line 7 shows clients/*/reports/bugs/

# 7. Live-code refs to bare reports/bugs (non-plans, non-clients) = zero
grep -rEln '(?<!plans/)(?<!clients/)reports/bugs' .claude/ scripts/ docs/ src/ pipeline/ \
  --include="*.md" --include="*.ts" --include="*.mjs" --include="*.json"
# expect: zero hits

# 8. Cruft files gone
ls sb-basicinfo.yml sb2.yml sb3.yml sb4.yml sb5.yml sb6.yml snap-save-test.yml alert-state.png \
   li-cascade-probe-2026-04-28.json li-inventory-2026-04-28.json grep.exe.stackdump 2>/dev/null
ls "cli and mcp in our repo.md" 2>/dev/null
# expect: no such file (12x)

# 9. BUNDLE_MANIFEST.md PRESERVED
ls BUNDLE_MANIFEST.md
# expect: present (KEEP)

# 10. Strict-line acceptance from parent plan body line 161
find . -maxdepth 1 -type f \( -name "*.yml" -o -name "*.png" -o -name "*.stackdump" \)
# expect: only docker-compose.yml, render.yaml (infra files)
```

---

## Phase 2.5 — Adjacent-Sweep ritual

- **DO-NOW**: any doc reference to old `reports/bugs/` paths uncovered in Phase 3 grep — fix inline.
- **DO-NOW**: any `.gitignore` entry that becomes redundant after the moves (e.g., root-level `reports/` ignore can be dropped if reports/ no longer exists at root) — clean inline.
- **APPEND to a future SUBPLAN_REPO_11 reconciliation**: anything outside this subplan's enumerated scope (`tsconfig`, `.env.server`, `reports/`, `logs/`, 12 cruft, BUNDLE_MANIFEST) that user might want addressed — bullet with grep verification.
- **HALT + ask user**: any stray-cruft grep returns nonzero hits (user explicitly chose "delete after grep verifies zero").

---

## Acceptance criteria (LR-046 strict-line satisfaction)

- [ ] Root `tsconfig.json` paths = framework + pipeline only (no `@client/*` aliases).
- [ ] `npm run typecheck` from root succeeds.
- [ ] `config/environments/.env.server` deleted; `config/environments/` empty or removed.
- [ ] `docs/SETUP.md` and `.claude/AGENT_SCHOOL.md` no longer reference root `.env.server`.
- [ ] Root `reports/` directory absent.
- [ ] Root `logs/` directory absent.
- [ ] `clients/encore/reports/bugs/` contains 13 BUG-*.json (Phase 3 move complete; count updated 2026-05-07 per fresh-session audit — original `10` was wrong).
- [ ] `.claude/rules/baseline.md:7` path-glob updated to `clients/*/reports/bugs/**/*.json`.
- [ ] Verification grep #7 (live-code bare `reports/bugs` refs) = ZERO.
- [ ] 12 stray cruft files at root deleted.
- [ ] `BUNDLE_MANIFEST.md` PRESERVED (NOT in cruft list).
- [ ] Verification #10 (parent-plan strict line) passes — root has only `docker-compose.yml` + `render.yaml` for these globs.
- [ ] `/regression-guard` snapshot diff = expected churn only.
- [ ] Activity-log row appended per LR-028.
- [ ] `/final-q` verdict block.
- [ ] **Parent-cascade**: per LR-027, after this subplan flips DONE, immediately close PLAN_ROOT_CLIENT_DEDUPE.md (Status DONE, Executed date, Execution Summary covering A+B+C, `git mv` parent to `plans/done/`, run `npm run plans:reindex`).

---

## Handoff

After Phase 6 verification: parent PLAN_ROOT_CLIENT_DEDUPE.md closes via parent-cascade (this is the last subplan in the chain). The triggering bug (`fullyParallel:true` drift from PLAN_CLIENT_DELIVERABLE_REBUILD) is structurally eliminated by SUBPLAN_RCD_A's deletion alone; B+C complete the broader stale-cleanup mandate of LR-050. Root after C: `src/`, `pipeline/`, `dist/` (framework build), `clients/`, `scripts/` (framework-internal only), `docs/`, `tsconfig.{json,build.json}` (demoted), `package.json` (delegated), `package-lock.json`, `docker-compose.yml`, `render.yaml`, `BUNDLE_MANIFEST.md`, `CLAUDE.md`, `.gitignore`, `.eslintrc.json`, `.prettierrc.json`, `.github/`, `.ci/`, `.claude/`, `start-dev.{bat,sh}`. No encore-specific surface at root.
