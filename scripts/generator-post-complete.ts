#!/usr/bin/env ts-node
/**
 * Generator Post-Complete Gate -- validates spec output before stage transition.
 *
 * Hard gates (no --force bypass):
 * 1. selfAuditPassed must be true
 * 2. Self-audit history entry must exist (not just the flag)
 * 3. Activity log entry must exist for this item
 * 4. Spec file must exist at artifacts.specFiles path
 * 5. Spec file must have // spec: and // seed: headers
 * 6. No test.fixme() calls in spec (GEN-018)
 * 8. L1:0->L2:0->L3:0 on 3+ artifacts rejected (ALL-009)
 * 9. Test-pass verification: failure-summary.json must show failed=0, passed>0,
 *    AND timestamp must be newer than sessionStartedAt (freshness check)
 * 10. Fix-diagnosis file required on fix runs (freshness-checked + S12 RCA evidence checklist validation)
 * 11. TypeScript compilation must pass (npx tsc --noEmit) -- COP-009
 * 12. validate:sync must pass (no agent sync drift)
 *
 * Soft checks (warnings):
 * 13. No inline selectors detected
 * 14. No waitForTimeout in spec file
 * 15. TC coverage ratio with unclassified Manual TCs (GEN-042)
 * 16. Self-audit reconciliation table presence
 * 17. Mid-work/halt-and-learn capture required on multi-retry sessions (ALL-004, HARD)
 * 18. Spec line count advisory (GEN-019) -- warn if not data-driven, never block
 * 19. Learning yield: sessions with retries must have learning entries (§8 Session Protocol)
 * 20. Learning quality: learning entries must have non-empty Trigger, Root Cause, Solution (§9D)
 *
 * Usage: npm run generator:post-complete [queue-item-id]
 * Exit: 0 = passed, 1 = blocked
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { QueueItem, QueueFile, SHARED_PATHS } from './shared-types';
import {
  GateResult,
  validateSelfAuditBase,
  runValidateSyncGate,
} from './validation-gates';
import { addCycleEntry } from './agent-metrics';

// No hard line limit -- specs can be any length as long as framework patterns are followed.
// GEN-019 advisory: warn if spec is large without data-driven grouping.
const SPEC_ADVISORY_LINES = 300;

function validateSelfAudit(item: QueueItem): GateResult {
  // Start with shared base validation (flag + history entry)
  const base = validateSelfAuditBase(item);
  const errors = [...base.errors];
  const warnings = [...base.warnings];

  // ALL-009 enforcement: L1:0->L2:0->L3:0 on 3+ artifacts = statistical impossibility
  if (item.selfAuditPassed) {
    const selfAuditEntry = (item.history ?? []).find(
      h => h.action === 'self-audit' || (h.notes ?? '').toLowerCase().includes('self-audit')
    );
    if (selfAuditEntry?.notes) {
      const zeroPattern = /L1\s*[:=]\s*0\D*L2\s*[:=]\s*0\D*L3\s*[:=]\s*0/i;
      if (zeroPattern.test(selfAuditEntry.notes)) {
        const artifactCount = (item.artifacts?.specFiles?.length ?? 0)
          + (item.artifacts?.testCaseFile ? 1 : 0)
          + (item.artifacts?.testPlanFile ? 1 : 0)
          + (item.artifacts?.csvExport ? 1 : 0);
        if (artifactCount >= 3) {
          errors.push(
            `Self-audit logged L1:0->L2:0->L3:0 on a task with ${artifactCount} artifacts -- ` +
            `statistical impossibility (ALL-009). Re-audit with genuine findings.`
          );
        }
      }

      // Reconciliation table presence (soft)
      const pipeRows = selfAuditEntry.notes.split(/\r?\n/).filter(
        l => l.trim().startsWith('|') && l.trim().endsWith('|')
      );
      if (pipeRows.length < 3) {
        warnings.push('Self-audit history lacks reconciliation table (expected >=3 markdown table rows) -- AGENT_SHARED_RULES.md S8 requires it');
      }
    }
  }

  return { passed: errors.length === 0, errors, warnings };
}

function validateActivityLog(item: QueueItem): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(SHARED_PATHS.activityLog)) {
    errors.push('Activity log not found');
    return { passed: false, errors, warnings };
  }

  const logContent = fs.readFileSync(SHARED_PATHS.activityLog, 'utf-8').toLowerCase();
  const searchTerms = [
    item.id.toLowerCase(),
    item.id.replace('location-', '').toLowerCase(),
    (item.feature ?? '').toLowerCase(),
  ].filter(Boolean);

  const generatorMentioned = logContent.includes('generator') && searchTerms.some(t => logContent.includes(t));
  if (!generatorMentioned) {
    errors.push(`No Generator activity log entry found for "${item.id}" -- every task must be logged (ALL-008)`);
  }

  // Step 12: Require action-specific log entries
  const hasGenerateAction = searchTerms.some(t =>
    logContent.includes(t) && (logContent.includes('generate') || logContent.includes('generation') || logContent.includes('spec'))
  );
  if (generatorMentioned && !hasGenerateAction) {
    warnings.push(`Activity log mentions "${item.id}" but no generate/generation/spec action found -- log what you did`);
  }

  // Step 12: If generatorRunCount >= 2, require retry-justification
  const runCount = (item.generatorRunCount as number) ?? 0;
  if (runCount >= 2) {
    const hasJustification = searchTerms.some(t =>
      logContent.includes(t) && logContent.includes('retry-justification')
    );
    if (!hasJustification) {
      errors.push(`generatorRunCount=${runCount} but no retry-justification found in activity log (R10)`);
    }

    // ALL-003 enforcement: generatorRunCount >= 2 requires Generator learning in agent-mistakes.md Resolution column
    if (fs.existsSync(SHARED_PATHS.mistakes)) {
      const mistakesContent = fs.readFileSync(SHARED_PATHS.mistakes, 'utf-8');
      const hasGeneratorResolution = mistakesContent.split('\n').some(line => {
        if (!line.trimStart().startsWith('|')) return false;
        const cells = line.split('|').map(c => c.trim()).filter(Boolean);
        if (cells.length < 3) return false;
        const id = cells[0] ?? '';
        const resolution = cells[cells.length - 1] ?? '';
        return id.startsWith('GEN-') && resolution !== '\u2014' && resolution.length > 5;
      });
      if (!hasGeneratorResolution) {
        errors.push(`generatorRunCount=${runCount} but zero Generator Resolution entries in agent-mistakes.md -- ALL-003 requires logging what you learned from retries`);
      }
    } else {
      errors.push(`generatorRunCount=${runCount} but agent-mistakes.md not found -- ALL-003 requires logging learnings from retries`);
    }
  }
  if (runCount === 0) {
    warnings.push('generatorRunCount is 0/missing -- use npm run generator:pre-run before test execution');
  }

  return { passed: errors.length === 0, errors, warnings };
}

function validateSpecFile(item: QueueItem): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Find spec files
  const specFiles = item.artifacts?.specFiles;
  if (!specFiles || (Array.isArray(specFiles) && specFiles.length === 0)) {
    errors.push('No spec files in artifacts.specFiles -- Generator must set this before completing');
    return { passed: false, errors, warnings };
  }

  const files: string[] = Array.isArray(specFiles) ? specFiles : [specFiles];

  for (const specPath of files) {
    const absPath = path.isAbsolute(specPath) ? specPath : path.join(__dirname, '..', specPath);

    // HARD GATE: file must exist
    if (!fs.existsSync(absPath)) {
      errors.push(`Spec file not found: ${specPath}`);
      continue;
    }

    const content = fs.readFileSync(absPath, 'utf-8');
    const lines = content.split('\n');

    // HARD GATE: must have // spec: and // seed: headers (COP-005)
    const hasSpecHeader = lines.some(l => l.trimStart().startsWith('// spec:'));
    const hasSeedHeader = lines.some(l => l.trimStart().startsWith('// seed:'));
    if (!hasSpecHeader) {
      errors.push(`Missing // spec: header in ${specPath} (COP-005)`);
    }
    if (!hasSeedHeader) {
      errors.push(`Missing // seed: header in ${specPath} (COP-005)`);
    }

    // SOFT ADVISORY: large spec without data-driven patterns (GEN-019)
    if (lines.length > SPEC_ADVISORY_LINES) {
      const hasDataImport = content.includes('.data');
      if (!hasDataImport) {
        warnings.push(`Spec file is ${lines.length} lines without data-driven imports -- consider extracting patterns to .data.ts (GEN-019)`);
      }
    }

    // SOFT: check for inline selectors (not from selectors/index.ts)
    const inlineSelectors = content.match(/page\.(locator|getByRole|getByText|getByTestId|querySelector)\s*\(/g);
    if (inlineSelectors && inlineSelectors.length > 2) {
      warnings.push(`${inlineSelectors.length} potential inline selectors found in ${specPath} -- use page object methods instead (GEN-011)`);
    }

    // SOFT: check for waitForTimeout
    const timeoutMatches = content.match(/waitForTimeout/g);
    if (timeoutMatches) {
      warnings.push(`${timeoutMatches.length}x waitForTimeout found in ${specPath} -- avoid synchronization waits (GEN-008)`);
    }

    // SOFT: check for raw page access via bracket notation
    const bracketAccess = content.match(/\[['"]page['"]\]/g);
    if (bracketAccess) {
      warnings.push(`${bracketAccess.length}x raw page access via bracket notation in ${specPath} -- use page object methods (GEN-007)`);
    }

    // HARD GATE: no test.fixme() allowed (GEN-018)
    const fixmeMatches = content.match(/test\.fixme\(/g);
    if (fixmeMatches && fixmeMatches.length > 0) {
      errors.push(`${fixmeMatches.length} test.fixme() found in spec -- GEN-018 requires omitting tests that can't be automated, not stubbing them. Remove all test.fixme() calls.`);
    }
  }

  return { passed: errors.length === 0, errors, warnings };
}

/**
 * Gate 9 -- Test-pass verification (HARD).
 * Reads failure-summary.json and verifies failed === 0 && passed > 0.
 * Also checks timestamp freshness: report must be newer than sessionStartedAt
 * to prevent stale data from prior sessions passing/blocking the gate.
 * The agent-reporter skips writes when passedCount + failedCount + fixmeCount === 0,
 * so compilation errors leave stale files.
 */
