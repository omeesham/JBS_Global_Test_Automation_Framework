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
  CorporatePricingOverrideSelectors,
  CorporatePricingNewPricebookSelectors,
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
void buildAllSelectors(
  MicrosoftLoginSelectors,
  LocalOfficeSettingsSelectors,
  LocalOfficeHistorySelectors,
  LocalOfficeEctSelectors,
);

// Corporate Pricing — distinct multi-screen module (own selector namespace). Like Local Office, DELIBERATELY
// EXCLUDED from ALL_SELECTORS. Reason (comment corrected 2026-06-10 — the prior note wrongly named
// `btnSearch`/`btnReset` as *currently colliding* Location-Settings keys; they are NOT in the Location
// partitions at all, and a CP-keys ∩ Location/Local-Office-keys intersection is presently EMPTY because
// CP namespaces on purpose: `btnSaveDetails` not `btnSave`, `txtFilter*`, plus `ovr`/`np` prefixes).
// The exclusion is BY-DESIGN, not collision-driven: CP page objects resolve `CorporatePricingSelectors.*`
// DIRECTLY via `this.page.locator(...)` (text/role/grid-header — near-zero data-testid, D8), never through
// getTsSelector/ALL_SELECTORS, so merging CP in would add nothing. It also keeps CP's generic single-word
// keys (btnSearch, btnReset, btnExport, btnImport, btnNew, btnGridOptions) permanently clear of the
// Location partitions' own generic keys — which DO include a `btnSave` (5×) — as both modules grow.
// This check verifies the 6 CP screen partitions don't collide with EACH OTHER (intra-module boundary):
// Override uses `ovr`-prefixed keys and New Pricebook (NM-1440) uses `np`-prefixed keys,
// so each shares zero keys with Search and with each other.
void buildAllSelectors(
  CorporatePricingSearchSelectors,
  CorporatePricingDetailsSelectors,
  CorporatePricingStrategySelectors,
  CorporatePricingDetailGridSelectors,
  CorporatePricingOverrideSelectors,
  CorporatePricingNewPricebookSelectors,
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
