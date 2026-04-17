#!/usr/bin/env ts-node
/**
 * TC Registry Builder -- scans spec files for TC IDs in test titles.
 * Detects duplicates across files. Writes specs_planning/_internal/test-id-registry.json.
 *
 * Usage: npm run registry:build
 */

import * as fs from 'fs';
import * as path from 'path';
import { SHARED_PATHS } from './shared-types';
import { frameworkRoot } from './shared-paths';

interface RegistryEntry {
  tcId: string;
  file: string;
  testName: string;
  duplicateOf: string | null;
}

const SPECS_DIR = SHARED_PATHS.specs;
const OUTPUT_FILE = SHARED_PATHS.testIdRegistry;

/** TC ID pattern: TC-XXX-YY-NNN */
const TC_ID_REGEX = /TC-[A-Z]+-[A-Z]+-\d+/g;

function findSpecFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSpecFiles(fullPath));
    } else if (entry.name.endsWith('.spec.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractTestIds(filePath: string): Array<{ tcId: string; testName: string; file: string }> {
  const results: Array<{ tcId: string; testName: string; file: string }> = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');

  // Match test('...') or test("...") lines containing TC IDs
  const testPattern = /test\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match: RegExpExecArray | null;

  while ((match = testPattern.exec(content)) !== null) {
    const testTitle = match[1];
    if (!testTitle) continue;
    const tcMatches = testTitle.match(TC_ID_REGEX);
    if (tcMatches) {
      for (const tcId of tcMatches) {
        results.push({ tcId, testName: testTitle, file: relPath });
      }
    }
  }

  // Also check test.fixme(), test.skip(), test.describe() for TC IDs
  const describePattern = /test\.(fixme|skip|describe)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = describePattern.exec(content)) !== null) {
    const testTitle = match[2];
    if (!testTitle) continue;
    const tcMatches = testTitle.match(TC_ID_REGEX);
    if (tcMatches) {
      for (const tcId of tcMatches) {
        // Avoid duplicates from main scan
        if (!results.some(r => r.tcId === tcId && r.file === relPath)) {
          results.push({ tcId, testName: testTitle, file: relPath });
        }
      }
    }
  }

  return results;
}

function main(): void {
  const specFiles = findSpecFiles(SPECS_DIR);
  const allEntries: Array<{ tcId: string; testName: string; file: string }> = [];

  for (const file of specFiles) {
    allEntries.push(...extractTestIds(file));
  }

  // Detect duplicates -- same TC ID in different files
  const tcIdToFile = new Map<string, string>();
  const registry: RegistryEntry[] = [];

  for (const entry of allEntries) {
    const existingFile = tcIdToFile.get(entry.tcId);
    if (existingFile && existingFile !== entry.file) {
      registry.push({
        tcId: entry.tcId,
        file: entry.file,
        testName: entry.testName,
        duplicateOf: existingFile,
      });
    } else {
      tcIdToFile.set(entry.tcId, entry.file);
      registry.push({
        tcId: entry.tcId,
        file: entry.file,
        testName: entry.testName,
        duplicateOf: null,
      });
    }
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2) + '\n', 'utf-8');

  const duplicates = registry.filter(r => r.duplicateOf);
  console.log(`TC Registry: ${registry.length} TCs on disk, ${duplicates.length} duplicates`);
  if (duplicates.length > 0) {
    for (const d of duplicates) {
      console.log(`  [WARN] DUPLICATE: ${d.tcId} in ${d.file} (also in ${d.duplicateOf})`);
    }
  }
  console.log(`Written to: ${path.relative(frameworkRoot(), OUTPUT_FILE).replace(/\\/g, '/')}`);
}

main();
