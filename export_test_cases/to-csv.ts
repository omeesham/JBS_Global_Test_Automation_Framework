/**
 * Convert test case markdown to CSV format.
 * 
 * DUAL-FORMAT EXPORT SYSTEM:
 * - Human export (default): Preconditions, Steps, Expected Result, Notes - no element IDs
 * - Agent export: All columns including _for_agent suffixed technical data
 * - Full export: Both human and agent columns for debugging/archival
 * 
 * Usage: CsvConverter.convertToFile(input, output, 'human' | 'agent' | 'full')
 */
import { MarkdownParser } from './markdown-parser';
import { TestCase, TestStep, ColumnConfig, Audience } from './types';
import * as fs from 'fs';
import * as path from 'path';

/** Export type determines which columns are included */
export type ExportType = 'human' | 'agent' | 'full';

interface SimpleTestCase {
  id: string;
  title: string;
  module: string;
  submodule: string;
  specificField: string;
  // Agent fields
  steps: string;
  expected: string;
  data: string;
  // Human fields
  preconditionsHuman: string;
  stepsHuman: string;
  expectedHuman: string;
  notesHuman: string;
}

/**
 * Column configuration for CSV export.
 * Order matters: human columns first, agent columns last.
 * Audience controls inclusion: 'human' excludes 'agent' columns, 'full' includes all.
 */
const COLUMNS: ColumnConfig[] = [
  // Core fields (always included)
  { key: 'id', label: 'TC ID', audience: 'both' },
  { key: 'title', label: 'Title', audience: 'both' },
  { key: 'module', label: 'Module', audience: 'both' },
  { key: 'submodule', label: 'Submodule', audience: 'both' },
  { key: 'specificField', label: 'Specific Field', audience: 'both' },
  
  // Human-readable columns (excluded from agent-only export)
  { key: 'preconditionsHuman', label: 'Preconditions', audience: 'human' },
  { key: 'stepsHuman', label: 'Steps', audience: 'human' },
  { key: 'expectedHuman', label: 'Expected Result', audience: 'human' },
  { key: 'notesHuman', label: 'Notes', audience: 'human' },
  
  // Agent columns (excluded from human export)
  { key: 'steps', label: 'Steps_for_agent', audience: 'agent' },
  { key: 'expected', label: 'Expected Results_for_agent', audience: 'agent' },
  { key: 'data', label: 'Test Data_for_agent', audience: 'agent' },
];

export class CsvConverter {
  /**
   * Filter columns based on export type.
   * @param exportType - 'human' (no agent cols), 'agent' (all cols), 'full' (all cols)
   */
  private static getColumns(exportType: ExportType): ColumnConfig[] {
    return COLUMNS.filter(col => {
      if (exportType === 'human') return col.audience !== 'agent';
      if (exportType === 'agent') return col.audience !== 'human';
      return true; // 'full' includes all
    });
  }

  /**
   * Convert test cases to CSV string with audience-filtered columns.
   * @param testCasesDir - Directory containing test case markdown files
   * @param exportType - 'human' (default), 'agent', or 'full'
   */
  static convert(testCasesDir: string, exportType: ExportType = 'human'): string {
    const collection = MarkdownParser.parseDirectory(testCasesDir);
    const columns = this.getColumns(exportType);
    const rows: string[] = [];

    // CSV Header from filtered columns
    rows.push(columns.map(c => c.label).join(','));

    // CSV Rows
    for (const tc of collection.testCases) {
      const rowData: Record<string, string> = {
        id: tc.id,
        title: tc.title,
        priority: tc.priority,
        status: tc.automationStatus,
        type: tc.type,
        // Human fields
        preconditionsHuman: tc.preconditionsHuman?.join('; ') || this.convertPreconditionsToHuman(tc.preconditions),
        stepsHuman: tc.stepsHuman || this.convertStepsToHuman(tc.steps),
        expectedHuman: tc.expectedResultsHuman || this.convertExpectedToHuman(tc.expectedResults),
        notesHuman: tc.notesHuman || '',
        // Agent fields
        steps: this.formatStepsAgent(tc.steps),
        expected: tc.expectedResults.join('; '),
        data: tc.testData.map(d => `${d.field}=${d.value}`).join(' | ')
      };

      const values = columns.map(col => this.escape(rowData[col.key] || ''));
      rows.push(values.join(','));
    }

    return rows.join('\n');
  }

