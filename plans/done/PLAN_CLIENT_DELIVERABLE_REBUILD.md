# PLAN: Client Deliverable Rebuild — Path A (Vendored Framework + git-archive Ship)

**Status**: DONE
**Executed**: 2026-05-01
**Priority**: P0-EMERGENCY
**Created**: 2026-04-30
**Last revised**: 2026-04-30 (post-audit; pivoted to Path A; every cross-reference enumerated)
**Identity**: OWNER
**Depends on**: NONE — but supersedes the SP-MT-07 "no packager" decision (see Context below)
**Blocks**: any future client onboarding (every new client needs this scaffold)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: none
**Skills**: /planning (authoring), /audit (closure), /final-q (exit)

---

## Context

### What happened

On 2026-04-30 ~15:34 IST the user attempted to ship the Encore client deliverable directly. Instead of running an existing packaging script (which was stale — see below), the deliverable was created via `git init && git add . && git commit -m "Initial Encore Playwright deliverables" && git push origin main` to a new private repo `RutviK-JBS/encore_deliverables_test` (single commit `febff022e6a4ade3f1157bf526095209cb8ec917`, 195 files / 51,900 lines, verified). The push completed, then verification surfaced that 5-agent pipeline IP, internal audits, and agent-only docs had landed in the repo.

### Why the script was stale

[scripts/client-package.ts](../../scripts/client-package.ts) `COPY_DIRS` (lines 42-54) reads `dist/`, `tests/`, `.ci/`, `scripts/setup/` from REPO ROOT. The script was last touched on **2026-04-08** (`5bb9de7` — allure infra). The SP-MT-01 multi-tenant restructure landed **2026-04-17** (commit `93e3d2c`, verified via `git show`). The 9-day gap is when the script silently went stale: paths still exist at root but their content moved per-client (`clients/encore/tests/`, `clients/encore/src/`). Today's run would have packaged framework `dist/` + root `tests/` (which contains `tests/unit/agent-notification-writer.test.ts` — a pipeline unit test) + framework CI templates — not the client tests.

### Why `clients/encore/` is not yet self-contained

Verified: `clients/encore/` lacks `package.json`, `playwright.config.ts`, `tsconfig.json`, `.gitignore` at its root. Path aliases live in repo-root `tsconfig.json` (`@framework/*` → `src/*`, `@client/*` → `clients/encore/src/*`). The user's stated contract — "send the encore folder, it works on their machine" — fails today both in source (no per-client meta-files) and in delivery (no clean ship pipeline).

### Why we now own the packaging (pivot from SP-MT-07)

[plans/done/SUBPLAN_MT_07_DELIVERY_PACKAGER.md](SUBPLAN_MT_07_DELIVERY_PACKAGER.md) (closed 2026-04-17) explicitly decided NOT to build a packager: *"we ship to colleague, they will ship to client, we ship everything in new structure, colleague decides what to give and what to not give."* That decision held until today — when the user shipped DIRECTLY to a client-accessible private repo, bypassing the colleague step. **The colleague-as-packager assumption is broken.** This plan re-internalizes packaging discipline: ship-from-source becomes structurally enforced, no human curation needed at ship time.

### What's verified (no assumptions; LR-020 compliance)

- Deliverable git remote: `https://github.com/RutviK-JBS/encore_deliverables_test.git` — separate private repo, single commit `febff02`, 195 files (`git ls-files | wc -l`).
- Local deliverable folder: `C:/Users/rutvi/projects/encore_deliverables_test/` (verified by directory listing).
- `.env.development.local` is **NOT** in the deliverable git tree (`git ls-files | grep env` returns only `.env.development`, `.env.example`, `.gitkeep`). Personal credentials confirmed safe in the commit.
- Deliverable contains (verified via `git ls-tree -r HEAD`):
  - `src/orchestrator/{orchestrator,gate-runner,dependency-engine,failure-classifier,artifact-validator,types}.ts` — 5-agent pipeline runtime (~1100 lines).
  - `src/server/db/{client,queries,schema.sql}` (216-line schema verified by `wc -l`), `src/server/routes/{admin,events,health,pages,pipeline,setup,worker}.ts`, `src/server/models/agent-registry.ts`, `src/server/serializers.ts`, `src/server/index.ts` — ~3000 lines of Fastify backend.
  - `src/worker/{index,worker-manager,sdk-executor,progress-extractor}.ts` — ~1300 lines of agent worker runtime.
  - `src/utils/agent-notification-writer.ts`, `src/utils/agent-reporter.ts` — agent-coupled utils (one stays, one moves; see Workstream B).
  - `clients/encore/CLAUDE.md` (12,087 bytes ≈ 12 KB, verified via `ls -la`).
  - the archived master audit dated 2026-03-06 under `clients/encore/specs_planning/audits/archive/`, plus 13 sibling internal audit files.
  - `clients/encore/specs_planning/catalogs/hist-root-map-*.md` — internal MCP exploration logs.
  - the Encore agent-rules doc under `clients/encore/docs/read_only_docs/` — internal Jira IDs (NM-1264, BUG-LI-001), §E1–§E6 agent rules.
  - `clients/encore/docs/read_only_docs/Functional Requirement -v1.docx`, `Encore-Requirements-V2.docx`, NM-1331/NM-1334 PriceGuide `.docx` files — internal Jira-tagged requirements.
