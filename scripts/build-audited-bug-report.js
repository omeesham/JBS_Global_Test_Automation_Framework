#!/usr/bin/env node
/**
 * Build the audited bug-report xlsx from the row-by-row matrix.
 *
 * Inputs:
 *   - reports/testid-verification/_audit-matrix-2026-04-30.json (73 rows)
 *   - reports/testid-verification/screenshots/2026-04-30/{01,02,03}*.png
 * Output:
 *   - reports/testid-verification/LOCATION_MISSING_TESTID_REPORT_AUDITED_2026-04-30.xlsx
 *
 * Color cells use solid fills; row body kept white for readability.
 * Image embedding via ExcelJS.
 */
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const REPO = path.resolve(__dirname, '..');
const MATRIX = path.join(REPO, 'reports/testid-verification/_audit-matrix-2026-04-30.json');
const SCREENSHOTS_DIR = path.join(REPO, 'reports/testid-verification/screenshots/2026-04-30');
const OUT = path.join(REPO, 'reports/testid-verification/LOCATION_MISSING_TESTID_REPORT_AUDITED_2026-04-30.xlsx');

const COLOR = {
  GREEN: 'FF66BB6A',     // Material green 400 — DELIVERED
  LIGHT_RED: 'FFEF9A9A', // Material red 200 — NOT-DELIVERED
  DARK_RED: 'FFB71C1C',  // Material red 900 — MISSING (claimed but absent)
};
const STATUS_TEXT_COLOR = {
  GREEN: 'FF1B5E20',     // dark green text on white
  LIGHT_RED: 'FFE65100', // deep orange text on white
  DARK_RED: 'FFB71C1C',  // deep red text on white
};
const HEADER_FILL = 'FF1F4E79';   // dark blue
const HEADER_TEXT = 'FFFFFFFF';
const BANDING_FILL = 'FFF7F7F7';  // very faint grey
const BORDER_COLOR = 'FFD0D0D0';  // thin grey

function thinBorder() {
  return {
    top: { style: 'thin', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } },
  };
}

async function build() {
  const matrix = JSON.parse(fs.readFileSync(MATRIX, 'utf8'));
  const rows = matrix.rows;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'OWNER (Claude Opus 4.7)';
  wb.created = new Date('2026-04-30');

  const ws = wb.addWorksheet('LocSettings Audited 2026-04-30', {
    properties: { tabColor: { argb: HEADER_FILL } },
    views: [{ state: 'frozen', ySplit: 1 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  // Compute column widths from actual data — width = max(header, longest cell)
  // capped per-column so prose columns wrap rather than stretch across the screen.
  const headers = {
    module: 'Module', subModule: 'Sub Module', element: 'Element',
    currentSelector: 'Current Selector', status: 'Status', color: 'Status Indicator',
    repro: 'Steps to Reproduce', screenshot: 'Screenshot', notes: 'Notes',
  };
  // Caps tuned for landscape A4 — prose wraps, identifiers don't
  const caps = { module: 22, subModule: 32, element: 44, currentSelector: 60, status: 40, color: 4, repro: 80, screenshot: 50, notes: 70 };
  const minw = { module: 18, subModule: 22, element: 30, currentSelector: 30, status: 24, color: 4, repro: 50, screenshot: 50, notes: 36 };
  const colWidth = {};
  Object.keys(headers).forEach(k => {
    const longest = rows.reduce((m, r) => {
      if (k === 'screenshot' || k === 'color') return m; // images / fill — fixed
      const v = String(r[k] || '');
      // for wrap-y columns we count first-line length only (wrap handles rest)
      return Math.max(m, v.length);
    }, headers[k].length);
    let w = Math.min(longest + 2, caps[k]);
    w = Math.max(w, minw[k]);
    colWidth[k] = w;
  });
  ws.columns = Object.keys(headers).map(k => ({ header: headers[k], key: k, width: colWidth[k] }));

  // Header row formatting
  const header = ws.getRow(1);
  header.height = 28;
  header.font = { name: 'Calibri', size: 11, bold: true, color: { argb: HEADER_TEXT } };
  header.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  header.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    cell.border = thinBorder();
  });

  // Helper: register image fresh each time (ExcelJS dedupes placements that
  // share the same imageId, so we register per-placement even though only 3
  // unique PNGs exist on disk).
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

  // Body rows
  rows.forEach((r, idx) => {
    const rowNum = idx + 2; // +1 for header, +1 for 1-based
    const isImageRow = !!r.defenseIndex;
    const row = ws.addRow({
      module: r.module,
      subModule: r.subModule,
      element: r.element,
      currentSelector: r.currentSelector,
      status: r.status,
      color: '', // intentionally blank — color is the fill
      repro: r.repro || '',
      screenshot: '', // image is embedded separately
      notes: r.notes,
    });

    // Row height: image rows get a fixed tall height so the screenshot fits cleanly.
    // Non-image rows are sized to fit the longest wrapping cell — estimated as
    // (text length / column width) × approx line height.
    const linesNeeded = (text, width) => {
      if (!text) return 1;
      const segs = String(text).split(/\n/);
      return segs.reduce((sum, seg) => sum + Math.max(1, Math.ceil(seg.length / Math.max(width - 2, 10))), 0);
    };
    if (isImageRow) {
      row.height = 200; // image height (180) + padding for image rows
    } else {
      const wrapCols = ['element', 'currentSelector', 'status', 'repro', 'notes'];
      const lines = wrapCols.reduce((m, k) => Math.max(m, linesNeeded(r[k], colWidth[k])), 1);
      row.height = Math.min(Math.max(20, lines * 16 + 4), 200);
    }
    row.alignment = { vertical: 'top', wrapText: true };
    row.font = { name: 'Calibri', size: 11 };

    // Alternating row banding (text columns only) — apply to even body rows
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

    // Status column — bold, color-tinted text on white
    const statusCell = row.getCell('status');
    statusCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: STATUS_TEXT_COLOR[r.color] } };

    // Embed screenshot in the Defense Screenshot cell for disputed rows.
    // Register the image fresh each time — ExcelJS dedupes placements that
    // reuse the same imageId, so 6 rows pointing at one cached id collapse
    // to 1 placement. Re-registering avoids that.
    if (isImageRow && r.screenshot) {
      const id = registerImage(r.screenshot);
      if (id !== null) {
        ws.addImage(id, {
          tl: { col: 7, row: rowNum - 1 },        // 0-indexed (col 7 = "Screenshot", H)
          ext: { width: 320, height: 180 },       // 16:9 aspect, large enough to see context
          editAs: 'oneCell',
        });
      }
    }
  });

  await wb.xlsx.writeFile(OUT);

  // Tally assertion (Step 5 verification — abort if off)
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
  const imageRows = rows.filter((r) => r.defenseIndex).length;
  console.log(`Embedded ${imageRows} screenshots across ${imageRows} disputed rows.`);
  console.log('OK');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
