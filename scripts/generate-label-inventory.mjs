#!/usr/bin/env node
/**
 * generate-label-inventory.mjs — produce a sorted inventory of every literal
 * step label across all page objects. FLAG lines indicate methods whose labels would
 * leak denied terms into the Playwright HTML report.
 *
 * Usage:
 *   node scripts/generate-label-inventory.mjs [--output=<path>]
 *
 * Exit 0 = clean, exit 1 = at least one flagged method.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, basename, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findDeniedJargonInLabel } from './lib/step-label-terms.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const PAGES_ROOT = join(REPO_ROOT, 'clients', 'encore', 'src', 'pages');

const CLASS_RE = /export\s+(?:abstract\s+)?class\s+(\w+)/;
const ASYNC_METHOD_RE = /^\s*(?:public\s+|private\s+|protected\s+)?async\s+(\w+)\s*\(/gm;
const PUBLIC_ASYNC_METHOD_RE = /^\s*(?:public\s+)?async\s+(\w+)\s*\(/;
const STEP_DECORATOR_RE = /^\s*@step\((.*)\)\s*$/;
const LOGIN_PAGE_SUFFIX = 'auth/login.page.ts';

export function walkDir(dir, options = {}) {
  const { includeComponents = false } = options;
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, options));
    } else if (entry.isFile() && (entry.name.endsWith('.page.ts') || (includeComponents && entry.name.endsWith('.component.ts')))) {
      results.push(full);
    }
  }
  return results;
}

export function toRepoRelative(filePath) {
  return relative(REPO_ROOT, filePath).replace(/\\/g, '/');
}

export function extractClassName(text, filePath) {
  const classMatch = CLASS_RE.exec(text);
  return classMatch ? classMatch[1] : basename(filePath, '.page.ts');
}

function isLoginPage(filePath) {
  return filePath.replace(/\\/g, '/').endsWith(LOGIN_PAGE_SUFFIX);
}

function extractDecoratorArgument(line) {
  const match = STEP_DECORATOR_RE.exec(line);
  return match ? match[1].trim() : null;
}

function extractDecoratorLabel(line) {
  const match = /^\s*@step\(\s*(['"`])([^'"`\n]*)\1\s*\)\s*$/.exec(line);
  return match ? match[2] : '';
}

export function collectLabelInventory(options = {}) {
  const {
    includeComponents = false,
    publicOnly = false,
    decoratedOnly = false,
    excludeLogin = false,
  } = options;
  const files = walkDir(PAGES_ROOT, { includeComponents });
  const entries = [];

  for (const filePath of files) {
    if (excludeLogin && isLoginPage(filePath)) continue;
    const text = readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const className = extractClassName(text, filePath);
    const relativePath = toRepoRelative(filePath);

    if (publicOnly || decoratedOnly) {
      for (let i = 0; i < lines.length; i++) {
        const methodMatch = PUBLIC_ASYNC_METHOD_RE.exec(lines[i]);
        if (!methodMatch) continue;
        const decoratorLine = i > 0 ? lines[i - 1] : '';
        const decoratorArgument = extractDecoratorArgument(decoratorLine);
        if (decoratedOnly && decoratorArgument === null) continue;
        const method = methodMatch[1];
        const label = extractDecoratorLabel(decoratorLine);
        const jargon = label === '' ? [] : findDeniedJargonInLabel(label);
        entries.push({
          filePath,
          relativePath,
          className,
          method,
          label,
          jargon,
          flag: jargon.length > 0,
          methodLine: i + 1,
          decoratorLine: decoratorArgument === null ? null : i,
          decoratorArgument,
        });
      }
      continue;
    }

    let m;
    ASYNC_METHOD_RE.lastIndex = 0;
    while ((m = ASYNC_METHOD_RE.exec(text)) !== null) {
      const method = m[1];
      const methodLine = text.slice(0, m.index).split(/\r?\n/).length;
      const decoratorLine = methodLine > 1 ? lines[methodLine - 2] : '';
      const label = extractDecoratorLabel(decoratorLine);
      const jargon = label === '' ? [] : findDeniedJargonInLabel(label);
      entries.push({
        filePath,
        relativePath,
        className,
        method,
        label,
        jargon,
        flag: jargon.length > 0,
        methodLine,
        decoratorLine: extractDecoratorArgument(decoratorLine) === null ? null : methodLine - 1,
        decoratorArgument: extractDecoratorArgument(decoratorLine),
      });
    }
  }

  entries.sort((a, b) => {
    const fileCmp = a.relativePath.localeCompare(b.relativePath);
    if (fileCmp !== 0) return fileCmp;
    return a.methodLine - b.methodLine;
  });
  return entries;
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
  const entries = collectLabelInventory();
  let flagged = 0;

  entries.sort((a, b) => {
    const cmp = a.className.localeCompare(b.className);
    return cmp !== 0 ? cmp : a.method.localeCompare(b.method);
  });

  const lines = [];
  for (const e of entries) {
    const prefix = e.flag ? 'FLAG ' : '';
    const suffix = e.flag ? `  [denied: ${e.jargon.join(', ')}]` : '';
    lines.push(`${prefix}${e.className}.${e.method} -> "${e.label}"${suffix}`);
    if (e.flag) flagged++;
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
