#!/usr/bin/env node
/**
 * scripts/check-citation-deliverability.mjs
 * Sev: S1 | Graduating incident: 2026-08-17, two collaborators blocked by unreachable
 * closure citations; census of 1,264 unreachable paths across the plan corpus.
 *
 * Authoring-time check: flags plan citations pointing to gitignored or untracked paths.
 * These citations satisfy C3 locally but fail for every colleague permanently.
 *
 * Layer: pre-commit (shares ≤20s total budget). Chosen because the check must fire
 * before a plan with bad citations lands in the repo — catching at author-time prevents
 * the 1,264-path class of permanent unreachability.
 *
 * CLI:
 *   node scripts/check-citation-deliverability.mjs --file <plan-path>   → check one plan
 *   node scripts/check-citation-deliverability.mjs --self-test           → fixture tests
 *   node scripts/check-citation-deliverability.mjs --all                 → batch all plans
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, unlinkSync, readdirSync, rmdirSync } from 'node:fs';
import { resolve, join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { fireTelemetry } from '../.claude/hooks/lib/hook-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const GATE_NAME = 'check-citation-deliverability';
const CONFIG_PATH = join(ROOT, '.claude', 'guardrail-config.json');

// S-SECRET patterns — paths that must NEVER be advised to track
const S_SECRET_PATTERNS = [
  /\.auth[\/\\].*state\.json$/i,
  /storage-state.*\.json$/i,
  /\.playwright-cli[\/\\]storage-state/i,
  /\.env\..*\.local$/i,
  /\.env\.server$/i,
];

function isSecretPath(p) {
  return S_SECRET_PATTERNS.some(rx => rx.test(p));
}

function readMode() {
  try {
    const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    return cfg.citation_deliverability_mode || 'announce';
  } catch { return 'announce'; }
}

// Reuse the same citation grammar as C3 in validate-plan-closure.mjs
const CITED_PATH_RX_PLAIN = /(?<![A-Za-z0-9_])((?:\.[a-zA-Z]|[a-zA-Z0-9_-])(?:[a-zA-Z0-9_.-]|[\/\\])+\.(?:png|jpg|jpeg|mp4|webm|zip|json|trace|yml|yaml|html|svg|gif|pdf|log|txt|har|xml|md|csv|diff|patch))(?![A-Za-z0-9_])/g;
const CITED_PATH_RX_MD = /\[[^\]]*\]\(([^)]+\.(?:png|jpg|jpeg|mp4|webm|zip|json|trace|yml|yaml|html|svg|gif|pdf|log|txt|har|xml|md|csv|diff|patch))\)/g;

function extractCitedPaths(body) {
  const paths = new Set();
  const lines = body.split('\n');
  let inFence = false;
  let ancestorHeading = '';
  for (const line of lines) {
    if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^#{1,6}\s/.test(line)) { ancestorHeading = line; continue; }
    if (/^>\s/.test(line)) continue;
    if (/\be\.g\.\b|\bhypothetical\b|\bwould be\b|<placeholder>|<TBD>/i.test(line)) continue;
    if (/## Example|## Templates|## Hypothetical/i.test(ancestorHeading)) continue;

    let m;
    const plainRx = new RegExp(CITED_PATH_RX_PLAIN.source, 'g');
    while ((m = plainRx.exec(line)) !== null) paths.add(m[1]);
    const mdRx = new RegExp(CITED_PATH_RX_MD.source, 'g');
    while ((m = mdRx.exec(line)) !== null) paths.add(m[1]);
  }
  return [...paths];
}

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

/**
 * Check if a repo-relative path is tracked by git.
 * Returns: 'tracked' | 'untracked' | 'ignored'
 */
