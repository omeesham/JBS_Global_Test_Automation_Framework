/**
 * @agent-doc
 * PURPOSE: Barrel export -- re-exports partitioned selectors with collision detection.
 * OWNER: planner, generator, healer
 * IMPACT: critical - wrong selectors = all page objects and tests fail
 * DEPENDS-ON: ./login, ./dynamic, ./setup/locations/*, ./setup/local-office/*
 * USED-BY: all page objects (via getTsSelector), common-methods.ts, base-page.ts, src/index.ts
 * RULES: Use camelCase with type prefix (btn, txt, lnk, drp, chk). Never delete existing selectors, only add/fix. DISCOVER_ prefix = placeholder for planner to fill during exploration.
 * CATALOG: Auto-generated searchable index at src/selectors/SELECTOR_CATALOG.md -- run `npm run selectors:catalog` to regenerate.
 * ANNOTATIONS: Every selector key MUST have `@where @el @text @keys` JSDoc annotation. See COMMENTING_STANDARDS.md.
 * ONBOARDING: When adding a new page's selectors:
 *   1. Create a NEW file in src/selectors/{section}/{module}/ (check docs/MODULE_REGISTRY.md)
 *   2. Import and re-export the new partition here
 *   3. Add it to buildAllSelectors() as a SEPARATE argument (collision detection)
 *   4. Do NOT add it to LocationSettingsSelectors or any other merged page object
 *   5. If the page needs its own merged object, create one (e.g., LocalOfficeSettingsSelectors)
 */

// ==================== IMPORTS ====================
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
import { SetupHistorySelectors } from './setup/locations/history';
import { LocalOfficeSettingsSelectors } from './setup/local-office/local-office-settings';

// ==================== RE-EXPORTS ====================
export { MicrosoftLoginSelectors } from './login';
export { DynamicSelectors } from './dynamic';
export { SetupLeftPanelSelectors } from './setup/locations/left-panel';
export { SetupLocalInfoSelectors } from './setup/locations/local-info';
export { SetupCurrencySelectors } from './setup/locations/currency';
export { SetupPricingSelectors } from './setup/locations/pricing';
export { SetupAccountAddressSelectors } from './setup/locations/account-address';
export { SetupSharedSelectors } from './setup/locations/shared';
export { SetupSharedSetupLocationsSelectors } from './setup/locations/shared-setup-locations';
export { SetupNotesSelectors } from './setup/locations/notes';
export { SetupLegalSelectors } from './setup/locations/legal';
export { SetupAutoAddonSelectors } from './setup/locations/auto-addon';
export { SetupHistorySelectors } from './setup/locations/history';
export { LocalOfficeSettingsSelectors } from './setup/local-office/local-office-settings';

// ==================== MERGED PAGE OBJECTS ====================

/** Location Settings selectors — ONLY Location Settings partitions (NOT Local Office). */
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
  ...SetupHistorySelectors,
} as const;

// ==================== COLLISION DETECTION + LOOKUP ====================

/** Merge all static selector objects with collision detection (excludes dynamic selectors). */
function buildAllSelectors(...objects: Record<string, string>[]): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      if (merged[key]) throw new Error(`Selector collision: "${key}" defined in multiple groups`);
      merged[key] = value;
    }
  }
  return merged;
}

// Pass each Location Settings partition individually for intra-LS collision detection.
// NOTE: LocalOfficeSettingsSelectors deliberately EXCLUDED from ALL_SELECTORS.
// It has keys (btnSave, tabBasicInformation) that collide with Location Settings
// but point to DIFFERENT elements on a DIFFERENT page. Including it would throw.
// Local Office pages access their selectors via LocalOfficeSettingsSelectors directly.
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
  SetupHistorySelectors,
);

// Validate LOS selectors don't collide with non-Location modules.
// (LOS is allowed to "collide" with Location Settings — different pages, same button names)
const _LOS_COLLISION_CHECK = buildAllSelectors(
  MicrosoftLoginSelectors,
  LocalOfficeSettingsSelectors,
);

/**
 * Get TypeScript selector by element name.
 * For dynamic selectors, use DynamicSelectors directly: DynamicSelectors.lnkOfficeCode('1604')
 * @returns selector string or null if not found
 */
export function getTsSelector(elementName: string): string | null {
  return ALL_SELECTORS[elementName] ?? null;
}
