# P0 — PLAN: Decontaminate Local Office Settings from Locations Module

> **Priority**: P0 — HIGHEST. Execute BEFORE all other pending plans.
> **Created**: 2026-03-25
> **Last updated**: 2026-03-25 (mega plan — merged Claude Code + Copilot audits, CSV export fixes, all 6 agents, collision validation, diagnostics cleanup)
> **Blocks**: PLAN_MAINTAINER_SWEEP (collision fixes become obsolete), PLAN_FULL_CHAIN_AUDIT (paths change), PLAN_CODEBASE_CLEANUP (exports change), PLAN_GENERATOR_AUDIT_AUTO_ADDON (collision refs change)
> **After execution**: Mark the 4 plans above as STALE — paths and references will have changed.

---

## Context

**Problem**: Local Office Settings (`/settings/local-office`) is a completely different page from Location Settings (`/settings/location`). However, the codebase treats Local Office Settings as a sub-module of Locations at EVERY layer: selectors, pages, specs, test data, test cases, directory structure, class names, fixture names, and the merged `SetupSelectors` barrel export.

**Visual proof** (screenshots taken 2026-03-25):
- **Location Settings** (`/settings/location`): Page title "Location Settings". Outer tabs: Basic Information, Location Management History. Sub-tabs: Local Information, Currency, Pricing, Account and Address, Legal, Notes, Shared Setup Locations, Auto Add-On. Left panel with Office/Local Office fields + Save button.
- **Local Office Settings** (`/settings/local-office`): Page title "Local Office Settings". Tabs: Basic Information, Location Settings History, ECT Settings. Content sections: Default Date Offsets, Section, Room Configuration, Default Logo, Discount Exemptions, Misc Settings. Save button top-right.

Completely different pages. Different layouts. Different tabs. Different business domain.

**No agent caught the architectural conflation.** Three pending plans (MAINTAINER_SWEEP, FULL_CHAIN_AUDIT, GENERATOR_AUDIT) caught the SYMPTOM (selector key collisions for `btnSave`, `tabBasicInformation`) but proposed band-aid key renames instead of questioning why two different pages share a namespace.

**REQUIREMENTS.md line 972 explicitly warns**: _"Do NOT confuse with `/settings/location` — that is a separate page (Location Settings) with different tabs."_ — Every agent ignored this.

**What's broken:**
1. `SetupSelectors` (index.ts:43-55) spreads `LocalOfficeSettingsSelectors` LAST → silently overwrites `btnSave` and `tabBasicInformation` from Location Settings → any page using `getTsSelector('btnSave')` gets the WRONG selector
2. `buildAllSelectors()` collision detection (index.ts:60-69) is blind — checks between `MicrosoftLoginSelectors` and the pre-merged `SetupSelectors`, never catches intra-Setup collisions
3. **5 additional intra-Location-Settings collisions** exist in the SAME merged object:
   - `dlgSaveChanges` — in `shared.ts`, `notes.ts`, `auto-addon.ts` (3 different selectors!)
   - `btnSaveChangesCancel` — in `shared.ts`, `notes.ts`, `auto-addon.ts`
   - `btnSaveChangesConfirm` — in `shared.ts`, `notes.ts`
   - `dlgUnsavedChanges` — in `shared.ts`, `auto-addon.ts`
   - `toastLocalInfoUpdated` — in `local-info.ts`, `auto-addon.ts`
4. URL assertion in `location-local-office-settings.spec.ts:18` checks only `/settings` — passes on BOTH pages
5. All Local Office Settings files live in `locations/` directories alongside Location Settings files
6. Class names use `Location` prefix implying hierarchy that doesn't exist
7. `src/common/base-page.ts` imports `CheckboxState` from `../pages/locations/` — breaks when pages move

**Shared Setup Locations**: Confirmed to be a TAB within Location Settings (`/settings/location`). Stays in `setup/locations/` module. No changes needed.

---

## Hierarchical Structure Rationale

Both Location Settings and Local Office Settings are sub-pages of the **Setup** top-level section in Navigator Cloud. The app has 6+ top-level nav sections, each with sub-pages. Our folder structure MUST mirror this hierarchy for future scalability.

### Navigator Cloud Navigation Map (MCP-verified 2026-03-25)

| Top-Level Section | Sub-Pages |
|-------------------|-----------|
| **Home** | Dashboard (landing page) |
| **Inbox** | (message center) |
| **Actions** | Sourcing Dashboard, Reports, Offline Reports, Reports Statistics, Approve Equipment Transfers, Release Notes, Search Statistics, Fix Unlinked CRM Orders, FAQ |
| **Commissions** | CMP, Allow DPCD, Tier/Flat, Product Code |
| **Tax** | Order Origin Tax, Sales, Special Rate, State Tax, Tax Type Detail |
| **Setup** | Corporate Billing, Corporate Pricing, Corporate PG Pricing Override, Discount Optimization Settings, Discount Matrix, ECT Settings, Users, **Local Office Settings** (`/settings/local-office`), **Location** (`/settings/location`), Bill Through Date, Service Type, Service Type Name, Service Charge |
| **Search** | Order/Job/Asset/Customer/DRO/Payment/Item/ECT Search, Event Agendas |

**Key insight**: `locations/` and `local-office/` are NOT top-level modules — they are sub-pages of **Setup**. Using flat top-level dirs (`locations/`, `local-office/`) would break when we add Actions, Commissions, Tax, or Search pages. The correct structure is `setup/locations/`, `setup/local-office/`.

---

## Agent Fuckup Audit — Local Office Settings

Professional audit of all mistakes made by repo agents while working on Local Office Settings:

### AFR-001: Monolithic test cases vs. split specs
- **Test cases**: 1 file (`locations_local_office_settings_test_cases.md`, 1241 lines) covering ALL 3 tabs
- **Specs**: 3 separate files (`location-local-office-settings.spec.ts`, `location-local-office-history.spec.ts`, `location-local-office-ect.spec.ts`)
- **Problem**: Planner produced 1 monolithic test cases file, but generator split into 3 specs. The mapping between test cases and specs is unclear. Future generators won't know which test cases belong to which spec.
- **Fix**: When this plan moves files, split test cases into 3 files matching the 3 specs.

### AFR-002: Wrong testid in test cases document
- **Line 152** of `locations_local_office_settings_test_cases.md`: references `button-save` testid
- **Actual selector**: `btn-save` (as defined in `local-office-settings.ts:31`)
- **Impact**: Generator would produce wrong selectors if it trusts the test cases doc literally

### AFR-003: Wrong URL navigation — 3+ times (tracked as GEN-REQ-006)
- Generator agents navigated to wrong URL (`/settings/location` instead of `/settings/local-office`) at least 3 times during spec creation
- Already tracked in `agent-mistakes.md` as GEN-REQ-006, but root cause was never addressed: files living in `locations/` directory primed agents to assume location URLs

### AFR-004: Selector collision not detected until P0 audit
- `btnSave` and `tabBasicInformation` silently overwritten in `SetupSelectors` since the LOS selectors were added
- No planner, generator, or audit agent flagged the architectural issue — only the collision symptom
- 3 pending plans proposed renaming keys instead of questioning module boundaries

### AFR-005: Missing barrel exports
- `src/pages/index.ts` never exports `LocationLocalOfficeSettingsPage` or `LocationSharedSetupLocationsPage`
- `LocationLegalPage` also missing from barrel export
- Any consumer importing from the barrel gets an incomplete API

### AFR-006: Test plan also miscategorized
- `specs_planning/test-plans/locations/locations_local_office_settings_test_plan.md` — lives in locations directory
- Should be in its own local-office directory

