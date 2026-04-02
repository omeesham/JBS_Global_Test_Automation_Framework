/**
 * Test data for: Location Auto Add-On tab
 * Consumed by: tests/specs/setup/locations/location-auto-addon.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * Last verified: 2026-04-01
 * @office-dependent — checkbox defaults tied to office 1604
 *
 * Changing values here affects the listed spec.
 */

/** Auto Add-On checkbox defaults for location 1604 (MCP-verified 2026-03-24). */
export const AUTO_ADDON_DEFAULTS = [
  { key: 'chkAutoAddonEncoreMusic', name: 'Encore Music', checked: true },
  { key: 'chkAutoAddonWirelessPresenter', name: 'Wireless Presenter', checked: true },
  { key: 'chkAutoAddonExpressContentDesignSession', name: 'Express Content Design Session', checked: false },
  { key: 'chkAutoAddonWordly', name: 'Wordly', checked: true },
  { key: 'chkAutoAddonLabor', name: 'Labor', checked: true },
] as const;
