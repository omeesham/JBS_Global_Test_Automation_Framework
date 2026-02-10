/**
 * FILE: export_test_cases/to-json.ts
 * PURPOSE: Convert test case markdown to JSON format
 * WHY NECESSARY: Generic JSON format for programmatic consumption
 * USED BY: Future API integrations, custom tooling
 * 
 * HOW IT WORKS:
 * 1. Uses MarkdownParser to extract test cases
 * 2. Serializes to JSON with pretty formatting
 * 3. Preserves all test case metadata and structure
 */

import { MarkdownParser } from './markdown-parser';
import { TestCaseCollection } from './types';

export class JsonConverter {
  /**
   * Convert test cases to JSON
   */
  static convert(testCasesDir: string): string {
    const collection = MarkdownParser.parseDirectory(testCasesDir);
    return JSON.stringify(collection, null, 2);
  }

  /**
   * Convert and save to file
   */
  static convertToFile(testCasesDir: string, outputPath: string): void {
    const json = this.convert(testCasesDir);
    const fs = require('fs');
    fs.writeFileSync(outputPath, json, 'utf-8');
    console.log(`✅ JSON export: ${outputPath}`);
    console.log(`   Test cases: ${JSON.parse(json).metadata.totalCases}`);
  }

  /**
   * Get collection object (for programmatic use)
   */
  static getCollection(testCasesDir: string): TestCaseCollection {
    return MarkdownParser.parseDirectory(testCasesDir);
  }
}
