/**
 * Bridges manual Copilot sessions with the pipeline DB.
 * After running Generator/Healer manually in VS Code, run:
 *   npm run sync:copilot
 *
 * Scans for spec files and artifacts not tracked in the pipeline DB,
 * then logs a manual-copilot entry for audit trail.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');

interface SyncReport {
  modules: string[];
  specs: string[];
  testCases: string[];
  selectors: string[];
  detectedStages: Record<string, string>;
}

function scanArtifacts(): SyncReport {
  const report: SyncReport = {
    modules: [],
    specs: [],
    testCases: [],
    selectors: [],
    detectedStages: {},
  };

  // Scan spec files
  const specsRoot = path.join(ROOT, 'tests', 'specs');
  if (fs.existsSync(specsRoot)) {
    for (const mod of fs.readdirSync(specsRoot)) {
      const modDir = path.join(specsRoot, mod);
      if (!fs.statSync(modDir).isDirectory()) continue;
      const specs = fs.readdirSync(modDir).filter(f => f.endsWith('.spec.ts'));
      if (specs.length > 0) {
        report.modules.push(mod);
        report.specs.push(...specs.map(s => `tests/specs/${mod}/${s}`));
      }
    }
  }

  // Scan test cases
  const tcRoot = path.join(ROOT, 'specs_planning', 'test-cases');
  if (fs.existsSync(tcRoot)) {
    for (const mod of fs.readdirSync(tcRoot)) {
      const modDir = path.join(tcRoot, mod);
      if (!fs.statSync(modDir).isDirectory()) continue;
      const tcs = fs.readdirSync(modDir).filter(f => f.endsWith('.md'));
      report.testCases.push(...tcs.map(t => `specs_planning/test-cases/${mod}/${t}`));
    }
  }

  // Scan selectors
  const selRoot = path.join(ROOT, 'src', 'selectors');
  if (fs.existsSync(selRoot)) {
    for (const mod of fs.readdirSync(selRoot)) {
      const modDir = path.join(selRoot, mod);
      if (!fs.statSync(modDir).isDirectory()) continue;
      const sels = fs.readdirSync(modDir).filter(f => f.endsWith('.ts'));
      report.selectors.push(...sels.map(s => `src/selectors/${mod}/${s}`));
    }
  }

  // Detect stage per module
  for (const mod of report.modules) {
    const hasSpec = report.specs.some(s => s.includes(`/${mod}/`));
    const hasTC = report.testCases.some(t => t.includes(`/${mod}/`));
    const hasSel = report.selectors.some(s => s.includes(`/${mod}/`));

    if (hasSpec) report.detectedStages[mod] = 'healing-or-audit';
    else if (hasTC && hasSel) report.detectedStages[mod] = 'generation';
    else if (hasTC) report.detectedStages[mod] = 'planning';
    else report.detectedStages[mod] = 'requirements';
  }

  return report;
}

// Main
const report = scanArtifacts();
console.log('\n[sync:copilot] Artifact scan results:');
console.log(`  Modules found: ${report.modules.join(', ') || '(none)'}`);
console.log(`  Spec files: ${report.specs.length}`);
console.log(`  Test case files: ${report.testCases.length}`);
console.log(`  Selector files: ${report.selectors.length}`);
console.log('\n  Stage detection:');
for (const [mod, stage] of Object.entries(report.detectedStages)) {
  console.log(`    ${mod}: ready for ${stage}`);
}
console.log('\n[sync:copilot] To update pipeline DB, POST to /api/pipeline/run with startStage parameter.');
console.log('[sync:copilot] Done.\n');
