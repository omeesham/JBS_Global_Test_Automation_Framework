/**
 * Parse test case markdown files into structured data for export.
 * Reads markdown files from specs_planning/test-cases/{module}/ and converts them to TypeScript objects.
 * Used by CSV, JSON, Jira, and TestMo exporters to generate test management imports.
 */
import * as fs from 'fs';
import * as path from 'path';
import { TestCase, TestStep, TestDataItem, TestResult, TestCaseCollection } from './types';

export class MarkdownParser {
  /**
   * Parse all test case markdown files in a directory (recursively).
   * Scans module subdirectories and reads every .md file.
   * Skips _internal folder (templates/examples).
   * @param dirPath - Absolute path to test case directory (usually specs_planning/test-cases/)
   * @returns Collection with metadata and array of parsed test cases
   */
  static parseDirectory(dirPath: string): TestCaseCollection {
    const testCases: TestCase[] = [];
    this.parseDirectoryRecursive(dirPath, testCases);

    const automated = testCases.filter(tc => tc.automationStatus === 'Automated').length;

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalCases: testCases.length,
        automated,
        pendingAutomation: testCases.length - automated,
        source: dirPath
      },
      testCases
    };
  }

  /**
   * Recursively parse markdown files from directory and subdirectories.
   * Skips _internal folder and non-.md files.
   */
  private static parseDirectoryRecursive(dirPath: string, testCases: TestCase[]): void {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip _internal folder (templates/examples)
        if (entry.name === '_internal') continue;
        this.parseDirectoryRecursive(fullPath, testCases);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const parsedCases = this.parseMarkdownFile(content, entry.name);
        testCases.push(...parsedCases);
      }
    }
  }

  /**
   * Parse single markdown file (may contain multiple test cases).
   * Splits content by ## or ### TC-XXX-YYY: headers to extract individual test cases.
   * @param content - Raw markdown file content
   * @param fileName - File name for error reporting
   * @returns Array of test cases found in file
   */
  static parseMarkdownFile(content: string, fileName: string): TestCase[] {
    const testCases: TestCase[] = [];
    
    // Split by test case headers (## or ### TC-MODULE-XXX:)
    // Supports: TC-LOC-001, TC-LOC-CUR-001, TC-LOC-LI-007A, TC-LOC-LGL-HIST, TC-LOC-LI-SKIP-BILLING, TC-LOC-LI-NE-011
    const sections = content.split(/^#{2,3} (TC-[A-Z]+(?:-[A-Z]+)*(?:-\d+[A-Z]?)?):/m);
    
    // Skip first element (content before first test case)
    for (let i = 1; i < sections.length; i += 2) {
      const id = sections[i]?.trim() || 'TC-UNKNOWN';
      const body = sections[i + 1];
      
      if (body) {
        testCases.push(this.parseTestCase(id, body, fileName));
      }
    }

    return testCases;
  }

  /**
   * Parse single test case section from markdown.
   * Extracts all fields: title, type, priority, status, steps, data, results.
   * Supports DUAL-FORMAT: agent fields (technical) and human fields (QA-readable).
   * @param id - Test case ID (TC-001, TC-002, etc.)
   * @param content - Markdown content for this test case
   * @param fileName - Source file name
   * @returns Parsed TestCase object with both agent and human fields
   */
  private static parseTestCase(id: string, content: string, fileName: string): TestCase {
    // Extract title (first line after ID)
    const titleMatch = content.match(/^\s*(.+?)$/m);
    const title = titleMatch ? titleMatch[1]?.trim() || 'Untitled' : 'Untitled';

    // Extract metadata fields with validation
    const type = this.validateType(this.extractField(content, 'Type'));
    const priority = this.validatePriority(this.extractField(content, 'Priority'));
    const automationStatus = this.validateAutomationStatus(this.extractField(content, 'Automation Status'));
    const description = this.extractField(content, 'Description') || '';

    // Extract AGENT arrays (technical format)
    const preconditions = this.extractList(content, 'Preconditions');
    const expectedResults = this.extractList(content, 'Expected Results');

    // Extract AGENT tables
    const steps = this.extractSteps(content);
    const testData = this.extractTestData(content);
    const testResults = this.extractTestResults(content);

    // Extract HUMAN fields (QA-readable format)
    const preconditionsHuman = this.extractList(content, 'Preconditions \\(Human\\)');
    const stepsHuman = this.extractParagraph(content, 'Steps \\(Human\\)');
    const expectedResultsHuman = this.extractParagraph(content, 'Expected Result \\(Human\\)');
    const notesHuman = this.extractParagraph(content, 'Notes');

    // Extract related files
    const relatedFiles = this.extractRelatedFiles(content);
    const automationDetails = this.extractAutomationDetails(content);

    // Extract other fields
    const lastTestRun = this.extractField(content, 'Last Test Run');
    const currentResult = this.extractField(content, 'Result') as any;
    const knownIssues = this.extractList(content, 'Known Issues');
    const automationGuidance = this.extractCodeBlock(content, 'Automation Guidance');

    return {
      id,
      title,
      type,
      priority,
      automationStatus,
      description,
      // Agent fields
      preconditions,
      steps,
      testData,
      expectedResults,
      // Human fields (optional, fallback handled by exporter)
      preconditionsHuman: preconditionsHuman.length > 0 ? preconditionsHuman : undefined,
      stepsHuman: stepsHuman || undefined,
      expectedResultsHuman: expectedResultsHuman || undefined,
      notesHuman: notesHuman || undefined,
      // Other fields
      automationGuidance,
      relatedFiles,
      automationDetails,
      testResults: testResults.length > 0 ? testResults : undefined,
      lastTestRun,
      currentResult,
      knownIssues: knownIssues.length > 0 ? knownIssues : undefined
    };
  }

  /**
   * Extract simple field value from markdown.
   * Looks for **Field Name**: value pattern and removes emoji.
   * @param content - Markdown content to search
   * @param fieldName - Field name to find (e.g., "Priority", "Type")
   * @returns Field value with emoji removed, or undefined if not found
   */
  private static extractField(content: string, fieldName: string): string | undefined {
    const regex = new RegExp(`\\*\\*${fieldName}\\*\\*:\\s*(.+?)(?=\\n|$)`, 'i');
    const match = content.match(regex);
    if (!match || !match[1]) return undefined;

    // Remove emoji/icons ([OK], [WARN], etc.) and any residual Unicode symbols
    return match[1].replace(/[\u2705\u26A0\uFE0F\u274C\u{1F504}]/gu, '').trim();
  }

  /**
   * Extract bullet list from markdown section.
   * Finds **Section Name**: followed by lines starting with - (dash).
   * @param content - Markdown content to search
   * @param sectionName - Section header (e.g., "Preconditions", "Expected Results")
   * @returns Array of list items with dashes removed
   */
  private static extractList(content: string, sectionName: string): string[] {
    const regex = new RegExp(`\\*\\*${sectionName}\\*\\*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n##|$)`, 'i');
    const match = content.match(regex);
    if (!match || !match[1]) return [];

    const listContent = match[1];
    const items = listContent
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(item => item.length > 0);

    return items;
  }

  /**
   * Extract paragraph content from markdown section.
   * Finds **Section Name**: followed by text until next section.
   * Used for human-readable fields that are free-form text.
   * @param content - Markdown content to search
   * @param sectionName - Section header (e.g., "Steps (Human)", "Notes")
   * @returns Paragraph content as single string, or empty string if not found
   */
  private static extractParagraph(content: string, sectionName: string): string {
    const regex = new RegExp(`\\*\\*${sectionName}\\*\\*:?\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n##|\\n---|$)`, 'i');
    const match = content.match(regex);
    if (!match || !match[1]) return '';
    
    // Clean up: trim, collapse multiple newlines, remove leading dashes if present
    return match[1]
      .trim()
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract test steps table from markdown.
   * Parses | Step # | Action | Expected Result | format.
   * @param content - Markdown content to search
   * @returns Array of test steps with step number, action, expected result, notes
   */
  private static extractSteps(content: string): TestStep[] {
    const steps: TestStep[] = [];
    const tableRegex = /\| Step # \| Action \| Expected Result \|[\s\S]*?\n((?:\|[^\n]+\n?)+)/i;
    const match = content.match(tableRegex);
    
    if (!match || !match[1]) return steps;

    const rows = match[1].split('\n').filter(line => line.trim().startsWith('|') && !line.includes('---'));
    
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(c => c.length > 0);
      if (cols.length >= 3 && cols[1]) {
        steps.push({
          stepNumber: parseInt(cols[0] || '0') || steps.length + 1,
          action: cols[1],
          expectedResult: cols[2] || undefined,
          notesForAgent: cols[3] || undefined
        });
      }
    }

    return steps;
  }

  /**
   * Extract test data table from markdown.
   * Parses | Field | Value | Source | format.
   * @param content - Markdown content to search
   * @returns Array of test data items with field, value, source
   */
  private static extractTestData(content: string): TestDataItem[] {
    const data: TestDataItem[] = [];
    const tableRegex = /\| Field \| Value \| Source \|[\s\S]*?\n((?:\|[^\n]+\n?)+)/i;
    const match = content.match(tableRegex);
    
    if (!match || !match[1]) return data;

    const rows = match[1].split('\n').filter(line => line.trim().startsWith('|') && !line.includes('---'));
    
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(c => c.length > 0);
      if (cols.length >= 3 && cols[0] && cols[1] && cols[2]) {
        data.push({
          field: cols[0],
          value: cols[1],
          source: cols[2]
        });
      }
    }

    return data;
  }

  /**
   * Extract test results table from markdown.
   * Parses | Run Date | Result | Duration | Notes | format.
   * @param content - Markdown content to search
   * @returns Array of test results with run date, result (PASSED/FAILED), duration, notes
   */
  private static extractTestResults(content: string): TestResult[] {
    const results: TestResult[] = [];
    const tableRegex = /\| Run Date \| Result \| Duration \| Notes \|[\s\S]*?\n((?:\|[^\n]+\n?)+)/i;
    const match = content.match(tableRegex);
    
    if (!match || !match[1]) return results;

    const rows = match[1].split('\n').filter(line => line.trim().startsWith('|') && !line.includes('---'));
    
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(c => c.length > 0);
      if (cols.length >= 2 && cols[0] && cols[1]) {
        results.push({
          runDate: cols[0],
          result: cols[1].includes('PASSED') ? 'PASSED' : 'FAILED',
          duration: cols[2] || undefined,
          notes: cols[3] || undefined
        });
      }
    }

    return results;
  }

  /**
   * Extract related file paths from markdown.
   * Looks for Test Plan: `path`, Automation: `path`, Requirements: `path` patterns.
   * @param content - Markdown content to search
   * @returns Object with testPlan, automation, requirements file paths
   */
  private static extractRelatedFiles(content: string): any {
    const files: any = {};
    
    const testPlanMatch = content.match(/Test Plan:\s*`([^`]+)`/);
    if (testPlanMatch) files.testPlan = testPlanMatch[1];

    const automationMatch = content.match(/Automation:\s*`([^`]+)`/);
    if (automationMatch) files.automation = automationMatch[1];

    const reqMatch = content.match(/Requirements:\s*`([^`]+)`/);
    if (reqMatch) files.requirements = reqMatch[1];

    return files;
  }

  /**
   * Extract automation details from markdown.
   * Parses **Automation Details**: File: `path` Test: "name" Line: X-Y format.
   * @param content - Markdown content to search
   * @returns Object with file path, test name, line range, or undefined if not automated
   */
  private static extractAutomationDetails(content: string): any {
    const detailsMatch = content.match(/\*\*Automation Details\*\*:[\s\S]*?File:\s*`?([^\n`]+)`?[\s\S]*?Test:\s*"([^"]+)"[\s\S]*?Line:\s*([^\n]+)/i);
    
    if (!detailsMatch || !detailsMatch[1] || !detailsMatch[2] || !detailsMatch[3]) return undefined;

    return {
      file: detailsMatch[1].trim(),
      testName: detailsMatch[2].trim(),
      lineRange: detailsMatch[3].trim()
    };
  }

  /**
   * Extract code block content from markdown.
   * Looks for **Section Name**: followed by ```typescript or ``` code fence.
   * @param content - Markdown content to search
   * @param sectionName - Section header (e.g., "Automation Guidance")
   * @returns Code block content without fence markers, or undefined if not found
   */
  private static extractCodeBlock(content: string, sectionName: string): string | undefined {
    const regex = new RegExp(`\\*\\*${sectionName}\\*\\*:?[\\s\\S]*?\`\`\`(?:typescript)?\\n([\\s\\S]*?)\`\`\``, 'i');
    const match = content.match(regex);
    return match && match[1] ? match[1].trim() : undefined;
  }

  /**
   * Validate and sanitize test case type.
   * @param value - Raw type value from markdown
   * @returns Valid type (User-Requested or Agent-Discovered), defaults to Agent-Discovered
   */
  private static validateType(value: string | undefined): 'User-Requested' | 'Agent-Discovered' {
    return (value === 'User-Requested' || value === 'Agent-Discovered') ? value : 'Agent-Discovered';
  }

  /**
   * Validate and sanitize priority.
   * @param value - Raw priority value from markdown
   * @returns Valid priority (Critical/High/Medium/Low), defaults to Medium
   */
  private static validatePriority(value: string | undefined): 'Critical' | 'High' | 'Medium' | 'Low' {
    const validValues: Array<'Critical' | 'High' | 'Medium' | 'Low'> = ['Critical', 'High', 'Medium', 'Low'];
    return validValues.includes(value as any) ? (value as any) : 'Medium';
  }

  /**
   * Validate and sanitize automation status.
   * @param value - Raw status value from markdown
   * @returns Valid status (Automated/Pending Automation/In Progress), defaults to Pending Automation.
   *          N1 (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION): the legacy 'Manual' literal in MD
   *          input maps to 'Pending Automation'. Verified: zero MD files under
   *          clients/encore/specs_planning/test-cases/ carry `Automation Status: Manual`,
   *          so this rename is parser-default-only; no MD migration required.
   */
  private static validateAutomationStatus(value: string | undefined): 'Automated' | 'Pending Automation' | 'In Progress' {
    const validValues: Array<'Automated' | 'Pending Automation' | 'In Progress'> = ['Automated', 'Pending Automation', 'In Progress'];
    if (validValues.includes(value as any)) return value as any;
    if (value === 'Manual') return 'Pending Automation';
    return 'Pending Automation';
  }
}
