#!/usr/bin/env node
import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');
const MD_DIR = join(ROOT, 'clients', 'encore', 'specs_planning', 'test-cases', 'setup');
function walk(d, out = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    e.isDirectory() ? walk(p, out) : e.name.endsWith('_test_cases.md') && out.push(p);
  }
  return out.sort();
}
function norm(s) { return s.trim().replace(/\s+/g, ' '); }
function parseCells(line) {
  const t = line.trim();
  if (!t.startsWith('|')) return null;
  const safe = t.replace(/\\\|/g, '\x00'), parts = safe.split('|');
  const inner = parts.slice(1, t.endsWith('|') ? parts.length - 1 : parts.length);
  return inner.map(c => c.trim().replace(/\x00/g, '|'));
}
function isSep(c) { return c.length > 0 && c.every(x => /^[-: ]+$/.test(x)); }
function isStep(c) { return c.length > 0 && /^\d+$/.test(c[0]); }

let total = 0;
for (const fp of walk(MD_DIR)) {
  const lines = readFileSync(fp, 'utf8').split(/\r?\n/);
  const fn = relative(ROOT, fp).replace(/\\/g, '/');
  let cur = null, inS = false, cases = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], ln = i + 1;
    const hm = l.match(/^##\s+(TC-[A-Z0-9-]+):/);
    if (hm) { if (cur) cases.push(cur); cur = { id: hm[1], steps: [], exp: null }; inS = false; continue; }
    if (!cur) continue;
    if (/^\*\*Steps\*\*/.test(l)) { inS = true; continue; }
    const em = l.match(/^\*\*Expected\*\*:\s*(.+)/);
    if (em) { cur.exp = norm(em[1]); inS = false; continue; }
    if (inS) { const c = parseCells(l); if (c && !isSep(c) && isStep(c)) cur.steps.push({ ln, c }); }
  }
  if (cur) cases.push(cur);
  const hits = [];
  for (const c of cases) {
    if (!c.exp || c.steps.length <= 1) continue;
    for (const s of c.steps) {
      if (s.c.length >= 3 && norm(s.c[2]) === c.exp)
        hits.push({ caseId: c.id, stepNum: s.c[0], stepText: s.c[1], leaked: s.c[2], ln: s.ln, total: c.steps.length, exp: c.exp });
    }
  }
  if (hits.length) {
    console.log(`\n=== ${fn.split('/').pop()} (${hits.length} hits) ===`);
    for (const h of hits)
      console.log(`  L${h.ln} ${h.caseId} step${h.stepNum}/${h.total}\n    STEP: ${h.stepText}\n    LEAKED: ${h.leaked}`);
    total += hits.length;
  }
}
console.log(`\nTOTAL C5 HITS: ${total}`);
