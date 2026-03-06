# Plan 18: Framework Cleanup & Compaction

**Status**: PENDING
**Priority**: P0 — accumulated bloat from 6-plan execution, dead code, orphaned selectors, misplaced files
**Scope**: Dead weight removal, selector cleanup, file reorganization, GARDENER agent fix
**Prerequisite**: All prior plans (09-17) completed

---

## Context

Post-execution audit of 6 plans revealed accumulated bloat. Both Claude Code and Copilot independently analyzed the framework. This plan synthesizes the verified findings from both, discards inflated claims, and presents only changes with researched reference chains.

**Goal**: Make the framework pretty, efficient, reusable, maintainable by AI, viewable by user. Reduce code, files, folders. Zero leftover references.

---

## Mistakes Found in Both Analyses

### Claude Code mistakes:
1. Said `pipeline-config.json` has `enabled: false` — actual value is `true`
2. Said pricing page is "justified at 489 lines" — it HAS 58 lines of genuine duplication (7 near-identical method pairs)
3. Missed that 93 selectors (83.8%) across shared.ts + left-panel.ts are completely unused
4. Initially suggested reports/ reorganization without checking blast radius

### Copilot mistakes:
1. "PLAN_14 was never executed" — **WRONG.** Git status shows `RM` renames for 4 page files. PLAN_14 WAS executed. The VS Code red is from 2 pricing files in `AD` git state, not from unexecuted plan.
2. "490→300 lines" for pricing — **INFLATED.** Actual savings: 58 lines (490→432). The 300-line claim overstates by 2.5x.
3. "Scripts are NOT dead code — 32/32 referenced in package.json" — **WRONG.** Having an npm script entry doesn't mean it's used. `upload-to-sharepoint.ts` and `vault-manager.ts` are never called by any agent, workflow, or CI trigger.
4. Suggests reports/ reorganization — `failure-summary.json` alone has **47 references** across 11 scripts + CI + docs. Blast radius: **23+ file changes minimum.** Not worth it.
5. "shared-types.ts and validation-gates.ts could be merged" — **BAD IDEA.** Different purposes (type definitions vs gate validation functions). Merging muddies responsibilities.
6. "Restart TS Server to fix VS Code red" — **WRONG.** The root cause is `AD` git status (staged-add then working-tree-delete) on 2 pricing files. Fix is `git add`, not TS server restart.

---

## What's NOT Changing (and why)

| Thing | Why it stays |
|-------|-------------|
| **32→29 scripts** | 14 pipeline gates (5 agents × pre/post) + infrastructure backbone. This is the cost of 5-agent pipeline architecture. Can't reduce without redesigning the pipeline. |
| **Reports/ folder structure** | `failure-summary.json` has 47+ references (11 scripts, 2 playwright configs, 4 CI files, 28 docs). Moving it requires 23+ file edits. The files are all gitignored build artifacts anyway. |
| **Pricing page staying >400 lines** | Calendar popover nav, cascading checkboxes, dynamic grid = genuine complexity. Compaction saves ~58 lines (490→432), not 190. |

---

## Execution Steps

### Part A: Fix VS Code Red + Git Tracking

**Root cause**: `location-pricing.page.ts` and `location-pricing.data.ts` are in `AD` git state (Added to staging at old path, then Deleted from working tree when moved to `locations/`). New copies at `locations/` are untracked. VS Code shows errors for the ghost files.

```bash
git add src/pages/locations/location-pricing.page.ts
git add tests/test-data/locations/location-pricing.data.ts
```

**Verification**: `git status` should show `R` (rename) instead of `AD` + `??`. VS Code pages/ folder should no longer be red.

---

### Part B: Delete Dead Weight (3 files + 1 folder + 8 npm scripts)

#### B1: Delete dead scripts

| File | Lines | Why dead |
|------|-------|----------|
| `scripts/upload-to-sharepoint.ts` | 81 | Never called by any agent. Jenkins stage is opt-in (`UPLOAD_TO_SHAREPOINT=false` default), no SharePoint credentials configured. |
| `scripts/vault-manager.ts` | 304 | CLI for credential vault never integrated. Agents use dotenv-flow, not vault. 7 npm scripts never called. |
| `src/integrations/sharepoint-client.ts` | 230 | Graph API client imported only by upload-to-sharepoint.ts. |

**Required edits to avoid broken references:**

