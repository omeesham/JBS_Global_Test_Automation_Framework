// V13 — negative-test guardrail C8 against the PRE-fix workbook (extracted from git HEAD).
import { lintWorkbook } from '../../../../../scripts/xlsx-lint-rules.mjs';

const target = process.argv[2];
const r = lintWorkbook(target);
const c8 = r.integrityViolations.filter(v => v.code === 'C8');
console.log('C8 violations on PRE-fix workbook:', c8.length);
for (const v of c8.slice(0, 6)) console.log('  [' + v.sheet + '/' + v.tcId + '] ' + v.detail);
console.log('verdict:', c8.length > 0 ? 'GUARD CATCHES THE OLD DEFECT — V13 PASS' : 'V13 FAIL — guard blind');
process.exit(0);
