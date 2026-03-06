# Plan 14: Repo Cleansing + Mirror Folderization

**Status**: PENDING
**Priority**: P0 — untracked pricing artifacts, dead files, no mirror structure between specs and their dependencies
**Scope**: One focused session. ~63 actions across 8 parts.
**Prerequisite**: None (this is the clean-up-everything plan)

**Core principle**: Specs live in `tests/specs/locations/` and `tests/specs/navigator/`. Every dependency chain (pages, selectors, test-data) must mirror that folder structure.

---

## Part A: Git Health — Track + Delete

### A1: Track untracked files (CRITICAL — these exist on disk but are invisible to git)

| File | What it is | Why untracked |
|------|-----------|---------------|
| `src/selectors/setup/local-office-settings.ts` | 65+ selectors for Local Office Settings tabs | Planner created but never committed |
| `src/pages/location-pricing.page.ts` | 526-line pricing page object | Generator created but never committed |
| `tests/specs/locations/location-pricing.spec.ts` | Pricing spec (30 test cases) | Generator created but never committed |
| `tests/test-data/location-pricing.data.ts` | Pricing test data constants | Generator created but never committed |
| `scripts/audit-block.ts` | Audit pipeline block script | Created but never committed |
| `scripts/capture-mistake.ts` | Mistake capture script (has npm entry `capture:mistake`) | Created but never committed |

**Action**: `git add` all 6 files.

Also: `SYSTEMS_AUDIT_RCA.md` was deleted from root (status `D`) — copy is in `plans/`. Commit this deletion.

Also: `plans/` directory is entirely untracked. Add to git. Structure is `plans/INDEX.md` + `plans/done/` (completed) + `plans/pending/` (active) — this restructure was already done on 2026-03-04.

### A2: Delete dead files

| File | Why dead |
|------|----------|
| `docs/README.md.bak` | Backup of README, original exists |
| `docs/read_only_docs/AGENT_SHARED_RULES.md.bak` | Backup, original exists |
| `specs_planning/agent-learnings.md.bak` | Backup of pre-merge learnings |
| `specs_planning/agent-mistakes.md.bak` | Backup of old mistakes |
| `scripts/explore-local-info.ts` | One-off exploration script. No npm entry. Only self-references. |

**DO NOT delete** `tests/seed.spec.ts` — MCP Playwright auto-generates it at runtime.
**DO NOT delete** `specs_planning/agent-learnings.md` — empty stub, but PF-02 pre-flight checks for it. Tiny overhead.
**DO NOT delete** `src/selectors/navigator.ts` — empty placeholder, but imported by barrel + validator. Future use.

---

## Part B: Folderize Selectors (setup/ → locations/)

**Current**: `src/selectors/setup/` — vague name, doesn't match spec folder `tests/specs/locations/`
**Target**: `src/selectors/locations/`

**Action**:
```bash
git mv src/selectors/setup/ src/selectors/locations/
```

**Files to update** (ONLY `src/selectors/index.ts` — 6 import paths + 6 re-export paths):
```
./setup/left-panel      → ./locations/left-panel
./setup/local-info      → ./locations/local-info
./setup/currency        → ./locations/currency
./setup/pricing         → ./locations/pricing
./setup/shared          → ./locations/shared
./setup/local-office-settings → ./locations/local-office-settings
```

Then regenerate catalog: `npm run selectors:catalog`

**DO NOT** rename type names (`SetupPricingSelectors`, `SetupSelectors`, etc.). Only the folder path changes.

**Risk**: LOW — all consumers import from `'../selectors'` barrel. Only index.ts paths change.

---

## Part C: Folderize Pages (location-*.page.ts → locations/)

**Current**: `src/pages/` — 8 flat files. Location pages mixed with login/home.
**Target**: Move location-related pages to `src/pages/locations/` to mirror `tests/specs/locations/`.

### C1: Create subfolder and move files

```bash
mkdir src/pages/locations/
git mv src/pages/location-currency.page.ts src/pages/locations/
git mv src/pages/location-form-helpers.page.ts src/pages/locations/
git mv src/pages/location-local-info.page.ts src/pages/locations/
git mv src/pages/location-test-orchestrators.page.ts src/pages/locations/
mv src/pages/location-pricing.page.ts src/pages/locations/   # untracked, regular mv
```

Files that STAY at `src/pages/`:
- `home.page.ts` — not location-specific
- `login.page.ts` — not location-specific
- `index.ts` — barrel export

### C2: Update import paths in moved page files