### AFR-007: CSV export pipeline unaware of LOS as separate module
- `generatePreconditions()` in `to-csv.ts` only matches `TC-LOC`, not `TC-LOS`
- All 58 LOS test cases have **empty preconditions** in exported CSV — verified
- `extractModule()` has no `LOS` key in moduleMap — works by accident (falls to lowercase)
- `task-context-builder.ts` MODULE_SECTION_MAP has no `local-office` entry

### AFR-008: LOS selectors in 1 mega-file vs Location's 10 partitions (quality)
- Location Settings: 10 clean partition files (left-panel.ts, local-info.ts, currency.ts, etc.)
- Local Office Settings: 1 file with 200+ selectors covering ALL 3 tabs
- A human reading the repo would notice the inconsistency immediately
- **Future improvement** (not blocking P0): split into `basic-info.ts`, `history.ts`, `ect.ts`, `shared.ts` partitions matching Location Settings' convention

---

## PART A: DECONTAMINATION

### Step 1: Create new directory structure

```
src/selectors/setup/local-office/          ← NEW (LOS selectors)
src/selectors/setup/locations/             ← MOVED from src/selectors/locations/
src/pages/setup/local-office/              ← NEW (LOS page object)
src/pages/setup/locations/                 ← MOVED from src/pages/locations/
tests/specs/setup/local-office/            ← NEW (LOS specs)
tests/specs/setup/locations/               ← MOVED from tests/specs/locations/
tests/test-data/setup/local-office/        ← NEW (LOS test data)
tests/test-data/setup/locations/           ← MOVED from tests/test-data/locations/
specs_planning/test-cases/setup/local-office/   ← NEW (LOS test cases)
specs_planning/test-cases/setup/locations/      ← MOVED from specs_planning/test-cases/locations/
specs_planning/test-plans/setup/local-office/   ← NEW (LOS test plans)
specs_planning/test-plans/setup/locations/      ← MOVED from specs_planning/test-plans/locations/
```

---

### Step 2: Move ALL files into hierarchical structure

#### 2a. Move Local Office Settings files OUT of locations/ into setup/local-office/

| From | To |
|------|----|
| `src/selectors/locations/local-office-settings.ts` | `src/selectors/setup/local-office/local-office-settings.ts` |
| `src/pages/locations/location-local-office-settings.page.ts` | `src/pages/setup/local-office/local-office-settings.page.ts` |
| `tests/specs/locations/location-local-office-settings.spec.ts` | `tests/specs/setup/local-office/local-office-settings.spec.ts` |
| `tests/specs/locations/location-local-office-history.spec.ts` | `tests/specs/setup/local-office/local-office-history.spec.ts` |
| `tests/specs/locations/location-local-office-ect.spec.ts` | `tests/specs/setup/local-office/local-office-ect.spec.ts` |
| `tests/test-data/locations/location-local-office-settings.data.ts` | `tests/test-data/setup/local-office/local-office-settings.data.ts` |
| `specs_planning/test-cases/locations/locations_local_office_settings_test_cases.md` | `specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` |
| `specs_planning/test-plans/locations/locations_local_office_settings_test_plan.md` | `specs_planning/test-plans/setup/local-office/local_office_settings_test_plan.md` |

#### 2b. Move ALL Location Settings files from locations/ to setup/locations/

**Selectors** (`src/selectors/locations/` → `src/selectors/setup/locations/`):
| File | Move |
|------|------|
| `left-panel.ts` | `src/selectors/setup/locations/left-panel.ts` |
| `local-info.ts` | `src/selectors/setup/locations/local-info.ts` |
| `currency.ts` | `src/selectors/setup/locations/currency.ts` |
| `pricing.ts` | `src/selectors/setup/locations/pricing.ts` |
| `account-address.ts` | `src/selectors/setup/locations/account-address.ts` |
| `notes.ts` | `src/selectors/setup/locations/notes.ts` |
| `legal.ts` | `src/selectors/setup/locations/legal.ts` |
| `auto-addon.ts` | `src/selectors/setup/locations/auto-addon.ts` |
| `shared.ts` | `src/selectors/setup/locations/shared.ts` |
| `shared-setup-locations.ts` | `src/selectors/setup/locations/shared-setup-locations.ts` |

**Page objects** (`src/pages/locations/` → `src/pages/setup/locations/`):
| File | Move |
|------|------|
| `location-form-helpers.page.ts` | `src/pages/setup/locations/location-form-helpers.page.ts` |
| `location-test-orchestrators.page.ts` | `src/pages/setup/locations/location-test-orchestrators.page.ts` |
| `location-currency.page.ts` | `src/pages/setup/locations/location-currency.page.ts` |
| `location-local-info.page.ts` | `src/pages/setup/locations/location-local-info.page.ts` |
| `location-pricing.page.ts` | `src/pages/setup/locations/location-pricing.page.ts` |
| `location-account-address.page.ts` | `src/pages/setup/locations/location-account-address.page.ts` |
| `location-notes.page.ts` | `src/pages/setup/locations/location-notes.page.ts` |
| `location-legal.page.ts` | `src/pages/setup/locations/location-legal.page.ts` |
| `location-shared-setup-locations.page.ts` | `src/pages/setup/locations/location-shared-setup-locations.page.ts` |
| `location-auto-addon.page.ts` | `src/pages/setup/locations/location-auto-addon.page.ts` |

**Specs** (`tests/specs/locations/` → `tests/specs/setup/locations/`):
| File | Move |
|------|------|
| `location-currency.spec.ts` | `tests/specs/setup/locations/location-currency.spec.ts` |
| `location-local-information.spec.ts` | `tests/specs/setup/locations/location-local-information.spec.ts` |
| `location-pricing.spec.ts` | `tests/specs/setup/locations/location-pricing.spec.ts` |
| `location-account-address.spec.ts` | `tests/specs/setup/locations/location-account-address.spec.ts` |
| `location-notes.spec.ts` | `tests/specs/setup/locations/location-notes.spec.ts` |
| `location-legal.spec.ts` | `tests/specs/setup/locations/location-legal.spec.ts` |
| `location-shared-setup-locations.spec.ts` | `tests/specs/setup/locations/location-shared-setup-locations.spec.ts` |
| `location-auto-addon.spec.ts` | `tests/specs/setup/locations/location-auto-addon.spec.ts` |

**Test data** (`tests/test-data/locations/` → `tests/test-data/setup/locations/`):
| File | Move |
|------|------|
| `location-currency.data.ts` | `tests/test-data/setup/locations/location-currency.data.ts` |
| `location-local-info.data.ts` | `tests/test-data/setup/locations/location-local-info.data.ts` |
| `location-pricing.data.ts` | `tests/test-data/setup/locations/location-pricing.data.ts` |
| `location-account-address.data.ts` | `tests/test-data/setup/locations/location-account-address.data.ts` |
| `location-notes.data.ts` | `tests/test-data/setup/locations/location-notes.data.ts` |
| `location-legal.data.ts` | `tests/test-data/setup/locations/location-legal.data.ts` |
| `location-shared-setup-locations.data.ts` | `tests/test-data/setup/locations/location-shared-setup-locations.data.ts` |
| `location-auto-addon.data.ts` | `tests/test-data/setup/locations/location-auto-addon.data.ts` |

