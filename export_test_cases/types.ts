/**
 * FILE: export_test_cases/types.ts
 * PURPOSE: TypeScript interfaces for test case conversion
 * WHY NECESSARY: Common data structures for all converter formats
 * USED BY: All converters (to-json, to-csv, to-jira, to-testmo)
 * 
 * HOW IT WORKS:
 * 1. Defines TestCase interface matching markdown test case structure
 * 2. Provides type safety for converter implementations
 * 3. Ensures consistency across all export formats
 */

/**
 * Test step structure
 */
export interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult?: string;
  notesForAgent?: string;
}

/**
 * Test data item structure
 */
export interface TestDataItem {
  field: string;
  value: string;
  source: string;
}

/**
 * Test result entry
 */
export interface TestResult {
  runDate: string;
  result: 'PASSED' | 'FAILED';
  duration?: string;
  notes?: string;
}

/**
 * Main test case structure
 * Maps to markdown test case format in specs_planning/test-cases/
 */
export interface TestCase {
  id: string;                          // TC-001, TC-002, etc.
  title: string;                       // Test case title
  type: 'User-Requested' | 'Agent-Discovered';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  automationStatus: 'Automated' | 'Manual' | 'In Progress';
  description: string;
  preconditions: string[];
  steps: TestStep[];
  testData: TestDataItem[];
  expectedResults: string[];
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
 * Test case collection
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
