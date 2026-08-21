// harvest.mjs — transplant per-step Expected Results from reference xlsx into our markdown
// TICKET: tcr-harvest | One-time script — lives in .claude/state/tc-restructure/ (never in repo scripts/)

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ExcelJS = require('exceljs');

const REPO = 'C:/Users/RutvikKhorasiya/projects/encore_framework';
const MD_DIR = path.join(REPO, 'clients/encore/specs_planning/test-cases/setup');
const REF_DIR = path.join(REPO, '.claude/state/ua-worker/chips/tc-restructure/out-review-bc/fresh');
const MATCH_JSON = path.join(REPO, '.claude/state/tc-restructure/match-results.json');
const RUN_DIR = path.join(REPO, '.claude/state/tc-restructure');

// ──────────────────────────────────────────────
// 1. Parse reference xlsx → Map<tcId, expectedResults[]>
//    col 1 = TC ID (first row of TC block)
//    col 11 = step text  (used for step counting only)
//    col 12 = expected result  (what we harvest)
// ──────────────────────────────────────────────
async function parseRefExpected(xlsxPath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xlsxPath);
  const ref = new Map(); // tcId → { steps: string[], expected: string[] }

  wb.eachSheet((ws) => {
    if (ws.name === 'Overview') return;
    let curId = null;
    ws.eachRow((row, rowNum) => {
      if (rowNum === 1) return; // skip header row
      const c1  = String(row.getCell(1).value  || '').trim();
      const c11 = String(row.getCell(11).value || '').trim();
      const c12 = String(row.getCell(12).value || '').trim();
      if (c1 && c1 !== 'SUMMARY') {
        curId = c1;
        if (!ref.has(curId)) ref.set(curId, { steps: [], expected: [] });
      }
      if (curId && c11) {
        // Strip leading "N. " or "N) " prefix from step text
        const stepText = c11.replace(/^\d+[.)]\s*/, '').trim();
        ref.get(curId).steps.push(stepText);
        ref.get(curId).expected.push(c12);
      }
    });
  });
  return ref;
}

// ──────────────────────────────────────────────
// 2. Collect all reference xlsx files (skip consolidated)
// ──────────────────────────────────────────────
async function loadAllRefData() {
  const refMap = new Map();
  const files = fs.readdirSync(REF_DIR).filter(
    f => f.endsWith('.xlsx') && f !== 'testcases__encore_test_cases.xlsx'
  );
  for (const f of files) {
    const partial = await parseRefExpected(path.join(REF_DIR, f));
    for (const [tcId, data] of partial) refMap.set(tcId, data);
  }
  return refMap;
}

// ──────────────────────────────────────────────
// 3. Count step-table rows in markdown for a given TC
//    Returns number of data rows in the | # | Step | Expected Result | table
// ──────────────────────────────────────────────
function countStepsInTable(lines, tcHeadingIdx) {
  let i = tcHeadingIdx + 1;
  let inTable = false;
  let pastSep = false;
  let count = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Stop at next TC heading
    if (/^## TC-[A-Z0-9]+-[A-Z0-9]+-\d+:/.test(line)) break;
    if (!inTable && /^\|\s*#\s*\|\s*Step/i.test(line)) {
      inTable = true;
      i++; continue;
    }
    if (inTable && !pastSep && /^\|[-|: ]+\|/.test(line)) {
      pastSep = true;
      i++; continue;
    }
    if (inTable && pastSep) {
      if (!line.startsWith('|')) break;
      const cols = line.split('|');
      if (cols.length >= 4) {
        const stepText = cols[2].trim();
        if (stepText && !/^[-: ]+$/.test(stepText)) count++;
      }
    }
    i++;
  }
  return count;
}

// ──────────────────────────────────────────────
// 4. Escape pipe chars in a cell value
// ──────────────────────────────────────────────
function escPipe(s) {
  return s.replace(/\|/g, '\\|');
}

// ──────────────────────────────────────────────
// 5. Detect if a cell already contains the case-level **Expected**: summary
//    (the D12 fallback anti-pattern we must replace)
// ──────────────────────────────────────────────
function isCaseSummaryFallback(cellText, caseSummary) {
  if (!cellText || !caseSummary) return false;
  const a = cellText.trim().replace(/\*\*/g, '').toLowerCase();
  const b = caseSummary.trim().replace(/\*\*/g, '').toLowerCase();
  return a === b || a.startsWith(b.slice(0, 40));
}

