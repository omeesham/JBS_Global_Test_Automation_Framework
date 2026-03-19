# PLAN 22 — Base URL Migration to cloudapps-e2e.encoreglobal.com

**Created**: 2026-03-10
**Status**: DONE 2026-03-11 (executed by Copilot, audited by Claude Code)
**Priority**: P0
**Estimated Impact**: 15 files modified, 0 files created/deleted

---

## Context

The Encore team has deployed Navigator Cloud to a new E2E QA environment:

- **Old URL**: `https://ca-nginx-dev.proudmoss-1eeb612c.centralus.azurecontainerapps.io/navigator/`
- **New URL**: `https://cloudapps-e2e.encoreglobal.com/`

Tests, features, and application behavior remain identical. This is a deployment URL change only.

---

## CRITICAL QUESTION — Must Resolve Before Execution

**Does the new URL still require the `/navigator/` path prefix?**

The old URL was: `https://ca-nginx-dev.proudmoss-1eeb612c.centralus.azurecontainerapps.io/navigator/`

Possibilities:
- **Option A**: New URL is `https://cloudapps-e2e.encoreglobal.com/` (no `/navigator/` — app is at root)
- **Option B**: New URL is `https://cloudapps-e2e.encoreglobal.com/navigator/` (same path prefix)

This affects **every URL** — `BASE_URL`, `HOME_URL`, `API_BASE_URL`, and all test plans.

**ACTION**: Navigate to `https://cloudapps-e2e.encoreglobal.com/` in browser before execution to verify path structure. If `/navigator/` auto-redirects or is part of the path, include it. If the app loads at root, omit it.

**For this plan, we assume Option A (no `/navigator/` prefix) based on the user-provided URL. If wrong, add `/navigator/` to all new URLs below.**

---

## Files to Change — Complete Inventory

### TIER 1: Configuration (breaks tests if wrong)

| # | File | Lines | Old Value | New Value |
|---|------|-------|-----------|-----------|
| 1 | `playwright.config.ts` | 89 | `https://ca-nginx-dev.proudmoss-1eeb612c.centralus.azurecontainerapps.io/navigator/` | `https://cloudapps-e2e.encoreglobal.com/` |
| 2 | `config/environments/.env.development` | 12-14 | BASE_URL, HOME_URL, API_BASE_URL (old domain) | New domain equivalents |
| 3 | `config/environments/.env.staging` | 12-14 | Same | Same |
| 4 | `config/environments/.env.production` | 13-15 | Same | Same |
| 5 | `config/environments/.env.example` | 23-25 | Same | Same |
| 6 | `config/environments/.env.local` | 5-7 | Same | Same |
| 7 | `client-delivery/playwright.config.ts` | 88 | Same hardcoded fallback | New URL |
| 8 | `client-delivery/config/environments/.env.example` | 23-25 | Same | Same |

**URL Mapping (per env file):**
```
OLD: BASE_URL=https://ca-nginx-dev.proudmoss-1eeb612c.centralus.azurecontainerapps.io/navigator/
NEW: BASE_URL=https://cloudapps-e2e.encoreglobal.com/

OLD: HOME_URL=https://ca-nginx-dev.proudmoss-1eeb612c.centralus.azurecontainerapps.io/navigator/locations/1604/home
NEW: HOME_URL=https://cloudapps-e2e.encoreglobal.com/locations/1604/home

OLD: API_BASE_URL=https://ca-nginx-dev.proudmoss-1eeb612c.centralus.azurecontainerapps.io/navigator/api/v1
NEW: API_BASE_URL=https://cloudapps-e2e.encoreglobal.com/api/v1
```

### TIER 2: Documentation (misleads agents/humans if stale)

| # | File | Lines | What to Change |
|---|------|-------|----------------|
| 9 | `docs/REQUIREMENTS.md` | 7 | Target Application link text + URL |
| 10 | `specs_planning/test-plans/locations/locations_local_information_test_plan.md` | 8, 282 | Hardcoded full URLs in test plan |

### TIER 3: Agent Activity Logs (historical — update selectively)

| # | File | Lines | Decision |
|---|------|-------|----------|
| 11 | `specs_planning/_internal/agent-activity-log.md` | 20-22 | **DO NOT CHANGE** — historical log entries, changing them falsifies the record |
| 12 | `specs_planning/_internal/agent-mistakes.md` | 101, 113 | **DO NOT CHANGE** — these reference `{BASE_URL}` pattern, not hardcoded URLs |
| 13 | `specs_planning/audits/archive/*.md` | various | **DO NOT CHANGE** — archived audits referencing old `navigator4.training.psav.com` URLs are historical |

### TIER 4: Code (dynamic — verify only, no changes needed)

These files read `BASE_URL` from environment/config at runtime. No code changes needed — once env files are updated, these work automatically:

