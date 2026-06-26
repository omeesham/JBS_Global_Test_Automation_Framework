// Fix the band-rename off-by-one (caught by guardrail G6g on first run):
// TC-CPR-{STR,DET,NPB,OVR,TIO}-NNN -> NNN-1, single-pass atomic replace.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ENC = path.join(ROOT, 'clients/encore');
const AUD = path.join(ENC, 'specs_planning/_internal/id-audit-2026-06-10');
const files = [];
for (const d of [
  path.join(ENC, 'specs_planning/test-cases/setup/corporate-pricing'),
  path.join(ENC, 'specs_planning/test-plans/setup/corporate-pricing'),
  path.join(ENC, 'tests/corporate-pricing'),
]) for (const f of fs.readdirSync(d)) if (/\.(md|ts)$/.test(f)) files.push(path.join(d, f));
files.push(path.join(ROOT, 'export_test_cases/blocked-reasons.json'));
files.push(path.join(ROOT, '.claude/context/navigation.md'));

const RE = /TC-CPR-(STR|DET|NPB|OVR|TIO)-(\d{3})/g;
let total = 0;
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  let n = 0;
  const out = s.replace(RE, (m, sub, num) => { n++; return `TC-CPR-${sub}-${String(parseInt(num, 10) - 1).padStart(3, '0')}`; });
  if (n > 0) { fs.writeFileSync(f, out); total += n; console.log(`${String(n).padStart(4)}  ${path.relative(ROOT, f)}`); }
}
console.log('decremented refs:', total);

// Regenerate the rename map with the corrected formula
const map = JSON.parse(fs.readFileSync(path.join(AUD, 'id-rename-map.json'), 'utf8'));
const fixed = {};
for (const [oldId, newId] of Object.entries(map)) {
  const m = newId.match(/^TC-CPR-(STR|DET|NPB|OVR|TIO)-(\d{3})$/);
  fixed[oldId] = m ? `TC-CPR-${m[1]}-${String(parseInt(m[2], 10) - 1).padStart(3, '0')}` : newId;
}
fs.writeFileSync(path.join(AUD, 'id-rename-map.json'), JSON.stringify(fixed, null, 1) + '\n');
fs.writeFileSync(path.join(AUD, 'id-rename-map.csv'), 'old_id,new_id\n' + Object.entries(fixed).map(([a, b]) => `${a},${b}`).join('\n') + '\n');
// sanity: every family must now start at 001
const starts = {};
for (const v of Object.values(fixed)) { const m = v.match(/^TC-CPR-([A-Z]{3})-(\d{3})$/); if (m) { starts[m[1]] = Math.min(starts[m[1]] ?? 999, parseInt(m[2], 10)); } }
console.log('family starts:', JSON.stringify(starts));