// ──────────────────────────────────────────────
// 6. Process a single markdown file
//    Returns { cellsFilled, casesTouched, skipped[] }
// ──────────────────────────────────────────────
function processMarkdown(mdPath, harvestSet, refMap) {
  const content = fs.readFileSync(mdPath, 'utf8');
  const lines = content.split('\n');
  const result = {
    cellsFilled: 0,
    casesTouched: 0,
    skipped: [],         // { tcId, reason }
    blankBefore: 0,
    blankAfter: 0,       // filled in after write
  };

  // Count blank Expected Result cells before edit
  for (const line of lines) {
    if (/^\|/.test(line)) {
      const cols = line.split('|');
      if (cols.length >= 5 && /^\s*\d+\s*$/.test(cols[1])) {
        const er = cols[3].trim();
        if (er === '' || er === ' ') result.blankBefore++;
      }
    }
  }

  // Index TC heading lines: tcId → lineIndex
  const tcIndexMap = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^## (TC-[A-Z0-9]+-[A-Z0-9]+-\d+):/);
    if (m) tcIndexMap.set(m[1], i);
  }

  // Track which TCs to harvest in this file
  const toHarvest = [...harvestSet].filter(tcId => tcIndexMap.has(tcId));
  if (toHarvest.length === 0) return result;

  // We'll collect { lineIdx, newLine } edits, then apply them
  const edits = []; // { lineIdx, newLine }

  for (const tcId of toHarvest) {
    const headingIdx = tcIndexMap.get(tcId);
    const refData = refMap.get(tcId);
    if (!refData || refData.steps.length === 0) {
      result.skipped.push({ tcId, reason: 'not found in reference at write time' });
      continue;
    }

    // Write-time step count guard (D22)
    const ourStepCount = countStepsInTable(lines, headingIdx);
    const refStepCount = refData.steps.length;
    if (ourStepCount !== refStepCount) {
      result.skipped.push({
        tcId,
        reason: `step count mismatch at write time: ours=${ourStepCount} ref=${refStepCount}`,
      });
      continue;
    }

    // Find step table rows and fill Expected Result
    let i = headingIdx + 1;
    let inTable = false;
    let pastSep = false;
    let stepIdx = 0;
    let caseSummary = '';

    // Find **Expected**: line for this TC (used for D12 fallback detection)
    let j = headingIdx + 1;
    while (j < lines.length) {
      if (/^## TC-[A-Z0-9]+-[A-Z0-9]+-\d+:/.test(lines[j])) break;
      const em = lines[j].match(/^\*\*Expected\*\*:\s*(.+)/);
      if (em) { caseSummary = em[1].trim(); break; }
      j++;
    }

    let cellsFilledThisTc = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (/^## TC-[A-Z0-9]+-[A-Z0-9]+-\d+:/.test(line)) break;

      if (!inTable && /^\|\s*#\s*\|\s*Step/i.test(line)) {
        inTable = true; i++; continue;
      }
      if (inTable && !pastSep && /^\|[-|: ]+\|/.test(line)) {
        pastSep = true; i++; continue;
      }

      if (inTable && pastSep) {
        if (!line.startsWith('|')) break;
        const cols = line.split('|');
        // cols: ['', '#', 'Step', 'Expected Result', '']
        if (cols.length >= 5) {
          const stepText = cols[2].trim();
          if (stepText && !/^[-: ]+$/.test(stepText)) {
            const currentER = cols[3].trim();
            const expectedResult = refData.expected[stepIdx] || '';

            // Decide whether to write
            const isEmpty = currentER === '' || currentER === ' ';
            const isFallback = !isEmpty && isCaseSummaryFallback(currentER, caseSummary);

            if (isEmpty || isFallback) {
              if (expectedResult) {
                // Rebuild the line with the new Expected Result
                // Preserve leading/trailing spaces around each column for readability
                const newLine = `| ${cols[1].trim()} | ${escPipe(cols[2].trim())} | ${escPipe(expectedResult)} |`;
                edits.push({ lineIdx: i, newLine });
                cellsFilledThisTc++;
              }
            }
            // If cell already has real content (not fallback), leave it alone
            stepIdx++;
          }
        }
      }
      i++;
    }

    if (cellsFilledThisTc > 0) {
      result.casesTouched++;
      result.cellsFilled += cellsFilledThisTc;
    } else if (stepIdx > 0) {
      // TC was found and step count matched, but all cells already had content
      result.casesTouched++;
    }
  }

  if (edits.length === 0) return result;

  // Apply all edits (sorted by line index, non-overlapping)
  edits.sort((a, b) => a.lineIdx - b.lineIdx);
  const newLines = [...lines];
  for (const { lineIdx, newLine } of edits) {
    newLines[lineIdx] = newLine;
  }

  fs.writeFileSync(mdPath, newLines.join('\n'), 'utf8');

  // Count blank Expected Result cells after edit
  const afterContent = fs.readFileSync(mdPath, 'utf8').split('\n');
  for (const line of afterContent) {
    if (/^\|/.test(line)) {
      const cols = line.split('|');
      if (cols.length >= 5 && /^\s*\d+\s*$/.test(cols[1])) {
        const er = cols[3].trim();
        if (er === '' || er === ' ') result.blankAfter++;
      }
    }
  }

  return result;
}