**Test cases** (`specs_planning/test-cases/locations/` → `specs_planning/test-cases/setup/locations/`):
| File | Move |
|------|------|
| `locations_account_address_test_cases.md` | `specs_planning/test-cases/setup/locations/` |
| `locations_auto_addon_test_cases.md` | `specs_planning/test-cases/setup/locations/` |
| `locations_currency_test_cases.md` | `specs_planning/test-cases/setup/locations/` |
| `locations_left_panel_test_cases.md` | `specs_planning/test-cases/setup/locations/` |
| `locations_legal_test_cases.md` | `specs_planning/test-cases/setup/locations/` |
| `locations_local_information_test_cases.md` | `specs_planning/test-cases/setup/locations/` |
| `locations_management_history_test_cases.md` | `specs_planning/test-cases/setup/locations/` |
| `locations_notes_test_cases.md` | `specs_planning/test-cases/setup/locations/` |
| `locations_pricing_test_cases.md` | `specs_planning/test-cases/setup/locations/` |
| `locations_shared_setup_locations_test_cases.md` | `specs_planning/test-cases/setup/locations/` |

**Test plans** (`specs_planning/test-plans/locations/` → `specs_planning/test-plans/setup/locations/`):
| File | Move |
|------|------|
| `locations_account_address_test_plan.md` | `specs_planning/test-plans/setup/locations/` |
| `locations_auto_addon_test_plan.md` | `specs_planning/test-plans/setup/locations/` |
| `locations_currency_test_plan.md` | `specs_planning/test-plans/setup/locations/` |
| `locations_left_panel_test_plan.md` | `specs_planning/test-plans/setup/locations/` |
| `locations_legal_test_plan.md` | `specs_planning/test-plans/setup/locations/` |
| `locations_local_information_test_plan.md` | `specs_planning/test-plans/setup/locations/` |
| `locations_management_history_test_plan.md` | `specs_planning/test-plans/setup/locations/` |
| `locations_notes_test_plan.md` | `specs_planning/test-plans/setup/locations/` |
| `locations_pricing_test_plan.md` | `specs_planning/test-plans/setup/locations/` |
| `locations_shared_setup_locations_test_plan.md` | `specs_planning/test-plans/setup/locations/` |

**Total files moved: 8 (LOS) + 10 (selectors) + 10 (pages) + 8 (specs) + 8 (test-data) + 10 (test-cases) + 10 (test-plans) = 64 files**

---

### Step 3: Rewrite `src/selectors/index.ts` — nuke SetupSelectors, fix collision detection

**3a. Remove `SetupSelectors` merged object entirely** (lines 43-55).

**3b. Create `LocationSettingsSelectors`** — ONLY Location Settings partitions:
```typescript
export const LocationSettingsSelectors = {
  ...SetupLeftPanelSelectors,
  ...SetupLocalInfoSelectors,
  ...SetupCurrencySelectors,
  ...SetupPricingSelectors,
  ...SetupAccountAddressSelectors,
  ...SetupSharedSelectors,
  ...SetupSharedSetupLocationsSelectors,
  ...SetupNotesSelectors,
  ...SetupLegalSelectors,
  ...SetupAutoAddonSelectors,
} as const;
```

**3c. PREREQUISITE — Fix 5 intra-Location-Settings collisions FIRST**

> **AUDIT FIX (showstopper)**: Passing partitions individually to `buildAllSelectors()` makes collision detection finally work — and it will immediately THROW because these keys exist in multiple Location Settings partitions with DIFFERENT values:
>
> | Colliding Key | Files | Resolution |
> |--------------|-------|------------|
> | `dlgSaveChanges` | `shared.ts`, `notes.ts`, `auto-addon.ts` | Keep in `shared.ts` (canonical). Delete from `notes.ts` and `auto-addon.ts` — verify on MCP that the shared selector works on all tabs. If a tab uses a genuinely different dialog, prefix it: `notesDlgSaveChanges`, `autoAddonDlgSaveChanges`. |
> | `btnSaveChangesCancel` | `shared.ts`, `notes.ts`, `auto-addon.ts` | Same approach as above |
> | `btnSaveChangesConfirm` | `shared.ts`, `notes.ts` | Same |
> | `dlgUnsavedChanges` | `shared.ts`, `auto-addon.ts` | Same |
> | `toastLocalInfoUpdated` | `local-info.ts`, `auto-addon.ts` | Keep in `local-info.ts`, rename in `auto-addon.ts` to `autoAddonToastLocalInfoUpdated` |
>
> **Strategy**: Each selector must exist in EXACTLY ONE partition. Shared dialogs (Save Changes, Unsaved Changes) belong in `shared.ts`. Tab-specific variants (if confirmed different on MCP) get a tab prefix. Only after this cleanup will `buildAllSelectors()` pass without throwing.
>
> **If MCP verification is not available**: Keep `LocationSettingsSelectors` as a single merged arg to `buildAllSelectors()` (hides intra-LS collisions but still detects LS-vs-Login collisions), and file a follow-up task to deduplicate. This is the SAFE fallback.

**3d. Fix `ALL_SELECTORS`** — pass Location Settings partitions individually (collision detection within Location Settings), but **DO NOT include `LocalOfficeSettingsSelectors`**:
```typescript
export const ALL_SELECTORS = buildAllSelectors(
  MicrosoftLoginSelectors,
  SetupLeftPanelSelectors,
  SetupLocalInfoSelectors,
  SetupCurrencySelectors,
  SetupPricingSelectors,
  SetupAccountAddressSelectors,
  SetupSharedSelectors,
  SetupSharedSetupLocationsSelectors,
  SetupNotesSelectors,
  SetupLegalSelectors,
  SetupAutoAddonSelectors,
  // NOTE: LocalOfficeSettingsSelectors deliberately EXCLUDED from ALL_SELECTORS.
  // It has keys (btnSave, tabBasicInformation) that collide with Location Settings
  // but point to DIFFERENT elements on a DIFFERENT page. Including it would throw.
  // Local Office pages access their selectors via LocalOfficeSettingsSelectors directly.
);
```

> **AUDIT FIX (critical)**: Original Copilot plan said to include `LocalOfficeSettingsSelectors` in `buildAllSelectors()`. This would THROW at import time because `btnSave` and `tabBasicInformation` exist in both `SetupLeftPanelSelectors` and `LocalOfficeSettingsSelectors` with different testid values. Two different pages can legitimately have a "Save" button — they just can't share a global lookup namespace. Each page's page object must use its own partition.

**3e. Update ALL import paths** for moved files (every `./locations/` becomes `./setup/locations/` and `./locations/local-office-settings` becomes `./setup/local-office/local-office-settings`):
```typescript
// IMPORTS — all paths updated to setup/ hierarchy
import { MicrosoftLoginSelectors } from './login';
import { SetupLeftPanelSelectors } from './setup/locations/left-panel';
import { SetupLocalInfoSelectors } from './setup/locations/local-info';
import { SetupCurrencySelectors } from './setup/locations/currency';
import { SetupPricingSelectors } from './setup/locations/pricing';
import { SetupAccountAddressSelectors } from './setup/locations/account-address';
import { SetupSharedSelectors } from './setup/locations/shared';
import { SetupSharedSetupLocationsSelectors } from './setup/locations/shared-setup-locations';
import { SetupNotesSelectors } from './setup/locations/notes';
import { SetupLegalSelectors } from './setup/locations/legal';
import { SetupAutoAddonSelectors } from './setup/locations/auto-addon';
import { LocalOfficeSettingsSelectors } from './setup/local-office/local-office-settings';

// RE-EXPORTS — same path updates
export { MicrosoftLoginSelectors } from './login';
export { DynamicSelectors } from './dynamic';
export { SetupLeftPanelSelectors } from './setup/locations/left-panel';
// ... (all 10 location partitions + LOS)
export { LocalOfficeSettingsSelectors } from './setup/local-office/local-office-settings';
```

**3f. Update `@agent-doc` header** — add onboarding rules:
```typescript
* ONBOARDING: When adding a new page's selectors:
*   1. Create a NEW file in src/selectors/{section}/{module}/ (check docs/MODULE_REGISTRY.md)
*   2. Import and re-export the new partition here
*   3. Add it to buildAllSelectors() as a SEPARATE argument (collision detection)
*   4. Do NOT add it to LocationSettingsSelectors or any other merged page object
*   5. If the page needs its own merged object, create one (e.g., LocalOfficeSettingsSelectors)
```

