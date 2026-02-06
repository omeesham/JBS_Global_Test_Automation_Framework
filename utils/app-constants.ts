/**
 * Application Constants
 * Application-wide constants and configuration
 * Migrated from utils/app_constants.py
 */

export class AppConstants {
  // OpenAI Configuration
  static readonly API_KEY = process.env.OPENAI_API_KEY || 'Test';
  static readonly ENABLE_OPENAI_SELF_HEALING = 
    process.env.ENABLE_OPENAI_SELF_HEALING === 'true' || false;

  // CSV Filenames
  static readonly LOGIN_ELEMENTS = 'Login_Elements.csv';
  static readonly LANDING_ELEMENTS = 'Landing_Elements.csv';
  static readonly WORKING_ELEMENTS = 'Working_Elements.csv';
  static readonly HOME_ELEMENTS = 'Home_Elements.csv';

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

  // Expected Values (placeholder - define actual values)
  static readonly EXPECTED_TITLE = 'Expected Title';
  static readonly SUCCESS_MESSAGE = 'Success';
  static readonly WARNING_TITLE = 'Warning';
  static readonly WARNING_MESSAGE = 'Warning Message';
  static readonly REJECT_OPTIONS: string[] = ['Option A', 'Option B'];
  static readonly EXPECTED_VALUE1 = 'Value 1';
  static readonly EXPECTED_VALUE2 = 'Value 2';
  static readonly EXPECTED_VALUE3 = 'Value 3';
}
