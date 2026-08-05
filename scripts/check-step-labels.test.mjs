#!/usr/bin/env node
/**
 * check-step-labels.test.mjs — unit tests for the step-label gate.
 * Uses node:test + node:assert/strict. Run via: node --test scripts/check-step-labels.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkDecoratorPresence, checkHandLabelJargon } from './check-step-labels.mjs';

function withFixture(lines, run) {
  const dir = mkdtempSync(join(tmpdir(), 'step-labels-'));
  const file = join(dir, 'fixture.page.ts');
  writeFileSync(file, `${lines.join('\n')}\n`, 'utf8');
  try {
    return run([file]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('approved CSV label passes the jargon gate', () => {
  const violations = withFixture([
    "class PageObject {",
    "  @step('Capture Location Pricing CSV rows')",
    "  async captureRows() {}",
    "}",
  ], checkHandLabelJargon);
  assert.deepEqual(violations, []);
});

test('approved ECT Settings label passes the jargon gate', () => {
  const violations = withFixture([
    "class PageObject {",
    "  @step('Open ECT Settings tab')",
    "  async openTab() {}",
    "}",
  ], checkHandLabelJargon);
  assert.deepEqual(violations, []);
});

test('bare ect label fails the jargon gate', () => {
  const violations = withFixture([
    "class PageObject {",
    "  @step('Open ect tab')",
    "  async openTab() {}",
    "}",
  ], checkHandLabelJargon);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /HAND-LABEL-JARGON/);
  assert.match(violations[0], /\[ect\]/);
});

test('bare ssl label fails the jargon gate', () => {
  const violations = withFixture([
    "class PageObject {",
    "  @step('Open ssl tab')",
    "  async openTab() {}",
    "}",
  ], checkHandLabelJargon);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /HAND-LABEL-JARGON/);
  assert.match(violations[0], /\[ssl\]/);
});

test('escaped apostrophe label passes the decorator gate', () => {
  const violations = withFixture([
    "class PageObject {",
    "  @step('Read the column\\'s sort direction')",
    "  async readSortDirection() {}",
    "}",
  ], checkDecoratorPresence);
  assert.deepEqual(violations, []);
});

test('escaped apostrophe label is unescaped before jargon scanning', () => {
  const violations = withFixture([
    "class PageObject {",
    "  @step('Read the column\\'s sort direction')",
    "  async readSortDirection() {}",
    "}",
  ], checkHandLabelJargon);
  assert.deepEqual(violations, []);
});

test('double-quoted label passes the decorator gate', () => {
  const violations = withFixture([
    "class PageObject {",
    '  @step("Open the pricing search page")',
    "  async openSearch() {}",
    "}",
  ], checkDecoratorPresence);
  assert.deepEqual(violations, []);
});

test('bare step decorator fails the decorator gate', () => {
  const violations = withFixture([
    "class PageObject {",
    "  @step()",
    "  async openTab() {}",
    "}",
  ], checkDecoratorPresence);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /DECORATOR-MISSING/);
  assert.match(violations[0], /non-empty string @step label/);
});

test('empty step label fails the decorator gate', () => {
  const violations = withFixture([
    "class PageObject {",
    "  @step('')",
    "  async openTab() {}",
    "}",
  ], checkDecoratorPresence);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /DECORATOR-MISSING/);
  assert.match(violations[0], /non-empty string @step label/);
});