---

### Step 4: Move page object + override getElement for page-local selectors

#### Move + rename class
- `src/pages/locations/location-local-office-settings.page.ts` → `src/pages/setup/local-office/local-office-settings.page.ts`
- Rename class: `LocationLocalOfficeSettingsPage` → `LocalOfficeSettingsPage`
- Update import of `CheckboxState`: `from '../locations/location-form-helpers.page'` (sibling dirs under `setup/`)

#### Override getElement (CRITICAL — audit fix)
Since `LocalOfficeSettingsSelectors` is NOT in `ALL_SELECTORS` (colliding keys), `LocalOfficeSettingsPage` must override `getElement()` to prefer its own selectors:
```typescript
// NOTE: File is at src/pages/setup/local-office/ — 3 levels up to src/
import { LocalOfficeSettingsSelectors } from '../../../selectors';
import { getTsSelector } from '../../../selectors';

// In the class body:
protected getElement(elementName: string): Locator {
  // Prefer Local Office selectors, fall back to global for shared elements (dialogs, etc.)
  const selector = (LocalOfficeSettingsSelectors as Record<string, string>)[elementName]
    ?? getTsSelector(elementName);
  if (!selector) throw new Error(`Selector '${elementName}' not found`);
  return this.page.locator(selector);
}
```
This ensures `getElement('btnSave')` returns `local-office-settings-btn-save` (correct) instead of `location-settings-btn-save` (wrong).

#### Update `src/common/base-page.ts` (CRITICAL — missed in original plan)
Line 15: `import { CheckboxState } from '../pages/locations/location-form-helpers.page'`
→ `import { CheckboxState } from '../pages/setup/locations/location-form-helpers.page'`
**base-page.ts is the parent of ALL page objects. This breaks everything if missed.**

---

### Step 5: Move spec files

- `tests/specs/locations/location-local-office-settings.spec.ts` → `tests/specs/setup/local-office/local-office-settings.spec.ts`
- `tests/specs/locations/location-local-office-history.spec.ts` → `tests/specs/setup/local-office/local-office-history.spec.ts`
- `tests/specs/locations/location-local-office-ect.spec.ts` → `tests/specs/setup/local-office/local-office-ect.spec.ts`

---

### Step 6: Move test data files

- `tests/test-data/locations/location-local-office-settings.data.ts` → `tests/test-data/setup/local-office/local-office-settings.data.ts`
- **Fix type reference** in this file: `keyof typeof SetupSelectors` → import `LocalOfficeSettingsSelectors` directly and use `keyof typeof LocalOfficeSettingsSelectors`

---

### Step 7: Move test case + test plan files

- `specs_planning/test-cases/locations/locations_local_office_settings_test_cases.md` → `specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md`
- `specs_planning/test-plans/locations/locations_local_office_settings_test_plan.md` → `specs_planning/test-plans/setup/local-office/local_office_settings_test_plan.md`

**AFR-001 fix**: Consider splitting the monolithic test cases file (1241 lines) into 3 files matching the 3 specs:
- `local_office_basic_info_test_cases.md` (Basic Information tab)
- `local_office_history_test_cases.md` (Location Settings History tab)
- `local_office_ect_test_cases.md` (ECT Settings tab)

**Fix internal markdown headers** in both moved files:
- Test cases line 1: `**Module**: locations` → `**Module**: local-office`
- Test plan: same change
- Update `**Selector file**` paths from `src/selectors/locations/` → `src/selectors/setup/local-office/`

---

### Step 8: Fix URL assertion bug (HIGH PRIORITY)

**File: `tests/specs/setup/local-office/local-office-settings.spec.ts`** (after move)
**Line 18** — currently:
```typescript
expect(locationLocalOfficeSettingsPage.getCurrentUrl()).toContain(`locations/${OFFICE_NO}/settings`);
```
**Fix to:**
```typescript
expect(localOfficeSettingsPage.getCurrentUrl()).toContain(`locations/${OFFICE_NO}/settings/local-office`);
```

---

### Step 9: Update all `SetupSelectors` type references

Replace `keyof typeof SetupSelectors` → `keyof typeof LocationSettingsSelectors` in ALL files that use it in code (not just comments):

| File (after move) | Lines | Import change |
|------|-------|---------------|
| `src/pages/setup/locations/location-form-helpers.page.ts` | L16, L49, L57, L67, L75, L80, L85, L101, L115, L125, L143, L147, L192, L196, L201, L212, L224 | `import { LocationSettingsSelectors } from '../../../selectors'` (3 levels up — setup/locations/ → pages/ → src/) |
| `src/pages/setup/locations/location-test-orchestrators.page.ts` | L14, L26, L32, L84, L86, L90, L91, L117 | same (`../../../selectors`) |
| `src/pages/setup/locations/location-currency.page.ts` | L23, L79, L88, L97 | same (`../../../selectors`) |
| `src/pages/setup/locations/location-auto-addon.page.ts` | L6 | Direct import: `from '../../../selectors/setup/locations/auto-addon'` (was `../../selectors/locations/auto-addon`) |
| `tests/test-data/setup/locations/location-local-info.data.ts` | L12, L14 | `import { LocationSettingsSelectors } from '../../../../src/selectors'` (4 levels up — setup/locations/ → test-data/ → tests/ → root/) |

Also update `@agent-doc` DEPENDS-ON comments referencing `SetupSelectors` → `LocationSettingsSelectors` in:
- `location-pricing.page.ts`, `location-local-info.page.ts`, `location-notes.page.ts`, `location-account-address.page.ts`, `location-shared-setup-locations.page.ts`

---

### Step 10: Update `src/index.ts` (barrel export)

Line 42 exports `SetupSelectors` → change to `LocationSettingsSelectors`:
```typescript
  LocationSettingsSelectors,  // was SetupSelectors
```

---

### Step 11: Update `scripts/generator-validate-selectors.ts`

Lines 61-63 reference `SetupSelectors` in `SELECTOR_OBJECT_NAMES` array:
```typescript
const SELECTOR_OBJECT_NAMES = ['LocationSettingsSelectors', 'MicrosoftLoginSelectors',
  // ... add 'LocalOfficeSettingsSelectors'
```

---

### Step 11b: Fix CSV export pipeline (4 files — missed by all prior audits)

The CSV export system is completely unaware that LOS is a separate module. All 58 LOS test cases have **empty preconditions** in the exported CSV.

**11b-1. `export_test_cases/to-csv.ts` — `generatePreconditions()` (line ~404)**
Currently only matches `TC-LOC`. Add `TC-LOS` branch:
```typescript
if (id.includes('TC-LOS')) {
  preconditions.push('Local Office Settings page is open (Office 1604)');
  const subMatch = id.match(/TC-LOS-([A-Z]+)-\d+/);
  const subCode = subMatch?.[1] ?? '';
  // Map BAS→Basic Information, HIS/HST→History, ECT→ECT Settings
  const tabEntry = subCode ? this.TAB_MAP[subCode] : undefined;
  preconditions.push(tabEntry ? tabEntry.tab : 'Basic Information tab is active');
}
```

**11b-2. `export_test_cases/to-csv.ts` — `extractModule()` (line ~551)**
Add LOS mapping to moduleMap:
```typescript
const moduleMap: Record<string, string> = {
  'LOC': 'locations',
  'LOS': 'local-office',   // ← ADD
  // ...existing entries...
};
```

