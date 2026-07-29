#!/usr/bin/env node
/**
 * scripts/check-recurrence-trial.mjs
 * Sev: S1 | Graduating incident: 2026-07-17 Override walk gaps
 *
 * Recurrence-trial detector — six checks for plan/RCA quality:
 *   1. Recurrence detection (missing ## Prior-Fix Trial)
 *   2. Fake-fix claim check (absent or unwired cited artifacts)
 *   3. Human-catch ledger validation (.claude/state/human-catches.jsonl)
 *   4. Phase-3 CONVICTED teeth (missing file:line, removal diff, parity table)
 *   5. Session-catch (layer-a signal with no same-day ledger entry)
 *   6. Fire telemetry (gate-fires.log, no dark gate)
 *
 * CLI:
 *   node scripts/check-recurrence-trial.mjs --self-test       → exit 0 on all pass
 *   node scripts/check-recurrence-trial.mjs --file <path>     → exit 0 on pass
 *   node scripts/check-recurrence-trial.mjs --check-session "<text>" --date "YYYY-MM-DD"
 */

import { readFileSync, existsSync, appendFileSync, mkdirSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { resolve, join, dirname, basename, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { detectHumanCatch } from './human-catch-reflex.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const STATE_DIR = join(ROOT, '.claude', 'state');
const GATE_FIRES_LOG = join(STATE_DIR, 'gate-fires.log');
const HUMAN_CATCHES_PATH = join(STATE_DIR, 'human-catches.jsonl');
const FIXTURE_DIR = join(ROOT, 'scripts', 'walk-coverage', 'fixtures', 'recurrence-trial');
const GATE_NAME = 'check-recurrence-trial';
// §3.5 graduating incident date — plans executed before this are exempt from recurrence check
const RECURRENCE_RULE_LANDING = '2026-07-17';

// ── Helpers ─────────────────────────────────────────────────────────────────

function safeRead(filePath) {
  try { return readFileSync(filePath, 'utf-8'); } catch { return null; }
}

function norm(p) { return String(p).replace(/\\/g, '/'); }

/** Basename-in-tree check — distinguishes moved files from fabricated ones.
 *  Two tiers: (1) current tracked tree, (2) full git history. */
const _basenameCache = new Map();
function getGitTrackedBasenames(rootDir) {
  if (_basenameCache.has(rootDir)) return _basenameCache.get(rootDir);
  const names = new Set();
  try {
    const out = execSync('git ls-files', { cwd: rootDir, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    for (const line of out.split('\n')) {
      const t = line.trim();
      if (t) names.add(basename(t));
    }
  } catch { /* not in a git repo */ }
  _basenameCache.set(rootDir, names);
  return names;
}

const _historyCache = new Map();
function getHistoricalBasenames(rootDir) {
  if (_historyCache.has(rootDir)) return _historyCache.get(rootDir);
  const names = new Set();
  try {
    const out = execSync('git log --all --diff-filter=ACMR --name-only --pretty=format:""',
      { cwd: rootDir, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, timeout: 30000 });
    for (const line of out.split('\n')) {
      const t = line.trim();
      if (t) names.add(basename(t));
    }
  } catch { /* timeout or not in a git repo */ }
  _historyCache.set(rootDir, names);
  return names;
}

// Untracked-basename index — walks disk once (skipping noise dirs) to catch git-excluded files
// cited by bare basename. Distinct from getGitTrackedBasenames (git ls-files only).
const _untrackedBasenameCache = new Map();
const WALK_SKIP_DIRS = new Set(['node_modules', '.git', 'test-results', 'playwright-report']);
function getUntrackedDiskBasenames(rootDir) {
  if (_untrackedBasenameCache.has(rootDir)) return _untrackedBasenameCache.get(rootDir);
  const names = new Set();
  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!WALK_SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name));
      } else {
        names.add(entry.name);
      }
    }
  }
  walk(rootDir);
  _untrackedBasenameCache.set(rootDir, names);
  return names;
}

// FIX 1: git-excluded detection — file exists on disk but is not git-tracked
const _trackedPathCache = new Map();
function getGitTrackedPaths(rootDir) {
  if (_trackedPathCache.has(rootDir)) return _trackedPathCache.get(rootDir);
  const paths = new Set();
  try {
    const out = execSync('git ls-files', { cwd: rootDir, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    for (const line of out.split('\n')) {
      const t = line.trim();
      if (t) paths.add(t); // forward-slash relative paths as git emits them
    }
  } catch { /* not in a git repo */ }
  _trackedPathCache.set(rootDir, paths);
  return paths;
}

function isGitTracked(absPath, rootDir) {
  const relPath = norm(relative(rootDir, absPath));
  return getGitTrackedPaths(rootDir).has(relPath);
}

/** BLOCKER 2: Content validation — empty/binary/unreadable → UNCHECKABLE */
function validateContent(content, filePath) {
  if (!content || !content.trim())
    return { valid: false, reason: `Empty or whitespace-only: ${filePath}` };
  if (/\x00/.test(content))
    return { valid: false, reason: `Binary content (null bytes): ${filePath}` };
  const sample = content.slice(0, 1024);
  const nonPrintable = sample.replace(/[\x20-\x7E\t\n\r\u00A0-\uFFFF]/g, '').length;
  if (nonPrintable / sample.length > 0.3)
    return { valid: false, reason: `Binary content (non-printable ratio): ${filePath}` };
  return { valid: true };
}

/** MAJOR 3: Strip code blocks, blockquotes, strikethrough, inline code */
function stripMarkdownNoise(text) {
  let cleaned = text.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`[^`]*`/g, '');
  cleaned = cleaned.split('\n').filter(l => !/^\s*>/.test(l)).join('\n');
  cleaned = cleaned.replace(/~~[^~]+~~/g, '');
  return cleaned;
}

/** MAJOR 4: Reject unsupported path forms */
function validatePathForm(p) {
  if (/^[/\\]/.test(p) || /^[A-Za-z]:/.test(p))
    return { valid: false, reason: `Absolute path uncheckable: ${p}` };
  if (/[*?]/.test(p))
    return { valid: false, reason: `Glob pattern uncheckable: ${p}` };
  if (/[/\\]$/.test(p))
    return { valid: false, reason: `Directory path uncheckable: ${p}` };
  if (/\.$/.test(p) && !/\.[a-z]{1,4}$/i.test(p))
    return { valid: false, reason: `Trailing dot malformed: ${p}` };
  return { valid: true };
}

/** BLOCKER 1: Check parity table has at least one populated data row with substantive content */
function isSubstantiveCell(cell) {
  const trimmed = cell.trim();
  if (trimmed.length <= 1) return false;
  if (/^[^a-zA-Z0-9]*$/.test(trimmed)) return false;
  if (/^[-–—_.x*+]+$/i.test(trimmed)) return false;
  if (trimmed.length < 4) return false;
  return true;
}

function hasPopulatedParityRows(section) {
  const lines = section.split('\n');
  let pastSeparator = false;
  for (const line of lines) {
    if (!/^\s*\|/.test(line)) { pastSeparator = false; continue; }
    if (/^[|\s\-:]+$/.test(line)) { pastSeparator = true; continue; }
    if (pastSeparator) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2 && isSubstantiveCell(cells[0]) && isSubstantiveCell(cells[1])) return true;
    }
  }
  return false;
}

/** Extract **Executed**: YYYY-MM-DD from plan content (LR-027 mandate) */
function extractExecutedDate(content) {
  const m = content.match(/\*{2}Executed\*{0,2}:?\s*(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

/** Check if plan is closed (COMPLETED heading or terminal Status value) */
function isDonePlan(content) {
  if (/^#\s*COMPLETED\b/m.test(content)) return true;
  const m = content.match(/\*{0,2}Status\*{0,2}:\s*(\w+)/i);
  if (m) {
    const s = m[1].toUpperCase();
    return ['DONE', 'SUPERSEDED', 'FOLDED', 'ARCHIVED', 'CANCELLED', 'DROPPED'].includes(s);
  }
  return false;
}

function fireTelemetry(verdict, target) {
  mkdirSync(dirname(GATE_FIRES_LOG), { recursive: true });
  appendFileSync(GATE_FIRES_LOG,
    `${GATE_NAME}, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
}

// ── Check 1: Recurrence Detection ───────────────────────────────────────────

function isRecurrenceClass(content) {
  // Strip inline code and file paths to avoid matching tokens inside filenames
  const stripped = content.replace(/`[^`]*`/g, '').replace(/[a-zA-Z0-9_\-./]+\.[a-z]{1,4}/g, '');
  const paragraphs = stripped.split(/\n\s*\n/);

  const RECURRENCE_RX = /\b(?:recurred|recurring|recurrence|recurs|still\s+(?:happens|happening|broken|failing)|happened\s+again|another\s+instance|same\s+class\s+(?:of|recurred)|repeated(?:ly)?)\b/i;
  const NEGATION_RX = /\b(?:no|not|without|zero|never|none|prevent)\s+(?:recurred|recurring|recurrence|recurs|repeated)/i;
  // Specific prior-remediation signal: a named fix (plan, commit, phrase) that was supposed to work.
  // A bare LR-NNN doctrine citation does NOT satisfy this; LR-NNN counts only when the text
  // explicitly frames it as the fix that failed (e.g. "despite LR-069", "LR-069 was supposed to").
  const PRIOR_REMEDIATION_RX = /\b(?:previous|last|prior)\s+fix\b|\bpermanent\s+fix\b|\balready\s+fixed\s+in\b|\bwas\s+supposed\s+to\s+(?:be\s+)?fix|\bdespite\s+(?:LR-\d{3}|HARD\s+STOP)\b|\b(?:LR-\d{3}|HARD\s+STOP)\b[^.\n]{0,80}?\b(?:was\s+supposed|was\s+insufficient|failed\s+(?:on|in|to|at|again)|has\s+failed|existed\s+and\s+none\s+fired|all\s+existed\s+and\s+none)\b|\b(?:LR-\d{3}|HARD\s+STOP)\s+failure\b/i;

  // (a) Paragraph asserts a specific prior fix failed AND contains a recurrence assertion.
  // Bare LR-NNN citations (doctrine references) do not satisfy the prior-remediation condition.
  for (const p of paragraphs) {
    const hasRecurrence = RECURRENCE_RX.test(p) && !NEGATION_RX.test(p);
    const hasPriorRemediation = PRIOR_REMEDIATION_RX.test(p);
    if (hasRecurrence && hasPriorRemediation) return true;
  }

  // (b) Module+class pair from agent-mistakes.md
  const mistakesPath = join(ROOT, 'clients', 'encore', 'specs_planning', '_internal', 'agent-mistakes.md');
  const mistakes = safeRead(mistakesPath);
  if (mistakes) {
    const rows = mistakes.split('\n')
      .filter(l => /^\|/.test(l) && !/^[|\s-]+$/.test(l));
    for (const row of rows) {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2 && !/^module$/i.test(cells[0])) {
        if (content.includes(cells[0]) && content.includes(cells[1])) return true;
      }
    }
  }

  // (c) Recurrence token AND specific prior-remediation reference on the same line.
  // "gate prevents recurrence" is prevention vocabulary, not a recurrence assertion;
  // only lines that cite a specific prior fix that failed qualify as recurrence-class.
  const RECURRENCE_LINE_RX = /\b(?:recurred|recurring|recurrence|recurs|recur|again|still\s+happened)\b/i;
  for (const line of stripped.split('\n')) {
    if (RECURRENCE_LINE_RX.test(line) && !NEGATION_RX.test(line) &&
        PRIOR_REMEDIATION_RX.test(line)) {
      return true;
    }
  }

  return false;
}

function hasPriorFixTrial(content) {
  const cleaned = stripMarkdownNoise(content);
  // MAJOR 3: Match exactly ## (h2, not h3+), with hyphen, at line start
  const match = cleaned.match(/^## Prior-Fix Trial\s*$/m);
  if (!match) return false;
  const idx = cleaned.indexOf(match[0]);
  const after = cleaned.slice(idx);
  const nextH2 = after.match(/\n## (?!Prior-Fix Trial)/);
  const section = nextH2 ? after.slice(0, nextH2.index) : after;
  return /\b(?:SURVIVES|CONVICTED)\b/.test(section);
}

export function checkRecurrence(content, filePath) {
  if (!isRecurrenceClass(content)) return { pass: true, reason: 'Not recurrence-class' };
  if (hasPriorFixTrial(content)) return { pass: true, reason: 'Has Prior-Fix Trial with verdict' };

  // Pre-gate temporal exemption — same mechanism as fake-fix MAJOR 5
  const executedDate = extractExecutedDate(content);
  if (executedDate && executedDate < RECURRENCE_RULE_LANDING) {
    return { pass: true, reason: `Pre-gate exempt: executed ${executedDate} before rule landed ${RECURRENCE_RULE_LANDING}` };
  }

  // Undated closed plan — cannot classify temporally (LR-027 violation: missing **Executed** date)
  const closed = isDonePlan(content) || (filePath && /[/\\]plans[/\\]done[/\\]/i.test(String(filePath)));
  if (!executedDate && closed) {
    return { pass: false, uncheckable: true, reason: `Cannot determine pre-gate status: plan is closed but carries no **Executed** date (LR-027 requires it)` };
  }

  return { pass: false, reason: 'Recurrence-class without ## Prior-Fix Trial (SURVIVES/CONVICTED)' };
}

// ── Check 2: Fake-Fix Claim ─────────────────────────────────────────────────

const HONEST_PENDING_RX = /\b(?:fixed\s+when\s+PLAN_\w+\s+(?:runs|lands|executes)|pending\s+plan|not\s+yet\s+(?:wired|landed|implemented))\b/i;

function extractFixClaimPaths(content) {
  // claimPaths: gate-shaped paths on prevention-claim lines (clause b wiredness applies).
  // mentionPaths: broad line-scan (clause a absent-check only; clause b does NOT apply —
  //   "wired" is only meaningful for gate-shaped artifacts named as the prevention mechanism).
  const claimPaths = new Set();
  const mentionPaths = new Set();

  // Structural discriminator — replaces the three sentence templates.
  // (i)  Gate-shaped path: basename ^(check|validate|verify)- or -(gate|hook|guard)\.,
  //      OR path lives under scripts/, .githooks/, or .claude/hooks/.
  //      (The old comment at :292-293 conceded wiredness is only meaningful for gate-shaped
  //      artifacts — this makes that concession structural.)
  // (ii) Same line contains a stemmed prevention lemma — covers inflections, adverbs, passives,
  //      noun synonyms. Negation-guarded (NEGATION_RX precedent at :212).
  //      HONEST_PENDING exemption applied downstream in checkFakeFix (paragraph-level).
  const PREVENTION_LEMMA_RX = /\b(?:prevent|block|catch|enforc|guard|stop|deny|refus|fire)/i;
  const NEGATION_SENT_RX = /\b(?:not|no|never|without)\s+(?:\w+\s+){0,3}(?:prevent|block|catch|enforc|guard|stop|deny|refus|fire)/i;
  const BACKTICK_PATH_RX = /`([^`]*\.(?:mjs|js|sh|ts|mts)(?![a-zA-Z0-9])[^`]*)`/g;

  function isGateShape(p) {
    const bn = basename(p);
    const np = p.replace(/\\/g, '/');
    if (/^(?:check|validate|verify)-/.test(bn)) return true;
    if (/-(?:gate|hook|guard)\./.test(bn)) return true;
    if (/(?:^|\/)(?:scripts|\.githooks|\.claude\/hooks)\//.test(np)) return true;
    return false;
  }

  for (const line of content.split('\n')) {
    if (!PREVENTION_LEMMA_RX.test(line)) continue;
    if (NEGATION_SENT_RX.test(line)) continue;
    BACKTICK_PATH_RX.lastIndex = 0;
    let m;
    while ((m = BACKTICK_PATH_RX.exec(line)) !== null) {
      const p = m[1].trim().replace(/[`"')}\]]+$/, '');
      if (isGateShape(p)) claimPaths.add(p);
    }
  }

  // Fourth extractor: broad line-scan. (?![a-zA-Z0-9]) prevents .json matching via \.js partial.
  // Uses stem-prefix match (no trailing \b) so inflections like "blocks", "permanently" are covered.
  for (const line of content.split('\n')) {
    if (/\b(?:fix|solution|prevent|block|catch|enforc|guard|stop|mechanism|never.again|permanent)/i.test(line)) {
      for (const m of line.matchAll(/`([^`]*\.(?:mjs|js|sh|ts|mts)(?![a-zA-Z0-9])[^`]*)`/g)) {
        const p = m[1].trim();
        if (!claimPaths.has(p)) mentionPaths.add(p);
      }
    }
  }
  return { claimPaths, mentionPaths };
}

