#!/usr/bin/env ts-node
/**
 * Generator Pre-Run Gate -- R10 programmatic enforcement (iteration cap).
 *
 * Validates that the Generator has not exceeded 2 test runs for a queue item.
 * If 2 runs are exhausted, requires a retry-justification entry in the activity log.
 * Increments generatorRunCount on each valid invocation.
 *
 * Usage: npm run generator:pre-run <queue-item-id>
 * Exit: 0 = run allowed, 1 = blocked
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { QueueFile, FixScope, SHARED_PATHS } from './shared-types';

const MAX_RUNS_WITHOUT_JUSTIFICATION = 2;

/** Category-specific action directives for RCA summary. */
const CATEGORY_DIRECTIVES: Record<string, string> = {
  AUTH: '[STOP] DO NOT touch selectors or test code. Escalate immediately.',
  INFRASTRUCTURE: '[STOP] DO NOT touch selectors or test code. Escalate immediately.',
  NETWORK: '[WARN] Check if API endpoint is down or returning errors. May be env issue.',
  SELECTOR: '[?] Use browser_snapshot to verify selector exists in live DOM.',
  TIMING: '[time] Check page load times. May need waitForLoadState, not timeout increase.',
  APPLICATION: '[WARN] SPA crash or unhandled rejection -- check console errors.',
  DATA: '[WARN] Expected vs received mismatch -- check test data freshness.',
  UNKNOWN: '[info] Unclassified -- review failure-summary.json manually.',
};

