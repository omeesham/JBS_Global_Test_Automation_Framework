/**
 * Convert test case markdown to JSON format.
 * Simple JSON export of entire test case collection with all metadata.
 * Used for programmatic access, archiving, or custom integrations.
 */
import { MarkdownParser } from './markdown-parser';
import { TestCaseCollection } from './types';

export class JsonConverter {
  /**
   * Convert test cases to JSON string.
   * @param testCasesDir - Path to test case directory
   * @returns Pretty-printed JSON string (2-space indentation)
   */
  static convert(testCasesDir: string): string {
    const collection = MarkdownParser.parseDirectory(testCasesDir);
    return JSON.stringify(collection, null, 2);
  }

  /**
   * Convert test cases to JSON and save to file.
   * @param testCasesDir - Path to test case directory
   * @param outputPath - Destination JSON file path
   */
  static convertToFile(testCasesDir: string, outputPath: string): void {
    const json = this.convert(testCasesDir);
    const fs = require('fs');
    fs.writeFileSync(outputPath, json, 'utf-8');
    console.log(`[OK] JSON export: ${outputPath}`);
    console.log(`   Test cases: ${JSON.parse(json).metadata.totalCases}`);
  }

  /**
   * Get collection object (for programmatic use).
   * Use this when you need the collection as a JavaScript object instead of JSON string.
   * @param testCasesDir - Path to test case directory
   * @returns Parsed TestCaseCollection object
   */
  static getCollection(testCasesDir: string): TestCaseCollection {
    return MarkdownParser.parseDirectory(testCasesDir);
  }
}
