#!/usr/bin/env node
// validate-plan-closure.mjs — Plan closure validation (C1-C5 checks).
//
// Modes (V6 — --enforce is READ-ONLY; manifest writes need --write-manifest):
//   --plan <path> --enforce              Single plan, exit 1 on FAIL. READ-ONLY.
//   --plan <path> --enforce --write-manifest  Single + manifest. CLOSURE-CEREMONY ONLY.
//   --plan <path> --report-only          Single, always exit 0.
//   --changed --enforce                  Plans changed in current commit set.
//   --all --report-only                  Batch retro, always exit 0.
//   --staged --enforce                   Pre-commit blob mode (git show :path).
//   --content-from-stdin --plan <path>   Hook mode (projected body on stdin).
//   --json                               Structured findings to stdout.
//   --self-test                          Synthetic fixture tests.
//   --all --enforce --rewrite-manifests  Migration tool (user-invoked only).

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, renameSync } from 'node:fs';
import { resolve, join, dirname, basename, relative, extname, sep } from 'node:path';
import { execSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const MANIFEST_DIR = join(REPO_ROOT, 'plans', '_closure_manifests');
const OVERRIDES_PATH = join(REPO_ROOT, '.claude', 'closure-overrides.json');
const SCHEMA_PATH = join(REPO_ROOT, '.claude', 'closure-overrides.schema.json');
const LANDED_AT_PATH = join(REPO_ROOT, '.claude', 'closure-gate-landed-at.txt');
const STATE_DIR = join(REPO_ROOT, '.claude', 'state');
const ATTEMPTS_DIR = join(STATE_DIR, 'closure-attempts');
const AUDITS_DIR = join(STATE_DIR, 'closure-audits');
const FAIL_CLOSED_DIR = STATE_DIR;
const FIXTURE_DIR = join(REPO_ROOT, 'scripts', 'test-fixtures', 'plan-closure');

const VALIDATOR_VERSION = '1.0';

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

// === Git helpers (B15 — wrapped with error handler) ===
function gitExec(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf-8', ...opts }).trim();
  } catch (e) {
    const msg = String(e.stderr || e.message || '');
    if (/dubious ownership/i.test(msg)) {
      console.error(`[FATAL] git dubious-ownership error. Run: git config --global --add safe.directory "${REPO_ROOT}"`);
      process.exit(1);
    }
    if (/bad object|not a git repository/i.test(msg)) {
      console.error(`[FATAL] git error: ${msg.slice(0, 200)}`);
      process.exit(1);
    }
    throw e;
  }
}

// === SHA-256 helper ===
function sha256(content) {
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}

// === Config hash (validator regex fingerprint) ===
function configHash() {
  const sig = CLOSURE_FORBIDDEN_C1.map(r => r.source).join('|') +
    CITED_PATH_RX_PLAIN.source + CITED_PATH_RX_MD.source +
    STRICT_TOKEN_RX.source;
  return sha256(sig);
}

function selfHash() {
  try {
    return sha256(readFileSync(__filename, 'utf-8'));
  } catch {
    return 'unknown';
  }
}

// === C1: Forbidden incompleteness tokens ===
const CLOSURE_FORBIDDEN_C1 = [
  /(?<![A-Za-z])NOT-WALKED(?![A-Za-z])/,
  /(?<![A-Za-z])NOT WALKED(?![A-Za-z])/i,
  /(?<![A-Za-z])PROBABLE-(?:FAIL|PASS|SKIP)-(?:APP|FRAMEWORK|TEST)(?![A-Za-z])/,
  /(?<![A-Za-z])BLOCKED-BY-FIXME-DESIGN(?![A-Za-z])/,
  /\bsurface-exists\s*:\s*divergent\b/i,
  /^\s*(?:dom-snippet|dom-screenshot-path|observed-live|network-capture-row|repro-steps|why-gap|proposed-TC-title|proposed-TC-assertion|evidence|verbatim)\s*:\s*"?\(?(?:not captured|n\/a|N\/A|NOT[\s-]?WALKED|not exercised|not walked|partial|deferred|TBD|TODO|placeholder)\)?"?\s*$/im,
  /(?:^|\n)\s*[-*|]\s.{0,120}\bnot captured\b(?![A-Za-z-])/i,
  /(?:^|\n)\s*[-*|]\s.{0,120}\bnot exercised\b(?![A-Za-z-])/i,
];

