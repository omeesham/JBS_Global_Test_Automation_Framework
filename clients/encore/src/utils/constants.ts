export class AppConstants {
  static readonly PAGE_LOAD_TIMEOUT_MS = 60000;      // Initial page load
  
  static readonly ACTION_TIMEOUT_MS = 15000;          // Button clicks, form submissions
  
  static readonly NAVIGATION_TIMEOUT_MS = 30000;      // Page transitions
  
 /**
 * Maximum time to wait for element visibility checks.
 * Default: 20 seconds for elements to appear in DOM and become visible.
 * (Increased to handle slow Microsoft SSO login page loads, avg 10s)
 */
  static readonly ELEMENT_WAIT_TIMEOUT_MS = 20000;    // Element visibility waits (Microsoft auth can take 10s avg)
}
