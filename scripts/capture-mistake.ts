#!/usr/bin/env ts-node
/**
 * Quick mistake capture: npm run capture:mistake <PREFIX> "<rule>" "<resolution>"
 * Appends to agent-mistakes.md, auto-syncs to agent files + context.
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { SHARED_PATHS } from './shared-types';

const MISTAKES_PATH = SHARED_PATHS.mistakes;

const SECTION_MAP: Record<string, string> = {
  ALL: 'Shared', REQ: 'Requirements', PLN: 'Planner',
  GEN: 'Generator', HLR: 'Healer', AUD: 'Audit', COP: 'Copilot',
};

function main(): void {
  const [prefix, rule, resolution] = process.argv.slice(2);
  if (!prefix || !rule) {
    console.error('Usage: npm run capture:mistake <PREFIX> "<rule>" "<resolution>"');
    console.error('  PREFIX: ALL | REQ | PLN | GEN | HLR | AUD | COP');
    console.error('  Example: npm run capture:mistake REQ "Always use /settings/local-office" "Agent used wrong URL"');
    process.exit(1);
  }

  const section = SECTION_MAP[prefix.toUpperCase()];
  if (!section) { console.error(`[ERR] Unknown prefix: ${prefix}`); process.exit(1); }

  const content = fs.readFileSync(MISTAKES_PATH, 'utf-8');

  // Find highest existing ID for this prefix
  const idPattern = new RegExp(`${prefix.toUpperCase()}-(\\d+)`, 'g');
  let maxId = 0;
  let match: RegExpExecArray | null;
  while ((match = idPattern.exec(content)) !== null) {
    maxId = Math.max(maxId, parseInt(match[1]!, 10));
  }
  const newId = `${prefix.toUpperCase()}-${String(maxId + 1).padStart(3, '0')}`;

  // Find section and append rule
  const sectionHeader = `## ${section}`;
  const sectionIdx = content.indexOf(sectionHeader);
  if (sectionIdx === -1) { console.error(`[ERR] Section not found: ${section}`); process.exit(1); }

  // Find end of table (next ## or end of file)
  const afterSection = content.indexOf('\n## ', sectionIdx + sectionHeader.length);
  const insertAt = afterSection === -1 ? content.length : afterSection;

  const resText = resolution || '\u2014';
  const newRow = `| ${newId} | ${rule} | ${resText} |\n`;
  const newContent = content.slice(0, insertAt) + newRow + content.slice(insertAt);

  fs.writeFileSync(MISTAKES_PATH, newContent, 'utf-8');
  console.log(`[OK] Added ${newId}: ${rule.substring(0, 60)}...`);

  // Auto-sync
  console.log('[SYNC] Running sync pipeline...');
  try {
    execSync('npm run sync:mistakes && npm run build:context && npm run validate:sync', {
      stdio: 'inherit', cwd: path.join(__dirname, '..'),
    });
    console.log(`[DONE] ${newId} synced to agent files and context rebuilt.`);
  } catch {
    console.error('[WARN] Sync failed -- rule added but not propagated. Run manually.');
  }
}

main();