function isInFencedCodeBlock(body, matchIndex) {
  const before = body.slice(0, matchIndex);
  const fenceCount = (before.match(/^(```|~~~)/gm) || []).length;
  return fenceCount % 2 === 1;
}

function shouldDropLineC1(line) {
  if (/^#{1,6}\s/.test(line)) return true;
  if (/^>\s/.test(line)) return true;
  if (/\be\.g\.\b|\bexample\b|\bfor example\b/i.test(line)) return true;
  return false;
}

function checkC1(body, planBasename, overrides) {
  const findings = [];
  const lines = body.split('\n');
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (shouldDropLineC1(line)) continue;

    for (const rx of CLOSURE_FORBIDDEN_C1) {
      const m = line.match(rx);
      if (m) {
        const token = m[0].trim();
        const isOverridden = overrides.some(o =>
          o.plan === planBasename &&
          o.path_match === 'exact' &&
          o.tokens.includes(token) &&
          new Date(o.expires_at) > new Date()
        );
        findings.push({
          check: 'C1',
          line: i + 1,
          token,
          overridden: isOverridden,
          overridable: true,
          text: line.trim().slice(0, 120),
        });
      }
    }
  }

  const unoverridden = findings.filter(f => !f.overridden);
  return {
    check: 'C1',
    status: unoverridden.length > 0 ? 'FAIL' : 'PASS',
    overridable: true,
    items: findings,
  };
}

// === C2: LR-027 execution summary skeleton ===
function checkC2(body) {
  const executedRx = /(?:^|\n)\s*(?:\*\*)?Executed(?:\*\*)?\s*:\s*([^\n]+)/i;
  const hasExecuted = executedRx.test(body);

  const summaryRx = /^(#{2,4})\s+Execution Summary\s*$/im;
  const summaryMatch = body.match(summaryRx);

  if (!summaryMatch) {
    return { check: 'C2', status: 'FAIL', overridable: false, items: [
      { reason: 'Missing Execution Summary heading (## through ####)' },
    ] };
  }

  const headingLevel = summaryMatch[1].length;
  const startIdx = summaryMatch.index + summaryMatch[0].length;
  const restBody = body.slice(startIdx);
  const nextHeadingRx = new RegExp(`^#{1,${headingLevel}}\\s`, 'm');
  const nextMatch = restBody.match(nextHeadingRx);
  const sectionBody = nextMatch ? restBody.slice(0, nextMatch.index) : restBody;

  const contentLines = sectionBody.split('\n').filter(l => l.trim().length > 0);

  const C2_PATH_RX = /(?:\.[a-zA-Z]|[a-zA-Z0-9_-])(?:[a-zA-Z0-9_.-]|[\/\\])+\.(?:ts|tsx|js|mjs|cjs|sh|bash|md|json|yml|yaml|html|css|go|rs|py|png|jpg|jpeg|mp4|webm|zip|trace|svg|gif|pdf|log|txt|har|xml|csv|diff|patch)/;
  const hasCitedPath = C2_PATH_RX.test(sectionBody);

  const items = [];
  if (!hasExecuted) items.push({ reason: 'Missing Executed: date field' });
  if (contentLines.length < 10) items.push({ reason: `Execution Summary has ${contentLines.length} content lines (need >= 10)` });
  if (!hasCitedPath) items.push({ reason: 'No cited file path in Execution Summary' });

  return {
    check: 'C2',
    status: items.length > 0 ? 'FAIL' : 'PASS',
    overridable: false,
    items,
  };
}

// === C3: Cited artifact paths exist ===
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
    if (/^#{1,6}\s/.test(line)) {
      ancestorHeading = line;
      continue;
    }
    if (/^>\s/.test(line)) continue;
    if (/\be\.g\.\b|\bhypothetical\b|\bwould be\b|<placeholder>|<TBD>/i.test(line)) continue;
    if (/## Example|## Templates|## Hypothetical/i.test(ancestorHeading)) continue;

    let m;
    const plainRx = new RegExp(CITED_PATH_RX_PLAIN.source, 'g');
    while ((m = plainRx.exec(line)) !== null) {
      paths.add(m[1]);
    }
    const mdRx = new RegExp(CITED_PATH_RX_MD.source, 'g');
    while ((m = mdRx.exec(line)) !== null) {
      paths.add(m[1]);
    }
  }

  return [...paths];
}

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

function checkC3(body, planPath) {
  const rawPaths = extractCitedPaths(body);
  const planBasename = basename(planPath);
  const manifestPath = join(MANIFEST_DIR, `${planBasename}.manifest.json`);
  let manifest = null;
  if (existsSync(manifestPath)) {
    try { manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')); } catch {}
  }

  const items = [];
  for (const rawP of rawPaths) {
    const norm = normalizePath(rawP);
    if (/^https?:\/\//.test(norm)) continue;
    if (!norm.includes('/')) continue;
    if (/^node_modules\/|^dist\/|^build\/|^coverage\//.test(norm)) continue;
    if (/<|>|\{|\}/.test(norm)) continue;

    let resolved = norm;
    if (/^[A-Z]:[\/]/.test(rawP) || rawP.startsWith('/')) {
      const rel = relative(REPO_ROOT, rawP.replace(/\\/g, sep));
      if (rel.startsWith('..')) {
        items.push({ path: rawP, status: 'external-path', severity: 'WARN' });
        continue;
      }
      resolved = normalizePath(rel);
    }

    const absPath = join(REPO_ROOT, resolved);
    if (existsSync(absPath)) continue;

    if (manifest && manifest.artifacts) {
      const match = manifest.artifacts.find(a => normalizePath(a.path) === resolved);
      if (match) continue;
    }

    items.push({ path: resolved, status: 'missing', severity: 'FAIL' });
  }

  const fails = items.filter(i => i.severity === 'FAIL');
  return {
    check: 'C3',
    status: fails.length > 0 ? 'FAIL' : 'PASS',
    overridable: false,
    items,
  };
}

// === C4: Phantom + circular handoff ===
function resolveHandoffTarget(targetRef, planPath) {
  const planDir = dirname(planPath);
  if (/^(SUBPLAN_|PLAN_).+\.md$/.test(targetRef)) {
    const candidates = [
      join(REPO_ROOT, 'plans', 'pending', targetRef),
      join(REPO_ROOT, 'plans', 'done', targetRef),
      join(planDir, targetRef),
    ];
    for (const c of candidates) {
      if (existsSync(c)) return c;
    }
    return null;
  }

  const shorthandRx = /^SP-([A-Za-z0-9]+)$/;
  const m = targetRef.match(shorthandRx);
  if (!m) return null;

  const letter = m[1];
  const planBody = readFileSync(planPath, 'utf-8');
  const headerEnd = planBody.indexOf('\n---', 4);
  const header = headerEnd > 0 ? planBody.slice(0, headerEnd) : planBody.slice(0, 500);
  const parentRaw = parseField(header, 'Parent') ||
    parseField(header, 'Parent audit') ||
    parseField(header, 'Parent plan');

  if (!parentRaw) return null;

  for (const dir of ['plans/pending', 'plans/done']) {
    const fullDir = join(REPO_ROOT, dir);
    if (!existsSync(fullDir)) continue;
    try {
      const files = readdirSync(fullDir).filter(f =>
        f.endsWith('.md') &&
        new RegExp(`_${letter}\\.md$`, 'i').test(f)
      );
      if (files.length === 1) return join(fullDir, files[0]);
      if (files.length > 1) return 'AMBIGUOUS';
    } catch {}
  }
  return null;
}

const STRUCTURED_HANDOFF_RX = /handoff-target:\s*(\S+\.md)/g;
const STRUCTURED_TOKEN_RX = /recipient-required-token:\s*(\S+)/g;
const PROSE_HANDOFF_RX = /(?:deferred to|handed off to|see)\s+(SP-[A-Za-z0-9]+|SUBPLAN_[A-Z0-9_]+\.md|PLAN_[A-Z0-9_]+\.md)/gi;
const MIGRATION_DEADLINE = new Date('2026-06-18');

function checkC4(body, planPath) {
  const items = [];
  const planBasename = basename(planPath);

  const structuredTargets = [];
  let sm;
  const structRx = new RegExp(STRUCTURED_HANDOFF_RX.source, 'g');
  while ((sm = structRx.exec(body)) !== null) {
    structuredTargets.push({ target: sm[1], structured: true });
  }

  const proseTargets = [];
  const proseRx = new RegExp(PROSE_HANDOFF_RX.source, 'gi');
  while ((sm = proseRx.exec(body)) !== null) {
    const already = structuredTargets.some(s => s.target === sm[1]);
    if (!already) proseTargets.push({ target: sm[1], structured: false });
  }

  const allTargets = [...structuredTargets, ...proseTargets];

  for (const { target, structured } of allTargets) {
    const resolved = resolveHandoffTarget(target, planPath);

    if (resolved === null) {
      items.push({ target, status: 'phantom', severity: 'FAIL', reason: 'Recipient does not exist' });
      continue;
    }
    if (resolved === 'AMBIGUOUS') {
      items.push({ target, status: 'ambiguous', severity: 'FAIL', reason: 'Shorthand resolves to multiple siblings; use full filename' });
      continue;
    }

    if (!structured && new Date() >= MIGRATION_DEADLINE) {
      items.push({ target, status: 'prose-handoff', severity: 'FAIL', reason: 'Prose handoff form expired; use structured handoff-target: form' });
    } else if (!structured) {
      items.push({ target, status: 'prose-handoff', severity: 'WARN', reason: 'Prose handoff deprecated; use structured form by 2026-06-18' });
    }

    try {
      const recipientBody = readFileSync(resolved, 'utf-8');
      const rHeaderEnd = recipientBody.indexOf('\n---', 4);
      const rHeader = rHeaderEnd > 0 ? recipientBody.slice(0, rHeaderEnd) : recipientBody.slice(0, 500);
      const rStatus = parseField(rHeader, 'Status');

      if (rStatus === 'DONE') {
        const mutualRefs = recipientBody.includes(planBasename) ||
          recipientBody.includes(planBasename.replace('.md', ''));
        if (mutualRefs) {
          items.push({ target, status: 'circular', severity: 'FAIL', reason: 'Mutual exoneration: both plans DONE and reference each other' });
        }
      }
    } catch {}

    if (structured) {
      const tokenRx = new RegExp(STRUCTURED_TOKEN_RX.source, 'g');
      const bodyAfterTarget = body.slice(body.indexOf(`handoff-target: ${target}`));
      const tokenMatch = tokenRx.exec(bodyAfterTarget);
      if (tokenMatch) {
        try {
          const recipientBody = readFileSync(resolved, 'utf-8');
          if (!recipientBody.includes(tokenMatch[1])) {
            items.push({ target, status: 'missing-token', severity: 'FAIL', reason: `Recipient missing required token: ${tokenMatch[1]}` });
          }
        } catch {}
      }
    }
  }

  const fails = items.filter(i => i.severity === 'FAIL');
  return {
    check: 'C4',
    status: fails.length > 0 ? 'FAIL' : 'PASS',
    overridable: false,
    items,
  };
}

// === C5: Strict-line vs deviation axis-match ===
const STRICT_TOKEN_RX = /\b(zero|every|all\s+\d+|all-\d+|all\d+|100%|no exceptions|exhaustive|complete)\b/i;
const ACCEPTANCE_HEADINGS = /^#{1,4}\s+(?:Acceptance|Closure|Acceptance Criteria)\s*$/im;
const ACCEPTANCE_FIELDS = /(?:\*\*Acceptance\*\*|\*\*Coverage\*\*)\s*:/i;
const PARENT_STRICT = /\*\*PARENT-STRICT-LINE\*\*/;

function extractStrictLines(body) {
  const lines = body.split('\n');
  const strictLines = [];
  let inAcceptance = false;
  let acceptanceLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2];
      if (/Acceptance|Closure|Acceptance Criteria/i.test(title)) {
        inAcceptance = true;
        acceptanceLevel = level;
        continue;
      }
      if (inAcceptance && level <= acceptanceLevel) {
        inAcceptance = false;
      }
    }

    if (ACCEPTANCE_FIELDS.test(line)) inAcceptance = true;
    if (PARENT_STRICT.test(line)) inAcceptance = true;

    if (!inAcceptance) continue;
    if (!/^\s*[-*|]/.test(line)) continue;

    const m = line.match(STRICT_TOKEN_RX);
    if (m) {
      const words = line.match(/\b[a-z]{3,}\b/gi) || [];
      const axis = words.slice(0, 2).join(' ');
      strictLines.push({ line: i + 1, token: m[0], axis, text: line.trim().slice(0, 120) });
    }
  }

  return strictLines;
}

function extractDeviations(body) {
  const deviationRx = /^#{2,4}\s+(?:Deviation|Deviations|Plan Deviations?)\s*$/im;
  const m = body.match(deviationRx);
  if (!m) return [];

  const startIdx = m.index + m[0].length;
  const rest = body.slice(startIdx);
  const nextHeading = rest.match(/^#{1,4}\s/m);
  const section = nextHeading ? rest.slice(0, nextHeading.index) : rest;

  const items = [];
  const lines = section.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\s*[-*|]\s*\d+/.test(line) && !/^\s*\d+\.\s/.test(line)) continue;
    const words = line.match(/\b[a-z]{3,}\b/gi) || [];
    items.push({ text: line.trim().slice(0, 120), words });
  }
  return items;
}

function checkC5(body) {
  const strictLines = extractStrictLines(body);
  const deviations = extractDeviations(body);

  if (strictLines.length === 0 || deviations.length === 0) {
    return { check: 'C5', status: 'PASS', overridable: false, items: [] };
  }

  const items = [];
  for (const strict of strictLines) {
    const strictWords = new Set((strict.text.match(/\b[a-z]{3,}\b/gi) || []).map(w => w.toLowerCase()));
    for (const dev of deviations) {
      const devWords = new Set(dev.words.map(w => w.toLowerCase()));
      const overlap = [...strictWords].filter(w => devWords.has(w));
      if (overlap.length >= 2) {
        items.push({
          strictLine: strict.line,
          strictToken: strict.token,
          deviationText: dev.text.slice(0, 80),
          overlap: overlap.slice(0, 5),
          severity: 'FAIL',
        });
      }
    }
  }

  return {
    check: 'C5',
    status: items.length > 0 ? 'FAIL' : 'PASS',
    overridable: false,
    items,
  };
}

// === Path exemption (M3 + R3) ===
const RULE_EXEMPT_PATHS = [
  /\.claude[\/\\]rules[\/\\]plan-closure\.md$/,
  /\.claude[\/\\]skills[\/\\]audit[\/\\]SKILL\.md$/,
  /clients\/[^/]+\/specs_planning\/_internal\/agent-mistakes\.md$/,
];

function isExempt(planPath, body) {
  const norm = normalizePath(planPath);
  if (RULE_EXEMPT_PATHS.some(rx => rx.test(norm))) return true;

  const hasMarker = /closure_meta\s*:\s*true/i.test(body.slice(0, 500));
  if (!hasMarker) return false;

  try {
    const overrides = JSON.parse(readFileSync(OVERRIDES_PATH, 'utf-8'));
    const bn = basename(planPath);
    return (overrides.meta_plans || []).includes(bn);
  } catch {
    return false;
  }
}

// === Override loading ===
function loadOverrides(mode) {
  try {
    let content;
    if (mode === 'staged') {
      content = gitExec('git show :.claude/closure-overrides.json');
    } else if (mode === 'stdin' || mode === 'retro' || mode === 'enforce') {
      content = gitExec('git show HEAD:.claude/closure-overrides.json');
    } else {
      content = readFileSync(OVERRIDES_PATH, 'utf-8');
    }
    const parsed = JSON.parse(content);
    return parsed.overrides || [];
  } catch {
    return [];
  }
}

// === Single plan validation ===
function validatePlan(body, planPath, opts = {}) {
  const bn = basename(planPath);
  const headerEnd = body.indexOf('\n---', 4);
  const header = headerEnd > 0 ? body.slice(0, headerEnd + 4) : body.slice(0, 800);
  const status = parseField(header, 'Status');

  if (status !== 'DONE' && !opts.forceCheck) {
    return { plan: bn, status: 'SKIP', reason: 'Not Status: DONE', checks: [] };
  }

  if (isExempt(planPath, body)) {
    return { plan: bn, status: 'EXEMPT', reason: 'closure_meta + meta_plans exempt', checks: [] };
  }

  const overrides = loadOverrides(opts.overrideMode || 'enforce');
  const c1 = checkC1(body, bn, overrides);
  const c2 = checkC2(body);
  const c3 = checkC3(body, planPath);
  const c4 = checkC4(body, planPath);
  const c5 = checkC5(body);

  const checks = [c1, c2, c3, c4, c5];
  const anyFail = checks.some(c => c.status === 'FAIL');

  return {
    plan: bn,
    status: anyFail ? 'FAIL' : 'PASS',
    checks,
  };
}

// === Manifest writing (V6 — only via --write-manifest) ===
function writeManifestFile(planPath, body, result) {
  if (!existsSync(MANIFEST_DIR)) mkdirSync(MANIFEST_DIR, { recursive: true });
  const bn = basename(planPath);
  const manifestFile = join(MANIFEST_DIR, `${bn}.manifest.json`);
  const tmpFile = `${manifestFile}.tmp`;
  const invocationId = `${Date.now()}-${randomBytes(16).toString('hex')}-${sha256(body).slice(0, 16)}`;

  const manifest = {
    plan: bn,
    plan_basename: bn,
    plan_sha256: sha256(body),
    passed_at: new Date().toISOString(),
    validator_version: VALIDATOR_VERSION,
    validator_config_sha256: configHash(),
    validator_self_hash: selfHash(),
    validator_invocation_id: invocationId,
    artifacts: [],
    provisional: false,
  };

  writeFileSync(tmpFile, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  renameSync(tmpFile, manifestFile);

  if (!existsSync(ATTEMPTS_DIR)) mkdirSync(ATTEMPTS_DIR, { recursive: true });
  const attemptFile = join(ATTEMPTS_DIR, `${bn}-${new Date().toISOString().slice(0, 10)}.json`);
  const attempts = existsSync(attemptFile) ? JSON.parse(readFileSync(attemptFile, 'utf-8')) : [];
  attempts.push({ invocation_id: invocationId, timestamp: new Date().toISOString(), result: result.status });
  writeFileSync(attemptFile, JSON.stringify(attempts, null, 2) + '\n', 'utf-8');

  return manifestFile;
}

// === Record blocked attempt (M2) ===
function recordAttempt(planPath, result) {
  if (!existsSync(ATTEMPTS_DIR)) mkdirSync(ATTEMPTS_DIR, { recursive: true });
  const bn = basename(planPath);
  const attemptFile = join(ATTEMPTS_DIR, `${bn}-${new Date().toISOString().slice(0, 10)}.json`);
  const attempts = existsSync(attemptFile) ? JSON.parse(readFileSync(attemptFile, 'utf-8')) : [];
  attempts.push({ timestamp: new Date().toISOString(), result: result.status, checks: result.checks?.map(c => ({ check: c.check, status: c.status })) });
  writeFileSync(attemptFile, JSON.stringify(attempts, null, 2) + '\n', 'utf-8');
}

// === Fail-closed counter (V5) ===
function recordFailClosed(planPath, error) {
  const bn = basename(planPath);
  const date = new Date().toISOString().slice(0, 10);
  const counterFile = join(FAIL_CLOSED_DIR, `closure-fail-closed-counter-${bn}-${date}.json`);
  const data = existsSync(counterFile) ? JSON.parse(readFileSync(counterFile, 'utf-8')) : { count: 0, events: [] };
  data.count++;
  data.events.push({ timestamp: new Date().toISOString(), error: String(error).slice(0, 200) });
  writeFileSync(counterFile, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// === Mode: single plan ===
function runSingle(planPath, opts) {
  const absPath = resolve(REPO_ROOT, planPath);
  let body;
  if (opts.contentFromStdin) {
    body = readFileSync(0, 'utf-8');
  } else {
    body = readFileSync(absPath, 'utf-8');
  }

  const result = validatePlan(body, absPath, { overrideMode: opts.overrideMode || 'enforce', forceCheck: opts.forceCheck });

  if (opts.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    console.log(`[${result.status}] ${result.plan}`);
    for (const c of (result.checks || [])) {
      if (c.status !== 'PASS') {
        console.log(`  ${c.check}: ${c.status}${c.overridable ? ' (OVERRIDABLE)' : ' (NOT OVERRIDABLE)'}`);
        for (const item of c.items.slice(0, 5)) {
          const detail = item.reason || item.token || item.path || item.target || '';
          console.log(`    - ${detail}`);
        }
      }
    }
  }

  if (result.status === 'FAIL') {
    recordAttempt(absPath, result);
  }

  if (opts.writeManifest && result.status === 'PASS') {
    const mf = writeManifestFile(absPath, body, result);
    console.log(`[MANIFEST] Written: ${relative(REPO_ROOT, mf)}`);
  }

  return result;
}

// === Mode: changed plans ===
function runChanged(opts) {
  let changedFiles;
  try {
    changedFiles = gitExec('git diff --name-only HEAD').split('\n').filter(Boolean);
  } catch {
    changedFiles = [];
  }
  const plans = changedFiles.filter(f => /^plans\/(pending|done)\/.*\.md$/.test(f));
  if (plans.length === 0) {
    if (!opts.json) console.log('[OK] No changed plans');
    return { status: 'PASS', plans: [] };
  }

  let anyFail = false;
  const results = [];
  for (const p of plans) {
    const r = runSingle(p, { ...opts, writeManifest: false });
    results.push(r);
    if (r.status === 'FAIL') anyFail = true;
  }
  return { status: anyFail ? 'FAIL' : 'PASS', plans: results };
}

// === Mode: all plans (retro) ===
function runAll(opts) {
  const doneDir = join(REPO_ROOT, 'plans', 'done');
  if (!existsSync(doneDir)) {
    console.log('[OK] No plans/done/ directory');
    return { status: 'PASS', plans: [] };
  }

  const files = readdirSync(doneDir).filter(f => f.endsWith('.md'));
  const results = [];
  for (const f of files) {
    const planPath = join(doneDir, f);
    const body = readFileSync(planPath, 'utf-8');
    const result = validatePlan(body, planPath, { overrideMode: 'retro', forceCheck: true });
    results.push(result);

    if (!opts.json) {
      const tag = result.status === 'EXEMPT' ? 'EXEMPT' : result.status;
      console.log(`[${tag}] ${f}`);
    }
  }

  if (opts.reportOnly) {
    if (!existsSync(AUDITS_DIR)) mkdirSync(AUDITS_DIR, { recursive: true });
    const reportFile = join(AUDITS_DIR, `_closure_audit_${new Date().toISOString().slice(0, 10)}.md`);
    const lines = [`# Closure Audit — ${new Date().toISOString().slice(0, 10)}`, ''];
    for (const r of results) {
      lines.push(`## ${r.plan} — ${r.status}`);
      for (const c of (r.checks || [])) {
        if (c.status !== 'PASS') {
          lines.push(`- ${c.check}: ${c.status}`);
        }
      }
      lines.push('');
    }
    writeFileSync(reportFile, lines.join('\n'), 'utf-8');
    console.log(`[REPORT] ${relative(REPO_ROOT, reportFile)}`);
  }

  if (opts.rewriteManifests) {
    for (const r of results) {
      if (r.status === 'PASS') {
        const planPath = join(doneDir, r.plan);
        const body = readFileSync(planPath, 'utf-8');
        writeManifestFile(planPath, body, r);
        console.log(`[MANIFEST-REWRITE] ${r.plan}`);
      }
    }
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  }

  return { status: 'PASS', plans: results };
}

// === Mode: staged plans (pre-commit) ===
function runStaged(opts) {
  let stagedFiles;
  try {
    stagedFiles = gitExec('git diff --cached --name-only').split('\n').filter(Boolean);
  } catch {
    stagedFiles = [];
  }
  const plans = stagedFiles.filter(f => /^plans\/(pending|done)\/.*\.md$/.test(f));
  if (plans.length === 0) return { status: 'PASS', plans: [] };

  let anyFail = false;
  const results = [];
  for (const p of plans) {
    let body;
    try {
      body = gitExec(`git show :${p}`);
    } catch { continue; }

    const absPath = join(REPO_ROOT, p);
    const result = validatePlan(body, absPath, { overrideMode: 'staged', forceCheck: false });
    results.push(result);
    if (result.status === 'FAIL') anyFail = true;

    if (!opts.json) {
      console.log(`[${result.status}] ${basename(p)}`);
    }
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  }

  return { status: anyFail ? 'FAIL' : 'PASS', plans: results };
}

// === Self-test ===
function runSelfTest() {
  if (!existsSync(FIXTURE_DIR)) {
    console.log('[SKIP] No fixture directory at scripts/test-fixtures/plan-closure/');
    process.exit(0);
  }

  const fixtures = readdirSync(FIXTURE_DIR).filter(f => f.endsWith('.md'));
  let passed = 0;
  let failed = 0;

  for (const f of fixtures) {
    const body = readFileSync(join(FIXTURE_DIR, f), 'utf-8');
    const fixturePath = join(FIXTURE_DIR, f);

    const fixtureOverridesPath = join(FIXTURE_DIR, '_overrides.json');
    let overrides = [];
    if (existsSync(fixtureOverridesPath)) {
      try { overrides = JSON.parse(readFileSync(fixtureOverridesPath, 'utf-8')).overrides || []; } catch {}
    }

    const headerEnd = body.indexOf('\n---', 4);
    const header = headerEnd > 0 ? body.slice(0, headerEnd + 4) : body.slice(0, 800);
    const expectedVerdict = parseField(header, 'expected_verdict') || '';
    const expectedChecks = parseField(header, 'expected_checks') || '';

    const result = validatePlan(body, fixturePath, { overrideMode: 'enforce', forceCheck: true });

    let expectPass = false;
    if (expectedVerdict === 'PASS') expectPass = true;
    else if (expectedVerdict === 'FAIL') expectPass = false;
    else if (f.startsWith('good-')) expectPass = true;
    else expectPass = false;

    const actualPass = result.status === 'PASS' || result.status === 'EXEMPT';
    const match = actualPass === expectPass;

    if (match) {
      console.log(`  [PASS] ${f}`);
      passed++;
    } else {
      console.log(`  [FAIL] ${f} — expected ${expectPass ? 'PASS' : 'FAIL'}, got ${result.status}`);
      for (const c of (result.checks || [])) {
        if (c.status !== 'PASS') {
          console.log(`    ${c.check}: ${c.status} (${c.items.length} items)`);
        }
      }
      failed++;
    }
  }

  console.log(`\nSelf-test: ${passed} passed, ${failed} failed, ${fixtures.length} total`);
  process.exit(failed > 0 ? 1 : 0);
}

// === CLI dispatch ===
const args = process.argv.slice(2);

if (args.includes('--self-test')) {
  runSelfTest();
} else {
  const planIdx = args.indexOf('--plan');
  const planPath = planIdx >= 0 ? args[planIdx + 1] : null;
  const enforce = args.includes('--enforce');
  const reportOnly = args.includes('--report-only');
  const writeManifest = args.includes('--write-manifest');
  const changed = args.includes('--changed');
  const all = args.includes('--all');
  const staged = args.includes('--staged');
  const contentFromStdin = args.includes('--content-from-stdin');
  const json = args.includes('--json');
  const rewriteManifests = args.includes('--rewrite-manifests');

  if (all) {
    const result = runAll({ json, reportOnly: reportOnly || !enforce, rewriteManifests });
    if (enforce && !reportOnly && !rewriteManifests) {
      const anyFail = result.plans.some(p => p.status === 'FAIL');
      process.exit(anyFail ? 1 : 0);
    }
  } else if (changed) {
    const result = runChanged({ json });
    process.exit(result.status === 'FAIL' ? 1 : 0);
  } else if (staged) {
    const result = runStaged({ json });
    process.exit(result.status === 'FAIL' ? 1 : 0);
  } else if (planPath) {
    const result = runSingle(planPath, {
      json,
      writeManifest,
      contentFromStdin,
      overrideMode: staged ? 'staged' : contentFromStdin ? 'stdin' : 'enforce',
      forceCheck: contentFromStdin,
    });
    if (enforce && !reportOnly) {
      process.exit(result.status === 'FAIL' ? 1 : 0);
    }
  } else {
    console.error('Usage: validate-plan-closure.mjs --plan <path> [--enforce] [--write-manifest] [--report-only] [--json]');
    console.error('       validate-plan-closure.mjs --changed --enforce [--json]');
    console.error('       validate-plan-closure.mjs --all [--report-only|--enforce --rewrite-manifests] [--json]');
    console.error('       validate-plan-closure.mjs --staged --enforce [--json]');
    console.error('       validate-plan-closure.mjs --content-from-stdin --plan <path> [--json]');
    console.error('       validate-plan-closure.mjs --self-test');
    process.exit(1);
  }
}