  /**
   * Convert single markdown file with ## TC-XXX: format to CSV.
   * @param inputFile - Path to markdown file
   * @param exportType - 'human' (default), 'agent', or 'full'
   */
  static convertFile(inputFile: string, exportType: ExportType = 'human'): string {
    const content = fs.readFileSync(inputFile, 'utf-8');
    const testCases = this.parseSimpleFormat(content);
    const columns = this.getColumns(exportType);
    const rows: string[] = [];

    // CSV Header from filtered columns
    rows.push(columns.map(c => c.label).join(','));

    // CSV Rows
    for (const tc of testCases) {
      const rowData: Record<string, string> = {
        id: tc.id,
        title: tc.title,
        module: tc.module,
        submodule: tc.submodule,
        specificField: tc.specificField,
        // Human fields
        preconditionsHuman: tc.preconditionsHuman,
        stepsHuman: this.formatStepsWithLineBreaks(tc.stepsHuman),
        expectedHuman: tc.expectedHuman,
        notesHuman: tc.notesHuman,
        // Agent fields
        steps: this.formatStepsWithLineBreaks(tc.steps),
        expected: tc.expected,
        data: tc.data
      };

      const values = columns.map(col => this.escape(rowData[col.key] || ''));
      rows.push(values.join(','));
    }

    return rows.join('\n');
  }