| File | How it uses URL |
|------|----------------|
| `src/utils/common-methods.ts:31` | `process.env.BASE_URL \|\| ''` |
| `src/pages/login.page.ts:35` | `this.config?.base_url \|\| process.env.BASE_URL` |
| `src/pages/home.page.ts:32` | `new URL(this.config?.base_url).hostname` |
| `src/pages/locations/location-pricing.page.ts:49` | `this.config?.base_url` |
| `src/pages/locations/location-local-info.page.ts:66` | `this.config?.base_url` |
| `src/common/base-page.ts:332` | `this.config?.base_url` |
| `tests/setup/global-setup.ts:89` | `process.env.BASE_URL` |
| `tests/setup/fixtures.ts:77` | `config.base_url` |
| `tests/seed.spec.ts:14` | `config.base_url` |
| `scripts/generator-pre-run.ts:77` | Checks env files contain `BASE_URL` |
| `scripts/requirements-pre-run.ts:67` | Checks env files contain `BASE_URL` |

### TIER 5: Unrelated URLs (DO NOT TOUCH)

| URL | Where | Why Leave Alone |
|-----|-------|-----------------|
| `login.microsoftonline.com` | 7+ files | Microsoft SSO endpoint — completely separate |
| `jsonplaceholder.typicode.com` | `jsonAdapter.spec.ts` | Test fixture URL |
| `demo.us.espocrm.com` | `api-testing/` | Separate EspoCRM API testing |
| `encore-api.onrender.com` | plans only | Demo website (PLAN_20/21) |
| npm registry URLs | `package-lock.json` | Package manager managed |

---

## Execution Steps

### Step 1: Verify New URL (PRE-FLIGHT)

Before making any changes:
1. Navigate to `https://cloudapps-e2e.encoreglobal.com/` in browser
2. Confirm the app loads (check if it redirects to `/navigator/` or stays at root)
3. Confirm Microsoft SSO still works on new domain
4. Note the exact URL after login (this determines HOME_URL path)

### Step 2: Update Config Files (8 files)

Update all environment files and playwright configs with new URLs. Single find-and-replace operation:

```
FIND:    ca-nginx-dev.proudmoss-1eeb612c.centralus.azurecontainerapps.io/navigator
REPLACE: cloudapps-e2e.encoreglobal.com
```

**Files**: `playwright.config.ts`, `client-delivery/playwright.config.ts`, all 5 `.env.*` files, `client-delivery/.env.example`

### Step 3: Update Documentation (2 files)

- `docs/REQUIREMENTS.md` line 7: Update link text and URL
- `specs_planning/test-plans/locations/locations_local_information_test_plan.md` lines 8, 282: Update hardcoded URLs

### Step 4: Smoke Test

Run `seed.spec.ts` to verify:
```bash
npx playwright test tests/seed.spec.ts --headed
```

Expected: Login succeeds, lands on home page, no `login.microsoftonline.com` in final URL.

### Step 5: Update Memory

Update `MEMORY.md` to reflect new URL if tests pass.

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| `/navigator/` path needed but omitted | **HIGH** | Step 1 browser verification resolves this |
| Microsoft SSO not configured for new domain | **MEDIUM** | Azure AD app registration may need new redirect URI — outside our control, verify in Step 1 |
| API endpoints on different path | **LOW** | Same app, same API — path structure unchanged |
| CI/CD still using old URL via env vars | **MEDIUM** | Jenkins env vars need updating separately (not in this repo) |
| `.env.local` is gitignored — developers must update locally | **LOW** | We update the template; devs follow |

---

## What We Are NOT Changing (and Why)

1. **Historical logs** (`agent-activity-log.md`) — falsifies the record
2. **Archived audits** (`specs_planning/audits/archive/`) — historical reference
3. **Agent mistake entries** — use `{BASE_URL}` pattern, not hardcoded
4. **Microsoft SSO URLs** — different service entirely
5. **API testing URLs** (EspoCRM) — different application
6. **Demo/SaaS URLs** (Render/Vercel) — different project
7. **Runtime code** — reads from env vars dynamically, no hardcoded URLs
8. **package-lock.json** — npm registry URLs, unrelated
9. **Done plan files** — marked "do not modify" per INDEX.md policy

---

## Validation Checklist (Post-Execution)

- [ ] `grep -r "ca-nginx-dev" config/ playwright.config.ts client-delivery/ docs/REQUIREMENTS.md` returns 0 results
- [ ] `grep -r "proudmoss" config/ playwright.config.ts client-delivery/` returns 0 results
- [ ] `seed.spec.ts` passes with new URL
- [ ] `playwright.config.ts` fallback URL is correct
- [ ] All 5 env files have consistent BASE_URL, HOME_URL, API_BASE_URL
- [ ] `docs/REQUIREMENTS.md` target application link works
- [ ] Historical files (agent-activity-log, archived audits) remain unchanged
