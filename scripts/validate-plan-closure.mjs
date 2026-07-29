#!/usr/bin/env node
// validate-plan-closure.mjs — Plan closure validation (C1-C6 checks).
//
// Modes (V6 — --enforce is READ-ONLY; manifest writes need --write-manifest):
//   --plan <path> --enforce              Single plan, exit 1 on FAIL. READ-ONLY.
//   <path> --enforce                     Positional path form (same as --plan <path>).
//   --plan <path> --enforce --write-manifest  Single + manifest. CLOSURE-CEREMONY ONLY.
//   --plan <path> --report-only          Single, always exit 0.
//   --changed --enforce                  Plans changed in current commit set.
//   --all --report-only                  Batch retro, always exit 0.
//   --staged --enforce                   Pre-commit blob mode (git show :path).
//   --content-from-stdin --plan <path>   Hook mode (projected body on stdin).
//   --json                               Structured findings to stdout.
//   --self-test                          Synthetic fixture tests.
//   --all --enforce --rewrite-manifests  Migration tool (user-invoked only).
//
// C6 (Per-Identity Satisfaction Matrix delivery — PLAN_DONE_MEANS_DONE Phase 2.2):
//   --dry-run                            Measure C6 (+ C4 parent-cascade) without enforcing; exit 0.
//   --c6-mode=<off|announce|deny>        Override closure-config.json c6_mode for this run.
//   Default mode comes from .claude/closure-config.json (c6_mode); absent → 'off' (inert).
//
// Cx (machine-enumerated walk-coverage — LR-062) + Ct (no-red-close test-status — M3 / LR-060):
//   --coverage-mode=<off|announce|deny>      Override closure-config.json coverage_mode for this run.
//   --test-status-mode=<off|announce|deny>   Override closure-config.json test_status_mode for this run.
//   --dry-run also forces Cx + Ct measurement (verdict-neutral, exit 0).

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, renameSync, appendFileSync } from 'node:fs';
import { resolve, join, dirname, basename, relative, extname, sep } from 'node:path';
import { execSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { coverageVerdict, COVERAGE_GATE_LANDING_DATE } from './walk-coverage/lib/coverage-manifest.mjs';
import { verifyDenominator, spotAudit } from './walk-coverage/verify-denominator.mjs';

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
// C6 rollout-state config (PLAN_DONE_MEANS_DONE Phase 2.2). NOT a per-token override —
// a rollout-mode knob for the C6 check class. Lives in closure-config.json (a SEPARATE,
// agent-writable file), NOT closure-overrides.json (which is a lock-path the agent cannot edit).
const CLOSURE_CONFIG_PATH = join(REPO_ROOT, '.claude', 'closure-config.json');
const GUARDRAIL_CONFIG_PATH = join(REPO_ROOT, '.claude', 'guardrail-config.json');

const VALIDATOR_VERSION = '1.0';

// === C6 activation mode (PLAN_DONE_MEANS_DONE Phase 2.2a/2.2b) ===
// Precedence: explicit CLI --c6-mode=<off|announce|deny> > closure-config.json c6_mode > 'off'.
// 'off'      → C6 + C4-parent-cascade are NOT computed at all (legacy C1-C5 behavior, byte-identical).
// 'announce' → computed + reported in JSON, but do NOT fold into the pass/fail verdict (ramp warning only).
// 'deny'     → computed + folded into the verdict (a C6 FAIL or parent-cascade FAIL fails the plan).
// --dry-run forces measurement (like 'announce') regardless of mode AND forces process exit 0.
function readC6ModeFromConfig() {
  try {
    const cfg = JSON.parse(readFileSync(CLOSURE_CONFIG_PATH, 'utf-8'));
    if (cfg && typeof cfg.c6_mode === 'string') return cfg.c6_mode;
  } catch { /* no config → off */ }
  return 'off';
}

function resolveC6Mode(cliC6Mode) {
  const m = (cliC6Mode || readC6ModeFromConfig() || 'off').toLowerCase();
  return (m === 'announce' || m === 'deny') ? m : 'off';
}

// === Cx activation mode (PLAN_EXHAUSTIVE_WALK_GUARANTEE / LR-062) — mirrors C6 exactly ===
// Precedence: explicit CLI --coverage-mode=<off|announce|deny> > closure-config.json coverage_mode > 'off'.
function resolveCoverageMode(cliCoverageMode) {
  let cfgMode = 'off';
  try {
    const cfg = JSON.parse(readFileSync(CLOSURE_CONFIG_PATH, 'utf-8'));
    if (cfg && typeof cfg.coverage_mode === 'string') cfgMode = cfg.coverage_mode;
  } catch { /* no config → off */ }
  const m = (cliCoverageMode || cfgMode || 'off').toLowerCase();
  return (m === 'announce' || m === 'deny') ? m : 'off';
}

function resolveCoverageLandingDate() {
  try {
    const cfg = JSON.parse(readFileSync(CLOSURE_CONFIG_PATH, 'utf-8'));
    if (cfg && typeof cfg.coverage_gate_landing_date === 'string') return cfg.coverage_gate_landing_date;
  } catch { /* fall through to default */ }
  return COVERAGE_GATE_LANDING_DATE;
}

// === Ct activation mode (PLAN_CORP_PRICING_REWALK_REMEDIATION M3 / LR-060) — mirrors C6/Cx exactly ===
// Precedence: explicit CLI --test-status-mode=<off|announce|deny> > closure-config.json test_status_mode > 'off'.
function resolveTestStatusMode(cliTestStatusMode) {
  let cfgMode = 'off';
  try {
    const cfg = JSON.parse(readFileSync(CLOSURE_CONFIG_PATH, 'utf-8'));
    if (cfg && typeof cfg.test_status_mode === 'string') cfgMode = cfg.test_status_mode;
  } catch { /* no config → off */ }
  const m = (cliTestStatusMode || cfgMode || 'off').toLowerCase();
  return (m === 'announce' || m === 'deny') ? m : 'off';
}

// === Cr activation mode (SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL Phase 2) — mirrors C6/Cx/Ct ===
// Precedence: explicit CLI --recurrence-trial-mode=<off|announce|deny> > guardrail-config.json recurrence_trial_mode > 'off'.
function resolveRecurrenceTrialMode(cliMode) {
  let cfgMode = 'off';
  try {
    const cfg = JSON.parse(readFileSync(GUARDRAIL_CONFIG_PATH, 'utf-8'));
    if (cfg && typeof cfg.recurrence_trial_mode === 'string') cfgMode = cfg.recurrence_trial_mode;
  } catch { /* no config → off */ }
  const m = (cliMode || cfgMode || 'off').toLowerCase();
  return (m === 'announce' || m === 'deny') ? m : 'off';
}

// === Ci activation mode (PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION Phase 3) — mirrors C6/Cx/Ct/Cr ===
// Precedence: explicit CLI --interaction-coverage-mode=<off|announce|deny> > guardrail-config.json interaction_coverage_mode > 'off'.
function resolveInteractionCoverageMode(cliMode) {
  let cfgMode = 'off';
  try {
    const cfg = JSON.parse(readFileSync(GUARDRAIL_CONFIG_PATH, 'utf-8'));
    if (cfg && typeof cfg.interaction_coverage_mode === 'string') cfgMode = cfg.interaction_coverage_mode;
  } catch { /* no config → off */ }
  const m = (cliMode || cfgMode || 'off').toLowerCase();
  return (m === 'announce' || m === 'deny') ? m : 'off';
}

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
  // (?:>\s*)? — accept optional blockquote prefix (e.g. "> **Status**: DONE").
  // Added 2026-05-19 by PLAN_DIST_REGRESSION_AND_N_FIXES (N4) to close LR-055 bypass gap.
  const re = new RegExp(
    `(?:^|\\n)\\s*(?:>\\s*)?(?:\\*\\*)?${label}(?:\\*\\*)?\\s*:\\s*([^\\n]+)`,
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
    // Template-variable directory prefixes — e.g. `REPORTS_DIR/foo.json`, `BUNDLE_DIR/x.csv`.
    // First segment is ALL_CAPS_WITH_UNDERSCORES and ends in `_DIR` / `_PATH` / `_ROOT`.
    if (/^[A-Z][A-Z0-9_]*_(?:DIR|PATH|ROOT)\//.test(norm)) continue;
    // Placeholder filenames — `foo.csv`, `bar.md`, `baz.json`, `example.yml`, `placeholder.txt`.
    // Final segment is exactly one of these stub names. Treated as documentation, not a concrete claim.
    if (/(?:^|\/)(?:foo|bar|baz|qux|example|placeholder|sample)\.[a-z]+$/i.test(norm)) continue;
    // External user/scratch paths — `Users/<name>/.claude/...`, `~/.claude/...`, `home/<name>/.claude/...`.
    // These reference machine-local artifacts that legitimately don't live in the repo.
    if (/^(?:Users|home)\/[^/]+\/\.claude\//i.test(norm)) continue;
    if (/^~\//.test(rawP) || /^~\//.test(norm)) continue;
    // `.claude/plans/...` is a user-home subdir (Claude scratch plans). The repo's `.claude/`
    // has skills/agents/hooks/rules/context/settings/state but never `plans/`.
    // Path-regex strips the `~/` prefix, so we catch the bare `.claude/plans/` form here.
    if (/^\.claude\/plans\//.test(norm)) continue;
    // ALL-087: closure-time self-reference. A plan being validated may cite its OWN eventual
    // `done/` location and its OWN manifest path (both don't exist yet during pre-flip validation).
    // Skip these — they're forward-references that resolve at commit time.
    if (norm === `plans/done/${planBasename}`) continue;
    if (norm === `plans/pending/${planBasename}`) continue;
    if (norm === `plans/_closure_manifests/${planBasename}.manifest.json`) continue;

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

function checkC4(body, planPath, parentCascadeMode = 'off') {
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

  // === Parent-cascade sub-check (LR-027 extension, PLAN_DONE_MEANS_DONE Phase 2.7) ===
  // Every child closure MUST annotate its line in the parent's body IFF the parent is still
  // in plans/pending/. Parents already in plans/done/ are inert — silently skipped (P2 scope
  // guardrail). Gated by parentCascadeMode (same rollout activation as C6): 'off' → skip;
  // 'measure' → WARN (reported, non-failing); 'deny' → FAIL (folds into C4 verdict).
  if (parentCascadeMode !== 'off') {
    const headerEndPC = body.indexOf('\n---', 4);
    const headerPC = headerEndPC > 0 ? body.slice(0, headerEndPC + 4) : body.slice(0, 800);
    // Extract the parent filename TOKEN — tolerate trailing prose in the field
    // (e.g. "**Parent**: PLAN_X.md (also annotates the master)") which would otherwise
    // fail a `\.md$` anchor and silently skip the cascade (false-negative).
    const parentRaw = parseField(headerPC, 'Parent');
    const parentMatch = parentRaw && parentRaw.match(/(?:SUBPLAN_|PLAN_)[A-Za-z0-9_]+\.md/);
    const parentRef = parentMatch ? parentMatch[0] : '';
    if (parentRef) {
      const sev = parentCascadeMode === 'deny' ? 'FAIL' : 'WARN';
      const pendingParent = join(REPO_ROOT, 'plans', 'pending', parentRef);
      const doneParent = join(REPO_ROOT, 'plans', 'done', parentRef);
      if (existsSync(pendingParent)) {
        let annotated = false;
        try {
          const parentLines = readFileSync(pendingParent, 'utf-8').split('\n');
          const childStem = planBasename.replace(/\.md$/, '');
          for (let i = 0; i < parentLines.length; i++) {
            if (parentLines[i].includes(childStem)) {
              const windowText = parentLines.slice(i, i + 7).join('\n');
              if (/\bDONE\b/.test(windowText)) { annotated = true; break; }
            }
          }
        } catch { annotated = true; /* unreadable parent → don't block on cascade */ }
        if (!annotated) {
          items.push({ target: parentRef, status: 'parent-cascade-missing', severity: sev,
            reason: `parent-cascade missing annotation (pending parent) — annotate "${planBasename}" DONE line in ${parentRef} body per LR-027` });
        }
      } else if (existsSync(doneParent)) {
        /* done parent is inert — silently skip (P2) */
      } else {
        items.push({ target: parentRef, status: 'phantom-parent', severity: sev,
          reason: `declared Parent "${parentRef}" does not exist in plans/{pending,done}/` });
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

// === C6: Per-Identity Satisfaction Matrix delivery (PLAN_DONE_MEANS_DONE Phase 2.2a) ===
// Each matrix row's "Concrete deliverable" cell must resolve to one of three explicit forms
// (LR-048 v3): a repo-relative file path that EXISTS, `(skipped: <reason ≥20 chars>)`, or `(none)`.
// Vague prose ("spot-check log", "typecheck + lint + parity outputs", "inline claims") → FAIL.
// NOT OVERRIDABLE (matches C2-C5). Remediation = emit the file / change to (skipped:...) / (none).

function fileExistsRelativeToRepo(p) {
  if (!p) return false;
  // Absolute path (Windows drive or POSIX root) — check as-is.
  if (/^[A-Za-z]:[\\/]/.test(p) || p.startsWith('/')) {
    try { return existsSync(p); } catch { return false; }
  }
  const norm = p.replace(/\\/g, '/');
  try { return existsSync(join(REPO_ROOT, norm)); } catch { return false; }
}

// Split a markdown table row into trimmed cells, preserving RAW cell content
// (including <br> separators and backticks). Escaped pipes (\|) are kept literal.
function splitTableRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  const PLACEHOLDER = ' ';
  s = s.replace(/\\\|/g, PLACEHOLDER);
  return s.split('|').map(c => c.replace(new RegExp(PLACEHOLDER, 'g'), '\\|').trim());
}

// Locate "## Per-Identity Satisfaction" (h2 or h3); return null if absent (C6 skip),
// { malformed: true } if the table is broken, else { malformed:false, rows:[{identity,
// concreteDeliverable, acceptanceCommand}] } with cell content preserved RAW.
function parsePerIdentityMatrix(planBody) {
  const headingRx = /^#{2,3}\s+Per-Identity Satisfaction[^\n]*$/im;
  const hm = planBody.match(headingRx);
  if (!hm) return null;

  const rest = planBody.slice(hm.index + hm[0].length);
  const lines = rest.split('\n');
  const tableLines = [];
  let started = false;
  for (const line of lines) {
    const isRow = /^\s*\|.*\|\s*$/.test(line);
    if (isRow) { started = true; tableLines.push(line); continue; }
    if (started) break;                       // table block ended
    if (/^#{1,6}\s/.test(line)) break;        // hit next heading before any table
  }
  if (tableLines.length < 2) return { malformed: true, rows: [] };

  const headerCells = splitTableRow(tableLines[0]);
  const idIdx = headerCells.findIndex(c => /identity/i.test(c));
  const delivIdx = headerCells.findIndex(c => /concrete deliverable/i.test(c));
  const acceptIdx = headerCells.findIndex(c => /acceptance/i.test(c));
  if (delivIdx === -1) return { malformed: true, rows: [] };

  const rows = [];
  for (let i = 2; i < tableLines.length; i++) {
    if (/^\s*\|[-:\s|]+\|\s*$/.test(tableLines[i])) continue;   // stray separator
    const cells = splitTableRow(tableLines[i]);
    if (cells.length === 0 || cells.every(c => c === '')) continue;
    rows.push({
      identity: idIdx >= 0 && idIdx < cells.length ? cells[idIdx] : '',
      concreteDeliverable: delivIdx < cells.length ? cells[delivIdx] : '',
      acceptanceCommand: acceptIdx >= 0 && acceptIdx < cells.length ? cells[acceptIdx] : '',
    });
  }
  if (rows.length < 2) return { malformed: true, rows };
  return { malformed: false, rows };
}

function checkC6(body) {
  const matrix = parsePerIdentityMatrix(body);
  if (matrix === null) {
    // No matrix section → conditional check does not apply. Silent PASS (skip).
    return { check: 'C6', status: 'PASS', overridable: false, skipped: true, items: [] };
  }
  if (matrix.malformed) {
    return { check: 'C6', status: 'FAIL', overridable: false, items: [
      { reason: 'matrix table malformed (missing Concrete-deliverable column or fewer than 2 data rows)' },
    ] };
  }

  const failures = [];
  for (const row of matrix.rows) {
    const cellRaw = row.concreteDeliverable;
    // Multi-line cells: split on <br>/<br/>/<br /> and newlines; validate each line independently.
    const cellNormalized = cellRaw.replace(/<br\s*\/?>/gi, '\n');
    const cellLines = cellNormalized.split('\n').map(s => s.trim()).filter(Boolean);
    if (cellLines.length === 0) {
      failures.push({ check: 'C6', identity: row.identity, cell: cellRaw,
        reason: 'empty cell — must be file path / (skipped: <reason ≥20 chars>) / (none)' });
      continue;
    }
    const cellFailures = [];
    for (const lineRaw of cellLines) {
      const line = lineRaw.replace(/^`+|`+$/g, '').trim();   // strip surrounding code-ticks
      if (line === '(none)') continue;
      if (/^\(skipped:\s*.{20,}\)$/.test(line)) continue;
      const looksLikePath = /^[A-Za-z0-9_./-]+\.\w{1,5}$/.test(line);
      if (looksLikePath) {
        if (!fileExistsRelativeToRepo(line)) {
          cellFailures.push(`line "${line}" — file does not exist at repo path`);
        }
        continue;
      }
      cellFailures.push(`line "${line}" — vague prose; must be repo-relative file path / (skipped: <reason ≥20 chars>) / (none)`);
    }
    if (cellFailures.length > 0) {
      failures.push({ check: 'C6', identity: row.identity, cell: cellRaw, reason: cellFailures.join('; ') });
    }
  }

  return {
    check: 'C6',
    status: failures.length > 0 ? 'FAIL' : 'PASS',
    overridable: false,
    items: failures,
  };
}

// === Cx: machine-enumerated walk-coverage completeness (LR-062 / PLAN_EXHAUSTIVE_WALK_GUARANTEE) ===
// When a plan cites a walk-driven artifact (field-inventory / old-site-baseline), that artifact's
// Coverage Manifest must be complete (Coverage_Ratio 100% / CrossCheck clean / no PARTIAL / no
// undispositioned rows — coverage-manifest.mjs is the shared source of truth, also used by the
// execution-completion Stop hook). Grandfathered when MCP_Session_Date precedes the landing date.
// NON-overridable like C2-C6 — remediate by completing the walk, not by a per-token escape.
const WALK_ARTIFACT_RX = /(?:field-inventories|old-site-baseline)\/[^/\s]+\.md$/;

function checkCx(body, planPath, landingDate) {
  const items = [];
  // Fixture-path scoping: walk artifacts under scripts/test-fixtures/ are deliberately-shaped
  // samples (incl. intentionally-fabricated ones) for the gate's own self-tests. A REAL plan that
  // merely references a fixture path in prose (e.g. this gate's own subplan documenting its
  // negative-test) must NOT be Cx-failed by reading that fixture as a production walk artifact —
  // but a FIXTURE PLAN (itself under test-fixtures/) MUST still process them, or the cx-provenance
  // negative tests would no-op. So: exclude fixture citations unless the plan itself is a fixture.
  const planIsFixture = normalizePath(planPath).includes('test-fixtures/');
  const cited = extractCitedPaths(body).map(normalizePath)
    .filter(p => WALK_ARTIFACT_RX.test(p) && (planIsFixture || !p.includes('test-fixtures/')));
  const seen = new Set();
  for (const rel of cited) {
    if (seen.has(rel)) continue;
    seen.add(rel);
    const abs = join(REPO_ROOT, rel);
    if (!existsSync(abs)) continue;   // missing cited path → C3's job, not Cx's
    let text = '';
    try { text = readFileSync(abs, 'utf-8'); } catch { continue; }
    // artifactPath enables the provenance sub-gate's on-disk evidence verification
    // (exists / fresh / names-control). provenanceFail marks a FABRICATION-class incompleteness
    // (oracle / missing-provenance / missing-or-stale evidence on an observation-claiming row),
    // distinct from a mundane ratio/crosscheck gap — runSingle turns it into an integrity strike.
    const v = coverageVerdict(text, landingDate, { artifactPath: abs });
    if (!v.applicable) continue;      // grandfathered or no coverage manifest present
    if (!v.complete) items.push({ artifact: rel, reasons: v.reasons, severity: 'FAIL', fabrication: !!v.provenanceFail });
    // W-DENOM: denominator integrity (item 4) + spot audit (item 7) -- only when coverage is complete.
    if (v.applicable && v.complete && v.signals.hasCompletionRecord) {
      const jsonRel = v.signals.completionRef.replace(/\s*\(.*\)$/, '').trim();
      const jsonPath = join(REPO_ROOT, jsonRel);
      const dr = verifyDenominator(text, jsonPath);
      const sr = spotAudit(text);
      const denomReasons = [];
      if (!dr.ok) denomReasons.push(...(dr.reasons || [dr.reason]).filter(Boolean));
      if (!sr.ok) denomReasons.push(...sr.failures.map(f => `spot-audit: ${f}`));
      if (denomReasons.length > 0) items.push({ artifact: rel, reasons: denomReasons, severity: 'FAIL', fabrication: false });
    }
  }
  return { check: 'Cx', status: items.length > 0 ? 'FAIL' : 'PASS', overridable: false, items };
}

// === Ct: no-red-close test-status deferral gate (PLAN_CORP_PRICING_REWALK_REMEDIATION M3 / LR-060) ===
// A plan must not flip Status: DONE while owned spec tests are red unless a `## Deferral Authorization`
// names the red TC IDs AND points to a PENDING recipient subplan — NEVER a transient task chip (the M3
// miss: 10 red toolbar tests deferred to a task chip on a DONE flip). The validator cannot run tests,
// so it keys on the DEFERRAL EVIDENCE present in the plan body — it catches the documented-deferral
// holes, not silently-shipped red (that is the suite-run acceptance criterion + /final-q + the
// execution-completion hook):
//   A. a task-chip recipient (task_<hex>) cited on a line with test-status language → FAIL (a task chip
//      evaporates; the red tests then rot with no durable owner).
//   B. a `## Deferral Authorization` block that concerns test status (a red/fail/skip/fixme signal +
//      a test/spec/TC context) but omits a TC ID OR a PENDING recipient subplan that EXISTS in
//      plans/pending/ → FAIL.
// Mirrors C6/Cx rollout: off → not computed; announce → measured + reported, verdict-neutral; deny →
// folded into the verdict. NON-overridable — remediate by greening the tests OR filing a real PENDING
// recipient subplan that names the red TC IDs (an override cannot convert red into green).
const TASK_CHIP_RX = /\btask_[0-9a-f]{6,}\b/;
const TEST_STATUS_TERM_RX = /\b(red|failing|failed|fails|test\.skip|test\.fixme|skipped|missing-coverage)\b/i;
const TEST_CONTEXT_RX = /\b(test|spec)\b|TC-[A-Z]/;
const TC_ID_RX = /\bTC-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/;
const RECIPIENT_SUBPLAN_RX = /(SUBPLAN_|PLAN_)[A-Za-z0-9_]+\.md/g;

function checkCt(body) {
  const items = [];
  const lines = body.split('\n');
  let inFence = false;

  // --- A. task-chip-as-test-recipient (the exact M3 violation) ---
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (shouldDropLineC1(line)) continue;   // skip headings / blockquotes / e.g.|example lines
    if (TASK_CHIP_RX.test(line) && TEST_STATUS_TERM_RX.test(line)) {
      items.push({ check: 'Ct', line: i + 1, severity: 'FAIL',
        reason: `red/failing tests deferred to a transient task chip ("${line.trim().slice(0, 90)}") — route the red TC IDs to a PENDING recipient subplan, never a task chip (M3 / LR-060)` });
    }
  }

  // --- B. Deferral Authorization completeness for test-status ---
  const daRx = /^#{2,4}\s+Deferral Authorization\b[^\n]*$/im;
  const m = body.match(daRx);
  if (m) {
    const startIdx = m.index + m[0].length;
    const rest = body.slice(startIdx);
    const nextHeading = rest.match(/^#{1,4}\s/m);
    const section = nextHeading ? rest.slice(0, nextHeading.index) : rest;
    const concernsTests = TEST_STATUS_TERM_RX.test(section) && TEST_CONTEXT_RX.test(section);
    if (concernsTests) {
      if (!TC_ID_RX.test(section)) {
        items.push({ check: 'Ct', severity: 'FAIL',
          reason: 'Deferral Authorization defers test status but names no TC ID — list the red TC IDs (M3 / LR-060)' });
      }
      let hasPendingRecipient = false;
      const recRx = new RegExp(RECIPIENT_SUBPLAN_RX.source, 'g');
      let rm;
      while ((rm = recRx.exec(section)) !== null) {
        if (existsSync(join(REPO_ROOT, 'plans', 'pending', rm[0]))) { hasPendingRecipient = true; break; }
      }
      if (!hasPendingRecipient) {
        items.push({ check: 'Ct', severity: 'FAIL',
          reason: 'Deferral Authorization defers test status but points to no PENDING recipient subplan in plans/pending/ — a task chip is not a valid recipient (M3 / LR-060)' });
      }
    }
  }

  const fails = items.filter(i => i.severity === 'FAIL');
  return { check: 'Ct', status: fails.length > 0 ? 'FAIL' : 'PASS', overridable: false, items };
}

// === Cr: Recurrence-trial detector (SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL Phase 2) ===
// Shells out to scripts/check-recurrence-trial.mjs --file <planPath>. Fail-closed: if the
// detector script is missing or crashes, Cr FAILs loudly — a gate that scores PASS when it
// never ran manufactures false assurance (Hard Constraint 5).
function checkCr(body, planPath) {
  const detectorPath = join(__dirname, 'check-recurrence-trial.mjs');

  if (!existsSync(detectorPath)) {
    return {
      check: 'Cr', status: 'FAIL', overridable: false,
      items: [{ reason: 'Detector script missing: scripts/check-recurrence-trial.mjs — fail-closed (gate never ran)' }],
    };
  }

  try {
    const output = execSync(`node "${detectorPath}" --file "${planPath}"`, {
      cwd: REPO_ROOT, encoding: 'utf-8', timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { check: 'Cr', status: 'PASS', overridable: false, items: [] };
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '');
    const lines = output.split('\n').filter(l => l.trim());
    const items = lines
      .filter(l => /FAIL/.test(l) && !/^VERDICT:/.test(l.trim()))
      .map(l => ({ reason: l.trim() }));
    if (items.length === 0) {
      items.push({ reason: output.trim().slice(0, 300) || 'Detector exited non-zero with no parseable output' });
    }
    return { check: 'Cr', status: 'FAIL', overridable: false, items };
  }
}

// === Ci: Interaction-coverage gate (PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION Phase 3) ===
// Shells out to scripts/check-interaction-coverage.mjs --plan <planPath>. Fail-closed: if the
// detector script or schema module is missing, Ci FAILs loudly — a gate that scores PASS when it
// never ran manufactures false assurance.
function checkCi(body, planPath) {
  const detectorPath = join(__dirname, 'check-interaction-coverage.mjs');
  const schemaPath = join(__dirname, 'walk-coverage', 'interaction-map-schema.mjs');

  if (!existsSync(detectorPath)) {
    return {
      check: 'Ci', status: 'FAIL', overridable: false,
      items: [{ reason: 'Detector script missing: scripts/check-interaction-coverage.mjs — fail-closed (gate never ran)' }],
    };
  }
  if (!existsSync(schemaPath)) {
    return {
      check: 'Ci', status: 'FAIL', overridable: false,
      items: [{ reason: 'Schema module missing: scripts/walk-coverage/interaction-map-schema.mjs — fail-closed (gate never ran)' }],
    };
  }

  try {
    const output = execSync(`node "${detectorPath}" --plan "${planPath}"`, {
      cwd: REPO_ROOT, encoding: 'utf-8', timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { check: 'Ci', status: 'PASS', overridable: false, items: [] };
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '');
    const lines = output.split('\n').filter(l => l.trim());
    const items = lines
      .filter(l => /FAIL/.test(l) && !/^VERDICT:/.test(l.trim()))
      .map(l => ({ reason: l.trim() }));
    if (items.length === 0) {
      items.push({ reason: output.trim().slice(0, 300) || 'Detector exited non-zero with no parseable output' });
    }
    return { check: 'Ci', status: 'FAIL', overridable: false, items };
  }
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

  const hasMarker = /closure_meta\s*:\s*true/i.test(body.slice(0, 2000));
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

  // C6 family activation (PLAN_DONE_MEANS_DONE Phase 2.2). off | announce | deny.
  // --dry-run forces measurement (verdict-neutral, like announce) so Phase 0.5 can measure
  // false-positives without activating enforcement. C4's parent-cascade sub-check rides the
  // same activation (off → skip; measure → WARN; deny → FAIL folded via C4's own status).
  const c6Mode = resolveC6Mode(opts.c6Mode);
  const c6Measured = !!opts.dryRun || c6Mode === 'announce' || c6Mode === 'deny';
  const c6Enforced = !opts.dryRun && c6Mode === 'deny';
  const parentCascadeMode = c6Enforced ? 'deny' : (c6Measured ? 'measure' : 'off');

  const overrides = loadOverrides(opts.overrideMode || 'enforce');
  const c1 = checkC1(body, bn, overrides);
  const c2 = checkC2(body);
  const c3 = checkC3(body, planPath);
  const c4 = checkC4(body, planPath, parentCascadeMode);
  const c5 = checkC5(body);

  const checks = [c1, c2, c3, c4, c5];
  let c6 = null;
  if (c6Measured) {
    c6 = checkC6(body);
    checks.push(c6);
  }

  // Cx family activation (PLAN_EXHAUSTIVE_WALK_GUARANTEE / LR-062). off | announce | deny, mirroring
  // C6: --dry-run forces measurement (verdict-neutral); deny folds the FAIL into the verdict.
  const coverageMode = resolveCoverageMode(opts.coverageMode);
  const coverageMeasured = !!opts.dryRun || coverageMode === 'announce' || coverageMode === 'deny';
  const coverageEnforced = !opts.dryRun && coverageMode === 'deny';
  let cx = null;
  if (coverageMeasured) {
    cx = checkCx(body, planPath, resolveCoverageLandingDate());
    checks.push(cx);
  }

  // Ct family activation (PLAN_CORP_PRICING_REWALK_REMEDIATION M3 / LR-060). off | announce | deny,
  // mirroring C6/Cx: --dry-run forces measurement (verdict-neutral); deny folds the FAIL into the verdict.
  const testStatusMode = resolveTestStatusMode(opts.testStatusMode);
  const testStatusMeasured = !!opts.dryRun || testStatusMode === 'announce' || testStatusMode === 'deny';
  const testStatusEnforced = !opts.dryRun && testStatusMode === 'deny';
  let ct = null;
  if (testStatusMeasured) {
    ct = checkCt(body);
    checks.push(ct);
  }

  // Cr family activation (SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL Phase 2). off | announce | deny,
  // mirroring C6/Cx/Ct: announce → measured + reported, verdict-neutral; deny → folded into verdict.
  const recurrenceMode = resolveRecurrenceTrialMode(opts.recurrenceTrialMode);
  const recurrenceMeasured = !!opts.dryRun || recurrenceMode === 'announce' || recurrenceMode === 'deny';
  const recurrenceEnforced = !opts.dryRun && recurrenceMode === 'deny';
  let cr = null;
  if (recurrenceMeasured) {
    cr = checkCr(body, planPath);
    checks.push(cr);
  }

  // Ci family activation (PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION Phase 3). off | announce | deny,
  // mirroring C6/Cx/Ct/Cr: announce → measured + reported, verdict-neutral; deny → folded into verdict.
  const icMode = resolveInteractionCoverageMode(opts.interactionCoverageMode);
  const icMeasured = !!opts.dryRun || icMode === 'announce' || icMode === 'deny';
  const icEnforced = !opts.dryRun && icMode === 'deny';
  let ci = null;
  if (icMeasured) {
    ci = checkCi(body, planPath);
    checks.push(ci);
  }

  // C1-C5 always fold into the verdict (C4 already incorporates the parent-cascade item via its
  // own severity). C6 + Cx + Ct + Cr + Ci fold in only when enforced (deny, and not a dry-run).
  const baseFail = [c1, c2, c3, c4, c5].some(c => c.status === 'FAIL');
  const c6Fail = c6Enforced && c6 && c6.status === 'FAIL';
  const cxFail = coverageEnforced && cx && cx.status === 'FAIL';
  const ctFail = testStatusEnforced && ct && ct.status === 'FAIL';
  const crFail = recurrenceEnforced && cr && cr.status === 'FAIL';
  const ciFail = icEnforced && ci && ci.status === 'FAIL';
  const anyFail = baseFail || c6Fail || cxFail || ctFail || crFail || ciFail;

  return {
    plan: bn,
    status: anyFail ? 'FAIL' : 'PASS',
    c6_mode: c6Measured ? (opts.dryRun ? 'dry-run' : c6Mode) : 'off',
    coverage_mode: coverageMeasured ? (opts.dryRun ? 'dry-run' : coverageMode) : 'off',
    test_status_mode: testStatusMeasured ? (opts.dryRun ? 'dry-run' : testStatusMode) : 'off',
    recurrence_trial_mode: recurrenceMeasured ? (opts.dryRun ? 'dry-run' : recurrenceMode) : 'off',
    interaction_coverage_mode: icMeasured ? (opts.dryRun ? 'dry-run' : icMode) : 'off',
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

// === Integrity strike (SUBPLAN_CGS_B task 5 — whole-walk rejection + collective penalty) ===
// A single fabrication (oracle / missing-provenance / missing-or-stale evidence on an
// observation-claiming walk row, detected by Cx with fabrication:true) already FAILS the entire
// plan closure (Cx folds into the verdict under coverage_mode=deny). On top of that we write an
// APPEND-ONLY integrity strike to .claude/state/integrity-strikes.jsonl — a durable, collective
// record that a fabricated walk was submitted for closure. Append-only JSONL: never rewritten,
// only grown, so the strike history cannot be quietly laundered.
function recordIntegrityStrike(planPath, fabricationItems) {
  try {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    const strikeFile = join(STATE_DIR, 'integrity-strikes.jsonl');
    const entry = {
      timestamp: new Date().toISOString(),
      plan: basename(planPath),
      kind: 'walk-provenance-fabrication',
      artifacts: fabricationItems.map(i => ({ artifact: i.artifact, reasons: i.reasons })),
    };
    appendFileSync(strikeFile, JSON.stringify(entry) + '\n', 'utf-8');
    return strikeFile;
  } catch {
    return null;   // never wedge closure on a strike-log write failure
  }
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

  const result = validatePlan(body, absPath, {
    overrideMode: opts.overrideMode || 'enforce',
    forceCheck: opts.forceCheck,
    c6Mode: opts.c6Mode,
    coverageMode: opts.coverageMode,
    testStatusMode: opts.testStatusMode,
    recurrenceTrialMode: opts.recurrenceTrialMode,
    interactionCoverageMode: opts.interactionCoverageMode,
    dryRun: opts.dryRun,
  });

  if (opts.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    console.log(`[${result.status}] ${result.plan}`);
    for (const c of (result.checks || [])) {
      if (c.status !== 'PASS') {
        console.log(`  ${c.check}: ${c.status}${c.overridable ? ' (OVERRIDABLE)' : ' (NOT OVERRIDABLE)'}`);
        for (const item of c.items.slice(0, 5)) {
          // Cx items carry { artifact, reasons[] } (no singular `reason`) — render them explicitly
          // so a fabrication/incompleteness FAIL prints its cause instead of a blank line.
          const cxDetail = item.artifact ? `${item.artifact}: ${(item.reasons || []).join('; ')}` : '';
          const detail = item.reason || item.token || item.path || item.target || cxDetail || '';
          console.log(`    - ${detail}`);
        }
      }
    }
  }

  if (result.status === 'FAIL') {
    recordAttempt(absPath, result);
  }

  // Integrity strike: a fabricated walk submitted for closure under an ENFORCING coverage gate.
  // Gated to genuine closure attempts — never on the hook's projected-state pass (--content-from-stdin)
  // and never in measurement mode (--dry-run) — so a single keystroke-edit can't spam the strike log.
  if (!opts.contentFromStdin && !opts.dryRun && result.coverage_mode === 'deny') {
    const cx = (result.checks || []).find(c => c.check === 'Cx');
    const fabrication = cx ? (cx.items || []).filter(i => i.fabrication) : [];
    if (fabrication.length > 0) {
      const sf = recordIntegrityStrike(absPath, fabrication);
      if (sf) console.log(`[INTEGRITY-STRIKE] walk fabrication recorded → ${relative(REPO_ROOT, sf)}`);
    }
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
    // Forward explicit CLI mode overrides (e.g. --coverage-mode=deny on the blast-radius run) so
    // `--all` actually evaluates at the requested mode instead of silently ignoring the flag.
    const result = validatePlan(body, planPath, {
      overrideMode: 'retro', forceCheck: true,
      coverageMode: opts.coverageMode, testStatusMode: opts.testStatusMode, c6Mode: opts.c6Mode, recurrenceTrialMode: opts.recurrenceTrialMode, interactionCoverageMode: opts.interactionCoverageMode, dryRun: opts.dryRun,
    });
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

    // Generic fixtures test C1-C5 semantics; C6 is exercised by dedicated synthetic fixtures
    // (PLAN_DONE_MEANS_DONE Phase 2.2a self-tests, run via --dry-run). Force C6 off here so the
    // legacy fixture verdicts stay stable regardless of closure-config.json's live c6_mode.
    const result = validatePlan(body, fixturePath, { overrideMode: 'enforce', forceCheck: true, c6Mode: 'off', coverageMode: 'off', testStatusMode: 'off', recurrenceTrialMode: 'off', interactionCoverageMode: 'off' });

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
  let planPath = planIdx >= 0 ? args[planIdx + 1] : null;
  // Positional path support (PLAN_DONE_MEANS_DONE verification commands use the bare form,
  // e.g. `validate-plan-closure.mjs plans/done/X.md --dry-run`).
  if (!planPath) {
    planPath = args.find(a => !a.startsWith('--') && /\.md$/i.test(a)) || null;
  }
  const enforce = args.includes('--enforce');
  const reportOnly = args.includes('--report-only');
  const writeManifest = args.includes('--write-manifest');
  const changed = args.includes('--changed');
  const all = args.includes('--all');
  const staged = args.includes('--staged');
  const contentFromStdin = args.includes('--content-from-stdin');
  const json = args.includes('--json');
  const rewriteManifests = args.includes('--rewrite-manifests');
  // C6 (PLAN_DONE_MEANS_DONE Phase 2.2): --dry-run measures C6 without enforcing (always exit 0);
  // --c6-mode=<off|announce|deny> overrides closure-config.json for this invocation.
  const dryRun = args.includes('--dry-run');
  const c6ModeArg = args.find(a => a.startsWith('--c6-mode='));
  const c6Mode = c6ModeArg ? c6ModeArg.split('=')[1] : undefined;
  const coverageModeArg = args.find(a => a.startsWith('--coverage-mode='));
  const coverageMode = coverageModeArg ? coverageModeArg.split('=')[1] : undefined;
  const testStatusModeArg = args.find(a => a.startsWith('--test-status-mode='));
  const testStatusMode = testStatusModeArg ? testStatusModeArg.split('=')[1] : undefined;
  const recurrenceTrialModeArg = args.find(a => a.startsWith('--recurrence-trial-mode='));
  const recurrenceTrialMode = recurrenceTrialModeArg ? recurrenceTrialModeArg.split('=')[1] : undefined;
  const interactionCoverageModeArg = args.find(a => a.startsWith('--interaction-coverage-mode='));
  const interactionCoverageMode = interactionCoverageModeArg ? interactionCoverageModeArg.split('=')[1] : undefined;

  if (all) {
    const result = runAll({ json, reportOnly: reportOnly || !enforce, rewriteManifests, coverageMode, testStatusMode, c6Mode, recurrenceTrialMode, interactionCoverageMode, dryRun });
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
      dryRun,
      c6Mode,
      coverageMode,
      testStatusMode,
      recurrenceTrialMode,
      interactionCoverageMode,
      overrideMode: staged ? 'staged' : contentFromStdin ? 'stdin' : 'enforce',
      forceCheck: contentFromStdin || dryRun,
    });
    if (dryRun) {
      process.exit(0);                       // measurement mode never blocks
    } else if (enforce && !reportOnly) {
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
