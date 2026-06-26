// Build clients/encore/test_cases_xlsx/tracker_corp_pricing.xlsx
//
// Corporate-Pricing-only QA tracker. Models the existing encore-qa-tracker.xlsx
// EXACTLY: same color key (RED/YELLOW/GREEN solid fill in the Color column only),
// same 9-column header, same Type-grouped rows sorted RED>YELLOW>GREEN, same
// plain-English client-friendly tone, and a Test-run-summary prose block at the end.
//
// Row provenance + read-only Jira dedupe verdicts:
//   clients/encore/specs_planning/_internal/corp-pricing-tracker-provenance-2026-06-09.md
// NO Jira IDs / TC-IDs / framework jargon appear in the workbook (client-facing).
//
// Re-build:  node clients/encore/specs_planning/_internal/build-corp-pricing-tracker.mjs

import ExcelJS from 'exceljs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../test_cases_xlsx/tracker_corp_pricing.xlsx');

// Fill colors lifted verbatim from encore-qa-tracker.xlsx (Excel 3-color-scale stops).
const RED = 'FFF8696B';
const YELLOW = 'FFFFEB84';
const GREEN = 'FF63BE7B';
const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });

const HEADER = ['Color', 'Type', '#', 'Area', 'How to reproduce (brief)',
  'What we observed', 'What we expected', 'Possible cause (unconfirmed)', 'Status'];

// Each data row: { color: RED|YELLOW|GREEN|null, type, id, area, repro, observed, expected, cause, status }
//
// CURATION NOTE (2026-06-09, live + Jira-dedupe pass): the workbook was trimmed from 10 candidate
// rows to 5 after re-checking each item live on the current site and against Encore's own Jira:
//   • Former A1 ("New-Price-only edit doesn't enable Save") — DROPPED: test-harness artifact, not a
//     defect (real-user entry enables Save; LR-044).
//   • Former C1 (server-side Search filter) — DROPPED: feature works; spec drift is benign.
//   • Former C2 (9 vs 8 columns) — DROPPED: benign split, works as built.
//   • Former C3 (History tab absent) — DROPPED: History tab is intentionally not delivered here.
//   • Former C5 (Price shows saved override) — DROPPED: this is the intended design (New Price is a
//     data-entry field that updates Price then clears).
//   • Former C9 (Export/Import payload/format) — DROPPED: variants + mechanism are documented and
//     confirmed live; the feature is a known work-in-progress flagged on Encore's side ("can't test
//     until import/export bugs resolved"), so the remaining gap is theirs, not an open question for us.
//   • Former C8 (Override / Max Discount validation question) — PROMOTED to a confirmed defect (A1)
//     after a real-user repro: a Max Discount % over 100 silently traps focus with no error shown.
// Full per-row audit trail (with Jira ticket evidence) in the provenance ledger.
const ROWS = [
  // ---- Type A: Product bug (confirmed live, needs a fix) ----
  {
    color: RED, type: 'Product bug', id: 'A1',
    area: 'Corporate Pricing - Pricing Detail (Max Discount column)',
    repro: 'On the Pricing Detail tab of a price book, click into a Max Discount cell, type a value over 100 (e.g. 333), then try to click or tab out of the cell.',
    observed: 'The field will not let you leave it — clicking elsewhere or pressing Tab does nothing and the cursor stays trapped in the cell. No error message, tooltip, or validation hint is shown. The only way out is to manually lower the value to 100 or less.',
    expected: 'An out-of-range entry should show a clear validation message AND still let the user move out of the field — it should not silently trap the cursor with no feedback.',
    cause: 'Out-of-range input appears to block the field’s blur/commit without surfacing a validation error.',
    status: 'Action required. Confirmed live by manual entry on the current site (2026-06-09). The 100% cap itself is reasonable; the defect is the silent focus-trap with no error and no way out.'
  },

  // ---- Type C: Product / UX question (the questions we need answered) ----
  {
    color: YELLOW, type: 'Product / UX question', id: 'C1',
    area: 'Corporate Pricing - Pricing Detail (grid)',
    repro: 'On the Pricing Detail tab of an existing price book, look for a way to expand a product-group row to see the items inside it.',
    observed: 'The grid is flat — each product group is a single, non-expandable row with no way to drill into items. The written spec describes expanding a product group to show the items inside it.',
    expected: 'Question, not a defect.',
    status: 'Is the flat grid interim (the expandable group→items view still planned), or is the flat list the final design? Our coverage currently asserts the flat grid.'
  },
  {
    color: YELLOW, type: 'Product / UX question', id: 'C2',
    area: 'Corporate Pricing - New Pricebook (Price Year)',
    repro: 'On the New Pricebook form, type a decimal (e.g. 20.5) and a 2-digit value (e.g. 12) into Price Year, then try letters; check what is accepted and whether Save stays available.',
    observed: 'Price Year rejects letters (the field reverts to the last valid value) but keeps a decimal (20.5) and a 2-digit value (12) without complaint. Server-side validation on final save was not exercised.',
    expected: 'Question, not a defect.',
    status: 'Should Price Year be restricted to a valid 4-digit year? Today only letters are blocked — 20.5 and 12 both pass the on-screen check.'
  },
  {
    color: YELLOW, type: 'Product / UX question', id: 'C3',
    area: 'Corporate Pricing - New Pricebook (lifecycle)',
    repro: 'Create and save a new price book, then look for any way to delete, deactivate, or remove it.',
    observed: 'After a successful save there is no delete, deactivate, or remove option anywhere — not on the Details page, the Search action bar, any menu, or at row level. A created price book appears to be permanent via the UI.',
    expected: 'Question, not a defect.',
    status: 'Is there an intended way to remove or deactivate a price book created in error? This affects real-user error recovery.'
  },

  // ---- Type D: Automation support (not a product bug) ----
  {
    color: null, type: 'Automation support (not a product bug)', id: 'D1',
    area: 'Corporate Pricing (all screens)',
    repro: 'Inspect the Corporate Pricing screens for stable test identifiers.',
    observed: 'The module ships with effectively no automation-grade test identifiers — Search has 3 generic ones; the Pricing Strategy, Pricing Detail, New Pricebook, Product Group Override, and Export/Import surfaces have none.',
    expected: 'Stable, field-specific identifiers would make automated testing more reliable.',
    cause: '-',
    status: 'Testability / enablement request — a list of ~19 specific identifiers is provided separately. Please submit apart from the product items above.'
  },
];

