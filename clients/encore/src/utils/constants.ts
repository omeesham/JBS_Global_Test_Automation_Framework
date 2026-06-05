/**
 * Application-wide constants for testing configuration and expected values.
 * Includes timing constants used by page objects and test specs to avoid hardcoded values.
 */

export class AppConstants {
 /**
 * Maximum time to wait for initial page load (includes SSO redirects).
 * Default: 60 seconds to handle Microsoft SSO authentication flow.
 */
  static readonly PAGE_LOAD_TIMEOUT_MS = 60000;      // Initial page load
  
 /**
 * Maximum time to wait for user actions like button clicks and form submissions.
 * Default: 15 seconds for interactive element response.
 */
  static readonly ACTION_TIMEOUT_MS = 15000;          // Button clicks, form submissions
  
 /**
 * Maximum time to wait for page transitions and navigation changes.
 * Default: 30 seconds for SPA route changes and full page loads.
 */
  static readonly NAVIGATION_TIMEOUT_MS = 30000;      // Page transitions
  
 /**
 * Maximum time to wait for element visibility checks.
 * Default: 20 seconds for elements to appear in DOM and become visible.
 * (Increased to handle slow Microsoft SSO login page loads, avg 10s)
 */
  static readonly ELEMENT_WAIT_TIMEOUT_MS = 20000;    // Element visibility waits (Microsoft auth can take 10s avg)
}