function validateTestPass(item: QueueItem): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const failureSummaryPath = path.join(SHARED_PATHS.reports, 'failure-summary.json');

  if (!fs.existsSync(failureSummaryPath)) {
    errors.push('Gate 9 FAIL: reports/failure-summary.json not found -- run tests before completing');
    return { passed: false, errors, warnings };
  }

  let failureData: { timestamp?: string; passed?: number; failed?: number; fixme?: number };
  try {
    failureData = JSON.parse(fs.readFileSync(failureSummaryPath, 'utf-8'));
  } catch {
    errors.push('Gate 9 FAIL: Could not parse failure-summary.json');
    return { passed: false, errors, warnings };
  }

  // Timestamp freshness check -- report must be from THIS generation session
  const sessionStartedAt = item.sessionStartedAt;
  if (sessionStartedAt && failureData.timestamp) {
    const sessionStart = new Date(sessionStartedAt).getTime();
    const reportTime = new Date(failureData.timestamp).getTime();
    if (reportTime < sessionStart) {
      errors.push(
        `Gate 9 FAIL: failure-summary.json is stale (${failureData.timestamp}) -- ` +
        `older than session start (${sessionStartedAt}). Re-run tests to generate fresh results.`
      );
      return { passed: false, errors, warnings };
    }
  } else if (!failureData.timestamp) {
    errors.push('Gate 9 FAIL: failure-summary.json has no timestamp field');
    return { passed: false, errors, warnings };
  }

  // Verify tests actually passed
  const passed = failureData.passed ?? 0;
  const failed = failureData.failed ?? 0;

  if (failed > 0) {
    errors.push(`Gate 9 FAIL: ${failed} test(s) failed. All tests must pass before completing.`);
  }
  if (passed === 0) {
    errors.push('Gate 9 FAIL: 0 tests passed -- either tests did not run or all were skipped/fixme.');
  }

  if (errors.length === 0) {
    console.log(`  [OK] Gate 9: ${passed} passed, ${failed} failed, report fresh`);
  }

  return { passed: errors.length === 0, errors, warnings };
}

