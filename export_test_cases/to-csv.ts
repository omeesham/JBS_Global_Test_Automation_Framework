/**
 * FILE: export_test_cases/to-csv.ts
 * PURPOSE: Convert test case markdown to CSV format
 * WHY NECESSARY: CSV format for Excel, spreadsheet imports, test management tools
 * USED BY: Manual review, bulk imports, reporting
 * 
 * HOW IT WORKS:
 * 1. Uses MarkdownParser to extract test cases
 * 2. Flattens nested structures (steps, data) into delimited strings
 * 3. Outputs CSV with headers matching common test management tools
 */

import { MarkdownParser } from './markdown-parser';
import { TestCase, TestStep } from './types';

export class CsvConverter {
  /**
   * Convert test cases to CSV
   */
  static convert(testCasesDir: string): string {
    const collection = MarkdownParser.parseDirectory(testCasesDir);
    const rows: string[] = [];

    // CSV Header
    rows.push([
      'Test Case ID',
      'Title',
      'Type',
      'Priority',
      'Automation Status',
      'Description',
      'Preconditions',
      'Test Steps',
      'Test Data',
      'Expected Results',
      'Automation File',
      'Last Test Run',
      'Result',
      'Known Issues'
    ].join(','));

    // CSV Rows
    for (const tc of collection.testCases) {
      rows.push([
        this.escape(tc.id),
        this.escape(tc.title),
        this.escape(tc.type),
        this.escape(tc.priority),
        this.escape(tc.automationStatus),
        this.escape(tc.description),
        this.escape(tc.preconditions.join('; ')),
        this.escape(this.formatSteps(tc.steps)),
        this.escape(this.formatTestData(tc.testData)),
        this.escape(tc.expectedResults.join('; ')),
        this.escape(tc.automationDetails?.file || ''),
        this.escape(tc.lastTestRun || ''),
        this.escape(tc.currentResult || ''),
        this.escape(tc.knownIssues?.join('; ') || '')
      ].join(','));
    }

    return rows.join('\n');
  }

  /**
   * Convert and save to file
   */
  static convertToFile(testCasesDir: string, outputPath: string): void {
    const csv = this.convert(testCasesDir);
    const fs = require('fs');
    fs.writeFileSync(outputPath, csv, 'utf-8');
    
    const lineCount = csv.split('\n').length - 1; // Subtract header
    console.log(`✅ CSV export: ${outputPath}`);
    console.log(`   Test cases: ${lineCount}`);
  }

  /**
   * Format steps for CSV cell
   */
  private static formatSteps(steps: TestStep[]): string {
    return steps
      .map(s => `${s.stepNumber}. ${s.action}`)
      .join(' | ');
  }

  /**
   * Format test data for CSV cell
   */
  private static formatTestData(data: any[]): string {
    return data
      .map(d => `${d.field}=${d.value}`)
      .join(' | ');
  }

  /**
   * Escape CSV field (handle commas, quotes, newlines)
   */
  private static escape(value: string): string {
    if (!value) return '""';
    
    // Replace newlines with space
    value = value.replace(/\n/g, ' ');
    
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      value = '"' + value.replace(/"/g, '""') + '"';
    } else {
      value = '"' + value + '"';
    }
    
    return value;
  }
}
