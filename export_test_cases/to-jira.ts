/**
 * Convert test case markdown to Jira import format.
 * Supports both Jira Xray CSV import and Jira REST API JSON payload formats.
 * Used for exporting test cases to Atlassian Jira with Xray plugin.
 */
import { MarkdownParser } from './markdown-parser';
import { TestCase, TestStep } from './types';

export class JiraConverter {
  /**
   * Convert test cases to Jira Xray CSV format.
   * Creates CSV with Jira-specific columns (Test Case Key, Test Summary, etc.).
   * @param testCasesDir - Path to test case directory
   * @param projectKey - Jira project key (e.g., "NAV4", "PROJ")
   * @returns CSV string compatible with Jira Xray CSV import
   */
  static convert(testCasesDir: string, projectKey: string = 'PROJ'): string {
    const collection = MarkdownParser.parseDirectory(testCasesDir);
    const rows: string[] = [];

    // Jira CSV Header (Xray format)
    rows.push([
      'Test Case Key',           // e.g., PROJ-001
      'Test Summary',            // Title
      'Test Priority',           // Critical, High, Medium, Low
      'Test Type',               // Manual, Automated
      'Test Description',        // Full description
      'Preconditions',           // Setup requirements
      'Test Steps',              // Step-by-step actions
      'Test Data',               // Input data
      'Expected Results',        // Success criteria
      'Automation Status',       // Automated, In Progress, Manual
      'Labels',                  // Tags/categories
      'Component',               // Module/feature
      'Automated Test File'      // Path to automation
    ].join(','));

    // Jira CSV Rows
    for (const tc of collection.testCases) {
      rows.push([
        this.escape(`${projectKey}-${tc.id.replace('TC-', '')}`),  // PROJ-001
        this.escape(tc.title),
        this.escape(this.mapPriority(tc.priority)),
        this.escape(tc.automationStatus === 'Automated' ? 'Automated' : 'Manual'),
        this.escape(tc.description),
        this.escape(this.formatPreconditions(tc.preconditions)),
        this.escape(this.formatStepsForJira(tc.steps)),
        this.escape(this.formatTestData(tc.testData)),
        this.escape(tc.expectedResults.join('\n')),
        this.escape(tc.automationStatus),
        this.escape(this.extractLabels(tc)),
        this.escape(this.extractComponent(tc)),
        this.escape(tc.automationDetails?.file || '')
      ].join(','));
    }

    return rows.join('\n');
  }

  /**
   * Convert test cases to Jira Xray CSV and save to file.
   * @param testCasesDir - Path to test case directory
   * @param outputPath - Destination CSV file path
   * @param projectKey - Jira project key (defaults to "PROJ")
   */
  static convertToFile(testCasesDir: string, outputPath: string, projectKey: string = 'PROJ'): void {
    const csv = this.convert(testCasesDir, projectKey);
    const fs = require('fs');
    fs.writeFileSync(outputPath, csv, 'utf-8');
    
    const lineCount = csv.split('\n').length - 1;
    console.log(`[OK] Jira CSV export: ${outputPath}`);
    console.log(`   Test cases: ${lineCount}`);
    console.log(`   Project key: ${projectKey}`);
  }

  /**
   * Generate Jira API payload (JSON format).
   * Creates array of Jira REST API create-issue payloads for bulk import.
   * @param testCasesDir - Path to test case directory
   * @param projectKey - Jira project key
   * @returns Array of Jira API payloads ready for POST /rest/api/2/issue/bulk
   */
  static convertToJiraApi(testCasesDir: string, projectKey: string = 'PROJ'): any[] {
    const collection = MarkdownParser.parseDirectory(testCasesDir);
    
    return collection.testCases.map(tc => ({
      fields: {
        project: { key: projectKey },
        summary: tc.title,
        issuetype: { name: 'Test' },  // Xray test issue type
        priority: { name: this.mapPriority(tc.priority) },
        description: this.formatJiraDescription(tc),
        labels: this.extractLabels(tc).split(','),
        customfield_testtype: tc.automationStatus === 'Automated' ? 'Automated' : 'Manual',
        customfield_preconditions: this.formatPreconditions(tc.preconditions),
        customfield_steps: this.formatStepsForJiraApi(tc.steps),
        customfield_automation_file: tc.automationDetails?.file || null
      }
    }));
  }