/**
 * Gate 10 -- Fix-diagnosis file (HARD, fix runs only).
 * Enforces that Generator documented RCA before completing a fix run.
 * Checks both existence AND freshness (must be from this session).
 */
function validateFixDiagnosis(item: QueueItem): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Only enforce on fix runs (fixScope.failedTestIds populated)
  const failedIds = item.fixScope?.failedTestIds;
  if (!failedIds || failedIds.length === 0) {
    return { passed: true, errors, warnings };
  }

  const reportsDir = SHARED_PATHS.reports;
  if (!fs.existsSync(reportsDir)) {
    errors.push('Gate 10 FAIL: reports/ directory not found.');
    return { passed: false, errors, warnings };
  }

  const diagFiles = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith('fix-diagnosis-') && f.endsWith('.md'));

  if (diagFiles.length === 0) {
    errors.push('Gate 10 FAIL: No fix-diagnosis file found. Generator must document RCA before completing. Write: reports/fix-diagnosis-<feature>.md');
    return { passed: false, errors, warnings };
  }

  // Stale file check -- diagnosis must be from THIS session, not a prior run
  const sessionStartedAt = item.sessionStartedAt;
  if (sessionStartedAt) {
    const sessionStart = new Date(sessionStartedAt).getTime();
    const allStale = diagFiles.every(f => {
      const stat = fs.statSync(path.join(reportsDir, f));
      return stat.mtimeMs < sessionStart;
    });
    if (allStale) {
      errors.push(`Gate 10 FAIL: fix-diagnosis file is stale (from a prior session). Session started: ${sessionStartedAt}. Write a NEW fix-diagnosis for this session's failures.`);
      return { passed: false, errors, warnings };
    }
  }

  // ---- Content validation (S12: evidence checklist gate) ----
  // Find the freshest diagnosis file for content checks
  const sortedDiagFiles = [...diagFiles].sort((a, b) => {
    const statA = fs.statSync(path.join(reportsDir, a));
    const statB = fs.statSync(path.join(reportsDir, b));
    return statB.mtimeMs - statA.mtimeMs;
  });
  const diagContent = fs.readFileSync(path.join(reportsDir, sortedDiagFiles[0]!), 'utf-8');

  // HARD GATE: Evidence Checklist section must exist
  if (!diagContent.includes('## Evidence Checklist')) {
    errors.push('Gate 10 FAIL: fix-diagnosis missing "## Evidence Checklist" section. Complete S15 Phase A before fixing.');
  }

  // HARD GATE: Checklist rows must be populated (not blank)
  const checklistRows = diagContent.split('\n').filter(l => /^\|\s*A\d+\s*\|/.test(l));
  const populatedRows = checklistRows.filter(l => {
    const cells = l.split('|').map(c => c.trim());
    return cells.length >= 5 && cells[3] !== '' && cells[4] !== '';
  });
  if (checklistRows.length > 0 && populatedRows.length < 10) {
    errors.push(
      `Gate 10 FAIL: Evidence Checklist has ${populatedRows.length}/${checklistRows.length} rows populated. ` +
      `Minimum 10/14 required (N/A with reason counts as populated).`
    );
  }

  // HARD GATE: Hypothesis Verification must exist
  if (!diagContent.includes('## Hypothesis Verification')) {
    errors.push('Gate 10 FAIL: fix-diagnosis missing "## Hypothesis Verification" section.');
  }

  // HARD GATE: MCP replication (A13) must be checked for SELECTOR/TIMING categories
  const mcpRow = checklistRows.find(l => l.includes('A13'));
  const a1Row = checklistRows.find(l => /^\|\s*A1\s*\|/.test(l));
  const categoryFromA1 = a1Row ? a1Row.toLowerCase() : '';
  const isSelectorOrTiming = categoryFromA1.includes('selector') || categoryFromA1.includes('timing');
  if (mcpRow && isSelectorOrTiming && !mcpRow.toLowerCase().includes('yes')) {
    errors.push('Gate 10 FAIL: A13 (MCP browser replication) not completed. SELECTOR/TIMING failures require MCP replication.');
  }

  return { passed: errors.length === 0, errors, warnings };
}

