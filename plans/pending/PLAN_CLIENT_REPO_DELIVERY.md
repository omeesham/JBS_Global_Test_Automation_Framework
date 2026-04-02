# MEGA PLAN: Client Repo Delivery — Triple-Audited

## Context

**Business model:** We build + maintain Playwright test automation. Client runs tests in CI, gets reports (HTML for humans, JUnit/JSON/Allure for AI/RCA/tech). We push versioned updates; they pull and run. We protect IP (agent pipeline, skills, website).

**Problem:** `client-package.ts` has critical gaps: leaks entire dist/ (pipeline engine included), fixtures missing page objects, internal references in scripts, stale paths from directory restructure.

**This plan was:**
1. Created from the original PLAN_CLIENT_REPO_DELIVERY.md (14-task plan)
2. Scoped via decision questionnaire with Rutvik (8 steering decisions)
3. Adversarially audited by Copilot agent (22 issues found)
4. Counter-audited by Claude Code (verified each claim, found 3 Copilot errors, 2 new findings)
5. Updated post-P0-decontamination commit (f721e15) — directory restructure confirmed

---

## Critical Findings from Triple Audit

### CONFIRMED CRITICAL (addressed in this plan)

| # | Finding | Evidence | Impact |
|---|---------|----------|--------|
| **C1** | **dist/ is STALE** — `dist/pages/setup/` doesn't exist | `ls dist/pages/` shows flat files, no `setup/` subdir. Source moved to `src/pages/setup/` (commit f721e15) but tsc wasn't rerun | **Clean build MANDATORY before packaging. Add guardrail.** |
| **C3** | **Client fixtures have session reuse; main doesn't** | Client: `SessionManager.isSessionValid()` + storageState reuse (saves 20s). Main: fresh login + diagnostics + retry logic + beforeunload skip flag | **MERGE features, don't replace. Keep session reuse, add page fixtures + diagnostics + retry + skip flag.** |
| **C4** | **dist/index.js exports DbAdapter + S3Adapter** at import time | Lines 38-41: `require('./data/adapters/dbAdapter')` which `require('pg')` | **Barrel rewrite MUST happen BEFORE dep trimming. Hard ordering dependency.** |
| **H6** | **allure deps not in root package.json** | `grep allure package.json` = only in clean script text | **Must explicitly add `allure-commandline` + `allure-playwright` to client devDeps** |
| **H8** | **lint/format in CLIENT_SCRIPTS but no eslint/prettier** | Lines 88-89 of client-package.ts | **Remove lint + format from CLIENT_SCRIPTS** |
| **NEW1** | **SELECTOR_CATALOG.md copied to src/selectors/** | COPY_FILES line 62 — client has no src/ dir | **Fix dest path or remove** |
| **NEW2** | **Depth 4 imports may not be rewritten** | Specs at `tests/specs/setup/locations/` — if any import `../../../../src/`, depth-3 rewrite misses it | **Add depth-4 rewrite pattern or verify no direct src imports from specs** |

### COPILOT AUDIT CLAIMS THAT WERE WRONG

| # | Claim | Reality |
|---|-------|---------|
| C2 | "8 specs not 11" | 8 location + 3 local-office = **11 total** (correct) |
| H1 | "upload-to-sharepoint.ts doesn't exist" | **EXISTS** at `client-delivery/scripts/upload-to-sharepoint.ts` |
| M6 | "pino-pretty may crash" | **NOT USED** — logger.js doesn't import pino at all |

---

## Decisions Made (Questionnaire with Rutvik)

| Decision | Answer | Rationale |
|----------|--------|-----------|
| Delivery model | Ongoing — we maintain, they use | Client uses to find bugs automatically, they don't write tests |
| CI | Ship all existing templates + create GitHub Actions | Don't know their CI yet, cover all bases |
| SharePoint | REMOVE entirely | Was for a different client |
| Obfuscation | NO — rapid delivery | Protection is in business model, not code obfuscation |
| eslint/prettier | NO — client doesn't code | We maintain, they run |
| Reports | ALL formats (HTML + Allure + JUnit + JSON) | HTML for humans, rest for AI/RCA/tech people |
| LICENSE | Proprietary | We protect our methodology |
| CHANGELOG | Skip for v1 | Add on second update push |

---

## Execution Plan (10 Tasks)

### Task 1: Clean Build + Selective dist/ Copy
**File:** `scripts/client-package.ts`

**Step 1a: Force clean build (C1 fix)**
- Before copying dist/, run `rimraf dist && npx tsc -p tsconfig.build.json`
- After build, VERIFY `dist/pages/setup/locations/` exists — fail fast if missing
- If `--skip-build` flag is used, still verify structure exists

**Step 1b: Whitelist dist/ directories**
Replace blanket `{ src: 'dist', dest: 'dist' }` with:
```typescript
const CLIENT_DIST_DIRS = [
  'common',              // base-page, credential-loader, ui-common, session-manager
  'pages',               // login, home, setup/locations/*, setup/local-office/*
  'selectors',           // all selectors (static + dynamic + setup/)
  'utils',               // logger, common-methods, app-constants, file-utils, diagnostics-collector
  'security',            // vault (AES-256-GCM)
  'data',                // adapters (Excel + JSON only)
  'framework-contracts', // IConfig, diagnostics types
];
```

**Step 1c: Delete IP from copied dist/**
```typescript
const DIST_DELETE_AFTER_COPY = [
  'utils/agent-reporter*',
  'utils/agent-notification-writer*',
  'utils/bug-hunt-classifier*',
  'utils/dom-diff*',
  'data/adapters/dbAdapter*',
  'data/adapters/s3Adapter*',
];
```

**Step 1d: Generate client-safe barrel (C4 fix)**
Generate new `dist/index.js` + `dist/index.d.ts` that ONLY exports:
- LoginPage, HomePage, all setup/locations pages, LocalOfficeSettingsPage
- BasePage, CredentialLoader, UiCommon, SessionManager
- Log, Logger, CommonMethods, AppConstants, FileUtils
- getTsSelector, ALL_SELECTORS, MicrosoftLoginSelectors, SetupSelectors, DynamicSelectors
- Vault, AdapterFactory, ExcelAdapter, JsonAdapter
- DiagnosticsCollector, attachDiagnostics
- **EXCLUDE:** DbAdapter, S3Adapter (they require pg/@aws-sdk at import time)

**CRITICAL:** This barrel rewrite MUST complete BEFORE Task 7 (dep trimming).

---

### Task 2: MERGE Client Fixtures (C3 fix — don't replace)
**File:** `client-delivery/tests/setup/fixtures.ts`

**Strategy: ADD page fixtures to existing client fixtures while KEEPING session reuse.**

The client-delivery fixtures.ts already has:
- Session reuse via SessionManager (saves 20+ seconds per worker)
- loginPage, homePage, commonMethods, config
- Simple but effective auth flow

The main repo fixtures.ts (post-P0-decontamination) has:
- 9 page object fixtures (8 location + 1 local-office)
- diagnosticsHandler (auto-use) for failure capture
- beforeunload dialog handler with skip flag (`__skipBeforeunloadAutoAccept`)
- Login retry logic (MAX_LOGIN_ATTEMPTS = 2, with cookie clearing between attempts)
- Dashboard heading wait with timeout diagnostics

**Merge approach:**
1. Keep client-delivery's session reuse logic (SessionManager.isSessionValid/getStorageState)
2. Add all 9 page object fixtures from main repo
3. Add diagnosticsHandler auto-use fixture
4. Add beforeunload dialog handler WITH skip flag to session creation
5. Add login retry logic (2 attempts) to fresh-session path
6. Add Dashboard heading wait to session validation
7. Import paths: `../../dist/pages/setup/locations/...` and `../../dist/pages/setup/local-office/...`
8. Strip @agent-doc block from top

**Page fixtures to add (9 total):**
```typescript
// From dist/pages/setup/locations/
locationCurrencyPage, locationLocalInfoPage, locationPricingPage,
locationAccountAddressPage, locationNotesPage, locationLegalPage,
locationSharedSetupLocationsPage, locationAutoAddonPage
// From dist/pages/setup/local-office/
localOfficeSettingsPage
```

Each uses `authenticatedSession.page` (not bare `page`) per main repo pattern.

---

### Task 3: vault-manager + cleanup-logs + SELECTOR_CATALOG fixes
**Files:** `scripts/client-package.ts`, `client-delivery/scripts/cleanup-logs.ts`

**3a: Add vault-manager.ts to COPY_FILES:**
```typescript
{ src: 'client-delivery/scripts/vault-manager.ts', dest: 'scripts/vault-manager.ts' },
```

**3b: Fix cleanup-logs.ts** — create client-safe version:
- Remove reference to `specs_planning/agent-activity-log.md`
- Keep ONLY: `logs/` cleanup (10,000 line limit) + `reports/` cleanup
- Remove any other internal paths

**3c: Fix SELECTOR_CATALOG.md copy (NEW1):**
- Change `{ src: 'src/selectors/SELECTOR_CATALOG.md', dest: 'src/selectors/SELECTOR_CATALOG.md' }` to `dest: 'dist/selectors/SELECTOR_CATALOG.md'` or remove entirely (client doesn't need selector docs)

---

### Task 4: Strip @agent-doc + Internal Comments
**File:** `scripts/client-package.ts`

Add `stripInternalComments(dir: string)` function. Runs AFTER import rewriting on all .ts files in output dir.

Patterns to strip:
```typescript
const STRIP_PATTERNS = [
  /\/\*\*[\s\S]*?@agent-doc[\s\S]*?\*\//g,  // Multi-line @agent-doc blocks
  /\/\/\s*RCA\s+\d{4}-\d{2}-\d{2}:.*$/gm,   // RCA date comments
  /\/\/\s*\(LRN-\d+\).*$/gm,                 // LRN references
  /\(LRN-\d+\)/g,                              // Inline LRN refs
  /\/\/\s*OWNER:.*$/gm,                        // OWNER lines
  /\/\/\s*IMPACT:.*$/gm,                       // IMPACT lines
  /\/\/\s*R\d+\s+exception.*$/gm,             // R-exception comments
  /\/\/\s*ALL-\d+.*$/gm,                       // ALL-* enforcement comments
  /\/\/\s*MOD-\d+.*$/gm,                       // MOD-* module comments
];
```

**Note:** dist/ files are already comment-free (TypeScript compiler strips them via `removeComments: true` in tsconfig.build.json). This task handles the .ts SOURCE files copied to tests/ and scripts/.

---

### Task 5: Remove SharePoint Entirely
**Files:** `client-delivery/scripts/upload-to-sharepoint.ts`, `scripts/client-package.ts`, `.env.example`

1. Delete `client-delivery/scripts/upload-to-sharepoint.ts` (confirmed EXISTS)
2. Remove SharePoint section from `.env.example` AFTER copying to output (NOT from root)
3. Remove SharePoint references from Jenkinsfile post-stages (if present)

---

### Task 6: Expand mustNotExist + IP Content Scan
**File:** `scripts/client-package.ts`

**6a: Expand mustNotExist to 30+ paths:**
```typescript
const mustNotExist = [
  // IP directories
  'src', 'specs_planning', '.github/agents', 'export_test_cases', 'tests/examples',
  '.claude', 'plans', 'website', 'api-testing',
  'dist/orchestrator', 'dist/server', 'dist/worker', 'dist/integrations',
  // IP files
  'CLAUDE.md', 'docker-compose.yml', 'render.yaml', 'jest.config.ts',
  'tsconfig.build.json', 'tsconfig.server.json',
  '.github/copilot-instructions.md',
  'dist/utils/agent-reporter.js', 'dist/utils/agent-notification-writer.js',
  'dist/utils/bug-hunt-classifier.js', 'dist/utils/dom-diff.js',
  'dist/data/adapters/dbAdapter.js', 'dist/data/adapters/s3Adapter.js',
  // Config
  'config/pipeline-config.json', 'config/pipeline-definition.json',
  'config/context-builder-prompts.json', 'config/mcp',
  'config/environments/.env.server.example',
  // Docs
  'docs/read_only_docs/AGENT_SHARED_RULES.md',
  'docs/read_only_docs/FIX_DIAGNOSIS_TEMPLATE.md',
  'docs/read_only_docs/MCP_BROWSER_GUIDE.md',
  'docs/REQUIREMENTS.md', 'docs/MODULE_REGISTRY.md',
];
```

**6b: Remove `seed.spec.ts` from mustNotExist** — client NEEDS the auth smoke test.

**6c: Add IP content scan:**
Grep ALL .ts/.js/.json/.md files in output for:
```typescript
const IP_PATTERNS = [
  '@agent-doc', 'pipeline-orchestrator', 'pipeline-definition',
  'agent-mistakes', 'agent-notification', 'agent-reporter',
  'HUNTER', 'GIVER', 'GARDENER', 'WATCHDOG',
  'specs_planning', 'AGENT_SHARED_RULES',
  'IntelliQE', 'context-builder-prompts',
  'sdk-executor', 'worker-manager',
  'healer-pre-run', 'generator-pre-run', 'planner-pre-run',
];
```
FAIL packaging if ANY pattern found in output.

---

### Task 7: Trim Dependencies
**File:** `scripts/client-package.ts` → `generateClientPackageJson()`

Replace blanket dep copy with explicit whitelist:

**dependencies:**
```json
{
  "dotenv": "^16.3.1",
  "dotenv-flow": "^4.1.0",
  "otplib": "^12.0.1",
  "xlsx": "^0.18.5",
  "axios": "^1.13.4"
}
```

**devDependencies:**
```json
{
  "@playwright/test": "^1.58.2",
  "@types/node": "^20.10.0",
  "allure-commandline": "^2.25.0",
  "allure-playwright": "2.15.1",
  "rimraf": "^5.0.5",
  "ts-node": "^10.9.2",
  "typescript": "^5.3.3"
}
```

**REMOVED from deps:** `pg`, `knex`, `@aws-sdk/client-s3`, `zod`
**REMOVED from devDeps:** `@types/pg`, `pino-pretty`, `eslint`, `@typescript-eslint/*`, `prettier`
**ADDED explicitly:** `allure-commandline`, `allure-playwright` (not in root package.json — H6 fix)

**Also: Remove lint + format from CLIENT_SCRIPTS (H8 fix):**
Delete `lint` and `format` entries from CLIENT_SCRIPTS object.

**ORDERING CONSTRAINT:** Task 1d (barrel rewrite) MUST complete before this task runs. The barrel must NOT export DbAdapter/S3Adapter before we remove pg/@aws-sdk.

---

### Task 8: Fix Test + Data Coverage (New Paths)
**File:** `scripts/client-package.ts`

Update COPY_DIRS tests entry. Current: `{ src: 'tests', dest: 'tests', exclude: ['examples'] }`.

Ensure these paths are all copied:
- `tests/specs/setup/locations/` — 8 spec files
- `tests/specs/setup/local-office/` — 3 spec files
- `tests/specs/navigator/` — navigator-login.spec.ts
- `tests/test-data/setup/locations/` — 8 data files
- `tests/test-data/setup/local-office/` — 1 data file
- `tests/test-data/common.data.ts`
- `tests/seed.spec.ts` — auth smoke test
- `tests/setup/` — fixtures, global-setup, global-teardown, custom-matchers

**Exclude:** `tests/examples/`, `tests/unit/`

**Add depth-4 import rewrite (NEW2 fix):**
```typescript
// tests/specs/setup/locations/** or tests/specs/setup/local-office/** -- depth 4
{ pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/src\//g, replacement: "from '../../../../dist/" },
```
Add BEFORE existing depth-3 pattern (more specific patterns must come first).

---

### Task 9: Smoke Test + GitHub Actions CI
**Files:** `scripts/client-package.ts`, `client-delivery/.github/workflows/playwright-tests.yml`

**9a: Add smoke test after validation:**
```typescript
console.log('Step 8/8: Smoke testing client package...');
execSync('npm install --ignore-scripts', { cwd: outDir, stdio: 'inherit' });
execSync('npx tsc --noEmit', { cwd: outDir, stdio: 'inherit' });
```
This catches: broken imports, missing types, dep resolution failures, unrewritten src/ paths.

**9b: Create GitHub Actions workflow:**
```yaml
name: Playwright Tests
on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [development, staging, production]
  schedule:
    - cron: '0 2 * * *'  # Nightly 2 AM UTC
  push:
    branches: [main]
    paths: ['dist/**', 'tests/**', 'playwright.config.ts']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Create .env.local from secrets
        run: |
          echo "VAULT_PASSPHRASE=${{ secrets.VAULT_PASSPHRASE }}" > config/environments/.env.local
      - run: npx playwright test --project=chrome
        env:
          CI: true
          NODE_ENV: ${{ inputs.environment || 'development' }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: |
            reports/html-report/
            reports/allure-results/
            reports/junit-results.xml
            reports/test-results.json
          retention-days: 30
```

**9c: Fix existing Azure pipeline triggers:**
Change `src/**` → `dist/**` + `tests/**` in `.ci/azure-pipelines.yml`.

**9d: Ship existing CI templates** — Jenkins (Ubuntu + Windows) + Azure already exist in `.ci/`.

---

### Task 10: LICENSE + version.json + Scrub .env
**Files:** Multiple in client-delivery/

**10a: LICENSE (proprietary):**
```
Proprietary and Confidential.
Encore Test Automation Framework developed by [Company Name].
Unauthorized reproduction, distribution, or reverse engineering prohibited.
Framework provided under service agreement. Client receives compiled
framework (dist/) and test specifications. Source code remains property
of [Company Name].
```

**10b: version.json** — generated by client-package.ts:
```json
{
  "framework": "Encore Test Automation",
  "version": "1.0.0",
  "buildDate": "<ISO timestamp>",
  "playwright": "<version from package.json>"
}
```

**10c: Scrub .env.example** — AFTER copying from root to output (NOT on root):
- Remove: Database section, S3 section, SharePoint section
- Keep: environment ID, app URLs, timeouts, Navigator credentials (vault), feature flags, retry/browser, logging, downloads

**10d: Clean stale testIgnore** in playwright.config.ci.ts:
- Remove `**/src/data/adapters/__tests__/**` (no src/ in client)
- Remove `**/api-testing/**` (not shipped)

---

## Execution Order (with dependency arrows)

```
Task 1 (clean build + selective dist + barrel rewrite)
  ↓ barrel must exist before dep trim
Task 2 (merge client fixtures — add pages + diagnostics + retry, keep session reuse)
Task 3 (vault + cleanup-logs + SELECTOR_CATALOG fix)
Task 4 (strip @agent-doc + internal comments)
Task 5 (remove SharePoint script + refs)
Task 6 (expand validation + IP content scan)
  ↓ barrel rewrite done, safe to trim deps
Task 7 (trim deps + remove lint/format scripts)
Task 8 (fix test coverage paths + add depth-4 rewrite)
Task 9 (smoke test + GitHub Actions CI + Azure fix)
Task 10 (LICENSE + version.json + scrub .env)
```

Tasks 2-6 can run in parallel after Task 1. Task 7 MUST wait for Task 1d.

---

## Files Modified/Created

| File | Action | Tasks |
|------|--------|-------|
| `scripts/client-package.ts` | Major rewrite — selective dist, barrel, deps, validation, comment strip, smoke test | 1,3,4,5,6,7,8,9,10 |
| `client-delivery/tests/setup/fixtures.ts` | MERGE (add 9 page fixtures + diagnostics + retry + skip flag, keep session reuse) | 2 |
| `client-delivery/scripts/cleanup-logs.ts` | Strip internal path refs | 3 |
| `client-delivery/scripts/upload-to-sharepoint.ts` | **DELETE** | 5 |
| `client-delivery/.github/workflows/playwright-tests.yml` | **NEW** — GitHub Actions CI | 9 |
| `client-delivery/.ci/azure-pipelines.yml` | Fix triggers `src/**` → `dist/**` + `tests/**` | 9 |
| `client-delivery/config/environments/.env.example` | Scrub internal sections (in output only, not root) | 10 |
| `client-delivery/LICENSE` | **NEW** — proprietary terms | 10 |
| `client-delivery/playwright.config.ci.ts` | Clean stale testIgnore paths | 10 |

---

## Verification Checklist

1. `npx ts-node scripts/client-package.ts` — completes all steps + smoke test passes
2. In output: `npx tsc --noEmit` — 0 errors
3. In output: `npx playwright test --list` — shows 12+ spec files (8 location + 3 local-office + 1 navigator + seed)
4. In output: `grep -r "@agent-doc" . --include="*.ts"` — 0 matches
5. In output: `grep -r "pipeline-orchestrator\|HUNTER\|GIVER\|specs_planning" .` — 0 matches
6. Verify dirs DON'T exist: `dist/orchestrator/`, `dist/server/`, `dist/worker/`, `dist/integrations/`, `.claude/`, `plans/`, `specs_planning/`
7. Verify `dist/index.js` does NOT export `DbAdapter` or `S3Adapter`
8. Verify `dist/pages/setup/locations/` and `dist/pages/setup/local-office/` exist in output
9. Verify `seed.spec.ts` DOES exist in output
10. Verify `upload-to-sharepoint.ts` does NOT exist in output
11. Verify `lint` and `format` NOT in output package.json scripts
12. Verify `allure-commandline` and `allure-playwright` ARE in output devDependencies
13. Verify fixtures.ts has session reuse + all 9 page fixtures + retry logic + beforeunload skip flag
14. File count: ~95-110 (not 500+)

---

## Items NOT Doing (with rationale)

| Item | Why Skipped |
|------|-------------|
| JS obfuscation | Rapid delivery; protection via business model, not code obfuscation |
| eslint/prettier configs | Client doesn't modify code — we maintain, they run |
| api-testing/ directory | Client doesn't write tests |
| CHANGELOG.md | Not needed for v1; add on second update push |
| New CI templates from scratch | Ship existing Jenkins + Azure; only CREATE GitHub Actions |
| package-lock.json generation | Generated by `npm install` during smoke test step |
| @anthropic-ai/sdk removal | Not installed (confirmed — Copilot audit claim C5 was correct but no-op) |

---

## Audit Trail

| Audit | By | Findings | Status |
|-------|-----|---------|--------|
| Original plan | Claude Code + GitHub Copilot Planner merge | 14 tasks, 3 critical blockers | ✅ Incorporated |
| Decision questionnaire | Rutvik (8 steering decisions) | Scoped to 10 tasks, cut obfuscation/eslint/changelog | ✅ Applied |
| Adversarial audit | Copilot agent | 22 issues (6C, 8H, 8M) | ✅ Verified — 3 claims wrong, 19 valid |
| Counter-audit | Claude Code | Verified all 22, found 2 additional issues | ✅ All addressed |
| Staleness check | Claude Code (2026-03-27) | P0 decontamination committed (f721e15), fixtures updated with retry + skip flag | ✅ Plan updated |
