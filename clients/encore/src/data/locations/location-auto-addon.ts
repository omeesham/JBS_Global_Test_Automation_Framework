/**
 * Test data for: Location Auto Add-On tab
 * Consumed by: tests/locations/location-auto-addon.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * @office-dependent — checkbox defaults tied to office 1604
 * Changing values here affects the listed spec.
 */

/** Auto Add-On checkbox defaults for location 1604 (MCP-verified ). */
export const AUTO_ADDON_DEFAULTS = [
  { key: 'chkAutoAddonEncoreMusic', name: 'Encore Music', checked: true },
  { key: 'chkAutoAddonWirelessPresenter', name: 'Wireless Presenter', checked: true },
  { key: 'chkAutoAddonExpressContentDesignSession', name: 'Express Content Design Session', checked: false },
  { key: 'chkAutoAddonWordly', name: 'Wordly', checked: true },
  { key: 'chkAutoAddonLabor', name: 'Labor', checked: true },
] as const;

/** Data-driven persistence cases for TC-017/018 (MNT-008: identical flow, different key). */
export const UNCHECK_PERSISTENCE_CASES = [
  { key: 'chkAutoAddonWordly', name: 'Wordly', tc: 'TC-LOC-AAO-017' },
  { key: 'chkAutoAddonLabor', name: 'Labor', tc: 'TC-LOC-AAO-018' },
] as const;