1. **`src/index.ts`** — Remove line 60: `export { SharePointClient } from './integrations/sharepoint-client';`
   - Also remove line 59 comment: `// ==================== INTEGRATIONS ====================`
   - Keep line 48 (`export { Vault }`) — Vault class itself is separate from vault-manager CLI

2. **`package.json`** — Remove 8 npm script entries:
   - `"upload:sharepoint": "ts-node scripts/upload-to-sharepoint.ts"`
   - `"vault:init"`, `"vault:set"`, `"vault:get"`, `"vault:list"`, `"vault:delete"`, `"vault:rotate"`, `"vault:info"`

3. **`scripts/client-package.ts`** — Remove from COPY_FILES array:
   - `{ src: 'scripts/upload-to-sharepoint.ts', dest: 'scripts/upload-to-sharepoint.ts' }`
   - `{ src: 'scripts/vault-manager.ts', dest: 'scripts/vault-manager.ts' }`
   - Remove from CLIENT_SCRIPTS object: `upload:sharepoint` + all 7 `vault:*` entries

4. **`.ci/Jenkinsfile.ubuntu`** — Remove the entire "Upload to SharePoint" stage (lines 84-92, including the `UPLOAD_TO_SHAREPOINT` parameter on line 13)

5. **Delete `src/integrations/` folder** if empty after removing sharepoint-client.ts

#### B2: Delete empty placeholder

| File | Lines | Why dead |
|------|-------|----------|
| `src/selectors/navigator.ts` | 7 | Contains `NavigatorSelectors = {}` — literally zero selectors |

**Required edits:**

1. **`src/selectors/index.ts`**:
   - Remove line 15: `import { NavigatorSelectors } from './navigator';`
   - Remove line 25: `export { NavigatorSelectors } from './navigator';`
   - Line 57: Change `buildAllSelectors(MicrosoftLoginSelectors, NavigatorSelectors, SetupSelectors)` → `buildAllSelectors(MicrosoftLoginSelectors, SetupSelectors)`
   - Update line 6 DEPENDS-ON comment: remove `./navigator`

2. **`src/index.ts`** — Line 42: Remove `NavigatorSelectors` from the export block (keep the other exports on that line)

**Verification**: `npx tsc --noEmit` should pass. No file should import NavigatorSelectors.

---

### Part C: Selector Cleanup (93 orphaned selectors)

**Evidence**: shared.ts has 78 selectors, only 9 used (11.5%). left-panel.ts has 33 selectors, only 9 used (27%). local-office-settings.ts has 55 selectors, 0 used (0%).

#### C1: Delete `src/selectors/locations/local-office-settings.ts` (162 lines, 0 consumers)

No page object exists. No test spec exists. Test plans exist in specs_planning but no work started. Planner agent can rediscover these selectors from DOM when that module enters generation.

**Required edits to `src/selectors/index.ts`:**
- Remove line 21: `import { SetupLocalOfficeSettingsSelectors } from './locations/local-office-settings';`
- Remove line 32: `export { SetupLocalOfficeSettingsSelectors } from './locations/local-office-settings';`
- Remove line 41: `...SetupLocalOfficeSettingsSelectors,` from the `SetupSelectors` merged object

#### C2: Strip unused selectors from `shared.ts` (186→~40 lines)

**KEEP these 9 selectors** (verified used in page objects/base-page):
- `dlgSaveChanges`, `btnSaveChangesConfirm`, `btnSaveChangesCancel`
- `dlgUnsavedChanges`, `btnUnsavedChangesOk`, `btnUnsavedChangesCancel`
- `dlgErrorDialog`, `dlgErrorMessage`, `btnErrorOk`

**DELETE everything else** — 69 selectors across these sections:
- Legal tab (9 selectors)
- Account & Address tab (7)
- Account List dialog (14)
- Select Address dialog (9)
- Notes tab (6)
- Shared Setup Locations tab (5)
- Select Location dialog (5)
- Management History tab (7)
- Auto Add-On tab (5)
- Unused dialog selectors: `dlgErrorTitle`, `txtSaveChangesMessage` (2)

Keep the JSDoc annotations for the remaining 9. Remove entire sections for deleted selectors.

#### C3: Strip unused selectors from `left-panel.ts` (81→~35 lines)

**KEEP these 10 selectors** (verified used):
- `tabLocalInformation`, `tabCurrency`, `tabPricing`, `tabBasicInformation`
- `txtOffice`, `txtLocalOffice`, `txtPayToAddress`
- `chkECommerceActive`, `chkEnableProductionsOrders`
- `btnSave`

