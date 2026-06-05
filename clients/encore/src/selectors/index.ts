// ==================== IMPORTS ====================
import { MicrosoftLoginSelectors } from './auth/login';
import { SetupLeftPanelBasicInformationSelectors } from './locations/left-panel-basic-information';
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
import { LocalOfficeHistorySelectors } from './local-office/local-office-history';
import { LocalOfficeEctSelectors } from './local-office/local-office-ect';
import {
  CorporatePricingSelectors,
  CorporatePricingSearchSelectors,
  CorporatePricingDetailsSelectors,
  CorporatePricingStrategySelectors,
  CorporatePricingDetailGridSelectors,
} from './corporate-pricing';

// ==================== RE-EXPORTS ====================
export { MicrosoftLoginSelectors } from './auth/login';
export { DynamicSelectors } from './auth/dynamic';
export { SetupLeftPanelBasicInformationSelectors } from './locations/left-panel-basic-information';
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
export { LocalOfficeHistorySelectors } from './local-office/local-office-history';
export { LocalOfficeEctSelectors } from './local-office/local-office-ect';
export { CorporatePricingSelectors } from './corporate-pricing';

// ==================== MERGED PAGE OBJECTS ====================

/** Location Settings selectors — ONLY Location Settings partitions (NOT Local Office). */
export const LocationSettingsSelectors = {
  ...SetupLeftPanelBasicInformationSelectors,
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
  SetupLeftPanelBasicInformationSelectors,
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
// HIS + ECT namespaces are namespace-prefixed (drpHistoryType, fldVenueFixedCosts, etc.)
// and share zero keys with Settings — included here to verify same property.
const _LOS_COLLISION_CHECK = buildAllSelectors(
  MicrosoftLoginSelectors,
  LocalOfficeSettingsSelectors,
  LocalOfficeHistorySelectors,
  LocalOfficeEctSelectors,
);

// Corporate Pricing — distinct multi-screen module (LR-017). Like Local Office, DELIBERATELY
// EXCLUDED from ALL_SELECTORS: generic keys (btnSearch, btnReset, page-level Save) collide with
// Location Settings but point to a DIFFERENT page. The page objects access selectors via
// CorporatePricingSelectors directly (text/role/grid-header — near-zero data-testid, D8), not via
// getTsSelector/ALL_SELECTORS. This check verifies the 4 screen partitions don't collide with EACH
// OTHER (intra-module collision boundary, F11).
const _CORPORATE_PRICING_COLLISION_CHECK = buildAllSelectors(
  CorporatePricingSearchSelectors,
  CorporatePricingDetailsSelectors,
  CorporatePricingStrategySelectors,
  CorporatePricingDetailGridSelectors,
);
// Reference the merged namespace so the import is used even though CP is excluded from ALL_SELECTORS.
void CorporatePricingSelectors;

/**
 * Get TypeScript selector by element name.
 * For dynamic selectors, use DynamicSelectors directly: DynamicSelectors.lnkOfficeCode('1604')
 * @returns selector string or null if not found
 */
export function getTsSelector(elementName: string): string | null {
  return ALL_SELECTORS[elementName] ?? null;
}
