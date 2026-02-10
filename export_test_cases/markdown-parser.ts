/**
 * FILE: export_test_cases/markdown-parser.ts
 * PURPOSE: Parse test case markdown files into structured data
 * WHY NECESSARY: Converts markdown test cases to TypeScript objects for export
 * USED BY: All converter implementations (to-json, to-csv, to-jira, to-testmo)
 * 
 * HOW IT WORKS:
 * 1. Reads markdown files from specs_planning/test-cases/
 * 2. Parses sections using regex patterns
 * 3. Extracts test case metadata, steps, data, results
 * 4. Returns TestCase objects for converter consumption
 */

import * as fs from 'fs';
import * as path from 'path';
import { TestCase, TestStep, TestDataItem, TestResult, TestCaseCollection } from './types';

export class MarkdownParser {
  /**
   * Parse all test case markdown files in a directory
   */
  static parseDirectory(dirPath: string): TestCaseCollection {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') && f !== 'TEMPLATE.md');
    const testCases: TestCase[] = [];

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsedCases = this.parseMarkdownFile(content, file);
      testCases.push(...parsedCases);
    }

    const automated = testCases.filter(tc => tc.automationStatus === 'Automated').length;

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalCases: testCases.length,
        automated,
        manual: testCases.length - automated,
        source: dirPath
      },
      testCases
    };
  }

  /**
   * Parse single markdown file (may contain multiple test cases)
   */
  static parseMarkdownFile(content: string, fileName: string): TestCase[] {
    const testCases: TestCase[] = [];
    
    // Split by test case headers (## TC-XXX:)
    const sections = content.split(/^## (TC-\d+):/m);
    
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
   * Parse single test case section
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

    // Extract arrays
    const preconditions = this.extractList(content, 'Preconditions');
    const expectedResults = this.extractList(content, 'Expected Results');

    // Extract tables
    const steps = this.extractSteps(content);
    const testData = this.extractTestData(content);
    const testResults = this.extractTestResults(content);

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
      preconditions,
      steps,
      testData,
      expectedResults,
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
   * Extract simple field value
   */
  private static extractField(content: string, fieldName: string): string | undefined {
    const regex = new RegExp(`\\*\\*${fieldName}\\*\\*:\\s*(.+?)(?=\\n|$)`, 'i');
    const match = content.match(regex);
    if (!match || !match[1]) return undefined;

    // Remove emoji/icons (✅, ⚠️, etc.)
    return match[1].replace(/[✅⚠️❌🔄]/g, '').trim();
  }

  /**
   * Extract bullet list
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
   * Extract test steps table
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
   * Extract test data table
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
   * Extract test results table
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
   * Extract related files
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
   * Extract automation details
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
   * Extract code block content
   */
  private static extractCodeBlock(content: string, sectionName: string): string | undefined {
    const regex = new RegExp(`\\*\\*${sectionName}\\*\\*:?[\\s\\S]*?\`\`\`(?:typescript)?\\n([\\s\\S]*?)\`\`\``, 'i');
    const match = content.match(regex);
    return match && match[1] ? match[1].trim() : undefined;
  }

  /**
   * Validate and sanitize test case type
   */
  private static validateType(value: string | undefined): 'User-Requested' | 'Agent-Discovered' {
    return (value === 'User-Requested' || value === 'Agent-Discovered') ? value : 'Agent-Discovered';
  }

  /**
   * Validate and sanitize priority
   */
  private static validatePriority(value: string | undefined): 'Critical' | 'High' | 'Medium' | 'Low' {
    const validValues: Array<'Critical' | 'High' | 'Medium' | 'Low'> = ['Critical', 'High', 'Medium', 'Low'];
    return validValues.includes(value as any) ? (value as any) : 'Medium';
  }

  /**
   * Validate and sanitize automation status
   */
  private static validateAutomationStatus(value: string | undefined): 'Automated' | 'Manual' | 'In Progress' {
    const validValues: Array<'Automated' | 'Manual' | 'In Progress'> = ['Automated', 'Manual', 'In Progress'];
    return validValues.includes(value as any) ? (value as any) : 'Manual';
  }
}
