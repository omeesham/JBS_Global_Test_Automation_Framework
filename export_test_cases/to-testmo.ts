/**
 * FILE: export_test_cases/to-testmo.ts
 * PURPOSE: Convert test case markdown to TestMo import format
 * WHY NECESSARY: TestMo-specific JSON format for API import
 * USED BY: TestMo API integration, bulk test case uploads
 * 
 * HOW IT WORKS:
 * 1. Uses MarkdownParser to extract test cases
 * 2. Maps to TestMo test case structure
 * 3. Outputs JSON compatible with TestMo API
 * 
 * TESTMO FORMAT:
 * - Compatible with TestMo REST API
 * - Can be imported via POST /api/tests
 * - Supports hierarchical test suites
 */

import { MarkdownParser } from './markdown-parser';
import { TestCase, TestStep } from './types';

export class TestmoConverter {
  /**
   * Convert test cases to TestMo JSON format
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
   * Convert and save to file
   */
  static convertToFile(testCasesDir: string, outputPath: string, suiteId?: string): void {
    const json = JSON.stringify(this.convert(testCasesDir, suiteId), null, 2);
    const fs = require('fs');
    fs.writeFileSync(outputPath, json, 'utf-8');
    
    const data = JSON.parse(json);
    console.log(`✅ TestMo JSON export: ${outputPath}`);
    console.log(`   Test cases: ${data.tests.length}`);
    if (suiteId) console.log(`   Suite ID: ${suiteId}`);
  }

  /**
   * Map TestCase to TestMo test structure
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
   * Map priority to TestMo values
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
   * Map automation status to TestMo status
   */
  private static mapStatus(status: string): string {
    if (status === 'Automated') return 'ready';
    if (status === 'In Progress') return 'in_progress';
    return 'draft';
  }

  /**
   * Format test data for TestMo
   */
  private static formatTestData(data: any[]): string {
    return data.map(d => `${d.field}: ${d.value} (${d.source})`).join('\n');
  }

  /**
   * Extract labels from test case
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