**DELETE** 24 unused selectors:
- Navigation (7): btnSetupMenu, lnkLocation, btnBackToLocationSearch, txtLocalOfficeSearch, btnSearch, btnReset, gridLocationResults
- Left panel fields (6): txtLocalOfficeName, chkActive, btnLiveDate, drpTaxMode, drpCountry, drpRegion
- More fields (3): drpServicingBranchOffice, drpLineOfBusiness, chkUnion
- Unused tabs (8): tabLocationManagementHistory, tabAccountAndAddress, tabLegal, tabNotes, tabSharedSetupLocations, tabAutoAddOn, pnlAutoAddOn

#### C4: Regenerate selector catalog

```bash
npm run selectors:catalog
```

**Verification**:
- `npx tsc --noEmit` passes
- Grep for `SetupLocalOfficeSettingsSelectors` → 0 hits outside done/ plans
- Grep for any deleted selector key → 0 hits in `src/pages/` and `tests/`

---

### Part D: Move Misplaced Files to `_internal/`

**Files to move:**
```
specs_planning/agent-metrics-report.md    → specs_planning/_internal/
specs_planning/agent-queue.schema.json    → specs_planning/_internal/
specs_planning/test-id-registry.json      → specs_planning/_internal/
```

**Script paths to update:**

| Script | Line | Old path | New path |
|--------|------|----------|----------|
| `scripts/agent-metrics.ts` | ~79 | `../specs_planning/agent-metrics-report.md` | `../specs_planning/_internal/agent-metrics-report.md` |
| `scripts/validate-agent-sync.ts` | ~361 | `specs_planning/agent-queue.schema.json` | `specs_planning/_internal/agent-queue.schema.json` |
| `scripts/build-test-id-registry.ts` | ~20 | `../specs_planning/test-id-registry.json` | `../specs_planning/_internal/test-id-registry.json` |
| `scripts/generator-post-complete.ts` | ~389 | `../specs_planning/test-id-registry.json` | `../specs_planning/_internal/test-id-registry.json` |
| `scripts/generator-pre-run.ts` | ~501 | `../specs_planning/test-id-registry.json` | `../specs_planning/_internal/test-id-registry.json` |

Also check: if `agent-queue.schema.json` has a `$id` field, update it. If `agent-queue.json` has a `$schema` reference, update that too.

**Verification**: `npm run validate:sync` passes. `npm run registry:build` succeeds. `npm run metrics:agents` doesn't crash.

---

### Part E: Micro-Fixes

#### E1: JSDoc blank line
`src/pages/locations/location-local-info.page.ts` line 49 — remove the blank line inside the JSDoc block (between the description and the `* Delegates to...` line).

#### E2: Pipeline config safety
`config/pipeline-config.json` — change `"enabled": true` → `"enabled": false`. Untested pipeline shouldn't auto-chain agents by default.

---

### Part F: Fix GARDENER Agent

File: `.github/agents/playwright-framework-maintainer.agent.md`

**Fixes:**
1. **Remove stale MNT-002 example**: Says "LocationPricingPage missing from barrel" — it IS exported. Remove the false example.
2. **Grant WRITE permission** on `scripts/`, `src/selectors/`, `src/integrations/` — currently READ-ONLY on these, which makes 80% of structural fixes impossible.
3. **Add MNT-013**: Selector orphan detection — flag selector files or individual selectors with 0 references in page objects or specs.
4. **Add MNT-014**: Empty export sweep — flag files that export empty objects or contain only comments.
5. **Update folder knowledge**: Add awareness of `src/pages/locations/`, `src/selectors/locations/` subfolder hierarchy.
6. **Fix MNT-006 example**: References "5 adapter tests in src/data/adapters/__tests__/" — verify this is still accurate or update.

---

### Part G: Pricing Page Compaction (OPTIONAL — separate session)

**Realistic savings: ~58 lines (490→432)**. NOT 190 as Copilot claimed.

Only merge the 5 date-field pairs (low risk, same logic, different selector):
- `isStartDateEnabled` + `isEndDateEnabled` → `isDateFieldEnabled(priceBookName, fieldType: 'start' | 'end')`
- `getStartDateValue` + `getEndDateValue` → `getDateFieldValue(...)`
- `enterStartDate` + `enterEndDate` → `enterDateField(...)`
- `isStartDateReadOnly` + `isEndDateReadOnly` → `isDateFieldReadOnly(...)`
- `openStartDatePopover` + `openEndDatePopover` → `openDatePopover(...)`

