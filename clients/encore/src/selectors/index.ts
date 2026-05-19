// ==================== IMPORTS ====================
import { MicrosoftLoginSelectors } from './auth/login';
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
import { SetupHistorySelectors } from './locations/history';
import { LocalOfficeSettingsSelectors } from './local-office/local-office-settings';

// ==================== RE-EXPORTS ====================
export { MicrosoftLoginSelectors } from './auth/login';
export { DynamicSelectors } from './auth/dynamic';
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
export { SetupHistorySelectors } from './locations/history';
export { LocalOfficeSettingsSelectors } from './local-office/local-office-settings';

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
