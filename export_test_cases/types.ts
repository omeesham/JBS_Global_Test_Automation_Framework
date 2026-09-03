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
  automationStatus: 'Automated' | 'Pending Automation' | 'In Progress';
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
 * @property metadata.pendingAutomation - Count of TCs awaiting automation (renamed
 *           from `manual` per N1 in PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION).
 * @property metadata.source - Source directory path
 * @property testCases - Array of parsed test cases
 */
export interface TestCaseCollection {
  metadata: {
    generatedAt: string;
    totalCases: number;
    automated: number;
    pendingAutomation: number;
    source: string;
  };
  testCases: TestCase[];
}

/**
 * Canonical submodule codes for TC IDs.
 * MIRROR of export_test_cases/module-codes.json (the registry is the source of
 * truth — mint new codes THERE first, then mirror here; check-tc-parity
 * guardrail 6 asserts set-parity between this list and the registry, so drift
 * fails the commit gate). Dead legacy aliases (PRC, LCL, HST, HIST, HISL) and
 * the retired CPR-as-submodule entry removed 2026-06-11
 * (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION — corporate-pricing is a MODULE code).
 */
export const KNOWN_SUB_CODES = [
  // locations (LOC)
  'CUR',  // currency
  'PRI',  // pricing
  'LI',   // local_information
  'ACC',  // account_address
  'LGL',  // legal
  'NTS',  // notes
  'LP',   // left_panel (basic information)
  'SSL',  // shared_setup_locations
  'AAO',  // auto_addon
  'MGH',  // management_history
  // local-office (LOS)
  'BAS',  // basic_information
  'HIS',  // history
  'ECT',  // ect_settings
  // corporate-pricing (CPR)
  'SRC',  // search
  'STR',  // strategy
  'DET',  // detail
  'NPB',  // new_pricebook
  'OVR',  // override
  'NAV',  // override_navigation (B5 — nav case split from OVR)
  'LEX',  // loc_pricing_export (NM-2262 — split from toolbar_io)
  'EXA',  // export_all (NM-2264 — split from toolbar_io)
  'LIM',  // loc_pricing_import (NM-2305 — split from toolbar_io)
  'IMA',  // import_all (NM-2265 — grid-scoped Import All)
  // corporate-override (COR)
  'CORE', // core cases
  'LPK', // NM-2268
  'FLT', // NM-2269
  'GSR', // NM-2270
  'LGR', // NM-2271
  'EXP', // NM-2272
  'IMP', // NM-2273
  // discount-matrix (DSM) — CMX omitted by design; NM-3343 owns Company Matrix
  'CRT',  // criteria (search criteria bar)
  'RWP',  // region_weekly_peaks
  'LOA',  // location_activation
  // item-search (ISR) — NM-2253, office 1101 only
  'PRS',  // product_search
  'PRF',  // product_search filters — own workbook, ids stay in the PRS sequence
  'PCD',  // product_code
  'PGR',  // product_groups
] as const;

export type SubCode = typeof KNOWN_SUB_CODES[number];
