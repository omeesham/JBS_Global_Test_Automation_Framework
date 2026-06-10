/**
 * THROWAWAY converter (delete after run) — refresh the TestRail demo workbook from
 * the current deliverable workbook.
 *
 * Reads  clients/encore/test_cases_xlsx/encore_test_cases.xlsx (source of truth)
 * Writes a TestRail "Test Case (Steps)" workbook (one sheet per module, multi-row
 * per step) to argv[2] (default = encore_test_cases_testrail.xlsx).
 *
 * 1:1 port of the original `_gen-testrail-demo.ts` (which itself ported the client's
 * `_convert_to_testrail.py`) with two deltas, both reflecting how the live file
 * already looks:
 *   (1) 11-column schema (the 6 cols Mission/Section/Section Hierarchy/Section Depth/
 *       Template/References were removed from the live file in commit 1a08278e).
 *   (2) SHEET_META extended with the 3 corp-pricing sub-modules added after the
 *       original run: New Pricebook, Override, Toolbar I/O.
 *
 * Run:  npx ts-node scripts/_gen-testrail.ts [outPath]
 */
import * as path from 'path';
import ExcelJS from 'exceljs';

const REPO_ROOT = path.resolve(__dirname, '..');
const SRC = path.join(REPO_ROOT, 'clients', 'encore', 'test_cases_xlsx', 'encore_test_cases.xlsx');
const OUT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(REPO_ROOT, 'clients', 'encore', 'test_cases_xlsx', 'encore_test_cases_testrail.xlsx');

const BASE_URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/';
const OFFICE_ID = '1604';
const ROLE = 'role_with_location_edit_permission';

// Live-file schema (original 17 minus the 6 dropped in 1a08278e). Order matters for import.
const TESTRAIL_COLUMNS = [
  'ID', 'Title', 'Module', 'Sub-Module', 'Test Data', 'Type', 'Priority',
  'Automation Type', 'Preconditions', 'Steps (Step)', 'Steps (Expected Result)',
] as const;

const COLUMN_WIDTHS: Record<string, number> = {
  ID: 16, Title: 60, Module: 14, 'Sub-Module': 16, 'Test Data': 44,
  Type: 14, Priority: 10, 'Automation Type': 14,
  Preconditions: 36, 'Steps (Step)': 70, 'Steps (Expected Result)': 70,
};

const DEFAULT_TYPE = 'Functional';
const DEFAULT_PRIORITY = 'Medium';

/** Per source-sheet → clean Module / Sub-Module display names + TestRail sheet name (≤31 chars). */
const SHEET_META: Record<string, { module: string; sub: string; sheet: string }> = {
  local_office_settings: { module: 'Local Office', sub: 'Basic Information', sheet: 'Local Office - Basic Info' },
  local_office_history: { module: 'Local Office', sub: 'History', sheet: 'Local Office - History' },
  local_office_ect: { module: 'Local Office', sub: 'ECT Settings', sheet: 'Local Office - ECT Settings' },
  corporate_pricing_detail: { module: 'Corporate Pricing', sub: 'Pricing Detail', sheet: 'Corporate Pricing - Detail' },
  corporate_pricing_new_pricebook: { module: 'Corporate Pricing', sub: 'New Pricebook', sheet: 'Corporate Pricing - Pricebook' },
  corporate_pricing_override: { module: 'Corporate Pricing', sub: 'Override', sheet: 'Corporate Pricing - Override' },
  corporate_pricing_search: { module: 'Corporate Pricing', sub: 'Search', sheet: 'Corporate Pricing - Search' },
  corporate_pricing_strategy: { module: 'Corporate Pricing', sub: 'Pricing Strategy', sheet: 'Corporate Pricing - Strategy' },
  corporate_pricing_toolbar_io: { module: 'Corporate Pricing', sub: 'Toolbar I/O', sheet: 'Corporate Pricing - Toolbar' },
  locations_account_address: { module: 'Locations', sub: 'Account & Address', sheet: 'Locations - Account & Address' },
  locations_auto_addon: { module: 'Locations', sub: 'Auto Add-On', sheet: 'Locations - Auto Add-On' },
  locations_currency: { module: 'Locations', sub: 'Currency', sheet: 'Locations - Currency' },
  locations_left_panel_basic_info: { module: 'Locations', sub: 'Basic Information', sheet: 'Locations - Basic Information' },
  locations_legal: { module: 'Locations', sub: 'Legal', sheet: 'Locations - Legal' },
  locations_local_information: { module: 'Locations', sub: 'Local Information', sheet: 'Locations - Local Information' },
  locations_management_history: { module: 'Locations', sub: 'Management History', sheet: 'Locations - Management History' },
  locations_notes: { module: 'Locations', sub: 'Notes', sheet: 'Locations - Notes' },
  locations_pricing: { module: 'Locations', sub: 'Pricing', sheet: 'Locations - Pricing' },
  locations_shared_setup_location: { module: 'Locations', sub: 'Shared Setup Locations', sheet: 'Locations - Shared Setup' },
};

