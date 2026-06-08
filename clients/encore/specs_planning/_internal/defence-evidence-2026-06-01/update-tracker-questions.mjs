// One-off: fold the user's 2026-06-01 session input into encore-qa-tracker.csv.
// NO ASSUMPTIONS — only records what the user explicitly stated. Existing bug rows
// are untouched except a dated re-observation note on BUG-LOC-BI-001 (user said its
// behaviour changed). Adds a "Status / disposition" value to each question row + an
// F7 verification-protocol finding. Structural asserts abort on any mismatch.
import fs from 'fs';

const P = 'clients/encore/exports/encore-qa-tracker.csv';

function parseCsvLine(line) {
  const f = []; let i = 0;
  while (i < line.length) {
    if (line[i] !== '"') { i++; continue; }
    i++; let s = '';
    while (i < line.length) {
      if (line[i] === '"') {
        if (line[i + 1] === '"') { s += '"'; i += 2; continue; }
        i++; break;
      }
      s += line[i]; i++;
    }
    f.push(s);
    if (line[i] === ',') i++;
  }
  return f;
}
const toCsvLine = (f) => f.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(',');

const DISPOSITION = {
  'Q1': 'ANSWERED — close. Intentional: per user 2026-06-01 the Ok button is now the confirm label on ALL save dialogs app-wide, not just Notes.',
  'Q2': 'VERIFY on e2e + nav2 (user flagged 2026-06-01).',
  'Q3': 'VERIFY on e2e + nav2 (user 2026-06-01).',
  'Q4': 'VERIFY on e2e + nav2 — per user 2026-06-01, Use Equipment QC becomes checkable only when the Use Fulfillment checkbox is ON; verify with Use Fulfillment ON.',
  'Q5': 'VERIFY nav2 baseline FIRST — per user 2026-06-01 nothing like this shows on e2e; confirm what the column is on baseline before judging.',
  'Q6': 'PREMISE UNCONFIRMED — per user 2026-06-01 there is NO Notes field in Local Office Basic Info; confirm on nav2 baseline before treating as a valid question.',
  'Q7': 'RECLASSIFIED to BUG (report) — per user 2026-06-01 the bad URL currently tries to LOAD the page AND shows an error message; see BUG-LOC-BI-001 (may differ from the filed silent-redirect behaviour — re-verify).',
  'Q8': 'RECLASSIFIED to BUG (report) — confirmed by user 2026-06-01; see BUG-LOS-ECT-001.',
  'Q9': 'ASK Encore — keep as a question; also verify presence/absence in Location Management History on e2e + nav2 (user 2026-06-01).',
  'Q-NEW-1': 'POTENTIAL BUG + baseline check — per user 2026-06-01 clearing the field leaves it empty on e2e; ask Encore and confirm old-site coercion on nav2.',
  'Q-NEW-2': 'POTENTIAL BUG — ask Encore (user 2026-06-01).',
};
const BI001_NOTE = ' || 2026-06-01 user re-observation: the page currently TRIES TO LOAD the route AND shows an error message — this may differ from the originally-filed silent-redirect-to-/home (no-error) behaviour; re-verify current behaviour on e2e + nav2.';

const raw = fs.readFileSync(P, 'utf8');
const lines = raw.split(/\r?\n/);
while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

let qHeaderHits = 0, sepHits = 0, bi001Hits = 0;
const seenQ = new Set();
const out = lines.map((line) => {
  if (line.trim() === '') return line;
  const f = parseCsvLine(line);
  if (f.length < 5) return line;
  // questions separator: fix stale count 10 -> 11
  if (f[0].includes('QUESTIONS FOR ENCORE')) { sepHits++; f[0] = f[0].replace('10 items', '11 items'); return toCsvLine(f); }
  // questions sub-header: label column 5
  if (f[1] === 'Question') { qHeaderHits++; f[4] = 'Status / disposition (user 2026-06-01)'; return toCsvLine(f); }
  // each question row: set disposition in column 5
  if (Object.prototype.hasOwnProperty.call(DISPOSITION, f[0])) { seenQ.add(f[0]); f[4] = DISPOSITION[f[0]]; return toCsvLine(f); }
  // BI-001 bug row: append dated re-observation to Notes (col 7 = index 6)
  if (f[5] === 'BUG-LOC-BI-001') { bi001Hits++; f[6] = (f[6] || '') + BI001_NOTE; return toCsvLine(f); }
  return line;
});

// Append F7 verification-protocol finding (findings schema: #,Item,Detail,Status,Reference,,)
out.push(toCsvLine(['F7', 'Verification protocol (user 2026-06-01)',
  'Every open item is verified on BOTH e2e (live) AND nav2 (baseline); the baseline is confirmed even if its behaviour has changed/expired. This session reconciliation: 20 unique items need both-site verification = 40 checks — 11 bugs + 3 potential bugs + 6 questions. Excluded: Q1 (resolved — Ok button intentional app-wide) and BUG-LS-001 (nav2 has no data-testids, nothing to compare).',
  'plan', 'this session', '', '']));

// ---- asserts (no-assumption safeguards) ----
const missing = Object.keys(DISPOSITION).filter((q) => !seenQ.has(q));
if (qHeaderHits !== 1) throw new Error('expected exactly 1 questions sub-header, got ' + qHeaderHits);
if (sepHits !== 1) throw new Error('expected exactly 1 questions separator, got ' + sepHits);
if (bi001Hits !== 1) throw new Error('expected exactly 1 BUG-LOC-BI-001 row, got ' + bi001Hits);
if (missing.length) throw new Error('question rows not found: ' + missing.join(', '));

fs.writeFileSync(P, out.join('\n') + '\n', 'utf8');
console.log('OK — questions updated:', seenQ.size, '| sep fixed:', sepHits, '| BI-001 noted:', bi001Hits, '| total rows:', out.length);
