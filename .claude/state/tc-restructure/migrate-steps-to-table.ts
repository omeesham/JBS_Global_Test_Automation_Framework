/**
 * One-time migration: convert inline numbered step lists to pipe-table format.
 * Lives in .claude/state/ per PLAN_59 D15 (single-use, not permanent scripts/).
 *
 * Uses the EXISTING tokenizer (splitNumberedSteps + parseSteps) per D11
 * to guarantee post-migration row counts match the pre-migration exporter output.
 */
import * as fs from 'fs';
import * as path from 'path';
import { splitNumberedSteps, parseSteps } from '../../../export_test_cases/testrail-format';

const MD_ROOT = path.resolve(__dirname, '../../../clients/encore/specs_planning/test-cases/setup');

// D14 / DO NOT TOUCH: corporate_pricing_override_test_cases.md is owned by a parallel worker.
const EXCLUDED = 'corporate_pricing_override_test_cases.md';

function walkMd(dir: string): string[] {
  const acc: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_internal') continue;
      acc.push(...walkMd(full));
    } else if (entry.isFile() && entry.name.endsWith('_test_cases.md')) {
      if (entry.name === EXCLUDED) {
        console.log(`  SKIP (excluded): ${entry.name}`);
        continue;
      }
      acc.push(full);
    }
  }
  return acc;
}

function migrateFile(filePath: string): number {
  let content = fs.readFileSync(filePath, 'utf-8');
  let tcCount = 0;

  content = content.replace(
    /(\*\*Steps\*\*:[ \t]*\n?)([\s\S]*?)(?=\n\*\*Expected\*\*:|\n\*\*Steps \(Human\)\*\*:|\n\*\*Data\*\*:|\n\*\*Notes\*\*:|\n---|\n##|$)/g,
    (_match, _prefix, stepsText) => {
      const trimmed = stepsText.trim();
      if (!trimmed || trimmed.startsWith('| # |')) return _match; // empty or already migrated

      // D11: use the existing tokenizer chain — splitNumberedSteps normalizes
      // same-line numbered lists to one-per-line, then parseSteps strips
      // prefixes and splits semicolon compounds into atomic actions.
      const normalized = splitNumberedSteps(trimmed).join('\n');
      const atomicSteps = parseSteps(normalized);
      if (atomicSteps.length === 0) return _match;

      tcCount++;
      const tableLines = [
        '| # | Step | Expected Result |',
        '|---|------|-----------------|',
        ...atomicSteps.map((step, i) =>
          `| ${i + 1} | ${step.replace(/\|/g, '\\|')} |  |`,
        ),
      ];
      return `**Steps**:\n${tableLines.join('\n')}\n`;
    },
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  return tcCount;
}

// ── main ──
const files = walkMd(MD_ROOT);
console.log(`Found ${files.length} TC markdown files (excluded: ${EXCLUDED})`);
let totalTcs = 0;
for (const f of files) {
  const n = migrateFile(f);
  const rel = path.relative(MD_ROOT, f);
  console.log(`  ${rel}: ${n} TCs migrated`);
  totalTcs += n;
}
console.log(`\nMigrated ${files.length} files, ${totalTcs} total TCs converted`);
