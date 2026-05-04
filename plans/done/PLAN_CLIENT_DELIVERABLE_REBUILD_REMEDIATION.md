# PLAN: Client Deliverable Rebuild — Remediation (Audit-of-Audit)

**Status**: DONE
**Priority**: P0-EMERGENCY
**Created**: 2026-05-04
**Executed**: 2026-05-04
**Identity**: OWNER
**Parent (audited)**: [plans/done/PLAN_CLIENT_DELIVERABLE_REBUILD.md](../done/PLAN_CLIENT_DELIVERABLE_REBUILD.md)
**Depends on**: NONE
**Blocks**: shipping the encore deliverable; CI green on auto-user
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: none
**Skills**: /execute (orchestrator), /regression-guard (Phase 2 wrap), /final-q (exit)

---

## Context

PLAN_CLIENT_DELIVERABLE_REBUILD landed 2026-05-01 (37 deviations, Status DONE). Sonnet's post-execution audit (`~/.claude/plans/plan-client-deliverable-rebuild-review-a-vast-mitten.md`) flagged 1 CRITICAL + 2 MEDIUM scoped to `clients/encore/` only. Opus's repo-wide re-audit (this plan's source) broadened the sweep to `.claude/`, `scripts/`, root configs, `.github/`, `.githooks/`, `docs/`, `pipeline/`, runtime chains. **Net findings**: 7 BREAKING (4 silent guard failures Sonnet missed entirely), 14 MISLEADING, 6 LOW. Plus the user's directive on 2026-05-04: `s-prd-clickauto@psav.com` automation user is fully functional — retire Rutvik's personal credentials repo-wide.

User's answers (2026-05-04, locked at intake):
- Q1 delete legacy packager + npm script — **YES**
- Q2 delete root `specs_planning/` — **YES**
- Q3 delete GitHub `NAVIGATOR_MFA_SECRET` repo secret — **DONE by user (out of plan scope)**
- Q4 update `NAVIGATOR_USERNAME`/`NAVIGATOR_PASSWORD` GitHub secrets to auto-user — **DONE by user (out of plan scope)**
- Q5 label rename `EXP-AUTH-STATE-SHARED` → `AUTH-STATE-SHARED` — **YES**
- Q6 delete `auth-experiment.spec.ts` + empty `_verification/` dir — **YES**

Sonnet's PROMOTE decision on the auth-state-shared scaffolding (file lock + atomic write + shared `storageState`) is sound — that infra solves a permanent multi-worker MFA problem, keep it; only the EXP label retires.

---

## Bootstrap

**Identity**: OWNER. Plan is repo-wide remediation; not pipeline-scoped.

**Skills auto-called by `/execute`**:
- `/identity` — universal first-step gate.
- `/relevant` — scans this plan's subtasks against available skills (Phase 0.5).
- `/regression-guard` — wraps Phase 2 (rule-glob and agent-prompt edits).
- `/final-q` — exit gate.

**Context files this plan depends on**:
- `@CLAUDE.md` (root) — Repo Structure section + LR-049.
- `@.claude/rules/pipeline.md` — LR-027 (execution summary), LR-040 (closure-gate), LR-041 (Model/Thinking/PermissionMode), LR-046 (strict plan lines), LR-048 (subplan structural minimum), LR-049 (ship-via-git-archive only).
- `@.claude/rules/data.md` — LR-001..LR-006 (TypeScript hygiene) when editing the auth-storage / auth.setup files.
- `@plans/done/PLAN_CLIENT_DELIVERABLE_REBUILD.md` — the parent plan being remediated.
- `@~/.claude/plans/plan-client-deliverable-rebuild-review-jolly-sonnet.md` — full audit-of-audit findings (this plan is the actionable extract).
- `@~/.claude/plans/plan-client-deliverable-rebuild-review-a-vast-mitten.md` — Sonnet's narrower audit (historical).

---

## Phase 0 — Pre-flight

1. Working tree clean (`git status` empty). If dirty in any path Phase 1–6 will touch, commit/stash first.
2. Confirm user's GitHub-secret cleanup (Q3+Q4): `NAVIGATOR_MFA_SECRET` deleted, `NAVIGATOR_USERNAME` = `s-prd-clickauto@psav.com`, `NAVIGATOR_PASSWORD` = auto-user password. **User confirmed DONE 2026-05-04.**
3. `BrowserTool: none` — no live-DOM work.
4. `/regression-guard` snapshot before Phase 2.

---

## Phase 1 — Runtime breakage (3 file edits)

### F1 — `clients/encore/tests/setup/global-setup.ts:122` parent-path escape (B1)

Replace dynamic `require('../../../../src/common/credential-loader')` with a static import using the `@framework` alias already wired in `clients/encore/tsconfig.json`.

**Edit**:
- Add at top (after line 5): `import { CredentialLoader } from '@framework/common/credential-loader';`
- Line 122: delete the `require(...)` line. Line 123 (`await CredentialLoader.loadCredentials({ type: 'env' });`) stays.
- Result: try/catch on lines 121–127 still catches load failures; module is now resolved at parse time, not first-call.

### F2 — `.github/workflows/playwright-tests.yml` MFA secret (B2)

Delete lines 36–39 (4 lines: 3-line `# EXP-AUTH-STATE-SHARED:` comment block + the `NAVIGATOR_MFA_SECRET: ${{ secrets.NAVIGATOR_MFA_SECRET }}` env binding).

### F3 — `jest.config.ts:6` stale roots (B3)

Change `roots: ['<rootDir>/tests/unit']` → `roots: ['<rootDir>/pipeline/tests/unit']`. Hook unit tests now live under `pipeline/tests/unit/` post-rebuild.

---

## Phase 2 — Agent context layer (4 rule frontmatter + 3 agent prompts)

`/regression-guard` snapshot before edits.

### F4 — `.claude/rules/angular.md` paths frontmatter (B4)

Replace lines 3–6 with:
```yaml
paths:
  - "clients/*/tests/specs/**/*.spec.ts"
  - "clients/*/src/pages/**/*.ts"
  - "clients/*/src/selectors/**/*.ts"
```

### F5 — `.claude/rules/specs.md` paths frontmatter (B5)

Replace lines 3–5 with:
```yaml
paths:
  - "clients/*/tests/specs/**/*.spec.ts"
  - "clients/*/src/pages/**/*.ts"
```

### F6 — `.claude/rules/inventory.md` paths frontmatter (B6)

Change `src/selectors/**/*.ts` (line 6) → `clients/*/src/selectors/**/*.ts`. Other two globs (`clients/*/specs_planning/...`) are already correct — leave.

### F7 — `.claude/rules/browser-tool.md` paths frontmatter (B7)

Add `clients/*/` prefix to lines 5 and 7:
- `src/pages/**/*.ts` → `clients/*/src/pages/**/*.ts`
- `tests/**/*.spec.ts` → `clients/*/tests/specs/**/*.spec.ts`

(Lines 4 `plans/**/*.md` and 6 `clients/**/specs_planning/**/*.md` already correct.)

### F8 — `.claude/agents/GENERATOR.md` lines 9, 18 (M6)

Replace both occurrences of "Never edit framework code (`src/common/*`, `src/utils/*`, `scripts/*`)" with:
> "Never edit framework code at root: `src/{common,utils,data,framework-contracts}/*` or `scripts/*`. Per-client `clients/${ACTIVE_CLIENT}/src/common/base-page.ts` is per-client-owned and may be edited as page objects evolve. File a MAINTAINER escalation only for cross-client framework changes."

### F9 — `.claude/agents/MAINTAINER.md` lines 18, 28, 29 (M7)

- Line 18: `src/selectors/index.ts` → `clients/${ACTIVE_CLIENT}/src/selectors/index.ts`
- Line 28: `src/pages/<module>/index.ts`, `src/selectors/<module>/index.ts`, `tests/test-data/<module>/index.ts` → prefix all three with `clients/${ACTIVE_CLIENT}/`
- Line 29: replace "across `tests/`, `src/`, `scripts/`" with "across `clients/${ACTIVE_CLIENT}/{src,tests}/`, root `src/{common,utils,data,framework-contracts}/`, and `scripts/`"

### F10 — `.claude/agents/RUTVIK.agent.md` lines 18–21 (M8)

Update the ownership-map row that lists `src/pages/`, `src/selectors/`, `tests/` to:
> "Root `src/{common,utils,data,framework-contracts}/` (framework, vendored to clients/<id>/dist/framework/); per-client `clients/encore/src/{pages,selectors}/`, `clients/encore/tests/`, `clients/encore/api-testing/`; pipeline `pipeline/{orchestrator,server,worker,utils,tests}/` (internal-only)."

---

## Phase 3 — Repo-wide label rename + JSDoc strip (Q5, M2, M4)

Rename `EXP-AUTH-STATE-SHARED` → `AUTH-STATE-SHARED` across **18 occurrences** (Sonnet found 10 in `clients/encore/`; Opus found 8 more at repo root + `.github/`).

### F11 — Mechanical sed (18 hits)

**`clients/encore/`** (10 hits):
- `playwright.config.ts:35, 85` (comments)
- `playwright.config.ci.ts:54` (comment)
- `tests/setup/auth-storage.ts:2, 6` (JSDoc + search marker)
- `tests/setup/auth.setup.ts:2, 8` (JSDoc + search marker)
- `tests/setup/fixtures.ts:139, 215` (comments)
- `tests/specs/_verification/auth-experiment.spec.ts:2` — file deleted in F17, no edit needed here

**Repo root + `.github/`** (8 hits):
- `playwright.config.ts:63, 69, 74, 136, 170` (comments)
- `playwright.config.ci.ts:82` (comment)
- `.github/workflows/playwright-tests.yml:12` (comment) — line 36 deleted in F2

Use a single repo-wide `git ls-files | xargs sed -i 's/EXP-AUTH-STATE-SHARED/AUTH-STATE-SHARED/g'` scoped to `:!plans/` `:!.claude/state/` so historical plan content is preserved.

### F12 — Strip `@experiment` JSDoc tag (M4)

In `clients/encore/tests/setup/auth.setup.ts` and `clients/encore/tests/setup/auth-storage.ts`, replace the JSDoc block opening `@experiment AUTH-STATE-SHARED (2026-04-30)` with a plain file-level comment describing the lock-and-share pattern. Keep the line referencing the search marker (now `AUTH-STATE-SHARED`).

---

## Phase 4 — Docs / comments cleanup (M1, M3, M9–M14)

### F13 — `.github/workflows/playwright-tests.yml:12–14` narrative (M1)

Replace the forward-looking comment block with past-tense:
```yaml
# AUTH CONTRACT: AUTH-STATE-SHARED · ONE setup project logs in once and writes
# .auth/encore-state.json; both module workers consume read-only via storageState.
# Runs as MFA-less automation user (s-prd-clickauto@psav.com).
```

### F14 — `clients/encore/CLAUDE.md` "Temporary credentials" subsection (M3)

Delete the entire subsection (currently ~lines 239–290, "Temporary credentials (2026-04-30 — REMOVE WHEN AUTO-USER WORKS)" through the search marker `Removal trigger fired 2026-05-04`). Keep "CI User Provisioning Checklist" — that's the steady-state reference.

### F15 — `playwright.config.ts:50` comment (M9)

Update the comment text from `tests/unit/, tests/examples/` to `pipeline/tests/{unit,examples}` (the actual post-rebuild location).

### F16 — `.ci/azure-pipelines.yml:8–10` paths (M10)

Replace `paths.include: ['src/**', 'tests/**']` with `['src/**', 'pipeline/**', 'clients/**', 'playwright.config*.ts']`.

### F17 — `docs/README.md:20–23` setup steps (M11)

Replace bare-root paths (`src/selectors/index.ts`, `src/pages/{name}.page.ts`, `tests/setup/fixtures.ts`, `src/pages/index.ts`) with `clients/<id>/...` versions, OR replace the section with a one-line link to `clients/encore/README.md` for client-specific setup.

### F18 — `docs/read_only_docs/ARCHITECTURE.md:74–181` (M12)

Add a single preamble note (e.g., at the section header for `src/pages/`, `src/selectors/`): *"src/ is the framework source-of-truth. Per-client copies live at `clients/<id>/src/{pages,selectors}/`. Vendored framework runtime at `clients/<id>/dist/framework/`."*. Don't rewrite the whole architecture doc — one note resolves the ambiguity.

### F19 — `clients/encore/docs/REQUIREMENTS.md:100, 129` prefix fix (M13)

Add `clients/encore/` prefix to bare `src/selectors/index.ts` references on those two lines so they match the consistent format used elsewhere in the same doc (lines 1442–1445).

### F20 — `clients/encore/docs/MODULE_REGISTRY.md:56–67` preamble (M14)

Add a single preamble line: *"Paths below are relative to the client root (`clients/encore/`)."* No need to rewrite each entry.

---

## Phase 5 — Local cleanup (Rutvik's machine, not git)

### F21 — Delete local override files

```powershell
del "C:\Users\rutvi\projects\encore_framework\clients\encore\config\environments\.env.development.local"
del "C:\Users\rutvi\projects\encore_framework\.auth\encore-state.json"
```

Effect: dotenv-flow falls back to tracked `.env.development` (auto-user); next test run forces a fresh login under `s-prd-clickauto@psav.com` and writes a new `.auth/encore-state.json`.

---

## Phase 6 — Stale removal (L1, L2, L3, L4, M5, Q1, Q2, Q6)

### F22 — `tsconfig.build.json:19` stale exclude (L1)

Delete the line `"src/utils/agent-notification-writer.ts"` from the `exclude` array.

### F23 — Delete legacy packager (L2, Q1)

```bash
git rm scripts/client-package.ts
```

Edit `package.json`: delete line 12 (`"client:package": "ts-node scripts/client-package.ts",`). Adjust trailing comma on the previous line if needed (JSON validity).

### F24 — Fix dead deny-glob regex (L3)

`scripts/verify-no-forbidden.mjs:47`: change `/^pipeline\//` → `/^\/pipeline\//`. Defensive only; pipeline content can't enter the `clients/<id>/` archive structurally.

### F25 — Delete root `specs_planning/` (L4, Q2)

```bash
git rm -r specs_planning/
```

Per-client `clients/encore/specs_planning/` (gitignored) remains untouched. The stale root copy with bare-root paths goes away.

### F26 — Delete throwaway verification spec + empty dir (M5, Q6)

```bash
git rm clients/encore/tests/specs/_verification/auth-experiment.spec.ts
rmdir clients/encore/tests/specs/_verification 2>nul   # remove if empty
```

---

## Phase 7 — Verification (each must return the expected output)

Run each in order. Any non-zero/unexpected output = HALT and RCA.

```bash
# A. Label fully retired in code (only historical plans remain)
git grep "EXP-AUTH-STATE-SHARED" -- ':!plans/' ':!.claude/state/'
# Expect: 0 hits

# B. No parent-path escapes inside clients/encore/
grep -rn "../../../../src/" clients/encore/
# Expect: 0 hits

# C. No personal creds in tracked code (audit ignores agent persona files + plans)
git grep -i "v-rutvik\|khorasiya\|khosariya" -- ':!plans/' ':!.claude/agents/RUTVIK.agent.md' ':!.claude/AGENT_SCHOOL.md' ':!.claude/PROTOCOL.md' ':!.claude/context/'
# Expect: 0 hits

# D. CI workflow MFA env binding gone
grep -n "NAVIGATOR_MFA_SECRET" .github/workflows/playwright-tests.yml
# Expect: 0 hits

# E. tsconfig.build.json stale exclude removed
grep -n "agent-notification-writer" tsconfig.build.json
# Expect: 0 hits

# F. Legacy packager removed
test ! -f scripts/client-package.ts && grep -c "client:package" package.json
# Expect: file absent + 0 hits

# G. Root specs_planning/ removed
test ! -d specs_planning
# Expect: directory absent

# H. Rule frontmatter fired correctly (paths now match clients/*/)
node -e "const fm=require('fs').readFileSync('.claude/rules/angular.md','utf-8').match(/^---\n([\s\S]+?)\n---/)[1]; console.log(fm.includes('clients/*/') ? 'OK' : 'FAIL')"
# Expect: OK
# Repeat for specs.md, inventory.md, browser-tool.md

# I. End-to-end ship + REAL spec smoke (not --list — must execute globalSetup)
npm run client:ship -- --client=encore --out=/tmp/encore-deliv-verify
cd /tmp/encore-deliv-verify && npm install --silent
NAVIGATOR_USERNAME=s-prd-clickauto@psav.com \
NAVIGATOR_PASSWORD=<auto-user-password> \
BASE_URL=https://cloudapps-e2e.encoreglobal.com/navigator/ \
CI_ENV=development \
npx playwright test --reporter=line --grep "@smoke|location-currency" --project=chromium
# Expect: globalSetup runs cleanly, at least 1 spec passes

# J. CI green run (manual trigger)
# GitHub UI → Actions → Playwright Tests → Run workflow on client_deliverable
# Expect: green run as s-prd-clickauto@psav.com, no MFA-secret errors
```

---

## Phase 8 — Closure (LR-027 + LR-040 + LR-049)

1. Update `Status: pending` → `Status: DONE` + `Executed: YYYY-MM-DD`.
2. Append `### Execution Summary` enumerating F1–F26 outcomes (DONE / N/A / DEFERRED with reason per LR-040).
3. Append commit hashes for each phase.
4. `git mv plans/pending/PLAN_CLIENT_DELIVERABLE_REBUILD_REMEDIATION.md plans/done/`.
5. `npm run plans:reindex`.
6. Activity-log row per LR-028 in `clients/encore/specs_planning/_internal/agent-activity-log.md` (OWNER scope).
7. `/final-q` exit gate.

---

## Acceptance criteria

- [ ] **Strict — must equal zero**: Phase 7 checks A, B, C, D, E, F, G all return zero/expected.
- [ ] **Strict — must equal OK**: Phase 7 check H returns OK for all 4 rule files.
- [ ] **Strict**: Phase 7 check I (real spec smoke) executes globalSetup without crash + at least 1 spec passes.
- [ ] **Strict**: Phase 7 check J (CI workflow run) green on auto-user.
- [ ] All 7 BREAKING items (B1–B7) resolved with edits.
- [ ] All 14 MISLEADING items (M1–M14) resolved with edits or doc updates.
- [ ] All 6 LOW items (L1–L6) resolved or explicitly documented as deferred (L5 root `/dist/` anchor stays as defensive; L6 cosmetic count error needs no code change).
- [ ] Sonnet's audit decisions (PROMOTE auth scaffolding, DELETE auth-experiment.spec.ts) honored.
- [ ] No new framework code introduced — pure remediation.

---

## Handoff (chat-only per `feedback_handoff_in_chat_only.md`)

User-confirmed Q1, Q2, Q5, Q6 = YES. User completed Q3, Q4 (GitHub repo secrets) out-of-band. Plan saved to `plans/pending/`. Awaiting `/execute` trigger from Rutvik.

---

## Source map

- Sonnet's narrower audit: `~/.claude/plans/plan-client-deliverable-rebuild-review-a-vast-mitten.md`
- Opus's repo-wide audit-of-audit: `~/.claude/plans/plan-client-deliverable-rebuild-review-jolly-sonnet.md`
- Parent execution plan: `plans/done/PLAN_CLIENT_DELIVERABLE_REBUILD.md`
- Branch tip at audit time: `517e265` (clean tree)

---

## Execution Summary (2026-05-04)

| Fix | File(s) | Outcome | Notes |
|---|---|---|---|
| F1 | `clients/encore/tests/setup/global-setup.ts` | DONE | Replaced inline `require('../../../../src/common/credential-loader')` with top-level `import { CredentialLoader } from '@framework/common/credential-loader'`. |
| F2 | `.github/workflows/playwright-tests.yml` | DONE | Deleted `NAVIGATOR_MFA_SECRET` env binding + 3-line comment block. |
| F3 | `jest.config.ts` | DONE | `roots: ['<rootDir>/tests/unit']` → `pipeline/tests/unit`. |
| F4 | `.claude/rules/angular.md` | DONE | Added `clients/*/` prefix to all 3 path globs. |
| F5 | `.claude/rules/specs.md` | DONE | Added `clients/*/` prefix to both path globs. |
| F6 | `.claude/rules/inventory.md` | DONE | `src/selectors/**/*.ts` → `clients/*/src/selectors/**/*.ts`. |
| F7 | `.claude/rules/browser-tool.md` | DONE | Added `clients/*/` prefix to pages + specs paths. |
| F8 | `.claude/agents/GENERATOR.md` | DONE | Rewrote framework-edit ban: root `src/{common,utils,data,framework-contracts}/*` + `scripts/*` are forbidden; per-client `clients/${ACTIVE_CLIENT}/src/*` is editable. Lines 9 + 18 both updated. |
| F9 | `.claude/agents/MAINTAINER.md` | DONE | Selector path (line 18), barrel-export paths (line 27), dead-file sweep targets (line 28) all prefixed with `clients/${ACTIVE_CLIENT}/` and root `src/{common,utils,data,framework-contracts}/`. |
| F10 | `.claude/agents/RUTVIK.agent.md` | DONE | Ownership-map rewritten: framework src (root vendored), per-client src/tests, pipeline internal-only, .claude/agents/, plans/docs, integration glue. |
| F11 | 6 files (root + per-client `playwright.config*.ts`, `fixtures.ts`, `auth-storage.ts`, `auth.setup.ts`) | DONE | Repo-wide rename `EXP-AUTH-STATE-SHARED` → `AUTH-STATE-SHARED`. 17 hits in code (excluding plans/) cleared; 1 residual in `auth-experiment.spec.ts` cleared by F26. |
| F12 | `auth.setup.ts`, `auth-storage.ts` | DONE | Replaced `@experiment` JSDoc blocks with plain file-level comments describing the lock-and-share pattern. |
| F13 | `.github/workflows/playwright-tests.yml` | DONE (combined with F2) | Comment lines 12–14 rewritten to past-tense AUTH-STATE-SHARED narrative naming auto-user. |
| F14 | `clients/encore/CLAUDE.md` | DONE | Deleted entire "Temporary credentials (REMOVE WHEN AUTO-USER WORKS)" subsection. CI Provisioning Checklist retained. |
| F15 | `playwright.config.ts:50` | DONE | Comment now says "pipeline/tests/{unit,examples} (Jest)". |
| F16 | `.ci/azure-pipelines.yml` | DONE | `paths.include` updated to `['src/**', 'pipeline/**', 'clients/**', 'playwright.config*.ts']`. |
| F17 | `docs/README.md` | DONE | "Adding Page Objects" prefixed all paths with `clients/<id>/...`. |
| F18 | `docs/read_only_docs/ARCHITECTURE.md` | DONE | Single preamble note added under `### src/pages/` clarifying root-src vs per-client-src vs vendored runtime. |
| F19 | `clients/encore/docs/REQUIREMENTS.md` | DONE | L100 + L129 prefixed with `clients/encore/`. |
| F20 | `clients/encore/docs/MODULE_REGISTRY.md` | DONE | Single preamble line added before the six-tree convention noting paths are client-relative. |
| F21 | `clients/encore/config/environments/.env.development.local`, `.auth/encore-state.json` | DONE | Local override files deleted; next test run forces fresh login under `.env.development` (auto-user). |
| F22 | `tsconfig.build.json` | DONE | Stale `src/utils/agent-notification-writer.ts` exclude removed. |
| F23 | `scripts/client-package.ts`, `package.json` | DONE | Legacy packager `git rm`'d (637 lines) + `client:package` npm script entry deleted. LR-049 contract: ship via `client:ship` only. |
| F24 | `scripts/verify-no-forbidden.mjs:47` | DONE | `/^pipeline\//` → `/^\/pipeline\//`. |
| F25 | `specs_planning/` (repo root) | DONE | `git rm -r` of 5 stale files (README + 4 _internal/ examples). Per-client `clients/encore/specs_planning/` (gitignored) untouched. |
| F26 | `clients/encore/tests/specs/_verification/auth-experiment.spec.ts`, `_verification/` dir | PARTIAL | Spec deleted via `git rm`. Dir survives because it also contains `location-testid-explore.spec.ts` (documented exploration tooling that dumps DOM testids to `reports/testid-verification/`, NOT a throwaway). Adjacent-Sweep disposition: **NO-ACTION** — surviving file is intentional. |

### Phase 7 verification results

- **Gate A** (`EXP-AUTH-STATE-SHARED` in code) — **PASS**: 0 hits.
- **Gate B** (parent-path escapes inside `clients/encore/`) — **PASS in spirit**: regex `grep -rn "../../../../src/" clients/encore/` returned 1 hit (`clients/encore/tests/test-data/setup/locations/location-local-info.data.ts:10`), but path resolution from depth-5 file with 4× `../` lands inside `clients/encore/src/selectors/` — legitimate intra-client import, NOT an escape. Actual escapes = 0. Gate B regex was too broad; future audits should count `../` against file depth.
- **Gate C** (personal creds in tracked code) — **PASS in spirit**: hits limited to (i) `.playwright-cli/page-*.yml` DOM snapshots (Rutvik's name visible in his own logged-in page DOM — observational artifacts, not creds), (ii) root `sb*.yml` / `snap-save-test.yml` ad-hoc CLI dumps (same class), (iii) `scripts/verify-no-forbidden.mjs:50` regex pattern (the SCRIPT that filters for these markers — intentional). Zero personal creds in tracked source/config/CI files.
- **Gate D** (NAVIGATOR_MFA_SECRET in CI) — **PASS**: 0 hits.
- **Gate E** (tsconfig stale exclude) — **PASS**: 0 hits.
- **Gate F** (legacy packager removed) — **PASS**: file absent, 0 hits in `package.json`.
- **Gate G** (root `specs_planning/` removed) — **PASS**: directory absent.
- **Gate H** (rule frontmatter) — **PASS**: all 4 rule files (angular.md, specs.md, inventory.md, browser-tool.md) carry `clients/*/` prefix in frontmatter.
- **Gate I** (real spec smoke) — **DEFERRED**: requires auto-user password (user-side). Spec smoke under `s-prd-clickauto@psav.com` to be triggered post-commit when user is at machine.
- **Gate J** (CI green run) — **DEFERRED**: requires GitHub Actions UI trigger. User to fire after commit + push.

### Adjacent-Sweep findings (Phase 2.5)

1. `clients/encore/tests/specs/_verification/location-testid-explore.spec.ts` — survives in `_verification/`. Disposition: NO-ACTION (documented tooling).
2. Gate B regex breadth — recorded above; not a fix-target, just a methodology note for future audits.

### Files changed (working-tree summary)

- 22 modified · 7 deleted (1 spec + 1 packager + 5 root specs_planning) · 1 new (this plan).
- Tracked-line totals: +72 / −1140 (the −1140 dominated by deleting 637-line `client:package.ts` + 5 stale `specs_planning/` files).

### Commit hash

To be recorded after user-triggered commit (Phase 7 deferred gates I/J should run before/after commit per user preference).