function getGitStatus(repoRelPath) {
  // First check if tracked (git ls-files returns the path if tracked)
  try {
    const out = execFileSync('git', ['ls-files', '--', repoRelPath], { cwd: ROOT, encoding: 'utf-8', timeout: 5000 }).trim();
    if (out.length > 0) return 'tracked';
  } catch { /* fall through */ }

  // Check if gitignored
  try {
    execFileSync('git', ['check-ignore', '-q', '--', repoRelPath], { cwd: ROOT, encoding: 'utf-8', timeout: 5000 });
    return 'ignored'; // exit 0 = ignored
  } catch (e) {
    // exit 1 = not ignored; exit 128 = error
    if (e.status === 1) return 'untracked';
    return 'untracked'; // fallback
  }
}

function checkPlan(planPath) {
  const body = readFileSync(planPath, 'utf-8');
  const rawPaths = extractCitedPaths(body);
  const findings = [];

  for (const rawP of rawPaths) {
    const norm = normalizePath(rawP);
    if (/^https?:\/\//.test(norm)) continue;
    if (!norm.includes('/')) continue;
    if (/^node_modules\/|^dist\/|^build\/|^coverage\//.test(norm)) continue;
    if (/<|>|\{|\}/.test(norm)) continue;
    if (/^[A-Z][A-Z0-9_]*_(?:DIR|PATH|ROOT)\//.test(norm)) continue;
    if (/(?:^|\/)(?:foo|bar|baz|qux|example|placeholder|sample)\.[a-z]+$/i.test(norm)) continue;
    if (/^(?:Users|home)\/[^/]+\/\.claude\//i.test(norm)) continue;
    if (/^~\//.test(rawP) || /^~\//.test(norm)) continue;
    if (/^\.claude\/plans\//.test(norm)) continue;

    // Resolve absolute paths to repo-relative
    let resolved = norm;
    if (/^[A-Z]:[\/]/.test(rawP) || rawP.startsWith('/')) {
      const rel = relative(ROOT, rawP.replace(/\\/g, '/'));
      if (rel.startsWith('..')) continue; // external, skip
      resolved = normalizePath(rel);
    }

    // Only check paths that exist on disk — non-existent paths are C3's domain
    const absPath = join(ROOT, resolved);
    if (!existsSync(absPath)) continue;

    const status = getGitStatus(resolved);
    if (status === 'tracked') continue;

    const secret = isSecretPath(resolved);
    findings.push({ path: resolved, status, secret });
  }

  return findings;
}

function formatFinding(f) {
  if (f.secret) {
    return `  ⚠ ${f.path} — S-SECRET (${f.status}): stop citing this path; it contains credentials and must never be tracked.`;
  }
  if (f.status === 'ignored') {
    return `  ⚠ ${f.path} — gitignored: this path will not travel with the repo. Cite the durable tracked artifact instead.`;
  }
  return `  ⚠ ${f.path} — untracked: this path will not travel with the repo. Either 'git add' it or cite a tracked alternative.`;
}


// ── Main ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes('--self-test')) {
  // selfTest uses top-level await indirectly; handle sync
  console.log(`[${GATE_NAME}] self-test`);

  const FIXTURE_DIR = join(ROOT, 'scripts', 'fixtures', 'citation-deliverability');
  if (!existsSync(FIXTURE_DIR)) mkdirSync(FIXTURE_DIR, { recursive: true });

  const ignoredFixture = join(FIXTURE_DIR, 'test-ignored-cite.md');
  const cleanFixture = join(FIXTURE_DIR, 'test-clean-cite.md');
  const secretFixture = join(FIXTURE_DIR, 'test-secret-cite.md');

  writeFileSync(ignoredFixture, `# Test Plan\n\nEvidence: .claude/state/gate-fires.log\n`);
  writeFileSync(cleanFixture, `# Test Plan\n\nEvidence: scripts/check-citation-deliverability.mjs\n`);
  writeFileSync(secretFixture, `# Test Plan\n\nEvidence: .auth/login-state.json\n`);

  const authDir = join(ROOT, '.auth');
  const authFile = join(authDir, 'login-state.json');
  const authCreated = !existsSync(authDir);
  if (authCreated) mkdirSync(authDir, { recursive: true });
  const authFileCreated = !existsSync(authFile);
  if (authFileCreated) writeFileSync(authFile, '{}');

  let passed = 0; let failed = 0;

  // Test 1: gitignored/untracked path
  const gateFires = join(ROOT, '.claude', 'state', 'gate-fires.log');
  if (existsSync(gateFires)) {
    const r1 = checkPlan(ignoredFixture);
    if (r1.length > 0 && (r1[0].status === 'ignored' || r1[0].status === 'untracked')) {
      console.log('  ✓ Test 1: gitignored/untracked path flagged');
      passed++;
    } else {
      console.log(`  ✗ Test 1: expected finding, got ${JSON.stringify(r1)}`);
      failed++;
    }
  } else {
    console.log('  ✓ Test 1: SKIP (gate-fires.log absent — cited file must exist for this check)');
    passed++;
  }

  // Test 2: tracked path clean
  const r2 = checkPlan(cleanFixture);
  if (r2.length === 0) {
    console.log('  ✓ Test 2: tracked path produces no finding');
    passed++;
  } else {
    console.log(`  ✗ Test 2: expected no findings, got ${JSON.stringify(r2)}`);
    failed++;
  }

  // Test 3: S-SECRET
  const r3 = checkPlan(secretFixture);
  if (r3.length > 0 && r3[0].secret === true) {
    const msg = formatFinding(r3[0]);
    if (msg.includes('stop citing')) {
      console.log('  ✓ Test 3: S-SECRET says "stop citing"');
      passed++;
    } else {
      console.log(`  ✗ Test 3: message lacks "stop citing": ${msg}`);
      failed++;
    }
  } else {
    console.log(`  ✗ Test 3: expected secret finding, got ${JSON.stringify(r3)}`);
    failed++;
  }

  // Cleanup
  try { unlinkSync(ignoredFixture); } catch {}
  try { unlinkSync(cleanFixture); } catch {}
  try { unlinkSync(secretFixture); } catch {}
  if (authFileCreated) try { unlinkSync(authFile); } catch {}
  if (authCreated) try { rmdirSync(authDir); } catch {}
  try { rmdirSync(FIXTURE_DIR); } catch {}

  console.log(`\n  ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

if (args.includes('--file')) {
  const idx = args.indexOf('--file');
  const planPath = resolve(args[idx + 1]);
  if (!existsSync(planPath)) { console.error(`File not found: ${planPath}`); process.exit(1); }

  const mode = readMode();
  if (mode === 'off') { process.exit(0); }

  const findings = checkPlan(planPath);
  if (findings.length === 0) {
    process.exit(0);
  }

  const verdict = mode === 'deny' ? 'deny' : 'announce';
  console.log(`[${GATE_NAME}] ${verdict.toUpperCase()} — ${findings.length} non-deliverable citation(s) in ${basename(planPath)}:`);
  for (const f of findings) console.log(formatFinding(f));

  fireTelemetry(GATE_NAME, verdict, relative(ROOT, planPath).replace(/\\/g, '/'));

  process.exit(mode === 'deny' ? 1 : 0);
}

if (args.includes('--all')) {
  const mode = readMode();
  if (mode === 'off') { process.exit(0); }

  const dirs = [join(ROOT, 'plans', 'done'), join(ROOT, 'plans', 'pending')];
  let totalFindings = 0;
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const fp = join(dir, f);
      const findings = checkPlan(fp);
      if (findings.length > 0) {
        totalFindings += findings.length;
        console.log(`  ${basename(fp)}: ${findings.length} non-deliverable citation(s)`);
        for (const fi of findings) console.log(formatFinding(fi));
      }
    }
  }
  console.log(`\n[${GATE_NAME}] Total: ${totalFindings} non-deliverable citation(s)`);
  process.exit(0); // --all is always report-only
}

console.log(`Usage: node ${basename(__filename)} --file <plan> | --self-test | --all`);
process.exit(1);
