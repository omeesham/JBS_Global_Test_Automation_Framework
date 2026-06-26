// Remediation engine — PLAN_ID_NAMING_AUDIT_AND_REMEDIATION (2026-06-11).
// Deterministic renames + cleanups per Gate rulings (A / 3-seg bugs / LI permanent / full hygiene).
// Run from repo root: node clients/encore/specs_planning/_internal/id-audit-2026-06-10/remediate.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ENC = path.join(ROOT, 'clients/encore');
const TC = path.join(ENC, 'specs_planning/test-cases/setup');
const TP = path.join(ENC, 'specs_planning/test-plans/setup');
const AUD = path.join(ENC, 'specs_planning/_internal/id-audit-2026-06-10');
const DRY = process.argv.includes('--dry');

const read = (f) => fs.readFileSync(f, 'utf8');
const write = (f, s) => { if (!DRY) fs.writeFileSync(f, s); };
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, '/');

// ── 1. Build the TC rename map ────────────────────────────────────────────────
const map = new Map(); // old -> new
const corpFiles = fs.readdirSync(path.join(TC, 'corporate-pricing')).filter(f => f.endsWith('.md'));
const BAND = [
  { lo: 1, hi: 99, sub: 'SRC' }, { lo: 100, hi: 199, sub: 'STR' }, { lo: 200, hi: 299, sub: 'DET' },
  { lo: 300, hi: 399, sub: 'NPB' }, { lo: 500, hi: 599, sub: 'OVR' }, { lo: 600, hi: 699, sub: 'TIO' },
];
const allCorpIds = new Set();
for (const f of corpFiles) {
  for (const m of read(path.join(TC, 'corporate-pricing', f)).matchAll(/^#{2,3}\s+(TC-LOC-CPR-(\d+)):/gm)) {
    allCorpIds.add(m[1]);
  }
}
for (const id of allCorpIds) {
  const n = parseInt(id.slice('TC-LOC-CPR-'.length), 10);
  const band = BAND.find(b => n >= b.lo && n <= b.hi);
  if (!band) throw new Error(`no band for ${id}`);
  const nn = String(n - (band.lo === 1 ? 0 : band.lo) + (band.lo === 1 ? 0 : 1)).padStart(3, '0');
  map.set(id, `TC-CPR-${band.sub}-${nn}`);
}
// LI: NE-011..047 -> LI-(n+67); SKIP-BILLING -> LI-070
const liMd = path.join(TC, 'locations', 'locations_local_information_test_cases.md');
for (const m of read(liMd).matchAll(/TC-LOC-LI-NE-(\d+)/g)) {
  const n = parseInt(m[1], 10);
  if (n >= 11 && n <= 47) map.set(`TC-LOC-LI-NE-${m[1]}`, `TC-LOC-LI-${String(n + 67).padStart(3, '0')}`);
}
map.set('TC-LOC-LI-SKIP-BILLING', 'TC-LOC-LI-070');

// BUG renames (live files only)
const bugMap = new Map([
  ['BUG-LOC-SHR-001', 'BUG-LOC-SSL-001'],
  ['BUG-CPR-001', 'BUG-CPR-OVR-001'],
  ['BUG-HIS-001', 'BUG-LOC-MGH-002'],
  ['BUG-HIS-002', 'BUG-LOC-MGH-003'],
]);

// ── 2. Global uniqueness assertion ───────────────────────────────────────────
const existing = new Set();
for (const dir of ['locations', 'local-office', 'corporate-pricing']) {
  for (const f of fs.readdirSync(path.join(TC, dir)).filter(f => f.endsWith('.md'))) {
    for (const m of read(path.join(TC, dir, f)).matchAll(/TC-[A-Z]+(?:-[A-Z]+){1,3}-(?:\d+[A-Z]?|[A-Z-]+)/g)) existing.add(m[0]);
  }
}
const newIds = new Set();
for (const [oldId, newId] of map) {
  if (newIds.has(newId)) throw new Error(`map not injective: ${newId}`);
  newIds.add(newId);
  if (existing.has(newId) && !map.has(newId)) throw new Error(`COLLISION: ${oldId} -> ${newId} already exists`);
}
console.log(`map: ${map.size} TC renames (${allCorpIds.size} CPR + ${map.size - allCorpIds.size} LI), ${bugMap.size} BUG renames — uniqueness OK`);

// ── 3. Replacement helper (longest-first, word-boundary-ish) ─────────────────
const sortedKeys = [...map.keys(), ...bugMap.keys()].sort((a, b) => b.length - a.length);
const lookup = (k) => map.get(k) ?? bugMap.get(k);
function applyRenames(text) {
  let count = 0;
  for (const k of sortedKeys) {
    // negative lookahead: don't match when followed by chars that extend the ID (digit/letter/dash+alnum)
    const re = new RegExp(k.replace(/[-]/g, '\\-') + String.raw`(?![A-Za-z0-9])`, 'g');
    text = text.replace(re, () => { count++; return lookup(k); });
  }
  return [text, count];
}

// ── 4. File sets ─────────────────────────────────────────────────────────────
const liSpec = path.join(ENC, 'tests/locations/location-local-information.spec.ts');
const renameTargets = [
  ...corpFiles.map(f => path.join(TC, 'corporate-pricing', f)),
  ...fs.readdirSync(path.join(ENC, 'tests/corporate-pricing')).filter(f => f.endsWith('.spec.ts')).map(f => path.join(ENC, 'tests/corporate-pricing', f)),
  ...fs.readdirSync(path.join(TP, 'corporate-pricing')).filter(f => f.endsWith('.md')).map(f => path.join(TP, 'corporate-pricing', f)),
  liMd, liSpec,
  path.join(TC, 'locations', 'locations_shared_setup_locations_test_cases.md'),
  path.join(ENC, 'tests/locations/location-shared-setup-locations.spec.ts'),
  path.join(ROOT, 'export_test_cases/blocked-reasons.json'),
  path.join(ROOT, '.claude/context/navigation.md'),
  path.join(TP, 'locations', 'locations_local_information_test_plan.md'),
];

// ── 5. Pre-rename cleanups in LI MD ──────────────────────────────────────────
{
  let s = read(liMd);
  const before = s.length;
  const dropDep = (s.match(/^\*\*Depends_On\*\*: TC-LOC-LI-NE-001\r?\n/gm) || []).length;
  s = s.replace(/^\*\*Depends_On\*\*: TC-LOC-LI-NE-001\r?\n/gm, '');
  const dropBlk = (s.match(/^Status: Blocked by ?\r?\n/gm) || []).length;
  s = s.replace(/^Status: Blocked by ?\r?\n/gm, '');
  write(liMd, s);
  console.log(`LI MD cleanup: dropped ${dropDep} dangling Depends_On + ${dropBlk} empty 'Status: Blocked by' lines (${before - s.length} chars)`);
}

// ── 6. Apply renames ─────────────────────────────────────────────────────────
let total = 0;
for (const f of renameTargets) {
  if (!fs.existsSync(f)) { console.log(`SKIP (missing): ${rel(f)}`); continue; }
  const [out, n] = applyRenames(read(f));
  if (n > 0) { write(f, out); total += n; console.log(`${String(n).padStart(4)}  ${rel(f)}`); }
}
console.log(`total replacements: ${total}`);

// ── 7. Stale-path fixes (MDs + test plans) ───────────────────────────────────
const pathFixes = [
  [/clients\/encore\/specs\/(locations|local-office|corporate-pricing)\//g, 'clients/encore/tests/$1/'],
  [/tests\/specs\/setup\/(locations|local-office|corporate-pricing)\//g, 'tests/$1/'],
  [/specs_planning\/test-cases\/(locations|local-office|corporate-pricing)\//g, 'specs_planning/test-cases/setup/$1/'],
  [/\.\.\/test-cases\/(locations|local-office|corporate-pricing)\//g, '../../test-cases/setup/$1/'],
  [/(?<!setup\/)test-cases\/(locations|local-office)\/(?=[a-z_]+\.md)/g, 'test-cases/setup/$1/'],
  [/local-information-test-cases\.md/g, 'locations_local_information_test_cases.md'],
];
let pathTotal = 0;
for (const dir of [path.join(TC, 'locations'), path.join(TC, 'local-office'), path.join(TC, 'corporate-pricing'), path.join(TP, 'locations'), path.join(TP, 'local-office'), path.join(TP, 'corporate-pricing')]) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const fp = path.join(dir, f);
    let s = read(fp); let n = 0;
    for (const [re, to] of pathFixes) s = s.replace(re, (...a) => { n++; return a[0].replace(re, to); });
    // simpler: re-run replace properly
    s = read(fp); n = 0;
    for (const [re, to] of pathFixes) { const before = s; s = s.replace(re, to); if (s !== before) n += (before.match(re) || []).length; }
    if (n > 0) { write(fp, s); pathTotal += n; console.log(`path ${String(n).padStart(3)}  ${rel(fp)}`); }
  }
}
console.log(`stale-path fixes: ${pathTotal}`);

// ── 8. @locations tag fix in local-office specs ──────────────────────────────
for (const f of fs.readdirSync(path.join(ENC, 'tests/local-office')).filter(f => f.endsWith('.spec.ts'))) {
  const fp = path.join(ENC, 'tests/local-office', f);
  let s = read(fp);
  const before = s;
  s = s.replace(/@locations @local-office/g, '@local-office @local-office');
  s = s.replace(/@local-office @local-office/g, '@local-office'); // collapse if doubled
  s = s.replace(/ @locations /g, ' @local-office ');
  if (s !== before) { write(fp, s); console.log(`tag fixed: ${rel(fp)}`); }
}

// ── 9. Rename bug JSON + inject formerIds ────────────────────────────────────
{
  const oldJson = path.join(ENC, 'reports/bugs/BUG-CPR-001.json');
  const newJson = path.join(ENC, 'reports/bugs/BUG-CPR-OVR-001.json');
  if (fs.existsSync(oldJson)) {
    const o = JSON.parse(read(oldJson).replace(/^﻿/, ''));
    o.formerIds = ['BUG-CPR-001'];
    if (o.id) o.id = 'BUG-CPR-OVR-001';
    if (!DRY) { fs.writeFileSync(newJson, JSON.stringify(o, null, 2) + '\n'); fs.unlinkSync(oldJson); }
    console.log('bug JSON renamed: BUG-CPR-001.json -> BUG-CPR-OVR-001.json (+formerIds)');
  }
}

// ── 10. Emit rename map artifacts ────────────────────────────────────────────
const mapObj = Object.fromEntries([...map.entries(), ...bugMap.entries()]);
if (!DRY) {
  fs.writeFileSync(path.join(AUD, 'id-rename-map.json'), JSON.stringify(mapObj, null, 1) + '\n');
  fs.writeFileSync(path.join(AUD, 'id-rename-map.csv'), 'old_id,new_id\n' + [...map.entries(), ...bugMap.entries()].map(([a, b]) => `${a},${b}`).join('\n') + '\n');
}
console.log(`rename map written (${Object.keys(mapObj).length} entries). DRY=${DRY}`);

// ── 11. Residue check (live dirs must be clean of old tokens) ────────────────
const residueDirs = [path.join(TC, 'corporate-pricing'), path.join(TP, 'corporate-pricing'), path.join(ENC, 'tests')];
let residue = 0;
for (const dir of residueDirs) {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of walk(dir).filter(f => /\.(md|ts)$/.test(f))) {
    const s = read(f);
    for (const tok of ['TC-LOC-CPR-', 'TC-LOC-LI-NE-', 'TC-LOC-LI-SKIP-BILLING', 'BUG-LOC-SHR-001', 'BUG-CPR-001']) {
      if (s.includes(tok)) { console.log(`RESIDUE: ${tok} in ${rel(f)}`); residue++; }
    }
  }
}
console.log(residue === 0 ? 'residue check: CLEAN' : `residue check: ${residue} HITS — FIX REQUIRED`);
