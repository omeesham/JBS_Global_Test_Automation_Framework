#!/usr/bin/env node
/**
 * scripts/verify-no-forbidden.mjs
 *
 * Single source of truth for "what must NEVER ship to a client". Used by:
 *   - scripts/ship-client.sh pre-flight (--client=<id>)
 *   - scripts/ship-client.sh post-flight (--target=<path>)
 *   - .githooks/pre-commit (--staged-diff)
 *   - .githooks/pre-push  (--staged="<file>")
 *
 * Modes:
 *   --client=<id>   : git ls-files clients/<id>/ + filter against DENY_GLOBS, fail if any match.
 *   --target=<path> : walk <path> recursively + filter against DENY_GLOBS, fail if any match.
 *   --staged-diff   : scan staged file contents for MARKER_GREP, fail on any hit.
 *   --staged=<file> : check a single staged path against DENY_GLOBS.
 *   --head-file=<file> : check a single pushed file (path + HEAD content) for forbidden patterns.
 *   --emit-exclusions=<id> : print (one per line, stdout) every git-tracked file under
 *                            clients/<id>/ that matchesDeny() classifies as denied. Exit 0
 *                            even when the list is non-empty — this is a reporter, not a gate.
 *                            Exit 2 on git failure or missing client value. Consumed by
 *                            git-archive exclusion lists in ship scripts.
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
// Pattern sets + path helpers live in one shared module so the commit/ship-time gate
// (this file) and the write-time PreToolUse jargon hook (.claude/hooks/lib/check-jargon.mjs,
// LR-058) can never drift apart. Editing a pattern there updates both layers at once.
import {
  DENY_GLOBS,
  MARKER_GREP,
  MARKER_GREP_CLIENT_ONLY,
  SOURCE_COMMENT_JARGON,
  matchesDeny,
  isClientShipping,
} from './lib/forbidden-patterns.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// DENY_GLOBS, MARKER_GREP, MARKER_GREP_CLIENT_ONLY, SOURCE_COMMENT_JARGON, matchesDeny, and
// isClientShipping now live in scripts/lib/forbidden-patterns.mjs (imported above) — the single
// source of truth shared with the LR-058 write-time hook.

// LR-054 / ALL-077 — manufactured-blocker banned-phrase regexes. Scanned ONLY
// in path-scoped target artifacts (walk-evidence / neutral-eye-audits /
// field-inventories) where the pattern shipped on 2026-05-18. Plan files
// (plans/pending/, plans/done/) and rule/skill/memory files legitimately
// reference these phrases when defining or quarantining them — they are NOT
// scanned. This array is intentionally separate from MARKER_GREP (repo-wide,
// would false-positive on legitimate engineering vocabulary) — same scoping
// approach as MARKER_GREP_CLIENT_ONLY (gated by isClientShipping above).
const BANNED_PHRASES = [
  /Section 0 — Live-Walk Blocker/i,
  /Section 0 — .{0,40}Blocker\b/i,
  /UNFILLED-BLOCKED-SECTION/,
  /\bstructural blocker\b/i,
  /\bprovisioning invariant\b/i,
  /\bunattended execution risks?\b/i,
  /\bindefinite if .{1,80} fires\b/i,
  /\bPath \d+ \(NOT taken in this session\)/i,
  /\bcannot complete .{0,80}strict.{0,40}line.{0,80}in this single session\b/i,
];

// Target paths for BANNED_PHRASES scan (pre-commit/pre-push). Returns true
// only for the three artifact path classes where the pattern shipped.
function isBannedPhraseTarget(rel) {
  if (!rel) return false;
  const norm = String(rel).replace(/\\/g, '/');
  if (!/^clients\/[^/]+\/specs_planning\/_internal\//.test(norm)) return false;
  if (/\/walk-evidence-[^/]+\.md$/.test(norm)) return true;
  if (/\/neutral-eye-audits\/.+\.md$/.test(norm)) return true;
  if (/\/field-inventories\/.+\.md$/.test(norm)) return true;
  // agent-mistakes.md is excluded by default — it legitimately discusses the
  // pattern in the ALL-077 row.
  return false;
}

// Strings that must NOT appear in the shipped per-client .gitignore — they leak
// JBS-internal terminology to the customer (plan IDs, ship-pipeline mechanics,
// internal directory names). The JBS-context patterns live at root .gitignore
// instead, so the per-client .gitignore stays customer-neutral.
const GITIGNORE_LEAK_MARKERS = [
  /PLAN_/,
  /pipeline/i,
  /git archive/i,
  /specs_planning/,
  /readable_externals/,
  /read_only_docs/,
];

function arg(name) {
  const flag = process.argv.find((a) => a.startsWith(`--${name}=`));
  return flag ? flag.slice(`--${name}=`.length) : null;
}
const hasFlag = (name) => process.argv.includes(`--${name}`);

// matchesDeny + isClientShipping are imported from ./lib/forbidden-patterns.mjs.

// XLSX deliverable vocab + integrity gate (LR-ENC-004). The DENY_GLOB / MARKER_GREP
// scans above are text-based and cannot see inside the binary .xlsx, so lint every
// workbook under <dir>/testcases/ with the SAME shared rules used at build and
// commit time. Hard-fails the ship on any banned vocab or status/reason contradiction.
async function lintXlsxDir(dir, label) {
  if (!fs.existsSync(dir)) return;
  const xlsxFiles = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.xlsx'));
  if (xlsxFiles.length === 0) return;
  const { lintWorkbook, formatReport } = await import('./xlsx-lint-rules.mjs');
  for (const f of xlsxFiles) {
    const result = lintWorkbook(path.join(dir, f));
    if (!result.ok) {
      console.error(`[verify-no-forbidden] ${label} XLSX deliverable '${f}' failed the vocab/integrity lint (LR-ENC-004):`);
      console.error(formatReport(result));
      process.exit(1);
    }
    console.log(`[verify-no-forbidden] OK ${label} XLSX '${f}' clean (${result.rowsScanned} rows)`);
  }
}

function walkDir(root, prefix = '') {
  const out = [];
  for (const entry of fs.readdirSync(path.join(root, prefix), { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walkDir(root, rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

async function checkClient(client) {
  let listing;
  try {
    listing = execSync(`git ls-files clients/${client}/`, { cwd: REPO_ROOT, encoding: 'utf-8' });
  } catch {
    console.error(`[verify-no-forbidden] git ls-files failed for clients/${client}/`);
    process.exit(2);
  }
  const tracked = listing.split(/\r?\n/).filter(Boolean);
  // Strip leading clients/<id>/ for glob matching.
  const stripped = tracked.map((p) => p.replace(new RegExp(`^clients/${client}/`), '/'));
  const offending = stripped.filter(matchesDeny);
  if (offending.length > 0) {
    console.error(
      `[verify-no-forbidden] client=${client} found ${offending.length} forbidden file(s) tracked under clients/${client}/:\n` +
        offending.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }
  await lintXlsxDir(path.join(REPO_ROOT, 'clients', client, 'testcases'), `client=${client}`);
  console.log(`[verify-no-forbidden] OK client=${client} tracked=${tracked.length}`);
}

async function emitExclusions(client) {
  if (!client) {
    console.error('[verify-no-forbidden] --emit-exclusions requires a client id');
    process.exit(2);
  }
  let listing;
  try {
    // Use -z (NUL-separated, no C-quoting) so paths with non-ASCII chars are returned verbatim.
    listing = execSync(`git ls-files -z clients/${client}/`, { cwd: REPO_ROOT, encoding: 'utf-8' });
  } catch {
    console.error(`[verify-no-forbidden] git ls-files failed for clients/${client}/`);
    process.exit(2);
  }
  const tracked = listing.split('\0').filter(Boolean);
  // Match using the stripped form (same normalisation as checkClient), emit the full repo-relative path.
  for (const fullPath of tracked) {
    const stripped = fullPath.replace(new RegExp(`^clients/${client}/`), '/');
    if (matchesDeny(stripped)) {
      process.stdout.write(fullPath + '\n');
    }
  }
  // Exit 0 even when list is non-empty — reporter only, not a gate.
}

async function checkTarget(target) {
  const root = path.resolve(target);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`[verify-no-forbidden] target not a directory: ${target}`);
    process.exit(2);
  }
  const files = walkDir(root).map((p) => `/${p.replace(/\\/g, '/')}`);

  // A path-only rule cannot tell the blank starter template apart from a file
  // that carries real credentials — both have the same name and both match
  // DENY_GLOBS.  Only a byte-for-byte content comparison can make that
  // distinction, so /.env.local gets a single narrow content-verified exception.
  const TEMPLATE_PATH = path.join(REPO_ROOT, 'scripts', 'deliverable', 'env-local.template');
  let templateBytes;
  try {
    templateBytes = fs.readFileSync(TEMPLATE_PATH);
  } catch {
    console.error('[verify-no-forbidden] env-local.template is missing — cannot verify .env.local in payload');
    process.exit(1);
  }
  // Guard: a modified template must never become a licence to ship. If either
  // credential line carries any text after the = sign, the template has been
  // modified and must not serve as the comparison baseline.
  const templateText = templateBytes.toString('utf-8');
  if (/^NAVIGATOR_USERNAME=.+$/m.test(templateText) || /^NAVIGATOR_PASSWORD=.+$/m.test(templateText)) {
    console.error('[verify-no-forbidden] env-local.template has a non-empty credential line — a modified template must not gate the payload check');
    process.exit(1);
  }

  // --require-env-local: set by the delivery pipeline so a deleted packaging step cannot
  // pass silently — a missing /.env.local is a hard failure when this flag is present.
  // Without the flag, behaviour is unchanged (general-purpose scanner, no blanket requirement).
  const requireEnvLocal = hasFlag('require-env-local');
  if (requireEnvLocal && !files.includes('/.env.local')) {
    console.error(
      `[verify-no-forbidden] target=${target} missing /.env.local — ` +
      `the payload is required to include the blank starter environment file`
    );
    process.exit(1);
  }

  const offending = [];
  for (const rel of files) {
    if (!matchesDeny(rel)) continue;
    if (rel === '/.env.local') {
      // Content-verified exception: only the byte-identical blank template is allowed through.
      // Any other content — including a nested foo/.env.local — falls through to offending.
      let payloadBytes;
      try {
        payloadBytes = fs.readFileSync(path.join(root, rel.slice(1)));
      } catch {
        console.error(`[verify-no-forbidden] target=${target} could not read /.env.local`);
        process.exit(1);
      }
      if (!payloadBytes.equals(templateBytes)) {
        console.error(
          `[verify-no-forbidden] target=${target} /.env.local differs from the blank starter template ` +
          `(template ${templateBytes.length} bytes, payload ${payloadBytes.length} bytes) — ` +
          `the delivered environment file must be the unmodified blank template`
        );
        process.exit(1);
      }
      // Byte-identical — allow this file through.
      continue;
    }
    offending.push(rel);
  }
  if (offending.length > 0) {
    console.error(
      `[verify-no-forbidden] target=${target} found ${offending.length} forbidden file(s):\n` +
        offending.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }

  // Marker grep — scan all text-ish files for forbidden literals. Target is
  // the actual shipped output, so client-only patterns apply to every file.
  const targetPatterns = [...MARKER_GREP, ...MARKER_GREP_CLIENT_ONLY, ...SOURCE_COMMENT_JARGON];
  const offenders = [];
  for (const rel of walkDir(root)) {
    // Skip binary deliverables — a utf-8 text scan over compressed/binary bytes produces false
    // positives (e.g. zip-packed XLSX bytes randomly matching a single-char marker like `§`).
    // The workbook is content-checked properly by lintXlsxDir below; office/binary formats here.
    if (/\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|pdf|zip|tar|gz|7z|xlsx|xlsm|xls)$/i.test(rel)) continue;
    let buf;
    try {
      buf = fs.readFileSync(path.join(root, rel), 'utf-8');
    } catch {
      continue;
    }
    for (const re of targetPatterns) {
      if (re.test(buf)) {
        offenders.push(`${rel} :: ${re}`);
        break;
      }
    }
  }
  if (offenders.length > 0) {
    console.error(
      `[verify-no-forbidden] target=${target} found ${offenders.length} marker-hit file(s):\n` +
        offenders.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }

  // Per-client .gitignore content check: shipped .gitignore must not leak
  // JBS-internal terminology. Patterns ride at root .gitignore instead.
  const gitignorePath = path.join(root, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreText = fs.readFileSync(gitignorePath, 'utf-8');
    const leaks = GITIGNORE_LEAK_MARKERS.filter((re) => re.test(gitignoreText));
    if (leaks.length > 0) {
      console.error(
        `[verify-no-forbidden] target=${target} .gitignore leaks JBS terminology: ${leaks.map((re) => re.toString()).join(', ')}`
      );
      process.exit(1);
    }
  }

  await lintXlsxDir(path.join(root, 'testcases'), `target=${target}`);
  console.log(`[verify-no-forbidden] OK target=${target} files=${files.length}`);
}

function hasStatusDoneAnyForm(content) {
  const header = content.slice(0, 2000);
  const re = /(?:^|\n)\s*(?:\*\*)?Status(?:\*\*)?\s*:\s*([^\n]+)/i;
  const m = header.match(re);
  if (!m) return false;
  const val = m[1].replace(/^\*+|\*+$/g, '').replace(/^`|`$/g, '').split('|')[0].trim();
  return val.toUpperCase() === 'DONE';
}

function checkStagedDiff() {
  let listing;
  try {
    listing = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    });
  } catch {
    process.exit(0);
  }
  const staged = listing.split(/\r?\n/).filter(Boolean);
  const offenders = [];
  // LR-054 / ALL-077 banned-phrase exemption list — files that legitimately
  // discuss the pattern when defining or quarantining it.
  const BANNED_EXEMPT_PATHS = new Set([
    '.claude/rules/browser-tool.md',
    'clients/encore/specs_planning/_internal/agent-mistakes.md',
  ]);
  const bannedOffenders = [];
  for (const rel of staged) {
    if (rel.startsWith('plans/done/')) continue; // historical artifacts
    // NB3 fix: closure-gate-aware pending skip — if staged plan has Status: DONE, run markers regardless
    if (rel.startsWith('plans/pending/')) {
      let planBuf;
      try {
        planBuf = execSync(`git show :${rel}`, { cwd: REPO_ROOT, encoding: 'utf-8' });
      } catch { continue; }
      if (!hasStatusDoneAnyForm(planBuf)) continue;
    }
    if (rel === 'scripts/verify-no-forbidden.mjs') continue; // self-reference: this script's own MARKER_GREP literals
    if (rel === 'scripts/lib/forbidden-patterns.mjs') continue; // self-reference: the shared pattern module's own MARKER_GREP / jargon literals
    if (rel === '.claude/hooks/lib/check-todo-injection.mjs') continue; // self-reference: hook's own BANNED_PHRASES + self-test literals
    if (rel === '.claude/hooks/lib/check-plan-closure.mjs') continue; // self-reference: hook's own regex literals
    // Binary file extensions — text-pattern MARKER_GREP/BANNED_PHRASES regex on
    // compressed/binary bytes produces false positives (e.g., zip-compressed
    // XLSX bytes randomly matching 3-letter tokens like /\bJBS\b/). Binary
    // deliverables are content-checked separately (e.g., xlsx:dump for XLSX).
    if (/\.(xlsx|xlsm|xls|png|jpg|jpeg|gif|pdf|ico|zip|tar|gz|woff2?|ttf|eot|otf|mp4|webm|wav|mp3)$/i.test(rel)) continue;
    let buf;
    try {
      buf = execSync(`git show :${rel}`, { cwd: REPO_ROOT, encoding: 'utf-8' });
    } catch {
      continue;
    }
    // Repo-wide markers always apply. Client-only markers + source-comment jargon
    // apply only when the staged path would actually ship inside clients/<id>/.
    const patterns = isClientShipping(rel)
      ? [...MARKER_GREP, ...MARKER_GREP_CLIENT_ONLY, ...SOURCE_COMMENT_JARGON]
      : MARKER_GREP;
    for (const re of patterns) {
      if (re.test(buf)) {
        offenders.push(`${rel} :: ${re}`);
        break;
      }
    }
    // LR-054 / ALL-077 banned-phrase scan — path-scoped to artifact files
    // (walk-evidence / neutral-eye-audits / field-inventories) only.
    if (isBannedPhraseTarget(rel) && !BANNED_EXEMPT_PATHS.has(rel.replace(/\\/g, '/'))) {
      for (const re of BANNED_PHRASES) {
        const m = buf.match(re);
        if (m) {
          bannedOffenders.push(`${rel} :: ${JSON.stringify(m[0])}`);
          break;
        }
      }
    }
  }
  if (offenders.length > 0) {
    console.error(
      `[verify-no-forbidden] staged-diff: ${offenders.length} marker-hit file(s):\n` +
        offenders.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }
  if (bannedOffenders.length > 0) {
    console.error(
      `[verify-no-forbidden] staged-diff: ${bannedOffenders.length} manufactured-blocker phrase(s) ` +
        `denied by LR-039 + LR-054 + ALL-077 (default auth-refresh path = LoginPage.loginWithMicrosoft; ` +
        `see .claude/rules/browser-tool.md LR-054 + docs/read_only_docs/CLI_BROWSER_GUIDE.md Table 2 + ` +
        `clients/encore/specs_planning/_internal/agent-mistakes.md ALL-077):\n` +
        bannedOffenders.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }
  console.log('[verify-no-forbidden] OK staged-diff (no marker hits)');
}

function checkStagedFile(file) {
  // Pre-push per-file mode: refuse if path itself matches DENY_GLOBS (relative to repo root).
  const rel = file.replace(/\\/g, '/');
  if (matchesDeny(`/${rel}`) && rel.startsWith('clients/')) {
    console.error(`[verify-no-forbidden] staged forbidden path: ${rel}`);
    process.exit(1);
  }
  process.exit(0);
}

function checkHeadFile(file) {
  // Pre-push per-file content-scan mode: checks file content from the HEAD revision
  // (what actually ships). Path deny-globs scope which content patterns apply (via
  // isClientShipping), matching --staged-diff behavior. Binary files are skipped.
  const rel = file.replace(/\\/g, '/');

  // Skip historical artifacts (plans/done/ legitimately references internal vocab)
  if (rel.startsWith('plans/done/')) process.exit(0);

  // Skip self-reference files (contain pattern literals by definition)
  const SELF_REF = new Set([
    'scripts/verify-no-forbidden.mjs',
    'scripts/lib/forbidden-patterns.mjs',
    '.claude/hooks/lib/check-todo-injection.mjs',
    '.claude/hooks/lib/check-plan-closure.mjs',
  ]);
  if (SELF_REF.has(rel)) process.exit(0);

  // Narrow secrets-deny gate — refuse only never-tracked secret paths under clients/.
  // The broad DENY_GLOBS govern the client DELIVERABLE channel (ship/target), not the
  // framework repo push (specs_planning/, per-client CLAUDE.md, etc. are tracked by design).
  // Only .auth/ (live session tokens) and .env.server (server-side secrets) are truly
  // never-legitimate in a push range — .env.local is tracked with creds by design (LR-ENC-003).
  if (rel.startsWith('clients/')) {
    const SECRET_PATH_DENY = [/\/\.auth\//, /\/\.env\.server$/];
    if (SECRET_PATH_DENY.some((re) => re.test('/' + rel))) {
      console.error(`[verify-no-forbidden] head-file forbidden secret path: ${rel}`);
      process.exit(1);
    }
  }

  // Binary file extensions — text-pattern scan on compressed bytes produces false positives
  if (/\.(xlsx|xlsm|xls|png|jpg|jpeg|gif|pdf|ico|zip|tar|gz|woff2?|ttf|eot|otf|mp4|webm|wav|mp3)$/i.test(rel)) {
    process.exit(0);
  }

  // Pending plans with non-DONE status: skip content scan (they legitimately reference
  // internal vocab while being authored; only closure-ready plans get marker-checked)
  if (rel.startsWith('plans/pending/')) {
    let planBuf;
    try {
      planBuf = execSync(`git show HEAD:${rel}`, { cwd: REPO_ROOT, encoding: 'utf-8' });
    } catch { process.exit(0); }
    if (!hasStatusDoneAnyForm(planBuf)) process.exit(0);
  }

  // Read content from HEAD revision (what is actually being pushed)
  let buf;
  try {
    buf = execSync(`git show HEAD:${rel}`, { cwd: REPO_ROOT, encoding: 'utf-8' });
  } catch (err) {
    // File not found in HEAD — loud failure (missing expected input must never silent-skip)
    console.error(`[verify-no-forbidden] head-file git-show failed for path: ${rel}`);
    process.exit(1);
  }

  // Apply content rules — same scoping as --staged-diff: client-shipping paths get the
  // full pattern set; all other paths get repo-wide MARKER_GREP only. Path deny-globs
  // are structurally embedded in isClientShipping() (deny-listed paths = not shipping).
  const patterns = isClientShipping(rel)
    ? [...MARKER_GREP, ...MARKER_GREP_CLIENT_ONLY, ...SOURCE_COMMENT_JARGON]
    : MARKER_GREP;

  for (const re of patterns) {
    if (re.test(buf)) {
      console.error(`[verify-no-forbidden] head-file content denied: ${rel} :: ${re}`);
      process.exit(1);
    }
  }

  // LR-054 / ALL-077 banned-phrase scan for target paths
  if (isBannedPhraseTarget(rel)) {
    for (const re of BANNED_PHRASES) {
      const m = buf.match(re);
      if (m) {
        console.error(`[verify-no-forbidden] head-file banned phrase: ${rel} :: ${JSON.stringify(m[0])}`);
        process.exit(1);
      }
    }
  }

  process.exit(0);
}

const client = arg('client');
const target = arg('target');
const staged = arg('staged');
const headFile = arg('head-file');
const emitExclusionsClient = arg('emit-exclusions');

if (client) await checkClient(client);
else if (target) await checkTarget(target);
else if (hasFlag('staged-diff')) checkStagedDiff();
else if (headFile) checkHeadFile(headFile);
else if (staged) checkStagedFile(staged);
else if (emitExclusionsClient !== null) await emitExclusions(emitExclusionsClient);
else {
  console.error(
    'Usage: verify-no-forbidden.mjs --client=<id> | --target=<path> | --staged-diff | --head-file=<file> | --staged=<file> | --emit-exclusions=<id>'
  );
  process.exit(2);
}