const LEGEND = [
  ['COLOR KEY - our verification finding per item (rows sorted RED > YELLOW > GREEN within each Type section)', null],
  ['RED = action required (confirmed defect; needs a fix)', RED],
  ['YELLOW = confirmation required (behaves as reported; by-design / product decision needed)', YELLOW],
  ['GREEN = issue no longer present upon retesting', GREEN],
  ['(blank) = not part of the red/yellow/green pass (enablement request / internal notes)', null],
];

const SUMMARY = [
  'Test run summary',
  'This tracker lists 5 Corporate Pricing items raised by our testing: 1 confirmed defect (A1), 3 product/UX questions awaiting your answer (C1–C3), and 1 testability request (D1). Every item was re-checked live on the current site on 2026-06-09. A1 needs a fix; the 3 questions await a product decision; the testability request is enablement only.',
  'Automated coverage for Corporate Pricing spans the Search page, the Pricebook Details page (both the Pricing Strategy and Pricing Detail tabs), the New Pricebook create flow, the Product Group Override screen, and the Search Export/Import toolbar. These checks run against the current site and pass.',
  'Each item above was checked on the current site before being listed. Corporate Pricing is a new module with no equivalent on the previous Navigator version, so there is no older site to compare against; the written feature spec is used as the reference for intended behaviour, and anything we could not resolve from it is raised above as a question.',
  'Not yet covered / paused: the full file-content round-trip for Export/Import — the on-screen triggers (the four Export/Import variants) are covered, but the exported/imported file contents depend on that feature stabilising.',
];

async function build() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('tracker-corp-pricing');

  // Legend rows (text + swatch in column A)
  for (const [text, swatch] of LEGEND) {
    const row = ws.addRow([text]);
    if (swatch) row.getCell(1).fill = fill(swatch);
  }
  ws.addRow([]); // blank spacer

  // Header
  ws.addRow(HEADER);

  // Data rows, in declared order (already grouped A -> C -> D; single color tier per group => sort is stable)
  for (const r of ROWS) {
    const row = ws.addRow(['', r.type, r.id, r.area, r.repro, r.observed, r.expected, r.cause ?? '-', r.status]);
    if (r.color) row.getCell(1).fill = fill(r.color);
  }

  ws.addRow([]); // blank spacer
  for (const line of SUMMARY) ws.addRow([line]);

  // Readability: widths + wrap (schema/colors/content unchanged; makes the 9-col sheet usable)
  const widths = [8, 30, 6, 34, 46, 46, 34, 28, 46];
  ws.columns.forEach((c, i) => { c.width = widths[i]; });
  ws.eachRow((row) => {
    row.alignment = { vertical: 'top', wrapText: true };
    row.eachCell((cell) => { /* keep fills intact */ });
  });

  await wb.xlsx.writeFile(OUT);
  console.log('wrote', OUT);
  console.log('rows:', ROWS.length, '(A:', ROWS.filter(r => r.type.startsWith('Product bug')).length,
    'C:', ROWS.filter(r => r.type.startsWith('Product /')).length,
    'D:', ROWS.filter(r => r.type.startsWith('Automation')).length, ')');
}

build().catch((e) => { console.error(e); process.exit(1); });
