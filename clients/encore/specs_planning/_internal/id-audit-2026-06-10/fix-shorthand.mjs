// Fix bare band-number shorthands in corp MDs/test plans left by the full-ID rename:
//   `TC-111` -> `TC-CPR-STR-011`; slash-lists `TC-CPR-NPB-002/315/323` -> `/015/023`;
//   ranges `TC-CPR-STR-002..107` -> `..007`. Only 3-digit values >=100 are band-encoded
//   (unambiguous); values <100 are already-correct Search/new numbers and stay.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BANDS = [[100, 'STR'], [200, 'DET'], [300, 'NPB'], [500, 'OVR'], [600, 'TIO']];
const bandOf = (n) => BANDS.find(([lo]) => n >= lo && n <= lo + 99);

const files = [];
for (const d of [
  'clients/encore/specs_planning/test-cases/setup/corporate-pricing',
  'clients/encore/specs_planning/test-plans/setup/corporate-pricing',
]) for (const f of fs.readdirSync(path.join(ROOT, d))) if (f.endsWith('.md')) files.push(path.join(ROOT, d, f));

let total = 0;
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  let n = 0;
  // bare `TC-NNN` with NNN>=100 -> full new ID
  s = s.replace(/\bTC-([1-6]\d{2})\b(?!-)/g, (m, d) => {
    const num = parseInt(d, 10); const band = bandOf(num);
    if (!band) return m;
    n++; return `TC-CPR-${band[1]}-${String(num - band[0]).padStart(3, '0')}`;
  });
  // slash-list or range tails after a TC id: /NNN or ..NNN with NNN>=100 -> new 0NN
  for (let pass = 0; pass < 6; pass++) {
    const before = s;
    s = s.replace(/(TC-CPR-[A-Z]{3}-\d{3}(?:[/]\d{3}|\.\.\d{3})*)([/]|\.\.)([1-6]\d{2})\b/g, (m, head, sep, d) => {
      const num = parseInt(d, 10); const band = bandOf(num);
      if (!band) return m;
      n++; return `${head}${sep}${String(num - band[0]).padStart(3, '0')}`;
    });
    if (s === before) break;
  }
  if (n > 0) { fs.writeFileSync(f, s); total += n; console.log(`${String(n).padStart(4)}  ${path.relative(ROOT, f)}`); }
}
console.log('shorthand fixes:', total);
// residue: any 3-digit >=100 still following TC- markers in corp files
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/TC-CPR-[A-Z]{3}-\d{3}(?:[/.]+[1-6]\d{2})+|\bTC-[1-6]\d{2}\b/g)) console.log(`RESIDUE in ${path.basename(f)}: ${m[0]}`);
}
