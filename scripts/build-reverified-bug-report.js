#!/usr/bin/env node
/**
 * Regenerate the audited bug-report xlsx with a new "Reverification (2026-04-30)"
 * column that captures the live re-check result for the 8 dark-red rows.
 *
 * Inputs:
 *   - reports/testid-verification/_audit-matrix-2026-04-30.json (73 rows)
 *   - reports/testid-verification/reverify-2026-04-30-reverify.json (per-row verdicts)
 *   - reports/testid-verification/screenshots/2026-04-30/{01,02,03}*.png  (original)
 *   - reports/testid-verification/screenshots/2026-04-30-reverify/{01,02,03}*.png (reverify)
 * Output:
 *   - reports/testid-verification/LOCATION_MISSING_TESTID_REPORT_REVERIFIED_2026-04-30.xlsx
 *
 * Why a new file: the original xlsx is open in Excel; we don't clobber it.
 */
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const REPO = path.resolve(__dirname, '..');
const MATRIX = path.join(REPO, 'reports/testid-verification/_audit-matrix-2026-04-30.json');
const REVERIFY = path.join(REPO, 'reports/testid-verification/reverify-2026-04-30-reverify.json');
const SCREENSHOTS_DIR = path.join(REPO, 'reports/testid-verification/screenshots/2026-04-30');
const REVERIFY_SS_DIR = path.join(REPO, 'reports/testid-verification/screenshots/2026-04-30-reverify');
const OUT = path.join(REPO, 'reports/testid-verification/LOCATION_MISSING_TESTID_REPORT_REVERIFIED_2026-04-30.xlsx');

const COLOR = {
  GREEN: 'FF66BB6A',
  LIGHT_RED: 'FFEF9A9A',
  DARK_RED: 'FFB71C1C',
};
const STATUS_TEXT_COLOR = {
  GREEN: 'FF1B5E20',
  LIGHT_RED: 'FFE65100',
  DARK_RED: 'FFB71C1C',
};
const HEADER_FILL = 'FF1F4E79';
const HEADER_TEXT = 'FFFFFFFF';
const BANDING_FILL = 'FFF7F7F7';
const BORDER_COLOR = 'FFD0D0D0';
const REVERIFY_HEADER_FILL = 'FF6A1B9A'; // distinct purple to signal new column

function thinBorder() {
  return {
    top: { style: 'thin', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } },
  };
}

// xlsxRow -> reverification row key (row36 etc.)
const REVERIFY_ROW_MAP = {
  36: 'row36', 37: 'row37', 39: 'row39', 40: 'row40',
  41: 'row41', 44: 'row44', 64: 'row64', 70: 'row70',
};

function buildReverifyText(xlsxRow, reverify) {
  const key = REVERIFY_ROW_MAP[xlsxRow];
  if (!key) return '';
  const s = reverify.summary[key];
  if (!s) return '';
  const verdictLine = `[${s.verdict}]`;
  const evidence =
    s.verdict === 'TRULY-MISSING-IN-DIALOG'
      ? `Suffix matched page-level "${(s.scopeFalsePositive || '').split(' ')[0]}" — but inside [role="dialog"] innerCount=0. Different element.`
      : s.matchedTestids && s.matchedTestids.length
      ? `Found: ${s.matchedTestids.join(', ')}`
      : 'Page-wide testid dump shows expected suffix is absent everywhere; dialog innerCount=0.';
  return `${verdictLine}\n${evidence}\n\nMethod: live Playwright CLI re-check (2026-04-30); page-wide data-testid dump + dialog-scope inspection. See REVERIFICATION_SUMMARY_2026-04-30.md for full report.`;
}

