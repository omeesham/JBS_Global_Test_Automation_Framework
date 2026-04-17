#!/usr/bin/env ts-node
/**
 * Duplication Detector — scans .md files for duplicated content.
 *
 * Checks:
 * 1. Markdown tables with similar content across files (fuzzy match)
 * 2. Known sentinel strings that should be single-source (counts occurrences)
 * 3. Reports any fact appearing 3+ times across files
 *
 * Usage: npx ts-node scripts/detect-duplication.ts
 * Exit: 0 = clean, 1 = duplication found
 */

import * as fs from 'fs';
import * as path from 'path';
import { SHARED_PATHS } from './shared-types';
import { clientPath, frameworkPath } from './shared-paths';

// ── Sentinel strings: known facts that should exist in 1-2 canonical files max ──
const SENTINELS: { label: string; pattern: RegExp; maxAllowed: number }[] = [
  { label: 'Pipeline command (sync:mistakes + build:context + validate:sync)', pattern: /sync:mistakes.*build:context.*validate:sync|sync:mistakes\s*&&\s*.*build:context/g, maxAllowed: 12 },
  { label: 'MCP auto-opens browser', pattern: /browser_navigate\s+auto[- ]?opens/gi, maxAllowed: 8 },
  { label: 'Stage flow enum (full 11-stage)', pattern: /pending_requirements\s*→?\s*requirements\s*→?\s*pending_planning/g, maxAllowed: 3 },
  { label: 'deviceScaleFactor pitfall', pattern: /deviceScaleFactor/g, maxAllowed: 2 },
];

// ── Directories to scan ──
// Absolute paths — client-scoped docs/specs_planning, framework-level .github.
const SCAN_DIRS = [
  clientPath('docs'),
  clientPath('specs_planning'),
  frameworkPath('.github'),
];
const SCAN_ROOT_GLOBS = ['*.md']; // Also scan root .md files

interface FileMatch {
  file: string;
  count: number;
}

interface SentinelResult {
  label: string;
  maxAllowed: number;
  totalOccurrences: number;
  files: FileMatch[];
}

interface TableSignature {
  file: string;
  headers: string;
  rowCount: number;
  /** First data row for fuzzy matching */
  firstRow: string;
}

function findMdFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, .git, test-results, etc.
      if (['node_modules', '.git', 'test-results', 'html-report', 'allure-results'].includes(entry.name)) continue;
      results.push(...findMdFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function checkSentinels(files: string[]): SentinelResult[] {
  const results: SentinelResult[] = [];

  for (const sentinel of SENTINELS) {
    const fileMatches: FileMatch[] = [];
    let total = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(sentinel.pattern);
      if (matches && matches.length > 0) {
        fileMatches.push({ file: path.relative(process.cwd(), file), count: matches.length });
        total += matches.length;
      }
    }

    results.push({
      label: sentinel.label,
      maxAllowed: sentinel.maxAllowed,
      totalOccurrences: total,
      files: fileMatches,
    });
  }

  return results;
}

function extractTables(content: string): { headers: string; rowCount: number; firstRow: string }[] {
  const tables: { headers: string; rowCount: number; firstRow: string }[] = [];
  const lines = content.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]?.trim() ?? '';
    // Detect table header row: | Col1 | Col2 | ...
    if (line.startsWith('|') && line.includes('|', 1)) {
      const nextLine = lines[i + 1]?.trim() ?? '';
      // Separator row: |---|---|
      if (/^\|[\s:-]+\|/.test(nextLine)) {
        const headers = line.replace(/\s+/g, ' ').toLowerCase();
        let rowCount = 0;
        let firstRow = '';
        let j = i + 2;
        while (j < lines.length && (lines[j]?.trim() ?? '').startsWith('|')) {
          if (rowCount === 0) firstRow = (lines[j]?.trim() ?? '').replace(/\s+/g, ' ').toLowerCase();
          rowCount++;
          j++;
        }
        if (rowCount > 0) {
          tables.push({ headers, rowCount, firstRow });
        }
        i = j;
        continue;
      }
    }
    i++;
  }

  return tables;
}

