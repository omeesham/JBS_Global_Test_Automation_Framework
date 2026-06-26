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
import { scrubInternalVocab, sanitizeUnicode, cleanMarkdown, humanizeAssertion, convertElementIdsToLabels } from './humanize';
import * as fs from 'fs';
import * as path from 'path';

/** Export type determines which columns are included */
export type ExportType = 'human' | 'agent' | 'full';

interface SimpleTestCase {
  id: string;
  title: string;
  module: string;
  submodule: string;
  tags: string;
  // Bug-blocked metadata (from `**Status**: Blocked by BUG-<MOD>-<NNN>` line — Rule 4 / LR-034)
  // Empty for non-blocked TCs. The MD metadata line is the single source of truth per Rule 4.
  status: string;
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
  { key: 'tags', label: 'Tags', audience: 'both' },
  { key: 'status', label: 'Status', audience: 'both' },

  // Human-readable columns (excluded from agent-only export)
  { key: 'preconditionsHuman', label: 'Preconditions', audience: 'human' },
  { key: 'stepsHuman', label: 'Steps', audience: 'human' },
  { key: 'expectedHuman', label: 'Expected Result', audience: 'human' },
  { key: 'notesHuman', label: 'Notes', audience: 'human' },
  
  // Agent columns (excluded from human export)
  { key: 'steps', label: 'Steps_for_agent', audience: 'agent' },
  { key: 'expected', label: 'Expected Results_for_agent', audience: 'agent' },
  { key: 'data', label: 'Test Data_for_agent', audience: 'agent' },

  // Automation status columns — INERT placeholders in this in-memory CSV oracle: the
  // values are populated only on the XLSX side by the SP00 augment (Playwright JSON),
  // not by convertFile(). Labels mirror the merged workbook vocabulary so no dead
  // 'Automation Execution' / 'If Failed Reason of Failure' header survives the merge
  // (LR-050; PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT renamed the workbook columns to
  // 'Automation Status' + 'Notes / Reason'). NO comma in any label — the header join
  // at the convert()/convertFile() rows is a naked `.join(',')`.
  { key: 'automated', label: 'Automated', audience: 'both' },
  { key: 'automationExecution', label: 'Automation Status', audience: 'both' },
  { key: 'reasonOfFailure', label: 'Notes / Reason', audience: 'both' },
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
        // scrubInternalVocab (Phase D-prep, 2026-05-27 PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION):
        // strip BUG-IDs / LR-NNN / MCP-verified / RCA dates / FormControl / spec helper
        // names / HTML TODO comments from customer-facing columns. Same scrubber the
        // XLSX emitter applies — keeps both deliverables consistent during the
        // migration window. After Phase D deletes CSVs, only the XLSX path scrubs.
        title: scrubInternalVocab(humanizeAssertion(cleanMarkdown(tc.title))),
        priority: tc.priority,
        status: tc.automationStatus,
        type: tc.type,
        // Human fields (cleanMarkdown + humanizeAssertion + scrubInternalVocab for client-facing readability)
        preconditionsHuman: scrubInternalVocab(humanizeAssertion(cleanMarkdown(tc.preconditionsHuman?.join('; ') || this.convertPreconditionsToHuman(tc.preconditions)))),
        stepsHuman: scrubInternalVocab(humanizeAssertion(cleanMarkdown(tc.stepsHuman || this.convertStepsToHuman(tc.steps)))),
        expectedHuman: scrubInternalVocab(humanizeAssertion(cleanMarkdown(tc.expectedResultsHuman || this.convertExpectedToHuman(tc.expectedResults)))),
        notesHuman: scrubInternalVocab(humanizeAssertion(cleanMarkdown(tc.notesHuman || ''))),
        // Agent fields (kept technical — agents need element IDs and arrow syntax)
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
        // scrubInternalVocab (Phase D-prep, 2026-05-27 PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION):
        // strip BUG-IDs / LR-NNN / MCP-verified / RCA dates / FormControl / spec
        // helper names / HTML TODO comments from customer-facing simple-format CSVs
        // (Encore MD path). Same scrubber the XLSX emitter applies.
        title: scrubInternalVocab(tc.title),
        module: tc.module,
        submodule: tc.submodule,
        tags: tc.tags,
        status: scrubInternalVocab(tc.status),
        // Human fields
        preconditionsHuman: scrubInternalVocab(tc.preconditionsHuman),
        stepsHuman: scrubInternalVocab(this.formatStepsWithLineBreaks(tc.stepsHuman)),
        expectedHuman: scrubInternalVocab(tc.expectedHuman),
        notesHuman: scrubInternalVocab(tc.notesHuman),
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
    
