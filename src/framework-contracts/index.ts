// Re-export diagnostic types
export { FailureCategory, type NetworkFailure, type ConsoleEntry, type AuthChainEntry, type DiagnosticSnapshot } from './diagnostics';

/**
 * TypeScript Type Definitions
 * Global types and interfaces for the framework
 */

/**
 * Configuration interface matching config.properties
 * SINGLE SOURCE OF TRUTH - All files should import from here
 */
export interface IConfig {
  browser: string;
  url: string;
  base_url: string;  // Alias for url (test compatibility)
  home_url: string;
  username_automation: string;
  password_automation: string;
  mfa_secret?: string;
  [key: string]: string | undefined;
}

/**
 * Validation field dictionary
 */
export interface IValidationFields {
  [fieldKey: string]: string;
}

/**
 * Custom Playwright matchers -- type declarations
 */
declare module '@playwright/test' {
  interface Matchers<R, T> {
    toBeLoggedIn(): Promise<R>;
    toHaveNotification(text?: string): Promise<R>;
    toHaveFileDownloaded(fileName?: string): R;
  }
}