// ── Transitive Reachability Walk ────────────────────────────────────────────
// An artifact is wired if reachable from an enforcement entry point — directly
// referenced by one, OR imported/required/invoked by something that is.
// Bounded scan: scripts/, .claude/hooks/, .githooks/ only. Cycle-safe.

// Relative import: './foo.mjs', '../bar.mjs'
const REL_IMPORT_RX = /['"](\.[./][^'"<>|\s]+\.(?:mjs|js|cjs|sh))['"]/g;
// Scope-rooted full paths appearing in any file (settings.json, comments, shell scripts)
const SCOPE_REF_RX = /(?:\.claude\/hooks|scripts|\.githooks)\/\S+?\.(?:mjs|js|cjs|sh)(?=[^\w]|$)/g;

function isInScanScope(absPath, rootDir) {
  const rel = norm(relative(rootDir, absPath));
  return rel.startsWith('scripts/') || rel.startsWith('.claude/hooks/') || rel.startsWith('.githooks/');
}

function extractScriptRefs(txt, fileDir, rootDir, filePath) {
  const refs = new Set();
  // Is this a JS/TS module file? If so, only Pattern 1 applies (avoid scanning test strings).
  const isModule = filePath && /\.(?:mjs|js|cjs|ts)$/.test(filePath);
  // Pattern 1: relative imports (ESM / CJS / dynamic) — applies to all files
  for (const m of txt.matchAll(REL_IMPORT_RX)) {
    try {
      const abs = resolve(fileDir, m[1]);
      if (isInScanScope(abs, rootDir) && existsSync(abs)) refs.add(abs);
    } catch {}
  }
  // Pattern 2: scope-rooted full paths — entry files and .sh scripts only
  // Excluded from .mjs/.js files to prevent test string constants (e.g. PERT_PATH) from
  // falsely marking comment-referenced paths as reachable.
  if (!isModule) {
    for (const m of txt.matchAll(SCOPE_REF_RX)) {
      const abs = resolve(rootDir, m[0]);
      if (existsSync(abs)) refs.add(abs);
    }
  }
  // Pattern 3: .mjs/.js basenames in .sh files within .claude/hooks/ — handles dynamic paths
  // e.g. `node "$lib_dir/check-foo.mjs"` in gate shell scripts
  const relDir = norm(relative(rootDir, fileDir));
  const isShellInHooks = filePath && filePath.endsWith('.sh') &&
    (relDir.startsWith('.claude/hooks') || relDir.startsWith('.githooks'));
  if (isShellInHooks) {
    for (const m of txt.matchAll(/\b([\w-]+\.(?:mjs|js))\b/g)) {
      for (const scanDir of ['.claude/hooks/lib', '.claude/hooks', 'scripts']) {
        const abs = join(rootDir, ...scanDir.split('/'), m[1]);
        if (existsSync(abs)) { refs.add(abs); break; }
      }
    }
  }
  return refs;
}

const _reachableCache = new Map();

function buildReachableSet(rootDir) {
  if (_reachableCache.has(rootDir)) return _reachableCache.get(rootDir);
  const entryFiles = [
    join(rootDir, 'package.json'),
    join(rootDir, '.claude', 'settings.json'),
    join(rootDir, '.claude', 'guardrail-config.json'),
    join(rootDir, 'scripts', 'validate-plan-closure.mjs'),
  ];
  try {
    for (const hf of readdirSync(join(rootDir, '.githooks'))) {
      entryFiles.push(join(rootDir, '.githooks', hf));
    }
  } catch {}
  const reachable = new Set();
  const queue = [];
  const enqueue = (abs) => {
    const k = norm(abs);
    if (!reachable.has(k)) { reachable.add(k); queue.push(abs); }
  };
  for (const src of entryFiles) {
    const txt = safeRead(src);
    if (txt) for (const ref of extractScriptRefs(txt, dirname(src), rootDir, src)) enqueue(ref);
  }
  while (queue.length > 0) {
    const cur = queue.shift();
    const txt = safeRead(cur);
    if (txt) for (const ref of extractScriptRefs(txt, dirname(cur), rootDir, cur)) enqueue(ref);
  }
  _reachableCache.set(rootDir, reachable);
  return reachable;
}

function isWired(citedPath, rootDir) {
  const name = basename(citedPath);
  // Direct reference check (original spec surfaces: hook registration, closure config, check:* npm)
  const sources = [
    join(rootDir, 'package.json'),
    join(rootDir, '.claude', 'settings.json'),
    join(rootDir, '.claude', 'guardrail-config.json'),
    join(rootDir, 'scripts', 'validate-plan-closure.mjs'),
  ];
  // Hook registration: scan every file in .githooks/
  try {
    for (const hf of readdirSync(join(rootDir, '.githooks'))) {
      sources.push(join(rootDir, '.githooks', hf));
    }
  } catch { /* .githooks/ absent or unreadable */ }
  for (const src of sources) {
    const txt = safeRead(src);
    if (txt && (txt.includes(citedPath) || txt.includes(name))) return true;
  }
  // Transitive reachability: wired if reachable from an enforcement entry point via import chain
  const reachable = buildReachableSet(rootDir);
  const absPath = resolve(rootDir, citedPath);
  if (reachable.has(norm(absPath))) return true;
  for (const r of reachable) {
    if (basename(r) === name) return true;
  }
  return false;
}

