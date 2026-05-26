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

// ── PF-G5 Canonical Walkthrough normalizer (SP-PWC2-05) ──
// Accepts either .walkthrough.yaml (CLI agents) or .walkthrough.md (Chrome agents);
// emits .walkthrough.canonical.json validated against docs/schemas/walkthrough.canonical.schema.json.

type CanonicalClaimStatus =
  | 'VERIFIED' | 'PASS' | 'FAIL' | 'APP_BUG' | 'PLANNER_GAP' | 'TC_CORRECTION' | 'SEQUENCE_SIDE_EFFECT';

interface CanonicalClaim {
  claim: string;
  status: CanonicalClaimStatus;
  result?: string | null;
  classification?: string | null;
  resolution?: string | null;
  tc_id?: string | null;
  step?: string | null;
  expected?: string | null;
  actual?: string | null;
}

interface CanonicalWalkthrough {
  item_id: string;
  source_tool: 'cli' | 'chrome';
  mcp_session_date: string;
  fields?: Array<Record<string, unknown>>;
  verified_claims: CanonicalClaim[];
  notes?: string[];
}

const CLAIM_STATUS_SET: ReadonlySet<string> = new Set([
  'VERIFIED', 'PASS', 'FAIL', 'APP_BUG', 'PLANNER_GAP', 'TC_CORRECTION', 'SEQUENCE_SIDE_EFFECT',
]);

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Parse the legacy Chrome-authored markdown walkthrough into canonical shape.
 *  Expected table header: | TC | Step | Expected | Actual | Status | Classification |
 *  Rows whose Status is not a known enum value are dropped with a note. */
function parseMdWalkthrough(content: string, itemId: string): CanonicalWalkthrough {
  const lines = content.split('\n');
  const claims: CanonicalClaim[] = [];
  const notes: string[] = [];

  // Find header row
  const headerIdx = lines.findIndex(l =>
    /^\|[^|]*TC[^|]*\|[^|]*Step[^|]*\|[^|]*Expected[^|]*\|[^|]*Actual[^|]*\|[^|]*Status[^|]*\|/i.test(l)
  );

  if (headerIdx >= 0) {
    // Skip header + separator (|---|---|...) rows
    let rowStart = headerIdx + 1;
    while (rowStart < lines.length && /^\|[\s\-:|]+\|?\s*$/.test(lines[rowStart]!)) rowStart++;

    for (let i = rowStart; i < lines.length; i++) {
      const line = lines[i]!;
      if (!line.trimStart().startsWith('|')) continue;
      const cells = line.split('|').map(c => c.trim());
      // cells[0] is empty (leading |), last may be empty too
      const nonEmpty = cells.filter((_, idx) => idx !== 0 && !(idx === cells.length - 1 && cells[idx] === ''));
      if (nonEmpty.length < 5) continue;

      const [tcId, step, expected, actual, statusRaw, classification] = nonEmpty;
      const status = (statusRaw ?? '').toUpperCase();
      if (!CLAIM_STATUS_SET.has(status)) {
        notes.push(`dropped row with unrecognized status "${statusRaw}": ${tcId} / ${step}`);
        continue;
      }

      const claim: CanonicalClaim = {
        claim: [tcId, step].filter(Boolean).join(' / ') || step || tcId || '(unnamed)',
        status: status as CanonicalClaimStatus,
        tc_id: tcId || null,
        step: step || null,
        expected: expected || null,
        actual: actual || null,
        result: actual || null,
        classification: classification || null,
      };

      // Resolution hint — scan the row for ESC-/BUG- refs (LR-034 / ALL-043).
      const joined = line;
      const refMatch = joined.match(/(ESC-[A-Z0-9-]+|BUG-[A-Z0-9-]+|filed|resolved|escalat\w*|corrected)/i);
      if (refMatch) claim.resolution = refMatch[0];

      claims.push(claim);
    }
  } else {
    notes.push('no table header matching GEN-032 pattern found; verified_claims will be empty');
  }

  return {
    item_id: itemId,
    source_tool: 'chrome',
    mcp_session_date: todayIso(),
    verified_claims: claims,
    notes: notes.length > 0 ? notes : undefined,
  };
}