/**
 * Gate 11 -- TC Registry check (SOFT).
 * Rebuilds registry and verifies queue item's TC IDs appear in spec files.
 */
function validateTcRegistry(item: QueueItem): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    execSync('npm run registry:build', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
  } catch {
    warnings.push('Gate 11: TC registry build failed -- skipping TC presence check');
    return { passed: true, errors, warnings };
  }

  const registryPath = SHARED_PATHS.testIdRegistry;
  if (!fs.existsSync(registryPath)) {
    return { passed: true, errors, warnings };
  }

  try {
    const registry: Array<{ tcId: string }> = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    const onDiskTcIds = new Set(registry.map(r => r.tcId));

    // Check if item has expected TC IDs (from test case files or fixScope)
    const expectedIds = item.fixScope?.failedTestIds ?? [];
    const skippedIds = new Set((item.skippedTcIds as string[]) ?? []);
    const removedIds = new Set((item.removedCoverage as string[]) ?? []);

    for (const tcId of expectedIds) {
      // Extract TC ID from test name (may contain description after the ID)
      const match = tcId.match(/TC-[A-Z]+-[A-Z]+-\d+/);
      const id = match?.[0];
      if (id && !onDiskTcIds.has(id) && !skippedIds.has(id) && !removedIds.has(id)) {
        warnings.push(`Gate 11: ${id} not found in any spec file -- expected from fixScope`);
      }
    }
  } catch {
    warnings.push('Gate 11: Could not parse TC registry');
  }

  return { passed: true, errors, warnings };
}