function main(): void {
  const itemId = process.argv[2];
  if (!itemId) {
    console.error('Usage: npm run generator:pre-run <queue-item-id>');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Generator Pre-Run Gate (R10 Enforcement)');
  console.log('='.repeat(60));

  // ── §18 Pre-Flight Competency Gate ──
  console.log('\n--- Pre-Flight Competency Gate (§18) ---');
  let preFlightFailed = false;

  // PF-01: Queue file
  if (!fs.existsSync(SHARED_PATHS.queue)) {
    console.error('[HALT] PF-01: Queue file not found at', SHARED_PATHS.queue);
    preFlightFailed = true;
  }

  // PF-02: agent-learnings.md
  const learningsPath = path.join(__dirname, '../specs_planning/agent-learnings.md');
  if (!fs.existsSync(learningsPath)) {
    console.error('[HALT] PF-02: agent-learnings.md not found. R24/R29 compliance impossible.');
    preFlightFailed = true;
  }

  // PF-03: agent-mistakes.md
  const mistakesPath = path.join(__dirname, '../specs_planning/agent-mistakes.md');
  if (!fs.existsSync(mistakesPath)) {
    console.error('[HALT] PF-03: agent-mistakes.md not found. R5 compliance impossible.');
    preFlightFailed = true;
  }

  // PF-04: activity log
  if (!fs.existsSync(SHARED_PATHS.activityLog)) {
    console.warn('[WARN] PF-04: agent-activity-log.md not found. Will be created on first write.');
  }

  // PF-05: BASE_URL in config
  const envDir = path.join(__dirname, '../config/environments');
  if (fs.existsSync(envDir)) {
    const envFiles = fs.readdirSync(envDir).filter(f => f.startsWith('.env'));
    const hasBaseUrl = envFiles.some(f => {
      const content = fs.readFileSync(path.join(envDir, f), 'utf-8');
      return content.includes('BASE_URL');
    });
    if (!hasBaseUrl) {
      console.error('[HALT] PF-05: No BASE_URL found in any config/environments/.env.* file.');
      preFlightFailed = true;
    }
  } else {
    console.error('[HALT] PF-05: config/environments/ directory not found.');
    preFlightFailed = true;
  }

  // PF-G2: fixtures.ts
  const fixturesPath = path.join(__dirname, '../tests/setup/fixtures.ts');
  if (!fs.existsSync(fixturesPath)) {
    console.error('[HALT] PF-G2: tests/setup/fixtures.ts not found. All tests will fail.');
    preFlightFailed = true;
  }

  // PF-G3: selectors index
  const selectorsPath = path.join(__dirname, '../src/selectors/index.ts');
  if (!fs.existsSync(selectorsPath)) {
    console.error('[HALT] PF-G3: src/selectors/index.ts not found. No selectors available.');
    preFlightFailed = true;
  }

  // PF-G4: test data dir
  const testDataDir = path.join(__dirname, '../tests/test-data');
  if (!fs.existsSync(testDataDir)) {
    console.warn('[WARN] PF-G4: tests/test-data/ directory not found. May need to create for data-driven tests.');
  }

  // PF-G1: TypeScript compiles (S18 -- HALT if compilation errors exist)
  try {
    execSync('npx tsc --noEmit --project tsconfig.json', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      timeout: 60_000,
    });
    console.log('[OK] PF-G1: TypeScript compilation passed.');
  } catch (tscError: unknown) {
    const stderr = (tscError as { stderr?: Buffer })?.stderr?.toString() ?? '';
    const errorLines = stderr.split('\n').filter((l: string) => l.trim()).slice(0, 5);
    console.error('[HALT] PF-G1: TypeScript does not compile. Fix compilation errors before generating tests.');
    for (const line of errorLines) {
      console.error(`  ${line}`);
    }
    preFlightFailed = true;
  }

  // PF-06: Own performance entry
  const perfPath = path.join(__dirname, '../specs_planning/agent-performance.json');
  if (fs.existsSync(perfPath)) {
    try {
      const perfData = JSON.parse(fs.readFileSync(perfPath, 'utf-8'));
      const genPerf = perfData.agents?.generator;
      if (genPerf) {
        console.log(`[INFO] Trust level: ${genPerf.trustLevel}`);
        console.log(`[INFO] Clean cycles: ${genPerf.cleanCycles}`);
        console.log(`[INFO] Total defects: ${genPerf.defects?.length ?? 0}`);
        const maturity = genPerf.maturityIndicators?.maturityScore ?? 0;
        console.log(`[INFO] Maturity score: ${maturity}/100`);

        // Surface top defect patterns as personal watch list
        const defects = (genPerf.defects ?? []) as Array<{ description: string; severity: string; resolved: boolean }>;
        const unresolved = defects.filter((d: { resolved: boolean }) => !d.resolved);
        if (unresolved.length > 0) {
          console.log(`[WATCH] ${unresolved.length} UNRESOLVED defect(s) from prior runs:`);
          for (const d of unresolved.slice(0, 3)) {
            console.log(`  -> [${(d as { severity: string }).severity}] ${(d as { description: string }).description.substring(0, 100)}`);
          }
          console.log('[WATCH] Review these BEFORE starting work. Do NOT repeat these patterns.');
        }

        // Learning debt warning
        const debt = genPerf.learningDebt ?? 0;
        if (debt > 0) {
          console.log(`[DEBT] Learning debt: ${debt} session(s) with retries but no learnings.`);
          console.log('[DEBT] Learning capture is your #1 priority this session.');
        }

        // Defect recurrence warning
        const recurrence = genPerf.maturityIndicators?.defectRecurrenceRate ?? 0;
        if (recurrence > 0) {
          console.log(`[RECUR] Defect recurrence rate: ${(recurrence * 100).toFixed(0)}%. You have hit known patterns again.`);
          console.log('[RECUR] Search agent-learnings.md for matching LRN entries and apply them proactively.');
        }
      } else {
        console.warn('[WARN] PF-06: No generator entry in agent-performance.json.');
      }
    } catch (e) {
      console.warn(`[WARN] PF-06: Could not parse agent-performance.json: ${e}`);
    }
  }

  if (preFlightFailed) {
    console.error('\n[HALT] Pre-flight competency gate FAILED. Fix the issues above before proceeding.');
    process.exit(1);
  }
  console.log('[OK] Pre-flight competency gate passed.\n');

  // Load queue
  if (!fs.existsSync(SHARED_PATHS.queue)) {
    console.error('[ERR] Queue file not found');
    process.exit(1);
  }

  const queue: QueueFile = JSON.parse(fs.readFileSync(SHARED_PATHS.queue, 'utf-8'));
  const item = queue.queue.find(q => q.id === itemId);

  if (!item) {
    console.error(`[ERR] Queue item not found: ${itemId}`);
    process.exit(1);
  }

  // ── Audit enforcement gate: blocked items cannot proceed ──
  if (item.blocked === true && item.auditCleared !== true) {
    console.error(`\n[HALT] Item ${item.id} is BLOCKED by ${item.blockedBy || 'unknown'}.`);
    if (item.blockedReason) {
      console.error(`  Reason: ${item.blockedReason}`);
    }
    console.error('  Resolution: Request audit review (@playwright-pipeline-audit) to clear the block.');
    console.error('  Set auditCleared=true on the queue item after audit review.');
    process.exit(1);
  }

  const currentCount = (item.generatorRunCount as number) ?? 0;
  console.log(`\n[#] Item: ${item.id} (stage: ${item.stage})`);
  console.log(`   Current run count: ${currentCount}`);

  // Check if run is allowed
  if (currentCount >= MAX_RUNS_WITHOUT_JUSTIFICATION) {
    // Check activity log for retry-justification
    if (!fs.existsSync(SHARED_PATHS.activityLog)) {
      console.error(`\n[ERR] BLOCKED: ${MAX_RUNS_WITHOUT_JUSTIFICATION} runs exhausted and no activity log found.`);
      process.exit(1);
    }

    const logContent = fs.readFileSync(SHARED_PATHS.activityLog, 'utf-8').toLowerCase();
    const itemIdLower = itemId.toLowerCase();

    const hasJustification =
      logContent.includes(itemIdLower) &&
      logContent.includes('generator') &&
      logContent.includes('retry-justification');

    if (!hasJustification) {
      console.error(`\n[ERR] BLOCKED: ${MAX_RUNS_WITHOUT_JUSTIFICATION} runs exhausted for "${itemId}".`);
      console.error('   Log a retry-justification entry in agent-activity-log.md first.');
      console.error('   Format: | timestamp | generator | retry-justification | reason for retry | item-id |');
      process.exit(1);
    }

    console.log('   [OK] Retry justification found in activity log -- allowing additional run');
  }

  // Increment run count
  item.generatorRunCount = currentCount + 1;
  item.sessionStartedAt = new Date().toISOString();

  // ── R25 consumption check (SOFT) ──
  // Verify agent loaded injectedContext. Look for a "context-loaded" action
  // in the activity log within the last 30 minutes for this item.
  if (fs.existsSync(SHARED_PATHS.activityLog)) {
    const logContent = fs.readFileSync(SHARED_PATHS.activityLog, 'utf-8');
    const lines = logContent.split('\n');
    const itemIdLower = itemId.toLowerCase();
    const now = Date.now();
    const thirtyMinAgo = now - 30 * 60 * 1000;

    let hasRecentContextLoad = false;
    for (const line of lines) {
      if (!line.toLowerCase().includes(itemIdLower)) continue;
      if (!line.toLowerCase().includes('context-loaded') && !line.toLowerCase().includes('context loaded') && !line.toLowerCase().includes('r25')) continue;

      // Try to extract timestamp from table row: | 2026-02-26T... | ...
      const tsMatch = line.match(/\|\s*(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\s*\|/);
      if (tsMatch?.[1]) {
        const ts = new Date(tsMatch[1]).getTime();
        if (ts >= thirtyMinAgo) {
          hasRecentContextLoad = true;
          break;
        }
      }
    }

    if (!hasRecentContextLoad) {
      console.warn('');
      console.warn('[WARN]  R25 WARNING: No recent "context-loaded" entry found in activity log for this item.');
      console.warn('   Generator MUST read injectedContext before starting work (R25).');
      console.warn('   Log format: | timestamp | generator | context-loaded | Read injectedContext for <item-id> | <item-id> |');
      console.warn('');
    }
  }

  // ── Failure data auto-population (Step 6) + B1: Enhanced RCA Summary ──
  const failureSummaryPath = path.join(__dirname, '../reports/failure-summary.json');
  const specFiles = item.artifacts?.specFiles;
  const specExists = specFiles && Array.isArray(specFiles) && specFiles.length > 0 &&
    specFiles.some(f => fs.existsSync(path.isAbsolute(f) ? f : path.join(__dirname, '..', f)));

  if (fs.existsSync(failureSummaryPath)) {
    try {
      const failureData = JSON.parse(fs.readFileSync(failureSummaryPath, 'utf-8'));
      const failures: Array<{
        testName?: string;
        failureCategory?: string;
        networkFailures?: Array<{ url: string; status: number }>;
        authChain?: Array<{ url: string; status: number }>;
        consoleErrors?: Array<{ type: string; text: string }>;
        screenshotPath?: string | null;
        tracePath?: string | null;
        urlBreadcrumbs?: Array<{ url: string; timestamp: string }>;
      }> = failureData.failures ?? [];
      const failedTestIds: string[] = failures
        .map(f => f.testName ?? '')
        .filter(Boolean);

      // Build failure category counts
      const failureCategories: Record<string, number> = {};
      for (const f of failures) {
        const cat = f.failureCategory ?? 'UNKNOWN';
        failureCategories[cat] = (failureCategories[cat] ?? 0) + 1;
      }

      const fixScope: FixScope = {
        failedTestIds,
        failureSummaryPath: 'reports/failure-summary.json',
        description: 'Auto-populated from previous test run',
        failureCategories,
      };
      item.fixScope = fixScope;
      console.log(`   [#] Populated fixScope with ${failedTestIds.length} failed test(s)`);

      // ── B1: Formatted RCA Summary ──
      console.log('');
      console.log('=== RCA DATA AVAILABLE ===');
      console.log(`Failed tests: ${failedTestIds.length}`);

      const catEntries = Object.entries(failureCategories);
      if (catEntries.length > 0) {
        console.log(`Categories: ${catEntries.map(([k, v]) => `${k} (${v})`).join(', ')}`);
      }

      // Network failures summary
      const allNetworkFailures = failures.flatMap(f => f.networkFailures ?? []).filter(n => n.status >= 400);
      if (allNetworkFailures.length > 0) {
        console.log('Network failures:');
        const seen = new Set<string>();
        for (const n of allNetworkFailures) {
          const key = `${new URL(n.url).hostname} -> ${n.status}`;
          if (!seen.has(key)) {
            seen.add(key);
            console.log(`  - ${key}`);
          }
        }
      }

      // Auth chain issues
      const authIssues = failures.flatMap(f => f.authChain ?? []).filter(a => a.status >= 400);
      if (authIssues.length > 0) {
        console.log(`Auth chain issues: ${authIssues.map(a => `${new URL(a.url).pathname} -> ${a.status}`).join(', ')}`);
      }

      // Console errors count
      const consoleErrCount = failures.reduce((sum, f) => sum + (f.consoleErrors?.filter(e => e.type === 'error').length ?? 0), 0);
      if (consoleErrCount > 0) {
        console.log(`Console errors: ${consoleErrCount}`);
      }

      // ── C4: Surface artifact paths (screenshot, trace, DOM snippet) ──
      const artifactPaths: string[] = [];
      for (const f of failures) {
        if (f.screenshotPath) artifactPaths.push(`[screenshot] ${f.testName}: ${f.screenshotPath}`);
        if (f.tracePath) artifactPaths.push(`[trace] ${f.testName}: ${f.tracePath}`);
      }
      if (artifactPaths.length > 0) {
        console.log('Artifacts:');
        for (const a of artifactPaths) console.log(`  ${a}`);
      }

      // URL breadcrumbs summary (navigation history per failure)
      const failuresWithBreadcrumbs = failures.filter(f => f.urlBreadcrumbs && f.urlBreadcrumbs.length > 0);
      if (failuresWithBreadcrumbs.length > 0) {
        console.log('URL breadcrumbs:');
        for (const f of failuresWithBreadcrumbs) {
          const steps = f.urlBreadcrumbs!.map((b: { url: string }) => new URL(b.url).pathname).join(' -> ');
          console.log(`  ${f.testName}: ${steps}`);
        }
      }

      // Category-specific directives
      console.log('');
      for (const cat of Object.keys(failureCategories)) {
        const directive = CATEGORY_DIRECTIVES[cat];
        if (directive) console.log(directive);
      }

      // Surface removedCoverage
      const removedCoverage = (item.removedCoverage as string[]) ?? [];
      if (removedCoverage.length > 0) {
        console.log(`[WARN] ${removedCoverage.length} TCs previously removed: ${removedCoverage.join(', ')}`);
      }

      console.log('[WARN] Write reports/fix-diagnosis-<feature>.md BEFORE making code changes.');
      console.log('[WARN] S15 Phase A: Complete ALL 14 evidence checklist items BEFORE editing code.');
      console.log('[WARN] MANDATORY: Replicate failure in MCP browser (A13) + evaluate selector in live DOM (A14).');

      // Surface matching learnings for current failure categories (S9A enforcement)
      const learningsPath = path.join(__dirname, '../specs_planning/agent-learnings.md');
      if (fs.existsSync(learningsPath)) {
        const learningsContent = fs.readFileSync(learningsPath, 'utf-8');
        const matchingLearnings: string[] = [];
        for (const cat of Object.keys(failureCategories)) {
          const regex = new RegExp(`\\| LRN-\\d+ \\| ${cat}`, 'gi');
          const matches = learningsContent.match(regex);
          if (matches) matchingLearnings.push(...matches);
        }
        if (matchingLearnings.length > 0) {
          console.log(`[LEARN] ${matchingLearnings.length} prior learnings match your failure categories:`);
          for (const m of matchingLearnings.slice(0, 5)) {
            // Extract the LRN ID
            const idMatch = m.match(/LRN-\d+/);
            if (idMatch) {
              // Find the full line for this LRN ID
              const fullLine = learningsContent.split('\n').find(l => l.includes(idMatch[0]));
              if (fullLine) {
                const cols = fullLine.split('|').map(c => c.trim()).filter(Boolean);
                console.log(`  -> ${cols[0]}: ${cols[2]?.substring(0, 80) ?? ''}`);
              }
            }
          }
          console.log('[LEARN] READ these learnings BEFORE retrying. Apply known solutions first (R24/S9A).');
        } else {
          console.log('[LEARN] No prior learnings match current failure categories. Novel failures detected.');
          console.log('[LEARN] YOU MUST log learnings during this session (S9C). Gate 19 will verify.');
        }

        // Learning debt warning
        const currentRunCount = (item.generatorRunCount as number) ?? 0;
        if (currentRunCount >= 2) {
          const today = new Date().toISOString().slice(0, 10);
          const todayLearnings = learningsContent.split('\n').filter(l =>
            l.startsWith('| LRN-') && l.toLowerCase().includes('generator') && l.includes(today)
          );
          if (todayLearnings.length === 0) {
            console.log(`[DEBT] LEARNING DEBT: Run #${currentRunCount} with 0 learnings logged today.`);
            console.log('[DEBT] Gate 19 will BLOCK post-complete until you log learnings. Do it NOW, not later.');
          }
        }
      }

      console.log('===========================');
    } catch (e) {
      console.warn(`   [WARN] Could not parse failure-summary.json: ${e}`);
    }
  } else if (specExists) {
    console.warn('   [WARN] DIAGNOSE MODE: Spec exists but no failure data. Run tests first to generate failure-summary.json before making code changes.');
  }

  // Save updated queue
  queue.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SHARED_PATHS.queue, JSON.stringify(queue, null, 2) + '\n');

  console.log(`   Run count updated: ${currentCount} -> ${item.generatorRunCount}`);

  // ── Selector catalog regeneration ──
  console.log('   [~] Regenerating selector catalog...');
  try {
    execSync('npm run selectors:catalog', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
    console.log('   [OK] Selector catalog regenerated');
  } catch (e) {
    console.warn(`   [WARN] Catalog regeneration failed (non-blocking): ${e}`);
  }

  // ── Context rebuild (Step 6) ──
  console.log('   [~] Rebuilding injectedContext...');
  try {
    execSync(`npm run build:context -- ${itemId}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
    console.log('   [OK] injectedContext rebuilt with fresh data');
  } catch (e) {
    console.warn(`   [WARN] Context rebuild failed (non-blocking): ${e}`);
  }

  // ── F3: FIXME Registry scan ──
  console.log('   [~] Scanning FIXME registry...');
  try {
    execSync('npm run fixme:scan', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
    const fixmeRegistryPath = path.join(__dirname, '../reports/fixme-registry.json');
    if (fs.existsSync(fixmeRegistryPath)) {
      const fixmes = JSON.parse(fs.readFileSync(fixmeRegistryPath, 'utf-8'));
      if (Array.isArray(fixmes) && fixmes.length > 0) {
        const catCounts: Record<string, number> = {};
        for (const f of fixmes) {
          const cat = f.category ?? 'UNKNOWN';
          catCounts[cat] = (catCounts[cat] ?? 0) + 1;
        }
        const catSummary = Object.entries(catCounts).map(([k, v]) => `${v} ${k}`).join(', ');
        console.log(`   [#] FIXME Registry: ${fixmes.length} TCs blocked (${catSummary})`);
      } else {
        console.log('   [OK] FIXME Registry: 0 blocked TCs');
      }
    }
  } catch (e) {
    console.warn(`   [WARN] FIXME scan failed (non-blocking): ${e}`);
  }

  // ── H2: TC Registry build ──
  console.log('   [~] Building TC registry...');
  try {
    execSync('npm run registry:build', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
    const registryPath = path.join(__dirname, '../specs_planning/test-id-registry.json');
    if (fs.existsSync(registryPath)) {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      if (Array.isArray(registry)) {
        const dups = registry.filter((r: { duplicateOf?: string | null }) => r.duplicateOf);
        console.log(`   [#] TC Registry: ${registry.length} TCs on disk, ${dups.length} duplicates`);
        for (const d of dups) {
          console.log(`   [WARN] DUPLICATE: ${d.tcId} also in ${d.duplicateOf}`);
        }
      }
    }
  } catch (e) {
    console.warn(`   [WARN] TC registry build failed (non-blocking): ${e}`);
  }

  console.log(`\n[OK] Run allowed -- proceeding to test execution`);
  process.exit(0);
}

main();