**11b-3. `scripts/task-context-builder.ts` — `MODULE_SECTION_MAP` (line ~31)**
Add local-office entry:
```typescript
'local-office': [
  'Local Office Settings',
  'Default Date Offsets',
  'ECT Settings',
  'Room Configuration',
  'Discount Exemptions',
],
```

**11b-4. `export_test_cases/README.md`**
Update code→directory mapping table. Fix documentation bug: `KNOWN_SUB_CODES` is in `types.ts`, not `lint-test-cases.ts`.

---

### Step 11c: Fix queue item in `agent-queue.json`

The LOS queue entry (line ~1947) has wrong metadata:
- `"module": "locations"` → `"module": "local-office"`
- `"stage": "pending_generation"` → `"testing"` (3 spec files already exist and run)
- `"feature": "Location - Local Office Settings"` → `"Local Office Settings"` (no "Location" prefix)

---

### Step 11d: Add LOS-only collision validation

Since `LocalOfficeSettingsSelectors` is excluded from `ALL_SELECTORS`, it gets zero collision detection. If a future developer adds a key that collides with login or shared selectors, nobody will know. Add a separate validation call:
```typescript
// Validate LOS selectors don't collide with non-Location modules
// (LOS is allowed to "collide" with Location Settings — different pages, same button names)
const _LOS_COLLISION_CHECK = buildAllSelectors(
  MicrosoftLoginSelectors,
  LocalOfficeSettingsSelectors,
);
```
This catches cross-module collisions without mixing LOS into the Location Settings lookup.

---

### Step 11e: Clean stale diagnostic files

Delete 3 stale diagnostic files that reference old paths (will be regenerated on next test run):
- `reports/diagnostics/location-local-office-settings.diagnostics.json`
- `reports/diagnostics/location-local-office-ect.diagnostics.json`
- `reports/diagnostics/location-local-office-history.diagnostics.json`

Also grep `reports/failure-summary.json` and `reports/fixme-registry.json` for `location-local-office` old paths and clean stale entries.

---

### Step 12: Update fixtures.ts

**File: `tests/setup/fixtures.ts`**

1. Change import path: `from '../../src/pages/setup/local-office/local-office-settings.page'`
2. Change class name: `LocalOfficeSettingsPage`
3. Rename fixture key: `locationLocalOfficeSettingsPage` → `localOfficeSettingsPage`
4. Update `TestFixtures` type accordingly
5. Update ALL other Location Settings page import paths to include `setup/` prefix:
   ```typescript
   import { LocationCurrencyPage } from '../../src/pages/setup/locations/location-currency.page';
   // etc. for all 10 location page imports
   ```

---

### Step 13: Update barrel exports

**File: `src/pages/index.ts`** — update ALL paths to `setup/` prefix and add missing exports:
```typescript
export { LoginPage } from './login.page';
export { HomePage } from './home.page';
export { LocationCurrencyPage } from './setup/locations/location-currency.page';
export { LocationLocalInfoPage } from './setup/locations/location-local-info.page';
export { LocationPricingPage } from './setup/locations/location-pricing.page';
export { LocationAccountAddressPage } from './setup/locations/location-account-address.page';
export { LocationNotesPage } from './setup/locations/location-notes.page';
export { LocationLegalPage } from './setup/locations/location-legal.page';
export { LocationSharedSetupLocationsPage } from './setup/locations/location-shared-setup-locations.page';
export { LocationAutoAddonPage } from './setup/locations/location-auto-addon.page';
export { LocalOfficeSettingsPage } from './setup/local-office/local-office-settings.page';
```

---

### Step 14: Update all spec fixture references

All specs that used `locationLocalOfficeSettingsPage` must use `localOfficeSettingsPage`:

| File (after move) | Fixture rename |
|-------------------|---------------|
| `tests/specs/setup/local-office/local-office-settings.spec.ts` | `locationLocalOfficeSettingsPage` → `localOfficeSettingsPage` |
| `tests/specs/setup/local-office/local-office-history.spec.ts` | same |
| `tests/specs/setup/local-office/local-office-ect.spec.ts` | same |

Also update import paths in ALL Location Settings spec files (the `../../setup/fixtures` import stays the same since specs moved one level deeper):
- All specs in `tests/specs/setup/locations/` must import from `../../../setup/fixtures` (was `../../setup/fixtures`)
- All specs in `tests/specs/setup/local-office/` must import from `../../../setup/fixtures`

---

### Step 15: Update all relative import paths in page objects

After moving pages from `src/pages/locations/` → `src/pages/setup/locations/`, every relative import changes:

| Import pattern | Before | After |
|----------------|--------|-------|
| `from '../../selectors'` | from `src/pages/locations/` | from `src/pages/setup/locations/` → `../../../selectors` |
| `from '../../common/base-page'` | from `src/pages/locations/` | from `src/pages/setup/locations/` → `../../../common/base-page` |
| `from '../../utils/logger'` | same | `../../../utils/logger` |
| `from '../../framework-contracts'` | same | `../../../framework-contracts` |

**Every page object in `src/pages/setup/locations/` needs relative path updates.** (10 files × ~3-5 imports each)

Similarly for `src/pages/setup/local-office/local-office-settings.page.ts`:
- `../../selectors` → `../../../selectors`
- `../../common/base-page` → `../../../common/base-page`
- etc.

---

### Step 16: Update all relative import paths in test data

After moving from `tests/test-data/locations/` → `tests/test-data/setup/locations/`:

| Import pattern | Before | After |
|----------------|--------|-------|
| `from '../../../src/selectors'` | from `tests/test-data/locations/` | from `tests/test-data/setup/locations/` → `../../../../src/selectors` |

**Every test data file needs relative path updates.** (8 location files + 1 LOS file)

---

### Step 17: Add agent-mistakes.md rule

**File: `specs_planning/_internal/agent-mistakes.md`**

Add new rule:
```
### MOD-001: Local Office Settings is NOT part of the Locations module
Local Office Settings (`/settings/local-office`) and Location Settings (`/settings/location`) are COMPLETELY DIFFERENT PAGES.
- Different URLs, different tabs, different business domain
- NEVER put Local Office Settings files in `locations/` directories
- NEVER merge Local Office Settings selectors into Location Settings selector objects
- REQUIREMENTS.md line 972 has this warning — READ IT
- Historical context: This conflation was discovered 2026-03-25 and cost a P0 plan to fix (65 files moved)
```

---

### Step 18: Add Learned Rule LR-017 to CLAUDE.md

```markdown
### LR-017: Different pages MUST have separate selector namespaces and directories
Pages at different URLs are DIFFERENT pages. Never merge selectors into a shared flat
object or co-locate files in the same directory. Each page group gets its own selector
partition, own directory, and own collision detection boundary.
"Location Settings" (`/settings/location`) ≠ "Local Office Settings" (`/settings/local-office`).
Check REQUIREMENTS.md and docs/MODULE_REGISTRY.md for page boundaries before creating any new page object.
Directory structure mirrors the app navigation hierarchy: `{section}/{module}/`.
**Trigger**: Any new page object or selector file creation.
```

---

### Step 19: Regenerate SELECTOR_CATALOG.md

```bash
npm run selectors:catalog
```

---

### Step 20: Update or invalidate affected pending plans

These pending plans reference old paths and will be stale after this restructure:
- `PLAN_MAINTAINER_SWEEP.md` — collision fixes now handled differently (some items obsolete)
- `PLAN_FULL_CHAIN_AUDIT.md` — B-01/B-02 findings reference old paths
- `PLAN_CODEBASE_CLEANUP.md` — export paths change
- `PLAN_GENERATOR_AUDIT_AUTO_ADDON.md` — collision references

Add a note at the top of each: `⚠️ STALE: Paths changed by PLAN_P0_LOCAL_OFFICE_DECONTAMINATION. Review before executing.`

---

