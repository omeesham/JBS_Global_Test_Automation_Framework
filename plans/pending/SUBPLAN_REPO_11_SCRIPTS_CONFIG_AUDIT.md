# SUBPLAN: Scripts, Config & Root Files Audit

**Status**: PENDING
**Priority**: P2
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Excludes**: website/, node_modules/ — out of scope per user directive.

---

## Goal

Audit every script, config file, and root-level file for dead code, stale references, and unnecessary artifacts. Scripts and config are where AI agents dump one-off utilities that never get cleaned up.

## Scope

### scripts/ (~15+ TypeScript files)
- sync-agent-mistakes.ts, validate-agent-sync.ts — agent pipeline tooling
- plans-reindex.mjs — plan index regeneration
- Various export, validate, build scripts
- **Check**: which scripts are referenced in package.json? Which are orphaned?
- **Check**: duplicated logic between scripts (sync vs validate vs export may overlap)

### config/
- `config/allure/` — allure categories config
- `config/environments/` — .env files (.env.development, .env.example, .env.server.example)
- **Check**: are all config files still relevant? Stale environment vars?

### Root config files
- `tsconfig.json`, `tsconfig.build.json` — are both needed? Do they conflict?
- `jest.config.ts` — is Jest used anywhere or is it dead (Playwright is the test runner)?
- `docker-compose.yml` — what does it run? Is it for the dead website/?
- `render.yaml` — deployment config for what service?
- `start*.sh` scripts — what do they start? Still relevant?
- `package.json` — audit scripts section: which npm scripts are dead?

### .gitignore
- Are all junk directories covered (allure-*, .playwright-mcp/, .tmp/, logs/, dist/)?
- Any missing patterns that should be ignored?

## What to Look For

1. **Dead scripts**: defined in scripts/ but not referenced in package.json and not used by any agent or CI
2. **Stale config**: references to things that no longer exist (old paths, old services)
3. **Dead root files**: config for features/services that are dead (docker for dead website? render.yaml for dead deployment?)
4. **Package.json bloat**: unused dependencies, dead npm scripts, stale metadata
5. **Redundant config**: multiple tsconfig files when one would do

## Direction

Start with `package.json` scripts section — cross-reference each script name against the scripts/ directory. Then audit root config files against what's actually used. Session has freedom to delete dead files and consolidate.

## Verification

- `npm run typecheck` — still passes
- `npm run clean` — still works
- All remaining npm scripts in package.json actually execute without error
