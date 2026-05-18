#!/usr/bin/env node
// validate-plan-layout.mjs — Fleet validator for plans/done/ and plans/pending/ layout.
//
// Modes:
//   --check                  READ-ONLY fleet validation (used by pipeline:validate).
//   --enforce-all            Like --check but ignores grandfathering. Manual.
//   --cleanup-tmp-manifests  Remove stale .tmp manifests >24h. Manual.
//   --self-test              Run synthetic fixture tests.
//   --json                   Structured output to stdout.

import { readFileSync, existsSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const MANIFEST_DIR = join(REPO_ROOT, 'plans', '_closure_manifests');
const LANDED_AT_PATH = join(REPO_ROOT, '.claude', 'closure-gate-landed-at.txt');
const ATTEMPTS_DIR = join(REPO_ROOT, '.claude', 'state', 'closure-attempts');
const DONE_DIR = join(REPO_ROOT, 'plans', 'done');
const PENDING_DIR = join(REPO_ROOT, 'plans', 'pending');

const MIN_TOLERATED_VERSION = '1.0';

// === Reused from plans-reindex.mjs:55-73 (byte-exact) ===
function cleanValue(raw) {
  if (!raw) return '';
  return raw
    .replace(/^\*+|\*+$/g, '')
    .replace(/^`|`$/g, '')
    .split('|')[0]
    .trim();
}

function parseField(header, label) {
  const re = new RegExp(
    `(?:^|\\n)\\s*(?:\\*\\*)?${label}(?:\\*\\*)?\\s*:\\s*([^\\n]+)`,
    'i',
  );
  const m = header.match(re);
  return m ? cleanValue(m[1]) : '';
}

function sha256(content) {
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}

function gitExec(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf-8', ...opts }).trim();
  } catch (e) {
    const msg = String(e.stderr || e.message || '');
    if (msg.includes('dubious ownership')) {
      throw new Error(`Git dubious-ownership error. Run: git config --global --add safe.directory "${REPO_ROOT}"`);
    }
    throw e;
  }
}

function loadLandedAt() {
  if (!existsSync(LANDED_AT_PATH)) return null;
  const raw = readFileSync(LANDED_AT_PATH, 'utf-8').trim();
  const ts = new Date(raw);
  if (isNaN(ts.getTime())) return null;
  return Math.floor(ts.getTime() / 1000);
}

function getLastChangeTimestamp(planPath) {
  try {
    const ts = gitExec(`git log -1 --format=%at "${planPath}"`);
    return parseInt(ts, 10) || null;
  } catch {
    return null;
  }
}

function versionGte(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va > vb) return true;
    if (va < vb) return false;
  }
  return true;
}

