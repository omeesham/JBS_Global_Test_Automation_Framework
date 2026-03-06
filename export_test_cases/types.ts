/**
 * TypeScript interfaces for test case conversion.
 * Defines structure of test cases, steps, data, and results parsed from markdown.
 * Used by all export converters (CSV, JSON, Jira, TestMo).
 * 
 * DUAL-FORMAT SYSTEM:
 * - Agent fields: Technical IDs (chkApplyLDW), code syntax (->), parser-optimized
 * - Human fields: Narrative text, UI labels ("Apply LDW checkbox"), QA-readable
 * - Export filters by audience: human export excludes _for_agent columns
 */

/** Audience type for column filtering in exports */
export type Audience = 'human' | 'agent' | 'both';

/** Column configuration for CSV export */
export interface ColumnConfig {
  key: string;       // Field key in TestCase object
  label: string;     // CSV header label
  audience: Audience; // Export filter: 'human' excludes agent-only, 'agent' includes all
}

/**
 * Test step structure (AGENT format - technical IDs, code syntax).
 * @property stepNumber - Step sequence number (1, 2, 3, ...)
 * @property action - User action with element IDs (e.g., "Click btnSave")
 * @property expectedResult - Expected outcome with technical validation
 * @property notesForAgent - Automation guidance (e.g., "use clickWithRetry")
 */
export interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult?: string;
  notesForAgent?: string;
}

/**
 * Test data item structure.
 * @property field - Field name (e.g., "Email", "Username")
 * @property value - Test value to use
 * @property source - Data source (Valid, Invalid, Edge Case, Vault, etc.)
 */
export interface TestDataItem {
  field: string;
  value: string;
  source: string;
}

/**
 * Test result entry.
 * @property runDate - ISO date string or human-readable date
 * @property result - Test outcome (PASSED or FAILED)
 * @property duration - Optional test duration (e.g., "2.5s", "1m 30s")
 * @property notes - Optional failure notes or observations
 */
export interface TestResult {
  runDate: string;
  result: 'PASSED' | 'FAILED';
  duration?: string;
  notes?: string;
}

/**
 * Main test case structure.
 * Maps to markdown test case format in specs_planning/test-cases/.
 * 
 * DUAL-FORMAT FIELDS:
 * - Agent fields (steps, expectedResults, testData, preconditions): Technical, parser-optimized
 * - Human fields (stepsHuman, expectedResultsHuman, preconditionsHuman, notesHuman): QA-readable
 * 
 * @property id - Test case ID (TC-001, TC-002, etc.)
 * @property title - Test case title
 * @property type - Source of test case (user-provided or agent-discovered)
 * @property priority - Test priority level
 * @property automationStatus - Current automation state
 * @property description - Full test case description
 * @property preconditions - [AGENT] Setup requirements with element IDs
 * @property preconditionsHuman - [HUMAN] Setup state in plain English
 * @property steps - [AGENT] Test steps with element IDs, code syntax
 * @property stepsHuman - [HUMAN] Narrative steps with UI labels
 * @property testData - [AGENT] Key-value data pairs
 * @property expectedResults - [AGENT] Technical expected outcomes
 * @property expectedResultsHuman - [HUMAN] Per-step visual expectations
 * @property notesHuman - [HUMAN] Quirks, warnings, edge case notes
 * @property automationGuidance - Optional code snippet or automation instructions
 * @property relatedFiles - Links to test plan, automation, requirements files
 * @property automationDetails - File path, test name, line range for automated tests
 * @property testResults - Historical test run results
 * @property lastTestRun - Most recent test execution date
 * @property currentResult - Current test status (PASSED/FAILED)
 * @property knownIssues - Array of known issues or blockers
 * @property tags - Optional categorization tags
 */
export interface TestCase {
  id: string;                          // TC-001, TC-002, etc.
  title: string;                       // Test case title
  type: 'User-Requested' | 'Agent-Discovered';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  automationStatus: 'Automated' | 'Manual' | 'In Progress';
  description: string;
  
  // AGENT fields (technical, parser-optimized)
  preconditions: string[];             // Element IDs, technical setup
  steps: TestStep[];                   // Steps with element IDs (chkApplyLDW)
  testData: TestDataItem[];            // Key-value pairs (`field=value`)
  expectedResults: string[];           // Technical validation outcomes
  
  // HUMAN fields (QA-readable, narrative)
  preconditionsHuman?: string[];       // "Office 1604 is open, Apply LDW is checked"
  stepsHuman?: string;                 // "1. Check the 'Apply LDW' checkbox state..."
  expectedResultsHuman?: string;       // "Step 2: Checkbox becomes unchecked..."
  notesHuman?: string;                 // "⚠️ Value does not restore on re-check"
  
  automationGuidance?: string;
  relatedFiles: {
    testPlan?: string;
    automation?: string;
    requirements?: string;
  };
  automationDetails?: {
    file: string;
    testName: string;
    lineRange: string;
  };
  testResults?: TestResult[];
  lastTestRun?: string;
  currentResult?: 'PASSED' | 'FAILED';
  knownIssues?: string[];
  tags?: string[];
}

/**
 * Test case collection.
 * @property metadata - Collection metadata (generation time, counts, source)
 * @property metadata.generatedAt - ISO timestamp of export
 * @property metadata.totalCases - Total test cases in collection
 * @property metadata.automated - Count of automated test cases
 * @property metadata.manual - Count of manual test cases
 * @property metadata.source - Source directory path
 * @property testCases - Array of parsed test cases
 */
export interface TestCaseCollection {
  metadata: {
    generatedAt: string;
    totalCases: number;
    automated: number;
    manual: number;
    source: string;
  };
  testCases: TestCase[];
}

/**
 * Canonical submodule codes for TC IDs.
 * Single source of truth -- imported by lint-test-cases.ts and to-csv.ts.
 * When adding a new code: add here, then run `npm run lint:testcases` to verify.
 */
export const KNOWN_SUB_CODES = [
  'CUR',  // currency
  'PRI',  // pricing
  'PRC',  // pricing (legacy)
  'LI',   // local_information
  'LCL',  // local_information (legacy)
  'ACC',  // account_address
  'LGL',  // legal
  'NTS',  // notes
  'LP',   // left_panel (basic information)
  'SSL',  // shared_setup_locations
  'AAO',  // auto_addon
  'MGH',  // management_history
  'BAS',  // local_office_settings basic_information
  'HST',  // local_office_settings history
  'ECT',  // local_office_settings ect_settings
] as const;

export type SubCode = typeof KNOWN_SUB_CODES[number];
