/**
 * FILE: src/utils/app-constants.ts
 * PURPOSE: Application-wide constants and environment configuration
 * WHY NECESSARY: Single source of truth for framework constants and feature flags
 * USED BY: All framework files requiring constants (CSV filenames, expected values)
 *
 * HOW IT WORKS:
 * 1. Defines CSV filename constants for object repository files
 * 2. Provides search list and other application-specific constants
 * 3. Readonly static properties prevent accidental modification
 * 4. Accessed via AppConstants.PROPERTY_NAME pattern
 */

export class AppConstants {
  // CSV Filenames
  static readonly LOGIN_ELEMENTS = 'Login_Elements.csv';
  static readonly LANDING_ELEMENTS = 'Landing_Elements.csv';
  static readonly WORKING_ELEMENTS = 'Working_Elements.csv';
  static readonly HOME_ELEMENTS = 'Home_Elements.csv';
  static readonly DOCUMENTS_ELEMENTS = 'Documents_Elements.csv'; // DEMO_TARGET: Documents module

  // Search List Options (placeholder - define actual values)
  static readonly SEARCH_LIST: string[] = [
    'Option 1',
    'Option 2',
    'Option 3',
  ];

  static readonly SEARCH_LIST_AUDITOR: string[] = [
    'Audit Option 1',
    'Audit Option 2',
  ];

  static readonly SEARCH_LIST_PROSPECTIVE: string[] = [
    'Prospective Option 1',
    'Prospective Option 2',
  ];

  // Notification/Alert selectors (used by custom matchers)
  static readonly NOTIFICATION_SELECTORS: string[] = [
    '.alert',
    '.notification',
    '.Toastify__toast',
    '[data-notify]',
  ];

  // Expected Values (EspoCRM)
  static readonly EXPECTED_TITLE = 'EspoCRM';
  static readonly SUCCESS_MESSAGE = 'Success';
  static readonly WARNING_TITLE = 'Warning';
  static readonly WARNING_MESSAGE = 'Warning Message';
  static readonly REJECT_OPTIONS: string[] = ['Option A', 'Option B'];
  static readonly EXPECTED_VALUE1 = 'Value 1';
  static readonly EXPECTED_VALUE2 = 'Value 2';
  static readonly EXPECTED_VALUE3 = 'Value 3';

  // Timeout Constants (Documents Module)
  static readonly DOCUMENTS_UPLOAD_WAIT_MS = 2000; // EspoCRM file processing delay
  static readonly DOCUMENTS_MODAL_TIMEOUT_MS = 10000; // Modal appearance/disappearance
  static readonly DOCUMENTS_LIST_RENDER_TIMEOUT_MS = 10000; // SPA rendering delay
  static readonly STEALTH_PAGE_LOAD_TIMEOUT_MS = 90000; // Initial page load with stealth (resources never finish)
  static readonly STEALTH_LOGIN_WAIT_MS = 30000; // Login button/navbar visibility
  static readonly DOCUMENTS_SPA_WAIT_MS = 500; // Post-scroll wait for SPA rendering
  static readonly DOCUMENTS_FORM_RENDER_MS = 1000; // Full form render after navigation
}
