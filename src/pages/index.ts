/**
 * @agent-doc
 * PURPOSE: Page Objects Barrel Export - central import point for all page objects. Simplifies imports across tests.
 * OWNER: generator
 * IMPACT: low - Just a convenience export. Breaking it requires updating import statements.
 * DEPENDS-ON: login.page.ts, home.page.ts, locations/location-currency.page.ts, locations/location-local-info.page.ts, locations/location-pricing.page.ts
 * USED-BY: tests/setup/fixtures.ts, any file importing page objects
 * RULES: Always export new page objects here. Keep alphabetical order. One export per line.
 */

/**
 * Page Objects Barrel Export
 * Central import point for all page objects
 */

export { LoginPage } from './login.page';
export { HomePage } from './home.page';
export { LocationCurrencyPage } from './locations/location-currency.page';
export { LocationLocalInfoPage } from './locations/location-local-info.page';
export { LocationPricingPage } from './locations/location-pricing.page';
export { LocationAccountAddressPage } from './locations/location-account-address.page';
export { LocationNotesPage } from './locations/location-notes.page';
