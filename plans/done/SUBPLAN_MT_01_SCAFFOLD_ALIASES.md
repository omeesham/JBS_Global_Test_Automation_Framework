# SUBPLAN MT-01: Scaffold + Aliases + Config Shim (No File Moves)

**Status**: PENDING
**Priority**: P0
**Parent**: PLAN_MULTI_TENANT_RESTRUCTURE
**Created**: 2026-04-16
**Depends on**: none (first in the chain)
**Blocks**: SP-MT-02

---

## Goal

Lay foundation for multi-tenant structure. Create `clients/encore/` directory skeleton, add TypeScript path aliases, wire `ACTIVE_CLIENT` env var. **Zero behavior change** — every spec runs from its current location, the pipeline runs as before.

This subplan must be runnable as a no-op from the outside: `npm test` and every pipeline script should produce identical output before and after this session.

---

## Scope

### 1. Directory scaffold (empty, just mkdir)
Create the following empty directory tree (with `.gitkeep` placeholders where needed so git tracks the structure):

```
clients/
  encore/
    src/
      common/
      utils/
      pages/
      selectors/
    tests/
      setup/
      specs/setup/
      test-data/setup/
    config/
      environments/
      allure/
    docs/
      read_only_docs/
    specs_planning/
      _internal/
      test-cases/
      test-plans/
      audits/
    exports/
    README.md
```

### 2. Path aliases in `tsconfig.json`
Add `compilerOptions.baseUrl: "./"` and `compilerOptions.paths` with:
- `@framework/*` → `["src/*"]` (initially points to existing root location — no file moves yet)
- `@client/*` → `["src/*"]` (initially same path; SP-MT-02 flips to `["clients/encore/src/*"]`)
- `@client-tests/*` → `["tests/*"]` (initially same; SP-MT-02 flips)

**Key**: aliases initially resolve to CURRENT locations so nothing breaks. SP-MT-02 updates the aliases as files move.

### 3. `ACTIVE_CLIENT` env var
- Add `ACTIVE_CLIENT=encore` to `config/environments/.env.example`.
- Add `ACTIVE_CLIENT=encore` to `config/environments/.env.development`.
- Document in `clients/encore/README.md`: how to switch clients (override via `.env.local` or command line).

### 4. New helper: `scripts/shared-paths.ts`
Exports:
- `activeClient(): string` — reads `process.env.ACTIVE_CLIENT`, defaults to `'encore'`.
- `clientRoot(): string` — returns absolute path to `clients/${activeClient()}/`.
- `clientPath(rel: string): string` — returns `path.join(clientRoot(), rel)`.
- `frameworkRoot(): string` — returns repo root.
- `frameworkPath(rel: string): string` — returns `path.join(frameworkRoot(), rel)`.

In SP-MT-01 the helper exists but NO script imports it yet. SP-MT-04 migrates callers.

### 5. `.gitignore` verification
Confirm `clients/` is NOT gitignored (currently it isn't). Add a comment block under existing rules documenting the multi-tenant layout. Ensure nothing under `clients/` accidentally matches gitignored patterns.

### 6. `clients/encore/README.md` stub
One page describing:
- What `clients/encore/` will contain after SP-MT-02/03 complete.
- How to switch `ACTIVE_CLIENT` when we onboard a second client.
- Pointer to PLAN_MULTI_TENANT_RESTRUCTURE.md for the full roadmap.

---

## Verification

Run from repo root. All must pass:

```
# 1. Directory scaffold exists
test -d clients/encore/src/pages && test -d clients/encore/tests/specs/setup && test -d clients/encore/specs_planning/_internal
echo $?  # expect 0

# 2. Types still resolve
npm run typecheck

# 3. Same specs listed
npx playwright test --list  # expect same 13 specs (seed + 12 modules)

# 4. Seed smoke passes
npm test -- tests/seed.spec.ts --project=chrome

# 5. Full pipeline preflight green
npm run pipeline:preflight

# 6. No file movement in git
git diff --stat --name-only | grep -v '^clients/\|tsconfig.json\|config/environments/\|scripts/shared-paths.ts\|\.gitignore' | wc -l
# expect 0 — only new files and the two edited config files
```

---

## Out of scope (defer to SP-MT-02)

- ANY file move (`git mv`). SP-MT-01 is purely additive.
- Updating any spec, page, selector, fixture, or test-data import.
- Modifying `playwright.config.ts` beyond what's needed for `ACTIVE_CLIENT` pickup.
- Migrating any existing script to use `shared-paths.ts`.

---

## Critical files (touch list)

**New**:
- `clients/encore/` tree with `.gitkeep` files
- `clients/encore/README.md`
- `scripts/shared-paths.ts`

**Edit**:
- `tsconfig.json` (add baseUrl + paths)
- `config/environments/.env.example` (add `ACTIVE_CLIENT=encore`)
- `config/environments/.env.development` (add `ACTIVE_CLIENT=encore`)
- `.gitignore` (documentation comment only; no functional change)

**Optional**:
- `playwright.config.ts` — read `ACTIVE_CLIENT` into a const for future use; don't wire it to testDir yet.

---

## Risks

- TypeScript path aliases with `moduleResolution: "node"` sometimes need `ts-node` / `@swc/register` config updates for scripts. Verify `npm run typecheck` AND `npm run validate:activity-log:preflight` (runs via ts-node).
- Playwright test runner may ignore tsconfig paths by default — verify `playwright-core` respects them or document workaround.
- Windows path separators: `scripts/shared-paths.ts` must use `path.join` + forward-slash-aware logic so shared-paths works on both Unix and Windows.

---

## Session checklist

- [ ] Scaffold created and committed.
- [ ] `tsconfig.json` aliases added, typecheck passes.
- [ ] `ACTIVE_CLIENT` env var available in `process.env` during a test run (add a one-line `Log.info` to verify then remove).
- [ ] `scripts/shared-paths.ts` compiles, has unit coverage via a quick `ts-node -e` smoke.
- [ ] Verification steps 1–6 all green.
- [ ] Activity log entry appended per LR-028, LR-037.
- [ ] Status updated to DONE, plan moved to `plans/done/` per LR-027.
- [ ] `npm run plans:reindex`.
