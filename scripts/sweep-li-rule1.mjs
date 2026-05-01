#!/usr/bin/env node
import fs from 'node:fs';

const path = 'clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md';
let t = fs.readFileSync(path, 'utf8');
const orig = t;

t = t.split('| ✅ Automated |').join('| Automated |');
t = t.split(' ✓ ').join(' — ');
t = t.replace(/ ✓\n/g, '\n');
t = t.split('✓').join('');
t = t.split('⚠️ ').join('');
t = t.split('⚠️').join('');
t = t.split('parent→children').join('parent-to-children');
t = t.split(' → ').join(' to ');
t = t.split('→').join(' to ');
for (const ch of ['✔','✗','✘','❌','⇒','▶','►','ℹ️','❗','✅']) t = t.split(ch).join('');
t = t.replace(/ {2,}/g, ' ');
t = t.replace(/ +\n/g, '\n');

if (t !== orig) {
  fs.writeFileSync(path, t, 'utf8');
  console.log('WROTE', path);
} else {
  console.log('NO CHANGE');
}
