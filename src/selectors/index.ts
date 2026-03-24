/**
 * @agent-doc
 * PURPOSE: Barrel export -- re-exports partitioned selectors with collision detection.
 * OWNER: planner, generator, healer
 * IMPACT: critical - wrong selectors = all page objects and tests fail
 * DEPENDS-ON: ./login, ./dynamic, ./locations/*
 * USED-BY: all page objects (via getTsSelector), common-methods.ts, base-page.ts, src/index.ts
 * RULES: Use camelCase with type prefix (btn, txt, lnk, drp, chk). Never delete existing selectors, only add/fix. DISCOVER_ prefix = placeholder for planner to fill during exploration.
 * CATALOG: Auto-generated searchable index at src/selectors/SELECTOR_CATALOG.md -- run `npm run selectors:catalog` to regenerate.
 * ANNOTATIONS: Every selector key MUST have `@where @el @text @keys` JSDoc annotation. See COMMENTING_STANDARDS.md.
 */

// ==================== IMPORTS ====================
import { MicrosoftLoginSelectors } from './login';
import { SetupLeftPanelSelectors } from './locations/left-panel';
import { SetupLocalInfoSelectors } from './locations/local-info';
import { SetupCurrencySelectors } from './locations/currency';
import { SetupPricingSelectors } from './locations/pricing';
import { SetupAccountAddressSelectors } from './locations/account-address';
import { SetupSharedSelectors } from './locations/shared';
import { SetupSharedSetupLocationsSelectors } from './locations/shared-setup-locations';
import { SetupNotesSelectors } from './locations/notes';
import { SetupLegalSelectors } from './locations/legal';
import { SetupAutoAddonSelectors } from './locations/auto-addon';
import { LocalOfficeSettingsSelectors } from './locations/local-office-settings';

// ==================== RE-EXPORTS ====================
export { MicrosoftLoginSelectors } from './login';
export { DynamicSelectors } from './dynamic';
export { SetupLeftPanelSelectors } from './locations/left-panel';
export { SetupLocalInfoSelectors } from './locations/local-info';
export { SetupCurrencySelectors } from './locations/currency';
export { SetupPricingSelectors } from './locations/pricing';
export { SetupAccountAddressSelectors } from './locations/account-address';
export { SetupSharedSelectors } from './locations/shared';
export { SetupSharedSetupLocationsSelectors } from './locations/shared-setup-locations';
export { SetupNotesSelectors } from './locations/notes';
export { SetupLegalSelectors } from './locations/legal';
export { SetupAutoAddonSelectors } from './locations/auto-addon';
export { LocalOfficeSettingsSelectors } from './locations/local-office-settings';

// ==================== BACKWARD-COMPAT: MERGED SetupSelectors ====================
export const SetupSelectors = {
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
  ...LocalOfficeSettingsSelectors,
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
export const ALL_SELECTORS = buildAllSelectors(MicrosoftLoginSelectors, SetupSelectors);

/**
 * Get TypeScript selector by element name.
 * For dynamic selectors, use DynamicSelectors directly: DynamicSelectors.lnkOfficeCode('1604')
 * @returns selector string or null if not found
 */
export function getTsSelector(elementName: string): string | null {
  return ALL_SELECTORS[elementName] ?? null;
}