## Full Impact Map (every file that changes)

### MOVE — Local Office Settings (8 files)
| From | To |
|------|----|
| `src/selectors/locations/local-office-settings.ts` | `src/selectors/setup/local-office/local-office-settings.ts` |
| `src/pages/locations/location-local-office-settings.page.ts` | `src/pages/setup/local-office/local-office-settings.page.ts` |
| `tests/specs/locations/location-local-office-settings.spec.ts` | `tests/specs/setup/local-office/local-office-settings.spec.ts` |
| `tests/specs/locations/location-local-office-history.spec.ts` | `tests/specs/setup/local-office/local-office-history.spec.ts` |
| `tests/specs/locations/location-local-office-ect.spec.ts` | `tests/specs/setup/local-office/local-office-ect.spec.ts` |
| `tests/test-data/locations/location-local-office-settings.data.ts` | `tests/test-data/setup/local-office/local-office-settings.data.ts` |
| `specs_planning/test-cases/locations/locations_local_office_settings_test_cases.md` | `specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` |
| `specs_planning/test-plans/locations/locations_local_office_settings_test_plan.md` | `specs_planning/test-plans/setup/local-office/local_office_settings_test_plan.md` |

### MOVE — Location Settings to setup/ hierarchy (56 files)
| Directory | Files | From | To |
|-----------|-------|------|----|
| Selectors | 10 | `src/selectors/locations/` | `src/selectors/setup/locations/` |
| Page objects | 10 | `src/pages/locations/` | `src/pages/setup/locations/` |
| Specs | 8 | `tests/specs/locations/` | `tests/specs/setup/locations/` |
| Test data | 8 | `tests/test-data/locations/` | `tests/test-data/setup/locations/` |
| Test cases | 10 | `specs_planning/test-cases/locations/` | `specs_planning/test-cases/setup/locations/` |
| Test plans | 10 | `specs_planning/test-plans/locations/` | `specs_planning/test-plans/setup/locations/` |

### EDIT — Code changes (20+ files)
| File (after move) | What changes |
|------|-------------|
| `src/selectors/index.ts` | Nuke `SetupSelectors`, create `LocationSettingsSelectors`, fix `ALL_SELECTORS`, update ALL import/re-export paths, add onboarding rules |
| `src/pages/setup/local-office/local-office-settings.page.ts` | Rename class, override getElement, fix all relative imports |
| `src/pages/setup/locations/location-form-helpers.page.ts` | `SetupSelectors` → `LocationSettingsSelectors`, fix relative imports |
| `src/pages/setup/locations/location-test-orchestrators.page.ts` | `SetupSelectors` → `LocationSettingsSelectors`, fix relative imports |
| `src/pages/setup/locations/location-currency.page.ts` | `SetupSelectors` → `LocationSettingsSelectors`, fix relative imports |
| `src/pages/setup/locations/location-pricing.page.ts` | Fix relative imports, update @agent-doc |
| `src/pages/setup/locations/location-local-info.page.ts` | Fix relative imports, update @agent-doc |
| `src/pages/setup/locations/location-notes.page.ts` | Fix relative imports, update @agent-doc |
| `src/pages/setup/locations/location-account-address.page.ts` | Fix relative imports, update @agent-doc |
| `src/pages/setup/locations/location-legal.page.ts` | Fix relative imports |
| `src/pages/setup/locations/location-shared-setup-locations.page.ts` | Fix relative imports, update @agent-doc |
| `src/pages/setup/locations/location-auto-addon.page.ts` | Fix relative imports |
| `src/pages/index.ts` | Update ALL export paths to setup/ hierarchy, add missing exports |
| `src/index.ts` | `SetupSelectors` → `LocationSettingsSelectors` |
| `scripts/generator-validate-selectors.ts` | `SetupSelectors` → `LocationSettingsSelectors` in SELECTOR_OBJECT_NAMES |
| `scripts/scan-fixmes.ts` | Update `MODULE_PREFIX_MAP` for `setup/locations` structure, verify `SPECS_DIR` scan path |
| `src/common/base-page.ts` | **CRITICAL**: Update `CheckboxState` import from `../pages/locations/` → `../pages/setup/locations/` |
| `tests/setup/fixtures.ts` | Update ALL import paths to setup/ hierarchy, rename LOS fixture + class |
| `tests/test-data/setup/local-office/local-office-settings.data.ts` | Fix type to use `LocalOfficeSettingsSelectors`, fix relative imports |
| `tests/test-data/setup/locations/location-local-info.data.ts` | `SetupSelectors` → `LocationSettingsSelectors`, fix relative imports |
| `tests/test-data/setup/locations/*.data.ts` (6 more files) | Fix relative imports |
| `tests/specs/setup/local-office/*.spec.ts` (3 files) | Fixture rename, URL assertion fix, fix relative imports |
| `tests/specs/setup/locations/*.spec.ts` (8 files) | Fix relative imports (fixtures path depth changes) |
| `specs_planning/_internal/agent-mistakes.md` | Add MOD-001 rule |
| `CLAUDE.md` | Add LR-017 |
| `export_test_cases/to-csv.ts` | Add TC-LOS branch in `generatePreconditions()`, add LOS→local-office in `extractModule()` moduleMap |
| `scripts/task-context-builder.ts` | Add `'local-office'` entry to `MODULE_SECTION_MAP` |
| `export_test_cases/README.md` | Update code→directory mapping table, fix KNOWN_SUB_CODES doc bug |
| `specs_planning/_internal/agent-queue.json` | Fix LOS entry: module→local-office, stage→testing, feature name |

### DELETE (3+ files)
| File | Reason |
|------|--------|
| `reports/diagnostics/location-local-office-settings.diagnostics.json` | Stale — references old paths, regenerated on next test run |
| `reports/diagnostics/location-local-office-ect.diagnostics.json` | Same |
| `reports/diagnostics/location-local-office-history.diagnostics.json` | Same |
| Stale entries in `reports/failure-summary.json`, `reports/fixme-registry.json` | Grep for `location-local-office` old paths, clean entries |

### REGENERATE (1 file)
| File | How |
|------|-----|
| `src/selectors/SELECTOR_CATALOG.md` | `npm run selectors:catalog` |

### MARK STALE (4 files)
| File | Add stale warning header |
|------|------------------------|
| `plans/pending/PLAN_MAINTAINER_SWEEP.md` | Collision items partially obsolete |
| `plans/pending/PLAN_FULL_CHAIN_AUDIT.md` | B-01/B-02 paths changed |
| `plans/pending/PLAN_CODEBASE_CLEANUP.md` | Export paths changed |
| `plans/pending/PLAN_GENERATOR_AUDIT_AUTO_ADDON.md` | Collision refs changed |

### CREATE (Part B — 1 file)
| File | Purpose |
|------|---------|
| `docs/MODULE_REGISTRY.md` | Page-to-directory mapping — single source of truth for all agents |