/**
 * Gate 12 -- TC Coverage check (SOFT).
 * Compares executable test count against total TC count. Warns when
 * coverage is < 40% AND unreviewed Manual TCs remain (GEN-042).
 */
function validateTestCoverage(item: QueueItem): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const tcFile = item.artifacts?.testCaseFile;
  const specFiles = item.artifacts?.specFiles;
  if (!tcFile || !specFiles || specFiles.length === 0) {
    return { passed: true, errors, warnings };
  }

  const tcPath = path.isAbsolute(tcFile) ? tcFile : path.join(__dirname, '..', tcFile);
  if (!fs.existsSync(tcPath)) {
    return { passed: true, errors, warnings };
  }

  const tcContent = fs.readFileSync(tcPath, 'utf-8');

  // Count total TCs (## TC- headers)
  const tcHeaders = tcContent.match(/^## TC-/gm);
  const totalTcs = tcHeaders?.length ?? 0;
  if (totalTcs === 0) {
    return { passed: true, errors, warnings };
  }

  // Count unreviewed Manual TCs
  const manualMatches = tcContent.match(/Status:\s*Manual/gi);
  const manualCount = manualMatches?.length ?? 0;

  // Count executable tests in spec files
  let executableTests = 0;
  for (const sp of specFiles) {
    const absSpec = path.isAbsolute(sp) ? sp : path.join(__dirname, '..', sp);
    if (!fs.existsSync(absSpec)) continue;
    const content = fs.readFileSync(absSpec, 'utf-8');
    const matches = content.match(/\btest\s*\(/g);
    executableTests += matches?.length ?? 0;
  }

  const ratio = totalTcs > 0 ? executableTests / totalTcs : 1;
  if (ratio < 0.4 && manualCount > 0) {
    warnings.push(
      `Coverage: ${executableTests} executable tests / ${totalTcs} total TCs (${Math.round(ratio * 100)}%). ` +
      `${manualCount} TCs still Status:Manual -- GEN-042 requires classifying ALL remaining Manual TCs before marking complete`
    );
  }

  return { passed: true, errors, warnings };
}

/**
 * Gate 19 -- Learning Yield (HARD, sessions with retries).
 * Verifies that agent-mistakes.md has Resolution column entries from Generator.
 * Zero-learning sessions with retries = learning debt = blocked.
 */
function validateLearningYield(item: QueueItem): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const runCount = (item.generatorRunCount as number) ?? 0;
  if (runCount < 2) {
    // First run -- no retries yet, no learning required
    return { passed: true, errors, warnings };
  }

  if (!fs.existsSync(SHARED_PATHS.mistakes)) {
    errors.push('Gate 19 FAIL: agent-mistakes.md not found.');
    return { passed: false, errors, warnings };
  }

  const content = fs.readFileSync(SHARED_PATHS.mistakes, 'utf-8');

  // Count GEN-* rules with non-empty Resolution column (learning captured)
  const generatorResolutions = content.split('\n').filter(line => {
    if (!line.trimStart().startsWith('|')) return false;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 3) return false;
    const id = cells[0] ?? '';
    const resolution = cells[cells.length - 1] ?? '';
    return id.startsWith('GEN-') && resolution !== '\u2014' && resolution.length > 5;
  });

  if (generatorResolutions.length === 0) {
    errors.push(
      `Gate 19 FAIL: Learning debt detected. generatorRunCount=${runCount} (retries occurred) ` +
      `but 0 Generator Resolution entries in agent-mistakes.md. ` +
      `Log at least 1 learning in Resolution column before completing. See S8 Session Protocol.`
    );
    return { passed: false, errors, warnings };
  }

  console.log(`  [OK] Gate 19: ${generatorResolutions.length} Generator Resolution(s) found, runCount=${runCount}`);
  return { passed: true, errors, warnings };
}