// ── parse_steps (port) — split numbered blob into atomic actions. ──
function parseSteps(raw: string): string[] {
  if (!raw) return [];
  const text = raw.replace(/\r\n/g, '\n').trim();
  const chunks = text.split(/\s*¶\s*|\n/).map(c => c.trim()).filter(Boolean);
  const parts = chunks.map(c => c.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
  const atomic: string[] = [];
  for (const p of parts) {
    for (const sub of p.split(/;\s+(?=[A-Za-z(])/)) {
      const s = sub.trim().replace(/;+$/, '');
      if (s) atomic.push(s);
    }
  }
  return atomic;
}

// ── per_step_expected (port) ──
function perStepExpected(step: string, caseExpected: string, isLast: boolean, subModule: string): string {
  if (isLast) return caseExpected.trim();
  const s = step.toLowerCase();
  const subLower = (subModule || '').toLowerCase();
  if (/^(ensure the table is empty|ensure no rows|make sure no rows)/.test(s)) return `The ${subModule} surface shows its documented empty state.`;
  if (/^navigate to https/.test(s) || (s.includes('navigate to') && s.includes('page'))) return `The page loads and the ${subModule} surface is reachable.`;
  if (s.includes('open') && subLower && s.includes(subLower) && s.includes('tab')) return `The ${subModule} tab is active and its content is rendered.`;
  if (/^click "add"|^click add|^click the "add"/.test(s) || s.includes('click "add"')) return 'A new empty row is added and the input receives focus.';
  if (/^(type |paste )/.test(s) || s.includes('fill the row') || s.includes('fill row') || s.includes('fill the new') || s.includes('fill the note row')) return 'The typed/pasted text appears in the input and any counter updates.';
  if (/^click "save"|^click save/.test(s) || s.includes('click left-panel "save"')) return 'The save confirmation dialog appears.';
  if (s.includes('confirm the dialog') || /^click "ok"|^click ok/.test(s)) return 'The dialog closes and the save is persisted; the Save button becomes disabled.';
  if (s.includes('click "cancel"') || /^click cancel/.test(s)) return 'The dialog closes without saving and the form remains dirty.';
  if (s.includes('reload the page') || /^(reload page|reload )/.test(s)) return 'The page reloads successfully.';
  if (s.includes('navigate back') && s.includes('tab')) return `The ${subModule} tab opens and renders the persisted state.`;
  if (/^read /.test(s)) return 'The expected value is read from the row.';
  if (/^(verify |assert |observe)/.test(s)) {
    let target = step.includes(' ') ? step.slice(step.indexOf(' ') + 1) : step;
    target = target.replace(/^(that\s+|the\s+)/i, '').trim();
    if (!target) target = 'the expected state';
    target = target.charAt(0).toUpperCase() + target.slice(1);
    return `${target} is observed in the UI as described.`;
  }
  if (s.includes('click "delete"') || s.includes('delete the row') || s.includes('click delete')) return 'The targeted row is removed from the table.';
  if (s.includes('clear ') && s.includes('row')) return "The targeted row's input becomes empty and any counter updates.";
  if (/^press the escape|^press escape/.test(s)) return 'The dialog closes.';
  if (s.includes('tab through')) return 'Focus moves through each interactive element in tab order.';
  if (s.includes('navigate away')) return 'The browser fires its built-in beforeunload confirmation dialog.';
  if (s.includes('click on the page background') || s.includes('click outside')) return "The dialog's reaction is observed and recorded.";
  return 'The action completes successfully with no error.';
}

// ── derive_test_data (port) ──
const UI_LABELS_SKIP = new Set(['Add', 'Save', 'Delete', 'Ok', 'Cancel', 'No Data Available', 'No Notes Available', '(0 Left)']);
function deriveTestData(stepsText: string): string {
  const lines = [`user = ${ROLE}`, `office_id = ${OFFICE_ID}   (existing fixture)`, `url = ${BASE_URL}`];
  const seen = new Set<string>();
  let idx = 1;
  for (const m of stepsText.matchAll(/"([^"\n]{1,80})"/g)) {
    const lit = m[1];
    if (!lit || UI_LABELS_SKIP.has(lit) || seen.has(lit)) continue;
    seen.add(lit);
    lines.push(`input_text_${idx} = "${lit}"   (created by Planner)`);
    idx += 1;
    if (idx > 6) break;
  }
  if (stepsText.includes('<script>') || stepsText.includes('alert(1)')) lines.push('xss_payload = <script>alert(1)</script>   (created by Planner)');
  if (stepsText.toUpperCase().includes('DROP TABLE')) lines.push("sql_payload = '; DROP TABLE ...; --   (created by Planner)");
  return lines.join('\n');
}

function deriveAutomation(coverage: string, exec: string): string {
  if (coverage && coverage.toLowerCase().includes('automated') && exec && !exec.toLowerCase().includes('blocked')) return 'Automated';
  return 'Manual';
}

interface SrcRow { id: string; title: string; pre: string; steps: string; expected: string; cov: string; exec: string; }

async function main() {
  const src = new ExcelJS.Workbook();
  await src.xlsx.readFile(SRC);
  const out = new ExcelJS.Workbook();
  out.creator = 'encore testrail demo (throwaway)';

  let totalCases = 0, totalRows = 0;
  const sheetOrder = src.worksheets.map(w => w.name).filter(n => n !== 'Overview');

  for (const sheetName of sheetOrder) {
    const meta = SHEET_META[sheetName];
    if (!meta) { console.warn(`[demo] no SHEET_META for ${sheetName} — skipping`); continue; }
    const ws = src.getWorksheet(sheetName)!;
    const header = ws.getRow(1).values as any[];
    const col = (name: string) => header.findIndex((v: any) => String(v ?? '').trim() === name);
    const cID = col('TC ID'), cTitle = col('Title'), cPre = col('Preconditions'),
      cSteps = col('Steps'), cExp = col('Expected Result'), cCov = col('Coverage Status'), cExec = col('Automation Execution');

    const rows: SrcRow[] = [];
    ws.eachRow((row, n) => {
      if (n === 1) return;
      const rv = row.values as any[];
      const id = String(rv[cID] ?? '').trim();
      if (!id || !/^TC-/.test(id)) return; // skip SUMMARY / blank rows
      rows.push({
        id,
        title: String(rv[cTitle] ?? '').trim(),
        pre: String(rv[cPre] ?? '').trim() || 'None',
        steps: String(rv[cSteps] ?? '').trim(),
        expected: String(rv[cExp] ?? '').trim(),
        cov: String(rv[cCov] ?? '').trim(),
        exec: String(rv[cExec] ?? '').trim(),
      });
    });

    const sheet = out.addWorksheet(meta.sheet.slice(0, 31), { views: [{ state: 'frozen', ySplit: 1 }] });
    const headerRow = sheet.addRow([...TESTRAIL_COLUMNS]);
    headerRow.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.height = 32;
    headerRow.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } }; });
    TESTRAIL_COLUMNS.forEach((c, i) => { sheet.getColumn(i + 1).width = COLUMN_WIDTHS[c] ?? 18; });

    const thin = { style: 'thin' as const, color: { argb: 'FFBFBFBF' } };
    const border = { top: thin, left: thin, right: thin, bottom: thin };
    const firstRowFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFEAF1F8' } };

    for (const r of rows) {
      totalCases += 1;
      let steps = parseSteps(r.steps);
      if (steps.length === 0) steps = ['(no steps defined)'];
      const automation = deriveAutomation(r.cov, r.exec);
      const testData = deriveTestData(r.steps);
      steps.forEach((step, i) => {
        const isLast = i === steps.length - 1;
        const expected = perStepExpected(step, r.expected, isLast, meta.sub);
        const stepCell = `${i + 1}. ${step}`;
        const vals = i === 0
          ? [r.id, r.title, meta.module, meta.sub, testData, DEFAULT_TYPE, DEFAULT_PRIORITY, automation, r.pre, stepCell, expected]
          : ['', '', '', '', '', '', '', '', '', stepCell, expected];
        const wr = sheet.addRow(vals);
        wr.eachCell(c => { c.font = { name: 'Arial', size: 10 }; c.alignment = { vertical: 'top', wrapText: true }; c.border = border; });
        if (i === 0) wr.eachCell(c => { c.fill = firstRowFill; });
        totalRows += 1;
      });
    }
    console.log(`  ${meta.sheet.padEnd(34)} ${String(rows.length).padStart(4)} cases`);
  }

  await out.xlsx.writeFile(OUT);
  console.log(`\n[demo] OK -> ${OUT}`);
  console.log(`[demo] sheets: ${out.worksheets.length} | cases: ${totalCases} | step-rows: ${totalRows}`);
}

main().catch(e => { console.error('[demo] FAIL', e); process.exit(1); });
