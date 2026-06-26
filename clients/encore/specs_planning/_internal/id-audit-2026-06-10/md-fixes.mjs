// MD-level hygiene batch (PC-12 + LI short-refs) — PLAN_ID_NAMING_AUDIT_AND_REMEDIATION 2026-06-11.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TC = path.join(ROOT, 'clients/encore/specs_planning/test-cases/setup');
const r = (f) => fs.readFileSync(f, 'utf8');
const w = (f, s) => fs.writeFileSync(f, s);
const log = console.log;

// 1. LI MD: short NE-### refs -> folded LI numbers (+67); add numbering note; add Module line
{
  const f = path.join(TC, 'locations/locations_local_information_test_cases.md');
  let s = r(f);
  let n = 0;
  s = s.replace(/(?<!TC-LOC-LI-)\bNE-(\d{2,3})\b/g, (m, d) => {
    const num = parseInt(d, 10);
    if (num < 11 || num > 47) return m;
    n++;
    return `LI-${String(num + 67).padStart(3, '0')}`;
  });
  const note = '**Numbering note (2026-06-11)**: the former neutral-eye sub-series TC-LOC-LI-NE-011..047 was folded into the numeric sequence as TC-LOC-LI-078..114 (offset +67), and TC-LOC-LI-SKIP-BILLING was renamed back to TC-LOC-LI-070 (the slot it physically occupies). Letter-suffixed IDs (008A, 024A) are the registered insertion mechanism (module-codes.json). Gaps 049/050/056 = removed cases (see in-file notes).';
  if (!s.includes('**Numbering note (2026-06-11)**')) {
    s = s.replace(/^(# .+\r?\n)/, `$1\n**Module**: locations\n\n${note}\n`);
  }
  w(f, s);
  log(`LI MD: ${n} short NE- refs mapped, numbering note + Module line added`);
}

// 2. PRI Total 35 -> 34
{
  const f = path.join(TC, 'locations/locations_pricing_test_cases.md');
  let s = r(f);
  const before = s;
  s = s.replace('**Module**: locations | **Total**: 35 |', '**Module**: locations | **Total**: 34 |');
  w(f, s);
  log(`PRI Total fixed: ${s !== before}`);
}

// 3. LP duplicate 'Automated' column header -> 'Deferred'
{
  const f = path.join(TC, 'locations/locations_left_panel_basic_information_test_cases.md');
  let s = r(f);
  const before = s;
  s = s.replace('| Module | Test Cases | Automated | Automated | Out of Scope | Updated |',
                '| Module | Test Cases | Automated | Deferred | Out of Scope | Updated |');
  w(f, s);
  log(`LP duplicate column header fixed: ${s !== before}`);
}

// 4. BAS '****' scrub damage: 1267 -> **NM-1264** (documented Delivery>=Prep validation, LR-008);
//    1213/1248 trailing '| ****' = unrecoverable scrub debris -> strip the dangling tail.
{
  const f = path.join(TC, 'local-office/local_office_settings_test_cases.md');
  let s = r(f);
  let fixes = 0;
  if (s.includes('proved only **** (Delivery >= Prep)')) { s = s.replace('proved only **** (Delivery >= Prep)', 'proved only **NM-1264** (Delivery >= Prep)'); fixes++; }
  const before = s;
  s = s.replace(/ \| \*\*\*\*(\r?\n)/g, '$1');
  if (s !== before) fixes += 2;
  w(f, s);
  log(`BAS scrub-damage fixes applied: ${fixes}`);
}

// 5. Ensure every test-cases MD declares '**Module**:' (canonical line under the H1)
const MODULE_BY_DIR = { 'locations': 'locations', 'local-office': 'local-office', 'corporate-pricing': 'corporate-pricing' };
let added = 0;
for (const dir of Object.keys(MODULE_BY_DIR)) {
  for (const fn of fs.readdirSync(path.join(TC, dir)).filter(x => x.endsWith('.md'))) {
    const f = path.join(TC, dir, fn);
    let s = r(f);
    if (/^\*\*Module\*\*:/m.test(s)) continue;
    s = s.replace(/^(# .+\r?\n)/, `$1\n**Module**: ${MODULE_BY_DIR[dir]}\n`);
    if (!/^\*\*Module\*\*:/m.test(s)) { log(`WARN: could not insert Module line in ${fn} (no H1?)`); continue; }
    w(f, s);
    added++;
  }
}
log(`Module lines added: ${added}`);

// 6. Delete the approved temp TestRail corp xlsx
{
  const f = path.join(ROOT, 'clients/encore/test_cases_xlsx/encore_test_cases_testrail_corp_pricing.xlsx');
  if (fs.existsSync(f)) { fs.unlinkSync(f); log('temp xlsx deleted'); } else log('temp xlsx already absent');
}