### EDIT (Part B — 8 files)
| File | What changes |
|------|-------------|
| `.github/agents/playwright-test-planner.agent.md` | Add MODULE ROUTING rules section |
| `.github/agents/playwright-test-generator.agent.md` | Add MODULE ROUTING rules section |
| `.github/agents/playwright-requirements.agent.md` | Add MODULE ROUTING rules section |
| `.github/agents/playwright-test-healer.agent.md` | Add MODULE ROUTING with correct LOS paths |
| `.github/agents/playwright-pipeline-audit.agent.md` | Add MODULE_REGISTRY validation + LOS boundary check |
| `.github/agents/playwright-framework-maintainer.agent.md` | Add MODULE ROUTING for selector/page maintenance |
| `.github/copilot-instructions.md` | Reference MODULE_REGISTRY for file paths |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` | Add §12 Module Boundary Enforcement |

**Total impact: 64 moves + ~43 edits + 1 create + 1 regenerate + 4 stale marks + 3 deletes = ~116 file operations**

---

## Verification

1. **TypeScript**: `npx tsc --noEmit` — zero errors
2. **Collision detection works**: Temporarily add duplicate key across two partitions → `buildAllSelectors` must throw
3. **btnSave resolves correctly**: `node -e "const s = require('./src/selectors'); console.log(s.getTsSelector('btnSave'))"` → must return `location-settings-btn-save` (NOT `local-office-settings-btn-save`)
4. **Local Office selector accessible**: `node -e "const s = require('./src/selectors'); console.log(s.LocalOfficeSettingsSelectors.btnSave)"` → `local-office-settings-btn-save`
5. **No stale references**: `git grep SetupSelectors` → zero results (fully replaced with `LocationSettingsSelectors`)
6. **No files left behind**: `ls src/selectors/locations/` → directory should NOT exist (everything moved to setup/locations/)
7. **No flat dirs**: `ls src/selectors/local-office/` → should NOT exist (should be setup/local-office/)
8. **Catalog regenerated**: `npm run selectors:catalog` → clean
9. **Smoke test**: `npm test -- --project=chrome tests/seed.spec.ts` — passes
10. **Local Office specs**: `npm test -- --project=chrome tests/specs/setup/local-office/` — passes
11. **Location Settings specs**: `npm test -- --project=chrome tests/specs/setup/locations/` — passes (no regressions)
12. **Import paths**: `git grep "from '../../selectors'" src/pages/setup/` → zero results (should be `../../../selectors`)
13. **Import paths**: `git grep "from '../../../src/selectors'" tests/test-data/setup/` → zero results (should be `../../../../src/selectors`)

---

---

## PART B: FUTURE-PROOFING — Prevent agents from EVER repeating this

### Root cause (WHY agents did this)
1. **No module registry** — agents have no lookup table mapping pages to modules
2. **Only one example module exists** (`locations/`) — copy-paste defaults there
3. **No URL-to-module mapping rule** in any agent prompt
4. **REQUIREMENTS.md warning ignored** — agents don't read it before creating files
5. **Golden reference** in generator prompt points to `tests/specs/locations/` — next agent copies that
6. **Queue items** passed with `module: "locations"` — never questioned by any agent
7. **Flat directory structure** — no hierarchy to signal that pages belong to nav sections

### Step 21: Create MODULE_REGISTRY.md

**File: `docs/MODULE_REGISTRY.md`** — single source of truth for all pages/modules

```markdown
# Module Registry — Page-to-Directory Mapping

Every page in Navigator4 belongs to exactly ONE module within a top-level section.
This registry determines where ALL files go: selectors, page objects, specs, test data, test cases.

## How to use this registry
1. Before creating ANY new file, look up the page's module here
2. If the page doesn't exist in this registry, ADD IT before creating files
3. Section = top-level nav item (Setup, Actions, Tax, etc.)
4. Module = sub-page within that section
5. Different URLs = different modules. ALWAYS.

## Registry

### Root-level (no nav section)
| Module ID | Page Name | URL Pattern | Directory |
|-----------|-----------|-------------|-----------|
| `login` | Microsoft SSO Login | `/auth/sign-in` | `login.*` (root) |
| `home` | Dashboard/Home | `/home` | `home.*` (root) |

### Setup section (`/settings/...`)
| Module ID | Page Name | URL Pattern | Directory |
|-----------|-----------|-------------|-----------|
| `setup/locations` | Location Settings | `/settings/location` | `setup/locations/` |
| `setup/local-office` | Local Office Settings | `/settings/local-office` | `setup/local-office/` |
| `setup/corporate-billing` | Corporate Billing | `/settings/corporate-billing` | `setup/corporate-billing/` |
| `setup/corporate-pricing` | Corporate Pricing | `/settings/corporate-pricing` | `setup/corporate-pricing/` |
| `setup/corporate-pg-pricing` | Corp PG Pricing Override | `/settings/corporate-pg-pricing-override` | `setup/corporate-pg-pricing/` |
| `setup/discount-optimization` | Discount Optimization | `/settings/discount-optimization` | `setup/discount-optimization/` |
| `setup/discount-matrix` | Discount Matrix | `/settings/discount-matrix` | `setup/discount-matrix/` |
| `setup/ect-settings` | ECT Settings | `/settings/ect` | `setup/ect-settings/` |
| `setup/users` | Users | `/settings/users` | `setup/users/` |
| `setup/bill-through-date` | Bill Through Date | `/settings/bill-through-date` | `setup/bill-through-date/` |
| `setup/service-type` | Service Type | `/settings/service-type` | `setup/service-type/` |
| `setup/service-type-name` | Service Type Name | `/settings/service-type-name` | `setup/service-type-name/` |
| `setup/service-charge` | Service Charge | `/settings/service-charge` | `setup/service-charge/` |

### Other sections (add rows as pages are automated)

Sections below exist in Navigator Cloud but are not yet automated. When a planner/generator
starts work on any of these pages, they MUST add the entry here BEFORE creating any files.

| Section | Known Sub-Pages (from MCP nav map 2026-03-25) |
|---------|-----------------------------------------------|
| **Actions** | Sourcing Dashboard, Reports, Offline Reports, Reports Statistics, Approve Equipment Transfers, Release Notes, Search Statistics, Fix Unlinked CRM Orders, FAQ |
| **Commissions** | CMP, Allow DPCD, Tier/Flat, Product Code |
| **Tax** | Order Origin Tax, Sales, Special Rate, State Tax, Tax Type Detail |
| **Search** | Order/Job/Asset/Customer/DRO/Payment/Item/ECT Search, Event Agendas |

Directory convention for these sections follows the same `{section}/{module}/` pattern:
- `actions/sourcing-dashboard/`, `commissions/cmp/`, `tax/order-origin/`, `search/order/`, etc.

## Directory Convention (six parallel trees)

For any module `{section}/{mod}`:
- Selectors: `src/selectors/{section}/{mod}/`
- Page objects: `src/pages/{section}/{mod}/`
- Specs: `tests/specs/{section}/{mod}/`
- Test data: `tests/test-data/{section}/{mod}/`
- Test cases: `specs_planning/test-cases/{section}/{mod}/`
- Test plans: `specs_planning/test-plans/{section}/{mod}/`

