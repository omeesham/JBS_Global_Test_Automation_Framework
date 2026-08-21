// TICKET tcr-matcher — single-use matcher script
// Place: .claude/state/tc-restructure/ (never in repo scripts/)

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ExcelJS = require('exceljs');

const REPO = 'C:/Users/RutvikKhorasiya/projects/encore_framework';
const MD_DIR = path.join(REPO, 'clients/encore/specs_planning/test-cases/setup');
const REF_DIR = path.join(REPO, '.claude/state/ua-worker/chips/tc-restructure/out-review-bc/fresh');
const OUT_DIR = path.join(REPO, '.claude/state/tc-restructure');

// Normalisation exactly per ticket spec
function normalise(s) {
  if (!s) return '';
  let t = String(s).trim();
  t = t.replace(/\s+/g, ' ');            // collapse internal whitespace
  t = t.replace(/`/g, '');              // strip backticks
  t = t.replace(/[\u2013\u2014]/g, '-'); // en-dash, em-dash → -
  t = t.replace(/\u2018|\u2019/g, "'");  // curly single → '
  t = t.replace(/\u201C|\u201D/g, '"');  // curly double → "
  t = t.replace(/\.$/, '');             // drop single trailing period
  return t.toLowerCase();
}

// Strip leading "N. " or "N) " step number prefix from xlsx step text
function stripStepNum(s) {
  return s.replace(/^\d+[.)]\s*/, '').trim();
}

// Parse *_test_cases.md → Map<tcId, {steps: string[], module, file}>
function parseMarkdown(mdFile) {
  const content = fs.readFileSync(mdFile, 'utf8');
  const lines = content.split('\n');
  const cases = new Map();

  let curTC = null;
  let inTable = false;
  let pastSeparator = false;

  for (const line of lines) {
    // TC heading: ## TC-ABC-XYZ-001:
    const tcMatch = line.match(/^## (TC-[A-Z0-9]+-[A-Z0-9]+-\d+):/);
    if (tcMatch) {
      curTC = tcMatch[1];
      inTable = false;
      pastSeparator = false;
      if (!cases.has(curTC)) cases.set(curTC, { steps: [] });
      continue;
    }
    if (!curTC) continue;

    // Step table header: | # | Step | Expected Result |
    if (/^\|\s*#\s*\|\s*Step/i.test(line)) {
      inTable = true;
      pastSeparator = false;
      continue;
    }
    if (inTable && !pastSeparator && /^\|[-|: ]+\|/.test(line)) {
      pastSeparator = true;
      continue;
    }
    if (inTable && pastSeparator) {
      if (!line.startsWith('|')) { inTable = false; continue; }
      // Split on | — cols: ['', '#', 'Step text', 'Expected', '']
      const cols = line.split('|');
      if (cols.length >= 4) {
        const stepText = cols[2].trim();
        if (stepText && !/^[-: ]+$/.test(stepText)) {
          cases.get(curTC).steps.push(stepText);
        }
      }
    }
  }
  return cases;
}

// Recursively collect all *_test_cases.md files
function collectMdFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectMdFiles(full));
    else if (entry.name.endsWith('_test_cases.md')) result.push(full);
  }
  return result;
}

// Parse reference xlsx → Map<tcId, string[]> (raw step texts, stripped of "N. " prefix)
async function parseRefXlsx(xlsxPath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xlsxPath);
  const ref = new Map();

  wb.eachSheet((ws) => {
    if (ws.name === 'Overview') return;
    let curId = null;
    ws.eachRow((row, rowNum) => {
      if (rowNum === 1) return; // skip header
      const c1 = String(row.getCell(1).value || '').trim();
      const c11 = String(row.getCell(11).value || '').trim();
      if (c1 && c1 !== 'SUMMARY') {
        curId = c1;
        if (!ref.has(curId)) ref.set(curId, []);
      }
      if (curId && c11) {
        ref.get(curId).push(stripStepNum(c11));
      }
    });
  });
  return ref;
}

async function main() {
  // 1. Parse all markdown
  const mdFiles = collectMdFiles(MD_DIR);
  const ourCases = new Map(); // tcId → {steps, module, file}
  const moduleFileMap = new Map(); // module → file
  for (const f of mdFiles) {
    const modName = path.basename(f, '_test_cases.md');
    const cases = parseMarkdown(f);
    for (const [tcId, data] of cases) {
      ourCases.set(tcId, { ...data, module: modName, file: f });
    }
    moduleFileMap.set(modName, f);
  }

  // 2. Load all reference xlsx (skip consolidated)
  const refCases = new Map();
  const refFiles = fs.readdirSync(REF_DIR).filter(
    f => f.endsWith('.xlsx') && f !== 'testcases__encore_test_cases.xlsx'
  );
  for (const f of refFiles) {
    const partial = await parseRefXlsx(path.join(REF_DIR, f));
    for (const [tcId, steps] of partial) refCases.set(tcId, steps);
  }

  // 3. Classify
  const buckets = {
    ALIGNED: [],
    TEXT_MISMATCH: [],
    COUNT_MISMATCH: [],
    MISSING_IN_REF: []
  };
  const modStats = new Map();

  for (const [tcId, data] of ourCases) {
    const mod = data.module;
    if (!modStats.has(mod)) modStats.set(mod, { ALIGNED:0, TEXT_MISMATCH:0, COUNT_MISMATCH:0, MISSING_IN_REF:0, total:0 });
    modStats.get(mod).total++;

    const refSteps = refCases.get(tcId);
    if (!refSteps || refSteps.length === 0) {
      buckets.MISSING_IN_REF.push({ tcId, module: mod });
      modStats.get(mod).MISSING_IN_REF++;
      continue;
    }
    const ourSteps = data.steps;
    if (ourSteps.length !== refSteps.length) {
      buckets.COUNT_MISMATCH.push({ tcId, module: mod, ourCount: ourSteps.length, refCount: refSteps.length, ourSteps, refSteps });
      modStats.get(mod).COUNT_MISMATCH++;
      continue;
    }
    // Same count — compare normalised
    const diffs = [];
    for (let i = 0; i < ourSteps.length; i++) {
      if (normalise(ourSteps[i]) !== normalise(refSteps[i])) {
        diffs.push({ idx: i + 1, ours: ourSteps[i], theirs: refSteps[i] });
      }
    }
    if (diffs.length === 0) {
      buckets.ALIGNED.push({ tcId, module: mod });
      modStats.get(mod).ALIGNED++;
    } else {
      buckets.TEXT_MISMATCH.push({ tcId, module: mod, diffs, ourSteps, refSteps });
      modStats.get(mod).TEXT_MISMATCH++;
    }
  }

  // 4. Save full JSON output
  fs.writeFileSync(
    path.join(OUT_DIR, 'match-results.json'),
    JSON.stringify({ ourCount: ourCases.size, refCount: refCases.size, buckets, moduleStats: Object.fromEntries(modStats) }, null, 2)
  );

  // 5. Print summary
  const total = ourCases.size;
  const sum = buckets.ALIGNED.length + buckets.TEXT_MISMATCH.length + buckets.COUNT_MISMATCH.length + buckets.MISSING_IN_REF.length;

  console.log('=== DENOMINATOR ===');
  console.log(`Total TCs in markdown (machine-counted by ## TC- headings): ${total}`);
  console.log(`Ref TCs loaded: ${refCases.size}`);
  console.log(`Bucket sum: ${sum} (should equal ${total})`);

  console.log('\n=== BUCKET TOTALS ===');
  console.log(`ALIGNED:       ${buckets.ALIGNED.length}`);
  console.log(`TEXT_MISMATCH: ${buckets.TEXT_MISMATCH.length}`);
  console.log(`COUNT_MISMATCH:${buckets.COUNT_MISMATCH.length}`);
  console.log(`MISSING_IN_REF:${buckets.MISSING_IN_REF.length}`);

  console.log('\n=== MODULE STATS ===');
  const sortedMods = [...modStats.entries()].sort((a,b) => a[0].localeCompare(b[0]));
  for (const [mod, s] of sortedMods) {
    console.log(`${mod}: total=${s.total} ALIGNED=${s.ALIGNED} TEXT_MISMATCH=${s.TEXT_MISMATCH} COUNT_MISMATCH=${s.COUNT_MISMATCH} MISSING=${s.MISSING_IN_REF}`);
  }

  console.log('\n=== COUNT_MISMATCH DETAIL ===');
  for (const c of buckets.COUNT_MISMATCH) {
    console.log(`${c.tcId} [${c.module}]: ours=${c.ourCount} ref=${c.refCount}`);
  }

  console.log('\n=== SAMPLE TEXT_MISMATCH DIFFS (spread across modules) ===');
  // Pick 10 spread across modules
  const tmByMod = new Map();
  for (const c of buckets.TEXT_MISMATCH) {
    if (!tmByMod.has(c.module)) tmByMod.set(c.module, []);
    tmByMod.get(c.module).push(c);
  }
  const samples = [];
  const modList = [...tmByMod.keys()];
  let mIdx = 0;
  while (samples.length < 10 && mIdx < modList.length * 3) {
    const mod = modList[mIdx % modList.length];
    const arr = tmByMod.get(mod);
    const picked = arr[Math.floor(mIdx / modList.length)];
    if (picked && !samples.find(s => s.tcId === picked.tcId)) samples.push(picked);
    mIdx++;
  }
  for (const c of samples) {
    console.log(`\n--- ${c.tcId} [${c.module}] (${c.ourSteps.length} steps, ${c.diffs.length} diff(s)) ---`);
    for (const d of c.diffs.slice(0, 2)) {
      console.log(`  Step ${d.idx}:`);
      console.log(`    OURS:   ${d.ours}`);
      console.log(`    THEIRS: ${d.theirs}`);
    }
  }

  console.log('\n=== ORDER SPOT-CHECK DATA (20 TEXT_MISMATCH across 3+ modules) ===');
  // Pick 20 spread evenly
  const spotCases = [];
  const spotMods = [...tmByMod.keys()].filter(m => (tmByMod.get(m)||[]).length > 0);
  let si = 0;
  while (spotCases.length < 20 && si < spotMods.length * 20) {
    const mod = spotMods[si % spotMods.length];
    const arr = tmByMod.get(mod);
    const idx = Math.floor(si / spotMods.length);
    const c = arr[idx];
    if (c && !spotCases.find(x => x.tcId === c.tcId)) spotCases.push(c);
    si++;
  }
  for (const c of spotCases) {
    let allMatch = true;
    const stepMismatches = [];
    for (let i = 0; i < c.ourSteps.length; i++) {
      // For order check: do both sides describe same action (normalised keyword check)
      // We check if the words that differ are purely wording/sanitisation vs semantic
      const ours = normalise(c.ourSteps[i]);
      const theirs = normalise(c.refSteps[i]);
      // If they share 40%+ of words → same action (order holds)
      const ourWords = new Set(ours.split(/\s+/).filter(w => w.length > 3));
      const theirWords = new Set(theirs.split(/\s+/).filter(w => w.length > 3));
      const intersect = [...ourWords].filter(w => theirWords.has(w)).length;
      const minSize = Math.min(ourWords.size, theirWords.size);
      if (minSize > 0 && intersect / minSize < 0.3) {
        allMatch = false;
        stepMismatches.push(i + 1);
      }
    }
    const verdict = allMatch ? 'ORDER_HOLDS' : `ORDER_DRIFT_POSSIBLE(steps:${stepMismatches.join(',')})`;
    console.log(`${c.tcId} [${c.module}]: ${verdict}`);
    for (let i = 0; i < c.ourSteps.length; i++) {
      if (c.diffs.find(d => d.idx === i+1)) {
        console.log(`  Step ${i+1}: OURS="${c.ourSteps[i].substring(0,70)}" | THEIRS="${c.refSteps[i].substring(0,70)}"`);
      }
    }
  }

  console.log('\nDone. Full results in .claude/state/tc-restructure/match-results.json');
}

main().catch(e => { console.error(e); process.exit(1); });
