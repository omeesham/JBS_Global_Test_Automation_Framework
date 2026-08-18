#!/usr/bin/env node
/**
 * validate-tcs.mjs — unwired helper intended to check that a --tcs selector is accepted by
 * BOTH spec-trim and xlsx-trim parsers and that they produce identical ID sets.
 *
 * Not wired into ship-branch.sh. Do not treat this as delivery-path
 * protection unless a future change explicitly wires and verifies it.
 *
 * Exit 0 = both parsers agree.  Exit 1 = mismatch or parse error.
 *
 * INTERNAL TOOLING — NEVER ships.
 */
import { parseSelector } from './spec-trim.mjs';
import { parseTcSelector } from './xlsx-trim.mjs';

const selector = process.argv[2];
if (!selector) {
  console.error('[validate-tcs] usage: node scripts/validate-tcs.mjs <selector>');
  process.exit(1);
}

let specIds, xlsxIds;
try {
  specIds = parseSelector(selector);
} catch (err) {
  console.error(`[validate-tcs] spec-trim parser rejects selector: ${err.message}`);
  process.exit(1);
}
try {
  xlsxIds = parseTcSelector(selector);
} catch (err) {
  console.error(`[validate-tcs] xlsx-trim parser rejects selector: ${err.message}`);
  process.exit(1);
}

const specSorted = [...specIds].sort();
const xlsxSorted = [...xlsxIds].sort();

if (specSorted.length !== xlsxSorted.length || specSorted.some((id, i) => id !== xlsxSorted[i])) {
  console.error('[validate-tcs] MISMATCH — parsers disagree on the TC ID set:');
  console.error(`  spec-trim: ${specSorted.length} IDs`);
  console.error(`  xlsx-trim: ${xlsxSorted.length} IDs`);
  const specOnly = specSorted.filter(id => !xlsxIds.has(id));
  const xlsxOnly = xlsxSorted.filter(id => !specIds.has(id));
  if (specOnly.length) console.error(`  spec-trim only: ${specOnly.join(', ')}`);
  if (xlsxOnly.length) console.error(`  xlsx-trim only: ${xlsxOnly.join(', ')}`);
  process.exit(1);
}

console.log(`[validate-tcs] OK — both parsers agree on ${specSorted.length} TC ID(s)`);
