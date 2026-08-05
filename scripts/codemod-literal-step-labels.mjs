#!/usr/bin/env node
/**
 * Rewrites bare page-object @step() decorators to literal labels from the frozen baseline.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectLabelInventory } from './generate-label-inventory.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const BASELINE_PATH = join(__dirname, 'step-labels.baseline.json');
const PAGES_PREFIX = 'clients/encore/src/pages/';
const EXPECTED_COUNT = 793;

function parseArgs(argv) {
  const args = { check: false, write: false, json: false };
  for (const arg of argv) {
    if (arg === '--check') args.check = true;
    else if (arg === '--write') args.write = true;
    else if (arg === '--json') args.json = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (args.check === args.write) {
    throw new Error('Pass exactly one mode: --check or --write');
  }
  return args;
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) {
    throw new Error(`Missing baseline file: ${BASELINE_PATH}`);
  }
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const count = Object.keys(baseline).length;
  if (count !== EXPECTED_COUNT) {
    throw new Error(`Baseline must contain ${EXPECTED_COUNT} entries; found ${count}`);
  }
  return baseline;
}

function quoteLabel(label) {
  return `'${label.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function isBareStep(line) {
  return /^\s*@step\(\s*\)\s*$/.test(line);
}

function hasStepArgument(line) {
  return /^\s*@step\(\s*.+\s*\)\s*$/.test(line);
}

function buildPlan(baseline) {
  const targets = collectLabelInventory({
    includeComponents: true,
    publicOnly: true,
    decoratedOnly: true,
    excludeLogin: true,
  });
  const planned = [];
  const skipped = [];
  const errors = [];

  for (const target of targets) {
    if (!target.relativePath.startsWith(PAGES_PREFIX)) {
      errors.push(`${target.relativePath}:${target.decoratorLine} is outside ${PAGES_PREFIX}`);
      continue;
    }
    const key = `${target.relativePath}:${target.decoratorLine}`;
    const expected = baseline[key];
    if (!expected) {
      errors.push(`${key} is missing from ${BASELINE_PATH}`);
      continue;
    }
    if (expected.class !== target.className || expected.method !== target.method) {
      errors.push(`${key} baseline target mismatch: expected ${expected.class}.${expected.method}, found ${target.className}.${target.method}`);
      continue;
    }
    const text = readFileSync(target.filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const lineIndex = target.decoratorLine - 1;
    const line = lines[lineIndex] ?? '';
    if (isBareStep(line)) {
      planned.push({ ...target, key, label: expected.label, lineIndex });
    } else if (hasStepArgument(line)) {
      skipped.push({ ...target, key });
    } else {
      errors.push(`${key} is not an @step decorator line`);
    }
  }

  return { planned, skipped, errors };
}

function applyPlan(planned) {
  const byFile = new Map();
  for (const item of planned) {
    if (!byFile.has(item.filePath)) byFile.set(item.filePath, []);
    byFile.get(item.filePath).push(item);
  }

  let filesWritten = 0;
  for (const [filePath, items] of byFile) {
    const original = readFileSync(filePath, 'utf8');
    // Preserve each file's line endings so the codemod changes only decorator lines.
    const eol = original.includes('\r\n') ? '\r\n' : '\n';
    const lines = original.split(/\r?\n/);
    for (const item of items) {
      const indent = /^(\s*)/.exec(lines[item.lineIndex])[1];
      lines[item.lineIndex] = `${indent}@step(${quoteLabel(item.label)})`;
    }
    const updated = lines.join(eol);
    if (updated !== original) {
      writeFileSync(filePath, updated, 'utf8');
      filesWritten++;
    }
  }
  return filesWritten;
}

function summarize(result, mode, filesWritten = 0) {
  const files = [...new Set(result.planned.map(item => item.relativePath))].sort();
  if (mode.json) {
    console.log(JSON.stringify({
      plannedRewrites: result.planned.length,
      skippedExistingArgumentDecorators: result.skipped.length,
      files,
      errors: result.errors,
      filesWritten,
    }, null, 2));
    return;
  }

  console.log(`summary: ${result.planned.length} planned rewrites, ${result.skipped.length} skipped`);
  console.log(`planned rewrites: ${result.planned.length}`);
  console.log(`skipped existing-argument decorators: ${result.skipped.length}`);
  console.log(`files with planned rewrites: ${files.length}`);
  for (const file of files) console.log(`  ${file}`);
  if (result.errors.length > 0) {
    console.log(`errors: ${result.errors.length}`);
    for (const error of result.errors) console.log(`  ${error}`);
  }
  console.log(mode.write ? `files written: ${filesWritten}` : 'files written: 0');
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = buildPlan(loadBaseline());
    if (result.errors.length > 0) {
      summarize(result, args);
      process.exit(1);
    }
    const filesWritten = args.write ? applyPlan(result.planned) : 0;
    summarize(result, args, filesWritten);
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exit(1);
  }
}

main();