/**
 * Gate 20 -- Learning Quality (HARD, when learnings exist).
 * Verifies Generator Resolution column entries in agent-mistakes.md are non-empty
 * and reference specific artifacts (not generic "fixed it" text).
 */
function validateLearningQuality(item: QueueItem): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(SHARED_PATHS.mistakes)) return { passed: true, errors, warnings };

  const content = fs.readFileSync(SHARED_PATHS.mistakes, 'utf-8');

  const generatorResolutions = content.split('\n').filter(line => {
    if (!line.trimStart().startsWith('|')) return false;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 3) return false;
    const id = cells[0] ?? '';
    const resolution = cells[cells.length - 1] ?? '';
    return id.startsWith('GEN-') && resolution !== '\u2014' && resolution.length > 5;
  });

  for (const line of generatorResolutions) {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    // Expected: ID, Rule, Resolution (3 columns in agent-mistakes.md)
    const id = cols[0] ?? 'unknown';
    const resolution = cols[cols.length - 1] ?? '';
    if (resolution.length < 15) {
      errors.push(`Gate 20 FAIL: ${id} has vague Resolution (${resolution.length} chars). Be specific with trigger + root cause + fix.`);
    }
    // Check for generic/filler resolutions
    const genericPatterns = /^(fixed it|done|resolved|updated|changed|n\/a)$/i;
    if (genericPatterns.test(resolution.trim())) {
      errors.push(`Gate 20 FAIL: ${id} Resolution is too generic ("${resolution.trim()}"). Reference specific artifacts.`);
    }
  }

  if (errors.length === 0 && generatorResolutions.length > 0) {
    console.log(`  [OK] Gate 20: ${generatorResolutions.length} Generator Resolution(s) passed quality check`);
  }

  return { passed: errors.length === 0, errors, warnings };
}