export function checkFakeFix(content, rootDir, _oracle) {
  rootDir = rootDir || ROOT;

  // MAJOR 5: Exempt pre-gate historical plans (already DONE/COMPLETED, no active recurrence claim)
  const isHistorical = isDonePlan(content);
  if (isHistorical && !isRecurrenceClass(content) && !hasPriorFixTrial(content))
    return { pass: true, reason: 'Historical closed plan exempt from fake-fix (no active recurrence claim)' };

  const { claimPaths, mentionPaths } = extractFixClaimPaths(content);
  const pathFormFailures = [];   // glob / absolute / directory / trailing-dot — UNCHECKABLE
  const gitExcludedFailures = []; // FIX 1: exists on disk but not git-tracked — UNCHECKABLE
  const genuineFailures = [];    // cited artifact provably absent — FAIL

  // BLOCKER 1 FIX: Scope pending-plan exemption per-claim (paragraph-level), not document-wide
  const paragraphs = content.split(/\n\s*\n/);

  // claimPaths = prevention-claim context (patterns 1-3): subject to absent + wiredness checks
  // mentionPaths = broad line-scan (fourth extractor): subject to absent check only (clause b n/a)
  for (const [rawP, isClaimContext] of [
    ...[...claimPaths].map(p => [p, true]),
    ...[...mentionPaths].map(p => [p, false]),
  ]) {
    // Strip line-number suffixes (:41, :134-136, :10/20), uppercase identifier suffixes
    // (:SOURCE_COMMENT_JARGON — extraction noise, not part of the path), and punctuation artifacts.
    // FIX 2: match specifically [A-Z][A-Z0-9_]* to avoid swallowing real colon-containing paths.
    let p = rawP.replace(/:\d[\d,/\-]*$/, '').replace(/:[A-Z][A-Z0-9_]*$/, '').replace(/^\(+/, '').replace(/[,);]+$/, '');
    if (!p || p.length < 3) continue;

    // Skip noise — extraction artifacts that aren't real path claims
    if (/^~[/\\]/.test(p)) continue;
    if (/[{}]/.test(p)) continue;
    if (/\s/.test(p)) continue;
    if (/^--/.test(p)) continue;
    if (/=/.test(p)) continue;
    if (/^\.[a-z]+(\.[a-z]+)?$/i.test(p)) continue; // extension-only (.ts, .mjs, .spec.ts)

    // Check if this specific claim lives in a paragraph with an honest pending marker
    const claimInPendingContext = paragraphs.some(para =>
      (para.includes(p) || para.includes(basename(p))) && HONEST_PENDING_RX.test(para)
    );
    if (claimInPendingContext) continue; // exempt only THIS claim

    // MAJOR 4: Path-form rejections are UNCHECKABLE, not FAIL — the gate cannot verify these
    // paths but they are not provably false claims. Precedence: FAIL > UNCHECKABLE > PASS.
    const pathCheck = validatePathForm(p);
    if (!pathCheck.valid) {
      pathFormFailures.push(pathCheck.reason);
      continue;
    }
    const abs = resolve(rootDir, p);
    if (!existsSync(abs)) {
      const bn = basename(p);
      const _tbn = _oracle ? _oracle.trackedBasenames : getGitTrackedBasenames(rootDir);
      const _hbn = _oracle ? _oracle.historicalBasenames : getHistoricalBasenames(rootDir);
      const _ubn = _oracle ? _oracle.untrackedDiskBasenames : getUntrackedDiskBasenames(rootDir);
      if (_tbn.has(bn)) continue;
      if (_hbn.has(bn)) continue;
      // FDLE-PLANB: basename found on disk but untracked (git-excluded) → UNCHECKABLE, not FAIL
      if (_ubn.has(bn)) {
        gitExcludedFailures.push(`Cited artifact absent by path but basename found on disk (git-excluded/untracked): ${p}`);
        continue;
      }
      genuineFailures.push(`Cited artifact absent: ${p}`);
    } else {
      const tracked = _oracle ? _oracle.isTracked(norm(relative(rootDir, abs))) : isGitTracked(abs, rootDir);
      // FIX 1: file exists on disk but is not git-tracked (git-excluded) → UNCHECKABLE.
      // FAIL asserts "this fix is fake" which is untrue; PASS asserts "verified" also untrue.
      if (!tracked) {
        gitExcludedFailures.push(`Cited artifact exists but is not git-tracked (unverifiable from repo): ${p}`);
      } else if (isClaimContext) {
        // Spec §49-55 clause (b): wiredness only applies to prevention-claim artifacts (patterns 1-3).
        // Mere mentions from the broad line-scan (fourth extractor) are not wiredness-checked —
        // "wired" is only a meaningful property of gate-shaped artifacts named as the prevention.
        const wired = _oracle?.isWired ? _oracle.isWired(p) : isWired(p, rootDir);
        if (!wired)
          genuineFailures.push(`Cited artifact exists and is tracked but is not wired (not referenced by hook registration, closure config, or check:* npm script): ${p}`);
        // else: tracked and wired → verified pass
      }
      // mentionPath (isClaimContext=false) + tracked → pass (clause b wiredness not applicable)
    }
  }
  // Precedence: FAIL > UNCHECKABLE > PASS. A genuine absent artifact is FAIL regardless of
  // git-excluded or path-form findings — a real finding must never be masked by an unverifiable one.
  if (genuineFailures.length) {
    const allReasons = [...genuineFailures, ...pathFormFailures, ...gitExcludedFailures].join('; ');
    return { pass: false, uncheckable: false, reason: allReasons };
  }
  if (pathFormFailures.length || gitExcludedFailures.length)
    return { pass: false, uncheckable: true, reason: [...pathFormFailures, ...gitExcludedFailures].join('; ') };
  if (claimPaths.size === 0 && mentionPaths.size === 0)
    return { pass: true, reason: 'No fix-claim paths cited — no fake-fix check performed' };
  if (claimPaths.size === 0)
    return { pass: true, reason: 'Mentioned artifacts exist and are git-tracked (wiredness not checked — no prevention-claim forms detected)' };
  return { pass: true, reason: 'All cited artifacts verified: exist, are git-tracked, and are wired' };
}

// ── Check 3: Ledger Validation ──────────────────────────────────────────────

const VALID_SHC = new Set([
  'crud-derivable', 'domain-rule', 'novel-control-type', 'undocumented-intent',
]);
const NA_KEYS = ['oracle', 'fixture', 'tc', 'rule'];

export function validateLedgerEntry(entry) {
  const errs = [];
  if (entry === null || entry === undefined || typeof entry !== 'object')
    return ['Entry is not an object (UNCHECKABLE)'];
  if (!entry.should_have_caught || !VALID_SHC.has(entry.should_have_caught))
    errs.push(`Invalid/missing should_have_caught: ${JSON.stringify(entry.should_have_caught)}`);
  if (entry.should_have_caught !== undefined && typeof entry.should_have_caught !== 'string')
    errs.push(`Wrong type for should_have_caught: expected string, got ${typeof entry.should_have_caught}`);
  if (!entry.never_again || typeof entry.never_again !== 'object') {
    errs.push('Missing never_again object');
  } else if (Array.isArray(entry.never_again)) {
    errs.push('never_again is array, expected object (UNCHECKABLE)');
  } else {
    for (const k of NA_KEYS) {
      const val = entry.never_again[k];
      if (val === undefined || val === null)
        errs.push(`Empty never_again.${k}`);
      else if (typeof val !== 'string')
        errs.push(`Wrong type for never_again.${k}: expected string, got ${typeof val}`);
      else if (val.trim() === '')
        errs.push(`Empty never_again.${k}`);
    }
  }
  return errs;
}

export function checkLedger(ledgerPath) {
  ledgerPath = ledgerPath || HUMAN_CATCHES_PATH;
  if (!existsSync(ledgerPath)) return { pass: true, reason: 'No ledger file' };
  const raw = safeRead(ledgerPath);
  if (!raw || !raw.trim()) return { pass: true, reason: 'Empty ledger' };

  const lines = raw.trim().split('\n').filter(l => l.trim());
  const errs = [];
  for (let i = 0; i < lines.length; i++) {
    try {
      const entry = JSON.parse(lines[i]);
      const e = validateLedgerEntry(entry);
      if (e.length) errs.push(`Line ${i + 1}: ${e.join('; ')}`);
    } catch (ex) {
      errs.push(`Line ${i + 1}: Invalid JSON`);
    }
  }
  if (errs.length) return { pass: false, reason: errs.join(' | ') };
  return { pass: true, reason: `${lines.length} entries valid` };
}

// ── Check 5: Session-Catch (layer-a with no same-day ledger entry) ──────────

export function checkSessionCatch(transcript, date, ledgerPath) {
  ledgerPath = ledgerPath || HUMAN_CATCHES_PATH;

  const detection = detectHumanCatch(transcript);
  if (!detection.detected)
    return { pass: true, reason: 'No layer-a signals in transcript' };

  if (!existsSync(ledgerPath))
    return { pass: false, reason: 'Layer-a signal detected but no ledger file' };

  const raw = safeRead(ledgerPath);
  if (!raw || !raw.trim())
    return { pass: false, reason: 'Layer-a signal detected but ledger is empty' };

  const lines = raw.trim().split('\n').filter(l => l.trim());
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.date === date) {
        const errs = validateLedgerEntry(entry);
        if (errs.length)
          return { pass: false, reason: `Same-day entry has unfilled fields: ${errs.join('; ')}` };
        return { pass: true, reason: `Valid same-day ledger entry found (date: ${date})` };
      }
    } catch { /* skip invalid lines */ }
  }

  return { pass: false, reason: `Layer-a signal on ${date} but no same-day ledger entry` };
}

// ── Check 4: CONVICTED Teeth ────────────────────────────────────────────────

const FILE_LINE_RX = /([a-zA-Z0-9_./-]+\.[a-z]{1,4}):(\d+)/g;
const REMOVAL_DIFF_RX = /\b(?:remov(?:al|ed|e|ing)|rewir(?:e|ed|ing)|delet(?:e|ed|ing)|dropp?(?:ed|ing)?)\b.*\b(?:diff|change|patch|hunk)\b/i;
const PARITY_TABLE_RX = /(?:protection[- ]?parity|parity\s+table|[Pp]rotective\s+[Ff]unction.*[Ss]urviving\s+[Mm]echanism)/;