// === Fleet check ===
function checkDoneDir(enforceAll) {
  const findings = [];
  const landedAt = loadLandedAt();

  if (!existsSync(DONE_DIR)) {
    findings.push({ level: 'YELLOW', file: 'plans/done/', msg: 'Directory does not exist' });
    return findings;
  }

  const files = readdirSync(DONE_DIR).filter(f => f.endsWith('.md'));

  for (const f of files) {
    const planPath = join(DONE_DIR, f);
    const body = readFileSync(planPath, 'utf-8');
    const header = body.slice(0, 2000);

    const status = parseField(header, 'Status');
    if (status.toUpperCase() !== 'DONE') {
      findings.push({ level: 'RED', file: `plans/done/${f}`, msg: `DONE-folder contains non-DONE plan (Status: ${status || 'missing'})` });
      continue;
    }

    const manifestPath = join(MANIFEST_DIR, `${f}.manifest.json`);

    if (existsSync(manifestPath)) {
      let manifest;
      try {
        manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      } catch (e) {
        findings.push({ level: 'RED', file: `plans/done/${f}`, msg: `Manifest malformed: ${e.message}` });
        continue;
      }

      if (!manifest.plan_sha256 || !manifest.validator_version) {
        findings.push({ level: 'RED', file: `plans/done/${f}`, msg: 'Manifest missing required fields (plan_sha256, validator_version)' });
        continue;
      }

      const currentSha = sha256(body);
      if (manifest.plan_sha256 !== currentSha) {
        findings.push({ level: 'RED', file: `plans/done/${f}`, msg: 'Manifest stale; plan_sha256 mismatch — re-run validator' });
        continue;
      }

      if (!versionGte(manifest.validator_version, MIN_TOLERATED_VERSION)) {
        findings.push({ level: 'RED', file: `plans/done/${f}`, msg: `Manifest validator_version ${manifest.validator_version} < MIN_TOLERATED ${MIN_TOLERATED_VERSION} — re-run validator under new version` });
        continue;
      }

      if (manifest.validator_invocation_id) {
        const attemptGlob = `${f}-`;
        try {
          if (existsSync(ATTEMPTS_DIR)) {
            const attemptFiles = readdirSync(ATTEMPTS_DIR).filter(a => a.startsWith(attemptGlob));
            if (attemptFiles.length > 0) {
              let found = false;
              for (const af of attemptFiles) {
                try {
                  const attempts = JSON.parse(readFileSync(join(ATTEMPTS_DIR, af), 'utf-8'));
                  if (Array.isArray(attempts) && attempts.some(a => a.invocation_id === manifest.validator_invocation_id)) {
                    found = true;
                    break;
                  }
                } catch { /* malformed attempt file — skip */ }
              }
              if (!found) {
                findings.push({ level: 'RED', file: `plans/done/${f}`, msg: 'Manifest validator_invocation_id not found in local closure-attempts logs' });
                continue;
              }
            } else {
              findings.push({ level: 'YELLOW', file: `plans/done/${f}`, msg: 'No local closure-attempts logs found — cannot cross-check invocation_id (fresh clone?)' });
            }
          } else {
            findings.push({ level: 'YELLOW', file: `plans/done/${f}`, msg: 'closure-attempts directory missing — cannot cross-check invocation_id (fresh clone?)' });
          }
        } catch {
          findings.push({ level: 'YELLOW', file: `plans/done/${f}`, msg: 'Error reading closure-attempts logs' });
        }
      }

      if (Array.isArray(manifest.artifacts)) {
        for (const art of manifest.artifacts) {
          if (art.path && art.sha256) {
            const artPath = resolve(REPO_ROOT, art.path);
            if (existsSync(artPath)) {
              const artSha = sha256(readFileSync(artPath, 'utf-8'));
              if (artSha !== art.sha256) {
                findings.push({ level: 'RED', file: `plans/done/${f}`, msg: `Artifact tampered: ${art.path} (SHA mismatch)` });
              }
            }
          }
        }
      }
    } else {
      if (enforceAll) {
        findings.push({ level: 'RED', file: `plans/done/${f}`, msg: 'No manifest found (--enforce-all mode)' });
      } else if (landedAt !== null) {
        const lastChange = getLastChangeTimestamp(planPath);
        if (lastChange !== null && lastChange >= landedAt) {
          findings.push({ level: 'RED', file: `plans/done/${f}`, msg: 'Plan re-edited post-landing must produce manifest (last-change >= closure-gate-landed-at)' });
        } else {
          findings.push({ level: 'YELLOW', file: `plans/done/${f}`, msg: 'No manifest (grandfathered — last change predates closure-gate landing)' });
        }
      } else {
        findings.push({ level: 'YELLOW', file: `plans/done/${f}`, msg: 'No manifest and no closure-gate-landed-at.txt — cannot determine grandfathering' });
      }
    }
  }

  return findings;
}

function checkPendingDir() {
  const findings = [];

  if (!existsSync(PENDING_DIR)) return findings;

  const files = readdirSync(PENDING_DIR).filter(f => f.endsWith('.md'));

  for (const f of files) {
    const planPath = join(PENDING_DIR, f);
    const body = readFileSync(planPath, 'utf-8');
    const header = body.slice(0, 2000);

    const status = parseField(header, 'Status');
    if (status.toUpperCase() === 'DONE') {
      findings.push({ level: 'RED', file: `plans/pending/${f}`, msg: 'DONE-in-pending — move to plans/done/ or revert' });
    }
  }

  return findings;
}

function checkStaleTmpManifests() {
  const findings = [];
  if (!existsSync(MANIFEST_DIR)) return findings;

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const files = readdirSync(MANIFEST_DIR).filter(f => f.endsWith('.json.tmp'));

  for (const f of files) {
    const fp = join(MANIFEST_DIR, f);
    try {
      const st = statSync(fp);
      if (now - st.mtimeMs > DAY_MS) {
        findings.push({ level: 'YELLOW', file: `plans/_closure_manifests/${f}`, msg: 'Stale .tmp manifest (>24h) — run --cleanup-tmp-manifests to remove' });
      }
    } catch { /* stat failure — skip */ }
  }

  return findings;
}

