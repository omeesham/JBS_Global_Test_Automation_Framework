#!/usr/bin/env ts-node
/**
 * Generator Pre-flight Selector Validation -- Step 7b in Generator workflow.
 *
 * Reads a spec file, extracts all selector key references, and verifies each key
 * exists in src/selectors/index.ts. Exits 1 on missing keys.
 *
 * Usage: npm run generator:validate-selectors <spec-file>
 * Exit: 0 = all selectors valid, 1 = missing selectors found
 */

import * as fs from 'fs';
import * as path from 'path';

const SELECTOR_DIR = path.join(__dirname, '../src/selectors');

/** Known selector type prefixes. */
const SELECTOR_PREFIXES = ['btn', 'txt', 'drp', 'chk', 'lnk', 'rdo', 'dlg', 'tbl', 'err', 'col', 'spin', 'tab', 'pnl', 'lbl', 'bar', 'cell', 'opt', 'row', 'dtp', 'nav', 'mod', 'ico', 'div'];

/** Recursively collect all .ts files under a directory. */
function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectTsFiles(fullPath));
    else if (entry.name.endsWith('.ts')) results.push(fullPath);
  }
  return results;
}

/** Extract all known selector keys from all files under src/selectors/. */
function loadSelectorKeys(): Set<string> {
  if (!fs.existsSync(SELECTOR_DIR)) {
    console.error(`[ERR] Selector directory not found: ${SELECTOR_DIR}`);
    process.exit(1);
  }

  const keys = new Set<string>();
  const keyPattern = /^\s*(\w+)\s*:/gm;

  for (const file of collectTsFiles(SELECTOR_DIR)) {
    const content = fs.readFileSync(file, 'utf-8');
    let match: RegExpExecArray | null;
    while ((match = keyPattern.exec(content)) !== null) {
      if (match[1]) keys.add(match[1]);
    }
  }

  return keys;
}

/** Extract selector key references from a spec file. */
function extractSpecSelectorRefs(specContent: string): { key: string; line: number }[] {
  const refs: { key: string; line: number }[] = [];
  const lines = specContent.split('\n');
  const prefixGroup = SELECTOR_PREFIXES.join('|');

  // Match quoted selector keys: 'chkApplyLDW', "btnSave", `spinLDWPercentage`
  const quotedPattern = new RegExp(`['"\`]((?:${prefixGroup})[A-Z]\\w+)['"\`]`, 'g');

  // Match property access ONLY on known selector objects: LocationSettingsSelectors.chkApplyLDW, selectors.btnSave
  // Excludes data variable access like dep.spinRestore, bc.restoreValue, tc.key (false positives)
  const SELECTOR_OBJECT_NAMES = ['LocationSettingsSelectors', 'LocalOfficeSettingsSelectors', 'MicrosoftLoginSelectors',
    'SetupLocalInfoSelectors', 'SetupLeftPanelSelectors', 'SetupSharedSelectors',
    'SetupCurrencySelectors', 'SetupPricingSelectors', 'DynamicSelectors', 'ALL_SELECTORS', 'selectors'];
  const dotObjPattern = new RegExp(`(?:${SELECTOR_OBJECT_NAMES.join('|')})\\.((?:${prefixGroup})[A-Z]\\w+)`, 'g');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    // Skip comments and imports
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*') || line.includes('import ')) continue;

    let m: RegExpExecArray | null;

    quotedPattern.lastIndex = 0;
    while ((m = quotedPattern.exec(line)) !== null) {
      if (m[1]) refs.push({ key: m[1], line: i + 1 });
    }

    dotObjPattern.lastIndex = 0;
    while ((m = dotObjPattern.exec(line)) !== null) {
      if (m[1]) refs.push({ key: m[1], line: i + 1 });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return refs.filter(r => {
    if (seen.has(r.key)) return false;
    seen.add(r.key);
    return true;
  });
}

function main(): void {
  const specPath = process.argv[2];
  if (!specPath) {
    console.error('Usage: npm run generator:validate-selectors <spec-file>');
    console.error('Example: npm run generator:validate-selectors tests/specs/setup/locations/location-local-information.spec.ts');
    process.exit(1);
  }

  const absPath = path.isAbsolute(specPath) ? specPath : path.join(process.cwd(), specPath);
  if (!fs.existsSync(absPath)) {
    console.error(`[ERR] Spec file not found: ${absPath}`);
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Generator Pre-flight Selector Validation');
  console.log('='.repeat(60));
  console.log(`Spec: ${path.relative(process.cwd(), absPath)}`);

  const selectorKeys = loadSelectorKeys();
  console.log(`Loaded ${selectorKeys.size} selector keys from index.ts\n`);

  const specContent = fs.readFileSync(absPath, 'utf-8');
  const refs = extractSpecSelectorRefs(specContent);

  if (refs.length === 0) {
    console.log('[info]  No selector key references found in spec file');
    process.exit(0);
  }

  console.log(`Found ${refs.length} selector key reference(s):\n`);

  const missing: { key: string; line: number }[] = [];
  const valid: string[] = [];

  for (const ref of refs) {
    if (selectorKeys.has(ref.key)) {
      valid.push(ref.key);
      console.log(`  [OK] ${ref.key} (line ${ref.line})`);
    } else {
      missing.push(ref);
      console.error(`  [ERR] ${ref.key} (line ${ref.line}) -- NOT in index.ts`);
    }
  }

  console.log(`\n${'-'.repeat(40)}`);
  console.log(`Valid: ${valid.length}  |  Missing: ${missing.length}`);

  if (missing.length > 0) {
    const warnOnly = process.argv.includes('--warn-only');
    if (warnOnly) {
      console.warn(`\n[WARN] WARN-ONLY: ${missing.length} selector key(s) missing -- proceeding anyway`);
      // Append toolingWarnings to failure-summary.json if it exists, or create it
      const failureSummaryPath = path.join(process.cwd(), 'reports/failure-summary.json');
      try {
        let summary: Record<string, unknown>;
        if (fs.existsSync(failureSummaryPath)) {
          summary = JSON.parse(fs.readFileSync(failureSummaryPath, 'utf-8'));
        } else {
          summary = {};
        }
        if (!Array.isArray(summary.toolingWarnings)) summary.toolingWarnings = [];
        (summary.toolingWarnings as unknown[]).push({
          source: 'generator-validate-selectors',
          message: `${missing.length} selector key(s) missing: ${missing.map(m => m.key).join(', ')}`,
          timestamp: new Date().toISOString(),
        });
        fs.writeFileSync(failureSummaryPath, JSON.stringify(summary, null, 2) + '\n');
      } catch {
        // Ignore -- non-critical
      }
      process.exit(0);
    }
    console.error(`\n[ERR] BLOCKED: ${missing.length} selector key(s) missing from src/selectors/`);
    console.error('   Add missing selectors to the appropriate file under src/selectors/ BEFORE running tests.');
    console.error('   Then use browser_snapshot to verify each CSS string matches a real DOM element.');
    process.exit(1);
  }

  console.log('\n[OK] All selector keys validated');
  process.exit(0);
}

main();