## Rules
- One page = one module directory. No exceptions.
- Tabs within a page are NOT separate modules (e.g., Currency is a tab in Location Settings → stays in `setup/locations/`)
- If two pages share a URL prefix but have different suffixes → DIFFERENT modules
- Shared components (dialogs, nav) go in `src/selectors/shared/` and `src/pages/components/`
- Directory hierarchy mirrors the app navigation hierarchy
```

---

### Step 22: Update agent prompts with module-routing rules

**22a. `.github/agents/playwright-test-planner.agent.md`** — add MODULE ROUTING section:
```
## MODULE ROUTING (MANDATORY)
Before creating ANY output file:
1. Read `docs/MODULE_REGISTRY.md` to find the correct module for this page
2. If the page is NOT in the registry → STOP. Add it to the registry FIRST
3. Use the module ID for ALL file paths: test-cases/{section}/{module}/, test-plans/{section}/{module}/
4. NEVER assume a page belongs to an existing module. Verify by URL.
5. Different URL paths = different modules. `/settings/location` ≠ `/settings/local-office`
6. Directory structure mirrors app navigation: {section}/{module}/
```

**22b. `.github/agents/playwright-test-generator.agent.md`** — add MODULE ROUTING section:
```
## MODULE ROUTING (MANDATORY)
Before creating ANY spec, page object, or selector file:
1. Read `docs/MODULE_REGISTRY.md` to find the correct module
2. Create files in the module's directory (src/pages/{section}/{module}/, tests/specs/{section}/{module}/, etc.)
3. If the module directory doesn't exist → CREATE IT. Don't dump into an existing module
4. Each page's selectors go in their OWN selector partition file, in their OWN module directory
5. NEVER add a new page's selectors to an existing merged selector object
6. Golden reference is `tests/specs/setup/locations/location-currency.spec.ts` — copy the PATTERN, not the PATH
```

**22c. `.github/agents/playwright-requirements.agent.md`** — add MODULE ROUTING section (same as planner). Line 27 references URL patterns — verify they still match.

**22d. `.github/agents/playwright-test-healer.agent.md`** — add MODULE ROUTING section:
```
LOS specs are at tests/specs/setup/local-office/, NOT tests/specs/locations/
LOS page object is at src/pages/setup/local-office/, NOT src/pages/locations/
LOS selectors are at src/selectors/setup/local-office/, NOT src/selectors/locations/
Always check docs/MODULE_REGISTRY.md before searching for files to heal.
```

**22e. `.github/agents/playwright-pipeline-audit.agent.md`** — add MODULE ROUTING awareness:
```
Validate module directory matches docs/MODULE_REGISTRY.md during audits.
Flag any LOS artifacts found in locations/ directories as P0 module boundary violations.
```

**22f. `.github/agents/playwright-framework-maintainer.agent.md`** — add MODULE ROUTING section:
```
When maintaining selectors or page objects, check docs/MODULE_REGISTRY.md for correct module.
Each module has its own selector partition. Never merge selectors across modules.
```

**22g. `.github/copilot-instructions.md`** — update file path rules to reference MODULE_REGISTRY

---

### Step 23: Update AGENT_SHARED_RULES.md — add §12 Module Boundary Enforcement

**File: `docs/read_only_docs/AGENT_SHARED_RULES.md`**

```
## §12 — Module Boundary Enforcement

1. Every page in Navigator4 belongs to exactly ONE module defined in `docs/MODULE_REGISTRY.md`
2. Different URLs = different modules. No exceptions.
3. Before creating ANY file, verify the correct module by checking the registry
4. If a module directory doesn't exist, CREATE IT — don't force files into an existing module
5. Tabs within a page are NOT separate modules. A tab shares its parent page's module
6. Selector partitions MUST be kept separate per module. Never spread one module's selectors into another's merged object
7. Collision detection in `src/selectors/index.ts` checks ALL partitions individually — if you add a new partition, add it to `buildAllSelectors()` call
8. Violation of module boundaries is a P0 bug — same severity as broken tests
9. Directory hierarchy mirrors app navigation: {section}/{module}/ (e.g., setup/locations/, actions/reports/)
```

---

### Step 24: Create shared components directory (future-proof)

```
src/selectors/shared/     ← for cross-page selectors (error dialogs, nav, etc.)
src/pages/components/     ← for reusable component page objects (dialogs, tables, nav)
```

---

## Full Execution Order (dependency chain)

```
PART A — Decontamination (Steps 1-22)
  1.  Fix 5 intra-Location-Settings selector collisions (Step 3c prerequisite)
      → dlgSaveChanges, btnSaveChangesCancel/Confirm, dlgUnsavedChanges, toastLocalInfoUpdated
      → MCP-verify which are shared vs. tab-specific, deduplicate or prefix
  2.  Create directory structure (mkdir -p) — setup/local-office/ + setup/locations/ in all 6 trees
  3.  Move LOS files (git mv) — 8 files from locations/ to setup/local-office/
  4.  Move Location Settings files (git mv) — 56 files from locations/ to setup/locations/
  5.  Delete empty locations/ directories
  6.  Edit src/selectors/index.ts — nuke SetupSelectors, create LocationSettingsSelectors,
      fix ALL_SELECTORS (individual partitions), add LOS collision validation (Step 11d),
      update all import paths, add onboarding rules
  7.  Edit src/index.ts — SetupSelectors → LocationSettingsSelectors
  8.  Edit scripts/generator-validate-selectors.ts — SetupSelectors → LocationSettingsSelectors
  9.  Edit scripts/scan-fixmes.ts — update MODULE_PREFIX_MAP for setup/ paths
  10. Edit src/common/base-page.ts — CRITICAL: update CheckboxState import path
  11. Edit ALL page objects — fix relative imports (../../ → ../../../),
      SetupSelectors → LocationSettingsSelectors, rename LOS class, override getElement
  12. Edit barrel exports (src/pages/index.ts) — update all paths, add missing exports
  13. Edit fixtures.ts — update all import paths, rename LOS fixture + class
  14. Edit ALL specs — fix relative imports (../../setup/fixtures → ../../../setup/fixtures)
  15. Edit ALL test data — fix relative imports (../../../src/ → ../../../../src/), type refs
  16. Fix URL assertion bug in LOS spec
  17. Fix CSV export pipeline (Step 11b) — to-csv.ts, task-context-builder.ts, README.md
  18. Fix agent-queue.json LOS entry (Step 11c) — module, stage, feature name
  19. Delete stale diagnostic files (Step 11e) — 3 files + stale report entries
  20. Add rules (agent-mistakes.md MOD-001, CLAUDE.md LR-017)
  21. Regenerate SELECTOR_CATALOG.md
  22. Mark 4 stale plans

PART B — Future-Proofing (Steps 21-24)
  23. Create docs/MODULE_REGISTRY.md with full nav hierarchy (Step 21)
  24. Update .github/agents/playwright-test-planner.agent.md — add MODULE ROUTING (Step 22a)
  25. Update .github/agents/playwright-test-generator.agent.md — add MODULE ROUTING (Step 22b)
  26. Update .github/agents/playwright-requirements.agent.md — add MODULE ROUTING (Step 22c)
  27. Update .github/agents/playwright-test-healer.agent.md — add MODULE ROUTING (Step 22d)
  28. Update .github/agents/playwright-pipeline-audit.agent.md — add MODULE ROUTING (Step 22e)
  29. Update .github/agents/playwright-framework-maintainer.agent.md — add MODULE ROUTING (Step 22f)
  30. Update .github/copilot-instructions.md — reference MODULE_REGISTRY (Step 22g)
  31. Update docs/read_only_docs/AGENT_SHARED_RULES.md — add §12 (Step 23)
  32. Create src/pages/components/ directory (Step 24)

VERIFICATION (17 checks)
  33. npx tsc --noEmit — zero errors
  34. buildAllSelectors individual partitions — no collisions (Step 1 prerequisite verified)
  35. LOS collision validation — _LOS_COLLISION_CHECK passes (Step 11d)
  36. btnSave resolves to location-settings-btn-save in ALL_SELECTORS
  37. LocalOfficeSettingsSelectors.btnSave = local-office-settings-btn-save
  38. git grep SetupSelectors → zero results
  39. git grep "from '../../selectors'" src/pages/setup/ → zero results (should be ../../../)
  40. git grep "from '../../../src/selectors'" tests/test-data/setup/ → zero results (should be ../../../../)
  41. git grep "pages/locations/" → zero results (all moved to pages/setup/locations/)
  42. ls src/selectors/locations/ → should NOT exist
  43. npm run selectors:catalog → clean
  44. npm test -- --project=chrome tests/seed.spec.ts — passes
  45. npm test -- --project=chrome tests/specs/setup/local-office/ — passes
  46. npm test -- --project=chrome tests/specs/setup/locations/ — passes
  47. Check all 6 agent prompts reference MODULE_REGISTRY
  48. base-page.ts imports from ../pages/setup/locations/ (not ../pages/locations/)
  49. agent-queue.json LOS entry has module=local-office, stage=testing
```