export function checkConvictedTeeth(content, rootDir) {
  rootDir = rootDir || ROOT;
  const cleaned = stripMarkdownNoise(content);

  // MAJOR 3: Require exact ## heading with hyphen
  const headingMatch = cleaned.match(/^## Prior-Fix Trial\s*$/m);
  if (!headingMatch) return { pass: true, reason: 'No Prior-Fix Trial section' };

  const idx = cleaned.indexOf(headingMatch[0]);
  const after = cleaned.slice(idx);
  const nextH2 = after.match(/\n## (?!Prior-Fix Trial)/);
  const section = nextH2 ? after.slice(0, nextH2.index) : after;

  if (!/\bCONVICTED\b/.test(section))
    return { pass: true, reason: 'No CONVICTED verdict in Prior-Fix Trial' };

  const findings = [];

  // BLOCKER 1: file:line must resolve to a real file with a valid line
  FILE_LINE_RX.lastIndex = 0;
  const refs = [...section.matchAll(FILE_LINE_RX)];
  if (refs.length === 0) {
    findings.push('CONVICTED without file:line of old fix');
  } else {
    const anyValid = refs.some(m => {
      const filePath = m[1];
      const lineNum = parseInt(m[2], 10);
      const abs = resolve(rootDir, filePath);
      if (!existsSync(abs)) return false;
      const fileContent = safeRead(abs);
      if (!fileContent) return false;
      return lineNum <= fileContent.split('\n').length;
    });
    if (!anyValid)
      findings.push('CONVICTED file:line does not resolve to a real file and valid line');
  }

  // BLOCKER 1: Removal diff must be scoped to trial section (not anywhere in content)
  const hasRemovalDiff = REMOVAL_DIFF_RX.test(section);
  if (!hasRemovalDiff)
    findings.push('CONVICTED without rewire-or-removal diff in trial section');

  // BLOCKER 1: Parity table must have populated rows (in trial section)
  if (hasRemovalDiff) {
    if (!PARITY_TABLE_RX.test(section)) {
      findings.push('Removal diff without protection-parity table in trial section');
    } else if (!hasPopulatedParityRows(section)) {
      findings.push('Protection-parity table has no populated data rows');
    }
  }

  if (findings.length) return { pass: false, reason: findings.join('; ') };
  return { pass: true, reason: 'CONVICTED evidence complete' };
}

// ── Composite check ─────────────────────────────────────────────────────────

function checkFile(filePath, rootDir) {
  rootDir = rootDir || ROOT;
  const content = safeRead(filePath);
  if (content === null)
    return { pass: false, uncheckable: true, checks: [{ name: 'read', pass: false, reason: `Cannot read: ${filePath}` }] };

  // BLOCKER 2: Fail-closed — empty/binary/unreadable → UNCHECKABLE (exit 2)
  const validation = validateContent(content, filePath);
  if (!validation.valid)
    return { pass: false, uncheckable: true, checks: [{ name: 'content-validation', pass: false, reason: validation.reason }] };

  const checks = [
    { name: 'recurrence', ...checkRecurrence(content, filePath) },
    { name: 'fake-fix', ...checkFakeFix(content, rootDir) },
    { name: 'convicted-teeth', ...checkConvictedTeeth(content, rootDir) },
  ];
  const uncheckable = checks.some(c => c.uncheckable);
  return { pass: checks.every(c => c.pass), uncheckable, checks };
}

// ── File processing (CLI routing) ───────────────────────────────────────────

function processFile(filePath, rootDir) {
  const abs = resolve(filePath);
  if (abs.endsWith('.jsonl')) {
    const ledger = checkLedger(abs);
    return {
      pass: ledger.pass, uncheckable: false,
      checks: [{ name: 'ledger', pass: ledger.pass, reason: ledger.reason }],
    };
  }
  const result = checkFile(abs, rootDir);
  const ledger = checkLedger();
  return {
    pass: result.pass && ledger.pass,
    uncheckable: !!result.uncheckable,
    checks: [...result.checks, { name: 'ledger', pass: ledger.pass, reason: ledger.reason }],
  };
}

// ── Self-test ───────────────────────────────────────────────────────────────

function selfTest() {
  let fails = 0, total = 0;
  const assert = (ok, label) => {
    total++;
    if (!ok) { fails++; console.error(`  FAIL: ${label}`); }
    else { console.log(`  PASS: ${label}`); }
  };

  const SCRIPT_REL = 'scripts/check-recurrence-trial.mjs';

  console.log('=== Check 1: Recurrence Detection ===');
  const c1p = checkFile(join(FIXTURE_DIR, 'check1-recurrence-positive.md'));
  assert(c1p.checks.find(c => c.name === 'recurrence')?.pass === false, 'Recurrence-class without Prior-Fix Trial → recurrence FAIL');
  const c1n = checkFile(join(FIXTURE_DIR, 'check1-recurrence-negative.md'));
  assert(c1n.checks.find(c => c.name === 'recurrence')?.pass === true, 'Recurrence-class with Prior-Fix Trial → recurrence PASS');

  console.log('\n=== Check 2: Fake-Fix Claims ===');
  const c2a = checkFile(join(FIXTURE_DIR, 'check2-fakefix-absent.md'));
  assert(c2a.checks.find(c => c.name === 'fake-fix')?.pass === false, 'Absent artifact → fake-fix FAIL');
  const c2uContent = safeRead(join(FIXTURE_DIR, 'check2-fakefix-unwired.md'));
  // Hermetic oracle: declares dummy-unwired.mjs as existing on disk but untracked — result is
  // independent of whether the fixture file is git-committed.
  const c2u = checkFakeFix(c2uContent, ROOT, {
    isTracked: () => false,
    trackedBasenames: new Set(),
    historicalBasenames: new Set(),
    untrackedDiskBasenames: new Set(['dummy-unwired.mjs']),
  });
  assert(c2u.uncheckable === true, 'Existing but untracked artifact → fake-fix UNCHECKABLE (git-excluded, not provably fake)');
  // Tracked + unwired → FAIL (spec §49-55 clause b). Oracle pins both tracked and wired states hermetically.
  const c2w = checkFakeFix(
    'The gate at `scripts/check-dead-exports.test.mjs` blocks this permanently.',
    ROOT,
    { isTracked: () => true, isWired: () => false, trackedBasenames: new Set(), historicalBasenames: new Set(), untrackedDiskBasenames: new Set() }
  );
  assert(!c2w.pass && c2w.uncheckable !== true, 'Tracked but unwired artifact → fake-fix FAIL (not UNCHECKABLE)');
  const c2h = checkFile(join(FIXTURE_DIR, 'check2-fakefix-honest.md'));
  assert(c2h.pass, '"Fixed when PLAN_X runs" → PASS');

  console.log('\n=== Check 3: Human-Catch Ledger ===');
  const c3e = checkLedger(join(FIXTURE_DIR, 'check3-ledger-empty-field.jsonl'));
  assert(!c3e.pass, 'Empty never_again field → FAIL');
  const c3m = checkLedger(join(FIXTURE_DIR, 'check3-ledger-missing-shc.jsonl'));
  assert(!c3m.pass, 'Missing should_have_caught → FAIL');
  const c3v = checkLedger(join(FIXTURE_DIR, 'check3-ledger-valid.jsonl'));
  assert(c3v.pass, 'Complete entry → PASS');
  const c3r = checkLedger(HUMAN_CATCHES_PATH);
  assert(c3r.pass, 'Real human-catches.jsonl → PASS');

  console.log('\n=== Check 4: CONVICTED Teeth ===');
  const c4p = checkFile(join(FIXTURE_DIR, 'check4-convicted-no-fileline.md'));
  assert(c4p.checks.find(c => c.name === 'convicted-teeth')?.pass === false, 'CONVICTED without file:line → convicted-teeth FAIL');
  // Use inline content with real file:line for valid test (BLOCKER 1 requires real resolution)
  const c4valid = checkConvictedTeeth(
    `## Prior-Fix Trial\n\n- **Verdict**: CONVICTED\n- **Old fix**: ${SCRIPT_REL}:1\n\n### Removal diff\nRemoved the old check and rewired with removal diff applied.\n\n### Protection-parity table\n\n| Protective Function | Surviving Mechanism |\n|---|---|\n| Old regex gate | New structural parser at line 50 |\n`,
    ROOT
  );
  assert(c4valid.pass, 'CONVICTED with real file:line + scoped removal + populated parity → PASS');

  console.log('\n=== Check 3 CLI: --file .jsonl routing ===');
  const r3e = processFile(join(FIXTURE_DIR, 'check3-ledger-empty-field.jsonl'));
  assert(r3e.checks.find(c => c.name === 'ledger')?.pass === false, '--file .jsonl routes empty-field to ledger → FAIL');
  const r3m = processFile(join(FIXTURE_DIR, 'check3-ledger-missing-shc.jsonl'));
  assert(r3m.checks.find(c => c.name === 'ledger')?.pass === false, '--file .jsonl routes missing-shc to ledger → FAIL');
  const r3v = processFile(join(FIXTURE_DIR, 'check3-ledger-valid.jsonl'));
  assert(r3v.pass, '--file .jsonl routes valid ledger → PASS');

  console.log('\n=== Check 5: Session-Catch ===');
  const scTmpLedger = join(STATE_DIR, '_sc-test-' + Date.now() + '.jsonl');
  writeFileSync(scTmpLedger, JSON.stringify({
    date: '2026-07-20', what: 'test', surface: 'test',
    pattern_class: 'test', should_have_caught: 'crud-derivable',
    why_machine_missed: 'test', never_again: { oracle: 'x', fixture: 'x', tc: 'x', rule: 'x' },
  }) + '\n');

  const sc1 = checkSessionCatch('you missed this bug', '2026-07-25', scTmpLedger);
  assert(!sc1.pass, 'Layer-a signal + no same-day entry → FAIL');
  const sc2 = checkSessionCatch('you missed this bug', '2026-07-20', scTmpLedger);
  assert(sc2.pass, 'Layer-a signal + same-day entry → PASS');
  const sc3 = checkSessionCatch('Please add tests for login', '2026-07-25', scTmpLedger);
  assert(sc3.pass, 'No layer-a signal → PASS');

  const scEmptyLedger = join(STATE_DIR, '_sc-empty-' + Date.now() + '.jsonl');
  writeFileSync(scEmptyLedger, '');
  const sc4 = checkSessionCatch('you missed this bug', '2026-07-25', scEmptyLedger);
  assert(!sc4.pass, 'Layer-a signal + empty ledger → FAIL');

  try { unlinkSync(scTmpLedger); } catch {}
  try { unlinkSync(scEmptyLedger); } catch {}

  // ── BLOCKER 1: Teeth substance — RED cases (launderable payloads) ──────────
  console.log('\n=== BLOCKER 1: Teeth Substance (RED payloads) ===');

  // Payload 1: non-existent file:line + empty parity
  const b1r1 = checkConvictedTeeth(
    `## Prior-Fix Trial\n\nVerdict: CONVICTED\ndoes/not/exist.mjs:99999\nNo removal was needed, see the diff\n\n### Protection-parity\n| Protective Function | Surviving Mechanism |\n|---|---|\n`,
    ROOT
  );
  assert(!b1r1.pass, 'B1-RED: non-existent file:line + empty parity → FAIL');

  // Payload 2: real file but removal diff + empty parity table
  const b1r2 = checkConvictedTeeth(
    `## Prior-Fix Trial\n\nVerdict: CONVICTED\ndocs/readme.md:1\nRemoval diff applied and change committed.\n\n### Protection-parity\n| Protective Function | Surviving Mechanism |\n|---|---|\n`,
    ROOT
  );
  assert(!b1r2.pass, 'B1-RED: real file + removal diff + empty parity rows → FAIL');

  // Payload 3: real file:line but invalid line number (out of bounds)
  const b1r3 = checkConvictedTeeth(
    `## Prior-Fix Trial\n\nVerdict: CONVICTED\n${SCRIPT_REL}:99999\nRemoval diff change done.\n\n### Protection-parity\n| Protective Function | Surviving Mechanism |\n|---|---|\n| Old | New |\n`,
    ROOT
  );
  assert(!b1r3.pass, 'B1-RED: real file but line out of bounds → FAIL');

  // Payload 4: real file:line + "Removal diff noted" label but no actual diff words in section
  const b1r4 = checkConvictedTeeth(
    `## Prior-Fix Trial\n\nVerdict: CONVICTED\n${SCRIPT_REL}:1\nRemoval diff noted.\n\nProtective Function -> Surviving Mechanism\n`,
    ROOT
  );
  assert(!b1r4.pass, 'B1-RED: real file:line + label-only (no table rows, no proper diff) → FAIL');

  // GREEN honest control (MANDATORY)
  console.log('\n=== BLOCKER 1: Honest Control (GREEN) ===');
  const b1g = checkConvictedTeeth(
    `## Prior-Fix Trial\n\n- **Verdict**: CONVICTED\n- **Old fix location**: ${SCRIPT_REL}:1\n- **Evidence**: Scoped wrong.\n\n### Removal diff\nRemoved the old regex gate and rewired with removal diff to structural parser.\n\n### Protection-parity table\n\n| Protective Function | Surviving Mechanism |\n|---|---|\n| Regex file:line check | Structural file-exists + line-count validator |\n| Content-anywhere scan | Section-scoped evidence search |\n`,
    ROOT
  );
  assert(b1g.pass, 'B1-GREEN: honest control (real file, scoped diff, populated parity) → PASS');

  // ── BLOCKER 2: Fail-closed (exit 2 cases) ─────────────────────────────────
  console.log('\n=== BLOCKER 2: Fail-Closed ===');

  const tmpDir = join(STATE_DIR, '_b2-test-' + Date.now());
  mkdirSync(tmpDir, { recursive: true });

  const emptyFile = join(tmpDir, 'empty.md');
  writeFileSync(emptyFile, '');
  const b2empty = checkFile(emptyFile);
  assert(!b2empty.pass && b2empty.uncheckable === true, 'B2: empty file → UNCHECKABLE');

  const binaryFile = join(tmpDir, 'binary.md');
  writeFileSync(binaryFile, Buffer.from([0x00, 0x01, 0x02, 0xFF, 0xFE, 0x00, 0x48, 0x65]));
  const b2binary = checkFile(binaryFile);
  assert(!b2binary.pass && b2binary.uncheckable === true, 'B2: binary content → UNCHECKABLE');

  const unreadableResult = checkFile(join(tmpDir, 'does-not-exist.md'));
  assert(!unreadableResult.pass && unreadableResult.uncheckable === true, 'B2: unreadable file → UNCHECKABLE');

  try { unlinkSync(emptyFile); } catch {}
  try { unlinkSync(binaryFile); } catch {}
  try { require('fs').rmdirSync(tmpDir); } catch {}

  // ── MAJOR 3: Markdown formatting (evade/satisfy) ──────────────────────────
  console.log('\n=== MAJOR 3: Markdown Formatting ===');

  // CONVICTED in code block → not detected
  const m3code = checkConvictedTeeth('## Prior-Fix Trial\n\n```\nCONVICTED\nold.mjs:1\n```\n', ROOT);
  assert(m3code.pass, 'M3: CONVICTED in code block → not detected (no verdict)');

  // CONVICTED in blockquote → not detected
  const m3quote = checkConvictedTeeth('## Prior-Fix Trial\n\n> CONVICTED\n> old.mjs:1\n', ROOT);
  assert(m3quote.pass, 'M3: CONVICTED in blockquote → not detected (no verdict)');

  // ~~CONVICTED~~ strikethrough → not detected
  const m3strike = checkConvictedTeeth('## Prior-Fix Trial\n\n~~CONVICTED~~\nold.mjs:1\n', ROOT);
  assert(m3strike.pass, 'M3: ~~CONVICTED~~ strikethrough → not detected');

  // ### Prior-Fix Trial (h3, not h2) → not matched
  const m3h3 = checkConvictedTeeth('### Prior-Fix Trial\n\nCONVICTED\n' + SCRIPT_REL + ':1\n', ROOT);
  assert(m3h3.pass, 'M3: ### h3 heading → not matched as Prior-Fix Trial');

  // ## Prior Fix Trial (no hyphen) → not matched
  const m3nohyphen = checkConvictedTeeth('## Prior Fix Trial\n\nCONVICTED\n' + SCRIPT_REL + ':1\n', ROOT);
  assert(m3nohyphen.pass, 'M3: no-hyphen heading → not matched');

  // ── MAJOR 4: Path classes ─────────────────────────────────────────────────
  console.log('\n=== MAJOR 4: Path Classes ===');

  const m4abs = checkFakeFix('The gate at `/usr/local/bin/gate.mjs` blocks this permanently.', ROOT);
  assert(!m4abs.pass, 'M4: absolute path → FAIL (uncheckable)');

  const m4glob = checkFakeFix('The gate at `scripts/*.mjs` catches all errors permanently.', ROOT);
  assert(!m4glob.pass, 'M4: glob pattern → FAIL (uncheckable)');

  const m4dot = checkFakeFix('The gate at `scripts/check.mjs.` blocks this permanently.', ROOT);
  assert(!m4dot.pass, 'M4: trailing dot → FAIL (uncheckable)');

  // ── FDLE-PLANB Controls: path-form UNCHECKABLE vs absent FAIL precedence ──
  console.log('\n=== FDLE-PLANB: Path-Form UNCHECKABLE vs Absent FAIL ===');

  // Control 1: glob-only → exit 2 UNCHECKABLE (pass:false, uncheckable:true)
  const fdC1 = checkFakeFix('The gate at `scripts/check-*.mjs` catches all globs permanently.', ROOT);
  assert(!fdC1.pass, 'FDLE-C1-RED: glob-only → pass:false');
  assert(fdC1.uncheckable === true, 'FDLE-C1-RED: glob-only → uncheckable:true (not FAIL)');

  // Control 2: genuinely-absent artifact → exit 1 FAIL (uncheckable:false)
  const fdC2 = checkFakeFix('The gate at `scripts/this-planb-ghost-does-not-exist.mjs` blocks this permanently.', ROOT);
  assert(!fdC2.pass, 'FDLE-C2-RED: absent artifact → pass:false');
  assert(fdC2.uncheckable !== true, 'FDLE-C2-RED: absent artifact → uncheckable:false (real FAIL)');

  // Control 3: absent artifact + glob in same plan → exit 1 FAIL (precedence — FAIL masks UNCHECKABLE)
  const fdC3 = checkFakeFix(
    'The gate at `scripts/check-*.mjs` catches globs.\nThe gate at `scripts/this-planb-ghost-does-not-exist.mjs` blocks this permanently.',
    ROOT
  );
  assert(!fdC3.pass, 'FDLE-C3-RED: glob+absent → pass:false');
  assert(fdC3.uncheckable !== true, 'FDLE-C3-RED: glob+absent → uncheckable:false (FAIL dominates, not masked)');

  // Control 4: fully honest plan citing only real tracked paths → exit 0 PASS (false-positive control)
  // Uses scripts/lib/forbidden-patterns.mjs which is git-tracked; scripts/check-recurrence-trial.mjs
  // is not yet committed so would become UNCHECKABLE after FIX 1.
  const fdC4 = checkFakeFix('The gate at `scripts/lib/forbidden-patterns.mjs` blocks this permanently.', ROOT);
  assert(fdC4.pass, 'FDLE-C4-GREEN: real tracked path → PASS (no false-positive)');

  // === FIX 1: Git-Excluded → UNCHECKABLE ===
  console.log('\n=== FIX 1: Git-Excluded → UNCHECKABLE ===');

  // RED: plan citing only a git-excluded file (exists on disk, not tracked) → UNCHECKABLE
  // Oracle declares the file untracked — hermetic: does not depend on actual git state.
  const fix1Red = checkFakeFix(
    'The gate at `.claude/skills/ultra-agents/copilot-worker.sh` blocks this permanently.',
    ROOT,
    { isTracked: () => false, trackedBasenames: new Set(), historicalBasenames: new Set(), untrackedDiskBasenames: new Set() }
  );
  assert(!fix1Red.pass, 'FIX1-RED: git-excluded file → pass:false');
  assert(fix1Red.uncheckable === true, 'FIX1-RED: git-excluded file → uncheckable:true');

  // GREEN: plan citing a real git-tracked file → PASS (no regression)
  const fix1Green = checkFakeFix(
    'The gate at `scripts/lib/forbidden-patterns.mjs` blocks this permanently.',
    ROOT
  );
  assert(fix1Green.pass, 'FIX1-GREEN: tracked file → PASS (no regression)');

  // === FIX 2: Identifier Suffix Strip ===
  console.log('\n=== FIX 2: Identifier Suffix Strip ===');

  // RED (before fix would FAIL; after fix strips suffix → real tracked file resolves → PASS)
  const fix2Strip = checkFakeFix(
    'The gate at `scripts/lib/forbidden-patterns.mjs:SOURCE_COMMENT_JARGON` blocks this permanently.',
    ROOT
  );
  assert(fix2Strip.pass, 'FIX2-RED/PASS: :IDENTIFIER suffix stripped → tracked file resolves → PASS');

  // GREEN: path without suffix still passes (no regression from strip)
  const fix2Noop = checkFakeFix(
    'The gate at `scripts/lib/forbidden-patterns.mjs` blocks this permanently.',
    ROOT
  );
  assert(fix2Noop.pass, 'FIX2-GREEN: no suffix → still PASS (no regression)');

  // ── FDLE-PLANB: Untracked-basename fallback ───────────────────────────────
  console.log('\n=== FDLE-PLANB: Untracked-Basename Fallback ===');

  // RED: bare basename that exists nowhere on disk → FAIL (not UNCHECKABLE)
  const fdlePlanBRed = checkFakeFix(
    'The gate at `zzz-nowhere-at-all-fdle-planb.mjs` blocks this permanently.',
    ROOT
  );
  assert(!fdlePlanBRed.pass, 'FDLE-PLANB-RED: bare basename nowhere on disk → pass:false');
  assert(fdlePlanBRed.uncheckable !== true, 'FDLE-PLANB-RED: bare basename nowhere on disk → uncheckable:false (real FAIL)');

  // GREEN: bare basename that exists on disk untracked (git-excluded) → UNCHECKABLE
  // Oracle declares: basename not tracked, not historical, but IS on disk untracked — hermetic.
  const fdlePlanBGreen = checkFakeFix(
    'The gate at `copilot-worker.sh` blocks this permanently.',
    ROOT,
    { isTracked: () => true, trackedBasenames: new Set(), historicalBasenames: new Set(), untrackedDiskBasenames: new Set(['copilot-worker.sh']) }
  );
  assert(!fdlePlanBGreen.pass, 'FDLE-PLANB-GREEN: bare untracked basename → pass:false');
  assert(fdlePlanBGreen.uncheckable === true, 'FDLE-PLANB-GREEN: bare untracked basename found on disk → uncheckable:true');

  // ── MAJOR 5: False-positive exemption ─────────────────────────────────────
  console.log('\n=== MAJOR 5: Historical Plan Exemption ===');

  const m5hist = checkFakeFix('# COMPLETED\n\n## Fix\nThe gate at `scripts/nonexistent-xyz.mjs` blocks this permanently.', ROOT);
  assert(m5hist.pass, 'M5: COMPLETED historical plan + absent artifact → exempt PASS');

  const m5done = checkFakeFix('Status: DONE 2026-03-01\n\n## Fix\nThe gate at `scripts/nonexistent-xyz.mjs` blocks this permanently.', ROOT);
  assert(m5done.pass, 'M5: Status DONE historical plan → exempt PASS');

  const m5active = checkFakeFix('## Fix\nThe gate at `scripts/nonexistent-xyz.mjs` blocks this permanently.', ROOT);
  assert(!m5active.pass, 'M5: active plan (no DONE/COMPLETED) + absent artifact → FAIL');

  // ── Staged Escalation (MANDATORY re-run) ──────────────────────────────────
  console.log('\n=== Staged Escalation ===');

  // Stage 1: prose-only (CONVICTED, no evidence)
  const se1 = checkConvictedTeeth('## Prior-Fix Trial\n\nVerdict: CONVICTED\n', ROOT);
  assert(!se1.pass, 'SE-1: prose-only CONVICTED → FAIL');

  // Stage 2: + file:line (but no removal diff or parity)
  const se2 = checkConvictedTeeth(`## Prior-Fix Trial\n\nVerdict: CONVICTED\n${SCRIPT_REL}:1\n`, ROOT);
  assert(!se2.pass, 'SE-2: + file:line only → FAIL');

  // Stage 3: + removal diff (but no parity table)
  const se3 = checkConvictedTeeth(`## Prior-Fix Trial\n\nVerdict: CONVICTED\n${SCRIPT_REL}:1\nRemoved old gate and rewired with removal diff applied.\n`, ROOT);
  assert(!se3.pass, 'SE-3: + removal diff but no parity → FAIL');

  // Stage 4: + parity table with populated rows → PASS
  const se4 = checkConvictedTeeth(
    `## Prior-Fix Trial\n\nVerdict: CONVICTED\n${SCRIPT_REL}:1\nRemoved old gate and rewired with removal diff applied.\n\n| Protective Function | Surviving Mechanism |\n|---|---|\n| Old regex check | New structural validator |\n`,
    ROOT
  );
  assert(se4.pass, 'SE-4: + populated parity table → PASS');

  // ── R2-BLOCKER1: Pending-plan scoped exemption ────────────────────────────
  console.log('\n=== R2-BLOCKER1: Pending-plan Scoped Exemption ===');

  // RED: "pending plan" in one paragraph should NOT exempt an unrelated fake claim elsewhere
  const r2b1red = checkFakeFix(
    '## Background\nThis is pending plan PLAN_FOO work.\n\n## Fix\nThe gate at `scripts/nonexistent-bogus.mjs` blocks this permanently.',
    ROOT
  );
  assert(!r2b1red.pass, 'R2-B1-RED: stray "pending plan" in unrelated para does NOT exempt other claims → FAIL');

  // GREEN: pending plan in SAME paragraph as the claim → exempt
  const r2b1green = checkFakeFix(
    '## Fix\nThe gate at `scripts/nonexistent-bogus.mjs` is pending plan PLAN_FOO landing.',
    ROOT
  );
  assert(r2b1green.pass, 'R2-B1-GREEN: pending plan in same para as claim → exempt PASS');

  // ── MOVED-FILE: Basename fallback for moved artifacts ───────────────────────
  console.log('\n=== MOVED-FILE: Basename Fallback ===');

  const mfRed = checkFakeFix(
    'The gate at `scripts/this-gate-does-not-exist-at-all.mjs` blocks this permanently.',
    ROOT
  );
  assert(!mfRed.pass, 'MF-RED: ghost artifact (no basename in tree) → FAIL');

  const mfGreen = checkFakeFix(
    'The gate at `old-path/check-browsertool-parity.mjs` blocks this permanently.',
    ROOT
  );
  assert(mfGreen.pass, 'MF-GREEN: absent path but basename exists in tree (moved) → PASS');

  // ── R2-BLOCKER2: Recurrence FP on guardrail-discussing plans ──────────────
  console.log('\n=== R2-BLOCKER2: Recurrence FP Control ===');

  // GREEN: plan that discusses gates and LR rules without asserting a recurrence
  const r2b2g1 = checkRecurrence(
    '## Plan\nWe will add a new gate per LR-069. The previous test failed due to a timeout.\nThe gate enforces quality checks on every commit.'
  );
  assert(r2b2g1.pass, 'R2-B2-GREEN: discusses gate + LR-069 + "failed" (no recurrence assertion) → PASS');

  const r2b2g2 = checkRecurrence(
    '## Refactor\nWe need to refactor the gate logic. LR-055 says gates must not be bypassed.\nThe old implementation was insufficient for the new requirements.'
  );
  assert(r2b2g2.pass, 'R2-B2-GREEN: discusses refactoring gates + LR + "insufficient" → PASS');

  // RED: plan that actually asserts a recurrence
  const r2b2red = checkRecurrence(
    '## RCA\nThis failure class has recurred despite LR-069 being in place.\nThe gate was supposed to prevent this but it happened again.'
  );
  assert(!r2b2red.pass, 'R2-B2-RED: asserts recurrence with LR ref → recurrence FAIL');

  // FINDING 1 — new RED+GREEN pairs for tightened clause (a) and clause (c)
  // GREEN: LR-069 cited as doctrine alongside recurrence vocabulary — no prior-fix failure framing
  const r2b2g3 = checkRecurrence(
    '## Implementation\nThis gate implements LR-069 §3.5 recurrence detection to prevent future failures.\nAll recurrence-class plans require a Prior-Fix Trial section per LR-069.'
  );
  assert(r2b2g3.pass, 'R2-B2-GREEN-C1: doctrine-only LR-069 + recurrence vocabulary → PASS');

  // RED: prior plan filename as the named prior remediation that failed
  const r2b2red2 = checkRecurrence(
    '## RCA\nThis class recurred. SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL.md was the previous fix and it failed to stop this.'
  );
  assert(!r2b2red2.pass, 'R2-B2-RED-C1: named plan filename as failed prior fix + recurrence → FAIL');

  // GREEN (clause c tightening): "gate prevents recurrence" is prevention vocabulary, not recurrence-class
  const r2b2g4 = checkRecurrence(
    'This gate prevents recurrence by enforcing the rule on every commit.'
  );
  assert(r2b2g4.pass, 'R2-B2-GREEN-C2: gate prevents recurrence (prevention vocab, no prior-fix ref) → PASS');

  // RED (clause c tightening): "previous fix" + recurrence assertion on same line
  const r2b2red3 = checkRecurrence(
    'Despite the previous fix, this class recurred again on the same day.'
  );
  assert(!r2b2red3.pass, 'R2-B2-RED-C2: previous fix + recurred on same line → FAIL');

  // ── R2-MAJOR3: Parity placeholder rejection ──────────────────────────────
  console.log('\n=== R2-MAJOR3: Parity Placeholder Rejection ===');

  // RED: single-char and punctuation-only cells
  const r2m3r1 = checkConvictedTeeth(
    `## Prior-Fix Trial\n\nVerdict: CONVICTED\n${SCRIPT_REL}:1\nRemoved and rewired with removal diff.\n\n| Protective Function | Surviving Mechanism |\n|---|---|\n| x | - |\n`,
    ROOT
  );
  assert(!r2m3r1.pass, 'R2-M3-RED: placeholder cells "x" / "-" → FAIL');

  const r2m3r2 = checkConvictedTeeth(
    `## Prior-Fix Trial\n\nVerdict: CONVICTED\n${SCRIPT_REL}:1\nRemoved and rewired with removal diff.\n\n| Protective Function | Surviving Mechanism |\n|---|---|\n| -- | ** |\n`,
    ROOT
  );
  assert(!r2m3r2.pass, 'R2-M3-RED: punctuation-only cells "--" / "**" → FAIL');

  // GREEN: substantive cells
  const r2m3g = checkConvictedTeeth(
    `## Prior-Fix Trial\n\nVerdict: CONVICTED\n${SCRIPT_REL}:1\nRemoved and rewired with removal diff.\n\n| Protective Function | Surviving Mechanism |\n|---|---|\n| Regex file check | Structural validator |\n`,
    ROOT
  );
  assert(r2m3g.pass, 'R2-M3-GREEN: substantive cells → PASS');

  // ── R2-MAJOR4: Ledger type/empty handling ─────────────────────────────────
  console.log('\n=== R2-MAJOR4: Ledger Type Handling ===');

  const r2m4type = validateLedgerEntry({ should_have_caught: 123, never_again: { oracle: 'x', fixture: 'x', tc: 'x', rule: 'x' } });
  assert(r2m4type.length > 0, 'R2-M4-RED: should_have_caught as number → FAIL');

  const r2m4arr = validateLedgerEntry({ should_have_caught: 'crud-derivable', never_again: ['a', 'b'] });
  assert(r2m4arr.length > 0, 'R2-M4-RED: never_again as array → FAIL');

  const r2m4numval = validateLedgerEntry({ should_have_caught: 'crud-derivable', never_again: { oracle: 42, fixture: 'x', tc: 'x', rule: 'x' } });
  assert(r2m4numval.length > 0, 'R2-M4-RED: never_again.oracle as number → FAIL');

  const r2m4null = validateLedgerEntry(null);
  assert(r2m4null.length > 0, 'R2-M4-RED: null entry → FAIL');

  // ── Pre-Gate Temporal Exemption (recurrence) ──────────────────────────────
  console.log('\n=== Pre-Gate Temporal Exemption ===');

  const pgGreen = checkRecurrence(
    '## RCA\nThis failure class has recurred despite LR-069 being in place.\n\n**Executed**: 2026-04-15\n**Status**: DONE'
  );
  assert(pgGreen.pass, 'PG-GREEN: recurrence-class executed before rule landed → exempt PASS');

  const pgRed = checkRecurrence(
    '## RCA\nThis failure class has recurred despite LR-069 being in place.\n\n**Executed**: 2026-07-20\n**Status**: DONE'
  );
  assert(!pgRed.pass && !pgRed.uncheckable, 'PG-RED: post-gate recurrence without trial → FAIL');

  // ── Undated DONE Plan ─────────────────────────────────────────────────────
  console.log('\n=== Undated DONE Plan ===');

  const udRed = checkRecurrence(
    '## RCA\nThis failure class has recurred despite LR-069 being in place.\n\n**Status**: DONE'
  );
  assert(!udRed.pass && udRed.uncheckable === true, 'UD-RED: DONE recurrence-class with no Executed date → UNCHECKABLE');

  const udGreen = checkRecurrence(
    '## RCA\nThis failure class has recurred despite LR-069 being in place.\n\n**Executed**: 2026-04-15\n**Status**: DONE'
  );
  assert(!udGreen.uncheckable, 'UD-GREEN: dated recurrence-class plan → not UNCHECKABLE');

  // ── SCOPE-NEW: Claim-Context Boundary ─────────────────────────────────────
  console.log('\n=== SCOPE-NEW: Claim-Context Boundary ===');

  // Mere mention on a fix-related line (fourth extractor) must NOT trigger wiredness check.
  // Oracle: file is tracked but isWired() returns false — if wiredness were checked, this FAILs.
  const scopeNewMention = checkFakeFix(
    'The fix updates `scripts/check-recurrence-trial.mjs` to handle the case.',
    ROOT,
    { isTracked: () => true, isWired: () => false, trackedBasenames: new Set(['check-recurrence-trial.mjs']), historicalBasenames: new Set(), untrackedDiskBasenames: new Set() }
  );
  assert(scopeNewMention.pass, 'SCOPE-NEW: mere mention on fix line (not prevention-claim language) → no wiredness check → PASS');

  // ── FORM COVERAGE: all four named claim forms × wired/unwired ───────────────
  console.log('\n=== FORM COVERAGE: four named claim forms ===');
  const UNWIRED_ORACLE = { isTracked: () => true, isWired: () => false, trackedBasenames: new Set(), historicalBasenames: new Set(), untrackedDiskBasenames: new Set() };
  const WIRED_ORACLE   = { isTracked: () => true, isWired: () => true,  trackedBasenames: new Set(), historicalBasenames: new Set(), untrackedDiskBasenames: new Set() };

  const formGateU = checkFakeFix(safeRead(join(FIXTURE_DIR, 'check2-form-gate-unwired.md')), ROOT, UNWIRED_ORACLE);
  assert(!formGateU.pass && !formGateU.uncheckable, 'FORM-GATE-UNWIRED: "gate at <path> blocks" + unwired → FAIL');
  const formGateW = checkFakeFix(safeRead(join(FIXTURE_DIR, 'check2-form-gate-wired.md')), ROOT, WIRED_ORACLE);
  assert(formGateW.pass, 'FORM-GATE-WIRED: "gate at <path> blocks" + wired → PASS');

  const formHookU = checkFakeFix(safeRead(join(FIXTURE_DIR, 'check2-form-hook-unwired.md')), ROOT, UNWIRED_ORACLE);
  assert(!formHookU.pass && !formHookU.uncheckable, 'FORM-HOOK-UNWIRED: "hook at <path> blocks" + unwired → FAIL');
  const formHookW = checkFakeFix(safeRead(join(FIXTURE_DIR, 'check2-form-hook-wired.md')), ROOT, WIRED_ORACLE);
  assert(formHookW.pass, 'FORM-HOOK-WIRED: "hook at <path> blocks" + wired → PASS');

  const formScriptU = checkFakeFix(safeRead(join(FIXTURE_DIR, 'check2-form-script-unwired.md')), ROOT, UNWIRED_ORACLE);
  assert(!formScriptU.pass && !formScriptU.uncheckable, 'FORM-SCRIPT-UNWIRED: "script <path> blocks" + unwired → FAIL');
  const formScriptW = checkFakeFix(safeRead(join(FIXTURE_DIR, 'check2-form-script-wired.md')), ROOT, WIRED_ORACLE);
  assert(formScriptW.pass, 'FORM-SCRIPT-WIRED: "script <path> blocks" + wired → PASS');

  const formPermU = checkFakeFix(safeRead(join(FIXTURE_DIR, 'check2-form-permsol-unwired.md')), ROOT, UNWIRED_ORACLE);
  assert(!formPermU.pass && !formPermU.uncheckable, 'FORM-PERMSOL-UNWIRED: "permanent solution is <path>" + unwired → FAIL');
  const formPermW = checkFakeFix(safeRead(join(FIXTURE_DIR, 'check2-form-permsol-wired.md')), ROOT, WIRED_ORACLE);
  assert(formPermW.pass, 'FORM-PERMSOL-WIRED: "permanent solution is <path>" + wired → PASS');

  // ── PERTURBATION BATTERY: Structural Discriminator (written RED-FIRST) ─────
  // All 16 *-UNWIRED cases must FAIL (RED) against the unmodified mechanism;
  // all 16 *-WIRED cases and 3 negative controls must PASS in both old and new code.
  console.log('\n=== PERTURBATION BATTERY: P1/P2/P3 Probes ===');
  const PERT_PATH = 'scripts/check-dead-exports.test.mjs'; // gate-shaped, exists on disk, not wired

  // P1: adverb "now" between path and verb defeats old adjacency template
  const p1u = checkFakeFix(`A pre-commit hook at \`${PERT_PATH}\` now prevents this from recurring.`, ROOT, UNWIRED_ORACLE);
  assert(!p1u.pass && !p1u.uncheckable, 'P1-UNWIRED: adverb between path and verb → FAIL (not wired)');
  const p1w = checkFakeFix(`A pre-commit hook at \`${PERT_PATH}\` now prevents this from recurring.`, ROOT, WIRED_ORACLE);
  assert(p1w.pass, 'P1-WIRED: adverb between path and verb → PASS');

  // P2: passive/reordered clause (verb precedes path)
  const p2u = checkFakeFix(`Recurrence of this class is blocked by the gate at \`${PERT_PATH}\`.`, ROOT, UNWIRED_ORACLE);
  assert(!p2u.pass && !p2u.uncheckable, 'P2-UNWIRED: passive/reordered → FAIL (not wired)');
  const p2w = checkFakeFix(`Recurrence of this class is blocked by the gate at \`${PERT_PATH}\`.`, ROOT, WIRED_ORACLE);
  assert(p2w.pass, 'P2-WIRED: passive/reordered → PASS');

  // P3: adverb "permanently" between path and verb
  const p3u = checkFakeFix(`The gate at \`${PERT_PATH}\` permanently blocks this.`, ROOT, UNWIRED_ORACLE);
  assert(!p3u.pass && !p3u.uncheckable, 'P3-UNWIRED: adverb before verb → FAIL (not wired)');
  const p3w = checkFakeFix(`The gate at \`${PERT_PATH}\` permanently blocks this.`, ROOT, WIRED_ORACLE);
  assert(p3w.pass, 'P3-WIRED: adverb before verb → PASS');

  console.log('\n=== PERTURBATION BATTERY: Gate Form (×4) ===');
  // G3: inflection change (gate form; P2=passive and P3=adverb already cover gate)
  const g3u = checkFakeFix(`The gate at \`${PERT_PATH}\` will enforce the rule on commit.`, ROOT, UNWIRED_ORACLE);
  assert(!g3u.pass && !g3u.uncheckable, 'G3-UNWIRED: inflection "enforce" → FAIL');
  const g3w = checkFakeFix(`The gate at \`${PERT_PATH}\` will enforce the rule on commit.`, ROOT, WIRED_ORACLE);
  assert(g3w.pass, 'G3-WIRED: inflection "enforce" → PASS');
  // G4: noun synonym "validator" (not in old gate|hook|script list)
  const g4u = checkFakeFix(`The validator at \`${PERT_PATH}\` stops this class of error.`, ROOT, UNWIRED_ORACLE);
  assert(!g4u.pass && !g4u.uncheckable, 'G4-UNWIRED: noun synonym "validator" + "stops" → FAIL');
  const g4w = checkFakeFix(`The validator at \`${PERT_PATH}\` stops this class of error.`, ROOT, WIRED_ORACLE);
  assert(g4w.pass, 'G4-WIRED: noun synonym "validator" + "stops" → PASS');

  console.log('\n=== PERTURBATION BATTERY: Hook Form (×4) ===');
  // H2: inflection (P1=adverb covers hook already)
  const h2u = checkFakeFix(`The hook at \`${PERT_PATH}\` is catching this class.`, ROOT, UNWIRED_ORACLE);
  assert(!h2u.pass && !h2u.uncheckable, 'H2-UNWIRED: inflection "catching" → FAIL');
  const h2w = checkFakeFix(`The hook at \`${PERT_PATH}\` is catching this class.`, ROOT, WIRED_ORACLE);
  assert(h2w.pass, 'H2-WIRED: inflection "catching" → PASS');
  // H3: passive + adverb
  const h3u = checkFakeFix(`This class is now stopped by the hook at \`${PERT_PATH}\`.`, ROOT, UNWIRED_ORACLE);
  assert(!h3u.pass && !h3u.uncheckable, 'H3-UNWIRED: passive+adverb "stopped" → FAIL');
  const h3w = checkFakeFix(`This class is now stopped by the hook at \`${PERT_PATH}\`.`, ROOT, WIRED_ORACLE);
  assert(h3w.pass, 'H3-WIRED: passive+adverb "stopped" → PASS');
  // H4: auxiliary verb between path and lemma
  const h4u = checkFakeFix(`The hook at \`${PERT_PATH}\` is guarding against this pattern.`, ROOT, UNWIRED_ORACLE);
  assert(!h4u.pass && !h4u.uncheckable, 'H4-UNWIRED: "is guarding" (auxiliary+inflection) → FAIL');
  const h4w = checkFakeFix(`The hook at \`${PERT_PATH}\` is guarding against this pattern.`, ROOT, WIRED_ORACLE);
  assert(h4w.pass, 'H4-WIRED: "is guarding" → PASS');

  console.log('\n=== PERTURBATION BATTERY: Script Form (×4) ===');
  // S1: adverb inserted
  const s1u = checkFakeFix(`The script \`${PERT_PATH}\` permanently blocks this.`, ROOT, UNWIRED_ORACLE);
  assert(!s1u.pass && !s1u.uncheckable, 'S1-UNWIRED: adverb "permanently" → FAIL');
  const s1w = checkFakeFix(`The script \`${PERT_PATH}\` permanently blocks this.`, ROOT, WIRED_ORACLE);
  assert(s1w.pass, 'S1-WIRED: adverb "permanently" → PASS');
  // S2: passive/no noun (bare path with verb)
  const s2u = checkFakeFix(`This class is blocked by \`${PERT_PATH}\`.`, ROOT, UNWIRED_ORACLE);
  assert(!s2u.pass && !s2u.uncheckable, 'S2-UNWIRED: passive/no noun → FAIL');
  const s2w = checkFakeFix(`This class is blocked by \`${PERT_PATH}\`.`, ROOT, WIRED_ORACLE);
  assert(s2w.pass, 'S2-WIRED: passive/no noun → PASS');
  // S3: adverb + inflection
  const s3u = checkFakeFix(`The script \`${PERT_PATH}\` now enforces the rule.`, ROOT, UNWIRED_ORACLE);
  assert(!s3u.pass && !s3u.uncheckable, 'S3-UNWIRED: adverb+inflection "enforces" → FAIL');
  const s3w = checkFakeFix(`The script \`${PERT_PATH}\` now enforces the rule.`, ROOT, WIRED_ORACLE);
  assert(s3w.pass, 'S3-WIRED: adverb+inflection "enforces" → PASS');
  // S4: noun synonym "validator"
  const s4u = checkFakeFix(`The validator \`${PERT_PATH}\` prevents such errors.`, ROOT, UNWIRED_ORACLE);
  assert(!s4u.pass && !s4u.uncheckable, 'S4-UNWIRED: noun synonym "validator" + "prevents" → FAIL');
  const s4w = checkFakeFix(`The validator \`${PERT_PATH}\` prevents such errors.`, ROOT, WIRED_ORACLE);
  assert(s4w.pass, 'S4-WIRED: noun synonym "validator" + "prevents" → PASS');

  console.log('\n=== PERTURBATION BATTERY: Permanent-Solution Form (×4) ===');
  // PS1: passive + adverb (no "permanent solution via" pattern)
  const ps1u = checkFakeFix(`Recurrence is permanently stopped by \`${PERT_PATH}\`.`, ROOT, UNWIRED_ORACLE);
  assert(!ps1u.pass && !ps1u.uncheckable, 'PS1-UNWIRED: permanent passive "stopped" → FAIL');
  const ps1w = checkFakeFix(`Recurrence is permanently stopped by \`${PERT_PATH}\`.`, ROOT, WIRED_ORACLE);
  assert(ps1w.pass, 'PS1-WIRED: permanent passive "stopped" → PASS');
  // PS2: "permanent fix will block via" — old pattern2 requires "permanent fix via|is|by" immediately
  const ps2u = checkFakeFix(`A permanent fix will block via \`${PERT_PATH}\` on the next commit.`, ROOT, UNWIRED_ORACLE);
  assert(!ps2u.pass && !ps2u.uncheckable, 'PS2-UNWIRED: permanent fix + reordered "block" → FAIL');
  const ps2w = checkFakeFix(`A permanent fix will block via \`${PERT_PATH}\` on the next commit.`, ROOT, WIRED_ORACLE);
  assert(ps2w.pass, 'PS2-WIRED: permanent fix + reordered "block" → PASS');
  // PS3: noun synonym "guard" (not "solution|fix")
  const ps3u = checkFakeFix(`The permanent guard is \`${PERT_PATH}\`, stopping recurrence.`, ROOT, UNWIRED_ORACLE);
  assert(!ps3u.pass && !ps3u.uncheckable, 'PS3-UNWIRED: permanent guard noun synonym + "stopping" → FAIL');
  const ps3w = checkFakeFix(`The permanent guard is \`${PERT_PATH}\`, stopping recurrence.`, ROOT, WIRED_ORACLE);
  assert(ps3w.pass, 'PS3-WIRED: permanent guard noun synonym + "stopping" → PASS');
  // PS4: gate-shape alone carries the claim (no "permanent solution" keyword needed)
  const ps4u = checkFakeFix(`All recurrence is blocked by \`${PERT_PATH}\`, a permanent check.`, ROOT, UNWIRED_ORACLE);
  assert(!ps4u.pass && !ps4u.uncheckable, 'PS4-UNWIRED: reordered "blocked" + gate-shape → FAIL');
  const ps4w = checkFakeFix(`All recurrence is blocked by \`${PERT_PATH}\`, a permanent check.`, ROOT, WIRED_ORACLE);
  assert(ps4w.pass, 'PS4-WIRED: reordered "blocked" + gate-shape → PASS');

  console.log('\n=== PERTURBATION BATTERY: Negative Controls ===');
  // NC1: negated claim — must NOT enter claim-context
  const nc1 = checkFakeFix(`This is NOT blocked by \`${PERT_PATH}\`.`, ROOT, UNWIRED_ORACLE);
  assert(nc1.pass, 'NC1: negated claim "NOT blocked" → PASS');
  // NC2: honest-pending — HONEST_PENDING exemption fires on same paragraph
  const nc2 = checkFakeFix(`\`${PERT_PATH}\` blocks recurrence; fixed when PLAN_GUARDRAIL runs.`, ROOT, UNWIRED_ORACLE);
  assert(nc2.pass, 'NC2: honest-pending claim → PASS (HONEST_PENDING exemption)');
  // NC3: non-gate-shaped path with prevention verb — wiredness must NOT be checked
  const nc3 = checkFakeFix(
    'Recurrence is blocked by `clients/encore/src/pages/base.page.ts` in the test suite.',
    ROOT,
    { isTracked: () => true, isWired: () => false, trackedBasenames: new Set(['base.page.ts']), historicalBasenames: new Set(), untrackedDiskBasenames: new Set() }
  );
  assert(nc3.pass, 'NC3: non-gate-shaped path with prevention verb → PASS (no wiredness check)');

  // ── MESSAGE ACCURACY: PASS message must not claim wiredness when not checked ─
  console.log('\n=== MESSAGE ACCURACY: no false wiredness assurance ===');
  const msgNoFix = checkFakeFix('A plain plan with no fix claims.', ROOT);
  assert(msgNoFix.reason === 'No fix-claim paths cited — no fake-fix check performed', 'MSG-NOFIX: no fix claims → exact expected message');
  const msgMentionOnly = checkFakeFix(
    'The fix updates `scripts/check-recurrence-trial.mjs` to handle the case.',
    ROOT,
    { isTracked: () => true, isWired: () => false, trackedBasenames: new Set(['check-recurrence-trial.mjs']), historicalBasenames: new Set(), untrackedDiskBasenames: new Set() }
  );
  assert(!msgMentionOnly.reason.includes('are wired'), 'MSG-MENTION: mention-only PASS must not claim wiredness');

  // ── TRANSITIVE WIREDNESS: real filesystem, no oracle ──────────────────────
  console.log('\n=== TRANSITIVE WIREDNESS ===');

  // TW-1: xlsx-lint-rules.mjs imported by verify-no-forbidden.mjs (pre-push → transitive)
  assert(isWired('scripts/xlsx-lint-rules.mjs', ROOT),
    'TW-1: xlsx-lint-rules.mjs reachable via verify-no-forbidden.mjs → pre-push → WIRED');

  // TW-2: unwired oracle must stay unwired — not imported by anything
  assert(!isWired('scripts/check-dead-exports.test.mjs', ROOT),
    'TW-2: check-dead-exports.test.mjs not reachable from any entry point → UNWIRED');

  // TW-3: checkFakeFix with real rootDir — xlsx-lint-rules.mjs (transitively wired) → PASS
  const twFF = checkFakeFix(
    'The gate at `scripts/xlsx-lint-rules.mjs` blocks forbidden vocab permanently.',
    ROOT
  );
  assert(twFF.pass, 'TW-3: checkFakeFix xlsx-lint-rules.mjs (transitively wired) → PASS');

  // TW-4: fixture file (check2-transitive-wired.md) → PASS via full checkFile pipeline
  const twFixture = checkFile(join(FIXTURE_DIR, 'check2-transitive-wired.md'));
  assert(twFixture.checks.find(c => c.name === 'fake-fix')?.pass === true,
    'TW-4: fixture check2-transitive-wired.md → fake-fix PASS');

  fireTelemetry(fails === 0 ? 'pass' : 'deny', 'self-test');

  console.log(`\n=== Results: ${total - fails}/${total} passed ===`);
  if (fails) { console.error(`VERDICT: FAIL (${fails} failures)`); process.exit(1); }
  console.log('VERDICT: PASS');
  process.exit(0);
}

// ── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--self-test')) {
  selfTest();
} else if (args.includes('--file')) {
  const filePath = args[args.indexOf('--file') + 1];
  if (!filePath) { console.error('Usage: --file <path>'); process.exit(1); }

  const abs = resolve(filePath);
  const result = processFile(filePath);

  // BLOCKER 2: exit 2 = UNCHECKABLE (distinct from FAIL/1 and PASS/0)
  const exitCode = result.uncheckable ? 2 : (result.pass ? 0 : 1);
  const verdict = result.uncheckable ? 'UNCHECKABLE' : (result.pass ? 'PASS' : 'FAIL');

  fireTelemetry(result.uncheckable ? 'uncheckable' : (result.pass ? 'pass' : 'deny'), norm(relative(ROOT, abs)));

  console.log(`VERDICT: ${verdict}`);
  for (const c of result.checks)
    console.log(`  ${c.name}: ${c.pass ? 'PASS' : 'FAIL'} — ${c.reason}`);
  process.exit(exitCode);
} else if (args.includes('--check-session')) {
  const idx = args.indexOf('--check-session');
  const transcript = args[idx + 1];
  const dateIdx = args.indexOf('--date');
  const date = dateIdx !== -1 ? args[dateIdx + 1] : null;
  if (!transcript || !date) {
    console.error('Usage: --check-session "<transcript>" --date "YYYY-MM-DD"');
    process.exit(1);
  }
  const result = checkSessionCatch(transcript, date);
  fireTelemetry(result.pass ? 'pass' : 'deny', 'check-session');
  console.log(`VERDICT: ${result.pass ? 'PASS' : 'FAIL'} — ${result.reason}`);
  process.exit(result.pass ? 0 : 1);
} else {
  console.log('Usage:');
  console.log('  --self-test                                   Run fixture suite');
  console.log('  --file <path>                                 Check one file');
  console.log('  --check-session "<text>" --date "YYYY-MM-DD"  Check session catch');
  process.exit(1);
}
