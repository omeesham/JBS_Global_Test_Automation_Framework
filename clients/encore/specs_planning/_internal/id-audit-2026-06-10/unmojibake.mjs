// Reverse the cp1252-decode→utf8-encode corruption applied by PowerShell Set-Content (2026-06-11 incident).
// current = utf8encode(cp1252decode(original_utf8_bytes)) → original = utf8decode(cp1252encode(current))
import fs from 'node:fs';

// Windows-1252: chars whose codepoint differs from their byte value (0x80-0x9F specials)
const CP1252 = {
  0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86,
  0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
  0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95,
  0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
  0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F,
};

for (const f of process.argv.slice(2)) {
  const s = fs.readFileSync(f, 'utf8').replace(/^﻿/, '');
  const bytes = [];
  let ok = true;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp <= 0xFF) bytes.push(cp);
    else if (CP1252[cp] !== undefined) bytes.push(CP1252[cp]);
    else { console.error(`unmappable U+${cp.toString(16)} in ${f} — char '${ch}'`); ok = false; }
  }
  if (!ok) { console.error(`SKIP ${f}`); continue; }
  const restored = Buffer.from(bytes).toString('utf8');
  if (/�/.test(restored)) { console.error(`replacement chars after restore — SKIP ${f}`); continue; }
  fs.writeFileSync(f, restored);
  console.log(`restored ${f}: mojibake=${/â†|Ã©|â€/.test(restored)} arrows=${(restored.match(/→/g) || []).length}`);
}