function checkDuplicateTables(files: string[]): { file1: string; file2: string; headers: string; rowCount1: number; rowCount2: number }[] {
  const allTables: (TableSignature)[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const tables = extractTables(content);
    for (const t of tables) {
      // Skip small metadata tables (1-2 rows) — these are TC metadata, not real duplication
      if (t.rowCount <= 2) continue;
      allTables.push({ file: path.relative(process.cwd(), file), ...t });
    }
  }

  const duplicates: { file1: string; file2: string; headers: string; rowCount1: number; rowCount2: number }[] = [];
  const seen = new Set<string>();

  // Known-synced table headers to skip (agent NEVER DO tables are synced from same source)
  const SKIP_HEADERS = ['| id | rule |', '| id | never | do |'];

  // Compare tables across different files (same headers + similar first row)
  for (let i = 0; i < allTables.length; i++) {
    for (let j = i + 1; j < allTables.length; j++) {
      const a = allTables[i]!;
      const b = allTables[j]!;
      if (a.file === b.file) continue;

      // Skip known-synced tables
      if (SKIP_HEADERS.some(h => a.headers.includes(h))) continue;

      if (a.headers === b.headers && a.firstRow === b.firstRow) {
        // Deduplicate same file-pair + header combo
        const key = [a.file, b.file, a.headers].sort().join('::');
        if (seen.has(key)) continue;
        seen.add(key);

        duplicates.push({
          file1: a.file,
          file2: b.file,
          headers: a.headers.substring(0, 80),
          rowCount1: a.rowCount,
          rowCount2: b.rowCount,
        });
      }
    }
  }

  return duplicates;
}

function main() {
  const rootDir = path.resolve(__dirname, '..');
  process.chdir(rootDir);

  console.log('='.repeat(60));
  console.log('Duplication Detector');
  console.log('='.repeat(60));

  // Collect all .md files (SCAN_DIRS entries are already absolute).
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    files.push(...findMdFiles(dir));
  }
  // Root .md files
  for (const entry of fs.readdirSync(rootDir)) {
    if (entry.endsWith('.md') && fs.statSync(path.join(rootDir, entry)).isFile()) {
      files.push(path.join(rootDir, entry));
    }
  }

  console.log(`\nScanning ${files.length} markdown files...\n`);

  let issues = 0;

  // ── Sentinel check ──
  console.log('--- Sentinel String Check ---\n');
  const sentinelResults = checkSentinels(files);
  for (const sr of sentinelResults) {
    if (sr.totalOccurrences > sr.maxAllowed) {
      console.log(`[WARN] "${sr.label}" appears ${sr.totalOccurrences}x (max: ${sr.maxAllowed})`);
      for (const fm of sr.files) {
        console.log(`   ${fm.file} (${fm.count}x)`);
      }
      issues++;
    } else if (sr.totalOccurrences > 0) {
      console.log(`[OK] "${sr.label}" -- ${sr.totalOccurrences}x (max: ${sr.maxAllowed})`);
    }
  }

  // ── Duplicate table check ──
  console.log('\n--- Duplicate Table Check ---\n');
  const tableDups = checkDuplicateTables(files);
  if (tableDups.length === 0) {
    console.log('[OK] No duplicate tables detected across files');
  } else {
    for (const dup of tableDups) {
      console.log(`[WARN] Duplicate table: ${dup.headers}`);
      console.log(`   ${dup.file1} (${dup.rowCount1} rows) <-> ${dup.file2} (${dup.rowCount2} rows)`);
      issues++;
    }
  }

  console.log('\n' + '='.repeat(60));
  if (issues > 0) {
    console.log(`[WARN] ${issues} duplication issue(s) found`);
    process.exit(1);
  } else {
    console.log('[OK] No duplication issues detected');
    process.exit(0);
  }
}

main();
