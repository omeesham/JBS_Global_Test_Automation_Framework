#!/usr/bin/env node
/**
 * Verifies literal @step labels against the frozen baseline, without using label derivation.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const PAGES_ROOT = join(REPO_ROOT, 'clients', 'encore', 'src', 'pages');
const BASELINE_PATH = join(__dirname, 'step-labels.baseline.json');

const ALLOWED_LABEL_CHANGES = {
  'clients/encore/src/pages/base.page.ts:67': { old: 'Navigate to', new: 'Go to the page' },
  'clients/encore/src/pages/corporate-override/corporate-override.page.ts:63': { old: 'Open', new: 'Open the pricing override page' },
  'clients/encore/src/pages/corporate-override/corporate-override.page.ts:1149': { old: 'Probe edit oracle', new: 'Try editing the cell and record what happens' },
  'clients/encore/src/pages/corporate-override/corporate-override.page.ts:1308': { old: 'Probe override price oracle', new: 'Try editing Override Price and record what happens' },
  'clients/encore/src/pages/corporate-override/corporate-override.page.ts:1314': { old: 'Probe max discount oracle', new: 'Try editing Max Discount and record what happens' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-detail.page.ts:16': { old: 'Open', new: 'Open the pricing detail page' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-detail.page.ts:153': { old: 'Get new price aria invalid', new: 'Check whether New Price is flagged invalid' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-detail.page.ts:158': { old: 'Get max discount aria invalid', new: 'Check whether Max Discount is flagged invalid' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-detail.page.ts:214': { old: 'Get header aria sort', new: 'Read the column\'s sort direction' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts:32': { old: 'Open', new: 'Open the new pricebook page' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts:142': { old: 'Open', new: 'Open the pricing search page' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts:930': { old: 'Open import all upload for', new: 'Open the Import All upload dialog' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts:1107': { old: 'Capture import all merge canaries', new: 'Record the rows used to check the merge' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts:1135': { old: 'Build import all single cell fixture', new: 'Build an Import All file with one changed cell' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts:1157': { old: 'Build import all multi cell fixture', new: 'Build an Import All file with several changed cells' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts:1557': { old: 'Get column aria sort', new: 'Read the column\'s sort direction' },
  'clients/encore/src/pages/corporate-pricing/corporate-pricing-strategy.page.ts:15': { old: 'Open', new: 'Open the pricing strategy page' },
  'clients/encore/src/pages/locations/location-currency.page.ts:277': { old: 'Trigger beforeunload and stay', new: 'Attempt to leave the page, then stay' },
  'clients/encore/src/pages/locations/location-left-panel-basic-information.page.ts:382': { old: 'Select pay to by', new: 'Select the Pay To account' },
  'clients/encore/src/pages/locations/location-legal.page.ts:212': { old: 'Trigger beforeunload and stay', new: 'Attempt to leave the page, then stay' },
  'clients/encore/src/pages/locations/location-shared-setup-locations.page.ts:41': { old: 'Trigger beforeunload and stay', new: 'Attempt to leave the page, then stay' },
};

function walkDir(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (entry.isFile() && (entry.name.endsWith('.page.ts') || entry.name.endsWith('.component.ts'))) {
      results.push(full);
    }
  }
  return results;
}

function toRepoRelative(filePath) {
  return relative(REPO_ROOT, filePath).replace(/\\/g, '/');
}

function unescapeLabel(raw, quote) {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch !== '\\') {
      out += ch;
      continue;
    }
    const next = raw[++i];
    if (next === undefined) {
      out += '\\';
    } else if (next === quote || next === '\\') {
      out += next;
    } else {
      out += `\\${next}`;
    }
  }
  return out;
}

function parseStepLiteral(line) {
  const match = /^\s*@step\(\s*(['"`])((?:\\.|(?!\1).)*)\1\s*\)\s*$/.exec(line);
  if (!match) return null;
  return unescapeLabel(match[2], match[1]);
}

function collectActualLiterals() {
  const actual = new Map();
  for (const filePath of walkDir(PAGES_ROOT)) {
    const rel = toRepoRelative(filePath);
    if (rel.endsWith('auth/login.page.ts')) continue;
    const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const label = parseStepLiteral(lines[i]);
      if (label !== null) actual.set(`${rel}:${i + 1}`, label);
    }
  }
  return actual;
}

function main() {
  if (!existsSync(BASELINE_PATH)) {
    console.error(`FAIL: baseline not found at ${BASELINE_PATH}`);
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const actual = collectActualLiterals();
  const differences = [];
  let allowed = 0;

  for (const [key, expected] of Object.entries(baseline)) {
    const actualLabel = actual.get(key);
    const allowedLabel = ALLOWED_LABEL_CHANGES[key];
    if (actualLabel === undefined) {
      differences.push(`${key}  MISSING_LITERAL  expected "${expected.label}"`);
    } else if (actualLabel === expected.label) {
      actual.delete(key);
    } else if (allowedLabel !== undefined && expected.label === allowedLabel.old && actualLabel === allowedLabel.new) {
      allowed++;
      actual.delete(key);
    } else {
      differences.push(`${key}  LABEL_MISMATCH  expected "${expected.label}", found "${actualLabel}"`);
      actual.delete(key);
    }
  }

  for (const [key, label] of actual) {
    differences.push(`${key}  EXTRA_LITERAL  found "${label}" with no baseline entry`);
  }

  if (differences.length > 0) {
    console.error(`FAIL: step-label parity — ${Object.keys(baseline).length} baseline labels, ${differences.length} unexplained difference(s):`);
    for (const diff of differences) console.error(`  - ${diff}`);
    process.exit(1);
  }

  console.log(`PASS: step-label parity — ${Object.keys(baseline).length} labels checked, 0 unexplained differences, ${allowed} allowed changes.`);
}

main();
