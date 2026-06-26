// One-off: persist workflow findings + print compact synthesis table (id-audit 2026-06-10).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = process.argv[2];
const txt = fs.readFileSync(src, 'utf8').replace(/^﻿/, '');
const wrapper = JSON.parse(txt);
const data = wrapper.result ?? wrapper.returnValue ?? wrapper;
if (!data || !data.merged) { console.error('keys: ' + Object.keys(wrapper).join(',')); process.exit(1); }
fs.writeFileSync(path.join(here, 'findings-merged.json'), JSON.stringify(data, null, 1));
console.log('rawCount=' + data.rawCount + ' merged=' + data.merged.length);
for (const m of data.merged) {
  const obs = (m.observed || '').replace(/\s+/g, ' ').slice(0, 220);
  console.log(`\n[${m.key}] n=${m.member_count} sev=${m.severity_claim} finders=${(m.finders||[]).join(',')}`);
  console.log(`  obs: ${obs}`);
}