  /**
   * Map priority to Jira values.
   * Converts framework priority to Jira priority names.
   * @param priority - Framework priority (Critical/High/Medium/Low)
   * @returns Jira priority (Highest/High/Medium/Low)
   */
  private static mapPriority(priority: string): string {
    const mapping: Record<string, string> = {
      'Critical': 'Highest',
      'High': 'High',
      'Medium': 'Medium',
      'Low': 'Low'
    };
    return mapping[priority] || 'Medium';
  }

  /**
   * Format preconditions for Jira with numbered list.
   * @param preconditions - Array of precondition strings
   * @returns Newline-separated numbered list "1. ... 2. ..."
   */
  private static formatPreconditions(preconditions: string[]): string {
    return preconditions.map((p, i) => `${i + 1}. ${p}`).join('\n');
  }

  /**
   * Format steps for Jira CSV (plain text).
   * @param steps - Array of test steps
   * @returns Newline-separated steps with expected results
   */
  private static formatStepsForJira(steps: TestStep[]): string {
    return steps.map(s => 
      `Step ${s.stepNumber}: ${s.action}\nExpected: ${s.expectedResult || 'N/A'}`
    ).join('\n\n');
  }

  /**
   * Format steps for Jira API (structured).
   * @param steps - Array of test steps
   * @returns Array of step objects with index, action, expectedResult, data
   */
  private static formatStepsForJiraApi(steps: TestStep[]): any[] {
    return steps.map(s => ({
      index: s.stepNumber,
      action: s.action,
      expectedResult: s.expectedResult || '',
      data: s.notesForAgent || ''
    }));
  }

  /**
   * Format test data for Jira.
   * @param data - Array of test data items
   * @returns Newline-separated "field: value (source)" strings
   */
  private static formatTestData(data: any[]): string {
    return data.map(d => `${d.field}: ${d.value} (${d.source})`).join('\n');
  }

  /**
   * Format full description for Jira.
   * Combines description, preconditions, test data, expected results into single field.
   * @param tc - Test case object
   * @returns Formatted description with Jira markdown syntax
   */
  private static formatJiraDescription(tc: TestCase): string {
    let desc = tc.description + '\n\n';
    
    if (tc.preconditions.length > 0) {
      desc += '*Preconditions:*\n' + this.formatPreconditions(tc.preconditions) + '\n\n';
    }
    
    if (tc.testData.length > 0) {
      desc += '*Test Data:*\n' + this.formatTestData(tc.testData) + '\n\n';
    }
    
    if (tc.expectedResults.length > 0) {
      desc += '*Expected Results:*\n' + tc.expectedResults.join('\n') + '\n\n';
    }
    
    return desc;
  }

  /**
   * Extract labels from test case.
   * @param tc - Test case object
   * @returns Comma-separated labels (type, priority, automated)
   */
  private static extractLabels(tc: TestCase): string {
    const labels: string[] = [tc.type, tc.priority];
    if (tc.automationStatus === 'Automated') labels.push('automated');
    return labels.join(',');
  }

  /**
   * Extract component from test case file path.
   * Parses automation file path to determine Jira component.
   * @param tc - Test case object
   * @returns Component name (module from file path) or "General"
   */
  private static extractComponent(tc: TestCase): string {
    if (tc.automationDetails?.file) {
      const parts = tc.automationDetails.file.split('/');
      // Extract module from path: tests/specs/auth/login.spec.ts -> auth
      if (parts.length > 3 && parts[2]) return parts[2];
    }
    return 'General';
  }

  /**
   * Escape CSV field for Jira import.
   * @param value - Field value to escape
   * @returns Escaped value wrapped in quotes
   */
  private static escape(value: string): string {
    if (!value) return '""';
    value = value.replace(/\n/g, ' ');
    if (value.includes(',') || value.includes('"')) {
      value = '"' + value.replace(/"/g, '""') + '"';
    } else {
      value = '"' + value + '"';
    }
    return value;
  }
}
