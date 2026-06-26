// Test-plan truth-sync (PC-6) — PLAN_ID_NAMING_AUDIT_AND_REMEDIATION 2026-06-11.
// Strategy: fix header Totals to current MD counts, fix self-referencing sibling lists,
// flag pre-grammar scenario refs, and append a regenerated Coverage Index to every plan
// (mechanical truth from MD headers — no invented content).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TC = path.join(ROOT, 'clients/encore/specs_planning/test-cases/setup');
const TP = path.join(ROOT, 'clients/encore/specs_planning/test-plans/setup');
const r = (f) => fs.readFileSync(f, 'utf8');
const w = (f, s) => fs.writeFileSync(f, s);

// 0. Delete orphan duplicate plan
{
  const orphan = path.join(TP, 'locations/locations_left_panel_test_plan.md');
  if (fs.existsSync(orphan)) { fs.unlinkSync(orphan); console.log('orphan plan deleted: locations_left_panel_test_plan.md'); }
}

// 1. Build MD index: basename -> [{id,title}]
const mdIndex = new Map();
for (const dir of ['locations', 'local-office', 'corporate-pricing']) {
  for (const fn of fs.readdirSync(path.join(TC, dir)).filter(x => x.endsWith('.md'))) {
    const cases = [];
    for (const m of r(path.join(TC, dir, fn)).matchAll(/^#{2,3}\s+(TC-[A-Z]+(?:-[A-Z]+){1,3}-(?:\d+[A-Z]?|[A-Z]+)):\s*(.+)$/gm)) {
      cases.push({ id: m[1], title: m[2].trim() });
    }
    mdIndex.set(fn.replace('_test_cases.md', ''), { dir, cases });
  }
}

// 2. Targeted line fixes
const fixes = [
  ['locations/locations_local_information_test_plan.md',
    ['**Test Cases**: 63 requirement-aligned scenarios (TC-LOC-LI-001 to TC-LOC-LI-066, with TC-049/050/056 removed)',
     '**Test Cases**: 114 cases (TC-LOC-LI-001 to TC-LOC-LI-114 incl. insertion-suffixed 008A/024A; gaps 049/050/056 = removed cases; 070 restored and 078-114 folded from the former NE sub-series on 2026-06-11). Scenario prose below predates part of the current set — the authoritative list is the Coverage Index at the end of this file.'],
    ['**63 Granular Test Cases Created** (see `specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md`):',
     '**Granular test cases** (114 current — see the Coverage Index at the end of this file and `specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md`):']],
  ['local-office/local_office_ect_test_plan.md',
    ['Sibling test plans: [HIS](local_office_history_test_plan.md), [ECT](local_office_ect_test_plan.md).',
     'Sibling test plans: [BAS](local_office_settings_test_plan.md), [HIS](local_office_history_test_plan.md).']],
  ['local-office/local_office_history_test_plan.md',
    ['Sibling test plans: [HIS](local_office_history_test_plan.md), [ECT](local_office_ect_test_plan.md).',
     'Sibling test plans: [BAS](local_office_settings_test_plan.md), [ECT](local_office_ect_test_plan.md).']],
  ['local-office/local_office_settings_test_plan.md',
    ['(Additional TC-LOS-BAS-* entries 040-068 are gap-fill / round-trip / boundary scenarios — see test cases file.)',
     '(Additional TC-LOS-BAS-* entries 040-068 are gap-fill / round-trip / boundary scenarios — see test cases file. Numbering has documented gaps: 042/043/046/052/057/058/059/060 — dispositions recorded in the test-cases file table.)']],
];
for (const [rel, ...pairs] of fixes) {
  const f = path.join(TP, rel);
  let s = r(f); let n = 0;
  for (const [from, to] of pairs) { if (s.includes(from)) { s = s.replace(from, to); n++; } else console.log(`WARN miss in ${rel}: ${from.slice(0, 60)}...`); }
  w(f, s); console.log(`${rel}: ${n} targeted fixes`);
}

// 3. Header Totals -> current MD counts (any plan with a '**Total**: N' token)
for (const dir of ['locations', 'local-office', 'corporate-pricing']) {
  const tpDir = path.join(TP, dir);
  if (!fs.existsSync(tpDir)) continue;
  for (const fn of fs.readdirSync(tpDir).filter(x => x.endsWith('_test_plan.md'))) {
    const key = fn.replace('_test_plan.md', '');
    const md = mdIndex.get(key);
    if (!md) { console.log(`NO MD PAIR: ${fn}`); continue; }
    const f = path.join(tpDir, fn);
    let s = r(f);
    const m = s.match(/\*\*Total\*\*: (\d+)/);
    if (m && parseInt(m[1], 10) !== md.cases.length) {
      s = s.replace(/\*\*Total\*\*: \d+/, `**Total**: ${md.cases.length}`);
      console.log(`${fn}: Total ${m[1]} -> ${md.cases.length}`);
    }
    w(f, s);
  }
}

// 4. Append/replace regenerated Coverage Index in every paired plan
const STAMP = '## Coverage Index (regenerated 2026-06-11 from the test-cases file)';
for (const dir of ['locations', 'local-office', 'corporate-pricing']) {
  const tpDir = path.join(TP, dir);
  if (!fs.existsSync(tpDir)) continue;
  for (const fn of fs.readdirSync(tpDir).filter(x => x.endsWith('_test_plan.md'))) {
    const key = fn.replace('_test_plan.md', '');
    const md = mdIndex.get(key);
    if (!md) continue;
    const f = path.join(tpDir, fn);
    let s = r(f);
    s = s.replace(new RegExp(`\\n## Coverage Index \\(regenerated [^)]*\\)[\\s\\S]*$`), '\n');
    const index = [STAMP, '', `Authoritative current case list (${md.cases.length} cases). Scenario prose above may lag; this index is mechanically regenerated.`, '',
      ...md.cases.map(c => `- ${c.id} — ${c.title}`)].join('\n');
    s = s.trimEnd() + '\n\n' + index + '\n';
    w(f, s);
  }
  console.log(`coverage indexes regenerated in ${dir}`);
}
console.log('done');
