/**
 * @agent-doc
 * PURPOSE: Page Objects Barrel Export - central import point for all page objects. Simplifies imports across tests.
 * OWNER: generator
 * IMPACT: low - Just a convenience export. Breaking it requires updating import statements.
 * DEPENDS-ON: login.page.ts, home.page.ts, setup/locations/*.page.ts, setup/local-office/*.page.ts
 * USED-BY: tests/setup/fixtures.ts, any file importing page objects
 * RULES: Always export new page objects here. Keep alphabetical order. One export per line.
 */

/**
 * Page Objects Barrel Export
 * Central import point for all page objects
 */

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