/** Parse agent-authored YAML walkthrough. Expects the top-level document to already
 *  match (or be coercible to) the canonical shape — js-yaml handles JSON-compatible
 *  YAML natively. Raw Playwright accessibility-tree snapshots are NOT walkthroughs;
 *  agents must author a verification document with a `verified_claims` array. */
function parseYamlWalkthrough(content: string, itemId: string): CanonicalWalkthrough {
  let doc: Record<string, unknown>;
  try {
    // Prefer js-yaml when available (transitive dep); fall back to JSON.parse
    // (agents may write JSON-compatible YAML, which is valid YAML).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const yaml = require('js-yaml');
    doc = yaml.load(content) as Record<string, unknown>;
  } catch {
    try {
      doc = JSON.parse(content) as Record<string, unknown>;
    } catch (e) {
      throw new Error(`walkthrough.yaml could not be parsed as YAML or JSON: ${(e as Error).message}`);
    }
  }

  if (!doc || typeof doc !== 'object') {
    throw new Error('walkthrough.yaml root is not an object');
  }

  const rawClaims = Array.isArray(doc.verified_claims) ? doc.verified_claims : [];
  const claims: CanonicalClaim[] = [];
  for (const raw of rawClaims as Array<Record<string, unknown>>) {
    if (!raw || typeof raw !== 'object') continue;
    const status = String(raw.status ?? '').toUpperCase();
    if (!CLAIM_STATUS_SET.has(status)) continue;
    claims.push({
      claim: String(raw.claim ?? raw.step ?? raw.tc_id ?? '(unnamed)'),
      status: status as CanonicalClaimStatus,
      result: (raw.result as string | null | undefined) ?? null,
      classification: (raw.classification as string | null | undefined) ?? null,
      resolution: (raw.resolution as string | null | undefined) ?? null,
      tc_id: (raw.tc_id as string | null | undefined) ?? null,
      step: (raw.step as string | null | undefined) ?? null,
      expected: (raw.expected as string | null | undefined) ?? null,
      actual: (raw.actual as string | null | undefined) ?? null,
    });
  }

  return {
    item_id: String(doc.item_id ?? itemId),
    source_tool: 'cli',
    mcp_session_date: String(doc.mcp_session_date ?? todayIso()),
    fields: Array.isArray(doc.fields) ? (doc.fields as Array<Record<string, unknown>>) : undefined,
    verified_claims: claims,
    notes: Array.isArray(doc.notes) ? (doc.notes as string[]) : undefined,
  };
}

/** Structural validator — mirrors docs/schemas/walkthrough.canonical.schema.json.
 *  Kept hand-rolled (no ajv) so the gate has zero runtime dep surface. */