Each file currently uses `'../common/'`, `'../utils/'`, `'../selectors'`, `'../framework-contracts'` — these become `'../../common/'`, `'../../utils/'`, `'../../selectors'`, `'../../framework-contracts'`.

| File | `../` imports to update to `../../` |
|------|--------------------------------------|
| `location-currency.page.ts` | `../common/base-page`, `../utils/logger`, `../framework-contracts`, `../selectors` (4 edits) |
| `location-form-helpers.page.ts` | `../common/base-page`, `../utils/logger`, `../selectors` (3 edits) |
| `location-test-orchestrators.page.ts` | `../selectors` (1 edit — `./location-form-helpers.page` stays as `./`) |
| `location-local-info.page.ts` | `../utils/logger`, `../framework-contracts` (2 edits — `./location-test-orchestrators.page` stays as `./`) |
| `location-pricing.page.ts` | `../common/base-page`, `../utils/logger`, `../framework-contracts`, `../selectors` (4 edits) |

**Total**: 14 import path changes across 5 page files.

### C3: Update barrel export (`src/pages/index.ts`)

```typescript
// BEFORE:
export { LocationCurrencyPage } from './location-currency.page';
export { LocationLocalInfoPage } from './location-local-info.page';

// AFTER:
export { LocationCurrencyPage } from './locations/location-currency.page';
export { LocationLocalInfoPage } from './locations/location-local-info.page';
export { LocationPricingPage } from './locations/location-pricing.page';  // NEW — was missing
```

Update 2 existing exports + add 1 new export = 3 edits.

### C4: Update fixture imports (`tests/setup/fixtures.ts`)

```typescript
// BEFORE:
import { LocationCurrencyPage } from '../../src/pages/location-currency.page';
import { LocationLocalInfoPage } from '../../src/pages/location-local-info.page';
import { LocationPricingPage } from '../../src/pages/location-pricing.page';

// AFTER:
import { LocationCurrencyPage } from '../../src/pages/locations/location-currency.page';
import { LocationLocalInfoPage } from '../../src/pages/locations/location-local-info.page';
import { LocationPricingPage } from '../../src/pages/locations/location-pricing.page';
```

3 import path changes.

**Total Part C**: 5 file moves + 14 + 3 + 3 = 20 edits. **Risk**: MEDIUM — verify with `npx tsc --noEmit`.

---

## Part D: Folderize Test Data (location-*.data.ts → locations/)

**Current**: `tests/test-data/` — flat, location data mixed with generic files.
**Target**: Move location data to `tests/test-data/locations/` to mirror spec structure.

### D1: Create subfolder and move files

```bash
mkdir tests/test-data/locations/
git mv tests/test-data/location-currency.data.ts tests/test-data/locations/
git mv tests/test-data/location-local-info.data.ts tests/test-data/locations/
mv tests/test-data/location-pricing.data.ts tests/test-data/locations/  # untracked
```

Files that STAY at `tests/test-data/`:
- `test.xlsx` — generic test Excel
- `downloads/` — gitignored download artifacts

### D2: Update spec imports

| Spec | Import change |
|------|---------------|
| `location-currency.spec.ts` | `../../test-data/location-currency.data` → `../../test-data/locations/location-currency.data` |
| `location-local-information.spec.ts` | `../../test-data/location-local-info.data` → `../../test-data/locations/location-local-info.data` |
| `location-pricing.spec.ts` | `../../test-data/location-pricing.data` → `../../test-data/locations/location-pricing.data` |

**Total Part D**: 3 file moves + 3 import edits. **Risk**: LOW.

---

## Part E: Reports Cleanup

**Problem**: `reports/` is 317MB locally. ALL gitignored, but clutters IDE and disk.

### E1: Delete debug artifacts (one-time manual)

```bash
rm -f reports/pricing-*.md reports/pricing-save-state.png
rm -f reports/fix-diagnosis-location-local-info.md
rm -f reports/last-*.txt
rm -rf reports/allure-results/*
```

This reclaims ~316MB.

### E2: Add cleanup npm script to `package.json`

```json
"clean:reports": "rimraf reports/allure-results/* reports/pricing-* reports/fix-diagnosis-* reports/last-*.txt"
```

Uses `rimraf` (already a devDependency). Keeps pipeline outputs (`failure-summary.json`, `fixme-registry.json`, `test-results.json`, `junit-results.xml`, `html-report/`, `test-results/`, `preflight-check.json`).

---

## Part F: Archive Old Audits + Misc Fixes

