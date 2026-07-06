#!/usr/bin/env node
/**
 * Unit tests for check-dead-exports.mjs parseTsPruneLine() — the ts-prune output parser.
 * Fixtures are REAL ts-prune 0.10.3 output lines captured 2026-07-06 (Windows backslash paths).
 * Run: node scripts/check-dead-exports.test.mjs   (exit 0 = all pass, 1 = a case failed)
 */
import { parseTsPruneLine } from './check-dead-exports.mjs';

let pass = 0, fail = 0;
const check = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; } else { fail++; console.error(`  FAIL ${name}: got ${g}, want ${w}`); }
};

// Real dead-export line (leading backslash, Windows separators, no suffix).
check('dead-default', parseTsPruneLine('\\clients\\encore\\src\\reporter\\agent-reporter.ts:374 - default'),
  { file: 'clients/encore/src/reporter/agent-reporter.ts', line: 374, name: 'default', usedInModule: false });

// Real named dead export.
check('dead-named', parseTsPruneLine('\\clients\\encore\\src\\utils\\auth-storage.ts:142 - deleteState'),
  { file: 'clients/encore/src/utils/auth-storage.ts', line: 142, name: 'deleteState', usedInModule: false });

// Real "(used in module)" line → INFO, flagged usedInModule:true (gate must ignore it).
check('used-in-module', parseTsPruneLine('\\clients\\encore\\src\\selectors\\index.ts:82 - ALL_SELECTORS (used in module)'),
  { file: 'clients/encore/src/selectors/index.ts', line: 82, name: 'ALL_SELECTORS', usedInModule: true });

// Forward-slash variant (non-Windows ts-prune output) must parse identically.
check('forward-slash', parseTsPruneLine('clients/encore/src/types/index.ts:20 - IValidationFields'),
  { file: 'clients/encore/src/types/index.ts', line: 20, name: 'IValidationFields', usedInModule: false });

// Non-finding noise lines → null.
check('blank', parseTsPruneLine(''), null);
check('noise', parseTsPruneLine('npm warn exec The following package was not found...'), null);

console.log(`\ncheck-dead-exports.test: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