**DO NOT merge** checkbox pairs (getIsAlternativeState/getUseEffectiveDateState, check/uncheck methods). Different semantics, merging adds parameter complexity that hurts readability.

**Spec impact**: `tests/specs/locations/location-pricing.spec.ts` uses all these methods by name. ~15 call sites need updated method names/signatures. Must be done atomically with page object changes.

**Why separate session**: This changes code behavior signatures, requires spec updates, and needs test runs to verify. It's refactoring, not cleanup.

---

## What Gets Deleted (Summary)

| File | Lines | Why |
|------|-------|-----|
| `scripts/upload-to-sharepoint.ts` | 81 | Dead — no agent calls it, no credentials configured |
| `scripts/vault-manager.ts` | 304 | Dead — vault CLI never integrated, agents use dotenv-flow |
| `src/integrations/sharepoint-client.ts` | 230 | Dead — imported only by upload-to-sharepoint.ts |
| `src/selectors/navigator.ts` | 7 | Empty — `NavigatorSelectors = {}`, zero selectors |
| `src/selectors/locations/local-office-settings.ts` | 162 | Orphaned — 55 selectors, 0 consumers, no page/test exists |
| 69 selectors from `shared.ts` | ~146 | Unused — 0 references in pages or tests |
| 24 selectors from `left-panel.ts` | ~46 | Unused — 0 references in pages or tests |
| 8 npm scripts from `package.json` | — | upload:sharepoint + 7 vault:* |
| `src/integrations/` folder | — | Empty after sharepoint-client.ts deletion |

**Total dead code removed: ~976 lines + 5 files + 8 npm scripts + 1 folder**

---

## Files Edited (Complete List — no surprises)

| File | What changes |
|------|-------------|
| `src/index.ts` | Remove SharePointClient export (line 60), remove NavigatorSelectors from export block (line 42) |
| `src/selectors/index.ts` | Remove navigator import/export/buildAllSelectors ref, remove local-office-settings import/export/SetupSelectors spread |
| `src/selectors/locations/shared.ts` | Strip 69 unused selectors, keep 9 dialog selectors |
| `src/selectors/locations/left-panel.ts` | Strip 24 unused selectors, keep 10 used selectors |
| `package.json` | Remove 8 npm script entries |
| `scripts/client-package.ts` | Remove upload/vault from COPY_FILES and CLIENT_SCRIPTS |
| `.ci/Jenkinsfile.ubuntu` | Remove SharePoint upload stage + UPLOAD_TO_SHAREPOINT param |
| `scripts/agent-metrics.ts` | Update output path to _internal/ |
| `scripts/validate-agent-sync.ts` | Update schema path to _internal/ |
| `scripts/build-test-id-registry.ts` | Update output path to _internal/ |
| `scripts/generator-post-complete.ts` | Update registry path to _internal/ |
| `scripts/generator-pre-run.ts` | Update registry path to _internal/ |
| `src/pages/locations/location-local-info.page.ts` | Remove JSDoc blank line 49 |
| `config/pipeline-config.json` | Change enabled: true → false |
| `.github/agents/playwright-framework-maintainer.agent.md` | Fix MNT-002, add MNT-013/014, grant permissions, update folder knowledge |

**Total: 15 file edits + 5 file deletions + 3 file moves + 2 git adds = 25 operations**

---

## Verification Checklist

After ALL changes:
1. `npx tsc --noEmit` — 0 errors
2. `npm run validate:sync` — passes
3. `npm run selectors:catalog` — regenerates without errors
4. `git status` — no unexpected `AD` or `??` states on moved/deleted files
5. Grep `NavigatorSelectors` → 0 hits outside done/ plans
6. Grep `SetupLocalOfficeSettingsSelectors` → 0 hits outside done/ plans and index barrel
7. Grep `upload-to-sharepoint` → 0 hits outside done/ plans
8. Grep `vault-manager` → 0 hits outside done/ plans and ARCHITECTURE.md
9. Grep `sharepoint-client` → 0 hits outside done/ plans
10. Grep `specs_planning/agent-metrics-report` (old path) → 0 hits in scripts
11. Grep `specs_planning/agent-queue.schema` (old path, not _internal) → 0 hits in scripts
12. Grep `specs_planning/test-id-registry` (old path, not _internal) → 0 hits in scripts
13. VS Code pages/ folder — no red indicators