async function build() {
  const matrix = JSON.parse(fs.readFileSync(MATRIX, 'utf8'));
  const reverify = JSON.parse(fs.readFileSync(REVERIFY, 'utf8'));
  const rows = matrix.rows;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'OWNER (Claude Opus 4.7)';
  wb.created = new Date('2026-04-30');

  const ws = wb.addWorksheet('LocSettings Reverified 2026-04-30', {
    properties: { tabColor: { argb: REVERIFY_HEADER_FILL } },
    views: [{ state: 'frozen', ySplit: 1 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  const headers = {
    module: 'Module', subModule: 'Sub Module', element: 'Element',
    currentSelector: 'Current Selector', status: 'Status', color: 'Status Indicator',
    repro: 'Steps to Reproduce', screenshot: 'Screenshot', notes: 'Notes',
    reverify: 'Reverification (2026-04-30)',
  };
  const caps = { module: 22, subModule: 32, element: 44, currentSelector: 60, status: 40, color: 4, repro: 80, screenshot: 50, notes: 70, reverify: 70 };
  const minw = { module: 18, subModule: 22, element: 30, currentSelector: 30, status: 24, color: 4, repro: 50, screenshot: 50, notes: 36, reverify: 50 };

  const colWidth = {};
  Object.keys(headers).forEach(k => {
    let longest;
    if (k === 'reverify') {
      longest = Object.values(REVERIFY_ROW_MAP).reduce((m, key) => {
        const s = reverify.summary[key];
        return s ? Math.max(m, (s.verdict || '').length + 5) : m;
      }, headers[k].length);
    } else {
      longest = rows.reduce((m, r) => {
        if (k === 'screenshot' || k === 'color') return m;
        const v = String(r[k] || '');
        return Math.max(m, v.length);
      }, headers[k].length);
    }
    let w = Math.min(longest + 2, caps[k]);
    w = Math.max(w, minw[k]);
    colWidth[k] = w;
  });
  ws.columns = Object.keys(headers).map(k => ({ header: headers[k], key: k, width: colWidth[k] }));

  const header = ws.getRow(1);
  header.height = 28;
  header.font = { name: 'Calibri', size: 11, bold: true, color: { argb: HEADER_TEXT } };
  header.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  const reverifyColIdx = Object.keys(headers).indexOf('reverify') + 1;
  header.eachCell((cell, colNumber) => {
    const isReverifyHeader = colNumber === reverifyColIdx;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isReverifyHeader ? REVERIFY_HEADER_FILL : HEADER_FILL },
    };
    cell.border = thinBorder();
  });

  const screenshotPaths = {
    '01-customer-address.png': path.join(SCREENSHOTS_DIR, '01-customer-address.png'),
    '02-save-changes.png':     path.join(SCREENSHOTS_DIR, '02-save-changes.png'),
    '03-error-absent.png':     path.join(SCREENSHOTS_DIR, '03-error-absent.png'),
  };
  const registerImage = (fname) => {
    const p = screenshotPaths[fname];
    if (!fs.existsSync(p)) return null;
    return wb.addImage({ filename: p, extension: 'png' });
  };

  rows.forEach((r, idx) => {
    const rowNum = idx + 2;
    const isImageRow = !!r.defenseIndex;
    const reverifyText = buildReverifyText(r.xlsxRow, reverify);
    const row = ws.addRow({
      module: r.module,
      subModule: r.subModule,
      element: r.element,
      currentSelector: r.currentSelector,
      status: r.status,
      color: '',
      repro: r.repro || '',
      screenshot: '',
      notes: r.notes,
      reverify: reverifyText,
    });

    const linesNeeded = (text, width) => {
      if (!text) return 1;
      const segs = String(text).split(/\n/);
      return segs.reduce((sum, seg) => sum + Math.max(1, Math.ceil(seg.length / Math.max(width - 2, 10))), 0);
    };
    if (isImageRow) {
      row.height = 220; // image + reverification text need more room
    } else {
      const wrapCols = ['element', 'currentSelector', 'status', 'repro', 'notes', 'reverify'];
      const lines = wrapCols.reduce((m, k) => Math.max(m, linesNeeded(r[k] !== undefined ? r[k] : (k === 'reverify' ? reverifyText : ''), colWidth[k])), 1);
      row.height = Math.min(Math.max(20, lines * 16 + 4), 220);
    }
    row.alignment = { vertical: 'top', wrapText: true };
    row.font = { name: 'Calibri', size: 11 };

    const isEven = idx % 2 === 1;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = thinBorder();
      const isColorCol = colNumber === 6;
      if (isColorCol) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR[r.color] } };
      } else if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BANDING_FILL } };
      }
    });

    const statusCell = row.getCell('status');
    statusCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: STATUS_TEXT_COLOR[r.color] } };

    // Reverification cell — bold dark-red text where there is content
    if (reverifyText) {
      const rvCell = row.getCell('reverify');
      rvCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF6A1B9A' } };
      rvCell.alignment = { vertical: 'top', wrapText: true };
    }

    if (isImageRow && r.screenshot) {
      const id = registerImage(r.screenshot);
      if (id !== null) {
        ws.addImage(id, {
          tl: { col: 7, row: rowNum - 1 },
          ext: { width: 320, height: 180 },
          editAs: 'oneCell',
        });
      }
    }
  });

  await wb.xlsx.writeFile(OUT);

  const tally = { GREEN: 0, LIGHT_RED: 0, DARK_RED: 0 };
  rows.forEach((r) => tally[r.color]++);
  const expected = { GREEN: 40, LIGHT_RED: 25, DARK_RED: 8 };
  const ok = tally.GREEN === expected.GREEN && tally.LIGHT_RED === expected.LIGHT_RED && tally.DARK_RED === expected.DARK_RED;
  console.log(`Wrote: ${path.relative(REPO, OUT)}`);
  console.log(`Tally: GREEN=${tally.GREEN}/${expected.GREEN}  LIGHT_RED=${tally.LIGHT_RED}/${expected.LIGHT_RED}  DARK_RED=${tally.DARK_RED}/${expected.DARK_RED}  total=${rows.length}/73`);
  if (!ok) {
    console.error('TALLY MISMATCH — aborting');
    process.exit(1);
  }
  const reverifiedRows = Object.keys(REVERIFY_ROW_MAP).length;
  console.log(`Reverification column populated for ${reverifiedRows} dark-red rows.`);
  console.log('OK');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
