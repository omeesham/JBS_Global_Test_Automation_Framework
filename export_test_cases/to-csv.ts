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
import { scrubInternalVocab } from './humanize';
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

  // Automation status columns (SP00 v13 augment — populated by augment script reading Playwright JSON;
  // empty on re-export from MD source since MD doesn't carry these fields; SP00 re-fills after every regen)
  { key: 'automated', label: 'Automated', audience: 'both' },
  { key: 'automationExecution', label: 'Automation Execution', audience: 'both' },
  { key: 'reasonOfFailure', label: 'If Failed Reason of Failure', audience: 'both' },  // NO comma — header join at line 95+135 is naked `.join(',')`; comma in label corrupts header parse
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
        title: scrubInternalVocab(this.humanizeAssertion(this.cleanMarkdown(tc.title))),
        priority: tc.priority,
        status: tc.automationStatus,
        type: tc.type,
        // Human fields (cleanMarkdown + humanizeAssertion + scrubInternalVocab for client-facing readability)
        preconditionsHuman: scrubInternalVocab(this.humanizeAssertion(this.cleanMarkdown(tc.preconditionsHuman?.join('; ') || this.convertPreconditionsToHuman(tc.preconditions)))),
        stepsHuman: scrubInternalVocab(this.humanizeAssertion(this.cleanMarkdown(tc.stepsHuman || this.convertStepsToHuman(tc.steps)))),
        expectedHuman: scrubInternalVocab(this.humanizeAssertion(this.cleanMarkdown(tc.expectedResultsHuman || this.convertExpectedToHuman(tc.expectedResults)))),
        notesHuman: scrubInternalVocab(this.humanizeAssertion(this.cleanMarkdown(tc.notesHuman || ''))),
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
      const title = this.humanizeAssertion(this.cleanMarkdown(lines[0] || ''));
      
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
        notesHuman = notesHuman ? `${notesHuman} | Cleanup required after test` : 'Cleanup required after test';
      }
      // Parse standalone **Cleanup**: sections (not inside numbered steps)
      const cleanupSectionMatch = body.match(/(?:\*\*)?Cleanup(?:\*\*)?:\s*(.+?)(?=\n---|\n##|(?:\*\*)?Data(?:\*\*)?|(?:\*\*)?Notes(?:\*\*)?|(?:\*\*)?Automatable(?:\*\*)?|(?:\*\*)?MCP_VERIFICATION_LOG(?:\*\*)?|$)/s);
      if (cleanupSectionMatch && cleanupSectionMatch[1]) {
        const cleanupText = this.sanitizeUnicode(cleanupSectionMatch[1].trim());
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
      stepsHuman = this.humanizeAssertion(this.cleanMarkdown(stepsHuman));
      preconditionsHuman = this.humanizeAssertion(this.cleanMarkdown(preconditionsHuman));
      notesHuman = this.humanizeAssertion(this.cleanMarkdown(notesHuman));
      expectedHuman = this.humanizeAssertion(this.cleanMarkdown(this.convertElementIdsToLabels(expectedHuman)));

      // Extract module/submodule from TC ID and title; tags come from metadata table
      const module = this.extractModule(id);
      const submodule = this.extractSubmodule(id, title);

      testCases.push({
        id, title, module, submodule, tags,
        status: this.sanitizeUnicode(statusMeta),
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
      const action = this.cleanMarkdown(this.convertElementIdsToLabels(rawAction));
      return `${stepNumber}. ${action}`;
    }).filter(Boolean);

    let notes = '';
    if (cleanupNotes.length > 0) {
      const cleanedNotes = cleanupNotes.map(c => this.cleanMarkdown(this.convertElementIdsToLabels(c)));
      notes = `Cleanup after test: ${cleanedNotes.join('; ')}`;
    }
    
    return {
      steps: humanSteps.join('\n'),
      notes
    };
  }
  
  /**
   * Strip markdown chrome (bold, code spans), drop emoji, normalize whitespace.
   * Calls sanitizeUnicode first so smart-quotes/em-dashes/checkmarks are normalized
   * BEFORE the chrome-strip and column population step.
   * Safe for ALL human columns (Steps, Expected Result, Preconditions, Notes, Title).
   * Bold becomes a quoted value to match the plain-English review style.
   */
  private static cleanMarkdown(text: string): string {
    if (!text) return '';
    return this.sanitizeUnicode(text)
      .replace(/\*\*([^*]+)\*\*/g, '"$1"')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[\u2705\u26A0\uFE0F\u274C\u2744]/gu, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .trim();
  }

  /**
   * Translate DOM-attribute and a11y-tree phrasings into plain English.
   * Safe for Steps, Expected Result, Title, and Notes (preserves accessibility
   * property names like aria-label/aria-valuenow that may be deliberately documented).
   * Order: cleanMarkdown -> humanizeAssertion (so quote/backtick stripping happens first).
   */
  private static humanizeAssertion(text: string): string {
    if (!text) return '';
    return text
      // ── Full-clause patterns (most specific first) ──
      .replace(/Tab has\s+aria-selected(?:="?(?:true|false)"?)?/gi, 'tab is selected')
      .replace(/Button with[^,;|\n]*data-testid\s*=\s*"[^"]+"/gi, 'button is shown')
      .replace(/Poll until\s+aria-invalid\s*=\s*"?true"?/gi, 'wait until a validation error appears')
      .replace(/Poll until\s+aria-invalid\s*=\s*"?false"?/gi, 'wait until the validation error clears')
      .replace(/(\bfield\b|\bField\b|\binput\b|\bInput\b)\s+(?:gets|has|shows)\s+aria-invalid(?:\s*=\s*"?true"?)?/gi, '$1 shows a validation error')
      .replace(/(\bfield\b|\bField\b|\binput\b|\bInput\b)\s+(?:no longer has|does(?:n['\u2019]t| not| NOT)\s+have)\s+aria-invalid/gi, '$1 is valid')
      .replace(/no longer has\s+aria-invalid/gi, 'is valid again')
      .replace(/does(?:n['\u2019]t| not| NOT)\s+have\s+aria-invalid/gi, 'is valid')
      .replace(/(?:Triggers?|triggers?)\s+aria-invalid/gi, 'triggers a validation error')
      .replace(/aria-invalid\s+set/gi, 'shows a validation error')
      // ── Attribute=value patterns (quoted and bare) ──
      .replace(/aria-selected\s*=\s*"?true"?/gi, 'is selected')
      .replace(/aria-selected\s*=\s*"?false"?/gi, 'is not selected')
      .replace(/aria-checked\s*=\s*"?true"?/gi, 'is checked')
      .replace(/aria-checked\s*=\s*"?false"?/gi, 'is not checked')
      .replace(/aria-invalid\s*=\s*"?true"?/gi, 'is invalid')
      .replace(/aria-invalid\s*=\s*"?false"?/gi, 'is valid')
      .replace(/aria-disabled\s*=\s*"?true"?/gi, 'is disabled')
      .replace(/aria-disabled\s*=\s*"?false"?/gi, 'is enabled')
      .replace(/disabled\s*=\s*"?true"?/gi, 'is disabled')
      // Phrase forms first so "has/no disabled attribute" don't double up to "has is disabled".
      .replace(/(?:has|with)\s+disabled\s+attribute/gi, 'is disabled')
      .replace(/(?:no|without)\s+disabled\s+attribute/gi, 'is enabled')
      .replace(/disabled\s+attribute/gi, 'is disabled')
      // ── Bare attribute names (last-resort; safe ones only) ──
      .replace(/\baria-invalid\b/gi, 'validation error')
      // Note: aria-label, aria-valuenow, aria-expanded intentionally NOT touched
      //       (accessibility property names that may be deliberately documented)
      // ── Tab / heading / panel phrasings ──
      .replace(/h\d\s+heading\s+visible/gi, 'heading is visible')
      .replace(/(\d+)\s+tabs?\s+in\s+tablist/gi, '$1 tabs are visible')
      .replace(/Tab\s+panel\s+visible/gi, 'tab content is visible')
      // ── Value / title patterns ──
      .replace(/Input\s+value\s*=\s*"([^"]+)"/gi, 'field shows "$1"')
      .replace(/Page\s+title\s*=\s*"([^"]+)"/gi, 'page title is "$1"')
      // ── data-testid stragglers (bracketed form first) ──
      .replace(/\[\s*data-testid\s*=\s*"[^"]+"\s*\]/gi, '')
      .replace(/\s*data-testid\s*=\s*"[^"]+"\s*/gi, ' ')
      // ── Cleanup whitespace and dangling punctuation introduced by the strips ──
      .replace(/[ \t]+/g, ' ')
      .replace(/\s+([,.;])/g, '$1')
      .replace(/^[\s,.;|]+|[\s,.;|]+$/g, '')
      .trim();
  }

  /**
   * Convert element IDs to human-readable UI labels (quoted, not markdown bold).
   */
  private static convertElementIdsToLabels(text: string): string {
    return text
      .replace(/chk([A-Z][a-zA-Z]+)/g, (_, name) => `"${this.camelToLabel(name)}" checkbox`)
      .replace(/spin([A-Z][a-zA-Z]+)/g, (_, name) => `"${this.camelToLabel(name)}" field`)
      .replace(/drp([A-Z][a-zA-Z]+)/g, (_, name) => `"${this.camelToLabel(name)}" dropdown`)
      .replace(/btn([A-Z][a-zA-Z]+)/g, (_, name) => `"${this.camelToLabel(name)}" button`)
      .replace(/txt([A-Z][a-zA-Z]+)/g, (_, name) => `"${this.camelToLabel(name)}" text field`)
      .replace(/lbl([A-Z][a-zA-Z]+)/g, (_, name) => `"${this.camelToLabel(name)}" label`)
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
    'HIST': { submodule: 'history_integration', tab: 'Location Management History tab is active' },
    'HISL': { submodule: 'history_integration', tab: 'Location Settings History tab is active' },
    // Corporate Pricing = standalone page, not a Location Settings tab. Closure-audit
    // D1 fix (2026-06-05): silences the "Unknown submodule code CPR" warning AND makes
    // the precondition fallback correct for any CPR TC lacking an explicit block.
    'CPR': { submodule: 'corporate_pricing', tab: 'Corporate Pricing page is active' },
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
   * Action-only output; per-step expected drops out (Expected Result column carries it).
   */
  private static convertStepsToHuman(steps: TestStep[]): string {
    if (!steps || steps.length === 0) return '';
    return steps
      .map(s => `${s.stepNumber}. ${this.convertElementIdsToLabels(s.action)}`)
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
   * Note: ✓/✔ checkmarks are normalized to `->` so the action↔expected arrow-split
   * works for files that use them as separators (e.g., management-history conventions).
   */
  private static sanitizeUnicode(value: string): string {
    return value
      .replace(/\u2192/g, '->')
      // Checkmarks: CONTENT forms (backticked / parenthesized / =value) -> words so a
      // content checkmark is never read as the action-expected separator (which
      // truncated steps like "show a `\u2714` marker"). Bare separator stays '->'.
      .replace(/`\s*[\u2713\u2714]\s*`/g, 'check mark')
      .replace(/\(\s*[\u2713\u2714]\s*\)/g, '(checked)')
      .replace(/\(\s*[\u2715\u2716\u2717\u2718]\s*\)/g, '(unchecked)')
      .replace(/=\s*[\u2713\u2714]/g, '= checked')
      .replace(/=\s*[\u2715\u2716\u2717\u2718]/g, '= unchecked')
      .replace(/[\u2713\u2714]/g, '->')
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
    // Check for compound ID (TC-LOC-CUR-001 or TC-LOC-LGL-HIST)
    const compoundMatch = id.match(/TC-[A-Z]+-([A-Z]+)-(?:\d+|[A-Z]+)/);
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
  const defaultOutput = `./clients/encore/test_cases_csv/${inputBasename}.csv`;
  const outputPath = positionalArgs[1] || defaultOutput;
  
  console.log(`Export type: ${exportType}`);
  CsvConverter.convertToFile(inputPath, outputPath, exportType);
}
