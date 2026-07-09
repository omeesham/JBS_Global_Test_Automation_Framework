#!/usr/bin/env node
/**
 * check-step-labels.test.mjs — unit tests for the label derivation logic.
 * Uses node:test + node:assert/strict. Run via: node --test scripts/check-step-labels.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { camelToLabel, untranslatedJargon, resolveLabel } from './lib/label-derivation.mjs';

test('camelToLabel: reloadAndNavigateToSSLTab produces correct label', () => {
  assert.equal(
    camelToLabel('reloadAndNavigateToSSLTab'),
    'Reload and navigate to Shared Setup Locations tab',
  );
});

test('camelToLabel: navigateToEctTab produces correct label', () => {
  assert.equal(
    camelToLabel('navigateToEctTab'),
    'Navigate to ECT Settings tab',
  );
});

test('untranslatedJargon: handleLosStuff includes Los (denied, no translation)', () => {
  const result = untranslatedJargon('handleLosStuff');
  assert.ok(result.includes('Los'), `expected Los in ${JSON.stringify(result)}`);
});

test('untranslatedJargon: navigateToEctTab is empty (ect is translated)', () => {
  const result = untranslatedJargon('navigateToEctTab');
  assert.equal(result.length, 0, `expected empty, got ${JSON.stringify(result)}`);
});

test('resolveLabel: hand label overrides auto-derived', () => {
  assert.equal(
    resolveLabel('LocalOfficeEctPage', 'navigateToEctTab'),
    'Open ECT Settings tab',
  );
});
