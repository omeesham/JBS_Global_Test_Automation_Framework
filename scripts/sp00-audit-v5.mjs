#!/usr/bin/env node
/**
 * sp00-audit-v5.mjs — Comprehensive CSV deliverable audit
 *
 * Scans all 12 columns of every CSV in clients/encore/test_cases_csv/ for:
 *   1. Empty required cells
 *   2. Jargon / framework leakage
 *   3. Slop phrases in reason column
 *   4. Malformed TC IDs
 *   5. Contradictory data (Automated vs Execution)
 *   6. Specific Field duplicating Title
 *   7. HALT-FOR-USER sentinels (exposed, not counted as defects)
 *
 * Exit 0 = clean, exit 1 = defects found.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const CSV_DIR = join(process.cwd(), 'clients', 'encore', 'test_cases_csv');
const COLUMNS = [
  'TC ID', 'Title', 'Module', 'Submodule', 'Specific Field',
  'Preconditions', 'Steps', 'Expected Result', 'Notes',
  'Automated', 'Automation Execution', 'If Failed Reason of Failure'
];
const REQUIRED_ALWAYS = new Set([
  'TC ID', 'Title', 'Module', 'Submodule', 'Preconditions',
  'Steps', 'Expected Result'
]);

const JARGON_PATTERNS = [
  /\bAngular\b/i,
  /\bFormControl\b/,
  /\bFormGroup\b/,
  /\bFormArray\b/,
  /\baria-[a-z]+/,
  /\bRadix\b/,
  /\bNext\.js\b/i,
  /\bReact\b/,
  /\bshadcn\b/i,
  /\blucide\b/i,
  /\bpage\.locator\b/,
  /\bpage\.goto\b/,
  /\bpage\.click\b/,
  /\bawait\s+page\b/,
  /\btest\.fixme\b/,
  /\btest\.skip\b/,
  /\.spec\.ts\b/,
  /\.page\.ts\b/,
  /\.data\.ts\b/,
  /\bselectors?\.[a-z]/i,
  /\bPRIMARY_SYMPTOM\b/,
  /\bMCP_VERIFICATION_LOG\b/,
  /\bInternal:/,
  /\/navigator\/api\//,
  /\/api\/v\d/,
  /\bPOST\s+\//,
  /\bGET\s+\//,
  /\bPUT\s+\//,
  /\bDELETE\s+\//,
  /\bclickSaveWithDialog\b/,
  /\bclickSaveAndConfirm\b/,
  /\bfillAndTab\b/,
  /\bclearAndTab\b/,
  /\bwaitForAngularStable\b/,
  /\bsetRadixCheckbox\b/,
  /\bdismissAlertDialogIfVisible\b/,
  /\bdata-testid\b/,
  /\bdata-state\b/,
];

const JARGON_EXEMPTIONS = [
  /\bdata-testid\b/,
  /\bdata-state\b/,
];

const SLOP_PHRASES = [
  /^automation pending$/i,
  /^depends on environment$/i,
  /^by design$/i,
  /^future enhancement$/i,
  /^TBD$/i,
  /^tbd$/,
  /^spec not yet implemented$/i,
  /^N\/A$/i,
];

const TC_ID_PATTERN = /^TC-(LOC|LOS)-[A-Z]+-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

function parseCSV(content) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  const lines = content.split('\n');

  for (const line of lines) {
    if (inQuotes) {
      current += '\n' + line;
    } else {
      current = line;
    }

    const quoteCount = (current.match(/"/g) || []).length;
    inQuotes = quoteCount % 2 !== 0;

    if (!inQuotes) {
      const trimmed = current.replace(/\r$/, '');
      if (trimmed.length > 0) {
        rows.push(parseCSVRow(trimmed));
      }
      current = '';
    }
  }
  return rows;
}

function parseCSVRow(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  // Strip BOM
  if (line.charCodeAt(0) === 0xFEFF) line = line.slice(1);

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        cells.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  cells.push(current);
  return cells;
}

function isJargon(text, colName, rowContext = '') {
  // Accessibility-themed TCs may legitimately reference ARIA attributes
  const isAccessibilityTC = /accessibility|aria|keyboard navigation/i.test(rowContext);

  // Notes column is more permissive — only flag the worst offenders
  const patterns = colName === 'Notes'
    ? JARGON_PATTERNS.filter(p =>
        /PRIMARY_SYMPTOM|MCP_VERIFICATION_LOG|Internal:|page\.locator|page\.goto/.test(p.source))
    : JARGON_PATTERNS;

  for (const pat of patterns) {
    if (pat.test(text)) {
      // Exempt ARIA mentions in accessibility-themed TCs
      if (isAccessibilityTC && /aria-/.test(pat.source)) continue;
      // Check exemptions for Specific Field and Steps columns
      if (['Specific Field', 'Steps', 'Expected Result', 'Preconditions'].includes(colName)) {
        if (/data-testid|data-state/.test(text) && /button\[role/.test(text)) continue;
      }
      return pat.source;
    }
  }
  return null;
}

function audit() {
  const csvFiles = readdirSync(CSV_DIR).filter(f => f.endsWith('.csv')).sort();
  const defects = [];
  const halts = [];
  let totalRows = 0;

  for (const file of csvFiles) {
    const content = readFileSync(join(CSV_DIR, file), 'utf8');
    const rows = parseCSV(content);

    if (rows.length < 2) {
      defects.push({ file, row: 0, col: '-', issue: 'CSV has no data rows' });
      continue;
    }

    const header = rows[0];
    const headerMap = {};
    header.forEach((h, i) => { headerMap[h.replace(/^﻿/, '')] = i; });

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      totalRows++;
      const tcId = (row[headerMap['TC ID']] || '').trim();
      const automated = (row[headerMap['Automated']] || '').trim();
      const execution = (row[headerMap['Automation Execution']] || '').trim();
      const reason = (row[headerMap['If Failed Reason of Failure']] || '').trim();
      const title = (row[headerMap['Title']] || '').trim();
      const specificField = (row[headerMap['Specific Field']] || '').trim();

      // 1. TC ID format
      if (tcId && !TC_ID_PATTERN.test(tcId)) {
        defects.push({ file, row: r + 1, col: 'TC ID', issue: `Malformed TC ID: "${tcId}"` });
      }

      // 2. HALT-FOR-USER (expose, not defect)
      for (let c = 0; c < row.length && c < COLUMNS.length; c++) {
        if ((row[c] || '').includes('HALT-FOR-USER')) {
          halts.push({ file, row: r + 1, tcId, col: COLUMNS[c], value: row[c].trim() });
        }
      }

      // 3. Empty required columns
      for (const colName of REQUIRED_ALWAYS) {
        const idx = headerMap[colName];
        if (idx !== undefined && !(row[idx] || '').trim()) {
          defects.push({ file, row: r + 1, col: colName, issue: 'Empty required cell' });
        }
      }

      // Specific Field — required but can be empty if genuinely N/A
      // Automation Execution — required when Automated=Yes
      if (automated === 'Yes' && !execution) {
        defects.push({ file, row: r + 1, col: 'Automation Execution', issue: 'Empty but Automated=Yes' });
      }

      // Reason — required when Automated=No or Execution=Fail
      if ((automated === 'No' || execution === 'Fail') && !reason) {
        defects.push({ file, row: r + 1, col: 'If Failed Reason of Failure', issue: 'Empty but required (Automated=No or Execution=Fail)' });
      }

      // 4. Contradictory data
      if (automated === 'No' && execution === 'Pass') {
        defects.push({ file, row: r + 1, col: 'Automation Execution', issue: 'Contradictory: Automated=No but Execution=Pass' });
      }

      // 5. Specific Field duplicates Title
      if (specificField && title && specificField === title) {
        defects.push({ file, row: r + 1, col: 'Specific Field', issue: 'Duplicates Title verbatim' });
      }

      // 6. Jargon scan (all columns except TC ID, Module, Submodule, Automated, Automation Execution)
      const jargonCols = ['Title', 'Specific Field', 'Preconditions', 'Steps',
        'Expected Result', 'Notes', 'If Failed Reason of Failure'];
      for (const colName of jargonCols) {
        const idx = headerMap[colName];
        if (idx === undefined) continue;
        const val = (row[idx] || '').trim();
        if (!val) continue;
        const match = isJargon(val, colName, title + ' ' + specificField);
        if (match) {
          defects.push({ file, row: r + 1, col: colName, issue: `Jargon: matched /${match}/` });
        }
      }

      // 7. Slop phrases in reason column
      if (reason) {
        for (const pat of SLOP_PHRASES) {
          if (pat.test(reason)) {
            defects.push({ file, row: r + 1, col: 'If Failed Reason of Failure', issue: `Slop phrase: "${reason}"` });
            break;
          }
        }
      }

      // 8. Placeholder detection (all cells)
      for (let c = 0; c < row.length && c < COLUMNS.length; c++) {
        const val = (row[c] || '').trim();
        if (/^(TBD|tbd|xxx|XXX|\?\?\?|placeholder)$/i.test(val)) {
          defects.push({ file, row: r + 1, col: COLUMNS[c], issue: `Placeholder: "${val}"` });
        }
      }
    }
  }

  // Report
  console.log('═══ SP00 Audit v5 — Comprehensive CSV Deliverable Audit ═══\n');
  console.log(`Files scanned: ${csvFiles.length}`);
  console.log(`Total data rows: ${totalRows}`);
  console.log(`Defects found: ${defects.length}`);
  console.log(`HALT-FOR-USER sentinels: ${halts.length}\n`);

  if (defects.length > 0) {
    console.log('── DEFECTS ──\n');
    const byFile = {};
    for (const d of defects) {
      if (!byFile[d.file]) byFile[d.file] = [];
      byFile[d.file].push(d);
    }
    for (const [file, defs] of Object.entries(byFile)) {
      console.log(`${file} (${defs.length} defects):`);
      for (const d of defs) {
        console.log(`  Row ${d.row} [${d.col}]: ${d.issue}`);
      }
      console.log();
    }

    const byCat = {};
    for (const d of defects) {
      const cat = d.issue.split(':')[0];
      byCat[cat] = (byCat[cat] || 0) + 1;
    }
    console.log('── BY CATEGORY ──');
    for (const [cat, count] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${cat}: ${count}`);
    }
    console.log();
  }

  if (halts.length > 0) {
    console.log('── HALT-FOR-USER SENTINELS ──\n');
    for (const h of halts) {
      console.log(`  ${h.file} Row ${h.row} [${h.col}] ${h.tcId}: ${h.value}`);
    }
    console.log();
  }

  if (defects.length === 0) {
    console.log('✓ CLEAN — no defects found.\n');
    process.exit(0);
  } else {
    console.log(`✗ FAILED — ${defects.length} defect(s) must be resolved.\n`);
    process.exit(1);
  }
}

audit();
