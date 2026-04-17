#!/usr/bin/env ts-node
/**
 * TC Parity Check: Spec TCs vs Markdown TCs vs CSV TCs
 *
 * Compares Playwright spec test IDs against markdown test case files
 * and CSV exports to find:
 *   1. TCs in specs but NOT in markdown (missing from client CSVs)
 *   2. TCs in specs but NOT in CSV (export gap)
 *   3. TCs in markdown but NOT in CSV (parser/export bug)
 *
 * Usage: npx ts-node scripts/check-tc-parity.ts [--fix-csv]
 *   --fix-csv: Re-export all markdown files to CSV after reporting
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { SHARED_PATHS } from './shared-types';

const TC_PATTERN = /TC-[A-Z]+-[A-Z]+-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g;

function getSpecTcIds(): Set<string> {
  const output = execSync('npx playwright test --list', {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const ids = new Set<string>();
  for (const match of output.matchAll(TC_PATTERN)) {
    ids.add(match[0]);
  }
  return ids;
}

function getMarkdownTcIds(): Set<string> {
  const ids = new Set<string>();
  const testCasesDir = SHARED_PATHS.testCases;
  const files = findMarkdownFiles(testCasesDir);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const headerPattern = /^#{2,3}\s+(TC-[A-Z]+(?:-[A-Z]+)?-(?:\d+[A-Z]?|[A-Z]+)(?:-[A-Z]+)*):/gm;
    let match;
    while ((match = headerPattern.exec(content)) !== null) {
      ids.add(match[1]!);
    }
  }
  return ids;
}

function getCsvTcIds(): Set<string> {
  const ids = new Set<string>();
  const exportsDir = SHARED_PATHS.exports;
  if (!fs.existsSync(exportsDir)) return ids;
  const csvFiles = fs.readdirSync(exportsDir).filter(f => f.endsWith('.csv'));
  for (const file of csvFiles) {
    const content = fs.readFileSync(path.join(exportsDir, file), 'utf8');
    for (const match of content.matchAll(TC_PATTERN)) {
      ids.add(match[0]);
    }
  }
  return ids;
}

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function setDiff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter(x => !b.has(x)).sort();
}

// --- Main ---
const specIds = getSpecTcIds();
const mdIds = getMarkdownTcIds();
const csvIds = getCsvTcIds();

const inSpecNotMd = setDiff(specIds, mdIds);
const inSpecNotCsv = setDiff(specIds, csvIds);
const inMdNotCsv = setDiff(mdIds, csvIds);
const inMdNotSpec = setDiff(mdIds, specIds);

let hasIssues = false;

console.log('=== TC Parity Report ===\n');
console.log(`Spec TCs:     ${specIds.size}`);
console.log(`Markdown TCs: ${mdIds.size}`);
console.log(`CSV TCs:      ${csvIds.size}\n`);

if (inSpecNotMd.length > 0) {
  hasIssues = true;
  console.log(`CRITICAL: ${inSpecNotMd.length} TCs in specs but NOT in markdown (missing from client CSVs):`);
  inSpecNotMd.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

if (inSpecNotCsv.length > 0) {
  hasIssues = true;
  console.log(`CRITICAL: ${inSpecNotCsv.length} TCs in specs but NOT in CSV (export gap):`);
  inSpecNotCsv.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

if (inMdNotCsv.length > 0) {
  hasIssues = true;
  console.log(`WARNING: ${inMdNotCsv.length} TCs in markdown but NOT in CSV (parser/export bug):`);
  inMdNotCsv.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

console.log(`INFO: ${inMdNotSpec.length} TCs in markdown but not yet in specs (planned, not implemented)`);
console.log('');

if (!hasIssues) {
  console.log('PASS: All spec TCs are present in both markdown and CSV exports.');
} else {
  console.log('FAIL: Parity issues detected. Fix markdown gaps, then re-export CSVs.');
}

if (process.argv.includes('--fix-csv')) {
  console.log('\n--- Re-exporting all markdown to CSV ---');
  const mdFiles = findMarkdownFiles(SHARED_PATHS.testCases);
  for (const mdFile of mdFiles) {
    const basename = path.basename(mdFile, '.md');
    const outPath = path.join(SHARED_PATHS.exports, `${basename}.csv`);
    console.log(`  ${basename}...`);
    execSync(`npx ts-node export_test_cases/to-csv.ts "${mdFile}" "${outPath}" --type=human`, {
      stdio: 'inherit',
    });
  }
  console.log('Done.');
}

process.exit(hasIssues ? 1 : 0);