function validateCanonical(doc: CanonicalWalkthrough): string[] {
  const errors: string[] = [];

  if (!doc.item_id || typeof doc.item_id !== 'string') errors.push('item_id: missing or not a string');
  if (doc.source_tool !== 'cli' && doc.source_tool !== 'chrome') {
    errors.push(`source_tool: must be 'cli' or 'chrome', got '${doc.source_tool}'`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.mcp_session_date || '')) {
    errors.push(`mcp_session_date: must be YYYY-MM-DD, got '${doc.mcp_session_date}'`);
  }
  if (!Array.isArray(doc.verified_claims)) {
    errors.push('verified_claims: missing or not an array');
    return errors;
  }

  const verifiedCount = doc.verified_claims.filter(c => c.status === 'VERIFIED' || c.status === 'PASS').length;
  if (verifiedCount < 3) {
    errors.push(`GEN-029: only ${verifiedCount} VERIFIED/PASS claims found (minimum 3)`);
  }

  for (const [i, c] of doc.verified_claims.entries()) {
    if (!c || typeof c !== 'object') { errors.push(`verified_claims[${i}]: not an object`); continue; }
    if (!c.claim || typeof c.claim !== 'string') errors.push(`verified_claims[${i}].claim: missing`);
    if (!CLAIM_STATUS_SET.has(c.status)) errors.push(`verified_claims[${i}].status: invalid '${c.status}'`);

    if (c.status === 'APP_BUG') {
      const ref = c.resolution || '';
      if (!/(ESC-|BUG-|filed|resolved)/i.test(ref)) {
        errors.push(`GEN-033: verified_claims[${i}] APP_BUG without filed finding (ESC-/BUG- ref required in 'resolution')`);
      }
    }
    if (c.status === 'PLANNER_GAP') {
      const ref = c.resolution || '';
      if (!/(ESC-|escalat|corrected)/i.test(ref)) {
        errors.push(`GEN-033: verified_claims[${i}] PLANNER_GAP without escalation (ESC- ref required in 'resolution')`);
      }
    }
  }

  return errors;
}

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

  // ── §13 Pre-Flight Competency Gate ──
  console.log('\n--- Pre-Flight Competency Gate (§13) ---');
  let preFlightFailed = false;

  // PF-01: Queue file
  if (!fs.existsSync(SHARED_PATHS.queue)) {
    console.error('[HALT] PF-01: Queue file not found at', SHARED_PATHS.queue);
    preFlightFailed = true;
  }

  // PF-02: learning store (agent-mistakes.md Resolution column)
  if (!fs.existsSync(SHARED_PATHS.mistakes)) {
    console.error('[HALT] PF-02: agent-mistakes.md not found. ALL-003/ALL-004 compliance impossible.');
    preFlightFailed = true;
  }

  // PF-03: agent-mistakes.md
  const mistakesPath = SHARED_PATHS.mistakes;
  if (!fs.existsSync(mistakesPath)) {
    console.error('[HALT] PF-03: agent-mistakes.md not found. R5 compliance impossible.');
    preFlightFailed = true;
  }

  // PF-04: activity log
  if (!fs.existsSync(SHARED_PATHS.activityLog)) {
    console.warn('[WARN] PF-04: agent-activity-log.md not found. Will be created on first write.');
  }

  // PF-05: BASE_URL in config
  const envDir = SHARED_PATHS.envDir;
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
  const fixturesPath = SHARED_PATHS.fixtures;
  if (!fs.existsSync(fixturesPath)) {
    console.error('[HALT] PF-G2: src/infra/fixtures.ts not found. All tests will fail.');
    preFlightFailed = true;
  }

  // PF-G3: selectors index
  const selectorsPath = path.join(SHARED_PATHS.selectors, 'index.ts');
  if (!fs.existsSync(selectorsPath)) {
    console.error('[HALT] PF-G3: src/selectors/index.ts not found. No selectors available.');
    preFlightFailed = true;
  }

  // PF-G4: test data dir
  const testDataDir = SHARED_PATHS.testData;
  if (!fs.existsSync(testDataDir)) {
    console.warn('[WARN] PF-G4: src/data/testdata/ directory not found. May need to create for data-driven tests.');
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
  const perfPath = SHARED_PATHS.performance;
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
          console.log('[RECUR] Search agent-mistakes.md Resolution column for matching entries and apply them proactively.');
        }
      } else {
        console.warn('[WARN] PF-06: No generator entry in agent-performance.json.');
      }
    } catch (e) {
      console.warn(`[WARN] PF-06: Could not parse agent-performance.json: ${e}`);
    }
  }

  // PF-ESC: Check pending escalations assigned to generator (ALL-036)
  const { checkPendingEscalations } = require('./validation-gates');
  const escMessages: string[] = checkPendingEscalations('generator');
  for (const msg of escMessages) console.warn(msg);

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

  // ── PF-G5: WALKTHROUGH canonical normalizer + content validation (SP-PWC2-05) ──
  // GEN-029 enforcement: generator MUST produce a walkthrough during Phase 0.5 before
  // writing any spec code. Accepts either .walkthrough.yaml (CLI agents, LR-038 v2
  // default) or .walkthrough.md (Chrome agents). Both are normalized to canonical JSON
  // at .walkthrough.canonical.json and validated against
  // docs/schemas/walkthrough.canonical.schema.json. Downstream consumers (auditor
  // spot-check per SP-AAE-04, future tooling) read only the canonical form.
  const walkthroughDir = path.join(SHARED_PATHS.reports, 'walkthrough');
  const yamlPath = path.resolve(walkthroughDir, `${itemId}.walkthrough.yaml`);
  const mdPath = path.resolve(walkthroughDir, `${itemId}.walkthrough.md`);
  const canonicalPath = path.resolve(walkthroughDir, `${itemId}.walkthrough.canonical.json`);
  const yamlExists = fs.existsSync(yamlPath);
  const mdExists = fs.existsSync(mdPath);

  if (!yamlExists && !mdExists) {
    console.error('');
    console.error(`[HALT] PF-G5: WALKTHROUGH missing — neither exists:`);
    console.error(`   CLI-authored:    ${yamlPath}`);
    console.error(`   Chrome-authored: ${mdPath}`);
    console.error('   Generator MUST produce a walkthrough during Phase 0.5 before writing spec code.');
    console.error('   The walkthrough must verify at least 3 planner claims on live DOM (LR-038 v2).');
    console.error('   CLI path: `playwright-cli snapshot -s e2e -o reports/walkthrough/' + itemId + '.walkthrough.yaml`');
    console.error('             then author a verified_claims block in the YAML.');
    console.error('   Chrome path: author reports/walkthrough/' + itemId + '.walkthrough.md with a table:');
    console.error('                | TC | Step | Expected | Actual | Status | Classification |');
    console.error('');
    // Don't process.exit here — first-run HALT-on-retry behavior preserved so the
    // agent can create the artifact in this same session.
    const currentRunForG5 = (item.generatorRunCount as number) ?? 0;
    if (currentRunForG5 > 0) {
      console.error('   This is run #' + (currentRunForG5 + 1) + ' — walkthrough should have been created in run #1.');
      console.error('   HALTING. Create the walkthrough first, then re-run.');
      process.exit(1);
    } else {
      console.warn('   [WARN] First run — generator MUST create this file before writing any spec code.');
      console.warn('   Phase 0.5 is MANDATORY. If you skip it, run #2 will HALT here.');
    }
  } else {
    // Prefer YAML (CLI-primary per LR-038 v2) if both exist.
    const sourcePath = yamlExists ? yamlPath : mdPath;
    const isYaml = yamlExists;
    let canonical: CanonicalWalkthrough;

    try {
      const raw = fs.readFileSync(sourcePath, 'utf-8');
      canonical = isYaml ? parseYamlWalkthrough(raw, itemId) : parseMdWalkthrough(raw, itemId);
    } catch (parseErr) {
      console.error('');
      console.error(`[HALT] PF-G5: walkthrough source could not be parsed: ${sourcePath}`);
      console.error(`   ${(parseErr as Error).message}`);
      console.error('');
      process.exit(1);
      return;
    }

    // Write canonical JSON next to source — downstream consumers read this only.
    try {
      fs.writeFileSync(canonicalPath, JSON.stringify(canonical, null, 2) + '\n');
    } catch (writeErr) {
      console.error(`[HALT] PF-G5: could not write canonical JSON to ${canonicalPath}: ${(writeErr as Error).message}`);
      process.exit(1);
      return;
    }

    // Schema-level validation (hand-rolled — mirrors walkthrough.canonical.schema.json).
    const walkthroughErrors = validateCanonical(canonical);
    if (walkthroughErrors.length > 0) {
      console.error('');
      console.error(`[HALT] PF-G5: canonical walkthrough validation FAILED (source: ${path.basename(sourcePath)}):`);
      for (const err of walkthroughErrors) {
        console.error(`  [ERR] ${err}`);
      }
      console.error('');
      console.error('   Fix the walkthrough source and re-run. Canonical JSON written for inspection at:');
      console.error(`     ${canonicalPath}`);
      process.exit(1);
    }

    const verifiedCount = canonical.verified_claims.filter(
      c => c.status === 'VERIFIED' || c.status === 'PASS'
    ).length;
    console.log(
      `[OK] PF-G5: walkthrough validated (${verifiedCount} verified claims, source=${canonical.source_tool}, canonical=${path.basename(canonicalPath)})`
    );
  }

  // ── RCA-FIRST reminder (GEN-037 — injected into agent context) ──
  console.log('');
  console.log('[REMINDER] RCA-FIRST HARD GATE (GEN-037):');
  console.log('   When tests fail: STOP → Read artifacts → IS/IS-NOT analysis → Evidence → THEN fix.');
  console.log('   NEVER apply a fix based solely on error message text.');
  console.log('   NEVER retry without understanding root cause.');
  console.log('   Use /rca protocol: failure-summary → error-context → trace → IS/IS-NOT → 5 Whys → Fix.');
  console.log('');

  // ── PF-G6: Post-complete enforcement on retries ──
  // If a previous generator run exists but post-complete was never executed,
  // the prior run's quality is unverified. Halt and require post-complete first.
  const currentCountForG6 = (item.generatorRunCount as number) ?? 0;
  if (currentCountForG6 > 0 && item.selfAuditPassed !== true) {
    console.error('');
    console.error('[HALT] PF-G6: Previous generator run did not complete the post-complete gate.');
    console.error(`   generatorRunCount=${currentCountForG6}, selfAuditPassed=${item.selfAuditPassed ?? 'undefined'}`);
    console.error('   Run: npm run generator:post-complete ' + itemId);
    console.error('   Then re-run the generator.');
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

  // ── §8 Context Self-Load check (SOFT) ──
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
      console.warn('[WARN]  ALL-003 WARNING: No recent "context-loaded" entry found in activity log for this item.');
      console.warn('   Generator MUST read injectedContext before starting work (S8 Context Self-Load).');
      console.warn('   Log format: | timestamp | generator | context-loaded | Read injectedContext for <item-id> | <item-id> |');
      console.warn('');
    }
  }

  // ── Failure data auto-population (Step 6) + B1: Enhanced RCA Summary ──
  const failureSummaryPath = path.join(SHARED_PATHS.reports, 'failure-summary.json');
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

      // PF-DIAG: Check if diagnostics are actually populated (48A fix)
      if (failures.length > 0) {
        const emptyDiagnostics = failures.filter(f =>
          (!f.networkFailures || f.networkFailures.length === 0) &&
          (!f.consoleErrors || f.consoleErrors.length === 0) &&
          (!f.screenshotPath)
        );
        if (emptyDiagnostics.length === failures.length) {
          console.warn('   [WARN] PF-DIAG: ALL failures have empty diagnostics -- data pipeline may be broken');
          console.warn('   Agents are operating BLIND without diagnostic data. Check diagnosticsHandler fixture in fixtures.ts.');
        }
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

      // Surface matching Resolution entries for current failure categories (ALL-003 enforcement)
      if (fs.existsSync(SHARED_PATHS.mistakes)) {
        const mistakesContent = fs.readFileSync(SHARED_PATHS.mistakes, 'utf-8');
        const matchingResolutions: string[] = [];
        for (const cat of Object.keys(failureCategories)) {
          const catLower = cat.toLowerCase();
          const lines = mistakesContent.split('\n').filter(line => {
            if (!line.trimStart().startsWith('|')) return false;
            const cells = line.split('|').map(c => c.trim()).filter(Boolean);
            if (cells.length < 3) return false;
            const resolution = cells[cells.length - 1] ?? '';
            return resolution !== '\u2014' && resolution.length > 5 &&
              (resolution.toLowerCase().includes(catLower) || cells[1]?.toLowerCase().includes(catLower));
          });
          matchingResolutions.push(...lines);
        }
        if (matchingResolutions.length > 0) {
          console.log(`[LEARN] ${matchingResolutions.length} prior Resolution entries match your failure categories:`);
          for (const line of matchingResolutions.slice(0, 5)) {
            const cols = line.split('|').map(c => c.trim()).filter(Boolean);
            console.log(`  -> ${cols[0]}: ${cols[cols.length - 1]?.substring(0, 80) ?? ''}`);
          }
          console.log('[LEARN] READ these Resolution entries BEFORE retrying. Apply known solutions first (ALL-003/S8).');
        } else {
          console.log('[LEARN] No prior Resolution entries match current failure categories. Novel failures detected.');
          console.log('[LEARN] YOU MUST log learnings during this session (S8). Gate 19 will verify.');
        }

        // Learning debt warning
        const currentRunCount = (item.generatorRunCount as number) ?? 0;
        if (currentRunCount >= 2) {
          const generatorResolutions = mistakesContent.split('\n').filter(l => {
            if (!l.trimStart().startsWith('|')) return false;
            const cells = l.split('|').map(c => c.trim()).filter(Boolean);
            if (cells.length < 3) return false;
            const id = cells[0] ?? '';
            const resolution = cells[cells.length - 1] ?? '';
            return id.startsWith('GEN-') && resolution !== '\u2014' && resolution.length > 5;
          });
          if (generatorResolutions.length === 0) {
            console.log(`[DEBT] LEARNING DEBT: Run #${currentRunCount} with 0 Generator Resolution entries.`);
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
    const fixmeRegistryPath = path.join(SHARED_PATHS.reports, 'fixme-registry.json');
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
    const registryPath = SHARED_PATHS.testIdRegistry;
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

  // ── Bug Hunt: Notification Check (GEN-035) ──
  const notifDir = SHARED_PATHS.notifications;
  if (fs.existsSync(notifDir)) {
    const notifFiles = fs.readdirSync(notifDir).filter(f => f.endsWith('.json'));
    const pendingForGenerator: any[] = [];
    for (const file of notifFiles) {
      try {
        const notif = JSON.parse(fs.readFileSync(path.join(notifDir, file), 'utf-8'));
        if (notif.toAgent === 'generator' && !notif.acknowledged) {
          pendingForGenerator.push(notif);
        }
      } catch { /* skip malformed notification files */ }
    }
    if (pendingForGenerator.length > 0) {
      console.log(`[generator-pre-run] \u26a0 ${pendingForGenerator.length} stale_artifact notifications pending. Generator should prioritize updating affected specs.`);
      // Inject notification context into the queue item
      if (!item.injectedContext) item.injectedContext = {} as any;
      (item.injectedContext as any).pendingNotifications = pendingForGenerator.map(n => ({
        id: n.id,
        from: n.fromAgent,
        type: n.type,
        affectedFiles: n.affectedFiles,
        changeSummary: n.changeSummary,
      }));
      // Acknowledge processed notifications (delete files to prevent re-processing)
      for (const notif of pendingForGenerator) {
        try {
          const notifPath = path.join(notifDir, `${notif.id}.json`);
          if (fs.existsSync(notifPath)) fs.unlinkSync(notifPath);
        } catch (err) {
          console.warn(`[generator-pre-run] Failed to ack notification ${notif.id}: ${err}`);
        }
      }
      // Re-save queue with injected notifications
      queue.lastUpdated = new Date().toISOString();
      fs.writeFileSync(SHARED_PATHS.queue, JSON.stringify(queue, null, 2) + '\n');
    }
  }

  console.log(`\n[OK] Run allowed -- proceeding to test execution`);
  process.exit(0);
}

main();
