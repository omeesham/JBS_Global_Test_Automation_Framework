#!/usr/bin/env node
// _helpers.mjs — shared test-fixture utilities for plan-closure self-tests.

export const FIXTURE_DIR = new URL('.', import.meta.url).pathname.replace(/\/$/, '');

export function expectedVerdict(fixtureName) {
  if (fixtureName.startsWith('good-')) return 'PASS';
  if (fixtureName.startsWith('bad-')) return 'FAIL';
  if (fixtureName.startsWith('sp-a-')) return 'FAIL';
  return 'UNKNOWN';
}