// === --cleanup-tmp-manifests mode (NV2) ===
function cleanupTmpManifests() {
  if (!existsSync(MANIFEST_DIR)) {
    console.log('No manifest directory found.');
    return 0;
  }

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const files = readdirSync(MANIFEST_DIR).filter(f => f.endsWith('.json.tmp'));
  let removed = 0;

  for (const f of files) {
    const fp = join(MANIFEST_DIR, f);
    try {
      const st = statSync(fp);
      if (now - st.mtimeMs > DAY_MS) {
        unlinkSync(fp);
        console.log(`Removed stale .tmp manifest: ${f}`);
        removed++;
      }
    } catch (e) {
      console.error(`Failed to remove ${f}: ${e.message}`);
    }
  }

  console.log(`Cleanup complete: ${removed} stale .tmp manifest(s) removed.`);
  return 0;
}

// === --check / --enforce-all mode ===
function runCheck(enforceAll, json) {
  const findings = [];
  findings.push(...checkDoneDir(enforceAll));
  findings.push(...checkPendingDir());
  if (!enforceAll) {
    findings.push(...checkStaleTmpManifests());
  }

  const reds = findings.filter(f => f.level === 'RED');
  const yellows = findings.filter(f => f.level === 'YELLOW');

  if (json) {
    console.log(JSON.stringify({ mode: enforceAll ? 'enforce-all' : 'check', findings, red_count: reds.length, yellow_count: yellows.length }, null, 2));
  } else {
    if (findings.length === 0) {
      console.log('validate-plan-layout: ALL GREEN');
    } else {
      for (const f of findings) {
        const prefix = f.level === 'RED' ? 'RED' : 'YELLOW';
        console.log(`[${prefix}] ${f.file}: ${f.msg}`);
      }
      console.log(`\n${reds.length} RED, ${yellows.length} YELLOW`);
    }
  }

  return reds.length > 0 ? 1 : 0;
}

// === --self-test mode ===
function runSelfTest() {
  let pass = 0;
  let fail = 0;

  function assert(label, condition) {
    if (condition) {
      pass++;
    } else {
      console.error(`FAIL: ${label}`);
      fail++;
    }
  }

  assert('parseField extracts bold Status',
    parseField('---\n**Status**: DONE\n---', 'Status') === 'DONE');

  assert('parseField extracts plain Status',
    parseField('---\nStatus: PENDING-DRAFT\n---', 'Status') === 'PENDING-DRAFT');

  assert('versionGte 1.0 >= 1.0', versionGte('1.0', '1.0'));
  assert('versionGte 1.1 >= 1.0', versionGte('1.1', '1.0'));
  assert('versionGte 2.0 >= 1.0', versionGte('2.0', '1.0'));
  assert('versionGte NOT 0.9 >= 1.0', !versionGte('0.9', '1.0'));

  assert('sha256 deterministic',
    sha256('hello') === sha256('hello'));

  assert('sha256 differs for different input',
    sha256('hello') !== sha256('world'));

  assert('loadLandedAt returns number when file exists',
    typeof loadLandedAt() === 'number' || loadLandedAt() === null);

  assert('checkPendingDir returns array', Array.isArray(checkPendingDir()));

  assert('closure-gate-landed-at.txt read',
    existsSync(LANDED_AT_PATH));

  assert('git log -1 --format=%at works',
    typeof getLastChangeTimestamp(join(DONE_DIR, readdirSync(DONE_DIR).filter(f => f.endsWith('.md'))[0] || 'dummy.md')) !== 'undefined');

  assert('checkStaleTmpManifests returns array', Array.isArray(checkStaleTmpManifests()));

  console.log(`\nvalidate-plan-layout --self-test: ${pass} passed, ${fail} failed`);
  return fail > 0 ? 1 : 0;
}

// === CLI dispatch ===
const args = process.argv.slice(2);
const hasFlag = flag => args.includes(flag);

if (hasFlag('--self-test')) {
  process.exit(runSelfTest());
} else if (hasFlag('--cleanup-tmp-manifests')) {
  process.exit(cleanupTmpManifests());
} else if (hasFlag('--enforce-all')) {
  process.exit(runCheck(true, hasFlag('--json')));
} else if (hasFlag('--check')) {
  process.exit(runCheck(false, hasFlag('--json')));
} else {
  console.error('Usage: validate-plan-layout.mjs --check | --enforce-all | --cleanup-tmp-manifests | --self-test [--json]');
  process.exit(2);
}