- Root `tests/` and `dist/` and `.ci/` **DO** still exist (the prior plan-draft incorrectly claimed they didn't). Stragglers in root `tests/` that should never reach a client: `tests/unit/agent-notification-writer.test.ts`, `tests/hooks/fixtures/*.json[l]`.
- the encore session-state file under `.auth/` (18 KB) is session-state only (`grep -c 'v-rutvik\|khosariya'` = 0). the nav4 session-state file under `.auth/` (19 KB) **is cred-bearing** (`grep -c 'v-rutvik\|khosariya'` = 1 — `<automation-user>` baked into a localStorage TTL value). `.auth/chrome-profile/` is a full Chrome user profile.
- Encore-specific stragglers in source root that must move into `clients/encore/`:
  - [config/environments/.env.local](../../config/environments/.env.local) — `cloudapps-e2e.encoreglobal.com` URLs, office 1604, real cred for `s-prd-clickauto@psav.com` at line 11.
  - [scripts/build-claim-vs-actual-diff.mjs](../../scripts/build-claim-vs-actual-diff.mjs) — hardcoded `cloudapps-e2e.encoreglobal.com`, office 1604, `<automation-user>` (line 152, 188; `office 1604` mention at line 182).
  - [scripts/owner-dom-walk-2026-04-29.mjs](../../scripts/owner-dom-walk-2026-04-29.mjs) — hardcoded `BASE_URL` (line 10), `OFFICE = '1604'` (line 14), `APP_HOST = 'cloudapps-e2e.encoreglobal.com'` (line 18).
- `TEMP_RUTVIK_EXPERIMENT` markers exist in **7 production / config files** (verified via grep): `playwright.config.ts:63,136`, `playwright.config.ci.ts:82`, `clients/encore/tests/setup/auth.setup.ts:8`, `clients/encore/tests/setup/auth-storage.ts:6`, `clients/encore/tests/setup/fixtures.ts:139`, `clients/encore/CLAUDE.md`, the playwright-tests workflow at lines 12, 13, 16, and 43. Plus 11 `.playwright-cli/` snapshot files (gitignored). Any deny-list grep that fires on the literal string `TEMP_RUTVIK_EXPERIMENT` will fail today — production files leak the marker. Workstream D resolves this by renaming the marker to its non-PII alias `EXP-AUTH-STATE-SHARED` (already used alongside it in the same files).
- Cross-references that break if `src/orchestrator/`, `src/server/`, `src/worker/`, `src/utils/agent-notification-writer.ts` move to `pipeline/` (verified via repo-wide grep — 14 distinct production-relevant locations, fully enumerated in Workstream C).

### Path A — chosen approach (the simplest contract)

After audit + counter-audit, **Path A** is the chosen design:

1. **Vendor compiled framework INSIDE each `clients/<id>/dist/framework/`** (tracked in git). Per-client copy stays small (~1.3 MB compiled, verified via `du -sh dist/`). A pre-commit / CI hook keeps vendored output in sync with framework `src/`.
2. **Agent artifacts stay co-located inside `clients/<id>/`** but are **gitignored at the per-client level**. CLAUDE.md, specs_planning/, readable_externals/, exports/, docs/read_only_docs/, .auth/, etc. live next to the code that produces them, but `git archive HEAD clients/<id>/` excludes them automatically.
3. **Ship via `git archive`** (single official command — `npm run client:ship -- --client=<id> --out=<path>`). Never `cp -r`. Operator discipline is structurally enforced by hooks + a deny-list verifier; the ship script is the only blessed path.
4. **`src/` becomes "publishable by default"** — whatever lives in `src/` ends up in `dist/framework/`. **`pipeline/` is "internal by default"** — orchestrator, server, worker, agent-notification-writer, hook tests, server tsconfig all relocate there.
5. **One exception to the "everything in src/ ships" rule**: `src/utils/agent-reporter.ts` STAYS at `src/utils/` because it is a framework-public Playwright reporter (`playwright.config.ts:89`, `playwright.config.ci.ts:35`). Moving it would break the configs the deliverable itself uses. `BUNDLE_MANIFEST.md:51` already documents this — agent-reporter is reported-as-keep, agent-notification-writer is reported-as-delete. We honor that distinction.

The user statement that drove this design: *"if we take the path A, and let claude push to clients, they wont get or know anything other than what is relevant to them?"* — yes, with the three conditions: (a) ship via `git archive`, never `cp -r`; (b) internal stuff is gitignored, not just "not committed"; (c) nobody runs `git add -f` on a gitignored file. This plan structurally enforces (a) and (b); (c) is human discipline backed by the pre-push hook.

---

## Bootstrap

**Identity**: OWNER (default unrestricted; non-pipeline scope).

**Skills auto-called by `/execute`**:
- `/identity` — universal first-step gate.
- `/relevant` — scans this plan's subtasks against available skills (Phase 0.5).
- `/regression-guard` — wraps Workstream B (pipeline/ move) and Workstream C (cross-reference updates) with structural fingerprint snapshots.
- `/audit` — runs at the end (closure audit).
- `/final-q` — exit gate.

**Context files this plan depends on (every reader must load)**:
- `@CLAUDE.md` — root configuration; gets updated in Workstream G with new structure.
- `@.claude/rules/pipeline.md` — LR-020 (verify claims), LR-027 (execution summary), LR-040 (closure-gate), LR-041 (Model+Thinking+PermissionMode), LR-046 (strict plan lines), LR-048 (subplan structural minimum), LR-049 (NEW — ship-via-git-archive only; defined in Workstream G).
- `@.claude/rules/data.md` — LR-001..LR-006 (function signature verification, catalog/impl parity, no empty catches, etc.) when editing TypeScript.
- `@.claude/rules/browser-tool.md` — LR-038 v2 (`BrowserTool: none` declared; no live-DOM work).
- `@docs/read_only_docs/LEARNED_RULES.md` — LR-NNN cross-cutting rules.
- `@BUNDLE_MANIFEST.md` — current "what ships" manifest (will be updated to reflect Path A).
- `@plans/done/SUBPLAN_MT_07_DELIVERY_PACKAGER.md` — historical context for the colleague-pivot.
- `@~/.claude/plans/plan-client-deliverable-rebuild-review-i-curried-wadler.md` — the audit + counter-audit log that produced this revision (history; not load-bearing for execution).

---

## Phase 0 — Dependency + scope gate

Asserts before any work begins:

1. **Working tree state**: `git status` reports the expected staged/unstaged set; no surprise files. Any uncommitted change in `src/orchestrator/`, `src/server/`, `src/worker/`, `src/utils/agent-*`, `clients/encore/`, `playwright.config*.ts`, `tsconfig*.json`, `package.json`, `.github/workflows/`, `.githooks/` is committed or stashed before Workstream A starts.
2. **Deliverable repo state**: `git ls-remote https://github.com/RutviK-JBS/encore_deliverables_test.git refs/heads/main` returns the same SHA seen locally (`febff02`). If different (collaborator pushed), HALT and inform user.
3. **Client-collaborator status**: confirm with user that the Encore client has NOT yet been added as a collaborator on `encore_deliverables_test`. If they have been, force-push (Workstream F) needs explicit user re-authorization.
4. **Vendored-output baseline**: `du -sh dist/` ≈ 1.3 MB (verified) — confirms vendoring per-client is cheap (≤ 2 MB / client / commit).
5. **Browser-tool gate**: `BrowserTool: none` declared. No live-DOM work in this plan. Verification in Phase 8 uses `npx playwright test --list` only (does not launch a browser).
6. **Skills gate**: `/regression-guard` snapshot taken before Workstream B (file move boundary).

---

## Phase 1 — Workstream A: `clients/encore/` self-containment at source

Goal: `cp -r clients/encore /tmp/x && cd /tmp/x && npm install && npx playwright test --list` succeeds standalone in source-repo dev workflow (without packaging script).

### A1. Create per-client meta-files at `clients/encore/` root

| File | Content |
|---|---|
| `clients/encore/package.json` | Encore-only deps (Playwright, allure, dotenv-flow, otplib, etc.) + scripts (`test`, `test:headed`, `test:debug`, `test:ui`, `report`, `allure:generate`, `allure:open`, `setup`, `clean`, `typecheck`, `build:framework` — invokes the vendor build). `name: "@encore/playwright"`, `private: true`, `license: "UNLICENSED"`. |
| `clients/encore/playwright.config.ts` | `__dirname`-relative paths, no `ACTIVE_CLIENT` env-var indirection (single-client deliverable). Reporter at `./dist/framework/utils/agent-reporter.js`. `globalSetup`/`globalTeardown` at `./tests/setup/global-{setup,teardown}.ts`. Test scope: `./tests/**/*.spec.ts` + `./api-testing/**/*.spec.ts`. |
| `clients/encore/playwright.config.ci.ts` | CI variant — extends the above, identical pattern to root `playwright.config.ci.ts`, but with no parent-relative paths. |
| `clients/encore/tsconfig.json` | `compilerOptions.paths`: `@client/*` → `./src/*`, `@framework/*` → `./dist/framework/*`, `@client-tests/*` → `./tests/*`. `include`: `src/**/*.ts`, `tests/**/*.ts`, `api-testing/**/*.ts`, `dist/framework/**/*.d.ts`. NO parent-relative paths anywhere. |
| `clients/encore/.gitignore` | The per-client deny rules (see A2). |

### A2. `clients/encore/.gitignore` content

The per-client `.gitignore` is the structural fence Path A relies on. Anything inside this file does NOT enter `git archive HEAD clients/encore/`. Spec:

```
# Agent / pipeline artifacts (never ship)
CLAUDE.md
specs_planning/
readable_externals/
docs/read_only_docs/
exports/
.auth/

# Per-developer overrides
config/environments/.env.local
config/environments/.env.*.local
config/environments/.env.server

# Build outputs (regenerated, not in git for non-vendor)
node_modules/
reports/
logs/
*.tsbuildinfo

# Vendored framework EXCEPTION — explicitly tracked
!dist/framework/

# OS / IDE
.DS_Store
Thumbs.db
.idea/
.vscode/

# Playwright
playwright-report/
playwright/.cache/
test-results/
```

The `!dist/framework/` allowlist is the inverse of the root repo's `dist/` ignore — at the client level, vendored framework IS tracked. Root-level `.gitignore` has `dist/` ignored, so a coordinating rule update is needed (Workstream G2).

### A2.1. Untrack legacy artifacts (REQUIRED post-`.gitignore`-creation — added 2026-05-01)

`.gitignore` only governs files NOT YET tracked by git. Any file already tracked when the per-client `.gitignore` is added KEEPS being tracked, even if it now matches a deny pattern. Without an explicit `git rm --cached` step, Layer 1 of the 3-layer defense (per-client `.gitignore`) is decorative for those files; only Layer 2 (`scripts/verify-no-forbidden.mjs` deny-list grep) catches them at ship time.

For Encore, the pre-existing tracked content matching the new deny patterns is ~82 files (CLAUDE.md, docs/read_only_docs/*, exports/*.csv, specs_planning/, readable_externals/, .auth/). Run **once per client** immediately after authoring `clients/<client>/.gitignore`:

```bash
cd clients/<client>
# Untrack pre-existing files matching new deny patterns. Files stay on disk; git just stops tracking them.
git rm --cached -r CLAUDE.md docs/read_only_docs/ exports/ specs_planning/ readable_externals/ .auth/ 2>/dev/null || true
# Verify: should return zero
git ls-files | grep -E '^(CLAUDE.md|docs/read_only_docs/|exports/|specs_planning/|readable_externals/|\.auth/)' | wc -l
```

The trailing `|| true` is intentional: `git rm --cached` errors on paths that don't currently exist OR aren't tracked, but for the verification we only care about the AFTER state (the grep returning 0). Skip patterns that don't apply to the client (e.g., a client without a populated `exports/` won't have anything to untrack there — that's fine).

The `git rm --cached` changes get committed in the SAME commit as the `clients/<client>/.gitignore` itself, so the structural fence becomes effective atomically.

**Trigger** (future per-client setups): every new `clients/<id>/.gitignore` authoring. Skipping this step = Layer 1 decorative for legacy content = audit finding.

**Graduated from**: F16 (audit-of-audit blindspot 2026-05-01) — original plan A2 specified the `.gitignore` content but missed this step. Discovered when ship pipeline aborted at deny-list Layer 2 with 82 forbidden tracked files.

### A3. Vendor-build script: `scripts/build-framework-vendor.ts`

Compiles framework `src/` (minus pipeline-only files, see B3) into each `clients/<client>/dist/framework/`. Specification:

- Input: `tsconfig.build.json` + `--client=<id>` flag.
- Output: `clients/<id>/dist/framework/{*.js,*.d.ts}` mirroring `src/` tree (excluding `__tests__/`, excluding any path moved to `pipeline/`).
- Idempotent: re-running on unchanged `src/` produces byte-identical output.
- Vendor-fresh check: emits the vendor metadata JSON file under `clients/<id>/dist/framework/` with `{srcCommit, srcMtimes, builtAt}`. Pre-commit hook reads this to detect drift.
- Error: refuses to run if `pipeline/` (Workstream B output) doesn't exist after Workstream B is complete (catch-out-of-order execution).

Add npm script: `"vendor:build": "ts-node scripts/build-framework-vendor.ts --client=encore"` and `"vendor:build:all": "node scripts/build-framework-vendor-all.mjs"` (loops over all `clients/*/`).

### A4. Move Encore-specific stragglers IN (and update references)

Each move below is a `git mv` + import-path rewrite + reference-update step. Every reference is enumerated; do NOT proceed without verifying each grep returns zero hits at the old path.

| From | To | Action |
|---|---|---|
| `config/environments/.env.local` | `clients/encore/config/environments/.env.local` | `git mv`. Already gitignored at both root (`config/environments/.env.local`) and per-client (`clients/*/config/environments/.env.local`). Verify with `git check-ignore`. |
| `scripts/build-claim-vs-actual-diff.mjs` | `clients/encore/scripts/build-claim-vs-actual-diff.mjs` | `git mv`. Update any npm scripts in root `package.json` (none today; verify). The hardcoded `cloudapps-e2e.encoreglobal.com` / `1604` / `<automation-user>` strings stay client-scoped — acceptable now that file is under `clients/encore/`. |
| `scripts/owner-dom-walk-2026-04-29.mjs` | `clients/encore/scripts/owner-dom-walk-2026-04-29.mjs` | `git mv`. Same rationale. |
| `tests/unit/agent-notification-writer.test.ts` | `pipeline/tests/unit/agent-notification-writer.test.ts` | `git mv` (Workstream B). Update import from `../../src/utils/agent-notification-writer` → `../../utils/agent-notification-writer`. |
| `tests/hooks/fixtures/*` | `pipeline/tests/hooks/fixtures/*` | `git mv` (Workstream B). |
| `tests/.gitkeep` | `pipeline/tests/.gitkeep` (or delete) | `git mv`. Root `tests/` ceases to exist. |
| `tests/examples/*` | `pipeline/tests/examples/*` (or delete if obsolete) | `git mv`. They were never client-shippable. |

### A5. Standalone-install verification (gate before A is closed)

```bash
# Source-repo standalone test (without packaging script):
cp -r clients/encore /tmp/encore-stand
cd /tmp/encore-stand
npm install
npx playwright test --list   # must succeed
```

If `--list` errors with module-not-found on `@framework/*`, the vendored `dist/framework/` is missing or stale. Run `npm run vendor:build:all` from source repo and re-copy.

---

## Phase 2 — Workstream B: pipeline runtime out of `src/`

Goal: `src/` contains only files safe to ship to a client; `pipeline/` contains the agent runtime that never ships.

### B1. Create `pipeline/` at repo root

Skeleton:

```
pipeline/
├── README.md             ← brief ownership doc — "internal-only runtime, never ships"
├── tsconfig.json         ← was tsconfig.server.json; updated includes
├── orchestrator/
├── server/
├── worker/
├── utils/
│   └── agent-notification-writer.ts
├── tests/
│   ├── unit/
│   ├── hooks/
│   └── examples/
└── scripts/
    └── healer-post-complete.ts
```

### B2. Moves (`git mv` for each — preserves history)

| From | To |
|---|---|
| `src/orchestrator/` (6 files) | `pipeline/orchestrator/` |
| `src/server/` (db, models, routes, serializers.ts, index.ts — 13 files) | `pipeline/server/` |
| `src/worker/` (4 files) | `pipeline/worker/` |
| `src/utils/agent-notification-writer.ts` | `pipeline/utils/agent-notification-writer.ts` |
| `tests/unit/agent-notification-writer.test.ts` | `pipeline/tests/unit/agent-notification-writer.test.ts` |
| `tests/hooks/fixtures/*` | `pipeline/tests/hooks/fixtures/*` |
| `tests/examples/*` (3 specs) | `pipeline/tests/examples/*` |
| `tests/.gitkeep` | (delete — root `tests/` removed entirely) |
| `tsconfig.server.json` | `pipeline/tsconfig.json` (with rewritten `include` — see C2) |
| `scripts/healer-post-complete.ts` | `pipeline/scripts/healer-post-complete.ts` |

### B3. Files that STAY at `src/utils/`

`src/utils/agent-reporter.ts` is **NOT moved**. Rationale: it is a framework-public Playwright reporter referenced by every `playwright.config*.ts` (root and per-client). `BUNDLE_MANIFEST.md:51` already documents this distinction. Moving it forces every config to update; keeping it preserves the framework-public contract.

Other `src/utils/` files (logger, common-methods, diagnostics-collector) are likewise framework-public; they stay.

### B4. Verify post-move resolutions

```bash
# Every old path must be gone:
test ! -d src/orchestrator && test ! -d src/server && test ! -d src/worker
test ! -f src/utils/agent-notification-writer.ts
test ! -d tests   # root tests/ entirely gone

# Every new path must exist:
test -d pipeline/orchestrator && test -d pipeline/server && test -d pipeline/worker
test -f pipeline/utils/agent-notification-writer.ts
test -f pipeline/tsconfig.json
```

---

## Phase 3 — Workstream C: every cross-reference updated (no orphans)

Goal: zero file in the repo references the old (`src/orchestrator|server|worker`, `src/utils/agent-notification-writer`, `tsconfig.server.json`) paths after Workstream B.

Each row is a **mandatory edit**, with the file + line + old → new. Failure to update any one of these breaks `npm test`, `npm run typecheck`, the healer hook, or VS Code debug. Verified via repo-wide grep `src/(orchestrator|server|worker)|src/utils/agent-` (excluding node_modules, .git, dist, .tmp, encore_deliverables_test, encore_framework - Copy).

### C1. Production code (CRITICAL — runtime breaks if missed)

| File | Line | Old | New |
|---|---|---|---|
| `package.json` | 92 | `"server:start": "ts-node src/server/index.ts"` | `"server:start": "ts-node pipeline/server/index.ts"` |
| `package.json` | 93 | `"server:dev": "node --watch -r ts-node/register src/server/index.ts"` | `"server:dev": "node --watch -r ts-node/register pipeline/server/index.ts"` |
| `package.json` | 94 | `"worker:start": "ts-node src/worker/index.ts"` | `"worker:start": "ts-node pipeline/worker/index.ts"` |
| `package.json` | 95 | `"db:migrate": "...require('./src/server/db/client')..."` | `"db:migrate": "...require('./pipeline/server/db/client')..."` |
| `playwright.config.ts` | 89 | `['./src/utils/agent-reporter.ts'],` | unchanged — agent-reporter STAYS at src/utils/ (B3) |
| `playwright.config.ci.ts` | 35 | `['./src/utils/agent-reporter.ts'],` | unchanged — same reason |
| `pipeline/server/db/client.ts` | 50, 55 | `__dirname` resolves to `src/server/db/`; `path.join(__dirname, '../../../src/server/db/schema.sql')` | `__dirname` now `pipeline/server/db/`; update relative → `path.join(__dirname, 'schema.sql')` (schema.sql is co-located in same dir per moved tree). |
| `pipeline/tests/unit/agent-notification-writer.test.ts` | 13 | `from '../../src/utils/agent-notification-writer'` | `from '../../utils/agent-notification-writer'` |
| `pipeline/scripts/healer-post-complete.ts` | 154 | `require('../src/utils/agent-notification-writer')` | `require('../utils/agent-notification-writer')` |

### C2. tsconfigs (CRITICAL — typecheck breaks)

| File | Change |
|---|---|
| `pipeline/tsconfig.json` (was `tsconfig.server.json`) | Replace `include: ["src/server/**/*.ts", "src/orchestrator/**/*.ts", "src/worker/**/*.ts"]` with `include: ["./**/*.ts"]` (relative-from-pipeline). Update `rootDir`, `outDir` to `./` and `../dist-pipeline` respectively. Remove the `exclude: ["src/pages", "src/selectors", "src/common", "src/utils", "src/data", "src/security", "src/framework-contracts"]` block — irrelevant after the move. |
| `tsconfig.json` (root) | Remove `tsconfig.server.json` reference if present (it isn't currently). The root `paths` aliases (`@framework/*: src/*`, `@client/*: clients/encore/src/*`, `@client-tests/*: clients/encore/tests/*`) are unaffected — `src/` still contains framework-public files. |
| `tsconfig.build.json` | `include: ["src/**/*.ts"]` already correct; the now-shrunken `src/` is exactly the publishable framework. `exclude: ["src/data/adapters/__tests__/**"]` stays. **Add** `exclude: ["src/utils/agent-notification-writer.ts"]` — defensive, since the file moves out anyway and shouldn't be re-introduced silently. |

### C3. Configuration / metadata (HIGH — silent rot otherwise)

| File | Line | Change |
|---|---|---|
| `.claude/launch.json` | 21 | `"runtimeArgs": [..., "src/server/index.ts"]` → `"pipeline/server/index.ts"` |
| `.claude/agents/RUTVIK.agent.md` | 19 | Pipeline Backend row: `src/server/`, `src/orchestrator/`, `src/worker/` → `pipeline/server/`, `pipeline/orchestrator/`, `pipeline/worker/` |
| `clients/encore/config/environments/.env.server.example` | 25 | Comment `# Worker config (for src/worker/index.ts)` → `# Worker config (for pipeline/worker/index.ts)` |
| `website/backend/src/utils/anthropic-client.ts` | 5 | Comment `Mirrors src/worker/sdk-executor.ts logic — keep MODEL_MAP and cost rates in sync.` → `Mirrors website/backend/src/worker/sdk-executor.ts logic — keep MODEL_MAP and cost rates in sync.` (path-explicit so the C5/H1 strict-grep gate doesn't false-positive on this comment; the file actually being referenced is `website/backend/src/worker/sdk-executor.ts`, which exists and is internal to the website subproject — NOT the framework `src/worker/` being moved). |

### C4. Documentation / handoff (LOW — historical accuracy)

| File | Action |
|---|---|
| `BUNDLE_MANIFEST.md` | Full rewrite for Path A (Workstream G3). Old "DELETE list" of `src/orchestrator/`, `src/server/`, `src/worker/`, `src/utils/agent-notification-writer.ts` becomes irrelevant — those paths no longer exist in `src/`. |
| the multi-tenant handoff source doc under Encore readable externals, line 67 | Add a footnote dating the doc and noting the post-2026-04-30 path change. Do NOT rewrite — it's a dated handoff record. |
| the multi-tenant handoff HTML index under Encore readable externals, line 98 | Same footnote treatment. |
| Plans in `plans/done/` that reference old paths | Leave untouched — they are historical records (LR per Plans Discipline). |
| Plans in `plans/pending/` that reference old paths (`PLAN_BUG_HUNTING_RULEBOOK_V2.md`, `PLAN_CHAT_UI_BUGS.md`, `PLAN_CODEBASE_CLEANUP.md`, `PLAN_FULL_CHAIN_AUDIT.md`) | Update grep-globally — these are forward-looking plans whose execution will hit the new paths. Each plan needs a one-line "Path note: post-2026-04-30 PLAN_CLIENT_DELIVERABLE_REBUILD, internal runtime moved from `src/{orch,serv,work}/` to `pipeline/{orch,serv,work}/`." Then any line citing the old path is updated. |

### C5. Final post-Workstream-C grep gate

```bash
# All four greps below MUST return ZERO hits (excluding node_modules, .git, dist*, .tmp, encore_deliverables_test, .playwright-cli):
grep -rn 'src/orchestrator' --include="*.ts" --include="*.js" --include="*.mjs" --include="*.json" --include="*.yml" --include="*.yaml" --include="*.md" --include="*.sh" .
grep -rn 'src/server' --include="*.ts" --include="*.js" --include="*.mjs" --include="*.json" --include="*.yml" --include="*.yaml" --include="*.md" --include="*.sh" .
grep -rn 'src/worker' --include="*.ts" --include="*.js" --include="*.mjs" --include="*.json" --include="*.yml" --include="*.yaml" --include="*.md" --include="*.sh" .
grep -rn 'src/utils/agent-notification-writer' --include="*.ts" --include="*.js" --include="*.mjs" --include="*.json" --include="*.yml" --include="*.yaml" --include="*.md" --include="*.sh" .
```

(`src/utils/agent-reporter` is allowed to remain — that file stays at src/utils/ per B3.)

Plans in `plans/done/` are excluded from this gate — they're historical artifacts.

---

## Phase 4 — Workstream D: TEMP_RUTVIK_EXPERIMENT marker rename

Goal: zero `TEMP_RUTVIK_EXPERIMENT` literal in production / config files. Deny-list grep for "Rutvik" / "v-rutvik" / "khosariya" can fire freely without false positives.

### D1. Rationale

The marker `TEMP_RUTVIK_EXPERIMENT` exists in 7 production / config files. The same files already use a non-PII alias `EXP-AUTH-STATE-SHARED` next to it. The "Rutvik" name in production code is a leak vector — even though the deliverable repo is private, the name is the kind of literal that any future deny-list grep would (correctly) refuse. Renaming the marker is mechanical and removes the conflict between "deny-list catches Rutvik" and "production files contain Rutvik".

### D2. Per-file renames

For each file, replace `TEMP_RUTVIK_EXPERIMENT` with `EXP-AUTH-STATE-SHARED` and update the prose in the surrounding comment to drop "Rutvik" references where they are tooling-temp markers (not when they're crediting Rutvik for a decision — those stay).

| File | Line(s) | Treatment |
|---|---|---|
| `playwright.config.ts` | 63, 136 | Rename marker. Comment stays informative ("auth-state-shared experiment 2026-04-30"). |
| `playwright.config.ci.ts` | 82 | Rename marker. |
| `clients/encore/tests/setup/auth.setup.ts` | 8 | Rename "Search marker: TEMP_RUTVIK_EXPERIMENT" → "Search marker: EXP-AUTH-STATE-SHARED". |
| `clients/encore/tests/setup/auth-storage.ts` | 6 | Same. |
| `clients/encore/tests/setup/fixtures.ts` | 139 | Same. |
| `clients/encore/tests/specs/_verification/auth-experiment.spec.ts` | 2 | Rename JSDoc `(TEMP_RUTVIK_EXPERIMENT 2026-04-30)` → `(EXP-AUTH-STATE-SHARED 2026-04-30)`. (Throwaway verification spec — DEVIATION-added during /execute Phase 1 gap analysis; plan originally enumerated 7 prod files but D4 strict grep target=zero requires all 8 hits cleared.) |
| the playwright-tests workflow | 12, 13, 16, 43 | **Special**: this file documents that `NAVIGATOR_MFA_SECRET` is set "while the shared automation user is broken — temp account is Rutvik's personal MFA-enabled account." That's a real human-name reference that should be moved to internal docs, not committed CI. Replace the multi-paragraph TEMP_RUTVIK_EXPERIMENT block with a 1-line `EXP-AUTH-STATE-SHARED` reference, and move the "Rutvik's personal MFA-enabled account" detail to `clients/encore/specs_planning/_internal/active-experiments.md` (gitignored). |
| `clients/encore/CLAUDE.md` | (whole file is gitignored under per-client rules — no rename needed; agent-only) | No-op. |

### D3. New file: `clients/encore/specs_planning/_internal/active-experiments.md`

Single tracked log of in-flight production-touching experiments. Gitignored (per per-client `.gitignore`). Format:

```markdown
# Active Experiments — Encore

| ID | Started | Owner | Files touched | Reason | Removal trigger |
|---|---|---|---|---|---|
| EXP-AUTH-STATE-SHARED | 2026-04-30 | Rutvik | playwright.config*.ts, tests/setup/{auth.setup,auth-storage,fixtures}.ts, playwright-tests workflow | Shared storageState across workers using personal MFA account while shared automation user is broken | Encore IT provisions MFA-less auto-user; revert to single-worker auth |
```

### D4. Acceptance for Workstream D

```bash
# Must return zero hits in production / config (allowed in plans/done/, plans/pending/, .playwright-cli/ snapshots):
grep -rn 'TEMP_RUTVIK_EXPERIMENT' --include="*.ts" --include="*.yml" --include="*.yaml" --exclude-dir=plans --exclude-dir=.playwright-cli .
```

---

## Phase 5 — Workstream E: ship discipline (structural enforcement)

Goal: shipping is a single command. Every other path is blocked by hooks.

### E1. `scripts/ship-client.sh` — official ship command

Created at `scripts/ship-client.sh`, executable. Wrapped via `npm run client:ship` in root `package.json`.

```bash
#!/usr/bin/env bash
# Ship a client deliverable via git archive. The ONLY blessed way to ship.
# Usage:
#   npm run client:ship -- --client=encore --out=/tmp/encore-deliv
#   ./scripts/ship-client.sh --client=encore --out=/tmp/encore-deliv

set -euo pipefail

CLIENT=""; OUT=""; FORCE=0
for arg in "$@"; do
  case "$arg" in
    --client=*) CLIENT="${arg#*=}" ;;
    --out=*)    OUT="${arg#*=}" ;;
    --force)    FORCE=1 ;;
    *)          echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done
[[ -z "$CLIENT" ]] && { echo "ERR: --client=<id> required" >&2; exit 2; }
[[ -z "$OUT" ]]    && { echo "ERR: --out=<path> required" >&2; exit 2; }

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Pre-flight: working tree must be clean (no uncommitted edits to clients/$CLIENT/ or src/ or pipeline/).
if [[ -n "$(git status --porcelain "clients/$CLIENT/" src/ pipeline/)" ]] && [[ $FORCE -ne 1 ]]; then
  echo "ERR: working tree dirty in tracked paths. Commit or pass --force." >&2
  exit 3
fi

# Pre-flight: vendored framework must be fresh.
node scripts/verify-vendor-fresh.mjs --client="$CLIENT"

# Pre-flight: deny-list grep against the would-be archive contents.
node scripts/verify-no-forbidden.mjs --client="$CLIENT"

# Pre-flight: clients/$CLIENT must exist.
[[ ! -d "clients/$CLIENT" ]] && { echo "ERR: clients/$CLIENT not found" >&2; exit 4; }

# Ship via git archive. --strip-components=2 removes the leading "clients/<id>/".
[[ -d "$OUT" ]] && rm -rf "$OUT"
mkdir -p "$OUT"
git archive HEAD "clients/$CLIENT/" | tar -x -C "$OUT" --strip-components=2

# Post-ship: deny-list grep against the actual output (defense in depth).
node scripts/verify-no-forbidden.mjs --target="$OUT"

# Post-ship: smoke (npx playwright test --list, no browser launch).
( cd "$OUT" && npm install --silent && npx playwright test --list >/dev/null )

echo "[OK] Shipped clients/$CLIENT/ → $OUT via git archive"
```

The Bash here is intentional — Windows users have Git Bash (already the configured shell per environment). For PowerShell-only environments, a PowerShell wrapper at `scripts/ship-client.ps1` is added with identical semantics.

### E2. Verifier: `scripts/verify-vendor-fresh.mjs`

Reads the vendor metadata JSON file under `clients/$CLIENT/dist/framework/` (written by `scripts/build-framework-vendor.ts`). Compares stored `srcCommit` + `srcMtimes` vs. current. Refuses with non-zero exit if drift detected.

### E3. Verifier: `scripts/verify-no-forbidden.mjs`

Two modes:

- `--client=<id>` (pre-ship): runs `git ls-files clients/<id>/` + filters against deny-list, refuses if any tracked file matches.
- `--target=<path>` (post-ship): walks the target directory, refuses if any forbidden pattern is present.

Deny-list (the single source of truth — hooks reference this list):

```
any CLAUDE doc
**/specs_planning/**
**/readable_externals/**
**/docs/read_only_docs/**
**/exports/**
**/.auth/**
**/.git/**
**/.github/**
**/.claude/**
**/agent-mistakes.md
**/agent-activity-log.md
**/agent-performance.json
**/agent-metrics-report.md
**/agent-escalations.json
**/agent-learnings.md
**/test-id-registry.json
**/daily-status-bank.json
**/active-experiments.md
**/.env.local
**/.env.*.local
**/.env.server
pipeline/**
```

Plus marker grep:

```
TEMP_RUTVIK_EXPERIMENT
v-rutvik
khosariya
NAVIGATOR_MFA_SECRET=          # actual cred values (not env-var refs)
```

(The literal `Rutvik` is intentionally NOT in the marker grep — the user's name appears in legitimate authorship/credit contexts that should ship to client. The grep specifically targets cred-bearing forms `v-rutvik` / `khosariya`.)

### E4. Pre-push hook: `.githooks/pre-push`

```bash
#!/usr/bin/env bash
set -e

# 1. If staged changes touch clients/<id>/dist/framework/, verify vendor-fresh.
for client_dir in clients/*/; do
  client_id="${client_dir%/}"; client_id="${client_id##*/}"
  if git diff --cached --name-only HEAD | grep -qE "^clients/$client_id/dist/framework/"; then
    node scripts/verify-vendor-fresh.mjs --client="$client_id"
  fi
done

# 2. If staged changes touch src/, ALL clients/*/dist/framework/ must be re-vendored.
if git diff --cached --name-only HEAD | grep -qE "^src/"; then
  for client_dir in clients/*/; do
    client_id="${client_dir%/}"; client_id="${client_id##*/}"
    node scripts/verify-vendor-fresh.mjs --client="$client_id" || {
      echo "[pre-push] src/ changed but clients/$client_id/dist/framework/ is stale. Run: npm run vendor:build:all" >&2
      exit 1
    }
  done
fi

# 3. Deny-list grep against staged files for any forbidden pattern.
git diff --cached --name-only HEAD | xargs -I {} node scripts/verify-no-forbidden.mjs --staged="{}" 2>/dev/null || true
```

### E5. Pre-commit hook update: `.githooks/pre-commit`

Existing hook (currently has 2 sections: plans-reindex + TC field-inventory check) gets a third section appended:

```bash
# --- 3) Vendor-fresh check + deny-list staged-files grep --------
if git diff --cached --name-only | grep -qE '^src/'; then
  echo "[pre-commit] src/ changed — verifying vendored output is fresh"
  for client_dir in clients/*/; do
    client_id="${client_dir%/}"; client_id="${client_id##*/}"
    node scripts/verify-vendor-fresh.mjs --client="$client_id" --warn-only
  done
fi

# Deny-list: refuse to commit a forbidden pattern marker (TEMP_RUTVIK_EXPERIMENT, v-rutvik, etc.)
node scripts/verify-no-forbidden.mjs --staged-diff
```

### E6. CI smoke test: the ship-smoke workflow

```yaml
name: Ship Smoke
on:
  pull_request:
    paths:
      - 'src/**'
      - 'pipeline/**'
      - 'clients/**'
      - 'scripts/ship-client.sh'
      - 'scripts/build-framework-vendor.ts'
      - 'scripts/verify-no-forbidden.mjs'
      - 'scripts/verify-vendor-fresh.mjs'
      - 'package.json'
      - 'tsconfig*.json'
      - 'playwright.config*.ts'
jobs:
  smoke:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run vendor:build:all
      - name: Ship smoke (encore)
        run: npm run client:ship -- --client=encore --out=./_ship-test
      - name: Verify shipped output
        run: |
          test -f _ship-test/package.json
          test -f _ship-test/tsconfig.json
          test -f _ship-test/playwright.config.ts
          test -d _ship-test/dist/framework
          test ! -d _ship-test/specs_planning
          test ! -f _ship-test/CLAUDE.md
          test ! -d _ship-test/.auth
          test ! -d _ship-test/pipeline
          ! grep -r 'TEMP_RUTVIK_EXPERIMENT' _ship-test/
          ! grep -r 'v-rutvik\|khosariya' _ship-test/
```

---

## Phase 6 — Workstream F: cleanup of `encore_deliverables_test` repo

After A–E land in source, the existing `RutviK-JBS/encore_deliverables_test:main` is rebuilt via the new ship pipeline.

### F1. Backup checkpoint (defensive — single-commit history is forgiving but free insurance)

```bash
cd /tmp && git clone https://github.com/RutviK-JBS/encore_deliverables_test.git encore-deliv-backup
cd encore-deliv-backup
git tag pre-rebuild-2026-04-30
git push origin pre-rebuild-2026-04-30
```

### F2. Rebuild via official ship command

```bash
cd ~/projects/encore_framework
npm run client:ship -- --client=encore --out=/tmp/encore-deliv-rebuilt
cd /tmp/encore-deliv-rebuilt
git init
git add -A
git remote add origin https://github.com/RutviK-JBS/encore_deliverables_test.git
git commit -m "Initial Encore Playwright deliverables (rebuild via official ship pipeline 2026-04-30)"
git push --force-with-lease origin main
```

### F3. Post-push verification

```bash
git ls-tree -r HEAD --name-only | wc -l   # should drop substantially from 195
git ls-tree -r HEAD --name-only | grep -E 'orchestrator|server/db|worker|CLAUDE|specs_planning|read_only_docs'   # must return zero
git ls-tree -r HEAD --name-only | grep -E 'TEMP_RUTVIK_EXPERIMENT' || echo "no marker hits"
```

### F4. Discard the local working folder at `C:/Users/rutvi/projects/encore_deliverables_test/`

Once F2/F3 land, the local copy at that path is no longer authoritative. Delete (after confirming git tag `pre-rebuild-2026-04-30` is pushed remote).

### F5. Optional: rotate `s-prd-clickauto@psav.com` password + re-seed MFA

The personal-creds file (`config/environments/.env.local`, now moved per A4) lived locally for ~6 hours during the incident. Low-but-nonzero exposure window. Decision: **deferred to user**. Plan does not auto-rotate; user explicit approval required.

---

## Phase 7 — Workstream G: agent awareness (so no agent repeats this mistake)

Goal: every Claude (or other) agent reading the framework AFTER this plan ships sees the new structure clearly, with structural enforcement (rules + hooks) backing the documentation.

### G1. Update `CLAUDE.md` (root)

Add a new section "Repo Structure (post-2026-04-30 client-deliverable rebuild)":

```markdown
## Repo Structure

- `src/` — **publishable framework**. Whatever lives here ships to clients via vendoring (`clients/<id>/dist/framework/`). Adding code here = client-shippable by default.
- `pipeline/` — **internal runtime**. Orchestrator, server, worker, agent-notification-writer, hook tests. NEVER ships. Adding code here = agent-only by default.
- `clients/<id>/` — **per-client surface**. Page objects, selectors, specs, test data, config. Self-contained: own `package.json`, `playwright.config.ts`, `tsconfig.json`, `.gitignore`. Ships via `npm run client:ship -- --client=<id> --out=<path>` (which uses `git archive HEAD clients/<id>/`).
  - Tracked: `src/`, `tests/`, `config/`, `api-testing/`, `dist/framework/` (vendored), `package.json`, `playwright.config.ts`, `tsconfig.json`, `.gitignore`, `README.md`, `docs/REQUIREMENTS.md`, `docs/MODULE_REGISTRY.md`.
  - Gitignored at per-client level: `CLAUDE.md`, `specs_planning/`, `readable_externals/`, `docs/read_only_docs/`, `exports/`, `.auth/`, `.env.*.local`, `.env.server`.
- Ship discipline: NEVER `cp -r clients/<id>` for delivery. Always `npm run client:ship`. Pre-push hook refuses pushes that would leak gitignored content via tracked-but-forbidden patterns.
```

### G2. Update root `.gitignore`

Add a section reconciling the per-client `dist/framework/` allowlist with the root `dist/` ignore:

```
# Vendored framework per-client (Path A — see PLAN_CLIENT_DELIVERABLE_REBUILD)
# Root /dist/ is anchored (root only) so it does NOT touch clients/*/dist/.
# Per-client allowlist for dist/framework/ lives in clients/<id>/.gitignore.
# This block exists as documentation only — no rule active at root level.
```

### G3. Rewrite `BUNDLE_MANIFEST.md` for Path A

Replace current "what to KEEP / DELETE" lists with a Path A description:

```markdown
# Bundle Manifest — Path A (vendored framework + git-archive ship)

**Generated**: 2026-04-30 (post-PLAN_CLIENT_DELIVERABLE_REBUILD)

The deliverable for any client is `git archive HEAD clients/<client>/` — full stop. There is no curation, no per-file include/exclude decision at ship time. The manifest is the per-client `.gitignore`.

## What ships
- Everything tracked in `clients/<client>/`. Verifiable via `git ls-files clients/<client>/`.
- This includes `dist/framework/` (vendored compiled framework, ~1.3 MB).

## What does not ship
- Anything matching the per-client `.gitignore` patterns (CLAUDE.md, specs_planning/, readable_externals/, docs/read_only_docs/, exports/, .auth/, .env.*.local, .env.server).
- The entire `pipeline/` directory at repo root (never reachable from `clients/<client>/`).
- Anything else outside `clients/<client>/` (tsconfig.json, playwright.config*.ts at root, src/, scripts/, etc. — irrelevant to client).

## Ship command
- `npm run client:ship -- --client=<id> --out=<path>`
- Wraps `git archive HEAD clients/<id>/ | tar -x -C <path> --strip-components=2`.
- Pre-flight: vendor-fresh check + deny-list grep.
- Post-flight: deny-list grep + `npx playwright test --list` smoke.

## New client onboarding
- `cp -r clients/encore clients/<new>` then update `package.json`'s `name` field, regenerate vendor.
- Follow the per-client `.gitignore` template.
```

### G4. Update `.claude/agents/RUTVIK.agent.md` (and any other agent docs)

Already covered in C3. Verify all agent docs (`.claude/agents/*.md`, `.claude/skills/*/SKILL.md`) have correct paths via post-Workstream-C grep gate (C5).

### G5. New rule: `LR-049` in `.claude/rules/pipeline.md`

```markdown
## LR-049: Ship-via-git-archive only — never `cp -r` for client delivery

Client deliverables ship through one and only one path: `npm run client:ship -- --client=<id> --out=<path>`.

The script wraps `git archive HEAD clients/<id>/`, which:
- Includes only files tracked in git (gitignored content is structurally excluded).
- Refuses if vendored framework is stale or if any forbidden pattern is staged.
- Runs a `npx playwright test --list` smoke against the output.

`cp -r clients/<id> /target/` is FORBIDDEN as a delivery mechanism. It copies the entire working tree including gitignored agent artifacts (CLAUDE.md, specs_planning/, .auth/, etc.) and bypasses the vendor-fresh check. Doing this leaks framework IP.

**Trigger**: any chat mention of "ship", "deliver", "package", "send to client", "give them", "make a deliverable", "zip the encore folder", "copy clients/encore to". Agent must verify the operator is invoking the ship script, not `cp` / `tar` / `zip` directly.

**Override**: requires explicit user authorization phrase per the LR-043 break-glass pattern: `override approved` / `override ok` / `i authorize`. One-shot, per-delivery.

**Graduated from**: 2026-04-30 incident — manual `git init && git add . && git push` shipped 195 files including `src/orchestrator/` + `src/server/` + `clients/encore/CLAUDE.md` + `clients/encore/specs_planning/` to a client-accessible private repo.
```

### G6. Add LR-049 to `.gitignore` for per-client agent artifacts (defense in depth)

The per-client `.gitignore` (A2) is the primary fence. LR-049 is the rule layer. The pre-push hook (E4) is the runtime enforcement. Three layers; if any one fails, the others catch.

---

## Phase 8 — Workstream H: end-to-end verification

Goal: prove every acceptance criterion before flipping `Status: DONE`.

### H1. Standalone client check

```bash
cp -r clients/encore /tmp/encore-stand
cd /tmp/encore-stand
npm install
npx playwright test --list   # must succeed
```

### H2. Source-repo health after C3 move

```bash
cd ~/projects/encore_framework
npm run typecheck                                        # tsconfig.json
npx tsc -p pipeline/tsconfig.json --noEmit               # pipeline tsconfig
npx tsc -p tsconfig.build.json --noEmit                  # framework build config
npm test                                                 # full Playwright suite from clients/encore/tests/
npm run server:start &                                   # pipeline server still launches
sleep 2; curl -sS http://localhost:3001/health; kill %1
npm run worker:start &                                   # pipeline worker still launches
sleep 2; kill %1
```

### H3. Ship pipeline end-to-end

```bash
npm run vendor:build:all
npm run client:ship -- --client=encore --out=/tmp/encore-deliv
cd /tmp/encore-deliv
npm install
npx playwright test --list                               # must succeed in shipped output

# Idempotency:
cd ~/projects/encore_framework
npm run client:ship -- --client=encore --out=/tmp/encore-deliv-2
diff -r /tmp/encore-deliv /tmp/encore-deliv-2            # must return empty (byte-identical)
```

### H4. Deny-list verification

```bash
cd /tmp/encore-deliv

# Forbidden paths must NOT exist:
test ! -e CLAUDE.md
test ! -d specs_planning
test ! -d readable_externals
test ! -d docs/read_only_docs
test ! -d exports
test ! -d .auth
test ! -d pipeline
test ! -d .git              # depending on if git archive | tar created one; should be plain files

# Forbidden markers must NOT appear:
! grep -r 'TEMP_RUTVIK_EXPERIMENT' .
! grep -r 'v-rutvik' .
! grep -r 'khosariya' .

# Required files MUST exist:
test -f package.json
test -f tsconfig.json
test -f playwright.config.ts
test -f playwright.config.ci.ts
test -f .gitignore
test -f README.md
test -d dist/framework
test -d src
test -d tests
test -d config
```

### H5. Cross-platform parity (Windows + Linux)

The CI smoke (E6) runs on both. If matrix passes, cross-platform parity is verified.

### H6. Rule-conformance self-check

```bash
# LR-020 — every plan claim verified (this very plan, against this very repo).
# LR-027 — execution summary structure ready for closure.
# LR-040 — every acceptance criterion is grep-verifiable (a/b/c).
# LR-041 — frontmatter has Model + Thinking + PermissionMode + BrowserTool + (Justification if needed).
# LR-046 — strict-line acceptance criteria are honored, not silently rescoped.
# LR-048 — Bootstrap + Phase 0 sections present.
# LR-049 — defined in Workstream G5; trigger rule active.
```

---

## Acceptance criteria

Every box must be checked before `Status: DONE` is set. Strict, grep-verifiable.

### A. Source restructure (Workstreams A + B)

- [ ] `clients/encore/{package.json, playwright.config.ts, playwright.config.ci.ts, tsconfig.json, .gitignore}` all exist.
- [ ] `clients/encore/.gitignore` matches the spec in A2 verbatim (no missing line).
- [ ] `pipeline/{orchestrator,server,worker,utils,tests/{unit,hooks,examples},scripts,tsconfig.json,README.md}` all exist.
- [ ] `tsconfig.server.json` no longer exists at repo root (moved to `pipeline/tsconfig.json`).
- [ ] `src/orchestrator/`, `src/server/`, `src/worker/`, `src/utils/agent-notification-writer.ts` all GONE from `src/`.
- [ ] Root `tests/` directory GONE (all content relocated to `pipeline/tests/`).
- [ ] `config/environments/.env.local` GONE from root (moved to `clients/encore/config/environments/.env.local`).
- [ ] `scripts/build-claim-vs-actual-diff.mjs`, `scripts/owner-dom-walk-2026-04-29.mjs` GONE from `scripts/` (moved to `clients/encore/scripts/`).
- [ ] `src/utils/agent-reporter.ts` STILL EXISTS at `src/utils/` (B3 — framework-public).

### B. Cross-references (Workstream C)

- [ ] `package.json` lines 92-95 reference `pipeline/server/index.ts`, `pipeline/worker/index.ts`, `pipeline/server/db/client`. Zero references to `src/server/`, `src/worker/`.
- [ ] `pipeline/server/db/client.ts` schemaPath resolves to co-located `schema.sql`.
- [ ] `pipeline/tests/unit/agent-notification-writer.test.ts` import resolves.
- [ ] `pipeline/scripts/healer-post-complete.ts` require resolves.
- [ ] `pipeline/tsconfig.json` includes resolve to existing dirs.
- [ ] `tsconfig.build.json` excludes `src/utils/agent-notification-writer.ts` (defensive even though file moved).
- [ ] `.claude/launch.json:21` references `pipeline/server/index.ts`.
- [ ] `.claude/agents/RUTVIK.agent.md:19` reflects new paths.
- [ ] `clients/encore/config/environments/.env.server.example:25` comment updated.
- [ ] `BUNDLE_MANIFEST.md` rewritten for Path A.
- [ ] **Strict — must equal zero**: `grep -rn 'src/orchestrator\|src/server\|src/worker\|src/utils/agent-notification-writer' --include="*.ts" --include="*.js" --include="*.mjs" --include="*.json" --include="*.yml" --include="*.yaml" --include="*.md" --include="*.sh" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.tmp --exclude-dir=encore_deliverables_test --exclude-dir=plans/done --exclude-dir=.playwright-cli --exclude-dir=readable_externals --exclude-dir=specs_planning --exclude-dir=reports --exclude=tsconfig.build.json --exclude=anthropic-client.ts .` returns ZERO hits.
  - Carve-out provenance (each exclusion tied to a plan section that MANDATES the literal — Q1=A 2026-05-01 amendment per LR-046): `--exclude-dir=readable_externals` (plan C4: footnote-only on dated handoff), `--exclude-dir=specs_planning` (LR-028: don't rewrite history; deviations log + activity log live here), `--exclude-dir=reports` (historical reports — `bundle-op-hardening-2026-04-21.md` etc.), `--exclude=tsconfig.build.json` (plan C2 line 19: defensive exclude REQUIRED to keep this literal), `--exclude=anthropic-client.ts` (plan Fix #3: path-explicit comment in `website/backend/` deliberately preserves drift detection).

### C. Marker rename (Workstream D)

- [ ] **Strict — must equal zero**: `grep -rn 'TEMP_RUTVIK_EXPERIMENT' --include="*.ts" --include="*.yml" --include="*.yaml" --exclude-dir=plans --exclude-dir=.playwright-cli .` returns ZERO hits.
- [ ] `clients/encore/specs_planning/_internal/active-experiments.md` exists with EXP-AUTH-STATE-SHARED row.

### D. Ship discipline (Workstream E)

- [ ] `scripts/ship-client.sh` exists, executable, refuses on dirty tree without `--force`.
- [ ] `scripts/build-framework-vendor.ts` exists; `npm run vendor:build:all` produces the vendor metadata JSON file under `clients/encore/dist/framework/`.
- [ ] `scripts/verify-vendor-fresh.mjs` and `scripts/verify-no-forbidden.mjs` exist.
- [ ] `.githooks/pre-push` exists, executable.
- [ ] `.githooks/pre-commit` has the new "Section 3" appended.
- [ ] the ship-smoke workflow exists; CI passes on Ubuntu + Windows matrix.
- [ ] LR-049 added to `.claude/rules/pipeline.md`.

### E. Deliverable repo cleanup (Workstream F)

- [ ] `git tag pre-rebuild-2026-04-30` pushed to `RutviK-JBS/encore_deliverables_test`.
- [ ] Force-pushed clean rebuild lands on `main`.
- [ ] `git ls-tree -r HEAD --name-only` on the deliverable returns ZERO matches for `orchestrator|server/db|worker|CLAUDE-dot-md|specs_planning|read_only_docs|TEMP_RUTVIK`.
- [ ] Local `C:/Users/rutvi/projects/encore_deliverables_test/` deleted (after tag pushed).

### F. Verification (Workstream H)

- [ ] H1 standalone check passes (`/tmp/encore-stand` ships and lists).
- [ ] H2 source-repo health passes (typecheck + npm test + server:start + worker:start all green).
- [ ] H3 ship pipeline produces byte-identical output on consecutive runs (idempotent).
- [ ] H4 deny-list grep / file checks all pass on shipped output.
- [ ] H5 CI smoke passes on both Ubuntu and Windows.

### G. Process / documentation (Workstream G)

- [ ] CLAUDE.md root has new "Repo Structure" section.
- [ ] `.gitignore` root reconciles per-client `dist/framework/` allowlist.
- [ ] BUNDLE_MANIFEST.md rewritten.
- [ ] `.claude/agents/RUTVIK.agent.md` updated.
- [ ] LR-049 in pipeline.md.

---

## Verification commands (cross-platform — Git Bash)

```bash
# === Workstream A verification ===
cp -r clients/encore /tmp/encore-stand
cd /tmp/encore-stand && npm install && npx playwright test --list
cd ~/projects/encore_framework

# === Workstream B verification ===
test ! -d src/orchestrator && test ! -d src/server && test ! -d src/worker
test ! -f src/utils/agent-notification-writer.ts
test -d pipeline/orchestrator && test -d pipeline/server && test -d pipeline/worker

# === Workstream C verification ===
grep -rn 'src/orchestrator\|src/server\|src/worker\|src/utils/agent-notification-writer' \
  --include="*.ts" --include="*.js" --include="*.mjs" --include="*.json" \
  --include="*.yml" --include="*.yaml" --include="*.md" --include="*.sh" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
  --exclude-dir=.tmp --exclude-dir=encore_deliverables_test \
  --exclude-dir=plans/done --exclude-dir=.playwright-cli .
# expected: zero hits

# === Workstream D verification ===
grep -rn 'TEMP_RUTVIK_EXPERIMENT' \
  --include="*.ts" --include="*.yml" --include="*.yaml" \
  --exclude-dir=plans --exclude-dir=.playwright-cli .
# expected: zero hits

# === Workstream E verification (ship pipeline) ===
npm run vendor:build:all
npm run client:ship -- --client=encore --out=/tmp/encore-deliv
cd /tmp/encore-deliv && npm install && npx playwright test --list

# Idempotency:
cd ~/projects/encore_framework
npm run client:ship -- --client=encore --out=/tmp/encore-deliv-2
diff -r /tmp/encore-deliv /tmp/encore-deliv-2
# expected: empty diff

# === Workstream F verification (deliverable repo) ===
cd /tmp && git clone --depth=1 https://github.com/RutviK-JBS/encore_deliverables_test.git rebuilt
cd rebuilt
git ls-tree -r HEAD --name-only | grep -E 'orchestrator|server/db|worker|CLAUDE|specs_planning|read_only_docs'
# expected: zero hits
git ls-tree -r HEAD --name-only | wc -l
# expected: substantially less than 195 (the leaky baseline)
```

---

## Self-audit checklist (run BEFORE `/execute`)

This is the rule-conformance gate before any work starts. Every box checked → plan is green to execute.

- [ ] **LR-020** (verify all claims): every line number, file path, byte count, and SHA cited in this plan was verified against the live codebase or git output during plan authoring (2026-04-30). Any claim added later must be re-verified.
- [ ] **LR-027** (execution summary mandatory before move to done/): execution summary template ready in this plan; will be filled at closure with TCs implemented, MCP findings, doc changes, test pass confirmation.
- [ ] **LR-040** (closure-gate completeness): every acceptance criterion above is either (a) directly grep-verifiable, (b) cited to a downstream subplan with grep-verifiable line item, or (c) flagged as a user decision (none in this plan currently — F5 cred rotation is the only deferred decision and is explicit).
- [ ] **LR-041** (Model + Thinking + PermissionMode + BrowserTool): frontmatter has all four. `Model: claude-opus-4-7`, `Thinking: xhi`, `PermissionMode: acceptEdits`, `BrowserTool: none`. No forbidden combos. No Justification needed (`xhi` is default Opus tier).
- [ ] **LR-046** (strict plan lines): every "must equal zero", "byte-identical", "GONE from", and grep-must-return-zero acceptance criterion is acknowledged as a HALT-and-ask trigger if execution would violate it. APPEND/SPAWN-and-close on a strict line is forbidden.
- [ ] **LR-048** (subplan structural minimum): Title + Frontmatter ✓, Context ✓, Bootstrap ✓, Phase 0 ✓, Phase 1+ ✓, Acceptance ✓, Handoff ✓. (Phase 0.5b — Baseline-first walk — does NOT apply; this plan is not WATCHDOG / `/find-bugs` / module-audit / TC-correction-driven.)
- [ ] **LR-049** (defined herein, takes effect after Workstream G ships): ship-via-git-archive is the only blessed path; `cp -r` is forbidden.
- [ ] **No slop**: Workstream D's "subplan template for deliverable creation", D's vague pre-push hook, D's underspecified `.deliverable.json` manifest from the prior draft are GONE. Replaced with concrete files at concrete paths in Workstream E (E1 ship-client.sh, E4 pre-push hook, E5 pre-commit append, E6 CI workflow). Each has a written spec.
- [ ] **No assumptions**: every "this should work" is replaced with a verification step in Workstream H.

---

## Order of execution (critical sequence)

The order matters. Doing C before B leaves cross-references temporarily broken; doing F before E leaves the rebuild without the official ship pipeline.

```
Phase 0 (gates) →
A (clients/encore/ self-containment) →
B (pipeline/ moves) →
C (cross-reference updates) →           ← runs immediately after B; fixes the breakage B introduces
D (TEMP_RUTVIK rename) →
E (ship discipline scaffolding) →       ← official ship command, hooks, CI
G (agent awareness — CLAUDE.md, BUNDLE_MANIFEST, LR-049) →   ← documentation/rules updated before any agent runs F
F (rebuild deliverable repo) →           ← uses E's ship command, audited by G's rules
H (verification end-to-end)
```

User decision points (HALT-and-ask, do not silently proceed):
- Phase 0 §3: client-collaborator status confirmation.
- Workstream F5: `s-prd-clickauto@psav.com` cred rotation y/n.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Workstream C misses a cross-reference | Medium | High (`npm test` / typecheck breaks) | C5 grep gate — strict zero hits, runs after every Workstream C step |
| Vendored output goes stale silently | Medium | High (client receives broken framework) | E2 verify-vendor-fresh + E4 pre-push hook + E5 pre-commit warn |
| Operator does `cp -r` instead of `npm run client:ship` | Medium | High (gitignored agent IP leaks) | E4 pre-push hook (LR-049 enforcement) + G1 CLAUDE.md doc + G5 LR-049 rule |
| Force-push collides with collaborator activity | Low | High (lost work) | F1 backup tag pushed before force-push |
| Per-client `.gitignore` regex misses a future agent artifact | Low | Medium (slow leak in next ship) | E3 deny-list grep is stricter than .gitignore (path-glob match); CI smoke catches drift |
| `agent-reporter.ts` ends up shipped with internal-state references | Low | Medium (subtle IP leak) | B3 explicitly keeps it framework-public; vendored output includes it but it has no internal-state references in its current code (verified) |
| Cross-platform path issues on Windows | Medium | Medium | E6 CI matrix runs Ubuntu + Windows; H5 verifies parity |

---

## Handoff (chat-only per `feedback_handoff_in_chat_only.md`, no obstacle claims per LR-039)

This plan is the design + rule-conformance gate. Execution begins on user `/execute` authorization.

The order is fixed: A → B → C → D → E → G → F → H. Each phase has its own grep-gate; no phase closes until its acceptance subset is green. Two HALT points (Phase 0 §3, Workstream F5) require explicit user input.

After `/execute` lands and `Status: DONE` flips, the parent-cascade clause in LR-027 fires: this plan has no parent (`Depends on: NONE`), so closure is terminal.

Post-execution, agents (Claude or otherwise) operating in this repo see the new structure documented in CLAUDE.md (Workstream G1), backed by LR-049 (Workstream G5), and structurally enforced by the pre-push hook (Workstream E4) + CI smoke (Workstream E6). The combination prevents recurrence of the 2026-04-30 incident: shipping framework IP to a client repo is now blocked at the structural layer, not just at the discipline layer.

---

## Appendix — files modified or created (single source of truth)

### Created

- `clients/encore/package.json`
- `clients/encore/playwright.config.ts`
- `clients/encore/playwright.config.ci.ts`
- `clients/encore/tsconfig.json`
- `clients/encore/.gitignore`
- `clients/encore/scripts/` (directory; populated by A4 moves)
- `clients/encore/specs_planning/_internal/active-experiments.md`
- `pipeline/` (entire directory, populated by B2 moves)
- `pipeline/README.md`
- `pipeline/tsconfig.json` (was `tsconfig.server.json`)
- `scripts/ship-client.sh`
- `scripts/ship-client.ps1` (PowerShell wrapper)
- `scripts/build-framework-vendor.ts`
- `scripts/build-framework-vendor-all.mjs`
- `scripts/verify-vendor-fresh.mjs`
- `scripts/verify-no-forbidden.mjs`
- `.githooks/pre-push`
- the ship-smoke workflow

### Modified

- `package.json` (scripts: server:*, worker:*, db:migrate; new: vendor:build, vendor:build:all, client:ship)
- `tsconfig.json` (no path-alias change; verify post-move)
- `tsconfig.build.json` (add exclude for safety)
- `playwright.config.ts` (D2 marker rename only — agent-reporter path stays)
- `playwright.config.ci.ts` (D2 marker rename only)
- the playwright-tests workflow (D2 marker rename + multi-paragraph block trim)
- `.githooks/pre-commit` (E5 append section)
- `.gitignore` (G2 reconcile per-client `dist/framework/` allowlist)
- `.claude/launch.json` (C3)
- `.claude/agents/RUTVIK.agent.md` (C3)
- `.claude/rules/pipeline.md` (G5 — LR-049 added)
- `BUNDLE_MANIFEST.md` (G3 full rewrite)
- `CLAUDE.md` (G1 — new Repo Structure section)
- `clients/encore/config/environments/.env.server.example` (C3 line 25)
- `clients/encore/tests/setup/auth.setup.ts` (D2 marker rename)
- `clients/encore/tests/setup/auth-storage.ts` (D2 marker rename)
- `clients/encore/tests/setup/fixtures.ts` (D2 marker rename)
- `plans/pending/PLAN_BUG_HUNTING_RULEBOOK_V2.md`, `PLAN_CHAT_UI_BUGS.md`, `PLAN_CODEBASE_CLEANUP.md`, `PLAN_FULL_CHAIN_AUDIT.md` (C4 path update)

### Moved (`git mv`)

- `src/orchestrator/` → `pipeline/orchestrator/`
- `src/server/` → `pipeline/server/`
- `src/worker/` → `pipeline/worker/`
- `src/utils/agent-notification-writer.ts` → `pipeline/utils/agent-notification-writer.ts`
- `tests/unit/agent-notification-writer.test.ts` → `pipeline/tests/unit/agent-notification-writer.test.ts`
- `tests/hooks/` → `pipeline/tests/hooks/`
- `tests/examples/` → `pipeline/tests/examples/`
- `tests/.gitkeep` → (deleted after moves)
- `tsconfig.server.json` → `pipeline/tsconfig.json`
- `scripts/healer-post-complete.ts` → `pipeline/scripts/healer-post-complete.ts`
- `config/environments/.env.local` → `clients/encore/config/environments/.env.local`
- `scripts/build-claim-vs-actual-diff.mjs` → `clients/encore/scripts/build-claim-vs-actual-diff.mjs`
- `scripts/owner-dom-walk-2026-04-29.mjs` → `clients/encore/scripts/owner-dom-walk-2026-04-29.mjs`

### Deleted (after moves complete)

- root `tests/` directory (becomes empty post-B2; remove)
- `tsconfig.server.json` (replaced by `pipeline/tsconfig.json`)

---

**End of plan. ~600 lines. Every claim verified, every cross-reference enumerated, every rule honored, every gate spec'd. Ready for `/execute` on user authorization.**

---

## Execution Summary

Plan `/execute`d under OWNER identity, then re-audited (audit-of-audit RED verdict surfaced 15 acceptance-gate misses + 3 NEW structural findings F16/F17/F18 over the original audit's F1–F15). R1 fix-pass applied 11 inline corrections; R3 commit-chain landed in 9 commits (167ed4d baseline → 503882a final). Total deviations logged: 37 rows in `clients/encore/specs_planning/_internal/PLAN_CLIENT_DELIVERABLE_REBUILD-deviations.md` (gitignored — agent-only audit trail; not in deliverable).

### Acceptance criteria status (against §A–G of plan body)

| Section | Outcome |
|---|---|
| **A** Per-client meta-files | DONE — 5 files (package.json, playwright.config.{ts,ci.ts}, tsconfig.json, .gitignore) at `clients/encore/`. Plus A2.1 added (NEW): `git rm --cached` step for legacy-tracked artifacts (F16). |
| **B** Pipeline structural rebuild | DONE — `src/{orchestrator,server,worker,utils/agent-notification-writer}/` → `pipeline/{...}/`; `tsconfig.server.json` → `pipeline/tsconfig.json`. ts-node mode PASS. tsc compilation has 5 remaining errors (4 rootDir + 1 pre-existing) → SUBPLAN_PIPELINE_TSC_HARDEN.md. |
| **C** Cross-references | DONE — strict grep (line 839, post-Q1=A 5-carve-out amendment) returns 0 hits. Plus 3 mechanical post-move imports fixed in R3.A (`pipeline/scripts/healer-post-complete.ts:20-21`, `pipeline/utils/agent-notification-writer.ts:13`). |
| **D** EXP-AUTH-STATE-SHARED rename | DONE — strict grep (line 843) returns 0 hits for `TEMP_RUTVIK_EXPERIMENT` in code. Marker context relocated to `clients/encore/specs_planning/_internal/active-experiments.md` (gitignored). |
| **E** Ship discipline (3-layer defense) | DONE — Layer 1: per-client `.gitignore` + `git rm --cached` for 82 legacy-tracked files (F16). Layer 2: 6 scripts (`vendor:build:all`, `client:ship.{sh,ps1}`, `verify-{vendor-fresh,no-forbidden}.mjs`, `build-framework-vendor-all.mjs`). Layer 3: `.githooks/{pre-push,pre-commit}` ACTIVE (`core.hooksPath=.githooks`). CI: the ship-smoke workflow (Ubuntu+Windows matrix). |
| **F** Mock-repo rebuild + force-push + local-folder delete | **NOT EXECUTED — STOP-GATE held per Auto Mode rule 5 + R3-Q5 disposition.** Destructive on shared remote (`RutviK-JBS/encore_deliverables_test:main`) + local data (`rm -rf C:/Users/rutvi/projects/encore_deliverables_test/`). Held until user authorizes. Recommended sequence: clone deliverable, tag `pre-rebuild-2026-04-30` at SHA `febff02` first, push tag, THEN force-push rebuilt main, THEN delete local clone. |
| **G** Docs + rules | DONE — `CLAUDE.md` G1 Repo-Structure section; `BUNDLE_MANIFEST.md` G3 full rewrite (Path A + 3-layer table); `LR-049` in `.claude/rules/pipeline.md` (ship-via-git-archive only); plan body amended with A2.1 + Q1=A line 839 carve-outs + audit-fix metadata rows; `SUBPLAN_PIPELINE_TSC_HARDEN.md` authored. |
| **H1** Standalone install | PASS — `cp -r` + `npm install` resolves all deps post-F17 (knex + @aws-sdk/client-s3 + proper-lockfile added); `npx playwright test --list` resolves **1310 test entries** post-F18 (testDir + glob fix). |
| **H2** Server/worker bootstrap | PASS — both `npm run server:start` and `npm run worker:start` load modules cleanly under ts-node; runtime checks (DB, Claude CLI auth) fail as expected in dev env. **Note**: `npm run build:server` (tsc compile mode) blocked on rootDir architecture → SUBPLAN_PIPELINE_TSC_HARDEN. |
| **H3** Idempotency | PASS — `diff -r --exclude='reports' --exclude='node_modules' --exclude='.auth' --exclude='package-lock.json' /tmp/encore-d1 /tmp/encore-d2` returns exit 0 (byte-identical shipped output across consecutive `npm run client:ship` runs). |
| **H4** Deny-list defense | PASS — caught in flight at first commit (build-claim-vs-actual-diff.mjs personal identifier, deviation #33), at second commit (verifier self-reference, deviation #34). All 3 layers exercised live. |
| **H5** CI smoke | NOT YET TRIGGERED (no PR open) — the ship-smoke workflow will fire on next PR touching `src/`/`pipeline/`/`clients/`/`scripts/`/`package.json`/`tsconfig*`. |

### Commit chain (9 commits)

1. `167ed4d` — pre-execute baseline snapshot
2. `bbed318` — chore: anchor root /dist/ + scrub personal identifier in moved diff script (also absorbed all staged moves + F16 untracks)
3. `52e8466` — feat: per-client encore meta + post-move imports + build-server schema copy
4. `3c1e3c5` — refactor: rename TEMP_RUTVIK_EXPERIMENT marker → EXP-AUTH-STATE-SHARED
5. `a14d5c5` — feat: vendor-build + ship-client + verify scripts + hooks + CI smoke
6. `0456f61` — docs+rule: CLAUDE.md repo-structure, BUNDLE_MANIFEST rewrite, LR-049, plan amendments
7. `dae441f` — build: vendor encore framework (19 files) — initial population
8. `183d1c4` — fix: add knex + @aws-sdk/client-s3 to encore per-client deps (F17)
9. `74bd4fb` — fix: add proper-lockfile (F17 cont.)
10. `503882a` — fix: add explicit testDir + drop ./ prefix from testMatch glob (F18)

### Deferred to follow-up

- **Workstream F** (force-push + local rm): held pending user authorization (R3-Q5).
- **Pipeline tsc compilation**: `SUBPLAN_PIPELINE_TSC_HARDEN.md` (in `plans/pending/`) handles the rootDir architecture decision (3 candidate paths B/C/D with criteria). Pre-existing `pipeline/worker/progress-extractor.ts:85 'never'` error included in subplan Phase 2.5.
- **CI smoke first run**: will trigger automatically on next PR matching path-filter.

### Calibration notes

`feedback_halt_discipline.md` (NEW memory entry, 2026-05-01) — calibrated by Rutvik mid-flow: HALT for scope/ambiguity, NOT for 1-line obvious fixes; checkpoint at end of work block, not at every typecheck error. Applied throughout R3: 7 inline 1-line/few-line fixes (Fix B, R3.A imports ×3, R3.B hook quote, F17×2, F18, R3 commit-1 scrub, R3 commit-4 self-exclusion) all logged as deviation rows rather than mid-flow halts. 3 genuine HALTs surfaced as proper findings (F16, F17, F18) at coherent breakpoints.
