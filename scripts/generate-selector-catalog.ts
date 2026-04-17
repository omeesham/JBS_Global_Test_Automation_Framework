/**
 * Generates src/selectors/SELECTOR_CATALOG.md from @where/@el/@text/@keys annotations.
 * Run: npm run selectors:catalog
 */
import * as fs from 'fs';
import * as path from 'path';
import { SHARED_PATHS } from './shared-types';

interface SelectorEntry {
  key: string;
  el: string;
  where: string;
  text: string;
  keys: string;
  file: string;       // relative to src/selectors/
  isDynamic: boolean;
  param?: string;      // @param info for dynamic selectors
}

// Regex: single-line JSDoc annotation
const ANNOTATION_RE = /\/\*\*\s+@where\s+(.+?)\s+@el\s+(\S+)\s+@text\s+(.+?)\s+@keys\s+(.+?)(?:\s+@param\s+(.+?))?\s*\*\//;
const PARTIAL_RE = /\/\*\*\s+@where\s/;
const KEY_RE = /^\s*(\w+)\s*[:(]/;

const SELECTORS_DIR = SHARED_PATHS.selectors;
const OUTPUT_FILE = path.join(SELECTORS_DIR, 'SELECTOR_CATALOG.md');

function getTypeScriptFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getTypeScriptFiles(fullPath));
    } else if (entry.name.endsWith('.ts') && entry.name !== 'index.ts') {
      results.push(fullPath);
    }
  }
  return results;
}

function parseFile(filePath: string): SelectorEntry[] {
  const entries: SelectorEntry[] = [];
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  const relPath = path.relative(SELECTORS_DIR, filePath).replace(/\\/g, '/');
  let warnings = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    // Check for annotation
    if (PARTIAL_RE.test(line)) {
      const match = line.match(ANNOTATION_RE);
      if (!match) {
        console.warn(`[WARN] MALFORMED annotation at ${relPath}:${i + 1}: ${line.trim()}`);
        warnings++;
        continue;
      }

      // Find next non-empty line for key
      let keyLine = '';
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j];
        if (nextLine && nextLine.trim()) { keyLine = nextLine; break; }
      }
      const keyMatch = keyLine.match(KEY_RE);
      if (!keyMatch) {
        console.warn(`[WARN] No key found after annotation at ${relPath}:${i + 1}`);
        warnings++;
        continue;
      }

      const isDynamic = keyLine.includes('=>') || keyLine.includes('(');
      const text = (match[3] || '').replace(/^"|"$/g, '');

      entries.push({
        key: keyMatch[1] || '',
        where: match[1] || '',
        el: match[2] || '',
        text,
        keys: match[4] || '',
        file: relPath,
        isDynamic: isDynamic && keyLine.includes('=>'),
        param: match[5] || undefined,
      });
    }
  }

  if (warnings > 0) {
    console.warn(`  ${warnings} warning(s) in ${relPath}`);
  }
  return entries;
}

function generateCatalog(entries: SelectorEntry[]): string {
  const staticEntries = entries.filter(e => !e.isDynamic);
  const dynamicEntries = entries.filter(e => e.isDynamic);

  // Sort by where, then key
  const sorter = (a: SelectorEntry, b: SelectorEntry) =>
    a.where.localeCompare(b.where) || a.key.localeCompare(b.key);
  staticEntries.sort(sorter);
  dynamicEntries.sort(sorter);

  const lines: string[] = [
    '# Selector Catalog',
    '',
    '> **Auto-generated** -- do not edit manually. Regenerate: `npm run selectors:catalog`',
    '',
    '## Agent Lookup Flow',
    '',
    '1. **SEARCH** this catalog (Ctrl+F or grep) by visible text, keyword, or UI location',
    '2. **DRILL** into the source file (File column) for full selector string + context',
    '3. **NOT FOUND?** -> discover via MCP browser, add selector WITH annotation, regenerate catalog',
    '',
    `## Static Selectors (${staticEntries.length})`,
    '',
    '| Key | Type | Where | Text | Keywords | File |',
    '|-----|------|-------|------|----------|------|',
  ];

  for (const e of staticEntries) {
    lines.push(`| ${e.key} | ${e.el} | ${e.where} | ${e.text} | ${e.keys} | ${e.file} |`);
  }

  lines.push('');
  lines.push(`## Dynamic Selectors (${dynamicEntries.length})`);
  lines.push('');
  lines.push('> Require parameters -- use `DynamicSelectors.key(param)` directly.');
  lines.push('');
  lines.push('| Key | Type | Where | Text | Keywords | Param | File |');
  lines.push('|-----|------|-------|------|----------|-------|------|');

  for (const e of dynamicEntries) {
    lines.push(`| ${e.key} | ${e.el} | ${e.where} | ${e.text} | ${e.keys} | ${e.param || ''} | ${e.file} |`);
  }

  lines.push('');
  lines.push(`---`);
  lines.push(`*Generated: ${new Date().toISOString()} | Total: ${entries.length} selectors (${staticEntries.length} static + ${dynamicEntries.length} dynamic)*`);
  lines.push('');

  return lines.join('\n');
}

// Main
const files = getTypeScriptFiles(SELECTORS_DIR);
console.log(`Scanning ${files.length} selector file(s)...`);

const allEntries: SelectorEntry[] = [];
for (const file of files) {
  const entries = parseFile(file);
  allEntries.push(...entries);
  console.log(`  ${path.relative(SELECTORS_DIR, file).replace(/\\/g, '/')}: ${entries.length} selectors`);
}

const catalog = generateCatalog(allEntries);
fs.writeFileSync(OUTPUT_FILE, catalog, 'utf-8');
console.log(`\n[ok] Catalog written: ${OUTPUT_FILE}`);
console.log(`  Total: ${allEntries.length} selectors (${allEntries.filter(e => !e.isDynamic).length} static + ${allEntries.filter(e => e.isDynamic).length} dynamic)`);
