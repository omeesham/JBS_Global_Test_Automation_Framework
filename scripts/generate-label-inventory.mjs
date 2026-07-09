#!/usr/bin/env node
/**
 * generate-label-inventory.mjs — produce a sorted inventory of every auto-derived
 * step label across all page objects. FLAG lines indicate methods whose labels would
 * leak untranslated jargon into the Playwright HTML report.
 *
 * Usage:
 *   node scripts/generate-label-inventory.mjs [--output=<path>]
 *
 * Exit 0 = clean, exit 1 = at least one flagged method.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveLabel, untranslatedJargon } from './lib/label-derivation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const PAGES_ROOT = join(REPO_ROOT, 'clients', 'encore', 'src', 'pages');

const CLASS_RE = /export class (\w+)/;
const ASYNC_METHOD_RE = /^\s*(?:public\s+|private\s+|protected\s+)?async\s+(\w+)\s*\(/gm;

function walkDir(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (entry.isFile() && entry.name.endsWith('.page.ts')) {
      results.push(full);
    }
  }
  return results;
}

function parseArgs(argv) {
  let output = null;
  for (const a of argv) {
    if (a.startsWith('--output=')) output = a.slice('--output='.length);
  }
  return { output };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = walkDir(PAGES_ROOT);
  const entries = [];
  let flagged = 0;

  for (const filePath of files) {
    const text = readFileSync(filePath, 'utf8');
    const classMatch = CLASS_RE.exec(text);
    const className = classMatch ? classMatch[1] : basename(filePath, '.page.ts');

    let m;
    ASYNC_METHOD_RE.lastIndex = 0;
    while ((m = ASYNC_METHOD_RE.exec(text)) !== null) {
      const method = m[1];
      const label = resolveLabel(className, method);
      const jargon = untranslatedJargon(method);
      const flag = jargon.length > 0;
      if (flag) flagged++;
      entries.push({ className, method, label, jargon, flag });
    }
  }

  entries.sort((a, b) => {
    const cmp = a.className.localeCompare(b.className);
    return cmp !== 0 ? cmp : a.method.localeCompare(b.method);
  });

  const lines = [];
  for (const e of entries) {
    const prefix = e.flag ? 'FLAG ' : '';
    const suffix = e.flag ? `  [untranslated: ${e.jargon.join(', ')}]` : '';
    lines.push(`${prefix}${e.className}.${e.method} -> "${e.label}"${suffix}`);
  }

  const inventoryText = lines.join('\n') + '\n';

  if (args.output) {
    writeFileSync(args.output, inventoryText, 'utf8');
  }

  // Print inventory to stdout
  process.stdout.write(inventoryText);

  // Summary
  const summary = `${entries.length} methods, ${flagged} flagged`;
  console.log(`\n${summary}`);

  process.exit(flagged > 0 ? 1 : 0);
}

main();