function main(): void {
  console.log('='.repeat(60));
  console.log('Generator Post-Complete Gate');
  console.log('='.repeat(60));

  // Load queue
  if (!fs.existsSync(SHARED_PATHS.queue)) {
    console.error('[ERR] Queue file not found');
    process.exit(1);
  }

  const queue: QueueFile = JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8'));

  // Get target item
  const targetId = process.argv.slice(2).find(a => !a.startsWith('--'));
  if (!targetId) {
    // Find items at generation stage locked by generator
    const genItems = queue.queue.filter(i => i.stage === 'generation' && i.lockedBy === 'generator');
    if (genItems.length === 0) {
      console.log('[info]  No items at generation stage locked by generator');
      process.exit(0);
    }
    console.log(`Found ${genItems.length} item(s) at generation stage:\n`);
    for (const item of genItems) {
      runGate(item);
    }
    return;
  }

  const item = queue.queue.find(q => q.id === targetId);
  if (!item) {
    console.error(`[ERR] Queue item not found: ${targetId}`);
    process.exit(1);
  }

  runGate(item);
}

function runGate(item: QueueItem): void {
  console.log(`\n[#] Gating: ${item.id} (stage: ${item.stage})`);

  const selfAudit = validateSelfAudit(item);
  const activityLog = validateActivityLog(item);
  const specFile = validateSpecFile(item);
  const testPass = validateTestPass(item);
  const fixDiagnosis = validateFixDiagnosis(item);
  const tcRegistry = validateTcRegistry(item);
  const coverage = validateTestCoverage(item);

  const allErrors = [
    ...selfAudit.errors, ...activityLog.errors, ...specFile.errors,
    ...testPass.errors, ...fixDiagnosis.errors, ...coverage.errors,
  ];
  const allWarnings = [
    ...selfAudit.warnings, ...activityLog.warnings, ...specFile.warnings,
    ...testPass.warnings, ...fixDiagnosis.warnings, ...tcRegistry.warnings, ...coverage.warnings,
  ];

  // ── Gate: typecheck (HARD) -- enforces COP-009 ──
  try {
    execSync('npx tsc --noEmit', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
    console.log('  [OK] Typecheck passed');
  } catch (e: unknown) {
    const stderr = (e as { stderr?: Buffer })?.stderr?.toString().trim() ?? '';
    const firstLines = stderr.split('\n').slice(0, 5).join('\n');
    allErrors.push(`Typecheck FAIL (COP-009): TypeScript compilation errors.\n${firstLines}`);
  }

  // ── Gate: validate:sync (HARD) -- enforces sync drift detection ──
  const syncResult = runValidateSyncGate();
  if (syncResult.passed) {
    console.log('  [OK] validate:sync passed');
  } else {
    allErrors.push(...syncResult.errors);
  }

  // ── Gate 17: halt-and-learn capture (HARD) -- blocks if retries >= 2 with no halt-and-learn entries ──
  const runCount = (item.generatorRunCount as number) ?? 0;
  if (runCount >= 2) {
    if (fs.existsSync(SHARED_PATHS.activityLog)) {
      const logContent = fs.readFileSync(SHARED_PATHS.activityLog, 'utf-8').toLowerCase();
      const hasHaltAndLearn = (logContent.includes('halt-and-learn') || logContent.includes('mid-work-capture')) &&
        logContent.includes(item.id.toLowerCase());
      if (!hasHaltAndLearn) {
        allErrors.push(
          `Gate 17 FAIL: generatorRunCount=${runCount} but no "halt-and-learn" log entries for ${item.id}. ` +
          `ALL-003/ALL-004 require learning capture during multi-retry sessions. Log learnings, then re-run post-complete.`
        );
      }
    } else {
      allErrors.push('Gate 17 FAIL: agent-activity-log.md not found. Cannot verify learning capture.');
    }
  }

  // ── Gate 19: Learning yield (HARD) ──
  const gate19 = validateLearningYield(item);
  allErrors.push(...gate19.errors);
  allWarnings.push(...gate19.warnings);

  // ── Gate 20: Learning quality (HARD) ──
  const gate20 = validateLearningQuality(item);
  allErrors.push(...gate20.errors);
  allWarnings.push(...gate20.warnings);

  // ── Gate 21: Code quality checks (SOFT — GEN-025/026) ──
  if (item.artifacts?.specFiles && Array.isArray(item.artifacts.specFiles)) {
    for (const specFile of item.artifacts.specFiles as string[]) {
      const specPath = path.isAbsolute(specFile) ? specFile : path.join(__dirname, '..', specFile);
      if (fs.existsSync(specPath)) {
        const specContent = fs.readFileSync(specPath, 'utf-8');
        // GEN-026: Check for waitForTimeout
        if (specContent.includes('waitForTimeout')) {
          allWarnings.push(`Gate 21: waitForTimeout found in ${specFile}. Use proper waits.`);
        }
        // GEN-024: Check for inline CSS selectors
        const inlineSelectors = specContent.match(/page\.\$\(|page\.locator\(/g);
        if (inlineSelectors && inlineSelectors.length > 0) {
          allWarnings.push(`Gate 21: ${inlineSelectors.length} raw page.$/page.locator() calls in ${specFile}. Use page objects.`);
        }
        // GEN-022: Check for duplicate patterns
        const testBlocks = specContent.match(/test\(/g);
        if (testBlocks && testBlocks.length > 15) {
          allWarnings.push(`Gate 21: ${testBlocks.length} test blocks in ${specFile}. Consider data-driven patterns for similar tests.`);
        }
      }
    }
  }

  // ── Time-to-first-test-run metric (Step 14) ──
  if (item.sessionStartedAt) {
    const failureSummaryPath = path.join(SHARED_PATHS.reports, 'failure-summary.json');
    if (fs.existsSync(failureSummaryPath)) {
      try {
        const failureData = JSON.parse(fs.readFileSync(failureSummaryPath, 'utf-8'));
        if (failureData.timestamp) {
          const sessionStart = new Date(item.sessionStartedAt).getTime();
          const firstTestRun = new Date(failureData.timestamp).getTime();
          const deltaMinutes = Math.round((firstTestRun - sessionStart) / 60000);
          if (deltaMinutes > 15) {
            allWarnings.push(`[WARN] Time to first test run: ${deltaMinutes}min (target: <5min for fix, <10min for create). Review MCP usage.`);
          } else {
            console.log(`  [time]  Time to first test run: ${deltaMinutes}min`);
          }
        }
      } catch {
        // Ignore -- non-critical metric
      }
    }
  }

  // POST-ESC: Check if escalations assigned to generator are still open (ALL-036)
  const { checkUnresolvedEscalations } = require('./validation-gates');
  const escWarnings: string[] = checkUnresolvedEscalations('generator');
  allWarnings.push(...escWarnings);

  // Report errors (hard gates)
  for (const err of allErrors) {
    console.error(`  [ERR] ${err}`);
  }

  // Report warnings (soft checks)
  for (const warn of allWarnings) {
    console.warn(`  [WARN]  ${warn}`);
  }

  if (allErrors.length === 0) {
    console.log(`\n  [OK] All gates passed for ${item.id}`);
    if (allWarnings.length > 0) {
      console.log(`     ${allWarnings.length} warning(s) -- review recommended before Audit`);
    }

    // Record clean cycle entry (all hard gates passed = clean, soft warnings don't count as defects)
    try {
      const perfPath = SHARED_PATHS.performance;
      const perf = JSON.parse(fs.readFileSync(perfPath, 'utf-8'));
      addCycleEntry(perf, 'generator', item.feature || item.id, [], 'post-complete-gate');
      perf.lastUpdated = new Date().toISOString();
      fs.writeFileSync(perfPath, JSON.stringify(perf, null, 2), 'utf-8');
      console.log('  [OK] Clean cycle recorded.');
    } catch (err) {
      console.warn(`  [WARN] Could not record cycle entry: ${err instanceof Error ? err.message : err}`);
    }

    // Update performance metrics after successful gate passage
    try {
      execSync('npx ts-node scripts/agent-metrics.ts --update-trust', {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
        timeout: 30_000,
      });
      console.log('  [OK] Agent metrics updated.');
    } catch {
      console.warn('  [WARN] Could not update agent metrics (non-blocking).');
    }
  } else {
    console.error(`\n  [ERR] BLOCKED: ${allErrors.length} gate failure(s) for ${item.id}`);
    console.error(`     Generator must fix all errors before stage transition.`);
    console.error(`     NOTE: There is NO --force bypass for Generator gates.`);
    process.exit(1);
  }
}

main();
