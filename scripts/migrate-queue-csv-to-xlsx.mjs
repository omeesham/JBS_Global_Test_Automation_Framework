#!/usr/bin/env node
/**
 * migrate-queue-csv-to-xlsx.mjs — one-shot rewriter for
 * clients/encore/specs_planning/_internal/agent-queue.json.
 *
 * Per PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION §299:
 *   - 11 active queue items carry a `csvExport` field (path to per-module CSV).
 *     Rewrite → `xlsxArtifact` field pointing at the single workbook.
 *   - 12 history rows carry action='csv_export'. Rewrite → action='xlsx_rebuild'.
 *
 * Created in Phase A (this file lands now); RUN in Phase B (after Phase B's
 * reader/rules cut-over). Phase A does NOT invoke this script — the queue must
 * stay CSV-shaped while the readers are still CSV-based.
 *
 * Usage:
 *   node scripts/migrate-queue-csv-to-xlsx.mjs            # dry-run (default)
 *   node scripts/migrate-queue-csv-to-xlsx.mjs --apply    # write the changes
 *
 * Idempotent: re-running on already-migrated queue is a no-op.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const QUEUE_PATH = join(REPO_ROOT, 'clients', 'encore', 'specs_planning', '_internal', 'agent-queue.json');
const XLSX_RELATIVE = 'clients/encore/test_cases_xlsx/encore_test_cases.xlsx';

function main() {
  const apply = process.argv.includes('--apply');

  if (!existsSync(QUEUE_PATH)) {
    console.error(`[migrate-queue] FAIL — queue file missing at ${path.relative(REPO_ROOT, QUEUE_PATH)}`);
    process.exit(1);
  }

  const text = readFileSync(QUEUE_PATH, 'utf-8');
  let queue;
  try {
    queue = JSON.parse(text);
  } catch (err) {
    console.error('[migrate-queue] FAIL — queue is not valid JSON:', err.message);
    process.exit(1);
  }

  let csvExportRewrites = 0;
  let actionRewrites = 0;

  // 1. Active queue entries — every csvExport → xlsxArtifact
  const entries = Array.isArray(queue) ? queue : (queue.entries ?? queue.items ?? []);
  for (const entry of entries) {
    if (entry && typeof entry === 'object') {
      if ('csvExport' in entry && !('xlsxArtifact' in entry)) {
        delete entry.csvExport;
        entry.xlsxArtifact = XLSX_RELATIVE;
        csvExportRewrites++;
      }
    }
  }

  // 2. History rows — action 'csv_export' → 'xlsx_rebuild'
  const history = (queue && typeof queue === 'object') ? (queue.history ?? []) : [];
  for (const row of history) {
    if (row && typeof row === 'object' && row.action === 'csv_export') {
      row.action = 'xlsx_rebuild';
      actionRewrites++;
    }
  }

  console.log(`[migrate-queue] csvExport → xlsxArtifact   : ${csvExportRewrites} entries`);
  console.log(`[migrate-queue] action csv_export → xlsx_rebuild : ${actionRewrites} history rows`);

  if (csvExportRewrites === 0 && actionRewrites === 0) {
    console.log('[migrate-queue] no changes — queue is already migrated (idempotent no-op)');
    return 0;
  }

  if (!apply) {
    console.log('[migrate-queue] DRY-RUN — pass --apply to write the changes');
    return 0;
  }

  writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n', 'utf-8');
  console.log(`[migrate-queue] APPLIED — wrote ${path.relative(REPO_ROOT, QUEUE_PATH)}`);
  return 0;
}

process.exit(main());