// ──────────────────────────────────────────────
// 7. Recursively find all *_test_cases.md files
// ──────────────────────────────────────────────
function collectMdFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectMdFiles(full));
    else if (entry.name.endsWith('_test_cases.md')) result.push(full);
  }
  return result;
}

// ──────────────────────────────────────────────
// main
// ──────────────────────────────────────────────
async function main() {
  // Load match-results
  const matchData = JSON.parse(fs.readFileSync(MATCH_JSON, 'utf8'));
  const harvestBuckets = [
    ...matchData.buckets.ALIGNED,
    ...matchData.buckets.TEXT_MISMATCH,
  ];

  // Build module → Set<tcId>
  const moduleHarvestMap = new Map(); // module → Set<tcId>
  for (const { tcId, module } of harvestBuckets) {
    if (!moduleHarvestMap.has(module)) moduleHarvestMap.set(module, new Set());
    moduleHarvestMap.get(module).add(tcId);
  }

  console.log(`Harvest buckets: ALIGNED=${matchData.buckets.ALIGNED.length} TEXT_MISMATCH=${matchData.buckets.TEXT_MISMATCH.length}`);
  console.log(`Total to attempt: ${harvestBuckets.length}`);

  // Load all reference data
  console.log('Loading reference xlsx files...');
  const refMap = await loadAllRefData();
  console.log(`Loaded ${refMap.size} TCs from reference`);

  // Process each markdown file
  const mdFiles = collectMdFiles(MD_DIR);
  const moduleResults = []; // { module, file, ...result }
  const allSkipped = [];

  let totalCasesTouched = 0;
  let totalCellsFilled = 0;

  for (const mdPath of mdFiles) {
    const modName = path.basename(mdPath, '_test_cases.md');
    const harvestSet = moduleHarvestMap.get(modName);
    if (!harvestSet || harvestSet.size === 0) continue;

    console.log(`Processing ${modName} (${harvestSet.size} cases)...`);
    const res = processMarkdown(mdPath, harvestSet, refMap);
    moduleResults.push({ module: modName, ...res });
    allSkipped.push(...res.skipped.map(s => ({ module: modName, ...s })));
    totalCasesTouched += res.casesTouched;
    totalCellsFilled += res.cellsFilled;
    console.log(`  casesTouched=${res.casesTouched} cellsFilled=${res.cellsFilled} skipped=${res.skipped.length} blankBefore=${res.blankBefore} blankAfter=${res.blankAfter}`);
  }

  console.log(`\nTOTAL: casesTouched=${totalCasesTouched} cellsFilled=${totalCellsFilled} skipped=${allSkipped.length}`);

  // Write harvest report JSON for reference
  const reportJson = { totalCasesTouched, totalCellsFilled, modules: moduleResults, skipped: allSkipped };
  fs.writeFileSync(path.join(RUN_DIR, 'harvest-results.json'), JSON.stringify(reportJson, null, 2));
  console.log('\nWrote harvest-results.json');
}

main().catch(e => { console.error(e); process.exit(1); });
