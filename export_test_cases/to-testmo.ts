/**
 * Convert test case markdown to TestMo import format.
 * Generates JSON payload compatible with TestMo test management platform.
 * Used for bulk importing test cases to TestMo via API or file import.
 */
import { MarkdownParser } from './markdown-parser';
import { TestCase, TestStep } from './types';

export class TestmoConverter {
  /**
   * Convert test cases to TestMo JSON format.
   * @param testCasesDir - Path to test case directory
   * @param suiteId - Optional TestMo suite ID to associate tests with
   * @returns TestMo JSON payload with metadata and tests array
   */
  static convert(testCasesDir: string, suiteId?: string): any {
    const collection = MarkdownParser.parseDirectory(testCasesDir);
    
    return {
      meta: {
        version: '1.0',
        generatedAt: collection.metadata.generatedAt,
        source: 'Hybrid Framework Export'
      },
      suite_id: suiteId || null,
      tests: collection.testCases.map(tc => this.mapTestCase(tc))
    };
  }

  /**
   * Convert test cases to TestMo JSON and save to file.
   * @param testCasesDir - Path to test case directory
   * @param outputPath - Destination JSON file path
   * @param suiteId - Optional TestMo suite ID
   */
  static convertToFile(testCasesDir: string, outputPath: string, suiteId?: string): void {
    const json = JSON.stringify(this.convert(testCasesDir, suiteId), null, 2);
    const fs = require('fs');
    fs.writeFileSync(outputPath, json, 'utf-8');
    
    const data = JSON.parse(json);
    console.log(`[OK] TestMo JSON export: ${outputPath}`);
    console.log(`   Test cases: ${data.tests.length}`);
    if (suiteId) console.log(`   Suite ID: ${suiteId}`);
  }

  /**
   * Map TestCase to TestMo test structure.
   * @param tc - Test case object
   * @returns TestMo test object with all required fields
   */
  private static mapTestCase(tc: TestCase): any {
    return {
      name: tc.title,
      external_id: tc.id,
      priority: this.mapPriority(tc.priority),
      status: this.mapStatus(tc.automationStatus),
      description: tc.description,
      preconditions: tc.preconditions.join('\n'),
      steps: tc.steps.map(s => ({
        order: s.stepNumber,
        description: s.action,
        expected_result: s.expectedResult || '',
        data: s.notesForAgent || ''
      })),
      custom_fields: {
        test_type: tc.type,
        automation_status: tc.automationStatus,
        automation_file: tc.automationDetails?.file || null,
        last_test_run: tc.lastTestRun || null,
        current_result: tc.currentResult || null,
        test_data: this.formatTestData(tc.testData),
        expected_results: tc.expectedResults.join('\n'),
        known_issues: tc.knownIssues?.join('\n') || null
      },
      labels: this.extractLabels(tc)
    };
  }

  /**
   * Map priority to TestMo numeric values.
   * @param priority - Framework priority (Critical/High/Medium/Low)
   * @returns TestMo priority number (1=Critical, 2=High, 3=Medium, 4=Low)
   */
  private static mapPriority(priority: string): number {
    const mapping: Record<string, number> = {
      'Critical': 1,
      'High': 2,
      'Medium': 3,
      'Low': 4
    };
    return mapping[priority] || 3;
  }

  /**
   * Map automation status to TestMo status values.
   * @param status - Framework automation status
   * @returns TestMo status (ready/in_progress/draft)
   */
  private static mapStatus(status: string): string {
    if (status === 'Automated') return 'ready';
    if (status === 'In Progress') return 'in_progress';
    return 'draft';
  }

  /**
   * Format test data for TestMo.
   * @param data - Array of test data items
   * @returns Newline-separated "field: value (source)" strings
   */
  private static formatTestData(data: any[]): string {
    return data.map(d => `${d.field}: ${d.value} (${d.source})`).join('\n');
  }

  /**
   * Extract labels from test case for TestMo.
   * @param tc - Test case object
   * @returns Array of labels (type, priority, automation status, module)
   */
  private static extractLabels(tc: TestCase): string[] {
    const labels: string[] = [tc.type, tc.priority, tc.automationStatus];
    
    // Add component from automation file path
    if (tc.automationDetails?.file) {
      const parts = tc.automationDetails.file.split('/');
      if (parts.length > 3 && parts[2]) labels.push(parts[2]); // Module name
    }
    
    return labels;
  }
}