### F1: Archive old audits (local-only — all gitignored)

Move 8 old (pre-March 2026) audit files from `specs_planning/audits/` to `specs_planning/audits/archive/`:

```bash
mv specs_planning/audits/2026-02-17_currency_audit_REVISED.md specs_planning/audits/archive/
mv specs_planning/audits/2026-02-17_currency_requirements_planner_audit.md specs_planning/audits/archive/
mv specs_planning/audits/full_pipeline_audit_2026-02-25.md specs_planning/audits/archive/
mv specs_planning/audits/full_pipeline_audit_2026-02-26.md specs_planning/audits/archive/
mv specs_planning/audits/full_pipeline_audit_2026-02-27.md specs_planning/audits/archive/
mv specs_planning/audits/generator_audit_2026-02-24.md specs_planning/audits/archive/
mv specs_planning/audits/generator_local_info_deep_audit_2026-02-24.md specs_planning/audits/archive/
mv specs_planning/audits/pipeline_audit_2026-02-18.md specs_planning/audits/archive/
```

Result: `specs_planning/audits/` has only 2 current audits + `.gitkeep` + `archive/` (11 historical).

### F2: Register audit-block npm script

Add to package.json:
```json
"audit:block": "ts-node scripts/audit-block.ts"
```

### F3: Move adapter unit tests (OPTIONAL — low priority)

5 test files in `src/data/adapters/__tests__/` should be in `tests/unit/adapters/` per project convention (tests in `tests/`, source in `src/`). Update their relative imports from `../adapterFactory` to `../../../src/data/adapters/adapterFactory` etc. Also update `test:adapters` npm script path.

Low risk but many import changes — defer if tight on time.

---

## Part G: Type Consolidation + 2 New Rules

### G1: Deduplicate CheckboxState (defined 4 times)

1. `location-currency.page.ts`: Delete `CurrencyCheckboxState` interface → import `{ CheckboxState }` from `./location-form-helpers.page`
2. `location-pricing.page.ts`: Delete `PricingCheckboxState` interface → import `{ CheckboxState }` from `./location-form-helpers.page`
3. `base-page.ts`: Import `{ CheckboxState }` from `../pages/locations/location-form-helpers.page` → use as return type for `getRadixCheckboxState()`

After Part C folderization, the import path from `base-page.ts` to `location-form-helpers.page.ts` is `'../pages/locations/location-form-helpers.page'`.

### G2: Add 2 new rules to `specs_planning/agent-mistakes.md`

| ID | Rule | Resolution |
|----|------|------------|
| GEN-023 | Before creating a new interface/type in a page object, search: `grep -rn "interface" src/pages/ src/common/`. If same shape exists, import it. Canonical shared types: CheckboxState (form-helpers), SpinState (form-helpers), IConfig (framework-contracts) | 4 duplicate CheckboxState definitions found across page objects + BasePage |
| GEN-024 | Never hardcode raw CSS selectors in page object methods. Use `getElement(key)` or `getLocator(key)`. For dynamic waits, pass selectors via the registry | Pricing waitForSaveEnabled() hardcoded `button[data-testid="location-settings-btn-save"]` instead of using selector registry |

After adding: `npm run sync:mistakes && npm run validate:sync`

---

## Execution Order

1. **Part A** — git add untracked files + delete dead files
2. **Part B** — rename selectors/setup/ → selectors/locations/, update barrel
3. **Part C** — folderize location pages to src/pages/locations/, update all imports
4. **Part D** — folderize location test-data to tests/test-data/locations/, update spec imports
5. **Part E** — clean reports (local), add clean:reports npm script
6. **Part F** — archive old audits, register npm script
7. **Part G** — type consolidation + 2 new rules
8. **Part H** — documentation ripple effects (ARCHITECTURE.md paths, agent File Permissions globs, @agent-doc comments, test-data comment)
9. **VERIFY**: `npx tsc --noEmit && npm run validate:sync`

---

## Result: Mirror Structure After Plan 14

```
tests/specs/
  locations/                          ← specs
    location-currency.spec.ts
    location-local-information.spec.ts
    location-pricing.spec.ts
  navigator/
    navigator-login.spec.ts

src/pages/
  locations/                          ← page objects (MIRROR)
    location-currency.page.ts
    location-form-helpers.page.ts
    location-local-info.page.ts
    location-test-orchestrators.page.ts
    location-pricing.page.ts
  home.page.ts
  login.page.ts
  index.ts

src/selectors/
  locations/                          ← selectors (MIRROR)
    currency.ts
    left-panel.ts
    local-info.ts
    local-office-settings.ts
    pricing.ts
    shared.ts
  login.ts
  navigator.ts
  dynamic.ts
  index.ts

tests/test-data/
  locations/                          ← test data (MIRROR)
    location-currency.data.ts
    location-local-info.data.ts
    location-pricing.data.ts
  test.xlsx
```