    // Split by ## TC-XXX: headers (supports TC-LOC-001, TC-LOC-CUR-001, TC-LOC-LGL-HIST, TC-LOC-LI-SKIP-BILLING, TC-LOC-LI-NE-011)
    const sections = content.split(/^## (TC-[A-Z]+(?:-[A-Z]+)*(?:-\d+[A-Z]?)?):/m);
    
    for (let i = 1; i < sections.length; i += 2) {
      const id = (sections[i] || '').trim();
      const body = sections[i + 1] || '';
      
      if (!id || !body) continue;
      
      const lines = body.trim().split('\n');
      const title = humanizeAssertion(cleanMarkdown(lines[0] || ''));
      
      let priority = '';
      let status = '';
      let type = '';
      let tags = '';

      // Find the data row after the header row and separator row
      const bodyLines = body.split('\n');
      for (let j = 0; j < bodyLines.length; j++) {
        const line = (bodyLines[j] || '').trim();
        if (/^\|[\-\s|]+\|$/.test(line) && line.includes('--')) {
          // Read header row (j-1) to find Tags column position by name
          const headerRow = bodyLines[j - 1] || '';
          const headerCols = headerRow.split('|').map(c => c.trim()).filter(c => c.length > 0);
          const tagsColIndex = headerCols.findIndex(h => h.toLowerCase() === 'tags');

          const dataRow = bodyLines[j + 1] || '';
          const cols = dataRow.split('|').map(c => c.trim()).filter(c => c.length > 0);
          if (cols.length >= 3) {
            priority = cols[0] || '';
            status = cols[1] || '';
            type = cols[2] || '';
            tags = tagsColIndex >= 0 ? (cols[tagsColIndex] || '') : '';
          }
          break;
        }
      }
      
      // BLOCKED-BY METADATA — captures the `**Status**: Blocked by BUG-<MOD>-<NNN>` line per
      // tc-authoring-rules.md Rule 4 (single-source-of-truth metadata line for bug-blocked TCs).
      // Anchored to a leading newline so we never match inside a step or sentence; terminates
      // at the next bold field, separator, or new test case header.
      const statusMetaMatch = body.match(/\n(?:\*\*)?Status(?:\*\*)?:\s*(.+?)(?=\n\n|\n\*\*|\n[A-Z][A-Za-z_ ]+:|\n---|\n##|$)/s);
      let statusMeta = statusMetaMatch && statusMetaMatch[1] ? statusMetaMatch[1].trim() : '';

      // AGENT fields (existing format)
      // Anchor section-boundary lookaheads to `\n\s*\*\*<Name>\*\*:` so inline "→ Expected:" text
      // inside numbered steps does NOT prematurely terminate the Steps section (Phase D regression fix).
      const stepsMatch = body.match(/(?:\*\*)?Steps(?:\*\*)?:\s*(.+?)(?=\n\s*\*\*Expected\*\*:|\n\s*\*\*Steps \(Human\)\*\*:|\n\s*\*\*Data\*\*:|\n\s*\*\*Notes\*\*:|\n---|\n##|$)/s);
      let steps = stepsMatch && stepsMatch[1] ? stepsMatch[1].trim() : '';

      const expectedMatch = body.match(/\n\s*\*\*Expected\*\*:\s*(.+?)(?=\n\s*\*\*Data\*\*:|\n\s*\*\*Notes\*\*:|\n\s*\*\*Cleanup\*\*:|\n\s*\*\*Automatable\*\*:|\n\s*\*\*MCP_VERIFICATION_LOG\*\*:|\n\s*\*\*Automation File\*\*:|\n\s*\*\*Expected Result \(Human\)\*\*:|\n---|\n##|$)/s);
      let expected = expectedMatch && expectedMatch[1] ? expectedMatch[1].trim() : '';

      const dataMatch = body.match(/\n\s*\*\*Data\*\*:\s*(.+?)(?=\n---|\n##|\n\s*\*\*Notes\*\*:|\n\s*\*\*Automatable\*\*:|\n\s*\*\*MCP_VERIFICATION_LOG\*\*:|$)/s);
      let data = dataMatch && dataMatch[1] ? dataMatch[1].trim() : '';
      
      // HUMAN fields (new dual-format sections)
      const precondHumanMatch = body.match(/(?:\*\*)?Preconditions \(Human\)(?:\*\*)?:\s*(.+?)(?=\*\*Steps|\n##|$)/s);
      let preconditionsHuman = precondHumanMatch && precondHumanMatch[1] ? precondHumanMatch[1].trim() : '';
      
      // Fallback: also match plain **Preconditions**: (without "(Human)" suffix)
      if (!preconditionsHuman) {
        const precondPlainMatch = body.match(/(?:\*\*)?Preconditions(?:\*\*)?:\s*(.+?)(?=\*\*Steps|\n##|$)/s);
        preconditionsHuman = precondPlainMatch && precondPlainMatch[1] ? precondPlainMatch[1].trim() : '';
      }
      
      const stepsHumanMatch = body.match(/(?:\*\*)?Steps \(Human\)(?:\*\*)?:\s*(.+?)(?=(?:\*\*)?Expected Result \(Human\)(?:\*\*)?|(?:\*\*)?Expected(?:\*\*)?|\n##|$)/s);
      let stepsHuman = stepsHumanMatch && stepsHumanMatch[1] ? stepsHumanMatch[1].trim() : '';
      
      const expectedHumanMatch = body.match(/(?:\*\*)?Expected Result \(Human\)(?:\*\*)?:\s*(.+?)(?=(?:\*\*)?Notes(?:\*\*)?|(?:\*\*)?Data(?:\*\*)?|\n##|$)/s);
      let expectedHuman = expectedHumanMatch && expectedHumanMatch[1] ? expectedHumanMatch[1].trim() : '';
      
      // Notes must stop at agent **Steps**: section to avoid capturing agent fields
      // Match Notes content until we hit agent Steps, Data, separator, or new test case
      const notesMatch = body.match(/(?:\*\*)?Notes(?:\*\*)?:\s*(.+?)(?=\n+(?:\*\*)?Steps(?:\*\*)?:|\n+(?:\*\*)?Data(?:\*\*)?|(?:\*\*)?Automatable(?:\*\*)?|(?:\*\*)?MCP_VERIFICATION_LOG(?:\*\*)?|(?:\*\*)?Automation File(?:\*\*)?|(?:\*\*)?Completed saves(?:\*\*)?|\n---|\n##|$)/s);
      let notesHuman = notesMatch && notesMatch[1] ? notesMatch[1].trim() : '';
      
      // Convert Unicode to ASCII for clean export
      steps = sanitizeUnicode(steps);
      expected = sanitizeUnicode(expected);
      data = sanitizeUnicode(data);
      preconditionsHuman = sanitizeUnicode(preconditionsHuman);
      stepsHuman = sanitizeUnicode(stepsHuman);
      expectedHuman = sanitizeUnicode(expectedHuman);
      notesHuman = sanitizeUnicode(notesHuman);
      
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
        expectedHuman = convertElementIdsToLabels(expected);
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
        notesHuman = notesHuman ? `${notesHuman} | Cleanup required after test` : 'Cleanup required after test';
      }
      // Parse standalone **Cleanup**: sections (not inside numbered steps)
      const cleanupSectionMatch = body.match(/(?:\*\*)?Cleanup(?:\*\*)?:\s*(.+?)(?=\n---|\n##|(?:\*\*)?Data(?:\*\*)?|(?:\*\*)?Notes(?:\*\*)?|(?:\*\*)?Automatable(?:\*\*)?|(?:\*\*)?MCP_VERIFICATION_LOG(?:\*\*)?|$)/s);
      if (cleanupSectionMatch && cleanupSectionMatch[1]) {
        const cleanupText = sanitizeUnicode(cleanupSectionMatch[1].trim());
        if (cleanupText && !/CLEANUP/i.test(notesHuman)) {
          notesHuman = notesHuman
            ? `${notesHuman} | Cleanup after test: ${cleanupText}`
            : `Cleanup after test: ${cleanupText}`;
        }
      }

      // Strip internal metadata tags that should never appear in client CSVs
      const stripInternalTags = (text: string): string =>
        text.replace(/\n?(?:\*\*)?Automatable(?:\*\*)?:.*$/gm, '')
            .replace(/\n?(?:\*\*)?MCP_VERIFICATION_LOG(?:\*\*)?[\s\S]*?(?=\n---|\n##|$)/g, '')
            .replace(/\n?(?:\*\*)?Automation File(?:\*\*)?:.*$/gm, '')
            .replace(/\n?(?:\*\*)?Completed saves to verify(?:\*\*)?:.*$/gm, '')
            .trim();
      expected = stripInternalTags(expected);
      expectedHuman = stripInternalTags(expectedHuman);
      notesHuman = stripInternalTags(notesHuman);
      data = stripInternalTags(data);

      // Final human-column normalization for client-facing CSV.
      // cleanMarkdown strips chrome; humanizeAssertion translates DOM jargon to plain English.
      stepsHuman = humanizeAssertion(cleanMarkdown(stepsHuman));
      preconditionsHuman = humanizeAssertion(cleanMarkdown(preconditionsHuman));
      notesHuman = humanizeAssertion(cleanMarkdown(notesHuman));
      expectedHuman = humanizeAssertion(cleanMarkdown(convertElementIdsToLabels(expectedHuman)));

      // Extract module/submodule from TC ID and title; tags come from metadata table
      const module = this.extractModule(id);
      const submodule = this.extractSubmodule(id, title);

      testCases.push({
        id, title, module, submodule, tags,
        status: sanitizeUnicode(statusMeta),
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
      if (/(?:\*\*)?Cleanup(?:\*\*)?|cleanup:|CLEANUP/i.test(part)) {
        const cleanupText = part.replace(/^\d+\.\s*/, '').replace(/(?:\*\*)?Cleanup(?:\*\*)?:?\s*/i, '').trim();
        cleanupNotes.push(cleanupText);
        return null;
      }

      // Action-only Steps column: drop the per-step expected (-> half) entirely.
      // The per-TC **Expected**: summary stays as the authoritative outcome in the Expected Result column.
      // Order: convertElementIdsToLabels -> cleanMarkdown (action is imperative, not assertive).
      const arrowMatch = part.match(/^(\d+\.\s*)(.+?)\s*(?:->|->)\s*(.+)$/s);
      const rawAction = arrowMatch && arrowMatch[2]
        ? arrowMatch[2].trim()
        : part.replace(/^\d+\.\s*/, '').trim();
      const action = cleanMarkdown(convertElementIdsToLabels(rawAction));
      return `${stepNumber}. ${action}`;
    }).filter(Boolean);

    let notes = '';
    if (cleanupNotes.length > 0) {
      const cleanedNotes = cleanupNotes.map(c => cleanMarkdown(convertElementIdsToLabels(c)));
      notes = `Cleanup after test: ${cleanedNotes.join('; ')}`;
    }
    
    return {
      steps: humanSteps.join('\n'),
      notes
    };
  }
  
  /**
   * Submodule code → default-precondition tab phrase, used by
   * generatePreconditions(). Submodule NAMES come from the module-codes.json
   * registry (MODULE_REGISTRY below) — this map carries ONLY the human
   * precondition strings. Dead legacy aliases (PRC/LCL/HST/HIST/HISL) and the
   * retired CPR-as-submodule entry removed 2026-06-11
   * (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION).
   */
  private static readonly TAB_MAP: Record<string, { tab: string }> = {
    'CUR': { tab: 'Currency tab is active' },
    'PRI': { tab: 'Pricing tab is active' },
    'LI':  { tab: 'Local Information tab is active' },
    'LP':  { tab: 'Basic Information tab is active' },
    'LGL': { tab: 'Legal tab is active' },
    'ACC': { tab: 'Account and Address tab is active' },
    'NTS': { tab: 'Notes tab is active' },
    'SSL': { tab: 'Shared Setup Locations tab is active' },
    'AAO': { tab: 'Auto Add-On tab is active' },
    'MGH': { tab: 'Location Management History tab is active' },
    'BAS': { tab: 'Basic Information tab is active' },
    'HIS': { tab: 'Location Settings History tab is active' },
    'ECT': { tab: 'ECT Settings tab is active' },
    'SRC': { tab: 'Corporate Pricing search page is active' },
    'STR': { tab: 'Pricing Strategy tab is active' },
    'DET': { tab: 'Pricing Detail tab is active' },
    'NPB': { tab: 'New Pricebook page is active' },
    'OVR': { tab: 'Product Group Override page is active' },
    'TIO': { tab: 'Corporate Pricing search page is active' },
  };

  /**
   * ID-grammar registry (export_test_cases/module-codes.json) — single source
   * of truth for module/submodule codes. Mint new codes THERE first. Loaded
   * once with a shape assert so a malformed registry fails the build loudly
   * rather than emitting wrong Module/Submodule cells.
   */
  private static readonly MODULE_REGISTRY: {
    modules: Record<string, { name: string; display: string; dir: string }>;
    submodules: Record<string, Record<string, { name: string; display: string; sheet: string; mdBasename: string }>>;
  } = (() => {
    const raw = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, 'module-codes.json'), 'utf8').replace(/^﻿/, '')
    );
    if (!raw?.modules?.LOC || !raw?.submodules?.LOC?.CUR) {
      throw new Error('[to-csv] module-codes.json failed shape assert — modules/submodules missing');
    }
    return raw;
  })();

  /**
   * Generate preconditions from test case context when not provided.
   * Derives tab context from TAB_MAP (single source of truth).
   */
  private static generatePreconditions(id: string, type: string, steps: string): string {
    const preconditions: string[] = [];
    
    if (id.includes('TC-LOC')) {
      preconditions.push('Office 1604 is open in Navigator');
      // Extract submodule code from ID and look up tab from TAB_MAP
      const subMatch = id.match(/TC-LOC-([A-Z]+)-(?:\d+|[A-Z]+)/);
      const subCode = subMatch?.[1] ?? '';
      const tabEntry = subCode ? this.TAB_MAP[subCode] : undefined;
      preconditions.push(tabEntry ? tabEntry.tab : 'Basic Information tab is active');
    }

    if (id.includes('TC-LOS')) {
      preconditions.push('Local Office Settings page is open (Office 1604)');
      const subMatch = id.match(/TC-LOS-([A-Z]+)-(?:\d+|[A-Z]+)/);
      const subCode = subMatch?.[1] ?? '';
      const tabEntry = subCode ? this.TAB_MAP[subCode] : undefined;
      preconditions.push(tabEntry ? tabEntry.tab : 'Basic Information tab is active');
    }

    if (id.includes('TC-CPR')) {
      preconditions.push('Corporate Pricing is open in Navigator (Setup)');
      const subMatch = id.match(/TC-CPR-([A-Z]+)-(?:\d+|[A-Z]+)/);
      const subCode = subMatch?.[1] ?? '';
      const tabEntry = subCode ? this.TAB_MAP[subCode] : undefined;
      preconditions.push(tabEntry ? tabEntry.tab : 'Corporate Pricing search page is active');
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
      .map(p => convertElementIdsToLabels(p))
      .join('; ');
  }
  
  /**
   * Convert steps array to human-readable string (fallback).
   * Action-only output; per-step expected drops out (Expected Result column carries it).
   */
  private static convertStepsToHuman(steps: TestStep[]): string {
    if (!steps || steps.length === 0) return '';
    return steps
      .map(s => `${s.stepNumber}. ${convertElementIdsToLabels(s.action)}`)
      .join('\n');
  }
  
  /**
   * Convert expected results array to human-readable string (fallback).
   */
  private static convertExpectedToHuman(expectedResults: string[]): string {
    if (!expectedResults || expectedResults.length === 0) return '';
    return expectedResults.map(r => convertElementIdsToLabels(r)).join('; ');
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
    const entry = this.MODULE_REGISTRY.modules[match[1]];
    if (!entry) {
      console.warn(`[CSV] Unknown module code "${match[1]}" in ${id} -- register in export_test_cases/module-codes.json`);
      return match[1].toLowerCase();
    }
    return entry.name;
  }

  /**
   * Extract submodule from TC ID or title.
   * TC-LOC-CUR-001 -> "currency", or parse from title
   */
  private static extractSubmodule(id: string, title: string): string {
    // Compound ID (TC-LOC-CUR-001): module + submodule codes resolve via the registry
    const compoundMatch = id.match(/TC-([A-Z]+)-([A-Z]+)-(?:\d+|[A-Z]+)/);
    if (compoundMatch && compoundMatch[1] && compoundMatch[2]) {
      const modCode = compoundMatch[1];
      const subCode = compoundMatch[2];
      const entry = this.MODULE_REGISTRY.submodules[modCode]?.[subCode];
      if (!entry) {
        console.warn(`[CSV] Unknown module/submodule pair "${modCode}/${subCode}" in ${id} -- register in export_test_cases/module-codes.json`);
      }
      return entry?.name ?? subCode.toLowerCase();
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

}