  /**
   * Parse simple markdown format (## TC-XXX: headers).
   * Parses both agent fields (**Steps**, **Expected**, **Data**)
   * and human fields (**Preconditions (Human)**, **Steps (Human)**, etc.)
   */
  private static parseSimpleFormat(content: string): SimpleTestCase[] {
    const testCases: SimpleTestCase[] = [];
    
    // Split by ## TC-XXX: headers (supports TC-LOC-001 and TC-LOC-CUR-001 formats)
    const sections = content.split(/^## (TC-[A-Z]+(?:-[A-Z]+)?-\d+[A-Z]?):/m);
    
    for (let i = 1; i < sections.length; i += 2) {
      const id = (sections[i] || '').trim();
      const body = sections[i + 1] || '';
      
      if (!id || !body) continue;
      
      const lines = body.trim().split('\n');
      const title = lines[0] || '';
      
      let priority = '';
      let status = '';
      let type = '';
      
      // Find the data row after the header row and separator row
      const bodyLines = body.split('\n');
      for (let j = 0; j < bodyLines.length; j++) {
        const line = (bodyLines[j] || '').trim();
        if (/^\|[\-\s|]+\|$/.test(line) && line.includes('--')) {
          const dataRow = bodyLines[j + 1] || '';
          const cols = dataRow.split('|').map(c => c.trim()).filter(c => c.length > 0);
          if (cols.length >= 3) {
            priority = cols[0] || '';
            status = cols[1] || '';
            type = cols[2] || '';
          }
          break;
        }
      }
      
      // AGENT fields (existing format)
      const stepsMatch = body.match(/\*\*Steps\*\*:\s*(.+?)(?=\*\*Expected\*\*|\*\*Steps \(Human\)\*\*|$)/s);
      let steps = stepsMatch && stepsMatch[1] ? stepsMatch[1].trim() : '';
      
      const expectedMatch = body.match(/\*\*Expected\*\*:\s*(.+?)(?=\*\*Data\*\*|\*\*Notes\*\*|\*\*Cleanup\*\*|\*\*Expected Result \(Human\)\*\*|\n---|\n##|$)/s);
      let expected = expectedMatch && expectedMatch[1] ? expectedMatch[1].trim() : '';
      
      const dataMatch = body.match(/\*\*Data\*\*:\s*(.+?)(?=\n---|\n##|\*\*Notes\*\*|$)/s);
      let data = dataMatch && dataMatch[1] ? dataMatch[1].trim() : '';
      
      // HUMAN fields (new dual-format sections)
      const precondHumanMatch = body.match(/\*\*Preconditions \(Human\)\*\*:\s*(.+?)(?=\*\*Steps|\n##|$)/s);
      let preconditionsHuman = precondHumanMatch && precondHumanMatch[1] ? precondHumanMatch[1].trim() : '';
      
      // Fallback: also match plain **Preconditions**: (without "(Human)" suffix)
      if (!preconditionsHuman) {
        const precondPlainMatch = body.match(/\*\*Preconditions\*\*:\s*(.+?)(?=\*\*Steps|\n##|$)/s);
        preconditionsHuman = precondPlainMatch && precondPlainMatch[1] ? precondPlainMatch[1].trim() : '';
      }
      
      const stepsHumanMatch = body.match(/\*\*Steps \(Human\)\*\*:\s*(.+?)(?=\*\*Expected Result \(Human\)\*\*|\*\*Expected\*\*|\n##|$)/s);
      let stepsHuman = stepsHumanMatch && stepsHumanMatch[1] ? stepsHumanMatch[1].trim() : '';
      
      const expectedHumanMatch = body.match(/\*\*Expected Result \(Human\)\*\*:\s*(.+?)(?=\*\*Notes\*\*|\*\*Data\*\*|\n##|$)/s);
      let expectedHuman = expectedHumanMatch && expectedHumanMatch[1] ? expectedHumanMatch[1].trim() : '';
      
      // Notes must stop at agent **Steps**: section to avoid capturing agent fields
      // Match Notes content until we hit agent Steps, Data, separator, or new test case
      const notesMatch = body.match(/\*\*Notes\*\*:\s*(.+?)(?=\n+\*\*Steps\*\*:|\n+\*\*Data\*\*|\n---|\n##|$)/s);
      let notesHuman = notesMatch && notesMatch[1] ? notesMatch[1].trim() : '';
      
      // Convert Unicode to ASCII for clean export
      steps = this.sanitizeUnicode(steps);
      expected = this.sanitizeUnicode(expected);
      data = this.sanitizeUnicode(data);
      preconditionsHuman = this.sanitizeUnicode(preconditionsHuman);
      stepsHuman = this.sanitizeUnicode(stepsHuman);
      expectedHuman = this.sanitizeUnicode(expectedHuman);
      notesHuman = this.sanitizeUnicode(notesHuman);
      
      // FALLBACK: If human fields not provided, auto-convert from agent format
      if (!stepsHuman && steps) {
        const converted = this.convertAgentStepsToHumanWithNotes(steps);
        stepsHuman = converted.steps;
        // Only add extracted notes if not already provided
        if (!notesHuman && converted.notes) {
          notesHuman = converted.notes;
        }
      }
      if (!expectedHuman && expected) {
        expectedHuman = this.convertElementIdsToLabels(expected);
      }
      
      // Generate preconditions if not provided
      if (!preconditionsHuman) {
        preconditionsHuman = this.generatePreconditions(id, type, steps);
      }
      
      // Handle invalid "OUT OF SCOPE" status - normalize to valid enum
      let normalizedStatus = status;
      let scope = '';
      if (/out of scope/i.test(status)) {
        normalizedStatus = 'N/A';
        scope = 'Out of Scope';
        // Add scope info to notes if not already there
        if (!notesHuman.includes('Out of Scope')) {
          notesHuman = notesHuman ? `${notesHuman} | SCOPE: Out of Scope` : 'SCOPE: Out of Scope';
        }
      }
      
      // Check for CLEANUP REQUIRED in data and add to notes if missing
      if (/CLEANUP REQUIRED/i.test(data) && !/CLEANUP/i.test(notesHuman)) {
        notesHuman = notesHuman ? `${notesHuman} | [WARN] Cleanup required after test` : '[WARN] Cleanup required after test';
      }      
      // Parse standalone **Cleanup**: sections (not inside numbered steps)
      const cleanupSectionMatch = body.match(/\*\*Cleanup\*\*:\s*(.+?)(?=\n---|\n##|\*\*Data\*\*|\*\*Notes\*\*|$)/s);
      if (cleanupSectionMatch && cleanupSectionMatch[1]) {
        const cleanupText = this.sanitizeUnicode(cleanupSectionMatch[1].trim());
        if (cleanupText && !/CLEANUP/i.test(notesHuman)) {
          notesHuman = notesHuman
            ? `${notesHuman} | \u26A0\uFE0F CLEANUP: ${cleanupText}`
            : `\u26A0\uFE0F CLEANUP: ${cleanupText}`;
        }
      }      
      // Extract module/submodule/specificField from TC ID and title
      const module = this.extractModule(id);
      const submodule = this.extractSubmodule(id, title);
      const specificField = this.extractSpecificField(title);
      
      testCases.push({
        id, title, module, submodule, specificField,
        steps, expected, data,
        preconditionsHuman, stepsHuman, expectedHuman, notesHuman
      });
    }
    
    return testCases;
  }
  
  /**
   * Convert agent step format to human-readable with proper separation.
   * Separates action from expected result. Extracts cleanup instructions.
   * Returns { steps, notes } object.
   */
  private static convertAgentStepsToHumanWithNotes(agentSteps: string): { steps: string; notes: string } {
    const cleanupNotes: string[] = [];
    let stepNumber = 0;
    
    // Split individual steps (numbered format: "1. action -> expected 2. action...")
    // Negative lookbehind prevents splitting inside double-digit numbers (e.g., "10." would incorrectly match "0." at position 1)
    const stepParts = agentSteps.split(/(?<!\d)(?=\d+\.\s)/).filter(s => s.trim());
    
    const humanSteps = stepParts.map(part => {
      stepNumber++;
      
      // Check for cleanup instruction
      if (/\*\*Cleanup\*\*|cleanup:|CLEANUP/i.test(part)) {
        // Extract cleanup action, add to notes
        const cleanupText = part.replace(/^\d+\.\s*/, '').replace(/\*\*Cleanup\*\*:?\s*/i, '').trim();
        cleanupNotes.push(cleanupText);
        return null; // Don't include in steps
      }
      
      // Split action from expected result
      const arrowMatch = part.match(/^(\d+\.\s*)(.+?)\s*(?:->|->)\s*(.+)$/s);
      if (arrowMatch && arrowMatch[2] && arrowMatch[3]) {
        let action = arrowMatch[2].trim();
        let expected = arrowMatch[3].trim();
        
        // Convert element IDs to UI labels
        action = this.convertElementIdsToLabels(action);
        expected = this.convertElementIdsToLabels(expected);
        
        // Return properly separated format
        return `${stepNumber}. ${action}\n   [ok] ${expected}`;
      }
      
      // No arrow, just convert IDs
      const cleanPart = part.replace(/^\d+\.\s*/, '').trim();
      return `${stepNumber}. ${this.convertElementIdsToLabels(cleanPart)}`;
    }).filter(Boolean);
    
    // Build notes from extracted cleanup instructions
    let notes = '';
    if (cleanupNotes.length > 0) {
      notes = `[WARN] CLEANUP REQUIRED: ${cleanupNotes.map(c => this.convertElementIdsToLabels(c)).join('; ')}`;
    }
    
    return {
      steps: humanSteps.join('\n'),
      notes
    };
  }
  
  /**
   * Convert element IDs to human-readable UI labels.
   */
  private static convertElementIdsToLabels(text: string): string {
    return text
      .replace(/chk([A-Z][a-zA-Z]+)/g, (_, name) => `**${this.camelToLabel(name)}** checkbox`)
      .replace(/spin([A-Z][a-zA-Z]+)/g, (_, name) => `**${this.camelToLabel(name)}** field`)
      .replace(/drp([A-Z][a-zA-Z]+)/g, (_, name) => `**${this.camelToLabel(name)}** dropdown`)
      .replace(/btn([A-Z][a-zA-Z]+)/g, (_, name) => `**${this.camelToLabel(name)}** button`)
      .replace(/txt([A-Z][a-zA-Z]+)/g, (_, name) => `**${this.camelToLabel(name)}** text field`)
      .replace(/lbl([A-Z][a-zA-Z]+)/g, (_, name) => `**${this.camelToLabel(name)}** label`)
      // Clean up value= patterns
      .replace(/value="([^"]+)"/gi, '"$1"')
      .replace(/Value="([^"]+)"/gi, '"$1"');
  }
  
  /**
   * Convert camelCase to readable label.
   * "ApplyLDW" -> "Apply LDW", "OracleOrganization" -> "Oracle Organization"
   */
  private static camelToLabel(camel: string): string {
    return camel
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  
  /**
   * Canonical submodule-to-tab mapping. Single source of truth.
   * Used by generatePreconditions() and extractSubmodule().
   * When adding a new submodule code: add here ONCE, both functions derive from it.
   */
  private static readonly TAB_MAP: Record<string, { submodule: string; tab: string }> = {
    'CUR': { submodule: 'currency', tab: 'Currency tab is active' },
    'PRI': { submodule: 'pricing', tab: 'Pricing tab is active' },
    'PRC': { submodule: 'pricing', tab: 'Pricing tab is active' },
    'LI':  { submodule: 'local_information', tab: 'Local Information tab is active' },
    'LCL': { submodule: 'local_information', tab: 'Local Information tab is active' },
    'LP':  { submodule: 'left_panel', tab: 'Basic Information tab is active' },
    'LGL': { submodule: 'legal', tab: 'Legal tab is active' },
    'ACC': { submodule: 'account_address', tab: 'Account and Address tab is active' },
    'NTS': { submodule: 'notes', tab: 'Notes tab is active' },
    'SSL': { submodule: 'shared_setup_locations', tab: 'Shared Setup Locations tab is active' },
    'AAO': { submodule: 'auto_addon', tab: 'Auto Add-On tab is active' },
    'MGH': { submodule: 'management_history', tab: 'Location Management History tab is active' },
    'BAS': { submodule: 'basic_information', tab: 'Basic Information tab is active' },
    'HST': { submodule: 'history', tab: 'Location Settings History tab is active' },
    'HIS': { submodule: 'history', tab: 'Location Settings History tab is active' },
    'ECT': { submodule: 'ect_settings', tab: 'ECT Settings tab is active' },
  };

  /**
   * Generate preconditions from test case context when not provided.
   * Derives tab context from TAB_MAP (single source of truth).
   */
  private static generatePreconditions(id: string, type: string, steps: string): string {
    const preconditions: string[] = [];
    
    if (id.includes('TC-LOC')) {
      preconditions.push('Office 1604 is open in Navigator');
      // Extract submodule code from ID and look up tab from TAB_MAP
      const subMatch = id.match(/TC-LOC-([A-Z]+)-\d+/);
      const subCode = subMatch?.[1] ?? '';
      const tabEntry = subCode ? this.TAB_MAP[subCode] : undefined;
      preconditions.push(tabEntry ? tabEntry.tab : 'Basic Information tab is active');
    }

    if (id.includes('TC-LOS')) {
      preconditions.push('Local Office Settings page is open (Office 1604)');
      const subMatch = id.match(/TC-LOS-([A-Z]+)-\d+/);
      const subCode = subMatch?.[1] ?? '';
      const tabEntry = subCode ? this.TAB_MAP[subCode] : undefined;
      preconditions.push(tabEntry ? tabEntry.tab : 'Basic Information tab is active');
    }
    
    // Add field state hints based on test content
    if (/Apply LDW|chkApplyLDW/i.test(steps)) {
      preconditions.push('"Apply LDW" checkbox is in default state');
    }
    if (/LDW Percentage|spinLDWPercentage/i.test(steps)) {
      preconditions.push('"LDW Percentage" field shows default value (0.04)');
    }
    
    return preconditions.join('. ') + (preconditions.length > 0 ? '.' : '');
  }
  
  /**
   * Convert preconditions array to human-readable string (fallback).
   */
  private static convertPreconditionsToHuman(preconditions: string[]): string {
    if (!preconditions || preconditions.length === 0) return '';
    return preconditions
      .map(p => this.convertElementIdsToLabels(p))
      .join('; ');
  }
  
  /**
   * Convert steps array to human-readable string (fallback).
   */
  private static convertStepsToHuman(steps: TestStep[]): string {
    if (!steps || steps.length === 0) return '';
    return steps
      .map(s => {
        const action = this.convertElementIdsToLabels(s.action);
        const expected = s.expectedResult ? `\n   [ok] ${this.convertElementIdsToLabels(s.expectedResult)}` : '';
        return `${s.stepNumber}. ${action}${expected}`;
      })
      .join('\n');
  }
  
  /**
   * Convert expected results array to human-readable string (fallback).
   */
  private static convertExpectedToHuman(expectedResults: string[]): string {
    if (!expectedResults || expectedResults.length === 0) return '';
    return expectedResults.map(r => this.convertElementIdsToLabels(r)).join('; ');
  }
  
  /**
   * Format steps for agent export: "1. Action -> Expected | 2. Action -> Expected"
   */
  private static formatStepsAgent(steps: TestStep[]): string {
    return steps
      .map(s => `${s.stepNumber}. ${s.action}${s.expectedResult ? ' -> ' + s.expectedResult : ''}`)
      .join(' | ');
  }
  
  /**
   * Replace Unicode characters with ASCII equivalents.
   */
  private static sanitizeUnicode(value: string): string {
    return value
      .replace(/\u2192/g, '->')
      .replace(/\u00D7/g, 'x')
      .replace(/\u2014/g, '-')
      .replace(/\u2013/g, '-')
      .replace(/'/g, "'")
      .replace(/'/g, "'")
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      .replace(/\u2026/g, '...');
  }

  /**
   * Convert test cases to CSV and save to file.
   * @param inputPath - Path to markdown file or directory
   * @param outputPath - Output CSV file path
   * @param exportType - 'human' (default), 'agent', or 'full'
   */
  static convertToFile(inputPath: string, outputPath: string, exportType: ExportType = 'human'): void {
    let csv: string;
    let testCaseCount: number;
    
    // Check if input is a file or directory
    const stats = fs.statSync(inputPath);
    if (stats.isFile()) {
      const content = fs.readFileSync(inputPath, 'utf-8');
      const testCases = this.parseSimpleFormat(content);
      testCaseCount = testCases.length;
      csv = this.convertFile(inputPath, exportType);
    } else {
      const collection = MarkdownParser.parseDirectory(inputPath);
      testCaseCount = collection.testCases.length;
      csv = this.convert(inputPath, exportType);
    }
    
    // Create output directory if needed
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // UTF-8 BOM required for Excel to correctly interpret UTF-8 encoding
    const BOM = '\uFEFF';
    fs.writeFileSync(outputPath, BOM + csv, 'utf-8');
    
    const typeLabel = exportType === 'human' ? '(human-readable)' : exportType === 'agent' ? '(agent-only)' : '(full)';
    console.log(`CSV export ${typeLabel}: ${outputPath} (${testCaseCount} test cases)`);
  }

  /**
  /**
   * Escape CSV field (handle commas, quotes, newlines).
   * Preserves intentional newlines for multiline cells in Excel.
   */
  private static escape(value: string): string {
    if (!value) return '""';
    // Normalize whitespace but preserve intentional newlines
    value = value.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
    // Always wrap in quotes, escape internal quotes
    value = '"' + value.replace(/"/g, '""') + '"';
    return value;
  }

  /**
   * Format steps with line breaks between numbered steps.
   * Converts "1. xxx 2. yyy" to "1. xxx\n2. yyy"
   */
  private static formatStepsWithLineBreaks(steps: string): string {
    if (!steps) return '';
    // Add newline before each step number (except first)
    return steps.replace(/\s+(\d+)\.\s/g, '\n$1. ').trim();
  }

  /**
   * Extract module from TC ID.
   * TC-LOC-001 -> "locations", TC-AUTH-001 -> "auth"
   */
  private static extractModule(id: string): string {
    const match = id.match(/TC-([A-Z]+)/);
    if (!match || !match[1]) return 'General';
    const code = match[1];
    const moduleMap: Record<string, string> = {
      'LOC': 'locations',
      'LOS': 'local-office',
      'AUTH': 'authentication',
      'ORD': 'orders',
      'USR': 'users',
      'RPT': 'reports',
      'SET': 'setup'
    };
    return moduleMap[code] ?? code.toLowerCase();
  }

  /**
   * Extract submodule from TC ID or title.
   * TC-LOC-CUR-001 -> "currency", or parse from title
   */
  private static extractSubmodule(id: string, title: string): string {
    // Check for compound ID (TC-LOC-CUR-001)
    const compoundMatch = id.match(/TC-[A-Z]+-([A-Z]+)-\d+/);
    if (compoundMatch && compoundMatch[1]) {
      const subCode = compoundMatch[1];
      // Derive from TAB_MAP (single source of truth -- no duplicate map)
      const entry = this.TAB_MAP[subCode];
      if (!entry) {
        console.warn(`[CSV] Unknown submodule code "${subCode}" in ${id} -- add to TAB_MAP in to-csv.ts`);
      }
      return entry?.submodule ?? subCode.toLowerCase();
    }
    // Infer from title keywords
    const titleLower = title.toLowerCase();
    if (titleLower.includes('currency') || titleLower.includes('merchant')) return 'currency';
    if (titleLower.includes('pricing') || titleLower.includes('price book')) return 'pricing';
    if (titleLower.includes('local information') || titleLower.includes('ldw') || titleLower.includes('billing')) return 'local_information';
    if (titleLower.includes('legal') || titleLower.includes('terms')) return 'legal';
    if (titleLower.includes('account') || titleLower.includes('address')) return 'account_address';
    return 'general';
  }

  /**
   * Extract specific field from title.
   * "Verify USD Merchant dropdown options" -> "USD Merchant"
   */
  private static extractSpecificField(title: string): string {
    // Remove common prefixes
    let field = title
      .replace(/^Verify\s+/i, '')
      .replace(/^Test\s+/i, '')
      .replace(/^Check\s+/i, '')
      .replace(/^Validate\s+/i, '');
    
    // Extract field name (usually before "checkbox", "dropdown", "button", "field", "state", etc.)
    const fieldMatch = field.match(/^([A-Za-z0-9\s]+?)\s*(?:checkbox|dropdown|button|field|state|options?|grid|tab|default|configuration|rule|dependency|validation)/i);
    if (fieldMatch && fieldMatch[1]) {
      return fieldMatch[1].trim();
    }
    
    // If no pattern match, take words up to first common English stop-word (verb/conjunction)
    const stopWords = new Set(['is', 'are', 'has', 'was', 'will', 'be', 'been', 'to', 'the', 'a', 'an',
      'for', 'in', 'on', 'of', 'by', 'with', 'and', 'or', 'not', 'no', 'after', 'before',
      'when', 'upon', 'permanently', 'always', 'never', 'only', 'can', 'cannot', 'does',
      'always', 'correctly', 'properly']);
    const words = field.split(/\s+/);
    const meaningful: string[] = [];
    for (const w of words) {
      if (stopWords.has(w.toLowerCase())) break;
      meaningful.push(w);
      if (meaningful.length >= 4) break;
    }
    return (meaningful.length > 0 ? meaningful : words.slice(0, 2)).join(' ');
  }
}

// CLI support with export type flag
if (require.main === module) {
  const path = require('path');
  const args = process.argv.slice(2);
  
  // Parse --type=human|agent|full flag
  let exportType: ExportType = 'human';
  const typeArg = args.find(a => a.startsWith('--type='));
  if (typeArg) {
    const typeValue = typeArg.split('=')[1];
    if (typeValue === 'agent' || typeValue === 'full' || typeValue === 'human') {
      exportType = typeValue;
    }
  }
  
  // Filter out flags from positional args
  const positionalArgs = args.filter(a => !a.startsWith('--'));
  const inputPath = positionalArgs[0];
  
  if (!inputPath) {
    console.error('Usage: ts-node to-csv.ts <input.md> [output.csv] [--type=human|agent|full]');
    process.exit(1);
  }
  
  // Derive output filename from input: locations_currency_test_cases.md -> locations_currency_test_cases.csv
  const inputBasename = path.basename(inputPath, '.md');
  const defaultOutput = `./export_test_cases/exports/${inputBasename}.csv`;
  const outputPath = positionalArgs[1] || defaultOutput;
  
  console.log(`Export type: ${exportType}`);
  CsvConverter.convertToFile(inputPath, outputPath, exportType);
}