---

## Part H: Documentation Ripple Effects (Post-Folderization)

After Parts B/C/D move files, these documentation references become stale. Update them in the SAME session.

### H1: ARCHITECTURE.md (3 edits)

**File: `docs/read_only_docs/ARCHITECTURE.md`**

| Line | Current | Replace With |
|------|---------|-------------|
| ~183-186 | `LocationFormHelpers (src/pages/location-form-helpers.page.ts)` etc. — 3 hardcoded paths in class hierarchy | `LocationFormHelpers (src/pages/locations/location-form-helpers.page.ts)` etc. |
| ~244 | `src/pages/*.page.ts (Generator adds methods)` | `src/pages/**/*.page.ts (Generator adds methods)` — glob must cover locations/ subfolder |
| ~266 | `New page object → src/pages/` in "Where to Put New Code" table | `New page object → src/pages/{module}/` (e.g. `src/pages/locations/`) |

### H2: Agent Prompt File Permissions (5 edits — 3 agents + shared rules)

After folderization, location pages live at `src/pages/locations/*.page.ts`. Agents read File Permissions literally — if it says `src/pages/*.page.ts` they might not think they can modify `src/pages/locations/*.page.ts`.

| File | Line | Current | Replace With |
|------|------|---------|-------------|
| `playwright-test-generator.agent.md` | ~187 | `src/pages/*.page.ts` | `src/pages/**/*.page.ts` |
| `playwright-test-healer.agent.md` | ~202 | `src/pages/*.page.ts` | `src/pages/**/*.page.ts` |
| `playwright-pipeline-audit.agent.md` | ~124 | `src/pages/*.page.ts` | `src/pages/**/*.page.ts` |
| `AGENT_SHARED_RULES.md §1` | ~42 | `src/pages/*.page.ts` | `src/pages/**/*.page.ts` |
| `AGENT_SHARED_RULES.md §2` | ~57 | `src/pages/*.page.ts` | `src/pages/**/*.page.ts` |

### H3: @agent-doc Comments in Moved Files (4 edits)

These USED-BY / DEPENDS-ON comments are read by agents to understand dependency chains.

| File | Line | Current Path | Replace With |
|------|------|-------------|-------------|
| `location-form-helpers.page.ts` | ~9 | `USED-BY: src/pages/location-test-orchestrators.page.ts, src/pages/location-local-info.page.ts` | `USED-BY: src/pages/locations/location-test-orchestrators.page.ts, src/pages/locations/location-local-info.page.ts` |
| `location-test-orchestrators.page.ts` | ~8 | `USED-BY: src/pages/location-local-info.page.ts` | `USED-BY: src/pages/locations/location-local-info.page.ts` |
| `src/pages/index.ts` | ~6 | `DEPENDS-ON: login.page.ts, home.page.ts, location-currency.page.ts, location-local-info.page.ts` | `DEPENDS-ON: login.page.ts, home.page.ts, locations/location-currency.page.ts, locations/location-local-info.page.ts, locations/location-pricing.page.ts` |
| `src/selectors/index.ts` | ~6 | `DEPENDS-ON: ./login, ./navigator, ./dynamic, ./setup/*` | `DEPENDS-ON: ./login, ./navigator, ./dynamic, ./locations/*` |

### H4: Test Data Comment (1 edit)

| File | Line | Current | Replace With |
|------|------|---------|-------------|
| `tests/test-data/location-local-info.data.ts` | ~259 | `src/selectors/setup/local-info.ts` | `src/selectors/locations/local-info.ts` |

**Total Part H**: 13 edits. All documentation/comment changes — no logic changes.

---

## What NOT to Do

- Do NOT delete `tests/seed.spec.ts` (MCP auto-generates it)
- Do NOT subfolder `scripts/` (breaks 36 npm script paths)
- Do NOT rename selector type names (`SetupPricingSelectors` stays as-is)
- Do NOT touch `api-testing/` (separate module, properly structured)
- Do NOT delete `export_test_cases/` (active converter module)
- Do NOT modify test assertions or business logic
- Do NOT delete `specs_planning/agent-learnings.md` (PF-02 checks for it)
